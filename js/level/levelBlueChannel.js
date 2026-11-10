// ===========================================================
// 隐秘层级 —— 蓝色通道
// 围绕在整个后室和所有层级外的、充满怪异的虚空。
// 主要由令人目眩的蓝色虚空组成 —— 不存在任何阴影、图案或蓝色以外的颜色。
// 无论物体的竖直朝向哪里，都可以平滑地漂浮；人也可以在里面"游泳"。
// 但很容易翻转、失去方向感 —— 应当始终携带某种手持陀螺仪。
// 进入时可以看到身后无数层级的景象（外面罩着天空盒圆顶）。
// 偶尔能发现小块的建筑群（"场景"）—— 有些地面可行走，但碰到就会失去漂浮能力。
// ===========================================================
"use strict";

function generateBlueVoidMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const props = [];
  const voidTiles = new Set();

  // 整片都是虚空：可以"游"过去，没有墙
  for (let y = 2; y < size - 2; y++) for (let x = 2; x < size - 2; x++) { grid[y][x] = 0; voidTiles.add(x + "," + y); }
  const floors = collectFloors(grid, size);
  const start = { x: Math.floor(size / 2), y: Math.floor(size / 2), floor: 0 };

  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return;
    if (grid[y][x] !== 0) return;
    props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  };
  // 散落的"场景"：小块的建筑群
  for (let i = 0; i < 7; i++) {
    const bx = randInt(6, size - 12), by = randInt(6, size - 10);
    put(bx, by, "floatingbuild");
    // 有的地面是可切入的（碰到会失去漂浮能力）
    if (Math.random() < 0.5) put(bx + 3, by + 2, "solidground");
  }
  // 漂浮的杂物（街道 / 杂物间的碎片）
  for (let i = 0; i < 18; i++) put(randInt(4, size - 5), randInt(4, size - 5), "debrisBC");
  // 手持陀螺仪：捡起来可以缓解翻转
  for (let i = 0; i < 4; i++) put(randInt(5, size - 6), randInt(5, size - 6), "gyroBC");
  // 远处那些被天空盒罩着的层级
  for (let i = 0; i < 6; i++) put(randInt(5, size - 6), randInt(5, size - 6), "distantlevel");
  // 出口：虚空中偶尔能撞见的一扇门 —— 不明摆着，但一定有，否则进来就出不去了
  for (let i = 0; i < 2; i++) {
    const a = Math.random() * Math.PI * 2, r = Math.floor(size * 0.36);
    let bx = Math.floor(size / 2 + Math.cos(a) * r), by = Math.floor(size / 2 + Math.sin(a) * r);
    bx = Math.max(4, Math.min(size - 5, bx)); by = Math.max(4, Math.min(size - 5, by));
    put(bx, by, "bluedoor");
  }

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [], voidTiles,
  };
  map.spawnPts = [start];
  return map;
}

window.PROP_DRAW = window.PROP_DRAW || {};

// 漂浮在虚空里的小块建筑群（"场景"）
window.PROP_DRAW["floatingbuild"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  const drift = Math.sin(t * 0.5 + (p.x || 0)) * T * 0.05;
  ctx.save(); ctx.translate(0, drift);
  // 一栋小小的摩天楼 / 房屋：只用不同深浅的蓝
  ctx.fillStyle = "#2a5ab4"; ctx.fillRect(-T * 0.30, -T * 0.46, T * 0.26, T * 0.86);
  ctx.fillStyle = "#1e4a9c"; ctx.fillRect(-T * 0.02, -T * 0.30, T * 0.30, T * 0.70);
  ctx.fillStyle = "#3a6ac8";
  for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) {
    ctx.fillRect(-T * 0.26 + c * T * 0.10, -T * 0.40 + r * T * 0.18, T * 0.06, T * 0.09);
  }
  // 朦胧的雾气：这些区域被某种大气包围
  ctx.fillStyle = "rgba(150,190,255,0.18)";
  ctx.beginPath(); ctx.ellipse(0, 0, T * 0.52, T * 0.44, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
};

