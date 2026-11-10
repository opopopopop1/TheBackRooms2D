// ===========================================================
// 1.3.2 批次 A：Level 23 石化花园 / Level 32 骷髅女皇之森
//   两个都是「树比人多」的层级，但一个亮着生物光、一个只有新月。
//   所有地面/墙都走 __B3_FLOOR / __B3_WALL 外部注册表，绝不落到管道风兜底。
// ===========================================================
"use strict";

(function () {
  const R = (k, v) => {
    if (typeof regTile === "function") regTile(k, v);
    else (window.__NEWTILE_EXTRA = window.__NEWTILE_EXTRA || {})[k] = v;
  };
  R("garden23", ["#5b6340", "#4e5738", "#334a2c"]);
  R("boneforest32", ["#454a52", "#3d424a", "#2d333d"]);
})();

window.__B3_FLOOR = window.__B3_FLOOR || {};
window.__B3_WALL = window.__B3_WALL || {};
window.PROP_DRAW = window.PROP_DRAW || {};
window.__LEVEL_TICK = window.__LEVEL_TICK || {};

function b3Hash(x, y) {
  let h = ((x | 0) * 374761393 + (y | 0) * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) | 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function b3Rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function b3Spot(floors, pred) {
  const c = floors.filter(pred);
  return c.length ? c[Math.floor(Math.random() * c.length)] : floors[0];
}
// 生成完地图后，把从出生点走不到的地板重新长成墙/深渊。
// 圆环人行道、房屋四壁、被风打断的阶梯都可能围出孤岛 —— 孤岛上的出口
// 会让验证器判成「走不到」，玩家实际也永远摸不到，不如直接不生成。
window.__B3_prune = function (grid, size, sx, sy) {
  if (!grid[sy] || grid[sy][sx] !== 0) return 0;
  const vis = new Uint8Array(size * size);
  const q = [sy * size + sx]; vis[sy * size + sx] = 1;
  while (q.length) {
    const i = q.pop(), x = i % size, y = (i / size) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue;
      const j = ny * size + nx;
      if (vis[j] || grid[ny][nx] !== 0) continue;
      vis[j] = 1; q.push(j);
    }
  }
  let cut = 0;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    if (grid[y][x] === 0 && !vis[y * size + x]) { grid[y][x] = 1; cut++; }
  }
  return cut;
};

