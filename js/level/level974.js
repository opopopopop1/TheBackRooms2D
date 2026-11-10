// ===========================================================
// Level 974 —— kitty 之家
//
// 一间中等规模的住宅，遍及其内的是粉红色调的装潢。
// 没有通向外部的门；窗户只是画着户外景色的艺术品，还带着一种轻佻的风格。
// 身上带着"可爱"物件切行时，有小概率被送到这里。
//
// 房间：主卧（空荡荡，后墙边有个粉白相间的猫窝）、普通卧室（唯一有家具的一间）、
//       两间浴室、客厅（没有家具）、厨房兼餐室（粉色木质卡座）。
// 实体只有一种：Kitty —— 3.2 米高、四肢异常修长、无手无脚、皮肤黢黑、
//       没有任何面部特征，会悄无声息地跟在你后面。
// 出口只有一个：把一件"进来之前就带着的"可爱物件给它。
// ===========================================================
"use strict";

// 贝克米勒粉：短时间内镇静，待久了会让人焦虑、掉理智。
if (typeof regTile === "function") regTile("kittyhome", ["#f6d3df", "#ff91af"]);
else { (window.__NEWTILE_EXTRA = window.__NEWTILE_EXTRA || {})["kittyhome"] = ["#f6d3df", "#ff91af"]; }

// -----------------------------------------------------------
// 地面：粉白相间的地毯，压着一层细密的花纹
// -----------------------------------------------------------
function drawKittyFloor(ctx, px, py, T) {
  ctx.fillStyle = "#f6d3df";
  ctx.fillRect(px, py, T, T);
  // 地毯的绒面：交错的短线
  ctx.strokeStyle = "rgba(214,150,175,0.35)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    const yy = py + 5 + i * (T / 3.4);
    ctx.beginPath();
    ctx.moveTo(px + 2, yy);
    ctx.lineTo(px + T - 2, yy + 1.5);
    ctx.stroke();
  }
  // 一小块更深的花纹
  ctx.fillStyle = "rgba(240,170,196,0.30)";
  ctx.fillRect(px + T * 0.32, py + T * 0.32, T * 0.36, T * 0.36);
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.fillRect(px + T * 0.40, py + T * 0.40, T * 0.14, T * 0.14);
}

