// ===========================================================
// Level 790 —— 在劫难逃
// 一座被雪覆盖的古典英伦式城镇，无限延伸。房屋类型有限：
// 教堂 / 独栋 / 半独栋 / 联排 / 街角商店 / 茶叶店。
// 每位进入者都会被某种"意外"杀死：暴风雪 / 屋顶瓦片 / 透明冰面 /
// 一氧化碳 / 食物中毒 / 电气火灾 / 树枝折断 / 地面开裂。
// 茶叶店最安全（灾害在里面更不易发生）。
// 出口：目前未发现任何出口。
// ===========================================================
"use strict";

const HOUSE_KINDS = ["church", "detached", "semi", "terraced", "cornershop", "teashop"];

function generateSnowTownMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const props = [];
  const snow = new Set();
  const rooms = [];

  // 街道：横竖成格
  for (let i = 1; i <= 4; i++) {
    const y = Math.floor(size * i / 5);
    for (let x = 2; x < size - 2; x++) for (let w = -1; w <= 1; w++) { grid[y + w][x] = 0; snow.add(x + "," + (y + w)); }
    const x = Math.floor(size * i / 5);
    for (let y = 2; y < size - 2; y++) for (let w = -1; w <= 1; w++) { grid[y][x + w] = 0; snow.add((x + w) + "," + y); }
  }
  // 街区里排房子：联排最常见
  for (let bi = 0; bi < 4; bi++) {
    for (let bj = 0; bj < 4; bj++) {
      const x0 = Math.floor(size * bi / 5) + 3, y0 = Math.floor(size * bj / 5) + 3;
      const x1 = Math.floor(size * (bi + 1) / 5) - 3, y1 = Math.floor(size * (bj + 1) / 5) - 3;
      if (x1 - x0 < 6 || y1 - y0 < 5) continue;
      const n = randInt(2, 4);
      for (let k = 0; k < n; k++) {
        const w = randInt(4, Math.max(5, Math.min(8, x1 - x0 - 1)));
        const h = randInt(4, Math.max(5, Math.min(6, y1 - y0 - 1)));
        const x = randInt(x0, Math.max(x0, x1 - w)), y = randInt(y0, Math.max(y0, y1 - h));
        carveRoom(grid, size, x, y, w, h);
        const kind = HOUSE_KINDS[randInt(0, HOUSE_KINDS.length - 1)];
        rooms.push({ x, y, w, h, kind });
        // 门开在朝街的一面
        carveCorridorW(grid, size, x + (w >> 1), y, x + (w >> 1), Math.max(2, y0 - 2), 1);
        carveCorridorW(grid, size, x + (w >> 1), y + h - 1, x + (w >> 1), Math.min(size - 3, y1 + 2), 1);
      }
    }
  }
  // 兜底：房子排布是随机的，偶尔会叠在一起或被雪堆围死 —— 统一接回主区。
  // 以前第一排房子（bj=0）的门只朝上开，而上面根本没有街，等于整排屋子进不去。
  if (typeof ensureAllConnected === "function") {
    ensureAllConnected(grid, size, { x: Math.floor(size / 2), y: Math.floor(size / 2) });
  }
  const floors = collectFloors(grid, size);
  const start = { x: Math.floor(size / 2), y: Math.floor(size / 2), floor: 0 };
  if (grid[start.y] && grid[start.y][start.x] === 1) grid[start.y][start.x] = 0;

  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return;
    if (grid[y][x] !== 0) return;
    props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  };
  // 房子门口挂牌子标明类型
  for (const r of rooms) put(r.x + (r.w >> 1), r.y - 1, "housesign790", { kind: r.kind });
  // 教堂里的头部防具
  for (const r of rooms) if (r.kind === "church") put(r.x + 1, r.y + 1, "helmet790");
  // 街上的致命物：透明冰面 / 会掉瓦片的老建筑标记 / 枯枝
  for (let i = 0; i < 20; i++) { const f = floors[randInt(0, floors.length - 1)]; put(f.x, f.y, "ice790"); }
  for (let i = 0; i < 12; i++) { const f = floors[randInt(0, floors.length - 1)]; put(f.x, f.y, "deadbranch"); }
  for (let i = 0; i < 10; i++) { const f = floors[randInt(0, floors.length - 1)]; put(f.x, f.y, "snowpile790"); }

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms,
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [], snow,
  };
  map.spawnPts = [start];
  return map;
}

