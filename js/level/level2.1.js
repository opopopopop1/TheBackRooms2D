// ===========================================================
// Level 2.1 —— 锁闭
//   档案：这是一个由廊道组成的层级。
//   入口：在 Level 1 M.E.G. 基地周围的一个隐蔽区域。
//   出口：此层级没有任何已知的出口，你只可以通过跃迁浆果离开。
// 所以这一层**没有出口物件** —— 进去就是锁死的，唯一的活路是浆果：
// 在 Level 1 那处隐蔽区域里摘一丛浆果，先在 Level 1 吃一颗记住层级，
// 再进 2.1 吃第二颗就能回去。入口区域里放浆果灌木正是为了这个闭环。
//
// 外观：一条条狭窄的廊道，墙是灰白的混凝土砌块，地面是旧瓷砖。
// 几乎没有灯 —— 只有零星几盏还亮着的应急灯，照出一小圈惨白。
// ===========================================================
"use strict";

function generateLockdownMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const props = [];

  // ---- 一条条横竖交叉的廊道：窄（1 格是"挤"，2 格是"宽"），间距不规则 ----
  const lanesH = [], lanesV = [];
  const N = 7;
  for (let i = 0; i < N; i++) {
    lanesH.push({ at: Math.floor(size * (0.09 + 0.125 * i)) + randInt(0, 2), w: randInt(1, 2) });
    lanesV.push({ at: Math.floor(size * (0.09 + 0.125 * i)) + randInt(0, 2), w: randInt(1, 2) });
  }
  const carve = (L, horiz) => {
    const half = Math.floor(L.w / 2);
    for (let p = 2; p < size - 2; p++) {
      for (let k = -half; k <= half; k++) {
        const a = L.at + k;
        if (a < 2 || a >= size - 2) continue;
        if (horiz) grid[a][p] = 0; else grid[p][a] = 0;
      }
    }
  };
  for (const L of lanesH) carve(L, true);
  for (const L of lanesV) carve(L, false);

  // 廊道之间补几段斜着的小道 —— 免得被切成互不连通的块
  for (let i = 0; i < N - 1; i++) {
    const x0 = lanesH[i].at + 2, y0 = lanesV[i].at + 2;
    const x1 = lanesH[i + 1].at + 2, y1 = lanesV[i + 1].at + 2;
    carveCorridor(grid, size, x0, y0, x1, y1);
  }

  // 连通兜底：把每一块走不到的地板炸开一条道接回主区
  const reachable = floodFrom(grid, size, size >> 1, size >> 1);
  let floors0 = collectFloors(grid, size);
  for (const t of floors0) {
    if (reachable.has(t.x + "," + t.y)) continue;
    let best = null, bd = 1e9;
    for (const k of reachable) {
      const c = k.indexOf(",");
      const x = +k.slice(0, c), y = +k.slice(c + 1);
      const d = Math.abs(x - t.x) + Math.abs(y - t.y);
      if (d < bd) { bd = d; best = { x, y }; }
    }
    if (best) carveCorridor(grid, size, t.x, t.y, best.x, best.y);
  }

  const floors = collectFloors(grid, size);
  const start = { x: size >> 1, y: size >> 1, floor: 0 };
  if (grid[start.y][start.x] !== 0) {
    let best = null, bd = 1e9;
    for (const t of floors) {
      const d = Math.abs(t.x - start.x) + Math.abs(t.y - start.y);
      if (d < bd) { bd = d; best = t; }
    }
    if (best) { start.x = best.x; start.y = best.y; }
  }

  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return;
    props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  };

  // 零星几盏还亮着的应急灯 —— 大部分都灭了，只照出一小圈惨白
  const isFloor = (x, y) => x >= 0 && y >= 0 && x < size && y < size && grid[y][x] === 0;
  let lamps = 0;
  for (const t of floors) {
    if (lamps >= 16) break;
    if (Math.random() > 0.02) continue;
    // 贴着墙装：灯是装在墙上的，不是杵在路中间
    let onWall = false;
    for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      if (!isFloor(t.x + d[0], t.y + d[1])) { onWall = true; break; }
    }
    if (!onWall) continue;
    put(t.x, t.y, "locklamp");
    lamps++;
  }
  // 兜底：万一上面一盏都没撒上，至少给两盏，不然整层全黑
  if (lamps < 2) {
    for (const t of floors.slice(0, 60)) {
      if (lamps >= 2) break;
      put(t.x, t.y, "locklamp"); lamps++;
    }
  }
  // 廊道里散着的旧箱子（档案没写物资，但空成这样会显得没做完 —— 少量点缀）
  for (let i = 0; i < 6; i++) {
    const t = floors[randInt(0, floors.length - 1)];
    if (t && Math.hypot(t.x - start.x, t.y - start.y) > 6) put(t.x, t.y, "lockcrate");
  }

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [],
    start,
    exit: null,            // 锁闭 —— 没有任何出口
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [],
  };
  map.spawnPts = [start];
  return map;
}

