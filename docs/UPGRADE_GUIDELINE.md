# Tag Quest upgrade guideline

## Environment and delivery

Keep the existing Phaser 4.2.1 + TypeScript + Vite 8 project. Phaser owns rendering, movement, animation and combat; CodeMirror owns HTML editing; parse5 validates element structure; Lucide supplies real SVG action icons. No database, account system, AI API key, Unity or Godot installation is needed.

This computer has Node.js 24 and npm. Project dependencies are restored with `npm.cmd ci`. Lucide was added through npm. The curated Playwright skill was installed for later browser work; it is not required to play. No additional MCP server is required by this implementation. Existing antislop skills guide the interface.

Build with `npm.cmd run build`, then serve the generated `dist/` through a local web server or static hosting. Direct `file://` launch is unsupported. `START_GAME.cmd` is the Windows entry point.

## Learning and combat loop

1. Walk with WASD, arrows or the on-screen controls. Approach a sentry and interact.
2. Read the short lesson. Reading and tutorial dialogs pause combat.
3. Begin the challenge, select an available skill, and write the required HTML.
4. Submit correct markup to perform that skill. A fast unassisted answer has a greater critical-hit chance.
5. Mistakes create an enemy critical opportunity. Staying in the active challenge too long also triggers an enemy attack.
6. An attack telegraph briefly opens Dodge and Parry controls. Dodge consumes stamina; parry needs more precise timing.
7. Earn XP for winning, increase level and resources, and unlock additional skills. Complete five sentries and a guardian per region.

Four regions, 24 encounters, four guardian capstones. The final goal is to restore the Codex by completing the HTML campaign. Guardian battles take several actions instead of one automatic finisher.

## Skill direction

Six choices: a free blade attack, fire, ice, lightning, healing and guarding. Each has a recognizable icon, written name, resource requirement and availability state. Offensive spells should differ in effect rather than only animation color. Healing and guarding trade offensive tempo for survival. Exact costs, cooldowns, damage and unlock levels live in the combat source so the UI can display the same values.

## Balance targets

- A normal answer remains useful even when it is slower.
- Fast correct answers improve critical odds; they do not guarantee a critical.
- Wrong markup preserves the draft and explains the problem.
- Tutorial reading is safe. The active combat clock starts only after the learner begins.
- Defeat offers a checkpoint retry and preserves completed lessons.
- Existing browser saves should retain completed encounters.

## Components and ownership

- `src/game.ts`, `src/combat.ts`, `src/types.ts`: authoritative combat clock, facing, skills, progression and saves.
- `src/components/`, `src/main.ts`, `src/styles.css`: icon action controls, resource HUD, reaction controls, onboarding and editor integration.
- `src/lessons.ts`, `src/challenges.ts`: original teaching text, source references and semantic HTML validation.
- `docs/LEARNING_PATH.md`: ordered learning foundations and challenge references.

The coordinating agent owns scope, contracts, environment and delivery. Three implementation agents own the engine, interface and lessons separately.

## Source policy

Use W3Schools as the structured reference. Write original summaries, examples and tasks and link to the matching chapter; do not scrape and redistribute its course or exercise collection. Preserve the existing CC0 OpenDuelyst art provenance. Lucide's ISC/MIT notices ship alongside the assets.

Primary references:

- [Phaser sprite components and flipping](https://docs.phaser.io/phaser/concepts/gameobjects/components)
- [W3Schools HTML introduction](https://www.w3schools.com/html/html_intro.asp)
- [W3Schools HTML basics](https://www.w3schools.com/html/html_basic.asp)
- [W3Schools terms](https://www.w3schools.com/about/about_copyright.asp)
- [Lucide packages](https://lucide.dev/packages)
- [Lucide license](https://lucide.dev/license)

## Delivery check

At the user's request, prioritize delivery without a pre-release QA pass. Run the production build and confirm the local server responds. Record that this is a limited build/launch check; do not claim a full gameplay, timing or browser validation pass.

## Current tuning

| Mechanic | Value |
|---|---|
| Active challenge pressure | Easy 90-second / Normal 30-second base × task factor (×1–×2.5); see STAGE_TIMING.md |
| Defense warning | 1 second; parry succeeds only in the final 350 ms |
| Dodge | Costs 15 stamina and avoids the hit |
| Successful parry | Avoids damage; restores 12 chakra and 10 stamina |
| Player critical chance | Unassisted answer within 8 s: 50%; within 18 s: 25%; otherwise 10% |
| Critical damage | 1.75 times normal; Storm adds 15 percentage points to critical chance |
| Wrong-answer opening | Enemy damage doubles if its attack is not defended |
| XP | 35 per sentry; 100 per guardian |
| Level threshold | 80 XP at level 1, then 35 more XP per following threshold |
| Level bonus | +12 maximum HP and +8 maximum chakra per level |
| Unlocks | Frost at level 2; Storm at level 3 |

A successful nonlethal action triggers an enemy counterattack, then a new coding turn. Existing saves keep encounter progress under the same browser-storage key. Old saves without XP begin at level 1; they do not receive retroactive XP. Browser save data remains specific to its original local address.

## Fullscreen dialogue and question revision

The canvas now fills the viewport while controls and HTML output float above the world. The lower editor can collapse; no separate webpage panel reserves canvas space. Browser fullscreen is entered only from the Fullscreen button. Mr. Rifky presents all tutorial, lesson, training and hint content through a large-portrait conversation over a dimmed world.

Each topic has six question variants (144 across 24 campaign checkpoints), selected through shuffled pools without immediate repeats. Successful actions request a new variant with its own starter, expected result, hint and semantic validator. Wrong submissions and timeouts retain the current question and draft. The engine's combat timing and XP tuning remain unchanged.

The editor now uses explicit CodeMirror extensions: syntax highlighting, line numbers, history and basic editing commands. Autocomplete, automatic tag closing and automatic bracket insertion are disabled. The unused codemirror umbrella package was removed; @codemirror/commands 6.11.1 and @codemirror/language 6.13.1 are recorded directly in package.json/package-lock.json.

## Compact layout and local-network handoff

The user chose icon-only gameplay buttons with tooltips. Six skills and two defensive actions occupy an independent compact bottom strip. A narrow right panel places the HTML editor above the expected and actual results; its footer owns a separate row at short desktop heights. Combat actors are anchored at logical x250 and580 so the right panel leaves their bodies visible. Source, timing, progression, randomized question and Mr.Rifky dialogue contracts remain unchanged.

The LAN launcher uses the same production files as local play. Run START_LAN.cmd, keep the host computer awake and server window open, and use the network address printed by Vite on devices connected to the same network.

## Audio and first-session guide

The browser stack remains unchanged; no extra application installation is needed. The supplied music and 15 curated sound-effect cues are local assets, with sources and separate music provenance in docs/AUDIO.md. A shared browser audio mixer handles gesture unlock, mute preference, reading volume, hidden-page pause and limited overlapping effects.

Entering an encounter now starts the question automatically after the approach animation. The welcome tour uses pure HTML training fixtures, actual component spotlights and a large Mr. Rifky portrait over a dimmed world. Gameplay stays paused until the guide closes. The complete editor state, including history and selection, is restored afterward; the tour does not change HP or campaign progress. See docs/TUTORIAL.md for the teaching sequence and contract.
