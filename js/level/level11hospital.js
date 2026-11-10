"use strict";
// ===========================================================================
// Level 11 —— 医院（城市里一栋很大的楼）
//
// 一栋 27×21 的独立建筑，比城里那些 7×7 的楼大得多，位置固定（第二次来就认得路）。
// 布局：外圈墙 + 十字主走廊 + 八个房间（病房 / 药房 / 手术室）。
// 走进去就会快速回血；药房最里面那面墙在"错乱"—— 碰上去到 Level 109。
//
// 注意：这一栋是**实心墙围出来的独立建筑**，不走城里那套 7×7 街区，
// 所以它的墙不会被 drawCityWall 画成带窗的居民楼外立面。
// ===========================================================================

window.PROP_DRAW = window.PROP_DRAW || {};

// ---------------------------------------------------------------------------
// 建造。返回：
//   hospital     —— 室内地板（用于快速回血 / 地砖绘制 / 脚步声）
//   hospitalWall —— 楼里所有的墙（外圈 + 房间隔墙）
//   glitch       —— "错乱的墙"那几格
//   nook         —— 触发点（玩家站在药房里、贴到那面墙就够得着）
// ---------------------------------------------------------------------------
function buildCityHospital(grid, size, props, road, indoors, walk) {
  const HW = 27, HH = 21;
  // 选址：城里那些 7×7 的居民楼是随机撒的，写死坐标会把其中几栋整块吞掉一半 ——
  // 剩下的半栋还挂在原来的坐标上，看着就是"医院凭空长出来、卡进了别的楼里"。
  // 所以扫一遍，挑一块和已有楼房重叠最少的地；一样空的话再偏向靠中间（好找）。
  let best = null;
  for (let ty = 3; ty <= size - HH - 7; ty += 2) {
    for (let tx = 3; tx <= size - HW - 6; tx += 2) {
      let ov = 0;
      // 医院是一栋独立的楼：既不能压在马路上，也不能挤进别的房子里。
      // 三种标记都算重叠，其中马路与室内权重最高。
      for (let y = ty; y <= ty + HH; y++) {
        for (let x = tx; x <= tx + HW; x++) {
          const k = x + "," + y;
          if (road && road.has(k)) ov += 4;
          if (indoors && indoors.has(k)) ov += 4;
          if (walk && walk.has(k)) ov += 1;
        }
      }
      const cc = Math.abs(tx - (size - HW) / 2) + Math.abs(ty - (size - HH) / 2);
      const score = ov * 1000 + cc;
      if (!best || score < best.score) best = { x: tx, y: ty, ov: ov, score: score };
    }
  }
  const x0 = best ? best.x : Math.max(3, Math.min(size - HW - 6, Math.round(size * 0.36)));
  const y0 = best ? best.y : Math.max(3, Math.min(size - HH - 7, Math.round(size * 0.24)));
  const x1 = x0 + HW - 1, y1 = y0 + HH - 1;
  const cx = x0 + 13, cy = y0 + 10;          // 十字主走廊
  if (x1 >= size - 2 || y1 >= size - 2) return null;

  const hospital = new Set(), hospitalWall = new Set(), glitch = new Set();

  // ---- 清场：这块地上原来那半栋楼的窗、门、招牌都还挂在原坐标上，
  //      不删掉就会画在医院上面 —— 一定要在建医院之前清。
  if (props && props.length) {
    for (let i = props.length - 1; i >= 0; i--) {
      const p = props[i];
      if (p.x >= x0 - 3 && p.x <= x1 + 3 && p.y >= y0 - 3 && p.y <= y1 + 3) props.splice(i, 1);
    }
  }
  // 外圈两格清成医院的院子：原来挂在这里的马路 / 人行道 / 邻楼标记一并抹掉，
  // 楼就不会"直接长在马路上"或和别的房子挤在一起。
  for (let y = y0 - 2; y <= y1 + 2; y++) {
    for (let x = x0 - 2; x <= x1 + 2; x++) {
      if (x < 0 || y < 0 || x >= size || y >= size) continue;
      if (x >= x0 && x <= x1 && y >= y0 && y <= y1) continue;
      const k = x + "," + y;
      if (road) road.delete(k);
      if (walk) walk.delete(k);
      if (indoors) indoors.delete(k);
    }
  }

  // ---- 整块先封死，再一点点挖开 ----
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) grid[y][x] = 1;
  }

  // ---- 主走廊：横的一条贯穿东西，纵的一条贯南北朝 ----
  // （纵的刻意不到最下面一行 —— 那行留给门厅和招牌）
  for (let x = x0 + 1; x <= x1 - 1; x++) grid[cy][x] = 0;
  for (let y = y0 + 1; y <= y1 - 2; y++) grid[y][cx] = 0;

  // ---- 八个房间：走廊上下各四间，每间朝走廊开一扇门 ----
  const rooms = [];
  const cols = [[x0 + 1, x0 + 5], [x0 + 7, x0 + 11], [x0 + 15, x0 + 19], [x0 + 21, x0 + 25]];
  const bands = [[y0 + 2, y0 + 8, y0 + 9], [y0 + 12, y0 + 18, y0 + 11]];
  for (let ci = 0; ci < cols.length; ci++) {
    const ra = cols[ci][0], rb = cols[ci][1];
    for (let bi = 0; bi < bands.length; bi++) {
      const ya = bands[bi][0], yb = bands[bi][1], doorY = bands[bi][2];
      for (let y = ya; y <= yb; y++) for (let x = ra; x <= rb; x++) grid[y][x] = 0;
      grid[doorY][(ra + rb) >> 1] = 0;                       // 门开在朝走廊那一面
      rooms.push({ x0: ra, y0: ya, x1: rb, y1: yb, cx: (ra + rb) >> 1, cy: (ya + yb) >> 1 });
    }
  }

  // ---- 三个入口：正南（门厅，3 格宽）+ 正东 + 正西 ----
  for (let x = x0 + 12; x <= x0 + 14; x++) { grid[y1 - 1][x] = 0; grid[y1][x] = 0; }
  grid[cy][x0] = 0; grid[cy][x1] = 0;
  // 门口那条引道：楼外的几格强制挖开，保证一定走得到
  for (let y = y1 + 1; y <= Math.min(y1 + 4, size - 2); y++) {
    for (let x = x0 + 12; x <= x0 + 14; x++) grid[y][x] = 0;
  }
  for (let x = x0 - 1; x >= Math.max(1, x0 - 3); x--) grid[cy][x] = 0;
  for (let x = x1 + 1; x <= Math.min(size - 2, x1 + 3); x++) grid[cy][x] = 0;

  // ---- 药房：右上角那间。它那面后墙在"错乱" ----
  const pharm = rooms.filter((r) => r.x0 === x0 + 21 && r.y0 === y0 + 2)[0] || rooms[2];
  for (let x = pharm.x0 + 1; x <= pharm.x1 - 1; x++) glitch.add(x + "," + (pharm.y0 - 1));

  // ---- 归集：地板 / 墙 各归各的 ----
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const k = x + "," + y;
      if (grid[y][x] === 0) hospital.add(k); else hospitalWall.add(k);
    }
  }

  // ---------------- 摆设 ----------------
  const put = (x, y, type) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return;
    if (grid[y][x] !== 0) return;
    props.push({ x, y, floor: 0, type });
  };

  // 门厅：挂号台 + 一排候诊椅
  put(cx, y1 - 2, "hospdesk");
  for (let i = -2; i <= 2; i++) { if (i !== 0) put(cx + i, y1 - 3, "hospchair"); }
  for (let i = -2; i <= 2; i++) { if (i !== 0) put(cx + i, cy + 1, "hospchair"); }

  // 病房：每间两张床 + 一个输液架
  for (const r of rooms) {
    if (r === pharm) continue;
    put(r.x0, r.y0, "hospitalbed");
    put(r.x1, r.y0, "hospitalbed");
    put(r.x0, r.y1 - 1, "hospitalbed");
    put(r.x1, r.y1 - 1, "hospitalbed");
    put(r.cx, r.cy, "ivstand");
  }
  // 手术室：无影灯 + 手术台（用病床改色太糊，直接摆无影灯 + 两张台子）
  const surg = rooms.filter((r) => r.x0 === x0 + 1 && r.y0 === y0 + 12)[0];
  if (surg) {
    put(surg.cx, surg.y0, "surglight");
    put(surg.cx, surg.cy, "hospitalbed");
  }
  // 药房：柜台 + 货架，招牌挂在门边
  put(pharm.x0, pharm.cy, "hosppharm");
  put(pharm.x1, pharm.y0, "hosppharm");
  put(pharm.x1, pharm.y1 - 1, "hosppharm");

  // 招牌：挂在墙上（墙不是地板，put() 会把它挡掉，所以单独挂）
  const hang = (x, y, type) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return;
    if (!hospitalWall.has(x + "," + y)) return;
    props.push({ x, y, floor: 0, type });
  };
  // 正门两侧 + 东西两个侧门上方 —— 夜里远远就能看见那个绿十字
  hang(x0 + 11, y1, "hospsign");
  hang(x0 + 15, y1, "hospsign");
  hang(x0, cy - 1, "hospsign");
  hang(x1, cy - 1, "hospsign");
  hang(x0, cy + 1, "hospsign");
  hang(x1, cy + 1, "hospsign");
  // 临街那两面外墙也挂几块，隔一条街就能认出来
  for (let x = x0 + 2; x <= x1 - 2; x += 6) { hang(x, y1, "hospsign"); hang(x, y0, "hospsign"); }
  for (let y = y0 + 2; y <= y1 - 2; y += 6) { hang(x0, y, "hospsign"); hang(x1, y, "hospsign"); }

  // ---- 路牌：城里隔一段就有一块绿牌子，箭头指着医院 ----
  // 城市是 92×92 的网格，一栋楼再大也很难撞见 —— 没有指示就纯粹靠运气。
  const hcx = (x0 + x1) >> 1, hcy = (y0 + y1) >> 1;
  const dirProps = [];
  for (let y = 5; y < size - 5; y += 19) {
    for (let x = 5; x < size - 5; x += 19) {
      if (grid[y][x] !== 0) continue;
      if (road && !road.has(x + "," + y)) continue;      // 只立在马路上
      if (x >= x0 - 4 && x <= x1 + 4 && y >= y0 - 4 && y <= y1 + 4) continue;  // 已经到了就别立
      const dx = hcx - x, dy = hcy - y;
      const dir = Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");
      dirProps.push({ x, y, floor: 0, type: "hospdir", dir });
    }
  }
  for (const d of dirProps) props.push(d);

  return {
    hospital, hospitalWall, glitch,
    rect: { x0, y0, x1, y1 },
    pharm,
    // 触发点取药房里、贴着那面墙的那一格
    nook: { x: pharm.cx, y: pharm.y0 - 1 },
  };
}
window.buildCityHospital = buildCityHospital;

