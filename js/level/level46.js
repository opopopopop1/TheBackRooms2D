// ===========================================================
// Level 46 —— 阿拉伯沙漠（当前状态：夜晚）
//   白天 70℃ / 夜晚 -30℃ / 黎明 30~40℃，三种状态随机长短地轮替；
//   废墟遮荫又保温，绿洲不受状态影响。沙暴覆盖整个环境，会在其中
//   生出高度敌对的沙灵 —— 唯一的弱点是任意种类的液体。
//   M.E.G「沙漠玫瑰」基地在所有入口处都能看到。远古一族的圣殿古卷。
//   出口：废墟里的办公室门 → Level 4；低重力区通向 Level 149（未实装）。
// ===========================================================
"use strict";

(function () {
  const v = ["#c8a66e", "#9c7c48"];
  if (typeof regTile === "function") regTile("desert46", v);
  else (window.__NEWTILE_EXTRA = window.__NEWTILE_EXTRA || {})["desert46"] = v;
})();

function d46Hash(x, y) {
  let h = ((x | 0) * 374761393 + (y | 0) * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) | 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const D46_PHASES = [
  { key: "night", name: "夜晚", dur: 60, dmg: 1.4, temp: "-30℃" },
  { key: "dawn", name: "黎明", dur: 30, dmg: 0, temp: "30~40℃" },
  { key: "day", name: "白天", dur: 45, dmg: 2.2, temp: "70℃" },
];

function generateDesert46Map(level) {
  const size = 110, grid = makeGrid(size);
  carveRoom(grid, size, 3, 3, size - 6, size - 6);
  const floors = collectFloors(grid, size);
  const safe = new Set();
  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [[]],
    start: { x: 55, y: 90, floor: 0 },
    exit: null, doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props: [], crates: [], ground: [], spawnPts: [{ x: 55, y: 90, floor: 0 }],
    d46safe: safe, d46t: 0, d46phase: 0, d46storm: false, wander: null,
  };
  makeDoorsMap(map);
  const P = (x, y, type, extra) => map.props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  const markSafe = (x, y, r) => {
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) safe.add((x + dx) + "," + (y + dy));
  };

  // 「沙漠玫瑰」基地：所有入口处都能看到，就在出生点旁
  P(55, 90, "d46base", { iKind: "d46base" }); markSafe(55, 90, 5);
  P(49, 90, "d46tent"); P(61, 90, "d46tent"); P(55, 84, "d46flag");

  // 废墟：断墙石柱，白天遮荫、夜里保温
  const ruins = [[18, 22], [40, 16], [78, 20], [24, 52], [62, 40], [88, 58], [34, 82], [72, 78]];
  ruins.forEach(([x, y], i) => {
    P(x, y, "d46ruin", { iKind: "d46ruin" }); markSafe(x, y, 4);
    P(x - 3, y - 2, "d46column"); P(x + 3, y - 2, "d46column");
    P(x - 3, y + 2, "d46block"); P(x + 3, y + 2, "d46block");
  });
  // 办公室的门：藏在最大的一处废墟里 → Level 4
  P(62, 42, "d46office", { toLevel: 4, tip: "废墟深处一道办公室的门，门框还立着" });

  // 绿洲：不受三种状态影响，天然杏仁水
  for (const [x, y] of [[14, 70], [52, 58], [92, 34]]) {
    P(x, y, "d46oasis", { iKind: "d46oasis" }); markSafe(x, y, 4);
    P(x - 3, y - 2, "d46palm"); P(x + 3, y + 1, "d46palm");
  }
  // 圣殿古卷 / 低重力区 / 沙灵（沙暴时出现）
  P(40, 30, "d46scroll", { iKind: "d46scroll" });
  P(84, 88, "d46lowg", { iKind: "d46lowg" });
  for (let i = 0; i < 6; i++) {
    const f = floors[Math.floor(Math.random() * floors.length)];
    P(f.x, f.y, "d46spirit", { iKind: "d46spirit" });
  }
  // 散落的风蚀岩、沙丘上的枯骨
  for (let i = 0; i < 55; i++) {
    const f = floors[Math.floor(Math.random() * floors.length)];
    P(f.x, f.y, Math.random() < 0.5 ? "d46rock" : "d46bone");
  }
  return map;
}
window.generateDesert46Map = generateDesert46Map;

