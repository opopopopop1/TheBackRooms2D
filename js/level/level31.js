// ===========================================================
// Level 31 —— 旱冰场
//   一座无限循环的旱冰场。大多数人进来时落在旱冰区，进游戏厅的少。
//     旱冰区   —— 光滑的木地板，环状，无尽地绕；天花板排着彩色荧光灯，
//                 正中一盏星形灯。南侧 DJ 台里坐着一只温顺的无面灵在选曲。
//     游戏厅   —— 往东走。也是环状的。凭绿色卡片所有游戏免费玩。
//                 入口那台机器按一下蓝色按钮就吐卡。
//     美食广场 —— 顺着披萨和汽水的味道走。披萨、鸡翅、英尺长热狗、
//                 杏仁水。柜台后是一名穿员工制服、戴空白名牌的无面灵。
//     租赁处   —— 朝有蓝墙的区域走。柜台后有尺码对照表。由「教练」经营。
//     影院     —— 往北走，找到电视屏幕就是。三排金属长凳，一台大电视。
//   ===========================================================
//   教练是这一层唯一的"人"。他会记住你的名字，会劝你别待太久。
//   档案最后那十六篇条目是一个叫 Jonathan 的人留下的 ——
//   他在这一层待得太久，最后死在美食广场的角落里，死于脱水。
// ===========================================================
"use strict";

(function () {
  // 光滑木地板 / 黑地毯 / 蓝墙
  const v = ["#c68a4a", "#2a2a32", "#4a6fa8"];
  if (typeof regTile === "function") regTile("rink31", v);
  else { (window.__NEWTILE_EXTRA = window.__NEWTILE_EXTRA || {})["rink31"] = v; }
})();

