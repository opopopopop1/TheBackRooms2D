// ===========================================================
// 1.3.2 批次 B：Level 38 多叠交点 / Level 43 水世界 / Level 34 下水道系统
// ===========================================================
"use strict";

(function () {
  const R = (k, v) => {
    if (typeof regTile === "function") regTile(k, v);
    else (window.__NEWTILE_EXTRA = window.__NEWTILE_EXTRA || {})[k] = v;
  };
  R("overlap38", ["#8a8478", "#7a7468", "#5a5852"]);
  R("waterpark43", ["#b9c3c6", "#aab5b9", "#6c8288"]);
  R("sewer34", ["#4e534c", "#454a44", "#5b4b3c"]);
})();

window.__B3_FLOOR = window.__B3_FLOOR || {};
window.__B3_WALL = window.__B3_WALL || {};
window.PROP_DRAW = window.PROP_DRAW || {};
window.__LEVEL_TICK = window.__LEVEL_TICK || {};

function b3bHash(x, y) {
  let h = ((x | 0) * 2246822519 + (y | 0) * 3266489917) | 0;
  h = Math.imul(h ^ (h >>> 13), 668265263) | 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function b3bSpot(floors, pred) {
  const c = floors.filter(pred);
  return c.length ? c[Math.floor(Math.random() * c.length)] : floors[0];
}

// ===================== Level 38 · 多叠交点 =====================
// 里界（不在天空盒内的室内）最常见；表界是室外，铺着 Level 10 的麦子。
// 每 20 格一道分隔墙，每道墙留 3 格门洞 —— 区块全部连通，又不会连成一片空地。
const O38_SRC = [
  { lv: 0, f: "#b6ac86", w: "#8a7f60", tag: "Level 0 的房间布局" },
  { lv: 1, f: "#8d8d88", w: "#5f6062", tag: "Level 1 的闪烁灯管" },
  { lv: 2, f: "#7b8288", w: "#555c62", tag: "Level 2 的上锁门与管道" },
  { lv: 4, f: "#e2e0d2", w: "#a9a89a", tag: "Level 4 的窗口" },
  { lv: 5, f: "#a48a72", w: "#6b5342", tag: "Level 5 的装饰陈设" },
  { lv: 6, f: "#414449", w: "#2e3034", tag: "Level 6 的完全黑暗" },
  { lv: 8, f: "#6a6052", w: "#4b4238", tag: "Level 8 的钟乳石" },
  { lv: 10, f: "#b6ab62", w: "#7d7444", tag: "Level 10 的麦田（表界）" },
  { lv: 12, f: "#d6d8d4", w: "#9ea29e", tag: "Level 12 的图像屏蔽" },
  { lv: 19, f: "#8b7a62", w: "#61513f", tag: "Level 19 的脆弱地板" },
  { lv: 26, f: "#a89a52", w: "#6c6238", tag: "Level 26 的迷乱布局" },
  { lv: 33, f: "#8b8d84", w: "#5c5e58", tag: "Level 33 的腐化" },
  { lv: 34, f: "#5c5850", w: "#4b463e", tag: "Level 34 的砖石隧道" },
  { lv: 37, f: "#cdd8dc", w: "#8fa4ac", tag: "Level 37 的白色瓷砖与水" },
];

function generateOverlap38Map(level) {
  const size = 120, grid = makeGrid(size);
  carveRoom(grid, size, 3, 3, size - 6, size - 6);
  for (let k = 20; k < size - 3; k += 20) {
    for (let v = 3; v < size - 3; v++) {
      const holeY = (v % 20 >= 8 && v % 20 <= 10);
      const holeX = (v % 20 >= 8 && v % 20 <= 10);
      if (!holeY) grid[v][k] = 1;
      if (!holeX) grid[k][v] = 1;
    }
  }
  const floors = collectFloors(grid, size);
  const patch = new Map();
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const bx = Math.min(5, Math.floor(x / 20)), by = Math.min(5, Math.floor(y / 20));
    patch.set(x + "," + y, O38_SRC[(bx * 3 + by * 7 + Math.floor(b3bHash(bx, by) * 5)) % O38_SRC.length]);
  }
  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [[]],
    start: { x: 10, y: 10, floor: 0 },
    exit: null, doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props: [], crates: [], ground: [], spawnPts: [{ x: 10, y: 10, floor: 0 }],
    wander: null, o38patch: patch,
  };
  makeDoorsMap(map);
  const P = (x, y, type, extra) => map.props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  // 唯一出口：原路返回 Level 37
  P(9, 9, "o38back", { toLevel: 37, tip: "来时那处混乱的地方 —— 原路返回 Level 37" });
  // B.N.T.G「行商」前哨站：因不稳定与实体进攻已废弃
  P(30, 30, "o38trader", { iKind: "o38trader" });
  // 各来源层级的残留物
  const relics = [
    ["o38flicker", "Level 1 的灯管，闪得没有规律"], ["o38pipe", "Level 2 的管道与上锁的门"],
    ["o38window", "Level 4 的窗口，外面是一片模糊"], ["o38dark", "Level 6 的完全黑暗，只在里界"],
    ["o38stalactite", "让人联想到 Level 8 的钟乳石"], ["o38wheat", "表界的小麦，从 Level 10 来"],
    ["o38faceling", "不活跃的无面灵，像在 Level 11 一样游荡"],
    ["o38screen", "Level 12 的图像屏蔽 —— 拍下来全是扭曲的"],
    ["o38engine", "Level 15 的引擎轰鸣，找不到声源"], ["o38floor", "Level 19 的脆弱地板，踩上去会响"],
    ["o38stair", "随机出现的楼梯、门与走廊（Level 26）"], ["o38spring", "洞穴里偶尔冒出的泉水（Level 27）"],
    ["o38pizza", "Level 31 萦绕不散的披萨和苏打水气味"], ["o38rot", "越往深处越明显的腐化（Level 33）"],
    ["o38tunnel", "Level 34 那种狭窄的砖石隧道"], ["o38food", "Level 36 受污染的食物"],
    ["o38tiles", "Level 37 的白色瓷砖，地上积着水"],
  ];
  relics.forEach(([t], i) => {
    const s = b3bSpot(floors, f => b3bHash(f.x + i * 13, f.y + 7) > 0.28);
    P(s.x, s.y, t, { iKind: t });
  });
  for (let i = 0; i < 40; i++) {
    const s = floors[Math.floor(Math.random() * floors.length)];
    P(s.x, s.y, "o38debris");
  }
  return map;
}
window.generateOverlap38Map = generateOverlap38Map;

