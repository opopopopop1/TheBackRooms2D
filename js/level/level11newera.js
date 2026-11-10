// ===========================================================
// Level 11.1 —— 新时代广场（B.N.T.G 的贸易站）
// Level 11 的子层级：从城市最左边那团霓虹雾钻进来就是这里。
// 一片开阔的广场，四周是摊位与霓虹招牌，正中间是 B.N.T.G 的柜台。
//
// 买卖规矩（B.N.T.G 定的）：
//   1 瓶杏仁水  ->  1 根撬棍
//   1 根撬棍    ->  1 瓶杏仁水
//   8 瓶杏仁水  ->  K 版防化服（唯一能挡住 Level 301 空气的东西）
//
// 布局：一片开阔的广场 + 一圈摊位 —— 刻意不是迷宫。
// 出口：广场边缘那团霓虹雾 -> 回 Level 11
// ===========================================================
"use strict";

function generateNewEraMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const props = [];

  // ---- 广场：一大片开阔的空地 ----
  const px0 = 5, py0 = 5, pw = size - 10, ph = size - 10;
  carveRoom(grid, size, px0, py0, pw, ph);

  // ---- 沿广场四周摆一圈摊位（不构成迷宫，走两步就能绕过去）----
  const stalls = [];
  const per = Math.max(3, Math.floor(pw / 8));
  for (let i = 0; i < per; i++) {
    const x = px0 + 3 + i * Math.floor((pw - 6) / per);
    if (x >= px0 + pw - 3) continue;
    stalls.push({ x, y: py0 + 2 });
    stalls.push({ x, y: py0 + ph - 3 });
  }
  for (let i = 0; i < Math.max(3, Math.floor(ph / 8)); i++) {
    const y = py0 + 4 + i * Math.floor((ph - 8) / Math.max(3, Math.floor(ph / 8)));
    if (y >= py0 + ph - 4) continue;
    stalls.push({ x: px0 + 2, y });
    stalls.push({ x: px0 + pw - 3, y });
  }

  const floors = collectFloors(grid, size);
  // 出生点：从霓虹雾里钻出来 —— 广场下方
  const start = { x: Math.floor(size / 2), y: py0 + ph - 4, floor: 0 };

  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return;
    if (grid[y][x] !== 0) return;
    props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  };

  // ---- 正中间：B.N.T.G 的柜台 ----
  const cx = Math.floor(size / 2), cy = Math.floor(size / 2);
  const counter = { x: cx, y: cy, floor: 0, type: "bntgcounter" };
  props.push(counter);
  // 柜台后面站着的 B.N.T.G 员工（装饰）
  put(cx, cy - 2, "bntgclerk");

  // ---- 摊位与霓虹招牌 ----
  for (const s of stalls) put(s.x, s.y, "stall11");
  for (let i = 0; i < 10; i++) put(randInt(px0 + 2, px0 + pw - 3), randInt(py0 + 2, py0 + ph - 3), "neonsign11");
  // 广场上散着的补给箱
  for (let i = 0; i < 6; i++) put(randInt(px0 + 3, px0 + pw - 4), randInt(py0 + 3, py0 + ph - 4), "crate11");

  // ---- 回 Level 11 的霓虹雾（广场最上方）----
  const fogExit = { x: cx, y: py0 + 1, floor: 0, type: "neonfog11" };
  props.push(fogExit);

  // ---- 广场上游荡的无面灵：它们只是站着，不伤人，可以搭话 ----
  // 刻意避开柜台和出入口，别堵在路中间。
  const npcs = [];
  const far = (x, y, min) => {
    if (Math.hypot(x - cx, y - cy) < min) return false;
    if (Math.hypot(x - fogExit.x, y - fogExit.y) < min) return false;
    for (const n of npcs) if (Math.hypot(x - n.x, y - n.y) < 5) return false;
    return true;
  };
  for (let i = 0; i < 40 && npcs.length < 5; i++) {
    const nx = randInt(px0 + 4, px0 + pw - 5), ny = randInt(py0 + 4, py0 + ph - 5);
    if (grid[ny] && grid[ny][nx] !== 0) continue;
    if (!far(nx, ny, 5)) continue;
    const npc = { x: nx, y: ny, floor: 0, type: "facelingnpc" };
    props.push(npc); npcs.push(npc);
  }

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [],
    counter, fogExit, npcs,
    plaza: { x: px0, y: py0, w: pw, h: ph },
  };
  map.spawnPts = [start];
  return map;
}

