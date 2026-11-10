// ===========================================================
// Level 24 —— 月球
//   一个复现了前厅中太阳系的塑料比例模型，材质为高密度聚乙烯 - 聚苯乙烯
//   混合体，覆盖着铅漆涂层。估计为 1:1 的精确复现。截至 2020 年 9 月 24 日，
//   可观测到 11 个天体：太阳、月球，以及九大行星中的八颗。
//   目前唯一可到达的天体是月球 —— 表层由约 30 米厚的铅基浅灰色涂料构成，
//   外观与月球相似，但观察者会受到标准重力的吸引。
//   两种气象现象（已被证实与实体「博福特」直接关联）：
//     · 毒雾：剧毒的水体混合表面活性剂、溶剂及水溶助剂构成的短暂雨状雾气，
//             带刺鼻的柠檬气味。长时间接触会恶心、呕吐，严重时共济失调与肌肉无力。
//     · 沙暴：由干燥的皮屑、塑料微粒、细菌、铅粒、毛发与纤维混合形成的沙尘暴。
//             颗粒物尺寸远超常规标准，尘螨过敏者会不适。
//   模型周边区域被推测为仿维多利亚式书房设计。
//   实体：月螨（无害，6-8 只的交配组合集体活动，会挖浅洞，雌螨产 25-50 枚
//         乳白色虫卵；物资短缺时可作为应急食物）
//         博福特（难以确定大小的巨型类人实体，过于庞大、距离遥远；
//                 能听见并感受到疑似其发出的声音，所有破译尝试均告失败；
//                 偶尔靠近模型建筑，此时两种天气现象之一便可能显现）
//   B.N.T.G. 塑料工场：距蓝洞遗址 1 公里的现代化采矿设施。三支采矿队以三日
//         轮班制作业生活，日均开采加工近 300 吨塑料原料。目前正在招聘新员工，
//         并已批准增建采矿竖井及队员生活区。
//   入口：对着 Level 57 里的画作按 E 切入
//   出口：在塑料工场里，当你找不到出口时，矿工会为你指引一扇门到 Level 1
// ===========================================================
"use strict";

(function () {
  // 铅基浅灰色涂料的月面 / 月球岩壁（都不是黑的，也不是 Level 2 的管道）
  const v = ["#a8aaac", "#6c6e76"];
  if (typeof regTile === "function") regTile("moon24", v);
  else { (window.__NEWTILE_EXTRA = window.__NEWTILE_EXTRA || {})["moon24"] = v; }
})();

// 可观测的 11 个天体（太阳 + 月球 + 九大行星中的八颗）
const BODIES24 = [
  { n: "太阳",   r: 0.150, c: "#ffd24a", glow: true },
  { n: "水星",   r: 0.030, c: "#9a8f82" },
  { n: "金星",   r: 0.048, c: "#e0c07a" },
  { n: "地球",   r: 0.052, c: "#5a8fd0" },
  { n: "火星",   r: 0.038, c: "#c86a42" },
  { n: "木星",   r: 0.105, c: "#d0a878" },
  { n: "土星",   r: 0.090, c: "#e0cd9a", ring: true },
  { n: "天王星", r: 0.062, c: "#8fd0d8" },
  { n: "海王星", r: 0.060, c: "#5a72d0" },
];
window.BODIES24 = BODIES24;

