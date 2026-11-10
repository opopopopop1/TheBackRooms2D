// ===========================================================
// Level 26 —— 享乐号汽船
//   「派对客真正的总部，与之前的 Level Fun 相同，但是无限的。」
//   黄色的墙、Happy Birthday 的横幅、摆着蛋糕和水果的长桌、
//   一圈颜色不一的椅子、成串的气球 —— 一间接着一间，永远没有尽头。
//   面积无限：地图是一个跟着玩家滚动的窗口，走到哪加载到哪；
//   滚出窗口的地方就此不复存在（这一层不允许建立基地）。
//
//   · 实体横行：整层都是派对客，几乎无法建立基地
//   · 转化：被派对客抓住时有 1/3 不死，被拖进一间平时进不去的房间，
//           几个派对客围着你，几秒后转化成功，解锁「派对」结局
//   · 彩蛋：一条走廊的椅子上有一张扫兴客面具（=( ），按 E 戴上；
//           玩家脸上会出现面具，主菜单里可以摘下。
//           档案里扫兴客已经灭绝 —— 所以只做这一个彩蛋，不做实体
//   · 出口：触摸一张反转的海报 -> Level 27
//   · 本层不禁用跃迁浆果 / 赫尔墨斯装置
// ===========================================================
"use strict";

(function () {
  // 黄色墙 + 明亮的黄色地板（绝不是黑的，也不是管道风）
  const v = ["#ead257", "#8a6420"];
  if (typeof regTile === "function") regTile("steamer26", v);
  else { (window.__NEWTILE_EXTRA = window.__NEWTILE_EXTRA || {})["steamer26"] = v; }
})();

const L26_SIZE = 96;      // 窗口边长
const L26_P = 14;         // 一个派对厅 + 走廊的周期
const L26_REBASE = 12;    // 离窗口中心超过这么多格就把整个世界平移一次

function l26Mod(a, n) { return ((a % n) + n) % n; }

// 稳定的世界坐标哈希 —— 同一个世界格每次滚回来都长一个样
function l26Hash(wx, wy) {
  let h = ((wx | 0) * 374761393 + (wy | 0) * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) | 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// 世界格 -> 墙(1) / 地板(0)
//   每个 14×14 周期：前两行两列是纵横走廊，后面是一间 11×11 的派对厅，
//   厅与走廊之间砌墙，只在正中留两格门洞。走廊四通八达，所以整层没有孤岛。
function l26Cell(wx, wy) {
  const mx = l26Mod(wx, L26_P), my = l26Mod(wy, L26_P);
  if (mx < 2 || my < 2) return 0;                       // 走廊
  if (mx === 2 && (my === 6 || my === 7)) return 0;     // 竖墙上的门
  if (my === 2 && (mx === 6 || mx === 7)) return 0;     // 横墙上的门
  if (mx === 2 || my === 2) return 1;                   // 房间与走廊之间的墙
  return 0;                                             // 厅内
}

function l26RebuildGrid(m) {
  const size = m.size, grid = m.layers[0];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const edge = x < 1 || y < 1 || x >= size - 1 || y >= size - 1;
      grid[y][x] = edge ? 1 : l26Cell(m.originX + x, m.originY + y);
    }
  }
  try { m.floors[0] = collectFloors(grid, size); } catch (e) { /* 忽略 */ }
}

