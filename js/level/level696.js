// ===========================================================
// Level 696 —— 无尽大楼
//   一座浅灰色混凝土的废弃建筑。窗户外面看不见天空，只看得见别的楼 ——
//   那些楼和这一栋一模一样，往上往下都望不到头。
//   本层做成 6×6 = 36 个"楼层格"，其中 32 个是档案里写明的楼层：
//     底层 / 0.5 / 1 / 1.5 / 2 / 2.5 / 3 / 3.5 / 4 / 4.5 / 5 / 5.5 / 6 / 6.5 /
//     7 / 7.5 / 8 / 8.5 / 9 / 9.5 / 10 / 30 楼 / 负楼层 …… 外加重要楼层若干。
//   楼层之间是墙 —— 打破（走门）就到结构完全不同的另一层；
//   每层还有一处楼梯直通下一层；底层有一部电梯，按钮成千上万。
//   出口：第 30 楼那件紫黑相间的故障物品 —— 碰上去到 Level 30。
// ===========================================================
"use strict";

(function () {
  const v = ["#b4b1a9", "#a5a29a", "#8b8880"];
  if (typeof regTile === "function") regTile("endless696", v);
  else { (window.__NEWTILE_EXTRA = window.__NEWTILE_EXTRA || {})["endless696"] = v; }
})();

// ---------- 楼层表 ----------
// fk = 地面种类，wk = 墙体种类，flip = 这一层是倒置的（物件从"天花板"往下挂）
const E696_ZONES = [
  { n: "底层", fk: "concrete", wk: "concrete" },
  { n: "0.5 层", fk: "concrete", wk: "concrete", blue: 1 },
  { n: "1 层", fk: "concrete", wk: "concrete" },
  { n: "1.5 层", fk: "metal", wk: "concrete" },
  { n: "2 层", fk: "wood", wk: "concrete" },
  { n: "2.5 层", fk: "wood", wk: "concrete" },
  { n: "3 层", fk: "concrete", wk: "concrete" },
  { n: "3.5 层", fk: "wood", wk: "wood" },
  { n: "4 层", fk: "concrete", wk: "concrete", dark: 1 },
  { n: "4.5 层", fk: "grass", wk: "sky" },
  { n: "5 层", fk: "concrete", wk: "concrete" },
  { n: "5.5 层", fk: "grass", wk: "sky" },
  { n: "6 层", fk: "concrete", wk: "concrete", blue: 1, flip: 1 },
  { n: "6.5 层", fk: "carpet", wk: "wood" },
  { n: "7 层", fk: "tile", wk: "concrete" },
  { n: "7.5 层", fk: "grass", wk: "glass" },
  { n: "8 层", fk: "tile", wk: "concrete" },
  { n: "8.5 层", fk: "tile", wk: "bars" },
  { n: "9 层", fk: "concrete", wk: "concrete", dust: 1 },
  { n: "9.5 层", fk: "tile", wk: "concrete" },
  { n: "10 层", fk: "concrete", wk: "concrete" },
  { n: "30 楼", fk: "glitch", wk: "glitch" },
  { n: "负楼层", fk: "glitch", wk: "glitch", deep: 1 },
  { n: "19 层", fk: "carpet", wk: "concrete" },
  { n: "90 层", fk: "water", wk: "concrete" },
  { n: "-6 层", fk: "invert", wk: "dark", flip: 1 },
  { n: "-61 层", fk: "dark", wk: "dark" },
  { n: "T8.1 层", fk: "acid", wk: "concrete" },
  { n: "A 层", fk: "light", wk: "light", flip: 1 },
  { n: "E9 层", fk: "info", wk: "info" },
  { n: "-Z6 层", fk: "grayworld", wk: "grayworld" },
  { n: "=) 层", fk: "party", wk: "party" },
];

function e696ZoneOf(map, tx, ty) {
  const z = map.zoneAt;
  if (!z || !z[ty]) return -1;
  return z[ty][tx] | 0;
}

// ---------- 地面 ----------
function e696Floor(ctx, px, py, h, map, tx, ty) {
  const zi = e696ZoneOf(map, tx, ty);
  const zd = zi >= 0 ? E696_ZONES[zi] : null;
  const k = zd ? zd.fk : "concrete";
  const S = TILE;
  const t = performance.now() / 1000;
  const n = () => (h * 0.5 + 0.5);

  if (k === "grass") {
    ctx.fillStyle = "#5d7a3e"; ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(120,158,74,0.55)";
    ctx.fillRect(px, py, S, S * 0.5);
    ctx.strokeStyle = "rgba(88,120,56,0.7)"; ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const gx = px + ((h * (i + 3) * 97) % 1) * S;
      const gy = py + ((h * (i + 7) * 53) % 1) * S;
      ctx.beginPath(); ctx.moveTo(gx, gy + 6); ctx.lineTo(gx + 1.5, gy - 3); ctx.stroke();
    }
    return true;
  }
  if (k === "wood") {
    ctx.fillStyle = "#8a6741"; ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(0,0,0,0.16)";
    ctx.fillRect(px, py + (S / 4) * (((tx + ty) % 4)), S, 2);
    ctx.fillRect(px, py, 1, S);
    ctx.fillStyle = "rgba(255,220,170,0.10)";
    ctx.fillRect(px, py, S, 3);
    return true;
  }
  if (k === "carpet") {
    ctx.fillStyle = "#6e3630"; ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(180,120,90,0.20)";
    ctx.fillRect(px + 4, py + 4, S - 8, S - 8);
    ctx.strokeStyle = "rgba(40,18,16,0.5)"; ctx.lineWidth = 1;
    ctx.strokeRect(px + 0.5, py + 0.5, S - 1, S - 1);
    return true;
  }
  if (k === "tile") {
    ctx.fillStyle = "#cfcdc6"; ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(150,148,140,0.45)";
    ctx.fillRect(px, py + S - 2, S, 2); ctx.fillRect(px + S - 2, py, 2, S);
    ctx.fillStyle = "rgba(255,255,255,0.18)"; ctx.fillRect(px, py, S, 3);
    return true;
  }
  if (k === "metal") {
    ctx.fillStyle = "#7d8189"; ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(255,255,255,0.12)"; ctx.fillRect(px, py, S, 4);
    ctx.fillStyle = "rgba(0,0,0,0.30)";
    for (let i = 0; i < 4; i++) {
      ctx.beginPath(); ctx.arc(px + 6 + i * 10, py + 6, 1.6, 0, 6.2832); ctx.fill();
      ctx.beginPath(); ctx.arc(px + 6 + i * 10, py + S - 6, 1.6, 0, 6.2832); ctx.fill();
    }
    return true;
  }
  if (k === "water") {
    ctx.fillStyle = "#3f6f84"; ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(150,210,230," + (0.14 + 0.10 * Math.sin(t * 1.7 + tx * 0.6 + ty * 0.4)).toFixed(3) + ")";
    ctx.fillRect(px, py + ((t * 12 + tx * 9) % S), S, 3);
    return true;
  }
  if (k === "invert") {
    ctx.fillStyle = "#3b3a42"; ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(230,230,240,0.16)"; ctx.fillRect(px, py, S, 5);
    ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.fillRect(px, py + S - 6, S, 6);
    return true;
  }
  if (k === "dark") {
    ctx.fillStyle = "#43434c"; ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(0,0,0,0.28)"; ctx.fillRect(px, py, S, S);
    if (h > 0.88) { ctx.fillStyle = "rgba(210,220,255,0.10)"; ctx.fillRect(px + 6, py + 6, S - 12, S - 12); }
    return true;
  }
  if (k === "acid") {
    ctx.fillStyle = "#8fae52"; ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(200,240,120," + (0.10 + 0.10 * Math.sin(t * 2 + tx)).toFixed(3) + ")";
    ctx.fillRect(px, py, S, S);
    ctx.strokeStyle = "rgba(60,90,30,0.55)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(px + S * h, py); ctx.lineTo(px + S * (1 - h), py + S); ctx.stroke();
    return true;
  }
  if (k === "light") {
    ctx.fillStyle = "#f2efe2"; ctx.fillRect(px, py, S, S);
    const a = 0.12 + 0.10 * Math.sin(t * 2.2 + (tx + ty) * 0.5);
    ctx.fillStyle = "rgba(255,255,240," + a.toFixed(3) + ")";
    ctx.fillRect(px, py, S, S);
    ctx.strokeStyle = "rgba(255,250,210,0.55)"; ctx.lineWidth = 1;
    ctx.strokeRect(px + 3.5, py + 3.5, S - 7, S - 7);
    return true;
  }
  if (k === "info") {
    ctx.fillStyle = "#9a9aa4"; ctx.fillRect(px, py, S, S);
    // 信息被这一层自己改写：整片地砖每隔几秒横向撕裂一次
    const ph = Math.floor(t * 1.6 + ty * 0.7) % 3;
    if (ph === 1) {
      ctx.fillStyle = "rgba(40,40,60,0.55)";
      ctx.fillRect(px, py + ((tx * 13) % (S - 6)), S, 4);
    } else if (ph === 2) {
      ctx.fillStyle = "rgba(255,255,255,0.22)";
      ctx.fillRect(px + ((ty * 7) % (S - 8)), py, 5, S);
    }
    return true;
  }
  if (k === "grayworld") {
    const g = 120 + Math.floor(n() * 26);
    ctx.fillStyle = "rgb(" + g + "," + g + "," + g + ")"; ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(255,255,255,0.10)"; ctx.fillRect(px, py, S, 3);
    return true;
  }
  if (k === "party") {
    ctx.fillStyle = "#c9c2b4"; ctx.fillRect(px, py, S, S);
    ctx.fillStyle = ["#e05a6a", "#e8c53a", "#5aa9e0", "#7ac06a"][(tx + ty) % 4];
    ctx.globalAlpha = 0.30; ctx.fillRect(px, py, S, S); ctx.globalAlpha = 1;
    return true;
  }
  if (k === "glitch") {
    // 紫黑相间、不停错位的故障地面
    const on = (Math.floor(t * 3.1) + tx + ty) % 2 === 0;
    ctx.fillStyle = on ? "#2a1030" : "#4a1d63"; ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(190,90,255,0.55)";
    ctx.fillRect(px, py + ((tx * 17 + Math.floor(t * 9)) % S), S, 2);
    if (h > 0.82) { ctx.fillStyle = "rgba(230,200,255,0.30)"; ctx.fillRect(px + 4, py + 4, S - 8, S - 8); }
    return true;
  }
  // 默认：浅灰混凝土 + 棕色的污渍（老楼在衰败）
  ctx.fillStyle = "#b4b1a9"; ctx.fillRect(px, py, S, S);
  ctx.fillStyle = "rgba(0,0,0," + (0.05 + 0.06 * n()).toFixed(3) + ")";
  ctx.fillRect(px, py, S, S);
  ctx.strokeStyle = "rgba(90,88,82,0.35)"; ctx.lineWidth = 1;
  ctx.strokeRect(px + 0.5, py + 0.5, S - 1, S - 1);
  if (h > 0.93) {                       // 墙根渗下来的棕色污渍
    ctx.fillStyle = "rgba(120,80,44,0.35)";
    ctx.beginPath(); ctx.ellipse(px + S * 0.5, py + S * 0.62, S * 0.30, S * 0.20, 0, 0, 6.2832); ctx.fill();
  }
  return true;
}