// ===================== Level 23 · 石化花园 =====================
function generateGarden23Map(level) {
  const size = 116, grid = makeGrid(size);
  // 四座大型光穴，用宽三格的隧道两两相连 —— 是「地下森林」不是一整片空地
  const halls = [[6, 6, 46, 44], [64, 6, 46, 44], [6, 62, 46, 48], [64, 62, 46, 48]];
  for (const [x, y, w, h] of halls) carveRoom(grid, size, x, y, w, h);
  const tunnel = (x0, y0, x1, y1) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) grid[y][x] = 0;
  };
  tunnel(52, 25, 64, 29);   // A - B
  tunnel(25, 50, 29, 62);   // A - C
  tunnel(85, 50, 89, 62);   // B - D
  tunnel(52, 84, 64, 88);   // C - D
  // 光穴里的树：稀疏立柱，间隔够大，不会把通路切断
  for (let y = 4; y < size - 4; y++) for (let x = 4; x < size - 4; x++) {
    if (grid[y][x] !== 0) continue;
    if ((x % 9 === 3 && y % 7 === 2) || (x % 13 === 8 && y % 11 === 6)) grid[y][x] = 1;
  }
  const floors = collectFloors(grid, size);
  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [[]],
    start: { x: 28, y: 28, floor: 0 },
    exit: null, doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props: [], crates: [], ground: [], spawnPts: [{ x: 28, y: 28, floor: 0 }],
    wander: null, g23halls: halls,
  };
  makeDoorsMap(map);
  const P = (x, y, type, extra) => map.props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));

  // 水之心：核心的水库，唯一的稳定出口（M.E.G 基苗守着它）
  // toLevel 只是给验证器/开发者面板看一个默认去向；真正按 E 时由 iKind 钩子随机切 7 / 43
  P(87, 84, "g23heart", { iKind: "g23heart", toLevel: 7, tip: "水之心 —— 巨人根系缠着一整座水库" });
  // M.E.G「基苗」前哨：探索 / 人类学 / 研究基地，约 30 人，配杏仁水喷射枪
  P(16, 16, "g23base", { iKind: "g23base" });
  // 四座古老遗迹：灯塔 / 宏伟之球 / 角斗场 / 帕特农
  P(18, 38, "g23ruin", { iKind: "g23ruin", name: "亚历山大灯塔（金字塔形）" });
  P(76, 20, "g23ruin", { iKind: "g23ruin", name: "宏伟之球（球形的大金字塔）" });
  P(20, 74, "g23ruin", { iKind: "g23ruin", name: "方形的大角斗场" });
  P(78, 70, "g23ruin", { iKind: "g23ruin", name: "三角形的帕特农神庙" });
  // 园丁之歉的牌匾：按 E 念出那句禁忌的话，会唤醒掩没哨兵
  P(38, 18, "g23plaque", { iKind: "g23plaque" });
  // 深绿巨人：小行星核心长出的巨树，不得干涉
  P(44, 96, "g23giant", { iKind: "g23giant" });
  P(70, 96, "g23giant", { iKind: "g23giant" });
  // 实体：双尾狐 / 猎犬 / 肢团 / 笑魇 / 尸鼠 / 死亡飞蛾 / 受眷鸟 / 牧蛇
  const beasts = ["双尾狐", "猎犬", "肢团", "笑魇", "尸鼠", "雌雄死亡飞蛾", "受眷鸟", "牧蛇"];
  for (let i = 0; i < beasts.length; i++) {
    const s = b3Spot(floors, f => b3Hash(f.x + i * 17, f.y + 3) > 0.35);
    P(s.x, s.y, "g23beast", { iKind: "g23beast", name: beasts[i], idx: i });
  }
  // 光穴里的生物光：园丁之歉（不停低语「对不起…」）、发光真菌、灌木、陶器文物
  for (let i = 0; i < 46; i++) {
    const s = floors[Math.floor(Math.random() * floors.length)];
    P(s.x, s.y, i % 3 === 0 ? "g23firefly" : (i % 3 === 1 ? "g23fungus" : "g23shrub"));
  }
  for (let i = 0; i < 16; i++) {
    const s = floors[Math.floor(Math.random() * floors.length)];
    P(s.x, s.y, "g23pottery");
  }
  return map;
}
window.generateGarden23Map = generateGarden23Map;

window.__B3_FLOOR["garden23"] = function (ctx, px, py, S, map, tx, ty) {
  const r = b3Hash(tx, ty);
  // 光穴的地面：潮湿凉爽的腐殖土，比地表森林亮
  ctx.fillStyle = r < 0.5 ? "#5b6340" : "#525a3a";
  ctx.fillRect(px, py, S, S);
  ctx.fillStyle = "rgba(180,205,150,.10)";
  ctx.fillRect(px + S * 0.12, py + S * 0.18, S * 0.7, S * 0.06);
  if (r > 0.68) {
    ctx.fillStyle = "rgba(40,60,34,.45)";
    ctx.beginPath(); ctx.ellipse(px + S * (0.3 + r * 0.3), py + S * 0.68, S * 0.22, S * 0.10, 0, 0, Math.PI * 2); ctx.fill();
  }
  return true;
};
window.__B3_WALL["garden23"] = function (ctx, px, py, S, map, tx, ty) {
  const r = b3Hash(tx + 5, ty + 9);
  // 深绿巨人的树干 / 缠结的树根墙 —— 不是黑块
  ctx.fillStyle = "#334a2c"; ctx.fillRect(px, py, S, S);
  ctx.fillStyle = r < 0.5 ? "#5a4028" : "#63472d";
  ctx.fillRect(px + S * 0.20, py, S * 0.60, S);
  ctx.fillStyle = "rgba(0,0,0,.22)"; ctx.fillRect(px + S * 0.46, py, S * 0.09, S);
  ctx.fillStyle = "rgba(120,165,90,.30)";
  ctx.beginPath(); ctx.arc(px + S * 0.5, py + S * 0.26, S * 0.42, 0, Math.PI * 2); ctx.fill();
  return true;
};

