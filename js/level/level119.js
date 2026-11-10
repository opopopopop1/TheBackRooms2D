// ===========================================================
// Level 119 —— 普通的水上乐园
// 废弃的水上乐园。滑梯各有各的效果：
//   蓝->蓝色通道 红->派对客 黑白->立即死亡 黄->Level 0（最安全）
//   黑->笑魇 橙->2.2/蜂巢 粉->召唤派对客 灰->污物 米->终末
// 布局：几片泳池 + 环绕的走道 + 一排排滑梯 —— 开阔，不是迷宫。
// ===========================================================
"use strict";

const SLIDE_KINDS = [
  { c: "#3a7ad0", to: "bluechannel", tip: "蓝色滑梯 —— 总是把你送到蓝色通道" },
  { c: "#d03030", to: null, tip: "红色滑梯 —— 派对客大量出没，不明智" },
  { c: "#202020", to: null, tip: "黑白相间的滑梯 —— 立即死亡" },
  { c: "#e0c020", to: 0, tip: "黄色滑梯 —— 最安全，把你送到 Level 0" },
  { c: "#12121a", to: null, tip: "漆黑的滑梯 —— 大量的笑魇" },
  { c: "#e08020", to: null, tip: "橙色滑梯 —— 50% 去 Level 2.2 或蜂巢" },
  { c: "#e878c0", to: null, tip: "粉色滑梯 —— 会召唤 3~4 个派对客" },
  { c: "#8a8a80", to: null, tip: "灰色滑梯 —— 小孔里全是污物" },
  { c: "#c8b088", to: "601", tip: "米色滑梯 —— 把你送到终末，不明智" },
];

function generateWaterParkMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const props = [];
  const water = new Set();

  // 整片地面先挖空（乐园的走道）
  for (let y = 2; y < size - 2; y++) for (let x = 2; x < size - 2; x++) grid[y][x] = 0;
  // 挖几片泳池（矩形水池）
  const pools = [];
  for (let i = 0; i < 5; i++) {
    const w = randInt(7, 13), h = randInt(6, 10);
    const x = randInt(3, size - w - 4), y = randInt(3, size - h - 4);
    let ok = true;
    for (const q of pools) if (x < q.x + q.w + 2 && x + w + 2 > q.x && y < q.y + q.h + 2 && y + h + 2 > q.y) ok = false;
    if (!ok) continue;
    for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) water.add(xx + "," + yy);
    pools.push({ x, y, w, h });
  }
  const floors = collectFloors(grid, size);
  let start = floors[0] ? { x: floors[0].x, y: floors[0].y, floor: 0 } : { x: 4, y: 4, floor: 0 };
  // 出生点不能在水里
  for (const f of floors) if (!water.has(f.x + "," + f.y)) { start = { x: f.x, y: f.y, floor: 0 }; break; }

  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return;
    if (grid[y][x] !== 0) return;
    props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  };
  // 滑梯：成排立在池边。滑梯是一座 2×3 格的高塔，彼此至少隔 4 格 ——
  // 以前每座只占 1 格还随便撒，图上就是一堆一格大的小方块。
  const slideAt = [];
  for (let i = 0; i < 16; i++) {
    const k = SLIDE_KINDS[randInt(0, SLIDE_KINDS.length - 1)];
    const f = floors[randInt(0, floors.length - 1)];
    if (water.has(f.x + "," + f.y)) continue;
    let far = true;
    for (const s of slideAt) if (Math.abs(s.x - f.x) < 4 && Math.abs(s.y - f.y) < 4) { far = false; break; }
    if (!far) continue;
    slideAt.push({ x: f.x, y: f.y });
    put(f.x, f.y, "slide119", { col: k.c, toLevel: k.to, tip: k.tip });
  }
  // 泳池边的躺椅
  for (let i = 0; i < 18; i++) {
    const f = floors[randInt(0, floors.length - 1)];
    if (water.has(f.x + "," + f.y)) continue;
    put(f.x, f.y, "sunbed119");
  }
  // 不走滑梯的出口：走够远找到的玻璃滑门 -> Level 11
  put(size - 5, Math.floor(size / 2), "glassdoor119", { toLevel: 11 });

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