// ---------- 墙体 ----------
function e696Wall(ctx, px, py, h, map, tx, ty) {
  const zi = e696ZoneOf(map, tx, ty);
  const zd = zi >= 0 ? E696_ZONES[zi] : null;
  const k = zd ? zd.wk : "concrete";
  const S = TILE;
  const t = performance.now() / 1000;

  if (k === "sky") {                    // 4.5 / 5.5：从远处看，墙像是不存在
    ctx.fillStyle = "#8fb6cf"; ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.beginPath(); ctx.ellipse(px + S * 0.4, py + S * 0.4, S * 0.30, S * 0.16, 0, 0, 6.2832); ctx.fill();
    return true;
  }
  if (k === "glass") {                  // 7.5 室内空中花园：玻璃幕墙
    ctx.fillStyle = "#b8d2dc"; ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(255,255,255,0.30)"; ctx.fillRect(px, py, S * 0.35, S);
    ctx.strokeStyle = "rgba(70,90,96,0.7)"; ctx.lineWidth = 2;
    ctx.strokeRect(px + 1, py + 1, S - 2, S - 2);
    return true;
  }
  if (k === "bars") {                   // 8.5 监狱：铁栏
    ctx.fillStyle = "#6f7379"; ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "#adb3b9";
    for (let i = 0; i < 3; i++) ctx.fillRect(px + 4 + i * 13, py, 4, S);
    ctx.fillStyle = "#9aa0a6"; ctx.fillRect(px, py + S * 0.30, S, 4);
    ctx.fillRect(px, py + S * 0.72, S, 4);
    return true;
  }
  if (k === "wood") {
    ctx.fillStyle = "#6d5033"; ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(255,220,170,0.12)"; ctx.fillRect(px, py, S, 4);
    ctx.fillStyle = "rgba(0,0,0,0.28)"; ctx.fillRect(px, py + S - 5, S, 5);
    return true;
  }
  if (k === "dark") {
    ctx.fillStyle = "#33333b"; ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(0,0,0,0.30)"; ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(200,210,230,0.07)"; ctx.fillRect(px, py, S, 3);
    return true;
  }
  if (k === "light") {
    ctx.fillStyle = "#e9e6d8"; ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(255,255,235," + (0.16 + 0.10 * Math.sin(t * 1.8 + tx)).toFixed(3) + ")";
    ctx.fillRect(px, py, S, S);
    return true;
  }
  if (k === "grayworld") {
    ctx.fillStyle = "#7d7d7d"; ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(255,255,255,0.12)"; ctx.fillRect(px, py, S, 4);
    ctx.fillStyle = "rgba(0,0,0,0.26)"; ctx.fillRect(px, py + S - 5, S, 5);
    return true;
  }
  if (k === "party") {
    ctx.fillStyle = "#b9b2a4"; ctx.fillRect(px, py, S, S);
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = ["#e05a6a", "#e8c53a", "#5aa9e0"][i];
      ctx.fillRect(px, py + i * (S / 3), S, S / 6);
    }
    return true;
  }
  if (k === "glitch") {
    const on = (Math.floor(t * 3.1) + tx + ty) % 2 === 0;
    ctx.fillStyle = on ? "#160a1e" : "#33124a"; ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(200,110,255,0.45)";
    ctx.fillRect(px + ((ty * 11 + Math.floor(t * 7)) % S), py, 3, S);
    return true;
  }
  // 默认：浅灰混凝土墙 —— 顶面打亮、底部压暗，带往下淌的棕色污渍
  ctx.fillStyle = "#8b8880"; ctx.fillRect(px, py, S, S);
  ctx.fillStyle = "rgba(255,255,255,0.16)"; ctx.fillRect(px, py, S, Math.max(4, S * 0.18));
  ctx.fillStyle = "rgba(0,0,0,0.30)"; ctx.fillRect(px, py + S - Math.max(4, S * 0.16), S, Math.max(4, S * 0.16));
  if (h > 0.90) {                       // 老楼衰败：墙上一块块棕色的渍
    ctx.fillStyle = "rgba(118,78,42,0.40)";
    ctx.beginPath();
    ctx.ellipse(px + S * (0.25 + h * 0.4), py + S * (0.35 + (1 - h) * 0.3), S * 0.22, S * 0.34, 0, 0, 6.2832);
    ctx.fill();
  }
  ctx.strokeStyle = "rgba(0,0,0,0.28)"; ctx.lineWidth = 1;
  ctx.strokeRect(px + 0.5, py + 0.5, S - 1, S - 1);
  return true;
}

// 挂进批次绘制（levelBatch.js 比本文件先加载，所以这里包一层是安全的）
(function () {
  const bw = window.drawBatchWall, bf = window.drawBatchFloor;
  window.drawBatchWall = function (ctx, px, py, h, style, map, tx, ty) {
    if (style === "endless696") return e696Wall(ctx, px, py, h, map, tx, ty);
    return bw ? bw.apply(null, arguments) : false;
  };
  window.drawBatchFloor = function (ctx, px, py, h, style, map, tx, ty) {
    if (style === "endless696") return e696Floor(ctx, px, py, h, map, tx, ty);
    return bf ? bf.apply(null, arguments) : false;
  };
})();

// ---------- 物件模型 ----------
// 倒置的楼层（6 层 / -6 层 / A 层）：整件东西翻过来挂 —— 影子也跟着翻
window.PROP_DRAW = window.PROP_DRAW || {};
function e696reg(type, fn) {
  window.PROP_DRAW[type] = function (ctx, p, T) {
    if (p.flip) { ctx.save(); ctx.scale(1, -1); fn(ctx, p, T); ctx.restore(); }
    else fn(ctx, p, T);
  };
}
function e696shadow(ctx, T, w) {
  ctx.fillStyle = "rgba(0,0,0,0.26)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.30, (w || T * 0.34), T * 0.09, 0, 0, 6.2832); ctx.fill();
}

