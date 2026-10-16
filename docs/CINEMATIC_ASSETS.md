# Cinematic battle effects

The battle atlas contains selected Ragnarok Online effect sprites supplied by the user from `C:\Users\RifkyAs-Syudais\Documents\Ragnarok Online\Effects`. That directory was read only. Three complete original sheets were copied unchanged into `public/assets/effects/ragnarok/source` before extraction. The original collection identifies its download source as [The Spriters Resource's Ragnarok Online catalog](https://www.spriters-resource.com/pc_computer/ragnarokonline/) and download date as 15 October 2026.

These are commercial-game assets associated with Ragnarok Online, Gravity, and the respective rights holders and contributors. No MIT, CC0 or other open-content license is asserted for this artwork. User possession and permission to copy these local files do not establish a redistribution license. The separate OpenDuelyst CC0 notice does not apply to these effects.

## Files and runtime use

- `public/assets/effects/ragnarok/effects.png`: transparent 2048 × 957 RGBA atlas, 52 frames, about 302 KB.
- `public/assets/effects/ragnarok/effects.json`: Phaser JSON hash atlas, texture key `ragnarok-effects`.
- `public/assets/effects/ragnarok/manifest.json`: animation arrays, recommended frame rates, frame sizes, origins, copied source records, source rectangles and SHA-256 hashes.
- `public/assets/effects/ragnarok/inspection-contact-sheet.png`: labeled visual review on a dark blue background. It is not used by the game.
- `tools/extract_cinematic_effects.py`: repeatable deterministic extraction; requires Python and Pillow. Its optional `--source` argument points at the local Ragnarok Online collection root.

Frame names are `<semantic>_<three-digit-index>.png`. All arrays play once. Every atlas frame is unrotated and untrimmed with a consistent transparent canvas within its animation; no runtime trimming offsets are required.

| Semantic | Frame indices | Canvas | Suggested fps | Placement |
| --- | --- | --- | --- | --- |
| `slash-impact` | 000–003 | 112 × 80 | 24 | Center; small arc grows into full arc |
| `fire-projectile` | 000–005 | 80 × 96 | 20 | Center; bright head faces up, rotate +π/2 to travel right |
| `fire-impact` | 000–008 | 100 × 150 | 24 | Center; warm flare |
| `lightning-impact` | 000–004 | 160 × 288 | 20 | Bottom center, origin (0.5, 1); contact point is four pixels above canvas bottom |
| `ice-impact` | 000–007 | 84 × 112 | 24 | Center; four crystals followed by four star-shaped bursts |
| `charge` | 000–009 | 168 × 252 | 24 | Center; cyan sparkle cluster |
| `heal` | 000–009 | 168 × 252 | 20 | Center; white sparkle cluster, can tint green in the renderer |

## Source selection and processing

1. [Shadow Slash, asset 127433](https://www.spriters-resource.com/pc_computer/ragnarokonline/asset/127433/): four isolated arcs from the 406 × 75 paletted PNG. Its native transparent palette entry is preserved on conversion to RGBA. Crops in playback order are `(220,0,290,75)`, `(115,0,195,75)`, `(0,0,110,75)`, `(300,0,406,75)`.
2. [Various Effects, asset 127603](https://www.spriters-resource.com/pc_computer/ragnarokonline/asset/127603/): selected six top-row projectiles, nine warm flares, five tall lightning bolts, four ice crystals and four ice starbursts from the 948 × 1867 RGB PNG. Only these isolated image regions are used.
3. [Energy, asset 127593](https://www.spriters-resource.com/pc_computer/ragnarokonline/asset/127593/): ten cyan clusters from row two and ten white clusters from row four of the 1633 × 1246 RGB PNG. Column bounds are `round(i × 1633 / 10)`. Selected row bounds are y=249–498 and y=747–996.

Rectangles use `(left, top, right, bottom)` with an exclusive right and bottom boundary. Exact rectangles, visible bounds and destination offsets for all 52 frames are recorded in `manifest.json`. Crops exclude sheet labels, dividers and neighboring effects. The extraction performs no drawing, recoloring, resampling or generative editing. Each visible crop is centered in its group's canvas; lightning is aligned to the bottom. Three pixels of empty atlas padding separate packed frames.

The two RGB source sheets have an opaque black background, not native transparency. For these sheets, each pixel is converted to straight RGBA with `alpha = max(R,G,B)` and each color channel divided by alpha (then normalized to 255). A black pixel becomes transparent. This represents the original colored additive light without an opaque black rectangle and preserves the source's glow edges. Native-alpha slash pixels bypass this conversion. The PNG atlas can use Phaser's normal alpha blend; additive blend is also suitable for magic light.

## Focused verification

The extraction verifies each copied original against both its source file and the supplied collection manifest hash. It asserts that each crop is nonempty and fits its destination canvas. The generated contact sheet was visually inspected: all seven groups show complete isolated sprites without text labels or black/magenta sheet backgrounds. Atlas metadata and source hashes are stored alongside the output for review. No broad gameplay QA was performed for this asset-only work.
