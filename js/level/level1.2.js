// ===========================================================
// Level 1.2 —— 砼苑
// 它是 Level 1 花园段"广阔到成为一个层级"的部分。
// 外观：一条条连通的走廊，有的走廊两边立着正方形柱子，走廊有长有短、有宽有挤。
// 植被茂盛到长在柱子上、甚至天花板上，地面早已全是植被，像一片草地。
// 特性与花园段完全相同：站着不动，地上的植被就会向上生长、捆绑、吞噬流浪者。
// 出口：尚未发现 —— 这一层没有出口。
// ===========================================================
"use strict";

function generateConcreteGardenMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const props = [];
  const grass = new Set();

  // 一条条横竖交叉的走廊：宽窄随机（1 格是"挤"，3 格是"宽"）
  const lanes = [];
  const N = 5;
  for (let i = 0; i < N; i++) {
    const at = Math.floor(size * (0.12 + 0.155 * i));
    lanes.push({ h: true, at, w: randInt(1, 3) });
    const at2 = Math.floor(size * (0.12 + 0.155 * i));
    lanes.push({ h: false, at: at2, w: randInt(1, 3) });
  }
  for (const L of lanes) {
    const half = Math.floor(L.w / 2);
    for (let p = 2; p < size - 2; p++) {
      for (let k = -half; k <= half; k++) {
        const a = L.at + k;
        if (a < 2 || a >= size - 2) continue;
        if (L.h) grid[a][p] = 0; else grid[p][a] = 0;
      }
    }
  }
  // 走廊太挤会把地图切成互不连通的块 —— 补几条斜着的小道把街区串起来
  for (let i = 0; i < N - 1; i++) {
    const x0 = Math.floor(size * (0.12 + 0.155 * i));
    const y0 = Math.floor(size * (0.12 + 0.155 * i));
    const x1 = Math.floor(size * (0.12 + 0.155 * (i + 1)));
    const y1 = Math.floor(size * (0.12 + 0.155 * (i + 1)));
    carveCorridor(grid, size, x0 + 2, y0 + 2, x1 + 2, y1 + 2);
  }

  const floors = collectFloors(grid, size);
  for (const t of floors) grass.add(t.x + "," + t.y);

  // 出生点：中央那条走廊的交汇处
  const mid = Math.floor(size / 2);
  const start = { x: mid, y: mid, floor: 0 };
  if (grid[start.y][start.x] !== 0) {
    let best = null, bd = 1e9;
    for (const t of floors) {
      const d = Math.abs(t.x - mid) + Math.abs(t.y - mid);
      if (d < bd && grid[t.y][t.x] === 0) { bd = d; best = t; }
    }
    if (best) { start.x = best.x; start.y = best.y; }
  }

  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return;
    props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  };
  const keyOf = (x, y) => x + "," + y;
  const isFloor = (x, y) => x >= 0 && y >= 0 && x < size && y < size && grid[y][x] === 0;

  // 地面上的植被（一丛丛的草）—— 密度很高，因为地面"早已全是植被"
  for (const t of floors) {
    if (Math.random() < 0.55) put(t.x, t.y, "bush12");
  }
  // 从天花板垂下来的藤蔓
  for (const t of floors) {
    if (Math.random() < 0.30) put(t.x, t.y, "vine12");
  }
  // 正方形柱子：立在走廊两边（画在墙格上，绝不挡路），柱身爬满藤蔓
  const pillarSet = new Set();
  for (const t of floors) {
    for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const wx = t.x + d[0], wy = t.y + d[1];
      if (!isFloor(wx, wy) && grid[wy] && grid[wy][wx] === 1) {
        const k = keyOf(wx, wy);
        if (pillarSet.has(k)) continue;
        if (Math.random() > 0.16) continue;
        pillarSet.add(k);
        put(wx, wy, "pillar12");
        break;
      }
    }
  }
  // 几株长得格外大的植物
  for (let i = 0; i < 14; i++) {
    const t = floors[randInt(0, floors.length - 1)];
    if (t) put(t.x, t.y, "plant12");
  }

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [],
    grass,
  };
  map.spawnPts = [start];
  // 这一层没有出口（档案：「出口：我们尚未发现」）
  return map;
}

// ---------- 专属模型（Level 1.2 砼苑 / Level 1 花园段 共用） ----------
window.PROP_DRAW = window.PROP_DRAW || {};

// 地上的草丛：一撮撮的叶子，风一吹会轻轻晃（用 p.x 做相位，不至于整片同步）
window.PROP_DRAW["bush12"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : 0) / 1000;
  const ph = (p.x * 1.7 + p.y * 2.3);
  const sway = Math.sin(t * 1.1 + ph) * T * 0.05;
  ctx.save();
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI / 2 + (i - 3) * 0.30;
    const len = T * (0.30 + ((i * 37 + p.x * 13 + p.y * 7) % 10) / 60);
    ctx.strokeStyle = ["#2f5f2c", "#376b30", "#28522a", "#3f7534"][i % 4];
    ctx.lineWidth = Math.max(1.6, T * 0.055);
    ctx.beginPath();
    ctx.moveTo(0, T * 0.30);
    ctx.quadraticCurveTo(Math.cos(a) * len * 0.5, T * 0.30 - len * 0.6,
      Math.cos(a) * len + sway, T * 0.30 - len);
    ctx.stroke();
  }
  ctx.restore();
};

