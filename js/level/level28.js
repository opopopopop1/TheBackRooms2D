// ===========================================================
// Level 28 —— 终末美德
//   永远阴晦之天空下的风袭草地。从不降雨，天上没有太阳也没有月亮，
//   只有一道微弱的蓝光把这一层照亮。
//   最安全的区域大致跨度为 13.5 公里 —— 之外，群峦环抱中坐落着
//   一片侵蚀不断、形似黏稠柏油的黑暗：活体深渊，正缓慢向中心行进。
//     · 第 1 阶段：锁定心智，记忆成片消失（可逆，杏仁水可加快）
//     · 接触超 8 小时 -> 第 2 阶段：血管扩张变暗、高烧、无法响应（不可逆）
//     · 之后 3~4 小时 -> 第 3 阶段：从指尖开始，整个人解体为灰烬状颗粒
//   岚石环阵：距要塞约 1.5 千米，6 块立石排成圆圈，每块刻着一道符文和一句描述。
//   间歇闪电：7 个小范围区间，平均分布在安全区边界上。
//     层内计时：每次雷击相隔恰好 1 小时；层外计时：约 51 分钟 —— 有时间膨胀。
//     深渊惧怕雷击，会主动避开这些区域。
//   岚石要塞：破败的欧式中世纪城堡，大致在安全区中心。
//     内部是唯一不沐浴在恒久蓝光下的地方 —— 用台灯和吊灯照明。
//     二层有 7 间客房和 1 间蓝骑士的卧房；地下室是一处锻炉。
//   实体：大体绝迹（从别处切入的实体会立即解体）。
//     唯一定居的是蓝骑士 —— 一副硕大而空洞的盔甲，自称「滕必忍斯」。
//   ===========================================================
//   入口：在 Level 14 找到一只粉色的蝴蝶；在 Level 27 爬一条洞穴
//   出口：坠入一口深渊池内，有概率送入 Level 10.1；
//         奔跑着撞向岚石要塞的一盏台灯，可抵 Level 4 或 Level 5 其一
// ===========================================================
"use strict";

(function () {
  // 风袭草地的灰绿 / 城堡的石头（都不是黑的，也不是 Level 2 的管道）
  const v = ["#7c8a63", "#8d8577"];
  if (typeof regTile === "function") regTile("virtue28", v);
  else { (window.__NEWTILE_EXTRA = window.__NEWTILE_EXTRA || {})["virtue28"] = v; }
})();

// 6 块立石：符文 + 描述（档案里的原文）
const STONES28 = [
  { st: "ST-1", name: "普鲁当思", en: "Prudence", cn: "审慎", desc: "一道诅咒" },
  { st: "ST-2", name: "藿普",     en: "Hope",     cn: "希望", desc: "一片晴空" },
  { st: "ST-3", name: "斐斯",     en: "Faith",    cn: "诚信", desc: "一个永恒的家" },
  { st: "ST-4", name: "佛毅鸠德", en: "Fortitude",cn: "刚毅", desc: "一股炽热的力量" },
  { st: "ST-5", name: "加斯提义斯", en: "Justice", cn: "正义", desc: "一场永不止息的风暴" },
  { st: "ST-6", name: "慈哈尔蒂", en: "Charity",  cn: "慷慨", desc: "[无法破译]" },
];
window.STONES28 = STONES28;

// 7 个雷击区间：平均分布在安全区边界上
const BOLTS28 = 7;
window.BOLTS28 = BOLTS28;

