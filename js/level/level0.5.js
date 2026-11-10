// ===========================================================
// Level 0.5 —— 渊闭疗舍（1.3.4 批次）
//
//   入口：Level 0 熄灯区深处一段向下的金属格栅楼梯（不发光）。
//   三段区域按日记的天数推进：
//     浸濡通道   齐膝棕污水 / 淡奶油色墙纸泡得剥落 / 短蓝灯垂在破电线上迸火花 /
//                回声、滴答与水花声，唯独没有 Level 0 那阵嗡鸣；零食手推车。
//     第四天之后 墙纸消失，露出虫蛀的木板墙；灯变成长条、嵌进吊顶。
//     医院       平台尽头那片油腻、瓦砾堵路、腐肉味的无尽病房，有湿漉漉的床。
//     渐变带     环境一点一点变成 Level 109，等你反应过来已经不在疗舍里了。
//   实体：溺尸。凝胶状人形，缓慢却永远知道你在哪；一碰到水就尖叫着溶掉。
//   出口：金属格栅楼梯 -> L1；异常清澈带氯气味的水域 -> L37；渐变 -> L109。
//
//   所有地面/墙走 __B3_FLOOR / __B3_WALL，所有物件都在 PROP_DRAW 里注册专属模型。
// ===========================================================
"use strict";

(function () {
  const R = (k, v) => {
    if (typeof regTile === "function") regTile(k, v);
    else (window.__NEWTILE_EXTRA = window.__NEWTILE_EXTRA || {})[k] = v;
  };
  // [地面主色, 地面次色, 墙色] —— 亮度留足，迷雾压完仍能看清轮廓
  R("asylum05", ["#9a8f74", "#8b8065", "#c3b79b"]);
})();

window.__B3_FLOOR = window.__B3_FLOOR || {};
window.__B3_WALL = window.__B3_WALL || {};
window.PROP_DRAW = window.PROP_DRAW || {};
window.__LEVEL_TICK = window.__LEVEL_TICK || {};
window.__B2_OVL = window.__B2_OVL || {};
window.__LEVEL_OVERLAY = window.__LEVEL_OVERLAY || window.__B2_OVL;
const A05_OVL = window.__LEVEL_OVERLAY;

const A05_SOAK_END = 40;     // x < 40：浸濡通道
const A05_TIMBER_END = 64;   // 40 <= x < 64：第四天之后的木板段
const A05_FADE_START = 98;   // x >= 98：医院不知不觉变成 Level 109

function a05Hash(x, y, s) {
  let h = ((x | 0) * 374761393 + (y | 0) * 668265263 + ((s | 0) * 2246822519)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) | 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function a05Zone(x) {
  if (x >= A05_FADE_START) return "fade";
  if (x >= A05_TIMBER_END) return "hospital";
  if (x >= A05_SOAK_END) return "timber";
  return "soak";
}
function a05Rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function a05Pick(arr, pred) {
  const c = pred ? arr.filter(pred) : arr;
  return c.length ? c[Math.floor(Math.random() * c.length)] : arr[0];
}
// 把从出生点走不到的地板重新砌成墙 —— 孤岛上的出口会永远摸不到。
function a05Prune(grid, size, sx, sy) {
  if (!grid[sy] || grid[sy][sx] !== 0) return;
  const vis = new Uint8Array(size * size);
  const q = [sy * size + sx]; vis[q[0]] = 1;
  for (let h = 0; h < q.length; h++) {
    const i = q[h], x = i % size, y = (i / size) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 1 || ny < 1 || nx >= size - 1 || ny >= size - 1) continue;
      const j = ny * size + nx;
      if (vis[j] || grid[ny][nx] !== 0) continue;
      vis[j] = 1; q.push(j);
    }
  }
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    if (grid[y][x] === 0 && !vis[y * size + x]) grid[y][x] = 1;
  }
}

