// ===========================================================
// Level 27 —— 岩体泉
//   一口洞穴温泉。全层只有一个大约 200 平方英尺的洞穴，
//   里面装着这层所有的入口，以及除一个之外的所有出口。
//   泉水可以饮用、富含矿物质；泡过的人说自己头脑清醒、精力充沛。
//   平均水温约 90°F（32.2°C），和洗澡水差不多。
//   两个微型瀑布从洞壁的开口不断注入新的泉水；
//   池子靠洞穴角落里的一条小渠排水 —— 那渠很小，以人类的体型不易爬过。
//   请不要试图探索它。（爬进去会到 Level 28）
//   洞壁是石灰岩。这里温暖潮湿，却没有任何植被，甚至没有任何别的生物。
//   泡一小时以上有积极影响；超过两小时会头晕恶心。
//   ===========================================================
//   入口：在 Level 11 找到一处洞穴
//   出口：原路返回（回 Level 11）；攀爬其他隧道 -> Level 28
// ===========================================================
"use strict";

(function () {
  // 石灰岩的地面 / 洞壁（都不是黑的，也不是 Level 2 的管道）
  const v = ["#c3b697", "#8d8371"];
  if (typeof regTile === "function") regTile("spring27", v);
  else { (window.__NEWTILE_EXTRA = window.__NEWTILE_EXTRA || {})["spring27"] = v; }
})();

function generateSpring27Map(level) {
  const size = 28;
  const grid = makeGrid(size);
  const props = [];
  const floors = [];

  const spring = new Set();   // 温泉的水面（能走，泡着会回血）
  const stone = new Set();    // 洞内的地面（石灰岩）
  const wet = new Set();      // 洞壁上渗水的地方
  const CX = size / 2, CY = size / 2;

  // ---------- 洞窟：一个不规则的椭圆 ----------
  const RX = size * 0.40, RY = size * 0.34;
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      const dx = x - CX, dy = y - CY;
      const a = Math.atan2(dy, dx);
      const wob = 1 + 0.13 * Math.sin(a * 3 + 0.7) + 0.08 * Math.sin(a * 5 - 1.2);
      const d = Math.hypot(dx / RX, dy / RY);
      if (d < wob) { grid[y][x] = 0; stone.add(x + "," + y); }
    }
  }

  // ---------- 温泉池：洞中央偏下的一汪水 ----------
  const PX = Math.round(CX), PY = Math.round(CY + 1);
  const PRX = 5.2, PRY = 3.6;
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      if (!stone.has(x + "," + y)) continue;
      const dx = x - PX, dy = y - PY;
      const a = Math.atan2(dy, dx);
      const wob = 1 + 0.10 * Math.sin(a * 4 + 2.1);
      if (Math.hypot(dx / PRX, dy / PRY) < wob) {
        grid[y][x] = 0;
        spring.add(x + "," + y);
      }
    }
  }

  // ---------- 两个微型瀑布：洞壁北面那两个开口 ----------
  // 开口开在洞壁上（墙），瀑布从那儿落进池子里
  const falls = [];
  for (const sgn of [-1, 1]) {
    let fx = Math.round(PX + sgn * 3), fy = 2;
    // 找到洞窟顶端（第一行是地面/墙的分界）
    for (let y = 1; y < size - 1; y++) {
      if (stone.has(fx + "," + y)) { fy = y - 1; break; }
    }
    if (fy < 1) fy = 1;
    // 开口：在墙上凿一格，让水"从洞壁的开口"流出来
    grid[fy][fx] = 1;
    wet.add(fx + "," + fy);
    falls.push({ x: fx, y: fy });
    props.push({ x: fx, y: fy, floor: 0, type: "p27fall" });
  }

  // ---------- 排水渠：洞穴角落里那条很小的渠 ----------
  // 档案明说"以人类的体型不易爬过""请不要试图探索它"——
  // 爬进去会到 Level 28（那里无处可去）。
  let drainX = 2, drainY = Math.round(CY) + 3;
  for (let y = size - 3; y > 3; y--) {
    if (stone.has(2 + "," + y)) { drainY = y; break; }
  }
  drainX = 2;
  if (!stone.has(drainX + "," + drainY)) {
    for (let x = 2; x < size - 2; x++) {
      if (stone.has(x + "," + drainY)) { drainX = x; break; }
    }
  }
  grid[drainY][drainX] = 0;
  stone.add(drainX + "," + drainY);
  props.push({ x: drainX, y: drainY, floor: 0, type: "p27drain", toLevel: 28,
    tip: "洞穴角落里的一条小渠 —— 很小，不容易爬过去。最好不要去探索它" });
  const drain = props[props.length - 1];

  // ---------- 入口：来时那个洞口（原路返回 Level 11）----------
  let archX = Math.round(CX), archY = size - 3;
  for (let y = size - 3; y > 3; y--) {
    if (stone.has(archX + "," + y)) { archY = y; break; }
  }
  props.push({ x: archX, y: archY, floor: 0, type: "p27arch", toLevel: 11,
    tip: "来时的洞口 —— 原路返回 Level 11" });
  const arch = props[props.length - 1];

  // ---------- 洞里的零碎：石头、叠好的毛巾、别人落下的东西 ----------
  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return null;
    if (grid[y][x] !== 0) return null;
    if (spring.has(x + "," + y)) return null;
    const p = Object.assign({ x, y, floor: 0, type }, extra || {});
    props.push(p);
    return p;
  };
  // 池边一圈石头（坐着泡的那种）
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.4;
    const rx = Math.round(PX + Math.cos(a) * (PRX + 1.3));
    const ry = Math.round(PY + Math.sin(a) * (PRY + 1.6));
    put(rx, ry, "p27rock");
  }
  // 别人留下的一条毛巾、一只篮子、几瓶杏仁水
  put(PX + 6, PY - 2, "p27towel");
  put(PX - 6, PY + 1, "p27basket");
  put(PX + 5, PY + 3, "p27bottle");
  put(PX - 5, PY - 3, "p27bottle");

  // 洞壁上渗水的痕迹（装饰）
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const wx = Math.round(CX + Math.cos(a) * (RX * 0.96));
    const wy = Math.round(CY + Math.sin(a) * (RY * 0.96));
    if (wx > 0 && wy > 0 && wx < size - 1 && wy < size - 1 && grid[wy][wx] === 1) wet.add(wx + "," + wy);
  }

  collectFloorsInto(grid, size, floors);

  // 出生：洞口内侧，面朝池子
  const start = { x: archX, y: Math.max(2, archY - 1), floor: 0 };

  return {
    size, level: 27, doubleStory: false,
    layers: [grid], grid, rooms: [[]], floors: [floors],
    start, exit: null, doors: [], ramps: [],
    props, crates: [], ground: [],

    style: "spring27",
    tileName: "spring27",
    spring27: spring, stone27: stone, wet27: wet,
    arch27: arch, drain27: drain, falls27: falls,
    pool27: { PX, PY, PRX, PRY },
  };
}
window.generateSpring27Map = generateSpring27Map;

