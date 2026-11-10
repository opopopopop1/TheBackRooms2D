// ===========================================================
// Level 45 —— 深渊公司
//   一片黑漆漆的虚空，虚空里稀疏地漂浮着各种各样的建筑，
//   这些建筑和前厅里的建筑完全相同 —— 已发现 33 栋。
//   它们以放射状排列，正中那栋和纽约的帝国大厦一模一样。
//
//   · 靠近中心的建筑有恒定电流，没有实体
//   · 更远的建筑经常停电，还会遭受死亡飞蛾的侵袭
//   · 受眷鸟漂在虚空里，把星星排成黄色的发光图案
//   · 每栋楼有自己的重力场，方向和大楼的朝向有关
//   · 楼里每样东西都用不了 —— 它们全是精致的塑料雕塑
//   · 唯一在建筑之间穿梭的方法：防火梯
//
//   地图读法：楼 = 浮在虚空里的一块块地面，楼与楼之间的黑是虚空（走不进去），
//   唯一连着它们的是一架架防火梯（铁格栅栈桥）。
// ===========================================================
"use strict";

(function () {
  // 楼里的地板 / 隔墙 / 外墙（虚空不在这张表里 —— 虚空由 drawAbyss45Wall 自己画）
  const v = ["#8e9094", "#7e8086", "#5a5c62"];
  if (typeof regTile === "function") regTile("abyss45", v);
  else { (window.__NEWTILE_EXTRA = window.__NEWTILE_EXTRA || {})["abyss45"] = v; }
})();

// ---------- 前厅里那些楼：各有各的地板、墙、家具和脚步声 ----------
const B45T = [
  { name: "写字楼", f: "#9a9c9e", w: "#c8cace", mat: "carpet", props: ["p45desk", "p45chair", "p45cooler", "p45plant"] },
  { name: "公寓楼", f: "#a8865e", w: "#d8c8a8", mat: "wood", props: ["p45bed", "p45sofa", "p45table", "p45fridge", "p45tv"] },
  { name: "学校", f: "#b0b2a8", w: "#dcded6", mat: "tile", props: ["p45desk", "p45chair", "p45board", "p45locker"] },
  { name: "医院", f: "#dfe6e8", w: "#eef2f4", mat: "tile", props: ["p45bed", "p45cab", "p45chair"] },
  { name: "商场", f: "#e2e0d8", w: "#eeeeea", mat: "tile", props: ["p45shelf", "p45mannequin", "p45counter"] },
  { name: "酒店", f: "#9a5a4a", w: "#d8c0a0", mat: "carpet", props: ["p45bed", "p45counter", "p45sofa"] },
  { name: "图书馆", f: "#a08a62", w: "#c8b48c", mat: "wood", props: ["p45shelf", "p45table", "p45chair"] },
  { name: "银行", f: "#d8d4c8", w: "#e8e4d8", mat: "tile", props: ["p45counter", "p45vault", "p45chair"] },
  { name: "仓库", f: "#8a8880", w: "#a8a6a0", mat: "concrete", props: ["p45crate", "p45shelf", "p45machine"] },
  { name: "教堂", f: "#98948a", w: "#c0bcb0", mat: "concrete", props: ["p45pew", "p45altar"] },
  { name: "餐厅", f: "#9a7a54", w: "#c8a882", mat: "wood", props: ["p45table", "p45chair", "p45counter"] },
  { name: "工厂", f: "#8e8a84", w: "#aaa69e", mat: "concrete", props: ["p45machine", "p45crate"] },
];

// 帝国大厦：黑金大理石的大堂 + 金色的灰泥墙（自己的一套，不走上面那张表）
const B45CENTER = { name: "帝国大厦", f: "#6a6050", w: "#b8a470", mat: "marble" };

