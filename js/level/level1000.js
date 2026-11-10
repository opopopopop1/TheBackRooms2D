// ===========================================================
// Level 1000 —— 自然风景
// 起伏的草甸、森林、湖泊、河流、悬崖、零散的村庄 —— 纯自然景观，没有办公室。
// 天空永远停在傍晚与日落之间，云极慢地飘。恒定 18~24℃。
// 动植物全部可食用、无毒、无疾病；动物会主动避开人类但不攻击。
// 效应：数小时内压力骤降、睡眠改善、反复的噩梦停止 —— 且这是真的，不是精神影响。
// M.E.G. 在中央湖边设了一个小型观测站（被派驻的人几乎都申请延长任期）。
// 出口：留在这里吧 —— 解锁新结局「宜居」
// ===========================================================
"use strict";

function generateNatureMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const props = [];
  const grass = new Set(), water = new Set();

  // 整片都是开阔的自然 —— 没有墙，只有地形
  for (let y = 2; y < size - 2; y++) for (let x = 2; x < size - 2; x++) { grid[y][x] = 0; grass.add(x + "," + y); }
  // 中央的湖
  const cx = Math.floor(size * 0.44), cy = Math.floor(size * 0.46);
  const lr = Math.floor(size * 0.20);
  for (let y = cy - lr; y <= cy + lr; y++) {
    for (let x = cx - lr; x <= cx + lr; x++) {
      if (x < 2 || y < 2 || x > size - 3 || y > size - 3) continue;
      const d = Math.hypot(x - cx, y - cy) + 0.06 * size * Math.sin(Math.atan2(y - cy, x - cx) * 3);
      if (d < lr) { water.add(x + "," + y); grass.delete(x + "," + y); }
    }
  }
  // 一条河流：从湖流向地图边缘
  let rx = cx, ry = cy + lr - 1;
  while (rx < size - 4) {
    for (let w = -1; w <= 1; w++) if (ry + w > 1 && ry + w < size - 2) { water.add(rx + "," + (ry + w)); grass.delete(rx + "," + (ry + w)); }
    rx++; ry += (Math.random() < 0.30 ? (Math.random() < 0.5 ? 1 : -1) : 0);
    ry = Math.max(3, Math.min(size - 4, ry));
  }
  const floors = collectFloors(grid, size);
  let start = { x: 5, y: Math.floor(size / 2), floor: 0 };
  for (const f of floors) if (!water.has(f.x + "," + f.y)) { start = { x: f.x, y: f.y, floor: 0 }; break; }

  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return;
    if (grid[y][x] !== 0) return;
    props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  };
  // 森林：几片成林的树
  for (let i = 0; i < 5; i++) {
    const fx = randInt(6, size - 8), fy = randInt(5, size - 7);
    for (let k = 0; k < 22; k++) {
      const x = fx + randInt(-5, 5), y = fy + randInt(-4, 4);
      if (water.has(x + "," + y)) continue;
      put(x, y, "tree1000");
    }
  }
  // 零散的村庄
  for (let i = 0; i < 5; i++) {
    const vx = randInt(6, size - 10), vy = randInt(5, size - 8);
    if (water.has(vx + "," + vy)) continue;
    put(vx, vy, "village1000");
  }
  // M.E.G. 在中央湖边的观测站
  put(cx - lr - 3, cy, "outpost1000");
  // 草甸上的野花
  for (let i = 0; i < 40; i++) {
    const f = floors[randInt(0, floors.length - 1)];
    if (water.has(f.x + "," + f.y)) continue;
    put(f.x, f.y, "flower512");
  }

  // ---------- 那栋真的木屋：占地 6 格宽 5 格深 ----------
  // 档案里写得明明白白：不是格子上的小方块，是一栋有门洞、坡顶、
  // 木地板、床桌椅地毯书架暖炉的房子，屋外还有菜园、水井、栅栏、石板路。
  const cw0 = Math.min(size - 10, Math.floor(size * 0.62));
  const ch0 = Math.min(size - 9, Math.floor(size * 0.26));
  for (let i = props.length - 1; i >= 0; i--) {
    const q = props[i];
    if (q.x >= cw0 - 1 && q.x <= cw0 + 6 && q.y >= ch0 - 1 && q.y <= ch0 + 5) props.splice(i, 1);
  }
  props.push({ x: cw0 + 2, y: ch0 + 2, floor: 0, type: "cabin1000", w: 6, h: 5 });
  props.push({ x: cw0 + 2, y: ch0 + 4, floor: 0, type: "cabindoor1000", seed: 7 });

  // 出口（以前整层没有出口，进来就出不去）
  placeExitDoor(grid, size, start, props, { to: 11, label: "L11", tint: "#6a7a4a",
    tip: "离开这片风景的小径" });
  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [], grass, water,
  };
  map.spawnPts = [start];
  return map;
}

