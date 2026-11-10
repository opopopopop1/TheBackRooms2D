// ===========================================================
// Level 1 · 「商人之家」
//   B.N.T.G 在 Level 1 的据点，也是他们最大的据点。在下层，
//   是单独往地图边上扩出去的一块地 —— 不是把停车场改大，而是另一处地方。
//   现代化、比较大；不是一个摊位卖全部东西：不同物品在不同摊位，
//   同一件东西也可能在好几个摊位出现，各家要价差个 1~2 瓶杏仁水。
// ===========================================================
"use strict";

// 商品基准价（单位：瓶杏仁水）。coin 一列是 B.N.T.G 货币价，
// 普通商品按 1 瓶 = 5 枚折算；记忆汁是特例：20 瓶 或 5 枚。
window.MERCHANT_GOODS = {
  almond:       { base: 2,  coinMul: 5,  name: "杏仁水" },
  crowbar:      { base: 1,  coinMul: 5,  name: "铁撬棍" },
  meat:         { base: 3,  coinMul: 5,  name: "生肉" },
  torch:        { base: 2,  coinMul: 5,  name: "喷枪" },
  choc:         { base: 2,  coinMul: 5,  name: "巧克力棒" },
  soda:         { base: 2,  coinMul: 5,  name: "软饮料" },
  bntgwarp:     { base: 4,  coinMul: 5,  name: "B.N.T.G 迁跃浆果" },
  ksuit:        { base: 8,  coinMul: 5,  name: "K 版防化服" },
  memoryjuice:  { base: 20, coin: 5,     name: "记忆汁", onlyHere: true },
  // 胶卷：1 瓶杏仁水 = 5 枚货币，所以普通 1 瓶 / 5 枚、高级 3 瓶 / 15 枚
  film_normal:  { base: 1,  coinMul: 5,  name: "普通胶卷" },
  film_premium: { base: 3,  coinMul: 5,  name: "高级胶卷" },
  // 数码相机 20 瓶 = 100 枚；电池 2 瓶 = 10 枚（1 瓶 = 5 枚）
  digicam:      { base: 20, coin: 100,   name: "数码相机", onlyHere: true },
  battery:      { base: 2,  coin: 10,    name: "相机电池" },
};

// 八个摊位。同一件货在好几家出现，价格各有 1~2 瓶的上下浮动。
window.MERCHANT_STALLS = [
  { id: "A", name: "补给 · 一号",   goods: [["crowbar", 1], ["almond", 2], ["choc", 2], ["film_normal", 1]] },
  { id: "B", name: "补给 · 二号",   goods: [["crowbar", 2], ["meat", 3],   ["soda", 1], ["film_normal", 1]] },
  { id: "C", name: "工具铺",         goods: [["torch", 2],  ["crowbar", 1], ["ksuit", 8], ["film_premium", 3], ["digicam", 20], ["battery", 2]] },
  { id: "D", name: "饮品吧",         goods: [["soda", 2],   ["choc", 3],   ["memoryjuice", 20]] },
  { id: "E", name: "珍品柜",         goods: [["bntgwarp", 4], ["memoryjuice", 21], ["ksuit", 9], ["film_premium", 3], ["digicam", 20], ["battery", 2]] },
  { id: "F", name: "食品行",         goods: [["meat", 4],   ["choc", 2],   ["almond", 1], ["film_normal", 1]] },
  { id: "G", name: "杂货摊",         goods: [["torch", 3],  ["soda", 3],   ["crowbar", 2], ["memoryjuice", 19], ["film_normal", 1]] },
  { id: "H", name: "记忆专柜",       goods: [["memoryjuice", 22], ["bntgwarp", 5], ["almond", 3], ["film_premium", 3]] },
];

