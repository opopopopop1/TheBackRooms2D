// ===========================================================
// Level 36 —— 永恒机场
// 最大的安全枢纽：26 座以 A 至 Z 标记的航站楼，内设编号无限的登机口。
// 区段 1：行李领取处（数不清的行李转盘向两个方向延伸）+ 值机区（空无一人的服务柜台）
// 区段 2：非欧几里得迷宫般的连廊（标识互相矛盾、距离无法线性叠加）
// 区段 3：26 座航站楼，每座里有登机口 —— 倒计时归到 1000 就开始登机，
//         登机口变成通往子层级 36.1（客机）的入口；归零则关闭。
// 整个层级没有实体。时间在这里膨胀得厉害 —— 屏幕上的倒计时是唯一的"钟"。
// ===========================================================
"use strict";

if (typeof regTile === "function") regTile("airport", ["#dcd8cf", "#9aa4b0"]);
else { (window.__NEWTILE_EXTRA = window.__NEWTILE_EXTRA || {})["airport"] = ["#dcd8cf", "#9aa4b0"]; }

// 26 座航站楼的字母
const TERMINALS_36 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// 航班的目的地：从做好的层级里取，尽量不重复
function flightDestPool() {
  const L = (typeof LEVELS !== "undefined" && LEVELS) || window.LEVELS || {};
  // 不作航班目的地：自身、子层级、必死彩蛋、只能从 14 走彩蛋路径进的 15、
  // 以及那些"没有出口"的特殊层 —— 免得搭个航班就被扔进死路。
  const ban = { "36": 1, "36.1": 1, "hub": 1, "bang": 1, "666": 1, "anse": 1,
    "601": 1, "9223372036854775807": 1, "9223372036854775807.-1": 1,
    "redrooms": 1, "traproof": 1, "newera": 1, "exclam": 1, "15": 1 };
  const keys = Object.keys(L).filter((k) => !ban[k]);
  for (let i = keys.length - 1; i > 0; i--) {          // 洗牌
    const j = Math.floor(Math.random() * (i + 1));
    const t = keys[i]; keys[i] = keys[j]; keys[j] = t;
  }
  return keys.length ? keys : ["11"];
}

function generateAirportMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const props = [];
  const cy = Math.floor(size / 2);

  const hcorr = (y, x1, x2) => {
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) if (grid[y]) grid[y][x] = 0;
  };
  const vcorr = (x, y1, y2) => {
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) if (grid[y] && grid[y][x] !== undefined) grid[y][x] = 0;
  };

  // ---- 贯穿东西的主连廊 ----
  hcorr(cy - 1, 2, size - 3); hcorr(cy, 2, size - 3); hcorr(cy + 1, 2, size - 3);

  // ---- 区段 1：行李领取处（最左端，一面墙是该层级唯一已知的有边界区域）----
  const bagX = 4, bagY = cy - 15, bagW = 22, bagH = 30;
  carveRoom(grid, size, bagX, bagY, bagW, bagH);
  hcorr(cy, bagX + bagW - 1, bagX + bagW + 2);        // 接到主连廊

  // ---- 区段 2：值机区（一排无限延伸、空无一人的服务柜台）----
  const ckX = 30, ckY = cy - 11, ckW = 20, ckH = 22;
  carveRoom(grid, size, ckX, ckY, ckW, ckH);
  hcorr(cy, ckX - 3, ckX + 1);

  // ---- 区段 3：26 座航站楼（两列，每列 13 座）----
  const termX = [56, 80], termW = 18, termH = 5;
  const rooms36 = [];
  for (let i = 0; i < 13; i++) {
    const y = 3 + i * 7;
    for (let c = 0; c < 2; c++) {
      const x = termX[c];
      carveRoom(grid, size, x, y, termW, termH);
      // 每座航站楼开一条竖走廊接到主连廊（非欧：看着笔直，其实接到了别处）
      const doorX = x + Math.floor(termW / 2);
      if (y + termH < cy - 1) vcorr(doorX, y + termH, cy - 1);
      else if (y > cy + 1) vcorr(doorX, cy + 1, y);
      rooms36.push({ x, y, w: termW, h: termH, letter: TERMINALS_36[i + c * 13] });
    }
  }
  // 两列之间也打通
  hcorr(cy, termX[0] + termW, termX[1]);

  const floors = collectFloors(grid, size);
  const start = { x: bagX + 3, y: cy, floor: 0 };

  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return null;
    if (!grid[y] || grid[y][x] !== 0) return null;
    const p = Object.assign({ x, y, floor: 0, type }, extra || {});
    props.push(p);
    return p;
  };

  // ---- 行李领取处的传送带（少数在运转，多数静止）----
  const carousels = [];
  for (let r = 0; r < 8; r++) {
    const y = bagY + 2 + r * 3;
    for (let c = 0; c < 2; c++) {
      const x = bagX + 2 + c * 11;
      const p = put(x, y, "carousel36", { num: "#" + (r * 2 + c + 1), on: Math.random() < 0.28 });
      if (p) carousels.push(p);
    }
  }

  // ---- 值机区的柜台 + 头顶的信息屏 ----
  for (let r = 0; r < 6; r++) {
    const y = ckY + 2 + r * 3;
    for (let c = 0; c < 3; c++) {
      put(ckX + 2 + c * 6, y, "checkin36");
    }
    put(ckX + ckW - 2, y, "screen36");
  }
  // 主连廊上也挂着几块屏
  for (let i = 0; i < 6; i++) put(28 + i * 4, cy - 1, "screen36", { wall: true });

  // ---- 登机口：26 座航站楼，每座 3 个 ----
  const pool = flightDestPool();
  let poolI = 0;
  const gates = [];
  for (const rm of rooms36) {
    for (let i = 0; i < 3; i++) {
      const gx = rm.x + 3 + i * 5;
      const gy = rm.y + 3;
      const dest = pool[poolI++ % pool.length];
      // 倒计时：约四成一开始就在"登机中"，其余慢慢等
      const cd = (Math.random() < 0.4)
        ? 200 + Math.floor(Math.random() * 800)
        : 1200 + Math.floor(Math.random() * 9000);
      const p = put(gx, gy, "gate36", {
        letter: rm.letter,
        gate: rm.letter + (i + 1),
        flight: "BTA-" + (100 + Math.floor(Math.random() * 8999)),
        dest,
        countdown: cd,
      });
      if (p) gates.push(p);
    }
    // 航站楼里的等候区：座椅、饮水机
    for (let i = 0; i < 4; i++) put(rm.x + 2 + i * 4, rm.y + 1, "seat36");
    put(rm.x + rm.w - 2, rm.y + 1, "watercooler36");
  }

  // ---- 连廊里的标识牌（互相矛盾 —— 非欧迷宫的提示）----
  const SIGN_ARROWS = ["↑", "↓", "←", "→", "↖", "↘"];
  for (let i = 0; i < 26; i++) {
    const x = 4 + Math.floor(Math.random() * (size - 10));
    const y = (Math.random() < 0.7) ? cy - 2 : cy + 2;
    put(x, y, "sign36", { arrow: SIGN_ARROWS[Math.floor(Math.random() * SIGN_ARROWS.length)],
      blank: Math.random() < 0.18 });
  }

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: rooms36,
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [],
  };
  map.gates = gates;
  map.carousels = carousels;
  map.spawnPts = [start];
  return map;
}

window.PROP_DRAW = window.PROP_DRAW || {};

// 行李转盘 —— 运转的那几条在动，静止的就是一截死掉的金属
window.PROP_DRAW["carousel36"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.30, T * 1.5, T * 0.16, 0, 0, Math.PI * 2); ctx.fill();
  // 传送带本体
  ctx.fillStyle = "#3a4048";
  ctx.beginPath(); ctx.ellipse(0, T * 0.10, T * 1.5, T * 0.18, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#555c66";
  ctx.beginPath(); ctx.ellipse(0, T * 0.06, T * 1.46, T * 0.16, 0, 0, Math.PI * 2); ctx.fill();
  // 履带的横条 —— 运转的会往前挪
  ctx.strokeStyle = p.on ? "rgba(30,34,40,0.85)" : "rgba(30,34,40,0.45)";
  ctx.lineWidth = 2;
  const off = p.on ? ((t * 0.9) % 1) : 0;
  for (let i = 0; i < 7; i++) {
    const u = (i / 7 + off) * 2 - 1;                       // -1 .. 1
    const x = u * T * 1.3;
    const half = Math.sqrt(Math.max(0, 1 - u * u)) * T * 0.14;
    ctx.beginPath(); ctx.moveTo(x, T * 0.06 - half); ctx.lineTo(x, T * 0.06 + half); ctx.stroke();
  }
  // 转盘上的行李
  if (p.on) {
    ctx.fillStyle = "#8a6a48";
    const bx = Math.cos(t * 0.9) * T * 1.2, by = T * 0.06 + Math.sin(t * 0.9) * T * 0.11;
    ctx.fillRect(bx - T * 0.10, by - T * 0.09, T * 0.20, T * 0.14);
    ctx.strokeStyle = "#5a4632"; ctx.lineWidth = 1;
    ctx.strokeRect(bx - T * 0.10, by - T * 0.09, T * 0.20, T * 0.14);
  }
  // 编号牌
  ctx.fillStyle = "#f0e8d4"; ctx.fillRect(-T * 0.20, -T * 0.34, T * 0.40, T * 0.14);
  ctx.strokeStyle = "#4a5058"; ctx.lineWidth = 1; ctx.strokeRect(-T * 0.20, -T * 0.34, T * 0.40, T * 0.14);
  ctx.fillStyle = "#2a2e34"; ctx.font = "bold 7px ui-monospace, monospace"; ctx.textAlign = "center";
  ctx.fillText(String(p.num || ""), 0, -T * 0.24); ctx.textAlign = "left";
};