// ---------------------------------------------------------------------------
// 模型
// ---------------------------------------------------------------------------

// 绿十字招牌：白底板 + 会发光的绿十字（夜里隔着几条街都看得见）
window.PROP_DRAW["hospsign"] = function (ctx, p, T) {
  const w = T * 0.86, h = T * 0.86;
  const t = (typeof performance !== "undefined" ? performance.now() / 1000 : 0);
  const pulse = 0.55 + 0.45 * Math.sin(t * 2.2 + (p.x + p.y) * 0.7);
  ctx.save();
  ctx.shadowColor = "rgba(60,240,140," + (0.45 + pulse * 0.45).toFixed(3) + ")";
  ctx.shadowBlur = 16;
  ctx.fillStyle = "#f2f6f4";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "#9fb0a8";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-w / 2, -h / 2, w, h);
  // 绿十字
  const a = w * 0.46, b = w * 0.16;
  ctx.fillStyle = "rgba(40," + (200 + pulse * 40 | 0) + ",120,1)";
  ctx.fillRect(-b / 2, -a / 2, b, a);
  ctx.fillRect(-a / 2, -b / 2, a, b);
  ctx.restore();
};

// 挂号台：木质柜台 + 台面上的绿十字牌 + 一台终端
window.PROP_DRAW["hospdesk"] = function (ctx, p, T) {
  const w = T * 0.92, d = T * 0.46;
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.22, w * 0.5, d * 0.22, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#b9a888"; ctx.fillRect(-w / 2, -d / 2, w, d);            // 台面
  ctx.fillStyle = "#8d7f63"; ctx.fillRect(-w / 2, -d / 2 + d * 0.62, w, d * 0.38); // 正面
  ctx.fillStyle = "rgba(255,255,255,0.16)"; ctx.fillRect(-w / 2, -d / 2, w, 3);
  // 台面上的绿十字牌
  ctx.fillStyle = "#f2f6f4"; ctx.fillRect(-w * 0.40 - 7, -d / 2 - 9, 14, 11);
  ctx.fillStyle = "#2ec87a"; ctx.fillRect(-w * 0.40 - 2, -d / 2 - 8, 4, 9);
  ctx.fillRect(-w * 0.40 - 6, -d / 2 - 4, 12, 4);
  // 终端
  ctx.fillStyle = "#3d4448"; ctx.fillRect(w * 0.18, -d / 2 - 12, 14, 10);
  ctx.fillStyle = "#7fd8ff"; ctx.fillRect(w * 0.18 + 2, -d / 2 - 10, 10, 6);
};

