// ===========================================================
// Level 20 —— 霓虹区的「游戏」
//   五个游戏各有一套自己的画面与玩法，跑在一块独立的画布上（不叠在游戏画布里）。
//   赢了的奖励、输了的后果都写在 main.js 里 —— 这里只负责玩和判定输赢。
//   按 ESC 可以直接退出（不算赢也不算输）。
// ===========================================================
"use strict";

(function () {
  const L20 = {};
  window.L20 = L20;

  let cv = null, ctx = null, raf = 0, st = null, doneCb = null;
  const keys = {};
  const W = () => window.innerWidth;
  const H = () => window.innerHeight;
  const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());

  function ensureCanvas() {
    if (cv) return;
    cv = document.createElement("canvas");
    cv.id = "mini20cv";
    cv.style.position = "fixed";
    cv.style.left = "0";
    cv.style.top = "0";
    cv.style.width = "100%";
    cv.style.height = "100%";
    cv.style.zIndex = "99990";
    cv.style.background = "#05070c";
    cv.style.touchAction = "none";
    document.body.appendChild(cv);
    ctx = cv.getContext("2d");
  }

  function fit() {
    if (!cv) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.floor(W() * dpr);
    cv.height = Math.floor(H() * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function onKey(e) {
    if (!st) return;
    const k = (e.key || "").toLowerCase();
    if (k === "escape") { e.preventDefault(); e.stopPropagation(); finish(null); return; }
    if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright", " "].indexOf(k) >= 0) {
      keys[k] = true;
      e.preventDefault();
      e.stopPropagation();
    }
  }
  function onKeyUp(e) {
    const k = (e.key || "").toLowerCase();
    if (k in keys) { keys[k] = false; e.stopPropagation(); }
  }
  function onDown(e) {
    if (!st || !st.g.onClick) return;
    const r = cv.getBoundingClientRect();
    const x = (e.clientX != null ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0)) - r.left;
    const y = (e.clientY != null ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0)) - r.top;
    e.preventDefault(); e.stopPropagation();
    st.g.onClick(x, y);
  }

  function txt(s, x, y, size, color, align) {
    ctx.font = "600 " + size + "px system-ui, -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif";
    ctx.textAlign = align || "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = color || "#e8eef6";
    ctx.fillText(s, x, y);
  }
  function rr(x, y, w, h, r, fill, stroke, lw) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 2; ctx.stroke(); }
  }

  // =========================================================
  // 1 · 绿与红 —— 用泡沫球打绿色的六边形，红色的会扣分
  // =========================================================
  function makeGR() {
    const COLS = 7, ROWS = 5;
    const hexes = [];
    let R = 30, ox = 0, oy = 0;
    const g = {
      name: "绿与红", tip: "打绿色的六边形 · 红色的会扣分",
      score: 0, target: 12, time: 25, t: 25,
      balls: [],
    };
    g.layout = function () {
      const w = W(), h = H();
      R = Math.min(38, Math.min(w / (COLS * 1.9), (h - 190) / (ROWS * 1.8)));
      ox = w / 2 - ((COLS - 1) * 1.5 + 1) * R / 2 + R / 2;
      oy = Math.max(96, h * 0.20);
    };
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const off = (r % 2) ? R * 0.75 : 0;
      hexes.push({ r, c, x: 0, y: 0, green: Math.random() < 0.62, flip: 1.2 + Math.random() * 2.2, flash: 0 });
      hexes[hexes.length - 1].off = off;
    }
    g.update = function (dt) {
      g.t -= dt;
      for (const hx of hexes) {
        hx.flip -= dt;
        if (hx.flip <= 0) { hx.green = Math.random() < 0.62; hx.flip = 1.1 + Math.random() * 2.0; }
        if (hx.flash > 0) hx.flash -= dt;
      }
      for (const b of g.balls) { b.t += dt; }
      g.balls = g.balls.filter((b) => b.t < b.dur);
      if (g.score >= g.target) finish(true);
      else if (g.t <= 0) finish(false);
    };
    g.onClick = function (mx, my) {
      const bx = W() / 2, by = H() - 78;
      for (const hx of hexes) {
        if (Math.hypot(mx - hx.x, my - hx.y) > R * 0.86) continue;
        hx.flash = 0.25;
        if (hx.green) { g.score++; g.balls.push({ x0: bx, y0: by, x1: hx.x, y1: hx.y, t: 0, dur: 0.26, ok: true }); }
        else { g.score = Math.max(0, g.score - 2); g.balls.push({ x0: bx, y0: by, x1: hx.x, y1: hx.y, t: 0, dur: 0.26, ok: false }); }
        return;
      }
      g.balls.push({ x0: bx, y0: by, x1: mx, y1: my, t: 0, dur: 0.26, ok: false });
    };
    g.draw = function () {
      const w = W(), h = H();
      g.layout();
      // 房间：六边形屏幕组成的墙
      ctx.fillStyle = "#12161f"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#0c1017"; ctx.fillRect(0, 0, w, 74);
      ctx.fillStyle = "#1b2230"; ctx.fillRect(0, 74, w, 4);
      for (const hx of hexes) {
        hx.x = ox + hx.c * R * 1.5 + hx.off;
        hx.y = oy + hx.r * R * 1.62;
        const col = hx.green ? "#2ecc5f" : "#e03b53";
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = Math.PI / 180 * (60 * i - 90);
          const px = hx.x + Math.cos(a) * R * 0.80, py = hx.y + Math.sin(a) * R * 0.80;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = hx.green ? "rgba(46,204,95,0.28)" : "rgba(224,59,83,0.26)";
        ctx.fill();
        ctx.strokeStyle = col; ctx.lineWidth = hx.flash > 0 ? 5 : 2.4; ctx.stroke();
        ctx.fillStyle = hx.green ? "rgba(120,255,170,0.5)" : "rgba(255,140,150,0.45)";
        ctx.beginPath(); ctx.arc(hx.x, hx.y, R * 0.22, 0, Math.PI * 2); ctx.fill();
      }
      // 底下那一堆泡沫球
      const bx = w / 2, by = h - 78;
      ctx.fillStyle = "rgba(255,255,255,0.10)";
      ctx.beginPath(); ctx.ellipse(bx, by + 26, 74, 16, 0, 0, Math.PI * 2); ctx.fill();
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2;
        ctx.fillStyle = i % 2 ? "#f2f6f8" : "#dfe6ea";
        ctx.beginPath(); ctx.arc(bx + Math.cos(a) * 26, by + Math.sin(a) * 10 + 12, 9, 0, Math.PI * 2); ctx.fill();
      }
      for (const b of g.balls) {
        const k = Math.min(1, b.t / b.dur);
        const px = b.x0 + (b.x1 - b.x0) * k - Math.sin(k * Math.PI) * 40;
        const py = b.y0 + (b.y1 - b.y0) * k - Math.sin(k * Math.PI) * 90;
        ctx.fillStyle = b.ok ? "#f6fbfd" : "#f0d9dd";
        ctx.beginPath(); ctx.arc(px, py, 10, 0, Math.PI * 2); ctx.fill();
      }
      txt("绿与红", 22, 30, 22, "#eaf2fa");
      txt(g.tip, 22, 56, 14, "#8fa0b4");
      txt("得分 " + g.score + " / " + g.target, w - 22, 30, 20, g.score >= g.target ? "#5ef08a" : "#eaf2fa", "right");
      txt("剩余 " + Math.max(0, g.t).toFixed(1) + "s", w - 22, 56, 15, g.t < 6 ? "#ff6b7f" : "#8fa0b4", "right");
    };
    return g;
  }

  // =========================================================
  // 2 · 攀岩 —— 踩着发绿光的塑料落脚点爬到尽头；变红的千万别碰
  // =========================================================
  function makeClimb() {
    const ROWS = 11, COLS = 5;
    const holds = [];
    const g = { name: "攀岩", tip: "点住够得着的绿点往上爬 · 变红的别碰", score: 0, t: 45, cur: null, dead: 0 };
    let sp = 46, ox = 0, oy = 0;
    g.layout = function () {
      const w = W(), h = H();
      sp = Math.min(52, (h - 200) / (ROWS + 1));
      ox = w / 2;
      oy = h - 92;
    };
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      holds.push({ r, c, x: 0, y: 0, red: false, flip: 2 + Math.random() * 4 });
    }
    const at = (r, c) => holds[r * COLS + c];
    g.cur = at(ROWS - 1, 2);
    g.update = function (dt) {
      g.t -= dt;
      for (const hd of holds) {
        hd.flip -= dt;
        if (hd.flip <= 0) { hd.red = Math.random() < 0.30; hd.flip = 1.6 + Math.random() * 2.6; }
      }
      if (g.cur && g.cur.red) { finish(false); return; }
      if (g.cur && g.cur.r === 0) { finish(true); return; }
      if (g.t <= 0) finish(false);
    };
    g.onClick = function (mx, my) {
      if (!g.cur) return;
      let best = null, bd = 1e9;
      for (const hd of holds) {
        const d = Math.hypot(mx - hd.x, my - hd.y);
        if (d < sp * 0.7 && d < bd) { bd = d; best = hd; }
      }
      if (!best) return;
      if (best === g.cur) return;
      if (Math.hypot(best.x - g.cur.x, best.y - g.cur.y) > sp * 1.62) return;
      if (best.red) { finish(false); return; }
      g.cur = best;
      g.score = Math.max(g.score, ROWS - best.r);
    };
    g.draw = function () {
      const w = W(), h = H();
      g.layout();
      ctx.fillStyle = "#0d1116"; ctx.fillRect(0, 0, w, h);
      // 岩壁
      const wallW = Math.min(520, w - 80);
      rr(w / 2 - wallW / 2, 74, wallW, h - 150, 10, "#1b2028", "#2a313c", 2);
      for (const hd of holds) {
        hd.x = ox + (hd.c - (COLS - 1) / 2) * (wallW / (COLS + 1.2));
        hd.y = oy - (hd.r) * sp;
      }
      for (const hd of holds) {
        const isCur = (hd === g.cur);
        ctx.save();
        ctx.globalAlpha = hd.red ? 0.35 : 0.22;
        ctx.fillStyle = hd.red ? "#ff3b5c" : "#4ad8a0";
        ctx.beginPath(); ctx.arc(hd.x, hd.y, sp * 0.62, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        ctx.fillStyle = hd.red ? "#ff3b5c" : (isCur ? "#b8ffe0" : "#4ad8a0");
        ctx.beginPath(); ctx.arc(hd.x, hd.y, sp * 0.22, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.25)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(hd.x, hd.y, sp * 0.22, 0, Math.PI * 2); ctx.stroke();
      }
      // 攀爬的人
      if (g.cur) {
        const px = g.cur.x, py = g.cur.y;
        ctx.strokeStyle = "#e8eef6"; ctx.lineWidth = 4; ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(px, py + 6); ctx.lineTo(px, py + sp * 0.62);              // 身体
        ctx.moveTo(px, py + sp * 0.95); ctx.lineTo(px - 14, py + sp * 1.5);  // 左腿
        ctx.moveTo(px, py + sp * 0.95); ctx.lineTo(px + 14, py + sp * 1.5);  // 右腿
        ctx.stroke();
        ctx.fillStyle = "#e8eef6";
        ctx.beginPath(); ctx.arc(px, py - 4, 8, 0, Math.PI * 2); ctx.fill();
      }
      // 顶端的终点线
      const ty = oy - (ROWS - 1) * sp - sp * 0.5;
      ctx.strokeStyle = "#ffd23b"; ctx.lineWidth = 3; ctx.setLineDash([10, 8]);
      ctx.beginPath(); ctx.moveTo(w / 2 - wallW / 2 + 10, ty); ctx.lineTo(w / 2 + wallW / 2 - 10, ty); ctx.stroke();
      ctx.setLineDash([]);
      txt("攀岩", 22, 30, 22, "#eaf2fa");
      txt(g.tip, 22, 56, 14, "#8fa0b4");
      txt("高度 " + g.score + " / " + (ROWS - 1), w - 22, 30, 20, "#eaf2fa", "right");
      txt("剩余 " + Math.max(0, g.t).toFixed(1) + "s", w - 22, 56, 15, g.t < 8 ? "#ff6b7f" : "#8fa0b4", "right");
    };
    return g;
  }

  // =========================================================
  // 3 · 打爆小行星 —— 有屏幕出现小行星就打，至少 10 颗
  // =========================================================
  function makeAstro() {
    const COLS = 3, ROWS = 2, N = COLS * ROWS;
    const screens = [];
    const g = { name: "打爆小行星", tip: "哪块屏幕上出现了小行星就打哪块 · 至少 10 颗", score: 0, target: 10, t: 30 };
    for (let i = 0; i < N; i++) {
      screens.push({ i, ast: [], next: Math.random() * 1.2, stars: [] });
      for (let k = 0; k < 26; k++) {
        screens[i].stars.push({ x: Math.random(), y: Math.random(), r: Math.random() * 1.3 + 0.4 });
      }
    }
    let rects = [];
    g.layout = function () {
      const w = W(), h = H();
      const top = 96, pad = 14;
      const availW = Math.min(1000, w - 60), availH = h - top - 90;
      const sw = (availW - pad * (COLS - 1)) / COLS;
      const sh = (availH - pad * (ROWS - 1)) / ROWS;
      const x0 = (w - availW) / 2, y0 = top;
      rects = [];
      for (let i = 0; i < N; i++) {
        const c = i % COLS, r = (i / COLS) | 0;
        rects.push({ x: x0 + c * (sw + pad), y: y0 + r * (sh + pad), w: sw, h: sh });
      }
    };
    g.update = function (dt) {
      g.t -= dt;
      for (let i = 0; i < N; i++) {
        const s = screens[i];
        s.next -= dt;
        if (s.next <= 0) {
          s.next = 0.9 + Math.random() * 1.8;
          if (s.ast.length < 2) {
            s.ast.push({ x: Math.random() * 0.8 + 0.1, y: Math.random() * 0.8 + 0.1, vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.18, r: 0.05 + Math.random() * 0.04, hit: 0 });
          }
        }
        for (const a of s.ast) {
          a.x += a.vx * dt; a.y += a.vy * dt;
          if (a.x < 0.03 || a.x > 0.97) a.vx *= -1;
          if (a.y < 0.03 || a.y > 0.97) a.vy *= -1;
          if (a.hit > 0) a.hit -= dt;
        }
        s.ast = s.ast.filter((a) => !(a.hit < -0.3));
      }
      if (g.score >= g.target) finish(true);
      else if (g.t <= 0) finish(false);
    };
    g.onClick = function (mx, my) {
      for (let i = 0; i < N; i++) {
        const rc = rects[i];
        if (!rc) continue;
        if (mx < rc.x || my < rc.y || mx > rc.x + rc.w || my > rc.y + rc.h) continue;
        const s = screens[i];
        let got = false;
        for (const a of s.ast) {
          const ax = rc.x + a.x * rc.w, ay = rc.y + a.y * rc.h;
          if (Math.hypot(mx - ax, my - ay) < rc.w * 0.10 + 14) { a.hit = -0.31; g.score++; got = true; break; }
        }
        if (!got) g.score = Math.max(0, g.score - 1);
        return;
      }
    };
    g.draw = function () {
      const w = W(), h = H();
      g.layout();
      ctx.fillStyle = "#070a11"; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < N; i++) {
        const rc = rects[i], s = screens[i];
        rr(rc.x, rc.y, rc.w, rc.h, 8, "#0a1020", "#2a3a58", 2);
        // 星空
        for (const stt of s.stars) {
          ctx.fillStyle = "rgba(220,232,255," + (0.25 + stt.r * 0.3).toFixed(2) + ")";
          ctx.fillRect(rc.x + stt.x * rc.w, rc.y + stt.y * rc.h, stt.r, stt.r);
        }
        // 小行星
        for (const a of s.ast) {
          const ax = rc.x + a.x * rc.w, ay = rc.y + a.y * rc.h;
          const R = Math.max(10, rc.w * a.r);
          if (a.hit < 0) {
            ctx.strokeStyle = "rgba(255,190,90," + Math.max(0, 1 + a.hit / 0.3).toFixed(2) + ")";
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(ax, ay, R * (1 + (-a.hit) * 3), 0, Math.PI * 2); ctx.stroke();
            continue;
          }
          ctx.fillStyle = "#9c7b52";
          ctx.beginPath();
          for (let k = 0; k < 8; k++) {
            const ang = (k / 8) * Math.PI * 2;
            const rr2 = R * (0.78 + ((k * 7 + i * 3) % 5) / 14);
            const px = ax + Math.cos(ang) * rr2, py = ay + Math.sin(ang) * rr2;
            if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.closePath(); ctx.fill();
          ctx.fillStyle = "rgba(255,255,255,0.14)";
          ctx.beginPath(); ctx.arc(ax - R * 0.25, ay - R * 0.25, R * 0.30, 0, Math.PI * 2); ctx.fill();
        }
      }
      txt("打爆小行星", 22, 30, 22, "#eaf2fa");
      txt(g.tip, 22, 56, 14, "#8fa0b4");
      txt("命中 " + g.score + " / " + g.target, w - 22, 30, 20, g.score >= g.target ? "#5ef08a" : "#eaf2fa", "right");
      txt("剩余 " + Math.max(0, g.t).toFixed(1) + "s", w - 22, 56, 15, g.t < 7 ? "#ff6b7f" : "#8fa0b4", "right");
    };
    return g;
  }

  // =========================================================
  // 4 · 躲避激光 —— 一边躲激光一边按下房间各处发光的按钮
  // =========================================================
  function makeLaser() {
    const g = { name: "躲避激光", tip: "WASD / 方向键移动 · 把 4 个发光的按钮都按掉", t: 40, got: 0 };
    let px = 0, py = 0, R = 13;
    let room = { x: 0, y: 0, w: 0, h: 0 };
    const btns = [];
    const beams = [];
    g.layout = function () {
      const w = W(), h = H();
      room = { x: Math.min(60, w * 0.08), y: 96, w: w - Math.min(120, w * 0.16), h: h - 96 - 70 };
      if (px === 0) { px = room.x + room.w / 2; py = room.y + room.h - 40; }
      if (!btns.length) {
        const m = 52;
        btns.push({ x: room.x + m, y: room.y + m }, { x: room.x + room.w - m, y: room.y + m });
        btns.push({ x: room.x + m, y: room.y + room.h - m }, { x: room.x + room.w - m, y: room.y + room.h - m });
      }
      if (!beams.length) {
        beams.push({ horiz: true, p: 0.25, v: 0.30 });
        beams.push({ horiz: true, p: 0.70, v: -0.24 });
        beams.push({ horiz: false, p: 0.45, v: 0.34 });
        beams.push({ horiz: false, p: 0.85, v: -0.20 });
      }
    };
    g.update = function (dt) {
      g.t -= dt;
      let dx = 0, dy = 0;
      if (keys["a"] || keys["arrowleft"]) dx -= 1;
      if (keys["d"] || keys["arrowright"]) dx += 1;
      if (keys["w"] || keys["arrowup"]) dy -= 1;
      if (keys["s"] || keys["arrowdown"]) dy += 1;
      const spd = 210 * dt;
      px = Math.max(room.x + R, Math.min(room.x + room.w - R, px + dx * spd));
      py = Math.max(room.y + R, Math.min(room.y + room.h - R, py + dy * spd));
      for (const b of beams) {
        b.p += b.v * dt;
        if (b.p > 1) { b.p = 1; b.v *= -1; }
        if (b.p < 0) { b.p = 0; b.v *= -1; }
      }
      // 撞到激光
      for (const b of beams) {
        const pos = b.horiz ? room.y + b.p * room.h : room.x + b.p * room.w;
        const d = b.horiz ? Math.abs(py - pos) : Math.abs(px - pos);
        if (d < R + 4) { finish(false); return; }
      }
      // 按钮：走上去就按下
      for (const bt of btns) {
        if (!bt.on && Math.hypot(px - bt.x, py - bt.y) < R + 16) { bt.on = true; g.got++; }
      }
      if (g.got >= btns.length) { finish(true); return; }
      if (g.t <= 0) finish(false);
    };
    g.onClick = function () { /* 这个游戏用键盘 */ };
    g.draw = function () {
      const w = W(), h = H();
      g.layout();
      ctx.fillStyle = "#080b10"; ctx.fillRect(0, 0, w, h);
      rr(room.x, room.y, room.w, room.h, 6, "#141a24", "#2b3546", 2);
      ctx.strokeStyle = "rgba(120,150,190,0.10)"; ctx.lineWidth = 1;
      for (let x = room.x; x < room.x + room.w; x += 46) { ctx.beginPath(); ctx.moveTo(x, room.y); ctx.lineTo(x, room.y + room.h); ctx.stroke(); }
      for (let y = room.y; y < room.y + room.h; y += 46) { ctx.beginPath(); ctx.moveTo(room.x, y); ctx.lineTo(room.x + room.w, y); ctx.stroke(); }
      // 按钮
      for (const bt of btns) {
        const t = now() / 1000;
        const pulse = 0.6 + 0.4 * Math.sin(t * 3 + bt.x);
        if (bt.on) {
          ctx.fillStyle = "#2b6c46";
          ctx.beginPath(); ctx.arc(bt.x, bt.y, 15, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = "#5ef08a"; ctx.lineWidth = 2; ctx.stroke();
        } else {
          ctx.save(); ctx.globalAlpha = 0.35 * pulse;
          ctx.fillStyle = "#ffd23b";
          ctx.beginPath(); ctx.arc(bt.x, bt.y, 30, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
          ctx.fillStyle = "#ffd23b";
          ctx.beginPath(); ctx.arc(bt.x, bt.y, 13, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = "rgba(255,255,255,0.6)"; ctx.lineWidth = 2; ctx.stroke();
        }
      }
      // 激光
      for (const b of beams) {
        const pos = b.horiz ? room.y + b.p * room.h : room.x + b.p * room.w;
        ctx.save();
        ctx.globalAlpha = 0.30;
        ctx.strokeStyle = "#ff2d55"; ctx.lineWidth = 12;
        ctx.beginPath();
        if (b.horiz) { ctx.moveTo(room.x, pos); ctx.lineTo(room.x + room.w, pos); }
        else { ctx.moveTo(pos, room.y); ctx.lineTo(pos, room.y + room.h); }
        ctx.stroke();
        ctx.restore();
        ctx.strokeStyle = "#ff5c7d"; ctx.lineWidth = 3;
        ctx.beginPath();
        if (b.horiz) { ctx.moveTo(room.x, pos); ctx.lineTo(room.x + room.w, pos); }
        else { ctx.moveTo(pos, room.y); ctx.lineTo(pos, room.y + room.h); }
        ctx.stroke();
      }
      // 玩家
      ctx.fillStyle = "rgba(120,220,255,0.30)";
      ctx.beginPath(); ctx.arc(px, py, R + 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#7ee0ff";
      ctx.beginPath(); ctx.arc(px, py, R, 0, Math.PI * 2); ctx.fill();
      txt("躲避激光", 22, 30, 22, "#eaf2fa");
      txt(g.tip, 22, 56, 14, "#8fa0b4");
      txt("按钮 " + g.got + " / 4", w - 22, 30, 20, "#eaf2fa", "right");
      txt("剩余 " + Math.max(0, g.t).toFixed(1) + "s", w - 22, 56, 15, g.t < 8 ? "#ff6b7f" : "#8fa0b4", "right");
    };
    return g;
  }

  // =========================================================
  // 5 · 鼹鼠洞 —— 把球放进指定颜色的洞里，球会滚到另一条走廊的同类洞
  // =========================================================
  function makeMole() {
    const COLS = 6, ROWS = 3;
    const PAL = [{ n: "红", c: "#ff5a3b" }, { n: "蓝", c: "#3bd0ff" }, { n: "绿", c: "#8bff5a" }, { n: "黄", c: "#ffd23b" }];
    const holes = [];
    const g = { name: "鼹鼠洞", tip: "把球放进指定颜色的洞 · 球会滚到另一条走廊的同类洞", score: 0, target: 20, t: 100, want: 0, wrong: 0, ball: null };
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      holes.push({ r, c, col: randIdx(), x: 0, y: 0 });
    }
    function randIdx() { return Math.floor(Math.random() * PAL.length); }
    g.want = randIdx();
    g.update = function (dt) {
      g.t -= dt;
      if (g.wrong > 0) g.wrong -= dt;
      if (g.ball) { g.ball.t += dt; if (g.ball.t >= g.ball.dur) g.ball = null; }
      if (g.score >= g.target) finish(true);
      else if (g.t <= 0) finish(false);
    };
    g.onClick = function (mx, my) {
      for (const hd of holes) {
        if (Math.hypot(mx - hd.x, my - hd.y) > 26) continue;
        if (hd.col === g.want) {
          // 球滚到另一条走廊里同色的洞
          const others = holes.filter((o) => o !== hd && o.col === hd.col && o.r !== hd.r);
          const dst = others.length ? others[Math.floor(Math.random() * others.length)] : hd;
          g.ball = { x0: hd.x, y0: hd.y, x1: dst.x, y1: dst.y, t: 0, dur: 0.55, c: PAL[hd.col].c };
          g.score++;
          g.want = randIdx();
        } else {
          g.wrong = 0.6;
          g.t = Math.max(0, g.t - 3);
        }
        return;
      }
    };
    g.draw = function () {
      const w = W(), h = H();
      ctx.fillStyle = "#0b0e14"; ctx.fillRect(0, 0, w, h);
      const top = 110, rowH = Math.min(120, (h - top - 90) / ROWS);
      for (let r = 0; r < ROWS; r++) {
        // 一条走廊
        const y = top + r * rowH + rowH / 2;
        rr(Math.min(50, w * 0.06), y - rowH * 0.30, w - Math.min(100, w * 0.12), rowH * 0.60, 8, "#171d27", "#28313f", 2);
      }
      for (const hd of holes) {
        const y = top + hd.r * rowH + rowH / 2;
        const usable = w - Math.min(100, w * 0.12);
        const x = Math.min(50, w * 0.06) + usable * ((hd.c + 0.5) / COLS);
        hd.x = x; hd.y = y;
        const P = PAL[hd.col];
        const want = (hd.col === g.want);
        ctx.save();
        ctx.globalAlpha = want ? 0.30 + 0.22 * Math.sin(now() / 260) : 0.14;
        ctx.fillStyle = P.c;
        ctx.beginPath(); ctx.arc(x, y, 30, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        ctx.fillStyle = "#05070c";
        ctx.beginPath(); ctx.ellipse(x, y, 19, 13, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = P.c; ctx.lineWidth = want ? 3.5 : 2;
        ctx.beginPath(); ctx.ellipse(x, y, 19, 13, 0, 0, Math.PI * 2); ctx.stroke();
      }
      if (g.ball) {
        const k = Math.min(1, g.ball.t / g.ball.dur);
        const bx = g.ball.x0 + (g.ball.x1 - g.ball.x0) * k;
        const by = g.ball.y0 + (g.ball.y1 - g.ball.y0) * k - Math.sin(k * Math.PI) * 34;
        ctx.fillStyle = "#f2f6f8";
        ctx.beginPath(); ctx.arc(bx, by, 11, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = g.ball.c; ctx.lineWidth = 2; ctx.stroke();
      }
      // 顶上：这轮要什么颜色
      const P = PAL[g.want];
      txt("把球放进", 22, 30, 20, "#eaf2fa");
      ctx.fillStyle = P.c;
      ctx.beginPath(); ctx.arc(150, 30, 13, 0, Math.PI * 2); ctx.fill();
      txt(P.n + "色的洞", 172, 30, 20, P.c);
      txt(g.tip, 22, 56, 14, "#8fa0b4");
      txt(g.score + " / " + g.target, w - 22, 30, 20, "#eaf2fa", "right");
      txt("剩余 " + Math.max(0, g.t).toFixed(1) + "s", w - 22, 56, 15, g.t < 15 ? "#ff6b7f" : "#8fa0b4", "right");
      if (g.wrong > 0) txt("不对 —— 罚 3 秒", w / 2, h - 40, 18, "#ff6b7f", "center");
    };
    return g;
  }

  const MAKERS = { gr: makeGR, climb: makeClimb, astro: makeAstro, laser: makeLaser, mole: makeMole };
  L20.NAMES = { gr: "绿与红", climb: "攀岩", astro: "打爆小行星", laser: "躲避激光", mole: "鼹鼠洞" };

  function finish(win) {
    if (!st) return;
    const cb = doneCb;
    st = null; doneCb = null;
    try { window.removeEventListener("keydown", onKey, true); } catch (e) { /* 忽略 */ }
    try { window.removeEventListener("keyup", onKeyUp, true); } catch (e) { /* 忽略 */ }
    try { cv.removeEventListener("mousedown", onDown, true); } catch (e) { /* 忽略 */ }
    try { cv.removeEventListener("touchstart", onDown, true); } catch (e) { /* 忽略 */ }
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    if (cv) { try { cv.remove(); } catch (e) { /* 忽略 */ } cv = null; ctx = null; }
    if (cb) cb(win);
  }

  let last = 0;
  let fitBound = false;
  const fitBoundFn = function () { fit(); };
  function loop(ts) {
    if (!st) return;
    const dt = Math.min(0.05, last ? (ts - last) / 1000 : 0.016);
    last = ts;
    st.g.update(dt);
    if (!st) return;
    st.g.draw();
    raf = requestAnimationFrame(loop);
  }

  L20.start = function (kind, cb) {
    if (st) return false;
    const mk = MAKERS[kind] || makeGR;
    ensureCanvas();
    fit();
    st = { g: mk(), kind };
    doneCb = cb;
    last = 0;
    for (const k in keys) keys[k] = false;
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("keyup", onKeyUp, true);
    cv.addEventListener("mousedown", onDown, true);
    cv.addEventListener("touchstart", onDown, true);
    if (!fitBound) { fitBound = true; window.addEventListener("resize", fitBoundFn); }
    raf = requestAnimationFrame(loop);
    return true;
  };
  L20.active = function () { return !!st; };
})();
