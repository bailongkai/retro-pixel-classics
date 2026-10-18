#!/usr/bin/env python3
"""Validate data/<platform>.json (or all platforms when no argument is given)."""
import glob
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REQUIRED = ["id", "title", "titleZh", "year", "developer", "genre", "tagline", "description",
            "highlights", "reviews", "editorScore", "is2D", "screenshots", "cover"]


def check(path):
    plat = os.path.basename(path)[:-5]
    problems, few = [], []
    try:
        games = json.load(open(path))
    except Exception as e:  # noqa: BLE001
        return [f"invalid JSON: {e}"], [], 0
    ids = set()
    for g in games:
        gid = g.get("id", "?")
        for k in REQUIRED:
            if k not in g:
                problems.append(f"{gid}: missing '{k}'")
        if gid in ids:
            problems.append(f"{gid}: duplicate id")
        ids.add(gid)
        if not str(gid).startswith(plat + "-"):
            problems.append(f"{gid}: id should start with '{plat}-'")
        for s in g.get("screenshots", []) + ([g["cover"]] if g.get("cover") else []):
            if not os.path.exists(os.path.join(ROOT, s)):
                problems.append(f"{gid}: missing file {s}")
            elif os.path.getsize(os.path.join(ROOT, s)) > 600_000:
                problems.append(f"{gid}: file too large {s}")
        n = len(g.get("screenshots", [])) + (1 if g.get("cover") else 0)
        if n < 3:
            few.append(f"{gid} ({n} images)")
    scores = [g.get("editorScore", 0) for g in games]
    if scores != sorted(scores, reverse=True):
        problems.append("not sorted by editorScore desc")
    return problems, few, len(games)


def main():
    paths = [os.path.join(ROOT, "data", a + ".json") for a in sys.argv[1:]] or sorted(glob.glob(os.path.join(ROOT, "data", "*.json")))
    ok = True
    for p in paths:
        problems, few, n = check(p)
        print(f"{os.path.basename(p)}: {n} games, {len(problems)} problems, {len(few)} with <3 images")
        for x in problems[:50]:
            print("  !", x)
        for x in few:
            print("  -", x)
        ok &= not problems
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
