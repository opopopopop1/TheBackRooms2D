// ===========================================================
// Level 29 —— 海波利亚
//   后室里少有的"家园"。一座被悬崖、陡坡和山脉层层保护的岛，
//   岛上住着大约 25000 人，分成 250 来个互不统属的社群。
//   三个圈：
//     外圈   —— 丘陵和峭壁的高地上，常见小棚屋和瞭望塔
//     内圈   —— 受山脉保护，农田环绕着小型定居点，木头房子
//     外层区域 —— 岛外的海。那是死亡区，几乎所有试图穿越的人都没回来
//   岛中心是海波利亚：不是首都（每个社群都有自己的"首都"），
//   而是一个集散地 —— 巨型办公楼被当作外交站和总部。
//   山脉是杏仁水的来源，水从山坡上流下来，形成又长又宽的河。
//   ===========================================================
//   出口只有一个：出海。航行 1500 格后到 Level 284。
//   海里睡着"克拉肯" —— 一座岛那么大的章鱼，周身的磁场会造成
//   把一切拉近的漩涡。所有经过那里的船，再没有回来过。
// ===========================================================
"use strict";

(function () {
  // 草绿地面 / 岩壁（都不是黑的，也不是 Level 2 的管道）
  const v = ["#7d9a5c", "#8a8371"];
  if (typeof regTile === "function") regTile("isle29", v);
  else { (window.__NEWTILE_EXTRA = window.__NEWTILE_EXTRA || {})["isle29"] = v; }
})();

