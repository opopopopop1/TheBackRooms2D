// ===========================================================
// Level 94 —— 动画
//   一座大镇子、一座悬浮的城堡、长满草的山丘。
//   这里的一切都受到某种颗粒化的影响 —— 看上去像是被精心制作出来的，
//   有种定格动画的感觉。
//   ------------------------------------------------------------------
//     主 镇     —— 20 世纪 30 年代的风格。中心是一座大喷泉，里面流淌着
//                  杏仁水。镇上有小房子，里面摆着同样小的家具（30~50 年代）。
//                  还有那个年代的车、装满杏仁奶的送奶车，以及不时播放
//                  欢快卡通音乐的大喇叭。白天没有实体出没 —— 一切无害。
//     草 地 山 丘 —— 无限延伸。只有几辆停在中央的古怪汽车和一座水塔（杏仁水）。
//                  奇怪的是，这里能找到随机的成套家具、单间的房子，
//                  有时甚至只是一面旁边摆着家具的墙。
//     透明山城堡 —— 这一层真正致幻的地方（带上杏仁水）。
//                  里面的房间主题非常欢快：海洋球坑、游乐场，还有一间
//                  动画工作室 —— 里面有一个微型的城镇和其中实体的复制品。
//                  唯一的实体是「机器人」：30 年代的老式机器人玩具。
//                  它们像是城堡的守卫 —— 发现你跟城堡里的任何东西互动，
//                  就会对你产生敌意。
//     觐 见 室   —— 探索得够久，会找到一扇宏伟的大门。里面是「王」。
//                  他起初看起来没有敌意 —— 实际上他能把你变成「动画」的一部分。
//                  在那之前他会先考验你一次：一场以动画形式让你感受自己
//                  噩梦的考验。通过了，他就放出一阵光，把你送回镇上，
//                  或者送到某个主要层级去。
//   ------------------------------------------------------------------
//   天一黑，音乐就完全停止。「动画」开始出现，被它发现会遭到猛烈攻击。
//   夜里一同出没的还有笑魇、窃皮者、猎犬和雄性的死亡飞蛾。
//   尸鼠也有 —— 但在这种定格动画的风格下，它们已经进化得和普通老鼠一样了。
//   （因为「动画」会攻击任何看起来不是动画风的东西。）
// ===========================================================
"use strict";

(function () {
  // 草地绿 / 镇上的路面 / 城堡的暖石色
  const v = ["#8fc46a", "#b8a888", "#d8c8a0"];
  if (typeof regTile === "function") regTile("anime94", v);
  else { (window.__NEWTILE_EXTRA = window.__NEWTILE_EXTRA || {})["anime94"] = v; }
})();

// 白天 → 黄昏 → 夜晚：一轮 100 秒（白天 58 秒、黄昏 12 秒、夜晚 30 秒）
function a94Phase(map, now) {
  const t = ((now || 0) - ((map && map.a94t0) || 0)) / 1000;
  const cyc = t % 100;
  if (cyc < 58) return { name: "day", k: 0 };
  if (cyc < 70) return { name: "dusk", k: (cyc - 58) / 12 };
  return { name: "night", k: 1 };
}
window.a94Phase = a94Phase;

