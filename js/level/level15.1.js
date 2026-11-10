// ===========================================================
// Level 15.1 —— 枉然
//
// Level 15 里一处拥有尖端科技的区域：超现实仿真室和头戴式仿真设备，
// 能呈现流浪者渴望的任何环境。科技先进到没人能逆向出来 —— 每次有人想把
// 设备带出这一层，设备就爆炸，带走走私者的命。
//
// 中央那间是「控制中心」，唯一的通道是一扇密封的门，门上只有一个小观察孔，
// 透过它能看见几个模糊的身影站在一台庞大得离谱的设备前。任何模拟设备都
// 画不出控制中心的景象 —— 一试就永久崩溃。
//
// 这一层会诱发敌意：进来的人攻击性和精神病倾向都会升高。设备数量少，
// 于是有了争夺和暴力。最要命的是等不及的人 —— 强行把设备从使用者头上
// 摘下来，那一刻使用者就脑死亡了。安全离开模拟的唯一方式是自己愿意摘。
//
// 入口：离开 Level 15 时有 1.8% 的概率掉进这里。
// 出口：目前，尚无人尝试从该子层级中离开。
// ===========================================================
"use strict";

if (typeof regTile === "function") regTile("futility", ["#2a3038", "#1b2027"]);
else { (window.__NEWTILE_EXTRA = window.__NEWTILE_EXTRA || {})["futility"] = ["#2a3038", "#1b2027"]; }

function generateFutilityMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const props = [];
  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return;
    props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  };

  // ---- 九宫格：中间那格是环廊 + 控制中心，周围八格是仿真室 ----
  const bx = [4, Math.floor(size * 0.30), Math.floor(size * 0.66), size - 4];
  const by = [4, Math.floor(size * 0.30), Math.floor(size * 0.66), size - 4];
  carveRoom(grid, size, bx[0], by[0], bx[3] - bx[0], by[3] - by[0]);
  // 分隔墙
  for (let y = by[0]; y < by[3]; y++) { grid[y][bx[1]] = 1; grid[y][bx[2]] = 1; }
  for (let x = bx[0]; x < bx[3]; x++) { grid[by[1]][x] = 1; grid[by[2]][x] = 1; }
  // 门洞：每道分隔墙在每一格的中间开一个 3 格宽的口
  for (let j = 0; j < 3; j++) {
    const yc = Math.floor((by[j] + by[j + 1]) / 2);
    for (let k = -1; k <= 1; k++) { grid[yc + k][bx[1]] = 0; grid[yc + k][bx[2]] = 0; }
  }
  for (let i = 0; i < 3; i++) {
    const xc = Math.floor((bx[i] + bx[i + 1]) / 2);
    for (let k = -1; k <= 1; k++) { grid[by[1]][xc + k] = 0; grid[by[2]][xc + k] = 0; }
  }

  // ---- 控制中心：中央那格正中，一整块实心 ----
  const cx = Math.floor(size / 2), cy = Math.floor(size / 2);
  const cw = 7, ch = 4;
  for (let y = cy - ch; y <= cy + ch; y++)
    for (let x = cx - cw; x <= cx + cw; x++)
      if (y > 0 && x > 0 && y < size && x < size) grid[y][x] = 1;

  // ---- 出生点：最下排中间那格（入口处，排队客就在这儿） ----
  const start = {
    x: Math.floor((bx[1] + bx[2]) / 2),
    y: Math.floor((by[2] + by[3]) / 2),
    floor: 0,
  };
  grid[start.y][start.x] = 0;

  ensureAllConnected(grid, size, { x: start.x, y: start.y });
  const floors = collectFloors(grid, size);

  const isF = (x, y) => grid[y] && grid[y][x] === 0;

  // ---- 八间仿真室，每间摆 1~3 台仿真设备 ----
  const cells = [];
  for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) {
    if (i === 1 && j === 1) continue;                 // 中间那格是环廊
    cells.push({ x0: bx[i] + 1, y0: by[j] + 1, x1: bx[i + 1] - 1, y1: by[j + 1] - 1 });
  }
  for (const c of cells) {
    const n = randInt(1, 3);
    for (let k = 0; k < n; k++) {
      for (let tryN = 0; tryN < 30; tryN++) {
        const x = randInt(c.x0, c.x1), y = randInt(c.y0, c.y1);
        if (!isF(x, y)) continue;
        if (Math.abs(x - start.x) + Math.abs(y - start.y) < 3) continue;
        if (props.some((p) => p.type === "pod151" && p.x === x && p.y === y)) continue;
        put(x, y, "pod151");
        break;
      }
    }
    // 墙上的监视器 —— 这层到处都是屏幕
    put(c.x0, c.y0, "screen151");
  }

  // ---- 控制中心那扇密封的门（带观察孔） ----
  let dx = cx - cw, dy = cy;
  const ctrlDoor = { type: "ctrldoor151", x: dx, y: dy, floor: 0 };
  props.push(ctrlDoor);

  // ---- 入口处的队伍：排队客 ----
  for (let k = 0; k < 6; k++) {
    const qx = start.x - 3, qy = start.y + 1 + k * 2;
    if (isF(qx, qy)) put(qx, qy, "queue151");
  }
  put(start.x + 2, start.y - 2, "sign151");

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [],
    ctrldoor151: ctrlDoor,
  };
  map.spawnPts = [start];
  // 这一层没有出口（档案：「目前，尚无人尝试从该子层级中离开」）
  return map;
}
window.generateFutilityMap = generateFutilityMap;