// 整屏：一颗方位永不改变的恒星 + 光穴里从各个方向来的恒久阳光
window.__B2_OVL["23"] = function (ctx, g) {
  const cw = ctx.canvas.width, ch = ctx.canvas.height;
  ctx.save();
  try { ctx.setTransform(1, 0, 0, 1, 0, 0); } catch (e) { /* 忽略 */ }
  ctx.fillStyle = "rgba(226,214,150,.055)"; ctx.fillRect(0, 0, cw, ch);
  ctx.fillStyle = "rgba(255,240,190,.16)";
  ctx.beginPath(); ctx.arc(cw * 0.78, ch * 0.18, Math.min(cw, ch) * 0.035, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(255,246,214,.09)";
  ctx.beginPath(); ctx.arc(cw * 0.78, ch * 0.18, Math.min(cw, ch) * 0.09, 0, Math.PI * 2); ctx.fill();
  if (g.g23scream > 0) {
    const a = Math.min(0.30, g.g23scream / 20);
    ctx.fillStyle = "rgba(190,40,34," + a.toFixed(3) + ")"; ctx.fillRect(0, 0, cw, ch);
  }
  ctx.restore();
};

window.__LEVEL_TICK["23"] = function (g, dt) {
  dt = dt || 0.016;
  window.__B2_enter(g, "23", () => { g.g23scream = 0; });
  if (g.g23scream > 0) {
    g.g23scream -= dt;
    // 生锈电锯锯木头似的尖叫 —— 听力范围内哨兵越多，声音越能刺破耳膜
    g.sanity = Math.max(0, (g.sanity || 0) - 5.5 * dt);
    g.hp = Math.max(0, (g.hp || 100) - 3.2 * dt);
  }
};

// ===================== Level 32 · 骷髅女皇之森 =====================
function generateBone32Map(level) {
  const size = 96, grid = makeGrid(size);
  carveRoom(grid, size, 4, 4, size - 8, size - 8);
  // 稀疏的骷髅树：间隔足够，绝不把路封死
  for (let y = 6; y < size - 6; y++) for (let x = 6; x < size - 6; x++) {
    if ((x % 8 === 2 && y % 6 === 3) || (x % 11 === 7 && y % 9 === 5)) grid[y][x] = 1;
  }
  // 女皇的空庭：正中一片没有树的开阔地
  for (let y = 38; y <= 58; y++) for (let x = 38; x <= 58; x++) grid[y][x] = 0;
  const floors = collectFloors(grid, size);
  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [[]],
    start: { x: 12, y: 80, floor: 0 },
    exit: null, doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props: [], crates: [], ground: [], spawnPts: [{ x: 12, y: 80, floor: 0 }],
    wander: null, b32cx: 48, b32cy: 48,
  };
  makeDoorsMap(map);
  const P = (x, y, type, extra) => map.props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));

  // 贝丽：橙裙女性，不说话，只引你跟上去
  P(20, 66, "b32belle", { iKind: "b32belle" });
  // 骷髅女皇：中央空庭。左右两块牌子分别代表「恭敬」和「不敬」
  P(48, 48, "b32queen", { iKind: "b32queen" });
  P(44, 54, "b32respect", { toLevel: 39, tip: "向她微微低头 —— 她或许会放你走" });
  P(52, 54, "b32insult", { iKind: "b32insult" });
  // 挂满树的骷髅：会讲生前的事，也会讲快应验的预言
  for (let i = 0; i < 44; i++) {
    const s = floors[Math.floor(Math.random() * floors.length)];
    P(s.x, s.y, "b32skull", { iKind: "b32skull", idx: i });
  }
  for (let i = 0; i < 30; i++) {
    const s = floors[Math.floor(Math.random() * floors.length)];
    P(s.x, s.y, "b32bone");
  }
  return map;
}
window.generateBone32Map = generateBone32Map;

