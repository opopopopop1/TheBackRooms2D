// ===========================================================
// Level 3.5 —— 电都
// 一座被假定无垠的平面：单色调、20 世纪中叶的工业大都会，完全由
// 粗野主义派建筑构成。
//
// 整座城处在持续的电活动里：高压闪电以不可预知的规律轰击架线塔、
// 摩天大厦，以及散布在都景里的人。每一次轰击都放出足以让人失去方向感
// 与暂时失聪的震荡波。被击中非死即重伤 —— 档案说"极低概率回到 Level 3"，
// 这里按确定的出口实现：撞上静电放电，就被打回 Level 3。
//
// 实体：除人类外只有窗灵，间歇现身在摩天大厦玻璃面板的反射面上，
// 不会进入室内 —— 所以建筑里是唯一安全的去处。
//
// 入口：Level 3 的门有时会通向本层级某座大厦内的门。
// 出口：撞上静电放电 → Level 3。
// ===========================================================
"use strict";

function generateElectropolisMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const props = [];
  const indoor = new Set();          // 室内地板（安全）
  const outdoor = new Set();         // 街道（会被雷劈）
  const facade = new Set();          // 大楼外立面（墙格，窗灵待的地方）

  // ---- 街区网格 ----
  // block 街区边长（含街道），road 街道宽度
  const block = 8, road = 2;
  const nb = Math.floor((size - 6) / block);

  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return;
    props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  };

  const towers = [];
  const building = new Set();          // 楼体占的格子（含后来挖空的室内）—— 其余是街道
  for (let by = 0; by < nb; by++) {
    for (let bx = 0; bx < nb; bx++) {
      const x0 = 3 + bx * block, y0 = 3 + by * block;
      const bw = block - road, bh = block - road;
      if (x0 + bw >= size - 2 || y0 + bh >= size - 2) continue;
      for (let y = y0; y < y0 + bh; y++)
        for (let x = x0; x < x0 + bw; x++) building.add(x + "," + y);
      // 楼体（先全填成墙，等下再决定要不要挖空）
      for (let y = y0; y < y0 + bh; y++)
        for (let x = x0; x < x0 + bw; x++) grid[y][x] = 1;
      // 约 45% 的楼是能进去的：内部挖空，朝街道开一个门洞
      const openable = Math.random() < 0.45;
      const tw = { x0, y0, bw, bh, open: openable, cx: x0 + (bw >> 1), cy: y0 + (bh >> 1) };
      if (openable) {
        for (let y = y0 + 1; y < y0 + bh - 1; y++)
          for (let x = x0 + 1; x < x0 + bw - 1; x++) {
            grid[y][x] = 0;
            indoor.add(x + "," + y);
          }
        // 门洞：朝某一侧的街道开
        const side = randInt(0, 3);
        let dx = 0, dy = 0, mx = 0, my = 0;
        if (side === 0) { dx = x0 + (bw >> 1); dy = y0 - 1; mx = x0 + (bw >> 1); my = y0; }
        else if (side === 1) { dx = x0 + (bw >> 1); dy = y0 + bh; mx = x0 + (bw >> 1); my = y0 + bh - 1; }
        else if (side === 2) { dx = x0 - 1; dy = y0 + (bh >> 1); mx = x0; my = y0 + (bh >> 1); }
        else { dx = x0 + bw; dy = y0 + (bh >> 1); mx = x0 + bw - 1; my = y0 + (bh >> 1); }
        if (dx > 0 && dy > 0 && dx < size - 1 && dy < size - 1) {
          grid[dy][dx] = 0;                 // 门前那一格街道
          grid[my][mx] = 0;                 // 门洞
          indoor.add(mx + "," + my);
          tw.door = { x: mx, y: my };
        }
        towers.push(tw);
      } else {
        towers.push(tw);
      }
      // 外立面（墙格）留档，窗灵待在这些格子上
      for (let y = y0; y < y0 + bh; y++)
        for (let x = x0; x < x0 + bw; x++) {
          if (grid[y][x] === 1) facade.add(x + "," + y);
        }
    }
  }

  // ---- 街道：楼体之外、边界之内，全挖成室外地板 ----
  // 以前这一步只是"把已经是地板的格子标成室外"—— 可街道本来就是墙，
  // 于是整座城只剩一栋栋互不相连的楼，连通检查又把绝大多数填回墙里。
  for (let y = 2; y < size - 2; y++)
    for (let x = 2; x < size - 2; x++) {
      if (building.has(x + "," + y)) continue;
      grid[y][x] = 0;
      outdoor.add(x + "," + y);
    }

  // ---- 出生点：一栋能进去的楼里（室外必死，不能把人丢在街上）----
  const openTowers = towers.filter((t) => t.open && t.door);
  let start = null;
  if (openTowers.length) {
    const t0 = openTowers[randInt(0, openTowers.length - 1)];
    start = { x: t0.cx, y: t0.cy, floor: 0 };
  }
  const floorsInit = collectFloors(grid, size);
  if (!start || grid[start.y][start.x] !== 0) {
    // 兜底：找一格室内地板
    let best = null, bd = 1e9;
    for (const t of floorsInit) {
      if (!indoor.has(t.x + "," + t.y)) continue;
      const d = Math.abs(t.x - (size >> 1)) + Math.abs(t.y - (size >> 1));
      if (d < bd) { bd = d; best = t; }
    }
    start = best ? { x: best.x, y: best.y, floor: 0 } : { x: 4, y: 4, floor: 0 };
  }
  grid[start.y][start.x] = 0;
  indoor.add(start.x + "," + start.y);
  outdoor.delete(start.x + "," + start.y);

  // 连通兜底：走不到的地板填回墙
  const reach = reachableFromRaw(grid, size, start);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const k = x + "," + y;
      if (grid[y][x] === 0 && !reach.has(k)) { grid[y][x] = 1; indoor.delete(k); outdoor.delete(k); }
    }

  const floors = collectFloors(grid, size);

  // ---- 架线塔：立在街上，是最先被雷劈的东西 ----
  const pylons = [];
  for (let i = 0; i < 16; i++) {
    const t = floors[randInt(0, floors.length - 1)];
    if (!t || !outdoor.has(t.x + "," + t.y)) continue;
    if (Math.hypot(t.x - start.x, t.y - start.y) < 3) continue;
    put(t.x, t.y, "pylon35");
    pylons.push({ x: t.x, y: t.y });
  }
  // ---- 窗灵：只在大楼的玻璃反射面上，不进室内 ----
  const fkeys = Array.from(facade);
  for (let i = 0; i < 22 && fkeys.length; i++) {
    const k = fkeys[randInt(0, fkeys.length - 1)];
    const [x, y] = k.split(",").map(Number);
    put(x, y, "ghost35");
  }
  // ---- 街上的杂物：锈掉的车（雷劈下来会先打到它们）----
  for (let i = 0; i < 18; i++) {
    const t = floors[randInt(0, floors.length - 1)];
    if (t && outdoor.has(t.x + "," + t.y)) put(t.x, t.y, "wreck35");
  }

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [],
    indoor35: indoor, outdoor35: outdoor,
    pylons,
    // 闪电状态机
    bolt: null, boltT: 0, nextBolt: 2.2,
    outdoorKeys: Array.from(outdoor),
  };
  map.spawnPts = [start];
  return map;
}
window.generateElectropolisMap = generateElectropolisMap;

