// ===========================================================
// 1.3.3 批次：Level 75「阈限」（沙室） / Level 16「地形转变」（冰河期）
//   75：厚积黄沙的走廊与房间，涂漆剥落的墙、全都停摆的灯具、凭空来的阳光，
//       没完没了的雨声却一滴水也没有；儿童玩具、沙堡、掌印、玩具车轨迹。
//       出口：橙色的镓布丁 -> 16；原路返回 -> 4。
//   16：不断重排的冰河期地形，高反射率冰块、13 小时昼夜、成群却各走各的
//       微光向导。转变之前有球状物围着人当警告，转变时冰川拔地而起。
//       出口：覆盖着沙子的冰层 -> 46，每次转变后换位置、目的地不变。
//
//   所有地面/墙都走 __B3_FLOOR / __B3_WALL，绝不落到管道风兜底；
//   所有物件都在 PROP_DRAW 里注册专属模型，不会被画成默认桌子。
// ===========================================================
"use strict";

(function () {
  const R = (k, v) => {
    if (typeof regTile === "function") regTile(k, v);
    else (window.__NEWTILE_EXTRA = window.__NEWTILE_EXTRA || {})[k] = v;
  };
  R("sand75", ["#d8bd84", "#c2a468", "#9c8250"]);
  R("ice16", ["#cfe4ee", "#a9cfe2", "#7fb0cc"]);
})();

window.__B3_FLOOR = window.__B3_FLOOR || {};
window.__B3_WALL = window.__B3_WALL || {};
window.PROP_DRAW = window.PROP_DRAW || {};
window.__LEVEL_TICK = window.__LEVEL_TICK || {};
window.__B2_OVL = window.__B2_OVL || {};
window.__LEVEL_OVERLAY = window.__LEVEL_OVERLAY || window.__B2_OVL;
const L75_OVL = window.__LEVEL_OVERLAY;

function l75Hash(x, y, salt) {
  let h = ((x | 0) * 374761393 + (y | 0) * 668265263 + ((salt | 0) * 2246822519)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) | 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function l75Rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function l75Pick(floors, pred) {
  const c = pred ? floors.filter(pred) : floors;
  return c.length ? c[Math.floor(Math.random() * c.length)] : floors[0];
}
// 把从出生点走不到的地板重新长成墙 —— 孤岛上的出口会让验证器判「走不到」，
// 玩家实际也永远摸不到，不如直接不生成。
function l75Prune(grid, size, sx, sy) {
  if (!grid[sy] || grid[sy][sx] !== 0) return;
  const vis = new Uint8Array(size * size);
  const q = [sy * size + sx]; vis[q[0]] = 1;
  for (let h = 0; h < q.length; h++) {
    const i = q[h], x = i % size, y = (i / size) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 1 || ny < 1 || nx >= size - 1 || ny >= size - 1) continue;
      const j = ny * size + nx;
      if (vis[j] || grid[ny][nx] !== 0) continue;
      vis[j] = 1; q.push(j);
    }
  }
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    if (grid[y][x] === 0 && !vis[y * size + x]) grid[y][x] = 1;
  }
}

// ===================== Level 75 · 阈限 / 沙室 =====================
function generateSand75Map(level) {
  const size = 104;
  const built = buildRoomLayer(size, { roomW: [6, 13], roomH: [6, 12], density: 1.45, startRoom: 10 });
  const grid = built.grid;
  const start = { x: Math.floor(size / 2), y: Math.floor(size / 2), floor: 0 };
  if (grid[start.y] && grid[start.y][start.x] !== 0) carveRoom(grid, size, start.x - 4, start.y - 4, 9, 9);

  // 几条两格宽的走廊把房间群连成「综合体」，不是一间间互不相干的小屋
  for (const [a, b] of [[18, 22], [52, 55], [82, 86]]) {
    for (let x = 4; x < size - 4; x++) { grid[a][x] = 0; grid[b][x] = 0; }
  }
  for (const [a, b] of [[20, 23], [54, 57], [84, 87]]) {
    for (let y = 4; y < size - 4; y++) { grid[y][a] = 0; grid[y][b] = 0; }
  }
  l75Prune(grid, size, start.x, start.y);
  const floors = collectFloors(grid, size);

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [built.rooms],
    start, exit: null, doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props: [], crates: [], ground: [], spawnPts: [{ x: start.x, y: start.y, floor: 0 }],
    l75prints: new Set(), l75t: 0, wander: null,
  };
  makeDoorsMap(map);
  const P = (x, y, type, extra) => map.props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  const dist = (f) => Math.hypot(f.x - start.x, f.y - start.y);

  // 原路返回：就在进来的那扇门旁边，走两步就能回 Level 4
  const backSpot = l75Pick(floors, (f) => dist(f) > 2 && dist(f) < 6) || floors[0];
  P(backSpot.x, backSpot.y, "s75back", {
    toLevel: 4, tip: "身后那扇门还立在那儿 —— 原路返回，回到进沙室之前的地方",
  });

  // 橙色的镓布丁（镓补丁）：唯一确认的、通往 Level 16 的出口。放得远一点。
  const far = floors.filter((f) => dist(f) > 24);
  const gal = l75Pick(far.length ? far : floors);
  P(gal.x, gal.y, "s75gallium", {
    toLevel: 16, tip: "沙里陷着一块橙色的金属补丁，摸上去是温的",
  });

  // 出口周围留 3 格空地。带 iKind 的物件（玩具、灯具…）在 nearNew 判定里
  // 排在通用 toLevel 兜底之前 —— 只要有一件落在出口旁边，按 E 就会被它抢走，
  // 出口看着在那儿却怎么都推不开。这个坑上一版真的踩过。
  const exits = [backSpot, gal];
  const safe = (f) => !exits.some(e => Math.hypot(f.x - e.x, f.y - e.y) < 3);
  const safeFloors = floors.filter(safe);
  const pickSafe = (pred) => {
    const c = pred ? safeFloors.filter(pred) : safeFloors;
    return c.length ? c[Math.floor(Math.random() * c.length)] : (safeFloors[0] || floors[0]);
  };

  // 停摆的灯具：天花板支撑的许多照明灯具，一盏都不亮
  for (let i = 0; i < 26; i++) {
    const f = pickSafe();
    P(f.x, f.y, "s75lamp", { iKind: "s75lamp" });
  }
  // 天花板突入只揭露无法穿透的虚空石
  for (let i = 0; i < 4; i++) {
    const f = pickSafe((p) => dist(p) > 12);
    P(f.x, f.y, "s75voidstone", { iKind: "s75voidstone" });
  }
  // 嵌在沙堆里的儿童玩具
  const toys = ["s75shovel", "s75bucket", "s75car", "s75doll"];
  for (let i = 0; i < 24; i++) {
    const f = pickSafe();
    P(f.x, f.y, toys[i % toys.length], { iKind: "s75toy", name: ["小号塑料铲", "沙桶", "玩具车", "玩偶"][i % 4] });
  }
  // 零星破败家具
  for (let i = 0; i < 12; i++) {
    const f = pickSafe();
    P(f.x, f.y, "s75furniture", { iKind: "s75furniture" });
  }
  // 年代久远的痕迹：孩子脚丫、掌印、沙堡试作、玩具车轨迹
  for (let i = 0; i < 46; i++) {
    const f = pickSafe();
    P(f.x, f.y, "s75print", { dir: l75Rnd(0, 3) });
  }
  for (let i = 0; i < 14; i++) {
    const f = pickSafe();
    P(f.x, f.y, "s75hand");
  }
  for (let i = 0; i < 9; i++) {
    const f = pickSafe();
    P(f.x, f.y, "s75castle", { iKind: "s75castle" });
  }
  for (let i = 0; i < 18; i++) {
    const f = pickSafe();
    P(f.x, f.y, "s75track", { dir: l75Rnd(0, 1) });
  }
  return map;
}
window.generateSand75Map = generateSand75Map;

