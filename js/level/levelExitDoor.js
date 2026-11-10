// ===========================================================
// 通用出口门 —— 给还没有专属门的层级补上出口
//
// 以前每加一个层级都要在 main.js 的 switch 里登记一次门的类型，
// 漏登记的就是"门画在那儿、按 E 却毫无反应"。现在交互那边统一认
// toLevel 字段，这里再补一个所有层级都能复用的门的建模：
//
//   props.push({ x, y, floor: 0, type: "exitdoor",
//                toLevel: 11, tint: "#6b4a2a", label: "L11", tip: "……" })
//
// 门牌上写明目标层级，玩家不靠近也能一眼看出这扇门通到哪儿。
// ===========================================================
"use strict";

window.PROP_DRAW = window.PROP_DRAW || {};

// -----------------------------------------------------------
// 出口放置器：从出生点做一次 BFS，挑一个"走得到、且离出生点够远"的
// 地板放出口。以前很多层级是直接写 put(size-5, size-5, ...)，那一格
// 常常是墙，put 遇到墙会静默丢弃 —— 结果就是整层一个出口都没有。
//
//   placeExitDoor(grid, size, start, props, { to, label, tint, tip, side })
//   side: far(默认，最远) / top / bottom / left / right
// -----------------------------------------------------------
window.placeExitDoor = function (grid, size, start, props, opt) {
  opt = opt || {};
  const taken = new Set();
  for (const p of (props || [])) taken.add(p.x + "," + p.y);
  const sx = Math.max(1, Math.min(size - 2, start.x | 0));
  const sy = Math.max(1, Math.min(size - 2, start.y | 0));
  if (!grid[sy] || grid[sy][sx] !== 0) return null;

  const dist = new Map();
  const order = [];
  dist.set(sx + "," + sy, 0);
  const q = [[sx, sy]];
  while (q.length) {
    const cur = q.shift();
    const [x, y] = cur;
    order.push([x, y]);
    const d = dist.get(x + "," + y);
    for (let i = 0; i < 4; i++) {
      const dx = [1, -1, 0, 0][i], dy = [0, 0, 1, -1][i];
      const nx = x + dx, ny = y + dy, k = nx + "," + ny;
      if (nx < 1 || ny < 1 || nx >= size - 1 || ny >= size - 1) continue;
      if (!grid[ny] || grid[ny][nx] !== 0) continue;
      if (dist.has(k)) continue;
      dist.set(k, d + 1);
      q.push([nx, ny]);
    }
  }

  const side = opt.side || "far";
  let cand = order.slice();
  if (side === "far") cand.sort((a, b) => (dist.get(b[0] + "," + b[1]) || 0) - (dist.get(a[0] + "," + a[1]) || 0));
  else if (side === "bottom") cand.sort((a, b) => b[1] - a[1]);
  else if (side === "top") cand.sort((a, b) => a[1] - b[1]);
  else if (side === "left") cand.sort((a, b) => a[0] - b[0]);
  else if (side === "right") cand.sort((a, b) => b[0] - a[0]);

  const minD = opt.minDist != null ? opt.minDist : 10;
  for (const [x, y] of cand) {
    if (taken.has(x + "," + y)) continue;
    if ((dist.get(x + "," + y) || 0) < minD) continue;
    const pr = { x, y, floor: 0, type: opt.type || "exitdoor", toLevel: opt.to };
    if (opt.tint) pr.tint = opt.tint;
    if (opt.label != null) pr.label = opt.label;
    if (opt.tip) pr.tip = opt.tip;
    if (opt.edge) pr.edge = opt.edge;
    props.push(pr);
    return pr;
  }
  return null;
};

// 把 #rrggbb 按系数调暗 / 调亮
function _shade(hex, k) {
  const h = String(hex || "#6b4a2a").replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16);
  if (isNaN(n)) return "#6b4a2a";
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  r = Math.max(0, Math.min(255, Math.round(r * k)));
  g = Math.max(0, Math.min(255, Math.round(g * k)));
  b = Math.max(0, Math.min(255, Math.round(b * k)));
  return "rgb(" + r + "," + g + "," + b + ")";
}

