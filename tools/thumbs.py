#!/usr/bin/env python3
"""Fetch game screenshots / title screens / box art from libretro-thumbnails.

Usage:
  python3 tools/thumbs.py <platform> --list "<query>"
      Show matching libretro titles (base names) for a platform.
  python3 tools/thumbs.py <platform> <game-id> "<query or exact base name>" [--snaps N]
      Download up to N distinct gameplay snaps (one per region release, default 3),
      one title screen and one box art into images/<platform>/.
      Prints a JSON object: {"screenshots": [...], "cover": "..."}

Matching: an exact base name (e.g. "Guardian Heroes (Japan)") is used as-is;
otherwise the query is compared against titles with region/flag parentheses removed.
"""
import hashlib
import json
import os
import re
import subprocess
import sys
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = "/tmp/libretro-trees"

REPOS = {
    "gb": ["Nintendo_-_Game_Boy_Color", "Nintendo_-_Game_Boy"],
    "gba": ["Nintendo_-_Game_Boy_Advance"],
    "fc": ["Nintendo_-_Nintendo_Entertainment_System", "Nintendo_-_Family_Computer_Disk_System"],
    "sfc": ["Nintendo_-_Super_Nintendo_Entertainment_System"],
    "md": ["Sega_-_Mega_Drive_-_Genesis"],
    "mcd": ["Sega_-_Mega-CD_-_Sega_CD"],
    "gg": ["Sega_-_Game_Gear"],
    "ss": ["Sega_-_Saturn"],
    "dc": ["Sega_-_Dreamcast"],
    "ps": ["Sony_-_PlayStation"],
    "ps2": ["Sony_-_PlayStation_2"],
    "psp": ["Sony_-_PlayStation_Portable"],
    "nds": ["Nintendo_-_Nintendo_DS"],
    "pce": ["NEC_-_PC_Engine_-_TurboGrafx_16", "NEC_-_PC_Engine_CD_-_TurboGrafx-CD"],
    "neogeo": ["SNK_-_Neo_Geo", "FBNeo_-_Arcade_Games"],
    "ngp": ["SNK_-_Neo_Geo_Pocket_Color", "SNK_-_Neo_Geo_Pocket"],
    "ws": ["Bandai_-_WonderSwan_Color", "Bandai_-_WonderSwan"],
    "arcade": ["FBNeo_-_Arcade_Games", "MAME"],
}

UA = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) retro-pixel-classics"}


def tree(repo):
    os.makedirs(CACHE, exist_ok=True)
    path = os.path.join(CACHE, repo + ".txt")
    if not os.path.exists(path):
        out = subprocess.run(
            ["gh", "api", f"repos/libretro-thumbnails/{repo}/git/trees/master?recursive=1",
             "--jq", ".tree[].path"], capture_output=True, text=True, check=True).stdout
        with open(path, "w") as f:
            f.write(out)
    with open(path) as f:
        return [l for l in f.read().splitlines() if l.endswith(".png")]


def norm(s):
    s = re.sub(r"\s*\([^)]*\)", "", s)          # drop (USA) (Rev 1) ...
    s = re.sub(r"\s*\[[^\]]*\]", "", s)
    s = s.lower().replace("&", "and").replace("_", " ")
    s = re.sub(r"\bthe\b", "", s)
    return re.sub(r"[^a-z0-9]+", "", s)


def fingerprint(data):
    try:
        import io
        from PIL import Image
        im = Image.open(io.BytesIO(data)).convert("RGBA").convert("L").resize((32, 24))
        return list(im.getdata())
    except Exception:  # noqa: BLE001 - Pillow missing or unreadable image: fall back to byte dedupe only
        return None


def similar(a, b):
    return a is not None and b is not None and sum(abs(x - y) for x, y in zip(a, b)) / len(a) < 4


def entries(platform):
    """Return {base_name: {kind: (repo, path)}}"""
    res = {}
    for repo in REPOS[platform]:
        for p in tree(repo):
            kind, _, fname = p.partition("/")
            if kind not in ("Named_Snaps", "Named_Titles", "Named_Boxarts"):
                continue
            base = fname[:-4]
            res.setdefault(base, {})[kind] = (repo, p)
    return res


