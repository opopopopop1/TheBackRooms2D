// ===========================================================
// Level 601 —— 终末（wikidot 上编号就是 601）
// 黄色大厅 + 成排空书架 + 刻着 The End 的柱子（= 终末）。四本带数字的书插在不同书柜上，
// 按 紫→红→绿→蓝 插进凹槽才能开 EXIT 门。
// ===========================================================
"use strict";

function generateLibraryMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const mid = Math.floor(size / 2);
  // 中央大厅（黄色）：占据大半张图
  // 大厅尺寸写死，不再跟着 size 长 —— 地图往右扩出去的那一块是「假现实」，
  // 不是把图书馆本身拉长（那样书架、柱子、凹槽的密度全变了）。
  const HX = 10, HY = 12, HW = 62, HH = 56;
  carveRoom(grid, size, HX, HY, HW - 1, HH - 1);
  // 顶部绿色小房间（EXIT -> Level 0）
  const GX = mid - 4, GY = 5, GW = 9, GH = 7;
  carveRoom(grid, size, GX, GY, GW - 1, GH - 1);
  carveCorridor(grid, size, mid, HY - 1, mid, GY + GH - 1);
  // 左侧橙色小房间（深色门 -> Level 9223372036854775807）
  const OX = 4, OY = mid - 4, OW = 8, OH = 9;
  carveRoom(grid, size, OX, OY, OW - 1, OH - 1);
  carveCorridor(grid, size, OX + OW - 1, mid, HX, mid);

  const floors = collectFloors(grid, size);
  const start = { x: mid, y: HY + 2, floor: 0 };
  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [[]],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props: [], crates: [], ground: [],
    hall: { x: HX, y: HY, w: HW, h: HH },        // 黄色的中央大厅
    green: { x: GX, y: GY, w: GW, h: GH },       // 顶部绿房间
    orange: { x: OX, y: OY, w: OW, h: OH },      // 左侧橙房间
    books: [], grooves: [],
    exitDoor: null, darkDoor: null,
    seqBook: 0, seqGroove: 0,
  };
  makeDoorsMap(map);

  map.spawnPts = [];
  for (let py = HY + 5; py < HY + HH - 5; py += 8) {
    for (let px = HX + 5; px < HX + HW - 5; px += 8) {
      if (!grid[py] || grid[py][px] !== 0) continue;
      if (Math.hypot(px - mid, py - (HY + 2)) < 4) continue;
      grid[py][px] = 1;
      map.props.push({ type: "pillarEnd", x: px, y: py, floor: 0 });
    }
  }
  for (let py = HY + 9; py < HY + HH - 5; py += 8) {
    for (let px = HX + 9; px < HX + HW - 5; px += 8) {
      if (!grid[py] || grid[py][px] !== 0) continue;
      map.spawnPts.push({ x: px, y: py });
    }
  }

  // 书架：在大厅里成排摆开，只要挨着墙就不要（贴墙的一律删掉）
  const isWallNear = (x, y) => {
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= size || ny >= size) return true;
      if (grid[ny][nx] === 1) return true;
    }
    return false;
  };
  const putShelf = (x, y) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return;
    if (grid[y][x] !== 0) return;
    if (isWallNear(x, y)) return;                    // 靠墙的书架：不要
    if (Math.hypot(x - mid, y - (HY + 3)) < 5) return;  // 出生点四周留空
    map.props.push({ type: "shelfEnd", x, y, floor: 0, hasBooks: false });
  };
  for (let y = HY + 4; y < HY + HH - 4; y += 3) {
    for (let x = HX + 4; x < HX + HW - 4; x += 3) putShelf(x, y);
  }

  // 四本带数字的书（红 / 蓝 / 绿 / 紫）：插在书架上，不是散在地上
  const shelves = map.props.filter((q) => q.type === "shelfEnd");
  const cols = ["red", "blue", "green", "purple"];
  const used = new Set();
  for (let i = 0; i < 4 && shelves.length; i++) {
    let sh = null;
    for (let k = 0; k < 40; k++) {
      const c = shelves[randInt(0, shelves.length - 1)];
      if (!used.has(c.x + "," + c.y)) { sh = c; break; }
    }
    if (!sh) break;
    used.add(sh.x + "," + sh.y);
    sh.hasBooks = true;
    const bk = { type: "bookEnd", x: sh.x, y: sh.y, floor: 0, color: cols[i], digit: randInt(0, 9) };
    map.books.push(bk);
  }
  // EXIT 的门（绿房间里）
  map.exitDoor = { type: "exitDoorEnd", x: mid, y: GY + 1, floor: 0 };
  map.props.push(map.exitDoor);
  // 深色门（橙房间左侧）+ 门边的四块凹槽
  map.darkDoor = { type: "darkDoorEnd", x: OX, y: mid, floor: 0 };
  map.props.push(map.darkDoor);
  const gOrder = ["purple", "red", "green", "blue"];
  for (let i = 0; i < 4; i++) {
    const gy = OY + 1 + i * 2;
    if (gy >= OY + OH - 1) break;
    const gr = { type: "grooveEnd", x: OX + 1, y: gy, floor: 0, color: gOrder[i] };
    map.grooves.push(gr); map.props.push(gr);
  }
  // =========================================================
  // 大厅正中：一台还在运行的电脑
  //   网线早就断了 —— 这里连不上任何网络，也打不开任何网址。
  //   硬盘里只有三个 .exe：H97Run / HELPPLEASE / TCI_BootUp。
  //   双击就能运行 —— 它们分别通往枢纽、Level 666，和破碎之地。
  // =========================================================
  {
    const pcx = mid, pcy = HY + Math.floor(HH / 2);
    if (grid[pcy] && grid[pcy][pcx] === 0) {
      // 把这一格及紧邻四格上的书架 / 柱子挪走，别把它们挡在电脑后面
      map.props = map.props.filter((q) => {
        if (q.type !== "shelfEnd" && q.type !== "pillarEnd" && q.type !== "bookEnd") return true;
        return Math.abs(q.x - pcx) > 1 || Math.abs(q.y - pcy) > 1;
      });
      map.books = map.books.filter((b) => Math.abs(b.x - pcx) > 1 || Math.abs(b.y - pcy) > 1);
      map.pc601 = { type: "pc601", x: pcx, y: pcy, floor: 0 };
      map.props.push(map.pc601);
    }
  }

  // 1.3.0：大厅右侧单独扩出去的一块地 —— 「假现实」。
  // 一片草地，四周被树围得死死的（树就是墙，过不去），中间一台售货机。
  if (typeof window.buildFakeReality === "function") window.buildFakeReality(map, size, grid);

  map.floors = [collectFloors(grid, size)];
  return map;
}

