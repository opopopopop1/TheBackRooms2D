// ===========================================================
// 1.2.0 新增批次的"通用绘制底座"
//
// 这一批层级（6.1 / 10.1 / 12 / 17 / 49 / 49.1 / 71 / 109 / 119 / 287 /
// 484 / 485 / 486 / 512 / 666 / 790 / 900 / 998 / 999 / 1000 /
// 黯洃銫 / 尘封的感叹号 / 蓝色通道）每个都有自己的 js 文件，
// 这里只放它们共用的地面 / 墙体绘制与"特殊物件"注册表。
//
// 特殊物件一律走 window.PROP_DRAW 注册各自的模型 —— 不再拿桌子/箱子顶替。
// ===========================================================
"use strict";

// ---------- 地面 / 墙体配色 ----------
// [地面主色, 地面次色, 墙色]
// 注意：地面主色的亮度别低于 ~55（RGB 均值）。
// 迷雾会把画面压到原来的 6 成左右，底色太暗的层级（地狱 / 尸湖 / 蒙黑天空）
// 压完之后就真的一片黑，玩家连自己在哪儿都看不见。
const BATCHTILE = {
  foodcourt:  ["#8d8f86", "#76786f", "#5a5c55"],   // 6.1 零食室：商场餐厅的灰白地砖
  deadlake:   ["#6a4a3e", "#523a30", "#4a3a30"],   // 10.1 尸湖：暗红浑浊的毒水
  matrix:     ["#f2f2ef", "#e6e6e2", "#dcdcd6"],   // 12 矩阵：白色油漆房间
  carrier:    ["#4a5058", "#3d434a", "#5a626c"],   // 17 航空母舰：舰用钢板
  trench:     ["#4a4234", "#3a3328", "#5a5040"],   // 49 战壕：厚重潮湿的泥土
  trenchpsi:  ["#4a4638", "#3a362c", "#4a463c"],   // 49.1：雾中的战场
  voidbase:   ["#6b6b6b", "#5c5c5c", "#7a7a7a"],   // 71 地下虚空：砂砾（只有黑白灰）
  hospital:   ["#dfe6e8", "#cdd6d9", "#9fb0b4"],   // 109 霓虹医院： hospital 走廊
  // 119 水上乐园：走道是晒得发白的暖色水泥 / 水磨石 —— 以前整层铺的是
  // 蓝青色，玩家一看就觉得"这层是水做的"。
  // 蓝的只该是池子里的水（见 drawBatchFloor 里的 map.water 分支）。
  waterpark:  ["#cdc6b4", "#bcb5a3", "#9aa2a6"],
  glitchhall: ["#eceae6", "#dcdad5", "#c8c6c0"],   // 287 故障大厅：白墙
  whitehouse: ["#f4f2ee", "#e8e6e2", "#dedcd6"],   // 484 茫白景象
  blacksky:   ["#4a4640", "#38342e", "#5c564c"],   // 485 蒙黑天空：暗，但看得见轮廓
  sinland:    ["#4a4a3a", "#3a3a2c", "#5a5a48"],   // 486 罪恶之地：被污染的森林
  template:   ["#d8d2c4", "#c8c2b4", "#a89a80"],   // 512 模版：普通住宅
  hell:       ["#5c2a26", "#48201c", "#2e1a18"],   // 666 地狱：焦土与暗红的火光
  snowtown:   ["#dfe6ec", "#cdd6de", "#8a949c"],   // 790 在劫难逃：积雪的街道
  mattress:   ["#c8bfae", "#b8af9e", "#9a9080"],   // 900 休息区：床垫商店
  cloudplane: ["#eef0f4", "#dde0e6", "#c8ccd4"],   // 998 云层平面
  lastisland: ["#9a9a94", "#8a8a84", "#7a7a74"],   // 999 终焉之岛：灰度
  nature:     ["#7aa85c", "#6a9850", "#5a8040"],   // 1000 自然风景：起伏草甸
  anse:       ["#8a8a8a", "#7a7a7a", "#6a6a6a"],   // 黯洃銫：灰度
  exclam:     ["#4a4844", "#3e3c38", "#5a5852"],   // 尘封的感叹号：积灰的金属
  bluevoid:   ["#1a3a8a", "#16347a", "#22469c"],   // 蓝色通道
  // ---- 这一批：301 希望之窗 / 171 堂皇幻象 / 11.1 新时代广场 ----
  hopewindow: ["#6e6e68", "#60605a", "#4a4a44"],   // 301：灰墙厚灰，暗但看得见轮廓
  grandeur:   ["#7a6a52", "#6a5a44", "#5a4c3a"],   // 171：1930 年代中庭，富贵之后的腐坏
  newera:     ["#5a5a64", "#52525c", "#6a6a74"],   // 11.1：夜里的广场，霓虹另算
  // ---- 1.3.0 批次 ----
  // 1.5 颠倒：地面是"被亮光替换掉的黑暗"，惨白刺眼；墙也是亮的
  inverted:   ["#dfe6ea", "#d3dbe1", "#c2ccd4"],
  // 3.5 电都：单色调的粗野主义混凝土城，只有灰
  electro:    ["#464a50", "#3f4348", "#6a6e74"],
  // ---- 1.4.0 批次 ----
  // 0.1 天顶站：金属板地面 + 冷蓝灰舱壁 —— 都不黑，轮廓看得清
  zenith:     ["#c8ccd2", "#b8bcc4", "#5a6672"],
  // 289 过载：四个子区各有各的色，具体色在 level289.js 的 zoneTint 里
  overload:   ["#6a6250", "#5a5344", "#4a4438"],
  // ---- 1.5.0 批次 ----
  // 78 空间站：浅灰金属格栅板地面 + 米白舱壁 —— 都不黑，轮廓看得清
  station78:  ["#9aa2aa", "#8a929a", "#b8bec6"],
  // 599 群星：恒星内部。地面与墙都是亮的（金白），这一层本就刺眼
  star599:    ["#f0c070", "#e8a850", "#ffdca0"],
  // ---- 1.5.1 批次 ----
  // 22 颓垣：塌掉的停车场 —— 三层水泥，越往上越干净（都不黑，轮廓看得清）
  ruin22:     ["#8e897c", "#7e796c", "#6f6a5e"],
  // 33 无尽购物体验：入口那头是干净的商场白瓷砖（越往右越烂，按腐化度另算）
  mall33:     ["#e2e0d8", "#d2d0c8", "#c6c4bc"],
  // ---- 1.6.0 批次 ----
  // 45 深渊公司：楼里的地面按建筑用途各有各的色（写字楼的地毯 / 医院的瓷砖 …），
  // 这张表只是兜底；虚空（楼与楼之间）由 drawAbyss45Wall 自己画，不是黑的。
  abyss45:    ["#8e9094", "#7e8086", "#5a5c62"],
  // ---- 1.9.0 批次 ----
  // 24 月球：铅基浅灰色涂料的月面（都不是黑的，轮廓看得清）
  moon24:     ["#a8aaac", "#9a9ca0", "#6c6e76"],
  // 56 冷冻致伤：外围潮湿岩石的灰褐（越往中心越蓝越亮，按 ring 另算）
  frost56:    ["#68625a", "#5c564f", "#7fa8c8"],
  // 57 白日美术馆：抛光地面的浅米色 + 展墙的白
  gallery57:  ["#efe9dc", "#e2dccc", "#c9bfa8"],
};
// 虚空格（蓝色通道那类没有地面的地方）的颜色。
// 以前一律画成近黑 #0a0a0c —— 蓝色通道整层都是虚空格，
// 于是"令人目眩的蓝色虚空"被画成了一片纯黑。
const BATCHVOID = {
  bluevoid: "#2a56a8",     // 蓝色通道：本该是刺眼的蓝
  voidbase: "#141416",     // 71 地下虚空：只有黑白灰，这里留暗
};

