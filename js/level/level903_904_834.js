// ===========================================================
// 1.3.2 批次 C：Level 903 后室地铁 / Level 904 黑暗地铁 / Level 834 螺旋
// ===========================================================
"use strict";

(function () {
  const R = (k, v) => {
    if (typeof regTile === "function") regTile(k, v);
    else (window.__NEWTILE_EXTRA = window.__NEWTILE_EXTRA || {})[k] = v;
  };
  R("metro903", ["#9aa0a2", "#8e9496", "#636a70"]);
  R("darkmetro904", ["#3c3e42", "#36383c", "#2a2c30"]);
  R("spiral834", ["#6a7076", "#5e646a", "#454a50"]);
})();

window.__B3_FLOOR = window.__B3_FLOOR || {};
window.__B3_WALL = window.__B3_WALL || {};
window.PROP_DRAW = window.PROP_DRAW || {};
window.__LEVEL_TICK = window.__LEVEL_TICK || {};

function b3cHash(x, y) {
  let h = ((x | 0) * 3266489917 + (y | 0) * 2246822519) | 0;
  h = Math.imul(h ^ (h >>> 15), 1274126177) | 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// ===================== Level 903 · 后室地铁 =====================
function generateMetro903Map(level) {
  const size = 132, grid = makeGrid(size);
  // 一条看不到头的站台：中间走道，两侧各一条轨道
  for (let y = 6; y < size - 6; y++) for (let x = 6; x < size - 6; x++) grid[y][x] = 0;
  // 右侧那列休眠列车无休止延伸：把车厢做成一排排小隔间
  for (let y = 8; y < size - 8; y += 12) {
    for (let x = size - 34; x < size - 8; x++) if (x % 9 === 0) grid[y][x] = 1;
    for (let x = size - 34; x < size - 8; x++) { grid[y - 1][x] = 1; grid[y + 1][x] = 1; }
    for (let x = size - 33; x < size - 9; x += 9) { grid[y][x] = 0; grid[y + 1][x] = 0; }
  }
  // 偶尔出现的楼梯，总是被挡住
  for (let y = 20; y < size - 20; y += 26) {
    for (let x = 12; x < 18; x++) grid[y][x] = 1;
  }
  const floors = collectFloors(grid, size);
  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [[]],
    start: { x: 46, y: size - 14, floor: 0 },
    exit: null, doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props: [], crates: [], ground: [], spawnPts: [{ x: 46, y: size - 14, floor: 0 }],
    wander: null,
  };
  makeDoorsMap(map);
  const P = (x, y, type, extra) => map.props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  // 左侧轨道：正在使用的列车，每隔几小时停靠约十分钟
  P(18, 66, "m903train", { iKind: "m903train" });
  P(18, 30, "m903train", { iKind: "m903train" });
  // 回到 Level 11 的地铁站入口
  P(46, size - 8, "m903back", { toLevel: 11, tip: "来时那处地铁站 —— 回 Level 11" });
  // 车厢基地 / 贸易前哨 / 汽车旅馆
  for (let y = 14; y < size - 14; y += 12) {
    P(size - 28, y, y % 24 === 2 ? "m903hostel" : "m903stall", { iKind: "m903stall" });
  }
  // 亮着的不明语言标志、细长荧光灯、友善无面灵
  for (let y = 10; y < size - 10; y += 8) {
    P(30, y, "m903sign");
    P(58, y, "m903lamp");
    P(80, y, "m903lamp");
  }
  for (let i = 0; i < 12; i++) {
    const s = floors[Math.floor(Math.random() * floors.length)];
    P(s.x, s.y, "m903faceling");
  }
  return map;
}
window.generateMetro903Map = generateMetro903Map;

