// ===========================================================
// Level 797 —— 少有人走的路
//   一条覆着植被的石路，两边是茂密得最好别进的森林。路边岩壁上有
//   可进入的石窟，各通往不同层级。地标：废弃大坝、林间前哨站（白色
//   平房，物资取之不尽）、尽头的海湾（未证实）。有昼夜、多云、雾风雨。
//   出口：石窟 → Level 10 / 39 / 63。入口：从 Level 63 掉进虚空。
// ===========================================================
"use strict";

(function () {
  const v = ["#8a8878", "#33472f"];
  if (typeof regTile === "function") regTile("path797", v);
  else (window.__NEWTILE_EXTRA = window.__NEWTILE_EXTRA || {})["path797"] = v;
})();

function p797Hash(x, y) {
  let h = ((x | 0) * 374761393 + (y | 0) * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) | 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function generatePath797Map(level) {
  const size = 120, grid = makeGrid(size);
  const roadY = (x) => 60 + Math.round(Math.sin(x * 0.055) * 7 + Math.sin(x * 0.13) * 2);
  // 主石路：5 格宽，横贯全图
  for (let x = 3; x < size - 3; x++) {
    const y = roadY(x);
    for (let d = -2; d <= 2; d++) grid[y + d][x] = 0;
  }
  // 通向岩壁石窟的短支路（北 3 条、南 3 条）
  const branch = [];
  for (const bx of [18, 42, 68, 94, 108, 30]) {
    const dir = bx % 2 ? -1 : 1;
    const y0 = roadY(bx) + dir * 2;
    for (let k = 0; k < 12; k++) {
      const y = y0 + dir * k;
      for (let d = -1; d <= 1; d++) grid[y][bx + d] = 0;
    }
    branch.push({ x: bx, y: y0 + dir * 11, dir });
  }
  // 大坝 / 前哨站 / 海湾各自拓一小块空地
  const clear = (x, y, w, h) => {
    for (let yy = y - h; yy <= y + h; yy++) for (let xx = x - w; xx <= x + w; xx++)
      if (xx > 1 && yy > 1 && xx < size - 2 && yy < size - 2) grid[yy][xx] = 0;
  };
  clear(30, roadY(30) - 13, 9, 6);
  clear(62, roadY(62) + 14, 8, 6);
  clear(112, roadY(112), 5, 5);
  const floors = collectFloors(grid, size);
  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [[]],
    start: { x: 8, y: roadY(8), floor: 0 },
    exit: null, doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props: [], crates: [], ground: [], spawnPts: [{ x: 8, y: roadY(8), floor: 0 }],
    p797t: 0, wander: null,
  };
  makeDoorsMap(map);
  const P = (x, y, type, extra) => map.props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));

  // 三个地标
  P(30, roadY(30) - 13, "p797dam", { iKind: "p797dam" });
  P(62, roadY(62) + 14, "p797cabin", { iKind: "p797cabin" });
  P(112, roadY(112), "p797bay", { iKind: "p797bay" });
  // 石窟：每个洞口通向不同层级
  const dests = [10, 39, 63, 10, 39, 63];
  branch.forEach((b, i) => {
    P(b.x, b.y, "p797grotto", {
      toLevel: dests[i], iKind: "p797grotto",
      tip: "岩壁上一个黑洞洞的石窟 —— 洞口标着「Level " + dests[i] + "」",
    });
  });
  // 路边岩石、植被、路标
  for (let i = 0; i < 70; i++) {
    const x = 5 + Math.floor(Math.random() * (size - 10));
    const y = roadY(x) + (Math.random() < 0.5 ? -3 : 3);
    if (grid[y] && grid[y][x] === 1) P(x, y, Math.random() < 0.45 ? "p797rock" : "p797bush");
  }
  for (const x of [24, 52, 80, 100]) P(x, roadY(x) - 3, "p797sign");
  return map;
}
window.generatePath797Map = generatePath797Map;