// ---------- 地面 / 墙体 ----------
// 地面：深色抛光金属，接缝里透着青色的光
window.drawFutilityFloor = function (ctx, px, py, h, map, tx, ty) {
  const S = (typeof h === "number" ? h : 40);
  ctx.fillStyle = "#2a3038";
  ctx.fillRect(px, py, S, S);
  // 抛光面的一点反光
  ctx.fillStyle = "rgba(255,255,255,.045)";
  ctx.fillRect(px + 1, py + 1, S - 2, 2);
  // 接缝
  ctx.strokeStyle = "rgba(90,200,220,.16)";
  ctx.lineWidth = 1;
  ctx.strokeRect(px + 0.5, py + 0.5, S - 1, S - 1);
  // 每隔几格有一道导光条
  if (((tx + ty) % 7) === 0) {
    ctx.fillStyle = "rgba(80,220,235,.22)";
    ctx.fillRect(px + S * 0.12, py + S * 0.46, S * 0.76, Math.max(1.5, S * 0.06));
  }
  return true;
};

// 墙体：深色面板，拼缝里亮着一线冷光
window.drawFutilityWall = function (ctx, px, py, h, map, tx, ty) {
  const S = (typeof h === "number" ? h : 40);
  ctx.fillStyle = "#1b2027";
  ctx.fillRect(px, py, S, S);
  // 面板分块
  ctx.fillStyle = "rgba(255,255,255,.05)";
  ctx.fillRect(px + 1, py + 1, S - 2, S * 0.30);
  ctx.fillStyle = "rgba(0,0,0,.30)";
  ctx.fillRect(px, py + S - Math.max(2, S * 0.14), S, Math.max(2, S * 0.14));
  // 拼缝里的冷光
  ctx.strokeStyle = "rgba(70,190,215,.22)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(px + 0.5, py); ctx.lineTo(px + 0.5, py + S);
  ctx.stroke();
  // 偶尔有一小块状态指示灯
  if (((tx * 5 + ty * 3) % 11) === 0) {
    ctx.fillStyle = "rgba(90,235,180,.55)";
    ctx.fillRect(px + S * 0.62, py + S * 0.30, Math.max(2, S * 0.10), Math.max(2, S * 0.06));
  }
  return true;
};

// ---------- 物件 ----------
window.PROP_DRAW = window.PROP_DRAW || {};