e696reg("e696almond", function (ctx, p, T) {
  e696shadow(ctx, T, T * 0.16);
  ctx.fillStyle = "#efe9cf"; ctx.fillRect(-T * 0.10, -T * 0.14, T * 0.20, T * 0.42);
  ctx.fillStyle = "#d6cfac"; ctx.fillRect(-T * 0.10, -T * 0.14, T * 0.05, T * 0.42);
  ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.fillRect(-T * 0.07, -T * 0.08, T * 0.03, T * 0.30);
  ctx.fillStyle = "#8a6a3a"; ctx.fillRect(-T * 0.055, -T * 0.28, T * 0.11, T * 0.15);
  ctx.fillStyle = "#5f4a2c"; ctx.fillRect(-T * 0.055, -T * 0.30, T * 0.11, T * 0.04);
});
e696reg("e696kitchen", function (ctx, p, T) {
  e696shadow(ctx, T, T * 0.40);
  ctx.fillStyle = "#9aa0a4"; ctx.fillRect(-T * 0.40, -T * 0.06, T * 0.80, T * 0.34);
  ctx.fillStyle = "#c3c8cb"; ctx.fillRect(-T * 0.40, -T * 0.09, T * 0.80, T * 0.05);
  ctx.fillStyle = "#5d6367";                                  // 水槽
  ctx.fillRect(-T * 0.26, -T * 0.02, T * 0.20, T * 0.13);
  ctx.fillStyle = "#8d9498"; ctx.fillRect(-T * 0.24, 0, T * 0.16, T * 0.10);
  ctx.fillStyle = "#4a4f52";                                  // 灶眼
  for (let i = 0; i < 2; i++) {
    ctx.beginPath(); ctx.arc(T * (0.06 + i * 0.18), T * 0.06, T * 0.07, 0, 6.2832); ctx.fill();
  }
  ctx.fillStyle = "rgba(30,30,30,0.8)"; ctx.fillRect(-T * 0.38, T * 0.12, T * 0.76, T * 0.05);
});
e696reg("e696sofa", function (ctx, p, T) {
  e696shadow(ctx, T, T * 0.40);
  ctx.fillStyle = "#6d5a4a"; ctx.fillRect(-T * 0.38, -T * 0.02, T * 0.76, T * 0.26);
  ctx.fillStyle = "#7d6956"; ctx.fillRect(-T * 0.38, -T * 0.16, T * 0.76, T * 0.16);
  ctx.fillStyle = "#5d4c3e"; ctx.fillRect(-T * 0.38, -T * 0.02, T * 0.10, T * 0.30);
  ctx.fillRect(T * 0.28, -T * 0.02, T * 0.10, T * 0.30);
  ctx.fillStyle = "rgba(0,0,0,0.20)"; ctx.fillRect(-T * 0.28, T * 0.02, T * 0.56, T * 0.03);
});
e696reg("e696toilet", function (ctx, p, T) {
  e696shadow(ctx, T, T * 0.24);
  ctx.fillStyle = "#e6e8e6"; ctx.fillRect(-T * 0.14, -T * 0.10, T * 0.28, T * 0.36);
  ctx.fillStyle = "#f4f6f4";
  ctx.beginPath(); ctx.ellipse(0, -T * 0.06, T * 0.15, T * 0.10, 0, 0, 6.2832); ctx.fill();
  ctx.fillStyle = "#d2d6d4"; ctx.fillRect(-T * 0.16, -T * 0.30, T * 0.32, T * 0.22);
  ctx.fillStyle = "#b9bebc"; ctx.fillRect(-T * 0.10, -T * 0.34, T * 0.20, T * 0.06);
});
e696reg("e696sink", function (ctx, p, T) {
  e696shadow(ctx, T, T * 0.24);
  ctx.fillStyle = "#c8ccc9"; ctx.fillRect(-T * 0.16, -T * 0.10, T * 0.32, T * 0.14);
  ctx.fillStyle = "#e2e6e3"; ctx.fillRect(-T * 0.14, -T * 0.08, T * 0.28, T * 0.09);
  ctx.fillStyle = "#9aa0a4"; ctx.fillRect(-T * 0.02, -T * 0.22, T * 0.04, T * 0.12);
  ctx.fillRect(-T * 0.16, T * 0.02, T * 0.32, T * 0.24);
});
e696reg("e696stair", function (ctx, p, T) {
  e696shadow(ctx, T, T * 0.36);
  for (let i = 0; i < 5; i++) {
    const yy = T * 0.26 - i * T * 0.13;
    ctx.fillStyle = i % 2 ? "#a7a49c" : "#95928b";
    ctx.fillRect(-T * 0.34, yy, T * 0.68 - i * T * 0.05, T * 0.13);
    ctx.fillStyle = "rgba(255,255,255,0.20)";
    ctx.fillRect(-T * 0.34, yy, T * 0.68 - i * T * 0.05, T * 0.03);
  }
  ctx.strokeStyle = "rgba(255,240,150,0.55)"; ctx.lineWidth = 2;   // 提示：这里能上下楼
  ctx.beginPath(); ctx.moveTo(0, -T * 0.36); ctx.lineTo(0, -T * 0.30);
  ctx.lineTo(-T * 0.08, -T * 0.22); ctx.moveTo(0, -T * 0.30); ctx.lineTo(T * 0.08, -T * 0.22);
  ctx.stroke();
});
e696reg("e696hole", function (ctx, p, T) {
  ctx.fillStyle = "#14121a";
  ctx.beginPath(); ctx.ellipse(0, T * 0.05, T * 0.36, T * 0.24, 0, 0, 6.2832); ctx.fill();
  ctx.strokeStyle = "rgba(120,110,96,0.9)"; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(0, T * 0.05, T * 0.36, T * 0.24, 0, 0, 6.2832); ctx.stroke();
  ctx.fillStyle = "rgba(150,90,220,0.35)";                 // 底下透上来的负楼层的光
  ctx.beginPath(); ctx.ellipse(0, T * 0.08, T * 0.22, T * 0.12, 0, 0, 6.2832); ctx.fill();
});
e696reg("e696bed", function (ctx, p, T) {
  e696shadow(ctx, T, T * 0.40);
  ctx.fillStyle = "#8a7a66"; ctx.fillRect(-T * 0.40, -T * 0.22, T * 0.80, T * 0.48);
  ctx.fillStyle = "#ded7c8"; ctx.fillRect(-T * 0.38, -T * 0.20, T * 0.66, T * 0.34);
  ctx.fillStyle = "#f0ece0";                                   // 枕头
  ctx.fillRect(-T * 0.36, -T * 0.18, T * 0.22, T * 0.14);
  ctx.fillStyle = "#9d8f7c"; ctx.fillRect(-T * 0.40, -T * 0.24, T * 0.80, T * 0.06);
});
e696reg("e696balcony", function (ctx, p, T) {
  e696shadow(ctx, T, T * 0.40);
  ctx.fillStyle = "#8f9096"; ctx.fillRect(-T * 0.42, -T * 0.06, T * 0.84, T * 0.08);
  for (let i = 0; i < 9; i++) {                               // 栏杆
    ctx.fillStyle = "#a8aab0";
    ctx.fillRect(-T * 0.40 + i * T * 0.095, -T * 0.26, T * 0.035, T * 0.22);
  }
  ctx.fillStyle = "#b0b2b8"; ctx.fillRect(-T * 0.42, -T * 0.28, T * 0.84, T * 0.04);
  // 栏杆外面：还是一栋栋一模一样的楼，往上往下都望不到头
  ctx.fillStyle = "#7e8288";
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(-T * 0.40 + i * T * 0.22, -T * 0.52, T * 0.16, T * 0.24);
    ctx.fillStyle = "rgba(210,220,230,0.35)";
    for (let r = 0; r < 3; r++) ctx.fillRect(-T * 0.37 + i * T * 0.22 + (r % 2) * T * 0.08, -T * 0.50 + r * T * 0.07, T * 0.05, T * 0.04);
    ctx.fillStyle = "#7e8288";
  }
});
e696reg("e696cake", function (ctx, p, T) {
  e696shadow(ctx, T, T * 0.22);
  ctx.fillStyle = "#d9cfc0"; ctx.fillRect(-T * 0.20, T * 0.02, T * 0.40, T * 0.10);
  ctx.fillStyle = "#c8a878"; ctx.fillRect(-T * 0.18, -T * 0.10, T * 0.36, T * 0.14);
  ctx.fillStyle = "#f2e2ea"; ctx.fillRect(-T * 0.18, -T * 0.16, T * 0.36, T * 0.07);
  ctx.fillStyle = "#b5473f";                                    // 上面那层"奶油"其实不是奶油
  ctx.beginPath(); ctx.arc(0, -T * 0.20, T * 0.05, 0, 6.2832); ctx.fill();
  ctx.strokeStyle = "rgba(60,40,30,0.5)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-T * 0.10, -T * 0.02); ctx.lineTo(T * 0.10, T * 0.08); ctx.stroke();
});
e696reg("e696dj", function (ctx, p, T) {
  e696shadow(ctx, T, T * 0.40);
  ctx.fillStyle = "#3b3f46"; ctx.fillRect(-T * 0.40, -T * 0.06, T * 0.80, T * 0.34);
  ctx.fillStyle = "#22252a"; ctx.fillRect(-T * 0.36, -T * 0.10, T * 0.72, T * 0.10);
  for (let i = 0; i < 2; i++) {                                 // 唱盘
    ctx.fillStyle = "#171a1e";
    ctx.beginPath(); ctx.arc(T * (-0.18 + i * 0.36), -T * 0.12, T * 0.11, 0, 6.2832); ctx.fill();
    ctx.fillStyle = "#6d737a";
    ctx.beginPath(); ctx.arc(T * (-0.18 + i * 0.36), -T * 0.12, T * 0.035, 0, 6.2832); ctx.fill();
  }
  const t = performance.now() / 1000;                           // 会转的灯球
  ctx.save(); ctx.translate(0, -T * 0.44);
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = ["#ff5a7a", "#ffd45a", "#5ad6ff", "#9a7aff", "#7aff9a", "#ff9a5a"][i];
    const a = t * 2.2 + i * 1.047;
    ctx.globalAlpha = 0.55 + 0.35 * Math.sin(t * 4 + i);
    ctx.fillRect(Math.cos(a) * T * 0.14, Math.sin(a) * T * 0.10, T * 0.06, T * 0.06);
  }
  ctx.globalAlpha = 1; ctx.restore();
  ctx.fillStyle = "#2b2e33"; ctx.fillRect(-T * 0.03, -T * 0.40, T * 0.06, T * 0.08);
});
e696reg("e696shelf", function (ctx, p, T) {
  e696shadow(ctx, T, T * 0.38);
  ctx.fillStyle = "#6b4f33"; ctx.fillRect(-T * 0.36, -T * 0.44, T * 0.72, T * 0.74);
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = "#543d27"; ctx.fillRect(-T * 0.34, -T * 0.40 + i * T * 0.18, T * 0.68, T * 0.04);
    if ((p.seed | 0) % 5 === i) {                               // 绝大多数是空的
      ctx.fillStyle = ["#8a5a3a", "#4a5a7a", "#7a4a4a"][i % 3];
      ctx.fillRect(-T * 0.30 + (i % 3) * T * 0.20, -T * 0.52 + i * T * 0.18, T * 0.10, T * 0.14);
    }
  }
});
e696reg("e696book", function (ctx, p, T) {
  e696shadow(ctx, T, T * 0.16);
  ctx.fillStyle = "#4a3358"; ctx.fillRect(-T * 0.14, -T * 0.06, T * 0.28, T * 0.16);
  ctx.fillStyle = "#d8d2c2"; ctx.fillRect(-T * 0.12, -T * 0.04, T * 0.24, T * 0.12);
  ctx.fillStyle = "#4a3358"; ctx.fillRect(-T * 0.14, -T * 0.06, T * 0.05, T * 0.16);
});
e696reg("e696desk", function (ctx, p, T) {
  e696shadow(ctx, T, T * 0.30);
  ctx.fillStyle = "#a0794e"; ctx.fillRect(-T * 0.30, -T * 0.06, T * 0.60, T * 0.07);
  ctx.fillStyle = "#7d5b39"; ctx.fillRect(-T * 0.26, T * 0.01, T * 0.05, T * 0.26);
  ctx.fillRect(T * 0.21, T * 0.01, T * 0.05, T * 0.26);
  ctx.fillStyle = "#8d6a44"; ctx.fillRect(-T * 0.30, -T * 0.16, T * 0.60, T * 0.06);
});
e696reg("e696board", function (ctx, p, T) {
  ctx.fillStyle = "#2f3a34"; ctx.fillRect(-T * 0.42, -T * 0.40, T * 0.84, T * 0.46);
  ctx.fillStyle = "#6b5334"; ctx.fillRect(-T * 0.45, T * 0.04, T * 0.90, T * 0.06);
  ctx.fillStyle = "rgba(230,230,230,0.55)";                     // 上面写的东西没人看得懂
  for (let i = 0; i < 3; i++) ctx.fillRect(-T * 0.36, -T * 0.34 + i * T * 0.11, T * (0.20 + (i * 0.17) % 0.4), T * 0.03);
});
e696reg("e696gas", function (ctx, p, T) {
  e696shadow(ctx, T, T * 0.20);
  const full = !!p.full;
  ctx.fillStyle = full ? "#c8a83a" : "#8d6f3a";
  ctx.fillRect(-T * 0.13, -T * 0.34, T * 0.26, T * 0.58);
  ctx.beginPath(); ctx.ellipse(0, -T * 0.34, T * 0.13, T * 0.07, 0, 0, 6.2832); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.22)"; ctx.fillRect(-T * 0.10, -T * 0.30, T * 0.05, T * 0.50);
  ctx.fillStyle = "#5d5f62"; ctx.fillRect(-T * 0.06, -T * 0.44, T * 0.12, T * 0.11);
  ctx.fillStyle = "rgba(30,30,30,0.7)";                          // 阀门
  ctx.beginPath(); ctx.arc(0, -T * 0.40, T * 0.05, 0, 6.2832); ctx.fill();
  if (full) {
    ctx.fillStyle = "rgba(240,230,150,0.85)";
    ctx.fillRect(-T * 0.09, -T * 0.14, T * 0.18, T * 0.10);
  }
});
e696reg("e696fridge", function (ctx, p, T) {
  e696shadow(ctx, T, T * 0.26);
  ctx.fillStyle = "#dfe2e0"; ctx.fillRect(-T * 0.20, -T * 0.46, T * 0.40, T * 0.72);
  ctx.fillStyle = "#c4c8c6"; ctx.fillRect(-T * 0.20, -T * 0.46, T * 0.40, T * 0.05);
  ctx.fillStyle = "#9aa0a4"; ctx.fillRect(T * 0.13, -T * 0.34, T * 0.04, T * 0.26);
  ctx.fillStyle = "rgba(40,44,46,0.55)";                         // 里面是空的，黑着
  ctx.fillRect(-T * 0.17, -T * 0.40, T * 0.34, T * 0.28);
});
e696reg("e696golf", function (ctx, p, T) {
  ctx.fillStyle = "#26301f";
  ctx.beginPath(); ctx.ellipse(0, T * 0.06, T * 0.13, T * 0.08, 0, 0, 6.2832); ctx.fill();
  ctx.fillStyle = "#8f9096"; ctx.fillRect(-T * 0.012, -T * 0.34, T * 0.024, T * 0.40);
  ctx.fillStyle = "#d94a4a";                                     // 旗
  ctx.beginPath(); ctx.moveTo(0, -T * 0.34); ctx.lineTo(T * 0.20, -T * 0.27); ctx.lineTo(0, -T * 0.20); ctx.fill();
});
e696reg("e696tree", function (ctx, p, T) {
  ctx.fillStyle = "rgba(0,0,0,0.24)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.30, T * 0.24, T * 0.08, 0, 0, 6.2832); ctx.fill();
  ctx.fillStyle = "#5b432a"; ctx.fillRect(-T * 0.05, -T * 0.06, T * 0.10, T * 0.36);
  ctx.fillStyle = "#3f6b34";
  ctx.beginPath(); ctx.arc(0, -T * 0.20, T * 0.26, 0, 6.2832); ctx.fill();
  ctx.fillStyle = "#4f8442";
  ctx.beginPath(); ctx.arc(-T * 0.10, -T * 0.26, T * 0.16, 0, 6.2832); ctx.fill();
  ctx.fillStyle = "rgba(210,240,180,0.20)";
  ctx.beginPath(); ctx.arc(-T * 0.06, -T * 0.30, T * 0.10, 0, 6.2832); ctx.fill();
});
e696reg("e696flower", function (ctx, p, T) {
  ctx.fillStyle = "#3f6b34"; ctx.fillRect(-T * 0.012, -T * 0.02, T * 0.024, T * 0.24);
  const cols = ["#e8657a", "#e8c53a", "#c98ce8", "#e8e8e8"];
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = cols[(p.seed + i) % 4];
    ctx.beginPath();
    ctx.arc(Math.cos(i * 1.256) * T * 0.07, -T * 0.14 + Math.sin(i * 1.256) * T * 0.07, T * 0.045, 0, 6.2832);
    ctx.fill();
  }
  ctx.fillStyle = "#f0d24a";
  ctx.beginPath(); ctx.arc(0, -T * 0.14, T * 0.035, 0, 6.2832); ctx.fill();
});
e696reg("e696cabinet", function (ctx, p, T) {
  e696shadow(ctx, T, T * 0.28);
  ctx.fillStyle = "#8b8f93"; ctx.fillRect(-T * 0.24, -T * 0.44, T * 0.48, T * 0.70);
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = "#76797d"; ctx.fillRect(-T * 0.21, -T * 0.38 + i * T * 0.22, T * 0.42, T * 0.16);
    ctx.fillStyle = "#b9bdc1"; ctx.fillRect(-T * 0.05, -T * 0.32 + i * T * 0.22, T * 0.10, T * 0.03);
  }
});
e696reg("e696chandelier", function (ctx, p, T) {
  ctx.fillStyle = "#8a7448"; ctx.fillRect(-T * 0.02, -T * 0.48, T * 0.04, T * 0.16);
  ctx.fillStyle = "#a08c58";
  ctx.beginPath(); ctx.ellipse(0, -T * 0.28, T * 0.26, T * 0.07, 0, 0, 6.2832); ctx.fill();
  const t = performance.now() / 1000;
  for (let i = 0; i < 5; i++) {
    const a = 0.6 + i * 0.52;
    const cx = Math.cos(a) * T * 0.22, cy = -T * 0.26 + Math.sin(a) * T * 0.10;
    ctx.fillStyle = "#f6e6b0";
    ctx.beginPath(); ctx.ellipse(cx, cy, T * 0.035, T * 0.055, 0, 0, 6.2832); ctx.fill();
    ctx.globalAlpha = 0.22 + 0.12 * Math.sin(t * 2 + i);
    ctx.fillStyle = "#ffe9a8";
    ctx.beginPath(); ctx.arc(cx, cy, T * 0.20, 0, 6.2832); ctx.fill();
    ctx.globalAlpha = 1;
  }
});
e696reg("e696portrait", function (ctx, p, T) {
  ctx.fillStyle = "#8a6a34"; ctx.fillRect(-T * 0.24, -T * 0.34, T * 0.48, T * 0.54);
  ctx.fillStyle = "#c8a464"; ctx.fillRect(-T * 0.20, -T * 0.30, T * 0.40, T * 0.46);
  ctx.fillStyle = "#3b3226";                                     // 画里的人 —— 脸是空的
  ctx.beginPath(); ctx.ellipse(0, -T * 0.06, T * 0.16, T * 0.22, 0, 0, 6.2832); ctx.fill();
  ctx.fillStyle = "#c8a464";
  ctx.beginPath(); ctx.ellipse(0, -T * 0.14, T * 0.09, T * 0.11, 0, 0, 6.2832); ctx.fill();
});
e696reg("e696elev", function (ctx, p, T) {
  e696shadow(ctx, T, T * 0.40);
  ctx.fillStyle = "#5c6167"; ctx.fillRect(-T * 0.42, -T * 0.46, T * 0.84, T * 0.80);
  ctx.fillStyle = "#8d9498"; ctx.fillRect(-T * 0.36, -T * 0.40, T * 0.36, T * 0.68);
  ctx.fillRect(T * 0.02, -T * 0.40, T * 0.34, T * 0.68);
  ctx.fillStyle = "rgba(220,240,255,0.35)";
  ctx.fillRect(-T * 0.34, -T * 0.38, T * 0.32, T * 0.64);
  ctx.fillRect(T * 0.04, -T * 0.38, T * 0.30, T * 0.64);
  ctx.fillStyle = "#2b2e33"; ctx.fillRect(-T * 0.02, -T * 0.40, T * 0.04, T * 0.68);
  // 按钮面板：成千上万错杂排列的按钮
  ctx.fillStyle = "#3a3e43"; ctx.fillRect(T * 0.16, -T * 0.30, T * 0.20, T * 0.44);
  for (let r = 0; r < 7; r++) for (let c = 0; c < 3; c++) {
    ctx.fillStyle = ((r * 3 + c) % 5 === 0) ? "#ffd45a" : "#c3c7cb";
    ctx.fillRect(T * 0.18 + c * T * 0.055, -T * 0.28 + r * T * 0.06, T * 0.04, T * 0.04);
  }
});
e696reg("e696stove", function (ctx, p, T) {
  e696shadow(ctx, T, T * 0.30);
  ctx.fillStyle = "#4c4f52"; ctx.fillRect(-T * 0.28, -T * 0.24, T * 0.56, T * 0.52);
  ctx.fillStyle = "#2f3234"; ctx.fillRect(-T * 0.24, -T * 0.20, T * 0.48, T * 0.22);
  const t = performance.now() / 1000;                            // 炉膛里的火
  ctx.fillStyle = "rgba(255,140,40," + (0.5 + 0.3 * Math.sin(t * 6 + (p.seed | 0))).toFixed(3) + ")";
  ctx.fillRect(-T * 0.20, -T * 0.16, T * 0.40, T * 0.14);
  ctx.fillStyle = "#6a6e72"; ctx.fillRect(-T * 0.28, -T * 0.30, T * 0.56, T * 0.08);
  ctx.fillStyle = "#8d9498"; ctx.fillRect(-T * 0.10, -T * 0.38, T * 0.20, T * 0.10);
});
e696reg("e696bars", function (ctx, p, T) {
  ctx.fillStyle = "#7f8389";
  for (let i = 0; i < 5; i++) ctx.fillRect(-T * 0.40 + i * T * 0.20, -T * 0.44, T * 0.05, T * 0.86);
  ctx.fillStyle = "#9aa0a6"; ctx.fillRect(-T * 0.42, -T * 0.44, T * 0.86, T * 0.05);
  ctx.fillRect(-T * 0.42, T * 0.36, T * 0.86, T * 0.05);
});
e696reg("e696dust", function (ctx, p, T) {
  ctx.fillStyle = "rgba(190,184,170,0.55)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.18, T * 0.34, T * 0.14, 0, 0, 6.2832); ctx.fill();
  ctx.strokeStyle = "rgba(220,216,204,0.65)"; ctx.lineWidth = 1;   // 蛛网
  for (let i = 0; i < 5; i++) {
    const a = i * 1.25;
    ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * T * 0.34, Math.sin(a) * T * 0.30); ctx.stroke();
  }
  for (let r = 1; r <= 3; r++) {
    ctx.beginPath();
    for (let i = 0; i <= 5; i++) {
      const a = i * 1.25, rr = r * T * 0.10;
      const x = Math.cos(a) * rr, y = Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
});
e696reg("e696cage", function (ctx, p, T) {
  e696shadow(ctx, T, T * 0.32);
  ctx.fillStyle = "#6d7176"; ctx.fillRect(-T * 0.30, -T * 0.36, T * 0.60, T * 0.62);
  ctx.fillStyle = "rgba(240,246,250,0.22)"; ctx.fillRect(-T * 0.28, -T * 0.34, T * 0.56, T * 0.58);
  ctx.strokeStyle = "#a8adb2"; ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath(); ctx.moveTo(-T * 0.24 + i * T * 0.12, -T * 0.34);
    ctx.lineTo(-T * 0.24 + i * T * 0.12, T * 0.24); ctx.stroke();
  }
  ctx.fillStyle = "#c8a070";                                     // 里面那只
  ctx.beginPath(); ctx.ellipse(0, T * 0.12, T * 0.10, T * 0.07, 0, 0, 6.2832); ctx.fill();
  ctx.beginPath(); ctx.arc(-T * 0.10, T * 0.04, T * 0.05, 0, 6.2832); ctx.fill();
  ctx.fillStyle = "#2b2b2b";
  ctx.fillRect(-T * 0.13, T * 0.01, T * 0.02, T * 0.02);
});
e696reg("e696map", function (ctx, p, T) {
  ctx.fillStyle = "#e6dfc8"; ctx.fillRect(-T * 0.44, -T * 0.34, T * 0.88, T * 0.60);
  ctx.fillStyle = "#8a6a34"; ctx.fillRect(-T * 0.46, -T * 0.36, T * 0.92, T * 0.04);
  ctx.fillRect(-T * 0.46, T * 0.24, T * 0.92, T * 0.04);
  // 海
  ctx.fillStyle = "#a8c4cf";
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.ellipse(-T * 0.34 + i * T * 0.18, -T * 0.14 + ((i * 7) % 3) * T * 0.12, T * 0.13, T * 0.07, 0, 0, 6.2832);
    ctx.fill();
  }
  // 陆地
  ctx.fillStyle = "#c8b48a";
  ctx.beginPath(); ctx.ellipse(-T * 0.10, -T * 0.10, T * 0.16, T * 0.11, 0, 0, 6.2832); ctx.fill();
  ctx.beginPath(); ctx.ellipse(T * 0.22, T * 0.02, T * 0.12, T * 0.09, 0, 0, 6.2832); ctx.fill();
  // 每个国家都被打了叉 —— 可这张图并不准确
  ctx.strokeStyle = "#b5473f"; ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    const cx = -T * 0.34 + i * T * 0.14, cy = -T * 0.18 + ((i * 5) % 4) * T * 0.11;
    ctx.beginPath();
    ctx.moveTo(cx - 4, cy - 4); ctx.lineTo(cx + 4, cy + 4);
    ctx.moveTo(cx + 4, cy - 4); ctx.lineTo(cx - 4, cy + 4); ctx.stroke();
  }
});
e696reg("e696glitch", function (ctx, p, T) {
  const t = performance.now() / 1000;
  const on = Math.floor(t * 3.1) % 2 === 0;
  ctx.fillStyle = on ? "#1a0a24" : "#3d1258";
  ctx.fillRect(-T * 0.30, -T * 0.34, T * 0.60, T * 0.62);
  ctx.fillStyle = "rgba(200,110,255,0.75)";                      // 紫黑相间，一直在错位
  for (let i = 0; i < 5; i++) {
    const yy = -T * 0.32 + ((i * 13 + Math.floor(t * 11)) % 26) * T * 0.024;
    ctx.fillRect(-T * 0.28, yy, T * 0.56, T * 0.02);
  }
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.fillRect(-T * 0.30 + ((Math.floor(t * 7) * 11) % 20) * T * 0.028, -T * 0.34, T * 0.06, T * 0.62);
  ctx.strokeStyle = "rgba(230,190,255," + (0.4 + 0.3 * Math.sin(t * 5)).toFixed(3) + ")";
  ctx.lineWidth = 2;
  ctx.strokeRect(-T * 0.32, -T * 0.36, T * 0.64, T * 0.66);
});
e696reg("e696party", function (ctx, p, T) {
  const cols = ["#e05a6a", "#e8c53a", "#5aa9e0", "#7ac06a", "#c07ae0"];
  const c = cols[(p.seed | 0) % 5];
  ctx.fillStyle = c;
  ctx.beginPath(); ctx.ellipse(0, -T * 0.18, T * 0.14, T * 0.18, 0, 0, 6.2832); ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.6)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, T * 0.02); ctx.quadraticCurveTo(T * 0.06, T * 0.22, 0, T * 0.34); ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.beginPath(); ctx.ellipse(-T * 0.05, -T * 0.24, T * 0.04, T * 0.05, 0, 0, 6.2832); ctx.fill();
});
e696reg("e696pond", function (ctx, p, T) {
  const t = performance.now() / 1000;
  ctx.fillStyle = "#3f6f84"; ctx.fillRect(-T * 0.46, -T * 0.40, T * 0.92, T * 0.80);
  ctx.strokeStyle = "rgba(190,230,245,0.5)"; ctx.lineWidth = 2;   // 一圈圈波纹
  for (let i = 0; i < 3; i++) {
    const rr = T * (0.12 + 0.10 * i) + Math.sin(t * 1.6 + i) * 3;
    ctx.beginPath(); ctx.ellipse(0, 0, rr, rr * 0.6, 0, 0, 6.2832); ctx.stroke();
  }
  ctx.fillStyle = "#4f7a3c";                                      // 岸边几丛芦苇
  for (let i = 0; i < 4; i++) {
    const x = -T * 0.36 + i * T * 0.24;
    ctx.fillRect(x, -T * 0.40, 2, T * 0.16);
  }
});
e696reg("e696window", function (ctx, p, T) {
  ctx.fillStyle = "#6e747a"; ctx.fillRect(-T * 0.36, -T * 0.38, T * 0.72, T * 0.66);
  ctx.fillStyle = "#93a4ad"; ctx.fillRect(-T * 0.32, -T * 0.34, T * 0.64, T * 0.58);
  // 窗外看不见天空 —— 只看得见对面那栋一模一样的楼
  ctx.fillStyle = "#7b8288"; ctx.fillRect(-T * 0.30, -T * 0.32, T * 0.60, T * 0.54);
  ctx.fillStyle = "rgba(220,230,240,0.40)";
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
    ctx.fillRect(-T * 0.26 + c * T * 0.15, -T * 0.28 + r * T * 0.17, T * 0.08, T * 0.09);
  }
  ctx.fillStyle = "#6e747a"; ctx.fillRect(-T * 0.02, -T * 0.34, T * 0.04, T * 0.58);
});
e696reg("e696bunk", function (ctx, p, T) {
  e696shadow(ctx, T, T * 0.32);
  ctx.fillStyle = "#767b80"; ctx.fillRect(-T * 0.30, -T * 0.40, T * 0.60, T * 0.10);
  ctx.fillRect(-T * 0.30, -T * 0.06, T * 0.60, T * 0.10);
  ctx.fillStyle = "#9aa0a4"; ctx.fillRect(-T * 0.30, -T * 0.40, T * 0.05, T * 0.44);
  ctx.fillRect(T * 0.25, -T * 0.40, T * 0.05, T * 0.44);
  ctx.fillStyle = "#b9bec2"; ctx.fillRect(-T * 0.26, -T * 0.38, T * 0.48, T * 0.06);
  ctx.fillRect(-T * 0.26, -T * 0.04, T * 0.48, T * 0.06);
});
e696reg("e696acidpool", function (ctx, p, T) {
  const t = performance.now() / 1000;
  ctx.fillStyle = "#9cbc5c"; ctx.fillRect(-T * 0.40, -T * 0.34, T * 0.80, T * 0.66);
  ctx.fillStyle = "rgba(220,250,150," + (0.16 + 0.12 * Math.sin(t * 2.4)).toFixed(3) + ")";
  ctx.fillRect(-T * 0.40, -T * 0.34, T * 0.80, T * 0.66);
  for (let i = 0; i < 4; i++) {                                  // 冒着的泡
    const ph = (t * 0.8 + i * 0.25) % 1;
    ctx.fillStyle = "rgba(240,255,200," + (0.5 * (1 - ph)).toFixed(3) + ")";
    ctx.beginPath();
    ctx.arc(-T * 0.24 + i * T * 0.16, T * 0.22 - ph * T * 0.44, 2 + i, 0, 6.2832); ctx.fill();
  }
});
e696reg("e696sign", function (ctx, p, T) {
  ctx.fillStyle = "#5c6167"; ctx.fillRect(-T * 0.03, T * 0.00, T * 0.06, T * 0.30);
  ctx.fillStyle = "#c8cdd1"; ctx.fillRect(-T * 0.30, -T * 0.24, T * 0.60, T * 0.24);
  ctx.fillStyle = "#2b2e33";                                     // 楼层号（画成刻痕，不写字）
  for (let i = 0; i < 3; i++) ctx.fillRect(-T * 0.22 + i * T * 0.14, -T * 0.16, T * 0.08, T * 0.08);
});

