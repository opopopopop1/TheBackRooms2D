// ===========================================================
// Level 287 —— 故障大厅
// 一条两侧都有门的走廊，长度疑似无限。白墙 + 数不清的黑门。
// 门通往 Level 289 / 0 / 484 / 2。越往里走，视觉会逐渐变得"静态"、黑白。
// 布局：就一条走廊 —— 刻意单一，不是迷宫。
// ===========================================================
"use strict";

function generateGlitchHallMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const props = [];

  // 一条贯穿全图的走廊（高 5 格，够宽敞）
  const cy = Math.floor(size / 2);
  for (let x = 2; x < size - 2; x++) for (let w = -2; w <= 2; w++) grid[cy + w][x] = 0;

  const floors = collectFloors(grid, size);
  const start = { x: 4, y: cy, floor: 0 };

  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return;
    if (grid[y][x] !== 0) return;
    props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  };
  // 两侧的密密麻麻的黑门 —— 但**绝大多数根本不通别处**。
  // 以前每一扇都是出口（0/2/484 轮流分配），随便推一扇就走了，
  // 这一层根本谈不上"挑一扇进去"。现在：
  //   · 真正通往别处的只有 4 扇（0 / 2 / 289 / 484），分散在走廊各处、上下错开；
  //     去处就写在门板上，认门牌就能认路。
  //   · 其余的门门板上什么都没有 —— 推开还是这条走廊，只是把你吐到另一段。
  const exitsAt = new Set();
  const targets = [
    { toLevel: 0, label: "0" },
    { toLevel: 2, label: "2" },
    { toLevel: 289, label: "289" },
    { toLevel: 484, label: "white" },
  ];
  const span = size - 10;
  const spreadX = [
    5 + Math.floor(span * 0.12),
    5 + Math.floor(span * 0.37),
    5 + Math.floor(span * 0.62),
    5 + Math.floor(span * 0.86),
  ];
  for (let i = 0; i < targets.length; i++) {
    const x = spreadX[i];
    const y = (i % 2 === 0) ? cy - 2 : cy + 2;      // 上下错开，别挤在一侧
    const t = targets[i];
    put(x, y, "blackdoor287", { toLevel: t.toLevel, label: t.label, real: true });
    exitsAt.add(x + "," + y);
  }
  // 剩下的全是"假的"：推开只是换一段走廊
  for (let x = 5; x < size - 5; x += 2) {
    for (const y of [cy - 2, cy + 2]) {
      if (exitsAt.has(x + "," + y)) continue;
      put(x, y, "blackdoor287", { warp287: true });
    }
  }
  // 天花板上滴下来的杏仁水形成的小水洼
  for (let i = 0; i < 10; i++) put(randInt(6, size - 7), cy + randInt(-1, 1), "puddle287");

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [],
    cy287: cy,          // 走廊所在的那一排 —— 假门把人吐回这一排
  };
  map.spawnPts = [start];
  return map;
}

window.PROP_DRAW = window.PROP_DRAW || {};

// 黑门：纯黑门板 + 白色门把，门框嵌在墙线上
window.PROP_DRAW["blackdoor287"] = function (ctx, p, T) {
  const w = T * 0.58, h = T * 0.84;
  ctx.fillStyle = "#0a0a0c"; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#16161a"; ctx.fillRect(-w / 2 + 2, -h / 2 + 2, w - 4, h * 0.40);
  ctx.fillStyle = "#101014"; ctx.fillRect(-w / 2 + 2, -h * 0.04, w - 4, h * 0.44);
  ctx.strokeStyle = "#2a2a30"; ctx.lineWidth = 1;
  ctx.strokeRect(-w / 2 + 2, -h / 2 + 2, w - 4, h * 0.40);
  ctx.strokeRect(-w / 2 + 2, -h * 0.04, w - 4, h * 0.44);
  ctx.fillStyle = "#d8d8dc";                                   // 门把
  ctx.beginPath(); ctx.arc(w * 0.26, 0, T * 0.045, 0, Math.PI * 2); ctx.fill();
  // 门缝里透出的一点光
  ctx.fillStyle = "rgba(220,220,220,0.18)";
  ctx.fillRect(-w / 2, h / 2 - 2, w, 2);
  // 门牌：去处就写在门板上（0 / 2 / white）—— 固定出口，不随机
  const lb = p.label != null ? String(p.label) : "";
  if (lb) {
    const fs = lb.length >= 4 ? 0.15 : (lb.length === 3 ? 0.23 : 0.30);
    ctx.font = "bold " + Math.max(8, Math.round(T * fs)) + "px monospace";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillStyle = "#eef2f6";
    ctx.fillText(lb, 0, -h * 0.24);
    ctx.fillStyle = "rgba(120,200,255,0.22)";       // 字底下一点冷光，黑门上才看得清
    ctx.fillText(lb, 0.6, -h * 0.24 + 0.6);
  }
};

// 杏仁水积成的小水洼
window.PROP_DRAW["puddle287"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(200,220,190,0.42)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.06, T * 0.30, T * 0.14, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(240,250,235,0.30)";
  ctx.beginPath(); ctx.ellipse(-T * 0.06, T * 0.02, T * 0.14, T * 0.06, 0, 0, Math.PI * 2); ctx.fill();
};