// 从某点洪泛，拿到走得到的格子集合
function floodFrom(grid, size, sx, sy) {
  const seen = new Set();
  if (!grid[sy] || grid[sy][sx] !== 0) {
    outer:
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      if (grid[y][x] === 0) { sx = x; sy = y; break outer; }
    }
  }
  const q = [[sx, sy]];
  seen.add(sx + "," + sy);
  while (q.length) {
    const [x, y] = q.pop();
    for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + d[0], ny = y + d[1];
      if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue;
      if (grid[ny][nx] !== 0) continue;
      const k = nx + "," + ny;
      if (seen.has(k)) continue;
      seen.add(k); q.push([nx, ny]);
    }
  }
  return seen;
}

// ===========================================================
// Level 1 —— 基地周围那处隐蔽区域（Level 2.1 的入口）
// 档案：「在 Level 1 M.E.G. 基地周围的一个隐蔽区域。」
// 做法：基地外墙旁边一间围死的小屋，只留一个一格宽的口子通进去 ——
// 藏得深，撞见不容易。屋里长着两丛野生浆果（这一层本来不长浆果），
// 最里侧那面墙上有一道窄缝，凑上去就被吸进 Level 2.1。
// ===========================================================
window.buildHiddenNook21 = function (map, size, base) {
  if (!map || !map.layers) return null;
  const f = (map.megFloor != null) ? (map.megFloor | 0) : 0;
  const grid = map.layers[f];
  if (!grid || !base) return null;

  const W = 5, H = 5;
  const okSpot = (x, y) => {
    if (x < 3 || y < 3 || x + W >= size - 3 || y + H >= size - 3) return false;
    // 不许压进基地里，也不许贴着基地的墙（那几格已经是墙了）
    for (let yy = y - 1; yy <= y + H; yy++) {
      for (let xx = x - 1; xx <= x + W; xx++) {
        const k = xx + "," + yy;
        if (base.inside.has(k) || base.wall.has(k)) return false;
      }
    }
    return true;
  };
  // 基地四周各试一遍：贴着它，但离得不算太远 —— "基地周围"
  const cx0 = Math.round(base.x + base.w / 2), cy0 = Math.round(base.y + base.h / 2);
  const cands = [
    { x: base.x - W - 3, y: cy0 - (H >> 1) },      // 西
    { x: base.x + base.w + 3, y: cy0 - (H >> 1) },  // 东
    { x: cx0 - (W >> 1), y: base.y - H - 3 },       // 北
    { x: cx0 - (W >> 1), y: base.y + base.h + 3 },  // 南
  ];
  let spot = null;
  for (const c of cands) {
    // 位置不合适就顺着这条边往外挪几格再试
    for (let step = 0; step <= 12 && !spot; step++) {
      for (const s of [1, -1]) {
        const x = c.x, y = c.y + s * step * 2;
        if (okSpot(x, y)) { spot = { x, y }; break; }
        const x2 = c.x + s * step * 2, y2 = c.y;
        if (okSpot(x2, y2)) { spot = { x: x2, y: y2 }; break; }
      }
    }
    if (spot) break;
  }
  if (!spot) return null;

  const { x, y } = spot;
  // 围一圈墙，里面掏空
  for (let yy = y - 1; yy <= y + H; yy++)
    for (let xx = x - 1; xx <= x + W; xx++) {
      if (yy < 0 || xx < 0 || yy >= size || xx >= size) continue;
      grid[yy][xx] = 1;
    }
  for (let yy = y; yy < y + H; yy++)
    for (let xx = x; xx < x + W; xx++) grid[yy][xx] = 0;

  // 只开一个一格宽的口子 —— 隐蔽就隐蔽在这儿
  const midX = x + (W >> 1);
  const mouth = { x: midX, y: y + H };            // 开在南墙正中
  grid[mouth.y][mouth.x] = 0;
  // 从口子接一条道到最近的已有地板（保证走得到）
  const others = (map.floors && map.floors[f]) ? map.floors[f] : collectFloors(grid, size);
  let near = null, nd = 1e9;
  for (const t of others) {
    if (t.x >= x - 1 && t.x <= x + W && t.y >= y - 1 && t.y <= y + H) continue;
    const d = Math.abs(t.x - mouth.x) + Math.abs(t.y - mouth.y);
    if (d < nd) { nd = d; near = t; }
  }
  if (near) carveCorridor(grid, size, mouth.x, mouth.y + 1, near.x, near.y);

  const cells = [];
  for (let yy = y; yy < y + H; yy++)
    for (let xx = x; xx < x + W; xx++) {
      cells.push({ x: xx, y: yy });
      if (map.floors && map.floors[f]) map.floors[f].push({ x: xx, y: yy });
    }

  // 屋里长着两丛野生浆果 —— 这一层本来不长，是"隐蔽区域"特有的。
  // 位置要离那道缝远一点：缝的提示会抢走 E 键，两丛贴着缝就摘不到了，
  // 而浆果是这一层唯一的退路（2.1 没有出口）。按"离缝最远"排，先摘再走。
  const slit0 = { x: midX, y: y - 1 };
  const far = cells.slice().sort((a, c) =>
    Math.hypot(c.x - slit0.x, c.y - slit0.y) - Math.hypot(a.x - slit0.x, a.y - slit0.y));
  const bushes = [];
  for (const c of far) {
    if (bushes.length >= 2) break;
    if (Math.hypot(c.x - mouth.x, c.y - mouth.y) < 1.5) continue;   // 别堵在门口
    if (bushes.some((b) => Math.hypot(b.x - c.x, b.y - c.y) < 2)) continue;
    map.props.push({ x: c.x, y: c.y, floor: f, type: "berrybush" });
    bushes.push(c);
  }

  // 最里侧那面墙上的窄缝 —— 凑上去就被吸进 Level 2.1
  const slit = { x: midX, y: y - 1 };
  const nook = { x, y, w: W, h: H, floor: f, mouth, slit, cells };
  map.hiddenNook21 = nook;
  (map.exits = map.exits || []).push({
    kind: "nook21", x: slit.x, y: slit.y, floor: f, toLevel: "2.1",
  });
  return nook;
};