window.PROP_DRAW = window.PROP_DRAW || {};

// B.N.T.G 的柜台：金属台面 + 一块写着买卖规矩的牌子
window.PROP_DRAW["bntgcounter"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(0,0,0,0.34)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.24, T * 0.36, T * 0.08, 0, 0, Math.PI * 2); ctx.fill();
  // 台面
  ctx.fillStyle = "#8a8e96";
  ctx.fillRect(-T * 0.34, -T * 0.06, T * 0.68, T * 0.20);
  ctx.fillStyle = "#b6bac2";
  ctx.fillRect(-T * 0.34, -T * 0.10, T * 0.68, T * 0.06);
  ctx.strokeStyle = "#3a3e46"; ctx.lineWidth = 1.3;
  ctx.strokeRect(-T * 0.34, -T * 0.10, T * 0.68, T * 0.24);
  // 柜台前脸
  ctx.fillStyle = "#5a5e66";
  ctx.fillRect(-T * 0.30, T * 0.10, T * 0.60, T * 0.14);
  // B.N.T.G 的标：蓝底白字的一块牌
  ctx.fillStyle = "#1c3a7a";
  ctx.fillRect(-T * 0.22, -T * 0.30, T * 0.44, T * 0.16);
  ctx.fillStyle = "#eaf0ff";
  ctx.font = "bold " + Math.max(6, Math.round(T * 0.11)) + "px ui-monospace, monospace";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("B.N.T.G", 0, -T * 0.22);
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  // 台上摆的杏仁水
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = "#e8dca8";
    ctx.fillRect(-T * 0.26 + i * T * 0.10, -T * 0.16, T * 0.07, T * 0.12);
    ctx.fillStyle = "#c8a44a";
    ctx.fillRect(-T * 0.25 + i * T * 0.10, -T * 0.19, T * 0.05, T * 0.04);
  }
  // 台上的几摞 B.N.T.G 货币（金币色的小圆片）
  for (let s = 0; s < 2; s++) {
    const bx = T * 0.06 + s * T * 0.13, by = -T * 0.06;
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = i === 2 ? "#f2cd6a" : "#c99a34";
      ctx.beginPath();
      ctx.ellipse(bx, by - i * T * 0.035, T * 0.045, T * 0.018, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#8a6516"; ctx.lineWidth = 0.8; ctx.stroke();
    }
  }
  // 一点点霓虹的反光
  const g = ctx.createRadialGradient(0, -T * 0.22, 1, 0, -T * 0.22, T * 0.60);
  g.addColorStop(0, "rgba(120,180,255,0.22)");
  g.addColorStop(1, "rgba(120,180,255,0)");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, -T * 0.22, T * 0.60, 0, Math.PI * 2); ctx.fill();
};

