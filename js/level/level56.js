// ===========================================================
// Level 56 —— 冷冻致伤
//   一个由光滑的蓝冰组成的圆形洞穴系统，其中有一道来源不明的光线照亮了整个
//   层级。地面由潮湿的岩石组成，十分难以穿越且似乎永远向下延伸。层级内的
//   高度变化并不明显，但仍然比层级顶端的更陡峭。
//   温度随着靠近洞穴中心而降低：外围 32°F，中心低至 -459.67°F。该层级的
//   异常性质也被证明无法制造 150°F 以上的热源。
//   在冰中发现了许多元素的液态（氮、氦、氧、氢），多数无色、无味，并辐射出
//   与液体相同元素的气体 —— 未事先检查内容物，请勿饮用。
//   整个层级都能找到里面有医疗用品、斧头、撬棍、氧气罐、防寒服及其它保暖
//   衣物的木箱。防寒服 —— 类似于现代宇航服 —— 能让人忍受最冷的部分。箱子里
//   还能找到耐寒保温瓶，其中含杏仁水和液氮。箱子通常会被钉住，需要专门工具
//   撬开。
//   越靠近中心，冰越紧凑并形成刚性结构，地形更平坦；内部天花板上会形成冰柱，
//   可能掉落伤人。接触这里的冰是致命的 —— 它不会融化，但会把接触处的水分子
//   凝固，几乎将两个接触部分焊在一起，只有截除才可能治疗。
//   距核心约 90 米之外，气候与外太空相当：空气开始冻结并液化，底部积着大约
//   一英寸的液氧。四处可以找到冷冻的死亡实体化石，有些被一种丝状材料紧紧包裹。
//   中心是「奇点」：一个圆形房间，天花板上有几个大孔让大量光线射入，温度恒定
//   为绝对零度，空气冻结，形成了一个天然的真空室。应避免接触它的地板 —— 它会
//   更快地夺走热量。没有任何保护的话，人几乎立刻就会被冻死。
//   实体：数量稀少但均已适应寒冷，部分体表覆有厚厚的白色毛皮。可看到数量
//         超乎常理的尸鼠和死亡飞蛾；中心区域有一类似蜘蛛的实体，体表覆有
//         厚厚的白毛，在层级顶端的冰层中开凿隧道并攻击小型生物。
//   M.E.G. 冰川前哨 A（检查点，与中心之间可以找到红色旗帜，救援队的出发点）
//   M.E.G. 冰川前哨 B（专家采集证据的中转中心与研究站）
//   入口：在 Level 8 明显比较冷的地方（有冰块痕迹，但不明显）
//   出口：一个加宽的洞穴，其中有白雪覆盖的地形 -> Level 57
//         找到一个气闸门可以 -> Level 78（M.E.G 不建议任何人进入）
// ===========================================================
"use strict";

(function () {
  // 潮湿岩石的灰褐 / 光滑蓝冰（都不是黑的，也不是 Level 2 的管道）
  const v = ["#68625a", "#7fa8c8"];
  if (typeof regTile === "function") regTile("frost56", v);
  else { (window.__NEWTILE_EXTRA = window.__NEWTILE_EXTRA || {})["frost56"] = v; }
})();

// 冰里的液态元素：氮 / 氦 / 氧 / 氢（无色、无味，辐射出相同元素的气体）
const LIQ56 = [
  { n: "液氮", c: "rgba(200,225,255,.55)", d: "凑近闻了闻 —— 什么味也没有。你的眉毛结了一层白霜。" },
  { n: "液氦", c: "rgba(220,235,255,.50)", d: "罐口冒着看不见的气 —— 你吸进去的那口气在肺里凉了一下。" },
  { n: "液氧", c: "rgba(190,215,250,.55)", d: "淡蓝色的一汪。它正在慢慢地沸腾，一点声音也没有。" },
  { n: "液氢", c: "rgba(210,230,255,.48)", d: "看上去跟水一样。这里所有的液体看上去都跟水一样。" },
];
window.LIQ56 = LIQ56;