// ===================== 地图 =====================
function generateAsylum05Map(level) {
  const size = 112;
  const built = buildRoomLayer(size, { roomW: [6, 12], roomH: [6, 12], density: 1.45, startRoom: 8 });
  const grid = built.grid;

  // 五条纵走廊 + 三条横走廊把房间群串成「没完没了的走廊」，不是几间互不相干的小屋
  for (const cx of [12, 30, 52, 76, 98]) {
    for (let y = 4; y < size - 4; y++) { grid[y][cx] = 0; grid[y][cx + 1] = 0; }
  }
  for (const cy of [18, 54, 88]) {
    for (let x = 4; x < size - 4; x++) { grid[cy][x] = 0; grid[cy + 1][x] = 0; }
  }
  // 出生点：刚切进来就已经站在齐膝深的脏水里
  carveRoom(grid, size, 7, 50, 10, 10);
  const start = { x: 12, y: 55, floor: 0 };

  // 浸濡通道里那片「异常清澈、更暖、带氯气味」的水域 —— 通 Level 37
  carveRoom(grid, size, 23, 20, 6, 6);
  a05Prune(grid, size, start.x, start.y);
  const floors = collectFloors(grid, size);
  const water = new Set(), clearWater = new Set();
  for (const f of floors) {
    const k = f.x + "," + f.y;
    if (f.x >= 23 && f.x <= 28 && f.y >= 20 && f.y <= 25) { clearWater.add(k); continue; }
    if (f.x < A05_SOAK_END) water.add(k);
  }

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [built.rooms],
    start, exit: null, exits: [], doors: [], ramps: [], redFloor: new Set(),
    transit: null, transits: null,
    props: [], crates: [], ground: [], spawnPts: [{ x: start.x, y: start.y, floor: 0 }],
    a05water: water, a05clear: clearWater, a05day: 1, a05t: 0,
  };
  makeDoorsMap(map);
  const P = (x, y, type, extra) => map.props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  const dist = (f) => Math.hypot(f.x - start.x, f.y - start.y);

  // ---- 三处出口（先摆，其余物件一律避开它们周围 3 格） ----
  // 1) 异常清澈的水域：把头埋进去再浮上来，人已经在 Level 37
  P(25, 22, "a05clear", {
    toLevel: 37, tip: "这片水清得反常，温温的，还有股氯气味 —— 把头埋进去",
  });
  // 2) 医院深处的金属格栅楼梯：底下是寂静冰冷的停车场（Level 1）
  const stairPool = floors.filter((f) => f.x >= A05_TIMBER_END + 4 && f.x < A05_FADE_START - 3 && dist(f) > 34);
  const st = a05Pick(stairPool.length ? stairPool : floors.filter((f) => a05Zone(f.x) === "hospital"));
  P(st.x, st.y, "a05stair", {
    toLevel: 1, tip: "一架金属格栅楼梯，往下是冷的 —— 底下像是个停车场",
  });
  // 3) 渐变带：环境一点一点变成 Level 109，不是一扇门
  const fadePool = floors.filter((f) => f.x >= A05_FADE_START + 2);
  const fd = a05Pick(fadePool.length ? fadePool : floors);
  P(fd.x, fd.y, "a05fade", {
    toLevel: 109, iKind: "a05fade",
    tip: "墙纸正在一点点变白，吊顶也不歪了 —— 再往里走就不是这里了",
  });

  const exits = [{ x: 25, y: 22 }, { x: st.x, y: st.y }, { x: fd.x, y: fd.y }];
  const safeFloors = floors.filter((f) => exits.every((e) => Math.hypot(f.x - e.x, f.y - e.y) >= 3));
  const pick = (pred) => {
    const c = pred ? safeFloors.filter(pred) : safeFloors;
    return c.length ? c[Math.floor(Math.random() * c.length)] : (safeFloors[0] || floors[0]);
  };
  const inSoak = (f) => f.x < A05_SOAK_END;
  const inTimber = (f) => f.x >= A05_SOAK_END && f.x < A05_TIMBER_END;
  const inHosp = (f) => f.x >= A05_TIMBER_END && f.x < A05_FADE_START;

  // 浸濡通道：垂在破电线上的短蓝灯、零食手推车、水面上漂浮的日记、诱人的脏水
  for (let i = 0; i < 22; i++) {
    const f = pick(inSoak);
    if (f) P(f.x, f.y, "a05lamp", { iKind: "a05lamp", variant: "blue" });
  }
  for (let i = 0; i < 7; i++) {
    const f = pick(inSoak);
    if (f) P(f.x, f.y, "a05cart", { iKind: "a05cart" });
  }
  for (let i = 0; i < 3; i++) {
    const f = pick((q) => inSoak(q) && water.has(q.x + "," + q.y));
    if (f) P(f.x, f.y, "a05diary", { iKind: "a05diary" });
  }
  for (let i = 0; i < 4; i++) {
    const f = pick((q) => inSoak(q) && water.has(q.x + "," + q.y));
    if (f) P(f.x, f.y, "a05drink", { iKind: "a05drink" });
  }
  // 第四天之后：墙纸消失，长条灯嵌进吊顶（木板墙由 __B3_WALL 按区域画）
  for (let i = 0; i < 9; i++) {
    const f = pick(inTimber);
    if (f) P(f.x, f.y, "a05lamp", { iKind: "a05lamp", variant: "strip" });
  }
  // 医院：湿漉漉的床（可以逼自己昏睡做梦）、堵路的瓦砾、腐肉味的污渍
  for (let i = 0; i < 12; i++) {
    const f = pick(inHosp);
    if (f) P(f.x, f.y, "a05bed", { iKind: "a05bed" });
  }
  for (let i = 0; i < 20; i++) {
    const f = pick((q) => inHosp(q) || q.x >= A05_FADE_START);
    if (f) P(f.x, f.y, "a05rubble");
  }
  // 手推车里的零食：这才是这层少得可怜的补给
  for (let i = 0; i < 10; i++) {
    const f = pick();
    if (f) map.ground.push({ x: f.x, y: f.y, floor: 0, item: "almond", taken: false });
  }
  return map;
}
window.generateAsylum05Map = generateAsylum05Map;