// ---------- 地面 / 墙体 ----------
// 单色调：整座城只有灰。室外是湿沥青，室内是混凝土。
window.drawElectroFloor = function (ctx, px, py, S, map, tx, ty) {
  const k = tx + "," + ty;
  const alt = ((tx * 7 + ty * 13) % 5) === 0;
  if (map.indoor35 && map.indoor35.has(k)) {
    ctx.fillStyle = alt ? "#666a70" : "#6e7278";
    ctx.fillRect(px, py, S, S);
    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.lineWidth = 1;
    ctx.strokeRect(px + 0.5, py + 0.5, S - 1, S - 1);
    return true;
  }
  // 室外：湿沥青，反着一点天光
  ctx.fillStyle = alt ? "#3f4348" : "#464a50";
  ctx.fillRect(px, py, S, S);
  ctx.fillStyle = "rgba(180,200,220,0.06)";
  ctx.fillRect(px, py, S, S * 0.30);
  return true;
};
// 粗野主义混凝土：厚重的体块 + 成排的小窗
window.drawElectroWall = function (ctx, px, py, S, style, map) {
  ctx.fillStyle = "#6a6e74";
  ctx.fillRect(px, py, S, S);
  // 粗野主义的分层：一道横向的体块接缝
  ctx.fillStyle = "rgba(255,255,255,0.10)";
  ctx.fillRect(px, py, S, Math.max(3, S * 0.16));
  ctx.fillStyle = "rgba(0,0,0,0.30)";
  ctx.fillRect(px, py + S - Math.max(3, S * 0.14), S, Math.max(3, S * 0.14));
  // 窗：一小格一小格的玻璃，反射着天光
  const w = Math.max(3, S * 0.17);
  ctx.fillStyle = "rgba(150,175,195,0.42)";
  ctx.fillRect(px + S * 0.18, py + S * 0.30, w, w);
  ctx.fillRect(px + S * 0.60, py + S * 0.30, w, w);
  ctx.fillStyle = "rgba(255,255,255,0.16)";
  ctx.fillRect(px + S * 0.18, py + S * 0.30, w, w * 0.35);
  ctx.fillRect(px + S * 0.60, py + S * 0.30, w, w * 0.35);
  ctx.strokeStyle = "rgba(0,0,0,0.34)";
  ctx.lineWidth = 1;
  ctx.strokeRect(px + 0.5, py + 0.5, S - 1, S - 1);
  return true;
};