// ===================== Level 16 · 地形转变 =====================
function l16Carve(grid, size, seedShift, cx, cy) {
  // 整片冰原，再让冰川成块拔起、巨石散落 —— 每次转变都用不同的形状
  carveRoom(grid, size, 1, 1, size - 2, size - 2);
  const rnd = (x, y, s) => {
    let h = ((x | 0) * 374761393 + (y | 0) * 668265263 + (s * 2246822519)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177) | 0;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  // 冰川：十几条斜着的厚冰墙，宽 2~4 格，长 10~26 格
  for (let i = 0; i < 16; i++) {
    const x0 = 6 + Math.floor(rnd(i, 3, seedShift) * (size - 18));
    const y0 = 6 + Math.floor(rnd(i, 9, seedShift) * (size - 18));
    const len = 10 + Math.floor(rnd(i, 17, seedShift) * 16);
    const w = 2 + Math.floor(rnd(i, 23, seedShift) * 3);
    const vert = rnd(i, 31, seedShift) > 0.5;
    for (let k = 0; k < len; k++) {
      const x = x0 + (vert ? 0 : k), y = y0 + (vert ? k : 0);
      for (let d = 0; d < w; d++) {
        const xx = x + (vert ? d : 0), yy = y + (vert ? 0 : d);
        if (xx > 2 && yy > 2 && xx < size - 3 && yy < size - 3) grid[yy][xx] = 1;
      }
    }
  }
  // 巨石：一小团一小团
  for (let i = 0; i < 26; i++) {
    const x = 5 + Math.floor(rnd(i, 41, seedShift) * (size - 10));
    const y = 5 + Math.floor(rnd(i, 47, seedShift) * (size - 10));
    const r = 1 + Math.floor(rnd(i, 53, seedShift) * 2);
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (dx * dx + dy * dy > r * r + 1) continue;
      const xx = x + dx, yy = y + dy;
      if (xx > 2 && yy > 2 && xx < size - 3 && yy < size - 3) grid[yy][xx] = 1;
    }
  }
  // —— 近景冰川 ——
  // 全图随机那 16 条冰川几乎不会落进出生点 15×10 格的视野：实测一进层
  // 视野内墙 0、向导 0，整屏只剩一片平地反光，看不出「冰川拔地而起」。
  // 这里再于玩家四周的视野边缘立四段冰墙，段与段之间留缺口，不会把人围死。
  const segs = [
    { x: cx - 6, y: cy - 5, dx: 0, dy: 1, len: 10, w: 2 },
    { x: cx + 5, y: cy - 4, dx: 0, dy: 1, len: 9, w: 2 },
    { x: cx - 3, y: cy + 5, dx: 1, dy: 0, len: 8, w: 2 },
    { x: cx + 1, y: cy - 5, dx: 1, dy: 0, len: 6, w: 2 },
  ];
  for (const s of segs) {
    const wob = Math.floor(rnd(s.x, s.y, seedShift) * 2);
    for (let k = 0; k < s.len + wob; k++) {
      for (let d = 0; d < s.w; d++) {
        const xx = s.x + s.dx * k + (s.dx ? 0 : d);
        const yy = s.y + s.dy * k + (s.dy ? 0 : d);
        if (xx > 2 && yy > 2 && xx < size - 3 && yy < size - 3) grid[yy][xx] = 1;
      }
    }
  }
  return rnd;
}