window.__B3_FLOOR["overlap38"] = function (ctx, px, py, S, map, tx, ty) {
  const p = map.o38patch && map.o38patch.get(tx + "," + ty);
  ctx.fillStyle = p ? p.f : "#8a8478"; ctx.fillRect(px, py, S, S);
  const r = b3bHash(tx, ty);
  ctx.fillStyle = "rgba(255,255,255,.07)";
  ctx.fillRect(px, py, S, Math.max(1, S * 0.08));
  if (r > 0.72) { ctx.fillStyle = "rgba(30,28,24,.16)"; ctx.fillRect(px + S * 0.2, py + S * 0.5, S * 0.6, S * 0.07); }
  return true;
};
window.__B3_WALL["overlap38"] = function (ctx, px, py, S, map, tx, ty) {
  const p = map.o38patch && map.o38patch.get(tx + "," + ty);
  ctx.fillStyle = p ? p.w : "#5a5852"; ctx.fillRect(px, py, S, S);
  ctx.fillStyle = "rgba(255,255,255,.14)"; ctx.fillRect(px, py, S, Math.max(2, S * 0.14));
  ctx.fillStyle = "rgba(0,0,0,.24)"; ctx.fillRect(px, py + S - Math.max(2, S * 0.14), S, Math.max(2, S * 0.14));
  // 叠加的边缘：两块不同来源的材质拼在一起，留一道亮缝
  if ((tx + ty) % 7 === 0) { ctx.fillStyle = "rgba(240,226,180,.22)"; ctx.fillRect(px, py, Math.max(1, S * 0.07), S); }
  return true;
};

window.__B2_OVL["38"] = function (ctx, g) {
  const cw = ctx.canvas.width, ch = ctx.canvas.height;
  ctx.save();
  try { ctx.setTransform(1, 0, 0, 1, 0, 0); } catch (e) { /* 忽略 */ }
  // 区域界限不固定：一层缓慢流动的混合过渡
  const t = performance.now() / 1000;
  for (let i = 0; i < 5; i++) {
    const x = ((i * 311 + t * 16) % (cw + 200)) - 100;
    ctx.fillStyle = "rgba(210,196,160,.035)";
    ctx.fillRect(x, 0, 70, ch);
  }
  ctx.restore();
};

// ===================== Level 43 · 水世界 =====================
// 废弃水族馆：一间间展厅、干涸/破损的大展缸、写着物种却空无一物的铭牌
const W43_SPECIES = [
  "大白鲨", "鲸鲨", "虎鲸", "宽吻海豚", "蝠鲼", "帝企鹅", "海月水母", "巨型章鱼",
  "鹦鹉螺", "绿海龟", "海马", "小丑鱼", "蓝鳍金枪鱼", "儒艮", "电鳗", "狮子鱼",
  "红海星", "美洲螯龙虾", "鹿角珊瑚", "腔棘鱼", "翻车鱼", "蓝斑条尾魟", "栉水母", "河豚",
];
const W43_SERVICE = ["设备间", "员工通道", "标本库（空）", "水泵房", "检票口", "储物间"];
// 固定出口/出生点：展缸必须给它们留空，不能把物件埋进玻璃里
const W43_FIXED = [
  [16, 12], [94, 14], [112, 52], [88, 32], [80, 30],
  [20, 82], [30, 90], [44, 90], [92, 112], [112, 92], [12, 52],
];
function w43RectHasFixed(x, y, w, h) {
  for (const [fx, fy] of W43_FIXED) {
    if (fx >= x - 2 && fx <= x + w + 1 && fy >= y - 2 && fy <= y + h + 1) return true;
  }
  return false;
}
function w43FindFloor(grid, x, y, used) {
  const dirs = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [2, 0], [-2, 0], [0, 2], [0, -2],
    [2, 2], [-2, -2], [2, -2], [-2, 2], [3, 0], [-3, 0], [0, 3], [0, -3]];
  for (const [dx, dy] of dirs) {
    const nx = x + dx, ny = y + dy, k = nx + "," + ny;
    if (grid[ny] && grid[ny][nx] === 0 && !used.has(k)) { used.add(k); return { x: nx, y: ny }; }
  }
  return null;
}

