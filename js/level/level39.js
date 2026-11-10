// ===========================================================
// Level 39 —— 魔法森林
//   有限的圆形层级，永恒的黄昏；蜿蜒泥泞小道两边是广袤橡树林。
//   树不可移动、不可摧毁，是层级本身的一部分。中心催眠最强、
//   边界趋近于零；一小口杏仁水就能解除。边界阴冷、飓风雷暴不断。
//   出口：切出山丘 → 63；边界那座桥 → 63.3。入口：797 岩壁洞口。
// ===========================================================
"use strict";

(function () {
  const v = ["#6a5636", "#3f4b2c"];
  if (typeof regTile === "function") regTile("forest39", v);
  else (window.__NEWTILE_EXTRA = window.__NEWTILE_EXTRA || {})["forest39"] = v;
})();

function f39Hash(x, y) {
  let h = ((x | 0) * 374761393 + (y | 0) * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) | 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function generateForest39Map(level) {
  const size = 112, grid = makeGrid(size);
  const cx = size >> 1, cy = size >> 1, R = 50;
  const border = new Set();
  // 蜿蜒小道：8 条从中心向外扭折的辐射路 + 3 圈闭合线圈（档案里的"无效闭合线圈和曲圆"）
  const carve = (x, y, w) => {
    for (let dy = -w; dy <= w; dy++) for (let dx = -w; dx <= w; dx++) {
      const nx = x + dx, ny = y + dy;
      if (nx < 2 || ny < 2 || nx >= size - 2 || ny >= size - 2) continue;
      if ((nx - cx) ** 2 + (ny - cy) ** 2 > R * R) continue;
      grid[ny][nx] = 0;
    }
  };
  for (let k = 0; k < 8; k++) {
    const a0 = k * Math.PI / 4 + (Math.random() - 0.5) * 0.5;
    let x = cx, y = cy, a = a0;
    for (let s = 0; s < 62; s++) {
      a += (Math.random() - 0.5) * 0.34 + Math.sin(s * 0.16 + k) * 0.07;
      x += Math.cos(a) * 1.1; y += Math.sin(a) * 1.1;
      carve(Math.round(x), Math.round(y), 1);
    }
  }
  for (const rr of [16, 30, 43]) {
    for (let t = 0; t < 720; t++) {
      const a = t / 720 * Math.PI * 2;
      const r = rr + Math.sin(a * 3 + rr) * 2.6 + Math.cos(a * 5) * 1.4;
      carve(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r), 1);
    }
  }
  // 出生点附近保证一小块空地
  carve(cx, cy, 3);
  // 只保留从出生点走得到的地板，其余重新长成树林（不留孤岛）
  const seen = new Uint8Array(size * size);
  const q = [cy * size + cx]; seen[cy * size + cx] = 1;
  while (q.length) {
    const i = q.pop(), x = i % size, y = (i / size) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue;
      const j = ny * size + nx;
      if (seen[j] || grid[ny][nx] !== 0) continue;
      seen[j] = 1; q.push(j);
    }
  }
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    if (grid[y][x] === 0 && !seen[y * size + x]) grid[y][x] = 1;
    const d = Math.hypot(x - cx, y - cy);
    if (d > 40) border.add(x + "," + y);
  }
  const floors = collectFloors(grid, size);
  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [[]],
    start: { x: cx, y: cy, floor: 0 },
    exit: null, doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props: [], crates: [], ground: [], spawnPts: [{ x: cx, y: cy, floor: 0 }],
    f39border: border, f39cx: cx, f39cy: cy, wander: null,
  };
  makeDoorsMap(map);
  const P = (x, y, type, extra) => map.props.push(Object.assign({ x, y, floor: 0, type }, extra || {}));
  const onFloor = (x, y) => grid[y] && grid[y][x] === 0;
  const findSpot = (pred) => {
    const c = floors.filter(pred);
    return c.length ? c[Math.floor(Math.random() * c.length)] : floors[0];
  };
  // 出口：切出山丘（中圈）→ 63；边界桥梁 → 63.3
  const hill = findSpot(f => { const d = Math.hypot(f.x - cx, f.y - cy); return d > 26 && d < 34; });
  P(hill.x, hill.y, "f39hill", { toLevel: 63, tip: "一道突然隆起的山丘 —— 坡面不太对劲" });
  const br = findSpot(f => Math.hypot(f.x - cx, f.y - cy) > 44);
  P(br.x, br.y, "f39bridge", { toLevel: "63.3", tip: "边界地带一座窄木桥，架在阴云底下" });
  // 池塘（不超过 5 格）、可食用的小菌、落叶 / 苔藓 / 砾石
  for (let i = 0; i < 7; i++) {
    const s = findSpot(f => f39Hash(f.x + i * 31, f.y) > 0.55);
    P(s.x, s.y, "f39pond", { iKind: "f39pond" });
  }
  for (let i = 0; i < 16; i++) {
    const s = findSpot(f => f39Hash(f.x + i * 7, f.y + 3) > 0.4);
    P(s.x, s.y, "f39mush", { iKind: "f39mush" });
  }
  for (let i = 0; i < 60; i++) {
    const s = floors[Math.floor(Math.random() * floors.length)];
    P(s.x, s.y, ["f39leaf", "f39moss", "f39gravel"][i % 3]);
  }
  // 边界上的无叶枯树（装饰）
  for (let i = 0; i < 30; i++) {
    const s = floors[Math.floor(Math.random() * floors.length)];
    if (Math.hypot(s.x - cx, s.y - cy) > 40) P(s.x, s.y, "f39deadtree");
  }
  return map;
}
window.generateForest39Map = generateForest39Map;

