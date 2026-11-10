// ===========================================================
// Level 289 —— 过载（又称 Level -2）
// 四个子区，互相之间缺乏显著的联系：
//   水池        —— 未完工的地下室，被（不能喝的）浑水淹没，走廊永远直角转弯
//   荧火大厅    —— 蓝焰提灯照着的维多利亚式长廊，会变色，偶尔变红
//   深渊        —— 亮如白昼的虚空，散落着厨房；竖井跳下去能回水池
//   卡夫卡式迷宫 —— 紫色树篱的迷宫，天是蓝的，草是紫的
// 入口：Level 13 的一面黄墙 / Level 19 一扇被毁坏的门
// 出口：一排阶梯通往天堂（Level 14）
// ===========================================================
"use strict";

(function () {
  const v = ["#6a6250", "#5a5344", "#4a4438"];
  if (typeof regTile === "function") regTile("overload", v);
  else { (window.__NEWTILE_EXTRA = window.__NEWTILE_EXTRA || {})["overload"] = v; }
})();

function generateOverloadMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const props = [];
  // 四个子区横着排：each 的宽度
  const ZW = Math.floor((size - 6) / 4);
  const zones = [];
  for (let i = 0; i < 4; i++) zones.push({ i, x0: 2 + i * ZW, x1: 2 + (i + 1) * ZW - 2 });
  // 每格属于自己的区（用于地面/墙的上色）
  const zoneTint = new Map();
  // 每格属于第几个区（脚步声按区区分：水 / 地毯 / 硬地 / 草地）
  const zoneOf = new Map();
  // 水池里的浑水（走得到，但喝不得）
  const water289 = new Set();
  // 深渊周围的虚空（走不进去）
  const void289 = new Set();
  // 树篱（迷宫的墙）
  const hedge289 = new Set();

  const TINT = {
    0: { f: "#5d5a4a", w: "#4b483a" },    // 水池：浑浊的混凝土
    1: { f: "#7a8fb0", w: "#5d6f8e" },    // 荧火大厅：被蓝焰染过的白地毯
    2: { f: "#dfe4e6", w: "#c6ccd0" },    // 深渊：亮如白昼
    3: { f: "#8a6fa8", w: "#5e4a78" },    // 卡夫卡：紫草地 / 紫树篱
  };

  const inZone = (x, i) => x >= zones[i].x0 && x <= zones[i].x1;
  const carve = (x, y) => { if (x > 0 && y > 0 && x < size - 1 && y < size - 1) grid[y][x] = 0; };

  // ---------- 区 0 · 水池：直角转弯的窄走廊 ----------
  {
    const z = zones[0];
    const step = 7;
    for (let y = 3; y < size - 3; y++) for (let x = z.x0; x <= z.x1; x++) if (y % step === 3) carve(x, y);
    for (let x = z.x0 + 2; x <= z.x1; x += step) for (let y = 3; y < size - 3; y++) carve(x, y);
    // 拐角补齐：只留直角，不留斜的
    for (let y = 3; y < size - 3; y += step) {
      for (let x = z.x0 + 2; x <= z.x1; x += step) { carve(x, y); carve(x, y + 1); }
    }
    for (let y = 4; y < size - 3; y++) for (let x = z.x0; x <= z.x1; x++) {
      if (grid[y][x] === 0) water289.add(x + "," + y);
    }
  }
  // ---------- 区 1 · 荧火大厅：环状的长廊 ----------
  {
    const z = zones[1];
    const cx = Math.floor((z.x0 + z.x1) / 2), cy = Math.floor(size / 2);
    const rw = Math.floor((z.x1 - z.x0) / 2) - 2, rh = Math.floor(size / 2) - 6;
    for (let a = 0; a < 4; a++) {
      const y0 = a < 2 ? cy - rh : cy + rh;
      for (let x = cx - rw; x <= cx + rw; x++) { carve(x, y0); carve(x, y0 + (a % 2 ? 1 : -1)); }
      const x0 = a < 2 ? cx - rw : cx + rw;
      for (let y = cy - rh; y <= cy + rh; y++) { carve(x0, y); carve(x0 + (a % 2 ? 1 : -1), y); }
    }
    // 环里面也铺开：一片巨大的空间
    for (let y = cy - rh + 3; y <= cy + rh - 3; y++) for (let x = cx - rw + 3; x <= cx + rw - 3; x++) carve(x, y);
  }
  // ---------- 区 2 · 深渊：亮如白昼，散落着厨房 ----------
  {
    const z = zones[2];
    for (let y = 4; y < size - 4; y++) for (let x = z.x0; x <= z.x1; x++) carve(x, y);
    // 周围的虚空：把这一区的上下边缘挖成不可进入的黑
    for (let x = z.x0; x <= z.x1; x++) for (let y = 1; y < 4; y++) void289.add(x + "," + y);
  }
  // ---------- 区 3 · 卡夫卡式迷宫：紫色树篱 ----------
  {
    const z = zones[3];
    for (let y = 4; y < size - 4; y++) for (let x = z.x0; x <= z.x1; x++) carve(x, y);
    // 迷宫：竖着的树篱墙，隔一格一道，中间随机开口
    for (let x = z.x0 + 2; x <= z.x1 - 1; x += 3) {
      for (let y = 5; y < size - 5; y++) {
        if ((y + x) % 5 === 0) continue;               // 留一个缺口
        if (grid[y][x] === 0) { grid[y][x] = 1; hedge289.add(x + "," + y); }
      }
    }
  }
  // ---------- 区与区之间的通道 ----------
  // 这一段走过一次弯路：通道只从上一区的边缘挖到下一区的边缘，
  // 而两区的地板都不贴着自己的边界（水池是走廊网格、荧火大厅是环廊），
  // 于是四条区各自孤立 —— 全层 90% 是走不到的死区，出口一个都够不着。
  // 现在两头都往里多伸几格，并且把 y 落在水池那条横向走廊的行上（y%7===3）。
  const passes = [];
  const STEP0 = 7;
  for (let i = 0; i < 3; i++) {
    let y = Math.floor(size / 2) + ((i % 2) ? 9 : -9);
    while (((y % STEP0) + STEP0) % STEP0 !== 3) y++;      // 对齐到水池的横向走廊行
    const xa = zones[i].x1 - 2;                            // 伸进上一区
    const xb = zones[i + 1].x0 + 6;                        // 伸进下一区
    for (let x = xa; x <= xb; x++) for (let d = -1; d <= 1; d++) carve(x, y + d);
    passes.push({ from: i, to: i + 1, x: xa + 1, y });
  }

  // 上色表：先按 x 归属分区，写进 zoneTint
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let zi = -1;
    for (let i = 3; i >= 0; i--) if (x >= zones[i].x0 - 1 && x <= zones[i].x1 + 1) { zi = i; break; }
    if (zi >= 0) { zoneTint.set(x + "," + y, TINT[zi]); zoneOf.set(x + "," + y, zi); }
  }

  const floors = collectFloors(grid, size);
  // 出生点必须落在真正的地板上 —— 水池是走廊网格，随便取一格大概率在墙里，
  // 人一出生就卡住。取横向走廊行（y%7===3）与纵向走廊（x=z.x0+2）的交点。
  let sy0 = Math.floor(size / 2);
  while (sy0 % 7 !== 3) sy0++;
  const start = { x: zones[0].x0 + 2, y: sy0, floor: 0 };

  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return null;
    if (grid[y][x] !== 0) return null;
    const p = Object.assign({ x, y, floor: 0, type }, extra || {});
    props.push(p);
    return p;
  };

  // ---------- 区 0 的物件：脚手架 / 水管 / 通风口 / 橙黄灯泡 / 裸露电线 / 车库门 / 湿箱子 ----------
  {
    const z = zones[0];
    for (let i = 0; i < 22; i++) put(randInt(z.x0, z.x1), randInt(4, size - 5), "p289scaffold");
    for (let i = 0; i < 16; i++) put(randInt(z.x0, z.x1), randInt(4, size - 5), "p289pipe");
    for (let i = 0; i < 10; i++) put(randInt(z.x0, z.x1), randInt(4, size - 5), "p289vent");
    for (let i = 0; i < 14; i++) put(randInt(z.x0, z.x1), randInt(4, size - 5), "p289bulb");
    for (let i = 0; i < 9; i++) put(randInt(z.x0, z.x1), randInt(4, size - 5), "p289wire");
    for (let i = 0; i < 4; i++) put(randInt(z.x0, z.x1), randInt(4, size - 5), "p289garage");
    for (let i = 0; i < 7; i++) put(randInt(z.x0, z.x1), randInt(4, size - 5), "p289crate");
  }
  // ---------- 区 1 的物件：蓝焰提灯 / 柱子 / 肖像 / 花形装饰 ----------
  {
    const z = zones[1];
    for (let i = 0; i < 20; i++) put(randInt(z.x0, z.x1), randInt(4, size - 5), "p289lantern");
    for (let i = 0; i < 14; i++) put(randInt(z.x0, z.x1), randInt(4, size - 5), "p289pillar");
    for (let i = 0; i < 10; i++) put(randInt(z.x0, z.x1), randInt(4, size - 5), "p289portrait");
    for (let i = 0; i < 8; i++) put(randInt(z.x0, z.x1), randInt(4, size - 5), "p289bloom");
  }
  // ---------- 区 2 的物件：厨房残块 + 竖井（跳下去回水池） ----------
  {
    const z = zones[2];
    for (let i = 0; i < 12; i++) put(randInt(z.x0, z.x1), randInt(6, size - 7), "p289tile");
    for (let i = 0; i < 8; i++) put(randInt(z.x0, z.x1), randInt(6, size - 7), "p289counter");
    for (let i = 0; i < 9; i++) put(randInt(z.x0, z.x1), randInt(6, size - 7), "p289appliance");
    // 竖井：跳下去就回到水池
    put(z.x0 + 4, Math.floor(size / 2) - 14, "p289shaft", { toLevel: null, back: true });
    put(z.x1 - 4, Math.floor(size / 2) + 14, "p289shaft", { toLevel: null, back: true });
  }
  // ---------- 区 3 的物件：树叶雕像 / 时钟石 / 空基座 ----------
  {
    const z = zones[3];
    for (let i = 0; i < 9; i++) put(randInt(z.x0, z.x1), randInt(5, size - 6), "p289statue");
    for (let i = 0; i < 7; i++) put(randInt(z.x0, z.x1), randInt(5, size - 6), "p289clock");
    for (let i = 0; i < 6; i++) put(randInt(z.x0, z.x1), randInt(5, size - 6), "p289plinth");
  }
  // ---------- 出口：一排阶梯通往天堂 ----------
  {
    const z = zones[2];
    put(Math.floor((z.x0 + z.x1) / 2), 6, "p289stairs", { toLevel: 14 });
    const z3 = zones[3];
    put(Math.floor((z3.x0 + z3.x1) / 2), 6, "p289stairs", { toLevel: 14 });
  }
  // 通道口（单向：过去了就回不来）
  for (const ps of passes) put(ps.x, ps.y, "p289pass", { from: ps.from, to: ps.to });

  // ---------- 通往前战地医院的楼梯（→ 14h）----------
  // 档案里 Level 14（战地医院）唯一已知的入口，就是 Level 289 里的一处楼梯。
  // 位置不能随手挑 —— 四个子区的地板并不都连着出生点，随便放可能放到走不到的
  // 孤岛上。所以先洪泛一次，只在真正走得通的格子里挑一个离得最远的。
  {
    const seen = new Set([start.x + "," + start.y]);
    const q = [[start.x, start.y]];
    while (q.length) {
      const [cx, cy] = q.pop();
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = cx + dx, ny = cy + dy;
        if (nx < 1 || ny < 1 || nx >= size - 1 || ny >= size - 1) continue;
        const k = nx + "," + ny;
        if (seen.has(k) || grid[ny][nx] !== 0) continue;
        seen.add(k); q.push([nx, ny]);
      }
    }
    let best = null, bd = -1;
    for (const k of seen) {
      const [sx, sy] = k.split(",").map(Number);
      const d = Math.abs(sx - start.x) + Math.abs(sy - start.y);
      if (d > bd) { bd = d; best = [sx, sy]; }
    }
    if (best) put(best[0], best[1], "stairs289h", { toLevel: "14h" });
  }

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [],
    zoneTint, zoneOf, water289, void289, hedge289, zones, passes,
  };
  map.spawnPts = [start];
  return map;
}
window.generateOverloadMap = generateOverloadMap;