function generateVirtue28Map(level) {
  const size = 122;
  const grid = makeGrid(size);
  const props = [];
  const floors = [];

  const grass = new Set();   // 风袭草地（安全区）
  const abyss = new Set();   // 活体深渊（柏油状，会污染你）
  const pools = new Set();   // 深渊池（掉进去有概率到 Level 10.1）
  const stone = new Set();   // 城堡的石砌（墙）
  const indoors = new Set(); // 城堡内部（不沐浴在蓝光下的地方）
  const CX = Math.round(size / 2), CY = Math.round(size / 2);

  // ---------- 安全区：一圈草地 ----------
  const SAFE = size * 0.40;
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      const d = Math.hypot(x - CX, y - CY);
      if (d < SAFE) { grid[y][x] = 0; grass.add(x + "," + y); }
      else { grid[y][x] = 0; abyss.add(x + "," + y); }   // 深渊：能走进去，但会被污染
    }
  }
  // 最外两圈做成墙，免得走出地图边界
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    if (x < 2 || y < 2 || x > size - 3 || y > size - 3) {
      grid[y][x] = 1; grass.delete(x + "," + y); abyss.delete(x + "," + y);
    }
  }

  // ---------- 深渊池：几口，散在深渊里 ----------
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.6;
    const r = SAFE + (size * 0.5 - SAFE) * 0.55;
    const px = Math.round(CX + Math.cos(a) * r), py = Math.round(CY + Math.sin(a) * r);
    for (let y = py - 2; y <= py + 2; y++) for (let x = px - 2; x <= px + 2; x++) {
      if (x < 3 || y < 3 || x > size - 4 || y > size - 4) continue;
      if (Math.hypot(x - px, y - py) > 2) continue;
      abyss.delete(x + "," + y);
      pools.add(x + "," + y);
    }
  }

  // ---------- 岚石环阵：6 块立石排成圆圈，距要塞约 1.5 千米 ----------
  const RING = 30;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const sx = Math.round(CX + Math.cos(a) * RING), sy = Math.round(CY + Math.sin(a) * RING);
    props.push({ x: sx, y: sy, floor: 0, type: "p28stone", idx: i,
      tip: STONES28[i].st + " —— " + STONES28[i].name + "（" + STONES28[i].cn + "）" });
  }

  // ---------- 岚石要塞：中心的破败中世纪城堡 ----------
  const W = 30, H = 24;
  const bx0 = CX - Math.round(W / 2), by0 = CY - Math.round(H / 2);
  const bx1 = bx0 + W - 1, by1 = by0 + H - 1;
  // 外墙
  for (let x = bx0; x <= bx1; x++) { grid[by0][x] = 1; grid[by1][x] = 1; stone.add(x + "," + by0); stone.add(x + "," + by1); }
  for (let y = by0; y <= by1; y++) { grid[y][bx0] = 1; grid[y][bx1] = 1; stone.add(bx0 + "," + y); stone.add(bx1 + "," + y); }
  // 内部：先全铺成地面
  for (let y = by0 + 1; y < by1; y++) for (let x = bx0 + 1; x < bx1; x++) {
    grid[y][x] = 0; grass.delete(x + "," + y); indoors.add(x + "," + y);
  }
  // 内墙：4 列 x 3 行的房间网格
  const COLS = 4, ROWS = 3;
  const cw = Math.floor((W - 2) / COLS), chh = Math.floor((H - 2) / ROWS);
  const roomRect = (c, r) => ({
    x0: bx0 + 1 + c * cw, y0: by0 + 1 + r * chh,
    x1: bx0 + 1 + c * cw + cw - 1, y1: by0 + 1 + r * chh + chh - 1,
  });
  // 房间之间的隔墙
  for (let c = 1; c < COLS; c++) {
    const wx = bx0 + 1 + c * cw - 1;
    for (let y = by0 + 1; y < by1; y++) { grid[y][wx] = 1; stone.add(wx + "," + y); }
  }
  for (let r = 1; r < ROWS; r++) {
    const wy = by0 + 1 + r * chh - 1;
    for (let x = bx0 + 1; x < bx1; x++) { grid[wy][x] = 1; stone.add(x + "," + wy); }
  }
  // 房间分配：中央两格打通成大厅；7 间客房；1 间蓝骑士卧房；1 间锻炉
  const rooms = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) rooms.push(roomRect(c, r));
  const hall = [rooms[5], rooms[6]];                 // 中排中间两格 = 大厅
  const guestIdx = [0, 1, 2, 3, 4, 7, 10];           // 7 间客房
  const knightIdx = 8;                               // 蓝骑士的卧房
  const forgeIdx = 9;                                // 地下室：锻炉
  const restIdx = [11];                              // 剩下的一间：空着
  // 大厅：把两格中间的隔墙拆掉
  {
    const a = hall[0], b = hall[1];
    const wy = a.y0;
    for (let y = a.y0; y <= a.y1; y++) for (let x = a.x0; x <= b.x1; x++) {
      if (x < bx0 + 1 || x > bx1 - 1 || y < by0 + 1 || y > by1 - 1) continue;
      grid[y][x] = 0; indoors.add(x + "," + y); stone.delete(x + "," + y);
    }
  }
  // 每间房往大厅/走廊开一个门洞
  const doorAt = (rect, side) => {
    if (side === "down") {
      const x = Math.round((rect.x0 + rect.x1) / 2);
      for (let d = 0; d <= 1; d++) {
        const gx = x + d, gy = rect.y1;
        if (gx > bx0 && gx < bx1 && gy < by1) { grid[gy][gx] = 0; indoors.add(gx + "," + gy); stone.delete(gx + "," + gy); }
      }
    } else if (side === "up") {
      const x = Math.round((rect.x0 + rect.x1) / 2);
      for (let d = 0; d <= 1; d++) {
        const gx = x + d, gy = rect.y0;
        if (gx > bx0 && gx < bx1 && gy > by0) { grid[gy][gx] = 0; indoors.add(gx + "," + gy); stone.delete(gx + "," + gy); }
      }
    } else if (side === "right") {
      const y = Math.round((rect.y0 + rect.y1) / 2);
      for (let d = 0; d <= 1; d++) {
        const gx = rect.x1, gy = y + d;
        if (gy > by0 && gy < by1 && gx < bx1) { grid[gy][gx] = 0; indoors.add(gx + "," + gy); stone.delete(gx + "," + gy); }
      }
    } else {
      const y = Math.round((rect.y0 + rect.y1) / 2);
      for (let d = 0; d <= 1; d++) {
        const gx = rect.x0, gy = y + d;
        if (gy > by0 && gy < by1 && gx > bx0) { grid[gy][gx] = 0; indoors.add(gx + "," + gy); stone.delete(gx + "," + gy); }
      }
    }
  };
  for (const i of guestIdx) doorAt(rooms[i], i < 4 ? "down" : (i === 7 ? "right" : "up"));
  doorAt(rooms[knightIdx], "left");
  doorAt(rooms[forgeIdx], "down");
  doorAt(rooms[restIdx[0]], "left");
  // 城堡的正门（南墙正中）
  const gateX = Math.round((bx0 + bx1) / 2);
  for (let d = 0; d <= 1; d++) {
    const gx = gateX + d;
    grid[by1][gx] = 0; stone.delete(gx + "," + by1); indoors.add(gx + "," + by1);
    grid[by1 - 1][gx] = 0; indoors.add(gx + "," + (by1 - 1));
  }
  // 正门外侧接一条通向草地的路
  for (let y = by1 + 1; y < Math.min(size - 3, by1 + 8); y++) for (let d = 0; d <= 1; d++) {
    const gx = gateX + d;
    grid[y][gx] = 0; grass.add(gx + "," + y);
  }

  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return null;
    if (grid[y][x] !== 0) return null;
    const p = Object.assign({ x, y, floor: 0, type }, extra || {});
    props.push(p);
    return p;
  };
  const center = (rect) => ({ x: Math.round((rect.x0 + rect.x1) / 2), y: Math.round((rect.y0 + rect.y1) / 2) });

  // ---------- 城堡内部的灯：台灯和吊灯（唯一不被蓝光笼罩的地方）----------
  const lamps = [];
  const putLamp = (x, y) => {
    const p = put(x, y, "p28lamp");
    if (p) lamps.push(p);
    return p;
  };
  {
    const h0 = center(hall[0]), h1 = center(hall[1]);
    putLamp(h0.x, h0.y);
    putLamp(h1.x, h1.y);
    for (const i of guestIdx) { const c = center(rooms[i]); putLamp(c.x, c.y - 1); }
    const kc = center(rooms[knightIdx]); putLamp(kc.x, kc.y);
  }
  // 出口那盏台灯：奔跑着撞向它 -> Level 4 或 Level 5
  const exitLamp = putLamp(center(hall[1]).x + 2, center(hall[1]).y + 1);
  if (exitLamp) exitLamp.exitLamp = true;

  // ---------- 7 间客房：床 ----------
  for (const i of guestIdx) {
    const c = center(rooms[i]);
    put(c.x - 1, c.y, "p28bed");
    put(c.x + 1, c.y + 1, "p28chair");
  }
  // ---------- 蓝骑士的卧房 ----------
  {
    const c = center(rooms[knightIdx]);
    put(c.x, c.y, "p28armor");
    put(c.x - 1, c.y + 1, "p28book");
  }
  // ---------- 地下室：锻炉 ----------
  {
    const c = center(rooms[forgeIdx]);
    put(c.x, c.y, "p28forge");
    put(c.x - 1, c.y, "p28weapon");
    put(c.x + 1, c.y, "p28weapon");
    put(c.x, c.y + 1, "p28weapon");
  }
  // ---------- 蓝骑士本人：站在正门内 ----------
  const knight = put(gateX, by1 - 2, "p28knight", { talk: 0 });

  // ---------- 草地上：被风吹弯的草、几块碎石（装饰，走得到的地方）----------
  for (let i = 0; i < 40; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = RING + 6 + Math.random() * (SAFE - RING - 10);
    const x = Math.round(CX + Math.cos(a) * r), y = Math.round(CY + Math.sin(a) * r);
    put(x, y, "p28tuft");
  }

  collectFloorsInto(grid, size, floors);

  // 出生：城堡正门外那条路上，面朝要塞
  const start = { x: gateX, y: Math.min(size - 4, by1 + 5), floor: 0 };

  return {
    size, level: 28, doubleStory: false,
    layers: [grid], grid, rooms: [[]], floors: [floors],
    start, exit: null, doors: [], ramps: [],
    props, crates: [], ground: [],

    style: "virtue28",
    tileName: "virtue28",
    grass28: grass, abyss28: abyss, pools28: pools, stone28: stone, indoors28: indoors,
    castle28: { bx0, by0, bx1, by1, gateX },
    ring28: RING, safe28: SAFE,
    knight28: knight, exitLamp28: exitLamp,
  };
}
window.generateVirtue28Map = generateVirtue28Map;

