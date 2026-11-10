// ===========================================================
// Level 20 —— 波瑞阿斯建筑 / 娱乐区
//   · 两个区域：左边「等候厅」，右边「霓虹区」。
//     等候厅：白色混凝土的走廊，棕色地毯，天花板是灰色瓷砖；
//             到处都是窗，窗外是群星点缀的黑色虚空，偶尔看得见月亮。
//             窗 10 米之内温度会掉到 -22℃ ~ -43℃ —— 头痛、极度偏执。
//     霓虹区：黑色瓷砖天花板、灰色地毯、霓虹灯；走廊是缓缓下坡的，
//             坡度小到几乎察觉不到；越往里越冷（最低 -27℃）。
//   · 天花板会时不时有橙色果冻状物质掉下来（目前没发现它有危害）。
//   · 霓虹区里有一排通往各种「游戏」的门 —— 赢了给补给，输了要命。
//   · 出口：等候厅的员工专用门 -> Level 2；切入窗户 -> Level 78（空间站）；
//           霓虹区那些游戏门里有极小概率是真的出口（4 / 21 / 36），边上总有出口标志。
// ===========================================================
"use strict";

(function () {
  const v = ["#8a6844", "#7a5b3a"];
  if (typeof regTile === "function") regTile("boreas20", v);
  else { (window.__NEWTILE_EXTRA = window.__NEWTILE_EXTRA || {})["boreas20"] = v; }
})();

function generateBoreasMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const props = [];
  const splitX = Math.floor(size * 0.46);      // 左边等候厅 / 右边霓虹区
  const cold20 = new Set();                    // 窗附近的低温格（站进去会偏执 + 掉血）
  const neon20 = new Set();                    // 霓虹区的地板（越往里越冷）

  const carve = (x, y) => { if (x > 0 && y > 0 && x < size - 1 && y < size - 1) grid[y][x] = 0; };

  // ================= 等候厅（左半边）=================
  const HL = [], VL = [];
  for (let y = 9; y < size - 9; y += 14) HL.push(y);
  for (let x = 9; x < splitX - 3; x += 14) VL.push(x);
  for (const cy of HL) for (let x = 3; x < splitX; x++) for (let d = -1; d <= 1; d++) carve(x, cy + d);
  for (const cx of VL) for (let y = 3; y < size - 3; y++) for (let d = -1; d <= 1; d++) carve(cx + d, y);

  const rooms = [];
  for (let i = 0; i < HL.length - 1; i++) {
    for (let j = 0; j < VL.length - 1; j++) {
      const y0 = HL[i] + 2, y1 = HL[i + 1] - 2;
      const x0 = VL[j] + 2, x1 = VL[j + 1] - 2;
      if (y1 - y0 < 3 || x1 - x0 < 3) continue;
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) carve(x, y);
      rooms.push({ x0, x1, y0, y1, cx: (x0 + x1) >> 1, cy: (y0 + y1) >> 1 });
    }
  }
  // 每间等候区开 2~3 个口通向走廊
  const openAt = (x, y) => { for (let d = -1; d <= 1; d++) { carve(x, y + d); carve(x + d, y); } };
  for (const r of rooms) {
    const sides = ["up", "down", "left", "right"];
    for (let k = sides.length - 1; k > 0; k--) { const q = randInt(0, k); const t = sides[k]; sides[k] = sides[q]; sides[q] = t; }
    const n = randInt(2, 3);
    for (let k = 0; k < n; k++) {
      const s = sides[k];
      if (s === "up") openAt(randInt(r.x0 + 1, r.x1 - 1), r.y0 - 1);
      else if (s === "down") openAt(randInt(r.x0 + 1, r.x1 - 1), r.y1 + 1);
      else if (s === "left") openAt(r.x0 - 1, randInt(r.y0 + 1, r.y1 - 1));
      else openAt(r.x1 + 1, randInt(r.y0 + 1, r.y1 - 1));
    }
  }

  // ================= 霓虹区（右半边）=================
  // 一个个大厅，厅与厅之间用宽走廊连起来 —— 走廊就是缓缓下坡的坡道
  const nx0 = splitX + 4, nx1 = size - 4, ny0 = 5, ny1 = size - 5;
  const C = 3, R = 3;
  const hw = Math.floor((nx1 - nx0) / C), hh = Math.floor((ny1 - ny0) / R);
  const halls = [];
  for (let j = 0; j < R; j++) for (let i = 0; i < C; i++) {
    const x0 = nx0 + i * hw + 2, x1 = nx0 + (i + 1) * hw - 3;
    const y0 = ny0 + j * hh + 2, y1 = ny0 + (j + 1) * hh - 3;
    if (x1 - x0 < 5 || y1 - y0 < 5) continue;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) carve(x, y);
    halls.push({ x0, x1, y0, y1, cx: (x0 + x1) >> 1, cy: (y0 + y1) >> 1, i, j });
  }
  // 厅与厅之间打通（横竖都连），走廊宽 3
  for (const h of halls) {
    if (h.i < C - 1) { const y = h.cy; for (let x = h.x1; x <= h.x1 + 4; x++) for (let d = -1; d <= 1; d++) carve(x, y + d); }
    if (h.j < R - 1) { const x = h.cx; for (let y = h.y1; y <= h.y1 + 4; y++) for (let d = -1; d <= 1; d++) carve(x + d, y); }
  }

  // ================= 两个区域之间的连接 =================
  const midY = size >> 1;
  for (let x = splitX - 4; x <= splitX + 6; x++) for (let d = -1; d <= 1; d++) carve(x, midY + d);
  // 等候厅最右边那条走廊要能横着走到连接口
  for (let y = 3; y < size - 3; y++) for (let d = -1; d <= 1; d++) carve(splitX - 3 + d, y);

  // 霓虹区的地板记下来（越往右越冷）
  for (let y = 1; y < size - 1; y++) for (let x = splitX + 1; x < size - 1; x++) {
    if (grid[y][x] === 0) neon20.add(x + "," + y);
  }

  // ================= 出生点 =================
  const start = { x: (VL[0] || 9), y: (HL[0] || 9), floor: 0 };
  if (grid[start.y][start.x] !== 0) {
    outer: for (let y = 3; y < size - 3; y++) for (let x = 3; x < splitX; x++) {
      if (grid[y][x] === 0) { start.x = x; start.y = y; break outer; }
    }
  }

  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return null;
    const o = Object.assign({ x, y, floor: 0, type }, extra || {});
    props.push(o);
    return o;
  };

  // ---- 找墙面上的位置（贴着地板的墙）----
  const wallSpots = (minX, maxX, minY, maxY) => {
    const out = [];
    for (let y = Math.max(1, minY); y <= Math.min(size - 2, maxY); y++) {
      for (let x = Math.max(1, minX); x <= Math.min(size - 2, maxX); x++) {
        if (grid[y][x] !== 1) continue;
        let touch = false;
        if (grid[y - 1][x] === 0 || grid[y + 1][x] === 0 || grid[y][x - 1] === 0 || grid[y][x + 1] === 0) touch = true;
        if (touch) out.push([x, y]);
      }
    }
    // 打乱
    for (let k = out.length - 1; k > 0; k--) { const q = randInt(0, k); const t = out[k]; out[k] = out[q]; out[q] = t; }
    return out;
  };
  const floorSpots = (minX, maxX, minY, maxY) => {
    const out = [];
    for (let y = Math.max(1, minY); y <= Math.min(size - 2, maxY); y++) {
      for (let x = Math.max(1, minX); x <= Math.min(size - 2, maxX); x++) {
        if (grid[y][x] === 0) out.push([x, y]);
      }
    }
    for (let k = out.length - 1; k > 0; k--) { const q = randInt(0, k); const t = out[k]; out[k] = out[q]; out[q] = t; }
    return out;
  };

  // ================= 等候厅的物件 =================
  const whWalls = wallSpots(2, splitX - 1, 2, size - 3);
  const whFloor = floorSpots(3, splitX - 2, 3, size - 4);

  // 窗：随处可见，窗外是群星点缀的黑色虚空，偶尔看得见月亮
  let wi = 0;
  const windows = [];
  for (let k = 0; k < 26 && wi < whWalls.length; k++, wi++) {
    const [wx, wy] = whWalls[wi];
    const p = put(wx, wy, "l20window", { seed: randInt(1, 9999), moon: Math.random() < 0.34 });
    if (p) windows.push(p);
  }
  // 窗 10 米之内（这里按 6 格算）温度骤降 —— 头痛、极度偏执
  for (const w of windows) {
    for (let dy = -6; dy <= 6; dy++) for (let dx = -6; dx <= 6; dx++) {
      const x = w.x + dx, y = w.y + dy;
      if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) continue;
      if (grid[y][x] !== 0) continue;
      if (Math.hypot(dx, dy) <= 6) cold20.add(x + "," + y);
    }
  }

  // 储物柜：越远离入口，里面的东西越多
  let fi = 0;
  for (let k = 0; k < 16 && fi < whFloor.length; k++, fi++) {
    const [x, y] = whFloor[fi];
    const d = Math.hypot(x - start.x, y - start.y);
    const rich = Math.min(3, 1 + Math.floor(d / 18));   // 离入口越远，东西越多
    put(x, y, "l20locker", { seed: randInt(1, 9999), rich });
  }
  // 垃圾桶 / 沙发 / 桌子 / 椅子 / 空接待台
  for (let k = 0; k < 12 && fi < whFloor.length; k++, fi++) put(whFloor[fi][0], whFloor[fi][1], "l20bin", { seed: randInt(1, 9999) });
  for (let k = 0; k < 10 && fi < whFloor.length; k++, fi++) put(whFloor[fi][0], whFloor[fi][1], "l20sofa", { seed: randInt(1, 9999) });
  for (let k = 0; k < 8 && fi < whFloor.length; k++, fi++) put(whFloor[fi][0], whFloor[fi][1], "l20table", { seed: randInt(1, 9999) });
  for (let k = 0; k < 14 && fi < whFloor.length; k++, fi++) put(whFloor[fi][0], whFloor[fi][1], "l20chair", { seed: randInt(1, 9999) });
  for (let k = 0; k < 5 && fi < whFloor.length; k++, fi++) put(whFloor[fi][0], whFloor[fi][1], "l20recep", { seed: randInt(1, 9999) });
  // 杏仁水喷泉 / 软饮料自动售货机
  for (let k = 0; k < 6 && fi < whFloor.length; k++, fi++) put(whFloor[fi][0], whFloor[fi][1], "l20fount", { seed: randInt(1, 9999) });
  for (let k = 0; k < 8 && fi < whFloor.length; k++, fi++) put(whFloor[fi][0], whFloor[fi][1], "l20vend", { seed: randInt(1, 9999) });

  // 员工专用门 —— 最快捷、也是最推荐的出口（-> Level 2）
  const staffN = 3;
  for (let k = 0; k < staffN && wi < whWalls.length; k++, wi++) {
    const [x, y] = whWalls[wi];
    put(x, y, "l20staff", { seed: randInt(1, 9999), toLevel: 2, tip: "一扇员工专用的门 —— 门牌上写着 STAFF ONLY" });
  }

  // 橙色果冻：从天花板上掉下来的，来源不明，目前没发现它有危害
  for (let k = 0; k < 10 && fi < whFloor.length; k++, fi++) {
    put(whFloor[fi][0], whFloor[fi][1], "l20jelly", { seed: randInt(1, 9999), born: 0 });
  }

  // ================= 霓虹区的物件 =================
  const nzWalls = wallSpots(splitX + 2, size - 3, 2, size - 3);
  const nzFloor = floorSpots(splitX + 2, size - 3, 3, size - 4);
  let ni = 0, nf = 0;

  // 霓虹灯：贴在每个厅的墙上，是整个霓虹区唯一的光源
  for (const h of halls) {
    for (let k = 0; k < 3; k++) {
      const x = (k === 0) ? h.x0 - 1 : (k === 1 ? h.x1 + 1 : h.cx);
      const y = (k === 2) ? h.y0 - 1 : randInt(h.y0, h.y1);
      if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) continue;
      if (grid[y][x] !== 1 && k !== 2) continue;
      put(x, y, "l20neon", { seed: randInt(1, 9999), hue: [ "#ff3b6b", "#38e8ff", "#ffd23b", "#8b5cff" ][randInt(0, 3)] });
    }
  }
  for (let k = 0; k < 14 && ni < nzWalls.length; k++, ni++) {
    put(nzWalls[ni][0], nzWalls[ni][1], "l20neon", { seed: randInt(1, 9999), hue: [ "#ff3b6b", "#38e8ff", "#ffd23b", "#8b5cff" ][randInt(0, 3)] });
  }

  // 游戏的门：每个厅至少一扇
  const GAMES = ["gr", "climb", "astro", "laser", "mole"];
  const FREQ = { gr: 3, climb: 3, astro: 2, laser: 2, mole: 1 };
  const bag = [];
  for (const gname of GAMES) for (let k = 0; k < FREQ[gname]; k++) bag.push(gname);
  for (let k = bag.length - 1; k > 0; k--) { const q = randInt(0, k); const t = bag[k]; bag[k] = bag[q]; bag[q] = t; }
  for (const h of halls) {
    const gname = bag.length ? bag.pop() : GAMES[randInt(0, GAMES.length - 1)];
    // 门开在厅的墙上（贴着厅内地板）
    const cand = wallSpots(h.x0 - 1, h.x1 + 1, h.y0 - 1, h.y1 + 1);
    if (!cand.length) continue;
    const [x, y] = cand[0];
    put(x, y, "l20game", { game: gname, seed: randInt(1, 9999) });
  }
  // 走廊上再补几扇
  for (let k = 0; k < 4 && ni < nzWalls.length; k++, ni++) {
    put(nzWalls[ni][0], nzWalls[ni][1], "l20game", { game: bag.length ? bag.pop() : GAMES[randInt(0, GAMES.length - 1)], seed: randInt(1, 9999) });
  }

  // 真正的出口门：极小概率 —— 而且边上一定有出口标志
  const EXITS = [4, 21, 36];
  for (let k = 0; k < 2 && ni < nzWalls.length; k++, ni++) {
    const [x, y] = nzWalls[ni];
    const tgt = EXITS[randInt(0, EXITS.length - 1)];
    put(x, y, "l20gatex", { seed: randInt(1, 9999), toLevel: tgt, tip: "一扇和游戏门一模一样的门 —— 边上的 EXIT 标志亮着" });
    // 出口标志挂在门边上（贴着地板的墙上）
    for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const sx = x + d[0], sy = y + d[1];
      if (sx < 1 || sy < 1 || sx >= size - 1 || sy >= size - 1) continue;
      if (grid[sy][sx] === 0) { nf++; break; }
    }
    // 标志本身：放在门前方那一格地板上
    for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const sx = x + d[0], sy = y + d[1];
      if (sx < 1 || sy < 1 || sx >= size - 1 || sy >= size - 1) continue;
      if (grid[sy][sx] === 0) { put(sx, sy, "l20sign", { seed: randInt(1, 9999) }); break; }
    }
    // 记录这扇门真正通向哪一层（运行时决定）
    props[props.length - 2].toLevel = tgt;
  }
  // 给所有 l20gatex 补一个 toLevel（上面只给最后两扇写了）
  for (const p of props) if (p.type === "l20gatex" && !p.toLevel) p.toLevel = EXITS[randInt(0, EXITS.length - 1)];

  // 霓虹区里也散着橙色果冻
  for (let k = 0; k < 6 && nf < nzFloor.length; k++, nf++) {
    put(nzFloor[nf][0], nzFloor[nf][1], "l20jelly", { seed: randInt(1, 9999), born: 0 });
  }

  const floors = collectFloors(grid, size);
  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms,
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [],
    cold20, neon20, splitX, halls,
    // 橙色果冻的掉落计时（在 update 里按不固定间隔生成）
    jellyT: 6 + Math.random() * 8,
  };
  map.spawnPts = [start];
  makeDoorsMap(map);
  return map;
}
window.generateBoreasMap = generateBoreasMap;

