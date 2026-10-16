export type TutorialTarget = 'editor' | 'expected' | 'actual' | 'comparison';
export type TutorialDemo = 'correct' | 'wrong-tag' | 'missing-tag';

export interface GuidedTutorialPage {
  id: string;
  title: string;
  message: string;
  target?: TutorialTarget;
  demo?: TutorialDemo;
  example?: string;
}

export const tutorialDemo = {
  instruction: 'Create an h1 heading that says Quest.',
  expectedHtml: '<h1>Quest</h1>',
  correctHtml: '<h1>Quest</h1>',
  wrongTagHtml: '<p>Quest</p>',
  missingTagHtml: '<h1>Quest',
};

export const tutorialPages: GuidedTutorialPage[] = [
  {
    id: 'welcome',
    title: 'Welcome, adventurer!',
    message: 'Hi! I am Mr. Rifky. Your HTML powers your hero. Clear 24 encounters and defeat four guardians to restore the Codex.',
  },
  {
    id: 'explore',
    title: 'Find your first opponent.',
    message: 'Walk with WASD or the arrow keys. Approach a sentry and press E. Each encounter begins right away, so read with me whenever you need a pause.',
  },
  {
    id: 'editor',
    title: 'Your HTML goes here.',
    message: 'This is the code editor. The opening h1 starts a heading. The closing /h1 ends it. Quest is the text inside.',
    target: 'editor',
    demo: 'correct',
    example: tutorialDemo.correctHtml,
  },
  {
    id: 'expected',
    title: 'This is your target.',
    message: 'Expected result shows what the task wants. For this practice, it is a heading that says Quest.',
    target: 'expected',
    demo: 'correct',
  },
  {
    id: 'actual',
    title: 'This is what your code makes.',
    message: 'Your output shows your own HTML in the browser. It updates while you type. Here, our heading matches the target.',
    target: 'actual',
    demo: 'correct',
  },
  {
    id: 'wrong-tag',
    title: 'Same words, different element.',
    message: 'A paragraph says Quest too, but it looks smaller. The task asks for an h1 heading. Using p does not complete that task.',
    target: 'comparison',
    demo: 'wrong-tag',
    example: tutorialDemo.wrongTagHtml,
  },
  {
    id: 'missing-tag',
    title: 'Check your closing tag.',
    message: 'A browser may repair a missing tag, so the heading can still look right. This task needs </h1>. Check the code as well as the result.',
    target: 'editor',
    demo: 'missing-tag',
    example: tutorialDemo.missingTagHtml,
  },
  {
    id: 'combat',
    title: 'Write, execute, then defend.',
    message: 'Choose an art and execute correct HTML. More complex tasks get extra time. Fast answers can hit harder. Wrong code or an expired clock gives the enemy a turn. Dodge or Parry during its warning.',
  },
  {
    id: 'support',
    title: 'Next, choose your adventure.',
    message: 'Next, see what each land teaches. Easy starts at 90 seconds; Normal starts at 30. Complex stages multiply that time. Then pick a stage. Skipping this tour takes you to these choices too.',
  },
];
