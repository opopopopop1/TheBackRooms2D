// ===========================================================
// 隐秘层级 —— 战地医院（档案里写作 Level 14）
//   · 编号 14 在本作里已经被「天堂」占用了，所以内部 id 用 "14h"，
//     终端里敲 L14H（或 L14-h）也能到。
//   · 蓝色瓷砖的墙，满是污垢；木质天花板腐朽塌陷（但那不是出路）；
//     地板潮湿，有的房间整个被水浸着；始终听得到警报在响。
//   · 墙上全是涂鸦 —— 无法辨认，是这个层级自己长出来的。
//   · 唯一出没的「实体」是鬼魂一样的形体（伤员 / 医护人员），
//     碰不坏也碰不到，任何触碰都会直接穿过去。
//   · 出口：一间墙上黑白相间的房间 —— 碰上去到 Level 287。
// ===========================================================
"use strict";

(function () {
  // [地面主色, 地面次色]；墙走 drawMashWall 单独画（蓝色瓷砖 + 污垢）
  const v = ["#6e8189", "#5b6d75"];
  if (typeof regTile === "function") regTile("mash", v);
  else { (window.__NEWTILE_EXTRA = window.__NEWTILE_EXTRA || {})["mash"] = v; }
})();

function generateMashMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const props = [];
  const rooms = [];
  const water14h = new Set();     // 被水浸没的格子（走得到，但会溅水）
  const damp14h = new Set();      // 只是潮湿

  // 5 条横廊 + 5 条纵廊，中间夹出 4×4 = 16 间病房
  const R = 5;
  const cell = Math.max(10, Math.floor((size - 8) / R));
  const lines = [];
  for (let i = 0; i < R; i++) lines.push(4 + i * cell);

  const carve = (x, y) => { if (x > 0 && y > 0 && x < size - 1 && y < size - 1) grid[y][x] = 0; };

  // ---------- 走廊：整条挖通，宽 3 ----------
  for (const cy of lines) for (let x = 3; x < size - 3; x++) for (let d = -1; d <= 1; d++) carve(x, cy + d);
  for (const cx of lines) for (let y = 3; y < size - 3; y++) for (let d = -1; d <= 1; d++) carve(y, cx + d);

  // ---------- 病房：走廊与走廊之间的方块 ----------
  for (let i = 0; i < R - 1; i++) {
    for (let j = 0; j < R - 1; j++) {
      const y0 = lines[i] + 2, y1 = lines[i + 1] - 2;
      const x0 = lines[j] + 2, x1 = lines[j + 1] - 2;
      if (y1 - y0 < 4 || x1 - x0 < 4) continue;
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) carve(x, y);
      rooms.push({ i, j, x0, x1, y0, y1, cx: Math.floor((x0 + x1) / 2), cy: Math.floor((y0 + y1) / 2) });
    }
  }
  // ---------- 门洞：每间病房开 2 个口通向走廊 ----------
  for (const r of rooms) {
    const sides = ["up", "down", "left", "right"];
    // 打乱一下，别每间都开在同一侧
    for (let k = sides.length - 1; k > 0; k--) {
      const q = randInt(0, k); const t = sides[k]; sides[k] = sides[q]; sides[q] = t;
    }
    for (let k = 0; k < 2; k++) {
      const s = sides[k];
      if (s === "up") carve(randInt(r.x0 + 1, r.x1 - 1), lines[r.i] + 1);
      else if (s === "down") carve(randInt(r.x0 + 1, r.x1 - 1), lines[r.i + 1] - 1);
      else if (s === "left") carve(lines[r.j] + 1, randInt(r.y0 + 1, r.y1 - 1));
      else carve(lines[r.j + 1] - 1, randInt(r.y0 + 1, r.y1 - 1));
    }
  }

  // 出生点：最靠左上那间病房
  const r0 = rooms[0];
  const start = { x: r0.cx, y: r0.cy, floor: 0 };
  // 出口那间：离出生点最远的病房
  let far = rooms[0], fd = -1;
  for (const r of rooms) {
    const d = Math.abs(r.cx - start.x) + Math.abs(r.cy - start.y);
    if (d > fd) { fd = d; far = r; }
  }

  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return;
    if (grid[y][x] !== 0) return;
    props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  };

  // ---------- 水：随机几间病房整个被浸没 ----------
  const wetRooms = new Set();
  const wetN = Math.min(3, Math.max(1, Math.floor(rooms.length / 5)));
  for (let k = 0; k < wetN; k++) {
    const r = rooms[randInt(1, rooms.length - 1)];
    if (!r || wetRooms.has(r) || r === far) continue;
    wetRooms.add(r);
    for (let y = r.y0; y <= r.y1; y++) for (let x = r.x0; x <= r.x1; x++) {
      if (grid[y][x] === 0) water14h.add(x + "," + y);
    }
  }
  // 其余地面：一律是潮湿的（踩上去会有水声，但不是水）
  for (let y = 1; y < size - 1; y++) for (let x = 1; x < size - 1; x++) {
    if (grid[y][x] === 0 && !water14h.has(x + "," + y)) damp14h.add(x + "," + y);
  }

  // ---------- 物件 ----------
  // 急救柜：装着注射器和急救包 —— 但这些东西往往表现出异常效果
  for (const r of rooms) {
    const n = randInt(1, 2);
    for (let k = 0; k < n; k++) {
      const onTop = (k % 2 === 0);
      if (onTop) put(randInt(r.x0 + 1, r.x1 - 1), r.y0, "medcab14h");
      else put(r.x0, randInt(r.y0 + 1, r.y1 - 1), "medcab14h");
    }
    // 涂鸦：贴在病房的墙面上（一层自己长出来的，谁也读不懂）
    for (let k = 0; k < randInt(2, 4); k++) {
      const gx = (k % 2 === 0) ? randInt(r.x0, r.x1) : (randInt(0, 1) ? r.x0 - 1 : r.x1 + 1);
      const gy = (k % 2 === 0) ? (randInt(0, 1) ? r.y0 - 1 : r.y1 + 1) : randInt(r.y0, r.y1);
      if (gx < 1 || gy < 1 || gx >= size - 1 || gy >= size - 1) continue;
      if (grid[gy][gx] !== 1) continue;
      props.push({ x: gx, y: gy, floor: 0, type: "graffiti14h", seed: randInt(1, 9999) });
    }
    // 塌陷的天花板：地上落着碎片，抬头是一个洞 —— 但那里并非生路
    if (Math.random() < 0.55) put(randInt(r.x0 + 1, r.x1 - 1), randInt(r.y0 + 1, r.y1 - 1), "ceiling14h");
    // 鬼魂：伤员 / 医护人员
    if (Math.random() < 0.7) {
      const gp = { x: randInt(r.x0 + 1, r.x1 - 1), y: randInt(r.y0 + 1, r.y1 - 1), floor: 0, type: "ghost14h", kind: Math.random() < 0.5 ? "patient" : "nurse", seed: randInt(1, 9999) };
      if (grid[gp.y][gp.x] === 0) props.push(gp);
    }
  }
  // 走廊上也有几个飘着的
  for (let k = 0; k < 4; k++) {
    const cx = lines[randInt(0, R - 1)], cy = randInt(4, size - 5);
    if (grid[cy][cx] === 0) props.push({ x: cx, y: cy, floor: 0, type: "ghost14h", kind: Math.random() < 0.5 ? "patient" : "nurse", seed: randInt(1, 9999) });
  }

  // ---------- 出口：出口病房里那一段黑白相间的墙 ----------
  const ew = {
    y: far.cy,
    x0: Math.floor((far.x0 + far.x1) / 2) - 1,
    x1: Math.floor((far.x0 + far.x1) / 2) + 1,
  };
  for (let x = ew.x0; x <= ew.x1; x++) grid[ew.y][x] = 1;      // 一小段隔墙
  for (let x = ew.x0; x <= ew.x1; x++) water14h.delete(x + "," + ew.y);
  props.push({ x: Math.floor((ew.x0 + ew.x1) / 2), y: ew.y, floor: 0, type: "exitwall14h", toLevel: 287 });

  const floors = collectFloors(grid, size);
  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [],
    water14h, damp14h, rooms14h: rooms, exitWall14h: ew,
  };
  map.spawnPts = [start];
  return map;
}