function generateWater43Map(level) {
  const size = 126, grid = makeGrid(size);
  const quads = [[4, 4, 56, 56], [66, 4, 56, 56], [4, 66, 56, 56], [66, 66, 56, 56]];
  for (const [x, y, w, h] of quads) carveRoom(grid, size, x, y, w, h);
  const tunnel = (x0, y0, x1, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) grid[y][x] = 0; };
  tunnel(60, 30, 66, 34); tunnel(60, 92, 66, 96);
  tunnel(30, 60, 34, 66); tunnel(92, 60, 96, 66);

  // 每个象限切成 3×3 共 9 间展厅：隔墙每道留 3 格门洞，房间全部连通
  const rooms = [];
  for (const [qx, qy] of [[4, 4], [66, 4], [4, 66], [66, 66]]) {
    const xs = [qx, qx + 19, qx + 37], xe = [qx + 17, qx + 35, qx + 55];
    const ys = [qy, qy + 19, qy + 37], ye = [qy + 17, qy + 35, qy + 55];
    for (const wx of [qx + 18, qx + 36]) {
      for (let y = qy; y <= qy + 55; y++) grid[y][wx] = 1;
      for (let j = 0; j < 3; j++) {
        const c = Math.round((ys[j] + ye[j]) / 2);
        for (let d = -1; d <= 1; d++) grid[c + d][wx] = 0;
      }
    }
    for (const wy of [qy + 18, qy + 36]) {
      for (let x = qx; x <= qx + 55; x++) grid[wy][x] = 1;
      for (let j = 0; j < 3; j++) {
        const c = Math.round((xs[j] + xe[j]) / 2);
        for (let d = -1; d <= 1; d++) grid[wy][c + d] = 0;
      }
    }
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
      rooms.push({ x: xs[c], y: ys[r], w: xe[c] - xs[c] + 1, h: ye[r] - ys[r] + 1, row: r, col: c });
    }
  }

  // 大展缸：9×5 格，24 间展厅有缸，12 间是设备/通道；干涸，约 1/3 玻璃破损
  const tanks = [], tankAt = new Map(), tankNear = new Map();
  let ti = 0;
  for (let i = 0; i < rooms.length; i++) {
    const r = rooms[i];
    if (i % 3 === 1) { r.service = W43_SERVICE[(i / 3 | 0) % W43_SERVICE.length]; continue; }
    const tw = 9, th = 5;
    const offsets = [[3, 3], [4, 3], [3, 5], [4, 5], [3, 7], [6, 3], [3, 9]];
    let tx = r.x + 3, ty = r.y + 3, ok = false;
    for (const [ox, oy] of offsets) {
      const cx = r.x + ox, cy = r.y + oy;
      if (cx + tw - 1 > r.x + r.w - 2 || cy + th - 1 > r.y + r.h - 2) continue;
      if (w43RectHasFixed(cx, cy, tw, th)) continue;
      tx = cx; ty = cy; ok = true; break;
    }
    if (!ok) { r.service = W43_SERVICE[(i / 3 | 0) % W43_SERVICE.length]; continue; }
    const t = {
      x: tx, y: ty, w: tw, h: th, room: i, index: ti,
      species: W43_SPECIES[ti % W43_SPECIES.length], broken: (ti % 3 === 2),
    };
    tanks.push(t); r.species = t.species; r.tank = t; ti++;
    for (let yy = ty; yy < ty + th; yy++) for (let xx = tx; xx < tx + tw; xx++) {
      grid[yy][xx] = 1; tankAt.set(xx + "," + yy, t);
    }
    for (let yy = ty - 1; yy <= ty + th; yy++) for (let xx = tx - 1; xx <= tx + tw; xx++) {
      if (grid[yy] && grid[yy][xx] === 0) tankNear.set(xx + "," + yy, t);
    }
  }
  if (window.__B3_prune) window.__B3_prune(grid, size, 12, 52);
  const floors = collectFloors(grid, size);
  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [[]],
    start: { x: 12, y: 52, floor: 0 },
    exit: null, doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props: [], crates: [], ground: [], spawnPts: [{ x: 12, y: 52, floor: 0 }],
    wander: null, w43flood: false, w43quads: quads,
    w43Rooms: rooms, w43Tanks: tanks, w43TankAt: tankAt, w43TankNear: tankNear,
  };
  makeDoorsMap(map);
  const P = (x, y, type, extra) => map.props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  const used = new Set();
  // 一区（公园外部）：灌木丛走一两个小时 → Level 9
  P(16, 12, "w43bush", { toLevel: 9, tip: "公园外部的灌木丛 —— 钻进去，走上一两个小时" });
  // 二区（主楼）：街机 → 40，数周 → 33
  P(94, 14, "w43arcade", { toLevel: 40, tip: "一台居然还能运作的街机" });
  P(112, 52, "w43weeks", { toLevel: 33, tip: "主楼深处 —— 走上数周，就到了 Level 33" });
  P(88, 32, "w43dome", { iKind: "w43dome" });
  P(80, 30, "w43ticket", { iKind: "w43ticket" });
  // 三区（员工大厅）：电脑里的 New_Video.avi —— 绝对不能点
  P(20, 82, "w43video", { iKind: "w43video" });
  P(30, 90, "w43grate9", { toLevel: 2, tip: "员工大厅里通往 Level 2 的门洞" });
  P(44, 90, "w43grate4", { toLevel: 4, tip: "员工大厅里通往 Level 4 的门洞" });
  // 四区（最终阶段）：舱门 → 34；切出 → 287（负数层级的起点）
  P(92, 112, "w43hatch", { toLevel: 34, tip: "一扇舱门，水已经漫到门框" });
  P(112, 92, "w43clip", { toLevel: 287, tip: "切出 —— 掉进负数层级的起点" });
  for (const p of map.props) used.add(p.x + "," + p.y);
  // 每个大展缸前有一块可按 E 查看的铭牌，写着本该养在里面的水生生物
  for (const t of tanks) {
    const f = w43FindFloor(grid, t.x + Math.floor(t.w / 2), t.y + t.h + 1, used);
    if (!f) continue;
    P(f.x, f.y, "w43tank", { iKind: "w43tank", species: t.species, broken: t.broken });
  }
  const pick = (pred) => {
    const c = floors.filter(p => !used.has(p.x + "," + p.y) && (!pred || pred(p)));
    if (!c.length) return null;
    const s = c[Math.floor(Math.random() * c.length)];
    used.add(s.x + "," + s.y);
    return s;
  };
  for (let i = 0; i < 8; i++) {
    const s = pick(f => f.x < 60 && f.y > 66);
    if (s) P(s.x, s.y, "w43office", { iKind: "w43office" });
  }
  for (let i = 0; i < 10; i++) {
    const s = pick(null);
    if (s) P(s.x, s.y, "w43speaker", { iKind: "w43speaker" });
  }
  const junk = ["w43bench", "w43lamp", "w43trash", "w43sign"];
  for (let i = 0; i < 34; i++) {
    const s = pick(null);
    if (s) P(s.x, s.y, junk[i % 4]);
  }
  return map;
}
window.generateWater43Map = generateWater43Map;

