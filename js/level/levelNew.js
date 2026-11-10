// ===========================================================
// 新增层级的"通用绘制底座" —— 地面 / 墙体 / 物件 / 灯光，按 style 分发。
// 每个层级自己的地图生成在各自的文件里：
//   js/level/level25.js                        Level 25 街机厅
//   js/level/level37.js                        Level 37 / 37.1 池房
//   js/level/level994.js                       Level 994 海滩
//   js/level/level9223372036854775807.js       无尽的终章（环形楼梯）
//   js/level/level9223372036854775807.-1.js    过去（拼接层）
//   js/level/level601.js                       终末（图书馆）
// 这里只放"它们都要用"的东西，加新层级时不必再动这个文件的逻辑。
// ===========================================================
"use strict";

const NEWTILE = {
  // 街机厅：地毯提亮 —— 原来是近乎黑的一片，玩家根本看不清自己在哪
  arcade:   ["#7a6a80", "#4a3340"],
  // 池房：地面是白瓷砖，墙是深青色的瓷砖墙 —— 以前两个都近白，根本分不清
  pool:     ["#eef2f4", "#3f6a74"],
  // 血红池房：地面/墙是深灰瓷砖，红光是"照"上去的，不是把水染红
  poolred:  ["#4a4f56", "#20242a"],
  endstair: ["#3a3d42", "#22252a"],
  beach:    ["#d9c79a", "#b9a878"],   // 沙滩
  stairs:   ["#6a6d76", "#5b5e67"],   // 深色混凝土楼梯（提亮一点，不然整层看不清）
  junction: ["#f2f4f6", "#e2e6ea"],   // 交接点：一片白
  // Level 601 终末：地面与墙都是黄的，这里不黑 —— 是亮的
  library:  ["#c9a94e", "#d8bd63"],
};

// ★ 登记顺序无关的兜底 —— 这一段必须紧跟 NEWTILE 声明。
// 各层级文件里的 `if (typeof NEWTILE !== "undefined") NEWTILE["x"]=...` 是**不可靠**的：
// NEWTILE 是本文件用 const 声明的，而 index.html 里 level1.3.js / level15.1.js 排在
// levelNew.js **前面**，它们运行时 NEWTILE 还没声明 —— typeof 得到 "undefined"，
// 那行登记被静默跳过，style 就不在 NEWTILE 里，绘制分发走到最后那个
// `else drawPipeWall()` 兜底 —— 于是整层变成 Level 2 的管道风。
// 现在改成：层级文件先写进 window.__NEWTILE_EXTRA，本文件在这里一次性并入。
(function () {
  const extra = (typeof window !== "undefined") ? window.__NEWTILE_EXTRA : null;
  if (extra) for (const k in extra) if (!(k in NEWTILE)) NEWTILE[k] = extra[k];
  // 给层级文件用的登记助手：无论它在 NEWTILE 之前还是之后加载都能生效
  window.regTile = function (k, v) {
    (window.__NEWTILE_EXTRA = window.__NEWTILE_EXTRA || {})[k] = v;
    NEWTILE[k] = v;
  };
})();

// "过去"（Level 9223372036854775807.-1）：每一块按它来源层级的配色画。
// 以前整层刷成同一种白 —— 明明拼进来了好几块，看起来却像什么都没拼。
function drawJunctionFloor(ctx, px, py, h, map, tx, ty) {
  const pc = map && map.patchColor && map.patchColor.get(tx + "," + ty);
  if (!pc) { ctx.fillStyle = "#f2f4f6"; ctx.fillRect(px, py, h, h); return true; }
  ctx.fillStyle = pc.f;
  ctx.fillRect(px, py, h, h);
  // 一点格纹，免得大色块糊成一片
  if (((tx * 5 + ty * 3) % 4) === 0) {
    ctx.fillStyle = "rgba(0,0,0,0.07)";
    ctx.fillRect(px, py, h, h);
  }
  return true;
}
function drawJunctionWall(ctx, px, py, h, map, tx, ty) {
  const pc = map && map.patchColor && map.patchColor.get(tx + "," + ty);
  if (!pc) { ctx.fillStyle = "#e2e6ea"; ctx.fillRect(px, py, h, h); return true; }
  ctx.fillStyle = pc.w;
  ctx.fillRect(px, py, h, h);
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.fillRect(px, py, h, Math.max(2, h * 0.16));
  ctx.fillStyle = "rgba(0,0,0,0.26)";
  ctx.fillRect(px, py + h - Math.max(2, h * 0.14), h, Math.max(2, h * 0.14));
  return true;
}