function generateAnime94Map(level) {
  const size = 100;
  const grid = makeGrid(size);
  const props = [];
  const floors = [];
  const carve = (x, y) => {
    if (x > 0 && y > 0 && x < size - 1 && y < size - 1) grid[y][x] = 0;
  };

  // ---------- 三大块：城堡（上）→ 草地山丘（中）→ 主镇（下） ----------
  const TOWN_Y0 = Math.floor(size * 0.68);      // 主镇
  const HILL_Y1 = TOWN_Y0 - 3;                  // 草地山丘
  const CASTLE_Y1 = Math.floor(size * 0.26);    // 透明山 + 城堡

  // 全图先铺草地（山丘）。
  // 注意：以前只铺到 HILL_Y1（= TOWN_Y0 - 3），中间空出来的那两行是墙，
  // 镇子和山丘就此断开 —— 整层 68% 走不到。一直铺到 TOWN_Y0 才连得上。
  for (let y = 3; y <= TOWN_Y0; y++) for (let x = 3; x < size - 3; x++) carve(x, y);

  // 主镇：铺成路面
  for (let y = TOWN_Y0; y < size - 3; y++) for (let x = 3; x < size - 3; x++) carve(x, y);

  // 山丘与镇子之间留一条窄的通路（不是墙，是两条斜坡道口）
  // 这里两侧都是可走的，中间不设障碍 —— 只靠"山丘的草"和"镇子的路"区分视觉。
  // 透明山：最上面的一块平台（城堡的地基）—— 中间留两条坡道上去
  for (let y = 4; y <= CASTLE_Y1; y++) {
    for (let x = Math.floor(size * 0.30); x < Math.floor(size * 0.70); x++) carve(x, y);
  }
  // 两条坡道：从山丘通上透明山
  const cx = Math.floor(size / 2);
  for (let i = 0; i < 12; i++) {
    carve(Math.floor(size * 0.34) - 1, CASTLE_Y1 + 1 + i);
    carve(Math.floor(size * 0.66) + 1, CASTLE_Y1 + 1 + i);
  }
  // 坡道要接到山丘上（竖直方向一路挖通）
  for (let y = CASTLE_Y1 + 1; y <= HILL_Y1; y++) {
    carve(Math.floor(size * 0.34) - 1, y);
    carve(Math.floor(size * 0.66) + 1, y);
  }

  collectFloorsInto94(grid, size, floors);

  // 出生点：镇子中心（喷泉边上）
  const start = { x: cx, y: TOWN_Y0 + 4, floor: 0 };

  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return null;
    if (grid[y][x] !== 0) return null;
    const p = Object.assign({ x, y, floor: 0, type }, extra || {});
    props.push(p);
    return p;
  };

  // ================= 主镇 =================
  // 中心的喷泉：里面流淌着杏仁水
  put(cx, TOWN_Y0 + 3, "p94fountain");
  // 镇上的小房子：一排排，里面摆着同样小的家具
  for (let i = 0; i < 16; i++) {
    const hx = 6 + (i % 8) * 11;
    const hy = TOWN_Y0 + 2 + Math.floor(i / 8) * 12;
    put(hx, hy, "p94house", { style: i % 4 });
  }
  // 那个年代的车 + 装满杏仁奶的送奶车
  for (let i = 0; i < 6; i++) {
    put(8 + i * 14, TOWN_Y0 + 8, "p94car", { old: true });
  }
  put(cx - 12, TOWN_Y0 + 14, "p94milk");
  put(cx + 12, TOWN_Y0 + 14, "p94milk");
  // 大喇叭：不时播放欢快的卡通音乐
  put(6, TOWN_Y0 + 2, "p94speaker");
  put(size - 8, TOWN_Y0 + 2, "p94speaker");
  put(cx - 20, TOWN_Y0 + 20, "p94speaker");

  // ================= 草地山丘 =================
  // 随机的成套家具 / 单间的房子 / 一面旁边摆着家具的墙
  for (let i = 0; i < 22; i++) {
    const fx = 5 + (i * 13) % (size - 12);
    const fy = CASTLE_Y1 + 6 + (i * 7) % Math.max(4, (HILL_Y1 - CASTLE_Y1 - 8));
    const r = i % 3;
    if (r === 0) put(fx, fy, "p94furniture", { kind: "sofa" });
    else if (r === 1) put(fx, fy, "p94wall", {});
    else put(fx, fy, "p94shed", {});
  }
  // 停在中央的古怪汽车
  put(cx - 6, Math.floor((CASTLE_Y1 + HILL_Y1) / 2), "p94car", { old: false, weird: true });
  put(cx + 6, Math.floor((CASTLE_Y1 + HILL_Y1) / 2) + 2, "p94car", { old: false, weird: true });
  // 水塔：里面似乎含着杏仁水
  put(cx + 16, CASTLE_Y1 + 8, "p94tower");

  // ================= 透明山上的城堡 =================
  const CY0 = 6, CY1 = CASTLE_Y1 - 2;
  const CX0 = Math.floor(size * 0.34), CX1 = Math.floor(size * 0.66);
  // 城堡的门（从坡道上来正对着）
  put(cx, CY1 - 1, "p94castlegate");
  // 城堡里面：主题非常欢快的房间
  put(CX0 + 4, CY0 + 3, "p94ballpit");                     // 海洋球坑
  put(CX1 - 6, CY0 + 3, "p94playground");                  // 游乐场
  put(cx - 4, CY0 + 9, "p94studio");                       // 动画工作室
  put(cx + 4, CY0 + 9, "p94minitown");                     // 微型城镇（工作室里的复制品）
  // 守卫：30 年代的老式机器人玩具
  for (let i = 0; i < 6; i++) {
    put(CX0 + 2 + i * 7, CY1 - 4, "p94robot", { hostile: false });
  }
  // 觐见室：那扇宏伟的大门
  put(cx, CY0 + 1, "p94throne");

  return {
    size, level: 94, doubleStory: false,
    layers: [grid], grid, rooms: [[]], floors: [floors],
    start, exit: null, doors: [], ramps: [],
    props, crates: [], ground: [],

    style: "anime94", tileName: "anime94",
    a94t0: performance.now(),
    townY0: TOWN_Y0, hillY1: HILL_Y1, castleY1: CASTLE_Y1,
    castle: { x0: CX0, y0: CY0, x1: CX1, y1: CY1 },
    trialDone: false,     // 王的考验通过没
    robotMad: false,      // 机器人是不是已经被惹毛了
  };
}
window.generateAnime94Map = generateAnime94Map;

