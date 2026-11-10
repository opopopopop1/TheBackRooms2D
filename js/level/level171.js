// ===========================================================
// Level 171 —— 堂皇幻象
// 最初表现为一座 1930 年代风格的中庭：慢爵士乐、通风系统送出带玫瑰香气的暖风、
// 浓郁的家具抛光剂气味。继续往里走，环境便恶化，最终只剩盛景腐烂后的空壳 ——
// 富贵气息沦为刺鼻的霉菌与腐臭。
//
// 指示灯（实体 #506）：钉在墙上的灯带。它们每隔约五分钟开合一次。
//   灯亮 —— 中庭呈现"堂皇盛况"的幻象，爵士乐正常演奏，实体不可见（更危险）
//   灯灭 —— 幻象崩碎，跌入黑暗，爵士乐变慢失真，"疫病"实体才可见
//
// 布局：一座中庭（中央大厅 + 四面回廊 + 若干侧厅），刻意不是迷宫。
// 入口：Level 5 里一间随机的侧厅
// 出口：那扇雕刻着鹦鹉的木门 -> Level 301
// ===========================================================
"use strict";

function generateGrandeurMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const props = [];

  // ---- 中央中庭：一大片开阔的大厅 ----
  const ax = 18, ay = 16, aw = size - 36, ah = size - 34;
  carveRoom(grid, size, ax, ay, aw, ah);

  // ---- 四面回廊：绕着中庭一圈（比中庭窄）----
  const gy0 = ay - 6, gh = ah + 12;
  const gx0 = ax - 6, gw = aw + 12;
  // 上 / 下
  carveRoom(grid, size, gx0, gy0, gw, 4);
  carveRoom(grid, size, gx0, ay + ah + 2, gw, 4);
  // 左 / 右
  carveRoom(grid, size, gx0, gy0, 4, gh);
  carveRoom(grid, size, ax + aw + 2, gy0, 4, gh);

  // ---- 中庭与回廊之间开几个口（不是迷宫，四边都有）----
  const midX = ax + Math.floor(aw / 2), midY = ay + Math.floor(ah / 2);
  carveCorridorW(grid, size, midX, ay - 1, midX, gy0 + 4, 3);
  carveCorridorW(grid, size, midX, ay + ah, midX, ay + ah + 3, 3);
  carveCorridorW(grid, size, ax - 1, midY, gx0 + 4, midY, 3);
  carveCorridorW(grid, size, ax + aw, midY, ax + aw + 3, midY, 3);

  // ---- 侧厅：从回廊往外开的几间房 ----
  const rooms = [];
  const side = [
    { x: gx0 - 12, y: gy0 - 2, w: 10, h: 9 },
    { x: gx0 - 12, y: gy0 + gh - 9, w: 10, h: 9 },
    { x: ax + aw + 8, y: gy0 - 2, w: 10, h: 9 },
    { x: ax + aw + 8, y: gy0 + gh - 9, w: 10, h: 9 },
  ];
  for (const r of side) {
    if (r.x < 2 || r.x + r.w > size - 2) continue;
    carveRoom(grid, size, r.x, r.y, r.w, r.h);
    rooms.push(r);
    const cx = r.x + Math.floor(r.w / 2), cy = r.y + Math.floor(r.h / 2);
    if (r.x < gx0) carveCorridorW(grid, size, r.x + r.w, cy, gx0 + 1, cy, 2);
    else carveCorridorW(grid, size, r.x - 1, cy, ax + aw + 4, cy, 2);
  }

  const floors = collectFloors(grid, size);
  const start = { x: midX, y: ay + ah - 4, floor: 0 };

  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return;
    if (grid[y][x] !== 0) return;
    props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  };

  // ---- 指示灯：钉在墙上的灯带（实体 #506）----
  // 沿中庭与回廊的墙面成排钉着
  const bands = [];
  for (let x = ax + 2; x < ax + aw - 2; x += 7) { put(x, ay - 1, "indicator171"); bands.push({ x, y: ay - 1 }); }
  for (let x = ax + 2; x < ax + aw - 2; x += 7) { put(x, ay + ah, "indicator171"); bands.push({ x, y: ay + ah }); }
  for (let y = ay + 2; y < ay + ah - 2; y += 7) { put(ax - 1, y, "indicator171"); bands.push({ x: ax - 1, y }); }
  for (let y = ay + 2; y < ay + ah - 2; y += 7) { put(ax + aw, y, "indicator171"); bands.push({ x: ax + aw, y }); }

  // ---- 装在瓮里的玫瑰（香气的来源）----
  for (let i = 0; i < 14; i++) put(randInt(ax + 2, ax + aw - 3), randInt(ay + 2, ay + ah - 3), "urn171");

  // ---- 落满灰的桌子与椅子 ----
  for (let i = 0; i < 12; i++) put(randInt(ax + 2, ax + aw - 3), randInt(ay + 2, ay + ah - 3), "table171");

  // ---- 那扇雕刻着鹦鹉的木门 -> Level 301 ----
  // 放在中庭最上方（回廊尽头），够显眼
  const doorX = midX, doorY = gy0 + 1;
  props.push({ x: doorX, y: doorY, floor: 0, type: "parrotdoor171" });
  const parrotDoor = { x: doorX, y: doorY, floor: 0, type: "parrotdoor171" };

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [],
    atrium: { x: ax, y: ay, w: aw, h: ah },
    bands,
    parrotDoor,
    // 灯的开合由 main.js 驱动（约 5 分钟一轮，实际游玩缩短了一点）
    grandeurOn: true,
  };
  map.spawnPts = [start];
  return map;
}