// 药房柜台：玻璃柜 + 一排药瓶
window.PROP_DRAW["hosppharm"] = function (ctx, p, T) {
  const w = T * 0.88, d = T * 0.42;
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.20, w * 0.5, d * 0.22, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#dfe7ea"; ctx.fillRect(-w / 2, -d / 2, w, d);
  ctx.fillStyle = "#b7c4c8"; ctx.fillRect(-w / 2, -d / 2 + d * 0.55, w, d * 0.45);
  ctx.fillStyle = "rgba(160,200,215,0.35)"; ctx.fillRect(-w / 2 + 3, -d / 2 + 3, w - 6, d * 0.42);
  // 药瓶
  const cols = ["#e08a6a", "#7fb2e0", "#8fd39a", "#e0cf7a", "#c79ae0"];
  for (let i = 0; i < 5; i++) {
    const bx = -w / 2 + 5 + i * (w - 10) / 5;
    ctx.fillStyle = cols[i];
    ctx.fillRect(bx, -d / 2 - 8, 6, 9);
    ctx.fillStyle = "#5a6569"; ctx.fillRect(bx + 1, -d / 2 - 10, 4, 2);
  }
};

// 路牌：绿底白箭头，指着医院的方向（城市太大，没有指示就纯靠撞）
window.PROP_DRAW["hospdir"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() / 1000 : 0);
  const pulse = 0.5 + 0.5 * Math.sin(t * 2 + (p.x + p.y));
  // 立杆
  ctx.fillStyle = "#6a757a"; ctx.fillRect(-1.5, -T * 0.05, 3, T * 0.45);
  // 牌面
  const w = T * 0.68, h = T * 0.40;
  ctx.save();
  ctx.shadowColor = "rgba(60,240,140," + (0.25 + pulse * 0.35).toFixed(3) + ")";
  ctx.shadowBlur = 10;
  ctx.fillStyle = "#2c8f5c";
  ctx.fillRect(-w / 2, -h - T * 0.05, w, h);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(230,255,240,0.75)";
  ctx.lineWidth = 1.2;
  ctx.strokeRect(-w / 2, -h - T * 0.05, w, h);
  // 箭头
  const cx0 = 0, cy0 = -h / 2 - T * 0.05;
  ctx.fillStyle = "#f2fff8";
  const a = w * 0.20;
  ctx.save();
  ctx.translate(cx0, cy0);
  const rot = (p.dir === "right") ? 0 : (p.dir === "down") ? Math.PI / 2
            : (p.dir === "left") ? Math.PI : -Math.PI / 2;
  ctx.rotate(rot);
  ctx.beginPath();
  ctx.moveTo(a * 0.9, 0); ctx.lineTo(a * 0.1, -a * 0.62);
  ctx.lineTo(a * 0.1, -a * 0.22); ctx.lineTo(-a * 0.9, -a * 0.22);
  ctx.lineTo(-a * 0.9, a * 0.22); ctx.lineTo(a * 0.1, a * 0.22);
  ctx.lineTo(a * 0.1, a * 0.62);
  ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.restore();
};

// 候诊椅：连排座椅
window.PROP_DRAW["hospchair"] = function (ctx, p, T) {
  const w = T * 0.72, d = T * 0.30;
  ctx.fillStyle = "rgba(0,0,0,0.24)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.14, w * 0.5, d * 0.24, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#5f7f96"; ctx.fillRect(-w / 2, -d / 2, w, d);
  ctx.fillStyle = "#4d6a80"; ctx.fillRect(-w / 2, -d / 2 - 8, w, 8);       // 靠背
  ctx.fillStyle = "#8fa9bd"; ctx.fillRect(-w / 2, -d / 2, w, 2);
  for (let i = 0; i < 3; i++) {                                            // 扶手
    ctx.fillStyle = "#43586a";
    ctx.fillRect(-w / 2 + 3 + i * (w - 6) / 3, d / 2 - 1, 3, 4);
  }
};
