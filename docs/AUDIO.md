# Tag Quest audio

The game serves all music and effects from its own `assets/audio/` directory. Playback never streams from Kenney, OpenGameArt, or another external audio host.

## Music supplied by the user

`public/assets/audio/music/Iron_Under_Winter_Skies.mp3` is an unchanged copy of the file supplied at `C:\Users\RifkyAs-Syudais\Downloads\Iron_Under_Winter_Skies.mp3`.

- Duration: approximately 181.1 seconds, looped during gameplay.
- Size: 4,352,688 bytes.
- The user requested its inclusion. No creator name or public reuse license was supplied, so this track is **not described as MIT or CC0**. The project's code license does not grant rights to redistribute this music publicly.
- The original and packaged SHA-256 hashes match; see `public/assets/audio/sources.json`.

## Downloaded sound effects

Verified against the creators' source pages on 15 October 2026. All selected effects use **CC0 1.0**, including the CC0 option where the upload lists parallel licenses. Source archive hashes, original selected-file hashes, packaged-file hashes, download URLs, authors, excerpts, and conversion notes are recorded in `public/assets/audio/sources.json`.

| Runtime cue | Selected original | Creator and primary source |
| --- | --- | --- |
| Blade swing | `knifeSlice.ogg` | Kenney — [RPG Audio](https://kenney.nl/assets/rpg-audio) |
| Fire | `spell_fire_02.ogg` | rubberduck — [80 CC0 RPG SFX](https://opengameart.org/content/80-cc0-rpg-sfx) |
| Frost | `ice.wav` | bart, based on Stephan's pdsounds recording — [Ice spells](https://opengameart.org/content/ice-spells) |
| Storm | `electricspell2.ogg`, 3.24–4.49 s excerpt | Augmentality / Brandon Morris, submitted by HaelDB — [Spell sounds](https://opengameart.org/content/spell-sounds) |
| Heal, including Mr Rifky | `healing.ogg`, 11.48–12.73 s excerpt | Augmentality / Brandon Morris — [Spell sounds](https://opengameart.org/content/spell-sounds) |
| Focus guard | `spell_01.ogg` | rubberduck — [80 CC0 RPG SFX](https://opengameart.org/content/80-cc0-rpg-sfx) |
| Dodge | `cloth1.ogg` | Kenney — [RPG Audio](https://kenney.nl/assets/rpg-audio) |
| Parry | `metal_02.ogg` | rubberduck — [80 CC0 RPG SFX](https://opengameart.org/content/80-cc0-rpg-sfx) |
| Player damage | `metal_01.ogg` | rubberduck — [80 CC0 RPG SFX](https://opengameart.org/content/80-cc0-rpg-sfx) |
| Enemy damage | `creature_hurt_01.ogg` | rubberduck — [80 CC0 RPG SFX](https://opengameart.org/content/80-cc0-rpg-sfx) |
| Incoming attack | `metalClick.ogg` | Kenney — [RPG Audio](https://kenney.nl/assets/rpg-audio) |
| Victory | `jingles_NES00.ogg` | Kenney — [Music Jingles](https://kenney.nl/assets/music-jingles) |
| Defeat | `jingles_NES10.ogg` | Kenney — [Music Jingles](https://kenney.nl/assets/music-jingles) |
| Level up | `jingles_NES04.ogg` | Kenney — [Music Jingles](https://kenney.nl/assets/music-jingles) |
| Walking | `footstep00.ogg` | Kenney — [RPG Audio](https://kenney.nl/assets/rpg-audio) |

CC0 permits reuse and modification without an attribution requirement. These creator credits are retained for provenance. Kenney's original license notices are included under `public/assets/audio/licenses/`; the remaining source declarations are recorded in `licenses/CC0-SOURCES.md`.

Effects were normalized to a modest target level, given short edge fades, and converted to 128 kb/s stereo MP3 for broad browser playback. The electrical and healing source recordings contain multiple events and long silence, so only the identified short events are included. The original background track was not re-encoded. Unused download archives and unselected pack files are excluded from the runtime assets.

## Playback behavior

- The existing sound button controls music and effects together. The interface remembers the learner's sound preference.
- Browser autoplay rules are respected: pointer or keyboard interaction unlocks playback. Audio failures never block combat.
- Music loops at 16% mixer gain and ducks to 4.5% while reading or using a tutorial/dialogue. Result jingles briefly duck the music further than ordinary play.
- Switching away from the page pauses music, stops effects, and suspends the audio context. Returning resumes the previous track position if sound is enabled.
- There are at most three simultaneous effect voices, repeated effects are throttled, and a compressor limits peaks. Walking is quiet and limited to one cue per 280 ms while the hero is moving.
- Critical attacks accent the relevant swing, spell, or impact. Heal audio is shared by the skill, manual companion healing, and Easy-mode automatic companion healing.
- No synthesized oscillator placeholders remain. Combat damage, timers, progression, facing, and Mr Rifky's behavior are unchanged.

Implementation was type checked. A subjective listening or loudness review is not claimed.
