// ===========================================================
// Level 11.3 —— 红灯区
//
// 钢铁与玻璃组成的地狱，无垠城市卑劣的子嗣。楼宇射出红光，
// 污损着无月的夜空。空气里满是恨意与绝望，会让人产生无法抵抗的
// 幻视幻听 —— 戴面罩或口罩可以缓解。
//
// 市郊多是小型公寓、仓库、商业楼；越往深处楼越密越高。
// 建筑几乎全被掏空，供水系统全部无效。
//
// 这里被大量仆从占据：灰白皮肤、红色眼睛。他们不会立刻动手，
// 而是成群远远跟着，把你逼进死胡同、困在建筑里，等你露出破绽。
// 红灯区里没有人类 —— 你遇到的"人"一定是伪装的。
//
// 出口：市郊大片的水体上会出现无限延伸的桥，能带你回 Level 11。
// ===========================================================
"use strict";

if (typeof regTile === "function") regTile("redlight", ["#3a2c30", "#1c171c"]);
else { (window.__NEWTILE_EXTRA = window.__NEWTILE_EXTRA || {})["redlight"] = ["#3a2c30", "#1c171c"]; }

function generateRedlightMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const props = [];
  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return;
    props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  };
  const mid = Math.floor(size / 2);
  const inDeep = (x, y) => Math.hypot(x - mid, y - mid) < size * 0.24;

  // ---- 街区网格：市郊稀（小楼），深处密（高楼）----
  const block = 8, road = 2;
  const nb = Math.floor((size - 6) / block);
  const buildings = [];
  for (let by = 0; by < nb; by++) {
    for (let bx = 0; bx < nb; bx++) {
      const x0 = 3 + bx * block, y0 = 3 + by * block;
      const bw = block - road, bh = block - road;
      if (x0 + bw >= size - 2 || y0 + bh >= size - 2) continue;
      const deep = inDeep(x0 + (bw >> 1), y0 + (bh >> 1));
      // 深处几乎全是楼，市郊稀疏一些
      if (!deep && Math.random() < 0.30) continue;
      for (let y = y0; y < y0 + bh; y++)
        for (let x = x0; x < x0 + bw; x++) grid[y][x] = 1;
      // 约四成的楼被掏空了能进去（"探索过的建筑几乎全部空无一物"）
      const openable = Math.random() < 0.42;
      if (openable) {
        for (let y = y0 + 1; y < y0 + bh - 1; y++)
          for (let x = x0 + 1; x < x0 + bw - 1; x++) grid[y][x] = 0;
        const side = randInt(0, 3);
        let mx = 0, my = 0;
        if (side === 0) { mx = x0 + (bw >> 1); my = y0; }
        else if (side === 1) { mx = x0 + (bw >> 1); my = y0 + bh - 1; }
        else if (side === 2) { mx = x0; my = y0 + (bh >> 1); }
        else { mx = x0 + bw - 1; my = y0 + (bh >> 1); }
        grid[my][mx] = 0;
      }
      buildings.push({ x0, y0, bw, bh, deep, open: openable,
        cx: x0 + (bw >> 1), cy: y0 + (bh >> 1) });
    }
  }
  // ---- 街道：楼之外全挖开 ----
  for (let y = 2; y < size - 2; y++)
    for (let x = 2; x < size - 2; x++) if (grid[y][x] === 1) grid[y][x] = 0;

  // ---- 市郊那片水：大片的黑水，走不进去 ----
  const water = new Set();
  const wx0 = 4, wy0 = 4;
  const ww = Math.min(20, Math.floor(size * 0.26)), wh = Math.min(14, Math.floor(size * 0.18));
  for (let y = wy0; y < wy0 + wh; y++)
    for (let x = wx0; x < wx0 + ww; x++) {
      if (x < 2 || y < 2 || x >= size - 2 || y >= size - 2) continue;
      grid[y][x] = 1;                 // 水面：走不进去（墙格，但画成水）
      water.add(x + "," + y);
    }

  // ---- 桥：横贯水面，是这里唯一的活路 ----
  const bridgeY = wy0 + Math.floor(wh / 2);
  const bridge = [];
  for (let x = wx0 - 3; x < wx0 + ww + 3; x++) {
    if (x < 2 || x >= size - 2) continue;
    grid[bridgeY][x] = 0;
    water.delete(x + "," + bridgeY);
    bridge.push({ x, y: bridgeY });
  }

  // ---- 出生点：市郊的街上（别把人丢进深处）----
  let start = null, bd = 1e9;
  for (let y = 3; y < size - 3; y++)
    for (let x = 3; x < size - 3; x++) {
      if (grid[y][x] !== 0) continue;
      if (inDeep(x, y)) continue;
      // 靠近那片水，但不在水里
      const d = Math.abs(x - (wx0 + ww + 4)) + Math.abs(y - bridgeY);
      if (d < bd) { bd = d; start = { x, y, floor: 0 }; }
    }
  if (!start) start = { x: 4, y: size - 5, floor: 0 };
  grid[start.y][start.x] = 0;

  const reach = reachableFromRaw(grid, size, start);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const k = x + "," + y;
      if (grid[y][x] === 0 && !reach.has(k)) grid[y][x] = 1;
      if (grid[y][x] === 1 && !water.has(k)) { /* 墙 */ }
    }
  const floors = collectFloors(grid, size);

  // ---- 楼里透着红光的窗 ----
  for (const b of buildings) {
    const n = b.deep ? 5 : 3;
    for (let i = 0; i < n; i++) {
      const x = b.x0 + randInt(0, b.bw - 1), y = b.y0 + randInt(0, b.bh - 1);
      put(x, y, "redwindow113", { phase: (x * 3 + y * 7) % 6.2832 });
    }
  }
  // ---- 漩涡：天上那团云围成的、一直在转的东西 ----
  const vortex = { type: "vortex113", x: mid, y: Math.max(3, mid - Math.floor(size * 0.30)), floor: 0 };
  props.push(vortex);
  // ---- 大使馆：深处那座圆顶建筑 ----
  const emb = { type: "embassy113", x: mid, y: mid, floor: 0 };
  put(mid, mid, "embassy113");
  // ---- 出口：水面上那座无限延伸的桥 ----
  const bx = bridge.length ? bridge[bridge.length - 1].x - 1 : start.x;
  const by = bridge.length ? bridge[0].y : start.y;
  const bridgeProp = { type: "bridge113", x: bx, y: by, floor: 0,
    toLevel: 11, tip: "一座桥，无限地伸进黑里 —— 桥那头是 Level 11。小心，桥上常有看守" };
  props.push(bridgeProp);
  for (const t of bridge) put(t.x, t.y, "plank113");

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [],
    water113: water,
    bridge113: bridgeProp,
    deep113: inDeep,
    rl113t: 0, rl113msg: 0,
  };
  map.spawnPts = [start];
  return map;
}
window.generateRedlightMap = generateRedlightMap;

