// ===========================================================
// Level 1.1 —— 腐败的走廊
// Level 1 的 M.E.G. Alpha 基地正南方那条笔直而狭窄的走廊。
// 墙是涂成白色的炉渣砖，地面铺着蓝色瓷砖，蓝白配色。裂缝与洞口里
// 探出裸露的管道和通风管。越往深处越不稳定 —— 四个区域：
//   区域1：安全、稳定、无实体，板条箱最多
//   区域2：不安全、少量实体（笑魇 / 猎犬 / 窃皮者），地面倾斜、颜色走样、管道堵路
//   区域3：不安全、不稳定、中量实体，大半被黑暗笼罩，偶尔有来历不明的光照区
//   区域4：死区，黑白配色、剧烈起伏、漂浮的变异实体，尽头是那道"光"
// 出口：走廊起点原路返回 Level 1；区域 2 / 3 的墙上有裂缝，钻出去回到 Level 1。
// ===========================================================
"use strict";

// 区域划分（按走廊长度）。main.js 也读这份表来决定黑暗、刷怪、晃动。
function corridorZoneAt(map, tx) {
  const Z = (map && map.corridorZones) || [];
  for (const z of Z) if (tx >= z.x0 && tx <= z.x1) return z.zone;
  return 1;
}
window.corridorZoneAt = corridorZoneAt;

function generateCorruptCorridorMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const props = [];
  const crates = [];
  const mid = Math.floor(size / 2);

  // 四个区域（外加尽头那一小段"区域5"的光）
  const x1 = Math.floor(size * 0.28);
  const x2 = Math.floor(size * 0.56);
  const x3 = Math.floor(size * 0.78);
  const xEnd = size - 5;
  const corridorZones = [
    { x0: 2, x1: x1, zone: 1 },
    { x0: x1 + 1, x1: x2, zone: 2 },
    { x0: x2 + 1, x1: x3, zone: 3 },
    { x0: x3 + 1, x1: xEnd, zone: 4 },
  ];

  // 挖走廊：宽度按区域变化，区域 4 的中心线还会上下摆（"剧烈起伏"）
  for (let x = 3; x <= xEnd; x++) {
    const z = corridorZoneAt({ corridorZones }, x);
    let w, cy = mid;
    if (z === 1) { w = 3; }
    else if (z === 2) { w = 3; }
    else if (z === 3) { w = 2 + ((x * 7) % 5); }          // 6~20 英尺，宽窄不匀
    else { w = 4 + ((x * 3) % 3); cy = mid + Math.round(Math.sin(x * 0.55) * 4); }
    const half = Math.floor(w / 2);
    for (let k = -half; k <= half; k++) {
      const y = cy + k;
      if (y < 3 || y >= size - 3) continue;
      grid[y][x] = 0;
    }
  }
  // 区域 2：地面以奇怪的角度倾斜 —— 走廊一侧多挖开一格，看着像斜坡
  for (let x = x1 + 1; x <= x2; x++) {
    if (x % 7 === 0) {
      const y = mid - 2;
      if (y > 2) grid[y][x] = 0;
    }
  }
  // 区域 2：管道和通风管堵住部分走廊（留一格能侧身过去）
  for (let x = x1 + 8; x <= x2; x += 11) {
    grid[mid + 1][x] = 1;
    grid[mid + 1][x + 1] = 1;
  }

  const floors = collectFloors(grid, size);
  const start = { x: 5, y: mid, floor: 0 };
  if (grid[start.y][start.x] !== 0) {
    for (let y = mid - 3; y <= mid + 3; y++) if (grid[y] && grid[y][5] === 0) { start.y = y; break; }
  }
  const isFloor = (x, y) => x >= 0 && y >= 0 && x < size && y < size && grid[y][x] === 0;

  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return;
    props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  };

  // 板条箱：越深越少 —— 这是长距离探索变困难的原因
  for (const t of floors) {
    const z = corridorZoneAt({ corridorZones }, t.x);
    const rate = z === 1 ? 0.16 : z === 2 ? 0.07 : z === 3 ? 0.03 : 0;
    if (Math.random() < rate) crates.push({ x: t.x, y: t.y, floor: 0, opened: false, loot: randInt(1, 3) });
  }
  // 裸露的管道 / 通风管：从墙缝和洞口里探出来（画在墙格上）
  for (const t of floors) {
    for (const d of [[0, -1], [0, 1]]) {
      const wy = t.y + d[1];
      if (wy < 1 || wy >= size - 1) continue;
      if (grid[wy][t.x] !== 1) continue;
      if (Math.random() > 0.10) continue;
      put(t.x, wy, "pipe111");
      break;
    }
  }
  // 区域 2 的墙：那串至今没被翻译出来的未知文字标记
  for (let i = 0; i < 6; i++) {
    const x = randInt(x1 + 2, x2 - 2);
    let found = null;
    for (let y = mid - 4; y <= mid + 4; y++) {
      if (y > 0 && y < size - 1 && grid[y][x] === 1) { found = y; break; }
    }
    if (found != null) put(x, found, "glyph111");
  }
  // 区域 3 里那些没有明显光源的明亮光照区
  const bright = [];
  for (let i = 0; i < 4; i++) {
    const x = randInt(x2 + 4, x3 - 3);
    let y = mid;
    for (let k = -3; k <= 3; k++) if (isFloor(x, mid + k)) { y = mid + k; break; }
    bright.push({ x, y });
    put(x, y, "bright111");
  }
  // 区域 3 尽头：那块警告牌
  put(x3 + 1, mid, "warn111", { text: "警告！请勿越过此界。所有进入区域 4 的人都将面临迫在眉睫的死亡。" });
  // 区域 4 尽头：那道光（区域 5）—— 靠近的人再也没回来过
  put(xEnd - 1, mid, "lightcursor");
  // 区域 2 / 3 的墙缝：钻出去就能切回 Level 1
  const cracks = [];
  for (let i = 0; i < 5; i++) {
    const x = randInt(x1 + 3, x3 - 2);
    let y = null;
    for (let k = -3; k <= 3; k++) {
      if (k === 0) continue;
      if (grid[mid + k] && grid[mid + k][x] === 1) { y = mid + k; break; }
    }
    if (y == null) continue;
    put(x, y, "crackwall11");
    cracks.push({ x, y });
  }
  // 出口：起点的门 —— 原路返回 Level 1
  placeExitDoor(grid, size, start, props, {
    to: 1, label: "L1", tint: "#4a6a8a", side: "left",
    tip: "进来的那扇门 —— 原路返回 Level 1",
  });

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates, ground: [],
    corridorZones, bright, cracks,
  };
  map.spawnPts = [start];
  return map;
}

