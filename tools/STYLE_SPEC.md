# Style-match round (风格匹配)

The user's reference screenshot: a **top-down (overhead / 3⁄4 view) 2D pixel-art Japanese RPG/action-RPG
village** — bright saturated colors, a chibi hero walking freely around a town with a shop sign (杂货铺),
river, wooden bridge, well, trees, barrels; a small HP gauge HUD in the corner. Think Secret of Mana,
Terranigma, Zelda: Link's Awakening / Minish Cap, Ys, Alundra, Illusion of Gaia, Golden Sun, Pokémon,
Harvest Moon, Chrono Trigger, Dragon Quest, Final Fantasy VI, Legend of Mana, Beyond Oasis.

## 1. Rate every existing game in `data/<platform>.json`
Add two fields to EVERY entry:

```json
"styleMatch": 3,
"styleNote": "俯视角像素画面，可自由探索村庄与商店"   // ≤ 24 Chinese chars, why it does / doesn't match
```

| styleMatch | label | rule |
|---|---|---|
| 3 | 同款 | Top-down/overhead/3⁄4 2D sprite or pixel graphics **and** you walk around towns/villages/fields freely (NPCs, shops). RPG, ARPG, action-adventure, farming/life-sim adventure. Pre-rendered-2D or 2D sprites on simple 3D maps count if it *looks* like the screenshot. |
| 2 | 近似 | Clearly related but not the same: 2D pixel RPG/SRPG with towns but battles/exploration presented differently (strategy-RPG maps with town scenes, side-view exploration RPGs like Valkyrie Profile / Odin Sphere, first-person dungeon RPGs with pixel towns, top-down action-adventure without towns, Metroidvanias with towns/shops). |
| 1 | 沾边 | 2D pixel-art game of another kind (platformer, Metroidvania without towns, beat-'em-up, adventure) — same era/art feel only. |
| 0 | 不同 | Shooters, fighting, puzzle, sports, racing, music, card games, and anything 3D. |

Be strict and honest — the point is to tell the user which games really look/play like the screenshot.

## 2. Add NEW games that match (styleMatch 3, or 2 when the platform has few 3s)
Look specifically for overhead 2D pixel RPG/ARPGs with towns on your platform — classics AND lesser-known
gems (Japan-only titles welcome). Skip anything already in the file. Follow `tools/AGENT_SPEC.md` for every
field (real review scores only, magazine-style Chinese description, etc.) and fetch images with
`tools/thumbs.py` (≥3 images, ≥2 gameplay). Box art: just use what thumbs.py gives — HD covers are added
later by the coordinator.

## 3. Editing rules — IMPORTANT
- Since your last round the coordinator changed files: pixel-duplicate screenshots were removed and most
  `cover` files were replaced with HD versions. **Load the current `data/<platform>.json` from disk, modify
  it, and save it. Never regenerate it from your old build scripts, never re-download or delete existing
  images.**
- Keep the array sorted by editorScore desc. Only touch your own platform's files.
- Finish with `python3 tools/validate.py <platform>` (0 problems) and `python3 tools/dedupe.py <platform>`
  (dry run: 0 duplicates). Then also check every game has `styleMatch`:
  `python3 -c "import json;d=json.load(open('data/<p>.json'));print([g['id'] for g in d if 'styleMatch' not in g])"` → `[]`.
- Reply with: count per styleMatch level (before additions), the list of new games, and anything doubtful.
