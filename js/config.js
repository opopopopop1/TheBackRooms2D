"use strict";
// ============================================================
// 云服务地址配置 —— 只需要改这一行
//
// 游戏页面和后端不在同一个域名时，把下面的地址改成后端地址即可。
// 后端那边记得开好跨域（CORS），server/server.js 里已经加过了。
// ============================================================
(function () {
  // ↓↓↓ 改成你的后端地址（结尾不要带斜杠）↓↓↓
  var DEFAULT_API = "";   // 留空 = 同源，即和游戏页面同一个域名下的 /api

  // ======== CloudBase 数据模型 RPC —— 云通道已关闭 ========
  // 联机现在只剩两条路：
  //   1. 局域网联机：BroadcastChannel，同一台机器的多标签页，离线可用
  //   2. 网络联机：VibeHub SDK v3（WebRTC P2P + VibeNet 中继）
  // 云通道是"自建数据库 + 定时轮询拉取消息"，正好踩中 VibeHub 的两条红线
  // （禁止自建后端 / 禁止用轮询同步实时对局状态），所以整个停用：
  // 下面两个必须留空，net.js 里 CLOUD_ON 才会是 false，一条云请求都不会发。
  var DEFAULT_RPC = "";
  var DEFAULT_PUBKEY = "";

  // ======== VibeHub 项目 slug ========
  // 网络联机要用。填的是【项目 slug】，不是主站 /works/<作品ID> 后面的那串 ID，
  // 也不是项目内部 ID —— 从创作者中心「我的项目」或 `vibehub list` 复制。
  // 例：var DEFAULT_WORK = "backrooms";
  // 临时改可以用 URL 参数：?work=backrooms
  var DEFAULT_WORK = "cFD0sATs";

  // 调试用：临时换个地址可以加 URL 参数，例如 ?api=https://xxx
  var q = "";
  try {
    var m = location.search.match(/[?&]api=([^&]+)/);
    if (m) q = decodeURIComponent(m[1]);
  } catch (e) { /* 忽略 */ }

  // 云通道已经整体停用 —— 这个开关留着只是为了不让老链接报错。
  var forceLocal = true;
  try { if (/[?&]rpc=local/.test(location.search)) forceLocal = true; } catch (e) { /* 忽略 */ }

  // 优先级：URL 参数 > 已设置的全局变量 > 本文件常量 > 同源
  var base = q || window.BACKROOMS_API || DEFAULT_API || "";

  window.BACKROOMS_API = base;
  // 云通道永久关闭：直接写空，不看 forceLocal，也不再读旧常量
  window.BACKROOMS_RPC = "";
  window.BACKROOMS_PUBKEY = "";

  // VibeHub 项目 slug：URL 参数 > 界面里改过的（localStorage）> 全局变量 > 本文件常量
  // 联机报「未授权」时，多半是这里填错了 —— 界面上可以直接改，改完刷新生效。
  var w = "";
  try {
    var mw = location.search.match(/[?&]work=([^&]+)/);
    if (mw) w = decodeURIComponent(mw[1]);
  } catch (e) { /* 忽略 */ }
  var lw = "";
  try { lw = localStorage.getItem("BACKROOMS_WORK") || ""; } catch (e) { /* 忽略 */ }
  window.BACKROOMS_WORK = (w || lw || window.BACKROOMS_WORK || DEFAULT_WORK || "").trim();
})();