// ---------- 专属模型 ----------
window.PROP_DRAW = window.PROP_DRAW || {};

// 板条箱（Level 1.1 的补给）—— 由通用箱子逻辑绘制，这里只补一层木纹标注
window.PROP_DRAW["crate111"] = function (ctx, p, T) {
  const w = T * 0.78, h = T * 0.62;
  ctx.fillStyle = "rgba(0,0,0,0.30)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.30, w * 0.5, T * 0.08, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#8a6a42"; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#a07d4e"; ctx.fillRect(-w / 2, -h / 2, w, h * 0.22);
  ctx.strokeStyle = "#6b4f30"; ctx.lineWidth = 1.6;
  ctx.strokeRect(-w / 2, -h / 2, w, h);
  ctx.beginPath(); ctx.moveTo(-w / 2, -h / 2); ctx.lineTo(w / 2, h / 2);
  ctx.moveTo(w / 2, -h / 2); ctx.lineTo(-w / 2, h / 2); ctx.stroke();
};

// 从墙缝里探出来的管道 / 通风管
window.PROP_DRAW["pipe111"] = function (ctx, p, T) {
  ctx.fillStyle = "#9aa0a6";
  ctx.fillRect(-T * 0.42, -T * 0.10, T * 0.84, T * 0.20);
  ctx.fillStyle = "#b6bcc2";
  ctx.fillRect(-T * 0.42, -T * 0.10, T * 0.84, T * 0.06);
  // 法兰盘
  ctx.fillStyle = "#7d838a";
  ctx.fillRect(T * 0.24, -T * 0.16, T * 0.09, T * 0.32);
  ctx.fillRect(-T * 0.34, -T * 0.16, T * 0.09, T * 0.32);
  // 接缝处渗出来的一点水渍
  ctx.fillStyle = "rgba(60,90,110,0.35)";
  ctx.fillRect(T * 0.30, T * 0.04, T * 0.10, T * 0.16);
};

// 墙上的未知文字：至今没人翻译出来
window.PROP_DRAW["glyph111"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(50,60,70,0.85)";
  const base = -T * 0.10;
  for (let i = 0; i < 5; i++) {
    const x = -T * 0.28 + i * T * 0.14;
    const h = T * (0.10 + ((i * 53 + p.x * 17 + p.y * 7) % 6) / 40);
    ctx.fillRect(x, base, T * 0.045, -h);
    if (i % 2 === 0) ctx.fillRect(x, base - h, T * 0.14, T * 0.04);
    else ctx.fillRect(x + T * 0.06, base - h * 0.6, T * 0.10, T * 0.035);
  }
};

