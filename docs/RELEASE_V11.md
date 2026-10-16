# Charged magic, v11

16 October 2026. Offensive spells now have a slowed cast, inward energy gathering, ground runes, a growing hand effect, a held prepared stance and a fast release. Fire/Fira/Firaga charge for 900/975/1050 ms; ice/thunder for 900 ms. Fire and ice flight lasts 220 ms. Skill balance and stage time allowances are unchanged.

The final production build passed (TypeScript and Vite; bundle index-B7l_dsiX.js). The existing bundle-size advisory remains. No new packages or assets were installed.

A focused 1280 by 720 browser check on a separate local origin observed Fire's character pose change during charging, converging energy, the ground ring, visible spell title and darkened scenery. The HTML panels remained steady. The shot completed and returned to exploration after a test-origin stage clear. Browser warning/error logs were empty. Screenshot: screenshots/v11-charged-fire.png. This was a focused motion check, not a complete device or campaign QA pass. The player's LAN-origin progress was untouched.

Source review confirmed separate caster playback speed, unchanged scene clocks, and speed/pause restoration on release, clear, Reduced effects and scene changes. A validity check before restoring the caster prevents an old canceled action from altering a later cast. Existing Reduced effects controls, accessibility states, focus styles and contrast are unchanged. The new motion follows the authored charge/release moment from CINEMATIC_COMBAT_PLAN.md and retains the established fantasy design direction.

The production server listens on 0.0.0.0:4173. Open http://192.168.7.113:4173/?v=11 on the same network. Keep the host awake and server running.
