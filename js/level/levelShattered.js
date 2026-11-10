// ===========================================================
// 隐秘层级 —— 破碎之地
//   严格来说并不是一个层级，甚至不是后室的一部分：它在后室之外，
//   由后室里无用的信息构成。
//   外形和色彩都处在变化之中，建筑架构与环境布局与任何合理的空间结构都不相符 ——
//   一切都在拉伸、扭曲，难以名状。光线在各个景观间来回折射，却溯寻不到来源与终点。
//   崩解的地面内外，斑斓的色彩和古怪的形状不停地突现又消失，没有任何规律。
//   更高维度的物体不断地切进又消失，并在彼此接触时把仅存的可处理数据进一步撕裂。
//   虽没有明确的声音来源，此处仍充斥着震耳欲聋的噪声。
//   被称作"实体"的生物不会在这里出现 —— 进入此地的实体，其身体结构会变成
//   闪烁的色块，逐步融入环境，最终成为此处的一部分。
//   ★ 混乱核心：毁坏的表面下是混乱的核心，不断自我毁坏又重构出夸张滑稽的形体，
//     期间释放刺眼跃动的光芒与大量的热 —— 一旦接触，它就会用无序的数据
//     彻底侵蚀人的结构，摧毁人体。
//   入口：在 Level 601 运行一个叫 TCI_BootUp.exe 的程序。
//   出口：这里没有任何出口，甚至连任何能够传送的物品都已失效 ——
//         而你也早已变成其的一部分。出口早已被吞噬。
// ===========================================================
"use strict";

(function () {
  // 斑斓 —— 绝不是黑的，也绝不是 Level 2 的管道
  const v = ["#6d5fa8", "#8f6fbf"];
  if (typeof regTile === "function") regTile("shattered", v);
  else { (window.__NEWTILE_EXTRA = window.__NEWTILE_EXTRA || {})["shattered"] = v; }
})();

function hash3(a, b, c) {
  let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

function generateShatteredMap(level) {
  const size = 92;
  const grid = makeGrid(size);
  // 一整片崩解的地面：只有最外两圈是"边界"
  for (let y = 3; y < size - 3; y++) {
    for (let x = 3; x < size - 3; x++) grid[y][x] = 0;
  }
  const floors = collectFloors(grid, size);
  const start = { x: Math.floor(size / 2) - 14, y: Math.floor(size / 2), floor: 0 };
  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [[]],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props: [], crates: [], ground: [],
    // 混乱核心：地图正中
    core: { x: Math.floor(size / 2), y: Math.floor(size / 2), r: 7.5 },
    // ==== 不可计量：地图是一个跟着玩家滚动的窗口 ====
    //   grid 只有 92×92，但它代表的世界没有边界 —— originX / originY 是
    //   grid[0][0] 对应的世界格坐标。玩家走近边缘时整张图往那个方向滚，
    //   滚出窗口的世界坐标记进 gone：那些地方"不复存在"，就算绕回来
    //   也只会是一片已经消散的残骸。
    originX: 0, originY: 0,
    gone: new Set(),
  };
  map.spawnPts = [start];
  return map;
}
window.generateShatteredMap = generateShatteredMap;

// ===========================================================
// 不可计量：滚动窗口
//   走到哪加载到哪 —— 身后滚出窗口的地方，就此不复存在。
// ===========================================================
const SH_BAND = 16;          // 离窗口边缘还剩这么多格就开始滚
const SH_BORDER = 2;         // 最外两圈恒为边界（走不出去，也看不到"地图尽头"）

function shNewCell(m, wx, wy) {
  return (m.gone && m.gone.has(wx + "," + wy)) ? 1 : 0;
}

function shMarkGone(m, wx, wy) {
  if (!m.gone) m.gone = new Set();
  m.gone.add(wx + "," + wy);
  // 走再远也不能让这张表把内存吃光 —— 超过上限就丢掉最早的一批
  if (m.gone.size > 40000) {
    let n = 0;
    for (const k of m.gone) { m.gone.delete(k); if (++n >= 20000) break; }
  }
}