// 大展缸的瓦片：金属框 + 干涸的玻璃缸 + 破损裂纹；缸里一条鱼也没有
function drawW43TankTile(ctx, px, py, S, t, lx, ly) {
  const w = t.w, h = t.h;
  const edge = (lx === 0 || ly === 0 || lx === w - 1 || ly === h - 1);
  ctx.fillStyle = "#26363c"; ctx.fillRect(px, py, S, S);
  if (edge) {
    ctx.fillStyle = "#3e535a"; ctx.fillRect(px + 1, py + 1, S - 2, S - 2);
    ctx.fillStyle = "rgba(200,225,220,.20)"; ctx.fillRect(px + 1, py + 1, S - 2, Math.max(2, S * 0.12));
    ctx.fillStyle = "rgba(0,0,0,.38)"; ctx.fillRect(px + 1, py + S - Math.max(2, S * 0.14), S - 2, Math.max(2, S * 0.14));
    if (lx === 0 || lx === w - 1) {
      ctx.fillStyle = "rgba(210,230,225,.14)";
      ctx.fillRect(px + S * 0.44, py, S * 0.12, S);
    }
    // 缸体正面的物种铭牌：画在最后一格，往左延伸不会被后续瓦片盖掉
    if (lx === w - 1 && ly === h - 1) {
      const pw = S * (w - 1.25), ph = S * 0.46;
      const px0 = px - pw + S * 0.88, py0 = py + S * 0.28;
      ctx.fillStyle = "#1d2c31"; ctx.fillRect(px0, py0, pw, ph);
      ctx.strokeStyle = "#c9a55a"; ctx.lineWidth = 1.5; ctx.strokeRect(px0 + 1, py0 + 1, pw - 2, ph - 2);
      ctx.fillStyle = "#f2e6c4"; ctx.font = "bold " + (S * 0.31) + "px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(t.species, px + S * 0.80, py + S * 0.62);
      ctx.textAlign = "left";
    }
    return;
  }
  // 玻璃内：没有水，只有干掉的盐渍和旧水线
  ctx.fillStyle = "#5b6a64"; ctx.fillRect(px, py, S, S);
  ctx.fillStyle = "rgba(205,230,222,.10)"; ctx.fillRect(px + S * 0.08, py + S * 0.04, S * 0.20, S * 0.92);
  ctx.fillStyle = "rgba(220,215,180,.20)"; ctx.fillRect(px, py + S * 0.70, S, Math.max(1, S * 0.035));
  if (ly === h - 2) {
    ctx.fillStyle = "#a2946e"; ctx.fillRect(px, py + S * 0.62, S, S * 0.38);
    ctx.fillStyle = "rgba(238,228,192,.55)";
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.ellipse(px + S * (0.18 + i * 0.3), py + S * (0.78 + (i % 2) * 0.07), S * 0.15, S * 0.045, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#6e6146"; ctx.fillRect(px + S * 0.12, py + S * 0.88, S * 0.10, S * 0.05);
  }
  if (t.broken) {
    // 缺了一整块玻璃：露出黑洞，边缘留锯齿
    if (lx === w - 2 && ly === 1) {
      ctx.fillStyle = "#0d1518"; ctx.fillRect(px + S * 0.22, py + S * 0.12, S * 0.78, S * 0.76);
      ctx.fillStyle = "#7d9290";
      ctx.beginPath();
      ctx.moveTo(px + S * 0.22, py + S * 0.12);
      ctx.lineTo(px + S * 0.42, py + S * 0.34);
      ctx.lineTo(px + S * 0.30, py + S * 0.58);
      ctx.lineTo(px + S * 0.22, py + S * 0.88);
      ctx.closePath(); ctx.fill();
    }
    ctx.strokeStyle = "rgba(226,242,236,.8)"; ctx.lineWidth = Math.max(1, S * 0.035);
    ctx.beginPath();
    ctx.moveTo(px + S * 0.06, py + S * (0.12 + 0.16 * ((lx + ly) % 3)));
    ctx.lineTo(px + S * 0.44, py + S * 0.48);
    ctx.lineTo(px + S * 0.72, py + S * (0.34 + 0.14 * (lx % 2)));
    ctx.lineTo(px + S * 0.94, py + S * 0.82);
    ctx.stroke();
  }
}

window.__B3_FLOOR["waterpark43"] = function (ctx, px, py, S, map, tx, ty) {
  const q = tx < 63 ? (ty < 63 ? 0 : 2) : (ty < 63 ? 1 : 3);
  const cols = ["#b9c3c6", "#a9b6ba", "#8d8272", "#7f9aa2"];
  ctx.fillStyle = cols[q]; ctx.fillRect(px, py, S, S);
  const r = b3bHash(tx, ty);
  if (q === 0) {  // 公园区的人行道
    ctx.fillStyle = "rgba(226,222,208,.34)"; ctx.fillRect(px, py, S, S);
    ctx.strokeStyle = "rgba(110,120,110,.28)"; ctx.lineWidth = 1; ctx.strokeRect(px + 2, py + 2, S - 4, S - 4);
  } else if (q === 2) {  // 员工大厅的砖石走廊
    ctx.fillStyle = "rgba(60,52,44,.22)"; ctx.fillRect(px, py, S, S);
    ctx.strokeStyle = "rgba(190,160,120,.20)"; ctx.strokeRect(px + 1, py + 1, S - 2, S - 2);
  }
  if (map.w43flood && q === 3) {
    ctx.fillStyle = "rgba(70,140,170,.30)"; ctx.fillRect(px, py, S, S);
  }
  if (r > 0.74) { ctx.fillStyle = "rgba(40,50,52,.18)"; ctx.fillRect(px + S * 0.1, py + S * 0.7, S * 0.5, S * 0.05); }
  // 展缸外沿：干掉的盐渍；破缸旁边有碎玻璃
  const nt = map.w43TankNear && map.w43TankNear.get(tx + "," + ty);
  if (nt) {
    ctx.fillStyle = "rgba(230,220,184,.22)";
    ctx.fillRect(px + S * 0.10, py + S * 0.62, S * 0.52, S * 0.07);
    if (nt.broken) {
      ctx.fillStyle = "rgba(200,230,225,.62)";
      ctx.beginPath();
      ctx.moveTo(px + S * 0.18, py + S * 0.24);
      ctx.lineTo(px + S * 0.34, py + S * 0.08);
      ctx.lineTo(px + S * 0.38, py + S * 0.32);
      ctx.closePath(); ctx.fill();
    }
  }
  return true;
};
window.__B3_WALL["waterpark43"] = function (ctx, px, py, S, map, tx, ty) {
  const t = map.w43TankAt && map.w43TankAt.get(tx + "," + ty);
  if (t) { drawW43TankTile(ctx, px, py, S, t, tx - t.x, ty - t.y); return true; }
  const q = tx < 63 ? (ty < 63 ? 0 : 2) : (ty < 63 ? 1 : 3);
  ctx.fillStyle = q === 2 ? "#5b4b3c" : "#6c8288"; ctx.fillRect(px, py, S, S);
  ctx.fillStyle = "rgba(255,255,255,.16)"; ctx.fillRect(px, py, S, Math.max(2, S * 0.14));
  if (q === 2) {
    ctx.fillStyle = "rgba(30,26,22,.3)";
    for (let i = 0; i < 3; i++) ctx.fillRect(px, py + S * (0.2 + i * 0.26), S, Math.max(1, S * 0.05));
  } else {
    ctx.fillStyle = "rgba(160,205,220,.22)"; ctx.fillRect(px + S * 0.2, py + S * 0.2, S * 0.6, S * 0.5);
  }
  return true;
};

// 铭牌：写着本该养在缸里的水生生物，但缸里什么都没有
function w43Plaque(ctx, x, y, w, h, title, sub) {
  ctx.fillStyle = "#1d2c31"; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "#c9a55a"; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
  ctx.fillStyle = "rgba(255,246,214,.10)"; ctx.fillRect(x + 2, y + 2, w - 4, h * 0.34);
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillStyle = "#f2e6c4"; ctx.font = "bold " + (h * 0.44) + "px sans-serif";
  ctx.fillText(title, x + w / 2, y + h * 0.34);
  ctx.fillStyle = "#b9c9c2"; ctx.font = (h * 0.22) + "px sans-serif";
  ctx.fillText(sub, x + w / 2, y + h * 0.76);
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
}
window.__B2_OVL["43"] = function (ctx, g) {
  const map = g && g.map;
  // 铭牌画在所有瓦片、所有物件之上（世界坐标），不会被后续格子盖住
  if (map && map.w43Tanks) {
    const S = (typeof TILE === "number" ? TILE : 40);
    ctx.save();
    for (const t of map.w43Tanks) {
      const ph = S * 0.92;
      w43Plaque(ctx, t.x * S, t.y * S - ph - 4, t.w * S, ph, t.species,
        t.broken ? "展缸破损 · 已干涸 · 无生物" : "展缸已干涸 · 无生物");
    }
    for (const r of map.w43Rooms) {
      const ph = S * 0.66, pw = S * 4.4;
      const title = r.species ? (r.species + " 展区") : r.service;
      w43Plaque(ctx, r.x * S + 5, r.y * S + 5, pw, ph, title,
        r.species ? "铭牌尚在 · 缸内空无一物" : "非展区 · 无展品");
    }
    ctx.restore();
  }
  const cw = ctx.canvas.width, ch = ctx.canvas.height;
  ctx.save();
  try { ctx.setTransform(1, 0, 0, 1, 0, 0); } catch (e) { /* 忽略 */ }
  // 巨大的雾块
  const t = performance.now() / 1000;
  for (let i = 0; i < 4; i++) {
    const x = ((i * 397 + t * 9) % (cw + 400)) - 200;
    ctx.fillStyle = "rgba(226,234,232,.055)";
    ctx.beginPath(); ctx.ellipse(x, ch * (0.2 + i * 0.2), 180, 90, 0, 0, Math.PI * 2); ctx.fill();
  }
  if (g.w43flood) {
    ctx.fillStyle = "rgba(48,116,150,.26)"; ctx.fillRect(0, 0, cw, ch);
    ctx.strokeStyle = "rgba(190,230,240,.18)"; ctx.lineWidth = 2;
    for (let i = 0; i < 12; i++) {
      const y = ((i * 71 + t * 34) % ch);
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cw, y + 12); ctx.stroke();
    }
  }
  ctx.restore();
};