// ---------- 每帧：昼夜与天气 ----------
window.__LEVEL_TICK = window.__LEVEL_TICK || {};
window.__LEVEL_TICK["797"] = function (g, dt) {
  window.__B2_enter(g, "797", () => { g.p797t = 0; g.p797weather = -1; });
  g.p797t = (g.p797t || 0) + (dt || 0.016);
  const phase = Math.floor(g.p797t / 45) % 4;
  if (phase !== g.p797weather) {
    g.p797weather = phase;
    const L = ["天亮了，云还是压着", "起雾了 —— 路两边的树只剩轮廓", "风一阵紧似一阵", "下起雨来，石板上泛着水光"];
    window.__toast(L[phase]);
  }
};

// ---------- 地面 / 森林墙 ----------
window.drawPath797Floor = function (ctx, px, py, S, map, tx, ty) {
  const r = p797Hash(tx, ty);
  ctx.fillStyle = r < 0.5 ? "#8e8c7c" : "#848274";
  ctx.fillRect(px, py, S, S);
  // 不规则石板缝
  ctx.strokeStyle = "rgba(58,56,48,.45)"; ctx.lineWidth = 1.4;
  ctx.strokeRect(px + S * 0.08, py + S * 0.08, S * 0.84, S * 0.84);
  ctx.beginPath(); ctx.moveTo(px + S * 0.5, py + S * 0.08); ctx.lineTo(px + S * 0.5, py + S * 0.92); ctx.stroke();
  // 缝里的苔藓与植被
  if (r > 0.55) { ctx.fillStyle = "rgba(74,108,58,.65)"; ctx.fillRect(px + S * 0.08, py + S * 0.08, S * 0.12, S * 0.84); }
  if (r < 0.25) { ctx.fillStyle = "rgba(120,138,86,.4)"; ctx.fillRect(px + S * 0.6, py + S * 0.3, S * 0.2, S * 0.16); }
  return true;
};
window.drawPath797Wall = function (ctx, px, py, S, map, tx, ty) {
  // 茂密森林：深绿底，不是黑
  ctx.fillStyle = "#2f4630"; ctx.fillRect(px, py, S, S);
  const r = p797Hash(tx + 5, ty + 9);
  ctx.fillStyle = r < 0.5 ? "#3b5a34" : "#40613a";
  ctx.beginPath(); ctx.arc(px + S * 0.5, py + S * 0.44, S * 0.46, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#4a3a26"; ctx.fillRect(px + S * 0.42, py + S * 0.55, S * 0.16, S * 0.45);
  ctx.fillStyle = "rgba(170,205,140,.16)";
  ctx.beginPath(); ctx.arc(px + S * 0.32, py + S * 0.26, S * 0.20, 0, Math.PI * 2); ctx.fill();
  if (r > 0.72) { // 藤蔓垂下来
    ctx.strokeStyle = "rgba(110,150,80,.6)"; ctx.lineWidth = Math.max(1, S * 0.04);
    ctx.beginPath(); ctx.moveTo(px + S * 0.2, py); ctx.lineTo(px + S * 0.3, py + S * 0.5); ctx.stroke();
  }
  return true;
};

// ---------- 整屏：昼夜 / 雾 / 雨 ----------
window.__B2_OVL["797"] = function (ctx, g) {
  const cw = ctx.canvas.width, ch = ctx.canvas.height;
  const w = g.p797weather | 0;
  ctx.save();
  try { ctx.setTransform(1, 0, 0, 1, 0, 0); } catch (e) { /* 忽略 */ }
  const day = (g.p797t || 0) % 90 < 45;
  ctx.fillStyle = day ? "rgba(255,232,180,.05)" : "rgba(40,60,110,.20)";
  ctx.fillRect(0, 0, cw, ch);
  if (w === 1) {
    ctx.fillStyle = "rgba(214,220,214,.16)"; ctx.fillRect(0, 0, cw, ch);
  } else if (w === 2) {
    ctx.strokeStyle = "rgba(230,236,220,.16)"; ctx.lineWidth = 2;
    for (let i = 0; i < 9; i++) {
      const y = (i * 89 + (performance.now() / 6)) % ch;
      ctx.beginPath(); ctx.moveTo(-30, y); ctx.lineTo(cw + 30, y - 18); ctx.stroke();
    }
  } else if (w === 3) {
    ctx.strokeStyle = "rgba(190,215,235,.28)"; ctx.lineWidth = 1.4;
    const t = performance.now() / 3;
    for (let i = 0; i < 60; i++) {
      const x = (i * 97 + t) % cw, y = (i * 53 + t * 2) % ch;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 3, y + 11); ctx.stroke();
    }
  }
  ctx.restore();
};

