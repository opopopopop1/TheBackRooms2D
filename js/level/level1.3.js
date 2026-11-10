// ===========================================================
// Level 1.3 —— 恶性肿瘤
//
// 地面和墙壁都是白色的瓷砖。16 个大型房间，其中 8 个是「排毒区」——
// 踏进去，伤口确实在慢慢愈合；可那是假的。接受过"治疗"之后，皮肤会大片
// 大片地脱落，几分钟内就会死，像是被植入了恶性肿瘤。M.E.G 已把这里重定为死区。
//
// 剩下 8 个是「衰败区」：原本正常的区域正在衰退 —— 地面裂出一个个空洞
// （周围有空气墙，人进不去），墙体上也烂出了洞，有的墙甚至开始倾斜。
//
// 入口：Level 1 里一面被封锁的白墙（有守卫看着），得找个空子钻进去。
// 出口：找到一面纯白的墙，走进去回到 Level 1。
// ===========================================================
"use strict";

if (typeof regTile === "function") regTile("tumor13", ["#eef1f2", "#dfe6e9"]);
else { (window.__NEWTILE_EXTRA = window.__NEWTILE_EXTRA || {})["tumor13"] = ["#eef1f2", "#dfe6e9"]; }

function generateTumor13Map(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const props = [];
  const detox = new Set();      // 排毒区的地板（踏进去就开始"治疗"）
  const holes = new Set();      // 空洞（地板上、墙面上）—— 挡路，画成一片虚空
  const tilt = new Set();       // 已经倾斜的墙体
  const rooms = [];

  // ---- 布局：一整张走廊网 + 16 间彼此不相通的房间 ----
  // 5 条横廊 + 5 条纵廊贯穿全图，交叉成一张网。廊与廊之间围出 16 个街区，
  // 每个街区正中立一间房，每间房**只开一个口**通向最近那条廊。
  // 于是房间和房间之间永远隔着墙 —— 想去另一间，只能先回到走廊。
  const CN = 4;                       // 4×4 = 16 间
  const CW = 3;                       // 走廊宽 3 格
  const cellW = 14;                   // 街区边长
  const rw = cellW - 2;               // 房间边长（四周留一圈墙）
  const m = Math.max(2, Math.floor((size - (CN * cellW + (CN + 1) * CW)) / 2));
  const cAt = (k) => m + k * (cellW + CW);   // 第 k 条廊的起点

  const setF = (x, y) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return;
    grid[y][x] = 0;
  };
  const keyOf = (x, y) => x + "," + y;

  // 走廊：横纵各 CN+1 条，贯穿整张图
  for (let k = 0; k <= CN; k++) {
    const a = cAt(k);
    for (let t = 0; t < CW; t++) {
      for (let s = m; s < size - m; s++) { setF(s, a + t); setF(a + t, s); }
    }
  }

  for (let j = 0; j < CN; j++) {
    for (let i = 0; i < CN; i++) {
      const bx = cAt(i) + CW, by = cAt(j) + CW;   // 街区左上角
      const x0 = bx + 1, y0 = by + 1;             // 房间左上角（缩进一圈墙）
      carveRoom(grid, size, x0, y0, rw, rw);
      // 门：每间只开一个口，正对最近的那条廊
      const side = randInt(0, 3);
      let dx, dy;
      if (side === 0) { dx = x0 + randInt(1, rw - 2); dy = y0 - 1; }        // 上 → 横廊 j
      else if (side === 1) { dx = x0 + randInt(1, rw - 2); dy = y0 + rw; }  // 下 → 横廊 j+1
      else if (side === 2) { dx = x0 - 1; dy = y0 + randInt(1, rw - 2); }   // 左 → 纵廊 i
      else { dx = x0 + rw; dy = y0 + randInt(1, rw - 2); }                  // 右 → 纵廊 i+1
      setF(dx, dy);
      rooms.push({
        i, j, x0, y0, w: rw, h: rw,
        cx: x0 + (rw >> 1), cy: y0 + (rw >> 1),
        door: { x: dx, y: dy },
      });
    }
  }

  // ---- 出生点：正中间那间 ----
  const startRoomIdx = 5;                       // (i=1, j=1)
  const sr = rooms[startRoomIdx];
  const start = { x: sr.cx, y: sr.cy, floor: 0 };

  // ---- 16 间里挑 8 间当排毒区 ----
  const order = rooms.map((_, k) => k);
  for (let k = order.length - 1; k > 0; k--) {
    const r = randInt(0, k); const t = order[k]; order[k] = order[r]; order[r] = t;
  }
  const detoxIds = new Set(order.slice(0, 8));

  rooms.forEach((r, k) => { r.detox = detoxIds.has(k); });

  // 排毒区：整间的地板都登记进去（判定玩家是否在"治疗"）
  for (const r of rooms) {
    if (!r.detox) continue;
    for (let y = r.y0; y < r.y0 + r.h; y++)
      for (let x = r.x0; x < r.x0 + r.w; x++)
        if (grid[y] && grid[y][x] === 0) detox.add(keyOf(x, y));
  }

  // ---- 衰败区：地面上的空洞 + 墙体烂出的洞 + 倾斜的墙 ----
  for (const r of rooms) {
    if (r.detox) continue;
    // 地面空洞：一小簇 1~2 格，避开房间正中（免得把路堵死）
    const n = randInt(4, 7);
    for (let c = 0; c < n; c++) {
      const x = r.x0 + randInt(1, r.w - 2), y = r.y0 + randInt(1, r.h - 2);
      if (Math.abs(x - r.cx) < 2 && Math.abs(y - r.cy) < 2) continue;
      // 别把唯一的门堵了 —— 这间房就这一个口
      if (r.door && Math.abs(x - r.door.x) <= 2 && Math.abs(y - r.door.y) <= 2) continue;
      if (!grid[y] || grid[y][x] !== 0) continue;
      grid[y][x] = 1; holes.add(keyOf(x, y));
      if (Math.random() < 0.45) {
        const x2 = x + (Math.random() < 0.5 ? 1 : -1);
        if (grid[y] && grid[y][x2] === 0) { grid[y][x2] = 1; holes.add(keyOf(x2, y)); }
      }
    }
    // 墙体上的洞：房间外圈那一圈墙，挑几格烂穿
    for (let c = 0; c < 5; c++) {
      const side = randInt(0, 3);
      let wx, wy;
      if (side === 0) { wx = r.x0 + randInt(0, r.w - 1); wy = r.y0 - 1; }
      else if (side === 1) { wx = r.x0 + randInt(0, r.w - 1); wy = r.y0 + r.h; }
      else if (side === 2) { wx = r.x0 - 1; wy = r.y0 + randInt(0, r.h - 1); }
      else { wx = r.x0 + r.w; wy = r.y0 + randInt(0, r.h - 1); }
      if (wx < 1 || wy < 1 || wx >= size - 1 || wy >= size - 1) continue;
      if (grid[wy][wx] !== 1) continue;
      holes.add(keyOf(wx, wy));
    }
    // 倾斜的墙：整段墙歪着，看着随时会塌
    for (let c = 0; c < 6; c++) {
      const side = randInt(0, 3);
      let wx, wy;
      if (side === 0) { wx = r.x0 + randInt(0, r.w - 1); wy = r.y0 - 1; }
      else if (side === 1) { wx = r.x0 + randInt(0, r.w - 1); wy = r.y0 + r.h; }
      else if (side === 2) { wx = r.x0 - 1; wy = r.y0 + randInt(0, r.h - 1); }
      else { wx = r.x0 + r.w; wy = r.y0 + randInt(0, r.h - 1); }
      if (wx < 1 || wy < 1 || wx >= size - 1 || wy >= size - 1) continue;
      if (grid[wy][wx] !== 1) continue;
      tilt.add(keyOf(wx, wy));
    }
  }

  // 空洞把路堵断的地方补回来 —— 保证整层走得通
  ensureAllConnected(grid, size, { x: start.x, y: start.y });
  // 兜底接路时可能顺手把某些洞挖开了 —— 只保留现在真的还是墙的那些，
  // 免得画成一片虚空、人却能踩上去
  for (const k of Array.from(holes)) {
    const p = k.split(","); const hx = +p[0], hy = +p[1];
    if (grid[hy] && grid[hy][hx] !== 1) holes.delete(k);
  }

  const floors = collectFloors(grid, size);

  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return;
    props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  };

  // ---- 排毒区里的陈设：病床、输液架、「病房」的牌子 ----
  for (const r of rooms) {
    if (!r.detox) continue;
    for (let c = 0; c < 3; c++) {
      const x = r.x0 + randInt(1, r.w - 2), y = r.y0 + randInt(1, r.h - 2);
      if (grid[y] && grid[y][x] === 0) put(x, y, "bed13");
    }
    for (let c = 0; c < 2; c++) {
      const x = r.x0 + randInt(1, r.w - 2), y = r.y0 + randInt(1, r.h - 2);
      if (grid[y] && grid[y][x] === 0) put(x, y, "iv13");
    }
    put(r.x0 + 1, r.y0, "sign13");
  }

  // ---- 出口：离出生点最远的那间，立着一面纯白的墙 ----
  let far = rooms[0], fd = -1;
  for (const r of rooms) {
    const d = Math.abs(r.cx - start.x) + Math.abs(r.cy - start.y);
    if (d > fd) { fd = d; far = r; }
  }
  let ex = far.x0 + 1, ey = far.cy;
  if (!grid[ey] || grid[ey][ex] !== 0) {
    for (let y = far.y0; y < far.y0 + far.h; y++)
      for (let x = far.x0; x < far.x0 + far.w; x++)
        if (grid[y] && grid[y][x] === 0) { ex = x; ey = y; }
  }
  const whiteWall = {
    type: "whitewall13", x: ex, y: ey, floor: 0,
    toLevel: 1, tip: "一面纯白的墙 —— 白得比别处更干净，干净得不对劲",
  };
  props.push(whiteWall);

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [],
    detox13: detox, holes13: holes, tilt13: tilt,
    whitewall13: whiteWall,
  };
  map.spawnPts = [start];
  return map;
}
window.generateTumor13Map = generateTumor13Map;