def match(platform, query):
    ent = entries(platform)
    if query in ent:
        return [query], ent
    q = norm(query)
    exact = [b for b in ent if norm(b) == q]
    loose = [b for b in ent if q and q in norm(b) and b not in exact]
    good = lambda xs: [b for b in xs if not rank(b)[0]]
    for cands in (good(exact), good(loose), exact, loose):
        if cands:
            return sorted(cands, key=rank), ent
    return [], ent


def rank(base):
    # prefer clean retail releases: Japan / USA / Europe, no Beta/Proto/Hack
    bad = any(t in base for t in ("Beta", "Proto", "Hack", "Demo", "Sample", "Pirate", "Unl", "Aftermarket", "(HB)", "[", "Homebrew", "bootleg", "Bootleg"))
    reg = 0 if "(Japan" in base else 1 if "(USA" in base else 2 if "(Europe" in base else 3
    return (bad, reg, len(base))


def fetch(repo, path):
    url = f"https://raw.githubusercontent.com/libretro-thumbnails/{repo}/master/" + urllib.parse.quote(path)
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as r:
        data = r.read()
    if not data.startswith(b"\x89PNG"):
        # libretro sometimes stores a symlink-like text file pointing at another name
        txt = data.decode("utf-8", "ignore").strip()
        if txt and len(txt) < 300 and txt.endswith(".png"):
            target = os.path.normpath(os.path.join(os.path.dirname(path), txt))
            return fetch(repo, target)
        return None
    return data


def save(data, rel, max_px=None):
    dst = os.path.join(ROOT, rel)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    with open(dst, "wb") as f:
        f.write(data)
    if max_px:  # box art: shrink and store as JPEG
        jpg = dst[:-4] + ".jpg"
        subprocess.run(["sips", "-Z", str(max_px), "-s", "format", "jpeg", "-s", "formatOptions", "80",
                        dst, "--out", jpg], capture_output=True)
        if os.path.exists(jpg):
            os.remove(dst)
            return rel[:-4] + ".jpg"
    else:  # pixel art: lossless-looking palette quantization keeps it crisp and small
        subprocess.run(["pngquant", "--force", "--skip-if-larger", "--quality", "70-100",
                        "--ext", ".png", dst], capture_output=True)
    return rel


def main():
    args = sys.argv[1:]
    if len(args) >= 3 and args[1] == "--list":
        names, _ = match(args[0], args[2])
        print("\n".join(names[:40]) or "(no match)")
        return
    if len(args) < 3:
        print(__doc__)
        sys.exit(1)
    platform, gid, query = args[:3]
    nsnaps = int(args[args.index("--snaps") + 1]) if "--snaps" in args else 3
    names, ent = match(platform, query)
    if not names:
        print(json.dumps({"error": f"no match for {query!r}"}))
        sys.exit(2)
    # restrict to releases of the same game as the best match
    key = norm(names[0])
    names = [n for n in names if norm(n) == key] or names[:1]

    out = {"screenshots": [], "cover": "", "matched": names[0]}
    seen = set()
    prints = []  # pixel fingerprints: libretro often stores the same picture under several region names
    shots = []
    for n in names:
        if len(shots) >= nsnaps:
            break
        if "Named_Snaps" in ent[n]:
            data = fetch(*ent[n]["Named_Snaps"])
            if data and hashlib.md5(data).hexdigest() not in seen:
                seen.add(hashlib.md5(data).hexdigest())
                fp = fingerprint(data)
                if fp is not None and any(similar(fp, q) for q in prints):
                    continue
                prints.append(fp)
                shots.append(save(data, f"images/{platform}/{gid}-s{len(shots) + 1}.png"))
    title = ""
    for n in names:
        if "Named_Titles" in ent[n]:
            data = fetch(*ent[n]["Named_Titles"])
            if data and hashlib.md5(data).hexdigest() not in seen:
                title = save(data, f"images/{platform}/{gid}-title.png")
                break
    for n in names:
        if "Named_Boxarts" in ent[n]:
            data = fetch(*ent[n]["Named_Boxarts"])
            if data:
                out["cover"] = save(data, f"images/{platform}/{gid}-box.png", max_px=480)
                break
    out["screenshots"] = shots + ([title] if title else [])
    print(json.dumps(out, ensure_ascii=False))


if __name__ == "__main__":
    main()
