// ===========================================================
// Level 17 —— 航空母舰
// 一艘无限大的航空母舰。密封的半透明门窗会发出无法辨认的光，
// 照到流浪者时肺部会逐渐充满水。
// 上层楼梯 -> Level 11（红色金属门）；下层被水淹没的走廊 -> Level 7。
//
// 布局不是迷宫：一条贯通全舰的中央通道（舰脊）
//   + 两侧成排的舱室（住舱 / 机库 / 储藏）
//   + 上缘一条飞行甲板（舰载机、弹射器、舰岛雷达）
//   + 下缘一条被水淹了的底层走廊
// 舱壁是白灰交替的拼板钢板，配椭圆形舱门与防水门。
// ===========================================================
"use strict";

function generateCarrierMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const props = [];
  const water = new Set();

  const cy = Math.floor(size / 2);

  // ---- 舰脊：贯通全图的一条宽走廊（3 格宽）----
  for (let x = 2; x < size - 2; x++) for (let w = -1; w <= 1; w++) grid[cy + w][x] = 0;

  // ---- 飞行甲板：地图最上面一条开阔带（不再是墙）----
  const deckTop = 3, deckBot = 9;
  for (let y = deckTop; y <= deckBot; y++) {
    for (let x = 3; x < size - 3; x++) grid[y][x] = 0;
  }
  // 甲板 <-> 舰脊：两条纵向坡道
  const rampA = Math.floor(size * 0.3), rampB = Math.floor(size * 0.68);
  for (const rx of [rampA, rampB]) {
    for (let y = deckBot; y <= cy - 1; y++) grid[y][rx] = 0;
  }

  // ---- 舰岛（superstructure）：甲板中段一块实心结构，不挖空 ----
  const islX = Math.floor(size * 0.5) - 2, islY = deckTop + 2;
  for (let y = islY; y <= islY + 2; y++) for (let x = islX; x <= islX + 3; x++) grid[y][x] = 1;

  // ---- 两侧舱室：成排，门开在舰脊这一侧 ----
  const bay = 6;
  const rooms = [];
  for (let i = 0; i < Math.floor((size - 10) / bay); i++) {
    const x = 4 + i * bay;
    for (const side of [-1, 1]) {
      const y = side < 0 ? cy + 3 : cy - 9;
      if (y < deckBot + 2 || y + 4 > size - 8) continue;
      carveRoom(grid, size, x, y, 5, 4);
      rooms.push({ x, y, w: 5, h: 4, side });
      // 舱室 <-> 舰脊 的短通道
      carveCorridorW(grid, size, x + 2, side < 0 ? y : y + 4, x + 2, side < 0 ? cy + 1 : cy - 1, 1);
    }
  }

  // ---- 机库：舰脊下方一整片开阔大舱（放舰载机）----
  const hgY = cy + 9, hgX = Math.floor(size * 0.55), hgW = Math.min(20, size - hgX - 6), hgH = 8;
  if (hgY + hgH < size - 7) {
    for (let y = hgY; y < hgY + hgH; y++) for (let x = hgX; x < hgX + hgW; x++) grid[y][x] = 0;
    carveCorridorW(grid, size, hgX + 2, hgY, hgX + 2, cy + 1, 1);
  }

  // ---- 底层：被水淹没的走廊（地图底部一条）----
  const fy = size - 5;
  for (let x = 4; x < size - 4; x++) { grid[fy][x] = 0; water.add(x + "," + fy); }
  carveCorridorW(grid, size, Math.floor(size * 0.25), cy + 1, Math.floor(size * 0.25), fy, 1);

  const floors = collectFloors(grid, size);
  const start = { x: 5, y: cy, floor: 0 };
  if (grid[start.y] && grid[start.y][start.x] === 1) grid[start.y][start.x] = 0;

  const taken = new Set();
  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return;
    if (grid[y][x] !== 0 || water.has(x + "," + y)) return;
    if (taken.has(x + "," + y)) return;
    taken.add(x + "," + y);
    props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  };
  // 从 (x,y) 螺旋找最近的干燥地板放出口——保证出口一定落得下去、且能走到
  const putNear = (x, y, type, extra) => {
    if (x >= 1 && y >= 1 && x < size - 1 && y < size - 1 && grid[y][x] === 0 && !water.has(x + "," + y) && !taken.has(x + "," + y)) {
      put(x, y, type, extra); return true;
    }
    for (let r = 1; r <= 24; r++) {
      for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const nx = x + dx, ny = y + dy;
        if (nx < 1 || ny < 1 || nx >= size - 1 || ny >= size - 1) continue;
        if (grid[ny][nx] !== 0 || water.has(nx + "," + ny) || taken.has(nx + "," + ny)) continue;
        put(nx, ny, type, extra); return true;
      }
    }
    return false;
  };
  // 舷窗：成排嵌在舱室墙上（那些"密封的半透明门窗"）
  for (let x = 5; x < size - 5; x += 3) { put(x, cy - 2, "porthole"); put(x, cy + 2, "porthole"); }
  // 舱壁上的椭圆形舱门 + 防水门：一对一对地嵌在舰脊两侧
  for (let x = 6; x < size - 8; x += 7) {
    put(x, cy - 1, "hatch17");
    put(x + 3, cy + 1, "wdoor17");
  }
  // 飞行甲板：舰载机、弹射器、系缆桩
  for (let i = 0; i < 3; i++) {
    const x = Math.floor(size * (0.12 + i * 0.24));
    if (x > islX - 6 || x < islX + 8) { /* 避开机岛 */ }
    put(x, deckBot - 1, "jet17");
    put(x, deckTop + 1, "catapult17");
  }
  put(islX + 1, islY - 2, "radar17");                 // 舰岛顶上的雷达
  for (let x = 6; x < size - 6; x += 9) put(x, deckTop, "bollard17");
  // 机库里的舰载机与检修平台
  if (hgY + hgH < size - 7) {
    for (let i = 0; i < 3; i++) put(hgX + 2 + i * 5, hgY + 2, "jet17");
    put(hgX + 1, hgY + hgH - 2, "console17");
  }
  // 甲板与舰脊上的杂物：管系、缆绳盘、货箱、仪表箱
  for (let i = 0; i < 10; i++) put(randInt(5, size - 6), randInt(cy - 1, cy + 1), "pipe17");
  for (let i = 0; i < 6; i++) put(randInt(5, size - 6), randInt(deckTop + 2, deckBot - 2), "ropecoil17");
  for (let i = 0; i < 12; i++) put(randInt(4, size - 5), randInt(cy + 3, size - 9), "crate17");
  // 救生艇：挂在甲板外缘
  for (let x = 8; x < size - 8; x += 14) put(x, deckBot, "lifeboat17");

  // 上层楼梯 + 红色金属门（通往 Level 11）——放在飞行甲板上（贴甲板上沿）
  putNear(rampB, deckTop, "stair17");
  putNear(rampB + 2, deckTop, "reddoor17", { toLevel: 11 });
  // 下层通往 Level 7 的淹水口——放在淹水走廊的岸上（水里放不了）
  putNear(Math.floor(size * 0.25), fy - 1, "floodgate17", { toLevel: 7 });

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms,
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [], water,
  };
  map.spawnPts = [start];
  return map;
}

