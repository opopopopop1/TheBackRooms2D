// ===========================================================
// Level 284 —— 需汝之地
//   一处河畔的观景处。它的样子取决于进来的人 ——
//   层级会尽力去再现家乡的记忆，并尽力引起你的想象力。
//   它的幻觉天衣无缝，但里面没有任何别的意图：
//   全后室都那么残酷，你至少也值得好好睡一觉。
//   同一时间内不可能存在第二个人 —— 你进来的时候，
//   后室里所有其他的入口都会消失。
//   ===========================================================
//   实体有两个，都只是"理论上存在"：
//     想象 —— 你和那个幻影互动时的真实感
//     层级 —— 也许它自己有某种感知能力
//   出口：找到一张用草搭制的床，睡一觉 —— 醒来在 Level 11。
// ===========================================================
"use strict";

(function () {
  // 混凝土的灰 / 傍晚的空气（都不是黑的，也不是 Level 2 的管道）
  const v = ["#9aa0a6", "#8a8272"];
  if (typeof regTile === "function") regTile("river284", v);
  else { (window.__NEWTILE_EXTRA = window.__NEWTILE_EXTRA || {})["river284"] = v; }
})();

function generateRiver284Map(level) {
  const size = 44;
  const grid = makeGrid(size);
  const props = [];
  const floors = [];

  // 全层先铺成岸边（能走的）
  for (let y = 1; y < size - 1; y++) for (let x = 1; x < size - 1; x++) grid[y][x] = 0;

  const water = new Set();      // 河
  const concrete = new Set();   // 混凝土浇筑的观景台
  const opposite = new Set();   // 对岸那个一模一样的平台（看得见，过不去）
  const grass = new Set();      // 草搭制的床所在的那片草
  const farBank = new Set();    // 河对岸（过不去，只用来画）

  // ---------- 河：横在下半张图，宽 9 格 ----------
  const RY0 = Math.round(size * 0.58), RY1 = RY0 + 8;
  for (let y = RY0; y <= RY1; y++) for (let x = 1; x < size - 1; x++) {
    grid[y][x] = 0;
    water.add(x + "," + y);
  }
  // 河的北岸：一条土坡（走得到）
  // ---------- 对岸的平台：河的南边，隔水相望 ----------
  const FY0 = RY1 + 2, FY1 = RY1 + 7;
  for (let y = FY0; y <= FY1; y++) for (let x = Math.round(size * 0.22); x <= Math.round(size * 0.78); x++) {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) continue;
    // 对岸：隔水相望，看得见过不去 —— 所以做成墙（不是地板）。
    // 做成地板的话它会变成一片走不到的死区，而它本来就该是"过不去的"。
    grid[y][x] = 1;
    opposite.add(x + "," + y);
  }
  // 对岸和这岸之间隔着水 —— 中间那道是走不过去的（用墙隔断，只在两端留水）
  // 实际上水本身就是可站的（会掉下去），为了"过不去"，把 FY0-1 那一行做成墙
  for (let x = 1; x < size - 1; x++) {
    if (x >= size - 1) continue;
    grid[FY0 - 1][x] = 1;
  }
  // 让水在这一侧是"能站的浅滩"？不 —— 直接让整条河都是墙，只在观景台前留一小段可走近的水
  // 修正：河做成墙（走不进去），这样"对岸"才真的过不去。
  for (let y = RY0; y <= RY1; y++) for (let x = 1; x < size - 1; x++) {
    grid[y][x] = 1;
  }
  // 但观景台要"临水"：在观景台南缘留一格可以站到水边
  for (let x = Math.round(size * 0.30); x <= Math.round(size * 0.70); x++) {
    if (x < size - 1) grid[RY0 - 1][x] = 0;
  }

  // 河以南全是"对岸" —— 过不去，所以一律做墙。
  // 留成地板的话，河把南北彻底隔断，南岸会变成一大片走不到的死区。
  for (let y = RY1 + 1; y < size - 1; y++) for (let x = 1; x < size - 1; x++) {
    grid[y][x] = 1;
    if (!opposite.has(x + "," + y)) farBank.add(x + "," + y);
  }

  // ---------- 混凝土观景台：河北岸正中，一块长方形 ----------
  const PX0 = Math.round(size * 0.28), PX1 = Math.round(size * 0.72);
  const PY0 = RY0 - 7, PY1 = RY0 - 2;
  for (let y = PY0; y <= PY1; y++) for (let x = PX0; x <= PX1; x++) {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) continue;
    grid[y][x] = 0;
    concrete.add(x + "," + y);
  }
  // 观景台北边接一条来时的山路（从上方下来）
  const pathX = Math.round(size * 0.5);
  for (let y = 1; y < PY0; y++) {
    for (let x = pathX - 1; x <= pathX + 1; x++) grid[y][x] = 0;
  }
  // 山路两侧是树林 —— 全部做墙：撒着放的话会在林子里隔出一片片走不到的孤岛
  for (let y = 1; y < PY0 - 3; y++) {
    for (let x = 1; x < size - 1; x++) {
      if (x >= pathX - 1 && x <= pathX + 1) continue;
      grid[y][x] = 1;
    }
  }
  // 北岸其余的地方：草地（和观景台连成一片）
  for (let y = PY0 - 3; y < RY0; y++) {
    for (let x = 1; x < size - 1; x++) {
      if (concrete.has(x + "," + y)) continue;
      if (grid[y][x] === 0) grass.add(x + "," + y);
    }
  }

  collectFloorsInto(grid, size, floors);

  // 出生点：观景台上，面朝河
  const start = { x: Math.round((PX0 + PX1) / 2), y: PY1, floor: 0 };

  const props_ok = (x, y) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return false;
    if (grid[y][x] !== 0) return false;
    return true;
  };
  const put = (x, y, type, extra) => {
    if (!props_ok(x, y)) return null;
    const p = Object.assign({ x, y, floor: 0, type }, extra || {});
    props.push(p);
    return p;
  };

  // ---------- 那张用草搭制的床（出口）----------
  // 放在观景台西边的草地上 —— 不在店里，也不在台上，得找一找
  let bed = null;
  for (let i = 0; i < 200 && !bed; i++) {
    const bx = randInt(3, size - 4);
    const by = randInt(PY0 - 3, PY0 - 1);
    if (grass.has(bx + "," + by) || (!concrete.has(bx + "," + by) && grid[by] && grid[by][bx] === 0)) {
      bed = put(bx, by, "p284bed", { toLevel: 11 });
    }
  }
  if (!bed) bed = put(PX0 + 2, PY0 - 2, "p284bed", { toLevel: 11 });

  // ---------- 混凝土月台上的音响 ----------
  put(PX1 - 3, PY0 + 1, "p284radio");

  // ---------- 身旁的炸食 ----------
  put(PX1 - 6, PY0 + 2, "p284food");

  // ---------- 想象中的那个人：坐在你身后的月台上 ----------
  const love = put(Math.round((PX0 + PX1) / 2) + 2, PY1 - 1, "p284love", { held: false });

  // ---------- 河边的栏杆 / 台阶（装饰，让观景台不像一块空地）----------
  for (let x = PX0 + 1; x <= PX1 - 1; x += 3) put(x, PY1, "p284rail");
  // 来时那条山路上散落的东西（让"家乡的记忆"有落脚点）
  put(pathX, 4, "p284tree");
  put(pathX + 2, 8, "p284tree");
  put(pathX - 2, 12, "p284tree");
  put(pathX - 1, 16, "p284lamp");

  // 对岸那个平台上也有一盏灯 —— 和这边一模一样
  const farLamp = { x: Math.round(size * 0.5), y: FY0 + 2, floor: 0, type: "p284farlamp" };
  props.push(farLamp);

  return {
    size, level: 284, doubleStory: false,
    layers: [grid], grid, rooms: [[]], floors: [floors],
    start, exit: null, doors: [], ramps: [],
    props, crates: [], ground: [],

    style: "river284",
    tileName: "river284",
    water284: water, concrete284: concrete, opposite284: opposite, grass284: grass, farBank284: farBank,
    plat284: { PX0, PX1, PY0, PY1, RY0, RY1, FY0, FY1 },
    bed284: bed,
    love284: love,
  };
}
window.generateRiver284Map = generateRiver284Map;