// ---------------- 地面 ----------------
window.drawVirtue28Floor = function (ctx, px, py, S, map, tx, ty) {
  const k = tx + "," + ty;
  const t = performance.now() / 1000;
  if (map.pools28 && map.pools28.has(k)) {
    // 深渊池：一池黏稠的柏油，慢慢地起伏
    const w = Math.sin(t * 0.5 + tx * 0.3 + ty * 0.22);
    const b = 20 + w * 6;
    ctx.fillStyle = "rgb(" + Math.round(b) + "," + Math.round(b * 0.98) + "," + Math.round(b * 1.25) + ")";
    ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(150,160,220,.10)";
    ctx.fillRect(px, py + ((t * 8 + tx * 5) % S), S, 2);
    return true;
  }
  if (map.abyss28 && map.abyss28.has(k)) {
    // 活体深渊：柏油状的黑 —— 但它"活着"，会起伏、会呼吸
    const w = Math.sin(t * 0.6 + tx * 0.25) + Math.sin(t * 0.35 + ty * 0.4);
    const b = 26 + w * 7;
    ctx.fillStyle = "rgb(" + Math.round(b * 0.85) + "," + Math.round(b * 0.85) + "," + Math.round(b * 1.15) + ")";
    ctx.fillRect(px, py, S, S);
    // 偶尔翻起来的一小团
    if (((tx * 7 + ty * 5 + Math.floor(t * 0.7)) % 11) === 0) {
      ctx.fillStyle = "rgba(60,60,84,.85)";
      ctx.beginPath();
      ctx.arc(px + S * 0.5, py + S * 0.5, S * 0.30, 0, Math.PI * 2);
      ctx.fill();
    }
    return true;
  }
  if (map.indoors28 && map.indoors28.has(k)) {
    // 城堡内部：石头地面，被台灯照着 —— 这里没有那层蓝光
    ctx.fillStyle = "#9a9284";
    ctx.fillRect(px, py, S, S);
    const h = hash2(tx, ty);
    if ((h & 3) === 0) {
      ctx.strokeStyle = "rgba(80,74,64,.35)";
      ctx.lineWidth = 1;
      ctx.strokeRect(px + 1.5, py + 1.5, S - 3, S - 3);
    }
    ctx.fillStyle = "rgba(255,226,180,.06)";
    ctx.fillRect(px, py, S, S);
    return true;
  }
  // 风袭草地
  ctx.fillStyle = "#7c8a63";
  ctx.fillRect(px, py, S, S);
  const h2 = hash2(tx, ty);
  // 被风压弯的草：一小撮一小撮
  ctx.fillStyle = "rgba(96,112,74,.55)";
  for (let i = 0; i < 3; i++) {
    const gx = px + 3 + ((h2 + i * 9) % (S - 6));
    const gy = py + 4 + ((h2 + i * 5) % (S - 8));
    ctx.fillRect(gx, gy, 2, 5);
  }
  if ((h2 & 7) === 0) {
    ctx.fillStyle = "rgba(150,160,120,.30)";
    ctx.fillRect(px + 2, py + 2, S - 5, S - 5);
  }
  return true;
};

