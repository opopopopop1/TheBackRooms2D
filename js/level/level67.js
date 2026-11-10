// ===========================================================
// Level 67 —— 欲望烘焙坊
//   一家 1980 年代样式的烘焙店。不像别的层级那样无限大 ——
//   整间店只有大约 2300 平方英尺，跟前厅里一家普通面包店差不多。
//   店里的装潢会顺着进来的人的心思变：最喜欢的颜色、最喜欢的植物、
//   会放你爱听的曲子的设备、散发出让你高兴的香气。
//   墙上有几张哥伦比亚面具和狐狸面具挂着 —— 别靠太近就没事。
//   三个区域：等候区（排队）、柜台（点单）、用餐区（吃）。
//   ===========================================================
//   面点分四种，效果因人而异：
//     最喜欢的        —— 最致命。靠近就忍不住想吃，吃下去五分钟喉咙肿、
//                        十分钟胃炎、二十分钟红皮病，之后呼吸衰竭而死
//     一般喜好的      —— 最安全。没冲动也没效果，纯粹用来填肚子
//     最不喜欢/讨厌的 —— 闻起来像腐烂的生肉。硬吃下去，一分钟后被送到 Level 31
//     过期/含过敏原的 —— 急性肠胃炎、食物中毒，严重的会死。不会传送
// ===========================================================
"use strict";

(function () {
  // 奶油白瓷砖 / 奶油黄墙 / 木质护墙板
  const v = ["#f2e6d0", "#e8d7b4", "#b98c5a"];
  if (typeof regTile === "function") regTile("bakery67", v);
  else { (window.__NEWTILE_EXTRA = window.__NEWTILE_EXTRA || {})["bakery67"] = v; }
})();

// 主题色：按"进店的人"变（这里用层级 id 做稳定的伪随机，同一次进店始终一致）
function b67Theme(map) {
  const PAL = [
    { name: "蜜桃", a: "#f7d9c4", b: "#e8a87c", c: "#c47b53" },
    { name: "薄荷", a: "#d9f2e4", b: "#8fc9a8", c: "#4f8f6d" },
    { name: "奶油", a: "#f6efd8", b: "#e0c98a", c: "#b4913f" },
    { name: "莓果", a: "#f3dbe6", b: "#d391b4", c: "#a25c83" },
    { name: "天蓝", a: "#dce8f4", b: "#93b6d8", c: "#5a7fa6" },
  ];
  return PAL[(map && map.b67theme) || 0];
}
window.b67Theme = b67Theme;

