// ===========================================================
// 隐秘层级 —— 尘封的感叹号
// 这是 Level ! 废弃之后的样子。天花板上的红灯早已损坏，
// 地面和墙上到处是灰尘，地上还有着实体的骨头 ——
// 因为进入 Level ! 的流浪者太稀少，里面的实体全部饿死了，层级就此废弃。
// 起始之室由反光金属完全包围，被微弱的红光所照亮；
// 尽头有一条 10 公里的走廊，越往里走资源越稀缺、骨头越多。
// ===========================================================
"use strict";

function generateExclamMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const props = [];

  // 起始之室：一间反光的金属房间
  const rx = 4, ry = Math.floor(size / 2) - 4;
  carveRoom(grid, size, rx, ry, 9, 8);
  // 一条很长的走廊（就是那条 10 公里的走廊），从起始之室一直往右
  const cy = Math.floor(size / 2);
  for (let x = rx + 9; x < size - 4; x++) for (let w = -1; w <= 1; w++) grid[cy + w][x] = 0;
  carveCorridorW(grid, size, rx + 9, ry + 4, rx + 12, cy, 2);
  // 走廊中途的几处落差（"向左走一步"会踩空的那种陷阱）
  for (let i = 0; i < 4; i++) {
    const x = rx + 16 + i * Math.floor((size - rx - 24) / 5);
    if (x < size - 6) for (let w = -1; w <= 1; w++) grid[cy + w][x] = 0;
  }
  const floors = collectFloors(grid, size);
  const start = { x: rx + 2, y: ry + 4, floor: 0 };

  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return;
    if (grid[y][x] !== 0) return;
    props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  };
  // 天花板上的红灯（早已损坏 —— 只有极少数还亮着）
  for (let x = rx + 2; x < size - 5; x += 5) put(x, cy - 2, "redlamp");
  // 地上的骨头：越往里越多
  for (const f of floors) {
    const prog = (f.x - rx) / Math.max(1, size - rx);
    if (Math.random() > prog * 0.55 + 0.10) continue;
    put(f.x, f.y, "bones");
  }
  // 起始之室里那扇上锁的门（门后有实体聚集的声音 —— 但现在是空的）
  put(rx + 8, ry + 1, "lockeddoorEx");
  // 通往 Level ! 的红门：就在这间起始之室里，跟满屋的灰尘格格不入
  put(rx + 8, ry + 6, "reddoorEx");
  // 走廊尽头的出口
  put(size - 5, cy, "enddoorEx");

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [{ x: rx, y: ry, w: 9, h: 8, start: true }],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [],
  };
  map.spawnPts = [start];
  return map;
}

window.PROP_DRAW = window.PROP_DRAW || {};

// 天花板上损坏的红灯：大多数是灭的，偶尔一两个还亮着
window.PROP_DRAW["redlamp"] = function (ctx, p, T) {
  const on = (((p.x || 0) * 13 + (p.y || 0) * 7) % 5) === 0;
  ctx.fillStyle = "#3a3834"; ctx.fillRect(-T * 0.12, -T * 0.34, T * 0.24, T * 0.12);
  ctx.fillStyle = on ? "#8a2820" : "#4a3a38";
  ctx.beginPath(); ctx.ellipse(0, -T * 0.20, T * 0.13, T * 0.09, 0, 0, Math.PI * 2); ctx.fill();
  if (on) {
    const g = ctx.createRadialGradient(0, -T * 0.18, 1, 0, -T * 0.18, T * 0.34);
    g.addColorStop(0, "rgba(220,60,50,0.55)"); g.addColorStop(1, "rgba(180,40,30,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, -T * 0.18, T * 0.34, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#e05040";
    ctx.beginPath(); ctx.arc(0, -T * 0.20, T * 0.05, 0, Math.PI * 2); ctx.fill();
  } else {
    // 损坏：一道裂缝
    ctx.strokeStyle = "#241f1c"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-T * 0.10, -T * 0.24); ctx.lineTo(T * 0.06, -T * 0.16); ctx.stroke();
  }
};

