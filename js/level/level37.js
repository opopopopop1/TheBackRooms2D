// ===========================================================
// Level 37 —— 崇高（池房） / Level 37.1 —— 血红池房
// 像游泳馆：进门先踩到干的白瓷砖走道，池子挖在区域中间，四周留一圈干地。
// 37.1 是 37 的暗红镜像 —— 水是蓝绿色的，红光是墙上红灯"照"上去的。
// ===========================================================
"use strict";

function poolRoomOpenings(grid, size, rooms) {
  for (let i = 0; i < rooms.length; i++) {
    const r = rooms[i];
    const countOpen = () => {
      let n = 0;
      const hit = (x, y) => {
        if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return;
        if (grid[y][x] === 0) n++;
      };
      for (let x = r.x; x < r.x + r.w; x++) { hit(x, r.y - 1); hit(x, r.y + r.h); }
      for (let y = r.y; y < r.y + r.h; y++) { hit(r.x - 1, y); hit(r.x + r.w, y); }
      return n;
    };
    const dig = () => {
      let best = -1, bd = Infinity;
      const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
      for (let j = 0; j < rooms.length; j++) {
        if (j === i) continue;
        const dx = rooms[j].x + rooms[j].w / 2 - cx, dy = rooms[j].y + rooms[j].h / 2 - cy;
        const d = dx * dx + dy * dy;
        if (d < bd) { bd = d; best = j; }
      }
      if (best < 0) return false;
      carveCorridorW(grid, size, cx, cy,
        rooms[best].x + rooms[best].w / 2, rooms[best].y + rooms[best].h / 2, 1);
      return true;
    };
    // 一直挖到至少两个出入口；加计数上限，免得某些种子下 dig() 不推进而卡死
    let guard = 0;
    while (countOpen() < 2 && guard++ < 12 && dig()) { /* noop */ }
    if (Math.random() < 0.35) dig();        // 有些区域再多一个口
  }
}