// ---------- 地面 / 墙体 ----------
// 地面：白色方瓷砖，缝是灰的；排毒区的地砖泛着一点惨绿
window.drawTumorFloor = function (ctx, px, py, h, map, tx, ty) {
  const S = (typeof h === "number" ? h : 40);
  const k = tx + "," + ty;
  ctx.fillStyle = "#eef1f2";
  ctx.fillRect(px, py, S, S);
  // 砖缝
  ctx.strokeStyle = "rgba(150,162,170,.55)";
  ctx.lineWidth = 1;
  ctx.strokeRect(px + 0.5, py + 0.5, S - 1, S - 1);
  // 砖面高光
  ctx.fillStyle = "rgba(255,255,255,.55)";
  ctx.fillRect(px + 1, py + 1, S - 2, 2);
  // 霉斑 / 渗出的黄
  const s = ((tx * 7 + ty * 13) % 17);
  if (s === 0) {
    ctx.fillStyle = "rgba(196,186,150,.42)";
    ctx.fillRect(px + S * 0.25, py + S * 0.35, S * 0.42, S * 0.30);
  } else if (s === 5) {
    ctx.fillStyle = "rgba(150,160,168,.30)";
    ctx.fillRect(px + S * 0.15, py + S * 0.55, S * 0.55, S * 0.20);
  }
  // 排毒区：地砖发绿，还印着一个褪色的红十字
  if (map && map.detox13 && map.detox13.has(k)) {
    ctx.fillStyle = "rgba(150,200,160,.16)";
    ctx.fillRect(px, py, S, S);
    if (((tx + ty) % 6) === 0) {
      ctx.strokeStyle = "rgba(170,80,80,.30)";
      ctx.lineWidth = Math.max(1.5, S * 0.07);
      ctx.beginPath();
      ctx.moveTo(px + S * 0.32, py + S * 0.5); ctx.lineTo(px + S * 0.68, py + S * 0.5);
      ctx.moveTo(px + S * 0.5, py + S * 0.32); ctx.lineTo(px + S * 0.5, py + S * 0.68);
      ctx.stroke();
    }
  }
  return true;
};

