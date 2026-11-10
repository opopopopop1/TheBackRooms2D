// ===========================================================
// Level 78 —— 空间站
//   一座漂在虚空里的空间站。房间与房间之间一律是气闸门。
//   没有重力 —— 蹬一下就一直往前飘，松开手也停不下来，撞上墙才停。
//   墙上、地板上到处是舷窗：窗外只有星体，没有地球、没有月亮、没有太阳。
//   每个舷窗望出去的星空都不一样；星体会移动、会亮起、会熄灭。
//   盯着看太久的人会听见歌声，然后做出一些蠢事。
//   站外那个"直抵群星"正在靠近 —— 白色的，绕着一圈彩虹。
//   找到舷窗里显示着街道的那间救生舱，进去就能回 Level 11。
// ===========================================================
"use strict";

(function () {
  const v = ["#9aa2aa", "#8a929a", "#b8bec6"];
  // 不管本文件排在 levelNew.js 前面还是后面都登记得上 —— 登记丢了会掉进
  // drawPipeWall 兜底，整层变成管道 / 黑块（"一进 78 屏幕就黑"的老毛病）。
  (window.__NEWTILE_EXTRA = window.__NEWTILE_EXTRA || {})["station78"] = v;
  if (typeof regTile === "function") regTile("station78", v);
})();

function generateStationMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const props = [];
  const rooms = [];
  const star78 = new Set();          // 站在舷窗边上（盯久了会出事）
  const cross78 = [];                // 十字路口（钝人蹲的地方）

  const carve = (x, y) => { if (x > 0 && y > 0 && x < size - 1 && y < size - 1) grid[y][x] = 0; };

  // ---------- 走廊：横竖各五条，交点就是十字路口 ----------
  const HL = [], VL = [];
  for (let y = 12; y < size - 8; y += 16) HL.push(y);
  for (let x = 12; x < size - 8; x += 16) VL.push(x);
  for (const cy of HL) for (let x = 4; x < size - 4; x++) for (let d = -1; d <= 1; d++) carve(x, cy + d);
  for (const cx of VL) for (let y = 4; y < size - 4; y++) for (let d = -1; d <= 1; d++) carve(cx + d, y);

  // ---------- 走廊之间的街区里挖房间，用气闸门接回走廊 ----------
  const blocksY = [], blocksX = [];
  for (let i = 0; i < HL.length - 1; i++) blocksY.push([HL[i] + 2, HL[i + 1] - 2]);
  for (let j = 0; j < VL.length - 1; j++) blocksX.push([VL[j] + 2, VL[j + 1] - 2]);
  // 最外侧的走廊与地图边缘之间也留出房间
  blocksY.push([4, HL[0] - 2]);
  blocksY.push([HL[HL.length - 1] + 2, size - 5]);
  blocksX.push([4, VL[0] - 2]);
  blocksX.push([VL[VL.length - 1] + 2, size - 5]);

  const isFloor = (x, y) => grid[y] && grid[y][x] === 0;
  for (const by of blocksY) {
    for (const bx of blocksX) {
      const y0 = by[0], y1 = by[1], x0 = bx[0], x1 = bx[1];
      if (y1 - y0 < 4 || x1 - x0 < 4) continue;
      const rx0 = x0 + 1, rx1 = x1 - 1, ry0 = y0 + 1, ry1 = y1 - 1;
      if (rx1 - rx0 < 2 || ry1 - ry0 < 2) continue;
      for (let y = ry0; y <= ry1; y++) for (let x = rx0; x <= rx1; x++) carve(x, y);
      rooms.push({ x0: rx0, x1: rx1, y0: ry0, y1: ry1 });
    }
  }
  // 房间开一个口接走廊（口子上立一道气闸门）
  for (const r of rooms) {
    const sides = ["up", "down", "left", "right"];
    for (let k = sides.length - 1; k > 0; k--) { const q = randInt(0, k); const t = sides[k]; sides[k] = sides[q]; sides[q] = t; }
    let done = false;
    for (const s of sides) {
      let gx = -1, gy = -1;
      if (s === "up") { gx = randInt(r.x0 + 1, r.x1 - 1); gy = r.y0 - 1; }
      else if (s === "down") { gx = randInt(r.x0 + 1, r.x1 - 1); gy = r.y1 + 1; }
      else if (s === "left") { gx = r.x0 - 1; gy = randInt(r.y0 + 1, r.y1 - 1); }
      else { gx = r.x1 + 1; gy = randInt(r.y0 + 1, r.y1 - 1); }
      if (gx < 1 || gy < 1 || gx >= size - 1 || gy >= size - 1) continue;
      // 口子两侧再打通一格，免得只剩一条缝
      for (let d = -1; d <= 1; d++) { carve(gx + d, gy); carve(gx, gy + d); }
      if (!isFloor(gx, gy)) continue;
      // 气闸门（画在口子上，不挡路 —— 站里的门都开着）
      props.push({ x: gx, y: gy, floor: 0, type: "p78airlock", seed: randInt(0, 9), horiz: (s === "up" || s === "down") });
      done = true;
      break;
    }
    if (!done) continue;
  }

  // ---------- 十字路口 ----------
  for (const cy of HL) for (const cx of VL) cross78.push({ x: cx, y: cy });

  // ---------- 舷窗：装在走廊两侧的墙上 / 房间外墙上 ----------
  const wallOK = (x, y) => grid[y] && grid[y][x] === 1;
  const nearFloor = (x, y) => (isFloor(x - 1, y) || isFloor(x + 1, y) || isFloor(x, y - 1) || isFloor(x, y + 1));
  const portholes = [];
  for (const cy of HL) {
    for (let x = 8; x < size - 8; x += 3) {
      for (const yy of [cy - 2, cy + 2]) {
        if (wallOK(x, yy) && nearFloor(x, yy) && Math.random() < 0.5) { portholes.push({ x, y: yy }); break; }
      }
    }
  }
  for (const cx of VL) {
    for (let y = 8; y < size - 8; y += 3) {
      for (const xx of [cx - 2, cx + 2]) {
        if (wallOK(xx, y) && nearFloor(xx, y) && Math.random() < 0.45) { portholes.push({ x: xx, y }); break; }
      }
    }
  }
  for (const r of rooms) {
    const n = randInt(1, 2);
    for (let k = 0; k < n; k++) {
      const s = randInt(0, 3);
      let x, y;
      if (s === 0) { x = randInt(r.x0, r.x1); y = r.y0 - 1; }
      else if (s === 1) { x = randInt(r.x0, r.x1); y = r.y1 + 1; }
      else if (s === 2) { x = r.x0 - 1; y = randInt(r.y0, r.y1); }
      else { x = r.x1 + 1; y = randInt(r.y0, r.y1); }
      if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) continue;
      if (!wallOK(x, y)) continue;
      portholes.push({ x, y });
    }
  }
  for (const p of portholes) {
    props.push({ x: p.x, y: p.y, floor: 0, type: "p78porthole", seed: randInt(0, 99) });
    star78.add((p.x - 1) + "," + p.y); star78.add((p.x + 1) + "," + p.y);
    star78.add(p.x + "," + (p.y - 1)); star78.add(p.x + "," + (p.y + 1));
  }

  // ---------- 救生舱：半圆形的舱室，入口气闸门上有 EXIT 标志 ----------
  // 只有舷窗里显示着 Level 11 街道的那间才是真出口，其余的进去就是死。
  const pods = [];
  const podSpots = [];
  for (const r of rooms) podSpots.push(r);
  for (let i = podSpots.length - 1; i > 0; i--) { const q = randInt(0, i); const t = podSpots[i]; podSpots[i] = podSpots[q]; podSpots[q] = t; }
  const podN = Math.min(6, podSpots.length);
  const realPod = randInt(0, podN - 1);
  for (let i = 0; i < podN; i++) {
    const r = podSpots[i];
    const cx = randInt(r.x0 + 1, Math.max(r.x0 + 1, r.x1 - 1));
    const cy = randInt(r.y0 + 1, Math.max(r.y0 + 1, r.y1 - 1));
    if (!isFloor(cx, cy)) continue;
    const real = (i === realPod);
    props.push({ x: cx, y: cy, floor: 0, type: "p78pod", seed: randInt(0, 9), real, toLevel: real ? 11 : null });
    pods.push({ x: cx, y: cy, real });
  }

  // ---------- 星体异常多的舷窗：通往 Level 599 ----------
  // 档案：在你没被杀死前找到一处星体异常多的地方，可以到达 Level 599。
  const denseN = 2;
  const cand = portholes.slice();
  for (let i = cand.length - 1; i > 0; i--) { const q = randInt(0, i); const t = cand[i]; cand[i] = cand[q]; cand[q] = t; }
  for (let i = 0; i < Math.min(denseN, cand.length); i++) {
    props.push({ x: cand[i].x, y: cand[i].y, floor: 0, type: "p78dense", seed: randInt(0, 99) });
  }

  // ---------- 分离仓（开着的，里面浮着人）----------
  for (let i = 0; i < 3; i++) {
    const r = podSpots[(podN + i) % podSpots.length];
    if (!r) continue;
    const cx = randInt(r.x0, r.x1), cy = randInt(r.y0, r.y1);
    if (!isFloor(cx, cy)) continue;
    props.push({ x: cx, y: cy, floor: 0, type: "p78sep", seed: randInt(0, 9) });
  }

  // ---------- 房间里的陈设 ----------
  for (const r of rooms) {
    const cells = [];
    for (let y = r.y0; y <= r.y1; y++) for (let x = r.x0; x <= r.x1; x++) if (isFloor(x, y)) cells.push({ x, y });
    if (!cells.length) continue;
    const pick = () => cells[randInt(0, cells.length - 1)];
    const kind = randInt(0, 9);
    if (kind <= 2) {
      const c = pick();
      props.push({ x: c.x, y: c.y, floor: 0, type: "p78toilet", seed: randInt(0, 9) });   // 厕所（肢团）
    } else if (kind <= 4) {
      for (let k = 0; k < 2; k++) {
        const c = pick();
        props.push({ x: c.x, y: c.y, floor: 0, type: "p78bunk", seed: randInt(0, 9) });   // 睡舱
      }
    } else if (kind <= 7) {
      for (let k = 0; k < randInt(1, 3); k++) {
        const c = pick();
        props.push({ x: c.x, y: c.y, floor: 0, type: "p78crate", seed: randInt(0, 9) });  // 货箱
      }
    }
    // 墙上偶尔有控制面板
    const c2 = pick();
    for (const d of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      if (wallOK(c2.x + d[0], c2.y + d[1])) {
        props.push({ x: c2.x + d[0], y: c2.y + d[1], floor: 0, type: "p78panel", seed: randInt(0, 9) });
        break;
      }
    }
  }

  // ---------- 顶灯：沿走廊一盏盏排过去 ----------
  for (const cy of HL) for (let x = 8; x < size - 8; x += 6) if (isFloor(x, cy)) props.push({ x, y: cy, floor: 0, type: "p78light", seed: randInt(0, 9) });
  for (const cx of VL) for (let y = 8; y < size - 8; y += 6) if (isFloor(cx, y)) props.push({ x: cx, y, floor: 0, type: "p78light", seed: randInt(0, 9) });

  // ---------- 出口指示牌：指着真救生舱的方向 ----------
  if (pods.length) {
    const rp = pods.find((p) => p.real) || pods[0];
    for (const cy of HL) {
      const sx = (rp.x > cy ? 4 : size - 6);
      for (let x = 6; x < size - 6; x += 14) {
        if (!isFloor(x, cy)) continue;
        props.push({ x, y: cy, floor: 0, type: "p78sign", seed: randInt(0, 9), dir: (rp.x > cy ? 1 : -1) });
      }
    }
  }

  // ---------- 连通性兜底 ----------
  // 房间是各自在街区里挖出来的，开口那一格有可能凿在两个房间之间而不是凿在走廊上
  // —— 于是整间屋子就成了看得见、走不进去的摆设（实测最多能有一千多格死区）。
  // 这里把没连上的房间直接凿一条 L 形的通道，接到离它最近的可走格子上。
  const reachFrom = (sx, sy) => {
    const seen = new Set();
    if (grid[sy] && grid[sy][sx] === 1) return seen;
    const q = [[sx, sy]]; seen.add(sx + "," + sy);
    while (q.length) {
      const [x, y] = q.pop();
      for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + d[0], ny = y + d[1];
        if (nx < 1 || ny < 1 || nx >= size - 1 || ny >= size - 1) continue;
        if (grid[ny][nx] === 1) continue;
        const k = nx + "," + ny; if (seen.has(k)) continue;
        seen.add(k); q.push([nx, ny]);
      }
    }
    return seen;
  };
  const start = { x: VL[0], y: HL[0], floor: 0 };
  let hatchRoom = null, hatchCell = null, spawn78 = start;
  let seen78 = reachFrom(start.x, start.y);
  for (let guard = 0; guard < 40; guard++) {
    let fixed = false;
    for (const r of rooms) {
      if (r === hatchRoom) continue;   // 起始舱室是故意关着的，别给它凿通道
      const cx = (r.x0 + r.x1) >> 1, cy = (r.y0 + r.y1) >> 1;
      if (seen78.has(cx + "," + cy)) continue;
      let bx = -1, by = -1, bd = Infinity;
      for (const k of seen78) {
        const q2 = k.split(",");
        const d = Math.abs(+q2[0] - cx) + Math.abs(+q2[1] - cy);
        if (d < bd) { bd = d; bx = +q2[0]; by = +q2[1]; }
      }
      if (bx < 0) continue;
      let x = cx, y = cy;
      while (x !== bx) { x += (bx > x ? 1 : -1); carve(x, y); }
      while (y !== by) { y += (by > y ? 1 : -1); carve(x, y); }
      carve(cx, cy);
      fixed = true;
    }
    if (!fixed) break;
    seen78 = reachFrom(start.x, start.y);
  }

  // ---------- 起始舱室：一进这层，人被关在一间封闭舱室里 ----------
  // 舱门关着时就是一格墙；按 E 打开后放行，同时整座空间站开始漏高剂量辐射。
  if (rooms.length) {
    const r = rooms[randInt(0, Math.min(rooms.length - 1, 6))];
    hatchRoom = r;
    for (let y = r.y0 - 1; y <= r.y1 + 1; y++) {
      for (let x = r.x0 - 1; x <= r.x1 + 1; x++) {
        if (x === r.x0 - 1 || x === r.x1 + 1 || y === r.y0 - 1 || y === r.y1 + 1) grid[y][x] = 1;
      }
    }
    const hx = (r.x0 + r.x1) >> 1, hy = r.y0 - 1;
    grid[hy][hx] = 1;
    if (hy - 1 > 0) grid[hy - 1][hx] = 0;   // 门外一格接回走廊
    hatchCell = { x: hx, y: hy, open: false };
    props.push({ x: hx, y: hy, floor: 0, type: "p78hatch", seed: 2, horiz: true });
    spawn78 = { x: (r.x0 + r.x1) >> 1, y: (r.y0 + r.y1) >> 1, floor: 0 };
    // 舱室关着时，从站外是走不进来的 —— 原本撒在里面的出口（救生舱 / 密星窗）
    // 会变成"看得见走不到"的死出口。把它们挪到舱室外的房间里去。
    const outer = [];
    for (const rr of rooms) {
      if (rr === r) continue;
      for (let y = rr.y0; y <= rr.y1; y++) for (let x = rr.x0; x <= rr.x1; x++)
        if (grid[y][x] === 0) outer.push({ x, y });
    }
    for (const q of props) {
      if (q.type === "p78hatch" || (q.floor | 0) !== 0) continue;
      if (q.x < r.x0 || q.x > r.x1 || q.y < r.y0 || q.y > r.y1) continue;
      const t = outer.length ? outer[randInt(0, outer.length - 1)] : null;
      if (t) { q.x = t.x; q.y = t.y; }
    }
  }
  // 残破：断裂的管线、破洞、还在打火的火花 —— 画出来，不是文字
  for (let i = 0; i < 26; i++) {
    const r = rooms[randInt(0, rooms.length - 1)];
    if (!r || r === hatchRoom) continue;
    const x = randInt(r.x0, r.x1), y = randInt(r.y0, r.y1);
    if (!isFloor(x, y)) continue;
    props.push({ x, y, floor: 0, type: "p78debris", seed: randInt(0, 99) });
  }

  // 封舱壁之后，可能有原本撒在那一圈上的物件被压成了墙（救生舱就会变成
  // "看得见走不到"的死出口）。统一把它们挪到最近的可走格上；舱门除外，
  // 它本来就是一格关着的墙。
  for (const q of props) {
    if (q.type === "p78hatch" || (q.floor | 0) !== 0) continue;
    if (!grid[q.y] || grid[q.y][q.x] !== 1) continue;
    let bx = -1, by = -1, bd = Infinity;
    for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
      const nx = q.x + dx, ny = q.y + dy;
      if (nx < 1 || ny < 1 || nx >= size - 1 || ny >= size - 1) continue;
      if (grid[ny][nx] !== 0) continue;
      const d = Math.abs(dx) + Math.abs(dy);
      if (d < bd) { bd = d; bx = nx; by = ny; }
    }
    if (bx >= 0) { q.x = bx; q.y = by; }
  }

  const floors = collectFloors(grid, size);

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [rooms],
    start: spawn78, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [],
    star78, cross78, pods, hatch78: hatchCell,
    // 直抵群星：正在靠近的白光。倒计时归零 = 空间站被撞毁。
    anomalyLeft: 300, anomalyAt: 0, zapFlash: 0, zapCd: 22,
    pools: new Set(),
  };
  makeDoorsMap(map);
  return map;
}
window.generateStationMap = generateStationMap;