// -----------------------------------------------------------
// 墙：贝克米勒粉的墙纸，上面印着卡通形象
// -----------------------------------------------------------
function drawKittyWall(ctx, px, py, T) {
  ctx.fillStyle = "#ff91af";
  ctx.fillRect(px, py, T, T);
  // 上半截深一号（墙裙上方的压条）
  ctx.fillStyle = "rgba(226,110,150,0.45)";
  ctx.fillRect(px, py, T, 4);
  ctx.fillStyle = "rgba(255,255,255,0.20)";
  ctx.fillRect(px, py + 4, T, 2);
  // 墙纸上印着的卡通角色：一只圆头圆脑的小家伙
  const cx = px + T * 0.5, cy = py + T * 0.56, r = T * 0.15;
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  // 两只耳朵
  ctx.beginPath(); ctx.arc(cx - r * 0.8, cy - r * 0.85, r * 0.42, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + r * 0.8, cy - r * 0.85, r * 0.42, 0, Math.PI * 2); ctx.fill();
  // 眼睛与嘴
  ctx.fillStyle = "rgba(60,40,50,0.75)";
  ctx.beginPath(); ctx.arc(cx - r * 0.36, cy - r * 0.1, r * 0.14, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + r * 0.36, cy - r * 0.1, r * 0.14, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "rgba(60,40,50,0.6)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(cx, cy + r * 0.28, r * 0.26, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  // 腮红
  ctx.fillStyle = "rgba(240,120,150,0.5)";
  ctx.beginPath(); ctx.arc(cx - r * 0.72, cy + r * 0.2, r * 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + r * 0.72, cy + r * 0.2, r * 0.2, 0, Math.PI * 2); ctx.fill();
}

// ===========================================================
// 地图生成
// ===========================================================
function generateKittyHomeMap(level) {
  const size = 40;
  const grid = makeGrid(size);
  const props = [];

  // ---- 房间（不是迷宫：一套住宅的平面）----
  const R = {
    master: { x1: 2, y1: 9, x2: 13, y2: 17 },      // 主卧：空荡荡，只有那个猫窝
    bath1: { x1: 15, y1: 9, x2: 21, y2: 13 },      // 浴室（楼上）
    bedroom: { x1: 23, y1: 9, x2: 37, y2: 17 },    // 普通卧室：唯一有家具的一间
    kitchen: { x1: 2, y1: 22, x2: 13, y2: 35 },    // 厨房兼餐室
    bath2: { x1: 15, y1: 24, x2: 21, y2: 28 },     // 浴室（楼下）
    living: { x1: 23, y1: 22, x2: 37, y2: 35 },    // 客厅：没有家具
  };
  for (const k in R) {
    const r = R[k];
    carveRoom(grid, size, r.x1, r.y1, r.x2 - r.x1 + 1, r.y2 - r.y1 + 1);
  }
  // ---- 走廊：横贯中部，把上下两排房间串起来 ----
  for (let x = 2; x <= 37; x++) { grid[19][x] = 0; grid[20][x] = 0; }
  // ---- 门洞：每间房开一个口通向走廊 ----
  const hole = (x, y) => { if (x > 0 && y > 0 && x < size - 1 && y < size - 1) grid[y][x] = 0; };
  for (let y = 18; y <= 18; y++) hole(7, y);            // 主卧 → 走廊
  for (let y = 14; y <= 18; y++) hole(18, y);           // 浴室 1 → 走廊
  for (let y = 18; y <= 18; y++) hole(30, y);           // 卧室 → 走廊
  for (let y = 21; y <= 21; y++) hole(7, y);            // 厨房 → 走廊
  for (let y = 21; y <= 23; y++) hole(18, y);           // 浴室 2 → 走廊
  for (let y = 21; y <= 21; y++) hole(30, y);           // 客厅 → 走廊

  const start = { x: 30, y: 30, floor: 0 };             // 从客厅开始

  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return;
    if (grid[y][x] !== 0) return;
    props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  };

  // ---- 主卧：空荡荡。后墙边只有一个粉白相间的猫窝 ----
  put(7, 10, "catbed974");

  // ---- 普通卧室：唯一布置齐全的一间 ----
  // 单人床：嵌在房间两侧凸出来的墙面之间（床头靠上墙）
  put(25, 10, "singlebed974", { part: 0 });
  put(26, 10, "singlebed974", { part: 1 });
  put(27, 10, "singlebed974", { part: 2 });
  // 门旁的开放式衣柜 + 抽屉柜（里面是尺码正好的"可爱"衣物）
  put(36, 11, "wardrobe974");
  // 书桌（正对着床），上面一台 Win95 的老式电脑
  put(31, 16, "computer974");
  // 毛绒玩具与可爱海报 —— 房间里到处都是
  put(28, 13, "plush974", { cute: true });
  put(34, 14, "plush974", { cute: true });
  put(24, 15, "plush974", { cute: true });
  put(35, 9, "poster974");
  put(29, 9, "poster974");
  // 空相框：挂在墙上，里面什么也没有
  put(37, 15, "frame974");
  // 窗：只是画着户外景色的作品
  put(24, 9, "window974");

  // ---- 厨房兼餐室：粉色木质卡座环绕桌子两侧 ----
  put(4, 25, "booth974", { side: -1 });
  put(4, 27, "booth974", { side: -1 });
  put(8, 25, "booth974", { side: 1 });
  put(8, 27, "booth974", { side: 1 });
  // 厨房台面、冰箱、食品贮藏室
  put(11, 24, "kitchen974");
  put(11, 26, "kitchen974");
  put(3, 34, "fridge974");
  put(11, 34, "pantry974");
  // 挂在墙上的特别厨具
  put(2, 22, "utensil974");
  // 偶尔真的会出现在台面上的饭菜（大多数时候只是幻嗅）


  // ---- 地上能捡起来的东西 ----
  // 毛绒玩具是可爱物件；冰箱和贮藏室里的食物取走后会自行补充。
  const ground = [];
  const drop = (x, y, item) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return;
    if (grid[y][x] !== 0) return;
    ground.push({ x, y, floor: 0, item, taken: false });
  };
  drop(29, 13, 'plush');
  drop(35, 14, 'plush');
  drop(24, 16, 'plush');
  drop(5, 30, 'marshmallow');
  drop(9, 34, 'marshmallow');
  drop(6, 26, 'almond');

  // ---- 客厅：没有家具，只有粉红的装潢 ----
  put(30, 24, "window974");
  put(34, 24, "window974");
  put(26, 34, "poster974");
  put(36, 30, "rug974");

  // ---- 两间浴室 ----
  put(16, 10, "bath974", { kind: 0 });
  put(16, 26, "bath974", { kind: 1 });

  const floors = collectFloors(grid, size);

  const map = {
    size, level, doubleStory: false,
    // 关键：这里以前写的是 floors: [null] —— 上面 collectFloors 算出来的地板表被丢掉了。
    // 结果是这一层的"可站立格子列表"是空的，任何需要它的逻辑（刷实体、落物、
    // 连通检查、档案投放）在这一层全部失效 —— Kitty 永远刷不出来。
    layers: [grid], rooms: [[]], floors: [floors],
    start,
    spawnPts: [{ x: start.x, y: start.y, floor: 0 }],
    props,
    crates: [],
    ground,
    doors: [],
    style: "kittyhome",
    // 待久了会焦虑：贝克米勒粉在短时间内镇静，长时间接触会掉理智
    bakerMiller: true,
    ambientLight: 0.92,
    hasKitty: true,
  };
  return map;
}

