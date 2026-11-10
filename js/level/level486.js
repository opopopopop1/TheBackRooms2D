// ===========================================================
// Level 486 —— 罪恶之地
// 一片极其致命与罪恶之地：疑似俄罗斯的大型废弃矿镇，
// 被严重污染的森林包围 —— 森林最终通向 Level 10。
// 市中心的核电站已严重损毁，仍在泄露致命剂量的辐射。
// 出口：在森林里穿行得够久 -> Level 10
// ===========================================================
"use strict";

function generateSinLandMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const props = [];
  const grass = new Set();

  // 中央是镇子：成排的房子 + 街道
  const townX = Math.floor(size * 0.22), townY = Math.floor(size * 0.22);
  const townW = Math.floor(size * 0.50), townH = Math.floor(size * 0.50);
  for (let r = 0; r < 4; r++) {
    const y = townY + r * Math.floor(townH / 4);
    for (let x = townX + 2; x < townX + townW - 4; x++) { grid[y][x] = 0; grid[y + 1][x] = 0; }   // 街道
    for (let c = 0; c < 4; c++) {
      const bx = townX + 2 + c * Math.floor((townW - 6) / 4);
      const by = y + 3;
      if (by + 4 < townY + townH) carveRoom(grid, size, bx, by, 5, 4);
    }
  }
  // 四周是森林（可走，穿过去就是 Level 10）
  for (let y = 2; y < size - 2; y++) {
    for (let x = 2; x < size - 2; x++) {
      const inTown = x >= townX && x < townX + townW && y >= townY && y < townY + townH;
      if (!inTown) { grid[y][x] = 0; grass.add(x + "," + y); }
    }
  }
  // 核电站：镇中心一栋大建筑
  const px = townX + Math.floor(townW / 2) - 5, py = townY + Math.floor(townH / 2) - 4;
  carveRoom(grid, size, px, py, 10, 8);

  // 工厂：镇子东边那一排厂房 —— 烟囱日夜不停地冒着烟。
  // 那片烟是通往 Level 790 的入口（档案原文：触碰工厂散发的烟雾即可到达）。
  const fcx = Math.min(size - 16, townX + townW + 3), fcy = townY + 4;
  carveRoom(grid, size, fcx, fcy, 12, 8);

  // 连通兜底：房子是成排挖出来的，房间之间不一定开门 —— 以前出生点正好
  // 落在某一间没开门的房子里，玩家一进来就被关在 5×4 的屋子里出不去。
  ensureAllConnected(grid, size, { x: townX + 4, y: townY });
  const floors = collectFloors(grid, size);
  // 出生点放在横贯镇子的街道上（townY 那一行），不要放进房子里
  const start = { x: townX + 4, y: townY, floor: 0 };

  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return;
    if (grid[y][x] !== 0) return;
    props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  };
  // 核电站：反应堆厂房 + 冷却塔
  put(px + 2, py + 2, "reactor486");
  put(px + 6, py + 5, "coolingtower");
  // 工厂：厂房 + 两根烟囱
  put(fcx + 3, fcy + 3, "factory486");
  // 烟：从厂房往东飘出去的一条带子 —— 走进去就到 Level 790。
  // 只挑走得到的地面格，每隔两格放一团，免得糊成一片。
  {
    const sx0 = fcx + 6, sy0 = fcy + 3;
    const picked = [];
    for (const f of floors) {
      const dx = f.x - sx0, dy = f.y - sy0;
      if (dx < 0 || dx > 11) continue;
      if (Math.abs(dy) > 1 + Math.floor(dx * 0.6)) continue;
      if (picked.some((q) => Math.abs(q.x - f.x) + Math.abs(q.y - f.y) < 2)) continue;
      picked.push(f);
      if (picked.length >= 12) break;
    }
    for (const f of picked) put(f.x, f.y, "smoke486");
    if (!picked.length) put(sx0, sy0, "smoke486");
  }
  for (let i = 0; i < 18; i++) {
    const f = floors[randInt(0, floors.length - 1)];
    put(f.x, f.y, grass.has(f.x + "," + f.y) ? "deadtree486" : "radbarrel");
  }
  // 森林深处的出口 -> Level 10
  // 以前写死在 (size-5, size/2)，那一格常常是树/墙，put 会静默丢弃，
  // 就算放下来了也常被林子围死走不到 —— 改成挑一个走得到的林地。
  {
    const t2 = new Set(props.map((q) => q.x + "," + q.y));
    const seen = new Set([start.x + "," + start.y]);
    const q2 = [[start.x, start.y]];
    let best = null, bd = -1;
    while (q2.length) {
      const [x, y] = q2.shift();
      const dxr = x - start.x, dyr = y - start.y;
      if (!t2.has(x + "," + y) && x > size * 0.5) {
        const d2 = Math.abs(x - (size - 5)) * 0.4 + Math.abs(y - Math.floor(size / 2));
        if (best === null || d2 < bd) { best = [x, y]; bd = d2; }
      }
      for (let i = 0; i < 4; i++) {
        const nx = x + [1, -1, 0, 0][i], ny = y + [0, 0, 1, -1][i];
        const kk = nx + "," + ny;
        if (nx < 1 || ny < 1 || nx >= size - 1 || ny >= size - 1) continue;
        if (grid[ny][nx] !== 0 || seen.has(kk)) continue;
        seen.add(kk); q2.push([nx, ny]);
      }
    }
    if (best) props.push({ x: best[0], y: best[1], floor: 0, type: "forestgate486", toLevel: 10 });
  }

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [], grass,
  };
  map.spawnPts = [start];
  return map;
}