// ---------- 地面：四个子区各有各的颜色 ----------
window.drawOverloadFloor = function (ctx, px, py, S, map, tx, ty) {
  const k = tx + "," + ty;
  if (map.void289 && map.void289.has(k)) {
    ctx.fillStyle = "#101216"; ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(120,140,160,0.10)"; ctx.fillRect(px, py, S, Math.max(2, S * 0.12));
    return true;
  }
  const t = (map.zoneTint && map.zoneTint.get(k)) || null;
  ctx.fillStyle = t ? t.f : "#6a6250";
  ctx.fillRect(px, py, S, S);
  if (map.water289 && map.water289.has(k)) {
    // 浑水：高浓度的铁锈、污垢 —— 是锈色，不是干净的蓝
    ctx.fillStyle = "rgba(120,86,52,0.62)"; ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(200,164,110,0.22)";
    ctx.fillRect(px, py + ((tx * 3 + ty * 5) % 3) * (S / 3), S, Math.max(2, S * 0.12));
  }
  if (map.hedge289 && map.hedge289.has(k)) {
    ctx.fillStyle = "#5e4a78"; ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(180,140,220,0.28)"; ctx.fillRect(px, py, S, Math.max(2, S * 0.2));
  }
  ctx.strokeStyle = "rgba(0,0,0,0.10)"; ctx.lineWidth = 1;
  ctx.strokeRect(px + 0.5, py + 0.5, S - 1, S - 1);
  return true;
};