// 目的地面板：列车只认「表达出来的兴趣」，去 43 还必须带着受污染的杏仁水
function b3cDestPanel(g) {
  const old = document.getElementById("b3-dest-panel");
  if (old) old.remove();
  const wrap = document.createElement("div");
  wrap.id = "b3-dest-panel";
  wrap.style.cssText = "position:fixed;inset:0;z-index:10010;background:rgba(6,10,14,.78);display:flex;align-items:center;justify-content:center;";
  const box = document.createElement("div");
  box.style.cssText = "background:#18232c;border:2px solid #6f8a96;border-radius:10px;padding:20px;max-width:640px;width:88%;max-height:80vh;overflow:auto;color:#e8eef0;font:14px/1.6 sans-serif;";
  const h = document.createElement("div");
  h.textContent = "后室地铁 —— 说出你想去的地方";
  h.style.cssText = "font-size:19px;font-weight:bold;color:#a8d8e8;margin-bottom:6px;";
  box.appendChild(h);
  const sub = document.createElement("div");
  sub.textContent = "列车有感知，但不主动帮忙。它只接受乘客的目的地请求。（去 Level 43 需携带受污染的杏仁水）";
  sub.style.cssText = "color:#9fb0b8;margin-bottom:14px;";
  box.appendChild(sub);
  const inv = g.inv || {};
  const go = (lv) => {
    wrap.remove();
    if (String(lv) === "43" && !(inv.bad > 0)) {
      window.__toast("列车没有动 —— 去 Level 43 得带上受污染的杏仁水（普通杏仁水不算）");
      return;
    }
    if (String(lv) === "43") inv.bad--;
    window.__toast("车厢轻轻一晃，窗外的灯拉成了线 —— 后室地铁出发了");
    try { window.__goToLevel(lv); } catch (e) { /* 忽略 */ }
  };
  const row = document.createElement("div");
  row.style.cssText = "display:flex;flex-wrap:wrap;gap:8px;";
  [0, 1, 2, 3, 4, 5, 9, 11, 23, 32, 34, 37, 38, 39, 43, 46, 63, 797].forEach((lv) => {
    const b = document.createElement("button");
    b.textContent = "Level " + lv + (lv === 43 ? "（需污染杏仁水）" : "");
    b.dataset.lv = String(lv);
    b.style.cssText = "padding:7px 11px;border:1px solid #5a7a88;border-radius:6px;background:#223642;color:#dcecf2;cursor:pointer;font:13px sans-serif;";
    b.onclick = () => go(lv);
    row.appendChild(b);
  });
  box.appendChild(row);
  const custom = document.createElement("div");
  custom.style.cssText = "margin-top:16px;display:flex;gap:8px;align-items:center;";
  const inp = document.createElement("input");
  inp.id = "b3-dest-input";
  inp.placeholder = "或者输入层级编号";
  inp.style.cssText = "flex:1;padding:7px 10px;border:1px solid #5a7a88;border-radius:6px;background:#0e1a22;color:#e8eef0;font:13px sans-serif;";
  const ok = document.createElement("button");
  ok.id = "b3-dest-go";
  ok.textContent = "前往";
  ok.style.cssText = "padding:7px 14px;border:1px solid #5a7a88;border-radius:6px;background:#2c4a5a;color:#e8f4f8;cursor:pointer;";
  ok.onclick = () => {
    const v = inp.value.trim().replace(/^L(?:evel)?\s*/i, "");
    if (!v) return;
    if (typeof levelDef === "function" && !levelDef(v)) { window.__toast("没有这个层级"); return; }
    go(v);
  };
  custom.appendChild(inp); custom.appendChild(ok);
  box.appendChild(custom);
  const close = document.createElement("button");
  close.id = "b3-dest-close";
  close.textContent = "先不下车 · 关闭";
  close.style.cssText = "margin-top:14px;padding:7px 14px;border:1px solid #6a6a6a;border-radius:6px;background:#2a2e32;color:#ddd;cursor:pointer;";
  close.onclick = () => wrap.remove();
  box.appendChild(close);
  wrap.appendChild(box);
  document.body.appendChild(wrap);
}

window.__B3_FLOOR["metro903"] = function (ctx, px, py, S, map, tx, ty) {
  const r = b3cHash(tx, ty);
  ctx.fillStyle = r < 0.5 ? "#9aa0a2" : "#92989a"; ctx.fillRect(px, py, S, S);
  // 灰砖
  ctx.strokeStyle = "rgba(60,66,70,.28)"; ctx.lineWidth = 1;
  ctx.strokeRect(px + 1, py + 1, S - 2, S - 2);
  // 两侧轨道：左边空着，右边是休眠列车
  if (tx < 12 || tx > 96) {
    ctx.fillStyle = "rgba(40,46,50,.55)"; ctx.fillRect(px, py + S * 0.28, S, S * 0.44);
    ctx.fillStyle = "rgba(190,196,198,.5)";
    ctx.fillRect(px, py + S * 0.40, S, Math.max(1, S * 0.05));
    ctx.fillRect(px, py + S * 0.56, S, Math.max(1, S * 0.05));
  }
  // 站台边缘的黄色警戒线
  if (tx === 12 || tx === 96) { ctx.fillStyle = "rgba(230,196,90,.75)"; ctx.fillRect(px, py, Math.max(2, S * 0.10), S); }
  return true;
};
window.__B3_WALL["metro903"] = function (ctx, px, py, S, map, tx, ty) {
  ctx.fillStyle = "#636a70"; ctx.fillRect(px, py, S, S);
  ctx.fillStyle = "rgba(255,255,255,.14)"; ctx.fillRect(px, py, S, Math.max(2, S * 0.14));
  // 细长荧光灯，走道被照得很亮
  if ((tx * 3 + ty * 5) % 4 === 0) {
    ctx.fillStyle = "rgba(226,244,246,.82)"; ctx.fillRect(px + S * 0.1, py + S * 0.4, S * 0.8, S * 0.14);
  }
  return true;
};

window.__B2_OVL["903"] = function (ctx, g) {
  const cw = ctx.canvas.width, ch = ctx.canvas.height;
  ctx.save();
  try { ctx.setTransform(1, 0, 0, 1, 0, 0); } catch (e) { /* 忽略 */ }
  if (g.m903dark) {
    ctx.fillStyle = "rgba(2,4,8,.94)"; ctx.fillRect(0, 0, cw, ch);
  } else {
    ctx.fillStyle = "rgba(220,240,242,.045)"; ctx.fillRect(0, 0, cw, ch);
  }
  ctx.restore();
};