// ===========================================================
// 物件建模 —— 每一个都是新建的，没有一个是拿桌子凑数的
// ===========================================================
window.PROP_DRAW = window.PROP_DRAW || {};

// 粉白相间的猫窝（主卧后墙边那一个）
window.PROP_DRAW["catbed974"] = function (ctx, p, T) {
  const w = T * 0.92, h = T * 0.86;
  // 落在地上的影子
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.30, w * 0.52, h * 0.22, 0, 0, Math.PI * 2); ctx.fill();
  // 外壳：粉白相间的圆窝，一圈一圈绕上去
  const rings = [
    ["#ffffff", 1.0], ["#ffc2d6", 0.86], ["#ffffff", 0.72],
    ["#ffc2d6", 0.58], ["#ffffff", 0.44],
  ];
  for (const [col, k] of rings) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.5 * k, h * 0.46 * k, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // 里面的软垫
  ctx.fillStyle = "#f7e2ea";
  ctx.beginPath(); ctx.ellipse(0, 2, w * 0.18, h * 0.15, 0, 0, Math.PI * 2); ctx.fill();
  // 拱形的入口
  ctx.fillStyle = "#d98ba8";
  ctx.beginPath();
  ctx.moveTo(-w * 0.16, h * 0.18);
  ctx.quadraticCurveTo(0, -h * 0.16, w * 0.16, h * 0.18);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#3a2029";
  ctx.beginPath();
  ctx.moveTo(-w * 0.11, h * 0.18);
  ctx.quadraticCurveTo(0, -h * 0.06, w * 0.11, h * 0.18);
  ctx.closePath();
  ctx.fill();
  // 顶上那圈绒毛的边
  ctx.strokeStyle = "rgba(255,255,255,0.75)";
  ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.ellipse(0, 0, w * 0.5, h * 0.46, 0, Math.PI * 1.06, Math.PI * 1.94); ctx.stroke();
};

// 粉色木质卡座：环绕桌子两侧的长椅（餐室）
window.PROP_DRAW["booth974"] = function (ctx, p, T) {
  const side = p.side || -1;
  const w = T * 0.94, h = T * 0.9;
  ctx.save();
  ctx.scale(side < 0 ? 1 : -1, 1);
  // 靠背：粉色的木板，一节一节
  ctx.fillStyle = "#f2a0bd";
  ctx.fillRect(-w / 2, -h / 2, w * 0.30, h);
  ctx.strokeStyle = "rgba(190,90,130,0.6)";
  ctx.lineWidth = 1;
  for (let i = 1; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(-w / 2, -h / 2 + (h / 4) * i);
    ctx.lineTo(-w / 2 + w * 0.30, -h / 2 + (h / 4) * i);
    ctx.stroke();
  }
  // 坐垫
  ctx.fillStyle = "#ffc0d4";
  ctx.fillRect(-w / 2 + w * 0.28, -h * 0.12, w * 0.62, h * 0.42);
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.fillRect(-w / 2 + w * 0.28, -h * 0.12, w * 0.62, 3);
  // 坐垫上的压线
  ctx.strokeStyle = "rgba(200,100,140,0.45)";
  ctx.lineWidth = 1;
  for (let i = 1; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(-w / 2 + w * 0.28 + (w * 0.62 / 3) * i, -h * 0.12);
    ctx.lineTo(-w / 2 + w * 0.28 + (w * 0.62 / 3) * i, -h * 0.12 + h * 0.42);
    ctx.stroke();
  }
  // 桌板：从坐垫这一侧伸出去
  ctx.fillStyle = "#f7d7e3";
  ctx.fillRect(w * 0.02, -h * 0.22, w * 0.48, h * 0.26);
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.fillRect(w * 0.02, -h * 0.22, w * 0.48, 2.5);
  // 桌上的餐巾与一杯东西
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(w * 0.08, -h * 0.18, w * 0.14, h * 0.14);
  ctx.fillStyle = "#e8c46a";
  ctx.fillRect(w * 0.30, -h * 0.20, 4, 7);
  ctx.restore();
};