window.PROP_DRAW = window.PROP_DRAW || {};

// ---------- 地面：白灰交替的舰用钢板 ----------
window.drawCarrierFloor = function (ctx, px, py, S, tx, ty) {
  // 每 2 格一块拼板，白灰交替
  const white = (((tx >> 1) + (ty >> 1)) & 1) === 0;
  ctx.fillStyle = white ? "#c9ced4" : "#9aa2ab";
  ctx.fillRect(px, py, S, S);
  // 拼缝：每 2 格的边界压一条深色
  if ((tx & 1) === 0) { ctx.fillStyle = "rgba(40,48,56,0.35)"; ctx.fillRect(px, py, 1.5, S); }
  if ((ty & 1) === 0) { ctx.fillStyle = "rgba(40,48,56,0.35)"; ctx.fillRect(px, py, S, 1.5); }
  // 防滑纹：斜向细纹，钢板该有的质感
  ctx.strokeStyle = white ? "rgba(60,70,80,0.18)" : "rgba(30,38,46,0.22)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    const o = 6 + i * 11;
    ctx.beginPath(); ctx.moveTo(px + o, py + S); ctx.lineTo(px + o + S * 0.55, py); ctx.stroke();
  }
  // 偶尔一块锈斑 / 油污
  if (((tx * 31 + ty * 17) % 11) === 0) {
    ctx.fillStyle = "rgba(120,88,50,0.20)";
    ctx.fillRect(px + S * 0.2, py + S * 0.25, S * 0.45, S * 0.4);
  }
  return true;
};

