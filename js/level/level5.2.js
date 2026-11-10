// ===========================================================
// Level 5.2 —— 胜景
//
// 由一座高度和宽度无限、而厚度有限的大型建筑组成。构造分布在两侧：
// 一条条彼此叠加成层的人行道覆盖其上，偶尔由楼梯间互相连接。
// 结构内部有数不清的酒店套房，都可以从人行道上的门进去。
//
// 两侧之间隔着一道约 50 米宽的间隙 —— 能互相看见，但过不去。
// 只有极少数套房在两侧都开了门，因此可以径直穿过去到另一侧。
//
// 出口：唯一的办法是回到入口那扇门。它从外面锁死了，只有里侧的人
//       偶尔把它推开一条缝 —— 靠近它，等那一瞬间。
// ===========================================================
"use strict";

if (typeof regTile === "function") regTile("vista", ["#c2ab86", "#6f6150"]);
else { (window.__NEWTILE_EXTRA = window.__NEWTILE_EXTRA || {})["vista"] = ["#c2ab86", "#6f6150"]; }

function generateVistaMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);          // 一开始全是墙
  const props = [];
  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return;
    props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  };

  // ---- 中庭（间隙）：两侧构造之间的那道 50 米 ----
  const gapX0 = Math.floor(size / 2) - 3;
  const gapX1 = gapX0 + 5;              // 6 格宽
  const inGap = (x) => x >= gapX0 && x <= gapX1;

  // ---- 走道层：一层一层叠上去 ----
  const LEVEL_H = 7, WALK_H = 2;
  const leftX0 = 3, leftX1 = gapX0 - 1;
  const rightX0 = gapX1 + 1, rightX1 = size - 4;
  const deckYs = [];
  for (let y = 4; y + LEVEL_H + 2 < size - 3; y += LEVEL_H) deckYs.push(y);

  const walkKeys = new Set();           // 走道地板
  const zoneOf = new Map();             // "x,y" -> 区域号（决定墙纸与地毯）
  const roomKeys = new Set();           // 套房内部

  for (let li = 0; li < deckYs.length; li++) {
    const y = deckYs[li];
    const zone = Math.floor(li / 2);    // 每两层一个区域
    // 走道（左右两侧各一条）
    for (let yy = y; yy < y + WALK_H; yy++) {
      for (let x = leftX0; x <= leftX1; x++) { grid[yy][x] = 0; walkKeys.add(x + "," + yy); zoneOf.set(x + "," + yy, zone); }
      for (let x = rightX0; x <= rightX1; x++) { grid[yy][x] = 0; walkKeys.add(x + "," + yy); zoneOf.set(x + "," + yy, zone); }
    }
    // 套房：挖在走道下面那一条里（走道 y..y+1，房间 y+3..y+5，门洞在 y+2）
    const roomW = 5;
    for (let x = leftX0 + 1; x + roomW <= leftX1 - 1; x += roomW + 1) {
      if (Math.random() < 0.22) continue;         // 有些位置是实心的
      for (let yy = y + 3; yy <= y + 5; yy++)
        for (let xx = x; xx < x + roomW; xx++) { grid[yy][xx] = 0; roomKeys.add(xx + "," + yy); zoneOf.set(xx + "," + yy, zone); }
      grid[y + 2][x + 2] = 0;                     // 门洞
      zoneOf.set((x + 2) + "," + (y + 2), zone);
      put(x + 2, y + 1, "suitdoor52");            // 门（画在走道那一格上）
      // 家具
      const fx = x + 1 + randInt(0, 2);
      put(x + 1, y + 4, "bed52");
      put(x + 3, y + 3, "table52");
      if (Math.random() < 0.75) put(x + 4, y + 5, "fridge52", { opened: false });
    }
    for (let x = rightX0 + 1; x + roomW <= rightX1 - 1; x += roomW + 1) {
      if (Math.random() < 0.22) continue;
      for (let yy = y + 3; yy <= y + 5; yy++)
        for (let xx = x; xx < x + roomW; xx++) { grid[yy][xx] = 0; roomKeys.add(xx + "," + yy); zoneOf.set(xx + "," + yy, zone); }
      grid[y + 2][x + 2] = 0;
      zoneOf.set((x + 2) + "," + (y + 2), zone);
      put(x + 2, y + 1, "suitdoor52");
      put(x + 1, y + 4, "bed52");
      put(x + 3, y + 3, "table52");
      if (Math.random() < 0.75) put(x + 4, y + 5, "fridge52", { opened: false });
    }
  }

  // ---- 楼梯间：左右两侧各竖一条，把上下两层串起来 ----
  // 两侧都要有 —— 只在一侧挖的话，另一侧的走道就全成了走不到的死区，
  // 会被连通兜底整片填回墙里（结果是整层只剩最左边那一条）。
  for (let li = 0; li + 1 < deckYs.length; li++) {
    const y = deckYs[li], y2 = deckYs[li + 1];
    const zone = Math.floor(li / 2);
    for (let yy = y + 1; yy <= y2 + 1; yy++) {
      grid[yy][leftX0] = 0; zoneOf.set(leftX0 + "," + yy, zone);
      grid[yy][rightX1] = 0; zoneOf.set(rightX1 + "," + yy, zone);
    }
    put(leftX0, y + 3, "stair52");
    put(rightX1, y + 3, "stair52");
  }

  // ---- 贯通两侧的套房：整层里只有两三条，可以径直穿到对面 ----
  const crossYs = [];
  for (let li = 1; li < deckYs.length; li += 3) crossYs.push(deckYs[li]);
  for (const y of crossYs) {
    const zone = Math.floor(deckYs.indexOf(y) / 2);
    for (let x = leftX1; x <= rightX0; x++)
      for (let yy = y + 3; yy <= y + 4; yy++) { grid[yy][x] = 0; roomKeys.add(x + "," + yy); zoneOf.set(x + "," + yy, zone); }
    // 门洞必须落在房间自己的那一列上 —— 以前写在 leftX1-1 / rightX0+1，
    // 那两格在房间外面，结果是"门洞孤零零地挨着走道，房间里却进不去"，
    // 整条穿堂就成了死区，右半张图跟着一起被连通兜底填回墙里。
    grid[y + 2][leftX1] = 0;                     // 左侧门洞
    grid[y + 2][rightX0] = 0;                    // 右侧门洞
    zoneOf.set(leftX1 + "," + (y + 2), zone);
    zoneOf.set(rightX0 + "," + (y + 2), zone);
    put(leftX1, y + 1, "suitdoor52");
    put(rightX0, y + 1, "suitdoor52");
    put(Math.floor((leftX1 + rightX0) / 2), y + 3, "table52");
  }

  // ---- 金属杆：贴着墙，无限向下延伸 ----
  // ---- 出生点：入口那扇门旁边（从 Level 5 推门进来，落地就在这儿）----
  const entryY = deckYs[0];
  const gateX = leftX0 + 6;
  const start = { x: gateX, y: entryY, floor: 0 };
  grid[start.y][start.x] = 0;
  walkKeys.add(start.x + "," + start.y);

  // 连通兜底：走不到的地板填回墙
  const reach = reachableFromRaw(grid, size, start);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const k = x + "," + y;
      if (grid[y][x] === 0 && !reach.has(k)) { grid[y][x] = 1; walkKeys.delete(k); roomKeys.delete(k); }
    }
  const floors = collectFloors(grid, size);

  // ---- 金属杆：贴墙立着 ----
  for (let i = 0; i < 10; i++) {
    const t = floors[randInt(0, floors.length - 1)];
    if (!t || !walkKeys.has(t.x + "," + t.y)) continue;
    if (Math.hypot(t.x - start.x, t.y - start.y) < 4) continue;
    put(t.x, t.y, "pole52");
  }

  // ---- 入口那扇门：从外面锁死，只有里侧偶尔推开一条缝 ----
  const gate = { type: "gate52", x: gateX, y: entryY - 1, floor: 0,
    toLevel: null, tip: "入口的门从外面锁死了 —— 只能等里面的人来开", t: 0, _open: false };
  // 门要站在走道上（走道是 y..y+1），摆在 y-1 就是墙里。改摆在走道里：
  gate.y = entryY;
  props.push(gate);

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [],
    gapCols: [gapX0, gapX1],
    walkKeys, roomKeys, zoneOf,
    gate52: gate,
  };
  map.spawnPts = [start];
  return map;
}
window.generateVistaMap = generateVistaMap;