window.PROP_DRAW["exitdoor"] = function (ctx, p, T) {
  const tint = p.tint || "#6b4a2a";
  const dark = _shade(tint, 0.45);
  const deep = _shade(tint, 0.28);
  const lite = _shade(tint, 1.35);
  const w = T * 0.84, h = T * 0.92;

  // 门洞：门后面是黑的
  ctx.fillStyle = "#0a0a08";
  ctx.fillRect(-w / 2 - 2, -h / 2 - 2, w + 4, h + 2);

  // 门框
  ctx.fillStyle = deep;
  ctx.fillRect(-w / 2, -h / 2, w, h);

  // 门板
  ctx.fillStyle = tint;
  ctx.fillRect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 5);
  // 左侧高光 / 右侧压暗 —— 给一点体积
  ctx.fillStyle = lite; ctx.globalAlpha = 0.35;
  ctx.fillRect(-w / 2 + 3, -h / 2 + 3, 3, h - 5);
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = dark;
  ctx.fillRect(w / 2 - 6, -h / 2 + 3, 3, h - 5);
  ctx.globalAlpha = 1;

  // 门板上下两道压条
  ctx.fillStyle = dark;
  ctx.fillRect(-w / 2 + 6, -h / 2 + 8, w - 12, 2);
  ctx.fillRect(-w / 2 + 6, h / 2 - 14, w - 12, 2);

  // 门把手
  ctx.fillStyle = "#c9a94e";
  ctx.beginPath(); ctx.arc(w / 2 - 9, 1, Math.max(1.6, T * 0.055), 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.beginPath(); ctx.arc(w / 2 - 9, 1, Math.max(0.7, T * 0.022), 0, Math.PI * 2); ctx.fill();

  // 门牌：写明目标层级
  const label = p.label != null ? String(p.label) : (p.toLevel != null ? String(p.toLevel) : "");
  if (label) {
    const pw = w * 0.62, ph = Math.max(7, T * 0.26);
    const py = -h / 2 + 11;
    ctx.fillStyle = "#e8e2cd";
    ctx.fillRect(-pw / 2, py, pw, ph);
    ctx.strokeStyle = "#8a7f63"; ctx.lineWidth = 1;
    ctx.strokeRect(-pw / 2, py, pw, ph);
    ctx.fillStyle = "#2a2318";
    ctx.font = "bold " + Math.max(6, Math.round(ph * 0.76)) + "px ui-monospace, monospace";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(label, 0, py + ph / 2 + 0.5);
    ctx.textAlign = "start"; ctx.textBaseline = "alphabetic";
  }

  // 出口的一点提示：门缝下透出的光
  ctx.fillStyle = "rgba(255,236,190,0.55)";
  ctx.fillRect(-w / 2 + 4, h / 2 - 5, w - 8, 2);
};

// 出口也可能是一道"缺口 / 裂口"而不是门（比如战壕、矿洞、虚空）
window.PROP_DRAW["exitgap"] = function (ctx, p, T) {
  const tint = p.tint || "#1b1b1f";
  const w = T * 0.9, h = T * 0.9;
  // 一圈不规则的暗色边缘
  ctx.fillStyle = _shade(tint, 0.6);
  ctx.beginPath();
  ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  // 里面是纯黑 —— 看不出有多深
  ctx.fillStyle = "#050506";
  ctx.beginPath();
  ctx.ellipse(0, 0, w / 2 - T * 0.09, h / 2 - T * 0.09, 0, 0, Math.PI * 2);
  ctx.fill();
  // 边缘一圈微光，免得玩家看不出这里能下去
  ctx.strokeStyle = p.edge || "rgba(190,205,225,0.5)";
  ctx.lineWidth = Math.max(1, T * 0.045);
  ctx.beginPath();
  ctx.ellipse(0, 0, w / 2 - T * 0.05, h / 2 - T * 0.05, 0, 0, Math.PI * 2);
  ctx.stroke();
};