window.__LEVEL_TICK["903"] = function (g, dt) {
  dt = dt || 0.016;
  window.__B2_enter(g, "903", () => { g.m903t = 0; g.m903dark = false; g.m903roll = 0; });
  g.m903t = (g.m903t || 0) + dt;
  if (g.m903dark) {
    // 灯灭了，就意味着来到了黑暗地铁
    window.__toast("整条站台的荧光灯，一盏接一盏地熄了 —— 这不是停电");
    try { window.__goToLevel(904); } catch (e) { /* 忽略 */ }
    return;
  }
  // 停留 1 分钟以上，之后每 30 秒 10% 概率；45 秒后概率再加 10%
  if (g.m903t < 60) return;
  g.m903roll = (g.m903roll || 0) + dt;
  if (g.m903roll >= 30) {
    g.m903roll = 0;
    const p = 0.10 + (g.m903t > 105 ? 0.10 : 0);
    if (Math.random() < p) g.m903dark = true;
  }
};

// ===================== Level 904 · 黑暗地铁 =====================
function generateDark904Map(level) {
  const size = 100, grid = makeGrid(size);
  // 街区：横竖道路 + 一栋栋郊区房屋
  for (let y = 4; y < size - 4; y++) for (let x = 4; x < size - 4; x++) grid[y][x] = 0;
  for (let by = 8; by < size - 8; by += 14) for (let bx = 8; bx < size - 8; bx += 16) {
    for (let y = by; y < by + 8; y++) for (let x = bx; x < bx + 10; x++) {
      if (y === by || y === by + 7 || x === bx || x === bx + 9) grid[y][x] = 1;
    }
    // 门必须开在四面墙上（x=bx），开在内部列等于没开 —— 以前整栋房子
    // 都是走不到的孤岛，1500 格因此白白生成。
    grid[by + 3][bx] = 0;
    grid[by + 3][bx + 9] = 0;
  }
  // 中央广场：一片宽阔停车场，清掉中间的房屋
  for (let y = 40; y <= 62; y++) for (let x = 40; x <= 62; x++) grid[y][x] = 0;
  if (window.__B3_prune) window.__B3_prune(grid, size, 10, 90);
  const floors = collectFloors(grid, size);
  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [[]],
    start: { x: 10, y: 90, floor: 0 },
    exit: null, doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props: [], crates: [], ground: [], spawnPts: [{ x: 10, y: 90, floor: 0 }],
    wander: null,
  };
  makeDoorsMap(map);
  const P = (x, y, type, extra) => map.props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  // 主楼（大教堂）：两口深红色的钟、长椅、讲坛、管风琴
  P(51, 44, "d904cathedral", { iKind: "d904cathedral" });
  P(46, 50, "d904organ", { iKind: "d904organ" });
  P(56, 50, "d904register", { iKind: "d904register" });
  // 铁路：红光路灯，左边通向隧道，右边中断
  P(20, 70, "d904rail", { iKind: "d904rail" });
  P(76, 70, "d904rail", { iKind: "d904rail" });
  // 黑暗祭司 / 两个暗影 / 黑暗地铁本体
  P(51, 56, "d904priest", { iKind: "d904priest" });
  P(47, 58, "d904shadow", { iKind: "d904shadow" });
  P(55, 58, "d904shadow", { iKind: "d904shadow" });
  P(48, 74, "d904entity", { iKind: "d904entity" });
  // 每栋房旁的红色蜡烛 —— 全域唯一的光（铁路红灯除外）
  for (let by = 8; by < size - 8; by += 14) for (let bx = 8; bx < size - 8; bx += 16) {
    P(bx + 11, by + 4, "d904candle");
  }
  // 废弃商铺 / 破车 / 枯树 / 镇民
  for (let i = 0; i < 10; i++) {
    const s = floors[Math.floor(Math.random() * floors.length)];
    P(s.x, s.y, "d904shop", { iKind: "d904shop" });
  }
  for (let i = 0; i < 18; i++) {
    const s = floors[Math.floor(Math.random() * floors.length)];
    P(s.x, s.y, "d904townsfolk");
  }
  for (let i = 0; i < 24; i++) {
    const s = floors[Math.floor(Math.random() * floors.length)];
    P(s.x, s.y, ["d904car", "d904tree", "d904crack"][i % 3]);
  }
  return map;
}
window.generateDark904Map = generateDark904Map;

window.__B3_FLOOR["darkmetro904"] = function (ctx, px, py, S, map, tx, ty) {
  const r = b3cHash(tx, ty);
  ctx.fillStyle = r < 0.5 ? "#565a62" : "#50545c"; ctx.fillRect(px, py, S, S);
  if (r > 0.78) {  // 开裂、坑洼、废铁
    ctx.strokeStyle = "rgba(12,14,16,.7)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(px + S * 0.2, py + S * 0.3); ctx.lineTo(px + S * 0.6, py + S * 0.7); ctx.stroke();
  }
  ctx.fillStyle = "rgba(150,60,54,.05)"; ctx.fillRect(px, py, S, S);
  return true;
};
window.__B3_WALL["darkmetro904"] = function (ctx, px, py, S, map, tx, ty) {
  ctx.fillStyle = "#3e4248"; ctx.fillRect(px, py, S, S);
  ctx.fillStyle = "#50545a"; ctx.fillRect(px, py, S, Math.max(2, S * 0.18));
  ctx.fillStyle = "rgba(120,30,30,.16)"; ctx.fillRect(px, py + S * 0.4, S, S * 0.5);
  return true;
};