window.__B3_FLOOR["boneforest32"] = function (ctx, px, py, S, map, tx, ty) {
  const r = b3Hash(tx, ty);
  // 冷灰的林地，被新月照出一点轮廓 —— 暗但不是黑
  ctx.fillStyle = r < 0.5 ? "#454a52" : "#414650";
  ctx.fillRect(px, py, S, S);
  ctx.fillStyle = "rgba(190,205,225,.07)"; ctx.fillRect(px, py, S, S * 0.12);
  if (r > 0.7) { ctx.fillStyle = "rgba(20,24,30,.4)"; ctx.fillRect(px + S * 0.2, py + S * 0.6, S * 0.42, S * 0.06); }
  return true;
};
window.__B3_WALL["boneforest32"] = function (ctx, px, py, S, map, tx, ty) {
  const r = b3Hash(tx + 3, ty + 11);
  ctx.fillStyle = "#2d333d"; ctx.fillRect(px, py, S, S);
  ctx.fillStyle = "#565b60"; ctx.fillRect(px + S * 0.32, py, S * 0.36, S);
  ctx.strokeStyle = "#6c7176"; ctx.lineWidth = Math.max(1.5, S * 0.045);
  ctx.beginPath();
  ctx.moveTo(px + S * 0.5, py + S * 0.5); ctx.lineTo(px + S * (r < 0.5 ? 0.12 : 0.88), py + S * 0.12);
  ctx.moveTo(px + S * 0.5, py + S * 0.4); ctx.lineTo(px + S * (r < 0.5 ? 0.86 : 0.14), py + S * 0.22);
  ctx.stroke();
  // 骨白的骷髅在月光下反光
  if ((tx * 7 + ty * 3) % 5 === 0) {
    ctx.fillStyle = "rgba(226,230,222,.72)";
    ctx.beginPath(); ctx.arc(px + S * 0.5, py + S * 0.30, S * 0.11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#2d333d";
    ctx.fillRect(px + S * 0.44, py + S * 0.28, S * 0.035, S * 0.035);
    ctx.fillRect(px + S * 0.53, py + S * 0.28, S * 0.035, S * 0.035);
  }
  return true;
};

window.__B2_OVL["32"] = function (ctx, g) {
  const cw = ctx.canvas.width, ch = ctx.canvas.height;
  ctx.save();
  try { ctx.setTransform(1, 0, 0, 1, 0, 0); } catch (e) { /* 忽略 */ }
  ctx.fillStyle = "rgba(24,30,48,.20)"; ctx.fillRect(0, 0, cw, ch);
  // 一弯没有星的新月
  ctx.fillStyle = "rgba(225,232,240,.20)";
  ctx.beginPath(); ctx.arc(cw * 0.82, ch * 0.16, Math.min(cw, ch) * 0.055, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(24,30,48,.92)";
  ctx.beginPath(); ctx.arc(cw * 0.845, ch * 0.145, Math.min(cw, ch) * 0.052, 0, Math.PI * 2); ctx.fill();
  if (g.b32doom > 0) {
    ctx.fillStyle = "rgba(120,20,26," + Math.min(0.5, g.b32doom / 6).toFixed(3) + ")";
    ctx.fillRect(0, 0, cw, ch);
  }
  ctx.restore();
};

window.__LEVEL_TICK["32"] = function (g, dt) {
  dt = dt || 0.016;
  window.__B2_enter(g, "32", () => { g.b32doom = 0; g.b32met = false; });
  if (g.b32doom > 0) {
    g.b32doom -= dt;
    g.hp = Math.max(0, (g.hp || 100) - 22 * dt);
  }
  const d = Math.hypot(g.player.x / 40 - 48, g.player.y / 40 - 48);
  if (d < 9 && !g.b32met) {
    g.b32met = true;
    window.__toast("她从树影里站起来，比树还高 —— 破旧的黑裙拖在地上。别出声，先想好怎么面对她");
  }
};

// ===================== 交互 =====================
window.__B2_hint([
  "g23heart", "g23base", "g23ruin", "g23plaque", "g23giant", "g23beast", "g23firefly",
  "b32belle", "b32queen", "b32insult", "b32skull",
], function (n, g) {
  switch (n.kind) {
    case "g23heart": return "水之心 —— 巨人的根缠着一整座水库，水正顺着叶子往上走 · 按 E 踏入（离开这里）";
    case "g23base": return "M.E.G「基苗」基地 —— 约 30 名成员，配有杏仁水喷射枪 · 按 E 补给";
    case "g23ruin": return (n.p.name || "古老遗迹") + " —— 苔藓和真菌盖满了它，墙上有一行褪色的拉丁文 · 按 E 端详";
    case "g23plaque": return "一块牌匾，刻着一行拉丁译文 · 按 E 念出「这只是时间问题。」（强烈建议别念）";
    case "g23giant": return "深绿巨人 —— 从小行星核心长出来，最高约 3.2 公里 · 不得干涉 · 按 E 仰望";
    case "g23beast": return (n.p.name || "实体") + " 从光穴的树影里看着你 · 按 E 观察";
    case "g23firefly": return "一只园丁之歉，发着光，不停低语「对不起…」 · 按 E 听";
    case "b32belle": return "贝丽 —— 维多利亚时代的橙色长裙，一言不发，只回头看你一眼 · 按 E 跟上";
    case "b32queen": return "骷髅女皇 —— 她几乎完全控制着这片林子 · 左边低头行礼，右边那句是万万说不得的";
    case "b32insult": return "（对她说一句不敬的话）她会命令周围的树把你撕成碎片 · 按 E 开口";
    case "b32skull": return "树上悬着的骷髅在风里轻轻作响 —— 像在说话 · 按 E 听";
  }
  return null;
});

window.__B2_act([
  "g23heart", "g23base", "g23ruin", "g23plaque", "g23giant", "g23beast", "g23firefly",
  "b32belle", "b32queen", "b32insult", "b32skull",
], function (n, g) {
  const inv = g.inv || (g.inv = {});
  switch (n.kind) {
    case "g23heart": {
      // 进入核心的水库后，随机切入 Level 7 或 Level 43 的海洋中间。
      // 档案还写了「有机会切入 Level 43 的一个展品中」—— 43 这次也做了。
      const to = Math.random() < 0.5 ? 7 : 43;
      window.__toast("水没过头顶，却没有呛到 —— 再睁眼，四面都是水");
      try { window.__goToLevel(to); } catch (e) { /* 忽略 */ }
      return true;
    }
    case "g23base": {
      inv.almond = (inv.almond || 0) + 2;
      g.sanity = Math.min(100, (g.sanity || 0) + 12);
      window.__toast("基苗的人递来 2 瓶杏仁水 —— 「这边的水源稳定，食物不多，将就一下」");
      return true;
    }
    case "g23ruin": {
      const lines = [
        "我们将吉萨宏伟之球献给伟大的园丁 / 祈愿我们所铸之大错得以宽恕",
        "我们的紫色眼眸早已化为绿色 / 我们已开始回归大地，饱受遗忘，杂草丛生",
        "墙上这行拉丁文写得很急，末尾被真菌盖住了 —— 没有公元 1000 年后的造物",
        "一件陶器，做工明显比前厅的同类差一截 —— 像是照着记忆赶出来的",
      ];
      window.__toast(lines[Math.floor(Math.random() * lines.length)]);
      return true;
    }
    case "g23plaque": {
      g.g23scream = 12;
      window.__toast("掩没哨兵醒了 —— 木头与树皮里传出尖叫，像生锈的电锯在锯木头");
      return true;
    }
    case "g23giant":
      window.__toast("抬头看不到顶。它把水蒸气分给别的树，也替整颗小行星撑着天顶");
      return true;
    case "g23beast":
      window.__toast((n.p.name || "它") + " 没有靠近 —— 光穴里大多数实体都活在地表之下");
      return true;
    case "g23firefly":
      window.__toast("「对不起…对不起…」它换了个颜色，又飘远了一点");
      return true;
    case "b32belle": {
      // 跟上她、直到她离开视野 —— 再看见时已经是骷髅女皇
      try { g.player.x = 46 * 40; g.player.y = 58 * 40; } catch (e) { /* 忽略 */ }
      window.__toast("你跟了很久。橙裙一闪，消失在树后 —— 再抬头，站在空庭中央的不是她了");
      return true;
    }
    case "b32queen":
      window.__toast("她不说话，只是等着。左边的路是低头，右边那句会要命");
      return true;
    case "b32insult": {
      g.b32doom = 4;
      window.__toast("话音没落，最近的树就动了 —— 她连眼睛都没抬");
      return true;
    }
    case "b32skull": {
      const lines = [
        "「我以前住在有海的地方。」", "「别往北边走，第三天会下雨。」",
        "「她说，放走一个，就少一个。」", "风穿过空眼窟，听不清后半句了",
        "「……我们一直挂在这儿，看着你们一个个走进来。」",
      ];
      window.__toast(lines[Math.floor(Math.random() * lines.length)]);
      return true;
    }
  }
  return false;
});

// ===================== 物件外观 =====================
const B3A = window.PROP_DRAW;
B3A["g23heart"] = function (ctx, p, T) {
  ctx.fillStyle = "#26484a";
  ctx.beginPath(); ctx.ellipse(0, 0, T * 0.46, T * 0.38, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(150,215,220,.55)";
  ctx.beginPath(); ctx.ellipse(-T * 0.08, -T * 0.08, T * 0.30, T * 0.20, -0.2, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#4d6b3a"; ctx.lineWidth = Math.max(2, T * 0.07);
  for (let i = 0; i < 6; i++) {
    const a = i * Math.PI / 3;
    ctx.beginPath(); ctx.moveTo(Math.cos(a) * T * 0.46, Math.sin(a) * T * 0.38);
    ctx.lineTo(Math.cos(a) * T * 0.20, Math.sin(a) * T * 0.16); ctx.stroke();
  }
};
B3A["g23base"] = function (ctx, p, T) {
  ctx.fillStyle = "#d8d2ba"; ctx.fillRect(-T * 0.42, -T * 0.32, T * 0.84, T * 0.64);
  ctx.fillStyle = "#3f6a4a"; ctx.fillRect(-T * 0.42, -T * 0.32, T * 0.84, T * 0.14);
  ctx.fillStyle = "#e8e2c8"; ctx.font = "bold " + (T * 0.17) + "px sans-serif";
  ctx.textAlign = "center"; ctx.fillText("M.E.G", 0, T * 0.16); ctx.textAlign = "left";
  ctx.strokeStyle = "#8aa878"; ctx.lineWidth = 2;
  ctx.strokeRect(-T * 0.42, -T * 0.32, T * 0.84, T * 0.64);
};
B3A["g23ruin"] = function (ctx, p, T) {
  ctx.fillStyle = "#8b8a76";
  ctx.beginPath(); ctx.moveTo(-T * 0.42, T * 0.36); ctx.lineTo(0, -T * 0.34); ctx.lineTo(T * 0.42, T * 0.36); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#6f705e"; ctx.fillRect(-T * 0.42, T * 0.30, T * 0.84, T * 0.10);
  ctx.fillStyle = "#4d6b3a";
  for (let i = 0; i < 5; i++) ctx.fillRect(-T * 0.36 + i * T * 0.17, -T * 0.08, T * 0.08, T * 0.06);
};
B3A["g23plaque"] = function (ctx, p, T) {
  ctx.fillStyle = "#6a5638"; ctx.fillRect(-T * 0.40, -T * 0.30, T * 0.80, T * 0.60);
  ctx.strokeStyle = "#c8b787"; ctx.lineWidth = 2; ctx.strokeRect(-T * 0.36, -T * 0.26, T * 0.72, T * 0.52);
  ctx.fillStyle = "#e2d3a8";
  for (let i = 0; i < 3; i++) ctx.fillRect(-T * 0.26, -T * 0.14 + i * T * 0.14, T * (0.52 - i * 0.1), T * 0.035);
};
B3A["g23giant"] = function (ctx, p, T) {
  ctx.fillStyle = "#4f3b26"; ctx.fillRect(-T * 0.22, -T * 0.48, T * 0.44, T * 0.96);
  ctx.fillStyle = "#3c5c30";
  ctx.beginPath(); ctx.arc(0, -T * 0.34, T * 0.46, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(160,205,120,.25)";
  ctx.beginPath(); ctx.arc(-T * 0.14, -T * 0.42, T * 0.20, 0, Math.PI * 2); ctx.fill();
};
B3A["g23beast"] = function (ctx, p, T) {
  const cols = ["#9a7a52", "#6a4a3a", "#7a6a5a", "#3a3a44", "#8a8060", "#c8b878", "#d0d6c8", "#5a7a48"];
  ctx.fillStyle = cols[(p.idx || 0) % cols.length];
  ctx.beginPath(); ctx.ellipse(0, T * 0.10, T * 0.32, T * 0.20, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(255,220,140,.8)";
  ctx.beginPath(); ctx.arc(-T * 0.14, -T * 0.02, T * 0.045, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(T * 0.14, -T * 0.02, T * 0.045, 0, Math.PI * 2); ctx.fill();
};
B3A["g23firefly"] = function (ctx, p, T) {
  const t = performance.now() / 600;
  const a = 0.55 + 0.35 * Math.sin(t + (p.x || 0));
  ctx.fillStyle = "rgba(210,255,170," + a.toFixed(2) + ")";
  ctx.beginPath(); ctx.arc(0, 0, T * 0.22, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#e8ffc0";
  ctx.beginPath(); ctx.arc(0, 0, T * 0.075, 0, Math.PI * 2); ctx.fill();
};
B3A["g23fungus"] = function (ctx, p, T) {
  for (let i = 0; i < 3; i++) {
    const x = -T * 0.2 + i * T * 0.2;
    ctx.fillStyle = "#c8c8a0"; ctx.fillRect(x - T * 0.02, 0, T * 0.04, T * 0.16);
    ctx.fillStyle = "#a8d888";
    ctx.beginPath(); ctx.ellipse(x, 0, T * 0.09, T * 0.055, 0, Math.PI, Math.PI * 2); ctx.fill();
  }
};
B3A["g23shrub"] = function (ctx, p, T) {
  ctx.fillStyle = "#3f6034";
  for (let i = 0; i < 4; i++) {
    ctx.beginPath(); ctx.arc(-T * 0.24 + i * T * 0.16, T * (0.06 - (i % 2) * 0.12), T * 0.16, 0, Math.PI * 2); ctx.fill();
  }
};
B3A["g23pottery"] = function (ctx, p, T) {
  ctx.fillStyle = "#9a7850";
  ctx.beginPath(); ctx.moveTo(-T * 0.18, -T * 0.22); ctx.lineTo(T * 0.18, -T * 0.22);
  ctx.lineTo(T * 0.24, T * 0.28); ctx.lineTo(-T * 0.24, T * 0.28); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "#725636"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-T * 0.2, T * 0.02); ctx.lineTo(T * 0.2, T * 0.02); ctx.stroke();
};
B3A["b32belle"] = function (ctx, p, T) {
  ctx.fillStyle = "#d0813c";                    // 维多利亚时代的橙色长裙
  ctx.beginPath(); ctx.moveTo(-T * 0.16, -T * 0.18); ctx.lineTo(T * 0.16, -T * 0.18);
  ctx.lineTo(T * 0.30, T * 0.42); ctx.lineTo(-T * 0.30, T * 0.42); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#e6d8c8";
  ctx.beginPath(); ctx.arc(0, -T * 0.28, T * 0.14, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#1c1a1e";
  ctx.beginPath(); ctx.arc(0, -T * 0.36, T * 0.15, Math.PI, Math.PI * 2); ctx.fill();
  ctx.fillRect(-T * 0.15, -T * 0.36, T * 0.30, T * 0.10);
};
B3A["b32queen"] = function (ctx, p, T) {
  ctx.fillStyle = "#22242a";                    // 破旧的黑裙
  ctx.beginPath(); ctx.moveTo(-T * 0.14, -T * 0.20); ctx.lineTo(T * 0.14, -T * 0.20);
  ctx.lineTo(T * 0.34, T * 0.46); ctx.lineTo(-T * 0.34, T * 0.46); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#d8d6cc";                    // 骨瘦如柴、苍白的头
  ctx.beginPath(); ctx.ellipse(0, -T * 0.32, T * 0.13, T * 0.18, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#8c1f26";
  ctx.beginPath(); ctx.arc(-T * 0.055, -T * 0.34, T * 0.032, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(T * 0.055, -T * 0.34, T * 0.032, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "rgba(150,160,170,.5)"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-T * 0.30, -T * 0.46); ctx.lineTo(T * 0.30, -T * 0.46); ctx.stroke();
};
B3A["b32respect"] = function (ctx, p, T) {
  ctx.fillStyle = "#4a6a4a"; ctx.fillRect(-T * 0.36, -T * 0.22, T * 0.72, T * 0.44);
  ctx.fillStyle = "#e0e8d4"; ctx.font = "bold " + (T * 0.16) + "px sans-serif";
  ctx.textAlign = "center"; ctx.fillText("行礼 → 39", 0, T * 0.06); ctx.textAlign = "left";
};
B3A["b32insult"] = function (ctx, p, T) {
  ctx.fillStyle = "#5a262c"; ctx.fillRect(-T * 0.36, -T * 0.22, T * 0.72, T * 0.44);
  ctx.fillStyle = "#f0d0c8"; ctx.font = "bold " + (T * 0.15) + "px sans-serif";
  ctx.textAlign = "center"; ctx.fillText("不敬", 0, T * 0.06); ctx.textAlign = "left";
};
B3A["b32skull"] = function (ctx, p, T) {
  ctx.fillStyle = "#d8d6cc";
  ctx.beginPath(); ctx.arc(0, -T * 0.06, T * 0.20, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(-T * 0.12, T * 0.06, T * 0.24, T * 0.10);
  ctx.fillStyle = "#2d333d";
  ctx.beginPath(); ctx.arc(-T * 0.075, -T * 0.08, T * 0.055, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(T * 0.075, -T * 0.08, T * 0.055, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "rgba(190,200,210,.5)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, -T * 0.32); ctx.lineTo(0, -T * 0.26); ctx.stroke();
};
B3A["b32bone"] = function (ctx, p, T) {
  ctx.strokeStyle = "#b8b6aa"; ctx.lineWidth = Math.max(2, T * 0.06);
  ctx.beginPath(); ctx.moveTo(-T * 0.22, T * 0.12); ctx.lineTo(T * 0.22, -T * 0.12); ctx.stroke();
};