// ===================== 地面 =====================
window.__B3_FLOOR["asylum05"] = function (ctx, px, py, S, map, tx, ty) {
  const k = tx + "," + ty;
  const zone = a05Zone(tx);
  const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
  const day = map.a05day || 1;

  // 渐变带：越往东越像 Level 109 的白色霓虹医院，不是突然换图
  if (zone === "fade") {
    const f = Math.min(1, Math.max(0, (tx - A05_FADE_START) / 12));
    const r = Math.round(150 + 74 * f), g = Math.round(150 + 80 * f), b = Math.round(136 + 96 * f);
    ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
    ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(255,255,255," + (0.05 + 0.18 * f).toFixed(3) + ")";
    ctx.fillRect(px, py, S, S);
    return true;
  }
  // 异常清澈的水域：偏暖、带氯气味的一小片蓝，跟周围的棕污水一眼能分
  if (map.a05clear && map.a05clear.has(k)) {
    ctx.fillStyle = "#6fa9b8"; ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(190,238,242," + (0.22 + 0.12 * Math.sin(t * 1.7 + tx + ty)).toFixed(3) + ")";
    ctx.fillRect(px, py + S * 0.25, S, S * 0.16);
    ctx.fillStyle = "rgba(255,255,255,.28)";
    for (let i = 0; i < 3; i++) {
      const bx = px + a05Hash(tx, ty, i) * S, by = py + a05Hash(ty, tx, i + 7) * S;
      ctx.beginPath(); ctx.arc(bx, by, 1.6, 0, 6.283); ctx.fill();
    }
    return true;
  }
  // 浸濡通道：齐膝深的棕污水，看不见底，浮着油渍一样的斑点；水面会动
  if (zone === "soak") {
    ctx.fillStyle = a05Hash(tx, ty, 1) > 0.5 ? "#a08e69" : "#94825e";
    ctx.fillRect(px, py, S, S);
    const w = Math.sin(t * 1.15 + tx * 0.7 + ty * 0.35);
    ctx.fillStyle = "rgba(224,210,164," + (0.13 + 0.09 * w).toFixed(3) + ")";
    ctx.fillRect(px, py + S * (0.24 + 0.06 * w), S, S * 0.10);
    // 油渍
    if (a05Hash(tx, ty, 3) > 0.72) {
      ctx.fillStyle = "rgba(48,42,30,.42)";
      ctx.beginPath();
      ctx.ellipse(px + S * a05Hash(tx, ty, 4), py + S * a05Hash(tx, ty, 5), S * 0.20, S * 0.11, 0.4, 0, 6.283);
      ctx.fill();
    }
    // 第 4 天之后，浸濡通道前段的墙纸也开始脱落 —— 地面先渗出木板色
    if (day >= 4 && tx > A05_SOAK_END - 12 && a05Hash(tx, ty, 9) > 0.55) {
      ctx.fillStyle = "rgba(112,86,50,.22)"; ctx.fillRect(px, py, S, S);
    }
    return true;
  }
  // 第四天段：虫蛀木板
  if (zone === "timber") {
    ctx.fillStyle = a05Hash(tx, ty, 2) > 0.5 ? "#967950" : "#8a6d47";
    ctx.fillRect(px, py, S, S);
    ctx.strokeStyle = "rgba(48,32,16,.30)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(px, py + S * 0.5); ctx.lineTo(px + S, py + S * 0.5); ctx.stroke();
    if (a05Hash(tx, ty, 6) > 0.82) {
      ctx.fillStyle = "rgba(24,16,8,.55)";
      ctx.beginPath(); ctx.arc(px + S * 0.5, py + S * 0.45, S * 0.11, 0, 6.283); ctx.fill();
    }
    return true;
  }
  // 医院：油腻发灰的地砖、瓦砾与腐肉味的污渍，地面是干的
  ctx.fillStyle = a05Hash(tx, ty, 8) > 0.5 ? "#aba892" : "#a19e88";
  ctx.fillRect(px, py, S, S);
  ctx.strokeStyle = "rgba(50,52,42,.16)"; ctx.lineWidth = 1;
  ctx.strokeRect(px + 0.5, py + 0.5, S - 1, S - 1);
  if (a05Hash(tx, ty, 11) > 0.88) {
    ctx.fillStyle = "rgba(92,66,48,.34)";
    ctx.beginPath(); ctx.ellipse(px + S * 0.5, py + S * 0.5, S * 0.26, S * 0.15, 0.3, 0, 6.283); ctx.fill();
  }
  return true;
};

window.__B3_WALL["asylum05"] = function (ctx, px, py, S, map, tx, ty) {
  const zone = a05Zone(tx);
  const day = map.a05day || 1;
  if (zone === "fade") {
    const f = Math.min(1, Math.max(0, (tx - A05_FADE_START) / 12));
    ctx.fillStyle = "rgb(" + Math.round(180 + 50 * f) + "," + Math.round(176 + 55 * f) + "," + Math.round(158 + 66 * f) + ")";
    ctx.fillRect(px, py, S, S);
  } else if (zone === "soak") {
    // 淡奶油色墙纸，被水泡得一块块往下剥落
    ctx.fillStyle = day >= 4 && tx > A05_SOAK_END - 12 ? "#8f7a55" : "#c3b79b";
    ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(96,84,60,.32)";
    const hy = a05Hash(tx, ty, 13);
    ctx.fillRect(px, py + S * (0.55 + hy * 0.25), S, S * 0.2);
    if (a05Hash(tx, ty, 14) > 0.6) {
      ctx.fillStyle = "rgba(150,138,106,.62)";
      ctx.beginPath();
      ctx.moveTo(px, py + S * 0.65); ctx.lineTo(px + S * 0.35, py + S * 0.58);
      ctx.lineTo(px + S * 0.62, py + S * 0.78); ctx.lineTo(px, py + S * 0.86);
      ctx.closePath(); ctx.fill();
    }
  } else if (zone === "timber") {
    // 木料如虫蛀的苹果，布满腐坏的深洞
    ctx.fillStyle = "#6f5836"; ctx.fillRect(px, py, S, S);
    ctx.strokeStyle = "rgba(30,20,10,.45)"; ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      const yy = py + S * (0.2 + i * 0.3);
      ctx.beginPath(); ctx.moveTo(px, yy); ctx.lineTo(px + S, yy + 2); ctx.stroke();
    }
    for (let i = 0; i < 3; i++) {
      const hx = px + a05Hash(tx, ty, i + 20) * S, hy = py + a05Hash(ty, tx, i + 30) * S;
      ctx.fillStyle = "rgba(18,12,6,.62)";
      ctx.beginPath(); ctx.arc(hx, hy, S * (0.06 + 0.05 * a05Hash(tx, ty, i + 40)), 0, 6.283); ctx.fill();
    }
  } else {
    // 医院：歪斜的吊顶、脏绿的墙裙
    ctx.fillStyle = "#8d8b78"; ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(70,82,66,.45)"; ctx.fillRect(px, py + S * 0.62, S, S * 0.38);
    ctx.fillStyle = "rgba(220,222,200,.22)"; ctx.fillRect(px, py, S, S * 0.12);
  }
  ctx.fillStyle = "rgba(255,255,255,.07)"; ctx.fillRect(px, py, S, 2);
  ctx.fillStyle = "rgba(0,0,0,.24)"; ctx.fillRect(px, py + S - 3, S, 3);
  return true;
};

