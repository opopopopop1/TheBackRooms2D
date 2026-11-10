// ===========================================================
// Level 485 —— 蒙黑天空
// 乳白天空的完美镜像：被遗弃的房子，到处是蜘蛛网和极其脆弱的地板，
// 一部分已被烧毁并长满霉菌。窗外的景色永远是虚假的午夜，且每扇都一样。
// 实体：猎犬 / 笑魇；专属实体"新娘"（不攻击，只是远远跟着你、低声哭泣）。
// 出口：未知（理论上有一个）
// ===========================================================
"use strict";

function generateBlackSkyMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const props = [];

  // 被遗弃的房子：房间 + 走廊，但比 484 更破碎（有些地方烧穿了）
  const rooms = [];
  for (let i = 0; i < 16; i++) {
    const w = randInt(6, 11), h = randInt(5, 9);
    const x = randInt(3, size - w - 4), y = randInt(3, size - h - 4);
    carveRoom(grid, size, x, y, w, h);
    rooms.push({ x, y, w, h });
  }
  for (let i = 1; i < rooms.length; i++) {
    const a = rooms[i], b = rooms[i - 1];
    carveCorridorW(grid, size, a.x + (a.w >> 1), a.y + (a.h >> 1), b.x + (b.w >> 1), b.y + (b.h >> 1), 1);
  }
  // 烧穿的区域：一圈焦黑（可走，但视觉上是烧毁的）
  const burnt = new Set();
  const bx = randInt(6, size - 12), by = randInt(6, size - 12);
  for (let y = by; y < by + 8; y++) for (let x = bx; x < bx + 8; x++) {
    if (x > 1 && y > 1 && x < size - 2 && y < size - 2) { grid[y][x] = 0; burnt.add(x + "," + y); }
  }

  const floors = collectFloors(grid, size);
  const start = floors[0] ? { x: floors[0].x, y: floors[0].y, floor: 0 } : { x: 4, y: 4, floor: 0 };

  const put = (x, y, type, extra) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return;
    if (grid[y][x] !== 0) return;
    props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  };
  for (let i = 0; i < 30; i++) { const f = floors[randInt(0, floors.length - 1)]; put(f.x, f.y, "web485"); }
  for (let i = 0; i < 14; i++) { const f = floors[randInt(0, floors.length - 1)]; put(f.x, f.y, "window485"); }
  for (let i = 0; i < 12; i++) { const f = floors[randInt(0, floors.length - 1)]; put(f.x, f.y, "mold485"); }
  // 新娘：只有一尊
  const bf = floors[Math.floor(floors.length / 2)] || start;
  put(bf.x, bf.y, "bride485");
  // 蒙黑天空里的红灯：整片黑里唯一的光源，照出一小圈血红色的地
  for (let i = 0; i < 16; i++) {
    const f = floors[randInt(0, floors.length - 1)];
    put(f.x, f.y, "redlamp485");
  }

  // 房子是破碎的，房间之间有时会互不连通 —— 先兜一次底，免得某个房间
  // 进去了出不来（也免得 EXIT 门被关在一块走不到的地方）。
  if (typeof ensureAllConnected === "function") ensureAllConnected(grid, size, start);

  // 唯一的出口：黑房子深处一扇标着 EXIT 的黑色铁门 —— 推开它到尘封的感叹号。
  // 以前通向 Level !，可 ! 的出口又回 Level 0，等于绕了一大圈把玩家丢回起点，
  // 而这条链本来该是 485 -> 感叹号 -> ! 这样一路走下去。
  placeExitDoor(grid, size, start, props, {
    to: "exclam", type: "blackirondoor", label: "EXIT", tint: "#1c1e22",
    tip: "黑房子深处一扇你以为不存在的铁门 —— 门上挂着 EXIT 的牌子",
  });
  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms,
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [], burnt,
  };
  map.spawnPts = [start];
  return map;
}

window.PROP_DRAW = window.PROP_DRAW || {};

// 蜘蛛网：从角落拉出的放射丝 + 几圈环丝
window.PROP_DRAW["web485"] = function (ctx, p, T) {
  const r = T * 0.42;
  ctx.strokeStyle = "rgba(220,220,215,0.42)"; ctx.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); ctx.stroke();
  }
  for (let ring = 1; ring <= 3; ring++) {
    const rr = r * ring / 3;
    ctx.beginPath();
    for (let i = 0; i <= 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const xx = Math.cos(a) * rr, yy = Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
    }
    ctx.stroke();
  }
};

