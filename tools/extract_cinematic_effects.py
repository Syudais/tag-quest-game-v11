"""Rebuild the selected battle atlas from unchanged, user-supplied RO sheets."""
from pathlib import Path
import argparse
import hashlib
import json
import shutil
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public/assets/effects/ragnarok"


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def black_to_alpha(image):
    # Straight-alpha representation of the source's additive RGB light.
    pixels = []
    for r, g, b, _ in image.convert("RGBA").getdata():
        alpha = max(r, g, b)
        pixels.append((round(r * 255 / alpha), round(g * 255 / alpha),
                       round(b * 255 / alpha), alpha) if alpha else (0, 0, 0, 0))
    out = Image.new("RGBA", image.size)
    out.putdata(pixels)
    return out


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path,
                        default=Path.home() / "Documents/Ragnarok Online")
    args = parser.parse_args()
    source_manifest = json.loads((args.source / "manifest.json").read_text())
    filenames = ["Shadow Slash [127433].png", "Various Effects [127603].png", "Energy [127593].png"]
    OUTPUT.mkdir(parents=True, exist_ok=True)
    (OUTPUT / "source").mkdir(exist_ok=True)
    images, sources = {}, []
    for name in filenames:
        original = args.source / "Effects" / name
        copy = OUTPUT / "source" / name
        shutil.copyfile(original, copy)
        entry = next(e.copy() for e in source_manifest if e["file"] == f"Effects/{name}")
        assert sha256(copy) == sha256(original) == entry["sha256"]
        opened = Image.open(copy)
        images[name] = opened.convert("RGBA") if opened.mode != "RGB" else black_to_alpha(opened)
        entry.update({"copiedFile": f"source/{name}", "originalMode": opened.mode,
                      "transparency": "native palette alpha" if opened.mode == "P" else "black-to-alpha additive conversion"})
        sources.append(entry)

    slash, various, energy = filenames
    groups = {
        "slash-impact": (slash, [(220, 0, 290, 75), (115, 0, 195, 75), (0, 0, 110, 75), (300, 0, 406, 75)], (112, 80), 24, "center"),
        "fire-projectile": (various, [(x, 0, x + 74, 90) for x in range(0, 444, 74)], (80, 96), 20, "center"),
        "fire-impact": (various, [(x, 330, end, 475) for x, end in zip([0, 98, 180, 265, 347, 432, 515, 599, 681], [98, 180, 265, 347, 432, 515, 599, 681, 766])], (100, 150), 24, "center"),
        "lightning-impact": (various, [(x, 930, end, 1210) for x, end in zip([0, 145, 290, 430, 585], [145, 290, 430, 585, 745])], (160, 288), 20, "bottom"),
        "ice-impact": (various, [(x, 1350, end, 1455) for x, end in zip([171, 227, 284, 342, 400, 471, 546, 620], [227, 284, 342, 400, 471, 546, 620, 692])], (84, 112), 24, "center"),
        "charge": (energy, [(round(i * 1633 / 10), 249, round((i + 1) * 1633 / 10), 498) for i in range(10)], (168, 252), 24, "center"),
        "heal": (energy, [(round(i * 1633 / 10), 747, round((i + 1) * 1633 / 10), 996) for i in range(10)], (168, 252), 20, "center"),
    }
    animations, settings, records, rendered = {}, {}, [], []
    for semantic, (filename, rectangles, size, fps, align) in groups.items():
        animations[semantic] = []
        settings[semantic] = {"frameRate": fps, "repeat": 0, "width": size[0], "height": size[1],
                              "origin": {"x": 0.5, "y": 1 if align == "bottom" else 0.5}}
        for i, rect in enumerate(rectangles):
            frame = f"{semantic}_{i:03}.png"
            crop = images[filename].crop(rect)
            bbox = crop.getbbox()
            assert bbox, frame
            content = crop.crop(bbox)
            assert content.width <= size[0] and content.height <= size[1], frame
            canvas = Image.new("RGBA", size)
            offset = ((size[0] - content.width) // 2,
                      size[1] - content.height - 4 if align == "bottom" else (size[1] - content.height) // 2)
            canvas.paste(content, offset)
            rendered.append((frame, canvas))
            animations[semantic].append(frame)
            records.append({"name": frame, "source": f"source/{filename}", "rectangle": list(rect),
                            "visibleRectangle": [rect[0] + bbox[0], rect[1] + bbox[1], rect[0] + bbox[2], rect[1] + bbox[3]],
                            "canvas": list(size), "offset": list(offset)})

    width, padding = 2048, 3
    x = y = padding
    row_height = 0
    atlas_frames, placements = {}, []
    for name, frame in rendered:
        if x + frame.width + padding > width:
            x, y, row_height = padding, y + row_height + padding, 0
        atlas_frames[name] = {"frame": {"x": x, "y": y, "w": frame.width, "h": frame.height},
                              "rotated": False, "trimmed": False,
                              "spriteSourceSize": {"x": 0, "y": 0, "w": frame.width, "h": frame.height},
                              "sourceSize": {"w": frame.width, "h": frame.height}}
        placements.append((x, y, frame))
        x += frame.width + padding
        row_height = max(row_height, frame.height)
    height = y + row_height + padding
    atlas = Image.new("RGBA", (width, height))
    for x, y, frame in placements:
        atlas.paste(frame, (x, y))
    atlas.save(OUTPUT / "effects.png", optimize=True)
    metadata = {"frames": atlas_frames, "meta": {"app": "Tag Quest deterministic sprite extraction",
                "image": "effects.png", "format": "RGBA8888", "size": {"w": width, "h": height}, "scale": "1"}}
    (OUTPUT / "effects.json").write_text(json.dumps(metadata, indent=2) + "\n")
    manifest = {"key": "ragnarok-effects", "image": "assets/effects/ragnarok/effects.png",
                "atlas": "assets/effects/ragnarok/effects.json", "license": "Commercial game artwork; no open license asserted",
                "rights": "Ragnarok Online artwork, Gravity and respective rights holders; user-supplied copies from The Spriters Resource",
                "sources": sources, "animations": animations, "settings": settings, "frames": records,
                "outputs": {p: {"sha256": sha256(OUTPUT / p), "bytes": (OUTPUT / p).stat().st_size} for p in ["effects.png", "effects.json"]}}
    (OUTPUT / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")

    contact = Image.new("RGB", (1000, len(groups) * 195), "#182330")
    draw = ImageDraw.Draw(contact)
    for row, (semantic, names) in enumerate(animations.items()):
        draw.text((10, row * 195 + 8), semantic, fill="#ffffff")
        for col, name in enumerate(names):
            frame = dict(rendered)[name].copy()
            frame.thumbnail((90, 150))
            contact.paste(frame, (col * 98 + 4, row * 195 + 30), frame)
            draw.text((col * 98 + 6, row * 195 + 178), name.split("_")[-1][:3], fill="#ffffff")
    contact.save(OUTPUT / "inspection-contact-sheet.png")
    print(json.dumps({"atlasSize": [width, height], "frames": len(rendered), "outputBytes": (OUTPUT / "effects.png").stat().st_size, "settings": settings}, indent=2))


if __name__ == "__main__":
    main()
