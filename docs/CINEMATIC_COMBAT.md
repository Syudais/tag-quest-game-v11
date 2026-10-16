# Combat effects

Tag Quest keeps combat inside the world, with the HTML editor and previews steady beside it. Effects explain which skill fired, where it landed and whether the hit was critical.

## The action beat

1. **Charge.** A correct answer is acknowledged immediately. The spell name appears and energy gathers around the caster. Offensive magic darkens the surrounding battlefield briefly.
2. **Release.** A blade sweeps toward its target, fire travels across the field, ice bursts into shards, or thunder branches down from the sky.
3. **Contact.** The hit sound, target reaction, sparks and damage arrive together. A brief pause and small camera jolt give the hit weight; a critical hit has stronger feedback.
4. **Recovery.** Sparks fade, the target settles, the battlefield light returns and the next question becomes ready. Effects clear when leaving a fight, retrying or restarting.

These are short combat beats. Reading a tutorial or typing between turns does not trigger decorative particle bursts.

### Charged magic

Offensive magic now gathers energy before release. The actual cast sprite slows to 0.35 times its normal playback speed, energy motes converge toward the hands, ground runes brighten and an in-hand spell grows. The caster briefly holds the prepared pose before releasing at 1.2 times playback speed. Fire charges for 900 ms, Fira for 975 ms and Firaga for 1050 ms; ice and thunder use 900 ms. Fire and ice then fly for 220 ms. The spell name stays visible through the charge and release.

Only the caster animation slows. The HTML panels stay still and the coding clock is paused during the existing combat animation phase. Normal playback restores after release and on cancellation or changing scenes. Reduced effects uses a short 160 ms cue with no slow motion, held pose or converging particles. Heal and guard keep their brief calm preparation.

## Skills

| Skill | What you see |
|---|---|
| Blade strike | A curved bright arc, directional sparks and target recoil |
| Fire, levels 1–2 | A warm charge and a fire projectile that splashes into embers |
| Fira, levels 3–4 | A larger fire projectile and stronger ground splash |
| Firaga, levels 5+ | The largest fire projectile, heat ring and ember burst |
| Ice | A cold charge, sharp shards and a burst at the target |
| Thunder | Its name, a large branching sky-to-target bolt and a ground shock ring |
| Heal and guard | Calm rings that show recovery or protection |
| Incoming hit, dodge and parry | Distinct contact, avoidance or deflection feedback matching the result |

Fire, Fira and Firaga are names for the appearance of the existing fire skill at each hero level. They do not create extra skills or change its costs, cooldowns or damage rules. The same questions, difficulty, defense timing and progression apply in either effects mode.

## Choose the effects level

The **eye icon beside the sound control** toggles Reduced effects. It stays inside the game's upper utility controls.

| Mode | What changes |
|---|---|
| Cinematic effects | Full spell travel, charge and impact motion, with bounded camera shake and contact flashes |
| Reduced effects | Spell names and hit outcomes remain, with less travel, no camera shake and no bright flash |

A crossed eye and pressed button mean Reduced effects is on. Hover or focus the icon to read its tooltip. Keyboard users can Tab to it and press Enter or Space. On touch, tap once to read the tooltip and tap again to change the setting. A brief message confirms the selected mode.

The game remembers an explicit choice for this browser and site address. Before a choice is saved, it follows the device's reduced-motion setting, including changes while the game is open. A saved choice takes priority on the next visit. Sound has its own control.

## Artwork

Selected effects come from the user-supplied Ragnarok Online artwork. That material keeps its own provenance; it is not included in OpenDuelyst's CC0 license. See the asset manifest and third-party notices for copied sources, derived frames and licensing context.

## Focused control review

The effects control received a source review for this update, not a full browser or gameplay QA pass. The review checked a native 44 × 44 button, a stable accessible name with `aria-pressed`, the existing visible keyboard focus outline, tooltip handling for focus and two-tap touch activation, and the live status confirmation. The narrow-screen toolbar reserves two rows at widths of 400px or less and moves the status areas below it.

Preference restoration accepts both saved `true` and saved `false`; a saved Cinematic choice therefore takes priority even if the device requests reduced motion. The setting is passed to the game immediately after creation and again when it is ready. Without a valid saved value, the device preference supplies the default and remains active until the player chooses.

Calculated contrast for the new control is 6.95:1 for the selected gold icon and slash on its background, 13.34:1 for the normal icon on the toolbar's base color, and 9.63:1 for the gold focus outline against that base color. The tooltip text is 14.70:1 against its base color. The nearly opaque surfaces use the existing game palette. Actual touch behavior, viewport fit and combat appearance require browser checks; this source review does not claim those were run.