// 按世界坐标重新铺一遍装饰物件；带 l26Special 的（海报 / 面具）是持久物件，
// 跟着窗口一起平移，不会被重新生成抹掉。
function l26Populate(m) {
  const size = m.size, grid = m.layers[0];
  const keep = (m.props || []).filter((p) => p.l26Special &&
    p.x >= 1 && p.y >= 1 && p.x < size - 1 && p.y < size - 1);
  const taken = new Set(keep.map((p) => p.x + "," + p.y));
  const out = keep.slice();
  for (let y = 2; y < size - 2; y++) {
    for (let x = 2; x < size - 2; x++) {
      if (grid[y][x] !== 0 || taken.has(x + "," + y)) continue;
      const wx = m.originX + x, wy = m.originY + y;
      const r = l26Hash(wx, wy);
      const mx = l26Mod(wx, L26_P), my = l26Mod(wy, L26_P);
      let type = null, extra = null;
      if (mx >= 3 && my >= 3) {
        // 厅里：长桌、蛋糕、水果、彩椅
        if (r < 0.016) { type = "p26table"; }
        else if (r < 0.026) { type = "p26cake"; }
        else if (r < 0.036) { type = "p26fruit"; }
        else if (r < 0.062) { type = "p26chair"; extra = { color: ["#d94f4f", "#4f7fd9", "#5fbf5f", "#e0b23c", "#a95fd9", "#4fd0c0"][Math.floor(r * 1000) % 6] }; }
      } else {
        // 走廊：气球串与横幅
        if (r < 0.010) type = "p26balloons";
        else if (r < 0.016) type = "p26banner";
      }
      if (type) { out.push(Object.assign({ x, y, floor: 0, type }, extra || {})); taken.add(x + "," + y); }
    }
  }
  m.props = out;
}

// ===========================================================
// 地图：一个跟着玩家滚动的窗口 —— 面积无限
// ===========================================================
function generateSteamer26Map(level) {
  const size = L26_SIZE;
  const grid = makeGrid(size);
  const center = size >> 1;
  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [null], rooms: [[]],
    start: { x: center, y: center, floor: 0 },
    exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props: [], crates: [], ground: [],
    originX: 0, originY: 0,
    // 出生点附近固定放出口海报和面具椅子，保证一进来就找得到
    l26Special: true,
    wander: null,
  };
  makeDoorsMap(map);
  l26RebuildGrid(map);
  map.floors = [collectFloors(grid, size)];

  // 反转的海报：唯一已知出口 -> Level 27
  const posterX = center + 5, posterY = center;
  map.props.push({ x: posterX, y: posterY, floor: 0, type: "p26poster", toLevel: 27, l26Special: true });
  // 彩蛋：走廊里一把椅子上摆着扫兴客面具（=( ）
  const maskX = center - 4, maskY = center;
  map.props.push({ x: maskX, y: maskY, floor: 0, type: "p26mask", l26Special: true });
  // 面具椅子本身（和面具同一格叠着画，不单独占交互）
  map.props.push({ x: maskX, y: maskY, floor: 0, type: "p26maskchair", l26Special: true });
  l26Populate(map);
  map.spawnPts = [map.start];
  return map;
}
window.generateSteamer26Map = generateSteamer26Map;

// 窗口滚动：玩家离中心太远就把整个世界平移回来，再按新的世界坐标重铺。
// 玩家 / 物件 / 实体一起平移，所以相对位置完全连续 —— 看不出"世界在动"。
function l26Scroll(g) {
  const m = g && g.map;
  if (!m || m.originX == null || !m.layers || !m.layers[0]) return;
  const TILE_ = (typeof TILE === "number") ? TILE : 40;
  const c = m.size >> 1;
  const wx = Math.floor(g.player.x / TILE_), wy = Math.floor(g.player.y / TILE_);
  let dx = 0, dy = 0;
  if (wx < c - L26_REBASE || wx > c + L26_REBASE) dx = wx - c;
  if (wy < c - L26_REBASE || wy > c + L26_REBASE) dy = wy - c;
  if (!dx && !dy) return;
  const lim = Math.floor(m.size / 3);
  dx = Math.max(-lim, Math.min(lim, dx));
  dy = Math.max(-lim, Math.min(lim, dy));

  m.originX += dx; m.originY += dy;
  g.player.x -= dx * TILE_;
  g.player.y -= dy * TILE_;
  for (const p of (m.props || [])) { p.x -= dx; p.y -= dy; }
  for (const e of (g.entities || [])) { e.x -= dx * TILE_; e.y -= dy * TILE_; }
  l26RebuildGrid(m);
  l26Populate(m);
}
window.l26Scroll = l26Scroll;