// 可切入的地面：碰到就会失去漂浮能力，永远坠落 —— 强烈建议避开
window.PROP_DRAW["solidground"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(90,130,220,0.55)";
  ctx.beginPath(); ctx.ellipse(0, 0, T * 0.34, T * 0.22, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "rgba(180,215,255,0.75)"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(0, 0, T * 0.34, T * 0.22, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(0, 0, T * 0.20, T * 0.13, 0, 0, Math.PI * 2); ctx.stroke();
};

// 漂浮的杂物：房屋、街道、杂物间的碎片
window.PROP_DRAW["debrisBC"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  ctx.save();
  ctx.translate(0, Math.sin(t * 0.7 + (p.y || 0)) * T * 0.06);
  ctx.rotate(Math.sin((p.x || 0) * 1.7) * 0.4);
  ctx.fillStyle = "#24509e";
  ctx.fillRect(-T * 0.22, -T * 0.10, T * 0.44, T * 0.16);
  ctx.fillStyle = "#2e5cb8";
  ctx.fillRect(-T * 0.16, -T * 0.18, T * 0.20, T * 0.12);
  ctx.restore();
};

// 手持陀螺仪：拿着它才不容易翻转、失去方向感
window.PROP_DRAW["gyroBC"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  ctx.save();
  ctx.rotate(t * 1.6);
  ctx.fillStyle = "#b8ccf0";
  ctx.beginPath(); ctx.arc(0, 0, T * 0.16, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#6a8ad0"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, 0, T * 0.16, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, 0, T * 0.16, T * 0.06, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, 0, T * 0.06, T * 0.16, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
  ctx.fillStyle = "#e0ecff";
  ctx.beginPath(); ctx.arc(0, 0, T * 0.04, 0, Math.PI * 2); ctx.fill();
};

// 出口：悬在虚空里的一扇门。整个通道只有蓝色的深浅，门也是蓝的 ——
// 但它有一圈发白的门框和一颗会呼吸的把手，靠得近就能认出来。
window.PROP_DRAW["bluedoor"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  const pulse = 0.55 + 0.45 * Math.sin(t * 2.2);
  ctx.save();
  ctx.translate(0, Math.sin(t * 0.6 + (p.x || 0)) * T * 0.04);
  // 后面透出来的光
  const g = ctx.createRadialGradient(0, 0, 1, 0, 0, T * 0.5);
  g.addColorStop(0, "rgba(225,240,255," + (0.45 + pulse * 0.35).toFixed(3) + ")");
  g.addColorStop(1, "rgba(120,170,255,0)");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, 0, T * 0.5, 0, Math.PI * 2); ctx.fill();
  // 门框
  ctx.fillStyle = "#c2d8ff";
  ctx.fillRect(-T * 0.27, -T * 0.44, T * 0.54, T * 0.88);
  // 门板（比周围亮一档的白蓝）
  ctx.fillStyle = "#e8f2ff";
  ctx.fillRect(-T * 0.21, -T * 0.38, T * 0.42, T * 0.76);
  ctx.strokeStyle = "#4a7ad0"; ctx.lineWidth = 1.4;
  ctx.strokeRect(-T * 0.21, -T * 0.38, T * 0.42, T * 0.76);
  ctx.beginPath(); ctx.moveTo(0, -T * 0.38); ctx.lineTo(0, T * 0.38); ctx.stroke();
  // 把手：会呼吸
  ctx.fillStyle = "rgba(255,255,255," + (0.6 + pulse * 0.4).toFixed(3) + ")";
  ctx.beginPath(); ctx.arc(T * 0.14, 0, T * 0.045, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(-T * 0.14, 0, T * 0.045, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
};

// 远处那些被天空盒罩着的层级（看得见，靠近就到不了）
window.PROP_DRAW["distantlevel"] = function (ctx, p, T) {
  // 一个巨大的天空盒圆顶 + 下面一层平台
  ctx.strokeStyle = "rgba(140,180,250,0.45)"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, T * 0.10, T * 0.44, Math.PI, 0); ctx.stroke();
  ctx.fillStyle = "rgba(60,100,190,0.35)";
  ctx.beginPath(); ctx.arc(0, T * 0.10, T * 0.44, Math.PI, 0); ctx.fill();
  ctx.fillStyle = "rgba(80,130,220,0.55)";
  ctx.fillRect(-T * 0.44, T * 0.10, T * 0.88, T * 0.14);
  // 平台上那一格格的房间
  ctx.fillStyle = "rgba(150,190,255,0.30)";
  for (let i = 0; i < 4; i++) ctx.fillRect(-T * 0.38 + i * T * 0.20, T * 0.00, T * 0.14, T * 0.10);
};