// ---------- 地面：浅灰的金属格栅板 ----------
window.drawStationFloor = function (ctx, px, py, S, map, tx, ty) {
  const k = tx + "," + ty;
  ctx.fillStyle = "#9aa2aa";
  ctx.fillRect(px, py, S, S);
  // 板的接缝
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(px, py, S, 1);
  ctx.fillRect(px, py, 1, S);
  // 防滑纹：一棱一棱的
  ctx.fillStyle = "rgba(255,255,255,0.10)";
  for (let i = 0; i < 3; i++) ctx.fillRect(px + 3, py + 5 + i * (S / 3.4), S - 6, 2);
  // 四角的铆钉
  ctx.fillStyle = "rgba(0,0,0,0.30)";
  const r = Math.max(1, S * 0.045);
  ctx.beginPath(); ctx.arc(px + S * 0.16, py + S * 0.16, r, 0, 6.2832); ctx.fill();
  ctx.beginPath(); ctx.arc(px + S * 0.84, py + S * 0.16, r, 0, 6.2832); ctx.fill();
  ctx.beginPath(); ctx.arc(px + S * 0.16, py + S * 0.84, r, 0, 6.2832); ctx.fill();
  ctx.beginPath(); ctx.arc(px + S * 0.84, py + S * 0.84, r, 0, 6.2832); ctx.fill();
  // 偶尔一块板是黄黑警示条（检修口）
  if (((tx * 7 + ty * 13) % 11) === 0) {
    ctx.fillStyle = "rgba(226,178,44,0.55)";
    ctx.fillRect(px + 2, py + 2, S - 4, S - 4);
    ctx.fillStyle = "rgba(30,26,20,0.55)";
    for (let i = -S; i < S; i += 8) {
      ctx.beginPath();
      ctx.moveTo(px + i, py + S); ctx.lineTo(px + i + 4, py + S);
      ctx.lineTo(px + i + 4 + S, py); ctx.lineTo(px + i + S, py);
      ctx.closePath(); ctx.fill();
    }
  }
  // 站在舷窗边上的那一格：被星光染上一层冷蓝（提醒你"这里有窗"）
  if (map.star78 && map.star78.has(k)) {
    ctx.fillStyle = "rgba(150,190,255,0.10)";
    ctx.fillRect(px, py, S, S);
  }
  return true;
};