// ---------- 专属模型 ----------
window.PROP_DRAW = window.PROP_DRAW || {};

// 墙上的应急灯：还亮着的那种，照出一小圈惨白（Level 2.1）
window.PROP_DRAW["locklamp"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : 0) / 1000;
  const flick = 0.72 + 0.28 * Math.abs(Math.sin(t * 2.3 + p.x * 1.7 + p.y * 0.9));
  // 灯洒在地上的那一圈光
  const g = ctx.createRadialGradient(0, T * 0.18, 1, 0, T * 0.18, T * 1.5);
  g.addColorStop(0, "rgba(226,232,222," + (0.30 * flick).toFixed(3) + ")");
  g.addColorStop(1, "rgba(226,232,222,0)");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(0, T * 0.18, T * 1.5, T * 1.1, 0, 0, Math.PI * 2); ctx.fill();
  // 灯罩：一条横着的旧灯管
  ctx.fillStyle = "#4c5257";
  ctx.fillRect(-T * 0.26, -T * 0.30, T * 0.52, T * 0.14);
  ctx.fillStyle = "rgba(232,238,228," + (0.85 * flick).toFixed(3) + ")";
  ctx.fillRect(-T * 0.22, -T * 0.28, T * 0.44, T * 0.08);
  ctx.strokeStyle = "#2b3033"; ctx.lineWidth = 1;
  ctx.strokeRect(-T * 0.26, -T * 0.30, T * 0.52, T * 0.14);
};