function generateMoon24Map(level) {
  const size = 104;
  const grid = makeGrid(size);
  const props = [];
  const floors = [];

  const moon = new Set();      // 月面（铅基浅灰色涂料）
  const crater = new Set();    // 环形山内部（比月面更暗一点）
  const ridge = new Set();     // 环形山脊 / 岩壁（墙）
  const rug = new Set();       // 维多利亚式书房的地毯
  const works = new Set();     // B.N.T.G. 塑料工场内部
  const worksWall = new Set();

  const CX = Math.round(size / 2), CY = Math.round(size / 2);

  // ---------- 整片月面 ----------
  for (let y = 3; y < size - 3; y++) for (let x = 3; x < size - 3; x++) {
    grid[y][x] = 0; moon.add(x + "," + y);
  }

  // ---------- 环形山：一圈岩壁，里面是坑底 ----------
  // 每座都开 1~2 个缺口 —— 不然整片月面会被切成互不相通的碎块。
  const craters = [];
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2 + rand(0, 0.9);
    const rr = 12 + rand(0, size * 0.30);
    const cx = Math.round(CX + Math.cos(a) * rr), cy = Math.round(CY + Math.sin(a) * rr);
    const rad = 3 + randInt(0, 3);
    if (Math.hypot(cx - CX, cy - CY) < 10) continue;
    for (let y = cy - rad; y <= cy + rad; y++) for (let x = cx - rad; x <= cx + rad; x++) {
      if (x < 3 || y < 3 || x > size - 4 || y > size - 4) continue;
      const d = Math.hypot(x - cx, y - cy);
      if (d > rad) continue;
      if (d > rad - 1.4) { grid[y][x] = 1; moon.delete(x + "," + y); ridge.add(x + "," + y); }
      else { crater.add(x + "," + y); moon.delete(x + "," + y); }
    }
    // 缺口：随机 1~2 个角度
    const gaps = 1 + randInt(0, 1);
    for (let g2 = 0; g2 < gaps; g2++) {
      const ga = rand(0, Math.PI * 2);
      for (let s = 0; s < 3; s++) {
        const gx = Math.round(cx + Math.cos(ga) * (rad - 0.5 - s * 0.5));
        const gy = Math.round(cy + Math.sin(ga) * (rad - 0.5 - s * 0.5));
        if (gx < 3 || gy < 3 || gx > size - 4 || gy > size - 4) continue;
        grid[gy][gx] = 0; ridge.delete(gx + "," + gy); moon.add(gx + "," + gy);
      }
    }
    craters.push({ x: cx, y: cy, r: rad });
  }

  // ---------- 岩壁露头：几块实心的石头 ----------
  for (let i = 0; i < 12; i++) {
    const cx = randInt(8, size - 9), cy = randInt(8, size - 9);
    const rad = 1 + randInt(0, 2);
    for (let y = cy - rad; y <= cy + rad; y++) for (let x = cx - rad; x <= cx + rad; x++) {
      if (x < 3 || y < 3 || x > size - 4 || y > size - 4) continue;
      if (Math.hypot(x - cx, y - cy) > rad) continue;
      grid[y][x] = 1; moon.delete(x + "," + y); crater.delete(x + "," + y); ridge.add(x + "," + y);
    }
  }

  // ---------- 周边区域：仿维多利亚式书房 ----------
  // 档案：模型周边区域被推测为仿维多利亚式书房设计。陈设的具体形态与方位
  // 尚未明确 —— 所以它们散在外圈，看得出是书房里的东西，但摆得没什么道理。
  const study = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + rand(-0.15, 0.15);
    const rr = size * 0.40 + rand(0, size * 0.06);
    const x = Math.round(CX + Math.cos(a) * rr), y = Math.round(CY + Math.sin(a) * rr);
    if (x < 4 || y < 4 || x > size - 5 || y > size - 5) continue;
    if (grid[y][x] !== 0) continue;
    study.push({ x, y });
  }
  // 书房中间铺一张地毯（地面装饰）
  for (const s of study) {
    for (let dy = -2; dy <= 2; dy++) for (let dx = -3; dx <= 3; dx++) {
      const k = (s.x + dx) + "," + (s.y + dy);
      if (moon.has(k)) rug.add(k);
    }
  }

  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return null;
    if (grid[y][x] !== 0) return null;
    const p = Object.assign({ x, y, floor: 0, type }, extra || {});
    props.push(p);
    return p;
  };

  // 书房里的陈设：书架 / 书桌 / 地球仪 / 壁炉 / 台灯 / 扶手椅
  const KINDS = ["p24bookshelf", "p24desk", "p24globe", "p24fire", "p24lamp", "p24chair"];
  for (let i = 0; i < study.length; i++) {
    const s = study[i];
    put(s.x, s.y, KINDS[i % KINDS.length]);
    if (i % 3 === 0) put(s.x + 2, s.y, "p24chair");
    if (i % 4 === 0) put(s.x, s.y + 2, "p24bookshelf");
  }

  // ---------- B.N.T.G. 塑料工场 ----------
  // 距蓝洞遗址 1 公里的现代化采矿设施：采矿竖井 + 队员生活区 + 招聘告示
  const WX0 = Math.round(size * 0.60), WY0 = 8;
  const WW = 30, WH = 26;
  const wx1 = WX0 + WW - 1, wy1 = WY0 + WH - 1;
  for (let x = WX0; x <= wx1; x++) {
    for (const y of [WY0, wy1]) { grid[y][x] = 1; worksWall.add(x + "," + y); moon.delete(x + "," + y); }
  }
  for (let y = WY0; y <= wy1; y++) {
    for (const x of [WX0, wx1]) { grid[y][x] = 1; worksWall.add(x + "," + y); moon.delete(x + "," + y); }
  }
  for (let y = WY0 + 1; y < wy1; y++) for (let x = WX0 + 1; x < wx1; x++) {
    grid[y][x] = 0; moon.delete(x + "," + y); works.add(x + "," + y);
  }
  // 中间一道隔墙：左边是采矿竖井，右边是队员生活区
  const midX = Math.round((WX0 + wx1) / 2);
  for (let y = WY0 + 1; y < wy1; y++) { grid[y][midX] = 1; worksWall.add(midX + "," + y); works.delete(midX + "," + y); }
  for (let d = 0; d <= 1; d++) {
    const gy = Math.round((WY0 + wy1) / 2) + d;
    grid[gy][midX] = 0; worksWall.delete(midX + "," + gy); works.add(midX + "," + gy);
  }
  // 正门（南墙）
  const wGateX = Math.round((WX0 + midX) / 2);
  for (let d = 0; d <= 1; d++) {
    grid[wy1][wGateX + d] = 0; worksWall.delete((wGateX + d) + "," + wy1); works.add((wGateX + d) + "," + wy1);
  }
  // 工场内部
  put(Math.round((WX0 + 1 + midX - 1) / 2), Math.round((WY0 + 1 + wy1 - 1) / 2), "p24shaft");
  put(Math.round((WX0 + 1 + midX - 1) / 2) - 2, Math.round((WY0 + 1 + wy1 - 1) / 2) + 2, "p24plastic");
  put(Math.round((WX0 + 1 + midX - 1) / 2) + 2, Math.round((WY0 + 1 + wy1 - 1) / 2) - 2, "p24plastic");
  for (let i = 0; i < 4; i++) {
    put(midX + 2 + (i % 2) * 4, WY0 + 4 + Math.floor(i / 2) * 8, "p24bunk");
  }
  put(midX + 3, wy1 - 3, "p24crate");
  put(midX + 6, wy1 - 4, "p24crate");
  // 招聘告示：钉在正门内侧
  const notice = put(wGateX, wy1 - 1, "p24notice");
  // 矿工：在工场里，找不到出口的时候他会给你指一扇门
  const miner = put(Math.round((midX + 1 + wx1 - 1) / 2), Math.round((WY0 + wy1) / 2), "p24miner", { talk: 0, toLevel: 1 });

  // ---------- 月螨：无害，6-8 只的交配组合集体活动 ----------
  // 它们会主动避开人类活动区域 —— 所以只是摆着，不追人。
  const miteGroups = [];
  for (let g2 = 0; g2 < 3; g2++) {
    const a = rand(0, Math.PI * 2), rr = 18 + rand(0, size * 0.24);
    const gx = Math.round(CX + Math.cos(a) * rr), gy = Math.round(CY + Math.sin(a) * rr);
    const n = 6 + randInt(0, 2);
    const grp = { x: gx, y: gy };
    for (let i = 0; i < n; i++) {
      const mx = gx + randInt(-3, 3), my = gy + randInt(-3, 3);
      const p = put(mx, my, "p24mite");
      if (p) grp.n = (grp.n || 0) + 1;
    }
    if (grp.n) miteGroups.push(grp);
  }
  // 浅洞 + 乳白色虫卵（物资短缺时可作应急食物）
  for (let i = 0; i < 5; i++) {
    const a = rand(0, Math.PI * 2), rr = 16 + rand(0, size * 0.26);
    const ex = Math.round(CX + Math.cos(a) * rr), ey = Math.round(CY + Math.sin(a) * rr);
    const burrow = put(ex, ey, "p24burrow");
    if (burrow) {
      for (let k = 0; k < 3; k++) put(ex + randInt(-1, 1), ey + randInt(-1, 1), "p24egg");
    }
  }

  // ---------- 出生：月面上，正对着那片星空 ----------
  let start = { x: CX, y: size - 12, floor: 0 };
  if (grid[start.y][start.x] !== 0) {
    for (const t of [[0, 0], [1, 0], [-1, 0], [0, -1], [0, 1], [2, 0], [-2, 0]]) {
      const nx = start.x + t[0], ny = start.y + t[1];
      if (grid[ny] && grid[ny][nx] === 0) { start = { x: nx, y: ny, floor: 0 }; break; }
    }
  }

  collectFloorsInto(grid, size, floors);

  return {
    size, level: 24, doubleStory: false,
    layers: [grid], grid, rooms: [[]], floors: [floors],
    start, exit: null, doors: [], ramps: [],
    props, crates: [], ground: [
      { x: midX + 4, y: wy1 - 3, floor: 0, item: "almond", taken: false },
      { x: midX + 5, y: wy1 - 5, floor: 0, item: "almond", taken: false },
      { x: WX0 + 3, y: wy1 - 2, floor: 0, item: "energybar", taken: false },
    ],

    style: "moon24",
    tileName: "moon24",
    moon24: moon, crater24: crater, ridge24: ridge, rug24: rug,
    works24: works, worksWall24: worksWall,
    craters24: craters, study24: study, mite24: miteGroups,
    worksRect24: { x0: WX0, y0: WY0, x1: wx1, y1: wy1, gateX: wGateX, midX },
    miner24: miner, notice24: notice,
    // 天气：由博福特靠近模型建筑而引发
    wx24: null, wxT24: 6 + Math.random() * 8, beaufort24: 0,
  };
}
window.generateMoon24Map = generateMoon24Map;