function generateIce16Map(level) {
  const size = 112, grid = makeGrid(size);
  const start = { x: Math.floor(size / 2), y: Math.floor(size / 2), floor: 0 };
  // 先清空整片、再立冰川（含近景），最后只给脚下留一小块空地 ——
  // 顺序反过来会把刚立好的近景冰墙一并抹掉。
  l16Carve(grid, size, 1, start.x, start.y);
  carveRoom(grid, size, start.x - 2, start.y - 2, 5, 5);
  l75Prune(grid, size, start.x, start.y);
  const floors = collectFloors(grid, size);

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [[]],
    start, exit: null, doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props: [], crates: [], ground: [], spawnPts: [{ x: start.x, y: start.y, floor: 0 }],
    l16river: new Set(), l16shift: 1, l16key: 0, wander: null,
  };
  makeDoorsMap(map);
  const P = (x, y, type, extra) => map.props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  const dist = (f) => Math.hypot(f.x - start.x, f.y - start.y);

  // 河道：转变时「河流会突然从巨石中喷涌而出」，先画几段弯曲的水面
  for (let i = 0; i < 5; i++) {
    let x = 8 + Math.floor(Math.random() * (size - 20));
    let y = 8 + Math.floor(Math.random() * (size - 20));
    for (let k = 0; k < 34; k++) {
      if (x > 2 && y > 2 && x < size - 3 && y < size - 3) map.l16river.add(x + "," + y);
      x += Math.random() < 0.5 ? 1 : 0;
      y += Math.random() < 0.5 ? 1 : 0;
    }
  }
  // 出口：覆盖着沙子的冰层，每次转变后位置都不同，但永远去 Level 46
  const far = floors.filter((f) => dist(f) > 26);
  const sand = l75Pick(far.length ? far : floors);
  P(sand.x, sand.y, "s16sandice", {
    toLevel: 46, tip: "一块覆着薄沙的冰层 —— 沙子在这片冰原上格格不入",
  });
  // 微光向导带 iKind，会抢在通用 toLevel 兜底之前被登记为 nearNew ——
  // 出口周围 3 格内不许摆，否则按 E 变成「观察向导」而不是切层。
  const safeFloors = floors.filter((f) => Math.hypot(f.x - sand.x, f.y - sand.y) >= 3);
  const pickSafe = () => l75Pick(safeFloors);

  // 微光向导：数量多得反常，但各飘各的，从不同步。
  // 42 颗全撒在 112×112 上时，15×10 的视野里一颗都落不到（实测最近 17 格），
  // 所以把其中 18 颗锚在出生点周围；l16near 让每次地形转变后仍留在近景。
  const nearFloors = floors.filter((f) => {
    const d = Math.hypot(f.x - start.x, f.y - start.y);
    return d >= 2.5 && d <= 8 && Math.hypot(f.x - sand.x, f.y - sand.y) >= 3;
  });
  const used = new Set();
  const pickNear = () => {
    const pool = nearFloors.length ? nearFloors : safeFloors;
    const fresh = pool.filter((f) => !used.has(f.x + "," + f.y));
    const f = l75Pick(fresh.length ? fresh : pool);
    used.add(f.x + "," + f.y);
    return f;
  };
  for (let i = 0; i < 18; i++) {
    const f = pickNear();
    P(f.x, f.y, "s16guide", { iKind: "s16guide", phase: Math.random() * 6.28, hue: Math.random(), l16near: true });
  }
  for (let i = 0; i < 24; i++) {
    const f = pickSafe();
    P(f.x, f.y, "s16guide", { iKind: "s16guide", phase: Math.random() * 6.28, hue: Math.random() });
  }
  for (let i = 0; i < 6; i++) {
    const f = pickNear();
    P(f.x, f.y, "s16boulder", { l16near: true });
  }
  for (let i = 0; i < 20; i++) {
    const f = pickSafe();
    P(f.x, f.y, "s16boulder");
  }
  for (let i = 0; i < 30; i++) {
    const f = pickSafe();
    P(f.x, f.y, "s16crack", { dir: l75Rnd(0, 3) });
  }
  return map;
}
window.generateIce16Map = generateIce16Map;

// ===================== 地面 / 墙 =====================
window.__B3_FLOOR["sand75"] = function (ctx, px, py, S, map, tx, ty) {
  const r = l75Hash(tx, ty, 1);
  ctx.fillStyle = r < 0.34 ? "#dcc28a" : (r < 0.7 ? "#d5b980" : "#cfb176");
  ctx.fillRect(px, py, S, S);
  // 厚积黄沙被踩出来的细纹
  ctx.strokeStyle = "rgba(150,116,62,.16)";
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(px, py + S * (0.22 + r * 0.2));
  ctx.bezierCurveTo(px + S * 0.3, py + S * (0.12 + r * 0.2),
    px + S * 0.7, py + S * (0.34 + r * 0.2), px + S, py + S * (0.20 + r * 0.2));
  ctx.stroke();
  // 没有人工光源，却有像阳光一样的光束照亮绝大部分房间
  if (r > 0.66) {
    ctx.fillStyle = "rgba(255,248,214,.26)";
    ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(255,252,230,.12)";
    ctx.fillRect(px + S * 0.1, py, S * 0.36, S);
  }
  // 沙上做下的记号会滞留相当长时间 —— 玩家的脚印也留着
  if (map && map.l75prints && map.l75prints.has(tx + "," + ty)) {
    ctx.fillStyle = "rgba(126,94,52,.42)";
    ctx.beginPath(); ctx.ellipse(px + S * 0.34, py + S * 0.38, S * 0.09, S * 0.14, -0.4, 0, 6.283); ctx.fill();
    ctx.beginPath(); ctx.ellipse(px + S * 0.63, py + S * 0.62, S * 0.09, S * 0.14, -0.4, 0, 6.283); ctx.fill();
  }
  return true;
};
window.__B3_WALL["sand75"] = function (ctx, px, py, S, map, tx, ty) {
  const r = l75Hash(tx + 7, ty + 3, 5);
  // 蓝 / 淡黄 / 红三色油漆，都已开裂或正在剥落
  ctx.fillStyle = r < 0.34 ? "#6c86a2" : (r < 0.68 ? "#cdb87c" : "#a86152");
  ctx.fillRect(px, py, S, S);
  // 剥落处露出灰浆或锈蚀钢板
  const q = l75Hash(tx + 13, ty + 19, 9);
  ctx.fillStyle = q < 0.5 ? "#a8a49a" : "#8a6042";
  ctx.beginPath();
  ctx.moveTo(px + S * (0.1 + q * 0.2), py + S * 0.12);
  ctx.lineTo(px + S * (0.7 + q * 0.2), py + S * 0.04);
  ctx.lineTo(px + S * 0.92, py + S * 0.52);
  ctx.lineTo(px + S * 0.46, py + S * 0.44);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.10)"; ctx.fillRect(px, py, S, S * 0.09);
  ctx.fillStyle = "rgba(60,44,26,.26)"; ctx.fillRect(px, py + S * 0.88, S, S * 0.12);
  return true;
};

