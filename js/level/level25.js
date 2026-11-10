// ===========================================================
// Level 25 —— 四分之一枢纽（电子游戏街机）
// 大型回音房间 + 80 年代街机（大多被砸坏）。少数完好的机器能送你去别的层级。
// 说明：本文件只放"这一层的地图怎么生成"，通用的地面/墙体/物件绘制在
//       levelNew.js 里按 style 分发（arcade）。
// ===========================================================
"use strict";

function generateArcadeMap(level) {
  const size = mapSizeFor(level);
  const built = buildRoomLayer(size, { roomW: [8, 14], roomH: [7, 12], density: 1.15, startRoom: 0 });
  const grid = built.grid, rooms = built.rooms;
  const start = { x: Math.floor(size / 2), y: Math.floor(size / 2), floor: 0 };
  const floors = collectFloors(grid, size);
  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [rooms],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props: [], crates: [], ground: [],
    arcade: null,          // 唯一一台完好的街机
    arcadeTo: [0, 5, 9, 11, 19, 37],
  };
  makeDoorsMap(map);
  const dist0 = (x, y) => Math.hypot(x - start.x, y - start.y);


  // 1) 沿房间内墙摆一排排街机（绝大多数是坏的）
  for (const r of rooms) {
    for (let x = r.x + 1; x < r.x + r.w - 1; x += 2) {
      for (const y of [r.y, r.y + r.h - 1]) {
        if (grid[y] == null || grid[y][x] !== 0) continue;
        if (Math.random() > 0.5) continue;
        map.props.push({ type: "arcade", x, y, floor: 0, broken: true });
      }
    }
    for (let y = r.y + 1; y < r.y + r.h - 1; y += 2) {
      for (const x of [r.x, r.x + r.w - 1]) {
        if (grid[y] == null || grid[y][x] !== 0) continue;
        if (Math.random() > 0.5) continue;
        map.props.push({ type: "arcade", x, y, floor: 0, broken: true });
      }
    }
  }

  // 2) 唯一一台完好的 —— 放在离出生点够远的地方
  const far = floors.filter((t) => dist0(t.x, t.y) > 16);
  if (far.length) {
    const a = far[randInt(0, far.length - 1)];
    // 必须有 type —— 靠近检测按 props 里的 type 找，漏了就永远识别不到它
    const to = map.arcadeTo[randInt(0, map.arcadeTo.length - 1)];
    map.arcadeToNow = to;
    map.arcade = { type: "arcade", x: a.x, y: a.y, floor: 0, broken: false, goTo: to };
    map.props.push(map.arcade);
    // 穿越处身后约 100 步的地方会有另一台 —— 这里是回去的那台
    const back = floors.filter((t) => Math.hypot(t.x - a.x, t.y - a.y) > 8 && dist0(t.x, t.y) > 10);
    if (back.length) {
      const b = back[randInt(0, back.length - 1)];
      map.props.push({ type: "arcade", x: b.x, y: b.y, floor: 0, broken: false, back: true, goTo: 0 });
    }
  }

  // 3) 次要走廊里的箱子 / 旧锅炉：里面有杏仁水和零食
  for (const r of rooms) {
    for (let i = 0; i < 2; i++) {
      const x = randInt(r.x, r.x + r.w - 1), y = randInt(r.y, r.y + r.h - 1);
      if (grid[y] == null || grid[y][x] !== 0) continue;
      if (dist0(x, y) < 4) continue;
      if (Math.random() < 0.45) {
        map.crates.push({ x, y, floor: 0, opened: false,
          contains: (Math.random() < 0.6 ? "almond" : "chips") });
      } else {
        map.props.push({ type: "boiler25", x, y, floor: 0, uses: 1 });
      }
    }
  }
  for (let i = 0; i < 14; i++) {
    const t = floors[randInt(0, floors.length - 1)];
    if (!t || dist0(t.x, t.y) < 5) continue;
    map.ground.push({ x: t.x, y: t.y, floor: 0,
      item: Math.random() < 0.6 ? "almond" : "chips", taken: false });
  }
  return map;
}

// ---------- Level 37：崇高（池房） / 37.1：血红池房 ----------
// 白色瓷砖 + 温水，房间尺寸怪诞。37 安全（泻盐让人放松，回理智），
// 37.1 是它的血红镜像：黑暗、红光、有特使。
// 一个区域至少两个出入口：不够就朝最近的房间再挖一条通道。
// 有的区域还会多开一条 —— 游泳馆那种一间连好几处的样子。

const ARCADE25_HOSTS = ["0", "5", "9", "11", "19", "37"];

