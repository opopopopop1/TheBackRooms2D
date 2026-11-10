// ===========================================================
// Level 512 —— 层级_模版
// 一栋标准结构的房屋：几层楼、三间卧室、两间厕所，家具齐全。
// 冰箱里有无限的食物和饮品，每天补货。
// 屋外是一条延伸到未知长度的公路，一片田，还有一个种着各种花的花园。
// 无面灵会沿着公路行走，试图和你交流（友好）。
// 出口：进入地下室 -> 未知层级
// ===========================================================
"use strict";

function generateTemplateMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const props = [];
  const grass = new Set();

  // 公路：横贯全图的一条直路
  const roadY = Math.floor(size * 0.78);
  for (let x = 2; x < size - 2; x++) for (let w = -1; w <= 1; w++) grid[roadY + w][x] = 0;
  // 房子：主体 + 几个房间
  const hx = Math.floor(size * 0.18), hy = Math.floor(size * 0.16);
  const hw = Math.floor(size * 0.44), hh = Math.floor(size * 0.42);
  carveRoom(grid, size, hx, hy, hw, hh);
  const rooms = [{ x: hx, y: hy, w: hw, h: hh, main: true }];
  // 卧室 ×3 / 厕所 ×2：在房子内部隔出来
  const inner = [
    { x: hx + 1, y: hy + 1, w: Math.floor(hw / 2) - 2, h: Math.floor(hh / 2) - 2, kind: "bedroom" },
    { x: hx + Math.floor(hw / 2) + 1, y: hy + 1, w: Math.floor(hw / 2) - 2, h: Math.floor(hh / 2) - 2, kind: "bedroom" },
    { x: hx + 1, y: hy + Math.floor(hh / 2) + 1, w: Math.floor(hw / 2) - 2, h: Math.floor(hh / 2) - 2, kind: "bedroom" },
    { x: hx + Math.floor(hw / 2) + 1, y: hy + Math.floor(hh / 2) + 1, w: Math.floor(hw / 3), h: Math.floor(hh / 2) - 2, kind: "toilet" },
    { x: hx + Math.floor(hw / 2) + 1 + Math.floor(hw / 3) + 1, y: hy + Math.floor(hh / 2) + 1,
      w: Math.max(3, hw - Math.floor(hw / 2) - Math.floor(hw / 3) - 4), h: Math.floor(hh / 2) - 2, kind: "toilet" },
  ];
  for (const r of inner) {
    if (r.w < 3 || r.h < 3) continue;
    carveRoom(grid, size, r.x, r.y, r.w, r.h);
    rooms.push(r);
    // 小房间通到主厅
    carveCorridorW(grid, size, r.x + (r.w >> 1), r.y + (r.h >> 1), hx + (hw >> 1), hy + (hh >> 1), 1);
  }
  // 地下室：房子一角
  const bx = hx + hw + 2, by = hy + hh - 4;
  carveRoom(grid, size, bx, by, 6, 5);
  carveCorridorW(grid, size, bx, by + 2, hx + hw - 1, hy + hh - 2, 1);
  // 田 + 花园
  for (let y = hy + hh + 3; y < roadY - 3; y++) {
    for (let x = hx + 2; x < hx + hw; x++) { grid[y][x] = 0; grass.add(x + "," + y); }
  }
  // 后门 + 车道：以前房子、田、公路三者之间各隔着两三格墙，谁也不挨着谁 ——
  // 玩家一出生就被锁在屋子里，屋外的田和公路全是走不到的死区（整层 33%）。
  // 现在从屋子后墙开一条道穿过田，再接上公路。
  {
    const gx = hx + (hw >> 1);
    carveCorridorW(grid, size, gx, hy + hh - 1, gx, roadY - 1, 1);
    for (let y = hy + hh - 1; y <= roadY - 1; y++) grass.delete(gx + "," + y);
  }
  // 兜底：万一还有接不上的碎片（比如房间被隔断了），统一接回主区
  if (typeof ensureAllConnected === "function") {
    ensureAllConnected(grid, size, { x: hx + (hw >> 1), y: hy + (hh >> 1) });
  }
  const floors = collectFloors(grid, size);
  const start = { x: hx + (hw >> 1), y: hy + (hh >> 1), floor: 0 };

  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return;
    if (grid[y][x] !== 0) return;
    props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  };
  for (const r of rooms) {
    if (r.kind === "bedroom") put(r.x + 1, r.y + 1, "bed512");
    if (r.kind === "toilet") put(r.x + 1, r.y + 1, "toilet512");
  }
  put(hx + 2, hy + 2, "fridge512");
  // 花园里的花
  for (let i = 0; i < 16; i++) {
    const x = randInt(hx + 2, hx + hw - 3), y = randInt(hy + hh + 3, roadY - 4);
    if (grid[y] && grid[y][x] === 0) put(x, y, "flower512");
  }
  // 公路上的无面灵（友好，不攻击）
  for (let i = 0; i < 4; i++) put(randInt(4, size - 5), roadY, "friendlyface");
  // 地下室门
  put(bx + 3, by, "basement512", { toLevel: null });

  // 出口（以前整层没有出口，进来就出不去）
  placeExitDoor(grid, size, start, props, { to: 11, label: "L11", tint: "#7a6a4a",
    tip: "地下室那扇门 —— 门后是城市的方向" });
  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms,
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [], grass,
  };
  map.spawnPts = [start];
  return map;
}

window.PROP_DRAW = window.PROP_DRAW || {};