// ===================== 物件外观 =====================
// 顶层 const 在所有普通 <script> 之间共享同一个全局词法环境，
// 别的批次文件已经用了 `const D`，这里必须换成自己的前缀，否则整份文件不执行。
const A05_D = window.PROP_DRAW;

// Level 0 熄灯区里那段楼梯：完全不发光，只有手电照到才看得见
A05_D["a05downstairs"] = function (ctx, p, T) {
  ctx.fillStyle = "#20242a"; ctx.fillRect(-T * 0.42, -T * 0.46, T * 0.84, T * 0.92);
  ctx.strokeStyle = "#4a5058"; ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    const y = -T * 0.42 + i * T * 0.21;
    ctx.beginPath(); ctx.moveTo(-T * 0.38, y); ctx.lineTo(T * 0.38, y); ctx.stroke();
  }
  for (let i = -3; i <= 3; i++) {
    ctx.beginPath(); ctx.moveTo(i * T * 0.11, -T * 0.42); ctx.lineTo(i * T * 0.11, T * 0.42); ctx.stroke();
  }
  ctx.fillStyle = "rgba(110,120,130,.18)"; ctx.fillRect(-T * 0.42, -T * 0.46, T * 0.84, T * 0.12);
};

// 短蓝色长方体灯（垂在破电线上，时常迸火花）/ 长条嵌吊顶灯
A05_D["a05lamp"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
  const strip = p.variant === "strip";
  if (!strip) {
    ctx.strokeStyle = "#2a2a2a"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, -T * 0.46); ctx.lineTo(0, -T * 0.22); ctx.stroke();
    ctx.fillStyle = "#365a86"; ctx.fillRect(-T * 0.30, -T * 0.22, T * 0.60, T * 0.20);
    ctx.fillStyle = "rgba(140,200,255,.55)"; ctx.fillRect(-T * 0.26, -T * 0.19, T * 0.52, T * 0.05);
    if (Math.sin(t * 6 + p.x * 1.7) > 0.82) {
      ctx.strokeStyle = "#ffe9a0"; ctx.lineWidth = 1.2;
      for (let i = 0; i < 3; i++) {
        const a = t * 9 + i * 2.1;
        ctx.beginPath(); ctx.moveTo(T * 0.24, -T * 0.08);
        ctx.lineTo(T * 0.24 + Math.cos(a) * 7, -T * 0.08 + Math.sin(a) * 7); ctx.stroke();
      }
    }
    ctx.fillStyle = "rgba(90,150,210,.14)";
    ctx.beginPath(); ctx.arc(0, 0, T * 0.42, 0, 6.283); ctx.fill();
  } else {
    ctx.fillStyle = "#4a4a44"; ctx.fillRect(-T * 0.42, -T * 0.14, T * 0.84, T * 0.28);
    ctx.fillStyle = "#c8c4a8"; ctx.fillRect(-T * 0.38, -T * 0.10, T * 0.76, T * 0.20);
    ctx.fillStyle = "rgba(255,246,206,.30)"; ctx.fillRect(-T * 0.38, -T * 0.10, T * 0.76, T * 0.06);
  }
};

A05_D["a05cart"] = function (ctx, p, T) {
  ctx.fillStyle = "#6a6a62"; ctx.fillRect(-T * 0.34, -T * 0.16, T * 0.68, T * 0.34);
  ctx.fillStyle = "#8d8d80"; ctx.fillRect(-T * 0.34, -T * 0.22, T * 0.68, T * 0.10);
  ctx.strokeStyle = "#3a3a34"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-T * 0.30, T * 0.18); ctx.lineTo(-T * 0.30, T * 0.34); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(T * 0.30, T * 0.18); ctx.lineTo(T * 0.30, T * 0.34); ctx.stroke();
  ctx.fillStyle = "#242420";
  ctx.beginPath(); ctx.arc(-T * 0.28, T * 0.36, T * 0.07, 0, 6.283); ctx.fill();
  ctx.beginPath(); ctx.arc(T * 0.28, T * 0.36, T * 0.07, 0, 6.283); ctx.fill();
  ctx.fillStyle = "#d8a25a";
  for (let i = 0; i < 4; i++) ctx.fillRect(-T * 0.24 + i * T * 0.13, -T * 0.12, T * 0.09, T * 0.07);
};

A05_D["a05diary"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
  ctx.save(); ctx.rotate(Math.sin(t + p.x) * 0.18);
  ctx.fillStyle = "#d9cfae"; ctx.fillRect(-T * 0.22, -T * 0.16, T * 0.44, T * 0.32);
  ctx.strokeStyle = "rgba(70,58,40,.6)"; ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath(); ctx.moveTo(-T * 0.17, -T * 0.10 + i * T * 0.07);
    ctx.lineTo(T * 0.14, -T * 0.10 + i * T * 0.07); ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = "rgba(210,225,225,.35)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.20, T * 0.32, T * 0.08, 0, 0, 6.283); ctx.stroke();
};

