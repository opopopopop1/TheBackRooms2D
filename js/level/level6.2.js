// ===========================================================
// Level 6.2 —— 霓虹迷宫
//
// 和它的父层级一样，由完全被黑暗笼罩的房间和走廊构成。唯一的区别是：
// 天花板、墙壁和地面上随机散布着昏暗的霓虹灯，照亮了一部分路。
// 这些灯的存在似乎消除、或至少减轻了 Level 6 的所有负面影响。
//
// 沿着被照亮的路走，会听到一个女性的声音鼓励你继续前行。
// 起初还有大量走廊可以回到 Level 6，越往深处越少。
//
// 进入一定深度后，灯会变亮，偶尔闪出明亮的红光 ——
// 这意味着你离"她"已经很近了，但现在还来得及回头。
//
// 出口：远处出现一座夜间的城市 —— 那是 Level 11.3。
// ===========================================================
"use strict";

if (typeof regTile === "function") regTile("neon62", ["#161a20", "#0a0c10"]);
else { (window.__NEWTILE_EXTRA = window.__NEWTILE_EXTRA || {})["neon62"] = ["#161a20", "#0a0c10"]; }

function generateNeonMazeMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const props = [];
  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return;
    props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  };

  // ---- 真·迷宫 ----
  // 以前是"5×5 大房间排成格栅"，房间之间几乎全通，走起来像一片空地。
  // 现在改成标准的一格宽迷宫：递归回溯挖出主干，再 braid 掉一部分死胡同
  // 形成环路，最后零星挖几间小房间 —— 保留 Level 6「房间 + 走廊」的样子。
  const CW = 2;                                    // 一个迷宫单元占 2 格（中间隔 1 格墙）
  const nc = Math.floor((size - 4) / CW);          // 单元数
  const tx = (cx) => 2 + cx * CW;                  // 单元 → 格子坐标
  const inb = (x, y) => x > 0 && y > 0 && x < size - 1 && y < size - 1;
  const open = (x, y) => { if (inb(x, y)) grid[y][x] = 0; };
  const ckey = (cx, cy) => cx + "," + cy;

  // 1) 递归回溯 —— 生成树
  const seen = new Set();
  const cstack = [];
  const c0 = { cx: nc >> 1, cy: nc >> 1 };
  seen.add(ckey(c0.cx, c0.cy)); cstack.push(c0);
  open(tx(c0.cx), tx(c0.cy));
  const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  while (cstack.length) {
    const cur = cstack[cstack.length - 1];
    const cand = [];
    for (const [dx, dy] of DIRS) {
      const nx = cur.cx + dx, ny = cur.cy + dy;
      if (nx < 0 || ny < 0 || nx >= nc || ny >= nc) continue;
      if (seen.has(ckey(nx, ny))) continue;
      cand.push({ cx: nx, cy: ny, dx, dy });
    }
    if (!cand.length) { cstack.pop(); continue; }
    const nxt = cand[randInt(0, cand.length - 1)];
    seen.add(ckey(nxt.cx, nxt.cy));
    // 挖通中间那格墙
    open(tx(cur.cx) + nxt.dx, tx(cur.cy) + nxt.dy);
    open(tx(nxt.cx), tx(nxt.cy));
    cstack.push(nxt);
  }

  // 2) braid：把一部分死胡同打通成环，免得全是断头路
  for (let cy = 0; cy < nc; cy++) {
    for (let cx = 0; cx < nc; cx++) {
      if (randInt(0, 99) >= 22) continue;                 // 22% 概率
      const dirs = [[1, 0], [0, 1]].filter(([dx, dy]) => {
        const nx = cx + dx, ny = cy + dy;
        return nx < nc && ny < nc && grid[tx(cy) + dy * CW] && inb(tx(cx) + dx, tx(cy) + dy);
      });
      if (!dirs.length) continue;
      const [dx, dy] = dirs[randInt(0, dirs.length - 1)];
      open(tx(cx) + dx, tx(cy) + dy);
    }
  }

  // 3) 零星几间小房间 —— Level 6 是"房间和走廊"，不能只有走廊
  const rooms = [];
  const roomN = Math.max(4, Math.round(nc * 0.7));
  for (let i = 0; i < roomN; i++) {
    const rw = randInt(3, 5), rh = randInt(3, 5);
    const x0 = randInt(3, Math.max(3, size - rw - 4));
    const y0 = randInt(3, Math.max(3, size - rh - 4));
    for (let y = y0; y < y0 + rh; y++)
      for (let x = x0; x < x0 + rw; x++) open(x, y);
    rooms.push({ x0, y0, rw, rh, cx: x0 + (rw >> 1), cy: y0 + (rh >> 1) });
  }

  // ---- 出生点：离中心最近的地板 ----
  let start = null, bd = 1e9;
  const mid = size >> 1;
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      if (grid[y][x] !== 0) continue;
      const d = Math.abs(x - mid) + Math.abs(y - mid);
      if (d < bd) { bd = d; start = { x, y, floor: 0 }; }
    }
  }
  if (!start) start = { x: 4, y: 4, floor: 0 };
  grid[start.y][start.x] = 0;

  const reach = reachableFromRaw(grid, size, start);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++)
      if (grid[y][x] === 0 && !reach.has(x + "," + y)) grid[y][x] = 1;
  const floors = collectFloors(grid, size);

  // ---- 霓虹灯：随机散布在天花板上、墙壁上、地面上 ----
  const NEON_COLORS = ["#3ad6ff", "#ff4fd8", "#7bff9a", "#ffd24f", "#9a6bff"];
  for (let i = 0; i < 46; i++) {
    const t = floors[randInt(0, floors.length - 1)];
    if (!t) continue;
    if (Math.hypot(t.x - start.x, t.y - start.y) < 2.5) continue;
    put(t.x, t.y, "neon62", {
      color: NEON_COLORS[i % NEON_COLORS.length],
      phase: (i * 0.7) % 6.2832,
    });
  }

  // ---- 出口：远处那座夜间的城市 ----
  // 摆在离出生点最远的地板上 —— 得一直往深处走才看得见。
  let far = null, fd = -1;
  for (const t of floors) {
    const d = Math.hypot(t.x - start.x, t.y - start.y);
    if (d > fd) { fd = d; far = t; }
  }
  const city = { type: "city62", x: far ? far.x : start.x + 2, y: far ? far.y : start.y, floor: 0,
    toLevel: "11.3", tip: "远处浮着一座夜里的城市，楼里的灯亮着 —— 那不是 Level 6 该有的东西" };
  props.push(city);

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [],
    city62: city,
    neon62t: 0, neon62msg: 0,
  };
  map.spawnPts = [start];
  return map;
}
window.generateNeonMazeMap = generateNeonMazeMap;