function generateIsle29Map(level) {
  const size = 150;
  const grid = makeGrid(size);
  const props = [];
  const floors = [];
  const CX = size / 2, CY = size / 2;

  // 岛屿的轮廓：不规则的圆 —— 用几个正弦叠出来，不是标准圆
  const R = size * 0.40;
  const wobble = (a) => 1 + 0.10 * Math.sin(a * 3 + 1.1) + 0.07 * Math.sin(a * 5 - 0.4) + 0.05 * Math.sin(a * 7 + 2.2);
  const isleR = (a) => R * wobble(a);

  const water = new Set();     // 外层区域：海（踩上去会死，除非在船上）
  const sand  = new Set();     // 海岸线
  const rock  = new Set();     // 山体（墙）
  const farm  = new Set();     // 农田
  const river = new Set();     // 杏仁水河

  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      const dx = x - CX, dy = y - CY;
      const d = Math.hypot(dx, dy);
      const a = Math.atan2(dy, dx);
      const rr = isleR(a);
      if (d > rr) { grid[y][x] = 0; water.add(x + "," + y); }          // 海：可站，但会死
      else if (d > rr - 4) { grid[y][x] = 0; sand.add(x + "," + y); }  // 海岸线
      else grid[y][x] = 0;                                             // 岛上的土地
    }
  }

  // ---------- 山脉：两圈断续的弧，段与段之间留山口 ----------
  // 山体是墙（走不上去），山口保证内圈和外圈连通。
  const ring = (rBase, segs, width, jitter) => {
    for (let s = 0; s < segs; s++) {
      const a0 = (s / segs) * Math.PI * 2 + jitter;
      const a1 = ((s + 1) / segs) * Math.PI * 2 - 0.16 + jitter;   // 段尾留口
      for (let a = a0; a < a1; a += 0.012) {
        const rr = isleR(a) * rBase;
        for (let w = -width; w <= width; w++) {
          const x = Math.round(CX + Math.cos(a) * (rr + w));
          const y = Math.round(CY + Math.sin(a) * (rr + w));
          if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) continue;
          const k = x + "," + y;
          if (water.has(k) || sand.has(k)) continue;
          grid[y][x] = 1;
          rock.add(k);
        }
      }
    }
  };
  // 内圈山脉（把内圈围起来）—— 8 段，8 个山口
  ring(0.52, 8, 2, 0.0);
  // 外圈山脉（把外圈再围一层）—— 6 段
  ring(0.78, 6, 2, 0.5);

  // ---------- 杏仁水河：从山上流下来，又长又宽 ----------
  // 从内圈山脉的四个山口往低处流，一直流到海里
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.35;
    let x = Math.round(CX + Math.cos(a) * isleR(a) * 0.50);
    let y = Math.round(CY + Math.sin(a) * isleR(a) * 0.50);
    for (let step = 0; step < 200; step++) {
      if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) break;
      const k = x + "," + y;
      if (water.has(k)) break;
      // 河宽 2 格
      for (let w = 0; w < 2; w++) {
        const xx = x + (Math.abs(Math.cos(a)) > 0.6 ? 0 : w);
        const yy = y + (Math.abs(Math.cos(a)) > 0.6 ? w : 0);
        if (xx < 1 || yy < 1 || xx >= size - 1 || yy >= size - 1) continue;
        if (rock.has(xx + "," + yy)) continue;
        grid[yy][xx] = 0;
        river.add(xx + "," + yy);
      }
      // 顺着"往海的方向"流，带一点摆动
      const wob = Math.sin(step * 0.22 + i) * 0.5;
      x += Math.round(Math.cos(a + wob) * 1.2);
      y += Math.round(Math.sin(a + wob) * 1.2);
    }
  }

  // ---------- 海波利亚：岛正中的集散地 ----------
  // 一排排木屋 + 几栋形似巨型办公楼的外交站（办公楼是墙块，中间留门）
  const city = { cx: Math.round(CX), cy: Math.round(CY), r: Math.round(size * 0.155) };
  const blocks = [];
  const putBlock = (bx, by, w, h, kind) => {
    let ok = true;
    for (let y = by; y < by + h; y++) for (let x = bx; x < bx + w; x++) {
      if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) { ok = false; break; }
      if (water.has(x + "," + y) || rock.has(x + "," + y)) { ok = false; break; }
    }
    if (!ok) return null;
    for (let y = by; y < by + h; y++) for (let x = bx; x < bx + w; x++) {
      const edge = (x === bx || x === bx + w - 1 || y === by || y === by + h - 1);
      if (edge) grid[y][x] = 1;
      else grid[y][x] = 0;
    }
    // 门：在南墙正中开一个口
    const dx = bx + Math.floor(w / 2), dy = by + h - 1;
    grid[dy][dx] = 0;
    const b = { bx, by, w, h, kind, door: { x: dx, y: dy } };
    blocks.push(b);
    return b;
  };
  // 木屋：4×4，成排
  for (let i = 0; i < 26; i++) {
    const a = rand(0, Math.PI * 2);
    const rr = rand(0, city.r);
    const bx = Math.round(city.cx + Math.cos(a) * rr);
    const by = Math.round(city.cy + Math.sin(a) * rr);
    putBlock(bx, by, 4, 4, "hut");
  }
  // 外交站：巨型办公楼，6×8，四栋
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.8;
    const bx = Math.round(city.cx + Math.cos(a) * city.r * 0.7) - 3;
    const by = Math.round(city.cy + Math.sin(a) * city.r * 0.7) - 4;
    putBlock(bx, by, 6, 8, "office");
  }

  // ---------- 内圈：农田环绕的小型定居点 ----------
  const farms = [];
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + 0.2;
    const rr = isleR(a) * rand(0.28, 0.44);
    const fx = Math.round(CX + Math.cos(a) * rr);
    const fy = Math.round(CY + Math.sin(a) * rr);
    // 一片农田：8×6 的格子地
    let cells = [];
    for (let y = fy; y < fy + 6; y++) for (let x = fx; x < fx + 8; x++) {
      if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) continue;
      const k = x + "," + y;
      if (water.has(k) || rock.has(k) || grid[y][x] === 1) continue;
      farm.add(k);
      cells.push({ x, y });
    }
    if (cells.length) farms.push({ x: fx, y: fy, cells });
  }

  collectFloorsInto(grid, size, floors);

  // ---------- 出生点：船坞（初至此地的人就是在这儿上的岸） ----------
  // 挑一个海岸线内侧、挨着海的格子
  let dock = null;
  for (let i = 0; i < 400; i++) {
    const a = rand(0, Math.PI * 2);
    const rr = isleR(a) - 5;
    const x = Math.round(CX + Math.cos(a) * rr);
    const y = Math.round(CY + Math.sin(a) * rr);
    if (x < 2 || y < 2 || x >= size - 2 || y >= size - 2) continue;
    if (grid[y][x] !== 0 || water.has(x + "," + y)) continue;
    // 旁边要有海（船得停在水里）
    let hasW = false;
    for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) {
      if (water.has((x + ox) + "," + (y + oy))) { hasW = true; break; }
    }
    if (!hasW) continue;
    dock = { x, y };
    break;
  }
  if (!dock) dock = { x: Math.round(CX), y: Math.round(CY - isleR(-Math.PI / 2) + 5) };
  // 出生点必须是**整数格子** —— 写成 +0.5（像素中心）的话，
  // 外层 fixStartInsideWall 会拿它去索引 grid[y][x]，读到 undefined 直接抛错，
  // 整张地图生成失败、回退成默认的房间图（看到的就不是这座岛了）。
  const start = { x: dock.x, y: dock.y, floor: 0 };

  // ---------- 物件 ----------
  const props_ok = (x, y) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return false;
    if (grid[y][x] !== 0) return false;
    if (water.has(x + "," + y)) return false;
    return true;
  };
  const put = (x, y, type, extra) => {
    if (!props_ok(x, y)) return null;
    const p = Object.assign({ x, y, floor: 0, type }, extra || {});
    props.push(p);
    return p;
  };

  // 船坞 + 停在水边的船（出口就是它）
  put(dock.x, dock.y, "p29dock");
  let boat = null;
  for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const bx = dock.x + ox, by = dock.y + oy;
    if (props_ok(bx, by)) { boat = put(bx, by, "p29boat", { nm: 0 }); break; }
  }
  if (!boat) boat = put(dock.x + 1, dock.y, "p29boat", { nm: 0 });

  // 外圈：峭壁和丘陵上的小棚屋 + 瞭望塔
  for (let i = 0; i < 10; i++) {
    const a = rand(0, Math.PI * 2);
    const rr = isleR(a) * rand(0.80, 0.94);
    const x = Math.round(CX + Math.cos(a) * rr);
    const y = Math.round(CY + Math.sin(a) * rr);
    put(x, y, "p29shed");
  }
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.9;
    const rr = isleR(a) * 0.88;
    const x = Math.round(CX + Math.cos(a) * rr);
    const y = Math.round(CY + Math.sin(a) * rr);
    put(x, y, "p29tower");
  }

  // 内圈：农田边上的小棚屋（给小镇提供稳定的食物）
  for (const f of farms) {
    if (f.cells.length) {
      const c = f.cells[0];
      put(c.x, c.y, "p29shed");
    }
  }

  // 海波利亚的木屋门口挂个牌子，办公楼是外交站
  for (const b of blocks) {
    if (b.kind === "office") put(b.door.x, b.door.y + 1, "p29office");
    else if (randInt(0, 2) === 0) put(b.door.x, b.door.y + 1, "p29sign");
  }

  // 岛上常见的红色树木：又粗又高，白色的叶子
  for (let i = 0; i < 70; i++) {
    const a = rand(0, Math.PI * 2);
    const rr = isleR(a) * rand(0.10, 0.95);
    const x = Math.round(CX + Math.cos(a) * rr);
    const y = Math.round(CY + Math.sin(a) * rr);
    put(x, y, "p29redtree");
  }

  // 杏仁水：山坡上流下来的泉眼（河的源头附近）
  let springs = 0;
  for (const k of river) {
    if (springs >= 8) break;
    if (randInt(0, 40) !== 0) continue;
    const [x, y] = k.split(",").map(Number);
    if (put(x, y, "p29almond")) springs++;
  }
  // 河里也能直接捧起来喝 —— 沿岸摆几处
  let riverDrink = 0;
  for (const k of river) {
    if (riverDrink >= 10) break;
    if (randInt(0, 90) !== 0) continue;
    const [x, y] = k.split(",").map(Number);
    if (put(x, y, "p29almond", { fromRiver: true })) riverDrink++;
  }

  // 友好的居民：和流浪者很相似的类人生物
  for (let i = 0; i < 22; i++) {
    const a = rand(0, Math.PI * 2);
    const rr = isleR(a) * rand(0.05, 0.92);
    const x = Math.round(CX + Math.cos(a) * rr);
    const y = Math.round(CY + Math.sin(a) * rr);
    put(x, y, "p29villager", { tone: randInt(0, 4) });
  }

  // 岛上的动物（和前厅的相比有些细微的变化）
  for (let i = 0; i < 14; i++) {
    const a = rand(0, Math.PI * 2);
    const rr = isleR(a) * rand(0.15, 0.90);
    const x = Math.round(CX + Math.cos(a) * rr);
    const y = Math.round(CY + Math.sin(a) * rr);
    put(x, y, "p29animal", { kind: randInt(0, 3) });
  }

  // 克拉肯：远离岛屿的深海。它的磁场会造成漩涡 —— 进了就出不来
  const krakens = [];
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 1.4;
    const rr = isleR(a) * 1.18;
    const x = Math.round(CX + Math.cos(a) * rr);
    const y = Math.round(CY + Math.sin(a) * rr);
    if (x < 2 || y < 2 || x >= size - 2 || y >= size - 2) continue;
    const p = { x, y, floor: 0, type: "p29kraken", r: 3 };
    props.push(p);
    krakens.push(p);
  }

  return {
    size, level: 29, doubleStory: false,
    layers: [grid], grid, rooms: [[]], floors: [floors],
    start, exit: null, doors: [], ramps: [],
    props, crates: [], ground: [],

    style: "isle29",
    tileName: "isle29",
    // 地形标记（绘制和踩踏判定都要用）
    water29: water, sand29: sand, rock29: rock, farm29: farm, river29: river,
    city29: city, blocks29: blocks, krakens29: krakens,
    dock29: dock,
    boat29: boat,
    // 航行进度：上船之后每一格算 10 海里，凑满 1500 就到 Level 284
    nm29: 0,
  };
}
window.generateIsle29Map = generateIsle29Map;