// 冰箱：双开门，里面塞满了食物
window.PROP_DRAW["fridge512"] = function (ctx, p, T) {
  const w = T * 0.56, h = T * 0.86;
  ctx.fillStyle = "rgba(0,0,0,0.32)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.40, w * 0.6, T * 0.09, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#dcdcd6"; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.strokeStyle = "#a8a8a2"; ctx.lineWidth = 1.4; ctx.strokeRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#c4c4be";                                     // 上下两门的分缝
  ctx.fillRect(-w / 2, -h * 0.06, w, 2);
  ctx.fillStyle = "#8a8a84";
  ctx.fillRect(w * 0.30, -h * 0.32, 3, h * 0.22);                // 把手
  ctx.fillRect(w * 0.30, h * 0.10, 3, h * 0.22);
  // 门上贴着的一张便条（写着"每天补货"）
  ctx.fillStyle = "#f0e8c0"; ctx.fillRect(-w * 0.34, -h * 0.40, w * 0.30, h * 0.14);
  ctx.fillStyle = "#8a7a50";
  for (let i = 0; i < 2; i++) ctx.fillRect(-w * 0.30, -h * 0.36 + i * 5, w * 0.22, 1.6);
};

// 床：床架 + 被子 + 枕头
window.PROP_DRAW["bed512"] = function (ctx, p, T) {
  const w = T * 0.82, d = T * 0.62;
  ctx.fillStyle = "rgba(0,0,0,0.30)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.28, w * 0.5, d * 0.20, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#8a6a48"; ctx.fillRect(-w / 2, -d / 2, w, d);            // 床架
  ctx.fillStyle = "#c8b8a0"; ctx.fillRect(-w / 2 + 2, -d / 2 + 2, w - 4, d - 4);
  ctx.fillStyle = "#9a5a5a"; ctx.fillRect(-w / 2 + 2, -d * 0.10, w - 4, d * 0.56);  // 被子
  ctx.fillStyle = "#f0ece0"; ctx.fillRect(-w / 2 + 4, -d / 2 + 3, w * 0.28, d * 0.34); // 枕头
  ctx.fillStyle = "#6a4a30"; ctx.fillRect(-w / 2 - 2, -d / 2 - 3, w + 4, 4);         // 床头板
};

// 马桶
window.PROP_DRAW["toilet512"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(0,0,0,0.26)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.26, T * 0.20, T * 0.06, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#e8e8e4";
  ctx.beginPath(); ctx.ellipse(0, T * 0.06, T * 0.17, T * 0.11, 0, 0, Math.PI * 2); ctx.fill();  // 底座
  ctx.fillStyle = "#f2f2ee";
  ctx.fillRect(-T * 0.15, -T * 0.22, T * 0.30, T * 0.24);                                        // 水箱
  ctx.strokeStyle = "#b8b8b2"; ctx.lineWidth = 1; ctx.strokeRect(-T * 0.15, -T * 0.22, T * 0.30, T * 0.24);
  ctx.fillStyle = "#d0d0ca"; ctx.fillRect(-T * 0.05, -T * 0.14, T * 0.10, 3);
};

// 花园里的花：茎 + 花瓣
window.PROP_DRAW["flower512"] = function (ctx, p, T) {
  const col = ["#e05a5a", "#e8c040", "#c86ac8", "#e8e8e0", "#6a90e0"][((p.x * 5 + p.y * 3) % 5)];
  ctx.strokeStyle = "#4a7a3a"; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(0, T * 0.22); ctx.lineTo(0, -T * 0.04); ctx.stroke();
  ctx.fillStyle = col;
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    ctx.beginPath();
    ctx.ellipse(Math.cos(a) * T * 0.07, -T * 0.04 + Math.sin(a) * T * 0.07, T * 0.05, T * 0.05, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#e8c040";
  ctx.beginPath(); ctx.arc(0, -T * 0.04, T * 0.035, 0, Math.PI * 2); ctx.fill();
};

// 友好的无面灵：苍白人形，脸上什么都没有 —— 不攻击，只是站着
window.PROP_DRAW["friendlyface"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  const bob = Math.sin(t * 1.4) * T * 0.02;
  ctx.save(); ctx.translate(0, bob);
  ctx.fillStyle = "rgba(0,0,0,0.26)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.36, T * 0.14, T * 0.05, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#ded8cc";                                        // 躯干
  ctx.beginPath(); ctx.ellipse(0, T * 0.04, T * 0.14, T * 0.20, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#e8e2d6";                                        // 头（没有五官）
  ctx.beginPath(); ctx.arc(0, -T * 0.20, T * 0.11, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#c8c2b6"; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(-T * 0.12, -T * 0.04); ctx.lineTo(-T * 0.20, T * 0.14); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(T * 0.12, -T * 0.04); ctx.lineTo(T * 0.20, T * 0.14); ctx.stroke();
  ctx.restore();
};

// 地下室的门 -> 未知层级
window.PROP_DRAW["basement512"] = function (ctx, p, T) {
  const w = T * 0.68, h = T * 0.50;
  ctx.fillStyle = "#5a4a38"; ctx.fillRect(-w / 2, -h * 0.30, w, h);
  ctx.fillStyle = "#6a5842"; ctx.fillRect(-w / 2 + 2, -h * 0.30 + 2, w - 4, h - 2);
  ctx.strokeStyle = "#3a2e22"; ctx.lineWidth = 1.6; ctx.strokeRect(-w / 2, -h * 0.30, w, h);
  ctx.fillStyle = "rgba(0,0,0,0.62)";                               // 门下透出的黑暗
  ctx.fillRect(-w / 2 + 2, h * 0.62, w - 4, h * 0.10);
  ctx.fillStyle = "#c8b070";
  ctx.beginPath(); ctx.arc(w * 0.28, 0, T * 0.045, 0, Math.PI * 2); ctx.fill();
};
