// ===========================================================
// Level 36.1 —— 星界客机
// 一个循环的商业飞机内部空间，可容纳 300 名乘客；只能从 Level 36 进入。
// 客舱每 20 排一个区段，前后两端无缝衔接 —— 头等舱之后又是经济舱，循环回起点。
// 区段分隔处有卫生间、出口门、上锁的补给柜。没有驾驶舱。
// 落地后从出口门出去，就是你在 Level 36 那个登机口挑的目的地。
// ===========================================================
"use strict";

if (typeof regTile === "function") regTile("airliner", ["#8a94a4", "#c8ccd4"]);
else { (window.__NEWTILE_EXTRA = window.__NEWTILE_EXTRA || {})["airliner"] = ["#8a94a4", "#c8ccd4"]; }

function generateAirlinerMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const props = [];
  const cx = Math.floor(size / 2);

  // ---- 客舱：中间一条过道，两侧各两列座位，再外面是舱壁 ----
  const y0 = 3, y1 = size - 5;
  for (let y = y0; y <= y1; y++) {
    for (let x = cx - 3; x <= cx + 3; x++) if (grid[y] && grid[y][x] !== undefined) grid[y][x] = 0;
  }
  // 两端的横向通道（前后舱相接的地方）
  for (let x = cx - 3; x <= cx + 3; x++) {
    if (grid[y0 - 1]) grid[y0 - 1][x] = 0;
    if (grid[y1 + 1]) grid[y1 + 1][x] = 0;
  }

  const floors = collectFloors(grid, size);
  const start = { x: cx, y: y0 + 2, floor: 0 };

  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return null;
    if (!grid[y] || grid[y][x] !== 0) return null;
    const p = Object.assign({ x, y, floor: 0, type }, extra || {});
    props.push(p);
    return p;
  };

  // ---- 座位：两侧各两列，每 4 排留一个"区段隔断" ----
  const rows = [];
  for (let y = y0; y <= y1; y++) {
    rows.push(y);
    if ((y - y0) % 4 === 3) continue;                 // 隔断那一排不放座位
    const cls = ((y - y0) % 20 < 4) ? "first" : "eco"; // 头等 / 经济循环出现
    for (const s of [-3, -2, 2, 3]) put(cx + s, y, "seat361", { cls });
  }

  // ---- 区段分隔处：卫生间 / 出口门 / 上锁的补给柜 ----
  const exits = [];
  for (let y = y0; y <= y1; y++) {
    if ((y - y0) % 4 !== 3) continue;
    put(cx - 3, y, "lav361");
    put(cx + 3, y, "locker361");
    const d = put(cx, y, "exit361");
    if (d) exits.push(d);
  }
  // 机舱两端也各有一扇出口门（前后无缝衔接，走哪头都一样）
  const dTop = put(cx, y0 - 1, "exit361");
  const dBot = put(cx, y1 + 1, "exit361");
  if (dTop) exits.push(dTop);
  if (dBot) exits.push(dBot);

  // ---- 无面灵乘务员：推着餐车，站在隔断后面 ----
  for (let i = 0; i < 4; i++) {
    const y = y0 + 2 + i * Math.floor((y1 - y0) / 5);
    put(cx + (i % 2 ? 1 : -1), y, "steward361");
    put(cx + (i % 2 ? 2 : -2), y, "cart361");
  }

  // 这一趟的目的地：Level 36 那个登机口挑的
  // （goToLevel 之后才生成地图 —— 所以从这里读，别指望参数传进来）
  const gg = window.__game || window.game;
  const dest = (gg && gg.flightDest != null) ? gg.flightDest : null;

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [],
  };
  map.exits361 = exits;
  map.cabinMid = cx;
  // 舷窗只画在机身两侧的舱壁上（竖向排布），所以要让绘制函数知道机身在哪
  map.cabinY0 = y0;
  map.cabinY1 = y1;
  map.dest = dest;
  map.spawnPts = [start];
  return map;
}

window.PROP_DRAW = window.PROP_DRAW || {};

// 座位：背后有一块个人屏幕；头等舱更宽、颜色更深
window.PROP_DRAW["seat361"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  const first = p.cls === "first";
  const w = first ? T * 1.04 : T * 0.86;
  ctx.fillStyle = "rgba(0,0,0,0.30)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.34, w * 0.5, T * 0.10, 0, 0, Math.PI * 2); ctx.fill();
  // 坐垫
  ctx.fillStyle = first ? "#3a3f52" : "#4a5160";
  ctx.fillRect(-w / 2, -T * 0.10, w, T * 0.36);
  // 靠背
  ctx.fillStyle = first ? "#333850" : "#424958";
  ctx.fillRect(-w / 2, -T * 0.44, w, T * 0.36);
  // 头枕
  ctx.fillStyle = first ? "#5a5266" : "#5c6472";
  ctx.fillRect(-w / 2 + w * 0.18, -T * 0.52, w * 0.64, T * 0.12);
  // 扶手
  ctx.fillStyle = "#6a7280";
  ctx.fillRect(-w / 2 - T * 0.04, -T * 0.16, T * 0.04, T * 0.16);
  ctx.fillRect(w / 2, -T * 0.16, T * 0.04, T * 0.16);
  // 背后的小屏幕
  ctx.fillStyle = "#10141a";
  ctx.fillRect(-w * 0.22, -T * 0.34, w * 0.44, T * 0.20);
  // 屏幕上什么也没有 —— 但会一闪一闪地亮着
  const flick = 0.25 + Math.abs(Math.sin(t * 0.7 + p.x)) * 0.30;
  ctx.fillStyle = "rgba(150,190,220," + flick.toFixed(2) + ")";
  ctx.fillRect(-w * 0.20, -T * 0.32, w * 0.40, T * 0.16);
  // 安全带（垂在坐垫上）
  ctx.strokeStyle = "#2a2e36"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-w * 0.2, T * 0.16); ctx.lineTo(w * 0.2, T * 0.02); ctx.stroke();
};