// ---------- 地面 / 墙体 ----------
// 整层是黑的 —— 亮起来的那部分靠霓虹灯自己画光晕。
window.drawNeonFloor = function (ctx, px, py, h, tx, ty) {
  const S = h;
  ctx.fillStyle = "#161a20";
  ctx.fillRect(px, py, S, S);
  ctx.strokeStyle = "rgba(255,255,255,.035)"; ctx.lineWidth = 1;
  ctx.strokeRect(px + 0.5, py + 0.5, S - 1, S - 1);
  if (((tx * 5 + ty * 3) % 6) === 0) {
    ctx.fillStyle = "rgba(255,255,255,.022)";
    ctx.fillRect(px + 3, py + 3, S - 6, S - 6);
  }
  return true;
};

window.drawNeonWall = function (ctx, px, py, h, tx, ty) {
  const S = h;
  ctx.fillStyle = "#0a0c10";
  ctx.fillRect(px, py, S, S);
  ctx.fillStyle = "rgba(255,255,255,.05)";
  ctx.fillRect(px, py, S, Math.max(2, S * 0.10));
  ctx.strokeStyle = "rgba(0,0,0,.6)"; ctx.lineWidth = 1;
  ctx.strokeRect(px + 0.5, py + 0.5, S - 1, S - 1);
  return true;
};