// ---------- 生成 ----------
function generateEndlessMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const props = [];
  const N = 6;                        // 6×6 = 36 个楼层格，用到前 32 个
  const margin = 3;
  const cellW = Math.floor((size - margin * 2) / N);
  const zoneAt = [];
  for (let y = 0; y < size; y++) { zoneAt.push(new Int16Array(size)); for (let x = 0; x < size; x++) zoneAt[y][x] = -1; }

  const cells = [];
  const cw = cellW - 1;               // 每格实际占的宽度（留 1 格墙）
  for (let k = 0; k < E696_ZONES.length; k++) {
    const i = k % N, j = (k / N) | 0;
    const x0 = margin + i * cellW, y0 = margin + j * cellW;
    const x1 = x0 + cw - 1, y1 = y0 + cw - 1;
    for (let y = y0 + 1; y <= y1 - 1; y++)
      for (let x = x0 + 1; x <= x1 - 1; x++) { grid[y][x] = 0; zoneAt[y][x] = k; }
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (zoneAt[y][x] < 0) zoneAt[y][x] = -2;
    cells.push({ k, i, j, x0, y0, x1, y1, cx: ((x0 + x1) / 2) | 0, cy: ((y0 + y1) / 2) | 0 });
  }
  // 楼层格之间开门：走过去就是结构完全不同的另一层
  // 注意：每格四周各有 1 格墙，两格之间其实隔着 3 格
  // （A 的右边框、中间那格、B 的左边框）—— 三格全打通人才走得过去。
  const openH = (a, b) => {
    const A = cells[a], B = cells[b];
    const y = randInt(A.y0 + 3, A.y1 - 3);
    for (let x = A.x1; x <= B.x0; x++) {
      grid[y][x] = 0;
      zoneAt[y][x] = (x <= A.x1 + 1 ? A.k : B.k);
    }
  };
  const openV = (a, b) => {
    const A = cells[a], B = cells[b];
    const x = randInt(A.x0 + 3, A.x1 - 3);
    for (let y = A.y1; y <= B.y0; y++) {
      grid[y][x] = 0;
      zoneAt[y][x] = (y <= A.y1 + 1 ? A.k : B.k);
    }
  };
  for (let k = 0; k < E696_ZONES.length; k++) {
    const i = k % N, j = (k / N) | 0;
    if (k === 22) continue;                       // 负楼层只能从底层的洞下去
    if (i < N - 1 && k + 1 < E696_ZONES.length && k + 1 !== 22) openH(k, k + 1);
    if (j < N - 1 && k + N < E696_ZONES.length && k + N !== 22) openV(k, k + N);
  }

  // ---------- 逐层摆东西 ----------
  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return null;
    if (grid[y][x] !== 0) return null;
    const p = Object.assign({ x, y, floor: 0, type, seed: randInt(0, 9) }, extra || {});
    props.push(p);
    return p;
  };
  const zone = (k) => cells[k];
  const inZone = (k, fx, fy) => {
    const c = zone(k);
    return {
      x: Math.round(c.x0 + 1 + (c.x1 - c.x0 - 3) * fx),
      y: Math.round(c.y0 + 1 + (c.y1 - c.y0 - 3) * fy),
    };
  };
  const scatter = (k, type, n, extra) => {
    for (let i = 0; i < n; i++) {
      const q = inZone(k, randInt(10, 90) / 100, randInt(10, 90) / 100);
      put(q.x, q.y, type, extra);
    }
  };

  // 0 底层：混凝土住宅 —— 厨房、客厅、浴室、通往下一层的楼梯、杏仁水、通向负楼层的洞
  {
    const c = zone(0);
    put(c.x0 + 3, c.y0 + 2, "e696kitchen");
    put(c.x0 + 6, c.y0 + 2, "e696kitchen");
    put(c.x0 + 3, c.y1 - 2, "e696sofa");
    put(c.x0 + 6, c.y1 - 2, "e696sofa");
    put(c.x1 - 3, c.y0 + 2, "e696toilet");
    put(c.x1 - 2, c.y0 + 4, "e696sink");
    put(c.x1 - 4, c.y1 - 3, "e696window");
    put(c.x0 + 2, c.y1 - 5, "e696window");
    scatter(0, "e696almond", 4);
    const s = put(c.cx, c.y1 - 4, "e696stair", { to: 1 });
    const h = put(c.cx + 2, c.cy, "e696hole", { to: 22 });
    const e = put(c.x0 + 2, c.cy, "e696elev", { hub: 1 });
    map696StairHint(s, "通往 0.5 层的楼梯");
    if (h) h.hole696 = 1;
    if (e) e.elev696 = 1;
  }
  // 1：0.5 层 —— 和底层一样，只是灯光是蓝的、墙更脏
  {
    const c = zone(1);
    put(c.x0 + 3, c.y0 + 2, "e696kitchen");
    put(c.x0 + 3, c.y1 - 2, "e696sofa");
    put(c.x1 - 3, c.y0 + 2, "e696toilet");
    scatter(1, "e696almond", 4);
    const s = put(c.cx, c.y1 - 4, "e696stair", { to: 2 });
    map696StairHint(s, "通往 1 层的楼梯");
  }
  // 2：1 层 —— 混凝土，浴室 / 卧室 / 阳台；有撬棍，很少杏仁水
  {
    const c = zone(2);
    put(c.x0 + 2, c.y0 + 2, "e696toilet");
    put(c.x0 + 4, c.y0 + 3, "e696sink");
    put(c.x1 - 4, c.y0 + 2, "e696bed");
    put(c.x1 - 4, c.cy, "e696balcony");
    put(c.x1 - 6, c.cy, "e696balcony");
    if (Math.random() < 0.6) scatter(2, "e696almond", 1);
    const s = put(c.cx, c.y1 - 4, "e696stair", { to: 3 });
    map696StairHint(s, "通往 1.5 层的楼梯");
  }
  // 3：1.5 层 —— DJ 室 + 一个不可食用的蛋糕
  {
    const c = zone(3);
    put(c.cx, c.y0 + 3, "e696dj");
    put(c.cx - 4, c.cy + 2, "e696cake");
    const s = put(c.cx, c.y1 - 4, "e696stair", { to: 4 });
    map696StairHint(s, "通往 2 层的楼梯");
  }
  // 4：2 层 —— 空图书馆，书很少
  {
    const c = zone(4);
    for (let i = 0; i < 6; i++) put(c.x0 + 2 + (i % 3) * 5, c.y0 + 2 + ((i / 3) | 0) * 6, "e696shelf");
    scatter(4, "e696book", 3);
    const s = put(c.cx, c.y1 - 4, "e696stair", { to: 5 });
    map696StairHint(s, "通往 2.5 层的楼梯");
  }
  // 5：2.5 层 —— 大学的班级
  {
    const c = zone(5);
    for (let i = 0; i < 6; i++) put(c.x0 + 2 + (i % 3) * 5, c.y0 + 3 + ((i / 3) | 0) * 5, "e696desk");
    put(c.cx, c.y0 + 2, "e696board");
    scatter(5, "e696book", 2);
    const s = put(c.cx, c.y1 - 4, "e696stair", { to: 6 });
    map696StairHint(s, "通往 3 层的楼梯");
  }
  // 6：3 层 —— 四周放着空的煤气罐（空的也能点着，一炸就没命）
  {
    const c = zone(6);
    for (let i = 0; i < 8; i++) {
      const q = inZone(6, [0.05, 0.5, 0.95][i % 3], [0.1, 0.5, 0.9][(i / 3) | 0]);
      put(q.x, q.y, "e696gas", { full: false });
    }
    const s = put(c.cx, c.y1 - 4, "e696stair", { to: 7 });
    map696StairHint(s, "通往 3.5 层的楼梯");
  }
  // 7：3.5 层 —— 木质公寓，空冰箱，光线充足
  {
    const c = zone(7);
    put(c.x0 + 2, c.y0 + 2, "e696fridge");
    put(c.x1 - 3, c.y1 - 3, "e696bed");
    put(c.cx, c.cy, "e696window");
    const s = put(c.cx, c.y1 - 4, "e696stair", { to: 8 });
    map696StairHint(s, "通往 4 层的楼梯");
  }
  // 8：4 层 —— 大量杏仁水（装在煤气罐里），灯通常是坏的
  {
    const c = zone(8);
    for (let i = 0; i < 8; i++) {
      const q = inZone(8, randInt(8, 92) / 100, randInt(8, 92) / 100);
      put(q.x, q.y, "e696gas", { full: true });
    }
    const s = put(c.cx, c.y1 - 4, "e696stair", { to: 9 });
    map696StairHint(s, "通往 4.5 层的楼梯");
  }
  // 9：4.5 层 —— 高尔夫球场，没有球，只有几百个洞
  {
    scatter(9, "e696golf", 16);
    const c = zone(9);
    const s = put(c.cx, c.y1 - 4, "e696stair", { to: 10 });
    map696StairHint(s, "通往 5 层的楼梯");
  }
  // 10：5 层 —— 废弃办公楼
  {
    scatter(10, "e696cabinet", 8);
    const c = zone(10);
    const s = put(c.cx, c.y1 - 4, "e696stair", { to: 11 });
    map696StairHint(s, "通往 5.5 层的楼梯");
  }
  // 11：5.5 层 —— 花园
  {
    scatter(11, "e696tree", 7);
    scatter(11, "e696flower", 10);
    const c = zone(11);
    const s = put(c.cx, c.y1 - 4, "e696stair", { to: 12 });
    map696StairHint(s, "通往 6 层的楼梯");
  }
  // 12：6 层 —— 0.5 层的倒置版
  {
    const c = zone(12);
    put(c.x0 + 3, c.y0 + 2, "e696kitchen", { flip: 1 });
    put(c.x0 + 3, c.y1 - 2, "e696sofa", { flip: 1 });
    scatter(12, "e696almond", 3, { flip: 1 });
    const s = put(c.cx, c.y1 - 4, "e696stair", { to: 13 });
    map696StairHint(s, "通往 6.5 层的楼梯");
  }
  // 13：6.5 层 —— 老式宅邸
  {
    const c = zone(13);
    put(c.cx, c.y0 + 3, "e696chandelier");
    put(c.x0 + 2, c.cy, "e696portrait");
    put(c.x1 - 3, c.cy, "e696portrait");
    put(c.cx, c.y1 - 3, "e696bed");
    const s = put(c.cx + 3, c.y1 - 4, "e696stair", { to: 14 });
    map696StairHint(s, "通往 7 层的楼梯");
  }
  // 14：7 层 —— 电梯间，要找到带 8 的按钮
  {
    const c = zone(14);
    const e = put(c.cx, c.cy, "e696elev", { to: 16 });
    if (e) e.elev8 = 1;
    const s = put(c.cx, c.y1 - 4, "e696stair", { to: 15 });
    map696StairHint(s, "通往 7.5 层的楼梯");
  }
  // 15：7.5 层 —— 室内空中花园，远看墙像是不存在
  {
    scatter(15, "e696tree", 6);
    scatter(15, "e696flower", 8);
    const c = zone(15);
    const s = put(c.cx, c.y1 - 4, "e696stair", { to: 16 });
    map696StairHint(s, "通往 8 层的楼梯");
  }
  // 16：8 层 —— 几个带烧烤箱的炉子
  {
    scatter(16, "e696stove", 6);
    const c = zone(16);
    const s = put(c.cx, c.y1 - 4, "e696stair", { to: 17 });
    map696StairHint(s, "通往 8.5 层的楼梯");
  }
  // 17：8.5 层 —— 监狱
  {
    const c = zone(17);
    for (let i = 0; i < 4; i++) put(c.x0 + 3 + i * 5, c.cy, "e696bars");
    put(c.x0 + 2, c.y0 + 2, "e696bunk");
    put(c.x1 - 3, c.y1 - 3, "e696bunk");
    const s = put(c.cx, c.y1 - 4, "e696stair", { to: 18 });
    map696StairHint(s, "通往 9 层的楼梯");
  }
  // 18：9 层 —— 空置、布满灰尘
  {
    scatter(18, "e696dust", 10);
    const c = zone(18);
    const s = put(c.cx, c.y1 - 4, "e696stair", { to: 19 });
    map696StairHint(s, "通往 9.5 层的楼梯");
  }
  // 19：9.5 层 —— 动物收容所
  {
    scatter(19, "e696cage", 8);
    const c = zone(19);
    const s = put(c.cx, c.y1 - 4, "e696stair", { to: 20 });
    map696StairHint(s, "通往 10 层的楼梯");
  }
  // 20：10 层 —— 现实世界的地图，每个国家都打了叉
  {
    const c = zone(20);
    put(c.cx - 2, c.cy, "e696map");
    put(c.cx + 3, c.cy, "e696map");
    const s = put(c.cx, c.y1 - 4, "e696stair", { to: 21 });
    map696StairHint(s, "通往 30 楼的楼梯");
  }
  // 21：30 楼 —— 出口：紫黑相间的故障物品
  {
    const c = zone(21);
    for (let i = 0; i < 5; i++) {
      const q = inZone(21, randInt(12, 88) / 100, randInt(12, 88) / 100);
      const p = put(q.x, q.y, "e696glitch");
      if (p) p.exit30 = 1;
    }
  }
  // 22：负楼层 —— 从底层的洞下来的地方；再往下就越来越不对劲
  {
    const c = zone(22);
    for (let i = 0; i < 4; i++) {
      const q = inZone(22, randInt(15, 85) / 100, randInt(15, 85) / 100);
      put(q.x, q.y, "e696glitch", { deepGlitch: 1 });
    }
    const s = put(c.cx, c.y0 + 2, "e696stair", { to: 0, back: 1 });
    map696StairHint(s, "一段向上的楼梯 —— 回到底层");
  }
  // 23：19 层 —— 全是床，可以在这里休息
  {
    scatter(23, "e696bed", 10);
  }
  // 24：90 层 —— 一个水塘
  {
    const c = zone(24);
    put(c.cx, c.cy, "e696pond");
  }
  // 25：-6 层 —— 与 Level 1.5 相似（倒置）
  {
    const c = zone(25);
    put(c.cx - 3, c.cy, "e696sofa", { flip: 1 });
    put(c.cx + 3, c.cy, "e696bed", { flip: 1 });
    put(c.cx, c.y0 + 2, "e696window", { flip: 1 });
  }
  // 26：-61 层 —— 光照异常
  {
    const c = zone(26);
    for (let i = 0; i < 3; i++) put(c.x0 + 3 + i * 6, c.cy, "e696sign");
  }
  // 27：T8.1 层 —— 地板是固体酸
  {
    scatter(27, "e696acidpool", 5);
  }
  // 28：A 层 —— 由能触摸的光做成，而且是倒置的
  {
    const c = zone(28);
    scatter(28, "e696flower", 6, { flip: 1 });
    put(c.cx, c.cy, "e696chandelier", { flip: 1 });
  }
  // 29：E9 层 —— 影响所有与它相关的信息
  {
    const c = zone(29);
    for (let i = 0; i < 5; i++) put(c.x0 + 3 + i * 4, c.cy, "e696sign");
  }
  // 30：-Z6 层 —— 和现实世界一样，但全是灰的
  {
    scatter(30, "e696tree", 5);
    put(zone(30).cx, zone(30).cy, "e696window");
  }
  // 31：=) 层 —— 一场派对，但这次是安全的
  {
    scatter(31, "e696party", 12);
    put(zone(31).cx, zone(31).cy, "e696cake");
    put(zone(31).cx + 2, zone(31).cy + 2, "e696dj");
  }

  const floors = collectFloors(grid, size);
  const start = { x: zone(0).cx, y: zone(0).cy, floor: 0 };

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [cells],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [],
    zoneAt,                       // 每格属于哪一层楼
    zoneCells: cells,             // 各楼层格的中心（电梯 / 楼梯用）
    zoneNames: E696_ZONES.map((z) => z.n),
    pools: new Set(),
  };
  makeDoorsMap(map);
  return map;
}
function map696StairHint(s, txt) { if (s) s.stairHint = txt; }
window.generateEndlessMap = generateEndlessMap;
window.E696_ZONES = E696_ZONES;
window.e696ZoneOf = e696ZoneOf;