window.buildMerchantHome = function (map, size) {
  if (!map || !map.layers || map.layers.length < 2) return null;
  const f = 1;                          // 下层
  const grid = map.layers[f];
  const mw = 32, mh = 34;
  const mx = size - mw - 4;            // 120 - 32 - 4 = 84
  const my = 10;
  if (mx < 8 || my < 2 || mx + mw > size - 2 || my + mh > size - 2) return null;

  const inner = { x: mx + 1, y: my + 1, w: mw - 2, h: mh - 2 };
  const gateY0 = my + 15, gateY1 = my + 18;   // 西侧 4 格宽的入口

  // 这块地上原有的柱子 / 车位线 / 侧房家具 / 补给全部让位
  const inside = (x, y) => (x >= mx - 1 && x <= mx + mw && y >= my - 1 && y <= my + mh);
  for (const arr of [map.pillarsByFloor, map.parkingByFloor, map.laneByFloor, map.whiteFloor]) {
    if (!arr || !arr[f] || typeof arr[f].delete !== "function") continue;
    for (const k of [...arr[f]]) {
      const c = k.indexOf(","); if (c < 0) continue;
      if (inside(+k.slice(0, c), +k.slice(c + 1))) arr[f].delete(k);
    }
  }
  map.props = (map.props || []).filter((p) => !((p.floor | 0) === f && inside(p.x, p.y)));
  map.crates = (map.crates || []).filter((p) => !((p.floor | 0) === f && inside(p.x, p.y)));
  map.ground = (map.ground || []).filter((p) => !((p.floor | 0) === f && inside(p.x, p.y)));

  // 外圈是墙，只留西侧那个口子；里面整片铺成地板
  for (let x = mx; x < mx + mw; x++) {
    for (let y = my; y < my + mh; y++) {
      const edge = (x === mx || x === mx + mw - 1 || y === my || y === my + mh - 1);
      if (edge && !(x === mx && y >= gateY0 && y <= gateY1)) { grid[y][x] = 1; continue; }
      grid[y][x] = 0;
    }
  }
  // 从停车场接一条 4 格宽的通道到入口
  const gy = my + 16;
  for (let x = mx - 9; x <= mx; x++) {
    for (let dy = -1; dy <= 2; dy++) {
      const y = gy + dy;
      if (y > 0 && y < size - 1 && x > 0 && x < size - 1) grid[y][x] = 0;
    }
  }

  const cellSet = new Set();
  for (let y = inner.y; y < inner.y + inner.h; y++)
    for (let x = inner.x; x < inner.x + inner.w; x++) cellSet.add(x + "," + y);
  if (map.floors && map.floors[f]) {
    const s = new Set(map.floors[f].map((t) => t.x + "," + t.y));
    for (const k of cellSet) {
      if (s.has(k)) continue;
      const c = k.indexOf(",");
      map.floors[f].push({ x: +k.slice(0, c), y: +k.slice(c + 1) });
    }
  }

  // 摊位数随机（5~10 家），位置也随机打乱；卖哪些层级密钥、几把、什么价，
  // 全都是随机的 —— 同一把钥匙可能同时在几家出现，各家要价不一样。
  const K = window.LEVEL_KEY;
  const templates = K ? K.shuffle(window.MERCHANT_STALLS) : window.MERCHANT_STALLS.slice();
  const offers = K ? K.makeOffers(K.ri(2, 6)) : [];
  const layout = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
    layout.push([inner.x + 4 + c * 9, inner.y + 4 + r * 9]);
  }
  const spots = K ? K.shuffle(layout) : layout;
  const stallCount = K ? K.ri(5, 10) : 8;
  const stalls = [];
  for (let i = 0; i < stallCount; i++) {
    const at = spots[i % spots.length];
    if (!at) break;
    const st = templates[i % templates.length];
    const goods = st.goods.map((q) => {
      const def = window.MERCHANT_GOODS[q[0]] || { base: q[1], coinMul: 5 };
      return { key: q[0], price: q[1], coin: def.coin != null ? def.coin : q[1] * (def.coinMul || 5) };
    });
    if (K && offers.length) {
      const n = K.ri(0, Math.min(3, offers.length));
      for (const o of K.shuffle(offers).slice(0, n)) {
        // 每家重新掷一次价（仍在档案那一档的区间里），所以同名钥匙不同价
        const p2 = K.priceFor(o.lv) || o;
        goods.push({ key: o.key, price: p2.price, coin: p2.coin,
          tier: p2.tier, tierName: p2.tierName, isLevelKey: true, lv: o.lv });
      }
    }
    const p = {
      x: at[0], y: at[1], floor: f, type: "bntgstall",
      stall: { id: st.id, name: st.name + " · " + (i + 1) + " 号", goods: goods },
    };
    map.props.push(p);
    stalls.push(p);
  }

  // 现代化陈设：地灯、玻璃隔断、盆栽、货架
  const deco = (x, y, type) => { if (cellSet.has(x + "," + y)) map.props.push({ x, y, floor: f, type }); };
  for (let x = inner.x + 2; x < inner.x + inner.w - 1; x += 6) {
    deco(x, inner.y + 1, "malllight");
    deco(x, inner.y + inner.h - 2, "malllight");
  }
  for (let y = inner.y + 3; y < inner.y + inner.h - 2; y += 7) {
    deco(inner.x + 1, y, "mallplant");
    deco(inner.x + inner.w - 2, y, "mallplant");
  }
  deco(inner.x + 13, inner.y + 22, "mallshelf");
  deco(inner.x + 17, inner.y + 22, "mallshelf");

  // 外圈从地板改成墙之后，旧的可走列表里还留着那些坐标 —— 重算一遍，
  // 否则验证器 / 补给投放会把墙格当成能走的地方。
  if (typeof collectFloors === "function") map.floors[f] = collectFloors(grid, size);
  map.props.push({ x: mx - 2, y: gy, floor: f, type: "merchantsign" });
  map.merchantHome = { x: inner.x, y: inner.y, w: inner.w, h: inner.h,
    outer: { x: mx, y: my, w: mw, h: mh }, floor: f,
    entry: { x: mx - 2, y: gy }, stalls };
  return map.merchantHome;
};

// ===========================================================
// 物件绘制
// ===========================================================
window.PROP_DRAW = window.PROP_DRAW || {};