function generateFrost56Map(level) {
  const size = 116;
  const grid = makeGrid(size);
  const props = [];
  const floors = [];

  const CX = Math.round(size / 2), CY = Math.round(size / 2);
  const maxR = Math.floor(size / 2) - 4;

  const rock = new Set();     // 潮湿的岩石地面（外围）
  const ice = new Set();      // 紧实的冰（越靠里越硬、越平）
  const deep = new Set();     // 极寒区：空气冻结，底部积着液氧
  const sing = new Set();     // 奇点：绝对零度的圆形房间
  const cwall = new Set();    // 洞穴的冰壁（墙）
  const liq = new Set();      // 液态元素的水洼

  // 温度分区的半径
  const R1 = Math.round(maxR * 0.74);   // 外围 -> 中环
  const R2 = Math.round(maxR * 0.50);   // 中环 -> 内环
  const R3 = Math.round(maxR * 0.28);   // 内环 -> 核心区
  const RS = 8;                         // 奇点房间的半径

  // ---------- 整座圆形洞穴 ----------
  for (let y = 1; y < size - 1; y++) for (let x = 1; x < size - 1; x++) {
    const d = Math.hypot(x - CX, y - CY);
    if (d > maxR) { grid[y][x] = 1; cwall.add(x + "," + y); continue; }
    if (d <= RS) continue;              // 奇点那块单独处理
    grid[y][x] = 0;
    if (d > R1) rock.add(x + "," + y);
    else if (d > R2) ice.add(x + "," + y);
    else if (d > R3) ice.add(x + "," + y);
    else deep.add(x + "," + y);
  }

  // ---------- 环形的冰壁：把洞穴分成一圈圈的通道 ----------
  // 每圈留 3~4 个缺口 —— 那是通往更里面的路。
  const ringWall = (rad, gaps) => {
    for (let a = 0; a < Math.PI * 2; a += 0.012) {
      const x = Math.round(CX + Math.cos(a) * rad), y = Math.round(CY + Math.sin(a) * rad);
      if (x < 1 || y < 1 || x > size - 2 || y > size - 2) continue;
      grid[y][x] = 1;
      rock.delete(x + "," + y); ice.delete(x + "," + y); deep.delete(x + "," + y);
      cwall.add(x + "," + y);
    }
    for (let i = 0; i < gaps; i++) {
      const ga = (i / gaps) * Math.PI * 2 + rand(0, 0.6);
      for (let s = -2; s <= 2; s++) {
        const rr = rad + s;
        const x = Math.round(CX + Math.cos(ga) * rr), y = Math.round(CY + Math.sin(ga) * rr);
        if (x < 1 || y < 1 || x > size - 2 || y > size - 2) continue;
        grid[y][x] = 0; cwall.delete(x + "," + y);
        const d = Math.hypot(x - CX, y - CY);
        if (d > R1) rock.add(x + "," + y); else if (d > R3) ice.add(x + "," + y); else deep.add(x + "," + y);
      }
    }
  };
  ringWall(R1, 4);
  ringWall(R2, 3);
  ringWall(R3, 3);

  // ---------- 奇点：中心的圆形房间，只留一个口 ----------
  for (let a = 0; a < Math.PI * 2; a += 0.012) {
    const x = Math.round(CX + Math.cos(a) * RS), y = Math.round(CY + Math.sin(a) * RS);
    grid[y][x] = 1; cwall.add(x + "," + y);
    rock.delete(x + "," + y); ice.delete(x + "," + y); deep.delete(x + "," + y);
  }
  for (let y = CY - RS + 1; y < CY + RS; y++) for (let x = CX - RS + 1; x < CX + RS; x++) {
    if (Math.hypot(x - CX, y - CY) >= RS) continue;
    grid[y][x] = 0; sing.add(x + "," + y);
  }
  // 唯一那个口（朝下）
  for (let d = 0; d <= 1; d++) {
    const gy = CY + RS;
    for (const gx of [CX + d]) {
      grid[gy][gx] = 0; cwall.delete(gx + "," + gy); deep.add(gx + "," + gy);
    }
  }

  // ---------- 冰柱 / 石笋：把一圈圈的空间打散，才有洞穴的样子 ----------
  for (let i = 0; i < 46; i++) {
    const a = rand(0, Math.PI * 2);
    const rr = RS + 3 + rand(0, maxR - RS - 6);
    const cx = Math.round(CX + Math.cos(a) * rr), cy = Math.round(CY + Math.sin(a) * rr);
    const rad = 1 + randInt(0, 1);
    for (let y = cy - rad; y <= cy + rad; y++) for (let x = cx - rad; x <= cx + rad; x++) {
      if (x < 1 || y < 1 || x > size - 2 || y > size - 2) continue;
      if (Math.hypot(x - cx, y - cy) > rad) continue;
      if (sing.has(x + "," + y)) continue;
      grid[y][x] = 1;
      rock.delete(x + "," + y); ice.delete(x + "," + y); deep.delete(x + "," + y);
      cwall.add(x + "," + y);
    }
  }

  // ---------- 液态元素的水洼：无色、无味 ----------
  for (let i = 0; i < 14; i++) {
    const a = rand(0, Math.PI * 2);
    const rr = RS + 6 + rand(0, maxR - RS - 10);
    const cx = Math.round(CX + Math.cos(a) * rr), cy = Math.round(CY + Math.sin(a) * rr);
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const k = (cx + dx) + "," + (cy + dy);
      if (grid[cy + dy] && grid[cy + dy][cx + dx] === 0) liq.add(k);
    }
  }

  // ---------- 出生：外围，靠近岩壁的地方 ----------
  let start = null;
  for (let a = 0; a < Math.PI * 2 && !start; a += 0.05) {
    const rr = maxR - 5;
    const x = Math.round(CX + Math.cos(a) * rr), y = Math.round(CY + Math.sin(a) * rr);
    if (grid[y] && grid[y][x] === 0) start = { x, y, floor: 0 };
  }
  if (!start) start = { x: CX, y: CY - maxR + 5, floor: 0 };

  // ---------- 连通性兜底：把走不到的区块凿开接回主网络 ----------
  // 冰柱是随机撒的，完全可能把某一圈切死 —— 那样整块就变成看得见进不去的摆设。
  {
    const inb = (x, y) => x >= 1 && y >= 1 && x < size - 1 && y < size - 1;
    for (let iter = 0; iter < 24; iter++) {
      const seen = new Set();
      const q = [[start.x, start.y]];
      seen.add(start.x + "," + start.y);
      while (q.length) {
        const [x, y] = q.pop();
        for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = x + d[0], ny = y + d[1], k = nx + "," + ny;
          if (!inb(nx, ny) || seen.has(k) || grid[ny][nx] !== 0) continue;
          seen.add(k); q.push([nx, ny]);
        }
      }
      // 找出所有走不到的地面
      const bad = [];
      for (let y = 1; y < size - 1; y++) for (let x = 1; x < size - 1; x++) {
        if (grid[y][x] === 0 && !seen.has(x + "," + y)) bad.push([x, y]);
      }
      if (!bad.length) break;
      // 挑一个走不到的，凿一条线接回主网络
      const [bx, by] = bad[Math.floor(bad.length / 2)];
      let best = null, bd = Infinity;
      for (const k of seen) {
        const [rx, ry] = k.split(",").map(Number);
        const d = Math.hypot(rx - bx, ry - by);
        if (d < bd) { bd = d; best = [rx, ry]; }
      }
      if (!best) break;
      const steps = Math.ceil(bd);
      for (let s = 0; s <= steps; s++) {
        const x = Math.round(bx + (best[0] - bx) * (s / steps));
        const y = Math.round(by + (best[1] - by) * (s / steps));
        if (!inb(x, y)) continue;
        const dd = Math.hypot(x - CX, y - CY);
        if (dd <= RS) continue;                 // 别把奇点的墙凿穿
        grid[y][x] = 0; cwall.delete(x + "," + y);
        if (dd > R1) rock.add(x + "," + y); else if (dd > R3) ice.add(x + "," + y); else deep.add(x + "," + y);
      }
    }
  }

  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return null;
    if (grid[y][x] !== 0) return null;
    const p = Object.assign({ x, y, floor: 0, type }, extra || {});
    props.push(p);
    return p;
  };
  // 在外圈 / 中圈 / 内圈各挑一个能站的格子
  const pickIn = (rMin, rMax) => {
    for (let a = 0; a < 400; a++) {
      const ang = rand(0, Math.PI * 2);
      const rr = rMin + rand(0, rMax - rMin);
      const x = Math.round(CX + Math.cos(ang) * rr), y = Math.round(CY + Math.sin(ang) * rr);
      if (grid[y] && grid[y][x] === 0 && !sing.has(x + "," + y)) return { x, y };
    }
    return null;
  };

  // ---------- M.E.G. 冰川前哨 A：外围的检查点 ----------
  const pa = pickIn(maxR * 0.80, maxR - 3);
  const outA = pa ? put(pa.x, pa.y, "p56outpostA") : null;
  // 前哨 A 与中心之间的红色旗帜
  for (let i = 0; i < 6; i++) {
    const t = pickIn(maxR * (0.30 + i * 0.09), maxR * (0.40 + i * 0.09));
    if (t) put(t.x, t.y, "p56flag");
  }
  // ---------- M.E.G. 冰川前哨 B：中圈的中转中心与研究站 ----------
  const pb = pickIn(R2 + 4, R1 - 4);
  const outB = pb ? put(pb.x, pb.y, "p56outpostB") : null;

  // ---------- 木箱：钉住了，得用撬棍撬开 ----------
  for (let i = 0; i < 9; i++) {
    const t = pickIn(RS + 4, maxR - 4);
    if (!t) continue;
    const c = put(t.x, t.y, "p56crate", { nailed: true });
    if (c) c.give = i < 5 ? "coldsuit" : "almond";
  }

  // ---------- 液态元素：一罐罐地摆着 ----------
  for (let i = 0; i < 8; i++) {
    const t = pickIn(RS + 5, maxR - 6);
    if (t) put(t.x, t.y, "p56canister", { idx: randInt(0, LIQ56.length - 1) });
  }

  // ---------- 冷冻的死亡实体化石，被丝状材料紧紧包裹 ----------
  for (let i = 0; i < 7; i++) {
    const t = pickIn(R3, maxR - 5);
    if (t) put(t.x, t.y, "p56fossil");
  }

  // ---------- 天花板上的冰柱：会掉下来 ----------
  for (let i = 0; i < 16; i++) {
    const t = pickIn(RS + 4, maxR - 5);
    if (t) put(t.x, t.y, "p56icicle");
  }

  // ---------- 出口一：一个加宽的洞穴，其中有白雪覆盖的地形 -> Level 57 ----------
  const pc = pickIn(maxR * 0.72, maxR - 5);
  const cave57 = pc ? put(pc.x, pc.y, "p56cave57", { toLevel: 57 }) : null;
  if (cave57) { cave57.tip = "一段加宽的洞穴 —— 里面覆着一层白雪"; }
  if (pc) {
    // 白雪覆盖的地形：洞穴里那一小块是白的
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      const k = (pc.x + dx) + "," + (pc.y + dy);
      if (grid[pc.y + dy] && grid[pc.y + dy][pc.x + dx] === 0) snow56.add(k);
    }
  }

  // ---------- 出口二：一扇气闸门 -> Level 78 ----------
  const pd = pickIn(R2 + 2, R1 - 2);
  const airlock = pd ? put(pd.x, pd.y, "p56airlock78", { toLevel: 78 }) : null;
  if (airlock) airlock.tip = "一扇气闸门 —— 门上结着霜，M.E.G 不建议任何人进去";

  // ---------- 奇点：天花板上的那几个大孔 ----------
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.5;
    const x = Math.round(CX + Math.cos(a) * 4), y = Math.round(CY + Math.sin(a) * 4);
    if (grid[y] && grid[y][x] === 0) put(x, y, "p56hole");
  }

  // ---------- 一根撬棍：摆在出生点附近（不然箱子根本撬不开） ----------
  const ground = [
    { x: start.x, y: start.y, floor: 0, item: "crowbar", taken: false },
  ];
  for (let i = 0; i < 3; i++) {
    const t = pickIn(maxR * 0.78, maxR - 5);
    if (t) ground.push({ x: t.x, y: t.y, floor: 0, item: "almond", taken: false });
  }

  collectFloorsInto(grid, size, floors);

  return {
    size, level: 56, doubleStory: false,
    layers: [grid], grid, rooms: [[]], floors: [floors],
    start, exit: null, doors: [], ramps: [],
    props, crates: [], ground,

    style: "frost56",
    tileName: "frost56",
    cx56: CX, cy56: CY, maxR56: maxR,
    r1_56: R1, r2_56: R2, r3_56: R3, rs56: RS,
    rock56: rock, ice56: ice, deep56: deep, sing56: sing,
    cwall56: cwall, liq56: liq, snow56: snow56,
    outA56: outA, outB56: outB, cave57_56: cave57, airlock56: airlock,
  };
}
window.generateFrost56Map = generateFrost56Map;