function h45(a, b) {
  const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// 这栋楼现在亮不亮 —— 由时间和它自己的种子决定，所以整层是同步的
function b45Lit(b, t) {
  if (!b) return 1;
  if (b.power >= 0.999) return 1;
  const ph = Math.sin(t * 0.45 + b.seed * 1.7) * 0.5 + 0.5;
  if (ph >= b.power) return 0.12;                       // 停电
  const fl = Math.sin(t * 13 + b.seed * 5.1);
  return fl > 0.88 ? 0.42 : 0.95;                       // 灯在抖
}
window.b45Lit = b45Lit;

function generateAbyss45Map(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const props = [];
  const cx = Math.floor(size / 2), cy = Math.floor(size / 2);

  // 每格属于哪栋楼 / 是哪种格：
  //   I 楼内地面   P 楼内隔墙   C 楼的外墙（有窗的那一圈）   X 防火梯（栈桥）
  // 不在表里的格子 = 虚空
  const kind = new Map();
  const idx = new Map();
  const buildings = [];

  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return null;
    if (grid[y][x] !== 0) return null;
    const p = Object.assign({ x, y, floor: 0, type }, extra || {});
    props.push(p);
    return p;
  };

  // ---------- 一栋楼：外墙一圈 + 里面一条走廊 + 走廊两侧一间间房 ----------
  function makeBuilding(rect, typeIdx, power, ring) {
    const b = {
      x0: rect.x0, y0: rect.y0, x1: rect.x1, y1: rect.y1,
      type: typeIdx, power, ring,
      seed: Math.random() * 100,
      // 重力场的方向 —— 和大楼的朝向有关。站在这栋楼里会被轻轻推着走。
      gx: 0, gy: 0,
      rooms: [], door: null,
    };
    const ang = Math.atan2((rect.y0 + rect.y1) / 2 - cy, (rect.x0 + rect.x1) / 2 - cx);
    const ga = ang + (Math.random() - 0.5) * 1.4;
    b.gx = Math.cos(ga); b.gy = Math.sin(ga);
    buildings.push(b);
    const bi = buildings.length - 1;

    // 外墙那一圈（有窗的立面）
    for (let x = b.x0; x <= b.x1; x++) {
      for (const y of [b.y0, b.y1]) { kind.set(x + "," + y, "C"); idx.set(x + "," + y, bi); }
    }
    for (let y = b.y0; y <= b.y1; y++) {
      for (const x of [b.x0, b.x1]) { kind.set(x + "," + y, "C"); idx.set(x + "," + y, bi); }
    }

    const ix0 = b.x0 + 1, iy0 = b.y0 + 1, ix1 = b.x1 - 1, iy1 = b.y1 - 1;
    const iw = ix1 - ix0 + 1, ih = iy1 - iy0 + 1;
    const mcy = Math.floor((iy0 + iy1) / 2);
    const chh = ih >= 9 ? 2 : 1;
    const cy0 = mcy, cy1 = mcy + chh - 1;
    // 记下来 —— 防火梯的门必须开在正对走廊的位置，
    // 否则门开在外墙上、门里侧却是一堵隔墙，整栋楼就成了看得见进不去的摆设。
    b.cy0 = cy0; b.cy1 = cy1; b.ix0 = ix0; b.ix1 = ix1; b.mx = Math.floor((ix0 + ix1) / 2);

    const mark = (x, y, k) => {
      if (x < 0 || y < 0 || x >= size || y >= size) return;
      kind.set(x + "," + y, k); idx.set(x + "," + y, bi);
    };

    // 中间那条走廊
    for (let x = ix0; x <= ix1; x++) {
      for (let y = cy0; y <= cy1; y++) { grid[y][x] = 0; mark(x, y, "I"); }
    }

    // 走廊两侧的房间：隔墙分开，每间朝走廊开一个门洞
    const band = (yTop, yBot, wallY) => {
      const rooms = [];
      if (yBot - yTop < 1) return rooms;
      let x = ix0;
      while (x <= ix1) {
        const rw = randInt(4, 6);
        const x2 = Math.min(x + rw - 1, ix1);
        for (let yy = yTop; yy <= yBot; yy++) {
          for (let xx = x; xx <= x2; xx++) { grid[yy][xx] = 0; mark(xx, yy, "I"); }
        }
        // 与走廊之间那道墙，中间留门洞
        for (let xx = x; xx <= x2; xx++) { grid[wallY][xx] = 1; mark(xx, wallY, "P"); }
        const dx = Math.floor((x + x2) / 2);
        grid[wallY][dx] = 0; mark(dx, wallY, "I");
        rooms.push({ x0: x, x1: x2, y0: yTop, y1: yBot, doorX: dx, doorY: wallY });
        x = x2 + 2;
        if (x > ix1) break;
      }
      return rooms;
    };

    b.rooms = band(iy0, cy0 - 2, cy0 - 1).concat(band(cy1 + 2, iy1, cy1 + 1));
    // 房间之间那道隔墙本身（band 只画了朝走廊那道）
    for (const r of b.rooms) {
      for (const wx of [r.x0 - 1, r.x1 + 1]) {
        if (wx <= ix0 - 1 || wx >= ix1 + 1) continue;
        for (let yy = r.y0; yy <= r.y1; yy++) {
          if (grid[yy][wx] === 0) { grid[yy][wx] = 1; mark(wx, yy, "P"); }
        }
      }
    }
    // 楼内剩下的格子：默认还是墙 —— 标成隔墙，别被当成虚空
    for (let y = b.y0; y <= b.y1; y++) {
      for (let x = b.x0; x <= b.x1; x++) {
        if (!kind.has(x + "," + y)) { kind.set(x + "," + y, "P"); idx.set(x + "," + y, bi); }
      }
    }
    return b;
  }

  // ---------- 中心那栋：帝国大厦 ----------
  const CW = 24, CH = 18;
  const center = makeBuilding(
    { x0: cx - Math.floor(CW / 2), y0: cy - Math.floor(CH / 2), x1: cx - Math.floor(CW / 2) + CW - 1, y1: cy - Math.floor(CH / 2) + CH - 1 },
    -1, 1.0, 0);
  center.isCenter = true;
  center.gx = 0; center.gy = 0;      // 总部这栋是稳的 —— 重力场不推你

  // ---------- 三圈：放射状排开 ----------
  const rings = [
    { r: 26, n: 6, w: [12, 14], h: [10, 12], power: 1.0 },
    { r: 42, n: 10, w: [10, 13], h: [9, 11], power: 0.82 },
    { r: 57, n: 16, w: [10, 13], h: [9, 11], power: 0.5 },
  ];
  const ringB = [[], [], []];
  let ti = 0;
  for (let ri = 0; ri < rings.length; ri++) {
    const R = rings[ri];
    const off = Math.random() * Math.PI * 2;
    for (let i = 0; i < R.n; i++) {
      const a = off + (i / R.n) * Math.PI * 2;
      const rr = R.r + (Math.random() - 0.5) * 3;
      const bw = randInt(R.w[0], R.w[1]), bh = randInt(R.h[0], R.h[1]);
      let bx = Math.round(cx + Math.cos(a) * rr);
      let by = Math.round(cy + Math.sin(a) * rr);
      let x0 = bx - Math.floor(bw / 2), x1 = x0 + bw - 1;
      let y0 = by - Math.floor(bh / 2), y1 = y0 + bh - 1;
      // 别顶出地图
      if (x0 < 2) { x1 += 2 - x0; x0 = 2; }
      if (y0 < 2) { y1 += 2 - y0; y0 = 2; }
      if (x1 > size - 3) { x0 -= x1 - (size - 3); x1 = size - 3; }
      if (y1 > size - 3) { y0 -= y1 - (size - 3); y1 = size - 3; }
      const b = makeBuilding({ x0, y0, x1, y1 }, ti % B45T.length, R.power, ri + 1);
      ti++;
      ringB[ri].push(b);
    }
  }

  // ---------- 防火梯：楼与楼之间唯一的路 ----------
  // 帝国大厦的正门提前定下来 —— 防火梯必须绕开它，
  // 否则走到正门前，提示会被脚下的梯子抢走，按 E 去的就不是枢纽了。
  const FRONT = { x: Math.floor((center.x0 + center.x1) / 2), y: center.y1 };
  // 从这栋楼的外墙上开一个门，走出去，接一段铁格栅栈桥，落到另一栋楼的外墙门口。
  // 每个防火梯都不是通往虚空，而是通往另一栋建筑 —— 所以栈桥两头各有半截梯子。
  function link(a, b) {
    const ac = { x: (a.x0 + a.x1) / 2, y: (a.y0 + a.y1) / 2 };
    const bc = { x: (b.x0 + b.x1) / 2, y: (b.y0 + b.y1) / 2 };
    // a 朝向 b 的那条边
    const dirA = Math.abs(bc.x - ac.x) >= Math.abs(bc.y - ac.y)
      ? { x: Math.sign(bc.x - ac.x) || 1, y: 0 } : { x: 0, y: Math.sign(bc.y - ac.y) || 1 };
    const dirB = { x: -dirA.x, y: -dirA.y };
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    // 门必须开在正对楼内走廊的那一行 / 那一列。
    // 以前直接拿楼的中心算：走廊只有一行时，中心那行往往正好是隔墙，
    // 于是门开在外墙上、门里侧却堵着一堵墙 —— 整栋楼变成看得见进不去的摆设。
    const mkDoor = (r, dir) => {
      if (dir.x) return { x: dir.x > 0 ? r.x1 : r.x0, y: clamp(r.cy0, r.y0 + 1, r.y1 - 1) };
      return { x: clamp(r.mx, r.x0 + 1, r.x1 - 1), y: dir.y > 0 ? r.y1 : r.y0 };
    };
    // 别压在帝国大厦的正门上
    const shiftOff = (d, r, dir) => {
      if (Math.abs(d.x - FRONT.x) + Math.abs(d.y - FRONT.y) > 2) return d;
      const e = dir.x ? { x: 0, y: 4 } : { x: 4, y: 0 };
      for (const s of [1, -1, 2, -2]) {
        const nd = { x: d.x + e.x * s, y: d.y + e.y * s };
        if (nd.x < r.x0 || nd.x > r.x1 || nd.y < r.y0 || nd.y > r.y1) continue;
        if (Math.abs(nd.x - FRONT.x) + Math.abs(nd.y - FRONT.y) > 2) return nd;
      }
      return d;
    };
    const doorA = shiftOff(mkDoor(a, dirA), a, dirA);
    const doorB = shiftOff(mkDoor(b, dirB), b, dirB);

    const step = (d, dir) => ({ x: d.x + dir.x, y: d.y + dir.y });
    const inRect = (p, r) => p.x >= r.x0 - 1 && p.x <= r.x1 + 1 && p.y >= r.y0 - 1 && p.y <= r.y1 + 1;
    let sa = step(doorA, dirA), sb = step(doorB, dirB);
    let guard = 0;
    while (inRect(sa, a) && guard++ < 12) sa = step(sa, dirA);
    guard = 0;
    while (inRect(sb, b) && guard++ < 12) sb = step(sb, dirB);
    sa.x = Math.max(1, Math.min(size - 2, sa.x)); sa.y = Math.max(1, Math.min(size - 2, sa.y));
    sb.x = Math.max(1, Math.min(size - 2, sb.x)); sb.y = Math.max(1, Math.min(size - 2, sb.y));

    // 一格一格地打通 —— 从这栋楼的门口开始，一路挖到另一栋楼的门口。
    // 以前只从"走出楼外一格之后"才开始挖，于是门口外那一格永远是虚空，
    // 栈桥和楼之间隔着一道走不过去的缝 —— 全层 92% 是走不到的死区。
    const carveTile = (x, y) => {
      if (x < 1 || y < 1 || x > size - 2 || y > size - 2) return;
      const kk2 = x + "," + y;
      grid[y][x] = 0;
      const was = kind.get(kk2);
      if (!was || was === "C") { kind.set(kk2, "X"); idx.set(kk2, -1); }
    };
    const carveLine = (x0, y0, x1, y1) => {
      if (y0 === y1) {
        const stp = x1 >= x0 ? 1 : -1;
        for (let xx = x0; ; xx += stp) { carveTile(xx, y0); if (xx === x1) break; }
      } else {
        const stp = y1 >= y0 ? 1 : -1;
        for (let yy = y0; ; yy += stp) { carveTile(x0, yy); if (yy === y1) break; }
      }
    };
    // 门里侧也要通：从门口往楼里挖，一直挖到接上楼内地面为止
    const carveIn = (d, dir) => {
      let x = d.x - dir.x, y = d.y - dir.y, guard = 0;
      while (guard++ < 24) {
        if (x < 1 || y < 1 || x > size - 2 || y > size - 2) break;
        const kk = x + "," + y;
        const wasFloor = grid[y][x] === 0;
        grid[y][x] = 0;
        if (!kind.has(kk)) { kind.set(kk, "I"); idx.set(kk, -1); }
        if (wasFloor) break;
        x -= dir.x; y -= dir.y;
      }
    };
    carveIn(doorA, dirA);
    carveIn(doorB, dirB);
    carveLine(doorA.x, doorA.y, sa.x, sa.y);
    carveLine(sa.x, sa.y, sb.x, sa.y);
    carveLine(sb.x, sa.y, sb.x, sb.y);
    carveLine(sb.x, sb.y, doorB.x, doorB.y);
    return { a: doorA, b: doorB };
  }

  const links = [];
  for (let i = 0; i < ringB[0].length; i++) links.push(link(ringB[0][i], center));
  for (let i = 0; i < ringB[1].length; i++) {
    let best = ringB[0][0], bd = 1e9;
    for (const c of ringB[0]) {
      const d = Math.hypot((c.x0 + c.x1) / 2 - (ringB[1][i].x0 + ringB[1][i].x1) / 2,
        (c.y0 + c.y1) / 2 - (ringB[1][i].y0 + ringB[1][i].y1) / 2);
      if (d < bd) { bd = d; best = c; }
    }
    links.push(link(ringB[1][i], best));
  }
  for (let i = 0; i < ringB[2].length; i++) {
    let best = ringB[1][0], bd = 1e9;
    for (const c of ringB[1]) {
      const d = Math.hypot((c.x0 + c.x1) / 2 - (ringB[2][i].x0 + ringB[2][i].x1) / 2,
        (c.y0 + c.y1) / 2 - (ringB[2][i].y0 + ringB[2][i].y1) / 2);
      if (d < bd) { bd = d; best = c; }
    }
    links.push(link(ringB[2][i], best));
  }

  // ---------- 保险：万一有哪栋楼没连上，直接拉一条栈桥回帝国大厦 ----------
  // 以前只靠"环形相邻"来连，只要有一栋被跳过，整栋楼就变成看得见走不进去的摆设。
  const reachable = () => {
    const seen = new Set();
    const st = { x: cx, y: cy };
    const q = [st]; seen.add(st.x + "," + st.y);
    while (q.length) {
      const p = q.shift();
      for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = p.x + d[0], ny = p.y + d[1], k = nx + "," + ny;
        if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue;
        if (seen.has(k) || grid[ny][nx] !== 0) continue;
        seen.add(k); q.push({ x: nx, y: ny });
      }
    }
    return seen;
  };
  for (let pass = 0; pass < 3; pass++) {
    const seen = reachable();
    let fixed = false;
    for (const b of buildings) {
      const mx = Math.floor((b.x0 + b.x1) / 2), my = Math.floor((b.y0 + b.y1) / 2);
      if (!seen.has(mx + "," + my)) { link(b, center); fixed = true; }
    }
    if (!fixed) break;
  }

  // ---------- 防火梯两端的梯子 ----------
  for (const L of links) {
    // 正门那一格不放梯子 —— 否则走到正门前提示会被梯子抢走
    if (!(L.a.x === FRONT.x && L.a.y === FRONT.y)) put(L.a.x, L.a.y, "p45escape", { dir: 1 });
    if (!(L.b.x === FRONT.x && L.b.y === FRONT.y)) put(L.b.x, L.b.y, "p45escape", { dir: -1 });
  }

  // ---------- 帝国大厦：B.R.C. 总部 ----------
  // 正门开在南面外墙正中 —— 从这儿出去回枢纽
  const frx = FRONT.x;
  const fry = FRONT.y;
  grid[fry][frx] = 0; kind.set(frx + "," + fry, "I"); idx.set(frx + "," + fry, 0);
  const frontDoor = { x: frx, y: fry, floor: 0, type: "p45frontdoor", toLevel: "hub",
    tip: "帝国大厦的正门 —— 门楣上一行小字：B.R.C. 总部" };
  props.push(frontDoor);
  center.frontDoor = { x: frx, y: fry };

  // 正门内侧的电梯核心：一间四面都有电梯门的方形井道
  {
    // 井道必须整个落在楼上的房间带里 —— 以前它压在走廊和门洞那一行上，
    // 正好把某一间房的门洞糊成墙，那间房就成了看得见进不去的死区。
    const ex = Math.floor((center.x0 + center.x1) / 2), ey = center.y0 + 2;
    for (let y = ey; y <= ey + 2; y++) for (let x = ex - 1; x <= ex + 1; x++) {
      if (x > center.x0 && x < center.x1 && y > center.y0 && y < center.y1) { grid[y][x] = 1; kind.set(x + "," + y, "P"); idx.set(x + "," + y, 0); }
    }
    put(ex, ey + 3, "p45elev");
    put(ex - 1, ey + 1, "p45elev");
    put(ex + 1, ey + 1, "p45elev");
  }

  // 楼上的实验室 / 办公室，楼下（最下面一排）关着从别的层级弄来的东西
  {
    const cyMid = Math.floor((center.y0 + center.y1) / 2);
    for (const r of center.rooms) {
      const isBottom = r.y0 > cyMid;
      const isLab = !isBottom && ((r.x0 + r.y0) % 2 === 0);
      const cells = [];
      for (let y = r.y0; y <= r.y1; y++) for (let x = r.x0; x <= r.x1; x++) {
        if (grid[y][x] === 0) cells.push({ x, y });
      }
      if (!cells.length) continue;
      if (isLab) {
        put(cells[0].x, cells[0].y, "p45tank");
        if (cells.length > 3) put(cells[2].x, cells[2].y, "p45cab");
        if (cells.length > 5) put(cells[4].x, cells[4].y, "p45desk");
      } else if (isBottom) {
        put(cells[0].x, cells[0].y, "p45pen");
        if (cells.length > 4) put(cells[3].x, cells[3].y, "p45crate");
      } else {
        put(cells[0].x, cells[0].y, "p45desk");
        if (cells.length > 3) put(cells[2].x, cells[2].y, "p45chair");
        if (cells.length > 5) put(cells[4].x, cells[4].y, "p45cab");
      }
    }
    // 门口那块牌子
    put(frx - 2, fry - 1, "p45sign");
  }

  // ---------- 其余 32 栋：按各自的用途摆家具（全都是塑料雕塑） ----------
  for (const b of buildings) {
    if (b === center) continue;
    const T = B45T[b.type] || B45T[0];
    for (const r of b.rooms) {
      const cells = [];
      for (let y = r.y0; y <= r.y1; y++) for (let x = r.x0; x <= r.x1; x++) {
        if (grid[y][x] === 0) cells.push({ x, y });
      }
      if (!cells.length) continue;
      const n = 1 + Math.floor(Math.random() * 2.4);
      for (let i = 0; i < n; i++) {
        const c = cells[randInt(0, cells.length - 1)];
        put(c.x, c.y, T.props[randInt(0, T.props.length - 1)]);
      }
    }
  }

  // ---------- 受眷鸟：漂在虚空里，把星星排成黄色的发光图案 ----------
  // 数量由它们控制的是死亡飞蛾 —— 而它们自己只是静静地发光。
  const birdSet = new Set();
  const birds = [];
  for (let tries = 0; tries < 900 && birds.length < 40; tries++) {
    const x = randInt(3, size - 4), y = randInt(3, size - 4);
    const k = x + "," + y;
    if (kind.has(k) || birdSet.has(k)) continue;
    // 别贴着楼 —— 它们漂在虚空里
    let nearB = false;
    for (let dy = -3; dy <= 3 && !nearB; dy++) {
      for (let dx = -3; dx <= 3; dx++) if (kind.has((x + dx) + "," + (y + dy))) { nearB = true; break; }
    }
    if (nearB) continue;
    birdSet.add(k); birds.push({ x, y, seed: Math.random() * 100 });
  }

  // 靠近中心的建筑没有实体（BRC 引进的除外）—— 让实体别踏进这两圈
  const safe = new Set();
  const addSafe = (b) => {
    for (let y = b.y0; y <= b.y1; y++) for (let x = b.x0; x <= b.x1; x++) safe.add(x + "," + y);
  };
  addSafe(center);
  for (const b of ringB[0]) addSafe(b);

  // 出生点：正门内侧
  const start = { x: frx, y: fry - 1, floor: 0 };
  grid[start.y][start.x] = 0;

  // ---------- 兜底：任何一片地面都必须走得到 ----------
  // 上面每一处都尽量不留死区，但只要有一处漏算，整栋楼就会变成看得见进不去的摆设。
  // 这里统一收口：从出生点走不到的地面，一律就近凿一条防火梯接回主网络。
  {
    const bfsFloor = (sx, sy) => {
      const seen = new Set([sx + "," + sy]); const q = [[sx, sy]];
      while (q.length) {
        const c = q.pop();
        for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = c[0] + d[0], ny = c[1] + d[1];
          if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue;
          const k = nx + "," + ny;
          if (seen.has(k) || grid[ny][nx] !== 0) continue;
          seen.add(k); q.push([nx, ny]);
        }
      }
      return seen;
    };
    for (let pass = 0; pass < 8; pass++) {
      const seen = bfsFloor(start.x, start.y);
      let tgt = null;
      for (let y = 1; y < size - 1 && !tgt; y++) for (let x = 1; x < size - 1; x++) {
        if (grid[y][x] === 0 && !seen.has(x + "," + y)) { tgt = [x, y]; break; }
      }
      if (!tgt) break;
      // 从主网络出发找最近的那片孤立地面（允许穿墙地找），再把这条路径凿成防火梯
      const prev = new Map(); const q = [];
      for (const k of seen) { const [x, y] = k.split(",").map(Number); prev.set(k, null); q.push([x, y]); }
      let hit = null;
      for (let qi = 0; qi < q.length && !hit; qi++) {
        const c = q[qi];
        for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = c[0] + d[0], ny = c[1] + d[1];
          if (nx < 1 || ny < 1 || nx > size - 2 || ny > size - 2) continue;
          const k = nx + "," + ny;
          if (prev.has(k)) continue;
          prev.set(k, c[0] + "," + c[1]);
          if (!seen.has(k) && grid[ny][nx] === 0) { hit = k; break; }
          q.push([nx, ny]);
        }
      }
      if (!hit) break;
      let cur = hit, guard = 0;
      while (cur && !seen.has(cur) && guard++ < 4000) {
        const [x, y] = cur.split(",").map(Number);
        grid[y][x] = 0;
        const was = kind.get(cur);
        if (!was || was === "C") { kind.set(cur, "X"); idx.set(cur, -1); }
        cur = prev.get(cur);
      }
    }
  }
  const floors = collectFloors(grid, size);

  // 联机：每人落在一栋不同的楼里
  const spawnPts = [{ x: start.x, y: start.y, floor: 0 }];
  for (const b of buildings) {
    if (b === center) continue;
    const mx = Math.floor((b.x0 + b.x1) / 2);
    const my = Math.floor((b.y0 + b.y1) / 2);
    let sp = null;
    for (let r = 0; r < 8 && !sp; r++) {
      const x = mx + randInt(-2, 2), y = my + randInt(-2, 2);
      if (grid[y] && grid[y][x] === 0) sp = { x, y, floor: 0 };
    }
    if (sp) spawnPts.push(sp);
    if (spawnPts.length >= 8) break;
  }

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [],
    b45kind: kind, b45idx: idx, b45buildings: buildings, b45center: 0,
    b45birds: birds, b45birdSet: birdSet, b45safe: safe, b45links: links,
    b45rings: rings.length,
  };
  map.spawnPts = spawnPts;
  return map;
}
window.generateAbyss45Map = generateAbyss45Map;

