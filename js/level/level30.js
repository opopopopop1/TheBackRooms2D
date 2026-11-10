// ===========================================================
// Level 30 —— 抽离现实
//   一个巨大的天空盒，里面飘着无数座岛屿，岛与岛隔着几十格。
//   岛与岛之间只有窄窄的木栈道 —— 走过去的时候，脚下就是天。
//   天上飞着"记忆潜伏者"：样子像鱿鱼，会抓住你的头，把你的记忆改掉。
//   被改过的人会说这里很安全 —— 那叫「腐化」。
//   走得足够远，天空盒会变成紫黑相间的错误背景 —— 那是你醒过来的时刻，
//   也是你死掉的时刻。
// ===========================================================
"use strict";

(function () {
  const v = ["#8fb46a", "#7ea35c", "#9dc7e0"];
  if (typeof regTile === "function") regTile("dereal30", v);
  else { (window.__NEWTILE_EXTRA = window.__NEWTILE_EXTRA || {})["dereal30"] = v; }
})();

// ---------- 天空盒（墙 = 虚空 / 空气）----------
// 与 Level 63 共用同一套悬空背景：整片天空和浮云由 drawSky63Sky 画在**所有瓦片之前**，
// 岛与栈道画在云之上。这里只留一层几乎透明的空气色，让底下的云透出来。
// 以前这里逐格画蓝渐变 + 椭圆云 + 紫黑方块，拼起来就是一片"铺在地上的海"，
// 而且一格一格边界分明 —— 云不该在地面上。
function d30Wall(ctx, px, py, h, map, tx, ty) {
  ctx.fillStyle = "rgba(228,240,250,0.09)";
  ctx.fillRect(px, py, TILE, TILE);
  return true;
}

// ---------- 岛面 / 栈道 ----------
function d30Floor(ctx, px, py, h, map, tx, ty) {
  const S = TILE;
  const t = performance.now() / 1000;
  const key = tx + "," + ty;
  // 脚下是虚空时，在云上留一道淡影 —— 岛和栈道才像"悬着"而不是"贴着"
  const layer = map && map.layers && map.layers[0];
  const belowVoid = layer && (!layer[ty + 1] || layer[ty + 1][tx] === 1);
  if (belowVoid) {
    ctx.fillStyle = "rgba(64,78,98,.13)";
    ctx.fillRect(px + S * 0.04, py + S * 0.84, S * 0.94, S * 0.42);
  }
  if (map.bridge30 && map.bridge30.has(key)) {
    // 木栈道：一块块横板钉在细绳上，板与板之间能看见脚下的天
    ctx.fillStyle = "#8a6741";
    ctx.fillRect(px, py + 6, S, S - 12);
    ctx.fillStyle = "#9c7850";
    ctx.fillRect(px, py + 8, S, 4);
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(px, py + S - 8, S, 3);
    ctx.strokeStyle = "#6d5236"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(px, py + 4); ctx.lineTo(px + S, py + S - 4); ctx.stroke();
    if (belowVoid) {
      ctx.fillStyle = "rgba(255,226,178,.26)";
      ctx.fillRect(px, py + S - 5, S, Math.max(1, S * 0.05));
      ctx.fillStyle = "rgba(48,32,18,.40)";
      ctx.fillRect(px, py + S - 1, S, Math.max(1, S * 0.05));
    }
    return true;
  }
  // 岛缘：上半仍是草坡，往下才露出岩石断面 —— 不是一整块灰墙浮在云上
  const edge = map.islandEdge && map.islandEdge.has(key);
  if (edge) {
    ctx.fillStyle = "#6f9448"; ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "#7d7268"; ctx.fillRect(px, py + S * 0.44, S, S * 0.56);
    ctx.fillStyle = "rgba(0,0,0,0.16)"; ctx.fillRect(px, py + S * 0.44, S, S * 0.56);
    ctx.fillStyle = "rgba(140,180,92,0.42)"; ctx.fillRect(px, py + S * 0.36, S, S * 0.10);
    ctx.fillStyle = "rgba(255,255,255,0.10)"; ctx.fillRect(px, py + S * 0.44, S, Math.max(1, S * 0.05));
    if (belowVoid) {
      // 岩壁朝外那道暗边：有厚度，才不是一张贴在云上的贴图
      ctx.fillStyle = "rgba(38,42,50,.42)";
      ctx.fillRect(px, py + S * 0.90, S, S * 0.10);
    }
    return true;
  }
  ctx.fillStyle = "#6f9448"; ctx.fillRect(px, py, S, S);
  ctx.fillStyle = "rgba(140,180,92,0.45)";
  ctx.fillRect(px, py, S, S * 0.5);
  ctx.strokeStyle = "rgba(96,132,62,0.7)"; ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const gx = px + ((h * (i + 3) * 97) % 1) * S;
    const gy = py + ((h * (i + 7) * 53) % 1) * S;
    ctx.beginPath(); ctx.moveTo(gx, gy + 6);
    ctx.lineTo(gx + 1.5, gy - 3 + Math.sin(t * 1.6 + i) * 1.2); ctx.stroke();
  }
  return true;
}