function shBorder(m, grid, size) {
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const edge = x < SH_BORDER || y < SH_BORDER || x >= size - SH_BORDER || y >= size - SH_BORDER;
      if (edge) grid[y][x] = 1;
    }
  }
}

function shatteredScroll(g) {
  const m = g && g.map;
  if (!m || !m.layers || !m.layers[0]) return;
  const size = m.size | 0;
  if (size < 24) return;
  const TILE_ = (typeof TILE === "number") ? TILE : 40;
  const grid = m.layers[0];
  if (m.originX == null) m.originX = 0;
  if (m.originY == null) m.originY = 0;
  if (!m.gone) m.gone = new Set();

  const wx = Math.floor(g.player.x / TILE_), wy = Math.floor(g.player.y / TILE_);
  const lx = wx - m.originX, ly = wy - m.originY;
  let dx = 0, dy = 0;
  if (lx < SH_BAND) dx = lx - SH_BAND;
  else if (lx > size - SH_BAND) dx = lx - (size - SH_BAND);
  if (ly < SH_BAND) dy = ly - SH_BAND;
  else if (ly > size - SH_BAND) dy = ly - (size - SH_BAND);
  if (!dx && !dy) return;
  // 位移大得离谱（传送 / 卡帧）时一次只挪一点，免得整张图被抹平
  const lim = Math.floor(size / 3);
  dx = Math.max(-lim, Math.min(lim, dx));
  dy = Math.max(-lim, Math.min(lim, dy));

  // ---- 1) 先把要滚出窗口的世界坐标记成"不复存在" ----
  if (dx > 0) {
    for (let y = 0; y < size; y++) for (let i = 0; i < dx; i++) shMarkGone(m, m.originX + i, m.originY + y);
  } else if (dx < 0) {
    for (let y = 0; y < size; y++) for (let i = 0; i < -dx; i++) shMarkGone(m, m.originX + size - 1 - i, m.originY + y);
  }
  if (dy > 0) {
    for (let y = 0; y < dy; y++) for (let x = 0; x < size; x++) shMarkGone(m, m.originX + x, m.originY + y);
  } else if (dy < 0) {
    for (let y = 0; y < -dy; y++) for (let x = 0; x < size; x++) shMarkGone(m, m.originX + x, m.originY + size - 1 - y);
  }

  // ---- 2) 整张图往那个方向挪 ----
  if (dx > 0) {
    for (let y = 0; y < size; y++) {
      const row = grid[y];
      for (let i = 0; i < dx; i++) row.shift();
      for (let i = 0; i < dx; i++) row.push(shNewCell(m, m.originX + size - dx + i, m.originY + y));
    }
  } else if (dx < 0) {
    const k = -dx;
    for (let y = 0; y < size; y++) {
      const row = grid[y];
      for (let i = 0; i < k; i++) row.pop();
      for (let i = k - 1; i >= 0; i--) row.unshift(shNewCell(m, m.originX + dx + i, m.originY + y));
    }
  }
  if (dy > 0) {
    for (let i = 0; i < dy; i++) grid.shift();
    for (let i = 0; i < dy; i++) {
      const row = new Array(size);
      for (let x = 0; x < size; x++) row[x] = shNewCell(m, m.originX + x, m.originY + size - dy + i);
      grid.push(row);
    }
  } else if (dy < 0) {
    const k = -dy;
    for (let i = 0; i < k; i++) grid.pop();
    for (let i = k - 1; i >= 0; i--) {
      const row = new Array(size);
      for (let x = 0; x < size; x++) row[x] = shNewCell(m, m.originX + x, m.originY + dy + i);
      grid.unshift(row);
    }
  }
  m.originX += dx; m.originY += dy;

  // ---- 3) 混乱核心钉在世界坐标上：图挪了，它得跟着反向挪 ----
  if (m.core) { m.core.x -= dx; m.core.y -= dy; }
  // ---- 4) 边界重新长出来（原来的边界已经被挪走了）----
  shBorder(m, grid, size);
  // ---- 5) 地面索引重算：不重算的话后面全是旧坐标 ----
  try { m.floors[0] = collectFloors(grid, size); } catch (e) { /* 忽略 */ }
}
window.shatteredScroll = shatteredScroll;

