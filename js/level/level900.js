// ===========================================================
// Level 900 —— 休息区
// 一个极大但有界的床垫商店。宽度和普通床垫店差不多，长度约 800 公里。
// 无论从哪个入口进来，你都会出现在正中心 —— 走到任一出口要花 3 天的步行时间。
// 越靠近边缘，床垫 / 床上用品 / 枕头 / 小夜灯 / 捕梦网越少，且床垫越来越破。
// 实体：塔克 —— 7 英尺高的有角绵羊-山羊杂交动物，穿着薰衣草浴袍，
//       眼睛没有瞳孔，会发出小夜灯般的柔光，负责吟唱摇篮曲。
// ===========================================================
"use strict";

function generateMattressMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const props = [];

  const cy = Math.floor(size / 2);
  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return;
    if (grid[y][x] !== 0) return;
    props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  };

  // ============ 室外：左侧一条城市街道 ============
  // 商店最左边那扇门出去就是这里 —— 听得见早高峰的车流，却一个人也没有。
  // 街是竖着的：两侧人行道，中间是马路，咖啡车停在人行道边上。
  const STX0 = 2, STX1 = 11;                 // 街的横向范围
  const RD0 = 5, RD1 = 8;                    // 马路
  for (let y = 3; y <= size - 4; y++)
    for (let x = STX0; x <= STX1; x++) grid[y][x] = 0;
  // 马路牙子：人行道和马路之间压一条边（画的时候用，这里只标出来）
  const curbs = new Set();
  for (let y = 3; y <= size - 4; y++) { curbs.add((RD0 - 1) + "," + y); curbs.add((RD1 + 1) + "," + y); }

  // ============ 商店：右侧一整间展示区 ============
  const SHX0 = STX1 + 3;                     // 商店左墙内侧
  const SHX1 = size - 3;                     // 商店右墙内侧
  const SHY0 = 3, SHY1 = size - 4;
  for (let y = SHY0; y <= SHY1; y++)
    for (let x = SHX0; x <= SHX1; x++) grid[y][x] = 0;

  // 门洞：商店最左边那一扇（走出去就是街）
  const DOORX = STX1 + 1;
  for (let x = DOORX; x <= SHX0; x++) grid[cy][x] = 0;
  grid[cy][STX1 + 2] = 0;

  // 主通道：横贯商店正中，宽 3 格
  const aisles = new Set();
  for (let x = SHX0; x <= SHX1; x++)
    for (let w = -1; w <= 1; w++) aisles.add(x + "," + (cy + w));

  // ---- 展示区：主通道上方并排的三间展厅，一间只放一种床 ----
  // 床不是满地乱撒的 —— 只有这三间里有，下半层和通道上一张都没有。
  const HALL_Y0 = SHY0, HALL_Y1 = cy - 3;             // 展厅的纵向范围
  const HALLS = [];
  const bandW = Math.floor((SHX1 - SHX0 + 1) / 3);
  for (let i = 0; i < 3; i++) {
    const x0 = SHX0 + i * bandW + (i > 0 ? 1 : 0);
    const x1 = (i === 2) ? SHX1 : SHX0 + (i + 1) * bandW - 1;
    HALLS.push({
      x0, x1,
      type: ["bed900_double", "bed900_single", "bed900_bunk"][i],
      doorX: Math.floor((x0 + x1) / 2),
    });
  }
  // 展厅之间砌墙 —— 每间是独立的房间；朝主通道那面只在门口开一个洞
  for (let i = 0; i < 3; i++) {
    const h = HALLS[i];
    if (i > 0) {
      const wx = h.x0 - 1;
      for (let y = HALL_Y0; y <= HALL_Y1; y++) grid[y][wx] = 1;
    }
    for (let x = h.x0; x <= h.x1; x++)
      grid[HALL_Y1 + 1][x] = (Math.abs(x - h.doorX) <= 1 ? 0 : 1);
  }

  const cx = (SHX0 + SHX1) / 2;
  const halfW = Math.max(1, (SHX1 - SHX0) / 2);
  const used = new Set();                    // 床占掉的格子，别再放别的东西

  const fits = (x, y, bw, bh) => {
    for (let j = 0; j < bh; j++) {
      for (let i = 0; i < bw; i++) {
        const xx = x + i, yy = y + j;
        if (grid[yy] == null || grid[yy][xx] !== 0) return false;
        if (used.has(xx + "," + yy)) return false;
      }
    }
    return true;
  };
  const occupy = (x, y, bw, bh) => {
    for (let j = 0; j < bh; j++) for (let i = 0; i < bw; i++) used.add((x + i) + "," + (y + j));
  };

  const BED_SHAPE = {
    bed900_double: { bw: 2, bh: 2 },     // 双人床：2×2
    bed900_single: { bw: 2, bh: 1 },     // 单人床：2×1
    bed900_bunk: { bw: 1, bh: 2 },       // 双层床：1×2
  };

  for (const hall of HALLS) {
    const sh = BED_SHAPE[hall.type];
    const stepX = sh.bw + 2, stepY = sh.bh + 2;        // 床与床之间留出走过的道
    for (let y = HALL_Y0; y <= HALL_Y1 - sh.bh; y += stepY) {
      for (let x = hall.x0; x <= hall.x1 - sh.bw + 1; x += stepX) {
        const dist = Math.abs(x + sh.bw / 2 - cx) / halfW;      // 0 = 正中，1 = 边缘
        if (Math.random() > (0.82 - dist * 0.40)) continue;      // 越靠边越稀
        if (!fits(x, y, sh.bw, sh.bh)) continue;
        occupy(x, y, sh.bw, sh.bh);
        const worn = dist > 0.62;
        const hasBedding = !worn && dist < 0.55;
        props.push({
          x, y, floor: 0, type: hall.type,
          bw: sh.bw, bh: sh.bh, worn, hasBedding,
        });
      }
    }
  }

  const floors = collectFloors(grid, size);
  const start = { x: Math.round(cx), y: cy, floor: 0 };   // 不管从哪进来，都落在商店正中

  // 下半层不是展示区 —— 只有货架和收银台，一张床都没有
  for (let y = cy + 4; y <= SHY1 - 1; y += 5) {
    for (let x = SHX0 + 3; x < SHX1 - 2; x += 9) put(x, y, "shelf900");
  }
  put(SHX0 + 4, cy + 3, "counter900");

  // 捕梦网：挂在商店的墙面上（不是地上随便撒）
  for (let x = SHX0 + 1; x < SHX1; x += 3) {
    put(x, SHY0, "dreamcatcher");
    put(x, SHY1, "dreamcatcher");
  }
  // 小夜灯：沿主通道两侧
  for (let x = SHX0 + 2; x < SHX1; x += 5) {
    put(x, cy - 2, "nightlight");
    put(x, cy + 2, "nightlight");
  }
  // 床头柜：挨着双人床那一段
  for (const p of props) {
    if (p.type !== "bed900_double") continue;
    if (Math.random() < 0.5) continue;
    put(p.x + p.bw, p.y, "nightstand900", { worn: p.worn });
  }
  // 塔克：整个层级只有几只，只在商店里
  for (let i = 0; i < 3; i++) {
    const t = floors[randInt(0, floors.length - 1)];
    if (t && t.x >= SHX0) put(t.x, t.y, "tucker900");
  }

  // ============ 门 ============
  // 最左边那扇：走进去就是室外的街（同一层，不换层级）
  props.push({ x: DOORX, y: cy, floor: 0, type: "frontdoor900", toOutdoor: true,
    tip: "商店最左边的门 —— 推开就是外面的街" });
  // 后门：商店另一头，通向一个安静的封闭区域 -> Level 11
  put(SHX1 - 1, cy, "backdoor900", { toLevel: 11 });

  // 咖啡车：停在室外那条街的人行道上
  const cartX = STX0 + 1, cartY = cy - 2;
  if (grid[cartY] && grid[cartY][cartX] === 0) props.push({ x: cartX, y: cartY, floor: 0, type: "coffeecart900" });
  else put(cartX, cy, "coffeecart900");

  // 街边那些进不去的楼：门脸贴着人行道，但打不开
  for (let y = 4; y < size - 4; y += 4) {
    put(STX1, y, "facade900");
    put(STX0, y + 2, "facade900");
  }

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [],
    curbs, outdoor: { x0: STX0, x1: STX1, road0: RD0, road1: RD1 },
    shop: { x0: SHX0, x1: SHX1, y0: SHY0, y1: SHY1 },
  };
  map.coffeeCart = (props.find((p) => p.type === "coffeecart900") || null);
  map.spawnPts = [start];
  return map;
}

