// ===========================================================
// Level 22 —— 颓垣
//   一座在一定角度上无限延伸的多层停车场。
//   1925 年被发现；1987 年这里被宣告成一个微型国家，居民自称 Emstable。
//   顶层住着三个创立者 —— 游泳池、足球桌、Wi-Fi、电饭煲。
//   中层有帐篷、木棚屋、篝火和庄稼。
//   底层什么都没有 —— 只有睡袋、装满尸体的帐篷，和开采混凝土留下的深坑。
//   如今全塌了：碎石、梁柱、生锈的汽车残骸，走在上面到处绊脚。
//   入口：Level 21 地板上的洞。出口：同一个洞回去，或者一路爬到顶层上楼。
// ===========================================================
"use strict";

(function () {
  const v = ["#8e897c", "#7e796c", "#6f6a5e"];
  if (typeof regTile === "function") regTile("ruin22", v);
  else { (window.__NEWTILE_EXTRA = window.__NEWTILE_EXTRA || {})["ruin22"] = v; }
})();

function generateRuinMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const props = [];

  // ---------- 三段，纵向排开：底层 / 中层 / 顶层 ----------
  const ZS = [];
  const segH = Math.floor((size - 10) / 3);
  for (let i = 0; i < 3; i++) ZS.push({ i, y0: 4 + i * segH, y1: 4 + (i + 1) * segH - 4 });

  const zoneOf = new Map();      // 每格属于第几段（地面/墙的配色与脚步声都按它走）
  const pillar22 = new Set();    // 承重柱
  const pit22 = new Set();       // 开采混凝土留下的深坑（踩上去一直在掉血）
  const rubble22 = new Set();    // 绊脚的碎石（走过去打滑）
  const water22 = new Set();     // 顶层的游泳池

  const carve = (x, y) => { if (x > 0 && y > 0 && x < size - 1 && y < size - 1) grid[y][x] = 0; };

  for (const z of ZS) {
    for (let y = z.y0; y <= z.y1; y++) for (let x = 4; x <= size - 5; x++) carve(x, y);
  }

  // ---------- 承重柱：每 7 格一根，柱子上原本刷着黄黑相间的警示条 ----------
  for (const z of ZS) {
    for (let y = z.y0 + 2; y <= z.y1 - 2; y += 7) {
      for (let x = 7; x <= size - 8; x += 7) {
        grid[y][x] = 1;
        pillar22.add(x + "," + y);
      }
    }
  }

  // ---------- 段与段之间的坡道（停车场就是靠它上下楼的）----------
  // 以前这里只挖通两格，中间那一格没打通 —— 于是三段的地板各成孤岛，
  // 全层 97% 是走不到的死区。现在墙厚 4 格，一路挖穿。
  const ramps = [];
  for (let i = 0; i < 2; i++) {
    const zA = ZS[i], zB = ZS[i + 1];
    const rx = 10 + randInt(0, Math.max(1, size - 20));
    for (let y = zA.y1 - 1; y <= zB.y0 + 1; y++) {
      for (let d = -1; d <= 1; d++) {
        const xx = rx + d;
        if (xx > 0 && xx < size - 1 && y > 0 && y < size - 1) { grid[y][xx] = 0; pillar22.delete(xx + "," + y); }
      }
    }
    ramps.push({ from: i, to: i + 1, x: rx, y: Math.floor((zA.y1 + zB.y0) / 2) });
  }

  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let zi = -1;
    for (let i = 2; i >= 0; i--) if (y >= ZS[i].y0 - 3 && y <= ZS[i].y1 + 3) { zi = i; break; }
    if (zi >= 0) zoneOf.set(x + "," + y, zi);
  }

  // ---------- 底层的深坑：当年开采混凝土挖出来的 ----------
  {
    const z = ZS[0];
    for (let k = 0; k < 3; k++) {
      const px = randInt(10, size - 12), py = randInt(z.y0 + 4, z.y1 - 4);
      const rw = randInt(2, 4), rh = randInt(2, 3);
      for (let y = py; y <= py + rh; y++) for (let x = px; x <= px + rw; x++) {
        if (x > 3 && x < size - 4 && y > z.y0 && y < z.y1 && grid[y][x] === 0) pit22.add(x + "," + y);
      }
    }
  }
  // ---------- 碎石：整层到处都是，走在上面打滑 ----------
  for (const z of ZS) {
    const n = 26 - z.i * 6;
    for (let k = 0; k < n; k++) {
      const x = randInt(5, size - 6), y = randInt(z.y0 + 1, z.y1 - 1);
      if (grid[y][x] === 0 && !pit22.has(x + "," + y)) rubble22.add(x + "," + y);
    }
  }
  // ---------- 顶层的游泳池 ----------
  {
    const z = ZS[2];
    const px = Math.floor(size / 2) - 6, py = Math.floor((z.y0 + z.y1) / 2) - 3;
    for (let y = py; y <= py + 6; y++) for (let x = px; x <= px + 12; x++) {
      if (x > 3 && x < size - 4 && y > z.y0 && y < z.y1) { carve(x, y); water22.add(x + "," + y); pillar22.delete(x + "," + y); }
    }
  }

  const floors = collectFloors(grid, size);

  // 出生点必须落在真正的地板上、且不在坑里 —— 否则一进来就卡在柱子上不掉血
  const safeSpot = (z) => {
    for (let tries = 0; tries < 300; tries++) {
      const x = randInt(6, size - 7), y = randInt(z.y0 + 2, z.y1 - 2);
      const k = x + "," + y;
      if (grid[y][x] === 0 && !pit22.has(k) && !water22.has(k)) return { x, y };
    }
    return { x: Math.floor(size / 2), y: Math.floor((z.y0 + z.y1) / 2) };
  };
  const st0 = safeSpot(ZS[0]);
  const start = { x: st0.x, y: st0.y, floor: 0 };

  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return null;
    if (grid[y][x] !== 0) return null;
    const p = Object.assign({ x, y, floor: 0, type }, extra || {});
    props.push(p);
    return p;
  };
  // 在指定段里随机撒物件（避开坑与水）
  const scatter = (z, n, type, extra) => {
    let made = 0;
    for (let k = 0; k < n * 12 && made < n; k++) {
      const x = randInt(5, size - 6), y = randInt(z.y0 + 1, z.y1 - 1);
      const kk = x + "," + y;
      if (grid[y][x] !== 0 || pit22.has(kk) || water22.has(kk)) continue;
      if (props.some((p) => p.x === x && p.y === y)) continue;
      if (put(x, y, type, extra)) made++;
    }
    return made;
  };

  // ---------- 底层：睡袋、装满尸体的帐篷、汽车残骸、手推车、塌下来的梁柱 ----------
  scatter(ZS[0], 9, "p22bag");
  scatter(ZS[0], 6, "p22tent");
  scatter(ZS[0], 11, "p22wreck");
  scatter(ZS[0], 12, "p22cart");
  scatter(ZS[0], 7, "p22beam");
  scatter(ZS[0], 4, "p22crate");
  // ---------- 中层：木棚屋、篝火、庄稼、还能用的手推车 ----------
  scatter(ZS[1], 8, "p22shack");
  scatter(ZS[1], 5, "p22fire");
  scatter(ZS[1], 7, "p22crop");
  scatter(ZS[1], 6, "p22tent");
  scatter(ZS[1], 8, "p22cart");
  scatter(ZS[1], 6, "p22wreck");
  scatter(ZS[1], 4, "p22stove");
  // ---------- 顶层：足球桌、Wi-Fi 路由器、电饭煲、沙发 ----------
  scatter(ZS[2], 4, "p22foosball");
  scatter(ZS[2], 5, "p22wifi");
  scatter(ZS[2], 3, "p22cooker");
  scatter(ZS[2], 5, "p22sofa");
  scatter(ZS[2], 4, "p22plant");
  scatter(ZS[2], 3, "p22cart");

  // ---------- 段间坡道 ----------
  for (const r of ramps) {
    put(r.x, Math.floor((ZS[r.from].y1 + ZS[r.to].y0) / 2), "p22ramp", { from: r.from, to: r.to });
  }

  // ---------- 出口 ----------
  // 上楼 —— 通往 Level 33 无尽购物体验。挑顶层里走得通、且离出生点最远的一格，
  // 免得一进来就撞上（顶层本来就是终点）。
  // 回去的洞 —— 通往 Level 21。放在底层，离出生点 14 格开外。
  {
    const seen = new Set([start.x + "," + start.y]);
    const q = [[start.x, start.y]];
    while (q.length) {
      const [cx, cy] = q.pop();
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = cx + dx, ny = cy + dy;
        if (nx < 1 || ny < 1 || nx >= size - 1 || ny >= size - 1) continue;
        const kk = nx + "," + ny;
        if (seen.has(kk) || grid[ny][nx] !== 0) continue;
        seen.add(kk); q.push([nx, ny]);
      }
    }
    let best = null, bd = -1;
    for (const kk of seen) {
      const [sx, sy] = kk.split(",").map(Number);
      if (sy < ZS[2].y0 + 1 || sy > ZS[2].y1 - 1) continue;      // 只在顶层
      if (water22.has(kk)) continue;
      const d = Math.abs(sx - start.x) + Math.abs(sy - start.y);
      if (d > bd) { bd = d; best = [sx, sy]; }
    }
    if (best) put(best[0], best[1], "p22up", { toLevel: 33 });
    else { const s2 = safeSpot(ZS[2]); put(s2.x, s2.y, "p22up", { toLevel: 33 }); }

    // 回 Level 21 的洞：底层，离出生点 14~28 格
    let cand = [];
    for (const kk of seen) {
      const [sx, sy] = kk.split(",").map(Number);
      if (sy < ZS[0].y0 + 1 || sy > ZS[0].y1 - 1) continue;
      if (pit22.has(kk)) continue;
      const d = Math.hypot(sx - start.x, sy - start.y);
      if (d > 14 && d < 28) cand.push([sx, sy]);
    }
    if (!cand.length) {
      for (const kk of seen) {
        const [sx, sy] = kk.split(",").map(Number);
        if (sy >= ZS[0].y0 + 1 && sy <= ZS[0].y1 - 1 && !pit22.has(kk)) cand.push([sx, sy]);
      }
    }
    if (cand.length) {
      const s3 = cand[randInt(0, cand.length - 1)];
      put(s3[0], s3[1], "p22hole", { toLevel: 21 });
    }
  }

  // ---------- 指示牌：告诉你哪边是上楼 ----------
  for (let i = 0; i < 3; i++) {
    const s = safeSpot(ZS[i]);
    put(s.x, s.y, "p22sign", { dir: 1 });
  }

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [],
    zoneOf, pillar22, pit22, rubble22, water22, zones22: ZS,
  };
  map.spawnPts = [start];
  return map;
}
window.generateRuinMap = generateRuinMap;

