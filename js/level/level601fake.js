// ===========================================================
// Level 601 · 「假现实」
//   大厅右侧单独扩出去的一块地。一片比较大的草地，四周被树围得死死的
//   （树就是墙，走不出去），正中间一台售货机，里面是无限的记忆汁。
//
//   它不是另一个层级 —— 还是 601 这张图，只是往边上多长出一块来。
// ===========================================================
"use strict";

window.buildFakeReality = function (map, size, grid) {
  if (!map || !grid) return null;
  // 贴着地图右边界留 4 格；大厅东墙在 x=70，中间留一段走廊
  const fw = 30, fh = 30;
  const fx = size - fw - 4;          // 112 - 30 - 4 = 78
  const fy = 24;
  if (fx < 76 || fx + fw > size - 1 || fy + fh > size - 1) return null;

  const inner = { x: fx + 1, y: fy + 1, w: fw - 2, h: fh - 2 };
  const cx = fx + Math.floor(fw / 2), cy = fy + Math.floor(fh / 2);

  // 这块地上原本可能有书架 / 柱子 —— 全部让位
  map.props = (map.props || []).filter((p) =>
    !(p.x >= fx - 2 && p.x <= fx + fw + 1 && p.y >= fy - 1 && p.y <= fy + fh));
  if (map.books) map.books = map.books.filter((b) => !(b.x >= fx && b.y >= fy));

  // 外圈：整圈都是过不去的树（grid=1 是墙，tree601 负责把它画成树）
  const trees = [];
  for (let x = fx; x < fx + fw; x++) {
    for (let y = fy; y < fy + fh; y++) {
      const edge = (x === fx || x === fx + fw - 1 || y === fy || y === fy + fh - 1);
      if (!edge) continue;
      // 西侧正中留一个 4 格宽的口子 —— 这是唯一进出的地方
      if (x === fx && y >= fy + 13 && y <= fy + 16) {
        grid[y][x] = 0;
        continue;
      }
      grid[y][x] = 1;
      trees.push({ x, y, floor: 0, type: "tree601" });
    }
  }
  // 里面整片草地
  for (let y = inner.y; y < inner.y + inner.h; y++) {
    for (let x = inner.x; x < inner.x + inner.w; x++) grid[y][x] = 0;
  }
  // 从大厅东墙接一条 3 格宽的走廊过来
  const py = fy + 14;
  for (let x = 69; x <= fx + 1; x++) {
    for (let dy = -1; dy <= 1; dy++) {
      const y = py + dy;
      if (y > 0 && y < size - 1 && x > 0 && x < size - 1) grid[y][x] = 0;
    }
  }
  // 走廊口那块牌子
  map.props.push({ x: 72, y: py, floor: 0, type: "fake601sign" });

  // 草地上的草丛和花（纯装饰，不挡路）
  const rnd = (function () { let s = 601601; return function () { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }; })();
  for (let i = 0; i < 76; i++) {
    const x = inner.x + Math.floor(rnd() * inner.w);
    const y = inner.y + Math.floor(rnd() * inner.h);
    if (Math.abs(x - cx) <= 2 && Math.abs(y - cy) <= 2) continue;   // 售货机跟前留空
    map.props.push({ x, y, floor: 0, type: rnd() < 0.24 ? "flower601" : "grass601" });
  }

  // 正中间的售货机：无限的记忆汁
  const vending = { x: cx, y: cy, floor: 0, type: "memvending", infinite: true };
  map.props.push(vending);
  for (const t of trees) map.props.push(t);

  map.fakeReality = { x: inner.x, y: inner.y, w: inner.w, h: inner.h,
    outer: { x: fx, y: fy, w: fw, h: fh }, vending: { x: cx, y: cy },
    entry: { x: 72, y: py } };
  return map.fakeReality;
};

// ===========================================================
// 物件绘制
// ===========================================================
window.PROP_DRAW = window.PROP_DRAW || {};

// 树：画得比一格还大一点，把底下那圈墙整个盖住 —— 看上去就是密不透风的林子
window.PROP_DRAW["tree601"] = function (ctx, p, T) {
  const seed = (p.x * 31 + p.y * 17) % 7;
  ctx.fillStyle = "#3a2a1c";
  ctx.fillRect(-T * 0.13, -T * 0.02, T * 0.26, T * 0.50);
  const greens = ["#2f5a34", "#37663b", "#2b5130", "#336039", "#2c5533", "#3a6a3d", "#305a36"];
  for (let i = 0; i < 3; i++) {
    const r = T * (0.46 - i * 0.07);
    const ox = (i - 1) * T * 0.17 + (seed % 3 - 1) * T * 0.05;
    const oy = -T * (0.20 + i * 0.16);
    ctx.fillStyle = greens[(seed + i) % greens.length];
    ctx.beginPath(); ctx.arc(ox, oy, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,255,220,0.07)";
    ctx.beginPath(); ctx.arc(ox - r * 0.28, oy - r * 0.30, r * 0.55, 0, Math.PI * 2); ctx.fill();
  }
};