function batchTile(style) { return BATCHTILE[style] || null; }

// ---------- 地面 ----------
function drawBatchFloor(ctx, px, py, h, style, map, tx, ty) {
  // Level 0.7 忆域：六个年代各有各的地面，由 level0.7.js 自己画
  if (style === "memorydomain" && window.drawEraFloor) {
    return window.drawEraFloor(ctx, px, py, h, style, map, tx, ty);
  }
  // 注意：这里还在 BATCHTILE 查表之前，S 尚未定义，自己取一次格子边长
  if (style === "inverted" && window.drawInvertedFloor) {
    return window.drawInvertedFloor(ctx, px, py, (typeof TILE === "number" ? TILE : 40), tx, ty);
  }
  if (style === "electro" && window.drawElectroFloor) {
    return window.drawElectroFloor(ctx, px, py, (typeof TILE === "number" ? TILE : 40), map, tx, ty);
  }
  // 0.1 天顶站 / 289 过载：各有专属画法（桥的铁网、深渊、四个子区的色）
  if (style === "zenith" && window.drawZenithFloor) {
    return window.drawZenithFloor(ctx, px, py, (typeof TILE === "number" ? TILE : 40), map, tx, ty);
  }
  if (style === "overload" && window.drawOverloadFloor) {
    return window.drawOverloadFloor(ctx, px, py, (typeof TILE === "number" ? TILE : 40), map, tx, ty);
  }
  // 78 空间站 / 599 群星：各有专属画法（格栅板、翻滚的等离子）
  if (style === "station78" && window.drawStationFloor) {
    return window.drawStationFloor(ctx, px, py, (typeof TILE === "number" ? TILE : 40), map, tx, ty);
  }
  if (style === "star599" && window.drawStarFloor) {
    return window.drawStarFloor(ctx, px, py, (typeof TILE === "number" ? TILE : 40), map, tx, ty);
  }
  // 22 颓垣 / 33 无尽购物体验：各有专属画法
  // （33 的地面按"腐化度"连续变化 —— 左边是干净的白瓷砖，右边是着火的焦土）
  if (style === "ruin22" && window.drawRuinFloor) {
    return window.drawRuinFloor(ctx, px, py, (typeof TILE === "number" ? TILE : 40), map, tx, ty);
  }
  if (style === "mall33" && window.drawMall33Floor) {
    return window.drawMall33Floor(ctx, px, py, (typeof TILE === "number" ? TILE : 40), map, tx, ty);
  }
  // 45 深渊公司：楼里的地面 / 防火梯的铁格栅栈桥
  if (style === "abyss45" && window.drawAbyss45Floor) {
    return window.drawAbyss45Floor(ctx, px, py, (typeof TILE === "number" ? TILE : 40), map, tx, ty);
  }
  // ---- 1.9.0 批次：24 月球 / 56 冷冻致伤 / 57 白日美术馆 ----
  // 24 月球：月面的浅灰涂料 / 环形山内部 / 书房的暗红地毯 / 工场的水泥地
  if (style === "moon24" && window.drawMoon24Floor) {
    return window.drawMoon24Floor(ctx, px, py, (typeof TILE === "number" ? TILE : 40), map, tx, ty);
  }
  // 56 冷冻致伤：地面按"同心圆环"连续变化 —— 外围潮湿岩石 → 紧实的冰 → 中心的液氧
  if (style === "frost56" && window.drawFrost56Floor) {
    return window.drawFrost56Floor(ctx, px, py, (typeof TILE === "number" ? TILE : 40), map, tx, ty);
  }
  // 57 白日美术馆：抛光的浅米色地面（登记处 / 惬意美术馆 / 画家工作室各有各的纹）
  if (style === "gallery57" && window.drawGallery57Floor) {
    return window.drawGallery57Floor(ctx, px, py, (typeof TILE === "number" ? TILE : 40), map, tx, ty);
  }
  // 黯洃銫：三个子层级各有各的地色，按格子查表
  if (style === "anse" && map && map.zoneTint) {
    const z = map.zoneTint.get(tx + "," + ty);
    if (z) {
      const zs = (typeof TILE === "number" ? TILE : 40);
      ctx.fillStyle = z.f;
      ctx.fillRect(px, py, zs, zs);
      if (((tx * 7 + ty * 13) % 5) === 0) {
        ctx.fillStyle = "rgba(0,0,0,0.06)";
        ctx.fillRect(px, py, zs, zs);
      }
      return true;
    }
  }
  const c = BATCHTILE[style];
  if (!c) return false;
  // h 是格子纹理的哈希扰动值（0~1）—— 不是格子边长！
  // 以前把它当边长用（fillRect(px,py,h,h)），画出来只有零点几个像素，
  // 整片地面等于没画 —— 这就是"新层级地面全是黑的"的真正原因。
  const S = (typeof TILE === "number" ? TILE : 40);
  const k = tx + "," + ty;
  const alt = ((tx * 7 + ty * 13) % 5) === 0;
  // 17 航空母舰：舰用钢板 —— 白灰交替的拼板，不是一整片深灰
  if (style === "carrier" && window.drawCarrierFloor) {
    return window.drawCarrierFloor(ctx, px, py, S, tx, ty);
  }

  // 水 / 毒水 / 虚空：整格铺水色
  if (map.water && map.water.has(k)) {
    ctx.fillStyle = style === "deadlake" ? "#7a2418" : (style === "bluevoid" ? "#2a5ab4" : "#4a90a8");
    ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(255,255,255,0.10)";
    ctx.fillRect(px, py + S * 0.3, S, 2);
    return true;
  }
  // 雪 / 草 / 沙 / 砂砾：按格子的地表集合上色
  if (map.snow && map.snow.has(k)) { ctx.fillStyle = "#eef4f8"; ctx.fillRect(px, py, S, S); return true; }
  if (map.grass && map.grass.has(k)) { ctx.fillStyle = alt ? "#6a9850" : "#7aa85c"; ctx.fillRect(px, py, S, S); return true; }
  if (map.sand && map.sand.has(k)) { ctx.fillStyle = alt ? "#c8bc9e" : "#d2c6a8"; ctx.fillRect(px, py, S, S); return true; }
  if (map.gravel && map.gravel.has(k)) { ctx.fillStyle = alt ? "#6b6b6b" : "#757575"; ctx.fillRect(px, py, S, S); return true; }
  // 虚空（蓝色通道 / 71 的空地）：按层级取色，别一律画成近黑
  if (map.voidTiles && map.voidTiles.has(k)) {
    ctx.fillStyle = BATCHVOID[style] || "#0a0a0c";
    ctx.fillRect(px, py, S, S);
    // 一点点深浅变化，免得整片死板
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fillRect(px, py, S, S * 0.34);
    return true;
  }

  ctx.fillStyle = alt ? c[1] : c[0];
  ctx.fillRect(px, py, S, S);
  // Level 171：灯亮着的时候铺一层暖金的幻象，灯灭了就是腐坏的暗色
  if (style === "grandeur") {
    if (map.grandeurOn !== false) {
      ctx.fillStyle = "rgba(214,178,96,0.26)";
      ctx.fillRect(px, py, S, S);
      ctx.fillStyle = "rgba(255,232,170,0.10)";
      ctx.fillRect(px, py, S, S * 0.34);
    } else {
      ctx.fillStyle = "rgba(24,20,12,0.34)";
      ctx.fillRect(px, py, S, S);
    }
  }
  // 地砖缝：浅色地面才画，深色地面画了反而糊
  if (style === "foodcourt" || style === "matrix" || style === "hospital" ||
      style === "whitehouse" || style === "glitchhall" || style === "template") {
    ctx.strokeStyle = "rgba(0,0,0,0.10)";
    ctx.lineWidth = 1;
    ctx.strokeRect(px + 0.5, py + 0.5, S - 1, S - 1);
  }
  return true;
}