// ===========================================================
// 大厅正中那台还在运行的电脑
// ===========================================================
window.PROP_DRAW = window.PROP_DRAW || {};
window.PROP_DRAW["pc601"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : performance.now() / 1000);
  // 主机箱（立在地上）
  ctx.fillStyle = "#c8c2ac";
  ctx.fillRect(-T * 0.30, -T * 0.06, T * 0.60, T * 0.42);
  ctx.fillStyle = "#b0aa94";
  ctx.fillRect(-T * 0.30, -T * 0.06, T * 0.60, T * 0.05);
  // 软驱
  ctx.fillStyle = "#8e8a76";
  ctx.fillRect(-T * 0.22, T * 0.02, T * 0.30, T * 0.05);
  // 电源灯：一直在亮
  ctx.fillStyle = "#7ee6a8";
  ctx.beginPath(); ctx.arc(T * 0.20, T * 0.06, T * 0.035, 0, Math.PI * 2); ctx.fill();
  // 显示器
  ctx.fillStyle = "#d5cfb8";
  ctx.fillRect(-T * 0.34, -T * 0.62, T * 0.68, T * 0.52);
  ctx.fillStyle = "#1b1f26";
  ctx.fillRect(-T * 0.29, -T * 0.57, T * 0.58, T * 0.42);
  // 屏幕：三个 .exe 的图标，底下一个光标在闪
  ctx.fillStyle = "#2b3a4a";
  ctx.fillRect(-T * 0.26, -T * 0.54, T * 0.18, T * 0.16);
  ctx.fillRect(-T * 0.05, -T * 0.54, T * 0.18, T * 0.16);
  ctx.fillRect(0.16 * T - T * 0.09, -T * 0.54, T * 0.18, T * 0.16);
  // 光标：一闪一闪
  if ((t % 1) < 0.6) {
    ctx.fillStyle = "#e8f4ff";
    ctx.fillRect(-T * 0.26, -T * 0.32, T * 0.06, T * 0.035);
  }
  // 屏幕的玻璃反光
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.fillRect(-T * 0.29, -T * 0.57, T * 0.58, T * 0.08);
  // 键盘
  ctx.fillStyle = "#aba68f";
  ctx.fillRect(-T * 0.28, T * 0.36, T * 0.56, T * 0.10);
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  for (let i = 0; i < 8; i++) ctx.fillRect(-T * 0.25 + i * T * 0.065, T * 0.39, T * 0.04, T * 0.04);
};

// ===========================================================
// 新层级的地面 / 墙体绘制
// ===========================================================