// ---------- Level 7 里那片水（通往本层的入口）----------
// 平时是海面上普普通通的一小块，待够两分钟之后，水色开始往下陷。
window.PROP_DRAW["water696"] = function (ctx, p, T) {
  const t = performance.now() / 1000;
  ctx.fillStyle = "rgba(30,60,74,0.55)";
  ctx.beginPath(); ctx.ellipse(0, 0, T * 0.46, T * 0.34, 0, 0, 6.2832); ctx.fill();
  ctx.strokeStyle = "rgba(150,210,230," + (0.30 + 0.22 * Math.sin(t * 2.2)).toFixed(3) + ")";
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const rr = T * (0.12 + 0.13 * i) + Math.sin(t * 1.8 + i) * 3;
    ctx.beginPath(); ctx.ellipse(0, 0, rr, rr * 0.62, 0, 0, 6.2832); ctx.stroke();
  }
  // 往下陷的那个旋涡
  ctx.strokeStyle = "rgba(190,150,240," + (0.24 + 0.18 * Math.sin(t * 3)).toFixed(3) + ")";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  for (let i = 0; i < 26; i++) {
    const a = i * 0.42 + t * 1.4;
    const rr = T * 0.06 + i * T * 0.010;
    const x = Math.cos(a) * rr, y = Math.sin(a) * rr * 0.7;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
};
