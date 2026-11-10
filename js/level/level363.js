// ===========================================================
// Level 363 —— 你作弊了
//   一个简朴、乏味的房间，跟你小时候在家里常睡的那间卧室一样：
//     墙壁的米色均匀抹开，褐灰色的混凝土基底构成地板。
//     没有任何家具，没有任何独特特征 —— 这种"特征的缺乏"本身就让人发凉。
//   唯一的显著特征：右侧墙上那扇**微微打开的白色木门** ——
//     它平淡得和房间本身一模一样，可它是这地方唯一像"出口"的东西。
//   ★ 房间很小：大约 5 x 4（长 x 宽），是那种"一眼就看完"的小卧室。
//   ★ 唯一那扇白色木门：在**左边最上面**（上墙的最左那一格）。
//   ★ 核心机制：平整的表面本该能让人切出到别的层级 —— 但在这里不行。
//     跑向墙、穿过去，抬起头看到的还是同一个房间（房间会循环）。
//     用杏仁水做地标也一样：罐头会跟着你一起回到原地。
//   ★ 时间线（进层后开始计时，无人撑过 11 分钟）：
//     30s  门口远处的黑暗里出现一只猎犬
//     45s  笑魇出现
//     60s  灯开始闪烁
//     120s 大量笑魇 / 猎犬 / 窃皮者涌进来
//     180s 灯完全失灵（一片黑）
//     300s 体力突然减少
//     600s 门开始关上
//     660s 死
//   入口：没有开启开发者权限的情况下数值异常变动 -> 这里；
//         开发者密钥界面输入 go363。
//   出口：这里没有出口，唯一的办法就是死亡。
// ===========================================================
"use strict";

(function () {
  // 地板：褐灰色的混凝土基底 / 墙：均匀抹开的米色（都不是黑的，也不是 Level 2 的管道）
  const v = ["#8c8478", "#cbc3ab"];
  if (typeof regTile === "function") regTile("cheat363", v);
  else { (window.__NEWTILE_EXTRA = window.__NEWTILE_EXTRA || {})["cheat363"] = v; }
})();

// 时间线：t = 进层后的秒数
const L363_EVENTS = [
  { t: 30,  key: "hound" },
  { t: 45,  key: "smiler" },
  { t: 60,  key: "flicker" },
  { t: 120, key: "swarm" },
  { t: 180, key: "blackout" },
  { t: 300, key: "drain" },
  { t: 600, key: "closing" },
  { t: 660, key: "dead" },
];
window.L363_EVENTS = L363_EVENTS;

function generateCheat363Map(level) {
  // 地图留得大：这样视野里填满的是米色的墙，而不是地图外的黑
  const size = 26;
  const grid = makeGrid(size);
  // 房间很小 —— 只有 5 x 4（长 x 宽）：这正是一间卧室的大小，也正因为小，才无处可躲
  const RW = 5, RH = 4;
  const RX = Math.floor((size - RW) / 2), RY = Math.floor((size - RH) / 2);
  carveRoom(grid, size, RX, RY, RW, RH);

  // 门在**左边最上面**：左墙最上那一格
  const DYY = RY;          // 最上面一行
  const GX = RX - 1;       // 左墙那一列
  const dark = new Set();
  if (GX >= 1 && GX < size - 1) { grid[DYY][GX] = 0; dark.add(GX + "," + DYY); }
  // 门外那一片"远处的黑暗"—— 猎犬就是从那里出现的
  for (let y = RY - 1; y <= RY + 1; y++) {
    for (let x = RX - 3; x <= RX - 2; x++) {
      if (x < 1 || x >= size - 1 || y < 1 || y >= size - 1) continue;
      grid[y][x] = 0;
      dark.add(x + "," + y);
    }
  }
  // 兜底：门与那片黑暗之间必须是通的
  if (grid[RY][RX - 2] === 1) { grid[RY][RX - 2] = 0; dark.add((RX - 2) + "," + RY); }

  const floors = collectFloors(grid, size);
  const start = { x: RX + 2, y: RY + 2, floor: 0 };

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [[{ x: RX, y: RY, w: RW, h: RH }]],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props: [], crates: [], ground: [],
    room363: { x: RX, y: RY, w: RW, h: RH },
    dark363: dark,
    // 那扇微微打开的白色木门 —— 左边最上面
    door363: { type: "door363", x: GX, y: DYY, floor: 0, open: 0.22, closing: false, dir: "left" },
    // 房间正中的吸顶灯（60s 开始闪，180s 彻底灭）
    lamp363: { type: "lamp363", x: RX + Math.floor(RW / 2), y: RY + 1, floor: 0 },
  };
  map.props.push(map.door363, map.lamp363);
  map.spawnPts = [start];
  return map;
}
window.generateCheat363Map = generateCheat363Map;