// ---------- 地面 / 墙体 ----------
// 走道铺地毯（每个区域一色），套房里是另一种地毯。
// 中庭那几列是墙 —— 画成往下望的深渊，能看见对面走道的轮廓。
const VISTA_ZONES = [
  { walk: "#b9a887", room: "#8d7a5e" },
  { walk: "#a8b0a0", room: "#7d8578" },
  { walk: "#c0a49a", room: "#947a72" },
  { walk: "#9aa7b4", room: "#6f7c88" },
  { walk: "#bfa878", room: "#8f7c58" },
];

window.drawVistaFloor = function (ctx, px, py, h, map, tx, ty) {
  const S = h;
  const z = (map && map.zoneOf) ? map.zoneOf.get(tx + "," + ty) : null;
  const pal = VISTA_ZONES[(z | 0) % VISTA_ZONES.length];
  const isRoom = map && map.roomKeys && map.roomKeys.has(tx + "," + ty);
  ctx.fillStyle = isRoom ? pal.room : pal.walk;
  ctx.fillRect(px, py, S, S);
  // 地毯的织纹
  ctx.fillStyle = "rgba(0,0,0,.10)";
  for (let i = 0; i < 3; i++) ctx.fillRect(px + 2 + i * (S / 3), py + 3, 2, S - 6);
  ctx.fillStyle = "rgba(255,255,255,.06)";
  ctx.fillRect(px, py, S, Math.max(1, S * 0.12));
  // 走道临中庭那一侧：栏杆的影子压在地毯边上
  const gc = map && map.gapCols;
  if (gc && (tx === gc[0] - 1 || tx === gc[1] + 1)) {
    ctx.fillStyle = "rgba(0,0,0,.30)";
    ctx.fillRect(tx === gc[0] - 1 ? px + S - 4 : px, py, 4, S);
  }
  return true;
};