// 墙体：白瓷砖；烂穿的地方是一片虚空；有几段墙是歪的
window.drawTumorWall = function (ctx, px, py, h, map, tx, ty) {
  const S = (typeof h === "number" ? h : 40);
  const k = tx + "," + ty;
  // 空洞：什么都没有 —— 黑得看不见底
  if (map && map.holes13 && map.holes13.has(k)) {
    ctx.fillStyle = "#101418";
    ctx.fillRect(px, py, S, S);
    const cx = px + S / 2, cy = py + S / 2;
    const gr = ctx.createRadialGradient(cx, cy, S * 0.05, cx, cy, S * 0.62);
    gr.addColorStop(0, "#000000");
    gr.addColorStop(0.55, "#05080b");
    gr.addColorStop(1, "rgba(16,20,24,1)");
    ctx.fillStyle = gr;
    ctx.fillRect(px, py, S, S);
    // 洞口的瓷砖被啃出锯齿
    ctx.fillStyle = "#c8d0d4";
    ctx.beginPath();
    ctx.moveTo(px, py + S * 0.18);
    ctx.lineTo(px + S * 0.22, py + S * 0.10);
    ctx.lineTo(px + S * 0.30, py + S * 0.26);
    ctx.lineTo(px + S * 0.16, py + S * 0.30);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#b9c2c7";
    ctx.beginPath();
    ctx.moveTo(px + S, py + S * 0.72);
    ctx.lineTo(px + S * 0.78, py + S * 0.80);
    ctx.lineTo(px + S * 0.70, py + S * 0.66);
    ctx.lineTo(px + S * 0.86, py + S * 0.62);
    ctx.closePath(); ctx.fill();
    return true;
  }
  // 倾斜的墙：整块歪过去一点
  const tl = map && map.tilt13 && map.tilt13.has(k);
  if (tl) {
    ctx.save();
    ctx.translate(px + S / 2, py + S / 2);
    ctx.rotate((((tx * 3 + ty) % 2) ? 1 : -1) * 0.14);
    ctx.translate(-(px + S / 2), -(py + S / 2));
  }
  ctx.fillStyle = "#dfe6e9";
  ctx.fillRect(px, py, S, S);
  // 瓷砖：两排小块
  ctx.strokeStyle = "rgba(140,152,160,.50)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(px, py + S * 0.5); ctx.lineTo(px + S, py + S * 0.5);
  ctx.moveTo(px + S * 0.5, py); ctx.lineTo(px + S * 0.5, py + S * 0.5);
  ctx.moveTo(px + S * 0.5, py + S * 0.5); ctx.lineTo(px + S * 0.5, py + S);
  ctx.stroke();
  // 上亮下暗 —— 墙的立体感
  ctx.fillStyle = "rgba(255,255,255,.22)";
  ctx.fillRect(px, py, S, Math.max(2, S * 0.10));
  ctx.fillStyle = "rgba(0,0,0,.26)";
  ctx.fillRect(px, py + S - Math.max(2, S * 0.12), S, Math.max(2, S * 0.12));
  // 缝里渗出的污渍
  if (((tx * 5 + ty * 11) % 13) === 0) {
    ctx.fillStyle = "rgba(150,140,110,.35)";
    ctx.fillRect(px + S * 0.55, py + S * 0.20, S * 0.30, S * 0.22);
  }
  if (tl) ctx.restore();
  return true;
};