function collectFloorsInto(grid, size, out) {
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    if (grid[y][x] === 0) out.push({ x, y });
  }
  return out;
}

// ---------------- 地面 ----------------
window.drawIsle29Floor = function (ctx, px, py, S, map, tx, ty) {
  const k = tx + "," + ty;
  const t = performance.now() / 1000;
  if (map.water29 && map.water29.has(k)) {
    // 外层区域：海。会动的波纹。
    const w1 = Math.sin(t * 1.2 + tx * 0.5 + ty * 0.3);
    const base = 38 + w1 * 10;
    ctx.fillStyle = "rgb(" + Math.round(base * 0.55) + "," + Math.round(base * 0.95) + "," + Math.round(base * 1.55) + ")";
    ctx.fillRect(px, py, S, S);
    // 浪尖
    ctx.fillStyle = "rgba(255,255,255,0.16)";
    const yy = py + ((t * 9 + tx * 5 + ty * 7) % S);
    ctx.fillRect(px + 1, yy, S - 2, 2);
    return true;
  }
  if (map.river29 && map.river29.has(k)) {
    // 杏仁水河：淡金色，缓缓地流
    const w2 = Math.sin(t * 1.6 + tx * 0.7) * 0.5 + 0.5;
    ctx.fillStyle = "rgb(" + Math.round(150 + w2 * 30) + "," + Math.round(160 + w2 * 26) + "," + Math.round(120 + w2 * 20) + ")";
    ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(255,248,210,0.30)";
    ctx.fillRect(px, py + ((t * 16 + tx * 4) % S), S, 2);
    return true;
  }
  if (map.sand29 && map.sand29.has(k)) {
    ctx.fillStyle = "#d8c79a";
    ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(150,130,90,.18)";
    ctx.fillRect(px + 2, py + 3, 3, 2);
    ctx.fillRect(px + S - 6, py + S - 5, 3, 2);
    return true;
  }
  if (map.farm29 && map.farm29.has(k)) {
    // 农田：垄沟
    ctx.fillStyle = "#8a6f42";
    ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(120,150,60,.55)";
    for (let i = 0; i < 3; i++) ctx.fillRect(px + 3, py + 4 + i * 11, S - 6, 4);
    return true;
  }
  // 岛上的草地
  const odd = ((tx + ty) % 2) === 0;
  ctx.fillStyle = odd ? "#7d9a5c" : "#73904f";
  ctx.fillRect(px, py, S, S);
  // 一点草叶的纹理
  if (((tx * 7 + ty * 5) % 5) === 0) {
    ctx.fillStyle = "rgba(255,255,255,.10)";
    ctx.fillRect(px + 2, py + 2, 2, 4);
  }
  return true;
};

