// ===========================================================
// Level ! （读作 "Level Bang"）—— 一间医院的走廊
//
// 入口：尘封的感叹号里那扇红色的门。推开它，红灯亮起、笑魇从身后冲出。
// 出口：走廊尽头那扇标着 EXIT 的大门 -> Level 109。
//
// 这一层是"尘封的感叹号"还活着时候的样子：
//   天花板的红灯在闪、警报一直在响、两侧的门时不时推出病床来挡路 ——
//   但那些门流浪者一扇也打不开。
// ===========================================================
"use strict";

function generateBangMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const props = [];

  // ---------- 一条贯穿的医院走廊 ----------
  // 走廊纵向：从地图最上面一直通到最下面（尽头就是 EXIT）。
  const cx = Math.floor(size / 2);
  const HALF = 2;                       // 走廊半宽 -> 一共 5 格宽
  const y0 = 3, y1 = size - 6;
  for (let y = y0; y <= y1; y++)
    for (let w = -HALF; w <= HALF; w++) grid[y][cx + w] = 0;

  // 走廊两侧每隔一段挖一小段"侧廊"，让空间不至于是一条死直的管子
  for (let y = y0 + 8; y < y1 - 4; y += 11) {
    for (let w = HALF + 1; w <= HALF + 3; w++) grid[y][cx + w] = 0;
    for (let w = -HALF - 3; w <= -HALF - 1; w++) grid[y][cx + w] = 0;
  }

  const floors = collectFloors(grid, size);
  const start = { x: cx, y: y0 + 1, floor: 0 };

  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return;
    if (grid[y][x] !== 0) return;
    props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  };

  // ---------- 两侧的门：关着、推不开，只是会往外吐病床 ----------
  // 门画在走廊左右两边的墙线上（墙格），所以走不进去、也打不开。
  const doorsL = [], doorsR = [];
  for (let y = y0 + 4; y < y1 - 2; y += 4) {
    // 两侧都开门 —— 以前是左右交替，等于有一半的位置根本没有门，
    // 那半边自然也就不可能推出病床来。现在每一扇门都会吐。
    props.push({ x: cx - HALF - 1, y, floor: 0, type: "hospdoor", side: -1 }); doorsL.push(y);
    props.push({ x: cx + HALF + 1, y, floor: 0, type: "hospdoor", side: 1 }); doorsR.push(y);
  }

  // ---------- 天花板上闪烁的红灯 ----------
  for (let y = y0 + 2; y < y1; y += 6) put(cx, y, "alarmred");

  // ---------- 走廊尽头的 EXIT 大门 ----------
  const exY = y1 - 1;
  props.push({ x: cx, y: exY, floor: 0, type: "exitbang" });

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [],
    // 病床：从两侧门里被推出来，横穿走廊 —— 撞到会把人推开
    // 每扇门各有自己的计时器（错开初值），所以是"每一扇门都会吐"，
    // 而不是每次随机挑一扇 —— 那样靠后的门可能一整局都不出一次。
    gurneys: [],
    gurneyDoors: doorsL.map((y) => ({ x: cx - HALF - 1, y, side: -1 }))
      .concat(doorsR.map((y) => ({ x: cx + HALF + 1, y, side: 1 })))
      .map((d, i) => ({ x: d.x, y: d.y, side: d.side, t: 1.0 + (i * 0.37) % 2.4 })),
    gurneyTimer: 1.2,
  };
  map.spawnPts = [start];
  return map;
}

// 病床推进：每帧往前挪一点，走完就消失；撞到玩家把人横向推开
function updateBangGurneys(g, dt) {
  const m = g.map;
  if (!m || !m.gurneyDoors) return;
  const cx = Math.floor(m.size / 2), HALF = 2;
  // 每一扇门都算自己的那一份时间 —— 到点就吐一张床出来，然后重新计时。
  // 场上同时最多留 10 张，免得门一多就成片地刷。
  for (const d of m.gurneyDoors) {
    d.t -= dt;
    if (d.t > 0) continue;
    d.t = 1.6 + Math.random() * 2.2;
    if (m.gurneys.length >= 10) continue;
    m.gurneys.push({
      x: d.x + d.side * 0.2, y: d.y, side: d.side,
      t: 0, dur: 2.6,
      y0: d.y,
    });
  }
  const p = g.player;
  for (let i = m.gurneys.length - 1; i >= 0; i--) {
    const b = m.gurneys[i];
    b.t += dt;
    if (b.t >= b.dur) { m.gurneys.splice(i, 1); continue; }
    const k = b.t / b.dur;
    // 从门里滑出来，滑到走廊中间偏过一点，再被拉回去
    b.x = (cx + b.side * HALF) - b.side * HALF * 1.7 * Math.sin(k * Math.PI);
    // 撞到玩家：横向推开（不扣血，只是挡路）
    const dx = b.x * TILE + TILE / 2 - p.x, dy = b.y * TILE + TILE / 2 - p.y;
    if (Math.abs(dx) < TILE * 0.75 && Math.abs(dy) < TILE * 0.75) {
      const nx = b.x + b.side * 0.05;
      if (!solidAt(g.map, Math.floor(p.x / TILE + b.side * 0.0), Math.floor(p.y / TILE))) {
        p.x += b.side * 62 * dt;
      } else { p.x -= b.side * 30 * dt; }
      void nx;
    }
  }
}