// -----------------------------------------------------------
// Level 5 → Level 6 / Level 6 → Level 7 的楼梯
// 以前这两个 type 没有专属建模，被通用分支画成了一张四条腿的桌子 ——
// 玩家看到的是"出口是一张桌子"。这里补上真正的一段混凝土楼梯。
// -----------------------------------------------------------
function drawStairExit(ctx, p, T, downward) {
  const label = p.label != null ? String(p.label) : (downward ? "L6" : "L7");
  const w = T * 0.88, h = T * 0.92;

  // 楼梯口：门后面的黑
  ctx.fillStyle = "#08090b";
  ctx.fillRect(-w / 2 - 2, -h / 2 - 2, w + 4, h + 2);
  // 水泥的框
  ctx.fillStyle = "#4a4f56";
  ctx.fillRect(-w / 2, -h / 2, w, h);

  // 一级一级往下：踏面 + 立面，越往下越暗（看不见底）
  const steps = 5;
  for (let i = 0; i < steps; i++) {
    const k = i / steps;
    const yTop = -h / 2 + 4 + i * ((h - 8) / steps);
    const sh = (h - 8) / steps;
    const inset = k * w * 0.16;
    // 踏面（横的那一块）
    ctx.fillStyle = "rgb(" + Math.round(108 - k * 46) + "," + Math.round(112 - k * 48) + "," + Math.round(118 - k * 50) + ")";
    ctx.fillRect(-w / 2 + 4 + inset, yTop, w - 8 - inset * 2, sh * 0.42);
    // 踏面前沿的高光
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillRect(-w / 2 + 4 + inset, yTop, w - 8 - inset * 2, 1.6);
    // 立面（竖的那一块）：往下的一段，明显更暗
    ctx.fillStyle = "rgb(" + Math.round(70 - k * 40) + "," + Math.round(74 - k * 42) + "," + Math.round(80 - k * 44) + ")";
    ctx.fillRect(-w / 2 + 4 + inset, yTop + sh * 0.42, w - 8 - inset * 2, sh * 0.58);
  }
  // 最底下那一级之后是黑的 —— 看不出有多深
  ctx.fillStyle = "#050608";
  ctx.fillRect(-w / 2 + 4 + w * 0.16, -h / 2 + 4 + (h - 8) * 0.86, w - 8 - w * 0.32, (h - 8) * 0.14);

  // 两侧的扶手：一根斜着往下的金属管
  ctx.strokeStyle = "#8e959b";
  ctx.lineWidth = Math.max(1.6, T * 0.05);
  ctx.lineCap = "round";
  const rx = w / 2 - 5;
  ctx.beginPath();
  ctx.moveTo(-rx, -h / 2 + 6);
  ctx.lineTo(-rx + w * 0.10, h / 2 - 6);
  ctx.moveTo(rx, -h / 2 + 6);
  ctx.lineTo(rx - w * 0.10, h / 2 - 6);
  ctx.stroke();
  // 扶手立柱
  ctx.strokeStyle = "rgba(140,146,152,0.7)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    const yy = -h / 2 + 10 + i * (h - 20) / 3;
    ctx.beginPath(); ctx.moveTo(-rx + i * w * 0.03, yy); ctx.lineTo(-rx + i * w * 0.03, yy + 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(rx - i * w * 0.03, yy); ctx.lineTo(rx - i * w * 0.03, yy + 6); ctx.stroke();
  }

  // 楼梯口上方的小牌子：写明通向哪一层
  const pw = w * 0.52, ph = Math.max(7, T * 0.24);
  const py = -h / 2 - ph - 2;
  ctx.fillStyle = "#e8e2cd";
  ctx.fillRect(-pw / 2, py, pw, ph);
  ctx.strokeStyle = "#8a7f63"; ctx.lineWidth = 1;
  ctx.strokeRect(-pw / 2, py, pw, ph);
  ctx.fillStyle = "#2a2318";
  ctx.font = "bold " + Math.max(6, Math.round(ph * 0.76)) + "px ui-monospace, monospace";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(label, 0, py + ph / 2 + 0.5);
  ctx.textAlign = "start"; ctx.textBaseline = "alphabetic";

  // 往下走的方向：牌子上一个小箭头
  ctx.fillStyle = "#2a2318";
  ctx.beginPath();
  ctx.moveTo(-2.2, py + ph + 1.5);
  ctx.lineTo(2.2, py + ph + 1.5);
  ctx.lineTo(0, py + ph + 5.5);
  ctx.closePath();
  ctx.fill();
}
window.PROP_DRAW["stairs6"] = function (ctx, p, T) { drawStairExit(ctx, p, T, true); };
window.PROP_DRAW["stairs7"] = function (ctx, p, T) { drawStairExit(ctx, p, T, false); };
