// ===========================================================
// Level 57 —— 白日美术馆
//   一座延展不绝之美术馆，由两个主要部分组成：登记处和惬意美术馆。
//   登记处：前台兼吧台（供应杏仁水等饮品）、画桌 + 侧翼书架、一排金属座椅与
//           空杂志架、远处左端一扇单开窗户（细软的熙光自窗帘透射而入）、
//           三株悬空书架上的盆栽、两尊古典式雕塑、房间后端一幅画作、
//           数个裹满灰浆的研磨杵（此处无食物供应）。
//   惬意美术馆：从登记台右侧远处的沉重双扇门进入。众多尺寸各异的画作挂在
//           墙上，大多怪诞疏离，且多数与已知的后室层级相关 —— 走近会听见
//           与画中层级相关的远处噪音（站在 Level 7 的画前会有波涛撞击声）。
//           布局每次都会改变：新的墙面显现，应季的装饰冒出来。
//   画家工作室：更深处，为诸多屏风所分隔，温暖敞亮，弥漫木质与新鲜颜料的
//           芳香。散落着沙发毯、美术杂志、蓝色睡眠眼罩、浸透丙烯的软木雕像。
//           后方是一面边缘堆着书架的墙，抽屉里耷拉着半折的画布；书架前放着
//           一顶蓝色三角帐篷，内部天花板垂着点点繁星。左端有一扇人为伪造的
//           窗户，被绘制成能远望无垠沙滩的模样；窗下是一张蓝色豆袋椅。
//   实体：画家（友好的被动型实体，身着褪色蓝睡衣的少女，本层级的「属主」）
//         壁画师（高挑而蒙面，层层白纱，面部由一张蓝色陶制面具遮蔽，
//                用 20 世纪的观剧镜检查画作；在登记处雕刻陶土并复述咒语）
//   入口：在 Level 0 地板上找到画作，按 E 切入
//   出口：找到一扇门 -> Level 21；找到一副月亮的画 -> Level 24
// ===========================================================
"use strict";

(function () {
  // 展墙的白 / 抛光地面的浅米色（都不是黑的，也不是 Level 2 的管道）
  const v = ["#efe9dc", "#c9bfa8"];
  if (typeof regTile === "function") regTile("gallery57", v);
  else { (window.__NEWTILE_EXTRA = window.__NEWTILE_EXTRA || {})["gallery57"] = v; }
})();

// 画中层级 —— 走近会听见与之相关的远处噪音（档案原文：站在 Level 7 的画作前
// 便会有辨识度极高的波涛撞击声）
const PAINT57 = [
  { lv: 7,  name: "一片没有尽头的海",       sound: "波涛一下一下撞在看不见的岸上 —— 水声大得盖过了展厅里的脚步" },
  { lv: 0,  name: "一间空无一物的黄房间",   sound: "头顶的荧光灯在嗡嗡作响，一声接一声，永不停歇" },
  { lv: 1,  name: "堆着货箱的仓库",         sound: "很远的地方有风穿过铁皮，发出低沉的呼啸" },
  { lv: 11, name: "一座永远不睡的城市",     sound: "车流声、霓虹灯的电流声 —— 热闹得不像是在画里" },
  { lv: 4,  name: "一排排空着的办公隔间",   sound: "有人在很远的地方一下一下地敲着键盘" },
  { lv: 6,  name: "一片什么都没有的黑",     sound: "什么声音都没有 —— 静得让你听见自己的血在耳朵里流" },
  { lv: 10, name: "一望无际的麦田",         sound: "风吹过庄稼，沙沙地响成一片" },
  { lv: 37, name: "一间亮着灯的池房",       sound: "水面轻轻晃着，瓷砖把水声反射回来，空空荡荡" },
  { lv: 5,  name: "一条铺着红地毯的走廊",   sound: "不知从哪里飘来一段爵士乐，吹得慢悠悠的" },
  { lv: 9,  name: "午夜的一条郊区街道",     sound: "远处的狗叫，还有草坪洒水器咔哒咔哒地转" },
  { lv: 2,  name: "一段望不到头的管道",     sound: "铁管里传出一阵闷响，然后是一声更长的回音" },
  { lv: 13, name: "一间空荡荡的库房",       sound: "纸箱挪动的声音 —— 可这里一个人也没有" },
];
window.PAINT57 = PAINT57;