// ---------- 地面 ----------
window.drawAbyss45Floor = function (ctx, px, py, S, map, tx, ty) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  const k = tx + "," + ty;
  const kind = map.b45kind && map.b45kind.get(k);

  if (kind === "X") {
    // 防火梯：铁格栅栈桥，架在虚空上
    ctx.fillStyle = "#31363c";
    ctx.fillRect(px, py, S, S);
    ctx.strokeStyle = "#4a525a"; ctx.lineWidth = Math.max(1, S * 0.05);
    for (let i = 0; i < 4; i++) {
      const oy = py + S * (0.12 + i * 0.25);
      ctx.beginPath(); ctx.moveTo(px, oy); ctx.lineTo(px + S, oy); ctx.stroke();
    }
    ctx.strokeStyle = "rgba(150,164,178,0.5)"; ctx.lineWidth = Math.max(1, S * 0.035);
    for (let i = 0; i < 3; i++) {
      const ox = px + S * (0.2 + i * 0.3);
      ctx.beginPath(); ctx.moveTo(ox, py); ctx.lineTo(ox, py + S); ctx.stroke();
    }
    // 两侧栏杆：临着虚空的那一侧才有
    ctx.strokeStyle = "#8a949e"; ctx.lineWidth = Math.max(1.5, S * 0.075);
    const nb = (dx, dy) => !(map.b45kind && map.b45kind.has((tx + dx) + "," + (ty + dy)));
    if (nb(0, -1)) { ctx.beginPath(); ctx.moveTo(px, py + S * 0.12); ctx.lineTo(px + S, py + S * 0.12); ctx.stroke(); }
    if (nb(0, 1)) { ctx.beginPath(); ctx.moveTo(px, py + S * 0.88); ctx.lineTo(px + S, py + S * 0.88); ctx.stroke(); }
    if (nb(-1, 0)) { ctx.beginPath(); ctx.moveTo(px + S * 0.12, py); ctx.lineTo(px + S * 0.12, py + S); ctx.stroke(); }
    if (nb(1, 0)) { ctx.beginPath(); ctx.moveTo(px + S * 0.88, py); ctx.lineTo(px + S * 0.88, py + S); ctx.stroke(); }
    return true;
  }

  if (kind !== "I") {
    // 不该出现的地板格 —— 画成虚空的深色，别留成一片纯黑
    ctx.fillStyle = "#0b0d18";
    ctx.fillRect(px, py, S, S);
    return true;
  }

  const bi = map.b45idx ? map.b45idx.get(k) : 0;
  const b = (bi != null && bi >= 0) ? map.b45buildings[bi] : null;
  const T = (b && b.type >= 0) ? B45T[b.type] : B45CENTER;
  const lit = b45Lit(b, t);

  ctx.fillStyle = T.f;
  ctx.fillRect(px, py, S, S);

  if (b && b.isCenter) {
    // 帝国大厦：黑金大理石 —— 一道道金色的纹路
    ctx.strokeStyle = "rgba(198,168,96,0.55)"; ctx.lineWidth = Math.max(1, S * 0.045);
    ctx.beginPath();
    ctx.moveTo(px + h45(tx, ty) * S, py);
    ctx.lineTo(px + S * (0.3 + h45(ty, tx) * 0.5), py + S);
    ctx.stroke();
    ctx.strokeStyle = "rgba(230,206,140,0.30)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(px, py + S * 0.7); ctx.lineTo(px + S, py + S * 0.35); ctx.stroke();
  } else if (T.mat === "carpet") {
    ctx.fillStyle = "rgba(0,0,0,0.10)";
    for (let i = 0; i < 5; i++) ctx.fillRect(px + h45(tx + i, ty) * S, py + h45(ty + i, tx) * S, 2, 2);
  } else if (T.mat === "wood") {
    ctx.strokeStyle = "rgba(70,48,28,0.35)"; ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const oy = py + S * (0.25 + i * 0.28);
      ctx.beginPath(); ctx.moveTo(px, oy); ctx.lineTo(px + S, oy); ctx.stroke();
    }
  } else {
    ctx.strokeStyle = "rgba(0,0,0,0.10)"; ctx.lineWidth = 1;
    ctx.strokeRect(px + 0.5, py + 0.5, S - 1, S - 1);
  }

  // 顶灯：亮着的时候地上有一摊光
  if (lit > 0.5 && ((tx * 5 + ty * 3) % 7) === 0) {
    ctx.fillStyle = "rgba(255,240,200,0.10)";
    ctx.fillRect(px, py, S, S);
  }
  // 停电：整片压暗
  if (lit < 0.99) {
    ctx.fillStyle = "rgba(6,8,16," + ((1 - lit) * 0.80).toFixed(3) + ")";
    ctx.fillRect(px, py, S, S);
  }
  return true;
};

