# Cinematic combat, v10

Delivered 16 October 2026. Plan: [CINEMATIC_COMBAT_PLAN.md](CINEMATIC_COMBAT_PLAN.md). Player guide: [CINEMATIC_COMBAT.md](CINEMATIC_COMBAT.md). Source artwork: [CINEMATIC_ASSETS.md](CINEMATIC_ASSETS.md).

## Implemented

The battle follows anticipation, release, contact and recovery. Slashes use directional arcs; magic dims the scenery while keeping actors and effects in front. Fire grows into Fira at level 3 and Firaga at level 5, using the existing fire skill's balance. Thunder branches from the sky to the target. Contact includes sparks, target blinks, bounded camera shake, recoil and a short actor-only hit pause. Heal, guard, dodge and parry retain distinct feedback. The HTML interface remains steady.

The atlas contains 52 isolated frames from three unchanged user-supplied Ragnarok sheets. Their provenance is separate from the open-license game assets. Copied source hashes match the originals. No Ragnarok source files were modified.

## Verification scope

The final TypeScript and Vite production build passed. The existing large-bundle advisory remains non-blocking. Per the user's request, this was a focused integration check rather than a full campaign, device, balance, audio or accessibility QA pass.

An isolated browser origin (127.0.0.2 on port 4173) was used for admin test fights, preserving the player's LAN-origin campaign and preferences. At 1280 by 720, the following were observed:

- Correct button HTML triggered Fira; its name, source-art projectile, battlefield dimming and stationary editor/previews were visible.
- The enemy counterattack completed, health changed, the dim layer cleared and question 2 replaced question 1.
- Correct button HTML triggered Thunder; its branching bolt, source-art contact effect, target reaction, damage label and darkened scenery were visible. The test fight cleared.
- Keyboard Enter on the Reduced effects control enabled its pressed state and confirmation message. After reload the pressed state remained true.
- The browser recorded no warnings or errors during these checks.

The focused check found and repaired a transparent-fill dim layer. A second check confirmed actual darkening. The sourced fire projectile replaced the initial hard circular core. Other visual tiers and defense effects were reviewed in source, not replayed exhaustively.

Screenshots: [Fira flight](screenshots/v10-fira-flight.png), [Thunder contact](screenshots/v10-thunder-impact.png).

## Scoped design gate

- Function PASS: the new icon is a native button with an active handler, pressed state, keyboard activation and saved preference; keyboard activation and restoration were observed.
- Motion PASS: controller source disables shake, bright contact effects and full travel in Reduced mode, restores actor pause/alpha/position, and clears transient effects on scene changes. The reduced preference is also available before any fight.
- Contrast PASS: computed gold #e9c17f on the selected #263a49 surface is 6.95:1; normal #e4e9ed on #18232f is 13.01:1. Existing focus treatment is retained.
- Direction PASS: existing fullscreen RPG composition and Energy 3 / Rhythm 2 / Motion 3 are retained. Dimming isolates the cast; source animation and contact cues explain the action. No unrelated UI sections were added.
- Evidence PASS: artwork provenance and 52 frame references are recorded; build and limited runtime observations are distinguished from unperformed broader checks.

## Hosting

Run npm run lan or START_LAN.cmd. The production preview listens on 0.0.0.0:4173, with the Ethernet address http://192.168.7.113:4173/?v=10. Keep the host awake and the preview process running. No internet tunnel or router forwarding was configured.