window.__B3_FLOOR["ice16"] = function (ctx, px, py, S, map, tx, ty) {
  const g = window.__game;
  const ref = g && String(g.level) === "16" ? (g.l16reflect || 1) : 1;
  const r = l75Hash(tx, ty, 2);
  const river = map && map.l16river && map.l16river.has(tx + "," + ty);
  if (river) {
    // 突然从巨石里喷涌出来的河
    ctx.fillStyle = "#5e9ab8"; ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(220,244,255,.30)";
    ctx.fillRect(px, py + S * 0.3, S, S * 0.07);
    ctx.fillRect(px, py + S * 0.68, S, S * 0.05);
  } else {
    ctx.fillStyle = r < 0.5 ? "#d2e7f0" : "#c3dce9";
    ctx.fillRect(px, py, S, S);
    // 较高反射率的反光表面：斜着的一道镜面白
    ctx.fillStyle = "rgba(255,255,255," + (0.20 + 0.24 * ref).toFixed(2) + ")";
    ctx.beginPath();
    ctx.moveTo(px + S * (0.1 + r * 0.3), py);
    ctx.lineTo(px + S * (0.32 + r * 0.3), py);
    ctx.lineTo(px + S * (0.12 + r * 0.3), py + S);
    ctx.lineTo(px - S * 0.1 + S * (0.1 + r * 0.3), py + S);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "rgba(90,140,170,.22)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(px, py + S * (0.2 + r * 0.5));
    ctx.lineTo(px + S, py + S * (0.35 + r * 0.5)); ctx.stroke();
  }
  return true;
};
window.__B3_WALL["ice16"] = function (ctx, px, py, S, map, tx, ty) {
  const r = l75Hash(tx + 3, ty + 11, 6);
  // 拔地而起、高耸入云的冰川，不是黑块
  ctx.fillStyle = "#9fc4dc"; ctx.fillRect(px, py, S, S);
  ctx.fillStyle = r < 0.5 ? "#e0f2fb" : "#c8e4f2";
  ctx.fillRect(px + S * (0.08 + r * 0.2), py, S * 0.22, S);
  ctx.fillStyle = "rgba(70,120,155,.30)";
  ctx.fillRect(px + S * 0.78, py, S * 0.22, S);
  ctx.fillStyle = "rgba(255,255,255,.55)";
  ctx.beginPath();
  ctx.moveTo(px, py + S * 0.16); ctx.lineTo(px + S, py + S * 0.02);
  ctx.lineTo(px + S, py + S * 0.12); ctx.lineTo(px, py + S * 0.26);
  ctx.closePath(); ctx.fill();
  return true;
};

// ===================== 整屏叠加 =====================
L75_OVL["75"] = function (ctx, g) {
  const cw = ctx.canvas.width, ch = ctx.canvas.height;
  ctx.save();
  try { ctx.setTransform(1, 0, 0, 1, 0, 0); } catch (e) { /* 忽略 */ }
  // 天花板与墙面随机地点散发出的光束，像阳光一样 —— 灯具其实一盏都没亮
  const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
  for (let i = 0; i < 4; i++) {
    const x = cw * (0.16 + i * 0.23) + Math.sin(t * 0.13 + i) * 18;
    const gr = ctx.createLinearGradient(x, 0, x + cw * 0.14, ch);
    gr.addColorStop(0, "rgba(255,247,212,.16)");
    gr.addColorStop(1, "rgba(255,247,212,0)");
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.moveTo(x - 30, 0); ctx.lineTo(x + 90, 0);
    ctx.lineTo(x + cw * 0.22 + 40, ch); ctx.lineTo(x + cw * 0.22 - 110, ch);
    ctx.closePath(); ctx.fill();
  }
  // 状态条压在顶部按钮栏（手电/档案/静音/暂停）正下方，别和按钮叠成一团
  ctx.fillStyle = "rgba(74,58,34,.62)"; ctx.fillRect(cw - 214, 56, 202, 30);
  ctx.fillStyle = "#f4e3b6"; ctx.font = "bold 13px sans-serif"; ctx.textAlign = "left";
  ctx.fillText("Level 75 · 阈限 · 15℃ · 干燥", cw - 204, 76);
  ctx.restore();
};