// ===========================================================
// 地面 / 墙
// ===========================================================
window.drawBoreasFloor = function (ctx, px, py, h, map, tx, ty) {
  const S = h;
  const inNeon = map && map.splitX != null && tx > map.splitX;
  if (inNeon) {
    // 霓虹区：灰色地毯。越往里（越往右）越暗一点 —— 那是温度在降
    const deep = map.splitX ? Math.min(1, (tx - map.splitX) / Math.max(1, (map.size - map.splitX))) : 0;
    const base = 122 - Math.round(26 * deep);
    ctx.fillStyle = "rgb(" + base + "," + (base + 4) + "," + (base + 11) + ")";
    ctx.fillRect(px, py, S, S);
    // 地毯的绒面：斜着走的细纹
    ctx.strokeStyle = "rgba(255,255,255,0.055)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px, py + S * 0.35); ctx.lineTo(px + S, py + S * 0.35);
    ctx.moveTo(px, py + S * 0.78); ctx.lineTo(px + S, py + S * 0.78);
    ctx.stroke();
    // 坡道：缓缓下坡 —— 一条极淡的横向阴影，坡度小到几乎察觉不到
    ctx.fillStyle = "rgba(0,0,0," + (0.05 + 0.05 * deep).toFixed(3) + ")";
    ctx.fillRect(px, py + S - 4, S, 4);
    if (((tx * 7 + ty * 5) % 9) === 0) {
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.fillRect(px + S * 0.2, py + S * 0.2, S * 0.6, S * 0.6);
    }
    return true;
  }
  // 等候厅：棕色地毯，一格一块的绒面
  const alt = ((tx * 5 + ty * 3) % 4) === 0;
  ctx.fillStyle = alt ? "#7a5b3a" : "#8a6844";
  ctx.fillRect(px, py, S, S);
  // 绒面：交错的短绒
  ctx.strokeStyle = "rgba(255,255,255,0.07)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(px + 2, py + S * 0.3); ctx.lineTo(px + S - 2, py + S * 0.3);
  ctx.moveTo(px + 2, py + S * 0.72); ctx.lineTo(px + S - 2, py + S * 0.72);
  ctx.stroke();
  ctx.strokeStyle = "rgba(0,0,0,0.16)";
  ctx.beginPath();
  ctx.moveTo(px + 0.5, py); ctx.lineTo(px + 0.5, py + S);
  ctx.stroke();
  if (((tx * 11 + ty * 7) % 7) === 0) {
    ctx.fillStyle = "rgba(60,40,22,0.22)";
    ctx.beginPath();
    ctx.ellipse(px + S * 0.5, py + S * 0.55, S * 0.26, S * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  return true;
};

window.drawBoreasWall = function (ctx, px, py, h, map, tx, ty) {
  const S = h;
  const inNeon = map && map.splitX != null && tx > map.splitX;
  if (inNeon) {
    // 霓虹区：墙是深蓝灰的瓷砖，顶上压着黑色的天花板瓷砖
    ctx.fillStyle = "#3a4150";
    ctx.fillRect(px, py, S, S);
    ctx.strokeStyle = "rgba(220,235,255,0.10)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px + 0.5, py + S / 2); ctx.lineTo(px + S - 0.5, py + S / 2);
    ctx.moveTo(px + S / 2, py + 0.5); ctx.lineTo(px + S / 2, py + S - 0.5);
    ctx.stroke();
    // 黑色的天花板瓷砖压在最上面
    ctx.fillStyle = "#14171d";
    ctx.fillRect(px, py, S, Math.max(4, S * 0.22));
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fillRect(px, py + Math.max(4, S * 0.22) - 2, S, 2);
    return true;
  }
  // 等候厅：白色混凝土的墙，顶上一条灰色瓷砖的天花板
  ctx.fillStyle = "#d9d7cf";
  ctx.fillRect(px, py, S, S);
  // 混凝土上的水痕与拼缝
  ctx.strokeStyle = "rgba(120,120,112,0.28)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(px + 0.5, py + S * 0.62); ctx.lineTo(px + S - 0.5, py + S * 0.62);
  ctx.stroke();
  if (((tx * 13 + ty * 9) % 6) < 2) {
    ctx.fillStyle = "rgba(150,148,138,0.30)";
    ctx.fillRect(px + (S / 6) * ((tx * 13 + ty * 9) % 6), py + S * 0.30, Math.max(2, S * 0.08), S * 0.42);
  }
  // 天花板：灰色瓷砖
  ctx.fillStyle = "#a9adb2";
  ctx.fillRect(px, py, S, Math.max(4, S * 0.20));
  ctx.strokeStyle = "rgba(70,74,80,0.45)";
  ctx.beginPath();
  ctx.moveTo(px + S * 0.33, py); ctx.lineTo(px + S * 0.33, py + Math.max(4, S * 0.20));
  ctx.moveTo(px + S * 0.66, py); ctx.lineTo(px + S * 0.66, py + Math.max(4, S * 0.20));
  ctx.stroke();
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.fillRect(px, py + Math.max(4, S * 0.20) - 2, S, 2);
  return true;
};

// ===========================================================
// 物件
// ===========================================================
window.PROP_DRAW = window.PROP_DRAW || {};

// 窗：窗外是群星点缀的黑色虚空，偶尔看得见月亮。
// 窗框上结着霜 —— 凑近了会头痛，也会变得极度偏执。
window.PROP_DRAW["l20window"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
  const s = p.seed || 3;
  // 窗框
  ctx.fillStyle = "#cfd3d6";
  ctx.fillRect(-T * 0.44, -T * 0.38, T * 0.88, T * 0.76);
  // 玻璃：外面的黑色虚空
  ctx.fillStyle = "#070a14";
  ctx.fillRect(-T * 0.38, -T * 0.32, T * 0.76, T * 0.64);
  // 星星（固定的排布，不闪 —— 只有偶尔一颗会慢慢明灭）
  ctx.fillStyle = "#e8eef6";
  for (let i = 0; i < 9; i++) {
    const sx = -T * 0.34 + (((s * (i + 3)) % 17) / 17) * T * 0.68;
    const sy = -T * 0.28 + (((s * (i + 7)) % 13) / 13) * T * 0.56;
    const tw = (i === 3) ? 0.55 + 0.45 * Math.sin(t * 1.1 + s) : 1;
    ctx.globalAlpha = tw;
    ctx.fillRect(sx, sy, 2, 2);
  }
  ctx.globalAlpha = 1;
  // 偶尔看得见的月亮
  if (p.moon) {
    ctx.fillStyle = "#eef2f6";
    ctx.beginPath();
    ctx.arc(T * 0.18, -T * 0.16, T * 0.11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(220,228,238,0.35)";
    ctx.beginPath();
    ctx.arc(T * 0.18, -T * 0.16, T * 0.17, 0, Math.PI * 2);
    ctx.fill();
  }
  // 窗框上的十字与结的霜
  ctx.strokeStyle = "#b6babd";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -T * 0.32); ctx.lineTo(0, T * 0.32);
  ctx.moveTo(-T * 0.38, 0); ctx.lineTo(T * 0.38, 0);
  ctx.stroke();
  ctx.fillStyle = "rgba(226,240,250,0.55)";
  ctx.fillRect(-T * 0.38, T * 0.24, T * 0.76, 3);
  ctx.fillRect(-T * 0.34, -T * 0.31, 3, T * 0.62);
};

// 储物柜：一整排铁皮柜，里面能翻出巧克力棒和苏打水 —— 离入口越远，东西越多
window.PROP_DRAW["l20locker"] = function (ctx, p, T) {
  const w = T * 0.66, h = T * 0.86;
  ctx.fillStyle = "#8fa2ad";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  // 两扇柜门
  ctx.fillStyle = "#9db0ba";
  ctx.fillRect(-w / 2 + 1, -h / 2 + 1, w / 2 - 2, h - 2);
  ctx.fillStyle = "#94a7b2";
  ctx.fillRect(1, -h / 2 + 1, w / 2 - 2, h - 2);
  ctx.strokeStyle = "#6b7c86"; ctx.lineWidth = 1;
  ctx.strokeRect(-w / 2 + 0.5, -h / 2 + 0.5, w - 1, h - 1);
  // 通风百叶
  ctx.strokeStyle = "rgba(50,64,72,0.55)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    const y = -h * 0.30 + i * 3;
    ctx.beginPath(); ctx.moveTo(-w / 2 + 4, y); ctx.lineTo(-3, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(3, y); ctx.lineTo(w / 2 - 4, y); ctx.stroke();
  }
  // 把手
  ctx.fillStyle = "#5d6d76";
  ctx.fillRect(-4, -2, 3, T * 0.10);
  ctx.fillRect(2, -2, 3, T * 0.10);
  // 底下透出来的一点东西（ richer = 东西越多 ）
  const rich = p.rich || 1;
  ctx.fillStyle = "rgba(60,40,20," + (0.20 + 0.16 * rich).toFixed(2) + ")";
  ctx.fillRect(-w / 2 + 3, h / 2 - 4, w - 6, 3);
};

// 垃圾桶
window.PROP_DRAW["l20bin"] = function (ctx, p, T) {
  const w = T * 0.42, h = T * 0.50;
  ctx.fillStyle = "#5c666c";
  ctx.beginPath();
  ctx.moveTo(-w / 2, -h / 2); ctx.lineTo(w / 2, -h / 2);
  ctx.lineTo(w / 2 - 3, h / 2); ctx.lineTo(-w / 2 + 3, h / 2);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#6e787e";
  ctx.fillRect(-w / 2 - 2, -h / 2 - 3, w + 4, 4);
  ctx.fillStyle = "rgba(30,36,40,0.35)";
  ctx.fillRect(-w / 2 + 3, -h / 2 + 5, w - 6, 2);
};

// 沙发：等候厅里那种一排排的软座
window.PROP_DRAW["l20sofa"] = function (ctx, p, T) {
  const w = T * 0.86, h = T * 0.52;
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.fillRect(-w / 2, h / 2 - 2, w, 4);
  ctx.fillStyle = "#6b5f52";
  ctx.fillRect(-w / 2, -h * 0.10, w, h * 0.62);          // 坐垫
  ctx.fillStyle = "#7c6e5f";
  ctx.fillRect(-w / 2, -h / 2, w, h * 0.46);             // 靠背
  ctx.fillStyle = "#8a7c6c";
  ctx.fillRect(-w / 2, -h / 2, w, h * 0.12);
  // 扶手
  ctx.fillStyle = "#5f544a";
  ctx.fillRect(-w / 2, -h * 0.10, w * 0.14, h * 0.62);
  ctx.fillRect(w / 2 - w * 0.14, -h * 0.10, w * 0.14, h * 0.62);
};

// 桌子：等候厅里矮矮的一张
window.PROP_DRAW["l20table"] = function (ctx, p, T) {
  const w = T * 0.62, h = T * 0.40;
  ctx.fillStyle = "rgba(0,0,0,0.26)";
  ctx.beginPath(); ctx.ellipse(0, h * 0.30, w * 0.45, h * 0.14, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#8a6a44";
  ctx.fillRect(-w / 2, -h * 0.42, w, h * 0.34);
  ctx.fillStyle = "#a0805a";
  ctx.fillRect(-w / 2, -h * 0.42, w, h * 0.10);
  ctx.fillStyle = "#6a5236";
  ctx.fillRect(-w / 2 + 3, -h * 0.08, 4, h * 0.40);
  ctx.fillRect(w / 2 - 7, -h * 0.08, 4, h * 0.40);
};

// 椅子
window.PROP_DRAW["l20chair"] = function (ctx, p, T) {
  const w = T * 0.36, h = T * 0.44;
  ctx.fillStyle = "rgba(0,0,0,0.24)";
  ctx.beginPath(); ctx.ellipse(0, h * 0.36, w * 0.40, h * 0.12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#6f6357";
  ctx.fillRect(-w / 2, -h * 0.10, w, h * 0.18);
  ctx.fillStyle = "#7d7063";
  ctx.fillRect(-w / 2, -h * 0.46, w, h * 0.38);
  ctx.fillStyle = "#57504a";
  for (let i = 0; i < 4; i++) {
    const sx = (i % 2 ? 1 : -1) * (w / 2 - 3);
    const sy = (i < 2 ? -h * 0.10 : h * 0.06);
    ctx.fillRect(sx - 1.5, sy + (i < 2 ? h * 0.08 : 0), 3, h * 0.30);
  }
};

// 空接待台：没有人坐在后面
window.PROP_DRAW["l20recep"] = function (ctx, p, T) {
  const w = T * 0.92, h = T * 0.54;
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.fillRect(-w / 2, h / 2 - 2, w, 4);
  ctx.fillStyle = "#b9b2a4";
  ctx.fillRect(-w / 2, -h * 0.30, w, h * 0.72);
  ctx.fillStyle = "#cbc4b6";
  ctx.fillRect(-w / 2, -h * 0.42, w, h * 0.16);
  ctx.fillStyle = "rgba(90,86,78,0.35)";
  ctx.fillRect(-w / 2 + 4, h * 0.06, w - 8, 2);
  // 台面上什么都没有
  ctx.fillStyle = "rgba(255,255,255,0.10)";
  ctx.fillRect(-w / 2, -h * 0.42, w, 3);
};

// 杏仁水喷泉：一个矮矮的饮水台，水柱一直在冒
window.PROP_DRAW["l20fount"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
  const w = T * 0.40, h = T * 0.62;
  ctx.fillStyle = "rgba(0,0,0,0.26)";
  ctx.beginPath(); ctx.ellipse(0, h * 0.42, w * 0.60, h * 0.14, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#c9ccce";
  ctx.fillRect(-w / 2, -h * 0.10, w, h * 0.52);
  ctx.fillStyle = "#dfe3e5";
  ctx.fillRect(-w / 2, -h * 0.22, w, h * 0.16);
  // 水柱：一道细细的弧线，一直在冒
  const arc = Math.sin(t * 2.2) * 1.5;
  ctx.strokeStyle = "rgba(226,236,220,0.85)";
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(arc * 0.4, -h * 0.24);
  ctx.quadraticCurveTo(arc, -h * 0.02, arc * 0.2, h * 0.02);
  ctx.stroke();
  ctx.fillStyle = "rgba(210,226,206,0.6)";
  ctx.beginPath(); ctx.ellipse(0, h * 0.04, w * 0.30, h * 0.07, 0, 0, Math.PI * 2); ctx.fill();
};

// 软饮料自动售货机：正面一整排花花绿绿的牌子
window.PROP_DRAW["l20vend"] = function (ctx, p, T) {
  const w = T * 0.62, h = T * 0.88;
  const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
  ctx.fillStyle = "rgba(0,0,0,0.30)";
  ctx.fillRect(-w / 2, h / 2 - 2, w, 4);
  ctx.fillStyle = "#b23b3b";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#8d2c2c";
  ctx.fillRect(-w / 2, -h / 2, w, h * 0.14);
  // 玻璃橱窗：一排饮料
  ctx.fillStyle = "rgba(230,240,245,0.30)";
  ctx.fillRect(-w / 2 + 3, -h / 2 + h * 0.18, w - 6, h * 0.48);
  const cols = ["#e8b93b", "#4fa3d1", "#7ac36a", "#d16a9a"];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
    ctx.fillStyle = cols[(c + r) % 4];
    ctx.fillRect(-w / 2 + 5 + c * (w - 10) / 4, -h / 2 + h * 0.20 + r * (h * 0.15), (w - 10) / 4 - 2, h * 0.11);
  }
  // 取货口
  ctx.fillStyle = "#2b2f33";
  ctx.fillRect(-w / 2 + 5, h / 2 - h * 0.22, w - 10, h * 0.14);
  // 招牌的灯：慢慢明灭
  ctx.fillStyle = "rgba(255,240,180," + (0.45 + 0.35 * Math.sin(t * 2.4)).toFixed(3) + ")";
  ctx.fillRect(-w / 2 + 2, -h / 2 + 2, w - 4, 2);
};

// 员工专用门：最快捷、也最推荐的出口 —— 通往 Level 2
window.PROP_DRAW["l20staff"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
  ctx.fillStyle = "#4c5a63";
  ctx.fillRect(-T * 0.44, -T * 0.46, T * 0.88, T * 0.92);
  ctx.fillStyle = "#5d6c75";
  ctx.fillRect(-T * 0.37, -T * 0.38, T * 0.74, T * 0.84);
  ctx.strokeStyle = "#39444b"; ctx.lineWidth = 2;
  ctx.strokeRect(-T * 0.37, -T * 0.38, T * 0.74, T * 0.84);
  // 门上那块牌子：员工专用
  ctx.fillStyle = "#e8e4d8";
  ctx.fillRect(-T * 0.28, -T * 0.30, T * 0.56, T * 0.16);
  ctx.fillStyle = "#3a4148";
  for (let i = 0; i < 4; i++) ctx.fillRect(-T * 0.24 + i * T * 0.13, -T * 0.26, T * 0.08, T * 0.03);
  ctx.fillStyle = "#3a4148";
  ctx.fillRect(-T * 0.24, -T * 0.22, T * 0.44, T * 0.03);
  // 把手
  ctx.fillStyle = "#c9cdce";
  ctx.fillRect(T * 0.26, -T * 0.04, T * 0.06, T * 0.10);
  // 一圈冷白的边：在一片白混凝土里它是唯一"不一样"的门
  ctx.strokeStyle = "rgba(226,240,248," + (0.30 + 0.22 * Math.sin(t * 1.4)).toFixed(3) + ")";
  ctx.lineWidth = 2;
  ctx.strokeRect(-T * 0.45, -T * 0.47, T * 0.90, T * 0.94);
};

// 橙色果冻：来源不明，从天花板上掉下来的一团。目前没发现它有危害。
window.PROP_DRAW["l20jelly"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
  const s = (p.seed || 5) % 10;
  const wob = Math.sin(t * 1.8 + s) * T * 0.05;
  // 地上的一摊
  ctx.fillStyle = "rgba(226,132,42,0.30)";
  ctx.beginPath();
  ctx.ellipse(0, T * 0.24, T * 0.30, T * 0.10, 0, 0, Math.PI * 2);
  ctx.fill();
  // 主体：半透明、在抖
  ctx.fillStyle = "rgba(238,146,52,0.78)";
  ctx.beginPath();
  ctx.ellipse(wob * 0.4, -T * 0.02, T * 0.24 - wob * 0.3, T * 0.20 + wob * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,196,110,0.55)";
  ctx.beginPath();
  ctx.ellipse(-T * 0.06 + wob * 0.3, -T * 0.08, T * 0.10, T * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,220,170,0.50)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(wob * 0.4, -T * 0.02, T * 0.24 - wob * 0.3, T * 0.20 + wob * 0.2, 0, 0, Math.PI * 2);
  ctx.stroke();
};

// 霓虹灯：整个霓虹区唯一的光源。颜色各异，慢慢地明灭。
window.PROP_DRAW["l20neon"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
  const hue = p.hue || "#38e8ff";
  const ph = (p.seed || 1) % 10;
  const pulse = 0.55 + 0.45 * Math.sin(t * 1.7 + ph);
  // 灯管外的一圈光
  ctx.save();
  ctx.globalAlpha = 0.30 * pulse;
  ctx.fillStyle = hue;
  ctx.beginPath(); ctx.arc(0, 0, T * 0.52, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // 灯管：一根横着的玻璃管
  ctx.strokeStyle = hue;
  ctx.lineWidth = Math.max(2, T * 0.10);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-T * 0.34, 0); ctx.lineTo(T * 0.34, 0);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255," + (0.55 * pulse).toFixed(3) + ")";
  ctx.lineWidth = Math.max(1, T * 0.035);
  ctx.beginPath();
  ctx.moveTo(-T * 0.32, -T * 0.012); ctx.lineTo(T * 0.32, -T * 0.012);
  ctx.stroke();
  // 两端的卡子
  ctx.fillStyle = "#2b3038";
  ctx.fillRect(-T * 0.40, -T * 0.06, T * 0.08, T * 0.12);
  ctx.fillRect(T * 0.32, -T * 0.06, T * 0.08, T * 0.12);
};

// 出口标志：只有真正的出口门边上才挂这个
window.PROP_DRAW["l20sign"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
  const on = 0.55 + 0.45 * Math.sin(t * 2.6);
  // 吊杆
  ctx.strokeStyle = "#7d848c"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, -T * 0.42); ctx.lineTo(0, -T * 0.26); ctx.stroke();
  // 绿底白字的 EXIT 牌
  ctx.fillStyle = "#1f8a4a";
  ctx.fillRect(-T * 0.34, -T * 0.26, T * 0.68, T * 0.30);
  ctx.strokeStyle = "rgba(255,255,255,0.55)"; ctx.lineWidth = 1.2;
  ctx.strokeRect(-T * 0.34, -T * 0.26, T * 0.68, T * 0.30);
  // EXIT 四个字（画出来，不是写文字 —— 用方块拼）
  ctx.fillStyle = "rgba(240,255,246," + on.toFixed(3) + ")";
  const bw = T * 0.10, bh = T * 0.055;
  const bx = -T * 0.26;
  for (let i = 0; i < 4; i++) ctx.fillRect(bx + i * (bw + T * 0.035), -T * 0.17, bw, bh);
  // 牌子的光晕
  ctx.save();
  ctx.globalAlpha = 0.20 * on;
  ctx.fillStyle = "#3ce07a";
  ctx.fillRect(-T * 0.38, -T * 0.30, T * 0.76, T * 0.38);
  ctx.restore();
};

// 通往「游戏」的门 —— 五种游戏各有各的门
window.PROP_DRAW["l20game"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
  const G = { gr: ["#3ddc6a", "#e03b53"], climb: ["#4ad8a0", "#cfe8b0"], astro: ["#5aa8ff", "#101a34"],
              laser: ["#ff4d6d", "#2a1020"], mole: ["#ffbe3b", "#3a2a10"] };
  const col = (G[p.game] || G.gr);
  ctx.fillStyle = "#2a2f38";
  ctx.fillRect(-T * 0.44, -T * 0.46, T * 0.88, T * 0.92);
  ctx.fillStyle = "#333a45";
  ctx.fillRect(-T * 0.37, -T * 0.39, T * 0.74, T * 0.86);
  // 门上一块发光的屏幕 —— 播着这个游戏的画面
  const pulse = 0.55 + 0.45 * Math.sin(t * 2.0 + (p.seed || 1) % 7);
  ctx.fillStyle = col[1];
  ctx.fillRect(-T * 0.28, -T * 0.30, T * 0.56, T * 0.34);
  ctx.save();
  ctx.globalAlpha = 0.55 + 0.35 * pulse;
  ctx.fillStyle = col[0];
  if (p.game === "gr") {            // 绿与红：一排六边形
    for (let i = 0; i < 5; i++) {
      const hx = -T * 0.22 + i * T * 0.11;
      ctx.fillStyle = (i % 2) ? col[0] : "#e03b53";
      ctx.beginPath();
      ctx.moveTo(hx, -T * 0.24); ctx.lineTo(hx + T * 0.05, -T * 0.18);
      ctx.lineTo(hx + T * 0.05, -T * 0.06); ctx.lineTo(hx, 0);
      ctx.lineTo(hx - T * 0.05, -T * 0.06); ctx.lineTo(hx - T * 0.05, -T * 0.18);
      ctx.closePath(); ctx.fill();
    }
  } else if (p.game === "climb") {  // 攀岩：一面墙上的落脚点
    ctx.fillStyle = col[0];
    for (let i = 0; i < 6; i++) {
      const hx = -T * 0.20 + ((i * 7) % 5) * T * 0.09;
      const hy = -T * 0.24 + Math.floor(i / 2) * T * 0.09;
      ctx.beginPath(); ctx.arc(hx, hy, T * 0.026, 0, Math.PI * 2); ctx.fill();
    }
  } else if (p.game === "astro") {  // 打爆小行星：屏幕上的太空
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 8; i++) {
      const sx = -T * 0.24 + ((i * 13) % 11) / 11 * T * 0.48;
      const sy = -T * 0.24 + ((i * 7) % 7) / 7 * T * 0.28;
      ctx.fillRect(sx, sy, 1.6, 1.6);
    }
    ctx.fillStyle = "#c9a06a";
    ctx.beginPath(); ctx.arc(T * 0.06, -T * 0.14, T * 0.055, 0, Math.PI * 2); ctx.fill();
  } else if (p.game === "laser") {  // 躲避激光：一道横着的红线
    ctx.strokeStyle = "#ff2d55"; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(-T * 0.26, -T * 0.12); ctx.lineTo(T * 0.26, -T * 0.12); ctx.stroke();
    ctx.fillStyle = "#ffe066";
    ctx.beginPath(); ctx.arc(-T * 0.16, T * 0.00, T * 0.03, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(T * 0.16, T * 0.00, T * 0.03, 0, Math.PI * 2); ctx.fill();
  } else {                          // 鼹鼠洞：几个发着不同颜色的洞
    const cc = ["#ff5a3b", "#3bd0ff", "#8bff5a", "#ffd23b"];
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = cc[i];
      ctx.beginPath(); ctx.ellipse(-T * 0.22 + i * T * 0.14, -T * 0.12, T * 0.055, T * 0.035, 0, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
  // 门框上的一圈霓虹
  ctx.strokeStyle = col[0];
  ctx.globalAlpha = 0.55 + 0.40 * pulse;
  ctx.lineWidth = 2.4;
  ctx.strokeRect(-T * 0.38, -T * 0.40, T * 0.76, T * 0.88);
  ctx.globalAlpha = 1;
  // 把手
  ctx.fillStyle = "#c9ced4";
  ctx.fillRect(T * 0.24, T * 0.06, T * 0.07, T * 0.10);
};

// 真正的出口门：长得和游戏门一模一样 —— 只有边上的 EXIT 标志能区分
window.PROP_DRAW["l20gatex"] = function (ctx, p, T) {
  window.PROP_DRAW["l20game"](ctx, { game: "gr", seed: p.seed }, T);
  ctx.fillStyle = "rgba(31,138,74,0.20)";
  ctx.fillRect(-T * 0.44, -T * 0.46, T * 0.88, T * 0.92);
};

// ===========================================================
// Level 20 的入口（摆在其他层级里的那几扇门）
// ===========================================================
// 写着「娱乐区」的蓝色门 —— Level 2 / Level 21 里有
window.PROP_DRAW["bluedoor20"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
  const glow = 0.45 + 0.35 * Math.sin(t * 1.9);
  // 门框
  ctx.fillStyle = "#1d4a86";
  ctx.fillRect(-T * 0.44, -T * 0.46, T * 0.88, T * 0.92);
  // 门板：蓝得发亮
  ctx.fillStyle = "#2f6fd0";
  ctx.fillRect(-T * 0.37, -T * 0.39, T * 0.74, T * 0.86);
  ctx.fillStyle = "#3d84ee";
  ctx.fillRect(-T * 0.37, -T * 0.39, T * 0.74, T * 0.18);
  // 门牌：娱乐区（画成一块白牌 + 三个字块）
  ctx.fillStyle = "#eef2f6";
  ctx.fillRect(-T * 0.26, -T * 0.24, T * 0.52, T * 0.15);
  ctx.fillStyle = "#243b57";
  for (let i = 0; i < 3; i++) ctx.fillRect(-T * 0.21 + i * T * 0.15, -T * 0.205, T * 0.10, T * 0.075);
  // 把手
  ctx.fillStyle = "#dfe6ec";
  ctx.fillRect(T * 0.24, -T * 0.02, T * 0.06, T * 0.11);
  // 往外渗的蓝光
  ctx.save();
  ctx.globalAlpha = 0.35 * glow;
  ctx.fillStyle = "#4d92ff";
  ctx.fillRect(-T * 0.50, -T * 0.52, T * 1.00, T * 1.04);
  ctx.restore();
  ctx.strokeStyle = "rgba(150,200,255," + (0.4 + 0.4 * glow).toFixed(3) + ")";
  ctx.lineWidth = 2;
  ctx.strokeRect(-T * 0.44, -T * 0.46, T * 0.88, T * 0.92);
};

// Level 11 里那栋名为「娱乐区」的建筑 —— 门口挂着霓虹招牌
window.PROP_DRAW["cluben20"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
  // 楼的外墙
  ctx.fillStyle = "#2a2f39";
  ctx.fillRect(-T * 0.46, -T * 0.46, T * 0.92, T * 0.92);
  ctx.fillStyle = "#333a46";
  ctx.fillRect(-T * 0.40, -T * 0.10, T * 0.80, T * 0.56);
  // 门洞
  ctx.fillStyle = "#12151b";
  ctx.fillRect(-T * 0.15, -T * 0.06, T * 0.30, T * 0.52);
  // 招牌：霓虹的「娱乐区」
  const on = 0.55 + 0.45 * Math.sin(t * 2.3);
  ctx.save();
  ctx.globalAlpha = 0.30 * on;
  ctx.fillStyle = "#ff3b8b";
  ctx.fillRect(-T * 0.42, -T * 0.40, T * 0.84, T * 0.24);
  ctx.restore();
  ctx.fillStyle = "#1a1d24";
  ctx.fillRect(-T * 0.40, -T * 0.38, T * 0.80, T * 0.20);
  ctx.fillStyle = "rgba(255,110,170," + (0.6 + 0.4 * on).toFixed(3) + ")";
  for (let i = 0; i < 3; i++) ctx.fillRect(-T * 0.32 + i * T * 0.22, -T * 0.32, T * 0.16, T * 0.08);
  // 楼上的窗，透着霓虹的颜色
  const cols = ["#ff3b8b", "#38e8ff", "#ffd23b"];
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = cols[i % 3];
    ctx.globalAlpha = 0.45 + 0.3 * Math.sin(t * 1.5 + i);
    ctx.fillRect(-T * 0.34 + i * T * 0.19, -T * 0.02, T * 0.12, T * 0.10);
  }
  ctx.globalAlpha = 1;
};

// Level 19 里那扇几乎散架的门 —— 有小概率通往 Level 20
window.PROP_DRAW["brokendoor20"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
  // 歪着的门框
  ctx.save();
  ctx.rotate(-0.07);
  ctx.fillStyle = "#4a3a28";
  ctx.fillRect(-T * 0.42, -T * 0.46, T * 0.84, T * 0.92);
  // 裂开的门板
  ctx.fillStyle = "#6b5334";
  ctx.fillRect(-T * 0.35, -T * 0.39, T * 0.70, T * 0.86);
  ctx.fillStyle = "#57422a";
  ctx.fillRect(-T * 0.35, -T * 0.39, T * 0.30, T * 0.86);
  // 裂缝
  ctx.strokeStyle = "#22190f"; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-T * 0.05, -T * 0.38); ctx.lineTo(T * 0.06, -T * 0.10);
  ctx.lineTo(-T * 0.02, T * 0.16); ctx.lineTo(T * 0.08, T * 0.44);
  ctx.stroke();
  // 缺了一块的门板：后面透出霓虹的颜色
  ctx.fillStyle = "rgba(60,20,70,0.9)";
  ctx.fillRect(T * 0.14, T * 0.10, T * 0.18, T * 0.28);
  ctx.fillStyle = "rgba(255,80,150," + (0.35 + 0.35 * Math.sin(t * 3.1)).toFixed(3) + ")";
  ctx.fillRect(T * 0.16, T * 0.12, T * 0.14, T * 0.24);
  ctx.restore();
};