window.PROP_DRAW = window.PROP_DRAW || {};

// 反应堆：损毁的安全壳，往外漏着致命的辐射
window.PROP_DRAW["reactor486"] = function (ctx, p, T) {
  const r = T * 0.40;
  ctx.fillStyle = "rgba(0,0,0,0.34)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.34, r * 1.05, T * 0.10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#5a5650";
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();          // 安全壳
  ctx.fillStyle = "#6a665e";
  ctx.beginPath(); ctx.arc(0, -T * 0.04, r * 0.66, 0, Math.PI * 2); ctx.fill();
  // 破损的缺口 + 从里面漏出的辐射辉光
  ctx.fillStyle = "#2a2622";
  ctx.beginPath(); ctx.moveTo(r * 0.30, -r * 0.30); ctx.lineTo(r * 0.95, -r * 0.05);
  ctx.lineTo(r * 0.55, r * 0.45); ctx.closePath(); ctx.fill();
  const g = ctx.createRadialGradient(r * 0.55, r * 0.10, 1, r * 0.55, r * 0.10, T * 0.36);
  g.addColorStop(0, "rgba(150,255,120,0.55)");
  g.addColorStop(0.5, "rgba(110,220,90,0.22)");
  g.addColorStop(1, "rgba(80,180,60,0)");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(r * 0.55, r * 0.10, T * 0.36, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#3a3630"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
};

// 冷却塔：双曲线外形，顶部飘着白雾
window.PROP_DRAW["coolingtower"] = function (ctx, p, T) {
  const h = T * 0.86;
  ctx.fillStyle = "#6a665e";
  ctx.beginPath();
  ctx.moveTo(-T * 0.30, h * 0.46);
  ctx.quadraticCurveTo(-T * 0.14, -h * 0.10, -T * 0.22, -h * 0.46);
  ctx.lineTo(T * 0.22, -h * 0.46);
  ctx.quadraticCurveTo(T * 0.14, -h * 0.10, T * 0.30, h * 0.46);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "#4a463e"; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.fillStyle = "#3a3630";
  ctx.fillRect(-T * 0.24, -h * 0.50, T * 0.48, T * 0.08);                 // 塔口
  ctx.fillStyle = "rgba(235,235,230,0.42)";                                // 白雾
  ctx.beginPath(); ctx.arc(0, -h * 0.58, T * 0.20, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(-T * 0.10, -h * 0.68, T * 0.14, 0, Math.PI * 2); ctx.fill();
};

// 被污染的枯树
window.PROP_DRAW["deadtree486"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.32, T * 0.16, T * 0.05, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#4a4034"; ctx.lineWidth = T * 0.09;
  ctx.beginPath(); ctx.moveTo(0, T * 0.30); ctx.lineTo(0, -T * 0.16); ctx.stroke();
  ctx.lineWidth = T * 0.045;
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(0, -T * 0.02); ctx.lineTo(s * T * 0.20, -T * 0.24); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -T * 0.14); ctx.lineTo(s * T * 0.14, -T * 0.36); ctx.stroke();
  }
};

