// ===========================================================
// Level 0.7 —— 忆域
// Level 0 的子层级，保存了可追溯至古埃及时期的 Level 0 实例。
//
// 六个年代各占**一个区域**（区域 1 ~ 区域 6），每个区域都是 78×78 —— 和 Level 0 一样大。
// 忆域没有上下层，六个区域是首尾相接的：区域 1 最现代（和 Level 0 几乎无异），
// 一路往前越走越古老，区域 6 是古埃及。
//
//   区域 1  1950 - 至今    荧光灯 + 黄墙纸 + 潮湿地毯（与 Level 0 同色）
//   区域 2  1800 - 1950    维多利亚：灯泡与蜡烛，华丽的**带花纹的黄墙纸**
//   区域 3  1400 - 1800    火把与挂毯，天花板高得望不到头
//   区域 4  500  - 1400    黑暗时代：又黑又冷的城堡走廊
//   区域 5  前500 - 500    罗马：绵延的大理石走廊与数百米高的石柱（开阔）
//   区域 6  前4000 - 前500 埃及式：蜿蜒漫长的石厅，墙上刻满无法破译的雕刻
//
// 区域之间怎么走：每个区域都有自己的尽头，尽头处压着一团黄雾 ——
// 走进去就到下一个区域；从对面那团雾走回来，就回到上一个区域。双向的。
// 入口：Level 0 里一面颜色深得不对劲的黄墙
// 出口：区域 1（最现代那个）里的那扇门，回 Level 0
// ===========================================================
"use strict";

// 每个年代的配色：[地面主色, 地面次色, 墙色]
// 区域 1 刻意用 Level 0 的原色：地毯 #97853f、墙纸 #d9c95e。
// 区域 2 也是黄墙纸（只是压了花纹）—— 除了这两个，其余年代的墙都不是黄墙纸。
const ERA_TILE = {
  0: ["#97853f", "#8d7b39", "#d9c95e"],   // 1950-：和 Level 0 一模一样
  1: ["#8a6a4a", "#7a5c40", "#d9c95e"],   // 维多利亚：木地板 + 带花纹的黄墙纸
  2: ["#7a7060", "#6e6456", "#6a604e"],   // 中世纪：石板地
  3: ["#5a5448", "#4e483e", "#4a4438"],   // 黑暗时代：阴冷的石
  4: ["#e0dcc8", "#d4d0bc", "#cfc8b0"],   // 罗马：大理石（亮）
  5: ["#c8a468", "#b8905a", "#b8905a"],   // 埃及：砂岩
};
const ERA_NAME = ["1950 - 至今", "1800 - 1950", "1400 - 1800", "500 - 1400", "前500 - 500", "前4000 - 前500"];
// 每个年代区段都和 Level 0 一样大
const MEM_SIZE = 78;

// ---------- 各年代的布局 ----------
// 每层都是 78×78，但刻意不是一个模子的迷宫。

// 区域 1：与 Level 0 几乎无异 —— 直接用 Level 0 那套房间迷宫
function buildEraModern(size) {
  const layer = buildRoomLayer(size, {});
  return layer;
}

// 区域 2：维多利亚 —— 一条长长的中央走廊，两侧成排的房间
function buildEraVictorian(grid, size) {
  const cy = Math.floor(size / 2);
  carveRoom(grid, size, 4, cy, size - 8, 2);            // 中央横走廊
  carveRoom(grid, size, 4, cy - 9, 2, 18);              // 左侧竖廊
  carveRoom(grid, size, size - 7, cy - 9, 2, 18);       // 右侧竖廊
  const cols = 6;
  const cw = Math.floor((size - 14) / cols);
  for (let k = 0; k < cols; k++) {
    const rx = 6 + k * cw;
    const rw = Math.max(3, cw - 2);
    for (const sy of [cy - 8, cy + 3]) {
      carveRoom(grid, size, rx, sy, rw, 5);
      const dx = rx + Math.floor(rw / 2);
      if (sy < cy) {                                     // 上排：往下开门通走廊
        for (let yy = sy + 5; yy < cy; yy++) { grid[yy][dx] = 0; grid[yy][dx + 1] = 0; }
      } else {                                           // 下排：往上开门通走廊
        for (let yy = cy + 2; yy < sy; yy++) { grid[yy][dx] = 0; grid[yy][dx + 1] = 0; }
      }
    }
  }
  // 上下两排之间再拉几条竖的连通（免得整层只剩中央走廊一条路）
  for (let k = 0; k < 3; k++) {
    const x = 10 + k * Math.floor((size - 20) / 2);
    for (let yy = cy - 8; yy < cy + 8; yy++) grid[yy][x] = 0;
  }
}

