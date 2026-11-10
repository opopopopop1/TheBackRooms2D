// ===========================================================
// Level 49 —— 无底冥河弗列格通
// 无限延伸的一战堑壕系统。离开战壕必死（会被精确射击）。
// 布局：不是房间迷宫 —— 是"战壕"：一条条又窄又长、随机拐弯的沟，
//      偶尔接上宽敞些的枪炮掩体 / 炮兵基地 / 地堡。
// ===========================================================
"use strict";

function generateTrenchMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const props = [];
  const rooms = [];

  // 主战壕：一条从左到右、随机上下拐的折线（欧几里得空间，只是弯得多）
  let y = Math.floor(size / 2);
  let x = 3;
  const carve = (px, py) => { if (px > 1 && py > 1 && px < size - 2 && py < size - 2) grid[py][px] = 0; };
  while (x < size - 4) {
    const run = randInt(4, 11);
    for (let i = 0; i < run && x < size - 4; i++, x++) { carve(x, y); carve(x, y + 1); }
    // 拐弯：随机上下折
    const turn = randInt(-4, 4);
    const steps = Math.abs(turn) || 1;
    const dir = turn >= 0 ? 1 : -1;
    for (let i = 0; i < steps; i++) {
      y += dir;
      if (y < 3 || y > size - 5) { y -= dir * 2; break; }
      carve(x, y); carve(x, y + 1);
    }
  }
  // 支壕：从主壕分出去的几条，形成"错综复杂"的感觉
  for (let i = 0; i < 6; i++) {
    const sx = randInt(6, size - 8);
    let sy = -1;
    for (let yy = 2; yy < size - 3; yy++) if (grid[yy][sx] === 0) { sy = yy; break; }
    if (sy < 0) continue;
    let cy2 = sy, cx2 = sx;
    const vdir = Math.random() < 0.5 ? -1 : 1;
    for (let k = 0; k < randInt(8, 18); k++) {
      cy2 += vdir;
      if (cy2 < 3 || cy2 > size - 5) break;
      carve(cx2, cy2);
      if (k % 4 === 3) { cx2 += (Math.random() < 0.5 ? 1 : -1); carve(cx2, cy2); }
    }
  }
  // 宽敞建筑：枪炮掩体 / 炮兵基地 / 地堡
  const floors0 = collectFloors(grid, size);
  for (let i = 0; i < 7; i++) {
    const f = floors0[randInt(0, floors0.length - 1)];
    const w = randInt(5, 9), h = randInt(5, 8);
    const bx = Math.max(2, Math.min(size - w - 3, f.x - (w >> 1)));
    const by = Math.max(2, Math.min(size - h - 3, f.y - (h >> 1)));
    carveRoom(grid, size, bx, by, w, h);
    carveCorridorW(grid, size, bx + (w >> 1), by + (h >> 1), f.x, f.y, 1);
    rooms.push({ x: bx, y: by, w, h });
  }
  const floors = collectFloors(grid, size);
  const start = floors[0] ? { x: floors[0].x, y: floors[0].y, floor: 0 } : { x: 4, y: Math.floor(size / 2), floor: 0 };

  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return;
    if (grid[y][x] !== 0) return;
    props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  };
  for (let i = 0; i < 46; i++) { const f = floors[randInt(0, floors.length - 1)]; put(f.x, f.y, "sandbag"); }
  for (let i = 0; i < 22; i++) { const f = floors[randInt(0, floors.length - 1)]; put(f.x, f.y, "barbedwire"); }
  for (let i = 0; i < 10; i++) { const f = floors[randInt(0, floors.length - 1)]; put(f.x, f.y, "mortar"); }
  for (let i = 0; i < 16; i++) { const f = floors[randInt(0, floors.length - 1)]; put(f.x, f.y, "supply49"); }
  // 地堡里生锈的门：通往 14 / 65 / 50
  // 65 和 50 这一版没做 —— 换成已经存在、且同样说得通的去处。
  // （14 天堂：逃出战壕；11 不夜城；0 阈界）
  for (let i = 0; i < 3; i++) {
    const r = rooms[randInt(0, rooms.length - 1)];
    const to = [14, 11, 0][i];
    put(r.x + (r.w >> 1), r.y + 1, "rustdoor49", { toLevel: to, label: "L" + to });
  }

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms,
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [],
  };
  map.spawnPts = [start];
  return map;
}

window.PROP_DRAW = window.PROP_DRAW || {};

