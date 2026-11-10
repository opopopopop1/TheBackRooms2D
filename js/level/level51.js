// ===========================================================
// Level 5.1 —— 恐怖旅馆赌场（Entity 18 所有）
//   正面两个巨大的红色字母 "TH"；昏暗闪烁的灯、老虎机、轮盘、
//   纸牌、骰子、酒吧、前台。四种筹码：红 1 / 蓝 5 / 黄 10 / 绿 20。
//   游戏输赢是被操纵的：先让你赢到上瘾，再让你把资源全输光。
//   开放 16 小时、关闭 8 小时循环；出口只有一个 —— 原路返回 Level 5。
// ===========================================================
"use strict";

(function () {
  const v = ["#7e3a46", "#4a2a33"];       // 绛红地毯 / 深绛墙
  if (typeof regTile === "function") regTile("casino51", v);
  else (window.__NEWTILE_EXTRA = window.__NEWTILE_EXTRA || {})["casino51"] = v;
})();

const C51_CYCLE = 96;     // 一个完整循环（秒）：开 64 / 关 32 ≈ 16h : 8h
const C51_OPEN = 64;

function c51Rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

function generateCasino51Map(level) {
  const size = 88;
  const grid = makeGrid(size);
  // 一整座大赌场厅：只留四壁厚墙，中间全部铺开（容量按档案可容 5000 人）
  carveRoom(grid, size, 4, 4, size - 8, size - 8);
  // 几道半高的隔断，把大厅分出老虎机区 / 桌面区 / 酒吧区，不切断通路
  for (let x = 14; x <= 74; x++) {
    if (x === 43 || x === 45) continue;
    grid[30][x] = 1; grid[58][x] = 1;
  }
  for (let y = 30; y <= 58; y++) {
    if (y === 43 || y === 45) continue;
    grid[y][28] = 1; grid[y][60] = 1;
  }
  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [collectFloors(grid, size)], rooms: [[]],
    start: { x: 44, y: 78, floor: 0 },
    exit: null, doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props: [], crates: [], ground: [], spawnPts: [{ x: 44, y: 78, floor: 0 }],
    wander: null,
  };
  makeDoorsMap(map);
  const P = (x, y, type, extra) => map.props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));

  // 正门：原路返回 Level 5（唯一的出口）
  P(44, 84, "c51exit", { toLevel: 5, tip: "赌场正门 —— 门楣上「TH」两个巨大的红字母" });
  // 前台 / 兑换处 / 酒吧
  P(38, 79, "c51cashier", { iKind: "c51cashier" });
  P(50, 79, "c51exchange", { iKind: "c51exchange" });
  P(56, 72, "c51bar", { iKind: "c51bar" });
  P(32, 72, "c51shop", { iKind: "c51shop" });       // 筹码换物资

  // 老虎机：两排
  for (let i = 0; i < 10; i++) {
    P(12 + i * 6, 20, "c51slot", { iKind: "c51slot", cost: 1 });
    P(12 + i * 6, 24, "c51slot", { iKind: "c51slot", cost: 1 });
  }
  // 轮盘 / 纸牌 / 骰子
  P(20, 40, "c51roulette", { iKind: "c51roulette", cost: 5 });
  P(36, 40, "c51roulette", { iKind: "c51roulette", cost: 5 });
  P(52, 40, "c51roulette", { iKind: "c51roulette", cost: 5 });
  P(20, 50, "c51cards", { iKind: "c51cards", cost: 10 });
  P(36, 50, "c51cards", { iKind: "c51cards", cost: 10 });
  P(52, 50, "c51cards", { iKind: "c51cards", cost: 10 });
  P(28, 68, "c51dice", { iKind: "c51dice", cost: 2 });
  P(46, 68, "c51dice", { iKind: "c51dice", cost: 2 });
  P(68, 40, "c51vip", { iKind: "c51vip", cost: 20 });

  // 工作人员、经理、野兽、紫色筹码
  P(16, 76, "c51staff", { iKind: "c51staff", job: "迎宾员" });
  P(70, 76, "c51staff", { iKind: "c51staff", job: "保安" });
  P(24, 34, "c51staff", { iKind: "c51staff", job: "机修" });
  P(62, 62, "c51staff", { iKind: "c51staff", job: "酒保" });
  P(44, 44, "c51louie", { iKind: "c51louie" });
  P(70, 20, "c51beast", { iKind: "c51beast" });
  P(66, 68, "c51purple", { iKind: "c51purple" });

  // 装饰：吊灯、筹码盘、地毯上的 TH 徽记、绿植
  for (let x = 10; x <= 78; x += 12) for (let y = 12; y <= 76; y += 14) P(x, y, "c51lamp");
  P(44, 8, "c51thlogo");
  return map;
}
window.generateCasino51Map = generateCasino51Map;