// ---------- 墙体：楼的外墙（有窗）/ 楼内隔墙 / 虚空 ----------
window.drawAbyss45Wall = function (ctx, px, py, S, map, tx, ty) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  const k = tx + "," + ty;
  const kind = map.b45kind && map.b45kind.get(k);

  if (kind === "C") {
    const bi = map.b45idx ? map.b45idx.get(k) : 0;
    const b = (bi != null && bi >= 0) ? map.b45buildings[bi] : null;
    const T = (b && b.type >= 0) ? B45T[b.type] : B45CENTER;
    const lit = b45Lit(b, t);
    ctx.fillStyle = T.w;
    ctx.fillRect(px, py, S, S);
    if (b && b.isCenter) {
      // 帝国大厦的立面：竖向的装饰线条（装饰艺术那套）
      ctx.strokeStyle = "rgba(150,124,66,0.5)"; ctx.lineWidth = Math.max(1, S * 0.05);
      ctx.beginPath(); ctx.moveTo(px + S * 0.3, py); ctx.lineTo(px + S * 0.3, py + S); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px + S * 0.7, py); ctx.lineTo(px + S * 0.7, py + S); ctx.stroke();
    }
    // 窗：亮着的时候透出暖光，停电了就是一块暗玻璃
    const warm = lit > 0.5;
    ctx.fillStyle = warm ? "rgba(255,226,150," + (0.55 + 0.25 * lit).toFixed(2) + ")" : "rgba(40,52,66,0.85)";
    ctx.fillRect(px + S * 0.20, py + S * 0.22, S * 0.26, S * 0.30);
    ctx.fillRect(px + S * 0.54, py + S * 0.22, S * 0.26, S * 0.30);
    ctx.fillStyle = warm ? "rgba(255,236,180," + (0.40 + 0.2 * lit).toFixed(2) + ")" : "rgba(34,44,56,0.85)";
    ctx.fillRect(px + S * 0.20, py + S * 0.58, S * 0.26, S * 0.24);
    ctx.fillRect(px + S * 0.54, py + S * 0.58, S * 0.26, S * 0.24);
    ctx.strokeStyle = "rgba(0,0,0,0.28)"; ctx.lineWidth = 1;
    ctx.strokeRect(px + S * 0.20, py + S * 0.22, S * 0.26, S * 0.30);
    ctx.strokeRect(px + S * 0.54, py + S * 0.22, S * 0.26, S * 0.30);
    if (lit < 0.99) {
      ctx.fillStyle = "rgba(6,8,16," + ((1 - lit) * 0.78).toFixed(3) + ")";
      ctx.fillRect(px, py, S, S);
    }
    return true;
  }

  if (kind === "P") {
    const bi = map.b45idx ? map.b45idx.get(k) : 0;
    const b = (bi != null && bi >= 0) ? map.b45buildings[bi] : null;
    const T = (b && b.type >= 0) ? B45T[b.type] : B45CENTER;
    const lit = b45Lit(b, t);
    ctx.fillStyle = T.w;
    ctx.fillRect(px, py, S, S);
    ctx.fillStyle = "rgba(255,255,255,0.16)";
    ctx.fillRect(px, py, S, Math.max(1, S * 0.18));
    ctx.fillStyle = "rgba(0,0,0,0.14)";
    ctx.fillRect(px, py + S * 0.82, S, Math.max(1, S * 0.18));
    if (lit < 0.99) {
      ctx.fillStyle = "rgba(6,8,16," + ((1 - lit) * 0.80).toFixed(3) + ")";
      ctx.fillRect(px, py, S, S);
    }
    return true;
  }

  // ---------- 虚空 ----------
  // 档案说它是"黑漆漆的虚空"，但那不是"没画" —— 这里铺满星，
  // 还有受眷鸟排出来的黄色发光图案，所以看上去是深蓝的星空而不是一片死黑。
  ctx.fillStyle = "#0b0d1a";
  ctx.fillRect(px, py, S, S);
  // 极淡的星云
  const neb = h45(tx * 0.6, ty * 0.6);
  if (neb > 0.62) {
    ctx.fillStyle = "rgba(56,64,120," + ((neb - 0.62) * 0.5).toFixed(3) + ")";
    ctx.fillRect(px, py, S, S);
  }
  // 星：每格三颗，会眨眼
  for (let i = 0; i < 3; i++) {
    const r1 = h45(tx * 3 + i, ty * 5 + i * 7);
    const r2 = h45(tx * 7 + i * 3, ty * 2 + i * 11);
    const tw = 0.55 + 0.45 * Math.sin(t * 1.7 + r1 * 40);
    const br = 0.30 + 0.60 * tw * r1;
    const sz = r1 > 0.88 ? Math.max(2, S * 0.10) : Math.max(1, S * 0.055);
    ctx.fillStyle = "rgba(226,234,255," + br.toFixed(3) + ")";
    ctx.fillRect(px + r1 * (S - sz), py + r2 * (S - sz), sz, sz);
  }
  // 偶尔一颗亮星：带十字的光芒
  if (h45(tx * 13, ty * 17) > 0.965) {
    const gx = px + S * 0.5, gy = py + S * 0.5;
    const pl = 0.55 + 0.45 * Math.sin(t * 2.2 + tx);
    ctx.strokeStyle = "rgba(210,226,255," + (0.5 * pl).toFixed(3) + ")"; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(gx - S * 0.34, gy); ctx.lineTo(gx + S * 0.34, gy);
    ctx.moveTo(gx, gy - S * 0.34); ctx.lineTo(gx, gy + S * 0.34);
    ctx.stroke();
  }
  // 漂在虚空里的碎片 —— 楼外没有重力，什么都浮着、慢慢转
  if (h45(tx * 5, ty * 9) > 0.93) {
    const a = t * 0.25 + h45(tx, ty) * 6.28;
    const ox = px + S * 0.5 + Math.cos(a) * S * 0.22;
    const oy = py + S * 0.5 + Math.sin(a) * S * 0.22;
    ctx.fillStyle = "rgba(150,156,168,0.55)";
    ctx.save(); ctx.translate(ox, oy); ctx.rotate(a * 0.7);
    ctx.fillRect(-S * 0.09, -S * 0.05, S * 0.18, S * 0.10);
    ctx.restore();
  }
  // 受眷鸟：黄色的发光图案，像一只鸟，也像星座
  if (map.b45birdSet && map.b45birdSet.has(k)) {
    const sd = h45(tx, ty) * 100;
    const pulse = 0.55 + 0.45 * Math.sin(t * 1.1 + sd);
    const gx = px + S * 0.5, gy = py + S * 0.5;
    const gr = ctx.createRadialGradient(gx, gy, 0, gx, gy, S * 0.75);
    gr.addColorStop(0, "rgba(255,226,120," + (0.30 * pulse).toFixed(3) + ")");
    gr.addColorStop(1, "rgba(255,226,120,0)");
    ctx.fillStyle = gr;
    ctx.fillRect(px - S * 0.3, py - S * 0.3, S * 1.6, S * 1.6);
    ctx.fillStyle = "rgba(255,236,150," + (0.55 + 0.4 * pulse).toFixed(3) + ")";
    // 身体 + 两只翅膀 + 尾巴：一串点连成的图案
    const pts = [[0, 0], [-0.22, -0.12], [-0.40, -0.24], [0.22, -0.12], [0.40, -0.24],
      [-0.14, 0.16], [0.14, 0.16], [0, 0.30]];
    for (const p of pts) {
      const s2 = Math.max(1.4, S * 0.055);
      ctx.fillRect(gx + p[0] * S - s2 / 2, gy + p[1] * S - s2 / 2, s2, s2);
    }
    ctx.strokeStyle = "rgba(255,232,160," + (0.30 * pulse).toFixed(3) + ")"; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(gx - 0.40 * S, gy - 0.24 * S); ctx.lineTo(gx, gy); ctx.lineTo(gx + 0.40 * S, gy - 0.24 * S);
    ctx.stroke();
  }
  return true;
};