A05_D["a05drink"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(104,88,58,.85)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.06, T * 0.34, T * 0.20, 0, 0, 6.283); ctx.fill();
  ctx.strokeStyle = "rgba(190,180,140,.35)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(0, T * 0.06, T * 0.26, T * 0.13, 0, 0, 6.283); ctx.stroke();
  ctx.fillStyle = "rgba(240,230,190,.35)";
  ctx.beginPath(); ctx.arc(-T * 0.10, T * 0.02, T * 0.035, 0, 6.283); ctx.fill();
};

A05_D["a05bed"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 2000;
  ctx.fillStyle = "#4a4c46"; ctx.fillRect(-T * 0.44, -T * 0.34, T * 0.88, T * 0.68);
  ctx.fillStyle = "#c9c7b2"; ctx.fillRect(-T * 0.40, -T * 0.30, T * 0.80, T * 0.56);
  ctx.fillStyle = "rgba(96,108,88," + (0.22 + 0.08 * Math.sin(t + p.x)).toFixed(3) + ")";
  ctx.fillRect(-T * 0.40, -T * 0.06, T * 0.80, T * 0.32);   // 湿漉漉的一摊
  ctx.fillStyle = "#e1dfca"; ctx.fillRect(-T * 0.40, -T * 0.30, T * 0.80, T * 0.14);
  ctx.strokeStyle = "#6b6d62"; ctx.lineWidth = 2;
  ctx.strokeRect(-T * 0.44, -T * 0.34, T * 0.88, T * 0.68);
};

A05_D["a05rubble"] = function (ctx, p, T) {
  ctx.fillStyle = "#6e6a58";
  for (let i = 0; i < 5; i++) {
    const h = a05Hash(p.x, p.y, i);
    ctx.beginPath();
    ctx.moveTo(-T * 0.40 + h * T * 0.7, T * 0.32);
    ctx.lineTo(-T * 0.30 + h * T * 0.7, T * 0.02 + a05Hash(p.x, p.y, i + 5) * T * 0.12);
    ctx.lineTo(-T * 0.10 + h * T * 0.7, T * 0.32);
    ctx.closePath(); ctx.fill();
  }
  ctx.strokeStyle = "rgba(40,38,30,.45)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-T * 0.38, T * 0.16); ctx.lineTo(T * 0.34, T * 0.10); ctx.stroke();
};

A05_D["a05clear"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 900;
  ctx.fillStyle = "rgba(120,210,225," + (0.32 + 0.10 * Math.sin(t)).toFixed(3) + ")";
  ctx.beginPath(); ctx.arc(0, 0, T * 0.44, 0, 6.283); ctx.fill();
  ctx.strokeStyle = "rgba(235,255,255,.75)"; ctx.lineWidth = 1.5;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.arc(0, 0, T * (0.18 + i * 0.11 + 0.02 * Math.sin(t + i)), 0, 6.283); ctx.stroke();
  }
  ctx.fillStyle = "rgba(255,255,255,.85)";
  for (let i = 0; i < 4; i++) {
    const a = t * 0.7 + i * 1.6;
    ctx.beginPath(); ctx.arc(Math.cos(a) * T * 0.22, Math.sin(a) * T * 0.22, T * 0.028, 0, 6.283); ctx.fill();
  }
};

A05_D["a05stair"] = function (ctx, p, T) {
  ctx.fillStyle = "#2c3036"; ctx.fillRect(-T * 0.44, -T * 0.46, T * 0.88, T * 0.92);
  ctx.strokeStyle = "#7b848c"; ctx.lineWidth = 1.4;
  for (let i = 0; i < 6; i++) {
    const y = -T * 0.42 + i * T * 0.16;
    ctx.beginPath(); ctx.moveTo(-T * 0.40, y); ctx.lineTo(T * 0.40, y); ctx.stroke();
  }
  for (let i = -4; i <= 4; i++) {
    ctx.beginPath(); ctx.moveTo(i * T * 0.10, -T * 0.42); ctx.lineTo(i * T * 0.10, T * 0.42); ctx.stroke();
  }
  ctx.fillStyle = "rgba(190,205,215,.20)"; ctx.fillRect(-T * 0.44, -T * 0.46, T * 0.88, T * 0.10);
  ctx.fillStyle = "#e8d9a0"; ctx.font = "bold " + (T * 0.20) + "px sans-serif"; ctx.textAlign = "center";
  ctx.fillText("↓", 0, T * 0.14); ctx.textAlign = "left";
};

A05_D["a05fade"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1600;
  const a = 0.28 + 0.14 * Math.sin(t);
  ctx.fillStyle = "rgba(232,244,246," + a.toFixed(3) + ")";
  ctx.fillRect(-T * 0.44, -T * 0.44, T * 0.88, T * 0.88);
  ctx.strokeStyle = "rgba(255,255,255,.6)"; ctx.lineWidth = 1.5;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.moveTo(-T * 0.36 + i * T * 0.1, -T * 0.36);
    ctx.lineTo(-T * 0.36 + i * T * 0.1, T * 0.36); ctx.stroke();
  }
};