// ---------- 专属模型 ----------
window.PROP_DRAW = window.PROP_DRAW || {};

// 架线塔：钢桁架 + 顶部横担，最先挨雷的就是它
window.PROP_DRAW["pylon35"] = function (ctx, p, T) {
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.40, T * 0.30, T * 0.07, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#565c63";
  ctx.lineWidth = Math.max(1.4, T * 0.05);
  // 四条腿收成塔身
  ctx.beginPath();
  ctx.moveTo(-T * 0.26, T * 0.40); ctx.lineTo(-T * 0.09, -T * 0.36);
  ctx.moveTo(T * 0.26, T * 0.40); ctx.lineTo(T * 0.09, -T * 0.36);
  ctx.stroke();
  ctx.lineWidth = Math.max(1, T * 0.035);
  for (let i = 0; i < 4; i++) {
    const yy = T * 0.30 - i * T * 0.20;
    const ww = T * (0.22 - i * 0.02);
    ctx.beginPath(); ctx.moveTo(-ww, yy); ctx.lineTo(ww, yy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-ww, yy); ctx.lineTo(ww * 0.7, yy - T * 0.10); ctx.stroke();
  }
  // 顶上的横担
  ctx.lineWidth = Math.max(1.4, T * 0.045);
  ctx.beginPath(); ctx.moveTo(-T * 0.30, -T * 0.34); ctx.lineTo(T * 0.30, -T * 0.34); ctx.stroke();
  ctx.restore();
};

// 窗灵：玻璃面板反射面上的那个人影。它进不了室内 —— 只在室外才看得见。
window.PROP_DRAW["ghost35"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : 0) / 1000;
  const a = 0.30 + 0.22 * Math.sin(t * 1.4 + p.x * 0.9 + p.y * 1.3);
  ctx.save();
  // 玻璃那一格
  ctx.fillStyle = "rgba(190,215,235," + (0.16 + a * 0.2).toFixed(3) + ")";
  ctx.fillRect(-T * 0.40, -T * 0.40, T * 0.80, T * 0.80);
  // 人影：惨白的轮廓，没有五官
  ctx.fillStyle = "rgba(238,244,248," + a.toFixed(3) + ")";
  ctx.beginPath(); ctx.arc(0, -T * 0.14, T * 0.11, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-T * 0.15, T * 0.34);
  ctx.quadraticCurveTo(-T * 0.13, -T * 0.02, 0, -T * 0.04);
  ctx.quadraticCurveTo(T * 0.13, -T * 0.02, T * 0.15, T * 0.34);
  ctx.closePath(); ctx.fill();
  ctx.restore();
};

// 街上锈掉的车
window.PROP_DRAW["wreck35"] = function (ctx, p, T) {
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.30)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.32, T * 0.34, T * 0.09, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#5a4440";
  ctx.fillRect(-T * 0.32, -T * 0.10, T * 0.64, T * 0.36);
  ctx.fillStyle = "#4a3834";
  ctx.fillRect(-T * 0.24, -T * 0.26, T * 0.44, T * 0.18);
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fillRect(-T * 0.28, T * 0.12, T * 0.10, T * 0.10);
  ctx.fillRect(T * 0.18, T * 0.12, T * 0.10, T * 0.10);
  ctx.restore();
};

