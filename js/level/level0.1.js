// ===========================================================
// Level 0.1 —— 天顶站
// 一座未来的空间站，但里面没有人 —— 没有实体，也没有除你之外的生物，
// 只有少见的机器人。有些设备已经失灵，于是有些区域极寒（结冰）、
// 极热，或者完全黑暗。
//   走廊 10 条（6 条较长）+ 走廊连接着的各种房间（卧室 / 厨房）
//   研究航天数据的区域 2 个 —— 里面能找到能量棒，回血也回理智
//   桥廊区 3 个 —— 一座桥，上下深不见底，桥面是铁网（有空气墙）
// 入口：Level 0 地面上的一处空洞
// 出口：桥廊区桥的尽头是一个空洞，下方能看见 Level 0 的景象 —— 跳下去就回去
// ===========================================================
"use strict";

// 配色登记放在 levelBatch.js 的 BATCHTILE 里（顺序无关），这里再兜一次：
// 万一 BATCHTILE 没这份，地面/墙会掉到 drawPipeWall() 兜底 —— 整层变成 Level 2 的管道。
(function () {
  const v = ["#c8ccd2", "#b8bcc4", "#5a6672"];
  if (typeof regTile === "function") regTile("zenith", v);
  else { (window.__NEWTILE_EXTRA = window.__NEWTILE_EXTRA || {})["zenith"] = v; }
})();

function generateZenithMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const props = [];
  // 深渊（桥两侧）：不是墙，是"上下都望不到底"的黑 —— 走得进去吗？走不进去。
  const voidZen = new Set();
  // 桥面：铁网
  const bridgeZen = new Set();
  // 房间气候：ice 结冰 / heat 极热 / dark 完全黑暗 / 其余恒温
  const zoneZen = new Map();

  // ---------- 走廊：6 条较长的（3 横 3 竖）+ 4 条较短的 = 10 条 ----------
  const lanes = [14, Math.floor(size / 2), size - 15];   // 三条主干的位置
  const W = 3;                                            // 走廊宽 3 格
  const carveH = (y) => { for (let x = 3; x < size - 3; x++) for (let d = -1; d <= 1; d++) grid[y + d][x] = 0; };
  const carveV = (x) => { for (let y = 3; y < size - 3; y++) for (let d = -1; d <= 1; d++) grid[y][x + d] = 0; };
  for (const y of lanes) carveH(y);
  for (const x of lanes) carveV(x);
  // 4 条短的：连接主干之间的中段，让房间不必绕远
  const mid = (a, b) => Math.floor((a + b) / 2);
  carveV(mid(lanes[0], lanes[1]));
  carveV(mid(lanes[1], lanes[2]));
  carveH(mid(lanes[0], lanes[1]));
  carveH(mid(lanes[1], lanes[2]));

  // ---------- 房间：塞在走廊围出来的 4 个大区块里 ----------
  // 每个区块 2 间 —— 卧室 / 厨房 / 研究区 / 储藏
  const roomKinds = ["dorm", "galley", "lab", "dorm", "galley", "lab", "store", "dorm"];
  const rooms = [];
  const spans = [[lanes[0], lanes[1]], [lanes[1], lanes[2]]];
  let ri = 0;
  for (const [ya, yb] of spans) {
    for (const [xa, xb] of spans) {
      for (let k = 0; k < 2; k++) {
        const rw = 11, rh = 9;
        const rx = xa + 3 + k * (rw + 2);
        const ry = ya + 3 + ((ri % 2) ? (rh + 2) : 0);
        if (rx + rw >= xb - 1 || ry + rh >= yb - 1) continue;
        carveRoom(grid, size, rx, ry, rw, rh);
        // 门口：从房间朝最近的主干开一个口
        const cx = rx + Math.floor(rw / 2), cy2 = ry + Math.floor(rh / 2);
        for (let x = rx - 2; x <= rx; x++) if (x > 0) grid[cy2][x] = 0;
        for (let y = ry - 2; y <= ry; y++) if (y > 0) grid[y][cx] = 0;
        rooms.push({ x: rx, y: ry, w: rw, h: rh, kind: roomKinds[ri % roomKinds.length] });
        ri++;
      }
    }
  }

  // ---------- 桥廊区 3 个：把三段走廊换成桥，两侧挖成深渊 ----------
  const bridges = [];
  const mkBridge = (horizontal, a, b, fixed) => {
    for (let t = a; t <= b; t++) {
      // 两侧各挖到 3 格：以前只挖 1 格，桥外面紧挨着就是舱壁，
      // 看着像"墙上架了条桥"，而不是悬在深渊上。现在整条带都是虚空。
      // 注意只把原来是墙的挖成深渊 —— 房间地面保持原样，不会被吃掉。
      for (let d = -3; d <= 3; d++) {
        const x = horizontal ? t : fixed + d;
        const y = horizontal ? fixed + d : t;
        if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) continue;
        if (Math.abs(d) <= 1) { grid[y][x] = 0; bridgeZen.add(x + "," + y); }
        else if (grid[y][x] !== 0) { voidZen.add(x + "," + y); }   // 只把原来是墙的挖成深渊
      }
    }
    const ex = horizontal ? b : fixed, ey = horizontal ? fixed : b;
    bridges.push({ horizontal, a, b, fixed, ex, ey });
  };
  // 三段：一条横的、两条竖的，各在主干的中段
  mkBridge(true, lanes[0] + 4, lanes[1] - 4, lanes[0]);
  mkBridge(false, lanes[0] + 4, lanes[1] - 4, lanes[2]);
  mkBridge(false, lanes[1] + 4, lanes[2] - 4, lanes[0]);

  const floors = collectFloors(grid, size);
  const start = { x: lanes[0] + 1, y: Math.floor(size / 2), floor: 0 };

  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return null;
    if (grid[y][x] !== 0) return null;
    const p = Object.assign({ x, y, floor: 0, type }, extra || {});
    props.push(p);
    return p;
  };

  // ---------- 房间内部：按用途摆东西（没有一样是"桌子"）----------
  const climate = ["ice", "heat", "dark"];
  let ci = 0;
  for (const r of rooms) {
    // 三分之一的房间设备失灵 —— 结冰 / 极热 / 全黑
    const bad = (ci % 3) === 0 ? climate[(ci / 3 | 0) % climate.length] : null;
    if (bad) {
      for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) zoneZen.set(x + "," + y, bad);
    }
    const cx = r.x + Math.floor(r.w / 2), cy2 = r.y + Math.floor(r.h / 2);
    if (r.kind === "dorm") {
      // 卧室：一排睡舱
      for (let i = 0; i < 3; i++) put(r.x + 1, r.y + 1 + i * 3, "zenithpod");
    } else if (r.kind === "galley") {
      // 厨房：料理台 + 两台配给机
      put(r.x + 1, r.y + 1, "zenithgalley");
      put(r.x + r.w - 2, r.y + 1, "zenithdisp");
      put(r.x + r.w - 2, r.y + r.h - 2, "zenithdisp");
    } else if (r.kind === "lab") {
      // 研究航天数据的区域：一整面数据屏 + 控制台，能量棒就在这儿
      put(cx - 1, r.y + 1, "zenithscreen");
      put(cx, r.y + 1, "zenithscreen");
      put(cx + 1, r.y + 1, "zenithscreen");
      put(cx, cy2, "zenithconsole");
      put(cx - 2, cy2 + 2, "zenithbar");
      put(cx + 2, cy2 + 2, "zenithbar");
    } else {
      // 储藏：几个货箱
      put(r.x + 1, r.y + 1, "zenithcrate");
      put(r.x + 3, r.y + 1, "zenithcrate");
      put(r.x + 1, r.y + r.h - 2, "zenithcrate");
    }
    ci++;
  }

  // ---------- 走廊上的机器人：整座站里除你之外唯一会动的东西 ----------
  const robotLines = [
    "机器人转过来看了你一眼，又转回去。它没有脸，可你就是知道它在看你。",
    "「舱压正常。」它说。可你脚下的地板正在结冰。",
    "它举着一块面板，屏幕上是一片星空 —— 没有一颗是你认得的。",
    "机器人停在走廊正中，一动不动。它的指示灯早就不闪了。",
  ];
  let rbi = 0;
  for (const y of lanes) {
    for (let k = 0; k < 2; k++) {
      const x = lanes[0] + 6 + k * 22 + ((y / 7) | 0) % 5;
      const p = put(x, y, "zenithrobot", { line: robotLines[rbi++ % robotLines.length] });
      if (!p) put(x, y + 1, "zenithrobot", { line: robotLines[rbi++ % robotLines.length] });
    }
  }
  // 走廊墙上的管线（失灵的设备 —— 有的在冒白汽）
  for (let i = 0; i < 26; i++) {
    const x = randInt(4, size - 5), y = randInt(4, size - 5);
    put(x, y, "zenithpipe", { steam: Math.random() < 0.35 });
  }

  // ---------- 出口：桥尽头那个空洞 ----------
  // 桥廊区桥的尽头是一个空洞，下方可以看见 Level 0 的景象 —— 跳下去就回去。
  for (const b of bridges) {
    const p = put(b.ex, b.ey, "zenithhole", { toLevel: 0 });
    if (!p) {
      // 尽头那一格被占了就往回退一格再放 —— 出口必须存在，不然这一层出不去
      const bx = b.horizontal ? b.ex - 1 : b.ex, by = b.horizontal ? b.ey : b.ey - 1;
      put(bx, by, "zenithhole", { toLevel: 0 });
    }
  }

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms,
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [],
    voidZen, bridgeZen, zoneZen, bridges,
  };
  map.spawnPts = [start];
  return map;
}
window.generateZenithMap = generateZenithMap;