// ---------- 墙体 ----------
// 注意：默认分支以前用 c[0]（= 地面主色），所以新层级"墙和地一个颜色"。
// 这里一律用 c[2]（墙自己的颜色），并压一条顶部亮边。
function drawBatchWall(ctx, px, py, h, style, map, tx, ty) {
  if (style === "memorydomain" && window.drawEraWall) {
    return window.drawEraWall(ctx, px, py, h, style, map);
  }
  if (style === "inverted" && window.drawInvertedWall) {
    return window.drawInvertedWall(ctx, px, py, (typeof TILE === "number" ? TILE : 40), style, map);
  }
  if (style === "electro" && window.drawElectroWall) {
    return window.drawElectroWall(ctx, px, py, (typeof TILE === "number" ? TILE : 40), style, map);
  }
  if (style === "zenith" && window.drawZenithWall) {
    return window.drawZenithWall(ctx, px, py, (typeof TILE === "number" ? TILE : 40), map, tx, ty);
  }
  if (style === "overload" && window.drawOverloadWall) {
    return window.drawOverloadWall(ctx, px, py, (typeof TILE === "number" ? TILE : 40), map, tx, ty);
  }
  if (style === "station78" && window.drawStationWall) {
    return window.drawStationWall(ctx, px, py, (typeof TILE === "number" ? TILE : 40), map, tx, ty);
  }
  if (style === "star599" && window.drawStarWall) {
    return window.drawStarWall(ctx, px, py, (typeof TILE === "number" ? TILE : 40), map, tx, ty);
  }
  // 22 颓垣 / 33 无尽购物体验：各有专属画法
  // （33 的墙按"腐化度"连续变化 —— 左边是干净的墙纸，右边是剥落后露出的黑洞）
  if (style === "ruin22" && window.drawRuinWall) {
    return window.drawRuinWall(ctx, px, py, (typeof TILE === "number" ? TILE : 40), map, tx, ty);
  }
  if (style === "mall33" && window.drawMall33Wall) {
    return window.drawMall33Wall(ctx, px, py, (typeof TILE === "number" ? TILE : 40), map, tx, ty);
  }
  // 45 深渊公司：楼的外墙（有窗）/ 楼内的隔墙 / 楼与楼之间的虚空（铺满星）
  if (style === "abyss45" && window.drawAbyss45Wall) {
    return window.drawAbyss45Wall(ctx, px, py, (typeof TILE === "number" ? TILE : 40), map, tx, ty);
  }
  // ---- 1.9.0 批次：24 月球 / 56 冷冻致伤 / 57 白日美术馆 ----
  // 24 月球：月球岩壁（环形山的脊）
  if (style === "moon24" && window.drawMoon24Wall) {
    return window.drawMoon24Wall(ctx, px, py, (typeof TILE === "number" ? TILE : 40), map, tx, ty);
  }
  // 56 冷冻致伤：一圈圈把洞穴分出层次的冰壁
  if (style === "frost56" && window.drawFrost56Wall) {
    return window.drawFrost56Wall(ctx, px, py, (typeof TILE === "number" ? TILE : 40), map, tx, ty);
  }
  // 57 白日美术馆：挂画的展墙（画本身就是墙的一部分）
  if (style === "gallery57" && window.drawGallery57Wall) {
    return window.drawGallery57Wall(ctx, px, py, (typeof TILE === "number" ? TILE : 40), map, tx, ty);
  }
  // 黯洃銫：三个子层级各有各的墙色
  if (style === "anse" && map && map.zoneTint && typeof tx !== "undefined") {
    const z = map.zoneTint.get(tx + "," + ty);
    if (z) {
      const zs = (typeof TILE === "number" ? TILE : 40);
      ctx.fillStyle = z.w;
      ctx.fillRect(px, py, zs, zs);
      ctx.fillStyle = "rgba(255,255,255,0.10)";
      ctx.fillRect(px, py, zs, Math.max(2, zs * 0.14));
      ctx.fillStyle = "rgba(0,0,0,0.30)";
      ctx.fillRect(px, py + zs - Math.max(2, zs * 0.12), zs, Math.max(2, zs * 0.12));
      return true;
    }
  }
  const c = BATCHTILE[style];
  if (!c) return false;
  const S = (typeof TILE === "number" ? TILE : 40);   // h 是哈希扰动，不是边长
  // 17 航空母舰：舱壁是一块块拼接的白灰钢板，两条拼缝 + 一圈铆钉
  if (style === "carrier" && window.drawCarrierWall) {
    return window.drawCarrierWall(ctx, px, py, S);
  }
  ctx.fillStyle = c[2];
  ctx.fillRect(px, py, S, S);
  // 顶部压条：换个色调，和地面拉开
  ctx.fillStyle = "rgba(255,255,255,0.14)";
  ctx.fillRect(px, py, S, Math.max(3, S * 0.16));
  // 踢脚阴影
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.fillRect(px, py + S - Math.max(3, S * 0.14), S, Math.max(3, S * 0.14));
  // 描边
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = 1;
  ctx.strokeRect(px + 0.5, py + 0.5, S - 1, S - 1);
  return true;
}