// 溺尸：凝胶状人形，脸耷拉着，两条腿只是在地上滑动的烂泥，伸着双臂
A05_D["a05drowned"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
  const wob = Math.sin(t * 2.2 + (p.phase || 0)) * T * 0.05;
  ctx.save();
  ctx.fillStyle = "rgba(126,138,120,.55)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.32, T * 0.40, T * 0.14, 0, 0, 6.283); ctx.fill();
  // 下半身是一团滑动的烂泥
  ctx.fillStyle = "#5d6658";
  ctx.beginPath();
  ctx.moveTo(-T * 0.28, T * 0.30); ctx.quadraticCurveTo(-T * 0.36, -T * 0.04, -T * 0.16, -T * 0.10);
  ctx.lineTo(T * 0.18, -T * 0.10); ctx.quadraticCurveTo(T * 0.36, T * 0.02, T * 0.26, T * 0.30);
  ctx.closePath(); ctx.fill();
  // 躯干与伸出的双臂
  ctx.fillStyle = "rgba(158,170,152,.82)";
  ctx.beginPath(); ctx.ellipse(0 + wob, -T * 0.18, T * 0.20, T * 0.22, 0, 0, 6.283); ctx.fill();
  ctx.strokeStyle = "rgba(150,164,146,.85)"; ctx.lineWidth = T * 0.09; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(-T * 0.14, -T * 0.20); ctx.lineTo(-T * 0.40, -T * 0.04 + wob); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(T * 0.14, -T * 0.20); ctx.lineTo(T * 0.40, -T * 0.04 - wob); ctx.stroke();
  // 耷拉的脸：像中风一样歪着
  ctx.fillStyle = "rgba(184,192,174,.90)";
  ctx.beginPath(); ctx.ellipse(0 + wob * 0.5, -T * 0.36, T * 0.15, T * 0.16, 0.25, 0, 6.283); ctx.fill();
  ctx.fillStyle = "#30382e";
  ctx.beginPath(); ctx.arc(-T * 0.055, -T * 0.38, T * 0.022, 0, 6.283); ctx.fill();
  ctx.beginPath(); ctx.arc(T * 0.055, -T * 0.39, T * 0.022, 0, 6.283); ctx.fill();
  ctx.strokeStyle = "rgba(48,54,44,.85)"; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.arc(T * 0.02, -T * 0.30, T * 0.055, 0.15, Math.PI - 0.15); ctx.stroke();
  // 咕噜咕噜的气泡
  ctx.fillStyle = "rgba(220,230,214,.55)";
  for (let i = 0; i < 3; i++) {
    const a = t * 1.7 + i * 2.1;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * T * 0.24, -T * 0.06 + Math.sin(a) * T * 0.12, T * (0.025 + i * 0.012), 0, 6.283);
    ctx.fill();
  }
  ctx.restore();
};

// ===================== 提示与交互 =====================
window.__B2_hint([
  "a05downstairs", "a05lamp", "a05cart", "a05diary", "a05drink", "a05bed", "a05fade",
], function (n) {
  switch (n.kind) {
    case "a05downstairs": return "黑暗里摸到一段向下的金属格栅楼梯 —— 按 E 走下去，底下传来熟悉的嗡鸣声";
    case "a05lamp":
      return n.p.variant === "strip"
        ? "长条灯嵌在吊顶里，和 Level 0 差不多 —— 按 E 抬头看"
        : "短短的蓝色灯垂在破电线上，时常迸出火花 —— 按 E 躲开一点";
    case "a05cart": return "一辆载着零食的手推车 —— 按 E 把兜里塞满";
    case "a05diary": return "一页日记漂在脏水上 —— 按 E 捞起来看";
    case "a05drink": return "脏水浑浊又棕污，渴到极点时看着竟有点诱人 —— 按 E 喝一口";
    case "a05bed": return "一张湿漉漉、一股樟脑丸味的病床 —— 按 E 逼自己昏睡几分钟，做个梦";
    case "a05fade": return "墙纸正在一点点变白，吊顶也不歪了 —— 按 E 继续往里走（这里会变成 Level 109）";
  }
  return null;
});

window.__B2_act([
  "a05downstairs", "a05lamp", "a05cart", "a05diary", "a05drink", "a05bed", "a05fade",
], function (n, g) {
  switch (n.kind) {
    case "a05downstairs":
      try { window.__goToLevel("0.5"); } catch (e) { /* 忽略 */ }
      return true;
    case "a05lamp":
      window.__toast(n.p.variant === "strip"
        ? "墙纸早不见了，露出虫蛀的木板 —— 你这才反应过来，这地方已经变了"
        : "灯线一晃，火花溅进水里，滋的一声 —— 你提心吊胆，怕哪盏掉下来");
      return true;
    case "a05cart": {
      try { if (window.__LK) window.__LK.add("almond", 1); } catch (e) { /* 忽略 */ }
      window.__toast("你往兜里和嘴里塞满了零食 —— 这里的食物少见，得省着点");
      return true;
    }
    case "a05diary":
      window.__toast("「我在这儿待太久了……我都快想念那该死的嗡鸣声了，可现在刻在我脑子里的，只有脏水那回荡的滴答声。」");
      return true;
    case "a05drink":
      g.hp = Math.max(0, (g.hp || 100) - 8);
      g.sanity = Math.max(0, (g.sanity || 100) - 10);
      window.__toast("一整天呕个不停 —— 水里准是藏着什么病毒或细菌，吐到后来整个人都脱水了");
      return true;
    case "a05bed": {
      if (g.a05dream > 0) return true;
      if (g.map && g.map.a05water) {
        const tk = Math.floor(g.player.x / 40) + "," + Math.floor(g.player.y / 40);
        if (g.map.a05water.has(tk)) {
          window.__toast("头一低就会沉进水里 —— 这里连歇口气睡一觉都不行");
          return true;
        }
      }
      g.a05dream = 4.4;
      g.a05dreamPos = { x: g.player.x, y: g.player.y };
      window.__toast("你故意憋气把自己弄晕 —— 只要几分钟就好，哪怕知道是假的");
      return true;
    }
    case "a05fade":
      try { window.__goToLevel(109); } catch (e) { /* 忽略 */ }
      return true;
  }
  return false;
});