// ---------- 交互 ----------
window.__B2_hint(["p797dam", "p797cabin", "p797bay", "p797grotto"], function (n, g) {
  switch (n.kind) {
    case "p797dam": return "一座废弃大坝，金属栅栏把整个设施围了起来 · 按 E 隔着栅栏看一眼";
    case "p797cabin": return "林间前哨站 —— 白色平房，两间屋，有电、饮用水和用不完的物资 · 按 E 取补给";
    case "p797bay": return "路的尽头据说有一片海湾 —— M.E.G 还没查证 · 按 E 望一望";
    case "p797grotto": return "岩壁上一个黑洞洞的石窟 · 按 E 钻进去（→ Level " + n.p.toLevel + "）";
  }
  return null;
});
window.__B2_act(["p797dam", "p797cabin", "p797bay", "p797grotto"], function (n, g) {
  switch (n.kind) {
    case "p797dam":
      window.__toast("栅栏锁着。坝体里黑沉沉的，听不见水声 —— 里面什么情况，没人进去看过");
      return true;
    case "p797cabin": {
      const inv = g.inv || (g.inv = {});
      inv.almond = (inv.almond | 0) + 1;
      inv.choc = (inv.choc | 0) + 1;
      inv.energybar = (inv.energybar | 0) + 1;
      g.sanity = Math.min(100, (g.sanity || 0) + 8);
      window.__toast("屋里没人，货架却一直是满的：水、饼干、薯片、急救包、钉子、便利贴、乐器、画材……（杏仁水 / 巧克力 / 能量棒 +1）");
      return true;
    }
    case "p797bay":
      window.__toast("路在这里断了。雾底下像是有水，可怎么看都看不真切 —— 这份记录还没被证实");
      return true;
    case "p797grotto": {
      const to = n.p.toLevel;
      window.__toast("钻进石窟 —— 石头擦着肩膀，出来时已经是 Level " + to);
      if (window.__goToLevel) window.__goToLevel(to);
      return true;
    }
  }
  return false;
});