// ---------- 整屏：站在停电的楼里就是黑的 ----------
window.drawAbyss45 = function (ctx, g) {
  const m = g.map;
  if (!m || !m.b45idx) return;
  const t = performance.now() / 1000;
  const tx = Math.floor(g.player.x / TILE), ty = Math.floor(g.player.y / TILE);
  const bi = m.b45idx.get(tx + "," + ty);
  const cw = ctx.canvas.width, ch = ctx.canvas.height;
  ctx.save();
  try { ctx.setTransform(1, 0, 0, 1, 0, 0); } catch (e) { /* 忽略 */ }
  if (bi != null && bi >= 0) {
    const b = m.b45buildings[bi];
    const lit = b45Lit(b, t);
    if (lit < 0.98) {
      ctx.fillStyle = "rgba(4,6,14," + ((1 - lit) * 0.62).toFixed(3) + ")";
      ctx.fillRect(0, 0, cw, ch);
    }
  }
  // 站在防火梯上：脚下是虚空 —— 一圈冷色的光晕，提醒你这外面没有重力
  const kind = m.b45kind.get(tx + "," + ty);
  if (kind === "X") {
    const gr = ctx.createRadialGradient(cw / 2, ch / 2, ch * 0.28, cw / 2, ch / 2, ch * 0.8);
    gr.addColorStop(0, "rgba(0,0,0,0)");
    gr.addColorStop(1, "rgba(40,60,120,0.22)");
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, cw, ch);
  }
  ctx.restore();
};