// 廊道里散着的旧木箱（Level 2.1）
window.PROP_DRAW["lockcrate"] = function (ctx, p, T) {
  const w = T * 0.70, h = T * 0.62;
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.26, w * 0.52, T * 0.09, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#6b543a"; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "rgba(255,255,255,0.08)"; ctx.fillRect(-w / 2, -h / 2, w, h * 0.26);
  ctx.strokeStyle = "#4a3927"; ctx.lineWidth = Math.max(1, T * 0.035);
  ctx.strokeRect(-w / 2, -h / 2, w, h);
  ctx.beginPath();
  ctx.moveTo(-w / 2, -h / 2); ctx.lineTo(w / 2, h / 2);
  ctx.moveTo(w / 2, -h / 2); ctx.lineTo(-w / 2, h / 2);
  ctx.stroke();
};

// ---------- Level 2.1 的墙与地面 ----------
// 必须显式挂上：不挂的话会掉进兜底，画出来是 Level 2 那套锈蚀管道墙
// （玩家之前就抱怨过 1.1 / 1.2 的墙是"2 的"）。
function drawLockdownWall(ctx, px, py, h, tx, ty) {
  // 灰白的混凝土砌块：一块块错缝砌起来，缝里有旧灰浆
  ctx.fillStyle = "#8d8f88";
  ctx.fillRect(px, py - h, TILE, TILE + h);
  const rows = 4;
  for (let r = 0; r < rows; r++) {
    const yy = py - h + (h / rows) * r;
    const off = (r % 2) ? TILE * 0.5 : 0;
    ctx.strokeStyle = "rgba(0,0,0,0.16)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(px, yy); ctx.lineTo(px + TILE, yy); ctx.stroke();
    for (const bx of [off, off + TILE * 0.5]) {
      if (bx <= 0 || bx >= TILE) continue;
      ctx.beginPath(); ctx.moveTo(px + bx, yy); ctx.lineTo(px + bx, yy + h / rows); ctx.stroke();
    }
  }
  // 顶面
  ctx.fillStyle = "#9ea19a";
  ctx.fillRect(px, py - h, TILE, h * 0.34);
  ctx.fillStyle = "rgba(0,0,0,0.20)";
  ctx.fillRect(px, py - h * 0.20, TILE, h * 0.20);
  // 墙根一道脏印 + 偶尔一道裂缝
  ctx.fillStyle = "rgba(60,58,52,0.22)";
  ctx.fillRect(px, py + TILE * 0.62, TILE, TILE * 0.38);
  if ((tx * 7 + ty * 13) % 5 === 0) {
    ctx.strokeStyle = "rgba(40,40,36,0.34)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(px + TILE * 0.32, py - h * 0.5);
    ctx.lineTo(px + TILE * 0.44, py - h * 0.1);
    ctx.lineTo(px + TILE * 0.36, py + TILE * 0.3);
    ctx.stroke();
  }
}

