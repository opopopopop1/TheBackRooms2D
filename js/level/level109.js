// ===========================================================
// Level 109 —— 霓虹医院
// 无数条长度不同的医院走廊（平均 2.9 英里），两侧大量无标签的门，
// 门后是"礼堂"（医院各部门，面积约礼堂大小）。
// 出口：标着 EXIT 的门 -> Level 114；标着感叹号的门 -> 尘封的感叹号。
// 布局：长走廊 + 沿走廊排开的房间 —— 不是迷宫，是"一条路走下去"。
// ===========================================================
"use strict";

function generateHospitalMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const props = [];

  // 四条横向长走廊，每条都很长
  const lanes = [];
  for (let i = 1; i <= 4; i++) {
    const y = Math.floor(size * i / 5);
    lanes.push(y);
    for (let x = 2; x < size - 2; x++) for (let w = -1; w <= 1; w++) grid[y + w][x] = 0;
  }
  // 竖向连接走廊（每隔一段一条），方便切换
  for (let i = 1; i <= 3; i++) {
    const x = Math.floor(size * i / 4);
    carveCorridorW(grid, size, x, lanes[0], x, lanes[lanes.length - 1], 1);
  }
  // 礼堂：沿走廊两侧成排的大房间，门开在走廊这一面
  const rooms = [];
  for (let li = 0; li < lanes.length; li++) {
    const y = lanes[li];
    for (let i = 0; i < 5; i++) {
      const x = 4 + i * Math.floor((size - 10) / 5);
      const w = randInt(7, 11), h = randInt(6, 9);
      const up = li % 2 === 0;
      const by = up ? y - h - 1 : y + 2;
      if (by < 2 || by + h > size - 3) continue;
      carveRoom(grid, size, x, by, w, h);
      carveCorridorW(grid, size, x + (w >> 1), up ? by + h : by, x + (w >> 1), y, 1);
      rooms.push({ x, y: by, w, h });
    }
  }
  const floors = collectFloors(grid, size);
  const start = { x: 4, y: lanes[0], floor: 0 };

  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return;
    if (grid[y][x] !== 0) return;
    props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  };
  // 走廊上大量无标签的门
  for (const y of lanes) {
    for (let x = 5; x < size - 5; x += 3) put(x, y - 1, "door109", { label: "" });
  }
  // 医院设施
  for (let i = 0; i < 20; i++) { const r = rooms[randInt(0, rooms.length - 1)]; put(r.x + randInt(1, Math.max(1, r.w - 2)), r.y + randInt(1, Math.max(1, r.h - 2)), "hospitalbed"); }
  for (let i = 0; i < 14; i++) { const r = rooms[randInt(0, rooms.length - 1)]; put(r.x + randInt(1, Math.max(1, r.w - 2)), r.y + randInt(1, Math.max(1, r.h - 2)), "ivstand"); }
  for (let i = 0; i < 10; i++) { const r = rooms[randInt(0, rooms.length - 1)]; put(r.x + randInt(1, Math.max(1, r.w - 2)), r.y + randInt(1, Math.max(1, r.h - 2)), "surglight"); }
  // 出口：EXIT 门 + 感叹号门
  // 原文写的 EXIT 门通往 Level 114，但这一版没做 114 —— 指向一个不存在的层级
  // 等于给了玩家一扇开不了的门。先落到 Level 11（不夜城），等 114 做了再改回来。
  put(size - 5, lanes[0], "door109", { label: "EXIT", toLevel: 11 });
  put(size - 8, lanes[lanes.length - 1], "exclamdoor109", { toLevel: "exclam" });

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms,
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [],
  };
  map.spawnPts = [start];
  return map;
}

window.PROP_DRAW = window.PROP_DRAW || {};

// 医院病房门：门框嵌在墙线上 + 一块小观察窗（大多没有标签）
window.PROP_DRAW["door109"] = function (ctx, p, T) {
  const w = T * 0.62, h = T * 0.88;
  ctx.fillStyle = "#7e9096"; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#93a4a9"; ctx.fillRect(-w / 2 + 2, -h / 2 + 2, w - 4, h - 4);
  ctx.fillStyle = "#b8ccd2"; ctx.fillRect(-w / 2 + 5, -h / 2 + 5, w - 10, h * 0.26);  // 观察窗
  ctx.strokeStyle = "#5a6a70"; ctx.lineWidth = 1.2; ctx.strokeRect(-w / 2 + 5, -h / 2 + 5, w - 10, h * 0.26);
  ctx.fillStyle = "#4a5860";                                                          // 门把
  ctx.fillRect(w * 0.24, -T * 0.03, T * 0.10, T * 0.06);
  if (p.label === "EXIT") {
    ctx.fillStyle = "#40c060"; ctx.fillRect(-w / 2, -h / 2 - T * 0.16, w, T * 0.14);
    ctx.fillStyle = "#0a2a12"; ctx.font = "bold 8px ui-monospace, monospace"; ctx.textAlign = "center";
    ctx.fillText("EXIT", 0, -h / 2 - T * 0.06); ctx.textAlign = "left";
  }
};