// ---------- 物件外观 ----------
window.PROP_DRAW = window.PROP_DRAW || {};
const P797 = window.PROP_DRAW;
P797["p797dam"] = function (ctx, p, T) {
  ctx.fillStyle = "#7c807c"; ctx.fillRect(-T * 0.46, -T * 0.28, T * 0.92, T * 0.56);
  ctx.fillStyle = "#5c625e"; ctx.fillRect(-T * 0.46, T * 0.10, T * 0.92, T * 0.18);
  ctx.strokeStyle = "#3e4440"; ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath(); ctx.moveTo(-T * 0.46 + i * T * 0.184, -T * 0.34);
    ctx.lineTo(-T * 0.46 + i * T * 0.184, T * 0.34); ctx.stroke();
  }
  ctx.fillStyle = "rgba(90,130,150,.35)"; ctx.fillRect(-T * 0.46, T * 0.28, T * 0.92, T * 0.12);
};
P797["p797cabin"] = function (ctx, p, T) {
  ctx.fillStyle = "#e8e6dc"; ctx.fillRect(-T * 0.44, -T * 0.26, T * 0.88, T * 0.62);
  ctx.fillStyle = "#8a5a3a";
  ctx.beginPath(); ctx.moveTo(-T * 0.5, -T * 0.26); ctx.lineTo(0, -T * 0.48);
  ctx.lineTo(T * 0.5, -T * 0.26); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#6ba0c0"; ctx.fillRect(-T * 0.30, -T * 0.12, T * 0.18, T * 0.20);
  ctx.fillRect(T * 0.12, -T * 0.12, T * 0.18, T * 0.20);
  ctx.fillStyle = "#6a4a2a"; ctx.fillRect(-T * 0.06, T * 0.10, T * 0.14, T * 0.26);
  ctx.fillStyle = "rgba(255,228,150,.35)";
  ctx.beginPath(); ctx.arc(0, T * 0.02, T * 0.52, 0, Math.PI * 2); ctx.fill();
};
P797["p797bay"] = function (ctx, p, T) {
  ctx.fillStyle = "#4e7286"; ctx.fillRect(-T * 0.46, -T * 0.06, T * 0.92, T * 0.44);
  ctx.fillStyle = "rgba(200,220,230,.30)"; ctx.fillRect(-T * 0.46, -T * 0.06, T * 0.92, T * 0.08);
  ctx.fillStyle = "rgba(230,236,230,.35)";
  ctx.beginPath(); ctx.ellipse(0, -T * 0.20, T * 0.46, T * 0.16, 0, 0, Math.PI * 2); ctx.fill();
};
P797["p797grotto"] = function (ctx, p, T) {
  ctx.fillStyle = "#5a5a52";
  ctx.beginPath(); ctx.ellipse(0, T * 0.06, T * 0.40, T * 0.44, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#1c2024";
  ctx.beginPath(); ctx.ellipse(0, T * 0.08, T * 0.26, T * 0.34, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "rgba(190,180,150,.55)"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(0, T * 0.06, T * 0.40, T * 0.44, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = "#d8c88a"; ctx.font = "bold " + (T * 0.13) + "px sans-serif"; ctx.textAlign = "center";
  ctx.fillText("L" + p.toLevel, 0, -T * 0.30); ctx.textAlign = "left";
};
P797["p797rock"] = function (ctx, p, T) {
  ctx.fillStyle = "#8a8878";
  ctx.beginPath(); ctx.moveTo(-T * 0.40, T * 0.32); ctx.lineTo(-T * 0.22, -T * 0.24);
  ctx.lineTo(T * 0.18, -T * 0.32); ctx.lineTo(T * 0.40, T * 0.32); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.18)";
  ctx.beginPath(); ctx.moveTo(-T * 0.22, -T * 0.24); ctx.lineTo(T * 0.18, -T * 0.32);
  ctx.lineTo(T * 0.05, -T * 0.10); ctx.closePath(); ctx.fill();
};
P797["p797bush"] = function (ctx, p, T) {
  ctx.fillStyle = "#3e6a38";
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.arc(-T * 0.20 + i * T * 0.20, T * (0.06 - (i % 2) * 0.10), T * 0.20, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = "rgba(160,200,120,.24)";
  ctx.beginPath(); ctx.arc(-T * 0.16, -T * 0.08, T * 0.10, 0, Math.PI * 2); ctx.fill();
};
P797["p797sign"] = function (ctx, p, T) {
  ctx.fillStyle = "#6a4a2a"; ctx.fillRect(-T * 0.04, -T * 0.10, T * 0.08, T * 0.48);
  ctx.fillStyle = "#d8c89a"; ctx.fillRect(-T * 0.34, -T * 0.34, T * 0.68, T * 0.26);
  ctx.strokeStyle = "#7a6038"; ctx.lineWidth = 1.5; ctx.strokeRect(-T * 0.34, -T * 0.34, T * 0.68, T * 0.26);
  ctx.fillStyle = "#4a3a22"; ctx.fillRect(-T * 0.24, -T * 0.26, T * 0.48, T * 0.03);
  ctx.fillRect(-T * 0.24, -T * 0.18, T * 0.32, T * 0.03);
};
