#!/usr/bin/env python3
"""Remove screenshots that are pixel-identical (or near-identical) to an earlier one of the same game.

Usage: python3 tools/dedupe.py [platform ...]   (dry run)
       python3 tools/dedupe.py --apply [platform ...]
"""
import glob
import json
import os
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def fingerprint(path):
    im = Image.open(os.path.join(ROOT, path)).convert("RGBA").convert("L").resize((32, 24))
    return list(im.get_flattened_data()) if hasattr(im, "get_flattened_data") else list(im.getdata())


def same(a, b):
    return sum(abs(x - y) for x, y in zip(a, b)) / len(a) < 4  # mean abs diff per pixel


def main():
    args = sys.argv[1:]
    apply = "--apply" in args
    plats = [a for a in args if a != "--apply"]
    files = [os.path.join(ROOT, "data", p + ".json") for p in plats] or sorted(glob.glob(os.path.join(ROOT, "data", "*.json")))
    for f in files:
        games = json.load(open(f))
        removed = 0
        for g in games:
            kept, prints = [], []
            for s in g.get("screenshots", []):
                fp = fingerprint(s)
                if any(same(fp, q) for q in prints):
                    removed += 1
                    print(f"  dup {g['id']}: {s}")
                    if apply:
                        os.remove(os.path.join(ROOT, s))
                    continue
                kept.append(s)
                prints.append(fp)
            g["screenshots"] = kept
            n = len(kept) + (1 if g.get("cover") else 0)
            if n < 3:
                print(f"  ! {g['id']} now has {n} images")
        if apply:
            json.dump(games, open(f, "w"), ensure_ascii=False, indent=2)
        print(f"{os.path.basename(f)}: {removed} duplicates {'removed' if apply else 'found'}")


if __name__ == "__main__":
    main()