// ---------- 墙：米白的舱壁板，带接缝与管线槽 ----------
window.drawStationWall = function (ctx, px, py, S, map, tx, ty) {
  ctx.fillStyle = "#b8bec6";
  ctx.fillRect(px, py, S, S);
  // 横向的板缝
  ctx.fillStyle = "rgba(0,0,0,0.16)";
  ctx.fillRect(px, py + S * 0.48, S, 2);
  ctx.fillStyle = "rgba(255,255,255,0.16)";
  ctx.fillRect(px, py + S * 0.48 + 2, S, 1);
  // 顶部一条管线槽
  ctx.fillStyle = "#8d949c";
  ctx.fillRect(px, py + S * 0.10, S, Math.max(2, S * 0.13));
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.fillRect(px, py + S * 0.10 + Math.max(2, S * 0.13) - 1, S, 1);
  // 板面上偶尔一颗铆钉 / 一块编号牌
  if (((tx * 5 + ty * 3) % 6) === 0) {
    ctx.fillStyle = "rgba(0,0,0,0.20)";
    ctx.beginPath(); ctx.arc(px + S * 0.5, py + S * 0.72, Math.max(1, S * 0.05), 0, 6.2832); ctx.fill();
  }
  if (((tx * 11 + ty * 7) % 17) === 0) {
    ctx.fillStyle = "rgba(40,44,50,0.55)";
    ctx.fillRect(px + S * 0.22, py + S * 0.24, S * 0.56, S * 0.10);
    ctx.fillStyle = "rgba(220,230,240,0.65)";
    ctx.fillRect(px + S * 0.28, py + S * 0.27, S * 0.10, S * 0.04);
    ctx.fillRect(px + S * 0.44, py + S * 0.27, S * 0.20, S * 0.04);
  }
  return true;
};

// ---------- 物件 ----------
window.PROP_DRAW = window.PROP_DRAW || {};

// 舷窗：圆窗，窗外是星。每个窗的星空都不一样 —— 星会移动、会亮起、会熄灭。
function drawPortholeStars(ctx, T, seed, dense) {
  const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
  const n = dense ? 46 : 22;
  for (let i = 0; i < n; i++) {
    const a = (seed * 7.13 + i * 2.399);
    const rr = 0.16 + ((i * 37 + seed * 13) % 100) / 100 * 0.78;
    const ang = a + t * (0.02 + ((i * 5 + seed) % 7) * 0.004);
    const sx = Math.cos(ang) * rr * T, sy = Math.sin(ang) * rr * T;
    // 星体本身可能会转变位置、出现或熄灭
    const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * (0.4 + ((i * 3 + seed) % 5) * 0.22) + i));
    const sz = (((i * 11 + seed) % 5) === 0 ? 2.4 : 1.4) * (dense ? 1.5 : 1);
    ctx.fillStyle = "rgba(255,255,255," + (tw * (dense ? 0.98 : 0.88)).toFixed(3) + ")";
    ctx.beginPath(); ctx.arc(sx, sy, sz, 0, 6.2832); ctx.fill();
    if (sz > 2) {
      ctx.fillStyle = "rgba(180,210,255," + (tw * 0.30).toFixed(3) + ")";
      ctx.beginPath(); ctx.arc(sx, sy, sz * 2.4, 0, 6.2832); ctx.fill();
    }
  }
  // 偶发：一颗星整个熄灭 / 一颗新星亮起
  const flick = Math.floor(t * 0.7 + seed) % 9;
  if (flick === 0) {
    const ang = (seed % 6) + t * 0.1;
    ctx.fillStyle = "rgba(255,240,200,0.9)";
    ctx.beginPath(); ctx.arc(Math.cos(ang) * T * 0.6, Math.sin(ang) * T * 0.5, 2.6, 0, 6.2832); ctx.fill();
  }
}

window.PROP_DRAW["p78porthole"] = function (ctx, p, T) {
  const R = T * 0.40;
  // 窗框：厚厚一圈金属
  ctx.fillStyle = "#7d848c";
  ctx.beginPath(); ctx.arc(0, 0, R * 1.20, 0, 6.2832); ctx.fill();
  ctx.fillStyle = "#9aa2aa";
  ctx.beginPath(); ctx.arc(0, 0, R * 1.05, 0, 6.2832); ctx.fill();
  // 窗内：深空
  ctx.fillStyle = "#0b1024";
  ctx.beginPath(); ctx.arc(0, 0, R, 0, 6.2832); ctx.fill();
  ctx.save();
  ctx.beginPath(); ctx.arc(0, 0, R, 0, 6.2832); ctx.clip();
  drawPortholeStars(ctx, R, p.seed || 3, false);
  ctx.restore();
  // 玻璃上的一道反光
  ctx.fillStyle = "rgba(255,255,255,0.14)";
  ctx.beginPath();
  ctx.ellipse(-R * 0.32, -R * 0.36, R * 0.52, R * 0.20, -0.6, 0, 6.2832);
  ctx.fill();
  // 框上的螺丝
  ctx.fillStyle = "#5c626a";
  for (let i = 0; i < 6; i++) {
    const a = i * 1.047 + 0.5;
    ctx.beginPath(); ctx.arc(Math.cos(a) * R * 1.12, Math.sin(a) * R * 1.12, Math.max(1, T * 0.028), 0, 6.2832); ctx.fill();
  }
};