// 窗户：外面是永远一模一样的午夜大地，远处山坡上有个眼睛发白光的身影
window.PROP_DRAW["window485"] = function (ctx, p, T) {
  const w = T * 0.70, h = T * 0.62;
  ctx.fillStyle = "#1a1a20"; ctx.fillRect(-w / 2, -h / 2, w, h);            // 窗外的夜
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, "#141428"); g.addColorStop(0.62, "#20203a"); g.addColorStop(1, "#0e0e18");
  ctx.fillStyle = g; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#2a2a40";                                                 // 远处的山坡
  ctx.beginPath(); ctx.moveTo(-w / 2, h * 0.10); ctx.lineTo(-w * 0.14, -h * 0.14);
  ctx.lineTo(w * 0.20, h * 0.10); ctx.lineTo(w / 2, h * 0.06); ctx.lineTo(w / 2, h / 2);
  ctx.lineTo(-w / 2, h / 2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#e8e8f0";                                                 // 那个发白光的身影
  ctx.beginPath(); ctx.arc(-w * 0.06, -h * 0.10, 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#6a6a5a"; ctx.lineWidth = 2.5; ctx.strokeRect(-w / 2, -h / 2, w, h);
  ctx.beginPath(); ctx.moveTo(0, -h / 2); ctx.lineTo(0, h / 2); ctx.stroke();  // 窗棂
  ctx.beginPath(); ctx.moveTo(-w / 2, 0); ctx.lineTo(w / 2, 0); ctx.stroke();
};

// 霉菌：一团团暗绿的斑块
window.PROP_DRAW["mold485"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(60,80,50,0.55)";
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.ellipse(-T * 0.16 + Math.random() * T * 0.32, -T * 0.12 + Math.random() * T * 0.24,
      T * 0.07 + Math.random() * T * 0.05, T * 0.05 + Math.random() * T * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();
  }
};

// 新娘：穿着婚纱的幽灵，不攻击你，只是远远跟着、低声哭泣
window.PROP_DRAW["bride485"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  const sway = Math.sin(t * 0.9) * T * 0.03;
  ctx.save();
  ctx.translate(sway, 0);
  ctx.fillStyle = "rgba(0,0,0,0.26)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.38, T * 0.20, T * 0.06, 0, 0, Math.PI * 2); ctx.fill();
  // 婚纱：下摆展开的长裙
  ctx.fillStyle = "rgba(226,226,232,0.80)";
  ctx.beginPath();
  ctx.moveTo(0, -T * 0.20);
  ctx.lineTo(-T * 0.24, T * 0.34); ctx.lineTo(T * 0.24, T * 0.34);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = "rgba(240,240,246,0.55)";
  ctx.beginPath(); ctx.ellipse(0, -T * 0.24, T * 0.09, T * 0.10, 0, 0, Math.PI * 2); ctx.fill();  // 上身
  ctx.fillStyle = "rgba(250,250,252,0.85)";
  ctx.beginPath(); ctx.arc(0, -T * 0.36, T * 0.075, 0, Math.PI * 2); ctx.fill();                   // 头
  ctx.fillStyle = "rgba(200,200,215,0.75)";                                                        // 头纱
  ctx.beginPath(); ctx.ellipse(0, -T * 0.34, T * 0.13, T * 0.14, 0, Math.PI, 0); ctx.fill();
  // 一直在哭：脸上一道泪痕
  ctx.strokeStyle = "rgba(180,200,230,0.70)"; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(-T * 0.03, -T * 0.34); ctx.lineTo(-T * 0.04, -T * 0.26); ctx.stroke();
  ctx.restore();
};


// -----------------------------------------------------------
// 唯一出口：一扇标着 EXIT 的黑色铁门 -> 尘封的感叹号
// 蒙黑天空里到处都是一样的黑房子，这扇门必须一眼就能认出来 ——
// 所以它是沉甸甸的黑铁：厚铁框带铆钉、门板上一道加强筋、
// 上方挂一块会自己发绿光的 EXIT 牌子，门缝底下还往这边渗冷白的灰光
// （门那边就是积灰的尘封的感叹号）。
// -----------------------------------------------------------
window.PROP_DRAW["blackirondoor"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  const w = T * 0.88, h = T * 1.02;

  // 门洞：门后面是黑的
  ctx.fillStyle = "#050506";
  ctx.fillRect(-w / 2 - 2, -h / 2 - 2, w + 4, h + 2);

  // 厚铁框
  ctx.fillStyle = "#2b2f35";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#3d434b";
  ctx.fillRect(-w / 2, -h / 2, w, Math.max(2, T * 0.07));          // 上沿高光
  ctx.fillStyle = "#171a1e";
  ctx.fillRect(-w / 2, h / 2 - Math.max(2, T * 0.07), w, Math.max(2, T * 0.07));

  // 门板：近黑的铁，带一点竖向拉丝
  ctx.fillStyle = "#1c1e22";
  ctx.fillRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8);
  ctx.fillStyle = "rgba(255,255,255,0.045)";
  for (let i = 0; i < 5; i++) {
    const xx = -w / 2 + 7 + i * ((w - 14) / 5);
    ctx.fillRect(xx, -h / 2 + 5, 1.4, h - 10);
  }
  // 左侧冷光 / 右侧压暗 —— 铁的体积感
  ctx.fillStyle = "rgba(150,170,195,0.14)";
  ctx.fillRect(-w / 2 + 4, -h / 2 + 4, 3, h - 8);
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(w / 2 - 7, -h / 2 + 4, 3, h - 8);

  // 中间一道横向加强筋 + 上下两道压条
  ctx.fillStyle = "#33383f";
  ctx.fillRect(-w / 2 + 4, -T * 0.05, w - 8, Math.max(2, T * 0.09));
  ctx.fillStyle = "#0f1114";
  ctx.fillRect(-w / 2 + 4, -T * 0.05 + Math.max(2, T * 0.09), w - 8, 1.5);
  ctx.fillStyle = "#2a2e34";
  ctx.fillRect(-w / 2 + 5, -h / 2 + 9, w - 10, 2);
  ctx.fillRect(-w / 2 + 5, h / 2 - 13, w - 10, 2);

  // 四角铆钉
  ctx.fillStyle = "#4a5058";
  const rv = Math.max(1.3, T * 0.045);
  for (const [rx, ry] of [[-w / 2 + 7, -h / 2 + 7], [w / 2 - 7, -h / 2 + 7],
                          [-w / 2 + 7, h / 2 - 9], [w / 2 - 7, h / 2 - 9]]) {
    ctx.beginPath(); ctx.arc(rx, ry, rv, 0, Math.PI * 2); ctx.fill();
  }

  // 沉重的把手：一根横杆，不是圆球
  ctx.fillStyle = "#5a626c";
  ctx.fillRect(w / 2 - 13, -T * 0.20, 3, T * 0.16);
  ctx.fillRect(w / 2 - 13, -T * 0.02, 3, T * 0.16);
  ctx.fillStyle = "#767f8a";
  ctx.fillRect(w / 2 - 14, -T * 0.08, 5, T * 0.10);

  // 门缝底下渗出来的光 —— 门那边是尘封的感叹号（积灰的金属，泛冷白的灰光）。
  // 以前这里是红光（暗示 Level !），跟着出口一起改成冷灰白。
  const pulse = 0.45 + 0.35 * Math.sin(t * 3.1);
  ctx.fillStyle = "rgba(196,200,206," + (0.30 + pulse * 0.35).toFixed(3) + ")";
  ctx.fillRect(-w / 2 + 5, h / 2 - 7, w - 10, 2.5);

  // EXIT 牌子：挂在门上方，自己发绿光（黑房子里唯一看清的东西）
  const pw = w * 0.66, ph = Math.max(8, T * 0.24);
  const py = -h / 2 - ph - Math.max(2, T * 0.10);
  // 挂杆
  ctx.fillStyle = "#3a3f46";
  ctx.fillRect(-1, py + ph, 2, Math.max(2, T * 0.10));
  // 牌底
  ctx.fillStyle = "#0d2a16";
  ctx.fillRect(-pw / 2, py, pw, ph);
  ctx.strokeStyle = "#1d5b2c"; ctx.lineWidth = 1;
  ctx.strokeRect(-pw / 2, py, pw, ph);
  // 绿光（会呼吸）
  const glow = 0.55 + 0.45 * Math.sin(t * 2.2 + 1.1);
  ctx.fillStyle = "rgba(70,235,120," + (0.10 + glow * 0.14).toFixed(3) + ")";
  ctx.fillRect(-pw / 2, py, pw, ph);
  const gr = ctx.createRadialGradient(0, py + ph / 2, 1, 0, py + ph / 2, T * 0.75);
  gr.addColorStop(0, "rgba(60,230,110," + (0.16 + glow * 0.16).toFixed(3) + ")");
  gr.addColorStop(1, "rgba(40,200,90,0)");
  ctx.fillStyle = gr;
  ctx.beginPath(); ctx.arc(0, py + ph / 2, T * 0.75, 0, Math.PI * 2); ctx.fill();
  // EXIT 字样
  ctx.fillStyle = "#8dfcb4";
  ctx.font = "bold " + Math.max(7, Math.round(ph * 0.74)) + "px ui-monospace, monospace";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("EXIT", 0, py + ph / 2 + 0.5);
  ctx.textAlign = "start"; ctx.textBaseline = "alphabetic";
};

