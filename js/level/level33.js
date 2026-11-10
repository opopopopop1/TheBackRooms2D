// ===========================================================
// Level 33 —— 无尽购物体验
//   一座空旷的购物中心。店面是现实世界里那些大公司的，
//   但货架基本是空的 —— 有些店面被封死，门打不开。
//   走得越深，商场越旧：
//     0 格   瓷砖干净、地板干燥、灯很稳
//     50 格  墙上长出霉斑，瓷砖开始缺，灯隔几小时闪一下
//     100 格 墙纸被撕掉，草从裂缝里钻出来，水漫到脚踝
//     200 格 苔藓从天花板垂下来，水到膝盖，脑子开始出问题
//     300 格 墙像爆炸现场，草长到一人高，水到腰，幻觉会骗你去送死
//     500 格 地板和灯都没了，地面可能着着火
//     750 格 墙皮剥落，露出黑洞和爆开的管子；别回头看
//     1000 格 有人到过那里，然后被两百只东西撵了回来
//   腐化是"位置的函数" —— 左边干净、右边烂掉，一眼看得出来。
// ===========================================================
"use strict";

(function () {
  const v = ["#e2e0d8", "#d2d0c8", "#c6c4bc"];
  if (typeof regTile === "function") regTile("mall33", v);
  else { (window.__NEWTILE_EXTRA = window.__NEWTILE_EXTRA || {})["mall33"] = v; }
})();

// 腐化度 0~1：由格子的 x 决定（入口在最左，往右越走越深）
function c33At(map, tx) {
  const x0 = (map && map.c33x0 != null) ? map.c33x0 : 6;
  const span = Math.max(1, ((map ? map.size : 100) - 8) - x0);
  let c = (tx - x0) / span;
  if (c < 0) c = 0; if (c > 1) c = 1;
  return c;
}
window.c33At = c33At;

// 八个档位，对应档案里的 0 / 50 / 100 / 200 / 300 / 500 / 750 / 1000 格
function c33Stage(c) {
  if (c < 0.04) return 0;
  if (c < 0.12) return 1;
  if (c < 0.22) return 2;
  if (c < 0.35) return 3;
  if (c < 0.50) return 4;
  if (c < 0.68) return 5;
  if (c < 0.85) return 6;
  return 7;
}
window.c33Stage = c33Stage;

function hex2rgb(h) {
  return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
}
function mixc(a, b, t) {
  const A = hex2rgb(a), B = hex2rgb(b);
  return "rgb(" + Math.round(A[0] + (B[0] - A[0]) * t) + "," + Math.round(A[1] + (B[1] - A[1]) * t)
    + "," + Math.round(A[2] + (B[2] - A[2]) * t) + ")";
}

// 地面：干净的白瓷砖 → 霉 → 草 → 水 → 焦土
const F33 = ["#e6e4dc", "#dcd6c4", "#c8c0a4", "#a89c78", "#8a8a62", "#76725c", "#665f4e", "#5c5446"];
// 墙面：白墙 + 墙纸 → 撕掉 → 霉菌 → 爆开 → 黑洞
const W33 = ["#eae8e2", "#e0dccc", "#c8c0a8", "#a89e84", "#8c8672", "#6e6a5c", "#565048", "#443e38"];

function f33FloorColor(c) {
  const i = Math.min(6, Math.floor(c * 8));
  const t = (c * 8) - i;
  return mixc(F33[i], F33[Math.min(7, i + 1)], t);
}
function f33WallColor(c) {
  const i = Math.min(6, Math.floor(c * 8));
  const t = (c * 8) - i;
  return mixc(W33[i], W33[Math.min(7, i + 1)], t);
}

