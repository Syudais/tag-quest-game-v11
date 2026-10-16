# First launch and stage selection

The opening sequence is **guided tutorial → game and material overview → difficulty → stage menu**. Finishing or skipping the tutorial takes the player to the overview. Skip does not start combat or bypass difficulty selection. Save the setup-complete flag only after a difficulty is chosen and the stage menu is shown. Existing progress and editor drafts remain intact.

Returning players begin at the stage menu, where they can continue, replay a cleared stage, or replay onboarding. Selecting a stage card changes the selection only. One Start/Continue button loads its field. Walk with WASD or the arrow keys, approach its opponent, and press E to begin the encounter directly.

## Mr. Rifky's introduction

Use the existing portrait dialogue and short pages. The tutorial explains the editor, Expected result, and Your output using `<h1>Quest</h1>`. The wrong-element example shows a paragraph beside the heading target; the missing-closing-tag example explains why a browser's repair does not satisfy the HTML task. Tutorial fixtures must not change the current challenge, saved draft, undo history, health, experience, or stage completion.

The six overview pages explain the goal and combat loop, then introduce each of the four lands. Stage cards show the individual HTML material and its W3Schools chapter link. These are original summaries and exercises with source links, rather than a copied W3Schools course.

All tutorial, overview, difficulty, stage-menu, and lesson reading surfaces pause encounter clocks. Returning to play resumes the current clock; reading does not spend a turn. A replay of onboarding restores the player's previous editor state when it finishes.

## Difficulty

- **Easy:** 90-second base multiplied by the task's syntax-complexity factor. Mr. Rifky automatically uses the encounter's one 20 HP heal when the living hero reaches 40% health or below. An earlier manual heal spends that same allowance.
- **Normal:** 30-second base multiplied by the same task factor. The same one 20 HP heal is available manually through Mr. Rifky.

The selected stage and active clock show base × factor = actual time. Factors range from ×1 for a heading or paragraph to ×2.5 for the final form. See `STAGE_TIMING.md` for all 24 allowances.

Both modes keep fast-answer critical hits, wrong-code critical risk, enemy turns when time expires, and the timed Dodge/Parry warning. Healing cannot revive a defeated hero.

## Stage menu

Use four chapter tabs with six cards for the selected chapter. Keep the existing region art and a short Mr. Rifky material synopsis. Each card gives its stage number, title, and HTML topic. The selected card has a clear state; it does not load the stage until Start/Continue is pressed.

Normal progression opens completed stages and the next uncleared stage. Winning clears the selected stage; merely selecting, visiting, losing, or replaying it does not advance unrelated stages. The four guardians are stages 6, 12, 18, and 24.

| Land | Stages | Materials |
| --- | --- | --- |
| Verdant Ruins | 1–6 | Headings; paragraphs; strong importance; emphasis; nesting; combined elements guardian |
| Frostfall Citadel | 7–12 | Links; images and alt; bookmarks and IDs; title; class; linked-image guardian |
| Ember Reach | 13–18 | Unordered lists; ordered lists; table cells; captions; div containers; section and list guardian |
| Hollow Gate | 19–24 | Labels and inputs; buttons; select choices; textarea; semantic regions; accessible-form guardian |

The content module derives IDs, order, titles, biomes, and source links from the existing `challenges` array. Do not create a second challenge order. Question variants retain their base stage's material and hint.

## Help during a question

After more than 30 seconds of active, unpaused time on one question, show one short Mr. Rifky reminder. Use `getShortHint(challenge, index)` so the hint matches that question's base topic. The reminder is plain text, including tags such as `<p>`; never inject it as HTML. It offers a structural clue rather than a complete solution. Reset its once-per-question allowance only when a new question is supplied. On basic Normal tasks, expiry can occur before a reminder is due; the reminder must not silently extend the stage's clock.

## Hidden teacher access

Five clicks on the stage-menu title/emblem, or Ctrl+Shift+A, toggles hidden teacher/admin access directly. Show a visible admin indicator and offer Exit admin. Admin can select locked stages for teaching. Visiting or winning an out-of-order stage must not falsely mark skipped stages as completed. Leaving admin restores normal locking rules.

## Source contract

`src/stageContent.ts` exports `stages`, `chapterOverviews`, `gameOverviewPages`, and `getShortHint`. `src/tutorialContent.ts` exports the existing guided-tour types, demo fixtures, and pages. The interface controls flow and pausing; the game engine owns stage selection, actual completion, timers, and combat. This document describes the intended contract; it does not claim a completed visual or gameplay test pass.