// 沙袋：一层层错缝堆叠的袋子
window.PROP_DRAW["sandbag"] = function (ctx, p, T) {
  const w = T * 0.76;
  for (let row = 0; row < 3; row++) {
    const yy = T * 0.16 - row * T * 0.16;
    const off = row % 2 ? T * 0.09 : 0;
    for (let i = -1; i <= 1; i++) {
      ctx.fillStyle = row % 2 ? "#8a7c58" : "#94865f";
      ctx.beginPath();
      ctx.ellipse(i * w * 0.30 + off, yy, w * 0.19, T * 0.09, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.30)"; ctx.lineWidth = 1; ctx.stroke();
    }
  }
};

// 带刺铁丝网：交叉的线 + 一串倒刺
window.PROP_DRAW["barbedwire"] = function (ctx, p, T) {
  ctx.strokeStyle = "#6a6258"; ctx.lineWidth = 1.6;
  for (let i = 0; i < 3; i++) {
    const yy = -T * 0.14 + i * T * 0.14;
    ctx.beginPath(); ctx.moveTo(-T * 0.36, yy); ctx.lineTo(T * 0.36, yy + (i % 2 ? 3 : -3)); ctx.stroke();
  }
  ctx.fillStyle = "#8a8278";
  for (let i = 0; i < 6; i++) {
    const xx = -T * 0.32 + i * T * 0.13;
    ctx.beginPath(); ctx.moveTo(xx - 3, -T * 0.05); ctx.lineTo(xx + 3, -T * 0.13); ctx.lineTo(xx + 3, T * 0.03);
    ctx.closePath(); ctx.fill();
  }
};

// 迫击炮：底座 + 炮管 + 两脚架
window.PROP_DRAW["mortar"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.28, T * 0.30, T * 0.09, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#3a4048";                                    // 底座
  ctx.beginPath(); ctx.ellipse(0, T * 0.22, T * 0.26, T * 0.10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#4a5058"; ctx.lineWidth = 4;               // 炮管（斜向上）
  ctx.beginPath(); ctx.moveTo(0, T * 0.18); ctx.lineTo(T * 0.22, -T * 0.30); ctx.stroke();
  ctx.strokeStyle = "#565c64"; ctx.lineWidth = 2.5;             // 两脚架
  ctx.beginPath(); ctx.moveTo(0, T * 0.18); ctx.lineTo(-T * 0.20, T * 0.02); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, T * 0.18); ctx.lineTo(T * 0.22, T * 0.04); ctx.stroke();
  ctx.fillStyle = "#2a2f35";
  ctx.beginPath(); ctx.arc(T * 0.22, -T * 0.30, T * 0.07, 0, Math.PI * 2); ctx.fill();
};

// 战壕里散落的补给：半空的杏仁水 + 罐头 + 医疗箱
window.PROP_DRAW["supply49"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.20, T * 0.24, T * 0.07, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#c8d8c0"; ctx.fillRect(-T * 0.20, -T * 0.04, T * 0.15, T * 0.22);  // 罐头
  ctx.fillStyle = "#8a9a88"; ctx.fillRect(-T * 0.20, -T * 0.04, T * 0.15, T * 0.05);
  ctx.fillStyle = "#d8e8d0"; ctx.fillRect(T * 0.02, -T * 0.10, T * 0.13, T * 0.28);   // 杏仁水瓶
  ctx.fillStyle = "#a8c8a0"; ctx.fillRect(T * 0.05, -T * 0.16, T * 0.07, T * 0.07);
};

// 地堡里生锈的门
window.PROP_DRAW["rustdoor49"] = function (ctx, p, T) {
  const w = T * 0.66, h = T * 0.86;
  ctx.fillStyle = "#6a4a30"; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#7a5638"; ctx.fillRect(-w / 2 + 2, -h / 2 + 2, w - 4, h - 4);
  // 锈斑
  ctx.fillStyle = "rgba(120,60,25,0.55)";
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(-w * 0.3 + Math.random() * w * 0.6, -h * 0.3 + Math.random() * h * 0.6, T * 0.05 + Math.random() * T * 0.04, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = "#3a2a1c"; ctx.lineWidth = 2; ctx.strokeRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#c8b070";                                   // 门把
  ctx.beginPath(); ctx.arc(w * 0.26, 0, T * 0.05, 0, Math.PI * 2); ctx.fill();
  if (p.label) {
    ctx.fillStyle = "#e8dcc0"; ctx.font = "bold 8px ui-monospace, monospace"; ctx.textAlign = "center";
    ctx.fillText(p.label, 0, -h / 2 - 4); ctx.textAlign = "left";
  }
};