function generateMall33Map(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const props = [];

  const X0 = 5, X1 = size - 6;
  const cy = Math.floor(size / 2);
  const CORR_Y0 = cy - 2, CORR_Y1 = cy + 2;      // 中间那条主走廊

  const shop33 = new Set();     // 店面内部（地面画成店里的地砖）
  const fire33 = new Set();     // 着火的格子（越深越多）
  const pipe33 = new Set();     // 爆开的管子

  const carve = (x, y) => { if (x > 0 && y > 0 && x < size - 1 && y < size - 1) grid[y][x] = 0; };

  // ---------- 主走廊：横贯整层 ----------
  for (let x = X0; x <= X1; x++) for (let y = CORR_Y0; y <= CORR_Y1; y++) carve(x, y);

  // ---------- 两侧的店面：一间间用墙隔开，每间朝走廊开一个门 ----------
  const shops = [];
  const mkRow = (yTop, yBot, doorAtBottom) => {
    let x = X0 + 2;
    while (x < X1 - 6) {
      const w = randInt(7, 12);
      const x2 = Math.min(x + w, X1 - 1);
      if (x2 - x < 5) break;
      const r = { x0: x, x1: x2, y0: yTop, y1: yBot };
      for (let yy = yTop; yy <= yBot; yy++) for (let xx = x; xx <= x2; xx++) { carve(xx, yy); shop33.add(xx + "," + yy); }
      // 朝走廊开一个门
      const dx = Math.floor((x + x2) / 2);
      const dy = doorAtBottom ? yTop : yBot;
      const dy2 = doorAtBottom ? yTop - 1 : yBot + 1;
      carve(dx, dy); carve(dx, dy2);
      if (dy2 >= CORR_Y0 && dy2 <= CORR_Y1) { /* 已通 */ }
      shops.push(Object.assign({}, r, { doorX: dx, doorY: dy2 }));
      x = x2 + 2;
    }
  };
  mkRow(5, CORR_Y0 - 3, false);        // 上排：门开在下边（朝走廊）
  mkRow(CORR_Y1 + 3, size - 6, true);  // 下排：门开在上边（朝走廊）

  // 门与走廊之间还隔着两格墙 —— 得从门口一路挖穿到走廊边（含走廊那一格）。
  // 以前这里的终止条件写成 "y !== CORR_Y0 - dir"，比走廊边早停了一格，
  // 于是每一间店面都是看得见走不进去的摆设 —— 全层 48% 是死区。
  for (const s of shops) {
    const dir = (s.doorY < cy) ? 1 : -1;
    const target = (dir > 0) ? CORR_Y0 : CORR_Y1;
    for (let y = s.doorY; ; y += dir) {
      if (y < 0 || y >= size) break;
      carve(s.doorX, y);
      if ((dir > 0 && y >= target) || (dir < 0 && y <= target)) break;
    }
  }

  // ---------- 小吃街：走廊上连续一段摆满摊位 ----------
  const foodX0 = Math.floor(X0 + (X1 - X0) * 0.28);
  const foodX1 = foodX0 + 14;

  // ---------- 深处的火与爆开的管子 ----------
  for (let x = X0; x <= X1; x++) {
    const c = c33At({ size, c33x0: X0 }, x);
    if (c > 0.62 && Math.random() < (c - 0.62) * 1.6) {
      const y = randInt(CORR_Y0, CORR_Y1);
      fire33.add(x + "," + y);
    }
    if (c > 0.78 && Math.random() < 0.35) {
      const y = randInt(CORR_Y0 - 1, CORR_Y1 + 1);
      pipe33.add(x + "," + y);
    }
  }

  const floors = collectFloors(grid, size);

  // 出生点：左端的入口大厅（干净那一头）
  const start = { x: X0 + 1, y: cy, floor: 0 };

  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return null;
    if (grid[y][x] !== 0) return null;
    const p = Object.assign({ x, y, floor: 0, type }, extra || {});
    props.push(p);
    return p;
  };

  // ---------- 出口 ----------
  put(X0 + 1, cy - 1, "p33gate", { toLevel: 11 });          // 从入口原路返回
  put(X0 + 1, cy + 1, "p33stairs", { toLevel: 22 });        // 身后的楼梯（从 22 上来的那条）
  // 办公室入口：挑一间中段的店面
  {
    const mid = shops.filter((s) => s.x0 > foodX1 && s.x0 < X0 + (X1 - X0) * 0.62);
    const s = mid.length ? mid[randInt(0, mid.length - 1)] : (shops[0] || null);
    // 档案原文：「您也可以通过办公室入口以进入 Level 45。」
    // Level 45 之前没建，这扇门是拿 Level 4（废弃办公室）顶的 —— 现在改回本体。
    if (s) put(s.doorX, Math.floor((s.y0 + s.y1) / 2), "p33office", { toLevel: 45 });
  }

  // ---------- 店面招牌 / 橱窗里的模特 / 长椅 / 盆栽 / 自动售货机 ----------
  for (const s of shops) {
    const mx = Math.floor((s.x0 + s.x1) / 2), my = Math.floor((s.y0 + s.y1) / 2);
    const c = c33At({ size, c33x0: X0 }, mx);
    put(mx, s.y0 === my ? my : my, "p33shop");
    if (Math.random() < 0.7) put(mx + (Math.random() < 0.5 ? -2 : 2), my + 1, "p33shelf");
    if (Math.random() < 0.5) put(mx - 1, my - 1, "p33shelf");
    if (Math.random() < 0.45) put(mx + 1, my, "p33mannequin");
  }
  // ---------- 小吃街 ----------
  for (let x = foodX0; x <= foodX1; x += 2) {
    put(x, CORR_Y0, "p33stall");
    put(x, CORR_Y1, "p33stall");
  }
  for (let x = foodX0; x <= foodX1; x += 3) put(x, cy, "p33bench");
  // ---------- 走廊上：盆栽、自动售货机、购物车、喷泉 ----------
  for (let x = X0 + 4; x <= X1 - 2; x += 9) {
    put(x, CORR_Y0, "p33planter");
    put(x, CORR_Y1, "p33planter");
  }
  for (let x = X0 + 12; x <= X1 - 4; x += 16) put(x, cy - 1, "p33vending");
  for (let x = X0 + 20; x <= X1 - 6; x += 22) put(x, cy + 1, "p33fountain");
  for (let x = X0 + 8; x <= X1 - 8; x += 13) put(x, cy + (Math.random() < 0.5 ? -2 : 2), "p33cart");

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [],
    c33x0: X0, c33x1: X1, cy, corrY0: CORR_Y0, corrY1: CORR_Y1,
    shop33, fire33, pipe33, shops33: shops, foodX0, foodX1,
  };
  map.spawnPts = [start];
  return map;
}
window.generateMall33Map = generateMall33Map;