function generateRink31Map(level) {
  const size = 84;
  const grid = makeGrid(size);
  const props = [];
  const floors = [];
  const carve = (x, y) => {
    if (x > 0 && y > 0 && x < size - 1 && y < size - 1) grid[y][x] = 0;
  };
  const wall = (x, y) => {
    if (x > 0 && y > 0 && x < size - 1 && y < size - 1) grid[y][x] = 1;
  };

  const cx = Math.floor(size / 2), cy = Math.floor(size / 2);

  // ---------- 旱冰区：中间一个大环（外圈是滑道，中间是内场） ----------
  const RX0 = 14, RX1 = size - 15, RY0 = 12, RY1 = size - 13;
  for (let y = RY0; y <= RY1; y++) for (let x = RX0; x <= RX1; x++) carve(x, y);
  // 内场：中间挖出一圈"岛"（旱冰场中央的地毯区），四边留滑道
  const IX0 = RX0 + 12, IX1 = RX1 - 12, IY0 = RY0 + 10, IY1 = RY1 - 10;
  for (let y = IY0; y <= IY1; y++) for (let x = IX0; x <= IX1; x++) wall(x, y);
  // 中央的星形灯底下留一小块（DJ 台）。
  // 这一小块四周全是内场的墙 —— 必须挖一条通道接到滑道上，
  // 否则它是个走不到的孤岛（实测 35 格）。
  for (let y = cy - 2; y <= cy + 2; y++) for (let x = cx - 3; x <= cx + 3; x++) carve(x, y);
  for (let x = cx + 3; x <= IX1 + 2; x++) carve(x, cy);

  // ---------- 四个方向的房间 ----------
  const mkRoom = (x0, y0, x1, y1, doorX, doorY, dirX, dirY) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) carve(x, y);
    // 从门口一路挖到旱冰区里（含旱冰区那一格）
    let x = doorX, y = doorY;
    for (let i = 0; i < 40; i++) {
      if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) break;
      carve(x, y);
      const inRink = (x >= RX0 && x <= RX1 && y >= RY0 && y <= RY1);
      if (inRink) break;
      x += dirX; y += dirY;
    }
    return { x0, y0, x1, y1 };
  };

  // 游戏厅：东
  const arcade = mkRoom(size - 12, cy - 12, size - 4, cy + 12, size - 13, cy, -1, 0);
  // 美食广场：南
  const food = mkRoom(cx - 14, size - 12, cx + 14, size - 4, cx, size - 13, 0, -1);
  // 旱冰鞋租赁处（蓝墙）：西
  const rental = mkRoom(4, cy - 9, 12, cy + 9, 13, cy, 1, 0);
  // 影院：北
  const cinema = mkRoom(cx - 12, 4, cx + 12, 12, cx, 13, 0, 1);

  collectFloorsInto31(grid, size, floors);

  // 出生点：旱冰区里靠边的一段
  const start = { x: RX0 + 2, y: cy, floor: 0 };

  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return null;
    if (grid[y][x] !== 0) return null;
    const p = Object.assign({ x, y, floor: 0, type }, extra || {});
    props.push(p);
    return p;
  };

  // ---------- 旱冰区 ----------
  put(cx, cy, "p31dj");                       // DJ 台里的无面灵
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    put(Math.round(cx + Math.cos(a) * 20), Math.round(cy + Math.sin(a) * 14), "p31skater");
  }
  // 矮小的木门 + 翻板（木地板与黑地毯之间）
  put(RX0 + 2, cy + 3, "p31flap");

  // ---------- 游戏厅 ----------
  put(arcade.x0 + 1, arcade.y0 + 1, "p31card");       // 绿色卡片机
  const ARCADE_GAMES = ["推球机", "大转盘", "气垫球台", "Q*bert", "Donkey Kong", "Space Invaders", "Fix-It Felix Jr"];
  for (let i = 0; i < 14; i++) {
    const gx = arcade.x0 + 2 + (i % 4) * 2;
    const gy = arcade.y0 + 3 + Math.floor(i / 4) * 4;
    put(gx, gy, "p31arcade", { game: ARCADE_GAMES[i % ARCADE_GAMES.length] });
  }
  // 标着 40 的那台 —— 玩它可以去 Level 40
  put(arcade.x1 - 2, arcade.y1 - 2, "p31arcade40", { toLevel: 40 });
  // 后台：那扇刻着 70 的白门
  put(arcade.x1 - 1, arcade.y0 + 2, "p31door70", { toLevel: 70 });

  // ---------- 美食广场 ----------
  put(food.x0 + 2, food.y0 + 1, "p31counter");        // 点餐台（无面灵员工）
  for (let i = 0; i < 6; i++) {
    put(food.x0 + 4 + i * 3, food.y0 + 4, "p31table");
    put(food.x0 + 4 + i * 3, food.y0 + 5, "p31stool");
  }
  put(food.x1 - 2, food.y0 + 1, "p31drink");          // 饮料机（杏仁水 + 汽水）
  put(food.x0 + 1, food.y1 - 2, "p31bin");            // 垃圾桶 + 告示牌

  // ---------- 旱冰鞋租赁处（蓝墙） ----------
  put(rental.x0 + 1, rental.y0 + 1, "p31coach");      // 教练
  put(rental.x0 + 3, rental.y0 + 1, "p31rental");     // 租赁柜台 + 尺码表
  for (let i = 0; i < 5; i++) put(rental.x0 + 1 + i, rental.y1 - 2, "p31skates");

  // ---------- 影院 ----------
  put(cinema.x0 + 2, cinema.y0 + 1, "p31tv");         // 大电视
  for (let r = 0; r < 3; r++) {
    for (let i = 0; i < 6; i++) put(cinema.x0 + 3 + i * 2, cinema.y0 + 4 + r * 2, "p31bench");
  }

  return {
    size, level: 31, doubleStory: false,
    layers: [grid], grid, rooms: [[]], floors: [floors],
    start, exit: null, doors: [], ramps: [],
    props, crates: [], ground: [],

    style: "rink31", tileName: "rink31",
    arcadeRect: arcade, foodRect: food, rentalRect: rental, cinemaRect: cinema,
    rink: { x0: RX0, y0: RY0, x1: RX1, y1: RY1 },
    greenCard: false,      // 领到绿色卡片了没
    coachTalk: 0,          // 和教练聊到第几句
  };
}
window.generateRink31Map = generateRink31Map;

