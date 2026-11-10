// ===========================================================
// Level 484 —— 茫白景象
// 一幢硕大无朋、正在翻修的白房子。房间 / 走廊 / 楼梯间，
// 有雕塑间、苍白花园（里面有一架无人自奏的钢琴和一本《灵想》）。
// 出口：走得够远，找到一扇灰色的门 -> Level 485
// 布局：房间 + 走廊 + 楼梯间 —— 住宅式，不是迷宫。
// ===========================================================
"use strict";

function generateWhiteHouseMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const props = [];
  const rooms = [];

  // 一排排房间，用走廊串起来
  const cols = 4, rows = 3;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const w = randInt(7, 12), h = randInt(6, 10);
      const x = 3 + c * Math.floor((size - 8) / cols);
      const y = 3 + r * Math.floor((size - 8) / rows);
      if (x + w > size - 3 || y + h > size - 3) continue;
      carveRoom(grid, size, x, y, w, h);
      rooms.push({ x, y, w, h });
    }
  }
  // 竖向走廊
  for (let c = 0; c <= cols; c++) {
    const x = 2 + c * Math.floor((size - 8) / cols);
    carveCorridorW(grid, size, x, 2, x, size - 3, 1);
  }
  // 横向走廊
  for (let r = 0; r <= rows; r++) {
    const y = 2 + r * Math.floor((size - 8) / rows);
    carveCorridorW(grid, size, 2, y, size - 3, y, 1);
  }
  // 苍白色园：地图中央的大房间
  const gw = Math.floor(size * 0.30), gh = Math.floor(size * 0.22);
  const gx = Math.floor((size - gw) / 2), gy = Math.floor((size - gh) / 2);
  carveRoom(grid, size, gx, gy, gw, gh);
  rooms.push({ x: gx, y: gy, w: gw, h: gh, garden: true });

  const floors = collectFloors(grid, size);
  const start = { x: gx + (gw >> 1), y: gy + (gh >> 1), floor: 0 };

  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return;
    if (grid[y][x] !== 0) return;
    props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  };
  // 雕塑间：1~4 尊雕塑，偶尔多一条腿 / 一只手
  for (let i = 0; i < 12; i++) {
    const r = rooms[randInt(0, rooms.length - 1)];
    put(r.x + randInt(1, Math.max(1, r.w - 2)), r.y + randInt(1, Math.max(1, r.h - 2)), "sculpture484");
  }
  // 花园里的钢琴 + 基座上的《灵想》
  put(gx + 2, gy + 2, "piano484");
  put(gx + (gw >> 1), gy + (gh >> 1), "book484");
  // 柱状的"植株"（花园里那些不像植物的柱子）
  for (let i = 0; i < 8; i++) put(gx + randInt(1, gw - 2), gy + randInt(1, gh - 2), "palePillar");
  // 墙上的褪色相片
  for (let i = 0; i < 14; i++) { const r = rooms[randInt(0, rooms.length - 1)]; put(r.x, r.y, "photo484"); }
  // 出口：灰色的门（要走得够远）
  // 以前写死在 (size-4, size-4)，那一格是墙体 —— put() 会静默丢弃，
  // 结果整层根本没有这扇门，Level 485 永远进不去。
  // 现在挑"离出生点最远、且贴着墙"的地板来放，既保证是地板，
  // 也符合原文"必须去到很远的地方才能找到它"。
  {
    let far = null, farD = -1;
    for (const f of floors) {
      const wallUp = grid[f.y - 1] && grid[f.y - 1][f.x] === 1;
      const wallDn = grid[f.y + 1] && grid[f.y + 1][f.x] === 1;
      const wallL = grid[f.y][f.x - 1] === 1, wallR = grid[f.y][f.x + 1] === 1;
      if (!(wallUp || wallDn || wallL || wallR)) continue;   // 门要贴着墙
      const d = Math.abs(f.x - start.x) + Math.abs(f.y - start.y);
      if (d > farD) { farD = d; far = f; }
    }
    if (far) put(far.x, far.y, "graydoor484", { toLevel: 485 });
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

// 雕塑：基座 + 人形（有些会有第三条腿 / 第三只手这类轻微异常）
window.PROP_DRAW["sculpture484"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(0,0,0,0.20)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.34, T * 0.24, T * 0.07, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#dedcd4"; ctx.fillRect(-T * 0.20, T * 0.20, T * 0.40, T * 0.16);   // 基座
  ctx.fillStyle = "#eeeae0";
  ctx.beginPath(); ctx.ellipse(0, -T * 0.10, T * 0.11, T * 0.13, 0, 0, Math.PI * 2); ctx.fill();  // 躯干
  ctx.beginPath(); ctx.arc(0, -T * 0.28, T * 0.08, 0, Math.PI * 2); ctx.fill();                    // 头
  ctx.strokeStyle = "#eeeae0"; ctx.lineWidth = T * 0.05;
  ctx.beginPath(); ctx.moveTo(-T * 0.09, -T * 0.14); ctx.lineTo(-T * 0.19, -T * 0.02); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(T * 0.09, -T * 0.14); ctx.lineTo(T * 0.19, -T * 0.02); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-T * 0.05, T * 0.04); ctx.lineTo(-T * 0.07, T * 0.20); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(T * 0.05, T * 0.04); ctx.lineTo(T * 0.07, T * 0.20); ctx.stroke();
  // 轻微异常：多出来的一条小肢
  const odd = (((p.x || 0) * 7 + (p.y || 0) * 13) % 3) === 0;
  if (odd) {
    ctx.beginPath(); ctx.moveTo(T * 0.02, T * 0.02); ctx.lineTo(T * 0.13, T * 0.18); ctx.stroke();
  }
  ctx.strokeStyle = "rgba(150,148,140,0.5)"; ctx.lineWidth = 1;
  ctx.strokeRect(-T * 0.20, T * 0.20, T * 0.40, T * 0.16);
};