window.drawVistaWall = function (ctx, px, py, h, map, tx, ty) {
  const S = h;
  const gc = map && map.gapCols;
  // 中庭：往下望是一片黑，底下有点点灯光 —— 对面那侧的走道
  if (gc && tx >= gc[0] && tx <= gc[1]) {
    ctx.fillStyle = "#0a0c10";
    ctx.fillRect(px, py, S, S);
    // 对面走道漏过来的一点光（很淡）
    const band = ((ty * 7) % 11);
    if (band < 3) {
      ctx.fillStyle = "rgba(190,170,120,.10)";
      ctx.fillRect(px + 2, py + S * 0.30, S - 4, Math.max(2, S * 0.10));
    }
    ctx.fillStyle = "rgba(255,255,255,.05)";
    ctx.fillRect(px, py, S, 2);
    return true;
  }
  const z = (map && map.zoneOf) ? map.zoneOf.get(tx + "," + ty) : null;
  const pal = VISTA_ZONES[(z | 0) % VISTA_ZONES.length];
  ctx.fillStyle = pal.walk;
  ctx.fillRect(px, py, S, S);
  // 墙纸：竖条 + 顶部压条
  ctx.fillStyle = "rgba(0,0,0,.22)";
  for (let i = 1; i <= 3; i++) ctx.fillRect(px + (S / 4) * i, py, 1.5, S);
  ctx.fillStyle = "rgba(255,255,255,.14)";
  ctx.fillRect(px, py, S, Math.max(2, S * 0.12));
  ctx.fillStyle = "rgba(0,0,0,.34)";
  ctx.fillRect(px, py + S - Math.max(2, S * 0.12), S, Math.max(2, S * 0.12));
  ctx.strokeStyle = "rgba(30,22,14,.55)"; ctx.lineWidth = 1;
  ctx.strokeRect(px + 0.5, py + 0.5, S - 1, S - 1);
  return true;
};

// ---------- 物件 ----------
window.PROP_DRAW = window.PROP_DRAW || {};

// 套房门：门框 + 门牌号
window.PROP_DRAW["suitdoor52"] = function (ctx, p, T) {
  const w = T * 0.66, h = T * 0.72;
  ctx.fillStyle = "#4a3324";
  ctx.fillRect(-w / 2 - 2, -h / 2 - 2, w + 4, h + 4);
  ctx.fillStyle = "#6b4b32";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "rgba(255,255,255,.10)";
  ctx.fillRect(-w / 2, -h / 2, w, h * 0.2);
  ctx.fillStyle = "#d8c48a";                        // 黄铜门牌
  ctx.fillRect(-w * 0.28, -h * 0.42, w * 0.56, h * 0.18);
  ctx.fillStyle = "#3a2a18";
  ctx.font = "bold " + Math.round(T * 0.13) + "px system-ui, sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(String(((p.x * 37 + p.y * 11) % 900) + 100), 0, -h * 0.33);
  ctx.fillStyle = "#c9a95c";                        // 把手
  ctx.beginPath(); ctx.arc(w * 0.28, 0, Math.max(1.5, T * 0.045), 0, 6.2832); ctx.fill();
};