// 单人床：嵌在房间两侧凸出来的墙面之间（三格拼一张）
window.PROP_DRAW["singlebed974"] = function (ctx, p, T) {
  const part = p.part | 0;
  // 床头那一格
  if (part === 0) {
    ctx.fillStyle = "#e88fae";                       // 床头板
    ctx.fillRect(-T / 2, -T * 0.42, T, T * 0.2);
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fillRect(-T / 2, -T * 0.42, T, 3);
  }
  // 床身
  ctx.fillStyle = "#f4b8cc";
  ctx.fillRect(-T / 2, -T * 0.24, T, T * 0.62);
  // 被褥：粉白条纹
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = i % 2 ? "#ffffff" : "#ffd0e0";
    ctx.fillRect(-T / 2 + 2, -T * 0.18 + i * (T * 0.13), T - 4, T * 0.13);
  }
  // 枕头
  if (part === 0) {
    ctx.fillStyle = "#fffafb";
    ctx.fillRect(-T * 0.34, -T * 0.20, T * 0.5, T * 0.16);
    ctx.strokeStyle = "rgba(200,130,160,0.5)";
    ctx.lineWidth = 1;
    ctx.strokeRect(-T * 0.34, -T * 0.20, T * 0.5, T * 0.16);
  }
  // 床尾
  if (part === 2) {
    ctx.fillStyle = "rgba(190,90,130,0.35)";
    ctx.fillRect(-T / 2, T * 0.34, T, 4);
  }
};

// 开放式衣柜 + 抽屉柜：里面挂满尺码正好的"可爱"衣物
window.PROP_DRAW["wardrobe974"] = function (ctx, p, T) {
  const w = T * 0.88, h = T * 0.94;
  // 柜体
  ctx.fillStyle = "#fff3f6";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.strokeStyle = "#e39ab5";
  ctx.lineWidth = 1.4;
  ctx.strokeRect(-w / 2, -h / 2, w, h);
  // 挂衣杆
  ctx.strokeStyle = "#c9a0b0";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-w / 2 + 3, -h / 2 + 6); ctx.lineTo(w / 2 - 3, -h / 2 + 6);
  ctx.stroke();
  // 挂着的衣物：一件件挨着，颜色都很"可爱"
  const cols = ["#ffd166", "#8fd6c4", "#f4a0c0", "#a8c8f0", "#ffb3c1"];
  for (let i = 0; i < 4; i++) {
    const cx = -w / 2 + 6 + i * (w - 12) / 4;
    ctx.fillStyle = cols[i % cols.length];
    ctx.beginPath();
    ctx.moveTo(cx - 3.4, -h / 2 + 7);
    ctx.lineTo(cx + 3.4, -h / 2 + 7);
    ctx.lineTo(cx + 4.4, h * 0.04);
    ctx.lineTo(cx - 4.4, h * 0.04);
    ctx.closePath();
    ctx.fill();
    // 衣架的钩子
    ctx.strokeStyle = "#b0909c"; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.arc(cx, -h / 2 + 5.5, 1.6, Math.PI * 1.2, Math.PI * 2.2); ctx.stroke();
  }
  // 下面的抽屉柜
  for (let i = 0; i < 2; i++) {
    const dy = h * 0.10 + i * (h * 0.20);
    ctx.fillStyle = "#ffe6ee";
    ctx.fillRect(-w / 2 + 3, dy, w - 6, h * 0.17);
    ctx.strokeStyle = "#e39ab5"; ctx.lineWidth = 1;
    ctx.strokeRect(-w / 2 + 3, dy, w - 6, h * 0.17);
    ctx.fillStyle = "#e8b0c4";
    ctx.fillRect(-4, dy + h * 0.07, 8, 2);
  }
};

