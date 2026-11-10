// ===========================================================
// Level 994 —— 存在于此（海滩）
// 潮水一直往上涨；碰到之后玩家会越走越慢，跟不上海水的速度就会消失。
// ===========================================================
"use strict";

function generateBeachMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  // 三面山（墙），东面是海
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const m = 3;
      const north = y < m, south = y >= size - m, west = x < m;
      grid[y][x] = (north || south || west) ? 1 : 0;
    }
  }
  const start = { x: 8, y: Math.floor(size / 2), floor: 0 };
  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [], rooms: [[]],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props: [], crates: [], ground: [],
    seaX: size - 4,          // 海浪当前推进到的列
    seaX0: size - 4,
    existDoor: { x: 5, y: Math.floor(size / 2), floor: 0 },   // 进来的那扇门就是出口
    doomed: false,           // 碰到海浪之后就注定要消失
  };
  makeDoorsMap(map);
  grid[start.y][start.x] = 0;
  grid[map.existDoor.y][map.existDoor.x] = 0;
  // 门前的沙地（保证走得到）
  for (let x = 4; x <= 10; x++) grid[start.y][x] = 0;
  map.floors = [collectFloors(grid, size)];
  map.props.push(map.existDoor);
  return map;
}

// ---------- Level 9223372036854775807：无尽的楼梯 ----------
// 俯视看到的是"一圈套一圈"的盘梯：从最外圈往里走 = 一层层往上爬。
// 环与环之间只有一个缺口，而且每一圈的缺口都不在同一个方向 ——
// 得绕着中庭走大半圈才找得到下一道的入口。正中间是空的（能望到底）。