// ---------- 物件模型 ----------
// 楼里每样东西都是"精致的塑料雕塑" —— 摆得整整齐齐，一样也用不了。
window.PROP_DRAW = window.PROP_DRAW || {};

// 办公桌 + 一台塑料电脑
window.PROP_DRAW["p45desk"] = function (ctx, p, T) {
  ctx.fillStyle = "#8a6a48";
  ctx.fillRect(-T * 0.42, -T * 0.16, T * 0.84, T * 0.34);
  ctx.fillStyle = "#6e5438";
  ctx.fillRect(-T * 0.40, T * 0.16, T * 0.07, T * 0.22);
  ctx.fillRect(T * 0.33, T * 0.16, T * 0.07, T * 0.22);
  // 显示器：屏幕是画上去的
  ctx.fillStyle = "#3a3e46";
  ctx.fillRect(-T * 0.20, -T * 0.40, T * 0.40, T * 0.26);
  ctx.fillStyle = "rgba(150,180,200,0.55)";
  ctx.fillRect(-T * 0.17, -T * 0.37, T * 0.34, T * 0.20);
  ctx.fillStyle = "#2a2e34";
  ctx.fillRect(-T * 0.05, -T * 0.16, T * 0.10, T * 0.05);
  // 键盘
  ctx.fillStyle = "#c8c4bc";
  ctx.fillRect(-T * 0.22, -T * 0.08, T * 0.34, T * 0.09);
};

window.PROP_DRAW["p45chair"] = function (ctx, p, T) {
  ctx.fillStyle = "#4a4e56";
  ctx.fillRect(-T * 0.16, -T * 0.10, T * 0.32, T * 0.10);
  ctx.fillRect(-T * 0.16, -T * 0.28, T * 0.32, T * 0.20);
  ctx.fillStyle = "#3a3e46";
  ctx.fillRect(-T * 0.04, T * 0.00, T * 0.08, T * 0.16);
  ctx.fillRect(-T * 0.18, T * 0.14, T * 0.36, T * 0.05);
};

// 水冷器
window.PROP_DRAW["p45cooler"] = function (ctx, p, T) {
  ctx.fillStyle = "#dcd8d0";
  ctx.fillRect(-T * 0.16, -T * 0.24, T * 0.32, T * 0.46);
  ctx.fillStyle = "rgba(120,190,220,0.75)";
  ctx.fillRect(-T * 0.20, -T * 0.42, T * 0.40, T * 0.22);
  ctx.fillStyle = "#5a5e64";
  ctx.fillRect(-T * 0.10, -T * 0.06, T * 0.08, T * 0.06);
  ctx.fillRect(-T * 0.10, T * 0.06, T * 0.08, T * 0.06);
};

// 盆栽（也是塑料的）
window.PROP_DRAW["p45plant"] = function (ctx, p, T) {
  ctx.fillStyle = "#8a6a4a";
  ctx.fillRect(-T * 0.14, T * 0.06, T * 0.28, T * 0.22);
  ctx.fillStyle = "#4a7a3a";
  ctx.beginPath(); ctx.ellipse(0, -T * 0.10, T * 0.20, T * 0.16, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#5c8c46";
  ctx.beginPath(); ctx.ellipse(-T * 0.07, -T * 0.20, T * 0.11, T * 0.09, 0, 0, Math.PI * 2); ctx.fill();
};

window.PROP_DRAW["p45bed"] = function (ctx, p, T) {
  ctx.fillStyle = "#7a5a44";
  ctx.fillRect(-T * 0.44, -T * 0.26, T * 0.88, T * 0.52);
  ctx.fillStyle = "#e8e4dc";
  ctx.fillRect(-T * 0.40, -T * 0.22, T * 0.80, T * 0.34);
  ctx.fillStyle = "#c8c4bc";
  ctx.fillRect(-T * 0.40, -T * 0.22, T * 0.26, T * 0.34);
  ctx.fillStyle = "#9a9a94";
  ctx.fillRect(-T * 0.44, -T * 0.32, T * 0.88, T * 0.08);
};

window.PROP_DRAW["p45sofa"] = function (ctx, p, T) {
  ctx.fillStyle = "#6a5a6a";
  ctx.fillRect(-T * 0.42, -T * 0.14, T * 0.84, T * 0.30);
  ctx.fillRect(-T * 0.42, -T * 0.28, T * 0.84, T * 0.16);
  ctx.fillStyle = "#7c6c7c";
  ctx.fillRect(-T * 0.42, -T * 0.14, T * 0.10, T * 0.30);
  ctx.fillRect(T * 0.32, -T * 0.14, T * 0.10, T * 0.30);
};

window.PROP_DRAW["p45table"] = function (ctx, p, T) {
  ctx.fillStyle = "#8a6a48";
  ctx.fillRect(-T * 0.36, -T * 0.14, T * 0.72, T * 0.30);
  ctx.fillStyle = "rgba(0,0,0,0.20)";
  ctx.fillRect(-T * 0.36, T * 0.10, T * 0.72, T * 0.06);
  ctx.fillStyle = "#6e5438";
  ctx.fillRect(-T * 0.30, T * 0.16, T * 0.06, T * 0.16);
  ctx.fillRect(T * 0.24, T * 0.16, T * 0.06, T * 0.16);
  ctx.fillStyle = "#c8b070";
  ctx.fillRect(-T * 0.10, -T * 0.20, T * 0.16, T * 0.08);
};

window.PROP_DRAW["p45fridge"] = function (ctx, p, T) {
  ctx.fillStyle = "#dcd8d0";
  ctx.fillRect(-T * 0.20, -T * 0.42, T * 0.40, T * 0.84);
  ctx.strokeStyle = "#a8a49c"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-T * 0.20, -T * 0.14); ctx.lineTo(T * 0.20, -T * 0.14); ctx.stroke();
  ctx.fillStyle = "#8a8880";
  ctx.fillRect(T * 0.10, -T * 0.34, T * 0.05, T * 0.16);
  ctx.fillRect(T * 0.10, -T * 0.04, T * 0.05, T * 0.16);
};