// ---------- 物件 ----------
window.PROP_DRAW = window.PROP_DRAW || {};

// 病床：「病房」里剩下的那些
window.PROP_DRAW["bed13"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(0,0,0,.24)";
  ctx.fillRect(-T * 0.36, T * 0.10, T * 0.72, T * 0.22);
  // 床架
  ctx.fillStyle = "#b9c3c8";
  ctx.fillRect(-T * 0.34, -T * 0.16, T * 0.68, T * 0.30);
  // 床垫：白，但已经发黄
  ctx.fillStyle = "#e6e2d4";
  ctx.fillRect(-T * 0.32, -T * 0.20, T * 0.64, T * 0.24);
  // 枕头
  ctx.fillStyle = "#f2f0e8";
  ctx.fillRect(-T * 0.30, -T * 0.28, T * 0.24, T * 0.12);
  // 护栏
  ctx.strokeStyle = "#9aa5ab"; ctx.lineWidth = Math.max(1.2, T * 0.035);
  ctx.beginPath();
  ctx.moveTo(-T * 0.34, -T * 0.02); ctx.lineTo(T * 0.34, -T * 0.02);
  ctx.stroke();
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(i * T * 0.15, -T * 0.02); ctx.lineTo(i * T * 0.15, T * 0.08);
    ctx.stroke();
  }
  // 床脚
  ctx.fillStyle = "#8d979d";
  ctx.fillRect(-T * 0.32, T * 0.12, T * 0.06, T * 0.16);
  ctx.fillRect(T * 0.26, T * 0.12, T * 0.06, T * 0.16);
};

