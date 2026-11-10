// ===========================================================
// Level 49.1 —— 勿忘先烈
// 一片永无停歇之日的一战战场，大雾弥漫。
// 士兵效应：抹掉记忆，让你深信自己正在打仗，还会产生创伤性幻觉。
// 出口：在某个未知的条件下，你会在 Level 0 醒来 —— 这里做成"找到自己的墓碑"。
// ===========================================================
"use strict";

function generateTrenchPsiMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const props = [];

  // 战壕（和 49 类似但更破碎）+ 中央一片墓地
  let y = Math.floor(size / 2), x = 3;
  const carve = (px, py) => { if (px > 1 && py > 1 && px < size - 2 && py < size - 2) grid[py][px] = 0; };
  while (x < size - 4) {
    const run = randInt(3, 9);
    for (let i = 0; i < run && x < size - 4; i++, x++) { carve(x, y); carve(x, y + 1); }
    const turn = randInt(-5, 5);
    const dir = turn >= 0 ? 1 : -1;
    for (let i = 0; i < (Math.abs(turn) || 1); i++) {
      y += dir;
      if (y < 3 || y > size - 5) { y -= dir * 2; break; }
      carve(x, y); carve(x, y + 1);
    }
  }
  // 中央墓地：一片开阔地，立满墓碑
  const gx = Math.floor(size / 2), gy = Math.floor(size / 2);
  carveRoom(grid, size, gx - 7, gy - 6, 14, 12);
  // 几条战壕接到墓地
  carveCorridorW(grid, size, 4, Math.floor(size / 2), gx - 7, gy, 1);
  carveCorridorW(grid, size, size - 6, Math.floor(size / 2), gx + 7, gy, 1);

  const floors = collectFloors(grid, size);
  const start = { x: 4, y: Math.floor(size / 2), floor: 0 };

  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return;
    if (grid[y][x] !== 0) return;
    props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  };
  // 墓碑：大多是别人的，只有一座是你的
  const mine = randInt(0, 17);
  for (let i = 0; i < 18; i++) {
    const gx2 = gx - 6 + (i % 6) * 2 + (i % 2);
    const gy2 = gy - 5 + Math.floor(i / 6) * 3;
    put(gx2, gy2, "gravestone", { mine: i === mine });
  }
  for (let i = 0; i < 30; i++) { const f = floors[randInt(0, floors.length - 1)]; put(f.x, f.y, "sandbag"); }
  for (let i = 0; i < 14; i++) { const f = floors[randInt(0, floors.length - 1)]; put(f.x, f.y, "barbedwire"); }

  // 出口（以前整层没有出口，进来就出不去）
  placeExitDoor(grid, size, start, props, { to: 49, label: "L49", tint: "#5a4a34",
    tip: "战壕后方一道没人看守的缺口" });
  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [],
  };
  map.graveMine = mine;
  map.spawnPts = [start];
  return map;
}

window.PROP_DRAW = window.PROP_DRAW || {};

// 墓碑：石质碑体 + 刻痕；"你的"那座碑前摆着花、枪和头盔
window.PROP_DRAW["gravestone"] = function (ctx, p, T) {
  const w = T * 0.44, h = T * 0.66;
  ctx.fillStyle = "rgba(0,0,0,0.34)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.30, w * 0.7, T * 0.09, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = p.mine ? "#9a968a" : "#7e7a70";
  ctx.beginPath();
  ctx.moveTo(-w / 2, h / 2); ctx.lineTo(-w / 2, -h * 0.18);
  ctx.arc(0, -h * 0.18, w / 2, Math.PI, 0);
  ctx.lineTo(w / 2, h / 2); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "#57544c"; ctx.lineWidth = 1.4; ctx.stroke();
  // 刻痕（名字的横线）
  ctx.strokeStyle = "rgba(50,48,42,0.65)"; ctx.lineWidth = 1.4;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.moveTo(-w * 0.26, -h * 0.06 + i * T * 0.11);
    ctx.lineTo(w * 0.26, -h * 0.06 + i * T * 0.11); ctx.stroke();
  }
  if (p.mine) {
    // 花 + 头盔 + 枪，摆在碑前
    ctx.fillStyle = "#b8403a";
    for (let i = 0; i < 3; i++) {
      ctx.beginPath(); ctx.arc(-T * 0.16 + i * T * 0.16, h * 0.42, T * 0.05, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = "#4a5a3a";                                  // 头盔
    ctx.beginPath(); ctx.ellipse(-T * 0.30, h * 0.40, T * 0.11, T * 0.07, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = "#3a3a34";                                  // 立着的枪
    ctx.fillRect(T * 0.30, h * 0.10, 3, T * 0.34);
    // 一圈柔光，提示"就是这座"
    ctx.strokeStyle = "rgba(220,220,200,0.45)"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(0, h * 0.34, T * 0.42, T * 0.16, 0, 0, Math.PI * 2); ctx.stroke();
  }
};