// 区域 3：1400-1800 —— 一条又高又长的厅（火把照明），两侧挂着挂毯
function buildEraMedieval(grid, size) {
  carveRoom(grid, size, 4, 4, size - 8, size - 8);
  // 散布的石垛：把大厅切成一片片，又不至于封死
  for (let k = 0; k < 34; k++) {
    const bx = randInt(7, size - 10), by = randInt(7, size - 10);
    const bw = randInt(2, 4), bh = randInt(2, 4);
    for (let y = by; y < by + bh; y++)
      for (let x = bx; x < bx + bw; x++)
        if (x > 3 && y > 3 && x < size - 4 && y < size - 4) grid[y][x] = 1;
  }
}

// 区域 4：500-1400 —— 又窄又弯的城堡走廊（两格宽，来回折返）
function buildEraDark(grid, size) {
  let y = 5;
  const segs = 6;
  const stepY = Math.max(3, Math.floor((size - 14) / segs));
  for (let s = 0; s < segs; s++) {
    const from = s % 2 === 0 ? 5 : size - 8;
    const to = s % 2 === 0 ? size - 8 : 5;
    const st = from < to ? 1 : -1;
    for (let x = from; x !== to; x += st) { grid[y][x] = 0; grid[y + 1][x] = 0; }
    if (s < segs - 1) {
      const ny = Math.min(y + stepY, size - 8);
      for (let yy = y; yy <= ny; yy++) { grid[yy][to] = 0; grid[yy][to + 1] = 0; }
      y = ny;
    }
  }
  // 几处小侧室（黑暗里能躲一躲）
  for (let k = 0; k < 5; k++) {
    const bx = randInt(8, size - 12), by = randInt(7, size - 10);
    carveRoom(grid, size, bx, by, 3, 3);
  }
}

// 区域 5：前500-500 —— 罗马：极为庞大的大理石厅，开阔，不是迷宫
function buildEraRoman(grid, size) {
  carveRoom(grid, size, 4, 4, size - 8, size - 8);
  // 两道把大厅分成三进的隔墙，各留三个门洞
  for (const wx of [Math.floor(size / 3), Math.floor(size * 2 / 3)]) {
    for (let y = 5; y < size - 5; y++) grid[y][wx] = 1;
    for (let k = 0; k < 3; k++) {
      const gy = 8 + k * Math.floor((size - 16) / 2);
      for (let d = 0; d < 3; d++) grid[gy + d][wx] = 0;
    }
  }
}

// 区域 6：前4000-前500 —— 埃及：蜿蜒漫长的石厅（三格宽的蛇形）
function buildEraEgypt(grid, size) {
  let y = 5;
  const segs = 5;
  const stepY = Math.max(4, Math.floor((size - 14) / segs));
  for (let s = 0; s < segs; s++) {
    const from = s % 2 === 0 ? 5 : size - 8;
    const to = s % 2 === 0 ? size - 8 : 5;
    const st = from < to ? 1 : -1;
    for (let x = from; x !== to; x += st) { grid[y][x] = 0; grid[y + 1][x] = 0; grid[y + 2][x] = 0; }
    if (s < segs - 1) {
      const ny = Math.min(y + stepY, size - 10);
      for (let yy = y; yy <= ny; yy++) { grid[yy][to] = 0; grid[yy][to + 1] = 0; grid[yy][to + 2] = 0; }
      y = ny;
    }
  }
  // 侧面的壁龛
  for (let k = 0; k < 6; k++) {
    const bx = randInt(8, size - 12), by = randInt(7, size - 10);
    carveRoom(grid, size, bx, by, 3, 2);
  }
}

