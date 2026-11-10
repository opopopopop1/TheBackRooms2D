// ===========================================================
// Level 5.3 —— 普罗米修斯藏书馆
//
// 一座典雅的图书馆，数百条走廊向外延伸。墙是大理石的，廊柱是不知名的
// 凝灰岩，书架上方挂着文艺复兴风格的画。看着像无限延伸，其实只有七层，
// 每层靠一段木质楼梯上下。
//
// 效应：图书馆像是有意识 —— 待够一两个钟头，它就开始往外抽记忆，
//       优先抽较新和"重要"的，同时你越来越头痛，自己却察觉不到。
//       被抽走的记忆会封进某本书里，编排没有规律，基本找不回来。
//       强烈建议停留不要超过一小时。
//
// 出口：某条走廊的尽头是死路，墙上嵌着一扇木门 —— 推开就回到入口处。
// ===========================================================
"use strict";

if (typeof regTile === "function") regTile("prometheus", ["#cfc3a4", "#b9ab88"]);
else { (window.__NEWTILE_EXTRA = window.__NEWTILE_EXTRA || {})["prometheus"] = ["#cfc3a4", "#b9ab88"]; }

function generateLibrary53Map(level) {
  const size = mapSizeFor(level);
  const N = 7;                        // 七层
  const layers = [], floorsArr = [];
  const props = [];
  const put = (x, y, floor, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return;
    props.push(Object.assign({ x, y, floor, type }, extra || {}));
  };

  const midY = Math.floor(size / 2);

  for (let f = 0; f < N; f++) {
    const grid = makeGrid(size);
    // ---- 大厅：一层就是一整片，靠书架排切出一条条通道 ----
    carveRoom(grid, size, 4, 4, size - 8, size - 8);
    // ---- 走廊：横贯正中，宽 3 格 ----
    for (let y = midY - 1; y <= midY + 1; y++)
      for (let x = 5; x < size - 5; x++) grid[y][x] = 0;
    // ---- 书架排：竖直的一条条，在走廊那里断开 ----
    for (let x = 8; x < size - 8; x += 6) {
      for (let y = 6; y < size - 6; y++) {
        if (y >= midY - 1 && y <= midY + 1) continue;      // 走廊留空
        // 每排留两个缺口，免得整层被切成互不相通的竖条
        if ((y - 6) % 9 === 4) continue;
        grid[y][x] = 1;
      }
    }
    // ---- 阅览室：四角各一间，朝走廊开口 ----
    const roomsXY = [[5, 5], [size - 12, 5], [5, size - 12], [size - 12, size - 12]];
    for (const [rx, ry] of roomsXY) {
      for (let y = ry; y < ry + 6; y++)
        for (let x = rx; x < rx + 6; x++) if (x > 0 && y > 0 && x < size && y < size) grid[y][x] = 0;
      // 朝走廊开一个口
      const dy = ry < midY ? ry + 5 : ry;
      for (let y = Math.min(dy, midY); y <= Math.max(dy, midY); y++) grid[y][rx + 3] = 0;
    }
    layers.push(grid);
  }

  // ---- 木质楼梯：每层同一坐标，上下两层都得挖开 ----
  const R = 3;
  const ramps = [];
  const rampSpots = [
    { x: 5, y: 5 }, { x: size - 9, y: 5 }, { x: 5, y: size - 9 },
    { x: size - 9, y: size - 9 }, { x: Math.floor(size / 2) - 1, y: 5 },
    { x: Math.floor(size / 2) - 1, y: size - 9 },
  ];
  for (let i = 0; i < N - 1; i++) {
    const s = rampSpots[i % rampSpots.length];
    const x = Math.max(2, Math.min(size - R - 3, s.x));
    const y = Math.max(2, Math.min(size - R - 3, s.y));
    for (const g of [layers[i], layers[i + 1]]) carveRoom(g, size, x, y, R, R);
    ramps.push({
      x, y, w: R, h: R,
      floorA: i, floorB: i + 1,
      aPos: { x: x + 1, y: y + 1 },
      bPos: { x: x + 1, y: y + 1 },
    });
    put(x + 1, y + 1, i, "stair53");
    put(x + 1, y + 1, i + 1, "stair53");
  }

  // ---- 出生点：第 0 层走廊正中 ----
  const start = { x: Math.floor(size / 2), y: midY, floor: 0 };
  for (let f = 0; f < N; f++) {
    layers[f][start.y][start.x] = 0;
    ensureAllConnected(layers[f], size, { x: start.x, y: start.y });
    floorsArr.push(collectFloors(layers[f], size));
  }

  // ---- 书架（贴着书架排）/ 廊柱 / 画作 / 散落的书 ----
  const shelfKeys = new Set();
  for (let f = 0; f < N; f++) {
    const grid = layers[f];
    for (let y = 1; y < size - 1; y++)
      for (let x = 1; x < size - 1; x++) {
        if (grid[y][x] !== 1) continue;
        // 墙格旁边有地板 = 这是书架的侧面，可以在这一格摆上书
        if (grid[y][x - 1] === 0 || grid[y][x + 1] === 0) shelfKeys.add(x + "," + y);
      }
    let n = 0;
    for (const k of shelfKeys) {
      const [x, y] = k.split(",").map(Number);
      if (n++ % 3 === 0) put(x, y, f, "shelf53");
    }
    shelfKeys.clear();
    // 廊柱：沿走廊立着
    for (let x = 7; x < size - 7; x += 7) put(x, midY - 1, f, "column53");
    // 画作：挂在大厅最外圈的墙上
    for (let i = 0; i < 5; i++) {
      const t = floorsArr[f][randInt(0, floorsArr[f].length - 1)];
      if (t) put(t.x, 4, f, "painting53");
    }
    // 散落的书：地上的一册
    for (let i = 0; i < 3; i++) {
      const t = floorsArr[f][randInt(0, floorsArr[f].length - 1)];
      if (t) put(t.x, t.y, f, "book53");
    }
  }

  // ---- 出口：第 0 层走廊尽头，墙上嵌着一扇木门 ----
  const exitDoor = { type: "door53", x: size - 6, y: midY, floor: 0,
    toLevel: 5, tip: "走廊的尽头是死路 —— 墙上嵌着一扇木门" };
  props.push(exitDoor);

  const map = {
    size, level, doubleStory: false,
    layers, floors: floorsArr, rooms: [],
    start, exit: null,
    doors: [], ramps, redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [],
    door53: exitDoor,
    lib53: 0,                       // 逗留计时（记忆抽取的潜伏期）
  };
  map.spawnPts = [start];
  return map;
}
window.generateLibrary53Map = generateLibrary53Map;