// ---------- 特殊物件注册表 ----------
// 每个层级在自己的文件里注册自己的模型：
//   window.PROP_DRAW["vending"] = function(ctx, p, TILE){ ... }
window.PROP_DRAW = window.PROP_DRAW || {};

window.drawBatchFloor = drawBatchFloor;
window.drawBatchWall = drawBatchWall;
window.drawBatchProps = drawBatchProps;

function drawBatchProps(ctx, g, cam) {
  const reg = window.PROP_DRAW;
  if (!reg) return;
  const list = (g.map && g.map.props) || [];
  const T = (typeof TILE === "number" ? TILE : 40);
  // 画布此刻已经带着相机变换了（世界坐标 -> 屏幕），所以这里必须用**世界坐标**平移。
  // 以前写成 "(p.x+0.5)*T - cam.x"，等于又减了一次相机 —— 物件被画到屏幕外，
  // 而且相机一动它们就以两倍速度反向漂移（玩家眼里就是"浮空、比背景快"）。
  // drawNewProps / drawProps 都是直接用世界坐标画的，这里保持同一套。
  let z = 1, ox = 0, oy = 0;
  try {
    const m = ctx.getTransform();
    z = m.a || 1; ox = m.e || 0; oy = m.f || 0;
  } catch (e) { /* 忽略 */ }
  const CW = (ctx.canvas && ctx.canvas.width) || 0;
  const CH = (ctx.canvas && ctx.canvas.height) || 0;
  const pad = T * 2 * z;
  for (const p of list) {
    if ((p.floor | 0) !== g.floor) continue;
    const fn = reg[p.type];
    if (!fn) continue;
    const wx = (p.x + 0.5) * T, wy = (p.y + 0.5) * T;
    const sx = ox + wx * z, sy = oy + wy * z;      // 屏幕坐标：只用来做可见性剔除
    if (CW && CH && (sx < -pad || sy < -pad || sx > CW + pad || sy > CH + pad)) continue;
    ctx.save();
    ctx.translate(wx, wy);
    try { fn(ctx, p, T); } catch (e) { /* 忽略单个物件的绘制错误 */ }
    ctx.restore();
  }
}