// 区域 3 里那些没有明显光源的明亮光照区
window.PROP_DRAW["bright111"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : 0) / 1000;
  const k = 0.55 + 0.10 * Math.sin(t * 1.3 + p.x);
  const gr = ctx.createRadialGradient(0, 0, 1, 0, 0, T * 2.1);
  gr.addColorStop(0, "rgba(240,244,250," + (0.55 * k).toFixed(3) + ")");
  gr.addColorStop(1, "rgba(240,244,250,0)");
  ctx.fillStyle = gr;
  ctx.beginPath(); ctx.arc(0, 0, T * 2.1, 0, Math.PI * 2); ctx.fill();
};

// 区域 3 尽头那块警告牌
window.PROP_DRAW["warn111"] = function (ctx, p, T) {
  const w = T * 1.15, h = T * 0.78;
  ctx.fillStyle = "rgba(0,0,0,0.34)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.42, w * 0.46, T * 0.07, 0, 0, Math.PI * 2); ctx.fill();
  // 牌杆
  ctx.fillStyle = "#5a6065"; ctx.fillRect(-2, T * 0.16, 4, T * 0.30);
  // 黄底黑字
  ctx.fillStyle = "#d8bb2e"; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.strokeStyle = "#2a2a24"; ctx.lineWidth = 2; ctx.strokeRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#1e1e18";
  for (let i = 0; i < 4; i++) {
    const lw = w * (0.78 - (i === 1 ? 0.12 : 0) + (i === 2 ? 0.10 : 0));
    ctx.fillRect(-lw / 2, -h / 2 + h * 0.18 + i * h * 0.17, lw, h * 0.075);
  }
  // 顶上一个警示三角
  ctx.fillStyle = "#1e1e18";
  ctx.beginPath();
  ctx.moveTo(0, -h / 2 + h * 0.06); ctx.lineTo(-h * 0.13, -h / 2 + h * 0.02);
  ctx.lineTo(h * 0.13, -h / 2 + h * 0.02); ctx.closePath(); ctx.fill();
};

// 区域 4 尽头那道"光"—— 它在召唤，靠近它的人再也没回来过
window.PROP_DRAW["lightcursor"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : 0) / 1000;
  const pulse = 0.62 + 0.30 * Math.sin(t * 2.4);
  const gr = ctx.createRadialGradient(0, 0, 1, 0, 0, T * 4.2);
  gr.addColorStop(0, "rgba(255,255,250," + (0.92 * pulse).toFixed(3) + ")");
  gr.addColorStop(0.25, "rgba(230,240,255," + (0.55 * pulse).toFixed(3) + ")");
  gr.addColorStop(1, "rgba(200,220,255,0)");
  ctx.fillStyle = gr;
  ctx.beginPath(); ctx.arc(0, 0, T * 4.2, 0, Math.PI * 2); ctx.fill();
  // 一道竖着的光标
  ctx.fillStyle = "rgba(255,255,255," + (0.85 * pulse).toFixed(3) + ")";
  ctx.fillRect(-T * 0.16, -T * 1.5, T * 0.32, T * 3.0);
  ctx.fillStyle = "rgba(255,255,255," + (0.55 * pulse).toFixed(3) + ")";
  ctx.fillRect(-T * 0.05, -T * 1.9, T * 0.10, T * 3.8);
};

// 区域 2 / 3 墙上的裂缝：钻出去就切回 Level 1
window.PROP_DRAW["crackwall11"] = function (ctx, p, T) {
  ctx.save();
  ctx.strokeStyle = "rgba(10,12,14,0.92)";
  ctx.lineWidth = Math.max(2, T * 0.09);
  ctx.beginPath();
  ctx.moveTo(-T * 0.30, -T * 0.44);
  ctx.lineTo(-T * 0.05, -T * 0.05);
  ctx.lineTo(-T * 0.22, T * 0.20);
  ctx.lineTo(T * 0.10, T * 0.46);
  ctx.stroke();
  ctx.lineWidth = Math.max(1, T * 0.05);
  ctx.beginPath();
  ctx.moveTo(-T * 0.05, -T * 0.05);
  ctx.lineTo(T * 0.30, -T * 0.16);
  ctx.stroke();
  // 缝里透出来的一点 Level 1 的灯光
  ctx.fillStyle = "rgba(190,205,215,0.30)";
  ctx.fillRect(-T * 0.06, -T * 0.10, T * 0.12, T * 0.30);
  ctx.restore();
};