// ---------- 筹码账本 ----------
function c51Book(g) {
  if (!g.c51) g.c51 = { red: 4, blue: 0, yellow: 0, green: 0, plays: 0, wins: 0, purple: 50, last: 0 };
  return g.c51;
}
function c51Value(b) { return b.red + b.blue * 5 + b.yellow * 10 + b.green * 20; }
function c51Pay(b, cost) {
  // 从大面值开始找，尽量少动红筹码；找零一律返红
  let left = cost;
  const take = (k, val) => {
    while (left >= val && b[k] > 0) { b[k]--; left -= val; }
  };
  take("green", 20); take("yellow", 10); take("blue", 5); take("red", 1);
  if (left > 0) return false;
  return true;
}
function c51Add(b, dollars) { b.red += dollars; }

// ---------- 每帧：开 / 关循环 ----------
window.__LEVEL_TICK = window.__LEVEL_TICK || {};
window.__LEVEL_TICK["5.1"] = function (g, dt) {
  const b = c51Book(g);
  window.__B2_enter(g, "5.1", () => { g.c51t = 0; });
  g.c51t = (g.c51t || 0) + (dt || 0.016);
  const was = g.c51open;
  g.c51open = (g.c51t % C51_CYCLE) < C51_OPEN;
  if (was !== undefined && was !== g.c51open && typeof window.__toast === "function") {
    window.__toast(g.c51open ? "灯一盏盏亮起来 —— 赌场开门了" : "灯暗了下去，机器陆续停了 —— 赌场打烊 8 小时");
  }
};