window.__B2_OVL["904"] = function (ctx, g) {
  const cw = ctx.canvas.width, ch = ctx.canvas.height;
  ctx.save();
  try { ctx.setTransform(1, 0, 0, 1, 0, 0); } catch (e) { /* 忽略 */ }
  // 永夜：一片蒙黑天空，没有路灯，房屋里也不透光
  ctx.fillStyle = "rgba(6,8,14,.38)"; ctx.fillRect(0, 0, cw, ch);
  if (g.d904bells > 0) {
    ctx.fillStyle = "rgba(150,24,28," + Math.min(0.24, g.d904bells / 40).toFixed(3) + ")";
    ctx.fillRect(0, 0, cw, ch);
  }
  ctx.restore();
};

window.__LEVEL_TICK["904"] = function (g, dt) {
  dt = dt || 0.016;
  window.__B2_enter(g, "904", () => { g.d904t = 0; g.d904bells = 0; g.d904seen = false; });
  g.d904t = (g.d904t || 0) + dt;
  // 每三天一次祭祀；游戏里压缩成 90 秒一循环，钟每小时三响、当天共十二响
  const cycle = g.d904t % 90;
  g.d904bells = cycle > 60 ? (cycle - 60) : 0;
  if (cycle > 60 && !g.d904rang) {
    g.d904rang = true;
    window.__toast("两口深红色的钟自己响了起来 —— 低沉的 D 音，第一声表示祂已经抵达");
  }
  if (cycle <= 60) g.d904rang = false;
  // 亮光会招来镇民：手电开着就持续暴露
  if (g.flashlight) {
    g.d904exposure = (g.d904exposure || 0) + dt;
    if (g.d904exposure > 6 && !g.d904seen) {
      g.d904seen = true;
      window.__toast("有人从门缝里看见了那道光 —— 街上的脚步声朝这边来了");
    }
    if (g.d904exposure > 14) {
      g.d904exposure = 0;
      g.hp = Math.max(0, (g.hp || 100) - 30);
      window.__toast("镇民把你架起来，一路拖向主楼 —— 被登记的人再也没有回来过");
    }
  } else g.d904exposure = Math.max(0, (g.d904exposure || 0) - dt * 2);
};

// ===================== Level 834 · 螺旋螺旋螺旋螺旋 =====================
function generateSpiral834Map(level) {
  const size = 110, grid = makeGrid(size);
  // 一条条金属阶梯悬在深渊之上，极少互相连接
  const rows = [];
  for (let y = 10, k = 0; y < size - 8; y += 13, k++) {
    rows.push(y);
    const wobble = (k % 2 ? 2 : 0);
    for (let x = 5 + wobble; x < size - 6; x++) {
      grid[y][x] = 0; grid[y + 1][x] = 0; grid[y + 2][x] = 0;
      // 阶梯并不笔直：偶尔错开一格，像被扭过
      if (b3cHash(x, y) > 0.93) grid[y + 2][x] = 1;
    }
  }
  // 少数几处连接（碰撞后才连上的那种）
  for (const cx of [22, 54, 86]) {
    // 竖列必须贯穿每一条横阶梯 —— 以前跳过 y%13<3 那三行，
    // 恰好把竖列和横行错开，结果 2604 格里 2300 格走不到。
    for (let y = 8; y < size - 8; y++) {
      grid[y][cx] = 0; grid[y][cx + 1] = 0;
    }
  }
  if (window.__B3_prune) window.__B3_prune(grid, size, 12, 11);
  const floors = collectFloors(grid, size);
  const gaps = new Set();
  for (const f of floors) if (b3cHash(f.x + 71, f.y + 19) > 0.965) gaps.add(f.x + "," + f.y);
  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [[]],
    start: { x: 12, y: rows[0] + 1, floor: 0 },
    exit: null, doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props: [], crates: [], ground: [], spawnPts: [{ x: 12, y: rows[0] + 1, floor: 0 }],
    wander: null, s834gaps: gaps, s834rows: rows,
  };
  makeDoorsMap(map);
  const P = (x, y, type, extra) => map.props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  // 会飘走的防火门：位置每隔一阵换一次，看到就得快点跑过去
  P(94, rows[rows.length - 1] + 1, "s834door", { iKind: "s834door", toLevel: 0 });
  // 轨道旁的护栏：狂风里俯身躲一躲
  for (const y of rows) {
    P(20, y + 1, "s834rail", { iKind: "s834rail" });
    P(60, y + 1, "s834rail", { iKind: "s834rail" });
  }
  for (let i = 0; i < 24; i++) {
    const s = floors[Math.floor(Math.random() * floors.length)];
    P(s.x, s.y, "s834hinge");
  }
  return map;
}
window.generateSpiral834Map = generateSpiral834Map;