// ---------------- 墙 ----------------
window.drawVirtue28Wall = function (ctx, px, py, S, map, tx, ty) {
  const k = tx + "," + ty;
  const t = performance.now() / 1000;
  if (map.stone28 && map.stone28.has(k)) {
    // 城堡的石砌：一块块凿出来的方石
    ctx.fillStyle = "#8d8577";
    ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(70,64,56,.40)";
    ctx.fillRect(px, py + S * 0.52, S, 2);
    ctx.fillRect(px + S * 0.5, py, 2, S * 0.52);
    ctx.fillRect(px + S * 0.25, py + S * 0.52, 2, S * 0.48);
    ctx.fillStyle = "rgba(255,255,255,.09)";
    ctx.fillRect(px, py, S, 2);
    // 破败：墙皮剥落的地方
    if (((tx * 5 + ty * 3) % 9) === 0) {
      ctx.fillStyle = "rgba(60,54,46,.55)";
      ctx.fillRect(px + 3, py + 4, S - 8, S - 9);
    }
    return true;
  }
  // 群峦：环抱在深渊之外的那些山
  ctx.fillStyle = "#6b6f74";
  ctx.fillRect(px, py, S, S);
  ctx.fillStyle = "#575b60";
  ctx.beginPath();
  ctx.moveTo(px, py + S);
  ctx.lineTo(px + S * 0.5, py + S * 0.18);
  ctx.lineTo(px + S, py + S);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(180,190,220,.10)";
  ctx.fillRect(px, py, S, 2);
  return true;
};