// ---------- 物件 ----------
window.PROP_DRAW = window.PROP_DRAW || {};

// 霓虹灯：一根会呼吸的灯管 + 一圈光晕。越往深处越亮，偶尔闪红。
window.PROP_DRAW["neon62"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : 0) / 1000;
  const deep = (p._deep != null) ? p._deep : 0;            // 0~1，由每帧写入
  const flick = 0.72 + 0.28 * Math.sin(t * 2.2 + (p.phase || 0));
  // 深入之后偶尔闪一下明亮的红光
  const redFlash = deep > 0.45 && Math.sin(t * 3.1 + (p.phase || 0) * 2) > 0.93;
  const col = redFlash ? "#ff2b3c" : (p.color || "#3ad6ff");
  const glow = (0.30 + 0.45 * deep) * flick;

  // 光晕：照亮周围那一小片
  const r = T * (1.5 + 1.5 * deep);
  const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
  gr.addColorStop(0, col);
  gr.addColorStop(0.22, hexA(col, (0.34 * glow).toFixed(3)));
  gr.addColorStop(1, hexA(col, "0"));
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = gr;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.2832); ctx.fill();
  ctx.globalAlpha = 1;

  // 灯管本体
  ctx.fillStyle = col;
  ctx.fillRect(-T * 0.30, -T * 0.06, T * 0.60, Math.max(2, T * 0.12));
  ctx.fillStyle = "rgba(255,255,255,.85)";
  ctx.fillRect(-T * 0.28, -T * 0.04, T * 0.56, Math.max(1, T * 0.05));
};

// Level 6 里那一处霓虹灯光 —— 通往 6.2 的入口。
// 它只照亮自己脚下那一小圈（不会照亮其它区域），在彻底的黑里是个异数。
window.PROP_DRAW["neonentry62"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : 0) / 1000;
  const flick = 0.75 + 0.25 * Math.sin(t * 3.4);
  const col = "#43e0ff";
  // 光晕：刻意收得很小 —— 只够看清灯自己
  const r = T * 1.05;
  const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
  gr.addColorStop(0, hexA(col, (0.55 * flick).toFixed(3)));
  gr.addColorStop(0.5, hexA(col, (0.20 * flick).toFixed(3)));
  gr.addColorStop(1, hexA(col, "0"));
  ctx.fillStyle = gr;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.2832); ctx.fill();
  // 灯管
  ctx.fillStyle = col;
  ctx.fillRect(-T * 0.26, -T * 0.05, T * 0.52, Math.max(2, T * 0.10));
  ctx.fillStyle = "rgba(255,255,255,.9)";
  ctx.fillRect(-T * 0.24, -T * 0.035, T * 0.48, Math.max(1, T * 0.04));
  // 底下一小圈被照亮的地
  ctx.fillStyle = hexA(col, (0.10 * flick).toFixed(3));
  ctx.beginPath(); ctx.ellipse(0, T * 0.16, T * 0.44, T * 0.17, 0, 0, 6.2832); ctx.fill();
};

