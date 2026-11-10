// ===========================================================
// Level 1.5 —— 颠倒
// 一个介于诸多层级之间的神秘子层级，"易于进入，难于离开"。
// 呈现一种扭曲畸形的状态，被称为"破碎观"：上下颠倒，正常的黑暗被
// 替换成了视觉上的亮光，荧光闪烁的黑暗自其内的天花板放出。
//
// 声音：没有后室常规的嗡鸣，只有寂静中的低语。低语由层级内的原住民
// 发出 —— 离得越远越清晰，越靠近反而越小。所以"低语声逐渐变小"意味着
// 它已经贴到你身边了，必须多加小心。
//
// 入口：Level 1 里一扇"假的窗户"（碰上去就被拽进来）。
// 出口：档案原文 —— "除了切出以外，目前为止没有其他的已知方法离开"。
// ===========================================================
"use strict";

function generateInvertedMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const props = [];

  // ---- 房间 ----
  const rooms = [];
  for (let i = 0; i < 16; i++) {
    const w = randInt(6, 12), h = randInt(6, 12);
    const x = randInt(2, Math.max(3, size - w - 3));
    const y = randInt(2, Math.max(3, size - h - 3));
    rooms.push({ x, y, w, h, cx: x + (w >> 1), cy: y + (h >> 1) });
    for (let yy = y; yy < y + h && yy < size - 2; yy++)
      for (let xx = x; xx < x + w && xx < size - 2; xx++) grid[yy][xx] = 0;
  }
  // 串起来
  for (let i = 1; i < rooms.length; i++) {
    const a = rooms[i - 1], b = rooms[i];
    carveCorridor(grid, size, a.cx, a.cy, b.cx, b.cy);
  }
  // 再补几条交叉的道，免得成一条直线
  for (let i = 0; i < 6; i++) {
    const a = rooms[randInt(0, rooms.length - 1)];
    const b = rooms[randInt(0, rooms.length - 1)];
    carveCorridor(grid, size, a.cx, a.cy, b.cx, b.cy);
  }

  const start = { x: rooms[0].cx, y: rooms[0].cy, floor: 0 };

  // ---- 破碎观：把地面敲碎，再从墙里凿出几块 ----
  // 这一步会弄出走不到的孤岛，所以敲完立刻做一次连通检查填回去。
  for (let i = 0; i < Math.floor(size * 1.6); i++) {
    const x = randInt(2, size - 3), y = randInt(2, size - 3);
    if (grid[y][x] !== 0) continue;
    if (Math.abs(x - start.x) + Math.abs(y - start.y) < 4) continue;
    grid[y][x] = 1;
  }
  for (let i = 0; i < Math.floor(size * 0.8); i++) {
    const x = randInt(2, size - 3), y = randInt(2, size - 3);
    if (grid[y][x] !== 1) continue;
    // 至少挨着两格地板才凿，否则凿出来的是一个孤立的洞
    let n = 0;
    if (grid[y - 1] && grid[y - 1][x] === 0) n++;
    if (grid[y + 1] && grid[y + 1][x] === 0) n++;
    if (grid[y][x - 1] === 0) n++;
    if (grid[y][x + 1] === 0) n++;
    if (n >= 2) grid[y][x] = 0;
  }
  // 连通兜底：走不到的地板一律填回墙
  const reach = reachableFromRaw(grid, size, start);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++)
      if (grid[y][x] === 0 && !reach.has(x + "," + y)) grid[y][x] = 1;

  const floors = collectFloors(grid, size);
  const isFloor = (x, y) => x >= 0 && y >= 0 && x < size && y < size && grid[y][x] === 0;
  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return;
    props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  };

  // ---- 从天花板放下的黑暗：荧光闪烁的、倒挂着的黑 ----
  const darkSet = new Set();
  for (const t of floors) {
    if (Math.hypot(t.x - start.x, t.y - start.y) < 5) continue;   // 出生点留一块能看清的
    if (Math.random() < 0.20) { put(t.x, t.y, "dark15"); darkSet.add(t.x + "," + t.y); }
  }
  // ---- 原住民（低语者）----
  const whisperers = [];
  for (let i = 0; i < 9; i++) {
    const t = floors[randInt(0, floors.length - 1)];
    if (!t) continue;
    if (Math.hypot(t.x - start.x, t.y - start.y) < 8) continue;
    put(t.x, t.y, "whisper15");
    whisperers.push({ x: t.x, y: t.y });
  }
  // ---- 颠倒的家具：天花板上的桌椅（画在地板格上，只是样子是倒的）----
  for (let i = 0; i < 12; i++) {
    const t = floors[randInt(0, floors.length - 1)];
    if (t) put(t.x, t.y, "upsidedesk15");
  }

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms,
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [],
    dark15: darkSet,
    whisperers,
  };
  map.spawnPts = [start];
  // 没有出口 —— 档案：「除了切出以外，没有已知的离开方法」
  return map;
}
window.generateInvertedMap = generateInvertedMap;

