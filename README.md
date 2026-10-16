# Tag Quest: The Fractured Codex

A playable HTML-learning fantasy RPG built with Phaser 4.2.1, TypeScript, Vite 8, CodeMirror 6, and parse5. Explore four floating lands, complete 24 encounters with 144 randomized HTML question variants, and defeat four guardians using real sprite-frame attacks and spells.

## Start on this computer

Double-click `START_GAME.cmd`. It checks the project dependencies, builds the game, and opens the local production preview in your browser. Keep its terminal open while playing.

Alternatively, open PowerShell in this folder:

```powershell
npm.cmd ci
npm.cmd run build
npm.cmd run preview -- --port 4173 --open
```

The local address is normally `http://127.0.0.1:4173/`. If that port is in use, Vite prints an available port and opens that address instead.

To share on the local network, double-click `START_LAN.cmd` or run `npm.cmd run lan` after building. The current computer's Ethernet address is `http://192.168.7.113:4173/`; devices on the same network can open it in a browser. Vite prints the current network address when it starts, which may change if the router assigns another address. Keep this computer awake and the server running while others play. Localhost remains available on this computer.

Node.js 24 LTS, npm, and Git were already available on this computer. No desktop game engine, paid sprite editor, database, or AI API key is required to play or develop this project. The first dependency installation needs an internet connection. The built game packages its own artwork and fonts locally.

## Controls

| Input | Action |
|---|---|
| WASD / arrows | Walk on the current platform |
| Shift | Walk faster |
| Click or tap ground | Walk toward that point |
| E / interaction button | Challenge a nearby sentry |
| 1–6 | Select an unlocked skill outside text inputs |
| Alt+Q / Alt+F | Dodge / parry during an incoming attack |
| Fullscreen button | Enter or leave browser fullscreen |
| Eye icon beside sound | Toggle Reduced effects; pressed means reduced |
| Code tab | Show or collapse the floating editor |
| Ctrl+Enter / Cmd+Enter | Execute your answer from the editor |
| Escape | Leave the editor, close a dialog, or open help |

Phone controls include a direction pad and interaction button. The game disables movement while typing. Text selection and arrow-key editing remain normal inside the editor.

## Gameplay

First launch follows **Tutorial → Mr. Rifky's game and stage-material overview → Difficulty → Stage menu**. Skipping the tutorial still takes you through the overview and difficulty choice. Returning players open the stage menu and can replay the introduction. Your existing campaign save is retained.

The menu has four chapter tabs with six stages each. Stage cards name the HTML topic and show cleared, next, or locked status. Completed stages and the next uncleared stage are available in normal play. Select an available stage and use Start/Continue to enter its field. See [the start-flow guideline](docs/START_FLOW.md) for the stage-to-material map.

Walk up to the sentry, press E, and complete the HTML objective. The exploration backdrop changes to the region's fighting ground. The editor shows your markup and a safe rendered preview.

The world fills the viewport. A compact icon action bar sits along the bottom, while the right-side coding panel places the HTML editor above **Expected result** and **Your output**. Hover or focus an icon to read its name, cost, shortcut and availability; touch users can inspect its tooltip. The coding panel can collapse to expose the world. Use **Fullscreen** to enter browser fullscreen, or play in the full-window layout. Compare the text, order and structure in the two previews, then use the objective and hint to check HTML details that may look identical.

Interacting with a sentry starts its challenge directly. Open Mr. Rifky's dialogue whenever you want to read with the combat clock paused. Correct HTML performs your selected skill; enemies need multiple actions to defeat. Choose a blade strike, fire, ice, lightning, healing or guard. Skills have chakra costs, cooldowns and level requirements. Blade strikes and guarding recover resources.

Each successful action readies a different randomized question within the current topic and difficulty. Wrong answers and timeouts keep the current question and draft. Fast unassisted answers improve your critical-hit chance. An incorrect submission gives the enemy a critical opening. Taking too long triggers a pressure attack. Incoming attacks offer a brief dodge/parry window; dodge costs stamina and parry requires precise timing. Tutorial and lesson reading pause the fight.