function generatePoolMap(level) {
  const red = String(level) === "37.1";
  const size = mapSizeFor(level);
  // 房间放大 —— 37 在档案里"非常大"，而且池边要留得下一圈走道 + 一圈栏杆
  const built = buildRoomLayer(size, { roomW: [10, 18], roomH: [9, 15], density: 1.05, startRoom: 0 });
  const grid = built.grid, rooms = built.rooms;
  poolRoomOpenings(grid, size, rooms);

  const pools = new Set();
  const poolRects = [];
  const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  for (const r of rooms) {
    const maxIn = Math.floor(Math.min(r.w, r.h) / 2) - 1;
    if (maxIn < 2) continue;                 // 区域太小就不挖池
    // 内缩 2~3 格：外圈是干的瓷砖走道，栏杆占掉最里面那一圈
    const ri = () => randInt(2, Math.min(3, maxIn));
    const px0 = r.x + ri(), px1 = r.x + r.w - 1 - ri();
    const py0 = r.y + ri(), py1 = r.y + r.h - 1 - ri();
    if (px1 - px0 < 2 || py1 - py0 < 2) continue;
    const corners = [
      { sx: -1, sy: -1 }, { sx: 1, sy: -1 }, { sx: -1, sy: 1 }, { sx: 1, sy: 1 },
    ].filter(() => Math.random() < 0.40)
      .map((c) => ({ sx: c.sx, sy: c.sy, n: randInt(1, 2) }));
    const cut = (x, y) => {
      for (const c of corners) {
        const dx = c.sx < 0 ? (x - px0) : (px1 - x);
        const dy = c.sy < 0 ? (y - py0) : (py1 - y);
        if (dx + dy < c.n) return true;
      }
      return false;
    };
    for (let y = py0; y <= py1; y++) {
      for (let x = px0; x <= px1; x++) {
        if (!grid[y] || grid[y][x] !== 0) continue;
        if (cut(x, y)) continue;
        pools.add(x + "," + y);
      }
    }
    poolRects.push({ x0: px0, y0: py0, x1: px1, y1: py1 });
  }

  const isDeck = (x, y) => grid[y] && grid[y][x] === 0 && !pools.has(x + "," + y);

  // ---- 泳池四周的栏杆：除爬梯和破坏处之外，整圈封死（砌成墙 = 空气墙）----
  const poolFence = new Set();
  const fenceBroken = new Set();
  const poolBreaks = [];
  const ladderDecks = [];
  {
    const peris = [];                       // 每个池子岸边的干地砖
    for (const rect of poolRects) {
      const arr = [];
      for (let y = rect.y0 - 2; y <= rect.y1 + 2; y++) {
        for (let x = rect.x0 - 2; x <= rect.x1 + 2; x++) {
          if (!isDeck(x, y)) continue;
          let touch = false;
          for (const d of DIRS) if (pools.has((x + d[0]) + "," + (y + d[1]))) { touch = true; break; }
          if (touch) arr.push({ x, y });
        }
      }
      if (arr.length) peris.push(arr);
    }
    // 爬梯搭岸的位置：每个池子至少 1 处（少了一处，整个池子就被栏杆封死、成了死水）
    for (const arr of peris) {
      const want = Math.min(arr.length, randInt(1, 2));
      for (let i = 0; i < want; i++) {
        let t = null;
        for (let tries = 0; tries < 14 && !t; tries++) {
          const c = arr[randInt(0, arr.length - 1)];
          if (ladderDecks.some((l) => Math.abs(l.x - c.x) < 4 && Math.abs(l.y - c.y) < 4)) continue;
          t = c;
        }
        // 实在挑不到隔得开的，就硬给一个 —— 有梯子的死水也比没梯子强
        if (!t) t = arr[randInt(0, arr.length - 1)];
        ladderDecks.push({ x: t.x, y: t.y });
      }
    }
    // 两个池子的栏杆被撞坏了 —— 那一处能上下水
    const brokenRects = [];
    for (let i = 0; i < 2 && peris.length; i++) {
      let bi = randInt(0, peris.length - 1);
      let guard = 0;
      while (brokenRects.indexOf(bi) >= 0 && guard++ < 10) bi = randInt(0, peris.length - 1);
      brokenRects.push(bi);
      const arr = peris[bi];
      let best = null, bd = -1;
      for (const t of arr) {                 // 选离爬梯最远的那一段
        let dmin = 999;
        for (const l of ladderDecks) dmin = Math.min(dmin, Math.abs(l.x - t.x) + Math.abs(l.y - t.y));
        if (dmin > bd) { bd = dmin; best = t; }
      }
      if (best) poolBreaks.push({ x: best.x, y: best.y });
    }
    const keep = new Set();
    for (const l of ladderDecks) keep.add(l.x + "," + l.y);
    for (const b of poolBreaks) keep.add(b.x + "," + b.y);
    for (const arr of peris) {
      for (const t of arr) {
        const k = t.x + "," + t.y;
        if (keep.has(k)) continue;
        grid[t.y][t.x] = 1;
        poolFence.add(k);
      }
    }
    // 破坏处两边的两根栏杆只剩半截
    for (const b of poolBreaks) {
      let n = 0;
      for (const arr of peris) {
        for (const t of arr) {
          if (n >= 2) break;
          const k = t.x + "," + t.y;
          if (!poolFence.has(k) || fenceBroken.has(k)) continue;
          if (Math.abs(t.x - b.x) + Math.abs(t.y - b.y) <= 2) { fenceBroken.add(k); n++; }
        }
      }
    }
  }

  // ---- 水下爬梯：立在水里、扶手搭在岸上 ----
  const ladders = [];
  for (const dk of ladderDecks) {
    let wat = null, fx = 0, fy = 0;
    for (const d of DIRS) {
      const nx = dk.x + d[0], ny = dk.y + d[1];
      if (pools.has(nx + "," + ny)) { wat = { x: nx, y: ny }; fx = -d[0]; fy = -d[1]; break; }
    }
    if (!wat) continue;
    ladders.push({ x: wat.x, y: wat.y, fx, fy, floor: 0, type: "poolladder37",
                   deckX: dk.x, deckY: dk.y });
  }

  const floors = collectFloors(grid, size);
  // 出生点：干地面上（进门先踩到瓷砖，不是一脚踩进水里）
  let start = null;
  {
    const r = rooms.find((x) => x.start) || rooms[0];
    const cands = [];
    for (let y = r.y; y < r.y + r.h; y++)
      for (let x = r.x; x < r.x + r.w; x++) if (isDeck(x, y)) cands.push({ x, y });
    if (!cands.length) for (let y = r.y; y < r.y + r.h; y++)
      for (let x = r.x; x < r.x + r.w; x++) if (grid[y][x] === 0) cands.push({ x, y });
    const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
    cands.sort((a, b) => Math.hypot(a.x - cx, a.y - cy) - Math.hypot(b.x - cx, b.y - cy));
    start = { x: (cands[0] || { x: r.x, y: r.y }).x, y: (cands[0] || { x: r.x, y: r.y }).y, floor: 0 };
  }

  const dry = floors.filter((t) => !pools.has(t.x + "," + t.y));

  // ---- 非线性空间：一个量决定另一个量，另一个量决定那一个量 ----
  // 成对出现的"折叠点" —— 踩上这一处，人就出现在与之绑定的另一处
  const fold37 = [];
  const foldMap = new Map();
  {
    const cand = dry.filter((t) => Math.hypot(t.x - start.x, t.y - start.y) > 12);
    const picked = [];
    while (picked.length < 8 && cand.length) {
      const t = cand.splice(randInt(0, cand.length - 1), 1)[0];
      if (picked.some((q) => Math.hypot(q.x - t.x, q.y - t.y) < 18)) continue;
      picked.push(t);
    }
    for (let i = 0; i + 1 < picked.length; i += 2) {
      const a = picked[i], b = picked[i + 1];
      fold37.push({ a: { x: a.x, y: a.y }, b: { x: b.x, y: b.y } });
      foldMap.set(a.x + "," + a.y, b);
      foldMap.set(b.x + "," + b.y, a);
    }
  }

  // ---- 联机：各人的落点彼此拉开（37 是非线性空间，谁也别一进来就撞上谁）----
  const poolSpawns = [];
  {
    const cand = dry.filter((t) => !foldMap.has(t.x + "," + t.y));
    while (poolSpawns.length < 8 && cand.length) {
      const t = cand.splice(randInt(0, cand.length - 1), 1)[0];
      if (poolSpawns.some((q) => Math.hypot(q.x - t.x, q.y - t.y) < 20)) continue;
      poolSpawns.push({ x: t.x, y: t.y });
    }
    if (!poolSpawns.length) poolSpawns.push({ x: start.x, y: start.y });
  }

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [rooms],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props: [], crates: [], ground: [],
    pools,
    poolRects,
    poolFence,                      // 画成栏杆的那一圈（已经是墙 = 空气墙）
    fenceBroken,                    // 被撞歪、只剩半截的栏杆
    poolBreaks,                     // 整段被破坏的地方 —— 能从这里上下水
    ladders37: ladders,
    fold37, foldMap,                // 非线性空间：踩上去就被折到另一处
    poolSpawns,                     // 联机时各人的落点
    redpool: !!red,
    pillars: [],
    stairs37: null,
    redtunnel: null,
    whitelight: null,
    lamps: [],
  };
  makeDoorsMap(map);
  // 栏杆画成物件（它们本身就是墙，墙照常画，栏杆叠在上面）
  for (const k of poolFence) {
    const q = k.split(",");
    map.props.push({ x: +q[0], y: +q[1], floor: 0, type: "poolfence37",
                     broken: fenceBroken.has(k) });
  }
  for (const l of ladders) map.props.push(l);

  const dist0 = (x, y) => Math.hypot(x - start.x, y - start.y);
  if (red) {
    const cand = [];
    for (let y = 1; y < size - 1; y++) for (let x = 1; x < size - 1; x++) {
      if (grid[y][x] !== 1 || poolFence.has(x + "," + y)) continue;
      if (dist0(x, y) < 4) continue;
      for (const d of DIRS) if (grid[y + d[1]][x + d[0]] === 0) { cand.push({ x, y, fx: d[0], fy: d[1] }); break; }
    }
    for (let i = 0; i < 10 && cand.length; i++) {
      const t = cand.splice(randInt(0, cand.length - 1), 1)[0];
      map.lamps.push({ x: t.x + t.fx, y: t.y + t.fy, wx: t.x, wy: t.y,
                       floor: 0, r: 3.6, color: "#ff3b30" });
    }
  }

  // 水下柱子
  {
    // 爬梯脚下、破坏处旁边的那格水不能变成柱子 —— 不然整个池子就进不去了
    const keepWet = new Set();
    for (const l of ladders) keepWet.add(l.x + "," + l.y);
    for (const b of poolBreaks) {
      for (const d of DIRS) if (pools.has((b.x + d[0]) + "," + (b.y + d[1]))) keepWet.add((b.x + d[0]) + "," + (b.y + d[1]));
    }
    const wet = [...pools].map((k) => k.split(",").map(Number));
    for (const t of wet) {
      if (Math.random() > 0.05) continue;
      if (dist0(t[0], t[1]) < 3) continue;
      if (keepWet.has(t[0] + "," + t[1])) continue;
      grid[t[1]][t[0]] = 1;
      pools.delete(t[0] + "," + t[1]);
      map.pillars.push({ x: t[0], y: t[1] });
    }
    // 柱子可能把一池水切成两半 —— 把断开的那半凿一条水道接回来
    for (const rect of poolRects) {
      const own = [];
      for (let y = rect.y0; y <= rect.y1; y++)
        for (let x = rect.x0; x <= rect.x1; x++) if (pools.has(x + "," + y)) own.push(x + "," + y);
      if (own.length < 2) continue;
      const seen = new Set(), comps = [];
      for (const k of own) {
        if (seen.has(k)) continue;
        const comp = [], q = [k];
        seen.add(k);
        while (q.length) {
          const cur = q.pop(); comp.push(cur);
          const [x, y] = cur.split(",").map(Number);
          for (const d of DIRS) {
            const nk = (x + d[0]) + "," + (y + d[1]);
            if (pools.has(nk) && !seen.has(nk)) { seen.add(nk); q.push(nk); }
          }
        }
        comps.push(comp);
      }
      if (comps.length < 2) continue;
      comps.sort((a, b) => b.length - a.length);
      const main = comps[0];
      for (let i = 1; i < comps.length; i++) {
        const comp = comps[i];
        let ba = null, bb = null, bd = Infinity;
        for (const a of comp) {
          const [ax, ay] = a.split(",").map(Number);
          for (const b of main) {
            const [bx, by] = b.split(",").map(Number);
            const d = Math.abs(ax - bx) + Math.abs(ay - by);
            if (d < bd) { bd = d; ba = [ax, ay]; bb = [bx, by]; }
          }
        }
        if (!ba) continue;
        // 先横后竖，凿一条水道把两片水连起来
        let cx = ba[0], cy = ba[1];
        while (cx !== bb[0]) {
          cx += (bb[0] > cx ? 1 : -1);
          if (grid[cy][cx] === 1) { grid[cy][cx] = 0; pools.add(cx + "," + cy); }
        }
        while (cy !== bb[1]) {
          cy += (bb[1] > cy ? 1 : -1);
          if (grid[cy][cx] === 1) { grid[cy][cx] = 0; pools.add(cx + "," + cy); }
        }
        for (const k of comp) main.push(k);
      }
    }
  }

  // 出口一律放在干地面上
  const far = dry.filter((t) => dist0(t.x, t.y) > 18 && !foldMap.has(t.x + "," + t.y));
  const pick = () => (far.length ? far.splice(randInt(0, far.length - 1), 1)[0] : null);
  if (red) {
    const a = pick();
    if (a) { map.whitelight = { x: a.x, y: a.y, floor: 0 }; map.props.push(map.whitelight); }
  } else {
    const a = pick();
    if (a) { map.stairs37 = { x: a.x, y: a.y, floor: 0 }; map.props.push(map.stairs37); }
    const b = pick();
    if (b) { map.redtunnel = { x: b.x, y: b.y, floor: 0 }; map.props.push(map.redtunnel); }
    const c = pick();
    if (c) map.props.push({ type: "pool4", x: c.x, y: c.y, floor: 0 });
  }
  return map;
}