// ===========================================================
// 地面：拉伸、扭曲、斑斓色块不停地突现又消失
// ===========================================================
window.drawShatteredFloor = function (ctx, px, py, S, map, tx, ty) {
  const t = performance.now() / 1000;
  // 相位：每格自己的"呼吸"，让它看起来在被拉伸
  const ph = hash3(tx, ty, 0) * Math.PI * 2;
  const wob = Math.sin(t * 0.9 + ph) * 0.5 + Math.sin(t * 0.37 + ph * 1.7) * 0.5;

  // 底色：斑斓 —— 色相随时间缓慢漂移
  const hb = hash3(tx, ty, 1);
  const n = Math.floor(t * 0.22) + Math.floor(hb * 3);
  const hue = (hb * 360 + n * 47) % 360;
  const li = 30 + wob * 8 + hb * 12;
  const fill = "hsl(" + hue.toFixed(0) + "," + (48 + hb * 30).toFixed(0) + "%," + li.toFixed(0) + "%)";
  ctx.fillStyle = fill;
  // 先铺满整格（验证器量的是 fillRect 的落笔面积 —— 只画多边形会被判成"没画"，
  // 转而去画 Level 2 的管道地板，把斑斓的地面整个盖掉）
  ctx.fillRect(px, py, S + 1, S + 1);
  // 再画成被扯歪的四边形，而不是规整的方块 —— 一切都在拉伸
  const d0 = wob * S * 0.16, d1 = Math.cos(t * 0.7 + ph) * S * 0.16;
  ctx.beginPath();
  ctx.moveTo(px - d0, py - d1);
  ctx.lineTo(px + S + d1, py - d0);
  ctx.lineTo(px + S + d0, py + S + d1);
  ctx.lineTo(px - d1, py + S + d0);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();

  // 突现又消失的色块：每 0.7 秒换一批，完全没有规律
  const slot = Math.floor(t / 0.7);
  const r = hash3(tx, ty, slot + 7);
  if (r > 0.72) {
    const fade = 1 - ((t / 0.7) % 1);
    ctx.globalAlpha = Math.min(1, fade * 1.2);
    ctx.fillStyle = "hsl(" + ((hash3(tx, ty, slot) * 360) | 0) + ",92%," + (52 + r * 20).toFixed(0) + "%)";
    const w = S * (0.25 + hash3(tx, ty, slot + 3) * 0.6);
    const hgt = S * (0.25 + hash3(tx, ty, slot + 5) * 0.6);
    ctx.fillRect(px + S * 0.5 - w / 2 + wob * S * 0.1, py + S * 0.5 - hgt / 2, w, hgt);
    ctx.globalAlpha = 1;
  }
  // 折射的光：在各个景观间来回，却找不到来源
  const lr = hash3(tx, ty, Math.floor(t * 1.6) + 11);
  if (lr > 0.88) {
    ctx.strokeStyle = "hsla(" + ((lr * 360) | 0) + ",100%,78%,0.55)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(px, py + S * lr);
    ctx.lineTo(px + S, py + S * (1 - lr));
    ctx.stroke();
  }
  return true;
};