// ===========================================================
// 地面 / 墙体
// ===========================================================
window.drawCheat363Floor = function (ctx, px, py, S, map, tx, ty) {
  // 褐灰色的混凝土基底：带一点抹开的水泥纹（不是黑的）
  const h = ((tx * 73856093) ^ (ty * 19349663)) >>> 0;
  const n = ((h % 1000) / 1000);
  const g = 132 + Math.round(n * 14);
  ctx.fillStyle = "rgb(" + g + "," + (g - 8) + "," + (g - 22) + ")";
  ctx.fillRect(px, py, S + 1, S + 1);
  // 水泥抹面的走向
  ctx.strokeStyle = "rgba(0,0,0,0.05)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(px, py + S * (0.3 + n * 0.4));
  ctx.lineTo(px + S, py + S * (0.2 + n * 0.5));
  ctx.stroke();
  // 门后那片黑暗：地板也是暗的
  if (map && map.dark363 && map.dark363.has(tx + "," + ty)) {
    ctx.fillStyle = "rgba(6,6,10,0.82)";
    ctx.fillRect(px, py, S + 1, S + 1);
  }
  return true;
};

window.drawCheat363Wall = function (ctx, px, py, S, map, tx, ty) {
  // 均匀抹开的米色墙：连一道接缝都看不出来 —— 这正是能让人切出的"平整表面"
  const h = ((tx * 83492791) ^ (ty * 2971215073)) >>> 0;
  const n = ((h % 1000) / 1000);
  // 房间很小，房间之外的墙越远越暗（但没有暗到看不见 —— 那还是墙，不是黑块）
  let k = 0;
  const r = map && map.room363;
  if (r) {
    const dx = Math.max(r.x - tx, tx - (r.x + r.w - 1), 0);
    const dy = Math.max(r.y - ty, ty - (r.y + r.h - 1), 0);
    const d = Math.max(dx, dy);
    if (d > 1) k = Math.min(1, (d - 1) / 6);
  }
  const f = 1 - 0.45 * k;
  const g0 = 198 + Math.round(n * 10);
  const g = Math.round(g0 * f);
  ctx.fillStyle = "rgb(" + g + "," + Math.round((g0 - 8) * f) + "," + Math.round((g0 - 26) * f) + ")";
  ctx.fillRect(px, py, S + 1, S + 1);
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  ctx.fillRect(px, py, S + 1, Math.max(2, S * 0.18));
  return true;
};

// ===========================================================
// 整屏叠加：吸顶灯（会闪 / 会灭）+ 切出时的白光
// ===========================================================
window.drawCheat363Overlay = function (ctx, g) {
  if (!g) return;
  const cw = (ctx.canvas && ctx.canvas.width) || 800;
  const ch = (ctx.canvas && ctx.canvas.height) || 600;
  const t = performance.now() / 1000;
  ctx.save();
  try { ctx.setTransform(1, 0, 0, 1, 0, 0); } catch (e) { /* 忽略 */ }

  // ---- 吸顶灯 ----
  // 60s 之后开始闪：不规律地暗一下，暗的时间越来越长
  // 180s 之后完全失灵：只剩玩家自己那一点光
  let dim = 0;
  const T = g.t363 || 0;
  if (T >= 180) dim = 0.80;
  else if (T >= 60) {
    const k = (T - 60) / 120;                       // 0 -> 1，越往后越暗
    const f = Math.sin(t * (5 + k * 9)) * Math.sin(t * 1.7);
    dim = (f < -0.15 - k * 0.5) ? (0.30 + k * 0.45) : 0;
  }
  if (dim > 0) {
    ctx.fillStyle = "rgba(0,0,0," + dim.toFixed(3) + ")";
    ctx.fillRect(0, 0, cw, ch);
  }
  // 灯还亮着时：房间中央吊着一盏吸顶灯，地上有一圈光
  if (dim < 0.5 && g.map && g.map.lamp363 && g.cam) {
    const TILE_ = (typeof TILE === "number") ? TILE : 40;
    const sx = (g.map.lamp363.x + 0.5) * TILE_ - g.cam.x + cw / 2;
    const sy = (g.map.lamp363.y + 0.5) * TILE_ - g.cam.y + ch / 2;
    const rr = Math.max(cw, ch) * 0.34;
    const gr = ctx.createRadialGradient(sx, sy, 0, sx, sy, rr);
    gr.addColorStop(0, "rgba(255,246,214,0.20)");
    gr.addColorStop(0.5, "rgba(255,246,214,0.07)");
    gr.addColorStop(1, "rgba(255,246,214,0)");
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, cw, ch);
  }
  // ---- 切出：穿过去的一瞬间，整屏白一下 ----
  if (g.l363Flash > 0) {
    const a = Math.min(1, g.l363Flash / 0.35);
    ctx.fillStyle = "rgba(255,255,255," + (a * 0.85).toFixed(3) + ")";
    ctx.fillRect(0, 0, cw, ch);
  }
  // ---- 门在关：屏幕边缘一点点收紧的暗 ----
  if (g.l363Closing) {
    const k = Math.min(1, g.l363Closing);
    ctx.fillStyle = "rgba(0,0,0," + (k * 0.5).toFixed(3) + ")";
    const bw = Math.round(cw * 0.06 + k * cw * 0.16);
    const bh = Math.round(ch * 0.06 + k * ch * 0.16);
    ctx.fillRect(0, 0, cw, bh); ctx.fillRect(0, ch - bh, cw, bh);
    ctx.fillRect(0, 0, bw, ch); ctx.fillRect(cw - bw, 0, bw, ch);
  }
  ctx.restore();
};

