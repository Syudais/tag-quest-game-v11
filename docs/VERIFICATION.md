# Verification record

Completed 15 October 2026 on this computer.

## Build and dependency checks

- TypeScript type check and Vite production build passed.
- 31 Vitest tests passed for the 24 HTML challenge definitions, expected solutions, incorrect markup, and accepted valid alternatives.
- Package audit reported zero known vulnerabilities after updating Vite and Vitest to the selected current releases.
- The production JavaScript bundle includes Phaser and CodeMirror and is approximately 610 KB compressed. Vite reports an advisory about its uncompressed chunk size; this is not a build failure.

## Engine gameplay test

A coding subagent ran an isolated browser test against the actual local game. It completed all 24 encounters through the engine API, including all four bosses and all three moves. This verifies the game sequence separately from HTML validation; it is not a claim that a human typed all 24 answers in that test.

Verified enemy opening attack, player attack/cast/renew, hit and death sequences, once-only challenge increments, boss health restoration, region unlocks, final victory, and completed-save reload. Keyboard movement and the editor focus gate also passed. No engine runtime errors were reported.

## Interface browser test

`tools/browser-check.cjs` checked:

- Actual keyboard movement in the scene.
- Typing inside CodeMirror without moving the hero.
- Incorrect HTML preserving encounter progress.
- Example insertion and a correct HTML submission completing an animated encounter.
- World-map images loading, help and credits dialogs, Escape dismissal, sound toggle, and save reload.
- Desktop and phone exploration and encounter views.
- No horizontal overflow in the inspected phone viewport.
- No page errors or browser console errors in the passing run.

Screenshots and browser results are stored in `.impeccable/review/`. The test uses the bundled development browser-automation dependency path for this computer; normal gameplay does not need that tool.

## Asset checks

The asset subagent verified 450 real frames across five actors, populated animation groups, all local environment images, and recorded source hashes. See `docs/ASSETS.md`, `ASSET_MANIFEST.json`, and the local CC0 notice. The game uses sourced painted platforms with walking bounds rather than drawing a substitute floor.

## Design checks

An independent finish reviewer inspected desktop exploration, desktop encounter, phone exploration, phone encounter, and the world map. Disposition: **ship**, with no required material fixes.

The one mechanical warning concerns width transitions on small health/progress bars. The reviewer classified it as non-material. Mobile uses a stacked workbench and therefore requires vertical scrolling during encounters.

The antislop gates passed within this game's scope: sourced assets and explicit licenses; working local controls; actual gameplay and animation; no invented product claims; meaningful loading/empty/error feedback; native keyboard controls and focus; responsive layouts; and an intentional source-art-based visual direction. The confirmed direction is recorded in `DESIGN.md` and `.impeccable/design.json`.

## October 2026 combat update

Production build passed on 15 October 2026 using `npm.cmd run build` (TypeScript and Vite). The updated Documents project was served at http://127.0.0.1:4173/ and its entry page and icon license returned HTTP 200. Vite reports a bundle-size advisory; it does not block the build.

Per the user's request to prioritize delivery, this update did not receive a full gameplay, visual, browser or combat-balance QA pass. The older verification notes describe the previous release and should not be read as new verification of the updated combat.

## In-game UI and mentor update

Production build passed on 15 October 2026 with TypeScript and Vite. The new frame layout, shared expected/actual preview components, mentor dialogue, tutorial render and limited-heal API are included in that build. Transparent portrait and spritesheet derivatives are packaged under public/assets/mentor; their PNG metadata reports an alpha channel with transparent corner pixels.

No browser/gameplay QA sweep was run, as requested. The build emits the existing non-blocking bundle-size advisory. Do not interpret source integration or a successful build as fresh visual, usability, timing or learning-outcome validation.

## Fullscreen game and randomized questions (v4)

The production build passed on 15 October 2026 with `npm.cmd run build`. It includes the fullscreen/resizing canvas, translucent overlays, Mr. Rifky conversation component,144 topic-matched question variants and explicit CodeMirror configuration without completion or automatic closing. npm records the editor command/language packages directly, and the obsolete codemirror umbrella package is removed.

This was a compilation and bundling check only. No fresh browser/gameplay QA sweep was performed. Vite continues to report its non-blocking bundle-size advisory. Historical launch/visual notes above apply to their respective earlier versions.

## Compact combat UI and LAN hosting (v5)

Production build passed on 15 October 2026. Focused in-app-browser inspection checked the battle layout at1442x1075 and1366x768. The initial laptop check found the sticky footer covering part of the actual preview; a short-height stylesheet refinement corrected it. In the final1366x768 view, the editor and both preview frames are96pxhigh, the actual preview ends at646.95px and the separate footer begins at694px. The64px bottom action strip and right panel stay inside the viewport. The scene leaves both fighters clear of the coding panel. A skill tooltip was visibly inspected while the skill was unavailable.

Screenshot: `docs/screenshots/v5-battle-1366x768.jpg`. This is a focused layout/tooltip check, not a full gameplay, accessibility, mobile or campaign QA pass.