// ---------- 每帧：状态轮替 / 温度 / 沙暴 / 沙灵 ----------
window.__LEVEL_TICK = window.__LEVEL_TICK || {};
window.__LEVEL_TICK["46"] = function (g, dt) {
  dt = dt || 0.016;
  window.__B2_enter(g, "46", () => {
    g.d46t = 0; g.d46phase = 0; g.d46storm = false; g.d46warn = false;
    for (const q of (g.map.props || [])) if (q.type === "d46spirit") q.d46gone = false;
  });
  g.d46t = (g.d46t || 0) + dt;
  const ph = D46_PHASES[g.d46phase | 0];
  if (g.d46t >= ph.dur) {
    g.d46t = 0;
    g.d46phase = (g.d46phase + 1) % D46_PHASES.length;
    const nx = D46_PHASES[g.d46phase];
    window.__toast(nx.key === "day" ? "太阳升起来了 —— 70℃，躲进废墟！"
      : nx.key === "dawn" ? "天色发白，温度回到 30~40℃ —— 这是最适合探索的时候"
        : "太阳落下去了 —— 夜里 -30℃，废墟能保温");
  }
  // 沙暴：每个状态里后段刮一阵
  const storm = g.d46t > ph.dur * 0.55;
  if (storm !== g.d46storm) {
    g.d46storm = storm;
    window.__toast(storm ? "沙暴起来了 —— 风里有人形的影子在动，手边有液体就还能挡一挡"
      : "沙暴过去了，沙灵散回了沙里");
  }
  // 安全区：废墟 / 绿洲 / 基地
  const tx = Math.floor(g.player.x / 40), ty = Math.floor(g.player.y / 40);
  const inSafe = g.map.d46safe && g.map.d46safe.has(tx + "," + ty);
  if (!inSafe && ph.dmg > 0) {
    g.health = Math.max(0, (g.health || 0) - ph.dmg * dt);
    if (!g.d46warn || g.d46t < 1) {
      g.d46warn = true;
      window.__toast(ph.key === "day" ? "热浪扑上来 —— 找片废墟的阴影！" : "冷得发僵 —— 废墟里能保温");
    }
  } else g.d46warn = false;
  // 沙暴中靠近沙灵：没液体就掉血
  if (storm) {
    for (const p of (g.map.props || [])) {
      if (p.type !== "d46spirit" || p.d46gone) continue;
      const d = Math.hypot((p.x + 0.5) * 40 - g.player.x, (p.y + 0.5) * 40 - g.player.y);
      if (d < 55) g.health = Math.max(0, (g.health || 0) - 2.4 * dt);
    }
  }
};

// ---------- 地面 / 沙丘墙 ----------
window.drawDesert46Floor = function (ctx, px, py, S, map, tx, ty) {
  const g = window.__game;
  const ph = g && D46_PHASES[g.d46phase | 0];
  const night = ph && ph.key === "night";
  ctx.fillStyle = night ? "#b9a37c" : "#d2b079";
  ctx.fillRect(px, py, S, S);
  const r = d46Hash(tx, ty);
  // 风吹出来的沙纹
  ctx.strokeStyle = night ? "rgba(90,80,66,.22)" : "rgba(150,110,58,.28)";
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 2; i++) {
    ctx.beginPath();
    ctx.moveTo(px, py + S * (0.28 + i * 0.36 + r * 0.1));
    ctx.bezierCurveTo(px + S * 0.35, py + S * (0.20 + i * 0.36), px + S * 0.65, py + S * (0.38 + i * 0.36), px + S, py + S * (0.28 + i * 0.36));
    ctx.stroke();
  }
  if (r > 0.82) { ctx.fillStyle = "#a88a5c"; ctx.beginPath(); ctx.arc(px + S * 0.7, py + S * 0.7, S * 0.07, 0, Math.PI * 2); ctx.fill(); }
  return true;
};
window.drawDesert46Wall = function (ctx, px, py, S, map, tx, ty) {
  // 远处沙丘 / 风蚀岩：暖棕，不是黑
  ctx.fillStyle = "#9c7c48"; ctx.fillRect(px, py, S, S);
  ctx.fillStyle = "#b09058";
  ctx.beginPath(); ctx.moveTo(px, py + S); ctx.quadraticCurveTo(px + S * 0.5, py - S * 0.2, px + S, py + S); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "rgba(255,226,160,.16)";
  ctx.fillRect(px, py + S * 0.72, S, S * 0.08);
  return true;
};