// ---------- 地面：按腐化度连续变化 ----------
window.drawMall33Floor = function (ctx, px, py, S, map, tx, ty) {
  const c = c33At(map, tx);
  ctx.fillStyle = f33FloorColor(c);
  ctx.fillRect(px, py, S, S);

  const inShop = map.shop33 && map.shop33.has(tx + "," + ty);
  // 瓷砖缝：干净的地方看得清，越深越糊
  if (c < 0.55) {
    ctx.strokeStyle = "rgba(120,116,104," + (0.35 - c * 0.4).toFixed(3) + ")";
    ctx.lineWidth = 1;
    ctx.strokeRect(px + 0.5, py + 0.5, S - 1, S - 1);
    if (((tx + ty) % 2) === 0 && inShop) {
      ctx.fillStyle = "rgba(255,255,255,0.10)";
      ctx.fillRect(px + 1, py + 1, S - 2, S - 2);
    }
  }
  // 霉斑
  if (c > 0.06 && c < 0.8) {
    const n = Math.floor(c * 5) + 1;
    ctx.fillStyle = "rgba(70,78,52," + (0.10 + c * 0.28).toFixed(3) + ")";
    for (let i = 0; i < n; i++) {
      const a = ((tx * 17 + ty * 31 + i * 53) % 100) / 100;
      const b = ((tx * 29 + ty * 11 + i * 37) % 100) / 100;
      ctx.fillRect(px + a * S * 0.8, py + b * S * 0.8, Math.max(1, S * 0.14), Math.max(1, S * 0.12));
    }
  }
  // 草：从裂缝里长出来，越深越高
  if (c > 0.18) {
    const hgt = Math.min(0.62, (c - 0.18) * 1.1);
    ctx.strokeStyle = c > 0.55 ? "#4a5c30" : "#6a8a44";
    ctx.lineWidth = Math.max(1, S * 0.045);
    const n = 2 + Math.floor(c * 4);
    for (let i = 0; i < n; i++) {
      const bx = px + (((tx * 13 + ty * 7 + i * 41) % 100) / 100) * S * 0.86 + S * 0.07;
      ctx.beginPath();
      ctx.moveTo(bx, py + S);
      ctx.quadraticCurveTo(bx + S * 0.06, py + S * (1 - hgt * 0.6), bx - S * 0.05, py + S * (1 - hgt));
      ctx.stroke();
    }
  }
  // 水位：先到脚踝，再到膝盖，再到腰
  if (c > 0.30) {
    const dep = Math.min(0.85, (c - 0.30) * 1.5);
    ctx.fillStyle = "rgba(60,90,86," + (0.22 + dep * 0.42).toFixed(3) + ")";
    ctx.fillRect(px, py, S, S);
    const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
    ctx.fillStyle = "rgba(190,220,214," + (0.10 + dep * 0.16).toFixed(3) + ")";
    ctx.fillRect(px, py + S * (0.35 + 0.2 * Math.sin(t * 1.3 + tx * 0.6 + ty * 0.4)), S, Math.max(1, S * 0.10));
  }
  // 火：地面在烧
  if (map.fire33 && map.fire33.has(tx + "," + ty)) {
    const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
    const pl = 0.55 + 0.45 * Math.sin(t * 5 + tx);
    ctx.fillStyle = "rgba(40,26,20,0.75)";
    ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(240,130,40," + (0.55 * pl).toFixed(3) + ")";
    ctx.beginPath();
    ctx.moveTo(px + S * 0.5, py + S * (0.9 - 0.5 * pl));
    ctx.lineTo(px + S * 0.86, py + S * 0.9);
    ctx.lineTo(px + S * 0.14, py + S * 0.9);
    ctx.closePath(); ctx.fill();
  }
  return true;
};