L75_OVL["16"] = function (ctx, g) {
  const cw = ctx.canvas.width, ch = ctx.canvas.height;
  ctx.save();
  try { ctx.setTransform(1, 0, 0, 1, 0, 0); } catch (e) { /* 忽略 */ }
  const night = !!g.l16night;
  ctx.fillStyle = night ? "rgba(28,52,96,.30)" : "rgba(226,242,252,.07)";
  ctx.fillRect(0, 0, cw, ch);

  // 转变之前：小型球状物围绕在身边，像是警告
  if (g.l16warn > 0) {
    const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
    const a = Math.min(0.9, g.l16warn / 4);
    ctx.fillStyle = "rgba(226,244,255," + (0.22 * a).toFixed(3) + ")";
    ctx.fillRect(0, 0, cw, ch);
    for (let i = 0; i < 12; i++) {
      const ang = t * 1.1 + i * (6.283 / 12);
      const rr = 74 + Math.sin(t * 2 + i) * 12;
      const x = cw / 2 + Math.cos(ang) * rr, y = ch / 2 + Math.sin(ang) * rr * 0.7;
      ctx.fillStyle = "rgba(180,226,255," + (0.55 * a).toFixed(3) + ")";
      ctx.beginPath(); ctx.arc(x, y, 4.5, 0, 6.283); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255," + (0.35 * a).toFixed(3) + ")";
      ctx.beginPath(); ctx.arc(x - 1.2, y - 1.2, 1.6, 0, 6.283); ctx.fill();
    }
  }
  if (g.l16flash > 0) {
    ctx.fillStyle = "rgba(240,250,255," + Math.min(0.55, g.l16flash * 0.3).toFixed(3) + ")";
    ctx.fillRect(0, 0, cw, ch);
  }
  const temp = (6 + (night ? 0 : 4) * (0.6 + 0.4 * Math.sin((g.l16dayT || 0) * 0.2))).toFixed(1);
  ctx.fillStyle = "rgba(18,40,62,.68)"; ctx.fillRect(cw - 258, 56, 246, 30);
  ctx.fillStyle = "#dceef8"; ctx.font = "bold 12px sans-serif"; ctx.textAlign = "left";
  ctx.fillText("冰河期 · " + (night ? "夜" : "昼") + " · " + temp + "℃ · 密钥 " + (g.l16key | 0)
    + " · 第 " + (g.l16shift | 0) + " 次地形", cw - 248, 76);
  ctx.restore();
};

// ===================== 每帧 =====================
window.__LEVEL_TICK["75"] = function (g, dt) {
  dt = dt || 0.016;
  window.__B2_enter(g, "75", () => { g.l75t = 0; g.l75rainT = 0; });
  g.l75t = (g.l75t || 0) + dt;
  // 沙砾上的记号会滞留相当长时间 —— 玩家的脚印也留下来
  if (g.map && g.map.l75prints) {
    const tx = Math.floor(g.player.x / 40), ty = Math.floor(g.player.y / 40);
    if (!g.l75footT || g.l75t - g.l75footT > 0.28) {
      g.l75footT = g.l75t;
      g.map.l75prints.add(tx + "," + ty);
    }
  }
  // 没有水源，却听得见没完没了的雨声 —— 来源不明，推测是虚幻之声
  if (!g.l75rainT) g.l75rainT = 12;
  if (g.l75t > g.l75rainT) {
    g.l75rainT += 34;
    window.__toast("头顶又传来那阵舒缓的雨声 —— 可这里一滴水也没有，天花板后面只有无法穿透的虚空石");
  }
  if (!g.l75dry) {
    g.l75dry = true;
    window.__toast("空气干燥，恒定凉爽的 15℃ —— 待久了嘴唇和眼睛会发干");
  }
};

function l16Shift(g) {
  const m = g.map, grid = m.layers[0], size = m.size;
  const tx = Math.floor(g.player.x / 40), ty = Math.floor(g.player.y / 40);
  g.l16shift = (g.l16shift || 1) + 1;
  g.l16key = (g.l16key || 0) + 1;
  // 近景冰川以「玩家当下位置」为基准重立，否则重排之后又变回一片空地
  l16Carve(grid, size, g.l16shift, tx, ty);

  // 别让人正好站在拔起来的冰川里
  carveRoom(grid, size, Math.max(1, tx - 3), Math.max(1, ty - 3), 7, 7);
  l75Prune(grid, size, Math.max(1, Math.min(size - 2, tx)), Math.max(1, Math.min(size - 2, ty)));
  m.floors[0] = collectFloors(grid, size);
  const floors = m.floors[0];

  // 若刚才那一瞬间被地形吞进去：掉血 + 被推到最近的地板
  if (grid[ty] && grid[ty][tx] === 1) {
    g.health = Math.max(0, (g.health || 0) - 12);
    let best = null, bd = Infinity;
    for (const f of floors) {
      const d = Math.hypot(f.x - tx, f.y - ty);
      if (d < bd) { bd = d; best = f; }
    }
    if (best) { g.player.x = (best.x + 0.5) * 40; g.player.y = (best.y + 0.5) * 40; }
    window.__toast("脚下的冰突然立了起来 —— 你陷进了正在变化的地形（生命 -12）");
  } else {
    window.__toast("冰川从地面拔起，河流从巨石里喷涌而出，四周开始结冰 —— 层级密钥也随之变了（第 "
      + g.l16shift + " 次）");
  }

  // 河道重新喷涌一次
  m.l16river = new Set();
  for (let i = 0; i < 5; i++) {
    let x = 8 + Math.floor(Math.random() * (size - 20));
    let y = 8 + Math.floor(Math.random() * (size - 20));
    for (let k = 0; k < 34; k++) {
      if (x > 2 && y > 2 && x < size - 3 && y < size - 3) m.l16river.add(x + "," + y);
      x += Math.random() < 0.5 ? 1 : 0;
      y += Math.random() < 0.5 ? 1 : 0;
    }
  }
  // 每次转变后出口位置都不同，但目的地不变。先摆出口，其余物件再避开它。
  const sandIce = (m.props || []).find((p) => p.type === "s16sandice");
  if (sandIce) {
    const far = floors.filter((f) => Math.hypot(f.x - tx, f.y - ty) > 22);
    const f = l75Pick(far.length ? far : floors);
    if (f) { sandIce.x = f.x; sandIce.y = f.y; }
  }
  const safe = sandIce ? floors.filter((f) => Math.hypot(f.x - sandIce.x, f.y - sandIce.y) >= 3) : floors;
  const near = floors.filter((f) => {
    const d = Math.hypot(f.x - tx, f.y - ty);
    return d >= 2.5 && d <= 8;
  }).filter((f) => !sandIce || Math.hypot(f.x - sandIce.x, f.y - sandIce.y) >= 3);
  for (const p of (m.props || [])) {
    if (p === sandIce) continue;
    const f = l75Pick(p.l16near && near.length ? near : safe);
    if (f) { p.x = f.x; p.y = f.y; }
  }
  // 属性随每次环境变化而改变：反光率、温度、昼夜都换一换
  g.l16reflect = 0.7 + Math.random() * 0.9;
  g.l16night = Math.random() < 0.4;
  g.l16flash = 1;
  window.__toast("覆着沙子的那块冰层换了个地方 —— 但它仍旧通往 Level 46");
}

