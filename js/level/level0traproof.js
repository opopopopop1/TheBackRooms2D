// ===========================================================
// Level 0.4 —— 深坑区
// Level 0 里那扇"通往 Level 1 上层"的白色铁门，现在换成了一扇普通木门；
// 推开它，后面不是 Level 1，而是这间网状的天罗地网。
//
// 布局：一张方格网 —— 能站人的只有那些细长的"网格线"，
//       被线围出来的每一个方块都是空的（画成纯黑）。
//       唯独底部正中那一个方块是实心的，白色铁门立在它中央 —— 通往 Level 1 上层。
// 掉下去：整个人都踏进黑色里才会掉（脚尖沾到一点不算），掉下去 -> 红室。
// ===========================================================
"use strict";

function generateTrapRoomMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);            // 先全部是墙

  const N = 8;                            // 纵向网格线的条数
  const CELL = 4;                         // 被线围出来的方块边长（格）—— 4x4
  const STEP = CELL + 1;                  // 一条线 + 一个方块 = 一个周期

  // 横向的"线"只有 N-1 条（每条盖在一排方块上方）—— 最底下不再补一条横线，
  // 这样最下面一排方块的底边就直接抵着墙，白色铁门可以真正"贴着墙"立着。
  const W = (N - 1) * STEP + 1;           // 网的宽（含最后那条竖线）
  const H = (N - 2) * STEP + 1 + CELL;    // 网的高（最下面一排方块的底边就是最后一行）
  const m0x = Math.floor((size - W) / 2);
  const m0y = Math.floor((size - H) / 2);

  const vl = [];                          // 竖线（整列都能走）
  for (let c = 0; c < N; c++) vl.push(m0x + c * STEP);
  const hl = [];                          // 横线（整行都能走）
  for (let r = 0; r < N - 1; r++) hl.push(m0y + r * STEP);

  // 整张网是一整片地板，只有外围是墙
  carveRoom(grid, size, m0x, m0y, W, H);

  // 挖在地板上的方块：每一块都是空的（画成纯黑），排成一张网。
  // 格子仍然是"可走"的 —— 走不进去就永远掉不下去。
  const holes = new Set();
  const blocks = [];
  for (let r = 0; r < N - 1; r++) {
    for (let c = 0; c < N - 1; c++) {
      const x0 = vl[c] + 1, y0 = hl[r] + 1;
      blocks.push({ x0, y0, r, c });
      for (let y = y0; y < y0 + CELL; y++)
        for (let x = x0; x < x0 + CELL; x++) { grid[y][x] = 0; holes.add(x + "," + y); }
    }
  }

  // 底部正中那个方块：填实（图片里那块棕红的）—— 玩家站上去才能够到铁门
  const gc = (N - 1) >> 1, gr = N - 2;    // 最下面一排、正中那一列
  const gb = blocks.find((b) => b.r === gr && b.c === gc) || blocks[blocks.length - 1];
  for (let y = gb.y0; y < gb.y0 + CELL; y++)
    for (let x = gb.x0; x < gb.x0 + CELL; x++) holes.delete(x + "," + y);
  // 门画成 2 格宽，落在方块正中：x 取左半格，宽度 2T 后中心正好是方块中心
  const dx = gb.x0 + 1;
  // 门立在方块**底下那格墙**上（y = 网的最下面一行 + 1），这样它是真的贴着墙，
  // 而不是孤零零杵在方块中间。
  const dy = m0y + H;

  // 出生点：网的最上沿，正中那条通道上（从木门进来就站在这儿）
  const start = { x: vl[gc] + 1, y: m0y, floor: 0 };

  const floors = collectFloors(grid, size);
  const props = [{ x: dx, y: dy, floor: 0, type: "irondoor04" }];

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [],
    trapHoles: holes,                 // 踩空判定：整个人都在里面才算
    trapCell: CELL,                   // 供渲染画网格用
    trapIron: { x: dx, y: dy },
  };
  map.spawnPts = [start];
  return map;
}

// 玩家是不是"整个人都踏进了黑色里"。
// 取玩家圆的 8 个极点，全部落在空洞格上才算掉下去 —— 脚尖沾到一点不算。
function trapRoomFalling(g) {
  const m = g.map;
  if (!m || !m.trapHoles) return false;
  const R = (g.player.r || 12);
  const px = g.player.x, py = g.player.y;
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI * 2 * i) / 8;
    const tx = Math.floor((px + Math.cos(a) * R) / TILE);
    const ty = Math.floor((py + Math.sin(a) * R) / TILE);
    if (!m.trapHoles.has(tx + "," + ty)) return false;
  }
  return true;
}

window.PROP_DRAW = window.PROP_DRAW || {};