// ---------- 墙体：白墙 → 墙纸撕掉 → 霉菌 → 爆开 → 黑洞 ----------
window.drawMall33Wall = function (ctx, px, py, S, map, tx, ty) {
  const c = c33At(map, tx);
  ctx.fillStyle = f33WallColor(c);
  ctx.fillRect(px, py, S, S);

  if (c < 0.14) {
    // 干净的商场：墙纸的花纹 + 顶部一条灯带
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.fillRect(px, py, S, Math.max(1, S * 0.16));
    ctx.fillStyle = "rgba(150,146,134,0.25)";
    for (let i = 0; i < 3; i++) ctx.fillRect(px + S * (0.15 + i * 0.3), py + S * 0.35, Math.max(1, S * 0.10), Math.max(1, S * 0.10));
  } else if (c < 0.45) {
    // 墙纸被撕掉：一块块露出底下的石膏
    ctx.fillStyle = "rgba(220,214,196,0.45)";
    ctx.fillRect(px, py, S, Math.max(1, S * 0.18));
    if (((tx * 11 + ty * 5) % 3) === 0) {
      ctx.fillStyle = "rgba(180,174,156,0.55)";
      ctx.fillRect(px + S * 0.2, py + S * 0.3, S * 0.42, S * 0.36);
      ctx.fillStyle = "rgba(120,116,100,0.4)";
      ctx.fillRect(px + S * 0.2, py + S * 0.3, S * 0.42, Math.max(1, S * 0.08));
    }
    ctx.fillStyle = "rgba(66,74,50,0.35)";
    for (let i = 0; i < 2; i++) ctx.fillRect(px + ((tx * 7 + i * 31) % 70) / 100 * S, py + ((ty * 13 + i * 17) % 70) / 100 * S, Math.max(1, S * 0.16), Math.max(1, S * 0.13));
  } else if (c < 0.72) {
    // 像爆炸现场：裂纹 + 露出钢筋
    ctx.fillStyle = "rgba(60,56,48,0.5)";
    ctx.fillRect(px, py, S, S);
    ctx.strokeStyle = "rgba(30,28,24,0.6)"; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(px, py + S * 0.2); ctx.lineTo(px + S * 0.55, py + S * 0.5); ctx.lineTo(px + S, py + S * 0.35);
    ctx.stroke();
    ctx.strokeStyle = "rgba(110,96,74,0.7)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(px + S * 0.3, py); ctx.lineTo(px + S * 0.45, py + S * 0.7); ctx.stroke();
    // 垂下来的苔藓
    ctx.strokeStyle = "#5a6a3a"; ctx.lineWidth = Math.max(1, S * 0.05);
    for (let i = 0; i < 3; i++) {
      const bx = px + S * (0.2 + i * 0.3);
      ctx.beginPath(); ctx.moveTo(bx, py); ctx.lineTo(bx + S * 0.03, py + S * (0.3 + ((tx + i) % 4) * 0.12)); ctx.stroke();
    }
  } else {
    // 墙皮没了 —— 露出黑洞，黑洞里是爆开、腐蚀的管子。
    // 这不是 Level 2 那套整齐的锈蚀管道：那是"墙面"，这是"墙没了之后露出来的东西"。
    ctx.fillStyle = "#3a3630";
    ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "#14161a";
    ctx.fillRect(px + S * 0.14, py + S * 0.14, S * 0.72, S * 0.72);
    // 黑洞里的管子：断口是斜的，还在往下滴东西
    ctx.strokeStyle = "#6a5a44"; ctx.lineWidth = Math.max(1.5, S * 0.09);
    ctx.beginPath(); ctx.moveTo(px + S * 0.16, py + S * 0.34); ctx.lineTo(px + S * 0.48, py + S * 0.34); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px + S * 0.58, py + S * 0.62); ctx.lineTo(px + S * 0.86, py + S * 0.62); ctx.stroke();
    ctx.strokeStyle = "#4a4038"; ctx.lineWidth = Math.max(1, S * 0.06);
    ctx.beginPath(); ctx.moveTo(px + S * 0.50, py + S * 0.36); ctx.lineTo(px + S * 0.56, py + S * 0.60); ctx.stroke();
    // 腐蚀的绿
    ctx.fillStyle = "rgba(74,92,52,0.45)";
    ctx.fillRect(px + S * 0.16, py + S * 0.24, S * 0.32, Math.max(1, S * 0.08));
    ctx.fillRect(px + S * 0.58, py + S * 0.54, S * 0.28, Math.max(1, S * 0.08));
  }
  return true;
};