function collectFloorsInto94(grid, size, out) {
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    if (grid[y][x] === 0) out.push({ x, y });
  }
  return out;
}

// ---------------- 地面 ----------------
// 山丘是长满草的绿地；镇上是那个年代的路面；城堡里是暖色的石砖
window.drawAnime94Floor = function (ctx, px, py, S, map, tx, ty) {
  const inCastle = map.castle && tx >= map.castle.x0 && tx <= map.castle.x1
    && ty >= map.castle.y0 && ty <= map.castle.y1;
  const inTown = ty >= map.townY0;
  if (inCastle) {
    ctx.fillStyle = ((tx + ty) % 2 === 0) ? "#e0d0a8" : "#d4c39a";
    ctx.fillRect(px, py, S, S);
    ctx.strokeStyle = "rgba(140,110,70,.35)"; ctx.lineWidth = 1;
    ctx.strokeRect(px + 0.5, py + 0.5, S - 1, S - 1);
  } else if (inTown) {
    // 镇上的路面：土黄 + 碎石
    ctx.fillStyle = ((tx + ty) % 2 === 0) ? "#b8a888" : "#ae9e7e";
    ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(90,70,50,.16)";
    ctx.fillRect(px + S * 0.3, py + S * 0.3, S * 0.18, S * 0.18);
    ctx.fillRect(px + S * 0.62, py + S * 0.60, S * 0.14, S * 0.14);
  } else {
    // 草：一层层深浅不一的绿（定格动画那种一帧帧做出来的草）
    const n = (tx * 5 + ty * 3) % 3;
    ctx.fillStyle = n === 0 ? "#8fc46a" : (n === 1 ? "#84bb60" : "#96ca72");
    ctx.fillRect(px, py, S, S);
    // 草叶
    ctx.fillStyle = "rgba(50,110,40,.45)";
    for (let i = 0; i < 3; i++) {
      const gx = px + S * (0.18 + i * 0.28) + ((tx * 3 + i) % 3);
      ctx.fillRect(gx, py + S * 0.30, 1.4, S * 0.34);
    }
  }
  // 颗粒化：一切都像是被精心制作出来的（很轻的一层颗粒）
  ctx.fillStyle = "rgba(255,255,255,.03)";
  ctx.fillRect(px + ((tx * 7) % 5), py + ((ty * 3) % 5), 2, 2);
  return true;
};

// ---------------- 墙 ----------------
window.drawAnime94Wall = function (ctx, px, py, S, map, tx, ty) {
  const inCastle = map.castle && tx >= map.castle.x0 - 2 && tx <= map.castle.x1 + 2
    && ty >= map.castle.y0 - 2 && ty <= map.castle.y1 + 2;
  if (inCastle) {
    // 城堡的暖石墙
    ctx.fillStyle = "#c8b088";
    ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(255,255,255,.12)";
    ctx.fillRect(px + 2, py + 2, S - 4, 3);
    ctx.strokeStyle = "rgba(120,90,60,.35)"; ctx.lineWidth = 1;
    ctx.strokeRect(px + 0.5, py + 0.5, S - 1, S - 1);
  } else {
    // 镇上/山丘的边界：木栅栏那种暖棕（不是黑的，也不是管道）
    ctx.fillStyle = "#9a7a52";
    ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(255,255,255,.10)";
    ctx.fillRect(px, py + S * 0.20, S, 3);
    ctx.fillRect(px, py + S * 0.62, S, 3);
  }
  return true;
};