// 值机柜台 —— 空无一人
window.PROP_DRAW["checkin36"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(0,0,0,0.26)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.30, T * 0.52, T * 0.10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#b8b0a0"; ctx.fillRect(-T * 0.50, -T * 0.06, T * 1.00, T * 0.34);
  ctx.fillStyle = "#cfc7b6"; ctx.fillRect(-T * 0.54, -T * 0.14, T * 1.08, T * 0.10);   // 台面
  ctx.strokeStyle = "#8a8272"; ctx.lineWidth = 1.2;
  ctx.strokeRect(-T * 0.50, -T * 0.06, T * 1.00, T * 0.34);
  // 柜台后的小屏
  ctx.fillStyle = "#20242c"; ctx.fillRect(-T * 0.14, -T * 0.40, T * 0.28, T * 0.20);
  ctx.fillStyle = "#60a0d0";
  ctx.fillRect(-T * 0.11, -T * 0.37, T * 0.22, T * 0.03);
  ctx.fillRect(-T * 0.11, -T * 0.32, T * 0.15, T * 0.03);
};

// 信息屏 —— 离港航班列表，倒计时一直在跳
window.PROP_DRAW["screen36"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  ctx.fillStyle = "#181c22";
  ctx.fillRect(-T * 0.52, -T * 0.60, T * 1.04, T * 1.00);
  ctx.strokeStyle = "#3a424c"; ctx.lineWidth = 2;
  ctx.strokeRect(-T * 0.52, -T * 0.60, T * 1.04, T * 1.00);
  // 表头
  ctx.fillStyle = "#e8b840"; ctx.font = "bold 6px ui-monospace, monospace"; ctx.textAlign = "center";
  ctx.fillText("DEPARTURES", 0, -T * 0.48);
  ctx.textAlign = "left";
  // 航班行
  const seed = (p.x * 31 + p.y * 17) | 0;
  for (let i = 0; i < 5; i++) {
    const y = -T * 0.38 + i * T * 0.17;
    const num = 100 + ((seed * (i + 3)) % 8999);
    const cd = Math.max(0, 9000 - ((t * 60 + seed * 7 + i * 1300) % 10000));
    const boarding = cd <= 1000;
    ctx.fillStyle = boarding ? "#e07040" : "#7a8490";
    ctx.font = "6px ui-monospace, monospace";
    ctx.fillText("BTA-" + num, -T * 0.46, y);
    ctx.textAlign = "right";
    ctx.fillText(boarding ? "BOARDING" : String(Math.round(cd)), T * 0.46, y);
    ctx.textAlign = "left";
  }
  // 屏幕自己的光
  const g = ctx.createRadialGradient(0, -T * 0.10, 1, 0, -T * 0.10, T * 0.85);
  g.addColorStop(0, "rgba(120,170,220,0.16)");
  g.addColorStop(1, "rgba(120,170,220,0)");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, -T * 0.10, T * 0.85, 0, Math.PI * 2); ctx.fill();
};

