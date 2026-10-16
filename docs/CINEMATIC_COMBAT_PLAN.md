# Cinematic combat plan

Requested on 16 October 2026. Keep the fullscreen floating RPG interface, HTML learning flow, stage timing, damage balance, saves and directional sprite fixes.

Reading: a fantasy HTML learning game for roughly age 12, using pixel sprites and coordinated battle feedback. Energy 3 / Rhythm 2 / Motion 3. The battlefield carries spectacle; the editor remains still and readable.

## Action sequence

1. Anticipation: acknowledge the accepted answer immediately, show the spell name, and briefly charge at the caster. Magic dims the battlefield behind the active actors and effects.
2. Release: sword arc, traveling fireball, ice burst or branching thunder. Fire names progress with hero level: Fire at levels 1–2, Fira at 3–4, Firaga at 5+. These are visual tiers of the existing flame action, with existing costs, cooldowns and damage.
3. Contact: synchronize the visible hit with sound, target blink, short actor hit pause, impact sparks and a capped camera shake. Critical hits have stronger feedback. No repeated full-screen strobe.
4. Recovery: sparks dissipate, recoil returns, dimming lifts, overlays clear and the next question becomes ready. Cancel transient effects safely on travel, retry, restart and scene shutdown.

## Per-action identity

- Slash: bright curved arc, directional sparks and recoil.
- Fire: warm charge, increasing projectile size, ground splash, embers and heat ring.
- Ice: cold charge, shards and a sharp burst.
- Thunder: visible name, sky-to-target branching bolt, ground shock ring and short camera jolt.
- Heal and guard: calm readable rings instead of offensive flashes.
- Incoming hit, dodge and parry: distinct contact or avoidance cues, aligned with the existing defense outcome.

## Constraints

Keep effect duration bounded so typing is not delayed by long cutscenes. Effects use Phaser scene coordinates, avoid transforming DOM UI, respect reduced motion, and have a persistent reduced-effects control. Reduced mode retains spell names and hit outcomes with less travel, no camera shake and no bright flash. No particle bursts while reading tutorials or typing between turns. Keep the existing audio voice cap.

Copy only selected effects from the user-supplied Ragnarok Online directory into public/assets/effects/ragnarok; never alter that source folder. Document copied originals, derived atlases, frame rectangles, preprocessing and hashes. Do not label commercial-game artwork MIT or CC0; keep its provenance distinct in asset notices.

## Work split

- Asset agent: inspect source sheets, copy a small relevant set, isolate usable frames and publish an atlas manifest with provenance.
- Battle agent: implement a reusable cinematic controller and integrate its timing with existing hero/enemy actions and scene lifecycle.
- Interface agent: add the reduced-effects toggle and document the player-visible spell tiers and controls.
- Orchestrator: coordinate the interfaces, review integration, run the production build and focused effect checks, update the release ZIP and host on 0.0.0.0:4173.

## Research

- GDC, Game Feel: Why Your Death Animation Sucks: https://www.gdcvault.com/play/1022759/Game-Feel-Why-Your-Death
- Phaser camera shake: https://docs.phaser.io/api-documentation/4.0.0/class/cameras-scene2d-effects-shake
- Phaser particles: https://docs.phaser.io/phaser/concepts/gameobjects/particles
- Phaser blend modes: https://docs.phaser.io/phaser/concepts/display/blend-mode

Design reasons: dimming separates the cast from scenery; a single contact beat explains damage; arc and projectile direction explain the target; increasing fire size communicates the named tier; keeping HTML panels stable protects the learning task; reduced effects preserve control over motion.

## Charged shot refinement

The next refinement gives offensive magic a deliberate wind-up. The focal moment is the caster collecting energy before a fast release: darken the world, slow the actual cast sprite, draw bounded energy motes inward toward the hands, grow the spell energy, briefly hold the prepared stance and then fire sharply. Keep the spell name visible through this sequence.

Only caster animation playback changes speed. Scene timers, learner pressure budgets, input, camera framing and interface position remain independent. Restore the caster on release, cancellation, scene changes and Reduced effects activation. Heal and guard retain their short calm preparation. Reduced effects uses a short stationary charge cue. Reuse the existing atlas and Phaser; add no dependencies or continuous background particle loops.