// 星体异常多的舷窗 —— 通往 Level 599
window.PROP_DRAW["p78dense"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
  const R = T * 0.42;
  ctx.save();
  ctx.globalAlpha = 0.35 + 0.25 * Math.sin(t * 1.6);
  ctx.fillStyle = "#ffe9b0";
  ctx.beginPath(); ctx.arc(0, 0, R * 1.45, 0, 6.2832); ctx.fill();
  ctx.restore();
  ctx.fillStyle = "#6e7580";
  ctx.beginPath(); ctx.arc(0, 0, R * 1.18, 0, 6.2832); ctx.fill();
  ctx.fillStyle = "#141a34";
  ctx.beginPath(); ctx.arc(0, 0, R, 0, 6.2832); ctx.fill();
  ctx.save();
  ctx.beginPath(); ctx.arc(0, 0, R, 0, 6.2832); ctx.clip();
  drawPortholeStars(ctx, R, p.seed || 5, true);
  ctx.restore();
  // 边上挂一块牌子，写着这窗的编号（画成方块，不是文字）
  ctx.fillStyle = "rgba(255,236,190,0.85)";
  ctx.fillRect(-T * 0.30, T * 0.42, T * 0.60, T * 0.10);
  ctx.fillStyle = "rgba(40,36,30,0.8)";
  for (let i = 0; i < 3; i++) ctx.fillRect(-T * 0.24 + i * T * 0.16, T * 0.45, T * 0.10, T * 0.04);
};

// 救生舱：半圆形的舱室，入口是气闸门，门上有 EXIT 标志
window.PROP_DRAW["p78pod"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
  // 半圆舱体
  ctx.fillStyle = "#8d949c";
  ctx.beginPath();
  ctx.arc(0, T * 0.10, T * 0.46, Math.PI, 0);
  ctx.lineTo(T * 0.46, T * 0.42);
  ctx.lineTo(-T * 0.46, T * 0.42);
  ctx.closePath(); ctx.fill();
  // 舱体上的一圈加强肋
  ctx.strokeStyle = "rgba(0,0,0,0.22)"; ctx.lineWidth = 1.4;
  for (let i = 1; i <= 2; i++) {
    ctx.beginPath();
    ctx.arc(0, T * 0.10, T * 0.46 * (i / 3), Math.PI, 0);
    ctx.stroke();
  }
  // 舱内的光
  ctx.fillStyle = p.real ? "rgba(120,200,255,0.35)" : "rgba(80,90,110,0.35)";
  ctx.fillRect(-T * 0.30, -T * 0.20, T * 0.60, T * 0.30);
  // 舱里那个小舷窗：真的那条是 Level 11 的街道，假的是星
  ctx.fillStyle = "#0b1024";
  ctx.beginPath(); ctx.arc(0, -T * 0.06, T * 0.20, 0, 6.2832); ctx.fill();
  ctx.save();
  ctx.beginPath(); ctx.arc(0, -T * 0.06, T * 0.20, 0, 6.2832); ctx.clip();
  if (p.real) {
    // 一条街：暗蓝的天、两边的楼、路灯
    ctx.fillStyle = "#1d2340"; ctx.fillRect(-T * 0.20, -T * 0.26, T * 0.40, T * 0.40);
    ctx.fillStyle = "#2b3455";
    ctx.fillRect(-T * 0.20, -T * 0.14, T * 0.11, T * 0.28);
    ctx.fillRect(T * 0.09, -T * 0.16, T * 0.11, T * 0.30);
    ctx.fillStyle = "rgba(255,214,120,0.95)";
    for (let i = 0; i < 3; i++) ctx.fillRect(-T * 0.17 + i * T * 0.13, -T * 0.11, 1.8, 1.8);
    ctx.fillStyle = "rgba(255,236,180,0.55)";
    ctx.fillRect(-T * 0.09, -T * 0.02, T * 0.18, T * 0.03);
  } else {
    drawPortholeStars(ctx, T * 0.20, (p.seed || 1) + 40, false);
  }
  ctx.restore();
  // 门上的 EXIT 标志（绿底白块）
  const on = 0.55 + 0.45 * Math.sin(t * 2.4);
  ctx.fillStyle = "#1f8a4a";
  ctx.fillRect(-T * 0.22, T * 0.16, T * 0.44, T * 0.15);
  ctx.fillStyle = "rgba(240,255,246," + on.toFixed(3) + ")";
  for (let i = 0; i < 4; i++) ctx.fillRect(-T * 0.17 + i * T * 0.09, T * 0.20, T * 0.06, T * 0.055);
  ctx.save();
  ctx.globalAlpha = 0.22 * on;
  ctx.fillStyle = "#3ce07a";
  ctx.fillRect(-T * 0.25, T * 0.13, T * 0.50, T * 0.21);
  ctx.restore();
};