// ---------- 整屏：三种状态的光 + 沙暴 ----------
window.__B2_OVL["46"] = function (ctx, g) {
  const cw = ctx.canvas.width, ch = ctx.canvas.height;
  const ph = D46_PHASES[g.d46phase | 0];
  ctx.save();
  try { ctx.setTransform(1, 0, 0, 1, 0, 0); } catch (e) { /* 忽略 */ }
  if (ph.key === "night") {
    ctx.fillStyle = "rgba(34,50,96,.24)"; ctx.fillRect(0, 0, cw, ch);
  } else if (ph.key === "day") {
    ctx.fillStyle = "rgba(255,226,150,.16)"; ctx.fillRect(0, 0, cw, ch);
  } else {
    ctx.fillStyle = "rgba(226,170,120,.09)"; ctx.fillRect(0, 0, cw, ch);
  }
  if (g.d46storm) {
    ctx.fillStyle = "rgba(196,158,96,.26)"; ctx.fillRect(0, 0, cw, ch);
    const t = performance.now() / 2;
    ctx.fillStyle = "rgba(240,216,160,.30)";
    for (let i = 0; i < 90; i++) {
      const x = (i * 137 + t) % cw, y = (i * 61 + t * 0.35) % ch;
      ctx.fillRect(x, y, 5, 1.5);
    }
  }
  // 右上角状态牌
  ctx.fillStyle = "rgba(36,26,14,.66)"; ctx.fillRect(cw - 176, 12, 164, 34);
  ctx.fillStyle = "#f2e0bc"; ctx.font = "bold 13px sans-serif"; ctx.textAlign = "left";
  ctx.fillText(ph.name + " · " + ph.temp + (g.d46storm ? " · 沙暴" : ""), cw - 166, 34);
  ctx.restore();
};

// ---------- 交互 ----------
window.__B2_hint(["d46base", "d46ruin", "d46oasis", "d46scroll", "d46lowg", "d46spirit"], function (n, g) {
  switch (n.kind) {
    case "d46base": return "M.E.G「沙漠玫瑰」基地 —— 大约 20 个人，提供水和住所 · 按 E 补给";
    case "d46ruin": return "远古一族留下的废墟 —— 白天遮荫、夜里保温 · 按 E 歇一会儿";
    case "d46oasis": return "绿洲，不受三种状态影响 · 按 E 取天然杏仁水";
    case "d46scroll": return "「圣殿古卷」—— 远古一族画的星象图，比 M.E.G 的还精确 · 按 E 翻一页";
    case "d46lowg": return "这一带的重力明显低了些，沙子在慢慢往上飘（→ Level 149，尚未实装）· 按 E 踩一脚";
    case "d46spirit": return "沙暴里生出来的沙灵 —— 唯一弱点是任意液体 · 按 E 泼出手边的液体";
  }
  return null;
});
window.__B2_act(["d46base", "d46ruin", "d46oasis", "d46scroll", "d46lowg", "d46spirit"], function (n, g) {
  const inv = g.inv || (g.inv = {});
  switch (n.kind) {
    case "d46base":
      inv.almond = (inv.almond | 0) + 2;
      g.health = Math.min(100, (g.health || 0) + 20);
      window.__toast("「先喝水。」基地的人递来两瓶 —— 这里大约常驻 20 人（杏仁水 +2，生命 +20）");
      return true;
    case "d46ruin":
      g.health = Math.min(100, (g.health || 0) + 8);
      window.__toast("断墙后面果然是另一个温度 —— 外面 70℃ 也好、-30℃ 也好，都隔着一层");
      return true;
    case "d46oasis":
      inv.almond = (inv.almond | 0) + 1;
      window.__toast("水不深，凉得发甜 —— 天然杏仁水（+1）");
      return true;
    case "d46scroll":
      window.__toast("插图画着「更高的一天」：热到能融化岩石。M.E.G 从没记录到那样的日子 —— 也许那一天还没来");
      return true;
    case "d46lowg":
      window.__toast("脚下一轻，沙子缓缓浮起来 —— 据说这里会慢慢把你送到 Level 149 最大的沙地岛（那一层还没实装）");
      return true;
    case "d46spirit": {
      if (!window.__game.d46storm) { window.__toast("风停了，沙灵也散了 —— 现在只剩一堆沙"); return true; }
      if ((inv.almond | 0) > 0) {
        inv.almond = (inv.almond | 0) - 1;
        n.p.d46gone = true;
        window.__toast("一瓶水泼过去，那个人形「嗤」地塌成一堆湿沙 —— 液体果然是它们的弱点");
      } else {
        g.health = Math.max(0, (g.health || 0) - 12);
        window.__toast("你手边一点液体都没有 —— 它扑了上来（生命 -12）");
      }
      return true;
    }
  }
  return false;
});