// B.N.T.G 的员工：站在柜台后面
window.PROP_DRAW["bntgclerk"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(0,0,0,0.30)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.20, T * 0.16, T * 0.05, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#2c4a8a";                       // 蓝色工作服
  ctx.beginPath(); ctx.ellipse(0, 0, T * 0.13, T * 0.16, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#f2d8b6";                       // 头
  ctx.beginPath(); ctx.arc(0, -T * 0.20, T * 0.11, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#3a2a1a";                       // 头发
  ctx.beginPath(); ctx.arc(0, -T * 0.23, T * 0.11, Math.PI * 1.05, Math.PI * 1.95); ctx.fill();
  ctx.fillStyle = "#1c3a7a";                       // 帽子
  ctx.fillRect(-T * 0.13, -T * 0.32, T * 0.26, T * 0.07);
  ctx.fillRect(-T * 0.09, -T * 0.38, T * 0.18, T * 0.07);
};

// 摊位：撑着遮阳棚的小摊 —— 刻意画得比一格大，远远就能看见
window.PROP_DRAW["stall11"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(0,0,0,0.30)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.34, T * 0.52, T * 0.09, 0, 0, Math.PI * 2); ctx.fill();
  // 四根支架（撑起棚顶，也撑出台面）
  ctx.strokeStyle = "#6a6a6a"; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-T * 0.44, -T * 0.42); ctx.lineTo(-T * 0.44, T * 0.30);
  ctx.moveTo(T * 0.44, -T * 0.42); ctx.lineTo(T * 0.44, T * 0.30);
  ctx.moveTo(-T * 0.44, -T * 0.42); ctx.lineTo(T * 0.44, -T * 0.42);
  ctx.stroke();
  // 棚顶：红白相间的遮阳布，微微下坠
  ctx.fillStyle = "#d8d2c4";
  ctx.beginPath();
  ctx.moveTo(-T * 0.52, -T * 0.42);
  ctx.quadraticCurveTo(0, -T * 0.34, T * 0.52, -T * 0.42);
  ctx.lineTo(T * 0.52, -T * 0.52);
  ctx.quadraticCurveTo(0, -T * 0.44, -T * 0.52, -T * 0.52);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#c8402e";
  for (let i = 0; i < 6; i++) {
    const x0 = -T * 0.52 + i * (T * 1.04 / 6);
    ctx.beginPath();
    ctx.moveTo(x0, -T * 0.51); ctx.lineTo(x0 + T * 0.087, -T * 0.51);
    ctx.lineTo(x0 + T * 0.087, -T * 0.42); ctx.lineTo(x0, -T * 0.42);
    ctx.closePath(); ctx.fill();
  }
  ctx.strokeStyle = "#3a3630"; ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-T * 0.52, -T * 0.42);
  ctx.quadraticCurveTo(0, -T * 0.34, T * 0.52, -T * 0.42);
  ctx.stroke();
  // 棚沿垂下来的布边
  ctx.fillStyle = "rgba(216,210,196,0.85)";
  for (let i = 0; i < 5; i++) {
    const x0 = -T * 0.46 + i * T * 0.23;
    ctx.beginPath();
    ctx.moveTo(x0, -T * 0.41); ctx.lineTo(x0 + T * 0.11, -T * 0.41);
    ctx.lineTo(x0 + T * 0.11, -T * 0.34); ctx.lineTo(x0 + T * 0.055, -T * 0.30);
    ctx.lineTo(x0, -T * 0.34);
    ctx.closePath(); ctx.fill();
  }
  // 台面
  ctx.fillStyle = "#8a7a5e";
  ctx.fillRect(-T * 0.48, -T * 0.06, T * 0.96, T * 0.12);
  ctx.fillStyle = "#9c8a6a";
  ctx.fillRect(-T * 0.48, -T * 0.10, T * 0.96, T * 0.05);
  ctx.strokeStyle = "#4a3c28"; ctx.lineWidth = 1.2;
  ctx.strokeRect(-T * 0.48, -T * 0.10, T * 0.96, T * 0.16);
  // 台面下的挡布
  ctx.fillStyle = "#6a5c46";
  ctx.fillRect(-T * 0.44, T * 0.06, T * 0.88, T * 0.24);
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(-T * 0.44, T * 0.06, T * 0.88, T * 0.05);
  // 摆着的货：杏仁水、吃的、小工具
  ctx.fillStyle = "#e8dca8";
  for (let i = 0; i < 3; i++) ctx.fillRect(-T * 0.40 + i * T * 0.09, -T * 0.25, T * 0.065, T * 0.16);
  ctx.fillStyle = "#c8a44a";
  for (let i = 0; i < 3; i++) ctx.fillRect(-T * 0.395 + i * T * 0.09, -T * 0.29, T * 0.05, T * 0.05);
  ctx.fillStyle = "#a8c878";
  ctx.beginPath(); ctx.ellipse(T * 0.02, -T * 0.18, T * 0.09, T * 0.06, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#d06a4a";
  ctx.beginPath(); ctx.ellipse(T * 0.20, -T * 0.19, T * 0.08, T * 0.055, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#b0b6be";                     // 一摞金属小件
  ctx.fillRect(T * 0.32, -T * 0.26, T * 0.10, T * 0.13);
  ctx.fillRect(T * 0.32, -T * 0.13, T * 0.10, T * 0.07);
  // 摊主那侧挂着的一串小灯
  const t = (typeof window !== "undefined" && window.__game && typeof window.__game.time === "number")
    ? window.__game.time : (typeof gTimeRef === "number" ? gTimeRef : 0);
  for (let i = 0; i < 4; i++) {
    const bx = -T * 0.40 + i * T * 0.26;
    const on = ((t * 1.6 + i * 0.7) % 3) < 2.2;
    ctx.fillStyle = on ? "#ffe08a" : "#6a5a3a";
    ctx.beginPath(); ctx.arc(bx, -T * 0.36, T * 0.028, 0, Math.PI * 2); ctx.fill();
  }
};

// 无面灵 NPC：站在广场上，脸是平的 —— 没有眼睛，也没有嘴。
// 它不伤人，也不跟着你，只会站着（偶尔换只脚）。可以搭话。
window.PROP_DRAW["facelingnpc"] = function (ctx, p, T) {
  const t = (typeof window !== "undefined" && window.__game && typeof window.__game.time === "number")
    ? window.__game.time : (typeof gTimeRef === "number" ? gTimeRef : 0);
  const bob = Math.sin(t * 1.1 + (p.x || 0) * 0.7) * 1.6;
  const sway = Math.sin(t * 0.8 + (p.y || 0) * 0.9) * 0.05;
  ctx.save();
  ctx.translate(0, bob);
  ctx.fillStyle = "rgba(0,0,0,0.34)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.30, T * 0.20, T * 0.055, 0, 0, Math.PI * 2); ctx.fill();
  // 身体：一件普通的衣服（西装 / 卫衣，随格子定）
  const suit = ((p.x || 0) + (p.y || 0)) % 2 === 0;
  ctx.fillStyle = suit ? "#3a4450" : "#5a5148";
  ctx.beginPath();
  ctx.moveTo(-T * 0.17, T * 0.28);
  ctx.lineTo(-T * 0.15, -T * 0.10);
  ctx.quadraticCurveTo(0, -T * 0.16, T * 0.15, -T * 0.10);
  ctx.lineTo(T * 0.17, T * 0.28);
  ctx.closePath(); ctx.fill();
  // 两条手臂：垂在身侧，随呼吸微微摆
  ctx.strokeStyle = suit ? "#333c47" : "#514840";
  ctx.lineWidth = T * 0.055; ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-T * 0.14, -T * 0.06);
  ctx.quadraticCurveTo(-T * 0.20 + sway * T, T * 0.08, -T * 0.18 + sway * T, T * 0.24);
  ctx.moveTo(T * 0.14, -T * 0.06);
  ctx.quadraticCurveTo(T * 0.20 - sway * T, T * 0.08, T * 0.18 - sway * T, T * 0.24);
  ctx.stroke();
  // 领口
  ctx.fillStyle = suit ? "#c9c4b4" : "#6a6258";
  ctx.beginPath();
  ctx.moveTo(-T * 0.06, -T * 0.11); ctx.lineTo(0, -T * 0.04); ctx.lineTo(T * 0.06, -T * 0.11);
  ctx.closePath(); ctx.fill();
  // 头：皮肤色，微微前倾
  const hg = ctx.createRadialGradient(-T * 0.03, -T * 0.30, 1, 0, -T * 0.24, T * 0.17);
  hg.addColorStop(0, "#f0dcc2");
  hg.addColorStop(0.7, "#dcc4a8");
  hg.addColorStop(1, "#b8a086");
  ctx.fillStyle = hg;
  ctx.beginPath(); ctx.ellipse(0, -T * 0.24, T * 0.125, T * 0.145, sway, 0, Math.PI * 2); ctx.fill();
  // 脖子
  ctx.fillStyle = "#c8b094";
  ctx.fillRect(-T * 0.05, -T * 0.14, T * 0.10, T * 0.06);
  // 没有五官 —— 只有两处几乎看不出的凹陷，凑近才怕
  ctx.fillStyle = "rgba(150,128,104,0.35)";
  ctx.beginPath(); ctx.ellipse(-T * 0.045, -T * 0.27, T * 0.022, T * 0.014, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(T * 0.045, -T * 0.27, T * 0.022, T * 0.014, 0, 0, Math.PI * 2); ctx.fill();
  // 头发
  ctx.fillStyle = "#3a3028";
  ctx.beginPath();
  ctx.ellipse(0, -T * 0.32, T * 0.125, T * 0.075, sway, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

// 霓虹招牌：一闪一闪的彩色灯管
window.PROP_DRAW["neonsign11"] = function (ctx, p, T) {
  const ph = (p.x * 7 + p.y * 3) % 10;
  const on = ph < 8;                       // 偶尔坏一下
  const cols = ["#ff4a8a", "#4ad8ff", "#ffe14a", "#8aff4a", "#c84aff"];
  const c = cols[(p.x + p.y) % cols.length];
  ctx.fillStyle = "#2a2a30";
  ctx.fillRect(-T * 0.22, -T * 0.34, T * 0.44, T * 0.44);
  ctx.strokeStyle = on ? c : "#4a4a52";
  ctx.lineWidth = 2.2;
  ctx.strokeRect(-T * 0.16, -T * 0.28, T * 0.32, T * 0.32);
  ctx.beginPath();
  ctx.moveTo(-T * 0.10, -T * 0.14); ctx.lineTo(T * 0.10, -T * 0.14);
  ctx.stroke();
  if (on) {
    const g = ctx.createRadialGradient(0, -T * 0.12, 1, 0, -T * 0.12, T * 0.66);
    g.addColorStop(0, c.replace(")", ",0.34)").replace("#", "rgba(").length > 0 ? "rgba(255,255,255,0.20)" : "");
    g.addColorStop(0, "rgba(255,255,255,0.20)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, -T * 0.12, T * 0.66, 0, Math.PI * 2); ctx.fill();
  }
  // 立杆
  ctx.strokeStyle = "#3a3a40"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, T * 0.10); ctx.lineTo(0, T * 0.24); ctx.stroke();
};

// 补给箱
window.PROP_DRAW["crate11"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.20, T * 0.22, T * 0.05, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#8a6a44";
  ctx.fillRect(-T * 0.22, -T * 0.18, T * 0.44, T * 0.38);
  ctx.strokeStyle = "#4a3620"; ctx.lineWidth = 1.3;
  ctx.strokeRect(-T * 0.22, -T * 0.18, T * 0.44, T * 0.38);
  ctx.beginPath();
  ctx.moveTo(-T * 0.22, -T * 0.18); ctx.lineTo(T * 0.22, T * 0.20);
  ctx.moveTo(T * 0.22, -T * 0.18); ctx.lineTo(-T * 0.22, T * 0.20);
  ctx.stroke();
};

// 那团霓虹雾：进来的地方，也是回去的地方
window.PROP_DRAW["neonfog11"] = function (ctx, p, T) {
  const t = (p.__t || 0);
  for (let i = 0; i < 5; i++) {
    const a = t * 0.5 + i * 1.26;
    const rr = T * (0.30 + 0.22 * ((i % 3) / 2));
    const ox = Math.cos(a) * T * 0.26, oy = Math.sin(a) * T * 0.20;
    const g = ctx.createRadialGradient(ox, oy, 1, ox, oy, rr);
    g.addColorStop(0, "rgba(255,90,200,0.34)");
    g.addColorStop(0.6, "rgba(120,180,255,0.18)");
    g.addColorStop(1, "rgba(120,180,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(ox, oy, rr, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = "rgba(255,255,255,0.16)";
  ctx.beginPath(); ctx.arc(0, 0, T * 0.16, 0, Math.PI * 2); ctx.fill();
};
