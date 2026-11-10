// ===========================================================
// Level 6.1 —— 零食室
// 无限大的商场餐厅：中央大厅（80 年代商场风格，海军蓝食堂桌椅）+ 四周的小吃店/酒吧。
// 餐馆的出口可能通向另一家餐馆 —— 所以布局故意做得"乱"。
// 布局：不是迷宫 —— 一条条横竖的宽敞大厅 + 沿街排开的店门。
// ===========================================================
"use strict";

function generateFoodCourtMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const props = [];
  // 横竖各三条主大厅，把地图切成街区 —— 逛街式的开放布局，不是迷宫
  const lanes = [];
  for (let i = 1; i <= 3; i++) {
    lanes.push({ h: true, at: Math.floor(size * i / 4) });
    lanes.push({ h: false, at: Math.floor(size * i / 4) });
  }
  for (const L of lanes) {
    for (let p = 2; p < size - 2; p++) {
      for (let w = -1; w <= 1; w++) {          // 大厅宽 3 格
        if (L.h) grid[L.at + w][p] = 0; else grid[p][L.at + w] = 0;
      }
    }
  }
  // 街区里开餐馆：每块街区挖 1~2 家店，门口对着大厅
  for (let bi = 0; bi < 3; bi++) {
    for (let bj = 0; bj < 3; bj++) {
      const x0 = Math.floor(size * bi / 4) + 3, y0 = Math.floor(size * bj / 4) + 3;
      const x1 = Math.floor(size * (bi + 1) / 4) - 3, y1 = Math.floor(size * (bj + 1) / 4) - 3;
      if (x1 - x0 < 5 || y1 - y0 < 5) continue;
      const n = randInt(1, 2);
      for (let k = 0; k < n; k++) {
        const w = randInt(5, Math.max(6, Math.min(11, x1 - x0 - 1)));
        const h = randInt(4, Math.max(5, Math.min(8, y1 - y0 - 1)));
        const x = randInt(x0, Math.max(x0, x1 - w)), y = randInt(y0, Math.max(y0, y1 - h));
        carveRoom(grid, size, x, y, w, h);
        // 门：朝最近的大厅开 —— 从大厅推门就进店
        const cx = x + (w >> 1), cy = y + (h >> 1);
        let bx = cx, by = cy, bd = Infinity;
        for (const L of lanes) {
          const d = L.h ? Math.abs(L.at - cy) : Math.abs(L.at - cx);
          if (d < bd) { bd = d; bx = L.h ? cx : L.at; by = L.h ? L.at : cy; }
        }
        carveCorridorW(grid, size, cx, cy, bx, by, 1);
      }
    }
  }
  const floors = collectFloors(grid, size);
  const start = { x: Math.floor(size / 2), y: Math.floor(size / 2), floor: 0 };

  // 物件：食堂桌椅 / 长椅 / 盆栽 / 自动售货机 / 天窗
  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return;
    if (grid[y][x] !== 0) return;
    props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  };
  for (let i = 0; i < 40; i++) put(randInt(2, size - 3), randInt(2, size - 3), "canteen");
  for (let i = 0; i < 22; i++) put(randInt(2, size - 3), randInt(2, size - 3), "bench61");
  for (let i = 0; i < 18; i++) put(randInt(2, size - 3), randInt(2, size - 3), "planter");
  // 自动售货机成排出现 —— 有些房间堆得太多，连门都堵住
  // 出口：零食室另一侧的门 —— 按档案，它不通往 Level 6，而是把你放到别处
  placeExitDoor(grid, size, start, props, { to: 0, label: "L0", tint: "#6b4a2a",
    tip: "零食室另一侧的门 —— 它不通往 Level 6" });
  for (let i = 0; i < 34; i++) put(randInt(2, size - 3), randInt(2, size - 3), "vending");

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [],
  };
  map.spawnPts = [start];
  return map;
}

// ---------- 专属模型 ----------
window.PROP_DRAW = window.PROP_DRAW || {};