function drawNewFloor(ctx, px, py, h, style, map, tx, ty) {
  const gFloorRef = (window.__game && window.__game.floor) | 0;
  // 参数名别再写成 _h：以前 junction 分支用的是函数体里那个"稍后才声明"的 h，
  // 结果是 undefined —— fillRect(px,py,undefined,undefined) 什么也画不出来，
  // 而函数又 return true，调用方就不再补画 —— 于是「过去」整层是黑的。
  if (style === "junction") return drawJunctionFloor(ctx, px, py, h, map, tx, ty);
  const c = NEWTILE[style];
  if (!c) return false;
  // 1.3.2 批次：新层级把各自的地面画法挂进 __B3_FLOOR，不必逐个改这里的分支。
  // 必须显式 return true，否则会被当成"没画"而刷成 Level 2 的管道地板。
  if (window.__B3_FLOOR && window.__B3_FLOOR[style]) return window.__B3_FLOOR[style](ctx, px, py, h, map, tx, ty);
  if (typeof h !== "number") h = (typeof TILE === "number" ? TILE : 40);
  // Level 974：粉白相间的地毯
  // 注意：这几个绘制函数本身不返回值，必须显式 return true —— 否则调用方会把
  // undefined 当成"没画"，转而去画 Level 2 的管道地板，把粉色地毯整个盖掉。
  if (style === "kittyhome") { drawKittyFloor(ctx, px, py, h); return true; }
  // 5.2 胜景 / 5.3 普罗米修斯藏书馆 / 6.2 霓虹迷宫 / 11.3 红灯区
  if (style === "vista" && window.drawVistaFloor) return window.drawVistaFloor(ctx, px, py, h, map, tx, ty);
  if (style === "prometheus" && window.drawPrometheusFloor) return window.drawPrometheusFloor(ctx, px, py, h, tx, ty);
  if (style === "neon62" && window.drawNeonFloor) return window.drawNeonFloor(ctx, px, py, h, tx, ty);
  if (style === "redlight" && window.drawRedlightFloor) return window.drawRedlightFloor(ctx, px, py, h, map, tx, ty);
  // Level 1.3 恶性肿瘤 / Level 15.1 枉然
  if (style === "tumor13" && window.drawTumorFloor) return window.drawTumorFloor(ctx, px, py, h, map, tx, ty);
  if (style === "futility" && window.drawFutilityFloor) return window.drawFutilityFloor(ctx, px, py, h, map, tx, ty);
  // 隐秘层级 —— 战地医院（14h）
  // Level 20 波瑞阿斯建筑：左半边是棕色地毯（等候厅），右半边是灰色地毯（霓虹区）
  if (style === "boreas20" && window.drawBoreasFloor) return window.drawBoreasFloor(ctx, px, py, h, map, tx, ty);
  if (style === "mash" && window.drawMashFloor) return window.drawMashFloor(ctx, px, py, h, map, tx, ty);
  if (style === "airport") { drawAirportFloor(ctx, px, py, h, tx, ty); return true; }
  if (style === "airliner") { drawAirlinerFloor(ctx, px, py, h, tx, ty); return true; }
  // 1.8.0：Level 27 岩体泉 / Level 28 终末美德 / 痛处（Level 0 里的一处地点）
  // 这三个函数必须显式 return true —— 否则会被判成"没画"而转去画 Level 2 的管道。
  if (style === "spring27" && window.drawSpring27Floor) return window.drawSpring27Floor(ctx, px, py, h, map, tx, ty);
  if (style === "virtue28" && window.drawVirtue28Floor) return window.drawVirtue28Floor(ctx, px, py, h, map, tx, ty);
  if (style === "pain0" && window.drawPainFloor) return window.drawPainFloor(ctx, px, py, h, map, tx, ty);
  // Level 363 你作弊了 / 隐秘层级 —— 破碎之地
  if (style === "cheat363" && window.drawCheat363Floor) return window.drawCheat363Floor(ctx, px, py, h, map, tx, ty);
  if (style === "shattered" && window.drawShatteredFloor) return window.drawShatteredFloor(ctx, px, py, h, map, tx, ty);
  // Level 26 享乐号汽船：明亮的黄色派对厅
  if (style === "steamer26" && window.drawSteamer26Floor) return window.drawSteamer26Floor(ctx, px, py, h, map, tx, ty);
  // 1.3.1 批次：六个新层级的地面（必须显式 return true，否则会被当成没画而刷成管道地板）
  if (style === "casino51" && window.drawCasino51Floor) return window.drawCasino51Floor(ctx, px, py, h, map, tx, ty);
  if (style === "forest39" && window.drawForest39Floor) return window.drawForest39Floor(ctx, px, py, h, map, tx, ty);
  if (style === "sky63" && window.drawSky63Floor) return window.drawSky63Floor(ctx, px, py, h, map, tx, ty);
  if (style === "sleep633" && window.drawSleep633Floor) return window.drawSleep633Floor(ctx, px, py, h, map, tx, ty);
  if (style === "path797" && window.drawPath797Floor) return window.drawPath797Floor(ctx, px, py, h, map, tx, ty);
  if (style === "desert46" && window.drawDesert46Floor) return window.drawDesert46Floor(ctx, px, py, h, map, tx, ty);
  const k = tx + "," + ty;
  if (style === "endstair" || (map && map.stairCx != null)) {
    const kk = tx + "," + ty;
    // 中间的空洞：往下望是一片黑，边上围着一圈护栏（正常跳不进去）
    if (map.holeTiles && map.holeTiles.has(kk)) {
      ctx.fillStyle = "#05060a";
      ctx.fillRect(px, py, h, h);
      const nk = (dx, dy) => map.holeTiles.has((tx + dx) + "," + (ty + dy));
      // 边缘那一圈是护栏（空气墙），站不进去
      if (!nk(-1, 0) || !nk(1, 0) || !nk(0, -1) || !nk(0, 1)) {
        ctx.fillStyle = "#5a5f67";
        if (!nk(-1, 0)) ctx.fillRect(px, py, 4, h);
        if (!nk(1, 0)) ctx.fillRect(px + h - 4, py, 4, h);
        if (!nk(0, -1)) ctx.fillRect(px, py, h, 4);
        if (!nk(0, 1)) ctx.fillRect(px, py + h - 4, h, 4);
      }
      return true;
    }
    // 环形楼梯：一级一级往上，每级带踏面高光和立面阴影 —— 看得出层次
    // 第 2 层往上没有"底" —— 整圈都是楼梯，中间只有那个洞。
    const onStair = (map.stairTiles && map.stairTiles.has(kk)) ||
                    (gFloorRef >= 1 && map.ringTiles && map.ringTiles.has(kk));
    if (onStair) {
      // 顺时针方向 = 往上走。t=0 是最低一级，t=1 是最高一级。
      // 明暗按 t 拉开：低处深灰、高处近白，再配极暗的立面，层次一眼可见。
      const tSrc = (gFloorRef >= 1 ? map.ringT : map.stairT);
      let t = (tSrc && tSrc.has(kk)) ? tSrc.get(kk) : 0.5;
      const lo = [74, 78, 86], hi = [238, 243, 250];
      const mix = (a, b, k) => Math.round(a + (b - a) * k);
      const tread = "rgb(" + mix(lo[0], hi[0], t) + "," + mix(lo[1], hi[1], t) + "," + mix(lo[2], hi[2], t) + ")";
      const step = h / 3;
      for (let i = 0; i < 3; i++) {
        const sy = py + i * step;
        ctx.fillStyle = "rgba(0,0,0,.72)";                 // 立面：压到很暗，才有"台阶"的感觉
        ctx.fillRect(px + 1, sy + step - 7, h - 2, 6);
        ctx.fillStyle = tread;                              // 踏面
        ctx.fillRect(px + 1, sy + 1, h - 2, step - 8);
        ctx.fillStyle = "rgba(255,255,255,.55)";            // 踏面前沿的高光
        ctx.fillRect(px + 1, sy + 1, h - 2, 3);
      }
      // 上行箭头：指向顺时针的切线方向 —— 顺着箭头走就是上楼
      {
        const ax = tx - map.stairCx, ay = ty - map.stairCy;
        const len = Math.hypot(ax, ay) || 1;
        const dxu = -ay / len, dyu = ax / len;              // 顺时针切向
        const mx = px + h / 2, my = py + h / 2, s = h * 0.20;
        ctx.fillStyle = "rgba(12,14,18,.85)";
        ctx.beginPath();
        ctx.moveTo(mx + dxu * s * 1.5, my + dyu * s * 1.5);
        ctx.lineTo(mx - dxu * s * 0.7 - dyu * s, my - dyu * s * 0.7 + dxu * s);
        ctx.lineTo(mx - dxu * s * 0.7 + dyu * s, my - dyu * s * 0.7 - dxu * s);
        ctx.closePath(); ctx.fill();
      }
      // 扶手：贴着内圈一侧，深色描边
      ctx.fillStyle = "#4b5058";
      ctx.fillRect(px, py + 2, 3, h - 4);
      ctx.fillStyle = "#98a0ab";
      ctx.fillRect(px, py + 2, 1, h - 4);
      return true;
    }
    // 深灰色的混凝土 —— 只有最底下那一层有"底"；到过顶再回来，它会变白
    const white = map.bottomWhite && gFloorRef === 0;
    ctx.fillStyle = white ? "#f2f4f8" : "#3a3d42";
    ctx.fillRect(px, py, h, h);
    ctx.strokeStyle = white ? "rgba(255,255,255,.55)" : "rgba(18,20,24,.6)";
    ctx.lineWidth = 1;
    ctx.strokeRect(px + 0.5, py + 0.5, h - 1, h - 1);
    return true;
  }
  if (style === "pool" || style === "poolred") {
    const wet = !!(map.pools && map.pools.has(k));
    if (wet) {
      // 一整片水：整格填满，只在与陆地交界的地方描池沿 —— 圆圈看着是一块块水洼
      ctx.fillStyle = "#9fd4dd";
      ctx.fillRect(px, py, h, h);
      const nb = (dx, dy) => {
        const nk = (tx + dx) + "," + (ty + dy);
        return !(map.pools && map.pools.has(nk));
      };
      ctx.strokeStyle = "rgba(255,255,255,.55)";
      ctx.lineWidth = 2;
      if (nb(-1, 0)) { ctx.beginPath(); ctx.moveTo(px + 1, py); ctx.lineTo(px + 1, py + h); ctx.stroke(); }
      if (nb(1, 0))  { ctx.beginPath(); ctx.moveTo(px + h - 1, py); ctx.lineTo(px + h - 1, py + h); ctx.stroke(); }
      if (nb(0, -1)) { ctx.beginPath(); ctx.moveTo(px, py + 1); ctx.lineTo(px + h, py + 1); ctx.stroke(); }
      if (nb(0, 1))  { ctx.beginPath(); ctx.moveTo(px, py + h - 1); ctx.lineTo(px + h, py + h - 1); ctx.stroke(); }
      return true;
    }
    // 干的地方：白瓷砖（见下）
    // 干的地面：白瓷砖，一格一块 —— 横竖都是直线，像方格纸
    ctx.fillStyle = "#f2f5f7";
    ctx.fillRect(px, py, h, h);
    ctx.fillStyle = "rgba(255,255,255,.55)";
    ctx.fillRect(px + 1, py + 1, h / 2 - 2, h / 2 - 2);
    ctx.strokeStyle = "#9aa3ab";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(px + 0.5, py); ctx.lineTo(px + 0.5, py + h);
    ctx.moveTo(px, py + 0.5); ctx.lineTo(px + h, py + 0.5);
    ctx.stroke();
    return true;
  }
  // 水：一整片，和 Level 37 一样的蓝绿色；37.1 的红是灯照的，不是水本身是红的
  if (style === "pool" || style === "poolred") {
    const wet = !!(map.pools && map.pools.has(k));
    if (wet) {
      ctx.fillStyle = "#9fd4dd";
      ctx.fillRect(px, py, h, h);
      const nb = (dx, dy) => {
        const nk = (tx + dx) + "," + (ty + dy);
        return !(map.pools && map.pools.has(nk));
      };
      ctx.strokeStyle = "rgba(255,255,255,.55)";
      ctx.lineWidth = 2;
      if (nb(-1, 0)) { ctx.beginPath(); ctx.moveTo(px + 1, py); ctx.lineTo(px + 1, py + h); ctx.stroke(); }
      if (nb(1, 0))  { ctx.beginPath(); ctx.moveTo(px + h - 1, py); ctx.lineTo(px + h - 1, py + h); ctx.stroke(); }
      if (nb(0, -1)) { ctx.beginPath(); ctx.moveTo(px, py + 1); ctx.lineTo(px + h, py + 1); ctx.stroke(); }
      if (nb(0, 1))  { ctx.beginPath(); ctx.moveTo(px, py + h - 1); ctx.lineTo(px + h, py + h - 1); ctx.stroke(); }
      return true;
    }
  }
  if (style === "beach") {
    const wet = tx >= (map.seaX | 0);
    ctx.fillStyle = wet ? "#2f6f86" : (((tx * 7 + ty * 13) % 5 === 0) ? c[1] : c[0]);
    ctx.fillRect(px, py, h, h);
    if (wet) {
      ctx.fillStyle = "rgba(255,255,255,.14)";
      ctx.fillRect(px, py + ((Math.sin((tx + ty) * 0.7 + (typeof gTimeRef === "number" ? gTimeRef : 0) * 2) * 0.5 + 0.5) * h * 0.4), h, 3);
    }
    return true;
  }
  if (style === "library" && map) {
    const inRect = (r) => r && tx >= r.x && tx < r.x + r.w && ty >= r.y && ty < r.y + r.h;
    if (inRect(map.green)) ctx.fillStyle = "#7fb069";        // 顶部绿房间（EXIT -> L0）
    else if (inRect(map.orange)) ctx.fillStyle = "#d98a3c";  // 左侧橙房间（深色门）
    else ctx.fillStyle = (((tx * 5 + ty * 3) % 4) === 0) ? c[1] : c[0];
    ctx.fillRect(px, py, h, h);
    ctx.strokeStyle = "rgba(120,95,30,.25)";
    ctx.lineWidth = 1;
    ctx.strokeRect(px + 0.5, py + 0.5, h - 1, h - 1);
    return true;
  }
  if (style === "stairs") {
    ctx.fillStyle = (((tx + ty) % 2) === 0) ? c[0] : c[1];
    ctx.fillRect(px, py, h, h);
    ctx.strokeStyle = "rgba(255,255,255,.06)";
    ctx.strokeRect(px + 0.5, py + 0.5, h - 1, h - 1);
    return true;
  }
  ctx.fillStyle = (((tx * 5 + ty * 3) % 4) === 0) ? c[1] : c[0];
  ctx.fillRect(px, py, h, h);
  return true;
}

