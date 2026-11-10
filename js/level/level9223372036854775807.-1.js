// ===========================================================
// Level 9223372036854775807.-1 —— 过去
// 所有去过层级的粗糙缝合体：按"地图面积 / 来过的层级数"从每个层级各切一块拼进来。
// 没有未来，只有过去。
// ===========================================================
"use strict";

function visitedLevelsFor(level) {
  let vs = [];
  try { vs = JSON.parse(localStorage.getItem("br_visited") || "[]") || []; } catch (e) { vs = []; }
  try {
    const g = window.__game;
    if (g && Array.isArray(g.visited)) vs = vs.concat(g.visited);
  } catch (e) { /* 忽略 */ }
  const seen = new Set(), out = [];
  for (const v of vs) {
    const k = String(v);
    if (k === "" || k === "null" || k === "undefined") continue;
    if (k === String(level) || k === "hub") continue;      // 不拼自己、不拼枢纽
    if (seen.has(k)) continue;
    seen.add(k); out.push(k);
  }
  return out;
}

// 从某个层级的地图里随机切一块 cell×cell 的地砖出来
// 同时把这块里原本摆着的物件一起带走 —— 不然"过去"就是一片空地，
// 缝进来的每一块都该带着它原来那一层的东西。

// 这些是出口 / 门 / 传送点，拼进"过去"会变成一堆来路不明的传送门，一律不带。
// 后面那一串是会自己闪的东西（霓虹灯、屏幕、信号器之类）——
// "过去"应当是停在原处的，把这些带进来就会整层忽明忽暗，看着像坏了。
const JUNCTION_SKIP = /door|exit|stair|gate|fog|hole|window|arcade|counter|ladder|hatch|portal|vent|elevator|rope|sub|neon|flick|glow|screen|monitor|tv|lamp|flare|beacon|signal|spark|flash|pulse/i;

function sliceFromLevel(lv, cell) {
  const m = generateMapInner(lv);
  const sz = m.size;
  const c = Math.min(cell, sz);
  const f = m.layers[0];
  // 随机试几个位置，挑能走的地方最多的那块 —— 整块切进墙里就成了死区
  let best = null, bestScore = -1, bOx = 0, bOy = 0;
  const tries = Math.min(6, Math.max(1, (sz - c) * (sz - c)));
  for (let t = 0; t < tries; t++) {
    const ox = Math.floor(Math.random() * Math.max(1, sz - c));
    const oy = Math.floor(Math.random() * Math.max(1, sz - c));
    let free = 0;
    const out = [];
    for (let y = 0; y < c; y++) {
      const row = [];
      for (let x = 0; x < c; x++) {
        const v = f[oy + y][ox + x];
        if (v === 0) free++;
        row.push(v);
      }
      out.push(row);
    }
    if (free > bestScore) { bestScore = free; best = out; bOx = ox; bOy = oy; }
  }
  // 这块里原本摆着的物件（坐标换算成相对这块左上角）
  const props = [];
  for (const p of (m.props || [])) {
    if ((p.floor | 0) !== 0) continue;
    if (p.x < bOx || p.y < bOy || p.x >= bOx + c || p.y >= bOy + c) continue;
    if (JUNCTION_SKIP.test(String(p.type || ""))) continue;
    if (typeof (window.PROP_DRAW || {})[p.type] !== "function") continue;   // 画不出来的不要
    props.push({ x: p.x - bOx, y: p.y - bOy, floor: 0, type: p.type });
    if (props.length >= 14) break;
  }
  return { grid: best, props: props };
}