// ---------- Level 994：存在于此（海滩） ----------
// 东面向海，其余三面环山。潮水无规则上涨 —— 碰到就完了。

// ---------- 水下爬梯 ----------
// 立在水里、扶手搭在岸上：沉到水下爬不上来的时候，靠近按 E 就能上到岸上。
// 人在水下会先往下沉（见 updateWaterSink），走到池边是爬不出去的 —— 这架梯子就是出路。
window.PROP_DRAW = window.PROP_DRAW || {};
window.PROP_DRAW["poolladder37"] = function (ctx, p, T) {
  const fx = p.fx || 0, fy = p.fy || 0;
  // 两根不锈钢立柱（顺着扶手朝向摆）
  const ax = fx, ay = fy;
  const bx = -fy, by = fx;                     // 垂直于扶手的方向 = 两根柱子分开的方向
  const S = T * 0.34;
  // 水下的部分：压暗一点，看着是浸在水里的
  ctx.fillStyle = "rgba(150,175,186,0.55)";
  ctx.fillRect(bx * S - 2.5, ay * S - T * 0.34, 5, T * 0.68);
  ctx.fillRect(-bx * S - 2.5, -ay * S - T * 0.34, 5, T * 0.68);
  // 横档
  ctx.fillStyle = "rgba(200,225,235,0.75)";
  for (let i = -2; i <= 2; i++) {
    const yy = i * T * 0.13;
    ctx.fillRect(-S - 1, yy - 1.2, S * 2 + 2, 2.4);
  }
  // 露出水面的扶手：弯向岸边那一格
  ctx.strokeStyle = "#cfe0e6";
  ctx.lineWidth = 3.4;
  ctx.beginPath();
  ctx.moveTo(bx * S, ay * S - T * 0.30);
  ctx.quadraticCurveTo(bx * S + ax * T * 0.30, ay * S + ay * T * 0.30 - T * 0.46,
                       bx * S + ax * T * 0.44, ay * S + ay * T * 0.44 - T * 0.30);
  ctx.moveTo(-bx * S, -ay * S - T * 0.30);
  ctx.quadraticCurveTo(-bx * S + ax * T * 0.30, -ay * S + ay * T * 0.30 - T * 0.46,
                       -bx * S + ax * T * 0.44, -ay * S + ay * T * 0.44 - T * 0.30);
  ctx.stroke();
  // 台阶上的一点高光 + 一圈提示，让人知道这里能爬
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fillRect(-S - 1, -T * 0.34, S * 2 + 2, 2);
  const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
  const pulse = 0.35 + 0.35 * Math.sin(t * 2.2);
  ctx.strokeStyle = "rgba(255,240,160," + pulse.toFixed(3) + ")";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(0, 0, T * 0.44, 0, Math.PI * 2);
  ctx.stroke();
};