// 分离仓：开着，里面浮着一个人 —— 他的肺早就被抽干了
window.PROP_DRAW["p78sep"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
  const bob = Math.sin(t * 0.9 + (p.seed || 0)) * T * 0.04;
  ctx.fillStyle = "#6e7580";
  ctx.beginPath(); ctx.ellipse(0, T * 0.05, T * 0.44, T * 0.40, 0, 0, 6.2832); ctx.fill();
  ctx.fillStyle = "#0e1420";
  ctx.beginPath(); ctx.ellipse(0, T * 0.05, T * 0.34, T * 0.30, 0, 0, 6.2832); ctx.fill();
  // 舱门开着：两扇往两边掀
  ctx.fillStyle = "#9aa2aa";
  ctx.fillRect(-T * 0.46, -T * 0.06, T * 0.12, T * 0.30);
  ctx.fillRect(T * 0.34, -T * 0.06, T * 0.12, T * 0.30);
  // 里面浮着的人
  ctx.fillStyle = "rgba(214,206,196,0.92)";
  ctx.beginPath(); ctx.arc(bob * 0.6, T * 0.02 + bob, T * 0.09, 0, 6.2832); ctx.fill();
  ctx.fillRect(-T * 0.07 + bob * 0.6, T * 0.10 + bob, T * 0.14, T * 0.20);
  ctx.fillStyle = "rgba(150,140,130,0.9)";
  ctx.fillRect(-T * 0.07 + bob * 0.6, T * 0.10 + bob, T * 0.05, T * 0.18);
  ctx.fillRect(T * 0.02 + bob * 0.6, T * 0.10 + bob, T * 0.05, T * 0.18);
  // 舱口的指示灯：红的
  ctx.fillStyle = "#e0403a";
  ctx.beginPath(); ctx.arc(T * 0.30, -T * 0.22, T * 0.045, 0, 6.2832); ctx.fill();
};

// 气闸门：站里房间与房间之间都是这个
window.PROP_DRAW["p78airlock"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
  const w = T * 0.92, h = T * 0.92;
  ctx.fillStyle = "#7d848c";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#99a0a8";
  ctx.fillRect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 6);
  // 门缝
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  if (p.horiz) ctx.fillRect(-w / 2 + 3, -1, w - 6, 2); else ctx.fillRect(-1, -h / 2 + 3, 2, h - 6);
  // 中间的圆形观察窗（开着，能看见对面）
  ctx.fillStyle = "#20283a";
  ctx.beginPath(); ctx.arc(0, 0, T * 0.20, 0, 6.2832); ctx.fill();
  ctx.fillStyle = "rgba(140,180,230,0.25)";
  ctx.beginPath(); ctx.arc(0, 0, T * 0.20, 0, 6.2832); ctx.fill();
  ctx.strokeStyle = "#5c626a"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, 0, T * 0.20, 0, 6.2832); ctx.stroke();
  // 门边的状态灯：绿=开着
  const on = 0.5 + 0.5 * Math.sin(t * 3 + (p.seed || 0));
  ctx.fillStyle = "rgba(70,220,120," + (0.55 + 0.45 * on).toFixed(3) + ")";
  ctx.fillRect(T * 0.34, -T * 0.40, T * 0.08, T * 0.08);
  // 转轮
  ctx.strokeStyle = "#5c626a"; ctx.lineWidth = Math.max(2, T * 0.05);
  ctx.beginPath(); ctx.arc(0, T * 0.30, T * 0.10, 0, 6.2832); ctx.stroke();
};

// 墙上的控制面板
window.PROP_DRAW["p78panel"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
  ctx.fillStyle = "#4a5058";
  ctx.fillRect(-T * 0.32, -T * 0.26, T * 0.64, T * 0.52);
  ctx.fillStyle = "#171c26";
  ctx.fillRect(-T * 0.27, -T * 0.21, T * 0.54, T * 0.30);
  // 屏幕上一条条跳动的读数
  for (let i = 0; i < 4; i++) {
    const w = T * (0.10 + 0.30 * Math.abs(Math.sin(t * (0.8 + i * 0.3) + (p.seed || 0) + i)));
    ctx.fillStyle = i === 1 ? "rgba(120,220,160,0.8)" : "rgba(110,170,230,0.7)";
    ctx.fillRect(-T * 0.24, -T * 0.18 + i * T * 0.07, w, T * 0.035);
  }
  // 底下几个按钮
  ctx.fillStyle = "#6a7078";
  for (let i = 0; i < 3; i++) ctx.fillRect(-T * 0.22 + i * T * 0.16, T * 0.14, T * 0.10, T * 0.08);
};

// 顶灯
window.PROP_DRAW["p78light"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
  const on = 0.72 + 0.28 * Math.sin(t * 1.2 + (p.seed || 0));
  ctx.save();
  ctx.globalAlpha = 0.20 * on;
  ctx.fillStyle = "#dfe8f5";
  ctx.beginPath(); ctx.arc(0, 0, T * 0.75, 0, 6.2832); ctx.fill();
  ctx.restore();
  ctx.fillStyle = "#c8d2dc";
  ctx.fillRect(-T * 0.34, -T * 0.08, T * 0.68, T * 0.16);
  ctx.fillStyle = "rgba(255,255,255," + (0.55 + 0.4 * on).toFixed(3) + ")";
  ctx.fillRect(-T * 0.30, -T * 0.05, T * 0.60, T * 0.06);
};

// 睡舱：壁上一个个凹进去的铺位
window.PROP_DRAW["p78bunk"] = function (ctx, p, T) {
  ctx.fillStyle = "#7d848c";
  ctx.fillRect(-T * 0.40, -T * 0.34, T * 0.80, T * 0.68);
  ctx.fillStyle = "#2a3038";
  ctx.fillRect(-T * 0.34, -T * 0.28, T * 0.68, T * 0.56);
  ctx.fillStyle = "#3e4650";
  ctx.fillRect(-T * 0.34, -T * 0.28, T * 0.68, T * 0.16);
  // 铺盖
  ctx.fillStyle = "#5c6470";
  ctx.fillRect(-T * 0.30, -T * 0.06, T * 0.60, T * 0.28);
  ctx.fillStyle = "rgba(255,255,255,0.10)";
  ctx.fillRect(-T * 0.30, -T * 0.06, T * 0.60, T * 0.04);
  // 舱门上的小窗
  ctx.fillStyle = "rgba(140,180,230,0.30)";
  ctx.fillRect(-T * 0.26, -T * 0.24, T * 0.52, T * 0.10);
};