// 自动售货机：正面玻璃柜 + 一排商品 + 取货口 + 顶部灯箱
window.PROP_DRAW["vending"] = function (ctx, p, T) {
  const w = T * 0.72, h = T * 0.92;
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.40, w * 0.55, T * 0.12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#b8352c"; ctx.fillRect(-w / 2, -h / 2, w, h);        // 红色机身
  ctx.fillStyle = "#8d2620"; ctx.fillRect(-w / 2, -h / 2, w, h * 0.16);  // 顶部灯箱
  ctx.fillStyle = "#ffd98a"; ctx.fillRect(-w / 2 + 3, -h / 2 + 3, w - 6, h * 0.08);
  ctx.fillStyle = "#1a2630"; ctx.fillRect(-w / 2 + 3, -h / 2 + h * 0.18, w - 6, h * 0.46); // 玻璃柜
  for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) {            // 商品
    ctx.fillStyle = ["#e0b040", "#5aa85a", "#c85050", "#5a80c0", "#d07030", "#a0a0a0"][(r * 3 + c) % 6];
    ctx.fillRect(-w / 2 + 6 + c * (w - 12) / 3, -h / 2 + h * 0.20 + r * h * 0.20, (w - 12) / 3 - 3, h * 0.15);
  }
  ctx.fillStyle = "#2a2a2a"; ctx.fillRect(-w / 2 + 4, h / 2 - h * 0.22, w - 8, h * 0.12); // 取货口
  ctx.strokeStyle = "rgba(0,0,0,0.5)"; ctx.lineWidth = 1.5; ctx.strokeRect(-w / 2, -h / 2, w, h);
};

// 食堂桌椅（80 年代商场）：海军蓝桌面 + 四条连体座椅
window.PROP_DRAW["canteen"] = function (ctx, p, T) {
  const w = T * 0.80;
  ctx.fillStyle = "rgba(0,0,0,0.32)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.34, w * 0.5, T * 0.10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#26406b"; ctx.fillRect(-w / 2, -T * 0.16, w, T * 0.30);   // 桌面
  ctx.fillStyle = "#33507e"; ctx.fillRect(-w / 2, -T * 0.16, w, T * 0.06);
  ctx.fillStyle = "#8a8f96"; ctx.fillRect(-w * 0.34, -T * 0.02, 3, T * 0.26); // 桌腿
  ctx.fillRect(w * 0.34 - 3, -T * 0.02, 3, T * 0.26);
  for (const s of [-1, 1]) {                                                  // 两侧连体座椅
    ctx.fillStyle = "#1e3357";
    ctx.fillRect(s * (w * 0.5 + 3) - (s > 0 ? 0 : T * 0.20), -T * 0.10, T * 0.20, T * 0.20);
  }
};

// 长椅：木质椅面 + 铸铁椅脚
window.PROP_DRAW["bench61"] = function (ctx, p, T) {
  const w = T * 0.78;
  ctx.fillStyle = "rgba(0,0,0,0.30)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.26, w * 0.5, T * 0.08, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#7a5a3a"; ctx.fillRect(-w / 2, -T * 0.10, w, T * 0.16);
  ctx.fillStyle = "#8f6b45"; ctx.fillRect(-w / 2, -T * 0.10, w, T * 0.05);
  ctx.fillStyle = "#3a3a3a";
  ctx.fillRect(-w / 2 + 4, T * 0.04, 4, T * 0.14);
  ctx.fillRect(w / 2 - 8, T * 0.04, 4, T * 0.14);
};

// 盆栽：陶盆 + 一团叶子
window.PROP_DRAW["planter"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.24, T * 0.22, T * 0.07, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#a4623c"; ctx.fillRect(-T * 0.18, T * 0.02, T * 0.36, T * 0.22);
  ctx.fillStyle = "#8a4f2e"; ctx.fillRect(-T * 0.20, T * 0.02, T * 0.40, T * 0.05);
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i - 2) * 0.42;
    ctx.strokeStyle = "#3f7a3a"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, T * 0.04);
    ctx.lineTo(Math.cos(a) * T * 0.26, T * 0.04 + Math.sin(a) * T * 0.30); ctx.stroke();
  }
};