// ---------- 墙体：白灰交替的舱壁拼板 ----------
window.drawCarrierWall = function (ctx, px, py, S) {
  const tx = Math.round(px / S), ty = Math.round(py / S);
  const white = (((tx >> 1) + (ty >> 1)) & 1) === 0;
  ctx.fillStyle = white ? "#dfe4e9" : "#aab2bb";
  ctx.fillRect(px, py, S, S);
  // 拼板之间的两道压条
  ctx.fillStyle = "rgba(50,58,66,0.40)";
  ctx.fillRect(px, py, S, Math.max(2, S * 0.10));
  ctx.fillRect(px, py + S - Math.max(2, S * 0.10), S, Math.max(2, S * 0.10));
  // 竖向拼缝 + 铆钉
  ctx.strokeStyle = "rgba(50,58,66,0.28)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(px + S * 0.5, py + 2); ctx.lineTo(px + S * 0.5, py + S - 2); ctx.stroke();
  ctx.fillStyle = "rgba(70,80,90,0.55)";
  for (let i = 0; i < 4; i++) {
    const yy = py + S * (0.16 + i * 0.22);
    ctx.beginPath(); ctx.arc(px + S * 0.18, yy, 1.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(px + S * 0.82, yy, 1.3, 0, Math.PI * 2); ctx.fill();
  }
  return true;
};

// 舷窗：密封的半圆形窗，往外发出无法辨认的光
window.PROP_DRAW["porthole"] = function (ctx, p, T) {
  const r = T * 0.30;
  ctx.fillStyle = "#2a3038";
  ctx.beginPath(); ctx.arc(0, 0, r + 3, 0, Math.PI * 2); ctx.fill();
  // 玻璃：偏青白的冷光
  const g = ctx.createRadialGradient(0, 0, 1, 0, 0, r);
  g.addColorStop(0, "rgba(200,240,255,0.95)");
  g.addColorStop(0.6, "rgba(120,190,220,0.55)");
  g.addColorStop(1, "rgba(60,120,150,0.20)");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  // 铆钉圈
  ctx.fillStyle = "#5a626c";
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath(); ctx.arc(Math.cos(a) * (r + 3), Math.sin(a) * (r + 3), 1.8, 0, Math.PI * 2); ctx.fill();
  }
  ctx.strokeStyle = "#1e2228"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(0, 0, r + 3, 0, Math.PI * 2); ctx.stroke();
};

// 椭圆形舱门：竖向椭圆 + 中央手轮 + 一圈压紧螺栓
window.PROP_DRAW["hatch17"] = function (ctx, p, T) {
  const rx = T * 0.30, ry = T * 0.42;
  ctx.fillStyle = "rgba(0,0,0,0.30)";
  ctx.beginPath(); ctx.ellipse(0, 2, rx + 2, ry + 2, 0, 0, Math.PI * 2); ctx.fill();
  // 门框
  ctx.fillStyle = "#7d858e";
  ctx.beginPath(); ctx.ellipse(0, 0, rx + 3, ry + 3, 0, 0, Math.PI * 2); ctx.fill();
  // 门板
  const g = ctx.createLinearGradient(-rx, 0, rx, 0);
  g.addColorStop(0, "#b9c0c7"); g.addColorStop(0.5, "#dfe5ea"); g.addColorStop(1, "#8f979f");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#4c545c"; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
  // 一圈压紧螺栓
  ctx.fillStyle = "#5c646c";
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    ctx.beginPath(); ctx.arc(Math.cos(a) * rx * 0.82, Math.sin(a) * ry * 0.82, 1.5, 0, Math.PI * 2); ctx.fill();
  }
  // 中央手轮
  ctx.strokeStyle = "#3f464d"; ctx.lineWidth = 2.2;
  ctx.beginPath(); ctx.arc(0, 0, T * 0.13, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 1.6;
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 4;
    ctx.beginPath(); ctx.moveTo(-Math.cos(a) * T * 0.13, -Math.sin(a) * T * 0.13);
    ctx.lineTo(Math.cos(a) * T * 0.13, Math.sin(a) * T * 0.13); ctx.stroke();
  }
};