// Level 37.1：整层被红光笼罩（不是把水染红，是光是红的）
function drawNewSpawnPts(ctx, g, cam) {
  const map = g.map;
  if (!map || !map.spawnPts || !map.spawnPts.length) return;
  if ((g.floor | 0) !== 0) return;
  const T = (typeof TILE === "number" ? TILE : 40);
  for (const p of map.spawnPts) {
    const x = p.x * T + T / 2, y = p.y * T + T / 2;
    ctx.fillStyle = "rgba(200,40,40,.55)";
    ctx.beginPath();
    ctx.moveTo(x, y - 7); ctx.lineTo(x + 7, y); ctx.lineTo(x, y + 7); ctx.lineTo(x - 7, y);
    ctx.closePath(); ctx.fill();
  }
}

// 灯具本体：钉在墙上的一小块，亮着。必须在迷雾画完之后再画才看得见。
function drawNewLampFixtures(ctx, g, cam) {
  const map = g.map;
  if (!map || !map.lamps || !map.lamps.length) return;
  const T = (typeof TILE === "number" ? TILE : 40);
  const hw = (cam.viewW || 800) / 2 + T * 2, hh = (cam.viewH || 600) / 2 + T * 2;
  ctx.save();
  for (const lp of map.lamps) {
    // 自带发光体的东西（比如 Level 301 那扇透着天光的窗）不该再钉一个红灯座上去
    if (lp.noFixture) continue;
    const wx = (lp.wx != null ? lp.wx + 0.5 : lp.x + 0.5) * T;
    const wy = (lp.wy != null ? lp.wy + 0.5 : lp.y + 0.5) * T;
    if (wx < cam.x - hw || wx > cam.x + hw || wy < cam.y - hh || wy > cam.y + hh) continue;
    // 灯座
    ctx.fillStyle = "#20242b";
    ctx.fillRect(wx - 8, wy - 5, 16, 10);
    ctx.strokeStyle = "#0d0f13"; ctx.lineWidth = 1;
    ctx.strokeRect(wx - 8.5, wy - 5.5, 17, 11);
    // 灯罩：朝它照的那一侧
    const dx = lp.wx != null ? Math.sign(lp.x - lp.wx) : 0;
    const dy = lp.wy != null ? Math.sign(lp.y - lp.wy) : 0;
    ctx.fillStyle = "#2b3039";
    ctx.fillRect(wx - 6 + dx * 3, wy - 4 + dy * 3, 12, 8);
    // 灯泡：亮着的红点
    ctx.fillStyle = "#ff5a4a";
    ctx.beginPath(); ctx.arc(wx + dx * 2, wy + dy * 2, 3.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,120,90,.55)";
    ctx.beginPath(); ctx.arc(wx + dx * 2, wy + dy * 2, 6, 0, Math.PI * 2); ctx.fill();
    // 往它照的方向拉出一道光带
    const lg = ctx.createLinearGradient(wx, wy, wx + dx * T * 2.2, wy + dy * T * 2.2);
    lg.addColorStop(0, "rgba(255,90,74,.34)");
    lg.addColorStop(1, "rgba(255,90,74,0)");
    ctx.fillStyle = lg;
    ctx.fillRect(Math.min(wx, wx + dx * T * 2.2), Math.min(wy, wy + dy * T * 2.2),
      dx !== 0 ? T * 2.2 : 16, dy !== 0 ? T * 2.2 : 16);
  }
  ctx.restore();
}

