// ===========================================================
// Level 40 —— 摇滚披萨！
//   一间无限大的 1980 年代中后期游戏厅。到处都写着它的名字：摇滚披萨！
//   脚下的地毯是深蓝色的，上面印满行星和恒星；墙是混凝土的，
//   画着宇宙飞船和宇航员。食品上都抹着一种青柠色、微微发光的
//   「Starflare 上将通用酱汁」—— 广告说它能还原任何一种食物的味道。
//   街机能玩，但有些机子由「消费者」控制着 —— 别去碰正在被用的机器。
//   有些游戏根本不存在于前厅：撞击者 2、太空探索者、跌落尽头、
//   压轴好戏！！！、Starflare 上将：狂野太空。
//     · 深玩 Starflare 上将：狂野太空的人，会一点点无视周围，最后整消失。
//   最里面是一间装旋转门的出口大厅 —— 穿什么衣服出去，决定了你去哪一层：
//     流浪者 / 全封闭防护服 → Level 11
//     生化防护服           → Level 9
//     发电站检修服         → Level 10
//   还有一扇生锈的金属门，通向 Level 1。
// ===========================================================
"use strict";

(function () {
  // 深蓝霓虹地毯 / 混凝土墙 / 青柠色酱汁
  const v = ["#1b2a5e", "#6b6f78", "#b8e04a"];
  if (typeof regTile === "function") regTile("rock40", v);
  else { (window.__NEWTILE_EXTRA = window.__NEWTILE_EXTRA || {})["rock40"] = v; }
})();

