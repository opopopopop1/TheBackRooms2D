// ===========================================================
// 1.3.1 批次公共挂点：Level 5.1 / 39 / 63 / 63.3 / 797 / 46
//   · 自定义交互：main.js 里的 newLevelHint / newLevelInteract 是 IIFE 内部的
//     switch，外部文件改不到；这里用一个聚合钩子，各层级把自己的判据挂进来。
//   · 整屏叠加：main.js 会按 window.__LEVEL_OVERLAY[当前层级] 调用。
//   · 每帧逻辑：仍然走原有的 window.__LEVEL_TICK[层级]。
//   · 物件只要带上 iKind，nearNew 的通用登记就会把它交给这两个钩子。
// ===========================================================
"use strict";

(function () {
  window.__B2_HINTS = [];
  window.__B2_ACTS = [];
  window.__B2_OVL = {};

  window.__LEVEL_HINT_EXTRA = function (n, g) {
    for (const f of window.__B2_HINTS) {
      try { const r = f(n, g); if (r != null) return r; } catch (e) { /* 忽略 */ }
    }
    return null;
  };
  window.__LEVEL_INTERACT_EXTRA = function (n, g) {
    for (const f of window.__B2_ACTS) {
      try { if (f(n, g)) return true; } catch (e) { /* 忽略 */ }
    }
    return false;
  };
  window.__LEVEL_OVERLAY = window.__B2_OVL;

  // 小工具：把一条提示 / 一段交互挂进聚合器
  window.__B2_hint = function (kinds, fn) {
    window.__B2_HINTS.push(function (n, g) {
      if (kinds.indexOf(n.kind) < 0) return null;
      return fn(n, g);
    });
  };
  window.__B2_act = function (kinds, fn) {
    window.__B2_ACTS.push(function (n, g) {
      if (kinds.indexOf(n.kind) < 0) return false;
      return !!fn(n, g);
    });
  };
})();

// ===========================================================
// 1.3.1 批次：注入到旧层级里的入口物件外观
//   （没有专属画法会被画成通用桌子 —— 这条规矩吃过好几次亏）
// ===========================================================
window.PROP_DRAW = window.PROP_DRAW || {};
(function () {
  const D = window.PROP_DRAW;
  const door = (ctx, T, frame, panel, label, glow) => {
    ctx.fillStyle = frame; ctx.fillRect(-T * 0.34, -T * 0.44, T * 0.68, T * 0.88);
    ctx.fillStyle = panel; ctx.fillRect(-T * 0.27, -T * 0.38, T * 0.54, T * 0.76);
    ctx.fillStyle = glow; ctx.fillRect(-T * 0.38, -T * 0.48, T * 0.76, T * 0.10);
    if (label) {
      ctx.fillStyle = "#f0e0b0"; ctx.font = "bold " + (T * 0.17) + "px sans-serif";
      ctx.textAlign = "center"; ctx.fillText(label, 0, T * 0.08); ctx.textAlign = "left";
    }
    ctx.fillStyle = "#e8c878"; ctx.beginPath(); ctx.arc(T * 0.18, T * 0.10, T * 0.04, 0, Math.PI * 2); ctx.fill();
  };
  D["casino51door"] = (ctx, p, T) => {
    door(ctx, T, "#6a2430", "#3a1c26", "TH", "#a3242c");
    ctx.fillStyle = "rgba(255,210,120,.22)";
    ctx.fillRect(-T * 0.44, -T * 0.48, T * 0.88, T * 0.96);
  };
  D["rustdoor21to46"] = (ctx, p, T) => {
    door(ctx, T, "#6a4a2a", "#8a6a3a", null, "#b98a48");
    ctx.fillStyle = "#a8542a";
    for (let i = 0; i < 5; i++) ctx.fillRect(-T * 0.24 + i * T * 0.1, -T * 0.30 + (i % 2) * T * 0.2, T * 0.06, T * 0.06);
  };
  D["bush11to63"] = (ctx, p, T) => {
    ctx.fillStyle = "#3e6a38";
    for (let i = 0; i < 4; i++) {
      ctx.beginPath(); ctx.arc(-T * 0.24 + i * T * 0.16, T * (0.06 - (i % 2) * 0.12), T * 0.19, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = "rgba(200,225,240,.28)";
    ctx.beginPath(); ctx.ellipse(0, 0, T * 0.34, T * 0.30, 0, 0, Math.PI * 2); ctx.fill();
  };
  D["grotto797to39"] = D["grotto797to10"] = (ctx, p, T) => {
    ctx.fillStyle = "#5a5a52";
    ctx.beginPath(); ctx.ellipse(0, T * 0.06, T * 0.40, T * 0.44, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#20262a";
    ctx.beginPath(); ctx.ellipse(0, T * 0.08, T * 0.26, T * 0.34, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(210,190,150,.6)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, T * 0.06, T * 0.40, T * 0.44, 0, 0, Math.PI * 2); ctx.stroke();
  };
  D["oakdoor797to63"] = (ctx, p, T) => {
    door(ctx, T, "#5a3f24", "#7a5a34", null, "#a07840");
    ctx.strokeStyle = "rgba(40,26,12,.5)"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, -T * 0.38); ctx.lineTo(0, T * 0.38); ctx.stroke();
  };
})();

// 进入某个层级时（map 换了一张）重置该层的临时状态。
// game 对象在切层时会被复用，s633day / d46phase / f39clear 这些字段若不清掉，
// 第二次进来就会带着上一次的天亮、沙暴、催眠免疫 —— 档案里都写着「重新进入时恢复初始」。
window.__B2_enter = function (g, key, reset) {
  const m = g && g.map;
  if (!m || m.__b2Key === key) return false;
  m.__b2Key = key;
  try { reset(); } catch (e) { /* 忽略 */ }
  return true;
};