// 登机口 —— 倒计时归到 1000 就"登机"，那时它才是通往客机（36.1）的入口
window.PROP_DRAW["gate36"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  const cd = (p.countdown != null) ? p.countdown : 9999;
  const boarding = cd <= 1000 && cd > 0;
  const closed = cd <= 0;
  // 门框
  ctx.fillStyle = "#4a5058"; ctx.fillRect(-T * 0.46, -T * 0.62, T * 0.92, T * 1.10);
  ctx.fillStyle = closed ? "#20242a" : "#2c323a";
  ctx.fillRect(-T * 0.38, -T * 0.54, T * 0.76, T * 1.00);
  ctx.strokeStyle = "#5a626c"; ctx.lineWidth = 1.5;
  ctx.strokeRect(-T * 0.46, -T * 0.62, T * 0.92, T * 1.10);
  // 登机时门缝里透出光
  if (boarding) {
    const glow = 0.45 + Math.sin(t * 3) * 0.18;
    ctx.fillStyle = "rgba(120,200,255," + glow.toFixed(2) + ")";
    ctx.fillRect(-T * 0.38, -T * 0.54, T * 0.76, T * 1.00);
    ctx.fillStyle = "rgba(200,240,255,0.75)";
    ctx.fillRect(-T * 0.03, -T * 0.54, T * 0.06, T * 1.00);
  }
  // 门楣上的登机口编号
  ctx.fillStyle = "#f0e8d4"; ctx.fillRect(-T * 0.30, -T * 0.86, T * 0.60, T * 0.20);
  ctx.strokeStyle = "#3a4048"; ctx.lineWidth = 1; ctx.strokeRect(-T * 0.30, -T * 0.86, T * 0.60, T * 0.20);
  ctx.fillStyle = "#181c22"; ctx.font = "bold 9px ui-monospace, monospace"; ctx.textAlign = "center";
  ctx.fillText(String(p.gate || "?"), 0, -T * 0.72);
  // 航班号与倒计时
  ctx.font = "6px ui-monospace, monospace";
  ctx.fillStyle = "#c8d0d8";
  ctx.fillText(String(p.flight || ""), 0, -T * 0.30);
  ctx.fillStyle = closed ? "#6a4040" : (boarding ? "#70e090" : "#e8c860");
  ctx.fillText(closed ? "CLOSED" : (boarding ? "BOARDING" : String(Math.round(cd))), 0, -T * 0.16);
  if (boarding) {
    ctx.fillStyle = "#9ad8ff";
    ctx.fillText("→ 36.1", 0, T * 0.10);
  }
  ctx.textAlign = "left";
};

// 等候区的座椅 —— 一排排，旁边有插座
window.PROP_DRAW["seat36"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(0,0,0,0.24)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.28, T * 0.44, T * 0.08, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#8a94a0"; ctx.fillRect(-T * 0.42, -T * 0.06, T * 0.84, T * 0.16);   // 坐面
  ctx.fillStyle = "#7a8490"; ctx.fillRect(-T * 0.42, -T * 0.30, T * 0.84, T * 0.12);   // 靠背
  ctx.fillStyle = "#5a626c";                                                            // 扶手
  ctx.fillRect(-T * 0.44, -T * 0.20, T * 0.04, T * 0.16);
  ctx.fillRect(T * 0.40, -T * 0.20, T * 0.04, T * 0.16);
  ctx.fillStyle = "#4a525c";                                                            // 支腿
  ctx.fillRect(-T * 0.38, T * 0.10, T * 0.05, T * 0.16);
  ctx.fillRect(T * 0.33, T * 0.10, T * 0.05, T * 0.16);
};

// 饮水机
window.PROP_DRAW["watercooler36"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(0,0,0,0.24)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.32, T * 0.22, T * 0.06, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#d8d4c8"; ctx.fillRect(-T * 0.18, -T * 0.30, T * 0.36, T * 0.62);
  ctx.fillStyle = "#a8dce8"; ctx.fillRect(-T * 0.15, -T * 0.44, T * 0.30, T * 0.18);   // 水桶
  ctx.strokeStyle = "#8a8678"; ctx.lineWidth = 1;
  ctx.strokeRect(-T * 0.18, -T * 0.30, T * 0.36, T * 0.62);
  ctx.fillStyle = "#5a626c"; ctx.fillRect(-T * 0.08, -T * 0.16, T * 0.16, T * 0.06);
};

// 连廊里的标识牌 —— 箭头互相矛盾，有的干脆是空白的（空白 = 不可信）
window.PROP_DRAW["sign36"] = function (ctx, p, T) {
  ctx.fillStyle = "#3a4048"; ctx.fillRect(-T * 0.05, -T * 0.10, T * 0.10, T * 0.50);   // 立杆
  ctx.fillStyle = "#2a3038"; ctx.fillRect(-T * 0.34, -T * 0.52, T * 0.68, T * 0.44);
  ctx.strokeStyle = "#6a7280"; ctx.lineWidth = 1.5;
  ctx.strokeRect(-T * 0.34, -T * 0.52, T * 0.68, T * 0.44);
  ctx.textAlign = "center";
  if (p.blank) {
    ctx.strokeStyle = "#7a8290"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-T * 0.24, -T * 0.30); ctx.lineTo(T * 0.24, -T * 0.30); ctx.stroke();
  } else {
    ctx.fillStyle = "#e8e0c8"; ctx.font = "bold 13px ui-monospace, monospace";
    ctx.fillText(String(p.arrow || "↑"), 0, -T * 0.24);
  }
  ctx.textAlign = "left";
};