// 仿真设备：一台躺椅似的舱体，旁边挂着头戴式设备
window.PROP_DRAW["pod151"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : 0) / 1000;
  // 舱体
  ctx.fillStyle = "rgba(0,0,0,.34)";
  ctx.fillRect(-T * 0.34, T * 0.06, T * 0.68, T * 0.20);
  ctx.fillStyle = "#39424e";
  ctx.fillRect(-T * 0.32, -T * 0.14, T * 0.64, T * 0.26);
  ctx.fillStyle = "#4a5666";
  ctx.fillRect(-T * 0.30, -T * 0.18, T * 0.60, T * 0.16);
  // 头戴式设备：悬在舱体上方，一圈会呼吸的光
  const a = 0.45 + 0.25 * Math.sin(t * 1.7 + p.x);
  ctx.fillStyle = "#232a33";
  ctx.fillRect(-T * 0.20, -T * 0.44, T * 0.40, T * 0.20);
  ctx.fillStyle = "rgba(90,225,240," + a.toFixed(3) + ")";
  ctx.fillRect(-T * 0.18, -T * 0.40, T * 0.36, Math.max(1.5, T * 0.05));
  ctx.strokeStyle = "rgba(90,225,240,.30)";
  ctx.lineWidth = Math.max(1, T * 0.03);
  ctx.beginPath();
  ctx.moveTo(0, -T * 0.24); ctx.lineTo(0, -T * 0.10);
  ctx.stroke();
  // 底座上的一圈光
  ctx.fillStyle = "rgba(80,215,235,.20)";
  ctx.fillRect(-T * 0.32, T * 0.10, T * 0.64, Math.max(1.5, T * 0.05));
};

// 控制中心那扇密封的门：门上只有一个小观察孔
window.PROP_DRAW["ctrldoor151"] = function (ctx, p, T) {
  const w = T * 0.86, h = T * 0.96;
  ctx.fillStyle = "#151a20";
  ctx.fillRect(-w / 2 - 3, -h / 2 - 3, w + 6, h + 6);
  ctx.fillStyle = "#2c343e";                          // 门板：厚重金属
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "rgba(255,255,255,.06)";
  ctx.fillRect(-w / 2, -h / 2, w, h * 0.16);
  // 四周的密封条
  ctx.strokeStyle = "#4b5764"; ctx.lineWidth = Math.max(1.5, T * 0.05);
  ctx.strokeRect(-w / 2 + 2, -h / 2 + 2, w - 4, h - 4);
  // 观察孔：一小块亮着的圆，里面是模糊的身影
  const hx = 0, hy = -h * 0.12, hr = Math.max(3, T * 0.13);
  ctx.fillStyle = "#0a0d11";
  ctx.beginPath(); ctx.arc(hx, hy, hr + 2, 0, Math.PI * 2); ctx.fill();
  const gr = ctx.createRadialGradient(hx, hy, 1, hx, hy, hr);
  gr.addColorStop(0, "rgba(160,210,225,.85)");
  gr.addColorStop(1, "rgba(60,90,105,.25)");
  ctx.fillStyle = gr;
  ctx.beginPath(); ctx.arc(hx, hy, hr, 0, Math.PI * 2); ctx.fill();
  // 孔里那几个看不清的人形
  ctx.fillStyle = "rgba(20,26,32,.65)";
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.arc(hx + i * hr * 0.5, hy + hr * 0.15, hr * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(hx + i * hr * 0.5 - hr * 0.16, hy + hr * 0.30, hr * 0.32, hr * 0.40);
  }
  // 门牌
  ctx.fillStyle = "#7f8b98";
  ctx.font = Math.round(T * 0.10) + "px system-ui, sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("控制中心", 0, h * 0.34);
};