// 书桌 + 一台 Win95 的老式电脑
window.PROP_DRAW["computer974"] = function (ctx, p, T) {
  const w = T * 0.92, h = T * 0.9;
  // 桌面
  ctx.fillStyle = "#f2c9d8";
  ctx.fillRect(-w / 2, -h * 0.06, w, h * 0.30);
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.fillRect(-w / 2, -h * 0.06, w, 2.5);
  // 桌腿
  ctx.fillStyle = "#e09ab4";
  ctx.fillRect(-w / 2 + 2, h * 0.22, 4, h * 0.26);
  ctx.fillRect(w / 2 - 6, h * 0.22, 4, h * 0.26);
  // CRT 显示器：笨重的米白色方盒
  ctx.fillStyle = "#e8e4d8";
  ctx.fillRect(-w * 0.28, -h * 0.46, w * 0.56, h * 0.40);
  ctx.fillStyle = "#c8c3b4";
  ctx.fillRect(-w * 0.28, -h * 0.46, w * 0.56, 3);
  // 屏幕：蓝汪汪的 Win95 桌面
  ctx.fillStyle = "#2a5c8a";
  ctx.fillRect(-w * 0.22, -h * 0.40, w * 0.44, h * 0.28);
  ctx.fillStyle = "rgba(255,255,255,0.10)";
  ctx.fillRect(-w * 0.22, -h * 0.40, w * 0.44, 3);
  // 屏幕上的两个窗口
  ctx.fillStyle = "#d8d4c8";
  ctx.fillRect(-w * 0.18, -h * 0.36, w * 0.24, h * 0.14);
  ctx.fillStyle = "#3a6ea5";
  ctx.fillRect(-w * 0.18, -h * 0.36, w * 0.24, 3.5);
  ctx.fillStyle = "#e8e4d8";
  ctx.fillRect(w * 0.02, -h * 0.28, w * 0.22, h * 0.16);
  ctx.fillStyle = "#3a6ea5";
  ctx.fillRect(w * 0.02, -h * 0.28, w * 0.22, 3.5);
  // 底座
  ctx.fillStyle = "#d8d4c8";
  ctx.fillRect(-w * 0.14, -h * 0.08, w * 0.28, 4);
  // 键盘与鼠标
  ctx.fillStyle = "#efece0";
  ctx.fillRect(-w * 0.30, h * 0.02, w * 0.44, h * 0.10);
  ctx.fillStyle = "rgba(120,115,100,0.35)";
  for (let i = 0; i < 5; i++) ctx.fillRect(-w * 0.27 + i * (w * 0.085), h * 0.04, w * 0.06, h * 0.03);
  ctx.fillStyle = "#efece0";
  ctx.beginPath(); ctx.ellipse(w * 0.26, h * 0.07, 4.5, 3.2, 0, 0, Math.PI * 2); ctx.fill();
};

