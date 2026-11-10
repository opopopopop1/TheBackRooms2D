// ===========================================================
// Level 63 —— 宁静 / Level 63.3 —— 安眠天堂
//   63：广阔天空上架着稀疏的橡木桥与平台，远处一堵不断重组的绿色藤蔓墙；
//       太阳一直绕着走，层级始终是白天。冥想点是孤立的小圆台，中心一张长凳。
//       从栏杆破损处掉进虚空，一半到 Level 39、一半到 Level 797。
//   63.3：一条 2 米宽、没有尽头的木桥；夜空沿用 63 / 30 那套连续天空画法
//       （一次画完的渐变 + 离散漂移的云团），只是换成夜紫配色并点缀繁星，
//       桥下是会消散的紫雾、有来源不明的钢琴声；睡一觉天就亮，星星、
//       紫雾与音乐一起消失，换成压得很低的厚云。跳进雾气 → 46，切桥 → 63。
// ===========================================================
"use strict";

(function () {
  const a = ["#a97c4e", "#c8d4de"];   // 橡木桥 / 天空
  const b = ["#c09a6c", "#3b1d63"];   // 光滑木桥 / 夜紫天空
  if (typeof regTile === "function") { regTile("sky63", a); regTile("sleep633", b); }
  else {
    const e = (window.__NEWTILE_EXTRA = window.__NEWTILE_EXTRA || {});
    e["sky63"] = a; e["sleep633"] = b;
  }
})();

function s63Hash(x, y) {
  let h = ((x | 0) * 374761393 + (y | 0) * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) | 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// ---------- Level 63：桥网 ----------
function generateSky63Map(level) {
  const size = 104, grid = makeGrid(size);
  const carveH = (y0, y1, x0, x1) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++)
      if (x > 1 && y > 1 && x < size - 2 && y < size - 2) grid[y][x] = 0;
  };
  // 横向主桥 6 条 + 纵向主桥 6 条，织成密集路径网；全部 2~3 格宽
  for (const y of [12, 28, 44, 60, 76, 90]) carveH(y, y + 1, 4, size - 5);
  for (const x of [10, 26, 42, 58, 74, 90]) carveH(4, size - 5, x, x + 1);
  // 几段斜桥（云梯似的连接）
  for (let i = 0; i < 34; i++) {
    let x = 10 + (i * 17) % 84, y = 12;
    for (let s = 0; s < 10; s++) { carveH(y, y + 1, x, x + 1); x += (s % 3 === 0 ? 1 : 0); y += 1; }
  }
  // 平台：每个交汇处拓成 5×5 的木台
  for (const y of [12, 28, 44, 60, 76, 90]) for (const x of [10, 26, 42, 58, 74, 90]) carveH(y - 2, y + 2, x - 2, x + 2);
  // 冥想点：脱离桥网的孤立小圆台（离主路 6 格以上），用一小段窄桥接回去
  const med = [];
  for (const [x, y] of [[36, 20], [68, 36], [20, 68], [82, 82]]) {
    carveH(y - 1, y + 1, x - 1, x + 1);
    // 接一段单格窄桥到最近的主桥
    const ty = [12, 28, 44, 60, 76, 90].reduce((a, b) => Math.abs(b - y) < Math.abs(a - y) ? b : a);
    for (let yy = Math.min(y, ty); yy <= Math.max(y, ty); yy++) grid[yy][x] = 0;
    med.push({ x, y });
  }
  const floors = collectFloors(grid, size);
  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [[]],
    start: { x: 43, y: 45, floor: 0 },
    exit: null, doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props: [], crates: [], ground: [], spawnPts: [{ x: 43, y: 45, floor: 0 }],
    s63sun: 0, wander: null,
  };
  makeDoorsMap(map);
  const P = (x, y, type, extra) => map.props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  for (const m of med) P(m.x, m.y, "s63meditate", { iKind: "s63meditate" });
  // 栏杆破损处：三处，验证器认 39，实际交互各半 39 / 797
  for (const [x, y] of [[16, 28], [50, 60], [84, 76]]) {
    P(x, y, "s63gap", { toLevel: 39, tip: "一截栏杆断了 —— 底下是望不到底的虚空", iKind: "s63gap" });
  }
  // 平台上的栏杆、云梯、单杠（装饰）
  for (let i = 0; i < 46; i++) {
    const f = floors[Math.floor(Math.random() * floors.length)];
    P(f.x, f.y, ["s63rail", "s63ladder", "s63bar"][i % 3]);
  }
  return map;
}
window.generateSky63Map = generateSky63Map;