// ---------- 每帧：催眠 / 杏仁水解除 / 边界飓风 ----------
window.__LEVEL_TICK = window.__LEVEL_TICK || {};
window.__LEVEL_TICK["39"] = function (g, dt) {
  dt = dt || 0.016;
  window.__B2_enter(g, "39", () => { g.f39clear = 0; g.f39warned = false; g.f39almond = null; });
  const m = g.map, inv = g.inv || {};
  const prev = g.f39almond;
  g.f39almond = inv.almond | 0;
  if (prev != null && g.f39almond < prev) {
    g.f39clear = 90;
    window.__toast("一小口杏仁水 —— 那股不自然的平静退下去了");
  }
  if (g.f39clear > 0) { g.f39clear -= dt; return; }
  const d = Math.hypot(g.player.x / 40 - m.f39cx, g.player.y / 40 - m.f39cy);
  // 中心最强，边界趋近于零
  const pull = Math.max(0, 1 - d / 44);
  if (pull > 0.05) {
    g.sanity = Math.max(0, (g.sanity || 0) - pull * 0.55 * dt);
    if (!g.f39warned && pull > 0.55) {
      g.f39warned = true;
      window.__toast("这里安静得不对劲 —— 你开始觉得，留在这儿也挺好 · 一口杏仁水能醒过来");
    }
  }
  // 边界：飓风、龙卷、雷暴，风把人往里推
  if (d > 43) {
    g.stamina = Math.max(0, (g.stamina || 0) - 0.5 * dt);
    if (!g.f39wind) { g.f39wind = true; window.__toast("风忽然大得站不稳 —— 边界的树都没有叶子"); }
  } else g.f39wind = false;
};