// 静电聚集：落雷之前那一小段蓄力 —— 看得见，玩家有时间躲开或者迎上去
window.PROP_DRAW["charge35"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : 0) / 1000;
  const f = 0.5 + 0.5 * Math.sin(t * 22);
  ctx.save();
  ctx.fillStyle = "rgba(190,225,255," + (0.10 + 0.16 * f).toFixed(3) + ")";
  ctx.beginPath(); ctx.arc(0, 0, T * (0.34 + 0.10 * f), 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "rgba(225,242,255," + (0.45 + 0.45 * f).toFixed(3) + ")";
  ctx.lineWidth = Math.max(1, T * 0.03);
  for (let i = 0; i < 4; i++) {
    const a = t * 6 + i * (Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * T * 0.16, Math.sin(a) * T * 0.16);
    ctx.lineTo(Math.cos(a) * T * (0.34 + 0.10 * f), Math.sin(a) * T * (0.34 + 0.10 * f));
    ctx.stroke();
  }
  ctx.restore();
};

// 落雷：一根从天上砸下来的白柱
window.PROP_DRAW["bolt35"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : 0) / 1000;
  const f = 0.6 + 0.4 * Math.sin(t * 40);
  ctx.save();
  // 整片会被迷雾压掉约四成，所以这里必须画得比"看着合适"更狠一档，
  // 否则落雷在屏幕上就是一团发灰的雾，玩家根本看不出劈下来了。
  ctx.fillStyle = "rgba(255,255,255," + (0.85 * f).toFixed(3) + ")";
  ctx.beginPath(); ctx.arc(0, T * 0.1, T * 0.72, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255," + (0.95 * f).toFixed(3) + ")";
  ctx.beginPath(); ctx.arc(0, T * 0.05, T * 0.44, 0, Math.PI * 2); ctx.fill();
  // 主干，带着锯齿
  ctx.strokeStyle = "rgba(255,255,255," + (1.0 * f).toFixed(3) + ")";
  ctx.lineWidth = Math.max(3, T * 0.20);
  ctx.beginPath();
  ctx.moveTo(0, -T * 1.6);
  let yy = -T * 1.2;
  let xx = 0;
  while (yy < T * 0.4) {
    xx = (Math.random() - 0.5) * T * 0.34;
    ctx.lineTo(xx, yy);
    yy += T * 0.28;
  }
  ctx.stroke();
  // 外圈的电晕
  ctx.strokeStyle = "rgba(225,242,255," + (0.95 * f).toFixed(3) + ")";
  ctx.lineWidth = Math.max(2, T * 0.08);
  ctx.beginPath(); ctx.arc(0, T * 0.05, T * 0.50, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
};