function generateGallery57Map(level) {
  const size = 96;
  const grid = makeGrid(size);
  const props = [];
  const floors = [];

  const gallery = new Set();   // 惬意美术馆的地面（抛光浅米色）
  const office = new Set();    // 登记处（木地板）
  const studio = new Set();    // 画家工作室（暖木地板，温暖敞亮）
  const wallSet = new Set();   // 展墙（美术馆的白墙）
  const carpet = new Set();    // 登记处里那张地毯

  // ---------- 三个区域的矩形 ----------
  const OFF = { x0: 4, y0: 62, x1: 34, y1: 90 };      // 登记处（左下）
  const GAL = { x0: 4, y0: 6,  x1: 90, y1: 58 };      // 惬意美术馆（上方，很大）
  const STU = { x0: 58, y0: 62, x1: 90, y1: 90 };     // 画家工作室（右下）

  const carve = (r, set) => {
    for (let y = r.y0; y <= r.y1; y++) for (let x = r.x0; x <= r.x1; x++) {
      if (x < 1 || y < 1 || x > size - 2 || y > size - 2) continue;
      grid[y][x] = 0; set.add(x + "," + y);
    }
  };
  carve(OFF, office);
  carve(GAL, gallery);
  carve(STU, studio);

  // 登记处：中央铺一张地毯
  for (let y = OFF.y0 + 8; y <= OFF.y1 - 6; y++) for (let x = OFF.x0 + 5; x <= OFF.x1 - 5; x++) {
    carpet.add(x + "," + y);
  }

  // ---------- 惬意美术馆：内部隔墙。布局每次都变 ----------
  // 档案：新的墙面将会显现，以寄存全新的画作 —— 所以每次进来都不太一样。
  const roomList = [];
  {
    // 随机切 2~3 条竖墙、1~2 条横墙（位置随机 = 布局每次改变）
    const vxs = [], hys = [];
    const nv = 2 + randInt(0, 1), nh = 1 + randInt(0, 1);
    for (let i = 0; i < nv; i++) {
      const t = (i + 1) / (nv + 1);
      vxs.push(Math.round(GAL.x0 + (GAL.x1 - GAL.x0) * t) + randInt(-4, 4));
    }
    for (let i = 0; i < nh; i++) {
      const t = (i + 1) / (nh + 1);
      hys.push(Math.round(GAL.y0 + (GAL.y1 - GAL.y0) * t) + randInt(-3, 3));
    }
    for (const vx of vxs) {
      if (vx <= GAL.x0 + 4 || vx >= GAL.x1 - 4) continue;
      for (let y = GAL.y0; y <= GAL.y1; y++) { grid[y][vx] = 1; gallery.delete(vx + "," + y); wallSet.add(vx + "," + y); }
      // 每条墙上开 2~3 个门洞（不然各展厅互不相通）
      const gaps = 2 + randInt(0, 1);
      for (let i = 0; i < gaps; i++) {
        const gy = GAL.y0 + 3 + Math.floor((GAL.y1 - GAL.y0 - 6) * ((i + 0.5) / gaps)) + randInt(-2, 2);
        for (let d = 0; d <= 1; d++) {
          const yy = Math.max(GAL.y0 + 1, Math.min(GAL.y1 - 1, gy + d));
          grid[yy][vx] = 0; wallSet.delete(vx + "," + yy); gallery.add(vx + "," + yy);
        }
      }
    }
    for (const hy of hys) {
      if (hy <= GAL.y0 + 4 || hy >= GAL.y1 - 4) continue;
      for (let x = GAL.x0; x <= GAL.x1; x++) { grid[hy][x] = 1; gallery.delete(x + "," + hy); wallSet.add(x + "," + hy); }
      const gaps = 2 + randInt(0, 1);
      for (let i = 0; i < gaps; i++) {
        const gx = GAL.x0 + 3 + Math.floor((GAL.x1 - GAL.x0 - 6) * ((i + 0.5) / gaps)) + randInt(-2, 2);
        for (let d = 0; d <= 1; d++) {
          const xx = Math.max(GAL.x0 + 1, Math.min(GAL.x1 - 1, gx + d));
          grid[hy][xx] = 0; wallSet.delete(xx + "," + hy); gallery.add(xx + "," + hy);
        }
      }
    }
    // 记录每一块展厅（用洪水填充切出来，摆画的时候用得上）
    const seen = new Set();
    for (const t of gallery) {
      if (seen.has(t)) continue;
      const [sx, sy] = t.split(",").map(Number);
      const cell = [], q = [[sx, sy]];
      seen.add(sx + "," + sy);
      while (q.length) {
        const [x, y] = q.pop();
        cell.push({ x, y });
        for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = x + d[0], ny = y + d[1], k = nx + "," + ny;
          if (seen.has(k) || !gallery.has(k)) continue;
          seen.add(k); q.push([nx, ny]);
        }
      }
      if (cell.length > 60) roomList.push(cell);
    }
  }

  // ---------- 登记处 -> 惬意美术馆：登记台右侧远处那扇沉重的双扇门 ----------
  // 档案：自位于登记台右侧远处的沉重双扇门行走便可来到惬意美术馆
  const dblX = OFF.x1 - 1, dblY = OFF.y0 + 2;
  for (let y = OFF.y0 - 6; y <= dblY; y++) {
    for (const xx of [dblX - 1, dblX]) {
      grid[y][xx] = 0; wallSet.delete(xx + "," + y); gallery.add(xx + "," + y);
    }
  }
  // 双扇门本身（装饰：推开展厅就在后面）
  props.push({ x: dblX, y: dblY, floor: 0, type: "p57double",
    tip: "一扇沉重无比的双扇门，两扇都半开着 —— 后面就是展厅" });

  // ---------- 惬意美术馆 -> 画家工作室：往深处走 ----------
  const stuX = Math.round((STU.x0 + STU.x1) / 2);
  for (let y = GAL.y1; y <= STU.y0 + 1; y++) {
    for (const xx of [stuX, stuX + 1]) {
      grid[y][xx] = 0; wallSet.delete(xx + "," + y); gallery.add(xx + "," + y); studio.add(xx + "," + y);
    }
  }
  // 画家工作室：屏风分隔（一小部分，不是整间）
  for (let i = 0; i < 4; i++) {
    const px2 = STU.x0 + 3 + i * 6;
    const py2 = STU.y0 + 6 + (i % 2) * 5;
    for (let d = 0; d < 3; d++) {
      grid[py2 + d][px2] = 1; studio.delete(px2 + "," + (py2 + d)); wallSet.add(px2 + "," + (py2 + d));
    }
    props.push({ x: px2, y: py2 + 1, floor: 0, type: "p57screen" });
  }

  // ---------- 出生：登记处前端附近（流浪者首次切入 Level 57 的地方）----------
  const start = { x: OFF.x0 + 4, y: OFF.y0 + 3, floor: 0 };

  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return null;
    if (grid[y][x] !== 0) return null;
    const p = Object.assign({ x, y, floor: 0, type }, extra || {});
    props.push(p);
    return p;
  };

  // ================= 登记处 =================
  // 前台（兼吧台，供应杏仁水等饮品）
  put(OFF.x0 + 3, OFF.y0 + 12, "p57counter");
  put(OFF.x0 + 4, OFF.y0 + 12, "p57counter");
  // 画桌 + 侧翼的书架
  put(OFF.x0 + 12, OFF.y0 + 10, "p57desk");
  put(OFF.x0 + 10, OFF.y0 + 10, "p57shelf");
  put(OFF.x0 + 14, OFF.y0 + 10, "p57shelf");
  // 一排金属座椅 + 相伴的空杂志架（房间前端附近）
  for (let i = 0; i < 4; i++) put(OFF.x0 + 4 + i * 2, OFF.y0 + 3, "p57seat");
  put(OFF.x0 + 12, OFF.y0 + 3, "p57mag");
  // 远处左端：一扇单开窗户，细软的熙光自窗帘透射而入
  put(OFF.x0, OFF.y0 + 14, "p57window");
  // 三株置于悬空书架上的盆栽
  put(OFF.x0 + 6, OFF.y1 - 3, "p57plant");
  put(OFF.x0 + 9, OFF.y1 - 3, "p57plant");
  put(OFF.x0 + 12, OFF.y1 - 3, "p57plant");
  // 两尊古典式雕塑
  put(OFF.x0 + 18, OFF.y0 + 5, "p57statue");
  put(OFF.x0 + 20, OFF.y0 + 12, "p57statue");
  // 数个裹满灰浆的研磨杵
  put(OFF.x0 + 5, OFF.y0 + 12, "p57pestle");
  put(OFF.x0 + 6, OFF.y0 + 12, "p57pestle");
  // 悬于房间后端的画作
  put(OFF.x0 + 15, OFF.y1 - 2, "p57paint", { idx: randInt(0, PAINT57.length - 1) });

  // ================= 惬意美术馆：把画挂到墙上 =================
  // 找贴着墙的地面格子，把画摆在那儿 —— 这样看起来真的是"挂在墙上"。
  const wallSide = (x, y) => {
    for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      if (grid[y + d[1]] && grid[y + d[1]][x + d[0]] === 1) return d;
    }
    return null;
  };
  const usedPaint = new Set();
  let moonPlaced = null;
  if (roomList.length) {
    let n = 0;
    for (const room of roomList) {
      const spots = [];
      for (const c of room) {
        const d = wallSide(c.x, c.y);
        if (d) spots.push({ x: c.x, y: c.y, d });
      }
      // 每间展厅挂 3~5 幅
      const want = 3 + randInt(0, 2);
      for (let i = 0; i < want && spots.length; i++) {
        const s = spots.splice(randInt(0, spots.length - 1), 1)[0];
        if (usedPaint.has(s.x + "," + s.y)) continue;
        usedPaint.add(s.x + "," + s.y);
        const idx = randInt(0, PAINT57.length - 1);
        put(s.x, s.y, "p57paint", { idx, dir: s.d });
        n++;
      }
    }
    // 那副月亮的画：挂在离出生点最远的那间展厅里（找得到，但得先走过去）
    let farRoom = roomList[0], farD = -1;
    for (const room of roomList) {
      let cx = 0, cy = 0;
      for (const c of room) { cx += c.x; cy += c.y; }
      cx /= room.length; cy /= room.length;
      const d = Math.hypot(cx - start.x, cy - start.y);
      if (d > farD) { farD = d; farRoom = room; }
    }
    const spots2 = [];
    for (const c of farRoom) { const d = wallSide(c.x, c.y); if (d) spots2.push({ x: c.x, y: c.y, d }); }
    if (spots2.length) {
      const s = spots2[randInt(0, spots2.length - 1)];
      moonPlaced = put(s.x, s.y, "p57moon", { dir: s.d, toLevel: 24 });
    }
  }
  if (!moonPlaced) moonPlaced = put(GAL.x1 - 3, GAL.y0 + 3, "p57moon", { dir: [-1, 0], toLevel: 24 });

  // 出口：一扇门 -> Level 21
  const door21 = put(GAL.x1 - 2, GAL.y1 - 2, "p57door21", { toLevel: 21 });
  if (door21) { door21.tip = "一扇普普通通的门 —— 门牌上写着 21"; door21.label = "21"; }

  // ================= 画家工作室 =================
  put(STU.x0 + 4, STU.y0 + 3, "p57blanket");   // 沙发毯
  put(STU.x0 + 7, STU.y0 + 2, "p57artmag");    // 美术杂志
  put(STU.x0 + 10, STU.y0 + 4, "p57mask");     // 蓝色睡眠眼罩
  put(STU.x0 + 13, STU.y0 + 2, "p57cork");     // 浸透丙烯颜料的软木雕像
  // 后方那面墙：边缘堆着书架，抽屉里耷拉着半折的画布
  for (let i = 0; i < 3; i++) put(STU.x0 + 2 + i * 3, STU.y1 - 2, "p57shelf2");
  put(STU.x0 + 12, STU.y1 - 2, "p57drawer");
  // 书架前那顶蓝色三角帐篷（内部天花板垂着点点繁星）
  const tent = put(STU.x0 + 8, STU.y1 - 5, "p57tent");
  // 左端那扇伪造的窗户（被绘制成能远望无垠沙滩的模样）+ 窗下的蓝色豆袋椅
  put(STU.x0, STU.y0 + 10, "p57fakewin");
  put(STU.x0 + 1, STU.y0 + 11, "p57bean");
  // 一盘仿真水果（有时在门外）
  put(STU.x0 + 2, STU.y0 + 14, "p57fruit");

  // ================= 两位实体 =================
  // 画家：在画家工作室里，为下一次展览准备最新画作
  const painter = put(STU.x0 + 16, STU.y0 + 8, "p57painter", { talk: 0 });
  // 壁画师：在登记处，用观剧镜检查画作 / 雕刻陶土
  const muralist = put(OFF.x0 + 22, OFF.y0 + 8, "p57muralist", { talk: 0 });
  // 登记处后面：她在雕刻的那些陶土制品
  put(OFF.x0 + 24, OFF.y0 + 10, "p57clay");

  // 杏仁水：吧台上供着（登记处有饮品，没有食物）
  map_ground_push(props, STU.x0 + 5, STU.y0 + 12, null);

  collectFloorsInto(grid, size, floors);

  return {
    size, level: 57, doubleStory: false,
    layers: [grid], grid, rooms: [[]], floors: [floors],
    start, exit: null, doors: [], ramps: [],
    props, crates: [], ground: [
      { x: OFF.x0 + 4, y: OFF.y0 + 12, floor: 0, item: "almond", taken: false },
      { x: OFF.x0 + 5, y: OFF.y0 + 11, floor: 0, item: "almond", taken: false },
      { x: STU.x0 + 3, y: STU.y0 + 12, floor: 0, item: "almond", taken: false },
    ],

    style: "gallery57",
    tileName: "gallery57",
    gallery57: gallery, office57: office, studio57: studio,
    wall57: wallSet, carpet57: carpet,
    rect57: { OFF, GAL, STU },
    painter57: painter, muralist57: muralist, moon57: moonPlaced, door2157: door21,
    tent57: tent,
  };
}
window.generateGallery57Map = generateGallery57Map;