// 白雪覆盖的那一小块（洞穴 -> Level 57）
const snow56 = new Set();

// ---------------- 地面 ----------------
window.drawFrost56Floor = function (ctx, px, py, S, map, tx, ty) {
  const k = tx + "," + ty;
  const t = performance.now() / 1000;
  const h = hash2(tx, ty);
  // 奇点：亮得刺眼 —— 天花板那几个大孔射进来的光
  if (map.sing56 && map.sing56.has(k)) {
    ctx.fillStyle = "#e6eef6";
    ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(255,255,255,.55)";
    ctx.fillRect(px, py, S, 2);
    ctx.fillStyle = "rgba(150,190,230,.35)";
    ctx.fillRect(px + 2, py + 3, S - 4, S - 6);
    // 冻住的空气：一层一层的白霜
    if (h > 0.5) {
      ctx.strokeStyle = "rgba(255,255,255,.5)"; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px + 2, py + S * 0.7); ctx.lineTo(px + S - 3, py + S * 0.3);
      ctx.stroke();
    }
    return true;
  }
  // 白雪覆盖的地形（出口那个洞穴）
  if (map.snow56 && map.snow56.has(k)) {
    ctx.fillStyle = "#e8eef4";
    ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(190,210,232,.55)";
    ctx.fillRect(px, py + S * 0.55, S, S * 0.45);
    ctx.fillStyle = "rgba(255,255,255,.65)";
    ctx.fillRect(px + (h * S | 0) % (S - 4), py + ((h * 71) % (S - 4) | 0), 3, 3);
    return true;
  }
  // 液态元素的水洼：无色，只看得出一点反光
  if (map.liq56 && map.liq56.has(k)) {
    ctx.fillStyle = "#5e6a74";
    ctx.fillRect(px, py, S, S);
    const w = Math.sin(t * 1.4 + tx * 0.5 + ty * 0.4);
    ctx.fillStyle = "rgba(200,225,255," + (0.22 + w * 0.10).toFixed(3) + ")";
    ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(255,255,255," + (0.10 + w * 0.06).toFixed(3) + ")";
    ctx.fillRect(px, py + ((t * 6 + tx * 4) % S), S, 2);
    return true;
  }
  // 核心区：极寒 —— 空气已经冻结，底部积着大约一英寸的液氧
  if (map.deep56 && map.deep56.has(k)) {
    ctx.fillStyle = "#b6c6d6";
    ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(210,235,255,.45)";
    ctx.fillRect(px, py + S * 0.72, S, S * 0.28);   // 液氧
    ctx.fillStyle = "rgba(255,255,255,.30)";
    ctx.fillRect(px, py, S, 2);
    // 白霜
    if (h > 0.55) {
      ctx.fillStyle = "rgba(255,255,255,.45)";
      ctx.fillRect(px + 4, py + 4, 3, 3);
      ctx.fillRect(px + S - 8, py + S - 7, 3, 3);
    }
    return true;
  }
  // 中圈 / 内圈：紧实的冰，地形更平坦
  if (map.ice56 && map.ice56.has(k)) {
    ctx.fillStyle = "#7fa8c8";
    ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(200,230,250,.30)";
    ctx.fillRect(px, py, S, 2.5);
    ctx.fillStyle = "rgba(60,100,140,.25)";
    if (h > 0.68) ctx.fillRect(px + 3, py + 5, S - 8, 2);
    // 冰面的裂纹
    if (h < 0.12) {
      ctx.strokeStyle = "rgba(240,250,255,.40)"; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px + 2, py + S * 0.3); ctx.lineTo(px + S - 3, py + S * 0.62);
      ctx.stroke();
    }
    return true;
  }
  // 外围：潮湿的岩石，十分难以穿越
  ctx.fillStyle = "#68625a";
  ctx.fillRect(px, py, S, S);
  ctx.fillStyle = "rgba(40,38,34,.30)";
  ctx.fillRect(px, py + S * 0.62, S, S * 0.38);
  if (h > 0.5) {
    ctx.fillStyle = "rgba(140,134,122,.35)";
    ctx.fillRect(px + (h * S * 0.6 | 0), py + ((h * 47) % (S - 8) | 0) + 3, 6, 4);
  }
  // 潮湿的反光
  ctx.fillStyle = "rgba(180,200,215,.14)";
  ctx.fillRect(px, py, S, 2);
  return true;
};

