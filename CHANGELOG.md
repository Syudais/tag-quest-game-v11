# Tag Quest changelog

Player-facing release history, newest first.

This history was reconstructed from the deployed release notes, verification records, archived ZIPs and delivery conversation. The original build had no explicit version label; it is listed below as the initial release rather than assigning a new historical version. v2 and v3 were cross-checked against their archived documentation.

## Release index

| Release | Main change |
|---|---|
| v11 | Slow-motion charging and fast spell release |
| v10 | Cinematic impacts and Ragnarok spell effects |
| v9 | Remaining enemy facing fixes and task timer multipliers |
| v8 | Difficulty, ordered introduction, stage selection and admin testing |
| v7 | Local music, combat sound effects and guided welcome |
| v6 | Battlefield Mr. Rifky, healing and initial facing corrections |
| v5 | Compact icon controls, unclipped battle layout and LAN hosting |
| v4 | Fullscreen world, mentor dialogue and randomized questions |
| v3 | Mentor artwork, rendered learning examples and comparison previews |
| v2 | Expanded combat, leveling and timed defense |
| Initial release, unnumbered | First playable four-land HTML adventure |

## v11 · Charged magic

**Added**

- Offensive magic slows the caster's real animation to 0.35× while energy gathers into the hands.
- Converging motes, illuminated ground runes, growing spell energy and a brief held casting pose.
- Fire/Fira/Firaga charge for 900/975/1050 ms; ice and thunder charge for 900 ms.
- Fire and ice release over a fast 220 ms flight. Spell names remain visible through charging.
- Reduced effects uses a short 160 ms preparation without slow motion or charge particles.

**Fixed**

- Restore caster playback speed and pause state after release, cancellation or scene changes.
- Prevent a canceled action from restoring a caster belonging to a later action.

**Recorded checks:** production build passed; a focused Fire check observed charging, dimming, stationary HTML panels and a completed shot. No browser warnings or errors were recorded. Broader device/campaign checks were not run. [Release record](docs/RELEASE_V11.md).

## v10 · Cinematic combat

**Added**

- Coordinated wind-up, release, contact and recovery for battle actions.
- Slash arcs, sparks, target blinking, recoil, short actor hit pauses and stronger bounded camera shake.
- Battlefield dimming during magic while actors and spell effects remain visible above it.
- Fire/Fira/Firaga visual tiers at levels 1–2, 3–4 and 5+, with increasing projectile size and fire splash. Existing skill costs, cooldowns and damage stay unchanged.
- Large branching thunder, ice bursts and distinct healing, guard and defense feedback.
- 52 isolated effect frames copied from three user-supplied Ragnarok sheets: Shadow Slash, Various Effects and Energy. Source originals are unchanged and retain separate provenance.
- A remembered Reduced effects control beside sound; the HTML editor and previews remain steady.

**Fixed**

- Corrected the dim layer's transparency and replaced the initial hard circular fire core with the sourced animated projectile.
- Clear temporary effects, actor changes and owned timers when leaving or resetting a scene.

**Recorded checks:** production build, asset references and copied source hashes passed. Focused Fira/Thunder fights, counterattack recovery and setting restoration were checked with no recorded browser warnings/errors. [Release record](docs/RELEASE_V10.md), [asset provenance](docs/CINEMATIC_ASSETS.md).

## v9 · Facing and task-scaled timers

**Fixed**

- Corrected the remaining Chaos Knight inversion after fresh source-frame inspection. Its original sprite faces right and must be mirrored toward the hero.
- Enemies retreat while continuing to face the hero.
- Incoming hit feedback follows each enemy's actual attack impact frame and permits the visible strike to complete.

**Changed**

- Multiply Easy's 90-second or Normal's 30-second base by a per-task syntax-complexity factor from ×1 to ×2.5.
- Share the same timing table between engine and menu; show each task's multiplier and total.
- Give the final form task 225 seconds on Easy or 75 seconds on Normal. Preserve Frost's extra eight seconds and the existing hint/critical thresholds.

**Recorded checks:** production build passed; hero/enemy animation sources were inspected, and a focused preview confirmed final-guardian facing and the final-stage budget. [Facing audit](docs/FACING_AUDIT.md), [timing table](docs/STAGE_TIMING.md).

## v8 · Difficulty and stage menu

**Added**

- Ordered first-run flow: tutorial → game/material overview → difficulty choice → stage selection.
- Easy's 90-second base turn budget and Normal's 30-second base, later extended by v9's multipliers.
- One short Mr. Rifky hint after more than 30 seconds of active work on each question.
- Four chapter tabs with six stages each, HTML topic descriptions, W3Schools source links and sequential stage locks.
- Cleared-stage replays and a hidden admin toggle: activate the Tag Quest menu title five times to unlock all stages for testing.
- Separate test progress, drafts and temporary character stats; testing does not advance the actual campaign.

**Fixed**

- Field text now describes the selected test stage rather than the campaign's current encounter.

**Recorded checks:** production build and focused start-flow/menu/admin/launch checks passed on a separate origin. The timed hint and all 24 stage clears were not replayed. [Start-flow guide](docs/START_FLOW.md).

## v7 · Audio and guided welcome

**Added**

- The supplied Iron Under Winter Skies music track as a local looping asset.
- Fifteen local sound-effect cues covering skills, impacts, defense, movement and outcomes, with source/license records.
- Remembered mute, browser-gesture audio unlock, lower music during reading, hidden-tab pause and capped effect voices.
- A paused Mr. Rifky welcome tour that dims the world and spotlights the editor, Expected result and Your output.
- Rendered HTML training examples that preserve the learner's own editor state and draft.