window.__LEVEL_TICK["43"] = function (g, dt) {
  dt = dt || 0.016;
  window.__B2_enter(g, "43", () => { g.w43flood = false; g.w43announce = 0; });
  g.w43announce = (g.w43announce || 0) + dt;
  if (g.w43announce > 26) {
    g.w43announce = 0;
    const lines = ["「公园已关闭。请改日再来。」", "「公园将进行数周的维护。」", "「如有任何物品丢失，请联系工作人员找回。」"];
    window.__toast(lines[Math.floor(Math.random() * lines.length)]);
  }
};

// ===================== Level 34 · 下水道系统 =====================
function generateSewer34Map(level) {
  const size = 104, grid = makeGrid(size);
  // 窄隧道网：横竖各若干条三格宽的通道，交叉处扩成连结室
  const lines = [10, 24, 38, 52, 66, 80, 94];
  for (const v of lines) {
    for (let x = 4; x < size - 4; x++) for (let d = -1; d <= 1; d++) grid[v + d][x] = 0;
    for (let y = 4; y < size - 4; y++) for (let d = -1; d <= 1; d++) grid[y][v + d] = 0;
  }
  for (const a of lines) for (const b of lines) {
    for (let y = a - 3; y <= a + 3; y++) for (let x = b - 3; x <= b + 3; x++) grid[y][x] = 0;
  }
  const floors = collectFloors(grid, size);
  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [[]],
    start: { x: 10, y: 10, floor: 0 },
    exit: null, doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props: [], crates: [], ground: [], spawnPts: [{ x: 10, y: 10, floor: 0 }],
    wander: null,
  };
  makeDoorsMap(map);
  const P = (x, y, type, extra) => map.props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  // 连结室：两条隧道交汇，游下水 → Level 7 或 Level 289（即 -2）
  // toLevel 是标注用的默认去向；按 E 时由 iKind 钩子按档案随机分派
  P(52, 52, "s34junction", { iKind: "s34junction", toLevel: 7 });
  P(10, 4, "s34grate", { iKind: "s34grate", toLevel: 9 });
  P(94, 94, "s34grate", { iKind: "s34grate", toLevel: 9 });
  // 笑魇不放静态摆件：这层刷的就是全局那只笑魇实体（黑团 + 咧嘴 + 两眼），
  // 由 constants.js 里 sewer34 的 monster:"smiler" 生成，本层不另做造型。
  // 档案那条「关掉手电、把视线移到下方，直至你认为它消失」挂在真实体上，
  // 见下面的 __LEVEL_TICK["34"]。
  // 这层的杏仁水全部被污染 —— 但它是去 Level 43 的门票
  for (let i = 0; i < 10; i++) {
    const s = floors[Math.floor(Math.random() * floors.length)];
    P(s.x, s.y, "s34water", { iKind: "s34water" });
  }
  for (let i = 0; i < 26; i++) {
    const s = floors[Math.floor(Math.random() * floors.length)];
    P(s.x, s.y, "s34rat");
  }
  return map;
}
window.generateSewer34Map = generateSewer34Map;

window.__B3_FLOOR["sewer34"] = function (ctx, px, py, S, map, tx, ty) {
  const r = b3bHash(tx, ty);
  // 下半部分是石头，积着浅水 —— 暗，但不是黑
  ctx.fillStyle = r < 0.5 ? "#5a6058" : "#535a52"; ctx.fillRect(px, py, S, S);
  ctx.fillStyle = "rgba(90,120,110,.26)"; ctx.fillRect(px, py + S * 0.6, S, S * 0.4);
  ctx.fillStyle = "rgba(190,210,200,.10)"; ctx.fillRect(px + S * 0.2, py + S * 0.74, S * 0.5, S * 0.04);
  return true;
};
window.__B3_WALL["sewer34"] = function (ctx, px, py, S, map, tx, ty) {
  // 上半砖、下半石
  ctx.fillStyle = "#6a4a38"; ctx.fillRect(px, py, S, S * 0.52);
  ctx.fillStyle = "#4b4f48"; ctx.fillRect(px, py + S * 0.52, S, S * 0.48);
  ctx.strokeStyle = "rgba(30,24,18,.5)"; ctx.lineWidth = 1;
  ctx.strokeRect(px + 1, py + 1, S - 2, S * 0.5);
  ctx.fillStyle = "rgba(140,170,160,.14)"; ctx.fillRect(px, py + S * 0.52, S, Math.max(2, S * 0.06));
  return true;
};

window.__B2_OVL["34"] = function (ctx, g) {
  const cw = ctx.canvas.width, ch = ctx.canvas.height;
  ctx.save();
  try { ctx.setTransform(1, 0, 0, 1, 0, 0); } catch (e) { /* 忽略 */ }
  // 没有内部照明：整体压暗，但手电（main.js 自己挖的洞）照得出来
  ctx.fillStyle = "rgba(8,12,14,.30)"; ctx.fillRect(0, 0, cw, ch);
  ctx.restore();
};

window.__LEVEL_TICK["34"] = function (g, dt) {
  dt = dt || 0.016;
  window.__B2_enter(g, "34", () => { g.s34calm = 0; });
  if (!g || !g.entities || !g.player) return;
  // 档案：「若看见笑魇，应立即关闭手电筒、把视线移至下方，直至你认为它已消失
  //        —— 若你认为它消失了，它就会消失。」
  // 这条规矩作用在本层真正的笑魇实体上（全局模型、会追人），不是另画一只摆件。
  // 玩家真的关掉手电并坚持一会儿，附近的笑魇就退散；手电一开，计时重置。
  if (g.flashlight) {
    // 重新开灯：把上一轮压住的攻击性还回去
    for (const e of g.entities) {
      if (e && e.__s34docile !== undefined) { e.docile = e.__s34docile; delete e.__s34docile; }
    }
    g.s34calm = 0;
    return;
  }
  const R2 = (10 * 40) * (10 * 40);   // 10 格；TILE = 40
  const near = g.entities.filter(e => e &&
    (e.kind === "smiler" || (e.cfg && e.cfg.name === "笑魇")) &&
    ((e.x - g.player.x) ** 2 + (e.y - g.player.y) ** 2) < R2);
  if (!near.length) { g.s34calm = 0; return; }
  // 视线移开、灯灭了：它不再扑上来，否则玩家根本撑不到「认为它消失」那一刻。
  // 原值记在实体上，重新开手电时恢复。
  for (const e of near) {
    if (e.__s34docile === undefined) e.__s34docile = e.docile;
    e.docile = true;
  }
  g.s34calm = (g.s34calm || 0) + dt;
  if (g.s34calm < 1.2) return;
  g.s34calm = 0;
  const gone = new Set(near);
  for (let i = g.entities.length - 1; i >= 0; i--) {
    if (gone.has(g.entities[i])) g.entities.splice(i, 1);
  }
  g.s34vanishCount = (g.s34vanishCount || 0) + 1;
  window.__toast("你关掉手电、把视线移到下方 —— 再抬眼时，那排牙齿不见了");
};