// 每帧逻辑：只负责窗口滚动（实体 / 血量的更新走通用流程）
window.__LEVEL_TICK = window.__LEVEL_TICK || {};
window.__LEVEL_TICK["26"] = function (g) {
  try { l26Scroll(g); } catch (e) { /* 忽略 */ }
};

// ===========================================================
// 地面 / 墙：明亮的黄色派对厅，不是黑的，也不是管道风
// ===========================================================
window.drawSteamer26Floor = function (ctx, px, py, S, map, tx, ty) {
  const odd = ((tx + ty) % 2) === 0;
  ctx.fillStyle = odd ? "#f6e17a" : "#ecd267";
  ctx.fillRect(px, py, S, S);
  // 地砖缝 + 斜向反光（缝要够深，否则和墙糊成一片）
  ctx.strokeStyle = "rgba(120,84,18,.34)";
  ctx.lineWidth = 1;
  ctx.strokeRect(px + 0.5, py + 0.5, S - 1, S - 1);
  ctx.fillStyle = "rgba(255,255,255,.13)";
  ctx.fillRect(px + 2, py + 2, S - 4, 2);
  return true;
};

window.drawSteamer26Wall = function (ctx, px, py, S, map, tx, ty) {
  // 墙是深棕黄，地板是亮黄 —— 两者亮度差要够，才能看出一间间派对厅的边界
  ctx.fillStyle = "#8a6420";
  ctx.fillRect(px, py, S, S);
  // 护墙板再压一档
  ctx.fillStyle = "#5f4318";
  ctx.fillRect(px, py + S * 0.70, S, S * 0.30);
  ctx.fillStyle = "rgba(255,226,140,.55)";
  ctx.fillRect(px, py, S, Math.max(2, S * 0.09));
  // 腰线
  ctx.fillStyle = "#c9a63c";
  ctx.fillRect(px, py + S * 0.66, S, Math.max(2, S * 0.05));
  // 每隔几格挂一串三角彩旗
  if (((tx * 3 + ty * 7) % 5) === 0) {
    const cols = ["#e05a6a", "#5ac6e0", "#e0d15a", "#7ae07a", "#a95fd9"];
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = cols[i];
      ctx.beginPath();
      ctx.moveTo(px + i * S / 4, py + S * 0.10);
      ctx.lineTo(px + (i + 1) * S / 4, py + S * 0.10);
      ctx.lineTo(px + (i + 0.5) * S / 4, py + S * 0.34);
      ctx.closePath();
      ctx.fill();
    }
  }
  return true;
};

// 整层暖光：保证画面不会发黑
window.drawL26 = function (ctx, g) {
  const cw = (ctx.canvas && ctx.canvas.width) || 800;
  const ch = (ctx.canvas && ctx.canvas.height) || 600;
  ctx.save();
  try { ctx.setTransform(1, 0, 0, 1, 0, 0); } catch (e) { /* 忽略 */ }
  if (g.phase === "transform26" && g.l26transform) {
    l26DrawTransformRoom(ctx, cw, ch, g);
  } else {
    ctx.fillStyle = "rgba(255,226,120,.045)";
    ctx.fillRect(0, 0, cw, ch);
  }
  ctx.restore();
};

