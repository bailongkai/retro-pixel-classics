# 像素宝典 PIXEL CLASSICS

怀旧游戏推荐特辑 —— 以 90 年代游戏杂志风格，收录 FC / SFC / GB / GBA / NDS / MD / MCD / GG / SS / DC / PS / PS2 / PSP / PCE / NEO·GEO / NGP / WS / 街机 共 18 个平台、820 款 2D 名作的推荐、介绍、媒体评价、游戏截图与包装。

- 纯静态站点（HTML + CSS + 原生 JS），无需构建，直接部署到 GitHub Pages
- 适配手机与桌面
- 支持平台筛选、类型筛选、只看 2D、排序、全局搜索、截图大图浏览
- 「风格匹配」评级（styleMatch 0–3）：以俯视角 2D 像素日式 RPG/ARPG 村庄画面为基准，标出「同款」「近似」游戏，评级标准见 `tools/STYLE_SPEC.md`

## 目录结构

```
index.html          入口
css/style.css       杂志风样式
js/app.js           路由与渲染（#/、#/p/<平台>、#/g/<游戏id>、#/search/<关键字>）
data/<平台>.json     各平台游戏数据
images/<平台>/       游戏截图
fonts/              Press Start 2P 像素字体（SIL OFL）
```

## 本地预览

```bash
python3 -m http.server 8000
# 打开 http://localhost:8000
```

## 工具

```bash
python3 tools/thumbs.py <平台> --list "游戏名"            # 在 libretro-thumbnails 中查找
python3 tools/thumbs.py <平台> <id> "精确名称 (Japan)"     # 下载游戏画面/标题画面/包装
python3 tools/validate.py [平台]                         # 校验数据与图片
python3 tools/dedupe.py [--apply] [平台]                  # 去除重复截图（需要 Pillow）
python3 tools/hd_covers.py --match | --download [平台]     # 从 LaunchBox 获取高清包装
python3 tools/more_shots.py [--target 6] [平台]           # 从 LaunchBox / TheGamesDB 补充游戏画面
python3 tools/to_webp.py [平台]                           # 转为 WebP（像素图无损、照片有损 q82），添加图片后执行
```

## 添加游戏

编辑 `data/<平台>.json`，按现有条目格式追加即可；截图放入 `images/<平台>/`，在 `screenshots` 字段中引用相对路径。

---
游戏名称、截图等版权归各厂商所有，本项目仅作个人非商业收藏与推荐用途。