// ---------- 泳池四周的栏杆 ----------
// 它本身是一格墙（走不过去 = 空气墙），画的时候在上面叠一排不锈钢栏杆。
// broken = 被撞歪、只剩半截（破坏处两边那两根）。
window.PROP_DRAW["poolfence37"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
  const half = T * 0.5;
  // 底座：一小段被踩脏的瓷砖踢脚
  ctx.fillStyle = "rgba(20,30,36,0.30)";
  ctx.fillRect(-half, half - T * 0.16, T, T * 0.16);
  // 两根立柱
  const postX = [-T * 0.30, T * 0.30];
  for (const px of postX) {
    if (p.broken && px > 0) continue;                 // 坏的那根只剩一半高，还歪着
    ctx.fillStyle = "#c6d2d6";
    ctx.fillRect(px - T * 0.035, -T * 0.34, T * 0.07, T * 0.70);
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.fillRect(px - T * 0.035, -T * 0.34, T * 0.022, T * 0.70);
    ctx.fillStyle = "#8b979c";
    ctx.beginPath(); ctx.arc(px, -T * 0.35, T * 0.045, 0, Math.PI * 2); ctx.fill();
  }
  if (p.broken) {                                    // 断掉的那半截，歪向一边
    ctx.save();
    ctx.translate(T * 0.30, T * 0.06); ctx.rotate(0.55);
    ctx.fillStyle = "#aab4b8";
    ctx.fillRect(-T * 0.030, -T * 0.16, T * 0.06, T * 0.34);
    ctx.restore();
  }
  // 上下两道横杆
  ctx.fillStyle = "#d3dce0";
  ctx.fillRect(-T * 0.34, -T * 0.30, T * (p.broken ? 0.36 : 0.68), T * 0.055);
  ctx.fillRect(-T * 0.34, -T * 0.04, T * (p.broken ? 0.30 : 0.68), T * 0.055);
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.fillRect(-T * 0.34, -T * 0.30, T * (p.broken ? 0.36 : 0.68), T * 0.018);
  // 水面反光打在金属上，一晃一晃
  ctx.fillStyle = "rgba(180,230,250," + (0.14 + 0.10 * Math.sin(t * 1.7 + p.x * 0.6 + p.y)).toFixed(3) + ")";
  ctx.fillRect(-T * 0.34, -T * 0.04, T * 0.68, T * 0.055);
};