function generateRock40Map(level) {
  const size = 90;
  const grid = makeGrid(size);
  const props = [];
  const floors = [];
  const carve = (x, y) => {
    if (x > 0 && y > 0 && x < size - 1 && y < size - 1) grid[y][x] = 0;
  };
  const cy = Math.floor(size / 2);
  const cx = Math.floor(size / 2);

  // ---------- 主厅：横贯整层的一大片 ----------
  const X0 = 5, X1 = size - 6, Y0 = 5, Y1 = size - 6;
  for (let y = Y0; y <= Y1; y++) for (let x = X0; x <= X1; x++) carve(x, y);

  // ---------- 保龄球场：右侧一块，用墙隔开，留两个口 ----------
  const BW0 = Math.floor(size * 0.68);
  for (let y = Y0; y <= Y1; y++) {
    if (y >= cy - 2 && y <= cy + 2) continue;
    grid[y][BW0] = 1;
  }

  // ---------- 办公室门厅 / 仓库：左下角一小块 ----------
  const OFF = { x0: X0 + 1, y0: Y1 - 12, x1: X0 + 16, y1: Y1 - 1 };
  for (let y = OFF.y0; y <= OFF.y1; y++) for (let x = OFF.x0; x <= OFF.x1; x++) carve(x, y);
  for (let x = OFF.x0; x <= OFF.x1; x++) if (x !== OFF.x0 + 4) grid[OFF.y0][x] = 1;
  for (let y = OFF.y0; y <= OFF.y1; y++) if (y !== OFF.y0 + 3) grid[y][OFF.x1] = 1;

  // ---------- 出口大厅（旋转门）：最上面 ----------
  const EX = { x0: cx - 8, y0: Y0 - 4, x1: cx + 8, y1: Y0 - 1 };
  for (let y = Math.max(2, EX.y0); y <= EX.y1; y++) for (let x = EX.x0; x <= EX.x1; x++) carve(x, y);
  for (let x = EX.x0; x <= EX.x1; x++) carve(x, EX.y1 + 1);   // 接通主厅

  collectFloorsInto40(grid, size, floors);

  const start = { x: X0 + 2, y: cy, floor: 0 };

  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return null;
    if (grid[y][x] !== 0) return null;
    const p = Object.assign({ x, y, floor: 0, type }, extra || {});
    props.push(p);
    return p;
  };

  // ---------- 前台：Pat ----------
  put(X0 + 3, cy - 3, "p40pat");
  put(X0 + 3, cy - 2, "p40desk");

  // ---------- 街机：一排排铺开 ----------
  const NORMAL = ["城市大金刚", "爆破彗星", "太空侵略者", "保卫者", "机器人大战：2084", "鸵鸟骑士", "圣铠传说 2"];
  const WEIRD = ["撞击者 2", "太空探索者", "跌落尽头", "压轴好戏！！！", "Starflare 上将：狂野太空"];
  for (let i = 0; i < 40; i++) {
    const gx = X0 + 6 + (i % 10) * 4;
    const gy = Y0 + 3 + Math.floor(i / 10) * 6;
    if (gx > BW0 - 3) continue;
    const weird = i % 5 === 4;
    put(gx, gy, "p40arcade", {
      game: weird ? WEIRD[i % WEIRD.length] : NORMAL[i % NORMAL.length],
      weird,
      // 一部分机子正被「消费者」用着 —— 碰它会眩晕昏迷
      busy: (i % 7) === 3,
    });
  }

  // ---------- 自动售货机（抹着酱汁的食物） ----------
  for (let i = 0; i < 8; i++) {
    put(X0 + 4 + (i % 2) * 3, Y0 + 5 + Math.floor(i / 2) * 9, "p40vend");
  }
  // ---------- 电视台（播着那些古怪的广告） ----------
  for (let i = 0; i < 5; i++) put(X0 + 8 + i * 8, Y1 - 3, "p40tv", { ad: i });

  // ---------- 保龄球场 ----------
  for (let i = 0; i < 5; i++) {
    put(BW0 + 3, Y0 + 4 + i * 8, "p40lane");
    put(BW0 + 12, Y0 + 4 + i * 8, "p40pins");
    put(BW0 + 2, Y0 + 5 + i * 8, "p40ball");
  }
  put(X1 - 2, cy, "p40score");

  // ---------- 办公室门厅 / 卫生间 / 仓库 ----------
  put(OFF.x0 + 2, OFF.y0 + 1, "p40office");
  put(OFF.x0 + 6, OFF.y0 + 1, "p40restroom");
  put(OFF.x1 - 2, OFF.y1 - 2, "p40storage");

  // ---------- 出口 ----------
  put(cx, EX.y0 + 1, "p40revolving");            // 旋转门（按服装决定去处）
  put(X1 - 2, Y1 - 2, "p40rusty", { toLevel: 1 });   // 生锈的金属门 → Level 1

  return {
    size, level: 40, doubleStory: false,
    layers: [grid], grid, rooms: [[]], floors: [floors],
    start, exit: null, doors: [], ramps: [],
    props, crates: [], ground: [],

    style: "rock40", tileName: "rock40",
    bowlRect: { x0: BW0 + 1, y0: Y0, x1: X1, y1: Y1 },
    exitRect: EX,
  };
}
window.generateRock40Map = generateRock40Map;

function collectFloorsInto40(grid, size, out) {
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    if (grid[y][x] === 0) out.push({ x, y });
  }
  return out;
}

