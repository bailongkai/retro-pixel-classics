#!/usr/bin/env python3
"""Convert images to WebP and update data/*.json references.

PNG (pixel art)  -> lossless WebP (pixel-exact)
JPEG (photos)    -> lossy WebP, quality 82
An image is only replaced when the WebP is smaller than the original.

Usage: python3 tools/to_webp.py [--dry] [platform ...]
"""
import concurrent.futures as cf
import glob
import io
import json
import os
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def convert(rel, dry):
    src = os.path.join(ROOT, rel)
    if not rel.lower().endswith((".png", ".jpg", ".jpeg")):
        return rel, 0, 0
    before = os.path.getsize(src)
    im = Image.open(src)
    buf = io.BytesIO()
    if rel.lower().endswith(".png"):
        if im.mode not in ("RGB", "RGBA"):
            im = im.convert("RGBA" if "transparency" in im.info or im.mode in ("LA", "PA") else "RGB")
        im.save(buf, "WEBP", lossless=True, method=6, quality=100)
    else:
        im.convert("RGB").save(buf, "WEBP", quality=82, method=6)
    after = len(buf.getvalue())
    if after >= before:
        return rel, before, before
    new = rel.rsplit(".", 1)[0] + ".webp"
    if not dry:
        with open(os.path.join(ROOT, new), "wb") as f:
            f.write(buf.getvalue())
        os.remove(src)
    return new, before, after


def main():
    args = sys.argv[1:]
    dry = "--dry" in args
    plats = [a for a in args if not a.startswith("--")] or \
        sorted(os.path.basename(f)[:-5] for f in glob.glob(os.path.join(ROOT, "data", "*.json")))
    total_b = total_a = 0
    for p in plats:
        path = os.path.join(ROOT, "data", p + ".json")
        games = json.load(open(path))
        refs = sorted({s for g in games for s in g["screenshots"] + ([g["cover"]] if g.get("cover") else [])})
        with cf.ProcessPoolExecutor() as ex:
            mapping = {r: (n, b, a) for r, (n, b, a) in zip(refs, ex.map(convert, refs, [dry] * len(refs)))}
        for g in games:
            g["screenshots"] = [mapping[s][0] for s in g["screenshots"]]
            if g.get("cover"):
                g["cover"] = mapping[g["cover"]][0]
        if not dry:
            json.dump(games, open(path, "w"), ensure_ascii=False, indent=2)
        b = sum(v[1] for v in mapping.values()); a = sum(v[2] for v in mapping.values())
        total_b += b; total_a += a
        print(f"{p}: {b / 1e6:.1f}MB -> {a / 1e6:.1f}MB ({100 - 100 * a / max(b, 1):.0f}% smaller)", flush=True)
    print(f"TOTAL: {total_b / 1e6:.0f}MB -> {total_a / 1e6:.0f}MB ({100 - 100 * total_a / max(total_b, 1):.0f}% smaller)")


if __name__ == "__main__":
    main()
