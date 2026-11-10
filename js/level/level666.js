// ===========================================================
// Level 666 —— 欢迎来到地狱
// 每个人的地狱都不一样（"现形"），且一次只能存在一个人。
// 这里取被记录到的现形之一：对黑暗和蜘蛛的恐惧 ——
//   与 Level 8 神似，但蜘蛛高度群居；腰果水自钟乳石滴下。
//   入口处挂着一张结成"欢迎来到地狱"字样的蜘蛛网。
// ===========================================================
"use strict";

function generateHellMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const props = [];

  // 洞穴式：几片不规则的空洞用通道串起来（不是规整房间）
  const caves = [];
  for (let i = 0; i < 9; i++) {
    const r = randInt(5, 9);
    const cx = randInt(6, size - 7), cy = randInt(6, size - 7);
    for (let y = cy - r; y <= cy + r; y++) {
      for (let x = cx - r; x <= cx + r; x++) {
        if (x < 2 || y < 2 || x > size - 3 || y > size - 3) continue;
        if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) grid[y][x] = 0;
      }
    }
    caves.push({ x: cx, y: cy });
  }
  for (let i = 1; i < caves.length; i++)
    carveCorridorW(grid, size, caves[i].x, caves[i].y, caves[i - 1].x, caves[i - 1].y, 2);

  const floors = collectFloors(grid, size);
  const start = { x: caves[0].x, y: caves[0].y, floor: 0 };

  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return;
    if (grid[y][x] !== 0) return;
    props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  };
  // 入口处：一张结成了字的蜘蛛网
  put(caves[0].x, caves[0].y - 2, "hellsign");
  // 钟乳石：腰果水从上面滴下来
  for (let i = 0; i < 22; i++) { const f = floors[randInt(0, floors.length - 1)]; put(f.x, f.y, "stalactite"); }
  for (let i = 0; i < 26; i++) { const f = floors[randInt(0, floors.length - 1)]; put(f.x, f.y, "web485"); }

  // 这一层没有出口 —— 它是彩蛋 / 必死层级，进来就出不去了。
  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [],
  };
  map.spawnPts = [start];
  return map;
}

window.PROP_DRAW = window.PROP_DRAW || {};

// 入口处那张结成"欢迎来到地狱"字样的蜘蛛网
window.PROP_DRAW["hellsign"] = function (ctx, p, T) {
  const w = T * 1.5, h = T * 0.66;
  // 网底
  ctx.strokeStyle = "rgba(215,215,205,0.35)"; ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * w * 0.5, Math.sin(a) * h * 0.7); ctx.stroke();
  }
  for (let ring = 1; ring <= 3; ring++) {
    ctx.beginPath();
    for (let i = 0; i <= 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const rr = ring / 3;
      const xx = Math.cos(a) * w * 0.5 * rr, yy = Math.sin(a) * h * 0.7 * rr;
      if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
    }
    ctx.stroke();
  }
  // 用亮一点的丝结成的字
  ctx.fillStyle = "rgba(240,235,215,0.92)";
  ctx.font = "bold 11px ui-monospace, monospace";
  ctx.textAlign = "center";
  ctx.fillText("欢迎来到地狱", 0, T * 0.10);
  ctx.textAlign = "left";
};

// 钟乳石：从洞顶垂下，尖端滴着腰果水
window.PROP_DRAW["stalactite"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  ctx.fillStyle = "#2a2630";
  ctx.beginPath();
  ctx.moveTo(-T * 0.16, -T * 0.40); ctx.lineTo(T * 0.16, -T * 0.40); ctx.lineTo(0, T * 0.06);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#3a3644";
  ctx.beginPath();
  ctx.moveTo(-T * 0.10, -T * 0.40); ctx.lineTo(T * 0.02, -T * 0.40); ctx.lineTo(0, T * 0.06);
  ctx.closePath(); ctx.fill();
  // 滴下来的腰果水（腰果水是淡黄的）
  const ph = ((t * 0.55 + (p.x || 0) * 0.37) % 1);
  ctx.fillStyle = "rgba(210,180,110,0.85)";
  ctx.beginPath(); ctx.arc(0, T * 0.10 + ph * T * 0.30, T * 0.035, 0, Math.PI * 2); ctx.fill();
};