window.PROP_DRAW = window.PROP_DRAW || {};

// ---------- 展示区里的三种床 ----------
// 每种床占一整个区域，尺寸也各不相同（都不是一格）。
// p.bw / p.bh 是它占的格数，画的时候先把原点挪到这块地的中心再铺开。
function bedPalette(p) {
  return p.worn
    ? { m: "#a89c88", edge: "#8a7e6a", line: "#7a6e5a", sheet: null }
    : { m: "#e0d8c4", edge: "#c0b8a4", line: "#b0a894", sheet: "#f0ece0" };
}
function bedShadow(ctx, w, d) {
  ctx.fillStyle = "rgba(0,0,0,0.30)";
  ctx.beginPath(); ctx.ellipse(0, d * 0.5 + 3, w * 0.48, Math.max(3, d * 0.10), 0, 0, Math.PI * 2); ctx.fill();
}

// 双人床 2×2：床垫 + 床架 + 床头板 + 两个枕头
window.PROP_DRAW["bed900_double"] = function (ctx, p, T) {
  const bw = p.bw || 2, bh = p.bh || 2;
  const c = bedPalette(p);
  const w = bw * T * 0.92, d = bh * T * 0.82;
  ctx.save(); ctx.translate(((bw - 1) / 2) * T, ((bh - 1) / 2) * T);
  bedShadow(ctx, w, d);
  // 床头板
  ctx.fillStyle = p.worn ? "#6e5c44" : "#8a6a48";
  ctx.fillRect(-w / 2 - 2, -d / 2 - T * 0.16, w + 4, T * 0.20);
  // 床架
  ctx.fillStyle = p.worn ? "#5e5040" : "#7c6042";
  ctx.fillRect(-w / 2 - 1, -d / 2, w + 2, d);
  // 床垫
  ctx.fillStyle = c.m;
  ctx.fillRect(-w / 2, -d / 2 + 2, w, d - 4);
  ctx.fillStyle = c.edge;
  for (let i = 1; i < 3; i++) ctx.fillRect(-w / 2 + i * w / 3 - 1, -d / 2 + 2, 2, d - 4);
  ctx.strokeStyle = c.line; ctx.lineWidth = 2;
  ctx.strokeRect(-w / 2, -d / 2 + 2, w, d - 4);
  if (p.hasBedding) {
    ctx.fillStyle = c.sheet; ctx.fillRect(-w / 2 + 2, -d / 2 + 3, w - 4, d * 0.34);
    ctx.fillStyle = "#dcd6c4";
    ctx.fillRect(-w / 2 + 4, -d / 2 + 4, w * 0.26, d * 0.26);
    ctx.fillRect(w / 2 - 4 - w * 0.26, -d / 2 + 4, w * 0.26, d * 0.26);
  } else if (p.worn) {
    ctx.fillStyle = "rgba(90,70,50,0.30)";
    ctx.beginPath(); ctx.ellipse(w * 0.12, d * 0.06, w * 0.13, d * 0.12, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
};

// 单人床 2×1：一张窄床垫 + 一个枕头
window.PROP_DRAW["bed900_single"] = function (ctx, p, T) {
  const bw = p.bw || 2, bh = p.bh || 1;
  const c = bedPalette(p);
  const w = bw * T * 0.92, d = Math.max(T * 0.62, bh * T * 0.78);
  ctx.save(); ctx.translate(((bw - 1) / 2) * T, ((bh - 1) / 2) * T);
  bedShadow(ctx, w, d);
  ctx.fillStyle = p.worn ? "#5e5040" : "#7c6042";
  ctx.fillRect(-w / 2 - 1, -d / 2, w + 2, d);
  ctx.fillStyle = c.m;
  ctx.fillRect(-w / 2, -d / 2 + 2, w, d - 4);
  ctx.fillStyle = c.edge;
  for (let i = 1; i < 2; i++) ctx.fillRect(-w / 2 + i * w / 2 - 1, -d / 2 + 2, 2, d - 4);
  ctx.strokeStyle = c.line; ctx.lineWidth = 2;
  ctx.strokeRect(-w / 2, -d / 2 + 2, w, d - 4);
  // 枕头（床头那一侧）
  if (p.hasBedding) {
    ctx.fillStyle = c.sheet;
    ctx.fillRect(-w / 2 + 3, -d / 2 + 3, w * 0.30, d - 8);
  } else if (p.worn) {
    ctx.fillStyle = "rgba(90,70,50,0.28)";
    ctx.beginPath(); ctx.ellipse(w * 0.10, 0, w * 0.12, d * 0.22, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
};

// 双层床 1×2：上下两张铺 + 一把爬上去的梯子
window.PROP_DRAW["bed900_bunk"] = function (ctx, p, T) {
  const bw = p.bw || 1, bh = p.bh || 2;
  const c = bedPalette(p);
  const w = Math.max(T * 0.66, bw * T * 0.80), d = bh * T * 0.88;
  ctx.save(); ctx.translate(((bw - 1) / 2) * T, ((bh - 1) / 2) * T);
  bedShadow(ctx, w, d);
  // 四根立柱
  ctx.fillStyle = p.worn ? "#5a4c3c" : "#786048";
  for (const sx of [-1, 1]) ctx.fillRect(sx * w / 2 - 2, -d / 2, 4, d);
  // 上下两张铺
  for (const oy of [-d * 0.26, d * 0.18]) {
    ctx.fillStyle = c.m; ctx.fillRect(-w / 2 + 2, oy, w - 4, d * 0.30);
    ctx.strokeStyle = c.line; ctx.lineWidth = 1.5; ctx.strokeRect(-w / 2 + 2, oy, w - 4, d * 0.30);
    if (p.hasBedding) {
      ctx.fillStyle = c.sheet;
      ctx.fillRect(-w / 2 + 4, oy + 2, (w - 8) * 0.42, d * 0.18);
    }
  }
  // 梯子
  ctx.strokeStyle = p.worn ? "#6a5a44" : "#8a7050"; ctx.lineWidth = 2;
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * w * 0.22, -d / 2 + 4); ctx.lineTo(sx * w * 0.22, d / 2 - 2); ctx.stroke(); }
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath(); ctx.moveTo(-w * 0.22, -d / 2 + 4 + i * d * 0.20); ctx.lineTo(w * 0.22, -d / 2 + 4 + i * d * 0.20); ctx.stroke();
  }
  ctx.restore();
};

// 床头柜：挨着双人床，柜面上有时摆着小夜灯
window.PROP_DRAW["nightstand900"] = function (ctx, p, T) {
  const w = T * 0.44, h = T * 0.42;
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath(); ctx.ellipse(0, h * 0.55, w * 0.55, T * 0.05, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = p.worn ? "#6a5842" : "#8a6a48";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = p.worn ? "#7e6a50" : "#a08058";
  ctx.fillRect(-w / 2 + 2, -h / 2 + 2, w - 4, h * 0.34);
  ctx.fillStyle = "#c8b890"; ctx.fillRect(-w * 0.10, -h / 2 + h * 0.38, w * 0.20, 2);
  ctx.strokeStyle = "#4e4030"; ctx.lineWidth = 1.5; ctx.strokeRect(-w / 2, -h / 2, w, h);
};

// 货架：下半层那些不卖床的地方，堆着床上用品和枕头
window.PROP_DRAW["shelf900"] = function (ctx, p, T) {
  const w = T * 1.7, h = T * 0.80;
  ctx.fillStyle = "rgba(0,0,0,0.26)";
  ctx.beginPath(); ctx.ellipse(0, h * 0.52, w * 0.46, T * 0.06, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#8a7a60"; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#a09070";
  for (let i = 0; i < 2; i++) ctx.fillRect(-w / 2 + 2, -h / 2 + 3 + i * h * 0.42, w - 4, h * 0.30);
  ctx.strokeStyle = "#5e5040"; ctx.lineWidth = 1.5; ctx.strokeRect(-w / 2, -h / 2, w, h);
  // 叠着的床品
  const cols = ["#e8e2d0", "#d8d0bc", "#efe8d8"];
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = cols[i];
    ctx.fillRect(-w / 2 + 4 + i * (w - 10) / 3, -h / 2 + 5, (w - 12) / 3 - 2, h * 0.24);
  }
  ctx.fillStyle = "#cfc6b0";                                   // 枕头
  ctx.beginPath(); ctx.ellipse(w * 0.22, h * 0.14, w * 0.13, h * 0.13, 0, 0, Math.PI * 2); ctx.fill();
};

// 收银台：没人
window.PROP_DRAW["counter900"] = function (ctx, p, T) {
  const w = T * 1.9, h = T * 0.72;
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath(); ctx.ellipse(0, h * 0.55, w * 0.46, T * 0.06, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#7a6448"; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#d8cdb8"; ctx.fillRect(-w / 2 - 2, -h / 2 - 3, w + 4, T * 0.10);
  ctx.strokeStyle = "#4e4030"; ctx.lineWidth = 1.5; ctx.strokeRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#20242c"; ctx.fillRect(-w * 0.28, -h / 2 + 4, w * 0.22, h * 0.30);   // 灭着的收银机
};

// 街边那些楼的门脸 —— 看着有门，但永远打不开
window.PROP_DRAW["facade900"] = function (ctx, p, T) {
  const w = T * 0.98, h = T * 0.96;
  ctx.fillStyle = "#4a4a52"; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#565660"; ctx.fillRect(-w / 2 + 2, -h / 2 + 2, w - 4, h * 0.55);
  // 招牌
  ctx.fillStyle = "#3a3a42"; ctx.fillRect(-w / 2 + 2, -h / 2 + 4, w - 4, T * 0.16);
  ctx.fillStyle = "#6a6a78"; ctx.font = "6px ui-monospace, monospace"; ctx.textAlign = "center";
  ctx.fillText("CLOSED", 0, -h / 2 + T * 0.13); ctx.textAlign = "left";
  // 那扇打不开的门
  ctx.fillStyle = "#2e2e36"; ctx.fillRect(-w * 0.16, h * 0.02, w * 0.32, h * 0.42);
  ctx.strokeStyle = "#22222a"; ctx.lineWidth = 1.5; ctx.strokeRect(-w * 0.16, h * 0.02, w * 0.32, h * 0.42);
  // 窗（黑着的）
  ctx.fillStyle = "#22222a";
  ctx.fillRect(-w / 2 + 3, h * 0.06, w * 0.24, h * 0.30);
  ctx.fillRect(w / 2 - 3 - w * 0.24, h * 0.06, w * 0.24, h * 0.30);
};

// 床垫：床褥的纹路 + 四角的束带；破的会有污渍、没有床品
window.PROP_DRAW["mattress900"] = function (ctx, p, T) {
  const w = T * 0.86, d = T * 0.60;
  ctx.fillStyle = "rgba(0,0,0,0.30)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.26, w * 0.5, d * 0.20, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = p.worn ? "#a89c88" : "#e0d8c4";
  ctx.fillRect(-w / 2, -d / 2, w, d);
  // 束带（把床垫分成几格）
  ctx.fillStyle = p.worn ? "#8a7e6a" : "#c0b8a4";
  for (let i = 1; i < 3; i++) ctx.fillRect(-w / 2 + i * w / 3 - 1, -d / 2, 2, d);
  // 边缘包边
  ctx.strokeStyle = p.worn ? "#7a6e5a" : "#b0a894"; ctx.lineWidth = 2;
  ctx.strokeRect(-w / 2, -d / 2, w, d);
  if (p.hasBedding) {
    ctx.fillStyle = "#f0ece0"; ctx.fillRect(-w / 2 + 2, -d / 2 + 2, w - 4, d * 0.30);   // 被子
    ctx.fillStyle = "#dcd6c4"; ctx.fillRect(-w / 2 + 4, -d / 2 + 3, w * 0.24, d * 0.24); // 枕头
  } else if (p.worn) {
    ctx.fillStyle = "rgba(90,70,50,0.32)";
    ctx.beginPath(); ctx.ellipse(w * 0.14, d * 0.10, w * 0.14, d * 0.13, 0, 0, Math.PI * 2); ctx.fill();
  }
};

// 捕梦网：圆环 + 编织的网 + 垂下的羽毛
window.PROP_DRAW["dreamcatcher"] = function (ctx, p, T) {
  const r = T * 0.26;
  ctx.strokeStyle = "#8a6a48"; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(0, -T * 0.10, r, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = "rgba(220,210,190,0.75)"; ctx.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    ctx.beginPath(); ctx.moveTo(Math.cos(a) * r, -T * 0.10 + Math.sin(a) * r);
    ctx.lineTo(Math.cos(a + 2.1) * r, -T * 0.10 + Math.sin(a + 2.1) * r); ctx.stroke();
  }
  ctx.strokeStyle = "#c8b090"; ctx.lineWidth = 1.6;                       // 垂下的三根绳
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(i * r * 0.5, -T * 0.10 + r * 0.8);
    ctx.lineTo(i * r * 0.5 + 1, T * 0.10); ctx.stroke();
    ctx.fillStyle = "#d8c8a8";                                            // 羽毛
    ctx.beginPath(); ctx.ellipse(i * r * 0.5 + 2, T * 0.16, T * 0.045, T * 0.10, i * 0.3, 0, Math.PI * 2); ctx.fill();
  }
};

// 小夜灯：暖黄的小光点
window.PROP_DRAW["nightlight"] = function (ctx, p, T) {
  ctx.fillStyle = "#d8d0c0"; ctx.fillRect(-T * 0.08, T * 0.06, T * 0.16, T * 0.10);
  const g = ctx.createRadialGradient(0, -T * 0.02, 1, 0, -T * 0.02, T * 0.26);
  g.addColorStop(0, "rgba(255,225,160,0.85)");
  g.addColorStop(1, "rgba(255,215,140,0)");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, -T * 0.02, T * 0.26, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fff0c8";
  ctx.beginPath(); ctx.arc(0, -T * 0.02, T * 0.07, 0, Math.PI * 2); ctx.fill();
};

// 塔克：7 英尺高、有角的绵羊-山羊杂交，穿薰衣草浴袍，眼睛会发光
window.PROP_DRAW["tucker900"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  const bob = Math.sin(t * 1.1) * T * 0.025;
  ctx.save(); ctx.translate(0, bob);
  ctx.fillStyle = "rgba(0,0,0,0.32)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.40, T * 0.26, T * 0.08, 0, 0, Math.PI * 2); ctx.fill();
  // 薰衣草浴袍
  ctx.fillStyle = "#b8a8d8";
  ctx.beginPath(); ctx.ellipse(0, T * 0.06, T * 0.20, T * 0.28, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#c8b8e8";
  ctx.beginPath(); ctx.ellipse(-T * 0.04, T * 0.02, T * 0.12, T * 0.22, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#e0c040";                                        // 左上绣着的黄线
  ctx.fillRect(-T * 0.16, -T * 0.06, T * 0.10, 2);
  // 头 + 角
  ctx.fillStyle = "#e0ddd4";
  ctx.beginPath(); ctx.ellipse(0, -T * 0.24, T * 0.13, T * 0.12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#a89c80"; ctx.lineWidth = 3;
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(s * T * 0.09, -T * 0.30);
    ctx.quadraticCurveTo(s * T * 0.22, -T * 0.38, s * T * 0.16, -T * 0.46);
    ctx.stroke();
  }
  // 没有瞳孔的眼睛，发着小夜灯般的柔光
  const g = ctx.createRadialGradient(-T * 0.05, -T * 0.26, 0.5, -T * 0.05, -T * 0.26, T * 0.10);
  g.addColorStop(0, "rgba(255,240,200,0.95)"); g.addColorStop(1, "rgba(255,225,160,0)");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(-T * 0.05, -T * 0.26, T * 0.10, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fff6dc";
  ctx.beginPath(); ctx.arc(-T * 0.05, -T * 0.26, T * 0.035, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(T * 0.06, -T * 0.26, T * 0.035, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
};

// 前门：走出去是一条听得见车流声却空无一人的城市街道
window.PROP_DRAW["frontdoor900"] = function (ctx, p, T) {
  const w = T * 0.90, h = T * 0.92;
  ctx.fillStyle = "#8a8a80"; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "rgba(210,225,235,0.80)";
  ctx.fillRect(-w / 2 + 3, -h / 2 + 3, w * 0.45, h - 6);
  ctx.fillRect(w * 0.05, -h / 2 + 3, w * 0.45, h - 6);
  ctx.strokeStyle = "#5a5a54"; ctx.lineWidth = 2; ctx.strokeRect(-w / 2, -h / 2, w, h);
  ctx.beginPath(); ctx.moveTo(0, -h / 2); ctx.lineTo(0, h / 2); ctx.stroke();
  ctx.fillStyle = "#40a050";
  ctx.fillRect(-w / 2, -h / 2 - T * 0.18, w, T * 0.14);
  ctx.fillStyle = "#e8f0e0"; ctx.font = "bold 7px ui-monospace, monospace"; ctx.textAlign = "center";
  ctx.fillText("EXIT", 0, -h / 2 - T * 0.08); ctx.textAlign = "left";
};

// 后门：一片安静的封闭区域 -> Level 11
window.PROP_DRAW["backdoor900"] = function (ctx, p, T) {
  const w = T * 0.80, h = T * 0.88;
  ctx.fillStyle = "#5a5a54"; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#6a6a64"; ctx.fillRect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 6);
  ctx.strokeStyle = "#3a3a36"; ctx.lineWidth = 2; ctx.strokeRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#a8a8a0";
  ctx.fillRect(-w * 0.12, 0, w * 0.24, 3);
};

// 咖啡车：正门口那辆 —— 遮阳棚、台面、咖啡机、一排杯子和糖罐。摊主不在。
window.PROP_DRAW["coffeecart900"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  // 影子
  ctx.fillStyle = "rgba(0,0,0,0.30)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.40, T * 0.46, T * 0.11, 0, 0, Math.PI * 2); ctx.fill();
  // 车身
  ctx.fillStyle = "#c8b088"; ctx.fillRect(-T * 0.44, -T * 0.06, T * 0.88, T * 0.40);
  ctx.fillStyle = "#a89070"; ctx.fillRect(-T * 0.44, T * 0.20, T * 0.88, T * 0.14);
  ctx.strokeStyle = "#7a6448"; ctx.lineWidth = 1.5; ctx.strokeRect(-T * 0.44, -T * 0.06, T * 0.88, T * 0.40);
  // 车身上的木板纹理
  ctx.strokeStyle = "rgba(120,96,64,0.35)"; ctx.lineWidth = 1;
  for (let i = 1; i < 4; i++) {
    ctx.beginPath(); ctx.moveTo(-T * 0.44, -T * 0.06 + i * T * 0.09); ctx.lineTo(T * 0.44, -T * 0.06 + i * T * 0.09); ctx.stroke();
  }
  // 轮子
  ctx.fillStyle = "#4a4048";
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.arc(s * T * 0.28, T * 0.36, T * 0.075, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#8a8090";
    ctx.beginPath(); ctx.arc(s * T * 0.28, T * 0.36, T * 0.028, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#4a4048";
  }
  // 台面
  ctx.fillStyle = "#d8cdb8"; ctx.fillRect(-T * 0.48, -T * 0.14, T * 0.96, T * 0.09);
  ctx.strokeStyle = "#9a8c74"; ctx.lineWidth = 1; ctx.strokeRect(-T * 0.48, -T * 0.14, T * 0.96, T * 0.09);
  // 咖啡机
  ctx.fillStyle = "#5a5460"; ctx.fillRect(-T * 0.34, -T * 0.40, T * 0.24, T * 0.26);
  ctx.fillStyle = "#7a7484"; ctx.fillRect(-T * 0.34, -T * 0.40, T * 0.24, T * 0.05);
  ctx.fillStyle = "#20242c"; ctx.fillRect(-T * 0.28, -T * 0.34, T * 0.12, T * 0.08);   // 显示屏
  ctx.fillStyle = "#60d070";
  ctx.fillRect(-T * 0.27, -T * 0.33, T * 0.03, T * 0.02);                              // 亮着的灯
  ctx.fillStyle = "#c0b8a8"; ctx.fillRect(-T * 0.18, -T * 0.20, T * 0.05, T * 0.08);   // 出水口
  // 一排杯子
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = "#f0ece0";
    ctx.fillRect(T * 0.02 + i * T * 0.11, -T * 0.30, T * 0.075, T * 0.10);
    ctx.fillStyle = "#6a4a2a";
    ctx.fillRect(T * 0.025 + i * T * 0.11, -T * 0.29, T * 0.065, T * 0.03);
  }
  // 三个罐子：糖 / 奶 / 奶油
  const jarCols = ["#f4f0e4", "#f0f4f8", "#f8f0dc"];
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = jarCols[i];
    ctx.fillRect(T * 0.38, -T * 0.34 + i * T * 0.11, T * 0.10, T * 0.09);
    ctx.strokeStyle = "#9a9078"; ctx.lineWidth = 1;
    ctx.strokeRect(T * 0.38, -T * 0.34 + i * T * 0.11, T * 0.10, T * 0.09);
  }
  // 遮阳棚（红白条纹，会轻轻晃）
  const sway = Math.sin(t * 0.9) * T * 0.012;
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = (i % 2 === 0) ? "#c85040" : "#f0e8dc";
    ctx.beginPath();
    ctx.moveTo(-T * 0.50 + i * T * 0.17, -T * 0.46);
    ctx.lineTo(-T * 0.50 + (i + 1) * T * 0.17, -T * 0.46);
    ctx.lineTo(-T * 0.50 + (i + 1) * T * 0.17 + sway, -T * 0.60);
    ctx.lineTo(-T * 0.50 + i * T * 0.17 + sway, -T * 0.60);
    ctx.closePath(); ctx.fill();
  }
  // 棚杆
  ctx.strokeStyle = "#8a7a5a"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-T * 0.48, -T * 0.44); ctx.lineTo(-T * 0.48, T * 0.30); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(T * 0.48, -T * 0.44); ctx.lineTo(T * 0.48, T * 0.30); ctx.stroke();
  // 招牌
  ctx.fillStyle = "#3a3228"; ctx.fillRect(-T * 0.30, -T * 0.74, T * 0.60, T * 0.13);
  ctx.fillStyle = "#e8c860"; ctx.font = "bold 7px ui-monospace, monospace"; ctx.textAlign = "center";
  ctx.fillText("COFFEE", 0, -T * 0.65); ctx.textAlign = "left";
  // 冒着的蒸汽
  ctx.fillStyle = "rgba(240,240,236,0.45)";
  for (let i = 0; i < 3; i++) {
    const ph = t * 1.3 + i * 2.1;
    const yy = -T * (0.36 + ((ph % 1) * 0.18));
    ctx.beginPath();
    ctx.arc(-T * 0.22 + Math.sin(ph) * T * 0.03, yy, T * 0.035 * (1 - (ph % 1) * 0.4), 0, Math.PI * 2);
    ctx.fill();
  }
};
