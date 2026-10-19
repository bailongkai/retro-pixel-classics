#!/usr/bin/env python3
"""Top up gameplay screenshots from LaunchBox + TheGamesDB.

Needs /tmp/lb/shots.pkl (LaunchBox matches + gameplay screenshot lists, built from the
LaunchBox Metadata.xml dump — see hd_covers.py).

Usage: python3 tools/more_shots.py [--target 6] [--dry] [platform ...]
"""
import concurrent.futures as cf
import glob
import html
import io
import json
import os
import pickle
import re
import sys
import time
import urllib.parse
import urllib.request

from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from hd_covers import norm  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UA = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 Chrome/120 Safari/537.36"}
MAX_BYTES = 400_000

TGDB_PLATFORMS = {
    "fc": {"Nintendo Entertainment System (NES)", "Famicom Disk System", "Nintendo Famicom"},
    "sfc": {"Super Nintendo (SNES)", "Super Famicom"},
    "gb": {"Nintendo Game Boy", "Nintendo Game Boy Color"},
    "gba": {"Nintendo Game Boy Advance"},
    "nds": {"Nintendo DS"},
    "md": {"Sega Genesis", "Sega Mega Drive"},
    "mcd": {"Sega CD", "Sega Mega-CD"},
    "gg": {"Sega Game Gear"},
    "ss": {"Sega Saturn"},
    "dc": {"Sega Dreamcast"},
    "ps": {"Sony Playstation"},
    "ps2": {"Sony Playstation 2"},
    "psp": {"Sony Playstation Portable"},
    "pce": {"TurboGrafx 16", "TurboGrafx CD", "PC Engine", "PC Engine CD"},
    "neogeo": {"Neo Geo", "Neo Geo CD", "NeoGeo", "Neo Geo AES"},
    "ngp": {"Neo Geo Pocket", "Neo Geo Pocket Color"},
    "ws": {"WonderSwan", "WonderSwan Color"},
    "arcade": {"Arcade"},
}


def get(url, binary=False, tries=3):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=40) as r:
                data = r.read()
            return data if binary else data.decode("utf-8", "ignore")
        except Exception:  # noqa: BLE001
            time.sleep(1.5 * (i + 1))
    return None


def tgdb_search(name):
    page = get("https://thegamesdb.net/search.php?name=" + urllib.parse.quote(name))
    if not page:
        return []
    out = []
    for m in re.finditer(r'game\.php\?id=(\d+)".*?<p>(.*?)</p>.*?<p class="text-muted">(.*?)</p>', page, re.S):
        out.append((m.group(1), html.unescape(m.group(2)).strip(), html.unescape(m.group(3)).strip()))
    return out


def tgdb_shots(gid):
    page = get(f"https://thegamesdb.net/game.php?id={gid}")
    if not page:
        return []
    urls = re.findall(r"https://cdn\.thegamesdb\.net/images/original/screenshots?/[\w\-]+\.(?:jpg|png)", page)
    seen, out = set(), []
    for u in urls:
        key = u.rsplit("/", 1)[1]
        if key not in seen:
            seen.add(key)
            out.append(u)
    return out


def fingerprint(img):
    return list(img.convert("RGBA").convert("L").resize((32, 24)).get_flattened_data())


def similar(a, b):
    return sum(abs(x - y) for x, y in zip(a, b)) / len(a) < 6


def load_image(data):
    try:
        im = Image.open(io.BytesIO(data))
        im.load()
        return im
    except Exception:  # noqa: BLE001
        return None


def candidates(g, plat, lbinfo, lbshots):
    urls = []
    if lbinfo:
        for _, fn in lbshots.get(lbinfo["lb"], []):
            urls.append(("lb", "https://images.launchbox-app.com/" + urllib.parse.quote(fn)))
    names = {norm(g["title"])}
    if lbinfo:
        names.add(norm(lbinfo["lbName"]))
    queries = [g["title"]] + ([lbinfo["lbName"]] if lbinfo and norm(lbinfo["lbName"]) != norm(g["title"]) else [])
    seen_ids = set()
    for q in queries:
        for tid, tname, tplat in tgdb_search(q):
            if tid in seen_ids or tplat not in TGDB_PLATFORMS[plat]:
                continue
            if norm(tname) not in names:
                continue
            seen_ids.add(tid)
            urls += [("tgdb", u) for u in tgdb_shots(tid)]
    return urls


def top_up(g, plat, lbinfo, lbshots, target, dry):
    shots = g["screenshots"]
    title = [s for s in shots if "-title." in s]
    gameplay = [s for s in shots if s not in title]
    need = target - len(gameplay)
    if need <= 0:
        return g["id"], [], 0
    prints = []
    for s in shots + ([g["cover"]] if g.get("cover") else []):
        try:
            prints.append(fingerprint(Image.open(os.path.join(ROOT, s))))
        except Exception:  # noqa: BLE001
            pass
    added = []
    cands = candidates(g, plat, lbinfo, lbshots)
    n = 0
    for src, url in cands:
        if len(added) >= need:
            break
        data = get(url, binary=True)
        im = load_image(data) if data else None
        if im is None or min(im.size) < 100:
            continue
        w, h = im.size
        if not (0.45 <= w / h <= 2.6):
            continue
        fp = fingerprint(im)
        if any(similar(fp, p) for p in prints):
            continue
        prints.append(fp)
        n += 1
        ext = "png" if data[:4] == b"\x89PNG" else "jpg"
        while True:
            rel = f"images/{plat}/{g['id']}-m{n}.{ext}"
            if not os.path.exists(os.path.join(ROOT, rel)):
                break
            n += 1
        if not dry:
            dst = os.path.join(ROOT, rel)
            if len(data) > MAX_BYTES or max(w, h) > 1024:
                im = im.convert("RGB")
                im.thumbnail((960, 960))
                rel = rel.rsplit(".", 1)[0] + ".jpg"
                dst = os.path.join(ROOT, rel)
                im.save(dst, "JPEG", quality=85)
            else:
                with open(dst, "wb") as f:
                    f.write(data)
        added.append(rel)
    return g["id"], added, len(cands)


def main():
    args = sys.argv[1:]
    target = int(args[args.index("--target") + 1]) if "--target" in args else 6
    dry = "--dry" in args
    plats = [a for a in args if not a.startswith("--") and not a.isdigit()] or \
        sorted(os.path.basename(f)[:-5] for f in glob.glob(os.path.join(ROOT, "data", "*.json")))
    matches, lbshots = pickle.load(open("/tmp/lb/shots.pkl", "rb"))
    for p in plats:
        path = os.path.join(ROOT, "data", p + ".json")
        games = json.load(open(path))
        with cf.ThreadPoolExecutor(6) as ex:
            results = dict((gid, (a, c)) for gid, a, c in
                           ex.map(lambda g: top_up(g, p, matches.get(g["id"]), lbshots, target, dry), games))
        total = 0
        for g in games:
            added, _ = results[g["id"]]
            if added:
                title = [s for s in g["screenshots"] if "-title." in s]
                g["screenshots"] = [s for s in g["screenshots"] if s not in title] + added + title
                total += len(added)
        if not dry:
            json.dump(games, open(path, "w"), ensure_ascii=False, indent=2)
        short = [g["id"] for g in games if len([s for s in g["screenshots"] if "-title." not in s]) < 4]
        print(f"{p}: +{total} screenshots; {len(short)} games still < 4 gameplay", flush=True)


if __name__ == "__main__":
    main()