// ---------- 整屏：灯在闪、深处越来越暗、火光映在画面上 ----------
window.drawMall33 = function (ctx, g) {
  const cw = (ctx.canvas && ctx.canvas.width) || 800;
  const ch = (ctx.canvas && ctx.canvas.height) || 600;
  const m = g.map;
  if (!m) return;
  const tx = Math.floor(g.player.x / TILE);
  const c = c33At(m, tx);
  const t = performance.now() / 1000;
  ctx.save();
  try { ctx.setTransform(1, 0, 0, 1, 0, 0); } catch (e) { /* 忽略 */ }

  // 灯：干净的地方是稳的；越深闪得越凶，最后干脆灭掉
  if (c > 0.10) {
    const freq = 0.4 + c * 3.2;
    const dark = 0.5 + 0.5 * Math.sin(t * freq);
    // 上限压在 0.40：再深也不至于把画面压成纯黑，玩家还得看得见路
    const amount = Math.min(0.40, (c - 0.10) * 0.62) * dark;
    if (amount > 0.01) {
      ctx.fillStyle = "rgba(6,8,12," + amount.toFixed(3) + ")";
      ctx.fillRect(0, 0, cw, ch);
    }
  }
  // 深处的底光：灯是灭了，但地面在烧的东西和腐植的磷光还照得见路 ——
  // 没有这一层，最深处会被压到几乎全黑，玩家连脚下的水和火都分不清。
  if (c > 0.45) {
    const am = Math.min(0.10, (c - 0.45) * 0.20);
    ctx.fillStyle = "rgba(150,120,86," + am.toFixed(3) + ")";
    ctx.fillRect(0, 0, cw, ch);
  }
  // 深处：火光把画面映红
  if (c > 0.55) {
    const a = Math.min(0.30, (c - 0.55) * 0.7);
    const gr = ctx.createRadialGradient(cw * 0.5, ch * 0.5, ch * 0.2, cw * 0.5, ch * 0.5, ch * 0.9);
    gr.addColorStop(0, "rgba(0,0,0,0)");
    gr.addColorStop(1, "rgba(180,70,20," + (a * (0.7 + 0.3 * Math.sin(t * 3))).toFixed(3) + ")");
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, cw, ch);
  }
  ctx.restore();
};

window.PROP_DRAW = window.PROP_DRAW || {};

