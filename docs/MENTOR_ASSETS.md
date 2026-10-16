# Mentor assets and learning design

## Files

- `public/assets/mentor/portrait.png`: transparent portrait, 1414 x 1112.
- `public/assets/mentor/spritesheet.png`: transparent 9-column x 4-row sheet, 1678 x 937, 36 frames.
- `source-portrait.png` and `source-spritesheet.png`: original user uploads, retained separately.

PNG is a raster format. These are transparent pixel-art assets, not vector SVG files. They are derivatives of the user's supplied artwork; the existing OpenDuelyst CC0 notice does not describe these new assets.

The sheet rows are right-facing walk, left-facing walk, front-facing and back-facing. CSS uses percentage-based cells because the generated sheet dimensions are not evenly divisible by the grid. Keep a static front-facing frame during reading and coding; play only one short sequence when the student opens the guide. Respect reduced-motion preferences.

## Tool and prompts

Created with the built-in imagegen tool in background-extraction edit mode, with `transparent_background: true`. No CLI/API-key workflow was used. Both original uploads were inspected before editing.

Portrait prompt:

> Use case: background-extraction. Edit target: the supplied pixel-art portrait of a friendly dark-haired male teacher with glasses and light blue shirt, one hand raised. Remove ONLY the bright green chroma screen to actual alpha transparency. Preserve the exact character identity, facial expression, glasses, shirt colors, pose, hard pixel edges and all body details. No redrawing, no smoothing, no new elements, no text or shadows. Deliver a tightly framed transparent PNG portrait with a little transparent padding around the character, retaining the entire raised hand and torso.

Spritesheet prompt:

> Use case: background-extraction. Edit target: the supplied pixel-art game spritesheet, exactly 9 columns and 4 rows of the same mini teacher character, 36 frames total. Remove ONLY the bright green chroma background and straight black grid separator lines into actual transparent alpha. Preserve ALL 36 original character poses and their identity, color, pixel texture and ordering. Preserve a uniform 9-column by 4-row sprite grid, no added poses, missing frames, text, labels or borders. Each character centered horizontally in its own equal-size cell with feet at same cell baseline. Row1 faces right walking, row2 faces left walking, row3 front facing, row4 back facing. Do not smooth or redraw characters. Output a transparent PNG spritesheet for CSS steps animation, maintaining the original full sheet composition and aspect ratio.

The output is an image-tool derivative, not a claim of pixel-identical chroma-key processing.

## Age-12 learning decisions

The target is an upper-primary learner around age 12. We use attention and working-memory principles, not a fixed or invented limit on neurons.

- One short idea and one next action per tutorial step.
- Put a worked HTML example beside its rendered result.
- Read safely before explicitly starting timed practice.
- Keep hints optional and contextual; avoid unsolicited chatter or repeating animation.
- Pause combat while the guide bubble is open and retain the code draft.
- Offer a labeled, limited 20-HP heal once per encounter; full health does not consume it.
- Make help and healing available through visible buttons, with keyboard focus and adequate touch targets.

These decisions follow the guidance on worked examples, reducing split attention and scaffolding in [NSW Education's cognitive-load practice guide](https://education.nsw.gov.au/about-us/education-data-and-research/cese/publications/practical-guides-for-educators/cognitive-load-theory-in-practice) and [EEF's scaffolding guidance](https://educationendowmentfoundation.org.uk/news/scaffolding-independent-learning--metacognitive-strategies). They are design choices informed by those sources, not evidence that this particular game has been tested with children.

## Agent agreement

The interface and layout agents agreed on an optional paused hint bubble, short portrait dialogue, a rendered worked example, and no continuous companion motion. The engine agent owns the heal limit and preserves it across refresh/retreat; the interface only requests the heal and displays its availability.
