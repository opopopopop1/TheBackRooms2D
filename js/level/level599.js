// ===========================================================
// Level 599 —— 群星
//   恒星的内部。一片持续进行核聚变的超热等离子海洋。
//   这一层无法安全进入 —— 只能透过 Level 78 的舷窗从外面看。
//   你一旦站进来，就只剩几秒钟。
//   它还在发着无线电：多数时候是噪音，偶尔会变成音乐，
//   偶尔会变成人类的语言。
// ===========================================================
"use strict";

(function () {
  const v = ["#f0c070", "#e8a850", "#ffdca0"];
  if (typeof regTile === "function") regTile("star599", v);
  else { (window.__NEWTILE_EXTRA = window.__NEWTILE_EXTRA || {})["star599"] = v; }
})();

function generateStar599Map(level) {
  const size = 40;
  const grid = makeGrid(size);
  const props = [];
  // 没有房间、没有走廊 —— 一整片等离子。只有最外一圈是"岸"（也是等离子，更亮）。
  for (let y = 1; y < size - 1; y++) for (let x = 1; x < size - 1; x++) grid[y][x] = 0;
  for (let i = 0; i < size; i++) {
    grid[0][i] = 1; grid[size - 1][i] = 1; grid[i][0] = 1; grid[i][size - 1] = 1;
  }
  // 黑子：温度低一点的地方，看得见轮廓（不然整片糊成一块白）
  const spots = new Set();
  for (let k = 0; k < 7; k++) {
    const sx = randInt(6, size - 7), sy = randInt(6, size - 7), rr = randInt(2, 4);
    for (let y = sy - rr; y <= sy + rr; y++) for (let x = sx - rr; x <= sx + rr; x++) {
      if (x > 0 && y > 0 && x < size - 1 && y < size - 1 && Math.hypot(x - sx, y - sy) <= rr) spots.add(x + "," + y);
    }
  }
  const floors = collectFloors(grid, size);
  const start = { x: (size >> 1), y: (size >> 1), floor: 0 };
  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [],
    spots599: spots,
    pools: new Set(),
  };
  makeDoorsMap(map);
  return map;
}
window.generateStar599Map = generateStar599Map;

// ---------- 地面：翻滚的等离子 ----------
window.drawStarFloor = function (ctx, px, py, S, map, tx, ty) {
  const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
  const k = tx + "," + ty;
  const spot = map.spots599 && map.spots599.has(k);
  // 底：金白
  const w1 = 0.5 + 0.5 * Math.sin(t * 1.1 + tx * 0.6 + ty * 0.35);
  const w2 = 0.5 + 0.5 * Math.sin(t * 0.7 - tx * 0.3 + ty * 0.8);
  const base = spot ? 190 : 232 + Math.round(18 * w1);
  const r = Math.min(255, base + Math.round(20 * w2));
  const g = Math.min(255, (spot ? 120 : 176) + Math.round(40 * w1));
  const b = Math.min(255, (spot ? 70 : 96) + Math.round(50 * w2));
  ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
  ctx.fillRect(px, py, S, S);
  // 米粒组织：一格一格的对流胞
  const cell = ((tx * 3 + ty * 5 + Math.floor(t * 1.6)) % 3);
  ctx.fillStyle = "rgba(255,236,180," + (0.10 + 0.10 * cell).toFixed(3) + ")";
  ctx.fillRect(px + 2, py + 2, S - 4, S - 4);
  if (spot) {
    ctx.fillStyle = "rgba(120,60,20,0.35)";
    ctx.fillRect(px + 3, py + 3, S - 6, S - 6);
  }
  // 偶尔一条亮起来的火舌
  if (((tx * 7 + ty * 11 + Math.floor(t * 2.2)) % 13) === 0) {
    ctx.fillStyle = "rgba(255,255,240,0.55)";
    ctx.fillRect(px, py + S * 0.3, S, S * 0.16);
  }
  return true;
};

// ---------- 墙：更亮的一圈（这里是"岸"，也是等离子）----------
window.drawStarWall = function (ctx, px, py, S, map, tx, ty) {
  const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
  const w = 0.5 + 0.5 * Math.sin(t * 0.9 + tx * 0.4 + ty * 0.5);
  const r = 255;
  const g = Math.min(255, 210 + Math.round(30 * w));
  const b = Math.min(255, 150 + Math.round(60 * w));
  ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
  ctx.fillRect(px, py, S, S);
  // 日冕：边上伸出去的火舌
  ctx.fillStyle = "rgba(255,190,90,0.55)";
  for (let i = 0; i < 3; i++) {
    const hh = S * (0.2 + 0.5 * Math.abs(Math.sin(t * 1.3 + i + tx * 0.7)));
    ctx.fillRect(px + i * (S / 3), py, S / 3 - 1, hh);
  }
  return true;
};

