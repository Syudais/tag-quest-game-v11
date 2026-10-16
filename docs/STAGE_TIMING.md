# Time follows HTML complexity

Each stage uses **difficulty base × stage multiplier**. Normal's base is 30 seconds; Easy's base is 90 seconds. `src/stageTiming.ts` is the shared source for all 24 multipliers, stable challenge IDs, and short explanations. The engine and stage-menu display consume this module rather than maintaining separate tables.

These are initial design allowances based on syntax and relationships, not measured student completion times. Later stages are not automatically harder: adding a button type gets less time than matching a label and input. Text length and the number of words in the question do not affect the clock.

## Formula and display

Multiply the base milliseconds by `stageMultiplier(index)` exactly. Do not round the actual budget to five seconds. The chosen factors all produce whole-second budgets for both difficulty bases. A live countdown shows the ceiling of the remaining seconds. Explicit timing belongs beside the selected stage: for example, **Normal: 30 s × 1.8 = 54 s**.

The timing allowance applies to every fresh question in that stage and its six question variants. The variants change requested names, text, paths, field values, or item contents while retaining the same element and attribute structure. Do not recalculate the factor from a random variant's text.

| Stage | Topic | Factor | Normal | Easy | Structural reason |
| --- | --- | --- | --- | --- | --- |
| 1 | Heading | 1.0 | 30 s | 90 s | One element and closing tag |
| 2 | Paragraph | 1.0 | 30 s | 90 s | One element around text |
| 3 | Strong importance | 1.2 | 36 s | 108 s | One selected word nested in a paragraph |
| 4 | Emphasis | 1.2 | 36 s | 108 s | One selected word nested in a paragraph |
| 5 | Nesting repair | 1.3 | 39 s | 117 s | Two explicit closing tags in the right order |
| 6 | Root Warden | 1.5 | 45 s | 135 s | Sibling heading and paragraph with nested strong |
| 7 | Link | 1.2 | 36 s | 108 s | One quoted href |
| 8 | Image | 1.5 | 45 s | 135 s | src, meaningful alt, and void element syntax |
| 9 | Bookmark | 1.5 | 45 s | 135 s | Matching fragment href and destination ID |
| 10 | Title attribute | 1.2 | 36 s | 108 s | One quoted attribute |
| 11 | Class | 1.2 | 36 s | 108 s | One attribute and class name |
| 12 | Crystal Sentinel | 1.8 | 54 s | 162 s | Linked image with three attributes across two elements |
| 13 | Unordered list | 1.5 | 45 s | 135 s | Three item elements in a container |
| 14 | Ordered list | 1.5 | 45 s | 135 s | Two ordered step elements in a container |
| 15 | Table headers | 1.8 | 54 s | 162 s | Two rows and correct th/td roles |
| 16 | Table caption | 1.5 | 45 s | 135 s | Insert caption first while retaining an existing row |
| 17 | Div grouping | 1.4 | 42 s | 126 s | Named container with two children |
| 18 | Ash Colossus | 2.0 | 60 s | 180 s | Section, heading, list, and nested items |
| 19 | Label and input | 1.8 | 54 s | 162 s | Matched for/id plus input name/type |
| 20 | Button | 1.2 | 36 s | 108 s | One type attribute on an existing element |
| 21 | Select | 1.8 | 54 s | 162 s | Named select, two value attributes, visible option text |
| 22 | Textarea | 1.4 | 42 s | 126 s | Two attributes plus text between tags |
| 23 | Semantic page | 1.8 | 54 s | 162 s | main/article nesting with heading and paragraph |
| 24 | The Null King | 2.5 | 75 s | 225 s | main, form, connected label/input, required, and submit button |

## Variant audit

Reviewed the base challenges and every branch in `src/questionVariants.ts`. Each branch supplies six variants using six parameter values. Their templates share the same structural requirements within a stage: for example, all six stage-15 tables have two rows and two cells per row, and all six final forms use the same connected-field structure. Stage 22 varies its textarea rows value from 2 to 4 without changing the required attributes or elements. The common topic factor therefore covers all six variants; it does not reward a shorter random name with a smaller allowance.

## Existing mechanics stay consistent

- Reading, menus, hidden browser tabs, and onboarding pause the active clock.
- A fresh coding turn or encounter resets to its stage's effective budget. Frost bind's existing additional delay is separate.
- Switching difficulty preserves elapsed time by applying the difference between the old and new effective budgets.
- The once-per-question short reminder still appears after more than 30 active seconds. It does not reset or extend the clock.
- Fast-answer critical windows remain 8 and 18 seconds. Extra solving time does not silently extend the speed bonus.
- Wrong HTML still risks an enemy critical attack. Time expiry still gives the enemy its attack and timed defense warning.

`stageTiming(index)` returns the entry, including its `reason`; `stageMultiplier(index)` returns the number. Both reject an invalid campaign index rather than silently selecting another stage's allowance. No combat, draft, or progress state is stored in this module.