// ---------- 地面：三层各有各的脏法 ----------
// 三层各有各的脏法。迷雾会把画面压到原来的六成左右 ——
// 底色给得太暗的话，压完之后玩家连自己在哪儿都看不见。
const Z22_FLOOR = ["#827b6c", "#8d877a", "#9a948a"];   // 底 / 中 / 顶
const Z22_WALL  = ["#6e6960", "#78736c", "#847f78"];

window.drawRuinFloor = function (ctx, px, py, S, map, tx, ty) {
  const k = tx + "," + ty;
  const zi = map.zoneOf ? map.zoneOf.get(k) : -1;
  // 停车位：每隔 3 格一道白线（停车场最认得出来的东西）
  ctx.fillStyle = Z22_FLOOR[zi >= 0 ? zi : 1];
  ctx.fillRect(px, py, S, S);

  if (map.pit22 && map.pit22.has(k)) {
    // 深坑：往下看是黑的 —— 但坑口一圈有边缘，看得出来这是个洞
    ctx.fillStyle = "#2e2a24";
    ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(190,180,160,0.35)";
    ctx.fillRect(px, py, S, Math.max(1, S * 0.10));
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(px + S * 0.18, py + S * 0.18, S * 0.64, S * 0.64);
    return true;
  }
  if (map.water22 && map.water22.has(k)) {
    // 游泳池：干净的水，带一点波纹
    ctx.fillStyle = "#3f7f96";
    ctx.fillRect(px, py, S, S);
    const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
    ctx.fillStyle = "rgba(200,235,250,0.30)";
    ctx.fillRect(px, py + S * (0.30 + 0.18 * Math.sin(t * 1.6 + tx * 0.7 + ty * 0.5)), S, Math.max(1, S * 0.10));
    return true;
  }

  // 车位线：只在没被碎石盖住的地方画
  if (!map.rubble22 || !map.rubble22.has(k)) {
    if (ty % 3 === 0) { ctx.fillStyle = "rgba(235,232,220,0.35)"; ctx.fillRect(px, py, S, Math.max(1, S * 0.07)); }
    if (tx % 3 === 0) { ctx.fillStyle = "rgba(235,232,220,0.22)"; ctx.fillRect(px + S * 0.86, py, Math.max(1, S * 0.07), S); }
  } else {
    // 碎石：地上一摊碎混凝土块
    ctx.fillStyle = "rgba(150,144,130,0.55)";
    for (let i = 0; i < 5; i++) {
      const a = (tx * 13 + ty * 7 + i * 29) % 100 / 100;
      const b = (tx * 5 + ty * 11 + i * 17) % 100 / 100;
      ctx.fillRect(px + a * S * 0.72, py + b * S * 0.72, Math.max(1, S * 0.13), Math.max(1, S * 0.11));
    }
  }
  // 裂纹
  if (((tx * 7 + ty * 3) % 11) === 0) {
    ctx.strokeStyle = "rgba(40,38,32,0.45)"; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px + S * 0.15, py + S * 0.2);
    ctx.lineTo(px + S * 0.5, py + S * 0.55);
    ctx.lineTo(px + S * 0.85, py + S * 0.4);
    ctx.stroke();
  }
  return true;
};