window.PROP_DRAW["grass601"] = function (ctx, p, T) {
  ctx.strokeStyle = "rgba(74,124,66,0.85)";
  ctx.lineWidth = Math.max(1, T * 0.035);
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(i * T * 0.11, T * 0.18);
    ctx.quadraticCurveTo(i * T * 0.15, -T * 0.02, i * T * 0.20 + (p.x % 3 - 1) * T * 0.04, -T * 0.16);
    ctx.stroke();
  }
};

window.PROP_DRAW["flower601"] = function (ctx, p, T) {
  ctx.strokeStyle = "#4d7d44"; ctx.lineWidth = Math.max(1, T * 0.03);
  ctx.beginPath(); ctx.moveTo(0, T * 0.20); ctx.lineTo(0, -T * 0.04); ctx.stroke();
  const cols = ["#f2d36b", "#e9a3b8", "#d8d2f0", "#f5f1da"];
  for (let i = 0; i < 5; i++) {
    const a = (Math.PI * 2 * i) / 5;
    ctx.fillStyle = cols[(p.x + p.y) % cols.length];
    ctx.beginPath(); ctx.arc(Math.cos(a) * T * 0.10, -T * 0.04 + Math.sin(a) * T * 0.10, T * 0.055, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = "#fff2a8";
  ctx.beginPath(); ctx.arc(0, -T * 0.04, T * 0.045, 0, Math.PI * 2); ctx.fill();
};

window.PROP_DRAW["fake601sign"] = function (ctx, p, T) {
  ctx.fillStyle = "#5b5140";
  ctx.fillRect(-T * 0.06, -T * 0.10, T * 0.12, T * 0.62);
  ctx.fillStyle = "#e8e2cc";
  ctx.fillRect(-T * 0.42, -T * 0.52, T * 0.84, T * 0.44);
  ctx.strokeStyle = "#b6ad90"; ctx.lineWidth = Math.max(1, T * 0.025);
  ctx.strokeRect(-T * 0.42, -T * 0.52, T * 0.84, T * 0.44);
  ctx.fillStyle = "#4c6b4a";
  ctx.font = "bold " + Math.max(9, Math.floor(T * 0.16)) + "px sans-serif";
  ctx.textAlign = "center"; ctx.fillText("假 现 实", 0, -T * 0.22); ctx.textAlign = "left";
};

// 售货机：玻璃柜里一排泛着柔光的记忆汁，机器永远不空
window.PROP_DRAW["memvending"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : performance.now() / 1000);
  ctx.save();
  // 光晕
  const gl = ctx.createRadialGradient(0, -T * 0.10, T * 0.1, 0, -T * 0.10, T * 0.95);
  gl.addColorStop(0, "rgba(255,232,176,0.28)");
  gl.addColorStop(1, "rgba(255,232,176,0)");
  ctx.fillStyle = gl;
  ctx.beginPath(); ctx.arc(0, -T * 0.10, T * 0.95, 0, Math.PI * 2); ctx.fill();
  // 机身
  ctx.fillStyle = "#d9dde2";
  ctx.fillRect(-T * 0.36, -T * 0.72, T * 0.72, T * 1.24);
  ctx.fillStyle = "#9aa5ad";
  ctx.fillRect(-T * 0.36, -T * 0.72, T * 0.72, T * 0.10);
  // 招牌
  ctx.fillStyle = "#2f6d68";
  ctx.fillRect(-T * 0.32, -T * 0.66, T * 0.64, T * 0.20);
  ctx.fillStyle = "#eafff6";
  ctx.font = "bold " + Math.max(8, Math.floor(T * 0.13)) + "px sans-serif";
  ctx.textAlign = "center"; ctx.fillText("记 忆 汁", 0, -T * 0.51); ctx.textAlign = "left";
  // 玻璃柜
  ctx.fillStyle = "rgba(28,44,52,0.82)";
  ctx.fillRect(-T * 0.30, -T * 0.42, T * 0.60, T * 0.76);
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const bx = -T * 0.22 + col * T * 0.14;
      const by = -T * 0.34 + row * T * 0.23;
      const pulse = 0.72 + 0.28 * Math.sin(t * 2 + row * 1.3 + col * 0.8);
      ctx.fillStyle = "rgba(255,230,160," + (0.55 + 0.4 * pulse).toFixed(2) + ")";
      ctx.fillRect(bx - T * 0.035, by, T * 0.07, T * 0.15);
      ctx.fillStyle = "#fff6d8";
      ctx.fillRect(bx - T * 0.035, by - T * 0.025, T * 0.07, T * 0.025);
    }
  }
  // 玻璃反光
  ctx.fillStyle = "rgba(255,255,255,0.09)";
  ctx.fillRect(-T * 0.30, -T * 0.42, T * 0.16, T * 0.76);
  // 取货口 / 按钮
  ctx.fillStyle = "#3d474d";
  ctx.fillRect(-T * 0.26, T * 0.38, T * 0.52, T * 0.12);
  ctx.fillStyle = "#7ee6a8";
  ctx.beginPath(); ctx.arc(T * 0.26, -T * 0.24, T * 0.035, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
};