// 店面：招牌 + 卷帘门（有些被封死了）
window.PROP_DRAW["p33shop"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  const sealed = ((p.x * 7 + p.y * 3) % 4) === 0;
  ctx.fillStyle = "#8a8880";
  ctx.fillRect(-T * 0.46, -T * 0.30, T * 0.92, T * 0.60);
  if (sealed) {
    // 被封死的门：一道道卷帘
    ctx.fillStyle = "#5e5c56";
    ctx.fillRect(-T * 0.42, -T * 0.26, T * 0.84, T * 0.52);
    ctx.strokeStyle = "#3e3c38"; ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath(); ctx.moveTo(-T * 0.42, -T * 0.26 + i * T * 0.065); ctx.lineTo(T * 0.42, -T * 0.26 + i * T * 0.065); ctx.stroke();
    }
    return;
  }
  // 玻璃门 + 招牌（招牌上的灯会坏）
  ctx.fillStyle = "#2a3038";
  ctx.fillRect(-T * 0.38, -T * 0.22, T * 0.76, T * 0.44);
  ctx.fillStyle = "rgba(160,190,210,0.28)";
  ctx.fillRect(-T * 0.38, -T * 0.22, T * 0.76, T * 0.44);
  ctx.fillStyle = "#4a4e56";
  ctx.fillRect(-T * 0.44, -T * 0.42, T * 0.88, T * 0.16);
  const on = (((p.x + Math.floor(t * 0.5)) % 7) !== 0);
  ctx.fillStyle = on ? "rgba(230,238,246,0.85)" : "rgba(120,120,116,0.5)";
  ctx.fillRect(-T * 0.36, -T * 0.38, T * 0.72, T * 0.08);
};

// 货架：基本是空的
window.PROP_DRAW["p33shelf"] = function (ctx, p, T) {
  ctx.fillStyle = "#9a968c";
  ctx.fillRect(-T * 0.44, -T * 0.34, T * 0.88, T * 0.14);
  ctx.fillRect(-T * 0.44, -T * 0.06, T * 0.88, T * 0.14);
  ctx.fillRect(-T * 0.44, T * 0.22, T * 0.88, T * 0.14);
  ctx.fillStyle = "#7e7a72";
  ctx.fillRect(-T * 0.44, -T * 0.34, T * 0.08, T * 0.70);
  ctx.fillRect(T * 0.36, -T * 0.34, T * 0.08, T * 0.70);
  // 架子上零星剩下的东西
  ctx.fillStyle = "rgba(180,170,150,0.6)";
  ctx.fillRect(-T * 0.20, -T * 0.42, T * 0.14, T * 0.08);
  ctx.fillRect(T * 0.06, -T * 0.14, T * 0.12, T * 0.08);
};