// ---------- 物件外观 ----------
window.PROP_DRAW = window.PROP_DRAW || {};
const D46 = window.PROP_DRAW;
D46["d46base"] = function (ctx, p, T) {
  ctx.fillStyle = "#d8c9a0";
  ctx.beginPath(); ctx.moveTo(-T * 0.46, T * 0.34); ctx.lineTo(0, -T * 0.42);
  ctx.lineTo(T * 0.46, T * 0.34); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#6a4a2a"; ctx.fillRect(-T * 0.10, T * 0.04, T * 0.20, T * 0.30);
  ctx.fillStyle = "#3a6a8a"; ctx.fillRect(-T * 0.30, T * 0.10, T * 0.14, T * 0.16);
  ctx.fillStyle = "#e8d8a8"; ctx.font = "bold " + (T * 0.12) + "px sans-serif"; ctx.textAlign = "center";
  ctx.fillText("M.E.G", 0, -T * 0.10); ctx.textAlign = "left";
};
D46["d46tent"] = function (ctx, p, T) {
  ctx.fillStyle = "#c0a878";
  ctx.beginPath(); ctx.moveTo(-T * 0.38, T * 0.34); ctx.lineTo(0, -T * 0.34);
  ctx.lineTo(T * 0.38, T * 0.34); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#4a3a24"; ctx.fillRect(-T * 0.08, T * 0.06, T * 0.16, T * 0.28);
};
D46["d46flag"] = function (ctx, p, T) {
  ctx.fillStyle = "#6a5238"; ctx.fillRect(-T * 0.03, -T * 0.42, T * 0.06, T * 0.84);
  ctx.fillStyle = "#b84a4a";
  ctx.beginPath(); ctx.moveTo(T * 0.03, -T * 0.40); ctx.lineTo(T * 0.40, -T * 0.28);
  ctx.lineTo(T * 0.03, -T * 0.14); ctx.closePath(); ctx.fill();
};
D46["d46ruin"] = function (ctx, p, T) {
  ctx.fillStyle = "#a68a5c"; ctx.fillRect(-T * 0.44, -T * 0.10, T * 0.88, T * 0.46);
  ctx.fillStyle = "#8a7048"; ctx.fillRect(-T * 0.44, -T * 0.10, T * 0.88, T * 0.08);
  ctx.fillStyle = "#c2a678"; ctx.fillRect(-T * 0.40, -T * 0.42, T * 0.16, T * 0.36);
  ctx.fillRect(T * 0.24, -T * 0.42, T * 0.16, T * 0.36);
  ctx.fillStyle = "rgba(60,40,20,.30)"; ctx.fillRect(-T * 0.16, T * 0.02, T * 0.32, T * 0.34);
};
D46["d46column"] = function (ctx, p, T) {
  ctx.fillStyle = "#c2a678"; ctx.fillRect(-T * 0.14, -T * 0.40, T * 0.28, T * 0.80);
  ctx.fillStyle = "#a68a5c"; ctx.fillRect(-T * 0.22, -T * 0.44, T * 0.44, T * 0.10);
  ctx.fillStyle = "rgba(255,240,200,.2)"; ctx.fillRect(-T * 0.10, -T * 0.38, T * 0.05, T * 0.76);
};
D46["d46block"] = function (ctx, p, T) {
  ctx.fillStyle = "#ae9264"; ctx.fillRect(-T * 0.36, -T * 0.16, T * 0.72, T * 0.48);
  ctx.strokeStyle = "#8a7048"; ctx.lineWidth = 1.5; ctx.strokeRect(-T * 0.36, -T * 0.16, T * 0.72, T * 0.48);
};
D46["d46office"] = function (ctx, p, T) {
  ctx.fillStyle = "#6a5a44"; ctx.fillRect(-T * 0.30, -T * 0.44, T * 0.60, T * 0.88);
  ctx.fillStyle = "#c8d0cc"; ctx.fillRect(-T * 0.24, -T * 0.38, T * 0.48, T * 0.76);
  ctx.fillStyle = "#3a4a52"; ctx.fillRect(-T * 0.06, -T * 0.02, T * 0.30, T * 0.06);
  ctx.fillStyle = "#d8c078"; ctx.beginPath(); ctx.arc(T * 0.14, T * 0.02, T * 0.03, 0, Math.PI * 2); ctx.fill();
};
D46["d46oasis"] = function (ctx, p, T) {
  ctx.fillStyle = "#4e8a86";
  ctx.beginPath(); ctx.ellipse(0, T * 0.06, T * 0.42, T * 0.30, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(180,225,215,.45)";
  ctx.beginPath(); ctx.ellipse(-T * 0.08, -T * 0.04, T * 0.24, T * 0.12, -0.2, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#d8bd80"; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(0, T * 0.06, T * 0.42, T * 0.30, 0, 0, Math.PI * 2); ctx.stroke();
};
D46["d46palm"] = function (ctx, p, T) {
  ctx.fillStyle = "#7a5a34"; ctx.fillRect(-T * 0.05, -T * 0.10, T * 0.10, T * 0.52);
  ctx.fillStyle = "#3f7a42";
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI + i * Math.PI / 4;
    ctx.save(); ctx.translate(0, -T * 0.14); ctx.rotate(a);
    ctx.beginPath(); ctx.ellipse(T * 0.22, 0, T * 0.24, T * 0.06, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
};
D46["d46scroll"] = function (ctx, p, T) {
  ctx.fillStyle = "#e0cf9c"; ctx.fillRect(-T * 0.34, -T * 0.28, T * 0.68, T * 0.56);
  ctx.fillStyle = "#8a6a3a"; ctx.fillRect(-T * 0.40, -T * 0.32, T * 0.10, T * 0.64);
  ctx.fillRect(T * 0.30, -T * 0.32, T * 0.10, T * 0.64);
  ctx.strokeStyle = "#7a5a30"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(0, 0, T * 0.14, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = "#5a4a2a"; ctx.fillRect(-T * 0.26, -T * 0.18 + i * T * 0.09, T * 0.24, T * 0.02);
  }
};
D46["d46lowg"] = function (ctx, p, T) {
  const t = performance.now() / 700;
  ctx.fillStyle = "rgba(180,210,230,.28)";
  ctx.beginPath(); ctx.ellipse(0, 0, T * 0.40, T * 0.24, 0, 0, Math.PI * 2); ctx.fill();
  for (let i = 0; i < 6; i++) {
    const y = (i * 11 + t * 14) % T * 0.6 - T * 0.3;
    ctx.fillStyle = "rgba(230,210,160,.6)";
    ctx.fillRect(-T * 0.24 + i * T * 0.08, -y, T * 0.04, T * 0.04);
  }
};
D46["d46spirit"] = function (ctx, p, T) {
  if (p.d46gone) return;
  const g = window.__game;
  if (g && !g.d46storm) return;
  const t = performance.now() / 300;
  ctx.fillStyle = "rgba(206,168,100,.75)";
  ctx.beginPath();
  ctx.moveTo(0, -T * 0.42);
  ctx.quadraticCurveTo(T * 0.30 + Math.sin(t) * T * 0.06, -T * 0.10, T * 0.18, T * 0.42);
  ctx.lineTo(-T * 0.18, T * 0.42);
  ctx.quadraticCurveTo(-T * 0.30 + Math.cos(t) * T * 0.06, -T * 0.10, 0, -T * 0.42);
  ctx.fill();
  ctx.fillStyle = "#5a3a1a";
  ctx.beginPath(); ctx.arc(-T * 0.08, -T * 0.22, T * 0.035, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(T * 0.08, -T * 0.22, T * 0.035, 0, Math.PI * 2); ctx.fill();
};
D46["d46rock"] = function (ctx, p, T) {
  ctx.fillStyle = "#a68a5c";
  ctx.beginPath(); ctx.moveTo(-T * 0.34, T * 0.30); ctx.lineTo(-T * 0.18, -T * 0.22);
  ctx.lineTo(T * 0.20, -T * 0.28); ctx.lineTo(T * 0.34, T * 0.30); ctx.closePath(); ctx.fill();
};
D46["d46bone"] = function (ctx, p, T) {
  ctx.strokeStyle = "#e0d2ac"; ctx.lineWidth = Math.max(2, T * 0.06);
  ctx.beginPath(); ctx.moveTo(-T * 0.28, T * 0.16); ctx.lineTo(T * 0.26, -T * 0.10); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-T * 0.26, -T * 0.12); ctx.lineTo(T * 0.28, T * 0.14); ctx.stroke();
};