window.__LEVEL_TICK["16"] = function (g, dt) {
  dt = dt || 0.016;
  window.__B2_enter(g, "16", () => {
    g.l16t = 0; g.l16dayT = 0; g.l16night = false; g.l16warn = 0;
    g.l16flash = 0; g.l16next = 52 + Math.random() * 22;
    g.l16shift = 1; g.l16key = 0; g.l16reflect = 1;
  });
  g.l16t = (g.l16t || 0) + dt;
  g.l16dayT = (g.l16dayT || 0) + dt;
  // 约 13 小时一轮的昼夜（游戏内压缩到 100 秒）
  g.l16night = (g.l16dayT % 100) >= 50;
  if (g.l16flash > 0) g.l16flash = Math.max(0, g.l16flash - dt * 1.6);

  const left = (g.l16next || 60) - g.l16t;
  if (left <= 4 && left > 0) {
    g.l16warn = left;
    if (!g.l16warned) {
      g.l16warned = true;
      window.__toast("小型球状物开始围着你转 —— 这是警告：环境马上就要改变了，别待在这里");
    }
  } else g.l16warn = 0;
  if (left <= 0) {
    g.l16warned = false;
    g.l16warn = 0;
    g.l16t = 0;
    g.l16next = 52 + Math.random() * 22;
    l16Shift(g);
  }
};

// ===================== 提示 / 交互 =====================
window.__B2_hint(["s75lamp", "s75voidstone", "s75toy", "s75furniture", "s75castle", "s16guide"], function (n, g) {
  switch (n.kind) {
    case "s75lamp": return "天花板上支撑着一盏照明灯具 —— 早就停摆了，一点光都不发 · 按 E 抬头看";
    case "s75voidstone": return "天花板被突入过一次，上面只露出一层无法穿透的虚空石 · 按 E 敲一下";
    case "s75toy": return "沙堆里嵌着一件" + (n.p.name || "儿童玩具") + " —— 不知道是哪年留下的 · 按 E 捡起来看看";
    case "s75furniture": return "一件破败家具，半埋在沙里 · 按 E 翻一翻";
    case "s75castle": return "有人试着堆过一座沙堡，塌了一半 · 按 E 端详";
    case "s16guide": return "一颗微光向导 —— 极罕见的实体，这里却有一大群，而且各飘各的 · 按 E 观察";
  }
  return null;
});
window.__B2_act(["s75lamp", "s75voidstone", "s75toy", "s75furniture", "s75castle", "s16guide"], function (n, g) {
  switch (n.kind) {
    case "s75lamp": window.__toast("灯具全都停摆了 —— 可房间里还是亮的，光是从天花板和墙面的随机地点散出来的"); return true;
    case "s75voidstone": window.__toast("敲上去闷闷的，一点回声都没有 —— 那层石头没法穿透，雨声也不像是从后面来的"); return true;
    case "s75toy": window.__toast("你把" + (n.p.name || "玩具") + "从沙里拔出来 —— 沙上留下的记号过了这么多年还在"); return true;
    case "s75furniture": window.__toast("木头早被沙磨圆了。这里既没有风，也没有水，翻过的痕迹会留很久很久"); return true;
    case "s75castle": window.__toast("小小的掌印还压在堡墙上 —— 有人在这儿玩过，而且不是最近"); return true;
    case "s16guide": window.__toast("它完全不理你，只顾自己慢慢飘 —— 这些实体从未被观察到集体行动，偏偏这里有这么多"); return true;
  }
  return false;
});

// ===================== 物件外观 =====================
const D = window.PROP_DRAW;

// —— Level 4 里那扇门前有沙子的门（入口）——
D["sanddoor4to75"] = function (ctx, p, T) {
  ctx.fillStyle = "#6b5540"; ctx.fillRect(-T * 0.31, -T * 0.44, T * 0.62, T * 0.88);
  ctx.fillStyle = "#9a8765"; ctx.fillRect(-T * 0.25, -T * 0.38, T * 0.50, T * 0.76);
  ctx.fillStyle = "#d8bd84";
  ctx.beginPath();
  ctx.moveTo(-T * 0.44, T * 0.44); ctx.quadraticCurveTo(0, T * 0.22, T * 0.44, T * 0.44);
  ctx.lineTo(T * 0.44, T * 0.5); ctx.lineTo(-T * 0.44, T * 0.5); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#e8cf9c";
  for (let i = 0; i < 7; i++) ctx.fillRect(-T * 0.38 + i * T * 0.11, T * 0.33 + (i % 2) * T * 0.04, T * 0.035, T * 0.035);
  ctx.fillStyle = "#c9a24a"; ctx.beginPath(); ctx.arc(T * 0.17, T * 0.04, T * 0.035, 0, 6.283); ctx.fill();
};

