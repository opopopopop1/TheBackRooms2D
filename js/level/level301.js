// ===========================================================
// Level 301 —— 希望之窗
// 一处荒芜的室内空间，笼罩在黑暗之中。空气里悬浮着少量发光尘埃，
// 但亮度不足以照亮整片区域 —— 必须借助额外光源探索。
// 大气具有腐蚀性：没有防化服每秒掉 10 滴血，穿上防化服每 2 秒掉 1 滴。
//
// 布局刻意不是迷宫：
//   左侧  调制室 —— 石制地板完好无损，里面堆着被腐蚀损坏的电子设备
//   中间  大厅   —— 一大片开阔的腐蚀地面，散落着锈蚀穿孔的家具
//   右上  窗户间 —— 10 m² 左右的小房间，那扇 2m×2m 的玻璃窗在它的上墙
//   窗户开在整个层级的最上方，窗外能看见埃菲尔铁塔。
//
// 入口：Level 171 里那扇雕刻着鹦鹉的木门
// 出口：打碎那扇窗，跳进去 —— 回到前厅（结局 · 回到现实）
// ===========================================================
"use strict";

function generateHopeWindowMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const props = [];
  const stone = new Set();     // 调制室的石地板（完好，踩上去是石头声）
  const dust = new Set();      // 厚灰的地面（视觉）

  // ---- 大厅：一大片开阔地面（在腐蚀作用下已经碳化发粘）----
  const hallX = 5, hallY = 16, hallW = size - 11, hallH = size - 24;
  carveRoom(grid, size, hallX, hallY, hallW, hallH);

  // 大厅里零星几根柱子 —— 不是迷宫，只是让空旷里有东西可躲
  for (let i = 0; i < 14; i++) {
    const px = randInt(hallX + 3, hallX + hallW - 4);
    const py = randInt(hallY + 3, hallY + hallH - 4);
    if (grid[py][px] !== 0) continue;
    grid[py][px] = 1;
    if (grid[py + 1] && grid[py + 1][px] === 0) grid[py + 1][px] = 1;
  }

  // ---- 调制室（左侧）：石制地板 ----
  const mx0 = 6, mw = 13, mh = 11;
  const my0 = Math.floor(size / 2) - Math.floor(mh / 2);
  carveRoom(grid, size, mx0, my0, mw, mh);
  for (let y = my0; y < my0 + mh; y++)
    for (let x = mx0; x < mx0 + mw; x++) stone.add(x + "," + y);
  // 通向大厅
  carveCorridorW(grid, size, mx0 + mw, my0 + Math.floor(mh / 2), hallX + 2, my0 + Math.floor(mh / 2), 2);

  // ---- 窗户间（右上，整张地图的最上方）----
  // 房间本身很小（大约 10 m²），门开在下面，窗开在它的上墙。
  // wy0 = 1：carveRoom 会夹到 y>=1，所以第 1 行就是能站人的最上面一行 ——
  // 窗就钉在这一行，站在它下面一格抬头就能看见，整层再也没有比它更高的地方。
  const ww = 7, wh = 6;
  const wx0 = size - 22, wy0 = 1;
  carveRoom(grid, size, wx0, wy0, ww, wh);
  // 门（下墙开一个口）通向大厅
  carveCorridorW(grid, size, wx0 + Math.floor(ww / 2), wy0 + wh, wx0 + Math.floor(ww / 2), hallY + 1, 2);

  // 厚灰：散在地面上（只是视觉）
  for (let y = 1; y < size - 1; y++)
    for (let x = 1; x < size - 1; x++)
      if (grid[y][x] === 0 && Math.random() < 0.10) dust.add(x + "," + y);

  const floors = collectFloors(grid, size);
  // 出生点：大厅下方（从 Level 171 的鹦鹉门进来）
  const start = { x: Math.floor(size / 2), y: hallY + hallH - 4, floor: 0 };

  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return;
    if (grid[y][x] !== 0) return;
    props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  };

  // 那扇窗：钉在窗户间的上墙 —— 也就是整张地图的最上面一行
  // 窗本身是一面墙上的"物件"，玩家站在窗下面那一格就能互动。
  const winX = wx0 + Math.floor(ww / 2), winY = 1;
  grid[winY][winX] = 1;                         // 窗所在的那一格是墙
  const windowProp = { x: winX, y: winY, floor: 0, type: "hopewindow" };
  props.push(windowProp);

  // 调制室里被腐蚀损坏的电子设备（随时可能爆炸）
  for (let i = 0; i < 7; i++) put(randInt(mx0 + 1, mx0 + mw - 2), randInt(my0 + 1, my0 + mh - 2), "modulator");
  // 大厅里锈蚀穿孔的家具
  for (let i = 0; i < 26; i++) {
    const x = randInt(hallX + 1, hallX + hallW - 2), y = randInt(hallY + 1, hallY + hallH - 2);
    const r = Math.random();
    put(x, y, r < 0.34 ? "rustdesk" : r < 0.62 ? "rustcab" : r < 0.85 ? "rustchair" : "rustrack");
  }
  // 悬浮的发光尘埃（一点点光源，只照亮自己那一小圈）
  for (let i = 0; i < 16; i++) {
    const x = randInt(hallX + 1, hallX + hallW - 2), y = randInt(hallY + 1, hallY + hallH - 2);
    put(x, y, "dustmote");
  }

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [],
    stone, dust,
    window301: windowProp,
    // 那扇窗自己会发光 —— 外面的天光透进来，是这一层唯一不需要手电就能看见的地方。
    // 顺着光圈找过去，就等于找到了出口。
    lamps: [{ x: winX, y: winY, r: 7.5, color: "#fff6d6", noFixture: true }],
    // 腐蚀性空气：没穿防化服每秒 -10 血，穿了每 2 秒 -1 血
    corrosive: { noSuit: 10, withSuit: 0.5 },
  };
  map.spawnPts = [start];
  return map;
}

