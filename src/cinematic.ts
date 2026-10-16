import Phaser from 'phaser';
import type { SkillId } from './combat';

type Point = { x: number; y: number };
type EffectManifest = {
  animations?: Record<string, string[] | { frames: string[]; fps?: number }>;
  settings?: Record<string, { frameRate?: number; origin?: Point }>;
};
type Transient = Phaser.GameObjects.GameObject;

export const fireVisual = (level: number) => level >= 5
  ? { name: 'Firaga', tier: 3 } : level >= 3 ? { name: 'Fira', tier: 2 } : { name: 'Fire', tier: 1 };

export class CombatCinematics {
  private objects = new Set<Transient>();
  private waits = new Map<Phaser.Time.TimerEvent, () => void>();
  private actors = new Map<Phaser.GameObjects.Sprite, { x: number; alpha: number }>();
  private castingActors = new Map<Phaser.GameObjects.Sprite, { timeScale: number; paused: boolean }>();
  private epoch = 0;
  private dim?: Phaser.GameObjects.Rectangle;
  active = false;

  constructor(private scene: Phaser.Scene, private isReduced: () => boolean) {}

  private own<T extends Transient>(object: T): T {
    if (this.objects.size >= 120) this.remove(this.objects.values().next().value!);
    this.objects.add(object);
    object.once('destroy', () => this.objects.delete(object));
    return object;
  }

  private remove(object: Transient) {
    this.scene.tweens.killTweensOf(object);
    this.objects.delete(object);
    if (object.scene) object.destroy();
  }

  wait(ms: number) {
    return new Promise<void>(resolve => {
      const event = this.scene.time.delayedCall(ms, () => { this.waits.delete(event); resolve(); });
      this.waits.set(event, resolve);
    });
  }

  clear() {
    this.epoch++;
    this.active = false;
    this.scene.cameras.main.shakeEffect.reset();
    this.waits.forEach((resolve, event) => { event.remove(false); resolve(); });
    this.waits.clear();
    this.actors.forEach((original, actor) => {
      this.scene.tweens.killTweensOf(actor);
      if (actor.active) { actor.setX(original.x).setAlpha(original.alpha).clearTint(); actor.anims.resume(); }
    });
    this.actors.clear();
    this.restoreCasts();
    [...this.objects].forEach(object => this.remove(object));
    this.dim = undefined;
  }

  resize() {
    const camera = this.scene.cameras.main;
    this.dim?.setDisplaySize(camera.width / camera.zoom + 100, camera.height / camera.zoom + 100);
  }

  reduce() {
    this.scene.cameras.main.shakeEffect.reset();
    [...this.objects].forEach(object => { if (!(object instanceof Phaser.GameObjects.Text)) this.remove(object); });
    this.dim = undefined;
    this.actors.forEach((original, actor) => {
      this.scene.tweens.killTweensOf(actor);
      if (actor.active) { actor.setX(original.x).setAlpha(original.alpha); actor.anims.resume(); }
    });
    this.actors.clear();
    this.restoreCasts();
  }

  finishCast(caster: Phaser.GameObjects.Sprite) {
    const original = this.castingActors.get(caster);
    if (!original) return;
    if (caster.active) {
      caster.anims.timeScale = original.timeScale;
      if (original.paused) caster.anims.pause();
      else caster.anims.resume();
    }
    this.castingActors.delete(caster);
  }

  private restoreCasts() {
    [...this.castingActors.keys()].forEach(caster => this.finishCast(caster));
  }

  begin(name: string, color: string, magic = false) {
    this.clear();
    this.active = true;
    if (magic && !this.isReduced()) {
      this.dim = this.own(this.scene.add.rectangle(500, 300, 1200, 800, 0x050c19, 1).setAlpha(0).setDepth(700));
      this.resize();
      this.scene.tweens.add({ targets: this.dim, alpha: 0.68, duration: 140 });
    }
    this.label(name, 500, 167, color, 28, magic && !this.isReduced() ? 1320 : 480);
  }

  label(text: string, x: number, y: number, color = '#ffe0a5', size = 28, hold = 480) {
    const label = this.own(this.scene.add.text(x, y, text, {
      fontFamily: 'Georgia, serif', fontSize: `${size}px`, color, stroke: '#10202b', strokeThickness: 6,
    }).setOrigin(0.5).setDepth(1040));
    this.scene.tweens.add({ targets: label, y: this.isReduced() ? y : y - 28, alpha: 0,
      duration: this.isReduced() ? 300 : 480, delay: hold, onComplete: () => this.remove(label) });
  }