// 人体模型：橱窗里那种，没有脸
window.PROP_DRAW["p33mannequin"] = function (ctx, p, T) {
  ctx.fillStyle = "#d8d2c6";
  ctx.beginPath(); ctx.arc(0, -T * 0.26, T * 0.11, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(-T * 0.14, -T * 0.14, T * 0.28, T * 0.34);
  ctx.fillRect(-T * 0.10, T * 0.18, T * 0.08, T * 0.24);
  ctx.fillRect(T * 0.02, T * 0.18, T * 0.08, T * 0.24);
  ctx.fillStyle = "#b8b2a6";
  ctx.fillRect(-T * 0.20, -T * 0.10, T * 0.06, T * 0.24);
  ctx.fillRect(T * 0.14, -T * 0.10, T * 0.06, T * 0.24);
};

// 小吃摊：偶尔还有存货
window.PROP_DRAW["p33stall"] = function (ctx, p, T) {
  ctx.fillStyle = "#7a6a52";
  ctx.fillRect(-T * 0.42, -T * 0.10, T * 0.84, T * 0.34);
  ctx.fillStyle = "#8e7c60";
  ctx.fillRect(-T * 0.42, -T * 0.10, T * 0.84, T * 0.08);
  // 雨棚：红白相间
  ctx.fillStyle = "#b84a3a";
  ctx.fillRect(-T * 0.46, -T * 0.30, T * 0.92, T * 0.14);
  ctx.fillStyle = "#e6e0d0";
  for (let i = 0; i < 4; i++) ctx.fillRect(-T * 0.46 + i * T * 0.24, -T * 0.30, T * 0.12, T * 0.14);
  // 台面上的东西
  ctx.fillStyle = "#c8b070";
  ctx.fillRect(-T * 0.24, -T * 0.18, T * 0.16, T * 0.08);
  ctx.fillStyle = "#8a9a5a";
  ctx.fillRect(T * 0.06, -T * 0.18, T * 0.12, T * 0.08);
};

// 长椅
window.PROP_DRAW["p33bench"] = function (ctx, p, T) {
  ctx.fillStyle = "#8a6a44";
  ctx.fillRect(-T * 0.42, -T * 0.10, T * 0.84, T * 0.12);
  ctx.fillRect(-T * 0.42, -T * 0.24, T * 0.84, T * 0.08);
  ctx.fillStyle = "#5a5a58";
  ctx.fillRect(-T * 0.36, T * 0.02, T * 0.08, T * 0.20);
  ctx.fillRect(T * 0.28, T * 0.02, T * 0.08, T * 0.20);
};

// 盆栽：后来长疯了的是别的东西
window.PROP_DRAW["p33planter"] = function (ctx, p, T) {
  ctx.fillStyle = "#8a7a66";
  ctx.fillRect(-T * 0.20, T * 0.02, T * 0.40, T * 0.28);
  ctx.fillStyle = "#4a6a38";
  ctx.beginPath(); ctx.ellipse(0, -T * 0.14, T * 0.22, T * 0.16, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#5c7c46";
  ctx.beginPath(); ctx.ellipse(-T * 0.08, -T * 0.20, T * 0.12, T * 0.10, 0, 0, Math.PI * 2); ctx.fill();
};

// 自动售货机
window.PROP_DRAW["p33vending"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  const on = (((p.x + Math.floor(t * 0.4)) % 9) !== 0);
  ctx.fillStyle = "#6a3a4a";
  ctx.fillRect(-T * 0.30, -T * 0.44, T * 0.60, T * 0.88);
  ctx.fillStyle = on ? "rgba(200,230,240,0.65)" : "rgba(60,70,76,0.55)";
  ctx.fillRect(-T * 0.24, -T * 0.38, T * 0.46, T * 0.50);
  ctx.fillStyle = "#3a3e42";
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
    ctx.fillRect(-T * 0.20 + j * T * 0.22, -T * 0.34 + i * T * 0.15, T * 0.14, T * 0.10);
  }
  ctx.fillStyle = "#2a2e32";
  ctx.fillRect(-T * 0.24, T * 0.20, T * 0.46, T * 0.14);
};

// 喷泉：早干了，后来长了草
window.PROP_DRAW["p33fountain"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  ctx.fillStyle = "#a8a49a";
  ctx.beginPath(); ctx.ellipse(0, 0, T * 0.42, T * 0.30, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#8e8a80";
  ctx.beginPath(); ctx.ellipse(0, 0, T * 0.32, T * 0.21, 0, 0, Math.PI * 2); ctx.fill();
  // 中央的柱子 + 还在滴的水
  ctx.fillStyle = "#b8b4aa";
  ctx.fillRect(-T * 0.05, -T * 0.30, T * 0.10, T * 0.26);
  ctx.fillStyle = "rgba(150,200,210," + (0.4 + 0.3 * Math.sin(t * 2)).toFixed(3) + ")";
  ctx.beginPath(); ctx.ellipse(0, -T * 0.28, T * 0.06, T * 0.03, 0, 0, Math.PI * 2); ctx.fill();
};

// 购物车
window.PROP_DRAW["p33cart"] = function (ctx, p, T) {
  ctx.strokeStyle = "#a0a4a8"; ctx.lineWidth = Math.max(1.5, T * 0.05);
  ctx.beginPath();
  ctx.moveTo(-T * 0.28, -T * 0.26); ctx.lineTo(T * 0.24, -T * 0.26);
  ctx.lineTo(T * 0.18, T * 0.08); ctx.lineTo(-T * 0.22, T * 0.08);
  ctx.closePath(); ctx.stroke();
  ctx.lineWidth = 1;
  for (let i = 1; i < 4; i++) {
    ctx.beginPath(); ctx.moveTo(-T * 0.28 + i * T * 0.13, -T * 0.26); ctx.lineTo(-T * 0.22 + i * T * 0.13, T * 0.08); ctx.stroke();
  }
  ctx.fillStyle = "#40444a";
  ctx.beginPath(); ctx.arc(-T * 0.18, T * 0.18, T * 0.06, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(T * 0.14, T * 0.18, T * 0.06, 0, Math.PI * 2); ctx.fill();
};

// 入口：从这儿进来的，也从这儿回去
window.PROP_DRAW["p33gate"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  const pl = 0.5 + 0.3 * Math.sin(t * 1.8);
  ctx.fillStyle = "#c8c4b8";
  ctx.fillRect(-T * 0.44, -T * 0.46, T * 0.88, T * 0.92);
  ctx.fillStyle = "rgba(230,240,246," + (0.35 + 0.3 * pl).toFixed(3) + ")";
  ctx.fillRect(-T * 0.34, -T * 0.38, T * 0.68, T * 0.76);
  ctx.strokeStyle = "#8a867a"; ctx.lineWidth = 2;
  ctx.strokeRect(-T * 0.44, -T * 0.46, T * 0.88, T * 0.92);
  // 两扇门中间那道缝
  ctx.fillStyle = "rgba(60,64,70,0.6)";
  ctx.fillRect(-T * 0.02, -T * 0.38, Math.max(1, T * 0.04), T * 0.76);
};

// 身后的楼梯：从 Level 22 上来的那条
window.PROP_DRAW["p33stairs"] = function (ctx, p, T) {
  ctx.fillStyle = "#a8a49a";
  for (let i = 0; i < 4; i++) ctx.fillRect(-T * 0.42 + i * T * 0.04, -T * 0.30 + i * T * 0.16, T * 0.84 - i * T * 0.08, T * 0.14);
  ctx.fillStyle = "#c8c4b8";
  ctx.fillRect(-T * 0.46, -T * 0.36, T * 0.10, T * 0.72);
  ctx.fillRect(T * 0.36, -T * 0.36, T * 0.10, T * 0.72);
  // 向下的箭头
  ctx.fillStyle = "rgba(70,72,80,0.7)";
  ctx.beginPath();
  ctx.moveTo(0, T * 0.28); ctx.lineTo(T * 0.16, T * 0.02); ctx.lineTo(T * 0.07, T * 0.02);
  ctx.lineTo(T * 0.07, -T * 0.22); ctx.lineTo(-T * 0.07, -T * 0.22); ctx.lineTo(-T * 0.07, T * 0.02);
  ctx.lineTo(-T * 0.16, T * 0.02);
  ctx.closePath(); ctx.fill();
};

// 办公室入口：一扇普通的办公室门
window.PROP_DRAW["p33office"] = function (ctx, p, T) {
  ctx.fillStyle = "#6a5a48";
  ctx.fillRect(-T * 0.36, -T * 0.44, T * 0.72, T * 0.88);
  ctx.fillStyle = "#7e6c56";
  ctx.fillRect(-T * 0.30, -T * 0.38, T * 0.60, T * 0.76);
  // 门上的百叶窗玻璃
  ctx.fillStyle = "rgba(190,210,220,0.45)";
  ctx.fillRect(-T * 0.22, -T * 0.30, T * 0.44, T * 0.26);
  ctx.strokeStyle = "#5a4e3e"; ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath(); ctx.moveTo(-T * 0.22, -T * 0.30 + i * T * 0.07); ctx.lineTo(T * 0.22, -T * 0.30 + i * T * 0.07); ctx.stroke();
  }
  // 门把手
  ctx.fillStyle = "#b8a060";
  ctx.beginPath(); ctx.arc(T * 0.20, T * 0.06, T * 0.05, 0, Math.PI * 2); ctx.fill();
};

// ---------- Level 11 里那座购物中心（Level 33 的入口）----------
window.PROP_DRAW["mall33door"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  const pl = 0.5 + 0.3 * Math.sin(t * 1.6);
  ctx.fillStyle = "#b8b4a8";
  ctx.fillRect(-T * 0.44, -T * 0.46, T * 0.88, T * 0.92);
  ctx.fillStyle = "#d8d4c8";
  ctx.fillRect(-T * 0.38, -T * 0.40, T * 0.76, T * 0.80);
  // 玻璃门里透出来的灯光
  ctx.fillStyle = "rgba(240,244,230," + (0.35 + 0.3 * pl).toFixed(3) + ")";
  ctx.fillRect(-T * 0.30, -T * 0.32, T * 0.60, T * 0.64);
  // 门楣上的招牌灯箱
  ctx.fillStyle = "#5a6a78";
  ctx.fillRect(-T * 0.40, -T * 0.54, T * 0.80, T * 0.14);
  ctx.fillStyle = "rgba(230,240,246," + (0.5 + 0.35 * pl).toFixed(3) + ")";
  ctx.fillRect(-T * 0.34, -T * 0.51, T * 0.68, T * 0.08);
  ctx.strokeStyle = "#8a867a"; ctx.lineWidth = 2;
  ctx.strokeRect(-T * 0.44, -T * 0.46, T * 0.88, T * 0.92);
};