(function () {
  const bw = window.drawBatchWall, bf = window.drawBatchFloor;
  window.drawBatchWall = function (ctx, px, py, h, style, map, tx, ty) {
    if (style === "dereal30") return d30Wall(ctx, px, py, h, map, tx, ty);
    return bw ? bw.apply(null, arguments) : false;
  };
  window.drawBatchFloor = function (ctx, px, py, h, style, map, tx, ty) {
    if (style === "dereal30") return d30Floor(ctx, px, py, h, map, tx, ty);
    return bf ? bf.apply(null, arguments) : false;
  };
})();

// ---------- 物件 ----------
window.PROP_DRAW = window.PROP_DRAW || {};
// 悬在空中的碎岩 —— 天空盒里除了岛，就只剩这些
window.PROP_DRAW["d30rock"] = function (ctx, p, T) {
  const t = performance.now() / 1000;
  const bob = Math.sin(t * 0.9 + (p.seed || 0)) * 3;
  ctx.save(); ctx.translate(0, bob);
  ctx.fillStyle = "#8b8175";
  ctx.beginPath();
  ctx.moveTo(-T * 0.30, T * 0.06); ctx.lineTo(-T * 0.12, -T * 0.24);
  ctx.lineTo(T * 0.16, -T * 0.18); ctx.lineTo(T * 0.30, T * 0.08);
  ctx.lineTo(T * 0.04, T * 0.26); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.beginPath();
  ctx.moveTo(-T * 0.12, -T * 0.24); ctx.lineTo(T * 0.16, -T * 0.18); ctx.lineTo(T * 0.04, T * 0.26);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.34, T * 0.20, T * 0.05, 0, 0, 6.2832); ctx.fill();
  ctx.restore();
};
// 岛上残存的石拱 —— 有人在这里待过，但记不清是谁
window.PROP_DRAW["d30arch"] = function (ctx, p, T) {
  ctx.fillStyle = "#9a938a";
  ctx.fillRect(-T * 0.34, -T * 0.44, T * 0.14, T * 0.80);
  ctx.fillRect(T * 0.20, -T * 0.44, T * 0.14, T * 0.80);
  ctx.fillStyle = "#aaa39a";
  ctx.beginPath();
  ctx.moveTo(-T * 0.36, -T * 0.44); ctx.quadraticCurveTo(0, -T * 0.62, T * 0.36, -T * 0.44);
  ctx.lineTo(T * 0.36, -T * 0.34); ctx.quadraticCurveTo(0, -T * 0.52, -T * 0.36, -T * 0.34);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.fillRect(-T * 0.34, T * 0.30, T * 0.14, T * 0.06);
  ctx.fillRect(T * 0.20, T * 0.30, T * 0.14, T * 0.06);
};
// 岛上孤零零的一棵树 —— 和 -Z6 层那片灰林子不同，这里是活的
window.PROP_DRAW["d30tree"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(0,0,0,0.24)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.30, T * 0.22, T * 0.07, 0, 0, 6.2832); ctx.fill();
  ctx.fillStyle = "#5b432a"; ctx.fillRect(-T * 0.045, -T * 0.06, T * 0.09, T * 0.36);
  const t = performance.now() / 1000;
  const sw = Math.sin(t * 1.1 + (p.seed || 0)) * 2;
  ctx.fillStyle = "#42702f";
  ctx.beginPath(); ctx.arc(sw, -T * 0.22, T * 0.24, 0, 6.2832); ctx.fill();
  ctx.fillStyle = "#548a3c";
  ctx.beginPath(); ctx.arc(-T * 0.10 + sw, -T * 0.28, T * 0.15, 0, 6.2832); ctx.fill();
};