window.drawShatteredWall = function (ctx, px, py, S, map, tx, ty) {
  const t = performance.now() / 1000;
  // 已经滚出窗口 = 不复存在：只剩正在消散的残骸，走不进去
  if (map && map.gone && map.originX != null
    && map.gone.has((map.originX + tx) + "," + (map.originY + ty))) {
    const slot = Math.floor(t * 6);
    const r0 = hash3(tx, ty, slot);
    ctx.fillStyle = "hsl(" + ((r0 * 360) | 0) + ",40%," + (12 + r0 * 14).toFixed(0) + "%)";
    ctx.fillRect(px, py, S + 1, S + 1);
    // 残骸：几块还在闪的碎片，正在一点点散掉
    ctx.globalAlpha = 0.35 + 0.4 * Math.abs(Math.sin(t * 5 + r0 * 6.28));
    for (let i = 0; i < 3; i++) {
      const a = hash3(tx, ty, slot + i);
      ctx.fillStyle = "hsl(" + ((a * 360) | 0) + ",90%,62%)";
      const w = S * (0.15 + a * 0.3);
      ctx.fillRect(px + hash3(tx, ty, slot + i + 9) * (S - w),
        py + hash3(tx, ty, slot + i + 17) * (S - w), w, w);
    }
    ctx.globalAlpha = 1;
    // 一道正在断开的边
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px, py + S * r0); ctx.lineTo(px + S, py + S * (1 - r0));
    ctx.stroke();
    return true;
  }
  const hb = hash3(tx, ty, 9);
  const wob = Math.sin(t * 0.8 + hb * 6.28) * 0.5 + 0.5;
  const hue = (hb * 360 + Math.floor(t * 0.3) * 31) % 360;
  ctx.fillStyle = "hsl(" + hue.toFixed(0) + ",55%," + (16 + wob * 10).toFixed(0) + "%)";
  ctx.fillRect(px, py, S + 1, S + 1);
  // 墙也在崩解：表面裂成碎片
  ctx.strokeStyle = "hsla(" + ((hue + 140) % 360) + ",90%,62%,0.35)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(px + S * hb, py);
  ctx.lineTo(px + S * (1 - hb), py + S);
  ctx.stroke();
  return true;
};

