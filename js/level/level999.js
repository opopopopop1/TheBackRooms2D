// ===========================================================
// Level 999 —— 终焉之岛
// 一座悬浮在星空虚空之上的热带岛屿，整体笼罩在褪色的阴翳中（灰度）。
// 温度 13~16°C。岛屿完全平坦 —— 没有山峰，也没有山谷。
// 由外向内：沙滩（细沙 -> 悬浮的石子）-> 光秃的泥土 -> 茂密的灰色树林
//           -> 中心散布着长眠的砼块 / 玻璃 / 木料 / 石材（颓败的家居）。
// 一切永恒不变：树木不会动，沙不会动，连你也不会变。
// 出口：忏悔你的全部罪状之后，你会晕倒，来到 Level 1000。
// ===========================================================
"use strict";

function generateLastIslandMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const props = [];
  const sand = new Set();

  // 整座岛：一个巨大的圆形（岛外是虚空，走不出去）
  const cx = size / 2, cy = size / 2, R = size * 0.44;
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      const d = Math.hypot(x - cx, y - cy);
      const wob = 0.035 * size * Math.sin(Math.atan2(y - cy, x - cx) * 5);   // 不规则的岸线
      if (d + wob < R) grid[y][x] = 0;
    }
  }
  // 沙滩环：最外一圈
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      if (grid[y][x] !== 0) continue;
      const d = Math.hypot(x - cx, y - cy);
      if (d > R * 0.80) sand.add(x + "," + y);
    }
  }
  const floors = collectFloors(grid, size);
  const start = { x: Math.round(cx + R * 0.88), y: Math.round(cy), floor: 0 };
  if (grid[start.y] && grid[start.y][start.x] === 1) grid[start.y][start.x] = 0;

  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return;
    if (grid[y][x] !== 0) return;
    props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  };
  // 沙滩上的灰色棕榈树
  for (const k of sand) {
    if (Math.random() > 0.05) continue;
    const [x, y] = k.split(",").map(Number);
    put(x, y, "palm999");
  }
  // 中间的树林（越靠中心越密）
  for (const f of floors) {
    const d = Math.hypot(f.x - cx, f.y - cy);
    if (d > R * 0.78 || d < R * 0.26) continue;
    if (Math.random() > 0.42) continue;
    put(f.x, f.y, "tree999");
  }
  // 中心的沉眠遗迹 + 墓碑
  let placed = 0;
  for (const f of floors) {
    if (placed >= 14) break;
    const d = Math.hypot(f.x - cx, f.y - cy);
    if (d > R * 0.24) continue;
    if (Math.random() > 0.28) continue;
    put(f.x, f.y, "ruin999"); placed++;
  }
  for (let i = 0; i < 8; i++) {
    const a = Math.random() * Math.PI * 2, r = Math.random() * R * 0.22;
    put(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r), "gravestone", { mine: i === 0 });
  }
  // 忏悔之处：岛正中心 —— 跪下忏悔，后室意志会一条一条念你的罪状
  const confess = { x: Math.round(cx), y: Math.round(cy), floor: 0, type: "confess999" };
  if (grid[confess.y] && grid[confess.y][confess.x] === 0) props.push(confess);

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [], sand,
    confess,
  };
  map.spawnPts = [start];
  return map;
}

window.PROP_DRAW = window.PROP_DRAW || {};

// 灰色的棕榈树：树干笔直，叶片张开 —— 但永远不会动
window.PROP_DRAW["palm999"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(0,0,0,0.24)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.30, T * 0.14, T * 0.04, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#7a7a74"; ctx.lineWidth = T * 0.09;
  ctx.beginPath(); ctx.moveTo(0, T * 0.28); ctx.lineTo(T * 0.03, -T * 0.14); ctx.stroke();
  ctx.strokeStyle = "#8a8a84"; ctx.lineWidth = T * 0.055;
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI + (i / 4) * Math.PI;
    ctx.beginPath();
    ctx.moveTo(T * 0.03, -T * 0.14);
    ctx.quadraticCurveTo(Math.cos(a) * T * 0.22, -T * 0.26, Math.cos(a) * T * 0.34, -T * 0.10 + Math.sin(a) * T * 0.10);
    ctx.stroke();
  }
};