// 货箱
window.PROP_DRAW["p78crate"] = function (ctx, p, T) {
  ctx.fillStyle = "#6e7580";
  ctx.fillRect(-T * 0.34, -T * 0.30, T * 0.68, T * 0.60);
  ctx.fillStyle = "#7d848c";
  ctx.fillRect(-T * 0.30, -T * 0.26, T * 0.60, T * 0.24);
  ctx.strokeStyle = "rgba(0,0,0,0.30)"; ctx.lineWidth = 1.5;
  ctx.strokeRect(-T * 0.34, -T * 0.30, T * 0.68, T * 0.60);
  // 标签
  ctx.fillStyle = "rgba(240,240,235,0.75)";
  ctx.fillRect(-T * 0.22, -T * 0.02, T * 0.30, T * 0.12);
  ctx.fillStyle = "rgba(40,40,40,0.7)";
  for (let i = 0; i < 3; i++) ctx.fillRect(-T * 0.18 + i * T * 0.09, T * 0.02, T * 0.05, T * 0.04);
};

// 厕所隔间（肢团住的地方）
window.PROP_DRAW["p78toilet"] = function (ctx, p, T) {
  ctx.fillStyle = "#8d949c";
  ctx.fillRect(-T * 0.38, -T * 0.40, T * 0.76, T * 0.80);
  ctx.fillStyle = "#a8afb7";
  ctx.fillRect(-T * 0.32, -T * 0.34, T * 0.64, T * 0.68);
  // 门缝
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(-T * 0.02, -T * 0.34, 2, T * 0.68);
  // 门把手
  ctx.fillStyle = "#5c626a";
  ctx.fillRect(T * 0.04, -T * 0.04, T * 0.07, T * 0.04);
  // 门上的标识：一个小小的人形（画出来）
  ctx.fillStyle = "rgba(60,72,88,0.75)";
  ctx.beginPath(); ctx.arc(-T * 0.12, -T * 0.18, T * 0.05, 0, 6.2832); ctx.fill();
  ctx.fillRect(-T * 0.15, -T * 0.12, T * 0.06, T * 0.20);
  // 底下透出的一点水渍
  ctx.fillStyle = "rgba(60,90,110,0.35)";
  ctx.fillRect(-T * 0.34, T * 0.30, T * 0.68, T * 0.06);
};

// 出口指示牌：箭头指着真救生舱的方向
window.PROP_DRAW["p78sign"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
  const d = (p.dir === -1) ? -1 : 1;
  ctx.fillStyle = "#1f8a4a";
  ctx.fillRect(-T * 0.30, -T * 0.14, T * 0.60, T * 0.28);
  ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = 1;
  ctx.strokeRect(-T * 0.30, -T * 0.14, T * 0.60, T * 0.28);
  // 箭头（画出来，不是字）
  ctx.fillStyle = "rgba(240,255,246," + (0.6 + 0.4 * Math.sin(t * 2.6)).toFixed(3) + ")";
  ctx.beginPath();
  ctx.moveTo(d * T * 0.22, 0);
  ctx.lineTo(d * T * 0.02, -T * 0.09);
  ctx.lineTo(d * T * 0.02, -T * 0.035);
  ctx.lineTo(-d * T * 0.22, -T * 0.035);
  ctx.lineTo(-d * T * 0.22, T * 0.035);
  ctx.lineTo(d * T * 0.02, T * 0.035);
  ctx.lineTo(d * T * 0.02, T * 0.09);
  ctx.closePath(); ctx.fill();
};

// Level 11 街上那扇形似气闸的门 —— 通往这座空间站
window.PROP_DRAW["gate78"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
  // 门框：厚重金属，结着霜
  ctx.fillStyle = "#8d949c";
  ctx.fillRect(-T * 0.40, -T * 0.46, T * 0.80, T * 0.92);
  ctx.fillStyle = "#99a0a8";
  ctx.fillRect(-T * 0.34, -T * 0.40, T * 0.68, T * 0.80);
  // 门缝里透出来的冷白光
  const on = 0.6 + 0.4 * Math.sin(t * 1.8);
  ctx.fillStyle = "rgba(210,232,255," + (0.30 + 0.35 * on).toFixed(3) + ")";
  ctx.fillRect(-T * 0.02, -T * 0.40, T * 0.04, T * 0.80);
  // 中央的圆形观察窗
  ctx.fillStyle = "#20283a";
  ctx.beginPath(); ctx.arc(0, -T * 0.10, T * 0.16, 0, 6.2832); ctx.fill();
  ctx.fillStyle = "rgba(170,210,255," + (0.35 + 0.4 * on).toFixed(3) + ")";
  ctx.beginPath(); ctx.arc(0, -T * 0.10, T * 0.16, 0, 6.2832); ctx.fill();
  ctx.strokeStyle = "#5c626a"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, -T * 0.10, T * 0.16, 0, 6.2832); ctx.stroke();
  // 转轮
  ctx.strokeStyle = "#5c626a"; ctx.lineWidth = Math.max(2, T * 0.05);
  ctx.beginPath(); ctx.arc(0, T * 0.18, T * 0.11, 0, 6.2832); ctx.stroke();
  // 霜：门框上一层白
  ctx.fillStyle = "rgba(226,240,255,0.55)";
  ctx.fillRect(-T * 0.40, -T * 0.46, T * 0.80, T * 0.06);
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = "rgba(240,250,255,0.30)";
    ctx.fillRect(-T * 0.34 + i * T * 0.15, T * 0.30 + (i % 2) * T * 0.06, T * 0.09, T * 0.03);
  }
};

