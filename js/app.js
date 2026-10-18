(() => {
  "use strict";

  const PLATFORMS = [
    { key: "gb",  abbr: "GB",  name: "Game Boy / Color", zh: "掌机之王", maker: "Nintendo", year: "1989 / 1998", color: "#8bac0f", ink: "#0f380f",
      intro: "四色绿屏里装下了整个世界。电池能撑一整个暑假，口袋妖怪、塞尔达、圣剑传说——无数人的游戏启蒙就在这块小屏幕上。" },
    { key: "gba", abbr: "GBA", name: "Game Boy Advance", zh: "口袋里的超任", maker: "Nintendo", year: "2001", color: "#5b3fbf", ink: "#ffffff",
      intro: "32 位掌机把 SFC 时代的 2D 美学推向巅峰。火纹、黄金太阳、恶魔城、牧场物语，2D 像素游戏最后的黄金年代。" },
    { key: "sfc", abbr: "SFC", name: "Super Famicom / SNES", zh: "16 位 RPG 王朝", maker: "Nintendo", year: "1990", color: "#c9c3d6", ink: "#3b2a6b",
      intro: "日式 RPG 的黄金时代就诞生在这台灰紫色主机上。时空之轮、圣剑传说、最终幻想 VI、天地创造……每一卡都是传说。" },
    { key: "md",  abbr: "MD",  name: "Mega Drive / Genesis", zh: "黑色 16 位旋风", maker: "SEGA", year: "1988", color: "#111111", ink: "#ffffff",
      intro: "“SEGA~！”一声开机音，代表着速度与热血。索尼克、怒之铁拳、梦幻之星、光明力量，世嘉 16 位的硬派魅力至今不减。" },
    { key: "ss",  abbr: "SS",  name: "Sega Saturn", zh: "2D 性能怪兽", maker: "SEGA", year: "1994", color: "#2b3a8c", ink: "#ffffff",
      intro: "双 CPU 的 2D 怪兽。格斗、射击、SRPG 和大量日版独占名作让土星成为 2D 玩家心中永远的圣地。" },
    { key: "ps",  abbr: "PS",  name: "PlayStation", zh: "光盘时代的开拓者", maker: "Sony", year: "1994", color: "#9aa0a6", ink: "#111111",
      intro: "3D 浪潮中依然盛放的 2D 之花：月下夜想曲、幻想水浒传、圣剑传说 LOM……像素艺术在 CD 容量里迎来了新的高度。" },
    { key: "dc",  abbr: "DC",  name: "Dreamcast", zh: "世嘉最后的梦", maker: "SEGA", year: "1998", color: "#f26b1d", ink: "#ffffff",
      intro: "超越时代的梦之主机。街机级的 2D 格斗与射击、充满想象力的原创作品，短暂却灿烂的世嘉绝唱。" },
    { key: "ps2", abbr: "PS2", name: "PlayStation 2", zh: "史上最畅销主机", maker: "Sony", year: "2000", color: "#1d3fa8", ink: "#ffffff",
      intro: "3D 大作的天下，却也藏着手绘 2D 的瑰宝：奥丁领域、魔界战记、合集与移植……还有那些定义了一代人的 JRPG。" },
  ];
  const PMAP = Object.fromEntries(PLATFORMS.map(p => [p.key, p]));

  const state = { games: [], byId: {}, loaded: false };
  const app = document.getElementById("app");

  // ---------- helpers ----------
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pvars = p => `--pc:${p.color};--pc-ink:${p.ink}`;
  const fmtScore = n => (typeof n === "number" ? n.toFixed(1) : "—");
  const shot = g => (g.screenshots && g.screenshots[0]) || "";
  const img = (g, src, cls = "", alt = "") =>
    src ? `<img src="${esc(src)}" class="${cls}" alt="${esc(alt || g.titleZh || g.title)}" loading="lazy" onload="if(this.naturalHeight>this.naturalWidth)this.classList.add('portrait')" onerror="this.outerHTML='<div class=&quot;noshot ${cls}&quot;>NO IMAGE</div>'">`
        : `<div class="noshot ${cls}">${esc(PMAP[g.platform].abbr)}<br>NO IMAGE</div>`;
  const verdict = s => s >= 9.5 ? "殿堂级神作" : s >= 9 ? "白金推荐" : s >= 8.5 ? "金牌推荐" : s >= 8 ? "银牌推荐" : "值得一玩";
  const stampCls = s => (s >= 9.5 ? "score-stamp gold" : "score-stamp");

  // ---------- data ----------
  async function load() {
    const results = await Promise.all(PLATFORMS.map(p =>
      fetch(`data/${p.key}.json`).then(r => (r.ok ? r.json() : [])).catch(() => [])
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
      ${s ? `<img class="rank-thumb" src="${esc(s)}" alt="" loading="lazy" onload="if(this.naturalHeight>this.naturalWidth)this.classList.add('portrait')">` : `<div class="rank-thumb noshot" style="font-size:7px">${esc(p.abbr)}</div>`}
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
    const withShot = all.filter(g => g.coverShot).slice(0, 12);
    const coverGame = withShot[Math.floor(Math.random() * withShot.length)] || all[0];
    const coverLines = PLATFORMS.map(p => {
      const top = gamesOf(p.key)[0];
      return top ? `<div class="cover-line" style="${pvars(p)}"><span>${p.abbr}</span>${esc(top.titleZh || top.title)}</div>` : "";
    }).join("");

    const tiles = PLATFORMS.map(p => `<a class="plat-tile" href="#/p/${p.key}" style="${pvars(p)}">
        <span class="abbr">${p.abbr}</span><span class="name">${esc(p.zh)}</span>
        <span class="count">${gamesOf(p.key).length} 款推荐 ▶</span></a>`).join("");

    const perPlatform = PLATFORMS.map(p => {
      const list = gamesOf(p.key).slice(0, 4);
      if (!list.length) return "";
      return sectionHead(`${p.abbr} 必玩精选`, p.name.toUpperCase(), p.intro, p, `#/p/${p.key}`) +
        `<div class="grid">${list.map(g => card(g, { showPlat: false })).join("")}</div>`;
    }).join("");

    app.innerHTML = `
      <section class="cover">
        ${coverGame && shot(coverGame) ? `<img class="cover-img" src="${esc(shot(coverGame))}" alt="">` : ""}
        <div class="cover-feature"><b>${state.games.length}</b><small>款名作<br>大公开</small></div>
        <div class="cover-inner">
          <span class="cover-kicker">超大特集 · 8 大平台完全收录</span>
          <h1 class="cover-title">2D 像素<br>名作殿堂<small>GB · GBA · SFC · MD · SS · PS · DC · PS2</small></h1>
          ${coverGame ? `<a href="#/g/${esc(coverGame.id)}" class="cover-line" style="margin-top:14px;${pvars(PMAP[coverGame.platform])}"><span>封面</span>${esc(coverGame.titleZh || coverGame.title)} ▶</a>` : ""}
          <div class="cover-lines" style="margin-top:18px">${coverLines}</div>
        </div>
      </section>

      ${sectionHead("平台导航", "SELECT PLATFORM", "选择你的主机，开启时光机。")}
      <div class="plat-tiles">${tiles}</div>

      ${sectionHead("编辑部综合排行 TOP 20", "RANKING", "8 大平台混战，编辑部评分最高的 20 款。")}
      <div class="ranking">${all.slice(0, 20).map(rankRow).join("")}</div>

      ${perPlatform}
    `;
  }

  const pageState = { genre: "全部", only2D: false, sort: "score" };

  function viewPlatform(key) {
    const p = PMAP[key];
    if (!p) return viewNotFound();
    const list = gamesOf(key);
    const genres = ["全部", ...new Set(list.map(g => g.genre).filter(Boolean))];
    if (!genres.includes(pageState.genre)) pageState.genre = "全部";

    let shown = list.filter(g => (pageState.genre === "全部" || g.genre === pageState.genre) && (!pageState.only2D || g.is2D !== false));
    if (pageState.sort === "year") shown = [...shown].sort((a, b) => (a.year || 0) - (b.year || 0));
    if (pageState.sort === "title") shown = [...shown].sort((a, b) => (a.titleZh || a.title).localeCompare(b.titleZh || b.title, "zh"));

    app.innerHTML = `
      <section class="platform-hero" style="${pvars(p)}">
        <div class="platform-badge">${p.abbr}</div>
        <div>
          <h1>${esc(p.zh)} · ${esc(p.name)}</h1>
          <div class="meta">${esc(p.maker)} · ${esc(p.year)} · ${list.length} GAMES</div>
          <p>${esc(p.intro)}</p>
        </div>
      </section>
      <div class="toolbar">
        ${genres.map(g => `<button class="chip ${g === pageState.genre ? "on" : ""}" data-genre="${esc(g)}">${esc(g)}</button>`).join("")}
        <span class="spacer"></span>
        <button class="chip ${pageState.only2D ? "on" : ""}" data-2d>只看 2D</button>
        <select data-sort aria-label="排序">
          <option value="score" ${pageState.sort === "score" ? "selected" : ""}>按评分</option>
          <option value="year" ${pageState.sort === "year" ? "selected" : ""}>按年份</option>
          <option value="title" ${pageState.sort === "title" ? "selected" : ""}>按名称</option>
        </select>
      </div>
      ${shown.length ? `<div class="grid">${shown.map(g => card(g, { showPlat: false })).join("")}</div>` : `<div class="empty">没有符合条件的游戏</div>`}
    `;

    app.querySelectorAll("[data-genre]").forEach(b => b.onclick = () => { pageState.genre = b.dataset.genre; viewPlatform(key); });
    app.querySelector("[data-2d]").onclick = () => { pageState.only2D = !pageState.only2D; viewPlatform(key); };
    app.querySelector("[data-sort]").onchange = e => { pageState.sort = e.target.value; viewPlatform(key); };
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
          <div class="section-head" style="${pvars(p)}"><h2>游戏画面<span class="en">SCREENSHOTS</span></h2></div>
          <div class="gallery">${shots.map((s, i) => `<button data-shot="${i}" aria-label="查看大图">${img(g, s, "", `${g.titleZh || g.title} 截图 ${i + 1}`)}</button>`).join("")}</div>` : ""}
        </div>

        <aside class="side">
          <div class="panel editor-score">
            <h3>编辑部评分</h3>
            <div class="big">${fmtScore(g.editorScore)}</div>
            <div class="bar"><i style="width:${Math.max(0, Math.min(100, (g.editorScore || 0) * 10))}%"></i></div>
            <div class="verdict">★ ${verdict(g.editorScore || 0)} ★</div>
          </div>
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
  nav.innerHTML = `<a href="#/" data-key="home" style="--pc:#ffd23f;--pc-ink:#1b1a1f">封面</a>` +
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
    const activeKey = kind === "p" ? arg : kind === "g" ? state.byId[decodeURIComponent(arg || "")]?.platform : kind ? "" : "home";
    nav.querySelectorAll("a").forEach(a => a.classList.toggle("active", a.dataset.key === activeKey));
    const active = nav.querySelector("a.active");
    if (active) active.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });

    if (!kind) viewHome();
    else if (kind === "p") viewPlatform(arg);
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