function generateMemoryDomainMap(level) {
  const N = 6;
  const size = MEM_SIZE;
  const layers = [], floorsArr = [], roomsArr = [];
  const props = [];

  // ---- 六层：每层一个年代 ----
  let modern = null;
  for (let i = 0; i < N; i++) {
    let grid;
    if (i === 0) {
      const layer = buildEraModern(size);
      grid = layer.grid;
      modern = layer;
      roomsArr.push(layer.rooms || []);
    } else {
      grid = makeGrid(size);
      roomsArr.push([]);
      if (i === 1) buildEraVictorian(grid, size);
      else if (i === 2) buildEraMedieval(grid, size);
      else if (i === 3) buildEraDark(grid, size);
      else if (i === 4) buildEraRoman(grid, size);
      else buildEraEgypt(grid, size);
    }
    layers.push(grid);
  }

  // ---- 连通兜底：每一层自身都得走得通 ----
  const start = { x: Math.floor(size / 2), y: Math.floor(size / 2), floor: 0 };
  for (let i = 0; i < N; i++) {
    const grid = layers[i];
    // 出生点那格必须是地板，否则兜底没处下脚
    layers[i][start.y][start.x] = 0;
    ensureAllConnected(grid, size, start);
  }

  // ---- 区域之间的通道：每个区域的尽头有一团黄雾，走进去就到下一个区域 ----
  // （以前是斜坡上下贯通 —— 那是 Level 1 上下层的做法，忆域没有上下层，
  //   它只是六个首尾相接的区域：走到区域尽头，没入那团黄雾，就到了下一个区域；
  //   从对面那团雾走回来，就回到上一个区域。）
  const F = 7;                                   // 黄雾块的边长
  const FOG_Y = 9;
  const zoneFog = [];
  // 从雾块往地图中心挖一条通道 —— 雾块若孤悬在外会被判成死区
  const carveLink = (grid, x, y) => {
    const cx = Math.floor(size / 2), cy = Math.floor(size / 2);
    const fx = x + Math.floor(F / 2), fy = y + Math.floor(F / 2);
    const stx = fx < cx ? 1 : -1;
    for (let xx = fx; xx !== cx; xx += stx) grid[fy][xx] = 0;
    const sty = fy < cy ? 1 : -1;
    for (let yy = fy; yy !== cy; yy += sty) grid[yy][cx] = 0;
  };
  for (let i = 0; i < N - 1; i++) {
    // 区域 i 的尽头（右侧）→ 区域 i+1 的入口（左侧）
    const ax = Math.min(size - F - 3, size - 13), ay = FOG_Y;
    const bx = 5, by = FOG_Y;
    for (const [gg, x, y] of [[layers[i], ax, ay], [layers[i + 1], bx, by]]) {
      carveRoom(gg, size, x, y, F, F);
      carveLink(gg, x, y);
    }
    zoneFog.push({
      aZone: i, bZone: i + 1,
      aRect: { x: ax, y: ay, w: F, h: F },
      bRect: { x: bx, y: by, w: F, h: F },
      aPos: { x: ax + F / 2, y: ay + F / 2 },
      bPos: { x: bx + F / 2, y: by + F / 2 },
    });
  }

  // 雾块挖完之后再统计地板，否则光源会漏掉这几块
  for (let i = 0; i < N; i++) floorsArr.push(collectFloors(layers[i], size));
  // 区域 1 的中央是 Level 0 那间起始房间，出生点本来就是地板
  if (layers[0][start.y][start.x] !== 0) {
    const f = floorsArr[0][0];
    if (f) { start.x = f.x; start.y = f.y; }
  }

  const put = (x, y, floor, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return;
    const g = layers[floor];
    if (!g || !g[y] || g[y][x] !== 0) return;
    props.push(Object.assign({ x, y, floor, type }, extra || {}));
  };
  // 从这一层**已知的地板**里随机挑 —— 不能像以前那样整层撒随机坐标：
  // 黑暗时代 / 埃及那两层是窄走廊，6084 格里只有几百格地板，
  // 随机 12 次绝大多数落在墙上，整层一个光源都刷不出来（实测只出 1 个）。
  const takenP = new Set();
  const pickFloorCell = (floor) => {
    const arr = floorsArr[floor] || [];
    if (!arr.length) return null;
    for (let t = 0; t < 40; t++) {
      const c = arr[randInt(0, arr.length - 1)];
      const k = floor + ":" + c.x + "," + c.y;
      if (takenP.has(k)) continue;
      takenP.add(k);
      return c;
    }
    return null;
  };
  // 墙上物件（火把 / 挂毯 / 灯笼 / 雕刻）：取一格地板，再贴在它旁边的墙上
  const putOnWall = (floor, type, n) => {
    let made = 0;
    for (let k = 0; k < n * 12 && made < n; k++) {
      const c = pickFloorCell(floor);
      if (!c) break;
      for (let d = 0; d < 4; d++) {
        const wx = c.x + (d === 0 ? 1 : d === 1 ? -1 : 0);
        const wy = c.y + (d === 2 ? 1 : d === 3 ? -1 : 0);
        if (wx < 1 || wy < 1 || wx >= size - 1 || wy >= size - 1) continue;
        if (layers[floor][wy][wx] !== 1) continue;
        props.push({ x: wx, y: wy, floor, type });
        made++;
        break;
      }
    }
  };
  const putOnFloor = (floor, type, n) => {
    for (let k = 0; k < n; k++) {
      const c = pickFloorCell(floor);
      if (!c) break;
      put(c.x, c.y, floor, type);
    }
  };

  // ---- 各年代的物件 ----
  // 区域 1：和 Level 0 一样，荧光灯
  putOnFloor(0, "fluor07", 26);
  // 区域 2：灯泡与蜡烛，越往里走越少，逐渐被蜡烛取代
  putOnFloor(1, "bulb07", 16);
  putOnFloor(1, "candle07", 14);
  // 区域 3：火把与挂毯（都在墙上）
  putOnWall(2, "torch07", 20);
  putOnWall(2, "tapestry07", 12);
  // 区域 4：黑暗时代 —— 又黑又冷，灯笼是唯一的光
  putOnWall(3, "lantern07", 22);
  // 区域 5：罗马 —— 数百米高的大理石柱与雕像
  putOnFloor(4, "column07", 30);
  putOnFloor(4, "statue07", 10);
  // 区域 6：埃及 —— 墙上刻满无法破译的雕刻
  putOnWall(5, "glyph07", 26);

  // ---- 出口：在最现代那层（区域 1）离出生点最远处放一扇回 Level 0 的门 ----
  const exProps = [];
  const door = placeExitDoor(layers[0], size, start, exProps,
    { to: 0, label: "L0", tint: "#7a6a4a", side: "far",
      tip: "往回走的那扇门 —— 你就是从这儿进来的" });
  if (door) { door.floor = 0; props.push(door); }

  const map = {
    size, level, doubleStory: true,
    layers, floors: floorsArr, rooms: roomsArr,
    start, exit: null,
    doors: [], ramps: [], zoneFog, redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [],
    eraNames: ERA_NAME, eraCount: N,
    floors_: N,
  };
  makeDoorsMap(map);
  return map;
}

