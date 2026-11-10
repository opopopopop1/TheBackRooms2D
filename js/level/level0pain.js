// ===========================================================
// 痛处 —— Level 0 里的一个房间（不是一整层，是一处特殊地点）
//   一个黑白的区域。靠近它会导致强烈的恐惧感。
//   内部有多个坟墓，排列成完美的圆圈，围绕着中心一个不知名的
//   戴帽男子的破损石像。七英尺高的枯树在散乱的坟墓旁构成同样的圆圈排列。
//   踩在散落在地上的被分解了的树叶上时，它们传出刺耳的尖叫声。
//   黑暗吞噬了这个区域，唯一的光源是孤寂而静止的月亮。
//   浓重的灰雾环绕整个区域，能见度降低到了仅有五英尺。
//   每个墓碑都有着一位死者的姓名，还有一条短句以形容他们的死因，
//   以及两个日期 —— 生日与忌日。M.E.G. 未曾发现与之相关联的任何流浪者。
//   碰触到异常表面的人会迅速转变为灰色，并最终化为灰烬 ——
//   肉体不复存在，灵魂却仍在这里游荡，被迫重温最糟糕的记忆。
//   ===========================================================
//   入口：Level 0 里有时会出现一团灰雾挡住去路 —— 走进去，你的灵魂便来到这
//   出口：没有出口。你的生命值与理智值不复存在，也不会减少。你将永远留在这里。
// ===========================================================
"use strict";

(function () {
  // 灰白的土地 / 更深的灰（都不是黑的，也不是 Level 2 的管道）
  const v = ["#9a9a98", "#6e6e70"];
  if (typeof regTile === "function") regTile("pain0", v);
  else { (window.__NEWTILE_EXTRA = window.__NEWTILE_EXTRA || {})["pain0"] = v; }
})();

// 墓碑：姓名 + 一句形容死因的短句 + 生日与忌日
// M.E.G. 尽最大努力寻找过这些姓名的拥有者 —— 未曾发现与之相关联的任何流浪者。
const PAIN_EPITAPHS = [
  { name: "埃莉诺·R·惠特克", cause: "她想起了不该想起的事",   b: "1961.04.12", d: "——" },
  { name: "D. 卡尔森",        cause: "在黄色的墙纸后面站了太久", b: "1978.11.02", d: "——" },
  { name: "玛塔·伊万诺娃",    cause: "她说她只是想回家",       b: "1983.07.29", d: "——" },
  { name: "小托马斯·芬奇",    cause: "他一直跑，直到跑不动了",   b: "1990.01.17", d: "——" },
  { name: "H. 兰伯特",        cause: "他看见了真相",           b: "1955.09.08", d: "——" },
  { name: "陈玉兰",           cause: "她在等一个不会来的人",     b: "1968.03.21", d: "——" },
  { name: "R. 奥康奈尔",      cause: "他终于知道自己在怕什么",   b: "1972.06.05", d: "——" },
  { name: "安雅·彼得洛娃",    cause: "她把手伸进了雾里",       b: "1988.12.14", d: "——" },
  { name: "J. 莫兰",          cause: "他睡着后就没有再醒来",     b: "1964.02.27", d: "——" },
  { name: "伊莱恩·S·杜克",    cause: "她数着脚步，数到了尽头",   b: "1979.10.10", d: "——" },
  { name: "无名氏",           cause: "没有人记得他是谁",        b: "????.??.??", d: "——" },
  { name: "塞缪尔·科瓦奇",    cause: "他想把这件事告诉别人",     b: "1985.05.03", d: "——" },
];
window.PAIN_EPITAPHS = PAIN_EPITAPHS;