// ---------------- 环境：永远阴晦的天空 + 那道微弱的蓝光 ----------------
window.drawVirtue28 = function (ctx, g) {
  const cw = (ctx.canvas && ctx.canvas.width) || 800;
  const ch = (ctx.canvas && ctx.canvas.height) || 600;
  const t = performance.now() / 1000;
  const m = g && g.map;
  ctx.save();
  try { ctx.setTransform(1, 0, 0, 1, 0, 0); } catch (e) { /* 忽略 */ }

  // 那一道微弱的蓝光：没有太阳也没有月亮，只有它把这一层照亮
  ctx.fillStyle = "rgba(96,124,196,.16)";
  ctx.fillRect(0, 0, cw, ch);
  // 阴晦的天：压得很低的一层灰
  const gr = ctx.createLinearGradient(0, 0, 0, ch);
  gr.addColorStop(0, "rgba(58,62,78,.30)");
  gr.addColorStop(0.5, "rgba(70,74,90,.10)");
  gr.addColorStop(1, "rgba(40,44,58,.16)");
  ctx.fillStyle = gr;
  ctx.fillRect(0, 0, cw, ch);

  // ---- 间歇闪电：7 个区间轮转 ----
  // 层内计时每次相隔 1 小时（层外 51 分钟 —— 有时间膨胀）。
  // 游戏里按 30 秒一轮：一轮走完，下一个区间落雷。
  const CYCLE = 30;
  const idx = Math.floor(t / CYCLE) % BOLTS28;
  const ph = (t % CYCLE) / CYCLE;
  if (ph > 0.982) {
    // 一瞬间的白 —— 深渊会在这时畏缩
    const f = (ph - 0.982) / 0.018;
    const a = 0.55 * (1 - Math.abs(f - 0.5) * 2);
    ctx.fillStyle = "rgba(220,232,255," + Math.max(0, a).toFixed(3) + ")";
    ctx.fillRect(0, 0, cw, ch);
    // 那一道落下来的雷：打在对应区间的方向上
    if (m && g.cam) {
      const ang = (idx / BOLTS28) * Math.PI * 2 - Math.PI / 2;
      const wx = (m.size / 2 + Math.cos(ang) * (m.safe28 || 46)) * (typeof TILE === "number" ? TILE : 40);
      const sx = wx - g.cam.x + cw / 2;
      ctx.strokeStyle = "rgba(235,244,255,.85)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx - 10, ch * 0.35);
      ctx.lineTo(sx + 6, ch * 0.5);
      ctx.lineTo(sx - 4, ch * 0.66);
      ctx.stroke();
    }
  }
  ctx.restore();
};

