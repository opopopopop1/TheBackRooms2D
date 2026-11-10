// ===========================================================
// 隐秘层级 —— 黯洃銫
// 一系列危险而不稳定的子层级的集合，整体聚合成一个大的隐秘层级。
// 这里做第一个也是最稳定的一部分：零〇层。
//   一片灰度的丛林，树木经常互相穿模卡在一起。
//   昼夜循环 12 小时，且是"瞬间"切换 —— 白天没有实体，夜晚极其危险。
//   切换时会先听到灌篮崽连续五分钟的嚎叫，然后所有自然光消失。
//   夜里手电筒会因为灰度特征而失效。
//   白天有杏仁水汇成的湖泊/河流/瀑布，夜里会变成液态痛苦。
//   在泥土上画一个五角星，会露出一个洞 —— 跌下去到壹一层。
// ===========================================================
"use strict";

// 三个子层级的配色（都是黑白的，但深浅不同 —— 一眼能看出换了地方）
const ANSE_ZONE = {
  "00": { f: "#8a8a8a", w: "#6a6a6a" },     // 零〇层：灰色丛林
  "11": { f: "#c4c0b6", w: "#4e4a44" },     // 壹一层：公馆，浅地板深墙
  "22": { f: "#e8eaec", w: "#5a5e62" },     // 贰二层：雪林，刺眼的白
};

function generateAnseMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const props = [];
  const gravel = new Set();
  const water = new Set();
  const zoneTint = new Map();

  // ---- 三个子层级并排：左 零〇 / 中 壹一 / 右 贰二 ----
  const Z = [];
  {
    const inner = size - 4;                       // 去掉外圈边框
    const bw = Math.floor((inner - 4) / 3);       // 两块隔墙占 4 格
    for (let i = 0; i < 3; i++) {
      const x0 = 2 + i * (bw + 2);
      Z.push({ x0, x1: x0 + bw - 1, key: ["00", "11", "22"][i] });
    }
  }
  const carveZone = (z) => {
    for (let y = 2; y < size - 2; y++)
      for (let x = z.x0; x <= z.x1; x++) {
        grid[y][x] = 0;
        zoneTint.set(x + "," + y, ANSE_ZONE[z.key]);
      }
  };
  for (const z of Z) carveZone(z);

  // ---- 零〇层：灰色丛林 ----
  const z0 = Z[0];
  for (let y = 2; y < size - 2; y++) for (let x = z0.x0; x <= z0.x1; x++) gravel.add(x + "," + y);
  for (let i = 0; i < 3; i++) {                   // 杏仁水汇成的水域
    const lx = randInt(z0.x0 + 2, Math.max(z0.x0 + 2, z0.x1 - 8));
    const ly = randInt(6, size - 10);
    const lw = randInt(4, 7), lh = randInt(3, 6);
    for (let y = ly; y < ly + lh; y++) for (let x = lx; x < lx + lw; x++) {
      if (x >= z0.x0 && x <= z0.x1 && y > 1 && y < size - 2) water.add(x + "," + y);
    }
  }

  // ---- 壹一层：黑白的公馆，家具扭曲受损 ----
  const z1 = Z[1];
  {
    // 一间间房间：横竖各砌几道墙，只在中间开口
    const rw = Math.max(5, Math.floor((z1.x1 - z1.x0) / 3));
    for (let x = z1.x0 + rw; x <= z1.x1 - 1; x += rw + 1) {
      for (let y = 2; y < size - 2; y++) grid[y][x] = 1;
      grid[Math.floor(size / 2)][x] = 0;          // 门洞
    }
    for (let y = 6; y < size - 6; y += 11) {
      for (let x = z1.x0; x <= z1.x1; x++) grid[y][x] = 1;
      grid[y][Math.floor((z1.x0 + z1.x1) / 2)] = 0;
    }
  }

  // ---- 贰二层：被雪覆盖的浓密森林 ----
  const z2 = Z[2];
  // （地面已经在 carveZone 里铺好了，雪靠物件和配色表现）

  // ---- 区与区之间的通道 ----
  // 零〇 → 壹一：在泥地上画五角星露出的那个洞，跌下去就是公馆的大厅
  const midY = Math.floor(size / 2);
  const holeX = z0.x1;
  for (let x = holeX + 1; x <= z1.x1; x++) grid[midY][x] = 0;   // 大厅：横贯公馆
  // 壹一 → 贰二：射杀房主后破坏的那扇门
  const doorX = z1.x1;
  for (let x = doorX + 1; x <= z2.x0 + 1; x++) grid[midY][x] = 0;

  // 公馆里那些被墙围起来的房间得有一扇门 ——
  // 不然每个房间都是孤岛，玩家走到门口才发现进不去。
  {
    const flood = () => {
      const seen = new Set();
      const sx = Math.floor((z1.x0 + z1.x1) / 2), sy = midY;
      if (grid[sy][sx] !== 0) grid[sy][sx] = 0;
      const q = [[sx, sy]]; seen.add(sx + "," + sy);
      while (q.length) {
        const [x, y] = q.pop();
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = x + dx, ny = y + dy;
          if (nx < 1 || ny < 1 || nx >= size - 1 || ny >= size - 1) continue;
          if (grid[ny][nx] !== 0 || seen.has(nx + "," + ny)) continue;
          seen.add(nx + "," + ny); q.push([nx, ny]);
        }
      }
      return seen;
    };
    for (let pass = 0; pass < 40; pass++) {
      const seen = flood();
      // 找一个走不到的房间，凿穿它和已连通区域之间最近的那堵墙
      let best = null, bdx = 1e9;
      for (let y = 2; y < size - 2; y++) {
        for (let x = z1.x0; x <= z1.x1; x++) {
          if (grid[y][x] !== 0 || seen.has(x + "," + y)) continue;
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const wx = x + dx, wy = y + dy;
            if (wx < 2 || wy < 2 || wx > z1.x1 || wy > size - 3) continue;
            if (grid[wy][wx] !== 1) continue;
            // 墙的另一侧是不是已经连通？
            for (const [ex, ey] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
              const nx = wx + ex, ny = wy + ey;
              if (nx < 1 || ny < 1 || nx >= size - 1 || ny >= size - 1) continue;
              if (grid[ny][nx] !== 0 || !seen.has(nx + "," + ny)) continue;
              const d = Math.abs(nx - x) + Math.abs(ny - y);
              if (d < bdx) { bdx = d; best = { wx, wy }; }
            }
          }
        }
      }
      if (!best) break;
      grid[best.wy][best.wx] = 0;                 // 凿一扇门
    }
  }

  const floors = collectFloors(grid, size);
  let start = { x: z0.x0 + 1, y: 4, floor: 0 };
  for (const f of floors) {
    if (f.x >= z0.x0 && f.x <= z0.x1 && !water.has(f.x + "," + f.y)) { start = { x: f.x, y: f.y, floor: 0 }; break; }
  }

  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return;
    if (grid[y] == null || grid[y][x] !== 0) return;
    props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  };
  const inZone = (z, x) => x >= z.x0 && x <= z.x1;

  // 零〇层：入口处那间灰色棚屋，门上挂着"零〇"的标牌
  put(start.x + 2, start.y, "hut00");
  put(start.x, start.y - 2, "clock00");            // 唯一能知道时间的东西
  for (const f of floors) {                        // 丛密的灰色树木
    if (!inZone(z0, f.x)) continue;
    if (water.has(f.x + "," + f.y)) continue;
    if (Math.random() > 0.34) continue;
    put(f.x, f.y, "ansetree");
  }
  // 五角星：画在泥土上露出的那个洞 —— 跌下去到壹一层
  put(holeX + 1, midY, "pentahole00");

  // 壹一层：扭曲受损的家具 + 房主
  for (const f of floors) {
    if (!inZone(z1, f.x)) continue;
    if (Math.random() > 0.10) continue;
    put(f.x, f.y, "twistfurn11");
  }
  put(Math.floor((z1.x0 + z1.x1) / 2) - 3, midY - 6, "host11");
  put(doorX + 1, midY, "brokenDoor11");            // 破坏这扇门可以到贰二层

  // 贰二层：覆雪的长枝 + 堕落天使
  for (const f of floors) {
    if (!inZone(z2, f.x)) continue;
    if (Math.random() > 0.28) continue;
    put(f.x, f.y, "snowtree22");
  }
  put(Math.floor((z2.x0 + z2.x1) / 2), midY - 8, "fallenangel22");

  // 这一层没有出口 —— 它是彩蛋 / 必死层级，进来就出不去了。
  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [], gravel, water, zoneTint,
    anseZones: Z,
  };
  map.spawnPts = [start];
  return map;
}