window.PROP_DRAW = window.PROP_DRAW || {};

// 那扇窗：2m×2m 的玻璃窗，窗外是前厅 —— 能看见埃菲尔铁塔
window.PROP_DRAW["hopewindow"] = function (ctx, p, T) {
  const w = T * 0.92, h = T * 0.86;
  // 窗框（锈迹斑斑的金属）
  ctx.fillStyle = "#6a6154";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.strokeStyle = "#3a352c"; ctx.lineWidth = 2;
  ctx.strokeRect(-w / 2, -h / 2, w, h);
  // 玻璃：外面是前厅的天空（黄昏的暖色）
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, "#9fc4e8");
  g.addColorStop(0.55, "#d8c8a8");
  g.addColorStop(1, "#c8a888");
  ctx.fillStyle = g;
  ctx.fillRect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 6);
  // 埃菲尔铁塔的剪影
  ctx.fillStyle = "rgba(60,52,44,0.82)";
  const bx = -w * 0.16, bw = w * 0.32, bh = h * 0.52;
  ctx.beginPath();
  ctx.moveTo(bx - bw / 2, h / 2 - 4);
  ctx.lineTo(bx - bw * 0.16, h / 2 - 4 - bh * 0.72);
  ctx.lineTo(bx, h / 2 - 4 - bh);
  ctx.lineTo(bx + bw * 0.16, h / 2 - 4 - bh * 0.72);
  ctx.lineTo(bx + bw / 2, h / 2 - 4);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(bx - 1, h / 2 - 4 - bh, 2, bh);            // 塔尖
  ctx.fillRect(bx - bw * 0.30, h / 2 - 4 - bh * 0.30, bw * 0.60, 2);   // 第一层平台
  ctx.fillRect(bx - bw * 0.42, h / 2 - 4 - bh * 0.08, bw * 0.84, 2);   // 第二层平台
  // 玻璃上的高光与裂纹
  ctx.fillStyle = "rgba(255,255,255,0.20)";
  ctx.fillRect(-w / 2 + 4, -h / 2 + 4, w * 0.30, h * 0.16);
  ctx.strokeStyle = "rgba(40,36,30,0.55)"; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-w * 0.10, -h / 2 + 5); ctx.lineTo(w * 0.06, -h * 0.05); ctx.lineTo(-w * 0.04, h / 2 - 5);
  ctx.stroke();
  // 窗在发光：外面是前厅的天光，会顺着窗沿往屋里洒出一片
  ctx.fillStyle = "rgba(255,246,214,0.10)";
  ctx.fillRect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 6);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const gl = ctx.createRadialGradient(0, h * 0.10, T * 0.10, 0, h * 0.10, T * 1.9);
  gl.addColorStop(0, "rgba(255,246,214,0.34)");
  gl.addColorStop(0.45, "rgba(255,240,196,0.14)");
  gl.addColorStop(1, "rgba(255,235,180,0)");
  ctx.fillStyle = gl;
  ctx.beginPath(); ctx.arc(0, h * 0.10, T * 1.9, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // 窗沿的一道亮边 —— 摸黑时先看见的就是这一条
  ctx.fillStyle = "rgba(255,250,230,0.55)";
  ctx.fillRect(-w / 2 + 3, h / 2 - 5, w - 6, 2);
};