// 输液架：杆子还在，袋子早空了
window.PROP_DRAW["iv13"] = function (ctx, p, T) {
  ctx.fillStyle = "#a8b2b8";
  ctx.fillRect(-T * 0.03, -T * 0.42, T * 0.06, T * 0.78);
  // 挂钩
  ctx.beginPath();
  ctx.moveTo(-T * 0.16, -T * 0.42); ctx.lineTo(T * 0.16, -T * 0.42);
  ctx.strokeStyle = "#a8b2b8"; ctx.lineWidth = Math.max(1.2, T * 0.04); ctx.stroke();
  // 袋子：空的，瘪着
  ctx.fillStyle = "rgba(220,228,232,.75)";
  ctx.beginPath();
  ctx.moveTo(-T * 0.10, -T * 0.40);
  ctx.lineTo(T * 0.10, -T * 0.40);
  ctx.lineTo(T * 0.07, -T * 0.14);
  ctx.lineTo(-T * 0.07, -T * 0.14);
  ctx.closePath(); ctx.fill();
  // 底下的轮子
  ctx.fillStyle = "#7d868c";
  ctx.fillRect(-T * 0.12, T * 0.34, T * 0.24, T * 0.06);
};

// 「病房」的牌子：挂在排毒区的门口
window.PROP_DRAW["sign13"] = function (ctx, p, T) {
  const w = T * 0.62, h = T * 0.26;
  ctx.fillStyle = "#9fb0b8";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#1d2b33";
  ctx.font = Math.round(T * 0.17) + "px system-ui, sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("病房", 0, 0);
};

// 出口：一面纯白的墙
window.PROP_DRAW["whitewall13"] = function (ctx, p, T) {
  const w = T * 0.90, h = T * 1.00;
  // 一圈冷白的光晕 —— 在这一层里它是最亮的东西
  const gr = ctx.createRadialGradient(0, 0, T * 0.10, 0, 0, T * 1.15);
  gr.addColorStop(0, "rgba(255,255,255,.44)");
  gr.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gr;
  ctx.fillRect(-T * 1.15, -T * 1.15, T * 2.30, T * 2.30);
  // 墙面：比别处的白更纯粹，一点污渍都没有
  ctx.fillStyle = "#fbfdfd";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "rgba(255,255,255,.85)";
  ctx.fillRect(-w / 2, -h / 2, w, h * 0.22);
  ctx.strokeStyle = "rgba(210,220,226,.70)"; ctx.lineWidth = 1;
  ctx.strokeRect(-w / 2 + 0.5, -h / 2 + 0.5, w - 1, h - 1);
  // 砖缝很淡 —— 白得几乎连缝都看不出来
  ctx.strokeStyle = "rgba(200,212,218,.35)";
  ctx.beginPath();
  ctx.moveTo(-w / 2, 0); ctx.lineTo(w / 2, 0);
  ctx.stroke();
};