window.PROP_DRAW = window.PROP_DRAW || {};

// 两侧的门：双开式推门，中间一条缝，上面一块毛玻璃 —— 打不开
window.PROP_DRAW["hospdoor"] = function (ctx, p, T) {
  const w = T * 0.92, h = T * 1.02;
  ctx.fillStyle = "#3c4248";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  // 两扇
  ctx.fillStyle = "#8d959c";
  ctx.fillRect(-w / 2, -h / 2, w / 2 - 1, h);
  ctx.fillRect(1, -h / 2, w / 2 - 1, h);
  // 毛玻璃视窗
  ctx.fillStyle = "#5d6b74";
  ctx.fillRect(-w / 2 + 3, -h * 0.32, w / 2 - 6, h * 0.30);
  ctx.fillRect(3, -h * 0.32, w / 2 - 6, h * 0.30);
  ctx.fillStyle = "rgba(200,220,235,0.14)";
  ctx.fillRect(-w / 2 + 4, -h * 0.30, w / 2 - 8, 3);
  ctx.fillRect(4, -h * 0.30, w / 2 - 8, 3);
  // 中缝 + 上下门框
  ctx.fillStyle = "#2b3035";
  ctx.fillRect(-1, -h / 2, 2, h);
  ctx.fillRect(-w / 2, -h / 2 - 2, w, 2);
  ctx.fillRect(-w / 2, h / 2 - 2, w, 2);
  ctx.strokeStyle = "rgba(20,24,28,0.6)"; ctx.lineWidth = 1;
  ctx.strokeRect(-w / 2, -h / 2, w, h);
  // 把手
  ctx.fillStyle = "#c8ced4";
  ctx.fillRect(-4, -3, 8, 2);
  ctx.fillRect(-4, 3, 8, 2);
};

// 天花板上闪烁的红灯 + 一圈红光
window.PROP_DRAW["alarmred"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  // 进层头 2 秒红灯不亮（警报也没响）—— 2 秒一过才一起启动
  const gg = (typeof window !== "undefined") ? window.__game : null;
  const alarm = !!(gg && gg.bangAlarm);
  const ph = Math.sin(t * 6 + (p.x || 0) * 0.7 + (p.y || 0) * 0.3);
  const on = alarm && ph > 0;
  // 吊杆
  ctx.strokeStyle = "#4a5057"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, -T * 0.46); ctx.lineTo(0, -T * 0.30); ctx.stroke();
  // 灯罩
  ctx.fillStyle = "#6a3030";
  ctx.beginPath(); ctx.ellipse(0, -T * 0.26, T * 0.20, T * 0.13, 0, Math.PI, Math.PI * 2); ctx.fill();
  // 灯泡
  ctx.fillStyle = on ? "#ff4a38" : "#6a2620";
  ctx.beginPath(); ctx.arc(0, -T * 0.22, T * 0.09, 0, Math.PI * 2); ctx.fill();
  if (on) {
    const gr = ctx.createRadialGradient(0, -T * 0.20, 1, 0, -T * 0.20, T * 0.62);
    gr.addColorStop(0, "rgba(255,70,50,0.42)");
    gr.addColorStop(1, "rgba(255,40,30,0)");
    ctx.fillStyle = gr;
    ctx.beginPath(); ctx.arc(0, -T * 0.20, T * 0.62, 0, Math.PI * 2); ctx.fill();
  }
};

// 尽头那扇 EXIT 大门
window.PROP_DRAW["exitbang"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  const pulse = 0.5 + 0.5 * Math.sin(t * 3);
  const w = T * 2.0, h = T * 1.5;
  ctx.save();
  ctx.shadowColor = "rgba(90,255,140," + (0.35 + pulse * 0.4).toFixed(3) + ")";
  ctx.shadowBlur = 20;
  // 门框
  ctx.fillStyle = "#39424a"; ctx.fillRect(-w / 2 - 3, -h / 2 - 3, w + 6, h + 6);
  // 门板
  const gr = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  gr.addColorStop(0, "#cfd8dd"); gr.addColorStop(1, "#98a3ab");
  ctx.fillStyle = gr; ctx.fillRect(-w / 2, -h / 2, w, h);
  // 中缝
  ctx.fillStyle = "#5a646b"; ctx.fillRect(-1.5, -h / 2, 3, h);
  // EXIT 字牌（绿底白字，常亮）
  ctx.fillStyle = "#1f7a44";
  ctx.fillRect(-w * 0.34, -h / 2 - T * 0.30, w * 0.68, T * 0.28);
  ctx.fillStyle = "#eafff2";
  ctx.font = "bold " + (T * 0.22).toFixed(1) + "px monospace";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("EXIT", 0, -h / 2 - T * 0.16);
  ctx.restore();
};