// ---------------- 地面 ----------------
window.drawSpring27Floor = function (ctx, px, py, S, map, tx, ty) {
  const k = tx + "," + ty;
  const t = performance.now() / 1000;
  if (map.spring27 && map.spring27.has(k)) {
    // 温泉：温热的、富含矿物质的水 —— 水面慢慢地晃，底下泛着一点暖色
    const w = Math.sin(t * 0.8 + tx * 0.5) + Math.sin(t * 0.5 + ty * 0.35);
    const b = 96 + w * 9;
    ctx.fillStyle = "rgb(" + Math.round(b * 1.12) + "," + Math.round(b * 1.02) + "," + Math.round(b * 0.86) + ")";
    ctx.fillRect(px, py, S, S);
    // 水面上的一层反光
    ctx.fillStyle = "rgba(255,246,220,.22)";
    ctx.fillRect(px, py + ((t * 9 + tx * 7 + ty * 3) % S), S, 2);
    // 水气：往上飘的一点白
    ctx.fillStyle = "rgba(255,255,255,.06)";
    ctx.fillRect(px + ((tx * 3) % 5), py, 2, S);
    return true;
  }
  // 洞内的石灰岩地面
  ctx.fillStyle = "#c3b697";
  ctx.fillRect(px, py, S, S);
  const h = hash2(tx, ty);
  // 被水泡出来的深色斑
  if ((h & 7) === 0) {
    ctx.fillStyle = "rgba(120,104,80,.28)";
    ctx.fillRect(px + 2, py + 3, S - 5, S - 7);
  }
  // 石头地的裂纹
  if ((h & 15) === 3) {
    ctx.strokeStyle = "rgba(96,84,64,.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px + 2, py + S * 0.3);
    ctx.lineTo(px + S - 3, py + S * 0.7);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(255,255,255,.07)";
  ctx.fillRect(px, py, S, 2);
  return true;
};

// ---------------- 墙（洞壁）----------------
window.drawSpring27Wall = function (ctx, px, py, S, map, tx, ty) {
  const k = tx + "," + ty;
  // 石灰岩洞壁
  ctx.fillStyle = "#8d8371";
  ctx.fillRect(px, py, S, S);
  const h = hash2(tx, ty);
  // 一层层沉积的纹路
  ctx.fillStyle = "rgba(112,102,86,.42)";
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(px, py + 3 + i * (S / 3), S, 3);
  }
  // 顶上的高光
  ctx.fillStyle = "rgba(255,255,255,.10)";
  ctx.fillRect(px, py, S, 2);
  if ((h & 3) === 0) {
    ctx.fillStyle = "rgba(70,62,50,.30)";
    ctx.fillRect(px + 4, py + S * 0.45, S - 9, S * 0.3);
  }
  // 渗水：一道道往下淌的水痕
  if (map.wet27 && map.wet27.has(k)) {
    ctx.fillStyle = "rgba(150,190,200,.30)";
    ctx.fillRect(px + S * 0.42, py, S * 0.16, S);
    ctx.fillStyle = "rgba(210,240,250,.20)";
    ctx.fillRect(px + S * 0.42, py + ((performance.now() / 260 + tx * 3) % S), S * 0.16, 3);
  }
  return true;
};