window.PROP_DRAW = window.PROP_DRAW || {};

// 指示灯：钉在墙上的灯带。内部有发光二极管、黑色液体的循环系统、
// 电流转换器、镜头、幻象投影机和发报机 —— 它一直在"监测"你。
window.PROP_DRAW["indicator171"] = function (ctx, p, T) {
  const on = p.__on !== false;
  // 灯带本体：一条横着的金属条
  ctx.fillStyle = on ? "#8d8676" : "#4a463c";
  ctx.fillRect(-T * 0.34, -T * 0.10, T * 0.68, T * 0.20);
  ctx.strokeStyle = on ? "#3a362c" : "#232019";
  ctx.lineWidth = 1.2;
  ctx.strokeRect(-T * 0.34, -T * 0.10, T * 0.68, T * 0.20);
  // 发光二极管（一排）
  for (let i = 0; i < 5; i++) {
    const x = -T * 0.26 + i * T * 0.13;
    ctx.fillStyle = on ? "#ffeec2" : "#3a3630";
    ctx.fillRect(x, -T * 0.05, T * 0.07, T * 0.10);
  }
  // 镜头：正中间那颗一直在盯着你的黑点
  ctx.fillStyle = "#14120e";
  ctx.beginPath(); ctx.arc(0, 0, T * 0.055, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = on ? "rgba(255,238,194,0.6)" : "rgba(120,110,90,0.35)";
  ctx.lineWidth = 1;
  ctx.stroke();
  // 亮着的时候往外散一圈暖光
  if (on) {
    const g = ctx.createRadialGradient(0, 0, 1, 0, 0, T * 0.60);
    g.addColorStop(0, "rgba(255,236,190,0.42)");
    g.addColorStop(0.45, "rgba(255,228,170,0.16)");
    g.addColorStop(1, "rgba(255,220,160,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, 0, T * 0.60, 0, Math.PI * 2); ctx.fill();
  }
};

// 装在瓮里的玫瑰：香气的来源（也是最先腐烂的东西）
window.PROP_DRAW["urn171"] = function (ctx, p, T) {
  const fresh = p.__on !== false;
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.20, T * 0.17, T * 0.05, 0, 0, Math.PI * 2); ctx.fill();
  // 瓮
  ctx.fillStyle = fresh ? "#8a7a5e" : "#5a5040";
  ctx.beginPath();
  ctx.moveTo(-T * 0.14, T * 0.18);
  ctx.quadraticCurveTo(-T * 0.20, -T * 0.02, -T * 0.11, -T * 0.16);
  ctx.lineTo(T * 0.11, -T * 0.16);
  ctx.quadraticCurveTo(T * 0.20, -T * 0.02, T * 0.14, T * 0.18);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(30,26,20,0.6)"; ctx.lineWidth = 1.1; ctx.stroke();
  // 玫瑰
  const rc = fresh ? "#b8303a" : "#4a2c26";
  for (let i = 0; i < 3; i++) {
    const a = i * 2.1 + 0.4;
    ctx.fillStyle = rc;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * T * 0.07, -T * 0.20 + Math.sin(a) * T * 0.05, T * 0.05, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = fresh ? "#4a7040" : "#3a3428";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, -T * 0.16); ctx.lineTo(T * 0.03, -T * 0.06);
  ctx.stroke();
};

// 落满灰的桌子：灯亮的时候它光洁如新，灯灭的时候它积满灰
window.PROP_DRAW["table171"] = function (ctx, p, T) {
  const fresh = p.__on !== false;
  ctx.fillStyle = "rgba(0,0,0,0.30)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.22, T * 0.28, T * 0.06, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = fresh ? "#7a5230" : "#4e4030";
  ctx.fillRect(-T * 0.28, -T * 0.10, T * 0.56, T * 0.20);
  ctx.fillStyle = fresh ? "#8a6240" : "#574733";
  ctx.fillRect(-T * 0.24, -T * 0.14, T * 0.48, T * 0.05);
  ctx.strokeStyle = "rgba(24,18,12,0.6)"; ctx.lineWidth = 1;
  ctx.strokeRect(-T * 0.28, -T * 0.10, T * 0.56, T * 0.20);
  ctx.fillStyle = fresh ? "#6a4426" : "#40342a";
  ctx.fillRect(-T * 0.24, T * 0.09, T * 0.05, T * 0.12);
  ctx.fillRect(T * 0.19, T * 0.09, T * 0.05, T * 0.12);
  // 灰尘
  if (!fresh) {
    ctx.fillStyle = "rgba(150,140,120,0.30)";
    ctx.fillRect(-T * 0.28, -T * 0.14, T * 0.56, T * 0.08);
  }
};

// ---------------------------------------------------------------------------
// Level 5 的侧厅 —— 通往 Level 171 的入口
//   地毯：暗红，压着金线，踩上去没有一点声音
//   门：双开的深色木门，上半截是玻璃，门缝里漏出暖金色的光与慢爵士乐
//   指示牌：走廊上钉着的木牌，箭头指着侧厅的方向
// ---------------------------------------------------------------------------
window.PROP_DRAW["carpet5"] = function (ctx, p, T) {
  ctx.fillStyle = "#5a1f22";
  ctx.fillRect(-T * 0.5, -T * 0.5, T, T);
  // 织纹
  ctx.strokeStyle = "rgba(0,0,0,0.22)";
  ctx.lineWidth = 1;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(-T * 0.5, i * T * 0.22);
    ctx.lineTo(T * 0.5, i * T * 0.22);
    ctx.stroke();
  }
  // 金线：只在四边描一圈，拼起来就是整块地毯的滚边
  ctx.strokeStyle = "rgba(196,158,72,0.55)";
  ctx.lineWidth = 1.6;
  ctx.strokeRect(-T * 0.5 + 1, -T * 0.5 + 1, T - 2, T - 2);
};