window.__B3_FLOOR["spiral834"] = function (ctx, px, py, S, map, tx, ty) {
  const r = b3cHash(tx, ty);
  ctx.fillStyle = r < 0.5 ? "#6a7076" : "#626870"; ctx.fillRect(px, py, S, S);
  // 金属踏板：亮的新、暗的旧，铰链铆钉
  ctx.fillStyle = "rgba(210,218,220,.26)"; ctx.fillRect(px, py, S, Math.max(2, S * 0.10));
  ctx.fillStyle = "rgba(24,28,32,.45)"; ctx.fillRect(px, py + S - Math.max(2, S * 0.12), S, Math.max(2, S * 0.12));
  ctx.fillStyle = "rgba(40,46,52,.55)";
  for (const dx of [0.16, 0.82]) { ctx.beginPath(); ctx.arc(px + S * dx, py + S * 0.5, S * 0.045, 0, Math.PI * 2); ctx.fill(); }
  if (map.s834gaps && map.s834gaps.has(tx + "," + ty)) {
    ctx.strokeStyle = "rgba(18,20,24,.8)"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(px, py + S * 0.2); ctx.lineTo(px + S, py + S * 0.8); ctx.stroke();
  }
  return true;
};
window.__B3_WALL["spiral834"] = function (ctx, px, py, S, map, tx, ty) {
  // 阶梯之下空无一物：深渊里的雾，灰而不是纯黑
  const r = b3cHash(tx + 3, ty + 5);
  ctx.fillStyle = r < 0.5 ? "#454a50" : "#41464c"; ctx.fillRect(px, py, S, S);
  ctx.fillStyle = "rgba(180,192,200,.07)";
  ctx.beginPath(); ctx.ellipse(px + S * 0.5, py + S * 0.5, S * 0.42, S * 0.24, r, 0, Math.PI * 2); ctx.fill();
  return true;
};

window.__B2_OVL["834"] = function (ctx, g) {
  const cw = ctx.canvas.width, ch = ctx.canvas.height;
  const t = performance.now() / 1000;
  ctx.save();
  try { ctx.setTransform(1, 0, 0, 1, 0, 0); } catch (e) { /* 忽略 */ }
  ctx.fillStyle = "rgba(38,44,52,.16)"; ctx.fillRect(0, 0, cw, ch);
  const w = g.s834weather || 0;
  if (w >= 1) {
    ctx.strokeStyle = w >= 2 ? "rgba(200,220,235,.28)" : "rgba(200,214,220,.16)";
    ctx.lineWidth = 2;
    for (let i = 0; i < (w >= 2 ? 26 : 10); i++) {
      const y = (i * 59 + t * (w >= 2 ? 420 : 180)) % ch;
      ctx.beginPath(); ctx.moveTo(-40, y); ctx.lineTo(cw + 40, y - 40); ctx.stroke();
    }
  }
  if (w >= 2) {
    // 整个层级通上电流，变成无限大的超导体
    ctx.fillStyle = "rgba(150,200,255," + (0.06 + 0.05 * Math.abs(Math.sin(t * 3))).toFixed(3) + ")";
    ctx.fillRect(0, 0, cw, ch);
    if (Math.sin(t * 1.7) > 0.996) { ctx.fillStyle = "rgba(235,245,255,.42)"; ctx.fillRect(0, 0, cw, ch); }
  }
  ctx.restore();
};

window.__LEVEL_TICK["834"] = function (g, dt) {
  dt = dt || 0.016;
  window.__B2_enter(g, "834", () => { g.s834t = 0; g.s834weather = 0; g.s834duck = 0; });
  g.s834t = (g.s834t || 0) + dt;
  const phase = g.s834t % 45;
  g.s834weather = phase < 18 ? 0 : (phase < 34 ? 1 : 2);
  if (g.s834duck > 0) g.s834duck -= dt;
  const m = g.map || {};
  const px = Math.round(g.player.x / 40), py = Math.round(g.player.y / 40);
  if (m.s834gaps && m.s834gaps.has(px + "," + py) && !g.s834gapWarn) {
    g.s834gapWarn = true;
    window.__toast("脚下这块阶梯饱经风霜，边缘已经裂开了 —— 别在上面久站");
  }
  if (!m.s834gaps || !m.s834gaps.has(px + "," + py)) g.s834gapWarn = false;
  if (m.s834gaps && m.s834gaps.has(px + "," + py)) g.hp = Math.max(0, (g.hp || 100) - 16 * dt);
  if (g.s834weather === 2 && g.s834duck <= 0) {
    // 一道闪电劈下，所有还在阶梯上行进的人都会没命
    g.hp = Math.max(0, (g.hp || 100) - 9 * dt);
  }
  // 防火门会被风从原处吹走，掉到别的地方
  if (m.props && Math.floor(g.s834t) % 25 === 0 && g.s834doorAt !== Math.floor(g.s834t)) {
    g.s834doorAt = Math.floor(g.s834t);
    const d = m.props.find((p) => p.type === "s834door");
    if (d && m.floors && m.floors[0]) {
      const f = m.floors[0][Math.floor(Math.random() * m.floors[0].length)];
      d.x = f.x; d.y = f.y;
      window.__toast("那扇防火门被风从原处扯下来，飘到别处去了 —— 看见它就快点跑");
    }
  }
};