window.PROP_DRAW = window.PROP_DRAW || {};

// ---------- 地面 / 墙 ----------
// 地面：潮湿的灰蓝水泥地，一格一块的接缝，上面有渗水的暗斑；
//       被水浸没的房间整格是浑水。
window.drawMashFloor = function (ctx, px, py, h, map, tx, ty) {
  const k = tx + "," + ty;
  const wet = map && map.water14h && map.water14h.has(k);
  if (wet) {
    ctx.fillStyle = "#4a5f66";
    ctx.fillRect(px, py, h, h);
    ctx.fillStyle = "rgba(150,190,200,0.30)";
    ctx.fillRect(px, py, h, h * 0.42);
    // 水面反光：一条会晃的亮线
    const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
    ctx.fillStyle = "rgba(220,240,245," + (0.14 + 0.06 * Math.sin(t * 1.4 + tx * 0.7 + ty * 0.5)).toFixed(3) + ")";
    ctx.fillRect(px, py + h * 0.20, h, 3);
    return true;
  }
  const alt = ((tx * 5 + ty * 3) % 4) === 0;
  ctx.fillStyle = alt ? "#5b6d75" : "#6e8189";
  ctx.fillRect(px, py, h, h);
  // 一格一块的接缝
  ctx.strokeStyle = "rgba(30,44,50,0.55)";
  ctx.lineWidth = 1;
  ctx.strokeRect(px + 0.5, py + 0.5, h - 1, h - 1);
  // 渗水的暗斑（固定的，不闪 —— 这一层已经够不安了）
  if (((tx * 7 + ty * 11) % 5) === 0) {
    ctx.fillStyle = "rgba(28,44,52,0.34)";
    ctx.beginPath();
    ctx.ellipse(px + h * 0.5, py + h * 0.62, h * 0.30, h * 0.17, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  return true;
};

// 墙：覆着蓝色瓷砖，满是污垢；上沿一条木梁（腐朽的木质天花板）
window.drawMashWall = function (ctx, px, py, h, map, tx, ty) {
  ctx.fillStyle = "#3d5a66";
  ctx.fillRect(px, py, h, h);
  // 瓷砖：横竖都是直线，一格四块
  ctx.strokeStyle = "rgba(220,235,240,0.20)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(px + 0.5, py + h / 2); ctx.lineTo(px + h - 0.5, py + h / 2);
  ctx.moveTo(px + h / 2, py + 0.5); ctx.lineTo(px + h / 2, py + h - 0.5);
  ctx.stroke();
  // 污垢：一道道往下淌的深色
  const s = (tx * 13 + ty * 7) % 6;
  if (s < 3) {
    ctx.fillStyle = "rgba(46,40,26,0.42)";
    ctx.fillRect(px + (h / 6) * s, py + h * 0.28, Math.max(2, h * 0.10), h * 0.55);
  }
  // 顶上那条腐朽的木梁
  ctx.fillStyle = "#4b3a26";
  ctx.fillRect(px, py, h, Math.max(3, h * 0.14));
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(px, py + Math.max(3, h * 0.14) - 2, h, 2);
  return true;
};

// ---------- 物件 ----------
// 急救柜：白铁皮柜 + 玻璃门，里面是注射器和急救包，门上印着褪了色的红十字
window.PROP_DRAW["medcab14h"] = function (ctx, p, T) {
  const w = T * 0.62, h = T * 0.80;
  ctx.fillStyle = "#c8ced2";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#9aa3a8";
  ctx.fillRect(-w / 2, -h / 2, w, h * 0.12);
  // 玻璃门
  ctx.fillStyle = "rgba(190,215,220,0.55)";
  ctx.fillRect(-w / 2 + 3, -h / 2 + h * 0.14, w - 6, h * 0.72);
  ctx.strokeStyle = "#7d868c"; ctx.lineWidth = 1;
  ctx.strokeRect(-w / 2 + 3.5, -h / 2 + h * 0.14, w - 7, h * 0.72);
  // 里面：两排注射器 + 一个急救包
  ctx.fillStyle = "#e8eef0";
  ctx.fillRect(-w / 2 + 6, -h * 0.16, w - 12, h * 0.20);
  ctx.fillStyle = "#d8dee2";
  ctx.fillRect(-w / 2 + 6, h * 0.10, w - 12, h * 0.22);
  ctx.strokeStyle = "#8d969b"; ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    const sx = -w / 2 + 8 + i * (w - 16) / 3;
    ctx.beginPath(); ctx.moveTo(sx, -h * 0.12); ctx.lineTo(sx, h * 0.02); ctx.stroke();
  }
  // 褪色的红十字
  ctx.fillStyle = "rgba(150,60,50,0.72)";
  ctx.fillRect(-T * 0.07, h * 0.13, T * 0.14, T * 0.045);
  ctx.fillRect(-T * 0.022, h * 0.105, T * 0.045, T * 0.14);
  // 柜子底下的阴影
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(-w / 2, h / 2 - 3, w, 3);
};

// 涂鸦：贴在墙上的一团乱线条 —— 读不出任何意思，是这个层级自己长出来的
window.PROP_DRAW["graffiti14h"] = function (ctx, p, T) {
  const s = p.seed || 7;
  ctx.save();
  ctx.strokeStyle = "rgba(30,34,30,0.72)";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.beginPath();
  let x = -T * 0.32, y = -T * 0.10;
  ctx.moveTo(x, y);
  for (let i = 0; i < 5; i++) {
    const a = ((s * (i + 3)) % 17) / 17;
    x += (a - 0.2) * T * 0.30;
    y += (((s * (i + 5)) % 11) / 11 - 0.5) * T * 0.42;
    ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.strokeStyle = "rgba(150,70,40,0.55)";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-T * 0.26, T * 0.16);
  ctx.lineTo(T * 0.02, -T * 0.16);
  ctx.lineTo(T * 0.28, T * 0.14);
  ctx.stroke();
  ctx.restore();
};

// 塌陷的天花板：地上落着碎木屑，抬头是一个黑洞 —— 爬上去也出不去
window.PROP_DRAW["ceiling14h"] = function (ctx, p, T) {
  // 碎木屑
  ctx.fillStyle = "#4a3826";
  for (let i = 0; i < 5; i++) {
    const a = (i * 2.399 + (p.x * 3 + p.y)) % (Math.PI * 2);
    const r = T * (0.12 + ((i * 7) % 5) * 0.045);
    ctx.save();
    ctx.translate(Math.cos(a) * r, Math.sin(a) * r);
    ctx.rotate(a);
    ctx.fillRect(-T * 0.07, -T * 0.018, T * 0.14, T * 0.036);
    ctx.restore();
  }
  ctx.fillStyle = "#3a2c1e";
  ctx.fillRect(-T * 0.10, -T * 0.05, T * 0.20, T * 0.05);
  // 上方那个洞：一片黑，边缘是断裂的木梁
  ctx.fillStyle = "rgba(6,8,10,0.86)";
  ctx.beginPath();
  ctx.ellipse(0, -T * 0.28, T * 0.26, T * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#584428";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, -T * 0.28, T * 0.26, T * 0.16, 0, 0, Math.PI * 2);
  ctx.stroke();
};

// 鬼魂：伤员 / 医护人员。半透明，慢慢地上下飘 —— 碰到就穿过去。
window.PROP_DRAW["ghost14h"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
  const ph = (p.seed || 1) % 10;
  const bob = Math.sin(t * 0.9 + ph) * T * 0.05;
  const sway = Math.sin(t * 0.5 + ph * 1.7) * T * 0.02;
  ctx.save();
  ctx.translate(sway, bob);
  ctx.globalAlpha = 0.42 + 0.08 * Math.sin(t * 1.3 + ph);
  // 身体：病号服 / 护士服
  const isNurse = p.kind === "nurse";
  ctx.fillStyle = isNurse ? "#dfe8ec" : "#c9d6da";
  ctx.beginPath();
  ctx.moveTo(-T * 0.17, T * 0.30);
  ctx.lineTo(-T * 0.13, -T * 0.14);
  ctx.quadraticCurveTo(0, -T * 0.24, T * 0.13, -T * 0.14);
  ctx.lineTo(T * 0.17, T * 0.30);
  ctx.closePath();
  ctx.fill();
  // 头：微微歪着
  ctx.fillStyle = isNurse ? "#eef4f6" : "#dbe4e8";
  ctx.beginPath();
  ctx.arc(T * 0.01, -T * 0.26, T * 0.11, 0, Math.PI * 2);
  ctx.fill();
  // 眼窝：两个黑点（有些形体的畸形程度不是人能有的 —— 五官的位置是错的）
  ctx.fillStyle = "rgba(20,26,30,0.75)";
  const off = ((p.seed || 1) % 3) * T * 0.03;
  ctx.beginPath(); ctx.arc(-T * 0.04, -T * 0.28 + off, T * 0.022, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(T * 0.06, -T * 0.27 - off, T * 0.022, 0, Math.PI * 2); ctx.fill();
  // 护士帽 / 绷带
  if (isNurse) {
    ctx.fillStyle = "#f2f6f8";
    ctx.fillRect(-T * 0.08, -T * 0.38, T * 0.16, T * 0.05);
  } else {
    ctx.fillStyle = "rgba(226,232,234,0.85)";
    ctx.fillRect(-T * 0.11, -T * 0.20, T * 0.22, T * 0.045);
  }
  // 下摆散成一团雾，没有腿
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = isNurse ? "#e8f0f4" : "#d6e0e4";
  ctx.beginPath();
  ctx.ellipse(0, T * 0.32, T * 0.19, T * 0.09, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

// 出口：一节黑白相间的墙 —— 和 Level 0 的墙纸同源，只是颜色被抽干了
window.PROP_DRAW["exitwall14h"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
  ctx.fillStyle = "#e9ecea";
  ctx.fillRect(-T / 2, -T / 2, T, T);
  // 黑白条纹（固定的，不闪 —— 靠"白得反常"来认，不靠闪烁）
  ctx.fillStyle = "#1b1e20";
  for (let i = 0; i < 4; i++) ctx.fillRect(-T / 2, -T / 2 + i * (T / 4), T, T / 8);
  // 一圈冷白的光：在一片脏蓝瓷砖里，它是唯一干净的东西
  const pulse = 0.30 + 0.22 * Math.sin(t * 1.6);
  ctx.strokeStyle = "rgba(236,244,248," + pulse.toFixed(3) + ")";
  ctx.lineWidth = 3;
  ctx.strokeRect(-T / 2 + 1.5, -T / 2 + 1.5, T - 3, T - 3);
  ctx.fillStyle = "rgba(255,255,255," + (0.10 + 0.06 * Math.sin(t * 1.6)).toFixed(3) + ")";
  ctx.fillRect(-T / 2, -T / 2, T, T);
};