// ---------- 墙体：同样按子区上色（不黑、也不是管道）----------
window.drawOverloadWall = function (ctx, px, py, S, map, tx, ty) {
  const k = tx + "," + ty;
  if (map.hedge289 && map.hedge289.has(k)) {
    // 树篱：紫色的一排叶子
    ctx.fillStyle = "#4a3862"; ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "#7a5c9e";
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.ellipse(px + S * (0.25 + i * 0.25), py + S * (i % 2 ? 0.68 : 0.32), S * 0.17, S * 0.13, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    return true;
  }
  const t = (map.zoneTint && map.zoneTint.get(k)) || null;
  ctx.fillStyle = t ? t.w : "#4a4438";
  ctx.fillRect(px, py, S, S);
  ctx.fillStyle = "rgba(255,255,255,0.10)"; ctx.fillRect(px, py, S, Math.max(2, S * 0.14));
  ctx.fillStyle = "rgba(0,0,0,0.30)"; ctx.fillRect(px, py + S - Math.max(2, S * 0.12), S, Math.max(2, S * 0.12));
  return true;
};

window.PROP_DRAW = window.PROP_DRAW || {};

window.PROP_DRAW["p289scaffold"] = function (ctx, p, T) {
  ctx.fillStyle = "#8a6a44"; ctx.fillRect(-T * 0.34, -T * 0.30, T * 0.10, T * 0.60);
  ctx.fillRect(T * 0.24, -T * 0.30, T * 0.10, T * 0.60);
  ctx.fillStyle = "#a08256"; ctx.fillRect(-T * 0.36, -T * 0.34, T * 0.72, T * 0.09);
  ctx.fillStyle = "#6e5436"; ctx.fillRect(-T * 0.36, -T * 0.02, T * 0.72, T * 0.07);
};
window.PROP_DRAW["p289pipe"] = function (ctx, p, T) {
  ctx.fillStyle = "#7d848c"; ctx.fillRect(-T * 0.44, -T * 0.08, T * 0.88, T * 0.16);
  ctx.fillStyle = "#575d64"; ctx.fillRect(-T * 0.44, -T * 0.08, T * 0.88, T * 0.05);
  ctx.fillStyle = "#9aa2aa"; ctx.fillRect(-T * 0.08, -T * 0.12, T * 0.16, T * 0.24);
};
window.PROP_DRAW["p289vent"] = function (ctx, p, T) {
  ctx.fillStyle = "#5f666e"; ctx.fillRect(-T * 0.30, -T * 0.24, T * 0.60, T * 0.48);
  ctx.strokeStyle = "#3d434a"; ctx.lineWidth = 1.5;
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath(); ctx.moveTo(-T * 0.26, -T * 0.20 + i * T * 0.12); ctx.lineTo(T * 0.26, -T * 0.20 + i * T * 0.12); ctx.stroke();
  }
};
window.PROP_DRAW["p289bulb"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  const on = (((p.x || 0) * 7 + (p.y || 0) * 3 + Math.floor(t * 0.7)) % 11) !== 0;
  ctx.strokeStyle = "#4a5058"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, -T * 0.42); ctx.lineTo(0, -T * 0.30); ctx.stroke();
  ctx.fillStyle = on ? "#f2c268" : "#6a6252";
  ctx.beginPath(); ctx.arc(0, -T * 0.22, T * 0.11, 0, Math.PI * 2); ctx.fill();
  if (on) {
    const g = ctx.createRadialGradient(0, -T * 0.20, 1, 0, -T * 0.20, T * 0.40);
    g.addColorStop(0, "rgba(250,200,110,0.42)"); g.addColorStop(1, "rgba(250,200,110,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -T * 0.20, T * 0.40, 0, Math.PI * 2); ctx.fill();
  }
};
// 裸露电线：碰到就是一次电击
window.PROP_DRAW["p289wire"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  const spark = ((Math.floor(t * 3) + (p.x || 0)) % 5) === 0;
  ctx.strokeStyle = "#2b2b30"; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-T * 0.40, -T * 0.26); ctx.quadraticCurveTo(0, T * 0.16, T * 0.40, -T * 0.24);
  ctx.stroke();
  if (spark) {
    ctx.strokeStyle = "#fff3b0"; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -T * 0.10); ctx.lineTo(-T * 0.10, T * 0.06); ctx.lineTo(T * 0.08, -T * 0.02);
    ctx.stroke();
  }
};
window.PROP_DRAW["p289garage"] = function (ctx, p, T) {
  ctx.fillStyle = "#6b6f74"; ctx.fillRect(-T * 0.42, -T * 0.36, T * 0.84, T * 0.72);
  ctx.strokeStyle = "#4c5055"; ctx.lineWidth = 1.5;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath(); ctx.moveTo(-T * 0.38, -T * 0.28 + i * T * 0.16); ctx.lineTo(T * 0.38, -T * 0.28 + i * T * 0.16); ctx.stroke();
  }
  ctx.fillStyle = "#3a3d42"; ctx.fillRect(-T * 0.42, T * 0.30, T * 0.84, T * 0.06);
};
window.PROP_DRAW["p289crate"] = function (ctx, p, T) {
  ctx.fillStyle = "#6e6046"; ctx.fillRect(-T * 0.32, -T * 0.28, T * 0.64, T * 0.56);
  ctx.fillStyle = "#7f7052"; ctx.fillRect(-T * 0.32, -T * 0.28, T * 0.64, T * 0.10);
  ctx.strokeStyle = "#4a4030"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-T * 0.32, 0); ctx.lineTo(T * 0.32, 0); ctx.stroke();
  ctx.fillStyle = "rgba(120,86,52,0.5)"; ctx.fillRect(-T * 0.32, T * 0.14, T * 0.64, T * 0.14);
};
// 蓝焰提灯：整个大厅都是被它照蓝的
window.PROP_DRAW["p289lantern"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  const pl = 0.6 + 0.4 * Math.sin(t * 1.5 + (p.x || 0));
  const red = (((p.x || 0) + Math.floor(t * 0.25)) % 17) === 0;   // 小概率变红
  ctx.fillStyle = "#4a4f57"; ctx.fillRect(-T * 0.10, -T * 0.30, T * 0.20, T * 0.60);
  ctx.fillStyle = red ? "#a8302c" : "#3f6ea8";
  ctx.fillRect(-T * 0.16, -T * 0.44, T * 0.32, T * 0.30);
  ctx.fillStyle = red ? "rgba(240,90,70," + (0.5 * pl).toFixed(3) + ")"
                      : "rgba(110,180,255," + (0.5 * pl).toFixed(3) + ")";
  ctx.beginPath(); ctx.ellipse(0, -T * 0.30, T * 0.09, T * 0.14, 0, 0, Math.PI * 2); ctx.fill();
  const g = ctx.createRadialGradient(0, -T * 0.28, 1, 0, -T * 0.28, T * 0.44);
  g.addColorStop(0, red ? "rgba(255,80,60,0.34)" : "rgba(90,160,255,0.34)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -T * 0.28, T * 0.44, 0, Math.PI * 2); ctx.fill();
};
window.PROP_DRAW["p289pillar"] = function (ctx, p, T) {
  ctx.fillStyle = "#c9c4bb"; ctx.fillRect(-T * 0.16, -T * 0.40, T * 0.32, T * 0.80);
  ctx.fillStyle = "#ded9d0"; ctx.fillRect(-T * 0.16, -T * 0.40, T * 0.10, T * 0.80);
  ctx.fillStyle = "#a8a49c"; ctx.fillRect(-T * 0.22, -T * 0.46, T * 0.44, T * 0.08);
  ctx.fillStyle = "#a8a49c"; ctx.fillRect(-T * 0.22, T * 0.38, T * 0.44, T * 0.08);
};
window.PROP_DRAW["p289portrait"] = function (ctx, p, T) {
  ctx.fillStyle = "#8a6a3a"; ctx.fillRect(-T * 0.26, -T * 0.30, T * 0.52, T * 0.60);
  ctx.fillStyle = "#3b3a44"; ctx.fillRect(-T * 0.20, -T * 0.24, T * 0.40, T * 0.48);
  ctx.fillStyle = "#c8b48c";                                   // 一张认不出五官的脸
  ctx.beginPath(); ctx.ellipse(0, -T * 0.06, T * 0.11, T * 0.14, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#5a5468"; ctx.fillRect(-T * 0.16, T * 0.10, T * 0.32, T * 0.14);
};
window.PROP_DRAW["p289bloom"] = function (ctx, p, T) {
  ctx.fillStyle = "#b0a8c0";
  for (let i = 0; i < 6; i++) {
    const a = i * Math.PI / 3;
    ctx.beginPath();
    ctx.ellipse(Math.cos(a) * T * 0.16, Math.sin(a) * T * 0.16, T * 0.11, T * 0.07, a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#e0d8ee"; ctx.beginPath(); ctx.arc(0, 0, T * 0.07, 0, Math.PI * 2); ctx.fill();
};
window.PROP_DRAW["p289tile"] = function (ctx, p, T) {
  ctx.fillStyle = "#e6e9ea"; ctx.fillRect(-T * 0.44, -T * 0.44, T * 0.88, T * 0.88);
  ctx.strokeStyle = "#c2c7c9"; ctx.lineWidth = 1;
  for (let i = 1; i < 3; i++) {
    ctx.beginPath(); ctx.moveTo(-T * 0.44 + i * T * 0.29, -T * 0.44); ctx.lineTo(-T * 0.44 + i * T * 0.29, T * 0.44); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-T * 0.44, -T * 0.44 + i * T * 0.29); ctx.lineTo(T * 0.44, -T * 0.44 + i * T * 0.29); ctx.stroke();
  }
};
window.PROP_DRAW["p289counter"] = function (ctx, p, T) {
  ctx.fillStyle = "#9aa0a4"; ctx.fillRect(-T * 0.42, -T * 0.18, T * 0.84, T * 0.36);
  ctx.fillStyle = "#c4c9cc"; ctx.fillRect(-T * 0.42, -T * 0.24, T * 0.84, T * 0.08);
  ctx.fillStyle = "#6d7377"; ctx.fillRect(-T * 0.34, T * 0.06, T * 0.68, T * 0.10);
};
window.PROP_DRAW["p289appliance"] = function (ctx, p, T) {
  const fr = ((p.x || 0) + (p.y || 0)) % 2 === 0;
  ctx.fillStyle = "#c8ccce"; ctx.fillRect(-T * 0.26, -T * 0.38, T * 0.52, T * 0.76);
  ctx.strokeStyle = "#9aa0a4"; ctx.lineWidth = 1.5;
  ctx.strokeRect(-T * 0.26, -T * 0.38, T * 0.52, T * 0.76);
  if (fr) {                                       // 冰柜：一道横把手
    ctx.fillStyle = "#7d8387"; ctx.fillRect(-T * 0.22, -T * 0.02, T * 0.44, T * 0.06);
  } else {                                        // 搅拌机：一个透明杯
    ctx.fillStyle = "rgba(190,220,230,0.75)"; ctx.fillRect(-T * 0.18, -T * 0.30, T * 0.36, T * 0.26);
    ctx.fillStyle = "#8a9094"; ctx.fillRect(-T * 0.20, -T * 0.04, T * 0.40, T * 0.14);
  }
};
// 竖井：跳下去回到水池
window.PROP_DRAW["p289shaft"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  const pl = 0.5 + 0.35 * Math.sin(t * 2);
  ctx.fillStyle = "#0a0c10";
  ctx.beginPath(); ctx.ellipse(0, 0, T * 0.40, T * 0.34, 0, 0, Math.PI * 2); ctx.fill();
  const g = ctx.createRadialGradient(0, 0, 1, 0, 0, T * 0.34);
  g.addColorStop(0, "rgba(120,86,52,0.55)"); g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, T * 0.30, T * 0.24, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "rgba(210,180,120," + pl.toFixed(3) + ")"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(0, 0, T * 0.40, T * 0.34, 0, 0, Math.PI * 2); ctx.stroke();
};
window.PROP_DRAW["p289statue"] = function (ctx, p, T) {
  ctx.fillStyle = "#6a8a52";                                   // 树叶做的雕像
  ctx.beginPath(); ctx.ellipse(0, -T * 0.10, T * 0.16, T * 0.26, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#7d9c62"; ctx.beginPath(); ctx.arc(0, -T * 0.34, T * 0.11, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#5a7448"; ctx.fillRect(-T * 0.14, T * 0.18, T * 0.28, T * 0.14);
};
window.PROP_DRAW["p289clock"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  ctx.fillStyle = "#8a8d92"; ctx.fillRect(-T * 0.34, -T * 0.34, T * 0.68, T * 0.68);
  ctx.fillStyle = "#e6e9ea"; ctx.beginPath(); ctx.arc(0, 0, T * 0.26, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#3a3d42"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(t * 0.8) * T * 0.18, Math.sin(t * 0.8) * T * 0.18); ctx.stroke();
  ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(t * 0.13) * T * 0.12, Math.sin(t * 0.13) * T * 0.12); ctx.stroke();
};
// 空基座：上面没有雕像，只有一块写着 Shavic 的青铜铭牌
window.PROP_DRAW["p289plinth"] = function (ctx, p, T) {
  ctx.fillStyle = "#9a9da2"; ctx.fillRect(-T * 0.26, -T * 0.06, T * 0.52, T * 0.36);
  ctx.fillStyle = "#b6b9be"; ctx.fillRect(-T * 0.30, -T * 0.14, T * 0.60, T * 0.10);
  ctx.fillStyle = "#8a6a34"; ctx.fillRect(-T * 0.18, -T * 0.02, T * 0.36, T * 0.12);
  ctx.fillStyle = "#d8b878";
  ctx.font = "bold " + Math.max(5, Math.round(T * 0.13)) + "px monospace";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("Shavic", 0, T * 0.04);
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
};
// 出口：一排阶梯通往天堂
window.PROP_DRAW["p289stairs"] = function (ctx, p, T) {
  ctx.fillStyle = "#dfe4e6";
  for (let i = 0; i < 4; i++) ctx.fillRect(-T * 0.42 + i * T * 0.05, -T * 0.30 + i * T * 0.16, T * 0.84 - i * T * 0.10, T * 0.14);
  ctx.fillStyle = "rgba(255,250,220,0.45)"; ctx.fillRect(-T * 0.42, -T * 0.34, T * 0.84, T * 0.06);
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  ctx.fillStyle = "rgba(255,250,210," + (0.30 + 0.25 * Math.sin(t * 1.6)).toFixed(3) + ")";
  ctx.fillRect(-T * 0.42, -T * 0.40, T * 0.84, T * 0.10);
};
// 区与区之间的通道口
window.PROP_DRAW["p289pass"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  const pl = 0.45 + 0.35 * Math.sin(t * 2.2);
  ctx.fillStyle = "rgba(20,22,26,0.85)"; ctx.fillRect(-T * 0.44, -T * 0.44, T * 0.88, T * 0.88);
  ctx.strokeStyle = "rgba(220,230,240," + pl.toFixed(3) + ")"; ctx.lineWidth = 2;
  ctx.strokeRect(-T * 0.40, -T * 0.40, T * 0.80, T * 0.80);
  ctx.fillStyle = "rgba(230,240,250,0.55)"; ctx.fillRect(-T * 0.30, -T * 0.06, T * 0.60, T * 0.10);
};

// ---------- Level 13 那面黄色的墙（289 的入口之一）----------
window.PROP_DRAW["wall289"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  const pl = 0.45 + 0.35 * Math.sin(t * 1.9);
  ctx.fillStyle = "#c8a83c"; ctx.fillRect(-T * 0.46, -T * 0.46, T * 0.92, T * 0.92);
  ctx.fillStyle = "#dcbe52"; ctx.fillRect(-T * 0.46, -T * 0.46, T * 0.92, T * 0.20);
  ctx.fillStyle = "rgba(120,96,20,0.35)";
  for (let i = 0; i < 4; i++) ctx.fillRect(-T * 0.46, -T * 0.30 + i * T * 0.22, T * 0.92, T * 0.03);
  // 墙面上那层"薄膜"感 —— 它会呼吸，看起来不像真的墙
  ctx.fillStyle = "rgba(255,240,170," + (0.18 + 0.18 * pl).toFixed(3) + ")";
  ctx.fillRect(-T * 0.46, -T * 0.46, T * 0.92, T * 0.92);
  ctx.strokeStyle = "rgba(255,248,200," + pl.toFixed(3) + ")"; ctx.lineWidth = 2;
  ctx.strokeRect(-T * 0.44, -T * 0.44, T * 0.88, T * 0.88);
};

// ---------- Level 19 那扇被毁坏的门（289 的入口之一）----------
window.PROP_DRAW["brokendoor289"] = function (ctx, p, T) {
  ctx.fillStyle = "#5a4a38"; ctx.fillRect(-T * 0.40, -T * 0.44, T * 0.80, T * 0.88);
  // 门框歪着：一边高一边低
  ctx.fillStyle = "#6e5a42";
  ctx.beginPath();
  ctx.moveTo(-T * 0.40, -T * 0.44); ctx.lineTo(T * 0.40, -T * 0.30);
  ctx.lineTo(T * 0.40, -T * 0.38); ctx.lineTo(-T * 0.40, -T * 0.52);
  ctx.closePath(); ctx.fill();
  // 门板早就不在了 —— 只剩一个黑洞洞的门洞
  ctx.fillStyle = "#14171c"; ctx.fillRect(-T * 0.30, -T * 0.34, T * 0.60, T * 0.72);
  const g = ctx.createRadialGradient(0, T * 0.10, 1, 0, T * 0.10, T * 0.30);
  g.addColorStop(0, "rgba(150,110,60,0.45)"); g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g; ctx.fillRect(-T * 0.30, -T * 0.34, T * 0.60, T * 0.72);
  // 歪在一边的门板
  ctx.save(); ctx.rotate(0.5);
  ctx.fillStyle = "#4a3c2c"; ctx.fillRect(T * 0.16, -T * 0.34, T * 0.22, T * 0.66);
  ctx.restore();
};