function collectFloorsInto(grid, size, out) {
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    if (grid[y][x] === 0) out.push({ x, y });
  }
  return out;
}

// ---------------- 地面 ----------------
window.drawRiver284Floor = function (ctx, px, py, S, map, tx, ty) {
  const k = tx + "," + ty;
  const t = performance.now() / 1000;
  if (map.water284 && map.water284.has(k)) {
    // 河：傍晚的光压在水面上，慢慢地荡
    const w = Math.sin(t * 0.9 + tx * 0.4 + ty * 0.2);
    const b = 70 + w * 12;
    ctx.fillStyle = "rgb(" + Math.round(b * 0.8) + "," + Math.round(b * 1.05) + "," + Math.round(b * 1.25) + ")";
    ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(255,240,210,.20)";
    ctx.fillRect(px, py + ((t * 12 + tx * 6) % S), S, 2);
    return true;
  }
  if (map.concrete284 && map.concrete284.has(k)) {
    // 混凝土浇筑的观景台
    ctx.fillStyle = "#9aa0a6";
    ctx.fillRect(px, py, S, S);
    // 浇筑留下的分格缝
    ctx.strokeStyle = "rgba(70,74,80,.45)";
    ctx.lineWidth = 1;
    ctx.strokeRect(px + 0.5, py + 0.5, S - 1, S - 1);
    ctx.fillStyle = "rgba(255,255,255,.08)";
    ctx.fillRect(px + 1, py + 1, S - 2, 2);
    return true;
  }
  if (map.opposite284 && map.opposite284.has(k)) {
    // 对岸那个一模一样的平台
    ctx.fillStyle = "#8f959b";
    ctx.fillRect(px, py, S, S);
    ctx.strokeStyle = "rgba(70,74,80,.40)";
    ctx.lineWidth = 1;
    ctx.strokeRect(px + 0.5, py + 0.5, S - 1, S - 1);
    return true;
  }
  if (map.grass284 && map.grass284.has(k)) {
    ctx.fillStyle = "#6f8a52";
    ctx.fillRect(px, py, S, S);
    if (((tx * 5 + ty * 3) % 4) === 0) {
      ctx.fillStyle = "rgba(255,255,255,.10)";
      ctx.fillRect(px + 2, py + 2, 2, 4);
    }
    return true;
  }
  // 来时那条山路的泥土
  ctx.fillStyle = "#8a7250";
  ctx.fillRect(px, py, S, S);
  ctx.fillStyle = "rgba(60,45,28,.20)";
  ctx.fillRect(px + 3, py + 5, 4, 2);
  return true;
};