// 粉色冰箱：从里面拿走的东西会以未知方式自行补充
window.PROP_DRAW["fridge974"] = function (ctx, p, T) {
  const w = T * 0.8, h = T * 0.94;
  ctx.fillStyle = "#ffb3c8";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "rgba(255,255,255,0.38)";
  ctx.fillRect(-w / 2, -h / 2, w, 4);
  // 上下两扇门的分缝
  ctx.fillStyle = "rgba(190,90,130,0.5)";
  ctx.fillRect(-w / 2, -h * 0.06, w, 2);
  // 把手
  ctx.fillStyle = "#e07a9f";
  ctx.fillRect(w / 2 - 7, -h * 0.34, 3, h * 0.22);
  ctx.fillRect(w / 2 - 7, h * 0.10, 3, h * 0.22);
  // 门上贴着的卡通磁贴
  ctx.fillStyle = "#fff6c2";
  ctx.beginPath(); ctx.arc(-w * 0.18, -h * 0.22, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#c86a8a";
  ctx.beginPath(); ctx.arc(-w * 0.18, -h * 0.22, 1.6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#b8e6d0";
  ctx.beginPath(); ctx.arc(w * 0.12, h * 0.30, 3.4, 0, Math.PI * 2); ctx.fill();
};

// 食品贮藏室：一扇窄门，后面是塞满食物的架子
window.PROP_DRAW["pantry974"] = function (ctx, p, T) {
  const w = T * 0.86, h = T * 0.92;
  ctx.fillStyle = "#e07a9f";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#2a1a20";
  ctx.fillRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8);
  // 里面的架子：一层层，塞得满满的
  for (let i = 0; i < 3; i++) {
    const sy = -h / 2 + 8 + i * (h - 14) / 3;
    ctx.fillStyle = "#c9a0ae";
    ctx.fillRect(-w / 2 + 4, sy + (h - 14) / 3 - 3, w - 8, 2.5);
    ctx.fillStyle = ["#e8c46a", "#d98ba8", "#8fd6c4"][i];
    for (let j = 0; j < 3; j++) ctx.fillRect(-w / 2 + 7 + j * (w - 14) / 3, sy + 3, 5, (h - 14) / 3 - 8);
  }
  // 门把手
  ctx.fillStyle = "#fff0f4";
  ctx.beginPath(); ctx.arc(w / 2 - 8, 0, 2, 0, Math.PI * 2); ctx.fill();
};

// 厨房台面：厨具、水槽，墙上还挂着特别的厨具
window.PROP_DRAW["kitchen974"] = function (ctx, p, T) {
  const w = T * 0.94, h = T * 0.86;
  // 台面
  ctx.fillStyle = "#f7dde6";
  ctx.fillRect(-w / 2, -h * 0.14, w, h * 0.34);
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.fillRect(-w / 2, -h * 0.14, w, 3);
  // 下面的柜门
  ctx.fillStyle = "#ffa8c2";
  ctx.fillRect(-w / 2 + 2, h * 0.18, w - 4, h * 0.30);
  ctx.strokeStyle = "rgba(190,90,130,0.5)";
  ctx.lineWidth = 1;
  ctx.strokeRect(-w / 2 + 2, h * 0.18, w - 4, h * 0.30);
  // 水槽
  ctx.fillStyle = "#c8cdd2";
  ctx.fillRect(-w * 0.30, -h * 0.10, w * 0.24, h * 0.20);
  ctx.fillStyle = "#8e959b";
  ctx.fillRect(-w * 0.27, -h * 0.07, w * 0.18, h * 0.14);
  // 水龙头
  ctx.strokeStyle = "#d8dde2"; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-w * 0.18, -h * 0.10);
  ctx.quadraticCurveTo(-w * 0.18, -h * 0.22, -w * 0.10, -h * 0.20);
  ctx.stroke();
  // 台面上的锅与罐
  ctx.fillStyle = "#8a6f4a";
  ctx.beginPath(); ctx.ellipse(w * 0.22, -h * 0.12, 8, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#5d5148";
  ctx.fillRect(w * 0.22 + 7, -h * 0.16, 7, 2.5);
  ctx.fillStyle = "#e8c46a";
  ctx.fillRect(w * 0.04, -h * 0.20, 5, 8);
};

// 挂在墙上的特别厨具
window.PROP_DRAW["utensil974"] = function (ctx, p, T) {
  // 挂杆
  ctx.strokeStyle = "#c9a0ae"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(-T * 0.34, -T * 0.30); ctx.lineTo(T * 0.34, -T * 0.30); ctx.stroke();
  const draw = (x, kind) => {
    ctx.strokeStyle = "#b8bcc0"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, -T * 0.28); ctx.lineTo(x, -T * 0.10); ctx.stroke();
    if (kind === 0) {                       // 打蛋器
      ctx.strokeStyle = "#d8dde2"; ctx.lineWidth = 1;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath(); ctx.ellipse(x + i * 2, -T * 0.02, 2, 5, 0, 0, Math.PI * 2); ctx.stroke();
      }
    } else if (kind === 1) {                // 长柄勺
      ctx.fillStyle = "#c8cdd2";
      ctx.beginPath(); ctx.ellipse(x, -T * 0.02, 4, 5, 0, 0, Math.PI * 2); ctx.fill();
    } else {                                // 锅铲
      ctx.fillStyle = "#8a6f4a";
      ctx.fillRect(x - 3.5, -T * 0.06, 7, 8);
    }
  };
  draw(-T * 0.20, 0); draw(0, 1); draw(T * 0.20, 2);
};

