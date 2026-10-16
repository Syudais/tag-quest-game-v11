# Tag Quest
<!-- impeccable:product-schema 1 -->

## Platform
web

## Stack
Delegated by the user: Phaser 4, TypeScript, Vite, CodeMirror, parse5. The user asks for a current code-first game engine and explicitly authorizes coding subagents.

## Users and purpose
HTML learners play a small fantasy RPG. Keyboard exploration leads into encounters resolved by writing real HTML. Success means learning syntax and structure while finishing a playable campaign.

## Capabilities and constraints
Real sprite-sheet walking, attack, magic, hit, and death sequences. Multiple sourced scenery sets, separate walkable fields and fighting arenas. WASD/arrows and E interaction; ordinary game hotkeys stop while typing. Four biomes, 24 original HTML challenges including four boss capstones. Six skills with resource costs, cooldowns and level unlocks. XP, leveling, enemy pressure attacks, timed dodge/parry, speed-based critical opportunities and checkpoint retry. Browser-only gameplay with local progress. Original tutorial and lesson summaries link to W3Schools chapters rather than copying its course text.

## Brand commitments
Classic fantasy pixel-art game. Use verified free-to-use existing art. The user rejected the static-pose showcase. The player should see a real game, not an advertisement, slide deck, or dashboard.

## Evidence
Previously inspected OpenDuelyst CC0 sprite atlases and frame metadata in ../outputs/tag-quest-guidelines/research. The hero has 23 attack frames and casting sequences. Current work must inspect and package multiple environments.

## Product principles
The game leads the screen. Real source animation is required. Editor focus must never move the hero. Incorrect answers preserve work while creating a combat consequence. Tutorial reading pauses the combat clock. Defeat preserves completed encounters and offers retry. All scenes and assets work from a local build.

The game fills the viewport. A compact icon skill strip follows the lower edge, leaving the fighters visible. A narrow right overlay places the HTML editor above expected and actual previews; the panel can collapse without hiding skills. Gameplay buttons use icons with hover, keyboard-focus and touch tooltips explaining action, cost and availability. A Fullscreen control enters browser fullscreen from a user gesture. The two previews use identical sandboxed rendering rules, with decisions recorded in docs/UX_GUIDELINE.md.

Mr. Rifky leads all in-game tutorials, lessons, training and hints through video-game dialogue: a dimmed world, large portrait, short spoken pages and worked HTML with rendered examples. Click mini Mr. Rifky to call him. Reading pauses active coding and preserves the draft. A companion heal restores 20 HP once per encounter; the engine enforces the allowance across retreat and refresh. The guide stays still while the learner reads or types. This design targets upper-primary learners around age 12 without assuming one universal attention span.

Each successful action produces a fresh randomized question within the current topic and difficulty. Wrong attempts and timeouts retain the question and draft. Campaign progress remains 24 encounters and four guardians. Autocomplete, automatic tag closing and automatic bracket insertion are disabled.

The first-session welcome is a paused Mr. Rifky conversation with spotlights on the actual editor and rendered previews. Original training fixtures demonstrate headings, wrong elements and missing closing tags without using health, turns or campaign progress. Closing the tour restores the learner's editor state and draft. Encounter interaction now starts the question directly after the approach animation, without a second Begin control.

Music and combat effects are packaged locally. The supplied music remains separate from the downloaded CC0 effects. Sound follows a remembered mute preference, waits for a browser gesture, lowers during reading and pauses on hidden pages. The game communicates combat state visually as well as through sound.

The opening sequence is tutorial, Mr. Rifky's game and material overview, difficulty choice, then stage selection. Four chapter tabs expose six topic stages each. Actual campaign clears unlock the next stage; cleared stages can be replayed. Easy uses a 90-second base and Normal a 30-second base, multiplied by each task's syntax-complexity factor from ×1 to ×2.5. Menu and clock use the same timing table. After more than 30 seconds of active work on a question, Mr. Rifky offers one short structural hint without interrupting typing or resetting the timer.

A hidden local admin toggle unlocks all 24 stages for testing. A visible indicator identifies the mode once activated. Test clears and temporary character stats are separate from actual campaign progress and XP; exiting testing restores campaign stats and normal stage locks.
