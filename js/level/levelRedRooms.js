// ===========================================================
// 红室（The Red Rooms）
// 它和 Level 0 长得几乎一样 —— 但墙纸是腥红的，地毯粗制而黏脚，
// 幽暗的拐角处生着蘑菇与霉斑，灯具是暗房式的那种。
// 只能从 Level 0（深坑区踩空）掉进来；进来以后就再也出不去了。
// ===========================================================
"use strict";

function generateRedRoomsMap(level) {
  const size = mapSizeFor(level);
  const layer = buildRoomLayer(size, { roomW: [6, 12], roomH: [6, 11], density: 1.15, startRoom: 9 });
  const grid = layer.grid, rooms = layer.rooms;
  const floors = collectFloors(grid, size);
  const start = { x: Math.floor(size / 2), y: Math.floor(size / 2), floor: 0 };

  const props = [];
  const put = (x, y, type) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return;
    if (grid[y][x] !== 0) return;
    props.push({ x, y, floor: 0, type });
  };
  // 暗房式的灯具：挂在墙边，红色的光只照亮很小一圈
  const lamps = [];
  const cand = floors.filter((f) => {
    const w = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    return w.some((d) => grid[f.y + d[1]] && grid[f.y + d[1]][f.x + d[0]] === 1);
  });
  for (let i = 0; i < 12 && cand.length; i++) {
    const f = cand[randInt(0, cand.length - 1)];
    lamps.push({ x: f.x, y: f.y, wx: f.x, wy: f.y, r: 4.5, c: "255,60,44" });
    put(f.x, f.y, "redlamp");
  }
  // 拐角的蘑菇与霉斑
  for (let i = 0; i < 26; i++) { const f = floors[randInt(0, floors.length - 1)]; if (f) put(f.x, f.y, "redmold"); }

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [rooms],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [],
    lamps,                    // 暗房式灯具
    noExit: true,             // 这里没有出口
    deadZone: true,           // 死区：理智会一直往下掉
  };
  map.spawnPts = [start];
  return map;
}

window.PROP_DRAW = window.PROP_DRAW || {};

// 暗房式的灯：一个深色的灯罩 + 一颗暗红的灯泡
window.PROP_DRAW["redlamp"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.30, T * 0.16, T * 0.05, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#3a1a16"; ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.moveTo(0, -T * 0.26); ctx.lineTo(0, -T * 0.10); ctx.stroke();
  ctx.fillStyle = "#4a2220";
  ctx.beginPath();
  ctx.moveTo(-T * 0.17, -T * 0.08); ctx.lineTo(T * 0.17, -T * 0.08);
  ctx.lineTo(T * 0.11, T * 0.06); ctx.lineTo(-T * 0.11, T * 0.06);
  ctx.closePath(); ctx.fill();
  const glow = 0.55 + 0.45 * Math.abs(Math.sin(Date.now() / 700 + p.x));
  ctx.fillStyle = "rgba(255,80,60," + (0.55 * glow).toFixed(3) + ")";
  ctx.beginPath(); ctx.arc(0, T * 0.09, T * 0.055, 0, Math.PI * 2); ctx.fill();
  ctx.shadowColor = "rgba(255,70,50,0.8)"; ctx.shadowBlur = 12;
  ctx.beginPath(); ctx.arc(0, T * 0.09, T * 0.03, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
};

// 霉斑 / 蘑菇丛
window.PROP_DRAW["redmold"] = function (ctx, p, T) {
  const n = hash2(p.x, p.y);
  ctx.fillStyle = "rgba(96,116,74,0.40)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.16, T * 0.20, T * 0.07, 0, 0, Math.PI * 2); ctx.fill();
  if (n > 0.55) {
    // 一小丛蘑菇
    for (let i = 0; i < 3; i++) {
      const ox = -T * 0.12 + i * T * 0.12, oy = T * 0.12 - (i === 1 ? T * 0.05 : 0);
      ctx.fillStyle = "#c8b8a0"; ctx.fillRect(ox - 1.2, oy - 5, 2.4, 6);
      ctx.fillStyle = "#8a4034";
      ctx.beginPath(); ctx.ellipse(ox, oy - 5, 3.4, 2.4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(220,200,180,0.5)";
      ctx.beginPath(); ctx.arc(ox - 1, oy - 6, 0.9, 0, Math.PI * 2); ctx.fill();
    }
  } else {
    ctx.fillStyle = "rgba(70,90,56,0.45)";
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(-T * 0.1 + i * T * 0.1, T * 0.14 - (i % 2) * 4, 2.6, 0, Math.PI * 2); ctx.fill();
    }
  }
};