window.PROP_DRAW = window.PROP_DRAW || {};

// 入口那间灰色棚屋，门上写着"零〇"
window.PROP_DRAW["hut00"] = function (ctx, p, T) {
  const w = T * 0.78, h = T * 0.62;
  ctx.fillStyle = "rgba(0,0,0,0.32)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.30, w * 0.55, T * 0.09, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#8a8a8a"; ctx.fillRect(-w / 2, -h * 0.16, w, h * 0.62);
  ctx.fillStyle = "#9a9a9a";
  ctx.beginPath(); ctx.moveTo(-w * 0.58, -h * 0.16); ctx.lineTo(0, -h * 0.62); ctx.lineTo(w * 0.58, -h * 0.16);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#4a4a4a"; ctx.fillRect(-w * 0.12, h * 0.06, w * 0.24, h * 0.40);   // 门洞
  ctx.fillStyle = "#d8d8d8"; ctx.font = "bold 8px ui-monospace, monospace"; ctx.textAlign = "center";
  ctx.fillText("零〇", 0, -h * 0.24); ctx.textAlign = "left";
};

// 灰度的丛林树木（互相穿模卡在一起）
window.PROP_DRAW["ansetree"] = function (ctx, p, T) {
  const jitter = (((p.x || 0) * 11 + (p.y || 0) * 7) % 5) - 2;    // 穿模：故意错位
  ctx.save(); ctx.translate(jitter * 1.5, 0);
  ctx.fillStyle = "rgba(0,0,0,0.20)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.30, T * 0.16, T * 0.05, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#6e6e6e"; ctx.lineWidth = T * 0.10;
  ctx.beginPath(); ctx.moveTo(0, T * 0.28); ctx.lineTo(0, -T * 0.02); ctx.stroke();
  ctx.fillStyle = "#828282";
  ctx.beginPath(); ctx.arc(0, -T * 0.14, T * 0.20, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#949494";
  ctx.beginPath(); ctx.arc(-T * 0.08, -T * 0.20, T * 0.12, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
};

// 五角星：在泥土上画出来的那个洞 —— 跌下去到壹一层
window.PROP_DRAW["pentahole00"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : 0) / 1000;
  // 洞：一圈越往下越黑的边
  ctx.fillStyle = "#141414";
  ctx.beginPath(); ctx.ellipse(0, 0, T * 0.42, T * 0.34, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "rgba(220,220,220,0.55)"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(0, 0, T * 0.44, T * 0.36, 0, 0, Math.PI * 2); ctx.stroke();
  // 泥土上那个五角星（淡淡的，像是刚画上去）
  ctx.strokeStyle = "rgba(230,230,230," + (0.30 + 0.10 * Math.sin(t * 0.8)).toFixed(3) + ")";
  ctx.lineWidth = 1.2;
  const R = T * 0.40;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * 4 * Math.PI * 2) / 10;
    const x = Math.cos(a) * R, y = Math.sin(a) * R * 0.85;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath(); ctx.stroke();
};

// 公馆里扭曲受损的家具 —— 碰上去肢体会被扭断
window.PROP_DRAW["twistfurn11"] = function (ctx, p, T) {
  const sd = ((p.x * 13 + p.y * 7) % 4);
  ctx.save();
  ctx.translate(0, T * 0.04);
  ctx.fillStyle = "rgba(0,0,0,0.30)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.30, T * 0.34, T * 0.08, 0, 0, Math.PI * 2); ctx.fill();
  if (sd === 0) {                                  // 扭掉的椅子
    ctx.strokeStyle = "#4a463f"; ctx.lineWidth = T * 0.07;
    ctx.beginPath(); ctx.moveTo(-T * 0.18, T * 0.26); ctx.lineTo(T * 0.10, -T * 0.02); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(T * 0.22, T * 0.24); ctx.lineTo(-T * 0.06, T * 0.06); ctx.stroke();
    ctx.fillStyle = "#5c5850";
    ctx.fillRect(-T * 0.28, -T * 0.10, T * 0.42, T * 0.09);
  } else if (sd === 1) {                           // 裂开的柜子
    ctx.fillStyle = "#554f46"; ctx.fillRect(-T * 0.24, -T * 0.26, T * 0.46, T * 0.52);
    ctx.fillStyle = "#403b34"; ctx.fillRect(-T * 0.24, -T * 0.26, T * 0.20, T * 0.52);
    ctx.strokeStyle = "#2c2822"; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(T * 0.02, -T * 0.26); ctx.lineTo(-T * 0.06, T * 0.26); ctx.stroke();
  } else if (sd === 2) {                           // 塌了的桌子
    ctx.fillStyle = "#5a544a";
    ctx.beginPath();
    ctx.moveTo(-T * 0.34, -T * 0.06); ctx.lineTo(T * 0.34, -T * 0.14);
    ctx.lineTo(T * 0.28, T * 0.06); ctx.lineTo(-T * 0.30, T * 0.12);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#38342e"; ctx.lineWidth = T * 0.05;
    ctx.beginPath(); ctx.moveTo(-T * 0.22, T * 0.10); ctx.lineTo(-T * 0.26, T * 0.30); ctx.stroke();
  } else {                                         // 歪掉的落地灯
    ctx.strokeStyle = "#4a4640"; ctx.lineWidth = T * 0.05;
    ctx.beginPath(); ctx.moveTo(0, T * 0.30); ctx.lineTo(T * 0.10, -T * 0.10); ctx.stroke();
    ctx.fillStyle = "#6a655c";
    ctx.beginPath(); ctx.moveTo(-T * 0.16, -T * 0.10); ctx.lineTo(T * 0.28, -T * 0.20);
    ctx.lineTo(T * 0.24, -T * 0.34); ctx.lineTo(-T * 0.12, -T * 0.26); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
};

// 房主：浅顶软呢帽 + 西服 + 公文包。它会慢慢靠近你。
window.PROP_DRAW["host11"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : 0) / 1000;
  const sway = Math.sin(t * 0.9) * T * 0.02;
  ctx.save(); ctx.translate(sway, 0);
  ctx.fillStyle = "rgba(0,0,0,0.34)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.40, T * 0.22, T * 0.07, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#2a2a2e";                                    // 西服
  ctx.beginPath(); ctx.ellipse(0, T * 0.08, T * 0.17, T * 0.26, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#d8d4cc";                                    // 衬衫
  ctx.beginPath(); ctx.moveTo(-T * 0.06, -T * 0.10); ctx.lineTo(T * 0.06, -T * 0.10);
  ctx.lineTo(0, T * 0.16); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#8a1f1f";                                    // 领带
  ctx.fillRect(-T * 0.02, -T * 0.08, T * 0.04, T * 0.18);
  ctx.fillStyle = "#c8c2b4";                                    // 头
  ctx.beginPath(); ctx.arc(0, -T * 0.22, T * 0.11, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#22222a";                                    // 浅顶软呢帽
  ctx.beginPath(); ctx.ellipse(0, -T * 0.29, T * 0.20, T * 0.05, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(-T * 0.10, -T * 0.42, T * 0.20, T * 0.13);
  // 公文包
  ctx.fillStyle = "#3a2c1e"; ctx.fillRect(T * 0.16, T * 0.14, T * 0.18, T * 0.14);
  ctx.strokeStyle = "#201810"; ctx.lineWidth = 1.4; ctx.strokeRect(T * 0.16, T * 0.14, T * 0.18, T * 0.14);
  ctx.restore();
};

// 破坏掉的门：射杀房主之后从这里到贰二层
window.PROP_DRAW["brokenDoor11"] = function (ctx, p, T) {
  ctx.fillStyle = "#2c2822"; ctx.fillRect(-T * 0.40, -T * 0.44, T * 0.80, T * 0.88);
  ctx.fillStyle = "#15120e";                                    // 门被砸开的洞
  ctx.beginPath();
  ctx.moveTo(-T * 0.10, -T * 0.40); ctx.lineTo(T * 0.30, -T * 0.28);
  ctx.lineTo(T * 0.22, T * 0.42); ctx.lineTo(-T * 0.24, T * 0.34);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "#6a6258"; ctx.lineWidth = 2;
  ctx.strokeRect(-T * 0.40, -T * 0.44, T * 0.80, T * 0.88);
  ctx.fillStyle = "#8a8074";                                    // 掉在地上的碎木
  ctx.fillRect(-T * 0.44, T * 0.34, T * 0.30, T * 0.05);
  ctx.fillRect(T * 0.14, T * 0.36, T * 0.22, T * 0.04);
};

// 贰二层：覆着雪的长枝，雪花一直在飘
window.PROP_DRAW["snowtree22"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : 0) / 1000;
  ctx.fillStyle = "rgba(0,0,0,0.16)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.34, T * 0.20, T * 0.06, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#5c5c58"; ctx.lineWidth = T * 0.09;
  ctx.beginPath(); ctx.moveTo(0, T * 0.32); ctx.lineTo(0, -T * 0.06); ctx.stroke();
  // 三层压着雪的枝
  for (let i = 0; i < 3; i++) {
    const yy = -T * 0.04 - i * T * 0.14, ww = T * (0.34 - i * 0.08);
    ctx.fillStyle = "#6e6e68";
    ctx.beginPath(); ctx.moveTo(-ww, yy); ctx.lineTo(ww, yy - T * 0.04); ctx.lineTo(0, yy - T * 0.16); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#f0f2f4";                                  // 枝上的积雪
    ctx.beginPath(); ctx.moveTo(-ww, yy); ctx.lineTo(ww, yy - T * 0.04); ctx.lineTo(ww * 0.7, yy - T * 0.06); ctx.lineTo(-ww * 0.7, yy - T * 0.03); ctx.closePath(); ctx.fill();
  }
  // 飘下来的雪
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  for (let i = 0; i < 2; i++) {
    const ph = (t * 0.5 + i * 0.5 + (p.x * 0.3 + p.y * 0.7)) % 1;
    ctx.beginPath(); ctx.arc(Math.sin(t + i * 2 + p.x) * T * 0.18, T * 0.36 - ph * T * 0.6, 1.4, 0, Math.PI * 2); ctx.fill();
  }
};

// 堕落天使：巨大的黑翼、蓝袍、身上有枪伤和缺失的肢体
window.PROP_DRAW["fallenangel22"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : 0) / 1000;
  const flap = Math.sin(t * 0.7) * T * 0.03;
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.40, T * 0.26, T * 0.07, 0, 0, Math.PI * 2); ctx.fill();
  // 黑翼
  ctx.fillStyle = "#1e1e22";
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(s * T * 0.10, -T * 0.06);
    ctx.quadraticCurveTo(s * T * 0.46, -T * 0.30 + flap, s * T * 0.40, T * 0.16);
    ctx.quadraticCurveTo(s * T * 0.22, -T * 0.02, s * T * 0.10, T * 0.04);
    ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = "#3a4a68";                                    // 蓝袍
  ctx.beginPath(); ctx.ellipse(0, T * 0.10, T * 0.14, T * 0.24, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#c8c2b4";                                    // 头
  ctx.beginPath(); ctx.arc(0, -T * 0.20, T * 0.09, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#1a1a1e"; ctx.lineWidth = 2;               // 黑角
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(s * T * 0.05, -T * 0.27);
    ctx.quadraticCurveTo(s * T * 0.14, -T * 0.38, s * T * 0.09, -T * 0.42); ctx.stroke();
  }
  ctx.fillStyle = "#8a1f1f";                                    // 身上的枪伤
  ctx.beginPath(); ctx.arc(-T * 0.04, T * 0.06, T * 0.025, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(T * 0.05, T * 0.16, T * 0.022, 0, Math.PI * 2); ctx.fill();
};

// 入口棚屋处的钟：夜里会发光，直到时针指向十二点
window.PROP_DRAW["clock00"] = function (ctx, p, T) {
  const r = T * 0.24;
  ctx.fillStyle = "#5a5a5a"; ctx.fillRect(-2, r, 4, T * 0.30);
  ctx.fillStyle = "#d0d0d0";
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#3a3a3a"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = "#2a2a2a"; ctx.lineWidth = 2;                   // 时针指十二点
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -r * 0.60); ctx.stroke();
  ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(r * 0.42, r * 0.24); ctx.stroke();
  ctx.fillStyle = "#2a2a2a";
  ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI * 2); ctx.fill();
};