// ---------------- 墙：光滑的蓝冰 ----------------
window.drawFrost56Wall = function (ctx, px, py, S, map, tx, ty) {
  const t = performance.now() / 1000;
  const h = hash2(tx, ty);
  // 洞穴的冰壁：蓝冰，一层层的 —— 地面最亮处是 (182,198,214)，墙明显更暗
  ctx.fillStyle = "#3f5f7a";
  ctx.fillRect(px, py, S, S);
  ctx.fillStyle = "rgba(160,205,235,.30)";
  ctx.fillRect(px, py, S, 3);
  ctx.fillStyle = "rgba(20,40,60,.35)";
  ctx.fillRect(px, py + S * 0.45, S, 3);
  ctx.fillRect(px, py + S * 0.80, S, 2);
  // 冰里封着的气泡
  if (h > 0.62) {
    ctx.fillStyle = "rgba(220,240,255,.35)";
    ctx.beginPath();
    ctx.arc(px + S * (0.25 + h * 0.5), py + S * (0.3 + ((h * 97) % 40) / 100), S * 0.08, 0, Math.PI * 2);
    ctx.fill();
  }
  // 那道来源不明的光在冰壁上晃
  const sh = Math.sin(t * 0.5 + tx * 0.2 + ty * 0.2) * 0.5 + 0.5;
  ctx.fillStyle = "rgba(190,220,250," + (0.04 + sh * 0.05).toFixed(3) + ")";
  ctx.fillRect(px, py, S, S);
  return true;
};