// —— 沙室的出口与装饰 ——
D["s75gallium"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 600;
  ctx.fillStyle = "rgba(255,158,62," + (0.16 + 0.10 * Math.sin(t)).toFixed(3) + ")";
  ctx.beginPath(); ctx.arc(0, 0, T * 0.46, 0, 6.283); ctx.fill();
  ctx.fillStyle = "#e88a38";
  ctx.beginPath(); ctx.ellipse(0, T * 0.06, T * 0.32, T * 0.24, 0, 0, 6.283); ctx.fill();
  ctx.fillStyle = "#ffc070";
  ctx.beginPath(); ctx.ellipse(-T * 0.06, -T * 0.02, T * 0.20, T * 0.12, -0.3, 0, 6.283); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.6)";
  ctx.beginPath(); ctx.arc(-T * 0.13, -T * 0.06, T * 0.045, 0, 6.283); ctx.fill();
};
D["s75back"] = function (ctx, p, T) {
  ctx.fillStyle = "#5a4a38"; ctx.fillRect(-T * 0.30, -T * 0.44, T * 0.60, T * 0.88);
  ctx.fillStyle = "#a8926c"; ctx.fillRect(-T * 0.24, -T * 0.38, T * 0.48, T * 0.76);
  ctx.strokeStyle = "rgba(60,44,26,.55)"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0, -T * 0.38); ctx.lineTo(0, T * 0.38); ctx.stroke();
  ctx.fillStyle = "#d8bd84"; ctx.fillRect(-T * 0.36, T * 0.40, T * 0.72, T * 0.06);
  ctx.fillStyle = "#e8d2a0"; ctx.font = "bold " + (T * 0.14) + "px sans-serif";
  ctx.textAlign = "center"; ctx.fillText("返回", 0, -T * 0.12); ctx.textAlign = "left";
};
D["s75lamp"] = function (ctx, p, T) {
  ctx.fillStyle = "#6e6a60"; ctx.fillRect(-T * 0.36, -T * 0.10, T * 0.72, T * 0.20);
  ctx.fillStyle = "#44423e"; ctx.fillRect(-T * 0.30, -T * 0.07, T * 0.60, T * 0.14);
  ctx.fillStyle = "rgba(210,210,200,.22)"; ctx.fillRect(-T * 0.30, -T * 0.07, T * 0.60, T * 0.04);
  ctx.fillStyle = "#8c887c"; ctx.fillRect(-T * 0.05, -T * 0.26, T * 0.10, T * 0.16);
};
D["s75voidstone"] = function (ctx, p, T) {
  ctx.fillStyle = "#4a4a52"; ctx.fillRect(-T * 0.40, -T * 0.34, T * 0.80, T * 0.68);
  ctx.fillStyle = "#23242c";
  ctx.beginPath(); ctx.ellipse(0, 0, T * 0.30, T * 0.22, 0, 0, 6.283); ctx.fill();
  ctx.strokeStyle = "rgba(160,160,180,.5)"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-T * 0.34, -T * 0.28); ctx.lineTo(T * 0.34, T * 0.28); ctx.stroke();
};
D["s75shovel"] = function (ctx, p, T) {
  ctx.strokeStyle = "#d8c078"; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-T * 0.16, T * 0.24); ctx.lineTo(T * 0.10, -T * 0.16); ctx.stroke();
  ctx.fillStyle = "#e4574c";
  ctx.beginPath(); ctx.ellipse(-T * 0.22, T * 0.30, T * 0.13, T * 0.16, -0.6, 0, 6.283); ctx.fill();
};
D["s75bucket"] = function (ctx, p, T) {
  ctx.fillStyle = "#4a86b8";
  ctx.beginPath(); ctx.moveTo(-T * 0.22, -T * 0.16); ctx.lineTo(T * 0.22, -T * 0.16);
  ctx.lineTo(T * 0.16, T * 0.30); ctx.lineTo(-T * 0.16, T * 0.30); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "#c8dce8"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, -T * 0.16, T * 0.20, Math.PI, 0); ctx.stroke();
};
D["s75car"] = function (ctx, p, T) {
  ctx.fillStyle = "#c8483c"; ctx.fillRect(-T * 0.28, -T * 0.04, T * 0.56, T * 0.20);
  ctx.fillStyle = "#e2c060"; ctx.fillRect(-T * 0.14, -T * 0.18, T * 0.28, T * 0.15);
  ctx.fillStyle = "#2a2a2e";
  for (const x of [-0.18, 0.18]) { ctx.beginPath(); ctx.arc(T * x, T * 0.19, T * 0.075, 0, 6.283); ctx.fill(); }
};
D["s75doll"] = function (ctx, p, T) {
  ctx.fillStyle = "#e8c8a8";
  ctx.beginPath(); ctx.arc(0, -T * 0.22, T * 0.13, 0, 6.283); ctx.fill();
  ctx.fillStyle = "#8a5a9a"; ctx.fillRect(-T * 0.14, -T * 0.09, T * 0.28, T * 0.32);
  ctx.fillStyle = "#3a2a2a";
  ctx.beginPath(); ctx.arc(-T * 0.05, -T * 0.24, T * 0.022, 0, 6.283); ctx.fill();
  ctx.beginPath(); ctx.arc(T * 0.05, -T * 0.24, T * 0.022, 0, 6.283); ctx.fill();
};
D["s75furniture"] = function (ctx, p, T) {
  ctx.fillStyle = "#7a6248"; ctx.fillRect(-T * 0.34, -T * 0.06, T * 0.68, T * 0.26);
  ctx.fillStyle = "#5e4a36"; ctx.fillRect(-T * 0.30, T * 0.18, T * 0.08, T * 0.20);
  ctx.fillRect(T * 0.22, T * 0.18, T * 0.08, T * 0.20);
  ctx.fillStyle = "rgba(216,189,132,.5)"; ctx.fillRect(-T * 0.30, -T * 0.10, T * 0.60, T * 0.06);
};
D["s75print"] = function (ctx, p, T) {
  ctx.save(); ctx.rotate((p.dir | 0) * Math.PI / 2);
  ctx.fillStyle = "rgba(140,104,58,.44)";
  ctx.beginPath(); ctx.ellipse(-T * 0.12, -T * 0.10, T * 0.075, T * 0.12, 0, 0, 6.283); ctx.fill();
  ctx.beginPath(); ctx.ellipse(T * 0.12, T * 0.10, T * 0.075, T * 0.12, 0, 0, 6.283); ctx.fill();
  ctx.restore();
};
D["s75hand"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(140,104,58,.40)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.06, T * 0.14, T * 0.11, 0, 0, 6.283); ctx.fill();
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.ellipse(-T * 0.16 + i * T * 0.08, -T * 0.14 - (i % 2) * T * 0.05, T * 0.035, T * 0.09, 0, 0, 6.283);
    ctx.fill();
  }
};
D["s75castle"] = function (ctx, p, T) {
  ctx.fillStyle = "#c5a465"; ctx.fillRect(-T * 0.30, T * 0.02, T * 0.60, T * 0.28);
  ctx.fillRect(-T * 0.34, -T * 0.16, T * 0.18, T * 0.22);
  ctx.fillRect(T * 0.16, -T * 0.20, T * 0.18, T * 0.26);
  ctx.fillStyle = "#a8874e"; ctx.fillRect(-T * 0.06, T * 0.12, T * 0.12, T * 0.18);
  ctx.fillStyle = "rgba(230,205,150,.55)"; ctx.fillRect(-T * 0.30, -T * 0.02, T * 0.60, T * 0.05);
};
D["s75track"] = function (ctx, p, T) {
  ctx.save(); if (p.dir) ctx.rotate(Math.PI / 2);
  ctx.strokeStyle = "rgba(140,104,58,.38)"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-T * 0.42, -T * 0.14); ctx.lineTo(T * 0.42, -T * 0.14); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-T * 0.42, T * 0.14); ctx.lineTo(T * 0.42, T * 0.14); ctx.stroke();
  ctx.setLineDash([3, 5]);
  ctx.beginPath(); ctx.moveTo(-T * 0.42, 0); ctx.lineTo(T * 0.42, 0); ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
};