Wins award XP. Leveling increases maximum health and chakra and unlocks additional spells. Each region contains five practice encounters and one boss capstone. Defeat offers a checkpoint retry; completed encounters remain saved. Defeating a boss unlocks the next land.

Progress saves automatically in this browser. Use **How to play → Reset progress** for a new run. Browser storage belongs to the local site address; switching ports or hosts starts a separate save.

## Four environments

| Region | Walking field | Fighting ground |
|---|---|---|
| Verdant Ruins | Green ruin panorama and carved stone platform | Jungle-and-cloud arena |
| Frostfall Citadel | Frostfire skyline and ice platform | Frozen temple arena |
| Ember Reach | Highland panorama and red-rock platform | Redstone arena |
| Hollow Gate | Woodland gate panorama and crystal platform | Violet crystal arena |

Every region has an actual sourced painted floor with bounded movement, a separate exploration image, and a separate battle image. Characters are side-facing three-quarter fantasy sprites; moving vertically does not introduce a missing north-facing sprite set.

See [asset sources and animation counts](docs/ASSETS.md), [license notices](THIRD_PARTY_NOTICES.md), and `ASSET_MANIFEST.json` for pinned source revisions and hashes. OpenDuelyst art is **CC0**, Phaser is **MIT**, and the Cinzel font is **SIL OFL**. The supplied Ragnarok Online combat effects retain their separate commercial-game provenance and are not covered by the CC0 artwork license.

## Development

```powershell
npm.cmd run dev
npm.cmd test
npm.cmd run build
```

- `src/game.ts`: Phaser scenes, keyboard and click movement, animation, turns, progression, and saves.
- `src/combat.ts`: shared skill definitions, resource costs, unlocks and combat timing.
- `src/challenges.ts`: original HTML tasks, hints, solutions, and semantic validation.
- `src/questionVariants.ts`: six randomized variations per topic, with matching semantic validators and shuffled selection.
- `src/lessons.ts`: original lesson explanations and W3Schools chapter references.
- `src/components/`: reusable skill, combat and learning controls with Lucide icons.
- `src/main.ts`: CodeMirror workbench, safe preview, map, menus, and UI state.
- `src/styles.css`: responsive game interface.
- `public/assets/manifest.json`: environment and animation loader contract.
- `tools/`: source asset import, atlas conversion, and verification utilities.

Vite runs the local development server; `dist/` contains the production files. The source code is editable and does not depend on an AI service at runtime. HTML topics link to W3Schools; its lesson and exercise collection was not scraped or copied.

See [the upgrade guideline](docs/UPGRADE_GUIDELINE.md) for the environment, combat design and delivery scope, and [the learning path](docs/LEARNING_PATH.md) for the teaching sequence. The current update receives a production build and local launch check, without a full gameplay QA pass, as requested.

The [UX guideline](docs/UX_GUIDELINE.md) records the in-game control layout, comparison previews and psychology-informed design decisions. The UX update receives a production build check; no browser QA sweep is claimed.

Mr. Rifky walks inside the world as a sprite companion. Click him, or use the Call Mr. Rifky icon, to open tutorials, lessons and hints as video-game dialogue: a dimmed world, large portrait, short spoken explanation, and rendered HTML examples. Reading pauses combat and preserves your draft. He briefly cheers after a correct action and keeps still while you read.

The welcome tour introduces the goal, movement, and coding through Mr. Rifky. It spotlights the actual editor, Expected result, and Your output one at a time while the world is dimmed and combat is frozen. A heading example shows how HTML becomes a rendered result, followed by a wrong element and a missing closing tag. Tour examples are temporary; finishing or skipping restores your own code. See [the tutorial guideline](docs/TUTORIAL.md).

