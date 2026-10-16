import Phaser from 'phaser';
import { GameAudio } from './audio';
import { CombatCinematics, fireVisual } from './cinematic';
import type { Difficulty, GameAPI, GameBridge, GameState, Move } from './types';
import { SKILLS, PRESSURE_MS, pressureBase, pressureLimit, REACTION_MS, PARRY_MS, xpRequired, maxHealth, maxChakra, unlockedSkills, emptyCooldowns, type Defense } from './combat';
import { stageMultiplier } from './stageTiming';

type ActorAsset = {
  key: string; image: string; atlas: string; scale?: number; origin?: {x: number; y: number};
  animations: Record<string, string[]>; fps?: Record<string, number>;
  nativeFacing?: 'left' | 'right';
  nativeFacingByAnimation?: Record<string, 'left' | 'right'>;
  attackImpactFrame?: number;
};
type BiomeAsset = {
  id: string; name: string; subtitle?: string; background: string;
  battleBackground?: string; ground?: string; accent?: string | number; enemyKey?: string;
};
type AssetManifest = { hero: ActorAsset; enemies: ActorAsset[]; biomes: BiomeAsset[]; mentor?: ActorAsset };
const WIDTH = 1000;
const HEIGHT = 600;
const BATTLE = { heroX: 250, enemyX: 580, y: 390 } as const;
const MENTOR_HOME = { x: 190, y: 400 } as const;
const SAVE_KEY = 'tag-quest-expedition-v1';
const url = (path: string) => `${(import.meta as unknown as {env: {BASE_URL: string}}).env.BASE_URL}${path.replace(/^\//, '')}`;
const activeTextInput = () => {
  const el = document.activeElement as HTMLElement | null;
  return !!el && (['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName) || el.isContentEditable || !!el.closest('.cm-editor'));
};

export function createGame(parent: HTMLElement, bridge: GameBridge): GameAPI {
  let manifest: AssetManifest;
  let scene: Expedition | undefined;
  let phaser: Phaser.Game | undefined;
  let disposed = false;
  let editorFocused = false;
  const soundscape = new GameAudio(url);
  let learningPaused = false;
  let pressureMs = PRESSURE_MS;
  let answerElapsedMs = 0;
  let reactionMs = 0;
  let defenseChoice: Defense | 'failed-parry' | undefined;
  let enemyCritical = false;
  let guardReady = false;
  let hudClock = 0;
  let pendingStrike = false;
  let frostDelay = 0;
  const keys = new Set<string>();
  const progress = [0, 0, 0, 0];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reducedEffectsOverride: boolean | undefined;
  const effectsReduced = () => reducedEffectsOverride ?? reducedMotion.matches;
  type CampaignStats = Pick<GameState, 'heroHp' | 'chakra' | 'stamina' | 'companionHealsRemaining' | 'level' | 'xp' | 'xpToNext' | 'maxHp' | 'maxChakra' | 'unlockedSkills'>;
  let campaignSnapshot: CampaignStats | undefined;
  const state: GameState = {
    phase: 'explore', biome: 0, heroHp: 100, enemyHp: 100,
    completed: 0, bosses: 0, total: 24,
    level: 1, xp: 0, xpToNext: xpRequired(1), maxHp: 100, chakra: 80, maxChakra: 80, stamina: 100, enemyMaxHp: 100,
    reactionRemainingMs: 0, defenseWindow: false, pressureRemainingMs: PRESSURE_MS, skillCooldowns: emptyCooldowns(),
    unlockedSkills: unlockedSkills(1), lastCritical: false, encounterTurn: 0, learningPaused: false, answerElapsedMs: 0,
    companionHealsRemaining: 1, difficulty: 'normal',
    pressureLimitMs: PRESSURE_MS, activeStageIndex: 0, adminMode: false, stageTesting: false,
    pressureBaseMs: PRESSURE_MS, pressureMultiplier: 1,
    message: 'Walk to the guardian. Press E to begin your first HTML challenge.', nearby: false,
  };

  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    if (saved && Array.isArray(saved.progress) && saved.progress.length === 4) {
      saved.progress.forEach((value: number, index: number) => {
        progress[index] = Number.isInteger(value) ? Phaser.Math.Clamp(value, 0, 6) : 0;
      });
      // Only a contiguous campaign is valid; later worlds cannot bypass a guardian.
      let locked = false;
      progress.forEach((value, index) => {
        if (locked) progress[index] = 0;
        if (value < 6) locked = true;
      });
      state.completed = progress.reduce((a, b) => a + b, 0);
      state.bosses = progress.filter(value => value === 6).length;
      state.biome = Math.min(state.bosses, 3);
      state.level = Phaser.Math.Clamp(Math.floor(Number(saved.level) || 1), 1, 30);
      state.xpToNext = xpRequired(state.level);
      state.xp = Phaser.Math.Clamp(Number(saved.xp) || 0, 0, state.xpToNext - 1);
      state.maxHp = maxHealth(state.level); state.maxChakra = maxChakra(state.level);
      state.heroHp = Phaser.Math.Clamp(Number(saved.heroHp) || state.maxHp, 1, state.maxHp);
      state.chakra = Phaser.Math.Clamp(Number(saved.chakra) || state.maxChakra, 0, state.maxChakra);
      state.unlockedSkills = unlockedSkills(state.level);
      state.companionHealsRemaining = saved.companionEncounter === state.completed
        && saved.companionHealsRemaining === 0 ? 0 : 1;
      state.difficulty = saved.difficulty === 'easy' ? 'easy' : 'normal';
      state.activeStageIndex = Math.min(state.completed, 23);
      state.pressureBaseMs = pressureBase(state.difficulty);
      state.pressureMultiplier = stageMultiplier(state.activeStageIndex);
      state.pressureLimitMs = pressureLimit(state.difficulty, state.activeStageIndex);
      pressureMs = state.pressureLimitMs;
      if (state.completed === 24) state.phase = 'victory';
    }
  } catch { /* Browser storage can be disabled; the expedition still runs. */ }

  function emit(message?: string) {
    if (message) state.message = message;
    soundscape.setReadingPaused(learningPaused);
    state.pressureRemainingMs = Math.max(0, pressureMs);
    state.pressureBaseMs = pressureBase(state.difficulty);
    state.pressureMultiplier = stageMultiplier(state.activeStageIndex);
    state.pressureLimitMs = pressureLimit(state.difficulty, state.activeStageIndex);
    state.answerElapsedMs = answerElapsedMs;
    state.reactionRemainingMs = Math.max(0, reactionMs);
    state.learningPaused = learningPaused || document.hidden;
    bridge.onState({ ...state, stamina: Math.round(state.stamina), skillCooldowns: { ...state.skillCooldowns }, unlockedSkills: [...state.unlockedSkills] });
  }
  function save() {
    const campaign = campaignSnapshot ?? state;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify({ progress, heroHp: campaign.heroHp, level: campaign.level, xp: campaign.xp, chakra: campaign.chakra, companionEncounter: state.completed, companionHealsRemaining: campaign.companionHealsRemaining, difficulty: state.difficulty })); } catch { /* Optional save. */ }
  }
  const isBossStage = () => state.activeStageIndex % 6 === 5;
  const canSelectStage = () => !!scene?.ready && !document.hidden
    && (['explore', 'victory', 'defeat'].includes(state.phase) || state.phase === 'challenge' && learningPaused);
  function snapshotCampaign(): CampaignStats {
    return { heroHp: state.heroHp, chakra: state.chakra, stamina: state.stamina,
      companionHealsRemaining: state.companionHealsRemaining, level: state.level, xp: state.xp,
      xpToNext: state.xpToNext, maxHp: state.maxHp, maxChakra: state.maxChakra,
      unlockedSkills: [...state.unlockedSkills] };
  }
  class Expedition extends Phaser.Scene {
    hero!: Phaser.GameObjects.Sprite;
    enemy!: Phaser.GameObjects.Sprite;
    mentor?: Phaser.GameObjects.Sprite;
    mentorShadow?: Phaser.GameObjects.Ellipse;
    mentorLabel?: Phaser.GameObjects.Text;
    mentorActionRemaining = 0;
    mentorAction = 'idle';
    mentorMoving = false;
    mentorBubble?: Phaser.GameObjects.Text;
    mentorHintRemainingMs = 0;
    facingTargets = new WeakMap<Phaser.GameObjects.Sprite, number>();
    heroShadow!: Phaser.GameObjects.Ellipse;
    enemyShadow!: Phaser.GameObjects.Ellipse;
    scenery!: Phaser.GameObjects.Image;
    atmosphere!: Phaser.GameObjects.Rectangle;
    floor!: Phaser.GameObjects.Container;
    ambient!: Phaser.GameObjects.Container;
    prompt!: Phaser.GameObjects.Container;
    promptText!: Phaser.GameObjects.Text;
    title!: Phaser.GameObjects.Text;
    subtitle!: Phaser.GameObjects.Text;
    regionText!: Phaser.GameObjects.Text;
    enemyLabel!: Phaser.GameObjects.Text;
    sceneMode!: Phaser.GameObjects.Text;
    bounds!: Phaser.GameObjects.Graphics;
    hud!: Phaser.GameObjects.Graphics;
    enemyHpBar!: Phaser.GameObjects.Graphics;
    exit!: Phaser.GameObjects.Container;
    heroAsset!: ActorAsset;
    enemyAsset!: ActorAsset;
    target: Phaser.Math.Vector2 | null = null;
    ready = false;
    generation = 0;
    cinematic!: CombatCinematics;
    walkCycle = false;
    lastNearby = false;
    lastHud = '';
    ambientPoints: { image: Phaser.GameObjects.Arc; speed: number; phase: number }[] = [];

    constructor() { super('expedition'); }

    preload() {
      this.cameras.main.setBackgroundColor('#111b24');
      const label = this.add.text(WIDTH / 2, 280, 'Opening the expedition…', {
        fontFamily: 'Georgia, serif', fontSize: '24px', color: '#eee5cb',
      }).setOrigin(0.5);
      const progressBar = this.add.graphics();
      this.load.on('progress', (value: number) => {
        progressBar.clear().fillStyle(0x35444a).fillRect(340, 320, 320, 3);
        progressBar.fillStyle(0xd9b75e).fillRect(340, 320, 320 * value, 3);
      });
      this.load.once('complete', () => { label.destroy(); progressBar.destroy(); });
      this.load.on('loaderror', () => emit('An art file could not load. Restart the local server, then refresh.'));
      [manifest.hero, ...manifest.enemies, ...(manifest.mentor ? [manifest.mentor] : [])].forEach(asset => this.load.atlas(asset.key, url(asset.image), url(asset.atlas)));
      this.load.atlas('ragnarok-effects', url('assets/effects/ragnarok/effects.png'), url('assets/effects/ragnarok/effects.json'));
      this.load.json('ragnarok-manifest', url('assets/effects/ragnarok/manifest.json'));
      manifest.biomes.forEach((biome, index) => {
        this.load.image(`region-${index}`, url(biome.background));
        this.load.image(`arena-${index}`, url(biome.battleBackground || biome.background));
        if (biome.ground) this.load.image(`ground-${index}`, url(biome.ground));
      });
    }

    create() {
      scene = this;
      this.cinematic = new CombatCinematics(this, effectsReduced);
      this.events.once('shutdown', () => this.cinematic.clear());
      this.heroAsset = manifest.hero;
      [manifest.hero, ...manifest.enemies, ...(manifest.mentor ? [manifest.mentor] : [])].forEach(asset => {
        Object.entries(asset.animations).forEach(([name, frames]) => {
          const valid = frames.filter(frame => this.textures.get(asset.key).has(frame));
          if (!valid.length) return;
          this.anims.create({
            key: `${asset.key}:${name}`, frames: valid.map(frame => ({ key: asset.key, frame })),
            frameRate: asset.fps?.[name] || (name === 'idle' ? 8 : 16),
            repeat: ['idle', 'run', 'runLeft', 'breathing'].includes(name) ? -1 : 0,
          });
        });
      });
      this.scenery = this.add.image(500, 300, 'region-0').setDepth(-20);
      this.atmosphere = this.add.rectangle(500, 300, WIDTH, HEIGHT, 0x101a22, 0.13).setDepth(-19);
      this.floor = this.add.container(0, 0).setDepth(-10);
      this.bounds = this.add.graphics().setDepth(-9);
      this.ambient = this.add.container(0, 0).setDepth(600);
      this.heroShadow = this.add.ellipse(260, 466, 66, 16, 0x081519, 0.46);
      this.enemyShadow = this.add.ellipse(750, 434, 83, 20, 0x081519, 0.48);
      this.hero = this.add.sprite(260, 460, this.heroAsset.key, this.heroAsset.animations.idle[0]);
      this.hero.setOrigin(this.heroAsset.origin?.x || 0.5, this.heroAsset.origin?.y || 0.84).setScale(this.heroAsset.scale || 3);
      this.enemyAsset = manifest.enemies[0];
      this.enemy = this.add.sprite(750, 428, this.enemyAsset.key, this.enemyAsset.animations.idle[0]);
      this.enemy.setOrigin(0.5, 0.85);
      if (manifest.mentor && this.textures.exists(manifest.mentor.key)) {
        const asset = manifest.mentor;
        this.mentorShadow = this.add.ellipse(210, 400, 40, 11, 0x081519, 0.35);
        this.mentor = this.add.sprite(210, 400, asset.key, asset.animations.idle[0])
          .setOrigin(asset.origin?.x ?? 0.5, asset.origin?.y ?? 0.9).setScale(asset.scale ?? 0.4);
        this.mentor.setInteractive({ useHandCursor: true }).on('pointerdown', (_pointer: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
          event.stopPropagation();
          if (['explore', 'challenge'].includes(state.phase) && !document.hidden) bridge.onMentorInteract?.();
        });
        this.mentorLabel = this.add.text(210, 410, 'Mr Rifky', {
          fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#e3ead2',
          stroke: '#162227', strokeThickness: 4,
        }).setOrigin(0.5, 0);
        this.mentorBubble = this.add.text(30, 300, '', {
          fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#f0f0dc',
          backgroundColor: '#14232ff2', padding: { x: 12, y: 10 }, wordWrap: { width: 190 },
        }).setOrigin(0, 1).setDepth(1100).setVisible(false).setInteractive({ useHandCursor: true });
        this.mentorBubble.on('pointerdown', (_pointer: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
          event.stopPropagation();
          if (['explore', 'challenge'].includes(state.phase)) bridge.onMentorInteract?.();
        });
        this.play(this.mentor, asset, 'idle');
      }
      this.hud = this.add.graphics().setDepth(810);
      this.enemyHpBar = this.add.graphics().setDepth(810);
      this.title = this.add.text(38, 32, '', {
        fontFamily: 'Georgia, serif', fontSize: '33px', color: '#f9efda', stroke: '#152027', strokeThickness: 4,
      }).setDepth(900);
      this.subtitle = this.add.text(40, 77, '', {
        fontFamily: 'Arial, sans-serif', fontSize: '14px', color: '#e0e4d9', stroke: '#152027', strokeThickness: 3,
      }).setDepth(900);
      this.regionText = this.add.text(962, 35, '', {
        fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#e7e5cf', align: 'right',
      }).setOrigin(1, 0).setDepth(900);
      this.sceneMode = this.add.text(40, 560, '', {
        fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#eee9d4',
      }).setDepth(900);
      this.enemyLabel = this.add.text(750, 329, '', {
        fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#fff1cc', stroke: '#162227', strokeThickness: 4,
      }).setOrigin(0.5).setDepth(800);
      this.promptText = this.add.text(0, 0, 'E  Enter encounter', {
        fontFamily: 'Arial, sans-serif', fontSize: '15px', color: '#fff2ce',
        backgroundColor: '#142629', padding: { x: 16, y: 11 },
      }).setOrigin(0.5);
      this.prompt = this.add.container(700, 460, [this.promptText]).setDepth(900).setVisible(false);
      this.promptText.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.interact());
      const exitCircle = this.add.circle(0, 0, 24, 0x152e30, 0.85).setStrokeStyle(2, 0xe6cd82, 0.7);
      const exitText = this.add.text(0, 0, '→', { fontSize: '31px', color: '#e9d18c' }).setOrigin(0.5, 0.55);
      this.exit = this.add.container(750, 345, [exitCircle, exitText]).setDepth(700).setVisible(false);
      exitCircle.setInteractive({ useHandCursor: true }).on('pointerdown', () => api.travel(Math.min(state.biome + 1, 3)));
      this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (state.phase !== 'explore' || learningPaused || document.hidden || editorFocused) return;
        const point = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
        if (point.y < 225 || point.y > 465) return;
        this.target = new Phaser.Math.Vector2(point.x, point.y);
        this.clampPoint(this.target);
      });
      this.input.on('gameout', () => keys.clear());
      this.ready = true;
      this.scale.on('resize', this.resizeViewport, this);
      this.events.once('shutdown', () => this.scale.off('resize', this.resizeViewport, this));
      this.resizeViewport();
      this.enterRegion(state.biome, true);
      bridge.onReady();
      emit(state.completed === 24 ? 'All 24 HTML seals restored. Four guardians defeated. The expedition is complete.'
        : state.completed ? 'Your expedition is saved. Walk to the next guardian to continue.' : undefined);
      if (state.completed === 24) this.showVictory();
    }

    color() {
      const value = manifest.biomes[state.biome]?.accent || '#d2bf76';
      return typeof value === 'number' ? value : parseInt(value.replace('#', ''), 16);
    }

    fitScenery() {
      const image = this.scenery.texture.getSourceImage() as HTMLImageElement;
      const camera = this.cameras.main;
      const visibleWidth = camera.width / camera.zoom;
      const visibleHeight = camera.height / camera.zoom;
      const factor = Math.max(visibleWidth / image.width, visibleHeight / image.height);
      this.scenery.setScale(factor).setPosition(500, 300);
      this.atmosphere?.setDisplaySize(visibleWidth, visibleHeight);
    }

    resizeViewport() {
      const width = Math.max(1, this.scale.width), height = Math.max(1, this.scale.height);
      this.cameras.main.setViewport(0, 0, width, height)
        .setZoom(Math.min(width / WIDTH, height / HEIGHT)).centerOn(500, 300);
      if (this.scenery) this.fitScenery();
      this.cinematic?.resize();
    }

    enterRegion(index: number, initial = false) {
      if (!this.ready) return;
      this.generation++;
      this.cinematic.clear();
      this.showMentorHint('');
      this.tweens.killTweensOf([this.hero, this.enemy, this.heroShadow, this.enemyShadow]);
      const biome = manifest.biomes[index];
      this.scenery.setTexture(`region-${index}`); this.fitScenery();
      this.floor.removeAll(true);
      this.ambient.removeAll(true); this.ambientPoints = [];
      this.bounds.clear();
      const color = this.color();
      // The source platforms provide a real ground plane; the distant panorama stays behind it.
      if (biome.ground && this.textures.exists(`ground-${index}`)) {
        this.floor.add(this.add.image(500, 300, `ground-${index}`).setDisplaySize(WIDTH, HEIGHT));
      }
      this.bounds.lineStyle(2, color, 0.55).strokeEllipse(700, 358, 108, 35);
      this.bounds.lineStyle(1, color, 0.2).strokeEllipse(700, 358, 132, 45);
      for (let i = 0; i < 17; i++) {
        const particle = this.add.circle(Phaser.Math.Between(50, 950), Phaser.Math.Between(180, 520), i % 4 === 0 ? 2 : 1, color, 0.4);
        this.ambient.add(particle);
        this.ambientPoints.push({ image: particle, speed: 0.02 + (i % 3) * 0.008, phase: i * 0.83 });
      }
      this.hero.setPosition(310, 385).setAlpha(1).clearTint();
      this.face(this.hero, this.heroAsset, 700);
      this.hero.setScale(this.heroAsset.scale || 3);
      this.enemy.setPosition(700, 355).setAlpha(1).clearTint();
      this.mentor?.setPosition(210, 399); this.mentorActionRemaining = 0; this.mentorMoving = false;
      if (this.mentor && manifest.mentor) this.play(this.mentor, manifest.mentor, 'idle');
      this.heroShadow.setPosition(310, 393).setAlpha(1);
      this.enemyShadow.setPosition(700, 363).setAlpha(1);
      this.title.setText(biome.name);
      this.subtitle.setText(biome.subtitle || 'Explore the field. Break the guardian’s HTML seal.');
      this.title.setVisible(false); this.subtitle.setVisible(false);
      this.regionText.setVisible(false); this.sceneMode.setVisible(false); this.hud.setVisible(false);
      this.target = null; keys.clear(); this.walkCycle = false;
      this.play(this.hero, this.heroAsset, 'idle');
      this.prepareEnemy();
      if (state.phase !== 'victory') state.phase = 'explore';
      this.updateHud();
      if (!initial && !effectsReduced()) this.cameras.main.fadeIn(380, 14, 22, 28);
      emit();
    }

    prepareEnemy() {
      const region = manifest.biomes[state.biome];
      const boss = isBossStage();
      const selected = manifest.enemies.find(actor => actor.key === region.enemyKey) || manifest.enemies[state.biome % manifest.enemies.length];
      this.enemyAsset = selected;
      this.enemy.setTexture(selected.key, selected.animations.idle[0]).setScale((selected.scale || 2.3) * (boss ? 1.14 : 0.85));
      this.enemy.setOrigin(selected.origin?.x || 0.5, selected.origin?.y || 0.85);
      this.enemy.clearTint();
      this.face(this.enemy, selected, this.hero.x);
      if (!boss) this.enemy.setTint(Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.ValueToColor(this.color()), Phaser.Display.Color.ValueToColor(0xffffff), 100, 78,
      ).color);
      const cleared = state.completed === 24 && !state.stageTesting;
      this.enemy.setVisible(!cleared); this.enemyShadow.setVisible(!cleared);
      this.enemyLabel.setText(cleared ? 'Campaign complete' : boss ? 'BOSS · final seal' : `Guardian ${state.activeStageIndex % 6 + 1} / 5`);
      this.enemyLabel.setPosition(700, boss ? 185 : 230);
      this.exit.setVisible(false);
      this.play(this.enemy, selected, 'idle');
      state.enemyMaxHp = (boss ? 160 : 84) + state.biome * 18;
      state.enemyHp = cleared ? 0 : state.enemyMaxHp;
    }

    play(sprite: Phaser.GameObjects.Sprite, asset: ActorAsset, name: string) {
      const key = `${asset.key}:${name}`;
      if (this.anims.exists(key)) sprite.play(key, true);
      else if (this.anims.exists(`${asset.key}:idle`)) sprite.play(`${asset.key}:idle`, true);
      const target = this.facingTargets.get(sprite);
      if (target !== undefined) this.face(sprite, asset, target, name);
    }

    face(sprite: Phaser.GameObjects.Sprite, asset: ActorAsset, targetX: number, animation?: string) {
      this.facingTargets.set(sprite, targetX);
      const name = animation ?? sprite.anims.currentAnim?.key.split(':').at(-1) ?? 'idle';
      const nativeFacing = asset.nativeFacingByAnimation?.[name] ?? asset.nativeFacing ?? 'right';
      const direction = targetX < sprite.x ? 'left' : 'right';
      sprite.setFlipX(direction !== nativeFacing);
    }

    mentorReact(action: 'cheer' | 'heal') {
      if (!this.mentor || !manifest.mentor || document.hidden || learningPaused || effectsReduced()) return;
      this.mentorAction = action; this.mentorActionRemaining = action === 'heal' ? 850 : 650;
      this.mentorMoving = false;
      this.mentor.setFlipX(false);
      this.play(this.mentor, manifest.mentor, action);
    }

    showMentorHint(text: string) {
      const content = text.trim().slice(0, 320);
      this.mentorHintRemainingMs = content ? 8000 : 0;
      this.mentorBubble?.setText(content).setVisible(!!content && !learningPaused && !document.hidden);
      this.updateMentor(0);
    }

    updateMentor(delta: number) {
      if (!this.mentor || !manifest.mentor) return;
      const mentor = this.mentor, asset = manifest.mentor;
      const hintPaused = document.hidden || learningPaused;
      if (!hintPaused) this.mentorHintRemainingMs = Math.max(0, this.mentorHintRemainingMs - delta);
      this.mentorBubble?.setVisible(!hintPaused && this.mentorHintRemainingMs > 0)
        .setPosition(Phaser.Math.Clamp(mentor.x - 160, 18, 660 - (this.mentorBubble?.width ?? 0)), mentor.y - 95);
      const paused = document.hidden || learningPaused || effectsReduced();
      if (paused) { mentor.anims.pause(); return; }
      if (mentor.anims.isPaused) mentor.anims.resume();
      if (this.mentorActionRemaining > 0) {
        this.mentorActionRemaining = Math.max(0, this.mentorActionRemaining - delta);
        if (this.mentorActionRemaining === 0) { this.mentorAction = 'idle'; mentor.setFlipX(false); this.play(mentor, asset, 'idle'); }
      } else {
        const battling = ['challenge', 'defending', 'animating', 'defeat'].includes(state.phase);
        const target = battling ? { ...MENTOR_HOME }
          : { x: this.hero.x + (this.hero.x < 300 ? 95 : -100), y: this.hero.y + 14 };
        if (!battling) this.clampPoint(target);
        const dx = target.x - mentor.x, dy = target.y - mentor.y;
        const distance = Math.hypot(dx, dy);
        if (distance > 5) {
          const movement = Math.min(distance, delta * 0.18);
          mentor.x += dx / distance * movement; mentor.y += dy / distance * movement;
          const walk = dx < 0 && asset.animations.runLeft ? 'runLeft' : 'run';
          if (asset.animations.runLeft) mentor.setFlipX(false);
          else if (Math.abs(dx) > 1) this.face(mentor, asset, target.x);
          if (!this.mentorMoving || mentor.anims.currentAnim?.key !== `${asset.key}:${walk}`) {
            this.play(mentor, asset, walk); this.mentorMoving = true;
          }
        } else if (this.mentorMoving) {
          this.mentorMoving = false; mentor.setFlipX(false); this.play(mentor, asset, 'idle');
        }
      }
      mentor.setDepth(mentor.y + 9);
      this.mentorShadow?.setPosition(mentor.x, mentor.y + 5).setDepth(mentor.y - 2);
      this.mentorLabel?.setPosition(mentor.x, mentor.y + 9).setDepth(mentor.y + 10);
    }

    healWithMentor(automatic = false) {
      if (state.phase !== 'challenge' || learningPaused || document.hidden || state.heroHp <= 0) return false;
      if (state.companionHealsRemaining <= 0) {
        if (!automatic) emit('Mr Rifky has used this encounter’s healing. Mending art can still restore health.');
        return false;
      }
      const healing = Math.min(20, state.maxHp - state.heroHp);
      if (healing <= 0) {
        if (!automatic) emit('Your health is full. Mr Rifky will keep the healing for later.');
        return false;
      }
      state.companionHealsRemaining = 0; state.heroHp += healing;
      this.mentorReact('heal');
      this.floating(`+${healing} HP`, this.hero.x, BATTLE.y - 140, '#b5ecdb');
      if (!effectsReduced()) this.burst(this.hero.x, BATTLE.y - 60, 0xb5ecdb, 10);
      soundscape.play('heal'); save();
      emit(automatic ? `Mr Rifky restored ${healing} HP automatically. Keep going.` : `Mr Rifky restored ${healing} HP. Keep working at your pace.`);
      return true;
    }

    tryAutoHeal() {
      return state.difficulty === 'easy' && state.heroHp > 0 && state.heroHp <= state.maxHp * 0.4
        && state.companionHealsRemaining > 0 && this.healWithMentor(true);
    }

    clampPoint(point: {x: number; y: number}) {
      const dx = (point.x - 500) / 290;
      const dy = (point.y - 342) / 110;
      const distance = Math.hypot(dx, dy);
      if (distance > 1) { point.x = 500 + dx / distance * 290; point.y = 342 + dy / distance * 110; }
    }

    delay(milliseconds: number) {
      return new Promise<void>(resolve => this.time.delayedCall(milliseconds, () => resolve()));
    }

    tween(targets: unknown, config: Omit<Phaser.Types.Tweens.TweenBuilderConfig, 'targets'>) {
      return new Promise<void>(resolve => this.tweens.add({ ...config, targets, onComplete: () => resolve() }));
    }

    async once(sprite: Phaser.GameObjects.Sprite, asset: ActorAsset, name: string) {
      const frames = asset.animations[name];
      if (!frames?.length || !this.anims.exists(`${asset.key}:${name}`)) { await this.delay(300); return; }
      this.play(sprite, asset, name);
      await this.delay(frames.length / (asset.fps?.[name] || 16) * 1000 + 15);
    }

    updateHud() {
      const signature = `${state.phase}:${state.heroHp}:${state.enemyHp}:${progress[state.biome]}:${state.biome}`;
      if (signature === this.lastHud) return;
      this.lastHud = signature;
      this.regionText.setText(`REGION ${state.biome + 1} / 4\n${progress[state.biome]} / 6 seals restored`);
      this.regionText.setLineSpacing(8);
      const mode = state.phase === 'explore' ? 'WASD / arrows to walk    ·    E near guardian    ·    click ground to move'
        : state.phase === 'challenge' ? 'Battle ready  ·  complete the HTML seal in the lesson panel'
          : state.phase === 'defending' ? 'Incoming strike · Alt+Q dodge · Alt+F late parry'
          : state.phase === 'animating' ? 'Resolving your turn…'
            : 'All four regions restored. Your HTML expedition is complete.';
      this.sceneMode.setText(mode).setPosition(42, 556);
    }

    update(time: number, delta: number) {
      if (!this.ready) return;
      const dt = Math.min(delta, 40);
      this.updateMentor(Math.min(delta, 250));
      this.ambientPoints.forEach((point, index) => {
        point.image.y -= point.speed * dt;
        point.image.x += Math.sin(time / 1500 + point.phase) * 0.04 * dt;
        point.image.alpha = 0.22 + Math.sin(time / 1100 + index) * 0.16;
        if (point.image.y < 130) point.image.y = 530;
      });
      this.updateCombatClock(delta);
      if (state.phase === 'explore' && !learningPaused && !document.hidden && !editorFocused && !activeTextInput()) {
        let dx = Number(keys.has('d') || keys.has('arrowright')) - Number(keys.has('a') || keys.has('arrowleft'));
        let dy = Number(keys.has('s') || keys.has('arrowdown')) - Number(keys.has('w') || keys.has('arrowup'));
        if (dx || dy) this.target = null;
        if (!dx && !dy && this.target) {
          const distance = Phaser.Math.Distance.Between(this.hero.x, this.hero.y, this.target.x, this.target.y);
          if (distance > 5) { dx = this.target.x - this.hero.x; dy = this.target.y - this.hero.y; }
          else this.target = null;
        }
        const length = Math.hypot(dx, dy);
        if (length > 0) {
          const speed = keys.has('shift') ? 0.3 : 0.22;
          this.hero.x += dx / length * speed * dt;
          this.hero.y += dy / length * speed * dt * 0.68;
          this.clampPoint(this.hero);
          if (dx) this.face(this.hero, this.heroAsset, this.hero.x + dx);
          soundscape.play('footstep');
          if (!this.walkCycle) { this.play(this.hero, this.heroAsset, 'run'); this.walkCycle = true; }
        } else if (this.walkCycle) { this.play(this.hero, this.heroAsset, 'idle'); this.walkCycle = false; }
        const near = this.enemy.visible && Phaser.Math.Distance.Between(this.hero.x, this.hero.y, 700, 355) < 154;
        this.prompt.setVisible(near);
        if (near !== this.lastNearby) { this.lastNearby = near; state.nearby = near; emit(); }
        if (this.exit.visible && this.hero.x > 735 && Math.abs(this.hero.y - 345) < 45) api.travel(state.biome + 1);
      } else {
        this.prompt.setVisible(false);
        if (this.walkCycle) { this.play(this.hero, this.heroAsset, 'idle'); this.walkCycle = false; }
      }
      this.hero.setDepth(this.cinematic.active ? 830 : this.hero.y + 10); this.heroShadow.setPosition(this.hero.x, this.hero.y + 8).setDepth(this.cinematic.active ? 820 : this.hero.y - 1);
      this.enemy.setDepth(this.cinematic.active ? 830 : this.enemy.y + 10); this.enemyShadow.setPosition(this.enemy.x, this.enemy.y + 8).setDepth(this.cinematic.active ? 820 : this.enemy.y - 1);
      if (state.phase !== 'animating' && this.enemy.visible) this.face(this.enemy, this.enemyAsset, this.hero.x);
      this.enemyHpBar.clear();
      if (this.enemy.visible && this.enemy.alpha > 0) {
        this.enemyHpBar.fillStyle(0x17252c, this.enemy.alpha * 0.85).fillRect(this.enemy.x - 38, this.enemyLabel.y + 17, 76, 5);
        this.enemyHpBar.fillStyle(this.color(), this.enemy.alpha).fillRect(this.enemy.x - 38, this.enemyLabel.y + 17, 76 * state.enemyHp / state.enemyMaxHp, 5);
      }
      this.updateHud();
    }

    async interact() {
      if (!this.ready || state.phase !== 'explore' || learningPaused || document.hidden || editorFocused || activeTextInput()) return;
      if (state.completed === 24 && !state.stageTesting) {
        emit(state.biome < 3 ? 'This region is restored. Take the glowing eastern exit or choose the next region.' : 'All four guardians have fallen.');
        return;
      }
      if (Phaser.Math.Distance.Between(this.hero.x, this.hero.y, 700, 355) > 178) {
        emit('Walk closer to the guardian, then press E.'); return;
      }
      state.phase = 'challenge'; keys.clear(); this.target = null;
      const boss = isBossStage();
      this.showMentorHint('');
      emit(boss ? 'Boss encounter. Complete the capstone HTML seal to restore this region.' : 'Choose your move, then complete the HTML seal.');
      const token = ++this.generation;
      this.scenery.setTexture(`arena-${state.biome}`); this.fitScenery();
      this.title.setText(boss ? `${manifest.biomes[state.biome].name} · Guardian` : 'The HTML seal');
      this.subtitle.setText('A correct answer gives your chosen move its power.');
      this.enemyLabel.setPosition(BATTLE.enemyX, BATTLE.y - (boss ? 180 : 145));
      this.mentor?.setPosition(BATTLE.heroX - 60, MENTOR_HOME.y);
      this.face(this.hero, this.heroAsset, BATTLE.enemyX); this.face(this.enemy, this.enemyAsset, BATTLE.heroX);
      await Promise.all([
        this.tween(this.hero, { x: BATTLE.heroX, y: BATTLE.y, duration: 430, ease: 'Cubic.Out' }),
        this.tween(this.enemy, { x: BATTLE.enemyX, y: BATTLE.y, duration: 430, ease: 'Cubic.Out' }),
      ]);
      if (token !== this.generation) return;
      this.face(this.hero, this.heroAsset, this.enemy.x); this.face(this.enemy, this.enemyAsset, this.hero.x);
      this.play(this.hero, this.heroAsset, 'idle');
      pressureMs = pressureLimit(state.difficulty, state.activeStageIndex); answerElapsedMs = 0; reactionMs = 0;
      state.encounterTurn = 0; state.skillCooldowns = emptyCooldowns(); state.defenseWindow = false;
      state.stamina = 100; guardReady = false; frostDelay = 0;
      bridge.onEncounter(state.biome, boss);
      emit();
    }

    floating(text: string, x: number, y: number, color = '#ffe0a5') {
      this.cinematic.label(text, x, y, color, 29);
    }

    burst(x: number, y: number, color: number, amount = 14) {
      this.cinematic.sparks({ x, y }, color, amount);
    }

    updateCombatClock(delta: number) {
      if (document.hidden || learningPaused || !this.ready) return;
      const elapsed = Math.min(delta, 250);
      if (state.phase === 'challenge') {
        this.tryAutoHeal();
        pressureMs -= elapsed; answerElapsedMs += elapsed;
        state.stamina = Math.min(100, state.stamina + elapsed * 0.002);
        if (pressureMs <= 0) this.queueEnemyAttack(false, 'Time is up. The guardian is attacking!');
      } else if (state.phase === 'defending' && !pendingStrike) {
        reactionMs = Math.max(0, reactionMs - elapsed);
        if (reactionMs <= 0) { pendingStrike = true; void this.resolveEnemyAttack(); }
      }
      hudClock += elapsed;
      if (hudClock >= 100 && ['challenge', 'defending'].includes(state.phase)) { hudClock = 0; emit(); }
    }

    queueEnemyAttack(critical: boolean, reason: string) {
      if (state.phase !== 'challenge' || learningPaused || document.hidden) return;
      state.phase = 'defending'; state.defenseWindow = true;
      state.enemyIntent = critical ? 'Critical strike incoming' : 'Guardian strike incoming';
      enemyCritical = critical; reactionMs = REACTION_MS; defenseChoice = undefined; pendingStrike = false;
      keys.clear(); this.enemy.setTint(critical ? 0xff8d79 : 0xffd288);
      this.floating(critical ? 'CRITICAL THREAT' : 'INCOMING', this.enemy.x, 240, critical ? '#ffae95' : '#ffe0a5');
      soundscape.play('warning', critical);
      emit(`${reason} Dodge now, or parry in the final 350 ms.`);
    }

    defend(kind: Defense) {
      if (state.phase !== 'defending' || !state.defenseWindow || learningPaused || document.hidden || defenseChoice) return;
      if (kind === 'dodge') {
        if (state.stamina < 15) { emit('Dodge needs 15 stamina. Try a late parry.'); return; }
        state.stamina -= 15; defenseChoice = 'dodge'; soundscape.play('dodge');
        this.burst(this.hero.x, 350, 0xaed8e8, 8); emit('Dodge committed. You will avoid the strike.');
      } else if (reactionMs <= PARRY_MS) {
        defenseChoice = 'parry'; this.hero.setTint(0xffe1a1); emit('Perfect timing. Parry ready!');
      } else { defenseChoice = 'failed-parry'; emit('Parry was too early. Wait for the final flash next time.'); }
      state.defenseWindow = false;
    }

    async resolveEnemyAttack() {
      const token = this.generation;
      const valid = () => !disposed && token === this.generation;
      state.phase = 'animating'; state.defenseWindow = false; reactionMs = 0;
      this.cinematic.begin(enemyCritical ? 'Critical strike' : 'Guardian strike', '#ffca97');
      this.enemy.clearTint(); this.face(this.enemy, this.enemyAsset, this.hero.x);
      this.play(this.enemy, this.enemyAsset, 'run'); emit();
      if (!effectsReduced()) await this.tween(this.enemy, { x: BATTLE.heroX + 135, duration: 260, ease: 'Cubic.In' });
      else this.enemy.setX(BATTLE.heroX + 135);
      if (!valid()) return;
      this.play(this.enemy, this.enemyAsset, 'attack');
      const attackFps = this.enemyAsset.fps?.attack ?? 16;
      const attackFrames = this.enemyAsset.animations.attack?.length ?? 8;
      const impactFrame = Phaser.Math.Clamp(this.enemyAsset.attackImpactFrame ?? Math.floor(attackFrames / 2), 0, attackFrames - 1);
      const impactMs = impactFrame / attackFps * 1000;
      if (defenseChoice === 'dodge') {
        this.play(this.hero, this.heroAsset, 'run'); this.face(this.hero, this.heroAsset, BATTLE.heroX - 80);
        if (!effectsReduced()) void this.tween(this.hero, { x: BATTLE.heroX - 80, y: BATTLE.y + 15,
          duration: Math.min(180, Math.max(30, impactMs)), ease: 'Cubic.Out' });
      }
      await this.cinematic.wait(Math.max(0, impactMs));
      if (!valid()) return;
      await this.cinematic.release('attack', { x: this.enemy.x, y: 325 }, { x: this.hero.x + 20, y: 325 });
      if (!valid()) return;
      soundscape.play('slash', enemyCritical);
      let damage = Math.round((isBossStage() ? 15 : 9) + state.biome * 3);
      if (enemyCritical) damage *= 2;
      if (guardReady) damage = Math.ceil(damage / 2);
      guardReady = false;
      if (defenseChoice === 'dodge' || defenseChoice === 'parry') {
        this.floating(defenseChoice === 'parry' ? 'PARRY' : 'DODGED', this.hero.x, 270, '#b5ecdb');
        if (defenseChoice === 'parry') {
          state.chakra = Math.min(state.maxChakra, state.chakra + 12); state.stamina = Math.min(100, state.stamina + 10);
          this.cinematic.contact('parry', this.hero, { x: this.hero.x + 40, y: 325 }, 0xffe0a4); soundscape.play('parry');
        } else {
          this.cinematic.contact('dodge', this.hero, { x: this.hero.x, y: 325 }, 0xaed8e8);
        }
      } else {
        state.heroHp = Math.max(0, state.heroHp - damage);
        this.floating(`${enemyCritical ? 'CRIT ' : ''}-${damage}`, this.hero.x, 260, '#ffa58e');
        this.play(this.hero, this.heroAsset, 'hit');
        this.cinematic.contact('incoming', this.hero, { x: this.hero.x + 15, y: 325 }, 0xffb583, enemyCritical);
        soundscape.play('hit', enemyCritical);
      }
      this.hero.clearTint(); emit();
      await Promise.all([this.cinematic.recover(), this.delay(Math.max(120, attackFrames / attackFps * 1000 - impactMs))]);
      if (!valid()) return;
      this.face(this.enemy, this.enemyAsset, this.hero.x); this.play(this.enemy, this.enemyAsset, 'idle');
      this.face(this.hero, this.heroAsset, BATTLE.heroX);
      if (!effectsReduced()) await Promise.all([
        this.tween(this.enemy, { x: BATTLE.enemyX, duration: 300, ease: 'Sine.Out' }),
        this.tween(this.hero, { x: BATTLE.heroX, y: BATTLE.y, duration: 280, ease: 'Sine.Out' }),
      ]);
      else { this.enemy.setX(BATTLE.enemyX); this.hero.setPosition(BATTLE.heroX, BATTLE.y); }
      if (!valid()) return;
      this.face(this.enemy, this.enemyAsset, this.hero.x); this.face(this.hero, this.heroAsset, this.enemy.x);
      this.play(this.enemy, this.enemyAsset, 'idle'); this.play(this.hero, this.heroAsset, 'idle');
      state.enemyIntent = undefined; pendingStrike = false; pressureMs = pressureLimit(state.difficulty, state.activeStageIndex) + frostDelay; frostDelay = 0; save();
      if (state.heroHp <= 0) {
        state.phase = 'defeat'; soundscape.play('defeat'); this.play(this.hero, this.heroAsset, 'death');
        emit('You were defeated. Retry this encounter with full resources; completed seals and XP are safe.'); return;
      }
      state.phase = 'challenge';
      if (this.tryAutoHeal()) return;
      emit(defenseChoice === 'parry' ? 'Parry restored 12 chakra. Finish the HTML and choose your art.'
        : defenseChoice === 'dodge' ? 'You dodged the strike. Your HTML draft is safe. Keep going.'
          : 'The guardian hit you. Your HTML draft is safe. Finish your code or open the lesson to pause.');
    }

    gainXp(amount: number) {
      state.xp += amount; let leveled = false;
      while (state.xp >= state.xpToNext && state.level < 30) {
        state.xp -= state.xpToNext; state.level++; state.xpToNext = xpRequired(state.level); leveled = true;
      }
      state.maxHp = maxHealth(state.level); state.maxChakra = maxChakra(state.level);
      state.unlockedSkills = unlockedSkills(state.level);
      if (leveled) {
        state.heroHp = state.maxHp; state.chakra = state.maxChakra;
        this.floating(`LEVEL ${state.level}`, BATTLE.heroX, BATTLE.y - 170, '#ffe3a7'); this.burst(BATTLE.heroX, BATTLE.y - 60, 0xe9c17f, 25); soundscape.play('level');
      }
      return leveled;
    }

    async execute(move: Move, context?: { elapsedMs: number; assisted?: boolean }) {
      if (state.phase !== 'challenge' || learningPaused || document.hidden) return;
      const id = move === 'magic' ? 'fireball' : move;
      const skill = SKILLS.find(candidate => candidate.id === id);
      if (!skill || !state.unlockedSkills.includes(skill.id)) { emit('That art unlocks after leveling up.'); return; }
      if (state.chakra < skill.cost) { emit('Not enough chakra. Use Blade strike or Focus guard.'); return; }
      if (state.skillCooldowns[skill.id] > 0) { emit(`This art is cooling down for ${state.skillCooldowns[skill.id]} more successful turn(s).`); return; }
      state.phase = 'animating'; keys.clear(); this.target = null; state.chakra -= skill.cost;
      const elapsed = Math.max(answerElapsedMs, context?.elapsedMs || 0);
      const chance = elapsed <= 8000 ? 0.5 : elapsed <= 18000 ? 0.25 : 0.1;
      const critical = !context?.assisted && skill.power > 0 && Math.random() < Math.min(0.85, chance + (id === 'lightning' ? 0.15 : 0));
      state.lastCritical = critical;
      const token = this.generation, boss = isBossStage();
      const valid = () => !disposed && token === this.generation;
      const { heroX, enemyX } = BATTLE;
      const fire = fireVisual(state.level);
      const name = id === 'fireball' ? fire.name : id === 'lightning' ? 'Thunder' : skill.name;
      const spellColor = parseInt(skill.color.replace('#', ''), 16);
      const target = { x: enemyX - 12, y: 325 };
      this.cinematic.begin(`${name}${critical ? ' · CRITICAL' : ''}`, skill.color, id !== 'attack');
      emit(critical ? `${name}: a critical art is ready.` : `${name} is ready.`); this.face(this.hero, this.heroAsset, this.enemy.x);
      if (id === 'attack') {
        this.play(this.hero, this.heroAsset, 'run');
        if (!effectsReduced()) await this.tween(this.hero, { x: enemyX - 110, duration: 260, ease: 'Sine.In' });
        if (!valid()) return;
        this.play(this.hero, this.heroAsset, 'attack');
        const frames = this.heroAsset.animations.attack?.length ?? 8;
        const impactFrame = Phaser.Math.Clamp(this.heroAsset.attackImpactFrame ?? Math.floor(frames / 2), 0, frames - 1);
        await this.cinematic.wait(impactFrame / (this.heroAsset.fps?.attack ?? 16) * 1000);
        if (!valid()) return;
        await this.cinematic.release(id, { x: this.hero.x + 50, y: 325 }, target);
        soundscape.play('slash', critical);
        state.chakra = Math.min(state.maxChakra, state.chakra + 8);
      } else {
        this.play(this.hero, this.heroAsset, 'cast');
        await this.cinematic.anticipate(this.hero, { x: heroX + 50, y: 325 }, spellColor, id, fire.tier);
        if (!valid()) return;
        if (id === 'heal' || id === 'guard') {
          const recovery = Math.min(state.maxHp - state.heroHp, 38 + state.level * 3);
          if (id === 'heal') { state.heroHp += recovery; this.floating(`+${recovery} HP`, heroX, 250, skill.color); }
          else {
            state.chakra = Math.min(state.maxChakra, state.chakra + 30); state.stamina = Math.min(100, state.stamina + 25); guardReady = true;
            this.floating('+30 CHAKRA / GUARD', heroX, 250, skill.color);
          }
          this.cinematic.contact(id, this.hero, { x: heroX, y: 325 }, spellColor);
          soundscape.play(id === 'heal' ? 'heal' : 'guard');
        } else {
          await this.cinematic.release(id, { x: heroX + 50, y: 325 }, target, fire.tier);
          if (!valid()) return;
          this.cinematic.finishCast(this.hero);
          soundscape.play(id === 'lightning' ? 'storm' : id === 'ice' ? 'frost' : 'fire', critical);
          if (id === 'ice') frostDelay = 8000;
        }
      }
      if (!valid()) return;
      const damage = skill.power ? Math.round((skill.power + (state.level - 1) * 3) * (critical ? 1.75 : 1)) : 0;
      state.enemyHp = Math.max(0, state.enemyHp - damage);
      if (damage > 0) {
        soundscape.play('enemy-hit', critical);
        this.floating(`${critical ? 'CRITICAL ' : ''}-${damage}`, enemyX, 220, critical ? '#ffdc8e' : '#f6e6a5');
        this.play(this.enemy, this.enemyAsset, 'hit');
        this.cinematic.contact(id, this.enemy, target, spellColor, critical, fire.tier);
      }
      Object.keys(state.skillCooldowns).forEach(key => {
        const skillKey = key as keyof typeof state.skillCooldowns;
        state.skillCooldowns[skillKey] = Math.max(0, state.skillCooldowns[skillKey] - 1);
      });
      state.skillCooldowns[skill.id] = skill.cooldown; state.stamina = Math.min(100, state.stamina + 8);
      this.showMentorHint(''); this.mentorReact('cheer'); state.encounterTurn++; emit();
      await this.cinematic.recover();
      if (!valid()) return;
      this.enemy.clearTint(); this.face(this.hero, this.heroAsset, id === 'attack' ? heroX : enemyX); this.play(this.hero, this.heroAsset, id === 'attack' ? 'run' : 'idle');
      if (!effectsReduced()) await this.tween(this.hero, { x: heroX, duration: 240, ease: 'Sine.Out' });
      else this.hero.setX(heroX);
      if (!valid()) return;
      this.face(this.hero, this.heroAsset, this.enemy.x); this.play(this.hero, this.heroAsset, 'idle');
      if (state.enemyHp > 0) {
        this.play(this.enemy, this.enemyAsset, 'idle'); state.phase = 'challenge'; answerElapsedMs = 0;
        this.queueEnemyAttack(false, `${name} resolved. The guardian counters.`); save(); return;
      }
      await this.once(this.enemy, this.enemyAsset, 'death');
      if (!valid()) return;
      await this.tween([this.enemy, this.enemyShadow], { alpha: 0, duration: 240 });
      if (!valid()) return;
      if (state.stageTesting) {
        state.phase = 'victory'; soundscape.play('victory');
        this.enemyLabel.setText('Stage clear'); this.showMentorHint('');
        emit(`Stage ${state.activeStageIndex + 1} cleared in ${state.adminMode ? 'admin test' : 'replay'} mode. Campaign progress and XP are unchanged. Choose another stage from the menu.`);
        return;
      }
      progress[state.biome]++; state.completed = progress.reduce((a, b) => a + b, 0); state.bosses = progress.filter(value => value === 6).length;
      state.companionHealsRemaining = 1;
      const reward = boss ? 100 : 35, leveled = this.gainXp(reward);
      if (!leveled || state.completed === 24) soundscape.play('victory');
      this.floating(`+${reward} XP`, heroX, 275, '#e9d69b'); state.chakra = Math.min(state.maxChakra, state.chakra + 18);
      if (boss) { state.heroHp = state.maxHp; state.chakra = state.maxChakra;  }
      save();
      if (state.completed === 24) {
        state.phase = 'victory'; this.showVictory(); emit('All 24 HTML seals restored. Four guardians defeated. The expedition is complete.'); return;
      }
      state.activeStageIndex = Math.min(state.completed, 23);
      state.biome = Math.floor(state.activeStageIndex / 6);
      state.phase = 'explore'; this.enterRegion(state.biome);
      emit(boss ? 'Boss defeated. Health and chakra replenished. The next region is ready.'
        : `Seal ${state.completed} restored. +${reward} XP.${leveled ? ` Level ${state.level}! Full health and chakra restored.` : ' The next guardian awaits.'}`);
    }

    showVictory() {
      this.title.setText('The realm is restored.');
      this.subtitle.setText('24 HTML seals · 4 guardians · one expedition completed');
      this.enemy.setVisible(false); this.enemyShadow.setVisible(false);
      this.enemyLabel.setText(''); this.prompt.setVisible(false);
      this.hero.setPosition(500, 390).setFlipX(false);
      this.play(this.hero, this.heroAsset, 'idle');
      this.burst(500, 350, 0xe8cc7b, 36);
      this.updateHud();
    }
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (!scene?.ready) return;
    if (event.altKey && !event.ctrlKey && !event.metaKey && ['q', 'f'].includes(event.key.toLowerCase())) {
      event.preventDefault(); if (!event.repeat) scene.defend(event.key.toLowerCase() === 'q' ? 'dodge' : 'parry'); return;
    }
    if (editorFocused || activeTextInput() || event.ctrlKey || event.metaKey || event.altKey) return;
    const key = event.key.toLowerCase();
    if (state.phase === 'explore' && ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) event.preventDefault();
    keys.add(key);
    if (key === 'e' && !event.repeat) void scene.interact();
    if (key === 'q' && !event.repeat) scene.defend('dodge');
    if (key === 'f' && !event.repeat) scene.defend('parry');
  };
  const onKeyUp = (event: KeyboardEvent) => keys.delete(event.key.toLowerCase());
  const onBlur = () => keys.clear();
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', onBlur);
  const onVisibility = () => { if (document.hidden) keys.clear(); scene?.updateMentor(0); };
  document.addEventListener('visibilitychange', onVisibility);
  const onReducedMotion = () => { if (effectsReduced()) scene?.cinematic.reduce(); scene?.updateMentor(0); };
  reducedMotion.addEventListener('change', onReducedMotion);

  const api: GameAPI = {
    execute: async (move, context) => { if (scene?.ready) await scene.execute(move, context); },
    reportMistake() { scene?.queueEnemyAttack(true, 'Incorrect HTML exposed your guard. Critical strike incoming!'); },
    defend(kind) { scene?.defend(kind); },
    setLearningPaused(paused) { if (learningPaused === paused) return; learningPaused = paused; soundscape.setReadingPaused(paused); keys.clear(); scene?.updateMentor(0); emit(); },
    setDifficulty(value: Difficulty) {
      if (!['easy', 'normal'].includes(value) || !scene?.ready || document.hidden) return false;
      if (state.phase !== 'explore' && !(learningPaused && ['challenge', 'victory', 'defeat'].includes(state.phase))) {
        emit('Change difficulty in the field or while reading a lesson.'); return false;
      }
      const oldLimit = pressureLimit(state.difficulty, state.activeStageIndex);
      state.difficulty = value;
      pressureMs = Math.max(0, pressureMs + pressureLimit(value, state.activeStageIndex) - oldLimit);
      save();
      emit(value === 'easy' ? 'Easy mode: a 90-second base, adjusted for task complexity, with one automatic 20 HP gift when health falls to 40%.'
        : 'Normal mode: a 30-second base, adjusted for task complexity. Ask Mr Rifky for healing when you need it.');
      return true;
    },
    showMentorHint(text) { scene?.showMentorHint(text); },
    selectStage(index) {
      if (!canSelectStage() || !Number.isInteger(index) || index < 0 || index >= 24) return false;
      if (!state.adminMode && index > state.completed) { emit('Clear the next campaign stage to unlock this one.'); return false; }
      const testing = state.adminMode || index !== state.completed || state.completed === 24;
      if (testing && !campaignSnapshot) campaignSnapshot = snapshotCampaign();
      if (!testing && campaignSnapshot) { Object.assign(state, campaignSnapshot); campaignSnapshot = undefined; }
      if (testing) {
        const level = state.adminMode ? Math.max(campaignSnapshot?.level ?? state.level, Math.floor(index / 6) + 1)
          : campaignSnapshot?.level ?? state.level;
        state.level = level; state.maxHp = maxHealth(level); state.maxChakra = maxChakra(level);
        state.xp = campaignSnapshot?.xp ?? state.xp; state.xpToNext = xpRequired(level);
        state.heroHp = state.maxHp; state.chakra = state.maxChakra; state.stamina = 100;
        state.unlockedSkills = unlockedSkills(level); state.companionHealsRemaining = 1;
      }
      state.activeStageIndex = index; state.biome = Math.floor(index / 6); state.stageTesting = testing;
      state.phase = 'explore'; state.enemyIntent = undefined; state.defenseWindow = false;
      state.encounterTurn = 0; state.skillCooldowns = emptyCooldowns();
      pressureMs = pressureLimit(state.difficulty, state.activeStageIndex); answerElapsedMs = 0; reactionMs = 0;
      guardReady = false; pendingStrike = false; frostDelay = 0; editorFocused = false;
      scene!.showMentorHint(''); scene!.enterRegion(state.biome);
      emit(testing ? `Stage ${index + 1}: ${state.adminMode ? 'admin test' : 'replay'}. This fight will not change campaign progress or XP.`
        : `Campaign stage ${index + 1}. Approach the guardian to begin.`);
      return true;
    },
    setAdminMode(enabled) {
      if (!canSelectStage()) return false;
      const index = !enabled && state.activeStageIndex > state.completed ? Math.min(state.completed, 23) : state.activeStageIndex;
      state.adminMode = !!enabled;
      return api.selectStage(index);
    },
    companionHeal() { return !!scene?.ready && scene.healWithMentor(); },
    retry() {
      if (!scene?.ready || state.phase !== 'defeat') return;
      state.heroHp = state.maxHp; state.chakra = state.maxChakra; state.stamina = 100;
      state.companionHealsRemaining = 1;
      state.enemyIntent = undefined; state.defenseWindow = false; reactionMs = 0; pressureMs = pressureLimit(state.difficulty, state.activeStageIndex);
      editorFocused = false; learningPaused = false; pendingStrike = false; frostDelay = 0;
      scene.enterRegion(state.biome); scene.hero.setPosition(610, 365);
      save(); emit('Checkpoint restored. Walk to the guardian or press E to retry.');
    },
    setEditorFocused(focused) { editorFocused = focused; if (focused) { keys.clear(); if (scene) scene.target = null; } },
    closeChallenge() {
      if (state.phase !== 'challenge' || !scene) return;
      editorFocused = false; learningPaused = false; state.phase = 'explore'; scene.enterRegion(state.biome);
      emit('You stepped away. Walk back to the guardian whenever you are ready.');
    },
    interact() { void scene?.interact(); },
    travel(biome) {
      if (!Number.isInteger(biome) || biome < 0 || biome > 3) return;
      const next = Math.min(state.completed, 23);
      api.selectStage(Math.floor(next / 6) === biome ? next : biome * 6);
    },
    restart() {
      if (!scene?.ready || state.phase === 'animating') return;
      campaignSnapshot = undefined;
      progress.fill(0); Object.assign(state, { phase: 'explore', biome: 0, heroHp: 100, enemyHp: 100, completed: 0, bosses: 0, nearby: false });
      state.companionHealsRemaining = 1;
      state.activeStageIndex = 0; state.stageTesting = false; state.adminMode = false;
      Object.assign(state, { level: 1, xp: 0, xpToNext: xpRequired(1), maxHp: 100, chakra: 80, maxChakra: 80, stamina: 100, skillCooldowns: emptyCooldowns(), unlockedSkills: unlockedSkills(1), encounterTurn: 0, defenseWindow: false, enemyIntent: undefined });
      pressureMs = pressureLimit(state.difficulty, state.activeStageIndex); answerElapsedMs = 0; reactionMs = 0; learningPaused = false; guardReady = false;
      editorFocused = false; save(); scene.enterRegion(0);
      emit('A new expedition begins. Walk to the guardian and press E.');
    },
    setMuted(value) { soundscape.setMuted(value); },
    setReducedEffects(reduced) {
      reducedEffectsOverride = !!reduced;
      if (reduced) scene?.cinematic.reduce();
      scene?.updateMentor(0);
    },
    destroy() {
      disposed = true; if (scene) scene.generation++;
      scene?.cinematic.clear();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVisibility);
      reducedMotion.removeEventListener('change', onReducedMotion);
      phaser?.destroy(true); soundscape.destroy();
    },
  };
  (window as unknown as Record<string, unknown>).__TAG_QUEST__ = {
    getState: () => ({ ...state, progress: [...progress], editorFocused }),
    getPosition: () => ({ x: scene?.hero.x, y: scene?.hero.y }),
    getAnimation: () => ({
      hero: { key: scene?.hero.anims.currentAnim?.key, frame: scene?.hero.frame.name, flipX: scene?.hero.flipX },
      enemy: { key: scene?.enemy.anims.currentAnim?.key, frame: scene?.enemy.frame.name, flipX: scene?.enemy.flipX },
    }),
    interact: api.interact, travel: api.travel,
    moveToGuardian: () => { if (scene && state.phase === 'explore') { scene.hero.setPosition(610, 365); } },
    api,
  };
  void fetch(url('assets/manifest.json')).then(async response => {
    if (!response.ok) throw new Error(`Asset manifest: ${response.status}`);
    manifest = await response.json() as AssetManifest;
    if (disposed) return;
    phaser = new Phaser.Game({
      type: Phaser.AUTO, parent, width: WIDTH, height: HEIGHT,
      backgroundColor: '#101b24', pixelArt: true, roundPixels: false,
      render: { antialias: false, pixelArt: true },
      scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH, width: WIDTH, height: HEIGHT },
      scene: Expedition,
      audio: { noAudio: true },
      input: { keyboard: false },
    });
  }).catch(error => {
    emit('The expedition assets could not load. Refresh the page after starting the local server.');
    console.error(error);
  });
  return api;
}