// ---------------- 地面 ----------------
window.drawMoon24Floor = function (ctx, px, py, S, map, tx, ty) {
  const k = tx + "," + ty;
  const t = performance.now() / 1000;
  const h = hash2(tx, ty);
  if (map.rug24 && map.rug24.has(k)) {
    // 维多利亚式书房的地毯：暗红，织着花纹
    ctx.fillStyle = "#7a4a44";
    ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(230,200,150,.18)";
    ctx.fillRect(px + 3, py + 3, S - 6, S - 6);
    ctx.strokeStyle = "rgba(50,26,24,.35)"; ctx.lineWidth = 1;
    ctx.strokeRect(px + 7.5, py + 7.5, S - 15, S - 15);
    return true;
  }
  if (map.works24 && map.works24.has(k)) {
    // 塑料工场的地面：浅灰的水泥，划着黄色的安全线
    ctx.fillStyle = "#b9bcc0";
    ctx.fillRect(px, py, S, S);
    ctx.strokeStyle = "rgba(90,94,100,.30)"; ctx.lineWidth = 1;
    ctx.strokeRect(px + 0.5, py + 0.5, S - 1, S - 1);
    if (((tx + ty) % 7) === 0) {
      ctx.fillStyle = "rgba(226,190,60,.55)";
      ctx.fillRect(px, py + S * 0.42, S, 2.5);
    }
    return true;
  }
  if (map.crater24 && map.crater24.has(k)) {
    // 环形山的坑底：比月面暗一点，但不是黑的
    ctx.fillStyle = "#8d8f92";
    ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(60,62,68,.28)";
    ctx.fillRect(px, py, S, 2.5);
    if (h > 0.82) { ctx.fillStyle = "rgba(70,72,78,.30)"; ctx.fillRect(px + 4, py + 5, S - 10, S - 12); }
    return true;
  }
  // 月面：约 30 米厚的铅基浅灰色涂料
  ctx.fillStyle = "#a8aaac";
  ctx.fillRect(px, py, S, S);
  // 涂料的颗粒感 + 一块块刷痕
  ctx.fillStyle = "rgba(255,255,255,.10)";
  ctx.fillRect(px, py, S, 2);
  if (h > 0.62) {
    ctx.fillStyle = "rgba(120,122,128,.26)";
    ctx.fillRect(px + (h * S * 0.6 | 0), py + ((h * 97) % (S - 6) | 0), 5, 3);
  }
  if (h < 0.10) {
    ctx.fillStyle = "rgba(228,230,234,.35)";
    ctx.fillRect(px + 3, py + 4, 4, 4);
  }
  // 塑料模型在日光下的那层反光
  const sh = Math.sin(t * 0.4 + tx * 0.2 + ty * 0.15) * 0.5 + 0.5;
  ctx.fillStyle = "rgba(240,244,255," + (0.03 + sh * 0.04).toFixed(3) + ")";
  ctx.fillRect(px, py, S, S);
  return true;
};

