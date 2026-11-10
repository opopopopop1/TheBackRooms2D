// ===========================================================
// Level 9223372036854775807 —— 无尽的终章
// 编号超过 JS 安全整数上限，key 一律用字符串，任何地方都不要 parseFloat 它。
// 一圈环形楼梯，中间是 3x3 的空洞（空气墙拦着，只有正中间那格能站上去）。
// ===========================================================
"use strict";

function generateStairsMap(level) {
  // 无尽的终章：一圈环形的楼梯，正中间是 3x3 的空洞。
  // 绕着楼梯走满一圈就上一层 —— 一共五十层。走到顶之后再往下走回最底下，
  // 最底下原本深灰色的混凝土会变成白色（楼梯不会变白）。
  const size = 16;
  const cx = 8, cy = 8;
  const NF = 50;                      // 五十层
  const R0 = 2, R1 = 4.5;             // 环带：只有这一圈，三格宽
  const hole = new Set(), stair = new Set(), ring = new Set();
  const walk = new Set();             // 能站的（环带外圈）
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    if (Math.abs(x - cx) <= 1 && Math.abs(y - cy) <= 1) { hole.add(x + "," + y); continue; }
    const d = Math.hypot(x - cx, y - cy);
    if (d >= R0 - 0.4 && d <= R1) {
      ring.add(x + "," + y);
      // 左边那一截是楼梯，其余是深灰色的混凝土
      const a = Math.atan2(y - cy, x - cx);
      if (Math.abs(Math.abs(a) - Math.PI) < 0.85) stair.add(x + "," + y);
    }
  }
  const layers = [], floorsArr = [];
  // 中间那 3x3 里最里面的一格是真正的洞（掉下去），外圈一圈是护栏边（站得住）
  const holeCore = new Set([cx + "," + cy]);
  for (let f = 0; f < NF; f++) {
    const grid = makeGrid(size);
    for (const k of ring) { const q = k.split(","); grid[+q[1]][+q[0]] = 0; walk.add(k); }
    // 空洞：整片 3x3 都是"能看见但走不进去" —— 一格墙都不画，只靠空气墙拦。
    // 以前把外圈设成 grid=1 真墙，中间那格就被围死了，玩家根本到不了。
    for (const k of hole) { const q = k.split(","); grid[+q[1]][+q[0]] = 0; }
    layers.push(grid);
    floorsArr.push(collectFloors(grid, size));
  }
  // 楼梯的两端各放一个"隐形传送门"：走到尽头 -> 上一层；回到起点 -> 下一层。
  // 不画任何东西（看不见），也不弹任何提示，踩上去就换层 —— 无缝。
  // 注意：不能直接按 atan2 的原始值排序 —— 楼梯这一段跨着 ±π 的分界，
  // 直接排会把物理上相邻的两格排到首尾，结果"起点"和"尽头"挨在一起，
  // 玩家刚上楼就被起点的传送门送回去。
  // 把角度平移到以楼梯中心（正左方 π）为 0，区间就不跨边界了。
  const angOf = (p) => {
    let a = Math.atan2(p[1] - cy, p[0] - cx) - Math.PI;
    while (a > Math.PI) a -= Math.PI * 2;
    while (a < -Math.PI) a += Math.PI * 2;
    return a;
  };
  const sList = [...stair].map(k => k.split(",").map(Number))
    .sort((a, b) => angOf(a) - angOf(b));
  // 传送门取"整条径向"而不是单独一格 —— 环带有三格宽，只放一格的话
  // 玩家贴外圈绕就永远踩不到，看着像门不存在。
  const stairStart = new Set();   // 起点（较低那头）：逆时针走回来 -> 下一层
  const stairEnd   = new Set();   // 尽头（较高那头）：顺时针走过去 -> 上一层
  if (sList.length) {
    const a0 = angOf(sList[0]), a1 = angOf(sList[sList.length - 1]);
    for (const p of sList) {
      const a = angOf(p), k = p[0] + "," + p[1];
      if (Math.abs(a - a0) < 0.30) stairStart.add(k);
      else if (Math.abs(a - a1) < 0.30) stairEnd.add(k);
    }
    // 两端不能重合，否则一上一下立刻抵消
    for (const k of stairStart) stairEnd.delete(k);
  }
  // 顺时针 = 往上一层。给每一格记一个 0→1 的进度 t，绘制时按 t 做明暗渐变：
  // 越往前进方向越亮 = 越高，一眼就能分清哪头高哪头低。
  const ringList = [...ring].map(k => k.split(",").map(Number));
  const ringAng = (p) => {
    let a = Math.atan2(p[1] - cy, p[0] - cx);        // y 向下，角度增大 = 顺时针
    while (a < 0) a += Math.PI * 2;
    return a;
  };
  ringList.sort((a, b) => ringAng(a) - ringAng(b));
  const ringT = new Map();
  for (let i = 0; i < ringList.length; i++) {
    ringT.set(ringList[i][0] + "," + ringList[i][1], ringList.length > 1 ? i / (ringList.length - 1) : 0);
  }
  const stairT = new Map();
  for (let i = 0; i < sList.length; i++) {
    stairT.set(sList[i][0] + "," + sList[i][1], sList.length > 1 ? i / (sList.length - 1) : 0);
  }

  const start = { x: cx, y: cy + 3, floor: 0 };   // 出生在最底下
  layers[0][start.y][start.x] = 0;
  floorsArr[0] = collectFloors(layers[0], size);

  const map = {
    size, level, doubleStory: false,
    layers, floors: floorsArr, rooms: layers.map(() => []),
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props: [], crates: [], ground: [],
    stairCx: cx, stairCy: cy,
    holeTiles: hole,                // 中间的空洞（3x3）
    holeCore,                       // 正中间那一格（只在按 E 时作为目标，不参与站立判定）
    airWalls: new Set(hole),        // 空气墙：看不见、画不出，但走不进去
    ringInner: null,
    stairTiles: stair,              // 环形楼梯
    stairT, ringT,                  // 顺时针进度 t（0=低 / 1=高），绘制用
    stairStart, stairEnd,           // 楼梯两端的隐形传送门
    ringTiles: ring,                // 整个环带
    topFloor: NF - 1,               // 第 50 层 = 顶
    reachedTop: false,
    bottomWhite: false,             // 到过顶再回到最底下之后，混凝土变白
    lastAng: null, stairAcc: 0,     // 绕圈的累计角度
    dirSign: 1,                     // 最后一次明确的前进方向：+1 顺时针(上) / -1 逆时针(下)
  };
  makeDoorsMap(map);
  return map;
}

// ---------- Level 9223372036854775807.-1：缝合 ----------
// 过去与未来：把到过的层级各切一块，缝成这一层。
// 玩家到过的层级：从存档里读，用来拼这一层