// ---------------- 环境：白天/黄昏/夜晚 + 颗粒 ----------------
window.drawAnime94 = function (ctx, g) {
  const cw = (ctx.canvas && ctx.canvas.width) || 800;
  const ch = (ctx.canvas && ctx.canvas.height) || 600;
  const m = g.map;
  if (!m) return;
  const ph = a94Phase(m, performance.now());
  const t = performance.now() / 1000;
  ctx.save();
  try { ctx.setTransform(1, 0, 0, 1, 0, 0); } catch (e) { /* 忽略 */ }

  if (ph.name === "day") {
    // 白天：暖暖的黄光，一切都无害
    ctx.fillStyle = "rgba(255,236,180,.075)";
    ctx.fillRect(0, 0, cw, ch);
  } else if (ph.name === "dusk") {
    // 黄昏：慢慢压暗，偏橙
    const a = ph.k;
    ctx.fillStyle = "rgba(255,150,60," + (a * 0.10).toFixed(3) + ")";
    ctx.fillRect(0, 0, cw, ch);
    ctx.fillStyle = "rgba(40,30,60," + (a * 0.16).toFixed(3) + ")";
    ctx.fillRect(0, 0, cw, ch);
  } else {
    // 夜晚：音乐停了。「动画」出来了。
    // 上限压在 0.62 —— 再黑也得看得见脚下的路
    ctx.fillStyle = "rgba(20,24,52,.62)";
    ctx.fillRect(0, 0, cw, ch);
    // 夜里那种一点一点飘的颗粒（定格动画的胶片感）
    ctx.fillStyle = "rgba(255,255,255,.05)";
    for (let i = 0; i < 26; i++) {
      const gx = ((i * 137 + Math.floor(t * 30)) % cw);
      const gy = ((i * 71 + Math.floor(t * 18)) % ch);
      ctx.fillRect(gx, gy, 2, 2);
    }
  }
  // 颗粒化：一直都在（这是这一层的"做法"）
  ctx.fillStyle = "rgba(255,255,255,.022)";
  for (let i = 0; i < 40; i++) {
    ctx.fillRect(((i * 97 + Math.floor(t * 12)) % cw), ((i * 53) % ch), 1.6, 1.6);
  }
  ctx.restore();
};

// ---------------- 物件 ----------------
window.PROP_DRAW = window.PROP_DRAW || {};