window.PROP_DRAW["sidehall5"] = function (ctx, p, T) {
  const w = T * 0.86, h = T * 1.02;
  // 门后渗出来的暖金光 —— 在昏暗的旅馆走廊里，它是唯一亮着的东西。
  // 这一层整体会被压暗，所以光要给足，不然门缝那点黄会被压没。
  {
    const g = ctx.createRadialGradient(0, -h * 0.05, 1, 0, -h * 0.05, T * 1.9);
    g.addColorStop(0, "rgba(255,236,178,0.62)");
    g.addColorStop(0.35, "rgba(255,214,132,0.34)");
    g.addColorStop(0.7, "rgba(255,198,100,0.14)");
    g.addColorStop(1, "rgba(255,190,90,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, -h * 0.05, T * 1.9, 0, Math.PI * 2); ctx.fill();
  }
  // 门框（深色硬木）
  ctx.fillStyle = "#2e2018";
  ctx.fillRect(-w / 2 - 3, -h / 2 - 3, w + 6, h + 6);
  ctx.fillStyle = "#4a3220";
  ctx.fillRect(-w / 2 - 1.5, -h / 2 - 1.5, w + 3, h + 3);
  // 两扇门板
  const half = w / 2;
  for (const s of [-1, 1]) {
    const px = s * (half / 2);
    ctx.fillStyle = "#3a2618";
    ctx.fillRect(px - half / 2 + 1, -h / 2, half - 2, h);
    // 上半截玻璃：透着 171 的暖金
    const gg = ctx.createLinearGradient(0, -h / 2 + 2, 0, h * 0.06);
    gg.addColorStop(0, "#fff6d6");
    gg.addColorStop(1, "#e8ac58");
    ctx.fillStyle = gg;
    ctx.fillRect(px - half / 2 + 4, -h / 2 + 4, half - 8, h * 0.46);
    ctx.strokeStyle = "rgba(30,20,12,0.85)"; ctx.lineWidth = 1.4;
    ctx.strokeRect(px - half / 2 + 4, -h / 2 + 4, half - 8, h * 0.46);
    // 玻璃上的格棂
    ctx.beginPath();
    ctx.moveTo(px, -h / 2 + 4); ctx.lineTo(px, -h / 2 + 4 + h * 0.46);
    ctx.stroke();
    // 下半截的凹板
    ctx.strokeStyle = "rgba(20,12,8,0.7)"; ctx.lineWidth = 1;
    ctx.strokeRect(px - half / 2 + 5, h * 0.10, half - 10, h * 0.32);
    // 竖把手
    ctx.fillStyle = "#c8a44a";
    ctx.fillRect(px + s * (half / 2 - 7) - 1.5, h * 0.02, 3, h * 0.16);
  }
  // 中缝：光就是从这里漏出来的
  ctx.fillStyle = "rgba(255,244,206,0.98)";
  ctx.fillRect(-1.8, -h * 0.42, 3.6, h * 0.86);
  // 门楣：一块深色的小匾
  ctx.fillStyle = "#241a12";
  ctx.fillRect(-w * 0.30, -h / 2 - 13, w * 0.60, 11);
  ctx.strokeStyle = "rgba(196,158,72,0.75)"; ctx.lineWidth = 1;
  ctx.strokeRect(-w * 0.30, -h / 2 - 13, w * 0.60, 11);
  ctx.fillStyle = "#e8c877";
  for (let i = 0; i < 2; i++) {           // 匾上两个字的位置（不写字，只留刻痕）
    ctx.fillRect(-w * 0.20 + i * w * 0.22, -h / 2 - 10, w * 0.13, 5);
  }
};

// 走廊上的指示牌：一块木牌 + 一个指向侧厅的箭头
window.PROP_DRAW["signhall5"] = function (ctx, p, T) {
  const d = p.dir || "up";
  ctx.save();
  ctx.translate(0, -T * 0.10);
  // 细杆
  ctx.fillStyle = "#3a3228";
  ctx.fillRect(-1.5, T * 0.02, 3, T * 0.30);
  // 牌子
  ctx.fillStyle = "#2b2419";
  ctx.fillRect(-T * 0.30, -T * 0.20, T * 0.60, T * 0.24);
  ctx.strokeStyle = "rgba(198,164,84,0.85)"; ctx.lineWidth = 1.2;
  ctx.strokeRect(-T * 0.30, -T * 0.20, T * 0.60, T * 0.24);
  // 箭头：按 dir 旋转
  const ang = d === "right" ? 0 : d === "down" ? Math.PI / 2 : d === "left" ? Math.PI : -Math.PI / 2;
  ctx.save();
  ctx.rotate(ang);
  ctx.fillStyle = "#e8c877";
  ctx.beginPath();
  ctx.moveTo(T * 0.16, 0);
  ctx.lineTo(T * 0.02, -T * 0.07);
  ctx.lineTo(T * 0.02, -T * 0.025);
  ctx.lineTo(-T * 0.16, -T * 0.025);
  ctx.lineTo(-T * 0.16, T * 0.025);
  ctx.lineTo(T * 0.02, T * 0.025);
  ctx.lineTo(T * 0.02, T * 0.07);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.restore();
};

// 那扇雕刻着鹦鹉的木门 -> Level 301
window.PROP_DRAW["parrotdoor171"] = function (ctx, p, T) {
  const w = T * 0.72, h = T * 0.94;
  // 门框
  ctx.fillStyle = "#4a3a28";
  ctx.fillRect(-w / 2 - 2, -h / 2 - 2, w + 4, h + 4);
  // 门板（木纹）
  ctx.fillStyle = "#6a4a2c";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.strokeStyle = "rgba(40,28,16,0.55)"; ctx.lineWidth = 1;
  for (let i = 1; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(-w / 2 + (w / 4) * i, -h / 2);
    ctx.lineTo(-w / 2 + (w / 4) * i, h / 2);
    ctx.stroke();
  }
  // 雕刻着的鹦鹉
  const bx = 0, by = -h * 0.06;
  ctx.fillStyle = "#2e7a4a";                       // 身子（绿）
  ctx.beginPath();
  ctx.ellipse(bx, by + h * 0.06, w * 0.15, h * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#c8402e";                       // 头（红）
  ctx.beginPath();
  ctx.arc(bx - w * 0.02, by - h * 0.10, w * 0.10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f2c518";                       // 喙（黄）
  ctx.beginPath();
  ctx.moveTo(bx - w * 0.12, by - h * 0.10);
  ctx.lineTo(bx - w * 0.24, by - h * 0.06);
  ctx.lineTo(bx - w * 0.11, by - h * 0.03);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#2a5aa8";                       // 翅膀（蓝）
  ctx.beginPath();
  ctx.ellipse(bx + w * 0.07, by + h * 0.08, w * 0.09, h * 0.11, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#14100c";                       // 眼睛
  ctx.beginPath(); ctx.arc(bx - w * 0.05, by - h * 0.12, w * 0.022, 0, Math.PI * 2); ctx.fill();
  // 门把手
  ctx.fillStyle = "#c8a44a";
  ctx.beginPath(); ctx.arc(w * 0.28, h * 0.06, w * 0.05, 0, Math.PI * 2); ctx.fill();
};