// 兼容：有些地方会顺手往地上摆东西（这里不需要额外处理）
function map_ground_push() { /* 登记处的饮品走 map.ground，不需要在这里补 */ }

// ---------------- 地面 ----------------
window.drawGallery57Floor = function (ctx, px, py, S, map, tx, ty) {
  const k = tx + "," + ty;
  const t = performance.now() / 1000;
  if (map.carpet57 && map.carpet57.has(k)) {
    // 登记处中央那张地毯：暗红，织着纹样
    ctx.fillStyle = "#8a5f52";
    ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(240,215,180,.16)";
    ctx.fillRect(px + 4, py + 4, S - 8, S - 8);
    ctx.strokeStyle = "rgba(60,30,26,.35)";
    ctx.lineWidth = 1;
    ctx.strokeRect(px + 8.5, py + 8.5, S - 17, S - 17);
    return true;
  }
  if (map.office57 && map.office57.has(k)) {
    // 登记处：温润的木地板
    ctx.fillStyle = "#b08d5e";
    ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(90,62,34,.30)";
    ctx.fillRect(px, py + S * 0.48, S, 1.5);
    ctx.fillRect(px + ((hash2(tx, ty) * S) | 0), py, 1.5, S * 0.48);
    ctx.fillStyle = "rgba(255,240,210,.10)";
    ctx.fillRect(px, py, S, 2);
    return true;
  }
  if (map.studio57 && map.studio57.has(k)) {
    // 画家工作室：暖木地板，比展厅更暖 —— 档案说这里是"温暖而敞亮之所"
    ctx.fillStyle = "#c2955f";
    ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(120,80,40,.26)";
    ctx.fillRect(px, py + S * 0.5, S, 1.5);
    ctx.fillStyle = "rgba(255,225,170,.14)";
    ctx.fillRect(px, py, S, S);
    return true;
  }
  // 惬意美术馆：抛光的大理石地面（浅米色），带接缝和一点反光
  ctx.fillStyle = "#c9bfa8";
  ctx.fillRect(px, py, S, S);
  const h = hash2(tx, ty);
  ctx.fillStyle = "rgba(255,255,255,.10)";
  ctx.fillRect(px, py, S, 2);
  ctx.strokeStyle = "rgba(120,108,86,.28)";
  ctx.lineWidth = 1;
  ctx.strokeRect(px + 0.5, py + 0.5, S - 1, S - 1);
  // 大理石的纹路
  if (h > 0.72) {
    ctx.strokeStyle = "rgba(150,138,112,.35)";
    ctx.beginPath();
    ctx.moveTo(px + 3, py + S * (0.2 + h * 0.5));
    ctx.lineTo(px + S - 4, py + S * (0.55 - h * 0.3));
    ctx.stroke();
  }
  // 顶上那排射灯在地面上的光斑
  const sp = Math.sin(t * 0.5 + tx * 0.4) * 0.5 + 0.5;
  ctx.fillStyle = "rgba(255,238,200," + (0.05 + sp * 0.05).toFixed(3) + ")";
  ctx.fillRect(px, py, S, S);
  return true;
};

