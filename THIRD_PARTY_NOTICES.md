# Asset provenance

The fantasy world and combat actor artwork used by Tag Quest is from [OpenDuelyst](https://github.com/open-duelyst/duelyst), pinned to commit `2843f2400854136598631288c2e8dfb8f5173de7`. Mentor artwork and audio have separate provenance below.

The upstream [LICENSE](https://github.com/open-duelyst/duelyst/blob/2843f2400854136598631288c2e8dfb8f5173de7/LICENSE) declares **CC0 1.0 Universal**. This is the art license, not MIT. CC0 permits reuse and modification, including commercial use. The complete upstream notice is included at `public/assets/licenses/DUELYST-CC0.txt`. No Duelyst names, logos, or branding are presented as the name of this game.

Original artwork was created for Duelyst by Counterplay Games and contributors. Attribution is retained here for provenance even though CC0 does not require attribution. This project is independent and is not endorsed by the original creators.

## Transformations

- Original actor PNG images are retained unchanged. Cocos `.plist` metadata is converted into Phaser-compatible JSON. Frames preserve original names, source sizes, trimming rectangles, and rotation flags.
- Four original midground platform images are copied to normalized ground PNG files. Shimzar receives transparent canvas padding so all four ground files occupy a 1920 by 1080 canvas. No scenery or floor artwork was generated.
- Research contact sheets are resized composites of those same sourced images, created for review.
- Original source URLs, byte counts, and SHA-256 hashes are recorded in `public/assets/sources.json`. Runtime mappings and frame lists are recorded in `ASSET_MANIFEST.json` and `public/assets/manifest.json`.

## Software

Phaser, Vite, TypeScript, and their dependencies carry their respective upstream licenses. Their package license files are distributed by the package manager. The CC0 art notice does not relicense those dependencies.

## Action icons

Lucide supplies the interface SVG icons. Its ISC license and the MIT notice for Feather-derived icons are included in public/assets/licenses/LUCIDE-LICENSE.txt. See https://lucide.dev/license.


## Mentor artwork

The mentor portrait and spritesheet are transparent derivatives of artwork supplied by the user. They are separate from the OpenDuelyst assets. See docs/MENTOR_ASSETS.md for provenance, editing prompts and the 9 by 4 frame layout.

## Audio

The combat effects use CC0 audio from these creator pages:

- [Kenney RPG Audio](https://kenney.nl/assets/rpg-audio) and [Music Jingles](https://kenney.nl/assets/music-jingles), by Kenney Vleugels.
- [80 CC0 RPG SFX](https://opengameart.org/content/80-cc0-rpg-sfx), by rubberduck.
- [Ice spells](https://opengameart.org/content/ice-spells), by bart, based on a pdsounds recording by Stephan.
- [Spell sounds](https://opengameart.org/content/spell-sounds), by Augmentality (Brandon Morris), submitted by HaelDB. This project selects the CC0 option offered alongside OGA-BY.

Selected excerpts were normalized, faded, and converted for browser playback. Per-file originals, transformations, download URLs and SHA-256 hashes are recorded in `public/assets/audio/sources.json`; playback mappings are explained in `docs/AUDIO.md`. CC0 applies to these sourced effects.

`Iron_Under_Winter_Skies.mp3` was supplied by the user and imported as the music track. Its original bytes are retained. It has separate provenance and is not represented as CC0 by this project.

## Ragnarok Online cinematic effects

Selected effect sprites were copied from the user's local Ragnarok Online collection, originally downloaded from [The Spriters Resource](https://www.spriters-resource.com/pc_computer/ragnarokonline/). The three unchanged sheets and their derived battle atlas are under `public/assets/effects/ragnarok`. Ragnarok Online artwork belongs to Gravity and the respective rights holders and contributors. No open-content license is asserted for these assets; the CC0 license of the OpenDuelyst assets and the software licenses do not apply to them. Local user permission to copy these files does not establish redistribution rights.

See `docs/CINEMATIC_ASSETS.md` and `public/assets/effects/ragnarok/manifest.json` for source pages, original hashes, extraction rectangles, transparency conversion and animation mappings.