// ---------------- 墙：山体 / 建筑的墙 ----------------
window.drawIsle29Wall = function (ctx, px, py, S, map, tx, ty) {
  const k = tx + "," + ty;
  if (map.rock29 && map.rock29.has(k)) {
    // 山脉：粗糙的岩石，底下压着阴影
    ctx.fillStyle = "#8a8371";
    ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(255,255,255,.16)";
    ctx.fillRect(px, py, S, Math.max(2, S * 0.22));
    ctx.fillStyle = "rgba(0,0,0,.22)";
    ctx.fillRect(px, py + S - Math.max(2, S * 0.18), S, Math.max(2, S * 0.18));
    // 岩缝
    ctx.strokeStyle = "rgba(60,55,45,.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px + S * 0.2, py + S * 0.4); ctx.lineTo(px + S * 0.7, py + S * 0.6);
    ctx.stroke();
    return true;
  }
  // 建筑的墙：Level 29 特产的木材 —— 防火，比绝大多数建材都硬
  ctx.fillStyle = "#a9743f";
  ctx.fillRect(px, py, S, S);
  // 横着的木纹
  ctx.fillStyle = "rgba(255,255,255,.10)";
  for (let i = 0; i < 3; i++) ctx.fillRect(px, py + 4 + i * 12, S, 2);
  ctx.fillStyle = "rgba(60,36,16,.30)";
  ctx.fillRect(px, py + S - 4, S, 4);
  return true;
};