// ---------------- 墙 ----------------
window.drawGallery57Wall = function (ctx, px, py, S, map, tx, ty) {
  // 展墙：美术馆的白墙 —— 顶部一条暖色的射灯带，底部是踢脚线。
  // 地面是浅米色 (201,191,168)，墙明显更亮更白，一眼分得清。
  ctx.fillStyle = "#efe9dc";
  ctx.fillRect(px, py, S, S);
  // 射灯带（暖色）
  ctx.fillStyle = "rgba(255,214,150,.55)";
  ctx.fillRect(px, py, S, Math.max(2, S * 0.10));
  ctx.fillStyle = "rgba(255,246,220,.35)";
  ctx.fillRect(px + 2, py + Math.max(2, S * 0.10), S - 4, 2);
  // 踢脚线
  ctx.fillStyle = "rgba(120,108,86,.40)";
  ctx.fillRect(px, py + S - Math.max(2, S * 0.12), S, Math.max(2, S * 0.12));
  // 板材接缝
  ctx.strokeStyle = "rgba(150,140,120,.20)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(px + 0.5, py); ctx.lineTo(px + 0.5, py + S);
  ctx.stroke();
  // 挂画留在墙上的浅色印子
  if (((tx * 3 + ty * 7) % 11) === 0) {
    ctx.fillStyle = "rgba(200,190,168,.45)";
    ctx.fillRect(px + S * 0.22, py + S * 0.28, S * 0.56, S * 0.34);
  }
  return true;
};

// ---------------- 环境：展厅的暖光 + 空气里的浮尘 ----------------
window.drawGallery57 = function (ctx, g) {
  const cw = (ctx.canvas && ctx.canvas.width) || 800;
  const ch = (ctx.canvas && ctx.canvas.height) || 600;
  const t = performance.now() / 1000;
  ctx.save();
  try { ctx.setTransform(1, 0, 0, 1, 0, 0); } catch (e) { /* 忽略 */ }
  // 一层很淡的暖色 —— 美术馆的灯是暖白，不是冷白
  ctx.fillStyle = "rgba(255,236,200,.045)";
  ctx.fillRect(0, 0, cw, ch);
  // 空气里慢慢飘的浮尘
  for (let i = 0; i < 26; i++) {
    const px = ((i * 137.5 + t * (6 + (i % 5) * 2)) % cw);
    const py = ((i * 79.3 + Math.sin(t * 0.3 + i) * 30 + t * 3) % ch);
    ctx.fillStyle = "rgba(255,246,220,.16)";
    ctx.fillRect(px, py, 2, 2);
  }
  ctx.restore();
};

// ================= 物件：全部画出来，不用文字替代 =================
window.PROP_DRAW = window.PROP_DRAW || {};