// ---------------- 环境：温暖、潮湿、安静 ----------------
window.drawSpring27 = function (ctx, g) {
  const cw = (ctx.canvas && ctx.canvas.width) || 800;
  const ch = (ctx.canvas && ctx.canvas.height) || 600;
  const t = performance.now() / 1000;
  ctx.save();
  try { ctx.setTransform(1, 0, 0, 1, 0, 0); } catch (e) { /* 忽略 */ }
  // 洞里那层暖白的水汽 —— 保证画面不是黑的
  ctx.fillStyle = "rgba(255,236,205,.085)";
  ctx.fillRect(0, 0, cw, ch);
  // 水面反上来的一点暖光，慢慢地晃
  const gr = ctx.createLinearGradient(0, ch * 0.4, 0, ch);
  gr.addColorStop(0, "rgba(255,214,160,0)");
  gr.addColorStop(1, "rgba(255,214,160,.10)");
  ctx.fillStyle = gr;
  ctx.fillRect(0, ch * 0.4, cw, ch * 0.6);
  // 很轻的一层呼吸
  const br = 0.018 + 0.010 * Math.sin(t * 0.6);
  ctx.fillStyle = "rgba(255,246,226," + br.toFixed(3) + ")";
  ctx.fillRect(0, 0, cw, ch);
  ctx.restore();
};

// ---------------- 物件 ----------------
window.PROP_DRAW = window.PROP_DRAW || {};

// 微型瀑布：从洞壁的开口不断地注入新的泉水
window.PROP_DRAW["p27fall"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  const t = performance.now() / 1000;
  // 洞壁上的开口：一圈深色
  ctx.fillStyle = "#4e4940";
  ctx.fillRect(x + 2, y + 2, T - 4, T - 4);
  // 落下来的水：一道道往下淌
  ctx.fillStyle = "rgba(196,224,232,.85)";
  for (let i = 0; i < 3; i++) {
    const off = ((t * 220 + i * 11) % (T * 1.4));
    ctx.fillRect(x + 5 + i * (T / 3.4), y + off, 3, T * 0.5);
  }
  // 底下溅起来的白
  ctx.fillStyle = "rgba(255,255,255,.30)";
  ctx.fillRect(x + 3, y + T - 6, T - 6, 3);
};