// ---------- 地面：空间站的金属板 / 桥的铁网 / 深渊 / 结冰·极热·全黑 ----------
window.drawZenithFloor = function (ctx, px, py, S, map, tx, ty) {
  const k = tx + "," + ty;
  if (map.voidZen && map.voidZen.has(k)) {
    // 深渊：上下都望不到底。不是纯黑 —— 留一点冷色，才看得出"深"
    ctx.fillStyle = "#0a0d12"; ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(40,60,80,0.18)";
    ctx.fillRect(px, py, S, Math.max(2, S * 0.10));
    return true;
  }
  const z = map.zoneZen && map.zoneZen.get(k);
  // 桥面先画：黑底 + 灰色网格（以前是白底套黑网格，看着像块白板子）
  if (map.bridgeZen && map.bridgeZen.has(k)) {
    ctx.fillStyle = "#0d1014"; ctx.fillRect(px, py, S, S);          // 底：黑
    ctx.strokeStyle = "rgba(150,158,170,0.85)"; ctx.lineWidth = 1.4;  // 网格：灰
    for (let i = 1; i < 4; i++) {
      ctx.beginPath(); ctx.moveTo(px, py + S * i / 4); ctx.lineTo(px + S, py + S * i / 4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px + S * i / 4, py); ctx.lineTo(px + S * i / 4, py + S); ctx.stroke();
    }
    ctx.strokeStyle = "rgba(190,198,210,0.55)";
    ctx.strokeRect(px + 1.5, py + 1.5, S - 3, S - 3);
    return true;
  }
  let base = "#c8ccd2";
  if (z === "ice") base = "#bcd4e0";
  else if (z === "heat") base = "#dcc0a4";
  else if (z === "dark") base = "#4a4f57";
  ctx.fillStyle = base; ctx.fillRect(px, py, S, S);
  // 金属板的拼缝
  ctx.strokeStyle = "rgba(0,0,0,0.12)"; ctx.lineWidth = 1;
  ctx.strokeRect(px + 0.5, py + 0.5, S - 1, S - 1);
  if (z === "ice") {                       // 结冰：白霜 + 冰晶
    ctx.fillStyle = "rgba(255,255,255,0.42)"; ctx.fillRect(px, py, S, S);
    ctx.strokeStyle = "rgba(190,225,240,0.85)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(px + 4, py + S - 5); ctx.lineTo(px + S - 5, py + 5); ctx.stroke();
  } else if (z === "heat") {               // 极热：地砖被烤出的橙色纹路
    ctx.fillStyle = "rgba(220,120,50,0.20)"; ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(255,180,90,0.16)"; ctx.fillRect(px, py + S * 0.6, S, S * 0.4);
  } else if (z === "dark") {               // 全黑：设备失灵，灯全灭了
    ctx.fillStyle = "rgba(0,0,0,0.45)"; ctx.fillRect(px, py, S, S);
  } else if (((tx * 5 + ty * 3) % 7) === 0) {
    ctx.fillStyle = "rgba(255,255,255,0.10)"; ctx.fillRect(px, py, S, S * 0.3);
  }
  return true;
};