// ---------- Level 63.3：一条桥 ----------
function generateSleep633Map(level) {
  const size = 96, grid = makeGrid(size);
  // 桥面 y 随 x 起伏，所有出生点 / 物件 / 出口都必须按这个 y 落位，
  // 不能写死 48 —— 否则会落进桥外的墙里（出生点尤其会一进层就卡住）。
  const bY = (x) => 48 + Math.round(Math.sin(x * 0.12) * 2);
  // 2 格宽、横贯全图的木桥，中段轻微起伏（仍是"没有尽头"的那条桥）
  for (let x = 2; x < size - 2; x++) {
    const y = bY(x);
    grid[y][x] = 0; grid[y + 1][x] = 0;
    if (x % 17 === 0) { // 偶有一小段加宽的观望台
      grid[y - 1][x] = 0; grid[y + 2][x] = 0;
    }
  }
  const floors = collectFloors(grid, size);
  const sy = bY(8);
  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [[]],
    start: { x: 8, y: sy, floor: 0 },
    exit: null, doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props: [], crates: [], ground: [], spawnPts: [{ x: 8, y: sy, floor: 0 }],
    s633day: false, wander: null,
  };
  makeDoorsMap(map);
  const P = (x, y, type, extra) => map.props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  // 可以睡一觉的地方（桥上几处铺着毯子的凹位）
  for (const x of [22, 46, 68]) P(x, bY(x), "s633bed", { iKind: "s633bed" });
  // 跳进紫雾 → 46：放在 x=34 的观望台加宽格（桥外一格，但仍是能站的地板）；
  // 切入桥面 → 63：放在桥面上。
  P(34, bY(34) + 2, "s633fog", { toLevel: 46, tip: "桥外的紫雾厚得像水 —— 跳下去就会落到别处" });
  P(74, bY(74), "s633clip", { toLevel: 63, tip: "这一段桥面看着有点薄 —— 切进去" });
  // 栏杆与灯（装饰）
  for (let x = 6; x < size - 6; x += 6) P(x, bY(x), "s633rail");
  return map;
}
window.generateSleep633Map = generateSleep633Map;

// ---------- 每帧 ----------
window.__LEVEL_TICK = window.__LEVEL_TICK || {};
window.__LEVEL_TICK["63"] = function (g, dt) {
  window.__B2_enter(g, "63", () => { g.s63sun = 0; });
  g.s63sun = (g.s63sun || 0) + (dt || 0.016) * 0.22;
};
window.__LEVEL_TICK["63.3"] = function (g, dt) {
  window.__B2_enter(g, "63.3", () => { g.s633day = false; g.s633time = 0; g.s633yawn = false; });
  g.s633time = (g.s633time || 0) + (dt || 0.016);
  if (!g.s633day && g.s633time > 26 && !g.s633yawn) {
    g.s633yawn = true;
    window.__toast("不知从哪来的钢琴声，慢得让人眼皮发沉 —— 桥上铺着毯子，可以睡一觉");
  }
};

// ---------- 63 地面 / 天空 ----------
window.drawSky63Floor = function (ctx, px, py, S, map, tx, ty) {
  // 桥是架空的：先在下沿画一道落到云上的冷灰投影，只有这一格下方是虚空时才画
  // （下方仍铺着桥的话，那格会把自己盖上来，投影自然只留在桥网的外缘）。
  const layer = map && map.layers && map.layers[0];
  const belowVoid = layer && (!layer[ty + 1] || layer[ty + 1][tx] === 1);
  if (belowVoid) {
    ctx.fillStyle = "rgba(64,78,98,.11)";
    ctx.fillRect(px + S * 0.05, py + S * 0.84, S * 0.96, S * 0.40);
  }
  ctx.fillStyle = "#a97c4e";
  ctx.fillRect(px, py, S, S);
  // 橡木板：横向板缝 + 木纹
  ctx.fillStyle = "rgba(90,56,28,.30)";
  ctx.fillRect(px, py + S * 0.48, S, Math.max(1, S * 0.05));
  ctx.fillStyle = "rgba(255,222,170,.14)";
  ctx.fillRect(px, py + S * 0.06, S, Math.max(1, S * 0.05));
  const r = s63Hash(tx, ty);
  ctx.fillStyle = "rgba(60,36,18,.18)";
  ctx.fillRect(px + S * r * 0.7, py + S * 0.18, S * 0.22, S * 0.03);
  ctx.fillRect(px + S * (1 - r) * 0.6, py + S * 0.72, S * 0.18, S * 0.03);
  // 板子朝外的侧边：一道亮边 + 一道暗边，看出厚度，不是贴在地面的一张贴图
  if (belowVoid) {
    ctx.fillStyle = "rgba(255,226,178,.30)";
    ctx.fillRect(px, py + S * 0.90, S, Math.max(1, S * 0.045));
    ctx.fillStyle = "rgba(48,32,18,.42)";
    ctx.fillRect(px, py + S * 0.955, S, Math.max(1, S * 0.045));
  }
  return true;
};
window.drawSky63Wall = function (ctx, px, py, S, map, tx, ty) {
  // 桥与桥之间是空气，不是地面。整片天空和浮云由 drawSky63Sky 画在瓦片之前，
  // 这里只留一层几乎透明的空气色，让底下的云透出来。
  // 以前这里逐格画蓝渐变 + 三条藤条，拼起来就是一片"铺在地上的海"。
  ctx.fillStyle = "rgba(228,240,250,0.09)";
  ctx.fillRect(px, py, S, S);
  return true;
};