window.PROP_DRAW["p45tv"] = function (ctx, p, T) {
  ctx.fillStyle = "#2a2e34";
  ctx.fillRect(-T * 0.32, -T * 0.34, T * 0.64, T * 0.42);
  ctx.fillStyle = "rgba(140,170,190,0.5)";
  ctx.fillRect(-T * 0.28, -T * 0.30, T * 0.56, T * 0.34);
  ctx.fillStyle = "#3a3e44";
  ctx.fillRect(-T * 0.08, T * 0.08, T * 0.16, T * 0.12);
  ctx.fillRect(-T * 0.22, T * 0.20, T * 0.44, T * 0.05);
};

window.PROP_DRAW["p45shelf"] = function (ctx, p, T) {
  ctx.fillStyle = "#8a8478";
  ctx.fillRect(-T * 0.40, -T * 0.40, T * 0.80, T * 0.80);
  ctx.fillStyle = "#6e6a60";
  for (let i = 0; i < 3; i++) ctx.fillRect(-T * 0.36, -T * 0.30 + i * T * 0.25, T * 0.72, T * 0.07);
  ctx.fillStyle = "rgba(190,170,130,0.8)";
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    if ((i + j + p.x) % 3 === 0) continue;
    ctx.fillRect(-T * 0.32 + j * T * 0.24, -T * 0.38 + i * T * 0.25, T * 0.14, T * 0.18);
  }
};

window.PROP_DRAW["p45mannequin"] = function (ctx, p, T) {
  ctx.fillStyle = "#d8d2c6";
  ctx.beginPath(); ctx.arc(0, -T * 0.28, T * 0.11, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(-T * 0.13, -T * 0.16, T * 0.26, T * 0.34);
  ctx.fillRect(-T * 0.09, T * 0.18, T * 0.07, T * 0.24);
  ctx.fillRect(T * 0.02, T * 0.18, T * 0.07, T * 0.24);
  ctx.fillStyle = "#b8b2a6";
  ctx.fillRect(-T * 0.19, -T * 0.12, T * 0.06, T * 0.24);
  ctx.fillRect(T * 0.13, -T * 0.12, T * 0.06, T * 0.24);
};

window.PROP_DRAW["p45counter"] = function (ctx, p, T) {
  ctx.fillStyle = "#7a6a56";
  ctx.fillRect(-T * 0.44, -T * 0.10, T * 0.88, T * 0.34);
  ctx.fillStyle = "#8e7c66";
  ctx.fillRect(-T * 0.44, -T * 0.16, T * 0.88, T * 0.08);
  ctx.fillStyle = "#c8c4bc";
  ctx.fillRect(-T * 0.24, -T * 0.24, T * 0.30, T * 0.10);
  ctx.fillStyle = "#5a5e64";
  ctx.fillRect(-T * 0.36, -T * 0.04, T * 0.16, T * 0.10);
};

window.PROP_DRAW["p45locker"] = function (ctx, p, T) {
  ctx.fillStyle = "#5a6a72";
  ctx.fillRect(-T * 0.34, -T * 0.42, T * 0.68, T * 0.84);
  ctx.strokeStyle = "#3e4a52"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, -T * 0.42); ctx.lineTo(0, T * 0.42); ctx.stroke();
  ctx.fillStyle = "#8a949a";
  ctx.fillRect(-T * 0.28, -T * 0.36, T * 0.06, T * 0.10);
  ctx.fillRect(T * 0.22, -T * 0.36, T * 0.06, T * 0.10);
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(-T * 0.28, -T * 0.12 + i * T * 0.14, T * 0.22, T * 0.03);
    ctx.fillRect(T * 0.06, -T * 0.12 + i * T * 0.14, T * 0.22, T * 0.03);
  }
};

window.PROP_DRAW["p45cab"] = function (ctx, p, T) {
  ctx.fillStyle = "#e0e4e6";
  ctx.fillRect(-T * 0.30, -T * 0.36, T * 0.60, T * 0.72);
  ctx.strokeStyle = "#a8b0b4"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-T * 0.30, 0); ctx.lineTo(T * 0.30, 0); ctx.stroke();
  ctx.fillStyle = "rgba(120,180,200,0.5)";
  ctx.fillRect(-T * 0.26, -T * 0.32, T * 0.52, T * 0.26);
  ctx.fillStyle = "#8a9296";
  ctx.fillRect(-T * 0.06, -T * 0.04, T * 0.12, T * 0.04);
  ctx.fillRect(-T * 0.06, T * 0.10, T * 0.12, T * 0.04);
};

window.PROP_DRAW["p45crate"] = function (ctx, p, T) {
  ctx.fillStyle = "#8a6a48";
  ctx.fillRect(-T * 0.34, -T * 0.26, T * 0.68, T * 0.54);
  ctx.strokeStyle = "#6a4e34"; ctx.lineWidth = Math.max(1, T * 0.04);
  ctx.beginPath();
  ctx.moveTo(-T * 0.34, -T * 0.26); ctx.lineTo(T * 0.34, T * 0.28);
  ctx.moveTo(T * 0.34, -T * 0.26); ctx.lineTo(-T * 0.34, T * 0.28);
  ctx.stroke();
  ctx.strokeRect(-T * 0.34, -T * 0.26, T * 0.68, T * 0.54);
};

window.PROP_DRAW["p45pew"] = function (ctx, p, T) {
  ctx.fillStyle = "#7a5a3a";
  ctx.fillRect(-T * 0.44, -T * 0.12, T * 0.88, T * 0.16);
  ctx.fillRect(-T * 0.44, -T * 0.30, T * 0.88, T * 0.14);
  ctx.fillStyle = "#6a4c30";
  ctx.fillRect(-T * 0.38, T * 0.04, T * 0.08, T * 0.20);
  ctx.fillRect(T * 0.30, T * 0.04, T * 0.08, T * 0.20);
};

window.PROP_DRAW["p45altar"] = function (ctx, p, T) {
  ctx.fillStyle = "#c8bca0";
  ctx.fillRect(-T * 0.30, -T * 0.06, T * 0.60, T * 0.30);
  ctx.fillStyle = "#d8ccb0";
  ctx.fillRect(-T * 0.34, -T * 0.14, T * 0.68, T * 0.10);
  ctx.fillStyle = "rgba(230,200,110,0.8)";
  ctx.fillRect(-T * 0.06, -T * 0.34, T * 0.12, T * 0.22);
};

window.PROP_DRAW["p45machine"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  ctx.fillStyle = "#5e6268";
  ctx.fillRect(-T * 0.36, -T * 0.34, T * 0.72, T * 0.68);
  ctx.fillStyle = "#464a50";
  ctx.fillRect(-T * 0.28, -T * 0.26, T * 0.56, T * 0.24);
  ctx.fillStyle = "rgba(120,200,150," + (0.4 + 0.3 * Math.sin(t * 3 + p.x)).toFixed(2) + ")";
  ctx.fillRect(-T * 0.24, -T * 0.22, T * 0.10, T * 0.06);
  ctx.fillStyle = "#8a8e94";
  ctx.fillRect(-T * 0.30, T * 0.10, T * 0.60, T * 0.10);
};

window.PROP_DRAW["p45vault"] = function (ctx, p, T) {
  ctx.fillStyle = "#4a4e56";
  ctx.beginPath(); ctx.arc(0, 0, T * 0.36, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#6a6e76";
  ctx.beginPath(); ctx.arc(0, 0, T * 0.28, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#9aa0a8"; ctx.lineWidth = Math.max(1.5, T * 0.05);
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2 + 0.4;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * T * 0.26, Math.sin(a) * T * 0.26); ctx.stroke();
  }
};