// 楼梯间：一段往下折的台阶
window.PROP_DRAW["stair52"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(0,0,0,.30)";
  ctx.fillRect(-T * 0.34, -T * 0.30, T * 0.68, T * 0.62);
  for (let i = 0; i < 4; i++) {
    const yy = -T * 0.26 + i * (T * 0.16);
    ctx.fillStyle = i % 2 ? "#8a8378" : "#9c958a";
    ctx.fillRect(-T * 0.30, yy, T * 0.60, T * 0.13);
    ctx.fillStyle = "rgba(0,0,0,.22)";
    ctx.fillRect(-T * 0.30, yy + T * 0.11, T * 0.60, Math.max(1, T * 0.03));
  }
  // 扶手
  ctx.strokeStyle = "#6d5a3c"; ctx.lineWidth = Math.max(1.5, T * 0.05);
  ctx.beginPath();
  ctx.moveTo(-T * 0.32, -T * 0.28); ctx.lineTo(-T * 0.32, T * 0.30);
  ctx.moveTo(T * 0.32, -T * 0.28); ctx.lineTo(T * 0.32, T * 0.30);
  ctx.stroke();
};

// 金属杆：贴着墙，无限向下延伸
window.PROP_DRAW["pole52"] = function (ctx, p, T) {
  ctx.fillStyle = "#8f959c";
  ctx.fillRect(-T * 0.09, -T * 0.34, T * 0.18, T * 0.72);
  ctx.fillStyle = "rgba(255,255,255,.30)";
  ctx.fillRect(-T * 0.09, -T * 0.34, T * 0.05, T * 0.72);
  ctx.fillStyle = "rgba(0,0,0,.35)";
  ctx.fillRect(T * 0.05, -T * 0.34, T * 0.04, T * 0.72);
  ctx.fillStyle = "#5d6268";
  ctx.fillRect(-T * 0.14, -T * 0.36, T * 0.28, Math.max(2, T * 0.06));
};

window.PROP_DRAW["bed52"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(0,0,0,.28)";
  ctx.fillRect(-T * 0.36, -T * 0.16, T * 0.72, T * 0.46);
  ctx.fillStyle = "#7e6a52";                       // 床架
  ctx.fillRect(-T * 0.36, -T * 0.20, T * 0.72, T * 0.44);
  ctx.fillStyle = "#e8e2d4";                       // 床单
  ctx.fillRect(-T * 0.34, -T * 0.16, T * 0.68, T * 0.34);
  ctx.fillStyle = "#cfc7b6";                       // 被子翻边
  ctx.fillRect(-T * 0.34, -T * 0.02, T * 0.68, T * 0.12);
  ctx.fillStyle = "#f2eee4";                       // 枕头
  ctx.fillRect(-T * 0.30, -T * 0.20, T * 0.24, T * 0.10);
};

window.PROP_DRAW["table52"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(0,0,0,.25)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.16, T * 0.26, T * 0.10, 0, 0, 6.2832); ctx.fill();
  ctx.fillStyle = "#6b4c30";
  ctx.fillRect(-T * 0.24, -T * 0.16, T * 0.48, T * 0.30);
  ctx.fillStyle = "rgba(255,255,255,.10)";
  ctx.fillRect(-T * 0.24, -T * 0.16, T * 0.48, T * 0.05);
};

window.PROP_DRAW["fridge52"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(0,0,0,.28)";
  ctx.fillRect(-T * 0.20, T * 0.10, T * 0.40, T * 0.10);
  ctx.fillStyle = "#cfd3d6";
  ctx.fillRect(-T * 0.20, -T * 0.30, T * 0.40, T * 0.52);
  ctx.fillStyle = "rgba(0,0,0,.18)";
  ctx.fillRect(-T * 0.20, -T * 0.08, T * 0.40, Math.max(1, T * 0.03));
  ctx.fillStyle = "#9aa0a4";                       // 把手
  ctx.fillRect(T * 0.10, -T * 0.26, T * 0.04, T * 0.16);
  if (p.opened) {                                  // 开着的：里面透出冷白的光
    ctx.fillStyle = "rgba(220,240,255,.55)";
    ctx.fillRect(-T * 0.18, -T * 0.28, T * 0.36, T * 0.46);
  }
};

