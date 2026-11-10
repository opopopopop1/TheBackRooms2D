"use strict";

// ======== AI 游玩：由算法接管角色 ========
// 这个 AI 并不知道通关点在哪 —— 它和人一样，靠探索一点点把地图摸出来。
// 它只会走向"已经探索过"的地点；没去过的地方，它走过去看。
//
// 权重（玩家可调，数值越高越优先）：
//   切出至更高层 > 收集装备（背包） > 获取物资（杏仁水 / 撬棍） > 收集层级钥匙
(function () {
  const WKEY = "backrooms.ai.weights.v1";

  // ======== AI 记忆 ========
  // 最开始是空的：一台没训练过的 AI 什么都不记得。
  // 记住的东西写在本机（localStorage），死亡重生不会清掉；也可以导出成加密 .json
  // 装到别的设备上。记的是三样：层级的出口、物资点、见过实体（怪）的地方。
  const MKEY = "backrooms.ai.memory.v1";
  const EMPTY_MEM = () => ({ exits: {}, supplies: {}, danger: {}, visited: {}, deaths: 0, born: Date.now() });
  let mem = EMPTY_MEM();
  let memSaveT = 0;
  function memLoad() {
    try {
      const o = JSON.parse(localStorage.getItem(MKEY) || "null");
      if (o && typeof o === "object") {
        mem = Object.assign(EMPTY_MEM(), o);
        mem.exits = mem.exits || {}; mem.supplies = mem.supplies || {};
        mem.danger = mem.danger || {}; mem.visited = mem.visited || {};
      }
    } catch (e) { mem = EMPTY_MEM(); }
  }
  function memSave() { try { localStorage.setItem(MKEY, JSON.stringify(mem)); } catch (e) { /* 忽略 */ } }
  const memKey = (g) => String(g.level) + "|" + (g.floor | 0);
  function memAdd(bucket, k, x, y, extra, cap) {
    const a = bucket[k] || (bucket[k] = []);
    for (const q of a) if (q.x === x && q.y === y) return;
    a.push(Object.assign({ x, y }, extra || {}));
    if (a.length > cap) a.shift();
  }
  function memNote(g, dt) {
    memSaveT -= dt;
    if (memSaveT > 0) return;
    memSaveT = 1.2;
    const k = memKey(g);
    mem.visited[k] = (mem.visited[k] || 0) + 1;
    const props = (g.map && g.map.props) ? g.map.props : [];
    for (const q of props) {
      if ((q.floor | 0) !== (g.floor | 0)) continue;
      const t = String(q.type || "");
      const isExit = q.toLevel != null || q.to != null || q.target != null ||
        /exit|door|stair|elevator|gate|portal|hatch|ladder|pod|ramp|window/i.test(t);
      if (isExit) memAdd(mem.exits, k, q.x | 0, q.y | 0, { type: t }, 36);
      if (/almond|supply|crate|medkit|water|food|bottle|vend|locker|chest|cache|coin|soda/i.test(t))
        memAdd(mem.supplies, k, q.x | 0, q.y | 0, { type: t }, 36);
    }
    for (const e of (g.entities || [])) {
      if ((e.floor | 0) !== (g.floor | 0)) continue;
      memAdd(mem.danger, k, Math.floor(e.x / TILE), Math.floor(e.y / TILE), { t: Date.now() }, 40);
    }
    memSave();
  }
  // 记忆 -> 加密 .json（简单异或流 + base64，跨设备可还原）
  const SEAL_KEY = "BR-AI-MODEL-v1";
  function seal(obj) {
    const raw = new TextEncoder().encode(JSON.stringify(obj));
    const key = new TextEncoder().encode(SEAL_KEY);
    const out = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) out[i] = raw[i] ^ key[i % key.length] ^ ((i * 37) & 255);
    let s = ""; for (const b of out) s += String.fromCharCode(b);
    return btoa(s);
  }
  function unseal(txt) {
    const s = atob(String(txt).trim());
    const bytes = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i);
    const key = new TextEncoder().encode(SEAL_KEY);
    const out = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) out[i] = bytes[i] ^ key[i % key.length] ^ ((i * 37) & 255);
    return JSON.parse(new TextDecoder().decode(out));
  }
  function exportModel() {
    const model = { weights: Object.assign({}, weights), memory: mem, trainedAt: Date.now() };
    const file = { magic: "BR-AI-MODEL", ver: 1, sealed: true, data: seal(model) };
    const blob = new Blob([JSON.stringify(file)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "backrooms-ai-model.json";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => { try { URL.revokeObjectURL(a.href); } catch (e) { /* 忽略 */ } }, 3000);
    return { levels: Object.keys(mem.visited).length, exits: Object.keys(mem.exits).length };
  }
  function importModel(text) {
    const o = JSON.parse(text);
    if (!o || o.magic !== "BR-AI-MODEL") throw new Error("这不是本游戏的 AI 模型文件");
    const m = o.sealed ? unseal(o.data) : o;
    if (!m || typeof m !== "object") throw new Error("模型内容已损坏");
    if (m.weights) for (const k of Object.keys(DEFAULTS)) {
      if (typeof m.weights[k] === "number") weights[k] = clampNum(m.weights[k], 0, 100);
    }
    if (m.memory) {
      mem = Object.assign(EMPTY_MEM(), m.memory);
      mem.exits = mem.exits || {}; mem.supplies = mem.supplies || {};
      mem.danger = mem.danger || {}; mem.visited = mem.visited || {};
      memSave();
    }
    save();
    return { levels: Object.keys(mem.visited).length, exits: Object.keys(mem.exits).length };
  }

  const DEFAULTS = {
    wExit: 100,     // 切出至更高层
    wGear: 78,      // 收集装备（背包）
    wSupply: 58,    // 获取物资（杏仁水 / 撬棍）
    wKey: 38,       // 收集层级钥匙
    cautious: 62,   // 谨慎度：越高越早开始躲怪物
    curiosity: 55,  // 探索欲：越高越愿意往没去过的地方钻
    sanityLine: 42, // 理智低于这个值就喝杏仁水
  };

  const weights = Object.assign({}, DEFAULTS);

  function clampNum(v, a, b) { return v < a ? a : (v > b ? b : v); }

  function load() {
    try {
      const raw = localStorage.getItem(WKEY);
      if (!raw) return;
      const o = JSON.parse(raw);
      for (const k of Object.keys(DEFAULTS)) {
        if (typeof o[k] === "number") weights[k] = clampNum(o[k], 0, 100);
      }
      if (typeof o.sanityLine === "number") weights.sanityLine = clampNum(o.sanityLine, 10, 90);
    } catch (e) { /* 存档坏了就用默认值 */ }
  }
  function save() {
    try { localStorage.setItem(WKEY, JSON.stringify(weights)); } catch (e) { /* 忽略 */ }
  }
  const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());

  const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const CORNERS = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
  const MAX_NODES = 3600;

  // ---------- 网格通行 ----------
  function walkable(g, x, y, allowClosedDoor) {
    const map = g.map;
    if (x < 1 || y < 1 || x >= map.size - 1 || y >= map.size - 1) return false;
    const layer = map.layers[(g.floor | 0)] || map.layers[0];
    if (!layer[y] || layer[y][x] !== 0) return false;
    const d = closedDoorAt(g, x, y);
    if (!d) return true;
    if (d.kind === "red") return false;      // 通往子层级的红门：当墙，别去招惹
    return !!allowClosedDoor;
  }

  function closedDoorAt(g, x, y) {
    const f = g.floor | 0;
    for (const d of (g.map.doors || [])) {
      if ((d.floor | 0) !== f) continue;
      if (d.open) continue;
      for (const t of d.tiles) if (t.x === x && t.y === y) return d;
      if (d.x === x && d.y === y) return d;
    }
    return null;
  }

  // ---------- BFS 寻路 ----------
  // 树是"能走但致死"的 —— 寻路时必须排除（终点除外，否则会永远走不到树下）
  function aiBlocksTree(g, x, y) {
    const trees = g.map && g.map.trees;
    if (!trees || !trees.length) return false;
    for (const t of trees) {
      if ((t.floor | 0) !== (g.floor | 0)) continue;
      if (Math.abs(t.x - x) <= 1 && Math.abs(t.y - y) <= 1) return true;   // 留一格余量
    }
    return false;
  }

  function bfsPath(g, sx, sy, tx, ty, allowDoor, maxNodes) {
    const size = g.map.size;
    if (sx === tx && sy === ty) return [];
    const from = new Int32Array(size * size).fill(-1);
    const seen = new Uint8Array(size * size);
    const startIdx = sy * size + sx, goalIdx = ty * size + tx;
    const q = [startIdx];
    seen[startIdx] = 1;
    let head = 0, expanded = 0, found = -1;
    while (head < q.length && expanded < (maxNodes || MAX_NODES)) {
      const cur = q[head++];
      expanded++;
      if (cur === goalIdx) { found = cur; break; }
      const cx = cur % size, cy = (cur / size) | 0;
      for (const d of DIRS) {
        const nx = cx + d[0], ny = cy + d[1];
        if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue;
        const ni = ny * size + nx;
        if (seen[ni]) continue;
        if (!walkable(g, nx, ny, allowDoor) && ni !== goalIdx) continue;
        // Level 14 的树能走上去，但撞上就是死 —— 寻路时一律当实心绕开
        if (aiBlocksTree(g, nx, ny) && ni !== goalIdx) continue;
        seen[ni] = 1; from[ni] = cur; q.push(ni);
      }
    }
    if (found < 0) return null;
    const path = [];
    let cur = found;
    while (cur !== startIdx && cur >= 0) { path.push({ x: cur % size, y: (cur / size) | 0 }); cur = from[cur]; }
    path.reverse();
    return path;
  }

  // 直线可通：按玩家半径检查四个角，避免以为能斜着蹭过墙角
  function lineClear(g, x0, y0, x1, y1) {
    const len = Math.hypot(x1 - x0, y1 - y0);
    const steps = Math.max(1, Math.ceil(len / (TILE * 0.25)));
    const R = (CONFIG.PLAYER_RADIUS || 18) * 0.7;
    for (let i = 1; i <= steps; i++) {
      const u = i / steps;
      const cx = x0 + (x1 - x0) * u, cy = y0 + (y1 - y0) * u;
      for (const d of CORNERS) {
        if (!walkable(g, Math.floor((cx + d[0] * R) / TILE), Math.floor((cy + d[1] * R) / TILE), true)) return false;
      }
    }
    return true;
  }

  // 沿路径找"能直线走过去"的最远点 —— 走直线，别贴着格子中心一跳一跳
  function smoothPath(g, path, px, py) {
    if (!path || !path.length) return null;
    for (let i = path.length - 1; i >= 0; i--) {
      const n = path[i];
      if (lineClear(g, px, py, (n.x + 0.5) * TILE, (n.y + 0.5) * TILE)) return n;
    }
    return path[0];
  }

  // ---------- 逃跑落点：找一格"离所有威胁都远、且真走得到"的地方 ----------
  // 能"切出这一层"的出口位置（已知且在当前层）—— 撤退时要朝它靠，而不是往反方向乱跑。
  // 不只 map.exit：很多层级是用门 / 场景物件当出口的，那些也得算进去。
  const EXIT_DOOR_KINDS = ["grate3", "iron1", "abexit", "frostdoor", "elev13", "light15",
    "exit02", "entry02", "area5", "stair4", "gate3", "hubdoor"];
  const EXIT_PROP_TYPES = ["citydoor", "cave9", "suburb9", "fieldpath", "alley10", "stairs7",
    "stair4", "elevator", "elevator4", "stairwell", "deep6", "cave7", "rope", "apartment13"];

  // ======== 出口的通用判据：只看"有没有写明通向哪一层" ========
  // 和层级体检用的是同一套字段。以前这里是一长串硬编码 type 白名单，
  // 新层级只要没被列进去，AI 就压根看不见那扇门 —— 走到了也不会按 E，
  // 于是"需要按交互键切出的地方就永远离不开"。以后新层级的出口只要写了
  // toLevel / to / goTo / target 之一，AI 自动就认得，不用再改这里。
  const INTERNAL_TO = new Set(["e696stair", "e696elev", "e696hole"]); // to 是楼层号，不是层级编号
  function exitTargetOf(o) {
    if (o == null) return null;
    if (o.toLevel != null) return o.toLevel;
    if (o.to != null) return o.to;
    if (o.goTo != null) return o.goTo;
    if (o.target != null) return o.target;
    if (o.dest != null) return o.dest;
    if (o.destLevel != null) return o.destLevel;
    return null;
  }
  // 当前层里"写明了去向"的交互出口（props 以及直接挂在 map 上的对象 / 数组）。
  // 按地图对象缓存 —— 逃跑时每帧都要问一次出口在哪，不能每次都重扫整张图。
  let ieCacheMap = null, ieCache = null;
  function interactExits(g) {
    const m = g.map;
    if (!m) return [];
    const f = g.floor | 0;
    if (ieCacheMap === m && ieCache && ieCache.floor === f) return ieCache.list;
    const out = [];
    const seen = new Set();
    const take = (o) => {
      if (!o || typeof o !== "object") return;
      if (typeof o.x !== "number" || typeof o.y !== "number") return;
      if ((o.floor | 0) !== f) return;
      if (INTERNAL_TO.has(o.type)) return;
      if (exitTargetOf(o) == null) return;
      const k = (o.x | 0) + "," + (o.y | 0);
      if (seen.has(k)) return;
      seen.add(k);
      out.push(o);
    };
    for (const p of (m.props || [])) take(p);
    // 不少出口不是 props，而是挂在 map 上的字段（exitDoor / counter / p78hatch …）
    for (const key of Object.keys(m)) {
      if (key === "props" || key === "doors" || key === "exits" || key === "start") continue;
      if (INTERNAL_TO.has(key)) continue;
      const v = m[key];
      if (v == null || v instanceof Set) continue;
      if (Array.isArray(v)) { for (const o of v) take(o); }
      else take(v);
    }
    ieCacheMap = m; ieCache = { floor: f, list: out };
    return out;
  }
  function isInteractExit(g, x, y) {
    for (const o of interactExits(g)) if ((o.x | 0) === (x | 0) && (o.y | 0) === (y | 0)) return true;
    return false;
  }

  function knownExitTile(g) {
    const map = g.map;
    if (!map) return null;
    const px = g.player.x / TILE, py = g.player.y / TILE;
    let best = null, bd = Infinity;
    const offer = (x, y) => {
      if (!known(g, x, y)) return;
      const d = Math.hypot(x + 0.5 - px, y + 0.5 - py);
      if (d < bd) { bd = d; best = { x, y }; }
    };
    if (map.exit && (map.exit.floor | 0) === (g.floor | 0)) offer(map.exit.x, map.exit.y);
    for (const e of (map.exits || [])) {
      if ((e.floor | 0) !== (g.floor | 0)) continue;
      offer(e.x, e.y);
    }
    for (const d of (map.doors || [])) {
      if ((d.floor | 0) !== (g.floor | 0)) continue;
      if (EXIT_DOOR_KINDS.indexOf(d.kind) < 0) continue;
      offer(d.x, d.y);
    }
    for (const pr of (map.props || [])) {
      if ((pr.floor | 0) !== (g.floor | 0)) continue;
      if (EXIT_PROP_TYPES.indexOf(pr.type) < 0) continue;
      offer(pr.x, pr.y);
    }
    // 新层级的出口：判据同样是"写明了通向哪一层"，不再只认上面那串老 type
    for (const o of interactExits(g)) offer(o.x, o.y);
    return best;
  }

  function fleeSpot(g, threats, preferDir, anchor) {
    const p = g.player;
    const sx = Math.floor(p.x / TILE), sy = Math.floor(p.y / TILE);
    const size = g.map.size;
    const seen = new Set([sx + "," + sy]);
    const q = [[sx, sy, 0]];
    const hereNear = threats.length
      ? Math.min.apply(null, threats.map((e) => Math.hypot(p.x - e.x, p.y - e.y))) : 0;
    let head = 0, expanded = 0, best = null, bs = -Infinity;
    while (head < q.length && expanded < 700) {
      const cur = q[head++];
      expanded++;
      const cx = cur[0], cy = cur[1], cd = cur[2];
      if (cd > 13) continue;
      const wx = (cx + 0.5) * TILE, wy = (cy + 0.5) * TILE;
      let near = Infinity;
      for (const e of threats) {
        const dd = Math.hypot(wx - e.x, wy - e.y);
        if (dd < near) near = dd;
      }
      let sc = near - cd * 0.22;
      // 锚点（通常是出口）：撤退时朝它靠过去，这样怪一走就能立刻进门，
      // 不会一路逃到地图另一头、然后就地开始探索。
      if (anchor) sc -= Math.hypot(cx - anchor.x, cy - anchor.y) * 0.55;
      // 延续上一次的逃跑方向：否则会在左右两个差不多的落点之间来回横跳
      if (preferDir != null) sc += Math.cos(Math.atan2(cy - sy, cx - sx) - preferDir) * 12;
      if (cd >= 2 && near > hereNear + 40 && sc > bs) { bs = sc; best = { x: cx, y: cy }; }
      for (const d of DIRS) {
        const nx = cx + d[0], ny = cy + d[1];
        const k = nx + "," + ny;
        if (seen.has(k)) continue;
        if (!walkable(g, nx, ny, false)) continue;
        seen.add(k); q.push([nx, ny, cd + 1]);
      }
    }
    return best;
  }

  function threatList(g) {
    const out = [];
    for (const e of g.entities) {
      if ((e.floor | 0) !== (g.floor | 0)) continue;
      if (e.docile) continue;                     // 第 11 效应：不咬人
      out.push(e);
    }
    return out;
  }

  // ---------- "够得着"判定：只有真的贴到东西上了才按 E ----------
  const INTERACT_KEYS = ["nearItem", "nearCrate", "nearBroken", "nearLake", "nearDisp",
    "nearCityDoor", "nearAlley10", "nearWin12", "nearApt13", "nearFieldPath", "nearCave9",
    "nearBerry",
    "nearElevator5", "nearStairs6", "nearStairs7", "nearRope", "nearCave7",
    "nearStairwell", "nearElevator4", "nearSwitch", "nearElevator", "nearKey"];
  function hasInteract(g, goal) {
    // 新层级的交互统一走 g.nearNew（提示条和按 E 都读它）。以前只认上面那串
    // 老字段，于是站在新层级的门口明明有"按 E"提示，AI 却判断"没东西可按"，
    // 原地杵着不走 —— 这就是「要交互按键切出的地方就离不开」的根子。
    const n = g.nearNew;
    if (n) {
      // 只按奔着去的那个物件：nearNew 若带着坐标，得和当前目标对得上，
      // 免得路过一个装饰牌就误判成"目标办成了"。
      if (n.p && goal && goal.gx != null &&
          (Math.abs((n.p.x | 0) - goal.gx) > 2 || Math.abs((n.p.y | 0) - goal.gy) > 2)) {
        return false;
      }
      return true;
    }
    for (const k of INTERACT_KEYS) if (g[k]) return true;
    return false;
  }

  // ---------- 拉黑办不成事的目标 ----------
  const banned = new Map();
  function blacklist(x, y) {
    // 出口例外：到出口试了两次没成（可能只是要等过场/黑雾），
    // 就把门拉黑 15 秒、然后再拉黑 —— AI 于是"知道门在哪却永远不去"，
    // 转头去做就近探索。出口绝对不能进黑名单。
    if (isExitTile(x, y)) return;
    banned.set(x + "," + y, now());
  }
  function isExitTile(x, y) {
    const g = lastG;
    if (!g || !g.map) return false;
    const f = g.floor | 0;
    const m = g.map;
    if (m.exit && (m.exit.floor | 0) === f && m.exit.x === x && m.exit.y === y) return true;
    for (const e of (m.exits || [])) {
      if ((e.floor | 0) === f && e.x === x && e.y === y) return true;
    }
    for (const d of (m.doors || [])) {
      if ((d.floor | 0) !== f) continue;
      if (EXIT_DOOR_KINDS.indexOf(d.kind) < 0) continue;
      if (d.x === x && d.y === y) return true;
    }
    // 按 E 切出的门也算出口：切层过场要几秒，按完当场看不出层级变化，
    // 以前会被当成"按了没反应"拉黑，AI 于是知道门在哪却再也不去。
    if (isInteractExit(g, x, y)) return true;
    return false;
  }
  function isBanned(x, y) {
    const t = banned.get(x + "," + y);
    if (t == null) return false;
    if (now() - t > 15000) { banned.delete(x + "," + y); return false; }
    return true;
  }

  const LABELS = {
    exit: "前往出口", door: "去开门", gear: "去捡装备", supply: "去拿物资",
    crate: "去撬补给箱", key: "去捡钥匙", archive: "顺路捡档案", ramp: "走斜坡换层",
  };

  let curAi = null;
  let lastG = null;          // 最近一次 update 的游戏对象（isExitTile 需要它）

  function numLevel(v) {
    const n = typeof v === "number" ? v : parseFloat(String(v));
    return isNaN(n) ? 0 : n;
  }

  // 某一层已经摸清了多少格 —— 用来判断"另一层还没去过"
  function exploredCount(g, floor) {
    const ex = g.explored && g.explored[floor];
    if (!ex) return 0;
    let n = 0;
    for (let y = 0; y < ex.length; y++) {
      const row = ex[y];
      if (!row) continue;
      for (let x = 0; x < row.length; x++) if (row[x]) n++;
    }
    return n;
  }

  function known(g, tx, ty) {
    const ex = g.explored && (g.explored[g.floor | 0] || g.explored[0]);
    if (!ex || !ex[ty]) return false;
    return !!ex[ty][tx];
  }

  // ---------- 目标扫描 ----------
  function scanGoals(g) {
    const map = g.map;
    const ai = g.ai || {};
    const px = g.player.x / TILE, py = g.player.y / TILE;
    const out = [];
    // Level 14 的树：能走上去，但撞上就是死。AI 必须把树当实心障碍绕开。
    const nearTree = (x, y) => {
      const trees = map.trees;
      if (!trees || !trees.length) return false;
      for (const t of trees) {
        if ((t.floor | 0) !== (g.floor | 0)) continue;
        if (Math.abs(t.x - x) <= 1 && Math.abs(t.y - y) <= 1) return true;
      }
      return false;
    };

    const push = (kind, x, y, w, act) => {
      const d = Math.hypot(x + 0.5 - px, y + 0.5 - py);
      // 出口放宽到 90 格 —— 它常常在地图另一头，而这正是 AI 第一优先的事。
      // 之前和其它目标一样卡在 34 格，结果"明明知道门在哪"却根本不把它当候选，
      // 于是一直在门口附近探索。
      if (d > (kind === "exit" ? 90 : 34)) return;
      if (isBanned(x, y)) return;
      if (nearTree(x, y)) return;          // 树旁边一律不去
      out.push({ kind, x, y, w, act: act === undefined ? "e" : act, d });
    };

    // ---- 切出至更高层 ----
    if (map.exit && (map.exit.floor | 0) === (g.floor | 0) && known(g, map.exit.x, map.exit.y)) {
      push("exit", map.exit.x, map.exit.y, weights.wExit * 1.6, null);
    }
    for (const e of (map.exits || [])) {
      if ((e.floor | 0) !== (g.floor | 0) || !known(g, e.x, e.y)) continue;
      push("exit", e.x, e.y, e.kind === "wall" ? weights.wExit * 1.7 : weights.wExit * 1.5, null);
    }
    // Level 4：通往 Level 10 的那片草地 —— 它是一堆格子（map.grass），
    // 既不在 map.exit 里也不是 prop，AI 压根看不见，于是看见了也不过去。
    if (map.grass && String(g.level) === "4") {
      const z = map.grassZone;
      if (z) {
        const gx = z.x + Math.floor(z.w / 2), gy = z.y + Math.floor(z.h / 2);
        push("exit", gx, gy, weights.wExit * 1.8, null);
      } else {
        let n = 0;
        for (const k of map.grass) {
          const [gx2, gy2] = k.split(",").map(Number);
          push("exit", gx2, gy2, weights.wExit * 1.8, null);
          if (++n >= 6) break;
        }
      }
    }
    for (const p of (map.props || [])) {
      if ((p.floor | 0) !== (g.floor | 0)) continue;
      if (!known(g, p.x, p.y)) continue;
      const isExitish = p.type === "citydoor" || p.type === "cave9" || p.type === "fieldpath" ||
        p.type === "alley10" || p.type === "stairs7" || p.type === "stair4" ||
        p.type === "elevator" || p.type === "elevator4" || p.type === "stairwell" ||
        p.type === "deep6" || p.type === "cave7" || p.type === "rope";
      // 通用判据：写了去向就是出口。新层级不用再来这张白名单里补一行。
      const declared = !INTERNAL_TO.has(p.type) && exitTargetOf(p) != null;
      if (isExitish || declared) push("exit", p.x, p.y, weights.wExit * 1.4, "e");
    }
    // 直接挂在 map 上、不在 props 里的出口也一并认出来。
    // 自动触发型（map.exit / map.exits / 草地 / 郊区斑块）已经用 act=null 登记过，
    // 这里跳过同坐标，免得 AI 站上去却去按一个并不存在的 E。
    const autoTiles = new Set();
    if (map.exit) autoTiles.add((map.exit.x | 0) + "," + (map.exit.y | 0));
    for (const e of (map.exits || [])) autoTiles.add((e.x | 0) + "," + (e.y | 0));
    for (const o of interactExits(g)) {
      if (autoTiles.has((o.x | 0) + "," + (o.y | 0))) continue;
      if (known(g, o.x, o.y)) push("exit", o.x, o.y, weights.wExit * 1.3, "e");
    }

    // 斜坡（Level 1 上下层之间的斜置平台）：走上去就换层。
    // 不去走它，AI 就会困在半张地图里，永远找不到另一层的出口。
    // 冷却期内也放行：如果这一层已经没什么可探索的、或另一层还没去过，
    // 换层就是唯一出路 —— 否则 AI 会一直待在半张图里，永远找不到另一层的出口。
    const stuckHere = !exploreTarget(g, null);
    const other = (g.floor | 0) === 0 ? 1 : 0;
    const otherN = exploredCount(g, other);
    const otherFresh = otherN < 60;
    if (!((ai.floorCd || 0) > 0) || stuckHere || otherFresh) {
      const rw = weights.wExit * (otherFresh ? 1.35 : (stuckHere ? 1.25 : 0.6));
      for (const r of (map.ramps || [])) {
        let pos = null;
        if ((g.floor | 0) === (r.floorA | 0)) pos = r.aPos;
        else if ((g.floor | 0) === (r.floorB | 0)) pos = r.bPos;
        if (!pos || !known(g, pos.x, pos.y)) continue;
        push("ramp", pos.x, pos.y, rw, null);
      }
    }

    for (const d of (map.doors || [])) {
      if ((d.floor | 0) !== (g.floor | 0)) continue;
      if (d.open) continue;
      if (!known(g, d.x, d.y)) continue;
      if (d.kind === "red") continue;                       // 通往 0.2 的红门：不主动进
      // Level 13 电梯 -> Level 70；Level 15 光点 -> 随机层级；Level 70 编号门 -> 指定层
      if (d.kind === "elev13" || d.kind === "light15" || d.kind === "frostdoor") {
        push("door", d.x, d.y, weights.wExit * 1.7, "r");
        continue;
      }
      // Level 1 的 A / B 走廊：顺序是"先 B 后 A"，走错当场就没了。
      // AI 得认得这扇门，而且绝不能去开写错了的那扇。
      if (d.kind === "abdoor") {
        if (!d.correct) continue;                       // 这扇开了就是送死，绕开
        push("door", d.x, d.y, weights.wExit * 1.9, "r");
        continue;
      }
      if (d.kind === "abexit") {                        // 走廊尽头就是枢纽
        push("door", d.x, d.y, weights.wExit * 2.1, "r");
        continue;
      }
      if (d.kind === "abgate") {                        // 走廊入口
        push("door", d.x, d.y, weights.wExit * 1.5, "r");
        continue;
      }
      // 枢纽里的门用 target 而不是 toLevel，之前 AI 完全认不出来，
      // 结果进了枢纽就只会瞎逛，永远出不去。
      if (d.kind === "hubdoor") {
        // 枢纽的门认的是层级密钥：到过那一层不算，身上得有对应的钥匙
        // （或者这扇门本局已经用钥匙开过）。Level 1 / 11 两扇永远开着。
        const visited = (typeof window !== "undefined" && window.__hasVisited)
          ? window.__hasVisited(d.target) : false;
        const K = (typeof window !== "undefined") ? window.LEVEL_KEY : null;
        const canOpen = K ? !K.hubLocked(window.__game, d.target) : (!d.locked || visited);
        if (!canOpen) continue;                             // 没钥匙，去了也开不了
        // 越高的层级越值得去
        const tn = Number(d.target);
        const hi = Number.isFinite(tn) ? 1 + tn * 0.06 : 1.2;
        push("door", d.x, d.y, weights.wExit * (visited ? 1.6 : 1.1) * hi, "r");
        continue;
      }
      // 从子层级离开的门：在 0.2 里这是唯一出路
      if (d.kind === "entry02" || d.kind === "exit02") {
        push("door", d.x, d.y, weights.wExit * 1.3, "r");
        continue;
      }
      // 只有层级编号真的变高才算"切出"
      const tgt = d.toLevel;
      if (tgt != null && numLevel(tgt) > numLevel(g.level)) {
        push("door", d.x, d.y, weights.wExit * 1.2, "r");
      } else if (d.kind === "sub" || d.kind === "exit1" || d.kind === "iron1" || tgt != null) {
        push("door", d.x, d.y, weights.wExit * 0.3, "r");
      }
    }

    // ---- 装备 / 物资 / 钥匙 ----
    const hasCrowbar = (g.inv.crowbar | 0) > 0;
    for (const it of (map.ground || [])) {
      if (it.taken || (it.floor | 0) !== (g.floor | 0) || !known(g, it.x, it.y)) continue;
      if (it.item === "bag1" || it.item === "bag2" || it.item === "bag3" || it.item === "bag4") {
        push("gear", it.x, it.y, weights.wGear * 1.8);
      } else if (it.item === "almond" || it.item === "crowbar" || it.item === "divesuit" ||
                 it.item === "submarine") {
        push("supply", it.x, it.y, weights.wSupply);
      } else if (it.item === "key" || it.item === "meat") {
        push("key", it.x, it.y, weights.wKey);
      }
    }
    for (const c of (map.crates || [])) {
      if (c.opened || (c.floor | 0) !== (g.floor | 0) || !known(g, c.x, c.y)) continue;
      if (!hasCrowbar) continue;                            // 没撬棍打不开
      push("crate", c.x, c.y, weights.wSupply * 1.15);
    }
    for (const p of (map.props || [])) {
      if ((p.floor | 0) !== (g.floor | 0)) continue;
      // 破损的箱子必须还没翻过 —— 翻过的空箱子会让 AI 站在前面反复按 E，一抽一抽的
      if (p.type === "brokenCrate" && !p.opened && known(g, p.x, p.y)) {
        push("supply", p.x, p.y, weights.wSupply * 1.3);
      } else if ((p.type === "watercooler" || p.type === "freezer" || p.type === "vending") &&
                 (p.uses | 0) > 0 && known(g, p.x, p.y)) {
        push("supply", p.x, p.y, weights.wSupply * 0.9);
      }
    }
    for (const a of (g.archives || [])) {
      if (a.taken || (a.floor | 0) !== (g.floor | 0) || !known(g, a.x, a.y)) continue;
      push("archive", a.x, a.y, weights.wSupply * 0.35);
    }
    // 记忆：以前在这一层见过的出口与物资，即使本趟地图换了种子也照着去找
    const mk = memKey(g);
    for (const e of (mem.exits[mk] || [])) push("exit", e.x, e.y, weights.wExit * 1.15, null);
    for (const s2 of (mem.supplies[mk] || [])) push("supply", s2.x, s2.y, weights.wSupply * 0.9, "e");
    return out;
  }

  // ---------- 找没去过的地方 ----------
  function exploreTarget(g, preferDir) {
    const map = g.map;
    const ex = g.explored && (g.explored[g.floor | 0] || g.explored[0]);
    if (!ex) return null;
    const size = map.size;
    const layer = map.layers[(g.floor | 0)] || map.layers[0];
    const px = Math.floor(g.player.x / TILE), py = Math.floor(g.player.y / TILE);
    let best = null, bs = -Infinity, cnt = 0;
    // 偏好 9 格左右、且延续上一次的方向：朝一个方向连续推进，别一步一回头
    for (let r = 3; r <= 28 && cnt < 520; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
          const x = px + dx, y = py + dy;
          if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) continue;
          if (!layer[y] || layer[y][x] !== 0) continue;
          if (ex[y] && ex[y][x]) continue;
          if (isBanned(x, y)) continue;
          cnt++;
          let sc = -Math.abs(Math.hypot(dx, dy) - 9);
          if (preferDir != null) sc += Math.cos(Math.atan2(dy, dx) - preferDir) * 6;
          if (sc > bs) { bs = sc; best = { x, y }; }
        }
      }
    }
    return best;
  }

  function aiExploreDir(g) {
    const ai = g.ai;
    if (!ai || !ai.goal || ai.goal.gx == null) return null;
    const dx = (ai.goal.gx + 0.5) * TILE - g.player.x;
    const dy = (ai.goal.gy + 0.5) * TILE - g.player.y;
    if (Math.hypot(dx, dy) < 1) return null;
    return Math.atan2(dy, dx);
  }

  function pickGoal(g, px, py) {
    const goals = scanGoals(g);
    const exploreBonus = 26 + (100 - weights.curiosity) * 0.5;
    let best = null, bs = -Infinity;
    for (const t of goals) {
      let sc = t.w * 22 / (t.d + 6);
      if (t.d < 1.6) sc += 30;
      if (sc > bs) { bs = sc; best = t; }
    }
    const et = exploreTarget(g, aiExploreDir(g));
    if (et) {
      const ed = Math.hypot(et.x + 0.5 - px, et.y + 0.5 - py);
      // 出口已经在候选里了：探索要明显更值才能抢走目标。
      // 否则"就近探索"永远赢（它就在脚边），AI 会在出口旁边绕圈子不去切层。
      const need = (best && best.kind === "exit") ? bs * 1.25 : bs;
      const es = exploreBonus * 22 / (ed + 6);
      if (es > need) return { goal: { gx: et.x, gy: et.y, act: null, label: "探索未知区域" }, score: es };
    }
    if (best) {
      return { goal: { gx: best.x, gy: best.y, act: best.act, label: LABELS[best.kind] || best.kind }, score: bs };
    }
    if (et) return { goal: { gx: et.x, gy: et.y, act: null, label: "探索未知区域" }, score: 0 };
    return null;
  }

  function tooManyTries(ai, x, y) {
    const k = x + "," + y;
    if (ai.lastActKey === k) ai.actTries = (ai.actTries || 0) + 1;
    else { ai.actTries = 1; ai.lastActKey = k; }
    if (ai.actTries >= 3) {
      blacklist(x, y);
      ai.actTries = 0; ai.goal = null; ai.hold = 0;
      return true;
    }
    return false;
  }

  // main.js 告诉 AI：刚才那次 E / R 到底办成事没有。
  // 没办成（比如站在空箱子前面）就立刻拉黑，别原地反复按。
  function noteAction(ok, immediate) {
    const ai = curAi;
    if (!ai) return;
    if (ok) { ai.noActN = 0; ai.actTries = 0; ai.lastActKey = null; return; }
    // 空箱子这类"按了也白按"的目标：不用等第二次，当场就拉黑
    if (immediate) {
      if (ai.goal && ai.goal.gx != null) blacklist(ai.goal.gx, ai.goal.gy);
      ai.goal = null; ai.hold = 0; ai.noActN = 0; ai.path = null; ai.actTries = 0;
      return;
    }
    ai.noActN = (ai.noActN || 0) + 1;
    if (ai.noActN >= 2) {
      if (ai.goal && ai.goal.gx != null) blacklist(ai.goal.gx, ai.goal.gy);
      ai.goal = null; ai.hold = 0; ai.noActN = 0; ai.path = null;
    }
  }

  // 输出方向做平滑，避免瞬间反向
  function smoothOut(ai, dt, fast) {
    const rate = fast ? 1e-9 : 0.0025;      // 逃命时几乎立刻转向
    const k = 1 - Math.pow(rate, Math.min(dt, 0.1));
    ai.outX = (ai.outX || 0) + ((ai.vx || 0) - (ai.outX || 0)) * k;
    ai.outY = (ai.outY || 0) + ((ai.vy || 0) - (ai.outY || 0)) * k;
    const m = Math.hypot(ai.outX, ai.outY);
    if (m > 0.02) { ai.vx = ai.outX / m; ai.vy = ai.outY / m; }
    else { ai.vx = 0; ai.vy = 0; }
  }

  // 卡住时的脱困处理（逃跑与赶路共用）
  function unstick(ai, dt, px, py, onGiveUp) {
    const moved = Math.hypot(px - (ai.lastX || px), py - (ai.lastY || py));
    if (moved < 0.9 && (ai.vx || ai.vy)) {
      ai.stuck = (ai.stuck || 0) + dt;
      if (ai.stuck > 0.2) {
        // 沿墙滑动：记住卡住那一刻的前进方向，沿它的垂直方向蹭。
        // 不能每帧再转 90° —— 那会原地打转。
        if (!ai.slideBase) {
          ai.slideBase = { x: ai.vx, y: ai.vy };
          ai.slide = Math.random() < 0.5 ? 1 : -1;
        }
        ai.vx = -ai.slideBase.y * ai.slide;
        ai.vy = ai.slideBase.x * ai.slide;
      }
      if (ai.stuck > 1.0) {
        ai.slide = -(ai.slide || 1);
        ai.slideBase = null;
        ai.stuck = 0;
        ai.escapeN = (ai.escapeN || 0) + 1;
        if (onGiveUp) onGiveUp();
        // 连着几次都出不去（多半是三面围住的凹角）：先往后退一段再说
        if (ai.escapeN >= 2) { ai.backT = 0.6; ai.escapeN = 0; }
      }
      if (ai.backT > 0) {
        ai.backT -= dt;
        if (ai.backX != null) { ai.vx = -ai.backX; ai.vy = -ai.backY; }
      }
    } else {
      ai.stuck = 0; ai.slide = 0; ai.slideBase = null; ai.escapeN = 0;
      ai.backX = ai.vx; ai.backY = ai.vy;      // 记住来的方向，卡住时好往回退
      ai.lastX = px; ai.lastY = py;
    }
  }

  // ---------- 主更新 ----------
  function update(g, dt) {
    lastG = g;
    const ai = g.ai || (g.ai = {});
    if (ai.outX == null) { ai.outX = 0; ai.outY = 0; ai.stuck = 0; ai.hold = 0; }
    ai.hold = (ai.hold || 0) - dt;
    ai.vx = 0; ai.vy = 0; ai.sprint = false;
    ai.wantE = false; ai.wantR = false; ai.wantDrink = false;
    curAi = ai;

    memNote(g, dt);                 // 记住这一层的出口 / 物资 / 怪点
    const p = g.player;
    const px = p.x, py = p.y;
    const ptx = Math.floor(px / TILE), pty = Math.floor(py / TILE);

    // ---- 冷却计时 ----
    ai.subCd = Math.max(0, (ai.subCd || 0) - dt);
    ai.floorCd = Math.max(0, (ai.floorCd || 0) - dt);
    // 换层了：清掉旧目标，并给斜坡一个冷却，免得在斜坡上上下下
    const floorChanged = ai.lastFloor != null && ai.lastFloor !== (g.floor | 0);
    const levelChanged = ai.lastLevel != null && ai.lastLevel !== g.level;
    // 只有在本层里踩斜坡换的层才算（传送整层切换不该罚冷却）
    if (floorChanged && !levelChanged) {
      ai.floorCd = 12;
      ai.goal = null; ai.path = null; ai.hold = 0;
      banned.clear();
    }
    ai.lastFloor = g.floor | 0;
    if (ai.lastLevel != null && ai.lastLevel !== g.level) {
      const wasSub = numLevel(ai.lastLevel) % 1 !== 0;
      const nowSub = numLevel(g.level) % 1 !== 0;
      if (wasSub && !nowSub) ai.subCd = 45;      // 刚从 0.2 出来，别立刻又钻回去
      ai.goal = null; ai.path = null; ai.hold = 0;
      banned.clear();
    }
    ai.lastLevel = g.level;

    if (ai.waitCd > 0) ai.waitCd -= dt;
    if (ai.waitCd <= 0) ai.waitCd = 0;

    // ---- 1) 理智不够就喝杏仁水 ----
    if (g.sanity < weights.sanityLine && (g.inv.almond | 0) > 0) ai.wantDrink = true;

    // ---- 2) 危险：先跑 ----
    const threats = threatList(g);
    // 记忆里见过怪的地方：这一趟就算还没刷出来，也提前绕开
    const mkNow = memKey(g), mdNow = mem.danger[mkNow] || [], msNow = Date.now();
    let memAdded = 0;
    for (const d of mdNow) {
      if (msNow - (d.t || 0) > 20 * 60 * 1000) continue;
      const ex = (d.x + 0.5) * TILE, ey = (d.y + 0.5) * TILE;
      if (Math.hypot(p.x - ex, p.y - ey) < 4.2 * TILE && memAdded < 3) {
        threats.push({ x: ex, y: ey, memory: true }); memAdded++;
      }
    }
    const safeDist = (3.2 + weights.cautious * 0.06) * TILE;
    let danger = 0;
    for (const e of threats) {
      const d = Math.hypot(p.x - e.x, p.y - e.y);
      if (d < safeDist) danger = Math.max(danger, 1 - d / safeDist);
    }

    if (danger > 0.02) {
      ai.goal = null; ai.path = null;
      let tx = null, ty = null;
      ai.fleeT = (ai.fleeT || 0) - dt;
      if (ai.fleeT <= 0 || !ai.flee) {
        ai.fleeT = 0.7;                                  // 锁定久一点，别一秒换三个落点
        ai.flee = fleeSpot(g, threats, ai.fleeDir, knownExitTile(g));
        if (ai.flee) ai.fleeDir = Math.atan2(ai.flee.y + 0.5 - py / TILE, ai.flee.x + 0.5 - px / TILE);
      }
      if (ai.flee) {
        const path = bfsPath(g, ptx, pty, ai.flee.x, ai.flee.y, false, 900);
        const n = smoothPath(g, path, px, py) || ai.flee;
        tx = (n.x + 0.5) * TILE; ty = (n.y + 0.5) * TILE;
      }
      if (tx == null) {
        // 没有更好的落点：在"能走"的方向里挑离威胁最远的。
        // 纯背对威胁会一头撞进墙里，然后被贴脸咬死。
        let bx = 0, by = 0, bs2 = -Infinity;
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * Math.PI * 2;
          const dx = Math.cos(a), dy = Math.sin(a);
          const cx = Math.floor((p.x + dx * TILE) / TILE), cy = Math.floor((p.y + dy * TILE) / TILE);
          if (!walkable(g, cx, cy, false)) continue;
          let sc = 0;
          for (const e of threats) {
            sc += Math.hypot(p.x + dx * TILE - e.x, p.y + dy * TILE - e.y) -
                  Math.hypot(p.x - e.x, p.y - e.y);
          }
          if (sc > bs2) { bs2 = sc; bx = dx; by = dy; }
        }
        if (bs2 > -Infinity) { tx = p.x + bx * TILE; ty = p.y + by * TILE; }
        else { tx = p.x; ty = p.y; }
      }
      let dx = tx - px, dy = ty - py;
      const m = Math.hypot(dx, dy) || 1;
      ai.vx = dx / m; ai.vy = dy / m;
      ai.sprint = g.player.stamina > 6;                  // 逃命时留着体力没用
      ai.label = "逃离实体";
      unstick(ai, dt, px, py, () => { ai.flee = null; ai.fleeT = 0; });
      smoothOut(ai, dt, true);
      return;
    }
    ai.flee = null;

    // ---- 2.4) 脚下正好是「按 E 切出」的出口：直接按，不必等目标扫描 ----
    // 有一批出口的去向只写在交互代码里，地图数据上没有 toLevel，
    // scanGoals 扫不到它们；但人走到跟前会看到「按 E」提示，AI 也照着按。
    // 同一个物件只按一次、按完留 1 秒冷却，免得在原地一抽一抽地反复按。
    ai.autoECd = Math.max(0, (ai.autoECd || 0) - dt);
    if (typeof window !== "undefined" && window.__aiNearExit && window.__aiNearExit(g)) {
      const n = g.nearNew;
      const k = String(n.kind) + ":" + (n.p ? ((n.p.x | 0) + "," + (n.p.y | 0)) : "");
      if (ai.autoEKey !== k && ai.autoECd <= 0) {
        ai.autoEKey = k;
        ai.autoECd = 1.0;
        ai.wantE = true;
        ai.label = "按 E 切出";
        ai.goal = null; ai.path = null;
        ai.vx = 0; ai.vy = 0;
        smoothOut(ai, dt, false);
        return;
      }
    } else {
      ai.autoEKey = null;
    }

    // ---- 2.5) 出口被实体堵着：在出口附近的安全位置等，等它走开再进去 ----
    // 之前这一整段都没有 —— 一被吓跑，AI 就往远处逃，然后就地开始探索，
    // 明明知道门在哪，却在外面绕很久都不进去。
    {
      const ex = knownExitTile(g);
      if (ex) {
        const exw = (ex.x + 0.5) * TILE, exwY = (ex.y + 0.5) * TILE;
        let blocked = false;
        for (const e of threats) {
          if (Math.hypot(e.x - exw, e.y - exwY) < 6.5 * TILE) { blocked = true; break; }
        }
        // 等太久就不等了：万一是只赖在出口不动的实体，一直候着就永远不出门。
        ai.waitT = (ai.waitT || 0) + dt;
        if (ai.waitT > 22) { ai.waitT = 0; ai.waitCd = 10; }
        if (blocked && !(ai.waitCd > 0)) {
          // 找一个离出口近、又离所有威胁都够远的落脚点
          let best = null, bs = -Infinity;
          for (let r = 3; r <= 11 && !best; r++) {
            for (let i = 0; i < 24; i++) {
              const a = (i / 24) * Math.PI * 2;
              const cx = Math.round(ex.x + Math.cos(a) * r), cy = Math.round(ex.y + Math.sin(a) * r);
              if (cx < 1 || cy < 1 || cx >= g.map.size - 1 || cy >= g.map.size - 1) continue;
              if (!walkable(g, cx, cy, true)) continue;
              let near = Infinity;
              for (const e of threats) near = Math.min(near, Math.hypot((cx + 0.5) * TILE - e.x, (cy + 0.5) * TILE - e.y));
              if (near < 5 * TILE) continue;
              const sc = near - r * 3 - Math.hypot((cx + 0.5) * TILE - px, (cy + 0.5) * TILE - py) * 0.02;
              if (sc > bs) { bs = sc; best = { x: cx, y: cy }; }
            }
          }
          if (best) {
            ai.waitT = (ai.waitT || 0) + dt;
            const reached = Math.hypot((best.x + 0.5) * TILE - px, (best.y + 0.5) * TILE - py) < TILE * 1.2;
            if (!reached) {
              const path = bfsPath(g, ptx, pty, best.x, best.y, true, 1400);
              const n = smoothPath(g, path, px, py) || best;
              const tx = (n.x + 0.5) * TILE, ty = (n.y + 0.5) * TILE;
              let dx = tx - px, dy = ty - py;
              const m = Math.hypot(dx, dy) || 1;
              ai.vx = dx / m; ai.vy = dy / m;
            } else {
              ai.vx = 0; ai.vy = 0;
            }
            ai.sprint = false;
            ai.label = "等实体离开出口";
            ai.goal = null; ai.path = null;
            smoothOut(ai, dt, false);
            return;
          }
        }
      }
    }

    // ---- 3) 选目标：认准一个就一直走 ----
    if (ai.hold <= 0 || !ai.goal || ai.goalDone) {
      ai.hold = 0.3;
      const cand = pickGoal(g, px / TILE, py / TILE);
      if (!ai.goal || ai.goalDone) {
        ai.goal = cand ? cand.goal : null;
        ai.goalScore = cand ? cand.score : 0;
        ai.path = null; ai.repath = 0; ai.stuck = 0; ai.slideBase = null;
      } else if (cand && cand.score > (ai.goalScore || 0) * 1.6 + 10) {
        // 明显更值得去的事才换目标
        ai.goal = cand.goal;
        ai.goalScore = cand.score;
        ai.path = null; ai.repath = 0; ai.stuck = 0; ai.slideBase = null;
      }
    }
    const goal = ai.goal;
    if (!goal) { ai.vx = 0; ai.vy = 0; ai.label = "原地观察"; smoothOut(ai, dt, false); return; }
    ai.label = goal.label;

    const gx = goal.gx, gy = goal.gy;
    const cxp = (gx + 0.5) * TILE, cyp = (gy + 0.5) * TILE;
    const distPx = Math.hypot(cxp - px, cyp - py);

    // ---- 4) 到了：动手 ----
    if (distPx < 30) {
      if (goal.act === "r") {
        if (g.nearDoor && !g.nearDoor.open) {
          ai.wantR = true; ai.failT = 0; ai.goalDone = true;
          tooManyTries(ai, gx, gy);
        } else { ai.failT = 0; ai.goalDone = true; }
        ai.vx = 0; ai.vy = 0;
        smoothOut(ai, dt, false);
        return;
      }
      if (goal.act === "e" && hasInteract(g, goal)) {
        ai.wantE = true; ai.failT = 0; ai.goalDone = true;
        tooManyTries(ai, gx, gy);
        ai.vx = 0; ai.vy = 0;
        smoothOut(ai, dt, false);
        return;
      }
      if (goal.act === null && distPx < 20) {
        ai.failT = 0; ai.goalDone = true;
        ai.vx = 0; ai.vy = 0;
        smoothOut(ai, dt, false);
        return;
      }
      if (distPx > 8) {
        const dx2 = cxp - px, dy2 = cyp - py;
        const m2 = Math.hypot(dx2, dy2) || 1;
        ai.vx = dx2 / m2; ai.vy = dy2 / m2;
      }
      ai.failT = (ai.failT || 0) + dt;
      if (ai.failT > 3) { blacklist(gx, gy); ai.failT = 0; ai.goal = null; ai.hold = 0; }
      smoothOut(ai, dt, false);
      return;
    }

    // ---- 5) 寻路 ----
    ai.repath = (ai.repath || 0) - dt;
    if (ai.repath <= 0 || !ai.path) {
      ai.repath = 0.5;
      ai.path = bfsPath(g, ptx, pty, gx, gy, true, MAX_NODES);
      ai.lastX = px; ai.lastY = py;
    }
    if (!ai.path || !ai.path.length) {
      blacklist(gx, gy);
      ai.goal = null; ai.hold = 0;
      ai.vx = 0; ai.vy = 0;
      smoothOut(ai, dt, false);
      return;
    }

    // 被关着的门挡住了，而且够得着 —— 开门
    ai.doorCd = (ai.doorCd || 0) - dt;
    const nx0 = ai.path[0];
    if (closedDoorAt(g, nx0.x, nx0.y) && g.nearDoor && !g.nearDoor.open && ai.doorCd <= 0) {
      ai.wantR = true;
      ai.doorCd = 0.8;
    }

    const node = smoothPath(g, ai.path, px, py);
    let dx = (node.x + 0.5) * TILE - px, dy = (node.y + 0.5) * TILE - py;
    const m = Math.hypot(dx, dy) || 1;
    ai.vx = dx / m; ai.vy = dy / m;

    // ---- 6) 疾跑：体力滞回，攒到 60 才起跑，掉到 18 就收住 ----
    const st = g.player.stamina;
    if (ai.sprintOn && st < 18) ai.sprintOn = false;
    else if (!ai.sprintOn && st > 60) ai.sprintOn = true;
    ai.sprint = !!ai.sprintOn && distPx > 1.3 * TILE;

    // ---- 7) 卡住了：沿墙蹭，不行就后退 ----
    unstick(ai, dt, px, py, () => {
      ai.path = null; ai.repath = 0;
      blacklist(gx, gy);
      ai.goal = null; ai.hold = 0;
    });
    smoothOut(ai, dt, false);
  }

  load();
  memLoad();

  window.AI = {
    weights: weights,
    defaults: DEFAULTS,
    save: save,
    load: load,
    reset: () => { Object.assign(weights, DEFAULTS); save(); },
    update: update,
    noteAction: noteAction,
    exportModel: exportModel,
    importModel: importModel,
    memory: () => mem,
    clearMemory: () => { mem = EMPTY_MEM(); memSave(); },
    noteDeath: () => { mem.deaths = (mem.deaths | 0) + 1; memSave(); },
  };
})();