// 转化房间：一间平时根本进不去的屋子，几个派对客围着你
function l26DrawTransformRoom(ctx, cw, ch, g) {
  const t = (performance.now() - (g.l26transform.at || 0)) / 1000;
  const k = Math.max(0, Math.min(1, t / 5));
  ctx.fillStyle = "#d9bb3c";
  ctx.fillRect(0, 0, cw, ch);
  // 四壁与地板
  ctx.fillStyle = "#b8922e";
  ctx.fillRect(0, 0, cw, ch * 0.16);
  ctx.fillRect(0, ch * 0.84, cw, ch * 0.16);
  ctx.fillRect(0, 0, cw * 0.10, ch);
  ctx.fillRect(cw * 0.90, 0, cw * 0.10, ch);
  // 顶灯
  const gr = ctx.createRadialGradient(cw / 2, ch / 2, 10, cw / 2, ch / 2, Math.max(cw, ch) * 0.62);
  gr.addColorStop(0, "rgba(255,250,210,.55)");
  gr.addColorStop(1, "rgba(120,80,10,.35)");
  ctx.fillStyle = gr;
  ctx.fillRect(0, 0, cw, ch);

  // 四个派对客：黄皮肤、僵硬的 =) 笑脸、大字形
  const R = Math.min(cw, ch) * 0.22;
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    const x = cw / 2 + Math.cos(a) * R * 1.75;
    const y = ch / 2 + Math.sin(a) * R * 1.18;
    ctx.save();
    ctx.translate(x, y);
    const s = Math.min(cw, ch) / 520;
    ctx.scale(s, s);
    ctx.fillStyle = "#e8c53a";
    // 大字形躯干
    ctx.fillRect(-9, -14, 18, 30);
    ctx.fillRect(-26, -10, 54, 8);
    ctx.fillRect(-15, 14, 9, 20);
    ctx.fillRect(6, 14, 9, 20);
    // 头 + 笑脸
    ctx.beginPath(); ctx.arc(0, -24, 13, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#8c1d1d";
    ctx.fillRect(-7, -28, 3, 4);
    ctx.fillRect(4, -28, 3, 4);
    ctx.strokeStyle = "#8c1d1d"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, -22, 7, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    ctx.restore();
  }

  // 中间的玩家：皮肤一点点变成派对客的黄
  ctx.save();
  ctx.translate(cw / 2, ch / 2);
  const s = Math.min(cw, ch) / 420;
  ctx.scale(s, s);
  // 从正常肤色渐变到派对客的黄（k=0 必须是人，不能是绿的）
  const cr = Math.round(222 + 10 * k), cg = Math.round(184 + 13 * k), cb = Math.round(150 - 92 * k);
  const bodyCol = "rgb(" + cr + "," + cg + "," + cb + ")";
  ctx.fillStyle = bodyCol;
  ctx.beginPath(); ctx.ellipse(0, 6, 11, 15, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = bodyCol;
  ctx.beginPath(); ctx.arc(0, -12, 9, 0, Math.PI * 2); ctx.fill();
  // 脸上慢慢浮出 =)
  if (k > 0.45) {
    ctx.fillStyle = "rgba(140,29,29," + Math.min(1, (k - 0.45) * 3).toFixed(2) + ")";
    ctx.fillRect(-5, -15, 2.5, 3.5);
    ctx.fillRect(3, -15, 2.5, 3.5);
    ctx.strokeStyle = "rgba(140,29,29," + Math.min(1, (k - 0.45) * 3).toFixed(2) + ")";
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(0, -11, 5, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  }
  ctx.restore();

  // 底部进度条
  ctx.fillStyle = "rgba(60,40,0,.45)";
  ctx.fillRect(cw * 0.28, ch * 0.72, cw * 0.44, 10);
  ctx.fillStyle = "#fff0a8";
  ctx.fillRect(cw * 0.28, ch * 0.72, cw * 0.44 * k, 10);
  ctx.fillStyle = "#5a3d08";
  ctx.font = "bold " + Math.max(13, Math.floor(ch * 0.028)) + "px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("转化中 …… " + Math.max(0, Math.ceil(5 - t)) + " 秒", cw / 2, ch * 0.69);
  ctx.textAlign = "left";
}

// 1.3.0：被派对客抓住一定会转化成派对客（不再是 1/3 概率）。
// 从 601 那封邀请函「确定」过来的人尤其如此 —— 那是它们挑中的人。
window.l26ShouldTransform = function (g, e) {
  if (!g || String(g.level) !== "26") return false;
  if (!e || e.kind !== "partypooper") return false;
  return true;
};

// ===========================================================
// 扫兴客面具（彩蛋）：存档里记着，主菜单能摘下
// ===========================================================
const L26_MASK_KEY = "br_mask26";
window.l26MaskOn = function () {
  try { return localStorage.getItem(L26_MASK_KEY) === "1"; } catch (e) { return false; }
};
window.l26SetMask = function (on) {
  try { if (on) localStorage.setItem(L26_MASK_KEY, "1"); else localStorage.removeItem(L26_MASK_KEY); } catch (e) { /* 忽略 */ }
  if (typeof window.l26SyncMenu === "function") window.l26SyncMenu();
};
// 画在玩家脸上的 =( 面具（由 main.js 的 drawPlayer 调用）
window.l26DrawPlayerMask = function (ctx, x, y) {
  ctx.save();
  ctx.fillStyle = "#e9e5d8";
  ctx.beginPath(); ctx.arc(x, y - 10, 7.4, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#8a8474"; ctx.lineWidth = 1; ctx.stroke();
  // 两个眼窝
  ctx.fillStyle = "#2b2b2b";
  ctx.beginPath(); ctx.ellipse(x - 2.7, y - 12, 1.5, 1.9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x + 2.7, y - 12, 1.5, 1.9, 0, 0, Math.PI * 2); ctx.fill();
  // =( 皱着的嘴
  ctx.strokeStyle = "#3a3428"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(x, y - 3.5, 3.6, 1.15 * Math.PI, 1.85 * Math.PI); ctx.stroke();
  ctx.restore();
};

// 给 Level 11 / Level 13 加一只红色气球（入口）
window.l26AddEntrance = function (map) {
  if (!map || !map.props || !map.floors) return;
  const fl = map.floors[0] || [];
  if (!fl.length) return;
  const s = map.start || { x: 0, y: 0 };
  let at = null;
  for (let i = 0; i < 500; i++) {
    const t = fl[Math.floor(Math.random() * fl.length)];
    if (!t) break;
    const d = Math.hypot(t.x - s.x, t.y - s.y);
    if (d > 8 && d < 26) { at = t; break; }
  }
  if (!at) at = fl[Math.floor(Math.random() * fl.length)];
  map.props.push({ x: at.x, y: at.y, floor: 0, type: "p26balloonRed", toLevel: 26 });
};

// ===========================================================
// 物件模型 —— 坐标是相对物件中心的（画布已平移到物件中心）
// ===========================================================
window.PROP_DRAW = window.PROP_DRAW || {};
const P26 = window.PROP_DRAW;

P26["p26table"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;
  ctx.fillStyle = "#8b5a2b";
  ctx.fillRect(x + T * 0.06, y + T * 0.30, T * 0.88, T * 0.42);
  ctx.fillStyle = "#f4eee0";
  ctx.fillRect(x + T * 0.04, y + T * 0.24, T * 0.92, T * 0.16);
  ctx.fillStyle = "#d24747";
  ctx.fillRect(x + T * 0.04, y + T * 0.40, T * 0.92, T * 0.05);
  ctx.fillStyle = "#6b4420";
  ctx.fillRect(x + T * 0.12, y + T * 0.72, T * 0.08, T * 0.22);
  ctx.fillRect(x + T * 0.80, y + T * 0.72, T * 0.08, T * 0.22);
};

P26["p26chair"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;
  ctx.fillStyle = p.color || "#d94f4f";
  ctx.fillRect(x + T * 0.28, y + T * 0.30, T * 0.44, T * 0.34);
  ctx.fillRect(x + T * 0.28, y + T * 0.14, T * 0.44, T * 0.14);
  ctx.fillStyle = "rgba(0,0,0,.25)";
  ctx.fillRect(x + T * 0.32, y + T * 0.66, T * 0.07, T * 0.22);
  ctx.fillRect(x + T * 0.61, y + T * 0.66, T * 0.07, T * 0.22);
};

P26["p26cake"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;
  ctx.fillStyle = "#f7e2c0";
  ctx.beginPath(); ctx.ellipse(x + T / 2, y + T * 0.62, T * 0.29, T * 0.11, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fff6e6";
  ctx.fillRect(x + T * 0.22, y + T * 0.42, T * 0.56, T * 0.22);
  ctx.fillStyle = "#e05a6a";
  ctx.fillRect(x + T * 0.22, y + T * 0.40, T * 0.56, T * 0.07);
  // 蜡烛
  ctx.fillStyle = "#5ac6e0";
  ctx.fillRect(x + T * 0.48, y + T * 0.27, T * 0.05, T * 0.15);
  ctx.fillStyle = "#ffd35a";
  ctx.beginPath(); ctx.arc(x + T * 0.505, y + T * 0.24, T * 0.05, 0, Math.PI * 2); ctx.fill();
};

P26["p26fruit"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;
  const cols = ["#e05a4a", "#e0a63c", "#7ac05a", "#a95fd9"];
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = cols[(i + (p.x | 0)) % cols.length];
    ctx.beginPath();
    ctx.arc(x + T * (0.32 + i * 0.18), y + T * (0.56 + (i % 2) * 0.08), T * 0.10, 0, Math.PI * 2);
    ctx.fill();
  }
};

P26["p26balloons"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;
  const t = performance.now() / 1000;
  const cols = ["#e05a6a", "#5ac6e0", "#e0d15a", "#7ae07a", "#a95fd9"];
  for (let i = 0; i < 4; i++) {
    const bx = x + T * (0.22 + i * 0.19);
    const by = y + T * (0.26 + Math.sin(t * 1.4 + i) * 0.04);
    ctx.strokeStyle = "rgba(255,255,255,.55)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(bx, by + T * 0.16); ctx.lineTo(bx, y + T * 0.86); ctx.stroke();
    ctx.fillStyle = cols[i];
    ctx.beginPath(); ctx.ellipse(bx, by, T * 0.10, T * 0.14, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.35)";
    ctx.beginPath(); ctx.ellipse(bx - T * 0.03, by - T * 0.04, T * 0.025, T * 0.05, 0, 0, Math.PI * 2); ctx.fill();
  }
};

P26["p26banner"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;
  ctx.strokeStyle = "#8a6a2a"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(x + T * 0.05, y + T * 0.12); ctx.lineTo(x + T * 0.95, y + T * 0.12); ctx.stroke();
  const cols = ["#e05a6a", "#5ac6e0", "#e0d15a", "#7ae07a", "#a95fd9", "#e05a6a"];
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = cols[i];
    ctx.beginPath();
    ctx.moveTo(x + T * (0.08 + i * 0.145), y + T * 0.12);
    ctx.lineTo(x + T * (0.20 + i * 0.145), y + T * 0.12);
    ctx.lineTo(x + T * (0.14 + i * 0.145), y + T * 0.40);
    ctx.closePath(); ctx.fill();
  }
  // 横幅上的笑脸 =)
  ctx.fillStyle = "#5a3d08";
  ctx.beginPath(); ctx.arc(x + T * 0.44, y + T * 0.22, T * 0.018, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + T * 0.56, y + T * 0.22, T * 0.018, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#5a3d08"; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.arc(x + T * 0.50, y + T * 0.20, T * 0.08, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
};

// 反转的海报：整张倒挂 —— 边框、图案、字全是倒的
P26["p26poster"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;
  ctx.save();
  ctx.translate(x + T / 2, y + T / 2);
  ctx.rotate(Math.PI);                    // 反转
  ctx.translate(-T / 2, -T / 2);
  ctx.fillStyle = "#f6efd8";
  ctx.fillRect(T * 0.10, T * 0.08, T * 0.80, T * 0.84);
  ctx.strokeStyle = "#7a5b34"; ctx.lineWidth = 2;
  ctx.strokeRect(T * 0.10, T * 0.08, T * 0.80, T * 0.84);
  // 倒挂的大笑脸
  ctx.fillStyle = "#e8c53a";
  ctx.beginPath(); ctx.arc(T * 0.50, T * 0.44, T * 0.22, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#8c1d1d";
  ctx.fillRect(T * 0.41, T * 0.38, T * 0.045, T * 0.06);
  ctx.fillRect(T * 0.55, T * 0.38, T * 0.045, T * 0.06);
  ctx.strokeStyle = "#8c1d1d"; ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.arc(T * 0.50, T * 0.42, T * 0.13, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  ctx.fillStyle = "#5a3d08";
  ctx.fillRect(T * 0.20, T * 0.72, T * 0.60, T * 0.035);
  ctx.fillRect(T * 0.28, T * 0.80, T * 0.44, T * 0.025);
  // 两颗图钉（在下面，因为海报倒过来了）
  ctx.fillStyle = "#d24747";
  ctx.beginPath(); ctx.arc(T * 0.20, T * 0.12, T * 0.035, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(T * 0.80, T * 0.12, T * 0.035, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // 微光：这是唯一能出去的地方
  const gl = 0.28 + 0.16 * Math.sin(performance.now() / 420);
  ctx.fillStyle = "rgba(255,246,190," + gl.toFixed(2) + ")";
  ctx.fillRect(x + T * 0.06, y + T * 0.04, T * 0.88, T * 0.92);
};

// 椅子 + 椅子上那张 =( 面具
P26["p26maskchair"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;
  ctx.fillStyle = "#6f5a44";
  ctx.fillRect(x + T * 0.24, y + T * 0.34, T * 0.52, T * 0.34);
  ctx.fillRect(x + T * 0.24, y + T * 0.16, T * 0.52, T * 0.16);
  ctx.fillStyle = "rgba(0,0,0,.3)";
  ctx.fillRect(x + T * 0.28, y + T * 0.68, T * 0.08, T * 0.22);
  ctx.fillRect(x + T * 0.64, y + T * 0.68, T * 0.08, T * 0.22);
};

P26["p26mask"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;
  const cx = x + T * 0.50, cy = y + T * 0.30;
  ctx.save();
  ctx.fillStyle = "#efeadd";
  ctx.beginPath(); ctx.arc(cx, cy, T * 0.17, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#9a9382"; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.fillStyle = "#2b2b2b";
  ctx.beginPath(); ctx.ellipse(cx - T * 0.06, cy - T * 0.04, T * 0.026, T * 0.034, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + T * 0.06, cy - T * 0.04, T * 0.026, T * 0.034, 0, 0, Math.PI * 2); ctx.fill();
  // =( 皱眉
  ctx.strokeStyle = "#3a3428"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy + T * 0.14, T * 0.075, 1.15 * Math.PI, 1.85 * Math.PI); ctx.stroke();
  // 一点点冷光，让玩家在黄澄澄的一层里能认出它
  ctx.fillStyle = "rgba(190,215,255,.18)";
  ctx.beginPath(); ctx.arc(cx, cy, T * 0.24, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
};

// 红色气球：Level 11 / 13 / 枢纽里通往 26 的入口
P26["p26balloonRed"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;
  const t = performance.now() / 1000;
  const by = y + T * (0.30 + Math.sin(t * 1.5) * 0.045);
  ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(x + T / 2, by + T * 0.20); ctx.lineTo(x + T / 2, y + T * 0.92); ctx.stroke();
  const gr = ctx.createRadialGradient(x + T * 0.43, by - T * 0.06, T * 0.02, x + T / 2, by, T * 0.24);
  gr.addColorStop(0, "#ff9a8a");
  gr.addColorStop(1, "#c62f3a");
  ctx.fillStyle = gr;
  ctx.beginPath(); ctx.ellipse(x + T / 2, by, T * 0.20, T * 0.25, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.4)";
  ctx.beginPath(); ctx.ellipse(x + T * 0.43, by - T * 0.08, T * 0.045, T * 0.08, -0.4, 0, Math.PI * 2); ctx.fill();
};
