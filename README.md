# 像素宝典 PIXEL CLASSICS

怀旧游戏推荐特辑 —— 以 90 年代游戏杂志风格，收录 GB / GBA / SFC / MD / SS / PS / DC / PS2 八大平台的 2D 名作推荐、介绍、媒体评价与游戏截图。

- 纯静态站点（HTML + CSS + 原生 JS），无需构建，直接部署到 GitHub Pages
- 适配手机与桌面
- 支持平台筛选、类型筛选、只看 2D、排序、全局搜索、截图大图浏览

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

## 添加游戏

编辑 `data/<平台>.json`，按现有条目格式追加即可；截图放入 `images/<平台>/`，在 `screenshots` 字段中引用相对路径。

---
游戏名称、截图等版权归各厂商所有，本项目仅作个人非商业收藏与推荐用途。