// ===========================================================
// Level 4 · 还能开机的电脑
//   废弃办公室里唯一还通电的东西：一张办公桌 + 一台老式 CRT 显示器 + 主机 + 键盘。
//   走近按 E 就能开机 —— 浏览器和网络邮件是订购赫尔墨斯装置的唯一途径。
//   屏幕会亮（待机的绿光），在灰扑扑的办公室里老远就能认出来。
// ===========================================================
window.PROP_DRAW["pc4"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  ctx.fillStyle = "rgba(0,0,0,0.36)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.34, T * 0.40, T * 0.12, 0, 0, 6.2832); ctx.fill();

  // 办公桌：深灰的桌面 + 一条桌腿阴影
  ctx.fillStyle = "#4a4a46";
  ctx.fillRect(-T * 0.42, T * 0.02, T * 0.84, T * 0.26);
  ctx.fillStyle = "#5c5c56";
  ctx.fillRect(-T * 0.42, T * 0.02, T * 0.84, T * 0.07);
  ctx.fillStyle = "rgba(0,0,0,0.30)";
  ctx.fillRect(-T * 0.42, T * 0.24, T * 0.84, T * 0.04);

  // 主机：立在桌子右侧地上
  ctx.fillStyle = "#8d8b84";
  ctx.fillRect(T * 0.20, -T * 0.10, T * 0.18, T * 0.38);
  ctx.fillStyle = "#6f6d67";
  ctx.fillRect(T * 0.20, -T * 0.10, T * 0.18, T * 0.05);
  // 电源灯：会呼吸的绿点
  const pl = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * 1.7));
  ctx.fillStyle = "rgba(120,255,150," + (0.35 + 0.5 * pl).toFixed(3) + ")";
  ctx.fillRect(T * 0.23, -T * 0.05, T * 0.035, T * 0.035);

  // CRT 显示器：米黄色的老外壳，屏幕朝下（俯视）
  ctx.fillStyle = "#c9c2ac";
  ctx.fillRect(-T * 0.30, -T * 0.34, T * 0.46, T * 0.36);
  ctx.fillStyle = "#a8a191";
  ctx.fillRect(-T * 0.30, -T * 0.34, T * 0.46, T * 0.05);
  // 屏幕：亮着的淡蓝白，带扫描线
  ctx.fillStyle = "#9fb8c8";
  ctx.fillRect(-T * 0.25, -T * 0.28, T * 0.36, T * 0.24);
  ctx.fillStyle = "rgba(190,215,230,0.55)";
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(-T * 0.25, -T * 0.28 + i * T * 0.06 + T * 0.02, T * 0.36, T * 0.017);
  }
  // 待机的光标：一闪一闪
  if (Math.sin(t * 2.6) > 0) {
    ctx.fillStyle = "rgba(60,80,92,0.85)";
    ctx.fillRect(-T * 0.22, -T * 0.14, T * 0.05, T * 0.025);
  }
  ctx.strokeStyle = "rgba(60,55,45,0.55)";
  ctx.lineWidth = 1.1;
  ctx.strokeRect(-T * 0.30, -T * 0.34, T * 0.46, T * 0.36);
  // 屏幕那点光洒在桌面上
  const gl = ctx.createRadialGradient(-T * 0.07, -T * 0.16, 1, -T * 0.07, -T * 0.16, T * 0.55);
  gl.addColorStop(0, "rgba(170,215,235,0.26)");
  gl.addColorStop(1, "rgba(170,215,235,0)");
  ctx.fillStyle = gl;
  ctx.beginPath(); ctx.arc(-T * 0.07, -T * 0.16, T * 0.55, 0, 6.2832); ctx.fill();

  // 键盘
  ctx.fillStyle = "#3f3f3b";
  ctx.fillRect(-T * 0.34, T * 0.06, T * 0.30, T * 0.09);
  ctx.fillStyle = "rgba(210,210,200,0.35)";
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(-T * 0.32 + i * T * 0.058, T * 0.075, T * 0.04, T * 0.02);
    ctx.fillRect(-T * 0.32 + i * T * 0.058, T * 0.105, T * 0.04, T * 0.02);
  }
  // 鼠标
  ctx.fillStyle = "#4d4d48";
  ctx.beginPath(); ctx.ellipse(T * 0.10, T * 0.105, T * 0.045, T * 0.032, 0, 0, 6.2832); ctx.fill();
};