// ---------- 墙体：混凝土，露着钢筋；承重柱刷着黄黑警示条 ----------
window.drawRuinWall = function (ctx, px, py, S, map, tx, ty) {
  const k = tx + "," + ty;
  const zi = map.zoneOf ? map.zoneOf.get(k) : -1;
  if (map.pillar22 && map.pillar22.has(k)) {
    ctx.fillStyle = "#7e7868";
    ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "#8e8874";
    ctx.fillRect(px + S * 0.12, py, S * 0.30, S);
    // 黄黑警示条
    ctx.fillStyle = "#c8a838";
    ctx.fillRect(px, py + S * 0.34, S, S * 0.16);
    ctx.fillStyle = "#2a2822";
    for (let i = 0; i < 4; i++) ctx.fillRect(px + i * S * 0.25, py + S * 0.34, S * 0.12, S * 0.16);
    // 露出来的钢筋
    ctx.strokeStyle = "#6a5a44"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(px + S * 0.2, py + S * 0.62); ctx.lineTo(px + S * 0.5, py + S * 0.86); ctx.stroke();
    return true;
  }
  ctx.fillStyle = Z22_WALL[zi >= 0 ? zi : 1];
  ctx.fillRect(px, py, S, S);
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fillRect(px, py, S, Math.max(1, S * 0.14));
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.fillRect(px, py + S - Math.max(1, S * 0.14), S, Math.max(1, S * 0.14));
  // 往下淌的污渍
  if (((tx * 5 + ty * 9) % 7) === 0) {
    ctx.fillStyle = "rgba(90,70,48,0.30)";
    ctx.fillRect(px + S * ((tx * 3) % 7) / 7, py, Math.max(1, S * 0.10), S);
  }
  return true;
};