function drawLockdownFloor(ctx, px, py, h, tx, ty) {
  // 旧瓷砖：灰白的方砖，缝发黑，有的裂了、有的缺角
  ctx.fillStyle = "#7f8378";
  ctx.fillRect(px, py, TILE, TILE);
  ctx.fillStyle = "#8a8e83";
  ctx.fillRect(px + 1, py + 1, TILE - 2, TILE - 2);
  ctx.strokeStyle = "rgba(48,50,44,0.30)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(px + TILE * 0.5, py); ctx.lineTo(px + TILE * 0.5, py + TILE);
  ctx.moveTo(px, py + TILE * 0.5); ctx.lineTo(px + TILE, py + TILE * 0.5);
  ctx.stroke();
  const n = (tx * 11 + ty * 5) % 9;
  if (n === 0) {  // 裂了的一块
    ctx.strokeStyle = "rgba(45,46,40,0.45)"; ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(px + TILE * 0.16, py + TILE * 0.20);
    ctx.lineTo(px + TILE * 0.52, py + TILE * 0.46);
    ctx.lineTo(px + TILE * 0.86, py + TILE * 0.34);
    ctx.stroke();
  } else if (n === 3) {  // 缺了一角，露出下面的水泥
    ctx.fillStyle = "#5f625a";
    ctx.beginPath();
    ctx.moveTo(px + TILE, py + TILE * 0.62);
    ctx.lineTo(px + TILE, py + TILE);
    ctx.lineTo(px + TILE * 0.60, py + TILE);
    ctx.closePath(); ctx.fill();
  }
  // 一点潮气的暗斑
  if (n === 6) {
    ctx.fillStyle = "rgba(52,58,50,0.18)";
    ctx.beginPath(); ctx.ellipse(px + TILE * 0.36, py + TILE * 0.66, TILE * 0.22, TILE * 0.13, 0, 0, Math.PI * 2); ctx.fill();
  }
}

// ---------- 隐蔽区域墙上那道窄缝（Level 1 → 2.1） ----------
// 它不通向任何"门"，只是墙上一道被撬开的缝，缝里透着 Level 2.1 那种惨白的光。
function drawNook21Slit(ctx, map, t) {
  const nk = map.hiddenNook21;
  if (!nk) return;
  const px = nk.slit.x * TILE, py = nk.slit.y * TILE;
  const pulse = 0.55 + 0.45 * Math.abs(Math.sin(t * 1.6));
  // 缝：一道竖着的裂口，边缘是被撬开的碴
  ctx.fillStyle = "#3a3c36";
  ctx.fillRect(px + TILE * 0.30, py - TILE * 0.10, TILE * 0.40, TILE * 1.20);
  const g = ctx.createLinearGradient(px, py, px, py + TILE);
  g.addColorStop(0, "rgba(226,232,222," + (0.30 * pulse).toFixed(3) + ")");
  g.addColorStop(1, "rgba(226,232,222,0.06)");
  ctx.fillStyle = g;
  ctx.fillRect(px + TILE * 0.34, py - TILE * 0.06, TILE * 0.32, TILE * 1.12);
  // 缝里的那点惨白
  ctx.fillStyle = "rgba(232,238,228," + (0.55 * pulse).toFixed(3) + ")";
  ctx.fillRect(px + TILE * 0.42, py + TILE * 0.10, TILE * 0.16, TILE * 0.82);
  // 洒在缝口外的一圈光
  const rg = ctx.createRadialGradient(px + TILE * 0.5, py + TILE * 0.9, 1, px + TILE * 0.5, py + TILE * 0.9, TILE * 1.4);
  rg.addColorStop(0, "rgba(226,232,222," + (0.22 * pulse).toFixed(3) + ")");
  rg.addColorStop(1, "rgba(226,232,222,0)");
  ctx.fillStyle = rg;
  ctx.beginPath(); ctx.ellipse(px + TILE * 0.5, py + TILE * 0.9, TILE * 1.4, TILE * 0.9, 0, 0, Math.PI * 2); ctx.fill();
}