// ===========================================================
// 1.9.0：补上"没有专属画法、被通用分支画成默认桌子"的物件
//
// 这些类型以前在 drawProps 里没有任何 else-if 分支，会一路落到最后的
// else —— 画出来的就是一张通用桌子。玩家眼里就是"这层里的东西长得都一样"。
// 现在各自登记专属模型（坐标一律相对物件中心，drawBatchProps 已经平移过了）。
// ===========================================================

// Level 0.2：墙上的通风管道 —— 钻进去到冰室（0.3）
window.PROP_DRAW["vent02"] = function (ctx, p, T) {
  ctx.fillStyle = "#5c6167";
  ctx.fillRect(-T * 0.42, -T * 0.34, T * 0.84, T * 0.68);
  ctx.fillStyle = "#3b4046";
  ctx.fillRect(-T * 0.34, -T * 0.26, T * 0.68, T * 0.52);
  // 百叶：一道道斜着的叶片，中间能看见后面那片黑
  ctx.fillStyle = "#0b0d10";
  ctx.fillRect(-T * 0.30, -T * 0.22, T * 0.60, T * 0.44);
  ctx.fillStyle = "#7d838a";
  for (let i = 0; i < 4; i++) {
    const yy = -T * 0.22 + i * T * 0.12;
    ctx.beginPath();
    ctx.moveTo(-T * 0.30, yy); ctx.lineTo(T * 0.30, yy - T * 0.05);
    ctx.lineTo(T * 0.30, yy + T * 0.02); ctx.lineTo(-T * 0.30, yy + T * 0.07);
    ctx.closePath(); ctx.fill();
  }
  // 四角的螺丝
  ctx.fillStyle = "#9aa0a6";
  for (const s of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    ctx.beginPath(); ctx.arc(s[0] * T * 0.36, s[1] * T * 0.29, T * 0.035, 0, 6.2832); ctx.fill();
  }
  // 能钻 —— 给一点提示的光
  const gl = 0.35 + 0.25 * Math.sin((typeof gTimeRef === "number" ? gTimeRef : 0) * 2.5);
  ctx.strokeStyle = "rgba(150,220,255," + gl.toFixed(2) + ")"; ctx.lineWidth = 2;
  ctx.strokeRect(-T * 0.42, -T * 0.34, T * 0.84, T * 0.68);
};

// Level 0.3：钻进来的那根管道 —— 再钻一次原路返回（结着霜）
window.PROP_DRAW["vent03"] = function (ctx, p, T) {
  ctx.fillStyle = "#6a7076";
  ctx.fillRect(-T * 0.40, -T * 0.32, T * 0.80, T * 0.64);
  ctx.fillStyle = "#2a2e33";
  ctx.fillRect(-T * 0.32, -T * 0.24, T * 0.64, T * 0.48);
  ctx.fillStyle = "#858b91";
  for (let i = 0; i < 3; i++) {
    const yy = -T * 0.20 + i * T * 0.15;
    ctx.fillRect(-T * 0.30, yy, T * 0.60, T * 0.05);
  }
  // 结在口子上的霜 —— 一层白，还有往下挂的冰棱
  ctx.fillStyle = "rgba(226,240,250,0.75)";
  ctx.fillRect(-T * 0.40, -T * 0.32, T * 0.80, T * 0.09);
  ctx.fillStyle = "rgba(200,230,245,0.85)";
  ctx.beginPath();
  ctx.moveTo(-T * 0.30, -T * 0.24); ctx.lineTo(-T * 0.22, T * 0.06); ctx.lineTo(-T * 0.14, -T * 0.24);
  ctx.moveTo(T * 0.10, -T * 0.24); ctx.lineTo(T * 0.18, T * 0.02); ctx.lineTo(T * 0.26, -T * 0.24);
  ctx.fill();
  if (p.entry) {   // 钻进来的那一根：给个更明显的提示
    const gl = 0.4 + 0.3 * Math.sin((typeof gTimeRef === "number" ? gTimeRef : 0) * 3);
    ctx.strokeStyle = "rgba(180,235,255," + gl.toFixed(2) + ")"; ctx.lineWidth = 2.2;
    ctx.strokeRect(-T * 0.40, -T * 0.32, T * 0.80, T * 0.64);
  }
};

