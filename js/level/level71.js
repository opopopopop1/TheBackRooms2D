// ===========================================================
// Level 71 —— 地下虚空
// 看起来像一个未完成的地下室：只有一面墙（无限延伸），其余是砂砾和尘土。
// 你只看得见黑白灰三种颜色。入口处有一个不明物体发出的光源。
// 出口：沿着这面墙走 -> 隐秘层级 黯洃銫
// 布局：刻意极简 —— 一面长墙 + 一大片开阔砂砾地，完全不是迷宫。
// ===========================================================
"use strict";

function generateVoidBaseMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const props = [];
  const gravel = new Set();

  // 唯一的那一面墙：贴在地图左侧，从上到下无限延伸
  const WALLX = 3;
  for (let y = 1; y < size - 1; y++) grid[y][WALLX] = 1;
  // 其余全是砂砾地（可走）
  for (let y = 2; y < size - 2; y++) {
    for (let x = WALLX + 1; x < size - 2; x++) { grid[y][x] = 0; gravel.add(x + "," + y); }
  }
  // 上下也围上边（表示"未完成"的地下室边界）
  for (let x = 1; x < size - 1; x++) { grid[1][x] = 1; grid[size - 2][x] = 1; }
  for (let y = 1; y < size - 1; y++) grid[y][size - 2] = 1;

  const floors = collectFloors(grid, size);
  const start = { x: WALLX + 3, y: Math.floor(size / 2), floor: 0 };

  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return;
    if (grid[y][x] !== 0) return;
    props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  };
  // 入口处那个不明物体发出的光源
  put(start.x, start.y - 2, "voidlamp");
  // 沿墙散落的碎石堆
  for (let i = 0; i < 26; i++) put(randInt(WALLX + 2, size - 4), randInt(3, size - 4), "rubble71");
  // 墙的尽头（走到底）-> 黯洃銫
  put(WALLX + 2, size - 4, "voiddoor71", { toLevel: "anse" });

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [], gravel,
  };
  map.spawnPts = [start];
  return map;
}

window.PROP_DRAW = window.PROP_DRAW || {};

// 入口处的不明光源：一根立杆 + 发光的球（全灰阶）
window.PROP_DRAW["voidlamp"] = function (ctx, p, T) {
  ctx.fillStyle = "#4a4a4a"; ctx.fillRect(-2, -T * 0.10, 4, T * 0.44);
  const g = ctx.createRadialGradient(0, -T * 0.22, 1, 0, -T * 0.22, T * 0.34);
  g.addColorStop(0, "rgba(240,240,240,0.95)");
  g.addColorStop(0.45, "rgba(190,190,190,0.45)");
  g.addColorStop(1, "rgba(140,140,140,0)");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, -T * 0.22, T * 0.34, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#e8e8e8";
  ctx.beginPath(); ctx.arc(0, -T * 0.22, T * 0.11, 0, Math.PI * 2); ctx.fill();
};

// 碎石堆：几块大小不一的灰石
window.PROP_DRAW["rubble71"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.18, T * 0.22, T * 0.06, 0, 0, Math.PI * 2); ctx.fill();
  const cols = ["#6e6e6e", "#828282", "#5c5c5c"];
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = cols[i];
    ctx.beginPath();
    ctx.ellipse(-T * 0.14 + i * T * 0.14, T * 0.04 - i * T * 0.04, T * 0.11, T * 0.08, i * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(30,30,30,0.5)"; ctx.lineWidth = 1; ctx.stroke();
  }
};

// 墙尽头的暗处 -> 黯洃銫
window.PROP_DRAW["voiddoor71"] = function (ctx, p, T) {
  const w = T * 0.70, h = T * 0.90;
  // 一片"无法被照亮"的暗处：纯黑，边缘一点点灰
  ctx.fillStyle = "#050505"; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.strokeStyle = "rgba(150,150,150,0.35)"; ctx.lineWidth = 2;
  ctx.strokeRect(-w / 2, -h / 2, w, h);
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, "rgba(120,120,120,0.18)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g; ctx.fillRect(-w / 2, -h / 2, w, h);
};