// ---------- 地面 / 墙体 ----------
// 地面：大理石方砖；墙：凝灰岩砌块 + 顶上一排排书架的影子
window.drawPrometheusFloor = function (ctx, px, py, h, tx, ty) {
  const S = h;
  ctx.fillStyle = "#cfc3a4";
  ctx.fillRect(px, py, S, S);
  // 大理石方砖的缝
  ctx.strokeStyle = "rgba(120,105,80,.32)"; ctx.lineWidth = 1;
  ctx.strokeRect(px + 0.5, py + 0.5, S - 1, S - 1);
  if (((tx * 3 + ty * 5) % 7) === 0) {
    ctx.fillStyle = "rgba(255,255,255,.10)";
    ctx.fillRect(px + 2, py + 2, S - 4, S - 4);
  }
  if (((tx + ty) % 11) === 0) {              // 石面上的一道纹
    ctx.strokeStyle = "rgba(150,132,100,.25)";
    ctx.beginPath(); ctx.moveTo(px + 3, py + S - 4); ctx.lineTo(px + S - 4, py + 4); ctx.stroke();
  }
  return true;
};

window.drawPrometheusWall = function (ctx, px, py, h, tx, ty) {
  const S = h;
  ctx.fillStyle = "#b9ab88";
  ctx.fillRect(px, py, S, S);
  // 砌块
  ctx.fillStyle = "rgba(0,0,0,.16)";
  ctx.fillRect(px, py + S * 0.48, S, Math.max(1, S * 0.06));
  ctx.fillStyle = "rgba(255,255,255,.16)";
  ctx.fillRect(px, py, S, Math.max(2, S * 0.10));
  ctx.fillStyle = "rgba(0,0,0,.30)";
  ctx.fillRect(px, py + S - Math.max(2, S * 0.12), S, Math.max(2, S * 0.12));
  ctx.strokeStyle = "rgba(80,68,48,.45)"; ctx.lineWidth = 1;
  ctx.strokeRect(px + 0.5, py + 0.5, S - 1, S - 1);
  return true;
};

// ---------- 物件 ----------
window.PROP_DRAW = window.PROP_DRAW || {};