function collectFloorsInto31(grid, size, out) {
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    if (grid[y][x] === 0) out.push({ x, y });
  }
  return out;
}

// ---------------- 地面 ----------------
// 旱冰区是光滑的木地板；四个房间是黑色地毯（影院是深灰）
window.drawRink31Floor = function (ctx, px, py, S, map, tx, ty) {
  const r = map.rink;
  const inRink = r && tx >= r.x0 && tx <= r.x1 && ty >= r.y0 && ty <= r.y1;
  if (inRink) {
    // 木地板：一条条木纹拼接，带反光
    const odd = ((tx + ty) % 2) === 0;
    ctx.fillStyle = odd ? "#c68a4a" : "#b87c40";
    ctx.fillRect(px, py, S, S);
    ctx.strokeStyle = "rgba(90,55,25,.35)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(px, py + 0.5); ctx.lineTo(px + S, py + 0.5); ctx.stroke();
    // 打蜡的反光
    ctx.fillStyle = "rgba(255,240,210,.16)";
    ctx.fillRect(px, py + 1, S, 2);
  } else {
    // 房间：黑色地毯，上面是彩色荧光灯的反光点
    ctx.fillStyle = "#2a2a32";
    ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(255,255,255,.05)";
    ctx.fillRect(px + S * 0.2, py + S * 0.2, S * 0.18, S * 0.18);
  }
  return true;
};

// ---------------- 墙 ----------------
window.drawRink31Wall = function (ctx, px, py, S, map, tx, ty) {
  // 蓝墙（租赁处那一带）／普通深色墙
  const rr = map.rentalRect;
  const near = rr && tx >= rr.x0 - 3 && tx <= rr.x1 + 3 && ty >= rr.y0 - 3 && ty <= rr.y1 + 3;
  ctx.fillStyle = near ? "#4a6fa8" : "#3a3a46";
  ctx.fillRect(px, py, S, S);
  // 墙裙反光条（旱冰场常见的那种）
  ctx.fillStyle = "rgba(255,255,255,.10)";
  ctx.fillRect(px, py + S * 0.78, S, 3);
  return true;
};

// ---------------- 环境：彩色荧光灯 + 星形灯 ----------------
window.drawRink31 = function (ctx, g) {
  const cw = (ctx.canvas && ctx.canvas.width) || 800;
  const ch = (ctx.canvas && ctx.canvas.height) || 600;
  const t = performance.now() / 1000;
  ctx.save();
  try { ctx.setTransform(1, 0, 0, 1, 0, 0); } catch (e) { /* 忽略 */ }
  // 天花板上的彩色荧光灯：慢慢转的彩色光斑
  const HUES = ["rgba(255,80,120,", "rgba(120,220,255,", "rgba(180,255,120,", "rgba(255,200,80,"];
  for (let i = 0; i < 4; i++) {
    const a = t * 0.35 + i * 1.7;
    const x = cw * (0.5 + Math.cos(a) * 0.34);
    const y = ch * (0.5 + Math.sin(a) * 0.30);
    const gr = ctx.createRadialGradient(x, y, 4, x, y, ch * 0.42);
    gr.addColorStop(0, HUES[i] + ".11)");
    gr.addColorStop(1, HUES[i] + "0)");
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, cw, ch);
  }
  // 中央的星形灯
  ctx.fillStyle = "rgba(255,246,220,.06)";
  ctx.beginPath(); ctx.arc(cw * 0.5, ch * 0.5, ch * 0.30, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
};

// ---------------- 物件 ----------------
window.PROP_DRAW = window.PROP_DRAW || {};