// ---------------- 物件 ----------------
window.PROP_DRAW = window.PROP_DRAW || {};

// 岚石环阵：6 块立石，每块刻着一道符文和一句描述
window.PROP_DRAW["p28stone"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  const t = performance.now() / 1000;
  const i = p.idx | 0;
  // 立石：一块长方形的巨石
  ctx.fillStyle = "#8a8578";
  ctx.fillRect(x + T * 0.26, y + T * 0.10, T * 0.48, T * 0.84);
  ctx.fillStyle = "#9d988a";
  ctx.fillRect(x + T * 0.26, y + T * 0.10, T * 0.18, T * 0.84);
  ctx.fillStyle = "rgba(255,255,255,.10)";
  ctx.fillRect(x + T * 0.26, y + T * 0.10, T * 0.48, 2);
  // 风蚀：缺掉的一小块（受损后不会复原到原本状态）
  ctx.fillStyle = "rgba(70,66,58,.55)";
  ctx.fillRect(x + T * 0.58, y + T * 0.46, T * 0.14, T * 0.16);
  // 符文：不是任何已知语言的一部分
  ctx.strokeStyle = "rgba(150,178,220,.75)";
  ctx.lineWidth = 1.6;
  const cx = x + T * 0.5, cy = y + T * 0.34;
  ctx.beginPath();
  for (let s = 0; s < 3; s++) {
    const a0 = (s / 3) * Math.PI * 2 + i * 0.7;
    ctx.moveTo(cx + Math.cos(a0) * 5, cy + Math.sin(a0) * 5);
    ctx.lineTo(cx + Math.cos(a0 + 2.1) * 5, cy + Math.sin(a0 + 2.1) * 5);
  }
  ctx.stroke();
  // 微微地发着蓝光
  const gl = 0.10 + 0.07 * Math.sin(t * 0.8 + i);
  ctx.fillStyle = "rgba(140,170,235," + gl.toFixed(3) + ")";
  ctx.fillRect(x + T * 0.26, y + T * 0.10, T * 0.48, T * 0.84);
};