function generatePainMap(level) {
  const size = 30;
  const grid = makeGrid(size);
  const props = [];
  const floors = [];

  const ground = new Set();   // 灰白的土地
  const leaves = new Set();   // 散落在地上的、被分解了的树叶（踩上去会尖叫）
  const CX = Math.round(size / 2), CY = Math.round(size / 2);

  // ---------- 这一小片地方：一个圆形的空地 ----------
  const R = size * 0.42;
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      if (Math.hypot(x - CX, y - CY) < R) { grid[y][x] = 0; ground.add(x + "," + y); }
    }
  }

  // ---------- 中心：一个不知名的戴帽男子的破损石像 ----------
  props.push({ x: CX, y: CY, floor: 0, type: "pstatue" });

  // ---------- 坟墓：排列成完美的圆圈，围着那座石像 ----------
  const TOMB_R = 6;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const tx = Math.round(CX + Math.cos(a) * TOMB_R);
    const ty = Math.round(CY + Math.sin(a) * TOMB_R);
    if (grid[ty] && grid[ty][tx] === 0) {
      props.push({ x: tx, y: ty, floor: 0, type: "ptomb", idx: i, read: false });
    }
  }

  // ---------- 七英尺高的枯树：在散乱的坟墓旁构成同样的圆圈排列 ----------
  const TREE_R = TOMB_R + 3;
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.31;
    const tx = Math.round(CX + Math.cos(a) * TREE_R);
    const ty = Math.round(CY + Math.sin(a) * TREE_R);
    if (grid[ty] && grid[ty][tx] === 0) {
      props.push({ x: tx, y: ty, floor: 0, type: "ptree" });
    }
  }

  // ---------- 散落在地上的、被分解了的树叶 ----------
  for (let i = 0; i < 46; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 2 + Math.random() * (R - 3);
    const x = Math.round(CX + Math.cos(a) * r), y = Math.round(CY + Math.sin(a) * r);
    if (!grid[y] || grid[y][x] !== 0) continue;
    if (x === CX && y === CY) continue;
    leaves.add(x + "," + y);
  }

  collectFloorsInto(grid, size, floors);

  // 出生：空地的边缘 —— 你是从那团灰雾里走进来的
  const start = { x: CX, y: Math.round(CY + R - 2), floor: 0 };

  return {
    size, level: "pain", doubleStory: false,
    layers: [grid], grid, rooms: [[]], floors: [floors],
    start, exit: null, doors: [], ramps: [],
    props, crates: [], ground: [],

    style: "pain0",
    tileName: "pain0",
    painGround: ground, painLeaves: leaves,
    painC: { CX, CY, R },
    // 没有出口：生命值与理智值不复存在，也不会减少 —— 你会永远留在这里
    noExit: true,
  };
}
window.generatePainMap = generatePainMap;

// ---------------- 地面 ----------------
window.drawPainFloor = function (ctx, px, py, S, map, tx, ty) {
  const k = tx + "," + ty;
  // 这一片土地是黑白的
  ctx.fillStyle = "#9a9a98";
  ctx.fillRect(px, py, S, S);
  const h = hash2(tx, ty);
  if ((h & 3) === 0) {
    ctx.fillStyle = "rgba(120,120,122,.35)";
    ctx.fillRect(px + 2, py + 3, S - 5, S - 6);
  }
  // 被分解了的树叶：一堆碎屑
  if (map.painLeaves && map.painLeaves.has(k)) {
    ctx.fillStyle = "rgba(78,74,66,.75)";
    for (let i = 0; i < 5; i++) {
      const lx = px + 3 + ((h + i * 7) % (S - 7));
      const ly = py + 3 + ((h + i * 5) % (S - 7));
      ctx.fillRect(lx, ly, 4, 2);
      ctx.fillRect(lx + 1, ly + 2, 2, 2);
    }
  }
  return true;
};

// ---------------- 墙（这一圈之外全是黑暗）----------------
window.drawPainWall = function (ctx, px, py, S, map, tx, ty) {
  // 黑暗吞噬了这个区域 —— 那不是 Level 2 的管道，是一片更深的灰
  ctx.fillStyle = "#4a4a4e";
  ctx.fillRect(px, py, S, S);
  ctx.fillStyle = "rgba(24,24,28,.55)";
  ctx.fillRect(px, py, S, S * 0.35);
  const h = hash2(tx, ty);
  if ((h & 5) === 0) {
    ctx.fillStyle = "rgba(150,150,154,.14)";
    ctx.fillRect(px + 3, py + S * 0.5, S - 7, S * 0.34);
  }
  return true;
};