// 调制室里的电子设备：被腐蚀得千疮百孔，指示灯还在一闪一闪
window.PROP_DRAW["modulator"] = function (ctx, p, T) {
  ctx.fillStyle = "#4a4a46";
  ctx.fillRect(-T * 0.32, -T * 0.30, T * 0.64, T * 0.60);
  ctx.strokeStyle = "#2a2a26"; ctx.lineWidth = 1.4;
  ctx.strokeRect(-T * 0.32, -T * 0.30, T * 0.64, T * 0.60);
  // 面板
  ctx.fillStyle = "#2e302c";
  ctx.fillRect(-T * 0.26, -T * 0.22, T * 0.52, T * 0.26);
  // 指示灯（一闪一闪）
  const on = ((Math.floor((p.__t || 0) * 2) + (p.x * 3 + p.y)) % 3) !== 0;
  ctx.fillStyle = on ? "#ff5a3a" : "#5a2a22";
  ctx.beginPath(); ctx.arc(T * 0.16, -T * 0.16, T * 0.045, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = on ? "#9fe07a" : "#2a4020";
  ctx.beginPath(); ctx.arc(T * 0.02, -T * 0.16, T * 0.045, 0, Math.PI * 2); ctx.fill();
  // 腐蚀出来的网状孔洞
  ctx.fillStyle = "#141412";
  for (let i = 0; i < 7; i++) {
    const a = i * 1.7 + p.x, r = T * (0.06 + (i % 3) * 0.02);
    ctx.beginPath();
    ctx.arc(Math.cos(a) * T * 0.24, T * 0.06 + Math.sin(a) * T * 0.18, r, 0, Math.PI * 2);
    ctx.fill();
  }
  // 旋钮
  ctx.fillStyle = "#6a6a62";
  ctx.beginPath(); ctx.arc(-T * 0.18, -T * 0.16, T * 0.05, 0, Math.PI * 2); ctx.fill();
};

// 锈蚀穿孔的家具：桌子 / 柜子 / 椅子 / 货架
window.PROP_DRAW["rustdesk"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(0,0,0,0.30)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.20, T * 0.30, T * 0.07, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#6a4a30";                       // 锈褐的木/铁
  ctx.fillRect(-T * 0.30, -T * 0.10, T * 0.60, T * 0.20);
  ctx.fillStyle = "#543a26";
  ctx.fillRect(-T * 0.28, T * 0.06, T * 0.06, T * 0.16);
  ctx.fillRect(T * 0.22, T * 0.06, T * 0.06, T * 0.16);
  ctx.strokeStyle = "rgba(20,16,12,0.6)"; ctx.lineWidth = 1;
  ctx.strokeRect(-T * 0.30, -T * 0.10, T * 0.60, T * 0.20);
  // 锈穿的孔洞
  ctx.fillStyle = "#2a1e14";
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.arc(-T * 0.20 + i * T * 0.13, -T * 0.03 + (i % 2) * T * 0.08, T * 0.035, 0, Math.PI * 2);
    ctx.fill();
  }
};
window.PROP_DRAW["rustcab"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(0,0,0,0.32)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.22, T * 0.24, T * 0.06, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#5e5348";
  ctx.fillRect(-T * 0.24, -T * 0.34, T * 0.48, T * 0.56);
  ctx.strokeStyle = "#2e2822"; ctx.lineWidth = 1.4;
  ctx.strokeRect(-T * 0.24, -T * 0.34, T * 0.48, T * 0.56);
  ctx.fillStyle = "#3a332c";
  ctx.fillRect(-T * 0.20, -T * 0.28, T * 0.40, T * 0.18);   // 抽屉
  ctx.fillRect(-T * 0.20, -T * 0.06, T * 0.40, T * 0.18);
  ctx.fillStyle = "#7a6a58";
  ctx.fillRect(-T * 0.06, -T * 0.22, T * 0.12, T * 0.04);   // 把手
  ctx.fillRect(-T * 0.06, 0, T * 0.12, T * 0.04);
  // 锈斑
  ctx.fillStyle = "rgba(120,60,20,0.35)";
  ctx.fillRect(-T * 0.24, -T * 0.34, T * 0.48, T * 0.10);
};
window.PROP_DRAW["rustchair"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.18, T * 0.16, T * 0.05, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#6a5140";
  ctx.fillRect(-T * 0.14, -T * 0.06, T * 0.28, T * 0.08);          // 座面
  ctx.fillRect(-T * 0.14, -T * 0.26, T * 0.28, T * 0.06);          // 靠背
  ctx.strokeStyle = "#33291f"; ctx.lineWidth = 1;
  ctx.fillRect(-T * 0.13, T * 0.02, T * 0.04, T * 0.16);           // 腿
  ctx.fillRect(T * 0.09, T * 0.02, T * 0.04, T * 0.16);
  ctx.strokeRect(-T * 0.14, -T * 0.06, T * 0.28, T * 0.08);
};
window.PROP_DRAW["rustrack"] = function (ctx, p, T) {
  ctx.fillStyle = "#555049";
  ctx.fillRect(-T * 0.30, -T * 0.34, T * 0.07, T * 0.68);
  ctx.fillRect(T * 0.23, -T * 0.34, T * 0.07, T * 0.68);
  ctx.fillStyle = "#6a645a";
  ctx.fillRect(-T * 0.30, -T * 0.22, T * 0.60, T * 0.06);
  ctx.fillRect(-T * 0.30, T * 0.02, T * 0.60, T * 0.06);
  ctx.strokeStyle = "rgba(20,18,14,0.55)"; ctx.lineWidth = 1;
  ctx.strokeRect(-T * 0.30, -T * 0.34, T * 0.60, T * 0.68);
};

// 悬浮的发光尘埃：亮度不足以照亮整片区域，只照亮自己那一小圈
window.PROP_DRAW["dustmote"] = function (ctx, p, T) {
  const g = ctx.createRadialGradient(0, 0, 0.5, 0, 0, T * 0.42);
  g.addColorStop(0, "rgba(226,232,214,0.62)");
  g.addColorStop(0.35, "rgba(190,200,180,0.22)");
  g.addColorStop(1, "rgba(160,170,150,0)");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, 0, T * 0.42, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(240,246,226,0.85)";
  ctx.beginPath(); ctx.arc(0, 0, T * 0.045, 0, Math.PI * 2); ctx.fill();
};
