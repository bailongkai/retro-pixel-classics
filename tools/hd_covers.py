#!/usr/bin/env python3
"""Replace low-res box art (libretro, max 512px) with high-res scans from the LaunchBox Games DB.

Needs the LaunchBox metadata dump:
    curl -L -o /tmp/lb/Metadata.zip https://gamesdb.launchbox-app.com/Metadata.zip && unzip -d /tmp/lb /tmp/lb/Metadata.zip

Usage:
    python3 tools/hd_covers.py --match [platform ...]     # write /tmp/lb/matches.json, print unmatched
    python3 tools/hd_covers.py --download [platform ...]  # download, resize, update data/<p>.json
"""
import glob
import json
import os
import re
import subprocess
import sys
import urllib.request
import xml.etree.ElementTree as ET

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LB = "/tmp/lb"
MAX_PX = 1000

PLATFORMS = {
    "fc": ["Nintendo Entertainment System", "Nintendo Famicom Disk System"],
    "sfc": ["Super Nintendo Entertainment System", "Nintendo Satellaview"],
    "gb": ["Nintendo Game Boy", "Nintendo Game Boy Color"],
    "gba": ["Nintendo Game Boy Advance"],
    "nds": ["Nintendo DS"],
    "md": ["Sega Genesis"],
    "mcd": ["Sega CD"],
    "gg": ["Sega Game Gear"],
    "ss": ["Sega Saturn"],
    "dc": ["Sega Dreamcast"],
    "ps": ["Sony Playstation"],
    "ps2": ["Sony Playstation 2"],
    "psp": ["Sony PSP"],
    "pce": ["NEC TurboGrafx-16", "NEC TurboGrafx-CD"],
    "neogeo": ["SNK Neo Geo AES", "SNK Neo Geo MVS", "SNK Neo Geo CD"],
    "ngp": ["SNK Neo Geo Pocket Color", "SNK Neo Geo Pocket"],
    "ws": ["WonderSwan Color", "WonderSwan"],
    "arcade": ["Arcade"],
}
ROMAN = {"ii": "2", "iii": "3", "iv": "4", "v": "5", "vi": "6", "vii": "7", "viii": "8", "ix": "9", "x": "10"}


def norm(s):
    s = s.lower().replace("&", " and ").replace("é", "e").replace("ō", "o").replace("ū", "u")
    s = re.sub(r"\([^)]*\)", " ", s)
    words = re.findall(r"[a-z0-9]+", s)
    words = [ROMAN.get(w, w) for w in words if w not in ("the", "a", "of")]
    return "".join(words)


def load_db():
    games, names, images = {}, {}, {}
    wanted = {p for ps in PLATFORMS.values() for p in ps}
    for _, el in ET.iterparse(os.path.join(LB, "Metadata.xml")):
        if el.tag == "Game":
            plat = el.findtext("Platform")
            if plat in wanted:
                gid = el.findtext("DatabaseID")
                year = (el.findtext("ReleaseYear") or el.findtext("ReleaseDate") or "")[:4]
                games[gid] = {"name": el.findtext("Name"), "platform": plat, "year": year}
            el.clear()
        elif el.tag == "GameAlternateName":
            names.setdefault(el.findtext("DatabaseID"), []).append(el.findtext("AlternateName") or "")
            el.clear()
        elif el.tag == "GameImage":
            t = el.findtext("Type")
            # arcade games have no box: use the original promotional flyer instead
            if t == "Box - Front" or t == "Advertisement Flyer - Front":
                key = el.findtext("DatabaseID") if t == "Box - Front" else "flyer:" + el.findtext("DatabaseID")
                images.setdefault(key, []).append((el.findtext("Region") or "", el.findtext("FileName")))
            el.clear()
    return games, names, images


def candidates_for(g):
    out = [g["title"]]
    # "Dragon Quest V (天空の花嫁)" style or "Foo / Bar" titles
    out += [t.strip() for t in re.split(r"[/:]", g["title"]) if len(t.strip()) > 3]
    return [norm(x) for x in out if x]