// 无人自奏的钢琴：三角钢琴的俯视轮廓 + 琴键
window.PROP_DRAW["piano484"] = function (ctx, p, T) {
  const w = T * 0.86, d = T * 0.60;
  ctx.fillStyle = "rgba(0,0,0,0.30)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.28, w * 0.5, d * 0.20, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#20201e";                                    // 琴身
  ctx.beginPath();
  ctx.moveTo(-w / 2, -d / 2); ctx.lineTo(w / 2, -d / 2);
  ctx.lineTo(w / 2, d * 0.10); ctx.quadraticCurveTo(0, d / 2 + T * 0.10, -w / 2, d * 0.10);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#f2efe6";                                    // 琴键
  ctx.fillRect(-w / 2 + 3, -d / 2 + 3, w - 6, d * 0.26);
  ctx.fillStyle = "#20201e";
  for (let i = 1; i < 14; i++) ctx.fillRect(-w / 2 + 3 + i * (w - 6) / 14, -d / 2 + 3, 1.4, d * 0.16);
};

// 基座上那本《灵想》—— 拿不起来
window.PROP_DRAW["book484"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.24, T * 0.20, T * 0.06, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#dedcd4"; ctx.fillRect(-T * 0.16, T * 0.06, T * 0.32, T * 0.18);   // 基座
  ctx.fillStyle = "#f4f2ea"; ctx.fillRect(-T * 0.16, -T * 0.10, T * 0.32, T * 0.16); // 书
  ctx.fillStyle = "#c8c4b8"; ctx.fillRect(-T * 0.16, -T * 0.10, T * 0.32, T * 0.03);
  ctx.strokeStyle = "#a8a498"; ctx.lineWidth = 1; ctx.strokeRect(-T * 0.16, -T * 0.10, T * 0.32, T * 0.16);
  ctx.fillStyle = "#8a867a"; ctx.font = "bold 6px ui-monospace, monospace"; ctx.textAlign = "center";
  ctx.fillText("灵想", 0, T * 0.02); ctx.textAlign = "left";
};

// 花园里那些"不像植物的柱子"
window.PROP_DRAW["palePillar"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.30, T * 0.16, T * 0.05, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#eeeae0"; ctx.fillRect(-T * 0.10, -T * 0.30, T * 0.20, T * 0.58);
  ctx.fillStyle = "#f6f4ee"; ctx.fillRect(-T * 0.10, -T * 0.30, T * 0.07, T * 0.58);
  ctx.fillStyle = "#dedcd4"; ctx.fillRect(-T * 0.13, -T * 0.36, T * 0.26, T * 0.07);   // 柱头
  ctx.strokeStyle = "rgba(160,158,150,0.5)"; ctx.lineWidth = 1;
  ctx.strokeRect(-T * 0.10, -T * 0.30, T * 0.20, T * 0.58);
};

// 墙上的褪色相片
window.PROP_DRAW["photo484"] = function (ctx, p, T) {
  ctx.fillStyle = "#e8e6de"; ctx.fillRect(-T * 0.18, -T * 0.14, T * 0.36, T * 0.28);
  ctx.fillStyle = "#a8a89e"; ctx.fillRect(-T * 0.14, -T * 0.10, T * 0.28, T * 0.20);
  ctx.fillStyle = "#c0c0b6"; ctx.fillRect(-T * 0.14, T * 0.02, T * 0.28, T * 0.08);
  ctx.strokeStyle = "#c8c6bc"; ctx.lineWidth = 1.5; ctx.strokeRect(-T * 0.18, -T * 0.14, T * 0.36, T * 0.28);
};

// 灰色的门 -> Level 485
window.PROP_DRAW["graydoor484"] = function (ctx, p, T) {
  const w = T * 0.64, h = T * 0.88;
  ctx.fillStyle = "#8a8a84"; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#9c9c96"; ctx.fillRect(-w / 2 + 2, -h / 2 + 2, w - 4, h - 4);
  ctx.strokeStyle = "#6a6a64"; ctx.lineWidth = 1.4;
  ctx.strokeRect(-w / 2 + 5, -h / 2 + 5, w - 10, h * 0.36);
  ctx.strokeRect(-w / 2 + 5, -h * 0.02, w - 10, h * 0.40);
  ctx.fillStyle = "#d8d8d0";
  ctx.beginPath(); ctx.arc(w * 0.25, 0, T * 0.05, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#4a4a46"; ctx.lineWidth = 2; ctx.strokeRect(-w / 2, -h / 2, w, h);
};