  private ring(x: number, y: number, color: number, radius: number, duration = 340, ground = false) {
    const ring = this.own(this.scene.add.ellipse(x, y, radius * 2, radius * (ground ? 0.62 : 2), color, 0.05)
      .setStrokeStyle(this.isReduced() ? 2 : 4, color, 0.85).setDepth(940));
    this.scene.tweens.add({ targets: ring, scale: this.isReduced() ? 1.08 : 1.9, alpha: 0, duration,
      onComplete: () => this.remove(ring) });
  }

  private atlas(name: string, point: Point, scale = 1, duration = 300) {
    if (this.isReduced() || !this.scene.textures.exists('ragnarok-effects')) return;
    const manifest = this.scene.cache.json.get('ragnarok-manifest') as EffectManifest | undefined;
    const entry = manifest?.animations?.[name];
    const settings = manifest?.settings?.[name];
    const frames = (Array.isArray(entry) ? entry : entry?.frames ?? [])
      .filter(frame => this.scene.textures.get('ragnarok-effects').has(frame));
    if (!frames.length) return;
    const sprite = this.own(this.scene.add.sprite(point.x, point.y, 'ragnarok-effects', frames[0])
      .setDepth(955).setScale(scale).setBlendMode(Phaser.BlendModes.ADD));
    if (settings?.origin) sprite.setOrigin(settings.origin.x, settings.origin.y);
    const key = `cinematic:${name}`;
    if (!this.scene.anims.exists(key)) this.scene.anims.create({ key,
      frames: frames.map(frame => ({ key: 'ragnarok-effects', frame })),
      frameRate: settings?.frameRate ?? (!Array.isArray(entry) && entry?.fps ? entry.fps : frames.length / duration * 1000),
      repeat: 0 });
    sprite.play(key);
    sprite.once('animationcomplete', () => this.remove(sprite));
    return sprite;
  }

  sparks(point: Point, color: number, amount = 18, spread = 75) {
    if (this.isReduced()) return;
    for (let i = 0; i < Math.min(amount, 36); i++) {
      const angle = i / amount * Math.PI * 2 + 0.3;
      const distance = spread * (0.5 + i % 5 / 8);
      const dot = this.own(this.scene.add.rectangle(point.x, point.y, i % 3 ? 4 : 8, i % 3 ? 11 : 4,
        i % 4 ? color : 0xfff0c0).setDepth(980).setRotation(angle));
      this.scene.tweens.add({ targets: dot, x: point.x + Math.cos(angle) * distance,
        y: point.y + Math.sin(angle) * distance * 0.7 + 22, alpha: 0, angle: 100,
        duration: 250 + i % 4 * 55, ease: 'Cubic.Out', onComplete: () => this.remove(dot) });
    }
  }

  async anticipate(caster: Phaser.GameObjects.Sprite, point: Point, color: number,
    id: SkillId, tier = 1) {
    const calm = id === 'heal' || id === 'guard';
    if (calm || this.isReduced()) {
      this.ring(point.x, point.y + 30, color, calm ? 33 : 22, 250, true);
      await this.wait(this.isReduced() ? 160 : 240);
      return;
    }
    const epoch = this.epoch;
    const gatheringMs = id === 'fireball' ? 700 + (tier - 1) * 75 : 700;
    this.castingActors.set(caster, { timeScale: caster.anims.timeScale, paused: caster.anims.isPaused });
    caster.anims.resume();
    caster.anims.timeScale = 0.35;
    const chargeObjects: Transient[] = [];
    const track = <T extends Transient>(object: T) => { chargeObjects.push(object); return object; };
    const charge = this.atlas('charge', { x: caster.x, y: caster.y - 75 }, 0.62);
    if (charge) {
      track(charge).setAlpha(0.5);
      charge.play({ key: 'cinematic:charge', repeat: -1 });
      this.scene.tweens.add({ targets: charge, alpha: 0.9, scale: 0.8, duration: gatheringMs });
    }
    const runes = track(this.own(this.scene.add.graphics().setDepth(845)));
    runes.lineStyle(2, color, 0.7).strokeEllipse(caster.x, caster.y + 2, 100, 30);
    runes.lineStyle(1, color, 0.5).strokeEllipse(caster.x, caster.y + 2, 77, 21);
    for (let i = 0; i < 8; i++) {
      const angle = i / 8 * Math.PI * 2;
      const x = caster.x + Math.cos(angle) * 44, y = caster.y + 2 + Math.sin(angle) * 12;
      runes.lineBetween(x - 2, y - 4, x + 2, y + 4);
    }
    runes.setAlpha(0.15);
    this.scene.tweens.add({ targets: runes, alpha: 0.85, duration: gatheringMs, ease: 'Sine.In' });
    const halo = track(this.own(this.scene.add.circle(point.x, point.y, 13, color, 0.2).setDepth(947).setScale(0.25)));
    this.scene.tweens.add({ targets: halo, scale: id === 'fireball' ? 1.5 + tier * 0.25 : 1.7,
      alpha: 0.8, duration: gatheringMs, ease: 'Cubic.In' });
    const core = this.atlas(id === 'fireball' ? 'fire-projectile' : 'charge', point,
      id === 'fireball' ? 0.25 : 0.18);
    if (core) {
      track(core);
      core.play({ key: id === 'fireball' ? 'cinematic:fire-projectile' : 'cinematic:charge', repeat: -1 });
      if (id === 'fireball') core.setRotation(Math.PI / 2);
      this.scene.tweens.add({ targets: core, scale: id === 'fireball' ? 0.48 + tier * 0.11 : 0.33,
        duration: gatheringMs, ease: 'Cubic.In' });
    }
    for (let i = 0; i < 30; i++) {
      const angle = i * 2.4, radius = 65 + i % 4 * 13;
      const mote = track(this.own(this.scene.add.rectangle(point.x + Math.cos(angle) * radius,
        point.y + Math.sin(angle) * radius * 0.7, i % 3 ? 3 : 5, i % 3 ? 7 : 5, color)
        .setDepth(948).setAlpha(0).setRotation(angle)));
      this.scene.tweens.add({ targets: mote, x: point.x, y: point.y, alpha: 0.9, scale: 0.3,
        duration: 280 + i % 3 * 50, delay: i * 18, ease: 'Cubic.In', onComplete: () => this.remove(mote) });
    }
    await this.wait(gatheringMs);
    if (epoch !== this.epoch) return;
    if (!this.isReduced() && this.castingActors.has(caster)) {
      const frames = caster.anims.currentAnim?.frames;
      if (frames?.length) caster.anims.pause(frames[Math.min(4, frames.length - 1)]);
      this.ring(point.x, point.y, color, 24, 200);
      await this.wait(200);
    }
    if (epoch !== this.epoch) return;
    chargeObjects.forEach(object => this.remove(object));
    if (this.castingActors.has(caster)) {
      caster.anims.resume();
      caster.anims.timeScale = 1.2;
    }
  }