// 滑梯：一座 2 格宽、3 格高的塔 ——
// 左边是爬上去的阶梯，顶上是一小块平台，中间一条彩色管道斜着滑下来，
// 底下是溅着水的滑出口。以前只有一格大，看着就是个小方块。
window.PROP_DRAW["slide119"] = function (ctx, p, T) {
  const col = p.col || "#3a7ad0";
  const W = T * 0.92;          // 半宽（整座约 1.84 格）
  const TOP = -T * 1.45;       // 塔顶
  const BOT = T * 1.05;        // 滑出口

  // 整座塔投在地上的影子
  ctx.fillStyle = "rgba(0,0,0,0.26)";
  ctx.beginPath(); ctx.ellipse(0, BOT - T * 0.06, W * 0.95, T * 0.20, 0, 0, Math.PI * 2); ctx.fill();

  // ---- 支撑：四根立柱 + 两层横撑 ----
  ctx.fillStyle = "#8e959b";
  for (const sx of [-W * 0.82, -W * 0.30, W * 0.30, W * 0.82]) {
    ctx.fillRect(sx - 2.5, TOP + T * 0.30, 5, BOT - TOP - T * 0.30);
  }
  ctx.fillStyle = "#7d848a";
  ctx.fillRect(-W * 0.86, TOP + T * 0.95, W * 1.72, 4);
  ctx.fillRect(-W * 0.86, BOT - T * 0.42, W * 1.72, 4);
  // 斜撑
  ctx.strokeStyle = "#7d848a"; ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-W * 0.82, TOP + T * 0.30); ctx.lineTo(W * 0.82, BOT - T * 0.42);
  ctx.moveTo(W * 0.82, TOP + T * 0.30); ctx.lineTo(-W * 0.82, BOT - T * 0.42);
  ctx.stroke();

  // ---- 左侧阶梯：一级一级通到塔顶 ----
  const steps = 6;
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const y = TOP + T * 0.34 + t * (BOT - TOP - T * 0.62);
    const x = -W * 0.80 + t * W * 0.10;
    ctx.fillStyle = i % 2 ? "#b8bfc4" : "#a8afb4";
    ctx.fillRect(x - 6, y, W * 0.30, 5);
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fillRect(x - 6, y + 5, W * 0.30, 2);
  }
  // 阶梯扶手
  ctx.strokeStyle = "#6e757b"; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-W * 0.84, TOP + T * 0.26); ctx.lineTo(-W * 0.70, BOT - T * 0.30);
  ctx.stroke();

  // ---- 顶部平台 ----
  ctx.fillStyle = "#c2c9ce";
  ctx.fillRect(-W * 0.62, TOP, W * 1.24, T * 0.30);
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.fillRect(-W * 0.62, TOP, W * 1.24, 3);
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.fillRect(-W * 0.62, TOP + T * 0.30 - 3, W * 1.24, 3);
  // 平台护栏
  ctx.strokeStyle = "#8e959b"; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-W * 0.62, TOP - T * 0.16); ctx.lineTo(W * 0.62, TOP - T * 0.16);
  ctx.moveTo(-W * 0.62, TOP - T * 0.16); ctx.lineTo(-W * 0.62, TOP);
  ctx.moveTo(W * 0.62, TOP - T * 0.16); ctx.lineTo(W * 0.62, TOP);
  ctx.stroke();

  // ---- 彩色管道：从塔顶斜滑到右下 ----
  ctx.save();
  ctx.translate(-W * 0.30, TOP + T * 0.16);
  ctx.rotate(0.52);
  const L = Math.hypot(W * 1.05, BOT - TOP) * 1.02;
  const PH = T * 0.34;                       // 管道口径
  ctx.fillStyle = col;
  ctx.fillRect(0, -PH / 2, L, PH);
  ctx.fillStyle = "rgba(255,255,255,0.34)";
  ctx.fillRect(0, -PH / 2, L, PH * 0.30);    // 上沿高光
  ctx.fillStyle = "rgba(0,0,0,0.30)";
  ctx.fillRect(0, PH * 0.22, L, PH * 0.28);  // 下沿阴影
  // 分节
  ctx.strokeStyle = "rgba(0,0,0,0.30)"; ctx.lineWidth = 1.5;
  for (let i = 1; i < 7; i++) {
    const x = (L * i) / 7;
    ctx.beginPath(); ctx.moveTo(x, -PH / 2); ctx.lineTo(x, PH / 2); ctx.stroke();
  }
  ctx.restore();

  // ---- 滑出口：一小片水花 ----
  ctx.fillStyle = "rgba(120,190,210,0.55)";
  ctx.beginPath(); ctx.ellipse(W * 0.55, BOT - T * 0.10, T * 0.34, T * 0.13, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.30)";
  ctx.beginPath(); ctx.ellipse(W * 0.55, BOT - T * 0.14, T * 0.20, T * 0.06, 0, 0, Math.PI * 2); ctx.fill();
};

// 躺椅：可放倒的椅面 + 细支架
window.PROP_DRAW["sunbed119"] = function (ctx, p, T) {
  const w = T * 0.72, d = T * 0.34;
  ctx.fillStyle = "rgba(0,0,0,0.26)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.22, w * 0.5, d * 0.20, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#e8e4d8"; ctx.fillRect(-w / 2, -d / 2, w, d);
  ctx.fillStyle = "#c8c4b8"; ctx.fillRect(-w / 2, -d / 2, w, d * 0.22);
  ctx.save();
  ctx.translate(-w * 0.42, -d * 0.5); ctx.rotate(-0.5);
  ctx.fillStyle = "#e8e4d8"; ctx.fillRect(0, -d * 0.42, w * 0.30, d * 0.46);   // 靠背
  ctx.restore();
  ctx.fillStyle = "#8a8a84";
  ctx.fillRect(-w / 2 + 3, d / 2, 3, T * 0.12);
  ctx.fillRect(w / 2 - 6, d / 2, 3, T * 0.12);
};

// 玻璃滑门 -> Level 11
window.PROP_DRAW["glassdoor119"] = function (ctx, p, T) {
  const w = T * 0.92, h = T * 0.86;
  ctx.fillStyle = "#a8b8bc"; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "rgba(200,230,238,0.75)";
  ctx.fillRect(-w / 2 + 3, -h / 2 + 3, w * 0.46, h - 6);
  ctx.fillRect(w * 0.04, -h / 2 + 3, w * 0.46, h - 6);
  ctx.strokeStyle = "#7a8a8e"; ctx.lineWidth = 2; ctx.strokeRect(-w / 2, -h / 2, w, h);
  ctx.beginPath(); ctx.moveTo(0, -h / 2); ctx.lineTo(0, h / 2); ctx.stroke();
  ctx.fillStyle = "#e0e8ea";
  ctx.fillRect(-w * 0.10, 0, w * 0.20, 3);
};