// ===========================================================
// 物件
// ===========================================================
window.PROP_DRAW = window.PROP_DRAW || {};

// 那扇微微打开的白色木门 —— 这里唯一的"显著特征"
window.PROP_DRAW["door363"] = function (ctx, p, T) {
  const t = performance.now() / 1000;
  // 门开在左墙上：整个画法转 90 度，门框沿着墙走，厚度朝房间外
  ctx.save();
  if (p.dir === "left" || p.dir === "right") ctx.rotate(Math.PI / 2);
  // 门框
  ctx.fillStyle = "#e6e0cc";
  ctx.fillRect(-T * 0.46, -T * 0.50, T * 0.92, T * 1.00);
  // 门后的黑暗
  ctx.fillStyle = "#08080c";
  ctx.fillRect(-T * 0.38, -T * 0.44, T * 0.76, T * 0.92);
  // 门板：微微开着（closing 之后一点点合上）
  let op = (p.open != null ? p.open : 0.22);
  if (p.closing) op = Math.max(0, op - 0.10);
  const w = T * 0.76 * (1 - op);
  ctx.fillStyle = "#f2eeda";
  ctx.fillRect(-T * 0.38, -T * 0.44, w, T * 0.92);
  // 门板的木纹 + 门把手
  ctx.strokeStyle = "rgba(150,142,116,0.35)";
  ctx.lineWidth = 1;
  for (let i = 1; i <= 3; i++) {
    const xx = -T * 0.38 + (w * i) / 4;
    ctx.beginPath(); ctx.moveTo(xx, -T * 0.40); ctx.lineTo(xx, T * 0.44); ctx.stroke();
  }
  ctx.fillStyle = "#b9ae82";
  ctx.beginPath(); ctx.arc(w - T * 0.10, T * 0.04, T * 0.045, 0, Math.PI * 2); ctx.fill();
  // 门缝里透出来的那一点黑 —— 它在呼吸
  const br = 0.5 + Math.sin(t * 1.3) * 0.5;
  ctx.fillStyle = "rgba(0,0,0," + (0.25 + br * 0.25).toFixed(3) + ")";
  ctx.fillRect(w, -T * 0.44, T * 0.76 - w, T * 0.92);
  ctx.restore();
};

// 房间正中那盏吸顶灯
window.PROP_DRAW["lamp363"] = function (ctx, p, T) {
  const t = performance.now() / 1000;
  const g = (typeof game !== "undefined" && game) ? game : null;
  const Tm = g ? (g.t363 || 0) : 0;
  let on = 1;
  if (Tm >= 180) on = 0;
  else if (Tm >= 60) {
    const k = (Tm - 60) / 120;
    const f = Math.sin(t * (5 + k * 9)) * Math.sin(t * 1.7);
    on = (f < -0.15 - k * 0.5) ? 0.15 : 1;
  }
  ctx.fillStyle = "#d8d2bc";
  ctx.fillRect(-T * 0.22, -T * 0.22, T * 0.44, T * 0.44);
  ctx.fillStyle = on > 0.5 ? "rgba(255,248,220,0.96)" : "rgba(120,116,104,0.9)";
  ctx.beginPath(); ctx.arc(0, 0, T * 0.17, 0, Math.PI * 2); ctx.fill();
};