def match_all(plats):
    games, names, images = load_db()
    index = {}
    for gid, info in games.items():
        if gid not in images and "flyer:" + gid in images:
            images[gid] = images["flyer:" + gid]
        if gid not in images:
            continue
        for n in [info["name"]] + names.get(gid, []):
            index.setdefault((info["platform"], norm(n)), set()).add(gid)
    result, missing = {}, []
    for p in plats:
        for g in json.load(open(os.path.join(ROOT, "data", p + ".json"))):
            hits = set()
            for c in candidates_for(g):
                for lp in PLATFORMS[p]:
                    hits |= index.get((lp, c), set())
                if hits:
                    break
            if not hits:
                missing.append(f"{g['id']}  ({g['title']})")
                continue
            # prefer the release closest to our year
            best = sorted(hits, key=lambda h: abs(int(games[h]["year"] or 0) - int(g.get("year") or 0)))[0]
            prefer = ["Japan"] if g.get("titleJa") else []
            prefer += ["North America", "United States", "World", "Europe", "Japan", ""]
            imgs = images[best]
            imgs.sort(key=lambda r: prefer.index(r[0]) if r[0] in prefer else 99)
            result[g["id"]] = {"platform": p, "lb": best, "lbName": games[best]["name"], "region": imgs[0][0], "file": imgs[0][1]}
    return result, missing


def download(plats):
    matches = json.load(open(os.path.join(LB, "matches.json")))
    for p in plats:
        path = os.path.join(ROOT, "data", p + ".json")
        data = json.load(open(path))
        done = 0
        for g in data:
            m = matches.get(g["id"])
            if not m:
                continue
            rel = f"images/{p}/{g['id']}-box.jpg"
            dst = os.path.join(ROOT, rel)
            cur = os.path.join(ROOT, g["cover"]) if g.get("cover") else ""
            if cur and os.path.exists(cur):  # any format (.jpg/.webp): skip if already HD
                out = subprocess.run(["sips", "-g", "pixelWidth", "-g", "pixelHeight", cur], capture_output=True, text=True).stdout
                if max(int(x) for x in re.findall(r"pixel(?:Width|Height): (\d+)", out)) > 520:
                    continue  # already HD
            tmp = dst + ".src"
            try:
                req = urllib.request.Request("https://images.launchbox-app.com/" + urllib.request.quote(m["file"]),
                                             headers={"User-Agent": "Mozilla/5.0"})
                with urllib.request.urlopen(req, timeout=60) as r, open(tmp, "wb") as f:
                    f.write(r.read())
                out = subprocess.run(["sips", "-g", "pixelWidth", "-g", "pixelHeight", tmp], capture_output=True, text=True).stdout
                w = int(out.split("pixelWidth:")[1].split()[0]); h = int(out.split("pixelHeight:")[1].split()[0])
                if max(w, h) <= 520:  # not better than what we have
                    os.remove(tmp)
                    continue
                args = ["sips", "-s", "format", "jpeg", "-s", "formatOptions", "80"]
                if max(w, h) > MAX_PX:
                    args += ["-Z", str(MAX_PX)]
                subprocess.run(args + [tmp, "--out", dst], capture_output=True, check=True)
                os.remove(tmp)
                old = g.get("cover")
                if old and old != rel and os.path.exists(os.path.join(ROOT, old)):
                    os.remove(os.path.join(ROOT, old))
                g["cover"] = rel
                done += 1
            except Exception as e:  # noqa: BLE001
                print(f"  ! {g['id']}: {e}")
                if os.path.exists(tmp):
                    os.remove(tmp)
        json.dump(data, open(path, "w"), ensure_ascii=False, indent=2)
        print(f"{p}: {done} HD covers")


def main():
    args = sys.argv[1:]
    plats = [a for a in args if not a.startswith("--")] or sorted(os.path.basename(f)[:-5] for f in glob.glob(os.path.join(ROOT, "data", "*.json")))
    if "--match" in args:
        result, missing = match_all(plats)
        json.dump(result, open(os.path.join(LB, "matches.json"), "w"), ensure_ascii=False, indent=1)
        print(f"matched {len(result)}, missing {len(missing)}")
        print("\n".join(missing))
    elif "--download" in args:
        download(plats)
    else:
        print(__doc__)


if __name__ == "__main__":
    main()