// Level 289：向下延伸的楼梯 —— 走下去到战地医院（14h）
window.PROP_DRAW["stairs289h"] = function (ctx, p, T) {
  // 洞口：往下望是一片黑
  ctx.fillStyle = "#0a0b0e";
  ctx.fillRect(-T * 0.46, -T * 0.46, T * 0.92, T * 0.92);
  // 一级一级往下：越深越暗
  for (let i = 0; i < 5; i++) {
    const k = i / 4;
    const g0 = Math.round(150 - k * 110);
    ctx.fillStyle = "rgb(" + g0 + "," + (g0 + 4) + "," + (g0 + 8) + ")";
    ctx.fillRect(-T * 0.46 + i * T * 0.07, -T * 0.40 + i * T * 0.14, T * 0.92 - i * T * 0.14, T * 0.13);
    ctx.fillStyle = "rgba(0,0,0,0.55)";     // 立面
    ctx.fillRect(-T * 0.46 + i * T * 0.07, -T * 0.27 + i * T * 0.14, T * 0.92 - i * T * 0.14, T * 0.04);
  }
  // 边上的扶手
  ctx.strokeStyle = "#8b6f4a"; ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.moveTo(-T * 0.46, -T * 0.44); ctx.lineTo(T * 0.10, T * 0.30); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(T * 0.46, -T * 0.44); ctx.lineTo(T * 0.36, T * 0.30); ctx.stroke();
  // 往下走 —— 底下透上来的一点光
  const gl = 0.3 + 0.2 * Math.sin((typeof gTimeRef === "number" ? gTimeRef : 0) * 2);
  ctx.fillStyle = "rgba(120,190,220," + gl.toFixed(2) + ")";
  ctx.fillRect(-T * 0.16, T * 0.24, T * 0.32, T * 0.10);
};

// Level 18：木箱（幼儿园堆着的那种，能翻）
window.PROP_DRAW["crate"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(0,0,0,0.30)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.30, T * 0.36, T * 0.10, 0, 0, 6.2832); ctx.fill();
  ctx.fillStyle = "#b98f52";
  ctx.fillRect(-T * 0.34, -T * 0.28, T * 0.68, T * 0.56);
  // 木板的缝
  ctx.strokeStyle = "#8a6636"; ctx.lineWidth = 1.6;
  ctx.strokeRect(-T * 0.34, -T * 0.28, T * 0.68, T * 0.56);
  ctx.beginPath();
  ctx.moveTo(-T * 0.34, -T * 0.09); ctx.lineTo(T * 0.34, -T * 0.09);
  ctx.moveTo(-T * 0.34, T * 0.10); ctx.lineTo(T * 0.34, T * 0.10);
  ctx.stroke();
  // 加固的斜撑
  ctx.strokeStyle = "rgba(120,88,44,0.8)"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-T * 0.34, -T * 0.28); ctx.lineTo(T * 0.34, T * 0.28); ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.10)";
  ctx.fillRect(-T * 0.34, -T * 0.28, T * 0.68, T * 0.06);
};

// Level 19：旧桌子 —— 掉漆的木桌
window.PROP_DRAW["oldtable"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(0,0,0,0.32)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.26, T * 0.36, T * 0.09, 0, 0, 6.2832); ctx.fill();
  ctx.fillStyle = "#6b563a";
  ctx.fillRect(-T * 0.36, -T * 0.16, T * 0.72, T * 0.14);   // 桌面
  ctx.fillStyle = "#7d6746";
  ctx.fillRect(-T * 0.36, -T * 0.16, T * 0.72, T * 0.04);   // 高光
  // 掉漆：几块颜色深浅不一的斑
  ctx.fillStyle = "rgba(90,72,48,0.7)";
  ctx.fillRect(-T * 0.22, -T * 0.12, T * 0.14, T * 0.06);
  ctx.fillRect(T * 0.08, -T * 0.08, T * 0.10, T * 0.04);
  ctx.fillStyle = "#54432c";
  ctx.fillRect(-T * 0.30, -T * 0.02, T * 0.05, T * 0.24);   // 桌腿
  ctx.fillRect(T * 0.25, -T * 0.02, T * 0.05, T * 0.24);
};