// ---------- 地面 / 墙 ----------
window.drawForest39Floor = function (ctx, px, py, S, map, tx, ty) {
  const r = f39Hash(tx, ty);
  ctx.fillStyle = r < 0.5 ? "#6d5a3a" : "#655237";
  ctx.fillRect(px, py, S, S);
  // 泥泞小道：湿泥的深色斑 + 浅水反光
  ctx.fillStyle = "rgba(50,40,26,.35)";
  ctx.beginPath(); ctx.ellipse(px + S * (0.3 + r * 0.4), py + S * 0.6, S * 0.24, S * 0.12, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(190,205,180,.12)";
  ctx.fillRect(px + S * 0.18, py + S * 0.72, S * 0.30, S * 0.04);
  // 落叶 / 苔藓 / 砾石
  if (r > 0.72) { ctx.fillStyle = "#8a6a3c"; ctx.fillRect(px + S * 0.2, py + S * 0.2, S * 0.16, S * 0.07); }
  else if (r > 0.4) { ctx.fillStyle = "#4f6a3a"; ctx.fillRect(px + S * 0.62, py + S * 0.3, S * 0.20, S * 0.10); }
  else { ctx.fillStyle = "#8a8070"; ctx.fillRect(px + S * 0.5, py + S * 0.5, S * 0.09, S * 0.08); }
  return true;
};
window.drawForest39Wall = function (ctx, px, py, S, map, tx, ty) {
  const isBorder = map.f39border && map.f39border.has(tx + "," + ty);
  // 底层是深绿的林下，不是黑
  ctx.fillStyle = isBorder ? "#4a4a44" : "#33472b";
  ctx.fillRect(px, py, S, S);
  // 橡树干：粗、直、有竖纹
  ctx.fillStyle = isBorder ? "#6b6256" : "#5a4028";
  ctx.fillRect(px + S * 0.28, py, S * 0.44, S);
  ctx.fillStyle = isBorder ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.22)";
  ctx.fillRect(px + S * 0.42, py, S * 0.08, S);
  // 树冠：边界无叶，只剩交错的枝
  if (isBorder) {
    ctx.strokeStyle = "#7a7266"; ctx.lineWidth = Math.max(1, S * 0.05);
    ctx.beginPath(); ctx.moveTo(px + S * 0.5, py + S * 0.4); ctx.lineTo(px + S * 0.12, py + S * 0.1);
    ctx.moveTo(px + S * 0.5, py + S * 0.4); ctx.lineTo(px + S * 0.9, py + S * 0.16); ctx.stroke();
  } else {
    const r = f39Hash(tx + 11, ty + 7);
    ctx.fillStyle = r < 0.5 ? "#3e6234" : "#476f38";
    ctx.beginPath(); ctx.arc(px + S * 0.5, py + S * 0.28, S * 0.46, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(150,190,110,.18)";
    ctx.beginPath(); ctx.arc(px + S * 0.36, py + S * 0.18, S * 0.20, 0, Math.PI * 2); ctx.fill();
  }
  return true;
};

// ---------- 整屏：永恒黄昏 + 天体 + 边界风暴 ----------
window.__B2_OVL["39"] = function (ctx, g) {
  const cw = ctx.canvas.width, ch = ctx.canvas.height;
  ctx.save();
  try { ctx.setTransform(1, 0, 0, 1, 0, 0); } catch (e) { /* 忽略 */ }
  ctx.fillStyle = "rgba(224,142,78,.075)";
  ctx.fillRect(0, 0, cw, ch);
  ctx.fillStyle = "rgba(92,62,110,.06)";
  ctx.fillRect(0, 0, cw, ch * 0.45);
  // 天体正常出现，但并不真正在层级内 —— 画成一个不随镜头动的低垂夕阳
  ctx.fillStyle = "rgba(255,206,130,.10)";
  ctx.beginPath(); ctx.arc(cw * 0.82, ch * 0.22, Math.min(cw, ch) * 0.10, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(255,222,160,.14)";
  ctx.beginPath(); ctx.arc(cw * 0.82, ch * 0.22, Math.min(cw, ch) * 0.06, 0, Math.PI * 2); ctx.fill();
  if (g.f39wind) {
    const t = performance.now() / 1000;
    ctx.strokeStyle = "rgba(220,228,214,.22)"; ctx.lineWidth = 2;
    for (let i = 0; i < 14; i++) {
      const y = (i * 71 + t * 260) % ch;
      ctx.beginPath(); ctx.moveTo(-40, y); ctx.lineTo(cw + 40, y - 26); ctx.stroke();
    }
    if (Math.sin(t * 2.1) > 0.985) {
      ctx.fillStyle = "rgba(230,236,255,.18)"; ctx.fillRect(0, 0, cw, ch);
    }
  }
  ctx.restore();
};

// ---------- 交互 ----------
window.__B2_hint(["f39pond", "f39mush"], function (n, g) {
  switch (n.kind) {
    case "f39pond": return "一处浅池塘，不到五米宽，水刚没过脚踝 · 按 E 洗把脸";
    case "f39mush": return "浅草里一簇很小的可食用菌 · 按 E 采下来";
  }
  return null;
});
window.__B2_act(["f39pond", "f39mush"], function (n, g) {
  switch (n.kind) {
    case "f39pond":
      g.sanity = Math.min(100, (g.sanity || 0) + 4);
      window.__toast("凉水没过脚踝 —— 脑子清明了一点（理智 +4）");
      return true;
    case "f39mush":
      g.stamina = Math.min(100, (g.stamina || 0) + 8);
      window.__toast("小菌子没什么味道，但能顶一阵（体力 +8）");
      return true;
  }
  return false;
});

// ---------- 物件外观 ----------
window.PROP_DRAW = window.PROP_DRAW || {};
const F39 = window.PROP_DRAW;
F39["f39hill"] = function (ctx, p, T) {
  ctx.fillStyle = "#7a6a42";
  ctx.beginPath(); ctx.moveTo(-T * 0.46, T * 0.4); ctx.quadraticCurveTo(0, -T * 0.45, T * 0.46, T * 0.4); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "rgba(180,205,150,.28)";
  ctx.beginPath(); ctx.moveTo(-T * 0.30, T * 0.4); ctx.quadraticCurveTo(0, -T * 0.24, T * 0.30, T * 0.4); ctx.closePath(); ctx.fill();
  // 不太对劲的折面
  ctx.strokeStyle = "rgba(240,220,180,.55)"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, -T * 0.32); ctx.lineTo(T * 0.12, T * 0.36); ctx.stroke();
};
F39["f39bridge"] = function (ctx, p, T) {
  ctx.fillStyle = "#6a5238";
  ctx.fillRect(-T * 0.48, -T * 0.10, T * 0.96, T * 0.28);
  ctx.fillStyle = "#8a6c48";
  for (let i = 0; i < 4; i++) ctx.fillRect(-T * 0.44 + i * T * 0.24, -T * 0.10, T * 0.04, T * 0.28);
  ctx.strokeStyle = "#c4a878"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-T * 0.46, -T * 0.28); ctx.lineTo(T * 0.46, -T * 0.28); ctx.stroke();
};
F39["f39pond"] = function (ctx, p, T) {
  ctx.fillStyle = "#4a6a5a";
  ctx.beginPath(); ctx.ellipse(0, 0, T * 0.42, T * 0.30, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(170,205,205,.38)";
  ctx.beginPath(); ctx.ellipse(-T * 0.08, -T * 0.06, T * 0.28, T * 0.16, -0.2, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#8a7a50"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(0, 0, T * 0.42, T * 0.30, 0, 0, Math.PI * 2); ctx.stroke();
};
F39["f39mush"] = function (ctx, p, T) {
  for (let i = 0; i < 3; i++) {
    const x = -T * 0.20 + i * T * 0.18, y = T * (0.10 - (i % 2) * 0.10);
    ctx.fillStyle = "#ece0c0"; ctx.fillRect(x - T * 0.025, y, T * 0.05, T * 0.16);
    ctx.fillStyle = i === 1 ? "#c86a4a" : "#d8a85a";
    ctx.beginPath(); ctx.ellipse(x, y, T * 0.09, T * 0.06, 0, Math.PI, Math.PI * 2); ctx.fill();
  }
};
F39["f39leaf"] = function (ctx, p, T) {
  ctx.fillStyle = "#9a7438";
  for (let i = 0; i < 3; i++) {
    ctx.save(); ctx.translate(-T * 0.2 + i * T * 0.2, T * (0.1 - i * 0.08)); ctx.rotate(i);
    ctx.beginPath(); ctx.ellipse(0, 0, T * 0.10, T * 0.04, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
};
F39["f39moss"] = function (ctx, p, T) {
  ctx.fillStyle = "#4f6a3a";
  ctx.beginPath(); ctx.ellipse(0, 0, T * 0.32, T * 0.20, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(150,190,110,.3)";
  ctx.beginPath(); ctx.ellipse(-T * 0.1, -T * 0.06, T * 0.16, T * 0.08, 0, 0, Math.PI * 2); ctx.fill();
};
F39["f39gravel"] = function (ctx, p, T) {
  ctx.fillStyle = "#9a9280";
  for (let i = 0; i < 5; i++) {
    ctx.beginPath(); ctx.arc(-T * 0.24 + f39Hash(p.x + i, p.y) * T * 0.48,
      -T * 0.18 + f39Hash(p.y + i, p.x) * T * 0.36, T * 0.045, 0, Math.PI * 2); ctx.fill();
  }
};
F39["f39deadtree"] = function (ctx, p, T) {
  ctx.strokeStyle = "#7a7266"; ctx.lineWidth = Math.max(2, T * 0.06);
  ctx.beginPath(); ctx.moveTo(0, T * 0.42); ctx.lineTo(0, -T * 0.24);
  ctx.moveTo(0, -T * 0.06); ctx.lineTo(-T * 0.24, -T * 0.34);
  ctx.moveTo(0, -T * 0.14); ctx.lineTo(T * 0.22, -T * 0.38); ctx.stroke();
};