// ---------- 每帧：静电放电 ----------
window.__LEVEL_TICK = window.__LEVEL_TICK || {};
window.__LEVEL_TICK["3.5"] = function (g, dt) {
  const map = g.map;
  if (!map || !map.outdoor35) return;
  const T = (typeof TILE === "number" ? TILE : 40);
  const px = g.player.x / T, py = g.player.y / T;

  // 站在室外就会持续难熬（雷暴的压迫感）
  const kHere = Math.round(px) + "," + Math.round(py);
  g.electroOutdoor = !!map.outdoor35.has(kHere);

  // 找一段离玩家不太远的室外格 —— 让玩家既能躲，也能主动迎上去撞
  function pickSpot(nearPlayer) {
    const keys = map.outdoorKeys || [];
    if (!keys.length) return null;
    for (let i = 0; i < 60; i++) {
      const k = keys[randInt(0, keys.length - 1)];
      const [x, y] = k.split(",").map(Number);
      if (Math.hypot(x - startX, y - startY) < 2) continue;
      const d = Math.hypot(x - px, y - py);
      if (nearPlayer ? (d > 2.5 && d < 9) : d > 6) return { x, y };
    }
    const k = keys[randInt(0, keys.length - 1)];
    const [x, y] = k.split(",").map(Number);
    return { x, y };
  }
  const startX = map.start.x, startY = map.start.y;

  // ---- 状态机 ----
  map.nextBolt = (map.nextBolt || 2.2) - dt;
  if (!map.bolt && map.nextBolt <= 0) {
    // 七成落在玩家附近（这样才能"撞上去"），三成落在远处
    const spot = pickSpot(Math.random() < 0.7);
    if (spot) {
      map.bolt = { x: spot.x, y: spot.y, phase: "charge", t: 0 };
      map.props.push({ x: spot.x, y: spot.y, floor: 0, type: "charge35", _bolt: true });
      if (typeof window.__toast === "function") {
        const d = Math.hypot(spot.x - px, spot.y - py);
        if (d < 6) window.__toast("静电在聚集 —— 有东西要劈下来了");
      }
    }
    map.nextBolt = 2.0 + Math.random() * 2.2;
  }

  if (map.bolt) {
    const b = map.bolt;
    b.t += dt;
    if (b.phase === "charge" && b.t > 0.9) {
      // 轰击
      b.phase = "strike"; b.t = 0;
      map.props = map.props.filter((p) => !(p._bolt && p.type === "charge35"));
      map.props.push({ x: b.x, y: b.y, floor: 0, type: "bolt35", _bolt: true });
      const d = Math.hypot(b.x - px, b.y - py);
      if (typeof window.__toast === "function") {
        if (d < 3) window.__toast("轰 —— 震荡波把你掀翻了，耳朵里只剩嗡鸣");
        else window.__toast("远处一声巨响 —— 地面在抖");
      }
      if (d < 1.6) {
        // 被击中了：按确定的出口处理 —— 打回 Level 3。
        // 掉一大截血但保证不死（"撞死"是为了换一条出路，不是结束这一局）
        g.hp = Math.max(1, g.hp - 45);
        g.sanity = Math.max(1, g.sanity - 20);
        if (typeof window.__goToLevel === "function") {
          window.__goToLevel("3");
        }
        return;
      }
    } else if (b.phase === "strike" && b.t > 0.42) {
      map.props = map.props.filter((p) => !(p._bolt && p.type === "bolt35"));
      map.bolt = null;
    }
  }

  // 窗灵：只有人在室外时才看得见、才有压迫感（它进不了室内）
  if (g.electroOutdoor) {
    let nearGhost = false;
    for (const p of map.props) {
      if (p.type !== "ghost35") continue;
      if (Math.hypot(p.x - px, p.y - py) < 2.5) { nearGhost = true; break; }
    }
    if (nearGhost) {
      g.sanity = Math.max(0, g.sanity - 2.2 * dt);
      const now = (typeof performance !== "undefined" ? performance.now() : 0) / 1000;
      if (!g._ghost35 || now - g._ghost35 > 9) {
        g._ghost35 = now;
        if (typeof window.__toast === "function") window.__toast("玻璃的反射里有个人影 —— 别再看第二眼");
      }
    }
  }
};

// ---------- Level 3 里那扇通向电都的门 ----------
window.PROP_DRAW["door35"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : 0) / 1000;
  const w = T * 0.82, h = T * 0.98;
  // 门框：粗野主义的厚混凝土
  ctx.fillStyle = "#5e6268";
  ctx.fillRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8);
  // 门板：沉重的金属
  ctx.fillStyle = "#4a4e54";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "rgba(255,255,255,0.09)";
  ctx.fillRect(-w / 2, -h / 2, w, h * 0.22);
  // 横向的加强筋
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(-w / 2, -h * 0.10, w, Math.max(2, h * 0.08));
  ctx.fillRect(-w / 2, h * 0.26, w, Math.max(2, h * 0.08));
  // 门缝里透出的雷暴白光 —— 一下一下地闪
  const f = 0.4 + 0.6 * Math.abs(Math.sin(t * 2.6 + p.x * 0.7));
  ctx.fillStyle = "rgba(215,235,255," + (0.35 + 0.5 * f).toFixed(3) + ")";
  ctx.fillRect(-w / 2, h / 2 - Math.max(2, h * 0.06), w, Math.max(2, h * 0.06));
  // 门牌：写着 3.5
  ctx.fillStyle = "#2c3036";
  ctx.fillRect(-w * 0.34, -h * 0.44, w * 0.68, h * 0.16);
  ctx.fillStyle = "#dfe8f0";
  ctx.font = "bold " + Math.round(T * 0.15) + "px system-ui, sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("3.5", 0, -h * 0.36);
  // 把手
  ctx.fillStyle = "#8a9096";
  ctx.fillRect(w * 0.22, -h * 0.06, w * 0.14, Math.max(2, h * 0.05));
};