window.PROP_DRAW = window.PROP_DRAW || {};

const HOUSE_LABEL = { church: "教堂", detached: "独栋", semi: "半独栋", terraced: "联排", cornershop: "街角商店", teashop: "茶叶店" };

// 房屋门口的牌子：写明这栋是哪种
window.PROP_DRAW["housesign790"] = function (ctx, p, T) {
  const label = HOUSE_LABEL[p.kind] || "";
  const safe = p.kind === "teashop";
  ctx.fillStyle = "#4a3a2a"; ctx.fillRect(-2, -T * 0.04, 4, T * 0.30);
  ctx.fillStyle = safe ? "#2a5a3a" : "#5a4030";
  ctx.fillRect(-T * 0.30, -T * 0.24, T * 0.60, T * 0.20);
  ctx.strokeStyle = "#2a1e14"; ctx.lineWidth = 1.2; ctx.strokeRect(-T * 0.30, -T * 0.24, T * 0.60, T * 0.20);
  ctx.fillStyle = "#e8dcc0"; ctx.font = "bold 8px ui-monospace, monospace"; ctx.textAlign = "center";
  ctx.fillText(label, 0, -T * 0.10); ctx.textAlign = "left";
};

// 教堂里的头部防具（能防住落瓦和树枝）
window.PROP_DRAW["helmet790"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.22, T * 0.17, T * 0.05, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#c8a83a";
  ctx.beginPath(); ctx.ellipse(0, 0, T * 0.18, T * 0.15, 0, Math.PI, 0); ctx.fill();
  ctx.fillStyle = "#a8862a";
  ctx.fillRect(-T * 0.20, -T * 0.02, T * 0.40, T * 0.05);
  ctx.fillStyle = "#8a6a20";
  ctx.beginPath(); ctx.ellipse(0, 0, T * 0.13, T * 0.11, 0, Math.PI, 0); ctx.fill();
  ctx.strokeStyle = "#6a4a14"; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.ellipse(0, 0, T * 0.18, T * 0.15, 0, Math.PI, 0); ctx.stroke();
};

// 透明冰面：很滑，摔下去会头骨骨折
window.PROP_DRAW["ice790"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(180,215,235,0.55)";
  ctx.beginPath(); ctx.ellipse(0, 0, T * 0.32, T * 0.20, 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "rgba(240,250,255,0.70)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(0, 0, T * 0.24, T * 0.14, 0.3, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-T * 0.14, -T * 0.06); ctx.lineTo(T * 0.10, T * 0.05); ctx.stroke();
};

// 会掉下来的枯枝（在树上，随时可能砸中脑袋）
window.PROP_DRAW["deadbranch"] = function (ctx, p, T) {
  ctx.strokeStyle = "#5a4838"; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-T * 0.26, -T * 0.26); ctx.lineTo(T * 0.02, -T * 0.04); ctx.stroke();
  ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(-T * 0.10, -T * 0.14); ctx.lineTo(-T * 0.20, T * 0.04); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(T * 0.00, -T * 0.06); ctx.lineTo(T * 0.14, -T * 0.18); ctx.stroke();
};

// 雪堆
window.PROP_DRAW["snowpile790"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(245,250,255,0.85)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.06, T * 0.28, T * 0.13, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.beginPath(); ctx.ellipse(-T * 0.06, T * 0.02, T * 0.14, T * 0.07, 0, 0, Math.PI * 2); ctx.fill();
};