// 卫生间 —— 门上有个小窗，里面永远空着
window.PROP_DRAW["lav361"] = function (ctx, p, T) {
  ctx.fillStyle = "#5a6472"; ctx.fillRect(-T * 0.40, -T * 0.62, T * 0.80, T * 1.10);
  ctx.fillStyle = "#48505e"; ctx.fillRect(-T * 0.34, -T * 0.56, T * 0.68, T * 1.02);
  ctx.strokeStyle = "#7a8490"; ctx.lineWidth = 1.5;
  ctx.strokeRect(-T * 0.40, -T * 0.62, T * 0.80, T * 1.10);
  ctx.fillStyle = "#9ad0e0"; ctx.fillRect(-T * 0.12, -T * 0.48, T * 0.24, T * 0.18);   // 小窗
  ctx.fillStyle = "#e8e0c8";                                                            // 门把手
  ctx.fillRect(T * 0.24, -T * 0.04, T * 0.08, T * 0.03);
};

// 上锁的补给柜
window.PROP_DRAW["locker361"] = function (ctx, p, T) {
  ctx.fillStyle = "#6a7280"; ctx.fillRect(-T * 0.36, -T * 0.54, T * 0.72, T * 0.98);
  ctx.strokeStyle = "#8a929c"; ctx.lineWidth = 1.2;
  ctx.strokeRect(-T * 0.36, -T * 0.54, T * 0.72, T * 0.98);
  ctx.beginPath(); ctx.moveTo(0, -T * 0.54); ctx.lineTo(0, T * 0.44); ctx.stroke();
  ctx.fillStyle = "#c8a040";                                     // 挂锁
  ctx.fillRect(-T * 0.06, -T * 0.02, T * 0.12, T * 0.12);
  ctx.strokeStyle = "#8a6a20"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(0, -T * 0.02, T * 0.05, Math.PI, 0); ctx.stroke();
};

// 出口门 —— 机舱灯光亮起后它就是"新的目的地"
window.PROP_DRAW["exit361"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  ctx.fillStyle = "#5a6472"; ctx.fillRect(-T * 0.44, -T * 0.70, T * 0.88, T * 1.30);
  ctx.fillStyle = "#3c4450"; ctx.fillRect(-T * 0.36, -T * 0.62, T * 0.72, T * 1.20);
  // 门缝里往外渗的白光（档案：窗外泛着纯净的白光）
  const glow = 0.55 + Math.sin(t * 1.6) * 0.16;
  ctx.fillStyle = "rgba(240,248,255," + glow.toFixed(2) + ")";
  ctx.fillRect(-T * 0.05, -T * 0.62, T * 0.10, T * 1.20);
  ctx.strokeStyle = "#8a929c"; ctx.lineWidth = 2;
  ctx.strokeRect(-T * 0.44, -T * 0.70, T * 0.88, T * 1.30);
  // 门上的 EXIT 灯
  ctx.fillStyle = "#50e070";
  ctx.fillRect(-T * 0.30, -T * 0.86, T * 0.60, T * 0.14);
  ctx.fillStyle = "#103010"; ctx.font = "bold 7px ui-monospace, monospace"; ctx.textAlign = "center";
  ctx.fillText("EXIT", 0, -T * 0.76); ctx.textAlign = "left";
  // 把手
  ctx.fillStyle = "#c8ccd4";
  ctx.fillRect(-T * 0.22, -T * 0.10, T * 0.44, T * 0.05);
};