**Changed**

- Removed the separate Begin challenge button; interacting with an opponent starts the question directly after the approach.

**Recorded checks:** production build, hashes and HTTP availability for all 16 audio files passed. Focused tutorial spotlight checks passed; no complete audio-listening or campaign check was recorded. [Audio guide](docs/AUDIO.md), [tutorial guide](docs/TUTORIAL.md).

## v6 · Battlefield companion

**Added**

- A real animated Mr. Rifky sprite inside the battlefield, with walking, cheering and click-to-talk behavior.
- Easy-mode automatic healing of 20 HP when health falls to 40%, sharing the once-per-encounter allowance.

**Fixed**

- Initial per-actor facing corrections and a companion position that placed him off the platform.

**Known at this release:** the final guardian's source direction was misread. v9 corrected that remaining inversion.

**Recorded checks:** production build and a focused field/companion rendering check passed. Automatic healing was reviewed in source, not fully exercised. [Companion guide](docs/COMPANION.md).

## v5 · Compact controls and LAN sharing

**Changed**

- Reworked the battle composition toward the requested Ninja Saga reference: compact status areas, an open battlefield and a lower skill-icon strip.
- Icon-only clickable controls with hover/focus/touch tooltips.
- Positioned the HTML writer above vertically separated expected/actual previews inside the floating right overlay.

**Fixed**

- Corrected clipped controls and a footer covering the actual-output preview on laptop-height screens.
- Kept fighters clear of the coding panel.

**Added**

- LAN serving on 0.0.0.0:4173 and a repeatable START_LAN.cmd launcher.

**Recorded checks:** production build, focused 1442×1075 and 1366×768 layout checks, tooltip inspection and host-side LAN HTTP checks passed. No second physical device was used for verification. [UI guideline](docs/UX_GUIDELINE.md).

## v4 · Fullscreen dialogue and fresh questions

**Added**

- A viewport-filling, resizing game world with floating controls, collapsible coding controls and browser fullscreen.
- Large Mr. Rifky portrait conversations over a dimmed world for tutorials, lessons, training and hints.
- Six randomized variants per topic, 144 in total. Each successful action selects a fresh question; wrong attempts and timeouts retain the question and draft.

**Changed**

- Disabled autocomplete, automatic closing tags and automatic bracket insertion.
- Replaced the unused CodeMirror umbrella package with explicit editor dependencies.

**Recorded checks:** production compilation and bundling passed; no fresh browser/gameplay sweep was recorded.

## v3 · Mentor and learning interface

**Added**

- Transparent mentor portrait and a packaged 36-frame spritesheet derived from the supplied artwork.
- Tutorial mentor presentation, rendered HTML examples, optional hints and a limited 20 HP healing action.
- Shared expected/actual HTML preview components and in-game learning controls.
- Reading pauses combat and preserves the learner's draft.

**Recorded checks:** production build passed and PNG transparency metadata was checked. Scope confirmed against the v3 archived README and verification record; no new gameplay sweep was recorded for that release. [Mentor asset guide](docs/MENTOR_ASSETS.md).

## v2 · Expanded combat and progression

**Added**

- Six skills: blade strike, fire, ice, lightning, healing and guard, with chakra costs, cooldowns and level unlocks.
- XP, level-ups, increased maximum health/chakra and checkpoint retries that preserve completed encounters.
- Enemy pressure attacks, counterattacks, limited-time dodge/parry and stamina use.
- Higher critical-hit chances for fast unassisted answers; wrong HTML creates an enemy critical opening while preserving the draft.
- Structured HTML lessons and W3Schools chapter references, with reading pauses.
- Initial corrections to left/right movement animation.

**Recorded checks:** production build and local HTTP launch passed. Scope confirmed against the v2 archived README and combat guideline. The initial release's tests were not rerun as a full v2 QA pass.

## Initial release · First playable adventure

This release was delivered before explicit v2 numbering; no separate v1 label is asserted.

**Added**

- A playable Phaser/TypeScript browser game with keyboard and click movement, real animated characters and turn-based HTML encounters.
- Four fantasy lands with separate exploration backgrounds, walkable platforms and fighting grounds.
- Twenty-four HTML challenge checkpoints, four guardian capstones and basic attack/magic/recovery actions.
- CodeMirror HTML editing, safe rendered output, semantic validation, hints, map, help, credits and local browser saves.
- Locally packaged OpenDuelyst art, fonts, source records and license notices.

**Recorded checks:** the initial verification record reports 31 validator tests, an engine-API completion of all 24 encounters, keyboard/editor checks and desktop/phone browser checks. These checks belong to that initial build and do not establish that later versions received the same coverage.

## Deployment and archive notes

- Local/LAN hosting serves the latest dist build on port 4173. A query such as ?v=9 is a release label/cache hint, not a historical build selector; it does not restore old code.
- ZIP archives v2 through v11 were present when this changelog was assembled. They contain the source and built game for those archived releases. This changelog is a separate Markdown file; the archives were not updated.
- Historical archives are retained unchanged. The documentation update does not introduce a new gameplay release or change package.json's existing package version.
- Verification details for the early releases through v9 are in [the cumulative verification record](docs/VERIFICATION.md). v10 and v11 have their own linked release records above.
- W3Schools supplies the referenced learning structure and chapter links. Tag Quest uses original task/lesson text; it does not contain a scraped copy of the course.