window.PROP_DRAW = window.PROP_DRAW || {};

// 傍晚色调下的树：暖绿的树冠 + 长长的影子
window.PROP_DRAW["tree1000"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(60,50,30,0.22)";
  ctx.beginPath(); ctx.ellipse(T * 0.10, T * 0.32, T * 0.20, T * 0.06, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#6a5238"; ctx.lineWidth = T * 0.09;
  ctx.beginPath(); ctx.moveTo(0, T * 0.30); ctx.lineTo(0, -T * 0.04); ctx.stroke();
  ctx.fillStyle = "#4a7a3e";
  ctx.beginPath(); ctx.arc(0, -T * 0.16, T * 0.24, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#5a8a48";
  ctx.beginPath(); ctx.arc(-T * 0.10, -T * 0.22, T * 0.16, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#6a9a52";                                    // 傍晚的暖光打在树顶
  ctx.beginPath(); ctx.arc(T * 0.06, -T * 0.26, T * 0.11, 0, Math.PI * 2); ctx.fill();
};

// 零散的村庄：斜顶小屋
window.PROP_DRAW["village1000"] = function (ctx, p, T) {
  const w = T * 0.66, h = T * 0.52;
  ctx.fillStyle = "rgba(60,50,30,0.24)";
  ctx.beginPath(); ctx.ellipse(T * 0.06, T * 0.28, w * 0.55, T * 0.08, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#d8cdb8"; ctx.fillRect(-w / 2, -h * 0.10, w, h * 0.62);    // 墙
  ctx.fillStyle = "#a85848";                                                   // 斜屋顶
  ctx.beginPath();
  ctx.moveTo(-w * 0.58, -h * 0.10); ctx.lineTo(0, -h * 0.62); ctx.lineTo(w * 0.58, -h * 0.10);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#6a4a3a"; ctx.fillRect(-w * 0.10, h * 0.14, w * 0.20, h * 0.38);  // 门
  ctx.fillStyle = "#e8d8a0"; ctx.fillRect(w * 0.22, -h * 0.02, w * 0.16, h * 0.18);  // 亮着的窗
  ctx.strokeStyle = "#8a7a62"; ctx.lineWidth = 1; ctx.strokeRect(-w / 2, -h * 0.10, w, h * 0.62);
};

// M.E.G. 在中央湖边的小型观测站（唯一用途是观察）
window.PROP_DRAW["outpost1000"] = function (ctx, p, T) {
  const w = T * 0.74, h = T * 0.56;
  ctx.fillStyle = "rgba(60,50,30,0.24)";
  ctx.beginPath(); ctx.ellipse(T * 0.06, T * 0.30, w * 0.55, T * 0.08, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#c8c8cc"; ctx.fillRect(-w / 2, -h * 0.14, w, h * 0.66);     // 站体
  ctx.fillStyle = "#9a9aa0"; ctx.fillRect(-w / 2, -h * 0.14, w, h * 0.10);
  ctx.fillStyle = "#6a7a8a"; ctx.fillRect(-w * 0.28, -h * 0.02, w * 0.34, h * 0.26);  // 观察窗
  ctx.fillStyle = "#3a4a5a"; ctx.fillRect(-w * 0.10, h * 0.16, w * 0.18, h * 0.36);   // 门
  // 屋顶的天线
  ctx.strokeStyle = "#8a8a90"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(w * 0.28, -h * 0.14); ctx.lineTo(w * 0.34, -h * 0.52); ctx.stroke();
  ctx.fillStyle = "#c85050";
  ctx.beginPath(); ctx.arc(w * 0.34, -h * 0.54, 2.6, 0, Math.PI * 2); ctx.fill();
  // M.E.G. 的标牌
  ctx.fillStyle = "#f0f0e8"; ctx.fillRect(-w / 2 + 3, -h * 0.30, w * 0.30, h * 0.14);
  ctx.fillStyle = "#3a5a8a"; ctx.font = "bold 6px ui-monospace, monospace"; ctx.textAlign = "center";
  ctx.fillText("M.E.G.", -w / 2 + 3 + w * 0.15, -h * 0.20); ctx.textAlign = "left";
};


// 一整栋木屋（俯视）：6 格宽 5 格深，坡顶、木墙、门洞、屋内家具、菜园水井
window.PROP_DRAW["cabin1000"] = function (ctx, p, T) {
  const W = (p.w || 6) * T, H = (p.h || 5) * T;
  const ox = -2 * T, oy = -2 * T;                 // prop 落在 (x0+2, y0+2)
  // 影子
  ctx.fillStyle = "rgba(50,46,30,0.20)";
  ctx.fillRect(ox + T * 0.12, oy + T * 0.20, W, H);
  // 石板路（从门口往下）
  ctx.fillStyle = "#b9b2a0";
  for (let i = 0; i < 4; i++) ctx.fillRect(ox + W * 0.42 + (i % 2) * T * 0.10, oy + H + i * T * 0.34, T * 0.42, T * 0.24);
  // 菜园（屋外左侧）
  ctx.fillStyle = "#5c6a3a";
  ctx.fillRect(ox - T * 1.05, oy + H * 0.20, T * 0.92, H * 0.62);
  ctx.fillStyle = "#7a8c48";
  for (let i = 0; i < 6; i++) ctx.fillRect(ox - T * 0.95 + (i % 2) * T * 0.42, oy + H * 0.28 + Math.floor(i / 2) * T * 0.32, T * 0.30, T * 0.20);
  // 水井（屋外右下）
  ctx.fillStyle = "#8d8574";
  ctx.beginPath(); ctx.arc(ox + W + T * 0.65, oy + H * 0.72, T * 0.36, 0, 6.2832); ctx.fill();
  ctx.fillStyle = "#2b3a48";
  ctx.beginPath(); ctx.arc(ox + W + T * 0.65, oy + H * 0.72, T * 0.24, 0, 6.2832); ctx.fill();
  // 栅栏
  ctx.strokeStyle = "#9c8b6c"; ctx.lineWidth = Math.max(2, T * 0.07);
  for (let i = 0; i < 7; i++) {
    const x = ox - T * 1.2 + i * T * 1.45;
    ctx.beginPath(); ctx.moveTo(x, oy + H + T * 0.75); ctx.lineTo(x, oy + H + T * 1.15); ctx.stroke();
  }
  ctx.beginPath(); ctx.moveTo(ox - T * 1.2, oy + H + T * 0.95); ctx.lineTo(ox + W + T * 1.2, oy + H + T * 0.95); ctx.stroke();
  // 屋内木地板
  ctx.fillStyle = "#a9855c";
  ctx.fillRect(ox, oy, W, H);
  for (let i = 1; i < 6; i++) {
    ctx.fillStyle = "rgba(80,56,32,0.22)";
    ctx.fillRect(ox + i * T, oy, 1.5, H);
  }
  // 地毯
  ctx.fillStyle = "#9a4b42";
  ctx.fillRect(ox + W * 0.30, oy + H * 0.42, W * 0.40, H * 0.30);
  ctx.fillStyle = "rgba(230,200,150,0.35)";
  ctx.fillRect(ox + W * 0.34, oy + H * 0.46, W * 0.32, H * 0.22);
  // 床（左上）
  ctx.fillStyle = "#6a4c34"; ctx.fillRect(ox + T * 0.25, oy + T * 0.25, T * 1.60, T * 0.95);
  ctx.fillStyle = "#e2dcc6"; ctx.fillRect(ox + T * 0.34, oy + T * 0.34, T * 1.42, T * 0.78);
  ctx.fillStyle = "#c4bda6"; ctx.fillRect(ox + T * 0.34, oy + T * 0.34, T * 0.42, T * 0.78);
  // 桌椅（右上）
  ctx.fillStyle = "#6a4c34"; ctx.fillRect(ox + W - T * 1.55, oy + T * 0.30, T * 1.10, T * 0.70);
  ctx.fillStyle = "#8a6742";
  for (const d of [[0.1, 1.15], [1.15, 1.15], [0.1, 0.15], [1.15, 0.15]]) {
    ctx.fillRect(ox + W - T * 1.45 + d[0] * T, oy + T * 0.30 + d[1] * T * 0.42, T * 0.16, T * 0.16);
  }
  // 书架 + 暖炉（左下）
  ctx.fillStyle = "#5b422d"; ctx.fillRect(ox + T * 0.25, oy + H - T * 1.45, T * 0.60, T * 1.20);
  ctx.fillStyle = "#8d6a44";
  for (let i = 0; i < 4; i++) ctx.fillRect(ox + T * 0.30, oy + H - T * 1.40 + i * T * 0.28, T * 0.50, T * 0.10);
  ctx.fillStyle = "#3f454a"; ctx.fillRect(ox + W - T * 1.30, oy + H - T * 1.20, T * 0.85, T * 0.95);
  ctx.fillStyle = "rgba(240,150,60,0.85)"; ctx.fillRect(ox + W - T * 1.14, oy + H - T * 0.95, T * 0.52, T * 0.36);
  // 墙：外圈木墙，正面留门洞
  ctx.fillStyle = "#7a5c3c";
  ctx.fillRect(ox, oy, W, T * 0.30);                    // 上墙
  ctx.fillRect(ox, oy + H - T * 0.30, W * 0.40, T * 0.30);   // 下墙左
  ctx.fillRect(ox + W * 0.60, oy + H - T * 0.30, W * 0.40, T * 0.30); // 下墙右
  ctx.fillRect(ox, oy, T * 0.24, H);                   // 左墙
  ctx.fillRect(ox + W - T * 0.24, oy, T * 0.24, H);   // 右墙
  // 墙上两扇亮着的窗
  ctx.fillStyle = "#e8d8a0";
  ctx.fillRect(ox + W * 0.24, oy + T * 0.06, T * 0.55, T * 0.18);
  ctx.fillRect(ox + W * 0.70, oy + T * 0.06, T * 0.55, T * 0.18);
  // 带瓦楞的深色坡顶：上下两坡 + 中间屋脊
  ctx.fillStyle = "rgba(58,42,34,0.92)";
  ctx.fillRect(ox, oy, W, T * 0.55);
  ctx.fillRect(ox, oy + H - T * 0.55, W, T * 0.55);
  ctx.fillStyle = "rgba(120,92,68,0.55)";
  for (let i = 0; i < 12; i++) {
    ctx.fillRect(ox + i * (W / 12), oy, 2, T * 0.55);
    ctx.fillRect(ox + i * (W / 12), oy + H - T * 0.55, 2, T * 0.55);
  }
  ctx.fillStyle = "#4a352a";
  ctx.fillRect(ox, oy + H * 0.46, W, T * 0.16);
};

// 木屋的门：按 E 触发「定居」结局
window.PROP_DRAW["cabindoor1000"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
  ctx.fillStyle = "#5b422d";
  ctx.fillRect(-T * 0.28, -T * 0.44, T * 0.56, T * 0.88);
  ctx.fillStyle = "#8a6742";
  ctx.fillRect(-T * 0.22, -T * 0.38, T * 0.44, T * 0.76);
  ctx.fillStyle = "rgba(240,200,120," + (0.35 + 0.25 * Math.sin(t * 1.4)).toFixed(3) + ")";
  ctx.fillRect(-T * 0.16, -T * 0.30, T * 0.32, T * 0.58);
  ctx.fillStyle = "#d9c95e";
  ctx.beginPath(); ctx.arc(T * 0.13, 0, T * 0.035, 0, 6.2832); ctx.fill();
};