// 远处那座夜间的城市 —— 出口
window.PROP_DRAW["city62"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : 0) / 1000;
  // 地平线上的一片楼影，窗口透着暖黄的灯
  const w = T * 2.2, h = T * 1.5;
  ctx.fillStyle = "rgba(8,10,14,.85)";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  const seedBase = 7;
  for (let i = 0; i < 14; i++) {
    const sd = (i * 37 + seedBase) % 100;
    const bw = T * (0.16 + (sd % 7) * 0.03);
    const bh = T * (0.35 + (sd % 11) * 0.06);
    const bx = -w / 2 + 3 + i * (w / 14);
    const by = h / 2 - bh;
    ctx.fillStyle = "#11151c";
    ctx.fillRect(bx, by, bw, bh);
    // 窗户：一格一格亮着
    for (let wy = by + 4; wy < h / 2 - 3; wy += 5) {
      for (let wx = bx + 2; wx < bx + bw - 2; wx += 4) {
        const on = ((wx * 13 + wy * 7 + i * 3) % 5) < 2;
        if (!on) continue;
        const tw = 0.6 + 0.4 * Math.sin(t * 1.4 + wx + wy);   // 有些窗在慢慢闪
        ctx.fillStyle = "rgba(255,206,120," + (0.35 + 0.45 * tw).toFixed(3) + ")";
        ctx.fillRect(wx, wy, 2, 2);
      }
    }
  }
  // 城市上方那片被灯光映红的夜空
  const gr = ctx.createRadialGradient(0, -h * 0.1, 0, 0, -h * 0.1, w * 0.7);
  gr.addColorStop(0, "rgba(255,170,80,.20)");
  gr.addColorStop(1, "rgba(255,170,80,0)");
  ctx.fillStyle = gr;
  ctx.beginPath(); ctx.arc(0, -h * 0.1, w * 0.7, 0, 6.2832); ctx.fill();
  // 一圈冷白的光，把"这里能过去"说清楚
  ctx.strokeStyle = "rgba(180,220,255,.30)"; ctx.lineWidth = Math.max(1, T * 0.04);
  ctx.strokeRect(-w / 2, -h / 2, w, h);
};

// 把 #rrggbb 加上 alpha —— 霓虹灯的光晕要用
function hexA(hex, a) {
  const h = String(hex).replace("#", "");
  const r = parseInt(h.substring(0, 2), 16) || 0;
  const g = parseInt(h.substring(2, 4), 16) || 0;
  const b = parseInt(h.substring(4, 6), 16) || 0;
  return "rgba(" + r + "," + g + "," + b + "," + a + ")";
}

// ---------- 每帧：深度、女性的声音、灯的变化 ----------
const NEON62_NEAR = [
  "霓虹爱你",
  "霓虹会保护你",
  "追随霓虹",
];
const NEON62_DEEP = [
  "就快了，还差几步就到家了",
  "追随我，追随我，我会指引你",
  "只要走进那扇门",
  "我知道她在骗我 —— 可是灯太亮了",
];
window.__LEVEL_TICK = window.__LEVEL_TICK || {};
window.__LEVEL_TICK["6.2"] = function (g, dt) {
  const map = g.map;
  map.neon62t = (map.neon62t || 0) + dt;
  const px = g.player.x / TILE, py = g.player.y / TILE;
  const maxD = Math.hypot(map.size, map.size) * 0.5;
  const deep = Math.min(1, Math.hypot(px - map.start.x, py - map.start.y) / maxD);

  // 每一盏灯按玩家的深度改写亮度
  for (const p of (map.props || [])) {
    if (p.type !== "neon62") continue;
    const d = Math.hypot(p.x - map.start.x, p.y - map.start.y) / maxD;
    p._deep = Math.min(1, Math.max(deep, d * 0.9));
  }

  // 灯的存在减轻了 Level 6 的那些负面影响 —— 站在灯附近，理智不往下掉
  let nearLight = false;
  for (const p of (map.props || [])) {
    if (p.type !== "neon62") continue;
    if (Math.hypot(p.x - px, p.y - py) < 3.2) { nearLight = true; break; }
  }
  if (nearLight) {
    g.sanity = Math.min(100, g.sanity + 1.6 * dt);
  } else {
    // 走进两盏灯之间的黑里：理智开始往下走，越深走得越快
    g.sanity = Math.max(0, g.sanity - (0.5 + 1.5 * deep) * dt);
  }

  // 那个女性的声音：沿着灯走就一直能听见，越深越不对劲
  if (map.neon62t - (map.neon62msg || 0) > (deep > 0.45 ? 11 : 17)) {
    map.neon62msg = map.neon62t;
    if (typeof window.__toast === "function") {
      const pool = deep > 0.45 ? NEON62_DEEP : NEON62_NEAR;
      window.__toast(pool[Math.floor(map.neon62t / 11) % pool.length]);
    }
  }
};