// 岛上那些又高又密、寸步不移的灰色古树
window.PROP_DRAW["tree999"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.32, T * 0.18, T * 0.05, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#6e6e68"; ctx.lineWidth = T * 0.10;
  ctx.beginPath(); ctx.moveTo(0, T * 0.30); ctx.lineTo(0, -T * 0.06); ctx.stroke();
  ctx.fillStyle = "#82827c";
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(0, -T * 0.14 - i * T * 0.10, T * (0.26 - i * 0.05), T * (0.13 - i * 0.025), 0, 0, Math.PI * 2);
    ctx.fill();
  }
};

// 中心那些长眠的遗迹：砼块 / 玻璃 / 木料 / 石材，颓败但永远定身于此
window.PROP_DRAW["ruin999"] = function (ctx, p, T) {
  const kind = (((p.x || 0) * 3 + (p.y || 0) * 7) % 4);
  ctx.fillStyle = "rgba(0,0,0,0.30)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.24, T * 0.32, T * 0.08, 0, 0, Math.PI * 2); ctx.fill();
  if (kind === 0) {                                   // 砼块
    ctx.fillStyle = "#9a9a94"; ctx.fillRect(-T * 0.28, -T * 0.14, T * 0.56, T * 0.38);
    ctx.fillStyle = "#8a8a84"; ctx.fillRect(-T * 0.28, -T * 0.14, T * 0.56, T * 0.07);
  } else if (kind === 1) {                            // 玻璃
    ctx.fillStyle = "rgba(180,190,190,0.55)"; ctx.fillRect(-T * 0.24, -T * 0.18, T * 0.48, T * 0.42);
    ctx.strokeStyle = "rgba(220,230,230,0.60)"; ctx.lineWidth = 1.2;
    ctx.strokeRect(-T * 0.24, -T * 0.18, T * 0.48, T * 0.42);
    ctx.beginPath(); ctx.moveTo(-T * 0.24, T * 0.10); ctx.lineTo(T * 0.24, T * 0.10); ctx.stroke();
  } else if (kind === 2) {                            // 木料
    ctx.fillStyle = "#7a6a58";
    for (let i = 0; i < 3; i++) ctx.fillRect(-T * 0.30, -T * 0.10 + i * T * 0.12, T * 0.60, T * 0.07);
  } else {                                            // 石材
    ctx.fillStyle = "#a0a09a";
    ctx.beginPath(); ctx.ellipse(0, T * 0.04, T * 0.26, T * 0.18, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#8a8a84"; ctx.lineWidth = 1.4; ctx.stroke();
  }
  // 苔痕
  ctx.fillStyle = "rgba(90,110,80,0.35)";
  ctx.beginPath(); ctx.ellipse(-T * 0.12, T * 0.14, T * 0.10, T * 0.05, 0, 0, Math.PI * 2); ctx.fill();
};

// 忏悔之处：岛的正中心，跪下忏悔就会晕倒 -> Level 1000
window.PROP_DRAW["confess999"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  const pulse = 0.55 + 0.25 * Math.sin(t * 1.2);
  const g = ctx.createRadialGradient(0, 0, 1, 0, 0, T * 0.60);
  g.addColorStop(0, "rgba(230,230,225," + pulse + ")");
  g.addColorStop(0.6, "rgba(180,180,175," + (pulse * 0.30) + ")");
  g.addColorStop(1, "rgba(140,140,135,0)");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, 0, T * 0.60, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "rgba(240,240,235,0.55)"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(0, 0, T * 0.34, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, T * 0.20, 0, Math.PI * 2); ctx.stroke();
};
