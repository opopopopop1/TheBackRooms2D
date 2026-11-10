// ===========================================================
// 数码相机 · 1.3.4
//   B.N.T.G 商城出售：20 瓶杏仁水 / 100 枚 B.N.T.G 货币，随机附送 3 颗电池。
//   一颗电池维持 3 分钟，也就是一次完整录制：720P、30 帧每秒、花屏特效很轻。
//   电池能在物资箱里以 5% 的概率翻到，也能花 2 瓶杏仁水 / 10 枚货币补货。
//   没有电池就开不了录；录到 3 分钟自动停，一卷录像带进视频档案。
//   5400 帧按每 150 帧（5 秒）一块写进 IndexedDB，内存里只留当前一块。
//   玩家视角全程正常，花屏只写进录像带。
// ===========================================================
window.DigiCam = (function () {
  "use strict";
  const META_KEY = "br_video_archive_v2";   // 与胶卷录像带共用一份视频档案
  const DB_NAME = "br_digicam_v1", STORE = "chunks";
  const SPEC = Object.freeze({ secs: 180, fps: 30, w: 1280, h: 720, quality: 0.55,
    frames: 5400, name: "数码相机 · 720P" });
  const CHUNK = 150;                        // 150 帧 = 5 秒一块
  let rec = null, buf = null, bctx = null, fr = null, frctx = null;
  let pending = [];
  const cache = new Map();

  // ---------- IndexedDB ----------
  let dbP = null;
  function openDB() {
    if (dbP) return dbP;
    dbP = new Promise((res) => {
      try {
        const rq = indexedDB.open(DB_NAME, 1);
        rq.onupgradeneeded = () => {
          const d = rq.result;
          if (!d.objectStoreNames.contains(STORE)) d.createObjectStore(STORE);
        };
        rq.onsuccess = () => res(rq.result);
        rq.onerror = () => res(null);
        rq.onblocked = () => res(null);
      } catch (e) { res(null); }
    });
    return dbP;
  }
  async function idbPut(k, v) {
    const d = await openDB(); if (!d) return false;
    return new Promise((res) => {
      try {
        const tx = d.transaction(STORE, "readwrite");
        tx.objectStore(STORE).put(v, k);
        tx.oncomplete = () => res(true); tx.onerror = () => res(false); tx.onabort = () => res(false);
      } catch (e) { res(false); }
    });
  }
  async function idbGet(k) {
    const d = await openDB(); if (!d) return null;
    return new Promise((res) => {
      try {
        const rq = d.transaction(STORE, "readonly").objectStore(STORE).get(k);
        rq.onsuccess = () => res(rq.result || null);
        rq.onerror = () => res(null);
      } catch (e) { res(null); }
    });
  }

  function ensureCanvas(w, h) {
    if (!buf || buf.width !== w || buf.height !== h) {
      buf = document.createElement("canvas"); buf.width = w; buf.height = h;
      bctx = buf.getContext("2d");
      fr = document.createElement("canvas"); fr.width = w; fr.height = h;
      frctx = fr.getContext("2d");
    }
  }
  // 轻花屏：只有极淡的横向错位、一点噪点和很浅的扫描线，不糊掉画面
  function grab(canvas, g) {
    const w = rec.w, h = rec.h;
    ensureCanvas(w, h);
    frctx.setTransform(1, 0, 0, 1, 0, 0);
    frctx.imageSmoothingEnabled = true;
    frctx.clearRect(0, 0, w, h);
    frctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, w, h);
    bctx.clearRect(0, 0, w, h); bctx.drawImage(fr, 0, 0);
    if (Math.random() < 0.18) {           // 偶尔才轻微错位一下
      const sy = Math.random() * h, sh = Math.min(2 + Math.random() * 5, h - sy);
      if (sh > 1) frctx.drawImage(buf, 0, sy, w, sh, (Math.random() * 2 - 1) * 3, sy, w, sh);
    }
    frctx.fillStyle = "rgba(0,0,0,0.025)";
    for (let y = 0; y < h; y += 6) frctx.fillRect(0, y, w, 1);
    for (let i = 0; i < 16; i++) {
      frctx.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,.10)" : "rgba(0,0,0,.12)";
      frctx.fillRect(Math.random() * w, Math.random() * h, 2, 1);
    }
    return fr.toDataURL("image/jpeg", rec.quality);
  }
  function endCard() {
    const w = rec.w, h = rec.h;
    ensureCanvas(w, h);
    frctx.fillStyle = "#080808"; frctx.fillRect(0, 0, w, h);
    frctx.fillStyle = "#e9e9e9"; frctx.font = "bold 46px monospace"; frctx.textAlign = "center";
    frctx.fillText("M.E.G录像带结束", w / 2, h / 2 + 12);
    frctx.fillStyle = "rgba(255,255,255,.5)"; frctx.font = "24px monospace";
    frctx.fillText("--- END OF TAPE ---", w / 2, h / 2 + 58);
    frctx.textAlign = "left";
    return fr.toDataURL("image/jpeg", 0.6);
  }

  function indicator(text, secs, ending, frames) {
    const el = document.getElementById("rec-ind");
    if (!el) return;
    el.classList.remove("hidden"); el.classList.toggle("ending", !!ending);
    const t = document.getElementById("rec-time"), lab = document.getElementById("rec-label");
    if (lab) lab.textContent = text;
    if (t) t.textContent = secs == null ? "" :
      Math.floor(secs) + " / " + rec.secs + " 秒 · " + rec.fps + " 帧/秒 · 720P · "
      + (frames | 0) + " 帧 · 电池 " + (rec.battery | 0) + " 颗";
  }
  function hideIndicator() {
    const el = document.getElementById("rec-ind");
    if (el) el.classList.add("hidden");
  }

  function allMeta() {
    try { const a = JSON.parse(localStorage.getItem(META_KEY) || "[]"); return Array.isArray(a) ? a : []; }
    catch (e) { return []; }
  }
  function writeMeta(meta) {
    const a = allMeta().filter((x) => x.id !== meta.id);
    a.unshift(meta);
    try { localStorage.setItem(META_KEY, JSON.stringify(a.slice(0, 12))); }
    catch (e) { /* 元数据很小，不会写不下 */ }
  }

  function flushChunk() {
    if (!rec || !rec.cur.length) return;
    const k = rec.id + "_c" + rec.chunkCount;
    const part = rec.cur.slice();
    rec.chunkCount++; rec.cur = [];
    idbPut(k, part);             // 异步落盘；内存随即释放这一块，不在 cache 里常驻
  }

  // 开录：main.js 已经扣掉一颗电池。这里只认电池数 > 0 的校验结果。
  function start(g, opt) {
    if (rec) return { ok: false, reason: "已经在录了" };
    if (window.CamRec && CamRec.isRecording()) return { ok: false, reason: "胶卷还在录 —— 等它走完" };
    if ((g.inv.battery | 0) <= 0) return { ok: false, reason: "没有电池了 —— B.N.T.G 商店或物资箱能补" };
    const o = opt || {};
    const secs = o.secs || SPEC.secs, fps = o.fps || SPEC.fps;
    ensureCanvas(o.w || SPEC.w, o.h || SPEC.h);
    rec = {
      id: "d" + Date.now(), t: 0, frames: 0, secs: secs, fps: fps,
      max: secs * fps, w: o.w || SPEC.w, h: o.h || SPEC.h, quality: o.quality || SPEC.quality,
      cur: [], chunkCount: 0, battery: g.inv.battery | 0,
      level: g.level, levelName: (function () {
        try { return levelDef(g.level).name || ("Level " + g.level); } catch (e) { return "Level " + g.level; }
      })(),
      at: Date.now(), tapeEnd: false,
    };
    indicator("● REC · 数码相机", 0, false, 0);
    if (typeof toast === "function") toast("数码相机开始录像 · 3 分钟 / 30 帧每秒 / 720P · 这一颗电池用掉了");
    return { ok: true, spec: { secs: rec.secs, fps: rec.fps, w: rec.w, h: rec.h, frames: rec.max } };
  }
  function stop(saveIt) {
    if (!rec) return;
    const r = rec; rec = null;
    if (!saveIt || !r.frames) { indicator("● 录像取消", null, true); setTimeout(hideIndicator, 1600); return; }
    flushChunkFor(r);
    const meta = {
      id: r.id, level: r.level, levelName: r.levelName, at: r.at,
      secs: Math.round(r.t * 10) / 10, fps: r.fps, frameCount: r.frames,
      film: "digital", filmName: SPEC.name, tapeEnd: !!r.tapeEnd,
      w: r.w, h: r.h, digital: true, chunks: r.chunkCount,
    };
    writeMeta(meta);
    pending.push(meta);
    const el = document.getElementById("rec-ind"), lab = document.getElementById("rec-label"), t = document.getElementById("rec-time");
    if (el) { el.classList.remove("hidden"); el.classList.add("ending"); }
    if (lab) lab.textContent = r.tapeEnd ? "● M.E.G录像带结束 · 已存进视频档案" : "● 录像结束 · 已存进视频档案";
    if (t) t.textContent = r.frames + " 帧 · " + r.fps + " 帧每秒 · 720P · " + meta.secs + " 秒";
    setTimeout(hideIndicator, 2600);
    if (typeof toast === "function") toast("录完了 —— 视频档案里多了一卷 720P 录像带，电池已耗尽");
  }
  function flushChunkFor(r) {
    // stop 时 rec 已置空，这里用传入的 r 收尾最后一块
    if (r.cur && r.cur.length) {
      const k = r.id + "_c" + r.chunkCount;
      const part = r.cur.slice();
      r.chunkCount++; r.cur = [];
      idbPut(k, part);
    }
  }
  function onDeath(g) {
    if (!rec) return;
    const eaten = !!(g && (g.killerName || g.deathCause === "被实体捕获"));
    if (eaten && !rec.tapeEnd) { rec.tapeEnd = true; rec.cur.push(endCard()); rec.frames++; }
    stop(true);
  }
  // 等间隔采样：第 n 帧时刻严格 n / fps，与 dt 抖动无关
  function afterFrame(g, dt, canvas) {
    if (!rec) return;
    rec.t += dt;
    while (rec.frames < rec.max && rec.t >= rec.frames / rec.fps - 1e-9) {
      try { rec.cur.push(grab(canvas, g)); }
      catch (e) { rec.cur.push(""); }
      rec.frames++;
      if (rec.cur.length >= CHUNK) flushChunk();
    }
    indicator("● REC · 数码相机", rec.t, false, rec.frames);
    // 一颗电池的电量就是这 3 分钟：走满 180 秒（5400 帧）自动停录、不再续，
    // 想再录一次得换一颗。中途不因「身上剩余电池为 0」误停 —— 那一颗已经装在机器里了。
    if (rec.t >= rec.secs || rec.frames >= rec.max) stop(true);
  }
  function isRecording() { return !!rec; }
  function spec() { return rec ? { secs: rec.secs, fps: rec.fps, frames: rec.frames, w: rec.w, h: rec.h } : null; }
  // main.js 扣掉那颗电池之后回传剩余数，REC 上别再显示装进去之前的旧值
  function noteBattery(n) { if (rec) rec.battery = n | 0; }
  function drainFinished() { const a = pending.slice(); pending = []; return a; }

  async function framesOf(id) {
    const m = allMeta().find((x) => x.id === id);
    if (!m || !m.digital) return [];
    const out = [];
    for (let i = 0; i < (m.chunks | 0); i++) {
      const k = id + "_c" + i;
      let part = cache.get(k);
      if (!part) { part = await idbGet(k); if (part) cache.set(k, part); }
      if (Array.isArray(part)) for (const f of part) out.push(f);
    }
    return out;
  }
  function metaOf(id) { return allMeta().find((x) => x.id === id) || null; }

  return {
    SPEC, start, stop, onDeath, afterFrame, isRecording, spec, noteBattery,
    drainFinished, framesOf, metaOf, hideIndicator,
  };
})();