// ---------------- 墙 ----------------
window.drawMoon24Wall = function (ctx, px, py, S, map, tx, ty) {
  const k = tx + "," + ty;
  if (map.worksWall24 && map.worksWall24.has(k)) {
    // 塑料工场的墙：波纹钢板，一条条竖棱 —— 不是管道
    ctx.fillStyle = "#8e949c";
    ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(60,66,74,.35)";
    for (let i = 0; i < 4; i++) ctx.fillRect(px + i * S / 4 + 1, py, 2, S);
    ctx.fillStyle = "rgba(255,255,255,.20)";
    ctx.fillRect(px, py, S, 2);
    ctx.fillStyle = "rgba(0,0,0,.28)";
    ctx.fillRect(px, py + S - 3, S, 3);
    return true;
  }
  // 月球岩壁 / 环形山脊：中灰色，一层层的岩层 —— 明显比地面 (168,170,172) 暗
  ctx.fillStyle = "#6c6e76";
  ctx.fillRect(px, py, S, S);
  ctx.fillStyle = "rgba(48,50,58,.35)";
  ctx.fillRect(px, py + S * 0.50, S, 3);
  ctx.fillRect(px, py + S * 0.78, S, 2);
  ctx.fillStyle = "rgba(190,196,206,.22)";
  ctx.fillRect(px, py, S, 3);
  // 岩石的碎屑
  const h = hash2(tx, ty);
  if (h > 0.55) {
    ctx.fillStyle = "rgba(140,146,158,.35)";
    ctx.fillRect(px + (h * S * 0.7 | 0), py + ((h * 53) % (S - 8) | 0) + 4, 4, 3);
  }
  return true;
};