// ---------- 地面 / 墙体 ----------
// 地面：湿沥青，被楼里射出的红光染着。
window.drawRedlightFloor = function (ctx, px, py, h, map, tx, ty) {
  const S = h;
  ctx.fillStyle = "#3a2c30";
  ctx.fillRect(px, py, S, S);
  // 一层薄薄的积水，映着红光
  if (((tx * 7 + ty * 5) % 9) < 2) {
    ctx.fillStyle = "rgba(180,60,60,.14)";
    ctx.fillRect(px + 2, py + 3, S - 5, Math.max(2, S * 0.28));
  }
  ctx.strokeStyle = "rgba(255,120,110,.06)"; ctx.lineWidth = 1;
  ctx.strokeRect(px + 0.5, py + 0.5, S - 1, S - 1);
  return true;
};

// 墙：楼体（深灰的钢与玻璃），水面画成黑水
window.drawRedlightWall = function (ctx, px, py, h, map, tx, ty) {
  const S = h;
  const w = map && map.water113;
  if (w && w.has(tx + "," + ty)) {
    // 黑水：几乎不动，只有一点红光浮在上面
    ctx.fillStyle = "#0b0e14";
    ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(200,70,60,.10)";
    ctx.fillRect(px, py + S * 0.35, S, Math.max(1, S * 0.10));
    ctx.fillStyle = "rgba(255,255,255,.03)";
    ctx.fillRect(px + 3, py + S * 0.6, S - 8, 1);
    return true;
  }
  ctx.fillStyle = "#1c171c";
  ctx.fillRect(px, py, S, S);
  // 玻璃幕墙的分格
  ctx.strokeStyle = "rgba(120,90,90,.22)"; ctx.lineWidth = 1;
  ctx.strokeRect(px + 1.5, py + 1.5, S - 3, S - 3);
  ctx.fillStyle = "rgba(255,255,255,.05)";
  ctx.fillRect(px, py, S, Math.max(2, S * 0.10));
  return true;
};