// 地上的骨头：实体的残骸
window.PROP_DRAW["bones"] = function (ctx, p, T) {
  const seed = ((p.x || 0) * 7 + (p.y || 0) * 11);
  const kind = seed % 3;
  ctx.fillStyle = "#cfc8b4";
  if (kind === 0) {                                    // 一根长骨
    ctx.save(); ctx.rotate(0.5);
    ctx.fillRect(-T * 0.16, -T * 0.03, T * 0.32, T * 0.06);
    ctx.beginPath(); ctx.arc(-T * 0.16, 0, T * 0.05, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(T * 0.16, 0, T * 0.05, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  } else if (kind === 1) {                             // 一个头骨
    ctx.beginPath(); ctx.ellipse(0, 0, T * 0.11, T * 0.09, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#8a8474";
    ctx.beginPath(); ctx.arc(-T * 0.04, -T * 0.02, T * 0.025, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(T * 0.04, -T * 0.02, T * 0.025, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#cfc8b4";
    ctx.fillRect(-T * 0.05, T * 0.06, T * 0.10, T * 0.05);
  } else {                                             // 脊椎 / 肋骨
    for (let i = 0; i < 3; i++) {
      ctx.save(); ctx.rotate(-0.35 + i * 0.16);
      ctx.fillRect(-T * 0.10, i * T * 0.07 - T * 0.06, T * 0.20, T * 0.035);
      ctx.restore();
    }
  }
};

// 起始之室里那扇上锁的门
window.PROP_DRAW["lockeddoorEx"] = function (ctx, p, T) {
  const w = T * 0.60, h = T * 0.86;
  ctx.fillStyle = "#5a5852"; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#6a6862"; ctx.fillRect(-w / 2 + 2, -h / 2 + 2, w - 4, h - 4);
  ctx.strokeStyle = "#3a3834"; ctx.lineWidth = 2; ctx.strokeRect(-w / 2, -h / 2, w, h);
  // 锁
  ctx.fillStyle = "#8a8060"; ctx.fillRect(w * 0.18, -T * 0.06, T * 0.12, T * 0.14);
  ctx.fillStyle = "#4a4434";
  ctx.beginPath(); ctx.arc(w * 0.24, 0, T * 0.03, 0, Math.PI * 2); ctx.fill();
  // 灰尘
  ctx.fillStyle = "rgba(190,185,170,0.35)";
  ctx.fillRect(-w / 2, h / 2 - 4, w, 4);
};

// 走廊尽头的出口
window.PROP_DRAW["enddoorEx"] = function (ctx, p, T) {
  const w = T * 0.72, h = T * 0.86;
  ctx.fillStyle = "#4a4844"; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "rgba(220,215,200,0.22)"; ctx.fillRect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 6);
  ctx.strokeStyle = "#2e2c28"; ctx.lineWidth = 2; ctx.strokeRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "rgba(240,235,220,0.45)";                    // 尽头透进来的光
  ctx.fillRect(-w / 2 + 3, -h / 2 + 3, w - 6, 3);
};

// 通往 Level ! 的那扇红门 —— 满屋灰尘里唯一干净、还在发亮的东西
window.PROP_DRAW["reddoorEx"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  const pulse = 0.45 + 0.35 * Math.sin(t * 2.4);
  const w = T * 0.86, h = T * 1.15;
  ctx.save();
  ctx.shadowColor = "rgba(230,60,50," + pulse.toFixed(3) + ")";
  ctx.shadowBlur = 18;
  ctx.fillStyle = "#4a1410"; ctx.fillRect(-w / 2 - 2, -h / 2 - 2, w + 4, h + 4);
  const gr = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
  gr.addColorStop(0, "#8e241c"); gr.addColorStop(0.5, "#c03a2c"); gr.addColorStop(1, "#7a1e18");
  ctx.fillStyle = gr; ctx.fillRect(-w / 2, -h / 2, w, h);
  // 门上的小窗（里面是黑的）
  ctx.fillStyle = "#1a0a08";
  ctx.fillRect(-w * 0.22, -h * 0.30, w * 0.44, h * 0.22);
  ctx.strokeStyle = "#e0705c"; ctx.lineWidth = 1;
  ctx.strokeRect(-w * 0.22, -h * 0.30, w * 0.44, h * 0.22);
  // 把手
  ctx.fillStyle = "#e8c86a";
  ctx.beginPath(); ctx.arc(w * 0.26, h * 0.06, T * 0.05, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
};