// 入口那扇门：从外面锁死，偶尔被里侧推开一条缝
window.PROP_DRAW["gate52"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : 0) / 1000;
  const open = !!p._open;
  const w = T * 0.86, h = T * 0.94;
  ctx.fillStyle = "#3a2a1c";
  ctx.fillRect(-w / 2 - 3, -h / 2 - 3, w + 6, h + 6);
  ctx.fillStyle = "#5c4128";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "rgba(255,255,255,.09)";
  ctx.fillRect(-w / 2, -h / 2, w, h * 0.22);
  // 门缝：锁着时是一条暗线，开着时透出旅馆那边的暖光
  const glow = open ? (0.55 + 0.35 * Math.abs(Math.sin(t * 4))) : 0.12;
  ctx.fillStyle = "rgba(255,214,150," + glow.toFixed(3) + ")";
  ctx.fillRect(-w / 2, h / 2 - Math.max(2, h * 0.08), w, Math.max(2, h * 0.08));
  // 门牌：写着 5
  ctx.fillStyle = "#241a10";
  ctx.fillRect(-w * 0.30, -h * 0.44, w * 0.60, h * 0.17);
  ctx.fillStyle = "#e8d7a8";
  ctx.font = "bold " + Math.round(T * 0.16) + "px system-ui, sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("5", 0, -h * 0.355);
  // 锁着：门上挂一条链子
  if (!open) {
    ctx.strokeStyle = "#8d8f93"; ctx.lineWidth = Math.max(1.5, T * 0.05);
    ctx.beginPath();
    ctx.moveTo(-w * 0.18, 0); ctx.lineTo(w * 0.18, T * 0.06);
    ctx.stroke();
  }
};

// ---------- 每帧：入口门周期性地被里侧推开一条缝 ----------
window.__LEVEL_TICK = window.__LEVEL_TICK || {};
window.__LEVEL_TICK["5.2"] = function (g, dt) {
  const gate = g.map && g.map.gate52;
  if (!gate) return;
  gate.t = (gate.t || 0) + dt;
  const cycle = 32, win = 8;
  // 第一次不用等满一轮 —— 12 秒后就先开一次，让人知道这扇门是会开的
  const ph = gate.t < cycle ? (gate.t + (cycle - 12)) % cycle : gate.t % cycle;
  const open = ph > cycle - win;
  if (open !== gate._open) {
    gate._open = open;
    // 开着的时候才给 toLevel —— 通用门的判定只认这个字段，
    // 于是"锁着按 E 没反应、开着那一瞬间按 E 就能出去"自然成立。
    gate.toLevel = open ? 5 : null;
    if (open && typeof window.__toast === "function") {
      window.__toast("入口那边传来响动 —— 有人从里面把门推开了一条缝");
    }
  }
  gate.tip = open
    ? "入口的门被推开了一条缝 —— 就是现在，快"
    : "入口的门从外面锁死了 —— 只能守在这儿，等里面的人来开";
};

// Level 5 里那扇通往胜景的门：门楣上钉着一块写着「胜景」的牌子
window.PROP_DRAW["sign52"] = function (ctx, p, T) {
  const w = T * 0.84, h = T * 0.92;
  // 门框：旅馆那种深木色
  ctx.fillStyle = "#3d2a1a";
  ctx.fillRect(-w / 2 - 3, -h / 2 - 3, w + 6, h + 6);
  ctx.fillStyle = "#63482c";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "rgba(255,255,255,.10)";
  ctx.fillRect(-w / 2, -h / 2, w, h * 0.22);
  // 门缝里透出的一点暖光 —— 那边是有人住的地方
  ctx.fillStyle = "rgba(255,206,140,.30)";
  ctx.fillRect(-w / 2, h / 2 - Math.max(2, h * 0.07), w, Math.max(2, h * 0.07));
  // 门楣上那块牌子
  ctx.fillStyle = "#d8c48a";
  ctx.fillRect(-w * 0.42, -h * 0.66, w * 0.84, h * 0.22);
  ctx.fillStyle = "#2f2013";
  ctx.font = "bold " + Math.round(T * 0.17) + "px system-ui, sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("胜景", 0, -h * 0.55);
  // 把手
  ctx.fillStyle = "#c9a95c";
  ctx.beginPath(); ctx.arc(w * 0.28, 0, Math.max(1.5, T * 0.05), 0, 6.2832); ctx.fill();
};