// 喷泉：里面流淌着杏仁水
window.PROP_DRAW["p94fountain"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  const t = performance.now() / 1000;
  // 池子
  ctx.fillStyle = "#cfc0a0";
  ctx.beginPath(); ctx.ellipse(x + T / 2, y + T * 0.62, T * 0.44, T * 0.28, 0, 0, Math.PI * 2); ctx.fill();
  // 杏仁水（奶白色，还在流）
  ctx.fillStyle = "#f6efd8";
  ctx.beginPath(); ctx.ellipse(x + T / 2, y + T * 0.62, T * 0.36, T * 0.21, 0, 0, Math.PI * 2); ctx.fill();
  // 中间的柱子 + 水柱
  ctx.fillStyle = "#e0d0b0";
  ctx.fillRect(x + T * 0.44, y + T * 0.36, T * 0.12, T * 0.28);
  ctx.fillStyle = "rgba(255,255,255,.75)";
  for (let i = 0; i < 4; i++) {
    const ph = (t * 1.4 + i * 0.25) % 1;
    const rx = T * 0.06 + ph * T * 0.26;
    ctx.beginPath();
    ctx.ellipse(x + T / 2 + Math.cos(i * 1.6 + t) * rx, y + T * 0.44 - ph * T * 0.16, 2.4, 2.4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
};

// 镇上的小房子：里面摆着同样小的家具
window.PROP_DRAW["p94house"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  const roofs = ["#c9584a", "#4a7ac0", "#4aa86a", "#c9a04a"];
  const walls = ["#f0e4cc", "#e8dcc0", "#f4ead8", "#e4d8bc"];
  const rc = roofs[(p.style || 0) % 4], wc = walls[(p.style || 0) % 4];
  // 墙
  ctx.fillStyle = wc;
  ctx.fillRect(x + T * 0.10, y + T * 0.34, T * 0.80, T * 0.58);
  // 屋顶
  ctx.fillStyle = rc;
  ctx.beginPath();
  ctx.moveTo(x + T * 0.04, y + T * 0.36);
  ctx.lineTo(x + T / 2, y + T * 0.04);
  ctx.lineTo(x + T * 0.96, y + T * 0.36);
  ctx.closePath(); ctx.fill();
  // 窗（亮着暖光）
  ctx.fillStyle = "#ffe9a8";
  ctx.fillRect(x + T * 0.20, y + T * 0.46, T * 0.20, T * 0.18);
  ctx.fillRect(x + T * 0.60, y + T * 0.46, T * 0.20, T * 0.18);
  // 门
  ctx.fillStyle = "#8a6a44";
  ctx.fillRect(x + T * 0.44, y + T * 0.60, T * 0.14, T * 0.32);
  // 屋里那些"同样小的家具"（从窗口看得到一点）
  ctx.fillStyle = "rgba(120,90,60,.45)";
  ctx.fillRect(x + T * 0.22, y + T * 0.52, T * 0.16, T * 0.06);
};

// 那个年代的车 / 停在山丘中央的古怪汽车
window.PROP_DRAW["p94car"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  if (p.weird) {
    // 古怪汽车：不成比例，轮子特别大
    ctx.fillStyle = "#c94f8a";
    ctx.fillRect(x + T * 0.14, y + T * 0.44, T * 0.72, T * 0.24);
    ctx.fillStyle = "#7ac0e0";
    ctx.fillRect(x + T * 0.28, y + T * 0.28, T * 0.44, T * 0.18);
    ctx.fillStyle = "#2a2a34";
    ctx.beginPath(); ctx.arc(x + T * 0.26, y + T * 0.72, T * 0.16, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + T * 0.74, y + T * 0.72, T * 0.16, 0, Math.PI * 2); ctx.fill();
  } else {
    // 30 年代的车：圆头圆脑
    ctx.fillStyle = "#4a4a5e";
    ctx.fillRect(x + T * 0.10, y + T * 0.40, T * 0.80, T * 0.26);
    ctx.fillStyle = "#5a5a70";
    ctx.beginPath(); ctx.ellipse(x + T * 0.52, y + T * 0.44, T * 0.28, T * 0.20, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#e8e2d0";
    ctx.fillRect(x + T * 0.62, y + T * 0.30, T * 0.20, T * 0.14);
    ctx.fillStyle = "#20202a";
    ctx.beginPath(); ctx.arc(x + T * 0.28, y + T * 0.68, T * 0.11, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + T * 0.72, y + T * 0.68, T * 0.11, 0, Math.PI * 2); ctx.fill();
  }
};

// 装满杏仁奶的送奶车
window.PROP_DRAW["p94milk"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#f0ece0";
  ctx.fillRect(x + T * 0.08, y + T * 0.34, T * 0.84, T * 0.36);
  ctx.fillStyle = "#4a7ac0";
  ctx.fillRect(x + T * 0.08, y + T * 0.34, T * 0.84, T * 0.10);
  // 车厢上写着"杏仁奶"
  ctx.fillStyle = "#5a5a66";
  ctx.font = Math.max(5, Math.floor(T * 0.14)) + "px monospace";
  ctx.textAlign = "center";
  ctx.fillText("杏仁奶", x + T / 2, y + T * 0.60);
  ctx.textAlign = "left";
  ctx.fillStyle = "#20202a";
  ctx.beginPath(); ctx.arc(x + T * 0.26, y + T * 0.74, T * 0.10, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + T * 0.74, y + T * 0.74, T * 0.10, 0, Math.PI * 2); ctx.fill();
};

// 大喇叭：不时播放欢快的卡通音乐
window.PROP_DRAW["p94speaker"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  const t = performance.now() / 1000;
  ctx.fillStyle = "#8a6a44";
  ctx.fillRect(x + T * 0.40, y + T * 0.44, T * 0.20, T * 0.44);
  // 喇叭口
  ctx.fillStyle = "#c9a06a";
  ctx.beginPath();
  ctx.moveTo(x + T * 0.44, y + T * 0.44);
  ctx.lineTo(x + T * 0.22, y + T * 0.14);
  ctx.lineTo(x + T * 0.78, y + T * 0.14);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#8a6a44";
  ctx.beginPath(); ctx.arc(x + T / 2, y + T * 0.30, T * 0.10, 0, Math.PI * 2); ctx.fill();
  // 播放时会有音波（夜里全停）
  const ph = a94Phase(window.__game && window.__game.map, performance.now());
  if (ph.name !== "night") {
    ctx.strokeStyle = "rgba(255,220,120,.55)"; ctx.lineWidth = 1.6;
    for (let i = 1; i <= 3; i++) {
      const r = ((t * 1.6 + i * 0.33) % 1) * T * 0.30;
      ctx.globalAlpha = 0.5 - r / (T * 0.7);
      ctx.beginPath(); ctx.arc(x + T / 2, y + T * 0.20, T * 0.12 + r, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
};

// 山丘上随机的成套家具
window.PROP_DRAW["p94furniture"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#b07a4a";
  ctx.fillRect(x + T * 0.10, y + T * 0.44, T * 0.80, T * 0.30);   // 沙发座
  ctx.fillStyle = "#c98a5a";
  ctx.fillRect(x + T * 0.10, y + T * 0.30, T * 0.80, T * 0.16);   // 靠背
  ctx.fillStyle = "#8a5a3a";
  ctx.fillRect(x + T * 0.14, y + T * 0.72, T * 0.10, T * 0.14);
  ctx.fillRect(x + T * 0.76, y + T * 0.72, T * 0.10, T * 0.14);
};
// 一面旁边摆着家具的墙
window.PROP_DRAW["p94wall"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#e0d4bc";
  ctx.fillRect(x + T * 0.16, y + T * 0.10, T * 0.68, T * 0.52);
  ctx.fillStyle = "rgba(120,90,60,.25)";
  ctx.fillRect(x + T * 0.16, y + T * 0.56, T * 0.68, 3);
  // 墙边摆着的家具
  ctx.fillStyle = "#b07a4a";
  ctx.fillRect(x + T * 0.20, y + T * 0.70, T * 0.30, T * 0.18);
};
// 单间的房子
window.PROP_DRAW["p94shed"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#d8c8a8";
  ctx.fillRect(x + T * 0.14, y + T * 0.34, T * 0.72, T * 0.54);
  ctx.fillStyle = "#a8584a";
  ctx.beginPath();
  ctx.moveTo(x + T * 0.08, y + T * 0.36);
  ctx.lineTo(x + T / 2, y + T * 0.10);
  ctx.lineTo(x + T * 0.92, y + T * 0.36);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#8a6a44";
  ctx.fillRect(x + T * 0.42, y + T * 0.58, T * 0.16, T * 0.30);
};
// 水塔（里面似乎含着杏仁水）
window.PROP_DRAW["p94tower"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#9a7a52";
  ctx.fillRect(x + T * 0.30, y + T * 0.52, T * 0.08, T * 0.40);
  ctx.fillRect(x + T * 0.62, y + T * 0.52, T * 0.08, T * 0.40);
  ctx.fillStyle = "#b8a888";
  ctx.fillRect(x + T * 0.16, y + T * 0.20, T * 0.68, T * 0.34);
  ctx.fillStyle = "#f6efd8";
  ctx.fillRect(x + T * 0.22, y + T * 0.28, T * 0.56, T * 0.18);   // 杏仁水的水位线
  ctx.fillStyle = "#7a5a3a";
  ctx.fillRect(x + T * 0.16, y + T * 0.20, T * 0.68, 3);
};

// 城堡的门（从坡道上来正对着）
window.PROP_DRAW["p94castlegate"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#8a6a44";
  ctx.fillRect(x + T * 0.16, y + T * 0.10, T * 0.68, T * 0.84);
  ctx.fillStyle = "#c8b088";
  ctx.fillRect(x + T * 0.24, y + T * 0.18, T * 0.52, T * 0.70);
  ctx.fillStyle = "#f0e4cc";
  ctx.fillRect(x + T * 0.44, y + T * 0.30, T * 0.12, T * 0.58);
};

// 海洋球坑
window.PROP_DRAW["p94ballpit"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  const t = performance.now() / 1000;
  ctx.fillStyle = "#4a7ac0";
  ctx.fillRect(x + T * 0.08, y + T * 0.24, T * 0.84, T * 0.68);
  const cols = ["#ff5a7a", "#ffd24a", "#5ad0ff", "#a8ff5a", "#ff8a4a"];
  for (let i = 0; i < 16; i++) {
    const bx = x + T * (0.14 + ((i * 7) % 11) * 0.065);
    const by = y + T * (0.30 + ((i * 5) % 7) * 0.075) + Math.sin(t * 2 + i) * 1.5;
    ctx.fillStyle = cols[i % cols.length];
    ctx.beginPath(); ctx.arc(bx, by, T * 0.055, 0, Math.PI * 2); ctx.fill();
  }
};

// 游乐场
window.PROP_DRAW["p94playground"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  const t = performance.now() / 1000;
  // 滑梯
  ctx.fillStyle = "#e07830";
  ctx.beginPath();
  ctx.moveTo(x + T * 0.20, y + T * 0.24);
  ctx.lineTo(x + T * 0.78, y + T * 0.72);
  ctx.lineTo(x + T * 0.70, y + T * 0.80);
  ctx.lineTo(x + T * 0.14, y + T * 0.34);
  ctx.closePath(); ctx.fill();
  // 秋千
  ctx.fillStyle = "#8a6a44";
  ctx.fillRect(x + T * 0.24, y + T * 0.14, T * 0.52, T * 0.06);
  const sw = Math.sin(t * 1.8) * T * 0.10;
  ctx.strokeStyle = "#5a5a66"; ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(x + T * 0.36, y + T * 0.20); ctx.lineTo(x + T * 0.36 + sw, y + T * 0.50);
  ctx.moveTo(x + T * 0.64, y + T * 0.20); ctx.lineTo(x + T * 0.64 - sw, y + T * 0.50);
  ctx.stroke();
  ctx.fillStyle = "#c94f4f";
  ctx.fillRect(x + T * 0.30 + sw, y + T * 0.50, T * 0.14, T * 0.05);
  ctx.fillRect(x + T * 0.58 - sw, y + T * 0.50, T * 0.14, T * 0.05);
};

// 动画工作室
window.PROP_DRAW["p94studio"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  const t = performance.now() / 1000;
  ctx.fillStyle = "#3a3a46";
  ctx.fillRect(x + T * 0.06, y + T * 0.14, T * 0.88, T * 0.78);
  // 工作台上的一格格画面（定格动画是一帧帧拍的）
  ctx.fillStyle = "#f0ece0";
  ctx.fillRect(x + T * 0.14, y + T * 0.24, T * 0.72, T * 0.40);
  const f = Math.floor(t * 6) % 4;
  ctx.fillStyle = "#4a7ac0";
  ctx.fillRect(x + T * 0.20 + f * T * 0.16, y + T * 0.34, T * 0.12, T * 0.20);
  ctx.strokeStyle = "rgba(90,90,110,.5)"; ctx.lineWidth = 1;
  ctx.strokeRect(x + T * 0.14, y + T * 0.24, T * 0.72, T * 0.40);
  // 台灯
  ctx.fillStyle = "#ffd24a";
  ctx.beginPath(); ctx.arc(x + T * 0.80, y + T * 0.72, T * 0.08, 0, Math.PI * 2); ctx.fill();
};

// 微型城镇（工作室里那些实体的复制品）
window.PROP_DRAW["p94minitown"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  ctx.fillStyle = "#cfc0a0";
  ctx.fillRect(x + T * 0.08, y + T * 0.46, T * 0.84, T * 0.44);
  // 一排排小小的房子
  const cols = ["#c9584a", "#4a7ac0", "#4aa86a", "#c9a04a"];
  for (let i = 0; i < 6; i++) {
    const hx = x + T * (0.12 + i * 0.13);
    const hy = y + T * (0.30 + (i % 2) * 0.12);
    ctx.fillStyle = "#f0e4cc";
    ctx.fillRect(hx, hy, T * 0.10, T * 0.18);
    ctx.fillStyle = cols[i % 4];
    ctx.beginPath();
    ctx.moveTo(hx - 2, hy); ctx.lineTo(hx + T * 0.05, hy - T * 0.10); ctx.lineTo(hx + T * 0.12, hy);
    ctx.closePath(); ctx.fill();
  }
};

// 机器人：30 年代的老式机器人玩具
window.PROP_DRAW["p94robot"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  const t = performance.now() / 1000;
  const mad = p.hostile;
  // 方头方脑的铁皮玩具
  ctx.fillStyle = mad ? "#c94f4f" : "#b8bcc4";
  ctx.fillRect(x + T * 0.24, y + T * 0.10, T * 0.52, T * 0.30);   // 头
  ctx.fillStyle = mad ? "#a03a3a" : "#9aa0aa";
  ctx.fillRect(x + T * 0.18, y + T * 0.40, T * 0.64, T * 0.36);   // 身
  // 眼睛（敌意时会变红并闪）
  ctx.fillStyle = mad ? "#ff3020" : "#ffd24a";
  const blink = (Math.sin(t * 2.5 + p.x) > 0.9) ? 0.4 : 1;
  ctx.globalAlpha = blink;
  ctx.beginPath(); ctx.arc(x + T * 0.38, y + T * 0.24, T * 0.06, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + T * 0.62, y + T * 0.24, T * 0.06, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
  // 嘴（一条栅格）
  ctx.fillStyle = "#5a5a66";
  ctx.fillRect(x + T * 0.34, y + T * 0.32, T * 0.32, 2);
  // 天线
  ctx.strokeStyle = "#9aa0aa"; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(x + T / 2, y + T * 0.10); ctx.lineTo(x + T / 2, y + T * 0.02); ctx.stroke();
  ctx.fillStyle = mad ? "#ff3020" : "#ffd24a";
  ctx.beginPath(); ctx.arc(x + T / 2, y + T * 0.01, 2.4, 0, Math.PI * 2); ctx.fill();
  // 发条（背后那个钥匙）
  ctx.strokeStyle = "#7a7a86"; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.arc(x + T * 0.86, y + T * 0.56, T * 0.08, 0, Math.PI * 2); ctx.stroke();
};

// 觐见室：那扇宏伟的大门 —— 后面是「王」
window.PROP_DRAW["p94throne"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  const t = performance.now() / 1000;
  // 宏伟的大门
  ctx.fillStyle = "#8a6a44";
  ctx.fillRect(x + T * 0.10, y + T * 0.06, T * 0.80, T * 0.88);
  ctx.fillStyle = "#c8b088";
  ctx.fillRect(x + T * 0.18, y + T * 0.14, T * 0.64, T * 0.74);
  // 金色的门钉与纹路
  ctx.fillStyle = "#e0c060";
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.arc(x + T / 2, y + T * (0.30 + i * 0.18), T * 0.05, 0, Math.PI * 2); ctx.fill();
  }
  // 门缝里透出的光（王在那后面）
  const gl = 0.35 + 0.25 * Math.sin(t * 1.4);
  ctx.fillStyle = "rgba(255,240,180," + gl.toFixed(2) + ")";
  ctx.fillRect(x + T * 0.46, y + T * 0.14, T * 0.08, T * 0.74);
};

// ---------------- 枢纽隧道里那个长方形的洞口（通往 Level 94） ----------------
window.PROP_DRAW["hub94hole"] = function (ctx, p, T) {
  const x = -T * 0.5, y = -T * 0.5;   // drawBatchProps 已经把画布平移到物件中心了 —— 这里必须用相对坐标
  // （以前写成 p.x*T，等于又叠了一次 —— 物件被画到整整一个身位之外，全跑到屏幕外）
  const t = performance.now() / 1000;
  // 洞口：黑得看不见底，边缘整齐得像是被谁切割出来的
  ctx.fillStyle = "#05060a";
  ctx.fillRect(x + T * 0.10, y + T * 0.16, T * 0.80, T * 0.68);
  // 切割出来的整整齐齐的边
  ctx.strokeStyle = "#9aa4b0"; ctx.lineWidth = 2;
  ctx.strokeRect(x + T * 0.10, y + T * 0.16, T * 0.80, T * 0.68);
  // 洞里透出的一点暖光（那头是 30 年代的阳光）
  const gl = 0.20 + 0.12 * Math.sin(t * 1.5);
  ctx.fillStyle = "rgba(255,228,160," + gl.toFixed(2) + ")";
  ctx.fillRect(x + T * 0.20, y + T * 0.28, T * 0.60, T * 0.44);
};