// ---------- 生成 ----------
function generateDerealMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);                 // 全是 1 = 天空（虚空）
  const props = [];
  const bridge30 = new Set();
  const islandEdge = new Set();

  // ---- 岛：4×4 = 16 座，彼此隔着十几二十格 ----
  const G = 4;
  const step = Math.floor((size - 16) / G);
  const islands = [];
  for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
    const cx = 10 + i * step + randInt(-3, 3);
    const cy = 10 + j * step + randInt(-3, 3);
    const r = randInt(5, 8);
    const px = Math.max(r + 3, Math.min(size - r - 4, cx));
    const py = Math.max(r + 3, Math.min(size - r - 4, cy));
    const tiles = [];
    for (let y = py - r - 1; y <= py + r + 1; y++) {
      for (let x = px - r - 1; x <= px + r + 1; x++) {
        if (x < 2 || y < 2 || x >= size - 2 || y >= size - 2) continue;
        const d = Math.hypot(x - px, y - py);
        const wob = 1.6 * Math.sin((x + y) * 0.7) + 1.2 * Math.cos((x - y) * 0.5);
        if (d > r + wob) continue;
        grid[y][x] = 0;
        tiles.push([x, y]);
        if (d > r + wob - 1.6) islandEdge.add(x + "," + y);   // 岛的边缘是岩石
      }
    }
    // 岛的边缘因为起伏可能只在对角线上挨着 —— 走不过去，就把这种碎块剔掉
    {
      const key = (x, y) => x + "," + y;
      const own = new Set(tiles.map((t) => key(t[0], t[1])));
      const seen = new Set([key(px, py)]);
      const st = [[px, py]];
      while (st.length) {
        const [x, y] = st.pop();
        for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nk = key(x + d[0], y + d[1]);
          if (own.has(nk) && !seen.has(nk)) { seen.add(nk); st.push([x + d[0], y + d[1]]); }
        }
      }
      for (const t of tiles) if (!seen.has(key(t[0], t[1]))) grid[t[1]][t[0]] = 1;
    }
    islands.push({ i, j, x: px, y: py, r, tiles });
  }

  // ---- 栈道：把岛连起来（生成树 + 几个环）----
  const idx = (i, j) => j * G + i;
  const carveBridge = (a, b) => {
    const A = islands[a], B = islands[b];
    let x = A.x, y = A.y;
    const stepTo = (tx, ty) => {
      while (x !== tx) { x += Math.sign(tx - x); grid[y][x] = 0; bridge30.add(x + "," + y); }
      while (y !== ty) { y += Math.sign(ty - y); grid[y][x] = 0; bridge30.add(x + "," + y); }
    };
    stepTo(B.x, A.y); stepTo(B.x, B.y);
  };
  const seen = new Set([0]);
  const order = [];
  const q = [0];
  while (q.length) {                            // 随机生成树，保证全部连通
    const cur = q.splice(randInt(0, q.length - 1), 1)[0];
    order.push(cur);
    const i = cur % G, j = (cur / G) | 0;
    const nb = [];
    if (i < G - 1) nb.push(idx(i + 1, j));
    if (j < G - 1) nb.push(idx(i, j + 1));
    if (i > 0) nb.push(idx(i - 1, j));
    if (j > 0) nb.push(idx(i, j - 1));
    for (const n of nb) if (!seen.has(n)) { seen.add(n); q.push(n); carveBridge(cur, n); }
  }
  for (let k = 0; k < 3; k++) {                 // 再随便加几条，走出环来
    const a = randInt(0, islands.length - 1);
    const i = a % G, j = (a / G) | 0;
    if (i < G - 1) carveBridge(a, idx(i + 1, j));
  }

  // ---- 岛上的东西 ----
  for (const isl of islands) {
    const inner = isl.tiles.filter((t) => !islandEdge.has(t[0] + "," + t[1]));
    if (!inner.length) continue;
    const pick = () => inner[randInt(0, inner.length - 1)];
    const n1 = randInt(1, 3);
    for (let i = 0; i < n1; i++) {
      const t = pick();
      props.push({ x: t[0], y: t[1], floor: 0, type: "d30tree", seed: randInt(0, 9) });
    }
    if (Math.random() < 0.45) {
      const t = pick();
      props.push({ x: t[0], y: t[1], floor: 0, type: "d30arch", seed: randInt(0, 9) });
    }
  }
  // ---- 天上飘着的碎岩 ----
  for (let i = 0; i < 26; i++) {
    const x = randInt(4, size - 5), y = randInt(4, size - 5);
    if (grid[y][x] === 0) continue;
    props.push({ x, y, floor: 0, type: "d30rock", seed: randInt(0, 9) });
  }

  const floors = collectFloors(grid, size);
  const s0 = islands[0];
  const start = { x: s0.x, y: s0.y, floor: 0 };

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [islands],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [],
    bridge30, islandEdge,
    glitchSky: false,          // 走得足够远之后，天空盒开始出错
    pools: new Set(),
  };
  makeDoorsMap(map);
  return map;
}
window.generateDerealMap = generateDerealMap;