// ---------------- 地面：深蓝霓虹地毯（行星 + 恒星） ----------------
window.drawRock40Floor = function (ctx, px, py, S, map, tx, ty) {
  ctx.fillStyle = "#1b2a5e";
  ctx.fillRect(px, py, S, S);
  // 地毯上的星图：恒星是亮点，行星是一个个圈
  const n = (tx * 31 + ty * 17) % 7;
  if (n === 0) {
    ctx.fillStyle = "rgba(255,240,180,.85)";
    ctx.beginPath(); ctx.arc(px + S * 0.5, py + S * 0.5, 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(255,240,180,.25)"; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px + S * 0.5 - 4, py + S * 0.5); ctx.lineTo(px + S * 0.5 + 4, py + S * 0.5);
    ctx.moveTo(px + S * 0.5, py + S * 0.5 - 4); ctx.lineTo(px + S * 0.5, py + S * 0.5 + 4);
    ctx.stroke();
  } else if (n === 3) {
    ctx.strokeStyle = "rgba(120,180,255,.45)"; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(px + S * 0.5, py + S * 0.5, S * 0.22, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "rgba(200,140,80,.55)";
    ctx.beginPath(); ctx.arc(px + S * 0.5, py + S * 0.5, S * 0.10, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.fillStyle = "rgba(255,255,255,.04)";
    ctx.fillRect(px + S * 0.3, py + S * 0.3, S * 0.4, S * 0.4);
  }
  return true;
};

// ---------------- 墙：混凝土 + 宇宙飞船与宇航员 ----------------
window.drawRock40Wall = function (ctx, px, py, S, map, tx, ty) {
  ctx.fillStyle = "#6b6f78";
  ctx.fillRect(px, py, S, S);
  // 混凝土的斑驳
  ctx.fillStyle = "rgba(255,255,255,.06)";
  ctx.fillRect(px + 2, py + 2, S * 0.4, S * 0.3);
  ctx.fillStyle = "rgba(0,0,0,.10)";
  ctx.fillRect(px + S * 0.55, py + S * 0.5, S * 0.35, S * 0.35);
  // 墙上的图案：飞船 / 宇航员（按格子交替）
  const n = (tx * 13 + ty * 7) % 5;
  if (n === 0) {
    // 宇宙飞船
    ctx.fillStyle = "rgba(230,240,255,.55)";
    ctx.beginPath();
    ctx.moveTo(px + S * 0.5, py + S * 0.28);
    ctx.lineTo(px + S * 0.68, py + S * 0.62);
    ctx.lineTo(px + S * 0.32, py + S * 0.62);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "rgba(255,180,60,.7)";
    ctx.fillRect(px + S * 0.44, py + S * 0.62, S * 0.12, S * 0.12);
  } else if (n === 2) {
    // 宇航员：头盔 + 身体
    ctx.fillStyle = "rgba(235,240,250,.5)";
    ctx.beginPath(); ctx.arc(px + S * 0.5, py + S * 0.38, S * 0.15, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(px + S * 0.38, py + S * 0.55, S * 0.24, S * 0.26);
    ctx.fillStyle = "rgba(120,200,255,.6)";
    ctx.fillRect(px + S * 0.43, py + S * 0.36, S * 0.14, S * 0.06);
  }
  return true;
};

// ---------------- 环境：霓虹 + 广告的蓝光 ----------------
window.drawRock40 = function (ctx, g) {
  const cw = (ctx.canvas && ctx.canvas.width) || 800;
  const ch = (ctx.canvas && ctx.canvas.height) || 600;
  const t = performance.now() / 1000;
  ctx.save();
  try { ctx.setTransform(1, 0, 0, 1, 0, 0); } catch (e) { /* 忽略 */ }
  // 街机屏幕的彩光（一层淡淡的光晕，保证画面不黑）
  const gr = ctx.createRadialGradient(cw * 0.5, ch * 0.55, ch * 0.15, cw * 0.5, ch * 0.55, ch * 0.95);
  gr.addColorStop(0, "rgba(90,140,255,0)");
  gr.addColorStop(1, "rgba(40,60,140,.20)");
  ctx.fillStyle = gr;
  ctx.fillRect(0, 0, cw, ch);
  // 霓虹招牌一明一暗
  const f = 0.05 + 0.03 * Math.sin(t * 2.2);
  ctx.fillStyle = "rgba(255,120,200," + f.toFixed(3) + ")";
  ctx.fillRect(0, 0, cw, ch);
  ctx.restore();
};

// ---------------- 物件 ----------------
window.PROP_DRAW = window.PROP_DRAW || {};

// 街机
window.PROP_DRAW["p40arcade"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  const t = performance.now() / 1000;
  ctx.fillStyle = p.weird ? "#4a3a5e" : "#3a4a6e";
  ctx.fillRect(x + T * 0.16, y + T * 0.06, T * 0.68, T * 0.88);
  // 屏幕
  ctx.fillStyle = "#0d0d16";
  ctx.fillRect(x + T * 0.24, y + T * 0.14, T * 0.52, T * 0.34);
  const cols = ["#ff5a7a", "#5ad0ff", "#a8ff5a", "#ffd24a", "#c07aff"];
  const ci = (p.x + Math.floor(t * 3)) % cols.length;
  ctx.fillStyle = cols[ci];
  const bx = x + T * 0.28 + ((Math.floor(t * 4) % 3) * T * 0.14);
  const by = y + T * 0.20 + ((Math.floor(t * 2.5) % 3) * T * 0.09);
  ctx.fillRect(bx, by, T * 0.10, T * 0.08);
  // 摇杆 + 按钮
  ctx.fillStyle = "#e05a5a";
  ctx.beginPath(); ctx.arc(x + T * 0.34, y + T * 0.62, T * 0.06, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#5a9ae0";
  ctx.beginPath(); ctx.arc(x + T * 0.54, y + T * 0.62, T * 0.06, 0, Math.PI * 2); ctx.fill();
  // 正被「消费者」用着的机器：屏幕上会闪一行乱字符
  if (p.busy) {
    ctx.fillStyle = "rgba(184,224,74," + (0.35 + 0.3 * Math.sin(t * 8)).toFixed(2) + ")";
    ctx.font = Math.max(5, Math.floor(T * 0.14)) + "px monospace";
    ctx.textAlign = "center";
    ctx.fillText("#@!?", x + T / 2, y + T * 0.32);
    ctx.textAlign = "left";
  }
  // 「暂停服务」的纸条
  if (p.busy && ((p.x + p.y) % 3) === 0) {
    ctx.fillStyle = "#f0ece0";
    ctx.fillRect(x + T * 0.26, y + T * 0.74, T * 0.48, T * 0.12);
    ctx.fillStyle = "#2a2a34";
    ctx.fillRect(x + T * 0.30, y + T * 0.78, T * 0.40, 2);
  }
};

// 自动售货机（食物上都抹着青柠色的酱汁）
window.PROP_DRAW["p40vend"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  const t = performance.now() / 1000;
  ctx.fillStyle = "#8e949b";
  ctx.fillRect(x + T * 0.14, y + T * 0.08, T * 0.72, T * 0.86);
  ctx.fillStyle = "#20304a";
  ctx.fillRect(x + T * 0.22, y + T * 0.16, T * 0.56, T * 0.48);
  // 货架上的食物：都泛着青柠色的光
  const gl = 0.45 + 0.25 * Math.sin(t * 2 + p.x);
  ctx.fillStyle = "rgba(184,224,74," + gl.toFixed(2) + ")";
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(x + T * 0.26, y + T * 0.20 + i * T * 0.14, T * 0.48, T * 0.09);
  }
  // 酱汁上的星状亮斑
  ctx.fillStyle = "rgba(255,255,255,.7)";
  ctx.beginPath(); ctx.arc(x + T * 0.40, y + T * 0.24, 1.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + T * 0.62, y + T * 0.38, 1.2, 0, Math.PI * 2); ctx.fill();
  // 取货口
  ctx.fillStyle = "#15151e";
  ctx.fillRect(x + T * 0.22, y + T * 0.70, T * 0.56, T * 0.16);
};

// 电视台（播着那些随机又怪诞的广告）
window.PROP_DRAW["p40tv"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  const t = performance.now() / 1000;
  ctx.fillStyle = "#2a2a34";
  ctx.fillRect(x + T * 0.10, y + T * 0.12, T * 0.80, T * 0.76);
  const ads = ["#b8e04a", "#ff7a4a", "#4ac0e0", "#e04ab8", "#e0d24a"];
  ctx.fillStyle = ads[(p.ad || 0) % ads.length];
  ctx.fillRect(x + T * 0.16, y + T * 0.18, T * 0.68, T * 0.56);
  // 屏幕上的雪花 / 字幕条
  ctx.fillStyle = "rgba(0,0,0,.25)";
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(x + T * 0.16, y + T * 0.20 + i * T * 0.10, T * 0.68, 2);
  }
  // 广告播到一半会突然黑屏中断
  if (Math.sin(t * 0.6 + (p.ad || 0)) > 0.9) {
    ctx.fillStyle = "#0a0a10";
    ctx.fillRect(x + T * 0.16, y + T * 0.18, T * 0.68, T * 0.56);
  }
  ctx.fillStyle = "#5a5a66";
  ctx.fillRect(x + T * 0.42, y + T * 0.88, T * 0.16, T * 0.10);
};

// 前台：Pat（高瘦、棒球帽、扣好的亮蓝衬衫、四只胳膊）
window.PROP_DRAW["p40pat"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  const t = performance.now() / 1000;
  // 被拉长的人形：很高很瘦
  ctx.fillStyle = "#2f6fd0";
  ctx.fillRect(x + T * 0.30, y + T * 0.30, T * 0.40, T * 0.58);   // 亮蓝衬衫
  ctx.fillStyle = "#e8d0b0";
  ctx.fillRect(x + T * 0.36, y + T * 0.16, T * 0.28, T * 0.18);    // 脸
  ctx.fillStyle = "#c94f4f";
  ctx.fillRect(x + T * 0.32, y + T * 0.10, T * 0.36, T * 0.09);    // 棒球帽
  ctx.fillStyle = "#a03a3a";
  ctx.fillRect(x + T * 0.62, y + T * 0.16, T * 0.16, T * 0.04);    // 帽檐
  // 四只胳膊
  ctx.fillStyle = "#2f6fd0";
  const sw = 0.10 + 0.03 * Math.sin(t * 1.2);
  ctx.fillRect(x + T * 0.16, y + T * 0.36, T * 0.14, T * 0.06 + sw * T * 0.02);
  ctx.fillRect(x + T * 0.70, y + T * 0.36, T * 0.14, T * 0.06);
  ctx.fillRect(x + T * 0.18, y + T * 0.54, T * 0.14, T * 0.06);
  ctx.fillRect(x + T * 0.68, y + T * 0.54, T * 0.14, T * 0.06);
  ctx.fillStyle = "#e8d0b0";
  ctx.beginPath(); ctx.arc(x + T * 0.14, y + T * 0.39, 2.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + T * 0.86, y + T * 0.39, 2.4, 0, Math.PI * 2); ctx.fill();
};
window.PROP_DRAW["p40desk"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#8a6a44";
  ctx.fillRect(x + T * 0.06, y + T * 0.44, T * 0.88, T * 0.48);
  ctx.fillStyle = "#c9a06a";
  ctx.fillRect(x + T * 0.06, y + T * 0.44, T * 0.88, 3);
};

// 保龄球道 / 球瓶 / 球
window.PROP_DRAW["p40lane"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#d8b878";
  ctx.fillRect(x, y + T * 0.10, T * 3, T * 0.80);
  ctx.fillStyle = "rgba(120,80,40,.30)";
  ctx.fillRect(x, y + T * 0.10, T * 3, 2);
  ctx.fillRect(x, y + T * 0.88, T * 3, 2);
};
window.PROP_DRAW["p40pins"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#f4f0e4";
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j <= i; j++) {
      const px = x + T * (0.2 + j * 0.22) - i * T * 0.10;
      const py = y + T * (0.20 + i * 0.16);
      ctx.fillRect(px, py, T * 0.10, T * 0.20);
      ctx.fillStyle = "#c94f4f";
      ctx.fillRect(px, py + T * 0.04, T * 0.10, 2);
      ctx.fillStyle = "#f4f0e4";
    }
  }
};
window.PROP_DRAW["p40ball"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#20203a";
  ctx.beginPath(); ctx.arc(x + T * 0.5, y + T * 0.5, T * 0.28, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.20)";
  ctx.beginPath(); ctx.arc(x + T * 0.42, y + T * 0.42, T * 0.08, 0, Math.PI * 2); ctx.fill();
};
// 竞赛排行榜（用户名由随机的数字字母构成，有些长到把屏幕撑崩）
window.PROP_DRAW["p40score"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  const t = performance.now() / 1000;
  ctx.fillStyle = "#15151e";
  ctx.fillRect(x + T * 0.10, y + T * 0.06, T * 0.80, T * 0.88);
  const dead = Math.sin(t * 0.4 + p.x) > 0.93;
  ctx.fillStyle = dead ? "#ff4040" : "#b8e04a";
  ctx.font = Math.max(4, Math.floor(T * 0.10)) + "px monospace";
  ctx.textAlign = "left";
  const name = dead ? "ERR" : "X7QK2Z";
  ctx.fillText(name, x + T * 0.16, y + T * 0.26);
  ctx.fillText(dead ? "-----" : "9Q4TZ8", x + T * 0.16, y + T * 0.46);
  ctx.fillText(dead ? "" : "M2X8P1", x + T * 0.16, y + T * 0.66);
  ctx.textAlign = "left";
};

// 办公室门 / 卫生间 / 仓库
window.PROP_DRAW["p40office"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#8a6a44";
  ctx.fillRect(x + T * 0.12, y + T * 0.08, T * 0.76, T * 0.86);
  ctx.fillStyle = "#c9a06a";
  ctx.fillRect(x + T * 0.18, y + T * 0.16, T * 0.64, T * 0.70);
};
window.PROP_DRAW["p40restroom"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#5a6a7a";
  ctx.fillRect(x + T * 0.14, y + T * 0.10, T * 0.72, T * 0.82);
  ctx.fillStyle = "#cfe0ea";
  ctx.fillRect(x + T * 0.22, y + T * 0.20, T * 0.30, T * 0.24);   // 镜子
  ctx.fillStyle = "#f0ece0";
  ctx.fillRect(x + T * 0.56, y + T * 0.24, T * 0.20, T * 0.16);
};
window.PROP_DRAW["p40storage"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#6a6258";
  ctx.fillRect(x + T * 0.10, y + T * 0.14, T * 0.80, T * 0.78);
  // 堆着的糟糕食品和玩具
  ctx.fillStyle = "#b8e04a";
  ctx.fillRect(x + T * 0.16, y + T * 0.44, T * 0.24, T * 0.20);
  ctx.fillStyle = "#c94f4f";
  ctx.fillRect(x + T * 0.44, y + T * 0.50, T * 0.20, T * 0.18);
  ctx.fillStyle = "#e0c04a";
  ctx.fillRect(x + T * 0.64, y + T * 0.40, T * 0.20, T * 0.24);
};

// 旋转门（出口大厅）
window.PROP_DRAW["p40revolving"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  const t = performance.now() / 1000;
  // 圆形的外框
  ctx.strokeStyle = "#9aa4b0"; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(x + T / 2, y + T / 2, T * 0.44, 0, Math.PI * 2); ctx.stroke();
  // 里面四片会转的门扇
  ctx.fillStyle = "rgba(200,230,255,.35)";
  for (let i = 0; i < 4; i++) {
    const a = t * 0.9 + i * (Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(x + T / 2, y + T / 2);
    ctx.lineTo(x + T / 2 + Math.cos(a) * T * 0.42, y + T / 2 + Math.sin(a) * T * 0.42);
    ctx.lineWidth = 3; ctx.strokeStyle = "rgba(190,225,255,.55)";
    ctx.stroke();
  }
  // 门楣上写着 EXIT
  ctx.fillStyle = "#7aff9a";
  ctx.font = Math.max(6, Math.floor(T * 0.18)) + "px monospace";
  ctx.textAlign = "center";
  ctx.fillText("EXIT", x + T / 2, y - 3);
  ctx.textAlign = "left";
};

// 生锈的金属门 → Level 1
window.PROP_DRAW["p40rusty"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#7a5a42";
  ctx.fillRect(x + T * 0.12, y + T * 0.06, T * 0.76, T * 0.88);
  ctx.fillStyle = "#96684a";
  ctx.fillRect(x + T * 0.18, y + T * 0.14, T * 0.64, T * 0.74);
  // 锈斑
  ctx.fillStyle = "rgba(150,80,40,.45)";
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(x + T * (0.22 + (i % 3) * 0.20), y + T * (0.20 + Math.floor(i / 3) * 0.30), T * 0.12, T * 0.14);
  }
  ctx.fillStyle = "#c9c4b0";
  ctx.beginPath(); ctx.arc(x + T * 0.72, y + T * 0.52, 2.6, 0, Math.PI * 2); ctx.fill();
};
