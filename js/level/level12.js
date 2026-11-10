// ===========================================================
// Level 12 —— 矩阵
// 一个很小的、明亮的白色油漆房间：只有一张桌子、一把椅子、一扇锁着的门。
// 拿桌上的钥匙 -> 开门 -> Level 13。
// 布局：整张地图就一个房间 —— 刻意不做成迷宫。
// ===========================================================
"use strict";

function generateMatrixMap(level) {
  const size = mapSizeFor(level);           // 24：就是"小房间"的尺寸
  const grid = makeGrid(size);
  const props = [];
  // 一整间白房：墙留 2 格厚，内部全空
  carveRoom(grid, size, 3, 3, size - 6, size - 6);

  const floors = collectFloors(grid, size);
  const start = { x: 5, y: Math.floor(size / 2), floor: 0 };

  // 桌子 + 椅子摆在房间中间偏左，门开在右墙
  const tx = Math.floor(size * 0.40), ty = Math.floor(size / 2);
  const doorX = size - 4, doorY = Math.floor(size / 2);
  grid[doorY][doorX] = 0;                   // 门洞开在墙上

  props.push({ x: tx, y: ty, floor: 0, type: "table12" });
  props.push({ x: tx - 2, y: ty, floor: 0, type: "chair12" });
  props.push({ x: tx, y: ty, floor: 0, type: "key12" });     // 钥匙就在桌上

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [{ x: 3, y: 3, w: size - 6, h: size - 6, start: true }],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [],
  };
  // 门：锁着，拿到钥匙才能开 —— 开后通往 Level 13
  makeDoorsMap(map);            // addDoor 要往 map.closedDoors 里塞，先建好这张表
  const d = addDoor(map, [{ x: doorX, y: doorY, dir: "v" }], 0, "matrixdoor", {
    dir: "v", toLevel: 13, locked: true, label: "L13",
  });
  if (d) map.doors.push(d);
  map.matrixKey = { x: tx, y: ty };
  map.spawnPts = [start];
  return map;
}

window.PROP_DRAW = window.PROP_DRAW || {};

// 桌子：白色油漆的方桌（Level 12 里它就是这么描述的 —— 但画成真正的桌子，不是箱子）
window.PROP_DRAW["table12"] = function (ctx, p, T) {
  const w = T * 0.86, d = T * 0.62;
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.28, w * 0.5, d * 0.22, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#f0efe9"; ctx.fillRect(-w / 2, -d / 2, w, d);         // 桌面
  ctx.fillStyle = "#d8d7d0"; ctx.fillRect(-w / 2, -d / 2, w, d * 0.14);  // 桌沿高光
  ctx.strokeStyle = "#b4b3ad"; ctx.lineWidth = 1.2; ctx.strokeRect(-w / 2, -d / 2, w, d);
  ctx.fillStyle = "#dedcd5";                                             // 四条腿
  for (const s of [[-1, -1], [1, -1], [-1, 1], [1, 1]])
    ctx.fillRect(s[0] * (w / 2 - 5) - 2, s[1] * (d / 2 - 3) - 2, 4, T * 0.24);
};

// 椅子：靠背椅（有椅背、椅面、四条腿）
window.PROP_DRAW["chair12"] = function (ctx, p, T) {
  const w = T * 0.42, d = T * 0.40;
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.24, w * 0.6, d * 0.24, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#e8e7e0"; ctx.fillRect(-w / 2, -d / 2, w, d);          // 椅面
  ctx.fillStyle = "#f2f1eb"; ctx.fillRect(-w / 2, -d / 2 - T * 0.30, w, T * 0.30); // 椅背
  ctx.strokeStyle = "#b4b3ad"; ctx.lineWidth = 1;
  ctx.strokeRect(-w / 2, -d / 2, w, d);
  ctx.strokeRect(-w / 2, -d / 2 - T * 0.30, w, T * 0.30);
  ctx.fillStyle = "#dedcd5";
  for (const s of [[-1, -1], [1, -1], [-1, 1], [1, 1]])
    ctx.fillRect(s[0] * (w / 2 - 3) - 1.5, s[1] * (d / 2 - 2) - 1.5, 3, T * 0.16);
};

// 桌上的钥匙：黄铜色，齿朝右
window.PROP_DRAW["key12"] = function (ctx, p, T) {
  if (p.taken) return;
  ctx.save();
  ctx.translate(0, -T * 0.06);
  ctx.fillStyle = "#c8a040";
  ctx.beginPath(); ctx.arc(-T * 0.10, 0, T * 0.09, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#f2f2ee";
  ctx.beginPath(); ctx.arc(-T * 0.10, 0, T * 0.04, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#c8a040";
  ctx.fillRect(-T * 0.02, -T * 0.025, T * 0.22, T * 0.05);
  ctx.fillRect(T * 0.10, T * 0.02, T * 0.035, T * 0.07);
  ctx.fillRect(T * 0.17, T * 0.02, T * 0.035, T * 0.05);
  ctx.restore();
};
