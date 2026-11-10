// ===========================================================
// 摄像机 / 视频档案 · 1.3.4 胶卷制
// -----------------------------------------------------------
//   · 摄像机开局自带（副手默认 4，副手是摄像机时按 L 录像）
//   · 录像要装「胶卷」：普通胶卷 12 秒 / 24 帧，高级胶卷 30 秒 / 30 帧
//     开局自带 4 卷普通胶卷；B.N.T.G 商店能买两种
//   · 每卷内部帧间隔严格恒定（1/fps），不再像早期那样 12 秒只抓 30 帧
//   · 一卷只能录一次：按下录像就消耗掉，录完变成「录像带」，只能看 / 导出 / 丢弃
//   · 录像带能丢在地上，别人捡起来就能在自己的视频档案里看
//   · 玩家视角全程正常：花屏只写进录像带（回放与导出）
//   · 录像期间被实体吃掉，最后一帧是「M.E.G录像带结束」
// 帧存 IndexedDB（288 / 900 帧远超 localStorage 的 5 MB），
// localStorage 只放每卷的元信息。
// ===========================================================
window.CamRec = (function () {
  "use strict";
  const META_KEY = "br_video_archive_v2";
  const OLD_KEY = "br_video_archive_v1";
  const FW = 480, FH = 300;          // 录像带帧尺寸（保持清楚，不再往下压）
  const MAX = 12;                    // 视频档案最多留几卷

  // 胶卷规格。帧间隔 = 1 / fps，同一卷内每一帧都一样。
  const FILMS = {
    film_normal:  { key: "film_normal",  name: "普通胶卷", secs: 12, fps: 24, price: 1, coin: 5 },
    film_premium: { key: "film_premium", name: "高级胶卷", secs: 30, fps: 30, price: 3, coin: 15 },
  };

  let rec = null;                    // 正在录：{ t, frames, fps, secs, max, film, ... }
  let buf = null, bctx = null, fr = null, frctx = null;
  let noise = [];
  let player = null;
  let pendingFinished = [];         // 刚录完的卷，交给 main.js 变成背包里的「录像带」物品
  const cache = new Map();          // id -> frames[]

  // ---------- IndexedDB ----------
  let dbP = null;
  function openDB() {
    if (dbP) return dbP;
    dbP = new Promise((res) => {
      try {
        const rq = indexedDB.open("br_tapes_v1", 1);
        rq.onupgradeneeded = () => {
          const d = rq.result;
          if (!d.objectStoreNames.contains("frames")) d.createObjectStore("frames");
        };
        rq.onsuccess = () => res(rq.result);
        rq.onerror = () => res(null);
        rq.onblocked = () => res(null);
      } catch (e) { res(null); }
    });
    return dbP;
  }
  async function idbPut(id, val) {
    const d = await openDB(); if (!d) return false;
    return new Promise((res) => {
      try {
        const tx = d.transaction("frames", "readwrite");
        tx.objectStore("frames").put(val, id);
        tx.oncomplete = () => res(true); tx.onerror = () => res(false);
        tx.onabort = () => res(false);
      } catch (e) { res(false); }
    });
  }
  async function idbGet(id) {
    const d = await openDB(); if (!d) return null;
    return new Promise((res) => {
      try {
        const rq = d.transaction("frames", "readonly").objectStore("frames").get(id);
        rq.onsuccess = () => res(rq.result || null);
        rq.onerror = () => res(null);
      } catch (e) { res(null); }
    });
  }
  async function idbDel(id) {
    const d = await openDB(); if (!d) return;
    try { d.transaction("frames", "readwrite").objectStore("frames").delete(id); } catch (e) { /* ignore */ }
  }

  // ---------- 元数据 ----------
  function all() {
    try {
      const raw = localStorage.getItem(META_KEY);
      if (raw) { const a = JSON.parse(raw); return Array.isArray(a) ? a : []; }
      // 迁移早期那批「12 秒 30 帧」的旧录像带，不丢历史
      const old = JSON.parse(localStorage.getItem(OLD_KEY) || "[]");
      const a = (Array.isArray(old) ? old : []).map((v) => ({
        id: v.id, level: v.level, levelName: v.levelName, at: v.at,
        secs: v.secs || 12, fps: 2.5, frameCount: (v.frames || []).length,
        film: "legacy", filmName: "早期录像带", tapeEnd: !!v.tapeEnd,
        legacyFrames: v.frames || [],
      }));
      writeMeta(a);
      return a;
    } catch (e) { return []; }
  }
  function writeMeta(a) {
    const list = a.slice(0, MAX);
    try { localStorage.setItem(META_KEY, JSON.stringify(list)); return true; }
    catch (e) {
      // 旧卷内联的帧太占地方时，先丢最旧的一卷再试
      for (let k = 0; k < MAX; k++) {
        const t = list.slice(0, list.length - k - 1);
        try { localStorage.setItem(META_KEY, JSON.stringify(t)); return true; } catch (e2) { /* retry */ }
      }
      return false;
    }
  }
  function metaOf(id) { return all().find((x) => x.id === id) || null; }
  async function putFrames(id, frames, fps) {
    cache.set(id, frames);
    return await idbPut(id, { frames: frames, fps: fps });
  }
  async function framesOf(id) {
    if (cache.has(id)) return cache.get(id);
    // 数码相机那卷 5400 帧是分块存在另一个库里的，读法不同
    const md = metaOf(id);
    if (md && md.digital && window.DigiCam) return await DigiCam.framesOf(id);
    const box = await idbGet(id);
    if (box && Array.isArray(box.frames) && box.frames.length) { cache.set(id, box.frames); return box.frames; }
    const m = metaOf(id);
    if (m && Array.isArray(m.legacyFrames) && m.legacyFrames.length) return m.legacyFrames;
    return [];
  }

  function levelName(lv) {
    try { if (typeof levelDef === "function") return levelDef(lv).name || ("Level " + lv); }
    catch (e) { /* ignore */ }
    return "Level " + lv;
  }
  function ensureCanvases() {
    if (!buf) { buf = document.createElement("canvas"); buf.width = FW; buf.height = FH; bctx = buf.getContext("2d"); }
    if (!fr) { fr = document.createElement("canvas"); fr.width = FW; fr.height = FH; frctx = fr.getContext("2d"); }
    if (!noise.length) {
      for (let n = 0; n < 4; n++) {
        const c = document.createElement("canvas"); c.width = c.height = 64;
        const cc = c.getContext("2d");
        const im = cc.createImageData(64, 64);
        for (let i = 0; i < 64 * 64; i++) {
          const v = Math.random() > 0.5 ? 255 : 0;
          im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v;
          im.data[i * 4 + 3] = 30 + Math.floor(Math.random() * 130);
        }
        cc.putImageData(im, 0, 0); noise.push(c);
      }
    }
  }
  function speckles(c, w, h, amount) {
    for (let i = 0; i < amount; i++) {
      c.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,.28)" : "rgba(0,0,0,.32)";
      c.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1);
    }
  }

  // 玩家视角完全正常：这个函数保留名字是为了不改动主循环的调用点，但它不碰主画布。
  function overlay(ctx, canvas, g) { return; }

  // 抓一帧：只在这一帧上做录像带失真，玩家眼前不受影响
  function grab(canvas, g) {
    ensureCanvases();
    frctx.setTransform(1, 0, 0, 1, 0, 0);
    frctx.imageSmoothingEnabled = true;
    frctx.clearRect(0, 0, FW, FH);
    frctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, FW, FH);
    bctx.clearRect(0, 0, FW, FH);
    bctx.drawImage(fr, 0, 0);
    for (let i = 0; i < 6; i++) {
      const sy = Math.random() * FH;
      const sh = Math.min(2 + Math.random() * 9, FH - sy);
      if (sh <= 1) continue;
      frctx.drawImage(buf, 0, sy, FW, sh, (Math.random() * 2 - 1) * 7, sy, FW, sh);
    }
    frctx.globalCompositeOperation = "screen";
    frctx.fillStyle = "rgba(255,0,48,0.055)"; frctx.fillRect(-3, 0, FW, FH);
    frctx.fillStyle = "rgba(0,220,255,0.045)"; frctx.fillRect(3, 0, FW, FH);
    frctx.globalCompositeOperation = "source-over";
    frctx.globalAlpha = 0.09;
    const tile = noise[(Math.floor((g && g.time || 0) * 20) % noise.length + noise.length) % noise.length];
    frctx.save();
    frctx.translate(-Math.floor(Math.random() * 64), -Math.floor(Math.random() * 64));
    const pat = frctx.createPattern(tile, "repeat");
    if (pat) { frctx.fillStyle = pat; frctx.fillRect(0, 0, FW + 64, FH + 64); }
    frctx.restore();
    frctx.globalAlpha = 1;
    frctx.fillStyle = "rgba(0,0,0,0.085)";
    for (let y = 0; y < FH; y += 4) frctx.fillRect(0, y, FW, 1);
    speckles(frctx, FW, FH, 26);
    return fr.toDataURL("image/jpeg", 0.72);
  }
  function endCard() {
    ensureCanvases();
    frctx.setTransform(1, 0, 0, 1, 0, 0);
    frctx.fillStyle = "#050505"; frctx.fillRect(0, 0, FW, FH);
    speckles(frctx, FW, FH, 260);
    frctx.fillStyle = "#e9e9e9";
    frctx.font = "bold 24px monospace"; frctx.textAlign = "center";
    frctx.fillText("M.E.G录像带结束", FW / 2, FH / 2 + 8);
    frctx.fillStyle = "rgba(255,255,255,.5)"; frctx.font = "14px monospace";
    frctx.fillText("--- END OF TAPE ---", FW / 2, FH / 2 + 34);
    frctx.textAlign = "left";
    return fr.toDataURL("image/jpeg", 0.55);
  }

  // ---------- 录制状态提示：什么时候在录、什么时候结束，一直看得见 ----------
  function indicator(text, secs, ending, spec, frames) {
    const el = document.getElementById("rec-ind");
    if (!el) return;
    el.classList.remove("hidden");
    el.classList.toggle("ending", !!ending);
    const t = document.getElementById("rec-time");
    if (t) {
      if (secs == null) t.textContent = "";
      else if (spec) t.textContent = Math.floor(secs) + " / " + spec.secs + " 秒 · "
        + spec.fps + " 帧/秒 · " + (frames | 0) + " 帧";
      else t.textContent = Math.floor(secs) + " 秒";
    }
    const lab = document.getElementById("rec-label");
    if (lab) lab.textContent = text;
  }
  function hideIndicator() {
    const el = document.getElementById("rec-ind");
    if (el) el.classList.add("hidden");
  }

  // ---------- 录制 ----------
  function start(g, filmKey) {
    if (rec) return { ok: false, reason: "已经在录了" };
    const spec = FILMS[filmKey] || FILMS.film_normal;
    ensureCanvases();
    rec = {
      t: 0, frames: [], film: spec.key, filmName: spec.name,
      fps: spec.fps, secs: spec.secs, max: spec.secs * spec.fps,
      level: g ? g.level : "?", levelName: g ? levelName(g.level) : "?",
      tapeEnd: false, at: Date.now(),
    };
    indicator("● REC · " + spec.name, 0, false, spec, 0);
    if (typeof toast === "function") toast("装上了" + spec.name + "，开始录像 · " + spec.secs + " 秒 / " + spec.fps + " 帧每秒");
    return { ok: true, spec: spec };
  }
  function stop(saveIt) {
    if (!rec) return;
    const r = rec; rec = null;
    if (!saveIt) { indicator("● 录像取消", null, true); setTimeout(hideIndicator, 1600); return; }
    if (!r.frames.length) return;
    const meta = {
      id: "v" + r.at, level: r.level, levelName: r.levelName, at: r.at,
      secs: Math.round(r.t * 10) / 10, fps: r.fps,
      frameCount: r.frames.length, film: r.film, filmName: r.filmName,
      tapeEnd: !!r.tapeEnd,
    };
    const a = all().filter((x) => x.id !== meta.id);
    a.unshift(meta);
    writeMeta(a);
    putFrames(meta.id, r.frames, r.fps);       // 异步落 IndexedDB，内存里已有缓存
    pendingFinished.push(meta);                // main.js 会给玩家发一卷「录像带」物品
    indicator(r.tapeEnd ? "● M.E.G录像带结束 · 已存进视频档案" : "● 录像结束 · 已存进视频档案", null, true);
    clearTimeout(stop._timer);
    stop._timer = setTimeout(hideIndicator, 2600);
    if (typeof toast === "function") toast(
      (r.tapeEnd ? "录像带结束" : "录完了") + " —— " + r.frames.length + " 帧 · " + r.fps
      + " 帧每秒，视频档案里多了一卷，胶卷已用掉");
  }
  function onDeath(g) {
    if (!rec) return;
    const eaten = !!(g && (g.killerName || g.deathCause === "被实体捕获"));
    if (eaten && !rec.tapeEnd) { rec.tapeEnd = true; rec.frames.push(endCard()); }
    stop(true);
  }
  // render() 之后调用：等间隔采样。每帧的时间戳严格是 n / fps，与 dt 抖动无关。
  function afterFrame(g, dt, canvas) {
    if (!rec) return;
    rec.t += dt;
    while (rec.frames.length < rec.max && rec.t >= rec.frames.length / rec.fps - 1e-9) {
      try { rec.frames.push(grab(canvas, g)); }
      catch (e) { rec.frames.push(""); }
    }
    indicator("● REC · " + rec.filmName, rec.t, false,
      { secs: rec.secs, fps: rec.fps }, rec.frames.length);
    if (rec.t >= rec.secs || rec.frames.length >= rec.max) stop(true);
  }
  function isRecording() { return !!rec; }
  function recordingSpec() { return rec ? { fps: rec.fps, secs: rec.secs, frames: rec.frames.length, film: rec.film } : null; }
  function drainFinished() { const a = pendingFinished.slice(); pendingFinished = []; return a; }
  function list() { return all(); }
  function remove(id) {
    writeMeta(all().filter((v) => v.id !== id));
    cache.delete(id); idbDel(id);
    if (player && player.id === id) { clearInterval(player.timer); player = null; }
  }
  // 捡到别人丢下的录像带：把这卷收进自己的视频档案
  async function adopt(meta, frames) {
    if (!meta || !meta.id) return false;
    if (metaOf(meta.id)) return false;
    const a = all(); a.unshift({
      id: meta.id, level: meta.level, levelName: meta.levelName || ("Level " + meta.level),
      at: meta.at || Date.now(), secs: meta.secs, fps: meta.fps || 24,
      frameCount: (frames || []).length || meta.frameCount,
      film: meta.film || "shared", filmName: meta.filmName || "别人丢下的录像带",
      tapeEnd: !!meta.tapeEnd,
    });
    writeMeta(a);
    if (frames && frames.length) await putFrames(meta.id, frames, meta.fps || 24);
    return true;
  }

  function dl(blob, name) {
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = u; a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(u); a.remove(); }, 1500);
  }
  function imgOf(src) {
    if (!src) return Promise.resolve(null);
    return new Promise((res) => {
      const im = new Image();
      let done = false;
      const fin = (v) => { if (done) return; done = true; res(v); };
      im.onload = () => fin(im); im.onerror = () => fin(null);
      setTimeout(() => fin(null), 4000);
      im.src = src;
    });
  }
  function paint(im, cv, c) {
    c.imageSmoothingEnabled = false;
    c.drawImage(im, 0, 0, cv.width, cv.height);
    c.globalCompositeOperation = "screen";
    c.fillStyle = "rgba(255,0,40,.035)"; c.fillRect(-3, 0, cv.width, cv.height);
    c.fillStyle = "rgba(0,210,255,.03)"; c.fillRect(3, 0, cv.width, cv.height);
    c.globalCompositeOperation = "source-over";
    c.fillStyle = "rgba(0,0,0,.075)";
    for (let y = 0; y < cv.height; y += 4) c.fillRect(0, y, cv.width, 1);
    speckles(c, cv.width, cv.height, 22);
  }

  // 在档案手册右侧播放：按这卷自己的 fps 翻帧，每帧间隔恒定
  async function play(id, box) {
    if (!box) return;
    const v = metaOf(id);
    if (!v) { box.innerHTML = '<div class="manual-empty">这段录像不在了。</div>'; return; }
    if (player) { clearInterval(player.timer); player = null; }
    box.innerHTML = "";
    const wrap = document.createElement("div");
    wrap.style.cssText = "display:flex;flex-direction:column;gap:10px;";
    const head = document.createElement("div");
    head.className = "doc-head";
    head.innerHTML = "<span>视频档案</span><span>M.E.G 录像带</span>";
    wrap.appendChild(head);
    const title = document.createElement("h2");
    title.textContent = "录像 · " + v.levelName;
    wrap.appendChild(title);
    const meta = document.createElement("p");
    meta.style.cssText = "font-size:12px;color:#7a6428;margin:-4px 0 2px;font-weight:600;";
    meta.textContent = new Date(v.at).toLocaleString("zh-CN") + " · "
      + (v.secs || 0) + " 秒 · " + (v.frameCount || 0) + " 帧 · "
      + (v.fps || 24) + " 帧每秒 · " + (v.filmName || "") + " · 无音轨";
    wrap.appendChild(meta);
    const cv = document.createElement("canvas");
    cv.width = v.w || FW; cv.height = v.h || FH;   // 数码相机那卷是 1280×720
    cv.style.cssText = "width:100%;max-width:480px;image-rendering:pixelated;background:#000;border:1px solid #4a4230;";
    wrap.appendChild(cv);
    const c = cv.getContext("2d");
    const frames = await framesOf(id);
    // 分批并行解码：900 帧的高级胶卷也能很快出画面。空帧照样占位，帧数与间隔都不变。
    const imgs = new Array(frames.length);
    const CH = 40;
    for (let s = 0; s < frames.length; s += CH) {
      const part = await Promise.all(frames.slice(s, s + CH).map(imgOf));
      for (let j = 0; j < part.length; j++) imgs[s + j] = part[j];
    }
    let i = 0;
    const tick = () => {
      if (!imgs.length) return;
      const im = imgs[i % imgs.length]; i++;
      if (im) paint(im, cv, c);
      else { c.fillStyle = "#000"; c.fillRect(0, 0, cv.width, cv.height); }
    };
    tick();
    const fps = v.fps || 24;
    const timer = setInterval(() => {
      if (!cv.isConnected) { clearInterval(timer); return; }
      tick();
    }, 1000 / fps);
    player = { timer: timer, imgs: imgs, i: 0, id: id };

    const bar = document.createElement("div");
    bar.style.cssText = "display:flex;flex-wrap:wrap;gap:6px;margin-top:2px;";
    const mk = (txt, fn) => {
      const b = document.createElement("button");
      b.type = "button"; b.textContent = txt;
      b.className = "vbtn";
      b.style.cssText = "font-size:12px;padding:6px 12px;border:1px solid #8f7a3c;background:#241f0f;color:#ffe97a;border-radius:4px;cursor:pointer;font-weight:700;";
      b.addEventListener("click", fn); bar.appendChild(b);
    };
    mk("导出 WebM", () => exportWebM(v));
    mk("导出 PNG 帧", () => exportPng(v, (i - 1 + imgs.length) % (imgs.length || 1)));
    mk("导出 JSON", () => exportJson(v));
    mk("删除这段", () => {
      clearInterval(timer); remove(v.id);
      if (typeof renderManual === "function") { try { renderManual(); } catch (e) { /* ignore */ } }
      box.innerHTML = '<div class="manual-empty">这段录像已经删掉了。</div>';
    });
    wrap.appendChild(bar);
    const note = document.createElement("div");
    note.className = "manual-empty";
    note.style.cssText = "padding:6px 0;font-size:12px;color:#5c4a1e;font-weight:600;";
    note.textContent = v.tapeEnd
      ? "最后一帧：M.E.G录像带结束。录像期间你被实体吃掉了。"
      : "已经录完的一卷胶卷 —— 只能观看、导出或丢给别人，不能再录一次。";
    wrap.appendChild(note);
    box.appendChild(wrap);
  }

  async function exportPng(v, idx) {
    const frames = await framesOf(v.id);
    const f = frames[Math.max(0, Math.min(frames.length - 1, idx | 0))];
    if (!f) return;
    const im = await imgOf(f);
    if (!im) return;
    const cv = document.createElement("canvas"); cv.width = v.w || FW * 3; cv.height = v.h || FH * 3;
    const c = cv.getContext("2d"); paint(im, cv, c);
    cv.toBlob((b) => { if (b) dl(b, "MEG_tape_" + v.id + ".png"); }, "image/png");
  }
  async function exportJson(v) {
    const frames = await framesOf(v.id);
    dl(new Blob([JSON.stringify(Object.assign({}, v, { frames: frames }))], { type: "application/json" }),
      "MEG_tape_" + v.id + ".json");
  }
  async function exportWebM(v) {
    if (typeof MediaRecorder === "undefined" || !HTMLCanvasElement.prototype.captureStream) {
      if (typeof toast === "function") toast("这台设备不支持 WebM 导出 —— 用 PNG 或 JSON 吧");
      return;
    }
    const cv = document.createElement("canvas"); cv.width = Math.min(1280, v.w || FW * 2); cv.height = Math.min(720, v.h || FH * 2);
    const c = cv.getContext("2d");
    const frames = await framesOf(v.id);
    const imgs = [];
    for (const f of frames) imgs.push(await imgOf(f));
    if (!imgs.length) return;
    let stream = null, mr = null;
    try {
      stream = cv.captureStream(0);
      mr = new MediaRecorder(stream, { mimeType: "video/webm" });
    } catch (e) {
      if (typeof toast === "function") toast("WebM 录制起不来 —— 用 PNG 或 JSON 吧");
      return;
    }
    const chunks = [];
    mr.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
    mr.onstop = () => {
      try { dl(new Blob(chunks, { type: "video/webm" }), "MEG_tape_" + v.id + ".webm"); }
      catch (e) { /* ignore */ }
    };
    const show = (im) => {
      if (im) paint(im, cv, c);
      else { c.fillStyle = "#000"; c.fillRect(0, 0, cv.width, cv.height); }
    };
    show(imgs[0]);
    mr.start();
    let k = 0;
    const timer = setInterval(() => {
      k++;
      if (k >= imgs.length) {
        clearInterval(timer);
        try { mr.stop(); } catch (e) { /* ignore */ }
        return;
      }
      show(imgs[k]);
      try { if (stream.getVideoTracks()[0] && stream.getVideoTracks()[0].requestFrame) stream.getVideoTracks()[0].requestFrame(); }
      catch (e) { /* ignore */ }
    }, 1000 / (v.fps || 24));
  }

  // ---------- 丢给别的玩家看 ----------
  // 帧数据不塞进存档（太大），只在联机里分块发：帧数、间隔、时长都不变，
  // 单帧重编码得小一点，免得一条消息把房间通道撑爆。
  async function shareTape(id) {
    const v = metaOf(id);
    if (!v || !window.Net || typeof Net.broadcast !== "function") return 0;
    const frames = await framesOf(id);
    if (!frames.length) return 0;
    const small = document.createElement("canvas"); small.width = 240; small.height = 150;
    const sc = small.getContext("2d");
    const lite = [];
    for (const f of frames) {
      if (!f) { lite.push(""); continue; }
      const im = await new Promise((res) => {
        const img = new Image();
        let done = false;
        const fin = (v) => { if (done) return; done = true; res(v); };
        img.onload = () => fin(img); img.onerror = () => fin(null);
        setTimeout(() => fin(null), 2000);
        img.src = f;
      });
      if (!im) { lite.push(""); continue; }
      try { sc.drawImage(im, 0, 0, 240, 150); lite.push(small.toDataURL("image/jpeg", 0.5)); }
      catch (e) { lite.push(""); }
    }
    const CHUNK = 24;
    const n = Math.ceil(lite.length / CHUNK);
    for (let i = 0; i < n; i++) {
      Net.broadcast({ t: "tapechunk", id: id, meta: {
        id: v.id, level: v.level, levelName: v.levelName, at: v.at,
        secs: v.secs, fps: v.fps, frameCount: lite.length,
        film: v.film, filmName: v.filmName, tapeEnd: v.tapeEnd,
      }, part: i, total: n, frames: lite.slice(i * CHUNK, (i + 1) * CHUNK) }, true);
    }
    return n;
  }

  // 别的玩家丢录像带时，帧数据分块送到；收齐了就并进自己的视频档案
  const inbox = new Map();
  try {
    window.addEventListener("br:tapechunk", (e) => {
      const d = e && e.detail;
      if (!d || !d.id || !Array.isArray(d.frames)) return;
      let box = inbox.get(d.id);
      if (!box) {
        box = { parts: new Array(d.total || 1).fill(null), total: d.total || 1, meta: d.meta };
        inbox.set(d.id, box);
      }
      if (d.part >= 0 && d.part < box.total) box.parts[d.part] = d.frames;
      if (!box.parts.every((x) => x)) return;
      const frames = [].concat.apply([], box.parts);
      inbox.delete(d.id);
      adopt(box.meta, frames).then((ok) => {
        if (ok && typeof toast === "function") toast("收到别人丢下的一卷录像带 —— 视频档案里能看了");
      });
    });
  } catch (e) { /* ignore */ }

  return {
    FILMS, start, stop, onDeath, afterFrame, overlay,
    isRecording, recordingSpec, drainFinished,
    list, metaOf, framesOf, adopt, shareTape, remove,
    play, exportWebM, exportPng, exportJson,
  };
})();
