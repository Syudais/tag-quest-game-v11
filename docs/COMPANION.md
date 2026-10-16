# Mr. Rifky companion and actor facing

## Correct native directions

The existing hero and four enemy PNG atlases were visually inspected, including named idle frames and multiple attack frames enlarged for comparison. The PNGs were not repainted or mirrored on disk. Their native orientation is now explicit in `public/assets/manifest.json`:

| Actor | Native facing | Visual evidence |
|---|---|---|
| `f1_general` | Right | Forward shield and the concluding sword sweep face right. The early backswing reaches behind the character. |
| `neutral_golemnature` | Right | The idle head points right; the attacking arm and green sweep extend right. |
| `boss_borealjuggernaut` | Right | The snout and forward horn point right; the attack begins and ends in that stance. |
| `boss_cindera` | Right | The stance faces right and the fire wheel projects to the right. |
| `boss_chaosknight` | Right | Enlarged source frames show the helmet and eye facing right; the left flame is a shoulder pauldron. The scythe impact extends right. The earlier left-facing interpretation was incorrect. |

No idle-to-attack reversal requiring a separate animation-facing override was observed in these four enemy atlases. A backward wind-up or circular weapon effect is not a change in the actor's native direction. The engine compares the target direction with this metadata before applying `flipX`. The fresh review corrected Chaos Knight's metadata, and enemies now keep facing the hero while stepping back after an attack. See `FACING_AUDIT.md` for the enlarged evidence and strike-frame timing.

## Existing mentor PNG and new atlas metadata

`public/assets/mentor/spritesheet.png` remains the existing 1678 by 937 transparent, nine-column by four-row image. Its SHA-256 is `A6C9A6B72D446B6C0E13DCB7B916FC92C4E71424656E50BFCE9143E370C6BBF7`. The original user artwork and transparent-background derivative are documented in `MENTOR_ASSETS.md`; they are separate from the OpenDuelyst CC0 art.

The new `public/assets/mentor/phaser-atlas.json` contains metadata for all 36 cells. Frame keys are `mentor-r0-c0` through `mentor-r3-c8`. Every cell boundary uses `floor(index * dimension / cellCount)`, so integer rectangles cover the original image without resampling it.

Every frame uses the same virtual source size, 187 by 256. Transparent placement offsets align the visible feet to y=235: row 0 has a 14-pixel y offset, row 1 has 10, row 2 has 9, and row 3 has 5. The measured foot bound uses alpha of at least 32 to ignore nearly transparent fringe pixels. These offsets exist only in the atlas metadata. The original whole cell, including its transparent pixels, remains intact.

The manifest descriptor is `mentor`, with texture key `mr_rifky`, image `assets/mentor/spritesheet.png`, and atlas `assets/mentor/phaser-atlas.json`. Its origin is x=0.5 and y=235/256 (0.91796875), with a suggested logical scale of 0.42.

| Animation | Existing row | Meaning |
|---|---|---|
| `idle` | Row 2, column 0 | Static front-facing rest pose. |
| `run` | Row 0, all nine cells | Right-facing walk, without horizontal mirroring. |
| `runLeft` | Row 1, all nine cells | Left-facing walk, without horizontal mirroring. |
| `cheer` | Row 2, all nine cells | Brief front-facing encouragement gesture using the existing sequence. |
| `heal` | Row 2, all nine cells | The same existing front sequence; the healing event is communicated by game effects and the HP value. |
| `back` | Row 3, all nine cells | Existing back-facing sequence. |

There are no newly drawn cheering or healing poses. The labels describe how the game reuses the supplied sequence. The static reading portrait continues to use `assets/mentor/portrait.png`.

## Behavior

Mr. Rifky is now a sprite inside the Phaser world. He follows behind the hero during exploration and waits at a safe position beside the battle. A short encouragement sequence can follow a correct action. He does not constantly bounce or chatter while the learner is coding.

Movement and reactions pause when the document is hidden, when the learner opens a reading dialogue, or when reduced motion is requested. The toolbar Call Mr. Rifky icon remains a reliable way to open the teaching dialogue if the world sprite is moving or visually small. The established compact right editor and bottom combat strip remain in place.

## Easy and Normal support

Normal mode keeps the companion heal manual. Easy mode adds an automatic 20-HP heal when current health is at or below 40% of maximum, provided the hero is still alive and the encounter's healing gift remains unused. The automatic event happens at a safe point in the challenge phase; it does not interrupt an active attack or defense reaction.

Automatic and manual healing use the same one-gift-per-encounter budget. Spending it manually removes the later automatic heal. Healing never exceeds maximum HP, full HP does not consume the gift, and a hero at zero HP is not resurrected. The existing Mending technique is a separate combat ability.

Difficulty is selected during setup or through Mr. Rifky's dialogue and saved with the browser's progress. Easy uses a 90-second base and Normal a 30-second base, multiplied by the task's syntax-complexity factor from ×1 to ×2.5. See `STAGE_TIMING.md` for all allowances. Both use the same HTML questions and defense mechanics. Reading continues to pause pressure.

After more than 30 seconds of active work on one question, a short topic-matched hint can appear beside Mr. Rifky in the battlefield. It uses plain text, including literal tag names, and stays for eight active seconds. Reading hides the bubble and pauses its lifetime. It does not take focus, submit code, or restart the enemy timer. Clicking it opens the existing Mr. Rifky conversation; the keyboard Call control remains available.

This update changes metadata and integrates existing artwork. It does not claim a fresh broad QA run or a study with children.