Use the Difficulty icon to choose **Easy** or **Normal**. Easy starts with a 90-second base and Normal with a 30-second base. Each task applies a syntax-complexity multiplier from ×1 to ×2.5; the stage menu and clock show the actual allowance. For example, nesting repair gets 117 seconds on Easy, linked images get 162 seconds, and the final form gets 225 seconds. See [all stage timers](docs/STAGE_TIMING.md) for the shared table. In Easy mode, Mr. Rifky automatically restores 20 HP when your living hero reaches 40% health or lower during active combat. It uses the same once-per-encounter allowance as his manual heal. Normal mode keeps healing manual. Changing modes does not refill the allowance or revive a defeated hero. The transparent portrait and 36-frame spritesheet are included under `public/assets/mentor/`; see [mentor assets and learning design](docs/MENTOR_ASSETS.md) for their source, frame layout and editing prompts.

After more than 30 seconds of active work on a question, Mr. Rifky offers one short, topic-matched speech bubble, such as `Remember <p> and </p>.` Reading and menu time do not count. The reminder does not submit an answer or restart the enemy clock.

The editor supports syntax highlighting and undo, but has no autocomplete suggestions, automatic closing tags or automatic bracket insertion. Students write the syntax themselves.

## Admin stage testing

In the stage menu, click the **Tag Quest title/emblem five times** to enable admin mode. Keyboard users can focus that button and activate it five times; Ctrl+Shift+A is an additional shortcut where the browser allows it. A visible **ADMIN TEST MODE** label and **Exit admin** control appear.

Admin opens all 24 stages with a temporary test loadout. Test attempts and clears have separate session badges; they do not mark skipped campaign stages complete or award campaign XP. Normal replays also preserve campaign progression. Exit admin and choose the next campaign stage to resume ordinary play with the saved character stats and locks restored.

## Music and sound effects

The game includes the supplied `Iron_Under_Winter_Skies.mp3` as looping music and a local selection of combat and progression effects. The sound icon controls music and effects together and remembers the choice. A fresh browser preference enables sound after the first click or key press, subject to the browser's playback policy. Music lowers during reading and pauses when the page is hidden. Sound is optional; combat warnings and results also remain visible.

The downloaded effects use CC0 sources; the supplied music retains its separate provenance. See [audio sources and event mappings](docs/AUDIO.md), [license notices](THIRD_PARTY_NOTICES.md), and `public/assets/audio/sources.json`. These features need no additional application installation or audio API key.

## Combat effects

An accepted answer starts a brief charge, then releases the selected strike or spell. Contact brings the hit sound, sparks, recoil and damage together before the next question. Magic darkens the battlefield around the action while the coding panel stays still. Thunder branches from the sky into a ground shock ring. Fire grows with your hero: **Fire** at levels 1–2, **Fira** at 3–4, and **Firaga** at 5+. These are visual tiers of the existing fire skill; its cost, cooldown and damage rules stay the same.

Use the **eye icon beside sound** to switch between **Cinematic effects** and **Reduced effects**. Cinematic shows the full spell travel and impact motion. Reduced keeps spell names and hit outcomes, with less travel, no camera shake and no bright flash. Its crossed eye and pressed state mean Reduced is on. Hover or keyboard focus explains the control; on touch, tap once to inspect and again to change. Tab to it and press Enter or Space to toggle with a keyboard.

The choice is remembered in this browser. Before you choose, the game follows your device's reduced-motion preference. Changing effects leaves the challenge, clock and saved campaign alone. See [the combat effects guide](docs/CINEMATIC_COMBAT.md) for action details.

## Publish later

Upload the contents of `dist/` to a static web host. Players need only a modern browser. The game uses relative asset paths so deployment under a project subdirectory works. Keep all assets and license files together.

This is a browser game, so serve it through a local web address or a website. Double-clicking `dist/index.html` through `file://` is not a supported launch method. `npm run preview` is for local play and review, not a public production server.

## Scope

The build contains four regions and 24 topic checkpoints, including four capstones, with six randomized question variants per topic. It is a small educational game with bounded platform exploration and one enemy encounter at a time. It does not contain a large open world, multiplayer, account sync, or generated lessons.

The art was released by Counterplay Games with OpenDuelyst. Tag Quest is an independent learning project and is not an official Duelyst product.