// ---------------- 墙 ----------------
window.drawRiver284Wall = function (ctx, px, py, S, map, tx, ty) {
  const k = tx + "," + ty;
  if (map.water284 && map.water284.has(k)) {
    // 河的深处：走不过去的那一段
    const t = performance.now() / 1000;
    const w = Math.sin(t * 0.9 + tx * 0.4 + ty * 0.2);
    const b = 52 + w * 10;
    ctx.fillStyle = "rgb(" + Math.round(b * 0.7) + "," + Math.round(b * 0.95) + "," + Math.round(b * 1.35) + ")";
    ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(255,255,255,.10)";
    ctx.fillRect(px, py + ((t * 10 + tx * 5) % S), S, 2);
    return true;
  }
  if (map.opposite284 && map.opposite284.has(k)) {
    // 对岸那个平台 —— 和脚下这块一模一样，只是过不去
    ctx.fillStyle = "#8f959b";
    ctx.fillRect(px, py, S, S);
    ctx.strokeStyle = "rgba(70,74,80,.40)";
    ctx.lineWidth = 1;
    ctx.strokeRect(px + 0.5, py + 0.5, S - 1, S - 1);
    return true;
  }
  if (map.farBank284 && map.farBank284.has(k)) {
    // 河对岸：远远的一片草地和树 —— 你只能看着
    ctx.fillStyle = "#5f7a48";
    ctx.fillRect(px, py, S, S);
    if (((tx * 5 + ty * 3) % 3) === 0) {
      ctx.fillStyle = "#3f5a30";
      ctx.beginPath(); ctx.arc(px + S / 2, py + S * 0.42, S * 0.26, 0, Math.PI * 2); ctx.fill();
    }
    return true;
  }
  // 树林：一棵棵的树干（不是 Level 2 的管道）
  ctx.fillStyle = "#5a4a34";
  ctx.fillRect(px, py, S, S);
  ctx.fillStyle = "#4f7a42";
  ctx.beginPath();
  ctx.arc(px + S / 2, py + S * 0.34, S * 0.34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.10)";
  ctx.beginPath();
  ctx.arc(px + S * 0.38, py + S * 0.28, S * 0.14, 0, Math.PI * 2);
  ctx.fill();
  return true;
};

