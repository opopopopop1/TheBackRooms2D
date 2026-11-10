// ===========================================================
// Level 998 —— 此路向死，或向远方
// 一片空旷平坦的平面，地面是"被压印在地表"的云层纹理（坚硬、羊毛般）。
// 无论从哪个层级进入，都抵达同一处：一栋写字楼楼梯间的最底层。
// 走过八段台阶 -> 一个小空房间（里面有一堆彩绘鹅卵石）。
// 离开后进入云层平面，分三个区：
//   一区（白，室温）-> 二区（灰，11°C，实体开始出现）
//   -> 三区（黑雾，狂风暴雨，实体数量大涨）
// ===========================================================
"use strict";

function generateCloudPlaneMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const props = [];

  // 整片都是可走的云层平面 —— 刻意不做任何墙，就是"空旷平坦"
  for (let y = 2; y < size - 2; y++) for (let x = 2; x < size - 2; x++) grid[y][x] = 0;
  // 唯一的建筑：写字楼楼梯间（最底层），在地图左端
  const sx = 5, sy = Math.floor(size / 2) - 3;
  carveRoom(grid, size, sx, sy, 8, 7);
  // 楼梯间里的一段段台阶
  for (let i = 0; i < 8; i++) {
    const x = sx + 1 + (i % 4), y = sy + 1 + Math.floor(i / 4) * 2;
    if (grid[y] && grid[y][x] !== undefined) grid[y][x] = 0;
  }

  const floors = collectFloors(grid, size);
  const start = { x: sx + 4, y: sy + 3, floor: 0 };

  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return;
    if (grid[y][x] !== 0) return;
    props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  };
  // 楼梯间：八段台阶
  for (let i = 0; i < 8; i++) put(sx + 1 + (i % 4), sy + 1 + Math.floor(i / 4) * 2, "step998");
  // 房间里那堆彩绘鹅卵石
  put(sx + 6, sy + 5, "pebbles998");
  // 三个区的分界标记（走得越远越黑越冷）
  put(Math.floor(size * 0.42), Math.floor(size / 2), "zonemark998", { zone: 2 });
  put(Math.floor(size * 0.72), Math.floor(size / 2), "zonemark998", { zone: 3 });

  // 出口（以前整层没有出口，进来就出不去）
  placeExitDoor(grid, size, start, props, { to: 999, label: "L999", tint: "#5a5a66",
    tip: "云层裂开的一道口子 —— 风从下面涌上来" });
  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [],
  };
  map.zone2X = Math.floor(size * 0.42);
  map.zone3X = Math.floor(size * 0.72);
  map.spawnPts = [start];
  return map;
}

window.PROP_DRAW = window.PROP_DRAW || {};

// 楼梯间的一段台阶
window.PROP_DRAW["step998"] = function (ctx, p, T) {
  ctx.fillStyle = "#c8ccd4"; ctx.fillRect(-T * 0.34, -T * 0.06, T * 0.68, T * 0.14);
  ctx.fillStyle = "#a8acb4"; ctx.fillRect(-T * 0.34, T * 0.06, T * 0.68, T * 0.06);
  ctx.strokeStyle = "#8a8e96"; ctx.lineWidth = 1; ctx.strokeRect(-T * 0.34, -T * 0.06, T * 0.68, T * 0.20);
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.fillRect(-T * 0.34, -T * 0.06, T * 0.68, T * 0.04);
};

// 那堆彩绘鹅卵石 —— 每个进去的人留一颗
window.PROP_DRAW["pebbles998"] = function (ctx, p, T) {
  const cols = ["#c85050", "#50a8c8", "#c8b040", "#70c870", "#b070c8", "#e09040"];
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const rr = T * (0.10 + (i % 3) * 0.07);
    ctx.fillStyle = cols[i % cols.length];
    ctx.beginPath();
    ctx.ellipse(Math.cos(a) * rr * 0.7, Math.sin(a) * rr * 0.5, T * 0.075, T * 0.055, a, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.25)"; ctx.lineWidth = 1; ctx.stroke();
  }
  ctx.fillStyle = "#e8e8ea";
  ctx.beginPath(); ctx.arc(0, -T * 0.02, T * 0.07, 0, Math.PI * 2); ctx.fill();
};

// 分区标记：一条横贯的界线，越往里越暗
window.PROP_DRAW["zonemark998"] = function (ctx, p, T) {
  const z = p.zone || 2;
  ctx.strokeStyle = z === 3 ? "rgba(10,10,14,0.55)" : "rgba(90,94,104,0.40)";
  ctx.lineWidth = 3;
  ctx.setLineDash([6, 5]);
  ctx.beginPath(); ctx.moveTo(0, -T * 0.44); ctx.lineTo(0, T * 0.44); ctx.stroke();
  ctx.setLineDash([]);
};