// ---------- 地面 / 墙面：永恒机场 ----------
// 抛光的水磨石 —— 浅米白，一格一块接缝，偶尔反着顶灯的光
function drawAirportFloor(ctx, px, py, T, tx, ty) {
  const n = ((tx * 73856093) ^ (ty * 19349663)) >>> 0;
  const base = ["#ded9cd", "#dad5c9", "#e2ddd1", "#d6d1c5"][n % 4];
  ctx.fillStyle = base;
  ctx.fillRect(px, py, T, T);
  // 水磨石里的碎石子
  ctx.fillStyle = "rgba(120,116,104,0.35)";
  for (let i = 0; i < 5; i++) {
    const a = ((n >> (i * 3)) % 97) / 97, b = ((n >> (i * 5 + 2)) % 89) / 89;
    ctx.fillRect(px + a * T * 0.9, py + b * T * 0.9, 2, 2);
  }
  // 接缝
  ctx.strokeStyle = "rgba(150,146,136,0.45)"; ctx.lineWidth = 1;
  ctx.strokeRect(px + 0.5, py + 0.5, T - 1, T - 1);
  // 抛光面的一道光
  if ((n % 11) === 0) {
    ctx.fillStyle = "rgba(255,255,255,0.10)";
    ctx.fillRect(px, py, T, T * 0.35);
  }
  return true;
}
// 白灰的墙板，底部一道深色踢脚
function drawAirportWall(ctx, px, py, T, tx, ty) {
  ctx.fillStyle = "#e6e2d8";
  ctx.fillRect(px, py, T, T);
  ctx.fillStyle = "rgba(0,0,0,0.10)";
  ctx.fillRect(px, py + T * 0.62, T, T * 0.38);
  ctx.fillStyle = "#8e8878";                       // 踢脚线
  ctx.fillRect(px, py + T * 0.82, T, Math.max(2, T * 0.18));
  ctx.strokeStyle = "rgba(160,156,146,0.55)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(px, py + T * 0.62); ctx.lineTo(px + T, py + T * 0.62); ctx.stroke();
  return true;
}

// 带飞机符号的指示牌 —— 在 Level 11 / Level 9 跟着它走，就能到永恒机场
window.PROP_DRAW["planesign36"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  ctx.fillStyle = "#5a6068"; ctx.fillRect(-T * 0.05, -T * 0.06, T * 0.10, T * 0.52);   // 立杆
  // 牌面
  ctx.fillStyle = "#20303f";
  ctx.fillRect(-T * 0.42, -T * 0.72, T * 0.84, T * 0.66);
  ctx.strokeStyle = "#8a949c"; ctx.lineWidth = 2;
  ctx.strokeRect(-T * 0.42, -T * 0.72, T * 0.84, T * 0.66);
  // 飞机符号
  ctx.fillStyle = "#f0e8d4";
  ctx.beginPath();
  ctx.moveTo(0, -T * 0.66);
  ctx.lineTo(T * 0.07, -T * 0.50);
  ctx.lineTo(T * 0.30, -T * 0.46);
  ctx.lineTo(T * 0.30, -T * 0.40);
  ctx.lineTo(T * 0.07, -T * 0.36);
  ctx.lineTo(T * 0.04, -T * 0.30);
  ctx.lineTo(T * 0.16, -T * 0.26);
  ctx.lineTo(T * 0.16, -T * 0.22);
  ctx.lineTo(0, -T * 0.26);
  ctx.lineTo(-T * 0.16, -T * 0.22);
  ctx.lineTo(-T * 0.16, -T * 0.26);
  ctx.lineTo(-T * 0.04, -T * 0.30);
  ctx.lineTo(-T * 0.07, -T * 0.36);
  ctx.lineTo(-T * 0.30, -T * 0.40);
  ctx.lineTo(-T * 0.30, -T * 0.46);
  ctx.lineTo(-T * 0.07, -T * 0.50);
  ctx.closePath(); ctx.fill();
  // 底下的编号 —— 会轻轻闪一下（机场的灯）
  const b = 0.72 + Math.abs(Math.sin(t * 1.2)) * 0.28;
  ctx.fillStyle = "rgba(240,200,90," + b.toFixed(2) + ")";
  ctx.font = "bold 11px ui-monospace, monospace"; ctx.textAlign = "center";
  ctx.fillText("36", 0, -T * 0.18);
  ctx.textAlign = "left";
};
