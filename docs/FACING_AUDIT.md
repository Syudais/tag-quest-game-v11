# Sprite facing correction

Fresh visual inspection on 15 October 2026 used the packaged PNGs and their real atlas rectangles. No replacement art or generated character poses were used.

## Corrected finding

The earlier v6 note described `boss_chaosknight` as a left-facing mounted character. That interpretation was incorrect. At larger scale, the helmet, visible eye and forward face are on the **right**. The glowing form on the left is a shoulder pauldron. The downward scythe impact also extends to the right.

Its previous `nativeFacing: "left"` metadata therefore made it look and strike away from a hero standing to its left. The corrected value is `"right"`.

See [the enlarged original-versus-mirror comparison](screenshots/facing-audit/boss_chaosknight-original-vs-mirror.png): original idle 0, run 2 and attack 19 occupy the top row; their mirrored versions occupy the bottom row. The mirrored row is the appropriate battlefield presentation when this enemy stands to the hero's right.

## Reviewed motions

Each hero/enemy contact sheet includes four representative frames from **idle, run, attack, cast, hit and death**. All enemy attack sequences were also inspected in full to avoid mistaking a wind-up or circular effect for the strike direction.

| Actor | Native source direction | Visual evidence | Attack impact frame, zero-based |
| --- | --- | --- | --- |
| Hero `f1_general` | Right | Running body and leading face point right; the later sword sweep reaches right. | Existing player timing retained |
| `neutral_golemnature` | Right | Antlered face and forward arm point right; the green slash opens to the right at frame 4. | 4 of 8 |
| `boss_borealjuggernaut` | Right | Snout and long leading horn point right in idle/run. The tornado is radial; recovery returns to that stance. | 12 of 26 |
| `boss_cindera` | Right | Enlarged idle/run face and leading foot point right. Fire release occurs to the right after the overhead wind-up. The halo alone was not used to classify facing. | 16 of 40 |
| `boss_chaosknight` | Right, corrected | Helmet/eye face right; scythe impact at frame 19 extends right. The left pauldron was previously misread as a mount's head. | 19 of 39 |

The attack and cast arrays for these enemies share source frames. No actual per-animation direction reversal was found, so the manifest does not invent reversal flags. The renderer accepts an optional `nativeFacingByAnimation` map if a future asset requires one, and reapplies facing when changing animations.

## Rendering changes

- An enemy to the hero's right now mirrors its native right-facing art toward the hero, including the corrected Chaos Knight.
- After attacking, enemies keep facing the hero while returning to their home position in a guarded backstep. The old return deliberately turned the enemy away and played a forward run toward home; this could read as another inversion.
- Enemy impact timing follows the visibly active strike frame rather than a fixed 240 ms delay. Long boss wind-ups now reach their strike before damage/defense feedback; their source attack sequence can finish before the return.
- Actor scales remain positive. Facing uses `flipX` rather than negative scaling, and source atlas frames are not rewritten.
- Damage amounts, defense decisions, resource costs, campaign saves and progression are unchanged.

## Evidence files

`docs/screenshots/facing-audit/` contains:

- Five `*-native.png` sheets covering all six motions.
- Four `*-attack-all.png` sheets covering every enemy attack frame.
- Enlarged `*-detail.png` sheets and original/mirrored comparisons for the ambiguous characters.
- `audit.json` with sampled frame names, source image hashes, final facing and impact metadata.

This is a source-art and animation-path review, not a claim of a broad browser QA sweep.