// ---------------- 环境：冷 + 那道来源不明的光 ----------------
window.drawFrost56 = function (ctx, g) {
  const cw = (ctx.canvas && ctx.canvas.width) || 800;
  const ch = (ctx.canvas && ctx.canvas.height) || 600;
  const t = performance.now() / 1000;
  const m = g && g.map;
  ctx.save();
  try { ctx.setTransform(1, 0, 0, 1, 0, 0); } catch (e) { /* 忽略 */ }

  // 越靠近中心越冷 —— 画面越往里越白、越刺眼
  let cold = 0;
  if (m && m.r1_56 != null) {
    const tx = Math.floor(g.player.x / TILE), ty = Math.floor(g.player.y / TILE);
    const d = Math.hypot(tx - m.cx56, ty - m.cy56);
    cold = Math.max(0, Math.min(1, 1 - d / (m.r1_56 * 1.15)));
  }
  // 冷气：屏幕边缘结霜
  const vg = ctx.createRadialGradient(cw / 2, ch / 2, Math.min(cw, ch) * 0.30,
    cw / 2, ch / 2, Math.max(cw, ch) * 0.72);
  vg.addColorStop(0, "rgba(255,255,255,0)");
  vg.addColorStop(1, "rgba(226,242,255," + (0.16 + cold * 0.34).toFixed(3) + ")");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, cw, ch);
  // 呼出来的白气
  const br = 0.10 + Math.sin(t * 1.6) * 0.05;
  ctx.fillStyle = "rgba(255,255,255," + (br * (0.5 + cold)).toFixed(3) + ")";
  ctx.fillRect(0, 0, cw, ch);
  // 飘着的雪 / 霜
  for (let i = 0; i < 40; i++) {
    const sx = (i * 83.7 + t * (14 + (i % 4) * 6)) % (cw + 40) - 20;
    const sy = (i * 47.1 + t * 26) % (ch + 30) - 15;
    ctx.fillStyle = "rgba(255,255,255,.35)";
    ctx.fillRect(sx, sy, 1.6, 1.6);
  }
  ctx.restore();
};