// ---------- 每帧：排毒区的"治疗" ----------
const T13_LINES = [
  "皮肤开始发痒 —— 有什么东西被「植」进去了",
  "一小片皮从手臂上剥下来，掉在地上还在动",
  "你咳了一声，吐出来的是一整块",
  "它长得比你跑得快 —— 别停，去找那面纯白的墙",
];
window.__LEVEL_TICK = window.__LEVEL_TICK || {};
window.__LEVEL_TICK["1.3"] = function (g, dt) {
  const map = g.map;
  if (!map || !map.detox13) return;
  const T = (typeof TILE === "number" ? TILE : 40);
  const tx = Math.floor(g.player.x / T), ty = Math.floor(g.player.y / T);
  const inside = map.detox13.has(tx + "," + ty);

  if (inside) {
    g.t13in = (g.t13in || 0) + dt;
    if (!g.t13tumor) {
      // 头几秒：伤口真的在愈合 —— 这是它骗你留下的那几秒
      g.hp = Math.min(CONFIG.HP_MAX, g.hp + 6 * dt);
      g.sanity = Math.min(100, g.sanity + 3 * dt);
      if (!g._t13hi) {
        g._t13hi = 1;
        if (typeof window.__toast === "function") {
          window.__toast("墙上写着「排毒区 · 治疗中」—— 伤口真的在合上");
        }
      }
      if (g.t13in >= 6) {
        g.t13tumor = 1;
        g.t13since = 0;
        if (typeof window.__toast === "function") {
          window.__toast("愈合的地方鼓了起来 —— 那不是伤口在长好");
        }
      }
    }
  }

  if (g.t13tumor) {
    g.t13since = (g.t13since || 0) + dt;
    // 一旦被"植"进去，走到哪儿都在长 —— 快去找那面纯白的墙。
    // 它长得比你跑得快：起手 2.6/s 且越来越快，满血也就二十来秒。
    const dps = 2.6 + Math.min(12, g.t13since * 0.20);
    g.hp = Math.max(0, g.hp - dps * dt);
    g.sanity = Math.max(0, g.sanity - 4.5 * dt);
    if (!g._t13msg) g._t13msg = 0;
    if (g.t13since - g._t13msg > 5.5) {
      g._t13msg = g.t13since;
      if (typeof window.__toast === "function") {
        window.__toast(T13_LINES[Math.floor(g.t13since / 5.5) % T13_LINES.length]);
      }
    }
    if (g.hp <= 0) g.deathCause = "在排毒区被植入了恶性肿瘤";
  }
};

// ---------- Level 1 里的入口：被封锁的白墙 / 守卫 / 封锁线上的空子 ----------

// 被封锁的白墙：墙前拉着黄黑相间的封锁线
window.PROP_DRAW["blocked13"] = function (ctx, p, T) {
  const w = T * 0.92, h = T * 0.96;
  // 墙面：白瓷砖，但比别处新 —— 像是刚砌上去的
  ctx.fillStyle = "#e9eef0";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.strokeStyle = "rgba(140,152,160,.55)"; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-w / 2, 0); ctx.lineTo(w / 2, 0);
  ctx.moveTo(0, -h / 2); ctx.lineTo(0, 0);
  ctx.stroke();
  ctx.fillStyle = "rgba(0,0,0,.20)";
  ctx.fillRect(-w / 2, h / 2 - Math.max(2, T * 0.10), w, Math.max(2, T * 0.10));
  // 封锁线：黄黑斜条，横在墙前
  const by = h * 0.22;
  ctx.save();
  ctx.beginPath(); ctx.rect(-w / 2 - 2, by - T * 0.09, w + 4, T * 0.18); ctx.clip();
  ctx.fillStyle = "#e8c33a";
  ctx.fillRect(-w / 2 - 2, by - T * 0.09, w + 4, T * 0.18);
  ctx.fillStyle = "#20242a";
  for (let i = -3; i < 8; i++) {
    ctx.beginPath();
    ctx.moveTo(-w / 2 + i * T * 0.16, by + T * 0.09);
    ctx.lineTo(-w / 2 + i * T * 0.16 + T * 0.08, by + T * 0.09);
    ctx.lineTo(-w / 2 + i * T * 0.16 + T * 0.16, by - T * 0.09);
    ctx.lineTo(-w / 2 + i * T * 0.16 + T * 0.08, by - T * 0.09);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
};