// 防水门：厚重的方形门 + 手轮 + 四角压紧把手 + 黄黑警示条
window.PROP_DRAW["wdoor17"] = function (ctx, p, T) {
  const w = T * 0.66, h = T * 0.88;
  ctx.fillStyle = "rgba(0,0,0,0.32)";
  ctx.fillRect(-w / 2 - 2, -h / 2 + 3, w + 4, h);
  // 门框
  ctx.fillStyle = "#6e767f"; ctx.fillRect(-w / 2 - 3, -h / 2 - 3, w + 6, h + 6);
  // 门板
  const g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
  g.addColorStop(0, "#98a0a8"); g.addColorStop(0.45, "#c4ccd3"); g.addColorStop(1, "#7d858d");
  ctx.fillStyle = g; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.strokeStyle = "#40484f"; ctx.lineWidth = 1.6; ctx.strokeRect(-w / 2, -h / 2, w, h);
  // 黄黑警示斜条
  ctx.save();
  ctx.beginPath(); ctx.rect(-w / 2, h / 2 - T * 0.16, w, T * 0.14); ctx.clip();
  ctx.fillStyle = "#d8c020"; ctx.fillRect(-w / 2, h / 2 - T * 0.16, w, T * 0.14);
  ctx.fillStyle = "#20242a";
  for (let i = -2; i < 8; i++) {
    ctx.beginPath();
    ctx.moveTo(-w / 2 + i * 8, h / 2 - T * 0.02);
    ctx.lineTo(-w / 2 + i * 8 + 5, h / 2 - T * 0.02);
    ctx.lineTo(-w / 2 + i * 8 + 11, h / 2 - T * 0.16);
    ctx.lineTo(-w / 2 + i * 8 + 6, h / 2 - T * 0.16);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  // 手轮
  ctx.strokeStyle = "#383f46"; ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.arc(0, -T * 0.08, T * 0.15, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = "#c03a28";
  ctx.beginPath(); ctx.arc(0, -T * 0.08, T * 0.045, 0, Math.PI * 2); ctx.fill();
  // 四角压紧把手
  ctx.fillStyle = "#4a525a";
  const cx = w / 2 - 4, cyy = h / 2 - 4;
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
    ctx.fillRect(sx * cx - 2.5, sy * cyy - 5, 5, 10);
  }
};

// 舰载机：俯视 —— 机身 + 后掠翼 + 尾翼 + 座舱盖
window.PROP_DRAW["jet17"] = function (ctx, p, T) {
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.30, T * 0.44, T * 0.13, 0, 0, Math.PI * 2); ctx.fill();
  // 主翼（后掠）
  ctx.fillStyle = "#5f6a74";
  ctx.beginPath();
  ctx.moveTo(-T * 0.10, -T * 0.04);
  ctx.lineTo(-T * 0.46, T * 0.24);
  ctx.lineTo(-T * 0.30, T * 0.28);
  ctx.lineTo(-T * 0.02, T * 0.06);
  ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(T * 0.10, -T * 0.04);
  ctx.lineTo(T * 0.46, T * 0.24);
  ctx.lineTo(T * 0.30, T * 0.28);
  ctx.lineTo(T * 0.02, T * 0.06);
  ctx.closePath(); ctx.fill();
  // 平尾
  ctx.fillStyle = "#6e7983";
  ctx.fillRect(-T * 0.20, -T * 0.34, T * 0.40, T * 0.10);
  // 机身
  const g = ctx.createLinearGradient(0, -T * 0.38, 0, T * 0.34);
  g.addColorStop(0, "#8c96a0"); g.addColorStop(0.5, "#aeb8c1"); g.addColorStop(1, "#6a747d");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, -T * 0.40);
  ctx.quadraticCurveTo(T * 0.13, -T * 0.10, T * 0.11, T * 0.30);
  ctx.lineTo(-T * 0.11, T * 0.30);
  ctx.quadraticCurveTo(-T * 0.13, -T * 0.10, 0, -T * 0.40);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "#3d444b"; ctx.lineWidth = 1.1; ctx.stroke();
  // 座舱盖
  ctx.fillStyle = "rgba(120,200,225,0.85)";
  ctx.beginPath(); ctx.ellipse(0, -T * 0.16, T * 0.075, T * 0.13, 0, 0, Math.PI * 2); ctx.fill();
  // 机身编号条
  ctx.fillStyle = "rgba(40,46,52,0.7)";
  ctx.fillRect(-T * 0.09, T * 0.02, T * 0.18, T * 0.045);
  ctx.restore();
};