// 蒙黑天空里的红灯：血红色的一小圈光，照出地面 —— 也是这一层唯一的光
window.PROP_DRAW["redlamp485"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  const ph = Math.sin(t * 2.6 + (p.x || 0) * 1.7 + (p.y || 0) * 0.9);
  const on = ph > -0.35;
  // 灯杆 + 灯罩
  ctx.fillStyle = "#2a2622";
  ctx.fillRect(-T * 0.04, -T * 0.30, T * 0.08, T * 0.34);
  ctx.fillStyle = "#5a1c16";
  ctx.beginPath(); ctx.ellipse(0, -T * 0.28, T * 0.15, T * 0.10, 0, Math.PI, Math.PI * 2); ctx.fill();
  ctx.fillStyle = on ? "#e03828" : "#5e2018";
  ctx.beginPath(); ctx.arc(0, -T * 0.24, T * 0.075, 0, Math.PI * 2); ctx.fill();
  if (on) {
    const gr = ctx.createRadialGradient(0, -T * 0.20, 1, 0, -T * 0.20, T * 0.80);
    gr.addColorStop(0, "rgba(220,50,36,0.34)");
    gr.addColorStop(1, "rgba(180,30,20,0)");
    ctx.fillStyle = gr;
    ctx.beginPath(); ctx.arc(0, -T * 0.20, T * 0.80, 0, Math.PI * 2); ctx.fill();
  }
};