// ---------- 地面 / 墙体 ----------
// 地面是"被亮光替换掉的黑暗"：惨白、刺眼，越看越不对劲。
window.drawInvertedFloor = function (ctx, px, py, S, tx, ty) {
  const alt = ((tx * 7 + ty * 13) % 5) === 0;
  ctx.fillStyle = alt ? "#d3dbe1" : "#dfe6ea";
  ctx.fillRect(px, py, S, S);
  // 颠倒的接缝：缝在格子下半部（正常应该在上面）—— 看着就是"装反了"
  ctx.fillStyle = "rgba(0,0,0,0.08)";
  ctx.fillRect(px, py + S - Math.max(2, S * 0.12), S, Math.max(2, S * 0.12));
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fillRect(px, py, S, Math.max(2, S * 0.08));
  // 零星的裂纹
  if (((tx * 11 + ty * 5) % 17) === 0) {
    ctx.strokeStyle = "rgba(60,70,80,0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px + S * 0.2, py + S * 0.3);
    ctx.lineTo(px + S * 0.55, py + S * 0.6);
    ctx.lineTo(px + S * 0.8, py + S * 0.45);
    ctx.stroke();
  }
  return true;
};
// 墙：也是亮的，但顶沿往下渗着黑 —— 黑暗是从天花板来的
window.drawInvertedWall = function (ctx, px, py, S, style, map) {
  ctx.fillStyle = "#c2ccd4";
  ctx.fillRect(px, py, S, S);
  // 颠倒：亮边压在底部，暗边压在顶部（正常墙体是反过来画的）
  ctx.fillStyle = "rgba(255,255,255,0.20)";
  ctx.fillRect(px, py + S - Math.max(3, S * 0.18), S, Math.max(3, S * 0.18));
  ctx.fillStyle = "rgba(10,12,16,0.55)";
  ctx.fillRect(px, py, S, Math.max(3, S * 0.16));
  ctx.strokeStyle = "rgba(0,0,0,0.30)";
  ctx.lineWidth = 1;
  ctx.strokeRect(px + 0.5, py + 0.5, S - 1, S - 1);
  return true;
};

// ---------- 专属模型 ----------
window.PROP_DRAW = window.PROP_DRAW || {};