// 守卫：站在封锁口前，不让任何人过去
window.PROP_DRAW["guard13"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : 0) / 1000;
  const bob = Math.sin(t * 0.8 + p.x) * T * 0.012;
  ctx.fillStyle = "rgba(0,0,0,.26)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.36, T * 0.17, T * 0.06, 0, 0, Math.PI * 2); ctx.fill();
  // 制服
  ctx.fillStyle = "#3d4a55";
  ctx.fillRect(-T * 0.14, -T * 0.14 + bob, T * 0.28, T * 0.46);
  ctx.fillStyle = "#2c3740";                          // 腿
  ctx.fillRect(-T * 0.12, T * 0.30, T * 0.09, T * 0.10);
  ctx.fillRect(T * 0.03, T * 0.30, T * 0.09, T * 0.10);
  // 反光背心
  ctx.fillStyle = "#d8d23a";
  ctx.fillRect(-T * 0.14, -T * 0.06 + bob, T * 0.28, T * 0.14);
  ctx.fillStyle = "rgba(255,255,255,.55)";
  ctx.fillRect(-T * 0.14, -T * 0.02 + bob, T * 0.28, Math.max(1, T * 0.03));
  // 头 + 帽子
  ctx.fillStyle = "#c0a184";
  ctx.beginPath(); ctx.arc(0, -T * 0.24 + bob, T * 0.10, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#2f3a44";
  ctx.fillRect(-T * 0.11, -T * 0.34 + bob, T * 0.22, T * 0.08);
  // 他挡在那儿：一只手抬着
  ctx.fillStyle = "#c0a184";
  ctx.fillRect(T * 0.13, -T * 0.10 + bob, T * 0.16, T * 0.06);
};

// 空子：墙根底下能钻过去的一道缝，里头白得刺眼
window.PROP_DRAW["gap13"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : 0) / 1000;
  const w = T * 0.88, h = T * 0.34;
  // 墙根
  ctx.fillStyle = "#e9eef0";
  ctx.fillRect(-w / 2, -T * 0.46, w, T * 0.34);
  // 那道缝：黑，但里面有东西在泛白光
  ctx.fillStyle = "#0b0e11";
  ctx.fillRect(-w / 2 + T * 0.10, -h / 2, w - T * 0.20, h);
  const a = 0.55 + 0.25 * Math.sin(t * 2.1 + p.y);
  const gr = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  gr.addColorStop(0, "rgba(255,255,255,0)");
  gr.addColorStop(0.5, "rgba(255,255,255," + a.toFixed(3) + ")");
  gr.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gr;
  ctx.fillRect(-w / 2 + T * 0.10, -h / 2, w - T * 0.20, h);
  // 缝口被撬过的痕迹
  ctx.fillStyle = "#aeb8bd";
  ctx.beginPath();
  ctx.moveTo(-w / 2 + T * 0.08, -h / 2);
  ctx.lineTo(-w / 2 + T * 0.20, -h / 2 - T * 0.06);
  ctx.lineTo(-w / 2 + T * 0.16, -h / 2 + T * 0.04);
  ctx.closePath(); ctx.fill();
};