// ---------- 墙体：冷蓝灰的舱壁（不黑，看得清轮廓）----------
window.drawZenithWall = function (ctx, px, py, S, map, tx, ty) {
  const k = tx + "," + ty;
  const z = map.zoneZen && map.zoneZen.get(k);
  let base = "#5a6672";
  if (z === "ice") base = "#6d8899";
  else if (z === "heat") base = "#8a6448";
  else if (z === "dark") base = "#33383f";
  ctx.fillStyle = base; ctx.fillRect(px, py, S, S);
  ctx.fillStyle = "rgba(255,255,255,0.12)"; ctx.fillRect(px, py, S, Math.max(2, S * 0.16));
  ctx.fillStyle = "rgba(0,0,0,0.30)"; ctx.fillRect(px, py + S - Math.max(2, S * 0.14), S, Math.max(2, S * 0.14));
  // 舱壁的分段铆钉
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.fillRect(px + 2, py + S * 0.45, 2, 2);
  ctx.fillRect(px + S - 4, py + S * 0.45, 2, 2);
  if (z === "ice") { ctx.fillStyle = "rgba(230,245,255,0.35)"; ctx.fillRect(px, py, S, Math.max(2, S * 0.10)); }
  return true;
};

window.PROP_DRAW = window.PROP_DRAW || {};

// 睡舱：嵌在墙里的一个 capsule，不是床也不是桌子
window.PROP_DRAW["zenithpod"] = function (ctx, p, T) {
  ctx.fillStyle = "#8d949c"; ctx.fillRect(-T * 0.40, -T * 0.34, T * 0.80, T * 0.68);
  ctx.fillStyle = "#5f666e"; ctx.fillRect(-T * 0.34, -T * 0.28, T * 0.68, T * 0.34);
  ctx.fillStyle = "rgba(150,220,240,0.55)"; ctx.fillRect(-T * 0.30, -T * 0.24, T * 0.60, T * 0.10);
  ctx.fillStyle = "#cdd4da"; ctx.fillRect(-T * 0.34, T * 0.08, T * 0.68, T * 0.18);
  ctx.strokeStyle = "#3f454b"; ctx.lineWidth = 1; ctx.strokeRect(-T * 0.40, -T * 0.34, T * 0.80, T * 0.68);
};