// 卫浴：两间浴室各一套（kind 0 = 浴缸，kind 1 = 洗手池）
window.PROP_DRAW["bath974"] = function (ctx, p, T) {
  const w = T * 0.9, h = T * 0.88;
  if ((p.kind | 0) === 0) {
    // 浴缸：粉白色的椭圆缸体，里面盛着水
    ctx.fillStyle = "#fff0f4";
    ctx.beginPath(); ctx.ellipse(0, 0, w * 0.46, h * 0.34, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#e39ab5"; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.ellipse(0, 0, w * 0.46, h * 0.34, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "#b8dce8";
    ctx.beginPath(); ctx.ellipse(0, 1, w * 0.36, h * 0.24, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.beginPath(); ctx.ellipse(-w * 0.10, -h * 0.06, w * 0.14, h * 0.06, 0, 0, Math.PI * 2); ctx.fill();
    // 龙头
    ctx.strokeStyle = "#d8dde2"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-w * 0.46, -h * 0.14); ctx.quadraticCurveTo(-w * 0.40, -h * 0.30, -w * 0.30, -h * 0.24); ctx.stroke();
  } else {
    // 洗手池 + 镜子
    ctx.fillStyle = "#fff0f4";
    ctx.beginPath(); ctx.ellipse(0, h * 0.10, w * 0.36, h * 0.20, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#e39ab5"; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.ellipse(0, h * 0.10, w * 0.36, h * 0.20, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "#c8cdd2";
    ctx.beginPath(); ctx.ellipse(0, h * 0.10, w * 0.22, h * 0.11, 0, 0, Math.PI * 2); ctx.fill();
    // 镜子：圆圆的，边框是粉色
    ctx.fillStyle = "#e8a8c0";
    ctx.beginPath(); ctx.arc(0, -h * 0.26, w * 0.22, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#cfd8de";
    ctx.beginPath(); ctx.arc(0, -h * 0.26, w * 0.17, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.beginPath(); ctx.ellipse(-w * 0.06, -h * 0.31, w * 0.06, h * 0.05, -0.4, 0, Math.PI * 2); ctx.fill();
  }
};

// 毛绒玩具：房间各处都有，捡起来就是一件"可爱"物件
window.PROP_DRAW["plush974"] = function (ctx, p, T) {
  const s = T * 0.72;
  ctx.fillStyle = "rgba(0,0,0,0.20)";
  ctx.beginPath(); ctx.ellipse(0, s * 0.42, s * 0.34, s * 0.14, 0, 0, Math.PI * 2); ctx.fill();
  // 耳朵
  ctx.fillStyle = "#f4c7d6";
  ctx.beginPath(); ctx.arc(-s * 0.28, -s * 0.32, s * 0.16, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(s * 0.28, -s * 0.32, s * 0.16, 0, Math.PI * 2); ctx.fill();
  // 身子与脑袋
  ctx.fillStyle = "#ffd6e2";
  ctx.beginPath(); ctx.ellipse(0, s * 0.16, s * 0.32, s * 0.28, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(0, -s * 0.14, s * 0.32, 0, Math.PI * 2); ctx.fill();
  // 脸
  ctx.fillStyle = "#3a2530";
  ctx.beginPath(); ctx.arc(-s * 0.12, -s * 0.18, s * 0.055, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(s * 0.12, -s * 0.18, s * 0.055, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#3a2530"; ctx.lineWidth = 1.1;
  ctx.beginPath(); ctx.arc(0, -s * 0.06, s * 0.09, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  // 腮红
  ctx.fillStyle = "rgba(240,120,150,0.55)";
  ctx.beginPath(); ctx.arc(-s * 0.23, -s * 0.10, s * 0.08, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(s * 0.23, -s * 0.10, s * 0.08, 0, Math.PI * 2); ctx.fill();
  // 前爪
  ctx.fillStyle = "#ffc6d6";
  ctx.beginPath(); ctx.arc(-s * 0.26, s * 0.24, s * 0.10, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(s * 0.26, s * 0.24, s * 0.10, 0, Math.PI * 2); ctx.fill();
};

// 可爱海报：童年里那些卡通形象
window.PROP_DRAW["poster974"] = function (ctx, p, T) {
  const w = T * 0.72, h = T * 0.62;
  ctx.fillStyle = "#fff6fa";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.strokeStyle = "#f0a8c0"; ctx.lineWidth = 1.4;
  ctx.strokeRect(-w / 2, -h / 2, w, h);
  // 海报上那个圆滚滚的角色
  ctx.fillStyle = "#ffd166";
  ctx.beginPath(); ctx.arc(0, -h * 0.06, w * 0.24, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fff6fa";
  ctx.beginPath(); ctx.arc(-w * 0.09, -h * 0.10, w * 0.05, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(w * 0.09, -h * 0.10, w * 0.05, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#3a2530";
  ctx.beginPath(); ctx.arc(-w * 0.09, -h * 0.10, w * 0.025, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(w * 0.09, -h * 0.10, w * 0.025, 0, Math.PI * 2); ctx.fill();
  // 下面一行小字（看不清写了什么）
  ctx.fillStyle = "#e8a8c0";
  ctx.fillRect(-w * 0.30, h * 0.26, w * 0.60, 2.5);
  ctx.fillRect(-w * 0.20, h * 0.34, w * 0.40, 2);
};

// 空相框：挂在墙上，里面什么也没有
window.PROP_DRAW["frame974"] = function (ctx, p, T) {
  const w = T * 0.58, h = T * 0.5;
  ctx.fillStyle = "#f0d8b0";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#fffafb";
  ctx.fillRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8);
  // 空空的衬纸 —— 相片早就被取走了
  ctx.fillStyle = "rgba(200,190,180,0.35)";
  ctx.fillRect(-w / 2 + 8, -h / 2 + 8, w - 16, h - 16);
  ctx.strokeStyle = "rgba(150,140,130,0.5)"; ctx.lineWidth = 1;
  ctx.strokeRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8);
};

// 窗：不是真的窗户 —— 只是一幅画着户外景色的作品，还带着轻佻的风格
window.PROP_DRAW["window974"] = function (ctx, p, T) {
  const w = T * 0.88, h = T * 0.78;
  // 画框
  ctx.fillStyle = "#fff0f4";
  ctx.fillRect(-w / 2 - 3, -h / 2 - 3, w + 6, h + 6);
  // 画里的内容：天、太阳、山、草地
  ctx.fillStyle = "#9fd8f0";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#ffe08a";
  ctx.beginPath(); ctx.arc(w * 0.28, -h * 0.26, w * 0.14, 0, Math.PI * 2); ctx.fill();
  // 太阳周围那圈故意画歪的光
  ctx.strokeStyle = "#ffd166"; ctx.lineWidth = 1.2;
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + 0.3;
    const r1 = w * 0.18, r2 = w * 0.24 + (i % 2 ? 3 : 0);
    ctx.beginPath();
    ctx.moveTo(w * 0.28 + Math.cos(a) * r1, -h * 0.26 + Math.sin(a) * r1);
    ctx.lineTo(w * 0.28 + Math.cos(a) * r2, -h * 0.26 + Math.sin(a) * r2);
    ctx.stroke();
  }
  // 山
  ctx.fillStyle = "#a8c890";
  ctx.beginPath();
  ctx.moveTo(-w / 2, h * 0.14);
  ctx.lineTo(-w * 0.16, -h * 0.16);
  ctx.lineTo(w * 0.10, h * 0.14);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#8ab070";
  ctx.beginPath();
  ctx.moveTo(-w * 0.10, h * 0.14);
  ctx.lineTo(w * 0.16, -h * 0.08);
  ctx.lineTo(w / 2, h * 0.14);
  ctx.closePath(); ctx.fill();
  // 草地
  ctx.fillStyle = "#b8e090";
  ctx.fillRect(-w / 2, h * 0.14, w, h * 0.36);
  // 草地上那朵傻乎乎的花
  ctx.strokeStyle = "#6a9040"; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(-w * 0.28, h * 0.44); ctx.lineTo(-w * 0.28, h * 0.26); ctx.stroke();
  ctx.fillStyle = "#ff9ec0";
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(-w * 0.28 + Math.cos(a) * 3.2, h * 0.24 + Math.sin(a) * 3.2, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#ffe08a";
  ctx.beginPath(); ctx.arc(-w * 0.28, h * 0.24, 1.8, 0, Math.PI * 2); ctx.fill();
  // 十字窗棂：提醒你这其实只是一幅画
  ctx.strokeStyle = "#fff0f4"; ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(0, -h / 2); ctx.lineTo(0, h / 2);
  ctx.moveTo(-w / 2, 0); ctx.lineTo(w / 2, 0);
  ctx.stroke();
};

// 粉红地毯（客厅中央那一块）
window.PROP_DRAW["rug974"] = function (ctx, p, T) {
  const w = T * 0.9, h = T * 0.66;
  ctx.fillStyle = "#ffa8c2";
  ctx.beginPath(); ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#fff0f4"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(0, 0, w * 0.36, h * 0.36, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.beginPath(); ctx.ellipse(0, 0, w * 0.16, h * 0.16, 0, 0, Math.PI * 2); ctx.fill();
};

// 油腻棉花糖 / 前厅里常见的食物：拿起就能吃
window.PROP_DRAW["treat974"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath(); ctx.ellipse(0, 7, 9, 3.5, 0, 0, Math.PI * 2); ctx.fill();
  // 一小碟棉花糖
  ctx.fillStyle = "#fff0f4";
  ctx.beginPath(); ctx.ellipse(0, 4, 11, 4.5, 0, 0, Math.PI * 2); ctx.fill();
  const cols = ["#ffd6e2", "#fff6c2", "#b8e6d0"];
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = cols[i];
    ctx.beginPath();
    ctx.ellipse(-5 + i * 5, -1 + (i % 2) * 2, 3.6, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.beginPath(); ctx.ellipse(-6 + i * 5, -2 + (i % 2) * 2, 1.4, 1.2, 0, 0, Math.PI * 2); ctx.fill();
  }
};