// 旧层级（不在 BATCHTILE / NEWTILE 里的）的 [地面色, 墙色]。
// 拼接时按来源层级取色 —— 这样"过去"里每一块都带着它原来那一层的样子，
// 而不是像以前那样整层刷成同一种白。
const LEGACY_TILE = {
  wallpaper: ["#b8a888", "#8a7a5e"], collapsing: ["#8a7a60", "#5a4a38"],
  iceroom:   ["#c8dce8", "#8aa8bc"], concrete:   ["#6a6a68", "#4a4a48"],
  pipe:      ["#5a5a5e", "#3a3a3e"], power:      ["#5a5a58", "#3a3a38"],
  office:    ["#7a7a72", "#5a5a54"], hotel:      ["#6a4a30", "#4a3020"],
  dark:      ["#141416", "#0a0a0c"], cave:       ["#4a4238", "#2e2822"],
  field:     ["#7a9a4a", "#5a7a30"], city:       ["#4a4a50", "#33333a"],
  suburb:    ["#5a5a55", "#3a3a38"], apartment:  ["#8a7a60", "#5a4a38"],
  paradise:  ["#3a6a3a", "#2a4a2a"], future:     ["#e2e2e0", "#c0c0be"],
  frost:     ["#dfe8ee", "#9aa8b4"], numbered:   ["#f0f0ee", "#d0d0cc"],
  party:     ["#d8c060", "#a88a40"], attic:      ["#8a6a44", "#5a4028"],
  daycare:   ["#c8a8d8", "#8a6aa0"], hub:        ["#4a4a4e", "#33333a"],
  ocean:     ["#3a6a8a", "#22445a"], beverly:    ["#6a4a30", "#4a3028"],
  boiler:    ["#5a5a5a", "#3a3a3a"],
};
// 把颜色提亮到看得见的程度 ——
// 有些来源层级本身就是黑的（Level 6 熄灯、37.1 血红池房那类），
// 整块照搬过来就是一大片黑，看着像没画出来。这里给个亮度下限。
function liftColor(hex, minLum) {
  const h = String(hex || "").replace("#", "");
  if (h.length !== 6) return hex;
  let r = parseInt(h.substring(0, 2), 16);
  let g = parseInt(h.substring(2, 4), 16);
  let b = parseInt(h.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return hex;
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  if (lum >= minLum) return hex;
  // 按比例抬到下限，但保留原本的色相（别把红的抬成灰的）
  const k = lum > 4 ? (minLum / lum) : 0;
  if (k > 0) {
    r = Math.min(255, Math.round(r * k));
    g = Math.min(255, Math.round(g * k));
    b = Math.min(255, Math.round(b * k));
  } else {
    r = g = b = Math.round(minLum);
  }
  const hx = (v) => ("0" + Math.max(0, Math.min(255, v)).toString(16)).slice(-2);
  return "#" + hx(r) + hx(g) + hx(b);
}

// 取某个层级的 [地面色, 墙色]
function tileColorsForLevel(lv) {
  const st = (levelDef(lv) || {}).style;
  let c = null;
  if (typeof BATCHTILE !== "undefined" && BATCHTILE[st]) c = [BATCHTILE[st][0], BATCHTILE[st][2]];
  else if (typeof NEWTILE !== "undefined" && NEWTILE[st]) c = [NEWTILE[st][0], NEWTILE[st][1]];
  else c = LEGACY_TILE[st] || ["#8a8a84", "#5a5a56"];
  // 地面至少 92、墙至少 62 —— 再暗就看不出这是"另一个层级的一块地"了
  return [liftColor(c[0], 92), liftColor(c[1], 62)];
}

function generateJunctionMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const props = [];
  for (let y = 4; y < size - 4; y++) for (let x = 4; x < size - 4; x++) grid[y][x] = 0;

  // 把到过的层级各切一块，缝进这一层。
  // 每块的面积 = 地图面积 / 来过的层级数 —— 所以块边长 = size / sqrt(层数)。
  const vis = visitedLevelsFor(level);
  const n = Math.min(vis.length, 16);
  const patches = [];
  if (n > 0) {
    // 每块的面积 = 地图面积 / 来过的层级数 —— 所以理想边长 = sqrt(size² / n)
    // 但地图四周留了 4 格边框，可用区只有 size-8，块太大就放不下，要收一收。
    const usable = size - 8;
    let cols = Math.max(1, Math.ceil(Math.sqrt(n)));
    let cell = Math.max(3, Math.floor(Math.sqrt((size * size) / n)));
    if (cols * cell > usable) cell = Math.max(3, Math.floor(usable / cols));
    let rows = Math.ceil(n / cols);
    if (rows * cell > usable) {
      cell = Math.max(3, Math.floor(usable / rows));
      cols = Math.max(1, Math.floor(usable / cell));
      rows = Math.ceil(n / cols);
    }
    const perCol = Math.max(1, Math.floor(usable / cell));
    const use = Math.min(n, cols * perCol);
    // 打乱后取前 use 个 —— "随机抽取"这些层级
    const pick = vis.slice();
    for (let i = pick.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = pick[i]; pick[i] = pick[j]; pick[j] = t;
    }
    for (let i = 0; i < use; i++) {
      const gx = 4 + (i % cols) * cell, gy = 4 + Math.floor(i / cols) * cell;
      let blk = null, blkProps = [];
      try { const s = sliceFromLevel(pick[i], cell); blk = s.grid; blkProps = s.props || []; } catch (e) { blk = null; }
      for (let y = 0; y < cell; y++)
        for (let x = 0; x < cell; x++)
          if (blk && blk[y] && blk[y][x] != null) grid[gy + y][gx + x] = blk[y][x];
      // 把这块带来的物件摆进去 —— 落在墙里的挪到附近能站的地方
      for (const bp of blkProps) {
        let px = gx + bp.x, py = gy + bp.y;
        if (!(grid[py] && grid[py][px] === 0)) {
          let found = null;
          for (let r = 1; r <= 3 && !found; r++)
            for (let dy = -r; dy <= r && !found; dy++)
              for (let dx = -r; dx <= r && !found; dx++) {
                const nx = px + dx, ny = py + dy;
                if (grid[ny] && grid[ny][nx] === 0) found = { x: nx, y: ny };
              }
          if (!found) continue;
          px = found.x; py = found.y;
        }
        props.push({ x: px, y: py, floor: 0, type: bp.type });
      }
      let cols2 = null;
      try { cols2 = tileColorsForLevel(pick[i]); } catch (e) { cols2 = null; }
      patches.push({ level: pick[i], x: gx, y: gy, cell, col: cols2 });
    }
    // 块与块的接缝上开一个口子 —— 不然每块都自成孤岛，玩家走不出去
    const mid = Math.floor(cell / 2);
    for (let i = 0; i < use; i++) {
      const gx = 4 + (i % cols) * cell, gy = 4 + Math.floor(i / cols) * cell;
      const hasRight = (i % cols) + 1 < cols && i + 1 < use;
      const hasDown = Math.floor(i / cols) + 1 < rows && i + cols < use;
      if (hasRight) { grid[gy + mid][gx + cell - 1] = 0; grid[gy + mid][gx + cell] = 0; }
      if (hasDown) { grid[gy + cell - 1][gx + mid] = 0; grid[gy + cell][gx + mid] = 0; }
    }
  }
  let start = { x: Math.floor(size / 2), y: size - 8, floor: 0 };
  // 出生点可能刚好落在拼接进来的墙里 —— 在附近找一个站得住的格子
  {
    const okAt = (x, y) => x >= 1 && y >= 1 && x < size - 1 && y < size - 1 && grid[y][x] === 0;
    if (!okAt(start.x, start.y)) {
      let found = null;
      for (let r = 1; r <= 12 && !found; r++)
        for (let dy = -r; dy <= r && !found; dy++)
          for (let dx = -r; dx <= r && !found; dx++)
            if (okAt(start.x + dx, start.y + dy)) found = { x: start.x + dx, y: start.y + dy, floor: 0 };
      if (found) start = found;
      else { grid[start.y][start.x] = 0; }
    }
  }
  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [collectFloors(grid, size)], rooms: [[]],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props: props, crates: [], ground: [],
    junctionHole: { x: Math.floor(size / 2), y: Math.floor(size / 2), floor: 0 },
    patches,                      // 缝进来的那几块：来自哪些层级
    patchColor: new Map(),        // "x,y" -> { f: 地面色, w: 墙色 }：每块按来源层级上色
  };
  // 把每块的配色铺到它覆盖的每一格上 —— 地面和墙都按来源层级来
  for (const pt of patches) {
    if (!pt.col) continue;
    for (let y = 0; y < pt.cell; y++)
      for (let x = 0; x < pt.cell; x++)
        map.patchColor.set((pt.x + x) + "," + (pt.y + y), { f: pt.col[0], w: pt.col[1] });
  }
  makeDoorsMap(map);
  map.props.push(map.junctionHole);
  return map;
}

// ---------- Level 601 终末：无限大的图书馆 ----------
// 布局照示意图：中央是一个很大的黄色大厅（空旷，只有成排的空书架与几根
// 刻着 The End 的柱子），顶部伸出一个绿色的小房间 —— 那扇 EXIT 的门通向
// Level 0；左侧连着一个橙色的小房间，它左边那扇灰色的门通向
// Level 9223372036854775807。这里不黑，是亮的。
