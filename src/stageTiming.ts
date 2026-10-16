export interface StageTiming {
  index: number;
  id: string;
  multiplier: number;
  reason: string;
}

export const STAGE_TIMING: readonly StageTiming[] = [
  { index: 0, id: 'grove-heading', multiplier: 1, reason: 'One heading and its closing tag.' },
  { index: 1, id: 'grove-paragraph', multiplier: 1, reason: 'One paragraph around a sentence.' },
  { index: 2, id: 'grove-strong', multiplier: 1.2, reason: 'Wrap one important word inside a paragraph.' },
  { index: 3, id: 'grove-emphasis', multiplier: 1.2, reason: 'Wrap one stressed word inside a paragraph.' },
  { index: 4, id: 'grove-nesting', multiplier: 1.3, reason: 'Repair two closing tags in the right order.' },
  { index: 5, id: 'grove-capstone', multiplier: 1.5, reason: 'Combine sibling elements with a nested important word.' },
  { index: 6, id: 'ruins-link', multiplier: 1.2, reason: 'Add one quoted destination to a link.' },
  { index: 7, id: 'ruins-image', multiplier: 1.5, reason: 'Check two image attributes and the void element.' },
  { index: 8, id: 'ruins-anchor', multiplier: 1.5, reason: 'Match a fragment link to a heading ID.' },
  { index: 9, id: 'ruins-title', multiplier: 1.2, reason: 'Add one quoted title attribute.' },
  { index: 10, id: 'ruins-class', multiplier: 1.2, reason: 'Add one class name to an element.' },
  { index: 11, id: 'ruins-capstone', multiplier: 1.8, reason: 'Nest an image in a link and place three attributes.' },
  { index: 12, id: 'marsh-list', multiplier: 1.5, reason: 'Build a list with three separate item elements.' },
  { index: 13, id: 'marsh-order', multiplier: 1.5, reason: 'Build numbered steps with separate item elements.' },
  { index: 14, id: 'marsh-table', multiplier: 1.8, reason: 'Keep two rows aligned and distinguish header and data cells.' },
  { index: 15, id: 'marsh-caption', multiplier: 1.5, reason: 'Insert a caption before the existing table row.' },
  { index: 16, id: 'marsh-group', multiplier: 1.4, reason: 'Group a heading and paragraph in a named container.' },
  { index: 17, id: 'marsh-capstone', multiplier: 2, reason: 'Combine a section, heading, list, and item nesting.' },
  { index: 18, id: 'citadel-label', multiplier: 1.8, reason: 'Connect a label and input with matching attributes.' },
  { index: 19, id: 'citadel-button', multiplier: 1.2, reason: 'Add one button type attribute.' },
  { index: 20, id: 'citadel-select', multiplier: 1.8, reason: 'Build two options with matching values inside a named select.' },
  { index: 21, id: 'citadel-notes', multiplier: 1.4, reason: 'Add two textarea attributes and preserve its text.' },
  { index: 22, id: 'citadel-semantic', multiplier: 1.8, reason: 'Nest article, heading, and paragraph in a main region.' },
  { index: 23, id: 'citadel-capstone', multiplier: 2.5, reason: 'Combine page regions, a form, connected fields, and a submit button.' },
];

export function stageTiming(index: number): StageTiming {
  const timing = STAGE_TIMING[index];
  if (!Number.isInteger(index) || !timing) throw new RangeError(`Stage index ${index} is outside the campaign.`);
  return timing;
}

export function stageMultiplier(index: number): number {
  return stageTiming(index).multiplier;
}