  async release(id: SkillId, from: Point, to: Point, tier = 1) {
    const token = this.epoch;
    if (this.isReduced()) { if (id !== 'attack') await this.wait(100); return; }
    if (id === 'lightning') {
      const bolt = this.own(this.scene.add.graphics().setDepth(970));
      const paths: Point[][] = [];
      const main = [{ x: to.x - 26, y: 25 }];
      for (let i = 1; i <= 8; i++) main.push({ x: to.x + (i === 8 ? 0 : i % 2 ? 30 : -35), y: 25 + (to.y - 25) * i / 8 });
      paths.push(main);
      for (let branch = 2; branch <= 6; branch += 2) {
        const root = main[branch], sign = branch % 4 ? -1 : 1;
        paths.push([root, { x: root.x + sign * 72, y: root.y + 12 },
          { x: root.x + sign * 52, y: root.y + 50 }, { x: root.x + sign * 120, y: root.y + 88 }]);
      }
      for (const [width, color, alpha] of [[19, 0x725aff, 0.22], [9, 0xa58cff, 0.8], [3, 0xf6edff, 1]]) {
        bolt.lineStyle(width, color, alpha);
        paths.forEach(path => { bolt.beginPath(); bolt.moveTo(path[0].x, path[0].y);
          path.slice(1).forEach(point => bolt.lineTo(point.x, point.y)); bolt.strokePath(); });
      }
      // Contact is the first visible arrival at the target; the bolt persists into recovery.
      this.scene.tweens.add({ targets: bolt, alpha: 0, delay: 110, duration: 180, onComplete: () => this.remove(bolt) });
      return;
    }
    if (id === 'attack') {
      const arc = this.own(this.scene.add.graphics().setDepth(960));
      const right = to.x >= from.x, center = to.x + (right ? -40 : 40);
      const start = right ? -1.1 : Math.PI - 1.2, end = right ? 1.2 : Math.PI + 1.1;
      arc.lineStyle(13, 0xf7ae52, 0.25).beginPath().arc(center, to.y - 15, 74, start, end).strokePath();
      arc.lineStyle(4, 0xffedbb, 1).beginPath().arc(center, to.y - 15, 70, start, end).strokePath();
      this.scene.tweens.add({ targets: arc, alpha: 0, duration: 170, onComplete: () => this.remove(arc) });
      return;
    }
    if (id !== 'fireball' && id !== 'ice') return;
    const size = id === 'fireball' ? 0.8 + tier * 0.55 : 1;
    const color = id === 'fireball' ? 0xff773a : 0x99ddff;
    const projectile = this.own(this.scene.add.container(from.x, from.y).setDepth(950));
    projectile.add(this.scene.add.ellipse(-35 * size, 0, 106 * size, 33 * size, color, 0.14));
    let sourcedFire = false;
    if (id === 'fireball') {
      const fire = this.atlas('fire-projectile', { x: 0, y: 0 }, size * 0.75);
      if (fire) {
        sourcedFire = true;
        fire.setOrigin(0.5, 0.1).setRotation(Math.PI / 2); projectile.add(fire);
        fire.play({ key: 'cinematic:fire-projectile', repeat: -1 });
      }
    }
    if (!sourcedFire) {
      projectile.add([
        this.scene.add.ellipse(-14 * size, 0, 70 * size, 30 * size, color, 0.72),
        this.scene.add.ellipse(8 * size, 0, 33 * size, 26 * size, id === 'fireball' ? 0xffd170 : 0xe4f7ff, 1),
        this.scene.add.ellipse(12 * size, 0, 16 * size, 15 * size, 0xfff5df, 1),
      ]);
    }
    const flight = this.scene.tweens.add({ targets: projectile, x: to.x, y: to.y, duration: 220, ease: 'Quad.In' });
    await this.wait(220);
    flight.stop();
    if (token === this.epoch) this.remove(projectile);
  }