// 从天花板放下的黑暗：一团倒挂着的黑，边缘泛着不稳定的荧光，慢慢呼吸
window.PROP_DRAW["dark15"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : 0) / 1000;
  const ph = p.x * 2.1 + p.y * 1.3;
  // 荧光在闪：不是稳定地亮，而是有节奏地抽搐
  const flick = 0.5 + 0.5 * Math.sin(t * 3.1 + ph) * Math.sin(t * 1.7 + ph * 0.6);
  const a = 0.55 + 0.35 * flick;
  ctx.save();
  // 从上往下垂的锥
  ctx.fillStyle = "rgba(6,8,12," + a.toFixed(3) + ")";
  ctx.beginPath();
  ctx.moveTo(-T * 0.50, -T * 0.50);
  ctx.lineTo(T * 0.50, -T * 0.50);
  ctx.lineTo(T * 0.34, T * 0.42 + Math.sin(t * 1.3 + ph) * T * 0.06);
  ctx.lineTo(-T * 0.34, T * 0.42 + Math.cos(t * 1.1 + ph) * T * 0.06);
  ctx.closePath();
  ctx.fill();
  // 边缘那圈荧光
  ctx.strokeStyle = "rgba(150,220,235," + (0.16 + 0.30 * flick).toFixed(3) + ")";
  ctx.lineWidth = Math.max(1, T * 0.035);
  ctx.stroke();
  // 底下淌下来的几点
  ctx.fillStyle = "rgba(6,8,12," + (a * 0.7).toFixed(3) + ")";
  for (let i = 0; i < 3; i++) {
    const xx = -T * 0.26 + i * T * 0.26;
    const yy = T * 0.44 + Math.sin(t * 2.0 + i * 2.2 + ph) * T * 0.07;
    ctx.beginPath(); ctx.ellipse(xx, yy, T * 0.05, T * 0.08, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
};

// 原住民：一团模糊的人形轮廓，看不清脸。它不作声 —— 声音是"低语"机制给的。
window.PROP_DRAW["whisper15"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : 0) / 1000;
  const sway = Math.sin(t * 0.7 + p.x * 1.1) * T * 0.04;
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath(); ctx.ellipse(sway, T * 0.42, T * 0.26, T * 0.07, 0, 0, Math.PI * 2); ctx.fill();
  // 身子：上宽下窄的斗篷状
  ctx.fillStyle = "#4a525a";
  ctx.beginPath();
  ctx.moveTo(sway - T * 0.22, T * 0.40);
  ctx.quadraticCurveTo(sway - T * 0.18, -T * 0.24, sway, -T * 0.30);
  ctx.quadraticCurveTo(sway + T * 0.18, -T * 0.24, sway + T * 0.22, T * 0.40);
  ctx.closePath();
  ctx.fill();
  // 兜帽下那一片：什么都看不见
  ctx.fillStyle = "#1b1f24";
  ctx.beginPath(); ctx.ellipse(sway, -T * 0.22, T * 0.13, T * 0.15, 0, 0, Math.PI * 2); ctx.fill();
  // 两点很淡的光 —— 不能算"眼睛"，只是轮廓里的一点反光
  ctx.fillStyle = "rgba(180,210,220,0.35)";
  ctx.beginPath(); ctx.arc(sway - T * 0.05, -T * 0.24, T * 0.022, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(sway + T * 0.05, -T * 0.24, T * 0.022, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
};

// 颠倒的家具：桌子长在天花板上，桌面朝下
window.PROP_DRAW["upsidedesk15"] = function (ctx, p, T) {
  ctx.save();
  ctx.fillStyle = "#7d848c";
  ctx.fillRect(-T * 0.34, -T * 0.42, T * 0.68, T * 0.12);
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(-T * 0.34, -T * 0.42, T * 0.68, T * 0.04);
  ctx.fillStyle = "#6a7078";
  ctx.fillRect(-T * 0.30, -T * 0.30, T * 0.06, T * 0.24);
  ctx.fillRect(T * 0.24, -T * 0.30, T * 0.06, T * 0.24);
  ctx.restore();
};

// ---------- 每帧：低语机制 ----------
window.__LEVEL_TICK = window.__LEVEL_TICK || {};
window.__LEVEL_TICK["1.5"] = function (g, dt) {
  const ws = (g.map && g.map.whisperers) || [];
  if (!ws.length) return;
  const px = g.player.x / (typeof TILE === "number" ? TILE : 40);
  const py = g.player.y / (typeof TILE === "number" ? TILE : 40);

  // 最近的那一个
  let best = 1e9;
  for (const w of ws) best = Math.min(best, Math.hypot(w.x - px, w.y - py));
  g.whisperDist = best;

  // 低语的"音量"是反的：离得越远越清晰，越靠近反而越小。
  // 所以听见低语变小 —— 说明它已经贴到你身上了。
  let vol;                                  // 0 = 完全听不见，1 = 非常清晰
  if (best > 14) vol = 0.85;
  else if (best > 8) vol = 1.0;             // 中距离最清楚
  else vol = Math.max(0, (best - 1.2) / 6.8);   // 贴身时几乎听不见

  // 原住民会缓慢地朝你靠过来 —— 你不走近它，它也会走近你
  const now = (typeof performance !== "undefined" ? performance.now() : 0) / 1000;
  for (const w of ws) {
    const d = Math.hypot(w.x - px, w.y - py);
    if (d > 0.4 && d < 26) {
      const sp = 0.42 * dt;                 // 很慢，不至于追得人无处可逃
      w.x += ((px - w.x) / d) * sp;
      w.y += ((py - w.y) / d) * sp;
      w.x = Math.max(1, Math.min((g.map.size || 84) - 2, w.x));
      w.y = Math.max(1, Math.min((g.map.size || 84) - 2, w.y));
    }
  }

  // 贴身：低语几乎听不见了 —— 这才是真正的危险信号
  if (best < 3.2) {
    g.sanity = Math.max(0, g.sanity - 7.5 * dt);
    if (!g._whisperNear || now - g._whisperNear > 6) {
      g._whisperNear = now;
      if (typeof window.__toast === "function") {
        window.__toast("低语声几乎听不见了 —— 它就在你旁边");
      }
    }
  } else {
    // 远处听得清清楚楚：提醒一次，让玩家明白"越清楚反而越安全"
    if (best > 10 && (!g._whisperFar || now - g._whisperFar > 14)) {
      g._whisperFar = now;
      if (typeof window.__toast === "function") {
        window.__toast("远处的低语很清晰 —— 有些似乎还在劝你离开");
      }
    }
  }
  g.whisperVol = vol;
};

// ---------- Level 1 里那扇"假的窗户" ----------
// 看着像一扇普通的窗，可窗外的天空是上下颠倒的 —— 别的窗户不会这样。
window.PROP_DRAW["fakewin15"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : 0) / 1000;
  const w = T * 0.86, h = T * 0.70;
  // 窗框
  ctx.fillStyle = "#8a9096";
  ctx.fillRect(-w / 2 - 3, -h / 2 - 3, w + 6, h + 6);
  // 窗外：颠倒的天 —— 亮的是地面那一半，黑的是天空那一半（和正常相反）
  ctx.fillStyle = "#0d1014";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#dfe6ea";
  ctx.fillRect(-w / 2, -h / 2, w, h * 0.42);          // 亮的一半压在上面
  // 缓慢飘过的、倒着的云
  const drift = (t * 0.06 + p.x * 0.13) % 1;
  ctx.fillStyle = "rgba(40,48,56,0.55)";
  ctx.beginPath();
  ctx.ellipse(-w / 2 + drift * w * 1.6 - w * 0.3, -h * 0.30, w * 0.16, h * 0.10, 0, 0, Math.PI * 2);
  ctx.fill();
  // 玻璃的斜向反光
  ctx.strokeStyle = "rgba(255,255,255,0.20)";
  ctx.lineWidth = Math.max(1, T * 0.04);
  ctx.beginPath();
  ctx.moveTo(-w * 0.34, h * 0.34); ctx.lineTo(w * 0.10, -h * 0.34);
  ctx.stroke();
  // 十字窗棂
  ctx.strokeStyle = "#8a9096";
  ctx.lineWidth = Math.max(1.4, T * 0.05);
  ctx.beginPath();
  ctx.moveTo(0, -h / 2); ctx.lineTo(0, h / 2);
  ctx.moveTo(-w / 2, 0); ctx.lineTo(w / 2, 0);
  ctx.stroke();
  // 一点不稳定的荧光 —— 它确实是"通往别处"的口子
  const a = 0.22 + 0.18 * Math.sin(t * 2.4 + p.x);
  ctx.strokeStyle = "rgba(170,220,235," + a.toFixed(3) + ")";
  ctx.lineWidth = Math.max(1, T * 0.035);
  ctx.strokeRect(-w / 2 - 3, -h / 2 - 3, w + 6, h + 6);
};