// 墙上的监视器
window.PROP_DRAW["screen151"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : 0) / 1000;
  ctx.fillStyle = "#14181e";
  ctx.fillRect(-T * 0.34, -T * 0.30, T * 0.68, T * 0.52);
  const a = 0.30 + 0.14 * Math.sin(t * 2.3 + p.x * 1.1);
  ctx.fillStyle = "rgba(70,180,205," + a.toFixed(3) + ")";
  ctx.fillRect(-T * 0.30, -T * 0.26, T * 0.60, T * 0.44);
  // 屏幕上滚动的几行波形
  ctx.strokeStyle = "rgba(200,240,250,.35)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= 10; i++) {
    const x = -T * 0.28 + i * (T * 0.056);
    const y = Math.sin(t * 3 + i * 0.8 + p.y) * T * 0.10;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
};

// 排队客：站在队伍里的人 —— 已经等了很久很久
window.PROP_DRAW["queue151"] = function (ctx, p, T) {
  const t = (typeof performance !== "undefined" ? performance.now() : 0) / 1000;
  const bob = Math.sin(t * 0.7 + p.y * 1.3) * T * 0.015;
  ctx.fillStyle = "rgba(0,0,0,.28)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.34, T * 0.16, T * 0.06, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#3a4450";                          // 身子
  ctx.fillRect(-T * 0.13, -T * 0.16 + bob, T * 0.26, T * 0.46);
  ctx.fillStyle = "#2b333d";                          // 腿
  ctx.fillRect(-T * 0.11, T * 0.28, T * 0.08, T * 0.10);
  ctx.fillRect(T * 0.03, T * 0.28, T * 0.08, T * 0.10);
  ctx.fillStyle = "#c3a888";                          // 头
  ctx.beginPath(); ctx.arc(0, -T * 0.26 + bob, T * 0.10, 0, Math.PI * 2); ctx.fill();
};

// 入口处的牌子
window.PROP_DRAW["sign151"] = function (ctx, p, T) {
  const w = T * 0.74, h = T * 0.30;
  ctx.fillStyle = "#20262e";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "rgba(90,220,240,.75)";
  ctx.font = Math.round(T * 0.14) + "px system-ui, sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("排队 · 352 人", 0, 0);
};

// ---------- 模拟内容：躺进去之前先挑一个，摘下之后可以重新挑 ----------
// 设备里什么都有 —— 你只要说出想要哪一种。
const SIM151_KINDS = [
  {
    id: "lvl2", name: "危险层级 2",
    tip: "锈蚀的管道、没有尽头的黑暗，和一直在你身后的脚步声",
    sky: ["#3a2416", "#120c08"], ink: "#e8a463", san: 1.5, hp: 0.8,
    surge: "管道里那东西终于转过身来 —— 你被甩出了模拟",
  },
  {
    id: "space", name: "太空探索",
    tip: "没有上下之分的黑，和一颗慢慢转过来的星球",
    sky: ["#131e46", "#02030a"], ink: "#9fd8ff", san: 3.4, hp: 1.4,
    surge: "舷窗外那颗星球转过来的是背面 —— 你被甩出了模拟",
  },
  {
    id: "game", name: "游戏世界",
    tip: "方块构成的天与地，一切都按格对齐",
    sky: ["#1e5c3a", "#082016"], ink: "#8dffb0", san: 2.4, hp: 2.0,
    surge: "画面卡住了，接着弹出一行红字 —— 你被甩出了模拟",
  },
  {
    id: "magic", name: "魔幻世界",
    tip: "会发光的森林，和一座浮在雾里的城堡",
    sky: ["#3d2263", "#110a24"], ink: "#d8acff", san: 3.0, hp: 1.6,
    surge: "森林里的光全灭了，只剩那座城堡还在看着你 —— 你被甩出了模拟",
  },
  {
    id: "zombie", name: "僵尸末日",
    tip: "塌了一半的城市，街上有东西在慢慢挪",
    sky: ["#2e3522", "#0b0d07"], ink: "#bcc97e", san: 1.2, hp: 1.0,
    surge: "街上那些东西同时转过头 —— 你被甩出了模拟",
  },
  {
    id: "front", name: "前厅",
    tip: "有风、有草、有太阳 —— 你差点就信了",
    sky: ["#8cc3ec", "#e6f4ff"], ink: "#fff3c4", san: 4.2, hp: 2.4,
    surge: "太阳突然暗了一下 —— 你被甩出了模拟",
  },
];
window.SIM151_KINDS = SIM151_KINDS;
window.sim151Kind = function (id) {
  for (const k of SIM151_KINDS) if (k.id === id) return k;
  return SIM151_KINDS[0];
};