// ---------- 地面 / 墙 ----------
window.drawCasino51Floor = function (ctx, px, py, S, map, tx, ty) {
  const odd = (tx + ty) % 2 === 0;
  ctx.fillStyle = odd ? "#823e4c" : "#783745";
  ctx.fillRect(px, py, S, S);
  // 金色菱形格纹（新地毯）
  ctx.save();
  ctx.translate(px + S / 2, py + S / 2); ctx.rotate(Math.PI / 4);
  ctx.strokeStyle = "rgba(224,181,86,.22)"; ctx.lineWidth = 1;
  ctx.strokeRect(-S * 0.34, -S * 0.34, S * 0.68, S * 0.68);
  ctx.restore();
  ctx.fillStyle = "rgba(255,214,140,.06)";
  ctx.fillRect(px + 2, py + 2, S - 4, 2);
  return true;
};
window.drawCasino51Wall = function (ctx, px, py, S, map, tx, ty) {
  ctx.fillStyle = "#4a2a33";
  ctx.fillRect(px, py, S, S);
  ctx.fillStyle = "#663743";
  ctx.fillRect(px, py, S, S * 0.18);
  ctx.fillStyle = "rgba(232,183,88,.55)";
  ctx.fillRect(px, py + S * 0.18, S, Math.max(2, S * 0.05));
  // 壁灯：每隔几格一盏，暖黄，会随时间轻微闪
  if ((tx * 3 + ty * 5) % 6 === 0) {
    const fl = 0.55 + 0.35 * Math.abs(Math.sin(performance.now() / 700 + tx));
    ctx.fillStyle = "rgba(255,214,130," + fl.toFixed(2) + ")";
    ctx.beginPath(); ctx.arc(px + S / 2, py + S * 0.46, S * 0.16, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#8a6430";
    ctx.fillRect(px + S * 0.42, py + S * 0.60, S * 0.16, S * 0.06);
  }
  return true;
};

// ---------- 整屏叠加：筹码栏 / 开闭状态 / 打烊压暗 ----------
window.__B2_OVL["5.1"] = function (ctx, g) {
  const b = c51Book(g);
  const cw = ctx.canvas.width, ch = ctx.canvas.height;
  ctx.save();
  try { ctx.setTransform(1, 0, 0, 1, 0, 0); } catch (e) { /* 忽略 */ }
  if (g.c51open === false) {
    ctx.fillStyle = "rgba(12,6,14,.34)";
    ctx.fillRect(0, 0, cw, ch);
  }
  // 左上角一行筹码账本
  const cols = [["红", b.red, "#d94b4b"], ["蓝", b.blue, "#4f7fd9"], ["黄", b.yellow, "#e0bd42"], ["绿", b.green, "#4fbf6a"]];
  ctx.fillStyle = "rgba(20,10,16,.72)";
  ctx.fillRect(12, 12, 310, 34);
  ctx.font = "bold 14px sans-serif"; ctx.textAlign = "left";
  let x = 22;
  for (const [nm, n, col] of cols) {
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(x + 6, 29, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#f4e8d8";
    ctx.fillText(nm + " " + n, x + 16, 34);
    x += 74;
  }
  ctx.fillStyle = g.c51open === false ? "#e8a06a" : "#9fe0a8";
  ctx.font = "12px sans-serif";
  ctx.fillText(g.c51open === false ? "打烊中 · 机器停了" : "营业中 · 输赢被安排得刚刚好", 22, 60);
  ctx.restore();
};

// ---------- 交互 ----------
window.__B2_hint([
  "c51cashier", "c51exchange", "c51shop", "c51bar", "c51slot", "c51roulette",
  "c51cards", "c51dice", "c51vip", "c51staff", "c51louie", "c51beast", "c51purple",
], function (n, g) {
  const b = c51Book(g);
  switch (n.kind) {
    case "c51cashier": return "前台 —— 用 1 瓶杏仁水换 4 个红筹码，或把 1 个蓝筹码拆成 5 个红的 · 按 E 兑换";
    case "c51exchange": return "兑换台 —— 10 红→2 黄 / 6 黄→1 绿 / 1 绿→30 红 · 按 E 兑换";
    case "c51shop": return "筹码换物资：2 红 = 1 瓶杏仁水，1 黄 = 1 颗跃迁浆果 · 按 E 兑换（只有红筹码能换东西）";
    case "c51bar": return "酒吧 —— 菜单从通心粉奶酪到菲力牛排 · 2 红筹码换 1 瓶杏仁水 · 按 E";
    case "c51slot": return "老虎机 —— 1 个红筹码一局 · 按 E 拉杆";
    case "c51roulette": return "轮盘赌 —— 5 美元（1 个蓝筹码）一局 · 按 E 下注";
    case "c51cards": return "纸牌桌 —— 10 美元（1 个黄筹码）一局 · 按 E 坐下";
    case "c51dice": return "骰子桌 —— 2 个红筹码一局 · 按 E 掷";
    case "c51vip": return "高级桌 —— 只收绿色筹码（20 美元）· 按 E 坐下";
    case "c51staff": return "赌场工作人员（" + (n.p.job || "?") + "）—— 人形，但身上有些部位换成了赌场里的东西 · 按 E 搭话";
    case "c51louie": return "经理 Louie Sulphur —— 手臂是台球杆，一只眼是台球 · 按 E 问一句";
    case "c51beast": return "第五层的野兽 —— 它要和你一对一赌一局，赢了大富大贵，输了就留下当工作人员 · 按 E 接受";
    case "c51purple": return "一枚紫色筹码，中心写着 " + b.purple + " —— 数字随输赢上下浮动 · 按 E 端详";
  }
  return null;
});

window.__B2_act([
  "c51cashier", "c51exchange", "c51shop", "c51bar", "c51slot", "c51roulette",
  "c51cards", "c51dice", "c51vip", "c51staff", "c51louie", "c51beast", "c51purple",
], function (n, g) {
  const b = c51Book(g);
  const inv = g.inv || (g.inv = {});
  const almond = inv.almond || 0;
  switch (n.kind) {
    case "c51cashier": {
      if (almond > 0) {
        inv.almond = almond - 1;
        b.red += 4;
        window.__toast("前台推过来 4 枚红筹码 —— 「祝你好运。」");
      } else if (b.blue > 0) {
        b.blue--; b.red += 5;
        window.__toast("蓝筹码拆成了 5 枚红的");
      } else window.__toast("你没有杏仁水，也没有蓝筹码 —— 先去别的层级找点物资");
      return true;
    }
    case "c51exchange": {
      if (b.yellow >= 6) { b.yellow -= 6; b.green += 1; window.__toast("6 枚黄筹码换成 1 枚绿的"); }
      else if (b.red >= 10) { b.red -= 10; b.yellow += 2; window.__toast("10 枚红筹码换成 2 枚黄的"); }
      else if (b.green >= 1) { b.green -= 1; b.red += 30; window.__toast("1 枚绿筹码换回 30 枚红的 —— 赌场给的价，比面值还高"); }
      else window.__toast("筹码不够兑换（10 红 / 6 黄 / 1 绿）");
      return true;
    }
    case "c51shop": {
      if (b.red >= 2) {
        b.red -= 2; inv.almond = (inv.almond || 0) + 1;
        window.__toast("2 枚红筹码换到 1 瓶杏仁水");
      } else if (b.yellow >= 1 && b.red >= 0) {
        // 跃迁浆果：1 黄
        b.yellow -= 1; inv.warpberry = (inv.warpberry || 0) + 1;
        window.__toast("1 枚黄筹码换到 1 颗跃迁浆果");
      } else window.__toast("只有红筹码能兑换物资，而且你一枚都没有");
      return true;
    }
    case "c51bar": {
      if (!c51Pay(b, 2)) { window.__toast("2 枚红筹码 —— 你掏不出来"); return true; }
      inv.almond = (inv.almond || 0) + 1;
      window.__toast("酒保递来一瓶没见过的牌子 —— 味道浓郁得不像后室的东西（杏仁水 +1）");
      return true;
    }
    case "c51slot": case "c51roulette": case "c51cards": case "c51dice": case "c51vip": {
      if (g.c51open === false) { window.__toast("机器黑着屏 —— 赌场打烊了，等开门再来"); return true; }
      const cost = n.p.cost || 1;
      if (!c51Pay(b, cost)) { window.__toast("下注要 " + cost + " 美元等值的筹码 —— 先去前台兑换"); return true; }
      b.plays++;
      // 被操纵的机制：头几局让你赢，之后赢率一路掉下去
      const winRate = b.plays <= 3 ? 1 : Math.max(0.22, 0.62 - (b.plays - 3) * 0.045);
      const win = Math.random() < winRate;
      if (win) {
        const prize = cost * c51Rnd(2, 3);
        c51Add(b, prize); b.wins++;
        b.purple = Math.min(99, b.purple + prize);
        window.__toast("转盘忽然抖了一下 —— 你赢了 " + prize + " 美元！机器哗啦啦吐出红筹码");
      } else {
        b.purple = Math.max(0, b.purple - cost);
        window.__toast("就像有只看不见的手把大奖挪开了 —— 这局输了" + (b.purple === 0 ? "（紫筹码上的数字变成了 0）" : ""));
      }
      return true;
    }
    case "c51staff": {
      const L = ["「这边请，今晚手气一定好。」（它的手是一副发牌器）",
        "「机器坏了？我来看看。」（它蹲下去，膝盖是两枚骰子）",
        "「别碰那张桌子。」（声音很平）", "……（它只是把头转过来，脸上有半张是筹码）"];
      window.__toast(L[Math.floor(Math.random() * L.length)]);
      return true;
    }
    case "c51louie": {
      window.__toast("「我是 Louie……我记得赌场开业那天，再往前就什么都想不起来了。」（台球杆似的手臂敲了敲桌沿）");
      return true;
    }
    case "c51beast": {
      if (!c51Pay(b, 20)) { window.__toast("野兽只跟有绿色筹码的人玩 —— 你不够格"); return true; }
      window.__toast("纸牌像活的一样翻了过来 —— 野兽从来没输过。周围的工作人员围了上来，你留了下来。");
      b.red = 0; b.blue = 0; b.yellow = 0; b.green = 0;
      return true;
    }
    case "c51purple": {
      window.__toast(b.purple > 0
        ? "数字是 " + b.purple + " —— 有人说，等它变成 0，那个人就再也没回来过"
        : "数字是 0。故事到这里就断了，后面每种说法都一样：那个人没有再回来。");
      return true;
    }
  }
  return false;
});

// ---------- 物件外观 ----------
window.PROP_DRAW = window.PROP_DRAW || {};
const C51 = window.PROP_DRAW;
const c51Frame = (ctx, T, col) => {
  ctx.fillStyle = col || "#2a1b22";
  ctx.fillRect(-T * 0.42, -T * 0.40, T * 0.84, T * 0.80);
  ctx.strokeStyle = "#d8ad57"; ctx.lineWidth = 2;
  ctx.strokeRect(-T * 0.42, -T * 0.40, T * 0.84, T * 0.80);
};
C51["c51exit"] = function (ctx, p, T) {
  c51Frame(ctx, T, "#4a2832");
  ctx.fillStyle = "#e8d9c0";
  ctx.fillRect(-T * 0.30, -T * 0.32, T * 0.60, T * 0.66);
  ctx.fillStyle = "#a3242c"; ctx.font = "bold " + (T * 0.34) + "px sans-serif"; ctx.textAlign = "center";
  ctx.fillText("TH", 0, T * 0.16); ctx.textAlign = "left";
  ctx.fillStyle = "rgba(255,215,130,.25)";
  ctx.fillRect(-T * 0.44, -T * 0.44, T * 0.88, T * 0.88);
};
C51["c51thlogo"] = C51["c51exit"];
C51["c51lamp"] = function (ctx, p, T) {
  const gl = 0.35 + 0.3 * Math.abs(Math.sin(performance.now() / 800 + p.x));
  ctx.fillStyle = "rgba(255,214,140," + gl.toFixed(2) + ")";
  ctx.beginPath(); ctx.arc(0, 0, T * 0.30, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#c9a04a";
  ctx.beginPath(); ctx.arc(0, 0, T * 0.12, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "rgba(232,183,88,.5)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(0, 0, T * 0.40, 0, Math.PI * 2); ctx.stroke();
};
C51["c51cashier"] = function (ctx, p, T) {
  ctx.fillStyle = "#6b4326"; ctx.fillRect(-T * 0.44, -T * 0.10, T * 0.88, T * 0.44);
  ctx.fillStyle = "#94663a"; ctx.fillRect(-T * 0.44, -T * 0.16, T * 0.88, T * 0.10);
  const cols = ["#d94b4b", "#4f7fd9", "#e0bd42", "#4fbf6a"];
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = cols[i];
    for (let j = 0; j < 3; j++) {
      ctx.beginPath(); ctx.arc(-T * 0.30 + i * T * 0.20, T * 0.04 - j * T * 0.035, T * 0.065, 0, Math.PI * 2); ctx.fill();
    }
  }
};
C51["c51exchange"] = function (ctx, p, T) {
  ctx.fillStyle = "#3c4a5a"; ctx.fillRect(-T * 0.40, -T * 0.36, T * 0.80, T * 0.72);
  ctx.fillStyle = "#d9c08a"; ctx.font = "bold " + (T * 0.30) + "px sans-serif"; ctx.textAlign = "center";
  ctx.fillText("$", 0, T * 0.12); ctx.textAlign = "left";
  ctx.strokeStyle = "#e8c765"; ctx.lineWidth = 2; ctx.strokeRect(-T * 0.40, -T * 0.36, T * 0.80, T * 0.72);
};
C51["c51shop"] = function (ctx, p, T) {
  ctx.fillStyle = "#4a5a3a"; ctx.fillRect(-T * 0.40, -T * 0.36, T * 0.80, T * 0.72);
  ctx.fillStyle = "#e8e0c0"; ctx.fillRect(-T * 0.28, -T * 0.24, T * 0.24, T * 0.48);
  ctx.fillStyle = "#8ec4e8"; ctx.fillRect(-T * 0.28, -T * 0.24, T * 0.24, T * 0.16);
  ctx.fillStyle = "#d9b04a"; ctx.fillRect(T * 0.06, -T * 0.20, T * 0.26, T * 0.12);
  ctx.fillRect(T * 0.06, T * 0.02, T * 0.26, T * 0.12);
};
C51["c51bar"] = function (ctx, p, T) {
  ctx.fillStyle = "#5a3a22"; ctx.fillRect(-T * 0.46, 0, T * 0.92, T * 0.40);
  ctx.fillStyle = "#2a1a12"; ctx.fillRect(-T * 0.46, -T * 0.44, T * 0.92, T * 0.12);
  const cols = ["#a8d06a", "#d98a4a", "#c04a4a", "#8a6ad0"];
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = cols[i]; ctx.fillRect(-T * 0.34 + i * T * 0.20, -T * 0.40, T * 0.09, T * 0.28);
  }
  ctx.fillStyle = "#e8d9a8"; ctx.fillRect(-T * 0.46, -T * 0.08, T * 0.92, T * 0.08);
};
C51["c51slot"] = function (ctx, p, T) {
  c51Frame(ctx, T, "#7a2430");
  ctx.fillStyle = "#f0e2c0";
  ctx.fillRect(-T * 0.30, -T * 0.30, T * 0.60, T * 0.28);
  const cols = ["#d94b4b", "#e0bd42", "#4fbf6a"];
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = cols[(i + p.x) % 3];
    ctx.fillRect(-T * 0.27 + i * T * 0.19, -T * 0.27, T * 0.15, T * 0.22);
  }
  ctx.fillStyle = "#d9ad4a"; ctx.fillRect(-T * 0.32, T * 0.04, T * 0.64, T * 0.08);
  ctx.fillStyle = "#e8d9a8"; ctx.fillRect(T * 0.30, -T * 0.14, T * 0.07, T * 0.28);
  ctx.fillStyle = "#c93b3b"; ctx.beginPath(); ctx.arc(T * 0.335, -T * 0.16, T * 0.07, 0, Math.PI * 2); ctx.fill();
};
C51["c51roulette"] = function (ctx, p, T) {
  c51Frame(ctx, T, "#24503c");
  ctx.fillStyle = "#1e6b48";
  ctx.beginPath(); ctx.arc(0, 0, T * 0.32, 0, Math.PI * 2); ctx.fill();
  for (let i = 0; i < 12; i++) {
    ctx.fillStyle = i % 2 ? "#e8d9b8" : "#a83232";
    ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.arc(0, 0, T * 0.28, i * Math.PI / 6, (i + 1) * Math.PI / 6);
    ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = "#d9b04a"; ctx.beginPath(); ctx.arc(0, 0, T * 0.09, 0, Math.PI * 2); ctx.fill();
};
C51["c51cards"] = function (ctx, p, T) {
  ctx.fillStyle = "#1e6b48"; ctx.beginPath(); ctx.ellipse(0, 0, T * 0.44, T * 0.32, 0, 0, Math.PI * 2); ctx.fill();
  for (let i = 0; i < 3; i++) {
    ctx.save(); ctx.translate(-T * 0.20 + i * T * 0.20, -T * 0.06); ctx.rotate((i - 1) * 0.2);
    ctx.fillStyle = "#f4ecd8"; ctx.fillRect(-T * 0.09, -T * 0.14, T * 0.18, T * 0.28);
    ctx.fillStyle = i === 1 ? "#a83232" : "#2a2a30"; ctx.font = "bold " + (T * 0.16) + "px sans-serif"; ctx.textAlign = "center";
    ctx.fillText(i === 1 ? "♥" : "♠", 0, T * 0.06); ctx.textAlign = "left"; ctx.restore();
  }
};
C51["c51dice"] = function (ctx, p, T) {
  ctx.fillStyle = "#5a3a22"; ctx.fillRect(-T * 0.40, -T * 0.28, T * 0.80, T * 0.60);
  for (let i = 0; i < 2; i++) {
    const dx = -T * 0.22 + i * T * 0.26;
    ctx.fillStyle = "#f4ecd8"; ctx.fillRect(dx, -T * 0.18, T * 0.20, T * 0.20);
    ctx.fillStyle = "#2a2a30";
    for (let k = 0; k < 3 + i; k++) {
      ctx.beginPath(); ctx.arc(dx + T * (0.05 + (k % 2) * 0.10), -T * (0.13 - Math.floor(k / 2) * 0.09), T * 0.022, 0, Math.PI * 2); ctx.fill();
    }
  }
};
C51["c51vip"] = function (ctx, p, T) {
  c51Frame(ctx, T, "#3a2a5a");
  ctx.fillStyle = "#6a4a9a"; ctx.beginPath(); ctx.ellipse(0, 0, T * 0.38, T * 0.26, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#e8cf6a"; ctx.beginPath(); ctx.arc(0, 0, T * 0.13, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#f6e9c0"; ctx.font = "bold " + (T * 0.16) + "px sans-serif"; ctx.textAlign = "center";
  ctx.fillText("VIP", 0, T * 0.05); ctx.textAlign = "left";
};
C51["c51staff"] = function (ctx, p, T) {
  ctx.fillStyle = "#2a2230"; ctx.fillRect(-T * 0.16, -T * 0.06, T * 0.32, T * 0.44);
  ctx.fillStyle = "#d8b79a"; ctx.beginPath(); ctx.arc(0, -T * 0.20, T * 0.14, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#c9a04a"; ctx.fillRect(-T * 0.30, -T * 0.02, T * 0.14, T * 0.30);  // 异化的手臂
  ctx.fillStyle = "#e8d9a8"; ctx.beginPath(); ctx.arc(T * 0.24, -T * 0.02, T * 0.09, 0, Math.PI * 2); ctx.fill();
};
C51["c51louie"] = function (ctx, p, T) {
  ctx.fillStyle = "#20283a"; ctx.fillRect(-T * 0.16, -T * 0.06, T * 0.32, T * 0.44);
  ctx.fillStyle = "#d8b79a"; ctx.beginPath(); ctx.arc(0, -T * 0.20, T * 0.14, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#f4ecd8"; ctx.beginPath(); ctx.arc(T * 0.06, -T * 0.22, T * 0.065, 0, Math.PI * 2); ctx.fill(); // 台球眼
  ctx.fillStyle = "#8a6430"; ctx.fillRect(-T * 0.42, -T * 0.04, T * 0.36, T * 0.045); // 台球杆手臂
  ctx.fillRect(T * 0.10, -T * 0.04, T * 0.34, T * 0.045);
};
C51["c51beast"] = function (ctx, p, T) {
  ctx.fillStyle = "rgba(120,20,30,.35)";
  ctx.beginPath(); ctx.arc(0, 0, T * 0.46, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#3a1018";
  ctx.beginPath(); ctx.ellipse(0, 0, T * 0.30, T * 0.38, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#e8a04a";
  ctx.beginPath(); ctx.arc(-T * 0.10, -T * 0.14, T * 0.045, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(T * 0.10, -T * 0.14, T * 0.045, 0, Math.PI * 2); ctx.fill();
};
C51["c51purple"] = function (ctx, p, T) {
  ctx.fillStyle = "#7a3aa8"; ctx.beginPath(); ctx.arc(0, 0, T * 0.30, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#d8a8f0"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, 0, T * 0.22, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = "#f4e0ff"; ctx.font = "bold " + (T * 0.22) + "px sans-serif"; ctx.textAlign = "center";
  ctx.fillText(String((window.__game && window.__game.c51 && window.__game.c51.purple) || 50), 0, T * 0.08);
  ctx.textAlign = "left";
};