// ---------------- 环境：岛上永远是好天气 ----------------
window.drawIsle29 = function (ctx, g) {
  const cw = (ctx.canvas && ctx.canvas.width) || 800;
  const ch = (ctx.canvas && ctx.canvas.height) || 600;
  const t = performance.now() / 1000;
  ctx.save();
  try { ctx.setTransform(1, 0, 0, 1, 0, 0); } catch (e) { /* 忽略 */ }
  // 一点暖阳 —— 保证画面不是黑块
  ctx.fillStyle = "rgba(255,236,180,.045)";
  ctx.fillRect(0, 0, cw, ch);
  // 在船上航行时，画面四周压一圈海水的蓝
  if (g && g.onBoat29) {
    const gr = ctx.createRadialGradient(cw / 2, ch / 2, ch * 0.25, cw / 2, ch / 2, ch * 0.95);
    gr.addColorStop(0, "rgba(30,90,170,0)");
    gr.addColorStop(1, "rgba(20,70,150,0.42)");
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, cw, ch);
    // 航行的进度条
    const nm = Math.min(1500, (g.nm29 || 0));
    const bw = Math.min(320, cw * 0.5), bx = (cw - bw) / 2, by = ch - 54;
    ctx.fillStyle = "rgba(0,0,0,.42)";
    ctx.fillRect(bx - 2, by - 2, bw + 4, 16);
    ctx.fillStyle = "rgba(120,200,255,.30)";
    ctx.fillRect(bx, by, bw, 12);
    ctx.fillStyle = "rgba(150,225,255,.85)";
    ctx.fillRect(bx, by, bw * (nm / 1500), 12);
    ctx.fillStyle = "#eaf6ff";
    ctx.font = "12px monospace";
    ctx.textAlign = "center";
    ctx.fillText("航行 " + Math.round(nm) + " / 1500 海里", cw / 2, by - 6);
    ctx.textAlign = "left";
  }
  ctx.restore();
};

// ---------------- 物件 ----------------
window.PROP_DRAW = window.PROP_DRAW || {};

// 船坞：初至此地的人就是在这儿上的岸
window.PROP_DRAW["p29dock"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#8a6a44";
  ctx.fillRect(x + 1, y + 4, T - 2, T - 8);
  ctx.fillStyle = "rgba(255,255,255,.16)";
  for (let i = 0; i < 3; i++) ctx.fillRect(x + 2, y + 6 + i * 10, T - 4, 2);
  ctx.fillStyle = "#6a4c2c";
  ctx.fillRect(x + 3, y + T - 8, 4, 6);
  ctx.fillRect(x + T - 7, y + T - 8, 4, 6);
};