// 从天花板垂下来的藤蔓：顶上一段横着的枝，下面垂着几条带叶子的须
window.PROP_DRAW["vine12"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : 0) / 1000;
  const sway = Math.sin(t * 0.9 + p.x * 1.3) * T * 0.04;
  ctx.save();
  ctx.strokeStyle = "rgba(28,58,28,0.30)";
  ctx.lineWidth = Math.max(1.4, T * 0.05);
  ctx.beginPath(); ctx.moveTo(-T * 0.36, -T * 0.44); ctx.lineTo(T * 0.36, -T * 0.40); ctx.stroke();
  for (let i = 0; i < 4; i++) {
    const x = -T * 0.30 + i * T * 0.20;
    const len = T * (0.30 + ((i * 41 + p.y * 11) % 9) / 26);
    ctx.strokeStyle = ["#2b5a2a", "#356b2e"][i % 2];
    ctx.lineWidth = Math.max(1.2, T * 0.038);
    ctx.beginPath();
    ctx.moveTo(x, -T * 0.42);
    ctx.quadraticCurveTo(x + sway, -T * 0.42 + len * 0.6, x + sway * 2, -T * 0.42 + len);
    ctx.stroke();
    // 叶
    ctx.fillStyle = "#3d7335";
    ctx.beginPath();
    ctx.ellipse(x + sway * 2 + T * 0.05, -T * 0.42 + len * 0.72, T * 0.055, T * 0.028, 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
};

// 正方形柱子：混凝土方柱，四面爬满藤蔓 —— 长在柱子上的是真的植被
window.PROP_DRAW["pillar12"] = function (ctx, p, T) {
  const w = T * 0.92, h = T * 1.05;
  ctx.fillStyle = "#6d757a";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "rgba(255,255,255,0.10)";
  ctx.fillRect(-w / 2, -h / 2, w, T * 0.10);
  ctx.fillStyle = "rgba(0,0,0,0.32)";
  ctx.fillRect(-w / 2, h / 2 - T * 0.12, w, T * 0.12);
  // 柱身裂缝
  ctx.strokeStyle = "rgba(0,0,0,0.28)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-w * 0.2, -h * 0.3); ctx.lineTo(w * 0.05, -h * 0.05); ctx.lineTo(-w * 0.1, h * 0.3);
  ctx.stroke();
  // 爬在柱子上的藤：左右各一条，绕着往上
  for (const s of [-1, 1]) {
    ctx.strokeStyle = "#31632d";
    ctx.lineWidth = Math.max(1.4, T * 0.045);
    ctx.beginPath();
    ctx.moveTo(s * w * 0.34, h * 0.42);
    ctx.bezierCurveTo(s * w * 0.52, h * 0.10, s * w * 0.16, -h * 0.12, s * w * 0.38, -h * 0.44);
    ctx.stroke();
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = "#3d7335";
      const yy = h * 0.30 - i * h * 0.28;
      ctx.beginPath();
      ctx.ellipse(s * (w * 0.34 + (i % 2 ? T * 0.07 : -T * 0.06)), yy, T * 0.06, T * 0.03, s * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
};

// 长得格外大的一株：粗茎 + 几片大叶子，比草丛显眼
window.PROP_DRAW["plant12"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : 0) / 1000;
  const sway = Math.sin(t * 0.8 + p.x * 0.9 + p.y * 1.7) * T * 0.05;
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.34, T * 0.26, T * 0.08, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#2a5527";
  ctx.lineWidth = Math.max(2, T * 0.075);
  ctx.beginPath();
  ctx.moveTo(0, T * 0.34);
  ctx.quadraticCurveTo(sway, T * 0.02, sway * 1.6, -T * 0.34);
  ctx.stroke();
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i - 2) * 0.55;
    const yy = -T * 0.10 + i * T * 0.02;
    ctx.fillStyle = ["#35702f", "#2c5f2b", "#3f7d38"][i % 3];
    ctx.beginPath();
    ctx.ellipse(sway * 1.4 + Math.cos(a) * T * 0.30, yy + Math.sin(a) * T * 0.16,
      T * 0.20, T * 0.075, a * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
};

// 花园段最深处那团绿光：从植被底下透出来，会呼吸。
// 这是 Level 1 -> Level 1.2 的入口标记 —— 走过去就到，不用按 E。
window.PROP_DRAW["gardenglow12"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : 0) / 1000;
  const pulse = 0.72 + 0.28 * Math.sin(t * 1.8);
  ctx.save();
  // 底下一圈被光照亮的草
  const rg = ctx.createRadialGradient(0, 0, T * 0.05, 0, 0, T * 0.92);
  rg.addColorStop(0, "rgba(150,255,140," + (0.55 * pulse).toFixed(3) + ")");
  rg.addColorStop(0.45, "rgba(96,214,104," + (0.26 * pulse).toFixed(3) + ")");
  rg.addColorStop(1, "rgba(60,160,80,0)");
  ctx.fillStyle = rg;
  ctx.beginPath(); ctx.arc(0, 0, T * 0.92, 0, Math.PI * 2); ctx.fill();
  // 往上升起的三道光柱
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 3; i++) {
    const bx = (i - 1) * T * 0.20;
    const h = T * (0.55 + 0.16 * Math.sin(t * 2.1 + i * 1.7));
    const lg = ctx.createLinearGradient(0, T * 0.28, 0, T * 0.28 - h);
    lg.addColorStop(0, "rgba(140,255,150," + (0.34 * pulse).toFixed(3) + ")");
    lg.addColorStop(1, "rgba(140,255,150,0)");
    ctx.fillStyle = lg;
    ctx.fillRect(bx - T * 0.055, T * 0.28 - h, T * 0.11, h);
  }
  // 光心里几片发亮的叶子
  ctx.fillStyle = "rgba(198,255,186," + (0.85 * pulse).toFixed(3) + ")";
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + t * 0.35;
    ctx.beginPath();
    ctx.ellipse(Math.cos(a) * T * 0.16, Math.sin(a) * T * 0.10,
      T * 0.07, T * 0.032, a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
};