function drawNewAmbient(ctx, g, cam) {
  const map = g.map;
  if (!map || !map.lamps || !map.lamps.length) return;
  const T = (typeof TILE === "number" ? TILE : 40);
  const hw = (cam.viewW || 800) / 2 + T * 2, hh = (cam.viewH || 600) / 2 + T * 2;
  // 局部光照：每盏灯只染自己那一圈 —— 红灯照出来的水才是红的，
  // 别的地方用手电照，水还是 Level 37 那种蓝绿色。
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (const lp of map.lamps) {
    // 灯就挂在墙上：画一小块亮着的灯体，光从那儿往外散
    const lx = (lp.x + 0.5) * T, ly = (lp.y + 0.5) * T;
    if (lx < cam.x - hw || lx > cam.x + hw || ly < cam.y - hh || ly > cam.y + hh) continue;
    const r = (lp.r || 3.4) * T;
    const col = lp.color || "#ff3b30";
    const rgb = col === "#ff3b30" ? "255,59,48" : "255,220,150";
    const gr = ctx.createRadialGradient(lx, ly, T * 0.15, lx, ly, r);
    gr.addColorStop(0, "rgba(" + rgb + ",0.55)");
    gr.addColorStop(0.5, "rgba(" + rgb + ",0.26)");
    gr.addColorStop(1, "rgba(" + rgb + ",0)");
    ctx.fillStyle = gr;
    ctx.beginPath(); ctx.arc(lx, ly, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawNewWall(ctx, px, py, h, style, map, tx, ty) {
  if (style === "junction") return drawJunctionWall(ctx, px, py, h, map, tx, ty);
  const c = NEWTILE[style];
  if (!c) return false;
  // 1.3.2 批次：同地板，墙体也走外部注册表，避免新层级掉进管道墙兜底。
  if (window.__B3_WALL && window.__B3_WALL[style]) return window.__B3_WALL[style](ctx, px, py, h, map, tx, ty);
  if (typeof h !== "number") h = (typeof TILE === "number" ? TILE : 40);
  // Level 974：贝克米勒粉的墙纸，上面印着卡通形象
  // 同上：必须显式 return true，否则会被判成"没画"而转去画管道墙。
  if (style === "kittyhome") { drawKittyWall(ctx, px, py, h); return true; }
  // 5.2 胜景 / 5.3 普罗米修斯藏书馆 / 6.2 霓虹迷宫 / 11.3 红灯区
  // （和地板同理：这几个函数必须显式 return，否则会被判成"没画"而转去画管道墙）
  if (style === "vista" && window.drawVistaWall) return window.drawVistaWall(ctx, px, py, h, map, tx, ty);
  if (style === "prometheus" && window.drawPrometheusWall) return window.drawPrometheusWall(ctx, px, py, h, tx, ty);
  if (style === "neon62" && window.drawNeonWall) return window.drawNeonWall(ctx, px, py, h, tx, ty);
  if (style === "redlight" && window.drawRedlightWall) return window.drawRedlightWall(ctx, px, py, h, map, tx, ty);
  // Level 1.3 恶性肿瘤 / Level 15.1 枉然
  if (style === "tumor13" && window.drawTumorWall) return window.drawTumorWall(ctx, px, py, h, map, tx, ty);
  if (style === "futility" && window.drawFutilityWall) return window.drawFutilityWall(ctx, px, py, h, map, tx, ty);
  // 隐秘层级 —— 战地医院（14h）
  // Level 20 波瑞阿斯建筑：等候厅是白混凝土 + 灰瓷砖天花板，霓虹区是深蓝灰瓷砖 + 黑天花板
  if (style === "boreas20" && window.drawBoreasWall) return window.drawBoreasWall(ctx, px, py, h, map, tx, ty);
  if (style === "mash" && window.drawMashWall) return window.drawMashWall(ctx, px, py, h, map, tx, ty);
  if (style === "airport") { drawAirportWall(ctx, px, py, h, tx, ty); return true; }
  if (style === "airliner") { drawAirlinerWall(ctx, px, py, h, tx, ty, map); return true; }
  // 1.8.0：Level 27 岩体泉 / Level 28 终末美德 / 痛处（Level 0 里的一处地点）
  // 同上：必须显式 return true —— 否则会被判成"没画"而转去画 Level 2 的管道墙。
  if (style === "spring27" && window.drawSpring27Wall) return window.drawSpring27Wall(ctx, px, py, h, map, tx, ty);
  if (style === "virtue28" && window.drawVirtue28Wall) return window.drawVirtue28Wall(ctx, px, py, h, map, tx, ty);
  if (style === "pain0" && window.drawPainWall) return window.drawPainWall(ctx, px, py, h, map, tx, ty);
  // Level 363 你作弊了 / 隐秘层级 —— 破碎之地
  if (style === "cheat363" && window.drawCheat363Wall) return window.drawCheat363Wall(ctx, px, py, h, map, tx, ty);
  if (style === "shattered" && window.drawShatteredWall) return window.drawShatteredWall(ctx, px, py, h, map, tx, ty);
  if (style === "steamer26" && window.drawSteamer26Wall) return window.drawSteamer26Wall(ctx, px, py, h, map, tx, ty);
  // 1.3.1 批次：六个新层级的墙 / 虚空（天空、紫雾、林墙都不是黑的）
  if (style === "casino51" && window.drawCasino51Wall) return window.drawCasino51Wall(ctx, px, py, h, map, tx, ty);
  if (style === "forest39" && window.drawForest39Wall) return window.drawForest39Wall(ctx, px, py, h, map, tx, ty);
  if (style === "sky63" && window.drawSky63Wall) return window.drawSky63Wall(ctx, px, py, h, map, tx, ty);
  if (style === "sleep633" && window.drawSleep633Wall) return window.drawSleep633Wall(ctx, px, py, h, map, tx, ty);
  if (style === "path797" && window.drawPath797Wall) return window.drawPath797Wall(ctx, px, py, h, map, tx, ty);
  if (style === "desert46" && window.drawDesert46Wall) return window.drawDesert46Wall(ctx, px, py, h, map, tx, ty);
  if (style === "pool" || style === "poolred") {
    // 墙：灰色的瓷砖墙 —— 不是红的。37.1 的红是挂在墙上的红灯照出来的
    ctx.fillStyle = "#8e949b";
    ctx.fillRect(px, py, h, h);
    ctx.fillStyle = "rgba(255,255,255,.16)";
    ctx.fillRect(px + 1, py + 1, h / 2 - 1, h / 2 - 1);
    ctx.strokeStyle = "rgba(40,45,52,.55)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(px + 0.5, py); ctx.lineTo(px + 0.5, py + h);
    ctx.moveTo(px, py + 0.5); ctx.lineTo(px + h, py + 0.5);
    ctx.stroke();
    return true;
  }
  // 1.6.0：67 欲望烘焙坊 / 31 旱冰场 / 40 摇滚披萨 / 94 动画
  // 1.7.0：Level 29 海波利亚 / Level 284 需汝之地
  if (style === "isle29" && window.drawIsle29Floor) return window.drawIsle29Floor(ctx, px, py, h, map, tx, ty);
  if (style === "river284" && window.drawRiver284Floor) return window.drawRiver284Floor(ctx, px, py, h, map, tx, ty);
  if (style === "bakery67" && window.drawBakery67Floor) return window.drawBakery67Floor(ctx, px, py, h, map, tx, ty);
  if (style === "rink31" && window.drawRink31Floor) return window.drawRink31Floor(ctx, px, py, h, map, tx, ty);
  if (style === "rock40" && window.drawRock40Floor) return window.drawRock40Floor(ctx, px, py, h, map, tx, ty);
  if (style === "anime94" && window.drawAnime94Floor) return window.drawAnime94Floor(ctx, px, py, h, map, tx, ty);
  // 1.6.0：67 欲望烘焙坊 / 31 旱冰场 / 40 摇滚披萨 / 94 动画
  if (style === "isle29" && window.drawIsle29Wall) return window.drawIsle29Wall(ctx, px, py, h, map, tx, ty);
  if (style === "river284" && window.drawRiver284Wall) return window.drawRiver284Wall(ctx, px, py, h, map, tx, ty);
  if (style === "bakery67" && window.drawBakery67Wall) return window.drawBakery67Wall(ctx, px, py, h, map, tx, ty);
  if (style === "rink31" && window.drawRink31Wall) return window.drawRink31Wall(ctx, px, py, h, map, tx, ty);
  if (style === "rock40" && window.drawRock40Wall) return window.drawRock40Wall(ctx, px, py, h, map, tx, ty);
  if (style === "anime94" && window.drawAnime94Wall) return window.drawAnime94Wall(ctx, px, py, h, map, tx, ty);
  if (style === "library") {
    ctx.fillStyle = c[0];
    ctx.fillRect(px, py, h, h);
    // 墙面上一层层书架的影子
    ctx.fillStyle = "rgba(90,70,20,.22)";
    for (let i = 0; i < 3; i++) ctx.fillRect(px + 3, py + 5 + i * 11, h - 6, 7);
    return true;
  }
  if (style === "beach") {
    ctx.fillStyle = "#6b6250";           // 环山
    ctx.fillRect(px, py, h, h);
    return true;
  }
  // Level 25 街机厅：墙是深色护墙板，不能再用 c[0] —— 那正好是地面主色，
  // 结果墙和地面一个颜色，整层分不清哪能走。
  if (style === "arcade") {
    // 墙体：很深的紫黑 + 顶部一条暖色压条（黄铜色）。
    // 地面是紫灰 (#7a6a80) 配暗纹 (#4a3340)，所以墙必须明显更暗、且换个色调 ——
    // 只靠"更暗"还会和地面的暗纹撞色，加一条暖色压条才一眼分得清。
    ctx.fillStyle = "#241b2b";
    ctx.fillRect(px, py, h, h);
    ctx.fillStyle = "#8a6636";                    // 黄铜压条：暖色，地面里没有这个色
    ctx.fillRect(px, py, h, 5);
    ctx.fillStyle = "rgba(255,255,255,.18)";
    ctx.fillRect(px, py, h, 2);
    ctx.fillStyle = "rgba(0,0,0,.5)";             // 踢脚阴影
    ctx.fillRect(px, py + h - 6, h, 6);
    ctx.strokeStyle = "rgba(10,6,14,.85)"; ctx.lineWidth = 1;
    ctx.strokeRect(px + 0.5, py + 0.5, h - 1, h - 1);
    ctx.strokeStyle = "rgba(255,255,255,.06)";    // 竖向板材接缝
    for (let i = 1; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(px + (h / 3) * i + 0.5, py + 6); ctx.lineTo(px + (h / 3) * i + 0.5, py + h - 7);
      ctx.stroke();
    }
    return true;
  }
  // 深色混凝土楼梯：墙要比地面明显更深（地面 #3a3d42），否则整层是一块平板
  if (style === "endstair") {
    ctx.fillStyle = "#1e2024";
    ctx.fillRect(px, py, h, h);
    ctx.fillStyle = "rgba(255,255,255,.07)";
    ctx.fillRect(px, py, h, 5);
    ctx.fillStyle = "rgba(0,0,0,.45)";
    ctx.fillRect(px, py + h - 6, h, 6);
    ctx.strokeStyle = "rgba(8,9,11,.7)"; ctx.lineWidth = 1;
    ctx.strokeRect(px + 0.5, py + 0.5, h - 1, h - 1);
    return true;
  }
  // 环形楼梯（9223372036854775807）：墙压暗，跟地面拉开
  if (style === "stairs") {
    ctx.fillStyle = "#2f3238";
    ctx.fillRect(px, py, h, h);
    ctx.fillStyle = "rgba(255,255,255,.08)";
    ctx.fillRect(px, py, h, 5);
    ctx.fillStyle = "rgba(0,0,0,.45)";
    ctx.fillRect(px, py + h - 6, h, 6);
    ctx.strokeStyle = "rgba(12,13,16,.7)"; ctx.lineWidth = 1;
    ctx.strokeRect(px + 0.5, py + 0.5, h - 1, h - 1);
    return true;
  }
  // 交接点：一片白里也要能看出墙 —— 用带灰边的浅灰块
  if (style === "junction") {
    ctx.fillStyle = "#c3c8ce";
    ctx.fillRect(px, py, h, h);
    ctx.fillStyle = "rgba(255,255,255,.5)";
    ctx.fillRect(px, py, h, 5);
    ctx.fillStyle = "rgba(0,0,0,.30)";
    ctx.fillRect(px, py + h - 6, h, 6);
    ctx.strokeStyle = "rgba(70,76,84,.75)"; ctx.lineWidth = 1;
    ctx.strokeRect(px + 0.5, py + 0.5, h - 1, h - 1);
    return true;
  }
  ctx.fillStyle = c[0];
  ctx.fillRect(px, py, h, h);
  ctx.fillStyle = "rgba(0,0,0,.18)";
  ctx.fillRect(px, py + h - 5, h, 5);
  return true;
}

// ---------- 新增物件的绘制 ----------
function drawNewProps(ctx, g, cam) {
  const map = g.map;
  if (!map || !map.props) return;
  const T = (typeof TILE === "number" ? TILE : 40);
  for (const p of map.props) {
    if (!p || p.hidden) continue;
    if ((p.floor | 0) !== (g.floor | 0)) continue;
    const px = p.x * T, py = p.y * T;
    const hw = (cam.viewW || cam.w || 800) / 2 + T * 2;
    const hh = (cam.viewH || cam.h || 600) / 2 + T * 2;
    if (px < cam.x - hw || px > cam.x + hw || py < cam.y - hh || py > cam.y + hh) continue;
    if (p.type === "arcade") {
      const good = !p.broken;
      // 能用的那台要一眼认出来 —— 一层里有上百台被砸坏的机器，
      // 光靠"屏幕是绿的"根本分不清。给它一圈会呼吸的金边。
      if (good) {
        const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
        const pulse = 0.55 + 0.45 * Math.sin(t * 2.4);
        ctx.save();
        ctx.strokeStyle = "rgba(255,220,110," + (0.35 + 0.45 * pulse).toFixed(3) + ")";
        ctx.lineWidth = 2.5;
        ctx.strokeRect(px + 3.5, py + 1.5, T - 7, T - 3);
        ctx.restore();
      }
      ctx.fillStyle = good ? "#6a4780" : "#3a3238";
      ctx.fillRect(px + 5, py + 3, T - 10, T - 6);
      // 屏幕：能用的那台占满上半格，编号就写在屏幕里（写在别处会掉到机身外，看不清）
      const sx0 = px + 8, sy0 = py + 6, sw0 = T - 16, sh0 = T * 0.42;
      ctx.fillStyle = good ? "#10241a" : "#1b1a1e";
      ctx.fillRect(sx0, sy0, sw0, sh0);
      if (p.broken) {                 // 被砸坏的屏幕
        ctx.strokeStyle = "#3a2f36"; ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(sx0 + 2, sy0 + 2); ctx.lineTo(sx0 + sw0 - 2, sy0 + sh0 - 2);
        ctx.moveTo(sx0 + sw0 - 2, sy0 + 2); ctx.lineTo(sx0 + 2, sy0 + sh0 - 2);
        ctx.stroke();
      } else {
        // 屏幕上标着它能把你送到哪一层 —— 不然一排一模一样的机器根本分不清
        const lbl = (p.goTo != null ? String(p.goTo) : "25");
        ctx.fillStyle = "#7fe0a0";
        ctx.font = "bold " + Math.round(T * 0.34) + "px monospace";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(lbl, sx0 + sw0 / 2, sy0 + sh0 / 2 + 1);
        ctx.textBaseline = "alphabetic"; ctx.textAlign = "left";
        // 投币口
        ctx.fillStyle = "rgba(255,255,255,.75)";
        ctx.fillRect(px + T / 2 - 3, py + T - 10, 6, 3);
      }
      continue;
    }
    if (p.type === "boiler25") {
      // 旧锅炉：竖立的锈褐色圆罐 + 散热片 + 压力表 + 底下两根管子。
      // 之前它是一个方块加一条横杠，跟街机（方块 + 屏幕）几乎一个样，
      // 新玩家很容易把它当成"另一台机器"去按 E。现在完全换成工业设备的样子：
      // 没有屏幕、没有编号、没有金边 —— 一眼就知道它不能互动。
      const cx = px + T / 2;
      const bw = T - 14, bh = T - 12;              // 罐体
      const bx = px + 7, by = py + 6;
      // 底下的两根管子（先画，压在罐体下面）
      ctx.fillStyle = "#4a3728";
      ctx.fillRect(cx - bw * 0.36, by + bh - 5, 5, 8);
      ctx.fillRect(cx + bw * 0.20, by + bh - 5, 5, 8);
      // 罐体：锈褐渐变，中间亮两侧暗，才有圆柱的体积感
      const gr = ctx.createLinearGradient(bx, 0, bx + bw, 0);
      gr.addColorStop(0, "#4a3122");
      gr.addColorStop(0.35, "#7d5638");
      gr.addColorStop(0.62, "#6a472e");
      gr.addColorStop(1, "#3d281b");
      ctx.fillStyle = gr;
      ctx.fillRect(bx, by, bw, bh);
      // 顶部与底部的封头（椭圆）
      ctx.fillStyle = "#6b4a31";
      ctx.beginPath(); ctx.ellipse(cx, by + 2, bw / 2, 4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#39251a";
      ctx.beginPath(); ctx.ellipse(cx, by + bh - 2, bw / 2, 4, 0, 0, Math.PI * 2); ctx.fill();
      // 散热片：横向的凹槽
      ctx.strokeStyle = "rgba(30,18,10,.55)"; ctx.lineWidth = 1.4;
      for (let i = 1; i <= 3; i++) {
        const yy = by + 8 + i * ((bh - 14) / 4);
        ctx.beginPath(); ctx.moveTo(bx + 2, yy); ctx.lineTo(bx + bw - 2, yy); ctx.stroke();
      }
      // 压力表：白面 + 红针 —— 这是它跟街机最明显的区别
      const gx = cx, gy = by + bh * 0.32, rr = Math.max(4, T * 0.13);
      ctx.fillStyle = "#e8e2d0";
      ctx.beginPath(); ctx.arc(gx, gy, rr, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#3a2a1c"; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(gx, gy, rr, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = "#c0392b"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(gx, gy);
      ctx.lineTo(gx + rr * 0.55, gy - rr * 0.45); ctx.stroke();
      // 锈斑
      ctx.fillStyle = "rgba(120,60,30,.35)";
      ctx.fillRect(bx + 3, by + bh - 12, 4, 3);
      ctx.fillRect(bx + bw - 7, by + 6, 3, 4);
      continue;
    }
    if (p.type === "stairs37") {
      ctx.fillStyle = "#dfe8ea";
      for (let i = 0; i < 4; i++) ctx.fillRect(px + 4, py + T - 6 - i * 9, T - 8, 6);
      ctx.fillStyle = "#ffe97a"; ctx.fillRect(px + T / 2 - 2, py + 2, 4, 4);
      continue;
    }
    if (p.type === "redtunnel") {
      ctx.fillStyle = "#2a0f10"; ctx.fillRect(px + 3, py + 6, T - 6, T - 12);
      const on = (Math.sin((typeof gTimeRef === "number" ? gTimeRef : 0) * 3) * 0.5 + 0.5);
      ctx.fillStyle = "rgba(255,60,50," + (0.35 + on * 0.5).toFixed(2) + ")";
      ctx.beginPath(); ctx.arc(px + T / 2, py + T / 2, 7, 0, Math.PI * 2); ctx.fill();
      continue;
    }
    if (p.type === "pool4") {
      ctx.fillStyle = "#8a8f96"; ctx.fillRect(px + 8, py + 8, T - 16, T - 16);
      continue;
    }
    if (p === map.whitelight) {
      const on = 0.5 + Math.sin((typeof gTimeRef === "number" ? gTimeRef : 0) * 2) * 0.3;
      ctx.fillStyle = "rgba(255,255,255," + on.toFixed(2) + ")";
      ctx.beginPath(); ctx.arc(px + T / 2, py + T / 2, T * 0.42, 0, Math.PI * 2); ctx.fill();
      continue;
    }
    if (p.type === "existDoor" || p === map.existDoor) {
      ctx.fillStyle = (map.doomed ? "#4a3a3a" : "#6b5a2a");
      ctx.fillRect(px + 6, py + 2, T - 12, T - 4);
      ctx.fillStyle = map.doomed ? "#8a6a6a" : "#ffe97a";
      ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
      ctx.fillText(map.doomed ? "LOCKED" : "EXIST", px + T / 2, py + T / 2 + 3);
      ctx.textAlign = "left";
      continue;
    }
    if (p === map.stairTop) {
      ctx.fillStyle = "#4a4b52"; ctx.fillRect(px + 2, py + 2, T - 4, T - 4);
      ctx.fillStyle = "#8a8b92"; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
      ctx.fillText("封死", px + T / 2, py + T / 2 + 3); ctx.textAlign = "left";
      continue;
    }
    if (p === map.midHole || p === map.whiteHole || p === map.junctionHole) {
      const white = (p === map.whiteHole && !map.reachedTop);
      ctx.fillStyle = white ? "#2a2b30" : "#f6f8fa";
      ctx.beginPath(); ctx.arc(px + T / 2, py + T / 2, T * 0.36, 0, Math.PI * 2); ctx.fill();
      if (!white) {
        ctx.strokeStyle = "rgba(120,120,130,.5)"; ctx.lineWidth = 1; ctx.stroke();
      }
      continue;
    }
    if (p.type === "pillarEnd") {
      const cw = T * 0.52, cxx = px + T / 2;
      ctx.fillStyle = "#1f8f8a";
      ctx.fillRect(px + 7, py + 6, T - 14, T - 12);
      ctx.fillStyle = "#2fb3ad";
      ctx.fillRect(cxx - cw / 2, py + 6, cw, T - 12);
      ctx.fillStyle = "rgba(255,255,255,.22)";
      ctx.fillRect(cxx - cw / 2 + 2, py + 6, 3, T - 12);
      ctx.fillStyle = "#176e6a";
      ctx.fillRect(px + 5, py + T - 9, T - 10, 4);
      ctx.fillRect(px + 5, py + 5, T - 10, 4);
      ctx.strokeStyle = "#0d4f4c"; ctx.lineWidth = 1.2;
      ctx.strokeRect(px + 5.5, py + 5.5, T - 11, T - 11);
      continue;
    }
    if (p.type === "shelfEnd") {
      // 柜体：深棕色的木头，中间是竖向的隔板
      ctx.fillStyle = "#6b5330"; ctx.fillRect(px + 3, py + 4, T - 6, T - 8);
      ctx.fillStyle = "#4e3a1f"; ctx.fillRect(px + 3, py + 4, T - 6, 3);   // 顶板
      ctx.fillStyle = "rgba(30,20,8,.35)";
      for (let i = 1; i < 4; i++) ctx.fillRect(px + 3 + i * ((T - 6) / 4), py + 7, 1, T - 14);

      const bk = (map.books || []).find((b) => b.x === p.x && b.y === p.y);
      // 大多数书柜是空的 —— 只有插着那本书的这一格才摆书
      if (bk) {
        // 七本书的书脊（暗色，条与条之间露着柜子的深色），中间那本是带数字的
        const BCOL = { red: "#7a2b28", blue: "#2b3a5c", green: "#2f4638", purple: "#3d2c50" };
        const N = 7, sw = (T - 10) / N;
        for (let i = 0; i < N; i++) {
          const bx = px + 5 + i * sw;
          const isThe = i === 3;
          ctx.fillStyle = isThe ? (BCOL[bk.color] || "#555")
            : ["#2b3a5c", "#2f4638", "#5a2a2a", "#3d2c50", "#3a2f22"][(i + p.x) % 5];
          ctx.fillRect(bx, py + 8, sw - 1.5, T - 17);          // 留缝，不挤满
          if (isThe) {
            ctx.fillStyle = "#e8e2d0";                          // 数字：只占这一格
            ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
            ctx.fillText(String(bk.digit), bx + (sw - 1.5) / 2, py + T / 2 + 3);
            ctx.textAlign = "left";
          }
        }
      }
      continue;
    }
    if (p.type === "bookEnd") {
      const COL = { red: "#c8443c", blue: "#3f6fc8", green: "#3f9c58", purple: "#8a4fc8" };
      ctx.fillStyle = COL[p.color] || "#888";
      ctx.fillRect(px + 9, py + 5, T - 18, T - 10);
      ctx.fillStyle = "#fff"; ctx.font = "bold 13px monospace"; ctx.textAlign = "center";
      ctx.fillText(String(p.digit), px + T / 2, py + T / 2 + 5);
      ctx.textAlign = "left";
      continue;
    }
    if (p.type === "exitDoorEnd") {
      ctx.fillStyle = "#2f3a2a"; ctx.fillRect(px + 5, py + 2, T - 10, T - 4);
      ctx.fillStyle = "#7fe0a0"; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
      ctx.fillText("EXIT", px + T / 2, py + T / 2 + 3); ctx.textAlign = "left";
      continue;
    }
    if (p.type === "darkDoorEnd") {
      ctx.fillStyle = "#1b1a20"; ctx.fillRect(px + 5, py + 2, T - 10, T - 4);
      ctx.strokeStyle = "#5a4a6a"; ctx.strokeRect(px + 5.5, py + 2.5, T - 11, T - 5);
      continue;
    }
    if (p.type === "whiteHole") {
      // 最下方的白色光洞
      const on = 0.55 + Math.sin((typeof gTimeRef === "number" ? gTimeRef : 0) * 2) * 0.35;
      ctx.fillStyle = "rgba(255,255,255," + on.toFixed(2) + ")";
      ctx.beginPath(); ctx.arc(px + T / 2, py + T / 2, T * 0.46, 0, Math.PI * 2); ctx.fill();
      continue;
    }
    if (p.type === "stairUp") {
      ctx.fillStyle = "#8a8d95";
      for (let i = 0; i < 4; i++) ctx.fillRect(px + 4 + i * 2, py + T - 6 - i * 8, T - 8 - i * 4, 6);
      ctx.fillStyle = "#ffe97a"; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
      ctx.fillText("上", px + T / 2, py + 12); ctx.textAlign = "left";
      continue;
    }
    if (p.type === "grooveEnd") {
      const COL = { red: "#c8443c", blue: "#3f6fc8", green: "#3f9c58", purple: "#8a4fc8" };
      ctx.fillStyle = COL[p.color] || "#888";
      ctx.globalAlpha = p.done ? 1 : 0.55;
      ctx.fillRect(px + 10, py + 10, T - 20, T - 20);
      ctx.globalAlpha = 1;
      continue;
    }
  }
}

// ===========================================================
// 通往新层级的入口物件（挂在已有层级上）
//   Level 11：标着 EXIST 的门 -> Level 994
//   Level 70：标着 37 的门   -> Level 37
//   Level 4 ：小屋子里像保安室橱柜的门 -> Level 25
// ===========================================================
function spawnNewLevelLinks(map) {
  if (!map || !map.floors) return map;
  const lv = String(map.level);
  const floors = map.floors[0] || [];
  if (!floors.length) return map;
  const st = map.start || { x: 0, y: 0 };
  const dist0 = (t) => Math.hypot(t.x - st.x, t.y - st.y);
  const wet = (t) => !!(map.pools && map.pools.has(t.x + "," + t.y));
  const far = floors.filter((t) => dist0(t) > 12);
  const dry = far.filter((t) => !wet(t));      // 机器不该泡在水里
  const pick = () => {
    const pool = dry.length ? dry : far;
    return pool.length ? pool[randInt(0, pool.length - 1)] : null;
  };
  const put = (type, t) => {
    if (!t) return;
    map.props = map.props || [];
    map.props.push({ type, x: t.x, y: t.y, floor: 0 });
  };
  if (lv === "11") put("exist11", pick());
  // Level 11：那间屋子里的毛绒玩具熊 —— 一件可爱物件。
  // 带着它切行时，有极小概率被送到 Level 974 而不是原本要去的层级。
  if (lv === "11") {
    let spot = null;
    for (const t of floors) {
      if (wet(t)) continue;
      if (map.indoors && map.indoors.has(t.x + "," + t.y)) { spot = t; break; }
    }
    if (!spot) spot = pick();
    if (spot) {
      map.ground = map.ground || [];
      if (!map.ground.some((g2) => g2.item === "teddy")) {
        map.ground.push({ x: spot.x, y: spot.y, floor: 0, item: "teddy", taken: false });
      }
    }
  }
  // Level 11：城市**最左边**那团霓虹雾 -> 新时代广场。
  // 以前只放了 EXIST 门，紫雾根本没生成，所以玩家永远看不见。
  if (lv === "11") {
    let left = null;
    for (const t of floors) {
      if (wet(t)) continue;
      if (!left || t.x < left.x) left = t;
    }
    put("neonfog11", left);
  }
  // Level 11 / 9：跟随带有飞机符号的指示牌 -> Level 36 永恒机场
  // （档案里的通用入口：在 Level 11、Level 9 和 Level 159 跟随带有飞机符号的指示牌）
  if (lv === "11" || lv === "9") {
    const t = pick();
    if (t) {
      map.props = map.props || [];
      map.props.push({ type: "planesign36", x: t.x, y: t.y, floor: 0, toLevel: 36,
        tip: "一块指示牌，上面画着一架飞机，底下写着 36", label: "36" });
      map.planesign36 = map.props[map.props.length - 1];
    }
  }
  else if (lv === "70") put("door37", pick());
  else if (lv === "4") put("guarddoor25", pick());
  // Level 1：墙上那扇"假的窗户" -> Level 1.5 颠倒
  // （u/Chaosraider98 一直劝人别去探索"假的窗户"—— 碰上去就被拽进去了）
  if (lv === "1") {
    const t = pick();
    if (t) {
      map.props = map.props || [];
      map.props.push({ type: "fakewin15", x: t.x, y: t.y, floor: 0, toLevel: "1.5",
        tip: "墙上有一扇窗户 —— 可窗外的东西怎么看都不像是 Level 1", label: "?" });
      map.fakewin15 = map.props[map.props.length - 1];
    }
    // Level 1 -> 1.3 恶性肿瘤：一面被封锁的白墙（有守卫看着）；
    // 想进去会被守卫拦下，得另外找一个空子钻。
    const t2 = pick(), t3 = pick();
    if (t2) {
      map.props = map.props || [];
      map.props.push({ type: "blocked13", x: t2.x, y: t2.y, floor: 0,
        tip: "一面白墙，前面拉着封锁线 —— 守卫挡在那儿，不准进" });
      map.blocked13 = map.props[map.props.length - 1];
      // 守卫：两个，就站在封锁口前面
      map.props.push({ type: "guard13", x: t2.x, y: t2.y, floor: 0 });
    }
    if (t3 && (!t2 || t3.x !== t2.x || t3.y !== t2.y)) {
      map.props = map.props || [];
      map.props.push({ type: "gap13", x: t3.x, y: t3.y, floor: 0, toLevel: "1.3",
        tip: "封锁线有个空子 —— 墙根底下能钻过去，里头白得刺眼" });
      map.gap13 = map.props[map.props.length - 1];
    }
  }
  // Level 3：有些门会通向 Level 3.5 电都某座大厦内的门
  if (lv === "3") {
    const t = pick();
    if (t) {
      map.props = map.props || [];
      map.props.push({ type: "door35", x: t.x, y: t.y, floor: 0, toLevel: "3.5",
        tip: "一扇通向别处的门 —— 门缝里透着雷暴的白光", label: "3.5" });
      map.door35 = map.props[map.props.length - 1];
    }
  }
  // Level 5：走廊上钉着一块写着「外部」或「胜景」的牌子，尽头那扇门 -> Level 5.2；
  //       一条新发现的走廊（就在 M.E.G「家政服务」基地旁边）-> Level 5.3 普罗米修斯藏书馆
  if (lv === "5") {
    const t1 = pick(), t2 = pick();
    if (t1) {
      map.props = map.props || [];
      map.props.push({ type: "sign52", x: t1.x, y: t1.y, floor: 0, toLevel: "5.2",
        tip: "走廊尽头那扇门，门楣上钉着一块牌子，写着「胜景」", label: "胜景" });
      map.sign52 = map.props[map.props.length - 1];
    }
    if (t2 && (!t1 || t2.x !== t1.x || t2.y !== t1.y)) {
      map.props = map.props || [];
      map.props.push({ type: "door53in", x: t2.x, y: t2.y, floor: 0, toLevel: "5.3",
        tip: "一条从没见过的走廊 —— 空气里有旧书和木头的味道" });
      map.door53in = map.props[map.props.length - 1];
    }
  }
  // Level 6：那一处不会照亮别的区域的霓虹灯光 -> Level 6.2 霓虹迷宫
  if (lv === "6") {
    const t = pick();
    if (t) {
      map.props = map.props || [];
      map.props.push({ type: "neonentry62", x: t.x, y: t.y, floor: 0, toLevel: "6.2",
        tip: "黑里有处霓虹灯亮着 —— 它只照亮自己脚下那一圈，别处仍是黑的" });
      map.neonentry62 = map.props[map.props.length - 1];
    }
  }
  // Level 11：市郊那条漆黑的小巷（窗里透着红光）-> Level 11.3 红灯区
  if (lv === "11") {
    // 市郊 = 离城市中心最远的那一带
    let sub = null, sd = -1;
    const cx0 = (map.size || 92) / 2, cy0 = (map.size || 92) / 2;
    for (const t of floors) {
      if (wet(t)) continue;
      if (dist0(t) < 12) continue;
      const d = Math.hypot(t.x - cx0, t.y - cy0);
      if (d > sd) { sd = d; sub = t; }
    }
    const t = sub || pick();
    if (t) {
      map.props = map.props || [];
      map.props.push({ type: "alley113", x: t.x, y: t.y, floor: 0, toLevel: "11.3",
        tip: "一条漆黑的小巷，楼上的窗里透着红光 —— 那不像是不夜城该有的东西" });
      map.alley113 = map.props[map.props.length - 1];
    }
  }
  // 1.8.0：Level 11 —— 一处洞穴 -> Level 27 岩体泉
  if (lv === "11") {
    const t = pick();
    if (t) {
      map.props = map.props || [];
      map.props.push({ type: "cave27", x: t.x, y: t.y, floor: 0, toLevel: 27,
        tip: "墙上塌开一个洞口，里头冒着湿热的水汽 —— 像是一口温泉" });
      map.cave27 = map.props[map.props.length - 1];
    }
  }
  // 1.8.0：Level 14 —— 一只粉色的蝴蝶 -> Level 28 终末美德
  if (lv === "14") {
    const t = pick();
    if (t) {
      map.props = map.props || [];
      map.props.push({ type: "bfly28", x: t.x, y: t.y, floor: 0, toLevel: 28,
        tip: "一只粉色的蝴蝶停在那儿 —— 跟上去" });
      map.bfly28 = map.props[map.props.length - 1];
    }
  }
  // 1.8.0：Level 0 —— 有时会出现一团灰雾挡住去路 -> 痛处
  if (lv === "0") {
    const t = pick();
    if (t) {
      map.props = map.props || [];
      map.props.push({ type: "grayfog0", x: t.x, y: t.y, floor: 0, toLevel: "pain",
        tip: "一团灰雾挡在前面 —— 走进去" });
      map.grayfog0 = map.props[map.props.length - 1];
    }
  }
  // Level 25 的出口层级同时也是入口层级 —— 在这些层里找到一台街机就能进 Level 25。
  if (ARCADE25_HOSTS.indexOf(lv) >= 0) {
    const t = pick();
    if (t) {
      map.props = map.props || [];
      map.props.push({ type: "arcade", x: t.x, y: t.y, floor: 0, broken: false, goTo: 25 });
      map.arcade25 = map.props[map.props.length - 1];
    }
  }
  return map;
}

// 能作为 Level 25 入口的层级（= Level 25 的出口层级）

// ===========================================================
// 野生迁跃浆果丛 / 一盒迁跃浆果（Level 4、5、10、11）
// ===========================================================
window.PROP_DRAW = window.PROP_DRAW || {};
window.PROP_DRAW["berrybush"] = function (ctx, p, T) {
  const cx = 0, cy = 0;
  // 底下一圈暗影
  ctx.fillStyle = "rgba(0,0,0,.28)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.30, T * 0.34, T * 0.13, 0, 0, 6.2832); ctx.fill();
  // 枝条
  ctx.strokeStyle = "#4a3b22"; ctx.lineWidth = Math.max(1, T * 0.05);
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(i * T * 0.10, T * 0.30);
    ctx.quadraticCurveTo(i * T * 0.22, T * 0.02, i * T * 0.15, -T * 0.22);
    ctx.stroke();
  }
  // 叶子
  ctx.fillStyle = "#3f6b34";
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * 6.2832 + 0.6;
    ctx.beginPath();
    ctx.ellipse(Math.cos(a) * T * 0.24, -T * 0.12 + Math.sin(a) * T * 0.12,
      T * 0.13, T * 0.07, a, 0, 6.2832);
    ctx.fill();
  }
  // 浆果：紫得发黑
  const pts = [[-0.16, -0.02], [0.15, -0.06], [0.02, -0.20], [-0.05, 0.12], [0.20, 0.14]];
  for (const q of pts) {
    ctx.fillStyle = "#2b1140";
    ctx.beginPath(); ctx.arc(q[0] * T, q[1] * T, T * 0.085, 0, 6.2832); ctx.fill();
    ctx.fillStyle = "#6b3fa0";
    ctx.beginPath(); ctx.arc(q[0] * T, q[1] * T, T * 0.062, 0, 6.2832); ctx.fill();
    ctx.fillStyle = "rgba(220,190,255,.55)";
    ctx.beginPath(); ctx.arc(q[0] * T - T * 0.022, q[1] * T - T * 0.026, T * 0.022, 0, 6.2832); ctx.fill();
  }
};
window.PROP_DRAW["berrybox"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(0,0,0,.30)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.26, T * 0.32, T * 0.11, 0, 0, 6.2832); ctx.fill();
  // 盒身
  ctx.fillStyle = "#8d6a43";
  ctx.fillRect(-T * 0.30, -T * 0.10, T * 0.60, T * 0.34);
  ctx.fillStyle = "#6d4f30";
  ctx.fillRect(-T * 0.30, T * 0.14, T * 0.60, T * 0.10);
  // 盒盖的边
  ctx.strokeStyle = "#4a3520"; ctx.lineWidth = Math.max(1, T * 0.035);
  ctx.strokeRect(-T * 0.30, -T * 0.10, T * 0.60, T * 0.34);
  // 露出来的四颗浆果
  const xs = [-0.19, -0.06, 0.07, 0.20];
  for (const q of xs) {
    ctx.fillStyle = "#2b1140";
    ctx.beginPath(); ctx.arc(q * T, -T * 0.14, T * 0.082, 0, 6.2832); ctx.fill();
    ctx.fillStyle = "#6b3fa0";
    ctx.beginPath(); ctx.arc(q * T, -T * 0.14, T * 0.058, 0, 6.2832); ctx.fill();
    ctx.fillStyle = "rgba(220,190,255,.55)";
    ctx.beginPath(); ctx.arc(q * T - T * 0.02, -T * 0.165, T * 0.02, 0, 6.2832); ctx.fill();
  }
};

// ===========================================================
// 通往新层级的入口门 —— 专属模型
//   以前这三扇门只在 spawnNewLevelLinks 里被摆进地图，**没有任何绘制分支**：
//   drawProps 因为 NEW_PROP_TYPES 里列了它们而跳过，drawNewProps 又只认
//   994 那一侧的 existDoor，于是它们在各自的层级里**完全隐形** ——
//   交互是好的（走到跟前能识别、按 E 能推），但玩家谁也看不见。
//     Level 11：标着 EXIST 的门 -> Level 994
//     Level 70：标着 37 的门   -> Level 37
//     Level 4 ：保安室橱柜样式的门 -> Level 25
// ===========================================================
window.PROP_DRAW = window.PROP_DRAW || {};

window.PROP_DRAW["exist11"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  // 暖色光晕：不夜城是灰的，这圈黄光老远就能认出来
  const gl = ctx.createRadialGradient(0, 0, 1, 0, 0, T * 0.95);
  gl.addColorStop(0, "rgba(255,220,120,.22)");
  gl.addColorStop(1, "rgba(255,220,120,0)");
  ctx.fillStyle = gl;
  ctx.beginPath(); ctx.arc(0, 0, T * 0.95, 0, 6.2832); ctx.fill();
  // 地面影子
  ctx.fillStyle = "rgba(0,0,0,.38)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.33, T * 0.32, T * 0.10, 0, 0, 6.2832); ctx.fill();
  // 混凝土门框
  ctx.fillStyle = "#4e4d49";
  ctx.fillRect(-T * 0.32, -T * 0.36, T * 0.64, T * 0.66);
  ctx.fillStyle = "#6a6964";
  ctx.fillRect(-T * 0.32, -T * 0.36, T * 0.64, T * 0.10);      // 门楣
  ctx.fillStyle = "#2a241a";
  ctx.fillRect(-T * 0.26, -T * 0.26, T * 0.52, T * 0.55);      // 门洞里的黑
  // 门板：橄榄黄铜，跟 994 那一侧同一块料
  ctx.fillStyle = "#6b5a2a";
  ctx.fillRect(-T * 0.24, -T * 0.24, T * 0.48, T * 0.53);
  ctx.strokeStyle = "#3f3416"; ctx.lineWidth = Math.max(1, T * 0.03);
  ctx.strokeRect(-T * 0.24, -T * 0.24, T * 0.48, T * 0.53);
  // 两块凹板
  ctx.strokeStyle = "rgba(60,48,18,.75)"; ctx.lineWidth = Math.max(1, T * 0.022);
  ctx.strokeRect(-T * 0.17, -T * 0.18, T * 0.34, T * 0.17);
  ctx.strokeRect(-T * 0.17, T * 0.04, T * 0.34, T * 0.20);
  // 门缝里透出的光
  ctx.fillStyle = "rgba(255,233,122,.30)";
  ctx.fillRect(T * 0.22, -T * 0.24, T * 0.03, T * 0.53);
  // 门把手
  ctx.fillStyle = "#d8c268";
  ctx.beginPath(); ctx.arc(T * 0.15, T * 0.03, T * 0.036, 0, 6.2832); ctx.fill();
  // 门楣上的 EXIST 牌子（会呼吸）
  // 底色打满不透明：不夜城有一层夜色压暗（实测整体乘 0.69），
  // 半透明的牌子被压过之后就跟水泥门楣糊成一块，等于白画。
  const on = 0.72 + 0.28 * Math.sin(t * 2.2);
  ctx.save();
  ctx.shadowColor = "rgba(255,233,122," + Math.max(0, on - 0.2).toFixed(2) + ")";
  ctx.shadowBlur = Math.max(4, T * 0.22);
  ctx.fillStyle = "#ffe97a";
  ctx.fillRect(-T * 0.20, -T * 0.345, T * 0.40, T * 0.085);
  ctx.shadowBlur = 0;
  ctx.restore();
  ctx.fillStyle = "#3a2f10";
  ctx.font = "bold " + Math.max(7, T * 0.085).toFixed(1) + "px monospace";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("EXIST", 0, -T * 0.302);
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
};

window.PROP_DRAW["door37"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  const gl = ctx.createRadialGradient(0, 0, 1, 0, 0, T * 0.9);
  gl.addColorStop(0, "rgba(150,220,255,.20)");
  gl.addColorStop(1, "rgba(150,220,255,0)");
  ctx.fillStyle = gl;
  ctx.beginPath(); ctx.arc(0, 0, T * 0.9, 0, 6.2832); ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,.38)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.33, T * 0.30, T * 0.09, 0, 0, 6.2832); ctx.fill();
  // 结霜的金属门框
  ctx.fillStyle = "#7f8b93";
  ctx.fillRect(-T * 0.30, -T * 0.34, T * 0.60, T * 0.62);
  ctx.fillStyle = "#9fb0ba";
  ctx.fillRect(-T * 0.30, -T * 0.34, T * 0.60, T * 0.08);
  ctx.fillStyle = "#2b3138";
  ctx.fillRect(-T * 0.24, -T * 0.26, T * 0.48, T * 0.53);
  // 门板：冷灰钢
  ctx.fillStyle = "#5d6a72";
  ctx.fillRect(-T * 0.22, -T * 0.24, T * 0.44, T * 0.51);
  ctx.strokeStyle = "#38434a"; ctx.lineWidth = Math.max(1, T * 0.028);
  ctx.strokeRect(-T * 0.22, -T * 0.24, T * 0.44, T * 0.51);
  // 霜
  ctx.fillStyle = "rgba(226,244,255,.28)";
  ctx.fillRect(-T * 0.22, -T * 0.24, T * 0.44, T * 0.10);
  // 门把手
  ctx.fillStyle = "#cfd8dd";
  ctx.fillRect(T * 0.12, -T * 0.02, T * 0.09, T * 0.035);
  // 门牌：37
  const on = 0.72 + 0.28 * Math.sin(t * 2.0);
  ctx.save();
  ctx.shadowColor = "rgba(190,232,255," + Math.max(0, on - 0.2).toFixed(2) + ")";
  ctx.shadowBlur = Math.max(4, T * 0.22);
  ctx.fillStyle = "#dff1ff";
  ctx.fillRect(-T * 0.13, -T * 0.325, T * 0.26, T * 0.085);
  ctx.shadowBlur = 0;
  ctx.restore();
  ctx.fillStyle = "#26333b";
  ctx.font = "bold " + Math.max(7, T * 0.10).toFixed(1) + "px monospace";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("37", 0, -T * 0.282);
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
};