// 弹射器：甲板上的两条导轨 + 滑块
window.PROP_DRAW["catapult17"] = function (ctx, p, T) {
  ctx.fillStyle = "#3a424a";
  ctx.fillRect(-T * 0.46, -T * 0.10, T * 0.92, T * 0.07);
  ctx.fillRect(-T * 0.46, T * 0.05, T * 0.92, T * 0.07);
  ctx.fillStyle = "rgba(255,255,255,0.20)";
  ctx.fillRect(-T * 0.46, -T * 0.10, T * 0.92, 1.5);
  ctx.fillRect(-T * 0.46, T * 0.05, T * 0.92, 1.5);
  // 滑块
  ctx.fillStyle = "#c8a828";
  ctx.fillRect(-T * 0.10, -T * 0.13, T * 0.20, T * 0.28);
  ctx.fillStyle = "#8a7018";
  ctx.fillRect(-T * 0.10, T * 0.09, T * 0.20, T * 0.05);
};

// 舰岛雷达：转动的抛物面天线
window.PROP_DRAW["radar17"] = function (ctx, p, T) {
  ctx.fillStyle = "#4a525a";
  ctx.fillRect(-2.5, 0, 5, T * 0.30);                       // 桅杆
  const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
  ctx.save();
  ctx.translate(0, -T * 0.06);
  ctx.rotate(t * 0.6);
  ctx.fillStyle = "#c2c8ce";
  ctx.beginPath();
  ctx.ellipse(0, 0, T * 0.30, T * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#5c646c"; ctx.lineWidth = 1.4; ctx.stroke();
  ctx.fillStyle = "#8d959d";
  ctx.beginPath(); ctx.ellipse(0, 0, T * 0.16, T * 0.07, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // 桅顶信号灯
  ctx.fillStyle = ((t * 2) % 2 < 1) ? "#e04a30" : "#5a2018";
  ctx.beginPath(); ctx.arc(0, -T * 0.26, 2.6, 0, Math.PI * 2); ctx.fill();
};

// 系缆桩 + 盘好的缆绳
window.PROP_DRAW["bollard17"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.24, T * 0.26, T * 0.08, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#5e666e";
  ctx.beginPath(); ctx.ellipse(0, 0, T * 0.20, T * 0.15, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#8a929a";
  ctx.beginPath(); ctx.ellipse(0, -T * 0.03, T * 0.14, T * 0.10, 0, 0, Math.PI * 2); ctx.fill();
  // 缆绳
  ctx.strokeStyle = "#a8935e"; ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.arc(0, T * 0.10, T * 0.22, 0.2, Math.PI * 1.5); ctx.stroke();
};

// 盘好的缆绳
window.PROP_DRAW["ropecoil17"] = function (ctx, p, T) {
  ctx.strokeStyle = "#9c8a58"; ctx.lineWidth = 2.2;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(0, 0, T * (0.28 - i * 0.07), T * (0.18 - i * 0.045), 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(60,50,30,0.5)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(0, 0, T * 0.28, T * 0.18, 0, 0, Math.PI * 2); ctx.stroke();
};

// 舰用管系：横向粗管 + 法兰 + 一根支管
window.PROP_DRAW["pipe17"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(0,0,0,0.24)";
  ctx.fillRect(-T * 0.40, T * 0.16, T * 0.80, T * 0.08);
  const g = ctx.createLinearGradient(0, -T * 0.14, 0, T * 0.14);
  g.addColorStop(0, "#9aa2aa"); g.addColorStop(0.5, "#6e767e"); g.addColorStop(1, "#4c525a");
  ctx.fillStyle = g;
  ctx.fillRect(-T * 0.40, -T * 0.12, T * 0.80, T * 0.24);
  ctx.fillStyle = "#878f97";
  ctx.fillRect(-T * 0.40, -T * 0.12, T * 0.80, T * 0.05);
  // 法兰
  ctx.fillStyle = "#5c646c";
  ctx.fillRect(-T * 0.40, -T * 0.15, T * 0.06, T * 0.30);
  ctx.fillRect(T * 0.10, -T * 0.15, T * 0.06, T * 0.30);
  // 支管上的阀轮
  ctx.strokeStyle = "#a03020"; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.arc(T * 0.28, 0, T * 0.09, 0, Math.PI * 2); ctx.stroke();
};

// 控制台：一排仪表与指示灯
window.PROP_DRAW["console17"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.fillRect(-T * 0.38, T * 0.20, T * 0.76, T * 0.08);
  ctx.fillStyle = "#4e565e"; ctx.fillRect(-T * 0.38, -T * 0.22, T * 0.76, T * 0.44);
  ctx.fillStyle = "#69717a"; ctx.fillRect(-T * 0.34, -T * 0.18, T * 0.68, T * 0.20);
  const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
  for (let i = 0; i < 5; i++) {
    const on = ((i + Math.floor(t * 1.4)) % 3) !== 0;
    ctx.fillStyle = on ? (i % 2 ? "#5ad06a" : "#e0c020") : "#2a3036";
    ctx.beginPath(); ctx.arc(-T * 0.26 + i * T * 0.13, T * 0.06, T * 0.035, 0, Math.PI * 2); ctx.fill();
  }
};

// 救生艇：橙白胶囊 + 吊架
window.PROP_DRAW["lifeboat17"] = function (ctx, p, T) {
  ctx.strokeStyle = "#5a626a"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-T * 0.30, -T * 0.22); ctx.lineTo(T * 0.30, -T * 0.22); ctx.stroke();
  ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(-T * 0.24, -T * 0.22); ctx.lineTo(-T * 0.24, -T * 0.06); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(T * 0.24, -T * 0.22); ctx.lineTo(T * 0.24, -T * 0.06); ctx.stroke();
  // 艇体
  ctx.fillStyle = "#e07020";
  ctx.beginPath(); ctx.ellipse(0, T * 0.02, T * 0.30, T * 0.15, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#f0f2f4";
  ctx.beginPath(); ctx.ellipse(0, -T * 0.02, T * 0.24, T * 0.09, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#8a4010"; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.ellipse(0, T * 0.02, T * 0.30, T * 0.15, 0, 0, Math.PI * 2); ctx.stroke();
};

// 通往上层的楼梯：一级一级画出来
window.PROP_DRAW["stair17"] = function (ctx, p, T) {
  for (let i = 0; i < 4; i++) {
    const y = T * 0.30 - i * T * 0.18;
    ctx.fillStyle = i % 2 ? "#6a727c" : "#7c848e";
    ctx.fillRect(-T * 0.34, y - T * 0.09, T * 0.68, T * 0.10);
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(-T * 0.34, y + T * 0.01, T * 0.68, T * 0.04);
  }
  ctx.fillStyle = "#8a929c";
  ctx.fillRect(-T * 0.36, -T * 0.34, 4, T * 0.70);     // 扶手
  ctx.fillRect(T * 0.32, -T * 0.34, 4, T * 0.70);
};

// 红色金属门（-> Level 11）
window.PROP_DRAW["reddoor17"] = function (ctx, p, T) {
  const w = T * 0.70, h = T * 0.92;
  ctx.fillStyle = "#8a2018"; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#a82820"; ctx.fillRect(-w / 2 + 3, -h / 2 + 3, w - 6, h * 0.42);
  ctx.fillStyle = "#6a180f"; ctx.fillRect(-w / 2 + 3, h * 0.02, w - 6, h * 0.44);
  ctx.strokeStyle = "#c85040"; ctx.lineWidth = 1.5;
  ctx.strokeRect(-w / 2 + 3, -h / 2 + 3, w - 6, h * 0.42);
  ctx.strokeRect(-w / 2 + 3, h * 0.02, w - 6, h * 0.44);
  ctx.fillStyle = "#d8d0b8";                                  // 门把
  ctx.beginPath(); ctx.arc(w * 0.28, 0, T * 0.05, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#3a0c08"; ctx.lineWidth = 2; ctx.strokeRect(-w / 2, -h / 2, w, h);
};

// 淹水的闸门（-> Level 7）
window.PROP_DRAW["floodgate17"] = function (ctx, p, T) {
  const w = T * 0.82, h = T * 0.70;
  ctx.fillStyle = "rgba(30,90,120,0.55)"; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#2a4a5a";
  for (let i = 0; i < 4; i++) ctx.fillRect(-w / 2 + 2, -h / 2 + 4 + i * (h / 4), w - 4, 3);
  ctx.strokeStyle = "#1a3040"; ctx.lineWidth = 2; ctx.strokeRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "rgba(160,220,240,0.75)";                   // 水位线
  ctx.fillRect(-w / 2, -h * 0.10, w, 2);
};

// 舰用货箱
window.PROP_DRAW["crate17"] = function (ctx, p, T) {
  const s = T * 0.56;
  ctx.fillStyle = "rgba(0,0,0,0.32)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.26, s * 0.6, T * 0.09, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#4a5258"; ctx.fillRect(-s / 2, -s / 2, s, s);
  ctx.strokeStyle = "#2e3438"; ctx.lineWidth = 2;
  ctx.strokeRect(-s / 2, -s / 2, s, s);
  ctx.beginPath(); ctx.moveTo(-s / 2, -s / 2); ctx.lineTo(s / 2, s / 2);
  ctx.moveTo(s / 2, -s / 2); ctx.lineTo(-s / 2, s / 2); ctx.stroke();
};