// ---------------- 环境：仲夏的、阴沉的空气 ----------------
window.drawRiver284 = function (ctx, g) {
  const cw = (ctx.canvas && ctx.canvas.width) || 800;
  const ch = (ctx.canvas && ctx.canvas.height) || 600;
  const t = performance.now() / 1000;
  ctx.save();
  try { ctx.setTransform(1, 0, 0, 1, 0, 0); } catch (e) { /* 忽略 */ }
  // 傍晚那层暖橙 —— 保证画面不是黑的
  ctx.fillStyle = "rgba(255,196,130,.075)";
  ctx.fillRect(0, 0, cw, ch);
  // 水面反上来的一点光，慢慢地晃
  const gr = ctx.createLinearGradient(0, ch * 0.5, 0, ch);
  gr.addColorStop(0, "rgba(255,220,170,0)");
  gr.addColorStop(1, "rgba(255,220,170,.10)");
  ctx.fillStyle = gr;
  ctx.fillRect(0, ch * 0.5, cw, ch * 0.5);
  // 很轻的一层呼吸 —— 这是"一个幻影"该有的样子
  const br = 0.020 + 0.012 * Math.sin(t * 0.7);
  ctx.fillStyle = "rgba(255,240,220," + br.toFixed(3) + ")";
  ctx.fillRect(0, 0, cw, ch);
  ctx.restore();
};

// ---------------- 物件 ----------------
window.PROP_DRAW = window.PROP_DRAW || {};

// 用草搭制的床 —— 睡一觉就会在 Level 11 醒来
window.PROP_DRAW["p284bed"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  const t = performance.now() / 1000;
  // 草堆
  ctx.fillStyle = "#b8a860";
  ctx.fillRect(x + 2, y + T * 0.36, T - 4, T * 0.56);
  ctx.fillStyle = "#cbbf78";
  for (let i = 0; i < 7; i++) {
    const sx = x + 3 + (i * 5) % (T - 8);
    const sy = y + T * 0.40 + ((i * 7) % 5) * 2;
    ctx.fillRect(sx, sy, 5, 2);
  }
  // 上面铺着的一块布
  ctx.fillStyle = "#8aa0b8";
  ctx.fillRect(x + 3, y + T * 0.52, T - 6, T * 0.20);
  // 枕头
  ctx.fillStyle = "#e8e2d0";
  ctx.fillRect(x + T * 0.12, y + T * 0.42, T * 0.34, T * 0.16);
  // 一层柔光 —— 它值得你好好睡一觉
  const gl = 0.16 + 0.10 * Math.sin(t * 1.1);
  ctx.fillStyle = "rgba(255,240,200," + gl.toFixed(2) + ")";
  ctx.fillRect(x + 2, y + T * 0.36, T - 4, T * 0.56);
};

// 混凝土月台上的音响
window.PROP_DRAW["p284radio"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  const t = performance.now() / 1000;
  ctx.fillStyle = "#5a5f66";
  ctx.fillRect(x + T * 0.14, y + T * 0.34, T * 0.72, T * 0.52);
  ctx.fillStyle = "#2a2e34";
  ctx.fillRect(x + T * 0.22, y + T * 0.42, T * 0.56, T * 0.22);
  // 半融的冰块在水杯里晃动的那点动静，全靠这台机器
  for (let i = 0; i < 4; i++) {
    const h = 2 + Math.abs(Math.sin(t * 3 + i * 0.8)) * 6;
    ctx.fillStyle = "rgba(150,220,255,.75)";
    ctx.fillRect(x + T * 0.26 + i * 5, y + T * 0.60 - h, 3, h);
  }
  // 喇叭
  ctx.fillStyle = "#3a3e44";
  ctx.beginPath(); ctx.arc(x + T * 0.30, y + T * 0.50, T * 0.07, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + T * 0.70, y + T * 0.50, T * 0.07, 0, Math.PI * 2); ctx.fill();
};

// 身旁的炸食
window.PROP_DRAW["p284food"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  const t = performance.now() / 1000;
  // 纸盒
  ctx.fillStyle = "#d8cba8";
  ctx.fillRect(x + T * 0.20, y + T * 0.44, T * 0.60, T * 0.42);
  // 里头的东西
  ctx.fillStyle = "#c98a3a";
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(x + T * 0.24 + i * (T * 0.11), y + T * 0.36 + (i % 2) * 3, T * 0.09, T * 0.14);
  }
  // 冒起来的热气
  ctx.fillStyle = "rgba(255,255,255,.28)";
  for (let i = 0; i < 3; i++) {
    const yy = y + T * 0.30 - ((t * 12 + i * 8) % 14);
    ctx.beginPath(); ctx.arc(x + T / 2 + Math.sin(t * 2 + i) * 3, yy, 2.4, 0, Math.PI * 2); ctx.fill();
  }
};