// DJ 台 + 里头的无面灵
window.PROP_DRAW["p31dj"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  const t = performance.now() / 1000;
  ctx.fillStyle = "#2e2e3a";
  ctx.fillRect(x + T * 0.08, y + T * 0.30, T * 0.84, T * 0.62);
  ctx.fillStyle = "#ded8ca";
  ctx.fillRect(x + T * 0.32, y + T * 0.12, T * 0.36, T * 0.30);
  ctx.fillStyle = "#5d6f8a";
  ctx.fillRect(x + T * 0.26, y + T * 0.40, T * 0.48, T * 0.24);
  // 唱盘在转
  ctx.fillStyle = "#1c1c24";
  ctx.beginPath(); ctx.arc(x + T * 0.30, y + T * 0.58, T * 0.10, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,.30)"; ctx.lineWidth = 1;
  const a = t * 3;
  ctx.beginPath();
  ctx.moveTo(x + T * 0.30, y + T * 0.58);
  ctx.lineTo(x + T * 0.30 + Math.cos(a) * T * 0.09, y + T * 0.58 + Math.sin(a) * T * 0.09);
  ctx.stroke();
};

// 独自滑来滑去的无面灵（顾客）
window.PROP_DRAW["p31skater"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#ded8ca";
  ctx.fillRect(x + T * 0.28, y + T * 0.14, T * 0.44, T * 0.34);
  ctx.fillStyle = "#6a7d99";
  ctx.fillRect(x + T * 0.22, y + T * 0.46, T * 0.56, T * 0.36);
  // 旱冰鞋
  ctx.fillStyle = "#e8e2d0";
  ctx.fillRect(x + T * 0.24, y + T * 0.80, T * 0.20, T * 0.10);
  ctx.fillRect(x + T * 0.56, y + T * 0.80, T * 0.20, T * 0.10);
};

// 矮小的木门 + 翻板（木地板与黑地毯之间）
window.PROP_DRAW["p31flap"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#8a6a44";
  ctx.fillRect(x + T * 0.10, y + T * 0.34, T * 0.80, T * 0.58);
  ctx.fillStyle = "#c9a06a";
  ctx.fillRect(x + T * 0.16, y + T * 0.42, T * 0.68, T * 0.42);
};

// 绿色卡片机
window.PROP_DRAW["p31card"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  const t = performance.now() / 1000;
  ctx.fillStyle = "#8e949b";
  ctx.fillRect(x + T * 0.14, y + T * 0.12, T * 0.72, T * 0.80);
  ctx.fillStyle = "#3a5fa8";
  ctx.beginPath(); ctx.arc(x + T / 2, y + T * 0.40, T * 0.18, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.35 + 0)" || "rgba(255,255,255,.35)";
  ctx.beginPath(); ctx.arc(x + T / 2 - 2, y + T * 0.36, T * 0.06, 0, Math.PI * 2); ctx.fill();
  // 出卡口（有卡片时会吐出来）
  ctx.fillStyle = "#20202a";
  ctx.fillRect(x + T * 0.28, y + T * 0.66, T * 0.44, T * 0.10);
  if (p.given) {
    ctx.fillStyle = "#3fbf6a";
    ctx.fillRect(x + T * 0.32, y + T * 0.68, T * 0.36, T * 0.06);
  }
};