// 城堡里的台灯 / 吊灯 —— 唯一不被蓝光笼罩的光源
window.PROP_DRAW["p28lamp"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  const t = performance.now() / 1000;
  // 灯座
  ctx.fillStyle = "#6b5a44";
  ctx.fillRect(x + T * 0.40, y + T * 0.62, T * 0.20, T * 0.26);
  // 灯罩
  ctx.fillStyle = "#e6d9b4";
  ctx.beginPath();
  ctx.moveTo(x + T * 0.28, y + T * 0.26);
  ctx.lineTo(x + T * 0.72, y + T * 0.26);
  ctx.lineTo(x + T * 0.62, y + T * 0.62);
  ctx.lineTo(x + T * 0.38, y + T * 0.62);
  ctx.closePath();
  ctx.fill();
  // 暖光
  const gl = 0.30 + 0.10 * Math.sin(t * 2.2 + (p.x | 0));
  const rg = ctx.createRadialGradient(x + T * 0.5, y + T * 0.45, 1, x + T * 0.5, y + T * 0.45, T * 1.5);
  rg.addColorStop(0, "rgba(255,226,168," + gl.toFixed(3) + ")");
  rg.addColorStop(1, "rgba(255,226,168,0)");
  ctx.fillStyle = rg;
  ctx.fillRect(x - T, y - T, T * 3, T * 3);
  // 出口那盏：多一层白，好认
  if (p.exitLamp) {
    ctx.strokeStyle = "rgba(255,250,226,.55)";
    ctx.lineWidth = 1.4;
    ctx.strokeRect(x + 2.5, y + 2.5, T - 5, T - 5);
  }
};

// 客房里的床
window.PROP_DRAW["p28bed"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#7b6a4e";
  ctx.fillRect(x + 3, y + T * 0.22, T - 6, T * 0.72);
  ctx.fillStyle = "#b9ad8e";
  ctx.fillRect(x + 4, y + T * 0.30, T - 8, T * 0.42);
  ctx.fillStyle = "#ded4b8";
  ctx.fillRect(x + 4, y + T * 0.26, T * 0.34, T * 0.18);
};

// 椅子
window.PROP_DRAW["p28chair"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#6f6047";
  ctx.fillRect(x + T * 0.28, y + T * 0.42, T * 0.44, T * 0.12);
  ctx.fillRect(x + T * 0.30, y + T * 0.54, T * 0.08, T * 0.30);
  ctx.fillRect(x + T * 0.62, y + T * 0.54, T * 0.08, T * 0.30);
  ctx.fillRect(x + T * 0.28, y + T * 0.22, T * 0.44, T * 0.10);
};

// 蓝骑士卧房里那副空着的盔甲
window.PROP_DRAW["p28armor"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#5d6c8a";
  ctx.fillRect(x + T * 0.30, y + T * 0.18, T * 0.40, T * 0.66);
  ctx.fillStyle = "#48566f";
  ctx.fillRect(x + T * 0.34, y + T * 0.10, T * 0.32, T * 0.12);
  ctx.fillStyle = "rgba(255,255,255,.14)";
  ctx.fillRect(x + T * 0.34, y + T * 0.22, T * 0.10, T * 0.44);
};

// 书
window.PROP_DRAW["p28book"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#8c4a3c";
  ctx.fillRect(x + T * 0.24, y + T * 0.46, T * 0.52, T * 0.30);
  ctx.fillStyle = "#d8cdb0";
  ctx.fillRect(x + T * 0.28, y + T * 0.50, T * 0.44, T * 0.20);
};

// 地下室的锻炉
window.PROP_DRAW["p28forge"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  const t = performance.now() / 1000;
  ctx.fillStyle = "#4a4540";
  ctx.fillRect(x + 3, y + T * 0.28, T - 6, T * 0.62);
  const gl = 0.55 + 0.35 * Math.sin(t * 3.1);
  ctx.fillStyle = "rgba(255,140,50," + gl.toFixed(3) + ")";
  ctx.fillRect(x + T * 0.26, y + T * 0.46, T * 0.48, T * 0.24);
  ctx.fillStyle = "rgba(255,220,150," + (gl * 0.6).toFixed(3) + ")";
  ctx.fillRect(x + T * 0.34, y + T * 0.52, T * 0.32, T * 0.10);
};