// ---------- 水面波纹 + 泡在水里的画面变化 ----------
// 波纹：一格一格向外扩的亮环，整片水面都在动。
// 画面：一进水慢慢变蓝；泡够 30 秒开始窒息，蓝色转红。
window.drawPool37Fx = function (ctx, g, cam) {
  const m = g.map;
  if (!m || !m.pools) return;
  const T = (typeof TILE === "number" ? TILE : 40);
  const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
  const W = (ctx.canvas && ctx.canvas.width) || 0, H = (ctx.canvas && ctx.canvas.height) || 0;
  const red = !!m.redpool;

  // ---- 水面波纹（世界坐标；此刻 ctx 已经带着相机变换）----
  const vl = cam.x - (W ? W / 2 : 0) - T * 2, vr = cam.x + (W ? W / 2 : 0) + T * 2;
  const vt = cam.y - (H ? H / 2 : 0) - T * 2, vb = cam.y + (H ? H / 2 : 0) + T * 2;
  ctx.save();
  for (const k of m.pools) {
    const q = k.split(",");
    const x = +q[0], y = +q[1];
    const wx = (x + 0.5) * T, wy = (y + 0.5) * T;
    if (wx < vl || wx > vr || wy < vt || wy > vb) continue;
    const ph = (t * 0.9 + (x * 0.37 + y * 0.61)) % 1;
    // 底下一层缓慢起伏的水色
    ctx.fillStyle = red
      ? "rgba(150,40,45," + (0.10 + 0.06 * Math.sin(t * 1.3 + x * 0.5 + y * 0.4)).toFixed(3) + ")"
      : "rgba(120,200,225," + (0.10 + 0.07 * Math.sin(t * 1.3 + x * 0.5 + y * 0.4)).toFixed(3) + ")";
    ctx.fillRect(x * T, y * T, T, T);
    // 向外扩的亮环
    ctx.strokeStyle = red
      ? "rgba(255,150,150," + (0.30 * (1 - ph)).toFixed(3) + ")"
      : "rgba(225,250,255," + (0.34 * (1 - ph)).toFixed(3) + ")";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(wx, wy, T * (0.10 + ph * 0.42), T * (0.06 + ph * 0.26), 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  // ---- 泡在水里的画面：慢慢变蓝，30 秒后转红 ----
  const inWater = !!(g.inPool37 || (g.sink || 0) > 0.02);
  const tint = Math.max(0, Math.min(1, (g.poolTint || 0)));
  const drown = (g.poolT || 0) > 30;
  if (inWater || tint > 0.01) {
    ctx.save();
    try { ctx.setTransform(1, 0, 0, 1, 0, 0); } catch (e) { /* 忽略 */ }
    const cw = (ctx.canvas && ctx.canvas.width) || 800, ch = (ctx.canvas && ctx.canvas.height) || 600;
    if (drown) {
      // 窒息：红色随着一下一下的心跳收紧
      const pulse = 0.26 + 0.24 * Math.abs(Math.sin(t * 2.4));
      ctx.fillStyle = "rgba(150,20,25," + (0.20 + 0.16 * tint).toFixed(3) + ")";
      ctx.fillRect(0, 0, cw, ch);
      const grd = ctx.createRadialGradient(cw / 2, ch / 2, Math.min(cw, ch) * 0.16,
        cw / 2, ch / 2, Math.max(cw, ch) * 0.70);
      grd.addColorStop(0, "rgba(0,0,0,0)");
      grd.addColorStop(1, "rgba(120,10,15," + pulse.toFixed(3) + ")");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, cw, ch);
    } else {
      ctx.fillStyle = "rgba(40,120,170," + (0.10 + 0.30 * tint).toFixed(3) + ")";
      ctx.fillRect(0, 0, cw, ch);
    }
    ctx.restore();
  }
};
