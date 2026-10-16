import type { Defense, SkillId } from './combat';
export type { Defense, SkillId } from './combat';
export type Move = SkillId | 'magic';
export type Difficulty = 'easy' | 'normal';
export type Phase = 'explore' | 'challenge' | 'defending' | 'animating' | 'victory' | 'defeat';
export interface GameState {
  phase: Phase; biome: number; heroHp: number; enemyHp: number;
  completed: number; bosses: number; total: number; message: string;
  nearby?: boolean;
  level: number; xp: number; xpToNext: number; maxHp: number;
  chakra: number; maxChakra: number; stamina: number; enemyMaxHp: number;
  enemyIntent?: string; reactionRemainingMs: number; defenseWindow: boolean;
  pressureRemainingMs: number; skillCooldowns: Record<SkillId, number>;
  unlockedSkills: SkillId[]; lastCritical: boolean; encounterTurn: number;
  learningPaused: boolean; answerElapsedMs: number;
  companionHealsRemaining: number;
  difficulty: Difficulty;
  pressureLimitMs: number;
  pressureBaseMs: number; pressureMultiplier: number;
  activeStageIndex: number; adminMode: boolean; stageTesting: boolean;
}
export interface GameBridge {
  onState(state: GameState): void;
  onEncounter(biome: number, boss: boolean): void;
  onReady(): void;
  onMentorInteract?(): void;
}
export interface GameAPI {
  execute(move: Move, context?: { elapsedMs: number; assisted?: boolean }): Promise<void>;
  reportMistake(): void;
  defend(kind: Defense): void;
  setLearningPaused(paused: boolean): void;
  companionHeal(): boolean;
  setDifficulty(difficulty: Difficulty): boolean;
  showMentorHint(text: string): void;
  selectStage(index: number): boolean;
  setAdminMode(enabled: boolean): boolean;
  retry(): void;
  setEditorFocused(focused: boolean): void;
  closeChallenge(): void;
  interact(): void;
  travel(biome: number): void;
  restart(): void;
  setMuted(muted: boolean): void;
  setReducedEffects(reduced: boolean): void;
  destroy(): void;
}
export interface Challenge {
  id: string; biome: number; title: string; concept: string; instruction: string;
  starter: string; solution: string; hint: string; source: string;
  validate(html: string): { ok: boolean; message: string };
}
