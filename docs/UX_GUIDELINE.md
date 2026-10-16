# Tag Quest compact combat interface

## The reported failure

The fullscreen revision still used a large lower coding card. It covered the fighters, placed skills inside a reading panel, and left the editor and rendered previews in different parts of the screen. The user also reported clipped controls and previews at their viewport size. Filling the canvas was insufficient while the controls retained the earlier webpage proportions.

This revision replaces the stylesheet rather than stacking another layout override onto it. There are no reserved dock heights, separate preview columns, or calculations that subtract a right rail from the canvas.

## Screen composition

The game shell, frame, world, and Phaser stage use fixed or absolute zero insets. They have no page gutters, maximum width, or stage resizing when controls open. The full world remains underneath every overlay.

Hero status sits at the upper left. Enemy status is a separate compact panel above the fighting area. A small set of utility icons occupies the upper right; it is not a wide branded masthead. The center of the world stays clear for the characters and their attack effects.

Six technique icons form a short bottom action strip outside the code panel. They are 48 pixels square on typical desktop widths and 44 pixels on smaller screens, with a slightly larger option on large displays. Dodge and Parry sit beside the strip, or immediately above it when width is limited. Technique names, chakra costs, cooldowns, and explanations appear in a tooltip. A small lock or cooldown marker may appear on the icon itself. The selection border and actual availability come from game state.

The HTML drawer occupies the right edge. Its desktop width is clamped between 320 and 380 pixels around 27% of the viewport; large displays can use 390 pixels. It has safe outer insets and a fixed top and bottom bound. The editor comes first, then Expected result, then Your output. The two rendered previews are normally 112 pixels high, growing to 140 pixels on large displays. A short task description has a Read lesson action for the complete explanation through Mr. Rifky.

The drawer scrolls independently if its content is taller than the viewport. Its action row remains at its lower edge. Execute, hint, code example, and lesson actions use icons. Interacting with a sentry starts the challenge directly; reading with Mr. Rifky pauses the clock. Closing the drawer preserves the learner's code and leaves the bottom combat strip available. The fullscreen world does not shrink when the drawer opens.

On a phone the same drawer overlays the right side with a maximum width smaller than the viewport. It can close to expose the actors. The bottom technique strip stays within the viewport, and defense icons move above it. The document does not become a long webpage with the game at its top. Internal scrolling handles the drawer content; hiding page overflow is not a substitute for fitting interactive controls.

## Icon actions and tooltips

The user explicitly chose icon-only actions. Utility, technique, defense, and editor buttons therefore use recognizable SVG artwork with accessible names. Tooltip text carries the omitted labels and current costs or restrictions. Conversation buttons retain clear words such as Continue and Back because they are dialogue choices, not combat artwork.

Tooltips live outside the scrolling drawer in a fixed portal. Their maximum width is constrained to the viewport, and their coordinates are clamped away from all four edges. Hover and keyboard focus reveal them. The first touch explains an action; a second deliberate touch activates it. Locked skills remain focusable with an announced unavailable state so their explanation can still be read. Focus outlines remain visible.

## Mr. Rifky

Training, lessons, hints, and companion choices retain the visual-novel dialogue: dimmed world, large transparent portrait, speaker name, one short idea per page, and clear next or back actions. HTML examples show their code and actual rendered result. The mini character opens this same dialogue rather than a second textbook panel. Reading pauses combat and preserves the draft.

The audience is a learner aged around 12. Short instructions, optional more detail, and untimed reading reduce avoidable effort without claiming a universal attention limit. The companion rests in a static front pose, with at most a brief greeting. Healing states the amount and remaining use before the learner chooses it.

## Applied principles and provenance

[Recognition over recall](https://www.nngroup.com/articles/recognition-and-recall/) supports discoverable tooltips, shortcuts, and visible output comparison. [Visibility of system status](https://www.nngroup.com/articles/visibility-system-status/) supports actual resource values, cooldowns, incoming attacks, and validation feedback. [Proximity](https://lawsofux.com/law-of-proximity/) keeps techniques together, defense nearby, and the editor directly above its results.

The installed `ui-ux-laws` skill was read from `C:/Users/RifkyAs-Syudais/.codex/skills/ui-ux-laws/SKILL.md`. The recorded source is [AmirGhl/ui-ux-laws](https://github.com/AmirGhl/ui-ux-laws), pinned to `f11b3a20d2556790f7acecf2e1ebd3b8215cc197`. Installed antislop core, UI, human, and responsive guidance also applies during the work, following the user's established preference.

The dark scrims keep text readable over changing scenery. Core palette calculations on opaque `#15212d`: body text `#e4e9ed` is 13.34:1 and supporting text `#b9c8d4` is 9.54:1. Action text `#1a2026` on `#d0aa6b` is 7.54:1. These calculations are not a complete audit of every translucent composition.

The requested delivery check is one focused viewport-fit inspection after source integration and build, particularly at 1442 by 1075 and 1366 by 768. This document records the intended contract and the reported failure; it does not claim that a visual inspection has passed before its results exist.