// 书架：一格高的书墙，书脊五颜六色
window.PROP_DRAW["shelf53"] = function (ctx, p, T) {
  ctx.fillStyle = "#5a3f26";
  ctx.fillRect(-T * 0.44, -T * 0.46, T * 0.88, T * 0.92);
  // 三层书
  const cols = ["#8a3b2f", "#3f5a72", "#6b6337", "#5c3f66", "#7a5a2a", "#2f5a4a"];
  for (let r = 0; r < 3; r++) {
    const yy = -T * 0.40 + r * (T * 0.30);
    for (let i = 0; i < 5; i++) {
      const seed = (p.x * 7 + p.y * 13 + r * 31 + i * 5);
      ctx.fillStyle = cols[seed % cols.length];
      const bw = T * 0.13 + ((seed % 3) * T * 0.02);
      ctx.fillRect(-T * 0.40 + i * (T * 0.165), yy, bw, T * 0.22);
    }
    ctx.fillStyle = "rgba(0,0,0,.35)";                 // 隔板的阴影
    ctx.fillRect(-T * 0.42, yy + T * 0.22, T * 0.84, Math.max(1, T * 0.03));
  }
};

// 廊柱：凝灰岩，带凹槽
window.PROP_DRAW["column53"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(0,0,0,.28)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.32, T * 0.26, T * 0.10, 0, 0, 6.2832); ctx.fill();
  ctx.fillStyle = "#d8cdb0";
  ctx.fillRect(-T * 0.20, -T * 0.34, T * 0.40, T * 0.66);
  ctx.fillStyle = "rgba(0,0,0,.14)";
  for (let i = 0; i < 3; i++) ctx.fillRect(-T * 0.16 + i * (T * 0.12), -T * 0.30, T * 0.03, T * 0.58);
  ctx.fillStyle = "#c4b795";                          // 柱头
  ctx.fillRect(-T * 0.26, -T * 0.40, T * 0.52, T * 0.09);
  ctx.fillRect(-T * 0.26, T * 0.28, T * 0.52, T * 0.09);
};

// 画作：一幅文艺复兴风格的画，画的是不知所谓的事件
window.PROP_DRAW["painting53"] = function (ctx, p, T) {
  const w = T * 0.62, h = T * 0.48;
  ctx.fillStyle = "#8a6a2f";                          // 画框（金）
  ctx.fillRect(-w / 2 - 2, -h / 2 - 2, w + 4, h + 4);
  ctx.fillStyle = "#6f5433";                          // 画面底色
  ctx.fillRect(-w / 2, -h / 2, w, h);
  // 几个说不清在干什么的人形
  ctx.fillStyle = "rgba(210,190,150,.55)";
  for (let i = 0; i < 3; i++) {
    const cx = -w * 0.28 + i * (w * 0.28);
    ctx.beginPath(); ctx.arc(cx, -h * 0.16, h * 0.10, 0, 6.2832); ctx.fill();
    ctx.fillRect(cx - h * 0.07, -h * 0.06, h * 0.14, h * 0.30);
  }
  ctx.fillStyle = "rgba(0,0,0,.18)";
  ctx.fillRect(-w / 2, h * 0.18, w, h * 0.32);
};

// 散落的书
window.PROP_DRAW["book53"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(0,0,0,.24)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.14, T * 0.20, T * 0.07, 0, 0, 6.2832); ctx.fill();
  ctx.save();
  ctx.rotate(-0.22);
  ctx.fillStyle = "#7a3f30";
  ctx.fillRect(-T * 0.20, -T * 0.10, T * 0.40, T * 0.20);
  ctx.fillStyle = "#efe6cf";                          // 书页
  ctx.fillRect(-T * 0.18, -T * 0.08, T * 0.36, T * 0.16);
  ctx.fillStyle = "rgba(0,0,0,.20)";
  ctx.fillRect(-T * 0.02, -T * 0.08, T * 0.04, T * 0.16);
  ctx.restore();
};

// 木质楼梯
window.PROP_DRAW["stair53"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(0,0,0,.30)";
  ctx.fillRect(-T * 0.34, -T * 0.34, T * 0.68, T * 0.68);
  for (let i = 0; i < 4; i++) {
    const yy = T * 0.28 - i * (T * 0.17);
    ctx.fillStyle = i % 2 ? "#7a5630" : "#8d6640";
    ctx.fillRect(-T * 0.30, yy - T * 0.13, T * 0.60, T * 0.13);
    ctx.fillStyle = "rgba(0,0,0,.22)";
    ctx.fillRect(-T * 0.30, yy - T * 0.02, T * 0.60, Math.max(1, T * 0.03));
  }
  ctx.strokeStyle = "#5c3f22"; ctx.lineWidth = Math.max(1.5, T * 0.05);
  ctx.beginPath();
  ctx.moveTo(-T * 0.33, T * 0.30); ctx.lineTo(-T * 0.33, -T * 0.30);
  ctx.moveTo(T * 0.33, T * 0.30); ctx.lineTo(T * 0.33, -T * 0.30);
  ctx.stroke();
};