// ===================== 交互 =====================
window.__B2_hint([
  "o38back", "o38trader", "o38flicker", "o38pipe", "o38window", "o38dark", "o38stalactite",
  "o38wheat", "o38faceling", "o38screen", "o38engine", "o38floor", "o38stair", "o38spring",
  "o38pizza", "o38rot", "o38tunnel", "o38food", "o38tiles",
  "w43dome", "w43ticket", "w43video", "w43tank", "w43office", "w43speaker",
  "s34junction", "s34grate", "s34water",
], function (n, g) {
  switch (n.kind) {
    case "o38trader": return "B.N.T.G「行商」前哨站 —— 早就废弃了，货架上还剩点东西 · 按 E 翻找";
    case "o38screen": return "Level 12 的图像屏蔽延续到了这里 —— 摄像机拍不出这层 · 按 E 试一下";
    case "o38food": return "Level 36 那种受污染的食物 · 按 E 看一眼（别吃）";
    case "o38dark": return "一小块 Level 6 的完全黑暗 —— 手电能照出一点轮廓 · 按 E 探头";
    case "w43dome": return "巨型圆顶建筑，牌子上写着「水世界」—— 里面是一排排干涸的展缸 · 按 E 绕一圈";
    case "w43ticket": return "旋转门洞旁的检票员 —— 你需要一张门票才能入内 · 按 E 搭话";
    case "w43video": return "一台还能用的电脑，里面存着 New_Video.avi —— 这视频被禁止观看 · 按 E 点开（强烈建议别点）";
    case "w43tank": {
      const sp = (n.p && n.p.species) || "未知物种";
      return "干涸的展缸 · 铭牌写着「" + sp + "」—— 玻璃后面一条鱼也没有 · 按 E 看";
    }
    case "w43office": return "办公室的电脑里存着水产研究与商业交流的数据 · 按 E 翻";
    case "w43speaker": return "扩音器里那个女声，反复说着公园已关闭 · 按 E 听";
    case "s34junction": return "连结室 —— 两条隧道在这里交汇，水没过了脚踝 · 按 E 游下水（离开这里）";
    case "s34grate": return "头顶的下水道栅 · 按 E 爬上去，最常见是 Level 9 或 11";
    case "s34water": return "这层的杏仁水已被污染 · 按 E 收起来（去后室地铁时，它是去 Level 43 的门票）";
    default: {
      const tag = O38_SRC.find(() => false);
      const names = {
        o38flicker: "Level 1 的灯管，闪得没有规律", o38pipe: "Level 2 的管道和上锁的门",
        o38window: "Level 4 的窗口，外面模糊一片", o38stalactite: "让人联想到 Level 8 的钟乳石",
        o38wheat: "表界的地面铺着小麦（Level 10）", o38faceling: "不活跃的无面灵慢慢走过",
        o38engine: "Level 15 的引擎轰鸣，找不到声源", o38floor: "Level 19 的脆弱地板，踩上去会响",
        o38stair: "随机出现的楼梯、门与走廊（Level 26）", o38spring: "洞穴里偶尔冒出的泉水（Level 27）",
        o38pizza: "Level 31 萦绕不散的披萨和苏打水气味", o38rot: "越往深处越明显的腐化（Level 33）",
        o38tunnel: "Level 34 那种狭窄的砖石隧道", o38tiles: "Level 37 的白瓷砖，地上积着水",
      };
      if (n.kind === "o38back") return null;  // 交给通用门
      return (names[n.kind] || "38 个层级叠在一起留下的一块碎片") + " · 按 E 观察";
    }
  }
});

window.__B2_act([
  "o38trader", "o38screen", "o38food", "o38dark", "o38flicker", "o38pipe", "o38window",
  "o38stalactite", "o38wheat", "o38faceling", "o38engine", "o38floor", "o38stair",
  "o38spring", "o38pizza", "o38rot", "o38tunnel", "o38tiles",
  "w43dome", "w43ticket", "w43video", "w43tank", "w43office", "w43speaker",
  "s34junction", "s34grate", "s34water",
], function (n, g) {
  const inv = g.inv || (g.inv = {});
  switch (n.kind) {
    case "o38trader":
      inv.almond = (inv.almond || 0) + 1;
      window.__toast("「行商」早就撤走了 —— 货架底下摸到 1 瓶落满灰的杏仁水");
      return true;
    case "o38screen":
      window.__toast("Level 12 的屏蔽效应还在 —— 录像里只剩扭曲的色块，什么都留不下来");
      return true;
    case "o38food": window.__toast("包装鼓着，颜色也不对 —— 别碰"); return true;
    case "o38dark": window.__toast("一小块彻底的黑，手电照进去只到半米就被吞了"); return true;
    case "w43dome": window.__toast("圆顶里一排排展缸早就干了，铭牌还在，活物一条都没有 —— 检票员一动不动地站在旋转门旁"); return true;
    case "w43ticket": window.__toast("「公园已关闭。请改日再来。」—— 它连眼皮都没抬"); return true;
    case "w43video": {
      // 点开即触发水位上涨：淹没大厅，并把与水互动的人送进最终区域
      g.w43flood = true; if (g.map) g.map.w43flood = true;
      window.__toast("画面里有人尖叫着跑过走廊，身后跟着水流 —— 走廊里的水也开始涨了");
      return true;
    }
    case "w43tank": {
      const sp = (n.p && n.p.species) || "未知物种";
      const bk = !!(n.p && n.p.broken);
      window.__toast("铭牌：「" + sp + "」。缸底只剩干裂的盐渍" + (bk ? "和碎玻璃" : "") + " —— 这里早就没有活物了");
      return true;
    }
    case "w43office": window.__toast("水产研究、商业往来，还有那份同名却大多损坏的视频文件"); return true;
    case "w43speaker": window.__toast("「如有任何物品丢失，请联系工作人员找回。」"); return true;
    case "s34junction": {
      const to = Math.random() < 0.5 ? 7 : 289;
      window.__toast("一头扎进水下，隧道越游越宽 —— 再浮起来已经是另一片水");
      try { window.__goToLevel(to); } catch (e) { /* 忽略 */ }
      return true;
    }
    case "s34grate": {
      const to = Math.random() < 0.5 ? 9 : 11;
      window.__toast("扒开铁栅爬上去，头顶是另一层的地面");
      try { window.__goToLevel(to); } catch (e) { /* 忽略 */ }
      return true;
    }
    case "s34water":
      inv.bad = (inv.bad || 0) + 1;
      window.__toast("收起 1 瓶受污染的杏仁水 —— 后室地铁认这个，不认普通杏仁水");
      return true;
    default:
      window.__toast("这一块来自别的层级 —— 38 层叠在一起，边界从来不固定");
      return true;
  }
});