// ===================== 每帧逻辑 =====================
function a05SpawnDrowned(g) {
  const m = g.map;
  const hosp = m.floors[0].filter((f) => f.x >= A05_TIMBER_END + 6 && f.x < A05_FADE_START - 2);
  const px = g.player.x / 40, py = g.player.y / 40;
  // 从离玩家 12 格以上的病房里挑一个起点
  const far = hosp.filter((f) => Math.hypot(f.x - px, f.y - py) > 12);
  const s = a05Pick(far.length ? far : hosp);
  if (!s) return;
  const d = {
    x: s.x, y: s.y, floor: 0, type: "a05drowned",
    phase: Math.random() * 6.28, melt: 0,
  };
  m.props.push(d);
  g.a05drowned = d;
  window.__toast("门疯狂地摇晃与震颤 —— 门外传来咕噜咕噜的水声，像水从排水口排空");
}

function a05RemoveDrowned(g, melted) {
  const m = g.map, d = g.a05drowned;
  if (!d) return;
  const i = m.props.indexOf(d);
  if (i >= 0) m.props.splice(i, 1);
  g.a05drowned = null;
  g.a05nextDrowned = 20;
  if (melted) {
    window.__toast("溺尸跟着追进水里 —— 身体一碰到水就发出一声尖叫，随即溶成一团浓稠的糊状物");
  }
}

window.__LEVEL_TICK["0.5"] = function (g, dt) {
  dt = Math.min(dt || 0.016, 0.05);
  const m = g.map;
  if (!m || !m.a05water) return;
  window.__B2_enter(g, "0.5", () => {
    g.a05t = 0; g.a05wet = 0; g.a05day = 1; g.a05dream = 0;
    g.a05drowned = null; g.a05nextDrowned = 6; g.a05hospitalT = 0;
    g.a05fadeT = 0; g.a05soundT = 14; g.a05warned = false; g.a05hitT = 0;
  });
  g.a05t = (g.a05t || 0) + dt;
  m.a05t = g.a05t;
  // 日记里「第 4 天层级开始变化」—— 待够 48 秒墙纸变木板、蓝灯变长条
  const day = 1 + Math.floor(g.a05t / 16);
  const newDay = Math.min(4, day);
  if (newDay !== g.a05day) {
    g.a05day = newDay;
    if (newDay === 4) window.__toast("墙纸渐渐消失，露出丑陋的木板墙 —— 灯也变成长条，嵌进了吊顶");
  }
  m.a05day = g.a05day;

  const tx = Math.floor(g.player.x / 40), ty = Math.floor(g.player.y / 40);
  const key = tx + "," + ty;
  const zone = a05Zone(tx);
  const inWater = m.a05water.has(key);

  // 幻梦：人躺在原地不动，画面换成家、工作、苹果树，脸却是扭曲的
  if (g.a05dream > 0) {
    g.a05dream = Math.max(0, g.a05dream - dt);
    if (g.a05dreamPos) { g.player.x = g.a05dreamPos.x; g.player.y = g.a05dreamPos.y; }
    if (g.a05dream <= 0) {
      g.sanity = Math.min(100, (g.sanity || 0) + 6);
      g.hp = Math.max(0, (g.hp || 100) - 3);
      window.__toast("你醒了 —— 梦里家人的脸全是错的，嘴里干得发裂，可总算脱离了那片孤立几分钟");
    }
    return;
  }

  // 齐膝脏水：下半身一点点发黑溃烂，泡得越久越重；没有嗡鸣，只有滴答和水花
  if (inWater) {
    g.a05wet = (g.a05wet || 0) + dt;
    const dps = 0.55 + Math.min(1.35, g.a05wet / 50);
    if (!g.invincible) g.hp = Math.max(0, (g.hp || 100) - dps * dt);
    g.sanity = Math.max(0, (g.sanity || 100) - 0.32 * dt);
    if (!g.a05warned) {
      g.a05warned = true;
      window.__toast("水有齐膝深，脏得完全看不着底 —— 每迈一步，耳朵都跟着疼；这里连那该死的嗡鸣声都没有");
    }
  } else {
    g.a05wet = Math.max(0, (g.a05wet || 0) - dt * 0.7);
  }
  if (g.a05t > (g.a05soundT || 14)) {
    g.a05soundT = g.a05t + 26 + Math.random() * 12;
    window.__toast(inWater
      ? "双腿劈开水面，响亮的水花声在走廊里回荡 —— 然后是脏水那回荡的滴答声"
      : "死一般的寂静里，只有远处不知哪儿传来的滴答声");
  }

  // 医院：进到这一区就开始计时，六秒后溺尸找上门
  if (zone === "hospital" || zone === "fade") {
    g.a05hospitalT = (g.a05hospitalT || 0) + dt;
    if (!g.a05drowned) {
      g.a05nextDrowned = (g.a05nextDrowned == null ? 6 : g.a05nextDrowned) - dt;
      if (g.a05hospitalT > 5 && g.a05nextDrowned <= 0) a05SpawnDrowned(g);
    }
  } else {
    g.a05hospitalT = 0;
  }

  // 溺尸：略高于步行，却永远知道你的确切位置；碰到水就溶掉
  const d = g.a05drowned;
  if (d) {
    const dx = g.player.x / 40 - d.x, dy = g.player.y / 40 - d.y;
    const len = Math.hypot(dx, dy) || 1;
    const speed = 5.9;   // 235 px/s，略高于步行的 215，疾跑能甩开
    d.x += (dx / len) * speed * dt;
    d.y += (dy / len) * speed * dt;
    if (a05Zone(Math.floor(d.x)) === "soak") { a05RemoveDrowned(g, true); }
    else if (len < 0.9) {
      if (!g.invincible) g.hp = Math.max(0, (g.hp || 100) - 9 * dt);
      g.sanity = Math.max(0, (g.sanity || 100) - 6 * dt);
      g.a05hitT = (g.a05hitT || 0) - dt;
      if (g.a05hitT <= 0) {
        g.a05hitT = 3.2;
        window.__toast("它伸着双臂，咕噜咕噜地朝你挪过来 —— 别停下，停下就再也走不掉了");
      }
    }
  }

  // 渐变带：不是一扇门，是环境一点一点变成 Level 109
  if (zone === "fade") {
    g.a05fadeT = (g.a05fadeT || 0) + dt;
    if (g.a05fadeT > 7) {
      g.a05fadeT = -999;
      window.__toast("等你反应过来的时候，走廊已经不是疗舍了 —— Level 109");
      try { window.__goToLevel(109); } catch (e) { /* 忽略 */ }
    }
  } else {
    g.a05fadeT = Math.max(0, (g.a05fadeT || 0) - dt * 1.5);
  }
};