// 厨房的料理台：一条不锈钢台面 + 两个灶眼
window.PROP_DRAW["zenithgalley"] = function (ctx, p, T) {
  ctx.fillStyle = "#9aa2aa"; ctx.fillRect(-T * 0.42, -T * 0.22, T * 0.84, T * 0.44);
  ctx.fillStyle = "#c3cad0"; ctx.fillRect(-T * 0.42, -T * 0.28, T * 0.84, T * 0.08);
  ctx.fillStyle = "#4a5058";
  ctx.beginPath(); ctx.arc(-T * 0.16, 0, T * 0.08, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(T * 0.16, 0, T * 0.08, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#5f666e"; ctx.lineWidth = 1;
  ctx.strokeRect(-T * 0.42, -T * 0.22, T * 0.84, T * 0.44);
};

// 配给机：立柜 + 出货口
window.PROP_DRAW["zenithdisp"] = function (ctx, p, T) {
  ctx.fillStyle = "#6e767e"; ctx.fillRect(-T * 0.30, -T * 0.42, T * 0.60, T * 0.84);
  ctx.fillStyle = "#2a2e34"; ctx.fillRect(-T * 0.22, -T * 0.34, T * 0.44, T * 0.34);
  ctx.fillStyle = "#7fd8a0"; ctx.fillRect(-T * 0.18, -T * 0.30, T * 0.36, T * 0.05);
  ctx.fillStyle = "#1b1e22"; ctx.fillRect(-T * 0.20, T * 0.16, T * 0.40, T * 0.14);
  ctx.strokeStyle = "#454b52"; ctx.lineWidth = 1;
  ctx.strokeRect(-T * 0.30, -T * 0.42, T * 0.60, T * 0.84);
};

// 研究区的数据屏：滚动的航天数据
window.PROP_DRAW["zenithscreen"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  ctx.fillStyle = "#20242a"; ctx.fillRect(-T * 0.44, -T * 0.34, T * 0.88, T * 0.68);
  ctx.fillStyle = "#0d1a22"; ctx.fillRect(-T * 0.40, -T * 0.30, T * 0.80, T * 0.60);
  const seed = ((p.x || 0) * 7 + (p.y || 0) * 13);
  for (let i = 0; i < 4; i++) {
    const yy = -T * 0.24 + i * T * 0.14;
    const off = ((t * 12 + seed + i * 31) % 100) / 100;
    ctx.fillStyle = i === 1 ? "rgba(120,220,255,0.85)" : "rgba(90,170,200,0.45)";
    ctx.fillRect(-T * 0.36 + off * T * 0.2, yy, T * (0.20 + ((seed + i) % 5) * 0.09), T * 0.05);
  }
  ctx.strokeStyle = "#3d434a"; ctx.lineWidth = 1;
  ctx.strokeRect(-T * 0.44, -T * 0.34, T * 0.88, T * 0.68);
};

// 控制台：斜面操作台 + 一排指示灯
window.PROP_DRAW["zenithconsole"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  ctx.fillStyle = "#767e86"; ctx.fillRect(-T * 0.40, -T * 0.18, T * 0.80, T * 0.36);
  ctx.fillStyle = "#4c525a"; ctx.fillRect(-T * 0.40, T * 0.04, T * 0.80, T * 0.14);
  ctx.fillStyle = "#22262c"; ctx.fillRect(-T * 0.34, -T * 0.30, T * 0.68, T * 0.14);
  for (let i = 0; i < 5; i++) {
    const on = ((Math.floor(t * 1.6) + i + (p.x || 0)) % 3) !== 0;
    ctx.fillStyle = on ? (i === 2 ? "#ffd36a" : "#6fdc9a") : "#2f353c";
    ctx.beginPath(); ctx.arc(-T * 0.26 + i * T * 0.13, T * 0.11, T * 0.035, 0, Math.PI * 2); ctx.fill();
  }
};

// 能量棒： recovers 生命值和理智值
window.PROP_DRAW["zenithbar"] = function (ctx, p, T) {
  ctx.fillStyle = "#d8b45a"; ctx.fillRect(-T * 0.26, -T * 0.11, T * 0.52, T * 0.22);
  ctx.fillStyle = "#f2e08a"; ctx.fillRect(-T * 0.26, -T * 0.11, T * 0.52, T * 0.07);
  ctx.fillStyle = "#3a3226"; ctx.fillRect(-T * 0.06, -T * 0.11, T * 0.12, T * 0.22);
  ctx.strokeStyle = "#8a6d2a"; ctx.lineWidth = 1;
  ctx.strokeRect(-T * 0.26, -T * 0.11, T * 0.52, T * 0.22);
  ctx.fillStyle = "rgba(255,240,180,0.5)"; ctx.fillRect(-T * 0.02, -T * 0.16, T * 0.04, T * 0.05);
};

// 货箱：捆扎过的金属箱
window.PROP_DRAW["zenithcrate"] = function (ctx, p, T) {
  ctx.fillStyle = "#7b7160"; ctx.fillRect(-T * 0.34, -T * 0.30, T * 0.68, T * 0.60);
  ctx.fillStyle = "#8f8471"; ctx.fillRect(-T * 0.34, -T * 0.30, T * 0.68, T * 0.12);
  ctx.strokeStyle = "#4e4638"; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-T * 0.34, -T * 0.08); ctx.lineTo(T * 0.34, -T * 0.08);
  ctx.moveTo(0, -T * 0.30); ctx.lineTo(0, T * 0.30);
  ctx.stroke();
};

// 机器人：整座站里唯一会动的东西
window.PROP_DRAW["zenithrobot"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  const pulse = 0.45 + 0.45 * Math.sin(t * 2.2 + (p.x || 0));
  ctx.fillStyle = "#4a5058";                                   // 底盘
  ctx.beginPath(); ctx.ellipse(0, T * 0.24, T * 0.22, T * 0.08, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#9aa2aa"; ctx.fillRect(-T * 0.16, -T * 0.24, T * 0.32, T * 0.48);  // 躯干
  ctx.fillStyle = "#c3cad0";                                   // 头
  ctx.beginPath(); ctx.arc(0, -T * 0.32, T * 0.15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(120,220,255," + (0.35 + 0.5 * pulse).toFixed(3) + ")";   // 独眼
  ctx.beginPath(); ctx.arc(0, -T * 0.32, T * 0.06, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#6a7078"; ctx.lineWidth = 2;              // 两条手臂
  ctx.beginPath();
  ctx.moveTo(-T * 0.16, -T * 0.10); ctx.lineTo(-T * 0.30, T * 0.06);
  ctx.moveTo(T * 0.16, -T * 0.10); ctx.lineTo(T * 0.30, T * 0.06);
  ctx.stroke();
};

// 墙上的管线：失灵的设备，有的还在冒白汽
window.PROP_DRAW["zenithpipe"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  ctx.fillStyle = "#8a9098"; ctx.fillRect(-T * 0.44, -T * 0.09, T * 0.88, T * 0.18);
  ctx.fillStyle = "#5f666e"; ctx.fillRect(-T * 0.44, -T * 0.09, T * 0.88, T * 0.05);
  ctx.fillStyle = "#a8aeb6";
  ctx.fillRect(-T * 0.10, -T * 0.13, T * 0.20, T * 0.26);
  if (p.steam) {
    const ph = (t * 0.9 + (p.x || 0) * 0.7) % 1;
    ctx.fillStyle = "rgba(235,245,250," + (0.34 * (1 - ph)).toFixed(3) + ")";
    ctx.beginPath(); ctx.arc(0, -T * 0.18 - ph * T * 0.42, T * (0.10 + ph * 0.14), 0, Math.PI * 2); ctx.fill();
  }
};

// 桥尽头的空洞：下方能看见 Level 0 的黄色地毯
window.PROP_DRAW["zenithhole"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  const pulse = 0.55 + 0.35 * Math.sin(t * 1.8);
  ctx.fillStyle = "#07090c";
  ctx.beginPath(); ctx.ellipse(0, 0, T * 0.42, T * 0.36, 0, 0, Math.PI * 2); ctx.fill();
  // 洞底：Level 0 的那片黄 —— 不是黑，是"往下望能看见它"
  const gr = ctx.createRadialGradient(0, 0, 1, 0, 0, T * 0.38);
  gr.addColorStop(0, "rgba(226,206,110,0.90)");
  gr.addColorStop(1, "rgba(150,130,60,0.10)");
  ctx.fillStyle = gr;
  ctx.beginPath(); ctx.ellipse(0, 0, T * 0.32, T * 0.26, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "rgba(255,236,150," + pulse.toFixed(3) + ")"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(0, 0, T * 0.42, T * 0.36, 0, 0, Math.PI * 2); ctx.stroke();
};

// ---------- Level 0 地面上那处空洞（Level 0.1 的入口）----------
// 它长在 Level 0 的黄地毯上，所以画法和天顶站里那些金属物件不一样：
// 一圈被撕开的地毯 + 底下望不到底的黑。
window.PROP_DRAW["hole01"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  const pl = 0.5 + 0.3 * Math.sin(t * 1.7);
  // 撕开的地毯边：参差，不是规整的圆
  ctx.fillStyle = "#8a7238";
  ctx.beginPath();
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2;
    const r = T * (0.34 + ((i * 7 + (p.x || 0)) % 5) * 0.022);
    const x = Math.cos(a) * r, y = Math.sin(a) * r * 0.82;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath(); ctx.fill();
  // 洞：底下是空的
  ctx.fillStyle = "#08090c";
  ctx.beginPath(); ctx.ellipse(0, 0, T * 0.28, T * 0.23, 0, 0, Math.PI * 2); ctx.fill();
  // 洞底透上来的一点冷光 —— 那是空间站的灯，不是 Level 0 的黄
  const g = ctx.createRadialGradient(0, T * 0.04, 1, 0, T * 0.04, T * 0.24);
  g.addColorStop(0, "rgba(150,200,235,0.55)"); g.addColorStop(1, "rgba(150,200,235,0)");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(0, T * 0.04, T * 0.20, T * 0.15, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "rgba(200,220,240," + pl.toFixed(3) + ")"; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.ellipse(0, 0, T * 0.30, T * 0.25, 0, 0, Math.PI * 2); ctx.stroke();
};
