# Data spec for platform research agents

Project root: `/Users/dk-mac-mini/Projects/game-index-app` — a Chinese "retro game magazine" style site (像素宝典).
User taste: loves retro games, especially **2D pixel-art games**; their favorite reference is a Japanese top-down
2D action-RPG village scene. Bias toward Japanese RPG / ARPG / SRPG classics and hidden gems, but cover a
well-rounded mix (action, platformer, shooter, fighting, puzzle, adventure, racing, etc.).

## Output: `data/<platform>.json`
A JSON array sorted by `editorScore` descending. Each element:

```json
{
  "id": "<platform>-<kebab-slug>",          // unique, ascii
  "title": "English title",
  "titleZh": "常用中文名",
  "titleJa": "日文原名（日本游戏才填，否则空字符串）",
  "year": 1995,
  "developer": "…",
  "publisher": "…",
  "genre": "角色扮演",                        // short Chinese genre label; reuse common labels:
                                             // 角色扮演 / 动作角色扮演 / 战略角色扮演 / 动作 / 平台跳跃 / 动作冒险 /
                                             // 射击 / 格斗 / 动作清版 / 解谜 / 冒险 / 竞速 / 模拟经营 / 体育 / 音乐
  "tags": ["像素", "…"],                     // 2-4 short Chinese tags
  "players": "1-2",
  "tagline": "杂志风一句话短评（20字以内）",
  "description": "中文，2-3段，用\n\n分隔，约200-300字，90年代《电子游戏软件》《游戏机实用技术》编辑口吻：生动、有热情，讲清楚玩法特色以及为什么今天仍值得玩。",
  "highlights": ["3-4条中文看点"],
  "reviews": [ {"source": "Fami通", "score": "36/40", "quote": "该媒体观点的中文一句话概括"} ],
  "editorScore": 9.2,                        // 0-10, one decimal; our magazine's opinion
  "is2D": true,
  "screenshots": ["images/<platform>/<id>-s1.png", "…"],   // gameplay first, title screen last
  "cover": "images/<platform>/<id>-box.jpg"                  // box art, or "" if none
}
```

Reviews: 1-3 per game, **real** scores only (Famitsu, IGN, GameSpot, EGM, Edge, Metacritic, GameRankings,
Nintendo Power, Mean Machines, Sega Saturn Magazine, Retro Gamer, Hardcore Gaming 101, etc.). Verify with
WebSearch/WebFetch (English Wikipedia "Reception" tables are a good fast source; ja.wikipedia often lists
ファミ通 クロスレビュー scores). If you cannot confirm a score, omit that review rather than guess. A game may have
`"reviews": []` if nothing verifiable exists (rare). Quotes are Chinese paraphrases.

## Images — use the shared script (fast, no rate limits)
```bash
cd /Users/dk-mac-mini/Projects/game-index-app
python3 tools/thumbs.py <platform> --list "Game Name"          # see libretro-thumbnails matches
python3 tools/thumbs.py <platform> <id> "Exact Base Name (Japan)" --snaps 3
```
It downloads up to 3 distinct gameplay snaps (one per regional release), a title screen and box art,
compresses them, and prints `{"screenshots": [...], "cover": "..."}` — copy those paths into the JSON.
Use `--list` first when the name is ambiguous (Japanese-only games are often listed under romanized
Japanese names, e.g. "Tengai Makyou", "Seiken Densetsu 3", "Dragon Quest V - Tenkuu no Hanayome"). Avoid
hacks/betas/protos. Run several games in one shell loop to save time.

**Goal: every game has ≥3 images (≥2 gameplay).** If libretro gives fewer than 2 gameplay snaps, add extra
real in-game screenshots from other sources (Wikipedia/Wikimedia `upload.wikimedia.org`, TheGamesDB
`cdn.thegamesdb.net`, etc.; `curl -L -A "Mozilla/5.0"`), saved as `images/<platform>/<id>-x1.png|jpg`.
Verify each file with `file` (delete HTML/error pages) and keep each < 400KB (`sips -Z 800 f` to shrink).
Box art never goes in `screenshots` — it goes in `cover`. Only reference files that exist.
Never touch other platforms' files.

## Finish
Validate: `python3 tools/validate.py <platform>` (checks JSON, required fields, file existence, image counts).
Reply with a short summary: game count, list of titles, games with < 3 images, any doubtful facts.