function generateBakery67Map(level) {
  const size = 42;
  const grid = makeGrid(size);
  const props = [];
  const floors = [];

  const carve = (x, y) => {
    if (x > 0 && y > 0 && x < size - 1 && y < size - 1) grid[y][x] = 0;
  };
  // 整间店是一个大方厅：外圈留墙
  const X0 = 3, X1 = size - 4, Y0 = 3, Y1 = size - 4;
  for (let y = Y0; y <= Y1; y++) for (let x = X0; x <= X1; x++) carve(x, y);

  // ---------- 分区 ----------
  // 柜台：横在中间偏右的一道长台（x = CX），中间留一个过道口
  const CX = Math.floor(size * 0.58);
  const cy = Math.floor(size / 2);
  const GAP0 = cy - 1, GAP1 = cy + 1;      // 柜台上的通行口
  for (let y = Y0; y <= Y1; y++) {
    if (y >= GAP0 && y <= GAP1) continue;
    grid[y][CX] = 1;                        // 柜台本体是墙（走不过去）
  }
  // 柜台后（店员区）与用餐区之间再隔一道，留一个口到用餐区
  const CX2 = CX + 6;
  for (let y = Y0; y <= Y1; y++) {
    if (y >= cy - 2 && y <= cy + 2) continue;
    grid[y][CX2] = 1;
  }
  collectFloorsInto(grid, size, floors);

  const start = { x: X0 + 1, y: cy, floor: 0 };

  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return null;
    if (grid[y][x] !== 0) return null;
    const p = Object.assign({ x, y, floor: 0, type }, extra || {});
    props.push(p);
    return p;
  };

  // ---------- 入口 / 出口 ----------
  put(X0 + 1, cy - 2, "p67door", { toLevel: 11 });     // 直接离开店面 → Level 11
  // 员工专用门（柜台后面的后台）—— 进去的人再没出来过
  put(CX + 3, Y0 + 1, "p67back");

  // ---------- 等候区：一条队伍 ----------
  // 排队的多半是 Level 11 效应下的无面灵
  for (let i = 0; i < 7; i++) {
    put(CX - 3 - (i % 3), GAP0 - 2 + i, "p67queue", { face: (i % 4) === 0 });
  }

  // ---------- 柜台：接待员 + 一排面点 ----------
  put(CX - 1, GAP0 - 1, "p67clerk");
  // 柜台旁摆着一列面点：四种都有，混在一起
  const KINDS = ["fav", "neutral", "hated", "expired"];
  const pastries = [];
  for (let i = 0; i < 10; i++) {
    const y = Y0 + 1 + i;
    if (grid[y] && grid[y][CX - 1] === 0) {
      const kind = KINDS[i % 4];
      const p = put(CX - 1, y, "p67pastry", { kind, eaten: false });
      if (p) pastries.push(p);
    }
  }
  // 如果上面没放下（柜台左侧被占），兜底在等候区摆一排
  if (pastries.length < 6) {
    for (let i = 0; i < 8; i++) {
      const kind = KINDS[i % 4];
      const p = put(CX - 2, Y0 + 1 + i * 2, "p67pastry", { kind, eaten: false });
      if (p) pastries.push(p);
    }
  }

  // ---------- 用餐区 ----------
  for (let ty = Y0 + 2; ty <= Y1 - 2; ty += 4) {
    for (let tx = CX2 + 2; tx <= X1 - 2; tx += 5) {
      put(tx, ty, "p67table");
      put(tx, ty + 1, "p67chair");
      put(tx + 1, ty, "p67chair");
    }
  }

  // ---------- 墙上挂着的面具（哥伦比亚面具 / 狐狸面具） ----------
  const masks = [];
  for (let i = 0; i < 6; i++) {
    const mx = X0 + 1 + i * 2;
    const p = put(mx, Y0, "p67mask", { fox: i % 2 === 1 });
    if (p) masks.push(p);
  }

  // ---------- 香薰机 / 播放设备 / 盆栽（都是"顺着你的喜好"来的） ----------
  put(X0 + 2, Y1 - 1, "p67diffuser");
  put(X1 - 2, Y0 + 1, "p67radio");
  put(X1 - 1, Y1 - 1, "p67plant");
  put(CX2 + 1, Y1 - 2, "p67plant");

  // ---------- 常客 ----------
  put(X0 + 1, Y1 - 3, "p67jerry");           // 杰里和可可
  put(CX2 + 2, Y1 - 1, "p67friends");        // 童年挚友（远后方）

  return {
    size, level: 67, doubleStory: false,
    layers: [grid], grid, rooms: [[]], floors: [floors],
    start, exit: null, doors: [], ramps: [],
    props, crates: [], ground: [],

    b67theme: randInt(0, 4),
    style: "bakery67",
    tileName: "bakery67",
    wait67: 0,          // 排队等待的时间
    angry67: false,     // 后面的无面灵是不是已经不耐烦了
  };
}
window.generateBakery67Map = generateBakery67Map;

// 本地兜底：老版本 map.js 没有 collectFloorsInto
function collectFloorsInto(grid, size, out) {
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    if (grid[y][x] === 0) out.push({ x, y });
  }
  return out;
}

// ---------------- 地面：白瓷砖 + 主题色棋盘 ----------------
window.drawBakery67Floor = function (ctx, px, py, S, map, tx, ty) {
  const th = b67Theme(map);
  const odd = ((tx + ty) % 2) === 0;
  ctx.fillStyle = odd ? "#f4efe4" : th.a;
  ctx.fillRect(px, py, S, S);
  // 瓷砖缝
  ctx.strokeStyle = "rgba(120,100,80,.20)";
  ctx.lineWidth = 1;
  ctx.strokeRect(px + 0.5, py + 0.5, S - 1, S - 1);
  // 高光
  ctx.fillStyle = "rgba(255,255,255,.22)";
  ctx.fillRect(px + 1, py + 1, S - 2, 2);
  return true;
};