// ================= 物件 =================
window.PROP_DRAW = window.PROP_DRAW || {};

// M.E.G. 冰川前哨 A：检查点
window.PROP_DRAW["p56outpostA"] = function (ctx, p, T) {
  const w = T * 0.92, h = T * 0.82;
  ctx.fillStyle = "#4a5a68";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#6b7d8c";
  ctx.fillRect(-w / 2, -h / 2, w, h * 0.22);
  ctx.fillStyle = "#c8d8e4";                       // 窗
  ctx.fillRect(-w * 0.34, -h * 0.10, w * 0.26, h * 0.26);
  ctx.fillRect(w * 0.08, -h * 0.10, w * 0.26, h * 0.26);
  ctx.fillStyle = "#e8c22a";                       // M.E.G 的标记
  ctx.fillRect(-w * 0.10, h * 0.16, w * 0.20, h * 0.14);
  ctx.strokeStyle = "rgba(20,30,40,.6)"; ctx.lineWidth = 1;
  ctx.strokeRect(-w / 2 + 0.5, -h / 2 + 0.5, w - 1, h - 1);
};
// M.E.G. 冰川前哨 B：中转中心与研究站
window.PROP_DRAW["p56outpostB"] = function (ctx, p, T) {
  const w = T * 0.92, h = T * 0.82;
  ctx.fillStyle = "#54657a";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#7d8fa4";
  ctx.fillRect(-w / 2, -h / 2, w, h * 0.20);
  ctx.fillStyle = "#c8d8e4";
  ctx.fillRect(-w * 0.36, -h * 0.12, w * 0.20, h * 0.24);
  ctx.fillRect(-w * 0.06, -h * 0.12, w * 0.20, h * 0.24);
  ctx.fillRect(w * 0.22, -h * 0.12, w * 0.14, h * 0.24);
  ctx.fillStyle = "#e8c22a";
  ctx.fillRect(-w * 0.42, h * 0.16, w * 0.16, h * 0.12);
  ctx.fillRect(w * 0.26, h * 0.16, w * 0.16, h * 0.12);
  ctx.strokeStyle = "rgba(20,30,40,.6)"; ctx.lineWidth = 1;
  ctx.strokeRect(-w / 2 + 0.5, -h / 2 + 0.5, w - 1, h - 1);
};
// 红色旗帜：前哨 A 与中心之间
window.PROP_DRAW["p56flag"] = function (ctx, p, T) {
  const t = performance.now() / 1000;
  const w = T * 0.30, h = T * 0.86;
  ctx.fillStyle = "#8a949c";
  ctx.fillRect(-1.5, -h / 2, 3, h);
  const flap = Math.sin(t * 2 + p.x) * 2;
  ctx.fillStyle = "#c8443a";
  ctx.beginPath();
  ctx.moveTo(1.5, -h / 2 + 2);
  ctx.lineTo(1.5 + w + flap, -h / 2 + h * 0.16);
  ctx.lineTo(1.5, -h / 2 + h * 0.32);
  ctx.closePath();
  ctx.fill();
};
// 木箱：钉住了，得用撬棍撬开
window.PROP_DRAW["p56crate"] = function (ctx, p, T) {
  const w = T * 0.78, h = T * 0.64;
  ctx.fillStyle = "#8a6a42";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.strokeStyle = "rgba(70,50,28,.6)"; ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-w / 2, -h / 2); ctx.lineTo(w / 2, h / 2);
  ctx.moveTo(w / 2, -h / 2); ctx.lineTo(-w / 2, h / 2);
  ctx.stroke();
  ctx.strokeRect(-w / 2 + 0.5, -h / 2 + 0.5, w - 1, h - 1);
  // 钉住的铁条
  ctx.fillStyle = "#9aa2a8";
  ctx.fillRect(-w / 2, -h * 0.16, w, 3);
  ctx.fillRect(-w / 2, h * 0.14, w, 3);
  ctx.fillStyle = "#c8ccd0";                       // 钉头
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(-w / 2 + 2 + i * (w - 4) / 4, -h * 0.18, 2.5, 2.5);
  }
};
// 耐寒保温瓶 / 液态元素
window.PROP_DRAW["p56canister"] = function (ctx, p, T) {
  const idx = (p.idx | 0) % LIQ56.length;
  const w = T * 0.36, h = T * 0.62;
  ctx.fillStyle = "#8a949c";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#b9c0c6";
  ctx.fillRect(-w / 2, -h / 2, w * 0.30, h);
  ctx.fillStyle = "#4a545c";                       // 瓶口
  ctx.fillRect(-w * 0.16, -h / 2 - 3, w * 0.32, 4);
  ctx.fillStyle = LIQ56[idx].c;                    // 里面的液体：无色，只看得出一点反光
  ctx.fillRect(-w * 0.34, -h * 0.10, w * 0.68, h * 0.42);
  ctx.fillStyle = "rgba(255,255,255,.40)";
  ctx.fillRect(-w * 0.34, -h * 0.10, w * 0.68, 2);
};
// 冷冻的死亡实体化石，被一种丝状材料紧紧包裹
window.PROP_DRAW["p56fossil"] = function (ctx, p, T) {
  const w = T * 0.70, h = T * 0.58;
  ctx.fillStyle = "#7a8288";
  ctx.beginPath();
  ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#9aa2a8";                       // 冻在冰里的骨架
  ctx.fillRect(-w * 0.30, -h * 0.06, w * 0.60, 3);
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(-w * 0.24 + i * w * 0.16, -h * 0.22, 2, h * 0.44);
  }
  ctx.strokeStyle = "rgba(240,240,225,.70)"; ctx.lineWidth = 1;  // 丝状材料
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(-w * 0.42, -h * 0.30 + i * h * 0.16);
    ctx.lineTo(w * 0.42, -h * 0.22 + i * h * 0.16);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(226,242,255,.30)";
  ctx.beginPath(); ctx.ellipse(0, 0, w / 2 + 2, h / 2 + 2, 0, 0, Math.PI * 2); ctx.fill();
};
// 天花板上的冰柱：会掉下来
window.PROP_DRAW["p56icicle"] = function (ctx, p, T) {
  const t = performance.now() / 1000;
  const w = T * 0.34, h = T * 0.70;
  ctx.fillStyle = "#c8e0f0";
  ctx.beginPath();
  ctx.moveTo(-w / 2, -h / 2);
  ctx.lineTo(w / 2, -h / 2);
  ctx.lineTo(0, h / 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.55)";
  ctx.beginPath();
  ctx.moveTo(-w * 0.16, -h / 2);
  ctx.lineTo(0, h / 2 - 4);
  ctx.lineTo(w * 0.06, -h / 2);
  ctx.closePath();
  ctx.fill();
  // 尖端那滴将落未落的水
  const dy = ((t * 30 + p.x * 7) % 40);
  ctx.fillStyle = "rgba(220,240,255,.75)";
  ctx.fillRect(-1, h / 2 + dy * 0.10, 2, 3);
};
// 奇点天花板上那几个大孔
window.PROP_DRAW["p56hole"] = function (ctx, p, T) {
  const t = performance.now() / 1000;
  const w = T * 0.62, h = T * 0.52;
  ctx.fillStyle = "#f6fbff";
  ctx.beginPath();
  ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  const gl = 0.45 + Math.sin(t * 0.8 + p.x) * 0.16;
  ctx.fillStyle = "rgba(255,255,255," + gl.toFixed(3) + ")";
  ctx.beginPath();
  ctx.ellipse(0, 0, w * 0.80, h * 0.90, 0, 0, Math.PI * 2);
  ctx.fill();
  // 射进来的那道光
  ctx.fillStyle = "rgba(255,255,255,.30)";
  ctx.beginPath();
  ctx.moveTo(-w * 0.20, h * 0.30);
  ctx.lineTo(w * 0.20, h * 0.30);
  ctx.lineTo(w * 0.46, h * 1.10);
  ctx.lineTo(-w * 0.46, h * 1.10);
  ctx.closePath();
  ctx.fill();
};
// 出口一：加宽的洞穴，里面有白雪覆盖的地形 -> Level 57
window.PROP_DRAW["p56cave57"] = function (ctx, p, T) {
  const w = T * 0.96, h = T * 0.96;
  ctx.fillStyle = "#2f4256";                       // 洞口：冰壁上的一个豁口
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#e8eef4";                       // 里面覆着白雪
  ctx.beginPath();
  ctx.moveTo(-w * 0.40, h * 0.44);
  ctx.quadraticCurveTo(-w * 0.10, -h * 0.10, 0, h * 0.20);
  ctx.quadraticCurveTo(w * 0.16, h * 0.44, w * 0.42, h * 0.44);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(180,205,230,.55)";
  ctx.fillRect(-w * 0.40, h * 0.34, w * 0.82, 3);
  ctx.fillStyle = "rgba(255,255,255,.35)";         // 洞口冒出来的寒气
  ctx.fillRect(-w / 2, -h / 2, w, 3);
};
// 出口二：一扇气闸门 -> Level 78
window.PROP_DRAW["p56airlock78"] = function (ctx, p, T) {
  const w = T * 0.92, h = T * 0.96;
  ctx.fillStyle = "#6b7580";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#8a949c";
  ctx.fillRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8);
  ctx.strokeStyle = "#4a545c"; ctx.lineWidth = 2;  // 圆形的舱门
  ctx.beginPath(); ctx.arc(0, 0, w * 0.28, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = "#c8d8e4";
  ctx.beginPath(); ctx.arc(0, 0, w * 0.14, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#e8c22a";                       // 手轮
  ctx.fillRect(-w * 0.06, -h * 0.06, w * 0.12, 3);
  ctx.fillRect(-1.5, -h * 0.06, 3, h * 0.12);
  ctx.fillStyle = "rgba(226,242,255,.55)";         // 门上结的霜
  ctx.fillRect(-w / 2, -h / 2, w, 3);
  ctx.fillRect(-w / 2, h / 2 - 3, w, 3);
};