// ===========================================================
// 每帧：时间线 + "切出"循环
//   api 由 main.js 传入（spawnEntityAt / kHeld / toast / showDead ...）
// ===========================================================
window.updateCheat363 = function (g, dt, api) {
  if (!g || !g.map) return;
  const A = api || {};
  g.t363 = (g.t363 || 0) + dt;
  g.l363Done = g.l363Done || {};
  if (g.l363Flash > 0) g.l363Flash = Math.max(0, g.l363Flash - dt);

  // ---- 时间线 ----
  for (const ev of L363_EVENTS) {
    if (g.t363 < ev.t || g.l363Done[ev.key]) continue;
    g.l363Done[ev.key] = true;
    switch (ev.key) {
      case "hound":
        if (A.spawn) A.spawn("hound", "dark363");
        if (A.toast) A.toast("门口远处的黑暗里，有东西动了 —— 一只猎犬");
        break;
      case "smiler":
        if (A.spawn) A.spawn("smiler");
        if (A.toast) A.toast("天花板的角落里浮出一张惨白的脸 —— 笑魇");
        break;
      case "flicker":
        if (A.toast) A.toast("灯闪了一下 —— 然后又开始闪");
        break;
      case "swarm": {
        if (A.spawn) {
          A.spawn("smiler"); A.spawn("hound");
          A.spawn("skinstealer"); A.spawn("smiler"); A.spawn("hound");
        }
        if (A.toast) A.toast("门外的黑暗涌了出来 —— 笑魇、猎犬、窃皮者，全都进来了");
        break;
      }
      case "blackout":
        if (A.toast) A.toast("灯彻底灭了 —— 房间里只剩你自己的那一点光");
        break;
      case "drain": {
        // 体力突然减少：跑不动了
        try {
          if (typeof g.stamina === "number") g.stamina = Math.min(g.stamina, 12);
          if (g.player && typeof g.player.stamina === "number") g.player.stamina = Math.min(g.player.stamina, 12);
        } catch (e) { /* 忽略 */ }
        if (A.toast) A.toast("体力突然见底 —— 你连抬腿都费劲了");
        break;
      }
      case "closing":
        g.l363Closing = 0.001;
        if (g.map.door363) g.map.door363.closing = true;
        if (A.toast) A.toast("那扇门开始关上了 —— 它是这里唯一像出口的东西");
        break;
      case "dead":
        g.deathCause = "你没能撑过第十一分钟 —— 这里没有出口，唯一的办法就是死亡";
        if (A.showDead) A.showDead();
        break;
    }
  }
  if (g.l363Closing != null) g.l363Closing = Math.min(1, g.l363Closing + dt / 60);
  if (g.map.door363 && g.l363Closing != null) g.map.door363.open = Math.max(0, 0.22 * (1 - g.l363Closing));

  // ---- 切出循环 ----
  // 平整的表面本该能让人切出到别的层级。跑向墙、穿过去 ——
  // 抬起头，看到的还是这一个房间。
  const p = g.player;
  if (!p) return;
  const TILE_ = (typeof TILE === "number") ? TILE : 40;
  const tx = Math.floor(p.x / TILE_), ty = Math.floor(p.y / TILE_);
  const grid = g.map.layers ? g.map.layers[0] : null;
  if (!grid) return;
  const solid = (x, y) => (grid[y] && grid[y][x] === 1);
  const kHeld = A.kHeld;
  if (!kHeld) return;
  // 朝哪个方向撞墙
  let dir = null;
  if (kHeld("left") && solid(tx - 1, ty)) dir = "left";
  else if (kHeld("right") && solid(tx + 1, ty)) dir = "right";
  else if (kHeld("up") && solid(tx, ty - 1)) dir = "up";
  else if (kHeld("down") && solid(tx, ty + 1)) dir = "down";
  if (!dir) { g.l363Push = 0; return; }
  // 得真的"跑起来"才算冲撞（站着贴墙不算）
  g.l363Push = (g.l363Push || 0) + dt;
  if (g.l363Push < 0.55) return;
  g.l363Push = 0;
  g.l363Flash = 0.35;
  if (A.sfx) A.sfx();
  // 穿过去 —— 然后回到房间的另一头（不是原地，好让你看清楚"还是这间房"）
  const r = g.map.room363;
  const nx = (dir === "left") ? (r.x + r.w - 2) : (dir === "right") ? (r.x + 1) : (r.x + Math.floor(r.w / 2));
  const ny = (dir === "up") ? (r.y + r.h - 2) : (dir === "down") ? (r.y + 1) : (r.y + Math.floor(r.h / 2));
  p.x = (nx + 0.5) * TILE_;
  p.y = (ny + 0.5) * TILE_;
  if (A.toast) A.toast("墙和你融为了一体 —— 抬起头，你看见的还是这个房间。你为什么切不出去？");
};