// Level 19：旧沙发 —— 塌下去的坐垫，布面磨得发白
window.PROP_DRAW["oldsofa"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(0,0,0,0.32)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.28, T * 0.40, T * 0.10, 0, 0, 6.2832); ctx.fill();
  ctx.fillStyle = "#4f4034";                                  // 靠背
  ctx.fillRect(-T * 0.40, -T * 0.26, T * 0.80, T * 0.16);
  ctx.fillStyle = "#5d4c3e";                                  // 座面（中间塌下去）
  ctx.fillRect(-T * 0.42, -T * 0.10, T * 0.84, T * 0.24);
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.02, T * 0.34, T * 0.07, 0, 0, 6.2832); ctx.fill();
  ctx.fillStyle = "#463829";                                  // 扶手
  ctx.fillRect(-T * 0.46, -T * 0.22, T * 0.12, T * 0.34);
  ctx.fillRect(T * 0.34, -T * 0.22, T * 0.12, T * 0.34);
  // 磨白的布面
  ctx.fillStyle = "rgba(220,212,196,0.22)";
  ctx.fillRect(-T * 0.26, -T * 0.06, T * 0.22, T * 0.14);
  ctx.fillStyle = "#3d3124";
  ctx.fillRect(-T * 0.40, T * 0.14, T * 0.06, T * 0.10);
  ctx.fillRect(T * 0.34, T * 0.14, T * 0.06, T * 0.10);
};

// Level 19：台灯 —— 这层少数还亮着的东西
window.PROP_DRAW["lamp"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  const fl = 0.72 + 0.28 * Math.sin(t * 9 + p.x * 2.1);      // 灯丝在抖
  ctx.fillStyle = "rgba(0,0,0,0.30)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.28, T * 0.20, T * 0.07, 0, 0, 6.2832); ctx.fill();
  ctx.fillStyle = "#4a4038";                                  // 底座
  ctx.fillRect(-T * 0.14, T * 0.16, T * 0.28, T * 0.08);
  ctx.fillStyle = "#6b5f52";                                  // 灯杆
  ctx.fillRect(-T * 0.03, -T * 0.10, T * 0.06, T * 0.28);
  // 灯罩
  ctx.fillStyle = "#c9b48a";
  ctx.beginPath();
  ctx.moveTo(-T * 0.22, -T * 0.10); ctx.lineTo(T * 0.22, -T * 0.10);
  ctx.lineTo(T * 0.13, -T * 0.30); ctx.lineTo(-T * 0.13, -T * 0.30);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = "rgba(255,244,210," + (0.75 * fl).toFixed(2) + ")";
  ctx.fillRect(-T * 0.13, -T * 0.12, T * 0.26, T * 0.04);     // 罩口漏出来的光
  // 洒在地上的一圈光
  const rg = ctx.createRadialGradient(0, T * 0.10, 1, 0, T * 0.10, T * 0.9);
  rg.addColorStop(0, "rgba(255,240,200," + (0.30 * fl).toFixed(2) + ")");
  rg.addColorStop(1, "rgba(255,240,200,0)");
  ctx.fillStyle = rg;
  ctx.beginPath(); ctx.arc(0, T * 0.10, T * 0.9, 0, 6.2832); ctx.fill();
};

// ===========================================================
// Level 0 四片大区域（1.3.0 扩容）
//   拱门区的窄拱龛 / 深坑区那扇木门（熄灯区不放任何物件）。
//   坐标是相对物件中心的 —— drawBatchProps 已经把画布平移过来了。
// ===========================================================
window.PROP_DRAW["l0archperch"] = function (ctx, p, T) {
  // 拱洞是「墙壁上开的洞」，由 Level 0 的地格装饰直接画在那一格上：
  // 两边浅棕墙柱、顶上半圆拱，洞里仍是同一张潮湿黄地毯。
  // 这里只留一道窄座沿提示可以倚坐，不再画整扇白墙门框 —— 那会把洞
  // 又嵌回墙里，看上去还像给这个区域单独换了块地面。
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.30, T * 0.30, T * 0.08, 0, 0, 6.2832); ctx.fill();
  ctx.fillStyle = "#7d6140";
  ctx.fillRect(-T * 0.26, T * 0.24, T * 0.52, T * 0.055);
};

// 熄灯区曾经摆过「微光 / 坏了一半的荧光灯」物件，与「完全没有灯」相悖，已移除。

window.PROP_DRAW["l0deepdoor"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(0,0,0,0.40)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.34, T * 0.34, T * 0.10, 0, 0, 6.2832); ctx.fill();
  ctx.fillStyle = "#4a3320";
  ctx.fillRect(-T * 0.30, -T * 0.44, T * 0.60, T * 0.82);
  ctx.fillStyle = "#8a6438";
  ctx.fillRect(-T * 0.26, -T * 0.40, T * 0.52, T * 0.74);
  ctx.fillStyle = "rgba(40,26,14,0.35)";
  for (let i = 0; i < 3; i++) ctx.fillRect(-T * 0.22 + i * T * 0.18, -T * 0.38, T * 0.02, T * 0.70);
  ctx.fillStyle = "#c9b48a";
  ctx.beginPath(); ctx.arc(T * 0.16, T * 0.02, T * 0.035, 0, 6.2832); ctx.fill();
};