// 排水渠：很小的一条，不容易爬过去 —— 爬进去就到 Level 28
window.PROP_DRAW["p27drain"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  const t = performance.now() / 1000;
  // 角落里的一条小渠：窄窄的一道黑，里面是流动的水
  ctx.fillStyle = "#33423f";
  ctx.fillRect(x + 2, y + 2, T - 4, T - 4);
  ctx.fillStyle = "rgba(150,186,192,.55)";
  ctx.fillRect(x + 4, y + ((t * 30) % T), T - 8, 3);
  // 洞口那圈石头
  ctx.strokeStyle = "rgba(180,168,142,.75)";
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1.5, y + 1.5, T - 3, T - 3);
  // 往外渗的一点水
  ctx.fillStyle = "rgba(190,214,220,.35)";
  ctx.fillRect(x + 2, y + T - 4, T - 4, 2);
};

// 来时的洞口
window.PROP_DRAW["p27arch"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#5c544a";
  ctx.fillRect(x + 1, y + 1, T - 2, T - 2);
  // 洞口：里面更暗，但外面透进来一点 Level 11 的灯光
  ctx.fillStyle = "#2b2a26";
  ctx.fillRect(x + 4, y + 4, T - 8, T - 8);
  ctx.fillStyle = "rgba(255,226,170,.35)";
  ctx.fillRect(x + 5, y + T - 8, T - 10, 3);
  ctx.strokeStyle = "rgba(200,188,160,.70)";
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1.5, y + 1.5, T - 3, T - 3);
};

// 池边的石头（坐着泡的那种）
window.PROP_DRAW["p27rock"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#9a9080";
  ctx.beginPath();
  ctx.ellipse(x + T / 2, y + T * 0.58, T * 0.36, T * 0.26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#b5ab98";
  ctx.beginPath();
  ctx.ellipse(x + T * 0.44, y + T * 0.50, T * 0.24, T * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.14)";
  ctx.fillRect(x + T * 0.30, y + T * 0.36, T * 0.22, 2);
};

// 叠好的毛巾
window.PROP_DRAW["p27towel"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#d8cdb4";
  ctx.fillRect(x + 4, y + T * 0.34, T - 8, T * 0.30);
  ctx.fillStyle = "#c2b79e";
  ctx.fillRect(x + 4, y + T * 0.50, T - 8, T * 0.14);
  ctx.fillStyle = "rgba(120,150,160,.35)";
  ctx.fillRect(x + 4, y + T * 0.42, T - 8, 3);
};

// 别人落下的篮子
window.PROP_DRAW["p27basket"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#a5825a";
  ctx.fillRect(x + 4, y + T * 0.40, T - 8, T * 0.34);
  ctx.strokeStyle = "rgba(90,68,44,.70)";
  ctx.lineWidth = 1.4;
  ctx.strokeRect(x + 4.5, y + T * 0.40, T - 9, T * 0.34);
  ctx.fillStyle = "#c9a97c";
  ctx.fillRect(x + 4, y + T * 0.40, T - 8, 3);
};

// 一瓶杏仁水
window.PROP_DRAW["p27bottle"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#e8e2cc";
  ctx.fillRect(x + T * 0.38, y + T * 0.32, T * 0.24, T * 0.44);
  ctx.fillStyle = "#b9b09a";
  ctx.fillRect(x + T * 0.42, y + T * 0.24, T * 0.16, T * 0.10);
  ctx.fillStyle = "rgba(255,255,255,.35)";
  ctx.fillRect(x + T * 0.40, y + T * 0.38, 2, T * 0.26);
};

// ---------------- Level 11 里的入口：一处洞穴 ----------------
window.PROP_DRAW["cave27"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  const t = performance.now() / 1000;
  // 墙上塌开的洞口
  ctx.fillStyle = "#4a453c";
  ctx.fillRect(x + 2, y + 2, T - 4, T - 4);
  ctx.fillStyle = "#26241f";
  ctx.fillRect(x + 5, y + 5, T - 10, T - 10);
  // 里头冒出来的湿热的水汽
  const w = 0.16 + 0.10 * Math.sin(t * 1.3 + (p.x | 0));
  ctx.fillStyle = "rgba(232,220,190," + w.toFixed(3) + ")";
  ctx.fillRect(x + 5, y + 5, T - 10, T - 10);
  ctx.strokeStyle = "rgba(200,188,160,.70)";
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1.5, y + 1.5, T - 3, T - 3);
};