// ---------- 63 天空 / 浮云（画在所有瓦片之前） ----------
// 云不是铺在地面上的贴图：它们是离散的、有顶光和底影的团块，跨很多格，
// 分三层以不同速度缓慢漂移，团与团之间留出大片天空。桥画在它们上面，
// 于是看起来是「桥悬在云上」，而不是「云当地板」。
function s63CloudPuff(ctx, x, y, R, tint, alpha, seed, opt) {
  const o = opt || {};
  const sh1 = o.shade || "88,118,154";
  const sh2 = o.shade2 || "116,144,176";
  const hiC = o.hi || "255,250,232";
  const hiA = (o.hiA == null) ? 0.42 : o.hiA;
  ctx.save();
  ctx.globalAlpha = alpha;
  // 云底：一整片柔边阴影，云才有厚度、才像悬在空中而不是贴在地上。
  // 底影和顶光的颜色由天空配色决定 —— 白天偏蓝灰，63.3 夜里偏紫。
  const sh = ctx.createRadialGradient(x, y + R * 0.30, R * 0.08, x, y + R * 0.30, R * 1.18);
  sh.addColorStop(0, "rgba(" + sh1 + ",0.62)");
  sh.addColorStop(0.58, "rgba(" + sh2 + ",0.34)");
  sh.addColorStop(1, "rgba(" + sh2 + ",0)");
  ctx.fillStyle = sh;
  ctx.beginPath();
  ctx.ellipse(x, y + R * 0.32, R * 1.16, R * 0.54, 0, 0, Math.PI * 2);
  ctx.fill();
  // 主体：几瓣错开的圆丘，边缘用径向渐变化开，不留硬椭圆边
  const puffs = [
    [0.00, 0.00, 1.00], [-0.56, 0.10, 0.74], [0.55, 0.08, 0.78],
    [-0.20, -0.30, 0.64], [0.27, -0.27, 0.60], [0.02, 0.24, 0.70],
  ];
  for (let i = 0; i < puffs.length; i++) {
    const q = puffs[i];
    const rr = R * q[2];
    const px = x + R * q[0] + Math.sin(seed * 11 + i) * R * 0.05;
    const py = y + R * q[1];
    const gd = ctx.createRadialGradient(px, py - rr * 0.18, rr * 0.06, px, py, rr);
    gd.addColorStop(0, "rgba(" + tint + ",0.98)");
    gd.addColorStop(0.72, "rgba(" + tint + ",0.90)");
    gd.addColorStop(1, "rgba(" + tint + ",0)");
    ctx.fillStyle = gd;
    ctx.beginPath(); ctx.arc(px, py, rr, 0, Math.PI * 2); ctx.fill();
  }
  // 顶部高光：被太阳照到的那面偏暖
  const hi = ctx.createRadialGradient(x - R * 0.22, y - R * 0.42, R * 0.04, x - R * 0.22, y - R * 0.42, R * 0.78);
  hi.addColorStop(0, "rgba(" + hiC + "," + hiA + ")");
  hi.addColorStop(1, "rgba(" + hiC + ",0)");
  ctx.fillStyle = hi;
  ctx.beginPath(); ctx.arc(x - R * 0.22, y - R * 0.42, R * 0.78, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// 63.3 夜空的星点：锚在世界坐标上（跟着镜头走，不贴屏幕），两层密度，
// 亮度随时间轻微闪烁；亮星带一圈极淡的光晕和细十字。白天 / 63 / 30 都不画。
function s63Stars(ctx, t, left, top, vw, vh) {
  const layer = (cell, keep, maxR, bright) => {
    const x0 = Math.floor((left - cell) / cell), x1 = Math.ceil((left + vw + cell) / cell);
    const y0 = Math.floor((top - cell) / cell), y1 = Math.ceil((top + vh + cell) / cell);
    for (let cy = y0; cy <= y1; cy++) {
      for (let cx = x0; cx <= x1; cx++) {
        const h1 = s63Hash(cx * 17 + 3, cy * 29 + 11);
        if (h1 > keep) continue;
        const h2 = s63Hash(cx * 41 + 7, cy * 13 + 5);
        const h3 = s63Hash(cx * 7 + 19, cy * 37 + 23);
        const sx = (cx + 0.15 + h2 * 0.7) * cell;
        const sy = (cy + 0.15 + h3 * 0.7) * cell;
        const tw = 0.55 + 0.45 * Math.sin(t * (0.7 + h1 * 2.2) + h2 * 12);
        const r = 0.7 + h3 * maxR;
        ctx.fillStyle = "rgba(240,232,255," + (0.30 + tw * 0.62).toFixed(3) + ")";
        ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.fill();
        if (bright && h1 < 0.16) {
          const gr = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 7);
          gr.addColorStop(0, "rgba(226,210,255,0.34)");
          gr.addColorStop(1, "rgba(226,210,255,0)");
          ctx.fillStyle = gr;
          ctx.beginPath(); ctx.arc(sx, sy, r * 7, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = "rgba(238,228,255," + (0.22 + tw * 0.3).toFixed(3) + ")";
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(sx - r * 4, sy); ctx.lineTo(sx + r * 4, sy);
          ctx.moveTo(sx, sy - r * 4); ctx.lineTo(sx, sy + r * 4);
          ctx.stroke();
        }
      }
    }
  };
  layer(34, 0.30, 1.1, false);   // 细碎星点
  layer(96, 0.55, 1.9, true);    // 稀疏亮星
}
window.s63Stars = s63Stars;       // 供实机自检：确认星点数量与闪烁

window.drawSky63Sky = function (ctx, g, cam) {
  const T = (typeof TILE !== "undefined") ? TILE : 40;
  const t = (g && typeof g.time === "number") ? g.time : performance.now() / 1000;
  const vw = cam.viewW, vh = cam.viewH;
  const left = cam.x - vw / 2, top = cam.y - vh / 2;
  // Level 30「抽离现实」共用这套悬空背景：同样是浮在云上的天空盒。
  // 30 没有远处那堵藤蔓墙；走到尽头时天空盒会露出紫黑相间的错误背景。
  // Level 63.3 也用这套连续天空：夜里是紫天繁星，睡醒后换成压得很低的厚云。
  const lvl = String(g && g.level);
  const is30 = lvl === "30";
  const is633 = lvl === "63.3";
  const night = is633 && !(g && g.s633day);
  const day633 = is633 && !night;
  const glitch = is30 && !!(g && g.map && g.map.glitchSky);

  // ① 天空：一次画完的连续渐变。没有逐格拼接，也没有一条"海平线"。
  const sky = ctx.createLinearGradient(0, top - 4, 0, top + vh + 4);
  if (glitch) {
    sky.addColorStop(0.00, "#1b0730");
    sky.addColorStop(0.42, "#3b0f5c");
    sky.addColorStop(0.74, "#12052a");
    sky.addColorStop(1.00, "#2a0a46");
  } else if (night) {
    sky.addColorStop(0.00, "#120a26");
    sky.addColorStop(0.38, "#241148");
    sky.addColorStop(0.72, "#3a1c5e");
    sky.addColorStop(1.00, "#4d2a6b");
  } else if (day633) {
    sky.addColorStop(0.00, "#a6a8b4");
    sky.addColorStop(0.42, "#c4c5cb");
    sky.addColorStop(0.78, "#dcdbd8");
    sky.addColorStop(1.00, "#e8e6e0");
  } else {
    sky.addColorStop(0.00, "#6fa6d2");
    sky.addColorStop(0.40, "#9dc4e2");
    sky.addColorStop(0.76, "#c1dcee");
    sky.addColorStop(1.00, "#cfe2f0");
  }
  ctx.fillStyle = sky;
  ctx.fillRect(left - 4, top - 4, vw + 8, vh + 8);

  if (glitch) {
    // 错误背景：连续横条压满整片视野，不逐格拼、也不会变回方块墙。
    // 天已经坏了，不该再飘着正常的白云。
    for (let i = 0; i < 18; i++) {
      const y = top + ((i * 97 + Math.floor(t * 120)) % (vh + 140)) - 70;
      ctx.fillStyle = i % 2 ? "rgba(150,50,220,0.20)" : "rgba(10,2,24,0.34)";
      ctx.fillRect(left - 4, y, vw + 8, 6 + (i % 4) * 9);
    }
    return;
  }

  // ② 星星先画、云后画：被云团挡住的那部分自然就看不见了。
  if (night) s63Stars(ctx, t, left, top, vw, vh);

  // ③ 远处那堵不断重组的藤蔓墙：只在视野最上方很淡的一带，随时间慢慢变形。
  //    以前是每格三条斜藤，铺满全图 → 正是"水草"观感的来源。63 专属；30 与 63.3 都没有。
  if (!is30 && !is633) {
    const wallH = vh * 0.40;
    const vg = ctx.createLinearGradient(0, top, 0, top + wallH);
    vg.addColorStop(0, "rgba(84,130,90,0.17)");
    vg.addColorStop(1, "rgba(84,130,90,0)");
    ctx.fillStyle = vg;
    ctx.fillRect(left - 4, top, vw + 8, wallH);
    // 重组感交给这条带子本身的缓慢明暗起伏，不画一根根藤条 ——
    // 逐格/逐条的绿色竖线铺在浅蓝上就是"水草"，正是之前被误认成海的原因。
    const breathe = 0.05 + 0.035 * Math.sin(t * 0.15);
    ctx.fillStyle = "rgba(92,138,96," + breathe.toFixed(3) + ")";
    ctx.fillRect(left - 4, top, vw + 8, wallH * 0.22);
  }

  // ④ 三层浮云：远层小、淡、慢；近层大、亮、稍快 —— 有视差才像飘在空中。
  //    63 / 30 是蓝天白云；63.3 夜里是暗紫云、睡醒后是压得很低的厚云。
  const blueLayers = [
    { cell: 7,  n: 1, alpha: 0.46, r: 1.4, dy: 0.16,  spd: 0.035, tint: "222,234,246" },
    { cell: 6,  n: 1, alpha: 0.72, r: 1.9, dy: 0.00,  spd: 0.060, tint: "250,252,255" },
    { cell: 10, n: 1, alpha: 0.88, r: 2.6, dy: -0.12, spd: 0.090, tint: "255,255,250" },
  ];
  const nightLayers = [
    { cell: 8,  n: 1, alpha: 0.24, r: 1.6, dy: 0.16,  spd: 0.028, tint: "118,84,158" },
    { cell: 7,  n: 1, alpha: 0.32, r: 2.1, dy: 0.00,  spd: 0.045, tint: "152,108,190" },
    { cell: 11, n: 1, alpha: 0.40, r: 2.9, dy: -0.12, spd: 0.070, tint: "186,142,214" },
  ];
  const dayLayers = [
    { cell: 6,  n: 1, alpha: 0.62, r: 2.0, dy: 0.14,  spd: 0.025, tint: "198,200,206" },
    { cell: 5,  n: 1, alpha: 0.80, r: 2.6, dy: 0.00,  spd: 0.045, tint: "232,232,232" },
    { cell: 8,  n: 1, alpha: 0.92, r: 3.3, dy: -0.12, spd: 0.065, tint: "246,245,242" },
  ];
  const layers = night ? nightLayers : (day633 ? dayLayers : blueLayers);
  const puffOpt = night
    ? { shade: "44,26,74", shade2: "74,46,112", hi: "214,190,255", hiA: 0.12 }
    : (day633 ? { shade: "112,116,128", shade2: "140,142,150", hi: "255,255,252", hiA: 0.30 } : null);
  const keepCloud = day633 ? 0.24 : 0.46;   // 厚云更密，但仍是离散的团，不是铺满的地板
  if (day633) {
    // 睡醒之后天亮：一层连续薄纱把整片天压成阴天，再叠厚云；星星与音乐一起消失
    ctx.fillStyle = "rgba(214,214,212,0.16)";
    ctx.fillRect(left - 4, top - 4, vw + 8, vh + 8);
  }
  for (let L = 0; L < layers.length; L++) {
    const cf = layers[L];
    const cellPx = cf.cell * T;
    const cx0 = Math.floor((left - cellPx * 1.5) / cellPx);
    const cx1 = Math.ceil((left + vw + cellPx * 1.5) / cellPx);
    const cy0 = Math.floor((top - cellPx * 1.5) / cellPx);
    const cy1 = Math.ceil((top + vh + cellPx * 1.5) / cellPx);
    for (let cy = cy0; cy <= cy1; cy++) {
      for (let cx = cx0; cx <= cx1; cx++) {
        for (let k = 0; k < cf.n; k++) {
          const h1 = s63Hash(cx * 31 + L * 7 + k * 13, cy * 17 + L * 11 + k * 5);
          if (h1 < keepCloud) continue;          // 留出成片的天空，云是离散的团不是铺满的地板
          const h2 = s63Hash(cy * 29 + k * 19, cx * 23 + L * 3);
          const h3 = s63Hash(cx * 13 + cy * 7 + L, k * 41 + cy);
          const drift = Math.sin(t * cf.spd + h1 * 9 + L) * T * 2.3;
          const bx = (cx + 0.5 + (h2 - 0.5) * 0.65) * cellPx + drift;
          const by = (cy + 0.5 + (h3 - 0.5) * 0.65 + cf.dy) * cellPx
            + Math.sin(t * cf.spd * 0.8 + h2 * 7) * T * 0.55;
          const R = T * cf.r * (0.78 + h1 * 0.62);
          s63CloudPuff(ctx, bx, by, R, cf.tint, cf.alpha, h2, puffOpt);
        }
      }
    }
  }

  // ⑤ 63.3 夜里桥下那层会消散的紫雾：连续横带 + 几团缓慢飘动的软雾。
  //    画在瓦片之前、桥面盖在它上面 —— 不是逐格铺在地上的紫色方块。
  if (night) {
    const bandTop = 48 * T - vh * 0.30, bandH = vh * 0.62;
    const mg = ctx.createLinearGradient(0, bandTop, 0, bandTop + bandH);
    mg.addColorStop(0, "rgba(126,74,172,0)");
    mg.addColorStop(0.5, "rgba(126,74,172,0.16)");
    mg.addColorStop(1, "rgba(126,74,172,0)");
    ctx.fillStyle = mg;
    ctx.fillRect(left - 4, bandTop, vw + 8, bandH);
    for (let i = 0; i < 5; i++) {
      const fx = left + ((i + 0.5) / 5) * vw + Math.sin(t * 0.13 + i * 1.9) * T * 2.2;
      const fy = 48 * T + Math.cos(t * 0.11 + i * 2.4) * T * 1.4;
      const fr = T * (4.5 + (i % 3));
      const fg = ctx.createRadialGradient(fx, fy, 0, fx, fy, fr);
      fg.addColorStop(0, "rgba(158,98,204,0.13)");
      fg.addColorStop(1, "rgba(158,98,204,0)");
      ctx.fillStyle = fg;
      ctx.beginPath(); ctx.arc(fx, fy, fr, 0, Math.PI * 2); ctx.fill();
    }
  }
};

// ---------- 63.3 地面 / 紫雾 ----------
window.drawSleep633Floor = function (ctx, px, py, S, map, tx, ty) {
  const day = window.__game && window.__game.s633day;
  ctx.fillStyle = day ? "#d4b184" : "#c09a6c";
  ctx.fillRect(px, py, S, S);
  ctx.fillStyle = "rgba(90,58,30,.22)";
  ctx.fillRect(px, py + S * 0.5, S, Math.max(1, S * 0.04));
  // 光滑木材：一道长长的反光
  ctx.fillStyle = day ? "rgba(255,248,220,.24)" : "rgba(210,180,230,.16)";
  ctx.fillRect(px + S * 0.08, py + S * 0.18, S * 0.84, S * 0.06);
  return true;
};
window.drawSleep633Wall = function (ctx, px, py, S, map, tx, ty) {
  // 桥与桥之间是空气，不是地面。整片夜空 / 繁星 / 厚云由 drawSky63Sky 画在
  // 所有瓦片之前，这里只留一层几乎透明的空气色，让天空从缝隙里透出来。
  // 以前逐格铺紫底、画椭圆雾团和 2px 小方块星星，拼起来就是一片"紫色的海"。
  const day = window.__game && window.__game.s633day;
  ctx.fillStyle = day ? "rgba(236,234,228,0.06)" : "rgba(150,110,205,0.05)";
  ctx.fillRect(px, py, S, S);
  return true;
};

// ---------- 整屏叠加 ----------
window.__B2_OVL["63"] = function (ctx, g) {
  const cw = ctx.canvas.width, ch = ctx.canvas.height;
  ctx.save();
  try { ctx.setTransform(1, 0, 0, 1, 0, 0); } catch (e) { /* 忽略 */ }
  // 太阳一直绕着走，但层级始终是白天
  const a = (g.s63sun || 0);
  const sx = cw * (0.5 + Math.cos(a) * 0.36), sy = ch * (0.30 + Math.sin(a) * 0.18);
  const gr = ctx.createRadialGradient(sx, sy, 4, sx, sy, Math.min(cw, ch) * 0.16);
  gr.addColorStop(0, "rgba(255,246,208,.18)"); gr.addColorStop(1, "rgba(255,240,190,0)");
  ctx.fillStyle = gr; ctx.fillRect(0, 0, cw, ch);
  ctx.fillStyle = "rgba(255,248,222,.65)";
  ctx.beginPath(); ctx.arc(sx, sy, Math.min(cw, ch) * 0.026, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
};
window.__B2_OVL["63.3"] = function (ctx, g) {
  const cw = ctx.canvas.width, ch = ctx.canvas.height;
  ctx.save();
  try { ctx.setTransform(1, 0, 0, 1, 0, 0); } catch (e) { /* 忽略 */ }
  if (!g.s633day) {
    ctx.fillStyle = "rgba(58,36,88,.10)"; ctx.fillRect(0, 0, cw, ch);
    // 夜的暗角是连续的径向渐变，中间不压暗，星星和云都还看得见
    const vg = ctx.createRadialGradient(cw * 0.5, ch * 0.5, Math.min(cw, ch) * 0.22,
                                        cw * 0.5, ch * 0.5, Math.max(cw, ch) * 0.72);
    vg.addColorStop(0, "rgba(18,8,36,0)");
    vg.addColorStop(1, "rgba(14,6,30,0.32)");
    ctx.fillStyle = vg; ctx.fillRect(0, 0, cw, ch);
    ctx.fillStyle = "rgba(230,222,255,.10)"; ctx.font = "13px sans-serif"; ctx.textAlign = "center";
    ctx.fillText("♫  不知从哪来的钢琴声", cw / 2, 34); ctx.textAlign = "left";
  } else {
    ctx.fillStyle = "rgba(240,238,228,.08)"; ctx.fillRect(0, 0, cw, ch);
  }
  ctx.restore();
};

// ---------- 交互 ----------
window.__B2_hint(["s63gap", "s63meditate", "s633bed"], function (n, g) {
  switch (n.kind) {
    case "s63gap": return "一截栏杆断了 —— 按 E 跨出去，掉进虚空（→ Level 39 或 797，各一半）";
    case "s63meditate": return "一座孤零零的圆形木台，圆心一张长凳 · 按 E 坐一会儿（外面的声音会变小）";
    case "s633bed": return "桥上铺着毯子的凹位 —— 按 E 睡一觉（醒来天就亮了）";
  }
  return null;
});
window.__B2_act(["s63gap", "s63meditate", "s633bed"], function (n, g) {
  switch (n.kind) {
    case "s63gap": {
      const to = Math.random() < 0.5 ? 39 : 797;
      window.__toast("脚下一空 —— 桥、藤蔓、光一起远了");
      if (window.__goToLevel) window.__goToLevel(to);
      return true;
    }
    case "s63meditate":
      g.sanity = Math.min(100, (g.sanity || 0) + 24);
      window.__toast("长凳像是从平台里长出来的 —— 坐下去，风声和木桥的咯吱声都退远了（理智 +24）");
      return true;
    case "s633bed":
      g.s633day = true;
      g.sanity = 100; g.stamina = 100;
      window.__toast("你睡了一觉。醒来时星星没了、音乐也没了，天上压着一层很厚的云 —— 白天会一直持续到你离开");
      return true;
  }
  return false;
});

// ---------- 物件外观 ----------
window.PROP_DRAW = window.PROP_DRAW || {};
const S63 = window.PROP_DRAW;
S63["s63meditate"] = function (ctx, p, T) {
  ctx.fillStyle = "#8a6238";
  ctx.beginPath(); ctx.arc(0, 0, T * 0.44, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#5e4022"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, 0, T * 0.44, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = "#c39a62"; ctx.fillRect(-T * 0.26, -T * 0.06, T * 0.52, T * 0.12);
  ctx.fillStyle = "#6a4a2a"; ctx.fillRect(-T * 0.22, T * 0.06, T * 0.05, T * 0.16);
  ctx.fillRect(T * 0.17, T * 0.06, T * 0.05, T * 0.16);
};
S63["s63gap"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(30,44,58,.55)";
  ctx.fillRect(-T * 0.42, -T * 0.42, T * 0.84, T * 0.84);
  ctx.strokeStyle = "#e0c078"; ctx.lineWidth = Math.max(2, T * 0.07);
  ctx.beginPath(); ctx.moveTo(-T * 0.42, -T * 0.24); ctx.lineTo(-T * 0.12, -T * 0.24);
  ctx.moveTo(T * 0.14, -T * 0.24); ctx.lineTo(T * 0.42, -T * 0.24); ctx.stroke();
  ctx.fillStyle = "#e8d9b0";
  ctx.fillRect(-T * 0.14, -T * 0.30, T * 0.05, T * 0.14);
  ctx.fillRect(T * 0.10, -T * 0.30, T * 0.05, T * 0.14);
};
S63["s63rail"] = function (ctx, p, T) {
  ctx.strokeStyle = "#8a6238"; ctx.lineWidth = Math.max(2, T * 0.07);
  ctx.beginPath(); ctx.moveTo(-T * 0.42, -T * 0.22); ctx.lineTo(T * 0.42, -T * 0.22); ctx.stroke();
  ctx.fillStyle = "#6a4a2a";
  ctx.fillRect(-T * 0.40, -T * 0.26, T * 0.05, T * 0.40);
  ctx.fillRect(T * 0.35, -T * 0.26, T * 0.05, T * 0.40);
};
S63["s63ladder"] = function (ctx, p, T) {
  ctx.strokeStyle = "#7a5632"; ctx.lineWidth = Math.max(2, T * 0.06);
  for (let i = -1; i <= 1; i += 2) {
    ctx.beginPath(); ctx.moveTo(i * T * 0.16, -T * 0.42); ctx.lineTo(i * T * 0.16, T * 0.42); ctx.stroke();
  }
  for (let i = 0; i < 4; i++) {
    ctx.beginPath(); ctx.moveTo(-T * 0.16, -T * 0.34 + i * T * 0.22);
    ctx.lineTo(T * 0.16, -T * 0.34 + i * T * 0.22); ctx.stroke();
  }
};
S63["s63bar"] = function (ctx, p, T) {
  ctx.strokeStyle = "#6a4a2a"; ctx.lineWidth = Math.max(2, T * 0.07);
  ctx.beginPath(); ctx.moveTo(-T * 0.32, -T * 0.16); ctx.lineTo(T * 0.32, -T * 0.16);
  ctx.moveTo(-T * 0.28, -T * 0.16); ctx.lineTo(-T * 0.28, T * 0.36);
  ctx.moveTo(T * 0.28, -T * 0.16); ctx.lineTo(T * 0.28, T * 0.36); ctx.stroke();
};
S63["s633bed"] = function (ctx, p, T) {
  ctx.fillStyle = "#6a4a86"; ctx.fillRect(-T * 0.40, -T * 0.24, T * 0.80, T * 0.48);
  ctx.fillStyle = "#9a7ac0"; ctx.fillRect(-T * 0.40, -T * 0.24, T * 0.80, T * 0.12);
  ctx.fillStyle = "rgba(240,230,255,.20)"; ctx.fillRect(-T * 0.32, -T * 0.04, T * 0.64, T * 0.06);
};
S63["s633fog"] = function (ctx, p, T) {
  const t = performance.now() / 900;
  ctx.fillStyle = "rgba(150,100,190,.55)";
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(Math.sin(t + i) * T * 0.12, -T * 0.1 + i * T * 0.14,
      T * (0.36 - i * 0.05), T * 0.14, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.strokeStyle = "rgba(230,210,255,.6)"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, 0, T * 0.40, 0, Math.PI * 2); ctx.stroke();
};
S63["s633clip"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(230,220,200,.35)"; ctx.fillRect(-T * 0.40, -T * 0.40, T * 0.80, T * 0.80);
  ctx.strokeStyle = "rgba(255,245,215,.8)"; ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.moveTo(-T * 0.36, -T * 0.2 + i * T * 0.2);
    ctx.lineTo(T * 0.36, -T * 0.2 + i * T * 0.2); ctx.stroke();
  }
};
S63["s633rail"] = S63["s63rail"];