// ===========================================================
// 整屏叠加：混乱核心 + 高维物体切进切出 + 噪声
// ===========================================================
window.drawShatteredOverlay = function (ctx, g, CAM) {
  if (!g) return;
  const cw = (ctx.canvas && ctx.canvas.width) || 800;
  const ch = (ctx.canvas && ctx.canvas.height) || 600;
  const t = performance.now() / 1000;
  const TILE_ = (typeof TILE === "number") ? TILE : 40;
  ctx.save();
  try { ctx.setTransform(1, 0, 0, 1, 0, 0); } catch (e) { /* 忽略 */ }
  // 相机由 main.js 的 getCamera() 现算后传进来（game 上并没有 cam 这个字段）——
  // 以前写成 g.cam || {x:0,y:0}，取到空值后映射退化成"屏幕中心"，
  // 混乱核心和高维物体就全画在了错的地方，而且漏了 cam.scale。
  const cam = CAM || g.cam || { x: g.player ? g.player.x : 0, y: g.player ? g.player.y : 0, scale: 1, viewW: cw, viewH: ch };
  const sc = cam.scale || 1;
  const sxOf = (wx) => (wx - cam.x) * sc + cw / 2;
  const syOf = (wy) => (wy - cam.y) * sc + ch / 2;

  // ---- 混乱核心：不断自我毁坏又重构，释放刺眼跃动的光芒 ----
  const core = (g.map && g.map.core) || { x: 0, y: 0, r: 7.5 };
  const cx = sxOf((core.x + 0.5) * TILE_), cy = syOf((core.y + 0.5) * TILE_);
  const pulse = 0.5 + Math.sin(t * 3.1) * 0.5;
  const boom = Math.pow(Math.max(0, Math.sin(t * 0.9)), 6);      // 自我毁坏的那一刻
  const R = core.r * TILE_ * (0.9 + pulse * 0.22) * (1 + boom * 0.9);
  const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
  gr.addColorStop(0, "rgba(255,255,255," + (0.75 + boom * 0.25).toFixed(3) + ")");
  gr.addColorStop(0.35, "rgba(255," + (180 + boom * 75).toFixed(0) + ",120,0.55)");
  gr.addColorStop(1, "rgba(120,60,200,0)");
  ctx.fillStyle = gr;
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
  // 夸张滑稽的形体：一圈不停地重组的多边形
  ctx.lineWidth = 2;
  for (let ring = 0; ring < 3; ring++) {
    const n = 7 + ring * 3;
    const rr = R * (0.30 + ring * 0.22) * (1 + Math.sin(t * (2 + ring)) * 0.12);
    ctx.strokeStyle = "hsla(" + ((t * 60 + ring * 120) % 360) + ",100%,72%," + (0.7 - ring * 0.18) + ")";
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2 + t * (ring % 2 ? -0.6 : 0.8);
      const jitter = 1 + Math.sin(t * 4 + i * 2.1 + ring) * 0.18;
      const xx = cx + Math.cos(a) * rr * jitter, yy = cy + Math.sin(a) * rr * jitter;
      if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
    }
    ctx.stroke();
  }

  // ---- 高维物体：切进又消失，接触处把数据进一步撕裂 ----
  const NH = 5;
  for (let i = 0; i < NH; i++) {
    const life = hash3(i, 3, Math.floor(t / 2.6) + i);
    const ph = (t / 2.6 + life) % 1;
    if (ph > 0.55) continue;                      // 已经切出去了
    const fade = Math.sin((ph / 0.55) * Math.PI);
    const ang = hash3(i, 11, Math.floor(t / 2.6)) * Math.PI * 2;
    const dist = (4 + hash3(i, 13, Math.floor(t / 2.6)) * 12) * TILE_;
    const wx = (g.map && g.map.core ? g.map.core.x + 0.5 : 0) * TILE_ + Math.cos(ang) * dist;
    const wy = (g.map && g.map.core ? g.map.core.y + 0.5 : 0) * TILE_ + Math.sin(ang) * dist;
    const hx = sxOf(wx), hy = syOf(wy);
    // 一个旋转的超立方体投影（四维物体切进三维的样子）
    const sz = TILE_ * (1.1 + life * 1.5);
    const rot = t * (0.7 + life) + i;
    ctx.globalAlpha = Math.min(1, fade * 0.9);
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = "hsla(" + ((hash3(i, 17, Math.floor(t / 2.6)) * 360) | 0) + ",100%,80%,0.9)";
    for (let k = 0; k < 2; k++) {
      const s = sz * (k ? 0.62 : 1);
      ctx.beginPath();
      for (let j = 0; j <= 4; j++) {
        const a = rot + (j / 4) * Math.PI * 2;
        const xx = hx + Math.cos(a) * s, yy = hy + Math.sin(a) * s * (0.55 + Math.sin(rot * 1.3) * 0.35);
        if (j === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
      }
      ctx.stroke();
    }
    // 两个"立方体"之间的连线 = 第四个维度的边
    ctx.beginPath();
    for (let j = 0; j < 4; j++) {
      const a = rot + (j / 4) * Math.PI * 2;
      ctx.moveTo(hx + Math.cos(a) * sz, hy + Math.sin(a) * sz * (0.55 + Math.sin(rot * 1.3) * 0.35));
      ctx.lineTo(hx + Math.cos(a) * sz * 0.62, hy + Math.sin(a) * sz * 0.62 * (0.55 + Math.sin(rot * 1.3) * 0.35));
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // ---- 噪声：紊乱的声波 / 近乎啸鸣 ----
  ctx.globalAlpha = 0.10;
  for (let i = 0; i < 26; i++) {
    const yy = ((hash3(i, 23, Math.floor(t * 24)) * ch) | 0);
    const hh = 1 + ((hash3(i, 29, Math.floor(t * 24)) * 4) | 0);
    ctx.fillStyle = i % 2 ? "#ffffff" : "#ff66cc";
    ctx.fillRect(0, yy, cw, hh);
  }
  ctx.globalAlpha = 1;
  // 时不时的整屏撕裂
  const tear = hash3(0, 37, Math.floor(t * 3));
  if (tear > 0.85) {
    const yy = hash3(1, 37, Math.floor(t * 3)) * ch;
    ctx.fillStyle = "rgba(255,255,255,0.30)";
    ctx.fillRect(0, yy, cw, 3 + hash3(2, 37, Math.floor(t * 3)) * 10);
  }

  // ---- 待得越久，身上消失的区域越多 ----
  //   档案：进入此地的实体，其身体结构会变成闪烁的色块，逐步融入环境。
  //   所以"消失"不是挖个黑洞，而是那一块身体正在变成色块。
  const pGone = Math.min(1, (g.shTime || 0) / 40);
  if (pGone > 0.02 && g.player) {
    const psx = sxOf(g.player.x), psy = syOf(g.player.y);
    // 和 drawPlayer 对齐：头顶在 p.y-17，脚在 p.y+12，宽 20
    const bx = psx - 10 * sc, by = psy - 17 * sc;
    const bw = 20 * sc, bh = 29 * sc;
    const COLS = 3, ROWS = 4, N = COLS * ROWS;
    // 固定的消失顺序 —— 一块一块地没了，不是整片随机闪
    const order = [8, 1, 5, 11, 2, 0, 6, 9, 3, 10, 4, 7];
    const nGone = Math.round(pGone * N);
    const cw2 = bw / COLS, ch2 = bh / ROWS;
    const slot = Math.floor(t * 9);
    for (let i = 0; i < nGone && i < N; i++) {
      const ci = order[i];
      const rx = bx + (ci % COLS) * cw2, ry = by + Math.floor(ci / COLS) * ch2;
      ctx.globalAlpha = 0.55 + 0.45 * Math.abs(Math.sin(t * 7 + ci * 1.7));
      ctx.fillStyle = "hsl(" + ((hash3(ci, 41, slot) * 360) | 0) + ",95%,"
        + (45 + ((hash3(ci, 43, slot) * 25) | 0)) + "%)";
      ctx.fillRect(rx, ry, cw2 + 0.6, ch2 + 0.6);
      // 边缘的噪点：正在消散，正在融入环境
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = "rgba(255,255,255,0.38)";
      for (let s = 0; s < 3; s++) {
        ctx.fillRect(rx + hash3(ci, 47, slot * 3 + s) * cw2,
          ry + hash3(ci, 53, slot * 3 + s) * ch2, 2, 2);
      }
      ctx.globalAlpha = 1;
    }
  }
  ctx.restore();
};

// ===========================================================
// 每帧：无序的数据侵蚀人的结构
// ===========================================================
window.updateShattered = function (g, dt, api) {
  if (!g || !g.map) return;
  const A = api || {};
  const TILE_ = (typeof TILE === "number") ? TILE : 40;
  // ---- 不可计量：地图跟着你滚，走过的地方不再存在 ----
  try { shatteredScroll(g); } catch (e) { /* 忽略 */ }
  // 待得越久，身上消失的区域越多（画在 overlay 里）
  g.shTime = (g.shTime || 0) + dt;
  // 混乱核心：靠得越近，被侵蚀得越快
  const core = g.map.core;
  let near = 0;
  if (core) {
    const d = Math.hypot((core.x + 0.5) * TILE_ - g.player.x, (core.y + 0.5) * TILE_ - g.player.y) / TILE_;
    near = Math.max(0, 1 - d / (core.r + 6));
  }
  // 整个地方都在侵蚀你 —— 核心边上更是直接摧毁
  const rate = 1.6 + near * 14;
  g.hp = Math.max(0, (g.hp || 0) - rate * dt);
  g.sanity = Math.max(0, (g.sanity || 0) - (1.2 + near * 5) * dt);
  g.shHurt = (g.shHurt || 0) + dt;
  if (g.shHurt > 3.2) {
    g.shHurt = 0;
    if (A.toast) {
      A.toast(near > 0.4
        ? "无序的数据正在侵蚀你的结构 —— 离开那个核心，立刻"
        : "你身上有些地方正在变成闪烁的色块，然后消散");
    }
  }
  if (g.hp <= 0 && A.showDead) {
    g.deathCause = "你被无序的数据彻底侵蚀了 —— 而你也早已变成其的一部分";
    A.showDead();
  }
};