// ===================== 交互 =====================
window.__B2_hint([
  "m903train", "m903stall", "d904cathedral", "d904organ", "d904register", "d904rail",
  "d904priest", "d904shadow", "d904entity", "d904shop",
  "s834door", "s834rail",
], function (n, g) {
  switch (n.kind) {
    case "m903train": return "一列后室地铁停在这儿，还有十分钟就走 · 按 E 上车，说出目的地";
    case "m903stall": return "车厢被改成了贸易前哨 / 汽车旅馆 · 按 E 补给";
    case "d904cathedral": return "主楼像一座古老的大教堂，外墙是拉丁文标牌 · 按 E 推门";
    case "d904organ": return "讲坛上的管风琴 —— 千万别弹，声音会引来注意 · 按 E 忍住";
    case "d904register": return "「登记」—— 一旦被黑暗祭司登记，你就是献祭的候选人 · 按 E 走上前";
    case "d904rail": return "铁路被红色路灯照着，左边通向隧道，右边就此中断 · 按 E 沿铁轨看过去";
    case "d904priest": return "黑暗祭司 —— 它并不知道你不是本地人，至少现在还不知道 · 按 E 观察";
    case "d904shadow": return "两个统称「暗影」的实体并立在主楼门口 · 按 E 观察";
    case "d904entity": return "黑暗地铁 —— 只有肉眼能看见它真正的样子，拍下来全是假的 · 按 E 看一眼";
    case "d904shop": return "从不开门也从不亮灯的店铺 · 按 E 破门搜集";
    case "s834door": return "一扇和来时一样的金属防火门 —— 它随时会被风飘走 · 按 E 推门（离开这里）";
    case "s834rail": return "轨道旁的护栏 · 按 E 俯身躲好，等这阵狂风过去";
  }
  return null;
});

window.__B2_act([
  "m903train", "m903stall", "d904cathedral", "d904organ", "d904register", "d904rail",
  "d904priest", "d904shadow", "d904entity", "d904shop",
  "s834door", "s834rail",
], function (n, g) {
  const inv = g.inv || (g.inv = {});
  switch (n.kind) {
    case "m903train": b3cDestPanel(g); return true;
    case "m903stall":
      inv.almond = (inv.almond || 0) + 1;
      window.__toast("车厢里的人递来 1 瓶杏仁水 —— 「这儿没有危险，连摔下轨道都不会受伤」");
      return true;
    case "d904cathedral": window.__toast("长椅、地毯、讲坛，还有许多沾了血的东西 —— 讲坛附近尤其多"); return true;
    case "d904organ": window.__toast("你把手从琴键上收了回来 —— 声音会把整条街的人叫来"); return true;
    case "d904register": {
      window.__toast("祭司念出了一个名字。暗影取出红黑相间的盒子 —— 被点名的是你");
      try {
        window.__unlockEnding(2);
        window.__showEnding(2, "第十二声钟响时，车门为你打开。祭司用拉丁语念完祷文，列车关上门，开始在地面上行驶。");
      } catch (e) { g.hp = 0; }
      return true;
    }
    case "d904rail": window.__toast("低语声、心跳声、呼吸声，还有列车声 —— 长时间待在红光下会烧伤"); return true;
    case "d904priest": window.__toast("它朝你点了点头，像在核对一份名单 —— 别让它看清你的脸"); return true;
    case "d904shadow": window.__toast("两个暗影一动不动，只在钟声响起时才挪一下"); return true;
    case "d904entity": window.__toast("车头灯的位置是有着红色瞳孔的黑色眼睛 —— 镜头里它只是一节梵塔黑的车厢"); return true;
    case "d904shop":
      inv.almond = (inv.almond || 0) + 1;
      window.__toast("撬开一间废弃店铺，摸到 1 瓶杏仁水 —— 广场上还有人，动作轻点");
      return true;
    case "s834door": {
      // 单向：从 Level 1 进来就回不去 1；门后是别的层级
      const pool = [0, 2, 3, 4, 5, 9, 11, 37, 903];
      const to = pool[Math.floor(Math.random() * pool.length)];
      window.__toast("门在风里晃了一下 —— 推开，脚下不再是金属阶梯");
      try { window.__goToLevel(to); } catch (e) { /* 忽略 */ }
      return true;
    }
    case "s834rail":
      g.s834duck = 7;
      window.__toast("你俯身贴在轨道旁，抱住护栏 —— 至少这一阵不会随着阶梯一起飞走");
      return true;
  }
  return false;
});