// 森林深处的出口 -> Level 10
window.PROP_DRAW["forestgate486"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(120,200,110,0.22)";
  ctx.beginPath(); ctx.ellipse(0, 0, T * 0.44, T * 0.34, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "rgba(150,230,140,0.55)"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(0, 0, T * 0.30, T * 0.24, 0, 0, Math.PI * 2); ctx.stroke();
};

// 工厂：矮墩墩的厂房 + 两根烟囱（烟从烟囱口往右上飘）
window.PROP_DRAW["factory486"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : 0) / 1000;
  // 厂房主体
  ctx.fillStyle = "#6a6660";
  ctx.fillRect(-T * 0.46, -T * 0.10, T * 0.92, T * 0.42);
  ctx.fillStyle = "#57534e";
  ctx.fillRect(-T * 0.46, -T * 0.10, T * 0.92, T * 0.08);
  // 锯齿形的厂房屋顶
  ctx.fillStyle = "#4e4a45";
  for (let i = 0; i < 3; i++) {
    const x0 = -T * 0.46 + i * T * 0.31;
    ctx.beginPath();
    ctx.moveTo(x0, -T * 0.10); ctx.lineTo(x0 + T * 0.16, -T * 0.34);
    ctx.lineTo(x0 + T * 0.31, -T * 0.10); ctx.closePath(); ctx.fill();
  }
  // 两根烟囱
  ctx.fillStyle = "#7a7268";
  ctx.fillRect(-T * 0.34, -T * 0.72, T * 0.13, T * 0.62);
  ctx.fillRect(T * 0.10, -T * 0.62, T * 0.12, T * 0.52);
  ctx.fillStyle = "#3a3630";
  ctx.fillRect(-T * 0.35, -T * 0.76, T * 0.15, T * 0.07);
  ctx.fillRect(T * 0.09, -T * 0.66, T * 0.14, T * 0.07);
  // 窗（有几扇还亮着灯）
  for (let i = 0; i < 4; i++) {
    const on = ((i * 7 + 3) % 5) < 2;
    ctx.fillStyle = on ? "rgba(240,220,140,0.75)" : "rgba(30,34,38,0.7)";
    ctx.fillRect(-T * 0.38 + i * T * 0.20, T * 0.04, T * 0.13, T * 0.14);
  }
  // 烟囱口冒出来的烟（慢慢往上飘）
  for (let i = 0; i < 3; i++) {
    const ph = (t * 0.5 + i * 0.33) % 1;
    ctx.fillStyle = "rgba(210,210,205," + (0.30 * (1 - ph)).toFixed(3) + ")";
    ctx.beginPath();
    ctx.arc(-T * 0.27 + ph * T * 0.30, -T * 0.78 - ph * T * 0.42, T * (0.11 + ph * 0.13), 0, Math.PI * 2);
    ctx.fill();
  }
};

// 烟：灰白色的一团，慢慢翻涌 —— 走进去就到 Level 790
window.PROP_DRAW["smoke486"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : 0) / 1000;
  const seed = ((p && p.x) || 0) * 7 + ((p && p.y) || 0) * 13;
  for (let i = 0; i < 4; i++) {
    const ph = (t * 0.34 + i * 0.25 + (seed % 10) * 0.037) % 1;
    const r = T * (0.20 + ph * 0.22);
    const ox = Math.sin((t + i * 1.7 + seed) * 0.9) * T * 0.10;
    const oy = -ph * T * 0.34;
    ctx.fillStyle = "rgba(206,206,200," + (0.30 * (1 - ph * 0.7)).toFixed(3) + ")";
    ctx.beginPath(); ctx.arc(ox, oy, r, 0, Math.PI * 2); ctx.fill();
  }
  // 底下一层薄雾，看得出来这是一片能站进去的烟
  ctx.fillStyle = "rgba(198,198,192,0.16)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.06, T * 0.42, T * 0.26, 0, 0, Math.PI * 2); ctx.fill();
};