// 出口：走廊尽头墙上那扇木门
window.PROP_DRAW["door53"] = function (ctx, p, T) {
  const w = T * 0.80, h = T * 0.90;
  ctx.fillStyle = "#8f7a58";                          // 石门套
  ctx.fillRect(-w / 2 - 3, -h / 2 - 3, w + 6, h + 6);
  ctx.fillStyle = "#6b4526";                          // 门板
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "rgba(0,0,0,.20)";
  ctx.fillRect(-w / 2, -h / 2, w * 0.10, h);
  ctx.fillRect(w / 2 - w * 0.10, -h / 2, w * 0.10, h);
  ctx.fillStyle = "rgba(255,255,255,.08)";
  ctx.fillRect(-w / 2, -h / 2, w, h * 0.18);
  ctx.fillStyle = "#d8c48a";                          // 把手
  ctx.beginPath(); ctx.arc(w * 0.28, 0, Math.max(1.5, T * 0.05), 0, 6.2832); ctx.fill();
  ctx.fillStyle = "#e8dfc4";                          // 门楣上的字
  ctx.font = Math.round(T * 0.11) + "px system-ui, sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("出口", 0, -h * 0.62);
};

// ---------- 每帧：待久了，图书馆就开始抽记忆 ----------
const LIB53_LINES = [
  "你忽然想不起自己是怎么进来的 —— 明明刚刚还清楚得很",
  "头开始一跳一跳地疼。你摸了摸口袋，说不清自己在找什么",
  "刚才那排书架，你确定自己没走过第二遍 —— 可地上那本书是翻开的",
  "有个名字就在嘴边，怎么也想不起来。它可能已经不在你这儿了",
];
window.__LEVEL_TICK = window.__LEVEL_TICK || {};
window.__LEVEL_TICK["5.3"] = function (g, dt) {
  g.map.lib53 = (g.map.lib53 || 0) + dt;
  const t = g.map.lib53;
  if (t < 75) return;                    // 潜伏期：约一至两个钟头
  // 记忆被抽走：理智往下掉，人自己察觉不到
  g.sanity = Math.max(0, g.sanity - 0.55 * dt);
  if (!g._lib53msg) g._lib53msg = 0;
  if (t - g._lib53msg > 22) {
    g._lib53msg = t;
    if (typeof window.__toast === "function") {
      window.__toast(LIB53_LINES[Math.floor(t / 22) % LIB53_LINES.length]);
    }
  }
};

// Level 5 里那条新发现的走廊尽头的门 —— 通往普罗米修斯藏书馆
window.PROP_DRAW["door53in"] = function (ctx, p, T) {
  const w = T * 0.80, h = T * 0.90;
  ctx.fillStyle = "#8f7a58";                          // 石门套
  ctx.fillRect(-w / 2 - 3, -h / 2 - 3, w + 6, h + 6);
  ctx.fillStyle = "#6b4526";                          // 木质门板
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "rgba(0,0,0,.20)";
  ctx.fillRect(-w / 2, -h / 2, w * 0.10, h);
  ctx.fillRect(w / 2 - w * 0.10, -h / 2, w * 0.10, h);
  ctx.fillStyle = "rgba(255,255,255,.09)";
  ctx.fillRect(-w / 2, -h / 2, w, h * 0.18);
  // 门缝里透出图书馆那种暖黄的光
  ctx.fillStyle = "rgba(255,228,160,.42)";
  ctx.fillRect(-w / 2, h / 2 - Math.max(2, h * 0.07), w, Math.max(2, h * 0.07));
  ctx.fillStyle = "#e8dfc4";
  ctx.font = Math.round(T * 0.12) + "px system-ui, sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("5.3", 0, -h * 0.62);
  ctx.fillStyle = "#d8c48a";
  ctx.beginPath(); ctx.arc(w * 0.28, 0, Math.max(1.5, T * 0.05), 0, 6.2832); ctx.fill();
};