// ---------------- 环境：星空 + 11 个天体 + 博福特 + 两种天气 ----------------
window.drawMoon24 = function (ctx, g) {
  const cw = (ctx.canvas && ctx.canvas.width) || 800;
  const ch = (ctx.canvas && ctx.canvas.height) || 600;
  const t = performance.now() / 1000;
  const m = g && g.map;
  ctx.save();
  try { ctx.setTransform(1, 0, 0, 1, 0, 0); } catch (e) { /* 忽略 */ }

  // 天：不是纯黑 —— 深蓝紫的夜空，看得见星
  const gr = ctx.createLinearGradient(0, 0, 0, ch);
  gr.addColorStop(0, "rgba(10,14,34,.55)");
  gr.addColorStop(1, "rgba(18,22,44,.30)");
  ctx.fillStyle = gr;
  ctx.fillRect(0, 0, cw, ch);

  // 星
  for (let i = 0; i < 90; i++) {
    const sx = (i * 71.7) % cw;
    const sy = ((i * 43.3) % (ch * 0.55));
    const tw = 0.30 + Math.sin(t * 1.1 + i) * 0.25;
    ctx.fillStyle = "rgba(255,255,255," + Math.max(0.06, tw).toFixed(2) + ")";
    ctx.fillRect(sx, sy, 1.7, 1.7);
  }

  // 11 个天体：太阳 + 月球之外的八颗行星（塑料模型，1:1）
  const bx0 = cw * 0.08, by0 = ch * 0.14, span = cw * 0.84;
  for (let i = 0; i < BODIES24.length; i++) {
    const b = BODIES24[i];
    const bx = bx0 + span * ((i + 0.5) / BODIES24.length);
    const by = by0 + Math.sin(t * 0.18 + i * 0.9) * 6;
    const r = Math.max(3, ch * b.r * 0.42);
    if (b.glow) {
      const gg = ctx.createRadialGradient(bx, by, r * 0.2, bx, by, r * 2.6);
      gg.addColorStop(0, "rgba(255,214,110,.55)");
      gg.addColorStop(1, "rgba(255,214,110,0)");
      ctx.fillStyle = gg;
      ctx.beginPath(); ctx.arc(bx, by, r * 2.6, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = b.c;
    ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI * 2); ctx.fill();
    // 塑料的高光
    ctx.fillStyle = "rgba(255,255,255,.28)";
    ctx.beginPath(); ctx.arc(bx - r * 0.32, by - r * 0.32, r * 0.30, 0, Math.PI * 2); ctx.fill();
    if (b.ring) {
      ctx.strokeStyle = "rgba(240,225,180,.75)"; ctx.lineWidth = Math.max(1.5, r * 0.22);
      ctx.beginPath();
      ctx.ellipse(bx, by, r * 1.75, r * 0.52, -0.35, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // 博福特：难以确定大小的巨型类人实体。它在很远的地方 —— 只画一个剪影。
  // 它偶尔靠近模型建筑，此时两种天气现象之一便可能显现。
  const appr = m ? (m.beaufort24 || 0) : 0;      // 0~1：越接近 1 越近
  if (appr > 0.01) {
    const bx = cw * (0.78 - appr * 0.10), by = ch * (0.52 + Math.sin(t * 0.25) * 0.02);
    const hh = ch * (0.30 + appr * 0.55);
    const ww = hh * 0.34;
    ctx.fillStyle = "rgba(6,8,18," + (0.30 + appr * 0.45).toFixed(3) + ")";
    // 头
    ctx.beginPath(); ctx.arc(bx, by - hh * 0.42, ww * 0.30, 0, Math.PI * 2); ctx.fill();
    // 身体
    ctx.beginPath();
    ctx.moveTo(bx - ww * 0.30, by - hh * 0.24);
    ctx.lineTo(bx + ww * 0.30, by - hh * 0.24);
    ctx.lineTo(bx + ww * 0.52, by + hh * 0.30);
    ctx.lineTo(bx - ww * 0.52, by + hh * 0.30);
    ctx.closePath(); ctx.fill();
    // 两条胳膊
    ctx.fillRect(bx - ww * 0.85, by - hh * 0.18, ww * 0.26, hh * 0.42);
    ctx.fillRect(bx + ww * 0.59, by - hh * 0.18, ww * 0.26, hh * 0.42);
  }

  // 天气一：毒雾 —— 短暂的雨状雾气，带着刺鼻的柠檬气味
  if (m && m.wx24 === "fog") {
    ctx.fillStyle = "rgba(196,214,90,.16)";
    ctx.fillRect(0, 0, cw, ch);
    for (let i = 0; i < 70; i++) {
      const dx = (i * 97.3 + t * 60) % (cw + 60) - 30;
      const dy = (i * 61.7 + t * 190) % (ch + 40) - 20;
      ctx.fillStyle = "rgba(220,236,120,.30)";
      ctx.fillRect(dx, dy, 1.6, 7);
    }
    ctx.fillStyle = "rgba(150,180,60,.10)";
    ctx.fillRect(0, 0, cw, ch);
  }
  // 天气二：沙暴 —— 皮屑、塑料微粒、细菌、铅粒、毛发与纤维
  if (m && m.wx24 === "sand") {
    ctx.fillStyle = "rgba(186,164,118,.24)";
    ctx.fillRect(0, 0, cw, ch);
    for (let i = 0; i < 130; i++) {
      const dx = (i * 53.1 + t * 420) % (cw + 80) - 40;
      const dy = (i * 37.9 + Math.sin(t * 1.4 + i) * 26) % ch;
      const sz = 1 + (i % 3);
      ctx.fillStyle = ["rgba(214,196,150,.62)", "rgba(168,150,110,.55)", "rgba(232,220,190,.50)"][i % 3];
      ctx.fillRect(dx, dy, sz * 2.2, sz);
    }
  }
  ctx.restore();
};

// ================= 物件 =================
window.PROP_DRAW = window.PROP_DRAW || {};

// 维多利亚式书房：书架
window.PROP_DRAW["p24bookshelf"] = function (ctx, p, T) {
  const w = T * 0.86, h = T * 1.00;
  ctx.fillStyle = "#5d3a22";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#3a2414";
  ctx.fillRect(-w / 2 + 2, -h / 2 + 2, w - 4, h - 4);
  for (let r = 0; r < 3; r++) {
    const yy = -h / 2 + 4 + r * (h - 8) / 3;
    ctx.fillStyle = "#7a5230";
    ctx.fillRect(-w / 2 + 3, yy + (h - 8) / 3 - 3, w - 6, 2.5);
    for (let i = 0; i < 5; i++) {
      const bx = -w / 2 + 4 + i * (w - 8) / 5;
      const hh = 8 + ((p.x * 7 + p.y * 3 + i + r) % 6);
      ctx.fillStyle = ["#7a3a2a", "#2f4a3a", "#6a5a2a", "#4a3a5a", "#5a3a4a"][(i + r) % 5];
      ctx.fillRect(bx, yy + (h - 8) / 3 - 3 - hh, (w - 8) / 5 - 1.5, hh);
    }
  }
};
// 书桌
window.PROP_DRAW["p24desk"] = function (ctx, p, T) {
  const w = T * 0.92, h = T * 0.62;
  ctx.fillStyle = "#6b4526";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "rgba(255,230,190,.18)";
  ctx.fillRect(-w / 2, -h / 2, w, 3);
  ctx.fillStyle = "rgba(0,0,0,.30)";
  ctx.fillRect(-w / 2, h / 2 - 4, w, 4);
  // 桌上的纸和一支羽毛笔
  ctx.fillStyle = "#efe6cc";
  ctx.fillRect(-w * 0.30, -h * 0.24, w * 0.44, h * 0.38);
  ctx.fillStyle = "#3a2a1a";
  ctx.fillRect(w * 0.22, -h * 0.06, 2.5, h * 0.30);
};
// 地球仪
window.PROP_DRAW["p24globe"] = function (ctx, p, T) {
  const w = T * 0.52, h = T * 0.72;
  ctx.fillStyle = "#6b4526";
  ctx.fillRect(-w * 0.12, h * 0.10, w * 0.24, h * 0.22);
  ctx.fillRect(-w * 0.30, h * 0.30, w * 0.60, h * 0.08);
  ctx.fillStyle = "#4a7ab0";
  ctx.beginPath(); ctx.arc(0, -h * 0.06, w * 0.40, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#5a9a52";                       // 陆地
  ctx.beginPath();
  ctx.ellipse(-w * 0.12, -h * 0.14, w * 0.18, h * 0.07, 0.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath();
  ctx.ellipse(w * 0.16, h * 0.02, w * 0.14, h * 0.06, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#c8a44e"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(0, -h * 0.06, w * 0.44, 0, Math.PI * 2); ctx.stroke();
};
// 壁炉
window.PROP_DRAW["p24fire"] = function (ctx, p, T) {
  const t = performance.now() / 1000;
  const w = T * 0.88, h = T * 0.86;
  ctx.fillStyle = "#6b6058";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#2a2018";
  ctx.fillRect(-w * 0.30, -h * 0.10, w * 0.60, h * 0.46);
  // 火：一跳一跳的
  const fh = h * (0.20 + Math.sin(t * 4 + p.x) * 0.05);
  ctx.fillStyle = "#e8702a";
  ctx.beginPath();
  ctx.moveTo(-w * 0.20, h * 0.34);
  ctx.lineTo(0, h * 0.34 - fh);
  ctx.lineTo(w * 0.20, h * 0.34);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#f2c83a";
  ctx.beginPath();
  ctx.moveTo(-w * 0.09, h * 0.34);
  ctx.lineTo(0, h * 0.34 - fh * 0.62);
  ctx.lineTo(w * 0.09, h * 0.34);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#8a7a6a";
  ctx.fillRect(-w / 2, -h / 2, w, h * 0.14);
};
// 台灯
window.PROP_DRAW["p24lamp"] = function (ctx, p, T) {
  const w = T * 0.44, h = T * 0.80;
  ctx.fillStyle = "#7a5a3a";
  ctx.fillRect(-w * 0.08, -h * 0.10, w * 0.16, h * 0.44);
  ctx.fillRect(-w * 0.28, h * 0.30, w * 0.56, h * 0.06);
  ctx.fillStyle = "#d8c48a";
  ctx.beginPath();
  ctx.moveTo(-w * 0.30, -h * 0.12);
  ctx.lineTo(w * 0.30, -h * 0.12);
  ctx.lineTo(w * 0.20, -h * 0.44);
  ctx.lineTo(-w * 0.20, -h * 0.44);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = "rgba(255,240,190,.30)";
  ctx.beginPath(); ctx.arc(0, h * 0.02, w * 0.42, 0, Math.PI * 2); ctx.fill();
};
// 扶手椅
window.PROP_DRAW["p24chair"] = function (ctx, p, T) {
  const w = T * 0.66, h = T * 0.70;
  ctx.fillStyle = "#8a4a3a";
  ctx.fillRect(-w / 2, -h * 0.06, w, h * 0.40);       // 座
  ctx.fillRect(-w / 2, -h / 2, w * 0.22, h * 0.48);   // 靠背
  ctx.fillRect(w / 2 - w * 0.22, -h / 2, w * 0.22, h * 0.48);
  ctx.fillStyle = "rgba(0,0,0,.22)";
  ctx.fillRect(-w / 2, h * 0.32, w, 3);
};
// 采矿竖井
window.PROP_DRAW["p24shaft"] = function (ctx, p, T) {
  const w = T * 0.90, h = T * 0.90;
  ctx.fillStyle = "#5a6068";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  // 井口：往下望是一片暗，但看得见梯子
  ctx.fillStyle = "#22262c";
  ctx.fillRect(-w * 0.34, -h * 0.34, w * 0.68, h * 0.68);
  ctx.strokeStyle = "#c8a44e"; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-w * 0.34, -h * 0.34); ctx.lineTo(w * 0.34, -h * 0.34);
  ctx.lineTo(w * 0.34, h * 0.34); ctx.lineTo(-w * 0.34, h * 0.34);
  ctx.closePath(); ctx.stroke();
  ctx.strokeStyle = "#8a949c"; ctx.lineWidth = 1.5;
  for (let i = 0; i < 5; i++) {
    const yy = -h * 0.28 + i * h * 0.14;
    ctx.beginPath(); ctx.moveTo(-w * 0.14, yy); ctx.lineTo(w * 0.14, yy); ctx.stroke();
  }
  ctx.beginPath(); ctx.moveTo(-w * 0.14, -h * 0.30); ctx.lineTo(-w * 0.14, h * 0.30);
  ctx.moveTo(w * 0.14, -h * 0.30); ctx.lineTo(w * 0.14, h * 0.30); ctx.stroke();
};
// 一垛加工好的塑料原料
window.PROP_DRAW["p24plastic"] = function (ctx, p, T) {
  const w = T * 0.76, h = T * 0.56;
  ctx.fillStyle = "#d8d4c8";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "rgba(150,146,136,.45)";
  for (let i = 0; i < 3; i++) ctx.fillRect(-w / 2 + 2, -h / 2 + 4 + i * h / 3, w - 4, 2);
  ctx.fillStyle = "rgba(255,255,255,.35)";
  ctx.fillRect(-w / 2, -h / 2, w, 3);
  ctx.strokeStyle = "rgba(110,106,96,.5)"; ctx.lineWidth = 1;
  ctx.strokeRect(-w / 2 + 0.5, -h / 2 + 0.5, w - 1, h - 1);
};
// 队员生活区的床铺
window.PROP_DRAW["p24bunk"] = function (ctx, p, T) {
  const w = T * 0.76, h = T * 0.56;
  ctx.fillStyle = "#7a8288";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#b9c0c6";
  ctx.fillRect(-w / 2, -h / 2, w, h * 0.46);        // 褥子
  ctx.fillStyle = "#5a6268";
  ctx.fillRect(-w / 2, -h * 0.02, w, h * 0.22);     // 被子
  ctx.fillStyle = "#e8e4d8";
  ctx.fillRect(-w / 2 + 2, -h / 2 - 3, w * 0.30, 5); // 枕头
};
// 工场里的货箱
window.PROP_DRAW["p24crate"] = function (ctx, p, T) {
  const w = T * 0.70, h = T * 0.60;
  ctx.fillStyle = "#9a7a4a";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.strokeStyle = "rgba(80,58,30,.6)"; ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-w / 2, -h / 2); ctx.lineTo(w / 2, h / 2);
  ctx.moveTo(w / 2, -h / 2); ctx.lineTo(-w / 2, h / 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(80,58,30,.5)";
  ctx.strokeRect(-w / 2 + 0.5, -h / 2 + 0.5, w - 1, h - 1);
};
// 招聘告示：B.N.T.G. 塑料工场正在招聘新员工
window.PROP_DRAW["p24notice"] = function (ctx, p, T) {
  const w = T * 0.78, h = T * 0.66;
  ctx.fillStyle = "#f2ead6";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#c8443a";
  ctx.fillRect(-w / 2, -h / 2, w, h * 0.22);
  ctx.fillStyle = "#f2ead6";
  ctx.font = "bold " + Math.max(6, Math.round(T * 0.14)) + "px sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("招聘", 0, -h * 0.39);
  ctx.fillStyle = "#5a5246";
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(-w * 0.38, -h * 0.16 + i * h * 0.15, w * (0.76 - (i % 2) * 0.22), 2);
  }
};
// 矿工：找不到出口的时候，他会为你指一扇门
window.PROP_DRAW["p24miner"] = function (ctx, p, T) {
  const t = performance.now() / 1000;
  const w = T * 0.50, h = T * 0.86;
  const sway = Math.sin(t * 0.8 + p.x) * 1.0;
  ctx.translate(sway, 0);
  ctx.fillStyle = "#e0a83a";                        // 反光背心
  ctx.fillRect(-w / 2, -h * 0.10, w, h * 0.44);
  ctx.fillStyle = "#c8c8c8";                        // 反光条
  ctx.fillRect(-w / 2, -h * 0.02, w, 3);
  ctx.fillRect(-w / 2, h * 0.12, w, 3);
  ctx.fillStyle = "#e8c9a8";                        // 头
  ctx.beginPath(); ctx.arc(0, -h * 0.28, w * 0.33, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#e8c22a";                        // 安全帽
  ctx.beginPath();
  ctx.arc(0, -h * 0.30, w * 0.38, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-w * 0.42, -h * 0.32, w * 0.84, 3);
  ctx.fillStyle = "#5a5246";                        // 手里的工具
  ctx.fillRect(w * 0.26, h * 0.02, 3, h * 0.24);
  ctx.translate(-sway, 0);
};
// 月螨：无害。热带无爪螨 / 美洲尘螨 / 欧洲尘螨，体型远超普通同类
window.PROP_DRAW["p24mite"] = function (ctx, p, T) {
  const t = performance.now() / 1000;
  const w = T * 0.34, h = T * 0.28;
  const wob = Math.sin(t * 2.2 + p.x * 1.7 + p.y) * 1.2;
  ctx.translate(wob, 0);
  ctx.fillStyle = "#c8a882";                        // 躯干
  ctx.beginPath();
  ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#b0906a";
  ctx.beginPath();
  ctx.arc(-w * 0.34, 0, w * 0.20, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#8a7050"; ctx.lineWidth = 1;   // 八条腿
  for (let i = 0; i < 4; i++) {
    const ly = -h * 0.28 + i * h * 0.19;
    ctx.beginPath();
    ctx.moveTo(-w * 0.16, ly); ctx.lineTo(-w * 0.52, ly + (i % 2 ? 3 : -3));
    ctx.moveTo(w * 0.16, ly); ctx.lineTo(w * 0.52, ly + (i % 2 ? -3 : 3));
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(255,255,255,.22)";
  ctx.beginPath(); ctx.ellipse(-w * 0.10, -h * 0.16, w * 0.14, h * 0.12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.translate(-wob, 0);
};
// 月螨挖的浅洞
window.PROP_DRAW["p24burrow"] = function (ctx, p, T) {
  const w = T * 0.62, h = T * 0.44;
  ctx.fillStyle = "#8d8f92";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#5e6066";
  ctx.beginPath();
  ctx.ellipse(0, 0, w * 0.34, h * 0.34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#8a8c90";                        // 刨出来的土堆在边上
  ctx.beginPath();
  ctx.ellipse(w * 0.30, h * 0.10, w * 0.18, h * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();
};
// 乳白色虫卵（每只雌螨可产 25-50 枚；物资短缺时可作应急食物）
window.PROP_DRAW["p24egg"] = function (ctx, p, T) {
  const w = T * 0.18, h = T * 0.14;
  ctx.fillStyle = "#f2ece0";
  ctx.beginPath();
  ctx.ellipse(0, 0, w, h, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.55)";
  ctx.beginPath();
  ctx.ellipse(-w * 0.28, -h * 0.30, w * 0.34, h * 0.30, 0, 0, Math.PI * 2);
  ctx.fill();
};
