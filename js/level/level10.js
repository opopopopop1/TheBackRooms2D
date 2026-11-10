// 层级建筑布局（固定）
// ---------------------------------------------------------------------------
// 为了降低难度：同一层级的建筑位置每次进入都一样，玩家第二次来就认得路了。
// 坐标是"相对地图尺寸的比例"（0~1），生成时按实际尺寸换算成格子，
// 所以地图变大变小，房子还在同一个地方。
// seed：整个层级的生成用这一个固定的随机种子 —— 房间、走廊、补给的位置
//       都跟着它，每次进同一层拿到的都是同一张地图。（Level 14 除外，它是无限的）
window.LEVEL_BUILDINGS = window.LEVEL_BUILDINGS || {};

// Level 10 —— 丰裕（麦田）
// 谷仓 / 马厩 / 木棚固定在地图的另一侧，离入口（左下角的泥土小径起点）很远。
LEVEL_BUILDINGS["10"] = {
  seed: 681185997,
  buildings: [
  { x: 0.62, y: 0.1, w: 0.14, h: 0.12 },
  { x: 0.8, y: 0.3, w: 0.13, h: 0.11 },
  { x: 0.64, y: 0.52, w: 0.15, h: 0.12 },
  { x: 0.84, y: 0.72, w: 0.12, h: 0.11 },
  { x: 0.3, y: 0.78, w: 0.13, h: 0.12 },
  { x: 0.46, y: 0.6, w: 0.12, h: 0.1 }
  ]
};

// ===========================================================
// 通往 Level 10.1 的入口：麦田里的一小潭死水
// 跟麦田里那些能喝的湖完全是两回事 —— 水面黑得像沥青，一点反光都没有，
// 边上有一圈发黑的烂泥。走近能闻见味道。走进去就是尸湖，那边的水会要命。
// ===========================================================
window.PROP_DRAW = window.PROP_DRAW || {};
window.PROP_DRAW["deadpool10"] = function (ctx, p, T) {
  const R = T * 0.52;
  // 岸边一圈发黑的烂泥（比麦田土色暗，带一点湿痕）
  ctx.fillStyle = "#3a3327";
  ctx.beginPath();
  ctx.ellipse(0, 0, R * 1.16, R * 1.08, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#4a4230";
  for (let i = 0; i < 7; i++) {
    const a = i * 1.35;
    ctx.beginPath();
    ctx.ellipse(Math.cos(a) * R * 1.24, Math.sin(a) * R * 0.98, R * 0.20, R * 0.13, a, 0, Math.PI * 2);
    ctx.fill();
  }
  // 水面：几乎全黑，只有一层极弱的冷色反光（看得出是水，不是洞）
  const gr = ctx.createRadialGradient(-R * 0.22, -R * 0.26, 1, 0, 0, R);
  gr.addColorStop(0, "#15191b");
  gr.addColorStop(0.55, "#0b0e10");
  gr.addColorStop(1, "#050607");
  ctx.fillStyle = gr;
  ctx.beginPath();
  ctx.ellipse(0, 0, R * 0.98, R * 0.90, 0, 0, Math.PI * 2);
  ctx.fill();
  // 水面上一层浮着的浑浊薄膜（几道极暗的褐色纹路）
  ctx.strokeStyle = "rgba(90,74,48,0.30)";
  ctx.lineWidth = Math.max(1, T * 0.045);
  for (let i = 0; i < 3; i++) {
    const yy = -R * 0.34 + i * R * 0.36;
    ctx.beginPath();
    ctx.moveTo(-R * 0.72, yy);
    ctx.quadraticCurveTo(0, yy + R * 0.13, R * 0.72, yy - R * 0.07);
    ctx.stroke();
  }
  // 水面上冒的一个气泡（暗示下面有东西）
  ctx.fillStyle = "rgba(150,150,140,0.22)";
  ctx.beginPath();
  ctx.ellipse(R * 0.28, R * 0.30, R * 0.11, R * 0.09, 0, 0, Math.PI * 2);
  ctx.fill();
  // 岸边几根泡烂的枯草
  ctx.strokeStyle = "#6b6136";
  ctx.lineWidth = Math.max(1, T * 0.035);
  for (let i = 0; i < 5; i++) {
    const a = i * 1.28 + 0.4;
    const x0 = Math.cos(a) * R * 1.10, y0 = Math.sin(a) * R * 1.02;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x0 + Math.cos(a) * R * 0.16, y0 - R * 0.20);
    ctx.stroke();
  }
};