// 病床：带轮子的担架，从门里被推出来
function drawBangGurneys(ctx, g) {
  const m = g.map;
  if (!m || !m.gurneys || !m.gurneys.length) return;
  const T = TILE;
  for (const b of m.gurneys) {
    const k = b.t / b.dur;
    const a = Math.sin(k * Math.PI);            // 出来又回去，所以渐显渐隐
    ctx.save();
    ctx.globalAlpha = 0.35 + 0.65 * a;
    ctx.translate(b.x * T + T / 2, b.y * T + T / 2);
    // 床面
    ctx.fillStyle = "#b9c2c8";
    ctx.fillRect(-T * 0.44, -T * 0.34, T * 0.88, T * 0.46);
    ctx.fillStyle = "#dfe7ec";
    ctx.fillRect(-T * 0.44, -T * 0.34, T * 0.88, T * 0.12);
    // 枕头
    ctx.fillStyle = "#eef3f6"; ctx.fillRect(-T * 0.38, -T * 0.30, T * 0.22, T * 0.16);
    // 护栏
    ctx.strokeStyle = "#8b959c"; ctx.lineWidth = 1.6;
    ctx.strokeRect(-T * 0.44, -T * 0.34, T * 0.88, T * 0.46);
    ctx.beginPath(); ctx.moveTo(-T * 0.44, -T * 0.06); ctx.lineTo(T * 0.44, -T * 0.06); ctx.stroke();
    // 轮子
    ctx.fillStyle = "#4a5057";
    ctx.beginPath(); ctx.arc(-T * 0.30, T * 0.18, T * 0.06, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(T * 0.30, T * 0.18, T * 0.06, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}

// ---------- 地面 / 墙体：医院的地砖与瓷砖墙 ----------
const BANGTILE = {
  bang: ["#8e9aa2", "#828e96", "#5a646c"],
};

function bangTile(style) { return BANGTILE[style] || null; }

function drawBangFloor(ctx, px, py, h, style, map, tx, ty) {
  if (style !== "bang") return false;
  const S = (typeof TILE === "number" ? TILE : 40);
  const n = hash2(tx, ty);
  // 医院地砖：浅灰蓝，带缝
  ctx.fillStyle = n > 0.5 ? "#8e9aa2" : "#87939b";
  ctx.fillRect(px, py, S, S);
  ctx.strokeStyle = "rgba(60,70,78,0.35)"; ctx.lineWidth = 1;
  ctx.strokeRect(px + 0.5, py + 0.5, S - 1, S - 1);
  // 中间一条淡色的导向线（医院走廊地上常见的那种）
  if (Math.abs(tx - Math.floor(map.size / 2)) <= 2 && n > 0.35) {
    ctx.fillStyle = "rgba(215,225,232,0.16)";
    ctx.fillRect(px + 2, py + S * 0.45, S - 4, 3);
  }
  return true;
}

function drawBangWall(ctx, px, py, h, style) {
  const c = BANGTILE[style];
  if (!c) return false;
  const S = (typeof TILE === "number" ? TILE : 40);
  // 瓷砖墙：一格四片小砖
  ctx.fillStyle = "#5a646c"; ctx.fillRect(px, py, S, S);
  ctx.fillStyle = "#6e7880";
  ctx.fillRect(px + 1, py + 1, S / 2 - 2, S / 2 - 2);
  ctx.fillRect(px + S / 2 + 1, py + S / 2 + 1, S / 2 - 2, S / 2 - 2);
  ctx.fillStyle = "#656f77";
  ctx.fillRect(px + S / 2 + 1, py + 1, S / 2 - 2, S / 2 - 2);
  ctx.fillRect(px + 1, py + S / 2 + 1, S / 2 - 2, S / 2 - 2);
  ctx.fillStyle = "rgba(200,215,225,0.10)";
  ctx.fillRect(px + 1, py + 1, S - 2, 2);
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.fillRect(px, py + S - 5, S, 5);
  return true;
}

if (typeof window !== "undefined") {
  window.drawBangFloor = drawBangFloor;
  window.drawBangWall = drawBangWall;
  window.bangTile = bangTile;
  window.updateBangGurneys = updateBangGurneys;
  window.drawBangGurneys = drawBangGurneys;
}