// ---------- 整屏效果：站外那个"直抵群星" ----------
// 一团白光，绕着一圈彩虹。它会突然变亮 —— 那是微波束已经到了
// （微波和可见光跑得一样快，你看见它的时候，它已经穿过站体了）。
window.drawStation = function (ctx, g) {
  const cw = (ctx.canvas && ctx.canvas.width) || 800;
  const ch = (ctx.canvas && ctx.canvas.height) || 600;
  const t = performance.now() / 1000;
  const m = g.map;
  ctx.save();
  try { ctx.setTransform(1, 0, 0, 1, 0, 0); } catch (e) { /* 忽略 */ }
  // 越接近碰撞，站里的光越白
  const left = (m && m.anomalyLeft != null) ? m.anomalyLeft : 300;
  const prog = Math.max(0, Math.min(1, 1 - left / 300));
  // 那团白光：从右上角一点点涨大
  const R = ch * (0.10 + 0.18 * prog);
  const cx = cw * 0.80, cy = ch * 0.20;
  const grd = ctx.createRadialGradient(cx, cy, R * 0.12, cx, cy, R * 2.1);
  grd.addColorStop(0, "rgba(255,255,255," + (0.75 + 0.2 * prog).toFixed(3) + ")");
  grd.addColorStop(0.35, "rgba(255,240,220,0.35)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grd;
  ctx.beginPath(); ctx.arc(cx, cy, R * 2.1, 0, 6.2832); ctx.fill();
  // 绕着它的一圈彩虹
  const hues = ["#ff5a5a", "#ffb04a", "#ffe94a", "#5ce07a", "#4ad4ff", "#7a6aff", "#e07aff"];
  for (let i = 0; i < hues.length; i++) {
    ctx.strokeStyle = hues[i];
    ctx.globalAlpha = 0.22 + 0.18 * Math.sin(t * 1.4 + i);
    ctx.lineWidth = 2 + (i % 3);
    ctx.beginPath();
    ctx.arc(cx, cy, R * (1.02 + i * 0.055) + Math.sin(t * 0.8 + i) * 3, 0, 6.2832);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // 微波束打进来：整屏一瞬的白（耳朵里会咔哒一声）
  if (m && m.zapFlash > 0) {
    ctx.fillStyle = "rgba(255,255,255," + Math.min(0.75, m.zapFlash).toFixed(3) + ")";
    ctx.fillRect(0, 0, cw, ch);
  }
  // 边缘暗角：只压四条边。以前是整屏铺一层 rgba(10,16,28,0.10~0.16)，
  // 而且 cw/ch 用的是物理像素 —— 高 DPR 设备上叠加后画面会发黑（一进 78 就黑）。
  const W = cw, H2 = ch, edge = Math.min(W, H2) * 0.18;
  const a = (0.14 + 0.05 * Math.sin(t * 0.7)).toFixed(3);
  const bands = [
    [0, 0, W, edge, 0, 0, 0, edge],
    [0, H2 - edge, W, edge, 0, H2, 0, H2 - edge],
    [0, 0, edge, H2, 0, 0, edge, 0],
    [W - edge, 0, edge, H2, W, 0, W - edge, 0],
  ];
  for (const b of bands) {
    const gr = ctx.createLinearGradient(b[4], b[5], b[6], b[7]);
    gr.addColorStop(0, "rgba(10,16,28," + a + ")");
    gr.addColorStop(1, "rgba(10,16,28,0)");
    ctx.fillStyle = gr;
    ctx.fillRect(b[0], b[1], b[2], b[3]);
  }
  ctx.restore();
};


// 舱门：关着时是一整块封死的金属闸门；打开后两扇往两边掀开
window.PROP_DRAW["p78hatch"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
  const open = !!(p.open);
  ctx.fillStyle = "#4e545c";
  ctx.fillRect(-T * 0.48, -T * 0.48, T * 0.96, T * 0.96);
  ctx.fillStyle = "#7d848c";
  ctx.fillRect(-T * 0.42, -T * 0.42, T * 0.84, T * 0.84);
  // 危险条纹
  ctx.fillStyle = "rgba(226,178,44,0.85)";
  for (let i = -3; i <= 3; i++) ctx.fillRect(-T * 0.42 + i * T * 0.14, -T * 0.42, T * 0.06, T * 0.10);
  if (open) {
    ctx.fillStyle = "#1b2029";
    ctx.fillRect(-T * 0.24, -T * 0.34, T * 0.48, T * 0.68);
    ctx.fillStyle = "rgba(150,220,255,0.25)";
    ctx.fillRect(-T * 0.24, -T * 0.34, T * 0.48, T * 0.10);
  } else {
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(-T * 0.02, -T * 0.40, T * 0.04, T * 0.80);
    // 转轮
    ctx.strokeStyle = "#5c626a"; ctx.lineWidth = Math.max(2, T * 0.07);
    ctx.beginPath(); ctx.arc(0, 0, T * 0.20, 0, 6.2832); ctx.stroke();
    for (let i = 0; i < 4; i++) {
      const ang = i * 1.571 + t * 0.5;
      ctx.beginPath(); ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(ang) * T * 0.20, Math.sin(ang) * T * 0.20); ctx.stroke();
    }
  }
  // 红色警示灯
  ctx.fillStyle = "rgba(240,70,60," + (0.45 + 0.55 * Math.abs(Math.sin(t * 3))).toFixed(3) + ")";
  ctx.beginPath(); ctx.arc(T * 0.33, -T * 0.33, T * 0.06, 0, 6.2832); ctx.fill();
};

// 残骸：破洞、断掉的管线、还在打火的线头
window.PROP_DRAW["p78debris"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
  const s = p.seed || 3;
  // 地板上裂开的破洞
  ctx.fillStyle = "#151a20";
  ctx.beginPath();
  ctx.ellipse(-T * 0.08, T * 0.06, T * 0.28, T * 0.16, 0.4, 0, 6.2832);
  ctx.fill();
  ctx.strokeStyle = "rgba(180,190,200,0.55)"; ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-T * 0.38, -T * 0.10); ctx.lineTo(-T * 0.16, T * 0.02);
  ctx.lineTo(T * 0.02, -T * 0.12); ctx.lineTo(T * 0.30, T * 0.14);
  ctx.stroke();
  // 断掉的管线
  ctx.strokeStyle = "#5a626b"; ctx.lineWidth = Math.max(2, T * 0.09);
  ctx.beginPath();
  ctx.moveTo(-T * 0.40, T * 0.30); ctx.lineTo(-T * 0.10, T * 0.30);
  ctx.lineTo(T * 0.06, T * 0.16); ctx.stroke();
  // 打火
  if ((Math.floor(t * 3 + s) % 4) === 0) {
    ctx.fillStyle = "rgba(255,220,120,0.9)";
    ctx.beginPath(); ctx.arc(T * 0.10, T * 0.12, T * 0.05, 0, 6.2832); ctx.fill();
    ctx.fillStyle = "rgba(255,170,60,0.35)";
    ctx.beginPath(); ctx.arc(T * 0.10, T * 0.12, T * 0.13, 0, 6.2832); ctx.fill();
  }
  // 锈迹
  ctx.fillStyle = "rgba(150,86,40,0.35)";
  ctx.fillRect(T * 0.16, -T * 0.36, T * 0.20, T * 0.10);
};