// 白色铁门：Level 0.4 唯一通往 Level 1 上层的东西
window.PROP_DRAW["irondoor04"] = function (ctx, p, T) {
  // 这扇门立在整张网最下面、正对着玩家进来的方向 —— 是这一层唯一看得见的目标。
  // 画成两格宽 + 常亮轮廓，免得混在网格线里找不着。
  const w = T * 1.9, h = T * 1.45;
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  const pulse = 0.45 + 0.35 * Math.sin(t * 2.2);
  ctx.save();
  ctx.shadowColor = "rgba(228,240,255," + pulse.toFixed(3) + ")";
  ctx.shadowBlur = 22;
  ctx.fillStyle = "rgba(0,0,0,0.30)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.34, w * 0.52, T * 0.08, 0, 0, Math.PI * 2); ctx.fill();
  // 门框
  ctx.fillStyle = "#8f969d"; ctx.fillRect(-w / 2 - 3, -h / 2 - 3, w + 6, h + 6);
  // 门板：白铁皮
  const grd = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
  grd.addColorStop(0, "#c3cad0"); grd.addColorStop(0.5, "#e6ebef"); grd.addColorStop(1, "#aeb6bd");
  ctx.fillStyle = grd; ctx.fillRect(-w / 2, -h / 2, w, h);
  // 铆钉
  ctx.fillStyle = "#7d858c";
  for (let i = 0; i < 4; i++) {
    ctx.beginPath(); ctx.arc(-w / 2 + 5, -h / 2 + 6 + i * (h - 12) / 3, 1.7, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(w / 2 - 5, -h / 2 + 6 + i * (h - 12) / 3, 1.7, 0, Math.PI * 2); ctx.fill();
  }
  // 上下两道压筋
  ctx.strokeStyle = "rgba(90,98,106,0.55)"; ctx.lineWidth = 1.4;
  ctx.strokeRect(-w / 2 + 5, -h / 2 + 5, w - 10, h * 0.36);
  ctx.strokeRect(-w / 2 + 5, -h * 0.04, w - 10, h * 0.40);
  // 门把手
  ctx.fillStyle = "#d8dde2";
  ctx.beginPath(); ctx.arc(w * 0.24, 0, T * 0.055, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#5a6268"; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.strokeStyle = "#4a5258"; ctx.lineWidth = 2; ctx.strokeRect(-w / 2, -h / 2, w, h);
  // 门牌：L1
  ctx.fillStyle = "#2a2e32"; ctx.fillRect(-w * 0.30, -h / 2 - T * 0.20, w * 0.60, T * 0.16);
  ctx.fillStyle = "#e8ecf0";
  ctx.font = "bold " + (T * 0.13).toFixed(1) + "px monospace";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("L1", 0, -h / 2 - T * 0.12);
  ctx.restore();
};

// ---------- 地面 / 墙体 ----------
const TRAPTILE = {
  // 深坑区 = Level 0 的一部分：脚下就是那张潮湿的黄地毯，墙就是那面黄墙纸。
  // 颜色与 main.js 的 drawCarpetFloor / drawWallpaperWall 保持一致，
  // 玩家从 Level 0 走进来，脚下的东西不应该换材质。
  trapnet: ["#97853f", "#97853f", "#d9c95e"],   // [地面, 地面, 墙]
  // 红室：地毯是腥红的（亮），墙纸要明显更暗 —— 以前两者都写成 #8a3x2x，
  // 亮度几乎一样，玩家根本分不清哪是墙哪是地。
  redroom: ["#a84230", "#8f3424", "#4a1a14"],
};

function trapTile(style) { return TRAPTILE[style] || null; }

// 地面：能站人的"网格线"就是 Level 0 那张黄地毯；被线围出来的方块是纯黑的深坑
function drawTrapFloor(ctx, px, py, h, style, map, tx, ty) {
  // h 是哈希扰动（0~1），不是格子边长 —— 边长一律用 S
  const S = (typeof TILE === "number" ? TILE : 40);
  const k = tx + "," + ty;
  if (style === "trapnet") {
    if (map.trapHoles && map.trapHoles.has(k)) {
      // 空洞：底下什么都没有
      ctx.fillStyle = "#07070a"; ctx.fillRect(px, py, S, S);
      // 靠近边缘的一圈渐变，看得出是个"口子"而不是贴图
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(px, py, S, 3); ctx.fillRect(px, py + S - 3, S, 3);
      ctx.fillRect(px, py, 3, S); ctx.fillRect(px + S - 3, py, 3, S);
      return true;
    }
    // ===================================================================
    // 能站人的"网格线"：就是 Level 0 那张潮湿的黄地毯，一模一样。
    // 深坑区是 Level 0 的一部分 —— 脚下踩的当然还是那层地毯，
    // 被线围出来的方块才是空的。下面这段与 main.js 的 drawCarpetFloor
    // 逐行一致（同一个哈希、同一套脏点），保证两块地面看不出区别。
    // ===================================================================
    // h 由调用方传进来（与 drawCarpetFloor 拿到的是同一个哈希值），直接用。
    ctx.fillStyle = "#97853f";
    ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(0,0,0,0.08)";
    ctx.fillRect(px + (h * 37) % 34, py + (h * 53) % 34, 3, 3);
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fillRect(px + (h * 71) % 30, py + (h * 13) % 30, 2, 2);
    if ((tx + ty) % 2 === 0) {
      ctx.fillStyle = "rgba(0,0,0,0.06)";
      ctx.fillRect(px, py + S - 3, S, 1);
    }
    // 地毯到了洞口边上就该断掉 —— 边缘压一点暗，看得出这是个口子、
    // 而不是地毯上的一块黑斑。只压边上 2px，不碰中间的地毯色。
    if (map.trapHoles && (map.trapHoles.has((tx - 1) + "," + ty) || map.trapHoles.has((tx + 1) + "," + ty))) {
      ctx.fillStyle = "rgba(0,0,0,0.28)";
      ctx.fillRect(px, py, 2, S); ctx.fillRect(px + S - 2, py, 2, S);
    }
    if (map.trapHoles && (map.trapHoles.has(tx + "," + (ty - 1)) || map.trapHoles.has(tx + "," + (ty + 1)))) {
      ctx.fillStyle = "rgba(0,0,0,0.28)";
      ctx.fillRect(px, py, S, 2); ctx.fillRect(px, py + S - 2, S, 2);
    }
    return true;
  }
  if (style === "redroom") {
    const n = hash2(tx, ty);
    ctx.fillStyle = n > 0.5 ? "#a84230" : "#933425";       // 腥红的地毯（亮）
    ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(255,120,90,0.18)";
    ctx.fillRect(px, py + S * 0.3, S, 2);                   // 粗制、黏脚的纹理
    ctx.fillStyle = "rgba(20,4,4," + (0.10 + n * 0.14).toFixed(3) + ")";
    ctx.fillRect(px, py, S, S);
    // 霉斑菌落
    if (n > 0.82) {
      ctx.fillStyle = "rgba(90,110,70,0.42)";
      ctx.beginPath(); ctx.arc(px + 10 + n * 18, py + 12 + hash2(ty, tx) * 16, 3.5, 0, Math.PI * 2); ctx.fill();
    }
    return true;
  }
  return false;
}

function drawTrapWall(ctx, px, py, h, style) {
  const c = TRAPTILE[style];
  if (!c) return false;
  const S = (typeof TILE === "number" ? TILE : 40);
  if (style === "trapnet") {
    // 墙也是 Level 0 那面黄色墙纸（与 main.js 的 drawWallpaperWall 一致）
    ctx.fillStyle = "#d9c95e"; ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(0,0,0,0.10)"; ctx.fillRect(px + S - 2, py, 2, S);   // 接缝
    ctx.fillStyle = "rgba(255,255,255,0.08)"; ctx.fillRect(px, py, S, 2);
    ctx.fillStyle = "rgba(0,0,0,0.18)"; ctx.fillRect(px, py + S - 8, S, 8);   // 假高度阴影
    if (h > 0.6) {
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.fillRect(px + 6 + (h * 20) % 24, py + 6 + (h * 31) % 24, 4, 4);
    }
    return true;
  }
  // 红室：墙纸要比地毯暗一大截 —— 再压一条亮的上沿，一眼分得清墙和地
  ctx.fillStyle = "#4a1a14"; ctx.fillRect(px, py, S, S);
  ctx.fillStyle = "rgba(190,70,52,0.30)"; ctx.fillRect(px, py, S, Math.max(3, S * 0.16));
  ctx.fillStyle = "rgba(20,4,4,0.45)"; ctx.fillRect(px, py + S - 8, S, 8);
  ctx.strokeStyle = "rgba(210,80,60,0.22)"; ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.moveTo(px + 4 + i * 12, py + 2); ctx.lineTo(px + 4 + i * 12, py + S - 2); ctx.stroke();
  }
  ctx.strokeStyle = "rgba(0,0,0,0.40)"; ctx.lineWidth = 1;
  ctx.strokeRect(px + 0.5, py + 0.5, S - 1, S - 1);
  return true;
}

if (typeof window !== "undefined") {
  window.drawTrapFloor = drawTrapFloor;
  window.drawTrapWall = drawTrapWall;
  window.trapTile = trapTile;
}
