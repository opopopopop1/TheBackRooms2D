// 层级建筑布局（固定）
// ---------------------------------------------------------------------------
// 为了降低难度：同一层级的建筑位置每次进入都一样，玩家第二次来就认得路了。
// 坐标是"相对地图尺寸的比例"（0~1），生成时按实际尺寸换算成格子，
// 所以地图变大变小，房子还在同一个地方。
// ===========================================================
// 地板上的洞口（Level 1 -> Level 19）
// 以前这个物件没有自己的建模，画出来是通用的棕色方块 —— 看着就是张桌子，
// 玩家根本认不出那是个能掉下去的洞。这里给它单独建一个：
// 一圈被砸开的混凝土碴口 + 越往里越黑 + 边缘的高光，看上去就是"地板破了个洞"。
// ===========================================================
window.PROP_DRAW = window.PROP_DRAW || {};
window.PROP_DRAW["hole"] = function (ctx, p, T) {
  // 洞口外圈：被砸开的混凝土碴（浅灰，比地板亮一点，看得出是"新破的"）
  ctx.fillStyle = "#8d8f86";
  ctx.beginPath();
  const R0 = T * 0.46;
  const teeth = 11;
  ctx.beginPath();
  for (let i = 0; i < teeth * 2; i++) {
    const a = (Math.PI * 2 * i) / (teeth * 2);
    const rr = (i % 2 === 0) ? R0 : R0 * 0.80;   // 锯齿状碴口
    const x = Math.cos(a) * rr, y = Math.sin(a) * rr * 0.92;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  // 碴口上的碎块：几粒散落的小石子
  ctx.fillStyle = "#a2a49a";
  for (let i = 0; i < 5; i++) {
    const a = i * 1.9 + (p.x || 0) * 0.7;
    const rr = R0 * (1.02 + (i % 3) * 0.06);
    ctx.fillRect(Math.cos(a) * rr - 1, Math.sin(a) * rr * 0.9 - 1, 2.4, 2.4);
  }
  // 洞口内圈：一圈被踩实的暗边
  ctx.fillStyle = "#6a6c64";
  ctx.beginPath(); ctx.ellipse(0, 0, R0 * 0.74, R0 * 0.68, 0, 0, Math.PI * 2); ctx.fill();
  // 洞里：越往中心越黑，最底下完全看不见
  const gr = ctx.createRadialGradient(0, -R0 * 0.10, 1, 0, 0, R0 * 0.72);
  gr.addColorStop(0, "#000000");
  gr.addColorStop(0.55, "#07070a");
  gr.addColorStop(1, "#191b18");
  ctx.fillStyle = gr;
  ctx.beginPath(); ctx.ellipse(0, 0, R0 * 0.72, R0 * 0.66, 0, 0, Math.PI * 2); ctx.fill();
  // 上沿的一点高光：洞口的厚度
  ctx.strokeStyle = "rgba(214,218,206,0.30)";
  ctx.lineWidth = Math.max(1, T * 0.035);
  ctx.beginPath(); ctx.ellipse(0, -R0 * 0.04, R0 * 0.74, R0 * 0.60, 0, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
  // 底下透出来的一点冷气（看得出下面有空间，不是一块黑斑）
  ctx.fillStyle = "rgba(120,150,170,0.10)";
  ctx.beginPath(); ctx.ellipse(0, R0 * 0.18, R0 * 0.34, R0 * 0.14, 0, 0, Math.PI * 2); ctx.fill();
};
window.LEVEL_BUILDINGS = window.LEVEL_BUILDINGS || {};

// Level 1 —— 宜居地带（停车场）
// 沿四面外墙排一圈房间：地面是白的，里面有桌子和柜子。
// 房间彼此不连通 —— 每间只有一个开口，通向外面那条停车场主通道。
// alphaBase：M.E.G 的 Alpha 基地 —— 放在地图右下角，离出生点（正中）很远。
// 之前默认在 {0.12, 0.26}，正压在出生点上面，一开局就撞脸。
// exitCorner：通往 Level 2 的黑雾所在的角落（"tl/tr/bl/br"）。
LEVEL_BUILDINGS["1"] = {
  seed: 485174231,
  alphaBase: { x: 0.66, y: 0.66, w: 0.34, h: 0.32 },
  exitSide: "right",  // 通往 Level 2 的黑雾：固定刷在基地右侧外墙边上（上层）
  sideRooms: [
  { x: 0.08, y: 0.04, w: 0.11, h: 0.09, dir: "down" },
  { x: 0.26, y: 0.04, w: 0.1, h: 0.09, dir: "down" },
  { x: 0.43, y: 0.04, w: 0.12, h: 0.09, dir: "down" },
  { x: 0.63, y: 0.04, w: 0.1, h: 0.09, dir: "down" },
  { x: 0.8, y: 0.04, w: 0.11, h: 0.09, dir: "down" },
  { x: 0.08, y: 0.87, w: 0.11, h: 0.09, dir: "up" },
  { x: 0.26, y: 0.87, w: 0.1, h: 0.09, dir: "up" },
  { x: 0.43, y: 0.87, w: 0.12, h: 0.09, dir: "up" },
  { x: 0.63, y: 0.87, w: 0.1, h: 0.09, dir: "up" },
  { x: 0.8, y: 0.87, w: 0.11, h: 0.09, dir: "up" },
  { x: 0.04, y: 0.22, w: 0.09, h: 0.1, dir: "right" },
  { x: 0.04, y: 0.4, w: 0.09, h: 0.11, dir: "right" },
  { x: 0.04, y: 0.58, w: 0.09, h: 0.1, dir: "right" },
  { x: 0.04, y: 0.74, w: 0.09, h: 0.1, dir: "right" },
  { x: 0.87, y: 0.22, w: 0.09, h: 0.1, dir: "left" },
  { x: 0.87, y: 0.4, w: 0.09, h: 0.11, dir: "left" },
  { x: 0.87, y: 0.58, w: 0.09, h: 0.1, dir: "left" },
  { x: 0.87, y: 0.74, w: 0.09, h: 0.1, dir: "left" }
  ]
};

// ===========================================================
// Level 1 —— 花园段（下层右上角的一小块区域）
// 准确来说它不是一个层级，甚至不是一个区域，只是 Level 1 下层右上角
// 那么十几格的地方。范围内的植物生长异常茂盛 —— 流浪者一旦站着不动，
// 地上的植被就会向上生长，把人捆住，以其身躯为养料，直到彻底分解。
// 因此绝大多数流浪者都不会深入探索。
// 出口：原路返回；或者往深处走，来到 Level 1.2 砼苑。
// ===========================================================
window.buildGardenNook = function (map, size) {
  if (!map || !map.layers || map.layers.length < 2) return null;
  const f = 1;                       // 下层
  const grid = map.layers[f];
  const W = 4, H = 4;                // 十几格
  // 贴着下层东北角的两条外墙：右边缘是 size-2 那一列，上边缘是第 1 行。
  // 以前放在 size-W-7 / y=6 —— 一整块草地悬在停车场中间，四周凭空立着墙，
  // 看着像地图里硬抠出来的一块；现在它是沿着墙走到东北角尽头自然接上的一小块。
  const x = size - W - 1;
  const y = 1;
  if (!grid || x < 1 || y < 1 || x + W - 1 > size - 2 || y + H - 1 > size - 2) return null;
  carveRoom(grid, size, x, y, W, H);

  // 入口留在房间西南角：从停车场沿着墙一路走到东北角，拐进来就是这里。
  // 通道只往房间左/下两侧的现成地板接，不会从贴着外墙的那两边硬凿出去。
  const entry = { x, y: y + H - 1 };
  // 1.3.0：地图扩到 120 之后，东北角那排侧房与主停车场之间隔着墙，
  // 只按「最近地板」接会把花园接到一条本身就不连通的房间带上 ——
  // 绿光出口因此被判成走不到。先做一次 BFS，只往真正从地图中心走得到的地板接。
  const reach = new Set();
  {
    const sx = Math.floor(size / 2), sy = Math.floor(size / 2);
    const stack = [];
    for (const [ax, ay] of [[sx, sy], [sx - 1, sy], [sx + 1, sy], [sx, sy - 1], [sx, sy + 1]]) {
      const k = ax + "," + ay;
      if (grid[ay] && grid[ay][ax] === 0 && !reach.has(k)) { reach.add(k); stack.push([ax, ay]); }
    }
    while (stack.length) {
      const [cx, cy] = stack.pop();
      for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = cx + d[0], ny = cy + d[1], k = nx + "," + ny;
        if (reach.has(k) || !grid[ny] || grid[ny][nx] !== 0) continue;
        reach.add(k); stack.push([nx, ny]);
      }
    }
  }
  const others = [...reach].map((k) => {
    const c = k.indexOf(","); return { x: +k.slice(0, c), y: +k.slice(c + 1) };
  });
  let best = null, bd = 1e9;
  for (const t of others) {
    if (t.x >= x && t.x < x + W && t.y >= y && t.y < y + H) continue;   // 跳过自己
    const d = Math.abs(t.x - entry.x) + Math.abs(t.y - entry.y);
    if (d < bd) { bd = d; best = t; }
  }
  if (best) carveCorridor(grid, size, entry.x, entry.y, best.x, best.y);
  else carveCorridor(grid, size, entry.x, entry.y,
    Math.max(1, x - 3), Math.min(size - 2, y + H + 2));

  // 新挖出来的地板补进 floors，后面的投放 / 连通检查才会认这块地方
  const garden = new Set();
  for (let yy = y; yy < y + H; yy++) {
    for (let xx = x; xx < x + W; xx++) {
      if (yy >= 0 && xx >= 0 && yy < size && xx < size && grid[yy][xx] === 0) {
        garden.add(xx + "," + yy);
        if (map.floors && map.floors[f]) map.floors[f].push({ x: xx, y: yy });
      }
    }
  }
  // 花园范围内的承重柱 / 车位线让位 —— carveRoom 已经把那些格子挖成草地了
  for (const arr of [map.pillarsByFloor, map.parkingByFloor]) {
    if (!arr || !arr[f] || typeof arr[f].delete !== "function") continue;
    for (const k of garden) arr[f].delete(k);
  }

  // 植被：地面全是草，草上还长着一丛丛的植株和垂下来的藤
  const props = [];
  const cells = [...garden].map((k) => {
    const p = k.split(","); return { x: +p[0], y: +p[1] };
  });
  for (const c of cells) {
    props.push({ x: c.x, y: c.y, floor: f, type: "bush12" });
    if (Math.random() < 0.45) props.push({ x: c.x, y: c.y, floor: f, type: "vine12" });
  }
  // 从停车场走到花园不该一刀切：沿入口往外铺三圈越来越稀的草，
  // 走过去是「植被渐渐密起来」，而不是凭空冒出一块草地。
  // 只铺在能走的地板上，且不并入 garden —— 外圈不会触发缠藤。
  for (let dy = -3; dy <= H + 2; dy++) {
    for (let dx = -3; dx <= W + 2; dx++) {
      const gx = x + dx, gy = y + dy;
      if (gx < 1 || gy < 1 || gx >= size - 1 || gy >= size - 1) continue;
      if (grid[gy][gx] !== 0) continue;
      if (gx >= x && gx < x + W && gy >= y && gy < y + H) continue;
      const d = Math.max(x - gx, gx - (x + W - 1), y - gy, gy - (y + H - 1), 0);
      if (d < 1 || d > 3) continue;
      const chance = d === 1 ? 0.62 : d === 2 ? 0.34 : 0.16;
      if (Math.random() < chance) props.push({ x: gx, y: gy, floor: f, type: "bush12" });
    }
  }
  for (let i = 0; i < 3; i++) {
    const c = cells[randInt(0, cells.length - 1)];
    if (c) props.push({ x: c.x, y: c.y, floor: f, type: "plant12" });
  }
  // 最深处：离入口最远的那一格，正好是东北角尖、贴着两条外墙。
  // 那里有一团从植被里透出来的绿光 —— 走进去就是 Level 1.2 砼苑。
  let deep = null, dd = -1;
  for (const c of cells) {
    const d = Math.abs(c.x - entry.x) + Math.abs(c.y - entry.y);
    if (d > dd) { dd = d; deep = { x: c.x, y: c.y }; }
  }
  if (!deep) deep = { x: x + W - 1, y };
  props.push({
    x: deep.x, y: deep.y, floor: f, type: "gardenglow12", toLevel: "1.2",
    tip: "植被最密的那头透出绿光",
  });

  const nook = { x, y, w: W, h: H, floor: f, entry, deep, cells: [...garden] };
  map.gardenNook = nook;
  map.garden = garden;
  map.gardenFloor = f;
  for (const pr of props) map.props.push(pr);
  // 连接走廊也得进可走地板表：以前只 push 房间那 16 格，
  // 验证器会误判「绿光周围没有能站的地板」。
  if (map.floors && typeof collectFloors === "function") {
    map.floors[f] = collectFloors(grid, size);
  }
  return nook;
};
