import { stageMultiplier } from './stageTiming';
export type SkillId = 'attack' | 'fireball' | 'ice' | 'lightning' | 'heal' | 'guard';
export type Defense = 'dodge' | 'parry';
export interface SkillDefinition {
  id: SkillId; name: string; label: string; description: string;
  cost: number; cooldown: number; unlockLevel: number; power: number; color: string;
}
export const SKILLS: SkillDefinition[] = [
  { id: 'attack', name: 'Blade strike', label: 'Blade strike', description: 'Reliable physical damage. Restores 8 chakra.', cost: 0, cooldown: 0, unlockLevel: 1, power: 34, color: '#edce91' },
  { id: 'fireball', name: 'Flame art', label: 'Flame art', description: 'Heavy fire damage. Burns through a seal.', cost: 20, cooldown: 1, unlockLevel: 1, power: 48, color: '#ffac69' },
  { id: 'ice', name: 'Frost bind', label: 'Frost bind', description: 'Damage and delay the next pressure attack by 8 seconds.', cost: 25, cooldown: 2, unlockLevel: 2, power: 39, color: '#9de5ff' },
  { id: 'lightning', name: 'Storm art', label: 'Storm art', description: 'High damage with an increased critical chance.', cost: 35, cooldown: 3, unlockLevel: 3, power: 65, color: '#d6b5ff' },
  { id: 'heal', name: 'Mending art', label: 'Mending art', description: 'Restore 38 HP plus your level bonus. Does not damage the enemy.', cost: 25, cooldown: 2, unlockLevel: 1, power: 0, color: '#a9e5b4' },
  { id: 'guard', name: 'Focus guard', label: 'Focus guard', description: 'Restore 30 chakra, 25 stamina, and halve the next enemy hit.', cost: 0, cooldown: 1, unlockLevel: 1, power: 0, color: '#b5cbda' },
];
export const PRESSURE_MS = 30000;
export const EASY_PRESSURE_MS = 90000;
export const pressureBase = (difficulty: 'easy' | 'normal') => difficulty === 'easy' ? EASY_PRESSURE_MS : PRESSURE_MS;
export const pressureLimit = (difficulty: 'easy' | 'normal', stageIndex = 0) => pressureBase(difficulty) * stageMultiplier(stageIndex);
export const REACTION_MS = 1000;
export const PARRY_MS = 350;
export const xpRequired = (level: number) => 80 + (level - 1) * 35;
export const maxHealth = (level: number) => 100 + (level - 1) * 12;
export const maxChakra = (level: number) => 80 + (level - 1) * 8;
export const unlockedSkills = (level: number): SkillId[] => SKILLS.filter(skill => skill.unlockLevel <= level).map(skill => skill.id);
export const emptyCooldowns = (): Record<SkillId, number> => ({ attack: 0, fireball: 0, ice: 0, lightning: 0, heal: 0, guard: 0 });