The current preview server listens on0.0.0.0:4173. The Ethernet address http://192.168.7.113:4173/ returned HTTP200 on this computer. Existing Windows Node.js inbound rules already allow private networks; firewall settings were not changed. Another physical device was not used for remote verification. `START_LAN.cmd` and `npm.cmd run lan` provide a repeatable local-network launch.

## Actor facing and battlefield companion (v6)

Production build passed on 15 October 2026. The actor atlases were visually inspected to record their native direction individually. A focused browser loading check showed the corrected golem facing and the real Phaser Mr. Rifky sprite. The check caught an off-platform battle position, which was moved beside the hero before the final successful build. The final exploration screenshot is `docs/screenshots/v6-companion.jpg`.

The LAN server still listens on 0.0.0.0:4173, and the new mentor atlas returned HTTP 200. Easy mode's automatic healing and shared encounter allowance are implemented and documented in `COMPANION.md`; they did not receive a full gameplay or balance QA pass. No broad QA sweep was run.

## Audio and guided welcome (v7)

Production build passed on 15 October 2026 after the final comparison spotlight change. All 16 packaged audio files match their provenance hashes. The original and packaged user music hashes match, and the audio agent confirmed valid MP3 metadata for all 16 files. All 16 audio URLs returned HTTP 200 from the existing LAN server. Download caches are outside public runtime assets and excluded from the release ZIP.

Focused in-app-browser inspection at 1366 by 768 confirmed the welcome, editor spotlight, and final Expected/Your output comparison spotlight with the large Mr. Rifky portrait and reachable navigation. Screenshots are `docs/screenshots/v7-editor-tutorial.jpg` and `docs/screenshots/v7-output-tutorial.jpg`. Source review confirmed that the tour restores the full editor state, suppresses training autosaves, pauses the clock through transitions, and makes no health, progress or combat submissions. The separate Begin control and practiceStarted gate are removed; encounter readiness now releases automatically after its question is presented.

This is a build, media, source and focused tutorial layout check. It is not a full gameplay, audio listening, loudness, accessibility, mobile or campaign QA pass. The existing non-blocking bundle-size advisory remains.

## Difficulty, start flow and stage menu (v8)

Production build passed on 15 October 2026 after a focused preview caught and corrected field text that used campaign completion instead of the selected test stage. The final TypeScript and Vite build includes Easy's 90-second turn budget, Normal's 30-second budget, the one-reminder-per-question trigger after 30 active seconds, and the battlefield speech-bubble API.

A separate local preview origin was used so the user's LAN save and new setup flag stayed untouched. The browser walkthrough confirmed Tutorial Skip → six-page material overview → required difficulty choice → stage menu. At 1366 by 768, the menu showed four chapter tabs, six stages, normal future locks, a topic/source detail, and a reachable Start/Continue footer. Five title-button activations visibly enabled admin mode; all final-chapter stages were available. Loading stage 24 showed a temporary level-4 character while campaign progress stayed 0/24. Starting the paragraph stage directly showed its correct topic and a 90-second clock, with no Begin control.

Screenshots: `docs/screenshots/v8-stage-menu.jpg` and `docs/screenshots/v8-easy-timer.jpg`. Source review covered paused setup transitions, selected-stage question mapping, campaign snapshot isolation, and separate test drafts. The 30-second hint trigger and bubble lifetime were reviewed in source; a timed hint appearance and all 24 stage clears were not exercised. This is a focused build/menu/launch check, not broad gameplay, timing, accessibility or campaign QA. The LAN server remains on 0.0.0.0:4173 and returned HTTP 200.

## Remaining sprite inversion and task-scaled timers (v9)

Production build passed on 15 October 2026. Fresh source-art inspection covered all six animation groups for the hero and four enemies, plus every enemy attack frame. Enlarged original/mirrored views corrected the earlier Chaos Knight interpretation: its source face and strike point right. Runtime metadata now mirrors it toward the hero. Enemies retain that facing during their guarded retreat, and strike feedback follows the documented source impact frame. See `FACING_AUDIT.md` and the evidence sheets in `screenshots/facing-audit/`.

The timer uses one shared 24-stage table: Easy's 90-second base or Normal's 30-second base multiplied by the task's factor. Source review covered initial load, fresh turns, counterattack recovery, difficulty changes, retry, stage selection and restart; Frost's extra eight seconds remains separate. Stage-menu and engine totals share the same helpers. The existing 30-second hint threshold and speed-critical windows remain unchanged.

A focused 1366-by-768 preview on a separate local origin confirmed the final-stage menu shows Easy 90 × 2.5 = 225 seconds without clipped navigation. The final guardian visibly faces the hero in its selected field. Evidence: `screenshots/v9-task-multiplier.jpg` and `screenshots/v9-guardian-facing.jpg`. The user's LAN campaign remained at its existing two clears in the final menu. This is an asset/source, build and focused rendering check; no full campaign or browser combat replay is claimed.