// ---------------- 墙：奶油色 + 木质护墙板 ----------------
window.drawBakery67Wall = function (ctx, px, py, S, map, tx, ty) {
  const th = b67Theme(map);
  ctx.fillStyle = "#efe6d4";
  ctx.fillRect(px, py, S, S);
  // 下半截木质护墙板
  ctx.fillStyle = th.c;
  ctx.fillRect(px, py + S * 0.62, S, S * 0.38);
  ctx.fillStyle = "rgba(255,255,255,.14)";
  ctx.fillRect(px, py + S * 0.62, S, 2);
  // 上半截的主题色腰线
  ctx.fillStyle = th.b;
  ctx.fillRect(px, py + S * 0.58, S, 3);
  return true;
};

// ---------------- 环境：暖光 + 香气 ----------------
window.drawBakery67 = function (ctx, g) {
  const cw = (ctx.canvas && ctx.canvas.width) || 800;
  const ch = (ctx.canvas && ctx.canvas.height) || 600;
  const t = performance.now() / 1000;
  const th = b67Theme(g.map);
  ctx.save();
  try { ctx.setTransform(1, 0, 0, 1, 0, 0); } catch (e) { /* 忽略 */ }
  // 暖黄的底光 —— 店里的灯一直是暖的
  ctx.fillStyle = "rgba(255,214,150,.055)";
  ctx.fillRect(0, 0, cw, ch);
  // 香薰机飘出来的香气（主题色的雾，慢慢往上飘）
  const gr = ctx.createRadialGradient(cw * 0.5, ch * 0.62, ch * 0.1, cw * 0.5, ch * 0.62, ch * 0.85);
  gr.addColorStop(0, "rgba(255,255,255,0)");
  gr.addColorStop(1, th.b.replace(")", ",.10)").replace("#", "rgba(").length > 0 ? "rgba(210,170,120,.10)" : "rgba(210,170,120,.10)");
  ctx.fillStyle = gr;
  ctx.fillRect(0, 0, cw, ch);
  // 极轻的一层暖色，保证画面不是黑的
  ctx.fillStyle = "rgba(255,236,205,.03)";
  ctx.fillRect(0, 0, cw, ch);
  ctx.restore();
};

// ---------------- 物件 ----------------
window.PROP_DRAW = window.PROP_DRAW || {};

// 入口的门
window.PROP_DRAW["p67door"] = function (ctx, p, T) {
  ctx.fillStyle = "#8a6a44";
  ctx.fillRect(p.x * T, p.y * T, T, T);
  ctx.fillStyle = "#c9a06a";
  ctx.fillRect(p.x * T + 3, p.y * T + 3, T - 6, T - 6);
  ctx.fillStyle = "#f6efd8";
  ctx.fillRect(p.x * T + 6, p.y * T + 6, T - 12, T * 0.30);
  ctx.fillStyle = "#7a5a38";
  ctx.fillRect(p.x * T + T * 0.72, p.y * T + T * 0.46, 3, 3);
};

// 柜台：一条长台，台面上摆着托盘
window.PROP_DRAW["p67counter"] = function (ctx, p, T) {
  ctx.fillStyle = "#c9a06a";
  ctx.fillRect(p.x * T, p.y * T + T * 0.25, T, T * 0.75);
  ctx.fillStyle = "#efe6d4";
  ctx.fillRect(p.x * T, p.y * T + T * 0.25, T, 3);
};