// ---------- 地面 / 墙体：按**当前区域**取那一年的配色 ----------
// 由 levelBatch.js 的 drawBatchFloor / drawBatchWall 委托过来
function memEraIndex(map) {
  const f = (typeof window !== "undefined" && typeof window.__gFloor === "number")
    ? window.__gFloor : ((map && map.start) ? map.start.floor : 0);
  return Math.max(0, Math.min(5, f | 0));
}

window.drawEraFloor = function (ctx, px, py, h, style, map, tx, ty) {
  if (style !== "memorydomain") return false;
  const S = (typeof TILE === "number" ? TILE : 40);
  const i = memEraIndex(map);
  const c = ERA_TILE[i] || ERA_TILE[0];
  const alt = ((tx * 7 + ty * 13) % 5) === 0;
  ctx.fillStyle = alt ? c[1] : c[0];
  ctx.fillRect(px, py, S, S);
  // 区域 1：和 Level 0 一模一样的潮湿地毯（斑点 + 一行行的压痕）
  if (i === 0) {
    ctx.fillStyle = "rgba(0,0,0,0.08)";
    ctx.fillRect(px + (h * 37) % 34, py + (h * 53) % 34, 3, 3);
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fillRect(px + (h * 71) % 30, py + (h * 13) % 30, 2, 2);
    if ((tx + ty) % 2 === 0) {
      ctx.fillStyle = "rgba(0,0,0,0.06)";
      ctx.fillRect(px, py + S - 3, S, 1);
    }
  }
  // 维多利亚：拼花的木地板（花纹）
  if (i === 1) {
    ctx.strokeStyle = "rgba(40,26,14,0.28)";
    ctx.lineWidth = 1;
    ctx.strokeRect(px + 0.5, py + 0.5, S - 1, S - 1);
    ctx.beginPath();
    ctx.moveTo(px, py + S / 2); ctx.lineTo(px + S, py + S / 2);
    ctx.stroke();
  }
  // 罗马：大理石的纹路
  if (i === 4) {
    ctx.strokeStyle = "rgba(120,110,90,0.22)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px + 2, py + S * 0.7);
    ctx.quadraticCurveTo(px + S * 0.4, py + S * 0.3, px + S - 2, py + S * 0.55);
    ctx.stroke();
  }
  // 埃及：石板缝
  if (i === 5) {
    ctx.strokeStyle = "rgba(90,64,30,0.30)";
    ctx.lineWidth = 1;
    ctx.strokeRect(px + 0.5, py + 0.5, S - 1, S - 1);
  }
  return true;
};

