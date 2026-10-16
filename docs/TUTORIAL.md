# Guided first session

The opening tour is a short conversation with Mr. Rifky. It introduces one part of the screen at a time and points to the real editor and output components. It does not create an enemy encounter, award progress, change health, or make an attack.

## Content and sequence

`src/tutorialContent.ts` exports `GuidedTutorialPage`, `TutorialTarget`, `TutorialDemo`, `tutorialDemo`, and `tutorialPages`.

| Page | One teaching purpose | Spotlight |
|---|---|---|
| Welcome | HTML powers the hero; the campaign has 24 encounters and four guardians. | None |
| Explore | Walk with WASD/arrows and approach a sentry with E. | None |
| Editor | Identify the code input and a pair of heading tags. | Editor |
| Expected | Identify the task's rendered target. | Expected result |
| Actual | Identify what the learner's HTML renders. | Your output |
| Wrong tag | A paragraph with the same text is not the requested heading. | Expected and actual together |
| Missing tag | A browser can repair a mistake that the task still requires the learner to fix. | Editor |
| Combat | Choose an art, execute correct HTML, and respond to the enemy's warning. | None |
| Support | Call Mr. Rifky for paused help and return safely to the game. | None |

The worked example is original: `<h1>Quest</h1>`. Its paragraph alternative is `<p>Quest</p>`, and its incomplete alternative is `<h1>Quest`. The expected result remains the correctly closed heading throughout. These examples teach the same distinction between heading structure and visible output covered by [W3Schools' headings chapter](https://www.w3schools.com/html/html_headings.asp).

## Integration contract

A page has `id`, `title`, and `message`. Optional `target` is `editor`, `expected`, `actual`, or `comparison`. The comparison target reveals the expected and actual renderings together for the wrong-tag demonstration. Optional `demo` is `correct`, `wrong-tag`, or `missing-tag`. `example` provides the short fragment when the dialogue also needs to show code.

The interface maps these semantic targets to the existing components and recomputes the spotlight position when the viewport changes. The tour uses pure training fixtures from `tutorialDemo`, rendered by the same safe preview renderer as the game. It snapshots any current task and draft before showing the fixtures and restores them on completion, close, or skip. Temporary examples must not be saved as the learner's answer.

All opening-tour pages and transitions pause the combat clock. Close and Skip end the tour and resume the appropriate current game state. They do not clear completed encounters, reset the save, or require a second Begin button. Every real encounter starts directly when entered. Calling Mr. Rifky later remains the explicit way to pause for reading.

The tour should be revisitable through the existing teaching controls. A new onboarding version may mark this particular guide as seen, but it must not erase the learner's existing game progress or drafts.

## Writing choices

The intended learner is around 12. Mr. Rifky uses short sentences, concrete references to the visible screen, and one main purpose per page. The correct example appears before either mistake. Comparing the editor, target, and actual rendering supplies context instead of asking the learner to remember which panel means what.

The tour explains timing without running it while the learner reads. The mistake examples are demonstrations, not wrong-answer submissions. They must not trigger an enemy critical hit or consume a healing gift.

The established during-work antislop choice and installed `ui-ux-laws` guidance apply. This is a content and guided-onboarding addition, not a new layout, game engine, or platform. No broad QA run or measured learning outcome is claimed by this document.