  contact(id: SkillId | 'incoming' | 'parry' | 'dodge', target: Phaser.GameObjects.Sprite,
    point: Point, color: number, critical = false, tier = 1) {
    const reduced = this.isReduced();
    if (id === 'dodge') { this.ring(point.x, point.y + 30, color, 28, 250, true); return; }
    if (id === 'heal' || id === 'guard') {
      this.ring(point.x, point.y, color, 43, 460);
      this.atlas(id === 'heal' ? 'heal' : 'guard', point, 1.1, 430); return;
    }
    this.ring(point.x, point.y + 50, color, id === 'fireball' ? 35 + tier * 13 : 42, 330, true);
    if (reduced) return;
    this.sparks(point, color, critical ? 32 : 22, id === 'fireball' ? 70 + tier * 22 : 85);
    this.atlas(id === 'fireball' ? 'fire-impact' : id === 'ice' ? 'ice-impact'
      : id === 'lightning' ? 'lightning-impact' : 'slash-impact', point, id === 'fireball' ? 0.8 + tier * 0.35 : 1.2);
    if (id === 'fireball') {
      const splash = this.own(this.scene.add.graphics().setDepth(945));
      splash.fillStyle(0xff682b, 0.72).fillEllipse(point.x, point.y + 47, 92 + tier * 35, 28 + tier * 7);
      for (let i = 0; i < 7 + tier * 2; i++) {
        const x = point.x - 58 - tier * 10 + i * (116 + tier * 20) / (6 + tier * 2);
        splash.fillStyle(i % 2 ? 0xffa947 : 0xffd57c, 0.8).fillTriangle(x - 9, point.y + 47, x + 9, point.y + 47,
          x + (i % 2 ? 10 : -8), point.y + 10 - (i % 3) * 16 - tier * 4);
      }
      this.scene.tweens.add({ targets: splash, alpha: 0, scaleY: 0.8, duration: 380, onComplete: () => this.remove(splash) });
    }
    if (id === 'ice') {
      const shards = this.own(this.scene.add.graphics().setDepth(945));
      for (let i = 0; i < 7; i++) {
        const x = point.x - 65 + i * 21;
        shards.fillStyle(i % 2 ? 0x9ae1ff : 0xe6f8ff, 0.8).fillTriangle(x - 12, point.y + 47, x + 12, point.y + 47, x + 5, point.y - 30 - i % 3 * 13);
      }
      this.scene.tweens.add({ targets: shards, alpha: 0, duration: 360, onComplete: () => this.remove(shards) });
    }
    const original = { x: target.x, alpha: target.alpha };
    this.actors.set(target, original);
    target.anims.pause();
    const epoch = this.epoch;
    void this.wait(critical ? 85 : 55).then(() => { if (this.epoch === epoch && target.active) target.anims.resume(); });
    this.scene.tweens.add({ targets: target, alpha: 0.25, duration: 65, yoyo: true, repeat: 1,
      onComplete: () => { if (target.active) target.setAlpha(original.alpha); } });
    this.scene.tweens.add({ targets: target, x: original.x + (id === 'incoming' ? -12 : 10),
      duration: 80, yoyo: true, ease: 'Sine.Out' });
    this.scene.cameras.main.shake(critical ? 220 : id === 'lightning' ? 175 : 135,
      critical ? 0.011 : id === 'fireball' && tier === 3 ? 0.008 : 0.006, true);
  }

  async recover() {
    const epoch = this.epoch;
    if (this.dim) this.scene.tweens.add({ targets: this.dim, alpha: 0, duration: 230, delay: 90 });
    await this.wait(this.isReduced() ? 180 : 410);
    if (epoch === this.epoch) this.clear();
  }
}