// ===================== 物件外观 =====================
const B3B = window.PROP_DRAW;
const b3bPlate = (ctx, T, col, label) => {
  ctx.fillStyle = col || "#5a6064"; ctx.fillRect(-T * 0.38, -T * 0.32, T * 0.76, T * 0.64);
  ctx.strokeStyle = "rgba(230,226,205,.5)"; ctx.lineWidth = 2;
  ctx.strokeRect(-T * 0.38, -T * 0.32, T * 0.76, T * 0.64);
  if (label) {
    ctx.fillStyle = "#f0e8d0"; ctx.font = "bold " + (T * 0.15) + "px sans-serif";
    ctx.textAlign = "center"; ctx.fillText(label, 0, T * 0.06); ctx.textAlign = "left";
  }
};
B3B["o38back"] = (ctx, p, T) => b3bPlate(ctx, T, "#3f6a5a", "← 37");
B3B["o38trader"] = (ctx, p, T) => b3bPlate(ctx, T, "#6a5a3a", "B.N.T.G");
const O38DRAW = {
  o38flicker: "#e8e0a0", o38pipe: "#7a8288", o38window: "#a8c4cc", o38dark: "#2e3034",
  o38stalactite: "#8a7f68", o38wheat: "#c8b864", o38faceling: "#d8c8b0",
  o38screen: "#b9bec0", o38engine: "#6a6660", o38floor: "#9a8a70", o38stair: "#a89a52",
  o38spring: "#6aa8b4", o38pizza: "#c8824a", o38rot: "#6a5a6a", o38tunnel: "#5c5850",
  o38food: "#8a7a4a", o38tiles: "#cdd8dc", o38debris: "#7a7468",
};
for (const k in O38DRAW) {
  B3B[k] = (function (col) {
    return function (ctx, p, T) {
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.ellipse(0, 0, T * 0.36, T * 0.26, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.18)";
      ctx.beginPath(); ctx.ellipse(-T * 0.1, -T * 0.08, T * 0.18, T * 0.10, 0, 0, Math.PI * 2); ctx.fill();
    };
  })(O38DRAW[k]);
}
B3B["w43bush"] = function (ctx, p, T) {
  ctx.fillStyle = "#3e6a38";
  for (let i = 0; i < 5; i++) {
    ctx.beginPath(); ctx.arc(-T * 0.28 + i * T * 0.14, T * (0.04 - (i % 2) * 0.14), T * 0.20, 0, Math.PI * 2); ctx.fill();
  }
};
B3B["w43arcade"] = (ctx, p, T) => b3bPlate(ctx, T, "#7a3a6a", "ARCADE");
B3B["w43weeks"] = (ctx, p, T) => b3bPlate(ctx, T, "#4a6a7a", "→ 33");
B3B["w43hatch"] = (ctx, p, T) => b3bPlate(ctx, T, "#4a6a7a", "舱门");
B3B["w43clip"] = (ctx, p, T) => b3bPlate(ctx, T, "#6a4a7a", "切出");
B3B["w43grate9"] = (ctx, p, T) => b3bPlate(ctx, T, "#5a5a5a", "→ 2");
B3B["w43grate4"] = (ctx, p, T) => b3bPlate(ctx, T, "#5a5a5a", "→ 4");
B3B["w43dome"] = function (ctx, p, T) {
  ctx.fillStyle = "#8fb4bc";
  ctx.beginPath(); ctx.ellipse(0, T * 0.12, T * 0.46, T * 0.34, 0, Math.PI, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(220,240,240,.4)";
  ctx.beginPath(); ctx.ellipse(-T * 0.12, -T * 0.04, T * 0.20, T * 0.12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#e8d8a8"; ctx.font = "bold " + (T * 0.15) + "px sans-serif";
  ctx.textAlign = "center"; ctx.fillText("水世界", 0, T * 0.40); ctx.textAlign = "left";
};
B3B["w43ticket"] = function (ctx, p, T) {
  ctx.fillStyle = "#d8c8b0"; ctx.beginPath(); ctx.arc(0, -T * 0.22, T * 0.13, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#4a5a62"; ctx.fillRect(-T * 0.16, -T * 0.08, T * 0.32, T * 0.46);
};
B3B["w43video"] = function (ctx, p, T) {
  ctx.fillStyle = "#3a4046"; ctx.fillRect(-T * 0.40, -T * 0.32, T * 0.80, T * 0.56);
  ctx.fillStyle = "#7fa8b8"; ctx.fillRect(-T * 0.34, -T * 0.26, T * 0.68, T * 0.42);
  ctx.fillStyle = "#d8483c"; ctx.font = "bold " + (T * 0.11) + "px sans-serif";
  ctx.textAlign = "center"; ctx.fillText(".avi", 0, T * 0.02); ctx.textAlign = "left";
  ctx.fillStyle = "#5a6064"; ctx.fillRect(-T * 0.14, T * 0.26, T * 0.28, T * 0.08);
};
B3B["w43tank"] = function (ctx, p, T) {
  // 缸前的一块黄铜铭牌：只写名字，没有活物，也没有水
  ctx.fillStyle = "#2c3b40"; ctx.fillRect(-T * 0.40, -T * 0.24, T * 0.80, T * 0.48);
  ctx.strokeStyle = "#c9a55a"; ctx.lineWidth = 2;
  ctx.strokeRect(-T * 0.40, -T * 0.24, T * 0.80, T * 0.48);
  ctx.fillStyle = "#e8dcc0"; ctx.fillRect(-T * 0.30, -T * 0.13, T * 0.60, T * 0.07);
  ctx.fillStyle = "#8fa9a3"; ctx.fillRect(-T * 0.30, T * 0.02, T * 0.40, T * 0.05);
  ctx.fillStyle = "#c9a55a";
  ctx.beginPath(); ctx.arc(T * 0.28, T * 0.14, T * 0.035, 0, Math.PI * 2); ctx.fill();
};
B3B["w43office"] = (ctx, p, T) => b3bPlate(ctx, T, "#5a5248", "PC");
B3B["w43speaker"] = function (ctx, p, T) {
  ctx.fillStyle = "#8a8e8c";
  ctx.beginPath(); ctx.moveTo(-T * 0.16, -T * 0.24); ctx.lineTo(T * 0.30, -T * 0.36);
  ctx.lineTo(T * 0.30, T * 0.20); ctx.lineTo(-T * 0.16, T * 0.10); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#4a4e50"; ctx.beginPath(); ctx.arc(-T * 0.10, -T * 0.06, T * 0.09, 0, Math.PI * 2); ctx.fill();
};
B3B["w43bench"] = function (ctx, p, T) { ctx.fillStyle = "#7a6a52"; ctx.fillRect(-T * 0.4, -T * 0.08, T * 0.8, T * 0.16); };
B3B["w43lamp"] = function (ctx, p, T) {
  ctx.fillStyle = "#6a7070"; ctx.fillRect(-T * 0.05, -T * 0.1, T * 0.10, T * 0.48);
  ctx.fillStyle = "rgba(255,240,190,.7)"; ctx.beginPath(); ctx.arc(0, -T * 0.18, T * 0.14, 0, Math.PI * 2); ctx.fill();
};
B3B["w43trash"] = function (ctx, p, T) {
  ctx.fillStyle = "#8a8270";
  for (let i = 0; i < 4; i++) ctx.fillRect(-T * 0.3 + i * T * 0.16, -T * 0.1 + (i % 2) * T * 0.1, T * 0.12, T * 0.08);
};
B3B["w43sign"] = (ctx, p, T) => b3bPlate(ctx, T, "#c8b878", "→");
B3B["s34junction"] = function (ctx, p, T) {
  ctx.fillStyle = "#2f4a4c";
  ctx.beginPath(); ctx.ellipse(0, 0, T * 0.46, T * 0.34, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "rgba(170,215,205,.5)"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(0, 0, T * 0.46, T * 0.34, 0, 0, Math.PI * 2); ctx.stroke();
};
B3B["s34grate"] = function (ctx, p, T) {
  ctx.fillStyle = "#6a6e68"; ctx.fillRect(-T * 0.40, -T * 0.30, T * 0.80, T * 0.60);
  ctx.fillStyle = "#2a2e2c";
  for (let i = 0; i < 5; i++) ctx.fillRect(-T * 0.34 + i * T * 0.16, -T * 0.26, T * 0.06, T * 0.52);
};
B3B["s34water"] = function (ctx, p, T) {
  ctx.fillStyle = "#7a8a52"; ctx.fillRect(-T * 0.14, -T * 0.30, T * 0.28, T * 0.58);
  ctx.fillStyle = "#b8c878"; ctx.fillRect(-T * 0.10, -T * 0.26, T * 0.20, T * 0.20);
  ctx.fillStyle = "#4a4a3a"; ctx.fillRect(-T * 0.08, -T * 0.38, T * 0.16, T * 0.08);
};
B3B["s34rat"] = function (ctx, p, T) {
  ctx.fillStyle = "#6a6258";
  ctx.beginPath(); ctx.ellipse(0, 0, T * 0.20, T * 0.11, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#6a6258"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(T * 0.18, 0); ctx.quadraticCurveTo(T * 0.34, -T * 0.14, T * 0.40, 0); ctx.stroke();
};

// ======== 注入到旧层级里的八扇门 / 洞口（不注册外观会被画成通用桌子）========
window.PROP_DRAW = window.PROP_DRAW || {};
const B3E = window.PROP_DRAW;
B3E["hollow37to23"] = function (ctx, p, T) {
  ctx.fillStyle = "#4a7a3c"; ctx.fillRect(-T * 0.44, -T * 0.44, T * 0.88, T * 0.88);
  ctx.fillStyle = "#3a5a2c"; ctx.fillRect(-T * 0.28, -T * 0.44, T * 0.56, T * 0.88);
  ctx.fillStyle = "#1e2c18";
  ctx.beginPath(); ctx.ellipse(0, T * 0.06, T * 0.20, T * 0.34, 0, 0, Math.PI * 2); ctx.fill();
};
B3E["mess37to38"] = function (ctx, p, T) {
  const cols = ["#cdd8dc", "#b6ac86", "#7b8288", "#a89a52"];
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = cols[i];
    ctx.fillRect(-T * 0.42 + (i % 2) * T * 0.44, -T * 0.42 + Math.floor(i / 2) * T * 0.44, T * 0.42, T * 0.42);
  }
  ctx.strokeStyle = "rgba(255,240,190,.8)"; ctx.lineWidth = 2; ctx.strokeRect(-T * 0.42, -T * 0.42, T * 0.86, T * 0.86);
};
B3E["tunnel37to43"] = function (ctx, p, T) {
  ctx.fillStyle = "#2e3a40";
  ctx.beginPath(); ctx.ellipse(0, 0, T * 0.42, T * 0.44, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#16232a";
  ctx.beginPath(); ctx.ellipse(0, T * 0.06, T * 0.28, T * 0.34, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(120,190,210,.35)"; ctx.fillRect(-T * 0.22, T * 0.24, T * 0.44, T * 0.06);
};
B3E["forest39to32"] = function (ctx, p, T) {
  ctx.fillStyle = "#2d333d"; ctx.fillRect(-T * 0.44, -T * 0.44, T * 0.88, T * 0.88);
  ctx.fillStyle = "#d8d6cc";
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.arc(-T * 0.24 + i * T * 0.24, -T * 0.14 + (i % 2) * T * 0.2, T * 0.09, 0, Math.PI * 2); ctx.fill();
  }
};
B3E["metro11to903"] = function (ctx, p, T) {
  ctx.fillStyle = "#4a5a62"; ctx.fillRect(-T * 0.40, -T * 0.44, T * 0.80, T * 0.88);
  ctx.fillStyle = "#a8d0d8"; ctx.fillRect(-T * 0.32, -T * 0.36, T * 0.64, T * 0.30);
  ctx.fillStyle = "#e6f4f4"; ctx.fillRect(-T * 0.32, -T * 0.44, T * 0.64, T * 0.05);
  ctx.fillStyle = "#2a3a44"; ctx.font = "bold " + (T * 0.13) + "px sans-serif";
  ctx.textAlign = "center"; ctx.fillText("M", 0, T * 0.28); ctx.textAlign = "left";
};
B3E["grate11to34"] = function (ctx, p, T) {
  ctx.fillStyle = "#6a6e68"; ctx.fillRect(-T * 0.44, -T * 0.34, T * 0.88, T * 0.68);
  ctx.fillStyle = "#20262a";
  for (let i = 0; i < 6; i++) ctx.fillRect(-T * 0.38 + i * T * 0.14, -T * 0.28, T * 0.06, T * 0.56);
};
B3E["firedoor1to834"] = function (ctx, p, T) {
  ctx.fillStyle = "#8a5a3a"; ctx.fillRect(-T * 0.32, -T * 0.44, T * 0.64, T * 0.88);
  ctx.fillStyle = "#b87848"; ctx.fillRect(-T * 0.26, -T * 0.38, T * 0.52, T * 0.76);
  ctx.fillStyle = "#e8d8a8"; ctx.fillRect(-T * 0.26, -T * 0.38, T * 0.52, T * 0.10);
  ctx.fillStyle = "#d8c890"; ctx.beginPath(); ctx.arc(T * 0.17, T * 0.08, T * 0.05, 0, Math.PI * 2); ctx.fill();
};