// 前台 / 吧台（供应杏仁水）
window.PROP_DRAW["p57counter"] = function (ctx, p, T) {
  const w = T * 0.98, h = T * 0.80;
  ctx.fillStyle = "#6b4a33";                       // 木质的台面
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#8a6440";
  ctx.fillRect(-w / 2, -h / 2, w, h * 0.22);       // 台面的高光
  ctx.fillStyle = "rgba(40,26,16,.45)";
  ctx.fillRect(-w / 2, h / 2 - 4, w, 4);
  // 台面上摆着的几瓶杏仁水
  for (let i = 0; i < 3; i++) {
    const bx = -w / 2 + 6 + i * (w - 12) / 3;
    ctx.fillStyle = "#f2e2a8";
    ctx.fillRect(bx, -h / 2 - 6, 5, 9);
    ctx.fillStyle = "#c8a44e";
    ctx.fillRect(bx + 1, -h / 2 - 4, 3, 5);
  }
};
// 画桌
window.PROP_DRAW["p57desk"] = function (ctx, p, T) {
  const w = T * 0.92, h = T * 0.66;
  ctx.fillStyle = "#8a6440";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "rgba(255,240,210,.20)";
  ctx.fillRect(-w / 2, -h / 2, w, 3);
  ctx.fillStyle = "rgba(0,0,0,.25)";
  ctx.fillRect(-w / 2, h / 2 - 3, w, 3);
  // 桌上摊着的一张画纸
  ctx.fillStyle = "#f6f1e2";
  ctx.fillRect(-w * 0.28, -h * 0.22, w * 0.5, h * 0.5);
  ctx.strokeStyle = "rgba(120,100,70,.5)"; ctx.lineWidth = 1;
  ctx.strokeRect(-w * 0.28, -h * 0.22, w * 0.5, h * 0.5);
};
// 书架（侧翼）
window.PROP_DRAW["p57shelf"] = function (ctx, p, T) {
  const w = T * 0.62, h = T * 0.92;
  ctx.fillStyle = "#5d4028";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  for (let r = 0; r < 3; r++) {
    const yy = -h / 2 + 3 + r * (h - 6) / 3;
    ctx.fillStyle = "#8a6440";
    ctx.fillRect(-w / 2 + 2, yy + (h - 6) / 3 - 3, w - 4, 2.5);
    // 书：一排排竖着
    for (let i = 0; i < 4; i++) {
      const bx = -w / 2 + 3 + i * (w - 6) / 4;
      const hh = 6 + ((p.x * 3 + p.y * 5 + i + r) % 5);
      ctx.fillStyle = ["#a8563e", "#3f5a72", "#6b6a3a", "#7a4a6a"][(i + r) % 4];
      ctx.fillRect(bx, yy + (h - 6) / 3 - 3 - hh, (w - 6) / 4 - 1.5, hh);
    }
  }
};
// 金属座椅
window.PROP_DRAW["p57seat"] = function (ctx, p, T) {
  const w = T * 0.62, h = T * 0.62;
  ctx.fillStyle = "#9aa2a8";
  ctx.fillRect(-w / 2, -h / 2 + 2, w, h * 0.55);        // 座面
  ctx.fillStyle = "#7d858b";
  ctx.fillRect(-w / 2, h / 2 - 5, 3, 5);
  ctx.fillRect(w / 2 - 3, h / 2 - 5, 3, 5);             // 椅腿
  ctx.fillStyle = "#adb5bb";
  ctx.fillRect(-w / 2, -h / 2, w, h * 0.42);            // 靠背
  ctx.strokeStyle = "rgba(60,66,72,.6)"; ctx.lineWidth = 1;
  ctx.strokeRect(-w / 2 + 0.5, -h / 2 + 0.5, w - 1, h * 0.42 - 1);
};
// 空杂志架
window.PROP_DRAW["p57mag"] = function (ctx, p, T) {
  const w = T * 0.60, h = T * 0.72;
  ctx.fillStyle = "#7d858b";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "rgba(30,34,38,.55)";
  ctx.fillRect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 8);   // 空的 —— 一本杂志也没有
  ctx.fillStyle = "#9aa2a8";
  ctx.fillRect(-w / 2, h / 2 - 3, w, 3);
};
// 那扇单开窗户：细软的熙光自窗帘透射而入
window.PROP_DRAW["p57window"] = function (ctx, p, T) {
  const w = T * 0.94, h = T * 0.94;
  ctx.fillStyle = "#e6dcc4";                            // 窗框
  ctx.fillRect(-w / 2, -h / 2, w, h);
  // 玻璃后面的熙光
  const gr = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  gr.addColorStop(0, "#fff6d8");
  gr.addColorStop(1, "#e8d9a8");
  ctx.fillStyle = gr;
  ctx.fillRect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 6);
  // 窗帘：两片，透着光
  ctx.fillStyle = "rgba(255,250,235,.62)";
  ctx.fillRect(-w / 2 + 3, -h / 2 + 3, (w - 6) * 0.30, h - 6);
  ctx.fillRect(w / 2 - 3 - (w - 6) * 0.30, -h / 2 + 3, (w - 6) * 0.30, h - 6);
  ctx.fillStyle = "#cfc4a8";
  ctx.fillRect(-w / 2 + 2, -h / 2 - 2, w - 4, 3);       // 窗帘杆
  ctx.strokeStyle = "#b9ad8e"; ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, -h / 2); ctx.lineTo(0, h / 2);          // 窗棂
  ctx.stroke();
};
// 悬空书架上的盆栽
window.PROP_DRAW["p57plant"] = function (ctx, p, T) {
  const w = T * 0.56, h = T * 0.70;
  ctx.fillStyle = "#6b4a33";
  ctx.fillRect(-w / 2, h * 0.02, w, h * 0.30);          // 悬空的架子
  ctx.fillStyle = "#9a5a3c";
  ctx.fillRect(-w * 0.26, -h * 0.10, w * 0.52, h * 0.20); // 花盆
  ctx.fillStyle = "#4e8a45";                            // 叶子
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i - 2) * 0.42;
    ctx.beginPath();
    ctx.ellipse(Math.cos(a) * w * 0.26, -h * 0.14 + Math.sin(a) * h * 0.22,
      w * 0.13, h * 0.15, a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#6aa85c";
  ctx.beginPath(); ctx.arc(0, -h * 0.22, w * 0.12, 0, Math.PI * 2); ctx.fill();
};
// 古典式雕塑
window.PROP_DRAW["p57statue"] = function (ctx, p, T) {
  const w = T * 0.42, h = T * 0.96;
  ctx.fillStyle = "#b9b2a0";
  ctx.fillRect(-w / 2, h / 2 - h * 0.22, w, h * 0.22);   // 底座
  ctx.fillStyle = "#d6cfbe";
  ctx.beginPath();                                        // 身体
  ctx.ellipse(0, h * 0.02, w * 0.42, h * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();                                        // 头
  ctx.arc(0, -h * 0.26, w * 0.30, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(120,112,96,.35)";
  ctx.fillRect(-w * 0.05, -h * 0.16, w * 0.10, h * 0.30);
};
// 裹满灰浆的研磨杵
window.PROP_DRAW["p57pestle"] = function (ctx, p, T) {
  const w = T * 0.24, h = T * 0.56;
  ctx.fillStyle = "#cdc4ac";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#b3a98e";                              // 干掉的灰浆
  ctx.fillRect(-w / 2 - 1, -h / 2 + h * 0.45, w + 2, h * 0.30);
  ctx.fillStyle = "rgba(255,255,255,.35)";
  ctx.fillRect(-w / 2, -h / 2, w * 0.35, h);
};
// 画作（挂在墙上）—— 每幅的色彩和构图都不一样
window.PROP_DRAW["p57paint"] = function (ctx, p, T) {
  const idx = (p.idx | 0) % PAINT57.length;
  const w = T * 0.80, h = T * 0.66;
  ctx.fillStyle = "#6b4a33";                              // 画框
  ctx.fillRect(-w / 2 - 2, -h / 2 - 2, w + 4, h + 4);
  ctx.fillStyle = "#c8a44e";
  ctx.fillRect(-w / 2 - 1, -h / 2 - 1, w + 2, h + 2);
  // 画的内容：按画中层级给一套配色 —— 怪诞疏离
  const PAL = [
    ["#1f4a63", "#6fb6cf", "#e8d9a8"], ["#c9a227", "#f0e2b0", "#6b5a2a"],
    ["#5a4a3a", "#a89070", "#e0d2b8"], ["#2a2a45", "#5f5f9a", "#c0b0e0"],
    ["#3f5a3a", "#8fbf7a", "#e4e8c8"], ["#5a2a3a", "#a8566a", "#e8c8d0"],
    ["#2a4a3f", "#6f9a8a", "#d8e8e0"], ["#4a3a5a", "#8a6faa", "#ded0ea"],
  ];
  const pal = PAL[(idx * 3 + p.x + p.y) % PAL.length];
  ctx.fillStyle = pal[0];
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = pal[1];
  ctx.fillRect(-w / 2, h * 0.06, w, h * 0.44);
  // 一笔说不清的形状 —— 抽象画
  ctx.fillStyle = pal[2];
  ctx.beginPath();
  ctx.ellipse(-w * 0.12, -h * 0.12, w * 0.26, h * 0.20, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.22)";
  ctx.fillRect(-w / 2, -h / 2, w, 3);
};
// 那副月亮的画 —— 出口（-> Level 24）
window.PROP_DRAW["p57moon"] = function (ctx, p, T) {
  const t = performance.now() / 1000;
  const w = T * 0.86, h = T * 0.72;
  // 画框：比别的画更亮 —— 它是这一层的出口，得认得出来
  ctx.fillStyle = "#c8a44e";
  ctx.fillRect(-w / 2 - 3, -h / 2 - 3, w + 6, h + 6);
  // 夜空
  const gr = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  gr.addColorStop(0, "#12182e");
  gr.addColorStop(1, "#2a3352");
  ctx.fillStyle = gr;
  ctx.fillRect(-w / 2, -h / 2, w, h);
  // 星
  for (let i = 0; i < 10; i++) {
    const sx = -w / 2 + ((i * 37 + p.x * 11) % (w - 4)) + 2;
    const sy = -h / 2 + ((i * 23 + p.y * 7) % (h - 4)) + 2;
    ctx.fillStyle = "rgba(255,255,255," + (0.35 + ((i * 7) % 5) * 0.12).toFixed(2) + ")";
    ctx.fillRect(sx, sy, 1.6, 1.6);
  }
  // 月亮：铅基的浅灰 —— Level 24 的那颗
  const mr = Math.min(w, h) * 0.28;
  ctx.fillStyle = "#c8ccce";
  ctx.beginPath(); ctx.arc(0, -h * 0.06, mr, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#9aa0a4";                        // 环形山
  ctx.beginPath(); ctx.arc(-mr * 0.30, -h * 0.06 - mr * 0.20, mr * 0.22, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(mr * 0.34, -h * 0.06 + mr * 0.28, mr * 0.16, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(mr * 0.10, -h * 0.06 + mr * 0.52, mr * 0.12, 0, Math.PI * 2); ctx.fill();
  // 一圈冷白的光晕，会呼吸
  const gl = 0.18 + Math.sin(t * 1.2) * 0.08;
  ctx.fillStyle = "rgba(220,235,255," + gl.toFixed(3) + ")";
  ctx.beginPath(); ctx.arc(0, -h * 0.06, mr * 1.55, 0, Math.PI * 2); ctx.fill();
};
// 沉重的双扇门
window.PROP_DRAW["p57double"] = function (ctx, p, T) {
  const w = T * 0.96, h = T * 0.96;
  ctx.fillStyle = "#6b4a33";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#8a6440";
  ctx.fillRect(-w / 2, -h / 2, w * 0.46, h);             // 左扇（半开）
  ctx.fillRect(w * 0.06, -h / 2, w * 0.46, h);           // 右扇（半开）
  ctx.fillStyle = "rgba(30,20,12,.55)";
  ctx.fillRect(-1.5, -h / 2, 3, h);                      // 两扇之间的缝
  ctx.fillStyle = "#c8a44e";                             // 把手
  ctx.fillRect(-w * 0.14, -h * 0.04, w * 0.10, h * 0.08);
  ctx.fillRect(w * 0.06, -h * 0.04, w * 0.10, h * 0.08);
};
// 屏风
window.PROP_DRAW["p57screen"] = function (ctx, p, T) {
  const w = T * 0.86, h = T * 0.88;
  ctx.fillStyle = "#e2d8c0";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "rgba(140,120,90,.35)";
  for (let i = 1; i < 3; i++) ctx.fillRect(-w / 2 + i * w / 3, -h / 2, 2, h);
  ctx.fillStyle = "rgba(90,70,44,.30)";
  ctx.fillRect(-w / 2, h / 2 - 4, w, 4);
};
// 沙发毯
window.PROP_DRAW["p57blanket"] = function (ctx, p, T) {
  const w = T * 0.74, h = T * 0.52;
  ctx.fillStyle = "#8a6f9a";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#a890b8";
  for (let i = 0; i < 3; i++) ctx.fillRect(-w / 2 + 2, -h / 2 + 3 + i * h / 3, w - 4, h / 3 - 2);
  ctx.fillStyle = "rgba(255,255,255,.18)";
  ctx.fillRect(-w / 2, -h / 2, w, 2);
};
// 美术杂志
window.PROP_DRAW["p57artmag"] = function (ctx, p, T) {
  const w = T * 0.46, h = T * 0.34;
  ctx.fillStyle = "#f0e8d4";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#7a5a8a";
  ctx.fillRect(-w / 2, -h / 2, w, h * 0.30);
  ctx.fillStyle = "rgba(120,100,80,.45)";
  ctx.fillRect(-w / 2 + 2, h * 0.02, w - 4, 1.5);
  ctx.fillRect(-w / 2 + 2, h * 0.14, w - 8, 1.5);
};
// 蓝色睡眠眼罩
window.PROP_DRAW["p57mask"] = function (ctx, p, T) {
  const w = T * 0.56, h = T * 0.28;
  ctx.fillStyle = "#4a6fae";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#6f92cf";
  ctx.fillRect(-w / 2, -h / 2, w, h * 0.35);
  ctx.fillStyle = "#2f4a7a";
  ctx.fillRect(-w / 2 - 4, -h * 0.16, 4, h * 0.32);      // 松紧带
  ctx.fillRect(w / 2, -h * 0.16, 4, h * 0.32);
};
// 浸透丙烯颜料的软木雕像
window.PROP_DRAW["p57cork"] = function (ctx, p, T) {
  const w = T * 0.42, h = T * 0.78;
  ctx.fillStyle = "#c8a077";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "rgba(210,180,140,.65)";               // 软木的颗粒感
  for (let i = 0; i < 10; i++) {
    const gx = -w / 2 + ((i * 13 + p.x) % (w - 3));
    const gy = -h / 2 + ((i * 29 + p.y) % (h - 3));
    ctx.fillRect(gx, gy, 2, 2);
  }
  ctx.fillStyle = "#c8443a";                             // 泼上去的丙烯
  ctx.fillRect(-w / 2, -h * 0.10, w, h * 0.18);
  ctx.fillStyle = "#3a7ac8";
  ctx.fillRect(-w / 2, h * 0.14, w, h * 0.12);
  ctx.fillStyle = "#d8c83a";
  ctx.fillRect(-w / 2, -h * 0.34, w * 0.7, h * 0.10);
};
// 后方那面墙上的书架
window.PROP_DRAW["p57shelf2"] = function (ctx, p, T) {
  const w = T * 0.68, h = T * 0.90;
  ctx.fillStyle = "#5d4028";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  for (let r = 0; r < 2; r++) {
    const yy = -h / 2 + 3 + r * (h - 6) / 2;
    ctx.fillStyle = "#8a6440";
    ctx.fillRect(-w / 2 + 2, yy + (h - 6) / 2 - 3, w - 4, 2.5);
    for (let i = 0; i < 3; i++) {
      const bx = -w / 2 + 3 + i * (w - 6) / 3;
      const hh = 7 + ((p.x * 5 + p.y * 3 + i + r) % 4);
      ctx.fillStyle = ["#7a4a6a", "#3f5a72", "#a8563e", "#5a6a3a"][(i + r) % 4];
      ctx.fillRect(bx, yy + (h - 6) / 2 - 3 - hh, (w - 6) / 3 - 1.5, hh);
    }
  }
};
// 抽屉：里面耷拉着半折的画布
window.PROP_DRAW["p57drawer"] = function (ctx, p, T) {
  const w = T * 0.78, h = T * 0.60;
  ctx.fillStyle = "#6b4a33";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#8a6440";
  ctx.fillRect(-w / 2 + 2, -h / 2 + 2, w - 4, h * 0.42);
  ctx.fillStyle = "#f2ead6";                             // 半折的画布露在外面
  ctx.fillRect(-w * 0.30, -h / 2 + h * 0.10, w * 0.62, h * 0.26);
  ctx.fillStyle = "rgba(120,100,70,.45)";
  ctx.fillRect(-w * 0.30, -h / 2 + h * 0.22, w * 0.62, 1.5);
  ctx.fillStyle = "#c8a44e";
  ctx.fillRect(-4, -h / 2 + h * 0.16, 8, 3);             // 拉手
};
// 蓝色三角帐篷：内部天花板垂着点点繁星
window.PROP_DRAW["p57tent"] = function (ctx, p, T) {
  const t = performance.now() / 1000;
  const w = T * 0.92, h = T * 0.86;
  ctx.fillStyle = "#3f61a0";
  ctx.beginPath();
  ctx.moveTo(0, -h / 2);
  ctx.lineTo(w / 2, h / 2);
  ctx.lineTo(-w / 2, h / 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(20,30,60,.75)";                  // 门帘（里面是黑的）
  ctx.beginPath();
  ctx.moveTo(0, -h / 2);
  ctx.lineTo(w * 0.16, h / 2);
  ctx.lineTo(-w * 0.16, h / 2);
  ctx.closePath();
  ctx.fill();
  // 帐篷里的繁星（画在门帘里，一闪一闪）
  for (let i = 0; i < 8; i++) {
    const sx = ((i * 17 + p.x * 3) % 10) - 5;
    const sy = -h * 0.22 + ((i * 11) % 8);
    const tw = 0.45 + Math.sin(t * 2 + i * 1.3) * 0.35;
    ctx.fillStyle = "rgba(255,250,220," + Math.max(0.1, tw).toFixed(2) + ")";
    ctx.fillRect(sx, sy, 1.8, 1.8);
  }
  ctx.fillStyle = "#5f83c8";
  ctx.fillRect(-w / 2, h / 2 - 3, w, 3);
};
// 人为伪造的窗户：被绘制成能远望无垠沙滩的模样
window.PROP_DRAW["p57fakewin"] = function (ctx, p, T) {
  const w = T * 0.94, h = T * 0.94;
  ctx.fillStyle = "#8a6440";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  // 沙滩 + 海 + 天（画出来的，不是真的）
  ctx.fillStyle = "#8fd0e0";
  ctx.fillRect(-w / 2 + 3, -h / 2 + 3, w - 6, (h - 6) * 0.42);   // 天
  ctx.fillStyle = "#3f8fb0";
  ctx.fillRect(-w / 2 + 3, -h / 2 + 3 + (h - 6) * 0.42, w - 6, (h - 6) * 0.22); // 海
  ctx.fillStyle = "#e0c88a";
  ctx.fillRect(-w / 2 + 3, h / 2 - 3 - (h - 6) * 0.34, w - 6, (h - 6) * 0.34);  // 沙滩
  ctx.fillStyle = "#f2e2a8";                                     // 太阳（也是画的）
  ctx.beginPath(); ctx.arc(w * 0.24, -h / 2 + (h - 6) * 0.22, w * 0.09, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#6b4a33"; ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, -h / 2); ctx.lineTo(0, h / 2);
  ctx.moveTo(-w / 2, 0); ctx.lineTo(w / 2, 0);
  ctx.stroke();
};
// 蓝色豆袋椅
window.PROP_DRAW["p57bean"] = function (ctx, p, T) {
  const w = T * 0.66, h = T * 0.56;
  ctx.fillStyle = "#4a6fae";
  ctx.beginPath();
  ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#6f92cf";
  ctx.beginPath();
  ctx.ellipse(-w * 0.10, -h * 0.10, w * 0.30, h * 0.26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.16)";
  ctx.beginPath();
  ctx.ellipse(-w * 0.18, -h * 0.18, w * 0.14, h * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
};
// 一盘仿真水果
window.PROP_DRAW["p57fruit"] = function (ctx, p, T) {
  const w = T * 0.62, h = T * 0.46;
  ctx.fillStyle = "#c8b898";                             // 盘子
  ctx.beginPath();
  ctx.ellipse(0, h * 0.10, w / 2, h * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  const cols = ["#c8443a", "#d8c83a", "#5a9a4a", "#b06ab0"];
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = cols[i];
    ctx.beginPath();
    ctx.arc(-w * 0.30 + i * w * 0.20, -h * 0.06, w * 0.09, 0, Math.PI * 2);
    ctx.fill();
  }
};
// 画家：身着褪色蓝睡衣的少女
window.PROP_DRAW["p57painter"] = function (ctx, p, T) {
  const t = performance.now() / 1000;
  const w = T * 0.46, h = T * 0.86;
  const sway = Math.sin(t * 0.9 + p.x) * 1.2;
  ctx.translate(sway, 0);
  ctx.fillStyle = "#7f9fc8";                             // 褪色的蓝睡衣
  ctx.fillRect(-w / 2, -h * 0.10, w, h * 0.52);
  ctx.fillStyle = "#6f8fb8";
  ctx.fillRect(-w / 2, -h * 0.10, w * 0.30, h * 0.52);
  ctx.fillStyle = "#e8c9a8";                             // 头
  ctx.beginPath(); ctx.arc(0, -h * 0.28, w * 0.34, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#5a4030";                             // 头发
  ctx.beginPath();
  ctx.arc(0, -h * 0.30, w * 0.36, Math.PI * 0.95, Math.PI * 2.05);
  ctx.fill();
  ctx.fillRect(-w * 0.36, -h * 0.34, w * 0.14, h * 0.22);
  ctx.fillRect(w * 0.22, -h * 0.34, w * 0.14, h * 0.22);
  ctx.fillStyle = "#f2ead6";                             // 手里那支画笔
  ctx.fillRect(w * 0.22, h * 0.06, 3, h * 0.20);
  ctx.fillStyle = "#c8443a";
  ctx.fillRect(w * 0.21, h * 0.02, 5, 4);
  ctx.translate(-sway, 0);
};
// 壁画师：高挑而蒙面，层层白纱，蓝色陶制面具
window.PROP_DRAW["p57muralist"] = function (ctx, p, T) {
  const t = performance.now() / 1000;
  const w = T * 0.50, h = T * 1.00;
  const sway = Math.sin(t * 0.55 + p.y) * 0.8;
  ctx.translate(sway, 0);
  ctx.fillStyle = "#e8e6e0";                             // 层层白纱
  ctx.fillRect(-w / 2, -h * 0.16, w, h * 0.62);
  ctx.fillStyle = "rgba(190,188,182,.55)";
  ctx.fillRect(-w / 2, -h * 0.16, w * 0.26, h * 0.62);
  ctx.fillRect(w * 0.10, -h * 0.16, w * 0.26, h * 0.62);
  ctx.fillStyle = "#dedad0";                             // 头上的白纱
  ctx.beginPath(); ctx.arc(0, -h * 0.30, w * 0.36, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#3f6fb0";                             // 蓝色陶制面具
  ctx.beginPath();
  ctx.ellipse(0, -h * 0.29, w * 0.30, h * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1f3f6f";                             // 面具上的眼
  ctx.fillRect(-w * 0.16, -h * 0.31, w * 0.10, 3);
  ctx.fillRect(w * 0.06, -h * 0.31, w * 0.10, 3);
  // 手里那副 20 世纪的观剧镜
  ctx.fillStyle = "#4a4038";
  ctx.fillRect(-w * 0.10, -h * 0.02, w * 0.20, h * 0.06);
  ctx.fillStyle = "#c8a44e";
  ctx.beginPath(); ctx.arc(0, -h * 0.01, w * 0.09, 0, Math.PI * 2); ctx.fill();
  ctx.translate(-sway, 0);
};
// 她雕刻的陶土制品
window.PROP_DRAW["p57clay"] = function (ctx, p, T) {
  const w = T * 0.50, h = T * 0.40;
  ctx.fillStyle = "#8a6440";                             // 转盘
  ctx.fillRect(-w / 2, h * 0.10, w, h * 0.22);
  ctx.fillStyle = "#b07a52";                             // 没成型的一团陶土
  ctx.beginPath();
  ctx.ellipse(0, -h * 0.06, w * 0.28, h * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#c89468";
  ctx.beginPath();
  ctx.ellipse(-w * 0.06, -h * 0.12, w * 0.14, h * 0.10, 0, 0, Math.PI * 2);
  ctx.fill();
};
// 出口：那扇门 -> Level 21
window.PROP_DRAW["p57door21"] = function (ctx, p, T) {
  const w = T * 0.92, h = T * 0.96;
  ctx.fillStyle = "#6b4a33";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#8a6440";
  ctx.fillRect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 6);
  ctx.fillStyle = "#c8a44e";
  ctx.fillRect(w * 0.24, -h * 0.03, w * 0.12, h * 0.06);
  // 门牌上写着 21
  ctx.fillStyle = "#f2ead6";
  ctx.fillRect(-w * 0.30, -h * 0.40, w * 0.60, h * 0.16);
  ctx.fillStyle = "#3a3026";
  ctx.font = "bold " + Math.max(7, Math.round(T * 0.20)) + "px sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("21", 0, -h * 0.32);
};