// 街机
window.PROP_DRAW["p31arcade"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  const t = performance.now() / 1000;
  ctx.fillStyle = "#4a4458";
  ctx.fillRect(x + T * 0.14, y + T * 0.08, T * 0.72, T * 0.86);
  // 屏幕（画面在动）
  ctx.fillStyle = "#101018";
  ctx.fillRect(x + T * 0.22, y + T * 0.16, T * 0.56, T * 0.36);
  const c = ["#ff5a7a", "#5ad0ff", "#a8ff5a", "#ffd24a"][(p.x + Math.floor(t * 2)) % 4];
  ctx.fillStyle = c;
  const bx = x + T * 0.26 + ((Math.floor(t * 3) % 3) * T * 0.16);
  ctx.fillRect(bx, y + T * 0.22 + ((Math.floor(t * 2) % 3) * T * 0.09), T * 0.10, T * 0.08);
  // 按钮
  ctx.fillStyle = "#e05a5a";
  ctx.beginPath(); ctx.arc(x + T * 0.36, y + T * 0.64, T * 0.07, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#5a9ae0";
  ctx.beginPath(); ctx.arc(x + T * 0.60, y + T * 0.64, T * 0.07, 0, Math.PI * 2); ctx.fill();
};

// 标着 40 的那台
window.PROP_DRAW["p31arcade40"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  window.PROP_DRAW["p31arcade"](ctx, p, T);
  // 机身上那个大大的 40
  ctx.fillStyle = "#ffe680";
  ctx.font = "bold " + Math.max(9, Math.floor(T * 0.30)) + "px monospace";
  ctx.textAlign = "center";
  ctx.fillText("40", x + T / 2, y + T * 0.92);
  ctx.textAlign = "left";
};

// 后台那扇刻着 70 的白门
window.PROP_DRAW["p31door70"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#f0ece0";
  ctx.fillRect(x + T * 0.14, y + T * 0.08, T * 0.72, T * 0.86);
  ctx.fillStyle = "#6a6058";
  ctx.font = "bold " + Math.max(8, Math.floor(T * 0.26)) + "px monospace";
  ctx.textAlign = "center";
  ctx.fillText("70", x + T / 2, y + T * 0.58);
  ctx.textAlign = "left";
};

// 美食广场的点餐台（无面灵员工）
window.PROP_DRAW["p31counter"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#c98a4a";
  ctx.fillRect(x + T * 0.08, y + T * 0.36, T * 0.84, T * 0.56);
  ctx.fillStyle = "#efe6d4";
  ctx.fillRect(x + T * 0.08, y + T * 0.36, T * 0.84, 3);
  // 员工：白衬衫 + 空白名牌
  ctx.fillStyle = "#ded8ca";
  ctx.fillRect(x + T * 0.28, y + T * 0.10, T * 0.44, T * 0.30);
  ctx.fillStyle = "#5d6f8a";
  ctx.fillRect(x + T * 0.22, y + T * 0.38, T * 0.56, T * 0.22);
  ctx.fillStyle = "#f0ece0";
  ctx.fillRect(x + T * 0.60, y + T * 0.44, T * 0.16, T * 0.09);   // 空白名牌
};

// 餐桌 / 塑料凳
window.PROP_DRAW["p31table"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#d8cbb0";
  ctx.fillRect(x + T * 0.12, y + T * 0.26, T * 0.76, T * 0.50);
};
window.PROP_DRAW["p31stool"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#e07830";
  ctx.beginPath(); ctx.ellipse(x + T / 2, y + T * 0.52, T * 0.24, T * 0.18, 0, 0, Math.PI * 2); ctx.fill();
};

// 饮料机
window.PROP_DRAW["p31drink"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#9aa4b0";
  ctx.fillRect(x + T * 0.16, y + T * 0.10, T * 0.68, T * 0.84);
  ctx.fillStyle = "#20304a";
  ctx.fillRect(x + T * 0.24, y + T * 0.18, T * 0.52, T * 0.34);
  ctx.fillStyle = "#ffd24a";
  ctx.fillRect(x + T * 0.30, y + T * 0.24, T * 0.16, T * 0.20);   // 杏仁水
  ctx.fillStyle = "#e05050";
  ctx.fillRect(x + T * 0.52, y + T * 0.24, T * 0.16, T * 0.20);   // 汽水
};

// 垃圾桶 + 告示牌
window.PROP_DRAW["p31bin"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#5a5a66";
  ctx.fillRect(x + T * 0.24, y + T * 0.40, T * 0.52, T * 0.52);
  ctx.fillStyle = "#3a3a46";
  ctx.fillRect(x + T * 0.20, y + T * 0.34, T * 0.60, T * 0.08);
  ctx.fillStyle = "#f0ece0";
  ctx.fillRect(x + T * 0.16, y + T * 0.16, T * 0.68, T * 0.16);   // 告示牌
};

// 教练
window.PROP_DRAW["p31coach"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  const t = performance.now() / 1000;
  ctx.fillStyle = "#ded8ca";
  ctx.fillRect(x + T * 0.22, y + T * 0.08, T * 0.56, T * 0.34);   // 无面（空白）
  ctx.fillStyle = "#8a5a3a";
  ctx.fillRect(x + T * 0.18, y + T * 0.06, T * 0.64, T * 0.10);   // 棕色头发
  // 条纹教练服
  ctx.fillStyle = "#e8e2d0";
  ctx.fillRect(x + T * 0.14, y + T * 0.42, T * 0.72, T * 0.50);
  ctx.fillStyle = "#c04a4a";
  for (let i = 0; i < 4; i++) ctx.fillRect(x + T * 0.14, y + T * 0.46 + i * T * 0.11, T * 0.72, 3);
  // 名牌（上面写着「教练」）
  ctx.fillStyle = "#f0ece0";
  ctx.fillRect(x + T * 0.60, y + T * 0.56, T * 0.22, T * 0.10);
  // 他会自然地呼吸
  ctx.fillStyle = "rgba(255,255,255," + (0.05 + 0.03 * Math.sin(t * 1.6)).toFixed(3) + ")";
  ctx.fillRect(x + T * 0.14, y + T * 0.42, T * 0.72, T * 0.50);
};

// 租赁柜台 + 尺码对照表
window.PROP_DRAW["p31rental"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#8a6a44";
  ctx.fillRect(x + T * 0.08, y + T * 0.34, T * 0.84, T * 0.58);
  ctx.fillStyle = "#c9a06a";
  ctx.fillRect(x + T * 0.08, y + T * 0.34, T * 0.84, 3);
  // 墙上的尺码对照表
  ctx.fillStyle = "#f0ece0";
  ctx.fillRect(x + T * 0.20, y + T * 0.06, T * 0.60, T * 0.22);
  ctx.fillStyle = "#5a5a66";
  ctx.fillRect(x + T * 0.26, y + T * 0.10, T * 0.48, 2);
  ctx.fillRect(x + T * 0.26, y + T * 0.16, T * 0.40, 2);
};

// 旱冰鞋
window.PROP_DRAW["p31skates"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#e8e2d0";
  ctx.fillRect(x + T * 0.20, y + T * 0.48, T * 0.60, T * 0.24);
  ctx.fillStyle = "#4a4a56";
  ctx.fillRect(x + T * 0.24, y + T * 0.70, T * 0.52, T * 0.08);
  // 四个小轮子
  ctx.fillStyle = "#c94f4f";
  for (let i = 0; i < 4; i++) {
    ctx.beginPath(); ctx.arc(x + T * 0.28 + i * T * 0.14, y + T * 0.80, 2.4, 0, Math.PI * 2); ctx.fill();
  }
};

// 影院的大电视
window.PROP_DRAW["p31tv"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  const t = performance.now() / 1000;
  ctx.fillStyle = "#2a2a34";
  ctx.fillRect(x + T * 0.06, y + T * 0.10, T * 0.88, T * 0.78);
  // 屏幕：放的是进来的人最爱的那部片子（画面一直在变）
  const c = ["#4a7ac0", "#c07a4a", "#7ac04a", "#a04ac0"][Math.floor(t * 0.8) % 4];
  ctx.fillStyle = c;
  ctx.fillRect(x + T * 0.12, y + T * 0.16, T * 0.76, T * 0.60);
  ctx.fillStyle = "rgba(255,255,255,.18)";
  ctx.fillRect(x + T * 0.12, y + T * 0.16, T * 0.76, T * 0.06);
};

// 影院的长凳（一整块连续的金属件）
window.PROP_DRAW["p31bench"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#8e949b";
  ctx.fillRect(x + T * 0.04, y + T * 0.42, T * 0.92, T * 0.24);
  ctx.fillStyle = "rgba(255,255,255,.14)";
  ctx.fillRect(x + T * 0.04, y + T * 0.42, T * 0.92, 2);
};
