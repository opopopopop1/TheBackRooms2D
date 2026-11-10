// ===========================================================
// Level 10.1 —— 尸湖
// 一片完全人造的湖泊，剧毒 + 强辐射。入口在岸边，出口是原路返回。
// 布局：不是迷宫 —— 一整片开阔湖面 + 一圈可以走的岸，岸上有几间废弃棚屋。
// ===========================================================
"use strict";

function generateDeadLakeMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const props = [];
  const water = new Set();

  // 湖：中间一大片椭圆，边缘用噪声咬出不规则岸线
  const cx = size / 2, cy = size / 2;
  const rx = size * 0.36, ry = size * 0.32;
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      const d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
      const n = 0.10 * Math.sin(x * 0.35) * Math.cos(y * 0.29);
      if (d + n < 1) { grid[y][x] = 0; water.add(x + "," + y); }
    }
  }
  // 岸：外圈一圈可以站的路
  for (let a = 0; a < 360; a += 2) {
    const rad = a * Math.PI / 180;
    for (let r = 1; r <= 3; r++) {
      const x = Math.round(cx + Math.cos(rad) * (rx + 3 + r));
      const y = Math.round(cy + Math.sin(rad) * (ry + 3 + r));
      if (x > 1 && y > 1 && x < size - 2 && y < size - 2) { grid[y][x] = 0; water.delete(x + "," + y); }
    }
  }
  // 几间废弃棚屋（观察站遗迹）
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.5;
    const x = Math.round(cx + Math.cos(a) * (rx + 7)) - 2;
    const y = Math.round(cy + Math.sin(a) * (ry + 7)) - 2;
    if (x > 2 && y > 2 && x < size - 8 && y < size - 8) carveRoom(grid, size, x, y, 6, 5);
  }
  const floors = collectFloors(grid, size);
  const start = { x: Math.round(cx + rx + 6), y: Math.round(cy), floor: 0 };
  if (grid[start.y] && grid[start.y][start.x] === 1) grid[start.y][start.x] = 0;

  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return;
    if (grid[y][x] !== 0 || water.has(x + "," + y)) return;
    props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  };
  for (let i = 0; i < 16; i++) {
    const a = Math.random() * Math.PI * 2;
    put(Math.round(cx + Math.cos(a) * (rx + 5)), Math.round(cy + Math.sin(a) * (ry + 5)), "radbarrel");
  }
  for (let i = 0; i < 8; i++) {
    const a = Math.random() * Math.PI * 2;
    put(Math.round(cx + Math.cos(a) * (rx + 4)), Math.round(cy + Math.sin(a) * (ry + 4)), "warningsign");
  }

  // 出口（以前整层没有出口，进来就出不去）
  placeExitDoor(grid, size, start, props, { to: 10, label: "L10", tint: "#4a5a3a",
    tip: "一段干掉的岸 —— 从这儿能爬回麦田" });
  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [], water,
  };
  map.spawnPts = [start];
  return map;
}

window.PROP_DRAW = window.PROP_DRAW || {};

// 辐射废料桶：黄色圆桶 + 三叶辐射标志
window.PROP_DRAW["radbarrel"] = function (ctx, p, T) {
  const w = T * 0.46, h = T * 0.62;
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.32, w * 0.6, T * 0.10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#c8a828"; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#a88a1c"; ctx.fillRect(-w / 2, -h / 2, w, h * 0.10);
  ctx.fillStyle = "#8a7018"; ctx.fillRect(-w / 2, -h / 6, w, h * 0.09);
  ctx.fillRect(-w / 2, h * 0.22, w, h * 0.09);
  // 三叶标志
  ctx.fillStyle = "#20201c";
  for (let i = 0; i < 3; i++) {
    ctx.save(); ctx.rotate(i * Math.PI * 2 / 3);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, -T * 0.10, T * 0.07, -Math.PI / 2 - 0.6, -Math.PI / 2 + 0.6);
    ctx.closePath(); ctx.fill(); ctx.restore();
  }
  ctx.fillStyle = "#20201c";
  ctx.beginPath(); ctx.arc(0, 0, T * 0.035, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.5)"; ctx.lineWidth = 1.2; ctx.strokeRect(-w / 2, -h / 2, w, h);
};

// 警告牌：黄底黑边三角 + 感叹号
window.PROP_DRAW["warningsign"] = function (ctx, p, T) {
  const s = T * 0.62;
  ctx.fillStyle = "#3a3a3a"; ctx.fillRect(-2, 0, 4, T * 0.34);            // 立杆
  ctx.fillStyle = "#e0c020";
  ctx.beginPath(); ctx.moveTo(0, -s * 0.62); ctx.lineTo(s * 0.56, s * 0.34); ctx.lineTo(-s * 0.56, s * 0.34);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "#20201c"; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.fillStyle = "#20201c";
  ctx.fillRect(-s * 0.07, -s * 0.30, s * 0.14, s * 0.34);
  ctx.beginPath(); ctx.arc(0, s * 0.14, s * 0.08, 0, Math.PI * 2); ctx.fill();
};