// ---------- 正在模拟时，整个屏幕的样子（按挑中的内容各不相同） ----------
window.drawSimOverlay = function (g, ctx, W, H) {
  const s = g && g.sim151;
  if (!s) return;
  const K = window.sim151Kind(s.kind);
  const t = (typeof performance !== "undefined" ? performance.now() : 0) / 1000;

  // 底：这一片"天空"的颜色
  const gr = ctx.createLinearGradient(0, 0, W * 0.35, H);
  gr.addColorStop(0, K.sky[0]);
  gr.addColorStop(1, K.sky[1]);
  ctx.fillStyle = gr;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  if (s.kind === "lvl2") {
    // 锈蚀的管道：几根横贯全屏的粗管 + 法兰
    ctx.strokeStyle = "rgba(150,84,36,.55)"; ctx.lineWidth = Math.max(10, H * 0.045);
    for (let i = 0; i < 4; i++) {
      const y = H * (0.16 + i * 0.23) + Math.sin(t * 0.4 + i) * 3;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    ctx.fillStyle = "rgba(60,32,16,.75)";
    for (let i = 0; i < 5; i++) {
      const x = (i * 0.22 + 0.08) * W, y = H * 0.5 + Math.sin(i * 1.7) * H * 0.16;
      ctx.beginPath(); ctx.arc(x, y, Math.max(7, H * 0.028), 0, Math.PI * 2); ctx.fill();
    }
    // 黑暗里的一点手电光
    const lg = ctx.createRadialGradient(W * 0.5, H * 0.5, 1, W * 0.5, H * 0.5, Math.min(W, H) * 0.42);
    lg.addColorStop(0, "rgba(255,190,120,.18)"); lg.addColorStop(1, "rgba(0,0,0,.55)");
    ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);
  } else if (s.kind === "space") {
    // 星星
    ctx.fillStyle = "rgba(255,255,255,.85)";
    for (let i = 0; i < 90; i++) {
      const x = ((i * 97) % 1000) / 1000 * W, y = ((i * 613) % 1000) / 1000 * H;
      const a = 0.35 + 0.65 * Math.abs(Math.sin(t * 1.1 + i));
      ctx.globalAlpha = a; ctx.fillRect(x, y, 2, 2);
    }
    ctx.globalAlpha = 1;
    // 一颗慢慢转过来的星球
    const cx = W * 0.68, cy = H * 0.36, r = Math.min(W, H) * 0.22;
    const pg = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
    pg.addColorStop(0, "#6fa8d8"); pg.addColorStop(0.6, "#2b4a72"); pg.addColorStop(1, "#0a1220");
    ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(190,225,255,.35)"; ctx.lineWidth = Math.max(2, r * 0.06);
    ctx.beginPath(); ctx.ellipse(cx, cy, r * 1.45, r * 0.36, -0.4, 0, Math.PI * 2); ctx.stroke();
  } else if (s.kind === "game") {
    // 方块的世界：方格网 + 几朵方块云 + 脚下的方块地
    const g2 = Math.max(24, Math.min(W, H) / 14);
    ctx.strokeStyle = "rgba(140,255,170,.16)"; ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += g2) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y <= H; y += g2) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.fillStyle = "rgba(120,230,150,.55)";
    for (let i = 0; i < 4; i++) {
      const bx = ((i * 0.26 + t * 0.02) % 1.2 - 0.1) * W, by = H * (0.14 + (i % 2) * 0.12);
      for (let k = 0; k < 3; k++) ctx.fillRect(bx + k * g2, by, g2, g2);
      ctx.fillRect(bx + g2, by - g2, g2, g2);
    }
    ctx.fillStyle = "rgba(60,140,80,.75)"; ctx.fillRect(0, H * 0.72, W, H * 0.28);
    ctx.fillStyle = "rgba(40,100,58,.9)";
    for (let x = 0; x < W; x += g2) ctx.fillRect(x, H * 0.72, g2 * 0.9, g2 * 0.9);
  } else if (s.kind === "magic") {
    // 会发光的森林 + 雾里那座城堡
    ctx.fillStyle = "rgba(20,10,36,.85)"; ctx.fillRect(0, H * 0.62, W, H * 0.38);
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 26; i++) {
      const x = ((i * 137) % 100) / 100 * W;
      const y = H * (0.66 + ((i * 53) % 100) / 100 * 0.3);
      const a = 0.25 + 0.45 * Math.abs(Math.sin(t * 0.9 + i));
      const rg = ctx.createRadialGradient(x, y, 1, x, y, Math.max(10, H * 0.05));
      rg.addColorStop(0, "rgba(200,150,255," + a.toFixed(3) + ")");
      rg.addColorStop(1, "rgba(200,150,255,0)");
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(x, y, Math.max(10, H * 0.05), 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    // 城堡：三座塔的剪影
    const bx = W * 0.5, by = H * 0.62, bw = Math.min(W, H) * 0.34;
    ctx.fillStyle = "rgba(12,6,24,.92)";
    ctx.fillRect(bx - bw / 2, by - bw * 0.5, bw, bw * 0.5);
    for (const o of [-0.32, 0, 0.32]) {
      const tx = bx + bw * o, tw = bw * 0.18, th = bw * (o === 0 ? 0.78 : 0.6);
      ctx.fillRect(tx - tw / 2, by - th, tw, th);
      ctx.beginPath(); ctx.moveTo(tx - tw * 0.8, by - th);
      ctx.lineTo(tx, by - th - tw * 0.9); ctx.lineTo(tx + tw * 0.8, by - th); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = "rgba(255,225,140,.75)";
    for (let i = 0; i < 6; i++) {
      const wx = bx + bw * (-0.3 + i * 0.12), wy = by - bw * 0.28;
      ctx.fillRect(wx, wy, Math.max(3, bw * 0.035), Math.max(4, bw * 0.05));
    }
  } else if (s.kind === "zombie") {
    // 塌了一半的城市
    ctx.fillStyle = "rgba(46,52,34,.9)";
    for (let i = 0; i < 9; i++) {
      const bw2 = W * 0.09, x = i * (W / 9);
      const bh = H * (0.16 + ((i * 71) % 100) / 100 * 0.34);
      ctx.fillRect(x, H * 0.64 - bh, bw2 * 0.86, bh);
    }
    ctx.fillStyle = "rgba(24,26,16,.95)"; ctx.fillRect(0, H * 0.64, W, H * 0.36);
    // 街上慢慢挪的东西
    ctx.fillStyle = "rgba(150,165,95,.8)";
    for (let i = 0; i < 5; i++) {
      const x = ((i * 0.21 + t * 0.012) % 1.1 - 0.05) * W, y = H * (0.74 + (i % 3) * 0.06);
      const sw = Math.max(4, H * 0.022);
      ctx.fillRect(x, y, sw, sw * 2.1);
      ctx.beginPath(); ctx.arc(x + sw / 2, y - sw * 0.45, sw * 0.55, 0, Math.PI * 2); ctx.fill();
    }
    // 一层血色的雾
    const fg = ctx.createLinearGradient(0, H * 0.3, 0, H);
    fg.addColorStop(0, "rgba(120,20,20,0)"); fg.addColorStop(1, "rgba(120,20,20,.28)");
    ctx.fillStyle = fg; ctx.fillRect(0, 0, W, H);
  } else {
    // 前厅：天、太阳、草、云
    ctx.fillStyle = "#bfe4f7"; ctx.fillRect(0, 0, W, H * 0.62);
    ctx.fillStyle = "#5d9c4a"; ctx.fillRect(0, H * 0.62, W, H * 0.38);
    ctx.fillStyle = "#fff6cf";
    ctx.beginPath(); ctx.arc(W * 0.78, H * 0.16, Math.max(16, H * 0.07), 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.85)";
    for (let i = 0; i < 3; i++) {
      const cx2 = ((i * 0.3 + t * 0.015) % 1.2 - 0.1) * W, cy2 = H * (0.1 + i * 0.09);
      const cw = W * 0.09, ch = H * 0.035;
      ctx.beginPath(); ctx.ellipse(cx2, cy2, cw, ch, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx2 - cw * 0.5, cy2 + ch * 0.3, cw * 0.6, ch * 0.7, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = "rgba(70,120,55,.55)"; ctx.lineWidth = 2;
    for (let i = 0; i < 40; i++) {
      const x = ((i * 173) % 100) / 100 * W, y = H * (0.66 + ((i * 91) % 100) / 100 * 0.3);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.sin(t + i) * 4, y - H * 0.035); ctx.stroke();
    }
  }
  ctx.restore();

  // 提示：正在模拟什么、怎么出来
  ctx.fillStyle = "rgba(8,12,16,.74)";
  ctx.fillRect(W / 2 - Math.min(300, W * 0.44), H - 100, Math.min(600, W * 0.88), 48);
  ctx.fillStyle = K.ink;
  ctx.font = "bold 15px system-ui, sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("模拟中 —— " + K.name + " · " + K.tip, W / 2, H - 86);
  ctx.fillStyle = "#dff6ff";
  ctx.font = "13px system-ui, sans-serif";
  ctx.fillText("按 E 自己摘下设备（只有自己愿意摘，才是安全的）", W / 2, H - 64);
};

// ---------- 每帧 ----------
const SIM151_SURGE = [
  "整个层级的功率突然激增 —— 你被猛地甩出了模拟",
  "眼前一黑。40 个小时的噩梦压缩成了一瞬间",
  "设备在你头上炸开 —— 你被关进了一间什么都没有的黑屋子",
];
window.__LEVEL_TICK = window.__LEVEL_TICK || {};
window.__LEVEL_TICK["15.1"] = function (g, dt) {
  const T = (typeof TILE === "number" ? TILE : 40);
  // 这一层诱发敌意：待久了人会变得易怒、多疑
  g.sanity = Math.max(0, g.sanity - 0.42 * dt);

  const s = g.sim151;
  if (!s) return;
  const K = window.sim151Kind(s.kind);
  s.t += dt;
  // 人在舱里，动不了
  g.player.x = s.px; g.player.y = s.py;
  // 模拟里什么都有 —— 理智和体力都在回升，这就是没人愿意出来的原因。
  // 不同的"里头"升得不一样快：前厅回得最多，危险层级几乎不回。
  g.sanity = Math.min(100, g.sanity + K.san * dt);
  g.hp = Math.min(CONFIG.HP_MAX, g.hp + K.hp * dt);

  // 等不及的人（掠夺者）会直接把设备拽下来 —— 那一刻就是脑死亡
  for (const e of (g.entities || [])) {
    if (Math.hypot(e.x - s.px, e.y - s.py) < T * 1.8) {
      g.sim151 = null;
      g.hp = 0;
      g.deathCause = "在模拟里被强行摘下了设备 —— 即刻脑死亡";
      return;
    }
  }

  // 功率激增：2024 年那次事件之后，M.E.G 说它还会再发生
  if (!s.next) s.next = 18 + Math.random() * 14;
  if (s.t > s.next) {
    s.next = s.t + 18 + Math.random() * 14;
    g.sanity = Math.max(0, g.sanity - 30);
    g.hp = Math.max(0, g.hp - 25);
    if (typeof window.__toast === "function") {
      window.__toast(K.surge + "（" + K.name + "）");
    }
    if (Math.random() < 0.35) {
      g.sim151 = null;
      g.hp = 0;
      g.deathCause = "功率激增 —— 死在了模拟黑室里";
    }
  }
};