// 接待员（无面的烘焙店店员）
window.PROP_DRAW["p67clerk"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#e8e2d4";
  ctx.fillRect(x + T * 0.18, y + T * 0.10, T * 0.64, T * 0.42);   // 脸（空白）
  ctx.fillStyle = "#5d6f8a";
  ctx.fillRect(x + T * 0.10, y + T * 0.50, T * 0.80, T * 0.46);   // 制服
  ctx.fillStyle = "#c94f4f";
  ctx.fillRect(x + T * 0.10, y + T * 0.72, T * 0.80, 4);          // 围裙带
  ctx.fillStyle = "#f2e6d0";
  ctx.fillRect(x + T * 0.22, y + T * 0.02, T * 0.56, T * 0.12);   // 帽子
};

// 排队的无面灵 / 流浪者
window.PROP_DRAW["p67queue"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#ded8ca";
  ctx.fillRect(x + T * 0.22, y + T * 0.12, T * 0.56, T * 0.40);
  ctx.fillStyle = p.face ? "#6a7d99" : "#7a6a58";
  ctx.fillRect(x + T * 0.14, y + T * 0.50, T * 0.72, T * 0.46);
};

// 面点：四种外观完全不同，一眼要能分出来
window.PROP_DRAW["p67pastry"] = function (ctx, p, T) {
  if (p.eaten) return;                     // 吃掉了就画个空盘子
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  const t = performance.now() / 1000;
  // 盘子
  ctx.fillStyle = "#f8f4ea";
  ctx.beginPath(); ctx.ellipse(x + T / 2, y + T * 0.72, T * 0.34, T * 0.14, 0, 0, Math.PI * 2); ctx.fill();
  if (p.kind === "fav") {
    // 最喜欢的：金灿灿的，还在冒热气 —— 最致命
    const gl = 0.55 + 0.25 * Math.sin(t * 3);
    ctx.fillStyle = "rgba(255,215,120," + gl.toFixed(2) + ")";
    ctx.beginPath(); ctx.ellipse(x + T / 2, y + T * 0.55, T * 0.30, T * 0.22, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#e8a33d";
    ctx.beginPath(); ctx.ellipse(x + T / 2, y + T * 0.50, T * 0.22, T * 0.15, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.5)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x + T / 2, y + T * 0.30); ctx.lineTo(x + T / 2 + 2, y + T * 0.18); ctx.stroke();
  } else if (p.kind === "neutral") {
    // 一般喜好的：普通的可颂
    ctx.fillStyle = "#d9a86a";
    ctx.beginPath(); ctx.ellipse(x + T / 2, y + T * 0.55, T * 0.28, T * 0.18, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(150,105,55,.5)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(x + T / 2, y + T * 0.55, T * 0.16, T * 0.10, -0.3, 0, Math.PI * 2); ctx.stroke();
  } else if (p.kind === "hated") {
    // 最讨厌的：发灰发绿，看着就没胃口（闻起来像腐烂生肉）
    ctx.fillStyle = "#8f8a70";
    ctx.beginPath(); ctx.ellipse(x + T / 2, y + T * 0.55, T * 0.27, T * 0.18, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#6d7a52";
    ctx.beginPath(); ctx.ellipse(x + T / 2 - 3, y + T * 0.52, T * 0.10, T * 0.07, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(70,80,50,.35)";
    ctx.fillRect(x + T * 0.24, y + T * 0.62, T * 0.5, 2);
  } else {
    // 过期的：发霉的点，霉斑清晰可见
    ctx.fillStyle = "#a89878";
    ctx.beginPath(); ctx.ellipse(x + T / 2, y + T * 0.55, T * 0.27, T * 0.18, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#5f7a4a";
    for (let i = 0; i < 4; i++) {
      const a = i * 1.9 + 0.4;
      ctx.beginPath();
      ctx.arc(x + T / 2 + Math.cos(a) * T * 0.15, y + T * 0.55 + Math.sin(a) * T * 0.09, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
};
window.PROP_DRAW["p67plate"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#e6e0d0";
  ctx.beginPath(); ctx.ellipse(x + T / 2, y + T * 0.72, T * 0.30, T * 0.12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(120,100,70,.35)";
  ctx.fillRect(x + T * 0.30, y + T * 0.68, T * 0.40, 2);
};

// 餐桌 / 椅子
window.PROP_DRAW["p67table"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#c9a06a";
  ctx.fillRect(x + T * 0.08, y + T * 0.24, T * 0.84, T * 0.52);
  ctx.fillStyle = "#efe6d4";
  ctx.fillRect(x + T * 0.08, y + T * 0.24, T * 0.84, 3);
};
window.PROP_DRAW["p67chair"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#b98c5a";
  ctx.fillRect(x + T * 0.24, y + T * 0.32, T * 0.52, T * 0.44);
  ctx.fillStyle = "#8a6a44";
  ctx.fillRect(x + T * 0.24, y + T * 0.68, T * 0.52, 3);
};

// 墙上的面具
window.PROP_DRAW["p67mask"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  const t = performance.now() / 1000;
  if (p.fox) {
    // 狐狸面具：橙色尖耳
    ctx.fillStyle = "#d97b34";
    ctx.beginPath();
    ctx.moveTo(x + T * 0.18, y + T * 0.34); ctx.lineTo(x + T * 0.30, y + T * 0.10);
    ctx.lineTo(x + T * 0.42, y + T * 0.34); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + T / 2, y + T * 0.55, T * 0.26, T * 0.22, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#f6efd8";
    ctx.beginPath(); ctx.ellipse(x + T / 2, y + T * 0.64, T * 0.14, T * 0.10, 0, 0, Math.PI * 2); ctx.fill();
  } else {
    // 哥伦比亚面具：白色的脸，黑洞洞的眼
    ctx.fillStyle = "#f0ece0";
    ctx.beginPath(); ctx.ellipse(x + T / 2, y + T * 0.54, T * 0.24, T * 0.26, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#22303f";
    ctx.beginPath(); ctx.arc(x + T * 0.40, y + T * 0.48, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + T * 0.60, y + T * 0.48, 3, 0, Math.PI * 2); ctx.fill();
  }
  // 面具的眼睛偶尔会动一下 —— 别靠太近
  if (Math.sin(t * 0.7 + p.x) > 0.985) {
    ctx.fillStyle = "rgba(255,60,60,.55)";
    ctx.beginPath(); ctx.arc(x + T / 2, y + T * 0.50, T * 0.10, 0, Math.PI * 2); ctx.fill();
  }
};

// 香薰机（冒着香气）
window.PROP_DRAW["p67diffuser"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  const t = performance.now() / 1000;
  ctx.fillStyle = "#dcd3c0";
  ctx.fillRect(x + T * 0.28, y + T * 0.42, T * 0.44, T * 0.44);
  ctx.fillStyle = "rgba(255,255,255,.35)";
  for (let i = 0; i < 3; i++) {
    const yy = y + T * 0.36 - ((t * 14 + i * 9) % 16);
    ctx.beginPath(); ctx.arc(x + T / 2 + Math.sin(t * 2 + i) * 3, yy, 2.6, 0, Math.PI * 2); ctx.fill();
  }
};
// 播放设备（放着进来的人爱听的曲子）
window.PROP_DRAW["p67radio"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  const t = performance.now() / 1000;
  ctx.fillStyle = "#8a7a66";
  ctx.fillRect(x + T * 0.12, y + T * 0.36, T * 0.76, T * 0.48);
  ctx.fillStyle = "#3a3a44";
  ctx.fillRect(x + T * 0.20, y + T * 0.46, T * 0.60, T * 0.22);
  ctx.fillStyle = "rgba(120,220,160,.55 + 0)" || "rgba(120,220,160,.55)";
  for (let i = 0; i < 3; i++) {
    const h = 3 + Math.abs(Math.sin(t * 4 + i)) * 7;
    ctx.fillRect(x + T * 0.24 + i * 5, y + T * 0.62 - h, 3, h);
  }
};
// 盆栽（进来的人最喜欢的植物）
window.PROP_DRAW["p67plant"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#b07a4a";
  ctx.fillRect(x + T * 0.32, y + T * 0.60, T * 0.36, T * 0.26);
  ctx.fillStyle = "#4f8f5d";
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i - 2) * 0.45;
    ctx.beginPath();
    ctx.ellipse(x + T / 2 + Math.cos(a) * T * 0.20, y + T * 0.48 + Math.sin(a) * T * 0.18,
      T * 0.14, T * 0.06, a, 0, Math.PI * 2);
    ctx.fill();
  }
};

// 杰里和可可（两位常客，腰间挂着狐狸面具和假面）
window.PROP_DRAW["p67jerry"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#e2ddd0";
  ctx.fillRect(x + T * 0.16, y + T * 0.10, T * 0.30, T * 0.36);
  ctx.fillStyle = "#6b5b7a";
  ctx.fillRect(x + T * 0.10, y + T * 0.44, T * 0.42, T * 0.50);
  ctx.fillStyle = "#e2ddd0";
  ctx.fillRect(x + T * 0.52, y + T * 0.14, T * 0.30, T * 0.34);
  ctx.fillStyle = "#7a5b4a";
  ctx.fillRect(x + T * 0.48, y + T * 0.46, T * 0.42, T * 0.48);
  // 腰间的狐狸面具
  ctx.fillStyle = "#d97b34";
  ctx.beginPath(); ctx.ellipse(x + T * 0.24, y + T * 0.76, 5, 4, 0, 0, Math.PI * 2); ctx.fill();
};
// 童年挚友（远后方的一对）
window.PROP_DRAW["p67friends"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#e6e0d2";
  ctx.fillRect(x + T * 0.20, y + T * 0.16, T * 0.26, T * 0.32);
  ctx.fillStyle = "#8a9a7a";
  ctx.fillRect(x + T * 0.14, y + T * 0.46, T * 0.38, T * 0.46);
  ctx.fillStyle = "#e6e0d2";
  ctx.fillRect(x + T * 0.54, y + T * 0.12, T * 0.24, T * 0.34);
  ctx.fillStyle = "#a88a6a";
  ctx.fillRect(x + T * 0.50, y + T * 0.44, T * 0.36, T * 0.48);
};

// 员工专用门（后台）
window.PROP_DRAW["p67back"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#6a6058";
  ctx.fillRect(x + T * 0.12, y + T * 0.08, T * 0.76, T * 0.84);
  ctx.fillStyle = "#8e8279";
  ctx.fillRect(x + T * 0.20, y + T * 0.16, T * 0.60, T * 0.68);
  ctx.fillStyle = "#e8e2d0";
  ctx.font = Math.max(6, Math.floor(T * 0.16)) + "px monospace";
  ctx.textAlign = "center";
  ctx.fillText("员工专用", x + T / 2, y + T * 0.52);
  ctx.textAlign = "left";
};

// ---------------- Level 11 街上那家面包店（通往 Level 67） ----------------
window.PROP_DRAW["bakery67door"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  const t = performance.now() / 1000;
  // 店面：暖色的门脸 + 玻璃门 + 招牌
  ctx.fillStyle = "#e8d7b4";
  ctx.fillRect(x + T * 0.06, y + T * 0.06, T * 0.88, T * 0.88);
  ctx.fillStyle = "#c98a4a";
  ctx.fillRect(x + T * 0.12, y + T * 0.14, T * 0.76, T * 0.16);   // 雨篷
  ctx.fillStyle = "#3a4a6e";
  ctx.fillRect(x + T * 0.18, y + T * 0.36, T * 0.64, T * 0.52);   // 玻璃门
  // 玻璃里透出来的暖光（烤面包的香气就是从这儿飘出来的）
  const gl = 0.55 + 0.20 * Math.sin(t * 1.8);
  ctx.fillStyle = "rgba(255,214,140," + gl.toFixed(2) + ")";
  ctx.fillRect(x + T * 0.22, y + T * 0.40, T * 0.56, T * 0.44);
  // 招牌上那只面包
  ctx.fillStyle = "#d8a05a";
  ctx.beginPath(); ctx.ellipse(x + T / 2, y + T * 0.22, T * 0.16, T * 0.06, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.25)";
  ctx.fillRect(x + T * 0.22, y + T * 0.40, T * 0.56, 2);
};