window.PROP_DRAW["bntgstall"] = function (ctx, p, T) {
  const st = p.stall || { name: "摊位", id: "?" };
  ctx.save();
  // 落地影
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.42, T * 0.52, T * 0.16, 0, 0, Math.PI * 2); ctx.fill();
  // 柜台
  ctx.fillStyle = "#e8edf1";
  ctx.fillRect(-T * 0.50, -T * 0.12, T * 1.00, T * 0.50);
  ctx.fillStyle = "#c3ccd3";
  ctx.fillRect(-T * 0.50, -T * 0.12, T * 1.00, T * 0.08);
  // 玻璃罩
  ctx.fillStyle = "rgba(150,205,225,0.28)";
  ctx.fillRect(-T * 0.46, -T * 0.52, T * 0.92, T * 0.42);
  ctx.strokeStyle = "rgba(230,248,255,0.75)"; ctx.lineWidth = Math.max(1, T * 0.02);
  ctx.strokeRect(-T * 0.46, -T * 0.52, T * 0.92, T * 0.42);
  // 罩里几件货
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = ["#e5c98a", "#8fc7b0", "#d9a6c8"][i];
    ctx.fillRect(-T * 0.34 + i * T * 0.28, -T * 0.38, T * 0.16, T * 0.20);
  }
  // 遮阳棚 / 招牌
  ctx.fillStyle = "#1f6f68";
  ctx.fillRect(-T * 0.54, -T * 0.76, T * 1.08, T * 0.24);
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = i % 2 ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";
    ctx.fillRect(-T * 0.54 + i * T * 0.18, -T * 0.76, T * 0.18, T * 0.24);
  }
  ctx.fillStyle = "#eafff6";
  ctx.font = "bold " + Math.max(8, Math.floor(T * 0.13)) + "px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(st.name, 0, -T * 0.585);
  ctx.textAlign = "left";
  ctx.restore();
};

window.PROP_DRAW["merchantsign"] = function (ctx, p, T) {
  ctx.fillStyle = "#59636b";
  ctx.fillRect(-T * 0.05, -T * 0.12, T * 0.10, T * 0.62);
  ctx.fillStyle = "#123f3b";
  ctx.fillRect(-T * 0.52, -T * 0.62, T * 1.04, T * 0.52);
  ctx.strokeStyle = "#8fd8c8"; ctx.lineWidth = Math.max(1, T * 0.025);
  ctx.strokeRect(-T * 0.52, -T * 0.62, T * 1.04, T * 0.52);
  ctx.fillStyle = "#eafff6";
  ctx.font = "bold " + Math.max(9, Math.floor(T * 0.15)) + "px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("商人之家", 0, -T * 0.38);
  ctx.font = " " + Math.max(7, Math.floor(T * 0.095)) + "px sans-serif";
  ctx.fillText("B.N.T.G · LEVEL 1", 0, -T * 0.20);
  ctx.textAlign = "left";
};

window.PROP_DRAW["malllight"] = function (ctx, p, T) {
  const gl = ctx.createRadialGradient(0, 0, 1, 0, 0, T * 0.55);
  gl.addColorStop(0, "rgba(225,248,255,0.32)");
  gl.addColorStop(1, "rgba(225,248,255,0)");
  ctx.fillStyle = gl;
  ctx.beginPath(); ctx.arc(0, 0, T * 0.55, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#c9d6dc";
  ctx.fillRect(-T * 0.09, -T * 0.09, T * 0.18, T * 0.18);
  ctx.fillStyle = "#f2fbff";
  ctx.fillRect(-T * 0.055, -T * 0.055, T * 0.11, T * 0.11);
};

window.PROP_DRAW["mallplant"] = function (ctx, p, T) {
  ctx.fillStyle = "#8d979d";
  ctx.fillRect(-T * 0.18, T * 0.02, T * 0.36, T * 0.30);
  ctx.fillStyle = "#b3bdc2";
  ctx.fillRect(-T * 0.18, T * 0.02, T * 0.36, T * 0.05);
  const greens = ["#3f7a4e", "#4b8b58", "#356b45"];
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i - 2) * 0.42;
    ctx.fillStyle = greens[i % 3];
    ctx.beginPath();
    ctx.ellipse(Math.cos(a) * T * 0.16, -T * 0.14 + Math.sin(a) * T * 0.10,
      T * 0.10, T * 0.22, a + Math.PI / 2, 0, Math.PI * 2);
    ctx.fill();
  }
};

window.PROP_DRAW["mallshelf"] = function (ctx, p, T) {
  ctx.fillStyle = "#d7dee3";
  ctx.fillRect(-T * 0.42, -T * 0.52, T * 0.84, T * 0.94);
  ctx.fillStyle = "#aeb9c0";
  for (let i = 0; i < 4; i++) ctx.fillRect(-T * 0.42, -T * 0.44 + i * T * 0.24, T * 0.84, T * 0.035);
  const cols = ["#e3c68a", "#8fc7b0", "#d9a6c8", "#a9bfe0"];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
    ctx.fillStyle = cols[(r + c + p.x) % cols.length];
    ctx.fillRect(-T * 0.34 + c * T * 0.18, -T * 0.40 + r * T * 0.24, T * 0.10, T * 0.14);
  }
};
