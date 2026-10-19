(() => {
  "use strict";

  // bump on every content update so browsers don't pair new pages with stale cached data
  const VERSION = "9";

  const MAKERS = [
    { key: "Nintendo", zh: "任天堂", en: "NINTENDO" },
    { key: "SEGA", zh: "世嘉", en: "SEGA" },
    { key: "Sony", zh: "索尼", en: "SONY" },
    { key: "Other", zh: "NEC · SNK · 万代", en: "NEC / SNK / BANDAI" },
    { key: "Arcade", zh: "街机厅", en: "ARCADE" },
  ];
  const PLATFORMS = [
    { key: "fc",  abbr: "FC",  group: "Nintendo", name: "Famicom / NES", zh: "红白机传奇", maker: "Nintendo", year: "1983", color: "#b3262e", ink: "#ffffff",
      intro: "红白机、小霸王、学习机——一代中国玩家的启蒙。超级马里奥、魂斗罗、勇者斗恶龙、重装机兵，8 位像素里藏着最纯粹的快乐。" },
    { key: "sfc", abbr: "SFC", group: "Nintendo", name: "Super Famicom / SNES", zh: "16 位 RPG 王朝", maker: "Nintendo", year: "1990", color: "#c9c3d6", ink: "#3b2a6b",
      intro: "日式 RPG 的黄金时代就诞生在这台灰紫色主机上。时空之轮、圣剑传说、最终幻想 VI、天地创造……每一卡都是传说。" },
    { key: "gb",  abbr: "GB",  group: "Nintendo", name: "Game Boy / Color", zh: "掌机之王", maker: "Nintendo", year: "1989 / 1998", color: "#8bac0f", ink: "#0f380f",
      intro: "四色绿屏里装下了整个世界。电池能撑一整个暑假，口袋妖怪、塞尔达、圣剑传说——无数人的游戏启蒙就在这块小屏幕上。" },
    { key: "gba", abbr: "GBA", group: "Nintendo", name: "Game Boy Advance", zh: "口袋里的超任", maker: "Nintendo", year: "2001", color: "#5b3fbf", ink: "#ffffff",
      intro: "32 位掌机把 SFC 时代的 2D 美学推向巅峰。火纹、黄金太阳、恶魔城、牧场物语，2D 像素游戏最后的黄金年代。" },
    { key: "nds", abbr: "NDS", group: "Nintendo", name: "Nintendo DS", zh: "双屏魔法", maker: "Nintendo", year: "2004", color: "#7d8691", ink: "#ffffff",
      intro: "双屏与触控笔带来的新玩法，也让 2D 像素在掌机上焕发第二春：苍月十字架、勇者斗恶龙重制、世界末日与你……" },
    { key: "md",  abbr: "MD",  group: "SEGA", name: "Mega Drive / Genesis", zh: "黑色 16 位旋风", maker: "SEGA", year: "1988", color: "#111111", ink: "#ffffff",
      intro: "“SEGA~！”一声开机音，代表着速度与热血。索尼克、怒之铁拳、梦幻之星、光明力量，世嘉 16 位的硬派魅力至今不减。" },
    { key: "mcd", abbr: "MCD", group: "SEGA", name: "Mega-CD / Sega CD", zh: "CD 时代先声", maker: "SEGA", year: "1991", color: "#4a4f57", ink: "#ffffff",
      intro: "MD 的光盘扩展，带来了 CD 音轨、动画过场与大容量：露娜、Popful Mail、Snatcher、Sonic CD，小众却满是珍宝。" },
    { key: "gg",  abbr: "GG",  group: "SEGA", name: "Game Gear", zh: "彩色掌机先锋", maker: "SEGA", year: "1990", color: "#0d0d0d", ink: "#ffd23f",
      intro: "比 GB 更早拥有彩色背光屏的掌机。光明力量外传、索尼克、忍 GG，耗电如虎，却是世嘉迷口袋里的骄傲。" },
    { key: "ss",  abbr: "SS",  group: "SEGA", name: "Sega Saturn", zh: "2D 性能怪兽", maker: "SEGA", year: "1994", color: "#2b3a8c", ink: "#ffffff",
      intro: "双 CPU 的 2D 怪兽。格斗、射击、SRPG 和大量日版独占名作让土星成为 2D 玩家心中永远的圣地。" },
    { key: "dc",  abbr: "DC",  group: "SEGA", name: "Dreamcast", zh: "世嘉最后的梦", maker: "SEGA", year: "1998", color: "#f26b1d", ink: "#ffffff",
      intro: "超越时代的梦之主机。街机级的 2D 格斗与射击、充满想象力的原创作品，短暂却灿烂的世嘉绝唱。" },
    { key: "ps",  abbr: "PS",  group: "Sony", name: "PlayStation", zh: "光盘时代的开拓者", maker: "Sony", year: "1994", color: "#9aa0a6", ink: "#111111",
      intro: "3D 浪潮中依然盛放的 2D 之花：月下夜想曲、幻想水浒传、圣剑传说 LOM……像素艺术在 CD 容量里迎来了新的高度。" },
    { key: "ps2", abbr: "PS2", group: "Sony", name: "PlayStation 2", zh: "史上最畅销主机", maker: "Sony", year: "2000", color: "#1d3fa8", ink: "#ffffff",
      intro: "3D 大作的天下，却也藏着手绘 2D 的瑰宝：奥丁领域、魔界战记、合集与移植……还有那些定义了一代人的 JRPG。" },
    { key: "psp", abbr: "PSP", group: "Sony", name: "PlayStation Portable", zh: "掌上 RPG 宝库", maker: "Sony", year: "2004", color: "#2a2a2a", ink: "#8fd3ff",
      intro: "宽屏掌机成了 JRPG 的避风港：空之轨迹、伊苏、皇家骑士团 命运之轮、最终幻想战略版 狮子战争，像素名作的重生之地。" },
    { key: "pce", abbr: "PCE", group: "Other", name: "PC Engine / TurboGrafx", zh: "小白机的逆袭", maker: "NEC / Hudson", year: "1987", color: "#f2f2f2", ink: "#c8102e",
      intro: "小巧的 HuCard 与最早的 CD-ROM²。天外魔境、伊苏、恶魔城X 血之轮回、无数射击名作，曾在日本力压 MD。" },
    { key: "neogeo", abbr: "NEO·GEO", group: "Other", name: "Neo Geo", zh: "百万街机在家中", maker: "SNK", year: "1990", color: "#d4a017", ink: "#111111",
      intro: "“The 100 Mega Shock!” 拳皇、合金弹头、侍魂、饿狼传说——街机厅里最耀眼的 2D 点阵，SNK 的黄金时代。" },
    { key: "ngp", abbr: "NGP", group: "Other", name: "Neo Geo Pocket Color", zh: "SNK 掌上格斗", maker: "SNK", year: "1998", color: "#1c6fb8", ink: "#ffffff",
      intro: "手感一流的微动摇杆，Q 版拳皇与 SNK vs. Capcom 卡片战斗，短命却被无数玩家怀念的小掌机。" },
    { key: "ws",  abbr: "WS",  group: "Other", name: "WonderSwan / Color", zh: "横井军平的遗作", maker: "Bandai", year: "1999", color: "#5fb3a1", ink: "#0d2b26",
      intro: "GB 之父横井军平的最后作品，日本限定。最终幻想重制、浪漫沙加、Riviera、Judgement Silversword，藏着不少 2D 珍品。" },
    { key: "arcade", abbr: "AC", group: "Arcade", name: "Arcade 街机", zh: "街机厅的回忆", maker: "Capcom / Konami / Taito / Sega …", year: "1978–2000s", color: "#7b2cbf", ink: "#ffffff",
      intro: "一枚游戏币、一排摇杆按键、围在身后看高手通关的人群——快打旋风、恐龙快打、三国志、雷电、泡泡龙，街机厅是一代人的青春。" },
  ];
  const PMAP = Object.fromEntries(PLATFORMS.map(p => [p.key, p]));

  const state = { games: [], byId: {}, loaded: false };
  const app = document.getElementById("app");

  // ---------- helpers ----------
  // called from <img onload>: show box art uncropped, and keep pixel art crisp when it is enlarged
  window.fitImg = el => {
    if (el.naturalHeight > el.naturalWidth) el.classList.add("portrait");
    const shown = Math.max(el.clientWidth, el.clientHeight * el.naturalWidth / el.naturalHeight);
    el.classList.toggle("px", !/-box\./.test(el.src) && el.naturalWidth < shown * (window.devicePixelRatio || 1));
  };
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pvars = p => `--pc:${p.color};--pc-ink:${p.ink}`;
  const fmtScore = n => (typeof n === "number" ? n.toFixed(1) : "—");
  const shot = g => (g.screenshots && g.screenshots[0]) || "";
  const img = (g, src, cls = "", alt = "") =>
    src ? `<img src="${esc(src)}" class="${cls}" alt="${esc(alt || g.titleZh || g.title)}" loading="lazy" onload="fitImg(this)" onerror="this.outerHTML='<div class=&quot;noshot ${cls}&quot;>NO IMAGE</div>'">`
        : `<div class="noshot ${cls}">${esc(PMAP[g.platform].abbr)}<br>NO IMAGE</div>`;
  const STYLE = { 3: "同款", 2: "近似", 1: "沾边", 0: "不同" };
  const styleBadge = g => g.styleMatch === 3 ? `<span class="style-star" title="同款风格" aria-label="同款风格">★</span>`
    : g.styleMatch === 2 ? `<span class="style-star s2" title="近似风格" aria-label="近似风格">★</span>` : "";
  const verdict = s => s >= 9.5 ? "殿堂级神作" : s >= 9 ? "白金推荐" : s >= 8.5 ? "金牌推荐" : s >= 8 ? "银牌推荐" : "值得一玩";
  const stampCls = s => (s >= 9.5 ? "score-stamp gold" : "score-stamp");

  // ---------- data ----------
  async function load() {
    const results = await Promise.all(PLATFORMS.map(p =>
      fetch(`data/${p.key}.json?v=${VERSION}`, { cache: "no-cache" }).then(r => (r.ok ? r.json() : [])).catch(() => [])
    ));
    results.forEach((list, i) => {
      const key = PLATFORMS[i].key;
      (Array.isArray(list) ? list : []).forEach((g, idx) => {
        g.platform = key;
        g.rank = idx + 1;
        g._search = [g.title, g.titleZh, g.titleJa, g.developer, g.publisher, g.genre, ...(g.tags || [])].join(" ").toLowerCase();
        state.games.push(g);
        state.byId[g.id] = g;
      });
    });
    PLATFORMS.forEach(p => {
      const list = state.games.filter(g => g.platform === p.key).sort((a, b) => (b.editorScore || 0) - (a.editorScore || 0));
      list.forEach((g, i) => (g.rank = i + 1));
    });
    state.loaded = true;
  }
  const gamesOf = key => state.games.filter(g => g.platform === key).sort((a, b) => a.rank - b.rank);

  // ---------- components ----------
  function card(g, { showPlat = true } = {}) {
    const p = PMAP[g.platform];
    return `<a class="card" href="#/g/${esc(g.id)}" style="${pvars(p)}">
      <div class="${stampCls(g.editorScore)}"><b>${fmtScore(g.editorScore)}</b><small>编辑评分</small></div>
      <div class="card-shot">
        ${img(g, shot(g))}
        ${showPlat ? `<span class="card-plat">${esc(p.abbr)}</span>` : ""}
        <span class="card-rank">No.${g.rank}</span>
        ${styleBadge(g)}
        ${(g.screenshots || []).length > 1 ? `<span class="card-pics">▣ ${g.screenshots.length}</span>` : ""}
      </div>
      <div class="card-body">
        <h3 class="card-title">${esc(g.titleZh || g.title)}</h3>
        <div class="card-sub">${esc(g.titleJa || g.title)}</div>
        ${g.tagline ? `<p class="card-tagline">${esc(g.tagline)}</p>` : ""}
        <div class="card-foot">
          ${g.genre ? `<span class="tag genre">${esc(g.genre)}</span>` : ""}
          ${g.is2D === false ? `<span class="tag d3">3D</span>` : ""}
          ${(g.tags || []).slice(0, 2).map(t => `<span class="tag">${esc(t)}</span>`).join("")}
          <span class="year">${esc(g.year || "")}</span>
        </div>
      </div>
    </a>`;
  }

  function rankRow(g, i) {
    const p = PMAP[g.platform];
    const s = shot(g);
    return `<a class="rank-row" href="#/g/${esc(g.id)}" style="${pvars(p)}">
      <div class="rank-no">${String(i + 1).padStart(2, "0")}</div>
      ${s ? `<img class="rank-thumb" src="${esc(s)}" alt="" loading="lazy" onload="fitImg(this)">` : `<div class="rank-thumb noshot" style="font-size:7px">${esc(p.abbr)}</div>`}
      <div class="rank-title">${esc(g.titleZh || g.title)}<small>${esc(p.abbr)} · ${esc(g.year || "")} · ${esc(g.developer || "")}</small></div>
      <div class="rank-score">${fmtScore(g.editorScore)}</div>
    </a>`;
  }

  function sectionHead(title, en, desc, p, more) {
    return `<div class="section-head" ${p ? `style="${pvars(p)}"` : ""}>
      <h2>${esc(title)}<span class="en">${esc(en)}</span></h2>
      ${more ? `<a class="more" href="${more}">查看全部 ▶</a>` : ""}
      ${desc ? `<p>${esc(desc)}</p>` : ""}
    </div>`;
  }

  // ---------- views ----------
  function viewHome() {
    const all = [...state.games].sort((a, b) => (b.editorScore || 0) - (a.editorScore || 0));
    const withShot = all.filter(g => g.coverShot ?? /-s1\.(png|webp)$/.test(shot(g))).slice(0, 24);
    const coverGame = withShot[Math.floor(Math.random() * withShot.length)] || all[0];
    const styled = all.filter(g => g.styleMatch === 3);
    const styleCount = styled.length;
    const stylePicks = styled.slice(0, 12);
    const coverPlats = [...PLATFORMS].sort(() => Math.random() - 0.5).slice(0, 8);
    const coverLines = coverPlats.map(p => {
      const top = gamesOf(p.key)[0];
      return top ? `<div class="cover-line" style="${pvars(p)}"><span>${p.abbr}</span>${esc(top.titleZh || top.title)}</div>` : "";
    }).join("");

    const tiles = MAKERS.map(m => `<h3 class="maker-head">${esc(m.zh)}<span>${esc(m.en)}</span></h3>
      <div class="plat-tiles">${PLATFORMS.filter(p => p.group === m.key).map(p => `<a class="plat-tile" href="#/p/${p.key}" style="${pvars(p)}">
        <span class="abbr">${p.abbr}</span><span class="name">${esc(p.zh)}</span>
        <span class="count">${gamesOf(p.key).length} 款推荐 ▶</span></a>`).join("")}</div>`).join("");

    const perPlatform = PLATFORMS.map(p => {
      const list = gamesOf(p.key).slice(0, 4);
      if (!list.length) return "";
      return sectionHead(`${p.abbr} 必玩精选`, p.name.toUpperCase(), p.intro, p, `#/p/${p.key}`) +
        `<div class="grid">${list.map(g => card(g, { showPlat: false })).join("")}</div>`;
    }).join("");

    app.innerHTML = `
      <section class="cover">
        ${coverGame && shot(coverGame) ? `<img class="cover-img" src="${esc(shot(coverGame))}" alt="" onload="fitImg(this)">` : ""}
        <div class="cover-feature"><b>${state.games.length}</b><small>款名作<br>大公开</small></div>
        <div class="cover-inner">
          <span class="cover-kicker">超大特集 · ${PLATFORMS.length} 大平台完全收录</span>
          <h1 class="cover-title">2D 像素<br>名作殿堂<small>${PLATFORMS.map(p => p.abbr).join(" · ")}</small></h1>
          ${coverGame ? `<a href="#/g/${esc(coverGame.id)}" class="cover-line" style="margin-top:14px;${pvars(PMAP[coverGame.platform])}"><span>封面</span>${esc(coverGame.titleZh || coverGame.title)} ▶</a>` : ""}
          <div class="cover-lines" style="margin-top:18px">${coverLines}</div>
        </div>
      </section>

      ${stylePicks.length ? sectionHead("和你的截图同款", "STYLE PICKS", `俯视角 2D 像素画面、能在村庄里自由走动的日式 RPG / ARPG —— 全部 ${styleCount} 款同款风格中评分最高的 12 款。`, null, "#/style") +
        `<div class="grid">${stylePicks.map(g => card(g)).join("")}</div>` : ""}

      ${sectionHead("平台导航", "SELECT PLATFORM", `${PLATFORMS.length} 台主机，${state.games.length} 款名作。选择你的主机，开启时光机。`, null, "#/all")}
      ${tiles}

      ${sectionHead("编辑部综合排行 TOP 20", "RANKING", `${PLATFORMS.length} 大平台混战，编辑部评分最高的 20 款。`)}
      <div class="ranking">${all.slice(0, 20).map(rankRow).join("")}</div>

      ${perPlatform}
    `;
  }

  const pageState = { genre: "全部", only2D: false, style: 0, sort: "score", plat: "全部", limit: 60 };
  const PAGE = 60;

  function viewList(key) {
    const p = key ? PMAP[key] : null;
    if (key && !p) return viewNotFound();
    const base = p ? gamesOf(key) : [...state.games].sort((a, b) => (b.editorScore || 0) - (a.editorScore || 0));
    const scoped = !p && pageState.plat !== "全部" ? base.filter(g => g.platform === pageState.plat) : base;
    const genreCount = {};
    scoped.forEach(g => g.genre && (genreCount[g.genre] = (genreCount[g.genre] || 0) + 1));
    const genres = ["全部", ...Object.keys(genreCount).sort((a, b) => genreCount[b] - genreCount[a])];
    if (!genres.includes(pageState.genre)) pageState.genre = "全部";

    let shown = scoped.filter(g => (pageState.genre === "全部" || g.genre === pageState.genre) && (!pageState.only2D || g.is2D !== false) && (g.styleMatch ?? 0) >= pageState.style);
    if (pageState.sort === "year") shown = [...shown].sort((a, b) => (a.year || 0) - (b.year || 0));
    if (pageState.sort === "style") shown = [...shown].sort((a, b) => (b.styleMatch ?? 0) - (a.styleMatch ?? 0) || (b.editorScore || 0) - (a.editorScore || 0));
    if (pageState.sort === "title") shown = [...shown].sort((a, b) => (a.titleZh || a.title).localeCompare(b.titleZh || b.title, "zh"));
    const visible = shown.slice(0, pageState.limit);

    const hero = p ? `
      <section class="platform-hero" style="${pvars(p)}">
        <div class="platform-badge"${p.abbr.length > 4 ? ' style="font-size:12px"' : ""}>${p.abbr}</div>
        <div>
          <h1>${esc(p.zh)} · ${esc(p.name)}</h1>
          <div class="meta">${esc(p.maker)} · ${esc(p.year)} · ${base.length} GAMES</div>
          <p>${esc(p.intro)}</p>
        </div>
      </section>` : `
      <section class="platform-hero" style="--pc:#ffd23f;--pc-ink:#1b1a1f">
        <div class="platform-badge">ALL</div>
        <div>
          <h1>全部名作 · 名鉴</h1>
          <div class="meta">${PLATFORMS.length} PLATFORMS · ${state.games.length} GAMES</div>
          <p>跨平台按类型浏览全部收录游戏。想找下一款 RPG？选“角色扮演”，再勾上“只看 2D”。</p>
        </div>
      </section>
      <div class="toolbar plat-filter">
        ${["全部", ...PLATFORMS.map(x => x.key)].map(k => `<button class="chip ${k === pageState.plat ? "on" : ""}" data-plat="${k}">${k === "全部" ? "全部平台" : esc(PMAP[k].abbr)}</button>`).join("")}
      </div>`;

    app.innerHTML = `${hero}
      <div class="toolbar">
        ${genres.map(g => `<button class="chip ${g === pageState.genre ? "on" : ""}" data-genre="${esc(g)}">${esc(g)}${g !== "全部" ? `<small> ${genreCount[g]}</small>` : ""}</button>`).join("")}
        <span class="spacer"></span>
        <select data-style aria-label="风格">
          <option value="0" ${pageState.style === 0 ? "selected" : ""}>风格：全部</option>
          <option value="3" ${pageState.style === 3 ? "selected" : ""}>风格：同款</option>
          <option value="2" ${pageState.style === 2 ? "selected" : ""}>风格：同款+近似</option>
        </select>
        <button class="chip ${pageState.only2D ? "on" : ""}" data-2d>只看 2D</button>
        <select data-sort aria-label="排序">
          <option value="score" ${pageState.sort === "score" ? "selected" : ""}>按评分</option>
          <option value="year" ${pageState.sort === "year" ? "selected" : ""}>按年份</option>
          <option value="title" ${pageState.sort === "title" ? "selected" : ""}>按名称</option>
          <option value="style" ${pageState.sort === "style" ? "selected" : ""}>按风格相似</option>
        </select>
      </div>
      <p class="result-count">共 ${shown.length} 款</p>
      ${shown.length ? `<div class="grid">${visible.map(g => card(g, { showPlat: !p })).join("")}</div>` : `<div class="empty">没有符合条件的游戏</div>`}
      ${shown.length > visible.length ? `<div class="more-wrap"><button class="more-btn" data-more>加载更多（还有 ${shown.length - visible.length} 款）</button></div>` : ""}
    `;

    const rerender = () => { pageState.limit = PAGE; viewList(key); };
    app.querySelectorAll("[data-genre]").forEach(b => b.onclick = () => { pageState.genre = b.dataset.genre; rerender(); });
    app.querySelectorAll("[data-plat]").forEach(b => b.onclick = () => { pageState.plat = b.dataset.plat; rerender(); });
    app.querySelector("[data-style]").onchange = e => { pageState.style = +e.target.value; rerender(); };
    app.querySelector("[data-2d]").onclick = () => { pageState.only2D = !pageState.only2D; rerender(); };
    app.querySelector("[data-sort]").onchange = e => { pageState.sort = e.target.value; rerender(); };
    const more = app.querySelector("[data-more]");
    if (more) more.onclick = () => { const y = window.scrollY; pageState.limit += PAGE; viewList(key); window.scrollTo(0, y); };
  }

  function viewGame(id) {
    const g = state.byId[id];
    if (!g) return viewNotFound();
    const p = PMAP[g.platform];
    const shots = g.screenshots || [];
    const paras = String(g.description || "").split(/\n+/).filter(Boolean);
    const related = gamesOf(g.platform).filter(x => x.id !== g.id && x.genre === g.genre).slice(0, 3);
    const more = related.length ? related : gamesOf(g.platform).filter(x => x.id !== g.id).slice(0, 3);
    const altNames = [g.titleJa, g.title].filter((v, i, a) => v && v !== g.titleZh && a.indexOf(v) === i).join(" / ");

    app.innerHTML = `
      <a class="back" href="#/p/${p.key}" style="${pvars(p)};--accent:${p.color}">◀ 返回 ${p.abbr} 专区</a>
      <section class="detail-head" style="${pvars(p)}">
        <div class="${stampCls(g.editorScore)}"><b>${fmtScore(g.editorScore)}</b><small>编辑评分</small></div>
        ${img(g, shot(g), "hero-img")}
        <div class="detail-title-box">
          <span class="plat">${p.abbr} · No.${g.rank}</span>
          <h1>${esc(g.titleZh || g.title)}</h1>
          ${altNames ? `<div class="alt">${esc(altNames)}</div>` : ""}
          ${g.tagline ? `<div class="tagline">${esc(g.tagline)}</div>` : ""}
        </div>
      </section>

      <div class="detail-body">
        <div>
          <article class="article">
            <h3>编辑部推荐</h3>
            <div class="text">${paras.map(t => `<p>${esc(t)}</p>`).join("")}</div>
            ${(g.highlights || []).length ? `<ul class="highlights">${g.highlights.map(h => `<li>${esc(h)}</li>`).join("")}</ul>` : ""}
          </article>
          ${shots.length ? `
          <div class="section-head" style="${pvars(p)}"><h2>游戏画面<span class="en">SCREENSHOTS × ${shots.length}</span></h2></div>
          <div class="gallery">${shots.map((s, i) => `<button data-shot="${i}" aria-label="查看大图">${img(g, s, "", `${g.titleZh || g.title} 截图 ${i + 1}`)}</button>`).join("")}</div>` : ""}
        </div>

        <aside class="side">
          ${g.styleMatch != null ? `<div class="panel style-panel s${g.styleMatch}">
            <h3>风格匹配</h3>
            <div class="style-meter">${[1, 2, 3].map(i => `<i class="${i <= g.styleMatch ? "on" : ""}"></i>`).join("")}<b>${STYLE[g.styleMatch]}</b></div>
            ${g.styleNote ? `<p>${esc(g.styleNote)}</p>` : ""}
          </div>` : ""}
          <div class="panel editor-score">
            <h3>编辑部评分</h3>
            <div class="big">${fmtScore(g.editorScore)}</div>
            <div class="bar"><i style="width:${Math.max(0, Math.min(100, (g.editorScore || 0) * 10))}%"></i></div>
            <div class="verdict">★ ${verdict(g.editorScore || 0)} ★</div>
          </div>
          ${g.cover ? `<div class="panel box-panel"><h3>${g.platform === "arcade" ? "宣传海报" : "游戏包装"}</h3><button data-cover aria-label="查看包装大图"><img src="${esc(g.cover)}" alt="${esc(g.titleZh || g.title)} 包装" loading="lazy"></button></div>` : ""}
          <div class="panel">
            <h3>游戏档案</h3>
            <table class="info-table">
              <tr><th>平台</th><td>${esc(p.name)}</td></tr>
              <tr><th>发售</th><td>${esc(g.year || "—")}</td></tr>
              <tr><th>开发</th><td>${esc(g.developer || "—")}</td></tr>
              <tr><th>发行</th><td>${esc(g.publisher || "—")}</td></tr>
              <tr><th>类型</th><td>${esc(g.genre || "—")}${g.is2D === false ? " · 3D" : " · 2D"}</td></tr>
              <tr><th>人数</th><td>${esc(g.players || "—")}</td></tr>
              ${(g.tags || []).length ? `<tr><th>标签</th><td>${g.tags.map(t => `<span class="tag">${esc(t)}</span>`).join(" ")}</td></tr>` : ""}
            </table>
          </div>
          ${(g.reviews || []).length ? `
          <div class="panel">
            <h3>媒体评价</h3>
            <p class="review-note">分数取自各媒体评测，评语为编辑部中文概括</p>
            ${g.reviews.map(r => `<div class="review">
              <div class="review-head"><span class="review-src">${esc(r.source)}</span>${r.score ? `<span class="review-score">${esc(r.score)}</span>` : ""}</div>
              ${r.quote ? `<q>${esc(r.quote)}</q>` : ""}
            </div>`).join("")}
          </div>` : ""}
        </aside>
      </div>

      ${more.length ? `<section class="related">${sectionHead("同平台推荐", "MORE GAMES", "", p, `#/p/${p.key}`)}<div class="grid">${more.map(x => card(x, { showPlat: false })).join("")}</div></section>` : ""}
    `;

    app.querySelectorAll("[data-shot]").forEach(b => b.onclick = () => openLightbox(shots, +b.dataset.shot));
    const coverBtn = app.querySelector("[data-cover]");
    if (coverBtn) coverBtn.onclick = () => openLightbox([g.cover], 0);
  }

  function viewSearch(q) {
    const term = q.trim().toLowerCase();
    const list = term ? state.games.filter(g => g._search.includes(term)).sort((a, b) => (b.editorScore || 0) - (a.editorScore || 0)) : [];
    app.innerHTML = `${sectionHead(`搜索：${q || "…"}`, "SEARCH", term ? `找到 ${list.length} 款游戏` : "输入关键字开始搜索")}
      ${list.length ? `<div class="grid">${list.map(g => card(g)).join("")}</div>` : term ? `<div class="empty">GAME OVER —— 没有找到相关游戏</div>` : ""}`;
  }

  function viewNotFound() {
    app.innerHTML = `<div class="empty"><p class="blink" style="font-family:var(--pixel)">GAME OVER</p><p>页面不存在</p><a class="back" href="#/">返回封面</a></div>`;
  }

  // ---------- lightbox ----------
  const lb = document.getElementById("lightbox");
  const lbImg = lb.querySelector("img");
  let lbList = [], lbIdx = 0;
  lbImg.onload = () => fitImg(lbImg);
  function openLightbox(list, i) { lbList = list; lbIdx = i; lbImg.src = list[i]; lb.hidden = false; document.body.style.overflow = "hidden"; }
  function closeLightbox() { lb.hidden = true; document.body.style.overflow = ""; }
  function stepLightbox(d) { lbIdx = (lbIdx + d + lbList.length) % lbList.length; lbImg.src = lbList[lbIdx]; }
  lb.querySelector(".lb-close").onclick = closeLightbox;
  lb.querySelector(".lb-prev").onclick = e => { e.stopPropagation(); stepLightbox(-1); };
  lb.querySelector(".lb-next").onclick = e => { e.stopPropagation(); stepLightbox(1); };
  lb.onclick = e => { if (e.target === lb) closeLightbox(); };
  document.addEventListener("keydown", e => {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") stepLightbox(-1);
    if (e.key === "ArrowRight") stepLightbox(1);
  });
  let touchX = null;
  lb.addEventListener("touchstart", e => (touchX = e.touches[0].clientX), { passive: true });
  lb.addEventListener("touchend", e => {
    if (touchX == null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) stepLightbox(dx < 0 ? 1 : -1);
    touchX = null;
  });

  // ---------- nav / search ----------
  const nav = document.getElementById("platform-nav");
  nav.innerHTML = `<a href="#/" data-key="home" style="--pc:#ffd23f;--pc-ink:#1b1a1f">封面</a><a href="#/all" data-key="all" style="--pc:#ffd23f;--pc-ink:#1b1a1f">全部</a>` +
    PLATFORMS.map(p => `<a href="#/p/${p.key}" data-key="${p.key}" style="${pvars(p)}">${p.abbr}</a>`).join("");

  const searchBar = document.getElementById("search-bar");
  const searchInput = document.getElementById("search-input");
  document.getElementById("search-btn").onclick = () => {
    searchBar.hidden = !searchBar.hidden;
    if (!searchBar.hidden) searchInput.focus();
  };
  let searchTimer;
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      const q = searchInput.value;
      location.hash = q ? `#/search/${encodeURIComponent(q)}` : "#/";
    }, 200);
  });

  const now = new Date();
  document.getElementById("issue-date").textContent = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}`;

  // ---------- router ----------
  let lastRoute = "";
  function route() {
    if (!state.loaded) return;
    const hash = location.hash.replace(/^#/, "") || "/";
    const [, kind, arg] = hash.split("/");
    const activeKey = kind === "p" ? arg : kind === "all" ? "all" : kind === "g" ? state.byId[decodeURIComponent(arg || "")]?.platform : kind ? "" : "home";
    if (kind !== lastRoute || kind === "p") Object.assign(pageState, { genre: "全部", limit: PAGE });
    nav.querySelectorAll("a").forEach(a => a.classList.toggle("active", a.dataset.key === activeKey));
    const active = nav.querySelector("a.active");
    if (active) active.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });

    if (!kind) viewHome();
    else if (kind === "p") viewList(arg);
    else if (kind === "all") viewList(null);
    else if (kind === "style") { Object.assign(pageState, { style: 3, plat: "全部", genre: "全部" }); location.replace("#/all"); return; }
    else if (kind === "g") viewGame(decodeURIComponent(arg || ""));
    else if (kind === "search") viewSearch(decodeURIComponent(arg || ""));
    else viewNotFound();

    const changedPage = kind !== "search" || !lastRoute.startsWith("search");
    if (changedPage) window.scrollTo(0, 0);
    lastRoute = kind || "";
    document.title = (kind === "g" && state.byId[decodeURIComponent(arg)] ? `${state.byId[decodeURIComponent(arg)].titleZh || state.byId[decodeURIComponent(arg)].title} · ` : "") + "像素宝典 PIXEL CLASSICS";
  }
  window.addEventListener("hashchange", route);

  load().then(route);
})();