// 无面灵乘务员 —— 站在隔断后面推餐车；它不会伤害你
window.PROP_DRAW["steward361"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  const bob = Math.sin(t * 0.8 + p.x) * T * 0.02;
  ctx.save(); ctx.translate(0, bob);
  ctx.fillStyle = "rgba(0,0,0,0.30)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.40, T * 0.22, T * 0.06, 0, 0, Math.PI * 2); ctx.fill();
  // 制服
  ctx.fillStyle = "#2a3348"; ctx.fillRect(-T * 0.18, -T * 0.24, T * 0.36, T * 0.56);
  ctx.fillStyle = "#38425c"; ctx.fillRect(-T * 0.18, -T * 0.24, T * 0.36, T * 0.10);
  // 领口的小丝巾
  ctx.fillStyle = "#c85040"; ctx.fillRect(-T * 0.06, -T * 0.16, T * 0.12, T * 0.05);
  // 头 —— 脸上什么都没有
  ctx.fillStyle = "#d8c8b0";
  ctx.beginPath(); ctx.ellipse(0, -T * 0.38, T * 0.15, T * 0.17, 0, 0, Math.PI * 2); ctx.fill();
  // 头发
  ctx.fillStyle = "#3a2e28";
  ctx.beginPath(); ctx.ellipse(0, -T * 0.46, T * 0.16, T * 0.10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
};

// 餐车：机上的餐饮由它推出来
window.PROP_DRAW["cart361"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(0,0,0,0.26)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.34, T * 0.34, T * 0.08, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#b8bcc4"; ctx.fillRect(-T * 0.32, -T * 0.26, T * 0.64, T * 0.52);
  ctx.fillStyle = "#d0d4dc"; ctx.fillRect(-T * 0.34, -T * 0.32, T * 0.68, T * 0.08);
  ctx.strokeStyle = "#7a8088"; ctx.lineWidth = 1.2;
  ctx.strokeRect(-T * 0.32, -T * 0.26, T * 0.64, T * 0.52);
  ctx.beginPath(); ctx.moveTo(-T * 0.32, T * 0.02); ctx.lineTo(T * 0.32, T * 0.02); ctx.stroke();
  // 车上的杯子和餐盒
  ctx.fillStyle = "#f0ece0"; ctx.fillRect(-T * 0.20, -T * 0.22, T * 0.08, T * 0.10);
  ctx.fillRect(-T * 0.08, -T * 0.22, T * 0.08, T * 0.10);
  ctx.fillStyle = "#c8a060"; ctx.fillRect(T * 0.06, -T * 0.22, T * 0.16, T * 0.10);
  // 轮子
  ctx.fillStyle = "#3a3f46";
  ctx.fillRect(-T * 0.26, T * 0.26, T * 0.06, T * 0.06);
  ctx.fillRect(T * 0.20, T * 0.26, T * 0.06, T * 0.06);
};

// ---------- 地面 / 墙面：星界客机 ----------
// 客舱地毯：深蓝灰，带细密的织纹；过道那一列是浅色的
function drawAirlinerFloor(ctx, px, py, T, tx, ty, map) {
  const n = ((tx * 73856093) ^ (ty * 19349663)) >>> 0;
  ctx.fillStyle = "#3c4454";
  ctx.fillRect(px, py, T, T);
  // 织纹
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  for (let i = 0; i < 6; i++) {
    const a = ((n >> (i * 2)) % 53) / 53, b = ((n >> (i * 3 + 1)) % 61) / 61;
    ctx.fillRect(px + a * T * 0.92, py + b * T * 0.92, 3, 1);
  }
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(px, py + T * 0.88, T, T * 0.12);
  return true;
}
// 舱壁：浅灰的板子；舷窗【只】画在机身左右两侧的舱壁上，竖向排成一列
// （以前是按 ty%4 撒在所有墙上，结果横着一排一排地出现，连机舱外的野地都冒窗）
function drawAirlinerWall(ctx, px, py, T, tx, ty, map) {
  ctx.fillStyle = "#c3c8d0";
  ctx.fillRect(px, py, T, T);
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillRect(px, py, T, T * 0.28);
  ctx.fillStyle = "rgba(0,0,0,0.16)";
  ctx.fillRect(px, py + T * 0.78, T, T * 0.22);
  // 机身中轴、客舱的纵向范围 —— 只有这两列舱壁上才有窗
  const mid = (map && map.cabinMid != null) ? map.cabinMid : null;
  const y0 = (map && map.cabinY0 != null) ? map.cabinY0 : 0;
  const y1 = (map && map.cabinY1 != null) ? map.cabinY1 : 0;
  const isHull = (mid !== null) && (tx === mid - 4 || tx === mid + 4);
  const inCabin = (mid !== null) && (ty >= y0 && ty <= y1);
  if (isHull && inCabin && ((ty - y0) % 2) === 0) {
    const cx0 = px + T * 0.5, cy0 = py + T * 0.44, r = T * 0.24;
    ctx.fillStyle = "#8a9098";
    ctx.beginPath(); ctx.arc(cx0, cy0, r * 1.22, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#0a1018";
    ctx.beginPath(); ctx.arc(cx0, cy0, r, 0, Math.PI * 2); ctx.fill();
    // 外面的星星（或者是降落时那片纯净的白光）
    const n = ((tx * 31) ^ (ty * 17)) >>> 0;
    for (let i = 0; i < 3; i++) {
      const a = ((n >> (i * 3)) % 40) / 40, b = ((n >> (i * 4 + 1)) % 40) / 40;
      ctx.fillStyle = "rgba(220,235,255,0.85)";
      ctx.fillRect(cx0 - r * 0.6 + a * r * 1.2, cy0 - r * 0.6 + b * r * 1.2, 1.5, 1.5);
    }
    ctx.strokeStyle = "rgba(240,248,255,0.35)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx0, cy0, r, 0, Math.PI * 2); ctx.stroke();
  }
  return true;
}