// ---------- 整屏：越来越亮，然后是无线电 ----------
// 走进来的人通常活不过几秒。画面会一直变亮，直到白得什么都看不见。
window.drawStar599 = function (ctx, g) {
  const cw = (ctx.canvas && ctx.canvas.width) || 800;
  const ch = (ctx.canvas && ctx.canvas.height) || 600;
  const t = performance.now() / 1000;
  const burn = Math.max(0, Math.min(1, (g.star599T || 0) / 12));
  ctx.save();
  try { ctx.setTransform(1, 0, 0, 1, 0, 0); } catch (e) { /* 忽略 */ }
  // 翻滚的等离子：一层层暖色在整屏上慢慢转
  for (let i = 0; i < 4; i++) {
    const cx = cw * (0.5 + 0.34 * Math.sin(t * (0.24 + i * 0.11) + i * 2.1));
    const cy = ch * (0.5 + 0.30 * Math.cos(t * (0.19 + i * 0.09) + i * 1.3));
    const rr = Math.max(cw, ch) * (0.34 + 0.12 * i);
    const grd = ctx.createRadialGradient(cx, cy, rr * 0.05, cx, cy, rr);
    const a = 0.13 + 0.07 * i;
    grd.addColorStop(0, "rgba(255,236,190," + a.toFixed(3) + ")");
    grd.addColorStop(0.55, "rgba(255,168,72," + (a * 0.55).toFixed(3) + ")");
    grd.addColorStop(1, "rgba(255,120,40,0)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, cw, ch);
  }
  // 越来越亮 —— 到最后整屏只剩白
  ctx.fillStyle = "rgba(255,248,225," + (burn * 0.72).toFixed(3) + ")";
  ctx.fillRect(0, 0, cw, ch);
  // 边缘的火舌
  ctx.fillStyle = "rgba(255,170,60," + (0.18 + 0.25 * burn).toFixed(3) + ")";
  const tongue = 8 + Math.floor(18 * burn);
  for (let i = 0; i < tongue; i++) {
    const a = (i / tongue) * 6.2832 + t * 0.35;
    const r0 = Math.max(cw, ch) * 0.52;
    const len = Math.max(cw, ch) * (0.06 + 0.16 * Math.abs(Math.sin(t * 1.6 + i)));
    ctx.beginPath();
    ctx.moveTo(cw / 2 + Math.cos(a) * r0, ch / 2 + Math.sin(a) * r0);
    ctx.lineTo(cw / 2 + Math.cos(a - 0.05) * (r0 + len), ch / 2 + Math.sin(a - 0.05) * (r0 + len));
    ctx.lineTo(cw / 2 + Math.cos(a + 0.05) * (r0 + len), ch / 2 + Math.sin(a + 0.05) * (r0 + len));
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
};

// ---------- 无线电：多数是噪音，偶尔变成音乐，偶尔变成人声 ----------
// 站在 Level 78 的舷窗边上，或者在 599 里，它会一条条冒出来。
window.RADIO599 = [
  { at: 0.6,  s: "[一阵持续的静电噪声]" },
  { at: 2.2,  s: "……落在星云状的突触上。" },
  { at: 4.0,  s: "软机器搅动天体之合成，我们以生物之活力以同光子斗争。" },
  { at: 5.6,  s: "[噪声里浮出一段低音质的歌 —— 是 Golden Brown]" },
  { at: 7.2,  s: "我不指望你可以。讲真，我不确定你是否可以这么做。" },
  { at: 8.6,  s: "你不能再待在这儿了 —— 你会死的。" },
  { at: 9.8,  s: "我至少可以试着，让一切回归正轨。" },
  { at: 10.8, s: "但倘若这里还有一些希冀，你难道不愿意带上这种希冀，继续你的人生旅途吗？" },
  { at: 11.6, s: "我想，我的终结也会是你的终结 —— 这可以安慰到我。" },
  { at: 12.2, s: "好。" },
];