// Level 1 里通往 1.1 的那扇门（Alpha 基地正南方）—— 门边立着块标志牌
window.PROP_DRAW["door111"] = function (ctx, p, T) {
  const w = T * 0.86, h = T * 1.02;
  // 门框：白色炉渣砖的门洞
  ctx.fillStyle = "#c8ccc8";
  ctx.fillRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8);
  ctx.fillStyle = "#a8aca8";
  ctx.fillRect(-w / 2 - 4, -h / 2 - 4, w + 8, 5);
  // 门洞里是黑的 —— 看不清里面那条走廊有多长
  ctx.fillStyle = "#12151a";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  const gr = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  gr.addColorStop(0, "rgba(30,40,55,0.9)");
  gr.addColorStop(1, "rgba(5,8,12,1)");
  ctx.fillStyle = gr;
  ctx.fillRect(-w / 2, -h / 2, w, h);
  // 门牌
  ctx.fillStyle = "#2b3138";
  ctx.fillRect(-w * 0.34, -h / 2 - T * 0.30, w * 0.68, T * 0.26);
  ctx.fillStyle = "#e8ecf0";
  ctx.font = "bold " + Math.round(T * 0.19) + "px system-ui, sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("LEVEL 1.1", 0, -h / 2 - T * 0.17);
  ctx.restore && ctx.restore;
};

// -----------------------------------------------------------
// Level 1 里通往 1.1 的那扇门：Alpha 基地的正南方。
// 入口外面立着一块标志牌，标示着它所在的位置 —— 档案里是这么写的。
// 放在补给之后调用，否则刚 push 进去的门会被 spawnSupplies 清掉。
// -----------------------------------------------------------
window.buildCorridor11Door = function (map, size, base) {
  const f = (map.megFloor != null) ? (map.megFloor | 0) : 0;
  const grid = (map.layers && map.layers[f]) || null;
  if (!grid || !base) return null;
  const cx = Math.round(base.x + base.w / 2);
  const cy = Math.round(base.y + base.h / 2);
  const ok = (x, y) => {
    if (x < 2 || y < 2 || x >= size - 2 || y >= size - 2) return false;
    if (grid[y][x] !== 0) return false;
    if (base.inside.has(x + "," + y) || base.wall.has(x + "," + y)) return false;
    return true;
  };
  // 档案写的是"基地正南方那扇门"，所以南边优先。
  // 但基地被推到角落时，南边可能直接就是地图边界 —— 那就顺着其它边退而求其次。
  const sides = [
    { x: cx, y: base.y + base.h + 1, sx: 0, sy: 1 },     // 南
    { x: cx, y: base.y - 1, sx: 0, sy: -1 },             // 北
    { x: base.x - 1, y: cy, sx: -1, sy: 0 },             // 西
    { x: base.x + base.w + 1, y: cy, sx: 1, sy: 0 },     // 东
  ];
  let best = null;
  for (const s of sides) {
    for (let step = 0; step <= 10 && !best; step++) {
      const x = s.x + s.sx * step, y = s.y + s.sy * step;
      if (ok(x, y)) { best = { x, y }; break; }
      for (let d = 1; d <= 8 && !best; d++) {
        if (s.sy !== 0) { for (const xx of [x + d, x - d]) if (ok(xx, y)) { best = { x: xx, y }; break; } }
        if (!best && s.sx !== 0) { for (const yy of [y + d, y - d]) if (ok(x, yy)) { best = { x, y: yy }; break; } }
      }
    }
    if (best) break;
  }
  if (!best) return null;
  const door = {
    x: best.x, y: best.y, floor: f, type: "door111",
    toLevel: "1.1", label: "1.1",
    tip: "基地正南方那扇门 —— 门后是一条看不见尽头的走廊",
  };
  map.props.push(door);
  // 门口那块标志牌
  const sign = { x: best.x, y: best.y + 1, floor: f, type: "sign111" };
  if (grid[sign.y] && grid[sign.y][sign.x] === 1) map.props.push(sign);
  return door;
};

// 基地正南方门口那块标志牌：写着这条走廊的去向
window.PROP_DRAW["sign111"] = function (ctx, p, T) {
  const w = T * 0.92, h = T * 0.60;
  ctx.fillStyle = "rgba(0,0,0,0.30)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.38, w * 0.42, T * 0.07, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#5c6268"; ctx.fillRect(-2, T * 0.10, 4, T * 0.30);
  ctx.fillStyle = "#1f4b72"; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "rgba(255,255,255,0.12)"; ctx.fillRect(-w / 2, -h / 2, w, h * 0.30);
  ctx.strokeStyle = "#d8dde2"; ctx.lineWidth = 1.6; ctx.strokeRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#eef2f6";
  ctx.font = "bold " + Math.round(T * 0.17) + "px system-ui, sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("→", -w * 0.34, 0);
  ctx.font = "bold " + Math.round(T * 0.14) + "px system-ui, sans-serif";
  ctx.fillText("1.1", w * 0.06, 0);
};