// ---------- 屏幕上的整体效果 ----------
// 腐化：四周慢慢泛紫，越陷越深。
// 走得足够远：天空盒出错，紫黑相间的横条压满整屏 —— 那是你醒过来的时刻。
window.drawDereal = function (ctx, g) {
  const cw = (ctx.canvas && ctx.canvas.width) || 800;
  const ch = (ctx.canvas && ctx.canvas.height) || 600;
  const t = performance.now() / 1000;
  ctx.save();
  try { ctx.setTransform(1, 0, 0, 1, 0, 0); } catch (e) { /* 忽略 */ }
  const cor = Math.max(0, Math.min(1, (g.corrupt || 0) / 100));
  if (cor > 0.01) {
    const grd = ctx.createRadialGradient(cw / 2, ch / 2, Math.min(cw, ch) * 0.20,
      cw / 2, ch / 2, Math.max(cw, ch) * 0.72);
    grd.addColorStop(0, "rgba(0,0,0,0)");
    grd.addColorStop(1, "rgba(96,40,150," + (0.20 + 0.42 * cor).toFixed(3) + ")");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, cw, ch);
  }
  if (g.map && g.map.glitchSky) {
    const k = Math.min(1, (g.derealFar || 0) / 7);
    for (let i = 0; i < 14; i++) {
      const y = ((i * 83 + Math.floor(t * 260)) % (ch + 120)) - 60;
      ctx.fillStyle = i % 2 ? "rgba(26,6,40," + (0.35 + 0.4 * k).toFixed(3) + ")"
                            : "rgba(120,40,180," + (0.18 + 0.3 * k).toFixed(3) + ")";
      ctx.fillRect(0, y, cw, 5 + (i % 4) * 7);
    }
    ctx.fillStyle = "rgba(20,4,32," + (0.10 + 0.30 * k).toFixed(3) + ")";
    ctx.fillRect(0, 0, cw, ch);
  }
  ctx.restore();
};