// 船：唯一"可能"离开这座岛的方式
window.PROP_DRAW["p29boat"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  const t = performance.now() / 1000;
  const bob = Math.sin(t * 1.6) * 2;
  ctx.save();
  ctx.translate(0, bob);
  // 船身
  ctx.fillStyle = "#9a6a3c";
  ctx.beginPath();
  ctx.moveTo(x + T * 0.10, y + T * 0.52);
  ctx.lineTo(x + T * 0.90, y + T * 0.52);
  ctx.lineTo(x + T * 0.76, y + T * 0.80);
  ctx.lineTo(x + T * 0.24, y + T * 0.80);
  ctx.closePath();
  ctx.fill();
  // 舷内
  ctx.fillStyle = "#7a4f2a";
  ctx.fillRect(x + T * 0.18, y + T * 0.54, T * 0.64, T * 0.10);
  // 桅杆和帆
  ctx.fillStyle = "#6a4c2c";
  ctx.fillRect(x + T * 0.48, y + T * 0.18, 3, T * 0.36);
  ctx.fillStyle = "#eae2cc";
  ctx.beginPath();
  ctx.moveTo(x + T * 0.50, y + T * 0.20);
  ctx.lineTo(x + T * 0.76, y + T * 0.46);
  ctx.lineTo(x + T * 0.50, y + T * 0.46);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

// 红色树木：又粗又高，白色的叶子，硬度比铝还大
window.PROP_DRAW["p29redtree"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  // 树干（红）
  ctx.fillStyle = "#9c3b30";
  ctx.fillRect(x + T * 0.40, y + T * 0.32, T * 0.20, T * 0.60);
  ctx.fillStyle = "rgba(255,255,255,.12)";
  ctx.fillRect(x + T * 0.40, y + T * 0.32, 3, T * 0.60);
  // 白叶
  ctx.fillStyle = "#f2efe4";
  ctx.beginPath();
  ctx.arc(x + T * 0.50, y + T * 0.28, T * 0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e2ddcd";
  ctx.beginPath();
  ctx.arc(x + T * 0.36, y + T * 0.34, T * 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + T * 0.64, y + T * 0.32, T * 0.14, 0, Math.PI * 2);
  ctx.fill();
};

// 杏仁水：从山坡上流下来的
window.PROP_DRAW["p29almond"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  const t = performance.now() / 1000;
  const gl = 0.55 + 0.25 * Math.sin(t * 2.4);
  ctx.fillStyle = "rgba(240,225,150," + gl.toFixed(2) + ")";
  ctx.beginPath();
  ctx.ellipse(x + T / 2, y + T * 0.62, T * 0.30, T * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f6ecc0";
  ctx.beginPath();
  ctx.ellipse(x + T / 2, y + T * 0.58, T * 0.20, T * 0.10, 0, 0, Math.PI * 2);
  ctx.fill();
};

// 小棚屋（外圈高地上 / 农田边上 —— 给小镇提供稳定的食物）
window.PROP_DRAW["p29shed"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#b07f47";
  ctx.fillRect(x + 3, y + T * 0.34, T - 6, T * 0.56);
  // 茅草顶
  ctx.fillStyle = "#c9a86a";
  ctx.beginPath();
  ctx.moveTo(x, y + T * 0.38);
  ctx.lineTo(x + T / 2, y + T * 0.10);
  ctx.lineTo(x + T, y + T * 0.38);
  ctx.closePath();
  ctx.fill();
  // 门
  ctx.fillStyle = "#6a4c2c";
  ctx.fillRect(x + T * 0.38, y + T * 0.56, T * 0.24, T * 0.34);
};

// 瞭望塔：抵御外来威胁的第二层保护
window.PROP_DRAW["p29tower"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#8a6a44";
  ctx.fillRect(x + T * 0.32, y + T * 0.28, T * 0.36, T * 0.62);
  ctx.fillStyle = "#a9743f";
  ctx.fillRect(x + T * 0.18, y + T * 0.18, T * 0.64, T * 0.14);
  ctx.fillStyle = "#6a4c2c";
  ctx.fillRect(x + T * 0.24, y + T * 0.06, T * 0.52, T * 0.12);
  // 塔上的灯
  const t = performance.now() / 1000;
  ctx.fillStyle = Math.sin(t * 2) > 0 ? "rgba(255,220,120,.85)" : "rgba(180,150,90,.5)";
  ctx.fillRect(x + T * 0.42, y + T * 0.34, T * 0.16, 4);
};

// 外交站 / 总部：形似巨型办公楼
window.PROP_DRAW["p29office"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#6f7784";
  ctx.fillRect(x + 2, y + 2, T - 4, T - 4);
  // 一格格的窗
  ctx.fillStyle = "#cfe0ea";
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
    ctx.fillRect(x + 5 + c * (T - 12) / 3, y + 5 + r * (T - 12) / 3, (T - 12) / 3 - 2, (T - 12) / 3 - 2);
  }
  ctx.fillStyle = "rgba(0,0,0,.25)";
  ctx.fillRect(x + 2, y + T - 6, T - 4, 4);
};

// 路牌
window.PROP_DRAW["p29sign"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#7a5c38";
  ctx.fillRect(x + T * 0.46, y + T * 0.40, 3, T * 0.50);
  ctx.fillStyle = "#c9a86a";
  ctx.fillRect(x + T * 0.18, y + T * 0.24, T * 0.64, T * 0.20);
  ctx.fillStyle = "#5a4020";
  ctx.font = Math.max(5, Math.floor(T * 0.13)) + "px monospace";
  ctx.textAlign = "center";
  ctx.fillText("海波利亚", x + T / 2, y + T * 0.38);
  ctx.textAlign = "left";
};

// 友好的居民：和流浪者很相似的类人生物
window.PROP_DRAW["p29villager"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  const TONE = ["#8a6f9a", "#6f8a6a", "#9a846a", "#6a7a9a", "#9a6a6a"];
  const c = TONE[(p.tone || 0) % TONE.length];
  ctx.fillStyle = "#e8dcc4";
  ctx.fillRect(x + T * 0.28, y + T * 0.14, T * 0.44, T * 0.34);   // 脸
  ctx.fillStyle = c;
  ctx.fillRect(x + T * 0.20, y + T * 0.46, T * 0.60, T * 0.46);   // 身子
  ctx.fillStyle = "rgba(0,0,0,.18)";
  ctx.fillRect(x + T * 0.20, y + T * 0.86, T * 0.60, 3);
};

// 岛上的动物（和前厅的相比有些细微的变化）
window.PROP_DRAW["p29animal"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  const t = performance.now() / 1000;
  const bob = Math.sin(t * 2 + p.x) * 1.5;
  ctx.save();
  ctx.translate(0, bob);
  const C = ["#b08a5a", "#d8d2c0", "#7a6a5a", "#c9a86a"];
  ctx.fillStyle = C[(p.kind || 0) % 4];
  ctx.fillRect(x + T * 0.22, y + T * 0.40, T * 0.54, T * 0.30);
  ctx.fillRect(x + T * 0.62, y + T * 0.28, T * 0.20, T * 0.18);   // 头
  ctx.fillStyle = "rgba(0,0,0,.30)";
  ctx.fillRect(x + T * 0.26, y + T * 0.68, 3, T * 0.16);
  ctx.fillRect(x + T * 0.62, y + T * 0.68, 3, T * 0.16);
  ctx.restore();
};

// 克拉肯：海底深处那只和岛一样大的章鱼。它的磁场会把一切拉近。
window.PROP_DRAW["p29kraken"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  const t = performance.now() / 1000;
  const R = T * 3.2;
  // 漩涡：一圈圈往里卷
  ctx.save();
  ctx.translate(x + T / 2, y + T / 2);
  for (let i = 0; i < 5; i++) {
    const rr = R * (1 - i * 0.18);
    ctx.strokeStyle = "rgba(20,60,110," + (0.30 + i * 0.10).toFixed(2) + ")";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, rr, t * (0.8 + i * 0.2), t * (0.8 + i * 0.2) + Math.PI * 1.4);
    ctx.stroke();
  }
  // 中心那片黑
  const gr = ctx.createRadialGradient(0, 0, 2, 0, 0, R * 0.5);
  gr.addColorStop(0, "rgba(4,10,20,.95)");
  gr.addColorStop(1, "rgba(4,10,20,0)");
  ctx.fillStyle = gr;
  ctx.beginPath(); ctx.arc(0, 0, R * 0.5, 0, Math.PI * 2); ctx.fill();
  // 一根触须慢慢伸出来
  const a = t * 0.5;
  ctx.strokeStyle = "#5a3a52";
  ctx.lineWidth = Math.max(3, T * 0.22);
  ctx.beginPath();
  ctx.moveTo(Math.cos(a) * R * 0.45, Math.sin(a) * R * 0.45);
  ctx.quadraticCurveTo(Math.cos(a + 0.8) * R * 0.8, Math.sin(a + 0.8) * R * 0.8,
    Math.cos(a + 1.6) * R * 1.0, Math.sin(a + 1.6) * R * 1.0);
  ctx.stroke();
  ctx.restore();
};

// ---------------- Level 7 码头上那台水上摩托（通往 Level 29） ----------------
window.PROP_DRAW["jet29"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  const t = performance.now() / 1000;
  const bob = Math.sin(t * 2) * 1.5;
  ctx.save();
  ctx.translate(0, bob);
  // 车身
  ctx.fillStyle = "#d94f4f";
  ctx.beginPath();
  ctx.moveTo(x + T * 0.14, y + T * 0.56);
  ctx.lineTo(x + T * 0.86, y + T * 0.56);
  ctx.lineTo(x + T * 0.72, y + T * 0.78);
  ctx.lineTo(x + T * 0.26, y + T * 0.78);
  ctx.closePath();
  ctx.fill();
  // 车把
  ctx.fillStyle = "#3a3a44";
  ctx.fillRect(x + T * 0.60, y + T * 0.36, T * 0.22, 3);
  ctx.fillRect(x + T * 0.72, y + T * 0.36, 3, T * 0.20);
  // 尾流
  ctx.fillStyle = "rgba(255,255,255,.35)";
  ctx.fillRect(x + T * 0.20, y + T * 0.80, T * 0.30, 2);
  ctx.restore();
};

// ---------------- 骑上水上摩托之后：人脚下的车 + 尾流 + 里程条 ----------------
// 档案：「用它在 Level 7 的海洋上行驶上百格」—— 这五百格是要真的走完的，
// 所以一路上得看得见自己骑在车上、看得见还差多少格。
window.JET29_DRAW = function (ctx, g, cam) {
  if (!g || !g.jet29ride) return;
  const T = (typeof TILE !== "undefined") ? TILE : 40;
  const px = g.player.x, py = g.player.y;
  const t = (typeof performance !== "undefined" ? performance.now() : 0) / 1000;
  const ang = Math.atan2(g.player.faceY || 0, g.player.faceX || 1);
  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(ang);
  // 尾流：车后两道白浪
  ctx.fillStyle = "rgba(255,255,255," + (0.30 + 0.16 * Math.sin(t * 8)).toFixed(3) + ")";
  ctx.fillRect(-T * 0.95, -T * 0.16, T * 0.55, 3);
  ctx.fillRect(-T * 0.95, T * 0.14, T * 0.40, 3);
  // 车身
  ctx.fillStyle = "#d94f4f";
  ctx.beginPath();
  ctx.moveTo(-T * 0.42, -T * 0.24);
  ctx.lineTo(T * 0.40, -T * 0.20);
  ctx.lineTo(T * 0.34, T * 0.20);
  ctx.lineTo(-T * 0.42, T * 0.24);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#f2c14e";                     // 座垫
  ctx.fillRect(-T * 0.34, -T * 0.13, T * 0.50, T * 0.26);
  ctx.fillStyle = "#2f2f38";                     // 车把
  ctx.fillRect(T * 0.30, -T * 0.30, 3, T * 0.60);
  ctx.restore();
};

// 里程条：屏幕上方一条细条，写明还差多少格
// W/H/DPR 由 main.js 传进来 —— 这里拿不到 IIFE 里的那些变量。
window.JET29_HUD = function (ctx, g, W, H, DPR) {
  if (!g || String(g.level) !== "7") return;
  // 骑着的时候一直显示；没骑车但已经往北走出距离了，也照样显示
  if (!g.jet29ride && !(g.jet29dist > 0)) return;
  const need = (typeof JET29_NEED !== "undefined") ? JET29_NEED : 500;
  const d = Math.min(need, g.jet29dist || 0);
  const w = Math.min(320, W * 0.5), h = 8;
  const x = (W - w) / 2, y = 74;
  ctx.save();
  ctx.setTransform(DPR || 1, 0, 0, DPR || 1, 0, 0);
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "rgba(255,168,190,0.92)";
  ctx.fillRect(x, y, w * (d / need), h);
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "600 13px system-ui, sans-serif";
  ctx.textAlign = "center";
  const onLand = !!(g.map && g.map.land29);
  ctx.fillText(onLand
    ? "北面那块陆地就在前面 —— 走上去"
    : "向北 · " + Math.round(d) + " / " + need + " 格 —— 天会变成粉红色", W / 2, y - 8);
  ctx.restore();
};