window.PROP_DRAW = window.PROP_DRAW || {};

// 汽车残骸：锈成一片，只剩一个壳（那辆 50 年代的车是唯一完整的）
window.PROP_DRAW["p22wreck"] = function (ctx, p, T) {
  const whole = ((p.x * 3 + p.y * 7) % 9) === 0;
  ctx.fillStyle = whole ? "#6a4a38" : "#5a4638";
  ctx.fillRect(-T * 0.44, -T * 0.26, T * 0.88, T * 0.52);
  ctx.fillStyle = whole ? "#7a5a44" : "#65503e";
  ctx.fillRect(-T * 0.30, -T * 0.42, T * 0.58, T * 0.20);
  // 车窗：早碎了，黑洞洞的
  ctx.fillStyle = "#20242a";
  ctx.fillRect(-T * 0.26, -T * 0.38, T * 0.50, T * 0.14);
  // 轮子
  ctx.fillStyle = "#2c2a26";
  ctx.beginPath(); ctx.arc(-T * 0.26, T * 0.28, T * 0.13, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(T * 0.26, T * 0.28, T * 0.13, 0, Math.PI * 2); ctx.fill();
  // 锈斑
  ctx.fillStyle = "rgba(140,80,40,0.45)";
  for (let i = 0; i < 4; i++) ctx.fillRect(-T * 0.42 + i * T * 0.22, -T * 0.20 + (i % 2) * T * 0.20, T * 0.13, T * 0.10);
  if (!whole) {   // 碎掉的那一半：地上散着碎片
    ctx.fillStyle = "#4e3e30";
    ctx.fillRect(T * 0.30, T * 0.10, T * 0.16, T * 0.10);
    ctx.fillRect(T * 0.34, T * 0.24, T * 0.10, T * 0.07);
  }
};

// 超市手推车：当年装满了建筑材料和食物
window.PROP_DRAW["p22cart"] = function (ctx, p, T) {
  ctx.strokeStyle = "#8e9298"; ctx.lineWidth = Math.max(1.5, T * 0.05);
  // 车筐
  ctx.beginPath();
  ctx.moveTo(-T * 0.30, -T * 0.28); ctx.lineTo(T * 0.26, -T * 0.28);
  ctx.lineTo(T * 0.20, T * 0.10);  ctx.lineTo(-T * 0.24, T * 0.10);
  ctx.closePath(); ctx.stroke();
  ctx.lineWidth = 1;
  for (let i = 1; i < 4; i++) {
    ctx.beginPath(); ctx.moveTo(-T * 0.30 + i * T * 0.14, -T * 0.28); ctx.lineTo(-T * 0.24 + i * T * 0.14, T * 0.10); ctx.stroke();
  }
  // 轮子
  ctx.fillStyle = "#3a3c40";
  ctx.beginPath(); ctx.arc(-T * 0.20, T * 0.20, T * 0.06, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(T * 0.16, T * 0.20, T * 0.06, 0, Math.PI * 2); ctx.fill();
  // 筐里剩下的东西：几块板子
  ctx.fillStyle = "#7a6448";
  ctx.fillRect(-T * 0.24, -T * 0.22, T * 0.40, T * 0.06);
};

// 塌下来的梁柱
window.PROP_DRAW["p22beam"] = function (ctx, p, T) {
  ctx.fillStyle = "#8a8478";
  ctx.save(); ctx.rotate(-0.35);
  ctx.fillRect(-T * 0.46, -T * 0.10, T * 0.92, T * 0.20);
  ctx.fillStyle = "#a09a8c";
  ctx.fillRect(-T * 0.46, -T * 0.10, T * 0.92, T * 0.06);
  ctx.restore();
  // 露出的钢筋
  ctx.strokeStyle = "#6a5a44"; ctx.lineWidth = 1.5;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(-T * 0.30 + i * T * 0.24, T * 0.06);
    ctx.quadraticCurveTo(-T * 0.24 + i * T * 0.24, T * 0.26, -T * 0.34 + i * T * 0.24, T * 0.34);
    ctx.stroke();
  }
};

// 碎石堆：走过去会打滑
window.PROP_DRAW["p22rubble"] = function (ctx, p, T) {
  ctx.fillStyle = "#7e7868";
  ctx.beginPath();
  ctx.moveTo(-T * 0.40, T * 0.28);
  ctx.lineTo(-T * 0.20, -T * 0.10);
  ctx.lineTo(T * 0.06, -T * 0.26);
  ctx.lineTo(T * 0.34, T * 0.06);
  ctx.lineTo(T * 0.40, T * 0.28);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#9a9484";
  for (let i = 0; i < 4; i++) ctx.fillRect(-T * 0.30 + i * T * 0.18, -T * 0.06 + (i % 2) * T * 0.14, T * 0.11, T * 0.09);
};

// 帐篷：里面装着前 Emstable 居民的尸体
window.PROP_DRAW["p22tent"] = function (ctx, p, T) {
  ctx.fillStyle = "#6a6a54";
  ctx.beginPath();
  ctx.moveTo(0, -T * 0.40); ctx.lineTo(T * 0.42, T * 0.30); ctx.lineTo(-T * 0.42, T * 0.30);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#7c7c62";
  ctx.beginPath();
  ctx.moveTo(0, -T * 0.40); ctx.lineTo(T * 0.12, T * 0.30); ctx.lineTo(-T * 0.42, T * 0.30);
  ctx.closePath(); ctx.fill();
  // 门帘掀开一角 —— 里面是黑的
  ctx.fillStyle = "#1c1e20";
  ctx.beginPath();
  ctx.moveTo(-T * 0.10, -T * 0.10); ctx.lineTo(T * 0.10, -T * 0.10); ctx.lineTo(T * 0.14, T * 0.30); ctx.lineTo(-T * 0.14, T * 0.30);
  ctx.closePath(); ctx.fill();
  // 底下露出来的一只手
  ctx.fillStyle = "#a89884";
  ctx.fillRect(T * 0.10, T * 0.20, T * 0.16, T * 0.05);
};

// 睡袋
window.PROP_DRAW["p22bag"] = function (ctx, p, T) {
  ctx.fillStyle = "#4c5a62";
  ctx.beginPath(); ctx.ellipse(0, 0, T * 0.40, T * 0.18, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#5e6e78";
  ctx.beginPath(); ctx.ellipse(-T * 0.10, -T * 0.03, T * 0.26, T * 0.12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#38424a";
  ctx.fillRect(-T * 0.40, -T * 0.02, T * 0.10, T * 0.05);
};

// 木棚屋：中层的人自己搭的
window.PROP_DRAW["p22shack"] = function (ctx, p, T) {
  ctx.fillStyle = "#6a5540";
  ctx.fillRect(-T * 0.42, -T * 0.20, T * 0.84, T * 0.48);
  ctx.fillStyle = "#7d6650";
  for (let i = 0; i < 4; i++) ctx.fillRect(-T * 0.42 + i * T * 0.22, -T * 0.20, T * 0.18, T * 0.48);
  // 斜屋顶
  ctx.fillStyle = "#54463a";
  ctx.beginPath();
  ctx.moveTo(-T * 0.48, -T * 0.20); ctx.lineTo(0, -T * 0.44); ctx.lineTo(T * 0.48, -T * 0.20);
  ctx.closePath(); ctx.fill();
  // 门洞
  ctx.fillStyle = "#20242a";
  ctx.fillRect(-T * 0.10, -T * 0.04, T * 0.20, T * 0.32);
};

// 篝火：中层的夜里靠它取暖
window.PROP_DRAW["p22fire"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  const pl = 0.65 + 0.35 * Math.sin(t * 4 + (p.x || 0));
  ctx.fillStyle = "#4a4038";
  for (let i = 0; i < 3; i++) { ctx.save(); ctx.rotate(i * 1.05); ctx.fillRect(-T * 0.30, -T * 0.04, T * 0.60, T * 0.08); ctx.restore(); }
  ctx.fillStyle = "#e0903a";
  ctx.beginPath();
  ctx.moveTo(0, -T * 0.42 * pl); ctx.lineTo(T * 0.16, -T * 0.04); ctx.lineTo(-T * 0.16, -T * 0.04);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#f6d878";
  ctx.beginPath();
  ctx.moveTo(0, -T * 0.26 * pl); ctx.lineTo(T * 0.09, -T * 0.04); ctx.lineTo(-T * 0.09, -T * 0.04);
  ctx.closePath(); ctx.fill();
  const gr = ctx.createRadialGradient(0, -T * 0.16, 1, 0, -T * 0.16, T * 0.44);
  gr.addColorStop(0, "rgba(240,170,80,0.30)"); gr.addColorStop(1, "rgba(240,170,80,0)");
  ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(0, -T * 0.16, T * 0.44, 0, Math.PI * 2); ctx.fill();
};

// 庄稼：不知道最初的种子是从哪儿来的
window.PROP_DRAW["p22crop"] = function (ctx, p, T) {
  ctx.fillStyle = "#5a4a34";
  ctx.fillRect(-T * 0.38, T * 0.10, T * 0.76, T * 0.20);
  ctx.strokeStyle = "#7a8a44"; ctx.lineWidth = Math.max(1.5, T * 0.05);
  for (let i = 0; i < 5; i++) {
    const bx = -T * 0.32 + i * T * 0.16;
    ctx.beginPath(); ctx.moveTo(bx, T * 0.12); ctx.quadraticCurveTo(bx + T * 0.05, -T * 0.12, bx + T * 0.10, -T * 0.30); ctx.stroke();
  }
  ctx.fillStyle = "#c8b45a";
  for (let i = 0; i < 5; i++) ctx.fillRect(-T * 0.24 + i * T * 0.16, -T * 0.34, T * 0.06, T * 0.10);
};

// 还能用的炉子
window.PROP_DRAW["p22stove"] = function (ctx, p, T) {
  ctx.fillStyle = "#5c6064";
  ctx.fillRect(-T * 0.30, -T * 0.24, T * 0.60, T * 0.50);
  ctx.fillStyle = "#6e7276";
  ctx.fillRect(-T * 0.30, -T * 0.24, T * 0.60, T * 0.10);
  ctx.fillStyle = "#3a3e42";
  ctx.beginPath(); ctx.arc(0, -T * 0.02, T * 0.13, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#c8702a";
  ctx.beginPath(); ctx.arc(0, -T * 0.02, T * 0.08, 0, Math.PI * 2); ctx.fill();
};

// 足球桌
window.PROP_DRAW["p22foosball"] = function (ctx, p, T) {
  ctx.fillStyle = "#4a5a3a";
  ctx.fillRect(-T * 0.44, -T * 0.26, T * 0.88, T * 0.52);
  ctx.fillStyle = "#6a7a52";
  ctx.fillRect(-T * 0.38, -T * 0.20, T * 0.76, T * 0.40);
  ctx.fillStyle = "#e8e4d8";
  ctx.fillRect(-T * 0.30, -T * 0.12, T * 0.06, T * 0.24);
  ctx.fillRect(-T * 0.10, -T * 0.04, T * 0.06, T * 0.24);
  ctx.fillRect(T * 0.14, -T * 0.16, T * 0.06, T * 0.24);
  // 两端的把手
  ctx.fillStyle = "#8a3a2a";
  ctx.fillRect(-T * 0.50, -T * 0.08, T * 0.08, T * 0.16);
  ctx.fillRect(T * 0.42, -T * 0.08, T * 0.08, T * 0.16);
};

// Wi-Fi 路由器：顶层的奢侈品之一
window.PROP_DRAW["p22wifi"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  ctx.fillStyle = "#2e3238";
  ctx.fillRect(-T * 0.26, -T * 0.06, T * 0.52, T * 0.24);
  ctx.fillStyle = "#42484e";
  ctx.fillRect(-T * 0.26, -T * 0.06, T * 0.52, T * 0.07);
  // 天线
  ctx.strokeStyle = "#2e3238"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-T * 0.14, -T * 0.06); ctx.lineTo(-T * 0.24, -T * 0.34); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(T * 0.14, -T * 0.06); ctx.lineTo(T * 0.24, -T * 0.34); ctx.stroke();
  // 信号：三格在闪
  ctx.strokeStyle = "#7ce0a0"; ctx.lineWidth = 1.5;
  for (let i = 0; i < 3; i++) {
    const on = ((Math.floor(t * 2) + i) % 4) !== 0;
    if (!on) continue;
    ctx.beginPath();
    ctx.arc(0, -T * 0.16, T * (0.06 + i * 0.05), Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
  }
};

// 电饭煲：他们是怎么弄到这东西的，没人知道
window.PROP_DRAW["p22cooker"] = function (ctx, p, T) {
  ctx.fillStyle = "#c8ccce";
  ctx.beginPath(); ctx.ellipse(0, 0, T * 0.28, T * 0.22, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#dde0e2";
  ctx.beginPath(); ctx.ellipse(0, -T * 0.08, T * 0.26, T * 0.14, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#3a3e42";
  ctx.fillRect(-T * 0.12, -T * 0.14, T * 0.24, T * 0.07);
  ctx.fillStyle = "#c8442a";
  ctx.fillRect(-T * 0.09, -T * 0.12, T * 0.05, T * 0.04);
};

// 沙发
window.PROP_DRAW["p22sofa"] = function (ctx, p, T) {
  ctx.fillStyle = "#6a4a52";
  ctx.fillRect(-T * 0.42, -T * 0.06, T * 0.84, T * 0.30);
  ctx.fillStyle = "#7c5a62";
  ctx.fillRect(-T * 0.42, -T * 0.24, T * 0.84, T * 0.20);
  ctx.fillStyle = "#5a3c44";
  ctx.fillRect(-T * 0.42, -T * 0.02, T * 0.16, T * 0.26);
  ctx.fillRect(T * 0.26, -T * 0.02, T * 0.16, T * 0.26);
};

// 盆栽
window.PROP_DRAW["p22plant"] = function (ctx, p, T) {
  ctx.fillStyle = "#7a5a44";
  ctx.fillRect(-T * 0.14, T * 0.02, T * 0.28, T * 0.26);
  ctx.fillStyle = "#4a6a38";
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i - 2) * 0.5;
    ctx.beginPath();
    ctx.ellipse(Math.cos(a) * T * 0.16, T * 0.02 + Math.sin(a) * T * 0.18, T * 0.10, T * 0.06, a, 0, Math.PI * 2);
    ctx.fill();
  }
};

// 板条箱：当年从上面楼层运下来的补给
window.PROP_DRAW["p22crate"] = function (ctx, p, T) {
  ctx.fillStyle = "#6e6046";
  ctx.fillRect(-T * 0.32, -T * 0.28, T * 0.64, T * 0.56);
  ctx.fillStyle = "#7f7052";
  ctx.fillRect(-T * 0.32, -T * 0.28, T * 0.64, T * 0.10);
  ctx.strokeStyle = "#4a4030"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-T * 0.32, 0); ctx.lineTo(T * 0.32, 0); ctx.stroke();
};

// 段与段之间的坡道
window.PROP_DRAW["p22ramp"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  const pl = 0.4 + 0.3 * Math.sin(t * 1.6);
  ctx.fillStyle = "#6a665c";
  ctx.fillRect(-T * 0.46, -T * 0.44, T * 0.92, T * 0.88);
  // 一道道斜上去的坡面
  ctx.fillStyle = "#807c70";
  for (let i = 0; i < 5; i++) ctx.fillRect(-T * 0.40, -T * 0.34 + i * T * 0.16, T * 0.80, T * 0.07);
  // 坡道边上的黄线
  ctx.fillStyle = "rgba(210,180,60," + (0.5 + 0.3 * pl).toFixed(3) + ")";
  ctx.fillRect(-T * 0.44, -T * 0.42, T * 0.06, T * 0.84);
  ctx.fillRect(T * 0.38, -T * 0.42, T * 0.06, T * 0.84);
  // 上楼的箭头
  ctx.fillStyle = "rgba(240,236,220,0.75)";
  ctx.beginPath();
  ctx.moveTo(0, -T * 0.26); ctx.lineTo(T * 0.16, -T * 0.06); ctx.lineTo(T * 0.06, -T * 0.06);
  ctx.lineTo(T * 0.06, T * 0.14); ctx.lineTo(-T * 0.06, T * 0.14); ctx.lineTo(-T * 0.06, -T * 0.06);
  ctx.lineTo(-T * 0.16, -T * 0.06);
  ctx.closePath(); ctx.fill();
};

// 上楼 —— 通往 Level 33
window.PROP_DRAW["p22up"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  const pl = 0.45 + 0.35 * Math.sin(t * 2.0);
  ctx.fillStyle = "#8e8878";
  for (let i = 0; i < 5; i++) ctx.fillRect(-T * 0.44 + i * T * 0.04, -T * 0.36 + i * T * 0.15, T * 0.88 - i * T * 0.08, T * 0.14);
  ctx.fillStyle = "rgba(255,250,220," + (0.30 + 0.28 * pl).toFixed(3) + ")";
  ctx.fillRect(-T * 0.44, -T * 0.44, T * 0.88, T * 0.10);
  // 上楼的箭头（画出来，不是字）
  ctx.fillStyle = "rgba(250,246,230," + (0.55 + 0.35 * pl).toFixed(3) + ")";
  ctx.beginPath();
  ctx.moveTo(0, -T * 0.26); ctx.lineTo(T * 0.18, T * 0.02); ctx.lineTo(T * 0.07, T * 0.02);
  ctx.lineTo(T * 0.07, T * 0.26); ctx.lineTo(-T * 0.07, T * 0.26); ctx.lineTo(-T * 0.07, T * 0.02);
  ctx.lineTo(-T * 0.18, T * 0.02);
  ctx.closePath(); ctx.fill();
};

// 回 Level 21 的那个洞
window.PROP_DRAW["p22hole"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  const pl = 0.4 + 0.3 * Math.sin(t * 1.5);
  ctx.fillStyle = "#4a463c";
  ctx.beginPath(); ctx.ellipse(0, 0, T * 0.44, T * 0.36, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#20242a";
  ctx.beginPath(); ctx.ellipse(0, 0, T * 0.34, T * 0.27, 0, 0, Math.PI * 2); ctx.fill();
  // 洞口一圈碎掉的混凝土
  ctx.fillStyle = "#8e8878";
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4;
    ctx.fillRect(Math.cos(a) * T * 0.40 - T * 0.04, Math.sin(a) * T * 0.32 - T * 0.03, T * 0.09, T * 0.06);
  }
  ctx.strokeStyle = "rgba(220,214,196," + pl.toFixed(3) + ")"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(0, 0, T * 0.44, T * 0.36, 0, 0, Math.PI * 2); ctx.stroke();
};

// 指示牌：画着往上的箭头
window.PROP_DRAW["p22sign"] = function (ctx, p, T) {
  ctx.fillStyle = "#5a5650";
  ctx.fillRect(-T * 0.05, -T * 0.10, T * 0.10, T * 0.44);
  ctx.fillStyle = "#3a5a7a";
  ctx.fillRect(-T * 0.34, -T * 0.42, T * 0.68, T * 0.34);
  ctx.fillStyle = "rgba(235,240,246,0.85)";
  ctx.beginPath();
  ctx.moveTo(0, -T * 0.36); ctx.lineTo(T * 0.16, -T * 0.18); ctx.lineTo(T * 0.06, -T * 0.18);
  ctx.lineTo(T * 0.06, -T * 0.08); ctx.lineTo(-T * 0.06, -T * 0.08); ctx.lineTo(-T * 0.06, -T * 0.18);
  ctx.lineTo(-T * 0.16, -T * 0.18);
  ctx.closePath(); ctx.fill();
};

// ---------- Level 21 地板上那个洞（Level 22 的入口）----------
window.PROP_DRAW["hole22"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  const pl = 0.45 + 0.3 * Math.sin(t * 1.7);
  ctx.fillStyle = "#3a3630";
  ctx.beginPath(); ctx.ellipse(0, 0, T * 0.42, T * 0.34, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#16181c";
  ctx.beginPath(); ctx.ellipse(0, 0, T * 0.32, T * 0.25, 0, 0, Math.PI * 2); ctx.fill();
  // 洞口边上翘起来的地毯
  ctx.fillStyle = "#8a6a3a";
  ctx.fillRect(-T * 0.44, -T * 0.30, T * 0.14, T * 0.06);
  ctx.fillRect(T * 0.30, T * 0.24, T * 0.14, T * 0.06);
  ctx.strokeStyle = "rgba(210,200,170," + pl.toFixed(3) + ")"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(0, 0, T * 0.42, T * 0.34, 0, 0, Math.PI * 2); ctx.stroke();
};