window.PROP_DRAW["p45board"] = function (ctx, p, T) {
  ctx.fillStyle = "#3a4a38";
  ctx.fillRect(-T * 0.42, -T * 0.24, T * 0.84, T * 0.44);
  ctx.fillStyle = "#5a4a34";
  ctx.fillRect(-T * 0.46, T * 0.18, T * 0.92, T * 0.08);
  ctx.strokeStyle = "rgba(220,220,210,0.6)"; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-T * 0.30, -T * 0.12); ctx.lineTo(T * 0.10, -T * 0.12);
  ctx.moveTo(-T * 0.30, T * 0.02); ctx.lineTo(T * 0.24, T * 0.02);
  ctx.stroke();
};

window.PROP_DRAW["p45elev"] = function (ctx, p, T) {
  ctx.fillStyle = "#5a5e66";
  ctx.fillRect(-T * 0.34, -T * 0.44, T * 0.68, T * 0.88);
  ctx.fillStyle = "#8a949c";
  ctx.fillRect(-T * 0.26, -T * 0.38, T * 0.24, T * 0.76);
  ctx.fillRect(T * 0.02, -T * 0.38, T * 0.24, T * 0.76);
  ctx.fillStyle = "rgba(240,220,140,0.7)";
  ctx.fillRect(-T * 0.16, -T * 0.48, T * 0.32, T * 0.08);
};

// 标本罐：B.R.C. 从别的层级弄回来的东西泡在里面
window.PROP_DRAW["p45tank"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  ctx.fillStyle = "#5a5e64";
  ctx.fillRect(-T * 0.26, T * 0.16, T * 0.52, T * 0.10);
  ctx.fillRect(-T * 0.26, -T * 0.44, T * 0.52, T * 0.10);
  ctx.fillStyle = "rgba(120,200,170,0.35)";
  ctx.fillRect(-T * 0.22, -T * 0.36, T * 0.44, T * 0.52);
  ctx.strokeStyle = "rgba(200,230,240,0.7)"; ctx.lineWidth = 1;
  ctx.strokeRect(-T * 0.22, -T * 0.36, T * 0.44, T * 0.52);
  // 泡在里面的东西：慢慢浮着
  const fl = Math.sin(t * 0.8 + p.x) * T * 0.06;
  ctx.fillStyle = "rgba(90,70,60,0.85)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.02 + fl, T * 0.13, T * 0.09, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "rgba(90,70,60,0.85)"; ctx.lineWidth = Math.max(1, T * 0.03);
  ctx.beginPath();
  ctx.moveTo(-T * 0.10, T * 0.06 + fl); ctx.lineTo(-T * 0.18, T * 0.16 + fl);
  ctx.moveTo(T * 0.10, T * 0.06 + fl); ctx.lineTo(T * 0.18, T * 0.16 + fl);
  ctx.stroke();
};

// 实验围栏：最低楼层关着从别的层级引进来的敌对实体
window.PROP_DRAW["p45pen"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  ctx.fillStyle = "#3a3e44";
  ctx.fillRect(-T * 0.44, -T * 0.36, T * 0.88, T * 0.72);
  ctx.fillStyle = "rgba(140,180,200,0.28)";
  ctx.fillRect(-T * 0.38, -T * 0.30, T * 0.76, T * 0.60);
  ctx.strokeStyle = "#6a6e76"; ctx.lineWidth = Math.max(1, T * 0.04);
  for (let i = 0; i < 5; i++) {
    const ox = -T * 0.38 + i * T * 0.19;
    ctx.beginPath(); ctx.moveTo(ox, -T * 0.30); ctx.lineTo(ox, T * 0.30); ctx.stroke();
  }
  // 里面那东西：一直在动
  const mx = Math.sin(t * 0.9 + p.x) * T * 0.16;
  ctx.fillStyle = "rgba(30,22,20,0.85)";
  ctx.beginPath(); ctx.ellipse(mx, T * 0.06, T * 0.16, T * 0.12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(200,60,40,0.9)";
  ctx.fillRect(mx - T * 0.09, T * 0.00, T * 0.03, T * 0.03);
  ctx.fillRect(mx + T * 0.06, T * 0.00, T * 0.03, T * 0.03);
};

// 防火梯：唯一在建筑之间安全穿梭的方法
window.PROP_DRAW["p45escape"] = function (ctx, p, T) {
  ctx.fillStyle = "#6a7278";
  // 两道斜的梯段 + 中间的平台
  for (let i = 0; i < 5; i++) {
    const oy = -T * 0.34 + i * T * 0.16;
    ctx.fillRect(-T * 0.30 + i * T * 0.06, oy, T * 0.60 - i * T * 0.12, T * 0.05);
  }
  ctx.strokeStyle = "#98a2aa"; ctx.lineWidth = Math.max(1.5, T * 0.05);
  ctx.beginPath(); ctx.moveTo(-T * 0.34, -T * 0.34); ctx.lineTo(-T * 0.34, T * 0.36); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(T * 0.34, -T * 0.34); ctx.lineTo(T * 0.34, T * 0.36); ctx.stroke();
  // 上下的箭头
  ctx.fillStyle = "rgba(220,180,80,0.85)";
  ctx.beginPath();
  ctx.moveTo(0, -T * 0.44); ctx.lineTo(T * 0.12, -T * 0.26); ctx.lineTo(-T * 0.12, -T * 0.26);
  ctx.closePath(); ctx.fill();
};

// B.R.C. 的牌子
window.PROP_DRAW["p45sign"] = function (ctx, p, T) {
  ctx.fillStyle = "#3a3630";
  ctx.fillRect(-T * 0.40, -T * 0.22, T * 0.80, T * 0.44);
  ctx.strokeStyle = "#c8a860"; ctx.lineWidth = Math.max(1.5, T * 0.04);
  ctx.strokeRect(-T * 0.36, -T * 0.18, T * 0.72, T * 0.36);
  ctx.fillStyle = "#e0c070";
  ctx.fillRect(-T * 0.28, -T * 0.10, T * 0.10, T * 0.20);
  ctx.fillRect(-T * 0.12, -T * 0.10, T * 0.08, T * 0.12);
  ctx.fillRect(T * 0.02, -T * 0.10, T * 0.10, T * 0.20);
  ctx.fillRect(T * 0.18, -T * 0.10, T * 0.08, T * 0.12);
};

// 帝国大厦的正门：装饰艺术那套铜门 + 门楣
window.PROP_DRAW["p45frontdoor"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  const pl = 0.55 + 0.25 * Math.sin(t * 1.4);
  ctx.fillStyle = "#2e2a24";
  ctx.fillRect(-T * 0.46, -T * 0.46, T * 0.92, T * 0.92);
  // 门楣
  ctx.fillStyle = "#8a7444";
  ctx.fillRect(-T * 0.50, -T * 0.54, T * 1.00, T * 0.14);
  ctx.fillStyle = "rgba(240,214,140," + (0.5 + 0.3 * pl).toFixed(2) + ")";
  ctx.fillRect(-T * 0.44, -T * 0.50, T * 0.88, T * 0.06);
  // 两扇铜门
  ctx.fillStyle = "#6a5836";
  ctx.fillRect(-T * 0.40, -T * 0.40, T * 0.38, T * 0.86);
  ctx.fillRect(T * 0.02, -T * 0.40, T * 0.38, T * 0.86);
  ctx.strokeStyle = "#c8a860"; ctx.lineWidth = Math.max(1, T * 0.035);
  for (let i = 0; i < 4; i++) {
    ctx.strokeRect(-T * 0.36 + i * T * 0.02, -T * 0.34 + i * T * 0.02, T * 0.30 - i * T * 0.04, T * 0.72 - i * T * 0.04);
    ctx.strokeRect(T * 0.06 + i * T * 0.02, -T * 0.34 + i * T * 0.02, T * 0.30 - i * T * 0.04, T * 0.72 - i * T * 0.04);
  }
  // 门缝里透出来的光
  ctx.fillStyle = "rgba(255,236,180," + (0.5 * pl).toFixed(2) + ")";
  ctx.fillRect(-T * 0.02, -T * 0.40, Math.max(1, T * 0.04), T * 0.86);
};