// ===================== 整屏叠加 =====================
A05_OVL["0.5"] = function (ctx, g) {
  const cw = ctx.canvas.width, ch = ctx.canvas.height;
  const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
  ctx.save();
  try { ctx.setTransform(1, 0, 0, 1, 0, 0); } catch (e) { /* 忽略 */ }

  // 水里：边缘一圈发黑、视线发闷，不是纯粹的暗，是泡久了看东西发虚
  if ((g.a05wet || 0) > 1) {
    const a = Math.min(0.20, g.a05wet * 0.003);
    const gr = ctx.createRadialGradient(cw / 2, ch / 2, ch * 0.2, cw / 2, ch / 2, ch * 0.78);
    gr.addColorStop(0, "rgba(40,32,18,0)");
    gr.addColorStop(1, "rgba(40,32,18," + a.toFixed(3) + ")");
    ctx.fillStyle = gr; ctx.fillRect(0, 0, cw, ch);
  }
  // 渐变：越往里，画面越被 Level 109 那种白慢慢吃掉
  if ((g.a05fadeT || 0) > 0) {
    ctx.fillStyle = "rgba(226,240,244," + Math.min(0.52, g.a05fadeT * 0.07).toFixed(3) + ")";
    ctx.fillRect(0, 0, cw, ch);
  }
  // 幻梦：苹果树、日光，以及怎么也看不清的家人
  if ((g.a05dream || 0) > 0) {
    const k = Math.min(1, g.a05dream / 4.4);
    ctx.fillStyle = "rgba(236,228,196," + (0.90 * Math.min(1, k * 2)).toFixed(3) + ")";
    ctx.fillRect(0, 0, cw, ch);
    const cx = cw * 0.5, cy = ch * 0.56;
    ctx.fillStyle = "rgba(120,150,80,.45)";
    ctx.beginPath(); ctx.ellipse(cx, cy - ch * 0.16, cw * 0.16, ch * 0.17, 0, 0, 6.283); ctx.fill();
    ctx.strokeStyle = "rgba(94,68,40,.65)"; ctx.lineWidth = 12;
    ctx.beginPath(); ctx.moveTo(cx, cy + ch * 0.22); ctx.lineTo(cx, cy - ch * 0.04); ctx.stroke();
    ctx.fillStyle = "rgba(196,72,54,.55)";
    for (let i = 0; i < 9; i++) {
      const a = i * 2.4 + t * 0.15;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * cw * 0.12, cy - ch * 0.16 + Math.sin(a) * ch * 0.11, 8, 0, 6.283);
      ctx.fill();
    }
    // 梦里那些脸：轮廓在，五官却全不对
    ctx.strokeStyle = "rgba(70,60,48,.45)"; ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      const x = cw * (0.24 + i * 0.26);
      ctx.beginPath(); ctx.ellipse(x, cy + ch * 0.18, 32, 42, 0, 0, 6.283); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - 12, cy + ch * 0.16); ctx.lineTo(x + 9, cy + ch * 0.20); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + 8, cy + ch * 0.16); ctx.lineTo(x - 8, cy + ch * 0.22); ctx.stroke();
    }
    ctx.fillStyle = "rgba(60,50,36,.8)"; ctx.font = "bold 18px sans-serif"; ctx.textAlign = "center";
    ctx.fillText("……即便他们和真正的样子相互割裂，完全不像，连那张脸都不是准确的。", cw / 2, ch * 0.12);
    ctx.textAlign = "left";
  }
  // 一行克制的状态（不是导航，不指出口）
  const label = (g.a05wet || 0) > 1
    ? "Level 0.5 · 浸濡通道 · 泡在水里"
    : (g.a05hospitalT || 0) > 0 ? "Level 0.5 · 医院 · 地面是干的" : "Level 0.5 · 渊闭疗舍";
  ctx.fillStyle = "rgba(24,22,18,.60)"; ctx.fillRect(cw - 252, 56, 240, 28);
  ctx.fillStyle = "#ddd2b4"; ctx.font = "bold 13px sans-serif"; ctx.textAlign = "left";
  ctx.fillText(label, cw - 242, 75);
  ctx.restore();
};