// ---------- 物件 ----------
window.PROP_DRAW = window.PROP_DRAW || {};

// 楼里透着红光的窗
window.PROP_DRAW["redwindow113"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : 0) / 1000;
  const f = 0.55 + 0.45 * Math.sin(t * 1.3 + (p.phase || 0));
  const r = T * 0.95;
  const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
  gr.addColorStop(0, "rgba(255,60,50," + (0.42 * f).toFixed(3) + ")");
  gr.addColorStop(1, "rgba(255,60,50,0)");
  ctx.fillStyle = gr;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.2832); ctx.fill();
  ctx.fillStyle = "rgba(255,120,90," + (0.55 + 0.35 * f).toFixed(3) + ")";
  ctx.fillRect(-T * 0.16, -T * 0.12, T * 0.32, T * 0.24);
};

// 桥板：一块块横在水面上
window.PROP_DRAW["plank113"] = function (ctx, p, T) {
  ctx.fillStyle = "#4a3b32";
  ctx.fillRect(-T * 0.50, -T * 0.42, T * 1.00, T * 0.84);
  ctx.fillStyle = "rgba(255,255,255,.07)";
  ctx.fillRect(-T * 0.50, -T * 0.42, T * 1.00, Math.max(1, T * 0.10));
  ctx.fillStyle = "rgba(0,0,0,.30)";
  for (let i = 0; i < 3; i++) ctx.fillRect(-T * 0.50, -T * 0.20 + i * (T * 0.26), T * 1.00, Math.max(1, T * 0.04));
  // 两侧的栏杆
  ctx.fillStyle = "#6d5a48";
  ctx.fillRect(-T * 0.50, -T * 0.48, T * 1.00, Math.max(1, T * 0.06));
  ctx.fillRect(-T * 0.50, T * 0.40, T * 1.00, Math.max(1, T * 0.06));
};

// 出口：桥头那块牌子
window.PROP_DRAW["bridge113"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : 0) / 1000;
  const f = 0.5 + 0.5 * Math.sin(t * 2);
  // 一圈提示光
  const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, T * 1.3);
  gr.addColorStop(0, "rgba(150,220,255," + (0.30 * f).toFixed(3) + ")");
  gr.addColorStop(1, "rgba(150,220,255,0)");
  ctx.fillStyle = gr;
  ctx.beginPath(); ctx.arc(0, 0, T * 1.3, 0, 6.2832); ctx.fill();
  // 牌子
  ctx.fillStyle = "#2b3138";
  ctx.fillRect(-T * 0.34, -T * 0.60, T * 0.68, T * 0.30);
  ctx.fillStyle = "#cfe6f2";
  ctx.font = "bold " + Math.round(T * 0.15) + "px system-ui, sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("→ 11", 0, -T * 0.45);
  // 立柱
  ctx.fillStyle = "#4a5259";
  ctx.fillRect(-T * 0.05, -T * 0.32, T * 0.10, T * 0.50);
};

// 漩涡：天上那团云围成的、一直在转的东西，会射出红色的闪电
window.PROP_DRAW["vortex113"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : 0) / 1000;
  const R = T * 2.6;
  // 云围成的漩涡
  ctx.save();
  ctx.rotate(t * 0.35);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * 6.2832;
    ctx.strokeStyle = "rgba(150,140,150," + (0.16 + 0.06 * i).toFixed(3) + ")";
    ctx.lineWidth = T * 0.22;
    ctx.beginPath();
    ctx.arc(0, 0, R * (0.4 + i * 0.14), a, a + 2.1);
    ctx.stroke();
  }
  ctx.restore();
  // 中心的暗
  const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 0.55);
  gr.addColorStop(0, "rgba(10,8,12,.85)");
  gr.addColorStop(1, "rgba(10,8,12,0)");
  ctx.fillStyle = gr;
  ctx.beginPath(); ctx.arc(0, 0, R * 0.55, 0, 6.2832); ctx.fill();
  // 射出的红色闪电
  if (Math.sin(t * 1.7) > 0.86) {
    ctx.strokeStyle = "rgba(255,70,60,.85)"; ctx.lineWidth = Math.max(1.5, T * 0.06);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    for (let i = 1; i <= 4; i++) {
      const a = t * 3 + i * 1.7;
      ctx.lineTo(Math.cos(a) * R * 0.22 * i, Math.sin(a) * R * 0.22 * i);
    }
    ctx.stroke();
  }
};