// 病床：床架 + 床垫 + 枕头 + 轮子
window.PROP_DRAW["hospitalbed"] = function (ctx, p, T) {
  const w = T * 0.80, d = T * 0.52;
  ctx.fillStyle = "rgba(0,0,0,0.30)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.24, w * 0.5, d * 0.22, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#cdd8dc"; ctx.fillRect(-w / 2, -d / 2, w, d);            // 床垫
  ctx.fillStyle = "#e4edf0"; ctx.fillRect(-w / 2, -d / 2, w, d * 0.30);     // 枕头区
  ctx.fillStyle = "#f4f8fa"; ctx.fillRect(-w / 2 + 3, -d / 2 + 2, w * 0.26, d * 0.34);
  ctx.fillStyle = "#8a9aa0"; ctx.fillRect(-w / 2 - 2, -d / 2 - 3, w + 4, 3); // 床头栏
  ctx.fillRect(-w / 2 - 2, d / 2, w + 4, 3);
  ctx.fillStyle = "#5a6a70";                                                 // 轮子
  for (const s of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    ctx.beginPath(); ctx.arc(s[0] * (w / 2 - 4), s[1] * (d / 2 + 2), 2.4, 0, Math.PI * 2); ctx.fill();
  }
};

// 输液架：立杆 + 挂钩 + 药袋
window.PROP_DRAW["ivstand"] = function (ctx, p, T) {
  ctx.fillStyle = "#9aa8ad"; ctx.fillRect(-1.5, -T * 0.34, 3, T * 0.62);
  ctx.fillStyle = "#7a888d";
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    ctx.fillRect(Math.cos(a) * T * 0.10 - 1, T * 0.26, Math.cos(a) * T * 0.12 + 2, 3);
  }
  ctx.strokeStyle = "#9aa8ad"; ctx.lineWidth = 2;                            // 横臂
  ctx.beginPath(); ctx.moveTo(-T * 0.16, -T * 0.32); ctx.lineTo(T * 0.16, -T * 0.32); ctx.stroke();
  ctx.fillStyle = "#d8e8ee"; ctx.fillRect(T * 0.08, -T * 0.30, T * 0.14, T * 0.22);   // 药袋
  ctx.strokeStyle = "#8a9aa0"; ctx.lineWidth = 1; ctx.strokeRect(T * 0.08, -T * 0.30, T * 0.14, T * 0.22);
};

// 无影灯：吊臂 + 圆盘灯头 + 向下的一束光
window.PROP_DRAW["surglight"] = function (ctx, p, T) {
  ctx.strokeStyle = "#8a9aa0"; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(0, -T * 0.40); ctx.lineTo(0, -T * 0.18); ctx.stroke();
  ctx.fillStyle = "#b8c6cc";
  ctx.beginPath(); ctx.ellipse(0, -T * 0.12, T * 0.24, T * 0.10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#f0f8fa";
  ctx.beginPath(); ctx.ellipse(0, -T * 0.08, T * 0.18, T * 0.07, 0, 0, Math.PI * 2); ctx.fill();
  const g = ctx.createLinearGradient(0, -T * 0.06, 0, T * 0.40);
  g.addColorStop(0, "rgba(230,245,250,0.30)"); g.addColorStop(1, "rgba(230,245,250,0)");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(-T * 0.10, -T * 0.06); ctx.lineTo(T * 0.10, -T * 0.06);
  ctx.lineTo(T * 0.26, T * 0.40); ctx.lineTo(-T * 0.26, T * 0.40); ctx.closePath(); ctx.fill();
};

// 标着感叹号的门 -> 尘封的感叹号
window.PROP_DRAW["exclamdoor109"] = function (ctx, p, T) {
  const w = T * 0.66, h = T * 0.90;
  ctx.fillStyle = "#6a7a80"; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#849498"; ctx.fillRect(-w / 2 + 2, -h / 2 + 2, w - 4, h - 4);
  ctx.strokeStyle = "#3a4a50"; ctx.lineWidth = 2; ctx.strokeRect(-w / 2, -h / 2, w, h);
  // 门上那个褪色的感叹号印记
  ctx.fillStyle = "#c8b060";
  ctx.fillRect(-T * 0.05, -T * 0.22, T * 0.10, T * 0.26);
  ctx.beginPath(); ctx.arc(0, T * 0.12, T * 0.055, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.30)"; ctx.lineWidth = 1;
  ctx.strokeRect(-T * 0.06, -T * 0.23, T * 0.12, T * 0.28);
};