// 散落在锻炉地面上的畸形金属（刀剑 / 流星锤 / 长矛）
window.PROP_DRAW["p28weapon"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.strokeStyle = "#8b8f96";
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(x + T * 0.24, y + T * 0.74);
  ctx.lineTo(x + T * 0.72, y + T * 0.32);
  ctx.stroke();
  ctx.fillStyle = "#6d5a44";
  ctx.fillRect(x + T * 0.18, y + T * 0.70, T * 0.16, T * 0.08);
};

// 蓝骑士：一副硕大而空洞的盔甲，自称「滕必忍斯」
window.PROP_DRAW["p28knight"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  const t = performance.now() / 1000;
  // 一副硕大的盔甲 —— 里面是空的
  ctx.fillStyle = "#43536f";
  ctx.fillRect(x + T * 0.24, y + T * 0.14, T * 0.52, T * 0.72);
  // 头盔：面甲后面什么都没有
  ctx.fillStyle = "#54657f";
  ctx.fillRect(x + T * 0.30, y + T * 0.14, T * 0.40, T * 0.24);
  ctx.fillStyle = "#10141c";
  ctx.fillRect(x + T * 0.34, y + T * 0.20, T * 0.32, T * 0.12);
  // 肩甲
  ctx.fillStyle = "#5a6b86";
  ctx.fillRect(x + T * 0.14, y + T * 0.38, T * 0.16, T * 0.16);
  ctx.fillRect(x + T * 0.70, y + T * 0.38, T * 0.16, T * 0.16);
  // 那把能危及深渊的剑
  ctx.strokeStyle = "#c8d2e2";
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(x + T * 0.80, y + T * 0.30);
  ctx.lineTo(x + T * 0.86, y + T * 0.80);
  ctx.stroke();
  // 一层很轻的蓝光 —— 他并不危险
  const gl = 0.10 + 0.06 * Math.sin(t * 1.1);
  ctx.fillStyle = "rgba(140,175,240," + gl.toFixed(3) + ")";
  ctx.fillRect(x + T * 0.14, y + T * 0.14, T * 0.72, T * 0.72);
};

// 被风吹弯的草（装饰）
window.PROP_DRAW["p28tuft"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  const t = performance.now() / 1000;
  const bend = Math.sin(t * 1.4 + p.x * 0.6 + p.y * 0.4) * 3;
  ctx.strokeStyle = "rgba(104,120,80,.75)";
  ctx.lineWidth = 1.6;
  for (let i = 0; i < 4; i++) {
    const gx = x + 6 + i * 6;
    ctx.beginPath();
    ctx.moveTo(gx, y + T * 0.78);
    ctx.quadraticCurveTo(gx + bend, y + T * 0.5, gx + bend * 1.6, y + T * 0.24);
    ctx.stroke();
  }
};

// ---------------- Level 14 里的入口：一只粉色的蝴蝶 ----------------
window.PROP_DRAW["bfly28"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  const t = performance.now() / 1000;
  const flap = Math.abs(Math.sin(t * 5.5 + (p.x | 0)));
  const cx = x + T * 0.5, cy = y + T * 0.48;
  // 翅膀：粉色，一开一合
  ctx.fillStyle = "#f2a2c4";
  for (const s of [-1, 1]) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(s * (0.45 + flap * 0.55), 1);
    ctx.beginPath();
    ctx.ellipse(T * 0.20, -T * 0.06, T * 0.20, T * 0.16, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(T * 0.16, T * 0.16, T * 0.14, T * 0.12, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // 身体
  ctx.fillStyle = "#6a4a54";
  ctx.fillRect(cx - 1.5, cy - T * 0.14, 3, T * 0.30);
};