// ===================== 物件外观 =====================
const B3C = window.PROP_DRAW;
B3C["m903train"] = function (ctx, p, T) {
  ctx.fillStyle = "#c8d0d4"; ctx.fillRect(-T * 0.48, -T * 0.42, T * 0.96, T * 0.84);
  ctx.fillStyle = "#3a5a6a"; ctx.fillRect(-T * 0.48, -T * 0.42, T * 0.96, T * 0.16);
  ctx.fillStyle = "#243a48";
  for (let i = 0; i < 4; i++) ctx.fillRect(-T * 0.40 + i * T * 0.22, -T * 0.16, T * 0.16, T * 0.24);
  ctx.fillStyle = "rgba(255,230,150,.6)"; ctx.fillRect(-T * 0.46, T * 0.30, T * 0.12, T * 0.08);
};
B3C["m903back"] = function (ctx, p, T) {
  ctx.fillStyle = "#4a5a62"; ctx.fillRect(-T * 0.36, -T * 0.42, T * 0.72, T * 0.84);
  ctx.fillStyle = "#a8d0d8"; ctx.fillRect(-T * 0.28, -T * 0.34, T * 0.56, T * 0.30);
};
B3C["m903stall"] = function (ctx, p, T) {
  ctx.fillStyle = "#6a5a42"; ctx.fillRect(-T * 0.40, -T * 0.24, T * 0.80, T * 0.48);
  ctx.fillStyle = "#c8b878"; ctx.fillRect(-T * 0.40, -T * 0.30, T * 0.80, T * 0.10);
  for (let i = 0; i < 4; i++) { ctx.fillStyle = "#9ec8b0"; ctx.fillRect(-T * 0.32 + i * T * 0.18, -T * 0.04, T * 0.10, T * 0.16); }
};
B3C["m903hostel"] = B3C["m903stall"];
B3C["m903sign"] = function (ctx, p, T) {
  ctx.fillStyle = "#2a3a44"; ctx.fillRect(-T * 0.30, -T * 0.26, T * 0.60, T * 0.50);
  ctx.fillStyle = "#8ce0c0";
  for (let i = 0; i < 3; i++) ctx.fillRect(-T * 0.22, -T * 0.16 + i * T * 0.14, T * (0.44 - i * 0.08), T * 0.045);
};
B3C["m903lamp"] = function (ctx, p, T) {
  ctx.fillStyle = "#e6f4f4"; ctx.fillRect(-T * 0.40, -T * 0.07, T * 0.80, T * 0.14);
  ctx.fillStyle = "rgba(220,244,246,.28)"; ctx.fillRect(-T * 0.46, -T * 0.18, T * 0.92, T * 0.36);
};
B3C["m903faceling"] = function (ctx, p, T) {
  ctx.fillStyle = "#d8cbb4"; ctx.beginPath(); ctx.arc(0, -T * 0.24, T * 0.13, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#4a5058"; ctx.fillRect(-T * 0.14, -T * 0.10, T * 0.28, T * 0.48);
};
B3C["d904candle"] = function (ctx, p, T) {
  ctx.fillStyle = "#b8b0a0"; ctx.fillRect(-T * 0.07, 0, T * 0.14, T * 0.30);
  ctx.fillStyle = "rgba(220,40,34,.85)";
  ctx.beginPath(); ctx.ellipse(0, -T * 0.08, T * 0.05, T * 0.11, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(200,40,34,.13)";
  ctx.beginPath(); ctx.arc(0, -T * 0.06, T * 0.38, 0, Math.PI * 2); ctx.fill();
};
B3C["d904cathedral"] = function (ctx, p, T) {
  ctx.fillStyle = "#3a3038";
  ctx.beginPath(); ctx.moveTo(-T * 0.46, T * 0.44); ctx.lineTo(0, -T * 0.46); ctx.lineTo(T * 0.46, T * 0.44); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#7a2028";
  ctx.beginPath(); ctx.arc(-T * 0.24, -T * 0.28, T * 0.09, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(T * 0.24, -T * 0.28, T * 0.09, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#c8b0a0"; ctx.fillRect(-T * 0.12, T * 0.10, T * 0.24, T * 0.34);
};
B3C["d904organ"] = function (ctx, p, T) {
  ctx.fillStyle = "#6a5a48"; ctx.fillRect(-T * 0.36, -T * 0.10, T * 0.72, T * 0.38);
  ctx.fillStyle = "#c8b8a0";
  for (let i = 0; i < 9; i++) ctx.fillRect(-T * 0.32 + i * T * 0.075, -T * 0.40 + (i % 3) * T * 0.05, T * 0.05, T * 0.30);
};
B3C["d904register"] = function (ctx, p, T) {
  ctx.fillStyle = "#2a1014"; ctx.fillRect(-T * 0.32, -T * 0.24, T * 0.64, T * 0.48);
  ctx.fillStyle = "#a02028"; ctx.fillRect(-T * 0.32, -T * 0.24, T * 0.64, T * 0.10);
  ctx.fillStyle = "#e0c8b8"; ctx.font = "bold " + (T * 0.14) + "px sans-serif";
  ctx.textAlign = "center"; ctx.fillText("登记", 0, T * 0.12); ctx.textAlign = "left";
};
B3C["d904rail"] = function (ctx, p, T) {
  ctx.fillStyle = "#4a4440"; ctx.fillRect(-T * 0.48, T * 0.06, T * 0.96, T * 0.20);
  ctx.fillStyle = "#8a8078";
  for (let i = 0; i < 5; i++) ctx.fillRect(-T * 0.44 + i * T * 0.22, -T * 0.04, T * 0.08, T * 0.32);
  ctx.fillStyle = "rgba(220,30,34,.6)";
  ctx.beginPath(); ctx.arc(T * 0.36, -T * 0.30, T * 0.10, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(200,30,34,.12)";
  ctx.beginPath(); ctx.arc(T * 0.36, -T * 0.30, T * 0.44, 0, Math.PI * 2); ctx.fill();
};
B3C["d904priest"] = function (ctx, p, T) {
  ctx.fillStyle = "#1e1a20";
  ctx.beginPath(); ctx.moveTo(-T * 0.20, -T * 0.18); ctx.lineTo(T * 0.20, -T * 0.18);
  ctx.lineTo(T * 0.30, T * 0.44); ctx.lineTo(-T * 0.30, T * 0.44); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#b83034"; ctx.beginPath(); ctx.arc(0, -T * 0.28, T * 0.13, 0, Math.PI * 2); ctx.fill();
};
B3C["d904shadow"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(14,12,20,.92)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.06, T * 0.24, T * 0.42, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#b82028";
  ctx.beginPath(); ctx.arc(-T * 0.07, -T * 0.10, T * 0.035, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(T * 0.07, -T * 0.10, T * 0.035, 0, Math.PI * 2); ctx.fill();
};
B3C["d904entity"] = function (ctx, p, T) {
  ctx.fillStyle = "#0c0c10"; ctx.fillRect(-T * 0.48, -T * 0.30, T * 0.96, T * 0.60);
  ctx.fillStyle = "#b01820";
  ctx.beginPath(); ctx.arc(-T * 0.30, 0, T * 0.10, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(T * 0.30, 0, T * 0.10, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#3a1014";
  for (let i = 0; i < 4; i++) ctx.fillRect(-T * 0.34 + i * T * 0.20, -T * 0.22, T * 0.14, T * 0.44);
};
B3C["d904shop"] = function (ctx, p, T) {
  ctx.fillStyle = "#3a3c40"; ctx.fillRect(-T * 0.40, -T * 0.32, T * 0.80, T * 0.64);
  ctx.fillStyle = "#202226"; ctx.fillRect(-T * 0.30, -T * 0.22, T * 0.60, T * 0.30);
  ctx.fillStyle = "#6a5a40"; ctx.fillRect(-T * 0.40, -T * 0.38, T * 0.80, T * 0.08);
};
B3C["d904townsfolk"] = function (ctx, p, T) {
  ctx.fillStyle = "#33323a";
  ctx.beginPath(); ctx.arc(0, -T * 0.22, T * 0.11, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(-T * 0.12, -T * 0.10, T * 0.24, T * 0.46);
};
B3C["d904car"] = function (ctx, p, T) {
  ctx.fillStyle = "#4a4642"; ctx.fillRect(-T * 0.42, -T * 0.10, T * 0.84, T * 0.28);
  ctx.fillStyle = "#26282c"; ctx.beginPath(); ctx.arc(-T * 0.24, T * 0.20, T * 0.09, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(T * 0.24, T * 0.20, T * 0.09, 0, Math.PI * 2); ctx.fill();
};
B3C["d904tree"] = function (ctx, p, T) {
  ctx.strokeStyle = "#3e3a38"; ctx.lineWidth = Math.max(2, T * 0.08);
  ctx.beginPath(); ctx.moveTo(0, T * 0.42); ctx.lineTo(0, -T * 0.34);
  ctx.moveTo(0, -T * 0.10); ctx.lineTo(-T * 0.26, -T * 0.36);
  ctx.moveTo(0, -T * 0.18); ctx.lineTo(T * 0.24, -T * 0.40); ctx.stroke();
};
B3C["d904crack"] = function (ctx, p, T) {
  ctx.strokeStyle = "rgba(12,12,14,.8)"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-T * 0.36, -T * 0.2); ctx.lineTo(0, T * 0.08); ctx.lineTo(T * 0.30, T * 0.34); ctx.stroke();
};
B3C["s834door"] = function (ctx, p, T) {
  ctx.fillStyle = "#8a5a3a"; ctx.fillRect(-T * 0.30, -T * 0.44, T * 0.60, T * 0.88);
  ctx.fillStyle = "#b87848"; ctx.fillRect(-T * 0.24, -T * 0.38, T * 0.48, T * 0.76);
  ctx.fillStyle = "#e0d0a0"; ctx.fillRect(-T * 0.24, -T * 0.38, T * 0.48, T * 0.10);
  ctx.fillStyle = "#d8c890"; ctx.beginPath(); ctx.arc(T * 0.16, T * 0.08, T * 0.045, 0, Math.PI * 2); ctx.fill();
};
B3C["s834rail"] = function (ctx, p, T) {
  ctx.strokeStyle = "#a8b0b4"; ctx.lineWidth = Math.max(2, T * 0.07);
  ctx.beginPath(); ctx.moveTo(-T * 0.44, -T * 0.20); ctx.lineTo(T * 0.44, -T * 0.20);
  ctx.moveTo(-T * 0.36, -T * 0.20); ctx.lineTo(-T * 0.36, T * 0.34);
  ctx.moveTo(T * 0.36, -T * 0.20); ctx.lineTo(T * 0.36, T * 0.34); ctx.stroke();
};
B3C["s834hinge"] = function (ctx, p, T) {
  ctx.fillStyle = "#3e444a";
  ctx.beginPath(); ctx.arc(0, 0, T * 0.14, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#9aa4aa";
  ctx.beginPath(); ctx.arc(0, 0, T * 0.06, 0, Math.PI * 2); ctx.fill();
};