// —— 冰河期的出口与实体 ——
D["s16sandice"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 700;
  ctx.fillStyle = "rgba(230,206,150," + (0.14 + 0.08 * Math.sin(t)).toFixed(3) + ")";
  ctx.beginPath(); ctx.arc(0, 0, T * 0.48, 0, 6.283); ctx.fill();
  ctx.fillStyle = "#bfe0ee"; ctx.fillRect(-T * 0.38, -T * 0.32, T * 0.76, T * 0.64);
  ctx.fillStyle = "rgba(255,255,255,.55)";
  ctx.beginPath(); ctx.moveTo(-T * 0.30, -T * 0.32); ctx.lineTo(-T * 0.06, -T * 0.32);
  ctx.lineTo(-T * 0.26, T * 0.32); ctx.lineTo(-T * 0.38, T * 0.32); ctx.closePath(); ctx.fill();
  // 覆在冰上的那层薄沙
  ctx.fillStyle = "#d9bd82";
  ctx.beginPath(); ctx.moveTo(-T * 0.38, T * 0.10);
  ctx.quadraticCurveTo(0, -T * 0.06, T * 0.38, T * 0.12);
  ctx.lineTo(T * 0.38, T * 0.32); ctx.lineTo(-T * 0.38, T * 0.32); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#f0dca8";
  for (let i = 0; i < 8; i++) ctx.fillRect(-T * 0.34 + i * T * 0.09, T * 0.16 + (i % 3) * T * 0.04, T * 0.03, T * 0.03);
};
D["s16guide"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
  const ph = p.phase || 0;
  const ox = Math.sin(t * 0.8 + ph) * T * 0.16;
  const oy = Math.cos(t * 0.63 + ph * 1.7) * T * 0.16;
  const r = T * (0.10 + 0.03 * Math.sin(t * 2 + ph));
  const col = (p.hue || 0) < 0.5 ? "190,226,255" : "206,255,220";
  const gr = ctx.createRadialGradient(ox, oy, 0, ox, oy, r * 3);
  gr.addColorStop(0, "rgba(" + col + ",.85)");
  gr.addColorStop(1, "rgba(" + col + ",0)");
  ctx.fillStyle = gr;
  ctx.beginPath(); ctx.arc(ox, oy, r * 3, 0, 6.283); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.92)";
  ctx.beginPath(); ctx.arc(ox, oy, r * 0.55, 0, 6.283); ctx.fill();
};
D["s16boulder"] = function (ctx, p, T) {
  ctx.fillStyle = "#7c9aa8";
  ctx.beginPath(); ctx.moveTo(-T * 0.34, T * 0.28); ctx.lineTo(-T * 0.22, -T * 0.24);
  ctx.lineTo(T * 0.12, -T * 0.32); ctx.lineTo(T * 0.34, T * 0.06);
  ctx.lineTo(T * 0.22, T * 0.30); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "rgba(232,246,255,.45)";
  ctx.beginPath(); ctx.moveTo(-T * 0.22, -T * 0.24); ctx.lineTo(T * 0.12, -T * 0.32);
  ctx.lineTo(T * 0.02, -T * 0.10); ctx.closePath(); ctx.fill();
};
D["s16crack"] = function (ctx, p, T) {
  ctx.save(); ctx.rotate((p.dir | 0) * Math.PI / 2);
  ctx.strokeStyle = "rgba(70,120,155,.55)"; ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-T * 0.38, -T * 0.16); ctx.lineTo(-T * 0.10, T * 0.02);
  ctx.lineTo(T * 0.10, -T * 0.10); ctx.lineTo(T * 0.38, T * 0.14);
  ctx.stroke();
  ctx.restore();
};