window.drawEraWall = function (ctx, px, py, h, style, map, tx, ty) {
  if (style !== "memorydomain") return false;
  const S = (typeof TILE === "number" ? TILE : 40);
  const i = memEraIndex(map);
  const c = ERA_TILE[i] || ERA_TILE[0];
  ctx.fillStyle = c[2];
  ctx.fillRect(px, py, S, S);
  // 区域 1：和 Level 0 一模一样的墙纸（接缝 + 顶部亮边 + 假高度阴影）
  if (i === 0) {
    ctx.fillStyle = "rgba(0,0,0,0.10)";
    ctx.fillRect(px + S - 2, py, 2, S);
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(px, py, S, 2);
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(px, py + S - 8, S, 8);
    if (h > 0.6) {
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.fillRect(px + 6 + (h * 20) % 24, py + 6 + (h * 31) % 24, 4, 4);
    }
    return true;
  }
  // 维多利亚：**黄墙纸**上压着华丽的花纹（底色和 Level 0 是同一张纸）
  if (i === 1) {
    ctx.fillStyle = "rgba(60,40,20,0.16)";
    ctx.fillRect(px, py, S, S);
    ctx.strokeStyle = "rgba(246,232,196,0.55)";
    ctx.lineWidth = 1;
    // 一朵四瓣的花，格子里重复两朵
    for (const oy of [S * 0.30, S * 0.72]) {
      const cx = px + S / 2, cy = py + oy;
      for (let k = 0; k < 4; k++) {
        const a = k * Math.PI / 2 + Math.PI / 4;
        ctx.beginPath();
        ctx.ellipse(cx + Math.cos(a) * S * 0.10, cy + Math.sin(a) * S * 0.10,
          S * 0.075, S * 0.045, a, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(cx, cy, S * 0.035, 0, Math.PI * 2); ctx.stroke();
    }
    // 墙纸的竖条纹
    ctx.strokeStyle = "rgba(90,64,34,0.30)";
    ctx.beginPath();
    ctx.moveTo(px + S * 0.18, py); ctx.lineTo(px + S * 0.18, py + S);
    ctx.moveTo(px + S * 0.82, py); ctx.lineTo(px + S * 0.82, py + S);
    ctx.stroke();
    // 顶部与底部的装饰边
    ctx.fillStyle = "rgba(90,64,34,0.45)";
    ctx.fillRect(px, py, S, Math.max(2, S * 0.10));
    ctx.fillRect(px, py + S - Math.max(2, S * 0.10), S, Math.max(2, S * 0.10));
    return true;
  }
  // 埃及：墙上无法破译的雕刻
  if (i === 5) {
    ctx.strokeStyle = "rgba(70,48,22,0.55)";
    ctx.lineWidth = 1.2;
    for (let k = 0; k < 3; k++) {
      const cy = py + S * (0.28 + k * 0.22);
      ctx.beginPath();
      ctx.moveTo(px + S * 0.16, cy);
      ctx.lineTo(px + S * 0.34, cy);
      ctx.moveTo(px + S * 0.34, cy - S * 0.06);
      ctx.lineTo(px + S * 0.34, cy + S * 0.06);
      ctx.moveTo(px + S * 0.52, cy);
      ctx.arc(px + S * 0.62, cy, S * 0.07, Math.PI * 0.2, Math.PI * 1.7);
      ctx.stroke();
    }
  }
  // 顶部压条 + 踢脚阴影（和地面拉开）
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.fillRect(px, py, S, Math.max(2, S * 0.14));
  ctx.fillStyle = "rgba(0,0,0,0.26)";
  ctx.fillRect(px, py + S - Math.max(2, S * 0.12), S, Math.max(2, S * 0.12));
  ctx.strokeStyle = "rgba(0,0,0,0.32)";
  ctx.lineWidth = 1;
  ctx.strokeRect(px + 0.5, py + 0.5, S - 1, S - 1);
  return true;
};

window.PROP_DRAW = window.PROP_DRAW || {};

// 荧光灯（1950 - 至今）：嗡嗡作响
window.PROP_DRAW["fluor07"] = function (ctx, p, T) {
  ctx.fillStyle = "#d8dcd4";
  ctx.fillRect(-T * 0.30, -T * 0.10, T * 0.60, T * 0.14);
  ctx.strokeStyle = "#8a8e88"; ctx.lineWidth = 1;
  ctx.strokeRect(-T * 0.30, -T * 0.10, T * 0.60, T * 0.14);
  const g = ctx.createRadialGradient(0, T * 0.04, 1, 0, T * 0.04, T * 0.70);
  g.addColorStop(0, "rgba(240,248,230,0.42)");
  g.addColorStop(1, "rgba(220,230,210,0)");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, T * 0.04, T * 0.70, 0, Math.PI * 2); ctx.fill();
};
// 白炽灯泡（1800 - 1950）：越往里走越少，逐渐被蜡烛取代
window.PROP_DRAW["bulb07"] = function (ctx, p, T) {
  ctx.strokeStyle = "#4a4034"; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(0, -T * 0.34); ctx.lineTo(0, -T * 0.20); ctx.stroke();
  ctx.fillStyle = "#ffe9b0";
  ctx.beginPath(); ctx.arc(0, -T * 0.14, T * 0.09, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#c8b078";
  ctx.fillRect(-T * 0.04, -T * 0.22, T * 0.08, T * 0.05);
  const g = ctx.createRadialGradient(0, -T * 0.14, 1, 0, -T * 0.14, T * 0.62);
  g.addColorStop(0, "rgba(255,224,150,0.40)");
  g.addColorStop(1, "rgba(255,210,130,0)");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, -T * 0.14, T * 0.62, 0, Math.PI * 2); ctx.fill();
};
// 蜡烛（火灾的源头）
window.PROP_DRAW["candle07"] = function (ctx, p, T) {
  ctx.fillStyle = "#e8e0cc";
  ctx.fillRect(-T * 0.045, -T * 0.14, T * 0.09, T * 0.26);
  ctx.fillStyle = "#ffcc55";
  ctx.beginPath(); ctx.ellipse(0, -T * 0.18, T * 0.045, T * 0.075, 0, 0, Math.PI * 2); ctx.fill();
  const g = ctx.createRadialGradient(0, -T * 0.18, 1, 0, -T * 0.18, T * 0.50);
  g.addColorStop(0, "rgba(255,190,90,0.45)");
  g.addColorStop(1, "rgba(255,170,70,0)");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, -T * 0.18, T * 0.50, 0, Math.PI * 2); ctx.fill();
};
// 火把（1400 - 1800）：固定在墙上，取不下来
window.PROP_DRAW["torch07"] = function (ctx, p, T) {
  ctx.fillStyle = "#5a4a34";
  ctx.fillRect(-T * 0.05, -T * 0.10, T * 0.10, T * 0.36);
  ctx.fillStyle = "#ff9a30";
  ctx.beginPath(); ctx.ellipse(0, -T * 0.16, T * 0.09, T * 0.14, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#ffe08a";
  ctx.beginPath(); ctx.ellipse(0, -T * 0.14, T * 0.045, T * 0.075, 0, 0, Math.PI * 2); ctx.fill();
  const g = ctx.createRadialGradient(0, -T * 0.16, 1, 0, -T * 0.16, T * 0.72);
  g.addColorStop(0, "rgba(255,150,50,0.42)");
  g.addColorStop(1, "rgba(255,120,40,0)");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, -T * 0.16, T * 0.72, 0, Math.PI * 2); ctx.fill();
};
// 挂毯：绣着各种实体在做与周围环境格格不入的事
window.PROP_DRAW["tapestry07"] = function (ctx, p, T) {
  ctx.fillStyle = "#7a3a30";
  ctx.fillRect(-T * 0.30, -T * 0.40, T * 0.60, T * 0.80);
  ctx.strokeStyle = "#c8a44a"; ctx.lineWidth = 1.3;
  ctx.strokeRect(-T * 0.30, -T * 0.40, T * 0.60, T * 0.80);
  // 绣着的图案：一个抽象的实体在弹琴
  ctx.fillStyle = "#e0c878";
  ctx.beginPath(); ctx.arc(0, -T * 0.14, T * 0.10, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(-T * 0.16, T * 0.02, T * 0.32, T * 0.05);
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(-T * 0.14 + i * T * 0.08, T * 0.02, T * 0.015, T * 0.16);
  }
  ctx.fillStyle = "rgba(40,20,16,0.35)";
  ctx.fillRect(-T * 0.30, T * 0.32, T * 0.60, T * 0.08);
};
// 灯笼（500 - 1400）：又黑又冷的区段里唯一的光
window.PROP_DRAW["lantern07"] = function (ctx, p, T) {
  ctx.fillStyle = "#3a3630";
  ctx.fillRect(-T * 0.10, -T * 0.16, T * 0.20, T * 0.26);
  ctx.fillStyle = "#ffcf7a";
  ctx.fillRect(-T * 0.07, -T * 0.13, T * 0.14, T * 0.20);
  ctx.strokeStyle = "#22201c"; ctx.lineWidth = 1.2;
  ctx.strokeRect(-T * 0.10, -T * 0.16, T * 0.20, T * 0.26);
  const g = ctx.createRadialGradient(0, -T * 0.03, 1, 0, -T * 0.03, T * 0.62);
  g.addColorStop(0, "rgba(255,200,120,0.40)");
  g.addColorStop(1, "rgba(255,180,100,0)");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, -T * 0.03, T * 0.62, 0, Math.PI * 2); ctx.fill();
};
// 罗马：高达数百米的大理石柱
window.PROP_DRAW["column07"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(0,0,0,0.30)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.22, T * 0.24, T * 0.06, 0, 0, Math.PI * 2); ctx.fill();
  const g = ctx.createLinearGradient(-T * 0.20, 0, T * 0.20, 0);
  g.addColorStop(0, "#b8b2a0"); g.addColorStop(0.4, "#eeeade"); g.addColorStop(1, "#a8a292");
  ctx.fillStyle = g;
  ctx.fillRect(-T * 0.19, -T * 0.34, T * 0.38, T * 0.60);
  ctx.fillStyle = "#f4f0e4";                 // 柱头
  ctx.fillRect(-T * 0.24, -T * 0.42, T * 0.48, T * 0.09);
  ctx.fillStyle = "#dedac8";                 // 柱础
  ctx.fillRect(-T * 0.23, T * 0.20, T * 0.46, T * 0.08);
  ctx.strokeStyle = "rgba(120,112,96,0.5)"; ctx.lineWidth = 1;
  for (let i = 1; i < 5; i++) {              // 柱身的凹槽
    ctx.beginPath();
    ctx.moveTo(-T * 0.19 + (T * 0.38 / 5) * i, -T * 0.34);
    ctx.lineTo(-T * 0.19 + (T * 0.38 / 5) * i, T * 0.20);
    ctx.stroke();
  }
};
// 雕像：抽象的形状与未知的实体
window.PROP_DRAW["statue07"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.22, T * 0.18, T * 0.05, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#ded8c6";
  ctx.fillRect(-T * 0.12, T * 0.08, T * 0.24, T * 0.12);        // 基座
  ctx.fillStyle = "#eeeade";
  ctx.beginPath();
  ctx.moveTo(-T * 0.10, T * 0.08);
  ctx.quadraticCurveTo(-T * 0.16, -T * 0.14, 0, -T * 0.30);
  ctx.quadraticCurveTo(T * 0.16, -T * 0.14, T * 0.10, T * 0.08);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(130,122,104,0.55)"; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = "#ded8c6";
  ctx.beginPath(); ctx.arc(0, -T * 0.34, T * 0.07, 0, Math.PI * 2); ctx.fill();
};
// 埃及：墙上无法破译的雕刻（物件版，画在墙格上）
window.PROP_DRAW["glyph07"] = function (ctx, p, T) {
  ctx.strokeStyle = "rgba(70,48,22,0.62)";
  ctx.lineWidth = 1.4;
  for (let k = 0; k < 4; k++) {
    const cy = -T * 0.32 + k * T * 0.20;
    ctx.beginPath();
    ctx.moveTo(-T * 0.26, cy); ctx.lineTo(-T * 0.06, cy);
    ctx.moveTo(-T * 0.06, cy - T * 0.05); ctx.lineTo(-T * 0.06, cy + T * 0.05);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(T * 0.10, cy, T * 0.07, Math.PI * 0.15, Math.PI * 1.75);
    ctx.stroke();
  }
};