// 想象中的那个人 —— 你脑海里那个微小的爱人的幻影
window.PROP_DRAW["p284love"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  const t = performance.now() / 1000;
  // 幻影：半透明，边缘一直在轻轻晃 —— 但体温、戒指、手链全都完美复刻
  const a = p.held ? 0.88 : 0.66;
  ctx.save();
  ctx.globalAlpha = a;
  // 坐姿
  ctx.fillStyle = "#e8dcc4";
  ctx.fillRect(x + T * 0.26, y + T * 0.10, T * 0.44, T * 0.34);   // 脸
  ctx.fillStyle = "#5a6a8a";
  ctx.fillRect(x + T * 0.18, y + T * 0.42, T * 0.62, T * 0.44);   // 身子
  // 头发（乱翘的那一撮）
  ctx.fillStyle = "#4a3a2c";
  ctx.fillRect(x + T * 0.24, y + T * 0.06, T * 0.48, T * 0.08);
  ctx.fillRect(x + T * 0.66, y + T * 0.02, 3, T * 0.10);
  // 戒指和手链 —— 连这些也复刻了
  ctx.fillStyle = "rgba(255,220,120,.9)";
  ctx.fillRect(x + T * 0.20, y + T * 0.60, 3, 3);
  ctx.fillRect(x + T * 0.24, y + T * 0.68, 3, 2);
  // 手里那杯水：半融的冰块在晃
  ctx.fillStyle = "rgba(200,230,250,.7)";
  ctx.fillRect(x + T * 0.74, y + T * 0.50, T * 0.16, T * 0.20);
  ctx.fillStyle = "rgba(255,255,255,.8)";
  ctx.fillRect(x + T * 0.78 + Math.sin(t * 3) * 1.5, y + T * 0.54, 3, 3);
  ctx.restore();
  // 牵上手之后那一圈光
  if (p.held) {
    const gl = 0.18 + 0.10 * Math.sin(t * 2.2);
    ctx.fillStyle = "rgba(255,210,160," + gl.toFixed(2) + ")";
    ctx.beginPath();
    ctx.arc(x + T / 2, y + T * 0.45, T * 0.62, 0, Math.PI * 2);
    ctx.fill();
  }
};

// 观景台边上的栏杆
window.PROP_DRAW["p284rail"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#7a8088";
  ctx.fillRect(x + 2, y + T * 0.42, T - 4, 4);
  ctx.fillRect(x + T * 0.22, y + T * 0.42, 3, T * 0.44);
  ctx.fillRect(x + T * 0.72, y + T * 0.42, 3, T * 0.44);
};

// 山路上那几棵树
window.PROP_DRAW["p284tree"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#5a4a34";
  ctx.fillRect(x + T * 0.42, y + T * 0.40, T * 0.16, T * 0.52);
  ctx.fillStyle = "#4f7a42";
  ctx.beginPath(); ctx.arc(x + T / 2, y + T * 0.32, T * 0.32, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.12)";
  ctx.beginPath(); ctx.arc(x + T * 0.40, y + T * 0.26, T * 0.13, 0, Math.PI * 2); ctx.fill();
};

// 山路上的路灯
window.PROP_DRAW["p284lamp"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  const t = performance.now() / 1000;
  ctx.fillStyle = "#5a5f66";
  ctx.fillRect(x + T * 0.46, y + T * 0.34, 3, T * 0.56);
  ctx.fillStyle = "rgba(255,214,140,.55 + 0)" || "rgba(255,214,140,.55)";
  const gl = 0.45 + 0.18 * Math.sin(t * 1.4);
  ctx.fillStyle = "rgba(255,214,140," + gl.toFixed(2) + ")";
  ctx.beginPath(); ctx.arc(x + T * 0.48, y + T * 0.28, T * 0.14, 0, Math.PI * 2); ctx.fill();
};

// 对岸那个一模一样的平台上的灯
window.PROP_DRAW["p284farlamp"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  const t = performance.now() / 1000;
  ctx.fillStyle = "#6a6f76";
  ctx.fillRect(x + T * 0.46, y + T * 0.34, 3, T * 0.56);
  const gl = 0.32 + 0.14 * Math.sin(t * 1.4 + 1.7);
  ctx.fillStyle = "rgba(255,214,140," + gl.toFixed(2) + ")";
  ctx.beginPath(); ctx.arc(x + T * 0.48, y + T * 0.28, T * 0.13, 0, Math.PI * 2); ctx.fill();
};
