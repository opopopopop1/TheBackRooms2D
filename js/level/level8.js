// 层级建筑布局（固定）
// ---------------------------------------------------------------------------
// 为了降低难度：同一层级的建筑位置每次进入都一样，玩家第二次来就认得路了。
// 坐标是"相对地图尺寸的比例"（0~1），生成时按实际尺寸换算成格子，
// 所以地图变大变小，房子还在同一个地方。
// seed：整个层级的生成用这一个固定的随机种子 —— 房间、走廊、补给的位置
//       都跟着它，每次进同一层拿到的都是同一张地图。（Level 14 除外，它是无限的）
window.LEVEL_BUILDINGS = window.LEVEL_BUILDINGS || {};

// Level 8 —— 岩洞系统
LEVEL_BUILDINGS["8"] = { seed: 2583803629 };

// 岩洞最深处那片郊区里的箭头路牌 —— 和 Level 9 沿路那批一模一样。
// 它是出口锚点（踏进 5×5 的郊区斑块就直接传送），但画面上不写「Level 9」，
// 只用牌子上的箭头告诉你路往哪边去：看画面，不是读文字。
window.PROP_DRAW = window.PROP_DRAW || {};
window.PROP_DRAW["suburb9"] = function (ctx, p, T) {
  const t = (typeof gTimeRef === "number" ? gTimeRef : 0);
  ctx.save();
  // 落地的影子
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath(); ctx.ellipse(0, T * 0.20, T * 0.24, T * 0.08, 0, 0, Math.PI * 2); ctx.fill();
  // 杆
  ctx.fillStyle = "#3a3d40";
  ctx.fillRect(-T * 0.05, -T * 0.35, T * 0.10, T * 0.55);
  // 绿底路牌
  ctx.fillStyle = "#4e6a4a";
  ctx.fillRect(-T * 0.43, -T * 0.80, T * 0.86, T * 0.42);
  ctx.strokeStyle = "rgba(220,235,220,0.5)";
  ctx.lineWidth = 1;
  ctx.strokeRect(-T * 0.42, -T * 0.79, T * 0.84, T * 0.40);
  // 箭头：画出来的形状，不是打字
  ctx.fillStyle = "rgba(235,245,235,0.92)";
  ctx.beginPath();
  ctx.moveTo(-T * 0.25, -T * 0.56);
  ctx.lineTo(-T * 0.02, -T * 0.68);
  ctx.lineTo(-T * 0.02, -T * 0.62);
  ctx.lineTo(T * 0.24, -T * 0.62);
  ctx.lineTo(T * 0.24, -T * 0.51);
  ctx.lineTo(-T * 0.02, -T * 0.51);
  ctx.lineTo(-T * 0.02, -T * 0.45);
  ctx.closePath();
  ctx.fill();
  // 牌子边缘会轻轻发亮，隔着老远也能认出那不是岩壁
  const pulse = (0.35 + 0.25 * Math.sin(t * 2.2)).toFixed(2);
  ctx.shadowColor = "rgba(150,220,170," + pulse + ")";
  ctx.shadowBlur = 12;
  ctx.strokeStyle = "rgba(190,235,200," + pulse + ")";
  ctx.strokeRect(-T * 0.43, -T * 0.80, T * 0.86, T * 0.42);
  ctx.restore();
};