// ---------------- 环境：黑暗 + 那轮孤寂而静止的月亮 + 五英尺的能见度 ----------------
window.drawPain = function (ctx, g, cam) {
  // 注意：这个函数是在世界变换 ctx.restore() 之后才被调用的 ——
  // 此刻画布上的变换只剩一层纯 DPR（a=DPR，e=0）。
  // 所以"读变换矩阵反推玩家屏幕坐标"这条路是走不通的：
  // 矩阵里根本没有相机，算出来只会是 DPR * player.x（几千像素，早飞出屏幕了）。
  // 必须老老实实用 cam 算：屏幕 CSS 坐标 = (世界坐标 - cam.x) * cam.scale + 屏幕宽/2。
  const cw = (ctx.canvas && ctx.canvas.width) || 800;
  const ch = (ctx.canvas && ctx.canvas.height) || 600;
  const T = (typeof TILE === "number" ? TILE : 40);

  const m0 = ctx.getTransform ? ctx.getTransform() : null;
  const dpr = (m0 && m0.a) || 1;                 // 此刻只剩 DPR 这一层
  const cssW = cw / dpr, cssH = ch / dpr;

  let sx = cssW / 2, sy = cssH / 2, unit = 1;
  if (cam && g && g.player) {
    const sc = cam.scale || 1;
    sx = (g.player.x - cam.x) * sc + cssW / 2;
    sy = (g.player.y - cam.y) * sc + cssH / 2;
    unit = sc;
  }
  sx *= dpr; sy *= dpr; unit *= dpr;             // 转成设备像素（下面用 setTransform(1,...) 画）

  ctx.save();
  try { ctx.setTransform(1, 0, 0, 1, 0, 0); } catch (e) { /* 忽略 */ }

  // 那轮孤寂而静止的月亮 —— 唯一的光源。它不动。
  const mx = cw * 0.78, my = ch * 0.18, mr = Math.max(16, Math.min(cw, ch) * 0.055);
  const mg = ctx.createRadialGradient(mx, my, 1, mx, my, mr * 4.5);
  mg.addColorStop(0, "rgba(226,228,232,.55)");
  mg.addColorStop(1, "rgba(226,228,232,0)");
  ctx.fillStyle = mg;
  ctx.fillRect(mx - mr * 4.5, my - mr * 4.5, mr * 9, mr * 9);
  ctx.fillStyle = "#e2e4e8";
  ctx.beginPath(); ctx.arc(mx, my, mr, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(180,182,188,.55)";
  ctx.beginPath(); ctx.arc(mx - mr * 0.3, my - mr * 0.2, mr * 0.24, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(mx + mr * 0.3, my + mr * 0.3, mr * 0.16, 0, Math.PI * 2); ctx.fill();

  // 浓重的灰雾：能见度只有五英尺 —— 只在你身边挖出一小圈
  // 手电筒能把这层雾推开一截：光圈变大，正前方还多捅出一道锥形。
  const flOn = !!(g && g.flashlight);
  const visR = T * (flOn ? 3.6 : 1.6) * unit;   // 五英尺（开手电约十二英尺）
  const half = 0.42;                            // 光锥半角（约 ±24°）
  let ang = 0, len = 0;
  if (flOn && g.player && (g.player.faceX || g.player.faceY)) {
    ang = Math.atan2(g.player.faceY, g.player.faceX);
    len = T * 11 * unit;                        // 光柱长度
  }

  // 雾必须"挖洞"画 —— 把身边的圆和手电的锥作为逆时针子路径加进同一条路径里。
  // 不能用 destination-out：那会把底下已经画好的世界一起擦成透明，
  // 光柱反而变成一个透出页面背景的黑洞 —— 越开手电越黑，等于没开。
  function fogPath() {
    ctx.beginPath();
    ctx.rect(0, 0, cw, ch);
    ctx.arc(sx, sy, visR, 0, Math.PI * 2, true);          // 逆时针 = 挖洞
    if (len > 0) {
      ctx.moveTo(sx, sy);
      ctx.arc(sx, sy, len, ang + half, ang - half, true); // 逆时针 = 挖洞
      ctx.closePath();
    }
  }

  const fogA = flOn ? 0.85 : 0.90;
  ctx.fillStyle = "rgba(126,126,130," + fogA.toFixed(2) + ")";
  fogPath();
  ctx.fill();
  // 雾的边缘：再糊一层
  const fg = ctx.createRadialGradient(sx, sy, visR * 0.55, sx, sy, visR * 1.9);
  fg.addColorStop(0, "rgba(126,126,130,0)");
  fg.addColorStop(1, "rgba(126,126,130," + (flOn ? 0.40 : 0.55).toFixed(2) + ")");
  ctx.fillStyle = fg;
  fogPath();
  ctx.fill();

  // 光柱本身：一点暖白，让人看清手电确实开着
  // 只挖洞是不够的 —— 洞里露出的是迷雾之下本来就偏暗的世界，
  // 结果"看得见的地方"反而比雾还黑（实测：洞内 60~70，洞外 115）。
  // 所以挖完洞还要往里补光：脚下那圈月光（手电开着时更亮、更远）。
  ctx.globalCompositeOperation = "lighter";
  // 补光半径别跟着 visR 一起放大 —— 那会连成一大片，整屏一起变白，
  // 手电看着就像"把雾调淡了"，而不是"照出一道光"。这里固定按视距的 1.35 倍收着。
  const lr = visR * 1.35;
  const lg = ctx.createRadialGradient(sx, sy, 0, sx, sy, lr);
  lg.addColorStop(0, "rgba(232,236,244," + (flOn ? 0.42 : 0.30) + ")");
  lg.addColorStop(0.55, "rgba(220,226,236," + (flOn ? 0.20 : 0.12) + ")");
  lg.addColorStop(1, "rgba(210,216,228,0)");
  ctx.fillStyle = lg;
  ctx.beginPath(); ctx.arc(sx, sy, lr, 0, Math.PI * 2); ctx.fill();

  if (len > 0) {
    // 手电的锥形光柱（补光，不是擦除）
    const cg = ctx.createRadialGradient(sx, sy, visR * 0.2, sx, sy, len);
    cg.addColorStop(0, "rgba(255,246,214,.42)");
    cg.addColorStop(0.55, "rgba(255,244,208,.24)");
    cg.addColorStop(1, "rgba(255,240,200,0)");
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.arc(sx, sy, len, ang - half, ang + half);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";
  ctx.restore();
};

// ---------------- 物件 ----------------
window.PROP_DRAW = window.PROP_DRAW || {};

// 中心那个不知名的、戴帽男子的破损石像
window.PROP_DRAW["pstatue"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  // 基座（破损：缺了一角）
  ctx.fillStyle = "#8e8e90";
  ctx.fillRect(x + T * 0.16, y + T * 0.74, T * 0.68, T * 0.20);
  ctx.fillStyle = "rgba(40,40,44,.55)";
  ctx.fillRect(x + T * 0.16, y + T * 0.74, T * 0.20, T * 0.08);
  // 身体
  ctx.fillStyle = "#a6a6a8";
  ctx.fillRect(x + T * 0.30, y + T * 0.34, T * 0.40, T * 0.42);
  // 头
  ctx.fillStyle = "#b2b2b4";
  ctx.beginPath(); ctx.arc(x + T * 0.50, y + T * 0.26, T * 0.14, 0, Math.PI * 2); ctx.fill();
  // 帽子
  ctx.fillStyle = "#7a7a7c";
  ctx.fillRect(x + T * 0.30, y + T * 0.18, T * 0.40, T * 0.05);
  ctx.fillRect(x + T * 0.38, y + T * 0.10, T * 0.24, T * 0.09);
  // 破损：脸上那道裂
  ctx.strokeStyle = "rgba(48,48,52,.65)";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(x + T * 0.42, y + T * 0.20);
  ctx.lineTo(x + T * 0.56, y + T * 0.34);
  ctx.stroke();
  // 一只手伸出来（碰上去什么也摸不到）
  ctx.fillStyle = "#a0a0a2";
  ctx.fillRect(x + T * 0.66, y + T * 0.44, T * 0.16, T * 0.06);
};

// 墓碑：姓名 + 一句形容死因的短句 + 两个日期
window.PROP_DRAW["ptomb"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  // 碑身
  ctx.fillStyle = "#b4b4b6";
  ctx.fillRect(x + T * 0.24, y + T * 0.24, T * 0.52, T * 0.62);
  ctx.fillStyle = "#c2c2c4";
  ctx.beginPath();
  ctx.arc(x + T * 0.50, y + T * 0.24, T * 0.26, Math.PI, 0);
  ctx.fill();
  // 刻在上面的字（画成一道道刻痕 —— 太近才看得清）
  ctx.strokeStyle = "rgba(58,58,62,.70)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(x + T * 0.32, y + T * 0.40 + i * T * 0.11);
    ctx.lineTo(x + T * (0.46 + ((p.idx * 7 + i * 13) % 20) / 60), y + T * 0.40 + i * T * 0.11);
    ctx.stroke();
  }
  // 碑前的土堆
  ctx.fillStyle = "rgba(120,120,122,.55)";
  ctx.fillRect(x + T * 0.16, y + T * 0.82, T * 0.68, T * 0.10);
};

// 七英尺高的枯树
window.PROP_DRAW["ptree"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  // 树干：又高又细，没有一片叶子
  ctx.fillStyle = "#78767a";
  ctx.fillRect(x + T * 0.44, y + T * 0.16, T * 0.12, T * 0.72);
  ctx.strokeStyle = "#78767a";
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    const yy = y + T * (0.24 + i * 0.14);
    const s = (i % 2 === 0) ? 1 : -1;
    ctx.beginPath();
    ctx.moveTo(x + T * 0.50, yy);
    ctx.lineTo(x + T * 0.50 + s * T * 0.26, yy - T * 0.12);
    ctx.stroke();
  }
  // 顶上那一小丛枯枝
  ctx.strokeStyle = "#6e6c70";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(x + T * 0.50, y + T * 0.20);
  ctx.lineTo(x + T * 0.36, y + T * 0.06);
  ctx.moveTo(x + T * 0.50, y + T * 0.20);
  ctx.lineTo(x + T * 0.64, y + T * 0.08);
  ctx.stroke();
};

// ---------------- Level 0 里的入口：一团灰雾 ----------------
window.PROP_DRAW["grayfog0"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  const t = performance.now() / 1000;
  // 一团灰雾 —— 它挡在路中间，看不见后面
  for (let i = 0; i < 4; i++) {
    const ph = t * 0.5 + i * 1.7;
    const ox = Math.sin(ph) * T * 0.16, oy = Math.cos(ph * 0.8) * T * 0.12;
    ctx.fillStyle = "rgba(150,150,152," + (0.20 + 0.08 * i).toFixed(3) + ")";
    ctx.beginPath();
    ctx.arc(x + T * 0.5 + ox, y + T * 0.5 + oy, T * (0.42 - i * 0.06), 0, Math.PI * 2);
    ctx.fill();
  }
  // 雾的边缘正在渗进 Level 0 的黄墙纸 —— 那一片的颜色正在失去饱和度
  ctx.fillStyle = "rgba(190,190,190,.30)";
  ctx.fillRect(x + 4, y + T * 0.34, T - 8, 4);
};