// 大使馆：深处那座圆顶建筑
window.PROP_DRAW["embassy113"] = function (ctx, p, T) {
  const w = T * 1.5, h = T * 1.2;
  ctx.fillStyle = "rgba(0,0,0,.45)";
  ctx.beginPath(); ctx.ellipse(0, h * 0.46, w * 0.52, h * 0.12, 0, 0, 6.2832); ctx.fill();
  // 基座
  ctx.fillStyle = "#3d3630";
  ctx.fillRect(-w / 2, -h * 0.10, w, h * 0.56);
  // 圆顶
  ctx.fillStyle = "#4a4038";
  ctx.beginPath();
  ctx.ellipse(0, -h * 0.10, w * 0.46, h * 0.42, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = "rgba(255,120,90,.20)";
  ctx.beginPath();
  ctx.ellipse(0, -h * 0.10, w * 0.30, h * 0.28, 0, Math.PI, 0);
  ctx.fill();
  // 门口那一列柱子
  for (let i = -2; i <= 2; i++) {
    ctx.fillStyle = "#5a5048";
    ctx.fillRect(i * (w * 0.16) - T * 0.05, -h * 0.08, T * 0.10, h * 0.50);
  }
  // 顶上那点红光
  ctx.fillStyle = "rgba(255,60,50,.55)";
  ctx.beginPath(); ctx.arc(0, -h * 0.50, Math.max(2, T * 0.07), 0, 6.2832); ctx.fill();
};

// ---------- 每帧：幻视幻听、面罩能缓解、仆从的压迫 ----------
const RL113_LINES = [
  "有人在叫你的名字 —— 可这条街上一个人都没有",
  "楼上的窗里站着一个人，一动不动地看着你。再看一眼，窗是空的",
  "空气里有股铁锈味。你开始分不清哪些声音是真的",
  "别停下来。停下来的都留在这儿了",
];
window.__LEVEL_TICK = window.__LEVEL_TICK || {};
window.__LEVEL_TICK["11.3"] = function (g, dt) {
  const map = g.map;
  map.rl113t = (map.rl113t || 0) + dt;
  // 空气里的东西会让人产生幻视幻听 —— 戴面罩或口罩可以缓解
  const masked = !!(g.equip && (g.equip.mask || g.equip.mask113 || g.equip.gasmask));
  const rate = masked ? 0.35 : 1.5;
  g.sanity = Math.max(0, g.sanity - rate * dt);
  if (map.rl113t - (map.rl113msg || 0) > 19) {
    map.rl113msg = map.rl113t;
    if (typeof window.__toast === "function") {
      window.__toast(masked
        ? "面罩挡住了一点 —— 那些声音小了些，但还在"
        : RL113_LINES[Math.floor(map.rl113t / 19) % RL113_LINES.length]);
    }
  }
};

// Level 11 市郊那条漆黑的小巷 —— 通往红灯区
window.PROP_DRAW["alley113"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : 0) / 1000;
  const f = 0.6 + 0.4 * Math.sin(t * 1.8);
  // 巷口：两侧楼的夹缝，里面比街上更黑
  ctx.fillStyle = "#08080c";
  ctx.fillRect(-T * 0.34, -T * 0.46, T * 0.68, T * 0.92);
  // 夹缝两侧楼体的边
  ctx.fillStyle = "#2a2228";
  ctx.fillRect(-T * 0.46, -T * 0.48, T * 0.14, T * 0.96);
  ctx.fillRect(T * 0.32, -T * 0.48, T * 0.14, T * 0.96);
  // 楼上那几扇透着红光的窗
  for (let i = 0; i < 3; i++) {
    const yy = -T * 0.34 + i * (T * 0.26);
    ctx.fillStyle = "rgba(255,70,58," + (0.30 + 0.45 * f).toFixed(3) + ")";
    ctx.fillRect(-T * 0.44, yy, T * 0.10, T * 0.14);
    ctx.fillRect(T * 0.34, yy + T * 0.06, T * 0.10, T * 0.14);
  }
  // 巷口地面上被红光染出来的一片
  const gr = ctx.createRadialGradient(0, T * 0.30, 0, 0, T * 0.30, T * 0.70);
  gr.addColorStop(0, "rgba(255,60,50," + (0.26 * f).toFixed(3) + ")");
  gr.addColorStop(1, "rgba(255,60,50,0)");
  ctx.fillStyle = gr;
  ctx.beginPath(); ctx.arc(0, T * 0.30, T * 0.70, 0, 6.2832); ctx.fill();
};