window.PROP_DRAW["guarddoor25"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  const gl = ctx.createRadialGradient(0, 0, 1, 0, 0, T * 0.9);
  gl.addColorStop(0, "rgba(120,255,180,.18)");
  gl.addColorStop(1, "rgba(120,255,180,0)");
  ctx.fillStyle = gl;
  ctx.beginPath(); ctx.arc(0, 0, T * 0.9, 0, 6.2832); ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,.35)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.30, T * 0.28, T * 0.08, 0, 0, 6.2832); ctx.fill();
  // 保安室那种铁皮柜门
  ctx.fillStyle = "#6e7378";
  ctx.fillRect(-T * 0.28, -T * 0.32, T * 0.56, T * 0.58);
  ctx.strokeStyle = "#3d4247"; ctx.lineWidth = Math.max(1, T * 0.028);
  ctx.strokeRect(-T * 0.28, -T * 0.32, T * 0.56, T * 0.58);
  // 柜门两扇 + 中缝
  ctx.strokeStyle = "#4a4f54"; ctx.lineWidth = Math.max(1, T * 0.022);
  ctx.beginPath(); ctx.moveTo(0, -T * 0.30); ctx.lineTo(0, T * 0.24); ctx.stroke();
  // 百叶通风口
  ctx.strokeStyle = "#525a60";
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(-T * 0.20, -T * 0.16 + i * T * 0.06);
    ctx.lineTo(-T * 0.06, -T * 0.16 + i * T * 0.06);
    ctx.moveTo(T * 0.06, -T * 0.16 + i * T * 0.06);
    ctx.lineTo(T * 0.20, -T * 0.16 + i * T * 0.06);
    ctx.stroke();
  }
  // 把手
  ctx.fillStyle = "#b9c0c6";
  ctx.fillRect(-T * 0.05, T * 0.00, T * 0.035, T * 0.10);
  ctx.fillRect(T * 0.02, T * 0.00, T * 0.035, T * 0.10);
  // 门牌：25
  const on = 0.72 + 0.28 * Math.sin(t * 2.4);
  ctx.save();
  ctx.shadowColor = "rgba(150,255,200," + Math.max(0, on - 0.2).toFixed(2) + ")";
  ctx.shadowBlur = Math.max(4, T * 0.22);
  ctx.fillStyle = "#b6ffd4";
  ctx.fillRect(-T * 0.13, -T * 0.305, T * 0.26, T * 0.08);
  ctx.shadowBlur = 0;
  ctx.restore();
  ctx.fillStyle = "#1e3328";
  ctx.font = "bold " + Math.max(7, T * 0.10).toFixed(1) + "px monospace";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("25", 0, -T * 0.264);
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
};
