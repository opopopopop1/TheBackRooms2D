"use strict";

(function () {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  let W = 0, H = 0, DPR = 1;

  const $ = (id) => document.getElementById(id);
  const el = {
    hud: $("hud"),
    levelLabel: $("level-label"),
    objective: $("objective"),
    perf: $("perf"),
    entitiesLabel: $("entities-label"),
    timeLabel: $("time-label"),
    muteBtn: $("mute-btn"),
    pauseBtn: $("pause-btn"),
    staminaBar: $("stamina-bar"),
    dive: $("dive"),
    diveDepth: $("dive-depth"),
    diveZone: $("dive-zone"),
    diveAir: $("dive-air"),
    staminaFill: $("stamina-fill"),
    menu: $("menu"),
    startBtn: $("start-btn"),
    dead: $("dead"),
    deadTime: $("dead-time"),
    deadCause: $("dead-cause"),
    deadLevel: $("dead-level"),
    deadArch: $("dead-arch"),
    restartBtn: $("restart-btn"),
    levelup: $("levelup"),
    levelupTitle: $("levelup-title"),
    levelupSub: $("levelup-sub"),
    pause: $("pause"),
    menuBtn2: $("menu-btn2"),
    deadMenuBtn: $("dead-menu-btn"),
    wretchMenuBtn: $("wretch-menu-btn"),
    endingMenuBtn: $("ending-menu-btn"),
    resumeBtn: $("resume-btn"),
    archive: $("archive"),
    archiveKind: $("archive-kind"),
    archiveTitle: $("archive-title"),
    archiveSource: $("archive-source"),
    archiveBody: $("archive-body"),
    archiveCount: $("archive-count"),
    pickupHint: $("pickup-hint"),
    archiveLabel: $("archive-label"),
    flashlightLabel: $("flashlight-label"),
    flashToast: $("flash-toast"),
    touchUI: $("touch-ui"),
    stickZone: $("stick-zone"),
    stickBase: $("stick-base"),
    stickKnob: $("stick-knob"),
    btnE: $("btn-e"),
    btnAct: $("btn-act"),
    btnPick: $("btn-pick"),
    btnUp: $("btn-up"),
    hudMore: $("hud-more-btn"),
    hudRight: document.querySelector(".hud-right"),
    keymap: $("keymap"),
    kmList: $("km-list"),
    kmHint: $("km-hint"),
    kmClose: $("km-close"),
    kmOk: $("km-ok"),
    kmReset: $("km-reset"),
    setKeys: $("set-keys"),
    setDpr: $("set-dpr"),
    setUizoom: $("set-uizoom"),
    setTouchPos: $("set-touch-pos"),
    setDevmode: $("set-devmode"),
    taBar: $("touch-adjust-bar"),
    taReset: $("ta-reset"),
    taOk: $("ta-ok"),
    btnDoor: $("btn-door"),
    btnFl: $("btn-fl"),
    btnSprint: $("btn-sprint"),
    archiveCloseBtn: $("archive-close-btn"),
    doorHint: $("door-hint"),
    manualBtn: $("manual-btn"),
    manual: $("manual"),
    scare: $("scare"),
    scareImg: $("scare-img"),
    manualList: $("manual-list"),
    manualDoc: $("manual-doc"),
    manualCount: $("manual-count"),
    manualCloseBtn: $("manual-close-btn"),
    vitals: $("vitals"),
    hpFill: $("hp-fill"),
    hpNum: $("hp-num"),
    sanFill: $("san-fill"),
    sanNum: $("san-num"),
    badStacks: $("bad-stacks"),
    bag: $("bag"),
    bagList: $("bag-list"),
    bagDesc: $("bag-desc"),
    bagCloseBtn: $("bag-close-btn"),
    bagBtn: $("bag-btn"),
    btnBag: $("btn-bag"),
    wretch: $("wretch"),
    wretchEnd: $("wretch-end"),
    wretchLevel: $("wretch-level"),
    wretchLine: $("wretch-line"),
    wretchReason: $("wretch-reason"),
    wretchBtn: $("wretch-btn"),
    wretchTimer: $("wretch-timer"),
    wtNum: $("wt-num"),
    ending: $("ending"),
    endToast: $("end-toast"),
    endingTitle: $("ending-title"),
    endingLine: $("ending-line"),
    endingMeta: $("ending-meta"),
    endingBtn: $("ending-btn"),
    outfit: $("outfit"),
    outfitList: $("outfit-list"),
    outfitDesc: $("outfit-desc"),
    outfitCloseBtn: $("outfit-close-btn"),
    outfitPreview: $("outfit-preview"),
    elevator: $("elevator"),
    elevList: $("elev-list"),
    elevClose: $("elev-close"),
    outfitPreviewName: $("outfit-preview-name"),
    menuOutfitBtn: $("menu-outfit-btn"),
    account: $("account"),
    accBtn: $("menu-account-btn"),
    accClose: $("acc-close"),
    announce: $("announce"),
    annBtn: $("menu-announce-btn"),
    annBody: $("ann-body"),
    annClose: $("ann-close"),
    accTabLogin: $("acc-tab-login"),
    accTabReg: $("acc-tab-reg"),
    accConfirm: $("acc-confirm"),
    settings: $("settings"),
    setBtn: $("menu-settings-btn"),
    hudSetBtn: $("hud-set-btn"),
    pauseSetBtn: $("pause-set-btn"),
    setClose: $("set-close"),
    setSfx: $("set-sfx"),
    setSfxN: $("set-sfx-n"),
    setSfxOn: $("set-sfx-on"),
    setBgm: $("set-bgm"),
    setBgmN: $("set-bgm-n"),
    setBgmOn: $("set-bgm-on"),
    setBgmInGame: $("set-bgm-ingame"),
    setAmb: $("set-amb"),
    setAmbN: $("set-amb-n"),
    setAmbOn: $("set-amb-on"),
    setTrack: $("set-track"),
    setScareImg: $("set-scare-img"),
    setRateUp: $("set-rate-up"),
    rankBtn: $("rank-btn"),
    menuRankBtn: $("menu-rank-btn"),
    rank: $("rank"),
    rankBody: $("rank-body"),
    rankClose: $("rank-close"),
    rankRefresh: $("rank-refresh"),
    rankState: $("rank-state"),
    bntg: $("bntg"),
    bntgBody: $("bntg-body"),
    bntgAlmond: $("bntg-almond"),
    bntgCoin: $("bntg-coin"),
    bntgEx: $("bntg-ex"),
    bntgState: $("bntg-state"),
    bntgClose: $("bntg-close"),
    pc4: $("pc4"),
    pc4Close: $("pc4-close"),
    pc4Start: $("pc4-start"),
    pc601: $("pc601"),
    pc601Close: $("pc601-close"),
    pc601Start: $("pc601-start"),
    pc601Title: $("pc601-title"),
    hermes: $("hermes"),
    hermesList: $("hermes-list"),
    hermesClose: $("hermes-close"),
    simsel: $("simsel"),
    simselList: $("simsel-list"),
    simselClose: $("simsel-close"),
    coffee: $("coffee"),
    coffeeCols: $("coffee-cols"),
    coffeeNow: $("coffee-now"),
    coffeeRes: $("coffee-res"),
    coffeeCup: $("coffee-cup"),
    coffeeReset: $("coffee-reset"),
    coffeeDrink: $("coffee-drink"),
    coffeeState: $("coffee-state"),
    coffeeClose: $("coffee-close"),
    confess: $("confess"),
    confessBody: $("confess-body"),
    confessState: $("confess-state"),
    confessDone: $("confess-done"),
    confessBlack: $("confess-black"),
    health: $("health"),
    hlCount: $("hl-count"),
    hlSlts: $("hl-slts"),
    hlSltsCap: $("hl-slts-cap"),
    slts: $("slts"),
    sltsClose: $("slts-close"),
    sltsOk: $("slts-ok"),
    menuSlts: $("menu-slts"),
    menuSltsTxt: $("menu-slts-txt"),
    mapview: $("mapview"),
    mapvCv: $("mapv-cv"),
    mapvTitle: $("mapv-title"),
    mapvInfo: $("mapv-info"),
    mapvFloor: $("mapv-floor"),
    mapvFup: $("mapv-fup"),
    mapvFdn: $("mapv-fdn"),
    mapvSave: $("mapv-save"),
    mapvClose: $("mapv-close"),
    accOut: $("acc-out"),
    accSync: $("acc-sync"),
    accNick: $("acc-nick"),
    accPwd: $("acc-pwd"),
    accState: $("acc-state"),
    accForm: $("acc-form"),
    accLogged: $("acc-logged"),
    accName: $("acc-name"),
    accMsg: $("acc-msg"),
    onlineN: $("online-n"),
    help: $("help"),
    helpCloseBtn: $("help-close-btn"),
    menuManualBtn: $("menu-manual-btn"),
    menuHelpBtn: $("menu-help-btn"),
    terminal: $("terminal"),
    termLog: $("term-log"),
    termInput: $("term-input"),
    termState: $("term-state"),
    termCloseBtn: $("term-close-btn"),
  };

  const keys = {};
  let game = null;
  // 联机模块要读当前这一局的状态（位置 / 层级 / 血量）
  Object.defineProperty(window, "__game", { get: () => game, configurable: true });
  let pendingAI = false;          // 下一局是否交给 AI 接管
  let manualSel = null;      // 手册里当前选中的档案（开始菜单没有 game 时也要能用）
  const collected = new Set(); // 已收集的日志档案（跨关卡持久）

  // 档案手册：收集到的档案写入存档（未登录＝浏览器缓存，登录＝同时上云）
  const STORE_KEY = "backrooms.archives.v1";
  (function loadCollected() {
    try {
      if (window.Cloud) Cloud.archives().forEach((id) => collected.add(id));
      else JSON.parse(localStorage.getItem(STORE_KEY) || "[]").forEach((id) => collected.add(id));
    } catch (e) { /* 隐私模式等场景忽略 */ }
  })();
  function saveCollected() {
    // 只把"新增的"推给云存档模块，由它决定写本地还是上云
    if (window.Cloud) {
      let dirty = false;
      collected.forEach((id) => { if (Cloud.addArchive(id)) dirty = true; });
      if (dirty) Cloud.emit();
    } else {
      try { localStorage.setItem(STORE_KEY, JSON.stringify(Array.from(collected))); } catch (e) { /* 忽略 */ }
    }
  }
  function escapeHtml(t) {
    return String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }

  // ---------- 触控设备识别与摇杆状态 ----------
  // 键盘设备自动隐藏摇杆；可用 ?touch=1 / ?touch=0 手动强制开关
  const IS_TOUCH = (() => {
    const q = location.search || "";
    // 设置里的"设备模式"优先：手动选了桌面/手机就以它为准
    try {
      const dm = localStorage.getItem("br_devmode_v1");
      if (dm === "desktop") return false;
      if (dm === "mobile") return true;
    } catch (e) { /* 忽略 */ }
    if (/[?&]touch=0/.test(q)) return false;
    if (/[?&]touch=1/.test(q)) return true;
    const mq = (q2) => (window.matchMedia ? window.matchMedia(q2).matches : false);
    const coarse = mq("(pointer: coarse)");   // 主指针是手指
    const noHover = mq("(hover: none)");      // 无法悬停（真触屏）
    const mt = navigator.maxTouchPoints || 0;
    const ua = navigator.userAgent || "";
    const mobileUA = /Android|iPhone|iPod|iPad|IEMobile|Opera Mini|Windows Phone|Mobile|BlackBerry/i.test(ua);
    // 手机/平板：主指针为粗指针且不能悬停。
    // 触屏笔记本（有鼠标，pointer:fine + hover:hover）不算，避免在电脑上误开摇杆。
    return (coarse && noHover && mt > 0) || (mobileUA && mt > 0);
  })();

  const STICK_R = 46;              // 摇杆最大位移（px）
  const SPRINT_MAG = 0.9;          // 摇杆推到边缘 -> 自动冲刺
  const PICKUP_R = TILE * 0.55;    // 必须真正站到档案上（约半格内）才能阅读
  const stick = { active: false, id: null, ox: 0, oy: 0, dx: 0, dy: 0, mag: 0 };
  let sprintHeld = false;          // 冲刺按钮是否按住
  // 运行模式：初判后仍可自动纠正（用键盘 -> 桌面模式；真实手指触摸 -> 触屏模式）
  let touchMode = IS_TOUCH;
  const HINT_KB = { read: null, flash: null };   // 键盘版提示文案（页面加载时备份）
  // 提示条上的标准文案。之前"站到档案上"只做了 show() 却没写文字，
  // 于是提示条一直留着上一次的内容 —— 从杏仁水旁边走过来，站在档案上
  // 显示的还是"按 E 捡起杏仁水"。
  const HINT_READ_KB = '按 <b>E</b> 阅读档案';
  const HINT_READ_TOUCH = '点击右下 <b>交互</b> 按钮 · 阅读档案';

  // 终末：捡到的书（封面上写着数字）摆在快捷槽上方
  function drawCarriedBooks(ctx, g) {
    const list = g.carryBooks || [];
    if (!list.length) return;
    try {
      ctx.save();
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const COL = { red: "#c8443c", blue: "#3f6fc8", green: "#3f9c58", purple: "#8a4fc8" };
      for (let i = 0; i < list.length; i++) {
        const b = list[i];
        const x = 16 + i * 34, y = H - 132;
        ctx.fillStyle = COL[b.color] || "#888";
        ctx.fillRect(x, y, 28, 34);
        ctx.strokeStyle = "rgba(0,0,0,.55)"; ctx.lineWidth = 1.2;
        ctx.strokeRect(x + 0.5, y + 0.5, 27, 33);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 18px monospace"; ctx.textAlign = "center";
        ctx.fillText(String(b.digit), x + 14, y + 24);
        ctx.textAlign = "left";
      }
      ctx.restore();
    } catch (e) { /* 忽略 */ }
  }

  function show(node) { if (node) node.classList.remove("hidden"); }
  function hide(node) { if (node) node.classList.add("hidden"); }

  // ---------- 画布尺寸 ----------
  // 渲染精度（存在本机）：手机 DPR 常常是 3，全屏每帧重绘上千万像素会直接掉帧，
  // 所以给个上限 —— 默认 2，觉得卡可以在设置里调低。
  const DPR_STORE = "br_dpr_v1";
  function dprCap() {
    let v = 2;
    try { const s2 = localStorage.getItem(DPR_STORE); if (s2) v = parseFloat(s2); } catch (e) { /* 忽略 */ }
    if (!isFinite(v) || v <= 0) v = 2;
    return v;
  }
  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    // 渲染精度由设置里的「低 1 / 中 1.5 / 高 2」直接决定。
    // 以前写成 min(devicePixelRatio, 上限)，在 DPR=1 的桌面上把精度调到「高」
    // 仍然只有 1 倍 —— 面板显示高、画面纹丝不动，手电/迷雾自然也跟着糊。
    // 再加一道设备像素预算，4K 屏自动退回 1 倍，避免整屏重绘上千万像素掉帧。
    const want = dprCap();
    const budget = 8_000_000;
    DPR = Math.max(1, Math.min(want, Math.sqrt(budget / Math.max(1, W * H))));
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
  }
  window.addEventListener("resize", resize);

  // ---------- 游戏状态 ----------
  function createGame() {
    // 开着"游戏开始后仍播放"就别淡出 —— 让背景音乐一路带进关卡里。
    if (bgmInGameOn) AudioSys.keepMusicIntoGame();
    else AudioSys.fadeOutMenuMusic(700);   // 开局：菜单音乐淡出
    hide(el.archive);
    hide(el.manual);
    hide(el.pickupHint);
    hide(el.doorHint);
    hide(el.flashToast);
    if (el.btnE) el.btnE.classList.remove("ready");
      if (el.btnAct) { el.btnAct.classList.remove("ready"); hide(el.btnAct); }
    hide(el.btnDoor);
    if (touchMode) show(el.touchUI);
    game = {
      // playing | dying | dead | transition | paused | reading | manual
      phase: "playing",
      level: 0,
      floor: 0,          // 当前楼层（Level 1 分上下两层）
      time: 0,
      map: null,
      player: null,
      entities: [],
      archives: [],
      entMul: curDiff().entMul,
      entMaxAdd: curDiff().maxAdd,
      nearArchive: null,
      nearDoor: null,
      nearItem: null,     // 够得着的地上物品
      nearCrate: null,    // 够得着的补给箱
      adrenaline: 0,      // 肾上腺素剩余时间
      adrenalineCd: 0,    // 肾上腺素冷却
      adrenalineBefore: 0,  // 上一帧的肾上腺素（用来判断「刚结束」）
      adrenalineAfter: 0,   // 肾上腺素结束后 15 秒：仍可边跑边恢复
      staminaLock: 0,       // 体力耗尽后的 2 秒真空期
      outfit: savedOutfit(),
      toast,
      // Level 6：墙壁记忆（碰到的点 / 贴墙划出的线）
      memory: { marks: [], last: new Map(), acc: 0 },
      // Level 7：闭气
      air: CONFIG.DIVE_AIR_MAX,
      // 环境事件计时
      jazzTimer: 2, whisperTimer: rand(4, 9), steamTimer: 3,
      floodTimer: rand(CONFIG.CAVE_FLOOD_MIN, CONFIG.CAVE_FLOOD_MAX),
      floodLeft: 0, gravityFlip: 0, warpCd: 0,
      // 摄像机是自带物品：不在地图里刷出，开局就在副手槽里；另带 4 卷普通胶卷
      inv: { almond: 0, bad: 0, crowbar: 0, key: 0, meat: 0, divesuit: 0, submarine: 0, torch: 0,
             camera: 1, film_normal: 4 },
      tapeIds: [],                     // 身上每一卷「录像带」对应的视频档案 id
      bagCap: CONFIG.BAG_DEFAULT,      // 背包容量（拾到挎包 / 背包会变大）
      bagCapInfinite: false,           // "setting bag to infinite"
      hotbar: initialHotbar(),         // 屏幕下方三个主物品槽（键盘 1 / 2 / 3）
      offhand: "camera",               // 副手槽：单独一个，初始拿摄像机
      calmLeft: 0,                     // 刚喝下杏仁水的"压惊"剩余时间
      // 生命 / 理智 / 背包（跨层级保留）
      hp: CONFIG.HP_MAX,
      sanity: CONFIG.SANITY_MAX,
      badStacks: [],      // 受污染杏仁水的层数（每层独立倒计时）
      deathCause: "",
      smilerScare: false,
      reading: null,
      flashlight: false,
      // 派对层一进去就该有人在，别让玩家先逛 8 秒才见到第一只
      spawnTimer: rand(5, 9),
      flickerTimer: rand(3, 6),
      flickerLeft: 0,
      flicker: 1,
      heartbeatAccum: 0,
      deathTimer: 0,
      transTimer: 0,
      killerName: "",
      fog: null,
      fogCtx: null,
      explored: null,
      blocked: null,       // 被关闭的门挡住的格子（1=遮挡中），门一开就解锁
      flCone: null,        // 手电光锥（世界坐标点集，射线扫描成形）
      returnPoint: null,   // Level 0 → 0.2 时记住的原位置（用于原路返回）
      rampArmed: true,     // 斜坡：走出斜坡区域后才会再次触发
      collapseTimer: rand(4, 8),
      collapseLeft: 0,
      debris: [],          // 坍塌掉落的碎块
      manualReturn: "playing",
    };
    AudioSys.stopStatic();
    // entities.js 里实体抓到玩家时调的是 game.onCaught(this) ——
    // 必须把回调挂到 game 上，否则一旦被抓到就会抛异常，整个主循环直接停摆（卡死）。
    game.onCaught = onCaught;
    newLevel();
  }

  function newLevel(opts) {
    opts = opts || {};
    const g = game;
    // 离开 Level 5：收音机停掉（原文设定 —— 只在这一层听得见）
    if (g.radioPlaying) { g.radioPlaying = false; g.radioNear = 0; AudioSys.radio(false, 0); }
    // 切出 Level 4（不管走电梯、楼梯、黑雾还是终端传送）-> 解锁生化防护服调色。
    // 之前只写在 toLevelX 分支里，用终端传送或走别的出口就解锁不了。
    if (g._prevLevel != null && String(g._prevLevel) === "4" && String(g.level) !== "4") {
      markUnlock("clear4");
    }
    // 记下"从哪一层切过来的" —— Level 15 的彩蛋只认从 Level 14 走出来的那一次
    g.fromLevel = g._prevLevel;
    g._prevLevel = g.level;
    markVisited(g.level);      // 到过这个层级，手册里才会显示它的名字与生存难度
    // 一局里进过哪些层级 —— 进 Level 9223372036854775807.-1（过去）时按这个拼接。
    // 以前只写了 localStorage 里的 br_visited（那玩意只有 994 相关的一处在维护），
    // g.visited 从来没被赋过值，所以 visitedLevelsFor() 一直拿到空数组 —— 于是"没拼接"。
    if (!Array.isArray(g.visited)) g.visited = [];
    {
      const vk = String(g.level);
      if (vk && vk !== "null" && g.visited.indexOf(vk) < 0) g.visited.push(vk);
    }
    rateTry(g.level);          // 通关率统计：进过一次记一次（同一局同一层只记一次）
    g.l37Placed = false;       // 每次进 37 都要重算联机落点 —— 以前离开再回来就不拉开了
    // 联机：同一房间的人必须在同一张地图上 —— 用房间号当种子，人数带进生成过程。
    // 写实模式下 Level 0 / Level ! 例外：这两层存在孤立效应，每人拿自己的身份
    // 当种子，生成一份互不相通的副本，连地图布局都不一样。
    try {
      if (g.multi && window.Net && Net.room) {
        const iso = !!(window.__mpReal && mpIsolatedLevel(g.level));
        const myTok = (Net.self && Net.self.token) ? String(Net.self.token) : "me";
        if (window.setMPSeed) window.setMPSeed(iso ? (Net.room.code + ":iso:" + myTok) : Net.room.code);
        if (window.setMPCount) window.setMPCount(Net.memberCount ? Net.memberCount() : 1);
      } else {
        if (window.setMPSeed) window.setMPSeed(null);
        if (window.setMPCount) window.setMPCount(1);
      }
    } catch (e) { /* 忽略 */ }
    const map = generateMap(g.level);
    g.map = map;
    // 野生迁跃浆果：只长在 Level 4 / 5 / 10 / 11（11 是小概率的一盒）
    try { dropWarpBerry(map, g.level); } catch (e) { /* 忽略 */ }
    // 赫尔墨斯装置的包裹：落地的就是订购时填的那一层，就在这儿交货。
    // 放在 newLevel 里 —— 不管走门、电梯、终端还是切层动画，全都覆盖得到。
    try { maybeDeliverHermes(g); } catch (e) { /* 忽略 */ }
    g.trapFalling = false;      // Level 0.4：掉过一次之后重置（换层会重新生成地图）
    // 藤蔓：换层就从头长。上一层缠上来的那些不该跟着你到下一层 ——
    // 以前没清，带着 vine=1 进砼苑等于一落地就被缠死，连走两步的机会都没有。
    g.vine = 0; g.vineWarn = false; g.gardenSeen = false; g.gardenHint = false;
    g.floor = opts.floor != null ? opts.floor : (map.start.floor || 0);
    let st = opts.spawn || map.start;
    // "随机区域"出口：换到离参考点足够远的地板
    if (opts.randomSpawn) {
      const list = floorList(map, g.floor);
      for (let i = 0; i < 300; i++) {
        const t = list[randInt(0, list.length - 1)];
        if (!t) break;
        if (Math.hypot(t.x - st.x, t.y - st.y) > 10) { st = t; break; }
      }
    }
    g.player = {
      x: (st.x + 0.5) * TILE,
      y: (st.y + 0.5) * TILE,
      floor: g.floor,
      radius: CONFIG.PLAYER_RADIUS,
      stamina: CONFIG.STAMINA_MAX,
      faceX: 0, faceY: 1,
      moving: false, sprinting: false,
      stepDist: 0,
    };
    g.entities = [];
    g.archives = spawnArchives(map, g.level);
    g.nearArchive = null;
    g.nearDoor = null;
    g.nearItem = null;
    g.nearCrate = null;
    g.reading = null;
    g.spawnTimer = rand(5, 9);
    g.debris = [];
    g.steamPuffs = [];
    g.steamTimer = rand(2, 6);
    g.collapseLeft = 0;
    // Level !：进门头 2 秒定在原地 —— 红灯不亮、警报不响，
    // 2 秒一过人才能动，同时红灯亮起、警报音乐响起。
    g.bangFreeze = (String(g.level) === "bang") ? 2 : 0;
    // 彩蛋 2：只要真的踏进过 Level ! 就解锁 —— 不管最后是跑到 EXIT 还是死在走廊上。
    // 这个层级在档案里是"已被移除"的，走进去本身就是那条记录。
    if (String(g.level) === "bang") { try { unlockEnding(9); } catch (e) { /* 忽略 */ } }
    // 999 上"一条都不认"才会立的标记 —— 换了层就作废（认过的地方不再追着你要）
    g.smilerSiege = false;
    g.bangAlarm = false;
    try { AudioSys.bangAlarm(false); } catch (e) {}   // 换层就停掉警报（进 Level ! 时 2 秒后会重新响）
    // 战地医院（14h）：那一直在响的警报 —— 进这一层就开，离开就停
    try { AudioSys.mashAlarm(String(g.level) === "14h"); } catch (e) {}
    // Level 6：墙壁记忆每层重来
    g.memory = { marks: [], last: new Map(), acc: 0 };
    // Level 7：重新入水前把气喘匀
    g.air = CONFIG.DIVE_AIR_MAX;
    g.gravityFlip = 0;
    g.floodLeft = 0;
    g.floodTimer = rand(CONFIG.CAVE_FLOOD_MIN, CONFIG.CAVE_FLOOD_MAX);
    g.collapseTimer = rand(CONFIG.COLLAPSE_MIN, CONFIG.COLLAPSE_MAX);
    g.rampArmed = false; // 出生就在斜坡上也不会立刻弹回
    g.flCone = null;
    g.blocked = null;
    initFog();
    updateDoorBlock(g);
    // 几个层级的入口物件由这里补上（它们的地图是通用生成器画的，
    // 没有各自的 level*.js 可以挂）—— 缺了它们，新层级就没人进得去。
    try { injectLevelEntries(g); } catch (e) { /* 忽略 */ }
    // 层级密钥：本层躺着自己的那把钥匙、一扇没有编号的锁孔门；
    // 若钥匙还插在锁孔里，身后会有一扇通回原处的门。
    try { if (window.LEVEL_KEY) window.LEVEL_KEY.spawnInLevel(g); } catch (e) { /* 忽略 */ }
    g.phase = "playing";
    // 每次进到新的一层，立刻把「最后所在的层级与位置」写进当前存档
    try { autoSaveActive(); } catch (e) { /* 忽略 */ }
    // AI 游玩：这一局由算法接管，玩家不能操控角色
    g.aiOn = !!pendingAI;
    g.ai = null;
    if (elPlay.aiTag) { if (g.aiOn) show(elPlay.aiTag); else hide(elPlay.aiTag); }
    if (elPlay.aiBtn) { if (g.aiOn) show(elPlay.aiBtn); else hide(elPlay.aiBtn); }
    if (g.aiOn) hide(el.touchUI);          // AI 模式下没有摇杆的用武之地
    else if (touchMode) show(el.touchUI);
    if (isLevel(g, 6)) {
      g.flashlight = false;      // 熄灯：任何光源都会失灵
      if (el.btnFl) el.btnFl.classList.remove("on");
    }
    if (isLevel(g, 5)) g.mjWarned = false;
    // Level 10 / 11 的进度与计时：换层就重来
    g.trailDist = 0;
    g.trailLast = null;
    g.signMiles = 0;
    g.mileGoal = null;
    g.lastPos = null;
    g.onTrailT = 0;
    g.fog9 = 0;
    g.fog9T = null;
    g.fog9Left = 0;
    g.weather = null;
    g.carTimer = null;
    // Level 26 享乐号汽船：不管从哪条路进来，立刻就有派对客在场 ——
    // 这里是它们的总部，进门就该被围住，不能出现"一只实体都没有"的空场。
    if (String(g.level) === "26") { g.spawnTimer = rand(0.4, 1.2); forceParty26(g, 5); }
    // Level 974：进场就有一只 Kitty 在房子里，且全层只有这一只
    if (String(g.level) === "974") forceKitty(g);
    if (el.objective) el.objective.textContent = levelDef(g.level).objective;
    updateHud();
    // 结局 2：活着从 Level 14 走出来、踏进 Level 15 —— 很少有人做得到。
    // 它已经不是"结局面板"了：改成菜单页上的彩蛋，只在主菜单露出来。
    // 面板也不再反复弹 —— 解锁过一次就只记档，不打断游戏。
    // 只有"从 Level 14 走出来才算"。用开发者面板传送、从枢纽或 Level 21
    // 的门进去都不作数 —— 那些途径进不去 Level 14，自然也不该解锁这个彩蛋。
    if (isLevel(g, 15) && !g.end2Shown) {
      g.end2Shown = true;
      const from14 = String(g.fromLevel) === "14";
      const already = (function () {
        try { return (JSON.parse(localStorage.getItem("br_endings") || "[]") || []).indexOf(2) >= 0; }
        catch (e) { return false; }
      })();
      if (from14) {
        unlockEnding(2);
        if (!already) {
          AudioSys.exitChime();
          toast("居然被你找到了 —— 这份记录会留在主菜单上");
        }
      } else if (!already) {
        toast("这一层不是从 Level 14 走出来的 —— 那份记录还留着");
      }
    }
  }

  // ---------- 迷雾（只覆盖当前视野，密度跟随渲染精度） ----------
  // 以前是一张覆盖整张世界地图、上限 1500² 的低分辨率图：Level 0 这种
  // 168×168 的大地图上，一个雾像素要被放大约 19 倍才贴到屏幕，手电打在墙上
  // 就成了锯齿方块；而「渲染精度」只管主画布，压根影响不到这张图，所以调到
  // 最高也没用。现在每帧按视野重建，做到 1 雾像素 ≈ 1 设备像素、贴图 1:1。
  let FOG_SCALE = 1;
  function initFog() {
    const g = game;
    const c = document.createElement("canvas");
    c.width = 2;
    c.height = 2;
    g.fog = c;
    g.fogCtx = c.getContext("2d");
    g.fogScale = 1;
    // 记录每一格是否曾被光照过（记忆区域）—— 每层一份
    g.explored = [];
    for (let f = 0; f < g.map.layers.length; f++) {
      const layer = new Array(g.map.size);
      for (let i = 0; i < g.map.size; i++) layer[i] = new Array(g.map.size).fill(false);
      g.explored.push(layer);
    }
  }

  // 每帧重建迷雾：未探索=黑，已探索=恒定的暗（记忆），当前视野=擦亮
  function darkLvHere(g) {
    return (CONFIG.DARK_LEVELS || []).indexOf(String(g.level)) >= 0;
  }

  // ---------- 统一收口：把散落在各处的「出口」收集成一份清单 ----------
  // 这个游戏的出口从来不只写在 map.exit 上：早期层级用 map.exit / map.exits，
  // 后来加的一大批层级把出口塞进了 props（Level 6 的楼梯、Level 8 的郊区斑块、
  // Level 11 的城门、Level 1 的花园绿光……）。以前通用「出口灯塔」只擦前两种，
  // 于是这些出口既没有光 —— 玩家只能挨个房间瞎撞。
  // 这里把三种来源合并，只服务于「出口灯塔」的迷雾擦亮，以后再加出口也不会漏。
  // 注意：不做屏幕边缘箭头 / 距离文字（那会把在黑暗里摸路变成照着 HUD 走），
  // 各层要指路就用自己的光、雷达和信标。
  const EXITISH_TYPES = new Set(["citydoor", "cave9", "suburb9", "fieldpath", "alley10", "stairs6", "stairs7",
    "stair4", "elevator", "elevator4", "stairwell", "deep6", "cave7", "rope", "apartment13",
    "window12", "exist11", "door37", "guarddoor25", "exitdoor", "exitgap", "neonfog11",
    "hole", "vent02", "vent03", "arcade", "irondoor04", "exclamdoor109", "glassdoor119",
    "frontDoor900", "frontdoor900", "backdoor900",
    // 后来加的层级：出口物件名不在老清单里，补进来否则连一圈微光都擦不出来
    "p94throne", "p94castlegate", "p45frontdoor", "p67door", "p29boat",
    "p26poster", "p26balloonRed"]);

  function exitPointLabel(p) {
    // 只认明确的去向字段。刻意不读 p.to —— 696 的楼梯/电梯把楼层号写在 to 上，
    // 读进来会把「通 16 层」误标成「Level 16」。
    const t = p.toLevel != null ? p.toLevel : p.target;
    if (t == null) return "出口";
    const s = String(t);
    return /^[0-9]/.test(s) ? "Level " + s : s;
  }

  function collectExitPoints(g) {
    const m = g.map;
    if (!m) return [];
    const fl = g.floor | 0;
    const out = [];
    const push = (x, y, floor, label) => {
      if (x == null || y == null) return;
      if (floor != null && (floor | 0) !== fl) return;
      out.push({ x: x, y: y, label: label || "出口" });
    };
    if (m.exit) push(m.exit.x, m.exit.y, m.exit.floor, exitPointLabel(m.exit));
    for (const e of (m.exits || [])) push(e.x, e.y, e.floor, exitPointLabel(e));
    for (const p of (m.props || [])) {
      if (!p || p.x == null) continue;
      if (p.toLevel == null && p.target == null && !EXITISH_TYPES.has(p.type)) continue;
      push(p.x, p.y, p.floor, exitPointLabel(p));
    }
    // Level 6 的楼梯单独挂在 map.stairs 上，props 里只是个用于显示的同坐标物件
    if (m.stairs && !out.some((e) => e.x === m.stairs.x && e.y === m.stairs.y)) {
      push(m.stairs.x, m.stairs.y, m.stairs.floor, "Level 7");
    }
    // Level 28 / 29 把真正的出口挂在 map 专用字段上：28 有 11 盏灯但只有
    // exitLamp28 那盏撞进去能走，29 的船同理。按 type 全收会把摆件也算成出口。
    if (m.exitLamp28 && !out.some((e) => e.x === m.exitLamp28.x && e.y === m.exitLamp28.y)) {
      push(m.exitLamp28.x, m.exitLamp28.y, m.exitLamp28.floor, "台灯 → Level 4/5");
    }
    if (m.boat29 && !out.some((e) => e.x === m.boat29.x && e.y === m.boat29.y)) {
      push(m.boat29.x, m.boat29.y, m.boat29.floor, "上船出航");
    }
    return out;
  }

  // 每格 1 像素的连续 mask：把离散的格子状态（已探索 / 渐黑 / 门后）放大成
  // 连续明暗。以前逐格 fillRect 会在雾上留下一圈等间距的方格接缝，手电一照
  // 就是一排台阶 —— 那不是分辨率不够，是底色本身就是方块拼的。
  function tileMask(g, x0, y0, x1, y1, valueFn) {
    const cols = x1 - x0 + 3, rows = y1 - y0 + 3;
    if (!g.fogMask || g.fogMask.width !== cols || g.fogMask.height !== rows) {
      const c = document.createElement("canvas"); c.width = cols; c.height = rows;
      g.fogMask = c; g.fogMaskCtx = c.getContext("2d");
      const b = document.createElement("canvas"); b.width = cols; b.height = rows;
      g.fogMaskBlur = b; g.fogMaskBlurCtx = b.getContext("2d");
    }
    const mc = g.fogMaskCtx, img = mc.createImageData(cols, rows);
    for (let ty = y0 - 1; ty <= y1 + 1; ty++) {
      for (let tx = x0 - 1; tx <= x1 + 1; tx++) {
        const v = Math.max(0, Math.min(1, valueFn(tx, ty) || 0));
        const k = ((ty - y0 + 1) * cols + (tx - x0 + 1)) * 4;
        img.data[k] = 0; img.data[k + 1] = 0; img.data[k + 2] = 0;
        img.data[k + 3] = Math.round(v * 255);
      }
    }
    mc.putImageData(img, 0, 0);
    // 在小图上先模糊半格，放大插值后过渡更自然，不留硬边
    const bc = g.fogMaskBlurCtx;
    bc.clearRect(0, 0, cols, rows);
    bc.filter = "blur(0.55px)";
    bc.drawImage(g.fogMask, 0, 0);
    bc.filter = "none";
    return { c: g.fogMaskBlur, cols: cols, rows: rows, ox: x0 - 1, oy: y0 - 1 };
  }
  function paintTileMask(fc, g, m, mode) {
    if (!m) return;
    fc.save();
    fc.imageSmoothingEnabled = true;
    fc.globalCompositeOperation = mode;
    const S = TILE * FOG_SCALE;
    fc.drawImage(m.c, 0, 0, m.cols, m.rows,
      m.ox * S, m.oy * S, m.cols * S, m.rows * S);
    fc.restore();
  }

  function drawFog(g, cam) {
    const fc = g.fogCtx;
    const size = g.map.size;
    const R = (darkLvHere(g) ? 2.2 : CONFIG.LIGHT_RADIUS) * TILE;
    const explored = g.explored[g.floor] || g.explored[0];

    const left = cam.x - cam.viewW / 2;
    const top = cam.y - cam.viewH / 2;
    // 迷雾只画当前看得见的这一屏：密度 = 世界像素 → 设备像素的倍率，
    // 于是「渲染精度」调高时雾也跟着变细，贴图几乎是 1:1，不再放大十几倍。
    const viewScale = W / cam.viewW;
    const want = viewScale * DPR;
    const budget = 8_000_000;   // 雾画布像素预算：4K 屏自动退档，不让显存爆掉
    const capByBudget = Math.sqrt(budget / Math.max(1, cam.viewW * cam.viewH));
    FOG_SCALE = Math.max(0.5, Math.min(want, capByBudget, 6));
    g.fogScale = FOG_SCALE;
    const fw = Math.max(2, Math.ceil(cam.viewW * FOG_SCALE));
    const fh = Math.max(2, Math.ceil(cam.viewH * FOG_SCALE));
    if (g.fog.width !== fw || g.fog.height !== fh) { g.fog.width = fw; g.fog.height = fh; }
    fc.setTransform(1, 0, 0, 1, 0, 0);
    fc.globalCompositeOperation = "source-over";
    fc.clearRect(0, 0, g.fog.width, g.fog.height);
    // 下面所有绘制照旧写「世界坐标 × FOG_SCALE」，这层平移把原点挪到视野左上角
    fc.setTransform(1, 0, 0, 1, -left * FOG_SCALE, -top * FOG_SCALE);
    const x0 = Math.max(0, Math.floor(left / TILE) - 1);
    const y0 = Math.max(0, Math.floor(top / TILE) - 1);
    const x1 = Math.min(size - 1, Math.ceil((cam.x + cam.viewW / 2) / TILE) + 1);
    const y1 = Math.min(size - 1, Math.ceil((cam.y + cam.viewH / 2) / TILE) + 1);
    // 明亮的层级（终末 / 无尽的终章 / 过去）：这些地方在设定上就是亮堂的，
    // 迷雾不再压暗 —— 否则黄墙黄地会被压成一片黑，连自己在哪儿都看不清。
    const brightLv = (CONFIG.BRIGHT_LEVELS || []).indexOf(String(g.level)) >= 0;
    if (brightLv) {
      fc.globalCompositeOperation = "source-over";
      return;
    }
    // 整片连续铺黑，不再逐格 fillRect —— 逐格会在雾上留下等间距方格接缝，
    // 手电一照就成了一排锯齿台阶。走过的地方稍亮一点改用连续 mask 表现。
    const darkLv = (CONFIG.DARK_LEVELS || []).indexOf(String(g.level)) >= 0;
    fc.fillStyle = "rgba(0,0,0," + (darkLv ? 0.985 : 0.98) + ")";
    fc.fillRect(left * FOG_SCALE, top * FOG_SCALE,
                cam.viewW * FOG_SCALE, cam.viewH * FOG_SCALE);
    if (!darkLv) {
      const mem = tileMask(g, x0, y0, x1, y1, (tx, ty) =>
        (explored[ty] && explored[ty][tx]) ? 0.20 : 0);
      paintTileMask(fc, g, mem, "destination-out");
    }

    // Level 6 熄灯：被带入层级的光源也会丧失功能 —— 一点光都擦不出来
    if (isLevel(g, 6)) {
      fc.globalCompositeOperation = "source-over";
      return;
    }

    // 擦亮：环境光（一整圈柔和的圆）→ 手电筒（锥形）→ 出口灯塔
    fc.globalCompositeOperation = "destination-out";
    eraseLightAt(fc, g, g.player.x, g.player.y, R * g.flicker, CONFIG.AMB_INTENSITY, g.floor);
    if (g.flashlight) eraseFlashlight(fc, g);
    // Level 363：灯还亮着时，整间房（连同外面那圈米色的墙）都看得清 ——
    // 房间只有 5x4，一眼就看完了，用不着迷雾压着。灯灭之后只剩你自己的那一点光。
    if (String(g.level) === "363" && g.map && g.map.room363) {
      const T363 = g.t363 || 0;
      if (T363 < 180) {
        const rr = g.map.room363;
        const k363 = T363 < 60 ? 1 : Math.max(0.30, 1 - (T363 - 60) / 200);
        const R363 = TILE * Math.max(rr.w, rr.h) * 2.2 * k363;
        eraseLightAt(fc, g, (rr.x + rr.w / 2 + 0.5) * TILE, (rr.y + rr.h / 2 + 0.5) * TILE,
          R363, CONFIG.AMB_INTENSITY, g.floor);
      }
    }
    // 场景里的灯（37.1 的红灯）：每盏灯只照亮自己那一圈
    const lamps = g.map && g.map.lamps;
    if (lamps && lamps.length) {
      for (const lp of lamps) {
        if ((lp.floor | 0) !== (g.floor | 0)) continue;
        const lx = (lp.x + 0.5) * TILE * FOG_SCALE, ly = (lp.y + 0.5) * TILE * FOG_SCALE;
        const lr = (lp.r || 3.2) * TILE * FOG_SCALE;
        const lg = fc.createRadialGradient(lx, ly, TILE * 0.2 * FOG_SCALE, lx, ly, lr);
        lg.addColorStop(0, "rgba(0,0,0,0.95)");
        lg.addColorStop(0.55, "rgba(0,0,0,0.72)");
        lg.addColorStop(1, "rgba(0,0,0,0)");
        fc.fillStyle = lg;
        fc.beginPath(); fc.arc(lx, ly, lr, 0, Math.PI * 2); fc.fill();
      }
    }
    const ex = g.map.exit;
    if (ex && (ex.floor | 0) === g.floor) {
      eraseLightAt(fc, g, ex.x * TILE + TILE / 2, ex.y * TILE + TILE / 2,
        CONFIG.EXIT_LIGHT_RADIUS * TILE, 1, ex.floor | 0);
    }
    // Level 0 的两个出口也各有一小圈光，摸黑时不至于完全找不到
    if (g.map.exits) {
      for (const e of g.map.exits) {
        if ((e.floor | 0) !== g.floor) continue;
        eraseLightAt(fc, g, e.x * TILE + TILE / 2, e.y * TILE + TILE / 2,
          CONFIG.EXIT_LIGHT_RADIUS * TILE * 0.9, 1, e.floor | 0);
      }
    }
    // 藏在 props 里的出口也补一圈微光。以前通用灯塔只认 map.exit / map.exits，
    // 结果 Level 8 的郊区、Level 11 的城门、Level 1 的花园绿光这些出口
    // 反而是整层最黑的地方。半径比常规小一点，不会把一层照成白地。
    // Level 6 在上面就 return 了（熄灯层按档案一点光都擦不出来），
    // 它继续靠雷达 + 楼梯口那盏应急灯，不在这里破坏设定。
    const lit = new Set();
    if (g.map.exit) lit.add(g.map.exit.x + "," + g.map.exit.y);
    for (const e of (g.map.exits || [])) lit.add(e.x + "," + e.y);
    for (const ep of collectExitPoints(g)) {
      const key = ep.x + "," + ep.y;
      if (lit.has(key)) continue;
      lit.add(key);
      eraseLightAt(fc, g, ep.x * TILE + TILE / 2, ep.y * TILE + TILE / 2,
        CONFIG.EXIT_LIGHT_RADIUS * TILE * 0.65, 0.85, g.floor | 0);
    }

    // ---- Level 0 熄灯区：完全无照明、完全没有灯 ----
    // 上面所有擦亮（环境光、场景灯、出口灯塔、档案微光）在这片区域里一律作废：
    // 荧光灯不再嗡鸣，四周陷入死一般的寂静。区内一盏灯、一缕光都没有；
    // 按档案手电筒仍然可以用，所以铺完浓黑后只把玩家自己的手电锥重新擦出来。
    const bzL0 = (String(g.level) === "0" && g.map.l0zones)
      ? g.map.l0zones.zones.find((q) => q.key === "blackout") : null;
    if (bzL0) {
      fc.globalCompositeOperation = "source-over";
      // 边缘 5 格平滑地暗下去、中心才接近无照明；用连续 mask 而非逐格填黑，
      // 否则每格一个 alpha 会拼出一圈圈方块环，正是墙面锯齿的来源之一。
      const bmask = tileMask(g, x0, y0, x1, y1, (tx, ty) => {
        if (tx < bzL0.x || tx >= bzL0.x + bzL0.w ||
            ty < bzL0.y || ty >= bzL0.y + bzL0.h) return 0;
        const dEdge = Math.min(tx - bzL0.x, bzL0.x + bzL0.w - 1 - tx,
                               ty - bzL0.y, bzL0.y + bzL0.h - 1 - ty);
        const depth = Math.max(0, Math.min(1, (dEdge + 1) / 5));
        return 0.30 + depth * 0.685;          // 边缘 0.30 → 5 格内 0.985
      });
      paintTileMask(fc, g, bmask, "source-over");
      fc.globalCompositeOperation = "destination-out";
      const ptx0 = Math.floor(g.player.x / TILE), pty0 = Math.floor(g.player.y / TILE);
      const inBz = ptx0 >= bzL0.x - 2 && ptx0 < bzL0.x + bzL0.w + 2
                && pty0 >= bzL0.y - 2 && pty0 < bzL0.y + bzL0.h + 2;
      if (g.flashlight && inBz) eraseFlashlight(fc, g);
      // 不擦任何微光：区内没有光源，手电是唯一能推开这片黑的东西。
    }

    // 关闭的门挡光：门后重新压暗（墙不挡光，光圈保持完整的一圈）
    fc.globalCompositeOperation = "source-over";
    if (g.blocked) {
      const rr = R * g.flicker;
      const ptx = g.player.x, pty = g.player.y;
      const dm = tileMask(g, x0, y0, x1, y1, (tx, ty) => {
        if (!g.blocked[ty * size + tx]) return 0;
        const dx = (tx + 0.5) * TILE - ptx, dy = (ty + 0.5) * TILE - pty;
        return (dx * dx + dy * dy > rr * rr) ? 0 : CONFIG.DOOR_BLOCK_ALPHA;
      });
      paintTileMask(fc, g, dm, "source-over");
    }
  }

  // 擦亮一处光源：同时把覆盖的格子标记为已探索
  function eraseLightAt(fc, g, wx, wy, radius, intensity, floor) {
    const size = g.map.size;
    const explored = g.explored[floor] || g.explored[0];
    const rTiles = Math.ceil(radius / TILE) + 1;
    const cx = Math.floor(wx / TILE), cy = Math.floor(wy / TILE);
    for (let ty = cy - rTiles; ty <= cy + rTiles; ty++) {
      for (let tx = cx - rTiles; tx <= cx + rTiles; tx++) {
        if (tx < 0 || ty < 0 || tx >= size || ty >= size) continue;
        if (explored[ty][tx]) continue;
        const dx = (tx + 0.5) * TILE - wx;
        const dy = (ty + 0.5) * TILE - wy;
        if (dx * dx + dy * dy <= radius * radius) explored[ty][tx] = true;
      }
    }
    const x = wx * FOG_SCALE, y = wy * FOG_SCALE, r = radius * FOG_SCALE;
    const grd = fc.createRadialGradient(x, y, 0, x, y, r);
    grd.addColorStop(0, "rgba(0,0,0," + intensity + ")");
    grd.addColorStop(0.6, "rgba(0,0,0," + (intensity * 0.92).toFixed(3) + ")");
    grd.addColorStop(1, "rgba(0,0,0,0)");
    fc.fillStyle = grd;
    fc.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // ---------- 门遮挡 ----------
  // 环境光仍是一整圈柔和的圆（墙不裁剪光圈），只有**关闭的门**会在迷雾上盖一层黑。
  // 判定方式：做两次格子级洪水填充 ——
  //   A = 假设所有门都开着时，玩家能到达的区域（只把墙当障碍）
  //   B = 当前门状态下，玩家能到达的区域（墙 + 关闭的门都是障碍）
  //   A \ B 就是"本来能到、因为某扇门关着而到不了"的地方，也就是真正的门后。
  // 于是墙后的房间照常亮着（不被切碎），而门后是黑的；门一推开，它从 A\B 里消失，立刻亮起来。
  function floodReach(g, seen, queue, solid) {
    const size = g.map.size;
    seen.fill(0);
    const stx = Math.floor(g.player.x / TILE), sty = Math.floor(g.player.y / TILE);
    if (stx < 0 || sty < 0 || stx >= size || sty >= size) return false;
    const R = CONFIG.LIGHT_RADIUS, R2 = R * R;
    let head = 0, tail = 0;
    const s0 = sty * size + stx;
    seen[s0] = 1;
    queue[tail++] = s0;
    while (head < tail) {
      const idx = queue[head++];
      const x = idx % size, y = (idx / size) | 0;
      for (let k = 0; k < 4; k++) {
        const nx = x + (k === 0 ? 1 : k === 1 ? -1 : 0);
        const ny = y + (k === 2 ? 1 : k === 3 ? -1 : 0);
        if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue;
        const dx = nx - stx, dy = ny - sty;
        if (dx * dx + dy * dy > R2) continue;
        const ni = ny * size + nx;
        if (seen[ni]) continue;
        seen[ni] = 1;                 // 障碍格自身看得见（能看见门板/墙面）
        if (solid(nx, ny)) continue;  // 但不穿透
        queue[tail++] = ni;
      }
    }
    return true;
  }

  function updateDoorBlock(g) {
    const size = g.map.size;
    if (!g.blocked || g.blocked.length !== size * size) {
      g.blocked = new Uint8Array(size * size);
      g.seenA = new Uint8Array(size * size);
      g.seenB = new Uint8Array(size * size);
      g.qA = new Int32Array(size * size);
      g.qB = new Int32Array(size * size);
    }
    const blocked = g.blocked;
    blocked.fill(0);
    // 没有门（或门全开着）就无需遮挡
    let anyClosed = false;
    for (const d of g.map.doors) { if (!d.open && (d.floor | 0) === g.floor) { anyClosed = true; break; } }
    if (!anyClosed) return;

    const floor = g.floor, map = g.map;
    floodReach(g, g.seenA, g.qA, (x, y) => gridAt(map, x, y, floor) === 1);
    floodReach(g, g.seenB, g.qB, (x, y) => solidAt(map, x, y, floor));
    const A = g.seenA, B = g.seenB;
    const stx = Math.floor(g.player.x / TILE), sty = Math.floor(g.player.y / TILE);
    const R = CONFIG.LIGHT_RADIUS, R2 = R * R;
    const yA = Math.max(0, sty - R), yB = Math.min(size - 1, sty + R);
    const xA = Math.max(0, stx - R), xB = Math.min(size - 1, stx + R);
    for (let ty = yA; ty <= yB; ty++) {
      const dy = ty - sty, dy2 = dy * dy;
      for (let tx = xA; tx <= xB; tx++) {
        const dx = tx - stx;
        if (dx * dx + dy2 > R2) continue;
        const i = ty * size + tx;
        if (A[i] && !B[i]) blocked[i] = 1; // 门后
      }
    }
  }

  // ---------- 手电筒 ----------
  // 射线扫描出真正的锥形光：从玩家出发，在朝向 ±半角内逐条投射，
  // 遇墙或关闭的门即截断，沿途把格子标记为已探索。
  // 返回一个闭合多边形的点集（起点 + 扇形弧上的落点）。
  function updateFlashCone(g) {
    const p = g.player;
    if (!g.flashlight || isLevel(g, 6)) {
      g.flCone = null; g.flConeInner = null; g.flWallHits = null; g.flWallPoly = null;
      return;
    }
    const len = CONFIG.FL_LENGTH * TILE;
    const half = CONFIG.FL_HALF_ANGLE;
    const soft = CONFIG.FL_SOFT_ANGLE || half * 1.3; // 外层柔光（比主锥更宽）
    const step = Math.min(CONFIG.FL_RAY_STEP, 0.006);
    // 注意：faceX 为 0（正朝上/下走）时不能写成 (p.faceX || 1)，否则角度会歪成 45°
    const baseA = (p.faceX === 0 && p.faceY === 0) ? Math.PI / 2 : Math.atan2(p.faceY, p.faceX);
    // 手持晃动：光轴轻微摆动
    const shake = Math.sin(g.time * 7.3) * 0.016 + Math.sin(g.time * 3.7) * 0.012;
    const explored = g.explored[g.floor] || g.explored[0];
    const size = g.map.size, T = TILE, floor = g.floor;
    const outer = [{ x: p.x, y: p.y }];
    const inner = [{ x: p.x, y: p.y }];
    // 只有射线真正打中的墙格才会被照亮；墙后的、光锥外的、玩家背后的墙一律不记。
    const wallHits = new Map();
    // 擦墙用的多边形比可见光锥略微延长，好把被打中的那面墙整格包进来。
    const wallPoly = [{ x: p.x, y: p.y }];
    // 射线与格子边界精确求交（DDA）。以前按固定步长采样、一进墙格就停，
    // 落点差半格到一格，相邻射线在墙上拼出一排台阶 —— 那才是「锯齿」的真身，
    // 跟雾的分辨率无关。现在落点严格贴在墙面上，同一面墙上的点共线。
    const cast = (ang) => {
      const dx = Math.cos(ang), dy = Math.sin(ang);
      let tx = Math.floor(p.x / T), ty = Math.floor(p.y / T);
      const sx = dx > 0 ? 1 : -1, sy = dy > 0 ? 1 : -1;
      let tX = dx !== 0 ? ((dx > 0 ? (tx + 1) * T : tx * T) - p.x) / dx : Infinity;
      let tY = dy !== 0 ? ((dy > 0 ? (ty + 1) * T : ty * T) - p.y) / dy : Infinity;
      const dX = dx !== 0 ? Math.abs(T / dx) : Infinity;
      const dY = dy !== 0 ? Math.abs(T / dy) : Infinity;
      let t = 0, edge = "x";
      for (let guard = 0; guard < 512; guard++) {
        if (tx >= 0 && ty >= 0 && tx < size && ty < size) explored[ty][tx] = true;
        if (t > 0.01 && solidAt(g.map, tx, ty, floor)) {
          return {
            x: p.x + dx * t, y: p.y + dy * t, t: t,
            hit: { tx: tx, ty: ty, t: t, d: t, edge: edge,
                   hx: p.x + dx * t, hy: p.y + dy * t }
          };
        }
        const tn = Math.min(tX, tY);
        if (tn >= len) return { x: p.x + dx * len, y: p.y + dy * len, t: len, hit: null };
        t = tn;
        if (tX <= tY) { tx += sx; tX += dX; edge = "x"; }
        else          { ty += sy; tY += dY; edge = "y"; }
      }
      return { x: p.x + dx * len, y: p.y + dy * len, t: len, hit: null };
    };
    for (let a = -soft; a <= soft + 1e-9; a += step) {
      const ang = baseA + a + shake;
      const r = cast(ang);
      outer.push({ x: r.x, y: r.y });
      wallPoly.push({ x: p.x + Math.cos(ang) * (r.t + T * 0.9),
                      y: p.y + Math.sin(ang) * (r.t + T * 0.9) });
      if (Math.abs(a) <= half + 1e-9) inner.push({ x: r.x, y: r.y });
      if (r.hit) {
        const k = r.hit.tx + "," + r.hit.ty, prev = wallHits.get(k);
        if (!prev || r.t < prev.t) wallHits.set(k, r.hit);
      }
    }
    g.flCone = outer;
    g.flConeInner = inner;
    g.flWallHits = wallHits;
    g.flWallPoly = wallPoly;
  }

  // 用光锥多边形擦亮迷雾：
  // 先铺一层更宽更暗的外锥，再叠一层主锥 —— 边缘自然过渡，且比 canvas blur 快得多
  function eraseFlashlight(fc, g) {
    const outer = g.flCone, inner = g.flConeInner;
    if (!outer || outer.length < 3) return;
    const p = g.player;
    const len = CONFIG.FL_LENGTH * TILE;
    const x = p.x * FOG_SCALE, y = p.y * FOG_SCALE, r = len * FOG_SCALE;
    fc.globalCompositeOperation = "destination-out";

    // 外层虚光（边缘柔化）
    const softG = fc.createRadialGradient(x, y, TILE * 0.12 * FOG_SCALE, x, y, r);
    softG.addColorStop(0, "rgba(0,0,0,0.5)");
    softG.addColorStop(0.7, "rgba(0,0,0,0.3)");
    softG.addColorStop(1, "rgba(0,0,0,0)");
    fillCone(fc, outer, softG);

    // 主光锥（中心亮、远端衰减）
    if (inner && inner.length >= 3) {
      const grd = fc.createRadialGradient(x, y, TILE * 0.12 * FOG_SCALE, x, y, r);
      grd.addColorStop(0, "rgba(0,0,0,0.97)");
      grd.addColorStop(0.35, "rgba(0,0,0,0.9)");
      grd.addColorStop(0.75, "rgba(0,0,0,0.58)");
      grd.addColorStop(1, "rgba(0,0,0,0)");
      fillCone(fc, inner, grd);
    }
    // 墙壁：只有被光真正打中的那面墙才亮。按墙面朝向把命中格合并成连续段，
    // 沿墙面铺一条直线光带（中间平、两端柔和淡出），再裁进精确的光锥多边形。
    // 不用径向圆斑 —— 那会把墙照成一团圆光，完全不是手电打在平面上的样子。
    const hits = g.flWallHits;
    if (hits && hits.size) {
      const reach = CONFIG.FL_LENGTH * TILE, T = TILE;
      const groups = new Map();
      for (const w of hits.values()) {
        const key = w.edge + ":" + (w.edge === "x" ? w.tx : w.ty);
        let grp = groups.get(key);
        if (!grp) {
          grp = { edge: w.edge, cells: [], hx: w.hx, hy: w.hy, t: w.t };
          groups.set(key, grp);
        }
        grp.cells.push(w.edge === "x" ? w.ty : w.tx);
        if (w.t < grp.t) { grp.t = w.t; grp.hx = w.hx; grp.hy = w.hy; }
      }
      const poly = g.flWallPoly || g.flCone;
      fc.save();
      fc.globalCompositeOperation = "destination-out";
      fc.beginPath();
      fc.moveTo(poly[0].x * FOG_SCALE, poly[0].y * FOG_SCALE);
      for (let i = 1; i < poly.length; i++) fc.lineTo(poly[i].x * FOG_SCALE, poly[i].y * FOG_SCALE);
      fc.closePath();
      fc.clip();
      // 两端只留极窄的柔化，光斑的真实边界交给光锥斜边（clip）去切，
      // 否则一段一格宽的墙会被两端淡出挤成一团圆光。
      const fade = T * 0.25;
      for (const grp of groups.values()) {
        const cells = Array.from(new Set(grp.cells)).sort((a, b) => a - b);
        const runs = [];
        let s = cells[0], e = cells[0];
        for (let i = 1; i < cells.length; i++) {
          if (cells[i] === e + 1) e = cells[i];
          else { runs.push([s, e]); s = e = cells[i]; }
        }
        runs.push([s, e]);
        for (const [a, b] of runs) {
          const c0 = a * T, c1 = (b + 1) * T, span = c1 - c0;
          const wallX = grp.hx, wallY = grp.hy;
          let x0, y0, w, h;
          if (grp.edge === "x") {          // 竖直墙面，沿 y 铺开
            const dir = p.x < wallX ? 1 : -1;
            x0 = dir > 0 ? wallX : wallX - T * 0.85;
            y0 = c0; w = T * 0.85; h = span;
          } else {                         // 水平墙面，沿 x 铺开
            const dir = p.y < wallY ? 1 : -1;
            x0 = c0; y0 = dir > 0 ? wallY : wallY - T * 0.85;
            w = span; h = T * 0.85;
          }
          const wx = grp.edge === "x" ? wallX : (c0 + c1) / 2;
          const wy = grp.edge === "x" ? (c0 + c1) / 2 : wallY;
          const d = Math.hypot(wx - p.x, wy - p.y);
          const strength = Math.max(0, 1 - d / (reach + T)) * 0.92;
          if (strength <= 0.02) continue;
          const f = Math.min(0.22, fade / span);   // 中间留平段，两端才略柔，不成圆
          const dirIn = (grp.edge === "x") ? (p.x < wallX ? 1 : -1)
                                          : (p.y < wallY ? 1 : -1);
          // 两个正交线性渐变相乘：沿墙面方向两端淡出，沿进深方向从墙面往里淡出。
          // 乘积 mask 贴在雾上，全程连续，没有分层条带、没有方格台阶、也没有圆斑。
          if (!g.flBand) {
            const t = document.createElement("canvas"); t.width = 256; t.height = 256;
            g.flBand = t; g.flBandCtx = t.getContext("2d");
          }
          const tc = g.flBandCtx, N = 256;
          tc.setTransform(1, 0, 0, 1, 0, 0);
          tc.globalCompositeOperation = "source-over";
          tc.globalAlpha = 1;
          tc.clearRect(0, 0, N, N);
          const alongX = grp.edge !== "x";   // 墙面沿 x（水平墙）时 A 是水平渐变
          const gA = tc.createLinearGradient(0, 0, alongX ? N : 0, alongX ? 0 : N);
          gA.addColorStop(0, "rgba(0,0,0,0)");
          gA.addColorStop(f, "rgba(0,0,0," + strength.toFixed(3) + ")");
          gA.addColorStop(1 - f, "rgba(0,0,0," + strength.toFixed(3) + ")");
          gA.addColorStop(1, "rgba(0,0,0,0)");
          tc.fillStyle = gA;
          tc.fillRect(0, 0, N, N);
          tc.globalCompositeOperation = "destination-in";
          const gB = tc.createLinearGradient(0, 0, alongX ? 0 : N, alongX ? N : 0);
          if (dirIn > 0) {           // 画布起点是墙面，往里渐暗
            gB.addColorStop(0, "rgba(0,0,0,1)");
            gB.addColorStop(0.55, "rgba(0,0,0,1)");
            gB.addColorStop(1, "rgba(0,0,0,0)");
          } else {                    // 画布终点是墙面：靠墙的一大段保持亮，往墙里渐暗
            gB.addColorStop(0, "rgba(0,0,0,0)");
            gB.addColorStop(0.45, "rgba(0,0,0,1)");
            gB.addColorStop(1, "rgba(0,0,0,1)");
          }
          tc.fillStyle = gB;
          tc.fillRect(0, 0, N, N);
          tc.globalCompositeOperation = "source-over";
          fc.globalAlpha = 1;
          fc.drawImage(g.flBand, 0, 0, N, N,
            x0 * FOG_SCALE, y0 * FOG_SCALE, w * FOG_SCALE, h * FOG_SCALE);
        }
      }
      fc.restore();
    }
  }

  function fillCone(fc, pts, style) {
    fc.fillStyle = style;
    fc.beginPath();
    fc.moveTo(pts[0].x * FOG_SCALE, pts[0].y * FOG_SCALE);
    for (let i = 1; i < pts.length; i++) fc.lineTo(pts[i].x * FOG_SCALE, pts[i].y * FOG_SCALE);
    fc.closePath();
    fc.fill();
  }

  // ---------- 摄像机 ----------
  function getCamera() {
    const g = game;
    // 以屏幕较长边为基准缩放，横竖屏都能留出合适视野
    const scale = Math.max(W, H) / (CONFIG.VISIBLE_TILES * TILE);
    const viewW = W / scale, viewH = H / scale;
    const mapPx = g.map.size * TILE;
    // cam 表示"屏幕中心对应的世界坐标"
    let cx, cy;
    if (viewW >= mapPx) cx = mapPx / 2;
    else cx = clamp(g.player.x, viewW / 2, mapPx - viewW / 2);
    if (viewH >= mapPx) cy = mapPx / 2;
    else cy = clamp(g.player.y, viewH / 2, mapPx - viewH / 2);
    // 无限层级（Level 14）：窗口跟着玩家走，永远看不到"世界之外"
    if (g.map.infinite) { cx = g.player.x; cy = g.player.y; }
    return { scale, x: cx, y: cy, viewW, viewH };
  }

  // ---------- 更新 ----------
  // ---------- 各层级的专属机制 ----------
  // Level 13/14 的"长时间游荡"，Level 14 会动且致命的树，Level 70 的极寒与车流。
  // ---------- 通用水域：下沉 / 溺水 ----------
  // 以前只有 Level 7 的深海有"在水里"这回事，其余层级（119 水上乐园、
  // 37 池房、17 淹水的走廊……）踩进水里只是走得慢一点，水下什么都没有 ——
  // 于是"掉进水里"在这游戏里根本不成立。
  // 现在所有水域统一这套：
  //   踩进水里会往下沉；完全沉没之后开始计时；30 秒后 5 血/秒地掉血；
  //   死了就是「溺死」结局。
  //   沉在水底时爬不上岸（走到边上也没用）—— 按空格 / 点「上浮」浮回水面，
  //   露出水面就不再掉血，这时才能爬回岸上。
  // Level 7（氧气 / 水压）与 994（涨潮）各有各的机制，不在这里重复扣。
  // 10.1 尸湖是中毒，也不是溺水。
  const SINK_TIME = 2.4;      // 从踩进水里到完全沉没（秒）
  const RISE_TIME = 0.9;      // 按上浮之后浮回水面要多久
  const DROWN_GRACE = 30;     // 沉底之后还能撑多久（秒）
  const DROWN_DPS = 5;        // 撑过之后每秒掉多少血
  const SURFACE_AT = 0.35;    // sink 低于这个值就算"露在水面上"

  function waterTileAt(g) {
    const m = g.map;
    if (!m) return false;
    const tx = Math.floor(g.player.x / TILE), ty = Math.floor(g.player.y / TILE);
    const k = tx + "," + ty;
    if (m.water && m.water.has(k)) return true;
    if (m.pools && m.pools.has(k)) return true;
    if (m.lakes && m.lakes.has(k)) return true;
    if (m.river && m.river.has(k)) return true;
    return false;
  }
  function inAnyWater(g) {
    if (!g || !g.map || !g.player) return false;
    const lv = String(g.level);
    if (lv === "7" || lv === "994" || lv === "10.1") return false;  // 各有各的死法
    return waterTileAt(g);
  }
  function isSubmerged(g) { return (g.sink || 0) >= 0.999; }

  function updateWaterSink(g, dt) {
    if (!g || g.phase !== "playing") return false;
    g.wantUp = !!g.wantUpBtn;                       // 手机「上浮」按钮
    if (!inAnyWater(g)) {                           // 回到岸上：一切归零
      g.sink = 0; g.drownT = 0; g.drownWarn = false;
      if (el.btnUp) { el.btnUp.classList.remove("ready"); hide(el.btnUp); }
      return false;
    }
    // 手机「上浮」：沉到水面以下才亮出来（浮着的时候不用它）
    if (el.btnUp) {
      if ((g.sink || 0) >= SURFACE_AT) { show(el.btnUp); el.btnUp.classList.add("ready"); }
      else { el.btnUp.classList.remove("ready"); hide(el.btnUp); }
    }
    const wantUp = !!(keys && keys.Space) || !!g.wantUp;
    if (wantUp) {
      g.sink = Math.max(0, (g.sink || 0) - dt / RISE_TIME);
      g.drownT = Math.max(0, (g.drownT || 0) - dt * 2.2);   // 浮上来就缓过来了
    } else {
      g.sink = Math.min(1, (g.sink || 0) + dt / SINK_TIME);
    }
    if (isSubmerged(g)) {
      g.drownT = (g.drownT || 0) + dt;
      if (g.drownT > DROWN_GRACE) {
        if (!g.drownWarn) {
          g.drownWarn = true;
          toast("肺里全是水 —— 按 <b>空格</b> 往上浮！");
        }
        if (!g.invincible) g.hp -= DROWN_DPS * dt;
        if (g.hp <= 0) {
          g.deathCause = "沉在水里，没能浮上来";
          unlockEnding(8);
          showDead();
          return true;
        }
      }
    }
    return false;
  }


  // ---------- 花园段 / 砼苑：站着不动，植被就顺着腿长上来 ----------
  // 花园段是 Level 1 下层右上角那十几格；砼苑是它"广阔到成为一个层级"的版本。
  // 两者同一个特性：流浪者不动的时候，植物把他捆住，以其身躯为养料，直到彻底分解。
  const VINE_GROW = 5.0;     // 一动不动，多久被彻底缠住（秒）
  const VINE_FREE = 2.0;     // 走起来之后，每秒消退多少
  const VINE_GRIP = 0.45;    // 缠到这个程度就开始迈不开腿
  const VINE_EAT  = 0.80;    // 到这个程度开始被分解（掉血）
  function inGardenZone(g) {
    if (!g || !g.map || !g.player) return false;
    const lv = String(g.level);
    if (lv === "1.2") return true;
    if (lv === "1" && g.map.garden) {
      return (g.map.gardenFloor | 0) === (g.floor | 0) && g.map.garden.has(tileKeyOf(g.player));
    }
    return false;
  }
  function updateGardenVines(g, dt) {
    if (!g || g.phase !== "playing") return false;
    if (!inGardenZone(g)) {
      if (g.vine) { g.vine = 0; g.vineWarn = false; }
      return false;
    }
    if (!g.gardenSeen) {                        // 头一次踏进来，说清楚规矩
      g.gardenSeen = true;
      toast("脚下的植被在往上长 —— <b>别停下</b>，一停它就会缠住你");
    }
    const moving = !!(g.player && g.player.moving);
    if (moving) g.vine = Math.max(0, (g.vine || 0) - dt / VINE_FREE);
    else g.vine = Math.min(1, (g.vine || 0) + dt / VINE_GROW);
    if (g.vine > VINE_GRIP && !g.vineWarn) {
      g.vineWarn = true;
      toast("藤蔓缠住了你的腿 —— 快走，别站着！");
    }
    if (g.vine < 0.15) g.vineWarn = false;
    if (g.vine >= VINE_EAT) {
      if (!g.invincible) g.hp -= 9 * dt;
      if (g.hp <= 0) {
        g.deathCause = "站着不动，被植被缠住、分解";
        showDead();
        return true;
      }
    }
    return false;
  }

  function updateLevelMechanics(g, dt) {
    // ---- 通用水域：下沉 / 溺水（所有水域，所有层级） ----
    if (updateWaterSink(g, dt)) return;
    // ---- 花园段 / 砼苑：站着不动就被植被吃掉 ----
    if (updateGardenVines(g, dt)) return;
    // Level 1.1 区域 4 尽头那道"光"：靠近它的人，再也没人见过
    if (String(g.level) === "1.1") {
      for (const p of (g.map.props || [])) {
        if (p.type !== "lightcursor") continue;
        if (Math.hypot((p.x + 0.5) * TILE - g.player.x, (p.y + 0.5) * TILE - g.player.y) < TILE * 2.0) {
          g.deathCause = "你走向了那道光 —— 再也没人见过你";
          showDead();
          return;
        }
      }
    }
    if (updateGardenVines(g, dt)) return;

    // ---- Level 36：航班倒计时 ----
    // 这里是唯一走得动的"钟"：倒计时归到 1000 就开始登机，归零这班就消失。
    if (String(g.level) === "36") {
      const gates = g.map.gates || [];
      for (const gp of gates) {
        if (gp.countdown == null) continue;
        // 时间膨胀 —— 数字跳得比你想的快
        gp.countdown -= dt * 60;
        if (gp.countdown <= 0) {
          // 这班走了：换一班新的，目的地也换一个
          gp.countdown = 3000 + Math.floor(Math.random() * 9000);
          gp.flight = "BTA-" + (100 + Math.floor(Math.random() * 8999));
          const pool = (typeof flightDestPool === "function") ? flightDestPool() : ["11"];
          gp.dest = pool[Math.floor(Math.random() * pool.length)];
        }
      }
      // 公共服务通告：偶尔播一句
      g.paTimer = (g.paTimer || 0) + dt;
      if (g.paTimer > 26) {
        g.paTimer = 0;
        const boarding = gates.filter((x) => x.countdown > 0 && x.countdown <= 1000);
        const pick = boarding.length ? boarding[Math.floor(Math.random() * boarding.length)] : null;
        if (pick) {
          toast("「" + (pick.flight || "") + " 号航班现在开始登机，请前往 "
            + (pick.gate || "?") + " 号登机口。」");
        } else {
          toast("「由于本层级时间流速异常，所有航班的时刻表仅供参考。」");
        }
      }
    }

    // 累计走过的距离（用于"长时间游荡"型出口）
    if (!g._lastPos) g._lastPos = { x: g.player.x, y: g.player.y };
    const moved = Math.hypot(g.player.x - g._lastPos.x, g.player.y - g._lastPos.y);
    g._lastPos = { x: g.player.x, y: g.player.y };

    // ---- 长时间游荡：极低概率切出 ----
    // 注意：这里累计的是"真的在走"的时间（秒），不是走过的像素距离。
    // 之前按距离算，1500px 大约就是 5 秒，结果 Level 14 走进去没几步就被弹走了。
    const w = g.map.wander;
    if (w) {
      if (moved > 0.6) w.acc += dt;              // 站着不动不算数
      if (w.acc > w.need) {
        w.acc = 0;
        if (Math.random() < w.chance) {
          const to = Array.isArray(w.to) ? w.to[randInt(0, w.to.length - 1)] : w.to;
          const nm = levelDef(to).name;
          startTransition("你走得够久了", "周围的景色开始松动 —— 你切进了 " + nm + " ...",
            { kind: "toLevelX", level: to });
          return;
        }
      }
    }

    // ---- 数值异常变动（没开开发者权限）= 你作弊了 -> Level 363 ----
    // 档案原文：在没有开启开发者权限的情况下数值异常变动就会来到这里。
    // 血 / 理智 / 背包容量超出正常上限，而权限没开 —— 那就不是"运气好"。
    if (g.phase === "playing" && String(g.level) !== "363" && String(g.level) !== "shattered") {
      const devOn = (window.__devOK === true);
      const overMax = (typeof g.hp === "number" && g.hp > CONFIG.HP_MAX + 1)
                   || (typeof g.sanity === "number" && g.sanity > CONFIG.SANITY_MAX + 1);
      if (!devOn && overMax) {
        startTransition("数值异常", "有什么东西被改过了 —— 地板在你脚下换了颜色，然后你摔倒了 ...",
          { kind: "toLevelX", level: 363 });
        return;
      }
    }

    // ---- Level 363 你作弊了：切不出去的房间 + 撑不过 11 分钟的时间线 ----
    if (String(g.level) === "363" && window.updateCheat363) {
      window.updateCheat363(g, dt, {
        spawn: (kind, where) => {
          let ok = null;
          // 猎犬是从"门口远处的黑暗里"出现的 —— 就刷在门后那片黑地里
          if (where === "dark363") ok = (t) => !!(g.map.dark363 && g.map.dark363.has(t.x + "," + t.y));
          try { return spawnEntityAt(g, kind, ok); } catch (e) { return false; }
        },
        kHeld: (k) => { try { return !!kHeld(k); } catch (e) { return false; } },
        toast: (m) => { try { toast(m); } catch (e) { /* 忽略 */ } },
        showDead: () => { try { showDead(); } catch (e) { /* 忽略 */ } },
        sfx: () => { try { AudioSys.exitChime && AudioSys.exitChime(); } catch (e) { /* 忽略 */ } },
      });
    }
    // ---- 隐秘层级 破碎之地：无序的数据正在侵蚀你的结构 ----
    if (String(g.level) === "shattered" && window.updateShattered) {
      window.updateShattered(g, dt, {
        toast: (m) => { try { toast(m); } catch (e) { /* 忽略 */ } },
        showDead: () => { try { showDead(); } catch (e) { /* 忽略 */ } },
      });
    }

    // ---- Level 5：进门边上那台收音机 ----
    updateRadio(g);

    // ---- Level 4：走进那片罩着黑雾的草地 -> Level 10 ----
    if (isLevel(g, 4) && g.map.grass && g.phase === "playing") {
      const tx = Math.floor(g.player.x / TILE), ty = Math.floor(g.player.y / TILE);
      if (g.map.grass.has(tx + "," + ty)) {
        AudioSys.exitChime();
        startTransition("走进了那片黑雾",
          "脚下从地毯变成了泥土，铅灰色的天空压得很低 —— 你走进了 Level 10 ...",
          { kind: "toLevelX", level: 10 });
        return;
      }
    }

    // ---- Level 14：撞到树会死，而且树还会动 ----
    if (isLevel(g, 14)) {
      syncAmbientNoise(g);
      l14Maintain(g);
      const trees = g.map.trees || [];
      const ptx = Math.floor(g.player.x / TILE), pty = Math.floor(g.player.y / TILE);
      for (const tr of trees) {
        if (tr.floor !== g.floor) continue;
        if (Math.hypot((tr.x + 0.5) * TILE - g.player.x, (tr.y + 0.5) * TILE - g.player.y) < TILE * 0.42) {
          if (g.invincible) continue;                  // 无敌模式：撞树也不死
          g.deathCause = "撞上了一棵树";
          AudioSys.growl();
          showDead();
          return;
        }
      }
      updateL14(g, dt);          // 精神危害：那个"小孩"
      // 树会缓慢地挪位置
      g._treeT = (g._treeT || 0) + dt;
      if (g._treeT > 2.5) {
        g._treeT = 0;
        const t = trees[randInt(0, trees.length - 1)];
        if (t) {
          const dx = randInt(-1, 1), dy = randInt(-1, 1);
          const nx = clamp(t.x + dx, 2, g.map.size - 3), ny = clamp(t.y + dy, 2, g.map.size - 3);
          // 别挪到玩家脸上
          if (Math.hypot(nx - ptx, ny - pty) > 3) { t.x = nx; t.y = ny; }   // 别挪到玩家脸上
        }
      }
    }

    // ---- Level 70：极寒 / 车流 ----
    if (isLevel(g, 70)) {
      const map = g.map;
      const tx = Math.floor(g.player.x / TILE), ty = Math.floor(g.player.y / TILE);
      const indoors = map.indoor && map.indoor.has(tx + "," + ty);
      if (g.bodyTemp == null) g.bodyTemp = 100;
      // 室外持续流失体温，室内回暖；河里最冷
      const inRiver = map.river && map.river.has(tx + "," + ty);
      if (indoors) g.bodyTemp = Math.min(100, g.bodyTemp + 9 * dt);
      else g.bodyTemp = Math.max(0, g.bodyTemp - (inRiver ? 7.5 : 4.2) * dt);
      if (g.bodyTemp <= 0) {
        g.hp = Math.max(0, g.hp - 9 * dt);
        if (g.hp <= 0) { g.deathCause = "在雪地里失温"; showDead(); return; }
      }
      g.indoorsNow = indoors;

      // 车会自己开，驾驶技术极差
      for (const v of (map.vehicles || [])) {
        if (!v.alive) continue;
        v.turn -= dt;
        if (v.turn <= 0) {
          v.turn = rand(0.6, 2.2);
          const a = rand(0, Math.PI * 2);
          v.vx = Math.cos(a) * rand(1.0, 2.2);
          v.vy = Math.sin(a) * rand(1.0, 2.2);
        }
        v.x += v.vx * dt; v.y += v.vy * dt;
        if (v.x < 3 || v.x > map.size - 4) { v.vx *= -1; v.x = clamp(v.x, 3, map.size - 4); }
        if (v.y < 3 || v.y > map.size - 4) { v.vy *= -1; v.y = clamp(v.y, 3, map.size - 4); }
        if (Math.hypot(v.x - tx, v.y - ty) < 0.9) {
          g.hp = Math.max(0, g.hp - 26);
          AudioSys.collapse();
          toast("一辆车撞了过来 —— 它甚至没有减速。");
          v.alive = false;
          if (g.hp <= 0) { g.deathCause = "被一辆无人驾驶的车撞死"; showDead(); return; }
        }
      }
    }
  }

  // ---------- Level 0 四片大区域：进入提示 / 身后形变 / 微光脱身 / 拱洞倚坐 ----------
  const L0_ZONE_DESC = {
    arch: "拱门区 —— 苍白墙上开着浅棕的拱洞，地毯厚得拖脚；身后的空间不会移动",
    pillar: "柱厅 —— 立柱纵横交错望不到头，地面干燥；身后的路会悄悄变样",
    blackout: "熄灯区 —— 越往里越黑；只有手电筒能推开黑",
  };
  // 形变之前先确认：从玩家脚下还走得到地图中心（主厅），否则回滚
  function l0ReachMid(g, grid, px, py) {
    const size = g.map.size, mid = Math.floor(size / 2);
    if (px < 1 || py < 1 || px >= size - 1 || py >= size - 1 || grid[py][px] !== 0) return false;
    const seen = new Uint8Array(size * size);
    const q = [py * size + px];
    seen[py * size + px] = 1;
    const target = mid * size + mid;
    while (q.length) {
      const cur = q.pop();
      if (cur === target) return true;
      const cx = cur % size, cy = (cur / size) | 0;
      const nbs = [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]];
      for (const nb of nbs) {
        const nx = nb[0], ny = nb[1];
        if (nx < 1 || ny < 1 || nx >= size - 1 || ny >= size - 1) continue;
        const id = ny * size + nx;
        if (seen[id] || grid[ny][nx] !== 0) continue;
        seen[id] = 1; q.push(id);
      }
    }
    return false;
  }
  function updateL0Zones(g, dt) {
    if (String(g.level) !== "0" || !g.map || !g.map.l0zones) { g.l0zoneNow = null; return; }
    const L = g.map.l0zones;
    const zk = l0ZoneAt(g);
    if (zk !== g.l0zoneNow) {
      g.l0zoneNow = zk;
      if (zk && L0_ZONE_DESC[zk]) toast(L0_ZONE_DESC[zk]);
    }
    // 拱洞倚坐：暂时摆脱湿润地面，回一点理智与体力
    if (g.l0perch > 0) {
      g.l0perch = Math.max(0, g.l0perch - dt);
      g.sanity = Math.min(CONFIG.SANITY_MAX, (g.sanity || 0) + 2.2 * dt);
      g.player.stamina = Math.min(CONFIG.STAMINA_MAX, (g.player.stamina || 0) + 9 * dt);
    }
    // 熄灯区里没有任何区内出口标记或发光物件。摸出区域边界就回到有照明的
    // 正常 Level 0 区域 —— 那才是档案里说的「视线中的第一缕微光」。
    // 身后形变：柱厅只把整行 / 整列的 2×2 墙块平移到下一个对齐格位；
    // 熄灯区的墙会重排，来路因此难以辨认。
    // 拱门区「稳定性最佳」—— 身后的空间既不移动也不形变；深坑区同样不动。
    if (zk !== "pillar" && zk !== "blackout") return;
    g.l0morphT = (g.l0morphT || 0) + dt;
    if (g.l0morphT < (zk === "blackout" ? 2.4 : 3.4)) return;
    g.l0morphT = 0;
    const grid = g.map.layers[0];
    const px = Math.floor(g.player.x / TILE), py = Math.floor(g.player.y / TILE);
    if (zk === "pillar") {
      // 柱厅「身后形变」只做整行 / 整列平移：每个 2×2 普通墙块搬到下一个对齐格位，
      // 行、列依旧对齐，不会变成随机散点，也不会出现白色圆柱或半块柱子。
      const info = L.pillarGrid || null;
      const blocks = L.pillarBlocks || [];
      if (!info || !blocks.length || !info.cols || !info.rows) return;
      const { x0, y0, step, cols, rows } = info;
      const wrap = (v, n) => ((v % n) + n) % n;
      const tryShift = (axis, idx, dir) => {
        const set = blocks.filter((b) => axis === "row" ? b.row === idx : b.col === idx);
        if (!set.length) return false;
        const dest = set.map((b) => {
          if (axis === "row") {
            const col = wrap(b.col + dir, cols);
            return { row: b.row, col, x: x0 + col * step, y: y0 + b.row * step };
          }
          const row = wrap(b.row + dir, rows);
          return { row, col: b.col, x: x0 + b.col * step, y: y0 + row * step };
        });
        const nearPlayer = (x, y) => Math.hypot(x + 0.5 - px, y + 0.5 - py) < 8;
        if (set.some((b) => nearPlayer(b.x, b.y)) || dest.some((d) => nearPlayer(d.x, d.y))) return false;
        const union = new Set();
        for (const b of set) for (const k of b.cells) union.add(k);
        for (const d of dest) {
          for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) {
            const x = d.x + i, y = d.y + j, k = x + "," + y;
            if (!grid[y] || x < 0 || y < 0 || x >= grid.length || y >= grid.length) return false;
            if (Math.abs(x - px) <= 1 && Math.abs(y - py) <= 1) return false;
            union.add(k);
          }
        }
        const keys = [...union];
        const beforeCells = keys.map((k) => {
          const [x, y] = k.split(",").map(Number);
          return { k, v: grid[y][x], has: L.pillars.has(k), part: L.pillarPart.get(k) };
        });
        const beforeBlocks = blocks.map((b) => ({ ...b, cells: b.cells.slice() }));
        const beforePillars = new Set(L.pillars);
        const beforePart = new Map(L.pillarPart);
        const restore = () => {
          for (const c of beforeCells) {
            const [x, y] = c.k.split(",").map(Number);
            grid[y][x] = c.v;
            if (c.has) L.pillars.add(c.k); else L.pillars.delete(c.k);
            if (c.part) L.pillarPart.set(c.k, c.part); else L.pillarPart.delete(c.k);
          }
          L.pillars = beforePillars;
          L.pillarPart = beforePart;
          L.pillarBlocks.splice(0, L.pillarBlocks.length,
            ...beforeBlocks.map((b) => ({ ...b, cells: b.cells.slice() })));
        };
        for (const b of set) for (const k of b.cells) {
          const [x, y] = k.split(",").map(Number);
          grid[y][x] = 0; L.pillars.delete(k); L.pillarPart.delete(k);
          if (L.zoneOf) L.zoneOf.set(k, "pillar");
        }
        set.forEach((b, i) => {
          const d = dest[i], cells = [];
          for (let j = 0; j < 2; j++) for (let k = 0; k < 2; k++) {
            const x = d.x + k, y = d.y + j, ck = x + "," + y;
            grid[y][x] = 1;
            if (L.zoneOf) L.zoneOf.set(ck, "pillar");
            L.pillars.add(ck); L.pillarPart.set(ck, { dx: k, dy: j });
            cells.push(ck);
          }
          b.row = d.row; b.col = d.col; b.x = d.x; b.y = d.y; b.cells = cells;
        });
        if (l0ReachMid(g, grid, px, py)) {
          info.blocks = L.pillarBlocks.length;
          return true;
        }
        restore();
        return false;
      };
      const seq = (L.pillarShift || 0) + 1;
      L.pillarShift = seq;
      for (let t = 0; t < Math.max(cols, rows) * 2; t++) {
        const n = seq + t;
        const axis = (n % 2 === 0) ? "row" : "col";
        const maxIdx = axis === "row" ? rows : cols;
        if (!maxIdx) continue;
        const idx = Math.floor(n / 2) % maxIdx;
        const dir = (Math.floor(n / 4) % 2 === 0) ? 1 : -1;
        if (tryShift(axis, idx, dir)) { L.pillarShift = n + 1; return; }
      }
      return;
    }
    // 熄灯区：粗糙墙垛重排，来路同样变得难认
    const pool = (L.morph || []).filter((m) => m.zone === "blackout" && Math.hypot(m.x - px, m.y - py) > 8);
    if (!pool.length) return;
    for (let n = 0; n < 6; n++) {
      const m = pool[randInt(0, pool.length - 1)];
      const before = grid[m.y][m.x];
      grid[m.y][m.x] = before === 1 ? 0 : 1;
      if (l0ReachMid(g, grid, px, py)) return;
      grid[m.y][m.x] = before;
    }
  }

  function update(dt) {
    const g = game;
    // 关着的门要挡光 —— 而且得跟着玩家走。
    // 之前只在换层时算过一次，于是你站在走廊上，套房里照样亮堂堂的，
    // 冰箱、床、衣柜一览无余。现在每跨一格就重算一次"门后是哪些地方"。
    if (g.map && g.blocked) {
      const bt = Math.floor(g.player.x / TILE) + "," + Math.floor(g.player.y / TILE) + "," + g.floor;
      if (bt !== g.blockTile) { g.blockTile = bt; updateDoorBlock(g); }
    }
    // 非游戏进行中（过场 / 阅读 / 手册 / 死亡）一律不显示交互提示
    if (g.phase !== "playing") {
      hide(el.pickupHint);
      hide(el.doorHint);
      if (el.btnE) el.btnE.classList.remove("ready");
      if (el.btnAct) { el.btnAct.classList.remove("ready"); hide(el.btnAct); }
      hide(el.btnDoor);
    }
    if (g.phase === "dying") {
      g.deathTimer += dt;
      // 被笑魇杀死：先是一整屏的突脸（覆盖全部游戏画面），过一会儿才进死亡界面
      if (g.smilerScare) {
        // 设置里可以关掉那张脸 —— 关了就只有音效，不弹图
        if (g.deathTimer > 0.22 && el.scare && scareImgOn) show(el.scare);
        if (g.deathTimer > 1.9) { hide(el.scare); showDead(); }
      } else if (g.deathTimer > 1.0) showDead();
      return;
    }
    if (g.phase === "transition") {
      g.transTimer += dt;
      if (g.transTimer > 2.6) {
        // 过场结束：执行待办的层级切换（进入/离开子层级，或推进到下一层）
        const pt = g.pendingTrans;
        g.pendingTrans = null;
        applyPendingTrans(pt);
        hide(el.levelup);
      }
      return;
    }
    if (g.phase !== "playing") return;
    updateLevelMechanics(g, dt);
    updateL0Zones(g, dt);          // Level 0 四片大区域：提示 / 形变 / 微光 / 倚坐

    g.time += dt;
    // AI 游玩：由算法决定往哪走、要不要交互
    if (g.aiOn && window.AI) {
      window.AI.update(g, dt);
      runAiActions(g);
    }
    updatePlayer(g, dt);
    g.player.floor = g.floor;

    // 斜坡：斜着的正方形地面，踩上去切换到另一层
    updateRamps(g);

    // Level 7：海面上永远一只实体都没有（不只是"不刷"，浮上来时也要清干净）
    if (isLevel(g, 7)) l7ClearSurfaceEntities(g);

    // Level 94：白天没有实体出没 —— 音乐一停、天一黑，「动画」和笑魇、窃皮者、
    // 猎犬、雄性死亡飞蛾才一起出来。（尸鼠也有，但在定格动画的风格下，
    // 它们已经进化得跟普通老鼠一样了。）
    const a94 = (isLevel(g, 94) && window.a94Phase) ? window.a94Phase(g.map, performance.now()) : null;
    if (a94) {
      if (a94.name === "day") {
        if (g.entities && g.entities.length) g.entities.length = 0;
        g.a94night = false;
      } else if (a94.name === "night" && !g.a94night) {
        g.a94night = true;
        toast("音乐完全停止了 —— 喇叭哑了。天黑了，它们出来了。");
      }
    }

    // 实体随机生成（随时间与层数提高概率）；Level 0.2 等无实体层级不生成
    g.spawnTimer -= dt;
    if (g.spawnTimer <= 0) {
      if (g.smilerSiege) {
        // 在 Level 999 上一条都不肯认的下场：笑魇一只接一只地从树后面出来
        if (g.entities.length < 12) spawnEntityAt(g, "smiler", null);
        g.spawnTimer = rand(4, 8);
      } else if (levelDef(g.level).entities && (isLevel(g, 7) ? l7InSeaBed(g) : true)
                 && !(a94 && a94.name === "day")) {
        // Level 7：海面上一只都不刷 —— 只有下到海底岩床才计入
        // 非数字编号（枢纽之类）直接拿来做算术会得到 NaN，
        // 概率变成 NaN 之后实体一次都刷不出来 —— 按 2 来算。
        const lvNum = Number(g.level);
        const ln = Number.isFinite(lvNum) ? lvNum : 2;
        let p = Math.min(0.85, 0.4 + g.time * 0.003 + ln * 0.06);
        // Level 26 要的是"实体横行"：进场就有人，而且来得很密
        if (String(g.level) === "26") p = 0.95;
        // 联机客人端：怪由房主说了算，自己不要再刷，不然两边数量对不上
        const remoteDriven = !!(g.multi && g._entsRemote && !(Net.room && Net.room.isHost));
        if (!remoteDriven && Math.random() < p && g.entities.length < maxEntitiesNow()) spawnEntity();
      }
      {
        const lvNum = Number(g.level);
        const ln = Number.isFinite(lvNum) ? lvNum : 2;
        g.spawnTimer = rand(CONFIG.SPAWN_MIN_INTERVAL, CONFIG.SPAWN_MAX_INTERVAL)
          * Math.max(0.55, 1 - ln * 0.05);
        if (String(g.level) === "26") g.spawnTimer = Math.min(g.spawnTimer, rand(2.5, 5));
      }
    }
    updateSteamPuffs(g, dt);
    // 只有同层的实体参与更新（上下层互不影响）。
    // 联机的客人端：怪由房主统一驱动，本地不许再自己走 —— 否则会跟同步位置打架，
    // 两边看到的怪永远差几像素。
    for (const e of g.entities) {
      if ((e.floor | 0) !== g.floor) continue;
      if (e.remoteDriven) continue;
      e.update(dt, g.player, g);
    }

    // 门遮挡计算 + 手电光锥（门一开，光就照进门后）
    updateDoorBlock(g);
    updateFlashCone(g);

    // 档案拾取检测：只有真正站到档案上方（约半格内）才会提示
    // 只认当前楼层的那份（Level 1 上下层各有一批）
    let near = null, nd = PICKUP_R;
    for (const ap of g.archives) {
      if ((ap.floor | 0) !== g.floor) continue;
      const d = Math.hypot(ap.x - g.player.x, ap.y - g.player.y);
      if (d < nd) { nd = d; near = ap; }
    }
    g.nearArchive = near;
    if (near) {
      // 站上档案就把提示条的文字改回"阅读档案" —— 只 show() 不改字的话，
      // 提示条会留着刚才那一句（比如刚从杏仁水旁边走过来，就还是"捡起杏仁水"）
      if (el.pickupHint) el.pickupHint.innerHTML = touchMode ? HINT_READ_TOUCH : HINT_READ_KB;
      show(el.pickupHint);
      if (el.btnE) el.btnE.classList.add("ready");
    } else {
      hide(el.pickupHint);
    }

    // 门：靠近可交互（关闭的门挡住视线，看不见里面）
    updateDoors(g);
    // Level 15：透光的窗户索引
    if (isLevel(g, 15)) updateFuture(g, dt);
    // Level !：玩家离开出生点 3 格之后笑魇出现（从身后冲出来）
    // 以前是"进来 5 秒后"—— 站着不动也会被追上，而且没法体现"一迈步就开始"的紧张。
    if (String(g.level) === "bang" && !g.bangSmiler) {
      const st = (g.map && g.map.start) || null;
      let away = 0;
      if (st) {
        away = Math.hypot(g.player.x - (st.x + 0.5) * TILE, g.player.y - (st.y + 0.5) * TILE) / TILE;
      }
      if (away >= 3) {
        g.bangSmiler = true;
        // 从"身后"刷出来：玩家是往走廊深处走的，所以出生点在起点那一侧。
        // 以前用 spawnEntityAt(ok=离起点6格内)，而它内部又要求"离玩家 11 格以外" ——
        // 玩家刚进门就站在起点上，两个条件永远不可能同时成立，笑魇于是一个都刷不出来。
        // 现在直接指定走廊格子：玩家身后 10 格，太靠边就退到走廊尽头。
        if (typeof spawnEntityAt === "function") {
          const m = g.map;
          const cx = Math.floor(m.size / 2);
          const y0 = 3, y1 = m.size - 6;
          const py = Math.floor(g.player.y / TILE);
          // 身后 = 玩家前进方向的反方向（走廊是纵向的，出生点在最上面，所以默认是 -y）。
          // 以前"太靠边就改刷在前方" —— 而触发时玩家才离起点 3 格，py-10 必然越界，
          // 于是每次都走那条兜底，笑魇就固定刷在前面，往前跑直接撞上。
          // 现在无论怎样都只在身后：贴到走廊尽头为止，绝不翻到前面去。
          const dir = (g.player.faceY || 0) >= 0 ? 1 : -1;   // 玩家往哪边跑
          const back = -dir;                                 // 身后
          let sy = py + back * 10;
          sy = Math.max(y0 + 1, Math.min(y1 - 1, sy));       // 夹在走廊里
          if ((sy - py) * back <= 0) sy = py + back * 2;     // 万一被夹到身前，退回身后 2 格
          sy = Math.max(y0 + 1, Math.min(y1 - 1, sy));
          const ne = new Entity(m, cx, sy, g.level, "smiler", g.floor);
          // 笑魇跑得和玩家"疾跑"一样快 —— 不疾跑就甩不掉，只能一路按着疾跑跑到 EXIT。
          ne.speed = CONFIG.PLAYER_SPRINT;
          ne.wanderSpeed = CONFIG.PLAYER_SPRINT;
          // 它不需要看见你：走廊有 192 格长，靠视线判定的话玩家一冲远它就
          // 丢目标、转游荡、最后被 respawn 挪走，看上去就是"卡在吐病床的门口不动了"。
          ne.huntAlways = true;
          g.entities.push(ne);
          try { AudioSys.roar(1); } catch (e) { /* 忽略 */ }
        }
        if (typeof toast === "function") toast("身后传来脚步声 —— 有什么东西冲过来了");
        // AudioSys 是 audio.js 里的 const，并不挂在 window 上 ——
        // 以前写成 window.AudioSys &&，这个判断永远是假，笑魇出场那声嘶吼从来没响过。
        if (typeof AudioSys !== "undefined" && AudioSys.scream) AudioSys.scream();
      }
    }
    // Level !：两侧的门时不时推出病床，横穿走廊把人撞开
    if (window.updateBangGurneys && String(g.level) === "bang") window.updateBangGurneys(g, dt);

    // 生命 / 理智 / 补给箱与地上的物品
    updateVitals(g, dt);
    if (g.phase !== "playing") return;   // 上面可能已经把人喝死了
    updateSupplies(g);
    updatePickBtn();

    // Level 0.2：坍塌事件 + 远离入口门时刷新新出口
    if (g.level === 0.2) updateCollapse(g, dt);
    // Level 3：管道时不时喷出一股蒸汽
    if (isLevel(g, 3)) updateSteam(g, dt);
    if (isLevel(g, 9)) updateSuburb(g, dt);
    if (isLevel(g, 10)) updateField(g, dt);
    if (isLevel(g, 11)) updateCity(g, dt);
    // 各层级的专属系统
    if (isLevel(g, 5)) updateHotel(g, dt);
    else if (isLevel(g, 6)) updateDark(g, dt);
    else if (isLevel(g, 7)) updateDive(g, dt);
    else if (isLevel(g, 8)) updateCave(g, dt);
    else if (isLevel(g, 18)) updateDaycare(g, dt);
    else if (isLevel(g, 19)) updateAttic(g, dt);
    else if (isLevel(g, "hub")) updateHub(g, dt);

    // 到达出口（必须同层；Level 0.2 没有出口，只能走门）
    const exit = g.map.exit;
    if (exit && (exit.floor | 0) === g.floor) {
      const exPx = exit.x * TILE + TILE / 2, eyPx = exit.y * TILE + TILE / 2;
      if (Math.hypot(g.player.x - exPx, g.player.y - eyPx) < 26) escapeLevel();
    }
    // Level 8：踏进岩洞深处那一小片郊区 —— 不用按 E，走进去就是 Level 9。
    // 以前这里是一块绿色出口牌，踩上去直接弹结局；现在它是「一处与 Level 9 相似的地方」。
    if (isLevel(g, 8) && g.map.suburbPatch && !g.map.suburbEntered &&
        g.map.suburbPatch.has(tileKeyOf(g.player))) {
      g.map.suburbEntered = true;               // 过场那几秒里别重复触发
      AudioSys.exitChime();
      unlockEnding(2);
      goToLevel(g, 9, "走进了那片郊区",
        "岩壁在身后合拢 —— 潮湿的沥青、灭了灯的路灯，还有一整排没有灯光的房子。Level 9，午夜的郊区 ...");
    }
    // Level 1 花园段：走到最深处那团绿光 —— 不用按 E，踩上去就进 Level 1.2。
    // 以前得站在那儿按一下 E，可花园段站着不动就会被藤缠住，等于逼玩家停下来送死。
    if (isLevel(g, 1) && g.map.gardenNook && !g.map.gardenDeepUsed &&
        (g.map.gardenNook.floor | 0) === (g.floor | 0)) {
      const d = g.map.gardenNook.deep;
      if (d && Math.hypot((d.x + 0.5) * TILE - g.player.x, (d.y + 0.5) * TILE - g.player.y) < TILE * 0.85) {
        g.map.gardenDeepUsed = true;             // 过场那几秒里别重复触发
        AudioSys.exitChime();
        goToLevel(g, "1.2", "没入花园段尽头的绿光",
          "植被越来越密，柱子一根接一根 —— 你已经走出了那十几格。别停下 ...", { noReroute: true });
      }
    }
    // Level 0：闪烁的墙壁 —— 走过去"穿"过去，落到 Level 1 下层
    const wx = level0WallExit(g);
    if (wx) {
      const wpx = (wx.x + 0.5) * TILE, wpy = (wx.y + 0.5) * TILE;
      if (Math.hypot(g.player.x - wpx, g.player.y - wpy) < TILE * 1.1) {
        goLevel1(g, wx.toFloor, "穿过了闪烁的墙壁");
      }
    }
    // Level 0：右下角那间房里闪烁的墙 —— 碰上去就被"故障"吸走，到 Level 287
    const gx = (g.map.exits || []).find(
      (e) => e.kind === "glitchwall" && (e.floor | 0) === g.floor) || null;
    if (gx) {
      const gpx = (gx.x + 0.5) * TILE, gpy = (gx.y + 0.5) * TILE;
      if (Math.hypot(g.player.x - gpx, g.player.y - gpy) < TILE * 1.15) {
        AudioSys.exitChime();
        // 去哪一层由这一处自己说了算：Level 0 那间是 287，Level 11 医院药房那面是 109
        const gl = (gx.toLevel != null ? gx.toLevel : 287);
        goToLevel(g, gl, "碰到了那面闪烁的墙",
          gl === 109
            ? "墙纸错位的地方渗出一片霓虹 —— 灯还亮着，走廊长得看不见头。Level 109，霓虹医院 ..."
            : "黑白在眼前撕裂开 —— 一条两侧全是黑门的走廊。Level 287，故障大厅 ...",
          { noReroute: true });
      }
    }

    // Level 0：那面深黄的墙 —— 碰上去就被拽进 Level 0.7 忆域。
    // 和"闪烁的墙""故障小房间"同一个路数：不用按 E，走到跟前就走。
    const ow = (g.map.exits || []).find(
      (e) => e.kind === "ochrewall" && (e.floor | 0) === g.floor) || null;
    if (ow) {
      const owx = (ow.x + 0.5) * TILE, owy = (ow.y + 0.5) * TILE;
      if (Math.hypot(g.player.x - owx, g.player.y - owy) < TILE * 1.15) {
        AudioSys.exitChime();
        goToLevel(g, "0.7", "碰到了那面深黄的墙",
          "墙纸的黄色在眼前越陷越深 —— 灯管的嗡鸣变成了火把的噼啪。Level 0.7，忆域 ...",
          { noReroute: true });
      }
    }

    // Level 1：基地周围那处隐蔽小屋，最里侧墙上有道缝 —— 走到最里面那一排就被吸进 Level 2.1。
    // 判定用"玩家站在哪一格"而不是距离：那道缝在墙里，玩家永远顶不到墙心，
    // 用距离算的话阈值怎么调都差一点（实测顶到墙时还差 0.85 格，死活触发不了）。
    const nk21 = (g.map.exits || []).find(
      (e) => e.kind === "nook21" && (e.floor | 0) === g.floor) || null;
    if (nk21) {
      const ptx = Math.floor(g.player.x / TILE), pty = Math.floor(g.player.y / TILE);
      if (ptx === nk21.x && pty === nk21.y + 1) {
        AudioSys.exitChime();
        goToLevel(g, "2.1", "凑近了那道缝",
          "缝里那点惨白一下子把你吞了进去 —— 一条看不见尽头的廊道。Level 2.1，锁闭 ...",
          { noReroute: true });
      }
    }

    // 荧光灯闪烁
    // 「过去」不闪 —— 那里是停在原处的时间，灯光一直亮着，不会忽明忽暗。
    if (String(g.level) === "9223372036854775807.-1") {
      g.flicker = 1;
      g.flickerLeft = 0;
      g.flickerTimer = 999;
    } else {
      g.flickerTimer -= dt;
      if (g.flickerTimer <= 0) {
        g.flickerLeft = rand(0.25, 0.6);
        g.flickerTimer = rand(3, 7);
        AudioSys.flickerClick();
      }
      if (g.flickerLeft > 0) {
        g.flickerLeft -= dt;
        g.flicker = Math.random() < 0.5 ? 0.55 : 0.95;
      } else {
        g.flicker = 1;
      }
    }
    // 坍塌期间灯光剧烈闪烁
    if (g.collapseLeft > 0) g.flicker = Math.random() < 0.45 ? 0.35 : 0.9;

    // 心跳（实体靠近时）
    const intensity = dangerIntensity();
    if (intensity > 0.35) {
      g.heartbeatAccum -= dt;
      if (g.heartbeatAccum <= 0) {
        AudioSys.heartbeat(intensity);
        g.heartbeatAccum = lerp(1.0, 0.5, intensity);
      }
    }

    // 脚步声（距离驱动：走够一步的步幅就响一声，与速度同步）
    if (g.player.moving && g.player.stepDist > 0) {
      const stride = g.player.sprinting ? 95 : 75;
      if (g.player.stepDist >= stride) {
        AudioSys.playStep(stepMaterial(g.map, g.player.x, g.player.y), g.player.sprinting);
        g.player.stepDist -= stride;
      }
    }

    updateHud();
  }

  // ---------- 斜坡：斜着的正方形地面，连接上下两层 ----------
  function updateRamps(g) {
    // Level 0.7 忆域：区域尽头的黄雾 —— 没进去就到下一个区域（不是斜坡，不分上下层）
    if (g.map.zoneFog && g.map.zoneFog.length) { updateZoneFog(g); return; }
    if (!g.map.ramps || !g.map.ramps.length) return;
    const tx = Math.floor(g.player.x / TILE), ty = Math.floor(g.player.y / TILE);
    let on = null;
    for (const r of g.map.ramps) {
      if (rampContains(r, tx, ty)) { on = r; break; }
    }
    if (!on) { g.rampArmed = true; return; }  // 走出斜坡才重新武装
    if (!g.rampArmed) return;
    const target = g.floor === on.floorA ? on.floorB : on.floorA;
    const pos = target === on.floorB ? on.bPos : on.aPos;
    g.floor = target;
    g.player.floor = target;
    g.player.x = (pos.x + 0.5) * TILE;
    g.player.y = (pos.y + 0.5) * TILE;
    g.rampArmed = false;
    AudioSys.door(true);
    floorToast(target, g);
  }

  // ---------- Level 0.7 忆域：区域尽头的黄雾 ----------
  // 每个区域都有尽头，尽头处压着一团黄雾：走进去就到下一个区域，
  // 从对面那团雾走回来就回到上一个区域 —— 双向，不是单向的。
  function updateZoneFog(g) {
    const tx = Math.floor(g.player.x / TILE), ty = Math.floor(g.player.y / TILE);
    const cur = g.floor | 0;
    let on = null, forward = true;
    for (const z of g.map.zoneFog) {
      if (cur === z.aZone && rampContains(z.aRect, tx, ty)) { on = z; forward = true; break; }
      if (cur === z.bZone && rampContains(z.bRect, tx, ty)) { on = z; forward = false; break; }
    }
    if (!on) { g.rampArmed = true; return; }   // 走出雾才重新武装，免得原地来回弹
    if (!g.rampArmed) return;
    const target = forward ? on.bZone : on.aZone;
    const rect = forward ? on.bRect : on.aRect;
    const pos = forward ? on.bPos : on.aPos;
    g.floor = target;
    g.player.floor = target;
    // 落点挪到雾团外两格：以前是直接落在雾团正中央 —— 脚下就是刚穿过的那扇"门"，
    // 一转身又撞回上一个区域，很多人因此以为这个区只有"回去"这一条路。
    const land = zoneFogLanding(g.map, target, rect) || pos;
    g.player.x = (land.x + 0.5) * TILE;
    g.player.y = (land.y + 0.5) * TILE;
    g.rampArmed = false;
    // 告诉玩家更深处那团黄雾在哪边 —— 一张 78×78 的图里找角落，纯靠瞎走是找不到的
    zoneDirHint = "";
    const nxt = (g.map.zoneFog || []).find((z) => z.aZone === target) || null;
    if (nxt) {
      const dx = (nxt.aPos.x + 0.5) * TILE - g.player.x;
      const dy = (nxt.aPos.y + 0.5) * TILE - g.player.y;
      zoneDirHint = "更深处那团黄雾在" +
        (Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? "东面" : "西面") : (dy > 0 ? "南面" : "北面"));
    } else {
      zoneDirHint = "这已经是最深的一处了 —— 再往里没有路";
    }
    AudioSys.door(true);
    floorToast(target, g);
  }

  // 黄雾落点：从雾团朝地图中心方向往外挪几格，挑第一格能站的。挪不出去就仍落在雾里。
  function zoneFogLanding(map, floor, rect) {
    const grid = map.layers && map.layers[floor];
    if (!grid || !rect) return null;
    const size = map.size;
    const inR = (x, y) =>
      x >= rect.x && x < rect.x + rect.w && y >= rect.y && y < rect.y + rect.h;
    const gapOf = (x, y) => Math.max(
      Math.max(rect.x - x, x - (rect.x + rect.w - 1)),
      Math.max(rect.y - y, y - (rect.y + rect.h - 1)));
    const sx = Math.floor(rect.x + rect.w / 2), sy = Math.floor(rect.y + rect.h / 2);
    if (!grid[sy] || grid[sy][sx] !== 0) return null;
    // 从雾团中心往外一层层找：只要能站的、且在雾团外面的格子。
    // （第一版是"朝地图中心挪几格"，可雾团四周常常全是墙 —— 一格都挪不出去，
    //   于是又落回雾里，白改。现在改成洪泛，一定能挪出去。）
    const seen = new Set([sx + "," + sy]);
    const q = [[sx, sy]];
    let first = null;
    while (q.length) {
      const c = q.shift();
      if (!inR(c[0], c[1])) {
        if (!first) first = { x: c[0], y: c[1] };
        if (gapOf(c[0], c[1]) >= 2) return { x: c[0], y: c[1] };  // 离雾团两格以上最稳
        continue;
      }
      for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = c[0] + d[0], ny = c[1] + d[1];
        if (nx < 1 || ny < 1 || nx >= size - 1 || ny >= size - 1) continue;
        const k = nx + "," + ny;
        if (seen.has(k) || !grid[ny] || grid[ny][nx] !== 0) continue;
        seen.add(k); q.push([nx, ny]);
      }
    }
    return first;
  }

  function toastUnfit() {
    if (typeof toast === "function") toast("这里的空气在烧你的肺 —— 没有全封闭防护服撑不了多久");
  }

  let floorToastTimer = null;
  let zoneDirHint = "";                            // 忆域：更深处那团黄雾在哪个方向
  function floorToast(floor, g) {
    if (!el.flashToast) return;
    if (g && String(g.level) === "0.7") {          // 忆域：区域 1~6，没有上下层
      el.flashToast.innerHTML = "没入黄雾 —— <b>区域 " + ((floor | 0) + 1) +
        " / " + ((g.map && g.map.eraCount) || 6) + "</b>" +
        (zoneDirHint ? "<br><span style='opacity:.85'>" + zoneDirHint + "</span>" : "");
      show(el.flashToast);
      clearTimeout(floorToastTimer);
      floorToastTimer = setTimeout(() => hide(el.flashToast), 2200);
      return;
    }
    el.flashToast.innerHTML = floor === 1 ? "沿斜坡下到<b>下层</b>" : "沿斜坡上到<b>上层</b>";
    show(el.flashToast);
    clearTimeout(floorToastTimer);
    floorToastTimer = setTimeout(() => hide(el.flashToast), 2200);
  }

  // ---------- Level 6：光滑冰凉的混凝土（熄灯） ----------
  function drawDarkWall(ctx, px, py, h) {
    ctx.fillStyle = "#2a2d31";
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = "rgba(255,255,255," + (0.02 + h * 0.03).toFixed(3) + ")";
    ctx.fillRect(px, py, TILE, 2);
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(px + TILE - 3, py, 3, TILE);
  }
  function drawDarkFloor(ctx, px, py, h) {
    ctx.fillStyle = "#22252a";
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = "rgba(255,255,255," + (0.015 + h * 0.02).toFixed(3) + ")";
    ctx.fillRect(px + 3, py + 3, TILE - 6, TILE - 6);
  }

  // 贝弗莉室的墙（四面都是门）
  function drawBevWall(ctx, px, py, h) {
    ctx.fillStyle = "#4a2630";
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = "rgba(214,176,96,0.22)";
    ctx.fillRect(px + 3, py + 3, TILE - 6, TILE - 6);
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillRect(px, py + TILE - 5, TILE, 5);
  }

  // ---------- Level 7：海 ----------
  function drawOceanWall(ctx, px, py, h, map, tx, ty) {
    if (ty < map.ocean.top) {
      // 海面上那些房子的墙：泡得发涨的墙皮，底下浸着一圈水渍
      ctx.fillStyle = "#4b5349";
      ctx.fillRect(px, py, TILE, TILE);
      // 鼓包 / 起皮
      ctx.fillStyle = "rgba(255,255,255," + (0.03 + h * 0.05).toFixed(3) + ")";
      ctx.fillRect(px + 2, py + 2, TILE - 4, TILE - 5);
      // 霉斑
      if (h > 0.72) {
        ctx.fillStyle = "rgba(60,80,50,0.35)";
        ctx.fillRect(px + 4 + h * 10, py + 6, 7, 5);
      }
      // 墙脚那圈水渍
      ctx.fillStyle = "rgba(30,60,70,0.45)";
      ctx.fillRect(px, py + TILE - 6, TILE, 6);
      // 临海的那一面：压一道屋檐的暗边，房子看起来才像"立"在海上
      if (map.seaSurf) {
        ctx.fillStyle = "rgba(10,24,30,0.55)";
        if (map.seaSurf.has(tx + "," + (ty - 1))) ctx.fillRect(px, py, TILE, 5);
        if (map.seaSurf.has(tx + "," + (ty + 1))) ctx.fillRect(px, py + TILE - 5, TILE, 5);
        if (map.seaSurf.has((tx - 1) + "," + ty)) ctx.fillRect(px, py, 5, TILE);
        if (map.seaSurf.has((tx + 1) + "," + ty)) ctx.fillRect(px + TILE - 5, py, 5, TILE);
        // 屋脊那道高光
        ctx.fillStyle = "rgba(190,205,190,0.16)";
        if (map.seaSurf.has(tx + "," + (ty - 1))) ctx.fillRect(px, py + 5, TILE, 2);
      }
    } else {
      // 水下的岩壁
      ctx.fillStyle = "#141c24";
      ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = "rgba(70,90,100," + (0.1 + h * 0.14).toFixed(3) + ")";
      ctx.fillRect(px + 2, py + 2, TILE - 4, TILE - 4);
    }
  }
  // 海面：能踩上去，不会沉，但挪得很慢 —— 画成一片亮得晃眼、缓缓起伏的水
  function drawSeaSurface(ctx, px, py, h, tx, ty) {
    const t = gTimeRef;
    // 底色：偏青的浅蓝，越往深处（y 越大）越沉
    const k = clamp((ty - 2) / 40, 0, 1);
    const r = Math.round(58 - 14 * k), gg = Math.round(150 - 46 * k), b = Math.round(168 - 40 * k);
    ctx.fillStyle = "rgb(" + r + "," + gg + "," + b + ")";
    ctx.fillRect(px, py, TILE, TILE);
    // 缓慢起伏的浪（两条错开的横纹，时间推着它们走）
    const w1 = Math.sin((tx * 0.7 + ty * 0.45) + t * 0.9);
    const w2 = Math.sin((tx * 0.5 - ty * 0.6) + t * 1.35 + 1.7);
    ctx.fillStyle = "rgba(230,250,255,0.20)";
    ctx.fillRect(px, py + 8 + (w1 * 7 | 0), TILE, 3);
    ctx.fillStyle = "rgba(240,255,255,0.13)";
    ctx.fillRect(px, py + 24 + (w2 * 8 | 0), TILE, 2);
    // 零星的碎光
    if (h > 0.82) {
      ctx.fillStyle = "rgba(255,255,255,0.28)";
      ctx.fillRect(px + 6 + (h * 20 | 0), py + 12 + (h * 14 | 0), 4, 2);
    }
    // 稍深的地方透出一点暗
    ctx.fillStyle = "rgba(10,40,60," + (0.05 + k * 0.12).toFixed(3) + ")";
    ctx.fillRect(px, py, TILE, TILE);
  }
  // Level 7：一路向北走满 500 格之后，正北面的海平线上浮出来的那块陆地。
  // 它不在生成的图里（北面那片海本来就是"走到哪算到哪"的，一进层不会把内存占满），
  // 而是在你走够距离的那一刻才出现 —— 记成一个小的格子集合。
  function spawnLand29(g) {
    const m = g.map;
    if (!m) return;
    const cx = Math.floor(g.player.x / TILE);
    const cy = Math.floor(g.player.y / TILE) - 7;      // 浮在正北面，看得见，还得再走几步
    const set = new Set();
    const RX = 5, RY = 4;
    for (let y = cy - RY; y <= cy + RY; y++) {
      for (let x = cx - RX; x <= cx + RX; x++) {
        const d = Math.hypot((x - cx) / RX, (y - cy) / RY);
        if (d <= 1) set.add(x + "," + y);
      }
    }
    m.land29 = set;
    m.land29c = { x: cx, y: cy };
    m.land29rx = RX; m.land29ry = RY;
    try {
      toast("北面的海平线上浮出一块陆地 —— 沙是暖的，上面立着几棵树。走上去。");
    } catch (e) { /* 忽略 */ }
  }
  // Level 7 往北走够 500 格后浮出来的那块陆地 —— 走上它就是 Level 29
  function drawIsland29(ctx, px, py, h, tx, ty) {
    // 沙滩：偏暖的浅黄，边缘一圈被水浸深
    ctx.fillStyle = "#d8c48a";
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = "rgba(160,140,90," + (0.10 + h * 0.18).toFixed(3) + ")";
    ctx.fillRect(px + ((h * 17) | 0), py + ((h * 23) | 0), 12, 9);
    // 靠边的一圈湿沙
    ctx.fillStyle = "rgba(120,150,140,0.35)";
    ctx.fillRect(px, py, TILE, 3);
    ctx.fillRect(px, py + TILE - 3, TILE, 3);
    // 草：陆地上稀稀拉拉几撮
    if (h > 0.55) {
      ctx.fillStyle = "#5c7a45";
      const gx = px + 8 + ((h * 19) | 0), gy = py + 12 + ((h * 15) | 0);
      ctx.fillRect(gx, gy, 2, 7);
      ctx.fillRect(gx + 3, gy + 2, 2, 5);
      ctx.fillRect(gx - 3, gy + 3, 2, 4);
    }
    // 中间那棵棕榈：树影落在沙上
    if (h > 0.88) {
      ctx.fillStyle = "#6b5334";
      ctx.fillRect(px + 19, py + 14, 3, 16);
      ctx.fillStyle = "#43703a";
      ctx.fillRect(px + 11, py + 8, 19, 3);
      ctx.fillRect(px + 8, py + 11, 6, 3);
      ctx.fillRect(px + 25, py + 11, 6, 3);
      ctx.fillStyle = "rgba(40,50,30,0.22)";
      ctx.fillRect(px + 20, py + 28, 12, 3);
    }
  }
  // 房子里的积水：地面泡在水里，水面反着屋顶漏下来的光
  function drawRoomWater(ctx, px, py, h, tx, ty) {
    const t = gTimeRef;
    // 泡烂的地板
    ctx.fillStyle = "#3c3830";
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = "rgba(255,255,255," + (0.02 + h * 0.03).toFixed(3) + ")";
    ctx.fillRect(px + 3, py + 3, TILE - 6, TILE - 6);
    // 一层浅水
    ctx.fillStyle = "rgba(110,160,170,0.34)";
    ctx.fillRect(px, py, TILE, TILE);
    // 水面反光：慢慢晃
    const w = Math.sin((tx + ty) * 0.8 + t * 0.7);
    ctx.fillStyle = "rgba(215,245,250,0.16)";
    ctx.fillRect(px + 4, py + 12 + (w * 6 | 0), TILE - 8, 2);
    if (h > 0.78) {
      ctx.fillStyle = "rgba(215,245,250,0.10)";
      ctx.fillRect(px + 8, py + 26 + (w * -5 | 0), TILE - 16, 2);
    }
  }
  // 泡在水里的家具：木头泡得发黑发绿，吃水线上留着一道深色的痕
  function drawSoakedFurn(ctx, p) {
    const v = p.variant | 0;
    const t = gTimeRef;
    // 水面轻轻晃，家具跟着晃一点
    const w = Math.sin((p.x + p.y) * 0.9 + t * 0.8) * 1.2;
    ctx.save();
    ctx.translate(0, w * 0.4);
    if (v === 0) {                       // 立柜：门半开着
      ctx.fillStyle = "#3b3327";
      ctx.fillRect(-11, -17, 22, 28);
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.fillRect(-9, -15, 18, 10);
      ctx.fillStyle = "#2a241b";
      ctx.fillRect(-1, -15, 10, 24);     // 半开的门
      ctx.fillStyle = "rgba(70,95,60,0.35)";
      ctx.fillRect(-11, 4, 22, 7);       // 吃水线
    } else if (v === 1) {                // 桌子：四条腿浸在水里
      ctx.fillStyle = "#463c2c";
      ctx.fillRect(-15, -8, 30, 5);
      ctx.fillStyle = "#332b1f";
      ctx.fillRect(-13, -3, 3, 10);
      ctx.fillRect(10, -3, 3, 10);
      ctx.fillStyle = "rgba(70,95,60,0.4)";
      ctx.fillRect(-15, -1, 30, 2);
    } else if (v === 2) {                // 沙发：坐垫塌了下去
      ctx.fillStyle = "#4a4034";
      ctx.fillRect(-16, -6, 32, 12);
      ctx.fillStyle = "#3a3228";
      ctx.fillRect(-16, -13, 6, 10);
      ctx.fillRect(10, -13, 6, 10);
      ctx.fillStyle = "rgba(70,95,60,0.38)";
      ctx.fillRect(-16, 0, 32, 6);
    } else {                             // 椅子：翻倒在水里
      ctx.fillStyle = "#423925";
      ctx.fillRect(-8, -4, 16, 4);
      ctx.fillStyle = "#332b1f";
      ctx.fillRect(-8, -12, 3, 9);
      ctx.fillRect(-2, 0, 3, 6);
      ctx.fillStyle = "rgba(70,95,60,0.4)";
      ctx.fillRect(-8, 1, 16, 3);
    }
    ctx.restore();
    // 家具四周那一圈被推开的水
    ctx.fillStyle = "rgba(200,240,250,0.10)";
    ctx.beginPath();
    ctx.ellipse(0, 8, 19, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  function drawOceanFloor(ctx, px, py, h, map, tx, ty) {
    const tk7 = tx + "," + ty;
    if (map.seaSurf && map.seaSurf.has(tk7)) { drawSeaSurface(ctx, px, py, h, tx, ty); return; }
    if (map.roomWater && map.roomWater.has(tk7)) { drawRoomWater(ctx, px, py, h, tx, ty); return; }
    if (map.dryFloor && map.dryFloor.has(tk7)) {
      // 门洞：一块没淹到的木门槛，门外就是海
      ctx.fillStyle = "#5a4a34";
      ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = "rgba(255,255,255," + (0.05 + h * 0.05).toFixed(3) + ")";
      ctx.fillRect(px + 3, py + 3, TILE - 6, TILE - 6);
      // 门槛上那道被踩亮的木纹
      ctx.fillStyle = "rgba(214,180,120,0.20)";
      ctx.fillRect(px + 4, py + 18 + (h * 8 | 0), TILE - 8, 3);
      return;
    }
    if (ty < map.ocean.top) {
      // 入口房间：铺着地毯的地面，覆着一层浅水
      ctx.fillStyle = "#4a4038";
      ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = "rgba(120,150,160,0.28)";
      ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = "rgba(255,255,255," + (0.03 + h * 0.04).toFixed(3) + ")";
      ctx.fillRect(px + 4, py + 4 + (h * 12 | 0), TILE - 8, 2);
      return;
    }
    // 海水：越深越暗、越蓝
    const depth = (ty - map.ocean.top) * CONFIG.DEPTH_PER_TILE;
    const k = clamp(depth / 7000, 0, 1);
    const r = Math.round(46 - 38 * k), gg = Math.round(112 - 96 * k), b = Math.round(140 - 96 * k);
    ctx.fillStyle = "rgb(" + r + "," + gg + "," + b + ")";
    ctx.fillRect(px, py, TILE, TILE);
    // 水面波纹
    if (ty - map.ocean.top < 3) {
      ctx.fillStyle = "rgba(220,245,255,0.16)";
      ctx.fillRect(px, py + ((Math.sin((tx + gTimeRef * 0.6) * 0.8) * 6) | 0) + 4, TILE, 3);
    }
    // 漂浮的碎屑 / 骸骨（暮色带以下）
    if (depth > 1000 && h > 0.86) {
      ctx.fillStyle = "rgba(220,215,200,0.32)";
      ctx.fillRect(px + 10 + h * 12, py + 14, 9, 2);
    }
  }
  // 海面上的岩石岛 / 绳索 / 门廊 / 海底岩洞（画在地形之上）
  function drawOceanExtras(ctx, g, cam) {
    const map = g.map;
    const t = g.time;
    // 岩石岛（老版海域；新版码头没有岛）
    for (const isl of (map.ocean.islands || [])) {
      ctx.fillStyle = "#3a3f42";
      ctx.beginPath();
      ctx.ellipse((isl.x + 0.5) * TILE, (isl.y + 0.5) * TILE, 34, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(90,100,96,0.5)";
      ctx.beginPath();
      ctx.ellipse((isl.x + 0.5) * TILE - 6, (isl.y + 0.5) * TILE - 4, 16, 9, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // Level 18：毛绒恐龙
    if (map.dino) drawPlushDino(ctx, (map.dino.x + 0.5) * TILE, (map.dino.y + 0.5) * TILE, t);
    // 潜艇：海面上系着的那艘，以及下潜后停在海底你身边的那艘
    if (map.sub) {
      const sx = (map.sub.x + 0.5) * TILE, sy = (map.sub.y + 0.5) * TILE + Math.sin(t * 1.2) * 2;
      drawSubmarine(ctx, sx, sy, t);
    }
    if (map.subSea) {
      const sx = (map.subSea.x + 0.5) * TILE, sy = (map.subSea.y + 0.5) * TILE + Math.sin(t * 1.2) * 2;
      drawSubmarine(ctx, sx, sy, t);
      // 一圈提示光 —— 在黑漆漆的海底好找一点
      ctx.save();
      ctx.strokeStyle = "rgba(232,192,33,0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(sx, sy, 30 + Math.sin(t * 2) * 3, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
    // 门廊 + 垂下的绳索（老版；新版码头没有门廊）
    const rp = map.rope;
    if (rp) {
      ctx.save();
      ctx.strokeStyle = "#c8b98a";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo((rp.x + 0.5) * TILE, rp.yTop * TILE);
      ctx.lineTo((rp.x + 0.5) * TILE + Math.sin(t * 1.1) * 3, (rp.yBottom + 1) * TILE);
      ctx.stroke();
      ctx.lineWidth = 1.5;
      for (let i = 1; i <= 6; i++) {
        const yy = (rp.yTop + i) * TILE;
        ctx.beginPath();
        ctx.moveTo((rp.x + 0.5) * TILE - 5, yy);
        ctx.lineTo((rp.x + 0.5) * TILE + 5, yy);
        ctx.stroke();
      }
      ctx.restore();
    }
    // 海底岩洞
    const cv = map.cave;
    if (cv) {
      const x = (cv.x + 0.5) * TILE, y = (cv.y + 0.5) * TILE;
      ctx.save();
      ctx.fillStyle = "#080b0e";
      ctx.beginPath();
      ctx.ellipse(x, y, 26, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      const ready = hasItem("divesuit") && hasItem("submarine");
      ctx.strokeStyle = ready ? "rgba(120,255,180,0.85)" : "rgba(140,160,170,0.5)";
      ctx.lineWidth = 2;
      ctx.stroke();
      if (ready) {
        ctx.shadowColor = "rgba(80,255,160,0.7)";
        ctx.shadowBlur = 26;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
      ctx.restore();
    }
    // 入口房间的家具
    for (const p of (map.props || [])) {
      const x = (p.x + 0.5) * TILE, y = (p.y + 0.5) * TILE;
      ctx.save();
      if (p.type === "bookshelf") {
        ctx.fillStyle = "#4a3420";
        ctx.fillRect(x - 16, y - 14, 32, 28);
        ctx.fillStyle = "#2a1c0e";
        for (let i = 0; i < 3; i++) ctx.fillRect(x - 14, y - 11 + i * 9, 28, 6);
        ctx.fillStyle = "#9a7a4a";
        for (let i = 0; i < 7; i++) ctx.fillRect(x - 13 + i * 4, y - 10, 3, 5);
      } else if (p.type === "coffeetable") {
        ctx.fillStyle = "#5a4230";
        ctx.beginPath();
        ctx.ellipse(x, y, 15, 10, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === "chair") {
        ctx.fillStyle = "#4d3a2a";
        ctx.fillRect(x - 8, y - 8, 16, 16);
        ctx.fillStyle = "#3a2a1e";
        ctx.fillRect(x - 8, y - 12, 16, 5);
      } else if (p.type === "lamp") {
        const fl = 0.7 + 0.3 * Math.sin(t * 9 + p.x);
        ctx.shadowColor = "rgba(230,255,240," + (0.5 * fl).toFixed(3) + ")";
        ctx.shadowBlur = 30;
        ctx.fillStyle = "rgba(240,255,250," + (0.75 * fl).toFixed(3) + ")";
        ctx.fillRect(x - 13, y - 4, 26, 7);
        ctx.shadowBlur = 0;
      }
      ctx.restore();
    }
  }

  // ---------- Level 8：岩洞系统 ----------
  // 岩洞最深处那一小片「郊区」：脚下是潮湿沥青 / 石质人行道 / 没修剪的草坪，
  // 四周的岩壁被替换成午夜郊区那种灭了灯的房屋外立面。配色和 Level 9 完全一致，
  // 不是写一块牌子说「这里通往 Level 9」，而是把 Level 9 本身画出来。
  function drawSuburbPatchFloor(ctx, px, py, h, map, tx, ty) {
    const c = map.suburbCenter || { x: tx, y: ty };
    const dy = Math.abs(ty - c.y);
    if (dy === 0) {
      // 潮湿、没有涂过漆的沥青
      ctx.fillStyle = "#2e2f33";
      ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = "rgba(140,150,165,0.09)";
      ctx.fillRect(px + (h * 19 | 0) % TILE, py + (h * 27 | 0) % TILE, 11, 4);
      if ((tx * 7 + ty * 3) % 5 === 0) {           // 水洼
        ctx.fillStyle = "rgba(70,95,120,0.55)";
        ctx.beginPath(); ctx.ellipse(px + 12, py + 20, 13, 7, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(190,215,235,0.16)";
        ctx.beginPath(); ctx.ellipse(px + 11, py + 19, 8, 3.5, 0, 0, Math.PI * 2); ctx.fill();
      }
      if ((tx * 3 + ty * 11) % 7 === 0) {          // 落叶
        ctx.fillStyle = "rgba(120,86,44,0.55)";
        for (let i = 0; i < 4; i++) ctx.fillRect(px + (h * 11 + i * 9) % TILE, py + (h * 23 + i * 11) % TILE, 5, 3);
      }
    } else if (dy === 1) {
      // 石质人行道
      ctx.fillStyle = "#5c5a55";
      ctx.fillRect(px, py, TILE, TILE);
      ctx.strokeStyle = "rgba(38,37,34,0.5)";
      ctx.lineWidth = 1;
      ctx.strokeRect(px + 0.5, py + 0.5, TILE - 1, TILE - 1);
      ctx.fillStyle = "rgba(255,255,255,0.04)";
      ctx.fillRect(px + 2, py + 2, TILE - 4, TILE - 4);
    } else {
      // 没人修剪的草坪
      ctx.fillStyle = "#2f4526";
      ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = "rgba(90,120,60,0.35)";
      ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = "rgba(150,180,100,0.20)";
      for (let i = 0; i < 4; i++) ctx.fillRect(px + (h * 13 + i * 10) % TILE, py + (h * 21 + i * 9) % TILE, 2, 4);
    }
  }
  function drawSuburbPatchWall(ctx, px, py, h, map, tx, ty) {
    // 房屋外立面：和 Level 9 的殖民地式样同一套配色，窗全黑着 —— 这里没有电
    ctx.fillStyle = "#7d7a70";
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = "rgba(0,0,0,0.16)";
    for (let i = 0; i < 3; i++) ctx.fillRect(px, py + 6 + i * 13, TILE, 2);
    if ((tx + ty) % 2 === 0) {
      ctx.fillStyle = "rgba(12,14,18,0.85)";
      ctx.fillRect(px + 7, py + 8, 12, 10);
      ctx.fillRect(px + 22, py + 8, 12, 10);
      ctx.strokeStyle = "rgba(230,228,220,0.35)";
      ctx.lineWidth = 1;
      ctx.strokeRect(px + 7.5, py + 8.5, 11, 9);
      ctx.strokeRect(px + 22.5, py + 8.5, 11, 9);
      ctx.fillStyle = "rgba(190,210,235,0.07)";   // 玻璃里映出的一点月光
      ctx.fillRect(px + 8, py + 9, 10, 3);
    }
    // 屋顶瓦
    const above = map.suburbWall && map.suburbWall.has(tx + "," + (ty - 1));
    if (!above) {
      ctx.fillStyle = "rgba(40,36,32,0.75)";
      ctx.fillRect(px, py, TILE, 7);
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.fillRect(px, py + 1, TILE, 2);
    }
    ctx.fillStyle = "rgba(0,0,0,0.14)";
    ctx.fillRect(px, py + TILE - 5, TILE, 5);
  }
  function drawCaveWall(ctx, px, py, h, map, tx, ty) {
    if (map && map.suburbWall && tx != null && map.suburbWall.has(tx + "," + ty)) {
      drawSuburbPatchWall(ctx, px, py, h, map, tx, ty);
      return;
    }
    // 深褐的层理岩壁 —— 必须比通道明显暗，窄道才认得出来
    ctx.fillStyle = "#332d24";
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = "rgba(150,132,104," + (0.10 + h * 0.12).toFixed(3) + ")";
    ctx.fillRect(px + 2, py + 2, TILE - 4, TILE - 4);
    ctx.strokeStyle = "rgba(18,14,10,0.45)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px + 2, py + 8 + h * 14);
    ctx.lineTo(px + TILE - 2, py + 4 + h * 16);
    ctx.stroke();
    // 朝向通道的那道亮边 + 底部阴影，把每格岩壁的轮廓勾出来
    ctx.fillStyle = "rgba(214,190,150,0.18)";
    ctx.fillRect(px, py, TILE, 2);
    ctx.fillStyle = "rgba(0,0,0,0.30)";
    ctx.fillRect(px, py + TILE - 4, TILE, 4);
  }
  function drawCaveFloor(ctx, px, py, h, map, tx, ty) {
    if (map && map.suburbPatch && tx != null && map.suburbPatch.has(tx + "," + ty)) {
      drawSuburbPatchFloor(ctx, px, py, h, map, tx, ty);
      return;
    }
    // 浅一截的砂岩地面：通道比岩壁亮得多，一眼能看出哪条是路
    ctx.fillStyle = "#7a6f5c";
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = "rgba(196,178,146," + (0.10 + h * 0.16).toFixed(3) + ")";
    ctx.fillRect(px + 2, py + 2, TILE - 4, TILE - 4);
    // 砂粒
    ctx.fillStyle = "rgba(60,50,38,0.22)";
    ctx.fillRect(px + 6 + h * 14, py + 9, 2, 2);
    ctx.fillRect(px + 22, py + 20 + h * 8, 2, 2);
    // 偶尔一块碎石
    if (h > 0.86) {
      ctx.fillStyle = "rgba(222,208,182,0.55)";
      ctx.fillRect(px + 11, py + 14, 9, 4);
      ctx.fillStyle = "rgba(70,58,44,0.35)";
      ctx.fillRect(px + 11, py + 18, 9, 2);
    }
    ctx.strokeStyle = "rgba(40,33,24,0.35)";
    ctx.lineWidth = 1;
    ctx.strokeRect(px + 0.5, py + 0.5, TILE - 1, TILE - 1);
  }
  // 有毒气体 / 蜘蛛巢 / 涨潮 / 扭曲点 / 绿色出口
  function drawCaveExtras(ctx, g, cam) {
    const map = g.map;
    const t = g.time;
    const grid = layerGrid(map, g.floor);
    const inView = (px, py) => !(px + TILE < cam.x - cam.viewW / 2 || py + TILE < cam.y - cam.viewH / 2 ||
      px > cam.x + cam.viewW / 2 || py > cam.y + cam.viewH / 2);
    // 黑暗洞段：压暗但保留岩壁轮廓，不是一片黑
    for (const k of (map.dark8 || [])) {
      const [sx, sy] = k.split(",");
      const px = (+sx) * TILE, py = (+sy) * TILE;
      if (!inView(px, py)) continue;
      ctx.fillStyle = "rgba(6,8,14,0.55)";
      ctx.fillRect(px, py, TILE, TILE);
    }
    // 探照灯：会来回扫的锥形光柱，能照穿上面的黑暗
    for (const s of (map.spot8 || [])) {
      if (!inView(s.x, s.y)) continue;
      const ang = s.ang + t * s.spd;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.translate(s.x, s.y);
      ctx.rotate(ang);
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, s.r);
      grad.addColorStop(0, "rgba(255,232,168,0.30)");
      grad.addColorStop(0.55, "rgba(255,226,150,0.12)");
      grad.addColorStop(1, "rgba(255,220,140,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, s.r, -s.half, s.half);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      // 灯本体：一点发白的黄
      ctx.save();
      ctx.shadowColor = "rgba(255,226,150,0.9)";
      ctx.shadowBlur = 14;
      ctx.fillStyle = "#ffe6a0";
      ctx.fillRect(s.x - 3, s.y - 3, 6, 6);
      ctx.restore();
    }
    // 有毒气体：一层黄绿色的雾
    for (const k of map.toxic) {
      const [sx, sy] = k.split(",");
      const px = (+sx) * TILE, py = (+sy) * TILE;
      if (px + TILE < cam.x - cam.viewW / 2 || py + TILE < cam.y - cam.viewH / 2 ||
          px > cam.x + cam.viewW / 2 || py > cam.y + cam.viewH / 2) continue;
      const a = 0.16 + 0.09 * Math.sin(t * 1.3 + (+sx) + (+sy));
      ctx.fillStyle = "rgba(150,190,70," + a.toFixed(3) + ")";
      ctx.fillRect(px, py, TILE, TILE);
    }
    // 蜘蛛巢：密密麻麻的网
    for (const k of map.nests) {
      const [sx, sy] = k.split(",");
      const px = (+sx) * TILE, py = (+sy) * TILE;
      if (px + TILE < cam.x - cam.viewW / 2 || py + TILE < cam.y - cam.viewH / 2 ||
          px > cam.x + cam.viewW / 2 || py > cam.y + cam.viewH / 2) continue;
      ctx.strokeStyle = "rgba(220,220,210,0.22)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const a2 = (i / 4) * Math.PI * 2 + (hash2(+sx, +sy));
        ctx.moveTo(px + TILE / 2, py + TILE / 2);
        ctx.lineTo(px + TILE / 2 + Math.cos(a2) * 20, py + TILE / 2 + Math.sin(a2) * 20);
      }
      ctx.stroke();
    }
    // 涨潮：水位正在上涨
    if (g.floodLeft > 0) {
      const a = 0.3 * clamp(g.floodLeft / CONFIG.CAVE_FLOOD_DUR, 0, 1);
      for (const k of map.floods) {
        const [sx, sy] = k.split(",");
        const px = (+sx) * TILE, py = (+sy) * TILE;
        if (px + TILE < cam.x - cam.viewW / 2 || py + TILE < cam.y - cam.viewH / 2 ||
            px > cam.x + cam.viewW / 2 || py > cam.y + cam.viewH / 2) continue;
        ctx.fillStyle = "rgba(50,90,110," + (a + 0.2).toFixed(3) + ")";
        ctx.fillRect(px, py, TILE, TILE);
      }
    }
    // 空间扭曲点
    for (const k of map.warps) {
      const [sx, sy] = k.split(",");
      const px = (+sx) * TILE, py = (+sy) * TILE;
      if (px + TILE < cam.x - cam.viewW / 2 || py + TILE < cam.y - cam.viewH / 2 ||
          px > cam.x + cam.viewW / 2 || py > cam.y + cam.viewH / 2) continue;
      ctx.save();
      ctx.strokeStyle = "rgba(190,140,255,0.5)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(px + TILE / 2, py + TILE / 2, 10 + 4 * Math.sin(t * 3 + (+sx)), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    drawCaveSuburb(ctx, g, cam);
  }

  // 岩洞最深处那一小片郊区：午夜的天光、断电的路灯、岩层裂开处撒着的碎石。
  // 它和 Level 9 是同一套画面，不是一块写着「通往 Level 9」的牌子。
  function drawCaveSuburb(ctx, g, cam) {
    const map = g.map;
    if (!map.suburbPatch || !map.suburbCenter) return;
    const c = map.suburbCenter;
    const left = cam.x - cam.viewW / 2, top = cam.y - cam.viewH / 2;
    const x0 = (c.x - 2) * TILE, y0 = (c.y - 2) * TILE, w = 5 * TILE, h = 5 * TILE;
    if (x0 > left + cam.viewW || y0 > top + cam.viewH || x0 + w < left || y0 + h < top) return;
    const t = g.time;
    ctx.save();
    const cx = (c.x + 0.5) * TILE, cy = (c.y + 0.5) * TILE;
    // 冷蓝的午夜天光 —— 叠亮而不是压黑，整片从暖褐岩洞里跳出来
    const gg = ctx.createRadialGradient(cx, cy, TILE * 0.5, cx, cy, TILE * 4.2);
    gg.addColorStop(0, "rgba(120,155,220,0.20)");
    gg.addColorStop(1, "rgba(90,120,180,0)");
    ctx.fillStyle = gg;
    ctx.fillRect(x0 - TILE, y0 - TILE, w + 2 * TILE, h + 2 * TILE);
    ctx.restore();
    // 四盏路灯：大多断电，右下角那盏偶尔闪一下（和 Level 9 一样）
    for (const [ox, oy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const lx = (c.x + ox + 0.5) * TILE, ly = (c.y + oy + 0.5) * TILE;
      ctx.save();
      ctx.translate(lx, ly);
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.beginPath(); ctx.ellipse(0, 6, 8, 3.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#3e4042"; ctx.fillRect(-2, -32, 4, 38);
      ctx.fillStyle = "#4a4c4e"; ctx.fillRect(-9, -36, 18, 5);
      const fl = (ox > 0 && oy > 0) ? (Math.sin(t * 8.5) > 0.2 ? 0.8 : 0.06) : 0;
      if (fl > 0.02) {
        ctx.shadowColor = "rgba(255,226,150,0.9)";
        ctx.shadowBlur = 24;
        ctx.fillStyle = "rgba(255,232,170," + fl.toFixed(2) + ")";
        ctx.fillRect(-7, -34, 14, 4);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 0.14;
        ctx.beginPath(); ctx.ellipse(0, 4, 34, 20, 0, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      } else {
        ctx.fillStyle = "rgba(110,114,110,0.75)";
        ctx.fillRect(-7, -34, 14, 4);
      }
      ctx.restore();
    }
    // 岩层裂开、沥青从底下透出来的那道边：撒一圈冷白碎石
    for (let i = 0; i < 22; i++) {
      const a = i * 0.285 + 0.2;
      const rx = cx + Math.cos(a) * TILE * 2.35;
      const ry = cy + Math.sin(a) * TILE * 2.35;
      ctx.fillStyle = "rgba(150,170,195,0.22)";
      ctx.fillRect(rx - 2, ry - 2, 4, 3);
    }
  }

  // ---------- 隐秘层级：枢纽 ----------
  function drawHubWall(ctx, px, py, h) {
    // 巨大的混凝土板，每两块之间都有缝隙
    ctx.fillStyle = "#5c5850";
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = "rgba(30,28,24,0.55)";
    ctx.fillRect(px, py, TILE, 2);
    ctx.fillRect(px, py, 2, TILE);
    ctx.fillStyle = "rgba(255,240,200," + (0.05 + h * 0.06).toFixed(3) + ")";
    ctx.fillRect(px + 4, py + 4, TILE - 8, TILE - 8);
  }
  function drawHubFloor(ctx, px, py, h, map, ty) {
    // 干涩的沥青
    ctx.fillStyle = "#33312e";
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = "rgba(0,0,0," + (0.1 + h * 0.12).toFixed(3) + ")";
    ctx.fillRect(px + (h * 20 | 0), py + 6, 14, 4);
    // 三条黄线把隧道分成四条车道
    if (map.lanes && map.lanes.lines.indexOf(ty) >= 0) {
      ctx.fillStyle = "rgba(226,196,74,0.85)";
      ctx.fillRect(px, py + TILE / 2 - 1.5, TILE, 3);
    }
  }
  function drawHubExtras(ctx, g, cam) {
    const map = g.map;
    const t = g.time;
    // 成排的亮黄色工业照明灯
    if (map.lanes) {
      const top = map.lanes.top;
      for (let x = 4; x < map.size - 4; x += 5) {
        const px = x * TILE;
        if (px < cam.x - cam.viewW / 2 - TILE || px > cam.x + cam.viewW / 2) continue;
        ctx.save();
        const fl = 0.75 + 0.25 * Math.sin(t * 2 + x);
        ctx.shadowColor = "rgba(255,214,110," + (0.55 * fl).toFixed(3) + ")";
        ctx.shadowBlur = 26;
        ctx.fillStyle = "rgba(255,226,150," + (0.8 * fl).toFixed(3) + ")";
        ctx.fillRect(px, top * TILE + 4, 22, 6);
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#4a4740";
        ctx.fillRect(px + 2, top * TILE + 1, 18, 4);
        ctx.restore();
      }
    }
    // 那扇装饰着气球的窗户
    if (map.balloon) {
      const b = map.balloon;
      const x = (b.x + 0.5) * TILE, y = (b.y + 0.5) * TILE;
      ctx.save();
      ctx.fillStyle = "#1c2028";
      ctx.fillRect(x - 16, y - 14, 32, 28);
      ctx.strokeStyle = "#8a7f60";
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 16, y - 14, 32, 28);
      const cols = ["#e05a6a", "#5ac6e0", "#e0d15a", "#7ae07a"];
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = cols[i];
        ctx.beginPath();
        ctx.ellipse(x - 11 + i * 7, y - 3 + Math.sin(t * 1.6 + i) * 2, 4.5, 5.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.4)";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(x - 11 + i * 7, y + 3);
        ctx.lineTo(x - 11 + i * 7, y + 12);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  // ---------- 各层级的整体色调 ----------
  function drawLevelTint(g) {
    // Level 5 锅炉房：热
    if (isLevel(g, 5) && (g.floor | 0) === 2) {
      ctx.fillStyle = "rgba(180,80,20,0.10)";
      ctx.fillRect(0, 0, W, H);
      const pulse = 0.04 + 0.03 * Math.sin(g.time * 1.4);
      ctx.fillStyle = "rgba(255,140,50," + pulse.toFixed(3) + ")";
      ctx.fillRect(0, 0, W, H);
    }
    // Level 7：海底很暗 —— 需要手电，但没被照亮的地方仍隐约看得见轮廓
    if (isLevel(g, 7) && inWater(g)) {
      const k = clamp(playerDepth(g) / 7000, 0, 1);
      ctx.fillStyle = "rgba(6,24,44," + (0.30 + 0.42 * k).toFixed(3) + ")";
      ctx.fillRect(0, 0, W, H);
      // 一层压暗：手电光柱之外只剩个大概，但绝不是 Level 6 那种全黑
      ctx.fillStyle = "rgba(0,4,10,0.34)";
      ctx.fillRect(0, 0, W, H);
    }
    // Level 8：有毒气体里呼吸困难
    if (isLevel(g, 8) && g.map.toxic && g.map.toxic.has(tileKeyOf(g.player))) {
      ctx.fillStyle = "rgba(140,180,60,0.12)";
      ctx.fillRect(0, 0, W, H);
    }
    // 枢纽：橙黄色的工业照明
    if (isLevel(g, "hub")) {
      ctx.fillStyle = "rgba(255,190,90,0.06)";
      ctx.fillRect(0, 0, W, H);
    }
    // Level 6：黑暗本身也在压过来
    if (isLevel(g, 6)) {
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(0, 0, W, H);
    }
    // Level !：警报响起之后，整层都被红灯染红（不是只有灯底下那一圈）
    if (String(g.level) === "bang" && g.bangAlarm) {
      const pulse = 0.5 + 0.5 * Math.sin(g.time * 6);
      ctx.fillStyle = "rgba(190,20,12," + (0.16 + pulse * 0.12).toFixed(3) + ")";
      ctx.fillRect(0, 0, W, H);
      // 再来一层深红，把冷色的医院墙面整个压成红的
      ctx.fillStyle = "rgba(120,0,0,0.10)";
      ctx.fillRect(0, 0, W, H);
    }
  }

  // ---------- Level 18：回忆（低语 / 童年记忆 / 毛绒恐龙） ----------
  const WHISPERS18 = [
    "有个声音在说：你本该再多陪陪他们的。",
    "有个声音在说：那天你说了不该说的话。",
    "有个声音在说：你放弃了那件事，其实再撑一下就成了。",
    "有个声音在说：你答应过的事，最后没有做到。",
    "有个声音在说：你一直在假装那件事没发生过。",
  ];
  function updateFuture(g, dt) {
    const m = g.map;
    if (m.windows15 && !m.winAt15) {
      m.winAt15 = new Map();
      for (const w of m.windows15) m.winAt15.set(w.x + "," + w.y, w);
    }
  }
  function updateDaycare(g, dt) {
    const m = g.map;
    // 这里是安全的：人会慢慢平静下来 —— 理智缓慢回升
    if (!g.podActive) g.sanity = Math.min(100, g.sanity + 1.6 * dt);
    // 低语：徘徊时会听见 —— 说的多半是你最大的遗憾
    g.whisperT = (g.whisperT || 0) - dt;
    if (g.whisperT <= 0) {
      g.whisperT = rand(14, 30);
      toast(WHISPERS18[randInt(0, WHISPERS18.length - 1)]);
      AudioSys.whisper();
    }
    // 毛绒恐龙：四处游荡，偶尔带来水与食物
    const d = m.dino;
    if (d) {
      d.t -= dt;
      if (d.t <= 0) {
        d.t = rand(3, 7);
        const fl = m.floors[0];
        const t = fl[randInt(0, fl.length - 1)];
        if (t) { d.tx = t.x; d.ty = t.y; }
      }
      d.x += (d.tx - d.x) * Math.min(1, dt * 0.7);
      d.y += (d.ty - d.y) * Math.min(1, dt * 0.7);
      // 靠近时它会给你水和食物
      if (Math.hypot((d.x + 0.5) * TILE - g.player.x, (d.y + 0.5) * TILE - g.player.y) < TILE * 1.6) {
        g.dinoGive = (g.dinoGive || 0) - dt;
        if (g.dinoGive <= 0) {
          g.dinoGive = 12;
          addItem("almond", 1);
          toast("毛绒恐龙把一瓶水递给了你。");
        }
      }
    }
    // 被唤醒的童年记忆：死去的宠物 —— 会让人一下子陷进情绪里
    for (const p of (m.glowPets || [])) {
      if (p.seen) continue;
      if (Math.hypot((p.x + 0.5) * TILE - g.player.x, (p.y + 0.5) * TILE - g.player.y) < TILE * 2) {
        p.seen = true;
        toast("角落里蹲着你小时候养过的那只 —— 它早就死了，可它现在就在这儿看着你。");
        g.sanity = Math.max(1, g.sanity - 6);
      }
    }
  }

  // ---------- Level 19：阁楼（衰败效应 / 地板下的橙色光芒） ----------
  function updateAttic(g, dt) {
    // 窗户索引（画墙时按格查）
    const m = g.map;
    if (m.windows19 && !m.winAt) {
      m.winAt = new Map();
      for (const w of m.windows19) m.winAt.set(w.x + "," + w.y, w);
    }
    // 窗灵：站进那扇亮着的窗户洒下的光里 —— 一只大手伸出来把你抓走
    if (m.lit19 && m.lit19.has(tileKeyOf(g.player))) {
      if (!g.invincible) {
        g.deathCause = "被「窗灵」从亮着的窗户里抓走了";
        AudioSys.jumpscare();
        showDead();
        return;
      }
    }

    // 橙色光芒：已从 Level 19 删除（原本会勾人、也带来衰败）
    // 衰败：翻开箱子越多，人越难受（恶心、偏执、眩晕）
    if (g.map.decay > 0) {
      g.hp -= Math.min(2.2, g.map.decay * 0.16) * dt;
      if (!g.decayWarn) { g.decayWarn = true; toast("恶心、眩晕 —— 从箱子里拿走的东西正在腐烂"); }
    }
  }

  // ---------- Level 6：墙壁记忆 / 黑暗中的"自己" ----------
  function drawMemory(ctx, g) {
    const mem = g.memory;
    if (!mem || !mem.marks.length) return;
    ctx.save();
    ctx.lineCap = "round";
    for (const m of mem.marks) {
      const age = (g.time - m.t) / CONFIG.MEMORY_FADE;
      const a = clamp(1 - age, 0, 1);
      if (a <= 0.02) continue;
      // 越旧越暗、越细 —— 像快要褪掉的粉笔印
      const alpha = (0.18 + 0.62 * a) * (0.55 + 0.45 * a);
      ctx.strokeStyle = "rgba(186,214,232," + alpha.toFixed(3) + ")";
      ctx.fillStyle = "rgba(186,214,232," + alpha.toFixed(3) + ")";
      if (m.x1 === m.x2 && m.y1 === m.y2) {
        ctx.beginPath();
        ctx.arc(m.x1, m.y1, 2.2 + a * 1.4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.lineWidth = 1.6 + a * 1.6;
        ctx.beginPath();
        ctx.moveTo(m.x1, m.y1);
        ctx.lineTo(m.x2, m.y2);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // 黑暗里唯一还能感觉到的东西：你自己的身体（很淡）
  function drawDarkSelf(ctx, g) {
    const p = g.player;
    ctx.save();
    ctx.globalAlpha = 0.30;
    ctx.fillStyle = "#5b6a72";
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, 9, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.16;
    ctx.beginPath();
    ctx.arc(p.x, p.y - 11, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ---------- Level 5：恐怖旅馆 ----------
  // 主厅：红木色与金色的墙纸 / 黑胡桃木、白大理石、红金地毯的地面
  // ---------------- Level 10：丰裕 ----------------
  // 成排的树与灌木（把麦田分成小块）；谷仓 / 木棚 / 马厩等构筑物
  function drawFieldWall(ctx, px, py, h, map) {
    const tx = Math.round(px / TILE), ty = Math.round(py / TILE);
    const b = map.buildings ? buildingAt(map, tx, ty) : null;
    if (b) {
      // 构筑物：木板墙 + 屋顶（谷仓偏红，木棚偏褐）
      const face = b.kind === "barn" ? "#8e3f2e" : b.kind === "stable" ? "#7a5334"
        : b.kind === "shed" ? "#6d5233" : "#5f4a30";
      ctx.fillStyle = face;
      ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = "rgba(0,0,0,0.22)";
      for (let i = 0; i < 3; i++) ctx.fillRect(px, py + 4 + i * 12, TILE, 2);
      // 屋顶：只在最上沿画一圈瓦
      if (ty === b.y) {
        ctx.fillStyle = b.kind === "barn" ? "#4a2a1e" : "#3b2d1c";
        ctx.fillRect(px, py, TILE, 9);
        ctx.fillStyle = "rgba(255,235,200,0.10)";
        ctx.fillRect(px, py + 1, TILE, 2);
      }
      return;
    }
    // 树与灌木：高度一致、不会竞相生长的绿墙
    ctx.fillStyle = "#3f5c2a";
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = "#4e7033";
    ctx.beginPath();
    ctx.ellipse(px + TILE / 2, py + TILE / 2, TILE * 0.46, TILE * 0.40, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(20,34,12,0.55)";
    ctx.beginPath();
    ctx.ellipse(px + TILE / 2, py + TILE * 0.72, TILE * 0.34, TILE * 0.20, 0, 0, Math.PI * 2);
    ctx.fill();
    // 风一吹，叶子会轻轻晃
    ctx.fillStyle = "rgba(150,190,110," + (0.16 + h * 0.14).toFixed(3) + ")";
    ctx.fillRect(px + 3 + (h * 9 | 0), py + 6, 5, 3);
    ctx.fillRect(px + TILE - 12, py + 18 - (h * 9 | 0), 4, 3);
  }

  function buildingAt(map, tx, ty) {
    for (const b of map.buildings) {
      if (tx >= b.x && tx < b.x + b.w && ty >= b.y && ty < b.y + b.h) return b;
    }
    return null;
  }

  // 麦田 / 湖水 / 湖边的泥土草地 / 泥土小径
  function drawFieldFloor(ctx, px, py, h, map, tx, ty) {
    const key = tx + "," + ty;
    if (map.bush && map.bush.has(key)) {
      // 茂密的草丛：能挤过去，但得一步一步拨开
      ctx.fillStyle = "#4c6330";
      ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = "#5e7a3a";
      for (let i = 0; i < 7; i++) {
        const gx = ((tx * 31 + i * 53) % TILE);
        const gy = ((ty * 17 + i * 29) % TILE);
        const bend = Math.sin((h + i * 0.7) * 2.2) * 2.5;
        ctx.fillRect(px + gx + bend, py + gy, 3, 8);
      }
      ctx.fillStyle = "rgba(28,44,18,0.45)";
      ctx.fillRect(px, py + TILE - 7, TILE, 7);
      ctx.fillStyle = "rgba(160,200,110," + (0.10 + h * 0.10).toFixed(3) + ")";
      ctx.fillRect(px + 4, py + 3, 6, 2);
      return;
    }
    if (map.lakes && map.lakes.has(key)) {
      // 清澈的湖水：没有藻类，溶氧量很高
      ctx.fillStyle = "#2f5b6b";
      ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = "rgba(140,200,220," + (0.10 + h * 0.10).toFixed(3) + ")";
      ctx.fillRect(px, py + 4 + (h * 11 | 0), TILE, 3);
      ctx.fillStyle = "rgba(200,235,245,0.14)";
      ctx.fillRect(px + (h * 23 | 0) % TILE, py + (h * 31 | 0) % TILE, 8, 2);
      return;
    }
    if (map.trail && map.trail.has(key)) {
      // 泥土小径：两条轮胎碾痕，中间是被隔开的一条草坪带
      ctx.fillStyle = "#6b5a3c";
      ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = "#5d6b34";                       // 中间的草坪带
      ctx.fillRect(px, py + TILE * 0.36, TILE, TILE * 0.28);
      ctx.fillStyle = "rgba(52,42,28,0.75)";           // 两条碾痕
      ctx.fillRect(px, py + 4, TILE, 5);
      ctx.fillRect(px, py + TILE - 9, TILE, 5);
      ctx.fillStyle = "rgba(160,150,120,0.20)";
      ctx.fillRect(px + 6, py + 6, 7, 3);
      return;
    }
    if (map.dirt && map.dirt.has(key)) {
      ctx.fillStyle = "#6a5c3e";
      ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = "rgba(110,130,60,0.35)";
      ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = "rgba(0,0,0,0.10)";
      ctx.fillRect(px + (h * 19 | 0) % TILE, py + (h * 27 | 0) % TILE, 6, 4);
      return;
    }
    // 麦田：成片成熟的小麦，风吹过时整片一起倒
    const sway = Math.sin(h * 6 + (tx * 0.6 + ty * 0.4)) * 2;
    ctx.fillStyle = "#8a7a33";
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = "#a89446";
    ctx.fillRect(px, py, TILE, TILE);
    ctx.strokeStyle = "rgba(190,168,80,0.85)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const gx = px + 6 + i * 9;
      ctx.moveTo(gx + sway, py + TILE - 3);
      ctx.lineTo(gx + sway * 1.8, py + 8);
    }
    ctx.stroke();
    ctx.fillStyle = "rgba(226,206,110,0.55)";           // 麦穗
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(px + 5 + i * 9 + sway * 1.8, py + 6, 3, 5);
    }
    ctx.fillStyle = "rgba(0,0,0,0.07)";
    ctx.fillRect(px, py + TILE - 4, TILE, 4);
  }

  // ---------------- Level 11：不夜城 ----------------
  // 楼房的外立面：砖 / 混凝土 / 玻璃，带一排排的窗
  function drawCityWall(ctx, px, py, h, map, tx, ty) {
    const inside = map.indoors && map.indoors.has(tx + "," + ty);
    if (inside) return;                                  // 室内地面由 drawCityFloor 处理
    // 医院：白瓷砖墙 + 一道绿色的腰线，和城里那些带窗的居民楼外立面完全两回事
    if (map.hospitalWall && map.hospitalWall.has(tx + "," + ty)) {
      ctx.fillStyle = "#dbe4e6";
      ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = "rgba(0,0,0,0.07)";
      for (let i = 0; i < 4; i++) ctx.fillRect(px, py + i * (TILE / 4), TILE, 1);
      ctx.fillStyle = "rgba(46,200,122,0.55)";           // 腰线
      ctx.fillRect(px, py + TILE * 0.52, TILE, 3);
      ctx.fillStyle = "rgba(255,255,255,0.16)";
      ctx.fillRect(px, py, TILE, 3);
      ctx.fillStyle = "rgba(0,0,0,0.22)";
      ctx.fillRect(px, py + TILE - 4, TILE, 4);
      return;
    }
    const seed = (tx * 31 + ty * 17) % 7;
    const faces = ["#6f6a63", "#7a6a5c", "#5f6367", "#736055", "#666a6e", "#7d7168", "#5d6065"];
    ctx.fillStyle = faces[seed];
    ctx.fillRect(px, py, TILE, TILE);
    // 窗户：有些亮着，有些是黑的
    ctx.fillStyle = "rgba(18,20,24,0.72)";
    ctx.fillRect(px + 6, py + 7, 12, 10);
    ctx.fillRect(px + 22, py + 7, 12, 10);
    ctx.fillRect(px + 6, py + 24, 12, 10);
    ctx.fillRect(px + 22, py + 24, 12, 10);
    if ((seed + tx + ty) % 3 === 0) {
      ctx.fillStyle = "rgba(255,232,170,0.55)";
      ctx.fillRect(px + 6, py + 24, 12, 10);
    }
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fillRect(px, py, TILE, 3);
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(px, py + TILE - 4, TILE, 4);
  }

  // 沥青马路（黄线）/ 混凝土人行道 / 建筑内部
  function drawCityFloor(ctx, px, py, h, map, tx, ty) {
    const key = tx + "," + ty;
    // 医院：浅色地砖 + 地面上一条导向色带（走廊里那种）
    if (map.hospital && map.hospital.has(key)) {
      ctx.fillStyle = "#e3e9ea";
      ctx.fillRect(px, py, TILE, TILE);
      ctx.strokeStyle = "rgba(120,140,145,0.35)";
      ctx.lineWidth = 1;
      ctx.strokeRect(px + 0.5, py + 0.5, TILE - 1, TILE - 1);
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.fillRect(px + 2, py + 2, TILE - 4, 2);
      ctx.fillStyle = "rgba(46,200,122,0.16)";
      ctx.fillRect(px, py + TILE * 0.42, TILE, 4);
      return;
    }
    if (map.indoors && map.indoors.has(key)) {
      ctx.fillStyle = "#57534c";                          // 室内：地毯 / 地板
      ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = "rgba(0,0,0,0.14)";
      ctx.fillRect(px, py, TILE, 2);
      ctx.fillStyle = "rgba(200,190,170,0.06)";
      ctx.fillRect(px, py + 8, TILE, TILE - 12);
      return;
    }
    if (map.road && map.road.has(key)) {
      ctx.fillStyle = "#3a3a3d";                          // 沥青
      ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.fillRect(px + (h * 17 | 0) % TILE, py + (h * 29 | 0) % TILE, 9, 3);
      // 黄色油漆画的线
      const mx = tx % map.block, my = ty % map.block;
      if (mx === 1 || my === 1) {
        ctx.fillStyle = "rgba(226,196,86,0.85)";
        if (mx === 1 && my === 1) {
          ctx.fillRect(px + TILE / 2 - 3, py, 6, TILE);
          ctx.fillRect(px, py + TILE / 2 - 3, TILE, 6);
        } else if (mx === 1) ctx.fillRect(px + TILE / 2 - 3, py, 6, TILE);
        else ctx.fillRect(px, py + TILE / 2 - 3, TILE, 6);
      }
      return;
    }
    // 混凝土人行道
    ctx.fillStyle = "#8b8781";
    ctx.fillRect(px, py, TILE, TILE);
    ctx.strokeStyle = "rgba(60,58,55,0.45)";
    ctx.lineWidth = 1;
    ctx.strokeRect(px + 0.5, py + 0.5, TILE - 1, TILE - 1);
    if (((tx + ty) % 5) === 0) {                          // 偶尔通向死胡同 / 卡进建筑里
      ctx.fillStyle = "rgba(70,68,64,0.35)";
      ctx.fillRect(px + 4, py + 4, TILE - 8, TILE - 8);
    }
  }

  // ---------------- Level 9：郊区 ----------------
  // 房屋外立面：样式各异（都铎 / 维多利亚 / 牧场 / 工匠 / 双拼），没有一栋是亮着灯的
  const SUBURB_FACE = {
    colonial: "#7d7a70", victorian: "#6e5f5a", ranch: "#756b58",
    craftsman: "#6b6455", duplex: "#726d66",
  };
  function drawSuburbWall(ctx, px, py, h, map, tx, ty) {
    const style = map.wallStyle ? map.wallStyle.get(tx + "," + ty) : null;
    const face = SUBURB_FACE[style] || "#736d63";
    ctx.fillStyle = face;
    ctx.fillRect(px, py, TILE, TILE);
    // 墙板（横向的一圈圈搭接）
    ctx.fillStyle = "rgba(0,0,0,0.16)";
    for (let i = 0; i < 3; i++) ctx.fillRect(px, py + 6 + i * 13, TILE, 2);
    // 窗：全都黑着 —— 这里没有电源
    const win = ((tx * 5 + ty * 3) % 4) < 2;
    if (win && (tx + ty) % 2 === 0) {
      ctx.fillStyle = "rgba(12,14,18,0.85)";
      ctx.fillRect(px + 7, py + 8, 12, 10);
      ctx.fillRect(px + 22, py + 8, 12, 10);
      ctx.strokeStyle = "rgba(230,228,220,0.35)";
      ctx.lineWidth = 1;
      ctx.strokeRect(px + 7.5, py + 8.5, 11, 9);
      ctx.strokeRect(px + 22.5, py + 8.5, 11, 9);
      // 偶尔玻璃里映出一点点月光
      ctx.fillStyle = "rgba(190,210,235,0.07)";
      ctx.fillRect(px + 8, py + 9, 10, 3);
    }
    // 屋顶：只在上沿画一圈瓦
    const above = map.wallStyle ? map.wallStyle.get(tx + "," + (ty - 1)) : null;
    if (!above) {
      ctx.fillStyle = "rgba(40,36,32,0.75)";
      ctx.fillRect(px, py, TILE, 7);
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.fillRect(px, py + 1, TILE, 2);
    }
    ctx.fillStyle = "rgba(0,0,0,0.14)";
    ctx.fillRect(px, py + TILE - 5, TILE, 5);
  }

  // 潮湿未涂漆的沥青 / 石质人行道 / 室内地板 / 草坪 / 田野 / 通往草地的步道
  function drawSuburbFloor(ctx, px, py, h, map, tx, ty) {
    const key = tx + "," + ty;
    if (map.indoors && map.indoors.has(key)) {
      ctx.fillStyle = "#4a4238";                        // 室内：木地板 / 地毯
      ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(px, py, TILE, 2);
      ctx.fillStyle = "rgba(220,205,180,0.05)";
      ctx.fillRect(px + 5, py + 5, TILE - 10, TILE - 10);
      return;
    }
    if (map.field && map.field.has(key)) {
      // 田野：离开步道走进来，就会通往 Level 10
      ctx.fillStyle = "#3d4a2c";
      ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = "#4a5833";
      ctx.fillRect(px, py, TILE, TILE);
      ctx.strokeStyle = "rgba(120,140,80,0.55)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const gx = px + 6 + i * 12;
        ctx.moveTo(gx + Math.sin(h * 5 + i) * 2, py + TILE - 2);
        ctx.lineTo(gx + Math.sin(h * 5 + i) * 4, py + 6);
      }
      ctx.stroke();
      return;
    }
    if (map.path && map.path.has(key)) {
      ctx.fillStyle = "#6a6046";                        // 通往草地的碎石步道
      ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = "rgba(190,180,150,0.18)";
      ctx.fillRect(px + 4, py + 4, TILE - 8, TILE - 8);
      return;
    }
    if (map.lawn && map.lawn.has(key)) {
      ctx.fillStyle = "#2f4526";                        // 草坪（没人修剪，长得很高）
      ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = "rgba(90,120,60,0.35)";
      ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = "rgba(150,180,100,0.16)";
      for (let i = 0; i < 4; i++) ctx.fillRect(px + (h * 13 + i * 10) % TILE, py + (h * 21 + i * 9) % TILE, 2, 4);
      return;
    }
    if (map.road && map.road.has(key)) {
      ctx.fillStyle = "#2e2f33";                        // 潮湿的沥青，没有涂过漆
      ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = "rgba(140,150,165,0.07)";         // 反光的湿气
      ctx.fillRect(px + (h * 19 | 0) % TILE, py + (h * 27 | 0) % TILE, 11, 4);
      if (map.puddles && map.puddles.has(key)) {
        ctx.fillStyle = "rgba(70,95,120,0.55)";         // 水洼
        ctx.beginPath();
        ctx.ellipse(px + 12 + (h * 7 | 0), py + 20, 13, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(190,215,235,0.16)";
        ctx.beginPath();
        ctx.ellipse(px + 11 + (h * 7 | 0), py + 19, 8, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      if (map.leaves && map.leaves.has(key)) {
        ctx.fillStyle = "rgba(120,86,44,0.55)";         // 落叶
        for (let i = 0; i < 4; i++) {
          ctx.fillRect(px + (h * 11 + i * 9) % TILE, py + (h * 23 + i * 11) % TILE, 5, 3);
        }
      }
      return;
    }
    // 石质人行道：一切普通，似乎没有任何反常之处
    ctx.fillStyle = "#5c5a55";
    ctx.fillRect(px, py, TILE, TILE);
    ctx.strokeStyle = "rgba(38,37,34,0.5)";
    ctx.lineWidth = 1;
    ctx.strokeRect(px + 0.5, py + 0.5, TILE - 1, TILE - 1);
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.fillRect(px + 2, py + 2, TILE - 4, TILE - 4);
  }

  // 路灯（断电 / 闪烁 / 通电）与箭头路牌
  function drawSuburbExtras(ctx, g, cam) {
    const map = g.map;
    const left = cam.x - cam.viewW / 2, top = cam.y - cam.viewH / 2;
    const vis = (x, y, pad) => x + pad < left || y + pad < top ||
      x - pad > left + cam.viewW || y - pad > top + cam.viewH;
    const t = g.time;
    for (const p of (map.props || [])) {
      const x = (p.x + 0.5) * TILE, y = (p.y + 0.5) * TILE;
      if (vis(x, y, 70)) continue;
      if (p.type === "lamp9") {
        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.beginPath(); ctx.ellipse(0, 6, 8, 3.5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#3e4042";
        ctx.fillRect(-2, -32, 4, 38);
        ctx.fillStyle = "#4a4c4e";
        ctx.fillRect(-9, -36, 18, 5);
        let a = 0;
        if (p.mode === "on") a = 0.85;
        else if (p.mode === "flicker") {
          // 来回闪烁，有时甚至会通电 —— 电力来源不明
          a = (Math.sin(t * 9 + p.x * 3) > 0.1 ? 1 : 0.08) * (Math.sin(t * 3.7 + p.y) > -0.4 ? 1 : 0.15);
        }
        if (a > 0.02) {
          ctx.shadowColor = "rgba(255,226,150,0.9)";
          ctx.shadowBlur = 30;
          ctx.fillStyle = "rgba(255,232,170," + a.toFixed(3) + ")";
          ctx.fillRect(-7, -34, 14, 4);
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 0.16 * a;
          ctx.beginPath(); ctx.ellipse(0, 4, 40, 24, 0, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = 1;
        } else {
          ctx.fillStyle = "rgba(110,114,110,0.75)";
          ctx.fillRect(-7, -34, 14, 4);
        }
        ctx.restore();
      } else if (p.type === "sign9") {
        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = "#3a3d40";
        ctx.fillRect(-2, -14, 4, 20);
        ctx.fillStyle = "#4e6a4a";                       // 绿色的路牌
        ctx.fillRect(-17, -30, 34, 17);
        ctx.strokeStyle = "rgba(220,235,220,0.5)";
        ctx.lineWidth = 1;
        ctx.strokeRect(-16.5, -29.5, 33, 16);
        ctx.fillStyle = "rgba(235,245,235,0.92)";        // 箭头 + 里程
        ctx.beginPath();
        ctx.moveTo(-10, -21.5); ctx.lineTo(-1, -26); ctx.lineTo(-1, -23);
        ctx.lineTo(9, -23); ctx.lineTo(9, -20); ctx.lineTo(-1, -20); ctx.lineTo(-1, -17);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }
  }

  // 浓雾：碾压者的生成机制 —— 起雾时视野会明显变差
  function drawSuburbFog(ctx, g, cam) {
    const f = g.fog9 || 0;
    if (f <= 0.01) return;
    const left = cam.x - cam.viewW / 2, top = cam.y - cam.viewH / 2;
    const t = g.time;
    ctx.save();
    ctx.globalAlpha = Math.min(1, f) * 0.55;
    ctx.fillStyle = "#9aa2a8";
    ctx.fillRect(left, top, cam.viewW, cam.viewH);
    // 缓慢翻滚的一团团雾
    ctx.globalAlpha = Math.min(1, f) * 0.18;
    ctx.fillStyle = "#d3d9dd";
    for (let i = 0; i < 10; i++) {
      const a2 = t * 0.25 + i * 0.63;
      const rx = left + cam.viewW / 2 + Math.cos(a2) * cam.viewW * 0.42;
      const ry = top + cam.viewH / 2 + Math.sin(a2 * 0.8) * cam.viewH * 0.38;
      ctx.beginPath();
      ctx.arc(rx, ry, 70 + Math.sin(t * 0.7 + i) * 22, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawHotelWall(ctx, px, py, h) {
    ctx.fillStyle = "#7d362a";
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = "rgba(198,158,74,0.30)";
    for (let i = 0; i < 3; i++) {
      const yy = py + 3 + i * 13;
      ctx.fillRect(px + 2, yy, TILE - 4, 1.6);
      ctx.fillRect(px + 6 + (h * 9 | 0), yy + 3, 5, 4);
    }
    ctx.fillStyle = "rgba(0,0,0,0.16)";
    ctx.fillRect(px, py + TILE - 6, TILE, 6);
    // 墙纸上有时会浮现出人脸 —— 而且会盯着你看
    if (h > 0.93) {
      ctx.fillStyle = "rgba(30,14,10,0.35)";
      ctx.beginPath();
      ctx.ellipse(px + TILE / 2, py + TILE / 2, 7, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(20,8,6,0.7)";
      ctx.fillRect(px + TILE / 2 - 4, py + TILE / 2 - 2, 2.2, 2.2);
      ctx.fillRect(px + TILE / 2 + 2, py + TILE / 2 - 2, 2.2, 2.2);
    }
  }

  function drawHotelFloor(ctx, px, py, h, tx, ty) {
    // 三种地面交替：黑胡桃木 / 白色大理石 / 红金色地毯
    const m = (tx * 7 + ty * 13) % 3;
    if (m === 0) {
      ctx.fillStyle = "#4a3220";
      ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = "rgba(0,0,0,0.22)";
      for (let i = 0; i < 4; i++) ctx.fillRect(px + i * 10, py, 1.4, TILE);
      ctx.fillStyle = "rgba(255,220,170,0.06)";
      ctx.fillRect(px, py + 4 + (h * 20 | 0), TILE, 2);
    } else if (m === 1) {
      ctx.fillStyle = "#d9d6cc";
      ctx.fillRect(px, py, TILE, TILE);
      ctx.strokeStyle = "rgba(120,116,108,0.5)";
      ctx.lineWidth = 1;
      ctx.strokeRect(px + 0.5, py + 0.5, TILE - 1, TILE - 1);
      ctx.strokeStyle = "rgba(90,90,86,0.35)";
      ctx.beginPath();
      ctx.moveTo(px + 6, py + TILE - 8); ctx.lineTo(px + 18, py + 6);
      ctx.stroke();
    } else {
      // 红金地毯：压低饱和并整体压暗，免得和红木色墙纸糊成一片
      ctx.fillStyle = "#5c4038";
      ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = "rgba(150,126,74,0.34)";
      for (let i = 0; i < 5; i++) ctx.fillRect(px + 3, py + 4 + i * 7, TILE - 6, 2);
      ctx.fillStyle = "rgba(0,0,0,0.20)";
      ctx.fillRect(px, py, TILE, 2);
      // 地毯的绒面颗粒 —— 和墙面的平整质感区分开
      ctx.fillStyle = "rgba(255,255,255,0.045)";
      for (let i = 0; i < 6; i++) {
        ctx.fillRect(px + (h * 17 + i * 7) % TILE, py + (h * 23 + i * 6) % TILE, 2, 2);
      }
    }
    // 本层似乎有自我清洁的能力：表面看不到任何灰尘
  }

  // 贝弗莉室：地板 + 吊灯的光
  function drawBevFloor(ctx, px, py, h) {
    ctx.fillStyle = "#3b2a2f";
    ctx.fillRect(px, py, TILE, TILE);
    ctx.strokeStyle = "rgba(220,190,120,0.16)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px, py + TILE / 2); ctx.lineTo(px + TILE, py + TILE / 2);
    ctx.moveTo(px + TILE / 2, py); ctx.lineTo(px + TILE / 2, py + TILE);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,226,160," + (0.04 + h * 0.05).toFixed(3) + ")";
    ctx.fillRect(px, py, TILE, TILE);
  }

  // 锅炉房：高温的铁皮地面 + 蒸汽
  function drawBoilerFloor(ctx, px, py, h, t) {
    ctx.fillStyle = "#4a3a2c";
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = "rgba(120,90,50,0.28)";
    ctx.fillRect(px + 2, py + 2, TILE - 4, TILE - 4);
    ctx.fillStyle = "rgba(220,120,40," + (0.05 + h * 0.05).toFixed(3) + ")";
    ctx.fillRect(px, py, TILE, TILE);
    // 蒸汽（缓慢飘动）
    const w = 0.05 + 0.05 * Math.sin(t * 0.8 + h * 9);
    ctx.fillStyle = "rgba(230,230,225," + w.toFixed(3) + ")";
    ctx.fillRect(px + (h * 24 | 0), py + ((t * 12 + h * 40) % TILE), 12, 12);
  }
  function drawBoilerWall(ctx, px, py, h) {
    ctx.fillStyle = "#3a2f26";
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = "rgba(90,70,50,0.35)";
    ctx.fillRect(px, py + 6, TILE, 5);
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillRect(px + TILE - 3, py, 3, TILE);
  }

  // 旅馆的家具与机器
  function drawHotelProps(ctx, g, cam) {
    const t = g.time;
    const left = cam.x - cam.viewW / 2, top = cam.y - cam.viewH / 2;
    const props = g.map.props || [];
    for (const p of props) {
      if ((p.floor | 0) !== g.floor) continue;
      const x = (p.x + 0.5) * TILE, y = (p.y + 0.5) * TILE;
      if (x + 30 < left || y + 30 < top || x - 30 > left + cam.viewW || y - 30 > top + cam.viewH) continue;
      ctx.save();
      if (p.type === "shelf") {                       // 书架
        ctx.fillStyle = "#5c3a20";
        ctx.fillRect(x - 15, y - 13, 30, 26);
        ctx.fillStyle = "#33200f";
        for (let i = 0; i < 3; i++) ctx.fillRect(x - 13, y - 10 + i * 8, 26, 5);
        ctx.fillStyle = "#8a6a3a";
        for (let i = 0; i < 6; i++) ctx.fillRect(x - 12 + i * 4, y - 9, 3, 4);
      } else if (p.type === "cabinet") {              // 橱柜
        ctx.fillStyle = "#6b4426";
        ctx.fillRect(x - 13, y - 12, 26, 24);
        ctx.strokeStyle = "rgba(210,175,90,0.6)";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x - 13, y - 12, 26, 24);
        ctx.fillStyle = "rgba(210,175,90,0.8)";
        ctx.fillRect(x - 3, y - 1, 6, 2);
      } else if (p.type === "sofa") {                 // 古董沙发
        ctx.fillStyle = "#5a2333";
        ctx.fillRect(x - 16, y - 9, 32, 18);
        ctx.fillStyle = "rgba(210,175,90,0.35)";
        ctx.fillRect(x - 16, y - 9, 32, 3);
        ctx.fillStyle = "#3f1622";
        ctx.fillRect(x - 16, y + 4, 32, 5);
      } else if (p.type === "sconce") {               // 古董烛台（有些其实是电灯）
        const on = 0.55 + 0.45 * Math.abs(Math.sin(t * 2.2 + p.x));
        ctx.fillStyle = "#c8a24a";
        ctx.fillRect(x - 3, y - 6, 6, 14);
        ctx.shadowColor = "rgba(255,200,110," + (0.5 * on).toFixed(3) + ")";
        ctx.shadowBlur = 16;
        ctx.fillStyle = "rgba(255,214,140," + (0.75 * on).toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(x, y - 9, 4.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (p.type === "mahjong") {              // 那盘未打完的麻将
        ctx.fillStyle = "#5b3b22";
        ctx.beginPath();
        ctx.ellipse(x, y, 26, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#e9e4d2";
        for (let i = 0; i < 10; i++) {
          ctx.fillRect(x - 20 + (i % 5) * 9, y - 8 + ((i / 5) | 0) * 9, 7, 8);
        }
        ctx.fillStyle = "#3a5a2a";
        for (let i = 0; i < 3; i++) ctx.fillRect(x + 12, y - 6 + i * 7, 7, 5);
        // 它会让人本能地不想靠近
        ctx.strokeStyle = "rgba(220,200,150,0.16)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, TILE * (2.2 + 0.6 * Math.sin(t * 1.2)), 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.type === "boiler") {
        // 锅炉：竖立的铆接圆筒 + 压力表 + 接管（不是箱子，也不像桌子）
        ctx.fillStyle = "rgba(0,0,0,0.22)";
        ctx.beginPath(); ctx.ellipse(x, y + 15, 16, 5, 0, 0, Math.PI * 2); ctx.fill();
        const bw2 = 13;
        const grd = ctx.createLinearGradient(x - bw2, 0, x + bw2, 0);
        grd.addColorStop(0, "#3b2a20"); grd.addColorStop(0.45, "#7a5a3c");
        grd.addColorStop(0.7, "#5c422c"); grd.addColorStop(1, "#2e2018");
        ctx.fillStyle = grd;
        ctx.fillRect(x - bw2, y - 15, bw2 * 2, 28);
        ctx.fillStyle = "#8a6440";                                   // 上下封头
        ctx.beginPath(); ctx.ellipse(x, y - 15, bw2, 5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(x, y + 13, bw2, 4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "rgba(20,14,10,0.75)"; ctx.lineWidth = 1.6;   // 箍
        for (let i = 0; i < 3; i++) {
          ctx.beginPath(); ctx.moveTo(x - bw2, y - 8 + i * 9); ctx.lineTo(x + bw2, y - 8 + i * 9); ctx.stroke();
        }
        ctx.fillStyle = "#241a14";                                   // 铆钉
        for (let i = 0; i < 3; i++) for (let k = 0; k < 4; k++)
          ctx.fillRect(x - bw2 + 2 + k * 7, y - 9 + i * 9, 1.6, 1.6);
        ctx.fillStyle = "#e8e2d2";                                   // 压力表
        ctx.beginPath(); ctx.arc(x, y - 3, 4.6, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#2a211a"; ctx.lineWidth = 1.2; ctx.stroke();
        const na = -Math.PI * 0.72 + 0.5 * Math.sin(t * 1.4 + p.x);
        ctx.strokeStyle = "#b03a26"; ctx.lineWidth = 1.3;
        ctx.beginPath(); ctx.moveTo(x, y - 3);
        ctx.lineTo(x + Math.cos(na) * 3.4, y - 3 + Math.sin(na) * 3.4); ctx.stroke();
        ctx.strokeStyle = "#6a5236"; ctx.lineWidth = 3.4;              // 侧面接管
        ctx.beginPath(); ctx.moveTo(x + bw2 - 1, y + 4); ctx.lineTo(x + bw2 + 7, y + 4); ctx.stroke();
        const puff = 0.35 + 0.3 * Math.sin(t * 2.2 + p.y);
        ctx.fillStyle = "rgba(226,222,214," + (0.16 * puff).toFixed(3) + ")";
        ctx.beginPath(); ctx.arc(x - 3, y - 20 - puff * 5, 5 + puff * 3, 0, Math.PI * 2); ctx.fill();
      } else if (p.type === "furnace") {
        // 熔炉：砖砌炉体 + 拱形炉门（里面有火）+ 烟囱 + 炉前煤堆
        ctx.fillStyle = "rgba(0,0,0,0.24)";
        ctx.beginPath(); ctx.ellipse(x, y + 15, 18, 5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#4a3128";
        ctx.fillRect(x - 16, y - 12, 32, 28);
        ctx.strokeStyle = "#33211a"; ctx.lineWidth = 1.2;               // 砖缝
        for (let i = 1; i < 4; i++) {
          ctx.beginPath(); ctx.moveTo(x - 16, y - 12 + i * 7); ctx.lineTo(x + 16, y - 12 + i * 7); ctx.stroke();
        }
        for (let i = 0; i < 3; i++) {
          ctx.beginPath(); ctx.moveTo(x - 16 + (i + 1) * 8, y - 12); ctx.lineTo(x - 16 + (i + 1) * 8, y + 16); ctx.stroke();
        }
        const glow = 0.5 + 0.5 * Math.abs(Math.sin(t * 2 + p.x));
        ctx.shadowColor = "rgba(255,120,40," + glow.toFixed(3) + ")";
        ctx.shadowBlur = 20;
        ctx.fillStyle = "rgba(255,150,60," + (0.55 * glow).toFixed(3) + ")";
        ctx.beginPath();                                               // 拱形炉门
        ctx.moveTo(x - 7, y + 10); ctx.lineTo(x - 7, y + 1);
        ctx.arc(x, y + 1, 7, Math.PI, 0); ctx.lineTo(x + 7, y + 10); ctx.closePath(); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(255,214,130," + (0.5 * glow).toFixed(3) + ")";
        ctx.beginPath(); ctx.arc(x, y + 5, 3.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#3a2a22";                                      // 烟囱
        ctx.fillRect(x + 9, y - 22, 7, 12);
        ctx.fillStyle = "#57402f"; ctx.fillRect(x + 8, y - 24, 9, 4);
        ctx.fillStyle = "rgba(228,224,216," + (0.18 * glow).toFixed(3) + ")";
        ctx.beginPath(); ctx.arc(x + 12, y - 28 - glow * 4, 4 + glow * 2, 0, Math.PI * 2); ctx.fill();
      } else if (p.type === "tank5") {
        // 储气罐：横躺的圆柱 + 支腿 + 端盖
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.beginPath(); ctx.ellipse(x, y + 14, 17, 4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#3d3a34"; ctx.lineWidth = 3.4;
        ctx.beginPath(); ctx.moveTo(x - 10, y + 12); ctx.lineTo(x - 10, y + 5); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + 10, y + 12); ctx.lineTo(x + 10, y + 5); ctx.stroke();
        const tg = ctx.createLinearGradient(0, y - 11, 0, y + 11);
        tg.addColorStop(0, "#8f8577"); tg.addColorStop(0.5, "#b3a894"); tg.addColorStop(1, "#5d564c");
        ctx.fillStyle = tg;
        ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x - 16, y - 11, 32, 22, 9)
          : ctx.rect(x - 16, y - 11, 32, 22); ctx.fill();
        ctx.fillStyle = "#6e6559";
        ctx.beginPath(); ctx.ellipse(x - 16, y, 4, 11, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#9b9082";
        ctx.beginPath(); ctx.ellipse(x + 16, y, 4, 11, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "rgba(40,36,30,0.6)"; ctx.lineWidth = 1.3;
        ctx.beginPath(); ctx.moveTo(x - 12, y); ctx.lineTo(x + 12, y); ctx.stroke();
        ctx.fillStyle = "#c8b45a"; ctx.fillRect(x - 4, y - 14, 8, 4);    // 铭牌
      } else if (p.type === "valve5") {
        // 阀门：一段管子 + 彩色手轮
        ctx.strokeStyle = "#6f6455"; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(x - 14, y + 6); ctx.lineTo(x + 14, y + 6); ctx.stroke();
        ctx.strokeStyle = "rgba(255,255,255,0.10)"; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(x - 14, y + 4); ctx.lineTo(x + 14, y + 4); ctx.stroke();
        ctx.fillStyle = "#5b5449"; ctx.fillRect(x - 3, y - 4, 6, 12);
        const spin = t * 0.5 + p.x;
        ctx.strokeStyle = "#b8402c"; ctx.lineWidth = 2.6;
        ctx.beginPath(); ctx.arc(x, y - 6, 7.5, 0, Math.PI * 2); ctx.stroke();
        ctx.lineWidth = 2.2;
        for (let i = 0; i < 3; i++) {
          const a = spin + i * (Math.PI * 2 / 3);
          ctx.beginPath(); ctx.moveTo(x, y - 6);
          ctx.lineTo(x + Math.cos(a) * 7.5, y - 6 + Math.sin(a) * 7.5); ctx.stroke();
        }
        ctx.fillStyle = "#8a7f6d";
        ctx.beginPath(); ctx.arc(x, y - 6, 2.4, 0, Math.PI * 2); ctx.fill();
      } else if (p.type === "coal5") {
        // 煤堆：一堆深色的块 + 反光
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.beginPath(); ctx.ellipse(x, y + 12, 16, 5, 0, 0, Math.PI * 2); ctx.fill();
        const lumps = [[-11, 8, 6], [-4, 5, 8], [4, 6, 7], [10, 9, 5], [0, -1, 6], [-8, 2, 5], [7, 0, 5]];
        for (let i = 0; i < lumps.length; i++) {
          const cxp = x + lumps[i][0], cyp = y + lumps[i][1], r = lumps[i][2];
          ctx.fillStyle = i % 2 ? "#201d1b" : "#2b2724";
          ctx.beginPath();
          ctx.moveTo(cxp - r, cyp + r * 0.5);
          ctx.lineTo(cxp - r * 0.5, cyp - r);
          ctx.lineTo(cxp + r * 0.6, cyp - r * 0.7);
          ctx.lineTo(cxp + r, cyp + r * 0.4);
          ctx.closePath(); ctx.fill();
          ctx.fillStyle = "rgba(150,150,150,0.16)";
          ctx.fillRect(cxp - r * 0.4, cyp - r * 0.7, r * 0.5, r * 0.35);
        }
      } else if (p.type === "vent5") {
        // 蒸汽排气口：地上的格栅 + 往上冒的蒸汽
        ctx.fillStyle = "#3a3730"; ctx.fillRect(x - 12, y - 5, 24, 12);
        ctx.strokeStyle = "#5d584c"; ctx.lineWidth = 1.4;
        ctx.strokeRect(x - 12, y - 5, 24, 12);
        ctx.fillStyle = "#22201c";
        for (let i = 0; i < 4; i++) ctx.fillRect(x - 10 + i * 5.5, y - 3, 3, 8);
        const cy2 = (t * 26 + p.x * 13 + p.y * 7) % 46;
        ctx.fillStyle = "rgba(232,228,220," + (0.20 * (1 - cy2 / 46)).toFixed(3) + ")";
        ctx.beginPath(); ctx.arc(x - 2 + Math.sin(cy2 * 0.2) * 4, y - 6 - cy2, 6 + cy2 * 0.16, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(232,228,220," + (0.13 * (1 - cy2 / 46)).toFixed(3) + ")";
        ctx.beginPath(); ctx.arc(x + 4 - Math.sin(cy2 * 0.16) * 5, y - 6 - cy2 * 0.7, 5 + cy2 * 0.12, 0, Math.PI * 2); ctx.fill();
      } else if (p.type === "pipe") {                 // 工业管道
        ctx.strokeStyle = "#6f6455";
        ctx.lineWidth = 9;
        ctx.beginPath();
        ctx.moveTo(x - 18, y + 4);
        ctx.lineTo(x + 18, y - 4);
        ctx.stroke();
        ctx.strokeStyle = "rgba(255,255,255,0.09)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - 18, y + 1);
        ctx.lineTo(x + 18, y - 7);
        ctx.stroke();
        // 管道在漏杏仁水
        if (Math.random() < 0.004) {
          ctx.fillStyle = "rgba(240,230,190,0.6)";
          ctx.fillRect(x + 4, y + 6, 2, 3);
        }
      } else if (p.type === "stairs6" || p.type === "stairs7") {
        // 楼梯：往下去的入口（Level 6 / Level 7）
        const down = p.type === "stairs6";
        ctx.fillStyle = "#1b1b1f";
        ctx.fillRect(x - 17, y - 15, 34, 30);
        for (let i = 0; i < 5; i++) {
          ctx.fillStyle = "rgba(150,150,150," + (0.5 - i * 0.08).toFixed(2) + ")";
          ctx.fillRect(x - 14 + i, y - 12 + i * 6, 28 - i * 2, 4);
        }
        ctx.strokeStyle = down ? "rgba(255,140,60,0.55)" : "rgba(120,220,255,0.55)";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 5]);
        ctx.strokeRect(x - 17, y - 15, 34, 30);
        ctx.setLineDash([]);
        ctx.fillStyle = down ? "rgba(255,170,90,0.8)" : "rgba(150,230,255,0.85)";
        ctx.beginPath();
        ctx.moveTo(x - 6, y + 12); ctx.lineTo(x, y + 2); ctx.lineTo(x + 6, y + 12);
        ctx.fill();
      }
      ctx.restore();
    }
    // 电梯（主厅）
    for (const ev of (g.map.elevators || [])) {
      if ((ev.floor | 0) !== g.floor) continue;
      const x = (ev.x + 0.5) * TILE, y = (ev.y + 0.5) * TILE;
      if (x + 30 < left || y + 30 < top || x - 30 > left + cam.viewW || y - 30 > top + cam.viewH) continue;
      ctx.save();
      ctx.fillStyle = "#2b2723";
      ctx.fillRect(x - 16, y - 18, 32, 36);
      ctx.strokeStyle = ev.kind === "antique" ? "#c8a24a" : "#9aa0a8";
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 16, y - 18, 32, 36);
      ctx.fillStyle = "#15161a";
      ctx.fillRect(x - 1, y - 16, 2, 32);
      ctx.fillStyle = "rgba(220,220,220,0.14)";
      ctx.fillRect(x - 14, y - 16, 12, 32);
      ctx.fillRect(x + 2, y - 16, 12, 32);
      // 1~382 楼的按钮
      ctx.fillStyle = "rgba(255,220,140,0.85)";
      for (let i = 0; i < 6; i++) ctx.fillRect(x + 5, y - 12 + i * 5, 3, 3);
      if (ev.kind === "antique") {
        ctx.strokeStyle = "#c8a24a";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x - 16, y + 10); ctx.lineTo(x + 16, y + 10);
        ctx.stroke();
      }
      ctx.restore();
    }
    // 贝弗莉室的那盏巨大吊灯
    const ch = g.map.chandelier;
    if (ch && (g.floor | 0) === 1) {
      const x = ch.x * TILE, y = ch.y * TILE;
      ctx.save();
      const pulse = 0.7 + 0.3 * Math.sin(t * 1.6);
      ctx.shadowColor = "rgba(255,220,150," + (0.6 * pulse).toFixed(3) + ")";
      ctx.shadowBlur = 40;
      ctx.fillStyle = "rgba(255,232,180," + (0.8 * pulse).toFixed(3) + ")";
      ctx.beginPath();
      ctx.arc(x, y + 8, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(210,180,110,0.7)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const a2 = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(x, y + 8);
        ctx.lineTo(x + Math.cos(a2) * 22, y + 8 + Math.sin(a2) * 12);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  // ---------- Level 3：发电站的场景元素 ----------
  // 棕色砖墙
  function drawPowerWall(ctx, px, py, h) {
    ctx.fillStyle = "#6b5a2c";                       // 泛黄的砖墙（工业感）
    ctx.fillRect(px, py, TILE, TILE);
    // 砖缝
    ctx.fillStyle = "rgba(38,28,8,0.55)";
    const off = (Math.floor(px / TILE) % 2) * 10;
    for (let r = 0; r < 3; r++) {
      const yy = py + r * 13 + 2;
      ctx.fillRect(px, yy + off % 13, TILE, 1.5);
      const sx = (r % 2) ? 0 : 20;
      ctx.fillRect(px + sx, yy, 1.5, 13);
    }
    // 灰尘与锈迹
    ctx.fillStyle = "rgba(230,205,130," + (0.06 + h * 0.08).toFixed(3) + ")";
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = "rgba(150,95,25,0.16)";
    ctx.fillRect(px, py + TILE - 5, TILE, 5);
  }

  // 灰色瓷砖地面
  function drawPowerFloor(ctx, px, py, h) {
    ctx.fillStyle = "#7a7248";                       // 偏黄的水泥地（锈与油污）
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = "rgba(60,50,26,0.55)";
    ctx.fillRect(px, py, TILE, 1.5);
    ctx.fillRect(px, py, 1.5, TILE);
    ctx.fillStyle = "rgba(240,225,160," + (0.05 + h * 0.07).toFixed(3) + ")";
    ctx.fillRect(px + 4, py + 4, TILE - 8, TILE - 8);
    ctx.fillStyle = "rgba(200,180,120," + (0.06 + h * 0.09).toFixed(3) + ")";
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = "rgba(120,90,30,0.10)";
    ctx.fillRect(px + (h * 29) % TILE, py + (h * 47) % TILE, 7, 5);
  }

  // 监狱铁栅栏：锈死的铁栏，拆不掉也打不开（挡路，但看得穿）
  function drawBars(ctx, g, cam) {
    const bars = g.map.bars;
    if (!bars || !bars.size) return;
    const left = cam.x - cam.viewW / 2, top = cam.y - cam.viewH / 2;
    for (const key of bars) {
      const [sx, sy] = key.split(",");
      const tx = +sx, ty = +sy;
      const px = tx * TILE, py = ty * TILE;
      if (px + TILE < left || py + TILE < top || px > left + cam.viewW || py > top + cam.viewH) continue;
      ctx.save();
      ctx.fillStyle = "#6b4630";
      ctx.fillRect(px, py, TILE, TILE);
      // 竖铁栏
      ctx.fillStyle = "#7d5a3c";
      for (let i = 0; i < 5; i++) ctx.fillRect(px + 4 + i * 8, py, 3.5, TILE);
      // 锈迹
      ctx.fillStyle = "rgba(120,60,25,0.55)";
      for (let i = 0; i < 5; i++) {
        const rx = px + (hash2(tx * 7 + i, ty) * (TILE - 6));
        const ry = py + (hash2(tx, ty * 5 + i) * (TILE - 8));
        ctx.fillRect(rx, ry, 3 + hash2(i, tx) * 3, 2 + hash2(i, ty) * 4);
      }
      // 横梁
      ctx.fillStyle = "#5e4128";
      ctx.fillRect(px, py + 6, TILE, 3.5);
      ctx.fillRect(px, py + TILE - 10, TILE, 3.5);
      ctx.restore();
    }
  }

  // 管道漏出的黑色粘稠液体（有毒）
  function drawLeaks(ctx, g, cam) {
    const leaks = g.map.leaks;
    if (!leaks || !leaks.size) return;
    const left = cam.x - cam.viewW / 2, top = cam.y - cam.viewH / 2;
    const t = g.time;
    for (const key of leaks) {
      const [sx, sy] = key.split(",");
      const px = (+sx) * TILE, py = (+sy) * TILE;
      if (px + TILE < left || py + TILE < top || px > left + cam.viewW || py > top + cam.viewH) continue;
      const pulse = 0.6 + 0.4 * Math.sin(t * 1.4 + (+sx) + (+sy));
      ctx.fillStyle = "rgba(12,10,14,0.85)";
      ctx.beginPath();
      ctx.ellipse(px + TILE / 2, py + TILE / 2, 15, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(40,60,45," + (0.18 * pulse).toFixed(3) + ")";
      ctx.beginPath();
      ctx.ellipse(px + TILE / 2 - 3, py + TILE / 2 - 2, 7, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 电力房（发电机 + 电梯电力开关）、电梯与铁栅栏门
  function drawStation(ctx, g, cam) {
    const map = g.map;
    if (map.level !== 3) return;
    const t = g.time;
    const left = cam.x - cam.viewW / 2, top = cam.y - cam.viewH / 2;
    const vis = (px, py) => !(px + TILE < left || py + TILE < top || px > left + cam.viewW || py > top + cam.viewH);

    // 墙边的铜质管道（装饰）
    const grid = layerGrid(map, g.floor);
    const x0 = Math.max(1, Math.floor(left / TILE) - 1), y0 = Math.max(1, Math.floor(top / TILE) - 1);
    const x1 = Math.min(map.size - 2, Math.ceil((cam.x + cam.viewW / 2) / TILE) + 1);
    const y1 = Math.min(map.size - 2, Math.ceil((cam.y + cam.viewH / 2) / TILE) + 1);
    for (let ty = y0; ty <= y1; ty++) {
      for (let tx = x0; tx <= x1; tx++) {
        if (grid[ty][tx] !== 0) continue;
        const h = hash2(tx, ty);
        if (h > 0.34) continue;
        const px = tx * TILE, py = ty * TILE;
        ctx.save();
        ctx.strokeStyle = "#a86a34";
        ctx.lineWidth = 4;
        ctx.lineCap = "butt";
        ctx.beginPath();
        if (grid[ty][tx - 1] === 1) { ctx.moveTo(px + 3, py); ctx.lineTo(px + 3, py + TILE); }
        else if (grid[ty][tx + 1] === 1) { ctx.moveTo(px + TILE - 3, py); ctx.lineTo(px + TILE - 3, py + TILE); }
        else if (grid[ty - 1][tx] === 1) { ctx.moveTo(px, py + 3); ctx.lineTo(px + TILE, py + 3); }
        else { ctx.moveTo(px, py + TILE - 3); ctx.lineTo(px + TILE, py + TILE - 3); }
        ctx.stroke();
        ctx.strokeStyle = "rgba(255,200,140,0.28)";
        ctx.lineWidth = 1.4;
        ctx.stroke();
        ctx.restore();
      }
    }

    // 电力室：发电机 + 电力开关
    const pr = map.powerRoom;
    if (pr) {
      const gx = (pr.sx + 0.5) * TILE, gy = (pr.sy + 0.5) * TILE;
      if (vis(pr.sx * TILE, pr.sy * TILE)) {
        // 发电机
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.fillRect(gx - 17, gy + 6, 34, 6);
        ctx.fillStyle = "#4a4f55";
        ctx.fillRect(gx - 16, gy - 14, 32, 24);
        ctx.strokeStyle = "#23262a";
        ctx.lineWidth = 2;
        ctx.strokeRect(gx - 16, gy - 14, 32, 24);
        // 转动的风扇
        ctx.save();
        ctx.translate(gx, gy - 2);
        ctx.rotate((map.switchOn ? t * 9 : t * 0.6));
        ctx.fillStyle = map.switchOn ? "#8fe08a" : "#6b6f74";
        for (let i = 0; i < 4; i++) {
          ctx.rotate(Math.PI / 2);
          ctx.fillRect(2, -2, 11, 4);
        }
        ctx.restore();
        ctx.fillStyle = "#2b2e32";
        ctx.beginPath();
        ctx.arc(gx, gy - 2, 3.5, 0, Math.PI * 2);
        ctx.fill();
        // 电力开关（闸刀）
        const on = map.switchOn;
        ctx.fillStyle = on ? "#2fbf6b" : "#8a2f22";
        ctx.fillRect(gx - 9, gy + 12, 18, 9);
        ctx.strokeStyle = "#1a1c1f";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(gx - 9, gy + 12, 18, 9);
        ctx.strokeStyle = "#d8d0b0";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(gx - 5, gy + 16);
        ctx.lineTo(on ? gx + 4 : gx + 5, on ? gy + 12 : gy + 20);
        ctx.stroke();
        if (on) {
          ctx.shadowColor = "rgba(80,255,150,0.8)";
          ctx.shadowBlur = 16;
          ctx.fillStyle = "rgba(80,255,150,0.5)";
          ctx.fillRect(gx - 9, gy + 12, 18, 9);
          ctx.shadowBlur = 0;
        }
        ctx.restore();
      }
    }

    // 电梯：金属门 + 外层的上锁铁栅栏
    const ev = map.elevator;
    if (ev) {
      const ex = (ev.x + 0.5) * TILE, ey = (ev.y + 0.5) * TILE;
      if (vis(ev.x * TILE, ev.y * TILE)) {
        const ready = map.switchOn && hasKey();
        ctx.save();
        ctx.fillStyle = "#3a3f45";
        ctx.fillRect(ex - 17, ey - 19, 34, 38);
        ctx.strokeStyle = "#20242a";
        ctx.lineWidth = 2;
        ctx.strokeRect(ex - 17, ey - 19, 34, 38);
        // 双开门缝
        ctx.fillStyle = "#15181c";
        ctx.fillRect(ex - 1, ey - 17, 2, 34);
        ctx.fillStyle = "rgba(210,220,230,0.18)";
        ctx.fillRect(ex - 15, ey - 17, 13, 34);
        ctx.fillRect(ex + 2, ey - 17, 13, 34);
        // 上方的显示灯
        ctx.fillStyle = ready ? "#7dffb0" : (map.switchOn ? "#ffd24a" : "#8a3a30");
        ctx.fillRect(ex - 8, ey - 25, 16, 4);
        // 外层铁栅栏（没钥匙就还拦着）
        if (!hasKey()) {
          ctx.strokeStyle = "#9aa0a8";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const bx = ex - 15 + i * 6;
            ctx.moveTo(bx, ey - 19); ctx.lineTo(bx, ey + 19);
          }
          ctx.moveTo(ex - 17, ey - 8); ctx.lineTo(ex + 17, ey - 8);
          ctx.moveTo(ex - 17, ey + 8); ctx.lineTo(ex + 17, ey + 8);
          ctx.stroke();
          // 挂锁
          ctx.fillStyle = "#c9a54a";
          ctx.fillRect(ex + 12, ey + 2, 6, 7);
        }
        if (ready) {
          ctx.shadowColor = "rgba(80,255,150,0.85)";
          ctx.shadowBlur = 22;
          ctx.strokeStyle = "rgba(120,255,180,0.75)";
          ctx.lineWidth = 2;
          ctx.strokeRect(ex - 17, ey - 19, 34, 38);
          ctx.shadowBlur = 0;
        }
        ctx.restore();
      }
    }
  }

  // 铁栅栏门（Level 2 -> Level 3）：横跨走廊的锈铁栅栏，未上锁
  function drawGrateDoor(ctx, px, py, dir, g) {
    ctx.save();
    // 上下/左右两侧的框
    ctx.fillStyle = "#4a4f55";
    if (dir === "h") { ctx.fillRect(px, py, TILE, 4); ctx.fillRect(px, py + TILE - 4, TILE, 4); }
    else { ctx.fillRect(px, py, 4, TILE); ctx.fillRect(px + TILE - 4, py, 4, TILE); }
    // 铁栏
    ctx.strokeStyle = "#9aa0a8";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const o = 5 + i * 6;
      if (dir === "h") { ctx.moveTo(px + o, py + 2); ctx.lineTo(px + o, py + TILE - 2); }
      else { ctx.moveTo(px + 2, py + o); ctx.lineTo(px + TILE - 2, py + o); }
    }
    ctx.stroke();
    // 横梁 + 锈
    ctx.fillStyle = "#6f757c";
    if (dir === "h") ctx.fillRect(px, py + TILE / 2 - 2, TILE, 4);
    else ctx.fillRect(px + TILE / 2 - 2, py, 4, TILE);
    ctx.fillStyle = "rgba(150,80,30,0.35)";
    ctx.fillRect(px + 3, py + 3, TILE - 6, TILE - 6);
    // 未上锁：一点冷光提示这里可以通过
    ctx.shadowColor = "rgba(200,225,255,0.7)";
    ctx.shadowBlur = 12;
    ctx.strokeStyle = "rgba(210,235,255,0.5)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(px + 2, py + 2, TILE - 4, TILE - 4);
    ctx.restore();
  }

  // Level 4：通往草地的那片区域 —— 地面是草，围墙也是草
  function drawGrassFloor(ctx, px, py, h, tx, ty) {
    ctx.fillStyle = "#4e7a35";
    ctx.fillRect(px, py, TILE, TILE);
    // 草叶：一层短促的竖笔触
    for (let i = 0; i < 7; i++) {
      const gx = px + hash2(tx * 13 + i, ty * 7 + 3) * TILE;
      const gy = py + 6 + hash2(tx * 5 + 1, ty * 17 + i) * (TILE - 10);
      const gh = 4 + hash2(tx + i, ty * 3) * 7;
      ctx.strokeStyle = "rgba(" + (96 + h * 60 | 0) + "," + (150 + h * 60 | 0) + ",60,0.75)";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.lineTo(gx + (hash2(tx, ty + i) - 0.5) * 4, gy - gh);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(30,52,20,0.18)";
    ctx.fillRect(px, py + TILE - 4, TILE, 4);
  }
  function drawGrassWall(ctx, px, py, h) {
    ctx.fillStyle = "#5c8a3e";
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fillRect(px, py, TILE, 3);
    ctx.fillStyle = "rgba(20,40,16,0.30)";
    ctx.fillRect(px, py + TILE - 6, TILE, 6);
    // 墙也是草：垂下来的草叶
    for (let i = 0; i < 8; i++) {
      const gx = px + 2 + hash2(px + i * 3, py) * (TILE - 4);
      const gy = py + 4 + hash2(px, py + i * 5) * (TILE - 10);
      const gh = 5 + hash2(px + i, py) * 9;
      ctx.strokeStyle = "rgba(120,180,70,0.62)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.lineTo(gx + (hash2(px, py + i) - 0.5) * 5, gy + gh);
      ctx.stroke();
    }
  }

  // Level 4 的草地是"单向显示"的：平时它就是一间普通办公室，
  // 只有走到草地入口附近，那片草和裹着它的黑雾才现出来。
  function grassShown(g) {
    const m = g && g.map;
    if (!m || !m.grassZone) return true;          // 没草地就按普通画法
    if (m.grass && m.grass.has(Math.floor(g.player.x / TILE) + "," + Math.floor(g.player.y / TILE))) return true;
    const e = m.grassEntry;
    if (!e) return true;
    const d = Math.hypot(g.player.x / TILE - e.x, g.player.y / TILE - e.y);
    return d < 7;
  }

  try { window.__grassShown = grassShown; } catch (e) { /* 忽略 */ }

  // Level 4：草地周围裹着一层不散的黑雾（走进雾里就到 Level 10）
  function drawGrassFog(ctx, g, cam) {
    const m = g.map;
    if (!m.grassFog || !isLevel(g, 4)) return;
    if (!grassShown(g)) return;
    const t = g.time;
    const z = m.grassZone;
    if (!z) return;
    const cx = (z.x + z.w / 2) * TILE, cy = (z.y + z.h / 2) * TILE;
    const R = TILE * (Math.max(z.w, z.h) * 0.85);
    ctx.save();
    // 雾是"围在草地外面"的一圈：中间要能看见草，越往外越浓。
    // 之前中心就是 0.94 的黑，整片草地被盖死，看着还是一块黑的。
    const grd = ctx.createRadialGradient(cx, cy, R * 0.30, cx, cy, R * 1.30);
    grd.addColorStop(0, "rgba(6,8,7,0.10)");
    grd.addColorStop(0.52, "rgba(6,8,7,0.28)");
    grd.addColorStop(0.78, "rgba(6,8,7,0.80)");
    grd.addColorStop(1, "rgba(10,12,11,0)");
    ctx.fillStyle = grd;
    ctx.fillRect(cx - R * 1.30, cy - R * 1.30, R * 2.6, R * 2.6);
    for (let i = 0; i < 9; i++) {
      const a = t * (0.13 + i * 0.037) + i * 1.3;
      const rr = R * (0.72 + 0.42 * ((i % 3) / 2));
      const px = cx + Math.cos(a) * rr;
      const py = cy + Math.sin(a) * rr;
      const rad = TILE * (0.9 + 0.7 * ((i % 4) / 3));
      const g2 = ctx.createRadialGradient(px, py, 0, px, py, rad);
      g2.addColorStop(0, "rgba(4,6,5,0.42)");
      g2.addColorStop(1, "rgba(4,6,5,0)");
      ctx.fillStyle = g2;
      ctx.beginPath();
      ctx.arc(px, py, rad, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Level 1 出口处那团黑雾：翻滚的暗色团块，看不清后面是什么
  function drawBlackFog(ctx, g, cam) {
    const f = g.map.blackFog;
    if (!f || (f.floor | 0) !== (g.floor | 0)) return;
    const t = g.time;
    const cx = (f.x + 0.5) * TILE, cy = (f.y + 0.5) * TILE;
    const R = TILE * 3.2;
    const left = cam.x - cam.viewW / 2, top = cam.y - cam.viewH / 2;
    if (cx + R < left || cy + R < top || cx - R > left + cam.viewW || cy - R > top + cam.viewH) return;
    ctx.save();
    const grd = ctx.createRadialGradient(cx, cy, R * 0.15, cx, cy, R);
    grd.addColorStop(0, "rgba(6,6,9,0.97)");
    grd.addColorStop(0.55, "rgba(10,10,14,0.78)");
    grd.addColorStop(1, "rgba(14,14,18,0)");
    ctx.fillStyle = grd;
    ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
    for (let i = 0; i < 7; i++) {
      const a = t * (0.16 + i * 0.045) + i * 1.7;
      const rr = R * (0.32 + 0.3 * ((i % 3) / 2));
      const px = cx + Math.cos(a) * rr;
      const py = cy + Math.sin(a) * rr;
      const rad = TILE * (0.75 + 0.5 * ((i % 4) / 3));
      const g2 = ctx.createRadialGradient(px, py, 0, px, py, rad);
      g2.addColorStop(0, "rgba(4,4,7,0.55)");
      g2.addColorStop(1, "rgba(4,4,7,0)");
      ctx.fillStyle = g2;
      ctx.beginPath();
      ctx.arc(px, py, rad, 0, Math.PI * 2);
      ctx.fill();
    }
    const d = Math.hypot(g.player.x - cx, g.player.y - cy);
    if (d < TILE * 5) {
      const k = 1 - d / (TILE * 5);
      ctx.fillStyle = "rgba(220,225,230," + (0.05 * k).toFixed(3) + ")";
      for (let i = 0; i < 14; i++) {
        ctx.fillRect(cx - TILE + Math.random() * TILE * 2, cy - TILE + Math.random() * TILE * 2, 1.5, 1.5);
      }
    }
    ctx.restore();
  }

  // ---------- Level 4：废弃办公室的场景元素 ----------
  // 白色、类似混凝土质感的墙面
  function drawOfficeWall(ctx, px, py, h) {
    ctx.fillStyle = "#cbcdca";
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = "rgba(120,124,128," + (0.05 + h * 0.09).toFixed(3) + ")";
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = "rgba(0,0,0,0.10)";
    ctx.fillRect(px, py + TILE - 3, TILE, 3);
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fillRect(px, py, TILE, 2);
  }

  // 廉价的灰色地毯（和 Level 0 相仿，但是灰的，而且没有液体）
  function drawOfficeFloor(ctx, px, py, h) {
    ctx.fillStyle = "#7d7f80";
    ctx.fillRect(px, py, TILE, TILE);
    for (let i = 0; i < 5; i++) {
      const gx = px + (h * 37 + i * 11) % TILE;
      const gy = py + (h * 53 + i * 17) % TILE;
      ctx.fillStyle = "rgba(255,255,255," + (0.05 + (i % 2) * 0.05).toFixed(3) + ")";
      ctx.fillRect(gx, gy, 2, 2);
    }
    ctx.fillStyle = "rgba(0,0,0,0.07)";
    ctx.fillRect(px, py + TILE - 2, TILE, 2);
  }

  // 透光的窗：窗外透进来的持续亮光 —— 其中一部分是"窗"实体的伪装
  function drawWindows(ctx, g, cam) {
    const wins = g.map.windows;
    if (!wins || !wins.size) return;
    const t = g.time;
    const left = cam.x - cam.viewW / 2, top = cam.y - cam.viewH / 2;
    for (const key of wins) {
      const parts = key.split(",");
      const px = (+parts[0]) * TILE, py = (+parts[1]) * TILE;
      if (px + TILE < left || py + TILE < top || px > left + cam.viewW || py > top + cam.viewH) continue;
      const pulse = 0.75 + 0.25 * Math.sin(t * 1.7 + (+parts[0]) * 0.6 + (+parts[1]) * 0.4);
      ctx.save();
      ctx.fillStyle = "#6e7176";
      ctx.fillRect(px + 2, py + 2, TILE - 4, TILE - 4);
      const grd = ctx.createLinearGradient(px, py, px, py + TILE);
      grd.addColorStop(0, "rgba(236,244,255," + (0.95 * pulse).toFixed(3) + ")");
      grd.addColorStop(1, "rgba(190,214,240," + (0.75 * pulse).toFixed(3) + ")");
      ctx.fillStyle = grd;
      ctx.fillRect(px + 5, py + 5, TILE - 10, TILE - 10);
      ctx.fillStyle = "rgba(90,96,104,0.85)";
      ctx.fillRect(px + TILE / 2 - 1, py + 5, 2, TILE - 10);
      ctx.fillRect(px + 5, py + TILE / 2 - 1, TILE - 10, 2);
      ctx.shadowColor = "rgba(210,232,255," + (0.5 * pulse).toFixed(3) + ")";
      ctx.shadowBlur = 16;
      ctx.strokeStyle = "rgba(225,240,255," + (0.35 * pulse).toFixed(3) + ")";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(px + 3, py + 3, TILE - 6, TILE - 6);
      ctx.restore();
    }
  }

  // 倾斜的楼梯井（Level 3 -> Level 4）：发霉的地毯、砖墙与混凝土地板
  function drawStairwell(ctx, px, py, t) {
    ctx.save();
    ctx.fillStyle = "#1b1e22";
    ctx.fillRect(px + 3, py + 3, TILE - 6, TILE - 6);
    ctx.fillStyle = "#3a3f44";
    for (let i = 0; i < 5; i++) ctx.fillRect(px + 4 + i * 2, py + 5 + i * 6, TILE - 8 - i * 4, 4);
    ctx.strokeStyle = "rgba(150,90,60,0.55)";
    ctx.lineWidth = 1.2;
    ctx.strokeRect(px + 3.5, py + 3.5, TILE - 7, TILE - 7);
    ctx.fillStyle = "rgba(90,110,60,0.5)";
    ctx.fillRect(px + 3, py + 3, TILE - 6, 3);
    ctx.fillRect(px + 3, py + TILE - 6, TILE - 6, 3);
    const a = 0.35 + 0.3 * Math.abs(Math.sin(t * 2.4));
    ctx.fillStyle = "rgba(190,240,255," + a.toFixed(3) + ")";
    ctx.beginPath();
    ctx.moveTo(px + TILE / 2 - 6, py + TILE / 2 - 2);
    ctx.lineTo(px + TILE / 2 + 6, py + TILE / 2 - 2);
    ctx.lineTo(px + TILE / 2, py + TILE / 2 + 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // 通往 Level 5 的电梯。以前是 30×34 的深灰小方块，和灰色地毯几乎同色，
  // 丢在 88×88 的办公楼里离出生点二十多格 —— 挨个房间找根本撞不到。
  // 现在只做成一扇会发光、门前有警示带的门 —— 光是门自己的，不再有方位箭头。
  function drawOfficeElevator(ctx, ev, t) {
    const ex = (ev.x + 0.5) * TILE, ey = (ev.y + 0.5) * TILE;
    const pulse = 0.5 + 0.5 * Math.sin(t * 2.1);
    ctx.save();

    // 1) 门前地毯上的黄色警示带 —— 从走廊里就能看出这一格和别处不一样
    ctx.fillStyle = "rgba(255,190,60,0.13)";
    ctx.fillRect(ex - TILE * 0.8, ey + TILE * 0.16, TILE * 1.6, TILE * 0.9);
    ctx.strokeStyle = "rgba(255,206,96,0.55)";
    ctx.lineWidth = 2;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(ex + i * 9 - 6, ey + TILE * 0.22);
      ctx.lineTo(ex + i * 9 + 4, ey + TILE * 0.98);
      ctx.stroke();
    }

    // 2) 暖黄光晕：压在灰地毯上也能跳出来
    ctx.globalCompositeOperation = "lighter";
    const R = TILE * (1.8 + pulse * 0.5);
    const gr = ctx.createRadialGradient(ex, ey - 6, 2, ex, ey - 6, R);
    gr.addColorStop(0, "rgba(255,214,120," + (0.28 + 0.14 * pulse).toFixed(3) + ")");
    gr.addColorStop(1, "rgba(255,190,80,0)");
    ctx.fillStyle = gr;
    ctx.beginPath(); ctx.arc(ex, ey - 6, R, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = "source-over";

    // 3) 门框 + 两扇拉丝金属门
    ctx.fillStyle = "#171c21";
    ctx.fillRect(ex - 20, ey - 26, 40, 48);
    const mg = ctx.createLinearGradient(ex - 18, 0, ex + 18, 0);
    mg.addColorStop(0, "#5b646d"); mg.addColorStop(0.45, "#aab4bd");
    mg.addColorStop(0.55, "#98a2ab"); mg.addColorStop(1, "#4f575f");
    ctx.fillStyle = mg;
    ctx.fillRect(ex - 17, ey - 23, 34, 42);
    ctx.fillStyle = "#20262c";
    ctx.fillRect(ex - 1, ey - 23, 2, 42);
    ctx.strokeStyle = "rgba(230,240,250,0.35)";
    ctx.lineWidth = 1;
    ctx.strokeRect(ex - 17.5, ey - 23.5, 35, 43);

    // 4) 门楣上的琥珀色楼层灯箱：上行箭头 + 5
    ctx.fillStyle = "#101418";
    ctx.fillRect(ex - 15, ey - 34, 30, 10);
    ctx.fillStyle = "rgba(255,190,70," + (0.75 + 0.25 * pulse).toFixed(3) + ")";
    ctx.shadowColor = "rgba(255,190,70,0.9)";
    ctx.shadowBlur = 10;
    ctx.font = "bold 8px monospace";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("▲ 5", ex, ey - 29);
    ctx.shadowBlur = 0;

    // 5) 右侧呼梯按钮：亮着的圆点
    ctx.fillStyle = "#20262c";
    ctx.fillRect(ex + 21, ey - 10, 6, 12);
    ctx.fillStyle = "rgba(255,208,110," + (0.6 + 0.4 * pulse).toFixed(3) + ")";
    ctx.beginPath(); ctx.arc(ex + 24, ey - 4, 2.2, 0, Math.PI * 2); ctx.fill();

    ctx.restore();
  }

  // Level 4：楼梯井 / 电梯 / 透光的窗
  function drawOffice(ctx, g, cam) {
    const m = g.map;
    if (String(m.level) !== "4") return;
    const left = cam.x - cam.viewW / 2, top = cam.y - cam.viewH / 2;
    const vis = (px, py) => !(px + TILE < left || py + TILE < top || px > left + cam.viewW || py > top + cam.viewH);
    drawWindows(ctx, g, cam);
    if (m.stairwell && vis(m.stairwell.x * TILE, m.stairwell.y * TILE)) {
      drawStairwell(ctx, m.stairwell.x * TILE, m.stairwell.y * TILE, g.time);
    }
    if (m.elevator && vis(m.elevator.x * TILE, m.elevator.y * TILE)) {
      drawOfficeElevator(ctx, m.elevator, g.time);
    }
  }

  // ---------- 门 ----------
  // Level 0 的"闪烁的墙壁"出口（按层级过滤，避免其它层误判）
  function level0WallExit(g) {
    if (g.level !== 0 || !g.map.exits) return null;
    return g.map.exits.find((e) => e.kind === "wall" && (e.floor | 0) === g.floor) || null;
  }

  // 前往 Level 1：指定落到上层还是下层
  function goLevel1(g, floor, how) {
    if (g.phase !== "playing") return;
    AudioSys.exitChime();
    const sub = floor === 1
      ? "墙面像水波一样荡开，你跌进 Level 1 —— 下层 ..."
      : "铁门在身后合上，你踏进 Level 1 —— 上层 ...";
    startTransition(how || "已逃离 Level 0", sub, { kind: "toLevel1", floor: floor });
  }

  // ---------- Level 5：三个区域之间的穿梭 ----------
  function enterHotelArea(g, d) {
    const target = d.toFloor | 0;
    const entry = g.map.areaEntry && g.map.areaEntry[target];
    AudioSys.door(true);
    g.floor = target;
    g.player.floor = target;
    if (entry) {
      g.player.x = (entry.x + 0.5) * TILE;
      g.player.y = (entry.y + 0.5) * TILE;
    }
    g.nearDoor = null;
    g.nearArchive = null;
    hide(el.doorHint); hide(el.btnDoor);
    initAreaFog(g);
    const names = ["主厅", "贝弗莉室", "锅炉房"];
    const subs = [
      "红木与金色的墙纸，唱片机在放爵士乐。",
      "四面都是门。中央那盘麻将还没打完。",
      "热。空气里全是蒸汽，管道在滴水 —— 那水尝起来像杏仁水。",
    ];
    flashLevelToast("Level 5 · " + (names[target] || ""), subs[target] || "");
    if (target === 2) toast("锅炉房温度极高 —— 别久留");
  }

  // 换了区域：迷雾记忆要重新铺（每个区域各一份"已探索"）
  function initAreaFog(g) {
    if (!g.explored) return;
    while (g.explored.length < g.map.floors.length) {
      const layer = new Array(g.map.size);
      for (let i = 0; i < g.map.size; i++) layer[i] = new Array(g.map.size).fill(false);
      g.explored.push(layer);
    }
  }

  // 电梯：按钮一直排到 382 楼，但你只敢按 1~12 ——
  // 13 楼或更高会让人死亡或失踪（所以这里只允许按到 12 楼）。
  function rideElevator5(g) {
    AudioSys.elevator();
    const areas = [0, 1, 2].filter((a) => a !== (g.floor | 0));
    const target = areas[randInt(0, areas.length - 1)];
    const entry = g.map.areaEntry && g.map.areaEntry[target];
    g.floor = target;
    g.player.floor = target;
    if (entry) {
      g.player.x = (entry.x + 0.5) * TILE;
      g.player.y = (entry.y + 0.5) * TILE;
    }
    initAreaFog(g);
    const names = ["主厅", "贝弗莉室", "锅炉房"];
    flashLevelToast("电梯 · " + randInt(1, 12) + " 楼",
      "门开了 —— 你到了" + names[target] + "（按钮一直排到 382 楼，别去碰 13 以上）");
  }

  // ---------- Level 7：实体只活在海底 ----------
  // 海面上（房子里、海面）一只都没有，坐潜艇下到海底岩床才刷。
  // 浮回海面时把留下的实体清掉，免得它们"跟着"回到海面上。
  function l7InSeaBed(g) {
    if (!g || !g.map || !isLevel(g, 7)) return false;
    const bed = g.map.bed;
    if (!bed) return false;
    const ty = Math.floor(g.player.y / TILE);
    return ty >= bed.top && ty <= bed.bottom;
  }
  function l7ClearSurfaceEntities(g) {
    if (!g || !isLevel(g, 7)) return;
    if (l7InSeaBed(g)) return;          // 还在海底，不动
    if (g.entities && g.entities.length) g.entities.length = 0;
  }

  // ---------- Level 7：绳索 / 海底岩洞 ----------
  function useRope(g) {
    if (!inWater(g)) {
      // 没有潜水服就下水 = 送死。得先回岸上把箱子翻一遍
      if (!hasItem("divesuit")) {
        toast("没有潜水服 —— 这么下去撑不了多久。回海面上那些房子里翻翻。");
        AudioSys.growl();
        return;
      }
      // 从门廊跳下去：重力方向会被强行掰向海面
      g.player.x = (g.map.rope.x + 0.5) * TILE;
      g.player.y = (g.map.ocean.top + 1) * TILE;
      g.air = CONFIG.DIVE_AIR_MAX;
      toast("你从门廊掉了下去 —— 记住绳索的位置，那是唯一回去的路");
      AudioSys.water();
      return;
    }
    // 在水里却没穿潜水服（比如用指令传送下来的）：强制送回岸上
    if (!hasItem("divesuit")) {
      g.player.x = (g.map.porch.x + 0.5) * TILE;
      g.player.y = (g.map.porch.y - 0.5) * TILE;
      g.air = CONFIG.DIVE_AIR_MAX;
      toast("海水冷得刺骨，身体撑不住 —— 你被冲回了岸上。先去找潜水服。");
      AudioSys.growl();
      return;
    }
    // 攀上绳索，回到入口房间
    g.player.x = (g.map.porch.x + 0.5) * TILE;
    g.player.y = (g.map.porch.y - 0.5) * TILE;
    g.air = CONFIG.DIVE_AIR_MAX;
    toast("你抓住了绳索，爬回了入口房间");
    AudioSys.exitChime();
  }

  function tryCave7(g) {
    if (!hasItem("divesuit") || !hasItem("submarine")) {
      const need = [];
      if (!hasItem("divesuit")) need.push("潜水服");
      if (!hasItem("submarine")) need.push("潜艇");
      toast("还缺：" + need.join(" 与 ") + " —— 回海面上找齐再来（潜水服锁在某一座房子里）");
      AudioSys.growl();
      return;
    }
    goToLevel(g, 8, "钻进了海底岩洞", "水压骤然消失，四周变成了粗糙的岩壁 ...");
  }

  // Level 13：触碰墙上的裂缝 —— 前往 Level 21（编号门）
  function touchWallCrack(g) {
    if (!g.nearWallCrack) return;
    AudioSys.exitChime();
    startTransition("指尖刚碰到那道裂缝",
      "墙像水一样荡开 —— 你切进了 Level 21 —— 编号门 ...", { kind: "toLevel", target: 21 });
  }
  function openDoor19(g) {
    AudioSys.door(true);
    goToLevel(g, 5, "推开了那扇破损的门",
      "门后是二十世纪三十年代的爵士乐 ...");
  }

  // ---------- Level 7：海面 <-> 海底（坐潜艇往返） ----------
  // 潜艇系在一座房子的外头：三样齐了才开得动 —— 潜艇、潜艇钥匙、潜水服。
  // 少哪一样都会在提示里明确写出来。
  function boardSub(g) {
    const need = [];
    if (!hasItem("submarine")) need.push("潜艇");
    if (!hasItem("subkey")) need.push("潜艇钥匙");
    if (!hasItem("divesuit")) need.push("潜水服");
    if (need.length) {
      toast("坐不上潜艇 —— 还缺：" + need.join("、") + "（潜艇系在一座房子外头，钥匙和潜水服在另外两座房子里）");
      AudioSys.growl();
      return;
    }
    // 联机：潜艇要等所有人都坐进来才下潜
    if (g.multi && window.Net && Net.room) {
      const total = Math.max(2, (Net.memberCount && Net.memberCount()) || 2);
      const onboard = (window.LobbySubOnboard ? window.LobbySubOnboard() : 0);
      if (onboard < total) {
        // 广播一次"我上船了"，让其他人知道还差几个
        if (window.LobbySubMark) window.LobbySubMark(true);
        toast("舱门还开着 —— 等所有人上船（" + onboard + "/" + total + "）");
        AudioSys.door(false);
        return;
      }
    }
    const bed = g.map.bed;
    // 落到海底：找一格能站的岩床，别卡进礁石里
    let tx = Math.floor(bed.x1 + bed.x2) / 2, ty = bed.top + 3;
    const grid = g.map.layers[0];
    for (let i = 0; i < 300; i++) {
      const cx = randInt(bed.x1 + 2, bed.x2 - 2), cy = randInt(bed.top + 2, bed.top + 8);
      if (grid[cy] && grid[cy][cx] === 0) { tx = cx; ty = cy; break; }
    }
    g.player.x = (tx + 0.5) * TILE;
    g.player.y = (ty + 0.5) * TILE;
    // 潜艇就停在身边 —— 想回去随时能上
    g.map.subSea = { x: tx, y: ty - 1 };
    g.air = CONFIG.DIVE_AIR_MAX;
    toast("舱门合上了 —— 外面是黑得看不见底的深海。潜艇就停在身边。");
    AudioSys.door(true);
  }
  // 海底：坐潜艇浮回海面
  function subBackToDock(g) {
    const sb = g.map.sub;
    const tx = sb ? sb.x : Math.floor(g.map.size / 2);
    const ty = sb ? sb.y + 1 : 4;
    g.player.x = (tx + 0.5) * TILE;
    g.player.y = (ty + 0.5) * TILE;
    g.map.subSea = null;
    g.air = CONFIG.DIVE_AIR_MAX;
    l7ClearSurfaceEntities(g);   // 海底的实体不会跟着浮上来
    toast("浮回水面 —— 那些房子还漂在老地方。");
    AudioSys.door(true);
  }

  // ---------- 枢纽：进出 ----------
  function leaveHub(g, d) {
    const target = d.target;
    goToLevel(g, target, "穿过了枢纽的门", "门在身后合上 —— 你再也回不去枢纽了 ...");
  }

  // ---------- 通用：跳到任意层级 ----------
  // Level 14：天堂 —— 这里没有背景音乐，只有一片持续的嘈杂
  function syncAmbientNoise(g) {
    const on = isLevel(g, 14) && g.phase === "playing";
    AudioSys.ambientNoise(on);
  }

  // 背包里有没有「可爱」物件（Kitty 只认这个）
  const CUTE_ITEMS = ["teddy", "plush"];
  function firstCuteItem(g) {
    for (const k of CUTE_ITEMS) if ((g.inv[k] | 0) > 0) return k;
    return null;
  }

  function goToLevel(g, target, title, sub, opt) {
    if (g.phase !== "playing") return;
    // 离开 Level !：警报必须**这一刻**就停，不能等传送动画走完。
    // 以前只在"新一层初始化"时才停（main.js 换层那段 bangAlarm(false)），
    // 而过场要走 3~4 秒 —— 那几秒里红灯和警报还在响，玩家只会觉得
    // "这音乐关不掉"。现在一决定要走就停掉，默认音乐立刻接上。
    if (String(g.level) === "bang" || g.bangAlarm) {
      g.bangAlarm = false;
      try { AudioSys.bangAlarm(false); } catch (e) { /* 忽略 */ }
    }
    // 身上带着「可爱」物件切行：有极小概率被送到 Level 974，而不是原本要去的地方。
    // 刚从 Kitty 那儿睡着醒来时不走这条（noReroute），免得刚出来又被送回去。
    let tgt = target;
    if (!(opt && opt.noReroute) && String(tgt) !== "974" && firstCuteItem(g) && Math.random() < 0.12) {
      tgt = 974;
      title = "推开了一扇没见过的门";
      sub = "门后是一间粉红色的屋子。空气里有股烤饼干的味道 —— 你切进了 Level 974 ...";
    }
    AudioSys.exitChime();
    startTransition(title || "切出了本层", sub || "", { kind: "toLevelX", level: tgt });
  }

  // 把一件「可爱」物件交给 Kitty —— 这是 Level 974 唯一的出口。
  // 你会立刻睡着，然后在一个安全层级里醒来。
  function giveKitty(g) {
    const key = firstCuteItem(g);
    if (!key) { toast("Kitty 一动不动地看着你。你身上没有它想要的东西。"); return; }
    const nm = (typeof ITEMS !== "undefined" && ITEMS[key]) ? ITEMS[key].name : "那件东西";
    g.inv[key] = (g.inv[key] | 0) - 1;
    if ((g.inv[key] | 0) <= 0) delete g.inv[key];
    const tgt = [1, 11, 900][Math.floor(Math.random() * 3)];
    goToLevel(g, tgt, "把" + nm + "给了 Kitty",
      "它接过去，抱在怀里。你忽然困得睁不开眼 —— 再醒来时，是 " + levelDef(tgt).name + " ...",
      { noReroute: true });
  }

  // ===========================================================
  // 迁跃浆果
  //   野生浆果（Level 4、5、10 的浆果丛 5 颗 / Level 11 小概率的一盒 4 颗）：
  //     第一颗记住当前层级，第二颗回到那里。
  //   B.N.T.G 人工浆果：第一颗同样记住层级，第二颗把你困在 Level 10，且不可逆。
  // ===========================================================
  function pickWarpBerry(g, p) {
    const n = p.type === "berrybox" ? 4 : 5;
    const free = Math.max(0, (bagCap() | 0) - bagUnits().length);
    const take = g.bagCapInfinite ? n : Math.min(n, free);
    if (take <= 0) { toast("背包满了（" + bagText() + "）—— 装不下这些浆果"); AudioSys.growl(); return; }
    g.inv.warpberry = (g.inv.warpberry | 0) + take;
    // 摘走就没了：丛和盒子都是一次性的
    const idx = (g.map.props || []).indexOf(p);
    if (idx >= 0) g.map.props.splice(idx, 1);
    g.nearBerry = null;
    try { if (AudioSys.pickup) AudioSys.pickup(); } catch (e) { /* 忽略 */ }
    toast(p.type === "berrybox" ? ("收下一整盒 —— 迁跃浆果 ×" + take) : ("摘下 迁跃浆果 ×" + take));
    updateBag(); updateHud(); renderHotbar();
  }

  function eatWarpBerry(g, key) {
    // Level 30 抽离现实：从踏进来的那一刻起你就已经死了 —— 浆果送不动一个死人。
    if (String(g.level) === "30") {
      try { if (AudioSys.drink) AudioSys.drink(); } catch (e) { /* 忽略 */ }
      toast("浆果在舌尖化开 —— 什么都没有发生。你已经死了。");
      return true;
    }
    const bntg = key === "bntgwarp";
    g.inv[key] = (g.inv[key] | 0) - 1;
    if ((g.inv[key] | 0) <= 0) delete g.inv[key];
    updateBag(); updateHud(); renderHotbar();
    const here = String(g.level);
    if (!g.berryMark) {
      g.berryMark = here;
      const nm = levelDef(here).name || here;
      toast("浆果在舌尖化开 —— 你记住了这里：" + nm);
      try { if (AudioSys.drink) AudioSys.drink(); } catch (e) { /* 忽略 */ }
      return true;
    }
    const mark = g.berryMark;
    g.berryMark = null;
    // 从背包里吃的时候背包还开着 —— goToLevel 只在 phase==="playing" 时才走，
    // 不先关掉背包就等于吃了没反应。
    try { closeBag(); } catch (e) { /* 忽略 */ }
    if (g.phase !== "playing") g.phase = "playing";
    if (bntg) {
      g.berryTrap = true;
      toast("第二颗下去，味道不对 —— Level 10 的空气灌进肺里。你被困住了。");
      goToLevel(g, 10, "浆果把你送错了地方",
        "麦浪的味道扑面而来 —— 你又回到了 Level 10。往后再怎么走，也只会回到这里 ...");
      return true;
    }
    if (mark === here) { toast("你本来就在这儿 —— 浆果没起任何作用"); return true; }
    const nm = levelDef(mark).name || mark;
    goToLevel(g, mark, "第二颗浆果",
      "脚下的地面换了 —— 你回到了记住的那个地方：" + nm + " ...");
    return true;
  }

  // ---------- 截屏：Shift + F3 ----------
  // 直接从游戏画布取像素（canvas.toBlob），不经过 DOM 截图 ——
  // 这样 HUD、按钮、暂停面板、鼠标指针统统不会出现在图里。
  // 顺带把"暂停中"临时恢复一帧，避免截到暂停面板压上去的画面。
  function shotScreenshot() {
    const cv = document.getElementById("game");
    if (!cv) { toast("找不到画布"); return; }
    const done = () => {
      try {
        cv.toBlob((blob) => {
          if (!blob) { toast("截屏失败"); return; }
          const gRef = (typeof game !== "undefined" ? game : window.__game);
          const lv = (gRef && gRef.level != null) ? String(gRef.level) : "x";
          const d = new Date();
          const pad = (n) => String(n).padStart(2, "0");
          const name = "backrooms_L" + lv + "_" + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate())
            + "_" + pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds()) + ".png";
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = name;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
          toast("已截屏 —— " + name);
        }, "image/png");
      } catch (e) { toast("截屏失败"); }
    };
    // 暂停中：先恢复 playing 渲染一帧，截完再回到暂停
    const gRef = (typeof game !== "undefined" ? game : window.__game);
    if (gRef && gRef.phase === "paused") {
      const prev = gRef.phase;
      gRef.phase = "playing";
      try { if (typeof draw === "function") draw(); } catch (e) { /* 忽略 */ }
      requestAnimationFrame(() => {
        requestAnimationFrame(() => { gRef.phase = prev; });
      });
      done();
      return;
    }
    done();
  }

  // 前往 Level 3（发电站）
  function goLevel3(g, how) {
    if (g.phase !== "playing") return;
    AudioSys.exitChime();
    startTransition(how || "已逃离 Level 2",
      "铁栅栏在身后晃了一下，机器轰鸣扑面而来 —— 你切进了 Level 3 ...",
      { kind: "toLevel3" });
  }

  // ---------- 主菜单背景图 ----------
  // 图片资源全部由玩家自己放进 img/ 目录，包里不带任何默认背景图。
  // 没解锁之前，面板里也不会透露第二张图上画了什么。
  const MENU_BGS = [
    { id: "bg1", file: "img/menu-bg.jpg",
      name: "后室 · 阈界", alt: "后室 Level 0 · 俯视",
      how: "把 menu-bg.jpg 放进 img/ 才会显示（包里不带任何默认背景图）", locked: false },
    { id: "bg2", file: "img/menu-bg_2.jpg", name: "M.E.G 的 Alpha 基地", alt: "M.E.G 的 Alpha 基地",
      how: "解锁方法：进入 Level 1 里的 M.E.G「Alpha 基地」", locked: true,
      lockHint: "尚未解锁 —— 图上画了什么，得你自己去看" },
    { id: "bg3", file: "img/994sea.png", name: "存在于此", alt: "Level 994 · 存在于此",
      how: "解锁方法：在 Level 994 被海浪吞掉", locked: true,
      lockHint: "尚未解锁 —— 图上画了什么，得你自己去看" },
    { id: "bg4", file: "img/window301.png", name: "希望之窗", alt: "Level 301 · 希望之窗",
      how: "解锁方法：在 Level 301 打碎最上方那扇窗，回到前厅", locked: true,
      lockHint: "尚未解锁 —— 图上画了什么，得你自己去看" },
    { id: "bg5", file: "img/11-3.png", name: "红灯区", alt: "Level 11.3 · 红灯区",
      how: "解锁方法：进入 Level 11.3 红灯区", locked: true,
      lockHint: "尚未解锁 —— 图上画了什么，得你自己去看" },
  ];
  const BG_KEY = "br_bg_choice";

  function bgUnlocked(id) {
    const d = MENU_BGS.find((x) => x.id === id);
    if (!d) return false;
    if (!d.locked) return true;
    // 每张解锁图用自己的 key —— 以前写死只判 "bg2"，后面加的图永远解锁不了
    return unlockedOutfits().includes(id);
  }
  function bgChoice() {
    let v = "bg1";
    try { v = localStorage.getItem(BG_KEY) || "bg1"; } catch (e) { /* 忽略 */ }
    const d = MENU_BGS.find((x) => x.id === v);
    if (!d || !bgUnlocked(d.id)) v = "bg1";
    return v;
  }
  function setBgChoice(id) {
    try { localStorage.setItem(BG_KEY, id); } catch (e) { /* 忽略 */ }
    applyMenuBg();
  }

  // 主菜单背景图：只用玩家自己放进 img/ 的图，包里没有默认图、也不做图片回退。
  // 两层一起换（底层模糊铺边角 + 上层完整不裁切），绝不覆盖或裁掉玩家那张图。
  function applyMenuBg() {
    const d = MENU_BGS.find((x) => x.id === bgChoice()) || MENU_BGS[0];
    for (const id of ["menu-bg-fill", "menu-bg"]) {
      const img = document.getElementById(id);
      if (!img) continue;
      img.alt = d.alt || "";
      img.style.display = "";
      img.setAttribute("src", d.file);   // 缺图时 onerror 直接隐藏，露出 CSS 底色
    }
  }

  // 右下角的「背景图」按钮：切换背景 / 查看解锁方法
  function openBgSel() {
    const list = document.getElementById("bgsel-list");
    const desc = document.getElementById("bgsel-desc");
    if (!list) return;
    const cur = bgChoice();
    list.innerHTML = "";
    for (const d of MENU_BGS) {
      const ok = bgUnlocked(d.id);
      const row = document.createElement("div");
      row.className = "bg-item" + (cur === d.id ? " on" : "") + (ok ? "" : " locked");
      const th = document.createElement("div");
      th.className = "bg-thumb";
      if (ok) {
        const im = document.createElement("img");
        im.src = d.file;
        im.alt = "";
        im.onerror = () => {
          if (d.fallback && !im.src.endsWith(d.fallback)) { im.src = d.fallback; return; }
          th.textContent = "无图";
        };
        th.appendChild(im);
      } else th.textContent = "?";
      const nm = document.createElement("div");
      nm.className = "bg-name";
      nm.textContent = ok ? d.name : "??????（未解锁）";
      const tg = document.createElement("div");
      tg.className = "bg-tag";
      tg.textContent = !ok ? "未解锁" : (cur === d.id ? "使用中" : "可切换");
      row.appendChild(th); row.appendChild(nm); row.appendChild(tg);
      row.addEventListener("click", () => {
        if (!ok) {
          desc.innerHTML = "<p><b>解锁方法</b></p><p>" + escapeHtml(d.how) + "</p>" +
            '<p style="color:#8a2f2f;">' + escapeHtml(d.lockHint || "") + "</p>";
          return;
        }
        setBgChoice(d.id);
        desc.innerHTML = "<p>已切换到：<b>" + escapeHtml(d.name) + "</b></p>" +
          '<p style="color:#8a7a5a;">（图片放在 ' + escapeHtml(d.file) + "）</p>";
        openBgSel();
      });
      list.appendChild(row);
    }
    const cd = MENU_BGS.find((x) => x.id === cur);
    desc.innerHTML = "<p>当前：<b>" + escapeHtml(cd ? cd.name : "") + "</b></p>" +
      "<p>" + escapeHtml(cd ? cd.how : "") + "</p>";
    show(document.getElementById("bgsel"));
  }
  function closeBgSel() { hide(document.getElementById("bgsel")); }

  function updateDoors(g) {
    const p = g.player;
    // 踏进红灯区 -> 解锁第五张主菜单背景图
    if (String(g.level) === "11.3" && !g._bg5) {
      g._bg5 = true;
      markUnlock("bg5");
      applyMenuBg();
      toast("解锁了新东西 —— 主菜单的背景变了");
    }
    // 踏进 M.E.G 的 Alpha 基地 -> 解锁第二张主菜单背景图
    const ab = g.map.alphaBase;
    if (ab && (g.floor | 0) === (g.map.megFloor | 0)) {
      const tk = Math.floor(p.x / TILE) + "," + Math.floor(p.y / TILE);
      if (ab.inside.has(tk) && !g._bg2) {
        g._bg2 = true;
        markUnlock("bg2");
        applyMenuBg();
        toast("解锁了新东西 —— 主菜单的背景变了");
      }
    }
    let near = null, nd = CONFIG.DOOR_REACH * TILE;
    for (const d of g.map.doors) {
      if ((d.floor | 0) !== g.floor) continue;
      let best = Infinity;
      for (const t of d.tiles) {
        const dx = (t.x + 0.5) * TILE - p.x, dy = (t.y + 0.5) * TILE - p.y;
        best = Math.min(best, Math.hypot(dx, dy));
      }
      // M.E.G 的伸缩门：靠近就朝一侧滑开，走远了自己关上。
      // slide 是 0~1 的滑动进度，画画的时候用它做位移，别一帧跳到底。
      if (d.meg) {
        const want = best < TILE * 2.2;
        if (want !== d.open) { d.open = want; setDoorOpen(g.map, d, want); }
        continue;
      }
      if (best < nd) { nd = best; near = d; }
    }
    // 伸缩门的滑动动画（每帧推进一点）
    for (const d of g.map.doors) {
      if (!d.meg || (d.floor | 0) !== g.floor) continue;
      const target = d.open ? 1 : 0;
      if (d.slide == null) d.slide = target;
      d.slide += (target - d.slide) * 0.16;
      if (Math.abs(target - d.slide) < 0.01) d.slide = target;
    }
    g.nearDoor = near;
    if (near) {
      el.doorHint.innerHTML = doorHintText(near);
      show(el.doorHint);
      if (el.btnDoor) {           // 触屏：门旁才冒出"开门"按钮
        el.btnDoor.textContent = doorActionName(near);
        show(el.btnDoor);
      }
    } else {
      hide(el.doorHint);
      hide(el.btnDoor);
    }
  }

  // 按钮上的动词（门本身会用到的动作名）
  function doorActionName(d) {
    if (d.kind === "red") return "红门";
    if (d.kind === "entry02") return "原路返回";
    if (d.kind === "exit02") return "离开";
    if (d.kind === "iron1") return "铁门";
    if (d.kind === "wood04") return "木门";
    if (d.kind === "grate3") return "栅栏门";
    if (d.kind === "stair4") return "楼梯井";
    if (d.kind === "area5") return d.toFloor === 1 ? "贝弗莉室" : (d.toFloor === 2 ? "锅炉房" : "主厅");
    if (d.kind === "room5") return d.locked ? "上锁的客房" : "客房";
    if (d.kind === "elev13") return "电梯";
    if (d.kind === "suite13") return "房门";
    if (d.kind === "light15") return "光点";
    if (d.kind === "frostdoor") return "L" + d.target + " 的门";
    if (d.kind === "door03") return "门";
    if (d.kind === "abgate") return "走廊门";
    if (d.kind === "abdoor") return d.letter + " 门";
    if (d.kind === "abexit") return "枢纽门";
    if (d.kind === "megentry") return "M.E.G 大门";
    if (d.kind === "megdoor") return "M.E.G 门";
    if (d.kind === "num105") return "105 门";
    if (d.kind === "smiledoor") return "笑脸门";
    if (d.kind === "numdoor") return (d.label || "?") + " 门";
    if (d.kind === "locked21") return "上锁的门";
    if (d.kind === "elsewhere21") return "门";
    if (d.kind === "hubdoor" || d.kind === "tohub") {
      const lv3 = d.target != null ? d.target : d.toLevel;
      const df3 = levelDef(lv3);
      return (df3 && df3.label ? df3.label : ("L" + lv3)) + " 的门";
    }
    return d.open ? "关门" : "开门";
  }

  function doorHintText(d) {
    let act;
    if (d.kind === "red") act = "打开红门 · 进入 Level 0.2";
    else if (d.kind === "entry02") act = "原路返回 Level 0";
    else if (d.kind === "exit02") act = "离开（Level 0 随机区域）";
    else if (d.kind === "iron1") act = "进入 Level 1 上层";
    else if (d.kind === "wood04") act = "推开这扇木门";
    else if (d.kind === "grate3") act = "穿过未上锁的铁栅栏 · 进入 Level 3";
    else if (d.kind === "stair4") act = "走下倾斜的楼梯井 · 进入 Level 4";
    else if (d.kind === "area5") {
      act = d.toFloor === 1 ? "进入贝弗莉室" : (d.toFloor === 2 ? "进入锅炉房" : "回到主厅");
    } else if (d.kind === "room5") {
      act = d.locked ? "（这扇门锁着 —— 有些门会自己解锁）" : (d.open ? "关上房门" : "推开房门");
    } else if (d.kind === "elev13") {
      act = "走进电梯 · 可以在这栋楼里选择楼层";
    } else if (d.kind === "light15") {
      act = "走进那个发光的光点 · 传言能把你送到随机的层级";
    } else if (d.kind === "frostdoor") {
      const df4 = levelDef(d.target);
      act = "穿过这扇标着 " + d.target + " 的门 · 前往 " + (df4.label || ("Level " + d.target));
    } else if (d.kind === "suite13") {
      act = d.open ? "关上房门" : "推开房门 · 里面是一间一模一样的套房";
    } else if (d.kind === "abgate") {
      act = "推开这扇混凝土门 · 门后是一段走廊";
    } else if (d.kind === "abdoor") {
      // 不提示对错 —— 这是要靠试错或情报才能解开的谜题
      act = "推开标着 " + d.letter + " 的门 · 门后还是走廊";
    } else if (d.kind === "megentry") {
      act = "M.E.G · Alpha 基地的大门 —— 靠近就会滑开";
    } else if (d.kind === "megdoor") {
      act = "M.E.G 基地的内部滑门 —— 靠近就会滑开";
    } else if (d.kind === "abexit") {
      act = "穿过这扇门 · 前往枢纽";
    } else if (d.kind === "hubdoor" || d.kind === "tohub") {
      const df = levelDef(d.target != null ? d.target : d.toLevel);
      const lv = d.target != null ? d.target : d.toLevel;
      const nm = df.label || ("Level " + lv);
      const K = window.LEVEL_KEY;
      const have = K && K.hasKeyFor(game, lv);
      act = hubDoorLocked(d)
        ? "这扇门通往 " + nm + " —— 还锁着（得先在 " + nm + " 里找到对应的层级密钥）"
        : (have && String(lv) !== "1" && String(lv) !== "11"
            ? "身上有 " + nm + " 的层级密钥 · 按 E 开门（钥匙不会消失）"
            : "穿过这扇门 · 前往 " + nm);
    } else if (d.kind === "num105") {
      act = "门上挂着 105 号牌 · 回到 Level 0";
    } else if (d.kind === "numdoor") {
      act = "门上挂着 " + (d.label || "?") + " 号牌 " + d.target;
    } else if (d.kind === "smiledoor") {
      act = "门上画着一张笑脸 —— 后面飘来一股甜味";
    } else if (d.kind === "locked21") {
      act = "这扇门锁着，牌子上的字已经看不清了";
    } else if (d.kind === "elsewhere21") {
      act = "推开门  的其他地方";
    } else act = d.open ? "关门" : "开门";
    return touchMode ? '点击右下 <b>' + doorActionName(d) + '</b> 按钮 · ' + act : '按 <b>R</b> ' + act;
  }

  // 手机「拾取」按钮：只管地上的东西与箱子（权重：捡杏仁水 > 开箱）
  function pickAction() {
    const g = game;
    if (!g || g.phase !== "playing") return;
    const it = g.nearItem;
    if (it && it.item !== "crowbar") { pickGround(g, it); return; }
    if (g.nearBroken) { pickBroken(g, g.nearBroken); return; }
    const cr = g.nearCrate;
    if (cr) { pickCrate(g, cr); return; }
  }

  // 捡起地上的东西（supplyAction 与「拾取」按钮共用）
  function pickGround(g, it) {
    // 已经点选过的地上物品：再按就是"用掉它"，不是捡起来
    if (g.groundSel && g.groundSel === it && (it.item === "almond" || it.item === "bad")) {
      useGroundItem(it); return;
    }
    if (g.multi && it.item === "divesuit" && hasItem("divesuit")) {
      toast("你已经有一件潜水服了 —— 剩下的留给别人"); AudioSys.growl(); return;
    }
    if (bagFull()) {
      toast("背包满了（" + bagText() + "）—— 捡不起" + itemName(it.item)); AudioSys.growl(); return;
    }
    it.taken = true;
    // 录像带：捡起来不只是多一件物品，还要把那段录像收进自己的视频档案
    if (it.item === "tape") {
      if (!g.tapeIds) g.tapeIds = [];
      if (it.tapeId) {
        if (g.tapeIds.indexOf(it.tapeId) < 0) g.tapeIds.push(it.tapeId);
        if (window.CamRec && !CamRec.metaOf(it.tapeId)) {
          try { CamRec.adopt(it.meta || { id: it.tapeId }, it.frames || []); } catch (e) { /* 忽略 */ }
        }
      }
      addItem("tape", 1);
      toast("捡到了一卷录像带 —— 层级档案 → 视频档案里能看");
      g.nearItem = null;
      return;
    }
    addItem(it.item, 1);
    if (tryKeepsake(g, it.item)) return;
    if (it.disguised) {
      toast("拿到手上一看 —— 瓶子里的东西是浑浊的。<b>受污染的杏仁水</b>。");
      AudioSys.growl();
    } else {
      toast("捡起了" + itemName(it.item));
    }
    g.nearItem = null;
  }

  // 翻找破损的箱子
  function pickBroken(g, p) {
    p.opened = true;
    g.nearBroken = null;
    AudioSys.door(true);
    if (p.contains) {
      if (!g.bagCapInfinite && bagSlots() + 1 > bagCap()) {
        toast("背包满了（" + bagText() + "）—— 里面的东西拿不走"); AudioSys.growl(); return;
      }
      addItem(p.contains, 1);
      toast("翻出了一" + (p.contains === "almond" ? "瓶杏仁水" : itemName(p.contains)));
    } else {
      toast("翻了个遍 —— 空的"); AudioSys.growl();
    }
  }

  // 撬开补给箱
  function pickCrate(g, c) {
    if (!hasCrowbar()) {
      toast((game.inv.crowbar | 0) > 0
        ? "撬棍在背包里 —— 按 Tab 打开背包，把它放进下面的快捷键槽才能用"
        : "箱子钉得很死 —— 得先找到一根撬棍");
      return;
    }
    c.opened = true;
    g.nearCrate = null;
    AudioSys.door(true);
    if (c.loot > 0) {
      if (!g.bagCapInfinite && bagSlots() + c.loot > bagCap()) {
        toast("背包满了（" + bagText() + "）—— 箱子里那 " + c.loot + " 瓶拿不走");
        AudioSys.growl(); return;
      }
      addItem("almond", c.loot);
      const gotBattery = Math.random() < 0.05;
      if (gotBattery) addItem("battery", 1);
      toast("撬开了补给箱 —— 里面是 " + c.loot + " 瓶杏仁水"
        + (gotBattery ? "，还有 1 颗相机电池" : ""));
    } else {
      toast("撬开了补给箱 —— 空的"); AudioSys.growl();
    }
  }

  // 「拾取」按钮只在周围真有东西时才亮出来
  function updatePickBtn() {
    const b = el.btnPick;
    if (!b) return;
    const g = game;
    const on = !!(g && g.phase === "playing" &&
      ((g.nearItem && g.nearItem.item !== "crowbar") || g.nearBroken || g.nearCrate));
    b.classList.toggle("hidden", !on);
    b.classList.toggle("ready", on);
  }

  // E：优先阅读档案，其次捡东西 / 撬箱子
  function readAction() {
    const g = game;
    if (!g || g.phase !== "playing") return;
    if (g.nearArchive) { collectArchive(g.nearArchive); return; }
    if (g.nearRadio) { toggleRadio(g); return; }
    supplyAction();
  }

  // R（或触屏"开门"按钮）：只负责门 —— 开关 / 进出子层级
  // 关着的伸缩门也是实心的：挡人也挡视线。开了才是通的。
  function megSolid(d) { return d.meg && (d.slide != null ? d.slide < 0.55 : !d.open); }

  function doorAction() {
    const g = game;
    if (!g || g.phase !== "playing") return;
    // Level 19：破损的门 —— 按 R 推开
    if (g.nearDoor19) { openDoor19(g); return; }
    const d = g.nearDoor;
    if (!d) return;
    if (d.kind === "red") { enterSubLevel(d); return; }
    if (d.kind === "entry02" || d.kind === "exit02") { leaveSubLevel(d); return; }
    if (d.kind === "iron1") { goLevel1(g, d.toFloor != null ? d.toFloor : 0, "白色铁门"); return; }
    if (d.kind === "wood04") {
      AudioSys.exitChime();
      goToLevel(g, "traproof", "推开了那扇木门",
        "门后不是 Level 1 —— 脚下是一张悬空的网，网眼底下什么都没有 ...");
      return;
    }
    if (d.kind === "grate3") { goLevel3(g, "穿过铁栅栏门"); return; }
    if (d.kind === "door03") {
      AudioSys.exitChime();
      goToLevel(g, 0, "推开了那扇门",
        "冰霜在身后合上 —— 你回到了 Level 0 —— 阈界 ...");
      return;
    }
    if (d.kind === "stair4") {
      goToLevel(g, 4, "已走下楼梯井",
        "发霉的地毯味散去，眼前是一层安静的办公区 —— 你切进了 Level 4 ...");
      return;
    }
    // Level 21：门上的标签决定它通向哪里
    if (d.kind === "num105" || d.kind === "numdoor" || d.kind === "smiledoor") {
      AudioSys.exitChime();
      const tgt = d.target;
      if (tgt === 26 || String(tgt) === "26") {
        startTransition("门后飘来一股甜味",
          "一间接着一间的黄色派对厅，望不到头 —— Level 26 · 享乐号汽船 ...", { kind: "toLevel", target: 26 });
      } else {
        startTransition("门上的标签是 " + (d.label || "?") + " 号",
          "门在身后合上 —— 你切进了 Level " + tgt + " ...", { kind: "toLevel", target: tgt });
      }
      return;
    }
    if (d.kind === "locked21") {
      toast("这扇门锁着。标签已经看不清了。");
      AudioSys.growl();
      return;
    }
    if (d.kind === "elsewhere21") {
      // 通往 Level 21 的其他地方 —— 换个位置继续找
      AudioSys.door(true);
      g.pending = { kind: "elsewhere21" };
      startTransition("门后还是走廊",
        "你推开门，走了出去 —— 可眼前这条走廊，和你刚才那条一模一样 ...",
        { kind: "elsewhere21" });
      return;
    }
    if (d.kind === "area5") { enterHotelArea(g, d); return; }
    if (d.kind === "room5") {
      if (d.locked) { toast("这扇门锁着。据说有些门会随着时间的推移自己解锁。"); AudioSys.growl(); return; }
      setDoorOpen(g.map, d, !d.open);
      AudioSys.door(d.open);
      return;
    }
    if (d.kind === "tohub") {
      AudioSys.exitChime();
      startTransition("门后是一条昏暗的隧道", "沥青地面，三条黄线 —— 你切进了枢纽 ...", { kind: "toHub" });
      return;
    }
    if (d.kind === "abgate") {
      setDoorOpen(g.map, d, !d.open);
      AudioSys.door(d.open);
      return;
    }
    if (d.kind === "abdoor") {
      if (!d.correct) {
        // 走错就是走错了 —— 门后不是走廊
        g.deathCause = "推开了标着 " + d.letter + " 的门";
        AudioSys.growl();
        showDead();
        return;
      }
      if (!d.open) {
        setDoorOpen(g.map, d, true);
        AudioSys.door(true);
        toast("门开了 —— 后面还有一段走廊。");
      }
      return;
    }
    if (d.kind === "elev13") {
      openElevator(d);
      return;
    }
    if (d.kind === "light15") {
      // 档案：离开 Level 15 时有 1.8% 的概率进入 Level 15.1 枉然
      if (Math.random() < 0.018 && levelDef("15.1")) {
        AudioSys.exitChime();
        startTransition("光点把你吞了进去",
          "等你能看清东西的时候，眼前是一排排仿真设备 —— 你掉进了 Level 15.1 —— 枉然 ...",
          { kind: "toLevelX", level: "15.1" });
        return;
      }
      const pool = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13];
      const to = pool[randInt(0, pool.length - 1)];
      AudioSys.exitChime();
      startTransition("光点把你吞了进去", "等你能看清东西的时候，周围已经不是 Level 15 了 ...", { kind: "toLevelX", level: to });
      return;
    }
    if (d.kind === "frostdoor") {
      AudioSys.door(true);
      const df5 = levelDef(d.target);
      startTransition("门上标着 " + d.target, "门在身后合上 —— " + df5.name + " ...", { kind: "toLevelX", level: d.target });
      return;
    }
    if (d.kind === "abexit") {
      AudioSys.exitChime();
      goToLevel(g, "hub", "走廊尽头的门开了",
        "三条黄线，成排的混凝土门 —— 你切进了枢纽 ...");
      return;
    }
    if (d.kind === "hubdoor" || d.kind === "tohub") {
      const lvK = d.target != null ? d.target : d.toLevel;
      if (hubDoorLocked(d)) {
        const df2 = levelDef(lvK);
        const nm2 = df2.label || ("Level " + lvK);
        toast("这扇门通往 " + nm2 + " —— 还锁着。得先在 " + nm2 + " 里找到对应的层级密钥。");
        AudioSys.growl();
        return;
      }
      if (d.kind === "hubdoor") {
        // 开门不消耗钥匙：只在本局里把门记成"已开"，钥匙仍在背包里。
        const K = window.LEVEL_KEY;
        if (K && K.hubOpen(g, lvK)) {
          toast("层级密钥插进锁孔又弹回手里 —— 门开了，钥匙还在（这扇门此后一直开着）");
          try { AudioSys.door(true); } catch (e) { /* 忽略 */ }
        }
        leaveHub(g, d); return;
      }
      startTransition("穿过了这扇门", "门在身后合上 —— 你切进了枢纽 ...", { kind: "toLevelX", level: "hub" });
      return;
    }
    setDoorOpen(g.map, d, !d.open);
    AudioSys.door(d.open);
  }

  // 进入 Level 0.2：和进入其它层级一样，先弹一层过场提示，再真正切过去。
  // （先给当前 Level 0 拍一张快照，原路返回时用它还原）
  function enterSubLevel(door) {
    const g = game;
    if (g.phase !== "playing") return;
    g.savedLevel0 = {
      map: g.map,
      floor: g.floor,
      px: g.player.x, py: g.player.y,
      fog: g.fog, fogCtx: g.fogCtx, explored: g.explored,
      archives: g.archives,
      entities: g.entities,
    };
    AudioSys.door(true);
    startTransition("找到子层级", "正在进入 Level 0.2 —— 重塑的混乱 ...",
      { kind: "enter02" });
  }

  // 离开 Level 0.2：入口门 = 原路返回（同一张地图、同一个位置）；
  // 附近刷新的新门 = 去 Level 0 的随机区域。同样先弹过场提示。
  function leaveSubLevel(door) {
    const g = game;
    if (g.phase !== "playing") return;
    AudioSys.door(true);
    startTransition("已离开重塑的混乱", "正在返回 Level 0 —— 阈界 ...",
      { kind: door.kind === "entry02" ? "back02" : "exit02" });
  }

  // 统一的过场：显示弹窗 -> 等一小会儿 -> 执行真正的切换
  // ---------- 通关率统计 ----------
  // 进去过一次算 tries，活着走出去一次算 clears —— 两个数字都传到云端，
  // 右上角「排行榜」里按 clears / tries 显示百分比和真实数字。
  // 设置里关掉「上传数据至排行榜」之后就一条都不发（已发出的不清）。
  const rateTried = new Set();
  function rateTry(level) {
    const k = String(level == null ? "" : level);
    if (!k || rateTried.has(k)) return;
    rateTried.add(k);
    try { if (window.Cloud && Cloud.ratePut) Cloud.ratePut(k, false); } catch (e) { /* 忽略 */ }
  }
  function rateClear(level) {
    const k = String(level == null ? "" : level);
    if (!k) return;
    try { if (window.Cloud && Cloud.ratePut) Cloud.ratePut(k, true); } catch (e) { /* 忽略 */ }
  }

  // Level 0.1 / 289 的入口。这两个层级的出发层（0 / 13 / 19）走的是通用生成器，
  // 没有各自的文件可以挂物件，所以在这里按层级往地图上补一个入口。
  //   0.1 天顶站   <- Level 0 地面上的一处空洞
  //   289 过载     <- Level 13 一面黄色的墙 / Level 19 一扇被毁坏的门
  function injectLevelEntries(g) {
    const map = g.map;
    if (!map || !map.props) return;
    const lv = String(g.level);
    //   hole01         -> Level 0.1 天顶站（Level 0 地面上的一处空洞）
    //   wall289        -> Level 289 过载（Level 13 一面黄色的墙）
    //   brokendoor289  -> Level 289 过载（Level 19 一扇被毁坏的门）
    //   bluedoor20     -> Level 20 波瑞阿斯建筑（Level 2 / 21 写着「娱乐区」的蓝色门）
    //   cluben20       -> Level 20 波瑞阿斯建筑（Level 11 里名为「娱乐区」的建筑）
    const SPEC = {
      "0": [{ type: "hole01", to: "0.1", tip: "地毯上破开的一个洞 —— 底下透着金属的光" }],
      "13": [{ type: "wall289", to: 289, tip: "一面黄色的墙 —— 墙面上有个门把手" }],
      "19": [{ type: "brokendoor289", to: 289, tip: "一扇被毁坏的木门 —— 门框裂着" }],
      "2": [{ type: "bluedoor20", to: 20, tip: "一扇蓝色的门，门牌上写着「娱乐区」" }],
      //   hole22      -> Level 22 颓垣（Level 21 地板上的洞）
      //   mall33door  -> Level 33 无尽购物体验（Level 11 的购物中心）
      "21": [{ type: "bluedoor20", to: 20, tip: "一扇蓝色的门，门牌上写着「娱乐区」" },
             { type: "hole22", to: 22, tip: "地板上破了一个洞 —— 底下黑得看不见底，有风从下面灌上来" }],
      "11": [{ type: "cluben20", to: 20, tip: "一栋门口挂着「娱乐区」招牌的建筑" },
             { type: "mall33door", to: 33, tip: "一座购物中心 —— 玻璃门里还亮着灯，货架看上去是空的" },
             { type: "bush11to63", to: 63, tip: "一片灌木丛 —— 钻过去，脚下一空" },
             { type: "metro11to903", to: 903, tip: "一处地铁站入口 —— 下面亮着细长的荧光灯" },
             { type: "grate11to34", to: 34, tip: "人行道上一道下水道栅 —— 底下黑得看不见底" }],
      // 1.3.3 批次入口：Level 4 里门前堆着沙子的那扇门 -> Level 75 阈限
      "4": [{ type: "sanddoor4to75", to: 75, tip: "一扇门前堆着黄沙的门 —— 沙是从门缝里慢慢漏出来的" }],
      // 1.3.2 批次入口
      "1": [{ type: "firedoor1to834", to: 834, tip: "一扇金属防火门 —— 单向的，进来就回不去了" }],
      "37": [{ type: "hollow37to23", to: 23, tip: "一棵空心巨树，比周围的大得多，树皮是显眼的绿色" },
             { type: "mess37to38", to: 38, tip: "一处混乱的地方 —— 好几层级的片段叠在了一起" },
             { type: "tunnel37to43", to: 43, tip: "一条阴暗的隧道，尽头隐约有水声" }],
      "39": [{ type: "forest39to32", to: 32, tip: "森林里忽然变成永夜的一小片 —— 树上挂着骷髅" }],
      // 1.3.1 批次入口
      "5": [{ type: "casino51door", to: "5.1", tip: "一扇拉斯维加斯式的赌场大门，正面「TH」两个巨大的红字" }],
      "797": [{ type: "grotto797to39", to: 39, tip: "岩壁上的洞 —— 洞口透出黄昏的橙色" },
              { type: "oakdoor797to63", to: 63, tip: "一面自然形成的墙上，忽然出现了一扇旧橡木门" },
              { type: "grotto797to10", to: 10, tip: "岩石上一处石窟，风从里面往外吹" }],
    };
    const specs = (SPEC[lv] || []).slice();
    if (lv === "21") specs.push({ type: "rustdoor21to46", to: 46, tip: "一扇生锈的门，门缝里灌进来滚烫的沙" });
    // Level 19：破损或被毁坏的门有极小概率通往 Level 20（档案原文如此）
    if (lv === "19" && Math.random() < 0.25) {
      specs.push({ type: "brokendoor20", to: 20, tip: "一扇几乎散架的门 —— 门后透着霓虹的颜色" });
    }
    if (!specs.length) return;
    const fl = (map.floors && map.floors[0]) ? map.floors[0] : null;
    if (!fl || !fl.length) return;
    const px = (map.start ? map.start.x : 0), py = (map.start ? map.start.y : 0);
    for (const sp of specs) {
      for (const p of map.props) if (p.type === sp.type) continue;   // 已经有了就别重复加
      if (map.props.some((p) => p.type === sp.type)) continue;
      // 挑一处离出生点 12~30 格的地板：太近了一进门就撞上，太远了根本找不到。
      // 还要避开本层那些「专属 nearNew 判定」—— 它们排在通用门之前，
      // 新门只要落在旁边，按 E 就会被抢走（Level 37 的泳池梯子就吃过这个亏）。
      const RESERVED = ["poolladder37", "stairs37", "whitelight", "redtunnel", "pool4",
        "arcade25", "existDoor", "door363", "pc601", "exitDoor", "jet29"];
      const reserved = (map.props || []).filter((o) => RESERVED.indexOf(o.type) >= 0 && typeof o.x === "number");
      const inRange = (f) => { const d = Math.hypot(f.x - px, f.y - py); return d > 12 && d < 30; };
      let cand = fl.filter((f) => inRange(f) && !reserved.some((o) => Math.hypot(f.x - o.x, f.y - o.y) < 5));
      if (!cand.length) cand = fl.filter(inRange);
      if (!cand.length) cand = fl;
      const spot = cand[randInt(0, cand.length - 1)];
      map.props.push({ x: spot.x, y: spot.y, floor: 0, type: sp.type, toLevel: sp.to, tip: sp.tip });
    }
  }

  function startTransition(title, sub, pending) {
    const g = game;
    // 切走之前先记一笔：这一层被通关了（前提是真的去了别的层）
    if (pending && pending.kind && pending.kind !== "elsewhere21" && g.phase === "playing") {
      const to = (pending.level != null ? pending.level
        : (pending.target != null ? pending.target : null));
      if (to == null || String(to) !== String(g.level)) rateClear(g.level);
    }
    g.phase = "transition";
    g.transTimer = 0;
    g.pendingTrans = pending || null;
    hide(el.pickupHint);
    hide(el.doorHint);
    hide(el.btnDoor);
    if (el.btnE) el.btnE.classList.remove("ready");
      if (el.btnAct) { el.btnAct.classList.remove("ready"); hide(el.btnAct); }
    el.levelupTitle.textContent = title;
    el.levelupSub.textContent = sub;
    show(el.levelup);
  }

  // 过场结束后真正执行切换
  function applyPendingTrans(pt) {
    const g = game;
    // B.N.T.G 浆果的诅咒：吃过第二颗之后，任何切出的办法都会失效，一律被拉回 Level 10。
    if (g && g.berryTrap) {
      if (!pt || pt.kind === "toLevelX" || pt.kind === "toLevel") {
        const tgt = pt ? (pt.kind === "toLevel" ? pt.target : pt.level) : null;
        if (String(tgt) !== "10") pt = { kind: "toLevelX", level: 10 };
      }
    }
    if (!pt) {                                  // 普通层级推进
      // 只有编号层级才能"往后推一层"。枢纽这类没有编号的层级
      // 走到出口不应该莫名其妙跳到别处（枢纽没有编号，不能 +1）。
      const n = Number(g.level);
      if (!Number.isFinite(n)) { newLevel(); return; }
      g.level = n >= 2 ? 0 : n + 1;
      newLevel();
      return;
    }
    if (pt.kind === "toLevelX") {                // 通用：跳到指定层级
      g.level = pt.level;
      if (pt.level === 5) markUnlock("reach5");
      if (pt.level === 7) markUnlock("reach7");
      if (pt.level === 8) markUnlock("reach8");
      newLevel();
      maybeDeliverHermes(g);                     // 订购的包裹：送到这一层的入口处
      const def = levelDef(pt.level);
      flashLevelToast(def.label, def.name);
      if (String(pt.level) === "traproof") {
        setTimeout(() => toast("能站人的只有那些网格线 —— 网眼底下什么都没有"), 900);
      } else if (String(pt.level) === "redrooms") {
        setTimeout(() => toast("红室 —— 这里没有出口"), 900);
      }
      return;
    }
    if (pt.kind === "toLevel") {                 // 通用：切到指定层级（Level 21 的编号门）
      g.level = pt.target;
      newLevel();
      maybeDeliverHermes(g);
      const def2 = levelDef(pt.target);
      flashLevelToast(def2.label, def2.name);
      return;
    }
    if (pt.kind === "elsewhere21") {             // Level 21 里"通往别处"的门：换到走廊另一段
      newLevel({ randomSpawn: true });
      return;
    }
    if (pt.kind === "toHub") {                   // 进入隐秘层级 · 枢纽
      g.savedBeforeHub = {
        level: g.level, floor: g.floor,
        px: g.player.x, py: g.player.y,
      };
      g.level = "hub";
      newLevel();
      flashLevelToast("枢纽", "十字路口 —— 想清楚你要去哪一层");
      return;
    }
    if (pt.kind === "toLevel3") {                // Level 2 -> Level 3
      g.level = 3;
      markUnlock("reach3");                      // 抵达发电站 -> 解锁检修服
      newLevel();
      flashLevelToast("Level 3 · 发电站", "黑暗、轰鸣、还有别的东西在走廊里");
      return;
    }
    if (pt.kind === "toLevel1") {                // 前往 Level 1（上层 / 下层）
      g.level = 1;
      markUnlock("clear0");                      // 通关 Level 0 -> 解锁生化防护服
      newLevel({ floor: pt.floor });
      flashLevelToast("Level 1 · " + (pt.floor === 1 ? "下层" : "上层"),
        pt.floor === 1 ? "你从闪烁的墙壁穿了过来" : "你从白色铁门走了进来");
      return;
    }
    if (pt.kind === "enter02") {                // 进入 Level 0.2
      g.level = 0.2;
      newLevel();
      flashLevelToast("Level 0.2 · 重塑的混乱", "层级正在坍塌 —— 找到门离开");
      return;
    }
    // 离开 Level 0.2：back02 = 原路返回；exit02 = Level 0 随机区域
    const snap = g.savedLevel0;
    if (pt.kind === "back02" && snap) {
      g.level = 0;
      g.map = snap.map;
      g.floor = snap.floor;
      g.fog = snap.fog;
      g.fogCtx = snap.fogCtx;
      g.explored = snap.explored;
      g.archives = snap.archives;
      g.entities = snap.entities;
      g.player.x = snap.px;
      g.player.y = snap.py;
      g.player.floor = snap.floor;
      g.nearArchive = null;
      g.nearDoor = null;
      g.spawnTimer = rand(4, 8);
      g.phase = "playing";
      if (el.objective) el.objective.textContent = levelDef(0).objective;
      updateHud();
      flashLevelToast("回到了 Level 0", "你从进来的那扇门回到了原地");
    } else {
      g.level = 0;
      newLevel({ randomSpawn: true });
      flashLevelToast("回到了 Level 0", "门把你放在了一个陌生的区域");
    }
    g.savedLevel0 = null;
  }

  let levelToastTimer = null;
  function flashLevelToast(title, sub) {
    if (!el.flashToast) return;
    el.flashToast.innerHTML = "<b>" + title + "</b><br>" + sub;
    show(el.flashToast);
    clearTimeout(levelToastTimer);
    levelToastTimer = setTimeout(() => hide(el.flashToast), 3200);
  }

  // ---------- Level 0.2：坍塌（环境危害） ----------
  function updateCollapse(g, dt) {
    // 离入口门太远 -> 附近出现一扇新的出口门
    const entry = g.map.entryDoor;
    if (entry && !g.map.newDoorSpawned) {
      const dist = Math.hypot((entry.x + 0.5) * TILE - g.player.x, (entry.y + 0.5) * TILE - g.player.y) / TILE;
      if (dist > CONFIG.DOOR_EXIT_DIST) {
        spawnExitDoorNear(g);
        g.map.newDoorSpawned = true;
      }
    }
    // 坍塌事件
    g.collapseTimer -= dt;
    if (g.collapseTimer <= 0) {
      g.collapseLeft = CONFIG.COLLAPSE_DUR;
      g.collapseTimer = rand(CONFIG.COLLAPSE_MIN, CONFIG.COLLAPSE_MAX);
      AudioSys.collapse();
      spawnDebris(g, 16);
      // 每一次坍塌都会削掉一截理智（Level 0.2 的环境危害）
      if (!(g.wretch && g.wretch.done)) {
        g.sanity = clamp(g.sanity - CONFIG.SANITY_COLLAPSE_HIT, 0, CONFIG.SANITY_MAX);
        toast("天花板塌了一块 —— 理智 -" + CONFIG.SANITY_COLLAPSE_HIT);
      }
    }
    if (g.collapseLeft > 0) g.collapseLeft -= dt;
    // 掉落的碎块
    for (const q of g.debris) {
      q.life -= dt;
      q.x += q.vx * dt;
      q.y += q.vy * dt;
      q.vy += 240 * dt;
    }
    if (g.debris.length) g.debris = g.debris.filter(q => q.life > 0);
  }

  function spawnDebris(g, n) {
    for (let i = 0; i < n; i++) {
      g.debris.push({
        x: g.player.x + rand(-300, 300),
        y: g.player.y - rand(40, 320),
        vx: rand(-25, 25),
        vy: rand(70, 210),
        life: rand(1.0, 2.2),
        size: rand(2, 7),
      });
    }
  }

  // 离入口门太远时在附近"长"出一扇新出口门。
  // 必须装在**墙线上的开口**（和别的门一样贴着墙），不能随便挑一块地板 ——
  // 否则会出现一扇孤零零立在房间中间的门，看着毫无意义。
  function spawnExitDoorNear(g) {
    const map = g.map, size = map.size;
    const grid = layerGrid(map, g.floor);
    const px = g.player.x / TILE, py = g.player.y / TILE;
    const isWall = (x, y) => (x < 0 || y < 0 || x >= size || y >= size) || grid[y][x] === 1;
    const isFloor = (x, y) => !(x < 0 || y < 0 || x >= size || y >= size) && grid[y][x] === 0;
    const used = (x, y) => map.doorTiles && map.doorTiles.has(g.floor + ":" + x + "," + y);
    const okSpot = (x, y, dir) => {
      if (!isFloor(x, y) || used(x, y)) return false;
      // 贴墙：垂直穿越方向的两侧是墙；穿过方向两侧都能走
      const choke = dir === "h" ? (isWall(x - 1, y) && isWall(x + 1, y))
                                : (isWall(x, y - 1) && isWall(x, y + 1));
      const through = dir === "h" ? (isFloor(x, y - 1) && isFloor(x, y + 1))
                                  : (isFloor(x - 1, y) && isFloor(x + 1, y));
      return choke && through;
    };
    // 先找真正的门洞
    for (let i = 0; i < 600; i++) {
      const t = floorList(map, g.floor)[randInt(0, floorList(map, g.floor).length - 1)];
      if (!t) break;
      const d = Math.hypot(t.x - px, t.y - py);
      if (d <= 3.5 || d >= 11) continue;
      for (const dir of ["h", "v"]) {
        if (!okSpot(t.x, t.y, dir)) continue;
        const dr = addDoor(map, [{ x: t.x, y: t.y, dir }], g.floor, "exit02", { dir, newSpawn: true });
        if (dr) { AudioSys.growl(); return true; }
      }
    }
    // 退而求其次：至少让门板靠着一面墙，不要孤零零立在地板中央
    for (let i = 0; i < 600; i++) {
      const t = floorList(map, g.floor)[randInt(0, floorList(map, g.floor).length - 1)];
      if (!t) break;
      const d = Math.hypot(t.x - px, t.y - py);
      if (d <= 3.5 || d >= 11) continue;
      if (!isFloor(t.x, t.y) || used(t.x, t.y)) continue;
      const dir = isWall(t.x - 1, t.y) || isWall(t.x + 1, t.y) ? "v" : "h";
      const lean = dir === "v" ? (isWall(t.x - 1, t.y) || isWall(t.x + 1, t.y))
                               : (isWall(t.x, t.y - 1) || isWall(t.x, t.y + 1));
      if (!lean) continue;
      const dr = addDoor(map, [{ x: t.x, y: t.y, dir }], g.floor, "exit02", { dir, newSpawn: true });
      if (dr) { AudioSys.growl(); return true; }
    }
    return false;
  }

  // 摇杆向量（未推动返回 null）：dx/dy 为方向单位向量，mag 为推量 0~1
  function stickVec() {
    if (!stick.active || stick.mag < 0.16) return null;
    return { x: stick.dx, y: stick.dy, mag: stick.mag };
  }

  function updatePlayer(g, dt) {
    const p = g.player;
    // 不在 Level 7 了：海上那段里程作废（别带到别的层级去）
    if (!isLevel(g, 7) && (g.jet29ride || g.jet29dist)) {
      g.jet29ride = false; g.jet29dist = 0; g.jet29hint = 0;
    }
    let vx = 0, vy = 0;
    let wantSprint = false;
    let sv = null;
    if (g.aiOn && g.ai) {
      // AI 接管：键盘与摇杆都不再生效
      vx = g.ai.vx || 0;
      vy = g.ai.vy || 0;
      wantSprint = !!g.ai.sprint;
    } else {
      if (kHeld("left")) vx -= 1;
      if (kHeld("right")) vx += 1;
      if (kHeld("up")) vy -= 1;
      if (kHeld("down")) vy += 1;
      sv = stickVec();
      if (sv) { vx = sv.x; vy = sv.y; } // 触屏摇杆优先（键盘未按时）
      wantSprint = kHeld("sprint") || !!sprintHeld || !!(sv && sv.mag >= SPRINT_MAG);
    }
    // 联机等待房主：这段时间人不许动（键盘、摇杆、AI 都不算）
    if (g.freezeLeft > 0) {
      // 房主中途进来了（收到他的位置广播）—— 不用再干等，立刻解冻
      try {
        const hp = (window.__hostPos && window.__hostPos());
        if (hp && typeof hp.x === "number") g.freezeLeft = 0;
      } catch (e) { /* 忽略 */ }
    }
    if (g.freezeLeft > 0) {
      g.freezeLeft = Math.max(0, g.freezeLeft - dt);
      vx = 0; vy = 0; sv = null; wantSprint = false;
      try { waitBar(g.freezeLeft); } catch (e) { /* 忽略 */ }
      if (g.freezeLeft === 0) {
        try { waitBar(0); } catch (e) { /* 忽略 */ }
        try { if (typeof toast === "function") toast("可以走了 —— 房主还没进来的话，你自己先逛着"); } catch (e) { /* 忽略 */ }
      }
    }
    // Level ! 开场：2 秒不能动（红灯未亮、警报未响），2 秒后一起启动
    if (String(g.level) === "bang" && g.bangFreeze > 0) {
      g.bangFreeze = Math.max(0, g.bangFreeze - dt);
      vx = 0; vy = 0; sv = null; wantSprint = false;
      if (g.bangFreeze === 0) {
        g.bangAlarm = true;
        try { AudioSys.bangAlarm(true); } catch (e) { /* 忽略 */ }
        try { if (typeof toast === "function") toast("红灯亮起，警报炸响 —— 跑！"); } catch (e) { /* 忽略 */ }
      }
    }
    const poisoned = g.badStacks && g.badStacks.length > 0;
    // 受污染的杏仁水下肚：没法疾跑，人也慢下来（叠加越多越慢）
    wantSprint = wantSprint && !poisoned;
    // Level 78 空间站：没有重力 —— 蹬一下就一直往前飘，松开手也停不下来，
    // 只有撞上舱壁才停。走位全靠"提前减速"。
    let drift78 = null;
    if (String(g.level) === "78") {
      const DACC = 640, DMAX = 240;
      if (typeof g.driftX !== "number") g.driftX = 0;
      if (typeof g.driftY !== "number") g.driftY = 0;
      const push78 = (vx !== 0 || vy !== 0);
      if (push78) {
        const l78 = Math.hypot(vx, vy) || 1;
        g.driftX += (vx / l78) * DACC * dt;
        g.driftY += (vy / l78) * DACC * dt;
      }
      // 真空里没有东西让你停下来 —— 阻尼非常轻
      const damp78 = Math.pow(push78 ? 0.55 : 0.88, dt);
      g.driftX *= damp78; g.driftY *= damp78;
      const dm78 = Math.hypot(g.driftX, g.driftY);
      if (dm78 > DMAX) { g.driftX = g.driftX / dm78 * DMAX; g.driftY = g.driftY / dm78 * DMAX; }
      drift78 = { x: g.driftX, y: g.driftY, mag: Math.hypot(g.driftX, g.driftY) };
    }
    p.moving = drift78 ? (drift78.mag > 8) : (vx !== 0 || vy !== 0);
    // 体力耗尽后进入 2 秒「真空期」：这两秒里跑不起来，但肾上腺素可以强行打破它。
    if (g.staminaLock > 0) g.staminaLock = Math.max(0, g.staminaLock - dt);
    if (g.adrenaline > 0) g.staminaLock = 0;          // 肾上腺素除外
    if (g.adrenalineAfter > 0) g.adrenalineAfter = Math.max(0, g.adrenalineAfter - dt);
    // 肾上腺素期间即使体力见底也还能硬撑着跑（恐惧让人忘了累），
    // 但体力照掉 —— 不是无限续航，见底后要等肾上腺素过去才回得上来。
    p.sprinting = !!wantSprint && p.moving && (p.stamina > 0 || g.adrenaline > 0) && !(g.staminaLock > 0);
    // 坍塌期间行动迟缓（Level 0.2 的环境危害）
    let slow = (g.collapseLeft > 0 ? 0.55 : 1) * badSlowMul(g);
    // 在水里游得慢 —— 以前只判了 Level 7 的深海，其余层级的水只是"看着是水"
    const water = (isLevel(g, 7) && inWater(g)) || inAnyWater(g);
    if (water) slow *= CONFIG.DIVE_SWIM_MUL;
    // Level 7：海面 —— 踩上去不会沉，但两条腿像灌了铅，一步一挪
    // 骑上水上摩托就快多了（自己游过去也行，只是慢）
    if (isLevel(g, 7) && inSeaSurf(g)) slow *= (g.jet29ride ? CONFIG.JET_RIDE_MUL : CONFIG.SEA_SURF_MUL);
    else if (isLevel(g, 7) && inRoomWater(g)) slow *= CONFIG.ROOM_WATER_MUL;
    // 沉在水底比浮在水面更慢（腿使不上劲）
    if (water && (g.sink || 0) >= 0.999) slow *= 0.72;
    if (isLevel(g, 10) && inBush(g)) slow *= CONFIG.BUSH_SLOW_MUL;  // 挤过草丛
    // 花园段 / 砼苑：被藤蔓缠住就越走越慢（越慢越难挣脱，所以别停）
    if (g.vine > VINE_GRIP) slow *= Math.max(0.22, 1 - (g.vine - VINE_GRIP) * 1.7);
    // 花园段 / 砼苑：藤蔓缠上来，越缠越走不动
    if (String(g.level) === "994" && g.tideFade > 0) slow *= Math.max(0.12, 1 - g.tideFade * 0.88);
    // Level 0 四片大区域：拱门区地毯增厚（疲惫时更拖脚）、熄灯区低洼积水更难走。
    // 柱厅绒毛浅、地面干燥，不额外减速。
    if (String(g.level) === "0" && g.map && g.map.l0zones) {
      const zk0 = l0ZoneAt(g);
      if (zk0 === "arch") {
        // 地毯增厚：越疲惫越拖脚（绒毛里吸的水也让脚下发沉），但不换地板
        const st = Math.max(0, Math.min(1, (p.stamina || 0) / (CONFIG.STAMINA_MAX || 100)));
        slow *= 0.68 + 0.20 * st;
      } else if (zk0 === "blackout") {
        slow *= g.flashlight ? 0.9 : 0.8;
        const tkSl = Math.floor(p.x / TILE) + "," + Math.floor(p.y / TILE);
        if (g.map.l0zones.puddles.has(tkSl)) slow *= 0.86;
      }
    }
    // Level 0.5：浸濡通道的齐膝脏水 —— 一步一步劈开水面，比平地明显慢。
    // 不用 map.water（那会触发深海的沉浮 / 溺水机制，这里只是水漫到膝盖）。
    if (String(g.level) === "0.5" && g.map && g.map.a05water) {
      const wk = Math.floor(p.x / TILE) + "," + Math.floor(p.y / TILE);
      if (g.map.a05water.has(wk)) slow *= 0.68;
    }
    // Level 8：不稳定的重力（方向说变就变）
    if (isLevel(g, 8) && g.gravityFlip > 0) { vx = -vx; vy = -vy; }
    const speed = (p.sprinting ? CONFIG.PLAYER_SPRINT : CONFIG.PLAYER_SPEED) * slow;
    // 肾上腺素：实体在近处追你时触发 —— 瞬间回一截体力，并大幅减缓体力消耗
    updateAdrenaline(g, dt);
    // Level !「为生命而奔跑」：笑魇的速度被调成和疾跑一模一样（340），
    // 而体力只够全速跑 2.6 秒（100 / 38）—— 一旦力竭就只能走路（215），
    // 数学上必然被追上，这一层因此变成必死。
    // 解法贴着这一层的主题来：恐惧让人忘了累 —— 在这一层疾跑不耗体力，
    // 玩家可以一路冲到 EXIT；但只要犹豫、停下、或被病床挡住，就会被追上。
    const bangRush = (String(g.level) === "bang" && g.bangFreeze <= 0);
    if (p.sprinting) {
      let drain = CONFIG.STAMINA_DRAIN * (g.adrenaline > 0 ? CONFIG.ADRENALINE_DRAIN_MUL : 1);
      if (bangRush) drain *= 0.06;   // 几乎不掉，但仍留一丝衰减做反馈
      // 只有「肾上腺素结束后的 15 秒」才是边跑边恢复。
      // 以前把肾上腺素本身也算进 boost，结果那一整段体力不掉反涨，
      // 有实体追着就永远耗不完 —— 这里改回按 0.4 倍正常扣，跑久了照样见底。
      const afterBoost = g.adrenaline <= 0 && g.adrenalineAfter > 0 && !bangRush;
      if (afterBoost) p.stamina = Math.min(CONFIG.STAMINA_MAX, p.stamina + CONFIG.STAMINA_REGEN * 0.25 * dt);
      else {
        p.stamina = Math.max(0, p.stamina - drain * dt);
        // 肾上腺素能打破两秒真空期（档案设定），所以这里不锁；
        // 等它过去、体力还是 0，才正常进入真空期。
        if (p.stamina <= 0 && g.adrenaline <= 0 && g.staminaLock <= 0) {
          g.staminaLock = 2;
          toast("体力耗尽 —— 缓两秒才能再跑");
        }
      }
    } else if (bangRush) {
      // 停下也不会回满 —— 停下来就该被追上
      p.stamina = Math.min(CONFIG.STAMINA_MAX, p.stamina + CONFIG.STAMINA_REGEN * 0.25 * dt);
    } else {
      // 肾上腺素期间不回体力 —— 否则每帧的恢复会把下面的消耗整个抵消，条纹丝不动。
      if (g.adrenaline <= 0) {
        p.stamina = Math.min(CONFIG.STAMINA_MAX, p.stamina + CONFIG.STAMINA_REGEN * dt);
      }
    }
    // 肾上腺素不是"无限续航"：这段时间里逃命本身就在耗体力，哪怕没按冲刺，
    // 体力条也会持续往下走；跑起来掉得更快。条不会再纹丝不动。
    if (g.adrenaline > 0 && !bangRush) {
      p.stamina = Math.max(0, p.stamina - CONFIG.STAMINA_DRAIN * 0.22 * dt);
    }
    if (p.moving) {
      const len = Math.hypot(vx, vy);
      vx /= len; vy /= len;
      p.faceX = vx; p.faceY = vy; // 手电筒朝向跟随移动方向
      let throttle = sv ? clamp(sv.mag * 1.2, 0.4, 1) : 1; // 轻推慢走、推满全速
      let useSpeed = speed;
      if (drift78) { throttle = 1; useSpeed = Math.min(drift78.mag, 240); }
      const ox = p.x, oy = p.y;
      // 沉在水里时爬不上岸 —— 走到池边也没用，得先按空格 / 点「上浮」浮回水面。
      // 以前这里判的是 sink>=0.999（完全沉没），于是只要浮过一次、sink 从 1 往下掉的
      // 那 2.4 秒里，人明明还浸在水里却能直接走上岸 —— 之后再沉到底也一样能走。
      // 现在统一用"水面线"：只要还没浮出水面（sink >= 水面线），就别想爬上岸。
      const wasUnder = (g.sink || 0) >= SURFACE_AT;
      moveWithCollision(p, p.x + vx, p.y + vy, useSpeed * throttle, dt, g.map, g.floor);
      // Level 78：撞上舱壁才停 —— 没撞到就继续飘过去
      if (drift78) {
        const moved78 = Math.hypot(p.x - ox, p.y - oy);
        if (moved78 < useSpeed * dt * 0.45) {
          g.driftX = (g.driftX || 0) * 0.12;
          g.driftY = (g.driftY || 0) * 0.12;
        }
      }
      if (wasUnder && !waterTileAt(g)) { p.x = ox; p.y = oy; }
      const stepPx = Math.hypot(p.x - ox, p.y - oy);
      p.stepDist += stepPx;
      // ---- Level 7 · 水上摩托：在海上「朝北」走满 500 格，北面才浮出一块陆地 ----
      // 只算真正往北推进的那一段（往南退会退回去），骑摩托也行、自己游/走也行。
      // 走满不是直接传送 —— 是前面海平线上多出一块陆地，走上那块陆地才到 Level 29。
      if (isLevel(g, 7) && inSeaSurf(g)) {
        const m7 = g.map;
        const tyNow = p.y / TILE;
        // 基准记在地图上（每次进层地图都是新的），免得上一趟的坐标串味
        if (!m7 || m7._jbaseY == null) { if (m7) m7._jbaseY = tyNow; }
        g.jet29dist = Math.max(0, (m7 ? m7._jbaseY : tyNow) - tyNow);
        if (g.jet29dist >= JET29_NEED) {
          if (!m7.land29) spawnLand29(g);
        } else {
          const stage = Math.floor(g.jet29dist / 100);
          if (stage > (g.jet29hint | 0) && stage >= 1 && stage <= 4) {
            g.jet29hint = stage;
            const jm = [
              "码头的灯落在身后 —— 海面开始晃。（向北 " + Math.round(g.jet29dist) + " / " + JET29_NEED + " 格）",
              "天边泛起一点粉。（向北 " + Math.round(g.jet29dist) + " / " + JET29_NEED + " 格）",
              "粉红色漫开了 —— 阳光像是永远停在水面上。（向北 " + Math.round(g.jet29dist) + " / " + JET29_NEED + " 格）",
              "再往北一点就是了。（向北 " + Math.round(g.jet29dist) + " / " + JET29_NEED + " 格）"
            ];
            toast(jm[stage - 1]);
          }
        }
      }
    }
    // 踏上北面那块陆地 —— 这才是到 Level 29 的那一步（放在移动分支外面，
    // 免得"人已经在陆地上了但这一帧没按键"就判不出来）
    if (isLevel(g, 7) && g.map && g.map.land29 && g.phase === "playing") {
      const lk = Math.floor(g.player.x / TILE) + "," + Math.floor(g.player.y / TILE);
      if (g.map.land29.has(lk)) {
        g.jet29ride = false; g.jet29dist = 0; g.jet29hint = 0;
        AudioSys.exitChime();
        goToLevel(g, 29, "天变成了淡淡的粉红色",
          "你一路向北，走了五百格 —— 汪洋被永恒地浸在阳光里，前面海平线上浮出一块陆地。" +
          "脚一踩上暖沙，船坞的木桩就在眼前，有人正朝你招手。这是 Level 29 ...");
        return;
      }
    }
    // Level 45 深渊公司：每栋楼都会创建自己的重力场，方向和大楼的朝向有关 ——
    // 站在这栋楼里不动，也会被慢慢推着走；一旦走到防火梯上就一点推力都没有了，
    // 那已经出了重力场（楼外的东西都是无重力漂着的）。
    if (String(g.level) === "45" && g.map && g.map.b45idx && g.phase === "playing") {
      if (!g.b45intro) {
        g.b45intro = true;
        try { toast("三十三栋楼漂在虚空里 —— 楼与楼之间只有防火梯。"); } catch (e) { /* 忽略 */ }
      }
      const txg = Math.floor(p.x / TILE), tyg = Math.floor(p.y / TILE);
      const big = g.map.b45idx.get(txg + "," + tyg);
      const bg = (big != null && big >= 0 && g.map.b45buildings) ? g.map.b45buildings[big] : null;
      if (bg && (bg.gx || bg.gy)) {
        moveWithCollision(p, p.x + bg.gx, p.y + bg.gy, 18, dt, g.map, g.floor);
        if (!g.b45gravShown) {
          g.b45gravShown = true;
          try { toast("这栋楼的重力场有自己的方向 —— 站着不动，你也会被慢慢推向一边。"); } catch (e) { /* 忽略 */ }
        }
      }
    }
    if (touchMode && el.stickBase) {
      el.stickBase.classList.toggle("sprint", p.sprinting);
    }
    // Level 0.4 深坑区：整个人踏进空洞里才会掉下去（脚尖沾到一点不算）
    if (String(g.level) === "traproof" && !g.trapFalling) {
      const fn = (typeof trapRoomFalling === "function") ? trapRoomFalling : (window.trapRoomFalling);
      if (fn && fn(g)) {
        g.trapFalling = true;
        try { AudioSys.exitChime(); } catch (e) { /* 忽略 */ }
        goToLevel(g, "redrooms", "脚下一空",
          "网格线从指间滑走 —— 你一直往下掉，落到一片腥红的地毯上 ...");
      }
    }
  }

  // 玩家脚下地面材质（决定脚步声）：Level 0 地毯 / Level 1 混凝土 / Level 2+ 金属格栅
  // 渐变走廊里越接近尽头越像金属
  function stepMaterial(map, x, y) {
    if (map.bush && map.bush.has(Math.floor(x / TILE) + "," + Math.floor(y / TILE))) return "bush";
    const tx = Math.floor(x / TILE), ty = Math.floor(y / TILE);
    if (tx < 0 || ty < 0 || tx >= map.size || ty >= map.size) return "concrete";
    const transit = map.transit;
    if (transit && transit[ty] && transit[ty][tx] >= 0) {
      return transit[ty][tx] > 0.6 ? "metal" : "concrete";
    }
    const st = levelDef(map.level).style;
    const k2 = tx + "," + ty;
    // Level 5：三种地面交替 —— 黑胡桃木地板 / 白色大理石 / 红金地毯
    if (st === "hotel") {
      const m = (tx * 7 + ty * 13) % 3;
      return m === 0 ? "wood" : m === 1 ? "marble" : "carpet";
    }
    // Level 10：麦田 / 泥土小径 / 湖水 / 室内的木地板
    if (st === "field") {
      if (map.lakes && map.lakes.has(k2)) return "water";
      if (map.trail && map.trail.has(k2)) return "dirt";
      if (map.buildings && buildingAt(map, tx, ty)) return "wood";
      return "grass";
    }
    // Level 11：沥青马路 / 混凝土人行道 / 室内地毯
    if (st === "city") {
      if (map.hospital && map.hospital.has(k2)) return "tile";
      if (map.indoors && map.indoors.has(k2)) return "carpet";
      if (map.road && map.road.has(k2)) return "asphalt";
      return "concrete";
    }
    // Level 0 / 0.2：潮湿的地毯 —— 以前漏了这一档，掉到兜底变成了别的材质
    // 沙滩（Level 994）：沙子的沙沙声，不是泥地
    if (st === "beach") return "sand";
    // 池房（Level 37 / 37.1）：白瓷砖。以前掉到兜底成了铁板声，听着像 Level 2
    if (st === "pool" || st === "poolred") return "tile";
    if (st === "wallpaper" || st === "collapsing") return "carpet";
    if (st === "office") return "carpet";
    if (st === "power" || st === "cave") return "concrete";
    // Level 9：郊区 —— 潮湿的沥青街道 / 屋里的木地板
    if (st === "suburb") {
      // 屋里有木地板；houses 是数组，wallStyle 才是按格索引的 Map
      if (map.wallStyle && map.wallStyle.has(k2)) return "wood";
      return "asphalt";
    }
    // Level 13：走廊铺着油毯，房间里是木地板
    if (st === "apartment") return map.indoors && map.indoors.has(k2) ? "wood" : "carpet";
    // Level 18：教室里是软软的彩色地垫
    // Level 21：白色瓷砖地面 —— 硬、脆、带一点回响，不是铁板
    if (st === "numbered") return "tile";
    // Level Fun：硬地，同样是瓷砖质感
    if (st === "party") return "tile";
    if (st === "daycare") return "mat";
    // Level 19：阁楼的旧木地板 —— 干、脆、带吱呀，和 Level 5 的黑胡桃木不一样
    if (st === "attic") return "oldwood";
    if (st === "paradise") return "grass";               // Level 14：森林
    if (st === "future") return "concrete";              // Level 15：白色混凝土
    // Level 70：雪 / 冰面 / 室内木地板
    if (st === "frost") {
      if (map.river && map.river.has(k2)) return "water";
      if (map.indoor && map.indoor.has(k2)) return "wood";
      return "snow";
    }
    if (st === "iceroom") return "icesand";              // Level 0.3：踩在冰沙上，沙沙的
    if (st === "hub") return "asphalt";                  // 枢纽：沥青地面
    if (st === "dark") return "concrete";                // Level 6：熄灯
    if (st === "ocean") return map.indoors && map.indoors.has(k2) ? "wood" : "water";
    if (st === "beverly") return "wood";                 // 贝弗莉室：木地板
    if (st === "boiler") return "metal";                 // 锅炉房：金属板
    if (st === "pipe") return "metal";                   // 管道梦魇：金属格栅（确实是铁）
    // --- 新增层级 ---
    // --- 1.2.0 批次：每个新层级都显式指定，不再掉到兜底变成 Level 2 的铁板声 ---
    if (st === "foodcourt") return "tile";                                        // 6.1 零食室：商场地砖
    if (st === "deadlake") return map.water && map.water.has(k2) ? "water" : "dirt"; // 10.1 尸湖
    if (st === "corridor11") return "tile";                                       // 1.1 腐败的走廊：蓝色瓷砖
    if (st === "lockdown") return "tile";                                         // 2.1 锁闭：灰白旧瓷砖
    // 1.2 砼苑 / Level 1 花园段：地面早已全是植被，踩上去是草
    if (st === "concretegarden") return "grass";
    if (st === "matrix") return "tile";                                           // 12 矩阵：白色油漆地面
    if (st === "carrier") return map.water && map.water.has(k2) ? "water" : "metal"; // 17 航母：钢板 / 淹水走廊
    if (st === "trench" || st === "trenchpsi") return "dirt";                     // 49 / 49.1：潮湿泥土
    if (st === "voidbase") return "gravel";                                       // 71 地下虚空：砂砾
    if (st === "hospital") return "tile";                                         // 109 霓虹医院
    if (st === "waterpark") return map.water && map.water.has(k2) ? "water" : "tile"; // 119 水上乐园
    if (st === "glitchhall") return "tile";                                       // 287 故障大厅
    if (st === "whitehouse") return "tile";                                       // 484 茫白景象
    if (st === "blacksky") return "oldwood";                                      // 485 蒙黑天空：脆弱旧木地板
    if (st === "trapnet") return "carpet";                                        // 深坑区：Level 0 的一部分，脚下就是那张潮湿地毯
    if (st === "redroom") return "carpet";                                        // 红室：粗制黏脚的红地毯
    if (st === "sinland") return map.grass && map.grass.has(k2) ? "grass" : "dirt"; // 486 罪恶之地
    if (st === "template") return "wood";                                         // 512 模版：住宅木地板
    if (st === "hell") return "concrete";                                         // 666 地狱：洞窟岩面
    if (st === "snowtown") return "snow";                                         // 790 在劫难逃：积雪街道
    if (st === "airport") return "tile";                                        // 36 永恒机场：抛光水磨石
    if (st === "airliner") return "carpet";                                       // 36.1 星界客机：客舱地毯
    if (st === "mattress") return "carpet";                                       // 900 休息区：商店地毯
    if (st === "kittyhome") return "carpet";                                      // 974 kitty 之家：粉白相间的厚地毯
    if (st === "cloudplane") return "wool";                                       // 998：羊毛纹理的云层
    if (st === "lastisland") return map.sand && map.sand.has(k2) ? "sand" : "dirt"; // 999 终焉之岛
    if (st === "nature") {
      if (map.water && map.water.has(k2)) return "water";
      return map.grass && map.grass.has(k2) ? "grass" : "dirt";                   // 1000 自然风景
    }
    if (st === "anse") return map.water && map.water.has(k2) ? "water" : "gravel"; // 黯洃銫
    // 战地医院（14h）：潮湿的瓷砖地；被水浸没的那几间病房是水声
    if (st === "mash") return map.water14h && map.water14h.has(k2) ? "water" : "tile";
    if (st === "exclam") return "metal";                                          // 尘封的感叹号：反光金属
    // ---- 1.4.0 批次 ----
    // 0.1 天顶站：空间站是硬质金属板 —— 但刻意不用 Level 2 那种铁格栅声
    // （"metal" 是管道梦魇的音，玩家一听就出戏），这里用硬瓷砖那种脆响。
    if (st === "zenith") return map.bridgeZen && map.bridgeZen.has(k2) ? "metal" : "tile";
    // 289 过载：四个子区各有各的脚下 —— 水池是水、荧火大厅是地毯、
    // 深渊是硬地、卡夫卡迷宫是草地。掉进兜底会变成铁板声，所以逐个写死。
    if (st === "overload") {
      if (map.water289 && map.water289.has(k2)) return "water";
      const zi = map.zoneOf ? map.zoneOf.get(k2) : -1;
      if (zi === 1) return "carpet";
      if (zi === 2) return "tile";
      if (zi === 3) return "grass";
      return "concrete";
    }
    // Level 78 空间站：金属格栅板 —— 硬的，但不是 Level 2 那种铁板声
    if (st === "station78") return "tile";
    // Level 22 颓垣：塌掉的停车场，脚下是水泥。
    // 掉进兜底会变成 Level 2 的铁板声，所以这里写死 —— 坑里是碎石，泳池里是水。
    if (st === "ruin22") {
      if (map.water22 && map.water22.has(k2)) return "water";
      if (map.pit22 && map.pit22.has(k2)) return "dirt";
      if (map.rubble22 && map.rubble22.has(k2)) return "dirt";
      return "concrete";
    }
    // Level 33 无尽购物体验：干净那头是商场的白瓷砖；水漫上来之后是涉水声
    if (st === "mall33") {
      const c33f = (typeof window !== "undefined" && window.c33At) ? window.c33At : null;
      const cc = c33f ? c33f(map, tx) : 0;
      return cc > 0.30 ? "water" : "tile";
    }
    // Level 599 群星：恒星内部，脚下是等离子（没有脚步声这一说，给个硬地）
    if (st === "star599") return "tile";
    // Level 45 深渊公司：防火梯的铁格栅是金属声；楼里按这栋楼的用途各有各的地面 ——
    // 写字楼地毯 / 医院瓷砖 / 公寓木地板 / 仓库水泥，都不是 Level 2 的铁板声。
    if (st === "abyss45") {
      const kk = map.b45kind ? map.b45kind.get(k2) : null;
      if (kk === "X") return "metal";
      const bi = map.b45idx ? map.b45idx.get(k2) : -1;
      const bb = (bi != null && bi >= 0 && map.b45buildings) ? map.b45buildings[bi] : null;
      if (bb) {
        if (bb.type === -1 || bb.isCenter) return "marble";
        const BT = (typeof B45T !== "undefined") ? B45T : (window.B45T || []);
        const tt = BT[bb.type];
        if (tt) return tt.mat;
      }
      return "carpet";
    }
    if (st === "bluevoid") return "water";                                        // 蓝色通道：在里面游泳
    if (st === "arcade") return "arcade";                // 街机厅：积灰的地毯
    if (st === "pool" || st === "poolred") return map.pools && map.pools.has(k2) ? "water" : "tile";
    if (st === "beach") return tx >= (map.seaX | 0) ? "water" : "sand";
    if (st === "stairs") return "concrete";              // 深色混凝土
    if (st === "junction") return "tile";
    if (st === "library") {
      // 1.3.0：右侧单独扩出去的「假现实」是一片草地，不是图书馆的木地板
      const fr = map.fakeReality;
      if (fr && tx >= fr.x && tx < fr.x + fr.w && ty >= fr.y && ty < fr.y + fr.h) return "grass";
      return "wood";                                     // 图书馆：木地板
    }
    // 1.3.0：Level 1 下层单独扩出去的「商人之家」是亮瓷砖；
    // 上层同一块坐标仍是停车场水泥，别一起改了。
    const mh = map.merchantHome;
    if (mh && tx >= mh.x && tx < mh.x + mh.w && ty >= mh.y && ty < mh.y + mh.h) {
      let sameFloor = true;
      try { if (game && (game.floor | 0) !== mh.floor) sameFloor = false; } catch (e) { /* 忽略 */ }
      if (sameFloor) return "tile";
    }
    // Level 30 抽离现实：栈道是木板，岛面是草
    if (st === "dereal30") return (map.bridge30 && map.bridge30.has(k2)) ? "wood" : "grass";
    // Level 696 无尽大楼：各楼层自己的地面材质
    if (st === "endless696") {
      const fz = (typeof e696ZoneOf === "function") ? e696ZoneOf : window.e696ZoneOf;
      const zi = fz ? fz(map, tx, ty) : -1;
      const tbl = (typeof E696_ZONES !== "undefined") ? E696_ZONES : (window.E696_ZONES || []);
      const fk = (zi >= 0 && tbl[zi]) ? tbl[zi].fk : "concrete";
      if (fk === "grass" || fk === "party" || fk === "grayworld") return "grass";
      if (fk === "wood" || fk === "carpet") return "wood";
      if (fk === "water" || fk === "acid") return "water";
      return "tile";
    }
    // Level 1 的花园段：脚下不是混凝土，是长疯了的植被
    if (map.garden && map.garden.has(k2)) return "grass";
    // Level 0 / 0.2 是地毯，Level 1 是混凝土，Level 2 是金属。
    // 兜底曾经是 metal，结果后来新加的层级（21 / Fun 等）只要漏写就全踩出
    // Level 2 的铁板声。现在只有没认出来的层级默认地毯，不再给人铁板。
    // 新增层级都在上面显式写死了，不会再掉到这里。
  }

  // ---------- 新增层级：提示文案 ----------
  function newLevelHint(g) {
    const n = g.nearNew;
    if (!n) return "";
    // 1.3.1 批次：层级自己的提示文案（外部文件挂进来的聚合钩子）
    if (window.__LEVEL_HINT_EXTRA) {
      const ex = window.__LEVEL_HINT_EXTRA(n, g);
      if (ex != null) return ex;
    }
    switch (n.kind) {
      // ---- Level 0 四片大区域 ----
      case "l0archperch": return "一道窄得只够侧身的拱洞 —— 按 E 倚坐片刻，暂时离开湿漉漉的地毯";
        // ---- Level 26 享乐号汽船 ----
      case "p26poster": return "一张倒挂的海报 —— 图钉在下面 · 按 E 触摸它（离开这里）";
      case "p26mask": return "椅子上摆着一张 =( 面具 —— 扫兴客早就灭绝了 · 按 E 戴上";
      case "p26balloonRed": return "一只红气球，线还系着 · 按 E 抓住它";
      case "hubballoon26": return "一扇装饰着可爱气球的窗户 —— 按 E 摸一下";
      case "arcade":
        if (n.p.broken) return "这台街机被砸坏了 —— 屏幕是黑的";
        {
          const to = (n.p.goTo != null ? String(n.p.goTo) : "?");
          return n.p.back
            ? "投一枚 25 美分硬币，集中精力 · 回到 Level " + to
            : "投一枚 25 美分硬币，集中精力 · 这台街机通往 Level " + to;
        }
      case "stairs37": return "一段很高的楼梯 · 按 E 爬上去";
      case "exitbang": return "一扇标着 EXIT 的大门 · 按 E 推开";
      case "reddoorEx": return "一扇红色的门 —— 和这里格格不入 · 按 E 推开";
      case "enddoorEx": return "走廊尽头的门 · 按 E 推开";
      case "redtunnel": return "一条亮着红灯的隧道 · 按 E 走进去";
      case "poolladder37": {
        const tkA = Math.floor(g.player.x / TILE) + "," + Math.floor(g.player.y / TILE);
        const inWA = !!(g.map.pools && g.map.pools.has(tkA));
        return inWA ? "一架水下爬梯 —— 按 E 爬上去"
                    : "一架下到水里的爬梯 —— 按 E 顺着它下去";
      }
      case "poolbreak37": return "栏杆被撞坏的那一段 —— 按 E 从这里爬上去";
      case "e696": return e696Hint(g, n.p);
      case "water696": {
        const left = Math.max(0, 120 - ((g && g.l7T) || 0));
        if (left > 0) return "一片泛着说不清颜色的水 —— 还没有动静（再待 " + Math.ceil(left) + " 秒）";
        return "那片水正在往下陷 —— 按 E 跳进去";
      }
      case "pool4": return "这里的水越来越浅，墙越来越像办公室 —— 按 E 继续走";
      case "whitelight": return "一片白色亮光 —— 按 E 逃出去";
      case "exist": return g.map.doomed ? "门已经锁上了 —— 你来不及了"
                                        : "按 E 从这扇 EXIST 的门原路返回 Level 11";
      case "stairTop":
        return "通往上一层的台阶"; return "最上面被水泥封死了";
      case "midHole": return "空洞的边缘 —— 往下望是一片黑 · 按 E 跳下去";
      case "holeEdge": return "空洞的边缘 —— 往下望是一片黑";
      case "whiteHole": return "最底下变成了白色 —— 跳进去";
      case "junctionHole": return "交接点 —— 按 E 结束这一切";
      case "exist11": return "一扇标着 EXIST 的门 · 按 E 推开";
      case "door37": return "一扇标着 37 的门 · 按 E 推开";
      case "guarddoor25": return "小屋子里有一扇像保安室橱柜的门 · 按 E 推开";
      case "graydoor484": return "一扇灰色的门 —— 和这幢白房子格格不入 · 按 E 推开";
      case "irondoor04": return "一扇白色铁门，门牌上写着 L1 · 按 E 推开";
      // ---- 1.2.0：Level 171 / 301 / 11.1 ----
      case "hopewindow": return hasKSuit(g)
        ? "最上方那扇窗 —— 窗外是巴黎，阳光晃得人睁不开眼 · 按 E 打碎它"
        : "最上方那扇窗 —— 窗外是巴黎。你在腐蚀性的空气里，撑不了多久 · 按 E 打碎它";
      case "parrotdoor171": return "一扇木门，门板上雕着一只鹦鹉 · 按 E 推开";
      case "bntgcounter": return "B.N.T.G 的柜台 —— 有人在里面 · 按 E 交易";
      case "coffeecart": return "一辆咖啡车 —— 摊主不在，糖罐和奶罐都摆着 · 按 E 给自己调一杯";
      case "gate36": {
        const cd = (n.p && n.p.countdown != null) ? n.p.countdown : 9999;
        if (cd <= 0) return "登机口 " + (n.p.gate || "?") + " —— 这班已经走了，门口的黑屏灭了";
        if (cd > 1000) return "登机口 " + (n.p.gate || "?") + " · " + (n.p.flight || "")
          + " 还在候机（倒计时 " + Math.round(cd) + "）";
        return "登机口 " + (n.p.gate || "?") + " —— 开始登机了 · 按 E 走上去";
      }
      case "exit361": return "出口门 —— 外面泛着纯净的白光 · 按 E 下飞机";
      case "confess999": return "岛正中心 —— 跪下来，把你的罪状一条一条认完 · 按 E 忏悔";
      case "facelingnpc": return "一个无面灵 —— 它只是站在那儿，脸上什么都没有 · 按 E 搭话";
      case "neonfogexit": return "那团霓虹雾 —— 按 E 回到 Level 11 的街道上";
      case "neonfog11": return "城市边缘飘着一团霓虹雾 · 按 E 走进去";
      case "deadpool10": return "一小潭死水 —— 水面黑得看不见底，闻着有股味道 · 按 E 走进去";
      case "bluedoor": return "一扇悬在虚空里的门 —— 整个通道只有蓝色，它却发着白 · 按 E 推开";
      // 门牌就写在门板上：0 / 2 / white —— 固定去处，不再随机
      case "hole01": return "地毯上破了一个洞 —— 底下是空的，望不到底 · 按 E 跳下去";
      case "wall289": return "一面黄色的墙 —— 和这里格格不入 · 按 E 碰上去";
      // Level 22 颓垣 / Level 33 无尽购物体验
      case "hole22": return "地板上破了一个洞 —— 底下是塌掉的停车场 · 按 E 跳下去";
      case "mall33door": return "购物中心的玻璃门 —— 里面亮着灯，货架却是空的 · 按 E 推门进去";
      case "p22hole": return "地上一口洞 —— 洞那头是 Level 21 的地板 · 按 E 爬下去";
      case "p22up": return "一段通往上层的坡道 —— 上面是 Level 33 · 按 E 走上去";
      case "p22ramp": return "一段坡道，通往另一层 · 按 E 走上去";
      case "p22tent": return "一顶帐篷 —— 里面装着人 · 按 E 拉开";
      case "p22fire": return "一堆还没灭的篝火 —— 边上有人留下的东西 · 按 E 烤火";
      case "p22crop": return "一小片庄稼 —— 不知道最初的种子是从哪儿来的 · 按 E 摘一把";
      case "p22wreck": return "一辆锈死的汽车 —— 后备箱也许还没撬过 · 按 E 翻一翻";
      case "p33gate": return "你进来的那道门 —— 原路返回 Level 11 · 按 E 出去";
      // ---- 1.6.0：Level 67 欲望烘焙坊 ----
      case "bakery67door": return "一家面包店 —— 烤面包的香气就是从这儿飘出来的 · 按 E 推门进去";
      case "hub94hole": return "地上一口长方形的洞口 —— 边缘整齐得像被切割过 · 按 E 爬进去";
      // ---- 1.6.0：Level 67 欲望烘焙坊 ----
      case "p67door": return "店门 —— 直接离开店面就回到 Level 11 · 按 E 出去";
      case "p67clerk": return "柜台后的无面接待员 —— 他多半会推荐一份「最合你口味」的面点 · 按 E 点单";
      case "p67pastry": {
        if (n.p && n.p.eaten) return "一只空盘子 —— 上面还沾着屑";
        const k = (n.p && n.p.kind) || "neutral";
        if (k === "fav") return "一份金灿灿的面点 —— 一眼就认出来了，这是你最爱的那种 · 按 E 吃（最致命）";
        if (k === "hated") return "一份发灰发绿的面点 —— 闻着像腐烂的生肉 · 按 E 硬吃下去（会被送到别的地方）";
        if (k === "expired") return "一份发霉的面点 —— 霉斑清晰可见 · 按 E 吃（会食物中毒）";
        return "一份普普通通的面点 —— 你既不喜欢也不讨厌 · 按 E 吃（最安全）";
      }
      case "p67back": return "员工专用门 —— 进去的人再也没有出来过 · 按 E 推开";
      case "p67queue": return "排在你前面的无面灵 —— 别推它，也别抱怨 · 按 E 搭话";
      case "p67jerry": return "杰里和可可 —— 腰间挂着狐狸面具和化妆舞会用的假面 · 按 E 搭话";
      case "p67friends": return "童年挚友 —— 她们会尽量帮你 · 按 E 搭话";
      case "p67mask": return "墙上挂着的一张面具 —— 别靠太近 · 按 E 看一眼";
      case "p67diffuser": return "一台香薰机 —— 散发出让你喜悦的香气 · 按 E 闻一闻";
      case "p67radio": return "一台播放设备 —— 放着你在家时常听的曲子 · 按 E 听";
      case "p67plant": return "一盆植物 —— 正是你最喜欢的那种 · 按 E 看";
      // ---- 1.7.0：Level 29 海波利亚 ----
      case "jet29": return g.jet29ride
        ? "你在海上了 —— 朝北再走 " + Math.ceil(JET29_NEED - (g.jet29dist || 0)) + " 格"
        : "一台水上摩托 —— 停在码头上，钥匙还在 · 按 E 骑上去（要往北开出 " + JET29_NEED + " 格）";
      case "p29dock": return "一座船坞 —— 流浪者初至此地的地方 · 按 E 看一眼";
      case "p29boat": return g.onBoat29
        ? "你已经在船上了 —— 接着往海的深处开 · 再走 " + Math.ceil((1500 - (g.nm29 || 0)) / 10) + " 格"
        : "一艘泊在水边的船 —— 离开这座岛的唯一方式 · 按 E 上船";
      case "p29almond": return "从山坡上流下来的杏仁水 · 按 E 捧起来喝";
      case "p29shed": return "一间小棚屋 —— 给镇上提供稳定的食物来源 · 按 E 敲门";
      case "p29tower": return "一座瞭望塔 —— 抵御外来威胁的第二层保护 · 按 E 爬上去";
      case "p29office": return "一栋形似巨型办公楼的建筑 —— 某个社群的外交站 · 按 E 走进去";
      case "p29sign": return "一块路牌 · 按 E 看";
      case "p29villager": return "一位居民 —— 和你很像，但不是人 · 按 E 搭话";
      case "p29animal": return "岛上的一只动物 —— 和前厅的相比有些细微的变化 · 按 E 看";
      case "p29redtree": return "一棵红色的树 —— 又粗又高，白色的叶子，比铝还硬 · 按 E 摸一摸";
      case "p29kraken": return "一片把一切拉近的漩涡 —— 底下睡着「克拉肯」 · 别再往前了";
      // ---- 1.7.0：Level 284 需汝之地 ----
      case "p284bed": return "一张用草搭制的床 —— 睡一觉就会在 Level 11 醒来 · 按 E 躺下";
      case "p284radio": return "身后混凝土月台上的音响 —— 它一直在放着什么 · 按 E 听";
      case "p284food": return "身旁的炸食 —— 荡漾在口里的味道 · 按 E 吃一口";
      case "p284love": return n.p && n.p.held
        ? "那个幻影 —— 你的手指还和他的扣在一起 · 按 E 再待一会儿"
        : "有人坐在你身后的月台上 —— 你认得他 · 按 E 开口";
      case "p284rail": return "观景台边上的栏杆 · 按 E 扶着往下看";
      case "p284tree": return "来时那条山路上的一棵树 —— 你发誓自己走过完全相同的路 · 按 E 看";
      case "p284lamp": return "山路上的一盏路灯 · 按 E 看";
      case "p284farlamp": return "对岸那个平台上的灯 —— 和这边一模一样 · 过不去";
      // ---- Level 31 旱冰场 ----
      case "p31card": return "一台绿色卡片机 —— 盒中央是个大蓝按钮 · 按 E 领卡片";
      case "p31arcade": return "一台街机 —— " + ((n.p && n.p.game) || "不知名的机台") + " · 按 E 玩一把";
      case "p31arcade40": return "一台标着 40 的游戏机 —— 玩它可以离开这里 · 按 E 玩";
      case "p31door70": return "一扇刻着 70 的白门 —— 教练说，是时候走了 · 按 E 推开";
      case "p31counter": return "点餐台 —— 柜台后是一名戴空白名牌的无面灵 · 按 E 点餐";
      case "p31coach": return "教练 —— 他记得你的名字 · 按 E 跟他说话";
      case "p31rental": return "旱冰鞋租赁处 —— 柜台上有美国尺码对照表 · 按 E 挑一双";
      case "p31skates": return "一双旱冰鞋 · 按 E 穿上";
      case "p31tv": return "一台大电视 —— 放的是你最爱的那部片子 · 按 E 坐下看";
      case "p31dj": return "DJ 台里的无面灵 —— 他在给全场选曲 · 按 E 打招呼";
      case "p31drink": return "饮料机 —— 杏仁水，还有各种前厅汽水 · 按 E 接一杯";
      case "p31bin": return "垃圾桶 —— 上方墙上用胶带固定着一张告示牌 · 按 E 看";
      case "p31flap": return "一扇矮小的木门 —— 门那儿有块翻板 · 按 E 跨过去";
      // ---- Level 40 摇滚披萨 ----
      case "p40arcade": {
        const nm = (n.p && n.p.game) || "不知名的机台";
        if (n.p && n.p.busy) return nm + " —— 屏幕上一片乱码，像正被什么东西玩着 · 按 E 碰一下（不建议）";
        return nm + " · 按 E 玩一把";
      }
      case "p40vend": return "自动售货机 —— 食物上都抹着青柠色、微微发光的酱汁 · 按 E 买一份";
      case "p40tv": return "一台电视台 —— 播着随机又怪诞的广告 · 按 E 看";
      case "p40pat": return "Pat —— 他很高，戴棒球帽，扣着一件亮蓝衬衫，有四只胳膊 · 按 E 跟他说话";
      case "p40revolving": return "旋转门 —— 穿什么衣服走出去，决定了你去哪一层 · 按 E 走进去";
      case "p40rusty": return "一扇生锈的金属门 · 按 E 推开";
      case "p40office": return "一扇木门 —— 后面是「仅供职员使用」的区域 · 按 E 推开";
      case "p40restroom": return "卫生间 —— 男女各一间，都还能用 · 按 E 进去";
      case "p40storage": return "仓库 —— 堆满了糟糕的食品和玩具 · 按 E 翻一翻";
      case "p40lane": return "一条保龄球道 —— 场馆本身还在正常运作 · 按 E 打一局";
      case "p40score": return "竞赛排行榜 —— 用户名由随机的数字和字母构成 · 按 E 看";
      // ---- Level 94 动画 ----
      case "p94fountain": return "镇子中心的大喷泉 —— 里面流淌着杏仁水 · 按 E 喝一口";
      case "p94house": return "一栋小房子 —— 里面摆着同样小的家具 · 按 E 进去看看";
      case "p94car": return (n.p && n.p.weird) ? "一辆停在草地中央的古怪汽车 · 按 E 打量" : "一辆 30 年代的车 · 按 E 打量";
      case "p94milk": return "一辆装满杏仁奶的送奶车 · 按 E 拿一瓶";
      case "p94speaker": return "一只大喇叭 —— 不时播放欢快的卡通音乐 · 按 E 听";
      case "p94tower": return "一座水塔 —— 里面似乎含着杏仁水 · 按 E 爬上去";
      case "p94furniture": return "一套孤零零摆在草地上的家具 · 按 E 坐一下";
      case "p94wall": return "一面孤零零立着的墙 —— 旁边还摆着家具 · 按 E 看";
      case "p94shed": return "一间单间的房子 —— 就这么孤零零地立在草地上 · 按 E 进去";
      case "p94castlegate": return "城堡的门 —— 里面的房间主题非常欢快 · 按 E 推开";
      case "p94ballpit": return "一个海洋球坑 · 按 E 跳进去";
      case "p94playground": return "一座游乐场 —— 滑梯和秋千都还在动 · 按 E 玩";
      case "p94studio": return "一间动画工作室 —— 台子上是一格格画好的画面 · 按 E 看";
      case "p94minitown": return "一座微型的城镇 —— 里面是这一层那些实体的复制品 · 按 E 凑近看";
      case "p94robot": return "一具 30 年代的老式机器人玩具 —— 它是城堡的守卫 · 按 E 打量";
      case "p94throne": return "一扇宏伟的大门 —— 后面是觐见室，里面是「王」· 按 E 推开";
      case "p33stairs": return "身后的楼梯 —— 下去就是 Level 22 · 按 E 走下去";
      case "p33office": return "一扇办公室的门 · 按 E 推开";
      case "brokendoor289": return "一扇被毁坏的门，门板歪在一边 · 按 E 钻过去";
      // Level 0.1 天顶站
      case "zenithrobot": return "一台还在动的机器人 —— 它没有脸，可你知道它在看你 · 按 E 搭话";
      case "zenithbar": return "一根能量棒 · 按 E 收下（生命 +30 · 理智 +25）";
      // Level 289 过载
      case "p289shaft": return "地上一口竖井，底下看得见浑水 —— 按 E 跳下去";
      case "p289pass": return "一道通往下一个子区的口子 · 按 E 走过去";
      case "blackdoor287": {
        if (n.p && n.p.warp287) return "一扇纯黑的门 —— 门板上什么都没写 · 按 E 推开";
        const lb = (n.p && n.p.label != null) ? String(n.p.label) : "";
        return lb
          ? "一扇纯黑的门，门板上写着「" + lb + "」· 按 E 推开"
          : "一扇纯黑的门 —— 门后是什么，只有推开才知道 · 按 E 推开";
      }
      case "glitchwall": return "这面墙在闪 —— 黑一下，白一下，像坏掉的电视 · 碰上去";
      case "nook21": return "墙上有一道被撬开的窄缝，缝里透着惨白的光 · 凑上去";
      case "nook21warn": return "墙上有一道被撬开的窄缝，缝里透着惨白的光 · ⚠ 那一边没有出口 —— 先吃一颗迁跃浆果记住这里，不然进去了就出不来";
      case "pc4": return "一台还亮着的电脑 —— 屏幕上有个光标在闪 · 按 E 开机";
      case "pc601": return "一台还在运行的电脑 —— 网线早就断了，硬盘里只有三个 .exe · 按 E 开机";
      // ---- 1.3.0：Level 601「假现实」/ Level 1「商人之家」----
      case "memvending": return "售货机 —— 里面是无限的记忆汁 · 按 E 接一瓶";
      case "bntgstall": return "商人之家 · " + ((n.p && n.p.stall && n.p.stall.name) || "摊位")
        + " —— 按 E 看看这家卖什么";
      case "fake601sign": return "一块木牌：假现实 · 前面那片草地";
      case "merchantsign": return "商人之家 —— B.N.T.G 在 Level 1 最大的据点";
      case "door363": return "一扇微微打开的白色木门 —— 它是这个房间唯一有特征的东西 · 按 E 凑近看";
      case "arcade25": return "一台还在运转的街机 · 投一枚 25 美分硬币，集中精力 · 按 E 进入 Level 25";
      // Level 15.1 枉然
      // 隐秘层级 —— 战地医院（14h）
      case "medcab14h": return "一个急救柜 —— 玻璃门后面是注射器和急救包 · 按 E 用（这里的东西往往有异常效果）";
      case "ghost14h": return "一个鬼魂一样的形体 —— 它似乎注意到了你 · 按 E 伸手";
      case "ceiling14h": return "天花板在这里塌了一块，上面是个黑洞 —— 但那里并非生路";
      case "exitwall14h": return "这一小段墙是黑白相间的 —— 和别处脏兮兮的蓝瓷砖格格不入 · 按 E 碰上去";
      case "stairs289h": return "一段向下延伸的楼梯 · 按 E 走下去";
      case "pod151": return "一台仿真设备 —— 戴上它，你想要什么它就给你什么 · 按 E 躺进去";
      case "ctrldoor151": return "一扇密封的门，门上只有一个小观察孔 · 凑上去看一眼";
      case "queue151": return "一个排队的人 —— 他在这儿站了很久，谁也不知道在等什么 · 按 E 搭话";
      case "screen151": return "墙上的监视器 —— 屏幕里是一排排躺在仿真设备上的人 · 按 E 看一眼";
      case "sim151out": return "模拟里什么都有 —— 按 E 自己摘下设备（只有自己愿意摘，才是安全的）";
      case "blocked13": return "封锁线后面是一面白墙 —— 守卫挡在那儿，不准进（得另外找个空子）";
      // ---- Level 20 波瑞阿斯建筑 ----
      case "l20locker": return "一排铁皮储物柜 —— 里头能翻出巧克力棒和苏打水 · 按 E 打开";
      case "l20vend": return "一台软饮料自动售货机（2 枚 B.N.T.G 币一瓶）· 按 E 买";
      case "l20fount": return "一台杏仁水喷泉 —— 水柱一直在冒 · 按 E 接一瓶";
      case "l20window": return "一扇窗 —— 窗外是群星点缀的黑色虚空。凑近了你会头痛 · 按 E 切进去";
      case "l20jelly": return "从天花板上掉下来的一团橙色果冻 —— 还在抖 · 按 E 碰一下";
      case "l20game": {
        const nm = (window.L20 && L20.NAMES) ? (L20.NAMES[n.p.game] || "游戏") : "游戏";
        return "一扇通往「" + nm + "」的门 —— 赢了给补给，输了要命 · 按 E 进去（ESC 退出）";
      }
      // ---- Level 78 空间站 ----
      case "p78hatch":
        return n.p.open
          ? "舱门已经开了 —— 高剂量辐射还在往外漏，快去找那间舷窗里有街道的救生舱"
          : "一扇封死的舱门 —— 按 E 打开（门一开，整座站就会开始漏高剂量辐射）";
      case "cabindoor1000":
        return "木屋的门虚掩着 —— 按 E 推开（留下来，就再也没人找得到你）";
      case "p78pod":
        return n.p.real
          ? "一间半圆形的救生舱 —— 它的舷窗里是一条街，不是星 · 按 E 钻进去"
          : "一间半圆形的救生舱 —— 舷窗里还是星，不是街 · 按 E 钻进去（档案说：不是街道就换一间）";
      case "p78dense":
        return "这一扇舷窗里的星多得不正常 —— 密得几乎连成一片 · 按 E 凑上去看";
      case "p78sep":
        return "一具开着的分离仓 —— 里面浮着一个人 · 按 E 看一眼";
      case "p78porthole":
        return "一扇舷窗 —— 窗外只有星，没有地球、没有月亮 · 按 E 凑近（别盯太久）";
      // ---- Level 45 深渊公司 ----
      case "p45escape":
        return "一架防火梯 —— 它不通往虚空，而是通往另一栋楼 · 按 E 爬上去";
      case "p45pen":
        return "一道实验围栏 —— 玻璃后面那东西一直在看你 · 按 E 看一眼";
      case "p45sculpt":
        return "摆得整整齐齐，一样也用不了 —— 这是塑料做的 · 按 E 敲一下";
      // 通用门：1.2.0 那批层级的门（类型各异），统一按 toLevel 走
      case "genericdoor": {
        const df = levelDef(n.p.toLevel);
        const nm = df && df.name ? df.name : ("Level " + n.p.toLevel);
        const head = n.p.tip ? n.p.tip + " · " : (n.p.label ? "门牌上写着 " + n.p.label + " · " : "");
        return head + "按 E 推开";
      }
      case "exitDoorEnd": {
        const m = g.map;
        if (m.seqBook >= 4) return "EXIT 的门开了 —— 按 E 走出去";
        const names = { blue: "蓝", red: "红", purple: "紫", green: "绿" };
        const orderTxt = ["blue", "red", "purple", "green"].map((c) => names[c]).join("→");
        return "EXIT 的门锁着 —— 得按 " + orderTxt + " 的顺序接触那四本书（" + m.seqBook + "/4）";
      }
      case "darkDoorEnd": {
        const m = g.map;
        if (m.seqGroove >= 4) return "深色门上出现了凹槽的光 —— 按 E 推开门";
        const names = { purple: "紫", red: "红", green: "绿", blue: "蓝" };
        return "一扇深色门 —— 按 " + ["purple", "red", "green", "blue"].map((c) => names[c]).join("→")
          + " 的顺序踩门边的凹槽（" + m.seqGroove + "/4）";
      }
      case "book": {
        const names = { blue: "蓝", red: "红", purple: "紫", green: "绿" };
        return "一本 " + names[n.p.color] + " 色的书，封面上写着 " + n.p.digit + " · 按 E 捡起来";
      }
      case "groove": {
        const names = { purple: "紫", red: "红", green: "绿", blue: "蓝" };
        return names[n.p.color] + "色的凹槽 · 按 E 把东西放进去";
      }
      // ---- 1.9.0：Level 24 月球 ----
      case "p24shaft": return "一座采矿竖井 —— 三支采矿队以三日轮班制在这儿作业 · 按 E 往下看";
      case "p24notice": return "一张招聘告示 —— 塑料工场正在招人 · 按 E 看";
      case "p24miner": return "一名矿工 —— 找不到出口的时候，他会为你指一扇门 · 按 E 问路";
      case "p24mite": return "一只月螨 —— 体型大得离谱，可它完全无害，还躲着你 · 按 E 看";
      case "p24egg": return "一枚乳白色的虫卵 —— 物资短缺时能当应急食物 · 按 E 捡起来";
      case "p24burrow": return "月螨挖的浅洞 —— 边上堆着刨出来的土 · 按 E 看";
      case "p24plastic": return "一堆开采出来的塑料原料 —— 日均近 300 吨 · 按 E 看";
      case "p24bunk": return "队员生活区的一张床铺 · 按 E 坐一下";
      case "p24crate": return "一只货箱 · 按 E 翻一翻";
      case "p24bookshelf": return "一架维多利亚式的书架 —— 摆在这儿，说不上为什么 · 按 E 抽一本";
      case "p24desk": return "一张维多利亚式的书桌 · 按 E 拉开抽屉";
      case "p24globe": return "一座地球仪 —— 上面却没有地球 · 按 E 转一下";
      case "p24fire": return "一座壁炉 —— 火是假的，可确实是暖的 · 按 E 烤火";
      case "p24lamp": return "一盏台灯 · 按 E 拧亮";
      case "p24chair": return "一张扶手椅 · 按 E 坐下";
      // ---- 1.9.0：Level 56 冷冻致伤 ----
      case "p56cave57": return "一处加宽的洞穴 —— 里面积着白雪 · 按 E 走进去";
      case "p56airlock78": return "一扇结着霜的气闸门 —— M.E.G 不建议任何人进去 · 按 E 推开";
      case "p56crate": return "一只钉住的木箱 —— 里面是防寒服和补给，得用工具撬 · 按 E 撬开";
      case "p56flag": return "一面红色旗帜 —— 前哨 A 和中心之间就靠它指路 · 按 E 看";
      case "p56outpost": return "一处 M.E.G 冰川前哨 · 按 E 进去";
      case "p56fossil": return "一具冻在冰里的实体化石 —— 被一种丝状材料紧紧裹着 · 按 E 看";
      case "p56icicle": return "天花板上的一根冰柱 —— 随时可能掉下来 · 按 E 敲一下（不建议）";
      case "p56canister": return "一只保温瓶 —— 里面装着不明液体 · 按 E 打开（先检查内容物）";
      case "p56hole": return "冰层里被实体挖出来的洞 —— 里头多半有敌意实体 · 按 E 往里看（不建议）";
      // ---- 1.9.0：Level 57 白日美术馆 ----
      case "p57door21": return "一扇普普通通的门 —— 门牌上写着 21 · 按 E 推开";
      case "p57moon": return "一副月亮的画 —— 画得比你见过的任何月亮都真 · 按 E 切进去";
      case "p57painter": return "画家 —— 她穿着褪色的蓝睡衣，正在为下一次展览做准备 · 按 E 上前搭话";
      case "p57muralist": return "壁画师 —— 高挑，蒙着层层白纱，脸上是一张蓝色陶制面具 · 按 E 开口";
      case "p57counter": return "登记前台 —— 兼作吧台，供应杏仁水 · 按 E 要一杯";
      case "p57seat": return "一排金属座椅 · 按 E 坐下";
      case "p57window": return "一扇单开窗户 —— 细软的熙光自窗帘处透进来 · 按 E 看";
      case "p57plant": return "一株摆在悬空书架上的盆栽 · 按 E 看";
      case "p57statue": return "一尊古典式雕塑 · 按 E 打量";
      case "p57pestle": return "一支裹满灰浆的研磨杵 · 按 E 拿起来";
      case "p57shelf": return "一架书架 · 按 E 抽一本";
      case "p57shelf2": return "墙边堆着的书架 —— 抽屉里耷拉着半折的画布 · 按 E 翻";
      case "p57desk": return "一张侧翼有书架相伴的画桌 · 按 E 看";
      case "p57double": return "一扇沉重的双扇门 —— 右边就是惬意美术馆 · 按 E 推开";
      case "p57screen": return "一道屏风 —— 工作室就是被这些屏风分隔出来的 · 按 E 绕过去";
      case "p57blanket": return "一条沙发毯 · 按 E 裹上";
      case "p57artmag": return "几本美术杂志 · 按 E 翻一翻";
      case "p57mask": return "一条蓝色睡眠眼罩 · 按 E 戴上";
      case "p57cork": return "一座浸透了丙烯颜料的软木雕像 · 按 E 摸一下";
      case "p57tent": return "一顶蓝色的三角帐篷 —— 里面的天花板上垂着点点繁星 · 按 E 钻进去";
      case "p57fakewin": return "一面人为伪造的窗户 —— 被绘制成能远望到无垠沙滩的模样 · 按 E 看";
      case "p57bean": return "一张蓝色豆袋椅 · 按 E 坐上去";
      case "p57fruit": return "一盘仿真水果 · 按 E 拿一个";
      case "p57drawer": return "一只抽屉 —— 里面耷拉着半折的画布 · 按 E 拉开";
      case "p57mag": return "一个空杂志架 · 按 E 翻";
      case "p57paint": {
        const nm = (n.p && n.p.title) || "一幅画";
        return nm + " —— 走近了能听见画里那个层级的声音 · 按 E 凑近看";
      }
      case "p57clay": return "一件还没雕完的陶土制品 · 按 E 看";
      default: return "";
    }
  }

  // ---------- 新增层级：按 E 之后 ----------
  function newLevelInteract(g) {
    const n = g.nearNew;
    if (!n) return;
    const m = g.map;
    // 1.3.1 批次：层级自己的交互（返回 true 表示已处理完）
    if (window.__LEVEL_INTERACT_EXTRA && window.__LEVEL_INTERACT_EXTRA(n, g)) return;
    switch (n.kind) {
      // ---- Level 0 四片大区域 ----
      case "l0archperch": {
        g.l0perch = 6;
        toast("你侧身倚进拱洞 —— 脚离开了湿地毯，总算能喘口气");
        return;
      }
      case "l0deepdoor": {
        AudioSys.exitChime();
        goToLevel(g, "traproof", "推开了那扇木门",
          "脚下只剩悬空的网格线，底下是望不见底的深坑 —— Level 0 · 深坑区 ...");
        return;
      }
      // ---- Level 26 享乐号汽船 ----
      case "p26poster": {
        AudioSys.exitChime();
        goToLevel(g, 27, "触摸了那张反转的海报",
          "海报在指尖底下翻了过来 —— 潮湿的石灰岩与温热的池水 · Level 27 岩体泉 ...");
        return;
      }
      case "p26mask": {
        if (window.l26MaskOn && window.l26MaskOn()) { toast("=( 已经戴在脸上了 —— 主菜单里可以摘下"); return; }
        if (window.l26SetMask) window.l26SetMask(true);
        toast("你把 =( 戴到了脸上 —— 冰凉，轻得不像真的");
        return;
      }
      case "p26balloonRed":
      case "hubballoon26": {
        AudioSys.exitChime();
        goToLevel(g, 26, "抓住了那只红气球",
          "黄色的墙一间接着一间，望不到头 —— Level 26 · 享乐号汽船 ...");
        return;
      }
      case "arcade": {
        if (n.p.broken) { toast("这台机器早就坏了 —— 屏幕上什么也没有"); return; }
        AudioSys.exitChime();
        if (n.p.back) {
          goToLevel(g, 0, "又一台街机", "身后约一百步的地方，总能找到另一台 —— 你回到了 Level 0 ...");
        } else {
          const to = (n.p && n.p.goTo != null) ? n.p.goTo : m.arcadeTo[randInt(0, m.arcadeTo.length - 1)];
          goToLevel(g, to, "投币，集中精力",
            "屏幕闪了一下，机柜在你身后合上 —— 你被送去了 Level " + to + " ...");
        }
        return;
      }
      case "pc4":
        try { AudioSys.click && AudioSys.click(); } catch (e) { /* 忽略 */ }
        openPc4();
        return;
      case "pc601":
        try { AudioSys.click && AudioSys.click(); } catch (e) { /* 忽略 */ }
        openPc601();
        return;
      // ---- 1.3.0：Level 601「假现实」/ Level 1「商人之家」----
      case "memvending": {
        addItem("memoryjuice", 1);
        try { AudioSys.click && AudioSys.click(); } catch (e) { /* 忽略 */ }
        toast("售货机咔哒一声，吐出一瓶记忆汁 —— 柜子里还是满的，像是永远拿不完");
        updateBag(); updateHud();
        return;
      }
      case "bntgstall":
        openMerchantStall(n.p);
        return;
      case "fake601sign":
        toast("木牌上写着「假现实」—— 前面那片草地四周全是树，走不出去");
        return;
      case "merchantsign":
        toast("商人之家 —— B.N.T.G 在 Level 1 最大的据点，各家摊位要价不一样");
        return;
      case "door363":
        // 它看起来像出口 —— 可门后没有别的房间，只有一片黑
        try { toast("门后没有另一个房间 —— 只有一片黑。而那片黑里，有东西在动。"); } catch (e) { /* 忽略 */ }
        return;
      case "arcade25":
        AudioSys.exitChime();
        goToLevel(g, 25, "投币，集中精力",
          "屏幕闪了一下，机柜在你身后合上 —— 你被送去了 Level 25 ...");
        return;
      case "stairs37":
        AudioSys.exitChime();
        goToLevel(g, "601", "爬上了那段很高的楼梯",
          "水声在身后断了 —— 你站在一排排空着的书架之间。The End ...");
        return;
      case "redtunnel":
        AudioSys.exitChime();
        goToLevel(g, "37.1", "走进了红灯的隧道",
          "光一点点暗下去，水变得黏稠 —— 你已经不在池房了 ...");
        return;
      case "pool4":
        AudioSys.exitChime();
        goToLevel(g, 4, "水越来越浅了",
          "瓷砖变成了地毯，水声变成了日光灯的嗡嗡 —— 你切进了 Level 4 ...");
        return;
      case "whitelight":
        AudioSys.exitChime();
        goToLevel(g, 37, "朝着那片白色亮光走过去",
          "红色退了，水重新变得清澈 —— 你回到了 Level 37 ...");
        return;
      // ---- 水下爬梯：在水里 -> 爬上岸；在岸上 -> 顺着梯子下水（都有动画）----
      case "poolladder37": {
        const l = n.p;
        const tkB = Math.floor(g.player.x / TILE) + "," + Math.floor(g.player.y / TILE);
        const inWB = !!(m.pools && m.pools.has(tkB));
        const dx2 = (l.deckX != null ? l.deckX : l.x + (l.fx || 0));
        const dy2 = (l.deckY != null ? l.deckY : l.y + (l.fy || 0));
        if (inWB) {
          startPoolAnim(g, (dx2 + 0.5) * TILE, (dy2 + 0.5) * TILE, 0.75);
          g.sink = 0; g.drownT = 0; g.drownWarn = false; g.poolT = 0; g.poolTint = 0; g.poolDrownWarn = false;
          if (el.btnUp) { el.btnUp.classList.remove("ready"); hide(el.btnUp); }
          AudioSys.exitChime();
          toast("抓住爬梯，一阶一阶爬上了岸");
        } else {
          startPoolAnim(g, (l.x + 0.5) * TILE, (l.y + 0.5) * TILE, 0.75);
          AudioSys.exitChime();
          toast("顺着爬梯下到了水里");
        }
        return;
      }
      // ---- 栏杆被撞坏的那一段：浮到水面就能从这儿爬出去 ----
      case "poolbreak37": {
        const b = n.p;
        startPoolAnim(g, (b.x + 0.5) * TILE, (b.y + 0.5) * TILE, 0.8);
        g.sink = 0; g.drownT = 0; g.drownWarn = false; g.poolT = 0; g.poolTint = 0; g.poolDrownWarn = false;
        if (el.btnUp) { el.btnUp.classList.remove("ready"); hide(el.btnUp); }
        AudioSys.exitChime();
        toast("从栏杆被撞坏的那一段爬了上来");
        return;
      }
      // ---- Level 7：停留 2 分钟以上，跳进极远处破屋边上的水 -> Level 696 ----
      case "water696": {
        if ((g.l7T || 0) < 120) {
          toast("水面还没有动静 —— 再待 " + Math.ceil(120 - (g.l7T || 0)) + " 秒");
          return;
        }
        AudioSys.exitChime();
        goToLevel(g, 696, "跳进了那片水",
          "水没有溅起来 —— 你是直接沉下去的。再睁眼的时候，脚下是浅灰色的混凝土，窗外是另一栋一模一样的楼。这是 Level 696 ...");
        return;
      }
      // ---- Level 696：楼梯 / 电梯 / 洞 / 故障物品 / 煤气罐 ----
      case "e696": {
        const p = n.p;
        const mz = g.map;
        const goZone = (zi) => {
          const c = (mz.zoneCells || [])[zi];
          if (!c) return false;
          g.player.x = (c.cx + 0.5) * TILE; g.player.y = (c.cy + 0.5) * TILE;
          g.e696zone = zi;
          return true;
        };
        const nmz = (zi) => (mz.zoneNames && mz.zoneNames[zi]) || ("第 " + zi + " 层");
        if (p.type === "e696stair") {
          const to = (p.to != null ? p.to : 0);
          if (goZone(to)) { AudioSys.exitChime(); toast("走下了楼梯 —— " + nmz(to)); }
          return;
        }
        if (p.type === "e696hole") {
          if (goZone(22)) { AudioSys.exitChime(); toast("掉进了那个洞 —— 这里是负楼层，越往下越不对劲"); }
          return;
        }
        if (p.type === "e696elev") {
          if (p.elev8) {
            if (goZone(16)) { AudioSys.exitChime(); toast("找到了带 8 的那个按钮 —— 8 层"); }
            return;
          }
          const total = (mz.zoneCells || []).length;
          let zi = randInt(0, Math.max(0, total - 1));
          if (zi === 22) zi = 0;
          if (goZone(zi)) { AudioSys.exitChime(); toast("按下一个按钮 —— 门开了，外面是 " + nmz(zi)); }
          return;
        }
        if (p.type === "e696glitch") {
          if (p.exit30) {
            AudioSys.exitChime();
            goToLevel(g, 30, "碰上了那件紫黑相间的故障物品",
              "手指穿过去的一瞬间，脚下的混凝土没了 —— 你站在一片天里，脚下是云。这是 Level 30 ...");
            return;
          }
          g.sanity = Math.max(0, g.sanity - 12);
          toast("你伸手碰了它 —— 指间传来的不是触感，是别人记错了的一段事");
          return;
        }
        if (p.type === "e696gas") {
          if (p.full) {
            if (Math.random() < 0.35) { addItem("almond", 4); toast("罐口终于撬开了 —— 里头全是杏仁水（费了半天劲，不值得）"); }
            else toast("罐口锈死了 —— 打不开（本来就不值得为这个费劲）");
          } else {
            g.hp = 0;
            g.deathCause = "空的煤气罐也能点着 —— 你划了那根火柴";
            showDead();
          }
          return;
        }
        return;
      }
      // ---- 1.2.0：Level 171 -> Level 301 ----
      case "parrotdoor171":
        AudioSys.exitChime();
        goToLevel(g, 301, "推开了那扇雕着鹦鹉的木门",
          "门后的空气有股刺鼻的甜味 —— 是氟化氢和一氧化碳。你已经站在 Level 301 里了。");
        return;
      // ---- 1.2.0：Level 301 最上方那扇窗 -> 结局「回到现实」 ----
      case "hopewindow": {
        AudioSys.exitChime();
        g.phase = "ended";
        unlockEnding(4);
        // 回到前厅 -> 解锁「希望之窗」主菜单背景图
        markUnlock("bg4");
        applyMenuBg();
        showEnding(4, hasKSuit(g)
          ? "你抡起撬棍砸向那扇窗。玻璃碎开的一瞬间，窗外的风灌了进来 —— "
            + "是巴黎。你爬出去，落在铁塔下的草地上，防化服的面罩里全是自己的呼吸声。"
          : "你砸碎了那扇窗。腐蚀性空气已经把你烧得不成样子，"
            + "但你还是爬了出去 —— 落在一片你认得的、有太阳的草地上。");
        return;
      }
      // ---- 1.4.0：两个新层级的入口 ----
      case "hole01": {
        AudioSys.exitChime();
        goToLevel(g, "0.1", "掉进了地面上那个洞",
          "风声一下子没了 —— 你落在一片金属地板上。四周安静得过分，只有通风口还在响。这是 Level 0.1 ...");
        return;
      }
      case "wall289": {
        AudioSys.exitChime();
        goToLevel(g, 289, "碰上了那面黄色的墙",
          "墙软了下去，像一层薄膜 —— 你整个人陷了进去。水漫过脚踝，铁锈味呛得人想吐。这是 Level 289 ...");
        return;
      }
      case "brokendoor289": {
        AudioSys.exitChime();
        goToLevel(g, 289, "钻过了那扇被毁坏的门",
          "门框歪着，门板早就不在了。跨过去之后是漫到膝盖的浑水，和天花板上那排橙黄的灯泡。这是 Level 289 ...");
        return;
      }
      // ---- 1.5.1：Level 22 颓垣 / Level 33 无尽购物体验 ----
      case "hole22": {
        AudioSys.exitChime();
        goToLevel(g, 22, "跳进了地板上那个洞",
          "你落在一片水泥地上。四周是停车位的白线、锈死的车，和一根根承重柱。"
          + "空气里有股灰味。这是 Level 22 —— 颓垣 ...");
        return;
      }
      case "mall33door": {
        AudioSys.exitChime();
        goToLevel(g, 33, "推开了购物中心的玻璃门",
          "门在身后合上。瓷砖是干净的，灯很稳，货架基本是空的 —— 你现在站在最干净的那一头。"
          + "往里走，它会一点点烂给你看。这是 Level 33 —— 无尽购物体验 ...");
        return;
      }
      case "p22hole": {
        AudioSys.exitChime();
        goToLevel(g, 21, "顺着那个洞爬了下去",
          "洞那头是 Level 21 的地板 —— 编号门还在那儿，一排排地立着 ...");
        return;
      }
      case "p22up": {
        AudioSys.exitChime();
        goToLevel(g, 33, "顺着坡道上了楼",
          "坡道的尽头是一道亮得刺眼的口子。钻过去之后，脚下是干净的白瓷砖 —— 这是 Level 33 ...");
        return;
      }
      case "p22ramp": {
        // 段与段之间的坡道：同层内换一段（这就是停车场上下楼的方式）
        const m22 = g.map;
        const zs = (m22 && m22.zones22) ? m22.zones22 : null;
        if (zs && n.p && n.p.to != null) {
          const z = zs[Math.max(0, Math.min(zs.length - 1, n.p.to | 0))];
          if (z) {
            const lay = m22.layers[0];
            let spot = null;
            for (let tries = 0; tries < 400 && !spot; tries++) {
              const xx = randInt(6, (m22.size | 0) - 7);
              const yy = randInt(z.y0 + 1, z.y1 - 1);
              if (lay[yy] && lay[yy][xx] === 0 && (!m22.pit22 || !m22.pit22.has(xx + "," + yy))
                  && (!m22.water22 || !m22.water22.has(xx + "," + yy))) spot = [xx, yy];
            }
            if (spot) {
              g.player.x = (spot[0] + 0.5) * TILE;
              g.player.y = (spot[1] + 0.5) * TILE;
              try { AudioSys.step("concrete", false); } catch (e) { /* 忽略 */ }
              toast(n.p.to === 2 ? "坡道把你送上了顶层 —— 空气里没有灰味了"
                                 : "坡道把你送到了上面一层");
              return;
            }
          }
        }
        toast("坡道塌了一半 —— 过不去。");
        return;
      }
      case "p22tent": {
        // 帐篷里装着前 Emstable 居民的尸体 —— 偶尔能在他们身上找到剩下的东西
        const roll = Math.random();
        if (roll < 0.42) {
          g.inv.almondwater = (g.inv.almondwater | 0) + 1;
          try { updateBag(); updateHud(); renderHotbar(); } catch (e) { /* 忽略 */ }
          try { if (AudioSys.pickup) AudioSys.pickup(); } catch (e) { /* 忽略 */ }
          toast("帐篷里的人已经不动了。他手边还压着一瓶没开封的杏仁水 —— 你拿走了。");
        } else if (roll < 0.68) {
          g.hp = Math.min(100, (g.hp || 0) + 12);
          toast("里面是空的 —— 只有一件外套。你披上了，身上暖了一点。");
        } else {
          g.sanity = Math.max(0, (g.sanity || 0) - 8);
          toast("帐篷里不止一个人。他们像是互相靠着睡过去的 —— 很久以前。");
        }
        return;
      }
      case "p22fire": {
        g.hp = Math.min(100, (g.hp || 0) + 18);
        g.sanity = Math.min(100, (g.sanity || 0) + 10);
        try { updateHud(); } catch (e) { /* 忽略 */ }
        toast("你在火边蹲了一会儿。手暖了，脑子也清了一点。");
        return;
      }
      case "p22crop": {
        const idx = (g.map.props || []).indexOf(n.p);
        if (idx >= 0) g.map.props.splice(idx, 1);
        g.hunger = Math.max(0, ((g.hunger == null ? 0 : g.hunger) - 30));
        g.hp = Math.min(100, (g.hp || 0) + 8);
        try { updateBag(); updateHud(); } catch (e) { /* 忽略 */ }
        try { if (AudioSys.pickup) AudioSys.pickup(); } catch (e) { /* 忽略 */ }
        toast("摘了一把。不知道是什么，但能吃。");
        return;
      }
      case "p22wreck": {
        const r2 = Math.random();
        if (r2 < 0.3) {
          g.inv.almondwater = (g.inv.almondwater | 0) + 1;
          try { updateBag(); updateHud(); renderHotbar(); } catch (e) { /* 忽略 */ }
          toast("后备箱撬开了 —— 里面还有一瓶杏仁水，标签都晒白了。");
        } else if (r2 < 0.55) {
          g.hp = Math.min(100, (g.hp || 0) + 6);
          toast("车厢里翻出几块压缩饼干。");
        } else {
          toast("空的。连座椅都被拆走了。");
        }
        return;
      }
      case "p33gate": {
        AudioSys.exitChime();
        goToLevel(g, 11, "从进来的那道门走了出去",
          "门在身后合上 —— 外面是不夜城的街道，霓虹还亮着 ...");
        return;
      }
      case "p33stairs": {
        AudioSys.exitChime();
        goToLevel(g, 22, "顺着身后的楼梯走了下去",
          "楼梯下面是灰 —— 承重柱、锈死的车、塌下来的梁。你回到了 Level 22 ...");
        return;
      }
      case "p33office": {
        AudioSys.exitChime();
        // 档案原文：「您也可以通过办公室入口以进入 Level 45。」
        // 以前这里是 goToLevel(g, 4) —— 拿 Level 4（废弃办公室）顶的。Level 45 建好后改回本体。
        goToLevel(g, 45, "推开了那扇办公室的门",
          "门后不是办公室 —— 是一片虚空，里头漂着一栋栋楼。这是 Level 45 ...");
        return;
      }
      // ---- 1.6.0：Level 67 欲望烘焙坊 ----
      case "bakery67door": {
        AudioSys.exitChime();
        goToLevel(g, 67, "你顺着烤面包的香气推开了门",
          "门后不是前厅的面包店 —— 是一间 1980 年代样式的烘焙店，只有 2300 平方英尺 ...");
        return;
      }
      case "hub94hole": {
        AudioSys.exitChime();
        goToLevel(g, 94, "你爬进了那个长方形的洞口",
          "洞口那头是阳光、草地和一座悬浮的城堡 —— 一切都像是被精心制作出来的 ...");
        return;
      }
      case "p67door": {
        AudioSys.exitChime();
        goToLevel(g, 11, "直接走出了店面",
          "门在身后合上 —— 外面是不夜城的街道 · 你回到了 Level 11 ...");
        return;
      }
      case "p67pastry": {
        const k = (n.p && n.p.kind) || "neutral";
        n.p.eaten = true;
        if (k === "fav") {
          // 最致命的一种：五分钟喉咙肿 → 十分钟胃炎 → 二十分钟红皮病 → 呼吸衰竭
          toast("你没能忍住 —— 那份面点进了嘴。它好吃得不像话。");
          g.p67favT = performance.now();
          g.deathCause = "吃下了自己最喜欢的面点";
          g.killerName = "欲望烘焙坊的面点";
          return;
        }
        if (k === "hated") {
          toast("你硬着头皮咽了下去。味道比闻起来还糟 —— 像腐烂的生肉。");
          g.hp = clamp(g.hp - 6, 0, CONFIG.HP_MAX);
          g.p67hatedT = performance.now();
          return;
        }
        if (k === "expired") {
          toast("霉斑在舌头上化开 —— 急性肠胃炎，来得又快又猛。");
          g.hp = clamp(g.hp - 26, 0, CONFIG.HP_MAX);
          g.sanity = clamp(g.sanity - 14, 0, CONFIG.SANITY_MAX);
          g.deathCause = "吃了过期或含过敏原的面点";
          g.killerName = "欲望烘焙坊的面点";
          return;
        }
        toast("一份普普通通的面点 —— 没有冲动，也没有效果。只是不饿了。");
        g.hp = clamp(g.hp + 8, 0, CONFIG.HP_MAX);
        return;
      }
      case "p67clerk": {
        toast("接待员推荐了一份「最合你口味」的面点 —— 最好拒绝它。");
        return;
      }
      case "p67back": {
        // 档案：进去的人再没出来过；店员和尸体会消失于入口，去向未知。
        AudioSys.exitChime();
        const WARP = [1, 4, 6, 9, 11, 13];
        const dst = WARP[randInt(0, WARP.length - 1)];
        goToLevel(g, dst, "你推开了员工专用门",
          "门后是后台。有人把你拖了进去 —— 醒来时已经在别的层级了 ...");
        return;
      }
      case "p67queue": {
        toast("前面的无面灵一动不动。你要是推它，它会立刻回到默认状态 —— 然后攻击你。");
        return;
      }
      case "p67jerry": {
        toast("较矮的那位抬了抬下巴，指了指门口的方向。她们不说话 —— 但那意思很清楚：走。");
        return;
      }
      case "p67friends": {
        toast("年轻的那位塞给你一点补给：「别在柜台前犹豫太久。后面那些会不耐烦。」");
        const got = randInt(0, 2);
        if (got === 0) { addItem("almond", 1); toast("你收到了一瓶杏仁水。"); }
        else if (got === 1) { addItem("bad", 1); toast("你收到了一瓶受污染的杏仁水（也许有用）。"); }
        else toast("她们摇了摇头 —— 这次没有多余的东西了。");
        return;
      }
      case "p67mask": {
        toast("面具的眼窝里好像有什么动了一下。别靠太近 —— 这不是好习惯。");
        g.sanity = clamp(g.sanity - 4, 0, CONFIG.SANITY_MAX);
        return;
      }
      case "p67diffuser": {
        toast("一股让你高兴的香气 —— 是记忆里某个地方的味道。");
        g.sanity = clamp(g.sanity + 10, 0, CONFIG.SANITY_MAX);
        return;
      }
      case "p67radio": {
        toast("放的是你在家时常听的那首曲子。听着听着，喉咙有点发紧。");
        g.sanity = clamp(g.sanity + 8, 0, CONFIG.SANITY_MAX);
        return;
      }
      case "p67plant": {
        toast("一盆你最喜欢的植物 —— 连叶片上的缺口都和你记得的一模一样。");
        return;
      }
      // ---- 1.7.0：Level 29 海波利亚 ----
      case "jet29": {
        // 档案：「在 Level 7 的码头上找到一个水上摩托，用它在 Level 7 的海洋上行驶上百格。」
        // 不是骑上去就直接到 —— 得真的朝一个方向开出（或游出）500 格，天才会变成粉红色。
        if (g.jet29ride) {
          toast("你已经在海上了 —— 一路朝北，再走 " +
            Math.ceil(JET29_NEED - (g.jet29dist || 0)) + " 格。");
          return;
        }
        g.jet29ride = true;
        g.jet29dist = 0;
        g.jet29hint = 0;
        try { if (AudioSys.startEngine) AudioSys.startEngine(); } catch (e) { /* 忽略 */ }
        toast("你拧动钥匙，跨上摩托。一路朝北开出去 " + JET29_NEED +
          " 格 —— 天会变成粉红色，北面会浮出一块陆地。（不想骑，游过去也行）");
        return;
      }
      case "p29dock": {
        toast("一座建在岸边的小码头 —— 有人的第一句话是：「你从哪里来的？」");
        return;
      }
      case "p29boat": {
        if (g.onBoat29) {
          toast("已经在水上了 —— 接着往深海开。航程 " + Math.round(g.nm29 || 0) + " / 1500 海里。");
          return;
        }
        g.onBoat29 = true;
        g.nm29 = 0;
        toast("你解开缆绳。岛在身后一点点变小 —— 没有人能保证你回得来。");
        return;
      }
      case "p29almond": {
        const amt = 26;
        g.hp = clamp(g.hp + amt, 0, CONFIG.HP_MAX);
        g.sanity = clamp(g.sanity + 8, 0, CONFIG.SANITY_MAX);
        toast("你捧起来喝了一口 —— 甜的，带着一点山的味道。（生命 +" + amt + "）");
        return;
      }
      case "p29shed": {
        toast("门开着 —— 里头是农具和一袋袋的种子。镇上的人不会锁门。");
        return;
      }
      case "p29tower": {
        g.sanity = clamp(g.sanity + 6, 0, CONFIG.SANITY_MAX);
        toast("你爬上去 —— 岛在脚下铺开，山脉、农田、海波利亚的屋顶，一直到海岸线。");
        return;
      }
      case "p29office": {
        toast("大厅里挂着十几个社群的旗子 —— 谁也不服谁，但贸易照做。");
        return;
      }
      case "p29sign": {
        toast("木牌上刻着「海波利亚」，箭头指向岛的中心。");
        return;
      }
      case "p29villager": {
        const LINES = [
          "「外头来的？别往海上去 —— 去了的人没回来过。」",
          "「我们这儿有两万五千人，一万七千个不是人。没人觉得这有什么。」",
          "「你想找个政府？这儿有两百五十个。你想找哪个？」",
          "「山里的杏仁水随便喝，管够。」",
          "「克拉肯？它在睡。别去把它吵醒。」",
        ];
        toast(LINES[randInt(0, LINES.length - 1)]);
        return;
      }
      case "p29animal": {
        toast("它抬起头看了你一眼 —— 和你记得的那种不太一样，但又说不出哪里不一样。");
        return;
      }
      case "p29redtree": {
        toast("树皮硬得像金属。岛上的房子都是拿它盖的 —— 防火，也挡得住外头的东西。");
        return;
      }
      // ---- 1.7.0：Level 284 需汝之地 ----
      case "p284bed": {
        AudioSys.exitChime();
        goToLevel(g, 11, "你躺下去，睡着了",
          "醒来的时候，草的触感还在指尖 —— 而你已经在不夜城的街上。次晨苏醒于 Level 10 荒野？" +
          "不 —— 这一次，是 Level 11 ...");
        return;
      }
      case "p284radio": {
        g.sanity = clamp(g.sanity + 14, 0, CONFIG.SANITY_MAX);
        toast("音响里放着什么 —— 半融的冰块在水杯里晃动，脆响就在身后。");
        return;
      }
      case "p284food": {
        g.hp = clamp(g.hp + 22, 0, CONFIG.HP_MAX);
        g.sanity = clamp(g.sanity + 8, 0, CONFIG.SANITY_MAX);
        toast("你咬了一口 —— 烫，油，咸。荡漾在口里的味道，分毫不差。");
        return;
      }
      case "p284love": {
        n.p.held = true;
        g.sanity = clamp(g.sanity + 26, 0, CONFIG.SANITY_MAX);
        toast("「为何不来？我说过想更了解你啊。」—— 他的手是暖的，连戒指都完美复刻。");
        return;
      }
      case "p284rail": {
        g.sanity = clamp(g.sanity + 4, 0, CONFIG.SANITY_MAX);
        toast("你扶着栏杆往下看 —— 河一直在流。在你坠入后室前的所有生活里，它都在这儿。");
        return;
      }
      case "p284tree": {
        toast("你发誓自己在别的地方走过与这条完全相同的山路。");
        return;
      }
      case "p284lamp": {
        toast("仲夏的空气总是这般阴沉 —— 单凭这点就能判断此时季节。");
        return;
      }
      case "p284farlamp": {
        toast("对岸那个平台和你脚下这块一模一样 —— 中间隔着水，过不去。");
        return;
      }
      // ---- Level 31 旱冰场 ----
      case "p31card": {
        if (g.map) g.map.greenCard = true;
        n.p.given = true;
        toast("机器吐出一张绿色卡片 —— 凭它，游戏厅里所有游戏免费玩。");
        return;
      }
      case "p31arcade": {
        if (!g.map || !g.map.greenCard) {
          toast("这台机子要投币 —— 先去入口那台设备领一张绿色卡片。");
          return;
        }
        const nm = (n.p && n.p.game) || "机台";
        toast("你玩了一把 " + nm + "。");
        g.sanity = clamp(g.sanity + 6, 0, CONFIG.SANITY_MAX);
        return;
      }
      case "p31arcade40": {
        AudioSys.exitChime();
        goToLevel(g, 40, "你玩了一台标着 40 的游戏机",
          "屏幕一黑 —— 再亮起来时，你站在一间无限大的 80 年代游戏厅里 ...");
        return;
      }
      case "p31door70": {
        AudioSys.exitChime();
        goToLevel(g, 70, "你推开了那扇刻着 70 的白门",
          "教练说得对 —— 是时候走了。门那头是结着霜的街道 ...");
        return;
      }
      case "p31counter": {
        toast("员工什么也没要，直接把热狗和汽水递给了你。免费食物就是免费食物。");
        g.hp = clamp(g.hp + 22, 0, CONFIG.HP_MAX);
        if (Math.random() < 0.5) addItem("almond", 1);
        return;
      }
      case "p31drink": {
        toast("你接了一杯。杏仁水，还有前厅那种汽水 —— 味道都还在。");
        addItem("almond", 1);
        return;
      }
      case "p31bin": {
        toast("告示牌：「请将垃圾和剩余饭菜扔到这里！」—— 别把食物留在桌上。");
        return;
      }
      case "p31skates": {
        toast("你挑了一双合脚的旱冰鞋。地板是光滑的木料 —— 站稳了再滑。");
        return;
      }
      case "p31rental": {
        toast("柜台上有张美国尺码对照表。教练会从后面给你递鞋，还会教你别摔。");
        return;
      }
      case "p31tv": {
        toast("放的正是你最爱的那部片子 —— 熟悉，却又带着点新鲜感。");
        g.sanity = clamp(g.sanity + 14, 0, CONFIG.SANITY_MAX);
        return;
      }
      case "p31dj": {
        toast("DJ 台里的无面灵朝你点了点头，换了一首曲子。它不会说话。");
        return;
      }
      case "p31flap": {
        toast("你跨过翻板 —— 木地板变成了黑色的地毯。");
        return;
      }
      case "p31coach": {
        // 教练会一遍遍劝你别待太久
        const TALKS = [
          "「最近怎么样？」",
          "「你在《Fix-It Felix》的分超过最高纪录了吗？」",
          "「想试试新的溜冰技巧吗？」",
          "「在这里，你能建立的最重要的东西就是联结。」",
          "「我只是不想看到你像其他人那样受苦 —— 那些我没能帮到的人。」",
          "「你在这儿做了很多。是时候离开这里，展翅高飞了。」",
        ];
        const i = (g.map && g.map.coachTalk) || 0;
        if (g.map) g.map.coachTalk = i + 1;
        toast("教练：" + TALKS[i % TALKS.length]);
        if (i >= 3) toast("他一直在劝你走。别待太久 —— 这一层待久了，人会很奇怪地垮掉。");
        g.sanity = clamp(g.sanity + 6, 0, CONFIG.SANITY_MAX);
        return;
      }
      // ---- Level 40 摇滚披萨 ----
      case "p40arcade": {
        const nm = (n.p && n.p.game) || "机台";
        if (n.p && n.p.busy) {
          // 「消费者」正在用这台机器 —— 碰它会眩晕、昏迷数小时
          toast("手刚碰到机身，一阵眩晕上来 —— 你失去了意识。");
          g.hp = clamp(g.hp - 12, 0, CONFIG.HP_MAX);
          g.sanity = clamp(g.sanity - 20, 0, CONFIG.SANITY_MAX);
          return;
        }
        if (nm === "Starflare 上将：狂野太空") {
          toast("你越玩越入迷 —— 周围的一切都变得无关紧要了。");
          g.sanity = clamp(g.sanity - 18, 0, CONFIG.SANITY_MAX);
          return;
        }
        if (nm === "跌落尽头") {
          toast("关卡越来越不合常理。死在这游戏里的人，下次来之前不会复活。");
          g.hp = clamp(g.hp - 8, 0, CONFIG.HP_MAX);
          return;
        }
        toast("你玩了一把 " + nm + "。");
        g.sanity = clamp(g.sanity + 5, 0, CONFIG.SANITY_MAX);
        return;
      }
      case "p40vend": {
        toast("食物上抹着一层青柠色、微微发光的酱汁 —— 广告说它能还原任何一种味道。");
        g.hp = clamp(g.hp + 18, 0, CONFIG.HP_MAX);
        g.sanity = clamp(g.sanity - 4, 0, CONFIG.SANITY_MAX);
        return;
      }
      case "p40tv": {
        const ADS = [
          "「……隆重向您介绍 Starflare 上校通用酱汁！一切精彩只在摇滚披萨！」（广告突然黑屏随即中断。）",
          "「后室装修公司！还在担心家周围的死亡陷阱吗？我们会帮你留意！」（广告结束。）",
          "「The Sanity Sisters 在礼堂的演出票开始销售！去寻找办公室中的红色双开门吧！派对上见！」",
        ];
        toast(ADS[randInt(0, ADS.length - 1)]);
        return;
      }
      case "p40pat": {
        toast("Pat（说得很慢）：「……嘿。要、要不要来点披萨？我这儿、还有四只手可以帮忙。」");
        g.sanity = clamp(g.sanity + 8, 0, CONFIG.SANITY_MAX);
        return;
      }
      case "p40lane": {
        toast("你打了一局保龄球。场馆还在正常运作 —— 排行榜上的名字是随机的字母数字。");
        return;
      }
      case "p40score": {
        toast("排行榜上有几行用户名长到把屏幕撑崩了 —— 那些屏幕现在是一片红。");
        return;
      }
      case "p40office": {
        toast("木门后面是「仅供职员使用」的区域 —— 再往里是一间小休息室。");
        return;
      }
      case "p40restroom": {
        toast("卫生间还在正常运作。墙上没了宇宙风格的图案，只有蓝色。");
        return;
      }
      case "p40storage": {
        toast("仓库：堆满了糟糕的食品和玩具。现阶段认为这是一条「死胡同」。");
        return;
      }
      case "p40revolving": {
        // 档案：穿什么衣服出去，决定了去哪一层
        const d = (typeof currentOutfitDef === "function") ? currentOutfitDef(g) : null;
        const k = (d && d.key) || "drifter";
        let dst = 11, why = "流浪者的打扮";
        if (k === "hazmat") { dst = 9; why = "身上的生化防护服"; }
        else if (k === "electrician") { dst = 10; why = "身上的发电站检修服"; }
        else if (k === "ksuit") { dst = 11; why = "身上的全封闭防护服"; }
        AudioSys.exitChime();
        const NAMES = { 9: "Level 9 —— 郊区", 10: "Level 10 —— 丰裕", 11: "Level 11 —— 不夜城" };
        goToLevel(g, dst, "你走过了旋转门（" + why + "）",
          "旋转门转了一圈，把你吐到了外面 —— " + (NAMES[dst] || ("Level " + dst)) + " ...");
        return;
      }
      case "p40rusty": {
        AudioSys.exitChime();
        goToLevel(g, 1, "你推开了那扇生锈的金属门",
          "门轴吱呀一声 —— 门后是潮湿的黄地毯和嗡嗡作响的灯。这是 Level 1 ...");
        return;
      }
      // ---- Level 94 动画 ----
      case "p94fountain": {
        toast("喷泉里流淌的是杏仁水 —— 你捧起来喝了一口。带上些，城堡里用得着。");
        addItem("almond", 1);
        g.hp = clamp(g.hp + 10, 0, CONFIG.HP_MAX);
        return;
      }
      case "p94house": {
        toast("屋里的家具都是小一号的 —— 30 年代到 50 年代的样式，摆得整整齐齐。");
        return;
      }
      case "p94car": {
        toast((n.p && n.p.weird) ? "这车的比例不对 —— 轮子大得离谱，像是被人一笔笔画出来的。"
          : "一辆 30 年代的车，圆头圆脑。它不会动，但你总觉得它刚刚还在动。");
        return;
      }
      case "p94milk": {
        toast("车厢里是一瓶瓶杏仁奶 —— 你拿了一瓶。");
        addItem("almond", 1);
        return;
      }
      case "p94speaker": {
        const ph = (window.a94Phase && g.map) ? window.a94Phase(g.map, performance.now()) : { name: "day" };
        if (ph.name === "night") toast("喇叭彻底哑了。音乐完全停止 —— 它们要出来了。");
        else toast("喇叭里飘出欢快的卡通音乐 —— 在这一层，这声音意味着你现在是安全的。");
        g.sanity = clamp(g.sanity + 6, 0, CONFIG.SANITY_MAX);
        return;
      }
      case "p94tower": {
        toast("水塔里装的是杏仁水 —— 你灌了一瓶。");
        addItem("almond", 1);
        return;
      }
      case "p94furniture": {
        toast("草地上一套成套的家具，孤零零摆着。你坐了一下 —— 很舒服，也很不对劲。");
        return;
      }
      case "p94wall": {
        toast("就一面墙，孤零零立在这儿，旁边还摆着家具。没有房子，只有墙。");
        return;
      }
      case "p94shed": {
        toast("一间单间的房子。里面只有床和灯 —— 它不属于任何地方，只是被放在了这儿。");
        return;
      }
      case "p94castlegate": {
        toast("你走进了城堡。里面的房间主题都非常欢快 —— 别碰任何东西，机器人在看着。");
        return;
      }
      case "p94ballpit": {
        toast("你跳进了海洋球坑 —— 塑料球一直漫到胸口。");
        if (g.map) g.map.robotMad = true;
        g.sanity = clamp(g.sanity + 10, 0, CONFIG.SANITY_MAX);
        return;
      }
      case "p94playground": {
        toast("滑梯和秋千都还在自己动。秋千上没有风，也没有人。");
        if (g.map) g.map.robotMad = true;
        g.sanity = clamp(g.sanity + 10, 0, CONFIG.SANITY_MAX);
        return;
      }
      case "p94studio": {
        toast("台子上是一格格画好的画面 —— 这一层就是这么一帧帧做出来的。");
        if (g.map) g.map.robotMad = true;
        return;
      }
      case "p94minitown": {
        toast("一座微型的城镇 —— 里面是这一层那些实体的复制品，全都一动不动。");
        if (g.map) g.map.robotMad = true;
        return;
      }
      case "p94robot": {
        if (g.map && g.map.robotMad) {
          toast("机器人的眼睛变成红色 —— 它发现你碰过城堡里的东西了。");
          n.p.hostile = true;
          if (g.map.props) {
            for (const q of g.map.props) if (q.type === "p94robot") q.hostile = true;
          }
          return;
        }
        toast("一具 30 年代的老式机器人玩具，背后有个发条钥匙。它是这座城堡的守卫。");
        return;
      }
      case "p94throne": {
        // 王的考验：一场以动画形式让你感受自己噩梦的考验
        const pass = (g.sanity > 45) && (g.hp > 40);
        if (!pass) {
          toast("王看着你，笑了。噩梦以动画的形式演了一遍 —— 你没能撑住。");
          g.hp = clamp(g.hp - 24, 0, CONFIG.HP_MAX);
          g.sanity = clamp(g.sanity - 26, 0, CONFIG.SANITY_MAX);
          toast("「再试一次吧。」—— 他还没打算让你成为「动画」的一部分。");
          return;
        }
        if (g.map) g.map.trialDone = true;
        AudioSys.exitChime();
        const MAINS = [1, 4, 6, 9, 10, 11];
        const dst = MAINS[randInt(0, MAINS.length - 1)];
        goToLevel(g, dst, "你通过了王的考验",
          "他放出了一阵光 —— 光散去时，你已经不在城堡里了 ...");
        return;
      }
      // ---- 1.4.0：Level 0.1 天顶站 ----
      case "zenithrobot": {
        toast((n.p && n.p.line) ? n.p.line : "机器人没有理你。");
        return;
      }
      case "zenithbar": {
        const idx = (g.map.props || []).indexOf(n.p);
        if (idx >= 0) g.map.props.splice(idx, 1);
        g.inv.energybar = (g.inv.energybar | 0) + 1;
        g.hp = Math.min(100, (g.hp || 0) + 30);
        g.sanity = Math.min(100, (g.sanity || 0) + 25);
        try { updateBag(); updateHud(); renderHotbar(); } catch (e) { /* 忽略 */ }
        try { if (AudioSys.pickup) AudioSys.pickup(); } catch (e) { /* 忽略 */ }
        toast("收下 能量棒 ×1 —— 身上和脑子都松快了一点");
        return;
      }
      // ---- 隐秘层级：战地医院（14h） ----
      case "medcab14h": {
        const pp = n.p || {};
        if (pp.used) { toast("柜子已经空了 —— 玻璃门后面只剩下灰尘。"); return; }
        pp.used = true;
        const roll = randInt(0, 2);
        try { if (AudioSys.pickup) AudioSys.pickup(); } catch (e) { /* 忽略 */ }
        if (roll === 0) {
          g.hp = Math.min(100, (g.hp || 0) + 25);
          toast("这一次是真的 —— 伤口确实在合。你在这一层里第一次走了运。");
        } else if (roll === 1) {
          g.hp = Math.min(100, (g.hp || 0) + 10);
          g.sanity = Math.max(0, (g.sanity || 0) - 20);
          toast("伤口在合 —— 可脑子里多出了一些不属于你的东西。");
        } else {
          g.hp = Math.max(1, (g.hp || 0) - 10);
          g.sanity = Math.max(0, (g.sanity || 0) - 12);
          toast("针管里不知道是什么 —— 打进去的那一刻你就后悔了。");
        }
        try { updateHud(); } catch (e) { /* 忽略 */ }
        return;
      }
      case "ghost14h": {
        g.sanity = Math.max(0, (g.sanity || 0) - 3);
        try { updateHud(); } catch (e) { /* 忽略 */ }
        const kind = (n.p && n.p.kind === "nurse") ? "护士" : "伤员";
        toast("你的手从那个" + kind + "的身体里穿了过去 —— 它连看都没看你一眼。");
        return;
      }
      case "ceiling14h": {
        toast("你踩着碎木往上够 —— 上面只有一片黑。那里不是出路。");
        return;
      }
      case "exitwall14h": {
        AudioSys.exitChime();
        goToLevel(g, 287, "碰上了那一段黑白相间的墙",
          "墙在身后合上 —— 你跌进了一条两侧全是黑门的走廊。");
        return;
      }
      case "stairs289h": {
        AudioSys.exitChime();
        goToLevel(g, "14h", "顺着那段楼梯走了下去",
          "楼梯尽头是一股血和呕吐物的味道 —— 墙上是覆着污垢的蓝瓷砖。");
        return;
      }
      // ---- 1.4.0：Level 289 过载 ----
      case "p289shaft": {
        const z0 = g.map.zones && g.map.zones[0];
        if (!z0) { toast("竖井底下是一片黑 —— 你没敢跳。"); return; }
        g.player.x = (z0.x0 + 3 + 0.5) * TILE;
        g.player.y = (Math.floor(g.map.size / 2) + 0.5) * TILE;
        toast("你跳了下去 —— 落回那片浑水里。水池还是老样子。");
        return;
      }
      case "p289pass": {
        const pp = n.p || {};
        const zi = (pp.to != null ? pp.to : 0);
        const ptx = Math.floor(g.player.x / TILE), pty = Math.floor(g.player.y / TILE);
        const cur = g.map.zoneOf ? g.map.zoneOf.get(ptx + "," + pty) : -1;
        if (cur === zi) { toast("走廊在你身后合上了 —— 你回不去刚才那一区。"); return; }
        const z = g.map.zones && g.map.zones[zi];
        if (!z) return;
        g.player.x = (z.x0 + 3 + 0.5) * TILE;
        g.player.y = (Math.floor(g.map.size / 2) + 0.5) * TILE;
        toast("走廊在身后合上 —— 你走进了下一个子区。");
        return;
      }
      // ---- 1.2.0：Level 11 的霓虹雾 <-> 新时代广场 ----
      case "blackdoor287": {
        // 大多数门根本不通别处 —— 推开来还是这条走廊，只是把你吐到了另一段。
        // 真正的出口只有 3 扇（0 / 2 / 484），门牌就写在门板上。
        if (n.p && n.p.warp287) {
          const gy = (g.map.cy287 != null ? g.map.cy287 : Math.floor(g.map.size / 2));
          const nx = randInt(6, g.map.size - 7);
          g.player.x = (nx + 0.5) * TILE;
          g.player.y = (gy + 0.5) * TILE;
          toast("门后不是别的层级 —— 还是这条走廊，只是往前挪了一大段。");
          return;
        }
        const to = (n.p && n.p.toLevel != null) ? n.p.toLevel : 0;
        AudioSys.exitChime();
        const df = levelDef(to);
        goToLevel(g, to, "推开了那扇纯黑的门",
          "门在身后合上 —— " + (df && df.name ? df.name : ("Level " + to)) + " ...");
        return;
      }
      // ---- 蓝色通道：虚空中撞见的那扇门 ----
      case "bluedoor": {
        const pool = [0, 1, 4, 11, 18, 25];
        const to = pool[randInt(0, pool.length - 1)];
        AudioSys.exitChime();
        const df = levelDef(to);
        goToLevel(g, to, "推开了那扇悬在虚空里的门",
          "蓝色在身后合拢 —— 你落回了 " + (df && df.name ? df.name : ("Level " + to)) + " ...");
        return;
      }
      case "neonfog11":
        AudioSys.exitChime();
        goToLevel(g, "newera", "走进了那团霓虹雾",
          "雾散开，眼前是一片开阔的广场 —— 彩色招牌亮着，柜台后面有人朝你招手。B.N.T.G 的新时代广场。");
        return;
      case "deadpool10":
        AudioSys.exitChime();
        goToLevel(g, "10.1", "走进了那潭死水",
          "水没过膝盖 —— 抬起来的时候，脚上的皮跟着一起下来了。这是尸湖，水里的东西不打算让你活着回去。");
        return;
      case "neonfogexit":
        AudioSys.exitChime();
        goToLevel(g, 11, "退回了那团霓虹雾",
          "招牌和叫卖声一起淡下去 —— 你又站在那条永远走不到头的城市街道上了。");
        return;
      // ---- 1.2.0：B.N.T.G 柜台 ----
      case "bntgcounter":
        openBntgShop();
        return;
      case "coffeecart":
        openCoffeeCart();
        return;
      case "gate36": {
        const gp = n.p;
        const cd = (gp && gp.countdown != null) ? gp.countdown : 9999;
        if (cd <= 0) { toast("这班已经走了 —— 门口的黑屏灭了，等下一班"); return; }
        if (cd > 1000) { toast("还在候机 —— 倒计时归到 1000 才开始登机（现在 " + Math.round(cd) + "）"); return; }
        // 记下这一班的目的地，客机落地就到那儿
        g.flightDest = gp.dest != null ? gp.dest : null;
        const dn = g.flightDest != null ? coffeeLevelName(g.flightDest) : "一个没人记录过的地方";
        AudioSys.exitChime();
        goToLevel(g, "36.1", "登上了 " + (gp.flight || "这班飞机"),
          "安全带指示灯亮着。窗外什么也看不见 —— 目的地是" + dn + "。");
        return;
      }
      case "exit361": {
        const dest = (m.dest != null) ? m.dest : null;
        AudioSys.exitChime();
        if (dest == null || !coffeeLevelExists(dest)) {
          // 没人记录过的航班 —— 把你扔到一个随机的地方
          const rd = coffeeRandomLevel();
          goToLevel(g, rd, "走下了飞机",
            "机舱的灯重新亮起来。窗外那片白散开 —— 是" + coffeeLevelName(rd) + "。");
          return;
        }
        goToLevel(g, dest, "走下了飞机",
          "机舱的灯缓缓重新亮起。你带着一身时差踩出去 —— " + coffeeLevelName(dest) + " ...");
        return;
      }
      // ---- Level 15.1 枉然：仿真设备 ----
      case "blocked13": {
        try { AudioSys.growl(); } catch (e) { /* 忽略 */ }
        toast("「封锁区，不准进。」守卫把你推了回来 —— 得找个他看不见的空子。");
        return;
      }
      case "pod151": {
        // 设备里什么都有 —— 先挑想模拟哪一种（摘下之后可以重新挑）
        openSimSelect();
        return;
      }
      case "sim151out": {
        g.sim151 = null;
        try { AudioSys.exitChime(); } catch (e) { /* 忽略 */ }
        toast("你自己摘下了设备 —— 又回到了这片没有意义的现实");
        return;
      }
      case "ctrldoor151": {
        const LINES = [
          "你凑到观察孔前。孔里是几个模糊的身影，站在一台大得离谱的设备前。",
          "你想看得更清楚些 —— 可那几个身影始终看不清，像是一直没对准焦。",
          "（有人在里面。他们的脑图谱正被传进这台设备里。至于传给谁 —— 没人知道。）",
        ];
        g.sanity = Math.max(0, (g.sanity || 0) - 6);
        try { AudioSys.growl(); } catch (e) { /* 忽略 */ }
        toast(LINES[Math.floor(Math.random() * LINES.length)]);
        return;
      }
      case "queue151": {
        const LINES = [
          "「别排了，」他头也不抬，「前面还有三百多个。」",
          "他指着入口那本登记簿：「名字写上去，就等着。等到哪台空出来，就轮到你。」",
          "「我排了多久？」他想了想，「记不清了。反正轮到我的时候，我就会知道我想要什么了。」",
          "「有的人等不及，」他压低声音，「就自己去摘别人的设备。那一摘 —— 人就没了。」",
        ];
        try { AudioSys.growl(); } catch (e) { /* 忽略 */ }
        toast(LINES[Math.floor(Math.random() * LINES.length)]);
        return;
      }
      case "screen151": {
        const g2 = game;
        const pods = (g2.map && g2.map.props) ? g2.map.props.filter((p) => p.type === "pod151").length : 0;
        try { AudioSys.click(); } catch (e) { /* 忽略 */ }
        toast("屏幕被切成 " + pods + " 块小格 —— 每一格里躺着一个人，脑图谱正一行行往上跳。他们看上去都很幸福。");
        return;
      }
      // ---- Level 20 波瑞阿斯建筑 ----
      case "l20locker": {
        const pp = n.p || {};
        if (pp.opened) { toast("柜门开着 —— 里面已经被翻空了。"); return; }
        pp.opened = true;
        const rich = pp.rich || 1;
        const nSoda = randInt(0, rich), nChoc = randInt(0, rich);
        try { if (AudioSys.pickup) AudioSys.pickup(); } catch (e) { /* 忽略 */ }
        if (nSoda <= 0 && nChoc <= 0) { toast("柜子里是空的 —— 只有一层灰。"); return; }
        if (nSoda > 0) addItem("soda", nSoda);
        if (nChoc > 0) addItem("choc", nChoc);
        const bits = [];
        if (nSoda > 0) bits.push("软饮料 ×" + nSoda);
        if (nChoc > 0) bits.push("巧克力棒 ×" + nChoc);
        toast("柜门吱呀一声开了 —— " + bits.join("、"));
        try { updateBag(); updateHud(); renderHotbar(); } catch (e) { /* 忽略 */ }
        return;
      }
      case "l20vend": {
        if ((g.inv.bntgcoin | 0) < 2) { toast("售货机只认 B.N.T.G 货币 —— 你身上不够 2 枚"); AudioSys.growl(); return; }
        g.inv.bntgcoin -= 2;
        if ((g.inv.bntgcoin | 0) <= 0) delete g.inv.bntgcoin;
        addItem("soda", 1);
        try { if (AudioSys.pickup) AudioSys.pickup(); } catch (e) { /* 忽略 */ }
        toast("投进去 2 枚 —— 一罐软饮料滚了出来");
        try { updateBag(); updateHud(); renderHotbar(); } catch (e) { /* 忽略 */ }
        return;
      }
      case "l20fount": {
        addItem("almond", 1);
        try { if (AudioSys.drink) AudioSys.drink(); } catch (e) { /* 忽略 */ }
        toast("接了一瓶杏仁水 —— 喷泉的水柱一直没有停过");
        try { updateBag(); updateHud(); renderHotbar(); } catch (e) { /* 忽略 */ }
        return;
      }
      case "l20window": {
        // 窗户通往 Level 78 空间站（之前拿不存在的 Level 24 顶成 484，是错的）。
        // Level 24 的入口另在 Level 57 那副月亮的画里。
        AudioSys.exitChime();
        goToLevel(g, 78, "切进了那扇窗",
          "玻璃后面不是虚空 —— 星在你眼前翻了个个儿，你被甩进一座残破的空间站 ...");
        return;
      }
      case "l20jelly": {
        toast("手指陷进去 —— 温的，还在轻轻发抖。它没有任何味道，也没有弄脏你的手。");
        return;
      }
      case "l20game": {
        playGame20(g, n.p);
        return;
      }
      // ---- Level 78 空间站 ----
      case "p78hatch": {
        const ph = n.p, mh = g.map;
        if (mh.hatch78 && !mh.hatch78.open) {
          mh.hatch78.open = true;
          ph.open = true;
          const gx = ph.x | 0, gy = ph.y | 0;
          const layer = mh.layers[g.floor | 0] || mh.layers[0];
          if (layer && layer[gy]) layer[gy][gx] = 0;     // 门这一格由墙变地板
          g.rad78Tick = 0;
          const suited = (typeof hasKSuit === "function" && hasKSuit(g)) || String(g.outfit) === "hazmat";
          toast(suited
            ? "舱门开了 —— 全封闭防护服挡下一半，辐射仍是每秒 10 点"
            : "舱门开了 —— 高剂量辐射涌了进来，每秒 20 点，快找救生舱");
          try { AudioSys.exitChime(); } catch (e) { /* 忽略 */ }
        } else {
          toast("舱门已经开着 —— 辐射还在往外漏");
        }
        return;
      }
      case "cabindoor1000": {
        try { unlockEnding(12); } catch (e) { /* 忽略 */ }
        showEnding(12, "你推开了木屋的门 —— 屋子里很安静，而且再也没人找得到你。");
        return;
      }
      case "p78pod": {
        const p = n.p;
        if (p.real) {
          AudioSys.exitChime();
          goToLevel(g, 11, "钻进了那间救生舱",
            "舱门在身后合上 —— 你从 Level 11 一扇随机的门里走了出来 ...");
        } else {
          // 舷窗里不是街道 —— 虚空会把你肺里的氧气抽干
          g.deathCause = "你钻进了一间舷窗里没有街道的救生舱 —— 虚空抽干了你肺里的氧气";
          showDead();
        }
        return;
      }
      case "p78dense": {
        AudioSys.exitChime();
        goToLevel(g, 599, "凑近了那扇星多得反常的舷窗",
          "玻璃后面不是星 —— 是一片正在翻滚的、白得刺眼的等离子体 ...");
        return;
      }
      case "p78sep": {
        toast("他浮在里面，眼睛还睁着。舱是开着的 —— 谁也没有关上它。他的肺早就被抽干了。");
        g.sanity = Math.max(0, (g.sanity || 0) - 6);
        return;
      }
      case "p78porthole": {
        const LINES78 = [
          "窗外只有星。没有地球，没有月亮，也没有太阳。",
          "这一扇的星空，和刚才那一扇不一样。",
          "有一颗星在你看着的时候挪了一格。你确定它挪了。",
          "……你听见有人在你后面哼歌。回头的时候，什么也没有。",
          "从这里望出去，看不见空间站的任何一部分 —— 只有星。",
        ];
        toast(LINES78[Math.floor(Math.random() * LINES78.length)]);
        g.sanity = Math.max(0, (g.sanity || 0) - 2);
        return;
      }
      // ---- Level 45 深渊公司 ----
      case "p45escape": {
        try { AudioSys.click && AudioSys.click(); } catch (e) { /* 忽略 */ }
        toast("铁格栅在脚下晃了一下 —— 外面没有重力，别停，也别往下看。");
        return;
      }
      case "p45pen": {
        const LINES45 = [
          "玻璃后面那东西一直在看你。它不眨眼。",
          "「第 7 号样本 · 自 Level 6 引入 · 禁止投喂」—— 标签上的字是手写的。",
          "它抬起头了。你往后退了一步，它没动 —— 它只是在等你先动。",
          "围栏上有一道抓痕，从顶上一直划到底。抓痕比你的手掌还宽。",
          "B.R.C. 把它们从别的层级弄来，只为看看它们在真空里能活多久。",
        ];
        toast(LINES45[Math.floor(Math.random() * LINES45.length)]);
        g.sanity = Math.max(0, (g.sanity || 0) - 3);
        return;
      }
      case "p45sculpt": {
        const LINES45S = [
          "硬的一声 —— 塑料。做得太像了，像到你差点伸手去拧它。",
          "水冷器是实心的。你敲了敲，里面没有水，只有塑料。",
          "电脑的屏幕是一块画上去的亮面。键盘是一整块。",
          "整栋楼里每一件东西都是这个 —— 精致的塑料雕塑。设备得自己带。",
          "植物也是。叶子硬得像铁皮，你掰不动一片。",
        ];
        try { AudioSys.click && AudioSys.click(); } catch (e) { /* 忽略 */ }
        toast(LINES45S[Math.floor(Math.random() * LINES45S.length)]);
        return;
      }
      // ---- 通用门：任何带 toLevel 的物件 ----
      case "genericdoor": {
        const to = n.p.toLevel;
        const df = levelDef(to);
        AudioSys.exitChime();
        goToLevel(g, to, "推开了那扇门",
          "门在身后合上 —— " + (df && df.name ? df.name : ("Level " + to)) + " ...");
        return;
      }
      case "confess999":
        openConfess();
        return;
      case "facelingnpc": {
        // 广场上的无面灵：它不伤人，也不跟着你 —— 只是站着，肯回你一句
        const LINES = [
          "……（它转过头来看你。脸上什么都没有。）",
          "「杏仁水在柜台那边。」（声音很平，像是从很远的地方传来的。）",
          "「别往东边走。」（说完它就不动了。）",
          "「我在这儿站了很久了 —— 久到记不清原来要去哪儿。」",
          "……（它慢慢摇了摇头。你看不出那是什么意思。）",
          "「你要是看见了雾，别怕。那只是回去的路。」",
        ];
        const i = Math.floor(Math.random() * LINES.length);
        try { AudioSys.pickup(); } catch (e) { /* 忽略 */ }
        toast(LINES[i]);
        return;
      }
      case "book": {
        // 必须捡起来才能插进凹槽 —— 捡走之后书架这一格就空了，书进快捷槽
        const b = n.p;
        const CN0 = { red: "红", blue: "蓝", green: "绿", purple: "紫" };
        if (!b || b.got) return;
        b.got = true;
        g.carryBooks = g.carryBooks || [];
        g.carryBooks.push({ color: b.color, digit: b.digit });
        m.books = (m.books || []).filter((x) => x !== b);
        m.props = (m.props || []).filter((x) => x !== b);
        m.seqBook = (m.seqBook || 0) + 1;
        try { AudioSys.pickup(); } catch (e) { /* 忽略 */ }
        toast("捡到了" + CN0[b.color] + "色的书 —— 封面上写着 " + b.digit + "（" + m.seqBook + "/4）");
        return;
      }
      case "groove": {
        const gr = n.p;
        const CN = { red: "红", blue: "蓝", green: "绿", purple: "紫" };
        if (gr.done) { toast("这一格已经插进去了"); return; }
        const ORDER = ["purple", "red", "green", "blue"];
        const want = ORDER[m.seqGroove || 0];
        if (!want) return;
        if (gr.color !== want) { toast("顺序不对 —— 这一轮该插" + CN[want] + "色的那本"); return; }
        const held = g.carryBooks || [];
        const i2 = held.findIndex((b) => b.color === gr.color);
        if (i2 < 0) { toast("你手上没有" + CN[gr.color] + "色的书 —— 先去书架上把它捡起来"); return; }
        held.splice(i2, 1);
        gr.done = true;
        m.seqGroove = (m.seqGroove || 0) + 1;
        try { AudioSys.pickup(); } catch (e) { /* 忽略 */ }
        toast(CN[gr.color] + "色的书插了进去（" + m.seqGroove + "/4）");
        if (m.seqGroove >= 4) toast("四本书都归位了 —— 那扇深色的门开了");
        return;
      }
      case "exist": {
        if (m.doomed) { toast("门已经锁上了 —— 潮水不会放过你"); return; }
        AudioSys.exitChime();
        // 原路返回，并把这个层级从记录里抹掉（"有关该层级的信息"会被清除）
        try {
          const vs = JSON.parse(localStorage.getItem("br_visited") || "[]");
          localStorage.setItem("br_visited", JSON.stringify(vs.filter((x) => String(x) !== "994")));
        } catch (e) { /* 忽略 */ }
        for (const a of (g.archives || [])) if (String(a.level) === "994") a.taken = true;
        goToLevel(g, 11, "从那扇 EXIST 的门走了回去",
          "沙滩在身后合上 —— 你回到了 Level 11。关于它的事，你什么都不记得了 ...");
        return;
      }
      case "stairTop":
        if (!m.reachedTop) {
          m.reachedTop = true;
          AudioSys.exitChime();
          toast("最上面被水泥封死了 —— 往下看，最下方变成了白色。");
        } else toast("还是封死的。");
        return;
      case "midHole":
        AudioSys.exitChime();
        goToLevel(g, "9223372036854775807.-1", "从中间的空洞跳了下去",
          "没有坠落感，只有很长很长的、暖白色的安静 ...");
        return;
      case "whiteHole": {
        // 废弃了原来"跳进白光 = 回到现实"的结局 —— 层级本身不删，
        // 但白光不再通向现实：你落到 Level 11 不夜城，然后在那里精神崩溃。
        AudioSys.exitChime();
        g._breakdown = { left: 4.2 };          // 到 Level 11 之后开始崩
        goToLevel(g, 11, "你跳进了那片白色",
          "没有坠落感，只有很长很长的、暖白色的安静。\n"
          + "再睁眼 —— 你站在一条街上。霓虹亮着，可这里一个人也没有。");
        return;
      }
      case "junctionHole":
        AudioSys.exitChime();
        unlockEnding(5);
        showEnding(5, "交接点。忘却后室的记忆，来到一片虚假的现实。我真的回来了吗？");
        return;
      case "exist11":
        AudioSys.exitChime();
        goToLevel(g, 994, "推开那扇标着 EXIST 的门",
          "海风迎面扑来，太阳快碰到远处的海了 —— 你走进了 Level 994 ...");
        return;
      case "exitbang":
        AudioSys.exitChime();
        // 以前通向 Level 109，而 109 当时没有出口 —— 两条路一接就成了
        // "109 -> ! -> 109" 的死循环，进得去出不来。现在回 Level 0。
        goToLevel(g, 0, "推开了那扇 EXIT 大门",
          "门在身后合上，红灯和警报一瞬间全断了 —— 你跌回那片熟悉的黄地毯上。");
        return;
      case "enddoorEx":
        AudioSys.exitChime();
        goToLevel(g, 109, "推开了走廊尽头的门",
          "门在身后合上 —— 你回到了 Level 109 ...");
        return;
      case "reddoorEx":
        AudioSys.exitChime();
        goToLevel(g, "bang", "推开了那扇红色的门",
          "红灯在头顶一盏盏亮起来，警报拉响 —— 身后的黑暗里有东西冲了出来。");
        return;
      case "door37":
        AudioSys.exitChime();
        goToLevel(g, 37, "推开那扇标着 37 的门",
          "门后是白得发亮的瓷砖，和永不停歇的水声 —— Level 37 ...");
        return;
      case "guarddoor25":
        AudioSys.exitChime();
        goToLevel(g, 25, "推开了那扇像橱柜的门",
          "门后是一排排落满灰的游戏机 —— Level 25 · 四分之一枢纽 ...");
        return;
      case "graydoor484":
        AudioSys.exitChime();
        goToLevel(g, 485, "推开了那扇灰色的门",
          "门在你身后锁上了 —— 白房子不见了，四周是被烧毁的木板和霉味 —— Level 485 ...");
        return;
      case "irondoor04":
        AudioSys.exitChime();
        goLevel1(g, 0, "白色铁门");
        return;
      case "book": {
        // 必须按 蓝→红→紫→绿 的顺序
        const want = ["blue", "red", "purple", "green"][m.seqBook];
        if (n.p.color === want) {
          m.seqBook++;
          AudioSys.door(true);
          if (m.seqBook >= 4) { toast("四本书的数字对上了 —— EXIT 的门开了"); }
          else toast("第 " + m.seqBook + " / 4 本 —— 继续");
        } else {
          m.seqBook = 0;
          toast("顺序不对 —— 得从蓝色的那本重新开始");
        }
        return;
      }
      case "groove": {
        const want = ["purple", "red", "green", "blue"][m.seqGroove];
        if (n.p.color === want) {
          m.seqGroove++;
          n.p.done = true;
          AudioSys.door(true);
          if (m.seqGroove >= 4) toast("四块凹槽都放好了 —— 深色门开了");
          else toast("第 " + m.seqGroove + " / 4 块");
        } else {
          m.seqGroove = 0;
          for (const gr of (m.grooves || [])) gr.done = false;
          toast("顺序不对 —— 凹槽全弹了回来");
        }
        return;
      }
      case "exitDoorEnd":
        if (m.seqBook < 4) { toast("门锁着 —— 先把四本书按顺序翻开"); return; }
        AudioSys.exitChime();
        unlockEnding(6);
        showEnding(6, "门后面确实是 Level 0 的黄色墙纸。"
          + "可你怎么也想不起自己是怎么走到这一步的。");
        return;
      case "darkDoorEnd":
        if (m.seqGroove < 4) { toast("门纹丝不动 —— 凹槽还是空的"); return; }
        AudioSys.exitChime();
        goToLevel(g, "9223372036854775807", "推开了那扇深色门",
          "门后是一段望不到头的楼梯，深色混凝土 —— 你开始往上爬 ...");
        return;
      // ================= 1.9.0：Level 24 月球 =================
      case "p24miner": {
        // 档案：在塑料矿场里，当你找不到出口时，矿工会为你指引一扇门到 Level 1
        AudioSys.exitChime();
        const talk = (n.p.talk || 0) % 3;
        n.p.talk = talk + 1;
        if (talk === 0) {
          toast("矿工抬头看了你一眼：「找不到出去的路了？跟我来 —— 那扇门通 Level 1。」");
          goToLevel(g, 1, "矿工为你指了一扇门",
            "他推开一扇不起眼的门 —— 门后是 Level 1 那熟悉的地毯和嗡嗡声 ...");
          return;
        }
        if (talk === 1) {
          toast("「三支采矿队，三日轮班。日均三百吨塑料。」他拍了拍身边的货箱。");
          return;
        }
        toast("「工场还在招人。要是你打算留下 —— 去找主管领张调岗申请表。」");
        return;
      }
      case "p24notice": {
        toast("招聘告示：随着产品需求持续增长，现正式批准增建采矿竖井及队员生活区。"
          + "有意调任者，请向现任主管申领调岗申请表。");
        return;
      }
      case "p24shaft": {
        toast("竖井深不见底 —— 底下的灯一盏盏排下去，看不出尽头。日开采量近三百吨。");
        return;
      }
      case "p24mite": {
        toast("一只月螨 —— 比你的手掌还大。它察觉到你，慢吞吞地往旁边挪开了：它们会主动避开人。");
        return;
      }
      case "p24egg": {
        toast("一枚乳白色的虫卵。物资短缺的时候，没有过敏症状的人会拿它当应急食物。");
        addItem("almond", 1);
        toast("你把它收进了包里（当作一份应急口粮）。");
        return;
      }
      case "p24burrow": {
        toast("月螨挖的浅洞。洞不深 —— 边上还堆着刨出来的土。");
        return;
      }
      case "p24plastic": {
        toast("开采出来的塑料原料。这些材料最终会被制成武器、日用品、电子设备。");
        return;
      }
      case "p24bunk": {
        toast("一张床铺 —— 三支采矿队轮班睡这儿。床垫上还留着体温。");
        g.sanity = clamp(g.sanity + 6, 0, CONFIG.SANITY_MAX);
        return;
      }
      case "p24crate": {
        toast("一只货箱 —— 里面是备件和口粮。");
        if (randInt(0, 1) === 0) { addItem("almond", 1); toast("你翻出了一瓶杏仁水。"); }
        return;
      }
      case "p24bookshelf": {
        toast("一架维多利亚式的书架。书脊上的字你都认得，可抽出来全是白纸。");
        return;
      }
      case "p24desk": {
        toast("一张书桌。抽屉里有一支蘸水笔，笔尖还是湿的。");
        return;
      }
      case "p24globe": {
        toast("一座地球仪 —— 你转了一下。上面没有地球，只有一片空白的浅灰。");
        return;
      }
      case "p24fire": {
        toast("壁炉里的火是假的，塑料做的 —— 可你伸出手去，确实是暖的。");
        g.sanity = clamp(g.sanity + 8, 0, CONFIG.SANITY_MAX);
        return;
      }
      case "p24lamp": {
        toast("你拧亮了台灯。灯光很稳 —— 这里不像会停电。");
        return;
      }
      case "p24chair": {
        toast("你坐进扶手椅。皮面上有一层薄薄的铅灰 —— 是沙暴留下的。");
        g.sanity = clamp(g.sanity + 5, 0, CONFIG.SANITY_MAX);
        return;
      }
      // ================= 1.9.0：Level 56 冷冻致伤 =================
      case "p56cave57": {
        AudioSys.exitChime();
        goToLevel(g, 57, "你走进了那处加宽的洞穴",
          "雪地上留着别人的脚印 —— 走出去，是明亮的白墙和一幅幅画 · Level 57 ...");
        return;
      }
      case "p56airlock78": {
        AudioSys.exitChime();
        goToLevel(g, 78, "你推开了那扇气闸门",
          "M.E.G 不建议任何人进去 —— 门在身后合上，外面是没有地球、没有月亮的星 ...");
        return;
      }
      case "p56crate": {
        // 档案：木箱通常会被钉住，需要用专门的工具来撬开
        if (n.p && n.p.opened) { toast("这只箱子已经空了。"); return; }
        if (!hasTool56(g)) {
          toast("箱子被钉死了。徒手掰不开 —— 得找一把斧头或撬棍。");
          return;
        }
        if (n.p) n.p.opened = true;
        toast("你撬开了箱盖 —— 里面是一件改良防寒服，像现代宇航服。");
        g.coldSuit56 = true;
        g.hp = clamp(g.hp + 10, 0, CONFIG.HP_MAX);
        toast("穿上它，才敢往中心走（防寒服已生效）。");
        return;
      }
      case "p56flag": {
        toast("一面红色旗帜 —— 前哨 A 和中心之间就靠这些旗子指路。救援队沿着它们来找人。");
        return;
      }
      case "p56outpost": {
        toast("一处 M.E.G 冰川前哨。特工们配备了各种无需热量就能击发的武器 —— 这里生不了火。");
        g.sanity = clamp(g.sanity + 12, 0, CONFIG.SANITY_MAX);
        return;
      }
      case "p56fossil": {
        toast("一具冻在冰里的实体化石，被一种丝状材料紧紧裹着。它死的时候还在往中心爬。");
        g.sanity = clamp(g.sanity - 5, 0, CONFIG.SANITY_MAX);
        return;
      }
      case "p56icicle": {
        toast("你敲了一下冰柱。它掉了下来 —— 擦着你的肩膀砸在地上，碎成一片。");
        g.hp = clamp(g.hp - 8, 0, CONFIG.HP_MAX);
        return;
      }
      case "p56canister": {
        // 档案：在未事先检查内容物的情况下，请勿饮用在此层级中发现的任何液体
        const r = randInt(0, 2);
        if (r === 0) {
          toast("你先看了看 —— 是杏仁水。");
          g.hp = clamp(g.hp + 22, 0, CONFIG.HP_MAX);
          g.sanity = clamp(g.sanity + 10, 0, CONFIG.SANITY_MAX);
        } else if (r === 1) {
          toast("液氮。你没喝 —— 光是凑近看，睫毛就结了一层白霜。");
        } else {
          toast("你没检查就喝了一口。无色无味 —— 可你的舌头立刻失去了知觉。");
          g.hp = clamp(g.hp - 14, 0, CONFIG.HP_MAX);
        }
        return;
      }
      case "p56hole": {
        toast("洞里很黑，有东西在动。有实体在这儿挖了窝 —— 别再往里看了。");
        g.sanity = clamp(g.sanity - 8, 0, CONFIG.SANITY_MAX);
        return;
      }
      // ================= 1.9.0：Level 57 白日美术馆 =================
      case "p57moon": {
        AudioSys.exitChime();
        goToLevel(g, 24, "你切进了那副月亮的画",
          "颜料在眼前化开 —— 再落地时，脚下是三十米厚的铅基浅灰色涂料 · Level 24 ...");
        return;
      }
      case "p57door21": {
        AudioSys.exitChime();
        goToLevel(g, 21, "你推开了那扇门",
          "门在身后合上 —— 外面是不夜城的街道 · 你回到了 Level 21 ...");
        return;
      }
      case "p57painter": {
        const LINES57 = [
          "「欢迎来到展览！这里为每个人皆有画可赏析 —— 从抽象到写实，还有介于其间的所有。」",
          "「我们还有位即将莅临的特邀画家呢 —— 可别错过了。」",
          "她谈起画作口若悬河，却对自己掌控这座美术馆的方式讳莫如深。",
          "「布局每次都会变。你回头再看，就会发现自己站在一间没见过的展厅里。」",
        ];
        toast(LINES57[randInt(0, LINES57.length - 1)]);
        g.sanity = clamp(g.sanity + 10, 0, CONFIG.SANITY_MAX);
        return;
      }
      case "p57muralist": {
        // 档案里那句咒语是 [内容不可用]
        toast("她用二十世纪的观剧镜检查着画，没有回头。白纱下面，那张蓝色陶制面具一动不动。");
        toast("（在她喘息的掩盖下，她复述着一段咒语 —— 然而内容不可用。）");
        g.sanity = clamp(g.sanity - 3, 0, CONFIG.SANITY_MAX);
        return;
      }
      case "p57counter": {
        toast("前台兼作吧台 —— 你要了一杯杏仁水。这里没有食物供应。");
        addItem("almond", 1);
        return;
      }
      case "p57seat": {
        toast("你在金属座椅上坐了一会儿。边上是个空杂志架 —— 一本杂志也没有。");
        g.sanity = clamp(g.sanity + 6, 0, CONFIG.SANITY_MAX);
        return;
      }
      case "p57window": {
        toast("细软的熙光自窗帘处透进来。窗外并没有什么风景 —— 只是光。");
        g.sanity = clamp(g.sanity + 8, 0, CONFIG.SANITY_MAX);
        return;
      }
      case "p57plant": {
        toast("一株盆栽，摆在悬空的书架上。叶子是真的。");
        return;
      }
      case "p57statue": {
        toast("一尊古典式雕塑。石膏的表面很新 —— 像是昨天才立在这儿的。");
        return;
      }
      case "p57pestle": {
        toast("一支裹满灰浆的研磨杵。灰浆已经干透了，抠不下来。");
        return;
      }
      case "p57shelf": {
        toast("一架书架。书都能抽出来，可每一本都是空白的。");
        return;
      }
      case "p57shelf2": {
        toast("墙边堆着的书架。抽屉里耷拉着半折的画布 —— 画的是没见过的房间。");
        return;
      }
      case "p57desk": {
        toast("一张画桌，侧翼有几个书架相伴。桌面上留着一圈咖啡渍。");
        return;
      }
      case "p57double": {
        toast("你推开沉重的双扇门 —— 门后是惬意美术馆，画一直挂到看不见的地方。");
        return;
      }
      case "p57screen": {
        toast("一道屏风。工作室就是被这些屏风分隔出来的 —— 里面弥漫着木质与新鲜颜料的气味。");
        return;
      }
      case "p57blanket": {
        toast("你把沙发毯裹在身上。这地方很暖和。");
        g.sanity = clamp(g.sanity + 7, 0, CONFIG.SANITY_MAX);
        return;
      }
      case "p57artmag": {
        toast("几本美术杂志。翻到一半，你发现插图里的展厅就是你现在站的这一间。");
        return;
      }
      case "p57mask": {
        toast("你戴上蓝色睡眠眼罩。眼前一黑 —— 再摘下来时，墙上的画换了一批。");
        return;
      }
      case "p57cork": {
        toast("一座浸透了丙烯颜料的软木雕像。颜料还是湿的。");
        return;
      }
      case "p57tent": {
        toast("你钻进蓝色的三角帐篷 —— 里面的天花板上垂着点点繁星，一闪一闪。");
        g.sanity = clamp(g.sanity + 12, 0, CONFIG.SANITY_MAX);
        return;
      }
      case "p57fakewin": {
        toast("一面人为伪造的窗户 —— 被绘制成能远望到一片无垠沙滩的模样。画得很用心，可它只是画。");
        return;
      }
      case "p57bean": {
        toast("你陷进蓝色豆袋椅里。舒服得不想起来。");
        g.sanity = clamp(g.sanity + 9, 0, CONFIG.SANITY_MAX);
        return;
      }
      case "p57fruit": {
        toast("一盘仿真水果。塑料做的，做得比真的还真。");
        return;
      }
      case "p57drawer": {
        toast("抽屉里耷拉着半折的画布 —— 画的是一间你没见过的展厅。");
        return;
      }
      case "p57mag": {
        toast("一个空杂志架。一本杂志也没有 —— 可架子上落了灰，像是刚被人拿走过。");
        return;
      }
      case "p57paint": {
        // 档案：站在 Level 7 的画作前便会有辨识度极高的波涛撞击声
        const lv = (n.p && n.p.level != null) ? n.p.level : null;
        const SND = {
          7: "波涛撞击的声音 —— 一声接着一声，从很远的地方传来。",
          0: "单调的嗡鸣，和地毯摩擦的细微声响。",
          11: "街道的噪音 —— 车流、人声，还有霓虹灯管里的电流声。",
          21: "很远的脚步声，像是有人在一栋空楼里来回走。",
        };
        if (lv != null && SND[lv]) toast(SND[lv]);
        else toast("画里有什么在动。你听见了很远的声音 —— 可说不清是哪一层的。");
        return;
      }
      case "p57clay": {
        toast("一件还没雕完的陶土制品。手法很生涩 —— 不像壁画师的手笔。");
        return;
      }
      default: return;
    }
  }

  // ---------- 新增层级的每帧逻辑 ----------
  // 泳池爬梯 / 栏杆破坏处：上下水时的一段位移动画（人由动画带着走）
  function startPoolAnim(g, x, y, dur) {
    g.poolAnim = { x0: g.player.x, y0: g.player.y, x1: x, y1: y, t: 0, dur: dur || 0.7 };
  }

  // Level 696：各层可交互物件的提示
  function e696Hint(g, p) {
    if (!p) return "";
    const nm = (zi) => {
      const zs = (g.map && g.map.zoneNames) || [];
      return zs[zi] || ("第 " + zi + " 层");
    };
    if (p.type === "e696stair") {
      const to = (p.to != null ? p.to : 0);
      return "一段楼梯 —— " + (p.back ? "向上，回到底层" : "通往 " + nm(to)) + " · 按 E 走上去";
    }
    if (p.type === "e696hole") return "地上的一个洞 —— 底下透着紫光 · 按 E 跳下去（负楼层）";
    if (p.type === "e696elev") {
      if (p.elev8) return "电梯间 —— 要在这一排按钮里找到带 8 的那个 · 按 E";
      return "一部电梯，按钮成千上万、错杂排列 · 按 E 随便按下一个";
    }
    if (p.type === "e696glitch") {
      if (p.exit30) return "一件紫黑相间的故障物品 —— 它在不停地错位 · 按 E 碰上去";
      return "一件紫黑相间的故障物品 · 按 E 碰上去";
    }
    if (p.type === "e696gas") {
      if (p.full) return "一只装着杏仁水的煤气罐 —— 罐口锈得厉害 · 按 E 试着撬开";
      return "一只空的煤气罐 —— 空的也点得着 · 按 E 划一根火柴";
    }
    return "";
  }

  function updateNewLevels(g, dt) {
    if (!g || g.phase !== "playing") return;
    const lv = g.level;

    // ---- Level 37 / 37.1：泡在温水里 ----
    if (String(lv) === "37" || String(lv) === "37.1") {
      const m37 = g.map;
      // 爬梯 / 破坏处上下水的动画：这段时间人由动画带着走
      if (g.poolAnim) {
        const an = g.poolAnim;
        an.t += dt;
        const kk = Math.min(1, an.t / an.dur);
        const ee = kk < 0.5 ? 2 * kk * kk : 1 - Math.pow(-2 * kk + 2, 2) / 2;
        g.player.x = an.x0 + (an.x1 - an.x0) * ee;
        g.player.y = an.y0 + (an.y1 - an.y0) * ee;
        g.player.moving = false;
        if (kk >= 1) g.poolAnim = null;
        return;
      }
      // 联机：一进这一层就把各人的落点拉开（非线性空间 —— 谁也别一进来就撞上谁）
      if (!g.l37Placed) {
        g.l37Placed = true;
        try {
          const sp = m37.poolSpawns || [];
          if (sp.length > 1) {
            let idx = 0;
            const Net = window.Net;
            const realis = !!window.__mpReal;
            const selfTok = (Net && Net.self && Net.self.token) ? String(Net.self.token) : "me";
            if (Net && Net.self && Net.peers && Net.peers.size) {
              const toks = [selfTok].concat([...Net.peers.keys()].map(String)).sort();
              idx = Math.max(0, toks.indexOf(selfTok));
            } else if (realis) {
              // 写实：用身份做稳定散列，绝不用随机 —— 随机会让两个人撞在同一处
              let h = 2166136261;
              for (let i = 0; i < selfTok.length; i++) { h ^= selfTok.charCodeAt(i); h = Math.imul(h, 16777619); }
              idx = (h >>> 0) % sp.length;
            } else if ((m37.mpCount | 0) > 1) {
              idx = (Math.random() * sp.length) | 0;
            }
            let sp2 = sp[idx % sp.length];
            if (realis) {
              // 非线性空间：在已知队友里挑一个「离所有人都最远」的落点
              const rem = (window.LobbyMPRemote || []).filter((o) => o && String(o.lv) === String(g.level) && typeof o.x === "number");
              if (rem.length) {
                let bestD = -1;
                for (const q of sp) {
                  let md = Infinity;
                  for (const o of rem) md = Math.min(md, Math.hypot(q.x - o.x / TILE, q.y - o.y / TILE));
                  if (md > bestD) { bestD = md; sp2 = q; }
                }
              }
            }
            g.player.x = (sp2.x + 0.5) * TILE;
            g.player.y = (sp2.y + 0.5) * TILE;
          }
        } catch (err) { /* 忽略 */ }
      }
      const k37 = Math.floor(g.player.x / TILE) + "," + Math.floor(g.player.y / TILE);
      g.inPool37 = !!(m37.pools && m37.pools.has(k37));
      if (g.inPool37) {
        if (String(lv) === "37") {
          // 泻盐 + 温水：肌肉舒张，理智慢慢回来
          g.sanity = Math.min(CONFIG.SANITY_MAX, g.sanity + 1.5 * dt);
        }
        // 游泳声：在水里挪动时，除了水花脚步，再叠一层划水的声响
        const moving = (g.player.moving || (g.keys && (g.keys.w || g.keys.a || g.keys.s || g.keys.d)));
        if (moving) {
          g.swimT = (g.swimT || 0) + dt;
          if (g.swimT > 0.55) { g.swimT = 0; try { AudioSys.step("water", false); } catch (e) { /* 忽略 */ } }
        }
        // 画面慢慢变蓝；泡够 30 秒开始窒息 —— 蓝色转红，血往下掉
        g.poolTint = Math.min(1, (g.poolTint || 0) + dt / 6);
        g.poolT = (g.poolT || 0) + dt;
        if (g.poolT > 30) {
          if (!g.poolDrownWarn) {
            g.poolDrownWarn = true;
            toast("肺开始烧了 —— 从爬梯，或者栏杆被撞坏的那一段上去");
          }
          if (!g.invincible) g.hp -= 7 * dt;
          if (g.hp <= 0) {
            g.deathCause = "在泳池里待得太久 —— 没能爬上来";
            showDead();
            return;
          }
        }
      } else {
        g.poolT = 0; g.poolTint = 0; g.poolDrownWarn = false;
      }
      // 非线性空间：一个量决定另一个量，另一个量决定那一个量 ——
      // 踩上折叠点，人就出现在与它绑定的另一处（一步没动，地方换了）
      if (m37.foldMap && m37.foldMap.has(k37) && (g.foldCd || 0) <= 0) {
        const tgt = m37.foldMap.get(k37);
        g.player.x = (tgt.x + 0.5) * TILE;
        g.player.y = (tgt.y + 0.5) * TILE;
        g.foldCd = 1.2;
        toast("脚下一空 —— 你站的地方换了，可你一步没动");
      }
      if (g.foldCd > 0) g.foldCd -= dt;
      return;
    }

    // ---- Level 7：在水里待够 2 分钟，极远处那片水才会"开"----
    if (String(lv) === "7") g.l7T = (g.l7T || 0) + dt;

    // ---- Level 696：报一下当前站在第几层 ----
    if (String(lv) === "696") {
      const zm = g.map;
      const zx = Math.floor(g.player.x / TILE), zy = Math.floor(g.player.y / TILE);
      const fz = (typeof e696ZoneOf === "function") ? e696ZoneOf : window.e696ZoneOf;
      const zi = fz ? fz(zm, zx, zy) : -1;
      if (zi >= 0 && zi !== g.e696zone) {
        g.e696zone = zi;
        const nmz = (zm.zoneNames && zm.zoneNames[zi]) || ("第 " + zi + " 层");
        if (g.e696seen) toast("你站在 —— " + nmz);
        g.e696seen = true;
      }
    }

    // ---- Level 30：腐化 / 走得足够远 ----
    if (String(lv) === "30") {
      // 进来就说清楚：这是一个结局层级 —— 你已经死了，浆果失效，
      // 唯一的"出去"是走够远、看破它是假的。
      if (!g._l30warn) {
        g._l30warn = true;
        toast("你已经死了 —— 迁跃浆果对你没有意义。走得够远，你会看见它是假的。");
      }
      const p30 = g.player;
      let touched30 = false;
      for (const en of (g.entities || [])) {
        if ((en.floor | 0) !== g.floor) continue;
        if (Math.hypot(en.x - p30.x, en.y - p30.y) < TILE * 1.7) { touched30 = true; break; }
      }
      g.corrupt = Math.max(0, Math.min(100, (g.corrupt || 0) + (touched30 ? 15 * dt : -5 * dt)));
      if (touched30) {
        g.corruptMsgT = (g.corruptMsgT || 0) + dt;
        if (g.corruptMsgT > 4.5) {
          g.corruptMsgT = 0;
          const lines30 = ["这里很安全。", "放轻松 —— 你只是在做梦。",
                           "别挣扎了，这里很安全。", "想不起来也没关系 —— 这里很安全。"];
          toast(lines30[randInt(0, lines30.length - 1)]);
        }
      }
      if (g.corrupt >= 100) {
        g.deathCause = "被记忆潜伏者改掉了记忆 —— 到最后你都觉得这里很安全";
        showDead();
        return;
      }
      const st30 = g.map.start || { x: 0, y: 0 };
      if (Math.hypot(p30.x / TILE - st30.x, p30.y / TILE - st30.y) > 42) {
        if (!g.map.glitchSky) {
          g.map.glitchSky = true;
          toast("天空盒的边缘变成了紫黑相间的颜色");
        }
        g.derealFar = (g.derealFar || 0) + dt;
        if (g.derealFar > 7) {
          // 抽离现实是一个结局层级 —— 走进来就是为了看这个：
          // 你看破了虚假，然后被杀死。不是普通死亡，也不给重来的机会。
          g.deathCause = "你想明白了 —— 这一切都是假的";
          unlockEnding(10);
          showEnding(10, "你看明白了 —— 这些岛、这片天、你记得的一切，都是假的。"
            + "它停了下来，用那双不该存在的眼睛看着你。你甚至来不及后悔。");
          return;
        }
      }
    }

    // ---- Level 78 空间站 ----
    if (String(lv) === "78") {
      const m78 = g.map;
      // 舱门一开，整座站漏高剂量辐射：20 / 秒；穿全封闭防护服减半为 10 / 秒。
      if (m78 && m78.hatch78 && m78.hatch78.open && !g.invincible) {
        const suited = (typeof hasKSuit === "function" && hasKSuit(g)) || String(g.outfit) === "hazmat";
        g.hp -= (suited ? 10 : 20) * dt;
        g.rad78Tick = (g.rad78Tick || 0) + dt;
        if (g.rad78Tick > 6) {
          g.rad78Tick = 0;
          toast(suited ? "全封闭防护服挡了一半 —— 辐射仍在灼你（10 / 秒）"
                       : "辐射灼穿了你 —— 每秒 20 点，快找救生舱");
        }
      }
      if (m78 && m78.anomalyLeft == null) m78.anomalyLeft = 300;
      if (m78) {
        // 「直抵群星」正在靠近 —— 撞上就是空间站本体被摧毁
        m78.anomalyLeft = Math.max(0, (m78.anomalyLeft || 0) - dt);
        m78.zapCd = (m78.zapCd == null ? 20 : m78.zapCd) - dt;
        if (m78.zapCd <= 0) {
          m78.zapCd = 15 + Math.random() * 13;
          m78.zapFlash = 0.55;
          toast("耳朵里咔哒一声 —— 一道微波束刚穿过站体，通信断了");
          try { AudioSys.exitChime(); } catch (e) { /* 忽略 */ }
        }
        if (m78.zapFlash > 0) m78.zapFlash = Math.max(0, m78.zapFlash - dt * 1.5);
        const leftI = Math.floor(m78.anomalyLeft);
        for (const mark78 of [240, 180, 120, 60, 30, 10]) {
          if (leftI <= mark78 && (m78._lastMark || 9999) > mark78) {
            m78._lastMark = mark78;
            toast("「直抵群星」还在靠近 —— 大约还剩 " + mark78 + " 秒 · 找到舷窗里显示着街道的那间救生舱");
          }
        }
        if (m78.anomalyLeft <= 0 && !g._anomalyDead) {
          g._anomalyDead = true;
          g.deathCause = "空间站被「直抵群星」撞毁了";
          showDead();
          return;
        }
        // 盯着舷窗看太久 —— 先听见歌声，然后你会去做蠢事
        const pk78 = Math.floor(g.player.x / TILE) + "," + Math.floor(g.player.y / TILE);
        if (m78.star78 && m78.star78.has(pk78)) {
          g.stare78 = (g.stare78 || 0) + dt;
          if (g.stare78 > 6 && g.stare78 - dt <= 6) toast("你听见了歌声 —— 很轻，像有人在很远的地方哼着");
          if (g.stare78 > 6) g.sanity = Math.max(0, (g.sanity || 0) - 3.4 * dt);
          if (g.stare78 > 24 && !g._stareDead) {
            g._stareDead = true;
            g.deathCause = "你走向了那扇舷窗 —— 虚空在一瞬间抽干了你肺里的氧气";
            showDead();
            return;
          }
        } else {
          g.stare78 = Math.max(0, (g.stare78 || 0) - dt * 1.6);
        }
      }
    }
    // ---- Level 22 颓垣：开采坑一直在掉血；踩在碎石上打滑 ----
    if (String(lv) === "22") {
      const m22 = g.map;
      if (m22) {
        const t22x = Math.floor(g.player.x / TILE), t22y = Math.floor(g.player.y / TILE);
        const k22 = t22x + "," + t22y;
        if (m22.pit22 && m22.pit22.has(k22)) {
          if (!g.invincible) g.hp = Math.max(0, (g.hp || 0) - 5.5 * dt);
          if (!g._pit22t || performance.now() - g._pit22t > 4500) {
            g._pit22t = performance.now();
            toast("脚下的水泥陷了下去 —— 这是个开采坑，深得看不见底");
          }
        } else if (m22.rubble22 && m22.rubble22.has(k22) && !g.invincible) {
          g.hp = Math.max(0, (g.hp || 0) - 0.7 * dt);
        }
      }
    }
    // ---- Level 33 无尽购物体验：走得越深，它腐烂得越厉害 ----
    if (String(lv) === "33") {
      const m33 = g.map;
      if (m33) {
        const t33x = Math.floor(g.player.x / TILE);
        const f33 = (typeof window !== "undefined" && window.c33At) ? window.c33At : null;
        const cc = f33 ? f33(m33, t33x) : 0;
        const stg = (typeof window !== "undefined" && window.c33Stage) ? window.c33Stage(cc) : 0;
        if (g._c33stg == null) g._c33stg = -1;
        if (stg !== g._c33stg) {
          if (stg > (g._c33stg | 0)) {
            const C33MSG = [
              "",
              "墙上有霉斑了。灯闪了一下 —— 你开始觉得有人在看你。",
              "水漫到脚踝。裂缝里长出了草，灯开始隔几分钟闪一次。",
              "苔藓从天花板垂下来，水到了膝盖。你的头一跳一跳地疼。",
              "墙像被炸过。草长到了一人高 —— 幻觉开始骗你往回走。",
              "地板和灯都没了。脚下有些地方在烧，幻觉开始能真的伤到你。",
              "墙皮剥落，露出黑洞和爆开的管子。别回头看 —— 它们在等你回头。",
              "你走到了不该到的地方。草比人还高，墙上全是黑洞。回头 —— 现在就回头。",
            ];
            toast(C33MSG[Math.min(7, stg)]);
          }
          g._c33stg = stg;
        }
        if (!g.invincible) {
          const SAN = [0, 0.4, 0.8, 1.5, 2.2, 3.0, 3.5, 4.5];
          const HP = [0, 0, 0, 0, 0.4, 1.2, 2.0, 3.5];
          g.sanity = Math.max(0, (g.sanity || 0) - SAN[Math.min(7, stg)] * dt);
          if (HP[Math.min(7, stg)] > 0) g.hp = Math.max(0, (g.hp || 0) - HP[Math.min(7, stg)] * dt);
        }
      }
    }
    // ---- Level 599 群星：恒星内部，走进来只剩几秒 ----
    if (String(lv) === "599") {
      g.star599T = (g.star599T || 0) + dt;
      const R599 = (typeof window !== "undefined" && window.RADIO599) ? window.RADIO599 : [];
      if (!g._r599i) g._r599i = {};
      for (let i = 0; i < R599.length; i++) {
        if (g.star599T >= R599[i].at && !g._r599i[i]) { g._r599i[i] = 1; toast(R599[i].s); }
      }
      if (!g.invincible) g.hp = Math.max(0, (g.hp || 100) - 11 * dt);
      if (g.star599T >= 12 && !g._star599Dead) {
        g._star599Dead = true;
        g.deathCause = "站在恒星的内部";
        unlockEnding(11);
        showEnding(11, "热浪先到，然后是光。你没有疼 —— 几百万开尔文的东西，不给你疼的时间。");
        return;
      }
    }
    // ---- 缝合（.-1）：进来就解锁「善意的谎言」 ----
    if (String(lv) === "9223372036854775807.-1" && !g._junctionDone) {
      g._junctionDone = true;
      unlockEnding(5);
      toast("过去与未来 —— 结局已解锁");
    }
    // 这里没有未来，只有过去 —— 向前走的时候会被直接送到前方一段距离之外
    if (String(lv) === "9223372036854775807.-1") {
      const K = (typeof keys === "object" && keys) ? keys : null;
      if (K && kHeld("up", K)) {
        const lay = g.map.layers[g.floor] || g.map.layers[0];
        const tx = Math.floor(g.player.x / TILE);
        let best = null;
        for (let n = 8; n >= 2; n--) {
          const ny = Math.floor(g.player.y / TILE) - n;
          if (ny < 0 || !lay[ny]) continue;
          if (lay[ny][tx] === 0) { best = (ny + 0.5) * TILE; break; }
        }
        if (best != null && best < g.player.y - TILE) {
          g.player.y = best;
          try { AudioSys.step("tile", false); } catch (e) { /* 忽略 */ }
        }
      }
    }

    // ---- 无尽的终章：楼梯两端各有一个隐形传送门 ----
    // 走到尽头 -> 上一层；回到起点 -> 下一层。踩上去就走，不弹提示，无缝。
    if (String(lv) === "9223372036854775807") {
      const m = g.map;
      const tx = Math.floor(g.player.x / TILE), ty = Math.floor(g.player.y / TILE);
      const kk = tx + "," + ty;
      // 先确认玩家绕圈的方向：顺时针（屏幕上角度变大）= 上楼，逆时针 = 下楼。
      // 只按"踩到哪一格"判定的话，顺时针走会先踩到下行门、再踩到上行门，
      // 一上一下正好抵消 —— 结果就是永远上不去。所以必须按行进方向判定。
      {
        const a = Math.atan2(ty - m.stairCy, tx - m.stairCx);
        if (m.lastAng != null) {
          let d = a - m.lastAng;
          while (d > Math.PI) d -= Math.PI * 2;
          while (d < -Math.PI) d += Math.PI * 2;
          if (Math.abs(d) > 0.02) m.dirSign = d > 0 ? 1 : -1;
        }
        m.lastAng = a;
      }
      // 必须离开传送门那一格才能再次触发，否则会一直往上/下窜
      const atEnd   = !!(m.stairEnd   && m.stairEnd.has(kk));
      const atStart = !!(m.stairStart && m.stairStart.has(kk));
      if (!atEnd && !atStart) m.portalLock = false;
      const dir = m.dirSign || 1;              // 还没动过时按顺时针（上楼）算
      // 上行门：只有顺时针走到"尽头"才生效
      if (!m.portalLock && atEnd && dir > 0 && (g.floor | 0) < m.topFloor) {
        m.portalLock = true;
        g.floor = (g.floor | 0) + 1;
        if (g.floor === m.topFloor) {
          m.reachedTop = true;
          toast("第 50 层 —— 到顶了。往下走回最底下，那里会变成白色。");
        } else toast("第 " + (g.floor + 1) + " 层");
        return;
      }
      // 下行门：只有逆时针退回"起点"才生效
      if (!m.portalLock && atStart && dir < 0 && (g.floor | 0) > 0) {
        m.portalLock = true;
        g.floor = (g.floor | 0) - 1;
        if (g.floor === 0 && m.reachedTop && !m.bottomWhite) {
          m.bottomWhite = true;
          toast("最底下变成了白色 —— 站上去，按 E 跳进去");
        } else toast("第 " + (g.floor + 1) + " 层");
        return;
      }
      // 兜底：没踩到传送门时仍然保留"绕满一圈换层"，免得门没生成就卡死
      const onRing = m.ringTiles && m.ringTiles.has(kk);
      if (onRing && (!m.stairEnd || !m.stairEnd.size)) {
        const a = Math.atan2(ty - m.stairCy, tx - m.stairCx);
        if (m.lastAng != null) {
          let d = a - m.lastAng;
          while (d > Math.PI) d -= Math.PI * 2;
          while (d < -Math.PI) d += Math.PI * 2;
          m.stairAcc += d;
          const TURN = Math.PI * 2;
          while (m.stairAcc >= TURN) {                 // 走满一圈 -> 上一层
            m.stairAcc -= TURN;
            if ((g.floor | 0) < m.topFloor) {
              g.floor = (g.floor | 0) + 1;
              if (g.floor === m.topFloor) {
                m.reachedTop = true;
                toast("第 50 层 —— 到顶了。往下走回最底下，那里会变成白色。");
              } else {
                toast("第 " + (g.floor + 1) + " 层");
              }
            }
          }
          while (m.stairAcc <= -TURN) {                // 反着绕一圈 -> 下一层
            m.stairAcc += TURN;
            if ((g.floor | 0) > 0) {
              g.floor = (g.floor | 0) - 1;
              if (g.floor === 0 && m.reachedTop && !m.bottomWhite) {
                m.bottomWhite = true;                  // 最底下的混凝土变白
                toast("最底下变成了白色 —— 站上去，按 E 跳进去");
              } else {
                toast("第 " + (g.floor + 1) + " 层");
              }
            }
          }
        }
      }
      return;
    }

    // Level 301 希望之窗：空气里是氟化氢与一氧化碳的混合物。
    // 没有 K 版防化服 -> 每秒 -10 血；穿上防化服 -> 每 2 秒 -1 血。
    // 注意：主菜单「服装」里那套生化防护服不算数 —— 只有新时代广场买来的那套才行。
    if (String(g.level) === "301") {
      const suited = hasKSuit(g);
      const rate = suited ? 0.5 : 10;
      if (!g._corrAcc) g._corrAcc = 0;
      g._corrAcc += rate * dt;
      const whole = Math.floor(g._corrAcc);
      if (whole > 0) {
        g._corrAcc -= whole;
        g.hp = Math.max(0, g.hp - whole);
        if (g.hp <= 0) {
          g.phase = "ended";
          g.deathCause = suited ? "防护服也扛不住了" : "腐蚀性空气";
          unlockEnding(1);
          showEnding(1, suited
            ? "滤毒罐先失效了。你吸进第一口没有过滤过的空气时，"
              + "甚至来不及把面罩摘下来。"
            : "你只穿着普通的衣服。空气比你想象的快得多 —— "
              + "头晕、昏厥，然后什么都没有了。");
          return;
        }
      }
      // 血低于 25 时提醒一次别硬撑
      if (!suited && g.hp <= 25 && !g._corrWarned) {
        g._corrWarned = true;
        toast("空气正在腐蚀你 —— 没有防化服撑不了多久。回去买一套。");
      }
      // 进层时说一句当前的腐蚀速率 —— 免得看着血条掉，却不知道自己算不算穿了防护
      if (!g._corrEntered) {
        g._corrEntered = true;
        if (suited) {
          toast("滤毒罐开始工作了 —— 每 2 秒掉 1 滴血，撑得住，但别久留");
        } else {
          toast("空气在腐蚀你 —— 每 1 秒掉 10 滴血 · 先去新时代广场买防化服");
          // 背包里有却没穿：这才是"买了还是掉血"最常见的原因，直接点破
          if ((g.inv.ksuit | 0) > 0) {
            try { setTimeout(() => toast("背包里那件 K 版防化服还没穿 —— 点一下它"), 900); } catch (e) { /* 忽略 */ }
          }
        }
      }
    }

    // 无尽终章的白光 -> Level 11：走几秒之后精神崩溃（结局「无垠城市」）
    if (g._breakdown) {
      g._breakdown.left -= dt;
      if (g._breakdown.left <= 0) {
        g._breakdown = null;
        g.sanity = 0;
        g.phase = "ended";
        unlockEnding(7);
        showEnding(7, "街道还是那条街道。你蹲下来，抱着头 —— "
          + "然后你忘了自己为什么要往前走。");
        return;
      }
    }

    if (lv === 994) {
      const m = g.map;
      // 无规则地上涨：基础速度 + 随机涌动
      m.seaX -= (0.55 + Math.sin(g.time * 0.7) * 0.25) * dt;
      if (m.seaX < 5) m.seaX = 5;
      const tx = Math.floor(g.player.x / TILE);
      if (!m.doomed && tx >= Math.floor(m.seaX)) {
        // 碰到了不代表立刻消失 —— 是你越走越慢，跟不上海水的速度，才被它吞掉
        m.doomed = true;
        g.tideFade = 0;
        try { AudioSys.roar(1); } catch (e) { /* 忽略 */ }
        toast("潮水碰到你了 —— 门在你身后锁上了。你开始变慢了。");
      }
      if (m.doomed) {
        // 落后得越多，消失得越快；血和理智一滴都不掉
        const behind = Math.max(0, tx - m.seaX);
        g.tideFade = Math.min(1, (g.tideFade || 0) + dt * (0.045 + behind * 0.05));
        if (behind >= 2.2) g.tideFade = Math.min(1, (g.tideFade || 0) + dt * 1.4);
        if (g.tideFade >= 1) {
          g.phase = "ended";
          g.deathCause = "被海浪分解";
          unlockEnding(3);
          markUnlock("bg3");          // 「存在于此」主菜单背景图
          showEnding(3, "潮水漫过你的时候，你还是清醒的。"
            + "你想起那本日记最后被分解掉的那句话 —— 请不要……忘记我……");
        }
      }
      return;
    }
  }

  function maxEntities() {
    // 层级越高，同时追击的实体越多；难度再往上叠
    const lv = game.level;
    const dAdd = (game && typeof game.entMaxAdd === "number") ? game.entMaxAdd : (curDiff().maxAdd);
    void dAdd;
    // Level 26 是派对客的总部，同时追击的数量要压过所有其它层级。
    if (String(lv) === "26") return 8;
    if (lv === 21) return 3;                // Level 21：编号门
    if (lv === "hub" || lv === 10) return 0;    // 枢纽与丰裕：没有实体
    if (lv === 4) return 1;                 // 少量实体：整层能喘口气
    if (lv === 9) return 4;                 // 实体横行
    if (lv === 5) return 2;                 // 少量实体（但死亡飞蛾会成群）
    if (lv === 17) return 1;                // 航空母舰：极少量实体 —— 整艘船安静得过分
    if (lv === 485) return 3;               // 蒙黑天空：窃皮者 / 猎犬 / 新娘各一只
    if (lv === 974) return 1;               // kitty 之家：全层只有 Kitty 一个实体，且独此一只
    if (lv >= 7) return 2;                  // 中量 / 极多
    return lv >= 3 ? 2 : 1;
  }
  // 难度会把上限整体抬高 / 压低（极端 +3，简单 -1）
  function maxEntitiesNow() {
    const base = maxEntities();
    if (String(game.level) === "hub" || String(game.level) === "10") return 0;
    return Math.max(0, base + curDiff().maxAdd);
  }

  // 每层级的专属怪物种类
  // 在符合条件的地板上刷一只指定种类的实体
  function spawnEntityAt(g, kind, ok) {
    const map = g.map;
    const list = floorList(map, g.floor);
    const px = g.player.x, py = g.player.y;
    const push = (t) => {
      const ne = new Entity(map, t.x, t.y, g.level, kind, g.floor);
      g.entities.push(ne);
      // 第 11 效应：这些实体不会嘶吼，只会在成形时低低地哼一声
      if (ne.docile) AudioSys.growl();
      else AudioSys.roar(1);
      return true;
    };
    // 先按"离玩家 11 格以外"找；地图小的时候这条永远满足不了，
    // 于是实体一个都刷不出来（开发者面板手动刷也一样）。放宽到 5 格再试一轮。
    for (const minD of [11, 5]) {
      for (let i = 0; i < 120; i++) {
        const t = list[randInt(0, list.length - 1)];
        if (!t) break;
        if (isClosedDoor(map, t.x, t.y, g.floor)) continue;
        // 安全区（Alpha 基地 / Level 7 的岸上）不刷实体
        if (typeof inSanctuary === "function" &&
            inSanctuary(map, (t.x + 0.5) * TILE, (t.y + 0.5) * TILE, g.floor)) continue;
        if (ok && !ok(t)) continue;
        if (Math.hypot((t.x + 0.5) * TILE - px, (t.y + 0.5) * TILE - py) > minD * TILE) return push(t);
      }
    }
    return false;
  }

  // Level 26 开场强制刷一批派对客（兜底，不靠概率）
  // Level 974：Kitty 不是"随机刷出来的怪"，它一开始就在这栋房子里，
  // 而且**全层只有一只**。以前靠随机计时刷，会出现"进屋半天不见 Kitty"，
  // 或者上限没卡住时刷出两只 —— 两种都不对。这里进场就放一只，并锁死上限。
  function forceKitty(g) {
    if (!g || !levelDef(g.level).entities) return;
    const has = g.entities.some((e) => e.kind === "kitty");
    if (has) return;                       // 已经有一只了，不再加
    // Kitty 是"暗中跟踪"，不该一进门就贴脸：刷在离玩家 6 格开外的地方
    if (!spawnEntityAt(g, "kitty", (t) => {
      return Math.hypot((t.x + 0.5) * TILE - g.player.x, (t.y + 0.5) * TILE - g.player.y) > 6 * TILE;
    })) {
      spawnEntityAt(g, "kitty", null);     // 房子小、挑不到远处就直接放
    }
  }

  function forceParty26(g, n) {
    if (!g || !levelDef(g.level).entities) return;
    let guard = 0;
    while (g.entities.length < (n || 3) && guard++ < 40) {
      const before = g.entities.length;
      spawnEntityAt(g, "partypooper");
      if (g.entities.length === before) break;   // 刷不进去就别死循环
    }
  }

  function levelKind(level) {
    const def = levelDef(level);
    // Level 3 是"中量实体、种类杂"：从该层的怪物池里随机抽一种
    if (def.monsters && def.monsters.length) {
      return def.monsters[randInt(0, def.monsters.length - 1)];
    }
    return def.monster || "bacterium";
  }

  function spawnEntity() {
    const g = game;
    const map = g.map;
    // Level 7：海面上一只实体都没有 —— 实体只活在海底（坐潜艇下去之后才有）
    if (isLevel(g, 7)) {
      if (!l7InSeaBed(g)) return;
      const bed = map.bed;
      const pool = (levelDef(7).monsters || []).filter((k) => k && k !== "xiaoxiao");
      const kind = pool.length ? pool[randInt(0, pool.length - 1)] : "herdsnake";
      spawnEntityAt(g, kind, (t) => t.y >= bed.top && t.y <= bed.bottom &&
        t.x >= bed.x1 && t.x <= bed.x2);
      return;
    }
    // Level 1.1：区域 1 没有实体，越深越多、越杂（区域 4 的还会飘、会变异）
    if (String(g.level) === "1.1") {
      const fnz = (typeof corridorZoneAt === "function") ? corridorZoneAt : (window.corridorZoneAt);
      const z = fnz ? fnz(map, Math.floor(g.player.x / TILE)) : 1;
      const KINDS = {
        2: ["smiler", "hound", "skinstealer"],
        3: ["smiler", "smiler", "hound", "skinstealer"],
        4: ["smiler", "skinstealer", "hound", "deathmoth"],
      };
      const ks = KINDS[z];
      if (ks) spawnEntityAt(g, ks[randInt(0, ks.length - 1)]);
      return;
    }
    const px = g.player.x, py = g.player.y;
    const list = floorList(map, g.floor);
    for (let i = 0; i < 80; i++) {
      const t = list[randInt(0, list.length - 1)];
      if (!t) break;
      // 不要刷在关闭的门里
      if (isClosedDoor(map, t.x, t.y, g.floor)) continue;
      // Level 21 的中央广场是安全区 —— 实体永远不会出现在那里
      if (map.plaza && map.plaza.has(t.x + "," + t.y)) continue;
      const dx = (t.x + 0.5) * TILE - px, dy = (t.y + 0.5) * TILE - py;
      if (Math.hypot(dx, dy) > 11 * TILE) {
        g.entities.push(new Entity(map, t.x, t.y, g.level, levelKind(g.level), g.floor));
        // 第 11 效应：这一层的实体成形时不会嘶吼
        if (g.level !== 11) AudioSys.roar(1); // 实体成形时的嘶吼
        return;
      }
    }
  }

  // 每层只散布关于该层级的档案。
  // 关键修正：Level 1 分上下两层，两层**各刷一批**并记录 floor。
  // 以前只按进入时那一层刷，切层后档案仍留在旧层的坐标上 —— 在新层的地图上那就是墙，
  // 于是看起来"档案刷在墙里"。
  // 另外：只放在**真正走得到**的地板上，避开斜坡与门板；收集过的档案也会继续刷
  // （优先没收集过的），这样子层级不会空无一物。
  // 有些层级有一道"走过去就回不来"的出口（Level 2 那扇通往 Level 3 的铁栅栏门）——
  // 门后面虽然还是地板，但玩家一穿过去就被切走了，刷在那边的档案永远拿不到。
  // 这里做一次"不跨过那扇门"的 BFS，只返回门这一侧能走到的格子。
  function reachStopAt(map, floor, from, blockKeys) {
    const seen = new Set();
    const grid = (map.layers && map.layers[floor]) || (map.layers && map.layers[0]);
    const size = map.size;
    if (!grid || !size) return seen;
    const sx = from.x | 0, sy = from.y | 0;
    if (!grid[sy] || grid[sy][sx] !== 0) return seen;
    if (blockKeys && blockKeys.has(sx + "," + sy)) return seen;
    seen.add(sx + "," + sy);
    const q = [[sx, sy]];
    while (q.length) {
      const c = q.pop();
      for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = c[0] + d[0], ny = c[1] + d[1], k = nx + "," + ny;
        if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue;
        if (seen.has(k)) continue;
        if (!grid[ny] || grid[ny][nx] !== 0) continue;
        if (blockKeys && blockKeys.has(k)) continue;
        seen.add(k); q.push([nx, ny]);
      }
    }
    return seen;
  }

  function spawnArchives(map, level) {
    // 读过的档案不会再出现 —— 收集过的直接排除掉，没读过的才刷在地图上。
    // （之前是"没读过的排前面、读过的兜底"，结果读完了还会反复刷同一批。）
    const pool = ARCHIVES.filter(a => a.level === level && !collected.has(a.id)
      && !(a.id === "bangrun"));   // 「跑!」那张纸条单独摆，不走随机
    // Level !：纸条就钉在出生点前一格 —— 出发第一眼看到的就是那个字。
    // 收集过了也照样摆（它是这一层的标志，不是收集品）。
    // Level ! 那张「跑!」纸条：不在随机池里，单独摆
    const runDoc = ARCHIVES.find((a) => a.id === "bangrun");
    // 有几个可进入区域就刷几批（Level 1 上下两层、Level 5 三个区域）
    const floors = [];
    for (let i = 0; i < (map.floors ? map.floors.length : 1); i++) floors.push(i);
    const rank = pool.slice().sort(() => Math.random() - 0.5);
    const perFloor = Math.min(4, Math.max(2, Math.ceil(rank.length / floors.length)));
    const points = [];
    let cursor = 0;
    // Level !：纸条就钉在出生点前一格 —— 出发第一眼看到的就是那个字。
    // 收集过了也照样摆（它是这一层的标志，不是收集品）。
    if (runDoc && String(level) === "bang") {
      const sx = map.start.x, sy = map.start.y + 1;   // 朝 EXIT 的那一格
      const gd = map.layers && map.layers[0];
      if (gd && gd[sy] && gd[sy][sx] === 0) {
        points.push({ x: (sx + 0.5) * TILE, y: (sy + 0.5) * TILE, id: "bangrun", floor: 0 });
      }
    }
    for (const f of floors) {
      // 同一层里已经摆下的档案点 —— 摆新的一篇时要跟它们拉开距离，
      // 以前只按"随机挑一格"来放，结果好几篇会挤在同一个角落里。
      const placed = [];
      // 通往下一层的门（Level 2 的栅栏门 -> Level 3）算作不可跨越的边界
      const block = new Set();
      for (const d of (map.doors || [])) {
        if (!d || !d.toLevel) continue;
        for (const t of (d.tiles || [])) {
          if ((t.floor | 0) === f || (d.floor | 0) === f) block.add(t.x + "," + t.y);
        }
      }
      const reach = block.size
        ? reachStopAt(map, f, { x: map.start.x, y: map.start.y }, block)
        : reachableFrom(map, f, { x: map.start.x, y: map.start.y });
      const used = new Set();
      for (let i = 0; i < perFloor && cursor < rank.length; i++, cursor++) {
        const spot = pickArchiveSpot(map, f, reach, used, placed);
        if (!spot) continue;
        placed.push(spot);
        points.push({ x: spot.x, y: spot.y, id: rank[cursor].id, floor: f });
      }
    }
    // M.E.G 的 Alpha 基地：纸质的记录就摆在各行署的房间里
    const bspots = (map.baseArchiveSpots || []).slice(0, 3);
    for (const sp of bspots) {
      if (cursor >= rank.length) break;
      // baseArchiveSpots 存的是"第几格"，而 points 用的是世界像素 ——
      // 以前直接把格子号当像素用，于是 Alpha 基地那几篇全被摆到地图左上角
      // （基地在右下角，格子号 80 上下被当成 80 像素，正好是左上角那几格）。
      const wx = (sp.x + 0.5) * TILE, wy = (sp.y + 0.5) * TILE;
      points.push({ x: wx, y: wy, id: rank[cursor].id, floor: sp.floor | 0 });
      cursor++;
    }
    return points;
  }

  // 挑一个放档案的地板格：走得到、不是门板、不在斜坡上、离出生点够远
  function pickArchiveSpot(map, floor, reach, used, placed) {
    const list = floorList(map, floor);
    const sx = map.start.x * TILE + TILE / 2, sy = map.start.y * TILE + TILE / 2;
    // 同一层里两篇档案至少隔这么远 —— 不然会挤成一堆
    const minSep = 8 * TILE;
    let loose = null;                                      // 实在挑不到就用它兜底
    for (let i = 0; i < 400; i++) {
      const t = list[randInt(0, list.length - 1)];
      if (!t) break;
      const key = t.x + "," + t.y;
      if (used.has(key)) continue;
      if (!reach.has(key)) continue;                       // 走不到的角落不刷
      if (isClosedDoor(map, t.x, t.y, floor)) continue;    // 门板上不刷
      if (onRamp(map, t.x, t.y)) continue;                 // 斜坡上不刷
      const wx = (t.x + 0.5) * TILE, wy = (t.y + 0.5) * TILE;
      if (Math.hypot(wx - sx, wy - sy) <= 7 * TILE) continue; // 别贴着出生点
      let near = false;
      if (placed && placed.length) {
        for (const q of placed) {
          if (Math.hypot(wx - q.x, wy - q.y) < minSep) { near = true; break; }
        }
      }
      if (near) { if (!loose) loose = { x: wx, y: wy }; continue; }
      used.add(key);
      return { x: wx, y: wy };
    }
    if (loose) { used.add(Math.round(loose.x / TILE) + "," + Math.round(loose.y / TILE)); return loose; }
    return null;
  }

  // ---------- 日志档案 ----------
  function showArchive(a) {
    el.archiveKind.textContent = a.kind;
    el.archiveTitle.textContent = a.title;
    el.archiveSource.textContent = a.source;
    el.archiveBody.innerHTML = "";
    // 只有一个巨大字的档案（Level ! 的「跑!」）—— 整块就放这一个字
    if (a.big) {
      const d = document.createElement("div");
      d.className = "archive-big";
      d.textContent = (a.body && a.body[0]) ? a.body[0] : "";
      el.archiveBody.appendChild(d);
      el.archiveCount.textContent = archiveProgress();
      show(el.archive);
      return;
    }
    for (const para of a.body) {
      const p = document.createElement("p");
      p.textContent = para;
      el.archiveBody.appendChild(p);
    }
    el.archiveCount.textContent = archiveProgress();
    show(el.archive);
  }

  function collectArchive(ap) {
    const g = game;
    if (g.phase !== "playing") return;
    collected.add(ap.id);
    g.archives = g.archives.filter(p => p !== ap);
    g.nearArchive = null;
    hide(el.pickupHint);
    const a = ARCHIVES.find(x => x.id === ap.id);
    if (!a) return;
    saveCollected(); // 收进档案手册
    g.reading = a;
    g.phase = "reading";
    AudioSys.paper();
    showArchive(a);
    updateHud();
  }

  function closeArchive() {
    const g = game;
    if (!g || g.phase !== "reading") return;
    hide(el.archive);
    g.reading = null;
    g.phase = "playing";
  }

  // ---------- 档案手册（快捷键 H） ----------
  function archiveTotal() {
    return collected.size + "/" + ARCHIVES.length;
  }

  // ---------- 服装 ----------
  function unlockedOutfits() {
    if (window.Cloud) return Cloud.unlocks();
    try { return JSON.parse(localStorage.getItem("br_unlocks") || "[]"); }
    catch (e) { return []; }
  }
  function markUnlock(key) {
    if (!key) return;
    if (window.Cloud) { Cloud.unlock(key); return; }
    const list = unlockedOutfits();
    if (!list.includes(key)) {
      list.push(key);
      try { localStorage.setItem("br_unlocks", JSON.stringify(list)); } catch (e) { /* 忽略 */ }
    }
  }
  function outfitUnlocked(def) {
    return !def.unlock || unlockedOutfits().includes(def.unlock);
  }
  function outfitLockText(def) {
    if (def.unlock === "clear0") return "通关 Level 0 后解锁";
    if (def.unlock === "reach3") return "抵达 Level 3 后解锁";
    return "未解锁";
  }
  function savedOutfit() {
    let k = null;
    if (window.Cloud) k = Cloud.outfit();
    else { try { k = localStorage.getItem("br_outfit"); } catch (e) { /* 忽略 */ } }
    // K 版防化服是局内道具，不能从主菜单选 —— 旧档里存过的话一律退回流浪者。
    if (k === "ksuit") { try { localStorage.removeItem("br_outfit"); } catch (e) { /* 忽略 */ } k = null; }
    if (k && OUTFITS[k] && !OUTFITS[k].hidden && outfitUnlocked(OUTFITS[k])) return k;
    return "drifter";
  }
  // 自定义配色：目前只有生化防护服能改（在 Level 4 切出后解锁）
  const OCOLOR_KEY = "br_outfit_colors";
  function loadOutfitColors() {
    try { return JSON.parse(localStorage.getItem(OCOLOR_KEY) || "{}") || {}; } catch (e) { return {}; }
  }
  function saveOutfitColors(c) {
    try { localStorage.setItem(OCOLOR_KEY, JSON.stringify(c)); } catch (e) {}
  }
  function canRecolor(def) {
    if (!def || !def.recolorUnlock) return false;
    return unlockList().indexOf(def.recolorUnlock) >= 0;
  }
  // 当前这套衣服（含自定义配色）。传 g 时用 g 身上的，否则用存档里的。
  function currentOutfitDef(g) {
    const key = (g && g.outfit) || (game && game.outfit) || savedOutfit();
    const d = OUTFITS[key] || OUTFITS.drifter;
    const c = loadOutfitColors()[d.key];
    return c ? Object.assign({}, d, c) : d;
  }

  // 身上有没有穿那套 K 版防化服？
  // 只有新时代广场买来的那件（服装 key = "ksuit"）算数 ——
  // 主菜单「服装」里的生化防护服（hazmat）挡不住 Level 301 的空气。
  function hasKSuit(g) {
    const k = (g && g.outfit) || (game && game.outfit) || savedOutfit();
    return k === "ksuit";
  }

  function syncOutfitColorRow() {
    const row = outfitColorRow();
    if (!row) return;
    const def = OUTFITS[outfitSel || "drifter"] || OUTFITS.drifter;
    const ok = canRecolor(def);
    row.classList.toggle("hidden", !ok);
    if (!ok) return;
    const c = loadOutfitColors()[def.key] || {};
    const b = row.querySelector("#oc-body"), k = row.querySelector("#oc-skin");
    if (b) b.value = c.body || def.body || "#f2c518";
    if (k) k.value = c.skin || def.skin || "#2b2b2b";
  }

  function openOutfit() {
    if (game && game.phase === "outfit") { closeOutfit(); return; }
    if (game) {
      if (game.phase === "playing" || game.phase === "paused" || game.phase === "reading") {
        game.manualReturn = game.phase;
      }
      game.phase = "outfit";
    }
    renderOutfit();
    show(el.outfit);
  }
  function closeOutfit() {
    hide(el.outfit);
    if (game) game.phase = game.manualReturn || "playing";
  }
  let outfitSel = null;
  // 服装面板底部的调色条 —— 只给能改的那套显示
  function outfitColorRow() {
    if (!el.outfit) return null;
    let row = document.getElementById("outfit-color-row");
    if (!row) {
      const box = el.outfit.querySelector(".acc-box") || el.outfit;
      row = document.createElement("div");
      row.id = "outfit-color-row";
      row.className = "oc-row hidden";
      row.innerHTML =
        '<div class="set-label">配色</div>' +
        '<label class="oc-item">防护服 <input id="oc-body" type="color"></label>' +
        '<label class="oc-item">面具与手套 <input id="oc-skin" type="color"></label>' +
        '<button id="oc-reset" class="ghost oc-reset" type="button">恢复默认</button>';
      box.appendChild(row);
      const bind = (id, field) => {
        const inp = row.querySelector("#" + id);
        if (!inp) return;
        inp.addEventListener("input", () => {
          const def = OUTFITS[outfitSel || "drifter"] || OUTFITS.drifter;
          const c = loadOutfitColors();
          c[def.key] = c[def.key] || {};
          c[def.key][field] = inp.value;
          saveOutfitColors(c);
          renderOutfit();
        });
      };
      bind("oc-body", "body");
      bind("oc-skin", "skin");
      const rs = row.querySelector("#oc-reset");
      if (rs) rs.addEventListener("click", () => {
        const def = OUTFITS[outfitSel || "drifter"] || OUTFITS.drifter;
        const c = loadOutfitColors();
        delete c[def.key];
        saveOutfitColors(c);
        renderOutfit();
      });
    }
    return row;
  }

  function renderOutfit() {
    const list = el.outfitList;
    list.innerHTML = "";
    for (const key of Object.keys(OUTFITS)) {
      const def = OUTFITS[key];
      // K 版防化服不在主菜单里切换 —— 只能在局内新时代广场买了，从背包里穿上。
      if (def.hidden) continue;
      const ok = outfitUnlocked(def);
      const row = document.createElement("div");
      row.className = "outfit-item" + (ok ? "" : " locked") + (outfitSel === key ? " sel" : "");
      const sw = document.createElement("span");
      sw.className = "outfit-swatch";
      sw.style.background = def.body;
      sw.style.borderColor = def.skin;
      const nm = document.createElement("span");
      nm.className = "outfit-name";
      nm.textContent = def.name;
      const st = document.createElement("span");
      st.className = "outfit-state";
      st.textContent = ok ? (savedOutfit() === key ? "穿着中" : "可切换") : outfitLockText(def);
      if (ok && canRecolor(def)) st.textContent += " · 可调色";
      row.appendChild(sw);
      row.appendChild(nm);
      row.appendChild(st);
      row.addEventListener("click", () => {
        outfitSel = key;
        showOutfitDesc(key);
        if (ok) {
          if (window.Cloud) Cloud.setOutfit(key);
          else { try { localStorage.setItem("br_outfit", key); } catch (e) { /* 忽略 */ } }
          if (game) game.outfit = key;
        }
        renderOutfit();
      });
      list.appendChild(row);
    }
    if (!outfitSel) outfitSel = savedOutfit();
    syncOutfitColorRow();          // 能改色的那套才显示调色条
    drawOutfitPreview(outfitSel);
    showOutfitDesc(outfitSel);
  }
  // 服装预览（1.3.4）：不再单独画一套人 —— 直接复用游戏里的 drawPlayer，
  // 把玩家按预览画布放大，身上那件衣服（含生化防护服的防毒面具）和游戏里一模一样。
  function drawOutfitPreview(key) {
    const cv = el.outfitPreview;
    if (!cv) return;
    const c = cv.getContext("2d");
    const W = cv.width, H = cv.height, cx = W / 2;
    c.clearRect(0, 0, W, H);
    // 背光与落地阴影（不属于衣服本身）
    const gr = c.createRadialGradient(cx, H * 0.42, 4, cx, H * 0.42, W * 0.8);
    gr.addColorStop(0, "rgba(255,236,190,0.16)");
    gr.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = gr; c.fillRect(0, 0, W, H);
    c.fillStyle = "rgba(0,0,0,0.45)";
    c.beginPath(); c.ellipse(cx, H * 0.93, 34, 7, 0, 0, Math.PI * 2); c.fill();
    // 造一个"站在原地、没开手电、没入水"的假玩家，交给游戏自己的绘制函数
    const fakeP = { x: 0, y: 0, faceX: 1, faceY: 0 };
    const fakeG = {
      outfit: key || "drifter", flashlight: false, sink: 0, time: 0,
      player: fakeP, wretch: 0, wretchLoop: 0, wretchK: 0, dead: false,
      map: null, level: "0", phase: "playing"
    };
    c.save();
    c.translate(cx, H * 0.55);
    const k = Math.min(W / 30, H / 40) * 1.05;
    c.scale(k, k);
    try { drawPlayer(c, fakeP, 0, fakeG); window.__outfitPreviewErr = ""; }
    catch (e) { window.__outfitPreviewErr = String((e && e.stack) || e); }
    c.restore();
    const def = OUTFITS[key] || OUTFITS.drifter;
    if (el.outfitPreviewName) el.outfitPreviewName.textContent = def.name;
  }

  function showOutfitDesc(key) {
    const def = OUTFITS[key];
    if (!def) return;
    const ok = outfitUnlocked(def);
    let html = "<p>" + escapeHtml(def.desc) + "</p>";
    html += ok
      ? '<p style="color:#5a7a34;">（当前穿着：' + escapeHtml(def.name) + "）</p>"
      : '<p style="color:#8a7a5a;">（' + escapeHtml(outfitLockText(def)) + "）</p>";
    el.outfitDesc.innerHTML = html;
  }

  // ---------------------------------------------------------------------
  // 没有专属物品栏贴图的物品：图标 = 它在地图上的样子缩小后的版本。
  // 地图与图标共用 drawItemSprite，不另画一套，也不会再出现空白方块。
  // ---------------------------------------------------------------------
  const ITEM_ART_KEYS = new Set([
    "memoryjuice", "bntgcoin", "ksuit", "warpberry", "bntgwarp", "choc", "soda",
    "hotchoc", "wintercoat", "spacedrink", "memoryjar", "coldsuit", "energybar",
    "hermes", "teddy", "plush", "marshmallow", "block", "frog", "subkey",
    "bag1", "bag2", "bag3", "bag4",
  ]);
  function itemIconCanvas(key) {
    const cv = document.createElement("canvas");
    cv.width = 44; cv.height = 52;                 // 2 倍超采样，CSS 里仍是 22×26
    const cx = cv.getContext("2d");
    cx.scale(2, 2);
    cx.translate(11, 13);
    cx.scale(0.9, 0.9);
    try { drawItemSprite(cx, { item: key, x: 0, disguised: false }, 0, 0); }
    catch (e) { /* 画不出来就留空，不让整个背包报错 */ }
    return cv;
  }
  function paintItemIcon(node, cls, key) {
    if (!node) return;
    node.className = cls + " " + (key || "") + (ITEM_ART_KEYS.has(key) ? " art" : "");
    node.innerHTML = "";
    if (key && ITEM_ART_KEYS.has(key)) node.appendChild(itemIconCanvas(key));
  }

  // ---------- 背包（快捷键 Tab / 手机端点「背包」按钮） ----------
  function openBag() {
    const g = game;
    if (g && g.phase === "bag") { closeBag(); return; }
    if (g) {
      if (g.phase === "reading") { hide(el.archive); g.reading = null; }
      if (g.phase === "playing" || g.phase === "reading" || g.phase === "paused") g.manualReturn = g.phase;
      g.phase = "bag";
    }
    hide(el.pickupHint);
    hide(el.doorHint);
    hide(el.btnDoor);
    renderBag();
    show(el.bag);
  }

  function closeBag() {
    const g = game;
    hide(el.bag);
    if (g) g.phase = g.manualReturn || "playing";
    else show(el.menu);
  }

  let bagSel = null;        // 背包里当前选中的格子（下标）
  let bagSelKey = null;     // 选中格子对应的物品键

  // ---------------------------------------------------------------------
  // 手里拿着的（3 个快捷键槽）与背包里的，是同一批东西的两份视图。
  // 手上的优先：按槽 1 > 2 > 3 的顺序从背包池里取，池里不够了那个槽就是空的。
  // 所以：捡到一件东西 -> 先填槽 1，槽 1 有别的东西就槽 2 ... 三个槽都占着
  // 才只是进背包。放进槽里的东西不算"背包里的格子"，背包会相应变少。
  // ---------------------------------------------------------------------
  // 所有物品都存在 g.inv 里；三个主物品槽和副手槽只是「同一批东西的视图」，
  // 每个视图占掉一件。按 主槽1 > 2 > 3 > 副手 的顺序从池里取，取不到的槽就是空的，
  // 剩下的才出现在背包格子里。这样把摄像机从副手挪到背包／主槽，不用搬 inv 计数。
  function equippedHeld() {
    const g = game;
    const pool = {};
    const hot = [null, null, null];
    let off = null;
    if (!g) return { hot, off, pool };
    for (const k in g.inv) pool[k] = g.inv[k] | 0;
    if (g.hotbar) {
      for (let i = 0; i < 3; i++) {
        const key = g.hotbar[i];
        if (!key || (pool[key] | 0) <= 0) continue;
        hot[i] = key; pool[key]--;
      }
    }
    if (g.offhand && (pool[g.offhand] | 0) > 0) { off = g.offhand; pool[g.offhand]--; }
    return { hot, off, pool };
  }
  function hotHeld() { return equippedHeld().hot; }
  function offHeld() { return equippedHeld().off; }
  function bagPool() { return equippedHeld().pool; }

  // 背包 = 格子：一件物品占一格，不叠加。没有的物品就是不存在的格子。
  function bagUnits() {
    const g = game;
    const out = [];
    if (!g) return out;
    // 注意：这份名单必须覆盖所有"该占格子"的物品 —— 漏掉的即使拿到了也
    // 不会出现在背包里，玩家看不见更用不了（赫尔墨斯装置和玩具熊就漏过）。
    // 例外：bag1~bag4 是容量升级、bntgcoin 是货币，两者都不占格子。
    const order = ["almond", "bad", "crowbar", "torch", "camera", "key", "subkey", "meat",
      "divesuit", "submarine", "ksuit", "warpberry", "bntgwarp",
      "film_normal", "film_premium", "tape", "digicam", "battery",
      "hermes", "teddy", "plush", "marshmallow", "block", "frog",
      // 这九件以前漏在名单外：拿到了也进不了背包格子，等于既看不见也用不了。
      // 现在补进来，并和上面那些一样用地图上的样子当图标。
      "memoryjuice", "choc", "soda", "hotchoc", "wintercoat", "spacedrink",
      "memoryjar", "coldsuit", "energybar"];
    const pool = bagPool();
    for (const key of order) {
      const n = pool[key] | 0;
      for (let i = 0; i < n; i++) out.push(key);
    }
    return out;
  }
  // 格子总数 = 背包容量（无限时按内容往上取到 5 的倍数，至少 25）
  // 格子数 = 背包容量（拿到更大的背包就变多），装了东西的格子在前，后面全是空格
  function bagGridSize(units) {
    if (game && game.bagCapInfinite) return Math.max(25, Math.ceil(units.length / 5) * 5);
    return Math.max(1, bagCap() | 0);
  }

  function renderBag() {
    const g = game;
    const list = el.bagList;
    if (!list) return;
    list.innerHTML = "";
    const hint = document.getElementById("bag-hint");
    if (hint) hint.textContent = g ? ("容量 " + bagText()) : "点击格子查看，点左边槽位设快捷键";

    const units = bagUnits();
    const total = bagGridSize(units);

    for (let i = 0; i < total; i++) {
      const key = units[i];
      const cell = document.createElement("div");
      if (!key) {
        cell.className = "bag-cell blank";
        list.appendChild(cell);
        continue;
      }
      const def = ITEMS[key];
      cell.className = "bag-cell" + (bagSel === i ? " sel" : "");
      const ic = document.createElement("div");
      paintItemIcon(ic, "bc-ic", key);
      const nm = document.createElement("div");
      nm.className = "bc-nm";
      nm.textContent = bagCellName(key);
      cell.title = def ? def.name : key;
      cell.appendChild(ic);
      cell.appendChild(nm);
      cell.addEventListener("click", () => { bagSel = i; bagSelKey = key; renderBag(); });
      cell.addEventListener("dblclick", () => { bagSel = i; bagSelKey = key; bagUse(key); });
      bindDrag(cell, () => (bagUnits()[i] || null), "bag", null);
      list.appendChild(cell);
    }
    if (bagSel == null || bagSel >= units.length) { bagSel = units.length ? 0 : null; bagSelKey = units.length ? units[0] : null; }
    else bagSelKey = units[bagSel];
    if (bagSelKey) showBagDesc(bagSelKey);
    else if (el.bagDesc) el.bagDesc.innerHTML = '<p style="color:#8a7a5a;">背包是空的。</p>';
    renderHotSlots();
  }

  // ===========================================================
  // 拖拽：长按背包 / 快捷键里的物品，它会跟着鼠标走
  //   拖出背包界面之外 -> 丢在地上（地上会出现这件东西）
  //   拖到快捷键槽位上  -> 放进那个槽
  // ===========================================================
  const DRAG_MS = 400;                 // 长按多久开始拖
  let drag = null;                     // { key, ghost, from:"bag"|"hot", slot }

  function dragGhostEl() {
    let n = document.getElementById("drag-ghost");
    if (!n) {
      n = document.createElement("div");
      n.id = "drag-ghost";
      n.className = "drag-ghost hidden";
      document.body.appendChild(n);
    }
    return n;
  }
  function dragStart(key, from, slot, ev) {
    if (!key || !game) return;
    const gh = dragGhostEl();
    gh.innerHTML = "";
    const gic = document.createElement("div");
    paintItemIcon(gic, "bc-ic", key);
    gh.appendChild(gic);
    const gnm = document.createElement("div");
    gnm.className = "dg-nm";
    gnm.textContent = ITEMS[key] ? (ITEMS[key].short || ITEMS[key].name) : key;
    gh.appendChild(gnm);
    gh.classList.remove("hidden");
    drag = { key: key, from: from, slot: slot, moved: false };
    dragMove(ev);
  }
  function dragMove(ev) {
    if (!drag) return;
    const gh = dragGhostEl();
    const x = (ev.touches ? ev.touches[0].clientX : ev.clientX);
    const y = (ev.touches ? ev.touches[0].clientY : ev.clientY);
    gh.style.left = x + "px";
    gh.style.top = y + "px";
    drag.moved = true;
  }
  function dragEnd(ev) {
    if (!drag) return;
    const gh = dragGhostEl();
    gh.classList.add("hidden");
    const x = ev.clientX, y = ev.clientY;
    const key = drag.key, from = drag.from, slot = drag.slot;
    drag = null;
    const bagEl = document.getElementById("bag");
    const bagOpen = bagEl && !bagEl.classList.contains("hidden");

    // 松手在哪个元素上
    let over = null;
    try { over = document.elementFromPoint(x, y); } catch (e) { over = null; }

    // 落在快捷键槽位上：放进这个槽
    const hotSlot = over && over.closest ? over.closest(".bag-hot-slot") : null;
    if (hotSlot && game) {
      const idx = [...document.querySelectorAll(".bag-hot-slot")].indexOf(hotSlot);
      if (idx >= 0) { equipKey("hot", idx, key); return; }
    }
    const offSlot = over && over.closest ? over.closest(".bag-off-slot") : null;
    if (offSlot && game) { equipKey("off", 0, key); return; }

    // 拖出背包界面之外：丢在地上
    // 遮罩层是铺满全屏的，elementFromPoint 打在遮罩上也算"在 bag 里" ——
    // 得拿面板自身的矩形来判断，不然永远拖不出去。
    let insideBag = false;
    const panel = document.querySelector("#bag .panel");
    if (panel) {
      const r = panel.getBoundingClientRect();
      insideBag = (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom);
    } else if (over && bagEl) {
      insideBag = bagEl.contains(over);
    }
    // 底部三个快捷键槽也算"界面内"
    const hb = document.getElementById("hotbar");
    if (hb) {
      const r = hb.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
        dropDragged(key, from, slot);
        return;
      }
    }
    if (bagOpen && !insideBag) { dropDragged(key, from, slot); return; }
    if (!bagOpen) { dropDragged(key, from, slot); return; }
    // 没拖出去：当成普通点击，不动
  }

  function dropDragged(key, from, slot) {
    if (from === "off" && game && game.offhand === key) game.offhand = null;
    dropItemToGround(key, from === "hot" ? slot : -1);
    renderBag(); renderHotbar();
  }
  // 把一件东西丢在脚边（背包里少一个，地上多一个）
  function dropItemToGround(key, hotSlot) {
    const g = game;
    if (!g || !key) return;
    if ((g.inv[key] | 0) <= 0) return;
    if (hotSlot >= 0) {                    // 从快捷键拖出来的：先把槽腾空
      if (g.hotbar[hotSlot] === key) { g.hotbar[hotSlot] = null; saveHotbar(); }
    }
    removeItem(key, 1);
    // 录像带是「已经拍完的一卷」：把对应的档案 id 一起放在地上，别人捡起来才能看
    const tapeId = key === "tape" ? ((g.tapeIds || []).shift() || null) : null;
    // 落在玩家脚边那一格附近
    const tx = Math.floor(g.player.x / TILE), ty = Math.floor(g.player.y / TILE);
    let bx = tx, by = ty;
    const L = g.map.layers[g.floor];
    for (let r = 1; r <= 3 && !(L[by] && L[by][bx] === 0); r++) {
      for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
        const nx = tx + dx, ny = ty + dy;
        if (L[ny] && L[ny][nx] === 0) { bx = nx; by = ny; break; }
      }
    }
    const gd = { x: bx, y: by, floor: g.floor, item: key, taken: false, dropped: true };
    if (tapeId) gd.tapeId = tapeId;
    g.map.ground.push(gd);
    toast(tapeId
      ? "丢下了一卷录像带 —— 别的流浪者捡起来就能在视频档案里看"
      : "丢下了" + (ITEMS[key] ? (ITEMS[key].short || ITEMS[key].name) : key));
    if (tapeId && window.CamRec && CamRec.shareTape) {
      try { CamRec.shareTape(tapeId); } catch (e) { /* 忽略 */ }
    }
    updateBag(); updateHud(); renderBag(); renderHotbar();
  }

  // 给一个格子绑上"长按拖拽"
  function bindDrag(node, keyFn, from, slotFn) {
    if (!node) return;
    let timer = null, started = false;
    const down = (ev) => {
      started = false;
      timer = setTimeout(() => {
        started = true;
        dragStart(keyFn(), from, slotFn ? slotFn() : -1, ev);
      }, DRAG_MS);
    };
    const up = (ev) => {
      if (timer) { clearTimeout(timer); timer = null; }
      if (started) { dragEnd(ev); }
    };
    node.addEventListener("mousedown", down);
    node.addEventListener("touchstart", (ev) => down(ev.touches ? ev.touches[0] : ev), { passive: true });
    window.addEventListener("mouseup", up);
    node.addEventListener("touchend", (ev) => {
      const t = (ev.changedTouches && ev.changedTouches[0]) || {};
      up({ clientX: t.clientX || 0, clientY: t.clientY || 0 });
    });
    node.addEventListener("mousemove", (ev) => { if (drag) dragMove(ev); });
    node.addEventListener("touchmove", (ev) => { if (drag) dragMove(ev); }, { passive: true });
  }

  function bagCellName(key) {
    const def = ITEMS[key];
    let nm = def ? def.short || def.name : key;
    return nm;
  }

  // 捡起积木 / 发条青蛙 —— 传闻会把人带去 Level 18
  function tryKeepsake(g, key) {
    if (key !== "block" && key !== "frog") return false;
    goToLevel(g, 18, "手里这件小东西好像有点不对劲",
      "熟悉的味道、熟悉的声音 —— 你回到了一间幼儿园里 ...");
    return true;
  }

  // 使用一件物品（喝 / 用钥匙 / 装备类只给说明）
  function bagUse(key) {
    const g = game;
    if (!g || !key) return false;
    if ((g.inv[key] | 0) <= 0) { toast("你没有这个东西了。"); return false; }
    if (key === "almond" || key === "bad") {
      const ok = drink(key);
      updateBag(); updateHud(); renderHotbar();
      return ok;
    }
    // 1.3.0：记忆汁 —— 回满理智、好受一阵，之后垮得一次比一次快
    if (key === "memoryjuice") {
      const ok = drinkMemoryJuice();
      updateBag(); updateHud(); renderHotbar();
      return ok;
    }
    // 数码相机：装电池才能开机，一颗电池录满 3 分钟（720P / 30 帧每秒）
    if (key === "digicam") {
      if (window.DigiCam && DigiCam.isRecording()) { toast("数码相机已经在录了 —— 等这一卷走完"); return false; }
      if ((g.inv.battery | 0) <= 0) { toast("数码相机没电了 —— 物资箱或 B.N.T.G 商店能补电池"); return false; }
      try { closeBag(); } catch (e) { /* 忽略 */ }
      if (g.phase !== "playing") g.phase = "playing";
      const r = window.DigiCam && DigiCam.start(g);
      if (r && r.ok) {
        removeItem("battery", 1);       // 一颗电池装进机器，撑满这 3 分钟
        // 数码相机也走 L 起录：和摄像机一样照常扣掉一卷胶卷，中途收卷不退还
        const fk = (g.inv.film_normal | 0) > 0 ? "film_normal"
          : ((g.inv.film_premium | 0) > 0 ? "film_premium" : null);
        if (fk) removeItem(fk, 1);
        else toast("身上没有胶卷可扣 —— 数码相机靠电池仍可录像");
        if (window.DigiCam && DigiCam.noteBattery) DigiCam.noteBattery(g.inv.battery | 0);
        updateBag(); updateHud(); renderHotbar();
        return true;
      }
      toast(r && r.reason ? r.reason : "数码相机按下去没反应");
      return false;
    }
    // 摄像机：装一卷胶卷才能开录，按下即消耗；录完变成只能看的录像带
    if (key === "camera") {
      if (window.CamRec && CamRec.isRecording()) { toast("已经在录了 —— 等这一卷走完"); return false; }
      const fk = (g.inv.film_normal | 0) > 0 ? "film_normal"
        : ((g.inv.film_premium | 0) > 0 ? "film_premium" : null);
      if (!fk) {
        toast("没有胶卷了 —— B.N.T.G 商人之家 / Level 11 柜台能买到普通胶卷和高级胶卷");
        try { AudioSys.growl && AudioSys.growl(); } catch (e) { /* 忽略 */ }
        return false;
      }
      try { closeBag(); } catch (e) { /* 忽略 */ }
      if (g.phase !== "playing") g.phase = "playing";
      const r = window.CamRec && CamRec.start(g, fk);
      if (r && r.ok) {
        removeItem(fk, 1);
        updateBag(); updateHud(); renderHotbar();
        return true;
      }
      toast("这台摄像机按下去没反应");
      return false;
    }
    // K 版防化服：点一下就穿上，替换掉现在的衣服
    // （主菜单「服装」里的生化防护服挡不住 Level 301 的空气，只有这套算数）
    if (key === "ksuit") { wearKSuit(); return true; }
    // 迁跃浆果：第一颗记住层级，第二颗把你送回去（人工的那批会困住你）
    if (key === "warpberry" || key === "bntgwarp") { eatWarpBerry(g, key); return true; }
    // 赫尔墨斯装置：打开层级选择界面（耐久归零就打不开了）
    if (key === "hermes") {
      if (hermesDurability(g) <= 0) { toast("耐久已经归零 —— 这台装置无法继续使用了"); return false; }
      try { closeBag(); } catch (e) { /* 忽略 */ }
      if (g.phase !== "playing") g.phase = "playing";
      openHermes();
      return true;
    }
    // Level 20 的补给：巧克力棒 / 软饮料 / 热巧克力 / 太空饮料 / 记忆罐
    if (key === "choc" || key === "soda" || key === "hotchoc" || key === "spacedrink" || key === "memoryjar") {
      return eatSnack20(key);
    }
    // 冬装衣物：穿上之后能挡住 Level 20 的低温一阵子
    if (key === "wintercoat") return wearWinter20();
    // 工具 / 装备：拿在手上就行，没有"使用"动作
    toast(ITEMS[key].name + " —— 拿在手上就会生效。");
    return false;
  }

  // ===========================================================
  // 1.3.0 · 商人之家（Level 1 下层）的摊位
  //   不是一个柜台卖全部：每家摊位只摆自己那几样，同一件货可能几家都有，
  //   价格差个 1~2 瓶杏仁水。货币不够时可以一键按 1 瓶 = 5 枚用杏仁水补足。
  //   记忆汁只有这里卖；Level 11 的 B.N.T.G 柜台不进货。
  // ===========================================================
  let merchantStallCur = null;
  function openMerchantStall(p) {
    const g = game;
    if (!g) return;
    const st = p && p.stall;
    if (!st) { toast("这个摊位这会儿空着"); return; }
    if (g.phase === "playing" || g.phase === "paused" || g.phase === "reading") g.manualReturn = g.phase;
    g.phase = "merchant";
    hide(el.pickupHint); hide(el.doorHint); hide(el.btnDoor);
    merchantStallCur = st;
    let box = document.getElementById("merchant-stall");
    if (!box) {
      box = document.createElement("div");
      box.id = "merchant-stall";
      box.style.cssText = "position:fixed;inset:0;z-index:9990;align-items:center;"
        + "justify-content:center;background:rgba(6,8,10,.72);";
      document.body.appendChild(box);
    }
    box.style.display = "flex";
    renderMerchantStall(box);
  }
  function closeMerchantStall() {
    const box = document.getElementById("merchant-stall");
    if (box) { box.style.display = "none"; box.innerHTML = ""; }
    merchantStallCur = null;
    const g = game;
    if (g) { g.phase = g.manualReturn || "playing"; g.manualReturn = null; }
  }
  function renderMerchantStall(box) {
    const g = game, st = merchantStallCur;
    if (!g || !st || !box) return;
    box.innerHTML = "";
    const card = document.createElement("div");
    card.style.cssText = "width:min(640px,92vw);max-height:84vh;overflow:auto;background:#f3efe2;"
      + "color:#2f2c24;border:2px solid #b9ae8c;border-radius:6px;padding:18px 20px;"
      + "box-shadow:0 20px 70px rgba(0,0,0,.6);";
    const h = document.createElement("div");
    h.style.cssText = "display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;";
    const ttl = document.createElement("h3");
    ttl.style.cssText = "margin:0;font-size:19px;"; ttl.textContent = "商人之家 · " + st.name;
    const x = document.createElement("button");
    x.type = "button"; x.textContent = "✕";
    x.style.cssText = "background:none;border:0;font-size:20px;cursor:pointer;color:#6a6252;";
    x.addEventListener("click", closeMerchantStall);
    h.appendChild(ttl); h.appendChild(x); card.appendChild(h);
    const sub = document.createElement("div");
    sub.style.cssText = "font-size:13px;color:#6a6252;margin-bottom:12px;";
    sub.textContent = "杏仁水 " + (g.inv.almond | 0) + " 瓶 · B.N.T.G 货币 " + (g.inv.bntgcoin | 0)
      + " 枚　（1 瓶 = 5 枚，货币不够可以一键用杏仁水补）";
    card.appendChild(sub);

    for (const item of st.goods) {
      const def = (typeof ITEMS !== "undefined" && ITEMS[item.key]) || {};
      const row = document.createElement("div");
      row.style.cssText = "display:flex;align-items:center;gap:10px;padding:9px 4px;"
        + "border-top:1px solid rgba(120,110,80,.28);flex-wrap:wrap;";
      const nm = document.createElement("div");
      nm.style.cssText = "flex:1 1 150px;min-width:130px;";
      const strong = document.createElement("div");
      strong.style.cssText = "font-weight:bold;font-size:14px;";
      strong.textContent = def.name || item.key;
      const desc = document.createElement("div");
      desc.style.cssText = "font-size:12px;color:#6a6252;";
      desc.textContent = "身上 " + (g.inv[item.key] | 0) + " 件 · " + item.price + " 瓶 / " + item.coin + " 枚"
        + (item.isLevelKey ? "　【" + (item.tierName || "随机定价") + " · 钥匙】" : "");
      nm.appendChild(strong); nm.appendChild(desc); row.appendChild(nm);

      const mkBtn = (label, fn, disabled) => {
        const b = document.createElement("button");
        b.type = "button"; b.textContent = label;
        b.disabled = !!disabled;
        b.style.cssText = "padding:6px 11px;cursor:pointer;border:1px solid #b9ae8c;"
          + "border-radius:3px;background:#e7e0c9;color:#3a352a;font-size:13px;";
        if (disabled) b.style.opacity = "0.45";
        b.addEventListener("click", fn);
        return b;
      };
      row.appendChild(mkBtn("杏仁水买", () => merchantBuy(item, "almond"), (g.inv.almond | 0) < item.price));
      const coinShort = (g.inv.bntgcoin | 0) < item.coin;
      row.appendChild(mkBtn(coinShort ? "货币不足 · 用杏仁水补" : "货币买",
        () => merchantBuy(item, "coin"), false));
      card.appendChild(row);
    }
    const foot = document.createElement("div");
    foot.style.cssText = "margin-top:12px;font-size:12px;color:#7b725e;";
    foot.textContent = "各家要价不一样 —— 同一件货多走两家，能省下 1~2 瓶杏仁水。"
      + "层级密钥是随机进货的：卖哪几层、几把、几个摊位、什么价，每次进来都不一样；"
      + "被明令禁止的层级不进货。";
    card.appendChild(foot);
    renderRecycle(card, g, "stall:" + (st.id || st.name), () => renderMerchantStall(box));
    box.appendChild(card);
  }
  function merchantBuy(item, pay) {
    const g = game;
    if (!g || !item) return;
    const almond = g.inv.almond | 0, coin = g.inv.bntgcoin | 0;
    const cost = pay === "coin" ? item.coin : item.price;
    if (pay === "coin" && coin < cost) {
      // 一键补足：按 1 瓶 = 5 枚，缺多少币就换多少瓶（向上取整）
      const bottles = Math.ceil((cost - coin) / 5);
      if (almond < bottles) {
        toast("货币不够，杏仁水也不够补 —— 还差 " + bottles + " 瓶");
        try { AudioSys.growl && AudioSys.growl(); } catch (e) { /* 忽略 */ }
        return;
      }
      removeItem("almond", bottles);
      addItem("bntgcoin", bottles * 5);
      toast("用 " + bottles + " 瓶杏仁水补了 " + (bottles * 5) + " 枚 B.N.T.G 货币");
    } else if (pay === "almond" && almond < cost) {
      toast("杏仁水不够 —— 还差 " + (cost - almond) + " 瓶");
      return;
    }
    if (pay === "coin") removeItem("bntgcoin", cost);
    else removeItem("almond", cost);
    addItem(item.key, 1);
    markBntgBought(g, item.key);
    if (item.key === "digicam") { addItem("battery", 3); toast("随机器附送 3 颗相机电池"); }
    try { AudioSys.click && AudioSys.click(); } catch (e) { /* 忽略 */ }
    const def = (typeof ITEMS !== "undefined" && ITEMS[item.key]) || {};
    toast("买下了" + (def.name || item.key) + " —— " + cost + (pay === "coin" ? " 枚" : " 瓶"));
    const box = document.getElementById("merchant-stall");
    if (box) renderMerchantStall(box);
    updateBag(); updateHud(); renderHotbar();
  }

  // ===========================================================
  // B.N.T.G 新时代广场的柜台
  // 杏仁水在这里就是钱：一瓶买一根撬棍，一根撬棍也能换回一瓶。
  // 8 瓶能换那套 K 版防化服 —— 它是唯一能挡住 Level 301 空气的东西。
  // ===========================================================
  const BNTG_GOODS = [
    { key: "crowbar", price: 1, icon: "🔧",
      desc: "一根锈迹斑斑的铁撬棍。补给箱的木盖得靠它撬开。" },
    { key: "meat", price: 3, icon: "🍖",
      desc: "一块上好的生肉。据说带着它去见「萨曼莎」，她就不会为难你。" },
    { key: "bntgwarp", price: 4, icon: "🫐",
      desc: "B.N.T.G 培育的迁跃浆果。第一颗记住层级，第二颗就把你送回那里 —— "
          + "但这批是人工的，第二颗下去你会被困在 Level 10，再也切不出去。买之前想清楚。" },
    { key: "ksuit", price: 8, icon: "☣",
      desc: "B.N.T.G 的全封闭防化服，眼罩是一整块黑色长方形玻璃，背后背着滤毒罐。"
          + "目前已知唯一能挡住 Level 301 空气的东西 —— 穿上它会替换你现在的衣服。" },
    { key: "film_normal", price: 1, icon: "🎞",
      desc: "普通胶卷：1 瓶杏仁水或 5 枚 B.N.T.G 货币。装进摄像机录 12 秒、每秒 24 帧，"
          + "整卷帧间隔一致，一卷只能录一次。" },
    { key: "film_premium", price: 3, icon: "🎞",
      desc: "高级胶卷：3 瓶杏仁水或 15 枚 B.N.T.G 货币。录 30 秒、每秒 30 帧，"
          + "帧间隔同样严格一致，一卷只能录一次。" },
    { key: "digicam", price: 20, icon: "📷",
      desc: "数码相机：20 瓶杏仁水或 100 枚 B.N.T.G 货币，随机器附送 3 颗电池。"
          + "一颗电池录 3 分钟，720P、每秒 30 帧，花屏很轻。" },
    { key: "battery", price: 2, icon: "🔋",
      desc: "相机电池：2 瓶杏仁水或 10 枚 B.N.T.G 货币。一颗撑满一次 3 分钟录制。" },
  ];

  function openBntgShop() {
    const g = game;
    if (!g) return;
    if (g.phase === "playing" || g.phase === "paused" || g.phase === "reading") g.manualReturn = g.phase;
    g.phase = "bntg";
    hide(el.pickupHint); hide(el.doorHint); hide(el.btnDoor);
    renderBntgShop();
    show(el.bntg);
  }
  function closeBntgShop() {
    hide(el.bntg);
    const g = game;
    if (g) { g.phase = g.manualReturn || "playing"; g.manualReturn = null; }
  }

  // ===========================================================
  // Level 4 · 办公电脑
  // 废弃办公室里偶尔还能开机的一批老机器。开机进一个老式桌面：
  // 浏览器 / 计算器 / 扫雷 / 我的电脑。网线早就断了，信号只有 2~3 格（2G~3G），
  // 浏览器里只有两个地方打得开：主菜单的攻略站，和网络邮件。
  // 邮件是这台机器唯一的用处 —— 订购赫尔墨斯装置。
  // ===========================================================
  const PC4_APPS = [
    { key: "browser", ico: "🌐", name: "浏览器" },
    { key: "mail",    ico: "✉️", name: "网络邮件" },
    { key: "calc",    ico: "🧮", name: "计算器" },
    { key: "mine",    ico: "💣", name: "扫雷" },
    { key: "disk",    ico: "💾", name: "我的电脑" },
  ];
  // 整个后室只有这两个地址打得开 —— 别的都是"未连接的网络"
  const PC4_SITES = {
    "www.tutorial.thebackrooms2d.de5.net": { t: "后室信息站", kind: "guide" },
    "uec6626@backmail.com": { t: "网络邮件", kind: "mail" },
  };
  const HERMES_PRICE = 50;                 // 订购价：50 瓶杏仁水，不收 B.N.T.G 货币

  const pc4 = { app: null, disk: 0, wifi: 0, net: "2G", mail: null };

  function pc4EnsureDisk(g) {
    // 硬盘容量 64G~256G，同一局里几台机器看到的是同一个数（存档里只记一次）
    if (!g.pc4Disk) g.pc4Disk = 64 + Math.floor(Math.random() * 193);   // 64 ~ 256
    if (!g.pc4Wifi) g.pc4Wifi = 2 + (Math.random() < 0.5 ? 0 : 1);      // 2 ~ 3 格
    pc4.disk = g.pc4Disk;
    pc4.wifi = g.pc4Wifi;
    pc4.net = pc4.wifi >= 3 ? "3G" : "2G";
  }

  function pc4RenderTray() {
    const w = $("pc4-wifi");
    if (w) {
      w.innerHTML = "";
      for (let i = 1; i <= 4; i++) {
        const b = document.createElement("i");
        if (i <= pc4.wifi) b.className = "on";
        w.appendChild(b);
      }
    }
    const n = $("pc4-net"); if (n) n.textContent = pc4.net;
    const c = $("pc4-clock");
    if (c) { const d = new Date(); c.textContent = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); }
  }

  function pc4RenderDesktop() {
    const box = $("pc4-desktop");
    if (!box) return;
    box.innerHTML = "";
    for (const a of PC4_APPS) {
      const b = document.createElement("button");
      b.className = "pc4-icon"; b.type = "button";
      b.innerHTML = '<span class="pc4-ico">' + a.ico + '</span><span>' + a.name + '</span>';
      b.addEventListener("click", () => pc4Open(a.key, a.name));
      box.appendChild(b);
    }
  }

  function pc4Window(title, bodyNode, onClose) {
    const app = $("pc4-app");
    if (!app) return null;
    app.classList.remove("hidden");
    app.innerHTML = "";
    const head = document.createElement("div");
    head.className = "pc4-win-head";
    const t = document.createElement("span");
    t.className = "pc4-win-t"; t.textContent = title;
    head.appendChild(t);
    const bx = document.createElement("button");
    bx.className = "pc4-win-btn"; bx.type = "button"; bx.textContent = "✕";
    bx.addEventListener("click", () => pc4CloseApp());
    head.appendChild(bx);
    const body = document.createElement("div");
    body.className = "pc4-win-body";
    if (bodyNode) body.appendChild(bodyNode);
    app.appendChild(head); app.appendChild(body);
    const task = $("pc4-task"); if (task) task.textContent = title;
    return body;
  }

  function pc4CloseApp() {
    const app = $("pc4-app");
    if (app) { app.classList.add("hidden"); app.innerHTML = ""; }
    const task = $("pc4-task"); if (task) task.textContent = "";
    pc4.app = null;
  }

  // ---------- 浏览器 ----------
  function pc4OpenBrowser(name, goUrl) {
    const wrap = document.createElement("div");
    const bar = document.createElement("div");
    bar.className = "pc4-br-bar";
    const url = document.createElement("input");
    url.className = "pc4-url"; url.type = "text";
    url.spellcheck = false; url.autocomplete = "off";
    url.placeholder = "输入网址（信号 " + pc4.net + "）";
    url.value = goUrl || "";
    const go = document.createElement("button");
    go.className = "pc4-go"; go.type = "button"; go.textContent = "前往";
    bar.appendChild(url); bar.appendChild(go);
    const page = document.createElement("div");
    page.className = "pc4-page";
    const bm = document.createElement("div");
    bm.className = "pc4-bookmarks";
    bm.innerHTML = '打得开的只有这两处：<span class="pc4-link" data-u="www.tutorial.thebackrooms2d.de5.net">www.tutorial.thebackrooms2d.de5.net</span>'
      + ' · <span class="pc4-link" data-u="uec6626@backmail.com">uec6626@backmail.com</span>';
    wrap.appendChild(bar); wrap.appendChild(page); wrap.appendChild(bm);
    bm.addEventListener("click", (e) => {
      const u = e.target && e.target.dataset ? e.target.dataset.u : null;
      if (u) { url.value = u; pc4Go(page, u); }
    });

    const nav = () => pc4Go(page, (url.value || "").trim());
    go.addEventListener("click", nav);
    url.addEventListener("keydown", (e) => { if (e.key === "Enter") nav(); });
    pc4Window(name || "浏览器", wrap);
    if (goUrl) pc4Go(page, goUrl);
    else pc4RenderHome(page);
    setTimeout(() => { try { url.focus(); } catch (e) { /* 忽略 */ } }, 40);
  }

  function pc4RenderHome(page) {
    page.innerHTML = '<h4>无法连接到网络</h4>'
      + '<p class="dim">这台机器接的那根线早就断了。地址栏里输入网址试试 —— '
      + '能打开的只剩两处。</p>'
      + '<p class="dim">右下角信号 ' + pc4.wifi + ' 格（' + pc4.net + '）。</p>';
  }

  function pc4Go(page, raw) {
    if (!page) return;
    const u = String(raw || "").trim();
    if (!u) { pc4RenderHome(page); return; }
    const key = u.toLowerCase().replace(/^https?:\/\//, "").replace(/\/+$/, "");
    if (PC4_SITES[key]) {
      if (PC4_SITES[key].kind === "mail") pc4RenderMail(page);
      else pc4RenderGuide(page);
      return;
    }
    // 别的站点一律打不开 —— 不是"页面不存在"，而是根本连不上
    page.innerHTML = '<h4>未连接的网络</h4>'
      + '<p class="dim">正在打开 <b>' + u.replace(/[<>&]/g, "") + '</b> …</p>'
      + '<p class="warn">连接超时。这台机器没有可以访问该地址的网络。</p>'
      + '<p class="dim">（信号 ' + pc4.wifi + ' 格 · ' + pc4.net + '）</p>';
  }

  // Level 4 电脑里能打开的那一个站：直接把官站嵌进这台"浏览器"。
  // 层级按钮、分类链接都由站点自己接管 —— 这里不摆任何静态清单。
  const PC4_GUIDE_URL = "https://www.tutorial.thebackrooms2d.de5.net";
  function pc4RenderGuide(page) {
    page.innerHTML = "";
    const f = document.createElement("iframe");
    f.src = PC4_GUIDE_URL;
    f.setAttribute("scrolling", "yes");
    f.style.cssText = "display:block;width:100%;height:480px;border:0;background:#fff;";
    let ok = false;
    f.addEventListener("load", () => { ok = true; });
    f.addEventListener("error", () => { pc4GuideFail(page); });
    page.appendChild(f);
    setTimeout(() => { if (!ok && f.parentNode === page) pc4GuideFail(page); }, 10000);
  }
  function pc4GuideFail(page) {
    page.innerHTML = '<h4>站点暂时没加载出来</h4>'
      + '<p class="dim">www.tutorial.thebackrooms2d.de5.net</p>'
      + '<p class="dim">点地址栏的「前往」重试。</p>';
  }

  // ---------- 网络邮件（赫尔墨斯装置的唯一来路） ----------
  function pc4RenderMail(page) {
    const g = game;
    page.innerHTML = "";
    const h = document.createElement("h4");
    h.textContent = "网络邮件 · UEC6626@backmail.com";
    page.appendChild(h);

    const list = document.createElement("div");
    list.className = "pc4-mail-list";
    const m1 = document.createElement("div");
    m1.className = "pc4-mail-item";
    m1.innerHTML = '<b>UEC 商务部</b> <span>· 赫尔墨斯装置（定制）</span>'
      + '<div style="color:#5d6b7a">本机不发售。汇款 50 瓶杏仁水，并在回信里写明送达层级。'
      + '不接受 B.N.T.G 货币。</div>';
    list.appendChild(m1);
    if (g && g.hermesOrder != null) {
      const m2 = document.createElement("div");
      m2.className = "pc4-mail-item";
      m2.innerHTML = '<b>UEC 商务部</b> <span>· 已受理</span>'
        + '<div style="color:#5d6b7a">包裹将在「Level ' + levelCodeName(g.hermesOrder) + '」的入口处出现。'
        + '注意：不会靠近 M.E.G 基地。</div>';
      list.appendChild(m2);
    }
    page.appendChild(list);

    const rows = document.createElement("div");
    const r1 = document.createElement("div");
    r1.className = "pc4-mail-row";
    r1.innerHTML = '<label>收件人</label>';
    const to = document.createElement("input");
    to.type = "text"; to.value = "UEC6626@backmail.com"; to.readOnly = true;
    r1.appendChild(to); rows.appendChild(r1);

    const r2 = document.createElement("div");
    r2.className = "pc4-mail-row";
    r2.innerHTML = '<label>送达层级</label>';
    const lv = document.createElement("select");
    for (const o of hermesOrderOptions()) {
      const op = document.createElement("option");
      op.value = o.code; op.textContent = o.name;
      lv.appendChild(op);
    }
    r2.appendChild(lv); rows.appendChild(r2);

    const r3 = document.createElement("div");
    r3.className = "pc4-mail-row";
    r3.innerHTML = '<label>正文</label>';
    const ta = document.createElement("textarea");
    ta.className = "pc4-mail-ta";
    ta.value = "订购赫尔墨斯装置一台。随信汇上 50 瓶杏仁水。送达层级见上。";
    r3.appendChild(ta); rows.appendChild(r3);
    page.appendChild(rows);

    const foot = document.createElement("div");
    const send = document.createElement("button");
    send.className = "pc4-send"; send.type = "button";
    const almond = g ? (g.inv.almond | 0) : 0;
    send.textContent = "发送并支付 " + HERMES_PRICE + " 瓶杏仁水";
    send.disabled = almond < HERMES_PRICE;
    foot.appendChild(send);
    page.appendChild(foot);

    const msg = document.createElement("div");
    msg.className = "pc4-msg hidden";
    page.appendChild(msg);
    const say = (t, k) => { msg.className = "pc4-msg " + (k || "info"); msg.textContent = t; };

    if (almond < HERMES_PRICE) {
      say("杏仁水不够 —— 还差 " + (HERMES_PRICE - almond) + " 瓶。这台机器不收 B.N.T.G 货币。", "err");
    }

    send.addEventListener("click", () => {
      const gg = game;
      if (!gg) return;
      if ((gg.inv.almond | 0) < HERMES_PRICE) {
        say("余额不足。只收杏仁水，" + HERMES_PRICE + " 瓶，不收 B.N.T.G 货币。", "err");
        return;
      }
      const target = lv.value;
      gg.inv.almond = (gg.inv.almond | 0) - HERMES_PRICE;
      if ((gg.inv.almond | 0) <= 0) delete gg.inv.almond;
      gg.hermesOrder = target;
      updateBag(); updateHud(); renderHotbar();
      say("已汇款。包裹会在「Level " + levelCodeName(target) + "」的入口处出现 —— 记住，它不会靠近 M.E.G 基地。", "ok");
      send.disabled = true;
      toast("邮件已发送 · 杏仁水 -" + HERMES_PRICE);
      // 人已经站在这个层级上的话，包裹直接送到脚边
      if (String(gg.level) === String(target)) spawnHermesParcel(gg);
      setTimeout(() => pc4RenderMail(page), 1600);
    });
  }

  function pc4OpenCalc(name) {
    const wrap = document.createElement("div");
    const box = document.createElement("div");
    box.className = "pc4-calc";
    const disp = document.createElement("div");
    disp.className = "pc4-calc-disp"; disp.textContent = "0";
    box.appendChild(disp);
    const keys = document.createElement("div");
    keys.className = "pc4-calc-keys";
    const st = { a: null, op: null, fresh: true };
    const show = (v) => { disp.textContent = String(v); };
    const keysDef = ["7","8","9","/","4","5","6","*","1","2","3","-","0",".","=","+"];
    const calc = () => {
      const b = parseFloat(disp.textContent) || 0;
      if (st.op && st.a != null) {
        let r = st.a;
        if (st.op === "+") r = st.a + b;
        else if (st.op === "-") r = st.a - b;
        else if (st.op === "*") r = st.a * b;
        else if (st.op === "/") r = b === 0 ? NaN : st.a / b;
        st.a = null; st.op = null;
        show(Number.isNaN(r) ? "错误" : Math.round(r * 1e10) / 1e10);
      }
    };
    for (const k of keysDef) {
      const b = document.createElement("button");
      b.type = "button"; b.textContent = k;
      if ("/*-+".indexOf(k) >= 0) b.className = "op";
      if (k === "=") b.className = "eq";
      b.addEventListener("click", () => {
        if (k === "=") { calc(); st.fresh = true; return; }
        if ("/*-+".indexOf(k) >= 0) {
          st.a = parseFloat(disp.textContent) || 0; st.op = k; st.fresh = true; return;
        }
        if (disp.textContent === "错误") { disp.textContent = "0"; st.fresh = true; }
        if (st.fresh) { disp.textContent = (k === "." ? "0." : k); st.fresh = false; }
        else disp.textContent = disp.textContent + k;
      });
      keys.appendChild(b);
    }
    const clr = document.createElement("button");
    clr.type = "button"; clr.textContent = "C";
    clr.addEventListener("click", () => { disp.textContent = "0"; st.a = null; st.op = null; st.fresh = true; });
    keys.appendChild(clr);
    box.appendChild(keys);
    wrap.appendChild(box);
    pc4Window(name || "计算器", wrap);
  }

  // ---------- 扫雷 ----------
  function pc4OpenMine(name) {
    const W = 9, H = 9, MINES = 10;
    const wrap = document.createElement("div");
    const box = document.createElement("div");
    box.className = "pc4-mine-wrap";
    const bar = document.createElement("div");
    bar.className = "pc4-mine-bar";
    const left = document.createElement("span"); left.textContent = "剩余 " + MINES;
    const again = document.createElement("button");
    again.type = "button"; again.textContent = "重开";
    bar.appendChild(left); bar.appendChild(again);
    const grid = document.createElement("div");
    grid.className = "pc4-mine-grid";
    grid.style.gridTemplateColumns = "repeat(" + W + ", 24px)";
    const tip = document.createElement("div");
    tip.className = "pc4-mine-tip";
    tip.textContent = "左键翻开 · 右键（或长按）插旗";
    box.appendChild(bar); box.appendChild(grid); box.appendChild(tip);
    wrap.appendChild(box);
    pc4Window(name || "扫雷", wrap);

    let over = false, opened = 0, flags = 0;
    const cells = [];
    const mine = new Array(W * H).fill(false);
    const num = new Array(W * H).fill(0);

    function build() {
      let placed = 0;
      while (placed < MINES) {
        const i = Math.floor(Math.random() * W * H);
        if (mine[i]) continue;
        mine[i] = true; placed++;
      }
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        if (mine[y * W + x]) continue;
        let n = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
          if (mine[ny * W + nx]) n++;
        }
        num[y * W + x] = n;
      }
    }
    function flood(i) {
      const q = [i];
      while (q.length) {
        const c = q.pop();
        const idx = c;
        if (cells[idx].classList.contains("open")) continue;
        cells[idx].classList.add("open");
        opened++;
        if (num[idx] !== 0) { cells[idx].textContent = num[idx]; continue; }
        const x = idx % W, y = Math.floor(idx / W);
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
          const ni = ny * W + nx;
          if (!cells[ni].classList.contains("open") && !cells[ni].classList.contains("flag")) q.push(ni);
        }
      }
    }
    function finish(win) {
      over = true;
      for (let i = 0; i < W * H; i++) {
        if (mine[i] && !win) { cells[i].classList.add("boom"); cells[i].textContent = "💥"; }
      }
      tip.textContent = win ? "排完了 —— 这台机器总算有点用。" : "踩雷了。点「重开」再来。";
    }
    function render() {
      grid.innerHTML = ""; cells.length = 0;
      over = false; opened = 0; flags = 0;
      mine.fill(false); num.fill(0);
      build();
      left.textContent = "剩余 " + MINES;
      tip.textContent = "左键翻开 · 右键（或长按）插旗";
      for (let i = 0; i < W * H; i++) {
        const c = document.createElement("div");
        c.className = "pc4-cell";
        c.addEventListener("click", () => {
          if (over || c.classList.contains("open") || c.classList.contains("flag")) return;
          if (mine[i]) { c.classList.add("boom"); c.textContent = "💥"; finish(false); return; }
          flood(i);
          if (opened === W * H - MINES) finish(true);
        });
        c.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          if (over || c.classList.contains("open")) return;
          c.classList.toggle("flag");
          c.textContent = c.classList.contains("flag") ? "🚩" : "";
          flags += c.classList.contains("flag") ? 1 : -1;
          left.textContent = "剩余 " + (MINES - flags);
        });
        cells.push(c); grid.appendChild(c);
      }
    }
    again.addEventListener("click", render);
    render();
  }

  function pc4OpenDisk(name) {
    const g = game;
    const wrap = document.createElement("div");
    const d = document.createElement("div");
    d.className = "pc4-page";
    const used = Math.max(1, Math.round(pc4.disk * 0.42));
    d.innerHTML = '<h4>我的电脑</h4>'
      + '<p>本地磁盘 (C:) —— <b>' + used + ' GB 已用 / 共 ' + pc4.disk + ' GB</b></p>'
      + '<p class="dim">剩下的空间里全是些没人认领的文档，文件名是一串编号。</p>'
      + '<p class="dim">网络：信号 ' + pc4.wifi + ' 格（' + pc4.net + '）—— 时断时续。</p>'
      + '<p class="dim">这台机器的主人大概再也不会回来了。</p>';
    wrap.appendChild(d);
    pc4Window(name || "我的电脑", wrap);
  }

  function pc4Open(key, name) {
    const g = game;
    if (!g) return;
    pc4.app = key;
    if (key === "calc") return pc4OpenCalc(name);
    if (key === "mine") return pc4OpenMine(name);
    if (key === "disk") return pc4OpenDisk(name);
    if (key === "mail") return pc4OpenBrowser(name, "uec6626@backmail.com");
    return pc4OpenBrowser(name, "");
  }

  // ===========================================================
  // Level 601 · 大厅正中那台还在运行的电脑
  //   网线早就断了 —— 连不上任何网络，也打不开任何网址（托盘永远是"未连接"，
  //   桌面上也没有浏览器）。硬盘里只剩三个 .exe：
  //     H97Run.exe     -> 枢纽（The Hub）
  //     HELPPLEASE.exe -> Level 666
  //     TCI_BootUp.exe -> 破碎之地
  //   双击就能运行 —— 运行之后这台机器不会再等你，它会直接把你送走。
  // ===========================================================
  const PC601_APPS = [
    { key: "H97Run.exe", ico: "🌀", name: "H97Run.exe", to: "hub",
      desc: "传送到枢纽（The Hub）" },
    { key: "HELPPLEASE.exe", ico: "🔥", name: "HELPPLEASE.exe", to: 666,
      desc: "传送到 Level 666 —— 欢迎来到地狱" },
    { key: "TCI_BootUp.exe", ico: "🪟", name: "TCI_BootUp.exe", to: "shattered",
      desc: "传送到破碎之地 —— 那里没有任何出口" },
  ];

  function pc601RenderTray() {
    const w = $("pc601-wifi");
    if (w) {
      w.innerHTML = "";
      // 一格都没有 —— 网线早就断了
      for (let i = 1; i <= 4; i++) { const b = document.createElement("i"); w.appendChild(b); }
    }
    const n = $("pc601-net"); if (n) n.textContent = "未连接";
    const c = $("pc601-clock");
    if (c) { const d = new Date(); c.textContent = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); }
  }

  function pc601RenderDesktop() {
    const box = $("pc601-desktop");
    if (!box) return;
    box.innerHTML = "";
    // 最上面那行：明确告诉你这台机器上不了网
    const note = document.createElement("div");
    note.style.cssText = "flex:0 0 100%;font-size:12px;color:#c98a8a;padding:2px 4px;"
      + "border-bottom:1px solid rgba(0,0,0,.18);margin-bottom:4px";
    note.textContent = "C:\\> 未连接网络 —— 无法接入任何网络，也无法浏览任何网址。";
    box.appendChild(note);
    // 1.3.0：桌面上多了一封邀请函。点开是一封弹窗，点「确定」就去 Level 26。
    const inv = document.createElement("button");
    inv.type = "button";
    inv.className = "pc601-invite-btn";
    inv.textContent = "=)  一封没署名的邀请函";
    inv.style.cssText = "flex:0 0 100%;margin:6px 4px 8px;padding:9px 12px;cursor:pointer;"
      + "background:#f3ecd8;color:#3a533f;border:1px solid #b9ae8c;border-radius:3px;"
      + "font-size:14px;text-align:left;font-weight:bold;";
    inv.addEventListener("click", (ev) => { ev.stopPropagation(); pc601ShowInvite(); });
    box.appendChild(inv);
    // 列表式排列 —— 以前用 76px 宽的图标格子，而 "HELPPLEASE.exe" 实际要 162px，
    // 第二个的名字直接压在第三个图标上，根本读不出来。
    for (const a of PC601_APPS) {
      const b = document.createElement("div");
      b.className = "pc601-file";
      const ico = document.createElement("span");
      ico.className = "pc601-ico"; ico.textContent = a.ico;
      b.appendChild(ico);
      const txt = document.createElement("div");
      txt.className = "pc601-txt";
      const nm = document.createElement("div");
      nm.className = "pc601-name"; nm.textContent = a.name;
      const ds = document.createElement("div");
      ds.className = "pc601-desc"; ds.textContent = a.desc;
      txt.appendChild(nm); txt.appendChild(ds);
      b.appendChild(txt);
      const run = document.createElement("button");
      run.className = "pc601-run"; run.type = "button"; run.textContent = "运行";
      run.addEventListener("click", (ev) => { ev.stopPropagation(); pc601Run(a); });
      b.appendChild(run);
      b.addEventListener("click", () => pc601Open(a));
      box.appendChild(b);
    }
  }

  function pc601Window(title, bodyNode) {
    const app = $("pc601-app");
    if (!app) return null;
    app.classList.remove("hidden");
    app.innerHTML = "";
    const head = document.createElement("div");
    head.className = "pc4-win-head";
    const t = document.createElement("span");
    t.className = "pc4-win-t"; t.textContent = title;
    head.appendChild(t);
    const bx = document.createElement("button");
    bx.className = "pc4-win-btn"; bx.type = "button"; bx.textContent = "✕";
    bx.addEventListener("click", () => pc601CloseApp());
    head.appendChild(bx);
    const body = document.createElement("div");
    body.className = "pc4-win-body";
    if (bodyNode) body.appendChild(bodyNode);
    app.appendChild(head); app.appendChild(body);
    const task = $("pc601-task"); if (task) task.textContent = title;
    return body;
  }

  function pc601CloseApp() {
    const app = $("pc601-app");
    if (app) { app.classList.add("hidden"); app.innerHTML = ""; }
    const task = $("pc601-task"); if (task) task.textContent = "";
  }

  function pc601Open(a) {
    const wrap = document.createElement("div");
    const d = document.createElement("div");
    d.className = "pc4-page";
    const warn = (a.to === "shattered" || a.to === 666)
      ? '<p class="warn">⚠ 运行之后你就回不来了 —— 那里没有任何出口。</p>' : "";
    d.innerHTML = '<h4>' + a.name + '</h4>'
      + '<p>' + a.desc + '</p>'
      + '<p class="dim">大小 13 KB · 类型 应用程序</p>' + warn
      + '<p class="dim">双击图标即可运行。</p>';
    const run = document.createElement("button");
    run.className = "pc4-go"; run.type = "button"; run.textContent = "运行";
    run.style.marginTop = "8px";
    run.addEventListener("click", () => pc601Run(a));
    d.appendChild(run);
    wrap.appendChild(d);
    pc601Window(a.name, wrap);
  }

  // 1.3.0 · 邀请弹窗：「尊敬的流浪者 …… 加入我们吧=)」
  // 拒绝只是关掉弹窗；确定就把人送去 Level 26 —— 到了那儿，被派对客抓住必定转化。
  function pc601ShowInvite() {
    const host = $("pc601");
    if (!host) return;
    const old = document.getElementById("pc601-invite");
    if (old) old.remove();
    const ov = document.createElement("div");
    ov.id = "pc601-invite";
    ov.style.cssText = "position:absolute;inset:0;z-index:60;display:flex;align-items:center;"
      + "justify-content:center;background:rgba(8,10,12,.72);";
    const card = document.createElement("div");
    card.style.cssText = "width:min(600px,90%);max-height:86%;overflow:auto;background:#f3ecd8;"
      + "color:#2c2a24;border:2px solid #b9ae8c;box-shadow:0 18px 60px rgba(0,0,0,.6);"
      + "padding:22px 26px 18px;border-radius:4px;";
    const body = document.createElement("pre");
    body.style.cssText = "margin:0 0 18px;white-space:pre-wrap;word-break:break-word;"
      + "font-family:inherit;font-size:15px;line-height:1.95;color:#2c2a24;";
    body.textContent = "尊敬的流浪者\n"
      + "      你被我们选中，你将有资格前往整个后室最宜居的层级——Level 26。\n"
      + "在那里，你不必在为生存而感到紧张；你不必为了获取物资而大打出手；你不必再受到实体的侵扰。\n"
      + "来吧，来到这个不受世界纷争的地方。\n"
      + "    加入我们吧=)";
    card.appendChild(body);
    const row = document.createElement("div");
    row.style.cssText = "display:flex;justify-content:space-between;gap:14px;";
    const mk = (text, primary) => {
      const b = document.createElement("button");
      b.type = "button"; b.textContent = text;
      b.style.cssText = "flex:1;padding:9px 14px;cursor:pointer;font-size:14px;border-radius:3px;"
        + (primary
          ? "background:#3a6b3f;color:#f6ffe9;border:1px solid #2a502d;font-weight:bold;"
          : "background:#e2dcc6;color:#4a463a;border:1px solid #b9ae8c;");
      return b;
    };
    const no = mk("拒绝", false);
    no.addEventListener("click", () => ov.remove());
    const yes = mk("确定", true);
    yes.addEventListener("click", () => {
      const g = game;
      if (g) g.invited26 = true;
      try { AudioSys.exitChime && AudioSys.exitChime(); } catch (e) { /* 忽略 */ }
      ov.remove();
      closePc601();
      startTransition("加入我们吧 =)", "屏幕上的字散成一团暖黄 —— 有人替你做了决定 ...",
        { kind: "toLevelX", level: 26 });
    });
    row.appendChild(no); row.appendChild(yes);
    card.appendChild(row);
    ov.appendChild(card);
    host.appendChild(ov);
  }

  function pc601Run(a) {
    const g = game;
    if (!g) return;
    const to = a.to;
    const nm = levelDef(to).name;
    try { AudioSys.exitChime && AudioSys.exitChime(); } catch (e) { /* 忽略 */ }
    closePc601();
    startTransition("运行 " + a.name, "屏幕闪了一下，机箱在你身后合上 —— " + nm + " ...",
      { kind: "toLevelX", level: to });
  }

  function openPc601() {
    const g = game;
    if (!g) return;
    if (g.phase === "playing" || g.phase === "paused" || g.phase === "reading") g.manualReturn = g.phase;
    g.phase = "pc601";
    hide(el.pickupHint); hide(el.doorHint); hide(el.btnDoor);
    pc601CloseApp();
    pc601RenderTray();
    pc601RenderDesktop();
    const tt = $("pc601-title"); if (tt) tt.textContent = "终末的电脑 · " + levelCodeName(g.level);
    show(el.pc601);
  }

  function closePc601() {
    hide(el.pc601);
    pc601CloseApp();
    const g = game;
    if (g) { g.phase = g.manualReturn || "playing"; g.manualReturn = null; }
  }

  function openPc4() {
    const g = game;
    if (!g) return;
    if (g.phase === "playing" || g.phase === "paused" || g.phase === "reading") g.manualReturn = g.phase;
    g.phase = "pc4";
    hide(el.pickupHint); hide(el.doorHint); hide(el.btnDoor);
    pc4EnsureDisk(g);
    pc4CloseApp();
    pc4RenderDesktop();
    pc4RenderTray();
    const tt = $("pc4-title"); if (tt) tt.textContent = "办公电脑 · " + levelCodeName(g.level);
    show(el.pc4);
  }
  function closePc4() {
    hide(el.pc4);
    pc4CloseApp();
    const g = game;
    if (g) { g.phase = g.manualReturn || "playing"; g.manualReturn = null; }
  }

  // ===========================================================
  // 赫尔墨斯装置
  // 它只能送到"前后 50 个层级"以内 —— 在 Level 4，上限就是 Level 54。
  // 而且只列已经存在的地方：没做出来的层级，那颗脑子想象不出来。
  // ===========================================================
  const HERMES_RANGE = 50;
  const HERMES_USES = 5;          // 出厂耐久：用一次退一次，归零就废了

  function hermesRange(cur) {
    const n = Number(cur);
    if (!Number.isFinite(n)) return null;          // hub / bang 这类没有编号，算不出范围
    const lo = n - HERMES_RANGE, hi = n + HERMES_RANGE;
    const out = [];
    for (const k of Object.keys(LEVELS)) {
      const s = String(k);
      if (!/^\d+$/.test(s)) continue;              // 只认纯数字编号（0.2 / 37.1 这类不算）
      const v = Number(s);
      if (v < lo || v > hi) continue;
      out.push({ code: s, name: levelCodeName(s), v });
    }
    out.sort((a, b) => a.v - b.v);
    return out;
  }

  // 在电脑上订购时填的那个"送达层级" —— 跟传送用的是同一套范围
  function hermesOrderOptions() {
    const g = game;
    const list = (g && hermesRange(g.level)) || [];
    if (list.length) return list.map((o) => ({ code: o.code, name: "Level " + o.code + " · " + o.name }));
    // 所在层级没有编号（枢纽之类）：退回到所有已做出来的数字层级
    const all = [];
    for (const k of Object.keys(LEVELS)) {
      const s = String(k);
      if (!/^\d+$/.test(s)) continue;
      all.push({ code: s, v: Number(s), name: "Level " + s + " · " + levelCodeName(s) });
    }
    all.sort((a, b) => a.v - b.v);
    return all;
  }

  function hermesDurability(g) {
    return (g && g.hermesUses != null) ? g.hermesUses : HERMES_USES;
  }

  // 包裹落地：送到"那个层级的入口" —— 出生点附近，但不靠近 M.E.G 基地
  function spawnHermesParcel(g) {
    if (!g || !g.map) return false;
    if ((g.inv.hermes | 0) > 0) return false;
    for (const it of (g.map.ground || [])) if (it.item === "hermes" && !it.taken) return false;
    const m = g.map, sz = m.size;
    const st = m.start || { x: Math.floor(sz / 2), y: Math.floor(sz / 2) };
    const grid = (m.layers && m.layers[0]) || null;

    // M.E.G 基地在哪（有的层级有）—— 包裹必须离它远远的
    let meg = null;
    if (m.alphaBase && m.alphaBase.inside && m.alphaBase.inside.size) {
      let sx = 0, sy = 0, n = 0;
      for (const k of m.alphaBase.inside) {
        const q = k.split(","); sx += +q[0]; sy += +q[1]; n++;
      }
      if (n) meg = { x: sx / n, y: sy / n };
    }

    const cand = [];
    for (let r = 2; r <= 8; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
          const x = st.x + dx, y = st.y + dy;
          if (x < 1 || y < 1 || x >= sz - 1 || y >= sz - 1) continue;
          if (grid && grid[y][x] !== 0) continue;
          if (m.pools && m.pools.has(x + "," + y)) continue;
          if (meg && Math.hypot(x - meg.x, y - meg.y) < 10) continue;
          cand.push({ x, y });
        }
      }
      if (cand.length >= 6) break;              // 够挑就行，别把整张图扫一遍
    }
    if (!cand.length) return false;
    const t = cand[Math.floor(Math.random() * cand.length)];
    m.ground.push({ x: t.x, y: t.y, floor: 0, item: "hermes", taken: false });
    toast("入口处多了一个包裹 —— UEC 寄来的");
    return true;
  }

  // 落地之后才查：订购时填的那个层级，是不是就是脚下这一层。
  // 以前只在"发邮件的那一刻"检查一次 —— 玩家人还在 Level 4，包裹自然不会出现在
  // 真正要去的那一层，于是 50 瓶杏仁水等于白花，包裹永远见不到。
  function maybeDeliverHermes(g) {
    if (!g || g.hermesOrder == null) return false;
    if (String(g.level) !== String(g.hermesOrder)) return false;
    const ok = spawnHermesParcel(g);
    if (ok) {
      g.hermesOrder = null;
      setTimeout(() => toast("UEC 的包裹就在这层的入口处 —— 去找找"), 700);
    }
    return ok;
  }

  // 使用：弹出像开发者终端那样的层级列表
  function openHermes() {
    const g = game;
    if (!g) return;
    if (g.phase === "playing" || g.phase === "paused" || g.phase === "reading") g.manualReturn = g.phase;
    g.phase = "hermes";
    hide(el.pickupHint); hide(el.doorHint); hide(el.btnDoor);
    renderHermes();
    show(el.hermes);
  }
  function closeHermes() {
    hide(el.hermes);
    const g = game;
    if (g) { g.phase = g.manualReturn || "playing"; g.manualReturn = null; }
  }

  function renderHermes() {
    const g = game;
    const box = $("hermes-list"), tip = $("hermes-tip"), state = $("hermes-state");
    if (!box) return;
    const dur = hermesDurability(g);
    const tt = $("hermes-title");
    if (tt) tt.textContent = "赫尔墨斯装置 · 耐久 " + dur + " / " + HERMES_USES;
    if (tip) {
      tip.innerHTML = "把那颗脑子想象的地方写进装置 —— 它只能送到<b>前后 " + HERMES_RANGE
        + " 个层级</b>以内，而且只到<b>已经存在</b>的地方。"
        + "<br>每用一次，人脑就退化一点。耐久归零，这台就算废了。";
    }
    box.innerHTML = "";

    const list = hermesRange(g.level);
    if (!list) {
      state.className = "hermes-state err";
      state.textContent = "这里没有层级编号 —— 装置算不出范围。";
      const d = document.createElement("div");
      d.className = "hermes-empty";
      d.textContent = "（这个地方的编号不是数字，装置无从下手）";
      box.appendChild(d);
      return;
    }
    if (dur <= 0) {
      state.className = "hermes-state err";
      state.textContent = "耐久已经归零 —— 无法继续使用。";
      const d = document.createElement("div");
      d.className = "hermes-empty";
      d.textContent = "装置里那颗脑子不再有反应了。它再也到不了任何地方。";
      box.appendChild(d);
      return;
    }

    const here = String(g.level);
    for (const o of list) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "hermes-item" + (o.code === here ? " here" : "");
      b.innerHTML = '<span class="hi-code">Level ' + o.code + '</span>'
        + '<span class="hi-name">' + o.name + '</span>'
        + '<span class="hi-go">' + (o.code === here ? "就在这儿" : "传送 ▸") + '</span>';
      if (o.code !== here) b.addEventListener("click", () => hermesGo(o));
      box.appendChild(b);
    }
    state.className = "hermes-state";
    state.textContent = "共 " + list.length + " 个地方 · 每传送一次消耗 1 点耐久";
  }

  // ---- Level 15.1 仿真设备：先挑想模拟什么 ----
  function openSimSelect() {
    const g = game;
    if (!g) return;
    if (g.phase === "playing" || g.phase === "paused" || g.phase === "reading") g.manualReturn = g.phase;
    g.phase = "simsel";
    hide(el.pickupHint); hide(el.doorHint); hide(el.btnDoor);
    renderSimSelect();
    show(el.simsel);
  }
  function closeSimSelect() {
    hide(el.simsel);
    const g = game;
    if (g) { g.phase = g.manualReturn || "playing"; g.manualReturn = null; }
  }

  function renderSimSelect() {
    const box = $("simsel-list"), tip = $("simsel-tip"), state = $("simsel-state");
    if (!box) return;
    const kinds = window.SIM151_KINDS || [];
    const tt = $("simsel-title");
    if (tt) tt.textContent = "仿真设备 —— 想模拟什么？";
    if (tip) {
      tip.innerHTML = "设备里<b>什么都有</b> —— 你只要说出想要哪一种。"
        + "<br>每种里头回升的快慢不一样。摘下之后可以重新挑。"
        + "<br>记住：<b>只有你自己愿意摘下来才是安全的</b> —— 别人替你摘的那一刻，就是脑死亡。";
    }
    box.innerHTML = "";
    for (const k of kinds) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "sim-item";
      b.innerHTML = '<span class="si-name" style="color:' + k.ink + '">' + k.name + '</span>'
        + '<span class="si-tip">' + k.tip + '</span>'
        + '<span class="si-go">进入 ▸</span>';
      b.addEventListener("click", () => simSelectGo(k));
      box.appendChild(b);
    }
    if (state) {
      state.className = "hermes-state";
      state.textContent = "共 " + kinds.length + " 种 · 理智与体力都会回升，回升多少各不相同";
    }
  }

  function simSelectGo(k) {
    const g = game;
    if (!g) return;
    g.sim151 = { px: g.player.x, py: g.player.y, t: 0, kind: k.id };
    closeSimSelect();
    if (g.phase !== "playing") g.phase = "playing";
    try { AudioSys.pickup(); } catch (e) { /* 忽略 */ }
    toast("你戴上了设备 —— 眼前的一切都换了：" + k.name + "。");
  }

  function hermesGo(o) {
    const g = game;
    if (!g) return;
    const dur = hermesDurability(g);
    if (dur <= 0) { toast("耐久已经归零 —— 无法继续使用"); return; }
    if (String(g.level) === o.code) { toast("你本来就在这儿"); return; }
    g.hermesUses = dur - 1;
    // 从背包里用的时候背包还开着 —— goToLevel 只在 playing 时才走，先关掉
    try { closeBag(); } catch (e) { /* 忽略 */ }
    closeHermes();
    if (g.phase !== "playing") g.phase = "playing";
    const left = g.hermesUses;
    toast("赫尔墨斯装置 · 耐久 " + left + " / " + HERMES_USES);
    goToLevel(g, o.code, "赫尔墨斯装置",
      "装置里那颗脑子开始低鸣 —— 它想出了一个地方：" + o.name + " ...");
    if (left <= 0) setTimeout(() => toast("装置里的脑子不再有反应了 —— 它无法继续使用了"), 1200);
  }

  // 1 瓶杏仁水 = 5 枚 B.N.T.G 货币；用货币买东西 = 瓶数 × 5
  const BNTG_RATE = 5;
  function coins() { return game ? (game.inv.bntgcoin | 0) : 0; }
  // 层级密钥按档案「及同价的 B.N.T.G 货币」单独定价（4:1），普通商品仍是瓶数 × 5
  function coinPrice(good) {
    return good.coin != null ? (good.coin | 0) : (good.price | 0) * BNTG_RATE;
  }
  // 每局随机进货：卖哪几把钥匙、几把、什么价，都是随机的（禁止层级不进货）
  function bntgKeyGoods() {
    const g = game, K = window.LEVEL_KEY;
    if (!g || !K) return [];
    if (!g.bntgKeyOffers) g.bntgKeyOffers = K.makeOffers(K.ri(1, 4));
    return g.bntgKeyOffers.map((o) => {
      let nm = "Level " + o.lv;
      try { nm = levelDef(o.lv).name || nm; } catch (e) { /* 忽略 */ }
      return {
        key: o.key, price: o.price, coin: o.coin, icon: "🗝", isLevelKey: true,
        desc: "层级密钥 · " + nm + "。齿形和光色与其它钥匙都不同。"
            + "在枢纽里用它开过门之后，那扇门会一直开着（开门不会把钥匙用掉）。"
            + "【" + o.tierName + " · 随机进货】",
      };
    });
  }
  function bntgGoods() { return BNTG_GOODS.concat(bntgKeyGoods()); }

  function renderBntgShop() {
    const g = game;
    const box = el.bntgBody;
    if (!g || !box) return;
    const almond = g.inv.almond | 0;
    const coin = coins();
    if (el.bntgAlmond) el.bntgAlmond.textContent = String(almond);
    if (el.bntgCoin) el.bntgCoin.textContent = String(coin);
    box.innerHTML = "";

    for (const good of bntgGoods()) {
      const def = ITEMS[good.key] || { name: good.key };
      const own = g.inv[good.key] | 0;
      const row = document.createElement("div");
      row.className = "bntg-row" + (good.key === "ksuit" && own > 0 ? " sold" : "");

      const ic = document.createElement("div");
      ic.className = "bntg-ic";
      ic.textContent = good.icon;
      row.appendChild(ic);

      const nm = document.createElement("div");
      nm.className = "bntg-nm";
      const n = document.createElement("span");
      n.className = "n";
      n.textContent = def.name + (own > 0 ? "（身上 " + own + "）" : "");
      const d = document.createElement("span");
      d.className = "d";
      d.textContent = good.desc;
      nm.appendChild(n); nm.appendChild(d);
      row.appendChild(nm);

      const pr = document.createElement("div");
      pr.className = "bntg-price";
      pr.textContent = good.price + " 瓶 / " + coinPrice(good) + " 枚";
      row.appendChild(pr);

      // 买入 —— 杏仁水和 B.N.T.G 货币都收
      const acts = document.createElement("div");
      acts.className = "bntg-acts";
      const ba = document.createElement("button");
      ba.className = "ghost"; ba.type = "button";
      ba.textContent = "杏仁水买";
      ba.disabled = almond < good.price;
      ba.addEventListener("click", () => bntgBuy(good, "almond"));
      acts.appendChild(ba);

      const bc = document.createElement("button");
      bc.className = "ghost"; bc.type = "button";
      bc.textContent = "货币买";
      bc.disabled = coin < coinPrice(good);
      bc.addEventListener("click", () => bntgBuy(good, "coin"));
      acts.appendChild(bc);

      // 卖出 —— 换回杏仁水，或者换回货币
      const sa = document.createElement("button");
      sa.className = "ghost"; sa.type = "button";
      sa.textContent = "换杏仁水";
      sa.disabled = own <= 0;
      sa.addEventListener("click", () => bntgSell(good, "almond"));
      acts.appendChild(sa);

      const sc = document.createElement("button");
      sc.className = "ghost"; sc.type = "button";
      sc.textContent = "换货币";
      sc.disabled = own <= 0;
      sc.addEventListener("click", () => bntgSell(good, "coin"));
      acts.appendChild(sc);

      row.appendChild(acts);
      box.appendChild(row);
    }

    renderRecycle(box, g, "bntg", renderBntgShop);
    renderBntgExchange();

    if (el.bntgState) {
      el.bntgState.textContent = (g.inv.ksuit | 0) > 0
        ? "（防化服已经在背包里 —— 打开背包点它就能穿上）"
        : "（想进 Level 301，得先攒够 8 瓶、或 40 枚货币换那套防化服）";
    }
  }

  // 兑换区：杏仁水 <-> B.N.T.G 货币，两个方向都行
  function renderBntgExchange() {
    const ex = el.bntgEx;
    const g = game;
    if (!ex || !g) return;
    ex.innerHTML = "";
    const almond = g.inv.almond | 0;
    const coin = coins();

    const mkRow = (label, buttons) => {
      const r = document.createElement("div");
      r.className = "ex-r";
      const lb = document.createElement("span");
      lb.className = "lb";
      lb.textContent = label;
      r.appendChild(lb);
      for (const b of buttons) r.appendChild(b);
      return r;
    };
    const mkBtn = (text, disabled, fn) => {
      const b = document.createElement("button");
      b.className = "ghost"; b.type = "button";
      b.textContent = text;
      b.disabled = !!disabled;
      b.addEventListener("click", fn);
      return b;
    };

    const t = document.createElement("div");
    t.className = "ex-t";
    t.textContent = "兑换：1 瓶杏仁水 = " + BNTG_RATE + " 枚 B.N.T.G 货币（货币不占背包格子）";
    ex.appendChild(t);

    // 杏仁水 -> 货币
    ex.appendChild(mkRow("杏仁水换币", [
      mkBtn("1 瓶 → 5 枚", almond < 1, () => bntgExchange(1)),
      mkBtn("5 瓶 → 25 枚", almond < 5, () => bntgExchange(5)),
      mkBtn("全部", almond < 1, () => bntgExchange(almond)),
    ]));

    // 货币 -> 杏仁水
    ex.appendChild(mkRow("币换杏仁水", [
      mkBtn("5 枚 → 1 瓶", coin < BNTG_RATE, () => bntgExchange(-1)),
      mkBtn("25 枚 → 5 瓶", coin < BNTG_RATE * 5, () => bntgExchange(-5)),
      mkBtn("全部", coin < BNTG_RATE, () => bntgExchange(-Math.floor(coin / BNTG_RATE))),
    ]));
  }

  // n > 0：花 n 瓶杏仁水换 5n 枚货币；n < 0：花 5|n| 枚货币换 |n| 瓶杏仁水
  function bntgExchange(n) {
    const g = game;
    if (!g) return;
    n = n | 0;
    if (n === 0) { toast("没有可换的。"); return; }
    if (n > 0) {
      if ((g.inv.almond | 0) < n) { toast("杏仁水不够。"); try { AudioSys.growl(); } catch (e) { /* 忽略 */ } return; }
      removeItem("almond", n);
      addItem("bntgcoin", n * BNTG_RATE);
      toast("换了 " + (n * BNTG_RATE) + " 枚 B.N.T.G 货币（花掉 " + n + " 瓶杏仁水）");
    } else {
      const bottles = -n;
      const need = bottles * BNTG_RATE;
      if (coins() < need) { toast("货币不够 —— 这要 " + need + " 枚。"); try { AudioSys.growl(); } catch (e) { /* 忽略 */ } return; }
      removeItem("bntgcoin", need);
      addItem("almond", bottles);
      toast("换了 " + bottles + " 瓶杏仁水（花掉 " + need + " 枚货币）");
    }
    try { AudioSys.pickup(); } catch (e) { /* 忽略 */ }
    updateBag(); updateHud(); renderHotbar();
    renderBntgShop();
  }

  // pay: "almond"（花瓶数）或 "coin"（花瓶数 × 5）
  function bntgBuy(good, pay) {
    const g = game;
    if (!g) return;
    const price = good.price | 0;
    const name = ITEMS[good.key] ? ITEMS[good.key].name : good.key;
    const needCoin = coinPrice(good);
    if (pay === "coin") {
      if (coins() < needCoin) {
        toast("货币不够 —— 这要 " + needCoin + " 枚");
        try { AudioSys.growl(); } catch (e) { /* 忽略 */ }
        return;
      }
    } else if ((g.inv.almond | 0) < price) {
      toast("杏仁水不够 —— 这要 " + price + " 瓶");
      try { AudioSys.growl(); } catch (e) { /* 忽略 */ }
      return;
    }
    if (!g.bagCapInfinite && bagSlots() + 1 > bagCap()) {
      toast("背包满了（" + bagText() + "）—— 装不下" + name);
      return;
    }
    if (pay === "coin") { removeItem("bntgcoin", needCoin); toast("买下了" + name + "（花掉 " + needCoin + " 枚货币）"); }
    else { removeItem("almond", price); toast("买下了" + name + "（花掉 " + price + " 瓶杏仁水）"); }
    addItem(good.key, 1);
    markBntgBought(g, good.key);
    try { AudioSys.pickup(); } catch (e) { /* 忽略 */ }
    updateBag(); updateHud(); renderHotbar();
    renderBntgShop();
  }

  // ===== 1.3.4 回收：任何商铺都收，价格按来源与摊位浮动 =====
  // 从 B.N.T.G 买来的按原价 3/4 回收；捡来的按基准价上下 1~2 瓶，每家摊位不同。
  // 赫尔墨斯装置不回收。
  const RECYCLE_BASE = { digicam: 20, film_premium: 3, film_normal: 1, battery: 2,
    crowbar: 1, meat: 3, ksuit: 8, bntgwarp: 4, camera: 5, almond: 1 };
  function markBntgBought(g, key) {
    if (!g.bntgBought) g.bntgBought = {};
    g.bntgBought[key] = (g.bntgBought[key] | 0) + 1;
  }
  function consumeBntgBought(g, key) {
    if (!g.bntgBought) return;
    const n = g.bntgBought[key] | 0;
    if (n <= 1) delete g.bntgBought[key]; else g.bntgBought[key] = n - 1;
  }
  function recycleBase(key) {
    const good = BNTG_GOODS.find((x) => x.key === key);
    if (good) return good.price | 0;
    return RECYCLE_BASE[key] != null ? RECYCLE_BASE[key] : 2;
  }
  function recycleQuote(g, key, shopId, good) {
    const base = Math.max(1, (good && good.price) || recycleBase(key));
    const bought = !!g.bntgBought && (g.bntgBought[key] | 0) > 0;
    if (bought) return { bottles: Math.max(1, Math.floor(base * 3 / 4)), from: "bought" };
    const s = String(shopId || "bntg") + "|" + key;
    let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    const d = (Math.abs(h) % 2) + 1;
    return { bottles: Math.max(1, base + ((h & 1) ? d : -d)), from: "found" };
  }
  function recycleOne(g, key, shopId, gain, good) {
    if (key === "hermes") { toast("赫尔墨斯装置不回收"); return; }
    if ((g.inv[key] | 0) <= 0) { toast("你身上没有这个。"); return; }
    const q = recycleQuote(g, key, shopId, good);
    consumeBntgBought(g, key);
    removeItem(key, 1);
    if (gain === "coin") { const back = q.bottles * 5; addItem("bntgcoin", back); toast("回收换回 " + back + " 枚 B.N.T.G 货币"); }
    else { addItem("almond", q.bottles); toast("回收换回 " + q.bottles + " 瓶杏仁水"); }
    if (key === "ksuit" && g.outfit === "ksuit") {
      g.outfit = "drifter";
      try { localStorage.setItem("br_outfit", "drifter"); } catch (e) { /* 忽略 */ }
    }
    try { AudioSys.pickup(); } catch (e) { /* 忽略 */ }
    updateBag(); updateHud(); renderHotbar();
  }
  function renderRecycle(card, g, shopId, rerender) {
    const skip = { almond: 1, bntgcoin: 1, hermes: 1, tape: 1, lvlkey: 1 };
    const keys = Object.keys(g.inv || {}).filter((k) => (g.inv[k] | 0) > 0 && !skip[k]);
    const wrap = document.createElement("div");
    wrap.style.cssText = "margin-top:14px;border-top:1px solid rgba(217,201,94,.35);padding-top:10px;";
    const h = document.createElement("div");
    h.textContent = "回收 · 把身上的东西卖回给这家";
    h.style.cssText = "font-size:14px;font-weight:bold;color:#ffe97a;margin-bottom:6px;";
    wrap.appendChild(h);
    if (!keys.length) {
      const e = document.createElement("div");
      e.textContent = "身上没有可回收的东西（赫尔墨斯装置不收）";
      e.style.cssText = "font-size:12px;color:#cabb92;";
      wrap.appendChild(e);
    }
    for (const k of keys) {
      const def = ITEMS[k] || { name: k };
      const good = BNTG_GOODS.find((x) => x.key === k);
      const q = recycleQuote(g, k, shopId, good);
      const row = document.createElement("div");
      row.style.cssText = "display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:5px 0;";
      const nm = document.createElement("div");
      nm.style.cssText = "flex:1 1 160px;font-size:13px;color:#f0e3ad;";
      nm.textContent = (def.name || k) + " ×" + (g.inv[k] | 0)
        + "　回收 " + q.bottles + " 瓶 / " + (q.bottles * 5) + " 枚"
        + (q.from === "bought" ? "（本店购入 · 3/4）" : "（捡来的 · 浮动）");
      row.appendChild(nm);
      const mk = (label, gain) => {
        const b = document.createElement("button");
        b.type = "button"; b.textContent = label;
        b.style.cssText = "padding:5px 9px;font-size:12px;border:1px solid #8f7a3c;"
          + "background:#241f0f;color:#ffe97a;border-radius:3px;cursor:pointer;";
        b.addEventListener("click", () => { recycleOne(g, k, shopId, gain, good); rerender(); });
        return b;
      };
      row.appendChild(mk("换杏仁水", "almond"));
      row.appendChild(mk("换货币", "coin"));
      wrap.appendChild(row);
    }
    card.appendChild(wrap);
  }

  // gain: "almond"（换回瓶数）或 "coin"（换回瓶数 × 5）
  function bntgSell(good, gain) {
    const g = game;
    if (!g) return;
    recycleOne(g, good.key, "bntg", gain, good);
    renderBntgShop();
  }

  // ============ Level 900：正门口那辆咖啡车 ============
  // 三列 —— 糖 / 奶 / 奶油，每列最多三份。配方对得上，喝下去就把你送到那一层；
  // 对不上、或者那一层还没做出来，就只显示"没有这个配方"，什么也不会发生。
  const COFFEE_COLS = [
    { key: "sugar", name: "糖",   opts: ["一勺糖", "两勺糖", "三勺糖"] },
    { key: "milk",  name: "奶",   opts: ["一袋奶", "两袋奶", "三袋奶"] },
    { key: "cream", name: "奶油", opts: ["一勺奶油", "两勺奶油", "三勺奶油"] },
  ];
  let COFFEE_MIX = { sugar: 0, milk: 0, cream: 0 };

  // 返回 { to, note }；to === "random" 表示随机去处；返回 null = 没有这个配方
  function coffeeRecipe(mx) {
    const s = mx.sugar | 0, k = mx.milk | 0, c = mx.cream | 0;
    // 什么都不加 —— 等于要了一杯去咖啡因的：回到 Level 900 的起点
    if (s === 0 && k === 0 && c === 0) return { to: 900, note: "不加咖啡因" };
    // 组合配方（奶 / 奶油 和 糖 同时有）
    if (k === 1 && s === 1 && c === 0) return { to: 98 };
    if (k === 2 && s === 2 && c === 0) return { to: 67 };
    if (c === 1 && s === 1 && k === 0) return { to: 480 };
    if (c === 2 && s === 2 && k === 0) return { to: "random" };
    // 只加了一种
    const nz = (s > 0 ? 1 : 0) + (k > 0 ? 1 : 0) + (c > 0 ? 1 : 0);
    if (nz === 1) {
      if (s > 0) return { to: s === 1 ? 817 : (s === 2 ? 512 : 6) };
      if (k > 0) return { to: k === 1 ? 153 : (k === 2 ? "6.1" : "random") };
      if (c > 0) return { to: c === 1 ? 176 : (c === 2 ? "random" : 0) };
    }
    return null;                       // 没有这个配方
  }
  // 那一层做出来了才算数
  function coffeeLevelExists(to) {
    if (to === "random") return true;
    const L = (typeof LEVELS !== "undefined" && LEVELS) || window.LEVELS || {};
    return Object.prototype.hasOwnProperty.call(L, String(to));
  }
  function coffeeRandomLevel() {
    const L = (typeof LEVELS !== "undefined" && LEVELS) || window.LEVELS || {};
    const ban = { "900": 1, "bang": 1, "666": 1, "anse": 1, "hub": 1, "601": 1,
      "9223372036854775807": 1, "36.1": 1, "redrooms": 1, "traproof": 1, "newera": 1 };
    const keys = Object.keys(L).filter((k) => !ban[k]);
    if (!keys.length) return 900;
    return keys[Math.floor(Math.random() * keys.length)];
  }
  function coffeeLevelName(to) {
    if (to === "random") return "不知道是哪一层";
    const df = (typeof levelDef === "function") ? levelDef(to) : null;
    return (df && df.name) ? df.name : ("Level " + to);
  }

  function openCoffeeCart() {
    const g = game;
    if (!g) return;
    COFFEE_MIX = { sugar: 0, milk: 0, cream: 0 };
    if (g.phase === "playing" || g.phase === "paused" || g.phase === "reading") g.manualReturn = g.phase;
    g.phase = "coffee";
    hide(el.pickupHint); hide(el.doorHint); hide(el.btnDoor);
    renderCoffeeCart();
    show(el.coffee);
  }
  function closeCoffeeCart() {
    hide(el.coffee);
    const g = game;
    if (g) { g.phase = g.manualReturn || "playing"; g.manualReturn = null; }
  }

  function renderCoffeeCart() {
    const box = el.coffeeCols;
    if (!box) return;
    box.innerHTML = "";
    for (const col of COFFEE_COLS) {
      const row = document.createElement("div");
      row.className = "coffee-col";
      const t = document.createElement("div");
      t.className = "cc-t"; t.textContent = col.name;
      row.appendChild(t);
      const btns = document.createElement("div");
      btns.className = "cc-btns";
      for (let i = 0; i < col.opts.length; i++) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "ghost" + ((COFFEE_MIX[col.key] | 0) === i + 1 ? " on" : "");
        b.textContent = col.opts[i];
        b.addEventListener("click", () => {
          COFFEE_MIX[col.key] = ((COFFEE_MIX[col.key] | 0) === i + 1) ? 0 : i + 1;
          try { AudioSys.pickup(); } catch (e) { /* 忽略 */ }
          renderCoffeeCart();
        });
        btns.appendChild(b);
      }
      row.appendChild(btns);
      const n = document.createElement("div");
      n.className = "cc-n"; n.textContent = (COFFEE_MIX[col.key] | 0) + " 份";
      row.appendChild(n);
      box.appendChild(row);
    }
    // 杯子里的东西
    const parts = [];
    if (COFFEE_MIX.sugar) parts.push(COFFEE_MIX.sugar + " 勺糖");
    if (COFFEE_MIX.milk) parts.push(COFFEE_MIX.milk + " 袋奶");
    if (COFFEE_MIX.cream) parts.push(COFFEE_MIX.cream + " 勺奶油");
    if (el.coffeeNow) {
      el.coffeeNow.textContent = parts.length
        ? "一杯加了" + parts.join("、") + "的咖啡"
        : "一杯什么都没加的黑咖啡";
    }
    if (el.coffeeCup) {
      // 奶 / 奶油越多，颜色越浅
      const w = Math.min(1, ((COFFEE_MIX.milk | 0) + (COFFEE_MIX.cream | 0)) * 0.3);
      const r = Math.round(74 + w * 160), gg = Math.round(44 + w * 150), bb = Math.round(24 + w * 130);
      el.coffeeCup.style.setProperty("--brew", "rgb(" + r + "," + gg + "," + bb + ")");
      const st = el.coffeeCup.style;
      st.background = "#efeade";
      if (!el.coffeeCup.querySelector("i")) el.coffeeCup.appendChild(document.createElement("i"));
      const liq = el.coffeeCup.querySelector("i");
      liq.style.cssText = "position:absolute;left:0;right:0;bottom:0;height:"
        + (30 + ((COFFEE_MIX.sugar | 0) * 6)) + "%;background:rgb(" + r + "," + gg + "," + bb + ");";
    }
    // 结果预告
    if (el.coffeeRes) {
      const r = coffeeRecipe(COFFEE_MIX);
      if (!r || !coffeeLevelExists(r.to)) {
        el.coffeeRes.textContent = "闻着是对的 —— 但这个配方没有对应的地方。";
      } else if (r.to === "random") {
        el.coffeeRes.textContent = "不知道会去哪 —— 似乎是随机的。";
      } else {
        el.coffeeRes.textContent = "喝下去：" + coffeeLevelName(r.to)
          + (String(r.to) === "900" ? "" : "");
      }
    }
    if (el.coffeeState) {
      el.coffeeState.textContent = "摊主不在。杯子是干净的，咖啡机还热着 —— 自己动手。";
    }
  }

  function drinkCoffee() {
    const g = game;
    if (!g) return;
    const r = coffeeRecipe(COFFEE_MIX);
    if (!r || !coffeeLevelExists(r.to)) {
      try { AudioSys.growl(); } catch (e) { /* 忽略 */ }
      toast("喝完了 —— 什么也没发生。没有这个配方。");
      closeCoffeeCart();
      return;
    }
    let to = r.to;
    if (to === "random") to = coffeeRandomLevel();
    closeCoffeeCart();
    try { AudioSys.exitChime(); } catch (e) { /* 忽略 */ }
    if (String(to) === "900") {
      goToLevel(g, 900, "把杯子放了回去",
        "咖啡是凉的。你还是站在那家八百公里长的床垫店正中心 ...");
      return;
    }
    goToLevel(g, to, "喝完了那杯咖啡",
      "杯底剩着一层渣 —— " + coffeeLevelName(to) + " ...");
  }

  // 穿上 K 版防化服：替换当前服装，并同步到联机（队友看得见）
  function wearKSuit() {
    const g = game;
    if (!g || (g.inv.ksuit | 0) <= 0) { toast("你没有防化服。"); return false; }
    if (g.outfit === "ksuit") { toast("已经穿着了 —— 它是目前唯一能挡住 Level 301 空气的东西"); return true; }
    g.outfit = "ksuit";
    // 只在当前这一局有效 —— 不写进存档，下一局（或回主菜单）自动脱下来。
    try { localStorage.removeItem("br_outfit"); } catch (e) { /* 忽略 */ }
    try { AudioSys.pickup(); } catch (e) { /* 忽略 */ }
    toast("穿上了 K 版防化服 —— 眼罩是一整块黑玻璃，背后的滤毒罐开始嗡嗡作响（仅限本局）");
    updateBag(); updateHud(); renderHotbar();
    return true;
  }

  // ============ Level 999：后室意志的忏悔 ============
  // 它一条一条念你的罪状，每念完一条就等你一句 —— 一条都不能跳过。
  //   全部承认   -> 眼前一黑，然后在 Level 1000 醒过来
  //   只认一部分 -> 被扔回 Level 0
  //   全都不认   -> 困在岛上，笑魇一只接一只地来
  const CONFESS_SINS = [
    "你把别人的痛苦当成过消遣 —— 你笑过，而且不止一次。",
    "该你站出来的时候，你选了沉默。你看着，然后走开了。",
    "你拿走过不属于你的东西，并且从来没有还。",
    "你答应过的事，你一件也没有兑现。",
    "你让别人替你承担了后果，自己全身而退。",
    "你一直在逃 —— 从家里，从该负的责任，从你自己。",
  ];
  const CONFESS_ECHO_YES = ["……嗯。", "……它记下了。", "……这句是真的。", "……你终于肯说了。", "……好。", "……我知道。"];
  const CONFESS_ECHO_NO = ["……是吗。", "……你确定？", "……它没说话。", "……这里没有别人能替你作证。", "……嗯。", "……那就这样吧。"];

  function openConfess() {
    const g = game;
    if (!g) return;
    if (g.phase === "playing" || g.phase === "paused" || g.phase === "reading") g.manualReturn = g.phase;
    g.phase = "confess";
    g.confessAns = new Array(CONFESS_SINS.length).fill(null);
    hide(el.pickupHint); hide(el.doorHint); hide(el.btnDoor);
    renderConfess();
    show(el.confess);
  }

  function closeConfess() {
    hide(el.confess);
    const g = game;
    if (g) { g.phase = g.manualReturn || "playing"; g.manualReturn = null; }
  }

  function renderConfess() {
    const g = game;
    const box = el.confessBody;
    if (!g || !box) return;
    box.innerHTML = "";
    for (let i = 0; i < CONFESS_SINS.length; i++) {
      const row = document.createElement("div");
      row.className = "confess-sin";

      const q = document.createElement("span");
      q.className = "q";
      const num = document.createElement("span");
      num.className = "n";
      num.textContent = (i + 1) + ".";
      q.appendChild(num);
      q.appendChild(document.createTextNode(CONFESS_SINS[i]));
      row.appendChild(q);

      const ans = document.createElement("div");
      ans.className = "confess-ans";
      const by = document.createElement("button");
      by.type = "button"; by.className = "ghost admit"; by.textContent = "承认";
      const bn = document.createElement("button");
      bn.type = "button"; bn.className = "ghost deny"; bn.textContent = "不承认";
      const picked = g.confessAns[i];
      if (picked === true) by.classList.add("picked");
      if (picked === false) bn.classList.add("picked");
      by.addEventListener("click", () => confessAnswer(i, true));
      bn.addEventListener("click", () => confessAnswer(i, false));
      ans.appendChild(by); ans.appendChild(bn);
      row.appendChild(ans);

      if (picked !== null) {                       // 答完之后它回的那一句
        const echo = document.createElement("div");
        echo.className = "confess-echo" + (picked ? "" : " deny");
        echo.textContent = picked ? CONFESS_ECHO_YES[i] : CONFESS_ECHO_NO[i];
        row.appendChild(echo);
      }
      box.appendChild(row);
    }
    const doneN = g.confessAns.filter((v) => v !== null).length;
    if (el.confessDone) el.confessDone.disabled = doneN < CONFESS_SINS.length;
    if (el.confessState) {
      el.confessState.textContent = doneN === CONFESS_SINS.length
        ? "它念完了。它等着你自己站起来。"
        : "（" + doneN + " / " + CONFESS_SINS.length + " —— 一条都不能跳过）";
    }
  }

  function confessAnswer(i, yes) {
    const g = game;
    if (!g || !g.confessAns) return;
    g.confessAns[i] = yes;
    try { if (yes) AudioSys.pickup(); else AudioSys.doorOpen(); } catch (e) { /* 忽略 */ }
    renderConfess();
  }

  function confessFinish() {
    const g = game;
    if (!g || !g.confessAns) return;
    const total = CONFESS_SINS.length;
    const yesN = g.confessAns.filter((v) => v === true).length;
    if (el.confessDone) el.confessDone.disabled = true;

    if (yesN === total) {
      // 全部承认：眼前一黑 —— 然后在 Level 1000 的草地上醒过来
      closeConfess();
      const blk = el.confessBlack;
      if (blk) { blk.classList.remove("hidden"); requestAnimationFrame(() => blk.classList.add("on")); }
      setTimeout(() => {
        goToLevel(g, 1000, "你承认了全部罪状",
          "它念完最后一条，就没有声音了。你在永远停在傍晚的草地上醒过来 —— 这里没有谁要你解释什么。");
        if (blk) { blk.classList.remove("on"); setTimeout(() => blk.classList.add("hidden"), 950); }
      }, 950);
      return;
    }
    if (yesN === 0) {
      // 全都不认：困在岛上。树后面开始有东西在笑。
      closeConfess();
      g.smilerSiege = true;
      try { AudioSys.roar(1); } catch (e) { /* 忽略 */ }
      for (let i = 0; i < 3; i++) spawnEntityAt(g, "smiler", null);
      toast("它不再说话了 —— 树后面开始有东西在笑。你出不去了。");
      return;
    }
    // 只认了一部分：被扔回 Level 0
    closeConfess();
    goToLevel(g, 0, "你不肯全认",
      "它把剩下那几条又念了一遍，就把你放了回去。地毯、黄墙、嗡嗡作响的日光灯 —— 你又回来了，而它什么也没说。");
  }

  // ---------- 左侧：三个快捷键槽位 ----------
  function renderHotSlots() {
    const wrap = document.getElementById("bag-hot");
    if (!wrap) return;
    wrap.innerHTML = "";
    const held = hotHeld();
    for (let i = 0; i < 3; i++) {
      const key = held[i];
      const slot = document.createElement("div");
      slot.className = "bag-hot-slot" + (key ? " filled" : "");
      const k = document.createElement("div");
      k.className = "bag-hot-key";
      k.textContent = String(i + 1);
      const nm = document.createElement("div");
      nm.className = "bag-hot-nm" + (key ? "" : " none");
      nm.textContent = key ? (ITEMS[key] ? (ITEMS[key].short || ITEMS[key].name) : key) : "空";
      slot.appendChild(k);
      slot.appendChild(nm);
      slot.addEventListener("click", () => {
        if (!game) return;
        if (!bagSelKey) {
          // 物品在主槽时背包里没有它的格子 —— 没选中格子就点它，等于取回背包
          if (key) equipKey("hot", i, key);
          else toast("先在右边选中一个格子，再点这里。");
          return;
        }
        equipKey("hot", i, bagSelKey);
      });
      bindDrag(slot, () => (hotHeld()[i] || null), "hot", () => i);
      wrap.appendChild(slot);
    }
    renderOffSlot();
  }

  // ---------- 屏幕下方的快捷键栏 ----------
  function renderHotbar() {
    const bar = document.getElementById("hotbar");
    if (!bar) return;
    let hideBar = !game || game.phase === "menu" || game.phase === "ended";
    // 主菜单的说明 / 手册 / 设置这些面板铺在半透明遮罩上 —— 底部的三个格子
    // 会隔着遮罩透出来，看着像面板里多了个"快捷背包"。有面板开着就收掉。
    if (!hideBar) {
      try {
        if (document.querySelector("#help:not(.hidden), #manual:not(.hidden), " +
          "#settings:not(.hidden), #account:not(.hidden), #guide:not(.hidden), " +
          "#bgsel:not(.hidden), #outfit:not(.hidden)")) hideBar = true;
      } catch (e) { /* 忽略 */ }
    }
    bar.classList.toggle("hidden", hideBar);
    const held = hotHeld();
    for (let i = 0; i < 3; i++) {
      const slot = bar.querySelector('.hot-slot[data-slot="' + i + '"]');
      if (!slot) continue;
      const key = held[i];                       // 池里取不到就是 null —— 槽位是空的
      slot.classList.toggle("empty", !key);
      // 底部槽也能长按拖出去丢在地上（只绑一次）
      if (!slot.dataset.dragBound) { slot.dataset.dragBound = "1"; bindDrag(slot, () => (hotHeld()[i] || null), "hot", () => i); }
      const ic = slot.querySelector(".hot-ic");
      const nm = slot.querySelector(".hot-nm");
      if (ic) paintItemIcon(ic, "hot-ic", key);
      if (nm) nm.textContent = key ? (ITEMS[key] ? (ITEMS[key].short || ITEMS[key].name) : key) : "";
    }
    // 副手槽（默认 4，摄像机在副手时角标变 L）：单独一格，跟着快捷栏一起显隐
    const off = document.getElementById("offslot");
    if (off) {
      off.classList.toggle("hidden", hideBar);
      const okey = offHeld();
      off.classList.toggle("empty", !okey);
      const oic = off.querySelector(".hot-ic");
      const onm = off.querySelector(".hot-nm");
      if (oic) paintItemIcon(oic, "hot-ic", okey);
      if (onm) onm.textContent = okey ? (ITEMS[okey] ? (ITEMS[okey].short || ITEMS[okey].name) : okey) : "";
      const okEl = off.querySelector(".off-key");
      if (okEl) okEl.textContent = offKeyLabel(okey);
      off.title = okey === "camera"
        ? "副手 · 摄像机 —— 装一卷胶卷，按 L 开始录像（按 4 也可以）"
        : "副手槽 —— 按 4 使用；L 只在副手是摄像机时录像";
      if (!off.dataset.dragBound) { off.dataset.dragBound = "1"; bindDrag(off, () => offHeld(), "off", () => 0); }
    }
  }
  function flashHot(i) {
    const bar = document.getElementById("hotbar");
    if (!bar) return;
    const slot = bar.querySelector('.hot-slot[data-slot="' + i + '"]');
    if (!slot) return;
    slot.classList.add("flash");
    setTimeout(() => slot.classList.remove("flash"), 160);
  }
  function useHotbar(i) {
    if (!game || game.phase !== "playing") return;
    flashHot(i);
    const key = hotHeld()[i];
    // 槽位是空的 —— 就明说"空的"，不再报"缺少 XXX"
    if (!key) { toast("快捷键 " + (i + 1) + "：这个槽位是空的。"); return; }
    bagUse(key);
  }
  function saveHotbar() {
    try { localStorage.setItem("br_hotbar", JSON.stringify(game ? game.hotbar : [null, null, null])); } catch (e) { /* 忽略 */ }
  }
  function loadHotbar() {
    let h = [null, null, null];
    try {
      const v = JSON.parse(localStorage.getItem("br_hotbar") || "null");
      if (Array.isArray(v)) for (let i = 0; i < 3; i++) h[i] = typeof v[i] === "string" ? v[i] : null;
    } catch (e) { /* 忽略 */ }
    return h;
  }
  // 每局开局固定：自带摄像机放在副手槽。主槽里若从上次存档带着摄像机，
  // 先撤掉 —— 同一台机器不能同时占两个视图。
  function initialHotbar() {
    const h = loadHotbar();
    for (let i = 0; i < 3; i++) if (h[i] === "camera") h[i] = null;
    return h;
  }

  // ---------- 副手槽 ----------
  // 单独一个物品槽，与三个主物品槽平级。装 / 卸 / 在两个视图之间「切换」都走这里：
  // 数量不够时自动让另一个视图松开，物品不会因为一份库存被摆在两个槽里。
  function equipKey(kind, idx, key) {
    const g = game;
    if (!g || !key) return;
    if ((g.inv[key] | 0) <= 0) { toast("你没有这个东西了。"); return; }
    const cur = kind === "hot" ? (g.hotbar && g.hotbar[idx]) : g.offhand;
    // 同一个槽里已经是它 —— 点一下取下来，回到背包
    if (cur === key) {
      if (kind === "hot") g.hotbar[idx] = null;
      else g.offhand = null;
      saveHotbar(); refreshSlotsUI();
      return;
    }
    const views = [];
    for (let i = 0; i < 3; i++) views.push({ kind: "hot", i, v: g.hotbar ? g.hotbar[i] : null });
    views.push({ kind: "off", i: 0, v: g.offhand });
    let used = 0;
    for (const v of views) {
      if (v.kind === kind && v.i === idx) continue;
      if (v.v === key) used++;
    }
    if (used + 1 > (g.inv[key] | 0)) {
      // 库存只够一件：把其它视图里这个物品的引用撤掉，等于把它「移」过来
      for (const v of views) {
        if (v.kind === kind && v.i === idx) continue;
        if (v.v !== key) continue;
        if (v.kind === "hot") g.hotbar[v.i] = null;
        else g.offhand = null;
      }
    }
    if (kind === "hot") g.hotbar[idx] = key;
    else g.offhand = key;
    saveHotbar(); refreshSlotsUI();
  }
  function refreshSlotsUI() {
    renderBag(); renderHotSlots(); renderOffSlot(); renderHotbar();
  }
  // 背包左侧那一格副手槽
  function renderOffSlot() {
    const wrap = document.getElementById("bag-off");
    if (!wrap) return;
    const key = offHeld();
    wrap.innerHTML = "";
    const slot = document.createElement("div");
    slot.className = "bag-off-slot" + (key ? " filled" : "");
    const k = document.createElement("div");
    k.className = "bag-off-key"; k.textContent = offKeyLabel(key);
    k.title = key === "camera" ? "装一卷胶卷，按 L 录像（按 4 也能使用副手）" : "副手默认按 4 使用";
    const nm = document.createElement("div");
    nm.className = "bag-off-nm" + (key ? "" : " none");
    nm.textContent = key ? (ITEMS[key] ? (ITEMS[key].short || ITEMS[key].name) : key) : "空";
    slot.appendChild(k); slot.appendChild(nm);
    slot.title = key ? "点一下取回背包（选中格子再点这里可以把别的物品放进副手）" : "副手槽 —— 先选中右边一个格子，再点这里";
    slot.addEventListener("click", () => {
      if (!game) return;
      if (!bagSelKey) {
        if (key) equipKey("off", 0, key);
        else toast("副手是空的 —— 先在右边选中一个格子");
        return;
      }
      equipKey("off", 0, bagSelKey);
    });
    bindDrag(slot, () => offHeld(), "off", () => 0);
    wrap.appendChild(slot);
  }
  // 按 4（或点屏幕下方副手格）：直接使用副手上的东西
  function useOffhand() {
    if (!game || game.phase !== "playing") return;
    const key = offHeld();
    if (!key) { toast("副手是空的 —— 按 4 或点这里没东西可用"); return; }
    const bar = document.getElementById("offslot");
    if (bar) { bar.classList.add("flash"); setTimeout(() => bar.classList.remove("flash"), 160); }
    bagUse(key);
  }
  // 按 L：录像。只有副手拿着摄像机时才生效，副手装别的东西时 L 不录像。
  // 摄像机被换进背包或主物品槽后，就改由点一下 / 数字键 1~3 使用。
  function recordFromOffhand() {
    if (!game || game.phase !== "playing") return;
    // 数码相机正在录：再按一次 L 立刻收卷，已录的帧照常存档，起录时扣掉的胶卷不退
    if (window.DigiCam && DigiCam.isRecording()) { DigiCam.stop(true); return; }
    const held = offHeld();
    if (held === "digicam") { bagUse("digicam"); return; }
    if (held !== "camera") {
      toast("L 只在副手拿着摄像机或数码相机时录像 —— 副手默认是 4");
      return;
    }
    const bar = document.getElementById("offslot");
    if (bar) { bar.classList.add("flash"); setTimeout(() => bar.classList.remove("flash"), 160); }
    bagUse("camera");
  }
  // 副手槽角标：默认显示 4；摄像机在副手时显示 L（这时 L 是录像键，4 依然能用）
  function offKeyLabel(key) { return (key === "camera" || key === "digicam") ? "L" : "4"; }

  // 选中某个格子时，右下角显示这件物品的说明
  function showBagDesc(key) {
    const def = ITEMS[key];
    if (!def || !el.bagDesc) return;
    const g = game;
    const n = g ? (g.inv[key] | 0) : 0;
    let html = "<p>" + escapeHtml(def.desc || "") + "</p>";
    if (def.effect) html += '<p class="eff">' + escapeHtml(def.effect) + "</p>";
    // 快捷键槽位里有没有放它
    const slots = [];
    if (g && g.hotbar) for (let i = 0; i < 3; i++) if (g.hotbar[i] === key) slots.push(String(i + 1));
    if (slots.length) html += '<p style="color:#5a7a34;">（已放在主物品槽 ' + slots.join(" / ") + "）</p>";
    if (g && g.offhand === key && n > 0) {
      html += '<p style="color:#5a7a34;">（已放在副手槽 · '
        + (key === "camera" ? "装胶卷后按 L 录像，按 4 也能使用" : "按 4 使用") + '）</p>';
    }
    html += '<p style="color:#8a7a5a;">（选中格子后点「主物品槽」或「副手」即可切换位置）</p>';
    if (key === "almond" || key === "bad") {
      html += n > 0
        ? '<p style="color:#5a7a34;">（点击可饮用 · 背包里还有 ' + n + " 件）</p>"
        : '<p style="color:#8a7a5a;">（你还没有这种东西）</p>';
    } else if (key === "torch") {
      html += n > 0
        ? '<p style="color:#5a7a34;">（拿在手上 —— 走到冰块旁按 E 就能化开它）</p>'
        : '<p style="color:#8a7a5a;">（还没找到 —— Level 0.3 的冰室里应该有一把）</p>';
    } else if (key === "key") {
      html += n > 0
        ? '<p style="color:#5a7a34;">（已经拿在手上 —— 走到电梯前按 E）</p>'
        : '<p style="color:#8a7a5a;">（还没找到 —— Level 3 的某个角落里）</p>';
    } else if (key === "meat") {
      html += n > 0
        ? '<p style="color:#5a7a34;">（带着它，萨曼莎就不会为难你）</p>'
        : '<p style="color:#8a7a5a;">（Level 5 的走廊里偶尔能找到）</p>';
    } else if (key === "divesuit" || key === "submarine") {
      html += n > 0
        ? '<p style="color:#5a7a34;">（找齐潜水服与潜艇，才能下到午夜带的海底）</p>'
        : '<p style="color:#8a7a5a;">（' + (key === "divesuit" ? "潜水服摆在岸边的破损箱子里" : "潜艇停在岸上") + '）</p>';
    } else if (key === "crowbar") {
      html += n > 0
        ? '<p style="color:#5a7a34;">（已经拿在手上，走到补给箱前按 E 撬开）</p>'
        : '<p style="color:#8a7a5a;">（还没找到 —— 留意破损的箱子和桌子）</p>';
    }
    if (key === "bad" && g && g.badStacks && g.badStacks.length) {
      html += '<p style="color:#8a2f2f;">当前污染层数：' + g.badStacks.length +
        " —— 每多一层都更慢、更致命</p>";
    }
    el.bagDesc.innerHTML = html;
  }

  function updateBag() {
    if (game && game.phase === "bag") renderBag();
    renderHotbar();
  }

  function openManual() {
    const g = game;
    if (g && g.phase === "manual") { closeManual(); return; }
    if (g) {
      if (g.phase === "reading") { hide(el.archive); g.reading = null; }
      if (g.phase === "playing" || g.phase === "reading" || g.phase === "paused") g.manualReturn = g.phase;
      g.phase = "manual";
    }
    hide(el.pickupHint);
    hide(el.doorHint);
    hide(el.btnDoor);
    renderManual();
    show(el.manual);
  }

  function closeManual() {
    const g = game;
    hide(el.manual);
    if (g) g.phase = g.manualReturn || "playing";
    else show(el.menu);   // 从开始菜单翻的档案，关掉后回到菜单
  }

  function unlockList() {
    if (window.Cloud && window.Cloud.unlocks) {
      const u = window.Cloud.unlocks();
      return Array.isArray(u) ? u : Object.keys(u || {});
    }
    try { return JSON.parse(localStorage.getItem("br_unlocks") || "[]"); } catch (e) { return []; }
  }
  // 玩家到过的层级（写在存档的 unlocks 里，跨局保留）
  function hasVisited(lv) {
    const set = (typeof unlocks === "object" && unlocks && typeof unlocks.has === "function")
      ? unlocks : new Set(unlockList());
    return set.has("visit:" + String(lv));
  }
  // 给 AI 用：这个层级去过了吗（枢纽的门靠"去过即解锁"，不需要钥匙）
  try { window.__hasVisited = (lv) => hasVisited(lv); } catch (e) { /* 忽略 */ }
  function markVisited(lv) {
    if (lv == null) return;
    markUnlock("visit:" + String(lv));
  }

  // 手册里要列出的层级：档案里出现过的排前面，其余已定义的层级补在后面
  function manualLevels() {
    const seen = new Set();
    const out = [];
    for (const a of ARCHIVES) {
      const k = String(a.level);
      if (!seen.has(k)) { seen.add(k); out.push(a.level); }
    }
    for (const k of Object.keys(LEVELS)) {
      if (seen.has(k)) continue;
      seen.add(k);
      const num = k === "hub" ? Infinity : parseFloat(k);
      out.push(isNaN(num) ? k : num);
    }
    // 数字升序；非数字编号（hub）排在最后
    const rank = (v) => {
      if (v === "hub") return 2;
      const n = parseFloat(v);
      return isNaN(n) ? 1 : 0;
    };
    return out.sort((a, b) => {
      const ra = rank(a), rb = rank(b);
      if (ra !== rb) return ra - rb;
      if (ra !== 0) return (a === "hub" ? 1 : 0) - (b === "hub" ? 1 : 0);
      return (parseFloat(a) || 0) - (parseFloat(b) || 0);
    });
  }

  // 手册里哪些分组是收起的（按层级 id 记）
  // 折叠状态：**默认全部收起**，并且记住玩家改过的收/展（存本地）。
  // 每组标题前有个小箭头，点一下就展开 —— 箭头方向会跟着变。
  const FOLD_KEY = "br_folds";
  const manualFold = new Set();
  let foldsSaved = false;
  function foldIds() {
    const out = [];
    for (const lv of manualLevels()) out.push("lv" + String(lv));
    out.push("ending");
    return out;
  }
  function loadFolds() {
    manualFold.clear();
    try {
      const raw = localStorage.getItem(FOLD_KEY);
      if (raw === null) { foldsSaved = false; return; }   // 从没改过 -> 全部收起
      foldsSaved = true;
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) for (const g of arr) manualFold.add(g);
    } catch (e) { foldsSaved = false; }
  }
  function isFolded(gid) { return foldsSaved ? manualFold.has(gid) : true; }
  function setFold(gid, folded) {
    if (!foldsSaved) {                                    // 第一次改动：先把"全收起"落成实际状态
      manualFold.clear();
      for (const id of foldIds()) manualFold.add(id);
      foldsSaved = true;
    }
    if (folded) manualFold.add(gid); else manualFold.delete(gid);
    try { localStorage.setItem(FOLD_KEY, JSON.stringify([...manualFold])); } catch (e) {}
  }
  function toggleFold(gid) { setFold(gid, !isFolded(gid)); }

  // ---------- 档案手册左侧的「选择页面」----------
  // 层级档案 / 实体档案 / 组织档案 / 物品档案 / 视频档案。
  // 视频档案不来自 ARCHIVES，而是摄像机拍下来的录像带（见 js/camera.js）。
  let manualTab = "level";
  const MANUAL_TABS = [
    ["level", "层级档案"], ["entity", "实体档案"],
    // 结局 / 彩蛋以前只是「层级档案」列表最底下两个折叠分组，排在 100 多个层级之后，
    // 玩家根本翻不到。现在各自是一页，并且放在前两行，横屏小屏也能一眼看到。
    ["ending", "结局档案"], ["egg", "彩蛋档案"],
    ["org", "组织档案"], ["item", "物品档案"], ["video", "视频档案"],
  ];
  // 顶部搜索：只搜当前这一页；切换页面保留关键词、按新页的内容重新过滤。
  const manualSearch = { open: false, q: "" };
  function manualTabName(tab) {
    return (MANUAL_TABS.find((t) => t[0] === tab) || ["", "档案"])[1];
  }
  function manualKindTab(a) {
    const k = String((a && a.kind) || "");
    if (/层级/.test(k)) return "level";
    if (/实体/.test(k)) return "entity";
    if (/组织|基地|据点|M\.E\.G|通告|补给/.test(k)) return "org";
    return "item";
  }
  function switchManualTab(tab) {
    manualTab = tab;
    manualSel = null;
    const nm = manualTabName(tab);
    if (el.manualDoc) {
      const hint = tab === "video"
        ? "视频档案一开始是空的 —— 摄像机开局就在副手槽里，还带着 4 卷普通胶卷。装上胶卷按 L 录像，录完这里就会多出一卷。"
        : (tab === "ending" || tab === "egg")
          ? "「" + nm + "」达成之后会自动归档到这里；还没解锁的只显示占位，不会剧透触发方式。"
          : "只有收集到的才会显示内容。";
      const what = tab === "video" ? "录像"
        : (tab === "ending" ? "结局档案" : (tab === "egg" ? "彩蛋档案" : "档案"));
      el.manualDoc.innerHTML = '<div class="manual-empty">从左边选一篇'
        + what + '。<br><br>' + hint
        + (manualSearch.q ? '<br><br>当前搜索词「' + escapeHtml(manualSearch.q) + '」已在这一页重新过滤。' : "")
        + '</div>';
    }
    renderManual();
  }
  function renderManualTabs(list) {
    const box = document.createElement("div");
    box.id = "manual-tabs";
    for (const [key, name] of MANUAL_TABS) {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = name;
      b.dataset.tab = key;
      b.className = "mtab" + (manualTab === key ? " on" : "");
      b.addEventListener("click", () => switchManualTab(key));
      box.appendChild(b);
    }
    list.appendChild(box);
  }
  function manualItemRow(a, onPick) {
    const got = collected.has(a.id);
    const row = document.createElement("div");
    row.className = "manual-item" + (got ? "" : " locked") + (manualSel === a.id ? " sel" : "");
    row.textContent = got ? a.title : "??????（未收集）";
    row.dataset.s = got ? (String(a.title || "") + " " + String(a.kind || "")) : "";
    row.addEventListener("click", () => {
      if (!got) {
        if (el.manualDoc) el.manualDoc.innerHTML = '<div class="manual-empty">这篇你还没收集到。<br><br>'
          + '到它所在的层级里找到那张纸，站上去按 <b>E</b> 阅读。</div>';
        return;
      }
      manualSel = a.id;
      onPick(a);
      renderManual();
    });
    return row;
  }
  function renderKindTab(list, tab) {
    const items = ARCHIVES.filter((a) => manualKindTab(a) === tab);
    const head = document.createElement("div");
    head.className = "manual-group";
    head.dataset.s = manualTabName(tab);
    head.innerHTML = '<span class="mg-name">'
      + manualTabName(tab) + '</span>'
      + '<span class="mg-count">' + items.filter((a) => collected.has(a.id)).length
      + " / " + items.length + "</span>";
    list.appendChild(head);
    for (const a of items) list.appendChild(manualItemRow(a, showManualDoc));
  }
  function renderVideoTab(list) {
    const vids = window.CamRec ? CamRec.list() : [];
    const head = document.createElement("div");
    head.className = "manual-group";
    head.dataset.s = "视频档案 录像";
    head.innerHTML = '<span class="mg-name">视频档案</span>'
      + '<span class="mg-count">' + vids.length + " / " + vids.length + "</span>";
    list.appendChild(head);
    if (!vids.length) {
      if (el.manualDoc) el.manualDoc.innerHTML = '<div class="manual-empty">视频档案还是空的。<br><br>'
        + '<b>摄像机</b>开局自带，就在副手槽里，另有 <b>4 卷普通胶卷</b> —— 按 L 录像（副手默认是 4，按 4 或点右下角副手格也行）。'
        + '按下就消耗一卷：普通 12 秒 / 24 帧每秒，高级 30 秒 / 30 帧每秒，每卷内部帧间隔恒定。'
        + '两种胶卷在 B.N.T.G 商人之家和 Level 11 柜台都能买到（普通 1 瓶杏仁水或 5 枚货币，高级 3 瓶或 15 枚）。'
        + '一卷只能录一次，录完变成只能观看 / 导出 / 丢给别人的<b>录像带</b>。</div>';
      return;
    }
    for (const v of vids) {
      const row = document.createElement("div");
      row.className = "manual-item" + (manualSel === "video:" + v.id ? " sel" : "");
      row.textContent = "录像 · " + v.levelName + (v.tapeEnd ? " · M.E.G录像带结束" : "");
      row.dataset.s = "录像 视频档案 " + String(v.levelName || "");
      row.addEventListener("click", () => {
        manualSel = "video:" + v.id;
        if (window.CamRec) CamRec.play(v.id, el.manualDoc);
        // 不重绘列表：重绘会触发手册的「未选中」兜底，把播放器冲掉
        for (const n of list.querySelectorAll(".manual-item")) n.classList.remove("sel");
        row.classList.add("sel");
      });
      list.appendChild(row);
    }
  }

  // 已解锁的结局/彩蛋才允许被搜到：未解锁的一律不进可搜索文本，避免搜索把标题剧透出来。
  function endingSearchText(id) {
    const ed = ENDINGS[id] || {};
    const d = (typeof ENDING_DOCS !== "undefined" && ENDING_DOCS[id]) || null;
    return [ed.title, d && d.kind, d && d.source, d && d.level, d && d.trigger,
      d && Array.isArray(d.note) ? d.note.join(" ") : ""].filter(Boolean).join(" ");
  }
  function renderEndingTab(list, eggsOnly) {
    const EGG_IDS = [2, 9];
    const unlocked = unlockedEndings().map(Number);
    const head = document.createElement("div");
    head.className = "manual-group";
    head.dataset.s = manualTabName(eggsOnly ? "egg" : "ending");
    if (eggsOnly) {
      const EGGS = [
        { id: 2, hint: "据说只有从 <b>Level 14</b> 活着走出来、或踏进 <b>Level 8</b> 岩洞深处那片郊区的人才有资格看到它。" },
        { id: 9, hint: "据说只有亲自走进过 <b>Level !</b> 的人才有资格看到它。" },
      ];
      const gotN = EGGS.filter((e2) => unlocked.indexOf(e2.id) >= 0).length;
      head.innerHTML = '<span class="mg-name">彩蛋档案</span>' +
        '<span class="mg-count">' + gotN + " / " + EGGS.length + "</span>" +
        '<span class="mg-cls">彩蛋档案 ' + EGGS.length + " 篇 · 已解锁 " + gotN + "</span>";
      list.appendChild(head);
      for (const eg of EGGS) {
        const got = unlocked.indexOf(eg.id) >= 0;
        const r = document.createElement("div");
        r.className = "manual-item" + (got ? "" : " locked") + (manualSel === "end" + eg.id ? " sel" : "");
        r.textContent = got ? ENDINGS[eg.id].title : "??????（未解锁）";
        r.dataset.s = got ? endingSearchText(eg.id) : "";
        if (got) {
          r.addEventListener("click", () => { manualSel = "end" + eg.id; showEndingDoc(ENDINGS[eg.id]); renderManual(); });
        } else {
          r.addEventListener("click", () => {
            if (el.manualDoc) el.manualDoc.innerHTML = '<div class="manual-empty">这个彩蛋还没解锁。<br><br>' + eg.hint;
          });
        }
        list.appendChild(r);
      }
      return;
    }
    const END_IDS = Object.keys(ENDINGS).map(Number).filter((id) => EGG_IDS.indexOf(id) < 0).sort((a, b) => a - b);
    const gotEnd = END_IDS.filter((id) => unlocked.indexOf(id) >= 0);
    head.innerHTML = '<span class="mg-name">结局档案</span>' +
      '<span class="mg-count">' + gotEnd.length + " / " + END_IDS.length + "</span>" +
      '<span class="mg-cls">结局档案 ' + END_IDS.length + " 篇 · 已解锁 " + gotEnd.length + "</span>";
    list.appendChild(head);
    for (const id of END_IDS) {
      const ed = ENDINGS[id];
      if (!ed) continue;
      const got = unlocked.indexOf(Number(id)) >= 0;
      const row = document.createElement("div");
      row.className = "manual-item" + (got ? "" : " locked") + (manualSel === "end" + id ? " sel" : "");
      row.textContent = got ? ed.title : "??????（未解锁）";
      row.dataset.s = got ? endingSearchText(id) : "";
      if (got) {
        row.addEventListener("click", () => { manualSel = "end" + id; showEndingDoc(ed); renderManual(); });
      } else {
        row.addEventListener("click", () => {
          if (el.manualDoc) el.manualDoc.innerHTML = '<div class="manual-empty">这篇结局档案还没解锁。'
            + '<br><br>达成对应结局之后，它会自动归档到这里。</div>';
        });
      }
      list.appendChild(row);
    }
  }

  // 搜索只作用于当前这一页：按分组头把条目归堆，命中就整组展开；
  // 搜索态会覆盖列表原本的折叠 display，关掉搜索后由 renderManual 重建恢复。
  function applyManualSearch(list) {
    const cnt = document.getElementById("manual-search-count");
    const q = String(manualSearch.q || "").trim().toLowerCase();
    const nm = manualTabName(manualTab);
    if (!q) { if (cnt) cnt.textContent = "范围：" + nm; return 0; }
    const nodes = Array.prototype.slice.call(list.children).filter((n) => n.id !== "manual-tabs");
    const blocks = [];
    let cur = null;
    for (const n of nodes) {
      if (n.classList.contains("manual-group")) { cur = { head: n, items: [] }; blocks.push(cur); }
      else if (n.classList.contains("manual-item")) {
        if (cur) cur.items.push(n);
        else blocks.push({ head: null, items: [n] });
      }
    }
    let hits = 0, firstHit = null;
    for (const b of blocks) {
      const headHit = !!(b.head && String(b.head.dataset.s || "").toLowerCase().indexOf(q) >= 0);
      let any = headHit;
      for (const it of b.items) {
        const hit = headHit || String(it.dataset.s || "").toLowerCase().indexOf(q) >= 0;
        it.style.display = hit ? "" : "none";
        if (hit && !headHit) it.classList.add("hit"); else it.classList.remove("hit");
        if (hit) { hits++; any = true; if (!firstHit) firstHit = it; }
      }
      if (b.head) {
        b.head.style.display = any ? "" : "none";
        if (any) b.head.classList.remove("folded");
      }
    }
    // 七个分类按钮竖排占掉大半个列表，命中项常被推到列表外 —— 自动滚到第一条。
    if (firstHit) {
      const lr = list.getBoundingClientRect(), ir = firstHit.getBoundingClientRect();
      list.scrollTop += ir.top - lr.top - 42;   // 给上面的分组头留一行
    }
    if (cnt) cnt.textContent = "在「" + nm + "」找到 " + hits + " 条";
    if (hits === 0 && el.manualDoc) {
      el.manualDoc.innerHTML = '<div class="manual-empty">在「' + escapeHtml(nm)
        + '」里没找到「' + escapeHtml(String(manualSearch.q).trim()) + '」。<br><br>'
        + '搜索只作用于当前这一页 —— 切到左边别的档案页，会用同一个词重新找。</div>';
    }
    return hits;
  }

  function renderManual() {
    const g = game;
    const manualQuery = String(manualSearch.q || "").trim();
    loadFolds();
    el.manualCount.textContent = archiveTotal();
    const list = el.manualList;
    list.innerHTML = "";
    renderManualTabs(list);
    if (manualTab !== "level") {
      if (manualTab === "video") renderVideoTab(list);
      else if (manualTab === "ending" || manualTab === "egg") renderEndingTab(list, manualTab === "egg");
      else renderKindTab(list, manualTab);
      applyManualSearch(list);
      return;
    }
    // 层级列表不要写死 —— 之前写死了 0~11 + hub，后来加的 13/14/15/70 在手册里根本找不到。
    // 现在按"档案里出现过的层级 + 已定义的层级"一起排，新增层级会自动出现。
    for (const lv of manualLevels()) {
      const items = ARCHIVES.filter((a) => a.level === lv);
      if (!items.length) continue;
      const gid = "lv" + String(lv);
      const folded = isFolded(gid);
      // 显示条件：去过这一层 —— 或者手里有这一层的档案。
      // 老玩家可能在还不会记录"到访"的版本里进过这一层并收了档案，
      // 那种情况下层级也要列出来，不然他们已经读到的档案会凭空消失。
      const owned = items.some((a) => collected.has(a.id));
      const visited = hasVisited(lv) || owned;
      const head = document.createElement("div");
      head.className = "manual-group foldable" + (folded ? " folded" : "") + (visited ? "" : " unknown");
      const def = levelDef(lv);
      const cls = def.classes || [];
      // 既没去过、手里也没有这一层的档案：连名字和生存难度都不给
      if (!visited) {
        head.dataset.s = "";
        head.innerHTML = '<span class="mg-caret"></span>' +
          '<span class="mg-name">??????</span>' +
          '<span class="mg-count">未踏足</span>';
        list.appendChild(head);
        continue;
      }
      // 没去过但存有旧档（老版本里进去过并收了档案）：照常列出，只是标一下
      const legacy = owned && !hasVisited(lv);
      head.dataset.s = String(def.name || "") + " Level " + String(lv) + " " + (cls || []).join(" ");
      // 层级名 + 生存难度（等级 / 安全 / 稳定 / 实体或环境危害）
      head.innerHTML = '<span class="mg-caret"></span>' +
        '<span class="mg-name">' + escapeHtml(def.name) + "</span>" +
        '<span class="mg-count">' + items.filter((a) => collected.has(a.id)).length + " / " + items.length + "</span>" +
        (cls.length ? '<span class="mg-cls">生存难度：' + cls.map(escapeHtml).join(" · ") + "</span>" : "") +
        (legacy ? '<span class="mg-cls">旧档 · 尚未再次踏足</span>' : "");
      head.addEventListener("click", () => {
        toggleFold(gid);
        renderManual();
      });
      list.appendChild(head);
      // 搜索时忽略折叠，把条目全部生成出来交给 applyManualSearch 过滤，
      // 否则收起的分组里一条都搜不到。
      if (!folded || manualQuery) {
        for (const a of items) {
          const got = collected.has(a.id);
          const row = document.createElement("div");
          row.className = "manual-item" + (got ? "" : " locked") + (manualSel === a.id ? " sel" : "");
          row.textContent = got ? a.title : "??????（未收集）";
          row.dataset.s = got ? (String(a.title || "") + " " + String(a.kind || "")) : "";
          if (got) {
            row.addEventListener("click", () => {
              manualSel = a.id;
              showManualDoc(a);
              renderManual();
            });
          }
          list.appendChild(row);
        }
      }
    }
    // 结局 / 彩蛋已独立成页（顶部「结局档案」「彩蛋档案」按钮），不再埋在 100 多个层级分组后面。

    // 打开手册要立刻有内容：选中第一个真的能看的档案（已收集的优先，
    // 一个都没收集就选中第一篇并显示为"未收集"的占位）。
    // 选中的是结局（"end0" / "end1" ...）时不参与档案的兜底覆盖 ——
    // 否则点开结局说明立刻就被第一篇档案顶掉了。
    // 打开手册时**什么都不选中** —— 之前会自动挑一篇（哪怕玩家根本没捡过），
    // 结果新玩家一打开就看见一篇"阈界"的档案，可那篇他压根没收集过。
    // 现在必须自己点开层级、再点具体的那一篇才会显示。
    const selIsEnding = typeof manualSel === "string" && manualSel.indexOf("end") === 0;
    const selOk = (selIsEnding && ENDINGS[Number(String(manualSel).slice(3))]) ||
                  (manualSel && ARCHIVES.some((a) => a.id === manualSel && collected.has(a.id)));
    if (!selOk) {
      if (el.manualDoc) {
        el.manualDoc.innerHTML = '<div class="manual-empty">从左边选一篇档案。<br><br>' +
          "先点层级名展开，再点里面那一篇 —— 只有收集到的才会显示内容。</div>";
      }
      manualSel = null;
    }
    applyManualSearch(list);
  }

  function showEndingDoc(ed) {
    // 结局与彩蛋现在都是正式档案：除叙述正文外，补上归档来源、关联层级、
    // 触发方式与归档备注。没解锁的不会走到这里（列表里点不开）。
    const d = (typeof ENDING_DOCS !== "undefined" && ENDING_DOCS[ed.id]) || null;
    let html =
      '<div class="doc-head"><span>' + escapeHtml(d ? d.kind : "结局") + '</span><span>' + escapeHtml(ed.title) + "</span></div>" +
      "<h2>" + escapeHtml(ed.title) + "</h2>";
    if (d) {
      html += "<p>归档来源：" + escapeHtml(d.source) + "<br>"
        + "关联层级：" + escapeHtml(d.level) + "<br>"
        + "触发方式：" + escapeHtml(d.trigger) + "</p>";
    }
    html += "<p>" + escapeHtml(ed.brief) + "</p>";
    if (ENDING_BODY[ed.id]) html += "<p>" + escapeHtml(ENDING_BODY[ed.id]) + "</p>";
    if (d && d.note && d.note.length) {
      for (const n of d.note) html += "<p>" + escapeHtml(n) + "</p>";
    }
    el.manualDoc.innerHTML = html;
  }

  function showManualDoc(a) {
    if (!a) {
      el.manualDoc.innerHTML = '<div class="manual-empty">档案手册还是空的。<br><br>' +
        '在层级里找到泛黄的纸张，站上去按 <b>E</b> 阅读，它就会被收进这里。</div>';
      return;
    }
    // 没收集到的档案不剧透内容，只给标题和一行说明
    if (!collected.has(a.id)) {
      el.manualDoc.innerHTML = '<div class="doc-head"><span>' + escapeHtml(a.kind) + "</span><span>" +
        escapeHtml(a.source) + "</span></div><h2>" + escapeHtml(a.title) + "</h2>" +
        '<div class="manual-empty">这篇你还没收集到。<br><br>到它所在的层级里找到那张纸，站上去按 <b>E</b> 阅读。</div>';
      return;
    }
    let html = '<div class="doc-head"><span>' + escapeHtml(a.kind) + "</span><span>" +
      escapeHtml(a.source) + "</span></div>";
    html += "<h2>" + escapeHtml(a.title) + "</h2>";
    for (const para of a.body) html += "<p>" + escapeHtml(para) + "</p>";
    el.manualDoc.innerHTML = html;
  }

  // 画面上的威胁强度 —— 怪一进视野就泛红、发抖。
  // 和 dangerIntensity 分开：那个只看 7 格内、用来扣理智，范围一大理智就掉疯了。
  function visualThreat() {
    const g = game;
    if (!g || !g.map) return 0;
    // 半径 = 视野对角线的一半（换算成世界距离），也就是"屏幕内"
    let viewR = 7 * TILE;
    try {
      const cam = getCamera();
      viewR = Math.max(viewR, Math.hypot(W, H) / 2 / (cam.scale || 1));
    } catch (e) { /* 相机还没就绪就退回 7 格 */ }
    let near = Infinity;
    for (const e of g.entities) {
      if ((e.floor | 0) !== g.floor) continue;   // 另一层的怪看不见，不算
      if (e.docile) continue;                    // 第 11 效应：无害的实体不吓人，不抖也不泛红
      const d = Math.hypot(e.x - g.player.x, e.y - g.player.y);
      if (d < near) near = d;
    }
    let v;
    if (!(near < viewR)) v = 0;
    else {
      const close = clamp(1 - near / (7 * TILE), 0, 1);
      const edge  = clamp((viewR - near) / Math.max(1, 0.12 * viewR), 0, 1);
      v = Math.max(close, 0.45 * edge);
    }
    return v;
  }

  function dangerIntensity() {
    const g = game;
    let near = 7 * TILE;
    for (const e of g.entities) {
      if ((e.floor | 0) !== g.floor) continue; // 另一层的实体不构成威胁
      if (e.docile) continue;                  // 第 11 效应：无害的实体不掉理智
      const d = Math.hypot(e.x - g.player.x, e.y - g.player.y);
      if (d < near) near = d;
    }
    return clamp(1 - near / (7 * TILE), 0, 1);
  }

  // ---------- 生命值 / 理智值 / 背包 ----------
  // 理智：黑暗里待久了、被实体逼近都会掉；喝杏仁水回复。
  // 生命：受污染的杏仁水会持续扣血（可叠加），理智归零时也会开始掉血。
  // ---------- 肾上腺素 ----------
  // 触发条件：有实体处于追逐状态，而且离得够近。
  // 效果：体力条立刻 +30%，持续时间内疾跑消耗减少 60%（仍会掉，跑久了会见底）；
  //       结束后的 15 秒改为边跑边恢复。
  function updateAdrenaline(g, dt) {
    // Level !「为生命而奔跑」中途不会再变成肾上腺素状态 —— 这一层有自己的体力规则。
    if (String(g.level) === "bang") return;
    if (g.adrenaline > 0) g.adrenaline = Math.max(0, g.adrenaline - dt);
    // 肾上腺素刚结束：接下来 15 秒仍然可以「边跑边恢复」
    if (g.adrenalineBefore > 0 && g.adrenaline === 0) g.adrenalineAfter = 15;
    g.adrenalineBefore = g.adrenaline;
    if (g.adrenalineCd > 0) g.adrenalineCd = Math.max(0, g.adrenalineCd - dt);
    if (g.adrenaline > 0 || g.adrenalineCd > 0) return;

    const R = CONFIG.ADRENALINE_RANGE * TILE;
    for (const e of g.entities) {
      if ((e.floor | 0) !== g.floor) continue;
      if (e.state !== "chase") continue;
      if (Math.hypot(e.x - g.player.x, e.y - g.player.y) > R) continue;
      g.adrenaline = CONFIG.ADRENALINE_DUR;
      g.adrenalineCd = CONFIG.ADRENALINE_COOLDOWN;
      g.player.stamina = Math.min(CONFIG.STAMINA_MAX,
        g.player.stamina + CONFIG.ADRENALINE_STAMINA);
      AudioSys.adrenaline();
      toast("肾上腺素");
      return;
    }
  }

  // ---------- 理智：按层级分档 + 被追逐加速 ----------
  // 基础速度由层级决定（Level 1 极慢、Level 2 稍快 ……），
  // 被实体追逐时整体乘一个倍率，而且脱离追逐之后还会持续加速一段时间
  // （各层级共用同一套追逐机制）。
  function levelSanityRate(g) {
    // 歇脚层（丰裕、不夜城、温水煮青蛙、未来走廊）：理智完全不掉。
    // 这些层级就是给玩家喘口气的地方，摸黑、压惊这些修正也谈不上"掉得更快"。
    if (isRestLevel(g.level)) return 0;
    // Level 0：倚坐在窄拱洞里，脚暂时离开了湿润的地面；柱厅的绒毛浅、地面干燥。
    if (String(g.level) === "0") {
      if ((g.l0perch || 0) > 0) return 0;
      if (l0ZoneAt(g) === "pillar") return 0.28;
    }
    const table = CONFIG.SANITY_BY_LEVEL;
    return table[String(g.level)] != null ? table[String(g.level)] : CONFIG.SANITY_DRAIN_DARK;
  }

  // 是不是歇脚层
  function isRestLevel(level) {
    const list = CONFIG.SANITY_REST_LEVELS || [];
    return list.some((v) => String(v) === String(level));
  }

  // 是否正在被追：只看同层、处于 chase 状态、且离得够近的实体
  function chasedNow(g) {
    const R = CONFIG.SANITY_CHASE_RANGE * TILE;
    for (const e of g.entities) {
      if ((e.floor | 0) !== g.floor) continue;
      if (e.state !== "chase") continue;
      if (Math.hypot(e.x - g.player.x, e.y - g.player.y) < R) return true;
    }
    return false;
  }

  // 悲尸循环进度 0→1（身体变红、花屏与雪花声都按这个来）
  function wretchK(g) {
    if (!g.wretch || !g.wretch.active) return g.wretch && g.wretch.done ? 1 : 0;
    return clamp(1 - g.wretch.left / CONFIG.WRETCH_DUR, 0, 1);
  }

  function updateVitals(g, dt) {
    // 痛处：你的生命值与理智值不复存在，也不会减少 —— 数值就此停住。
    // 你不会死，也不会好起来。你会永远留在这里。
    if (String(g.level) === "pain") {
      g.painNoVitals = true;
      updateVitalsHud(g);
      return;
    }
    if (g.wretch && g.wretch.done) {          // 已经变成悲尸，数值不再变化
      updateVitalsHud(g);
      return;
    }
    const hp0 = g.hp;                         // 无敌模式用：本帧开始时的血量
    const danger = dangerIntensity();

    // 追逐判定：正在被追就刷新"余悸"计时，脱离后仍会加速一阵
    if (chasedNow(g)) g.chaseLinger = CONFIG.SANITY_CHASE_LINGER;
    else if (g.chaseLinger > 0) g.chaseLinger = Math.max(0, g.chaseLinger - dt);
    const chased = g.chaseLinger > 0;
    // 刚喝过杏仁水：压惊期
    if (g.calmLeft > 0) g.calmLeft = Math.max(0, g.calmLeft - dt);
    const calm = g.calmLeft > 0;

    // 悲尸循环：不管在哪个层级，一律按固定的"稍快"速度掉
    let rate;
    if (g.wretch && g.wretch.active) {
      rate = CONFIG.WRETCH_DRAIN;
      g.wretch.left = Math.max(0, g.wretch.left - dt);
    } else {
      rate = levelSanityRate(g);
      if (chased) rate *= CONFIG.SANITY_CHASE_MUL;
      if (calm) rate *= CONFIG.ALMOND_CALM_MUL;
      // 摸黑会更难熬；手电照着稍微好一点（但不会回满，只能靠杏仁水）
      rate *= g.flashlight ? 0.8 : 1;
    }
    // 受污染的杏仁水：不回理智，反而让理智掉得更快（可叠加）
    if (g.badStacks.length) rate *= Math.pow(CONFIG.SANITY_BAD_MUL, g.badStacks.length);
    if (isRestLevel(g.level)) rate = 0;      // 歇脚层：一滴都不掉
    // 实体贴脸时的额外压迫（喝过杏仁水压惊时也会轻一些）
    rate += CONFIG.SANITY_DRAIN_ENTITY * danger * (calm ? CONFIG.ALMOND_CALM_MUL : 1);

    // 1.3.0 · 记忆汁：好受的那段时间理智纹丝不动；劲儿一过，按饮用次数成倍地垮。
    // 大量喝过之后，回理智的速度再也追不上掉的速度 —— 触发「上瘾」结局。
    const juice = g.juice;
    if (juice && juice.doses > 0 && !juice.ended) {
      if (juice.calmLeft > 0) {
        juice.calmLeft = Math.max(0, juice.calmLeft - dt);
        rate = 0;
      } else {
        rate *= juice.drainMul;
        // 「回理智追不上掉理智」：以前这里写的是 rate > 1 这种绝对数值，
        // 可各层基础掉速差几十倍（Level 601 只有 0.2/秒），越安静的层级越触发不了。
        // 改成看掉速被成瘾推高到基础值的几倍 —— 跟层级本身多快无关，
        // 只要杏仁水那点恢复量再也补不回来就算数。必须大量饮用（doses >= 8）才算。
        const baseDrain = levelSanityRate(g);
        const outpaced = baseDrain > 0 ? rate >= baseDrain * 6 : rate > 0.5;
        if (juice.doses >= 8 && juice.drainMul >= 8 && outpaced && g.sanity < 62) {
          juice.relapse = (juice.relapse || 0) + dt;
          if (juice.relapse >= 3.5) {
            juice.ended = true;
            unlockEnding(14);
            showEnding(14, "你又拧开了一瓶。手比脑子快 —— 那一瞬间你明白，已经不是为了好受了。");
            return;
          }
        } else juice.relapse = 0;
      }
    }

    // 悲尸循环期间：理智被压到"濒临崩溃"但不会真的归零。
    // 以前它会一路掉到 0 触发精神崩溃扣血而死 —— 玩家还没来得及变悲尸就已经死了。
    const inWretch = !!(g.wretch && g.wretch.active);
    g.sanity = clamp(g.sanity - rate * dt, inWretch ? 1 : 0, CONFIG.SANITY_MAX);

    // 污染层数倒计时（每层独立计时）
    if (g.badStacks.length) {
      g.badStacks = g.badStacks.filter((s) => (s.left -= dt) > 0);
      g.hp -= 1.6 * g.badStacks.length * dt;          // 持续流失，叠加越多越凶
    }
    // 理智归零：身体跟着垮
    if (g.sanity <= 0 && !inWretch) g.hp -= CONFIG.SANITY_CRASH_HP * dt;
    // Level 0.3：寒冷 —— 每 10 秒扣 1 点血（有节奏，不是持续流失）
    if (String(g.level) === "0.3") {
      g.coldTick = (g.coldTick || 0) + dt;
      if (g.coldTick >= CONFIG.ICEROOM_HP_TICK) { g.coldTick -= CONFIG.ICEROOM_HP_TICK; g.hp -= CONFIG.ICEROOM_HP_HIT; }
    } else g.coldTick = 0;
    // 理智够高（>50）：身体慢慢恢复 —— 只有真的歇得过来才会回血
    // Level 301 例外：空气在腐蚀你，站着不动也不会好转 ——
    // 而且回血速度恰好等于穿防化服时的腐蚀速度（都是 0.5/s），
    // 两者一抵消，血条纹丝不动，玩家会以为防化服"反而更糟"。
    if (g.sanity > CONFIG.REGEN_SANITY_MIN && !(g.wretch && g.wretch.active)
        && String(g.level) !== "301") {
      g.hp = Math.min(CONFIG.HP_MAX, g.hp + CONFIG.REGEN_HP_PER_SEC * dt);
    }
    // Level 11：医院 —— 一栋很大的楼，走进去伤口就开始愈合（比自然回血快得多）
    g.inHospital = false;
    if (isLevel(g, 11) && g.map.hospital && g.map.hospital.size) {
      const ht = Math.floor(g.player.x / TILE) + "," + Math.floor(g.player.y / TILE);
      if (g.map.hospital.has(ht)) {
        if (!g.inHospital) {
          try { toast("医院 —— 灯都还亮着，伤口在愈合"); } catch (e) { /* 忽略 */ }
          try { AudioSys.exitChime(); } catch (e) { /* 忽略 */ }
        }
        g.inHospital = true;
        g.hp = Math.min(CONFIG.HP_MAX, g.hp + CONFIG.HOSPITAL_HEAL_PER_SEC * dt);
        g.sanity = Math.min(CONFIG.SANITY_MAX || 100, g.sanity + CONFIG.HOSPITAL_SANITY_PER_SEC * dt);
      }
    }
    // Level 3：踩在管道漏出的黑色粘稠液体里会被灼伤
    if (g.map.leaks && g.map.leaks.size) {
      const lt = Math.floor(g.player.x / TILE) + "," + Math.floor(g.player.y / TILE);
      if (g.map.leaks.has(lt)) g.hp -= 4 * dt;
    }
    // Level 4：透光的窗 —— 靠太近会被"窗"盯上；再近一点就没救了
    if (g.map.windows && g.map.windows.size) {
      let near = Infinity;
      for (const key of g.map.windows) {
        const parts = key.split(",");
        const wx = (+parts[0] + 0.5) * TILE, wy = (+parts[1] + 0.5) * TILE;
        near = Math.min(near, Math.hypot(wx - g.player.x, wy - g.player.y));
      }
      // 影响范围收窄到"贴上去才算"：2.2 格太远了，站在房间中间也中招。
      if (near < TILE * 0.85) {
        g.hp = 0;                       // 已经站在窗前 —— 它不再是伪装
        g.sanity = Math.max(g.sanity, 1);   // 让死因落在"被窗捕获"，而不是误判成精神崩溃
        g.deathCause = "被「窗」捕获";
        g.killerName = "窗";
      } else if (near < TILE * 1.35) {
        const k = 1 - (near - TILE * 0.85) / (TILE * 0.5);
        g.sanity = clamp(g.sanity - 4 * k * dt, 0, CONFIG.SANITY_MAX);
        g.hp -= 2 * k * dt;
      }
    }

    // Level 10.1 尸湖：水没有墙拦着，能直接走进去 —— 但剧毒 + 强辐射，泡着就是等死
    if (String(g.level) === "10.1" && g.map.water && g.map.water.size) {
      const wt = Math.floor(g.player.x / TILE) + "," + Math.floor(g.player.y / TILE);
      if (g.map.water.has(wt)) {
        g.hp -= CONFIG.DEADLAKE_DPS * dt;
        g.sanity = clamp(g.sanity - CONFIG.DEADLAKE_SANITY_DPS * dt, 0, CONFIG.SANITY_MAX);
        g.deathCause = "在尸湖里中毒";
        g.killerName = "尸湖";
      } else if (g.deathCause === "在尸湖里中毒") {
        g.deathCause = ""; g.killerName = "";
      }
    }
    // Level 486 罪恶之地：这层不靠地形杀人 —— 空气本身在腐蚀你。
    // 只有带面罩的全封闭防护服挡得住（主菜单「服装」里的生化防护服，或局内买的 K 版防化服）。
    if (String(g.level) === "486") {
      const suited = !!(currentOutfitDef(g) || {}).suit;
      if (suited) {
        if (g.deathCause === "在罪恶之地的空气里中毒") { g.deathCause = ""; g.killerName = ""; }
      } else {
        g.hp -= CONFIG.SINLAND_DPS * dt;
        g.deathCause = "在罪恶之地的空气里中毒";
        g.killerName = "罪恶之地的空气";
        if (!g.sinWarned) {
          g.sinWarned = true;
          toastUnfit();
        }
      }
    }
      // ---- 1.8.0：Level 27 岩体泉 — 泡在泉水里 ----
      // 泡一小时以上有积极影响；超过两小时，长时间接触热水会导致头晕和恶心。
      if (String(g.level) === "27") {
        const inW = !!g.inSpring27;
        if (inW) {
          g.soak27 = (g.soak27 || 0) + dt;
          // 泉水富含矿物质：回血也回理智，头脑清醒、精力充沛
          g.hp = clamp(g.hp + 3.2 * dt, 0, CONFIG.HP_MAX);
          g.sanity = clamp(g.sanity + 2.4 * dt, 0, CONFIG.SANITY_MAX);
          if (g.soak27 > 60 && !g.soak27good) {
            g.soak27good = true;
            toast("泡了一小时以上 —— 你觉得自己轻松、平静，也比之前更积极了");
          }
          // 超过两小时：头晕和恶心
          if (g.soak27 > 120) {
            g.sanity = clamp(g.sanity - 2.0 * dt, 0, CONFIG.SANITY_MAX);
            g.hp = clamp(g.hp - 1.2 * dt, 0, CONFIG.HP_MAX);
            if (!g.soak27bad) { g.soak27bad = true; toast("泡太久了 —— 头开始晕，胃里一阵阵发恶心。该出去了"); }
          }
        } else {
          g.soak27 = 0;
          g.soak27good = false;
          g.soak27bad = false;
        }
      }
      // ---- 1.8.0：Level 28 终末美德 — 活体深渊的腐败 ----
      // 第 1 阶段：锁定心智，记忆成片消失（可逆，杏仁水可加快）
      // 接触超 8 小时 -> 第 2 阶段：血管扩张变暗、高烧、无法响应（不可逆）
      // 再 3~4 小时 -> 第 3 阶段：从指尖开始解体为灰烬状颗粒
      if (String(g.level) === "28") {
        const touching = !!g.inAbyss28 || !!g.inPool28;
        if (touching) {
          g.rot28 = (g.rot28 || 0) + dt;
          // 第 1 阶段：记忆从最老的那些开始，成片地消失
          if (g.rot28 > 6 && !g.rot28s1) {
            g.rot28s1 = true;
            toast("第 1 阶段 —— 你想不起刚才在做什么。有些更老的事，也不见了。");
          }
          g.sanity = clamp(g.sanity - 2.6 * dt, 0, CONFIG.SANITY_MAX);
          if (g.rot28 > 60) {                 // 第 2 阶段：血管扩张变暗、高烧
            if (!g.rot28s2) { g.rot28s2 = true; toast("第 2 阶段 —— 血管在扩张、在变暗。你在发烧。杏仁水已经没用了。"); }
            g.hp = clamp(g.hp - 3.4 * dt, 0, CONFIG.HP_MAX);
          }
          if (g.rot28 > 150) {                // 第 3 阶段：从指尖开始解体
            if (!g.rot28s3) { g.rot28s3 = true; toast("第 3 阶段 —— 你的指尖开始变成灰烬状的颗粒，从实在中缩褪。"); }
            g.hp = clamp(g.hp - 7.0 * dt, 0, CONFIG.HP_MAX);
            g.deathCause = "被活体深渊的腐败解体";
            g.killerName = "活体深渊";
          }
        } else if (g.rot28) {
          // 离开深渊：第 1 阶段可逆（喝杏仁水能加快），第 2 阶段之后不可逆
          if (!g.rot28s2) g.rot28 = Math.max(0, g.rot28 - dt * 1.5);
          if (g.deathCause === "被活体深渊的腐败解体") { g.deathCause = ""; g.killerName = ""; }
        }
      }
      // ---- 1.7.0：Level 29 海波利亚 — 外层区域（海）与航行 ----
      if (String(g.level) === "29") {
        const m29 = g.map;
        const tx = Math.floor(g.player.x / TILE), ty = Math.floor(g.player.y / TILE);
        const k29 = tx + "," + ty;
        const onWater = !!(m29 && m29.water29 && m29.water29.has(k29));
        if (onWater && !g.onBoat29) {
          // 岛的边界之外是死亡区 —— 海水本身就是一个威胁
          g.hp = clamp(g.hp - 22 * dt, 0, CONFIG.HP_MAX);
          if (!g.l29warn) { g.l29warn = true; toast("你踩进了海里 —— 这里被认为是死亡区。回岸上去。"); }
        } else if (onWater && g.onBoat29) {
          g.l29warn = false;
          // 每一格算 10 海里 —— 船比人快得多
          if (g.l29lastTile !== k29) {
            g.l29lastTile = k29;
            const before = g.nm29 || 0;
            g.nm29 = Math.min(1500, before + 10);
            if (before < 300 && g.nm29 >= 300) toast("300 海里 —— 岛已经看不见了。");
            if (before < 800 && g.nm29 >= 800) toast("800 海里 —— 水面上开始出现不该出现的东西。");
            if (before < 1200 && g.nm29 >= 1200) toast("1200 海里 —— 有东西在下面动。");
            if (g.nm29 >= 1500) {
              goToLevel(g, 284, "船猛地一顿 —— 水变了",
                "汪洋被永恒的浸没在阳光里。等你回过神，脚下是混凝土浇筑的观景台 —— " +
                "而那条河，你认得。这是 Level 284 ...");
            }
          }
          // 在大海上：浪一直在，越往外越凶
          const rough = 1.6 + 2.4 * ((g.nm29 || 0) / 1500);
          g.hp = clamp(g.hp - rough * dt, 0, CONFIG.HP_MAX);
          g.sanity = clamp(g.sanity - 1.2 * dt, 0, CONFIG.SANITY_MAX);
        } else {
          g.l29warn = false;
        }
        // 克拉肯：漩涡会把一切拉近 —— 进了就出不来
        if (m29 && m29.krakens29 && m29.krakens29.length && (onWater || true)) {
          for (const kr of m29.krakens29) {
            const d = Math.hypot((kr.x + 0.5) * TILE - g.player.x, (kr.y + 0.5) * TILE - g.player.y);
            if (d < TILE * 4) {
              g.hp = clamp(g.hp - 26 * dt, 0, CONFIG.HP_MAX);
              if (!g.l29kr) { g.l29kr = true; toast("水在往一个方向流 —— 下面有东西。它醒了。"); }
              // 被拉向漩涡中心
              if (d > 2) {
                const a = Math.atan2((kr.y + 0.5) * TILE - g.player.y, (kr.x + 0.5) * TILE - g.player.x);
                g.player.x += Math.cos(a) * 26 * dt;
                g.player.y += Math.sin(a) * 26 * dt;
              }
              break;
            } else { g.l29kr = false; }
          }
        }
      }
    // ---- Level 67 欲望烘焙坊：面点的后续反应 ----
    // 档案里的时间线是「五分钟 / 十分钟 / 二十分钟」，游戏里按比例压到几十秒，
    // 但症状的顺序和最后的结果是一样的。
    if (String(g.level) === "67") {
      if (g.p67favT) {
        const el = (performance.now() - g.p67favT) / 1000;
        g.hp -= dt * (1.2 + el * 0.10);
        g.deathCause = "吃下了自己最喜欢的面点";
        g.killerName = "欲望烘焙坊的面点";
        if (el > 6 && !g.p67s1) { g.p67s1 = true; toast("喉咙开始发炎、肿起来了。"); }
        if (el > 13 && !g.p67s2) { g.p67s2 = true; toast("胃里翻江倒海 —— 胃炎。"); }
        if (el > 20 && !g.p67s3) { g.p67s3 = true; toast("皮肤大片大片地发红、脱落 —— 红皮病。"); }
        if (el > 27 && !g.p67s4) { g.p67s4 = true; toast("喘不上气了 —— 呼吸衰竭。"); }
      }
      if (g.p67hatedT) {
        const el = (performance.now() - g.p67hatedT) / 1000;
        if (el > 3 && !g.p67h1) { g.p67h1 = true; toast("肚子绞得厉害 —— 腹泻，还有眩晕。"); }
        if (el > 5 && !g.p67h2) {
          g.p67h2 = true;
          toast("喷射式呕吐，伴着类似轻症流感的症状 —— 然后，地板不见了。");
          AudioSys.exitChime();
          goToLevel(g, 31, "那份面点把你送走了",
            "一阵天旋地转之后，你摔在一片光滑的木地板上 —— 这是 Level 31 ...");
        }
      }
    }

    // ---- Level 20 波瑞阿斯建筑：窗边 / 霓虹区深处的低温 ----
    // 窗 10 米之内会掉到 -22℃ ~ -43℃（头痛、极度偏执）；霓虹区越往里越冷，
    // 有记录的最低是 -27℃。穿上冬装或喝过热巧克力之后能撑一阵。
    // 注意：这里必须用 g.level —— 以前写成 String(lv)，而 updateVitals 里并没有
    // lv 这个变量，结果每帧都抛 ReferenceError，update 直接中断在 updateVitals，
    // 后面的 updateSupplies 永远跑不到 —— 表现为「所有层级的按 E 交互全部失灵」。
    if (String(g.level) === "20") {
      if ((g.warm20 | 0) > 0) g.warm20 = Math.max(0, (g.warm20 | 0) - dt);
      const warm = (g.warm20 | 0) > 0 || !!(currentOutfitDef(g) || {}).suit;
      const t20x = Math.floor(g.player.x / TILE), t20y = Math.floor(g.player.y / TILE);
      const k20 = t20x + "," + t20y;
      const inCold = !!(g.map && g.map.cold20 && g.map.cold20.has(k20));
      // 霓虹区深处：越往右越冷
      const deepCold = !!(g.map && g.map.splitX != null && t20x > g.map.splitX + 30
                          && g.map.neon20 && g.map.neon20.has(k20));
      if ((inCold || deepCold) && !warm) {
        g.sanity = Math.max(0, (g.sanity || 0) - (inCold ? 7 : 3.2) * dt);
        g.hp = Math.max(1, (g.hp || 0) - (inCold ? 2.2 : 1.3) * dt);
        g.cold20T = (g.cold20T || 0) + dt;
        if (g.cold20T > (inCold ? 5.5 : 9)) {
          g.cold20T = 0;
          const lines = inCold
            ? ["太阳穴一跳一跳地疼 —— 你在窗边待太久了。",
               "你开始怀疑自己是不是被谁盯着看。窗外的星星一颗都没有动。",
               "呼出来的气是白的。这里离那扇窗太近了。",
               "头痛得更厉害了 —— 你开始觉得这里所有人都在议论你。"]
            : ["越往里越冷 —— 你的手指开始不听使唤。",
               "呼出来的气在霓虹灯下是白的。再往里走会冻伤。",
               "脚下的坡一直在往下走 —— 而且越来越冷。"];
          toast(lines[randInt(0, lines.length - 1)]);
        }
      } else {
        g.cold20T = 0;
        if (warm && g.deathCause === "在 Level 20 冻伤") { g.deathCause = ""; g.killerName = ""; }
      }
      // ---- 天花板掉下来的橙色果冻：间隔不固定，目前没发现它有危害 ----
      if (g.map) {
        g.map.jellyT = (g.map.jellyT || 10) - dt;
        if (g.map.jellyT <= 0) {
          g.map.jellyT = 9 + Math.random() * 13;
          const list = floorList(g.map, g.floor);
          if (list && list.length) {
            for (let a = 0; a < 60; a++) {
              const t = list[randInt(0, list.length - 1)];
              if (!t) break;
              const d = Math.hypot((t.x + 0.5) * TILE - g.player.x, (t.y + 0.5) * TILE - g.player.y) / TILE;
              if (d < 4 || d > 14) continue;
              g.map.props.push({ x: t.x, y: t.y, floor: g.floor, type: "l20jelly", seed: randInt(1, 9999) });
              // 别让果冻越积越多
              const js = g.map.props.filter((pp) => pp.type === "l20jelly");
              if (js.length > 22) { const old = js[0]; const ix = g.map.props.indexOf(old); if (ix >= 0) g.map.props.splice(ix, 1); }
              if (d < 11) toast("有什么东西从天花板上掉了下来 —— 一团橙色的果冻，还在抖。");
              break;
            }
          }
        }
      }
    }
    // Level 485 蒙黑天空：新娘 —— 个头小、走得慢，但碰到就是死
    if (String(g.level) === "485" && g.entities && g.entities.length) {
      for (const e of g.entities) {
        if (e.kind !== "bride") continue;
        if (Math.hypot(e.x - g.player.x, e.y - g.player.y) < TILE * 0.62) {
          g.hp = 0;
          g.deathCause = "被新娘碰到";
          g.killerName = "新娘";
          break;
        }
      }
    }
    // ===== 新增层级：Level 37 泡水回理智 / Level 994 涨潮 =====
    updateNewLevels(g, dt);

    // 悲尸循环的进入 / 脱离 / 结算
    updateWretch(g, dt);

    // 无敌模式：本帧掉的所有血都退回去（治疗不受影响）
    if (g.invincible && g.hp < hp0) g.hp = hp0;
    g.hp = clamp(g.hp, 0, CONFIG.HP_MAX);
    updateVitalsHud(g);            // 条是连续变化的，每帧刷新（内部按整数节流）
    if (g.hp <= 0 && !(g.wretch && g.wretch.done)) dieVitals();
  }


  // ================= Level 6：熄灯 —— 墙壁记忆 =================
  // 玩家碰到墙壁时，墙上留下一个点（"这里是墙"）；贴着墙移动，点与点连成一条线。
  // 这些点点与线会随时间慢慢淡掉（CONFIG.MEMORY_FADE 秒），所以你必须一直用手去确认。
  function updateMemory(g, dt) {
    const mem = g.memory;
    mem.acc += dt;
    if (mem.acc < CONFIG.MEMORY_TICK) { fadeMemory(g); return; }
    mem.acc = 0;

    const p = g.player;
    const map = g.map;
    const grid = layerGrid(map, g.floor);
    const ptx = Math.floor(p.x / TILE), pty = Math.floor(p.y / TILE);
    const touched = new Set();

    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const tx = ptx + dx, ty = pty + dy;
        if (tx < 0 || ty < 0 || tx >= map.size || ty >= map.size) continue;
        if (grid[ty][tx] !== 1) continue;                 // 只看墙
        // 墙格矩形上离玩家最近的点 = 手碰到的位置
        const cx = clamp(p.x, tx * TILE, tx * TILE + TILE);
        const cy = clamp(p.y, ty * TILE, ty * TILE + TILE);
        if (Math.hypot(p.x - cx, p.y - cy) > p.radius + CONFIG.MEMORY_REACH) continue;
        const key = tx + "," + ty;
        touched.add(key);
        const prev = mem.last.get(key);
        if (!prev) {
          // 第一次碰到：一个点
          mem.marks.push({ x1: cx, y1: cy, x2: cx, y2: cy, t: g.time });
          mem.last.set(key, { x: cx, y: cy });
        } else if (Math.hypot(prev.x - cx, prev.y - cy) >= CONFIG.MEMORY_MIN_STEP) {
          // 贴着墙走：从上一个点连一条线过来
          mem.marks.push({ x1: prev.x, y1: prev.y, x2: cx, y2: cy, t: g.time });
          mem.last.set(key, { x: cx, y: cy });
        }
      }
    }
    // 手离开了这面墙：下次再碰到就重新起一个点
    for (const key of Array.from(mem.last.keys())) {
      if (!touched.has(key)) mem.last.delete(key);
    }
    fadeMemory(g);
  }

  function fadeMemory(g) {
    const mem = g.memory;
    if (!mem.marks.length) return;
    const keep = [];
    for (const m of mem.marks) {
      if (g.time - m.t < CONFIG.MEMORY_FADE) keep.push(m);
    }
    // 限制总量，免得长时间游玩后越积越多
    if (keep.length > 900) keep.splice(0, keep.length - 900);
    mem.marks = keep;
  }

  // Level 3：管道排气阀时不时喷出一股蒸汽（声音 + 一小团白雾）
  function updateSteam(g, dt) {
    if (g.steamTimer == null) g.steamTimer = rand(2, 6);
    g.steamTimer -= dt;
    if (g.steamTimer > 0) return;
    g.steamTimer = rand(CONFIG.STEAM_MIN, CONFIG.STEAM_MAX);
    // 在玩家附近找一处漏液 / 管道格，从那里喷
    const src = g.map.leaks && g.map.leaks.size ? [...g.map.leaks] : null;
    let at = null;
    if (src && Math.random() < 0.6) {
      for (let i = 0; i < 12; i++) {
        const p = src[randInt(0, src.length - 1)].split(",");
        const wx = (+p[0] + 0.5) * TILE, wy = (+p[1] + 0.5) * TILE;
        if (Math.hypot(wx - g.player.x, wy - g.player.y) < TILE * 18) { at = { x: wx, y: wy }; break; }
      }
    }
    if (!at) {
      const a = rand(0, Math.PI * 2), d = TILE * rand(3, 12);
      at = { x: g.player.x + Math.cos(a) * d, y: g.player.y + Math.sin(a) * d };
    }
    AudioSys.steam();
    g.steamPuffs = g.steamPuffs || [];
    for (let i = 0; i < 10; i++) {
      g.steamPuffs.push({
        x: at.x + rand(-6, 6), y: at.y + rand(-6, 6),
        vx: rand(-14, 14), vy: rand(-26, -8),
        r: rand(5, 11), life: rand(1.1, 2.0), t: 0,
      });
    }
    if (g.steamPuffs.length > 120) g.steamPuffs.splice(0, g.steamPuffs.length - 120);
  }

  function drawSteam(ctx, g, cam) {
    const list = g.steamPuffs;
    if (!list || !list.length) return;
    const left = cam.x - cam.viewW / 2, top = cam.y - cam.viewH / 2;
    ctx.save();
    for (const p of list) {
      if (p.x + 40 < left || p.y + 40 < top || p.x - 40 > left + cam.viewW || p.y - 40 > top + cam.viewH) continue;
      const k = 1 - p.t / p.life;
      ctx.globalAlpha = 0.30 * k * k;
      ctx.fillStyle = "#e8eee6";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * (1 + (1 - k) * 1.6), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function updateSteamPuffs(g, dt) {
    const list = g.steamPuffs;
    if (!list || !list.length) return;
    for (const p of list) {
      p.t += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy *= 0.985;
      p.r += 6 * dt;
    }
    g.steamPuffs = list.filter((p) => p.t < p.life);
  }

  // ================= Level 9：郊区 =================
  // 沿着箭头路牌一直走（100~200 英里）能到 Level 11；
  // 浓雾是碾压者的生成机制；走进田野会通往 Level 10。
  function updateSuburb(g, dt) {
    // ---- 离开步道走进田野，会因某种原因通往 Level 10 ----
    {
      const k9 = Math.floor(g.player.x / TILE) + "," + Math.floor(g.player.y / TILE);
      if (g.map.field && g.map.field.has(k9) && g.phase === "playing") {
        AudioSys.exitChime();
        goToLevel(g, 10, "你离开了步道，走进了田野",
          "脚下的沥青变成了泥土，铅灰色的天空压得很低 —— 你到了 Level 10 ...");
        return;
      }
    }

    // ---- 路牌进度：只有在街上、且朝着路牌指的方向走才算 ----
    if (g.mileGoal == null) {
      g.mileGoal = randInt(CONFIG.SUBURB_MILE_MIN, CONFIG.SUBURB_MILE_MAX);
      g.signMiles = 0;
      g.lastPos = null;
    }
    const px = g.player.x, py = g.player.y;
    if (g.lastPos) {
      const dx = px - g.lastPos.x, dy = py - g.lastPos.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 0.5) {
        const tk = Math.floor(px / TILE) + "," + Math.floor(py / TILE);
        if (g.map.road && g.map.road.has(tk)) {
          const sg = nearestSign(g, px, py);
          if (sg) {
            const ux = dx / dist, uy = dy / dist;
            if (ux * sg.dx + uy * sg.dy > 0.25) {
              g.signMiles += dist / (CONFIG.SUBURB_MILE_TILES * TILE);
              g.onTrailT = 2.5;                 // 正在"沿着路牌走"
            }
          }
        }
      }
    }
    g.lastPos = { x: px, y: py };
    if (g.onTrailT > 0) g.onTrailT = Math.max(0, g.onTrailT - dt);
    if (g.signMiles >= g.mileGoal && g.phase === "playing") {
      AudioSys.exitChime();
      goToLevel(g, 11, "路牌上的数字终于开始变小",
        "郊区的房屋一点点稀疏下去，远处出现了城市的轮廓 —— 你走到了 Level 11 ...");
      return;
    }

    // ---- 浓雾：碾压者的生成机制 ----
    if (g.fog9T == null) { g.fog9T = rand(10, 24); g.fog9 = 0; g.fog9Left = 0; }
    if (g.fog9Left > 0) {
      g.fog9Left -= dt;
      g.fog9 = Math.min(1, g.fog9 + dt * 0.35);
    } else {
      g.fog9 = Math.max(0, g.fog9 - dt * 0.3);
      g.fog9T -= dt;
      if (g.fog9T <= 0) {
        g.fog9T = rand(CONFIG.SUBURB_FOG_MIN, CONFIG.SUBURB_FOG_MAX);
        g.fog9Left = CONFIG.SUBURB_FOG_DUR;
        spawnCrushers(g);
      }
    }
  }

  function nearestSign(g, px, py) {
    let best = null, bd = Infinity;
    for (const sg of (g.map.signs || [])) {
      const d = Math.hypot((sg.x + 0.5) * TILE - px, (sg.y + 0.5) * TILE - py);
      if (d < bd) { bd = d; best = sg; }
    }
    if (!best || bd > TILE * 16) return null;
    return { dx: best.dx, dy: best.dy };
  }

  // 浓雾里生成碾压者：庞大、缓慢、不太可能甩掉
  function spawnCrushers(g) {
    const list = floorList(g.map, g.floor);
    let made = 0;
    for (let i = 0; i < CONFIG.SUBURB_FOG_CRUSHERS; i++) {
      for (let a = 0; a < 60; a++) {
        const t = list[randInt(0, list.length - 1)];
        if (!t) break;
        const d = Math.hypot((t.x + 0.5) * TILE - g.player.x, (t.y + 0.5) * TILE - g.player.y);
        if (d < TILE * 9 || d > TILE * 26) continue;
        g.entities.push(new Entity(g.map, t.x, t.y, g.level, "crusher", g.floor));
        made++;
        break;
      }
    }
    if (made) {
      AudioSys.roar(1.2);
      toast("浓雾里有什么东西成形了 —— 碾压者。");
    }
  }

  // ================= Level 10：丰裕 =================
  // 一成不变的阴天让人失去时间观念，只有偶尔的一阵风、一场小雨或一阵雾打破均一。
  // 沿着泥土小径走很久很久，最终会走到 Level 11。
  function updateField(g, dt) {
    // 走到小径尽头 -> Level 11（不是"走够多少距离"）。
    // 以前按累计行走距离判定，玩家在麦田里绕圈也算进度，很没道理；
    // 现在认的是小径最后那一格，走到那儿才算走完。
    const te = g.map.trailEnd;
    if (te && g.phase === "playing") {
      const d = Math.hypot((te.x + 0.5) * TILE - g.player.x, (te.y + 0.5) * TILE - g.player.y);
      if (d < TILE * 1.6) {
        AudioSys.exitChime();
        goToLevel(g, 11, "小径尽头出现了城市的轮廓",
          "麦田一点点退去，沥青与混凝土的气味扑面而来 —— 你走进了 Level 11 ...");
        return;
      }
    }
    // 进度条仍然按小径上的行走距离走，给玩家一个"走了多久"的参考
    if (g.trailDist == null) { g.trailDist = 0; g.trailLast = null; }
    const t = Math.floor(g.player.x / TILE) + "," + Math.floor(g.player.y / TILE);
    if (g.map.trail && g.map.trail.has(t)) {
      if (g.trailLast) {
        g.trailDist += Math.hypot(g.player.x - g.trailLast.x, g.player.y - g.trailLast.y);
      }
      g.trailLast = { x: g.player.x, y: g.player.y };
    } else {
      g.trailLast = { x: g.player.x, y: g.player.y };
    }
    // 天气：短暂的雾与小雨
    const w = g.weather || (g.weather = { rain: 0, fog: 0, rainT: 0, fogT: 0, rainLeft: 0, fogLeft: 0, windT: 0 });
    if (w.rainLeft > 0) { w.rainLeft -= dt; w.rain = Math.min(1, w.rain + dt * 0.6); }
    else { w.rain = Math.max(0, w.rain - dt * 0.5); w.rainT -= dt; if (w.rainT <= 0) { w.rainT = rand(CONFIG.FIELD_RAIN_MIN, CONFIG.FIELD_RAIN_MAX); w.rainLeft = CONFIG.FIELD_RAIN_DUR; } }
    if (w.fogLeft > 0) { w.fogLeft -= dt; w.fog = Math.min(1, w.fog + dt * 0.4); }
    else { w.fog = Math.max(0, w.fog - dt * 0.35); w.fogT -= dt; if (w.fogT <= 0) { w.fogT = rand(CONFIG.FIELD_FOG_MIN, CONFIG.FIELD_FOG_MAX); w.fogLeft = CONFIG.FIELD_FOG_DUR; } }
    // 风：偶尔吹动整片庄稼
    w.windT -= dt;
    if (w.windT <= 0) { w.windT = rand(7, 18); AudioSys.wind(); }
  }

  // ================= Level 11：不夜城 =================
  // 偶尔会有模样随机的汽车在街上行驶，直到缓缓停下 —— 车里通常没人，
  // 但也有报告称会坐着一个、最多四个无面灵。
  function updateCity(g, dt) {
    const map = g.map;
    map.cars = map.cars || [];
    if (g.carTimer == null) g.carTimer = rand(6, 16);
    g.carTimer -= dt;
    if (g.carTimer <= 0) {
      g.carTimer = rand(CONFIG.CITY_CAR_MIN, CONFIG.CITY_CAR_MAX);
      spawnCar(g);
    }
    const T = TILE;
    for (const c of map.cars) {
      if (c.stopped) continue;
      c.speed = Math.max(0, c.speed - dt * 26);          // 缓缓减速
      c.x += Math.cos(c.ang) * c.speed * dt;
      c.y += Math.sin(c.ang) * c.speed * dt;
      const tx = Math.floor(c.x / T), ty = Math.floor(c.y / T);
      if (c.speed <= 4 || tx < 1 || ty < 1 || tx >= map.size - 1 || ty >= map.size - 1 ||
          (map.layers[0][ty] && map.layers[0][ty][tx] === 1)) {
        c.stopped = true;
        c.speed = 0;
        // 停下的车里偶尔坐着无面灵
        const n = Math.random() < 0.45 ? randInt(1, 4) : 0;
        for (let i = 0; i < n; i++) {
          const t2 = Math.floor(c.x / T) + randInt(-1, 1);
          const t3 = Math.floor(c.y / T) + randInt(-1, 1);
          if (t2 < 1 || t3 < 1 || t2 >= map.size - 1 || t3 >= map.size - 1) continue;
          if (map.layers[0][t3][t2] !== 0) continue;
          g.entities.push(new Entity(map, t2, t3, g.level, "faceling", g.floor));
        }
        // 第 11 效应：它们从车里下来后也只是散开，不会扑上来
      }
    }
    if (map.cars.length > 6) map.cars.splice(0, map.cars.length - 6);
  }

  function spawnCar(g) {
    const map = g.map;
    const B = map.block || 11;
    const horiz = Math.random() < 0.5;
    const lane = randInt(1, Math.floor((map.size - 4) / B) - 1) * B + 1;
    const colors = ["#7a4a3a", "#3f5a6b", "#6b6b4a", "#4a3f4f", "#5c5c5c", "#8a7a4a"];
    const dir = Math.random() < 0.5 ? 1 : -1;
    const c = {
      x: 0, y: 0, speed: rand(90, 150), stopped: false,
      color: colors[randInt(0, colors.length - 1)],
      dir: 0, ang: 0,
    };
    if (horiz) {
      c.y = (lane + 1) * TILE;
      c.x = dir > 0 ? 3 * TILE : (map.size - 4) * TILE;
      c.ang = dir > 0 ? 0 : Math.PI;
      c.dir = dir;
    } else {
      c.x = (lane + 1) * TILE;
      c.y = dir > 0 ? 3 * TILE : (map.size - 4) * TILE;
      c.ang = dir > 0 ? Math.PI / 2 : -Math.PI / 2;
      c.dir = dir;
    }
    map.cars.push(c);
  }

  // ================= 各层级的专属系统 =================
  function updateHotel(g, dt) {
    // 客房门：会随时间长开长合（有些门甚至会自己解锁）
    for (const d of g.map.doors) {
      if (d.kind !== "room5") continue;
      d.autoT -= dt;
      if (d.autoT > 0) continue;
      d.autoT = rand(6, 16);
      if (d.locked) {
        d.locked = false;
        continue;
      }
      if (Math.random() < 0.5) {
        setDoorOpen(g.map, d, !d.open);
        AudioSys.door(d.open);
      }
    }
    // 贝弗莉室：那盘麻将让人本能地想离它远点
    const mj = g.map.mahjong;
    if (mj && (g.floor | 0) === 1) {
      const mx = mj.x * TILE, my = mj.y * TILE;
      const d = Math.hypot(g.player.x - mx, g.player.y - my);
      if (d < TILE * 3.2 && d > 0.5) {
        const push = (1 - d / (TILE * 3.2)) * 70 * dt;
        g.player.x += ((g.player.x - mx) / d) * push;
        g.player.y += ((g.player.y - my) / d) * push;
        if (!g.mjWarned) {
          g.mjWarned = true;
          toast("有什么东西在逼你离那盘麻将远一点 —— 它还没打完");
        }
      }
    }
    // 锅炉房：高温
    if ((g.floor | 0) === 2) {
      g.hp -= CONFIG.BOILER_HEAT_DPS * dt;
      g.steamTimer -= dt;
      if (g.steamTimer <= 0) { g.steamTimer = rand(2.5, 6); AudioSys.steam(); }
    }
    // 唱片机：随机切换的爵士乐
    g.jazzTimer -= dt;
    if (g.jazzTimer <= 0) { g.jazzTimer = rand(5, 11); AudioSys.jazz(); }
  }

  function updateDark(g, dt) {
    updateMemory(g, dt);
    // 幻听：碎步声、呼吸声、呢喃
    g.whisperTimer -= dt;
    if (g.whisperTimer <= 0) {
      g.whisperTimer = rand(CONFIG.DARK_WHISPER_MIN, CONFIG.DARK_WHISPER_MAX);
      AudioSys.whisper();
    }
    // 越接近楼梯，水声越明显
    if (g.map.stairs) {
      const d = Math.hypot((g.map.stairs.x + 0.5) * TILE - g.player.x,
        (g.map.stairs.y + 0.5) * TILE - g.player.y);
      if (d < TILE * 12) {
        g.waterTimer = (g.waterTimer || 0) - dt;
        if (g.waterTimer <= 0) { g.waterTimer = rand(0.8, 2.2); AudioSys.water(); }
      }
    }
  }

  function updateDive(g, dt) {
    const water = inWater(g);
    if (water) {
      const deep = playerDepth(g) > 1000;
      g.air -= (deep ? CONFIG.DIVE_AIR_DRAIN_DEEP : CONFIG.DIVE_AIR_DRAIN) * dt;
      if (g.air <= 0) {
        g.air = 0;
        g.hp -= 9 * dt;                                  // 憋不住了
      }
      // 没有潜水服：暮色带以下的水压会把你压垮
      if (playerDepth(g) > 1000 && !hasItem("divesuit")) {
        g.hp -= CONFIG.DIVE_PRESSURE_DPS * dt;
      }
    } else {
      g.air = Math.min(CONFIG.DIVE_AIR_MAX, g.air + 40 * dt);   // 回到房间就能喘气
    }
    // 实体：日光带/暮色带是小小的地盘，午夜带/深渊带归七层之物
    for (const e of g.entities) {
      const ed = playerDepth(g);
      if (e.kind === "thing7" && ed < 3000) { /* 它不会离开自己的领域 */ }
    }
  }

  function updateCave(g, dt) {
    const k = tileKeyOf(g.player);
    // 有毒气体
    if (g.map.toxic && g.map.toxic.has(k)) {
      g.hp -= CONFIG.CAVE_TOXIC_DPS * dt;
      if (!g.toxicWarn) { g.toxicWarn = true; toast("空气里有股刺鼻的味道 —— 别在这里呼吸"); }
    } else g.toxicWarn = false;
    // 蜘蛛巢
    if (g.map.nests && g.map.nests.has(k)) {
      g.hp -= CONFIG.CAVE_NEST_DPS * dt;
      if (!g.nestWarn) { g.nestWarn = true; toast("整片洞穴都被蜘蛛占据了 —— 快离开"); }
    } else g.nestWarn = false;
    // 涨潮：干燥的洞穴会在几秒内被淹没
    if (g.floodLeft > 0) {
      g.floodLeft -= dt;
      if (g.map.floods.has(k)) g.hp -= 3.5 * dt;
    } else {
      g.floodTimer -= dt;
      if (g.floodTimer <= 0) {
        g.floodTimer = rand(CONFIG.CAVE_FLOOD_MIN, CONFIG.CAVE_FLOOD_MAX);
        g.floodLeft = CONFIG.CAVE_FLOOD_DUR;
        g.map.floods.clear();
        const list = floorList(g.map, g.floor);
        const c = list[randInt(0, list.length - 1)];
        if (c) {
          const r = randInt(4, 8);
          for (let y = c.y - r; y <= c.y + r; y++) {
            for (let x = c.x - r; x <= c.x + r; x++) {
              if (x > 1 && y > 1 && x < g.map.size - 2 && y < g.map.size - 2 &&
                  layerGrid(g.map, g.floor)[y][x] === 0) g.map.floods.add(x + "," + y);
            }
          }
        }
        toast("水来了 —— 洞穴正在被淹没");
        AudioSys.collapse();
      }
    }
    // 不稳定的重力：方向说变就变
    if (g.gravityFlip > 0) {
      g.gravityFlip -= dt;
      if (g.gravityFlip <= 0) toast("重力恢复正常了");
    } else if (Math.random() < dt * 0.02) {
      g.gravityFlip = rand(3, 6);
      toast("重力翻转了 —— 方向全乱了");
    }
    // 非欧几何：同一条路走两遍，到的地方完全不同
    if (g.warpCd > 0) g.warpCd -= dt;
    else if (g.map.warps.has(k)) {
      const list = floorList(g.map, g.floor);
      const t = list[randInt(0, list.length - 1)];
      if (t) {
        g.player.x = (t.x + 0.5) * TILE;
        g.player.y = (t.y + 0.5) * TILE;
        g.warpCd = 4;
        toast("空间扭曲了 —— 你已经不在原来那条路上");
        AudioSys.growl();
      }
    }
  }

  function updateHub(g, dt) {
    // 那扇装饰着气球的窗户 —— 原先指向 Level Fun，现在通往 Level 26
    if (g.map.balloon && !g.balloonSeen) {
      const b = g.map.balloon;
      if (Math.hypot((b.x + 0.5) * TILE - g.player.x, (b.y + 0.5) * TILE - g.player.y) < TILE * 3) {
        g.balloonSeen = true;
        toast("一扇装饰着可爱气球的窗户 …… 按 E 摸一下，看看后面是什么");
      }
    }
  }

  // ---------- 悲尸循环 ----------
  // 理智 ≤ 10 时开启：45 秒内必须找到杏仁水喝下去。
  //   喝到杏仁水、理智回到 10 以上 -> 脱离循环，恢复常态
  //   喝下的是受污染的杏仁水  -> 直接变成悲尸
  //   45 秒到还没喝到        -> 变成悲尸
  function updateWretch(g, dt) {
    if (g.wretch && g.wretch.done) return;
    if (!g.wretch) g.wretch = { active: false, left: 0, done: false };
    const w = g.wretch;

    if (!w.active) {
      if (g.sanity <= CONFIG.WRETCH_TRIGGER) {
        w.active = true;
        w.left = CONFIG.WRETCH_DUR;
        AudioSys.startStatic();
        toast("悲尸循环已开始 —— 45 秒内找到杏仁水，否则你将不再是人");
        flashLevelToast("悲尸循环", "理智正在崩塌 · 45 秒内喝下杏仁水");
      }
      return;
    }

    // 循环中：找到杏仁水、理智回到 10 以上就脱离
    if (g.sanity > CONFIG.WRETCH_ESCAPE) {
      w.active = false;
      w.left = 0;
      AudioSys.stopStatic();
      toast("杏仁水起作用了 —— 你从悲尸循环里挣脱出来");
      return;
    }
    // 45 秒到 —— 变成悲尸
    if (w.left <= 0) becomeWretch(g, "理智彻底崩塌");
  }

  // 变成悲尸：解锁结局 0
  function becomeWretch(g, reason) {
    const g2 = g;
    if (g2.wretch && g2.wretch.done) return;
    g2.wretch = g2.wretch || {};
    g2.wretch.active = false;
    g2.wretch.left = 0;
    g2.wretch.done = true;
    g2.sanity = 0;
    AudioSys.startStatic(1);
    AudioSys.jumpscare();
    unlockEnding(0, g2);
    // 结局面板
    const name = levelDef(g2.level).name;
    const bar = hasCrowbar() ? "，手里还攥着那根撬棍" : "";
    el.wretchLevel.textContent = name;
    el.wretchLine.textContent = "你无意识地游荡在「" + name + "」里" + bar + "，攻击附近的流浪者。";
    if (el.wretchReason) el.wretchReason.textContent = reason || "";
    if (el.wretchEnd) el.wretchEnd.textContent = "结局 0 · 悲尸循环";
    show(el.wretch);
    g2.phase = "wretch";
    hide(el.wretchTimer);
    if (el.vitals) el.vitals.classList.remove("wretch-on");
    lastWretch = false;
    hide(el.pickupHint);
    hide(el.doorHint);
    hide(el.btnDoor);
    if (el.btnE) el.btnE.classList.remove("ready");
      if (el.btnAct) { el.btnAct.classList.remove("ready"); hide(el.btnAct); }
  }

  // 结局解锁（写进 localStorage，档案手册里能翻到）
  // 结局只有 0 和 1。结局 2 是彩蛋（从 Level 14 活着走出来），
  // 单独显示成一个"彩蛋"分组，没解锁时不能点开看内容。
  const ENDINGS = {
    0: {
      id: 0, title: "结局 0 · 悲尸循环",
      brief: "你没能撑住。理智归零之后，你成了后室里最常见的那种东西 —— 一个在黑暗里游荡、"
           + "听见活人就会扑上来的悲尸。你会忘记自己曾经是人。",
    },
    1: {
      id: 1, title: "结局 1 · 被实体吃掉",
      brief: "它比你快。你甚至没来得及回头看清楚那是什么 —— 后室里大多数流浪者都是这样消失的。",
    },
    3: {
      id: 3, title: "结局 · 不要忘了我",
      brief: "潮水比人快。你的下半身先消失了，然后是手，然后是名字。"
           + "你没有失去意识，也没有掉一滴血 —— 你只是慢慢地、完整地，不在这片沙滩上了。",
    },
    4: {
      id: 4, title: "结局 · 回到现实",
      brief: "你砸碎了 Level 301 最上方那扇窗，从那里爬了出去。"
           + "前厅的风吹在脸上，你甚至能闻到楼下早餐的味道。",
    },
    7: {
      id: 7, title: "结局 · 无垠城市",
      brief: "你跳进了无尽终章的那片白色 —— 醒来时站在 Level 11 不夜城的街上。"
           + "霓虹永远亮着，街道永远走不到头。然后你在这里崩溃了。",
    },
    5: {
      id: 5, title: "结局 · 过去与未来",
      brief: "你到过的每一层都被切下一块，缝在了这里。"
           + "没有未来，只有过去。",
    },
    6: {
      id: 6, title: "结局 · 精神崩溃",
      brief: "你对上了密码，EXIT 的门开了。可你走出图书馆的时候，"
           + "已经不确定门后面等着的到底是不是 Level 0 了。",
    },
    8: {
      id: 8, title: "结局 · 溺死",
      brief: "水没有多深，可你沉下去了。三十秒之后，肺里先是烧，然后什么感觉都没有了。"
           + "后室里淹死的人不多 —— 因为大多数水都不够深。这一处够。",
    },
    10: {
      id: 10, title: "结局 · 抽离现实",
      brief: "你走得太远了。天空盒的边缘开始一格一格地坏掉，露出后面紫黑相间的东西 —— "
           + "那是它自己。你看明白了：这些岛、这片天、你记得的一切，都是假的。"
           + "它停了下来，用那双不该存在的眼睛看着你。你甚至来不及后悔。",
    },
    2: {
      id: 2, title: "彩蛋 1 · 居然被你找到了",
      brief: "Level 14 是死区，是精神危害，是几乎没有人在活着的时候描述过的地方。"
           + "而你从那里活着走了出来，一步踏进了 Level 15 —— 未来走廊。"
           + "很少有人相信这是做得到的。",
    },
    9: {
      id: 9, title: "彩蛋 2 · 这不是被删了吗？",
      brief: "它在档案里被划掉了 —— 编号那一栏只剩一个「!」，批注写着「已从主列表中移除」。"
           + "可你还是走了进去：192 格长的走廊，两秒之后才亮起的红灯，"
           + "和身后那只用你同样的速度追上来的东西。",
    },
    12: {
      id: 12, title: "结局 · 宜居",
      brief: "你推开了Level 1000草地上那栋木屋的门。屋里铺着木地板，炉子还烧着，"
           + "床已经铺好了。外面永远是傍晚。你留了下来，再也没人找得到你。",
    },
    11: {
      id: 11, title: "结局 · 与群星共舞",
      brief: "你凑近了那扇星多得反常的舷窗 —— 然后就站在了恒星的内部。"
           + "热浪先到，然后是光。你没有疼：几百万开尔文的东西，不给你疼的时间。"
           + "无线电里那个人一直等着有人来。她说：好。",
    },
    13: {
      id: 13, title: "结局 · 派对",
      brief: "它们没有杀你。几只派对客把你拖进了一间平时根本进不去的房间，围着你站了一圈。"
           + "几秒之后你也笑了起来 —— 嘴角那个弧度，和它们一模一样。",
    },
    14: {
      id: 14, title: "结局 · 上瘾",
      brief: "一开始只是想再好受一会儿。后来好受的时间越来越短，短到你刚放下瓶子，"
           + "下一瓶就已经在手心里了。杏仁水再也追不上那个速度。",
    },
  };
  // 每个结局在档案里点开后的正文
  const ENDING_BODY = {
    14: "第一瓶的时候，它真的把一切修好了 —— 理智回满，脑子里那些吵了很久的声音全停了，"
      + "整整半分钟你什么都不怕。\n"
      + "第二瓶只有二十多秒。第五瓶刚过，好受的劲儿还没散干净，垮下来的速度已经比从前快了好几倍。\n"
      + "你试过杏仁水。它压得住一阵，压不住下一阵。\n"
      + "M.E.G. 在假现实那片草地边上立过一块牌子：售货机里的东西是无限的，人不是。"
      + "喝到后来你已经不是在为了好受而喝，只是停不下来 —— 回理智的速度再也追不上掉的速度，"
      + "于是那片草地就成了你最后待的地方。",
    12: "那栋屋子占地六格宽五格深，是一栋真的房子：坡顶、木墙、亮着的窗、"
      + "屋里的床桌椅地毯书架和暖炉，屋外还有菜园、水井、栅栏和一条通向门口的石板路。\n"
      + "Level 1000 的天空永远停在傍晚与日落之间，恒温 18~24℃，动植物全部可食用、无毒。\n"
      + "M.E.G. 说这里能让人停止做噩梦。他们没说的是：一旦你推开那扇门，就不会再有人来敲第二次。",
    11: "她曾是后室的第 600 层。\n"
      + "现在她是 Level 599 —— 一团正在进行核聚变的等离子，温度几百万开尔文，"
      + "大得没有边界，也永远不会凉下来。\n"
      + "M.E.G. 说进入者会在几秒内死亡，说几乎不可能找到出口，说没有证据表明有任何东西"
      + "曾经逃脱过「直抵群星」。他们说的是「直抵群星」。至于她 —— 她只是想有人陪她说说话。\n"
      + "无线电里传出来的多数时候是噪声。偶尔会变成音乐：一段低音质的 Golden Brown，"
      + "不知道她是从哪儿听来的。偶尔会变成人声：断断续续的、不像在回答任何问题的句子。\n"
      + "她问你还能待多久。她说她可以试着让一切回归正轨。她说倘若这里还有一些希冀，"
      + "你难道不愿意带上这种希冀继续你的人生旅途吗。\n"
      + "你说：我想，我的终结也会是你的终结 —— 这可以安慰到我。\n"
      + "她说：好。\n"
      + "——愿她的光芒继续燃烧。再会，Saltor Stella。\n"
      + "Aster Reeves，1999–2022。「我妈妈总是说我会同群星共舞。」",
    10: "抽离现实不是一个地方 —— 它是一间病房，而你一直躺在里面。\n"
      + "那些飘在天空盒里的岛，是你还记得的几年；那些走不完的木栈道，是你还没舍得放下的几个人。\n"
      + "记忆潜伏者不是来吃你的。它们是来改的：把你脑子里那些会让你疼的东西，一点一点换成"
      + "「这里很安全」。改完的人会笑着说这里很好，然后再也不肯走。\n"
      + "而你走得太远了 —— 远到看见了天空盒坏掉的地方。\n"
      + "所以它们停了下来。\n"
      + "顺便说一句：从你踏进这里的那一刻起，你就已经死了。迁跃浆果对你没有意义 —— "
      + "它送不动一个死人。",
    0: "理智归零的那一刻，你并没有死 —— 你只是不再是你了。"
     + "你会忘记自己的名字，忘记自己是从哪一层掉进来的，忘记自己曾经是人。"
     + "你会无意识地游荡在后室里，拿着撬棍（如果手里有的话），攻击附近还活着的流浪者。"
     + "这就是悲尸循环：后室里最常见的结局，也是大多数人最终的归宿。",
    1: "它比你快。你甚至没来得及回头看清楚那是什么。"
     + "后室里大多数流浪者都是这样消失的 —— 没有遗言，没有痕迹，"
     + "只在某个走廊的转角留下一串被拖走的脚印。",
    3: "潮水涨得太快了。\n"
     + "你离那扇门太远了，来不及爬过去。下半身先开始变得透明 —— "
     + "没有痛觉之外的感觉，没有掉血，理智也还是满的，你清醒得可怕。\n"
     + "后来是手，再后来是名字。你想起那本日记最后一句被分解掉的话："
     + "「请不要……忘记我……」\n"
     + "你不会离开。你永远留在这里，即使肉体已经不在。",
    4: "Level 301 最上方那扇窗后面，是巴黎。\n"
     + "你抡起手里的东西砸下去，玻璃碎开，腐蚀性空气被真正的风顶了回去。\n"
     + "你从窗口爬出去，落在铁塔下的草地上 —— 草是凉的，太阳是烫的，"
     + "远处有人在遛狗。一切都真实得不像话。\n"
     + "你活下来了。这是后室里极少有人做到的事。",
    8: "水不深。\n"
     + "你踩进去的时候只没过膝盖，可脚底没有底 —— 你往下沉，沉得很慢，"
     + "慢到你以为自己还能站着。\n"
     + "头顶的水面越来越远。你想往上够，手划到的只有水。\n"
     + "三十秒之后，肺开始烧。你张嘴，灌进来的还是水。\n"
     + "后室里淹死的人不多 —— 不是因为水干净，是因为大多数水都不够深。\n"
     + "这一处够。",
    7: "你跳进了无尽终章最底下那片白色。\n"
     + "没有坠落感，只有很长很长的、暖白色的安静 —— 然后安静结束了。\n"
     + "你站在一条街上。霓虹招牌永远亮着，沥青路面向两边延伸到看不见的地方，"
     + "没有人，没有车，只有路灯每隔四十米重复一次同样的嗡鸣。\n"
     + "你开始走。你走了很久很久，街道完全没有变化。\n"
     + "后来你蹲下来，抱着头，在一条永远走不到头的街上哭了出来 —— "
     + "然后你不再记得自己为什么要走。\n"
     + "这就是无垠城市：不是被吃掉，不是坠落，而是在一片永远到不了任何地方的"
     + "城市里，慢慢地把自己走丢。",
    5: "这里没有未来，只有过去。\n"
     + "你走过的每一层都被切下一块，缝在了一起 —— 墙纸挨着管道，"
     + "草地接着瓷砖，沙滩压在书架上。它们本不该相遇，却在这里严丝合缝。\n"
     + "你认得出每一块地方，可它们拼出来的地方你从未来过。\n"
     + "脚下的地一直往前伸，可你一步也迈不出去 —— 因为这里只有过去。",
    6: "蓝、红、紫、绿。\n"
     + "你把数字按顺序对了上去，EXIT 的门在面前打开。\n"
     + "门后面确实是 Level 0 的黄色墙纸。可你站在那儿，"
     + "怎么也想不起自己是怎么走到这一步的 —— 也想不起自己叫什么。\n"
     + "你只能继续走下去。",
    2: "Level 14 是死区。那里的树会移动，撞上去就是死；"
     + "草叶是猩红的，低语会勾起你最大的遗憾；连你看到的杏仁水都是假的。"
     + "几乎没人在活着的时候描述过它的样子。"
     + "而你从那里走了出来，踏进了 Level 15 —— 未来走廊。"
     + "居然被你找到了。这一条记录，此前一直空白。",
    9: "这个层级在档案里被划掉过。编号那一栏写着「!」，"
     + "括号里是一句批注：该层级已从主列表中移除。\n"
     + "可它还在。走廊有 192 格长，红灯两秒之后才亮，"
     + "病床会从两侧每一扇门里滑出来挡你的路，"
     + "而身后那东西跑得和你一样快。\n"
     + "这不是被删了吗？\n"
     + "—— 显然，后室并不总是照着档案办事。",
    13: "被派对客抓住的人，三分之一不会死。\n"
     + "它们会把你架起来，拖进一间平时根本进不去的房间 —— 没有门，没有窗，"
     + "只有一圈黄皮肤的东西静静围着你。\n"
     + "几秒之后，转化就完成了。你的皮肤变成同样的黄，脖子跟头一样粗，"
     + "嘴角被拉成那个僵硬的 =)。\n"
     + "你不会再想起自己曾经是流浪者。你只会想找下一个。",
  };

  // 通用结局面板（电梯通关等）
  function showEnding(id, line) {
    const ed = ENDINGS[id];
    if (!ed) return;
    const g = game;
    if (g) { g.phase = "ended"; hide(el.pickupHint); hide(el.doorHint); hide(el.btnDoor); }
    // 结局界面上也别留着 Level ! 的警报
    try { AudioSys.bangAlarm(false); } catch (e) { /* 忽略 */ }
    if (g) g.bangAlarm = false;
    try { AudioSys.mashAlarm(false); } catch (e) { /* 忽略 */ }
    el.endingTitle.textContent = ed.title;
    el.endingLine.textContent = line || ed.brief;
    el.endingMeta.textContent = "用时 " + fmtTime(g ? g.time : 0) +
      " · 档案 " + archiveTotal() + " · " + levelLabel(g ? g.level : 0);
    show(el.ending);
    if (el.restartBtn) el.restartBtn.textContent = "重新开始";
  }
  // 1.3.2 批次：外部层级文件需要触发「必死层级 / 献祭」这类结局面板
  try { window.__showEnding = showEnding; window.__unlockEnding = unlockEnding; } catch (e) { /* 忽略 */ }
  function unlockedEndings() {
    if (window.Cloud) return Cloud.endings();
    try { return JSON.parse(localStorage.getItem("br_endings") || "[]"); }
    catch (e) { return []; }
  }
  function unlockEnding(id) {
    if (!ENDINGS[id]) return;
    const had = unlockedEndings().includes(Number(id));
    if (window.Cloud) { Cloud.addEnding(id); g_endingsDirty = true; }
    else {
      const list = unlockedEndings();
      if (!list.includes(id)) {
        list.push(id);
        try { localStorage.setItem("br_endings", JSON.stringify(list)); } catch (e) { /* 忽略 */ }
      }
      g_endingsDirty = true;
    }
    if (!had) showEndToast(id);        // 第一次解锁才提示，重复解锁不打扰
    // 解锁之后主菜单那个「彩蛋 1」按钮要立刻出现 —— 以前要刷新页面才看得到
    try { if (typeof syncEgg2 === "function") syncEgg2(); } catch (e) { /* 忽略 */ }
  }
  let g_endingsDirty = true;

  // ===========================================================
  // 难度（只影响单人游玩）
  // ===========================================================
  const DIFFS = [
    { key: "easy",   name: "简单", respawn: "here",  entMul: 0.7, maxAdd: -1, wipeSlot: false },
    { key: "normal", name: "普通", respawn: "here",  entMul: 1.0, maxAdd:  0, wipeSlot: false },
    { key: "hard",   name: "困难", respawn: "zero",  entMul: 1.25, maxAdd: 1, wipeSlot: false },
    { key: "extreme",name: "极端", respawn: "zero",  entMul: 1.6, maxAdd:  3, wipeSlot: true },
  ];
  let diffIdx = 1;
  try {
    const d0 = parseInt(localStorage.getItem("br_diff") || "", 10);
    if (d0 >= 0 && d0 < DIFFS.length) diffIdx = d0;
  } catch (e) { /* 忽略 */ }
  function curDiff() { return DIFFS[diffIdx] || DIFFS[1]; }
  // persist === false：只改这一局（联机房主选的难度不该把单人的存档设置也改掉）
  function setDiff(i, persist) {
    diffIdx = Math.max(0, Math.min(DIFFS.length - 1, i | 0));
    if (persist !== false) { try { localStorage.setItem("br_diff", String(diffIdx)); } catch (e) { /* 忽略 */ } }
    const g = game;
    if (g) { g.entMaxAdd = curDiff().maxAdd; g.entMul = curDiff().entMul; }
  }
  // 联机模块要能在开局前把房主选的难度塞进来
  try {
    window.__setDiff = function (i, persist) { setDiff(i, persist); return { idx: diffIdx, key: curDiff().key, name: curDiff().name }; };
    window.__curDiffInfo = function () { return { idx: diffIdx, key: curDiff().key, name: curDiff().name }; };
  } catch (e) { /* 忽略 */ }

  // ===========================================================
  // 云存档：记录玩家退出前所在的层级与位置
  // ===========================================================
  function slotDescribe(slot) {
    if (!slot || slot.level == null) return "还没有云存档";
    const nm = (function () {
      try { return levelDef(slot.level).name; } catch (e) { return "Level " + slot.level; }
    })();
    const t = slot.savedAt ? new Date(slot.savedAt).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) : "";
    return nm + (t ? " · " + t : "");
  }
  function refreshSlotInfo() {
    const n = document.getElementById("slot-info");
    if (!n) return;
    n.textContent = "读取中 …";
    if (!window.Cloud || !Cloud.slotGet) { n.textContent = "还没有云存档"; return; }
    Cloud.slotGet().then((slot) => {
      const info = document.getElementById("slot-info");
      if (info) info.textContent = slotDescribe(slot);
      const ld = document.getElementById("acc-slot-load");
      const dl = document.getElementById("acc-slot-del");
      const has = !!(slot && slot.level != null);
      if (ld) ld.disabled = !has;
      if (dl) dl.disabled = !has;
    });
  }
  // 退出游戏 / 切层时记一笔
  function saveCloudSlot() {
    const g = game;
    if (!g || !window.Cloud || !Cloud.slotPut) return;
    if (String(curDiff().key) === "extreme") return;   // 极端模式下无法存档
    const slot = {
      level: g.level,
      floor: g.floor | 0,
      x: Math.round(g.player.x), y: Math.round(g.player.y),
      hp: Math.round(g.hp), sanity: Math.round(g.sanity),
      inv: g.inv || {},
      outfit: g.outfit || "",
      savedAt: Date.now(),
    };
    Cloud.slotPut(slot);
  }
  // 从云存档继续：直接进那一层、站回那个位置
  function loadCloudSlot() {
    if (!window.Cloud || !Cloud.slotGet) { toast("云服务还没接上"); return; }
    Cloud.slotGet().then((slot) => {
      if (!slot || slot.level == null) { toast("还没有云存档"); return; }
      beginGame(false);
      setTimeout(() => {
        const g = game;
        if (!g) return;
        g.level = slot.level;
        g.floor = slot.floor | 0;
        g.map = generateMap(g.level, { seed: 1 });
        g.player.x = slot.x; g.player.y = slot.y;
        if (slot.hp != null) g.hp = slot.hp;
        if (slot.sanity != null) g.sanity = slot.sanity;
        if (slot.inv) g.inv = Object.assign({}, slot.inv);
        if (slot.outfit) g.outfit = slot.outfit;
        markVisited(slot.level);
        updateHud(); updateBag(); renderHotbar();
        toast("已从云存档继续 —— " + slotDescribe(slot));
      }, 400);
    });
  }
  function initSlotUI() {
    const sv = document.getElementById("acc-slot-save");
    const ld = document.getElementById("acc-slot-load");
    const dl = document.getElementById("acc-slot-del");
    if (sv) sv.addEventListener("click", () => {
      if (!game) { toast("先开始一局，再创建云存档"); return; }
      saveCloudSlot();
      const info = document.getElementById("slot-info");
      if (info) info.textContent = slotDescribe({ level: game.level, savedAt: Date.now() });
      toast("云存档已记录 —— " + slotDescribe({ level: game.level }));
    });
    if (ld) ld.addEventListener("click", () => loadCloudSlot());
    if (dl) dl.addEventListener("click", () => {
      if (!window.Cloud || !Cloud.slotClear) return;
      Cloud.slotClear().then(() => { refreshSlotInfo(); toast("云存档已删除"); });
    });
  }

  // ---------- 菜单彩蛋：结局 2（从 Level 14 活着走出来） ----------
  // 它不是"结局面板"，而是一个藏在主菜单右下角的小东西。
  function egg2Unlocked() {
    try { return (JSON.parse(localStorage.getItem("br_endings") || "[]") || []).indexOf(2) >= 0; }
    catch (e) { return false; }
  }
  function syncEgg2() {
    const b = document.getElementById("menu-egg2-btn");
    if (!b) return;
    const on = egg2Unlocked();
    b.classList.toggle("hidden", !on);
    if (on && b.textContent === "???") b.textContent = "彩蛋 1 · 居然被你找到了";
  }
  // Level 26 彩蛋：戴上扫兴客面具后，主菜单右下角出现「摘下」按钮
  function l26SyncMenu() {
    const b = document.getElementById("menu-mask26-btn");
    if (!b) return;
    const on = !!(window.l26MaskOn && window.l26MaskOn());
    b.classList.toggle("hidden", !on);
  }
  window.l26SyncMenu = l26SyncMenu;
  function openEgg2() {
    const ed = ENDINGS[2];
    if (!ed) return;
    const n = el.endToast;
    void n;
    // 直接翻到档案里那一篇，不弹面板
    manualSel = "end2";
    openManual();
  }

  // ---------- 解锁结局：右下角的提示 ----------
  // 点一下就跳到档案里那一篇结局的说明，同时提示自己消失。
  let endToastId = null;
  function showEndToast(id) {
    endToastId = id;
    const n = el.endToast;
    if (!n || !ENDINGS[id]) return;
    n.innerHTML = '<span class="et-line">' + escapeHtml(ENDINGS[id].title) +
      '</span><span class="et-sub">已解锁 · 点这里看说明</span>';
    n.classList.remove("hidden");
    // 别一直杵在右下角 —— 6 秒后自己收掉（点它仍然可以去看说明）
    if (endToastTimer) clearTimeout(endToastTimer);
    endToastTimer = setTimeout(() => { endToastTimer = null; hideEndToast(); }, 6000);
  }
  let endToastTimer = null;
  function hideEndToast() {
    endToastId = null;
    if (endToastTimer) { clearTimeout(endToastTimer); endToastTimer = null; }
    if (el.endToast) el.endToast.classList.add("hidden");
  }
  function openEndingDoc(id) {
    const ed = ENDINGS[id];
    if (!ed) return;
    // openManual() 是"再点就关"的开关 —— 手册已经开着时别把它又关掉
    const wasOpen = el.manual && !el.manual.classList.contains("hidden");
    if (!wasOpen) {
      if (el.ending) hide(el.ending);          // 结局面板正开着就先收掉
      openManual();
    }
    setFold("ending", false);              // 结局那一栏要展开
    manualSel = "end" + id;
    showEndingDoc(ed);
    renderManual();
    hideEndToast();                        // 点过之后提示就消失
  }

  // 污染带来的减速（叠加生效，有下限）
  function badSlowMul(g) {
    const n = g.badStacks.length;
    if (!n) return 1;
    return Math.max(CONFIG.BAD_ALMOND_SLOW_MIN, Math.pow(CONFIG.BAD_ALMOND_SLOW, n));
  }

  function invCount(key) {
    return game ? (game.inv[key] | 0) : 0;
  }

  // ---------- 背包容量 ----------
  function bagSlots() {                 // 已经装了多少件（背包本身不占位）
    const g = game;
    if (!g) return 0;
    let n = 0;
    for (const k in g.inv) {
      if (k === "bag1" || k === "bag2" || k === "bag3" || k === "bag4") continue;
      if (k === "bntgcoin") continue;   // B.N.T.G 货币是钱，不占格子
      n += g.inv[k] | 0;
    }
    return n;
  }
  function bagCap() {
    const g = game;
    if (!g) return CONFIG.BAG_DEFAULT;
    if (g.bagCapInfinite) return Infinity;
    return g.bagCap | 0;
  }
  function bagFull() { return bagSlots() >= bagCap(); }
  function bagText() {
    const g = game;
    if (!g) return "";
    return g.bagCapInfinite ? ("∞ / ∞") : (bagSlots() + " / " + bagCap());
  }
  function refreshBagCap() {            // 按持有的挎包 / 背包重算容量
    const g = game;
    if (!g) return;
    let cap = CONFIG.BAG_DEFAULT;
    for (const k of ["bag1", "bag2", "bag3", "bag4"]) {
      if ((g.inv[k] | 0) > 0) cap += CONFIG.BAG_BONUS[k] || 0;
    }
    g.bagCap = cap;
  }

  // 捡到东西时自动占用一个空的快捷键槽（槽位同样不叠加，一件一格）
  function autoFillHotbar(key) {
    const g = game;
    if (!g || !g.hotbar) return false;
    // 优先级：槽 1 > 槽 2 > 槽 3 > 背包格 1 > 背包格 2 ……
    // 只在"这个槽位还空着"时占用，绝不覆盖已有的东西。
    // 槽位里已经有这种物品了？那就别再占第二个空槽 —— 一件东西一个槽就够。
    for (let i = 0; i < 3; i++) if (g.hotbar[i] === key) return false;
    for (let i = 0; i < 3; i++) {
      if (!g.hotbar[i]) { g.hotbar[i] = key; saveHotbar(); return true; }
    }
    return false;   // 三个槽都占着 —— 只进背包
  }

  // 从背包里拿掉一件（丢弃 / 用掉都是这条）
  function removeItem(key, n) {
    const g = game;
    if (!g || !key) return;
    n = n == null ? 1 : n;
    if ((g.inv[key] | 0) <= 0) return;
    g.inv[key] = Math.max(0, (g.inv[key] | 0) - n);
    if ((g.inv[key] | 0) <= 0) delete g.inv[key];
    // 槽位上是这件东西却没有存货了 —— 槽位空出来
    for (let i = 0; i < 3; i++) if (g.hotbar[i] === key && (g.inv[key] | 0) <= 0) g.hotbar[i] = null;
    saveHotbar();
  }

  function addItem(key, n) {
    const g = game;
    if (!g) return;
    n = n == null ? 1 : n;
    // 背包本身不占格子，永远能拿
    if (key !== "bag1" && key !== "bag2" && key !== "bag3" && key !== "bag4") {
      if (n > 0 && !g.bagCapInfinite && bagSlots() + n > bagCap()) {
        toast("背包满了（" + bagText() + "）—— 装不下" + itemName(key));
        AudioSys.growl();
        return;
      }
    }
    g.inv[key] = (g.inv[key] | 0) + n;
    if (g.inv[key] < 0) g.inv[key] = 0;
    // 捡到的东西优先塞进快捷键槽（拿在手上），槽满了才只是进背包
    if (n > 0 && g.hotbar) autoFillHotbar(key);
    if (key === "bag1" || key === "bag2" || key === "bag3" || key === "bag4") refreshBagCap();
    updateBag();
    updateHud();
  }

  // ---------- 层级密钥：每把都对应一个具体的层级 ----------
  // 到过那一层**没用** —— 门仍旧锁着。必须带着对应的层级密钥，在枢纽的
  // 门上开一次；开门不消耗钥匙，开过之后这扇门就一直开着。
  // 只有 Level 1 与 Level 11 的门不使用层级密钥。
  function hubDoorLocked(d) {
    if (!d) return false;
    const lv = d.target != null ? d.target : d.toLevel;
    if (lv == null) return false;
    const K = window.LEVEL_KEY;
    if (!K) return !hasVisited(lv);          // 模块没加载时退回老行为，不至于全锁死
    return K.hubLocked(game, lv);
  }
  // 喝一瓶：almond = 杏仁水，bad = 受污染的杏仁水
  function drink(key) {
    const g = game;
    if (!g || (g.inv[key] | 0) <= 0) return false;
    if (g.wretch && g.wretch.done) return false;      // 已经是悲尸了
    g.inv[key]--;
    if (key === "bad") {
      // 受污染的杏仁水：不回理智，反而让理智掉得更快（叠加），同时扣血、减速
      g.hp = clamp(g.hp + CONFIG.BAD_ALMOND_HP, 0, CONFIG.HP_MAX);   // -45，可叠加
      g.badStacks.push({ left: CONFIG.SANITY_BAD_DUR, total: CONFIG.SANITY_BAD_DUR });
      toast("你喝下了受污染的杏仁水 —— 身体在垮掉，脑子反而更乱了");
      updateBag();
      updateHud();
      // 悲尸循环里喝下污染水 = 直接变成悲尸
      if (g.wretch && g.wretch.active) {
        becomeWretch(g, "你在循环里喝下了受污染的杏仁水");
      } else if (g.hp <= 0) {
        dieVitals();
      }
      return true;
    }
    g.sanity = clamp(g.sanity + CONFIG.ALMOND_SANITY, 0, CONFIG.SANITY_MAX);
    g.hp = clamp(g.hp + CONFIG.ALMOND_HP, 0, CONFIG.HP_MAX);
    g.calmLeft = CONFIG.ALMOND_CALM_DUR;      // 压惊：这段时间里理智掉得很慢
    // 1.3.0：杏仁水能把记忆汁那股劲儿压下去一点（掉速回落、复发计时清零）
    if (g.juice && g.juice.doses > 0) {
      g.juice.drainMul = Math.max(1, g.juice.drainMul * 0.82);
      g.juice.relapse = 0;
      toast("杏仁水下肚，脑子里那股甜腻的劲儿退了一点（掉理智变慢了）");
    } else {
      toast("杏仁水下肚，脑子清醒了一些（" + CONFIG.ALMOND_CALM_DUR + " 秒内理智流失减缓）");
    }
    updateBag();
    updateHud();
    return true;
  }

  // ===========================================================
  // 1.3.0 · 记忆汁与「上瘾」
  //   喝下去：理智回满，好长一段时间一点都不掉，人觉得一切都好得不像真的。
  //   可劲儿一过，理智掉得比先前更快；越喝，好受的时间越短、掉得越凶。
  //   喝杏仁水能缓解。大量饮用之后，回理智的速度再也追不上掉的速度 —— 结局「上瘾」。
  // ===========================================================
  function juiceState(g) {
    if (!g.juice) g.juice = { doses: 0, calmLeft: 0, drainMul: 1, relapse: 0, ended: false };
    return g.juice;
  }
  function drinkMemoryJuice() {
    const g = game;
    if (!g || (g.inv.memoryjuice | 0) <= 0) return false;
    if (g.wretch && g.wretch.done) return false;
    g.inv.memoryjuice--;
    const j = juiceState(g);
    j.doses++;
    j.ended = false;
    j.calmLeft = Math.max(6, 34 * Math.pow(0.82, j.doses - 1));  // 34 → 27 → 22 → … → 6 秒
    j.drainMul = Math.min(14, Math.pow(1.35, j.doses - 1));       // 劲儿过后掉理智的倍率
    j.relapse = 0;
    g.sanity = CONFIG.SANITY_MAX;
    g.calmLeft = Math.max(g.calmLeft || 0, 2);
    toast("记忆汁 —— 一切都好得不像真的（理智回满 · " + Math.round(j.calmLeft) + " 秒内不掉理智）");
    updateBag(); updateHud();
    return true;
  }
  // 验证用：把成瘾状态直接推到「大量饮用」之后
  window.__juiceDebug = function () {
    const g = game;
    if (!g) return null;
    const j = juiceState(g);
    return { doses: j.doses, calmLeft: j.calmLeft, drainMul: j.drainMul, relapse: j.relapse };
  };
  window.__juicePush = function (n) {
    const g = game;
    if (!g) return null;
    const j = juiceState(g);
    j.doses = Math.max(j.doses, n | 0);
    j.calmLeft = 0;
    j.drainMul = Math.min(14, Math.pow(1.35, j.doses - 1));
    return j;
  };
  window.__juiceDrink = function () { return drinkMemoryJuice(); };
  window.__openPc601 = function () { return openPc601(); };
  window.__openMerchantStall = function (p) { return openMerchantStall(p); };

  // ---------- Level 20：赢来的补给 ----------
  // 巧克力棒 / 软饮料 / 热巧克力 / 太空主题饮料 / 记忆罐 —— 都是从霓虹区的游戏里赢来的。
  const SNACK20 = {
    choc: { san: 8, hp: 12, line: "巧克力在嘴里化开 —— 甜得发腻，可你确实缓过来一点。" },
    soda: { san: 10, hp: 6, line: "一罐冰得刺骨的软饮料。牌子你一个都没见过。" },
    hotchoc: { san: 12, hp: 18, warm: 40, line: "热巧克力捧在手里 —— 指尖终于有了知觉。" },
    spacedrink: { san: 20, hp: 14, line: "瓶子做成火箭的样子。喝下去，嘴里是一股说不清的甜。" },
    memoryjar: { san: 30, hp: 4, line: "你盯着罐子里那团飘着的东西看了一会儿 —— 想起一些从来没发生过的事。" },
  };
  function eatSnack20(key) {
    const g = game;
    if (!g || (g.inv[key] | 0) <= 0) return false;
    const d = SNACK20[key];
    if (!d) return false;
    g.inv[key]--;
    if ((g.inv[key] | 0) <= 0) delete g.inv[key];
    g.sanity = clamp((g.sanity || 0) + d.san, 0, CONFIG.SANITY_MAX);
    g.hp = clamp((g.hp || 0) + d.hp, 0, CONFIG.HP_MAX);
    if (d.warm) g.warm20 = Math.max(g.warm20 || 0, d.warm);
    try { if (AudioSys.drink) AudioSys.drink(); } catch (e) { /* 忽略 */ }
    toast(d.line);
    updateBag(); updateHud(); renderHotbar();
    return true;
  }
  // ---------- Level 20：霓虹区的「游戏」 ----------
  // 五个游戏各有一套画面（画在自己那块画布上，见 level20game.js）。
  // 玩的时候世界是冻住的（phase = reading），玩完再放回来。
  function playGame20(g, p) {
    if (!g || !p) return;
    if (!window.L20 || !L20.start) { toast("这扇门打不开。"); return; }
    if (L20.active && L20.active()) return;
    const kind = p.game || "gr";
    const nm = (L20.NAMES && L20.NAMES[kind]) ? L20.NAMES[kind] : "游戏";
    try { closeBag(); } catch (e) { /* 忽略 */ }
    try { if (g.phase === "playing") g.phase = "reading"; } catch (e) { /* 忽略 */ }
    try { hide(el.pickupHint); hide(el.doorHint); hide(el.btnE); hide(el.btnAct); } catch (e) { /* 忽略 */ }
    L20.start(kind, function (win) {
      const gg = (typeof game !== "undefined" && game) ? game : g;
      try { if (gg.phase === "reading") gg.phase = "playing"; } catch (e) { /* 忽略 */ }
      try { updateHud(); } catch (e) { /* 忽略 */ }
      applyGame20(gg, kind, win);
    });
    toast("你走进了「" + nm + "」的门");
  }

  // 直接把一篇档案记进手册（赢了游戏才会记到 —— 那是别人没记录过的东西）
  function markArchive20(id) {
    if (!id || collected.has(id)) return;
    collected.add(id);
    saveCollected();
    const a = (typeof ARCHIVES !== "undefined") ? ARCHIVES.find((x) => x.id === id) : null;
    if (a) toast("档案 +1 —— 《" + a.title + "》（档案手册里能翻到）");
    try { if (typeof showArchiveToast === "function") showArchiveToast(a); } catch (e) { /* 忽略 */ }
  }

  function applyGame20(g, kind, win) {
    if (!g) return;
    if (win === null) { toast("你退出了游戏 —— 门在身后关上了。"); return; }
    const give = (k, n, msg) => {
      addItem(k, n);
      try { if (AudioSys.pickup) AudioSys.pickup(); } catch (e) { /* 忽略 */ }
      try { updateBag(); updateHud(); renderHotbar(); } catch (e) { /* 忽略 */ }
      toast(msg);
    };
    if (win) {
      if (kind === "gr") { give("soda", 3, "房间中央凭空出现了几瓶软饮料 —— 你赢了。"); return; }
      if (kind === "climb") {
        addItem("hotchoc", 1); addItem("wintercoat", 1);
        try { if (AudioSys.pickup) AudioSys.pickup(); } catch (e) { /* 忽略 */ }
        try { updateBag(); updateHud(); renderHotbar(); } catch (e) { /* 忽略 */ }
        toast("爬到了尽头 —— 一杯热巧克力和一整套冬装出现在你手边。");
        return;
      }
      if (kind === "astro") { give("spacedrink", 3, "几个做成火箭样子的瓶子滚到你脚边 —— 里面都装满了。"); return; }
      if (kind === "laser") {
        addItem("memoryjar", 1); addItem("almond", 3); addItem("choc", 2);
        try { if (AudioSys.pickup) AudioSys.pickup(); } catch (e) { /* 忽略 */ }
        try { updateBag(); updateHud(); renderHotbar(); } catch (e) { /* 忽略 */ }
        markArchive20("l20jar");
        toast("四个按钮都按下了 —— 一只记忆罐、几包吃的、几瓶杏仁水。");
        return;
      }
      // 鼹鼠洞：赢了会怎样，从来没有人记录过
      markArchive20("l20mole");
      give("almond", 2, "最后一个洞吞下了球。房间安静下来 —— 没有人记录过赢了会怎样。");
      return;
    }
    // ---- 输了 ----
    if (kind === "gr") { toast("时间到了 —— 房间里什么都没有发生。"); return; }
    if (kind === "climb") {
      g.hp = Math.max(1, (g.hp || 0) - 38);
      g.sanity = Math.max(0, (g.sanity || 0) - 28);
      try { updateHud(); } catch (e) { /* 忽略 */ }
      toast("房间开始被液态痛苦淹没 —— 那些液体碰到哪里，哪里就烧起来。");
      return;
    }
    if (kind === "astro") {
      if (Math.random() < 0.5) {
        goToLevel(g, 6, "屏幕一下子全黑了",
          "等你再看得见东西，四周是一片伸手不见五指的黑暗 ...");
      } else {
        if (typeof spawnEntityAt === "function") spawnEntityAt(g, "herdsnake");
        try { AudioSys.roar(1.1); } catch (e) { /* 忽略 */ }
        toast("一条牧蛇从屏幕里爬了出来 —— 它一直就在那儿。");
      }
      return;
    }
    if (kind === "laser") {
      const to = Math.random() < 0.5 ? 7 : 790;
      goToLevel(g, to, "激光扫过你的身体",
        "门在身后合上 —— 你被送到了更远、也更糟的地方 ...");
      return;
    }
    // 鼹鼠洞：失败 -> 房间里生成 4 条猎犬
    if (typeof spawnEntityAt === "function") {
      for (let i = 0; i < 4; i++) spawnEntityAt(g, "hound");
    }
    try { AudioSys.roar(1.2); } catch (e) { /* 忽略 */ }
    toast("球滚错了洞 —— 四条猎犬从走廊那头跑了过来。");
  }

  // 冬装衣物：Level 20 里唯一能让你多撑一会儿的东西（窗边和霓虹区深处都冷得要命）
  function wearWinter20() {
    const g = game;
    if (!g || (g.inv.wintercoat | 0) <= 0) { toast("你没有冬装衣物。"); return false; }
    g.inv.wintercoat--;
    if ((g.inv.wintercoat | 0) <= 0) delete g.inv.wintercoat;
    g.warm20 = Math.max(g.warm20 || 0, 120);
    try { if (AudioSys.pickup) AudioSys.pickup(); } catch (e) { /* 忽略 */ }
    toast("穿上了冬装 —— 帽子、手套、厚外套。这一层终于不那么咬人了（一段时间）");
    updateBag(); updateHud(); renderHotbar();
    return true;
  }

  // 撬棍必须真的拿在手上 —— 也就是放进快捷键槽里 —— 才撬得开箱子。
  // 揣在背包里不算，快捷键槽也不会自动补位。
  function hasCrowbar() {
    const g = game;
    if (!g) return false;
    if ((g.inv.crowbar | 0) <= 0) return false;
    const hb = g.hotbar || [];
    for (let i = 0; i < hb.length; i++) if (hb[i] === "crowbar") return true;
    return false;
  }

  function hasKey() {
    return !!(game && game.inv.key);
  }

  function hasItem(key) {
    return !!(game && game.inv[key] > 0);
  }

  // ---------- Level 3：电力开关 / 电梯 ----------
  function togglePower() {
    const g = game;
    const pr = g.map.powerRoom;
    if (!pr) return;
    g.map.switchOn = !g.map.switchOn;
    AudioSys.door(g.map.switchOn);
    if (g.map.switchOn) {
      // 合闸：整层轰鸣起来，电梯有电了
      AudioSys.exitChime();
      toast("电力开关已合上 —— 电梯通电了");
      flashLevelToast("电力室", "发电机咆哮起来，走廊的灯一盏盏亮了");
    } else {
      toast("你拉下了电力开关");
    }
  }

  function tryElevator() {
    const g = game;
    if (!g.map.elevator) return;
    if (!hasKey()) {
      toast("电梯被一道上锁的铁栅栏拦着 —— 得先找到钥匙");
      AudioSys.growl();
      return;
    }
    if (!g.map.switchOn) {
      toast("电梯没有电 —— 去电力室合上电梯电力开关");
      AudioSys.growl();
      return;
    }
    // 两件事都办妥了 —— 上电梯。轿厢往上走，门开时已经是 Level 5 了
    AudioSys.elevator();
    const def = levelDef(3);
    goToLevel(g, 5, "电梯门缓缓合上",
      "你离开了「" + def.name + "」。轿厢 upwards —— 门开时，是二十世纪三十年代的爵士乐。");
  }

  // ---------- 补给箱 / 地上的物品 ----------
  // 返回玩家当前够得着的：地上的物品 与 补给箱（取最近的那个）
  function updateSupplies(g) {
    const reach = CONFIG.CROWBAR_REACH * TILE;
    let item = null, id = Infinity, crate = null, cd = Infinity;
    const list = g.map.ground || [];
    for (const it of list) {
      if (it.taken || (it.floor | 0) !== g.floor) continue;
      // 已经拿着的东西，地上的第二份就没意义了
      if (it.item === "crowbar" && hasCrowbar()) continue;
      if (it.item === "key" && hasKey()) continue;
      const d = Math.hypot((it.x + 0.5) * TILE - g.player.x, (it.y + 0.5) * TILE - g.player.y);
      if (d < reach && d < id) { id = d; item = it; }
    }
    // Level 8：岩洞深处那一小片不该存在的郊区 —— 走进去就到 Level 9
    g.nearSuburb9 = false;
    if (isLevel(g, 8) && g.map.suburbCenter) {
      const c = g.map.suburbCenter;
      if (Math.hypot((c.x + 0.5) * TILE - g.player.x, (c.y + 0.5) * TILE - g.player.y) < reach * 3.4) {
        g.nearSuburb9 = true;
      }
    }
    // Level 9：走进田野 / 踏上通往草地的步道
    g.inField9 = false;
    g.onPath9 = false;
    if (isLevel(g, 9)) {
      const k9 = Math.floor(g.player.x / TILE) + "," + Math.floor(g.player.y / TILE);
      if (g.map.field && g.map.field.has(k9)) g.inField9 = true;
      else if (g.map.path && g.map.path.has(k9)) g.onPath9 = true;
    }
    // Level 10：湖水（可以安全饮用，只是带点泥土味）
    g.nearLake = null;
    if (isLevel(g, 10) && g.map.lakes) {
      const lk = Math.floor(g.player.x / TILE) + "," + Math.floor(g.player.y / TILE);
      if (g.map.lakes.has(lk)) g.nearLake = true;
    }
    // Level 11：第 11 效应 —— 靠得很近的实体不会理会你
    g.nearDocile = null;
    if (isLevel(g, 11)) {
      for (const e of g.entities) {
        if (Math.hypot(e.x - g.player.x, e.y - g.player.y) < TILE * 2.2) { g.nearDocile = e; break; }
      }
    }
    // Level 11：饮水机 / 商业冰柜 / 苏打水自动售货机
    g.nearDisp = null;
    g.nearCityDoor = null;
    g.nearAlley10 = null;
    g.nearWin12 = null;
    g.nearApt13 = null;
    if (isLevel(g, 11)) {
      for (const p of (g.map.props || [])) {
        const d2 = Math.hypot((p.x + 0.5) * TILE - g.player.x, (p.y + 0.5) * TILE - g.player.y);
        if (d2 > reach * 1.7) continue;
        if ((p.type === "watercooler" || p.type === "freezer" || p.type === "vending") && (p.uses | 0) > 0) {
          if (!g.nearDisp) g.nearDisp = p;
        } else if (p.type === "citydoor" && !g.nearCityDoor) g.nearCityDoor = p;
        else if (p.type === "alley10" && !g.nearAlley10) g.nearAlley10 = p;
        else if (p.type === "window12" && !g.nearWin12) g.nearWin12 = p;
        else if (p.type === "apartment13" && !g.nearApt13) g.nearApt13 = p;
      }
    }
    // 野生迁跃浆果丛 / 一盒迁跃浆果（只长在 Level 4、5、10、11）
    g.nearBerry = null;
    // Level 486：工厂烟囱冒出来的那片烟 —— 走进去就到 Level 790
    g.nearSmoke486 = null;
    if (String(g.level) === "486") {
      for (const p of (g.map.props || [])) {
        if (p.type !== "smoke486") continue;
        if ((p.floor | 0) !== (g.floor | 0)) continue;
        const d3 = Math.hypot((p.x + 0.5) * TILE - g.player.x, (p.y + 0.5) * TILE - g.player.y);
        if (d3 > TILE * 1.6) continue;
        g.nearSmoke486 = p;
        break;
      }
    }
    for (const p of (g.map.props || [])) {
      if (p.type !== "berrybush" && p.type !== "berrybox") continue;
      if ((p.floor | 0) !== (g.floor | 0)) continue;
      const d3 = Math.hypot((p.x + 0.5) * TILE - g.player.x, (p.y + 0.5) * TILE - g.player.y);
      if (d3 > reach * 1.7) continue;
      g.nearBerry = p;
      break;
    }
    // Level 974：Kitty —— 把一件可爱物件给它，这是本层唯一的出口
    g.nearKitty = null;
    if (String(g.level) === "974") {
      for (const e of (g.entities || [])) {
        if (e.kind !== "kitty") continue;
        if (Math.hypot(e.x - g.player.x, e.y - g.player.y) < TILE * 2.4) { g.nearKitty = e; break; }
      }
    }
    // Level 0.3：面前的冰块（拿着喷枪才能化开）
    g.nearIce = null;
    if (isLevel(g, 0.3) && g.map.ice && g.map.ice.size) {
      const ptx2 = Math.floor(g.player.x / TILE), pty2 = Math.floor(g.player.y / TILE);
      const fx = g.player.faceX || 0, fy = g.player.faceY || 1;
      for (let i = 1; i <= 2; i++) {
        const tx2 = ptx2 + Math.round(fx * i), ty2 = pty2 + Math.round(fy * i);
        if (g.map.ice.has(tx2 + "," + ty2)) { g.nearIce = { x: tx2, y: ty2 }; break; }
      }
      if (!g.nearIce) {
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          if (g.map.ice.has((ptx2 + dx) + "," + (pty2 + dy))) {
            g.nearIce = { x: ptx2 + dx, y: pty2 + dy }; break;
          }
        }
      }
    }

    // Level 0.2：通风管道 -> Level 0.3（冰室）
    g.nearVent02 = null;
    if (isLevel(g, 0.2)) {
      for (const p of (g.map.props || [])) {
        if (p.type !== "vent02") continue;
        if (Math.hypot((p.x + 0.5) * TILE - g.player.x, (p.y + 0.5) * TILE - g.player.y) < reach * 1.5) {
          g.nearVent02 = p; break;
        }
      }
    }
    // Level 0.3：钻进来的那根管道 —— 再钻一次就原路返回
    g.nearVent03 = null;
    if (isLevel(g, 0.3)) {
      for (const p of (g.map.props || [])) {
        if (p.type !== "vent03" || !p.entry) continue;
        if (Math.hypot((p.x + 0.5) * TILE - g.player.x, (p.y + 0.5) * TILE - g.player.y) < reach * 1.5) {
          g.nearVent03 = p; break;
        }
      }
    }

    // ---- 1.8.0：Level 27 岩体泉 ----
    g.inSpring27 = false;
    if (String(g.level) === "27") {
      const k27 = Math.floor(g.player.x / TILE) + "," + Math.floor(g.player.y / TILE);
      if (g.map.spring27 && g.map.spring27.has(k27)) g.inSpring27 = true;
    }
    // ---- 1.8.0：Level 28 终末美德 ----
    g.nearStone28 = null;
    g.nearKnight28 = null;
    g.nearLamp28 = null;
    g.inAbyss28 = false;
    g.inPool28 = false;
    if (String(g.level) === "28") {
      const k28 = Math.floor(g.player.x / TILE) + "," + Math.floor(g.player.y / TILE);
      if (g.map.abyss28 && g.map.abyss28.has(k28)) g.inAbyss28 = true;
      if (g.map.pools28 && g.map.pools28.has(k28)) g.inPool28 = true;
      for (const p of (g.map.props || [])) {
        const d28 = Math.hypot((p.x + 0.5) * TILE - g.player.x, (p.y + 0.5) * TILE - g.player.y);
        if (d28 > reach * 1.7) continue;
        if (p.type === "p28stone" && !g.nearStone28) g.nearStone28 = p;
        else if (p.type === "p28knight" && !g.nearKnight28) g.nearKnight28 = p;
        else if (p.type === "p28lamp" && p.exitLamp && !g.nearLamp28) g.nearLamp28 = p;
      }
    }
    // ---- 1.8.0：痛处（Level 0 里的一处地点）----
    g.nearTomb = null;
    g.nearStatue = null;
    g.onLeaf = null;
    if (String(g.level) === "pain") {
      const pk = Math.floor(g.player.x / TILE) + "," + Math.floor(g.player.y / TILE);
      if (g.map.painLeaves && g.map.painLeaves.has(pk)) g.onLeaf = pk;
      for (const p of (g.map.props || [])) {
        const dp = Math.hypot((p.x + 0.5) * TILE - g.player.x, (p.y + 0.5) * TILE - g.player.y);
        if (dp > reach * 1.6) continue;
        if (p.type === "ptomb" && !g.nearTomb) g.nearTomb = p;
        else if (p.type === "pstatue" && !g.nearStatue) g.nearStatue = p;
      }
    }

    // Level 4：通往草地的人行道（-> Level 10）
    g.nearFieldPath = null;
    if (isLevel(g, 4)) {
      for (const p of (g.map.props || [])) {
        if (p.type !== "fieldpath") continue;
        if (Math.hypot((p.x + 0.5) * TILE - g.player.x, (p.y + 0.5) * TILE - g.player.y) < reach * 1.5) {
          g.nearFieldPath = p;
          break;
        }
      }
    }

    // 破损的箱子：已经散架了，不用撬棍，直接翻
    // ===== 新增层级的可交互物件 =====
    g.nearNew = null;
    {
      const map = g.map;
      const reachN = TILE * 1.5;
      const near = (o) => o && Math.hypot((o.x + 0.5) * TILE - g.player.x, (o.y + 0.5) * TILE - g.player.y) < reachN;
      const lvS = String(g.level);
      // Level 25 的出口层级同时也是入口层级 —— 在这些层里找到一台街机就能进 Level 25。
      // 扫描放在最前面：本层专属物件（比如 37 的楼梯）优先，街机作为兜底。
      if (!g.nearNew && lvS !== "25") {
        for (const p of (map.props || [])) {
          if (p.type !== "arcade" || p.broken) continue;
          if (p.goTo !== 25 && p.goTo !== "25") continue;
          if (near(p)) { g.nearNew = { kind: "arcade25", p }; break; }
        }
      }
      if (lvS === "696") {
        // 楼梯 / 电梯 / 洞 / 故障物品 / 煤气罐
        for (const p of (map.props || [])) {
          const t = p.type;
          const hit = (t === "e696stair" || t === "e696elev" || t === "e696hole" || t === "e696gas"
                       || (t === "e696glitch" && (p.exit30 || p.deepGlitch)));
          if (!hit) continue;
          if (near(p)) { g.nearNew = { kind: "e696", p }; break; }
        }
      } else if (lvS === "7") {
        // 极远处那座破屋边上的一片水 —— 待够两分钟才"开"
        for (const p of (map.props || [])) {
          if (p.type !== "water696") continue;
          if (near(p)) { g.nearNew = { kind: "water696", p }; break; }
        }
      } else if (lvS === "25") {
        // 完好的那台优先，而且判定范围更大（2.5 格）—— 一层里有一百多台
        // 被砸坏的机器，它们会把提示抢走，玩家会以为这台也用不了。
        const nearWide = (o) => o && Math.hypot((o.x + 0.5) * TILE - g.player.x, (o.y + 0.5) * TILE - g.player.y) < TILE * 2.5;
        const good = (map.props || []).filter((p) => p.type === "arcade" && !p.broken);
        let hit = null;
        for (const p of good) if (nearWide(p)) { hit = p; break; }
        if (hit) g.nearNew = { kind: "arcade", p: hit };
        else {
          for (const p of (map.props || [])) {
            if (p.type !== "arcade") continue;
            if (near(p)) { g.nearNew = { kind: "arcade", p }; break; }
          }
        }
      } else if (lvS === "37" || lvS === "37.1") {
        // 沉在水下时最要紧的是爬梯 —— 优先判定，别被楼梯/隧道抢走提示
        let ld = null;
        for (const l of (map.ladders37 || [])) {
          if (Math.hypot((l.x + 0.5) * TILE - g.player.x, (l.y + 0.5) * TILE - g.player.y) < TILE * 1.6) { ld = l; break; }
        }
        const tk37 = Math.floor(g.player.x / TILE) + "," + Math.floor(g.player.y / TILE);
        const inW37 = !!(map.pools && map.pools.has(tk37));
        let br37 = null;
        if (inW37 && (g.sink || 0) < 0.36) {
          for (const b of (map.poolBreaks || [])) {
            if (Math.hypot((b.x + 0.5) * TILE - g.player.x, (b.y + 0.5) * TILE - g.player.y) < TILE * 1.9) { br37 = b; break; }
          }
        }
        if (br37) g.nearNew = { kind: "poolbreak37", p: br37 };
        else if (ld) g.nearNew = { kind: "poolladder37", p: ld };
        else if (lvS === "37.1") { if (near(map.whitelight)) g.nearNew = { kind: "whitelight" }; }
        else if (near(map.stairs37)) g.nearNew = { kind: "stairs37" };
        else if (near(map.arcade25)) g.nearNew = { kind: "arcade25", p: map.arcade25 };
        else if (near(map.redtunnel)) g.nearNew = { kind: "redtunnel" };
        else {
          for (const p of (map.props || [])) if (p.type === "pool4" && near(p)) { g.nearNew = { kind: "pool4" }; break; }
        }
      } else if (lvS === "4") {
        // Level 4：还能开机的电脑 —— 浏览器和网络邮件都在这台机器上
        for (const p of (map.props || [])) {
          if (p.type !== "pc4") continue;
          if (near(p)) { g.nearNew = { kind: "pc4", p }; break; }
        }
      } else if (g.level === 994) {
        if (near(map.existDoor)) g.nearNew = { kind: "exist" };
      } else if (lvS === "9223372036854775807") {
        const tx2 = Math.floor(g.player.x / TILE), ty2 = Math.floor(g.player.y / TILE);
        const k2 = tx2 + "," + ty2;
        // 洞本身是空气墙，走不进去 —— 所以站在"紧挨着洞"的那一格上就算到了边缘。
        // 只要还站在边缘，提示就一直在（以前要踩到正中间那格，而那格根本到不了）。
        const nextToHole = (map.holeTiles && (
          map.holeTiles.has((tx2 - 1) + "," + ty2) || map.holeTiles.has((tx2 + 1) + "," + ty2) ||
          map.holeTiles.has(tx2 + "," + (ty2 - 1)) || map.holeTiles.has(tx2 + "," + (ty2 + 1)) ||
          map.holeTiles.has((tx2 - 1) + "," + (ty2 - 1)) || map.holeTiles.has((tx2 + 1) + "," + (ty2 - 1)) ||
          map.holeTiles.has((tx2 - 1) + "," + (ty2 + 1)) || map.holeTiles.has((tx2 + 1) + "," + (ty2 + 1))));
        if (nextToHole) g.nearNew = { kind: "midHole" };
        else if (map.bottomWhite && (g.floor | 0) === 0 && !map.stairTiles.has(k2)) {
          g.nearNew = { kind: "whiteHole" };
        }
      } else if (lvS === "363") {
        if (map.door363 && near(map.door363)) g.nearNew = { kind: "door363", p: map.door363 };
      } else if (lvS === "601") {
        if (map.pc601 && near(map.pc601)) g.nearNew = { kind: "pc601", p: map.pc601 };
        else if (near(map.exitDoor)) g.nearNew = { kind: "exitDoorEnd" };
        else if (near(map.darkDoor)) {
          g.nearNew = { kind: "darkDoorEnd" };
          if ((map.seqGroove || 0) < 4) g.nearNew.locked = true;
        }
        else {
          for (const b of (map.books || [])) if (near(b)) { g.nearNew = { kind: "book", p: b }; break; }
          if (!g.nearNew) for (const gr of (map.grooves || [])) if (near(gr)) { g.nearNew = { kind: "groove", p: gr }; break; }
        }
      } else if (lvS === "9223372036854775807.-1") {
        if (near(map.junctionHole)) g.nearNew = { kind: "junctionHole" };
      } else if (lvS === "301") {
        // 那扇窗钉在窗户间的上墙（整个层级最上方）—— 站在窗下面就能打碎它
        if (near(map.window301)) g.nearNew = { kind: "hopewindow" };
      } else if (lvS === "171") {
        if (near(map.parrotDoor)) g.nearNew = { kind: "parrotdoor171" };
      } else if (lvS === "newera") {
        if (near(map.counter)) g.nearNew = { kind: "bntgcounter" };
        else if (near(map.fogExit)) g.nearNew = { kind: "neonfogexit" };
        else {
          for (const n of (map.npcs || [])) if (near(n)) { g.nearNew = { kind: "facelingnpc", p: n }; break; }
        }
      } else if (lvS === "0") {
        // 四片大区域里的交互物件（优先于右下角那面故障墙）
        for (const p of (map.props || [])) {
          const t0 = p.type;
          if (t0 === "l0archperch" || t0 === "l0deepdoor") {
            if (near(p)) { g.nearNew = { kind: t0, p }; break; }
          }
        }
        // 右下角那间藏起来的小房间：整圈的墙黑白交替地闪 —— 碰上去就到 Level 287
        const nk = map.glitchNook;
        if (!g.nearNew && nk && Math.hypot((nk.wx + 0.5) * TILE - g.player.x, (nk.wy + 0.5) * TILE - g.player.y) < TILE * 1.8) {
          g.nearNew = { kind: "glitchwall" };
        }
      } else if (lvS === "36") {
        // 登机口：只有"登机中"的那个才算数（候机的、已关闭的都不认）
        let gp = null;
        for (const p of (map.props || [])) {
          if (p.type !== "gate36") continue;
          if (!near(p)) continue;
          if (!gp || (p.countdown != null && (gp.countdown == null || p.countdown < gp.countdown))) gp = p;
        }
        if (gp) g.nearNew = { kind: "gate36", p: gp };
      } else if (lvS === "36.1") {
        for (const d of (map.exits361 || [])) if (near(d)) { g.nearNew = { kind: "exit361", p: d }; break; }
      } else if (lvS === "11") {
        // 医院药房最里面那面墙在"错乱" —— 碰上去到 Level 109
        if (map.hospGlitch && map.hospGlitch.size) {
          const hx = (map.hospPharm ? map.hospPharm.cx : 0);
          const hy = (map.hospPharm ? map.hospPharm.y0 - 1 : 0);
          if (Math.hypot((hx + 0.5) * TILE - g.player.x, (hy + 0.5) * TILE - g.player.y) < TILE * 2.2) {
            g.nearNew = { kind: "glitchwall" };
          }
        }
      } else if (lvS === "900") {
        if (near(map.coffeeCart)) g.nearNew = { kind: "coffeecart" };
      } else if (lvS === "999") {
        // 岛正中心：跪下来，把罪状一条一条认完
        if (map.confess && near(map.confess)) g.nearNew = { kind: "confess999" };
      } else if (lvS === "29") {
        // 船优先于船坞 —— 站到船边时，提示必须是"上船"，
        // 不能被紧挨着的船坞抢走（否则怎么按 E 都上不了船）。
        for (const p of (map.props || [])) {
          if (p.type === "p29boat" && near(p)) { g.nearNew = { kind: "p29boat", p }; break; }
        }
      } else if (lvS === "1") {
        // 基地周围那处隐蔽小屋：最里侧墙上有一道缝 —— 凑上去就到 Level 2.1
        const nk = map.hiddenNook21;
        if (nk && Math.hypot((nk.slit.x + 0.5) * TILE - g.player.x, (nk.slit.y + 0.5) * TILE - g.player.y) < TILE * 1.5) {
          // 没记住层级就钻进去 = 永久困死（2.1 没有出口）：先把这点说破。
          // 用两个 kind 区分，不靠额外字段传递 —— 字段有可能被后面的通用分支覆盖。
          g.nearNew = { kind: g.berryMark ? "nook21" : "nook21warn", bm: String(g.berryMark) };
        }
      }
      // Level 11：标着 EXIST 的门 -> Level 994；Level 70：标着 37 的门 -> Level 37
      if (!g.nearNew) {
        for (const p of (map.props || [])) {
          if (p.type === "exist11" && near(p)) { g.nearNew = { kind: "exist11" }; break; }
          if (p.type === "door37" && near(p)) { g.nearNew = { kind: "door37" }; break; }
          // 城市最左边那团霓虹雾 -> Level 11.1 新时代广场
          if (p.type === "neonfog11" && String(g.level) === "11" && near(p)) { g.nearNew = { kind: "neonfog11" }; break; }
          if (p.type === "blackdoor287" && near(p)) { g.nearNew = { kind: "blackdoor287", p }; break; }
          // Level 0.1 天顶站：机器人 / 能量棒
          if (p.type === "zenithrobot" && near(p)) { g.nearNew = { kind: "zenithrobot", p }; break; }
          if (p.type === "zenithbar" && near(p)) { g.nearNew = { kind: "zenithbar", p }; break; }
          // Level 289 过载：竖井（回水池）/ 子区之间的通道口
          if (p.type === "p289shaft" && near(p)) { g.nearNew = { kind: "p289shaft", p }; break; }
          if (p.type === "p289pass" && near(p)) { g.nearNew = { kind: "p289pass", p }; break; }
          // 入口：Level 0 地面上的空洞（→0.1）/ Level 13 的黄墙·Level 19 的毁坏门（→289）
          if (p.type === "hole01" && near(p)) { g.nearNew = { kind: "hole01", p }; break; }
          if (p.type === "wall289" && near(p)) { g.nearNew = { kind: "wall289", p }; break; }
          if (p.type === "brokendoor289" && near(p)) { g.nearNew = { kind: "brokendoor289", p }; break; }
          if (p.type === "guarddoor25" && near(p)) { g.nearNew = { kind: "guarddoor25" }; break; }
          if (p.type === "graydoor484" && near(p)) { g.nearNew = { kind: "graydoor484", p }; break; }
          if (p.type === "irondoor04" && near(p)) { g.nearNew = { kind: "irondoor04" }; break; }
          // Level ! 的 EXIT 大门：**撞上去就走**，不用按 E。
          // 你身后有东西在追，停下来开门这件事本身就不合理 —— 以前要按 E，
          // 玩家一边被追一边找按键，常常就这么死在门前，还以为警报关不掉。
          if (p.type === "exitbang" && near(p)) {
            if (g.phase === "playing") {
              goToLevel(g, 0, "撞开了那扇 EXIT 大门",
                "门在身后合上，红灯和警报一瞬间全断了 —— 你跌回那片熟悉的黄地毯上。");
            }
            break;
          }
          if (p.type === "deadpool10" && near(p)) { g.nearNew = { kind: "deadpool10" }; break; }
          if (p.type === "bluedoor" && near(p)) { g.nearNew = { kind: "bluedoor" }; break; }
          if (p.type === "reddoorEx" && near(p)) { g.nearNew = { kind: "reddoorEx" }; break; }
          // Level 15.1：仿真设备（躺进去就开始模拟）
          // 隐秘层级 —— 战地医院（14h）
          if (p.type === "medcab14h" && near(p)) { g.nearNew = { kind: "medcab14h", p }; break; }
          if (p.type === "ghost14h" && near(p)) { g.nearNew = { kind: "ghost14h", p }; break; }
          if (p.type === "ceiling14h" && near(p)) { g.nearNew = { kind: "ceiling14h", p }; break; }
          if (p.type === "exitwall14h" && near(p)) { g.nearNew = { kind: "exitwall14h", p }; break; }
          // Level 20 波瑞阿斯建筑
          if (p.type === "l20locker" && near(p)) { g.nearNew = { kind: "l20locker", p }; break; }
          if (p.type === "l20vend" && near(p)) { g.nearNew = { kind: "l20vend", p }; break; }
          if (p.type === "l20fount" && near(p)) { g.nearNew = { kind: "l20fount", p }; break; }
          if (p.type === "l20window" && near(p)) { g.nearNew = { kind: "l20window", p }; break; }
          if (p.type === "l20jelly" && near(p)) { g.nearNew = { kind: "l20jelly", p }; break; }
          if (p.type === "l20game" && near(p)) { g.nearNew = { kind: "l20game", p }; break; }
          // Level 78 空间站
          if (p.type === "p78hatch" && near(p)) { g.nearNew = { kind: "p78hatch", p }; break; }
          if (p.type === "cabindoor1000" && near(p)) { g.nearNew = { kind: "cabindoor1000", p }; break; }
          if (p.type === "p78pod" && near(p)) { g.nearNew = { kind: "p78pod", p }; break; }
          if (p.type === "p78dense" && near(p)) { g.nearNew = { kind: "p78dense", p }; break; }
          if (p.type === "p78sep" && near(p)) { g.nearNew = { kind: "p78sep", p }; break; }
          if (p.type === "p78porthole" && near(p)) { g.nearNew = { kind: "p78porthole", p }; break; }
          // Level 45 深渊公司
          if (p.type === "p45escape" && near(p)) { g.nearNew = { kind: "p45escape", p }; break; }
          if (p.type === "p45pen" && near(p)) { g.nearNew = { kind: "p45pen", p }; break; }
          // 楼里其余每一样东西：全是精致的塑料雕塑（正门另算 —— 它是出口）
          if (p.type && String(p.type).indexOf("p45") === 0
              && p.type !== "p45frontdoor" && p.type !== "p45escape" && p.type !== "p45pen"
              && near(p)) { g.nearNew = { kind: "p45sculpt", p }; break; }
          // Level 289 里那段通往战地医院的楼梯
          if (p.type === "stairs289h" && near(p)) { g.nearNew = { kind: "stairs289h", p }; break; }
          // ---- Level 67 / 31 / 40 / 94 的本层专属物件 ----
          // 提示文案和交互逻辑全都写在 newLevelHint / newLevelInteract 里，
          // 但以前漏了登记这一步 —— 结果走到跟前既不提示、按 E 也没反应，
          // 整层的东西全是死的（只有带 toLevel 的出口走门系统还能用）。
          // 这里统一按前缀登记：kind 直接用物件类型，一一对上已有的 case。
          if (p.type && /^p(67|31|40|94)[a-z0-9]*$/.test(String(p.type)) && near(p)) {
            g.nearNew = { kind: String(p.type), p }; break;
          }
          // ---- Level 29 海波利亚 / Level 284 需汝之地 ----
          if (p.type && /^p(29|284)[a-z0-9]*$/.test(String(p.type)) && near(p)) {
            g.nearNew = { kind: String(p.type), p }; break;
          }
          // Level 7：码头上的水上摩托（→ Level 29）
          if (p.type === "jet29" && near(p)) { g.nearNew = { kind: "jet29", p }; break; }
          if (p.type === "pod151" && near(p)) { g.nearNew = { kind: "pod151", p }; break; }
          if (p.type === "ctrldoor151" && near(p)) { g.nearNew = { kind: "ctrldoor151", p }; break; }
          if (p.type === "queue151" && near(p)) { g.nearNew = { kind: "queue151", p }; break; }
          if (p.type === "screen151" && near(p)) { g.nearNew = { kind: "screen151", p }; break; }
          // Level 1：那面被封锁的白墙 —— 守卫在这儿，按 E 也进不去
          if (p.type === "blocked13" && near(p)) { g.nearNew = { kind: "blocked13" }; break; }
          if (p.type === "enddoorEx" && near(p)) { g.nearNew = { kind: "enddoorEx", p }; break; }
          // ---- 1.3.0：601「假现实」/ Level 1「商人之家」----
          // 提示与交互都写好了，但没登记进这张清单的话，走到跟前既不提示、按 E 也没反应。
          if (p.type === "memvending" && near(p)) { g.nearNew = { kind: "memvending", p }; break; }
          if (p.type === "fake601sign" && near(p)) { g.nearNew = { kind: "fake601sign", p }; break; }
          if (p.type === "bntgstall" && near(p)) { g.nearNew = { kind: "bntgstall", p }; break; }
          if (p.type === "merchantsign" && near(p)) { g.nearNew = { kind: "merchantsign", p }; break; }
        }
      }
      // ---- Level 26 享乐号汽船：反转海报 / 扫兴客面具 / 红气球 ----
      if (!g.nearNew) {
        for (const p of (map.props || [])) {
          if (p.type !== "p26poster" && p.type !== "p26mask" && p.type !== "p26balloonRed") continue;
          if (near(p)) { g.nearNew = { kind: p.type, p }; break; }
        }
      }
      // 枢纽里那扇装饰着气球的窗户 —— 原先指向 Level Fun，现在通往 Level 26
      if (!g.nearNew && lvS === "hub" && map.balloon && near(map.balloon)) {
        g.nearNew = { kind: "hubballoon26", p: map.balloon };
      }
      // 1.3.1 批次：带 iKind 的物件交给层级文件自己的提示 / 交互钩子。
      // 放在通用 toLevel 兜底之前 —— 有些出口（63 的虚空、797 的石窟）需要
      // 自定义去向或氛围文案，不能被通用门抢走。
      // 层级密钥贴身时优先：它常和门/出口落在同一片地板上，若被前面的
      // 专属分支抢走 nearNew，走到钥匙跟前只会显示「按 E 推开」，按 E 捡不起来。
      for (const p of (map.props || [])) {
        if (p.iKind !== "lvlkey" || !near(p)) continue;
        g.nearNew = { kind: "lvlkey", p }; break;
      }
      if (!g.nearNew) {
        for (const p of (map.props || [])) {
          if (!p.iKind || !near(p)) continue;
          g.nearNew = { kind: String(p.iKind), p }; break;
        }
      }
      // 通用兜底：任何带着 toLevel 的物件都能推开。
      // 1.2.0 那批层级（17 航空母舰 / 49 战壕 / 71 / 109 / 119 / 486 / 900 ...）
      // 的门都是各自新建的类型，以前只能靠在 switch 里逐个加分支 —— 漏掉的那些
      // 就是"门摆在那儿、画也画了，按 E 却毫无反应"。现在统一认 toLevel 字段，
      // 以后新加层级只要给门写上 toLevel 就能用，不用再改这里。
      if (!g.nearNew) {
        for (const p of (map.props || [])) {
          if (p.toLevel == null) continue;            // null = 不是出口（比如会死人的滑梯）
          if (!levelDef(p.toLevel)) continue;          // 目标层级没做 —— 别给一扇开不了的门
          if (near(p)) { g.nearNew = { kind: "genericdoor", p }; break; }
        }
      }
      // Level 15.1：正在模拟里 —— 按 E 就是自己把设备摘下来（唯一安全的离开方式）
      if (g.sim151) g.nearNew = { kind: "sim151out" };
    }

    g.nearBroken = null;
    let bd2 = Infinity;
    for (const p of (g.map.props || [])) {
      if (p.type !== "brokenCrate" || !p.contains || p.opened) continue;
      if ((p.floor | 0) !== g.floor) continue;
      const d2 = Math.hypot((p.x + 0.5) * TILE - g.player.x, (p.y + 0.5) * TILE - g.player.y);
      if (d2 < reach && d2 < bd2) { bd2 = d2; g.nearBroken = p; }
    }

    const cs = g.map.crates || [];
    for (const c of cs) {
      if (c.opened || (c.floor | 0) !== g.floor) continue;
      const d = Math.hypot((c.x + 0.5) * TILE - g.player.x, (c.y + 0.5) * TILE - g.player.y);
      if (d < reach && d < cd) { cd = d; crate = c; }
    }
    g.nearItem = item;
    g.nearCrate = crate;

    // 撬棍摆在破损的箱子 / 桌面上 —— 走过去直接拿，不用按键
    if (item && item.item === "crowbar" && !hasCrowbar()) {
      item.taken = true;
      addItem("crowbar", 1);
      toast("捡到了一根撬棍 —— 现在能撬开补给箱了");
      g.nearItem = null;
      return;
    }
    // 电梯（Level 5 主厅）
    g.nearElevator5 = null;
    if (isLevel(g, 5) && g.map.elevators) {
      for (const ev of g.map.elevators) {
        if ((ev.floor | 0) !== g.floor) continue;
        if (Math.hypot((ev.x + 0.5) * TILE - g.player.x, (ev.y + 0.5) * TILE - g.player.y) < reach) {
          g.nearElevator5 = ev;
          break;
        }
      }
    }
    // 锅炉房深处的楼梯（Level 5 -> Level 6）
    g.nearStairs6 = null;
    if (isLevel(g, 5) && g.map.deep6 && (g.map.deep6.floor | 0) === g.floor) {
      const d6 = g.map.deep6;
      if (Math.hypot((d6.x + 0.5) * TILE - g.player.x, (d6.y + 0.5) * TILE - g.player.y) < reach) {
        g.nearStairs6 = d6;
      }
    }
    // 熄灯里的楼梯（Level 6 -> Level 7）
    g.nearStairs7 = null;
    if (isLevel(g, 6) && g.map.stairs) {
      const st = g.map.stairs;
      if (Math.hypot((st.x + 0.5) * TILE - g.player.x, (st.y + 0.5) * TILE - g.player.y) < reach * 1.4) {
        g.nearStairs7 = st;
      }
    }
    // Level 7：海面上的潜艇 / 海底那艘（坐它浮回海面）/ 海底岩洞
    g.nearRope = null;
    g.nearCave7 = null;
    g.nearSub = null;
    g.nearSubSea = null;
    if (isLevel(g, 7)) {
      // 门廊垂下的绳索（老版 L7 保留兼容）
      if (g.map.rope) {
        const rp = g.map.rope;
        if (Math.hypot((rp.x + 0.5) * TILE - g.player.x, (rp.yTop + 2) * TILE - g.player.y) < TILE * 3) {
          g.nearRope = rp;
        }
      }
      // 海面上系着的那艘潜艇
      const sb = g.map.sub;
      if (sb && Math.hypot((sb.x + 0.5) * TILE - g.player.x, (sb.y + 0.5) * TILE - g.player.y) < reach * 2) {
        g.nearSub = sb;
      }
      // 海底停在身边的那艘
      const ss = g.map.subSea;
      if (ss && Math.hypot((ss.x + 0.5) * TILE - g.player.x, (ss.y + 0.5) * TILE - g.player.y) < reach * 2) {
        g.nearSubSea = ss;
      }
      const cv = g.map.cave;
      if (cv && Math.hypot((cv.x + 0.5) * TILE - g.player.x, (cv.y + 0.5) * TILE - g.player.y) < reach * 1.6) {
        g.nearCave7 = cv;
      }
    }

    // Level 1：Alpha 基地北边的洞口 -> Level 19
    g.nearAtticHole = null;
    if (isLevel(g, 1) && g.map.atticHole) {
      const h = g.map.atticHole;
      if ((h.floor | 0) === (g.floor | 0) &&
          Math.hypot((h.x + 0.5) * TILE - g.player.x, (h.y + 0.5) * TILE - g.player.y) < reach * 1.5) {
        g.nearAtticHole = h;
      }
    }
    // Level 1 花园段深处：再往里就是 Level 1.2 砼苑
    g.nearGardenDeep = null;
    if (isLevel(g, 1) && g.map.gardenNook) {
      const nk = g.map.gardenNook;
      if ((nk.floor | 0) === (g.floor | 0) &&
          Math.hypot((nk.deep.x + 0.5) * TILE - g.player.x, (nk.deep.y + 0.5) * TILE - g.player.y) < TILE * 1.3) {
        g.nearGardenDeep = nk;
      }
    }
    // Level 1.1：墙上的裂缝（切出去回到 Level 1）
    g.nearCrack11 = null;
    if (String(g.level) === "1.1") {
      for (const c of (g.map.cracks || [])) {
        if (Math.hypot((c.x + 0.5) * TILE - g.player.x, (c.y + 0.5) * TILE - g.player.y) < TILE * 1.4) g.nearCrack11 = c;
      }
    }
    // Level 18：转身 —— 从进来的地方离开，就有一扇通往 Level 19 的门
    // 那是一扇深色的木门，门上挂着 EXIT 的字样 —— 不是绿色出口牌。
    g.nearTurnBack = null;
    if (isLevel(g, 18) && g.map.turnBackDoor) {
      const e = g.map.turnBackDoor;
      if (Math.hypot((e.x + 0.5) * TILE - g.player.x, (e.y + 0.5) * TILE - g.player.y) < TILE * 1.6) {
        g.nearTurnBack = e;
      }
    }
    // Level 13：墙上的裂缝 —— 触碰就能到 Level 21
    g.nearWallCrack = null;
    if (isLevel(g, 13)) {
      for (const c of (g.map.wallCracks || [])) {
        const cx2 = (c.fx + 0.5) * TILE, cy2 = (c.fy + 0.5) * TILE;
        if (Math.hypot(cx2 - g.player.x, cy2 - g.player.y) < TILE * 1.3) g.nearWallCrack = c;
      }
    }
    // Level 19：没有发光的裂缝 / 破损的门 / 箱子里的小街机 / 地板下的橙光
    g.nearCrack19 = null; g.nearDoor19 = null; g.nearArcade = null; g.onGlow19 = false;
    if (isLevel(g, 19)) {
      const tk = tileKeyOf(g.player);
      const m = g.map;
      for (const c of (m.cracks || [])) {
        if (Math.hypot((c.x + 0.5) * TILE - g.player.x, (c.y + 0.5) * TILE - g.player.y) < TILE * 1.2) g.nearCrack19 = c;
      }
      for (const d of (m.brokenDoors || [])) {
        if (Math.hypot((d.x + 0.5) * TILE - g.player.x, (d.y + 0.5) * TILE - g.player.y) < TILE * 1.4) g.nearDoor19 = d;
      }
      // 地板下的橙光已经从这一层删掉了 —— 不再有，也不再影响理智
    }

    // Level 4：倾斜的楼梯井（回 Level 3）与电梯（去 Level 5）
    g.nearStairwell = null;
    g.nearElevator4 = null;
    if (isLevel(g, 4)) {
      const sw = g.map.stairwell;
      if (sw && Math.hypot((sw.x + 0.5) * TILE - g.player.x, (sw.y + 0.5) * TILE - g.player.y) < reach * 1.4) {
        g.nearStairwell = sw;
      }
      const ev4 = g.map.elevator;
      if (ev4 && Math.hypot((ev4.x + 0.5) * TILE - g.player.x, (ev4.y + 0.5) * TILE - g.player.y) < reach * 1.4) {
        g.nearElevator4 = ev4;
      }
    }

    // 电力开关 / 电梯（Level 3）
    g.nearSwitch = null;
    g.nearElevator = null;
    if (g.map.level === 3) {
      const pr = g.map.powerRoom;
      if (pr && Math.hypot((pr.sx + 0.5) * TILE - g.player.x, (pr.sy + 0.5) * TILE - g.player.y) < reach) {
        g.nearSwitch = pr;
      }
      const ev = g.map.elevator;
      if (ev && Math.hypot((ev.x + 0.5) * TILE - g.player.x, (ev.y + 0.5) * TILE - g.player.y) < reach) {
        g.nearElevator = ev;
      }
    }

    // 站在档案上时优先提示"阅读"，别把补给提示盖上去
    if (g.nearArchive) return;

    if (g.nearSwitch) {
      el.pickupHint.innerHTML = touchMode
        ? '点击右下 <b>交互</b> 按钮 · ' + (g.map.switchOn ? "拉下电力开关" : "合上电梯电力开关")
        : '按 <b>E</b> ' + (g.map.switchOn ? "拉下电力开关" : "合上电梯电力开关");
      show(el.pickupHint);
      if (el.btnAct) { show(el.btnAct); el.btnAct.classList.add("ready"); }
      return;
    }
    if (g.nearElevator) {
      let txt;
      if (!hasKey()) txt = "电梯被上锁的铁栅栏拦着 —— 需要钥匙";
      else if (!g.map.switchOn) txt = "电梯没有电 —— 需要先合闸";
      else txt = "搭乘电梯 · 离开 Level 3";
      el.pickupHint.innerHTML = touchMode
        ? '点击右下 <b>交互</b> 按钮 · ' + txt
        : '按 <b>E</b> ' + txt;
      show(el.pickupHint);
      if (el.btnAct) { show(el.btnAct); el.btnAct.classList.add("ready"); }
      return;
    }

    const hint = (txt) => {
      // 新层级自己的提示里常已经写了「按 E」；再套一层前缀就会变成「按 E … 按 E …」。
      const hasKey = /按\s*E/i.test(txt);
      el.pickupHint.innerHTML = touchMode
        ? '点击右下 <b>交互</b> 按钮 · ' + txt
        : (hasKey ? txt : '按 <b>E</b> ' + txt);
      show(el.pickupHint);
      if (el.btnAct) { show(el.btnAct); el.btnAct.classList.add("ready"); }
      return;
    };
    // 有些地方是「走进去」而不是「按 E」—— 不能再顶着「按 E」三个字误导人
    const hintWalk = (txt) => {
      el.pickupHint.innerHTML = '走过去 · ' + txt;
      show(el.pickupHint);
      if (el.btnAct) { hide(el.btnAct); el.btnAct.classList.remove("ready"); }
      return;
    };
    // Level 13：墙上的裂缝 —— 伸手去碰就能到 Level 21（放在 hint 定义之后，
    // 之前写在定义之前，一进入有裂缝的层级就抛 "Cannot access 'hint'"）
    if (g.nearWallCrack) return hint("墙上有道裂缝 · 伸手去碰");
    if (g.nearRadio) {
      return hint(g.radioPlaying ? "关掉收音机" : "打开这台收音机 · 它会放点音乐");
    }
    // Level 4：楼梯井（-> Level 3）与电梯（-> Level 5）
    if (String(g.level) === "4") {
      const sw = g.map.stairwell;
      if (sw && Math.hypot((sw.x + 0.5) * TILE - g.player.x, (sw.y + 0.5) * TILE - g.player.y) < reach * 1.4) {
        return hint("走下倾斜的楼梯井 · 回到 Level 3");
      }
      const ev = g.map.elevator;
      if (ev && Math.hypot((ev.x + 0.5) * TILE - g.player.x, (ev.y + 0.5) * TILE - g.player.y) < reach * 1.4) {
        return hint("搭乘电梯 ");
      }
    }
    if (g.nearStairwell) return hint("走下倾斜的楼梯井 · 回到 Level 3");
    if (g.nearElevator4) return hint("搭乘电梯 ");
    if (g.nearAtticHole) return hint("爬进这个洞口  的阁楼");
    if (g.nearTurnBack) return hint("推开这扇深色木门 · 门上挂着 EXIT 的字样");
    if (g.nearGardenDeep) return hintWalk("前面那团绿光 —— 走进去就是 Level 1.2 砼苑");
    if (g.nearCrack11) return hint("墙上一道裂缝 —— 按 <b>E</b> 从这里切出去");
    if (g.nearCrack19) return hint("地板下没有光 —— 从这道裂缝掉下去");
    if (g.nearDoor19) return hint("推开这扇破损的门");
    // Level 7：海面上的潜艇 —— 三样齐了才开得动
    if (g.nearSub) {
      const need = [];
      if (!hasItem("submarine")) need.push("潜艇");
      if (!hasItem("subkey")) need.push("潜艇钥匙");
      if (!hasItem("divesuit")) need.push("潜水服");
      return hint(need.length
        ? "坐上潜艇下潜（还缺：" + need.join("、") + "）"
        : "坐上潜艇下潜 · 前往海底");
    }
    // Level 7：海底那艘 —— 坐它浮回海面
    if (g.nearSubSea) return hint("坐上潜艇 · 返回海面");
    if (g.nearSuburb9) return hintWalk("前面不像岩洞 —— 潮湿的沥青、灭了灯的路灯和一排房子（Level 9）");
    if (g.onPath9) return hint("这条步道 —— 继续走会进入田野");
    if (g.nearLake) return hint("捧起湖水喝一口");
    // 第 11 效应：只是描述，不用按键（按 E 也没反应，所以别挂"按 E"）
    if (g.nearDocile) {
      el.pickupHint.innerHTML = "第 11 效应 —— 它只是漫无目的地游荡着，对你毫无兴趣";
      show(el.pickupHint);
      return;
    }
    if (g.nearDisp) {
      const nm = g.nearDisp.type === "watercooler" ? "饮水机"
        : g.nearDisp.type === "freezer" ? "商业冰柜" : "苏打水自动售货机";
      return hint("从" + nm + "里取一瓶杏仁水");
    }
    if (g.nearCityDoor) return hint("进入这栋建筑 " + g.nearCityDoor.target);
    if (g.nearAlley10) return hint("钻进这条偏僻的小道");
    if (g.nearWin12) return hint("翻过这扇窗 ");
    if (g.nearApt13) return hint("走进这栋单调的公寓楼 ");
    if (g.nearVent02) return hint("钻进通风管道");
    if (g.nearSmoke486) return hint("工厂烟囱冒出来的烟 —— 走进去（按 E）");
    // ---- 1.8.0：Level 28 终末美德 ----
    if (String(g.level) === "28") {
      if (g.nearLamp28) return hint("一盏台灯 —— 奔跑着撞进去（去 Level 4 或 Level 5 其一）");
      if (g.nearKnight28) return hint("蓝骑士 —— 一副硕大而空洞的盔甲 · 和他说话");
      if (g.nearStone28) {
        const s = window.STONES28 ? window.STONES28[g.nearStone28.idx | 0] : null;
        if (s) return hint(s.st + " · " + s.name + "（" + s.cn + "） —— 看看上面刻着什么");
      }
      if (g.inPool28) return hint("一口深渊池 · 坠进去（有概率被送去 Level 10.1）");
      if (g.inAbyss28) return hint("你正站在活体深渊里 —— 它的腐败在慢慢地污染你。退回去");
    }
    // ---- 1.8.0：痛处（Level 0 里的一处地点）----
    if (String(g.level) === "pain") {
      if (g.nearStatue) return hint("一个不知名的、戴帽男子的破损石像 · 伸手去碰");
      if (g.nearTomb) return hint("一块墓碑 —— 看看上面写着谁");
      if (g.onLeaf) return hint("地上有一堆被分解了的树叶 —— 踩上去");
    }
    // ---- 1.8.0：Level 27 岩体泉 ----
    if (String(g.level) === "27" && g.inSpring27) {
      const mins = Math.floor((g.soak27 || 0) / 60);
      return hint("温泉 · 水温约 90°F —— 你已经泡了 " + mins + " 分钟" +
        ((g.soak27 || 0) > 120 ? "（头晕，恶心 —— 该出去了）" : ""));
    }
    if (g.nearBerry) {
      if (g.nearBerry.type === "berrybox") return hint("一盒迁跃浆果（4 颗） —— 按 E 整盒收进背包");
      return hint("野生浆果丛 —— 按 E 摘下 5 颗迁跃浆果");
    }
    if (g.nearKitty) {
      const ck = firstCuteItem(g);
      return hint(ck
        ? "把" + (ITEMS[ck] ? ITEMS[ck].name : "它") + "给 Kitty（按 E）—— 这是离开这里的唯一办法"
        : "Kitty 悄无声息地站在你身后。它想要一件「可爱」的东西。");
    }
    if (g.nearIce) {
      return hint((g.inv.torch | 0) > 0
        ? "这块冰太大了 —— 按 E 用喷枪化开它"
        : "一块巨大的冰，堵得死死的（得有喷枪才处理得了）");
    }
    if (g.nearVent03) return hint("从这根管道原路返回 Level 0.2");
    if (g.nearNew) return hint(newLevelHint(g));
    if (g.nearFieldPath) return hint("踏上这条通往草地的人行道");
    if (g.nearBroken) return hint("翻找这只破损的箱子");
    if (g.nearElevator5) return hint("乘坐电梯（1~12 楼 → 本层其他区域；13 楼以上 → 别按）");
    if (g.nearStairs6) return hint("深入锅炉房 · 切出 Level 6");
    if (g.nearStairs7) return hint("沿着楼梯走下去 ");
    if (g.nearRope) {
      if (!inWater(g)) return hint("从门廊下潜（重力会翻转 —— 抓住绳索才回得来）");
      return hint("攀上绳索 · 回到入口房间");
    }
    if (g.nearCave7) {
      const need = [];
      if (!hasItem("divesuit")) need.push("潜水服");
      if (!hasItem("submarine")) need.push("潜艇");
      return hint(need.length ? "海底岩洞（还缺：" + need.join(" 与 ") + "）" : "进入海底岩洞 ");
    }

    if (item && item.item !== "crowbar") {
      // Level 14 的伪装：拿到手上之前，你看它还是干净的杏仁水
      const nm = item.disguised ? "杏仁水" : itemName(item.item);
      el.pickupHint.innerHTML = touchMode
        ? '点击右下 <b>交互</b> 按钮 · 捡起' + nm
        : '按 <b>E</b> 捡起' + nm;
      show(el.pickupHint);
      if (el.btnAct) { show(el.btnAct); el.btnAct.classList.add("ready"); }
    } else if (crate) {
      const txt = hasCrowbar() ? "撬开补给箱" : "需要撬棍才能撬开补给箱";
      el.pickupHint.innerHTML = touchMode
        ? '点击右下 <b>交互</b> 按钮 · ' + txt
        : '按 <b>E</b> ' + txt;
      show(el.pickupHint);
      if (el.btnAct) { show(el.btnAct); el.btnAct.classList.add("ready"); }
    }
  }

  function itemName(key) {
    const it = ITEMS[key];
    return it ? it.short : "物品";
  }

  // 站在地上物品旁边直接用掉它（不用先捡进背包）
  function useGroundItem(it) {
    const g = game;
    if (!g || !it || it.taken) return;
    it.taken = true;
    g.groundSel = null;
    g.nearItem = null;
    if (it.item === "almond" || it.item === "bad") {
      // 借一下"喝掉"的逻辑：先临时记进背包，喝完把这份临时计数抹掉。
      // drink() 自己会扣一次，别在外面再扣 —— 不然会双倍扣掉背包里的存货。
      const had = (g.inv[it.item] | 0);
      g.inv[it.item] = had + 1;
      drink(it.item);
      const left = (g.inv[it.item] | 0);
      if (left <= had) { if (left <= 0) delete g.inv[it.item]; else g.inv[it.item] = left; }
      else g.inv[it.item] = had;
      if ((g.inv[it.item] | 0) <= 0) delete g.inv[it.item];
    }
    updateBag(); updateHud(); renderBag(); renderHotbar();
  }

  // 点选脚边的地上物品：点一下选中，再按 E 用掉（手机端双击直接用）
  function selectGroundItem() {
    const g = game;
    if (!g || g.phase !== "playing") return;
    const it = g.nearItem;
    if (!it || it.taken) { g.groundSel = null; return; }
    g.groundSel = it;
    toast("选中了" + itemName(it.item) + " —— 按 E 用掉它");
  }

  function initGroundClick() {
    const cv = document.getElementById("game");
    if (!cv) return;
    cv.addEventListener("mousedown", () => { if (!drag) selectGroundItem(); });
    // 手机端：双击地上的东西 = 直接用掉
    let lastTap = 0;
    cv.addEventListener("click", () => {
      const now = Date.now();
      if (now - lastTap < 350) {
        const g = game;
        if (g && g.nearItem && !g.nearItem.taken) { g.groundSel = g.nearItem; useGroundItem(g.nearItem); }
      }
      lastTap = now;
    });
  }

  // 捡起地上的东西 / 撬开补给箱
  function supplyAction() {
    const g = game;
    if (!g || g.phase !== "playing") return;
    if (g.nearSwitch) { togglePower(); return; }
    if (g.nearElevator) { tryElevator(); return; }
    // Level 4：楼梯井 / 电梯
    if (String(game.level) === "4") {
      const sw = game.map.stairwell;
      if (sw && Math.hypot((sw.x + 0.5) * TILE - game.player.x, (sw.y + 0.5) * TILE - game.player.y) < CONFIG.CROWBAR_REACH * TILE * 1.4) {
        goToLevel(game, 3, "已回到楼梯井上方", "砖墙与混凝土地板出现在脚下 —— 你回到了 Level 3 ...");
        return;
      }
      const ev = game.map.elevator;
      if (ev && Math.hypot((ev.x + 0.5) * TILE - game.player.x, (ev.y + 0.5) * TILE - game.player.y) < CONFIG.CROWBAR_REACH * TILE * 1.4) {
        goToLevel(game, 5, "电梯门缓缓合上", "数字一格一格往上跳 —— 你前往 Level 5 ...");
        return;
      }
    }
    if (g.nearStairwell) { goToLevel(g, 3, "走回了楼梯井", "发霉的地毯与机器的轰鸣 —— 你回到了 Level 3 ..."); return; }
    if (g.nearElevator4) { AudioSys.elevator(); goToLevel(g, 5, "电梯门开了", "数字往上跳 —— 门开时，是二十世纪三十年代的爵士乐 ..."); return; }
    if (g.nearElevator5) { rideElevator5(g); return; }
    if (g.nearStairs6) { goToLevel(g, 6, "已深入锅炉房", "高温与蒸汽突然消失 —— 灯全灭了 ..."); return; }
    if (g.nearStairs7) { goToLevel(g, 7, "走下了楼梯", "空气变得潮湿，水声越来越近 ..."); return; }
    if (g.nearRope) { useRope(g); return; }
    // Level 7：坐潜艇 —— 海面 <-> 海底
    if (g.nearAtticHole) {
      AudioSys.exitChime();
      goToLevel(g, 19, "钻进了基地北边的洞口",
        "灰尘扑面而来 —— 你挤进了一间潮湿破旧的阁楼 ...");
      return;
    }
    if (g.nearTurnBack) {
      AudioSys.exitChime();
      goToLevel(g, 19, "转过身 —— 门就在那里",
        "门后是堆积如山的箱子与旧家具，空气里全是灰尘 ...");
      return;
    }
    if (g.nearGardenDeep) {
      AudioSys.exitChime();
      goToLevel(g, "1.2", "往花园段深处走去",
        "植被越来越密，走廊一条接一条 —— 你已经走出了那十几格 ...", { noReroute: true });
      return;
    }
    if (g.nearCrack11) {
      AudioSys.exitChime();
      goToLevel(g, 1, "从墙缝里钻了出去",
        "眼前一花 —— 你回到了那片熟悉的停车场 ...", { noReroute: true });
      return;
    }
    if (g.nearCrack19) {
      AudioSys.exitChime();
      const pool19 = [8, 5, 2, 11, 13];
      goToLevel(g, pool19[randInt(0, pool19.length - 1)], "脚下塌了下去",
        "你在坠落中失去了意识 ...");
      return;
    }
    if (g.nearDoor19) { openDoor19(g); return; }
    if (g.nearWallCrack) { touchWallCrack(g); return; }
    if (g.nearSub) { boardSub(g); return; }
    if (g.nearDoor19) { openDoor19(g); return; }   // 门：E / R 都行
    if (g.nearSubSea) { subBackToDock(g); return; }
    if (g.nearCave7) { tryCave7(g); return; }
    if (g.nearBroken) {
      const p = g.nearBroken;
      if (bagFull()) {
        toast("背包满了（" + bagText() + "）—— 拿不走箱子里的东西");
        AudioSys.growl();
        return;
      }
      p.opened = true;
      if (String(g.level) === "19") g.map.decay = (g.map.decay || 0) + 1;
      const got = p.contains;
      g.nearBroken = null;
      AudioSys.door(true);
      if (got === "almond") {
        const n2 = randInt(1, 2);
        if (!g.bagCapInfinite && bagSlots() + n2 > bagCap()) { addItem("almond", 0); toast("背包满了"); return; }
        addItem("almond", n2);
        toast("箱子里躺着 " + n2 + " 瓶杏仁水");
      } else {
        addItem(got, 1);
        toast("你从散架的箱子里翻出了一套" + itemName(got));
      }
      return;
    }
    // Level 10：喝湖水
    if (g.nearLake) {
      if (g.wretch && g.wretch.done) return;
      g.sanity = clamp(g.sanity + CONFIG.LAKE_SANITY, 0, CONFIG.SANITY_MAX);
      g.hp = clamp(g.hp + CONFIG.LAKE_HP, 0, CONFIG.HP_MAX);
      AudioSys.water();
      toast("湖水下肚，带着一点泥土味 —— 脑子清爽了一些");
      updateHud();
      return;
    }
    // Level 11：从饮水机 / 冰柜 / 售货机取杏仁水
    if (g.nearDisp) {
      const np = g.nearDisp;
      if (bagFull()) { toast("背包满了（" + bagText() + "）—— 拿不了了"); AudioSys.growl(); return; }
      np.uses = (np.uses | 0) - 1;
      addItem("almond", 1);
      AudioSys.door(true);
      toast("从里面拿出一瓶杏仁水（这台还剩 " + Math.max(0, np.uses) + " 瓶）");
      g.nearDisp = null;
      return;
    }
    if (g.nearCityDoor) {
      const tgt = g.nearCityDoor.target;
      AudioSys.exitChime();
      goToLevel(g, tgt, "推开了这栋建筑的门",
        "门后不是街道，而是 " + levelDef(tgt).name + " ...");
      return;
    }
    if (g.nearAlley10) {
      AudioSys.exitChime();
      goToLevel(g, 10, "钻进了偏僻的小道", "城市的噪声被麦浪的声音盖过 —— 你回到了 Level 10 ...");
      return;
    }
    if (g.nearSmoke486) {
      AudioSys.door(true);
      startTransition("你走进了那片烟",
        "烟散去 —— 眼前是一座被雪埋住的小镇，教堂的钟停在三点一刻 ...",
        { kind: "toLevelX", level: 790 });
      return;
    }
    // ---- 1.8.0：Level 28 终末美德 ----
    if (String(g.level) === "28") {
      // 奔跑着撞向岚石要塞的一盏台灯 -> Level 4 或 Level 5 其一
      if (g.nearLamp28) {
        const to = Math.random() < 0.5 ? 4 : 5;
        AudioSys.door(true);
        goToLevel(g, to, "撞进了那盏台灯",
          to === 4 ? "灯灭了 —— 眼前是一间间废弃的办公室 ..."
                   : "灯灭了 —— 地毯、壁纸、嗡嗡作响的日光灯 ...");
        return;
      }
      if (g.nearKnight28) {
        const lines = [
          "「滕必忍斯。」—— 声音是从那副空盔甲里传出来的。里面什么也没有。",
          "「别往深处走。那片黑是有知觉的 —— 它会学。」",
          "「我的剑能劈开它。但只能劈开一会儿。」",
          "「……你要走吗？」他顿了顿，「走的路，我是知道的。只是我不太想说。」",
          "「六个。我失去了六个。而我还得留在这儿。」",
        ];
        g.nearKnight28.talk = ((g.nearKnight28.talk | 0) + 1) % lines.length;
        toast(lines[g.nearKnight28.talk]);
        return;
      }
      if (g.nearStone28) {
        const s = window.STONES28 ? window.STONES28[g.nearStone28.idx | 0] : null;
        if (s) {
          toast(s.st + " · " + s.name + "（" + s.cn + "）—— " + s.desc);
          toast("石头上有一道符文，不属于任何已知的语言。严重受损时，它会重归一种更稳定的状态 —— 却不会复原成原本的样子。");
        }
        return;
      }
      // 坠入一口深渊池内，有概率被送去 Level 10.1
      if (g.inPool28) {
        if (Math.random() < 0.4) {
          AudioSys.door(true);
          goToLevel(g, "10.1", "坠进了那口深渊池",
            "水一直黑到了底 —— 你浮上来时，四周是一片死寂的湖 ...");
        } else {
          g.hp = clamp(g.hp - 18, 0, CONFIG.HP_MAX);
          toast("你陷进了那池柏油里，又爬了出来 —— 手上的皮在发黑。");
        }
        return;
      }
    }
    // ---- 1.8.0：痛处（Level 0 里的一处地点）----
    if (String(g.level) === "pain") {
      if (g.nearStatue) {
        toast("你伸手去碰那座石像 —— 手从石头里穿了过去。它已经破损很久了，没人知道他是谁。");
        return;
      }
      if (g.nearTomb) {
        const e = window.PAIN_EPITAPHS ? window.PAIN_EPITAPHS[g.nearTomb.idx | 0] : null;
        if (e) {
          toast(e.name + "，「" + e.cause + "」" + " · " + e.b + " — " + e.d);
          toast("M.E.G. 未曾发现与之相关联的任何流浪者。");
        }
        return;
      }
      if (g.onLeaf) {
        // 踩在那些被分解了的树叶上时，它们传出刺耳的尖叫声
        if (g.map.painLeaves) g.map.painLeaves.delete(g.onLeaf);
        try { AudioSys.growl && AudioSys.growl(); } catch (e) { /* 忽略 */ }
        toast("树叶在你脚下尖叫起来 —— 声音尖得刺耳，而且停不下来。");
        return;
      }
    }
    if (g.nearBerry) { pickWarpBerry(g, g.nearBerry); return; }
    if (g.nearWin12) {
      AudioSys.door(true);
      goToLevel(g, 12, "翻过了这扇窗",
        "玻璃后面不是街 —— 是一间白得发空的房间 ..." );
      return;
    }
    if (g.nearApt13) {
      AudioSys.door(true);
      startTransition("推开公寓楼的大门", "米白色的走廊向两头延伸，看不到尽头 ...", { kind: "toLevelX", level: 13 });
      return;
    }
    if (g.nearKitty) { giveKitty(g); return; }
    if (g.nearIce) {
      if ((g.inv.torch | 0) <= 0) { toast("没有喷枪 —— 光用手是掰不动的"); return; }
      meltIce(g, g.nearIce.x, g.nearIce.y);
      return;
    }
    if (g.nearVent02) {
      AudioSys.door(true);
      goToLevel(g, 0.3, "钻进了通风管道",
        "管道里结着霜，越爬越冷 —— 你切进了 Level 0.3 —— 冰室 ...");
      return;
    }
    if (g.nearVent03) {
      AudioSys.door(true);
      goToLevel(g, 0.2, "顺着管道爬了回去",
        "霜在身后合拢 —— 你回到了 Level 0.2 —— 重塑的混乱 ...");
      return;
    }
    if (g.nearNew) { newLevelInteract(g); return; }
    if (g.nearFieldPath) {
      AudioSys.exitChime();
      goToLevel(g, 10, "踏上了通往草地的人行道",
        "脚下从地毯变成了泥土，铅灰色的天空压得很低 —— 你走进了 Level 10 ...");
      return;
    }
    if (g.nearItem) { pickGround(g, g.nearItem); return; }
    const c = g.nearCrate;
    if (c) { pickCrate(g, c); return; }
  }

  let toastTimer = null;
  // ---------- 新层级通用判定 ----------
  function isLevel(g, lv) { return String(g.level) === String(lv); }

  // Level 7：是否在水里 / 当前深度（米）/ 所在深度分区
  // Level 10：站在茂密的草丛里（能挤过去，但挪得很慢）
  function inBush(g) {
    const m = g.map;
    if (!m || !m.bush) return false;
    const tx = Math.floor(g.player.x / TILE), ty = Math.floor(g.player.y / TILE);
    return m.bush.has(tx + "," + ty);
  }
  function inWater(g) {
    const m = g.map;
    if (!m || !m.ocean) return false;
    return g.player.y >= m.ocean.top * TILE;
  }
  // Level 7：踩在海面上（沉不下去，只是慢）
  function inSeaSurf(g) {
    const m = g.map;
    if (!m || !m.seaSurf) return false;
    const tx = Math.floor(g.player.x / TILE), ty = Math.floor(g.player.y / TILE);
    const tk = tx + "," + ty;
    if (m.land29 && m.land29.has(tk)) return false;          // 踏上陆地了 —— 那不是海
    if (m.seaSurf.has(tk)) return true;
    // 地图上边界以北：那一整片望不到边的海（不预先生成，走到才算一格）
    if (ty < 0 && m.openNorth && tx >= m.openNorth.x1 && tx <= m.openNorth.x2) return true;
    return false;
  }
  // Level 7：站在房子里那层积水里
  function inRoomWater(g) {
    const m = g.map;
    if (!m || !m.roomWater) return false;
    const tk = Math.floor(g.player.x / TILE) + "," + Math.floor(g.player.y / TILE);
    return m.roomWater.has(tk);
  }
  function playerDepth(g) {
    const m = g.map;
    if (!m || !m.ocean) return 0;
    return Math.max(0, (g.player.y / TILE) - m.ocean.top) * CONFIG.DEPTH_PER_TILE;
  }
  function depthZone(d) {
    for (const z of CONFIG.DIVE_ZONES) if (d >= z.from && d < z.to) return z;
    return CONFIG.DIVE_ZONES[CONFIG.DIVE_ZONES.length - 1];
  }
  // 当前格子的 key（用于毒气 / 蜘蛛巢 / 涨潮 / 扭曲点判定）
  function tileKeyOf(obj) {
    return Math.floor(obj.x / TILE) + "," + Math.floor(obj.y / TILE);
  }
  // Level 5：当前区域名
  function areaName(g) {
    const m = g.map;
    if (!m || !m.areas) return "";
    return m.areas[Math.min(g.floor | 0, m.areas.length - 1)] || "";
  }

  window.__toast = function (m) { try { toast(m); } catch (e) { /* 忽略 */ } };
  function toast(msg) {
    if (!el.flashToast) return;
    el.flashToast.innerHTML = msg;
    show(el.flashToast);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => hide(el.flashToast), 2600);
  }

  // 生命值归零（不是被实体抓住，而是自己垮掉的）
  function dieVitals() {
    const g = game;
    if (!g || g.phase !== "playing") return;
    if (g.invincible) { g.hp = Math.max(g.hp, 1); return; }   // 无敌模式
    g.phase = "dying";
    g.deathTimer = 0;
    g.killerName = g.killerName || "";
    // 已经写好死因的（例如被「窗」捕获）不要被覆盖
    g.deathCause = g.deathCause || (g.badStacks.length ? "受污染的杏仁水" : "精神崩溃");
    AudioSys.jumpscare();
  }

  function nearestEntity() {
    const g = game;
    let best = null, bd = Infinity;
    for (const e of g.entities) {
      const d = Math.hypot(e.x - g.player.x, e.y - g.player.y);
      if (d < bd) { bd = d; best = e; }
    }
    return best;
  }

  // ---------- 事件 ----------
  function escapeLevel() {
    const g = game;
    if (g.phase !== "playing") return;
    // Level 8 已经没有绿色出口了 —— 万一被调用（开发者面板的「通关」），
    // 也走那片郊区去 Level 9，不再弹出结局面板打断游戏。
    if (isLevel(g, 8)) {
      AudioSys.exitChime();
      unlockEnding(2);
      goToLevel(g, 9, "穿过了岩洞",
        "潮湿的沥青、灭了灯的路灯和一整排房子 —— Level 9，午夜的郊区 ...");
      return;
    }
    // Level 18：转身 —— 出口就是通往 Level 19 的那扇门
    if (isLevel(g, 18)) {
      AudioSys.exitChime();
      goToLevel(g, 19, "你转过身", "背后那扇门后面是潮湿的木地板与成堆的箱子 ...");
      return;
    }
    AudioSys.exitChime();
    if (g.level === 1) {
      // 宜居地带尽头：切入管道梦魇
      startTransition("已逃出宜居地带", "锈味与蒸汽扑面而来，你切进了管道梦魇 ...", null);
    } else if (g.level >= 2) {
      // Level 2 之后：出路是那扇铁栅栏门，绿色出口不再存在
      startTransition("未完待续……", "管道深处隐约传来更多声响……", null);
    } else {
      startTransition("已逃离 Level " + g.level, "正在进入 Level " + (g.level + 1) + " ...", null);
    }
  }

  function onCaught(e) {
    const g = game;
    if (g.phase !== "playing") return;
    if (g.invincible) return;                 // 无敌模式：抓不住你
    // Level 26：被派对客抓住时有 1/3 不死 —— 被拖进一间平时进不去的房间，
    // 几个派对客围着你，几秒后转化成功，解锁「派对」结局。
    if (window.l26ShouldTransform && window.l26ShouldTransform(g, e)) {
      g.phase = "transform26";
      g.l26transform = { at: performance.now() };
      try { AudioSys.growl(); } catch (_) { /* 忽略 */ }
      toast("它们没下嘴 —— 几只派对客架着你，拖进了一间没有门的房间");
      setTimeout(function () {
        const gg = game;
        if (!gg || String(gg.level) !== "26" || gg.phase !== "transform26" || !gg.l26transform) return;
        gg.l26transform = null;
        unlockEnding(13);
        showEnding(13, "几秒之后，你也笑了起来 —— 嘴角那个弧度，和它们一模一样。");
      }, 5000);
      return;
    }
    g.phase = "dying";
    g.deathTimer = 0;
    g.killerName = e && e.cfg ? e.cfg.name : "";
    g.deathCause = "被实体捕获";
    // 笑魇：死前会看到那张脸贴在整块屏幕上（全局 —— 不只是 Level 14）
    g.smilerScare = !!(e && (e.kind === "smiler" || e.cfg.name === "笑魇"));
    AudioSys.jumpscare();
  }

  function showDead() {
    const g = game;
    // 录像途中被实体吃掉 -> 最后一帧写「M.E.G录像带结束」，然后收进视频档案
    try { if (window.CamRec) CamRec.onDeath(g); } catch (e) { /* 忽略 */ }
    try { if (window.DigiCam) DigiCam.onDeath(g); } catch (e) { /* 忽略 */ }
    g._deathLevel = g.level;
    // 死在 Level ! 里：警报必须跟着停 —— 它是那一层的东西，不该响到死亡界面上
    try { AudioSys.bangAlarm(false); } catch (e) { /* 忽略 */ }
    g.bangAlarm = false;
    // 结局 1 · 被实体吃掉：被任何实体捕获都算 —— 这是后室里最常见的死法
    if (g.killerName || g.deathCause === "被实体捕获") {
      g.phase = "dead";
      if (el.scare) hide(el.scare);
      AudioSys.stopStatic();
      hide(el.pickupHint); hide(el.bag); hide(el.wretchTimer); hide(el.flashToast);
      resetStick(); sprintHeld = false;
      if (el.btnSprint) el.btnSprint.classList.remove("on");
      if (el.btnE) el.btnE.classList.remove("ready");
      if (el.btnAct) { el.btnAct.classList.remove("ready"); hide(el.btnAct); }
      hide(el.btnDoor);
      unlockEnding(1);
      showEnding(1, (g.killerName
        ? "「" + g.killerName + "」比你快。你连回头看清楚的机会都没有。"
        : "它比你快。你连回头看清楚的机会都没有。")
        + " —— 后室里大多数流浪者都是这样消失的。");
      return;
    }
    g.phase = "dead";
    if (el.scare) hide(el.scare);
    AudioSys.stopStatic();
    hide(el.pickupHint);
    hide(el.bag);
    hide(el.wretchTimer);
    hide(el.flashToast);
    resetStick();
    sprintHeld = false;
    if (el.btnSprint) el.btnSprint.classList.remove("on");
    if (el.btnE) el.btnE.classList.remove("ready");
      if (el.btnAct) { el.btnAct.classList.remove("ready"); hide(el.btnAct); }
    hide(el.btnDoor);
    // 一份被中断的观测记录：时长 / 死因 / 层级 / 档案
    if (el.deadTime) el.deadTime.textContent = fmtTime(g.time);
    if (el.deadCause) {
      el.deadCause.textContent = g.killerName
        ? "被「" + g.killerName + "」捕获"
        : (g.deathCause || "未知（信号中断）");
    }
    if (el.deadLevel) el.deadLevel.textContent = "Level " + g.level;
    if (el.deadArch) el.deadArch.textContent = archiveTotal();
    show(el.dead);
  }

  // 当前层级已收集/总档案数（每个层级只统计自己的档案）
  function archiveProgress() {
    const g = game;
    const inLevel = ARCHIVES.filter(a => a.level === g.level);
    const got = inLevel.filter(a => collected.has(a.id)).length;
    return got + "/" + inLevel.length;
  }

  // ---------- Level 14：无限的森林 —— 窗口跟着玩家走 ----------
  // 只有当前这一圈（半径约 25 格）里的树、倒木、杏仁水真的存在。
  // 走出这一圈它们就被忘掉；再走回去，那里会长出一片全新的森林。
  function l14Maintain(g) {
    const map = g.map;
    if (!map || !map.infinite) return;
    const c = map.size >> 1;
    const ptx = Math.floor(g.player.x / TILE), pty = Math.floor(g.player.y / TILE);
    // 1) 玩家快贴到窗口边了 —— 把整个世界平移回来（等于地图无限大）
    let dx = 0, dy = 0;
    if (ptx < c - L14_REBASE || ptx > c + L14_REBASE) dx = ptx - c;
    if (pty < c - L14_REBASE || pty > c + L14_REBASE) dy = pty - c;
    if (dx || dy) l14Rebase(map, dx, dy, g.player, g.entities, g.l14 && g.l14.child);
    // 2) 以玩家为中心，删掉窗口外的、补上窗口里的
    const center = { x: Math.floor(g.player.x / TILE), y: Math.floor(g.player.y / TILE) };
    map.winCenter = center;
    l14Cull(map, center, g.entities);
    l14Populate(map, center, false);
  }

  // ================= Level 14：小孩幻觉 =================
  // 精神危害：林间有时会出现一个"小孩"—— 穿着和你一模一样的衣服，
  // 朝你直冲过来。等它冲到近处，那张脸才裂成笑魇的嘴。
  const L14 = {
    GAP_MIN: 16, GAP_MAX: 34,     // 两次幻觉的间隔（秒）
    DIST: 9 * 40,                 // 在多远处成形
    TURN: 2.6 * 40,               // 冲到这么近就变成笑魇
    SPEED: 150,
  };
  function l14Reset(g) {
    g.l14 = { t: 0, next: rand(L14.GAP_MIN * 0.5, L14.GAP_MIN), child: null };
  }
  function l14SpawnChild(g) {
    const map = g.map;
    const list = floorList(map, g.floor);
    if (!list.length) return;
    for (let i = 0; i < 60; i++) {
      const t = list[randInt(0, list.length - 1)];
      if (!t) break;
      const x = (t.x + 0.5) * TILE, y = (t.y + 0.5) * TILE;
      const d = Math.hypot(x - g.player.x, y - g.player.y);
      if (d > L14.DIST * 0.75 && d < L14.DIST * 1.25) {
        g.l14.child = { x, y, vx: 0, vy: 0 };
        g.l14.next = rand(L14.GAP_MIN, L14.GAP_MAX);
        toast("林子里有个孩子 …… 等等，那件衣服 —— 是你的？");
        return;
      }
    }
  }
  function updateL14(g, dt) {
    if (!g.l14) l14Reset(g);
    const L = g.l14;
    if (L.child) {
      const dx = g.player.x - L.child.x, dy = g.player.y - L.child.y;
      const d = Math.max(1, Math.hypot(dx, dy));
      // 冲到近处：脸裂开，变成真正的笑魇
      if (d < L14.TURN) {
        const cx = L.child.x, cy = L.child.y;
        L.child = null;
        const ne = spawnSmilerAt(g, cx, cy);
        if (ne) { toast("那不是孩子 —— 那是一张嘴。"); AudioSys.roar(1); }
        else AudioSys.roar(1);
        return;
      }
      moveWithCollision(L.child, g.player.x, g.player.y, L14.SPEED, dt, g.map, g.floor);
      L.far = (L.far || 0) + dt;
      // 追不上或者跑偏太久，就当是看错了
      if (L.far > 14) { L.child = null; L.far = 0; }
      return;
    }
    L.t += dt;
    if (L.t >= L.next) { L.t = 0; l14SpawnChild(g); }
  }
  // 在指定位置真的生成一只笑魇（幻觉兑现）
  function spawnSmilerAt(g, x, y) {
    const tx = Math.floor(x / TILE), ty = Math.floor(y / TILE);
    if (tx < 0 || ty < 0 || tx >= g.map.size || ty >= g.map.size) return null;
    const e = new Entity(g.map, tx, ty, g.level, "smiler", g.floor);
    e.x = x; e.y = y;
    e.state = "chase";
    e.windup = 0;
    g.entities.push(e);
    return e;
  }
  // 画那个"小孩"：用的就是你自己的皮肤和衣服
  function drawL14Child(ctx, g) {
    const c = g.l14 && g.l14.child;
    if (!c) return;
    const od = currentOutfitDef(g);
    const t = g.time;
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath(); ctx.ellipse(c.x, c.y + 9, 12, 5, 0, 0, Math.PI * 2); ctx.fill();
    // 用玩家自己的配色画一遍，尺寸略小 —— 看着像"另一个你"
    ctx.scale(1, 1);
    ctx.fillStyle = od.body;
    ctx.beginPath(); ctx.ellipse(c.x, c.y, 9, 11, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.35)"; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = od.skin;
    ctx.beginPath(); ctx.arc(c.x, c.y - 9, 6.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = od.hair;
    ctx.beginPath(); ctx.arc(c.x, c.y - 10, 6.5, Math.PI * 1.05, Math.PI * 1.95); ctx.fill();
    if (od.suit) {
      ctx.fillStyle = "#191919";
      ctx.beginPath(); ctx.ellipse(c.x, c.y - 8, 7, 8, 0, 0, Math.PI * 2); ctx.fill();
    }
    // 越靠近，轮廓越不对劲 —— 泛起一层暗红
    const d = Math.hypot(g.player.x - c.x, g.player.y - c.y);
    const k = clamp(1 - d / L14.DIST, 0, 1);
    if (k > 0.35) {
      ctx.strokeStyle = "rgba(180,20,20," + ((k - 0.35) * 1.1).toFixed(3) + ")";
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(c.x, c.y - 4, 10 + Math.sin(t * 9) * 1.2, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  }

  // 站在 Alpha 基地的哪个房间里（HUD 上显示，方便认路）
  function megRoomName(g) {
    const ab = g.map && g.map.alphaBase;
    if (!ab || (g.floor | 0) !== (g.map.megFloor | 0)) return null;
    for (const r of ab.rooms) {
      const tx = Math.floor(g.player.x / TILE), ty = Math.floor(g.player.y / TILE);
      if (tx >= r.x && tx < r.x + r.w && ty >= r.y && ty < r.y + r.h) return r.name;
    }
    const tx2 = Math.floor(g.player.x / TILE), ty2 = Math.floor(g.player.y / TILE);
    if (ty2 === ab.corridorY && tx2 > ab.x && tx2 < ab.x + ab.w) return "主走廊";
    return null;
  }

  // 层级全名：编号 + 名字（"Level 37 —— 崇高"）
  function levelDisplayName(level) {
    // 红室这类 Level 0 的附属房间不在 LEVELS 里，要单独查
    const d = LEVELS[String(level)]
           || (typeof LEVEL0_ROOMS !== "undefined" ? LEVEL0_ROOMS[String(level)] : null)
           || (typeof LEVEL11_ROOMS !== "undefined" ? LEVEL11_ROOMS[String(level)] : null);
    if (!d) return "Level " + level;
    return (d.name || ("Level " + level));
  }

  function updateHud() {
    const g = game;
    renderHotbar();
    // HUD 上要显示层级本身的名称（"歇脚处"这种笼统叫法不显示）
    let lvTxt = levelDisplayName(g.level);
    const megRoom = g.map ? megRoomName(g) : null;
    if (megRoom) lvTxt += " · " + megRoom;

    if (isLevel(g, 5)) lvTxt += " · " + areaName(g);
    else if (String(g.level) === "0.7") {
      // 六个年代区域 —— 写清"第几个 / 共几个"，不然看不出这层到底有多深
      const tot = (g.map && g.map.eraCount) || 6;
      lvTxt += " · 区域 " + ((g.floor | 0) + 1) + " / " + tot;
      // 再挂一个常驻的方向：更深处那团黄雾在哪边。
      // 一张 78×78 的图，雾又缩在角落里 —— 不给方向就只能靠瞎撞。
      const zf = g.map && g.map.zoneFog;
      const z = zf && zf.find((q) => q.aZone === (g.floor | 0));
      if (z) {
        const dx = (z.aPos.x + 0.5) * TILE - g.player.x;
        const dy = (z.aPos.y + 0.5) * TILE - g.player.y;
        lvTxt += " · 更深→" +
          (Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? "东" : "西") : (dy > 0 ? "南" : "北"));
      } else lvTxt += " · 已是最深";
    }
    else if (g.map && g.map.doubleStory) lvTxt += (g.floor === 1 ? " · 下层" : " · 上层");
    // 无尽的终章：五十层，HUD 上要能看出自己在第几层
    else if (String(g.level) === "9223372036854775807") lvTxt += " · 第 " + ((g.floor | 0) + 1) + " 层";
    el.levelLabel.textContent = lvTxt;
    // 潜水信息（只在 Level 7 显示）
    const diving = isLevel(g, 7);
    if (el.dive) {
      if (diving) {
        show(el.dive);
        const d = playerDepth(g);
        el.diveDepth.textContent = Math.round(d) + " m";
        el.diveZone.textContent = inWater(g) ? depthZone(d).name : "入口房间";
        const air = Math.max(0, Math.round(g.air));
        el.diveAir.textContent = air + "%";
        el.diveAir.style.color = air > 35 ? "#dff3fa" : (air > 12 ? "#f0c46a" : "#f06a5a");
      } else hide(el.dive);
    }
    el.timeLabel.textContent = fmtTime(g.time);
    el.entitiesLabel.textContent = "实体：" + g.entities.length;
    if (isLevel(g, 9) && el.objective) {
      const mi = Math.floor(g.signMiles || 0);
      el.objective.textContent = "沿路牌行走：" + mi + " / " + (g.mileGoal || 0) + " 英里" +
        (g.onTrailT > 0 ? " · 方向正确" : "");
    }
    if (isLevel(g, 10) && el.objective) {
      const pct = Math.min(100, Math.round((g.trailDist || 0) / (CONFIG.FIELD_TRAIL_GOAL * TILE) * 100));
      el.objective.textContent = "沿泥土小径一直走：" + pct + "%";
    }
    if (isLevel(g, 70) && el.objective) {
      const bt = Math.round(g.bodyTemp == null ? 100 : g.bodyTemp);
      const where = g.indoorsNow ? "室内 · 暖" : "室外 · 冻";
      el.objective.textContent = "体温 " + bt + "% · " + where +
        (bt < 35 ? " —— 快找间屋子进去" : "");
    }
    el.flashlightLabel.textContent = "手电：" + (g.flashlight ? "开" : "关");
    if (el.flashlightLabel) el.flashlightLabel.classList.toggle("on", g.flashlight);
    if (el.btnFl) el.btnFl.classList.toggle("on", g.flashlight);
    el.archiveLabel.textContent = "档案 " + archiveTotal();
    el.staminaFill.style.width = Math.round(g.player.stamina) + "%";
    el.staminaFill.style.background = g.player.stamina > 30 ? "#8df06a" : "#f0a23a";
    updateVitalsHud(g);
  }

  // 生命 / 理智条（数值变了才写 DOM，避免每帧刷）
  let lastHp = -1, lastSan = -1, lastBad = -1;
  function updateVitalsHud(g) {
    const hp = Math.ceil(g.hp), san = Math.ceil(g.sanity), bad = g.badStacks.length;
    if (hp !== lastHp) {
      lastHp = hp;
      el.hpFill.style.width = Math.max(0, g.hp) + "%";
      el.hpNum.textContent = String(Math.max(0, hp));
      el.hpFill.style.background = g.hp > 45
        ? "linear-gradient(90deg,#d8483f,#ff8a6a)"
        : "linear-gradient(90deg,#8c1f18,#e0402f)";
    }
    if (san !== lastSan) {
      lastSan = san;
      el.sanFill.style.width = Math.max(0, g.sanity) + "%";
      el.sanNum.textContent = String(Math.max(0, san));
      el.sanFill.style.background = g.sanity > CONFIG.SANITY_LOW
        ? "linear-gradient(90deg,#4a7fd8,#7fd4ff)"
        : "linear-gradient(90deg,#6a3fa8,#b06adf)";
    }
    if (bad !== lastBad) {
      lastBad = bad;
      if (bad > 0) {
        el.badStacks.textContent = "污染 ×" + bad + " · 理智加速流失";
        show(el.badStacks);
      } else {
        hide(el.badStacks);
      }
    }
    // 悲尸循环：倒计时 + 理智条变红
    const w = g.wretch;
    const on = !!(w && w.active);
    if (on !== lastWretch) {
      lastWretch = on;
      el.vitals.classList.toggle("wretch-on", on);
      if (on) show(el.wretchTimer); else hide(el.wretchTimer);
    }
    if (on) {
      const sec = Math.ceil(w.left);
      if (sec !== lastWt) { lastWt = sec; el.wtNum.textContent = String(sec); }
    }
  }
  let lastWretch = false, lastWt = -1;

  // ---------- 渲染 ----------
  function render() {
    const g = game;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);

    if (!g || !g.map) return;

    const cam = getCamera();
    let shakeX = 0, shakeY = 0;
    if (g.phase === "playing") {
      const inten = visualThreat();
      if (inten > 0.15) {
        const s = Math.min(7, (inten - 0.15) * 8.5);
        shakeX = rand(-s, s); shakeY = rand(-s, s);
      }
    } else if (g.phase === "dying") {
      const s = g.deathTimer * 22;
      shakeX = rand(-s, s); shakeY = rand(-s, s);
    }
    // 层级坍塌：整屏震动（Level 0.2 的环境危害）
    if (g.collapseLeft > 0) {
      const s = 7 * (g.collapseLeft / CONFIG.COLLAPSE_DUR);
      shakeX += rand(-s, s); shakeY += rand(-s, s);
    }

    ctx.save();
    ctx.translate(W / 2 + shakeX, H / 2 + shakeY);
    ctx.scale(cam.scale, cam.scale);
    ctx.translate(-cam.x, -cam.y);

    gTimeRef = g.time;
    // 当前楼层：Level 0.7 忆域按楼层取年代配色，绘制那边读这个值
    window.__gFloor = (g && typeof g.floor === "number") ? g.floor : 0;
    // 地图最外层之外一律是黑的 —— 先把整个视野压成黑底，再往上画，
    // 这样无论相机怎么移动、地图多大，都不会露出画布外的内容。
    {
      const vl = cam.x - cam.viewW / 2 - 4, vt = cam.y - cam.viewH / 2 - 4;
      ctx.fillStyle = "#000";
      ctx.fillRect(vl, vt, cam.viewW + 8, cam.viewH + 8);
    }
    // Level 63 / 30 / 63.3 共用一套悬空背景：整片天空与浮云必须画在瓦片之前 ——
    // 桥、岛、栈道画在云之上，云从缝隙间透出来，才像悬在空中。
    // 63.3 用同一套画法换成夜紫天 + 繁星，睡醒后是厚云。
    // 墙格只留一层几乎透明的空气色，不再逐格铺一层"蓝色的地面"。
    if ((String(g.level) === "63" || String(g.level) === "30" || String(g.level) === "63.3") && window.drawSky63Sky) {
      try { window.drawSky63Sky(ctx, g, cam); } catch (e) { /* 忽略 */ }
    }
    drawMapTiles(ctx, g.map, cam, g.level, g.floor);
    if (g.map.level === 3) { drawLeaks(ctx, g, cam); drawStation(ctx, g, cam); }
    drawBars(ctx, g, cam);
    drawRamps(ctx, g, cam);
    drawBlackFog(ctx, g, cam);
    drawOffice(ctx, g, cam);
    drawSteam(ctx, g, cam);
    if (isLevel(g, 5)) { drawHotelProps(ctx, g, cam); drawRadio(ctx, g, cam); }
    if (isLevel(g, 7)) drawOceanExtras(ctx, g, cam);
    if (isLevel(g, 8)) drawCaveExtras(ctx, g, cam);
    if (isLevel(g, "hub")) drawHubExtras(ctx, g, cam);
    if (isLevel(g, 11)) drawCityExtras(ctx, g, cam);
    if (isLevel(g, 14)) drawL14Child(ctx, g);
    if (isLevel(g, 9)) drawSuburbExtras(ctx, g, cam);
    drawWeather(ctx, g, cam);
    drawProps(ctx, g, cam);        // 场景装饰：破损的箱子 / 桌子
    try { drawNewProps(ctx, g, cam); } catch (e) { /* 忽略 */ }   // 新层级的物件
    try { drawBatchProps(ctx, g, cam); } catch (e) { /* 忽略 */ } // 1.2.0 批次：各层专属模型
    try { drawNewAmbient(ctx, g, cam); } catch (e) { /* 忽略 */ } // 37.1 的红光
    try { drawNewSpawnPts(ctx, g, cam); } catch (e) { /* 忽略 */ } // 终末：刷怪点
    try { drawCarriedBooks(ctx, g); } catch (e) { /* 忽略 */ }    // 手上拿着的书
    drawLevelExtras(ctx, g, cam);  // 树 / 幻觉 / 机器 / 尸体 / 车 / 水池
    if (isLevel(g, 1)) drawParkingExtras(ctx, g, cam);   // 停车场的柱与线（两层都是停车场）
    drawIceExtras(ctx, g, cam);                          // Level 0.3：通风口喷出的霜雾
    drawGrassFog(ctx, g, cam);                           // Level 4：草地周围的黑雾
    drawGroundItems(ctx, g, cam);  // 地上的杏仁水 / 撬棍
    drawCrates(ctx, g, cam);       // 补给箱（要撬）
    drawExit(ctx, g.map, g.time, g.floor);
    drawDoors(ctx, g, cam);
    for (const e of g.entities) {
      if ((e.floor | 0) !== g.floor) continue; // 只画同层的实体
      e.draw(ctx, g, cam);
    }
    {
      // Level 994：被海浪碰到之后身体越来越透明
      const fade = (g && typeof g.tideFade === "number") ? g.tideFade : 0;
      if (fade > 0) { ctx.save(); ctx.globalAlpha = Math.max(0, 1 - fade); }
      // Level !：病床画在玩家之前（人被床挡住才对）
      if (window.drawBangGurneys && String(g.level) === "bang") window.drawBangGurneys(ctx, g);
      // Level 7：骑上水上摩托之后，车画在人身上（俯视：人跨坐在车座上）
      if (window.JET29_DRAW && isLevel(g, 7)) window.JET29_DRAW(ctx, g, cam);
      drawPlayer(ctx, g.player, g.time, g);
      if (fade > 0) ctx.restore();
    }
    drawRemotePlayers(ctx, g, cam);
    drawArchives(ctx, g, g.time);
    drawDebris(ctx, g);

    // 下层：整体压暗并偏冷，和上层明显区分
    // （忆域不是上下层 —— 它是六个首尾相接的年代区域，以前被这行误判成"下层"，
    //   结果区域 2 凭空多了一层冷蓝，看着像是另一个地方。）
    if (g.floor === 1 && g.map.doubleStory && String(g.level) !== "0.7") {
      ctx.fillStyle = "rgba(14,24,38,0.32)";
      ctx.fillRect(cam.x - cam.viewW / 2, cam.y - cam.viewH / 2, cam.viewW, cam.viewH);
    }

    // 迷雾（每帧重建：未探索=黑，已探索=暗，当前视野=擦亮）
    drawFog(g, cam);
    // 灯具本身要在迷雾之后画 —— 画在之前的话整块都被压暗盖掉，根本看不见
    try { drawNewLampFixtures(ctx, g, cam); } catch (e) { /* 忽略 */ }
    // 忆域：更深处那团黄雾的信标（画在迷雾之后，不然会被一起压黑）
    try { drawZoneBeacon(ctx, g, cam); } catch (e) { /* 忽略 */ }
    // Level 1 花园段：东北角尽头那团绿光，同样要画在迷雾之后
    try { drawGardenGlowBeacon(ctx, g, cam); } catch (e) { /* 忽略 */ }
    // 迷雾画布现在正好对应这一屏视野，按 1 雾像素 = 1 设备像素贴回去，
    // 不再从整张世界地图里裁一块放大十几倍；平滑插值只用来兜住零头。
    ctx.imageSmoothingEnabled = true;
    const left = cam.x - cam.viewW / 2;
    const top = cam.y - cam.viewH / 2;
    if (g.fog.width > 2 && g.fog.height > 2) {
      ctx.drawImage(g.fog, 0, 0, g.fog.width, g.fog.height,
        left, top, g.fog.width / FOG_SCALE, g.fog.height / FOG_SCALE);
    }

    // 郊区的午夜：整片压上一层夜色（手电光柱画在它之上，仍然看得见）
    if (isLevel(g, 9)) {
      ctx.fillStyle = "rgba(8,12,26," + CONFIG.SUBURB_NIGHT.toFixed(2) + ")";
      ctx.fillRect(cam.x - cam.viewW / 2, cam.y - cam.viewH / 2, cam.viewW, cam.viewH);
    }
    drawSuburbFog(ctx, g, cam);
    // 手电光柱（画在迷雾之上，光本身也可见）
    drawFlashBeam(ctx, g);
    // Level 0 熄灯区不画任何信标：整片区域一盏灯、一缕光都没有。
    // Level 6：墙壁记忆（点在墙上、线连成墙的轮廓），画在迷雾之上才看得见
    if (isLevel(g, 6)) { drawMemory(ctx, g); drawDarkSelf(ctx, g); }
    ctx.restore();

    // 刷新中的实体：扫描线与雪花噪点穿透迷雾（黑暗中也能看到"成形"）
    for (const e of g.entities) e.drawSpawnFx(ctx, g, cam);

    // 档案微光（穿透迷雾，提示收集物位置）
    drawArchiveGlows(g, cam);

    // 荧光灯闪烁的全屏变暗
    if (g.flickerLeft > 0 && g.flicker < 0.9) {
      ctx.fillStyle = "rgba(0,0,0," + ((0.9 - g.flicker) * 0.5).toFixed(3) + ")";
      ctx.fillRect(0, 0, W, H);
    }
    // 坍塌时的灰尘：屏幕泛起一层灰
    if (g.collapseLeft > 0) {
      const a = 0.22 * (g.collapseLeft / CONFIG.COLLAPSE_DUR);
      ctx.fillStyle = "rgba(168,152,120," + a.toFixed(3) + ")";
      ctx.fillRect(0, 0, W, H);
    }

    // 危险红色晕影
    if (g.phase === "playing") drawDangerVignette();

    // 死亡红闪
    if (g.phase === "dying") {
      const a = Math.min(1, g.deathTimer * 0.9);
      ctx.fillStyle = "rgba(150,0,0," + (a * 0.55).toFixed(3) + ")";
      ctx.fillRect(0, 0, W, H);
    }

    // 各层级的整体色调
    drawLevelTint(g);
    // Level 11 医院：一圈淡淡的绿光 + 一个绿十字，说明"这里在给你治"
    function drawHospitalGlow(g) {
      if (!g || !g.inHospital) return;
      const t = performance.now() / 1000;
      const a = 0.10 + 0.05 * Math.sin(t * 2.4);
      const grd = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.30,
        W / 2, H / 2, Math.max(W, H) * 0.72);
      grd.addColorStop(0, "rgba(0,0,0,0)");
      grd.addColorStop(1, "rgba(60,220,150," + a.toFixed(3) + ")");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);
      ctx.save();
      ctx.globalAlpha = 0.55 + 0.25 * Math.sin(t * 2.4);
      ctx.fillStyle = "#2ec87a";
      const s = 9, cx = W - 46, cy = 40;
      ctx.fillRect(cx - s / 2, cy - s * 1.6, s, s * 3.2);
      ctx.fillRect(cx - s * 1.6, cy - s / 2, s * 3.2, s);
      ctx.restore();
    }
    // 常驻暗角 + 理智过低时的幻觉（画面收缩、发紫、噪点）
    drawVignette();
    drawUnderwater(g);
    try { if (window.drawPool37Fx && (String(g.level) === "37" || String(g.level) === "37.1")) window.drawPool37Fx(ctx, g, cam); } catch (e) { /* 忽略 */ }
    try { if (window.drawDereal && String(g.level) === "30") window.drawDereal(ctx, g); } catch (e) { /* 忽略 */ }
    // Level 78：站外那个「直抵群星」正在靠近（白光 + 一圈彩虹）
    try { if (window.drawStation && String(g.level) === "78") window.drawStation(ctx, g); } catch (e) { /* 忽略 */ }
    try { if (window.drawMall33 && String(g.level) === "33") window.drawMall33(ctx, g); } catch (e) { /* 忽略 */ }
    // Level 26：暖黄氛围 / 转化房间（一间平时进不去的屋子）
    try { if (window.drawL26 && String(g.level) === "26") window.drawL26(ctx, g); } catch (e) { /* 忽略 */ }
    // 1.6.0：67 欲望烘焙坊 / 31 旱冰场 / 40 摇滚披萨 / 94 动画
    try { if (window.drawBakery67 && String(g.level) === "67") window.drawBakery67(ctx, g); } catch (e) { /* 忽略 */ }
    try { if (window.drawRink31 && String(g.level) === "31") window.drawRink31(ctx, g); } catch (e) { /* 忽略 */ }
    try { if (window.drawRock40 && String(g.level) === "40") window.drawRock40(ctx, g); } catch (e) { /* 忽略 */ }
    try { if (window.drawAnime94 && String(g.level) === "94") window.drawAnime94(ctx, g); } catch (e) { /* 忽略 */ }
    // 1.7.0：Level 29 海波利亚 / Level 284 需汝之地
    try { if (window.drawIsle29 && String(g.level) === "29") window.drawIsle29(ctx, g); } catch (e) { /* 忽略 */ }
    try { if (window.drawRiver284 && String(g.level) === "284") window.drawRiver284(ctx, g); } catch (e) { /* 忽略 */ }
    try { if (window.drawSpring27 && String(g.level) === "27") window.drawSpring27(ctx, g); } catch (e) { /* 忽略 */ }
    try { if (window.drawVirtue28 && String(g.level) === "28") window.drawVirtue28(ctx, g); } catch (e) { /* 忽略 */ }
    try { if (window.drawCheat363Overlay && String(g.level) === "363") window.drawCheat363Overlay(ctx, g); } catch (e) { /* 忽略 */ }
    // 注意：相机是 getCamera() 现算的，并不挂在 game 上（g.cam 一直是 undefined），
    // 所以这两个整屏叠加必须把 cam 传进去 —— 以前它们自己取 g.cam，取到空值后
    // 就退化成"以屏幕中心为原点"，雾和核心全画错了位置。
    try { if (window.drawShatteredOverlay && String(g.level) === "shattered") window.drawShatteredOverlay(ctx, g, cam); } catch (e) { /* 忽略 */ }
    try { if (window.drawPain && String(g.level) === "pain") window.drawPain(ctx, g, cam); } catch (e) { /* 忽略 */ }
    // Level 45：站在停电的楼里就是黑的；站在防火梯上是无重力的冷色
    try { if (window.drawAbyss45 && String(g.level) === "45") window.drawAbyss45(ctx, g); } catch (e) { /* 忽略 */ }
    // Level 599：恒星内部 —— 整屏都在翻滚
    try { if (window.drawStar599 && String(g.level) === "599") window.drawStar599(ctx, g); } catch (e) { /* 忽略 */ }
    // 1.3.1 批次：层级自己的整屏叠加（黄昏 / 星空 / 沙暴 / 昼夜 / 筹码栏）
    try {
      if (window.__LEVEL_OVERLAY) {
        const ov = window.__LEVEL_OVERLAY[String(g.level)];
        if (ov) ov(ctx, g, cam);
      }
    } catch (e) { /* 忽略 */ }
    drawGardenVines(g);
    drawHospitalGlow(g);
    drawCorridor11(g);
    // Level 15.1：正在模拟时，整个屏幕都被换掉（由 level15.1.js 自己画）
    if (window.drawSimOverlay) { try { window.drawSimOverlay(g, ctx, W, H); } catch (e) { /* 忽略 */ } }
    drawInsanity(g);
    // 悲尸循环：花屏越来越重；彻底变成悲尸后画面完全花掉
    drawGlitch(g);
    // Level 6：楼梯口那盏快没电的应急灯余光，只有走近才看得见
    drawExitEmber6(g, cam);
    // Level 4 不画方位信标／边缘箭头：那是当初为找电梯自作主张加的，档案里没有，
    // Level 4 原本也一直不该有。电梯只靠门体本身的发光（见 drawOfficeElevator）。
    // Level 6：手电在这里失灵，改用雷达（屏幕坐标画，不受相机缩放影响）
    drawRadar(g);
    // 这里原本有一层「通用出口罗盘」：出口在视野外时，屏幕边缘给箭头和距离。
    // 已撤掉 —— 它凌驾于场景之上，把在黑暗里摸路变成了照着 HUD 走，
    // 也抹平了熄灯层、必死层本该有的迷失感。各层的光、雷达与专属信标保留。
    // Level 7：骑着水上摩托出海 —— 屏幕上方那条里程
    try { if (window.JET29_HUD) window.JET29_HUD(ctx, g, W, H, DPR); } catch (e) { /* 忽略 */ }
    // 摄像机录像中：整屏降画质 + 花屏（悲尸循环那一套），且不画任何 UI
    try { if (window.CamRec) CamRec.overlay(ctx, canvas, g); } catch (e) { /* 忽略 */ }
  }

  // ---------- Level 6：楼梯口的余光 ----------
  // 熄灯层按档案是「彻底黑暗与绝对寂静」：迷雾在渲染早期就 return 了，
  // 手电也失效，通用「出口灯塔」那圈光根本擦不出来 —— 所以出口以前一点光都没有。
  // 这里不放大范围灯塔（会破坏设定），只在贴近楼梯时画一小圈快没电的琥珀余光，
  // 让「出口有光」成立；画在迷雾之后、雷达之前，用的是屏幕坐标，不受相机缩放影响。
  function drawExitEmber6(g, cam) {
    if (!isLevel(g, 6) || g.phase !== "playing" || !g.map || !g.map.stairs) return;
    const st = g.map.stairs;
    const wx = (st.x + 0.5) * TILE, wy = (st.y + 0.5) * TILE;
    const d = Math.hypot(wx - g.player.x, wy - g.player.y) / TILE;
    if (d > 7) return;                       // 远了就一点都看不见
    const k = Math.min(1, (7 - d) / 5);      // 越近越亮
    const sx = (wx - cam.x) * cam.scale + W / 2;
    const sy = (wy - cam.y) * cam.scale + H / 2;
    const r = TILE * cam.scale * (0.7 + 0.5 * k);
    const beat = 0.65 + 0.35 * Math.sin(g.time * 2.2);
    ctx.save();
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 3.2);
    grd.addColorStop(0, "rgba(255,198,110," + (0.58 * k * beat).toFixed(3) + ")");
    grd.addColorStop(0.45, "rgba(255,170,80," + (0.24 * k * beat).toFixed(3) + ")");
    grd.addColorStop(1, "rgba(255,150,60,0)");
    ctx.fillStyle = grd;
    ctx.beginPath(); ctx.arc(sx, sy, r * 3.2, 0, Math.PI * 2); ctx.fill();
    // 楼梯口正中那点灯芯
    ctx.fillStyle = "rgba(255,236,186," + (0.88 * k * beat).toFixed(3) + ")";
    ctx.beginPath(); ctx.arc(sx, sy, Math.max(1.6, r * 0.16), 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  /* ===== 已移除：Level 4 方位信标（屏幕边缘箭头 + 距离、穿墙光柱）=====
  这套东西是当初为了「电梯找不到」自作主张加的 —— 档案里没有，Level 4 原本
  也一直不该有箭头。调用点已删，下面整段不再编译；电梯只靠门体本身的发光
  （drawOfficeElevator）和出口灯塔在迷雾里擦出的那点光。以下仅留档。
  // 88×88 的办公楼里两处出路都缩在远处房间里，不给方向就只能挨个房间瞎撞。
  // 画在迷雾之后、所有图层之上（屏幕坐标）：在视野里是一束穿墙光柱；
  // 在视野外是屏幕边缘的箭头 + 距离。电梯金色、楼梯井冷蓝，一眼分得清去哪层。
  function drawElevator4Beacon(g, cam) {
    if (String(g.level) !== "4" || g.phase !== "playing") return;
    const m = g.map;
    if (!m) return;
    const targets = [];
    if (m.elevator) targets.push({ p: m.elevator, name: "电梯", rgb: "255,206,96", idx: 0 });
    if (m.stairwell) targets.push({ p: m.stairwell, name: "楼梯井", rgb: "140,205,255", idx: 1 });
    for (const tg of targets) drawOne4Beacon(g, cam, tg);
  }

  function drawOne4Beacon(g, cam, tg) {
    const ev = tg.p, rgb = tg.rgb;
    const wx = (ev.x + 0.5) * TILE, wy = (ev.y + 0.5) * TILE;
    const wdx = wx - g.player.x, wdy = wy - g.player.y;
    const d = Math.hypot(wdx, wdy) / TILE;
    if (d < 2.2) return;                       // 已经站在门口，不用再指
    const dir = Math.abs(wdx) >= Math.abs(wdy) ? (wdx > 0 ? "东" : "西") : (wdy > 0 ? "南" : "北");
    const label = tg.name + " " + dir + " · " + Math.round(d) + " 格";
    const t = g.time, pulse = 0.5 + 0.5 * Math.sin(t * 1.9);
    const sx = (wx - cam.x) * cam.scale + W / 2;
    const sy = (wy - cam.y) * cam.scale + H / 2;
    const inView = sx > -40 && sx < W + 40 && sy > -40 && sy < H + 40;
    ctx.save();
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.globalCompositeOperation = "lighter";
    if (inView) {
      const R = TILE * cam.scale * (1.4 + pulse * 0.7);
      const gr = ctx.createRadialGradient(sx, sy, 1, sx, sy, R);
      gr.addColorStop(0, "rgba(" + rgb + "," + (0.22 + 0.16 * pulse).toFixed(3) + ")");
      gr.addColorStop(1, "rgba(" + rgb + ",0)");
      ctx.fillStyle = gr;
      ctx.beginPath(); ctx.arc(sx, sy, R, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 0.10 + 0.08 * pulse;
      ctx.fillStyle = "rgba(" + rgb + ",1)";
      ctx.fillRect(sx - 2, sy - TILE * cam.scale * 2.4, 4, TILE * cam.scale * 4.8);
      ctx.globalAlpha = 1;
      // 光柱旁挂一行方位，画在迷雾之上，深色描边保证在地板上也读得清
      ctx.globalCompositeOperation = "source-over";
      ctx.font = "bold 11px system-ui, sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      const ly = sy - TILE * cam.scale * 2.6 - tg.idx * 15;
      ctx.strokeStyle = "rgba(30,22,6,0.9)"; ctx.lineWidth = 3;
      ctx.strokeText(label, sx, ly);
      ctx.fillStyle = "rgba(" + rgb + ",0.98)";
      ctx.fillText(label, sx, ly);
    } else {
      // 不在视野里：在屏幕边缘朝它的方向画一个实色箭头
      const dx = sx - W / 2, dy = sy - H / 2;
      const ang = Math.atan2(dy, dx);
      // 往里收一点：原来箭头能贴到 y=40，正好落进顶部那排 HUD 按钮里
      const rx = W / 2 - 52, ry = H / 2 - 96;
      const k = Math.min(rx / Math.max(0.001, Math.abs(Math.cos(ang))),
                         ry / Math.max(0.001, Math.abs(Math.sin(ang))));
      const ax = W / 2 + Math.cos(ang) * k, ay = H / 2 + Math.sin(ang) * k;
      // 用实心色而不是 lighter：叠在亮灰地板上会被洗成白色，看着像 UI 噪点
      ctx.globalCompositeOperation = "source-over";
      ctx.save();
      ctx.translate(ax, ay); ctx.rotate(ang);
      ctx.fillStyle = "rgba(" + rgb + ",0.96)";
      ctx.strokeStyle = "rgba(52,36,8,0.9)";
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(-7, -7); ctx.lineTo(-7, 7); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.restore();
      ctx.font = "bold 11px system-ui, sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      const tx4 = Math.max(78, Math.min(W - 78, ax));
      const in4 = Math.sin(ang) >= 0 ? -1 : 1;
      const ly2 = Math.max(100, Math.min(H - 30, ay + in4 * (20 + tg.idx * 15)));
      ctx.strokeStyle = "rgba(30,22,6,0.9)"; ctx.lineWidth = 3;
      ctx.strokeText(label, tx4, ly2);
      ctx.fillStyle = "rgba(" + rgb + ",0.98)";
      ctx.fillText(label, tx4, ly2);
    }
    ctx.restore();
  }
  ===== Level 4 方位信标留档段结束 ===== */

  // ---------- 通用出口罗盘：已移除 ----------
  // 方向指引交回各层自己（光 / 雷达 / 专属信标），不再做系统级边缘箭头与距离文字。

  // ---------- Level 6：雷达 ----------
  // 熄灯层级里手电是废的，雷达代替它：屏幕下方一小块，显示周围几格的地形与实体。
  // 出口是 props 里的 stairs7（map.exit 为 null），所以雷达单独把它标出来。
  const RADAR_R = 8;                    // 半径（格）
  function drawRadar(g) {
    if (!isLevel(g, 6) || g.phase !== "playing") return;
    const m = g.map;
    if (!m) return;
    const grid = m.layers ? m.layers[g.floor | 0] : null;
    if (!grid) return;

    const size = Math.min(230, W * 0.3);
    const cell = size / (RADAR_R * 2 + 1);
    const bx = W / 2 - size / 2;
    const by = H - size - 18 - (touchMode ? 96 : 0);

    ctx.save();
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    // 底板
    ctx.fillStyle = "rgba(6,12,16,0.86)";
    ctx.fillRect(bx - 6, by - 16, size + 12, size + 26);
    ctx.strokeStyle = "rgba(120,220,180,0.45)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bx - 6.5, by - 16.5, size + 13, size + 27);
    ctx.fillStyle = "rgba(150,235,195,0.85)";
    ctx.font = "bold 11px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("雷达 · 熄灯", bx - 2, by - 4);

    const ptx = Math.floor(g.player.x / TILE), pty = Math.floor(g.player.y / TILE);
    // 地形：玩家记得的 / 雷达扫到的
    for (let dy = -RADAR_R; dy <= RADAR_R; dy++) {
      for (let dx = -RADAR_R; dx <= RADAR_R; dx++) {
        const tx = ptx + dx, ty = pty + dy;
        if (tx < 0 || ty < 0 || tx >= m.size || ty >= m.size) continue;
        const px = bx + (dx + RADAR_R) * cell, py = by + (dy + RADAR_R) * cell;
        if (grid[ty][tx] === 1) {
          ctx.fillStyle = "rgba(96,116,132,0.85)";
        } else {
          ctx.fillStyle = "rgba(40,86,72,0.72)";
        }
        ctx.fillRect(px, py, cell - 0.6, cell - 0.6);
      }
    }
    // 扫描线：一圈慢慢转的亮线，像真的雷达
    const ang = (g.time * 1.5) % (Math.PI * 2);
    ctx.save();
    ctx.beginPath();
    ctx.rect(bx, by, size, size);
    ctx.clip();
    ctx.translate(bx + size / 2, by + size / 2);
    ctx.rotate(ang);
    ctx.fillStyle = "rgba(140,255,200,0.16)";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, size, -0.42, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 实体：红点（带脉动）
    const pulse = 0.55 + 0.45 * Math.sin(g.time * 6);
    for (const e of g.entities) {
      if ((e.floor | 0) !== (g.floor | 0)) continue;
      const dx = e.x / TILE - g.player.x / TILE;
      const dy = e.y / TILE - g.player.y / TILE;
      if (Math.abs(dx) > RADAR_R + 1 || Math.abs(dy) > RADAR_R + 1) continue;
      const px = bx + (dx + RADAR_R) * cell, py = by + (dy + RADAR_R) * cell;
      ctx.fillStyle = "rgba(255,70,60," + (0.55 + pulse * 0.45).toFixed(3) + ")";
      ctx.beginPath();
      ctx.arc(px + cell / 2, py + cell / 2, Math.max(2.4, cell * 0.52), 0, Math.PI * 2);
      ctx.fill();
    }
    // 出口：熄灯层里画面一点光都擦不出来（迷雾在 Level 6 提前 return），
    // 楼梯口又是 props 里的 stairs7 而不是 map.exit —— 通用「出口灯塔」照不到它。
    // 所以出口的指引全部交给雷达：范围内画琥珀色脉冲菱形，超出范围在边缘画指向箭头。
    const st = g.map.stairs;
    if (st && (st.floor | 0) === (g.floor | 0)) {
      const ex = st.x + 0.5 - g.player.x / TILE;
      const ey = st.y + 0.5 - g.player.y / TILE;
      const dist = Math.hypot(ex, ey);
      const beat = 0.6 + 0.4 * Math.sin(g.time * 4);
      const cxm = bx + size / 2, cym = by + size / 2;
      ctx.save();
      ctx.beginPath(); ctx.rect(bx, by, size, size); ctx.clip();
      if (Math.abs(ex) <= RADAR_R && Math.abs(ey) <= RADAR_R) {
        const px = bx + (ex + RADAR_R) * cell, py = by + (ey + RADAR_R) * cell;
        ctx.fillStyle = "rgba(255,196,86," + (0.10 + 0.17 * beat).toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(px, py, cell * (1.0 + 0.55 * beat), 0, Math.PI * 2);
        ctx.fill();
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(Math.PI / 4);
        const s = Math.max(4, cell * 0.36);
        ctx.fillStyle = "rgba(255,214,120,0.95)";
        ctx.fillRect(-s, -s, s * 2, s * 2);
        ctx.strokeStyle = "rgba(255,246,214,0.95)";
        ctx.lineWidth = 1.2;
        ctx.strokeRect(-s, -s, s * 2, s * 2);
        ctx.restore();
      } else {
        // 出口还在扫描半径外：边缘一个朝它指的三角，不至于让人瞎转
        const a = Math.atan2(ey, ex);
        const rr = size * 0.43;
        ctx.save();
        ctx.translate(cxm + Math.cos(a) * rr, cym + Math.sin(a) * rr);
        ctx.rotate(a);
        ctx.fillStyle = "rgba(255,208,110," + (0.62 + 0.38 * beat).toFixed(3) + ")";
        ctx.beginPath();
        ctx.moveTo(10, 0); ctx.lineTo(-6, -6.5); ctx.lineTo(-6, 6.5);
        ctx.closePath(); ctx.fill();
        ctx.restore();
      }
      ctx.restore();
      // 标题行右侧：出口距离，随时知道还差多远
      ctx.fillStyle = "rgba(255,216,132,0.95)";
      ctx.font = "bold 10px system-ui, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("◆ 出口 → Level 7 · " + Math.round(dist) + " 格", bx + size + 2, by - 4);
      ctx.textAlign = "left";
    }
    // 玩家：中心一个亮点
    ctx.fillStyle = "rgba(200,255,235,0.95)";
    ctx.beginPath();
    ctx.arc(bx + size / 2, by + size / 2, Math.max(2.6, cell * 0.5), 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(120,220,180,0.6)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(bx + size / 2, by + size / 2, size * 0.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  let gTimeRef = 0;
  // ---- Level 7：海面 / 房子里的积水 / 海底岩床 / 潜艇 ----
  function drawSeaTile(ctx, px, py, h, t) {
    ctx.fillStyle = "#123a63";
    ctx.fillRect(px, py, TILE, TILE);
    // 起伏的波光：一层层横向的浅色条纹，慢慢晃
    for (let i = 0; i < 3; i++) {
      const yy = py + 6 + i * 12 + Math.sin(t * 0.9 + px * 0.05 + i) * 2.2;
      ctx.fillStyle = "rgba(120,190,255," + (0.10 + 0.05 * i).toFixed(3) + ")";
      ctx.fillRect(px, yy, TILE, 3);
    }
    // 零星的深色波纹
    if (h > 0.86) {
      ctx.fillStyle = "rgba(10,30,60,0.35)";
      ctx.fillRect(px + 4, py + 8, TILE - 10, 4);
    }
  }
  function drawBoardwalk(ctx, px, py, h, dark) {
    // 棕色的木板：横向铺，板与板之间有缝
    ctx.fillStyle = dark ? "#3b2a1c" : "#6b4b2a";
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = dark ? "#2e2015" : "#7d5932";
    for (let i = 0; i < 3; i++) ctx.fillRect(px + 1, py + i * 13 + 1, TILE - 2, 10);
    ctx.strokeStyle = "rgba(0,0,0,0.45)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px, py + 12.5); ctx.lineTo(px + TILE, py + 12.5);
    ctx.moveTo(px, py + 25.5); ctx.lineTo(px + TILE, py + 25.5);
    ctx.stroke();
    // 钉子
    ctx.fillStyle = "rgba(20,16,12,0.7)";
    ctx.fillRect(px + 3, py + 3, 2, 2);
    ctx.fillRect(px + TILE - 6, py + TILE - 6, 2, 2);
    if (dark) {   // 发黑的补丁：像被水泡烂了，下面可能藏着东西
      ctx.fillStyle = "rgba(10,8,6,0.5)";
      ctx.fillRect(px, py, TILE, TILE);
      if (h > 0.5) { ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.fillRect(px + 6, py + 8, TILE - 14, 6); }
    }
  }
  function drawSeabed(ctx, px, py, h) {
    ctx.fillStyle = "#2b3a3a";
    ctx.fillRect(px, py, TILE, TILE);
    // 沙与碎石
    ctx.fillStyle = "rgba(120,130,110," + (0.10 + h * 0.10).toFixed(3) + ")";
    ctx.fillRect(px, py, TILE, TILE);
    if (h > 0.72) {
      ctx.fillStyle = "rgba(30,40,38,0.55)";
      ctx.beginPath(); ctx.arc(px + 12, py + 16, 5, 0, Math.PI * 2); ctx.fill();
    }
  }
  function drawReef(ctx, px, py, h) {
    ctx.fillStyle = "#1d2626";
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = "#333f3a";
    ctx.beginPath(); ctx.arc(px + TILE / 2, py + TILE / 2, 13 + h * 5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(90,120,110,0.35)";
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }
  // 黄色的微型潜艇
  function drawSubmarine(ctx, cx, cy, t) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath(); ctx.ellipse(0, 9, 26, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#e8c021";
    ctx.beginPath(); ctx.ellipse(0, 0, 24, 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#8a6d10"; ctx.lineWidth = 2; ctx.stroke();
    // 舷窗
    ctx.fillStyle = "#22415e";
    ctx.beginPath(); ctx.arc(-9, -2, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(190,235,255,0.5)";
    ctx.beginPath(); ctx.arc(-10, -3.4, 1.7, 0, Math.PI * 2); ctx.fill();
    // 指挥塔
    ctx.fillStyle = "#e8c021";
    ctx.fillRect(-5, -18, 10, 9);
    ctx.strokeStyle = "#8a6d10"; ctx.lineWidth = 1.6; ctx.strokeRect(-5, -18, 10, 9);
    // 尾舵
    ctx.fillStyle = "#c9a318";
    ctx.beginPath();
    ctx.moveTo(20, -4); ctx.lineTo(30, -10); ctx.lineTo(30, 8); ctx.lineTo(20, 4);
    ctx.closePath(); ctx.fill();
    // 微微上下浮
    ctx.restore();
  }

  // ---- Level 18：幼儿园 / 日托所 ----
  function drawDaycareFloor(ctx, px, py, h, tx, ty) {
    // 彩色的地垫：一格一块柔和的颜色
    const pal = ["#f3d9a4", "#d8e8c8", "#f0c9c0", "#cfe0f0", "#eadcf0"];
    const c = pal[(tx * 3 + ty * 5) % pal.length];
    ctx.fillStyle = c;
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = "rgba(0,0,0,0.08)";
    ctx.fillRect(px, py + TILE - 2, TILE, 2);
    if (h > 0.8) { ctx.fillStyle = "rgba(255,255,255,0.25)"; ctx.fillRect(px + 6, py + 8, 10, 3); }
  }
  function drawDaycareWall(ctx, px, py, h) {
    ctx.fillStyle = "#f6efe2";
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = "rgba(210,190,150,0.35)";
    ctx.fillRect(px, py, TILE, 4);
    // 墙上贴着的儿童画
    if (h > 0.6) {
      ctx.fillStyle = "#fffdf6";
      ctx.fillRect(px + 7, py + 10, 26, 20);
      ctx.strokeStyle = ["#e08a6a", "#7fa8d8", "#8fc08a"][Math.floor(h * 3) % 3];
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(px + 11, py + 24); ctx.lineTo(px + 18, py + 14); ctx.lineTo(px + 27, py + 24);
      ctx.stroke();
    }
  }
  // 毛绒恐龙：友善，会带着补给出现
  function drawPlushDino(ctx, x, y, t) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.beginPath(); ctx.ellipse(0, 10, 15, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#7fc98a";
    ctx.beginPath(); ctx.ellipse(0, 2, 14, 11, 0, 0, Math.PI * 2); ctx.fill();     // 身子
    ctx.beginPath(); ctx.ellipse(-11, -9, 8, 7, 0, 0, Math.PI * 2); ctx.fill();   // 头
    ctx.fillStyle = "#5aa86a";
    ctx.beginPath();
    ctx.moveTo(-2, -2); ctx.lineTo(6, -8); ctx.lineTo(8, -1); ctx.closePath(); ctx.fill();  // 背刺
    ctx.fillStyle = "#2b3a2b";
    ctx.beginPath(); ctx.arc(-14, -11, 1.9 + Math.sin(t * 2) * 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  // ---- Level 21：编号门 ----
  function drawNumberedFloor(ctx, px, py, h, map, tx, ty) {
    const tk = tx + "," + ty;
    // 白色瓷砖地面：整层都是白的，不是铁板，也不是枢纽那种沥青
    if (map.plaza && map.plaza.has(tk)) {          // 广场：更亮一点的方砖
      ctx.fillStyle = "#f2f4f6";
      ctx.fillRect(px, py, TILE, TILE);
      ctx.strokeStyle = "rgba(120,130,140,0.35)";
      ctx.lineWidth = 1;
      ctx.strokeRect(px + 0.5, py + 0.5, TILE - 1, TILE - 1);
      ctx.strokeStyle = "rgba(120,130,140,0.18)";
      ctx.beginPath();
      ctx.moveTo(px + TILE / 2, py); ctx.lineTo(px + TILE / 2, py + TILE);
      ctx.moveTo(px, py + TILE / 2); ctx.lineTo(px + TILE, py + TILE / 2);
      ctx.stroke();
    } else {                                        // 走廊：白色瓷砖
      ctx.fillStyle = "#e8ecf0";
      ctx.fillRect(px, py, TILE, TILE);
      ctx.strokeStyle = "rgba(120,130,140,0.30)";
      ctx.lineWidth = 1;
      ctx.strokeRect(px + 0.5, py + 0.5, TILE - 1, TILE - 1);
      // 交替的接缝，别让整片白看起来像一块塑料
      ctx.fillStyle = "rgba(150,160,170,0.20)";
      ctx.fillRect(px, py + (tx % 2) * 18, TILE, 18);
    }
    ctx.fillStyle = "rgba(16,14,10," + (0.08 + h * 0.14).toFixed(3) + ")";
    ctx.fillRect(px, py, TILE, TILE);
  }
  function drawNumberedWall(ctx, px, py, h) {
    ctx.fillStyle = "#b9c2c9";
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = "rgba(255,255,255,0.07)";
    ctx.fillRect(px, py, TILE, 5);
    ctx.fillStyle = "rgba(0,0,0," + (0.10 + h * 0.16).toFixed(3) + ")";
    ctx.fillRect(px, py, TILE, TILE);
  }
  // ---- Level Fun =) ----
  function drawPartyFloor(ctx, px, py, h) {
    // 地面与 Level 0 相似
    ctx.fillStyle = "#ab9d63";
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = "rgba(70,60,34,0.15)";
    ctx.fillRect(px, py + ((px / TILE | 0) % 2) * 18, TILE, 18);
    ctx.fillStyle = "rgba(255,240,180,0.05)";
    ctx.fillRect(px, py, TILE, TILE);
  }
  function drawPartyWall(ctx, px, py, h) {
    // 黄色的墙面，没有任何花纹
    ctx.fillStyle = "#d8c33f";
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = "rgba(255,255,210,0.14)";
    ctx.fillRect(px, py, TILE, 6);
    ctx.fillStyle = "rgba(60,50,10," + (0.06 + h * 0.10).toFixed(3) + ")";
    ctx.fillRect(px, py, TILE, TILE);
  }
  // ---- Level 19：阁楼 ----
  function drawAtticFloor(ctx, px, py, h) {
    ctx.fillStyle = "#6b5a44";
    ctx.fillRect(px, py, TILE, TILE);
    // 旧木地板：一条条板缝，潮湿发暗
    ctx.fillStyle = "rgba(40,30,20,0.35)";
    for (let i = 0; i < 3; i++) ctx.fillRect(px, py + i * 13 + 11, TILE, 2);
    ctx.fillStyle = "rgba(20,16,10," + (0.10 + h * 0.18).toFixed(3) + ")";
    ctx.fillRect(px, py, TILE, TILE);
  }
  function drawAtticWall(ctx, px, py, h) {
    ctx.fillStyle = "#4a3f31";
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = "rgba(255,240,210,0.10)";
    ctx.fillRect(px, py, TILE, 5);
    // 斜屋顶的横梁
    if (h > 0.55) {
      ctx.strokeStyle = "rgba(30,22,14,0.6)";
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(px, py + 8); ctx.lineTo(px + TILE, py + TILE - 8); ctx.stroke();
    }
  }
  // Level 19 的窗户：一般是黑的；亮着的那一扇会往外洒一片光
  function drawAtticWindow(ctx, px, py, w, t) {
    // 窗框
    ctx.fillStyle = "#3a3025";
    ctx.fillRect(px + 5, py + 7, TILE - 10, TILE - 14);
    if (w.lit) {
      // 亮着：暖黄的光，还会轻微闪动
      const a = 0.80 + 0.14 * Math.sin(t * 3.1 + px * 0.1);
      ctx.fillStyle = "rgba(255,232,170," + a.toFixed(3) + ")";
      ctx.fillRect(px + 7, py + 9, TILE - 14, TILE - 18);
      ctx.fillStyle = "rgba(255,250,225," + (a * 0.7).toFixed(3) + ")";
      ctx.fillRect(px + 9, py + 11, TILE - 18, 5);
      // 窗棂
      ctx.strokeStyle = "rgba(60,48,34,0.85)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(px + TILE / 2, py + 9); ctx.lineTo(px + TILE / 2, py + TILE - 9);
      ctx.moveTo(px + 7, py + TILE / 2); ctx.lineTo(px + TILE - 7, py + TILE / 2);
      ctx.stroke();
    } else {
      // 黑的：什么都看不见
      ctx.fillStyle = "#0d0b09";
      ctx.fillRect(px + 7, py + 9, TILE - 14, TILE - 18);
      ctx.strokeStyle = "rgba(60,48,34,0.8)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(px + TILE / 2, py + 9); ctx.lineTo(px + TILE / 2, py + TILE - 9);
      ctx.moveTo(px + 7, py + TILE / 2); ctx.lineTo(px + TILE - 7, py + TILE / 2);
      ctx.stroke();
    }
  }
  // 地板下透出的橙色光芒
  function drawGlowFloor(ctx, px, py, t) {
    drawAtticFloor(ctx, px, py, hash2(px, py));
    const a = 0.30 + 0.18 * Math.sin(t * 1.6 + px * 0.03);
    ctx.fillStyle = "rgba(255,150,40," + a.toFixed(3) + ")";
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = "rgba(255,220,150," + (a * 0.5).toFixed(3) + ")";
    ctx.fillRect(px + 10, py + 10, TILE - 20, TILE - 20);
  }

  // 某个 style 没有任何画法 → 会被画成 Level 2 的管道。以前静默发生，
  // 表现就是"整层莫名其妙是管道风 / 一片黑"。现在至少喊一声，方便定位。
  const __unknownStyleWarned = {};
  function __warnUnknownStyle(style, kind) {
    if (!style || style === "pipe") return;
    const k = style + "|" + kind;
    if (__unknownStyleWarned[k]) return;
    __unknownStyleWarned[k] = 1;
    try {
      console.warn("[后室] style「" + style + "」的" + kind + "没有画法 —— 已退回 Level 2 管道风。"
        + "多半是 NEWTILE 没登记上（层级文件比 levelNew.js 先加载时就会漏）。");
    } catch (_) { /* 忽略 */ }
  }

  // 给 levelverify 用的探针：这个 style 到底有没有专属画法？
  // （掉进管道兜底是个反复发作的老毛病：1.1、1.2、974、1.3、15.1 都栽过，
  //  而且每次都是静默的 —— 画面看着"是黑的/是管道的"，谁也不知道为什么。）
  const STYLE_EXPLICIT = new Set(["wallpaper", "collapsing", "concrete", "concretegarden",
    "corridor11", "lockdown", "power", "office", "hotel", "beverly", "boiler", "dark", "ocean",
    "cave", "hub", "field", "city", "suburb", "apartment", "paradise", "future", "frost",
    "iceroom", "daycare", "numbered", "party", "attic", "station78"]);
  function styleDrawer(style, map) {
    if (!style) return "";
    if (STYLE_EXPLICIT.has(style)) return "显式分支";
    if (style === "pipe") return "Level 2 管道（本层就是）";
    const cv = document.createElement("canvas"); cv.width = 40; cv.height = 40;
    const c = cv.getContext("2d");
    // 光看返回值不够 —— 有的函数 return true 却什么也没画（fillRect 尺寸是 undefined）。
    // 所以连实际落笔面积一起量。
    const probe = (fn) => {
      let area = 0;
      const of = c.fillRect.bind(c);
      c.fillRect = function (x, y, w, h) { if (w > 0 && h > 0) area += w * h; return of(x, y, w, h); };
      let ret = false;
      try { ret = !!fn(c); } catch (_) { ret = false; }
      c.fillRect = of;
      return ret === true && area > 0;
    };
    if (NEWTILE[style] && probe((x) => drawNewWall(x, 0, 0, TILE, style, map, 3, 3))
      && probe((x) => drawNewFloor(x, 0, 0, TILE, style, map, 3, 3))) return "NEWTILE+drawNew";
    if (window.drawBangWall && probe((x) => window.drawBangWall(x, 0, 0, TILE, style))) return "drawBang";
    if (window.drawTrapWall && probe((x) => window.drawTrapWall(x, 0, 0, TILE, style, map))) return "drawTrap";
    if (window.drawBatchWall && window.drawBatchFloor
      && probe((x) => window.drawBatchWall(x, 0, 0, TILE, style, map, 3, 3))
      && probe((x) => window.drawBatchFloor(x, 0, 0, TILE, style, map, 3, 3))) return "drawBatch";
    return "";
  }
  window.styleDrawer = styleDrawer;

  function drawMapTiles(ctx, map, cam, level, floor) {
    // 以前这里直接写 grassShown(g)，一碰到草墙就抛 ReferenceError，整帧渲染当场断掉 ——
    // 表现就是：人还能走，画面却全黑。改成从全局取一次，取不到就按"显示"处理。
    const gRef = (typeof window !== "undefined" ? window.__game : null) || null;
    let style = levelDef(level).style;
    // Level 5 的三个区域各有各的样子（主厅 / 贝弗莉室 / 锅炉房）
    if (level === 5) style = ["hotel", "beverly", "boiler"][Math.min(floor | 0, 2)];
    const grid = layerGrid(map, floor);
    const transit = (map.transits ? map.transits[Math.min(floor | 0, map.transits.length - 1)] : map.transit) || null;
    const left = cam.x - cam.viewW / 2;
    const top = cam.y - cam.viewH / 2;
    const x0 = Math.max(0, Math.floor(left / TILE) - 1);
    // Level 7：海面向北没有尽头 —— 出了上边界（ty < 0）仍然要画，否则那一带是黑的。
    const y0raw = Math.floor(top / TILE) - 1;
    const y0 = map.openNorth ? y0raw : Math.max(0, y0raw);
    const x1 = Math.min(map.size - 1, Math.ceil((cam.x + cam.viewW / 2) / TILE) + 1);
    const y1 = Math.min(map.size - 1, Math.ceil((cam.y + cam.viewH / 2) / TILE) + 1);
    for (let ty = y0; ty <= y1; ty++) {
      for (let tx = x0; tx <= x1; tx++) {
        const px = tx * TILE, py = ty * TILE;
        const h = hash2(tx, ty);
        const tk = tx + "," + ty;
        const lz0 = (style === "wallpaper" && map.l0zones) ? map.l0zones.zoneOf.get(tk) : null;
        // ---- Level 7：地图上边界以北 —— 望不到边的开放海面 ----
        // 这一段不预先生成（进层不会占满内存），走到哪一格才画哪一格。
        if (ty < 0) {
          if (!map.openNorth) continue;
          if (tx >= map.openNorth.x1 && tx <= map.openNorth.x2) {
            if (map.land29 && map.land29.has(tk)) drawIsland29(ctx, px, py, h, tx, ty);
            else if (drawSeaSurface) drawSeaSurface(ctx, px, py, h, tx, ty);
          } else {
            ctx.fillStyle = "#081420";
            ctx.fillRect(px - 1, py - 1, TILE + 2, TILE + 2);
          }
          continue;
        }
        // Level 0.3：巨大的冰块（实心，但它不是墙）
        if (map.ice && map.ice.has(tk)) { drawIceBlock(ctx, px, py, h); continue; }
        // Level 7（旧版码头残留）：海（挡路）/ 木栈道（能走）
        if (map.sea && map.sea.has(tk)) { drawSeaTile(ctx, px, py, h, gTimeRef); continue; }
        if (map.boardwalk && map.boardwalk.has(tk)) {
          drawBoardwalk(ctx, px, py, h, !!(map.darkSpots && map.darkSpots.has(tk))); continue;
        }
        // Level 7 海底：岩床（能走）/ 礁石（挡路）
        if (map.bed && ty >= map.bed.top && ty <= map.bed.bottom &&
            tx >= map.bed.x1 && tx <= map.bed.x2) {
          if (grid[ty][tx] === 1) drawReef(ctx, px, py, h); else drawSeabed(ctx, px, py, h);
          continue;
        }
        const tp = transit ? transit[ty][tx] : -1;
        if (tp >= 0) {
          // 渐变切行走廊：混凝土 → 黄褐 → 深色管道（越接近尽头越像 Level 2）
          if (grid[ty][tx] === 1) drawTransitWall(ctx, px, py, h, tp);
          else drawTransitFloor(ctx, px, py, h, tp);
        } else if (grid[ty][tx] === 1) {
          // station78 的专属画法：第 4 个参数必须传 TILE（格子尺寸）。
          // h 是 hash2(tx,ty) 的 0~1 随机量，传 h 会画成亚像素 —— 整层地板墙一片黑。
          const frWall = map.fakeReality && map.fakeReality.outer;
          if (lz0) { drawWallpaperWall(ctx, px, py, h); drawL0ZoneWallDecor(ctx, px, py, h, map, tx, ty, lz0); }
          else if (frWall && tx >= frWall.x && tx < frWall.x + frWall.w &&
              ty >= frWall.y && ty < frWall.y + frWall.h) {
            // 「假现实」外圈是树林，不是图书馆的书架墙：先铺一层深绿，
            // tree601 的树冠再盖上去，整圈连起来才像密不透风的林子。
            ctx.fillStyle = "#243d24"; ctx.fillRect(px, py, TILE, TILE);
            ctx.fillStyle = "rgba(70,110,64,0.35)";
            ctx.fillRect(px + TILE * 0.2, py, TILE * 0.6, TILE);
          }
          else if (style === "station78" && window.drawStationWall) drawStationWall(ctx, px, py, TILE, map, tx, ty);
          else if (style === "wallpaper") drawWallpaperWall(ctx, px, py, h);
          else if (style === "collapsing") drawCollapsingWall(ctx, px, py, h);
          else if (style === "concrete") {
            if (map.alphaBase && (map.alphaBase.inside.has(tk) || map.alphaBase.wall.has(tk))) {
              if (map.alphaBase.wall.has(tk)) drawMegWall(ctx, px, py, h);
              else drawMegFloor(ctx, px, py, h);
            } else drawConcreteWall(ctx, px, py, h);
          }
          else if (style === "concretegarden") drawConcreteGardenWall(ctx, px, py, h);
          else if (style === "corridor11") drawCorridor11Wall(ctx, px, py, h);
          else if (style === "lockdown") drawLockdownWall(ctx, px, py, h, tx, ty);
          else if (style === "power") drawPowerWall(ctx, px, py, h);
          else if (style === "office") {
            if (map.grassWall && map.grassWall.has(tk) && grassShown(gRef)) drawGrassWall(ctx, px, py, h);
            else drawOfficeWall(ctx, px, py, h);
          }
          else if (style === "hotel") drawHotelWall(ctx, px, py, h);
          else if (style === "beverly") drawBevWall(ctx, px, py, h);
          else if (style === "boiler") drawBoilerWall(ctx, px, py, h);
          else if (style === "dark") drawDarkWall(ctx, px, py, h);
          else if (style === "ocean") drawOceanWall(ctx, px, py, h, map, tx, ty);
          else if (style === "cave") drawCaveWall(ctx, px, py, h, map, tx, ty);
          else if (style === "hub") drawHubWall(ctx, px, py, h);
          else if (style === "field") drawFieldWall(ctx, px, py, h, map);
          else if (style === "city") drawCityWall(ctx, px, py, h, map, tx, ty);
          else if (style === "suburb") drawSuburbWall(ctx, px, py, h, map, tx, ty);
          else if (style === "apartment") drawApartmentWall(ctx, px, py, h);
          else if (style === "paradise") drawParadiseWall(ctx, px, py, h);
          else if (style === "future") {
            drawFutureWall(ctx, px, py, h, tx, ty);
            const w15 = map.winAt15 && map.winAt15.get(tk);
            if (w15) drawAtticWindow(ctx, px, py, w15, gTimeRef);
          }
          else if (style === "frost") drawFrostWall(ctx, px, py, h);
          else if (style === "iceroom") drawIceRoomWall(ctx, px, py, h);
          else if (style === "daycare") drawDaycareWall(ctx, px, py, h);
          else if (style === "numbered") drawNumberedWall(ctx, px, py, h);
          else if (style === "party") drawPartyWall(ctx, px, py, h);
          else if (style === "attic") {
            drawAtticWall(ctx, px, py, h);
            const wnd = map.winAt && map.winAt.get(tk);
            if (wnd) drawAtticWindow(ctx, px, py, wnd, gTimeRef);
          }
          else if (window.drawBangWall && window.drawBangWall(ctx, px, py, h, style)) { /* Level ! */ }
          else if (window.drawTrapWall && window.drawTrapWall(ctx, px, py, h, style, map)) { /* 0.4 / 红室 */ }
          else if (window.drawBatchWall && window.drawBatchWall(ctx, px, py, h, style, map, tx, ty)) { /* 1.2.0 批次 */ }
          else if (NEWTILE[style]) {
            // 注意：这里的 h 是 hash2(tx,ty)（0~1 的随机量，用来做纹理变化），
            // 不是格子尺寸。drawNewWall 的第 4 个参数要的是"格子多大"（TILE），
            // 传成 h 的话 fillRect(px,py,0.37,0.37) 画出来是亚像素 —— 整层地板墙
            // 一片黑。以前就是这么传的，所以 25/36/36.1/37/37.1/974 全是黑的。
            if (drawNewWall(ctx, px, py, TILE, style, map, tx, ty)) { /* 新层级 */ }
            else { __warnUnknownStyle(style, "墙"); drawPipeWall(ctx, px, py, h, map, tx, ty); }
          }
          else {
            // 走到这里 = 这个 style 既不在显式分支里、也不在 NEWTILE 里 —— 它会变成
            // Level 2 的管道墙。以前是静默发生的，谁也不知道，现在至少会喊一声。
            __warnUnknownStyle(style, "墙");
            drawPipeWall(ctx, px, py, h, map, tx, ty);
          }
        } else {
          // 1.3.0：这两块地是「在同一张图里往边上扩出去」的，不能靠 levelDef.style 判断，
          // 只能按区域坐标覆盖。以前只改了脚步声材质，画面依旧是图书馆的黄木地板，
          // 所以「假现实」看上去根本不是草地。
          const frTile = map.fakeReality;
          const mhTile = map.merchantHome;
          if (lz0) { drawCarpetFloor(ctx, px, py, h, tx, ty); drawL0ZoneFloorDecor(ctx, px, py, h, map, tx, ty, lz0); }
          else if (frTile && tx >= frTile.x && tx < frTile.x + frTile.w &&
              ty >= frTile.y && ty < frTile.y + frTile.h) {
            drawGrassFloor(ctx, px, py, h, tx, ty);
          } else if (mhTile && (floor | 0) === mhTile.floor &&
              tx >= mhTile.x && tx < mhTile.x + mhTile.w &&
              ty >= mhTile.y && ty < mhTile.y + mhTile.h) {
            ctx.fillStyle = "#e6ecef";
            ctx.fillRect(px, py, TILE, TILE);
            ctx.fillStyle = "rgba(120,142,152,0.30)";
            ctx.fillRect(px, py, TILE, 1); ctx.fillRect(px, py, 1, TILE);
            ctx.fillStyle = "rgba(255,255,255,0.35)";
            ctx.fillRect(px + 2, py + 2, TILE - 4, 2);
          }
          else if (style === "station78" && window.drawStationFloor) drawStationFloor(ctx, px, py, TILE, map, tx, ty);
          else if (style === "wallpaper") drawCarpetFloor(ctx, px, py, h, tx, ty);
          else if (style === "collapsing") drawCollapsingFloor(ctx, px, py, h, tx, ty);
          else if (style === "concrete") {
            if (map.alphaBase && map.alphaBase.inside.has(tk)) drawMegFloor(ctx, px, py, h);
            else drawConcreteFloor(ctx, px, py, h);
          }
          else if (style === "concretegarden") drawConcreteGardenFloor(ctx, px, py, h, tx, ty);
          else if (style === "corridor11") drawCorridor11Floor(ctx, px, py, h, tx, ty);
          else if (style === "lockdown") drawLockdownFloor(ctx, px, py, h, tx, ty);
          else if (style === "power") drawPowerFloor(ctx, px, py, h);
          else if (style === "office") {
            if (map.grass && map.grass.has(tk) && grassShown(gRef)) drawGrassFloor(ctx, px, py, h, tx, ty);
            else drawOfficeFloor(ctx, px, py, h);
          }
          else if (style === "hotel") drawHotelFloor(ctx, px, py, h, tx, ty);
          else if (style === "beverly") drawBevFloor(ctx, px, py, h);
          else if (style === "boiler") drawBoilerFloor(ctx, px, py, h, gTimeRef);
          else if (style === "dark") drawDarkFloor(ctx, px, py, h);
          else if (style === "ocean") drawOceanFloor(ctx, px, py, h, map, tx, ty);
          else if (style === "cave") drawCaveFloor(ctx, px, py, h, map, tx, ty);
          else if (style === "hub") drawHubFloor(ctx, px, py, h, map, ty);
          else if (style === "field") drawFieldFloor(ctx, px, py, h, map, tx, ty);
          else if (style === "city") drawCityFloor(ctx, px, py, h, map, tx, ty);
          else if (style === "suburb") drawSuburbFloor(ctx, px, py, h, map, tx, ty);
          else if (style === "apartment") drawApartmentFloor(ctx, px, py, h, tx, ty);
          else if (style === "paradise") drawParadiseFloor(ctx, px, py, h, tx, ty, gTimeRef);
          else if (style === "future") drawFutureFloor(ctx, px, py, h);
          else if (style === "frost") drawFrostFloor(ctx, px, py, h, map, tx, ty);
          else if (style === "iceroom") drawIceRoomFloor(ctx, px, py, h, tx, ty);
          else if (style === "daycare") drawDaycareFloor(ctx, px, py, h, tx, ty);
          else if (style === "attic") drawAtticFloor(ctx, px, py, h);
          else if (style === "numbered") drawNumberedFloor(ctx, px, py, h, map, tx, ty);
          else if (style === "party") drawPartyFloor(ctx, px, py, h);
          else if (window.drawBangFloor && window.drawBangFloor(ctx, px, py, h, style, map, tx, ty)) { /* Level ! */ }
            else if (window.drawTrapFloor && window.drawTrapFloor(ctx, px, py, h, style, map, tx, ty)) { /* 0.4 / 红室 */ }
          else if (window.drawBatchFloor && window.drawBatchFloor(ctx, px, py, h, style, map, tx, ty)) { /* 1.2.0 批次 */ }
          else if (NEWTILE[style]) {
            if (!drawNewFloor(ctx, px, py, TILE, style, map, tx, ty)) {
              __warnUnknownStyle(style, "地板"); drawPipeFloor(ctx, px, py, h);
            }
          }
          else { __warnUnknownStyle(style, "地板"); drawPipeFloor(ctx, px, py, h); }
          // Level 15：透光的窗户洒下的一片光 —— 这里没有窗灵，站进去只是被照亮
          if (map.lit15 && map.lit15.has(tk)) {
            const a2 = 0.13 + 0.05 * Math.sin(gTimeRef * 1.6 + tx * 0.3);
            ctx.fillStyle = "rgba(240,246,255," + a2.toFixed(3) + ")";
            ctx.fillRect(px, py, TILE, TILE);
          }
          // Level 19：窗户的光 —— 那一小片地砖被照亮了（别站进去）
          if (map.lit19 && map.lit19.has(tk)) {
            const a = 0.16 + 0.07 * Math.sin(gTimeRef * 2.2 + tx * 0.4);
            ctx.fillStyle = "rgba(255,236,190," + a.toFixed(3) + ")";
            ctx.fillRect(px, py, TILE, TILE);
            ctx.fillStyle = "rgba(255,240,200,0.10)";
            ctx.fillRect(px, py, TILE, 3);
          }
          // Level 1：沿墙那排房间的地面是白色的（和停车场的灰色水泥明显不同）
          if (map.whiteFloor) {
            const wf = map.whiteFloor[Math.min(floor | 0, map.whiteFloor.length - 1)];
            if (wf && wf.has(tk)) {
              ctx.fillStyle = "#e8eaec";
              ctx.fillRect(px, py, TILE, TILE);
              ctx.fillStyle = "rgba(150,158,168,0.22)";
              ctx.fillRect(px, py, TILE, 1);
              ctx.fillRect(px, py, 1, TILE);
              ctx.fillStyle = "rgba(120,130,145," + (0.05 + h * 0.06).toFixed(3) + ")";
              ctx.fillRect(px + 6 + h * 16, py + 8 + hash2(tx, ty + 3) * 18, 5, 4);
            }
          }
          // 红门周围：地面被染成红色（"周围地面为红色的门"）
          if (map.redFloor && map.redFloor.has(tx + "," + ty)) {
            ctx.fillStyle = "rgba(170,52,36,0.58)";
            ctx.fillRect(px, py, TILE, TILE);
            ctx.fillStyle = "rgba(120,28,20,0.25)";
            ctx.fillRect(px, py + TILE - 4, TILE, 4);
          }
        }
      }
    }
  }

  // ---------- Level 0.3：冰室 ----------
  // 地毯：沾满冰霜，粗糙得像砂砾
  // 地面：一层踩上去沙沙响的冰沙 —— 冷灰蓝，掺着白霜颗粒，绝不是钢板
  function drawIceRoomFloor(ctx, px, py, h, tx, ty) {
    const n = hash2(tx, ty);
    ctx.fillStyle = n > 0.5 ? "#9fb3c4" : "#96aabd";
    ctx.fillRect(px, py, TILE, TILE);
    // 霜的斑块
    ctx.fillStyle = "rgba(232,244,252," + (0.16 + n * 0.20).toFixed(3) + ")";
    ctx.fillRect(px, py, TILE, TILE);
    // 冰沙颗粒：细密、偏白
    for (let i = 0; i < 9; i++) {
      const gx = px + hash2(tx * 7 + i, ty * 3 + 1) * TILE;
      const gy = py + hash2(tx * 3 + 5, ty * 11 + i) * TILE;
      const r = 1 + hash2(tx + i, ty) * 1.6;
      ctx.fillStyle = "rgba(255,255,255," + (0.34 + hash2(tx, ty + i) * 0.38).toFixed(3) + ")";
      ctx.fillRect(gx, gy, r, r);
    }
    // 冻结的纹路
    ctx.strokeStyle = "rgba(70,96,120,0.20)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px + hash2(tx, ty) * TILE, py);
    ctx.lineTo(px + hash2(tx + 3, ty + 9) * TILE, py + TILE);
    ctx.stroke();
    ctx.fillStyle = "rgba(120,160,180,0.14)";
    ctx.fillRect(px, py + TILE - 3, TILE, 3);
  }
  // 墙：墙皮裸露，黏着冻得发白的墙纸碎片
  // 墙：冷调的蓝色墙纸 —— 冻得发白、卷边、大片剥落露出底下的灰白墙皮
  function drawIceRoomWall(ctx, px, py, h) {
    const n = hash2(px, py);
    ctx.fillStyle = n > 0.5 ? "#7d9cb8" : "#7593af";     // 蓝色墙纸
    ctx.fillRect(px, py, TILE, TILE);
    // 墙纸的竖条纹
    ctx.fillStyle = "rgba(255,255,255,0.07)";
    for (let i = 0; i < 3; i++) ctx.fillRect(px + 3 + i * 13, py, 2, TILE);
    // 顶部的霜
    ctx.fillStyle = "rgba(226,240,250,0.30)";
    ctx.fillRect(px, py, TILE, 3);
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fillRect(px, py + TILE - 7, TILE, 7);
    if (h > 0.34) {
      // 剥落：露出灰白的墙皮
      const w = 9 + h * 17, ht = 7 + hash2(px + 2, py) * 15;
      const ox = 2 + hash2(px, py + 7) * 15, oy = 3 + hash2(px + 11, py) * 13;
      ctx.fillStyle = "#c9cfd2";
      ctx.fillRect(px + ox, py + oy, w, ht);
      ctx.fillStyle = "rgba(255,255,255,0.34)";
      ctx.fillRect(px + ox, py + oy, w, 2);
      ctx.strokeStyle = "rgba(120,150,175,0.45)";        // 卷边
      ctx.lineWidth = 1;
      ctx.strokeRect(px + ox + 0.5, py + oy + 0.5, w - 1, ht - 1);
    }
    // 墙面结的霜
    ctx.fillStyle = "rgba(235,246,255,0.20)";
    ctx.fillRect(px + hash2(px + 5, py) * (TILE - 8), py + hash2(px, py + 3) * (TILE - 6), 6, 4);
    if (h < 0.62) {
      ctx.fillStyle = "rgba(246,246,238,0.82)";
      const fx = px + 4 + hash2(px, py + 1) * 22;
      const fy = py + 5 + hash2(px + 4, py) * 20;
      ctx.fillRect(fx, fy, 9 + h * 8, 7 + h * 6);
      ctx.fillStyle = "rgba(226,232,228,0.9)";
      ctx.fillRect(fx, fy + 5 + h * 5, 9 + h * 8, 3);
      ctx.fillStyle = "rgba(140,150,140,0.35)";
      ctx.fillRect(fx, fy, 9 + h * 8, 1);
    }
  }
  // 巨大的冰块
  function drawIceBlock(ctx, px, py, h) {
    ctx.fillStyle = "#bfe4f2";
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fillRect(px + 2, py + 2, TILE - 4, TILE - 8);
    ctx.fillStyle = "rgba(150,200,225,0.55)";
    ctx.fillRect(px, py + TILE - 6, TILE, 6);
    ctx.strokeStyle = "rgba(255,255,255,0.75)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(px + 4 + h * 8, py + 3);
    ctx.lineTo(px + 10 + h * 12, py + TILE - 6);
    ctx.stroke();
    ctx.strokeStyle = "rgba(120,170,200,0.5)";
    ctx.beginPath();
    ctx.moveTo(px + TILE - 6, py + 6 + h * 6);
    ctx.lineTo(px + 8, py + TILE - 10);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.30)";
    ctx.beginPath();
    ctx.moveTo(px, py); ctx.lineTo(px + TILE * 0.55, py); ctx.lineTo(px, py + TILE * 0.5);
    ctx.closePath(); ctx.fill();
  }
  // 通风口：不断往外喷霜雾
  // Level 5：一进门边上就摆着一台收音机 —— 它会放 music/Level5.mp3
  // 声音随距离渐渐变轻；走出这一层就停了；彻底听不见之后 3 秒，背景音乐接回来。
  const RADIO_RANGE = 9 * TILE;
  function radioTile(g) {
    const m = g.map;
    if (!m || !isLevel(g, 5)) return null;
    if (m.radio) return m.radio;
    // 摆在出生点边上：找一格能走的地板
    const gd = m.layers && m.layers[0];
    const sx = Math.round(m.start.x), sy = Math.round(m.start.y);
    for (const off of [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, -1]]) {
      const x = sx + off[0], y = sy + off[1];
      if (gd && gd[y] && gd[y][x] === 0) { m.radio = { x, y }; return m.radio; }
    }
    m.radio = { x: sx, y: sy };
    return m.radio;
  }
  function updateRadio(g) {
    // 只有"玩家按 E 打开过"才响 —— 一进层就自己放歌太吵，也谈不上"发现"。
    const inL5 = isLevel(g, 5) && g.phase === "playing";
    if (!inL5) { g.nearRadio = null; g.radioNear = 0; AudioSys.radio(false, 0); return; }
    const r = radioTile(g);
    if (!r) { g.nearRadio = null; g.radioNear = 0; AudioSys.radio(false, 0); return; }
    const d = Math.hypot((r.x + 0.5) * TILE - g.player.x, (r.y + 0.5) * TILE - g.player.y);
    // 交互距离：走过去按 E
    g.nearRadio = (d < TILE * 2.2) ? r : null;
    const near = g.radioPlaying ? Math.max(0, 1 - d / RADIO_RANGE) : 0;
    g.radioNear = near;
    AudioSys.radio(near > 0.001, near);
  }
  // E：开 / 关收音机
  function toggleRadio(g) {
    const r = g.nearRadio;
    if (!r) return;
    g.radioPlaying = !g.radioPlaying;
    if (!g.radioPlaying) { g.radioNear = 0; AudioSys.radio(false, 0); AudioSys.flickerClick(); toast("收音机关掉了"); }
    else {
      AudioSys.flickerClick();      // 咔哒一声（旋钮按下去的那下）
      toast("收音机咔哒一声 —— 开始放歌");
    }
  }
  function drawRadio(ctx, g, cam) {
    const r = radioTile(g);
    if (!r) return;
    const left = cam.x - cam.viewW / 2, top = cam.y - cam.viewH / 2;
    const px = r.x * TILE, py = r.y * TILE;
    if (px + TILE < left || py + TILE < top || px > left + cam.viewW || py > top + cam.viewH) return;
    const t = g.time;
    // 木壳收音机：喇叭格栅 + 两个旋钮 + 一颗会闪的小灯
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath(); ctx.ellipse(px + TILE / 2, py + TILE - 6, 15, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#6b4a2a";
    ctx.fillRect(px + 8, py + 12, TILE - 16, TILE - 22);
    ctx.fillStyle = "#7d5a34";
    ctx.fillRect(px + 8, py + 12, TILE - 16, 4);
    ctx.fillStyle = "#2a2018";
    ctx.fillRect(px + 12, py + 18, 16, 14);
    ctx.fillStyle = "rgba(220,210,190,0.45)";
    for (let i = 0; i < 4; i++) ctx.fillRect(px + 12, py + 19 + i * 4, 16, 1.4);
    ctx.fillStyle = "#c9b78e";
    ctx.beginPath(); ctx.arc(px + 32, py + 22, 2.8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(px + 32, py + 31, 2.8, 0, Math.PI * 2); ctx.fill();
    const blink = 0.45 + 0.55 * Math.abs(Math.sin(t * 2.4));
    ctx.fillStyle = "rgba(255,90,70," + blink.toFixed(2) + ")";
    ctx.beginPath(); ctx.arc(px + 20, py + 36, 2.2, 0, Math.PI * 2); ctx.fill();
    // 正在放歌 —— 头顶飘几下音波
    if (g.radioNear > 0.01) {
      ctx.strokeStyle = "rgba(255,220,150," + (0.30 * g.radioNear).toFixed(2) + ")";
      ctx.lineWidth = 1.4;
      for (let i = 0; i < 3; i++) {
        const rr = 6 + ((t * 22 + i * 9) % 22);
        ctx.beginPath();
        ctx.arc(px + TILE / 2, py + 8, rr, -Math.PI * 0.75, -Math.PI * 0.25);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // Level 7 海底：进 Level 8 的岩洞改到左方墙壁处
  function drawIceExtras(ctx, g, cam) {
    const m = g.map;
    if (!m || !m.vents || !isLevel(g, 0.3)) return;
    const t = g.time;
    for (const v of m.vents) {
      const px = v.x * TILE, py = v.y * TILE;
      ctx.fillStyle = "#59636e";
      ctx.fillRect(px + 3, py + 3, TILE - 6, TILE - 6);
      ctx.fillStyle = "rgba(225,240,248,0.55)";
      for (let i = 0; i < 4; i++) ctx.fillRect(px + 5, py + 6 + i * 7, TILE - 10, 3);
      ctx.strokeStyle = "rgba(30,38,46,0.7)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(px + 3.5, py + 3.5, TILE - 7, TILE - 7);
      for (let i = 0; i < 5; i++) {
        const ph = (t * 0.5 + i * 0.2 + v.x * 0.13 + v.y * 0.07) % 1;
        const r = 5 + ph * 20;
        const drift = Math.sin((t + i) * 0.8) * 8 * ph;
        ctx.fillStyle = "rgba(232,244,250," + (0.42 * (1 - ph)).toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(px + TILE / 2 + drift, py + TILE / 2 - ph * 16, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // ---------- Level 0.2：重塑的混乱 ----------
  // 墙壁：颜色与 Level 0 相同但明显更浅，且大块墙纸正在剥落，露出灰白底层
  function drawCollapsingWall(ctx, px, py, h) {
    ctx.fillStyle = "#ecdf86"; // 更浅的黄墙纸（与 Level 0 同色系但更浅）
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = "rgba(255,255,255,0.10)";
    ctx.fillRect(px, py, TILE, 2);
    ctx.fillStyle = "rgba(0,0,0,0.14)";
    ctx.fillRect(px + TILE - 2, py, 2, TILE);
    ctx.fillStyle = "rgba(0,0,0,0.16)";
    ctx.fillRect(px, py + TILE - 8, TILE, 8);
    // 墙纸剥落：露出灰白墙体（成片、边缘破碎）
    if (h > 0.42) {
      const w = 10 + h * 18, ht = 8 + hash2(px + 3, py) * 16;
      const ox = 3 + hash2(px, py + 5) * 16, oy = 4 + hash2(px + 9, py) * 14;
      ctx.fillStyle = "#b3ac98";
      ctx.fillRect(px + ox, py + oy, Math.min(w, TILE - ox - 2), Math.min(ht, TILE - oy - 2));
      // 剥落边缘的碎齿
      ctx.fillStyle = "#e3d679";
      for (let i = 0; i < 4; i++) {
        const eh = hash2(px + i, py + 11);
        ctx.fillRect(px + ox + i * 4, py + oy - 2 - eh * 3, 3, 3);
      }
      // 底层上的裂纹
      ctx.strokeStyle = "rgba(0,0,0,0.22)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px + ox + 2, py + oy + 3);
      ctx.lineTo(px + ox + 9, py + oy + Math.min(ht, TILE - oy - 2) - 3);
      ctx.stroke();
    }
    // 垂下来的一条墙纸（卷边）
    if (h > 0.78) {
      ctx.fillStyle = "#d9cd6a";
      ctx.fillRect(px + 6 + h * 12, py + 6, 6, 14);
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(px + 6 + h * 12, py + 18, 6, 3);
    }
  }

  // 地面：棕红色，布满灰尘与裂缝
  function drawCollapsingFloor(ctx, px, py, h, tx, ty) {
    ctx.fillStyle = "#8a4a32";
    ctx.fillRect(px, py, TILE, TILE);
    // 灰尘（灰白斑）
    ctx.fillStyle = "rgba(206,196,176,0.20)";
    ctx.fillRect(px + (h * 37) % 32, py + (h * 53) % 32, 4, 3);
    ctx.fillStyle = "rgba(206,196,176,0.12)";
    ctx.fillRect(px + (h * 71) % 28, py + (h * 13) % 28, 3, 2);
    // 裂缝
    if (h > 0.72) {
      ctx.strokeStyle = "rgba(30,12,8,0.45)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(px + 5, py + 6 + h * 8);
      ctx.lineTo(px + 18, py + 18);
      ctx.lineTo(px + 12, py + TILE - 5);
      ctx.stroke();
    }
    // 塌陷的坑（露出黑暗）
    if (h > 0.9 && h < 0.94) {
      ctx.fillStyle = "rgba(20,10,8,0.62)";
      ctx.beginPath();
      ctx.ellipse(px + TILE / 2, py + TILE / 2, 11, 7, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    if ((tx + ty) % 3 === 0) {
      ctx.fillStyle = "rgba(0,0,0,0.07)";
      ctx.fillRect(px, py + TILE - 3, TILE, 1);
    }
  }

  // ---------- 斜坡：斜着的正方形地面（连接上下两层） ----------
  function drawRamps(ctx, g, cam) {
    // Level 0.7 忆域：画的是区域尽头的黄雾，不是斜坡
    if (g.map.zoneFog && g.map.zoneFog.length) { drawZoneFog(ctx, g); return; }
    if (!g.map.ramps) return;
    const t = g.time;
    for (const r of g.map.ramps) {
      const cx = (r.x + r.w / 2) * TILE, cy = (r.y + r.h / 2) * TILE;
      const half = Math.max(r.w, r.h) * TILE / 2 * 0.9;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.PI / 4); // 斜着的正方形（菱形）
      // 平台
      ctx.fillStyle = g.floor === r.floorB ? "#4a5560" : "#5f6a63";
      ctx.fillRect(-half, -half, half * 2, half * 2);
      // 坡度条纹
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      for (let i = -half + 5; i < half; i += 11) ctx.fillRect(-half + 3, i, half * 2 - 6, 3);
      // 边框
      ctx.strokeStyle = "rgba(0,0,0,0.55)";
      ctx.lineWidth = 3;
      ctx.strokeRect(-half, -half, half * 2, half * 2);
      ctx.strokeStyle = "rgba(255,233,122,0.35)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-half + 4, -half + 4, half * 2 - 8, half * 2 - 8);
      ctx.rotate(-Math.PI / 4);
      // 中央指示：朝另一层的箭头（脉动）
      const down = g.floor === r.floorA; // 在 A 层 -> 通往 B 层（向下）
      const pulse = 0.4 + 0.35 * Math.sin(t * 3);
      ctx.fillStyle = "rgba(255,233,122," + pulse.toFixed(3) + ")";
      ctx.beginPath();
      if (down) {
        ctx.moveTo(cx - 8, cy - 4); ctx.lineTo(cx + 8, cy - 4); ctx.lineTo(cx, cy + 9);
      } else {
        ctx.moveTo(cx - 8, cy + 4); ctx.lineTo(cx + 8, cy + 4); ctx.lineTo(cx, cy - 9);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  // ---------- Level 0.7 忆域：区域尽头的黄雾 ----------
  // 一团压在通道尽头、缓缓翻涌的黄雾。走进去就到下一个区域，走回来就回上一个区域。
  function drawZoneFog(ctx, g) {
    const t = g.time;
    const cur = g.floor | 0;
    for (const z of g.map.zoneFog) {
      let r = null, fwd = false;
      if (cur === z.aZone) { r = z.aRect; fwd = true; }   // 往更深处
      else if (cur === z.bZone) { r = z.bRect; fwd = false; } // 退回上一个区域
      else continue;
      const x0 = r.x * TILE, y0 = r.y * TILE, w = r.w * TILE, h = r.h * TILE;
      const cx = x0 + w / 2, cy = y0 + h / 2;
      // 两团雾要一眼分得清：往深处的是亮金，往回走的是发灰的暗黄。
      // 以前两团长一个样，走到区域 2 只认得"刚进来那团"，就以为这个区只有回头路。
      const HOT = fwd ? 1 : 0.42;
      // 底：被雾压住的一圈地面（比周围亮一点，像被雾气浸透）
      const bg = ctx.createRadialGradient(cx, cy, 2, cx, cy, Math.max(w, h) * 0.62);
      bg.addColorStop(0, "rgba(232,206,96," + (0.55 * HOT).toFixed(3) + ")");
      bg.addColorStop(1, "rgba(210,180,70,0)");
      ctx.fillStyle = bg;
      ctx.fillRect(x0 - TILE, y0 - TILE, w + TILE * 2, h + TILE * 2);
      // 翻涌的雾团：一串缓慢公转的半透明圆
      ctx.save();
      ctx.beginPath();
      ctx.rect(x0 - 2, y0 - 2, w + 4, h + 4);
      ctx.clip();
      const N = 9;
      for (let i = 0; i < N; i++) {
        const a = t * 0.34 + i * (Math.PI * 2 / N);
        const rr = Math.max(w, h) * (0.17 + 0.13 * ((i * 7) % 5) / 5);
        const ox = cx + Math.cos(a) * w * 0.27 + Math.sin(t * 0.7 + i) * 5;
        const oy = cy + Math.sin(a * 1.3) * h * 0.27 + Math.cos(t * 0.6 + i * 2) * 5;
        const gr = ctx.createRadialGradient(ox, oy, 1, ox, oy, rr);
        gr.addColorStop(0, "rgba(246,224,132," + (0.30 * HOT).toFixed(3) + ")");
        gr.addColorStop(0.55, "rgba(226,196,84," + (0.17 * HOT).toFixed(3) + ")");
        gr.addColorStop(1, "rgba(206,172,60,0)");
        ctx.fillStyle = gr;
        ctx.beginPath(); ctx.arc(ox, oy, rr, 0, Math.PI * 2); ctx.fill();
      }
      // 一层整体压着的黄，让"一团雾"看得出来
      ctx.fillStyle = "rgba(228,198,88," + (0.20 * HOT).toFixed(3) + ")";
      ctx.fillRect(x0, y0, w, h);
      ctx.restore();
      // 边缘：慢慢呼吸的一圈亮边，提示"这里能过去"
      const pulse = 0.30 + 0.22 * Math.sin(t * 2.1);
      ctx.strokeStyle = fwd
        ? "rgba(255,236,150," + pulse.toFixed(3) + ")"
        : "rgba(190,168,120," + (pulse * 0.5).toFixed(3) + ")";
      ctx.lineWidth = 2;
      ctx.strokeRect(x0 + 2, y0 + 2, w - 4, h - 4);
      // 方向箭头：往深处指外侧，往回指地图中心 —— 不画这个，两团雾分不出来
      const midPx = (g.map.size / 2) * TILE;
      const dirOut = cx < midPx ? -1 : 1;          // 这团雾在地图哪一侧
      const dir = fwd ? dirOut : -dirOut;          // 往深处 = 往外，往回 = 往中心
      const acx = cx, acy = cy;
      const asz = Math.min(w, h) * 0.22;
      ctx.save();
      ctx.translate(acx, acy);
      ctx.scale(dir, 1);
      ctx.fillStyle = fwd
        ? "rgba(255,240,170," + (0.55 + 0.25 * Math.sin(t * 2.1)).toFixed(3) + ")"
        : "rgba(205,186,140,0.5)";
      for (let k = 0; k < 2; k++) {
        const ox2 = -asz * 0.4 + k * asz * 0.9;
        ctx.beginPath();
        ctx.moveTo(ox2, -asz);
        ctx.lineTo(ox2 + asz * 0.7, 0);
        ctx.lineTo(ox2, asz);
        ctx.lineTo(ox2 + asz * 0.3, 0);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // ---------- 忆域：更深处那团黄雾的信标 ----------
  // 迷雾会把整张图压黑，那团雾又缩在 78×78 的角落里 —— 不立个信标，
  // 光靠瞎走根本撞不到，很多人走到区域 2 就以为到底了。
  // 画在迷雾之后（否则一样被压黑），只在还没探索到它的时候亮着。
  function drawZoneBeacon(ctx, g, cam) {
    if (String(g.level) !== "0.7") return;
    const zf = g.map && g.map.zoneFog;
    if (!zf || !zf.length) return;
    const cur = g.floor | 0;
    const z = zf.find((q) => q.aZone === cur);
    if (!z) return;
    const r = z.aRect;
    const cx = (r.x + r.w / 2) * TILE, cy = (r.y + r.h / 2) * TILE;
    // 常亮：只要它在视野里就看得见（画在迷雾之后，所以不会被一起压黑）。
    // 一开始写成"没探索到才亮"，可灯光每帧都会把周围一圈标成已探索，
    // 于是它几乎从来不亮 —— 等于白写。
    const t = g.time;
    const pulse = 0.5 + 0.5 * Math.sin(t * 1.8);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const R = TILE * (5 + pulse * 2.5);
    const gr = ctx.createRadialGradient(cx, cy, 2, cx, cy, R);
    gr.addColorStop(0, "rgba(255,226,130," + (0.30 + 0.22 * pulse).toFixed(3) + ")");
    gr.addColorStop(0.5, "rgba(240,200,90," + (0.10 + 0.08 * pulse).toFixed(3) + ")");
    gr.addColorStop(1, "rgba(220,180,70,0)");
    ctx.fillStyle = gr;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
    // 一道直直的光柱，隔着整张图也看得出方位
    ctx.globalAlpha = 0.16 + 0.10 * pulse;
    ctx.fillStyle = "rgba(255,232,150,1)";
    ctx.fillRect(cx - 2, cy - TILE * 2.2, 4, TILE * 4.4);
    ctx.fillRect(cx - TILE * 2.2, cy - 2, TILE * 4.4, 4);
    ctx.restore();
  }

  // ---------- Level 1 花园段：最深处那团绿光的信标 ----------
  // 迷雾会把整张下层压暗，物件层里那点绿光会被一起盖掉 —— 所以画在迷雾之后。
  // 隔着停车场就能看见东北角那一点绿，顺着走过去就是 Level 1.2。
  function drawGardenGlowBeacon(ctx, g, cam) {
    if (String(g.level) !== "1" || (g.floor | 0) !== 1) return;
    const n = g.map && g.map.gardenNook;
    if (!n || !n.deep) return;
    const cx = (n.deep.x + 0.5) * TILE, cy = (n.deep.y + 0.5) * TILE;
    const left = cam.x - cam.viewW / 2, top = cam.y - cam.viewH / 2;
    if (cx < left - TILE * 3 || cx > left + cam.viewW + TILE * 3 ||
        cy < top - TILE * 3 || cy > top + cam.viewH + TILE * 3) return;
    const t = g.time, pulse = 0.5 + 0.5 * Math.sin(t * 1.8);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const R = TILE * (2.0 + pulse * 0.9);
    const gr = ctx.createRadialGradient(cx, cy, 2, cx, cy, R);
    gr.addColorStop(0, "rgba(150,255,140," + (0.34 + 0.20 * pulse).toFixed(3) + ")");
    gr.addColorStop(0.5, "rgba(96,224,110," + (0.12 + 0.09 * pulse).toFixed(3) + ")");
    gr.addColorStop(1, "rgba(60,170,90,0)");
    ctx.fillStyle = gr;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.14 + 0.10 * pulse;
    ctx.fillStyle = "rgba(180,255,170,1)";
    ctx.fillRect(cx - 2, cy - TILE * 1.6, 4, TILE * 3.2);
    ctx.restore();
  }

  // Level 0 熄灯区不画任何光：档案写的是「完全无照明」，区内一盏灯都没有。
  // 曾经在这里画过径向光晕和一根坏灯管，与设定相悖，已整段移除。
  // 玩家自己的手电是唯一能推开那片黑的东西（由 eraseFlashlight / drawFlashBeam 负责）。

  // ---------- 补给：装饰 / 地上的物品 / 补给箱 ----------
  // 场景装饰：破损的箱子与桌子。撬棍就摆在它们上面（走过去自动捡）。
  // Level 11：路灯 / 饮水机 / 商业冰柜 / 苏打水自动售货机 / 缓缓停下的汽车
  const CITY_PROPS = new Set(["streetlamp", "watercooler", "freezer", "vending",
    "citydoor", "alley10", "window12", "apartment13"]);

  function drawCityExtras(ctx, g, cam) {
    const map = g.map;
    const left = cam.x - cam.viewW / 2, top = cam.y - cam.viewH / 2;
    const vis = (x, y, pad) => x + pad < left || y + pad < top ||
      x - pad > left + cam.viewW || y - pad > top + cam.viewH;
    const t = g.time;

    // 被奇怪地叠在一起 / 漂浮着的建筑：先在地面投一块错位的影子
    if (map.floating && map.floating.size) {
      ctx.save();
      ctx.globalAlpha = 0.28;
      ctx.fillStyle = "#000";
      for (const k of map.floating) {
        const [sx, sy] = k.split(",");
        const bx = +sx * TILE, by = +sy * TILE;
        if (vis(bx, by, 200)) continue;
        ctx.fillRect(bx + 12, by + 14, 7 * TILE, 7 * TILE);
      }
      ctx.restore();
    }

    for (const p of (map.props || [])) {
      if (!CITY_PROPS.has(p.type)) continue;
      const x = (p.x + 0.5) * TILE, y = (p.y + 0.5) * TILE;
      if (vis(x, y, 60)) continue;
      ctx.save();
      ctx.translate(x, y);

      if (p.type === "streetlamp") {
        ctx.fillStyle = "rgba(0,0,0,0.30)";
        ctx.beginPath(); ctx.ellipse(0, 8, 9, 4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#4a4a4e";
        ctx.fillRect(-2, -34, 4, 40);
        ctx.fillStyle = "#5a5a5e";
        ctx.fillRect(-9, -38, 18, 5);
        if (p.on) {
          const fl = 0.75 + 0.25 * Math.abs(Math.sin(t * 7 + p.x));
          ctx.shadowColor = "rgba(255,226,150,0.9)";
          ctx.shadowBlur = 26;
          ctx.fillStyle = "rgba(255,232,170," + fl.toFixed(3) + ")";
          ctx.fillRect(-7, -36, 14, 4);
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 0.13;
          ctx.beginPath(); ctx.ellipse(0, 4, 34, 20, 0, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = 1;
        } else {
          ctx.fillStyle = "rgba(120,124,120,0.8)";
          ctx.fillRect(-7, -36, 14, 4);
        }
      } else if (p.type === "watercooler" || p.type === "freezer" || p.type === "vending") {
        const used = (p.uses | 0) <= 0;
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.beginPath(); ctx.ellipse(0, 9, 12, 5, 0, 0, Math.PI * 2); ctx.fill();
        if (p.type === "watercooler") {
          ctx.fillStyle = "#d8dcdb"; ctx.fillRect(-9, -22, 18, 30);
          ctx.fillStyle = used ? "#7f8a8a" : "#8ecfe8"; ctx.fillRect(-7, -34, 14, 14);
          ctx.fillStyle = "#5b6062"; ctx.fillRect(-5, -12, 10, 4);
        } else if (p.type === "freezer") {
          ctx.fillStyle = "#c8ccce"; ctx.fillRect(-14, -26, 28, 34);
          ctx.fillStyle = used ? "rgba(120,130,135,0.7)" : "rgba(190,230,240,0.75)";
          ctx.fillRect(-11, -22, 22, 26);
          ctx.fillStyle = "#6a6e70"; ctx.fillRect(-12, -28, 24, 4);
        } else {
          ctx.fillStyle = "#8e3a3a"; ctx.fillRect(-11, -30, 22, 38);
          ctx.fillStyle = used ? "rgba(60,70,80,0.8)" : "rgba(180,220,235,0.8)";
          ctx.fillRect(-8, -26, 16, 22);
          ctx.fillStyle = "#e8c46a";                       // 售货机里的杏仁水
          if (!used) for (let i = 0; i < 2; i++) ctx.fillRect(-6 + i * 8, -22, 4, 9);
          ctx.fillStyle = "#3a1f1f"; ctx.fillRect(-8, 0, 16, 4);
        }
        if (!used) {                                       // 还能取：给个提示光点
          ctx.fillStyle = "rgba(255,226,150,0.9)";
          ctx.beginPath(); ctx.arc(0, -40, 3, 0, Math.PI * 2); ctx.fill();
        }
      } else if (p.type === "citydoor") {
        const pulse = 0.5 + 0.5 * Math.abs(Math.sin(t * 2.2));
        ctx.shadowColor = "rgba(120,255,190,0.85)";
        ctx.shadowBlur = 20;
        ctx.strokeStyle = "rgba(150,255,205," + (0.5 + pulse * 0.5).toFixed(3) + ")";
        ctx.lineWidth = 2.4;
        ctx.strokeRect(-15, -18, 30, 34);
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(150,255,205,0.92)";
        ctx.font = "bold 9px ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.fillText("L" + p.target, 0, -24);
        ctx.textAlign = "left";
      } else if (p.type === "alley10") {
        ctx.fillStyle = "rgba(140,200,255,0.16)";
        ctx.fillRect(-16, -16, 32, 32);
        ctx.strokeStyle = "rgba(160,215,255,0.8)";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 4]);
        ctx.strokeRect(-16, -16, 32, 32);
        ctx.setLineDash([]);
        ctx.fillStyle = "rgba(200,235,255,0.95)";
        ctx.font = "bold 9px ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.fillText("偏僻小道", 0, -22);
        ctx.textAlign = "left";
      } else if (p.type === "window12" || p.type === "apartment13") {
        ctx.fillStyle = "rgba(210,190,255,0.13)";
        ctx.fillRect(-14, -14, 28, 28);
        ctx.strokeStyle = "rgba(205,185,255,0.6)";
        ctx.lineWidth = 1.6;
        ctx.strokeRect(-14, -14, 28, 28);
        ctx.fillStyle = "rgba(220,205,255,0.85)";
        ctx.font = "bold 9px ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.fillText(p.type === "window12" ? "L12" : "L13", 0, -20);
        ctx.textAlign = "left";
      }
      ctx.restore();
    }

    // 街上的汽车：模样随机，缓缓行驶直到停下
    for (const c of (map.cars || [])) {
      if (vis(c.x, c.y, 80)) continue;
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.beginPath(); ctx.ellipse(0, 10, 24, 8, 0, 0, Math.PI * 2); ctx.fill();
      const horiz = c.dir === 1 || c.dir === -1;
      const bw = horiz ? 44 : 24, bh = horiz ? 22 : 44;
      ctx.fillStyle = c.color;
      ctx.fillRect(-bw / 2, -bh / 2, bw, bh);
      ctx.fillStyle = "rgba(25,30,36,0.85)";                 // 车窗
      if (horiz) ctx.fillRect(-bw / 2 + 8, -bh / 2 + 3, bw - 16, bh - 10);
      else ctx.fillRect(-bw / 2 + 3, -bh / 2 + 8, bw - 6, bh - 16);
      ctx.fillStyle = "rgba(255,240,190,0.55)";              // 车灯（灭着的）
      if (horiz) { ctx.fillRect(c.dir > 0 ? bw / 2 - 4 : -bw / 2, -7, 4, 5); }
      else { ctx.fillRect(-7, c.dir > 0 ? bh / 2 - 4 : -bh / 2, 5, 4); }
      ctx.restore();
    }
  }

  // Level 10 的天气：铅灰色的天空、偶尔的小雨与雾
  function drawWeather(ctx, g, cam) {
    const w = g.weather;
    if (!w) return;
    const left = cam.x - cam.viewW / 2, top = cam.y - cam.viewH / 2;
    if (w.fog > 0) {
      ctx.save();
      ctx.globalAlpha = 0.30 * Math.min(1, w.fog);
      ctx.fillStyle = "#b9bcc0";
      ctx.fillRect(left, top, cam.viewW, cam.viewH);
      ctx.restore();
    }
    if (w.rain > 0) {
      ctx.save();
      ctx.globalAlpha = 0.34 * Math.min(1, w.rain);
      ctx.strokeStyle = "#cfd8dc";
      ctx.lineWidth = 1;
      ctx.beginPath();
      const n = 90;
      for (let i = 0; i < n; i++) {
        const seed = i * 37.13;
        const rx = left + ((seed * 53 + g.time * 220) % cam.viewW);
        const ry = top + ((seed * 91 + g.time * 620) % cam.viewH);
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 5, ry + 16);
      }
      ctx.stroke();
      ctx.restore();
    }
  }

  // Level 14 的树与幻觉、Level 15 的机器与尸体、Level 70 的车与水池
  function drawLevelExtras(ctx, g, cam) {
    const m = g.map;
    if (!m) return;
    // ---- Level 14：会发光的树 / 根本不存在的队友 ----
    if (isLevel(g, 14)) {
      for (const tr of (m.trees || [])) {
        const x = (tr.x + 0.5) * TILE, y = (tr.y + 0.5) * TILE;
        ctx.save(); ctx.translate(x, y);
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.beginPath(); ctx.ellipse(0, 12, 16, 6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#241a14"; ctx.fillRect(-4, -12, 8, 26);
        const sw = 0.5 + 0.5 * Math.sin(g.time * 0.8 + tr.x);
        ctx.fillStyle = "rgba(30,70,45,0.95)";
        ctx.beginPath(); ctx.arc(0, -20 + sw * 2, 19, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(60,120,75,0.85)";
        ctx.beginPath(); ctx.arc(-6, -24 + sw * 2, 12, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(170,255,200,0.10)";
        ctx.beginPath(); ctx.arc(0, -20, 22, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      for (const ph of (m.phantoms || [])) {
        const x = (ph.x + 0.5) * TILE, y = (ph.y + 0.5) * TILE;
        const wv = Math.sin(g.time * 2.2 + ph.ph);
        ctx.save(); ctx.translate(x, y);
        ctx.globalAlpha = 0.30 + 0.18 * Math.sin(g.time * 1.3 + ph.ph);
        ctx.fillStyle = "#d8e8ff";
        ctx.fillRect(-5, -14, 10, 16);                         // 一个"人"
        ctx.beginPath(); ctx.arc(0, -18, 5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#d8e8ff"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(4, -10); ctx.lineTo(9, -18 - wv * 4); ctx.stroke();  // 招手
        ctx.restore();
      }
    }
    // ---- Level 15：玻璃墙机房里的机器 / 干枯的尸体 ----
    if (isLevel(g, 15)) {
      for (const mc of (m.machines || [])) {
        const x = (mc.x + 0.5) * TILE, y = (mc.y + 0.5) * TILE;
        const sz = 12 * mc.size;
        ctx.save(); ctx.translate(x, y);
        ctx.fillStyle = "#8f979e"; ctx.fillRect(-sz, -sz, sz * 2, sz * 2);
        ctx.fillStyle = "#a7afb6"; ctx.fillRect(-sz, -sz, sz * 2, 4);
        if (mc.on) {
          const sp = (g.time * 2 + mc.ph) % 6;
          ctx.fillStyle = "rgba(120,220,255,0.5)";
          ctx.fillRect(-sz + 3, -sz + 5 + (sp | 0) * 2, sz * 2 - 6, 2);
        }
        ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.lineWidth = 1;
        ctx.strokeRect(-sz, -sz, sz * 2, sz * 2);
        ctx.restore();
      }
      for (const b of (m.bodies || [])) {
        const x = (b.x + 0.5) * TILE, y = (b.y + 0.5) * TILE;
        ctx.save(); ctx.translate(x, y);
        ctx.fillStyle = "#c9c3bb"; ctx.fillRect(-13, -6, 26, 11);   // 实验室制服
        ctx.beginPath(); ctx.arc(-15, -4, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(90,20,20,0.75)";                       // 干涸的血
        ctx.fillRect(6, 2, 16, 7);
        ctx.restore();
      }
    }
    // ---- Level 70：车 / 冰屋 / 杏仁水水池 ----
    if (isLevel(g, 70)) {
      for (const ig of (m.igloos || [])) {
        const x = (ig.x + 0.5) * TILE, y = (ig.y + 0.5) * TILE;
        ctx.save(); ctx.translate(x, y);
        ctx.fillStyle = "#eef4f8";
        ctx.beginPath(); ctx.arc(0, 2, 17, Math.PI, 0); ctx.fill();
        ctx.fillStyle = "rgba(150,175,195,0.5)";
        ctx.fillRect(-6, 0, 12, 6);
        ctx.restore();
      }
      for (const f of (m.fountains || [])) {
        if ((f.uses | 0) <= 0) continue;
        const x = (f.x + 0.5) * TILE, y = (f.y + 0.5) * TILE;
        ctx.save(); ctx.translate(x, y);
        ctx.fillStyle = "#8b96a2"; ctx.fillRect(-9, -6, 18, 12);
        ctx.fillStyle = "#cfe3d0"; ctx.fillRect(-6, -3, 12, 6);
        ctx.fillStyle = "rgba(255,240,170,0.85)"; ctx.fillRect(-2, -12, 4, 6);
        ctx.restore();
      }
      for (const v of (m.vehicles || [])) {
        if (!v.alive) continue;
        const x = v.x * TILE, y = v.y * TILE;
        ctx.save(); ctx.translate(x, y);
        const a = Math.atan2(v.vy, v.vx);
        ctx.rotate(a);
        ctx.fillStyle = "#7c848c"; ctx.fillRect(-16, -8, 32, 16);
        ctx.fillStyle = "#5f666d"; ctx.fillRect(-8, -7, 14, 14);
        ctx.fillStyle = "rgba(255,240,150,0.9)"; ctx.fillRect(14, -7, 3, 4); ctx.fillRect(14, 3, 3, 4);
        ctx.restore();
      }
    }
  }

  // Level 1：停车场的承重柱、车位标线与车道
  function drawParkingExtras(ctx, g, cam) {
    const m = g.map;
    if (!m) return;
    const fi = g.floor | 0;
    const P = m.pillarsByFloor ? m.pillarsByFloor[fi] : (fi === 0 ? m.pillars : null);
    const PK = m.parkingByFloor ? m.parkingByFloor[fi] : (fi === 0 ? m.parking : null);
    const LN = m.laneByFloor ? m.laneByFloor[fi] : (fi === 0 ? m.lane : null);
    if (!P || !P.size) return;
    // 标线只画在真正能走的地板上。
    // 车位 / 车道是在柱子摆好之后按"柱墩旁边的地板"登记的，后来在边上加盖房间时
    // 会把这些格子变成墙（房间的外壳）—— 不检查的话白框就画到墙里头去了。
    const gridNow = m.layers ? m.layers[fi] : null;
    const walkOK = (tx, ty) => {
      if (!gridNow) return true;
      if (tx < 0 || ty < 0 || tx >= m.size || ty >= m.size) return false;
      return gridNow[ty][tx] === 0;
    };
    // 注意是 cam.viewW / cam.viewH（cam.w / cam.h 根本不存在，写成 undefined 会让
    // 右边界变成 NaN，结果只有相机中心右下方那几根柱子画得出来）。
    const halfW = (cam.viewW || cam.w || W) / 2, halfH = (cam.viewH || cam.h || H) / 2;
    const x0 = Math.floor((cam.x - halfW) / TILE) - 1, x1 = Math.ceil((cam.x + halfW) / TILE) + 1;
    const y0 = Math.floor((cam.y - halfH) / TILE) - 1, y1 = Math.ceil((cam.y + halfH) / TILE) + 1;

    // 车位标线：白框 + 车轮挡
    ctx.save();
    for (let ty = y0; ty <= y1; ty++) {
      for (let tx = x0; tx <= x1; tx++) {
        if (!PK.has(tx + "," + ty) || !walkOK(tx, ty)) continue;
        const px = tx * TILE, py = ty * TILE;
        ctx.strokeStyle = "rgba(240,238,228,0.42)";
        ctx.lineWidth = 1.6;
        ctx.strokeRect(px + 3.5, py + 3.5, TILE - 7, TILE - 7);
        // 车轮挡
        ctx.fillStyle = "rgba(240,230,190,0.30)";
        ctx.fillRect(px + 8, py + TILE - 12, TILE - 16, 3);
      }
    }
    // 车道：黄色虚线
    for (let ty = y0; ty <= y1; ty++) {
      for (let tx = x0; tx <= x1; tx++) {
        if (!LN.has(tx + "," + ty) || !walkOK(tx, ty)) continue;
        const px = tx * TILE, py = ty * TILE;
        ctx.fillStyle = "rgba(232,196,88,0.34)";
        for (let i = 0; i < 3; i++) ctx.fillRect(px + 4 + i * 13, py + TILE / 2 - 1, 8, 2);
      }
    }
    ctx.restore();

    // 承重柱：混凝土方柱 + 黄黑警示条
    ctx.save();
    for (let ty = y0; ty <= y1; ty++) {
      for (let tx = x0; tx <= x1; tx++) {
        if (!P.has(tx + "," + ty)) continue;
        if (!walkOK(tx, ty)) continue;        // 被房间外壳盖掉的柱子不再画
        const px = tx * TILE, py = ty * TILE;
        ctx.fillStyle = "#6a7278";
        ctx.fillRect(px, py, TILE, TILE);
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.fillRect(px, py, TILE, 4);
        ctx.fillStyle = "rgba(0,0,0,0.30)";
        ctx.fillRect(px, py + TILE - 5, TILE, 5);
      }
    }
    // 警示条：只画在柱墩"最下面那一排"上。
    // 之前对 2x2 柱墩的每一格都画，于是一个柱子出现上下两道，上面那道悬在半空。
    for (const key of P) {
      const p = key.split(",");
      const tx = +p[0], ty = +p[1];
      if (P.has(tx + "," + (ty + 1))) continue;      // 下面还有柱子 -> 不是底排
      if (tx < x0 || tx > x1 || ty < y0 || ty > y1) continue;
      if (!walkOK(tx, ty)) continue;
      const px = tx * TILE, py = ty * TILE;
      ctx.save();
      ctx.translate(px, py);
      ctx.fillStyle = "rgba(240,200,60,0.85)";
      ctx.fillRect(0, TILE - 9, TILE, 4);
      ctx.fillStyle = "rgba(30,30,30,0.75)";
      for (let i = 0; i < 4; i++) ctx.fillRect(i * 10, TILE - 9, 5, 4);
      ctx.restore();
    }
    ctx.restore();
  }

  // 这些类型由 drawNewProps 专门绘制 —— 通用绘制跳过，不然会画成默认箱子/桌子
  const NEW_PROP_TYPES = new Set([
    "arcade", "boiler25", "stairs37", "redtunnel", "pool4",
    "stairTop", "midHole", "whiteHole", "whitelight",
    "pillarEnd", "shelfEnd", "bookEnd", "exitDoorEnd", "darkDoorEnd", "grooveEnd",
    "junctionHole", "existDoor", "exist11", "door37", "guarddoor25",
  ]);
  // Level 5 旅馆 / 锅炉房的物件由 drawHotelProps 专门绘制。
  // 通用分支不跳过的话，画完专属模型之后又会再糊一张默认桌子上去 ——
  // 玩家眼里就是"锅炉、麻将桌、煤堆全都长得一样"。
  const HOTEL_PROPS = new Set([
    "boiler", "cabinet", "coal5", "furnace", "mahjong", "pipe",
    "sconce", "shelf", "tank5", "valve5", "vent5", "stairs6", "stairs7",
  ]);
  function drawProps(ctx, g, cam) {
    const list = g.map.props || [];
    for (const p of list) {
      if ((p.floor | 0) !== g.floor) continue;
      if (NEW_PROP_TYPES.has(p.type)) continue;
      // 1.2.0 批次：注册了专属模型的物件由 drawBatchProps 画 ——
      // 不放行的话会被通用分支画成默认箱子/桌子
      if (window.PROP_DRAW && window.PROP_DRAW[p.type]) continue;
      // Level 5：专属模型由 drawHotelProps 画过了，这里跳过，别再盖上默认桌子
      if (isLevel(g, 5) && HOTEL_PROPS.has(p.type)) continue;
      if (CITY_PROPS.has(p.type)) continue;      // 城市物件由 drawCityExtras 负责
      if (p.type === "lamp9" || p.type === "sign9") continue;   // 郊区的路灯与路牌单独画
      const x = (p.x + 0.5) * TILE, y = (p.y + 0.5) * TILE;
      ctx.save();
      ctx.translate(x, y);
      // 落地阴影
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.beginPath();
      ctx.ellipse(0, 8, 15, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      // 还没翻过的破损箱子：给个提示，让人知道这里能搜
      if (p.type === "brokenCrate" && p.contains && !p.opened) {
        ctx.fillStyle = "rgba(255,226,150,0.85)";
        ctx.beginPath();
        ctx.arc(0, -22, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowColor = "rgba(255,220,130,0.8)";
        ctx.shadowBlur = 10;
        ctx.fillRect(-1, -20, 2, 5);
        ctx.shadowBlur = 0;
      }
      if (p.type === "sofa") {                      // 沙发
        ctx.fillStyle = "#5a4a44"; ctx.fillRect(-16, -10, 32, 14);
        ctx.fillStyle = "#6a5850"; ctx.fillRect(-16, -14, 32, 6);
        ctx.fillStyle = "#4a3c36"; ctx.fillRect(-16, -4, 6, 8); ctx.fillRect(10, -4, 6, 8);
      } else if (p.type === "fridge") {              // 冰箱：维持着对基本食品的供应
        ctx.fillStyle = "#cfd3d6"; ctx.fillRect(-13, -22, 26, 30);
        ctx.fillStyle = "#e8ecef"; ctx.fillRect(-13, -22, 26, 4);
        ctx.fillStyle = "rgba(0,0,0,0.22)"; ctx.fillRect(-1, -20, 2, 26);
        ctx.fillStyle = "#9aa1a6"; ctx.fillRect(4, -12, 3, 9);
      } else if (p.type === "table") {               // 餐桌
        ctx.fillStyle = "#7a6248"; ctx.fillRect(-17, -8, 34, 16);
        ctx.fillStyle = "#6b5540"; ctx.fillRect(-15, 4, 4, 8); ctx.fillRect(11, 4, 4, 8);
      } else if (p.type === "wardrobe") {            // 玄关的衣橱
        ctx.fillStyle = "#6e5b48"; ctx.fillRect(-14, -24, 28, 32);
        ctx.fillStyle = "rgba(0,0,0,0.25)"; ctx.fillRect(-1, -22, 2, 28);
        ctx.fillStyle = "#c9b98f"; ctx.fillRect(-4, -10, 3, 3); ctx.fillRect(2, -10, 3, 3);
      } else if (p.type === "log") {                 // 森林里倒下的树干
        ctx.fillStyle = "#3b2a20"; ctx.fillRect(-18, -4, 36, 9);
        ctx.fillStyle = "#4a362a"; ctx.fillRect(-18, -6, 36, 3);
        ctx.fillStyle = "rgba(140,220,160,0.16)"; ctx.fillRect(-14, -7, 10, 2);
      } else if (p.type === "terminal") {            // 实验室里的电脑（能连上 I.L.N.）
        ctx.fillStyle = "#2b2f36"; ctx.fillRect(-15, -16, 30, 20);
        ctx.fillStyle = "#3f4650"; ctx.fillRect(-13, -14, 26, 15);
        ctx.fillStyle = "rgba(120,255,180,0.55)";
        ctx.font = "bold 7px ui-monospace, monospace"; ctx.textAlign = "center";
        ctx.fillText("AVALON", 0, -5); ctx.textAlign = "left";
      } else if (p.type === "tv") {                 // 电视（没有电源，屏幕是死的）
        ctx.fillStyle = "#2a2c30"; ctx.fillRect(-14, -18, 28, 18);
        ctx.fillStyle = "#15171a"; ctx.fillRect(-11, -15, 22, 13);
        ctx.fillStyle = "rgba(120,140,160,0.08)"; ctx.fillRect(-11, -15, 22, 4);
        ctx.fillStyle = "#3a3d42"; ctx.fillRect(-3, 0, 6, 8); ctx.fillRect(-10, 7, 20, 3);
      } else if (p.type === "bed") {                // 床（占两格：床头那格 + 床身）
        // 单格画出来太小了，看着像个坐垫 —— 现在两格拼一张大床
        if (p.bedPart === 1) {
          // 床身：铺开的被褥，一直铺到床尾
          ctx.fillStyle = "#4e4640"; ctx.fillRect(-20, -10, 40, 24);
          ctx.fillStyle = "#8a8278"; ctx.fillRect(-20, -8, 40, 10);
          ctx.fillStyle = "#7a7268"; ctx.fillRect(-20, 2, 40, 10);
          ctx.fillStyle = "rgba(0,0,0,0.18)"; ctx.fillRect(-20, 10, 40, 4);
        } else {
          // 床头那一格：带床头板与枕头
          ctx.fillStyle = "#5a524a"; ctx.fillRect(-20, -18, 40, 8);      // 床头板
          ctx.fillStyle = "#4e4640"; ctx.fillRect(-20, -10, 40, 24);
          ctx.fillStyle = "#8a8278"; ctx.fillRect(-20, -8, 40, 10);
          ctx.fillStyle = "#a09a90"; ctx.fillRect(-14, -16, 16, 7);      // 枕头
          ctx.fillStyle = "rgba(0,0,0,0.18)"; ctx.fillRect(-20, 10, 40, 4);
        }
      } else if (p.type === "fridge") {             // 冰箱（里面的东西多半早就坏了）
        ctx.fillStyle = "#b8bcc0"; ctx.fillRect(-11, -22, 22, 28);
        ctx.fillStyle = "#9aa0a4"; ctx.fillRect(-11, -12, 22, 2);
        ctx.fillStyle = "#6a6e72"; ctx.fillRect(-9, -20, 3, 8); ctx.fillRect(-9, -8, 3, 8);
      } else if (p.type === "yardtable") {          // 后院里布置齐全的桌椅
        ctx.fillStyle = "#6b5540"; ctx.fillRect(-13, -6, 26, 12);
        ctx.fillStyle = "#5a4632"; ctx.fillRect(-13, -6, 26, 3);
        ctx.fillStyle = "#6b5540"; ctx.fillRect(-19, 0, 6, 9); ctx.fillRect(13, 0, 6, 9);
      } else if (p.type === "fieldpath") {               // Level 4：通往草地的人行道
        ctx.fillStyle = "rgba(120,180,90,0.22)";
        ctx.fillRect(-18, -18, 36, 36);
        ctx.strokeStyle = "rgba(150,215,120,0.85)";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(-18, -18, 36, 36);
        ctx.setLineDash([]);
        ctx.fillStyle = "rgba(190,240,170,0.95)";
        ctx.font = "bold 9px ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.fillText("→ 草地", 0, -24);
        ctx.textAlign = "left";
      } else if (p.type === "cave9") {                  // 岩洞深处通往郊区的裂隙
        ctx.fillStyle = "rgba(6,10,18,0.9)";
        ctx.beginPath();
        ctx.moveTo(0, -26); ctx.lineTo(11, -6); ctx.lineTo(7, 22);
        ctx.lineTo(-6, 20); ctx.lineTo(-10, -4);
        ctx.closePath();
        ctx.fill();
        const pulse = 0.4 + 0.6 * Math.abs(Math.sin(gTimeRef * 1.8));
        ctx.strokeStyle = "rgba(150,190,140," + pulse.toFixed(3) + ")";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = "rgba(180,215,170,0.85)";
        ctx.font = "bold 9px ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.fillText("→ L9", 0, -32);
        ctx.textAlign = "left";
      } else if (p.type === "lumber") {                 // 木材堆（Level 10 的构筑物里）
        ctx.fillStyle = "#8a6a3c";
        for (let i = 0; i < 3; i++) ctx.fillRect(-14, -2 - i * 5, 28, 4);
        ctx.fillStyle = "rgba(60,42,20,0.6)";
        for (let i = 0; i < 3; i++) ctx.fillRect(-14, -2 - i * 5, 28, 1);
      } else if (p.type === "nails") {           // 钉子箱
        ctx.fillStyle = "#6b5335";
        ctx.fillRect(-11, -9, 22, 12);
        ctx.fillStyle = "#8d7146";
        ctx.fillRect(-11, -11, 22, 3);
        ctx.fillStyle = "#c9ccd0";
        for (let i = 0; i < 4; i++) ctx.fillRect(-8 + i * 5, -8, 2, 6);
      } else if (p.type === "longtable") {
        // 会议室的长桌：尺寸精确统一，围着一圈椅子
        ctx.fillStyle = "#8a6f4a";
        ctx.fillRect(-19, -8, 38, 14);
        ctx.strokeStyle = "#4a3a24";
        ctx.lineWidth = 1.3;
        ctx.strokeRect(-19, -8, 38, 14);
        ctx.fillStyle = "rgba(255,255,255,0.10)";
        ctx.fillRect(-19, -8, 38, 2);
        // 桌上的纸与杯装杏仁水
        ctx.fillStyle = "#efe8cf";
        ctx.fillRect(-12, -5, 7, 5);
        ctx.fillRect(4, -5, 7, 5);
        ctx.fillStyle = "#d8e6c8";
        ctx.fillRect(13, -4, 3, 5);
        // 一圈椅子
        ctx.fillStyle = "#5a5148";
        for (let i = -1; i <= 1; i++) {
          ctx.fillRect(i * 12 - 4, -14, 8, 5);
          ctx.fillRect(i * 12 - 4, 8, 8, 5);
        }
      } else if (p.type === "chair") {
        // 办公椅：座面 + 靠背 + 五爪底座
        ctx.fillStyle = "#4d5257";
        ctx.fillRect(-6, -2, 12, 8);
        ctx.fillRect(-6, -10, 12, 8);
        ctx.strokeStyle = "#2a2e32";
        ctx.lineWidth = 1;
        ctx.strokeRect(-6, -10, 12, 8);
        ctx.strokeStyle = "#33383d";
        ctx.beginPath();
        ctx.moveTo(0, 6); ctx.lineTo(-7, 11);
        ctx.moveTo(0, 6); ctx.lineTo(7, 11);
        ctx.moveTo(0, 6); ctx.lineTo(0, 12);
        ctx.stroke();
      } else if (p.type === "cubicle") {
        // 办公隔间：隔板 + 桌板 + 一台还亮着的显示器
        ctx.fillStyle = "#9aa0a4";
        ctx.fillRect(-16, -14, 32, 4);
        ctx.fillRect(-16, -14, 4, 18);
        ctx.fillStyle = "#7f858a";
        ctx.fillRect(12, -14, 4, 18);
        ctx.fillStyle = "#8a6f4a";
        ctx.fillRect(-12, -2, 22, 3);
        // 显示器：蓝幽幽的光
        ctx.fillStyle = "#22262b";
        ctx.fillRect(-8, -10, 12, 8);
        ctx.fillStyle = "rgba(120,180,235,0.75)";
        ctx.fillRect(-7, -9, 10, 6);
        ctx.shadowColor = "rgba(120,180,235,0.6)";
        ctx.shadowBlur = 10;
        ctx.fillRect(-7, -9, 10, 6);
        ctx.shadowBlur = 0;
      } else if (p.type === "soakedFurn") {
        drawSoakedFurn(ctx, p);
      } else if (p.type === "brokenCrate") {
        // 破木箱：箱体歪斜、盖子掀开、木板断裂
        ctx.fillStyle = "#6b5433";
        ctx.strokeStyle = "#3d2f1c";
        ctx.lineWidth = 1.4;
        ctx.fillRect(-13, -12, 26, 20);
        ctx.strokeRect(-13, -12, 26, 20);
        ctx.strokeStyle = "rgba(40,30,16,0.85)";
        ctx.beginPath();
        ctx.moveTo(-13, -4); ctx.lineTo(13, -4);
        ctx.moveTo(-4, -12); ctx.lineTo(-4, 8);
        ctx.stroke();
        // 掀开的盖子
        ctx.fillStyle = "#7d6440";
        ctx.beginPath();
        ctx.moveTo(-13, -12); ctx.lineTo(6, -19); ctx.lineTo(19, -12); ctx.lineTo(13, -11);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#3d2f1c";
        ctx.stroke();
      } else if (p.type === "cot") {                 // 午睡室的小床
        ctx.fillStyle = "#c8b48e";
        ctx.fillRect(-16, -8, 32, 14);
        ctx.fillStyle = "#e8e2d2";                   // 被子
        ctx.fillRect(-16, -8, 22, 8);
        ctx.fillStyle = "#9ec4d8";                   // 枕头
        ctx.fillRect(-15, -10, 10, 5);
        ctx.strokeStyle = "rgba(90,74,50,0.6)";
        ctx.lineWidth = 1.2;
        ctx.strokeRect(-16, -8, 32, 14);
        ctx.fillStyle = "#8a7754";
        ctx.fillRect(-16, 4, 3, 5); ctx.fillRect(13, 4, 3, 5);
      } else if (p.type === "ballpit") {             // 海洋球池：一堆彩色小球
        ctx.fillStyle = "#7ec8e8";
        ctx.beginPath(); ctx.ellipse(0, 0, 17, 12, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#4f9dbd"; ctx.lineWidth = 2; ctx.stroke();
        const col = ["#f2b04a", "#e8604a", "#8fd07a", "#f2e05a", "#c78ae0"];
        for (let i = 0; i < 9; i++) {
          const a = (i * 2.399), r = 3 + (i % 3) * 4;
          ctx.fillStyle = col[i % col.length];
          ctx.beginPath();
          ctx.arc(Math.cos(a) * r, Math.sin(a) * r * 0.62 - 2, 3.4, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (p.type === "bookshelf") {           // 绘本角的矮书架
        ctx.fillStyle = "#c99a63";
        ctx.fillRect(-16, -16, 32, 26);
        ctx.strokeStyle = "#8a6740"; ctx.lineWidth = 1.3;
        ctx.strokeRect(-16, -16, 32, 26);
        ctx.fillStyle = "rgba(60,42,24,0.5)";
        ctx.fillRect(-16, -5, 32, 3); ctx.fillRect(-16, 5, 32, 3);
        const bc = ["#e0705a", "#6fa8d8", "#8fc06a", "#e8c65a"];
        for (let i = 0; i < 7; i++) {
          ctx.fillStyle = bc[i % bc.length];
          ctx.fillRect(-14 + i * 4, -14, 3, 8);
        }
        for (let i = 0; i < 6; i++) {
          ctx.fillStyle = bc[(i + 2) % bc.length];
          ctx.fillRect(-14 + i * 4.6, -2, 3.4, 6);
        }
      } else if (p.type === "piano") {               // 音乐室的小钢琴
        ctx.fillStyle = "#3a3230";
        ctx.fillRect(-18, -12, 36, 18);
        ctx.fillStyle = "#f2f0ea";                   // 白键
        for (let i = 0; i < 9; i++) ctx.fillRect(-17 + i * 3.8, -6, 3, 10);
        ctx.fillStyle = "#22201f";                   // 黑键
        for (let i = 0; i < 9; i++) if (i % 3 !== 0 && i % 3 !== 2) ctx.fillRect(-15 + i * 3.8, -6, 2, 6);
        ctx.strokeStyle = "#1e1a19"; ctx.lineWidth = 1.4;
        ctx.strokeRect(-18, -12, 36, 18);
      } else if (p.type === "easel") {               // 美术角的画架
        ctx.strokeStyle = "#a8814e"; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-9, 12); ctx.lineTo(0, -14); ctx.lineTo(9, 12);
        ctx.stroke();
        ctx.fillStyle = "#f5f2e8";
        ctx.fillRect(-11, -14, 22, 16);
        ctx.strokeStyle = "#b8b09a"; ctx.lineWidth = 1.2;
        ctx.strokeRect(-11, -14, 22, 16);
        ctx.fillStyle = ["#e0705a", "#6fa8d8", "#8fc06a"][Math.floor(Math.abs(p.x) % 3)];
        ctx.fillRect(-7, -9, 14, 7);
      } else if (p.type === "blackboard") {          // 教室的黑板
        ctx.fillStyle = "#8a7a5e";
        ctx.fillRect(-18, -16, 36, 26);
        ctx.fillStyle = "#2f4433";
        ctx.fillRect(-15, -13, 30, 20);
        ctx.strokeStyle = "rgba(230,230,220,0.5)"; ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(-11, -6); ctx.lineTo(-4, -9); ctx.lineTo(3, -5); ctx.lineTo(10, -8);
        ctx.stroke();
        ctx.fillStyle = "#f2ead6";                   // 粉笔槽
        ctx.fillRect(-15, 5, 30, 3);
      } else if (p.type === "partytable") {          // 派对的大桌子
        ctx.fillStyle = "#8a5a34";
        ctx.fillRect(-18, -10, 36, 20);
        ctx.fillStyle = "#a87045";
        ctx.fillRect(-18, -10, 36, 5);
        ctx.strokeStyle = "rgba(50,30,14,0.6)"; ctx.lineWidth = 1.3;
        ctx.strokeRect(-18, -10, 36, 20);
      } else if (p.type === "cake") {                // 蛋糕：一层奶油，上面插着蜡烛
        ctx.fillStyle = "#f2e0c8";
        ctx.fillRect(-8, -14, 16, 11);
        ctx.fillStyle = "#e8c9e0";
        ctx.fillRect(-8, -17, 16, 4);
        ctx.fillStyle = "#d94f4f";
        ctx.fillRect(-8, -14, 16, 2.5);
        const t3 = (gTimeRef || 0);
        for (let i = 0; i < 3; i++) {
          const fx = -5 + i * 5;
          ctx.strokeStyle = "#f5f0e0"; ctx.lineWidth = 1.6;
          ctx.beginPath(); ctx.moveTo(fx, -17); ctx.lineTo(fx, -22); ctx.stroke();
          ctx.fillStyle = "rgba(255,190,60," + (0.75 + 0.25 * Math.sin(t3 * 8 + i)).toFixed(2) + ")";
          ctx.beginPath(); ctx.arc(fx, -23.5, 1.8, 0, Math.PI * 2); ctx.fill();
        }
      } else if (p.type === "fruit") {               // 水果
        ctx.fillStyle = ["#d94f4f", "#5fbf5f", "#e0b23c"][Math.floor(Math.abs(p.x) % 3)];
        ctx.beginPath(); ctx.arc(0, 0, 4.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.28)";
        ctx.beginPath(); ctx.arc(-1.4, -1.4, 1.5, 0, Math.PI * 2); ctx.fill();
      } else if (p.type === "partychair") {          // 颜色不一的椅子
        ctx.fillStyle = p.color || "#d94f4f";
        ctx.fillRect(-7, -9, 14, 13);
        ctx.fillRect(-7, -13, 14, 5);
        ctx.fillStyle = "rgba(0,0,0,0.28)";
        ctx.fillRect(-7, 2, 14, 2);
      } else if (p.type === "toyshelf") {            // 玩具架
        ctx.fillStyle = "#d8a86e";
        ctx.fillRect(-15, -14, 30, 24);
        ctx.strokeStyle = "#96693d"; ctx.lineWidth = 1.3;
        ctx.strokeRect(-15, -14, 30, 24);
        ctx.fillStyle = "rgba(80,56,30,0.45)";
        ctx.fillRect(-15, -4, 30, 3);
        const tc = ["#e8604a", "#6fa8d8", "#f2c14a"];
        ctx.fillStyle = tc[0]; ctx.beginPath(); ctx.arc(-9, -9, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = tc[1]; ctx.fillRect(0, -12, 8, 7);
        ctx.fillStyle = tc[2]; ctx.beginPath(); ctx.arc(7, 4, 4.5, 0, Math.PI * 2); ctx.fill();
      } else if (p.type === "mat") {                 // 彩色地垫
        ctx.fillStyle = ["#f3d9a4", "#cfe6c0", "#f2cdc4", "#cfe0f0"][Math.floor(Math.abs(p.x + p.y) % 4)];
        ctx.fillRect(-18, -12, 36, 24);
        ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = 1.4;
        ctx.strokeRect(-16, -10, 32, 20);
      } else if (p.type === "desk") {                // 幼儿园的小桌椅
        ctx.fillStyle = "#e0c08e";
        ctx.beginPath(); ctx.ellipse(0, -2, 13, 9, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#a8814e"; ctx.lineWidth = 1.4; ctx.stroke();
        ctx.fillStyle = "#c9a86e";
        ctx.fillRect(-3, 3, 6, 8);
      } else if (p.type === "cabinet") {          // 玄关 / 办公室的柜子
        ctx.fillStyle = "rgba(0,0,0,0.32)";
        ctx.beginPath(); ctx.ellipse(0, 10, 16, 5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#6b5843";
        ctx.fillRect(-14, -20, 28, 32);
        ctx.fillStyle = "#7d6a52";                 // 顶上的高光
        ctx.fillRect(-14, -20, 28, 3);
        ctx.strokeStyle = "#4a3c2c"; ctx.lineWidth = 1.2;
        ctx.strokeRect(-14, -20, 28, 32);
        ctx.fillStyle = "rgba(0,0,0,0.30)";        // 两扇门之间的缝
        ctx.fillRect(-1, -18, 2, 28);
        ctx.fillStyle = "#c9b98a";                 // 把手
        ctx.fillRect(-6, -4, 4, 2);
        ctx.fillRect(2, -4, 4, 2);
      } else {
        // 桌子：桌面 + 四条腿
        ctx.fillStyle = "#5d5148";
        ctx.fillRect(-15, -11, 30, 9);
        ctx.strokeStyle = "#332c26";
        ctx.lineWidth = 1.2;
        ctx.strokeRect(-15, -11, 30, 9);
        ctx.fillStyle = "#463c34";
        ctx.fillRect(-14, -2, 4, 10);
        ctx.fillRect(10, -2, 4, 10);
        ctx.fillStyle = "rgba(255,255,255,0.06)";
        ctx.fillRect(-15, -11, 30, 2);
      }
      ctx.restore();
    }
  }

  // 地上的物品：杏仁水（琥珀色）/ 受污染的杏仁水（发绿的浑浊）/ 撬棍
  function drawGroundItems(ctx, g, cam) {
    const list = g.map.ground || [];
    const t = g.time;
    for (const it of list) {
      if (it.taken || (it.floor | 0) !== g.floor) continue;
      const x = (it.x + 0.5) * TILE, y = (it.y + 0.5) * TILE;
      const bob = Math.sin(t * 2.4 + it.x * 0.7) * 1.2;
      ctx.save();
      ctx.translate(x, y + bob);
      drawItemSprite(ctx, it, t, bob);
      ctx.restore();
    }
  }

  // 物品本体：地图上的样子与物品栏图标共用这一段绘制。
  // 没有物品栏专属贴图的物品，图标就是它按同一段代码缩小画出来的版本 ——
  // 不再另画一套，也不会出现空白方块。
  function drawItemSprite(ctx, it, t, bob) {
      const bobY = bob || 0;
      ctx.fillStyle = "rgba(0,0,0,0.32)";
      ctx.beginPath();
      ctx.ellipse(0, 7 - bobY, 8, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
      if (it.item === "block") {                 // 掉漆的积木：一块磨圆了边角的木头方块
        ctx.fillStyle = "rgba(0,0,0,0.28)";
        ctx.beginPath(); ctx.ellipse(0, 8, 8, 3, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#c8694a";
        ctx.fillRect(-7, -7, 14, 14);
        ctx.fillStyle = "rgba(255,255,255,0.22)";
        ctx.fillRect(-7, -7, 14, 3);
        // 掉漆：露出底下的木头色
        ctx.fillStyle = "#d8b98a";
        ctx.fillRect(1, -2, 5, 4);
        ctx.fillRect(-5, 3, 4, 3);
        ctx.strokeStyle = "rgba(60,30,20,0.55)";
        ctx.lineWidth = 1.1;
        ctx.strokeRect(-7.5, -7.5, 15, 15);
        // 上面原本有个字母，磨得只剩一点痕迹
        ctx.fillStyle = "rgba(70,40,25,0.35)";
        ctx.fillRect(-2, -3, 4, 1.4);
        ctx.fillRect(-0.7, -3, 1.4, 5);
      } else if (it.item === "frog") {           // 发条青蛙：铁皮的，背上有一把发条钥匙
        ctx.fillStyle = "rgba(0,0,0,0.28)";
        ctx.beginPath(); ctx.ellipse(0, 8, 9, 3.2, 0, 0, Math.PI * 2); ctx.fill();
        // 身子
        ctx.fillStyle = "#5f8f4e";
        ctx.beginPath(); ctx.ellipse(0, 1, 9, 6, 0, 0, Math.PI * 2); ctx.fill();
        // 高光
        ctx.fillStyle = "rgba(210,255,190,0.30)";
        ctx.beginPath(); ctx.ellipse(-3, -1, 4, 2.2, -0.4, 0, Math.PI * 2); ctx.fill();
        // 头 + 两只眼睛
        ctx.fillStyle = "#6fa35c";
        ctx.beginPath(); ctx.ellipse(-7, -4, 4.5, 3.6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#20301c";
        ctx.beginPath(); ctx.arc(-8, -5.4, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(-5.4, -5.4, 1.5, 0, Math.PI * 2); ctx.fill();
        // 后腿：折起来的
        ctx.strokeStyle = "#4b7440";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(3, 4); ctx.lineTo(7, 7); ctx.lineTo(2, 8);
        ctx.stroke();
        // 背上的发条钥匙
        ctx.strokeStyle = "#c9c2a4";
        ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(4, -3); ctx.lineTo(7, -7); ctx.stroke();
        ctx.strokeStyle = "#a8a289";
        ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.arc(7, -7, 2.2, 0, Math.PI * 2); ctx.stroke();
      } else if (it.item === "camera") {
        // M.E.G 摄像机：黑色机身 + 银色镜头 + 一颗红录制灯 + 皮提带
        ctx.fillStyle = "rgba(0,0,0,0.30)";
        ctx.beginPath(); ctx.ellipse(0, 8, 11, 3.5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#22252a";
        ctx.beginPath();
        ctx.moveTo(-10, -6); ctx.lineTo(9, -7); ctx.lineTo(10, 6); ctx.lineTo(-9, 7);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = "#0f1114"; ctx.lineWidth = 1.1; ctx.stroke();
        // 提带
        ctx.strokeStyle = "#6b6250"; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(-6, -6); ctx.quadraticCurveTo(-2, -14, 5, -7); ctx.stroke();
        // 镜头（朝右）
        ctx.fillStyle = "#4c525a"; ctx.fillRect(8, -4, 4, 8);
        ctx.fillStyle = "#191d22";
        ctx.beginPath(); ctx.ellipse(11.5, 0, 2.2, 3.6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(120,170,210,0.55)";
        ctx.beginPath(); ctx.ellipse(11.8, -0.8, 0.8, 1.1, 0, 0, Math.PI * 2); ctx.fill();
        // 录制灯
        ctx.fillStyle = (Math.sin(t * 5 + it.x) > 0 ? "#ff4a3a" : "#6b2822");
        ctx.beginPath(); ctx.arc(-6, -3.5, 1.7, 0, Math.PI * 2); ctx.fill();
        // 机身上一道高光
        ctx.fillStyle = "rgba(255,255,255,0.10)";
        ctx.fillRect(-8, -5, 16, 1.8);
      } else if (it.item === "film_normal" || it.item === "film_premium" || it.item === "tape") {
        // 胶卷 / 录像带：黑色方盒 + 双卷轴 + 封条，普通米色、高级银色、拍完的贴红条
        const premium = it.item === "film_premium", used = it.item === "tape";
        ctx.fillStyle = "rgba(0,0,0,0.28)";
        ctx.beginPath(); ctx.ellipse(0, 8, 10, 3, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#1b1e22";
        ctx.fillRect(-9, -7, 18, 14);
        ctx.strokeStyle = premium ? "#c8d2dc" : "#4a4438";
        ctx.lineWidth = 1.2; ctx.strokeRect(-9, -7, 18, 14);
        ctx.fillStyle = premium ? "#dfe7ee" : (used ? "#9c3b32" : "#d8cba4");
        ctx.fillRect(-7, -4, 14, 3.6);
        ctx.fillStyle = "#24272b";
        for (const cx of [-4, 4]) {
          ctx.beginPath(); ctx.arc(cx, 2.5, 2.6, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#8b9199";
          ctx.beginPath(); ctx.arc(cx, 2.5, 0.9, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#24272b";
        }
        if (used) { ctx.fillStyle = "#ff6a58"; ctx.fillRect(-6, -3.2, 12, 1.1); }
      } else if (it.item === "crowbar") {
        ctx.strokeStyle = "#8b9199";
        ctx.lineWidth = 3.4;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(-8, 4); ctx.lineTo(7, -4);
        ctx.stroke();
        ctx.strokeStyle = "#5b6169";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(7, -4); ctx.lineTo(11, -8);
        ctx.stroke();
      } else if (it.item === "hermes") {       // UEC 寄来的包裹：牛皮纸箱 + 胶带 + 面单
        ctx.fillStyle = "rgba(0,0,0,0.30)";
        ctx.beginPath(); ctx.ellipse(0, 8, 11, 4, 0, 0, Math.PI * 2); ctx.fill();
        // 箱体：略微前倾，像随手放在地上
        ctx.fillStyle = "#b08556";
        ctx.beginPath();
        ctx.moveTo(-10, -7); ctx.lineTo(10, -9);
        ctx.lineTo(11, 6); ctx.lineTo(-9, 8);
        ctx.closePath(); ctx.fill();
        // 侧面暗一点，撑出体积
        ctx.fillStyle = "#8d6740";
        ctx.beginPath();
        ctx.moveTo(-9, 8); ctx.lineTo(11, 6);
        ctx.lineTo(11, 9); ctx.lineTo(-9, 11);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = "rgba(70,45,22,0.65)";
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(-10, -7); ctx.lineTo(10, -9); ctx.lineTo(11, 6); ctx.lineTo(-9, 8);
        ctx.closePath(); ctx.stroke();
        // 十字胶带
        ctx.fillStyle = "#d8c9a4";
        ctx.fillRect(-10, -2.2, 20.5, 2.6);
        ctx.fillRect(-1.2, -9, 2.6, 18);
        // 面单
        ctx.fillStyle = "#f2ede0";
        ctx.fillRect(2, -7, 7, 5);
        ctx.strokeStyle = "rgba(90,70,45,0.7)";
        ctx.lineWidth = 0.8;
        ctx.strokeRect(2, -7, 7, 5);
        ctx.fillStyle = "#6a5a44";
        ctx.fillRect(3, -6.2, 5, 0.7);
        ctx.fillRect(3, -4.8, 3.4, 0.7);
        // 箱角那点反光
        ctx.fillStyle = "rgba(255,240,210,0.22)";
        ctx.beginPath(); ctx.moveTo(-10, -7); ctx.lineTo(-4, -7.6); ctx.lineTo(-4, -4); ctx.lineTo(-10, -3.4);
        ctx.closePath(); ctx.fill();
      } else if (it.item === "teddy" || it.item === "plush") {
        // 毛绒玩具：圆脑袋、两只耳朵、圆身子；玩具熊掉了一只耳朵
        const bear = it.item === "teddy";
        const fur = bear ? "#b9a488" : "#d8a6bb";
        ctx.fillStyle = fur;
        ctx.beginPath(); ctx.ellipse(0, 2, 7.5, 6.5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(0, -5.5, 5.2, 0, Math.PI * 2); ctx.fill();
        if (bear) { ctx.beginPath(); ctx.arc(-4.6, -9.2, 2.2, 0, Math.PI * 2); ctx.fill(); }
        ctx.beginPath(); ctx.arc(4.6, -9.2, 2.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#3a2c22";
        ctx.beginPath(); ctx.arc(-1.8, -6, 0.9, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(1.8, -6, 0.9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,.22)";
        ctx.beginPath(); ctx.ellipse(-2.5, -7, 2, 1.2, -0.4, 0, Math.PI * 2); ctx.fill();
      } else if (it.item === "warpberry" || it.item === "bntgwarp") {
        // 迁跃浆果：野生的紫得发黑，B.N.T.G 培育的个头匀、颜色亮
        const wild = it.item === "warpberry";
        const cols = wild ? ["#2b1140", "#3d1a55"] : ["#6b3fa0", "#8a55c0"];
        const pts = [[-5, 2], [4.5, 0], [0, -4]];
        for (let i = 0; i < pts.length; i++) {
          const p = pts[i];
          ctx.fillStyle = cols[i % 2];
          ctx.beginPath(); ctx.arc(p[0], p[1], i === 2 ? 4.2 : 3.6, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "rgba(220,190,255,.45)";
          ctx.beginPath(); ctx.arc(p[0] - 1.1, p[1] - 1.2, 1.1, 0, Math.PI * 2); ctx.fill();
        }
        ctx.strokeStyle = "#4a3b22"; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(0, -10); ctx.stroke();
      } else if (it.item === "ksuit" || it.item === "coldsuit" || it.item === "wintercoat") {
        // 三套衣服：K 版防化服（黄）、防寒服（结霜白）、冬装（深蓝）
        const c = it.item === "ksuit" ? "#d8c14a"
          : it.item === "coldsuit" ? "#c9d6e2" : "#45617d";
        const trim = it.item === "ksuit" ? "#8c7a20"
          : it.item === "coldsuit" ? "#8fa4b8" : "#2e4358";
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.moveTo(-4, -9); ctx.lineTo(4, -9); ctx.lineTo(6.5, -5);
        ctx.lineTo(6, 7); ctx.lineTo(-6, 7); ctx.lineTo(-6.5, -5);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = trim; ctx.lineWidth = 1.1; ctx.stroke();
        ctx.fillStyle = trim;
        ctx.fillRect(-3.2, -8, 6.4, 3.2);
        ctx.fillStyle = "rgba(255,255,255,.28)";
        ctx.fillRect(-4.8, -3, 1.5, 8);
        if (it.item === "coldsuit") {
          ctx.fillStyle = "rgba(255,255,255,.7)";
          ctx.fillRect(-6, 1, 12, 1.1);
        }
      } else if (it.item === "subkey") {
        // 潜艇钥匙：泡过水的暗黄铜
        ctx.strokeStyle = "#a9883c"; ctx.lineWidth = 2.2; ctx.lineCap = "round";
        ctx.beginPath(); ctx.arc(-5.5, -2, 3.1, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-2.5, -2); ctx.lineTo(8, -2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(6, -2); ctx.lineTo(6, 2); ctx.moveTo(8, -2); ctx.lineTo(8, 4); ctx.stroke();
      } else if (it.item === "bag1" || it.item === "bag2" || it.item === "bag3" || it.item === "bag4") {
        // 挎包 / 背包：越大的包鼓得越明显
        const n = Number(it.item.slice(3)) || 1;
        const w = 6 + n * 1.6;
        ctx.fillStyle = n === 4 ? "#6a6f62" : "#9a7b4a";
        ctx.beginPath();
        ctx.moveTo(-w, -4); ctx.lineTo(w, -4); ctx.lineTo(w - 1, 8); ctx.lineTo(-w + 1, 8);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = "#4a3720"; ctx.lineWidth = 1.1; ctx.stroke();
        ctx.strokeStyle = "#6b5b3c"; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.moveTo(-w + 1, -4); ctx.quadraticCurveTo(0, -12, w - 1, -4); ctx.stroke();
        ctx.fillStyle = "#5d4a2c"; ctx.fillRect(-w + 2, 1, w * 2 - 4, 3.2);
      } else if (it.item === "bntgcoin") {
        ctx.fillStyle = "#d9b94e";
        ctx.beginPath(); ctx.ellipse(0, 0, 8, 5.4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#8c6f22"; ctx.lineWidth = 1.2; ctx.stroke();
        ctx.fillStyle = "#8c6f22"; ctx.fillRect(-1, -3, 2, 6);
      } else if (it.item === "memoryjar") {
        ctx.fillStyle = "rgba(190,225,235,.75)";
        ctx.fillRect(-6, -6, 12, 14);
        ctx.strokeStyle = "#7fa6b4"; ctx.lineWidth = 1.1; ctx.strokeRect(-6, -6, 12, 14);
        ctx.fillStyle = "#9c8a4a"; ctx.fillRect(-6.5, -9, 13, 3);
        ctx.fillStyle = "rgba(255,240,170,.9)";
        for (const p of [[-2, 0], [2, -3], [0, 4]]) {
          ctx.beginPath(); ctx.arc(p[0], p[1], 1.5, 0, Math.PI * 2); ctx.fill();
        }
      } else if (it.item === "marshmallow") {
        ctx.fillStyle = "#f0e6d2";
        ctx.beginPath(); ctx.ellipse(0, 1, 8, 6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(190,170,110,.55)";
        ctx.beginPath(); ctx.ellipse(0, 3, 8, 3.2, 0, 0, Math.PI); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,.5)";
        ctx.beginPath(); ctx.ellipse(-2.6, -1.5, 3, 1.6, -0.4, 0, Math.PI * 2); ctx.fill();
      } else if (it.item === "choc" || it.item === "energybar") {
        const bar = it.item === "energybar";
        ctx.fillStyle = bar ? "#c8c2a0" : "#6b3f24";
        ctx.fillRect(-9, -4.5, 18, 9);
        ctx.strokeStyle = bar ? "#7c7a5e" : "#3d2312"; ctx.lineWidth = 1;
        ctx.strokeRect(-9, -4.5, 18, 9);
        ctx.fillStyle = bar ? "#6f7350" : "#8a5230";
        ctx.fillRect(-9, -1.5, 18, 2.2);
        ctx.fillStyle = "rgba(255,255,255,.18)"; ctx.fillRect(-9, -4.5, 18, 1.4);
      } else if (it.item === "soda" || it.item === "spacedrink" || it.item === "hotchoc" || it.item === "memoryjuice") {
        // 瓶装补给：颜色各不一样，不再全被画成杏仁水
        const col = it.item === "memoryjuice" ? "#9fd8c8"
          : it.item === "hotchoc" ? "#7a4a2c"
          : it.item === "spacedrink" ? "#8fb4e0" : "#c86a5a";
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.moveTo(-3.5, -6); ctx.lineTo(3.5, -6); ctx.lineTo(4.5, 4); ctx.lineTo(-4.5, 4);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = "rgba(50,40,30,.55)"; ctx.lineWidth = 1.1; ctx.stroke();
        ctx.fillStyle = "#d9cdb0"; ctx.fillRect(-2.2, -9.5, 4.4, 3.5);
        ctx.fillStyle = "rgba(255,255,255,.28)"; ctx.fillRect(-3, -4, 1.2, 6);
      } else {
        // Level 14 的伪装：瓶子里其实是受污染的杏仁水，
        // 但精神危害让你在捡起来之前一直看成干净的那一种。
        const fake = !!it.disguised;
        const bad = it.item === "bad" && !fake;
        // 瓶身
        ctx.fillStyle = bad ? "#7f9a5c" : "#e8c46a";
        ctx.strokeStyle = bad ? "#3f5230" : "#8a6a2a";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-3.5, -6); ctx.lineTo(3.5, -6);
        ctx.lineTo(4.5, 4); ctx.lineTo(-4.5, 4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // 瓶颈 + 瓶盖
        ctx.fillStyle = bad ? "#4d6b38" : "#c9a54a";
        ctx.fillRect(-2, -9, 4, 3);
        ctx.fillRect(-2.6, -10.5, 5.2, 2);
        // 高光
        ctx.fillStyle = "rgba(255,255,255,0.25)";
        ctx.fillRect(-3, -4, 1.2, 6);
        // 伪装只是障眼法，仔细看仍有一丝不对劲（很淡的浑浊）
        if (fake) {
          ctx.fillStyle = "rgba(120,140,90,0.16)";
          ctx.fillRect(-3, -3, 9, 5);
        }
      }
  }

  try { window.__drawItemSprite = drawItemSprite; } catch (e) {}

  // 补给箱：关着时是钉死的木箱，撬开后盖子敞开（有货/空箱看起来不一样）
  function drawCrates(ctx, g, cam) {
    const list = g.map.crates || [];
    for (const c of list) {
      if ((c.floor | 0) !== g.floor) continue;
      const x = (c.x + 0.5) * TILE, y = (c.y + 0.5) * TILE;
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = "rgba(0,0,0,0.38)";
      ctx.beginPath();
      ctx.ellipse(0, 9, 15, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // 箱体
      ctx.fillStyle = "#8a6a3c";
      ctx.strokeStyle = "#4a3720";
      ctx.lineWidth = 1.6;
      ctx.fillRect(-14, -12, 28, 21);
      ctx.strokeRect(-14, -12, 28, 21);
      // 木板纹与铁箍
      ctx.strokeStyle = "rgba(50,36,18,0.7)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-14, -4); ctx.lineTo(14, -4);
      ctx.moveTo(-14, 3); ctx.lineTo(14, 3);
      ctx.stroke();
      ctx.strokeStyle = "rgba(90,80,60,0.9)";
      ctx.beginPath();
      ctx.moveTo(-9, -12); ctx.lineTo(-9, 9);
      ctx.moveTo(9, -12); ctx.lineTo(9, 9);
      ctx.stroke();
      if (!c.opened) {
        // 顶盖（钉死）
        ctx.fillStyle = "#9a7846";
        ctx.fillRect(-14, -17, 28, 6);
        ctx.strokeStyle = "#4a3720";
        ctx.lineWidth = 1.4;
        ctx.strokeRect(-14, -17, 28, 6);
        ctx.fillStyle = "#5d5d66";
        ctx.fillRect(-11, -16, 2.5, 2.5);
        ctx.fillRect(8.5, -16, 2.5, 2.5);
      } else {
        // 撬开：盖子翻到一边，露出内部
        ctx.fillStyle = "#3a2c18";
        ctx.fillRect(-12, -14, 24, 5);
        ctx.fillStyle = "#9a7846";
        ctx.beginPath();
        ctx.moveTo(-14, -14); ctx.lineTo(-22, -19); ctx.lineTo(-8, -21); ctx.lineTo(-12, -14);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#4a3720";
        ctx.stroke();
        if (c.loot > 0) {
          // 里面躺着的杏仁水
          for (let i = 0; i < Math.min(4, c.loot); i++) {
            const bx = -8 + (i % 2) * 11, by = -10 + Math.floor(i / 2) * 5;
            ctx.fillStyle = "#e8c46a";
            ctx.fillRect(bx, by, 4.5, 7);
            ctx.fillStyle = "#c9a54a";
            ctx.fillRect(bx + 1, by - 2.5, 2.5, 2.5);
          }
        } else {
          ctx.strokeStyle = "rgba(200,190,170,0.35)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(-9, -9); ctx.lineTo(9, -9);
          ctx.stroke();
        }
      }
      ctx.restore();
    }
  }

  // ---------- 门 ----------
  // Level 1 的 A / B 走廊：混凝土门板，A / B 门中央刻着一个巨大的字母
  function drawABDoor(ctx, d, px, py, g) {
    const t = g.time;
    if (d.open) {
      // 开着的门：只剩门框，能看穿过去
      ctx.fillStyle = "rgba(120,140,150,0.16)";
      ctx.fillRect(px + 2, py + 2, TILE - 4, TILE - 4);
      ctx.strokeStyle = "rgba(180,200,210,0.45)";
      ctx.lineWidth = 2;
      ctx.strokeRect(px + 2, py + 2, TILE - 4, TILE - 4);
      return;
    }
    ctx.fillStyle = "#5d6a70";                       // 宜居地带的混凝土门
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = "rgba(0,0,0,0.22)";              // 上下压条
    ctx.fillRect(px, py + 4, TILE, 2);
    ctx.fillRect(px, py + TILE - 8, TILE, 2);
    ctx.fillStyle = "rgba(0,0,0,0.30)";              // 中间那道门缝
    ctx.fillRect(px + TILE / 2 - 1, py, 2, TILE);

    if (d.kind === "abdoor") {
      ctx.save();
      ctx.font = "bold " + Math.round(TILE * 0.60) + "px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(0,0,0,0.85)";
      ctx.shadowBlur = 4;
      ctx.fillStyle = "#eceae2";
      ctx.fillText(d.letter, px + TILE / 2, py + TILE / 2 + 1);
      ctx.restore();
    } else if (d.kind === "abexit") {
      // 尽头的门：缝里透出枢纽那边的灯光
      const pulse = 0.5 + 0.5 * Math.sin(t * 2.2);
      ctx.fillStyle = "rgba(200,230,255," + (0.12 + pulse * 0.14).toFixed(3) + ")";
      ctx.fillRect(px + 4, py + 4, TILE - 8, TILE - 8);
      ctx.strokeStyle = "rgba(210,240,255," + (0.28 + pulse * 0.30).toFixed(3) + ")";
      ctx.lineWidth = 2;
      ctx.strokeRect(px + 4, py + 4, TILE - 8, TILE - 8);
    } else {
      // 入口门：刻着一个圆形的符号
      ctx.strokeStyle = "rgba(220,235,245,0.50)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px + TILE / 2, py + TILE / 2, TILE * 0.22, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function drawDoors(ctx, g, cam) {
    const left = cam.x - cam.viewW / 2, top = cam.y - cam.viewH / 2;
    for (const d of g.map.doors) {
      if ((d.floor | 0) !== g.floor) continue;
      for (const t of d.tiles) {
        const px = t.x * TILE, py = t.y * TILE;
        if (px + TILE < left || py + TILE < top || px > left + cam.viewW || py > top + cam.viewH) continue;
        drawDoor(ctx, d, t, px, py, g);
      }
    }
  }

  // 门框 + 门板；关闭时门板填满格子（挡住视线，看不见里面）
  // ---------- Level 13 / 14 / 15 / 70 的墙面与地面 ----------

  // Level 13：暗白 / 米色涂料，石膏与胶合板，单调到令人发疯
  function drawApartmentWall(ctx, px, py, h) {
    const n = ((px / TILE) * 7 + (py / TILE) * 13) | 0;
    ctx.fillStyle = (n % 5 === 0) ? "#cfc8b6" : "#c6bfad";
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = "rgba(0,0,0,0.10)";
    ctx.fillRect(px, py + TILE - 5, TILE, 3);              // 踢脚线
    ctx.fillStyle = "rgba(0,0,0,0.05)";
    for (let i = 0; i < 3; i++) ctx.fillRect(px, py + 6 + i * 12, TILE, 1);
  }
  function drawApartmentFloor(ctx, px, py, h, tx, ty) {
    const n = (tx * 5 + ty * 3) % 3;
    ctx.fillStyle = n === 0 ? "#8d8574" : (n === 1 ? "#948c7a" : "#8a8270");
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = "rgba(255,255,255,0.045)";             // 油毯的方格
    ctx.fillRect(px, py, TILE / 2, TILE / 2);
    ctx.fillRect(px + TILE / 2, py + TILE / 2, TILE / 2, TILE / 2);
  }

  // Level 14：夜里会发光的森林 —— 猩红的草叶，沾着潮湿的露水
  function drawParadiseWall(ctx, px, py, h) {
    ctx.fillStyle = "#0b1410";
    ctx.fillRect(px, py, TILE, TILE);
  }
  function drawParadiseFloor(ctx, px, py, h, tx, ty, g) {
    const n = (tx * 3 + ty * 7) % 4;
    ctx.fillStyle = n === 0 ? "#123024" : (n === 1 ? "#0f2a20" : (n === 2 ? "#143527" : "#0e281e"));
    ctx.fillRect(px, py, TILE, TILE);
    // 猩红的草叶，沾着露水
    ctx.fillStyle = "rgba(190,50,60,0.30)";
    for (let i = 0; i < 5; i++) {
      const gx = px + ((tx * 13 + i * 29) % TILE);
      const gy = py + ((ty * 7 + i * 17) % TILE);
      ctx.fillRect(gx, gy, 1.5, 4);
    }
    if (g) {
      const gl = 0.05 + 0.04 * Math.sin(g.time * 1.4 + tx * 0.6 + ty * 0.4);
      ctx.fillStyle = "rgba(150,255,190," + gl.toFixed(3) + ")";
      ctx.fillRect(px, py, TILE, TILE);
    }
  }

  // Level 15：白色 / 灰色混凝土，墙上有白色钢管与蔓藤花纹般的符号
  function drawFutureWall(ctx, px, py, h) {
    const n = (px / TILE + py / TILE) | 0;
    ctx.fillStyle = (n % 3 === 0) ? "#d8dadc" : "#cfd2d5";
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = "rgba(0,0,0,0.07)";
    ctx.fillRect(px + TILE - 3, py, 3, TILE);
    // 钢管 + 蔓藤花纹符号
    if ((n % 7) === 3) {
      ctx.fillStyle = "#eef1f3";
      ctx.fillRect(px, py + TILE * 0.36, TILE, 5);
      ctx.strokeStyle = "rgba(120,135,150,0.55)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(px + TILE / 2, py + TILE * 0.36 + 2.5, 5, 0, Math.PI * 2);
      ctx.moveTo(px + TILE / 2 - 8, py + TILE * 0.36 + 9);
      ctx.lineTo(px + TILE / 2 + 8, py + TILE * 0.36 + 9);
      ctx.stroke();
    }
  }
  function drawFutureFloor(ctx, px, py, h) {
    ctx.fillStyle = "#e9ebec";
    ctx.fillRect(px, py, TILE, TILE);
    ctx.strokeStyle = "rgba(150,160,170,0.35)";
    ctx.lineWidth = 1;
    ctx.strokeRect(px + 0.5, py + 0.5, TILE - 1, TILE - 1);
  }

  // Level 70：积雪覆盖的墙 / 雪地 / 冰面
  function drawFrostWall(ctx, px, py, h) {
    ctx.fillStyle = "#5b6470";
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = "rgba(235,244,255,0.85)";              // 墙头积雪
    ctx.fillRect(px, py, TILE, 7);
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(px, py + TILE - 6, TILE, 6);
  }
  function drawFrostFloor(ctx, px, py, h, map, tx, ty) {
    const river = map && map.river && map.river.has(tx + "," + ty);
    const forest = map && map.forest && map.forest.has(tx + "," + ty);
    const indoor = map && map.indoor && map.indoor.has(tx + "," + ty);
    if (river) {
      ctx.fillStyle = "#123a4e";
      ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = "rgba(200,230,255,0.22)";
      ctx.fillRect(px, py + 6, TILE, 3);
      ctx.fillRect(px + 8, py + 22, TILE - 16, 2);
      return;
    }
    if (indoor) {
      ctx.fillStyle = "#6b5a44";                            // 室内木地板（暖）
      ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = "rgba(255,220,150,0.10)";
      ctx.fillRect(px, py, TILE, TILE);
      return;
    }
    ctx.fillStyle = forest ? "#c9d6de" : "#dee7ee";          // 雪
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillRect(px + ((tx * 11) % TILE), py + ((ty * 17) % TILE), 2, 2);
    if (forest) {
      ctx.fillStyle = "rgba(20,40,30,0.35)";
      ctx.fillRect(px + TILE * 0.4, py + TILE * 0.35, 6, 12);
    }
  }

  // M.E.G 基地的地面与墙：干净的白瓷砖 / 浅灰钢板
  function drawMegFloor(ctx, px, py, h) {
    // 基地里面是白色的地面（白瓷砖），和停车场的灰色水泥一眼就能分开
    ctx.fillStyle = "#f2f4f6";
    ctx.fillRect(px, py, TILE, TILE);
    ctx.strokeStyle = "rgba(140,150,165,0.45)";
    ctx.lineWidth = 1;
    ctx.strokeRect(px + 0.5, py + 0.5, TILE - 1, TILE - 1);
    if (h > 0.82) { ctx.fillStyle = "rgba(120,132,150,0.10)"; ctx.fillRect(px + 4, py + 6, TILE - 8, 3); }
  }
  function drawMegWall(ctx, px, py, h) {
    ctx.fillStyle = "#b9c0c9";
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.fillRect(px, py, TILE, 3);
    ctx.fillStyle = "rgba(0,0,0,0.16)";
    ctx.fillRect(px, py + TILE - 5, TILE, 5);
    ctx.strokeStyle = "rgba(90,100,115,0.35)";
    ctx.lineWidth = 1;
    ctx.strokeRect(px + 0.5, py + 0.5, TILE - 1, TILE - 1);
    if (h > 0.9) { ctx.fillStyle = "rgba(60,110,180,0.30)"; ctx.fillRect(px + 3, py + 3, TILE - 6, 2); }
  }

  // M.E.G 的伸缩门：白色铁门，门板上印着 M.E.G。
  // slide 是 0~1 的滑动进度 —— 门板整体朝一侧平移出去，不是"转开"。
  // 注意：门开的时候门洞里必须能看见地面，不能糊一整块深色，否则看着像封死了。
  function drawMegDoor(ctx, d, tile, px, py, g) {
    const s = d.slide == null ? (d.open ? 1 : 0) : d.slide;
    const dir = d.dir || { x: 1, y: 0 };
    const horiz = Math.abs(dir.x) >= Math.abs(dir.y);
    const off = s * TILE * 0.92;
    const ox = horiz ? dir.x * off : 0;
    const oy = horiz ? 0 : dir.y * off;

    // 门洞：开着的这部分要透出地面，只画两侧的边框和顶部导轨
    ctx.fillStyle = "#3b4046";
    if (horiz) {                      // 门板左右滑：上下各留一道轨
      ctx.fillRect(px, py, TILE, 3);
      ctx.fillRect(px, py + TILE - 3, TILE, 3);
    } else {                          // 门板上下滑：左右各留一道轨
      ctx.fillRect(px, py, 3, TILE);
      ctx.fillRect(px + TILE - 3, py, 3, TILE);
    }

    // 门板（滑出去的那部分被裁掉，能看到门洞里的地面）
    ctx.save();
    ctx.beginPath();
    ctx.rect(px, py, TILE, TILE);
    ctx.clip();
    ctx.translate(ox, oy);
    ctx.fillStyle = "#e9ecf0";                      // 白色铁皮
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = "rgba(150,160,172,0.30)";       // 底部导轨
    ctx.fillRect(px, py + TILE - 5, TILE, 5);
    ctx.fillStyle = "rgba(120,132,148,0.28)";       // 横向压条
    for (let i = 1; i < 4; i++) ctx.fillRect(px + 2, py + i * (TILE / 4), TILE - 4, 1);
    ctx.strokeStyle = "rgba(90,100,115,0.5)";
    ctx.lineWidth = 1;
    ctx.strokeRect(px + 0.5, py + 0.5, TILE - 1, TILE - 1);
    // M.E.G 字样
    ctx.fillStyle = "#2b3340";
    ctx.font = "bold 9px ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("M.E.G", px + TILE / 2, py + TILE / 2 - 1);
    ctx.fillStyle = "rgba(60,110,180,0.85)";
    ctx.fillRect(px + TILE / 2 - 8, py + TILE / 2 + 5, 16, 1.5);
    ctx.restore();

    // 门楣指示灯：开 = 绿，关 = 橙
    ctx.fillStyle = s > 0.5 ? "rgba(90,240,150,0.9)" : "rgba(255,170,60,0.85)";
    if (horiz) ctx.fillRect(px + TILE / 2 - 2, py + 3, 4, 2);
    else ctx.fillRect(px + 3, py + TILE / 2 - 2, 2, 4);
  }

  // Level 21 的门：门板上挂着一块编号牌 —— 这层的门全靠标签认
  function drawNumberedDoor(ctx, d, px, py, g) {
    const dw = TILE, dh = TILE;
    const locked = d.kind === "locked21";
    const smile = d.kind === "smiledoor";
    ctx.save();
    // 门洞
    ctx.fillStyle = "#1a1a18";
    ctx.fillRect(px + 1, py + 1, dw - 2, dh - 2);
    // 门板：编号门一律是沉闷的灰白铁门
    ctx.fillStyle = locked ? "#5a5a56" : (smile ? "#d8c34a" : "#b9bdb8");
    ctx.fillRect(px + 3, py + 3, dw - 6, dh - 6);
    ctx.strokeStyle = "rgba(40,40,36,0.7)";
    ctx.lineWidth = 1.2;
    ctx.strokeRect(px + 3, py + 3, dw - 6, dh - 6);
    // 上下两道横压筋
    ctx.fillStyle = "rgba(0,0,0,0.14)";
    ctx.fillRect(px + 4, py + 12, dw - 8, 1.6);
    ctx.fillRect(px + 4, py + dh - 14, dw - 8, 1.6);
    // 编号牌
    const label = d.label || "?";
    ctx.fillStyle = "#f2efe4";
    ctx.fillRect(px + dw / 2 - 13, py + 8, 26, 11);
    ctx.strokeStyle = "#4a4a44";
    ctx.lineWidth = 1;
    ctx.strokeRect(px + dw / 2 - 13, py + 8, 26, 11);
    ctx.fillStyle = "#22201c";
    ctx.font = smile ? "bold 9px sans-serif" : "bold 9px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(label), px + dw / 2, py + 14);
    // 把手 / 锁
    ctx.fillStyle = locked ? "#8a8f96" : "#e8d68a";
    ctx.beginPath();
    ctx.arc(px + dw - 11, py + dh / 2 + 6, 2.6, 0, Math.PI * 2);
    ctx.fill();
    if (locked) {
      ctx.fillStyle = "rgba(20,20,24,0.9)";
      ctx.fillRect(px + dw - 14, py + dh / 2, 6, 6);
    }
    ctx.restore();
  }

  function drawDoor(ctx, d, tile, px, py, g) {
    if (d.kind === "num105" || d.kind === "numdoor" || d.kind === "locked21" ||
        d.kind === "smiledoor" || d.kind === "elsewhere21") {
      drawNumberedDoor(ctx, d, px, py, g);
      return;
    }
    if (d.kind === "megentry" || d.kind === "megdoor") { drawMegDoor(ctx, d, tile, px, py, g); return; }
    if (d.kind === "abgate" || d.kind === "abdoor" || d.kind === "abexit") {
      drawABDoor(ctx, d, px, py, g);
      return;
    }
    const t = g.time;
    const dir = (tile && tile.dir) || d.dir || "v"; // 单块门板：1 格
    const dw = TILE, dh = TILE;
    const style = levelDef(g.level).style;
    let face = "#6b4a2a";            // 木门（Level 0）
    if (style === "concrete") face = "#5d6a70";  // 金属门（宜居地带）
    else if (style === "pipe") face = "#6d7071"; // 检修铁门（管道梦魇）
    else if (style === "collapsing") face = "#7a5330";
    else if (style === "apartment") face = "#6f6555";      // 公寓楼的门
    else if (style === "future") face = "#9aa3ac";         // 金属加固门
    else if (style === "frost") face = "#6d7681";
    let glow = null;
    if (d.kind === "red") { face = "#8e2f22"; glow = "rgba(220,60,40,"; }
    else if (d.kind === "entry02") { face = "#c9b25f"; glow = "rgba(255,220,120,"; }
    else if (d.kind === "exit02") { face = "#2fbf6b"; glow = "rgba(80,255,150,"; }
    else if (d.kind === "iron1") { face = "#cdd4dc"; glow = "rgba(220,238,255,"; }   // 白色铁门（Level 0 -> Level 1）
    else if (d.kind === "wood04") { face = "#8a6438"; glow = null; }                 // 普通木门（Level 0 -> 0.4 深坑区）
    else if (d.kind === "grate3") { face = "#8a8f96"; glow = "rgba(200,220,255,"; }  // 铁栅栏门（Level 2 -> Level 3）

    // 铁栅栏门：一道横跨走廊的锈铁栅栏，看得穿、过不去
    if (d.kind === "grate3") { drawGrateDoor(ctx, px, py, dir, g); return; }
    // 倾斜的楼梯井：直接画成一口往下沉的井
    if (d.kind === "stair4") { drawStairwell(ctx, px, py, t); return; }

    // Level 5 的客房门：门上贴着金色房号牌（房号完全是随机的）
    if (d.kind === "room5") {
      const f2 = d.locked ? "#7a5a2a" : "#8a6a34";
      ctx.save();
      ctx.fillStyle = "#2c2418";
      ctx.fillRect(px + 2, py + 2, dw - 4, dh - 4);
      ctx.fillStyle = f2;
      ctx.fillRect(px + 4, py + 4, dw - 8, dh - 8);
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      for (let i = 0; i < 2; i++) ctx.fillRect(px + 7 + i * 13, py + 6, 1.6, dh - 12);
      // 金色房号牌
      ctx.fillStyle = "#d8b45a";
      ctx.fillRect(px + dw / 2 - 9, py + 8, 18, 9);
      ctx.fillStyle = "#3a2c10";
      ctx.font = "bold 8px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(d.number || 0), px + dw / 2, py + 13);
      // 把手 / 锁
      ctx.fillStyle = d.locked ? "#8a8f96" : "#e8d68a";
      ctx.beginPath();
      ctx.arc(px + dw - 10, py + dh / 2 + 4, 2.6, 0, Math.PI * 2);
      ctx.fill();
      if (d.locked) {
        ctx.fillStyle = "rgba(20,20,24,0.85)";
        ctx.fillRect(px + dw - 13, py + dh / 2 - 2, 6, 6);
      }
      ctx.restore();
      return;
    }
    // Level 5 的区域门（贝弗莉室的入口有银色小标牌）
    if (d.kind === "area5") {
      ctx.save();
      ctx.fillStyle = "#2c2418";
      ctx.fillRect(px + 2, py + 2, dw - 4, dh - 4);
      ctx.fillStyle = "#6b4a2a";
      ctx.fillRect(px + 4, py + 4, dw - 8, dh - 8);
      ctx.fillStyle = "rgba(255,255,255,0.10)";
      ctx.fillRect(px + 4, py + 4, dw - 8, 2);
      ctx.fillStyle = "#d8b45a";
      ctx.beginPath();
      ctx.arc(px + dw - 10, py + dh / 2 + 4, 2.6, 0, Math.PI * 2);
      ctx.fill();
      if (d.plate) {
        ctx.fillStyle = "#c9ccd2";
        ctx.fillRect(px + dw / 2 - 13, py + 7, 26, 8);
        ctx.fillStyle = "#33363c";
        ctx.font = "6px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("贝弗莉室", px + dw / 2, py + 11);
      }
      ctx.restore();
      return;
    }
    // 枢纽的混凝土门：门上刻着无法辨认的符文，右侧一个多边形钥匙孔
    if (d.kind === "hubdoor" || d.kind === "tohub") {
      const unlocked = !hubDoorLocked(d);
      // 身上带着这扇门的层级密钥时，符文与门框泛起冷绿的光
      const K = window.LEVEL_KEY;
      const hasK = !!(K && K.hasKeyFor(game, d.target != null ? d.target : d.toLevel));
      ctx.save();
      ctx.fillStyle = "#4e4a44";
      ctx.fillRect(px, py, dw, dh);
      ctx.strokeStyle = "#2a2723";
      ctx.lineWidth = 2;
      ctx.strokeRect(px + 1, py + 1, dw - 2, dh - 2);
      // 符文：像麦田怪圈那样的符号
      ctx.strokeStyle = unlocked ? "rgba(255,226,150,0.85)" : "rgba(210,200,170,0.45)";
      ctx.lineWidth = 1.6;
      const r0 = d.rune || 0;
      ctx.beginPath();
      const cx2 = px + dw / 2, cy2 = py + dh / 2 - 4;
      for (let i = 0; i <= 24; i++) {
        const a2 = (i / 24) * Math.PI * 2;
        const rr = 9 + 4 * Math.sin(a2 * (2 + (r0 % 3)) + r0);
        const xx = cx2 + Math.cos(a2) * rr, yy = cy2 + Math.sin(a2) * rr * 0.8;
        if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
      }
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx2, cy2, 2.5, 0, Math.PI * 2);
      ctx.stroke();
      // 多边形钥匙孔
      ctx.fillStyle = "#22201c";
      ctx.beginPath();
      const kx = px + dw - 11, ky = py + dh - 12;
      for (let i = 0; i < 6; i++) {
        const a2 = (i / 6) * Math.PI * 2 + Math.PI / 6;
        const xx = kx + Math.cos(a2) * 4.5, yy = ky + Math.sin(a2) * 4.5;
        if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
      }
      ctx.closePath();
      ctx.fill();
      if (unlocked || hasK) {
        const pulse = hasK ? 0.55 + 0.45 * Math.abs(Math.sin(t * 3.2)) : 1;
        ctx.shadowColor = hasK ? "rgba(120,255,190,0.9)" : "rgba(255,226,150,0.8)";
        ctx.shadowBlur = hasK ? 22 : 18;
        ctx.strokeStyle = hasK
          ? "rgba(140,255,200," + pulse.toFixed(3) + ")"
          : "rgba(255,236,180,0.9)";
        ctx.lineWidth = hasK ? 2.6 : 2;
        ctx.strokeRect(px + 2, py + 2, dw - 4, dh - 4);
        ctx.shadowBlur = 0;
      }
      // 上锁的枢纽门：把通往的层级写在门上
      if (d.kind === "hubdoor" && dw >= 18) {
        const df4 = levelDef(d.target);
        // 只写编号：以前写的是 "LEVEL 1000" 这种整串，9px 字号下有 50 多像素宽，
        // 比门本身还宽 —— 字整个溢出到门框外面去了。写编号 + 按门宽缩字号。
        const nm4 = String(df4 && df4.id != null ? df4.id : d.target);
        let fs = 9;
        ctx.font = "bold " + fs + "px ui-monospace, monospace";
        const maxW = dw - 4;
        while (fs > 5 && ctx.measureText(nm4).width > maxW) {
          fs -= 1;
          ctx.font = "bold " + fs + "px ui-monospace, monospace";
        }
        ctx.fillStyle = hasK ? "rgba(150,255,205,0.95)" : "rgba(225,214,180,0.62)";
        ctx.textAlign = "center";
        ctx.fillText(nm4, px + dw / 2, py + dh - 3);
        ctx.textAlign = "left";
      }
      ctx.restore();
      return;
    }

    // 门框
    ctx.fillStyle = "#2c2418";
    if (dir === "h") { ctx.fillRect(px, py, dw, 4); ctx.fillRect(px, py + dh - 4, dw, 4); }
    else { ctx.fillRect(px, py, 4, dh); ctx.fillRect(px + dw - 4, py, 4, dh); }

    if (d.open) {
      // 打开：门板贴到一侧，中间是通透的门洞
      const w = 7;
      ctx.save();
      ctx.fillStyle = face;
      if (dir === "h") ctx.fillRect(px + 2, py + 4, dw - 4, w);
      else ctx.fillRect(px + 4, py + 2, w, dh - 4);
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      if (dir === "h") ctx.fillRect(px + 2, py + 4 + w - 2, dw - 4, 2);
      else ctx.fillRect(px + 4 + w - 2, py + 2, 2, dh - 4);
      ctx.restore();
      return;
    }

    // 关闭：门板填满格子
    ctx.save();
    if (glow) {
      const pulse = 0.35 + 0.3 * Math.sin(t * 3 + d.x);
      ctx.shadowColor = glow + pulse.toFixed(3) + ")";
      ctx.shadowBlur = 18;
    }
    ctx.fillStyle = face;
    if (dir === "h") ctx.fillRect(px, py + 4, dw, dh - 8);
    else ctx.fillRect(px + 4, py, dw - 8, dh);
    ctx.shadowBlur = 0;
    ctx.restore();

    // 门板细节：木纹 / 金属压条 + 把手
    const bx = dir === "h" ? px : px + 4;
    const by = dir === "h" ? py + 4 : py;
    const bw = dir === "h" ? dw : dw - 8;
    const bh = dir === "h" ? dh - 8 : dh;
    ctx.fillStyle = "rgba(255,255,255,0.10)";
    ctx.fillRect(bx, by, bw, 2);
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fillRect(bx, by + bh - 3, bw, 3);
    if (style === "pipe" || style === "concrete" || d.kind === "iron1") {
      // 金属压条
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(bx, by + bh * 0.35, bw, 2);
      ctx.fillRect(bx, by + bh * 0.68, bw, 2);
      // 铆钉
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      for (let i = 0; i < 4; i++) ctx.fillRect(bx + 4 + i * (bw / 4), by + 5, 2, 2);
    } else {
      // 木纹竖条
      ctx.fillStyle = "rgba(0,0,0,0.14)";
      for (let i = 0; i < 3; i++) ctx.fillRect(bx + 6 + i * (bw / 3), by + 4, 1.5, bh - 8);
    }
    // 把手
    ctx.fillStyle = "#d8c98a";
    ctx.beginPath();
    ctx.arc(bx + bw - 7, by + bh / 2, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // ---------- 手电：屏幕上可见的光柱（锥形，与迷雾擦除用同一个多边形） ----------
  function drawFlashBeam(ctx, g) {
    const pts = g.flConeInner || g.flCone;
    if (!g.flashlight || !pts || pts.length < 3) return;
    const p = g.player;
    const len = CONFIG.FL_LENGTH * TILE;
    const a = CONFIG.FL_BEAM_ALPHA * g.flicker;
    const baseA = (p.faceX === 0 && p.faceY === 0) ? Math.PI / 2 : Math.atan2(p.faceY, p.faceX);
    // 沿光轴淡出，而不是以玩家为圆心画一圈圆光 —— 手电是射出去的一束锥光
    const grd = ctx.createLinearGradient(p.x, p.y,
      p.x + Math.cos(baseA) * len, p.y + Math.sin(baseA) * len);
    grd.addColorStop(0, "rgba(255,244,205," + (a * 1.5).toFixed(3) + ")");
    grd.addColorStop(0.5, "rgba(255,238,180," + (a * 0.85).toFixed(3) + ")");
    grd.addColorStop(1, "rgba(255,230,150,0)");
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // ---------- 坍塌掉落的碎块 ----------
  function drawDebris(ctx, g) {
    if (!g.debris.length) return;
    for (const q of g.debris) {
      const a = clamp(q.life, 0, 1);
      ctx.globalAlpha = a * 0.85;
      ctx.fillStyle = q.size > 5 ? "#b3ac98" : "#d9cd6a";
      ctx.fillRect(q.x, q.y, q.size, q.size * 0.7);
      ctx.globalAlpha = 1;
    }
  }

  // 颜色插值工具
  function mixHex(c1, c2, t) {
    const a = [parseInt(c1.slice(1, 3), 16), parseInt(c1.slice(3, 5), 16), parseInt(c1.slice(5, 7), 16)];
    const b = [parseInt(c2.slice(1, 3), 16), parseInt(c2.slice(3, 5), 16), parseInt(c2.slice(5, 7), 16)];
    return "rgb(" +
      Math.round(a[0] + (b[0] - a[0]) * t) + "," +
      Math.round(a[1] + (b[1] - a[1]) * t) + "," +
      Math.round(a[2] + (b[2] - a[2]) * t) + ")";
  }

  // 渐变走廊墙面颜色：入口混凝土灰 → 中段黄色 → 尽头深色金属
  function transitWallColor(p) {
    return p < 0.5 ? mixHex("#7e817c", "#b3a14f", p * 2) : mixHex("#b3a14f", "#2a3340", (p - 0.5) * 2);
  }

  // 渐变走廊地面颜色：入口混凝土 → 中段黄色 → 尽头深色格栅
  function transitFloorColor(p) {
    return p < 0.5 ? mixHex("#5a5d58", "#8a7c44", p * 2) : mixHex("#8a7c44", "#1c222b", (p - 0.5) * 2);
  }

  // Level 1 → Level 2 过渡走廊墙面：随进度从混凝土渐变到管道梦魇
  function drawTransitWall(ctx, px, py, h, p) {
    ctx.fillStyle = transitWallColor(p);
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = "rgba(0,0,0,0.14)";
    ctx.fillRect(px + TILE - 2, py, 2, TILE);
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fillRect(px, py, TILE, 2);
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(px, py + TILE - 8, TILE, 8);
    // 越接近尽头，墙面浮现出管道元素
    if (p > 0.5) {
      const pipeA = (p - 0.5) * 2; // 0..1
      ctx.fillStyle = "rgba(35,42,53," + (0.45 + pipeA * 0.5).toFixed(3) + ")";
      ctx.fillRect(px, py + 4, TILE, 9);
      ctx.fillStyle = "rgba(255,255,255," + (0.08 * pipeA).toFixed(3) + ")";
      ctx.fillRect(px, py + 4, TILE, 2);
      if (p > 0.8) {
        ctx.fillStyle = "rgba(20,24,32,0.55)";
        ctx.fillRect(px + 4, py + 2, 4, 13);
        ctx.fillRect(px + TILE - 8, py + 2, 4, 13);
      }
    }
    // 入口侧：混凝土裂纹
    if (p < 0.3 && h > 0.72) {
      ctx.strokeStyle = "rgba(0,0,0,0.25)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px + 4, py + 8 + h * 6);
      ctx.lineTo(px + TILE * 0.5, py + 14 + h * 10);
      ctx.lineTo(px + TILE - 6, py + 12 + h * 14);
      ctx.stroke();
    }
  }

  // Level 1 → Level 2 过渡走廊地面：混凝土接缝逐渐变为金属格栅
  function drawTransitFloor(ctx, px, py, h, p) {
    ctx.fillStyle = transitFloorColor(p);
    ctx.fillRect(px, py, TILE, TILE);
    if (p < 0.45) {
      // 入口侧：混凝土接缝
      ctx.fillStyle = "rgba(0,0,0,0.13)";
      ctx.fillRect(px, py + TILE - 2, TILE, 2);
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.fillRect(px, py, TILE, 1);
      if (h > 0.75) {
        ctx.strokeStyle = "rgba(0,0,0,0.25)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px + 6 + h * 8, py + 5);
        ctx.lineTo(px + 14, py + 20);
        ctx.lineTo(px + 9, py + TILE - 6);
        ctx.stroke();
      }
    } else {
      // 深处：金属格栅，越深越明显
      const a = (p - 0.45) / 0.55;
      ctx.fillStyle = "rgba(255,255,255," + (0.05 * a).toFixed(3) + ")";
      for (let i = 0; i < TILE; i += 8) ctx.fillRect(px, py + i, TILE, 1);
      ctx.fillStyle = "rgba(0,0,0," + (0.12 + 0.18 * a).toFixed(3) + ")";
      for (let i = 4; i < TILE; i += 8) ctx.fillRect(px, py + i, TILE, 1);
      ctx.fillStyle = "rgba(0,0,0,0.16)";
      ctx.fillRect(px, py + TILE - 2, TILE, 2);
    }
    // 中段之后的锈迹与水渍
    if (p > 0.55 && h > 0.5) {
      ctx.fillStyle = "rgba(60,45,20,0.22)";
      ctx.fillRect(px + 5 + (h * 13) % 10, py + 6 + (h * 7) % 12, 8, 6);
    }
    if (p > 0.75 && h > 0.3 && h < 0.36) {
      ctx.fillStyle = "rgba(150,170,190,0.12)";
      ctx.fillRect(px + 3, py + 10, 14, 4);
    }
  }

  // Level 0：黄色墙纸
  // ---------- Level 0 四片大区域（1.3.0 扩容）----------
  // 每个函数都先把整格铺满，再叠细节 —— 以前好几个层级只画多边形没铺底，
  // 被探针判成「没画」而退回 Level 2 管道风。这里一律先 fillRect 整格。
  // 区域标记只画在阈界原本的墙纸 / 黄地毯之上：地面与墙四区完全一致，
  // 不再给每个区单独做一套地板。
  function drawL0ZoneWallDecor(ctx, px, py, h, map, tx, ty, z) {
    const k = tx + "," + ty;
    const L = map.l0zones;
    if (z === "arch") {
      // 拱洞两侧的墙：浅棕拱边从苍白墙壁上延伸出来，和洞里那道拱连成一体
      if (L.archFrames && L.archFrames.has(k)) {
        ctx.fillStyle = "#9b7c53";
        ctx.fillRect(px, py + TILE - 7, TILE, 7);
        ctx.fillStyle = "rgba(60,44,26,0.35)";
        ctx.fillRect(px, py + TILE - 9, TILE, 2);
      }
    } else if (z === "blackout") {
      // 柱厅不在这里叠任何专属绘制：2×2 墙块已经由 drawWallpaperWall 画成普通黄墙纸墙。
      // 塌陷的粗糙墙垛：只是墙皮剥落的样子，不是灯、不发光
      if (L.rubble && L.rubble.has(k)) {
        ctx.fillStyle = "rgba(92,84,64,0.55)";
        ctx.fillRect(px, py, TILE, TILE);
        ctx.fillStyle = "rgba(38,34,26,0.50)";
        for (let i = 0; i < 6; i++) {
          ctx.fillRect(px + ((h * 53 + i * 9) | 0) % (TILE - 4),
                       py + ((h * 31 + i * 13) | 0) % (TILE - 4), 5, 3);
        }
        ctx.fillStyle = "rgba(20,18,14,0.28)";
        ctx.fillRect(px, py + TILE - 6, TILE, 6);
      } else {
        // 触感粗糙的墙：只是叠一层颗粒，不改墙纸底色
        ctx.fillStyle = "rgba(28,26,20,0.16)";
        for (let i = 0; i < 8; i++) {
          ctx.fillRect(px + ((h * 97 + i * 7) | 0) % (TILE - 2),
                       py + ((h * 61 + i * 11) | 0) % (TILE - 2), 2, 2);
        }
      }
    }
  }
  function drawL0ZoneFloorDecor(ctx, px, py, h, map, tx, ty, z) {
    // 四个区域的地面一律是 drawCarpetFloor 那一张潮湿黄地毯，长得完全一样。
    // 这里只叠熄灯区低洼处的积水（局部水渍，不是换一整片地板）；
    // 拱门区地毯增厚、柱厅绒毛较浅只体现在行走速度上，不再画成另一种地板。
    const k = tx + "," + ty;
    const L = map.l0zones;
    if (z === "arch" && L.archHoles.has(k)) {
      // 墙壁上开的拱形孔洞：两侧浅棕墙柱 + 顶部半圆拱。
      // 洞里仍是同一张潮湿黄地毯，只在上沿压一道阴影 —— 不换地板。
      ctx.fillStyle = "#9b7c53";
      ctx.fillRect(px, py, 7, TILE);
      ctx.fillRect(px + TILE - 7, py, 7, TILE);
      ctx.beginPath(); ctx.arc(px + TILE / 2, py + 12, TILE / 2 - 7, Math.PI, 0); ctx.fill();
      ctx.fillStyle = "rgba(40,28,16,0.28)";
      ctx.fillRect(px + 7, py + 16, TILE - 14, 7);
      ctx.strokeStyle = "#7d6140"; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px + 7, py + TILE - 2); ctx.lineTo(px + 7, py + 12);
      ctx.arc(px + TILE / 2, py + 12, TILE / 2 - 7, Math.PI, 0);
      ctx.lineTo(px + TILE - 7, py + TILE - 2); ctx.stroke();
    }
    if (z === "blackout" && L.puddles.has(k)) {
      ctx.fillStyle = "rgba(24,28,30,0.66)";
      ctx.beginPath();
      ctx.ellipse(px + TILE / 2, py + TILE / 2, TILE * 0.38, TILE * 0.26, h, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(160,180,186,0.28)"; ctx.fillRect(px + 10, py + 12, 9, 2);
    }
  }

  function l0ZoneAt(g) {
    if (!g || !g.map || !g.map.l0zones) return null;
    const tx = Math.floor(g.player.x / TILE), ty = Math.floor(g.player.y / TILE);
    return g.map.l0zones.zoneOf.get(tx + "," + ty) || null;
  }

  // 旧版给每个区域单独画了一套墙 / 地板（拱门区棕黄厚地毯、柱厅浅色干地毯、
  // 熄灯区暗地毯、深坑区黑底灰网格）—— 那就是「走进一个区域像换了张地图」的根源。
  // 这八个函数已全部删除：Level 0 所有区域共用 drawWallpaperWall + drawCarpetFloor，
  // 区域差异只在 drawL0ZoneWallDecor 里叠的建筑（拱洞 / 立柱 / 塌陷墙垛）。

  // 熄灯区的「暗」是照明（迷雾渐黑），不是另一种地板；深坑区是独立的一间房，
  // 不在 Level 0 里画区域。这两套旧绘制函数一并删掉，免得以后又被接回绘制链。

  function drawWallpaperWall(ctx, px, py, h) {
    ctx.fillStyle = "#d9c95e";
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = "rgba(0,0,0,0.10)";
    ctx.fillRect(px + TILE - 2, py, 2, TILE); // 接缝
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(px, py, TILE, 2);
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(px, py + TILE - 8, TILE, 8); // 假高度阴影
    if (h > 0.6) {
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.fillRect(px + 6 + (h * 20) % 24, py + 6 + (h * 31) % 24, 4, 4);
    }
  }

  // Level 0：潮湿地毯
  function drawCarpetFloor(ctx, px, py, h, tx, ty) {
    ctx.fillStyle = "#97853f";
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = "rgba(0,0,0,0.08)";
    ctx.fillRect(px + (h * 37) % 34, py + (h * 53) % 34, 3, 3);
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fillRect(px + (h * 71) % 30, py + (h * 13) % 30, 2, 2);
    if ((tx + ty) % 2 === 0) {
      ctx.fillStyle = "rgba(0,0,0,0.06)";
      ctx.fillRect(px, py + TILE - 3, TILE, 1);
    }
  }

  // Level 1+：混凝土墙面（宜居地带）
  function drawConcreteWall(ctx, px, py, h) {
    ctx.fillStyle = "#7e817c";
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = "rgba(255,255,255,0.07)";
    ctx.fillRect(px, py, TILE, 2);
    ctx.fillStyle = "rgba(0,0,0,0.16)";
    ctx.fillRect(px + TILE - 3, py, 3, TILE); // 板块接缝
    ctx.fillRect(px, py + TILE - 10, TILE, 10); // 底部阴影
    // 裂纹
    if (h > 0.72) {
      ctx.strokeStyle = "rgba(0,0,0,0.25)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px + 4, py + 8 + h * 6);
      ctx.lineTo(px + TILE * 0.5, py + 14 + h * 10);
      ctx.lineTo(px + TILE - 6, py + 12 + h * 14);
      ctx.stroke();
    }
    // 污渍
    if (h > 0.4 && h < 0.46) {
      ctx.fillStyle = "rgba(0,0,0,0.10)";
      ctx.fillRect(px + 8, py + 20, 14, 12);
    }
    // 竖管
    if (h > 0.83) {
      ctx.fillStyle = "#9a9c97";
      ctx.fillRect(px + 8, py + 2, 6, TILE - 4);
      ctx.fillStyle = "rgba(0,0,0,0.22)";
      ctx.fillRect(px + 12, py + 2, 2, TILE - 4);
    }
  }

  // Level 1+：混凝土地面 + 板条箱等仓库陈设
  function drawConcreteFloor(ctx, px, py, h) {
    ctx.fillStyle = "#5a5d58";
    ctx.fillRect(px, py, TILE, TILE);
    // 地面伸缩缝
    ctx.fillStyle = "rgba(0,0,0,0.13)";
    ctx.fillRect(px, py + TILE - 2, TILE, 2);
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fillRect(px, py, TILE, 1);
    // 补丁
    if (h > 0.6 && h < 0.68) {
      ctx.fillStyle = "rgba(120,124,118,0.5)";
      ctx.fillRect(px + 5, py + 6, 18, 16);
    }
    // 裂缝
    if (h > 0.75) {
      ctx.strokeStyle = "rgba(0,0,0,0.25)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px + 6 + h * 8, py + 5);
      ctx.lineTo(px + 14, py + 20);
      ctx.lineTo(px + 9, py + TILE - 6);
      ctx.stroke();
    }
    // 天花板工业横梁阴影
    if ((px / TILE + py / TILE) % 7 === 0) {
      ctx.fillStyle = "rgba(0,0,0,0.16)";
      ctx.fillRect(px, py + 6, TILE, 3);
    }
    // 板条箱（约 8% 的地板格）
    if (h > 0.9) {
      const cw = TILE * 0.62, ch = TILE * 0.5;
      const cx = px + (TILE - cw) / 2, cy = py + TILE - ch - 3;
      ctx.fillStyle = "#7a5a33";
      ctx.fillRect(cx, cy, cw, ch);
      ctx.strokeStyle = "rgba(0,0,0,0.4)";
      ctx.lineWidth = 2;
      ctx.strokeRect(cx, cy, cw, ch);
      ctx.strokeStyle = "rgba(0,0,0,0.28)";
      ctx.beginPath();
      ctx.moveTo(cx, cy + ch * 0.5); ctx.lineTo(cx + cw, cy + ch * 0.5);
      ctx.moveTo(cx + cw * 0.5, cy); ctx.lineTo(cx + cw * 0.5, cy + ch);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.fillRect(cx, cy, cw, 3);
    }
  }

  // Level 1.2 砼苑：墙就是 Level 1 那面混凝土墙，只是爬上了藤
  function drawConcreteGardenWall(ctx, px, py, h) {
    drawConcreteWall(ctx, px, py, h);
    // 顺着墙面爬下来的藤（不多，柱子上那些才是主体）
    if (h > 0.55) {
      ctx.strokeStyle = "rgba(96,140,58,0.55)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      const gx = px + 6 + h * (TILE - 12);
      ctx.moveTo(gx, py);
      ctx.lineTo(gx + 2, py + TILE * 0.45);
      ctx.lineTo(gx - 1, py + TILE);
      ctx.stroke();
      for (let i = 0; i < 3; i++) {
        const ly = py + 6 + hash2(px + i * 7, py) * (TILE - 14);
        ctx.fillStyle = "rgba(120,168,72,0.50)";
        ctx.beginPath();
        ctx.ellipse(gx + (i % 2 ? 5 : -5), ly, 4, 2.4, 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  // Level 1.2 砼苑：混凝土上长满植被 —— 底下那层还是 Level 1 的水泥地
  function drawConcreteGardenFloor(ctx, px, py, h, tx, ty) {
    drawConcreteFloor(ctx, px, py, h);
    // 苔藓 / 草：盖住水泥，但透得出下面的灰
    const n = hash2(tx * 3 + 1, ty * 5 + 2);
    ctx.fillStyle = "rgba(78,122,53," + (0.42 + n * 0.30).toFixed(3) + ")";
    ctx.fillRect(px, py, TILE, TILE);
    for (let i = 0; i < 6; i++) {
      const gx = px + hash2(tx * 13 + i, ty * 7 + 3) * TILE;
      const gy = py + 5 + hash2(tx * 5 + 1, ty * 17 + i) * (TILE - 9);
      const gh = 3 + hash2(tx + i, ty * 3) * 6;
      ctx.strokeStyle = "rgba(" + (104 + h * 56 | 0) + "," + (156 + h * 54 | 0) + ",64,0.70)";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.lineTo(gx + (hash2(tx, ty + i) - 0.5) * 4, gy - gh);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(28,50,18,0.16)";
    ctx.fillRect(px, py + TILE - 4, TILE, 4);
  }

  // Level 1.1 腐败的走廊：白炉渣砖墙（同 Level 1 的材质，只是白得发灰）
  function drawCorridor11Wall(ctx, px, py, h) {
    ctx.fillStyle = h > 0.5 ? "#b8b6ad" : "#aea99f";
    ctx.fillRect(px, py, TILE, TILE);
    // 炉渣砖的砌缝
    ctx.fillStyle = "rgba(0,0,0,0.13)";
    ctx.fillRect(px, py + TILE / 2, TILE, 2);
    ctx.fillRect(px + TILE / 2 - 1, py, 2, TILE / 2);
    ctx.fillRect(px + 1, py + TILE / 2 + 2, 2, TILE / 2 - 2);
    ctx.fillStyle = "rgba(255,255,255,0.10)";
    ctx.fillRect(px, py, TILE, 2);
    ctx.fillStyle = "rgba(0,0,0,0.20)";
    ctx.fillRect(px, py + TILE - 7, TILE, 7);
    // 墙缝里探出来的管道
    if (h > 0.80) {
      ctx.fillStyle = "#8d908a";
      ctx.fillRect(px + 4, py + TILE - 12, TILE - 8, 5);
      ctx.fillStyle = "rgba(0,0,0,0.24)";
      ctx.fillRect(px + 4, py + TILE - 9, TILE - 8, 2);
    }
    // 渗水的污渍
    if (h > 0.62 && h < 0.68) {
      ctx.fillStyle = "rgba(70,78,70,0.16)";
      ctx.fillRect(px + 5, py + 6, 16, 13);
    }
  }
  // Level 1.1 腐败的走廊：蓝色瓷砖地面
  function drawCorridor11Floor(ctx, px, py, h, tx, ty) {
    ctx.fillStyle = h > 0.5 ? "#5d7f96" : "#577a91";
    ctx.fillRect(px, py, TILE, TILE);
    // 瓷砖缝
    ctx.fillStyle = "rgba(255,255,255,0.10)";
    ctx.fillRect(px, py, TILE, 1);
    ctx.fillRect(px, py, 1, TILE);
    ctx.fillStyle = "rgba(0,0,0,0.16)";
    ctx.fillRect(px, py + TILE - 1, TILE, 1);
    ctx.fillRect(px + TILE - 1, py, 1, TILE);
    // 缺角 / 脏污：越往深处越糟（外层这里不作处理，区域差异由 drawCorridor11 叠加）
    if (h > 0.86) {
      ctx.fillStyle = "rgba(30,40,44,0.30)";
      ctx.fillRect(px + 6 + h * 10, py + 8, 9, 7);
    }
  }

  // Level 2+：管道梦魇墙面（废弃公共带）—— 锈蚀金属墙板 + 横贯的粗管道
  // 管道是顺着墙走的：墙挨着的是左右向的走廊，管道就从左往右排；
  // 一旦路拐向上/下，过了那个转角，管道就改成从下往上排。
  function pipeIsVertical(map, tx, ty) {
    const gd = map && map.layers && map.layers[0];
    if (!gd || !gd[ty] || gd[ty][tx] !== 1) return false;
    const floor = (x, y) => (gd[y] && gd[y][x] === 0);
    const vert = floor(tx, ty - 1) || floor(tx, ty + 1);     // 上下有路 -> 竖着走
    const horz = floor(tx - 1, ty) || floor(tx + 1, ty);     // 左右有路 -> 横着走
    if (vert && !horz) return true;
    return false;
  }
  function drawPipeWall(ctx, px, py, h, map, tx, ty) {
    ctx.fillStyle = "#4f5659";
    ctx.fillRect(px, py, TILE, TILE);
    // 金属墙板错缝
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(px + TILE - 2, py, 2, TILE);
    if (Math.floor(px / TILE) % 2 === 0) ctx.fillRect(px + TILE / 2 - 1, py, 2, TILE);
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fillRect(px, py, TILE, 2);
    // 底部阴影
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.fillRect(px, py + TILE - 9, TILE, 9);
    // 锈迹与水渍
    if (h > 0.5 && h < 0.56) {
      ctx.fillStyle = "rgba(140,88,38,0.35)";
      ctx.fillRect(px + 4, py + 12, 18, 14);
    } else if (h > 0.64 && h < 0.68) {
      ctx.fillStyle = "rgba(90,120,130,0.28)";
      ctx.fillRect(px + 10, py + 6, 14, 20);
    }
    // 管道：贴着墙走 —— 横向的墙排横向的管，转过拐角之后改成竖向（从下往上）
    const vertical = (tx != null && ty != null) ? pipeIsVertical(map, tx, ty) : false;
    const py0 = py + 12, ph = 20;
    if (!vertical) {
      ctx.fillStyle = "#7c4d2b"; // 锈铁管
      ctx.fillRect(px, py0, TILE, ph);
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.fillRect(px, py0, TILE, 3); // 高光
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fillRect(px, py0 + ph - 3, TILE, 3);
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      ctx.fillRect(px + 3, py0, 1, ph);
      ctx.fillRect(px + 7, py0, 1, ph);
      if (Math.floor(px / TILE) % 2 === 0) {           // 法兰接头（每 2 格一个）
        ctx.fillStyle = "#6d7071";
        ctx.fillRect(px + 3, py0 - 4, 11, ph + 8);
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.fillRect(px + 3, py0 - 4, 2, ph + 8);
        ctx.fillStyle = "rgba(255,255,255,0.15)";
        ctx.fillRect(px + 10, py0 - 4, 2, ph + 8);
      }
    } else {
      const pxx = px + 12, pw = 20;                    // 竖向：从下往上排
      ctx.fillStyle = "#7c4d2b";
      ctx.fillRect(pxx, py, pw, TILE);
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.fillRect(pxx, py, 3, TILE);
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fillRect(pxx + pw - 3, py, 3, TILE);
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      ctx.fillRect(pxx, py + 3, pw, 1);
      ctx.fillRect(pxx, py + 7, pw, 1);
      if (Math.floor(py / TILE) % 2 === 0) {           // 法兰接头（每 2 格一个）
        ctx.fillStyle = "#6d7071";
        ctx.fillRect(pxx - 4, py + 3, pw + 8, 11);
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.fillRect(pxx - 4, py + 3, pw + 8, 2);
        ctx.fillStyle = "rgba(255,255,255,0.15)";
        ctx.fillRect(pxx - 4, py + 10, pw + 8, 2);
      }
    }
    // 偶尔的阀门手轮
    if (h > 0.8) {
      ctx.fillStyle = "#b9ab92";
      ctx.beginPath();
      ctx.arc(px + TILE - 13, py0 + ph / 2, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.45)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(px + TILE - 13, py0 + ph / 2 - 8);
      ctx.lineTo(px + TILE - 13, py0 + ph / 2 + 8);
      ctx.stroke();
    }
  }

  // Level 2+：管道梦魇地面 —— 金属格栅板 + 锈斑 + 水洼
  function drawPipeFloor(ctx, px, py, h) {
    ctx.fillStyle = "#3a4043";
    ctx.fillRect(px, py, TILE, TILE);
    // 格栅横条
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    for (let i = 1; i < 4; i++) ctx.fillRect(px, py + i * 10, TILE, 2);
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.fillRect(px, py, TILE, 1);
    // 锈斑
    if (h > 0.5 && h < 0.57) {
      ctx.fillStyle = "rgba(130,85,40,0.32)";
      ctx.fillRect(px + 5, py + 7, 17, 13);
    }
    // 水洼反光
    if (h > 0.84) {
      ctx.fillStyle = "rgba(110,160,180,0.16)";
      ctx.beginPath();
      ctx.ellipse(px + TILE / 2, py + TILE / 2, 13, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.beginPath();
      ctx.ellipse(px + TILE / 2 - 3, py + TILE / 2 - 2, 4, 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // 天花板垂下的横管阴影
    if ((px / TILE + py / TILE) % 6 === 0) {
      ctx.fillStyle = "rgba(0,0,0,0.28)";
      ctx.fillRect(px, py + 5, TILE, 7);
    }
    // 偶尔的油桶
    if (h > 0.93) {
      ctx.fillStyle = "#5b6a70";
      ctx.fillRect(px + 6, py + TILE - 20, 15, 18);
      ctx.strokeStyle = "rgba(0,0,0,0.35)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(px + 6, py + TILE - 20, 15, 18);
      ctx.fillStyle = "rgba(255,255,255,0.10)";
      ctx.fillRect(px + 6, py + TILE - 20, 15, 3);
    }
  }

  function drawExit(ctx, map, t, floor) {
    // Level 0 的"闪烁的墙壁"：墙面忽明忽暗，像信号不良的电视
    if (map.exits) {
      for (const e of map.exits) {
        if (e.kind !== "wall" || (e.floor | 0) !== (floor | 0)) continue;
        drawFlickerWall(ctx, e, t);
      }
      // 右下角那间藏起来的小房间：整圈的墙黑白交替地闪
      for (const e of map.exits) {
        if (e.kind !== "glitchwall" || (e.floor | 0) !== (floor | 0)) continue;
        if (map.hospGlitch && map.hospGlitch.size) drawHospGlitch(ctx, map, t);
        else drawGlitchNook(ctx, map, t);
      }
      // 通往 Level 0.7 忆域的那面深黄的墙（不是门 —— 只是一面颜色不对劲的墙）
      for (const e of map.exits) {
        if (e.kind !== "ochrewall" || (e.floor | 0) !== (floor | 0)) continue;
        drawOchreWall(ctx, e, t);
      }
      // Level 1 基地周围那处隐蔽小屋：最里侧墙上那道缝（通向 Level 2.1）
      for (const e of map.exits) {
        if (e.kind !== "nook21" || (e.floor | 0) !== (floor | 0)) continue;
        drawNook21Slit(ctx, map, t);
      }
    }
    // Level 18 的出口是"转身"那扇深色木门（下面单独画）—— 不摆绿色门牌。
    // 注意：Level 18 刻意**不设** map.exit（免得被"站在出口上就算通关"误判），
    // 所以这一支必须排在下面的 !map.exit 提前 return 之前，否则门永远画不出来。
    if (map.turnBackDoor) { drawExitDoor(ctx, map.turnBackDoor, t); return; }
    if (!map.exit || (map.exit.floor | 0) !== (floor | 0)) return; // 出口不在这一层
    // Level 1 的出口是尽头那团黑雾（由 drawBlackFog 画），不再摆绿色门牌
    if (map.blackFog) return;
    const ex = map.exit.x * TILE + TILE / 2, ey = map.exit.y * TILE + TILE / 2;
    const pulse = 0.6 + 0.4 * Math.sin(t * 3);
    ctx.save();
    ctx.shadowColor = "rgba(70,255,140," + pulse.toFixed(3) + ")";
    ctx.shadowBlur = 26;
    const w = 24, h = 36;
    const g = ctx.createLinearGradient(ex, ey - h / 2, ex, ey + h / 2);
    g.addColorStop(0, "#b7ffcf");
    g.addColorStop(1, "#2fbf6b");
    ctx.fillStyle = g;
    ctx.fillRect(ex - w / 2, ey - h / 2, w, h);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.lineWidth = 2;
    ctx.strokeRect(ex - w / 2, ey - h / 2, w, h);
    ctx.fillStyle = "rgba(255,255,255," + (0.35 + 0.25 * Math.sin(t * 3)).toFixed(3) + ")";
    ctx.fillRect(ex - 3, ey - h / 2 + 6, 6, h - 12);
    ctx.restore();
  }

  // Level 18：通往 Level 19 的那扇门 —— 深色木门，门上钉着一块 EXIT 的牌子
  function drawExitDoor(ctx, d, t) {
    // 门要画在墙里，不能凸出来。以前整扇门往上顶出 6px，
    // 看起来像是"从墙里长出来的一块板"，也和别的门对不齐。
    const px = d.x * TILE, py = d.y * TILE;
    const ex = px + TILE / 2, ey = py + TILE / 2;
    ctx.save();
    // 门框：完全落在这一格内
    ctx.fillStyle = "#3a2a1c";
    ctx.fillRect(px + 3, py + 2, TILE - 6, TILE - 4);
    // 门板：深色木纹
    ctx.fillStyle = "#4a3320";
    ctx.fillRect(px + 6, py + 5, TILE - 12, TILE - 10);
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    for (let i = 0; i < 4; i++) ctx.fillRect(px + 6 + i * 7, py + 5, 1.5, TILE - 10);
    ctx.fillStyle = "rgba(255,220,170,0.10)";
    ctx.fillRect(px + 6, py + 5, TILE - 12, 3);
    ctx.fillStyle = "#5c4128";                       // 上下两道横撑
    ctx.fillRect(px + 6, py + 5 + (TILE - 10) * 0.28, TILE - 12, 3);
    ctx.fillRect(px + 6, py + 5 + (TILE - 10) * 0.68, TILE - 12, 3);
    // 门把手
    ctx.fillStyle = "#b9ab92";
    ctx.beginPath(); ctx.arc(px + TILE - 11, ey + 2, 2.4, 0, Math.PI * 2); ctx.fill();
    // EXIT 牌子：微微发亮，走过去才看得清
    const pulse = 0.55 + 0.45 * Math.sin(t * 2);
    ctx.fillStyle = "rgba(20,14,8,0.92)";
    ctx.fillRect(px + 7, py + 6, TILE - 14, 9);
    ctx.shadowColor = "rgba(255,214,120," + (0.35 * pulse).toFixed(3) + ")";
    ctx.shadowBlur = 10;
    ctx.fillStyle = "#ffd97a";
    ctx.font = "bold 7px ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.fillText("EXIT", ex, py + 12);
    ctx.textAlign = "left";
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // 档案纸片（世界坐标，迷雾之下绘制）
  function drawArchives(ctx, g, t) {
    for (const ap of g.archives) {
      if ((ap.floor | 0) !== g.floor) continue; // 另一层的档案不画（那边的坐标在这层可能是墙）
      const bob = Math.sin(t * 3 + ap.x * 0.11) * 1.4;
      ctx.save();
      ctx.translate(ap.x, ap.y + bob);
      ctx.rotate(Math.sin(t * 1.5 + ap.x * 0.7) * 0.15);
      ctx.fillStyle = "rgba(239,227,189,0.92)";
      ctx.fillRect(-6, -8, 12, 16);
      ctx.strokeStyle = "rgba(90,75,40,0.5)";
      ctx.lineWidth = 1;
      ctx.strokeRect(-6, -8, 12, 16);
      ctx.strokeStyle = "rgba(90,75,40,0.4)";
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        ctx.moveTo(-4, -4.5 + i * 3.6);
        ctx.lineTo(4, -4.5 + i * 3.6);
      }
      ctx.stroke();
      ctx.restore();
    }
  }

  // 档案微光（屏幕坐标，画在迷雾之上，黑暗中也能看到光点）
  function drawArchiveGlows(g, cam) {
    const t = g.time;
    // 熄灯区连档案微光都不能有：整片区域完全无照明、一盏灯也没有。
    const L0 = (String(g.level) === "0" && g.map && g.map.l0zones) ? g.map.l0zones : null;
    const bz = L0 ? L0.zones.find((q) => q.key === "blackout") : null;
    for (const ap of g.archives) {
      if ((ap.floor | 0) !== g.floor) continue;
      if (bz) {
        const atx = Math.floor(ap.x / TILE), aty = Math.floor(ap.y / TILE);
        if (atx >= bz.x && atx < bz.x + bz.w && aty >= bz.y && aty < bz.y + bz.h) continue;
      }
      const sx = (ap.x - cam.x) * cam.scale + W / 2;
      const sy = (ap.y - cam.y) * cam.scale + H / 2;
      if (sx < -40 || sy < -40 || sx > W + 40 || sy > H + 40) continue;
      const r = 15 + Math.sin(t * 4 + ap.x * 0.2) * 5;
      const grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
      grd.addColorStop(0, "rgba(255,228,150,0.5)");
      grd.addColorStop(1, "rgba(255,228,150,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(sx - r, sy - r, r * 2, r * 2);
    }
  }

  // 联机：同一层的其它玩家（画成半透明的轮廓 + 名字，不挡视线）
  // 别的玩家的手电：在他前面画一道暖黄的光锥
  function drawRemoteFlash(ctx, o, cam, g) {
    const ang = (o.ang != null ? o.ang : 0);
    const reach = CONFIG.LIGHT_RADIUS * TILE * 0.9;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const grd = ctx.createRadialGradient(o.x, o.y, 8, o.x, o.y, reach);
    grd.addColorStop(0, "rgba(255, 238, 190, 0.30)");
    grd.addColorStop(0.55, "rgba(255, 232, 170, 0.12)");
    grd.addColorStop(1, "rgba(255, 230, 160, 0)");
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.moveTo(o.x, o.y);
    const half = 0.62;
    ctx.arc(o.x, o.y, reach, ang - half, ang + half);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // 写实模式的「孤立效应」：Level 0 与 Level ! 里，每个玩家都在一个单独的副本里，
  // 永远不会相遇 —— 既不画别人的身体，也不画别人的手电光锥。
  function mpIsolatedLevel(lv) {
    const s = String(lv);
    return s === "0" || s === "bang";
  }
  function drawRemotePlayers(ctx, g, cam) {
    if (window.__mpReal && mpIsolatedLevel(g.level)) return;
    const list = (window.Net && window.Net.room && window.LobbyMPRemote) ? window.LobbyMPRemote : null;
    if (!list || !list.length) return;
    for (const o of list) {
      if (o.lv !== g.level || (o.f | 0) !== (g.floor | 0)) continue;
      ctx.save();
      ctx.globalAlpha = 0.72;
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath(); ctx.ellipse(o.x, o.y + 9, 11, 5, 0, 0, Math.PI * 2); ctx.fill();
      const od = (o.outfit && (function(){ const d0 = OUTFITS[o.outfit] || OUTFITS.drifter;
        const c0 = loadOutfitColors()[d0.key]; return c0 ? Object.assign({}, d0, c0) : d0; })()) || OUTFITS.drifter;
      ctx.fillStyle = od.body;
      ctx.beginPath(); ctx.ellipse(o.x, o.y, 10, 12, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.4)"; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = od.skin;
      ctx.beginPath(); ctx.arc(o.x, o.y - 10, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = od.hair;
      ctx.beginPath(); ctx.arc(o.x, o.y - 11, 7, Math.PI * 1.05, Math.PI * 1.95); ctx.fill();
      // 别人穿的防化服也要看得见 —— K 版那套（长方形黑玻璃眼罩）走专属画法
      if (od.suit && od.kversion) {
        drawKSuitOn(ctx, o.x, o.y, 0, od, od.body);
      } else if (od.suit) {
        ctx.fillStyle = "#191919";
        ctx.beginPath(); ctx.ellipse(o.x, o.y - 9, 7.5, 8.5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#0c0c0c"; ctx.lineWidth = 1.2; ctx.stroke();
        ctx.fillStyle = "#3a4a2e";
        ctx.beginPath();
        ctx.arc(o.x - 3.2, o.y - 12, 2.6, 0, Math.PI * 2);
        ctx.arc(o.x + 3.2, o.y - 12, 2.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#242424";
        ctx.beginPath(); ctx.ellipse(o.x, o.y - 5.5, 3.4, 2.6, 0, 0, Math.PI * 2); ctx.fill();
      } else if (od.vest) {
        ctx.fillStyle = "rgba(240,240,200,0.85)";
        ctx.fillRect(o.x - 9, o.y - 1, 18, 2.2);
        ctx.fillRect(o.x - 8, o.y + 6, 16, 2.2);
      }
      // 别人的手电：按他面朝的方向画一道光锥（关了就不画）
      if (o.fl && typeof drawRemoteFlash === "function") {
        drawRemoteFlash(ctx, o, cam, g);
      }
      // 名字
      ctx.globalAlpha = 0.9;
      ctx.font = "11px ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(200,255,190,0.85)";
      ctx.fillText(String(o.name || "流浪者").slice(0, 10), o.x, o.y - 26);
      ctx.textAlign = "left";
      ctx.restore();
    }
  }

  // ===========================================================
  // K 版防化服（B.N.T.G 在新时代广场卖的那套）
  // 和普通生化防护服最大的区别：眼罩不是两片圆镜片，而是一整块
  // 横贯面部的黑色长方形玻璃；另外多了接缝胶条、背后的滤毒罐和
  // 胸口的压力表 —— 细节比主菜单那套多得多。
  // 联机里队友也走这一个函数，所以你穿上它别人看得见。
  // ===========================================================
  function drawKSuitOn(c2, x, y, t, od, bodyCol) {
    const body = bodyCol || (od && od.body) || "#4a5540";
    c2.save();
    // ---- 连体服：比普通衣服宽一圈，肩部有垫 ----
    c2.fillStyle = body;
    c2.beginPath(); c2.ellipse(x, y, 11, 12.5, 0, 0, Math.PI * 2); c2.fill();
    c2.strokeStyle = "rgba(0,0,0,0.45)"; c2.lineWidth = 1.4; c2.stroke();
    // 竖向接缝 + 压胶条（胸前一竖、两侧各一竖）
    c2.strokeStyle = "rgba(20,26,16,0.75)"; c2.lineWidth = 1.2;
    c2.beginPath();
    c2.moveTo(x, y - 4); c2.lineTo(x, y + 11);            // 中缝
    c2.moveTo(x - 5.5, y - 2); c2.lineTo(x - 5.5, y + 9);  // 左压条
    c2.moveTo(x + 5.5, y - 2); c2.lineTo(x + 5.5, y + 9);  // 右压条
    c2.stroke();
    c2.strokeStyle = "rgba(190,205,170,0.30)"; c2.lineWidth = 0.8;
    c2.beginPath();
    c2.moveTo(x - 6.2, y - 2); c2.lineTo(x - 6.2, y + 9);
    c2.moveTo(x + 6.2, y - 2); c2.lineTo(x + 6.2, y + 9);
    c2.stroke();
    // 腰带 + 扣
    c2.fillStyle = "rgba(24,28,20,0.9)";
    c2.fillRect(x - 10, y + 3, 20, 2.6);
    c2.fillStyle = "rgba(200,190,120,0.75)";
    c2.fillRect(x - 1.6, y + 3, 3.2, 2.6);
    // 背后的滤毒罐（从肩膀后面露出一截）
    c2.fillStyle = "#2b3126";
    c2.beginPath(); c2.ellipse(x + 9.5, y - 2, 3.2, 4.6, -0.25, 0, Math.PI * 2); c2.fill();
    c2.strokeStyle = "rgba(0,0,0,0.5)"; c2.lineWidth = 1; c2.stroke();
    c2.fillStyle = "rgba(120,130,100,0.55)";
    c2.fillRect(x + 7.6, y - 6.4, 3.8, 1.8);              // 罐口的螺纹
    // 胸口的压力表（会微微摆）
    const na = -Math.PI * 0.6 + 0.35 * Math.sin(t * 1.3 + x);
    c2.fillStyle = "#d9dcc4";
    c2.beginPath(); c2.arc(x - 4.5, y + 0.5, 2.4, 0, Math.PI * 2); c2.fill();
    c2.strokeStyle = "#1a1a1a"; c2.lineWidth = 0.9; c2.stroke();
    c2.strokeStyle = "#b4382c"; c2.lineWidth = 0.9;
    c2.beginPath();
    c2.moveTo(x - 4.5, y + 0.5);
    c2.lineTo(x - 4.5 + Math.cos(na) * 1.8, y + 0.5 + Math.sin(na) * 1.8);
    c2.stroke();
    // ---- 头罩：罩住整个头的深色头套 ----
    c2.fillStyle = "#20241c";
    c2.beginPath(); c2.ellipse(x, y - 10, 8, 9, 0, 0, Math.PI * 2); c2.fill();
    c2.strokeStyle = "rgba(0,0,0,0.55)"; c2.lineWidth = 1.3; c2.stroke();
    // ---- 眼罩：一整块横贯面部的黑色长方形玻璃（K 版的标志）----
    c2.fillStyle = "#0b0d0a";
    c2.fillRect(x - 6.6, y - 13.2, 13.2, 5.4);
    // 玻璃反光：斜着扫过的一道亮带
    c2.save();
    c2.beginPath(); c2.rect(x - 6.6, y - 13.2, 13.2, 5.4); c2.clip();
    const sh = x - 6.6 + ((t * 26) % 26) - 6;
    const gg = c2.createLinearGradient(sh, 0, sh + 8, 0);
    gg.addColorStop(0, "rgba(255,255,255,0)");
    gg.addColorStop(0.5, "rgba(210,230,255,0.30)");
    gg.addColorStop(1, "rgba(255,255,255,0)");
    c2.fillStyle = gg;
    c2.fillRect(x - 6.6, y - 13.2, 13.2, 5.4);
    c2.restore();
    // 玻璃边框（金属压边）
    c2.strokeStyle = "rgba(150,158,132,0.65)"; c2.lineWidth = 1;
    c2.strokeRect(x - 6.6, y - 13.2, 13.2, 5.4);
    // ---- 下方的呼吸器 / 通话膜 ----
    c2.fillStyle = "#15180f";
    c2.beginPath(); c2.ellipse(x, y - 6.4, 4.2, 2.8, 0, 0, Math.PI * 2); c2.fill();
    c2.strokeStyle = "rgba(120,128,104,0.5)"; c2.lineWidth = 0.9; c2.stroke();
    // 头带
    c2.strokeStyle = "#0e100c"; c2.lineWidth = 1.7;
    c2.beginPath(); c2.moveTo(x - 8, y - 11.5); c2.lineTo(x + 8, y - 11.5); c2.stroke();
    c2.restore();
  }

  // 「生化防护服」人物的模型：黄色连体服 + 黑色防毒面具。
  // 窃皮者直接用这一套（entities.js 里不再单独做造型），所以画出来的就是玩家
  // 穿防护服时的样子。传 { trueForm: true } 时**还是同一副身子**，只是那张皮
  // 没绷住：惨白松垮、没有面罩、嘴下留一道短短的缝 —— 这是它靠近后的真面目。
  window.drawHazmatFigure = function (ctx, x, y, t, opt) {
    const raw = !!(opt && opt.trueForm);
    const body = raw ? "#dedac9" : "#f2c518";
    const skin = raw ? "#e7e2d3" : "#2b2b2b";
    const hair = raw ? "#cfc9b6" : "#1a1a1a";
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath(); ctx.ellipse(x, y + 9, 12, 5, 0, 0, Math.PI * 2); ctx.fill();
    // 身体（真面目要往下坠一点，皮是挂着的，不贴身）
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.ellipse(x, y + (raw ? 1.5 : 0), raw ? 11 : 10, raw ? 13.5 : 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = raw ? "rgba(92,84,68,0.55)" : "rgba(0,0,0,0.35)"; ctx.lineWidth = 1.5; ctx.stroke();
    if (raw) {
      // 松垮下来的几道褶皱
      ctx.strokeStyle = "rgba(112,102,84,0.5)"; ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(x - 9, y - 1); ctx.quadraticCurveTo(x - 4, y + 2, x - 8, y + 6);
      ctx.moveTo(x + 9, y - 2); ctx.quadraticCurveTo(x + 4, y + 2, x + 8, y + 7);
      ctx.moveTo(x - 5, y + 8); ctx.quadraticCurveTo(x, y + 10, x + 5, y + 8);
      ctx.stroke();
    } else {
      // 袖口 / 腰间接缝：连体服的轮廓
      ctx.strokeStyle = "rgba(120,92,0,0.55)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x - 9, y + 3); ctx.lineTo(x + 9, y + 3); ctx.stroke();
    }
    // 头
    ctx.fillStyle = skin;
    ctx.beginPath(); ctx.arc(x, y - 10, raw ? 7.4 : 7, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = raw ? "rgba(90,82,66,0.6)" : "rgba(0,0,0,0.35)"; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = hair;
    ctx.beginPath(); ctx.arc(x, y - 11, raw ? 7.4 : 7, Math.PI * 1.05, Math.PI * 1.95); ctx.fill();
    if (raw) {
      // 真面目：没有面罩，两只发光的眼 + 嘴下那道短缝
      ctx.fillStyle = "rgba(255,240,178,0.95)";
      ctx.beginPath();
      ctx.arc(x - 3, y - 11.4, 1.7, 0, Math.PI * 2);
      ctx.arc(x + 3, y - 11.4, 1.7, 0, Math.PI * 2);
      ctx.fill();
      // 嘴：从嘴巴下沿到嘴巴的一道缝 —— 只有约 4 像素，不是很长
      ctx.strokeStyle = "#4a3b30"; ctx.lineWidth = 1.7; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(x, y - 6.2); ctx.lineTo(x, y - 1.9); ctx.stroke();
      ctx.strokeStyle = "rgba(126,110,90,0.65)"; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(x + 1.5, y - 6); ctx.lineTo(x + 1.5, y - 2.1); ctx.stroke();
    } else {
      // 防毒面具：罩住整张脸的黑色面罩 + 两个滤毒罐 + 头带
      ctx.fillStyle = "#191919";
      ctx.beginPath(); ctx.ellipse(x, y - 9, 7.5, 8.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#0c0c0c"; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.fillStyle = "#3a4a2e";
      ctx.beginPath();
      ctx.arc(x - 3.2, y - 12, 2.6, 0, Math.PI * 2);
      ctx.arc(x + 3.2, y - 12, 2.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(200,255,180,0.35)";
      ctx.beginPath();
      ctx.arc(x - 3.8, y - 12.8, 1.1, 0, Math.PI * 2);
      ctx.arc(x + 2.6, y - 12.8, 1.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#242424";
      ctx.beginPath(); ctx.ellipse(x, y - 5.5, 3.4, 2.6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#101010"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(x - 7.5, y - 11); ctx.lineTo(x + 7.5, y - 11); ctx.stroke();
    }
    ctx.restore();
  };

  function drawPlayer(ctx, p, t, g) {
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + 9, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    // 服装（主菜单「服装」里切换）；悲尸循环时身体逐渐被血色浸透
    const od = currentOutfitDef(g);        // 含自定义配色 —— 以前直接用原色，改了色不生效
    const wk = g ? wretchK(g) : 0;
    const bodyCol = mixColor(od.body, "#a81f1f", wk);
    const skinCol = mixColor(od.skin, "#c23a2a", wk);
    const hairCol = mixColor(od.hair, "#3a0d0d", wk);
    // 身体
    ctx.fillStyle = bodyCol;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, 10, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // 循环推进到一定程度后，身上开始渗出红色的纹路
    if (wk > 0.25) {
      ctx.strokeStyle = "rgba(255,60,60," + (0.35 + 0.5 * wk).toFixed(3) + ")";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const a = t * 0.8 + i * 2.1;
        ctx.moveTo(p.x + Math.cos(a) * 3, p.y + Math.sin(a) * 5);
        ctx.lineTo(p.x + Math.cos(a + 1.4) * 9, p.y + Math.sin(a + 1.4) * 11);
      }
      ctx.stroke();
    }
    // 头
    ctx.fillStyle = skinCol;
    ctx.beginPath();
    ctx.arc(p.x, p.y - 10, 7, 0, Math.PI * 2);
    ctx.fill();
    // 头发
    ctx.fillStyle = hairCol;
    ctx.beginPath();
    ctx.arc(p.x, p.y - 11, 7, Math.PI * 1.05, Math.PI * 1.95);
    ctx.fill();
    // Level 26 彩蛋：扫兴客面具 =( 戴在脸上，直到主菜单里摘下
    if (g && window.l26MaskOn && window.l26MaskOn() && window.l26DrawPlayerMask) {
      try { window.l26DrawPlayerMask(ctx, p.x, p.y); } catch (_) { /* 忽略 */ }
    }
    // 服装特征：生化防护服 = 黄色连体服 + 黑色防毒面具；K 版 = 长方形黑玻璃眼罩；检修服 = 反光条
    if (od.suit && od.kversion) {
      drawKSuitOn(ctx, p.x, p.y, t, od, bodyCol);
    } else if (od.suit) {
      // 防毒面具：罩住整张脸的黑色面罩 + 两个滤毒罐 + 头带
      ctx.fillStyle = "#191919";
      ctx.beginPath();
      ctx.ellipse(p.x, p.y - 9, 7.5, 8.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#0c0c0c";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      // 护目镜（两片发暗光的镜片）
      ctx.fillStyle = "#3a4a2e";
      ctx.beginPath();
      ctx.arc(p.x - 3.2, p.y - 12, 2.6, 0, Math.PI * 2);
      ctx.arc(p.x + 3.2, p.y - 12, 2.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(200,255,180,0.35)";
      ctx.beginPath();
      ctx.arc(p.x - 3.8, p.y - 12.8, 1.1, 0, Math.PI * 2);
      ctx.arc(p.x + 2.6, p.y - 12.8, 1.1, 0, Math.PI * 2);
      ctx.fill();
      // 滤毒罐
      ctx.fillStyle = "#242424";
      ctx.beginPath();
      ctx.ellipse(p.x, p.y - 5.5, 3.4, 2.6, 0, 0, Math.PI * 2);
      ctx.fill();
      // 头带
      ctx.strokeStyle = "#101010";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(p.x - 7.5, p.y - 11); ctx.lineTo(p.x + 7.5, p.y - 11);
      ctx.stroke();
    } else if (od.vest) {
      // 检修服：胸口与腰间的反光条
      ctx.fillStyle = "rgba(240,240,200,0.85)";
      ctx.fillRect(p.x - 9, p.y - 1, 18, 2.2);
      ctx.fillRect(p.x - 8, p.y + 6, 16, 2.2);
      ctx.fillStyle = "rgba(255,220,80,0.5)";
      ctx.fillRect(p.x - 9, p.y - 1, 18, 0.8);
    }
    // 手持的手电筒本体（光柱由 drawFlashBeam 画成自然的锥形）
    const flash = g && g.flashlight;
    ctx.strokeStyle = flash ? "rgba(255,240,180,0.95)" : "rgba(255,240,180,0.45)";
    ctx.lineWidth = flash ? 3.5 : 2;
    ctx.beginPath();
    ctx.moveTo(p.x + p.faceX * 10, p.y + p.faceY * 10);
    ctx.lineTo(p.x + p.faceX * 22, p.y + p.faceY * 22);
    ctx.stroke();
    // 沉进水里：人渐渐被水盖住 —— 水面漫过头顶，只剩一圈涟漪
    const sk = (g && g.sink) || 0;
    if (sk > 0.05) {
      const cover = Math.min(1, sk);                    // 0 = 站在水面，1 = 完全没入
      const topY = p.y - 20 + cover * 44;               // 水线从脚下往上漫
      ctx.save();
      ctx.beginPath();
      ctx.rect(p.x - 26, topY, 52, 60);
      ctx.clip();
      ctx.fillStyle = "rgba(30,70,95," + (0.30 + 0.34 * cover).toFixed(3) + ")";
      ctx.fillRect(p.x - 26, topY, 52, 60);
      ctx.restore();
      // 水线：一条晃动的亮边 + 两圈涟漪
      ctx.strokeStyle = "rgba(190,240,255," + (0.55 * cover).toFixed(3) + ")";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let i = 0; i <= 10; i++) {
        const xx = p.x - 20 + i * 4;
        const yy = topY + Math.sin(t * 3.4 + i * 0.7) * 1.8;
        if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
      }
      ctx.stroke();
      for (let r = 0; r < 2; r++) {
        const rr = 12 + r * 9 + ((t * 26 + r * 14) % 16);
        const a = (0.30 - r * 0.12) * cover;
        if (a <= 0) continue;
        ctx.strokeStyle = "rgba(210,245,255," + a.toFixed(3) + ")";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(p.x, topY + 6, rr, rr * 0.34, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }


  // 闪烁的墙壁：一块会忽明忽暗、边缘发抖的墙面（Level 0 通往 Level 1 下层）
  function drawFlickerWall(ctx, e, t) {
    const px = e.x * TILE, py = e.y * TILE;
    // 闪烁强度：快速跳变，偶尔整个熄灭一下
    const flick = 0.35 + 0.65 * Math.abs(Math.sin(t * 7.3 + e.x));
    const drop = Math.sin(t * 2.1 + e.y) > 0.93 ? 0.15 : 1;
    const a = flick * drop;
    ctx.save();
    // 底：比周围墙面稍亮一点，暗示这里"不对劲"
    ctx.fillStyle = "rgba(255,246,190," + (0.10 * a).toFixed(3) + ")";
    ctx.fillRect(px, py, TILE, TILE);
    // 脉动的边框
    ctx.strokeStyle = "rgba(255,250,210," + (0.55 * a).toFixed(3) + ")";
    ctx.lineWidth = 2;
    ctx.strokeRect(px + 1.5, py + 1.5, TILE - 3, TILE - 3);
    // 横向撕裂的亮条
    for (let i = 0; i < 4; i++) {
      const yy = py + ((t * 90 + i * 11) % TILE);
      ctx.fillStyle = "rgba(255,252,225," + (0.22 * a).toFixed(3) + ")";
      ctx.fillRect(px, yy, TILE, 1.5);
    }
    // 外发光
    ctx.shadowColor = "rgba(255,240,170," + (0.5 * a).toFixed(3) + ")";
    ctx.shadowBlur = 20 * a;
    ctx.strokeStyle = "rgba(255,235,150," + (0.35 * a).toFixed(3) + ")";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(px + 3, py + 3, TILE - 6, TILE - 6);
    ctx.restore();
  }


  // Level 0 右下角那间小房间：整圈的墙黑白交替地闪，像坏掉的电视信号。
  // 只画真正是墙的格子 —— 通道挖穿的那几格已经是地板了，不能涂黑。
  function drawGlitchNook(ctx, map, t) {
    const n = map.glitchNook;
    if (!n) return;
    const grid = (typeof layerGrid === "function") ? layerGrid(map, 0) : (map.layers ? map.layers[0] : map.grid);
    const cells = [];
    for (let xx = n.x - 1; xx <= n.x + n.w; xx++) { cells.push([xx, n.y - 1]); cells.push([xx, n.y + n.h]); }
    for (let yy = n.y; yy < n.y + n.h; yy++) { cells.push([n.x - 1, yy]); cells.push([n.x + n.w, yy]); }
    for (const c of cells) {
      const gx = c[0], gy = c[1];
      if (!grid || !grid[gy] || grid[gy][gx] !== 1) continue;
      const px = gx * TILE, py = gy * TILE;
      const white = Math.sin(t * 9 + gx * 1.7 + gy * 2.3) > 0;
      ctx.fillStyle = white ? "rgba(240,240,244,0.93)" : "rgba(9,9,11,0.93)";
      ctx.fillRect(px, py, TILE + 0.5, TILE + 0.5);
      // 横向撕裂的扫描线
      const sy = py + ((t * 130 + gx * 7 + gy * 13) % TILE);
      ctx.fillStyle = white ? "rgba(0,0,0,0.38)" : "rgba(255,255,255,0.30)";
      ctx.fillRect(px, sy, TILE, 2);
    }
  }

  // Level 0 里那面通往 Level 0.7 忆域的墙：**不是门**，只是纸面上那片黄
  // 比别处深得多，还隐隐发暗 —— 走近就能看出来这面墙不对劲。
  function drawOchreWall(ctx, e, t) {
    if (!e) return;
    const px = e.x * TILE, py = e.y * TILE;
    const pulse = 0.5 + 0.5 * Math.sin(t * 1.8);
    ctx.fillStyle = "#8a6f16";
    ctx.fillRect(px, py, TILE + 0.5, TILE + 0.5);
    // 墙纸的花纹还在，只是被压得又深又暗
    ctx.strokeStyle = "rgba(60,44,8,0.55)";
    ctx.lineWidth = 1;
    ctx.strokeRect(px + 0.5, py + 0.5, TILE - 1, TILE - 1);
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(px, py + TILE - 8, TILE, 8);
    // 一层缓慢呼吸的暗黄光晕，让它在满屏的黄墙纸里能被认出来
    const g = ctx.createRadialGradient(
      px + TILE / 2, py + TILE / 2, 2,
      px + TILE / 2, py + TILE / 2, TILE * 1.5);
    g.addColorStop(0, "rgba(150,110,20," + (0.30 + 0.16 * pulse).toFixed(3) + ")");
    g.addColorStop(1, "rgba(120,90,10,0)");
    ctx.fillStyle = g;
    ctx.fillRect(px - TILE, py - TILE, TILE * 3, TILE * 3);
  }

  // Level 11 医院药房：那面墙在"错乱" —— 墙纸一点点错位，底下的现实渗出来。
  // 只闪药房后墙那几格，不像 Level 0 那样整圈墙一起闪。
  function drawHospGlitch(ctx, map, t) {
    const set = map.hospGlitch;
    if (!set || !set.size) return;
    for (const k of set) {
      const [sx, sy] = k.split(",");
      const gx = +sx, gy = +sy;
      const px = gx * TILE, py = gy * TILE;
      const white = Math.sin(t * 9 + gx * 1.7 + gy * 2.3) > 0;
      ctx.fillStyle = white ? "rgba(240,240,244,0.92)" : "rgba(9,9,11,0.92)";
      ctx.fillRect(px, py, TILE + 0.5, TILE + 0.5);
      // 横向撕裂的扫描线
      const sy2 = py + ((t * 130 + gx * 7 + gy * 13) % TILE);
      ctx.fillStyle = white ? "rgba(0,0,0,0.34)" : "rgba(255,255,255,0.28)";
      ctx.fillRect(px, sy2, TILE, 2);
      // 渗出来的那点霓虹：这面墙通向 Level 109
      ctx.fillStyle = "rgba(90,220,255," + (0.10 + 0.10 * Math.sin(t * 5 + gx)).toFixed(3) + ")";
      ctx.fillRect(px, py + TILE * 0.62, TILE, 3);
    }
  }

  // 沉在水下：整屏压一层蓝绿的水色，越深越浓 —— 也是"你在水下"最直接的信号
  function drawUnderwater(g) {
    if (!g || !g.sink) return;
    const sk = Math.min(1, g.sink);
    if (sk <= 0.02) return;
    const a = 0.10 + 0.42 * sk;
    ctx.fillStyle = "rgba(24,74,104," + a.toFixed(3) + ")";
    ctx.fillRect(0, 0, W, H);
    // 快淹死的时候（30 秒撑过之后），屏幕边缘跟着心跳一样收紧发暗
    if (g.drownT > 30) {
      const t = performance.now() / 1000;
      const pulse = 0.35 + 0.30 * Math.abs(Math.sin(t * 2.6));
      const grd = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.18,
        W / 2, H / 2, Math.max(W, H) * 0.72);
      grd.addColorStop(0, "rgba(0,0,0,0)");
      grd.addColorStop(1, "rgba(10,30,50," + pulse.toFixed(3) + ")");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);
    }
  }

  // Level 1.1：区域 3 大半被黑暗笼罩（手电在这里没用），区域 4 黑白且剧烈起伏
  function drawCorridor11(g) {
    if (!g || String(g.level) !== "1.1" || g.phase !== "playing") return;
    const fn = (typeof corridorZoneAt === "function") ? corridorZoneAt : (window.corridorZoneAt);
    if (!fn) return;
    const tx = Math.floor(g.player.x / TILE);
    const z = fn(g.map, tx);
    const t = (typeof performance !== "undefined" ? performance.now() : 0) / 1000;
    if (z === 3) {
      for (const b of (g.map.bright || [])) {           // 光照区例外
        if (Math.hypot((b.x + 0.5) * TILE - g.player.x, (b.y + 0.5) * TILE - g.player.y) < TILE * 3.2) return;
      }
      ctx.fillStyle = "rgba(0,0,0,0.86)";
      ctx.fillRect(0, 0, W, H);
      return;
    }
    if (z === 4) {
      ctx.save();
      ctx.globalAlpha = 0.34;
      for (let i = 0; i < 18; i++) {
        const y = ((i * 67 + t * 170) % (H + 160)) - 80;
        ctx.fillStyle = (i % 2) ? "rgba(255,255,255,0.60)" : "rgba(0,0,0,0.70)";
        ctx.fillRect(0, y, W, 6 + (i % 3) * 7);
      }
      ctx.restore();
      ctx.fillStyle = "rgba(126,126,126,0.20)";         // 去色：整段褪成灰
      ctx.fillRect(0, 0, W, H);
      const pulse = 0.16 + 0.14 * Math.abs(Math.sin(t * 2.2));
      const grd = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.20,
        W / 2, H / 2, Math.max(W, H) * 0.68);
      grd.addColorStop(0, "rgba(0,0,0,0)");
      grd.addColorStop(1, "rgba(0,0,0," + pulse.toFixed(3) + ")");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);
    }
  }

  // 花园段 / 砼苑：缠上来的藤蔓（画在屏幕四周，越缠越往里爬）
  function drawGardenVines(g) {
    if (!g || !g.vine || g.vine <= 0.03) return;
    const k = Math.min(1, g.vine);
    const t = (typeof performance !== "undefined" ? performance.now() : 0) / 1000;
    const cx = W / 2, cy = H / 2;
    const r0 = Math.max(W, H) * 0.60;
    ctx.save();
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + t * 0.05;
      const len = r0 * (0.10 + 0.78 * k);
      ctx.strokeStyle = "rgba(28,66,26," + (0.55 * k).toFixed(3) + ")";
      ctx.lineWidth = 3 + 7 * k;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
      ctx.quadraticCurveTo(cx + Math.cos(a + 0.4) * r0 * 0.60, cy + Math.sin(a + 0.4) * r0 * 0.60,
        cx + Math.cos(a) * (r0 - len), cy + Math.sin(a) * (r0 - len));
      ctx.stroke();
      ctx.fillStyle = "rgba(54,112,48," + (0.5 * k).toFixed(3) + ")";
      ctx.beginPath();
      ctx.ellipse(cx + Math.cos(a) * (r0 - len * 0.6), cy + Math.sin(a) * (r0 - len * 0.6),
        5 + 7 * k, 3 + 4 * k, a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "rgba(20,54,18," + (0.30 * k).toFixed(3) + ")";
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  // 理智越低，画面越不对劲：暗角收紧、色调发紫、开始出现噪点
  function drawInsanity(g) {
    const s = g ? g.sanity : CONFIG.SANITY_MAX;
    if (s >= CONFIG.SANITY_LOW) return;
    const k = 1 - s / CONFIG.SANITY_LOW;          // 0 → 1，越低越严重
    // 收紧的暗角
    const r = Math.max(W, H) * (0.75 - 0.28 * k);
    const grd = ctx.createRadialGradient(W / 2, H / 2, r * 0.35, W / 2, H / 2, r);
    grd.addColorStop(0, "rgba(0,0,0,0)");
    grd.addColorStop(1, "rgba(30,0,45," + (0.5 * k).toFixed(3) + ")");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);
    // 噪点（k 越大越密）
    const n = Math.floor(k * 220);
    ctx.fillStyle = "rgba(200,180,255," + (0.16 + 0.2 * k).toFixed(3) + ")";
    for (let i = 0; i < n; i++) {
      const x = Math.random() * W, y = Math.random() * H;
      ctx.fillRect(x, y, 1.5, 1.5);
    }
  }

  // ---------- 悲尸循环的花屏 ----------
  // 全部素材一次性预渲染（噪点瓦片 / 扫描线），每帧只做合成，
  // 不再逐点 fillRect —— 否则花屏一开帧率会掉到十几帧。
  let glScratch = null, glScratchCtx = null;
  let glTiles = [], glTilePatterns = [], glScan = null;

  function ensureGlitchAssets() {
    if (!glScratch) {
      glScratch = document.createElement("canvas");
      glScratchCtx = glScratch.getContext("2d");
    }
    if (glScratch.width !== W || glScratch.height !== H) {
      glScratch.width = W; glScratch.height = H;
      glTilePatterns = [];       // pattern 绑定在 ctx 上，尺寸变了要重建
      glScan = null;
    }
    // 4 张噪点瓦片（只做一次）
    if (!glTiles.length) {
      const TS = 128;
      for (let n = 0; n < 4; n++) {
        const c = document.createElement("canvas");
        c.width = c.height = TS;
        const cc = c.getContext("2d");
        const img = cc.createImageData(TS, TS);
        const d = img.data;
        for (let i = 0; i < TS * TS; i++) {
          const v = Math.random();
          const bright = v > 0.5;
          d[i * 4] = bright ? 255 : 0;
          d[i * 4 + 1] = bright ? 255 : 0;
          d[i * 4 + 2] = bright ? 255 : 0;
          d[i * 4 + 3] = Math.floor(40 + Math.random() * 215);
        }
        cc.putImageData(img, 0, 0);
        glTiles.push(c);
      }
    }
    if (!glTilePatterns.length) {
      glTilePatterns = glTiles.map((t) => ctx.createPattern(t, "repeat"));
    }
    // 扫描线（只做一次）
    if (!glScan) {
      const c = document.createElement("canvas");
      c.width = 1; c.height = 4;
      const cc = c.getContext("2d");
      cc.fillStyle = "rgba(0,0,0,1)";
      cc.fillRect(0, 0, 1, 1);
      glScan = ctx.createPattern(c, "repeat");
    }
  }

  function drawGlitch(g) {
    const k = wretchK(g);
    if (k <= 0.001) return;
    ensureGlitchAssets();
    const full = !!(g.wretch && g.wretch.done);
    const inten = full ? 1 : k;

    // 横向撕裂：先把整帧拷到离屏，再从离屏按条带错位贴回来
    // （直接在主画布上 drawImage 自己会强制快照，慢一个量级）
    glScratchCtx.clearRect(0, 0, W, H);
    glScratchCtx.drawImage(canvas, 0, 0);
    const bands = Math.round(3 + 11 * inten);
    for (let i = 0; i < bands; i++) {
      const sy = Math.random() * H;
      const sh = Math.min(4 + Math.random() * (10 + 34 * inten), H - sy);
      if (sh <= 1) continue;
      const dx = (Math.random() * 2 - 1) * (6 + 80 * inten);
      ctx.drawImage(glScratch, 0, sy, W, sh, dx, sy, W, sh);
    }
    // 色差：错位的红 / 青
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = "rgba(255,0,40," + (0.05 + 0.16 * inten).toFixed(3) + ")";
    ctx.fillRect(-6 * inten, 0, W, H);
    ctx.fillStyle = "rgba(0,220,255," + (0.04 + 0.13 * inten).toFixed(3) + ")";
    ctx.fillRect(6 * inten, 0, W, H);
    ctx.globalCompositeOperation = "source-over";
    // 噪点：预渲染瓦片按 pattern 平铺，每帧换一张并随机偏移
    const tile = glTilePatterns[(Math.floor(g.time * 24) % glTilePatterns.length + glTilePatterns.length) % glTilePatterns.length];
    if (tile) {
      ctx.save();
      ctx.globalAlpha = 0.14 + 0.5 * inten;
      ctx.translate(-Math.floor(Math.random() * 128), -Math.floor(Math.random() * 128));
      ctx.fillStyle = tile;
      ctx.fillRect(0, 0, W + 128, H + 128);
      ctx.restore();
    }
    // 扫描线
    if (glScan) {
      ctx.save();
      ctx.globalAlpha = 0.12 + 0.3 * inten;
      ctx.translate(0, Math.floor(g.time * 60) % 4);
      ctx.fillStyle = glScan;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
    // 彻底变成悲尸：整屏压一层血色，几乎看不清场景
    if (full) {
      ctx.fillStyle = "rgba(120,0,0,0.34)";
      ctx.fillRect(0, 0, W, H);
    }
    // 雪花声跟着循环推进越来越响
    AudioSys.setStatic(inten);
  }

  // 两个 #rrggbb 之间插值（悲尸化时把玩家染红）
  function mixColor(a, b, k) {
    k = clamp(k, 0, 1);
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const r = Math.round(((pa >> 16) & 255) * (1 - k) + ((pb >> 16) & 255) * k);
    const gg = Math.round(((pa >> 8) & 255) * (1 - k) + ((pb >> 8) & 255) * k);
    const bl = Math.round((pa & 255) * (1 - k) + (pb & 255) * k);
    return "rgb(" + r + "," + gg + "," + bl + ")";
  }

  function drawDangerVignette() {
    const inten = Math.max(visualThreat(), dangerIntensity());
    if (inten <= 0) return;
    const r = Math.max(100, Math.min(W, H) * 0.42);
    const k = Math.min(1, inten);
    const grd = ctx.createRadialGradient(W / 2, H / 2, r * 0.55, W / 2, H / 2, r);
    grd.addColorStop(0, "rgba(180,0,0,0)");
    grd.addColorStop(1, "rgba(180,0,0," + (0.5 * k).toFixed(3) + ")");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);
  }

  function drawVignette() {
    const r = Math.max(W, H) * 0.75;
    const grd = ctx.createRadialGradient(W / 2, H / 2, r * 0.45, W / 2, H / 2, r);
    grd.addColorStop(0, "rgba(0,0,0,0)");
    grd.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);
  }

  // ---------- 键位（可在设置里改，存在本机）----------
  const DEFAULT_KEYS = {
    up:     ["KeyW", "ArrowUp"],
    down:   ["KeyS", "ArrowDown"],
    left:   ["KeyA", "ArrowLeft"],
    right:  ["KeyD", "ArrowRight"],
    sprint: ["ShiftLeft", "ShiftRight"],
    read:   ["KeyE"],
    door:   ["KeyR"],
    flash:  ["KeyF"],
    mute:   ["KeyM"],
    manual: ["KeyH"],
    bag:    ["Tab"],
    pause:  ["Escape"],
    offhand: ["Digit4", "Numpad4"],   // 副手槽：默认 4（使用副手上的东西）
    record:  ["KeyL"],                // L 只在副手拿着摄像机时才是「录像」
    keywarp: ["KeyG"],                // 层级密钥放进快捷栏后，对着任意门按 G
  };
  const KEY_ACTS = [
    ["up", "向上"], ["down", "向下"], ["left", "向左"], ["right", "向右"],
    ["sprint", "冲刺"], ["read", "阅读 / 交互"], ["door", "开门 / R"],
    ["flash", "手电筒"], ["mute", "静音"], ["manual", "档案手册"],
    ["bag", "背包"], ["offhand", "副手（4）"], ["record", "录像（副手是摄像机时）"],
    ["keywarp", "层级密钥 · 对门按 G"], ["pause", "暂停"],
  ];
  const KM_STORE = "br_keymap_v1";
  let KEYMAP = null;
  try { KEYMAP = JSON.parse(localStorage.getItem(KM_STORE) || "null"); } catch (e) { KEYMAP = null; }
  if (!KEYMAP || typeof KEYMAP !== "object") KEYMAP = JSON.parse(JSON.stringify(DEFAULT_KEYS));
  // 兼容旧键位存档：以前副手默认绑在 L 上。现在副手默认改成 4，L 只留给摄像机录像。
  // 老存档里 offhand 若仍是旧的 ["KeyL"]，纠正回新默认值，否则 4 按不动、L 又会被当成通用副手键。
  let kmMigrated = false;
  if (Array.isArray(KEYMAP.offhand) && KEYMAP.offhand.length === 1 && KEYMAP.offhand[0] === "KeyL") { delete KEYMAP.offhand; kmMigrated = true; }
  if (!Object.prototype.hasOwnProperty.call(KEYMAP, "record")) { KEYMAP.record = ["KeyL"]; kmMigrated = true; }
  function kmCodes(a) {
    const v = KEYMAP[a];
    if (Array.isArray(v) && v.length) return v;
    return DEFAULT_KEYS[a] || [];
  }
  // 某个动作是否被按下（可能绑了多个键，比如 W 与 ↑）
  function kHeld(a, K) {
    const src = K || (typeof keys === "object" && keys ? keys : null);
    if (!src) return false;
    const cs = kmCodes(a);
    for (let i = 0; i < cs.length; i++) if (src[cs[i]]) return true;
    return false;
  }
  function kIs(a, code) { return kmCodes(a).indexOf(code) >= 0; }
  function kmSave() { try { localStorage.setItem(KM_STORE, JSON.stringify(KEYMAP)); } catch (e) { /* 忽略 */ } }
  if (kmMigrated) kmSave();   // 老键位一次纠正到位，不必每次进游戏都重算
  // 键位变了，游戏键列表也要跟着变（决定哪些键会被拦截、会切回桌面模式）
  function gameKeyList() {
    const set = new Set(["Digit1", "Digit2", "Digit3", "Numpad1", "Numpad2", "Numpad3", "Space"]);
    for (const a in DEFAULT_KEYS) for (const c of kmCodes(a)) set.add(c);
    return [...set];
  }
  let GAME_KEYS = gameKeyList();
  window.__keyNice = (code) => {
    if (!code) return "—";
    const m = { ArrowUp: "↑", ArrowDown: "↓", ArrowLeft: "←", ArrowRight: "→", Space: "空格",
      ShiftLeft: "左Shift", ShiftRight: "右Shift", Escape: "Esc", Tab: "Tab",
      ControlLeft: "左Ctrl", ControlRight: "右Ctrl", Enter: "回车" };
    if (m[code]) return m[code];
    if (/^Key[A-Z]$/.test(code)) return code.slice(3);
    if (/^Digit[0-9]$/.test(code)) return code.slice(5);
    return code;
  };
  window.addEventListener("keydown", (e) => {
    // 聊天框正在输入：键盘全归它，人物不许动（也别让残留按键把人走飞）
    if (window.__chatFocus && e.code !== "Escape") {
      // 锁定期间：游戏按键吃掉（人不许动，也不许触发 E/R/F）。
      // 但字母/数字/空格这些要放行 —— 以前一律 preventDefault，
      // 连打字都被拦掉了，输入框根本打不进字。
      const isGame = (typeof GAME_KEYS !== "undefined" && GAME_KEYS.indexOf(e.code) >= 0) ||
        GAME_KEYS.indexOf(e.code) >= 0;
      try { for (const k in keys) keys[k] = false; } catch (err) { /* 忽略 */ }
      if (isGame) { e.preventDefault(); return; }
      if (e.code === "Enter" || e.code === "NumpadEnter") return;   // 交给输入框处理
      return;                                                        // 其余：正常打字
    }
    // 终端打开时，在里面的输入框里打字不能触发游戏按键（WASD 会把人走飞）
    // 设置面板里拖滑块 / 点按钮时，别把按键当成游戏操作（WASD 会把人走飞）
    if (window.__settingsOpen && window.__settingsOpen() && document.activeElement &&
        /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(document.activeElement.tagName)) {
      if (e.code === "Escape") { /* 放行：交给下面处理 */ }
      else { keys[e.code] = false; return; }
    }
    if (termOpen && el.terminal && document.activeElement &&
        el.terminal.contains(document.activeElement) &&
        /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) {
      if (e.code === "F7" && e.shiftKey) { /* 放行：交给下面处理 */ }
      else { if (e.code === "Escape") closeTerminal(); return; }
    }
    // 截屏：Shift + F3 —— 只截游戏画面（画布本体），不带 UI / 不带暂停面板
    if (e.code === "F3" && e.shiftKey) {
      e.preventDefault();
      try { shotScreenshot(); } catch (err) { /* 忽略 */ }
      return;
    }
    // 管理员终端：Shift + F7 开关
    if (e.code === "F7" && e.shiftKey) {
      e.preventDefault();
      if (termOpen) closeTerminal(); else openTerminal();
      return;
    }
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space", "Tab"].includes(e.code)) e.preventDefault();
    // 一旦使用键盘操作，立即切回桌面模式（隐藏摇杆、提示改回按键说法）
    if (GAME_KEYS.includes(e.code)) setTouchMode(false);
    keys[e.code] = true;
    if (e.code === "Digit1" || e.code === "Numpad1") { useHotbar(0); return; }
    if (e.code === "Digit2" || e.code === "Numpad2") { useHotbar(1); return; }
    if (e.code === "Digit3" || e.code === "Numpad3") { useHotbar(2); return; }
    // L 是录像键，只有副手拿着摄像机时才起作用；副手本身的默认键是 4
    if (kIs("record", e.code)) { recordFromOffhand(); return; }
    if (kIs("offhand", e.code)) { useOffhand(); return; }
    if (kIs("mute", e.code)) toggleMute();
    if (kIs("flash", e.code)) toggleFlashlight();
    // 层级密钥：放进快捷栏，对着任意一扇门按 G 切层
    if (kIs("keywarp", e.code)) { if (window.LEVEL_KEY) window.LEVEL_KEY.warp(game); return; }
    if (kIs("manual", e.code)) { if (game) openManual(); }        // 档案手册
    if (kIs("bag", e.code)) {                                  // 背包
      if (game && game.phase === "bag") closeBag();
      else openBag();
    }
    if (kIs("read", e.code)) {
      if (game && game.aiOn) return;              // AI 接管时，交互交给算法
      if (game && game.phase === "reading") closeArchive();
      else if (game && game.phase === "manual") closeManual();
      else if (game && game.phase === "playing") readAction();   // E：只阅读档案
    }
    if (kIs("door", e.code)) {
      if (game && game.aiOn) return;              // AI 接管时，开关门交给算法
      if (game && game.phase === "playing") doorAction();        // R：只开关门 / 进出子层级
    }
    if (kIs("pause", e.code) || e.code === "Escape") {
      // 攻略面板开着：先关它
      const gd = document.getElementById("guide");
      if (gd && !gd.classList.contains("hidden")) { closeGuide(); return; }
      if (game && game.phase === "reading") closeArchive();
      else if (game && game.phase === "manual") closeManual();
      else if (game && game.phase === "bag") closeBag();
      else if (game && game.phase === "bntg") closeBntgShop();
      else if (game && game.phase === "pc4") closePc4();
      else if (game && game.phase === "pc601") closePc601();
      else if (game && game.phase === "hermes") closeHermes();
      else if (game && game.phase === "simsel") closeSimSelect();
      else if (game && game.phase === "coffee") closeCoffeeCart();
      else if (game && game.phase === "outfit") closeOutfit();
      // 设置面板开着：Esc 先关它，别一按就继续游戏
      else if (window.__settingsOpen && window.__settingsOpen()) window.__closeSettings();
      else togglePause();
    }
  });
  window.addEventListener("keyup", (e) => { keys[e.code] = false; });
  // 右键会弹出系统菜单，菜单打开期间收不到 keyup：禁掉游戏里的菜单，并清空按键
  window.addEventListener("contextmenu", (e) => {
    const t = e.target;
    // 输入框里保留系统菜单（复制 / 粘贴要用）
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
    e.preventDefault();
    clearKeys();
  });
  // 兜底：万一菜单还是弹出来了（某些浏览器 / 扩展），按下的瞬间就把方向清掉
  window.addEventListener("mousedown", (e) => { if (e.button === 2) clearKeys(); });
  // 切到别的窗口 / 标签页时同样会丢 keyup
  document.addEventListener("visibilitychange", () => { if (document.hidden) clearKeys(); });
  // 真实手指触摸（非鼠标/触控笔）-> 切到触屏模式
  window.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "touch") setTouchMode(true);
  }, { passive: true });
  window.addEventListener("blur", () => {
    clearKeys();
    if (game && game.phase === "playing") togglePause();
  });

  // 把所有按键状态清掉。
  // 场景：按住 W 走路时点一下鼠标右键 —— 浏览器弹出系统菜单，菜单打开期间
  // keyup 事件根本送不到页面，于是"松开 W"这件事页面永远不知道，
  // 角色就一直朝那个方向走，停不下来。
  function clearKeys() {
    for (const k in keys) keys[k] = false;
    sprintHeld = false;
    if (el.btnSprint) el.btnSprint.classList.remove("on");
    if (typeof resetStick === "function") resetStick();
    if (game && game.stick) { game.stick.active = false; game.stick.mag = 0; }
  }

  function togglePause() {
    if (!game) return;
    if (game.phase === "playing") {
      game.phase = "paused";
      hide(el.manual);
      hide(el.pickupHint);
      hide(el.doorHint);
      if (el.btnE) el.btnE.classList.remove("ready");
      if (el.btnAct) { el.btnAct.classList.remove("ready"); hide(el.btnAct); }
      hide(el.btnDoor);
      resetStick();
      sprintHeld = false;
      if (el.btnSprint) el.btnSprint.classList.remove("on");
      show(el.pause);
    } else if (game.phase === "paused") {
      game.phase = "playing";
      hide(el.pause);
      cancelMenuConfirm();
    }
  }

  // ===========================================================
  // 攻略：把作者做的通关路线网站直接嵌进游戏窗口里看（站内层级按钮都能点）。
  // 断网 / 站点拒绝嵌套时只给一句提示，不拿旧快照冒充官站内容。
  // ===========================================================
  const GUIDE_URL = "https://www.tutorial.thebackrooms2d.de5.net";
  const GUIDE_TXT = "www.tutorial.thebackrooms2d.de5.net";
  const WIKI_URL = "https://brcn.backroomswiki.cn/";
  const WIKI_TXT = "brcn.backroomswiki.cn";
  let guideSite = "guide";                 // guide = 攻略站，wiki = wikidot 中文维基
  let guideLoaded = false, guideTimer = null;
  function siteUrl() { return guideSite === "wiki" ? WIKI_URL : GUIDE_URL; }
  function siteTxt() { return guideSite === "wiki" ? WIKI_TXT : GUIDE_TXT; }

  // 站点正文一律由官站自己提供：这里不复制、不缓存、也不摆"看起来一样"的本地清单。
  // 之前塞过一份 22 个层级名的快照，那是几个月前的旧版本，层级早对不上号了。

  function guideFrame() { return document.getElementById("guide-frame"); }

  // 站点按哪个宽度排版（缩放后填满窗口，但视口宽度始终是这个值）
  const GUIDE_WIDTHS = [900, 1200, 1600];
  let guideW = 1200;
  try {
    const w0 = parseInt(localStorage.getItem("br_guideW") || "", 10);
    if (GUIDE_WIDTHS.indexOf(w0) >= 0) guideW = w0;
  } catch (e) { /* 读不到就用默认 */ }

  // 把 iframe 按 guideW 渲染后整体缩放，填满 guide-box
  function fitGuide() {
    const box = document.getElementById("guide-box");
    const f = guideFrame();
    if (!box || !f) return;
    const bw = box.clientWidth, bh = box.clientHeight;
    if (!bw || !bh) return;
    let dw = guideW, k = bw / dw;
    // 手机横屏（本作是横屏游戏）不缩放：直接让站点按窗口宽度排，字才够大
    if (k < 0.85) { dw = Math.max(320, Math.round(bw)); k = 1; }
    f.style.width = dw + "px";
    f.style.height = Math.max(200, Math.round(bh / k)) + "px";
    f.style.transform = "scale(" + k.toFixed(4) + ")";
  }

  function loadGuide() {
    const stage = document.getElementById("guide-stage");
    const fb = document.getElementById("guide-fallback");
    if (!stage) return;
    if (guideTimer) { clearTimeout(guideTimer); guideTimer = null; }
    guideLoaded = false;
    // 先让官站自己加载出来；失败时只给一句诚实提示，不冒充站点内容
    if (fb) fb.classList.add("hidden");
    stage.innerHTML = "";

    const srcLabel = document.getElementById("guide-src");
    if (srcLabel) srcLabel.textContent = siteTxt();
    const f = document.createElement("iframe");
    f.id = "guide-frame";
    f.src = siteUrl();
    f.setAttribute("scrolling", "yes");
    f.setAttribute("allow", "fullscreen");
    f.addEventListener("load", () => {
      // 只要 load 就认为页面出来了，撤掉超时；站内链接和层级按钮由站点自己接管
      guideLoaded = true;
      if (guideTimer) { clearTimeout(guideTimer); guideTimer = null; }
      f.style.visibility = "visible";
      fitGuide();
    });
    f.addEventListener("error", () => { if (!guideLoaded) showGuideFallback(); });
    stage.appendChild(f);
    fitGuide();
    // 迟迟没 load（断网 / 被拒绝嵌套）才显示提示，避免窗口一片空白
    guideTimer = setTimeout(() => { if (!guideLoaded) showGuideFallback(); }, 8000);
  }

  function showGuideFallback() {
    const fb = document.getElementById("guide-fallback");
    const f = guideFrame();
    if (f) f.style.visibility = "hidden";
    if (fb) fb.classList.remove("hidden");
  }

  function openGuide() {
    const g = document.getElementById("guide");
    if (!g) return;
    g.classList.remove("hidden");
    loadGuide();
    // 面板刚显示时尺寸才算得出来，稍等一帧再缩放一次
    requestAnimationFrame(() => fitGuide());
    setTimeout(fitGuide, 120);
  }
  function closeGuide() {
    const g = document.getElementById("guide");
    if (!g) return;
    g.classList.add("hidden");
    if (guideTimer) { clearTimeout(guideTimer); guideTimer = null; }
  }

  function initGuide() {
    const wb = document.getElementById("guide-width");
    const syncW = () => { if (wb) wb.textContent = "页面宽度：" + guideW; };
    syncW();
    if (wb) wb.addEventListener("click", () => {
      guideW = GUIDE_WIDTHS[(GUIDE_WIDTHS.indexOf(guideW) + 1) % GUIDE_WIDTHS.length];
      try { localStorage.setItem("br_guideW", String(guideW)); } catch (e) { /* 忽略 */ }
      syncW();
      fitGuide();
    });
    window.addEventListener("resize", () => fitGuide());
    const b = document.getElementById("menu-guide-btn");
    if (b) b.addEventListener("click", () => openGuide());
    const c = document.getElementById("guide-close");
    if (c) c.addEventListener("click", () => closeGuide());
    const r = document.getElementById("guide-retry");
    if (r) r.addEventListener("click", () => loadGuide());
    // 不再有「用浏览器打开」：官站就在这个窗口里，站内按钮直接点
    const cp = document.getElementById("guide-copy");
    if (cp) cp.addEventListener("click", () => {
      const done = () => { const t = "复制网址"; cp.textContent = "已复制"; setTimeout(() => { cp.textContent = t; }, 1200); };
      const txt = siteTxt();
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(txt).then(done, () => { legacyCopy(txt); done(); });
        } else { legacyCopy(txt); done(); }
      } catch (e) { legacyCopy(txt); done(); }
    });
    // 一个按钮在「攻略站」和「wikidot 中文官网」之间切换，站点内容始终由 iframe 现取
    const wk = document.getElementById("guide-wiki");
    if (wk) wk.addEventListener("click", () => {
      guideSite = guideSite === "wiki" ? "guide" : "wiki";
      wk.textContent = guideSite === "wiki" ? "切回攻略站" : "切换：中文维基";
      loadGuide();
      requestAnimationFrame(() => fitGuide());
    });
    // 点面板外面关掉
    const g = document.getElementById("guide");
    if (g) g.addEventListener("click", (e) => { if (e.target === g) closeGuide(); });

    /* 适龄提示按钮：高度跟账号按钮一样，宽度是它的一半 —— 用实测尺寸同步，
       不同字号/缩放的设备都不会跑偏 */
    const syncSlts = () => {
      const acc = document.getElementById("menu-account-btn");
      const sl = document.querySelector("#menu .slts-inline");
      if (!acc || !sl) return;
      const r = acc.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        sl.style.width = Math.round(r.width / 2) + "px";
        sl.style.height = Math.round(r.height) + "px";
      }
    };
    // 尺寸写死在 CSS 里：不做轮询、不随窗口反复重算，
    // 以前每次打开菜单都被重新量一次，按钮会越变越大。
    syncSlts();
    // 玩家没放 slts.png 时，按钮里至少还有「适龄」两个字，不会是个空框
    const _sltsImg = document.querySelector("#menu .slts-inline img");
    if (_sltsImg) _sltsImg.addEventListener("error", () => {
      _sltsImg.style.display = "none";
      const t = document.querySelector("#menu .slts-inline .slts-txt");
      if (t) { t.style.display = "block"; t.textContent = "适龄"; t.style.fontSize = "10px"; t.style.letterSpacing = "0"; }
    });

    /* ================= 1.3.4 · 毛玻璃能力检测 ================= */
    try {
      const _g = !!(window.CSS && window.CSS.supports &&
        (CSS.supports("backdrop-filter", "blur(2px)") || CSS.supports("-webkit-backdrop-filter", "blur(2px)")));
      document.documentElement.classList.add(_g ? "glass-ok" : "no-glass");
    } catch (e) { document.documentElement.classList.add("no-glass"); }

    /* ================= 更新日志（1.3.4 全新界面）================= */
    const VERLOG_URL = "version/version.log";
    let verlogEl = null;
    function parseVerlog(txt) {
      const out = [];
      String(txt || "").split(/\r?\n/).forEach((raw) => {
        const line = raw.trim();
        if (!line) return;
        const parts = line.match(/\[[^\]]*\]/g);
        if (!parts || parts.length < 2) { out.push({ ver: line, items: [] }); return; }
        const items = [];
        for (let i = 1; i < parts.length; i++) {
          const it = parts[i].replace(/\[|\]/g, "").trim();
          if (it) items.push(it);
        }
        out.push({ ver: parts[0].replace(/\[|\]/g, "").trim(), items });
      });
      return out;
    }
    function verlogEsc(x) {
      return String(x).replace(/[&<>"']/g, (c) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
    }
    function renderVerlog(txt) {
      const body = verlogEl.querySelector("#verlog-body");
      if (!body) return;
      const list = parseVerlog(txt);
      const cur = list[0] || { ver: "—", items: [] };
      const now =
        '<section id="verlog-current" class="verlog-sec verlog-now">' +
          '<div class="verlog-ver">' + verlogEsc(cur.ver) + '</div>' +
          '<div class="verlog-tag">当前版本 · CURRENT</div>' +
          '<div class="verlog-items">' +
            (cur.items.length
              ? cur.items.map((it) => '<div class="verlog-item">' + verlogEsc(it) + '</div>').join("")
              : '<div class="verlog-item">（暂无条目）</div>') +
          '</div>' +
        '</section>';
      const hist =
        '<section id="verlog-history" class="verlog-sec verlog-old">' +
          '<button id="verlog-top" class="verlog-jump" type="button">↑ 查看最新更新</button>' +
          '<div class="verlog-hist-head">历史版本</div>' +
          list.slice(1).map((v) =>
            '<div class="verlog-hist-block">' +
              '<div class="verlog-hist-ver">' + verlogEsc(v.ver) + '</div>' +
              '<div class="verlog-hist-items">' +
                (v.items.length
                  ? v.items.map((it) => '<div class="verlog-hist-item">' + verlogEsc(it) + '</div>').join("")
                  : '<div class="verlog-hist-item">（暂无条目）</div>') +
              '</div>' +
            '</div>').join("") +
        '</section>';
      body.innerHTML = now + hist;
      // 历史区顶部那颗「查看最新更新」滚回最上面
      const topBtn = body.querySelector("#verlog-top");
      if (topBtn) topBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        body.scrollTo({ top: 0, behavior: "smooth" });
        const hb = verlogEl.querySelector("#verlog-hist");
        if (hb) hb.style.display = "";
      });
    }
    function buildVerlog() {
      if (verlogEl) return verlogEl;
      verlogEl = document.createElement("div");
      verlogEl.id = "verlog";
      verlogEl.className = "overlay hidden";
      // 上方不放置退出按钮；只在下方留「查看历史版本」和「关闭」
      verlogEl.innerHTML =
        '<div class="panel verlog-box">' +
          '<div id="verlog-body" class="verlog-scroll"></div>' +
          '<div class="verlog-foot">' +
            '<button id="verlog-hist" type="button">查看历史版本</button>' +
            '<button id="verlog-close" class="ghost" type="button">关闭</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(verlogEl);
      verlogEl.addEventListener("click", (e) => { if (e.target === verlogEl) hide(verlogEl); });
      const sc = verlogEl.querySelector("#verlog-body");
      const histBtn = verlogEl.querySelector("#verlog-hist");
      let seenBottom = false;
      // 只有真的下去过、再自己滚回顶才把按钮放出来；平滑滚动的第一帧 scrollTop 还是 0，
      // 直接判断会立刻把刚藏起来的按钮又放出来。
      sc.addEventListener("scroll", () => {
        if (sc.scrollTop > 100) seenBottom = true;
        if (seenBottom && sc.scrollTop < 40) { seenBottom = false; histBtn.style.display = ""; }
      }, { passive: true });
      histBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const h = verlogEl.querySelector("#verlog-history");
        if (h) sc.scrollTo({ top: h.offsetTop, behavior: "smooth" });
        histBtn.style.display = "none";
      });
      verlogEl.querySelector("#verlog-close").addEventListener("click", () => hide(verlogEl));
      return verlogEl;
    }
    async function openVerlog() {
      const el2 = buildVerlog();
      show(el2);
      const body = el2.querySelector("#verlog-body");
      body.scrollTop = 0;                 // 每次打开都从「当前版本」这一屏开始
      el2.querySelector("#verlog-hist").style.display = "";
      body.innerHTML = '<div class="verlog-empty">正在读取 …</div>';
      let txt = "";
      try {
        const r = await fetch(VERLOG_URL, { cache: "no-store" });
        if (!r.ok) throw new Error("HTTP " + r.status);
        txt = await r.text();
      } catch (e) {
        body.innerHTML = '<div class="verlog-empty">没能读到更新日志（' + VERLOG_URL +
          '）—— 直接在浏览器里打开这个文件也能看。</div>';
        return;
      }
      renderVerlog(txt);
    }
    const vb2 = document.getElementById("menu-verlog-btn");
    if (vb2) vb2.addEventListener("click", (e) => { e.stopPropagation(); openVerlog(); });
    // 页脚那个 #verlog-btn 写在 main.js 的 script 标签之后，用事件委托才点得到
    document.addEventListener("click", (e) => {
      const t = e.target;
      if (!t) return;
      if (t.id === "verlog-btn" || (t.closest && t.closest("#verlog-btn"))) openVerlog();
    });
  }
  function legacyCopy(t) {
    try {
      const ta = document.createElement("textarea");
      ta.value = t; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      document.execCommand("copy"); ta.remove();
    } catch (e) { /* 忽略 */ }
  }
  window.openGuide = openGuide;
  window.closeGuide = closeGuide;

  // ---------- 回到主菜单 ----------
  // 收掉所有 HUD 与面板，把这一局彻底结束掉，回到开始菜单。
  // 档案收集、服装、结局都写在 localStorage 里，不会因为回菜单而丢失。
  function backToMenu() {
    saveCloudSlot();          // 退出前记下所在的层级与位置
    syncEgg2();
    // 从 Level ! 直接退回主菜单：警报必须停 —— 它只属于那一层
    AudioSys.bangAlarm(false);
    // 联机：房主退出这一局只是回房间界面（房间还在，要解散得他自己去点）；
    // 客人退出才是真的离开房间。
    try {
      if (window.Net && Net.room && Net.room.isHost) {
        if (window.LobbyHostLeft) window.LobbyHostLeft();
      } else if (window.Net && Net.room) {
        Net.leaveRoom();              // 客人自己退：只是离开，不影响别人
      }
      if (window.LobbyHideBar) window.LobbyHideBar();
      window.LobbyMPRemote = null;
    } catch (e) { /* 忽略 */ }
    AudioSys.stopStatic();
    AudioSys.startMenuMusic(true);  // 回到主菜单：从头放，不是接着上次的进度
    applyMenuBg();
    // 关掉所有可能开着的面板
    [el.archive, el.manual, el.bag, el.outfit, el.help, el.pause, el.dead,
     el.wretch, el.ending, el.levelup, el.flashToast, el.pickupHint, el.doorHint,
     el.btnDoor, el.wretchTimer, el.scare].forEach((n) => { if (n) hide(n); });
    // 右下角的结局提示留着 —— 回到主菜单正好点它去看说明
    if (el.btnE) el.btnE.classList.remove("ready");
      if (el.btnAct) { el.btnAct.classList.remove("ready"); hide(el.btnAct); }
    // 收掉游戏 HUD（含手机摇杆）
    [el.hud, el.staminaBar, el.vitals, el.touchUI].forEach((n) => { if (n) hide(n); });
    resetStick();
    sprintHeld = false;
    if (el.btnSprint) el.btnSprint.classList.remove("on");
    if (el.vitals) el.vitals.classList.remove("wretch-on");
    game = null;
    menuConfirm = false;
    if (el.menuBtn2) el.menuBtn2.textContent = "返回主菜单";
    show(el.menu);
  }

  window.backToMenu = backToMenu;   // 联机模块要能把人踢回主菜单
  window.requestBackToMenu = requestBackToMenu;

  // 中途回菜单会丢掉这一局，所以要点两次确认
  let menuConfirm = false;
  function requestBackToMenu() {
    if (!menuConfirm) {
      menuConfirm = true;
      if (el.menuBtn2) el.menuBtn2.textContent = "再点一次 · 确认放弃本局";
      return;
    }
    backToMenu();
  }
  function cancelMenuConfirm() {
    menuConfirm = false;
    if (el.menuBtn2) el.menuBtn2.textContent = "返回主菜单";
  }

  function toggleMute() {
    const m = AudioSys.toggleMute();
    el.muteBtn.textContent = m ? "已静音" : "静音";
  }

  let flashToastTimer = null;

  function toggleFlashlight() {
    if (!game) return;
    // Level 6：被带入层级的光源也会丧失功能
    if (isLevel(game, 6)) {
      game.flashlight = false;
      toast("手电筒在这里毫无作用 —— 被带进来的光都会失灵");
      if (el.btnFl) el.btnFl.classList.remove("on");
      return;
    }
    game.flashlight = !game.flashlight;
    hide(el.flashToast);
    clearTimeout(flashToastTimer);
    updateHud();
  }

  function showFlashToast() {
    show(el.flashToast);
    clearTimeout(flashToastTimer);
    flashToastTimer = setTimeout(() => hide(el.flashToast), 8000);
  }

  // ---------- 移动端触控：浮动虚拟摇杆 + 动作按钮 ----------
  function resetStick() {
    stick.active = false;
    stick.id = null;
    stick.mag = 0; stick.dx = 0; stick.dy = 0;
    if (el.stickBase) {
      el.stickBase.classList.remove("active", "sprint");
      el.stickKnob.style.transform = "translate(0px,0px)";
    }
  }

  // 切换键盘 / 触屏模式（两套提示文案与触控层同步切换）
  function setTouchMode(on) {
    if (touchMode === on) return;
    touchMode = on;
    document.body.classList.toggle("is-touch", on);
    if (on) {
      if (!(game && game.aiOn)) show(el.touchUI);   // AI 接管时不显示摇杆
      el.pickupHint.innerHTML = '点击右下 <b>交互</b> 按钮';
      el.flashToast.innerHTML = '点击右下 <b>手电</b> 按钮照亮前路';
    } else {
      hide(el.touchUI);
      resetStick();
      sprintHeld = false;
      hide(el.btnDoor);
      if (el.btnSprint) el.btnSprint.classList.remove("on");
      if (el.pickupHint) el.pickupHint.innerHTML = HINT_READ_KB;
      if (el.flashToast) el.flashToast.innerHTML = HINT_KB.flash || '按 <b>F</b> 打开手电筒';
    }
  }

  function setupTouch() {
    // 备份键盘版提示文案（切回桌面模式时还原）
    // 备份的是"标准文案"，不是当时那一句（当时可能正停在"捡起杏仁水"上）
    HINT_KB.read = HINT_READ_KB;
    HINT_KB.flash = el.flashToast ? el.flashToast.innerHTML : '按 <b>F</b> 打开手电筒';
    document.body.classList.toggle("is-touch", touchMode);
    if (touchMode) {
      el.pickupHint.innerHTML = '点击右下 <b>交互</b> 按钮';
      el.flashToast.innerHTML = '点击右下 <b>手电</b> 按钮照亮前路';
    }

    const zone = el.stickZone;
    const applyStick = (cx, cy) => {
      const dx = cx - stick.ox, dy = cy - stick.oy;
      const len = Math.hypot(dx, dy);
      if (len < 0.001) { stick.mag = 0; return; }
      stick.dx = dx / len;                       // 方向（单位向量）
      stick.dy = dy / len;
      stick.mag = Math.min(1, len / STICK_R);    // 推量 0~1
      const k = len > STICK_R ? STICK_R / len : 1;
      el.stickKnob.style.transform = "translate(" + (dx * k).toFixed(1) + "px," + (dy * k).toFixed(1) + "px)";
    };

    zone.addEventListener("pointerdown", (e) => {
      if (stick.active) return;
      e.preventDefault();
      stick.active = true;
      stick.id = e.pointerId;
      stick.ox = e.clientX; stick.oy = e.clientY;
      stick.mag = 0; stick.dx = 0; stick.dy = 0;
      el.stickBase.style.left = e.clientX + "px";
      el.stickBase.style.top = e.clientY + "px";
      el.stickBase.classList.add("active");
      el.stickKnob.style.transform = "translate(0px,0px)";
      try { zone.setPointerCapture(e.pointerId); } catch (err) { /* 忽略 */ }
    });
    window.addEventListener("pointermove", (e) => {
      if (!stick.active || e.pointerId !== stick.id) return;
      e.preventDefault();
      applyStick(e.clientX, e.clientY);
    }, { passive: false });
    window.addEventListener("pointerup", (e) => {
      if (stick.active && e.pointerId === stick.id) resetStick();
    });
    window.addEventListener("pointercancel", (e) => {
      if (stick.active && e.pointerId === stick.id) resetStick();
    });

    // 动作按钮：按下即触发（比 click 更跟手）
    const tap = (node, fn) => {
      if (!node) return;
      node.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        fn();
      });
    };
    tap(el.btnE, () => {
      if (game && game.phase === "reading") closeArchive();
      else if (game && game.phase === "manual") closeManual();
      else if (game && game.phase === "playing") readAction();   // 阅读：只读档案
    });
    tap(el.btnPick, () => {
      if (game && game.phase === "playing") pickAction();   // 拾取：只管地上的东西与箱子
    });
    tap(el.btnDoor, () => {
      if (game && game.phase === "playing") doorAction();        // 开门：只管门
    });
    // 上浮：按住生效（和空格一样）—— 松手就停下
    if (el.btnUp) {
      const on = (e) => { e.preventDefault(); e.stopPropagation(); if (game) game.wantUpBtn = true; };
      const off = () => { if (game) game.wantUpBtn = false; };
      el.btnUp.addEventListener("pointerdown", on);
      el.btnUp.addEventListener("pointerup", off);
      el.btnUp.addEventListener("pointercancel", off);
      el.btnUp.addEventListener("pointerleave", off);
    }
    tap(el.btnAct, () => {
      if (game && game.phase === "playing") readAction();        // 交互：E 键里"不是阅读"的那部分
    });
    tap(el.btnBag, () => {
      if (game && game.phase === "bag") closeBag(); else openBag();
    });
    tap(el.btnFl, () => toggleFlashlight());

    // 冲刺按钮：按住生效
    if (el.btnSprint) {
      const on = (e) => { e.preventDefault(); e.stopPropagation(); sprintHeld = true; el.btnSprint.classList.add("on"); };
      const off = (e) => { sprintHeld = false; if (el.btnSprint) el.btnSprint.classList.remove("on"); };
      el.btnSprint.addEventListener("pointerdown", on);
      el.btnSprint.addEventListener("pointerup", off);
      el.btnSprint.addEventListener("pointercancel", off);
      el.btnSprint.addEventListener("pointerleave", off);
    }
  }

  // ================= 管理员终端（Shift + F7 / 触屏长按档案手册 5 秒） =================
  // 图形化终端：上方输入开发者口令，授权后下方按钮解锁。
  // 带 "…" 的按钮会进入子界面，列出层级名 / 物品名 / 实体名，点一下就执行。
  const DEV_PASS = "510256";
  let devOK = false;           // 是否拿到开发者权限（本次会话有效）
  let termOpen = false;
  let termPrevPhase = null;    // 打开终端前游戏处于什么阶段（关闭时还原）
  let orientHeldByTerm = false; // 终端打开期间把「请横屏游玩」藏起来了，退出时要还回去
  const termHistory = [];
  let termHistIdx = 0;

  // 实体编号 -> 内部种类（monst8 = 悲尸，会真的以实体形态出现并追你）
  const MONST_CODES = {
    monst1: { kind: "bacterium", label: "黑色鞭毛体" },
    monst2: { kind: "lurker", label: "潜伏者" },
    monst3: { kind: "hound", label: "猎犬" },
    monst4: { kind: "faceling", label: "无面灵" },
    monst5: { kind: "smiler", label: "笑魇" },
    monst6: { kind: "moth", label: "死亡飞蛾" },
    monst7: { kind: "limb", label: "肢团" },
    monst8: { kind: "wretch", label: "悲尸" },
    monst9: { kind: "pipeworm", label: "管道蠕虫" },
    monst10: { kind: "crusher", label: "碾压者" },
    monst11: { kind: "neighborhood", label: "邻里守望" },
    monst12: { kind: "jerry", label: "杰瑞" },
    monst13: { kind: "transporter", label: "传送者" },
    monst14: { kind: "kite", label: "警告风筝" },
    monst15: { kind: "worn", label: "磨损者" },
    monst16: { kind: "deathmoth", label: "死亡飞蛾（群）" },
    monst17: { kind: "skinstealer", label: "窃皮者" },
    monst18: { kind: "watcher", label: "观察者" },
    monst19: { kind: "woodling", label: "木灵" },
    monst20: { kind: "cryer", label: "啼物" },
    monst21: { kind: "samantha", label: "萨曼莎" },
    monst22: { kind: "nguithr", label: "Nguithr'xurh" },
    monst23: { kind: "herdsnake", label: "牧蛇" },
    monst24: { kind: "spider", label: "蛛形纲" },
    monst25: { kind: "xiaoxiao", label: "小小" },
    monst26: { kind: "partypooper", label: "派对客" },
    monst27: { kind: "mimic21", label: "拟态" },
    monst28: { kind: "corpseRat", label: "尸鼠" },
  };
  // 物品编号 -> 背包键
  const ITEM_CODES = {
    "bag1": "bag1",           // 小挎包（+10）
    "bag2": "bag2",           // 中型背包（+25）
    "bag3": "bag3",           // 大型背包（+50）
    "bag4": "bag4",           // 管理员背包（+75，只有指令能给）
    "item1": "almond",        // 杏仁水
    "item1-2": "bad",         // 受污染的杏仁水
    "item2": "crowbar",       // 撬棍（只能有一根）
    "item3": "key",           // Level 3 电梯钥匙
  };

  // 层级编号 -> 内部层级 id：L1 / L0-2 / S01（隐秘层级·枢纽）
  function parseLevelCode(code) {
    const raw = String(code == null ? "" : code).trim();
    const c = raw.toUpperCase();
    if (c === "S01" || c === "HUB") return "hub";
    if (c === "LFUN" || c === "FUN" || c === "LFUN=)" || c === "LEVELFUN" || c === "L26") return "26";
    // 超过安全整数上限的大编号（9223372036854775807）
    // 都不能走数字解析 —— parseInt 会把它变成 9223372036854775808，
    // 再拿去查表就查不到，终端会回一句"尚未实装"。
    if (/^L/i.test(raw)) {
      const body = raw.slice(1);
      // 普通数字编号照旧走数字（"25" 必须是数字 25 —— 传成字符串的话
      // generateMapInner 里 level === 25 就匹配不上，会掉进 Level 2 的管道地图）
      if (/^[0-9]+$/.test(body) && String(parseInt(body, 10)) === body) return parseInt(body, 10);
      if (/^[0-9]+-[0-9]+$/.test(body)) {
        const p2 = body.split("-");
        if (String(parseInt(p2[0], 10)) === p2[0]) return parseFloat(p2[0] + "." + p2[1]);
      }
      if (LEVELS[body]) return body;                                   // Ltheend -> theend
      // Lnewera / Lredrooms —— 附属区域也认
      if (typeof LEVEL0_ROOMS !== "undefined" && LEVEL0_ROOMS[body]) return body;
      if (typeof LEVEL11_ROOMS !== "undefined" && LEVEL11_ROOMS[body]) return body;
      // 编号里本身带小数点的（9223372036854775807.-1 -> L9223372036854775807--1），
      // 只能把最后一个 "-" 还原成 "."，全替换会变成 "..1" 从而查不到。
      for (const ld of [body.indexOf("-"), body.lastIndexOf("-")]) {
        if (ld > 0) {
          const cand = body.slice(0, ld) + "." + body.slice(ld + 1);
          if (LEVELS[cand]) return cand;
        }
      }
      const dotted = body.replace(/-/g, ".");
      if (LEVELS[dotted]) return dotted;                               // L9223372036854775807-99
      if (/^[0-9]+$/.test(body)) return body;                          // 大编号：保持字符串
      if (/^[0-9]+-[0-9]+$/.test(body)) return body.replace("-", ".");
    }
    if (LEVELS[raw]) return raw;
    // 附属区域（红室 / 深坑区 / 新时代广场）不在 LEVELS 里，
    // 直接写名字也能传送 —— 不然终端永远回一句"尚未实装"。
    if (typeof LEVEL0_ROOMS !== "undefined" && LEVEL0_ROOMS[raw]) return raw;
    if (typeof LEVEL11_ROOMS !== "undefined" && LEVEL11_ROOMS[raw]) return raw;
    const m = /^L([0-9]+(?:-[0-9]+)?)$/.exec(c);
    if (!m) return null;
    const body = m[1];
    if (body.indexOf("-") >= 0) {
      const p = body.split("-");
      return parseFloat(p[0] + "." + p[1]);      // L0-2 -> 0.2
    }
    return parseInt(body, 10);
  }
  function levelCodeName(lv) {
    const d = LEVELS[String(lv)];
    return d ? d.name : ("Level " + lv);
  }
  // 内部层级 id -> 终端编号：0.2 -> L0-2；hub -> S01
  function levelCodeOf(lv) {
    if (lv === "hub") return "S01";
    const st = String(lv);
    return st.indexOf(".") >= 0 ? "L" + st.replace(".", "-") : "L" + st;
  }
  // 子界面要列的层级：数字升序，枢纽放最后
  // 超过 JS 安全整数上限的编号（9223372036854775807）不能转成数字 ——
  // parseFloat 会把它变成 9223372036854776000，两个大编号层还会撞成同一个数。
  // 这里判断"转回字符串还一不一样"，不一样就整条按字符串处理。
  function levelSortKey(k) {
    // 601 以前被写死成字符串排在最后（夹在 1000 和战地医院之间），
    // 结果在一百来条的传送名单里要滑到最底下才找得到 —— 现在按数字排，落在 599 和 666 之间。
    if (k === "hub") return k;
    const n = parseFloat(k);
    if (!isFinite(n)) return k;
    if (String(n) !== String(k)) return k;      // 精度会失真的编号：保持字符串
    return n;
  }
  function levelList() {
    const out = [];
    for (const k of Object.keys(LEVELS)) out.push(levelSortKey(k));
    out.sort((a, b) => {
      if (a === b) return 0;
      if (a === "hub" || b === "hub") return a === "hub" ? 1 : -1;
      const na = typeof a === "number" ? a : null;
      const nb = typeof b === "number" ? b : null;
      if (na == null && nb == null) return String(a) < String(b) ? -1 : 1;
      if (na == null) return 1;                 // 大编号 / 文字编号排最后
      if (nb == null) return -1;
      return na - nb;
    });
    return out.map((lv) => ({ lv, code: levelCodeOf(lv), name: levelCodeName(lv) }));
  }

  function termLog(text, cls) {
    if (!el.termLog) return;
    const d = document.createElement("div");
    d.className = "term-line" + (cls ? " " + cls : "");
    d.textContent = text;
    el.termLog.appendChild(d);
    el.termLog.scrollTop = el.termLog.scrollHeight;
  }
  function termState() {
    if (!el.termState) return;
    el.termState.textContent = devOK ? "已授权 · DEV" : "未授权";
    el.termState.classList.toggle("on", devOK);
  }
  function needDev() {
    if (devOK) return false;
    termLog("权限不足 —— 请先在上方输入开发者口令并授权。", "err");
    return true;
  }
  // 挂在函数体外：以前写在 termRun 第一行，只有自己被调用过一次才挂得上，
  // 从没开过终端的客人收到房主的 devcmd 时它就还是 undefined。
  try { window.__termRun = termRun; } catch (e) { /* 忽略 */ }

  function needGame() {
    if (game) return false;
    termLog("没有正在进行的游戏 —— 先开始一局再执行这条指令。", "err");
    return true;
  }

  function openTerminal() {
    if (termOpen) return;
    termOpen = true;
    // 打字的时候别让游戏继续跑
    if (game && game.phase === "playing") { termPrevPhase = "playing"; game.phase = "paused"; }
    else termPrevPhase = null;
    resetStick();
    sprintHeld = false;
    if (el.btnSprint) el.btnSprint.classList.remove("on");
    if (el.termLog && !el.termLog.dataset.init) {
      el.termLog.dataset.init = "1";
      termLog("BACKROOMS · 管理员终端 v1.0", "head");
      termLog("内部调试接口。这里的改动不会写入存档，也不影响结局判定。", "dim");
      termLog("在上方输入开发者口令 —— 授权后下方按钮解锁。", "warn");
    }
    termState();
    show(el.terminal);
    // 竖屏时「请横屏游玩」那层黑幕(z-index 200)会整块盖在终端上，
    // 关闭按钮点不到 —— 终端开着的时候先把它收起来，退出时再还回去。
    if (typeof checkOrient === "function") {
      const ob = document.getElementById("orient");
      if (ob) { ob.classList.add("hidden"); orientHeldByTerm = true; }
    }
    const foot = el.terminal.querySelector(".term-foot span");
    if (foot) {
      foot.textContent = touchMode
        ? "长按「档案手册」按钮 5 秒可再次打开"
        : "Shift + F7 关闭";
    }
    termApplyAuth();
    setTimeout(() => {
      const f = devOK ? null : document.getElementById("term-pass");
      if (f) f.focus();
    }, 30);
  }

  function closeTerminal() {
    if (!termOpen) return;
    termOpen = false;
    hide(el.terminal);
    const pw = document.getElementById("term-pass");
    if (pw) { pw.blur(); pw.value = ""; }
    const sb = document.getElementById("term-sub");
    if (sb) hide(sb);
    // 关掉终端时命令行也要收起来，下次打开回到图形按钮
    const cl = document.getElementById("term-cli");
    if (cl) hide(cl);
    if (game && termPrevPhase === "playing" && game.phase === "paused") game.phase = "playing";
    termPrevPhase = null;
    // 还回竖屏提示（终端打开期间我们把它藏起来了）
    if (orientHeldByTerm) { orientHeldByTerm = false; try { checkOrient(); } catch (e) { /* 忽略 */ } }
  }

  // 在玩家附近（3~9 格）刷指定种类的实体，方便调试
  function adminSpawn(kind, n) {
    const g = game;
    let ok = 0;
    for (let i = 0; i < n; i++) {
      if (isLevel(g, 7)) {                    // 深海：沿用该层的水域限制
        const f = (t) => {
          const td = (t.y - g.map.ocean.top) * CONFIG.DEPTH_PER_TILE;
          return kind === "thing7" ? td > 3500 : td < 4000;
        };
        if (spawnEntityAt(g, kind, f)) ok++;
        continue;
      }
      const list = floorList(g.map, g.floor);
      let done = false;
      for (let k = 0; k < 300 && !done; k++) {
        const t = list[randInt(0, list.length - 1)];
        if (!t) break;
        if (isClosedDoor(g.map, t.x, t.y, g.floor)) continue;
        const d = Math.hypot((t.x + 0.5) * TILE - g.player.x, (t.y + 0.5) * TILE - g.player.y);
        if (d < 3 * TILE || d > 9 * TILE) continue;
        g.entities.push(new Entity(g.map, t.x, t.y, g.level, kind, g.floor));
        done = true; ok++;
      }
      if (!done && spawnEntityAt(g, kind, null)) ok++;   // 附近太挤就退回到常规刷新
    }
    if (ok && AudioSys) AudioSys.roar(1);
    return ok;
  }

  const TERM_HELP = [
    ["Teleport player#me to L1", "传送到指定层级（L0 / L0-2 / L1…L8 / S01 枢纽）"],
    ["Invincible player#me", "切换无敌模式（不掉血、实体抓不住你）"],
    ["setting HP to 80", "设定血量（1~100）"],
    ["setting San to 80", "设定理智（1~100）"],
    ["give player#me to bag2", "发放背包（bag1 +10 / bag2 +25 / bag3 +50 / bag4 +75）"],
    ["setting bag to 60", "设定背包容量（setting bag to infinite = 无限）"],
    ["give player#me to item1 3", "发放物品（数量可省略，默认 1）"],
    ["generate monst1 2", "在附近生成实体（数量可省略，默认 1）"],
    ["kill all#monst", "清除所有实体"],
    ["kill monst3 L3 2", "清除指定实体（可选层级、可选数量）"],
    ["status", "查看当前状态"],
    ["display all map", "显示玩家所在地图全貌（可切楼层 / 导出 PNG）"],
    ["clear", "清屏"],
  ];

  function termHelp() {
    termLog("可用操作：", "head");
    for (const [c, d] of TERM_HELP) termLog("  " + c.padEnd(26, " ") + d, "dim");
    termLog("物品编号：item1 杏仁水 · item1-2 受污染的杏仁水 · item2 撬棍 · item3 Level3 钥匙 · itemL1 层级密钥", "dim");
    termLog("           bag1 小挎包(+10) · bag2 中型背包(+25) · bag3 大型背包(+50) · bag4 管理员背包(+75)", "dim");
    termLog("实体编号：monst1 黑色鞭毛体 · monst2 潜伏者 · monst3 猎犬 · monst4 无面灵", "dim");
    termLog("          monst5 笑魇 · monst6 死亡飞蛾 · monst7 肢团 · monst8 悲尸", "dim");
  }

  function termStatus() {
    if (!game) { termLog("没有正在进行的游戏。", "warn"); return; }
    const g = game;
    termLog("层级：" + levelCodeName(g.level) + "（" + g.level + "）", "ok");
    termLog("生命：" + Math.ceil(g.hp) + " / " + CONFIG.HP_MAX +
      " · 理智：" + Math.ceil(g.sanity) + " / " + CONFIG.SANITY_MAX, "ok");
    termLog("无敌模式：" + (g.invincible ? "开" : "关"), g.invincible ? "ok" : "dim");
    termLog("背包：" + bagText() + (g.bagCapInfinite ? "（无限）" : ""), "dim");
    const bag = Object.keys(g.inv).filter((k) => g.inv[k] > 0)
      .map((k) => (ITEMS[k] ? ITEMS[k].name : k) + "×" + g.inv[k]).join(" · ");
    termLog("背包：" + (bag || "空"), "dim");
    const cnt = {};
    for (const e of g.entities) cnt[e.kind] = (cnt[e.kind] || 0) + 1;
    const list = Object.keys(cnt).map((k) => (e2n(k) + "×" + cnt[k])).join(" · ");
    termLog("实体（" + g.entities.length + "）：" + (list || "无"), "dim");
    function e2n(kind) {
      for (const code in MONST_CODES) if (MONST_CODES[code].kind === kind) return MONST_CODES[code].label;
      const cfg = CONFIG.MONSTERS[kind];
      return cfg ? cfg.name : kind;
    }
  }

  function termRun(raw, force) {
    const forced = !!force;
    const line = String(raw == null ? "" : raw).trim();
    if (!line) return;
    termLog("//> " + line, "cmd");
    const c = line;

    // ---- 获取开发者权限 ----
    let m = /^DL\.go\s*\(\s*p\s*=\s*([^)\s]*)\s*\)$/i.exec(c);
    if (m) {
      if (m[1] === DEV_PASS) {
        devOK = true; termState();
        try { window.__devOK = true; } catch (e) { /* 忽略 */ }
        termLog("开发者权限已获取。全部指令解锁。", "ok");
      } else {
        termLog("口令错误 —— 权限申请被拒绝。", "err");
      }
      return;
    }

    if (/^(help|\?|指令|帮助)$/i.test(c)) { termHelp(); return; }
    // go363：开发者密钥界面里的那个后门 —— 不需要权限，输进去就会被送到 Level 363。
    // 那一层没有出口，唯一的办法就是死亡。
    if (/^go363$/i.test(c)) {
      if (needGame()) return;
      startTransition("输入了 go363", "混凝土地板的冰冷从脚底漫上来 —— 这是你小时候的那间卧室 ...",
        { kind: "toLevelX", level: 363 });
      return;
    }
    if (/^clear$/i.test(c)) { if (el.termLog) el.termLog.innerHTML = ""; return; }
    if (/^(status|状态)$/i.test(c)) { termStatus(); return; }
    // 面板的打开函数挂在 window 上：它定义在一个内部作用域里，这里只能走全局引用
    if (/^display\s+all\s+map$/i.test(c)) {
      if (needDev()) return;
      if (window.__openMapView) { window.__openMapView(); termLog("已打开地图全貌。", "ok"); }
      else termLog("地图全貌还没准备好。", "err");
      return;
    }
    if (/^(exit|quit|close)$/i.test(c)) { closeTerminal(); return; }

    // ---- 以下都需要开发者权限 ----
    // forced：房主用开发者面板发过来的指令。客人自己没有权限，
    // 不跳过这道检查的话，"让某人传送到某层"在对方那边永远不生效。
    if (!forced && needDev()) return;

    // 传送
    m = /^Teleport\s+player#me\s+to\s+(\S+)/i.exec(c);
    if (m) {
      if (needGame()) return;
      const lv = parseLevelCode(m[1]);
      if (lv === null) { termLog("无法识别的层级编号：" + m[1] + "（L1 / L0-2 / S01）", "err"); return; }
      const lvDef = LEVELS[String(lv)]
                 || (typeof LEVEL0_ROOMS !== "undefined" ? LEVEL0_ROOMS[String(lv)] : null)
                 || (typeof LEVEL11_ROOMS !== "undefined" ? LEVEL11_ROOMS[String(lv)] : null);
      if (!lvDef) { termLog("层级 " + m[1] + " 尚未实装。", "err"); return; }
      game.level = lv;
      newLevel();
      const def = levelDef(lv);
      flashLevelToast(def.label, def.name);
      termLog("已传送 —— " + def.name, "ok");
      return;
    }

    // 无敌
    if (/^Invincible\s+player#me/i.test(c)) {
      if (needGame()) return;
      game.invincible = !game.invincible;
      termLog(game.invincible
        ? "无敌模式：开 —— 不再掉血，实体也抓不住你。"
        : "无敌模式：关 —— 你又变回会死的了。", game.invincible ? "ok" : "warn");
      return;
    }

    // 背包：发放挎包 / 背包，或改容量
    m = /^give\s+player#me\s+to\s+(bag[1-4])(?:\s+(\d+))?/i.exec(c);
    if (m) {
      if (needGame()) return;
      const key = String(m[1]).toLowerCase();
      const it = ITEMS[key];
      addItem(key, 1);                  // 背包不占格子，且同类只有一个
      game.inv[key] = 1;
      refreshBagCap(); updateBag(); updateHud();
      termLog("已发放：" + (it ? it.name : key) +
        " —— 背包容量 " + bagText() + "（+" + CONFIG.BAG_BONUS[key] + "）", "ok");
      return;
    }
    m = /^setting\s+bag\s+to\s+(\S+)/i.exec(c);
    if (m) {
      if (needGame()) return;
      const v = String(m[1]).toLowerCase();
      if (v === "infinite" || v === "∞" || v === "无限") {
        game.bagCapInfinite = true;
        refreshBagCap(); updateBag(); updateHud();
        termLog("背包容量已设为无限。", "ok");
        return;
      }
      const num = parseInt(v, 10);
      if (!(num > 0)) { termLog("容量得是一个正整数，或者 infinite。", "err"); return; }
      game.bagCapInfinite = false;
      game.bagCap = num;
      updateBag(); updateHud();
      termLog("背包容量已设定为 " + num + "（当前 " + bagText() + "）。", "ok");
      return;
    }

    // 设定血量 / 理智
    m = /^setting\s+HP\s+to\s+(\d+)/i.exec(c);
    if (m) {
      if (needGame()) return;
      const v = clamp(parseInt(m[1], 10), 1, CONFIG.HP_MAX);
      game.hp = v;
      updateVitalsHud(game); updateHud();
      termLog("血量已设定为 " + v + " / " + CONFIG.HP_MAX + "。", "ok");
      return;
    }
    m = /^setting\s+San\s+to\s+(\d+)/i.exec(c);
    if (m) {
      if (needGame()) return;
      const v = clamp(parseInt(m[1], 10), 1, CONFIG.SANITY_MAX);
      game.sanity = v;
      updateVitalsHud(game); updateHud();
      termLog("理智已设定为 " + v + " / " + CONFIG.SANITY_MAX +
        (v <= CONFIG.WRETCH_TRIGGER ? "（已进入悲尸循环区间）" : "") + "。",
        v <= CONFIG.WRETCH_TRIGGER ? "warn" : "ok");
      return;
    }

    // 发放物品
    m = /^give\s+player#me\s+to\s+(\S+)(?:\s+(\d+))?/i.exec(c);
    if (m) {
      if (needGame()) return;
      const code = String(m[1]).toLowerCase();
      let key = ITEM_CODES[code];
      let keyTarget = null;
      if (!key) {
        const lm = /^iteml([0-9]+(?:-[0-9]+)?|s01)$/.exec(code);
        if (lm) {
          const lv = lm[1] === "s01" ? "hub" : lm[1].replace("-", ".");
          const K = window.LEVEL_KEY;
          if (!K) { termLog("层级密钥模块没加载。", "err"); return; }
          K.restore(game.inv);
          key = K.idFor(lv);
          keyTarget = lv;
        }
      }
      if (!key) { termLog("无法识别的物品编号：" + m[1], "err"); return; }
      let n = m[2] != null ? parseInt(m[2], 10) : 1;
      if (!(n > 0)) n = 1;
      if (key === "crowbar") n = 1;                 // 撬棍只能有一根
      const before = game.inv[key] | 0;
      // 能装多少装多少，别一次给不下就全丢
      let left = n;
      while (left > 0) {
        const b2 = game.inv[key] | 0;
        addItem(key, 1);
        if ((game.inv[key] | 0) === b2) break;      // 装不下了
        left--;
      }
      const after = game.inv[key] | 0;
      const it = ITEMS[key];
      const got = Math.max(0, after - before);
      if (got <= 0) {
        termLog("背包满了（" + bagText() + "）—— 一样都没发下去。", "err");
      } else if (got < n) {
        termLog("背包只装得下 " + got + " 个 —— 已发放：" + (it ? it.name : key) +
          " ×" + got + "（背包 " + bagText() + "）", "warn");
      } else {
        termLog("已发放：" + (it ? it.name : key) + " ×" + got +
          "（当前持有 " + after + "）", "ok");
      }
      return;
    }

    // 生成实体
    m = /^generate\s+(\S+)(?:\s+(\d+))?/i.exec(c);
    if (m) {
      if (needGame()) return;
      const mc = MONST_CODES[String(m[1]).toLowerCase()];
      if (!mc) { termLog("无法识别的实体编号：" + m[1] + "（monst1 ~ monst28）", "err"); return; }
      let n = m[2] != null ? parseInt(m[2], 10) : 1;
      if (!(n > 0)) n = 1;
      n = Math.min(n, 30);
      const ok = adminSpawn(mc.kind, n);
      updateHud();                    // 游戏此时是暂停的，HUD 得手动刷一次
      termLog(ok ? "已生成 " + mc.label + " ×" + ok + "（场上共 " + game.entities.length + " 只）"
        : "生成失败 —— 附近没有合适的位置。", ok ? "ok" : "err");
      return;
    }

    // 清除实体
    if (/^kill\s+all#monst/i.test(c)) {
      if (needGame()) return;
      const n = game.entities.length;
      game.entities.length = 0;
      updateHud();
      termLog("已清除全部实体（共 " + n + " 只）。", "ok");
      return;
    }
    m = /^kill\s+(\S+)(.*)$/i.exec(c);
    if (m) {
      if (needGame()) return;
      const mc = MONST_CODES[String(m[1]).toLowerCase()];
      if (!mc) { termLog("无法识别的实体编号：" + m[1] + "（monst1 ~ monst28）", "err"); return; }
      let level = null, count = null;
      const rest = String(m[2] || "").trim().split(/\s+/).filter(Boolean);
      for (const a of rest) {
        if (/^\d+$/.test(a)) { count = parseInt(a, 10); continue; }
        const lv = parseLevelCode(a);
        if (lv === null) { termLog("无法识别的参数：" + a, "err"); return; }
        level = lv;
      }
      const keep = [];
      let removed = 0;
      for (const e of game.entities) {
        const hit = e.kind === mc.kind && (level === null || String(e.level) === String(level));
        if (hit && (count == null || removed < count)) { removed++; continue; }
        keep.push(e);
      }
      game.entities = keep;
      updateHud();
      termLog("已清除 " + mc.label + " " + removed + " 只" +
        (level !== null ? "（层级 " + levelCodeName(level) + "）" : "") + "。",
        removed ? "ok" : "warn");
      return;
    }

    termLog("无法识别的指令：" + c + " —— 输入 help 查看全部指令。", "err");
  }

  // ---------- 图形化界面 ----------
  // 授权状态 -> 按钮区解锁 / 口令框隐藏
  function termApplyAuth() {
    const main = document.getElementById("term-main");
    const auth = document.getElementById("term-auth");
    const inv = document.getElementById("term-inv");
    const cli = document.getElementById("term-cli");
    if (main) main.classList.toggle("hidden", !devOK);
    if (auth) auth.classList.toggle("hidden", devOK);
    // 退出此页面（重新输口令）时命令行也要收起来
    if (cli && !devOK) hide(cli);
    if (inv) inv.textContent = (game && game.invincible) ? "开" : "关";
    termState();
  }

  // 子界面：把层级名 / 物品名 / 实体名列成按钮，点一下就执行
  // opt.search = true 时顶上多一个筛选框 —— 层级名单快一百条，
  // 没有它就得一路滑到底才能找到 Level 601 这类编号靠后的层级。
  let termSubItems = [];
  let termSubOpt = null;
  function termSubRender(kw) {
    const list = document.getElementById("term-sub-list");
    if (!list) return;
    const k = String(kw == null ? "" : kw).trim().toLowerCase();
    list.innerHTML = "";
    let shown = 0;
    for (const it of termSubItems) {
      const hay = String(it.label == null ? "" : it.label) + " " + String(it.kw == null ? "" : it.kw);
      if (k && hay.toLowerCase().indexOf(k) < 0) continue;
      shown++;
      const b = document.createElement("button");
      b.type = "button";
      b.className = "term-sub-item";
      b.textContent = it.label;
      b.addEventListener("click", () => {
        const qi = document.getElementById("term-qty");
        const q = termSubOpt && termSubOpt.qty ? clamp(parseInt(qi && qi.value, 10) || 1, 1, 30) : 1;
        it.run(q);
      });
      list.appendChild(b);
    }
    if (!shown) {
      const d = document.createElement("div");
      d.className = "term-sub-empty";
      d.textContent = k ? ("没有匹配「" + kw + "」的条目") : "（空）";
      list.appendChild(d);
    }
  }
  function termSubShow(title, items, opt) {
    opt = opt || {};
    termSubItems = items || [];
    termSubOpt = opt;
    const main = document.getElementById("term-main");
    const sub = document.getElementById("term-sub");
    const list = document.getElementById("term-sub-list");
    const st = document.getElementById("term-sub-title");
    const qw = document.getElementById("term-qty-wrap");
    const fl = document.getElementById("term-sub-filter");
    if (!sub || !list) return;
    if (main) hide(main);
    show(sub);
    if (st) st.textContent = title;
    if (qw) qw.classList.toggle("hidden", !opt.qty);
    if (fl) {
      fl.classList.toggle("hidden", !opt.search);
      fl.value = "";
      if (opt.search) setTimeout(() => { try { fl.focus(); } catch (e) { /* 忽略 */ } }, 30);
    }
    termSubRender("");
  }
  function termSubBack() {
    const sub = document.getElementById("term-sub");
    const main = document.getElementById("term-main");
    if (sub) hide(sub);
    if (main) show(main);
  }

  // ================= 命令行子界面（图形按钮区里那个「终端 · 命令行」） =================
  // 最早的终端只有一条输入框，所有指令都靠手敲。后来换成图形按钮，那条输入框被删了，
  // 但 el.termInput 还留在引用表里（等于永远是 null）—— 于是"敲指令传送"这条路断了。
  // 这里把它补回来：一个独立的命令行子界面，敲 exit 回到图形按钮。
  function termCliOpen() {
    const cli = document.getElementById("term-cli");
    const main = document.getElementById("term-main");
    const sub = document.getElementById("term-sub");
    if (sub) hide(sub);
    if (main) hide(main);
    if (cli) show(cli);
    const inp = document.getElementById("term-cli-input");
    if (inp) { inp.value = ""; setTimeout(() => { try { inp.focus(); } catch (e) { /* 忽略 */ } }, 30); }
    if (el.termLog && !el.termLog.dataset.clitip) {
      el.termLog.dataset.clitip = "1";
      termLog("命令行模式 —— 直接敲指令，回车执行。输入 exit 回到图形界面。", "dim");
      termLog("不知道敲什么就输 help。", "dim");
    }
  }
  function termCliBack() {
    const cli = document.getElementById("term-cli");
    const main = document.getElementById("term-main");
    if (cli) hide(cli);
    if (main) show(main);
    termApplyAuth();
  }
  function termCliRun() {
    const inp = document.getElementById("term-cli-input");
    const v = (inp && inp.value ? inp.value : "").trim();
    if (!v) return;
    if (inp) inp.value = "";
    // 这里的 exit 是"退出命令行回到图形界面"，不是关掉整个终端
    // （termRun 里那个 exit 是关掉整个终端，所以必须在交给它之前拦下来）
    if (/^(exit|quit|back)$/i.test(v)) { termCliBack(); return; }
    termRun(v);
    const i2 = document.getElementById("term-cli-input");
    if (i2) { try { i2.focus(); } catch (e) { /* 忽略 */ } }
  }

  // ================= 层级连通性验证（密钥 levelverify） =================
  // 这把钥匙不隐藏：页面上明文写着。进去之后可以逐个层级体检：
  // 出口在不在、通不通、能不能走到、有没有被画成桌子、该有的区域齐不齐。
  const VERIFY_KEY = "levelverify";
  // 必死层级 —— 没有出口本来就是设定，不参与"必须有出口"的检查
  const VERIFY_DEADLY = new Set(["666", "anse", "30", "363", "shattered"]);
  // 会被当成出口的物件类型
  const VERIFY_EXIT_TYPES = new Set([
    "arcade", "arcade25", "exist11", "door37", "neonfog11", "blackdoor287",
    "guarddoor25", "graydoor484", "irondoor04", "exitbang", "deadpool10", "bluedoor",
    "reddoorEx", "enddoorEx", "pool4", "vent03", "fieldpath", "poolladder",
    // Level 20 波瑞阿斯建筑
    "l20staff", "l20gatex", "l20window", "l20game",
    "stair4", "grate3", "atticHole", "whitelight", "existDoor", "stairs37", "redtunnel",
    "e696glitch",
    // Level 45 深渊公司：帝国大厦的正门（回枢纽）
    "p45frontdoor",
  ]);
  // 「to」写的是内部楼层号、不是层级编号的物件 —— 不能当成层级出口来校验目标，
  // 否则会把 Level 696 楼里「通 16 层」的楼梯报成「通向 Level 16 —— 层级不存在」。
  const VERIFY_INTERNAL_TO = new Set(["e696stair", "e696elev", "e696hole"]);
  // 会被当成出口的地图字段
  const VERIFY_EXIT_FIELDS = ["stairs37", "redtunnel", "arcade25", "whitelight", "existDoor",
    "exitDoor", "darkDoor", "junctionHole", "window301", "parrotDoor", "counter",
    "fogExit", "confess", "exit", "transit", "stair4", "grate3", "atticHole"];
  // ---------- 交互出口登记表 ----------
  // 有一大类出口的"通向哪一层"只写在交互代码里（goToLevel 的第二个参数、
  // startTransition 的 level），地图数据上根本没有 toLevel / to 这类字段 ——
  // 光扫地图会把它们整片漏掉，报成"没有任何出口"。这里按层级手工登记。
  // to 写 "*" 表示目标在运行时随机（Kitty、蓝色通道、没记录过的航班），
  // 只确认"有出口"，不校验具体目标。
  const VERIFY_INTERACT_EXITS = {
    // Level 20：员工专用门 / 出口门带 toLevel（扫得到）；窗户和游戏门的去处只写在交互里。
    // 输掉游戏的"传送"是惩罚（6 / 7 / 790），同样只写在交互代码里。
    "20": [
      { what: "员工专用门", to: 2 },
      { what: "切入窗户", to: "*" },
      { what: "霓虹区带 EXIT 标志的出口门", to: "*" },
      { what: "输掉打爆小行星", to: 6 },
      { what: "输掉躲避激光", to: "*" },
    ],
    "486": [{ what: "工厂烟囱散发的烟雾", to: 790 }],
    // 1.7.0：Level 29 海波利亚 / Level 284 需汝之地
    // 29 唯一的出口是出海航行 1500 海里 —— 目标只写在交互 / 航行逻辑里，扫地图扫不到。
    "29": [{ what: "乘船出海航行 1500 海里", to: 284 }],
    // 284 的草床带 toLevel（扫得到），一并登记只为报告里写得清楚。
    "284": [{ what: "用草搭制的床", to: 11 }],
    // 1.6.0：67 / 31 / 40 / 94
    // 67 的店门带 toLevel（扫得到）；员工专用门通向随机层级；讨厌的面点只在交互里。
    "67": [
      { what: "员工专用门（后台）", to: "*" },
      { what: "吃下最不喜欢 / 讨厌的面点", to: 31 },
    ],
    // 31 的两扇出口都带 toLevel（扫得到），一并登记只为报告里写得清楚。
    "31": [
      { what: "游戏厅里标着 40 的游戏机", to: 40 },
      { what: "后台那扇刻着 70 的白门", to: 70 },
    ],
    // 40 的旋转门去处由"穿什么衣服"现场决定，地图数据上看不到目标。
    "40": [
      { what: "生锈的金属门", to: 1 },
      { what: "旋转门（按服装决定去处）", to: "*" },
    ],
    // 94 唯一的出路是王的考验 —— 通过了才放光送走。
    "94": [{ what: "通过王的考验", to: "*" }],
    // Level 78 空间站：真的那间救生舱带 toLevel（扫得到）；
    // 星体异常多的舷窗通向 599，目标只写在交互代码里。
    "78": [
      { what: "舷窗里显示着街道的那间救生舱", to: 11 },
      { what: "星体异常多的舷窗", to: 599 },
    ],
    // Level 696：楼内的楼梯 / 电梯 / 洞的 to 是这栋楼自己的楼层号（内部通道，不校验）。
    // 真正离开这栋楼的只有 30 楼那件紫黑相间的故障物品（exit30）。
    "696": [{ what: "30 楼的故障物品（exit30）", to: 30 }],
    // 1.8.0：Level 28 终末美德
    // 两处出口的去处都只写在交互代码里：城堡里那盏台灯（4 / 5 其一，现场二选一）、
    // 深渊池（有概率被送去 10.1，概率在运行时掷）。地图数据上看不到目标，只能登记。
    "28": [
      { what: "城堡里那盏台灯（奔跑着撞进去）", to: "*" },
      { what: "坠进一口深渊池", to: "10.1" },
    ],
    // 5.2 的出口就是它自己的入口那扇门 —— 平时 toLevel 是 null（从外面锁死），
    // 只有里侧偶尔推开那几秒才变成 5。地图数据上永远看不到目标，只能登记。
    "5.2": [{ what: "入口那扇门（内侧偶尔推开一条缝）", to: 5 }],
    "3.5": [{ what: "撞上静电放电", to: 3 }],
    "4": [{ what: "电梯", to: 5 }],
    "6": [{ what: "锅炉房的楼梯", to: 7 }],
    "7": [{ what: "海底岩洞", to: 8 }],
    "10": [{ what: "小径尽头", to: 11 }],
    "13": [{ what: "墙上的裂缝", to: 21 }, { what: "电梯", to: 70 }],
    "15": [{ what: "光点门", to: "*" }],
    "18": [{ what: "基地北边的洞口 / 转身门", to: 19 }],
    "36.1": [{ what: "走下飞机", to: "*" }],
    "37.1": [{ what: "白色亮光", to: 37 }],
    "171": [{ what: "雕着鹦鹉的木门", to: 301 }],
    "974": [{ what: "把可爱物件给 Kitty", to: "*" }],
    "994": [{ what: "EXIST 门", to: 11 }],
    "999": [{ what: "忏悔（全认 / 不认）", to: 1000 }],
    "601": [{ what: "深色门（四块凹槽）", to: "9223372036854775807" }],
    "9223372036854775807": [
      { what: "中间的空洞", to: "9223372036854775807.-1" },
      { what: "最下面的白光", to: 11 },
    ],
    "bang": [{ what: "EXIT 大门", to: 0 }],
    "exclam": [{ what: "红色的门", to: "bang" }],
    "bluechannel": [{ what: "悬在虚空里的门", to: "*" }],
  };
  // ---------- 设定上就没有出口 ----------
  // 这些层级不是 bug：档案原文就写着没有出口 / 出口是结局。
  // 不算问题，但要在报告里单独列出来说明原因，不能静默通过。
  const VERIFY_NOEXIT_OK = {
    "1.2": "档案：出口「我们尚未发现」—— 进去就出不来（设定如此）",
    "1.5": "档案：除了切出以外，没有已知的离开方法",
    "2.1": "档案：没有任何已知出口，只能靠跃迁浆果",
    "301": "出口是结局「希望之窗」，不是层级",
    "9223372036854775807.-1": "档案：不存在出口",
    // 档案：尚无人尝试离开（这里的人不想走，也就没人走出去过）
    "15.1": "档案：尚无人尝试离开 —— 只能靠迁跃浆果",
    // 生存难度「等级死区」，档案原文：目前未能发现任何 Level 790 的出口。
    // 进去的人都会被某种"意外"杀死，属于设定上的必死层级。
    "790": "生存难度「等级死区」；档案：目前未能发现任何出口",
    // 档案：进入的流浪者通常会在几秒内死亡，未发现出口。
    // 这一层只能从 Level 78 的舷窗"看"，站进去就是结局。
    "599": "生存难度「等级死区」；档案：进入者通常会在几秒内死亡，未发现出口",
    // 痛处不是一整层 —— 是 Level 0 里的一处地点。
    // 档案：你的生命值与理智值就此停住，你会永远留在这里。进去就没有出口，设定如此。
    "pain": "Level 0 里的一处地点（不是独立层级）；档案：数值就此停住，你会永远留在这里 —— 没有出口",
    "363": "生存难度「等级死区」；档案：这里没有出口，唯一的办法就是死亡",
    "shattered": "档案：这里没有任何出口，甚至连任何能够传送的物品都已失效 —— 出口早已被吞噬",
    // 入口只在 Level 903 灯灭时触发（动态事件，验证器扫不到门口），
    // 而档案原文写的是「这里出口，是一个必死层级」。
    "904": "生存难度「等级 Lambda」；档案：这里是一个必死层级，只能从 Level 903 灯灭时进入",
  };
  // 已经建了专属模型的出口类型 —— 不会被通用分支画成默认桌子 / 箱子
  const VERIFY_MODELLED = new Set([
    "arcade", "stairs37", "redtunnel", "pool4", "whitelight", "existDoor", "exist11",
    "door37", "guarddoor25", "junctionHole", "exitDoor", "darkDoor", "stair4", "grate3",
    "atticHole", "irondoor04", "exitbang", "bluedoor", "reddoorEx", "enddoorEx",
    "graydoor484", "blackdoor287", "neonfog11", "arcade25",
    // Level 20 波瑞阿斯建筑：全部都有专属模型，不会被画成默认桌子 / 箱子
    "l20staff", "l20gatex", "l20window", "l20game", "l20sign", "l20locker", "l20vend",
    "l20fount", "l20jelly", "l20neon", "l20sofa", "l20table", "l20chair", "l20recep", "l20bin",
    // Level 78 空间站 / Level 599 群星：全部都有专属模型
    "p78porthole", "p78dense", "p78pod", "p78sep", "p78airlock", "p78panel", "p78light",
    "p78bunk", "p78crate", "p78toilet", "p78sign",
    // Level 45 深渊公司：楼里的塑料雕塑、防火梯、实验围栏，全部都有专属模型
    "p45frontdoor", "p45escape", "p45pen", "p45sign", "p45elev", "p45tank",
    "p45desk", "p45chair", "p45cooler", "p45plant", "p45bed", "p45sofa", "p45table",
    "p45fridge", "p45tv", "p45shelf", "p45mannequin", "p45counter", "p45locker",
    "p45cab", "p45crate", "p45pew", "p45altar", "p45machine", "p45vault", "p45board",
  ]);
  // 各层级"必须出现的区域" —— 少了或太小都不行
  const VERIFY_ZONES = [
    {
      id: "5", name: "Level 5 侧厅", min: 12, get(m) {
        const s = m.sideHall; if (!s || !s.room) return null;
        return { n: s.room.w * s.room.h, at: [s.door.x, s.door.y], unit: "格" };
      },
    },
    {
      id: "1", name: "Level 1 花园段", min: 8, get(m) {
        const n = m.gardenNook; if (!n) return null;
        return { n: (n.cells || []).length, at: [n.entry.x, n.entry.y], unit: "格" };
      },
    },
    {
      id: "11", name: "Level 11 医院", min: 120, get(m) {
        const h = m.hospital; if (!h || !h.size) return null;
        return { n: h.size, at: null, unit: "格" };
      },
    },
    {
      id: "1.3", name: "Level 1.3 排毒区", min: 300, get(m) {
        const d = m.detox13; if (!d || !d.size) return null;
        return { n: d.size, at: null, unit: "格" };
      },
    },
    {
      id: "15.1", name: "Level 15.1 仿真设备", min: 8, get(m) {
        const pods = (m.props || []).filter((p) => p.type === "pod151");
        if (!m.ctrldoor151) return null;
        return { n: pods.length, at: [m.ctrldoor151.x, m.ctrldoor151.y], unit: "台" };
      },
    },
    {
      id: "0.7", name: "Level 0.7 六个年代区域", min: 6, get(m) {
        const L = m.layers; if (!L || !L.length) return null;
        let small = 0;
        for (const g of L) {
          let c = 0;
          for (let y = 0; y < m.size; y++) for (let x = 0; x < m.size; x++) if (g[y][x] === 0) c++;
          if (c < 200) small++;
        }
        return { n: L.length, small, at: null, unit: "个年代" };
      },
    },
    {
      // Level 45：正中那栋必须是帝国大厦（B.R.C. 总部），而且得有正经的体积
      id: "45", name: "Level 45 帝国大厦", min: 240, get(m) {
        const b = m.b45buildings && m.b45buildings[m.b45center];
        if (!b) return null;
        return { n: (b.x1 - b.x0 + 1) * (b.y1 - b.y0 + 1), at: [b.x0, b.y0], unit: "格" };
      },
    },
  ];

  function verifyTargetExists(to) {
    if (to == null) return false;
    const s = String(to);
    if (s === "hub") return true;
    if (LEVELS[s]) return true;
    if (typeof LEVEL0_ROOMS !== "undefined" && LEVEL0_ROOMS[s]) return true;
    if (typeof LEVEL11_ROOMS !== "undefined" && LEVEL11_ROOMS[s]) return true;
    const n = Number(to);
    if (Number.isFinite(n) && LEVELS[String(n)]) return true;
    return false;
  }
  // 从出生点 BFS，返回可达格集合
  function verifyReach(m, grid) {
    const reach = new Set();
    const size = m.size;
    const s = m.start || { x: 1, y: 1 };
    // 关着的「按 E 才能打开」的门在 grid 里是一格墙，但打开之后就是通路。
    // 不算进来的话，Level 78 那种「出生在封闭舱室」的层级会被整片误判成走不到，
    // 明明按一下舱门就能出去。以后再加类似的门，标上 openable 即可。
    const openable = new Set();
    if (m.hatch78) openable.add((m.hatch78.x | 0) + "," + (m.hatch78.y | 0));
    for (const p of (m.props || [])) {
      if (p && (p.type === "p78hatch" || p.openable)) openable.add((p.x | 0) + "," + (p.y | 0));
    }
    if (!grid || !grid[s.y] || grid[s.y][s.x] !== 0) return reach;
    const walkable = (x, y) => grid[y] && (grid[y][x] === 0 || openable.has(x + "," + y));
    const q = [[s.x, s.y]];
    reach.add(s.x + "," + s.y);
    while (q.length) {
      const [cx, cy] = q.pop();
      for (const [nx, ny] of [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]]) {
        if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue;
        const kk = nx + "," + ny;
        if (!walkable(nx, ny) || reach.has(kk)) continue;
        reach.add(kk); q.push([nx, ny]);
      }
    }
    return reach;
  }
  // 收集一个层级里全部"出口"
  // 判据只看一件事：它有没有写明通向哪一层（toLevel / to / goTo / target）。
  // 没写目标的那些是装饰门（Level 13 的套房门、21 的编号门 …），不参与检查。
  function verifyExitTo(o) {
    if (o == null) return null;
    if (o.toLevel != null) return o.toLevel;
    if (o.to != null) return o.to;
    if (o.goTo != null) return o.goTo;
    if (o.target != null) return o.target;
    if (o.dest != null) return o.dest;          // Level 36 登机口
    if (o.destLevel != null) return o.destLevel;
    return null;
  }
  function verifyExits(m) {
    const found = [];
    for (const d of (m.doors || [])) {
      const to = verifyExitTo(d);
      // 门的位置存在 tiles 数组里（多数门是一排格子），不是 x / y
      const pos = (d.tiles && d.tiles.length) ? d.tiles[0] : { x: d.x, y: d.y };
      found.push({ what: "门:" + (d.kind || "?"), x: pos.x, y: pos.y, to, type: d.kind,
        floor: d.floor | 0 });
    }
    for (const pr of (m.props || [])) {
      const to = verifyExitTo(pr);
      if (to == null) continue;                       // 不通向任何地方 = 不是出口
      // Level 696 的楼梯 / 电梯 / 洞：to 是这栋楼的楼层号，不是层级编号
      if (VERIFY_INTERNAL_TO.has(pr.type)) continue;
      found.push({ what: pr.type || "物件", x: pr.x, y: pr.y, to, type: pr.type,
        floor: pr.floor | 0 });
    }
    for (const f of VERIFY_EXIT_FIELDS) {
      const v = m[f];
      if (v == null) continue;
      if (v instanceof Set) { if (v.size) found.push({ what: f + "(区域)", x: null, y: null, to: null, type: f }); }
      else if (Array.isArray(v)) { if (v.length) found.push({ what: f + "[]", x: v[0].x, y: v[0].y, to: verifyExitTo(v[0]), type: f, floor: v[0].floor | 0 }); }
      else if (typeof v === "object") found.push({ what: f, x: v.x, y: v.y, to: verifyExitTo(v), type: f, floor: v.floor | 0 });
    }
    for (const e of (m.exits || [])) {
      const to = verifyExitTo(e);
      if (to == null) continue;
      found.push({ what: "出口:" + (e.kind || "?"), x: e.x, y: e.y, to, type: e.kind, floor: e.floor | 0 });
    }
    if (m.turnBackDoor) found.push({ what: "转身门", x: m.turnBackDoor.x, y: m.turnBackDoor.y,
      to: verifyExitTo(m.turnBackDoor), type: "turnBackDoor", floor: m.turnBackDoor.floor | 0 });
    // 兜底：把地图对象上所有"带坐标又带目标"的字段都扫一遍。
    // 很多出口不是 props / doors，而是挂在 map 上的 gates、cave、exitDoor …，
    // 不扫就会把它们整片漏掉，报成"没有任何出口"。
    const seen = new Set(found.map((f) => f.what + ":" + f.x + "," + f.y + ":" + f.to));
    for (const k of Object.keys(m)) {
      if (k === "props" || k === "doors" || k === "exits" || k === "start") continue;
      if (VERIFY_INTERNAL_TO.has(k)) continue;
      const v = m[k];
      if (v == null || v instanceof Set) continue;
      const arr = Array.isArray(v) ? v : [v];
      for (const o of arr) {
        if (!o || typeof o !== "object") continue;
        if (typeof o.x !== "number" || typeof o.y !== "number") continue;
        if (VERIFY_INTERNAL_TO.has(o.type)) continue;
        const to = verifyExitTo(o);
        if (to == null) continue;
        const key = k + ":" + o.x + "," + o.y + ":" + to;
        if (seen.has(key)) continue;
        seen.add(key);
        found.push({ what: k, x: o.x, y: o.y, to, type: k, floor: o.floor | 0 });
      }
    }
    return found;
  }
  // 单个层级的体检
  function verifyOneLevel(id, name) {
    const bad = [];
    let m;
    try {
      if (typeof setMPSeed === "function") setMPSeed(null);
      m = generateMap(id);
    } catch (e) { return { name, fatal: "地图生成报错：" + (e && e.message) }; }
    if (!m) return { name, fatal: "地图为空" };
    // 多层地图（Level 0.7 六个年代、Level 1.1 四个区域 …）：每一层各自 BFS
    const grids = m.layers ? m.layers : (m.grid ? [m.grid] : []);
    const reachBy = grids.map((gr) => verifyReach(m, gr));
    const reach = reachBy[0] || new Set();
    const reachAt = (e) => reachBy[Math.min(Math.max(e.floor | 0, 0), reachBy.length - 1)] || reach;
    const exits = verifyExits(m);
    const deadly = VERIFY_DEADLY.has(String(id));
    // 0) 样式覆盖 —— 没有专属画法就会掉进 Level 2 的管道兜底。
    //    （老毛病：静默发生，表现就是"整层莫名其妙是管道风 / 一片黑"。）
    //    必须放在最前面：下面"设定上没有出口"的层级会提前 return，放后面就查不到它们。
    try {
      const stl = levelDef(id).style;
      const how = (typeof styleDrawer === "function") ? styleDrawer(stl, m) : "";
      if (!how) bad.push("style「" + stl + "」没有专属画法 —— 整层会被画成 Level 2 的管道风");
    } catch (_) { /* 取不到 style 就跳过 */ }
    // 地图数据里扫不到的出口：补上登记表里的那些（目标只写在交互代码里）
    const reg = VERIFY_INTERACT_EXITS[String(id)] || [];
    for (const r of reg) {
      exits.push({ what: r.what, x: null, y: null, to: r.to, type: null, floor: 0, fromReg: true });
    }
    // wander 型出口（Level 14 天堂：游荡够时间就切层），目标在 to 数组里
    if (m.wander && m.wander.to) {
      for (const t of [].concat(m.wander.to)) {
        exits.push({ what: "游荡（wander）", x: null, y: null, to: t, type: "wander", floor: 0 });
      }
    }
    // 1) 出口存在（没写目标的装饰门不算）
    const real = exits.filter((e) => e.to != null);
    // 每个出口通向哪里 —— 以前只报一个总数，看不出某条出口到底去哪一层
    const exitList = real.map((e) => ({
      what: e.what, to: e.to, x: e.x, y: e.y,
      toName: (e.to === "*") ? "（运行时随机）"
        : (String(e.to) === "hub" ? "枢纽（The Hub）" : levelCodeName(e.to)),
    }));
    if (!real.length && !deadly) {
      const ok = VERIFY_NOEXIT_OK[String(id)];
      // 注意别把 bad 丢掉 —— 上面已经查过样式覆盖了，丢掉的话
      // "设定上没有出口"的层级（15.1、790、1.2…）就永远查不到它们的样式问题。
      if (ok) return { name, exits: 0, ok: 0, bad, noExitOk: ok, exitList };
      bad.push("没有任何出口 / 入口");
    }
    // 2) 目标有效 + 3) 能走到 / 不在墙里 / 有模型
    let okCnt = 0;
    for (const e of exits) {
      if (e.to == null) continue;                     // 装饰门：不通向任何地方，不检查
      if (e.to === "*") { okCnt++; continue; }        // 运行时随机目标：只确认有出口
      if (!verifyTargetExists(e.to)) {
        bad.push("出口「" + e.what + "」通向 " + e.to + " —— 这个层级不存在");
        continue;
      }
      if (e.x == null) { okCnt++; continue; }
      const R = reachAt(e);
      const inReach = R.has(e.x + "," + e.y);
      const nearReach = !inReach && [[1, 0], [-1, 0], [0, 1], [0, -1]]
        .some(([dx, dy]) => R.has((e.x + dx) + "," + (e.y + dy)));
      if (!inReach && !nearReach) {
        bad.push("出口「" + e.what + "」在 (" + e.x + "," + e.y + ") —— 走不到（周围没有能站的地板）");
        continue;
      }
      const eg = grids[Math.min(Math.max(e.floor | 0, 0), grids.length - 1)];
      if (eg && eg[e.y] && eg[e.y][e.x] === 1 && !nearReach) {
        bad.push("出口「" + e.what + "」在 (" + e.x + "," + e.y + ") —— 埋在墙里");
        continue;
      }
      const modelled = VERIFY_MODELLED.has(e.type) || (window.PROP_DRAW && window.PROP_DRAW[e.type]);
      if (!modelled && e.type && VERIFY_EXIT_TYPES.has(e.type)) {
        bad.push("出口「" + e.what + "」没有专属模型 —— 会被画成默认桌子 / 箱子");
        continue;
      }
      okCnt++;
    }
    // 4) 该有的区域
    for (const z of VERIFY_ZONES) {
      if (String(z.id) !== String(id)) continue;
      const v = z.get(m);
      if (!v) { bad.push(z.name + " 缺失（没有生成）"); continue; }
      if (v.n < z.min) bad.push(z.name + " 只有 " + v.n + " " + (v.unit || "格") + "（应当 ≥" + z.min + "）—— 体积不正常");
      if (v.small) bad.push(z.name + " 里有 " + v.small + " 个年代区域的地板不足 200 格");
    }
    return { name, exits: exits.length, ok: okCnt, bad, deadly, exitList };
  }

  // 逐层跑 —— 分帧执行，别把页面卡死
  function runLevelVerify(done) {
    const list = levelList().map((l) => ({ id: parseLevelCode(l.code), name: l.name }))
      .filter((r) => r.id != null && r.id !== "");
    const lines = ["—— 层级连通性验证 ——", "共 " + list.length + " 个区域，逐个生成并检查 …", ""];
    const problems = [];
    let i = 0;
    const out = document.getElementById("verify-out");
    const st = document.getElementById("verify-state");
    const paint = () => { if (out) out.textContent = lines.join("\n"); };
    const step = () => {
      const t0 = Date.now();
      while (i < list.length && Date.now() - t0 < 60) {
        const it = list[i++];
        const r = verifyOneLevel(it.id, it.name);
        if (r.fatal) {
          lines.push("❌ " + r.name + " —— " + r.fatal);
          problems.push(r.name + "：" + r.fatal);
        } else if (r.bad && r.bad.length) {
          lines.push("❌ " + r.name + (r.deadly ? "（必死层级）" : ""));
          for (const b of r.bad) lines.push("     · " + b);
          problems.push(r.name + "：" + r.bad.join("；"));
        } else if (r.noExitOk) {
          lines.push("⚠️ " + r.name + " —— 设定上没有出口：" + r.noExitOk);
        } else {
          lines.push("✅ " + r.name + " —— " + r.exits + " 处出口，" +
            (r.deadly ? "必死层级，不要求出口" : "全部可达且目标有效"));
        }
        // 逐个出口写出来 —— 以前只有一个总数，看不出某条出口到底通向哪一层
        if (r.exitList && r.exitList.length) {
          const show = r.exitList.slice(0, 24);
          for (const e of show) {
            const pos = (e.x == null) ? "" : " (" + e.x + "," + e.y + ")";
            lines.push("     → " + e.what + pos + "  ⇒  " + e.toName + "［" + e.to + "］");
          }
          if (r.exitList.length > show.length) {
            lines.push("     → …… 还有 " + (r.exitList.length - show.length) + " 处");
          }
        }
      }
      paint();
      if (st) st.textContent = i + " / " + list.length;
      if (i < list.length) { setTimeout(step, 0); return; }
      lines.push("");
      if (!problems.length) lines.push("所有层级均正常");
      else {
        lines.push("发现 " + problems.length + " 个层级有问题：");
        for (const p of problems) lines.push("  · " + p);
      }
      paint();
      if (st) st.textContent = problems.length ? ("发现 " + problems.length + " 处问题") : "全部正常";
      if (done) done(problems);
    };
    if (st) st.textContent = "验证中 …";
    step();
  }

  function termVerifyOpen() {
    const auth = document.getElementById("term-auth");
    const main = document.getElementById("term-main");
    const sub = document.getElementById("term-sub");
    const vf = document.getElementById("term-verify");
    if (main) hide(main);
    if (sub) hide(sub);
    if (auth) hide(auth);
    if (vf) show(vf);
  }
  function termVerifyClose() {
    const vf = document.getElementById("term-verify");
    const auth = document.getElementById("term-auth");
    const main = document.getElementById("term-main");
    if (vf) hide(vf);
    if (auth) show(auth);
    if (main) main.classList.toggle("hidden", !devOK);
    const p = document.getElementById("term-pass");
    if (p) { p.value = ""; }
  }

  // 屏幕下方三个快捷键框：手机直接点，电脑按 1 / 2 / 3
  function initHotbar() {
    const bar = document.getElementById("hotbar");
    if (!bar) return;
    for (let i = 0; i < 3; i++) {
      const slot = bar.querySelector('.hot-slot[data-slot="' + i + '"]');
      if (!slot) continue;
      slot.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); useHotbar(i); });
      slot.addEventListener("pointerdown", (e) => e.stopPropagation());
    }
    const off = document.getElementById("offslot");
    if (off) {
      off.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); useOffhand(); });
      off.addEventListener("pointerdown", (e) => e.stopPropagation());
    }
    renderHotbar();
  }

  function initTermUI() {
    const pass = document.getElementById("term-pass");
    const authBtn = document.getElementById("term-auth-btn");
    const subBack = document.getElementById("term-sub-back");
    const invL = document.getElementById("term-inv");

    // 授权
    const tryAuth = () => {
      const v = (pass && pass.value ? pass.value : "").trim();
      if (!v) { termLog("请输入开发者口令。", "err"); return; }
      // go363：开发者密钥界面里那个后门 —— 不需要权限，输进去就会被送到 Level 363。
      // 必须排在"把输入框内容当口令"之前，否则它会被包成 DL.go(p=go363) 当成口令去比对。
      if (/^go363$/i.test(v)) { if (pass) pass.value = ""; termRun("go363"); return; }
      // 连通性验证的钥匙 —— 不走授权流程，直接开验证界面
      if (v.toLowerCase() === VERIFY_KEY) {
        if (pass) pass.value = "";
        termVerifyOpen();
        return;
      }
      termRun(/^DL\.go/i.test(v) ? v : "DL.go(p=" + v + ")");
      if (devOK && pass) pass.value = "";
      termApplyAuth();
    };
    if (authBtn) authBtn.addEventListener("click", tryAuth);
    if (pass) {
      pass.addEventListener("keydown", (e) => {
        e.stopPropagation();
        if (e.key === "Enter") { e.preventDefault(); tryAuth(); }
      });
    }

    // 数字输入框里打字也不能触发游戏按键
    for (const id of ["term-qty", "term-hp", "term-san", "term-bag"]) {
      const n = document.getElementById(id);
      if (n) n.addEventListener("keydown", (e) => e.stopPropagation());
    }
    if (subBack) subBack.addEventListener("click", () => termSubBack());

    // 命令行子界面
    const cliBackBtn = document.getElementById("term-cli-back");
    const cliRunBtn = document.getElementById("term-cli-run");
    const cliInput = document.getElementById("term-cli-input");
    if (cliBackBtn) cliBackBtn.addEventListener("click", () => termCliBack());
    if (cliRunBtn) cliRunBtn.addEventListener("click", () => termCliRun());
    if (cliInput) {
      cliInput.addEventListener("keydown", (e) => {
        e.stopPropagation();                     // 打字不能触发游戏按键
        if (e.key === "Enter") { e.preventDefault(); termCliRun(); }
      });
    }
    // 子界面的筛选框（层级名单用）
    const fl = document.getElementById("term-sub-filter");
    if (fl) {
      fl.addEventListener("input", () => termSubRender(fl.value));
      fl.addEventListener("keydown", (e) => e.stopPropagation());
    }

    // 层级连通性验证（密钥 levelverify）
    const vRun = document.getElementById("verify-run");
    const vBack = document.getElementById("verify-back");
    const vCopy = document.getElementById("verify-copy");
    if (vRun) vRun.addEventListener("click", () => {
      vRun.disabled = true;
      runLevelVerify(() => { vRun.disabled = false; });
    });
    if (vBack) vBack.addEventListener("click", () => termVerifyClose());
    if (vCopy) vCopy.addEventListener("click", () => {
      const out = document.getElementById("verify-out");
      const txt = out ? out.textContent : "";
      const fb = (ok) => { termLog(ok ? "验证结果已复制到剪贴板。" : "复制失败 —— 请手动选中下面的文字。", ok ? "ok" : "err"); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(() => fb(true), () => fb(false));
      } else {
        try {
          const ta = document.createElement("textarea");
          ta.value = txt; document.body.appendChild(ta); ta.select();
          const ok = document.execCommand("copy");
          document.body.removeChild(ta); fb(ok);
        } catch (e) { fb(false); }
      }
    });

    // 主按钮
    const acts = {
      tp: () => {
        // 单人模式没有别的玩家 —— 直接进层级列表，不给"选择玩家"这一层
        const inRoom = !!(window.Net && Net.room);
        const peers = (inRoom && Net.peerList) ? Net.peerList() : [];
        const others = inRoom ? peers.filter((p) => p && p.token !== (Net.self && Net.self.token)) : [];
        if (!others.length) {
          termSubShow("传送到 …",
            levelList().map((l) => ({ label: l.name, kw: l.code, run: () => termRun("Teleport player#me to " + l.code) })),
            { search: true });
          return;
        }
        const rows = [];
        {
          rows.push({ label: "全体玩家 …", run: () => termSubShow("全体传送到 …",
            levelList().map((l) => ({ label: l.name, run: () => termTpAll(l.code) }))) });
          for (const o of others) {
            rows.push({ label: "玩家：" + (o.name || "?") + " …", run: () => termSubShow(
              "把「" + (o.name || "?") + "」传送到 …",
              levelList().map((l) => ({ label: l.name, run: () => termTp(o.token, l.code) }))) });
          }
        }
        rows.push({ label: "自己 …", run: () => termSubShow("传送到 …",
          levelList().map((l) => ({ label: l.name, kw: l.code, run: () => termRun("Teleport player#me to " + l.code) })),
          { search: true }) });
        termSubShow("传送到 …", rows);
      },
      invincible: () => {
        termRun("Invincible player#me");
        if (invL) invL.textContent = (game && game.invincible) ? "开" : "关";
      },
      give: () => {
        const inRoom2 = !!(window.Net && Net.room);
        const peers = (inRoom2 && Net.peerList) ? Net.peerList() : [];
        const others = inRoom2 ? peers.filter((p) => p && p.token !== (Net.self && Net.self.token)) : [];
        const rows = [];
        if (others.length) {
          rows.push({ label: "全体玩家 …", run: () => termSubShow("给全体发放 …", [
            { label: "杏仁水", run: (q) => termGiveAll("item1 " + (q || 1)) },
            { label: "受污染的杏仁水", run: (q) => termGiveAll("item1-2 " + (q || 1)) },
            { label: "撬棍（只能一根）", run: () => termGiveAll("item2 1") },
            { label: "Level 3 电梯钥匙", run: () => termGiveAll("item3 1") },
          ], { qty: true }) });
          for (const o of others) {
            rows.push({ label: "玩家：" + (o.name || "?") + " …", run: () => termSubShow(
              "给「" + (o.name || "?") + "」发放 …", [
                { label: "杏仁水", run: (q) => termGive(o.token, "item1 " + (q || 1)) },
                { label: "受污染的杏仁水", run: (q) => termGive(o.token, "item1-2 " + (q || 1)) },
                { label: "撬棍（只能一根）", run: () => termGive(o.token, "item2 1") },
                { label: "Level 3 电梯钥匙", run: () => termGive(o.token, "item3 1") },
              ], { qty: true }) });
          }
        }
        rows.push({ label: "自己 …", run: () => termSubShow("发放物品 …", [
          { label: "杏仁水", run: (q) => termRun("give player#me to item1 " + q) },
          { label: "受污染的杏仁水", run: (q) => termRun("give player#me to item1-2 " + q) },
          { label: "撬棍（只能一根）", run: () => termRun("give player#me to item2 1") },
          { label: "Level 3 电梯钥匙", run: () => termRun("give player#me to item3 1") },
        ], { qty: true }) });
        termSubShow("发放物品 …", rows);
      },
      bag: () => termSubShow("发放背包 …", [
        { label: "小挎包 bag1（+10）", run: () => termRun("give player#me to bag1") },
        { label: "中型背包 bag2（+25）", run: () => termRun("give player#me to bag2") },
        { label: "大型背包 bag3（+50）", run: () => termRun("give player#me to bag3") },
        { label: "管理员背包 bag4（+75）", run: () => termRun("give player#me to bag4") },
      ]),
      spawn: () => termSubShow("生成实体 …", Object.keys(MONST_CODES).map((code) => ({
        label: MONST_CODES[code].label + "（" + code + "）",
        run: (q) => termRun("generate " + code + " " + q),
      })), { qty: true }),
      kill: () => termSubShow("清除指定实体 …", Object.keys(MONST_CODES).map((code) => ({
        label: MONST_CODES[code].label + "（" + code + "）",
        run: () => termSubShow("清除 " + MONST_CODES[code].label + " · 范围", [
          { label: "全部层级", run: () => termRun("kill " + code) },
          { label: "当前层级", run: () => termRun("kill " + code + " " + levelCodeOf(game ? game.level : 0)) },
        ]),
      }))),
      killall: () => termRun("kill all#monst"),
      hp: () => {
        const n = document.getElementById("term-hp");
        termRun("setting HP to " + clamp(parseInt(n && n.value, 10) || 100, 1, 100));
      },
      san: () => {
        const n = document.getElementById("term-san");
        termRun("setting San to " + clamp(parseInt(n && n.value, 10) || 100, 1, 100));
      },
      bagcap: () => {
        const n = document.getElementById("term-bag");
        termRun("setting bag to " + (parseInt(n && n.value, 10) || 25));
      },
      baginf: () => termRun("setting bag to infinite"),
      status: () => termRun("status"),
      map: () => termRun("display all map"),
      clear: () => termRun("clear"),
      // 命令行：最初的那种"敲指令"界面。点进来直接打字，输 exit 回到上面的图形按钮。
      cli: () => termCliOpen(),
      // 退出此页面：退回输密钥的界面，重新输口令才能再进来
      logout: () => {
        devOK = false;
        const sub = document.getElementById("term-sub");
        if (sub) hide(sub);
        const p2 = document.getElementById("term-pass");
        if (p2) p2.value = "";
        termApplyAuth();
        termLog("已退出 —— 请重新输入开发者口令。", "ok");
      },
    };
    if (document.getElementById("term-main")) {
      for (const b of document.querySelectorAll("#term-main [data-act]")) {
        b.addEventListener("click", () => { const f = acts[b.dataset.act]; if (f) f(); });
      }
    }
    if (el.termCloseBtn) el.termCloseBtn.addEventListener("click", () => closeTerminal());
    // 头部那个 ✕ —— 手机上底下那排按钮可能被挤到屏幕外，这里永远点得到
    const termX = $("term-x");
    if (termX) termX.addEventListener("click", () => closeTerminal());
    termApplyAuth();
  }
  // HUD 上方的按钮：点「⋯」收起，只留暂停（选择记在本机）
  {
    const HR = el.hudRight;
    const KEYC = "br_hud_collapsed";
    const apply = (v) => { if (HR) HR.classList.toggle("hud-collapsed", !!v); };
    let col = false;
    try { col = localStorage.getItem(KEYC) === "1"; } catch (e) { /* 忽略 */ }
    apply(col);
    if (el.hudMore) el.hudMore.addEventListener("click", () => {
      col = !col;
      apply(col);
      try { localStorage.setItem(KEYC, col ? "1" : "0"); } catch (e) { /* 忽略 */ }
    });
  }

  // ---------- 键位 / 按键位置：按设备自动显示对应那一条 ----------
  // 桌面（有鼠标、指针精确）显示"键位"；触屏设备显示"手机按键位置"。
  // 电脑上摆一排手机按钮没意义，反过来手机上也改不了物理按键。
  // 设置里的"设备模式"可以手动改（机房触屏一体机经常被判成桌面）。
  const DEVMODE_KEY = "br_devmode_v1";
  const devModeGet = () => {
    try { return localStorage.getItem(DEVMODE_KEY) || "auto"; } catch (e) { return "auto"; }
  };
  function devModeIsTouch() {
    const dm = devModeGet();
    if (dm === "desktop") return false;
    if (dm === "mobile") return true;
    try {
      const coarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
      const noHover = window.matchMedia && window.matchMedia("(hover: none)").matches;
      const pts = navigator.maxTouchPoints || 0;
      return (coarse || noHover) && pts > 0;
    } catch (e) { return false; }
  }
  function applyDevMode() {
    const isTouch = devModeIsTouch();
    const rowKeys = document.getElementById("row-keys");
    const rowTouch = document.getElementById("row-touchpos");
    if (rowKeys) rowKeys.style.display = isTouch ? "none" : "";
    if (rowTouch) rowTouch.style.display = isTouch ? "" : "none";
    try { if (typeof setTouchMode === "function") setTouchMode(isTouch); } catch (e) { /* 忽略 */ }
    return isTouch;
  }
  {
    applyDevMode();
    const steps = [["自动", "auto"], ["桌面", "desktop"], ["手机", "mobile"]];
    const cur = () => {
      const v = devModeGet();
      for (let i = 0; i < steps.length; i++) if (steps[i][1] === v) return i;
      return 0;
    };
    const paint = () => { if (el.setDevmode) el.setDevmode.textContent = steps[cur()][0]; };
    paint();
    if (el.setDevmode) el.setDevmode.addEventListener("click", () => {
      const i = (cur() + 1) % steps.length;
      try { localStorage.setItem(DEVMODE_KEY, steps[i][1]); } catch (e) { /* 忽略 */ }
      paint();
      applyDevMode();
      toast("设备模式：" + steps[i][0] + " —— 刷新页面后完全生效");
    });
  }

  // ---------- 键位设置 ----------
  const kmWaiting = { act: null };
  function kmRender() {
    if (!el.kmList) return;
    el.kmList.innerHTML = "";
    for (const [a, nm] of KEY_ACTS) {
      const row = document.createElement("div");
      row.className = "km-act" + (kmWaiting.act === a ? " waiting" : "");
      const lb = document.createElement("div");
      lb.className = "km-nm"; lb.textContent = nm;
      const kv = document.createElement("span");
      kv.className = "km-key";
      kv.textContent = kmCodes(a).map((c) => window.__keyNice(c)).join(" / ") || "—";
      const bt = document.createElement("button");
      bt.type = "button"; bt.className = "ghost";
      bt.textContent = kmWaiting.act === a ? "按下按键…" : "改键";
      bt.addEventListener("click", () => {
        kmWaiting.act = (kmWaiting.act === a) ? null : a;
        kmRender();
        if (el.kmHint) el.kmHint.textContent = kmWaiting.act
          ? "请按下想用于「" + nm + "」的键（Esc 取消，Backspace 清空）"
          : "点「改键」后按下想用的键（Esc 取消，Backspace 清空该动作）";
      });
      row.appendChild(lb); row.appendChild(kv); row.appendChild(bt);
      el.kmList.appendChild(row);
    }
  }
  function kmOpen() { if (el.keymap) el.keymap.classList.remove("hidden"); kmRender(); }
  function kmClose() { kmWaiting.act = null; if (el.keymap) el.keymap.classList.add("hidden"); }
  window.addEventListener("keydown", (e) => {
    if (!kmWaiting.act) return;
    e.preventDefault(); e.stopPropagation();
    const a = kmWaiting.act;
    if (e.code === "Escape") { kmWaiting.act = null; kmRender(); if (el.kmHint) el.kmHint.textContent = "已取消"; return; }
    if (e.code === "Backspace") { KEYMAP[a] = []; kmSave(); }
    else { KEYMAP[a] = [e.code]; kmSave(); }
    GAME_KEYS = gameKeyList();
    kmWaiting.act = null;
    kmRender();
    if (el.kmHint) el.kmHint.textContent = "已保存 —— 「"
      + (KEY_ACTS.find((x) => x[0] === a) || [a, a])[1] + "」→ " + (KEYMAP[a].length ? window.__keyNice(KEYMAP[a][0]) : "（空）");
  }, true);
  if (el.setKeys) el.setKeys.addEventListener("click", () => kmOpen());
  if (el.kmClose) el.kmClose.addEventListener("click", () => kmClose());
  if (el.kmOk) el.kmOk.addEventListener("click", () => kmClose());
  if (el.keymap) el.keymap.addEventListener("click", (e) => { if (e.target === el.keymap) kmClose(); });
  if (el.kmReset) el.kmReset.addEventListener("click", () => {
    KEYMAP = JSON.parse(JSON.stringify(DEFAULT_KEYS));
    kmSave(); GAME_KEYS = gameKeyList(); kmRender();
    if (el.kmHint) el.kmHint.textContent = "已恢复默认键位";
  });

  // ---------- 手机按键位置：进调整模式后可以拖 ----------
  // 位置按按钮 id 存成本机的 {dx, dy} 偏移，用 transform 平移。
  const TP_STORE = "br_touchpos_v1";
  let touchPos = {};
  try { touchPos = JSON.parse(localStorage.getItem(TP_STORE) || "{}") || {}; } catch (e) { touchPos = {}; }
  const TP_IDS = ["btn-door", "btn-sprint", "btn-fl", "btn-act", "btn-up", "btn-pick", "btn-e", "btn-bag"];
  function tpApply() {
    for (const id of TP_IDS) {
      const b = document.getElementById(id);
      if (!b) continue;
      const p = touchPos[id];
      b.style.transform = p ? ("translate(" + p.dx + "px," + p.dy + "px)") : "";
    }
  }
  function tpSave() { try { localStorage.setItem(TP_STORE, JSON.stringify(touchPos)); } catch (e) { /* 忽略 */ } }
  tpApply();
  let adjusting = false;
  function tpEnd() {
    adjusting = false;
    document.body.classList.remove("touch-adjust");
    if (el.taBar) el.taBar.style.display = "none";
  }
  // 界面文字缩放：机房大屏分辨率高，按 1280x720 设计的字号看着就很小。
  // 自动档按屏幕短边算，也可以手动固定档位。
  {
    const UZ_KEY = "br_uizoom_v1";
    const steps = [["自动", 0], ["100%", 1], ["125%", 1.25], ["150%", 1.5], ["175%", 1.75]];
    const autoZoom = () => {
      const vw = window.innerWidth || 1280, vh = window.innerHeight || 720;
      // 取短边比例：只放大不缩小，免得小屏上反而看不清
      return Math.max(1, Math.min(1.75, Math.min(vw / 1280, vh / 720)));
    };
    const stored = () => {
      try { const v = parseFloat(localStorage.getItem(UZ_KEY)); return isFinite(v) ? v : 0; } catch (e) { return 0; }
    };
    const apply = () => {
      const v = stored();
      const z = (v > 0 ? v : autoZoom());
      document.documentElement.style.setProperty("--ui-zoom", String(z));
      return z;
    };
    const cur = () => {
      const v = stored();
      for (let i = 0; i < steps.length; i++) if (Math.abs(steps[i][1] - v) < 0.01) return i;
      return 0;
    };
    apply();
    window.__uiZoomApply = apply;
    window.addEventListener("resize", () => { if (stored() <= 0) apply(); });
    const paint = () => { if (el.setUizoom) el.setUizoom.textContent = steps[cur()][0]; };
    paint();
    if (el.setUizoom) el.setUizoom.addEventListener("click", () => {
      const i = (cur() + 1) % steps.length;
      try { localStorage.setItem(UZ_KEY, String(steps[i][1])); } catch (e) { /* 忽略 */ }
      const z = apply();
      paint();
      toast("界面文字：" + steps[i][0] + (steps[i][1] === 0 ? "（当前 " + z.toFixed(2) + " 倍）" : ""));
    });
  }
  // 渲染精度：低 1 / 中 1.5 / 高 2（手机掉帧就往低调）
  {
    const steps = [["低", 1], ["中", 1.5], ["高", 2]];
    const cur = () => {
      const v = dprCap();
      for (let i = 0; i < steps.length; i++) if (Math.abs(steps[i][1] - v) < 0.01) return i;
      return 1;
    };
    const paint = () => { if (el.setDpr) el.setDpr.textContent = steps[cur()][0]; };
    paint();
    if (el.setDpr) el.setDpr.addEventListener("click", () => {
      const i = (cur() + 1) % steps.length;
      try { localStorage.setItem("br_dpr_v1", String(steps[i][1])); } catch (e) { /* 忽略 */ }
      paint();
      if (typeof resize === "function") resize();
      toast("渲染精度：" + steps[i][0] + "（约 " + steps[i][1] + " 倍像素）");
    });
  }
  if (el.setTouchPos) el.setTouchPos.addEventListener("click", () => {
    adjusting = true;
    document.body.classList.add("touch-adjust");
    if (el.taBar) el.taBar.style.display = "flex";
    toast("调整模式：拖动屏幕按钮，点「完成」保存");
  });
  if (el.taOk) el.taOk.addEventListener("click", () => { tpSave(); tpEnd(); toast("按键位置已保存"); });
  if (el.taReset) el.taReset.addEventListener("click", () => { touchPos = {}; tpSave(); tpApply(); toast("已复位"); });
  for (const id of TP_IDS) {
    const b = document.getElementById(id);
    if (!b) continue;
    let sx = 0, sy = 0, sd = null;
    b.addEventListener("pointerdown", (e) => {
      if (!adjusting) return;
      e.preventDefault(); e.stopPropagation();
      sd = touchPos[id] || { dx: 0, dy: 0 };
      sx = e.clientX; sy = e.clientY;
      b.setPointerCapture && b.setPointerCapture(e.pointerId);
    });
    b.addEventListener("pointermove", (e) => {
      if (!adjusting || !sd) return;
      e.preventDefault();
      touchPos[id] = { dx: sd.dx + (e.clientX - sx), dy: sd.dy + (e.clientY - sy) };
      tpApply();
    });
    const up = () => { if (sd) { tpSave(); sd = null; } };
    b.addEventListener("pointerup", up);
    b.addEventListener("pointercancel", up);
  }

  initTermUI();
  initHotbar();
  initSlotUI();
  initDiffUI();
  checkOrient();
  syncEgg2();
  syncEgg2();
  l26SyncMenu();
  {
    const eb = document.getElementById("menu-egg2-btn");
    if (eb) eb.addEventListener("click", () => openEgg2());
  }
  {
    const mb = document.getElementById("menu-mask26-btn");
    if (mb) mb.addEventListener("click", () => {
      if (window.l26SetMask) window.l26SetMask(false);
      try { toast("你把 =( 摘了下来"); } catch (e) { /* 忽略 */ }
      l26SyncMenu();
    });
  }
  initGroundClick();
  // 主菜单右下角：背景图
  {
    const bb = document.getElementById("menu-bg-btn");
    if (bb) bb.addEventListener("click", () => openBgSel());
    const bc = document.getElementById("bgsel-close-btn");
    if (bc) bc.addEventListener("click", () => closeBgSel());
  }
  // 主菜单右下角：攻略（游戏窗口内直接看通关路线）
  initGuide();

  // 一进页面就是主菜单 —— 这里就要起音乐（真正出声要等第一次点击/按键，
  // 那一步由 AudioSys 的手势解锁负责）。以前只有"从游戏回菜单"才起，所以开局没声音。
  applyMenuBg();
  AudioSys.startMenuMusic();

  // AI 决定好的动作：喝水 / 交互（E）/ 开关门（R）
  // AI 按了 E / R 之后，世界有没有真的变化 —— 用来判断"这事办成了没有"

  // 给 AI 用：脚下这个交互是不是"按 E 切出这一层"。
  // 判据直接读给玩家看的那句提示，不枚举 kind —— 有一批出口的去处只写在
  // 交互代码里、地图数据上没有 toLevel，AI 扫不到；但人走到跟前会看见提示，
  // 照着提示按就行。新层级加出口不必再来这里登记。
  // 只认明确的"切层 / 离开"语义：开机、买东西、接饮料、凑近看都不算，
  // 免得 AI 在面板或装饰物前面一抽一抽地乱按。
  window.__aiNearExit = function (g) {
    if (!g || !g.nearNew) return false;
    let h = "";
    try { h = newLevelHint(g) || ""; } catch (e) { return false; }
    if (h.indexOf("按 E") < 0) return false;
    return /通往|前往|切出|切进去|离开这里|离开这|走到 Level|回到 Level|返回 Level|上船|下船|跳进去|走进去|走下去|逃出去|钻进|爬上去|顺着它下去|推开门|走出去|进入 Level|推开/.test(h);
  };

  // AI 按 E 若打开了"面板类"界面，立刻替它关掉。AI 不会点关闭按钮，
  // 而主循环在 phase !== playing 时直接 return —— 留着面板等于整局卡死。
  function aiDismissPanel(g) {
    if (!g || !g.aiOn) return;
    const closers = {
      reading: closeArchive, pc601: closePc601, pc4: closePc4,
      merchant: closeMerchantStall, bntg: closeBntgShop, hermes: closeHermes,
      simsel: closeSimSelect, coffee: closeCoffeeCart, confess: closeConfess,
      manual: closeManual, outfit: closeOutfit, bag: closeBag,
    };
    const f = closers[g.phase];
    if (!f) return;
    try { f(); } catch (e) { /* 忽略 */ }
    // 万一 close 没把状态复位，至少让主循环继续跑下去
    if (g.phase !== "playing" && g.phase !== "transition" && g.phase !== "ended" &&
        g.phase !== "dying" && g.phase !== "dead" && g.phase !== "transform26") {
      g.phase = "playing";
    }
  }

  function aiSnap(g) {
    let inv = 0;
    for (const k in g.inv) inv += (g.inv[k] | 0);
    let arch = 0;
    for (const a of (g.archives || [])) if (a.taken) arch++;
    return { inv: inv, arch: arch, phase: g.phase, level: g.level, floor: g.floor };
  }
  function aiSame(a, b) {
    return a.inv === b.inv && a.arch === b.arch && a.phase === b.phase &&
      a.level === b.level && a.floor === b.floor;
  }

  function runAiActions(g) {
    const ai = g.ai;
    if (!ai) return;
    if (ai.wantDrink && (g.inv.almond | 0) > 0) {
      if (drink("almond")) { ai.wantDrink = false; return; }
    }
    if (ai.wantR) {
      ai.wantR = false;
      const before = aiSnap(g);
      doorAction();
      // 门没开、层级没变 —— 这扇门多半开不了，别再按了
      if (window.AI) window.AI.noteAction(aiSame(before, aiSnap(g)));
    } else if (ai.wantE) {
      ai.wantE = false;
      const before = aiSnap(g);
      const crateWas = g.nearCrate;
      readAction();
      // 按 E 可能打开的是档案、电脑、商店这类面板 —— AI 不需要看，合上继续走
      aiDismissPanel(game || g);
      // 箱子撬开了却什么都没拿到 = 空箱子：当场拉黑，不然它会站在前面一抽一抽的
      const emptied = !!(crateWas && crateWas.opened && (aiSnap(g).inv === before.inv));
      if (window.AI) window.AI.noteAction(aiSame(before, aiSnap(g)), emptied);
    }
    // HUD 上的小标签：让你知道它现在在想什么
    if (elPlay.aiTag && g.aiOn) {
      const lbl = ai.label || "思考中";
      const txt = "AI · " + lbl;
      if (elPlay.aiTag.textContent !== txt) elPlay.aiTag.textContent = txt;
    }
  }

  // ---------- 游玩模式：单人 / AI / 联机（待接入） ----------
  const elPlay = {
    panel: $("playmode"),
    solo: $("pm-solo"),
    ai: $("pm-ai"),
    online: $("pm-online"),
    back: $("pm-back"),
    aiPanel: $("ai-panel"),
    aiRows: $("ai-rows"),
    aiReset: $("ai-reset"),
    aiClose: $("ai-close"),
    aiBtn: $("ai-btn"),
    aiTag: $("ai-tag"),
  };

  // 只有真正联机（已经 attach 上）才保留聊天框
  function game0Multi() {
    try { return !!(window.Net && Net.room); } catch (e) { return false; }
  }

  // ---------- 竖屏提示：这游戏是按横屏设计的 ----------
  function checkOrient() {
    const box = document.getElementById("orient");
    if (!box) return;
    // 竖屏 = 高度大于宽度。桌面宽屏本来就是横的，不会弹。
    const portrait = window.innerHeight > window.innerWidth;
    box.classList.toggle("hidden", !portrait);
  }
  window.addEventListener("resize", checkOrient);
  window.addEventListener("orientationchange", () => setTimeout(checkOrient, 150));

  function openPlayMode() {
    if (!elPlay.panel) { beginGame(false); return; }
    show(elPlay.panel);
  }
  function closePlayMode() { if (elPlay.panel) hide(elPlay.panel); }

  // 死亡之后按难度处理：
  // 简单 / 普通 = 本层级重生；困难 = 回 Level 0；极端 = 回 Level 0 且清掉云存档
  function restartByDifficulty(fromLevel) {
    const d0 = curDiff();
    // AI 模式：死了就在 Level 0 重生，但记忆不清（记在 ai.js 的本地记忆里）
    const d = (game && game.aiOn) ? Object.assign({}, d0, { respawn: "zero", wipeSlot: false }) : d0;
    if (game && game.aiOn && window.AI && window.AI.noteDeath) {
      try { window.AI.noteDeath(); } catch (e) { /* 忽略 */ }
    }
    const lv = fromLevel != null ? fromLevel : "0";
    if (d.wipeSlot) {
      try {
        if (window.Cloud && Cloud.slotClear) Cloud.slotClear();
        localStorage.removeItem("br_cloud_slot");
      } catch (e) { /* 忽略 */ }
      toast("极端难度 —— 本局不记录存档");
    }
    if (d.respawn === "here") {
      createGame();
      const g = game;
      if (g && String(lv) !== "0") {
        setTimeout(() => {
          try {
            g.level = lv;
            g.map = generateMap(g.level, { seed: 1 });
            const st = g.map.start;
            if (st) { g.player.x = (st.x + 0.5) * TILE; g.player.y = (st.y + 0.5) * TILE; }
            markVisited(g.level);
            updateHud();
            toast(d.name + "难度 —— 在 Level " + lv + " 重生");
          } catch (e) { /* 忽略 */ }
        }, 260);
      }
      return;
    }
    createGame();       // 困难 / 极端：从 Level 0 重新开始
  }

  // ---------- 开发者面板：指定玩家传送 / 发物资 ----------
  function termTp(token, code) {
    if (!window.Net || !Net.send) { termRun("Teleport player#me to " + code); return; }
    Net.send(token, { t: "devcmd", cmd: "Teleport player#me to " + code });
    termLog("已让「" + shortTok(token) + "」传送到 " + code);
  }
  function termTpAll(code) {
    if (!window.Net || !Net.broadcast) { termRun("Teleport player#me to " + code); return; }
    Net.broadcast({ t: "devcmd", cmd: "Teleport player#me to " + code }, true);
    termRun("Teleport player#me to " + code);
    termLog("已让房间里的所有人传送到 " + code);
  }
  function termGive(token, item) {
    if (!window.Net || !Net.send) { termRun("give player#me to " + item); return; }
    Net.send(token, { t: "devcmd", cmd: "give player#me to " + item });
    termLog("已给「" + shortTok(token) + "」发放 " + item);
  }
  function termGiveAll(item) {
    if (!window.Net || !Net.broadcast) { termRun("give player#me to " + item); return; }
    Net.broadcast({ t: "devcmd", cmd: "give player#me to " + item }, true);
    termRun("give player#me to " + item);
    termLog("已给房间里的所有人发放 " + item);
  }
  function shortTok(t) { return String(t || "?").slice(0, 6); }

  // 难度对实体速度 / 视野的加成（Entity 构造时读）
  function entMul() { return curDiff().entMul; }
  try { window.__entMul = entMul; } catch (e) { /* 忽略 */ }

  // 给联机留的口子：直接开一局，不经过单人难度面板。
  // 难度由房主在房间面板里选好，通过 __setDiff 传进来 —— 别再强制压回普通。
  try { window.__beginMulti = function () { beginGame(false); }; } catch (e) { /* 忽略 */ }

  // 联机：把本地玩家直接切到某个层级（客人跟房主时要用）
  try {
    window.__setLevel = function (lv, f) {
      if (!game) return false;
      game.level = lv;
      if (typeof f === "number") game.floor = f | 0;
      try { newLevel(); } catch (e) { /* 忽略 */ }
      return true;
    };
  } catch (e) { /* 忽略 */ }

  // 调试口子：走完整的切层流程（会经过 applyPendingTrans，B.N.T.G 浆果的诅咒就拦在这儿）
  try { window.__goToLevel = function (lv) { if (game) goToLevel(game, lv, "切出", ""); }; } catch (e) { /* 忽略 */ }
  // 层级密钥模块要用到的几个内部口子（都在 main.js 闭包里，外部拿不到）
  try {
    window.__LK = {
      add: (k, n) => addItem(k, n == null ? 1 : n),
      remove: (k, n) => removeItem(k, n == null ? 1 : n),
      refresh: () => { updateBag(); updateHud(); renderHotbar(); },
      toast: (m) => toast(m),
      go: (lv, t, s) => { if (game) goToLevel(game, lv, t || "切出", s || ""); },
    };
  } catch (e) { /* 忽略 */ }
  // 调试口子：把当前局暴露出去（验证脚本用；不影响玩）
  try {
    Object.defineProperty(window, "__game", { configurable: true, get: function () { return game; } });
    window.__hint = function () { const h = document.getElementById("pickup-hint"); return h ? (h.innerText || "") : ""; };
  } catch (e) { /* 忽略 */ }

  // ---------- 联机：房主还没进游戏时的 15 秒等待 ----------
  // 客人可以自己先进去，但房主不在场时先冻住，免得开局各跑各的、失散在两层。
  const waitBar = (function () {
    let d = null;
    return function (left) {
      if (!d) {
        d = document.createElement("div");
        d.id = "mp-wait";
        d.style.cssText = "position:fixed;left:50%;top:64px;transform:translateX(-50%);" +
          "z-index:60;padding:10px 22px;border-radius:8px;pointer-events:none;" +
          "background:rgba(8,7,4,.86);border:1px solid rgba(217,201,94,.55);" +
          "color:#ffe97a;font-size:15px;letter-spacing:.06em;text-align:center;" +
          "box-shadow:0 4px 20px rgba(0,0,0,.5);display:none";
        document.body.appendChild(d);
      }
      if (left == null || left <= 0) { d.style.display = "none"; return; }
      d.style.display = "";
      d.innerHTML = "房主还没进游戏 —— <b>" + Math.ceil(left) +
        "</b> 秒后可以自由行动<br><span style='font-size:12px;opacity:.72'>先别乱跑，等他进来</span>";
    };
  })();
  try { window.__freezeUI = waitBar; } catch (e) { /* 忽略 */ }

  function closeDiffPicker() {
    const p = document.getElementById("diff");
    if (p) p.classList.add("hidden");
  }
  // 难度面板里的云存档：没有存档就"创建"，已有存档就"覆盖"且要点两次
  let dfSlotArm = 0;                     // 覆盖确认的倒计时句柄
  function dfSlotRefresh() {
    const info = document.getElementById("df-slot-info");
    const btn = document.getElementById("df-slot-save");
    if (!info || !btn) return;
    if (!window.Cloud || !Cloud.slotGet) { info.textContent = "云服务还没接上"; btn.disabled = true; return; }
    btn.disabled = false;
    Cloud.slotGet().then((slot) => {
      const has = !!(slot && slot.level != null);
      info.textContent = has ? ("已有存档 —— " + slotDescribe(slot)) : "还没有云存档";
      dfSlotArmReset(has);
    }).catch(() => { info.textContent = "还没有云存档"; dfSlotArmReset(false); });
  }
  function dfSlotArmReset(has) {
    const btn = document.getElementById("df-slot-save");
    if (!btn) return;
    clearTimeout(dfSlotArm);
    dfSlotArm = 0;
    btn.dataset.armed = "0";
    btn.textContent = has ? "覆盖云存档" : "创建云存档";
    btn.classList.remove("confirm");
  }
  function initDiffUI() {
    for (let i = 0; i < 4; i++) {
      const b = document.getElementById("df-" + i);
      if (!b) continue;
      b.addEventListener("click", () => {
        setDiff(i);
        closeDiffPicker();
        beginGame(false);
      });
      // 高亮跟着鼠标走：指到哪一档就亮哪一档，移开再回到上次选的那档。
      // 以前只看"上次选的是哪个"，于是普通档永远亮着，看着像不能选别的。
      b.addEventListener("mouseenter", () => diffHover(i));
      b.addEventListener("focus", () => diffHover(i));
    }
    const bk = document.getElementById("df-back");
    if (bk) bk.addEventListener("click", () => { closeDiffPicker(); openPlayMode(); });
    const sv = document.getElementById("df-slot-save");
    if (sv) sv.addEventListener("click", () => {
      // 已经有存档：第一下只是"要覆盖了？"，5 秒内再点一下才真的覆盖
      if (sv.dataset.armed !== "1") {
        sv.dataset.armed = "1";
        sv.classList.add("confirm");
        sv.textContent = "再点一次确认覆盖";
        clearTimeout(dfSlotArm);
        dfSlotArm = setTimeout(() => {
          const info = document.getElementById("df-slot-info");
          const has = info && /已有存档/.test(info.textContent);
          dfSlotArmReset(!!has);
        }, 5000);
        return;
      }
      clearTimeout(dfSlotArm);
      if (game) { saveCloudSlot(); toast("云存档已记录 —— " + slotDescribe({ level: game.level, savedAt: Date.now() })); }
      else toast("先开始一局，再创建云存档");
      dfSlotRefresh();
    });
  }
  // 打开难度面板时刷新一次云存档状态
  function diffPaint(idx) {
    for (let i = 0; i < 4; i++) {
      const b = document.getElementById("df-" + i);
      if (!b) continue;
      b.classList.toggle("on", i === idx);
    }
  }
  function diffHover(i) { diffPaint(i); }
  function openDiffPicker() {
    const p = document.getElementById("diff");
    if (!p) { beginGame(false); return; }
    closePlayMode();
    diffPaint(diffIdx);
    // 鼠标移出整个面板：回到上次选的那一档
    if (!p.dataset.hook) {
      p.dataset.hook = "1";
      p.addEventListener("mouseleave", () => diffPaint(diffIdx));
    }
    p.classList.remove("hidden");
    try { dfSlotRefresh(); } catch (e) { /* 忽略 */ }
  }

  // ===========================================================
  // 本地存档：5 个槽，每个记录最后所在的层级与位置
  // 原来「开始游戏」里挂的是云存档；现在整块换成本地存档，存在这台设备上。
  // ===========================================================
  const SLOT_KEY = "br_local_slots_v1";
  let activeSlot = 0;
  let slotLoading = false;          // 读取存档的过程中别让自动保存把旧状态盖回去
  function slotAll() {
    try {
      const a = JSON.parse(localStorage.getItem(SLOT_KEY) || "[]");
      if (!Array.isArray(a)) return [null, null, null, null, null];
      const out = [];
      for (let i = 0; i < 5; i++) out.push(a[i] || null);
      return out;
    } catch (e) { return [null, null, null, null, null]; }
  }
  function slotWrite(a) {
    try { localStorage.setItem(SLOT_KEY, JSON.stringify(a.slice(0, 5))); } catch (e) { /* 忽略 */ }
  }
  function slotName(s) {
    if (!s || s.level == null) return "空";
    let nm;
    try { nm = levelDef(s.level).name; } catch (e) { nm = "Level " + s.level; }
    const gx = Math.round((s.x || 0) / TILE), gy = Math.round((s.y || 0) / TILE);
    const t = s.savedAt ? new Date(s.savedAt).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) : "";
    return nm + " · (" + gx + "," + gy + ")" + (t ? " · " + t : "");
  }
  function slotTip(t) { const n = document.getElementById("pm-slot-tip"); if (n) n.textContent = t || ""; }
  function snapshot() {
    const g = game;
    if (!g) return null;
    const d = curDiff();
    return {
      level: g.level, floor: g.floor | 0,
      x: Math.round(g.player.x), y: Math.round(g.player.y),
      hp: Math.round(g.hp), sanity: Math.round(g.sanity),
      inv: Object.assign({}, g.inv || {}), outfit: g.outfit || "",
      offhand: g.offhand || null, hotbar: (g.hotbar || []).slice(0, 3),
      tapeIds: (g.tapeIds || []).slice(),
      juice: g.juice ? Object.assign({}, g.juice) : null,
      // 层级密钥：已用钥匙开过的枢纽门、还插在锁孔里的那把、以及本局的随机进货
      hubKeyOpened: Object.assign({}, g.hubKeyOpened || {}),
      keyPortal: g.keyPortal ? Object.assign({}, g.keyPortal) : null,
      keyLockInserted: g.keyLockInserted ? Object.assign({}, g.keyLockInserted) : null,
      keyTaken: Object.assign({}, g.keyTaken || {}),
      bntgKeyOffers: g.bntgKeyOffers ? JSON.parse(JSON.stringify(g.bntgKeyOffers)) : null,
      bntgBought: g.bntgBought ? JSON.parse(JSON.stringify(g.bntgBought)) : null,
      diff: d.key, diffName: d.name,
      savedAt: Date.now(),
    };
  }
  // 自动保存：开局、切层、以及每 5 秒各写一次。不再需要手动点「保存」——
  // 以前存档界面只在主菜单里、却要求「先开始一局」，游戏里又没有保存按钮，
  // 两头堵死，本地存档等于没用。现在只要开局就自动往当前槽写。
  function autoSaveActive() {
    try {
      if (slotLoading) return;
      if (!game || game.phase !== "playing") return;
      if (String(curDiff().key) === "extreme") return;
      const arr = slotAll();
      arr[activeSlot] = snapshot();
      slotWrite(arr);
      const panel = document.getElementById("playmode");
      if (panel && !panel.classList.contains("hidden")) renderSlots();
    } catch (e) { /* 忽略 */ }
  }
  // 「选用」：把某个槽设成当前存档。没开局时只记下选择，开局后自动写入。
  function slotSelect(i) {
    activeSlot = i;
    if (String(curDiff().key) === "extreme") {
      slotTip("极端模式下无法存档 —— 已选用第 " + (i + 1) + " 槽，但不会写入");
      renderSlots(); return;
    }
    if (game && game.phase === "playing") {
      const arr = slotAll(); arr[i] = snapshot(); slotWrite(arr);
      slotTip("第 " + (i + 1) + " 个存档已创建 —— " + slotName(arr[i]));
    } else {
      slotTip("已选用第 " + (i + 1) + " 个存档 —— 开局后自动写入");
    }
    renderSlots();
  }
  function slotDetailHtml(s, i) {
    let nm = "Level " + s.level;
    try { nm = levelDef(s.level).name || nm; } catch (e) { /* 忽略 */ }
    const gx = Math.round((s.x || 0) / TILE), gy = Math.round((s.y || 0) / TILE);
    const when = s.savedAt ? new Date(s.savedAt).toLocaleString("zh-CN") : "未知";
    let bag = "空";
    try {
      const parts = [];
      for (const k in (s.inv || {})) {
        const n = s.inv[k] | 0;
        if (n > 0) parts.push(((typeof ITEMS !== "undefined" && ITEMS[k]) ? ITEMS[k].short : k) + " ×" + n);
      }
      if (parts.length) bag = parts.join("、");
    } catch (e) { /* 忽略 */ }
    let outfit = "流浪者";
    try { if (typeof OUTFITS !== "undefined" && OUTFITS[s.outfit]) outfit = OUTFITS[s.outfit].name; } catch (e) { /* 忽略 */ }
    const cell = (label, val) => '<div class="sd-cell"><span>' + label + '</span><b>' + escapeHtml(String(val)) + "</b></div>";
    let offName = "空";
    try {
      const ok = s.offhand;
      if (ok && (s.inv && s.inv[ok] | 0) > 0) offName = (typeof ITEMS !== "undefined" && ITEMS[ok]) ? (ITEMS[ok].short || ITEMS[ok].name) : ok;
    } catch (e) { /* 忽略 */ }
    return '<h3>第 ' + (i + 1) + ' 个存档</h3><div class="sd-grid">'
      + cell("所在层级", nm)
      + cell("位置", "(" + gx + ", " + gy + ") · 第 " + ((s.floor | 0) + 1) + " 层")
      + cell("生命", (s.hp == null ? "?" : s.hp) + " / 100")
      + cell("理智", (s.sanity == null ? "?" : s.sanity) + " / 100")
      + cell("难度", s.diffName || "普通")
      + cell("保存时间", when)
      + cell("随身物资", bag)
      + cell("副手", offName)
      + cell("服装", outfit)
      + '</div><div class="sd-btns">'
      + '<button type="button" class="go sd-go">进入这个存档</button>'
      + '<button type="button" class="sd-back">返回</button></div>';
  }
  // 点「载入」：上方换成这份存档的信息，不再弹难度选择（难度已经记在存档里）
  function slotInspect(i) {
    const s = slotAll()[i];
    if (!s) { slotTip("这个存档还是空的"); return; }
    const box = document.getElementById("pm-slot-detail");
    const modes = document.getElementById("pm-modes");
    if (!box) { slotLoad(i); return; }
    if (modes) modes.classList.add("hidden");
    box.classList.remove("hidden");
    box.innerHTML = slotDetailHtml(s, i);
    const go = box.querySelector(".sd-go");
    const back = box.querySelector(".sd-back");
    if (go) go.addEventListener("click", () => slotLoad(i));
    if (back) back.addEventListener("click", () => {
      box.classList.add("hidden"); box.innerHTML = "";
      if (modes) modes.classList.remove("hidden");
      slotTip("");
    });
    slotTip("第 " + (i + 1) + " 个存档 —— 看完信息再进入，难度已随存档记下");
  }
  function slotLoad(i) {
    const s = slotAll()[i];
    if (!s) { slotTip("这个存档还是空的"); return; }
    // 难度跟着存档走，不再让玩家重新选一遍
    if (s.diff && typeof setDiff === "function") {
      const idx = DIFFS.findIndex((d) => d.key === s.diff);
      if (idx >= 0) setDiff(idx);
    }
    activeSlot = i;
    slotLoading = true;
    const box = document.getElementById("pm-slot-detail");
    const modes = document.getElementById("pm-modes");
    if (box) { box.classList.add("hidden"); box.innerHTML = ""; }
    if (modes) modes.classList.remove("hidden");
    beginGame(false);
    setTimeout(() => {
      const g = game;
      if (!g) { slotLoading = false; return; }
      try {
        g.level = s.level; g.floor = s.floor | 0;
        g.map = generateMap(g.level, { seed: 1 });
        g.player.x = s.x; g.player.y = s.y;
        if (s.hp != null) g.hp = s.hp;
        if (s.sanity != null) g.sanity = s.sanity;
        if (s.inv) g.inv = Object.assign({}, s.inv);
        g.hubKeyOpened = Object.assign({}, s.hubKeyOpened || {});
        g.keyPortal = s.keyPortal ? Object.assign({}, s.keyPortal) : null;
        g.keyLockInserted = s.keyLockInserted ? Object.assign({}, s.keyLockInserted) : null;
        g.keyTaken = Object.assign({}, s.keyTaken || {});
        g.bntgKeyOffers = s.bntgKeyOffers || null;
        g.bntgBought = s.bntgBought || null;
        if (window.LEVEL_KEY) { window.LEVEL_KEY.restore(g.inv); window.LEVEL_KEY.spawnInLevel(g); }
        if (s.juice) g.juice = Object.assign(
          { doses: 0, calmLeft: 0, drainMul: 1, relapse: 0, ended: false }, s.juice);
        if (s.outfit) g.outfit = s.outfit;
        // 摄像机是自带物品：老存档里没有也要补一台，别让它永久消失
        if (!(g.inv.camera > 0)) g.inv.camera = 1;
        // 胶卷制之前的老存档：一次补上开局的 4 卷普通胶卷（用过的不重复补）
        if (!("film_normal" in g.inv) && !("film_premium" in g.inv) && !("tape" in g.inv)) {
          g.inv.film_normal = 4;
        }
        g.tapeIds = Array.isArray(s.tapeIds) ? s.tapeIds.slice() : [];
        if (s.offhand !== undefined) g.offhand = s.offhand;
        if (Array.isArray(s.hotbar)) g.hotbar = s.hotbar.slice(0, 3);
        markVisited(g.level);
        updateHud(); updateBag(); renderHotbar();
        toast("已读取第 " + (i + 1) + " 个存档 —— " + slotName(s));
      } catch (e) { toast("读取存档失败"); }
      slotLoading = false;
      autoSaveActive();
    }, 400);
    renderSlots();
  }
  function slotDel(i) {
    const a = slotAll(); if (!a[i]) return;
    a[i] = null; slotWrite(a);
    const box = document.getElementById("pm-slot-detail");
    if (box && !box.classList.contains("hidden") && box.querySelector(".sd-go")) {
      // 正在看的这份被删了：收起详情，把上方玩法按钮放回来
      box.classList.add("hidden"); box.innerHTML = "";
      const modes = document.getElementById("pm-modes");
      if (modes) modes.classList.remove("hidden");
    }
    renderSlots(); slotTip("第 " + (i + 1) + " 个存档已删除");
  }
  function renderSlots() {
    const box = document.getElementById("pm-slot-list");
    if (!box) return;
    const a = slotAll();
    box.innerHTML = "";
    for (let i = 0; i < 5; i++) {
      const s = a[i];
      const row = document.createElement("div");
      row.className = "slot-row" + (activeSlot === i ? " cur" : "");
      row.style.cssText = "display:flex;align-items:center;gap:7px;margin:4px 0;font-size:13px;color:#e2d8b4;padding:5px 6px;border-radius:5px;";
      const lab = document.createElement("span");
      lab.style.cssText = "flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
      lab.textContent = "槽 " + (i + 1) + " · " + slotName(s) + (activeSlot === i ? " · 当前" : "");
      row.appendChild(lab);
      const mk = (txt, fn, cls) => {
        const b = document.createElement("button");
        b.type = "button"; b.textContent = txt;
        b.className = cls || "";
        b.style.cssText = "font-size:12px;padding:5px 11px;border:1px solid rgba(217,201,94,.3);background:rgba(217,201,94,.08);color:#d9c95e;border-radius:4px;cursor:pointer;flex:none;";
        b.addEventListener("click", fn); row.appendChild(b);
      };
      mk("选用", () => slotSelect(i));
      if (s) { mk("载入", () => slotInspect(i)); mk("删除", () => slotDel(i)); }
      box.appendChild(row);
    }
  }
  renderSlots();
  setInterval(autoSaveActive, 5000);

  function beginGame(withAI) {
    closePlayMode();
    // 单人没有聊天框（联机的 attach 会把它打开）
    try { if (window.LobbyChatMode && !game0Multi()) window.LobbyChatMode(false); } catch (e) { /* 忽略 */ }
    pendingAI = !!withAI;
    hide(el.menu);
    show(el.hud);
    show(el.staminaBar);
    show(el.vitals);
    createGame();
    renderHotbar();            // 副手槽跟着这一刷新显示，开局就看得见自带的摄像机
    showFlashToast();
    // 开局即建/更新当前存档 —— 不用再回到主菜单手动点保存
    try { autoSaveActive(); } catch (e) { /* 忽略 */ }
  }

  if (elPlay.solo) elPlay.solo.addEventListener("click", () => openDiffPicker());
  if (elPlay.ai) elPlay.ai.addEventListener("click", () => beginGame(true));
  // AI 模型：导出成加密 .json / 从别的设备安装
  {
    const ex = document.getElementById("ai-export");
    const im = document.getElementById("ai-import");
    const fi = document.getElementById("ai-file");
    const hint = document.getElementById("ai-model-hint");
    const say = (t) => { if (hint) hint.textContent = t; toast(t); };
    if (ex) ex.addEventListener("click", () => {
      if (!window.AI) return;
      const n = window.AI.exportModel();
      say("已导出加密模型 —— 记住 " + n.levels + " 个层级 / " + n.exits + " 处出口");
    });
    if (im && fi) {
      im.addEventListener("click", () => fi.click());
      fi.addEventListener("change", () => {
        const f = fi.files && fi.files[0];
        if (!f) return;
        const rd = new FileReader();
        rd.onload = () => {
          try {
            const n = window.AI.importModel(String(rd.result));
            say("模型已安装 —— " + n.levels + " 个层级 / " + n.exits + " 处出口，AI 会记得这些地方");
            try { buildAiPanel(); } catch (e) { /* 忽略 */ }
          } catch (e) { say("安装失败：" + (e.message || "文件读不出来")); }
          fi.value = "";
        };
        rd.readAsText(f);
      });
    }
  }
  if (elPlay.online) elPlay.online.addEventListener("click", () => {
    toast("联机游玩还在接入中 —— 敬请期待");
  });
  if (elPlay.back) elPlay.back.addEventListener("click", () => closePlayMode());

  // ---------- AI 权重面板 ----------
  const AI_ROWS = [
    { key: "wExit", name: "切出至更高层", sub: "出口 / 电梯 / 楼梯 / 通往别层的门" },
    { key: "wGear", name: "收集装备", sub: "各类背包" },
    { key: "wSupply", name: "获取物资", sub: "杏仁水 / 撬棍 / 补给箱 / 饮水机" },
    { key: "wKey", name: "收集层级钥匙", sub: "层级密钥 / 电梯钥匙" },
    { key: "cautious", name: "谨慎度", sub: "越高越早开始躲怪物" },
    { key: "curiosity", name: "探索欲", sub: "越高越愿意往没去过的地方钻" },
    { key: "sanityLine", name: "喝杏仁水线", sub: "理智低于此值就喝（10~90）" },
  ];

  function buildAiPanel() {
    if (!elPlay.aiRows || !window.AI) return;
    const box = elPlay.aiRows;
    box.innerHTML = "";
    for (const r of AI_ROWS) {
      const row = document.createElement("div");
      row.className = "ai-row";
      const top = document.createElement("div");
      top.className = "ai-row-top";
      const nm = document.createElement("div");
      nm.className = "ai-row-name";
      nm.innerHTML = r.name + '<small>' + r.sub + '</small>';
      const val = document.createElement("div");
      val.className = "ai-row-val";
      val.textContent = String(Math.round(window.AI.weights[r.key]));
      top.appendChild(nm);
      top.appendChild(val);
      const inp = document.createElement("input");
      inp.type = "range";
      inp.min = r.key === "sanityLine" ? "10" : "0";
      inp.max = r.key === "sanityLine" ? "90" : "100";
      inp.step = "1";
      inp.value = String(Math.round(window.AI.weights[r.key]));
      inp.addEventListener("input", () => {
        const v = Number(inp.value);
        window.AI.weights[r.key] = v;
        val.textContent = String(v);
      });
      inp.addEventListener("change", () => window.AI.save());
      row.appendChild(top);
      row.appendChild(inp);
      box.appendChild(row);
    }
  }

  function openAiPanel() {
    if (!elPlay.aiPanel) return;
    buildAiPanel();
    show(elPlay.aiPanel);
    if (game) game.phase = "aiPanel";
  }
  function closeAiPanel() {
    if (!elPlay.aiPanel) return;
    hide(elPlay.aiPanel);
    if (game && game.phase === "aiPanel") game.phase = "playing";
  }
  if (elPlay.aiBtn) elPlay.aiBtn.addEventListener("click", () => {
    if (game && game.phase === "aiPanel") closeAiPanel();
    else openAiPanel();
  });
  if (elPlay.aiClose) elPlay.aiClose.addEventListener("click", () => closeAiPanel());
  if (elPlay.aiReset) elPlay.aiReset.addEventListener("click", () => {
    if (window.AI) { window.AI.reset(); buildAiPanel(); toast("AI 权重已恢复默认"); }
  });

  // ---------- 按钮 ----------
  el.startBtn.addEventListener("click", () => {
    AudioSys.init();
    // 开始一局：背景音乐从头放，而不是接着主菜单里那段进度
    AudioSys.restartMenuMusic();
    openPlayMode();
  });
  el.restartBtn.addEventListener("click", () => {
    hide(el.dead);
    restartByDifficulty();
  });
  if (el.wretchBtn) el.wretchBtn.addEventListener("click", () => {
    hide(el.wretch);
    AudioSys.stopStatic();
    restartByDifficulty(game && game._deathLevel != null ? game._deathLevel : "0");
  });
  if (el.endingBtn) el.endingBtn.addEventListener("click", () => {
    hide(el.ending);
    createGame();
  });
  if (el.menuManualBtn) el.menuManualBtn.addEventListener("click", () => openManual());
  if (el.menuHelpBtn) el.menuHelpBtn.addEventListener("click", () => { hide(el.menu); show(el.help); });
  if (el.helpCloseBtn) el.helpCloseBtn.addEventListener("click", () => { hide(el.help); show(el.menu); });
  el.resumeBtn.addEventListener("click", () => togglePause());
  if (el.menuBtn2) el.menuBtn2.addEventListener("click", () => requestBackToMenu());
  if (el.elevClose) el.elevClose.addEventListener("click", () => hide(el.elevator));
  if (el.deadMenuBtn) el.deadMenuBtn.addEventListener("click", () => backToMenu());
  if (el.wretchMenuBtn) el.wretchMenuBtn.addEventListener("click", () => { AudioSys.stopStatic(); backToMenu(); });
  if (el.endingMenuBtn) el.endingMenuBtn.addEventListener("click", () => backToMenu());
  el.muteBtn.addEventListener("click", () => toggleMute());
  el.pauseBtn.addEventListener("click", () => togglePause());
  if (el.archiveCloseBtn) el.archiveCloseBtn.addEventListener("click", () => closeArchive());
  // 档案手册按钮：点一下开手册；触屏长按 5 秒 = 打开管理员终端（手机没有 Shift+F7）
  let lpFired = false;                     // 刚触发过长按，紧随其后的 click 要吞掉
  if (el.manualBtn) {
    el.manualBtn.addEventListener("click", () => {
      if (lpFired) { lpFired = false; return; }
      if (game) openManual();
    });

    let lpTimer = null, lpStart = null;
    const LP_MS = 5000;                    // 长按判定：5 秒
    const lpCancel = () => {
      if (lpTimer) { clearTimeout(lpTimer); lpTimer = null; }
      lpStart = null;
      el.manualBtn.classList.remove("lp-on");
    };
    el.manualBtn.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "touch") return;      // 只有真实手指触摸才算
      if (termOpen) return;
      lpStart = { x: e.clientX, y: e.clientY };
      el.manualBtn.classList.add("lp-on");         // 按钮上出现一条 5 秒的进度
      lpTimer = setTimeout(() => {
        lpTimer = null;
        lpStart = null;
        el.manualBtn.classList.remove("lp-on");
        lpFired = true;
        openTerminal();
      }, LP_MS);
    });
    el.manualBtn.addEventListener("pointermove", (e) => {
      if (!lpStart) return;
      if (Math.hypot(e.clientX - lpStart.x, e.clientY - lpStart.y) > 14) lpCancel();  // 手指滑开就作废
    });
    for (const ev of ["pointerup", "pointercancel", "pointerleave"]) {
      el.manualBtn.addEventListener(ev, lpCancel);
    }
    // 长按别弹出系统的"复制/选择"菜单
    el.manualBtn.addEventListener("contextmenu", (e) => e.preventDefault());
  }
  if (el.manualCloseBtn) el.manualCloseBtn.addEventListener("click", () => closeManual());

  // 档案手册顶部搜索：只搜当前这一页；切页时保留关键词，按新页内容重新过滤。
  {
    const sBtn = $("manual-search-btn"), sBar = $("manual-searchbar"),
      sInput = $("manual-search-input"), sClear = $("manual-search-clear");
    if (sBtn && sBar && sInput) {
      sBtn.addEventListener("click", () => {
        manualSearch.open = !manualSearch.open;
        if (manualSearch.open) {
          sBar.classList.remove("hidden");
          sBtn.classList.add("on");
          sBtn.textContent = "收起搜索";
          sInput.focus();
        } else {
          sBar.classList.add("hidden");
          sBtn.classList.remove("on");
          sBtn.textContent = "搜索";
          manualSearch.q = "";
          sInput.value = "";
          renderManual();
        }
      });
      sInput.addEventListener("input", () => {
        manualSearch.q = sInput.value;
        renderManual();
      });
      // 输入框里的按键不能被游戏全局快捷键抢走（H 关手册、E 交互、数字切槽…）
      ["keydown", "keyup", "keypress"].forEach((ev) =>
        sInput.addEventListener(ev, (e) => e.stopPropagation()));
      sInput.addEventListener("keydown", (e) => {
        if (e.key === "Escape") { manualSearch.q = ""; sInput.value = ""; renderManual(); }
      });
      if (sClear) sClear.addEventListener("click", () => {
        manualSearch.q = ""; sInput.value = ""; renderManual(); sInput.focus();
      });
    }
  }
  if (el.bagBtn) el.bagBtn.addEventListener("click", () => openBag());
  if (el.bagCloseBtn) el.bagCloseBtn.addEventListener("click", () => closeBag());
  // ---------- 账号面板 ----------
  function accMsg(t, kind) {
    if (!el.accMsg) return;
    el.accMsg.textContent = t || "";
    el.accMsg.className = "acc-msg" + (kind ? " " + kind : "");
  }
  function renderAccount() {
    if (!el.account || !window.Cloud) return;
    const u = Cloud.user;
    if (u) {
      if (el.accForm) hide(el.accForm);
      if (el.accLogged) show(el.accLogged);
      if (el.accName) el.accName.textContent = "已登录 · " + u.nickname;
      if (el.accState) el.accState.textContent = "正在以 " + u.nickname + " 的身份游玩";
    } else {
      if (el.accForm) show(el.accForm);
      if (el.accLogged) hide(el.accLogged);
      if (el.accState) el.accState.textContent = "未登录 · 进度只存在这台设备上";
    }
    if (el.accBtn) el.accBtn.textContent = u ? ("账号 · " + u.nickname) : "账号";
    // 云服务通不通，直接写在面板上，省得排查
    if (el.accState && window.Cloud && Cloud.status === "offline") {
      const why = Cloud.lastError ? "（" + Cloud.lastError + "）" : "";
      el.accState.innerHTML = '<span style="color:#d9685e">云服务连不上 ' + why + '</span>';
    }
  }
  function openAccount() {
    if (!el.account) return;
    show(el.account); accMsg("");
    renderAccount();
    // VibeHub 那一栏：顺手把授权页地址算出来，玩家可以直接点过去
    try {
      if (window.Net && Net.vibeAuthUrl) {
        const a = $("acc-vibe-url");
        if (a) a.setAttribute("href", Net.vibeAuthUrl());
      }
      renderVibeAuth();
    } catch (e) { /* 忽略 */ }
    // 打开面板时探测一次，立刻知道后端通不通
    if (window.Cloud) {
      fetch((window.BACKROOMS_API || "") + "/api/online")
        .then(() => { renderAccount(); })
        .catch(() => { renderAccount(); });
    }
  }
  function closeAccount() { if (el.account) hide(el.account); }
  function accSubmit(mode) {
    if (!window.Cloud) return;
    const nick = (el.accNick && el.accNick.value || "").trim();
    const pwd = el.accPwd && el.accPwd.value || "";
    if (nick.length < 2) { accMsg("昵称至少 2 个字符", "err"); return; }
    if (pwd.length < 6) { accMsg("密码至少 6 位", "err"); return; }
    accMsg("正在" + (mode === "reg" ? "注册" : "登录") + "...");
    if (mode === "reg") {
      Cloud.register(nick, pwd).then(onLogined).catch((e) => accMsg(e.message || "操作失败", "err"));
      return;
    }
    // 登录前先问一句：这个号是不是已经有人在用了
    Cloud.lrBusy(nick).then((busy) => {
      if (!busy) {
        Cloud.login(nick, pwd).then(onLogined).catch((e) => accMsg(e.message || "操作失败", "err"));
        return;
      }
      accMsg("");
      openLoginRequest(nick, pwd);
    }).catch(() => {
      Cloud.login(nick, pwd).then(onLogined).catch((e) => accMsg(e.message || "操作失败", "err"));
    });
  }
  function onLogined(u) {
    accMsg("欢迎，" + ((u && u.nickname) || "") + " —— 已同步云端进度", "ok");
    renderAccount();
    if (el.accPwd) el.accPwd.value = "";
    refreshManualIfOpen();
  }
  function refreshManualIfOpen() {
    if (el.manual && !el.manual.classList.contains("hidden")) renderManual();
  }
  if (el.accBtn) el.accBtn.addEventListener("click", () => openAccount());
  if (el.accClose) el.accClose.addEventListener("click", () => closeAccount());

  // ---------- 账号面板：VibeHub 登录（跨设备联机要用） ----------
  // 联机提示「未授权」的根因就是这里没登录 —— 所以在主菜单就给一个入口，
  // 不用等到联机那一步才被服务器挡回来。
  function renderVibeAuth(txt, kind) {
    const st = $("acc-vibe-st");
    if (!st) return;
    if (txt) { st.textContent = txt; st.style.color = kind === "ok" ? "#8fd06a" : "#d98b6a"; return; }
    let ok = false;
    try { ok = !!(window.Net && Net.vibeLoggedIn && Net.vibeLoggedIn()); } catch (e) { /* 忽略 */ }
    const u = (window.Net && Net.vibeUser) ? Net.vibeUser() : null;
    const nm = u && (u.name || u.nickname || u.id);
    st.textContent = ok ? ("已登录" + (nm ? " · " + nm : "") + " —— 可以跨设备联机了")
                        : "未登录 · 跨设备联机会提示「未授权」";
    st.style.color = ok ? "#8fd06a" : "";
  }
  function vibeLoginFromAccount() {
    const btn = $("acc-vibe-login");
    if (!window.Net || !Net.initVibe) { renderVibeAuth("VibeHub 还没加载上（js/net.js 没引到）", "err"); return; }
    if (btn) { btn.disabled = true; btn.textContent = "正在打开登录窗口……"; }
    renderVibeAuth("正在连接 VibeHub……");
    // 先静默初始化（不弹窗），再主动登录 —— 免得一次点击弹两个窗
    Net.initVibe({ login: false }).then(() => {
      const url = Net.vibeAuthUrl ? Net.vibeAuthUrl() : "";
      const a = $("acc-vibe-url");
      if (a && url) a.href = url;
      return Net.vibeLoginJump ? Net.vibeLoginJump(true) : Net.vibeLogin(true);
    }).then((r) => {
      if (btn) { btn.disabled = false; btn.textContent = "登录 / 重新授权"; }
      renderVibeAuth();
      accMsg((r && r.via === "url")
        ? "已打开 VibeHub 授权页 —— 在那边登录后回到本页，再点一次「登录 / 重新授权」接上"
        : "VibeHub 登录成功 —— 跨设备联机可以用了", "ok");
    }).catch((e) => {
      if (btn) { btn.disabled = false; btn.textContent = "登录 / 重新授权"; }
      const m = String((e && e.message) || e || "登录失败");
      renderVibeAuth(m, "err");
      accMsg(m, "err");
    });
  }
  if ($("acc-vibe-login")) $("acc-vibe-login").addEventListener("click", vibeLoginFromAccount);
  if ($("acc-vibe-url")) {
    const a = $("acc-vibe-url");
    a.addEventListener("click", (e) => {
      // 没算出地址就现算一个，别跳到 #（跳 # 等于什么都没发生）
      let url = a.getAttribute("href") || "";
      if (!url || url === "#") {
        try { url = window.Net && Net.vibeAuthUrl ? Net.vibeAuthUrl() : ""; } catch (err) { url = ""; }
        if (url) a.setAttribute("href", url);
        else { e.preventDefault(); accMsg("VibeHub 还没初始化 —— 先点一次「登录 / 重新授权」", "err"); }
      }
    });
  }

  /* ---------- 公告 ----------
     正文放在 index.html 旁边的 Announcement/Announcement.txt，
     改这个文件就能换公告内容，不用动代码、也不用重新打包。
     两个名字都试一遍，免得文件名差一个点就整篇读不出来。 */
  const ANN_URLS = ["Announcement/Announcement.txt", "Announcement/Announcementtxt"];
  const ANN_EMPTY = "还没有公告。\n\n（把公告内容写进 Announcement/Announcement.txt，保存后重新打开这个面板就能看到。）";
  let annCache = null;
  function fetchOne(url) {
    return fetch(url, { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error(String(r.status)); return r.text(); })
      .then(function (t) { return String(t || "").replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n"); });
  }
  function loadAnnounce() {
    if (annCache !== null) return Promise.resolve(annCache);
    let chain = Promise.reject(new Error("none"));
    for (const u of ANN_URLS) chain = chain.catch(() => fetchOne(u));
    return chain
      .then(function (t) {
        // 读到了内容才缓存；空的话下次打开还能再试一次
        if (t && t.trim()) annCache = t;
        return t;
      })
      .catch(function () { return ""; });
  }
  function openAnnounce() {
    if (!el.announce) return;
    show(el.announce);
    if (el.annBody) { el.annBody.textContent = "正在读取公告…"; el.annBody.scrollTop = 0; }
    loadAnnounce().then(function (t) {
      if (el.annBody) el.annBody.textContent = (t && t.trim()) ? t : ANN_EMPTY;
    });
  }
  function closeAnnounce() { if (el.announce) hide(el.announce); }
  if (el.annBtn) el.annBtn.addEventListener("click", () => openAnnounce());
  if (el.annClose) el.annClose.addEventListener("click", () => closeAnnounce());
  if (el.announce) el.announce.addEventListener("click", (e) => { if (e.target === el.announce) closeAnnounce(); });
  // 登录 / 注册：先选模式（选中的那个按钮放大），再点下方"确认"
  let accMode = "login";
  function renderAccMode() {
    const on = accMode === "reg";
    if (el.accTabLogin) {
      el.accTabLogin.classList.toggle("on", !on);
      el.accTabReg.classList.toggle("on", on);
    }
    if (el.accConfirm) el.accConfirm.textContent = on ? "注册并登录" : "登录";
    if (el.accPwd) el.accPwd.setAttribute("autocomplete", on ? "new-password" : "current-password");
  }
  if (el.accTabLogin) el.accTabLogin.addEventListener("click", () => { accMode = "login"; renderAccMode(); });
  if (el.accTabReg) el.accTabReg.addEventListener("click", () => { accMode = "reg"; renderAccMode(); });
  if (el.accConfirm) el.accConfirm.addEventListener("click", () => accSubmit(accMode));
  renderAccMode();
  if (el.accOut) el.accOut.addEventListener("click", () => {
    if (window.Cloud) Cloud.logout();
    accMsg("已退出登录", "ok");
    renderAccount();
  });
  if (el.accSync) el.accSync.addEventListener("click", () => {
    if (!window.Cloud) return;
    accMsg("同步中...");
    Cloud.syncNow().then((okk) => accMsg(okk ? "已同步到云端" : "同步失败，稍后再试", okk ? "ok" : "err"));
  });
  if (el.accPwd) el.accPwd.addEventListener("keydown", (e) => {
    if (e.key === "Enter") accSubmit(accMode);
  });
  if (el.accNick) el.accNick.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && el.accPwd) el.accPwd.focus();
  });

  // ===========================================================
  // 挤号：申请方 / 已登录方 两侧
  // ===========================================================
  let lrWaitTimer = null;
  function openLoginRequest(nick, pwd) {
    const p = document.getElementById("lreq");
    if (!p) return;
    p.classList.remove("hidden");
    const msg = document.getElementById("lreq-msg");
    // 云端的挤号函数没建好时如实说明 —— 否则玩家会以为是功能坏了
    if (window.Cloud && Cloud.lrLocalOnly) {
      const tip = document.getElementById("lreq-tip");
      if (tip) tip.textContent = "（未配置云端挤号函数，目前只能检测同一浏览器的多开）";
    }
    const ta = document.getElementById("lreq-reason");
    if (msg) msg.textContent = "";
    if (ta) { ta.value = ""; ta.focus(); }
    const send = document.getElementById("lreq-send");
    const cancel = document.getElementById("lreq-cancel");
    if (send) { send.disabled = false; send.textContent = "发送申请"; send.onclick = () => doSendReq(nick, pwd); }
    if (cancel) cancel.onclick = () => closeLoginRequest();
  }
  function closeLoginRequest() {
    const p = document.getElementById("lreq");
    if (p) p.classList.add("hidden");
    if (lrWaitTimer) { clearInterval(lrWaitTimer); lrWaitTimer = null; }
  }
  function doSendReq(nick, pwd) {
    const ta = document.getElementById("lreq-reason");
    const msg = document.getElementById("lreq-msg");
    const send = document.getElementById("lreq-send");
    const reason = (ta && ta.value || "").trim() || "（对方没填理由）";
    const reqId = "r" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    if (send) { send.disabled = true; send.textContent = "已发送 · 等待对方同意"; }
    if (msg) msg.textContent = "申请已发出，等对方点同意……";
    Cloud.lrSend(nick, reqId, reason).then(() => {
      let waited = 0;
      if (lrWaitTimer) clearInterval(lrWaitTimer);
      lrWaitTimer = setInterval(() => {
        waited += 2;
        Cloud.lrCheck(reqId).then((stt) => {
          if (stt === "ok") {
            clearInterval(lrWaitTimer); lrWaitTimer = null;
            closeLoginRequest();
            accMsg("对方同意了 —— 正在登录……");
            // 对方正在玩的话，这里会把游戏数据一起拉下来
            Cloud.login(nick, pwd).then((u) => {
              Cloud.syncNow();
              if (msg) msg.textContent = "";
              onLogined(u);
            }).catch((e) => accMsg(e.message || "登录失败", "err"));
          } else if (stt === "no") {
            clearInterval(lrWaitTimer); lrWaitTimer = null;
            if (msg) msg.textContent = "对方拒绝了这次申请。";
            if (send) { send.disabled = false; send.textContent = "重新发送申请"; }
          } else if (waited >= 120) {                    // 等了 2 分钟没人理
            clearInterval(lrWaitTimer); lrWaitTimer = null;
            if (msg) msg.textContent = "对方一直没有回应，申请已超时。";
            if (send) { send.disabled = false; send.textContent = "重新发送申请"; }
          }
        });
      }, 2000);
    });
  }

  // 已登录那一边：有人申请挤号
  let askClicks = 0, askReady = false;
  function showLoginAsk(r) {
    const p = document.getElementById("lreq-ask");
    if (!p || !r || !r.req_id) return;
    if (!p.classList.contains("hidden")) return;        // 已经在处理一份了，别叠
    p.classList.remove("hidden");
    askClicks = 0; askReady = false;
    const rn = document.getElementById("lreq-ask-reason");
    const nk = document.getElementById("lreq-ask-nick");
    const msg = document.getElementById("lreq-ask-msg");
    const ok = document.getElementById("lreq-ok");
    if (rn) rn.textContent = r.reason || "（没填理由）";
    if (nk) nk.textContent = (window.Cloud && Cloud.user && Cloud.user.nickname) || "";
    if (ok) {
      ok.disabled = true;
      ok.textContent = "确定";
      // 3 秒之后才让点，防止手滑
      let left = 3;
      if (msg) msg.textContent = "看清是谁、看清理由 —— " + left + " 秒后才能操作";
      const tick = setInterval(() => {
        left--;
        if (left > 0) { if (msg) msg.textContent = "看清是谁、看清理由 —— " + left + " 秒后才能操作"; return; }
        clearInterval(tick);
        askReady = true;
        if (ok) ok.disabled = false;
        if (msg) msg.textContent = "同意要连点两次「确定」。同意后你会被挤下线。";
      }, 1000);
      ok.onclick = () => {
        if (!askReady) return;
        askClicks++;
        if (askClicks === 1) {
          if (msg) msg.textContent = "再点一次「确定」就真的同意了 —— 你会被挤下线。";
          ok.textContent = "确定（再点一次）";
          return;
        }
        // 两次都点了：同意
        Cloud.lrReply(r.req_id, true);
        p.classList.add("hidden");
        if (window.Cloud) Cloud.logout();
        accMsg("已同意对方的申请 —— 你已退出登录", "ok");
        renderAccount();
      };
    }
    const no = document.getElementById("lreq-no");
    if (no) no.onclick = () => {
      Cloud.lrReply(r.req_id, false);
      p.classList.add("hidden");
      if (msg) msg.textContent = "";
    };
  }
  // 登录后开始盯着别人的申请
  window.startLoginWatch = function () { startLoginWatch(); };
  function startLoginWatch() {
    if (!window.Cloud || !Cloud.lrWatch) return;
    Cloud.lrWatch((r) => { try { showLoginAsk(r); } catch (e) { /* 忽略 */ } });
  }

  // 笑魇突脸图片开关：由设置面板控制（默认开）。关掉之后被笑魇杀死只响音效、不弹图。
  let scareImgOn = true;

  // 进关卡之后还要不要接着放背景音乐（默认要）。
  // 以前 createGame() 一上来就无条件淡出菜单音乐，所以"游戏里"永远听不到背景音乐 ——
  // 主菜单那一段明明是响的，一开局就没了。现在由这个开关决定。
  let bgmInGameOn = true;

  // ---------- 设置：音效 / 背景音乐 的音量与开关 ----------
  {
    const KEY = "br_set_v1";
    const st = { sfx: 80, bgm: 55, amb: 70, sfxOn: true, bgmOn: true, ambOn: true, track: 1, scareImg: true, bgmInGame: true };
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { const o = JSON.parse(raw); if (o && typeof o === "object") Object.assign(st, o); }
    } catch (e) { /* 读不到就用默认 */ }
    const saveSet = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* 忽略 */ } };
    const applySet = () => {
      // 音效：整体音量；关掉则静音
      // 注意：AudioSys 是 const 声明的，不会挂到 window 上 —— 用 typeof 判断
      if (typeof AudioSys !== "undefined" && AudioSys) {
        AudioSys.setSfxEnabled(st.sfxOn);
        AudioSys.setSfxVolume(st.sfx / 100);
        AudioSys.setMusicEnabled(st.bgmOn);
        AudioSys.setMusicVolume(st.bgm / 100);
        // 第二首：music/music_2.mp3（在设置里切换）
        if (AudioSys.setMusicTrack) AudioSys.setMusicTrack(st.track === 2 ? 2 : 1);
        // 进关卡后是否继续放背景音乐
        if (typeof bgmInGameOn !== "undefined") bgmInGameOn = st.bgmInGame !== false;
        // 环境音：层级杂音 + Level 5 的收音机
        if (AudioSys.setAmbientEnabled) AudioSys.setAmbientEnabled(st.ambOn);
        if (AudioSys.setAmbientVolume) AudioSys.setAmbientVolume(st.amb / 100);
      }
    };
    const renderSet = () => {
      if (el.setSfx) el.setSfx.value = String(st.sfx);
      if (el.setSfxN) el.setSfxN.textContent = String(st.sfx);
      if (el.setBgm) el.setBgm.value = String(st.bgm);
      if (el.setBgmN) el.setBgmN.textContent = String(st.bgm);
      if (el.setSfxOn) { el.setSfxOn.textContent = st.sfxOn ? "开" : "关"; el.setSfxOn.classList.toggle("on", st.sfxOn); }
      if (el.setBgmOn) { el.setBgmOn.textContent = st.bgmOn ? "开" : "关"; el.setBgmOn.classList.toggle("on", st.bgmOn); }
      if (el.setBgmInGame) { el.setBgmInGame.textContent = st.bgmInGame === false ? "关" : "开"; el.setBgmInGame.classList.toggle("on", st.bgmInGame !== false); }
      if (el.setAmb) el.setAmb.value = String(st.amb);
      if (el.setAmbN) el.setAmbN.textContent = String(st.amb);
      if (el.setAmbOn) { el.setAmbOn.textContent = st.ambOn ? "开" : "关"; el.setAmbOn.classList.toggle("on", st.ambOn); }
      // 曲目：第 1 首 main_music.mp3 / 第 2 首 music_2.mp3
      if (el.setTrack) el.setTrack.textContent = st.track === 2 ? "第 2 首" : "第 1 首";
      scareImgOn = st.scareImg !== false;
      if (el.setScareImg) {
        el.setScareImg.textContent = scareImgOn ? "开" : "关";
        el.setScareImg.classList.toggle("on", scareImgOn);
      }
      // 上传数据至排行榜：开关本身存在 Cloud 里（未登录也要能关）
      const upOn = !(window.Cloud && Cloud.rateUploadOn && !Cloud.rateUploadOn());
      if (el.setRateUp) {
        el.setRateUp.textContent = upOn ? "开" : "关";
        el.setRateUp.classList.toggle("on", upOn);
      }
    };
    // 对局里也能打开设置 —— 打开的时候先把游戏停住，别让人调音量时被咬死
    const openSet = () => {
      if (el.settings) el.settings.classList.remove("hidden");
      renderSet();
      if (game && (game.phase === "playing" || game.phase === "reading")) {
        game.setReturn = game.phase;
        game.phase = "paused";
      }
    };
    const closeSet = () => {
      if (el.settings) el.settings.classList.add("hidden");
      if (game && game.setReturn) { game.phase = game.setReturn; game.setReturn = null; }
    };
    // 给 HUD 上的「设置」和暂停面板里的「设置」用
    window.__openSettings = openSet;
    window.__closeSettings = closeSet;
    window.__settingsOpen = () => !!(el.settings && !el.settings.classList.contains("hidden"));
    if (el.setBtn) el.setBtn.addEventListener("click", () => openSet());
    if (el.hudSetBtn) el.hudSetBtn.addEventListener("click", () => openSet());
    if (el.pauseSetBtn) el.pauseSetBtn.addEventListener("click", () => openSet());
    if (el.setClose) el.setClose.addEventListener("click", () => closeSet());
    // 兜底：手机上万一面板被挤到屏幕外，点遮罩空白处 / 按 Esc 也能退出来
    if (el.settings) el.settings.addEventListener("click", (e) => {
      if (e.target === el.settings) closeSet();
    });
    if (el.setSfx) el.setSfx.addEventListener("input", () => {
      st.sfx = parseInt(el.setSfx.value, 10) || 0; if (!st.sfxOn && st.sfx > 0) { st.sfxOn = true; }
      renderSet(); applySet(); saveSet();
    });
    if (el.setBgm) el.setBgm.addEventListener("input", () => {
      st.bgm = parseInt(el.setBgm.value, 10) || 0; if (!st.bgmOn && st.bgm > 0) { st.bgmOn = true; }
      renderSet(); applySet(); saveSet();
    });
    if (el.setSfxOn) el.setSfxOn.addEventListener("click", () => {
      st.sfxOn = !st.sfxOn; renderSet(); applySet(); saveSet();
    });
    if (el.setAmb) el.setAmb.addEventListener("input", () => {
      st.amb = parseInt(el.setAmb.value, 10) || 0; if (!st.ambOn && st.amb > 0) { st.ambOn = true; }
      applySet(); renderSet(); saveSet();
    });
    if (el.setAmbOn) el.setAmbOn.addEventListener("click", () => {
      st.ambOn = !st.ambOn; applySet(); renderSet(); saveSet();
    });
    if (el.setBgmOn) el.setBgmOn.addEventListener("click", () => {
      st.bgmOn = !st.bgmOn; renderSet(); applySet(); saveSet();
    });
    if (el.setBgmInGame) el.setBgmInGame.addEventListener("click", () => {
      st.bgmInGame = !(st.bgmInGame !== false); renderSet(); applySet(); saveSet();
      toast(st.bgmInGame ? "游戏开始后继续播放背景音乐" : "游戏开始后停掉背景音乐");
    });
    if (el.setScareImg) el.setScareImg.addEventListener("click", () => {
      scareImgOn = !scareImgOn; st.scareImg = scareImgOn; renderSet(); saveSet();
    });
    if (el.setRateUp) el.setRateUp.addEventListener("click", () => {
      const now = !(window.Cloud && Cloud.rateUploadOn && Cloud.rateUploadOn());
      try { if (window.Cloud && Cloud.setRateUpload) Cloud.setRateUpload(now); } catch (e) { /* 忽略 */ }
      renderSet();
      toast(now ? "已开启：会继续上传通关记录" : "已关闭：不再上传通关记录（已上传的不会清除）");
    });
    if (el.setTrack) el.setTrack.addEventListener("click", () => {
      st.track = st.track === 2 ? 1 : 2;
      renderSet(); applySet(); saveSet();
    });
    renderSet(); applySet();
  }

  // ---------- 通关率排行榜 ----------
  // 右上角点「排行榜」打开。每一层显示：进去过多少次、通关了多少次、百分比。
  const rankRefreshing = { busy: false };
  // 层级名：name 自带「Level 0 —— 阈界」这种完整写法，就不必再拼 label，
  // 否则会变成「LEVEL 0 · Level 0 —— 阈界」这样重复两遍。
  function levelNameOf(lv) {
    try {
      const d = levelDef(lv);
      if (!d) return "Level " + lv;
      const nm = String(d.name || "");
      if (nm.indexOf("Level") >= 0) return nm;
      return (d.label ? d.label + " · " : "") + nm;
    } catch (e) { return "Level " + lv; }
  }
  function renderRank(rows) {
    const body = el.rankBody;
    if (!body) return;
    if (!rows || !rows.length) {
      body.innerHTML = '<div class="rank-empty">还没有数据 —— 先在里面走几层吧。</div>';
      return;
    }
    let html = "";
    rows.forEach((r, i) => {
      const tries = Number(r.tries) || 0, clears = Number(r.clears) || 0;
      const rate = tries > 0 ? (100 * clears / tries) : 0;
      const pct = (Math.round(rate * 10) / 10).toFixed(1) + "%";
      html += '<div class="rank-row">'
        + '<span class="rank-no">' + (i + 1) + '</span>'
        + '<span class="rank-lv">' + escapeHtml(levelNameOf(r.level)) + '</span>'
        + '<span class="rank-bar"><i style="width:' + Math.max(0, Math.min(100, rate)).toFixed(1) + '%"></i></span>'
        + '<span class="rank-pct">' + pct + '</span>'
        + '<span class="rank-num">' + clears + " / " + tries + '</span>'
        + '</div>';
    });
    body.innerHTML = html;
  }
  function refreshRank() {
    if (rankRefreshing.busy) return;
    rankRefreshing.busy = true;
    if (el.rankState) el.rankState.textContent = "正在读取 …";
    const done = (rows, err) => {
      rankRefreshing.busy = false;
      renderRank(rows || []);
      if (el.rankState) {
        const up = !(window.Cloud && Cloud.rateUploadOn && !Cloud.rateUploadOn());
        el.rankState.textContent = (err ? "读不到榜单 —— 云端还没配好（sql/cloudbase-rate.sql）"
          : (rows && rows.length ? ("共 " + rows.length + " 层有数据 · 上传：" + (up ? "开" : "关"))
            : "暂无数据 · 上传：" + (up ? "开" : "关")));
      }
    };
    if (window.Cloud && Cloud.rateGet) {
      Cloud.rateGet().then((rows) => done(rows, false)).catch(() => done([], true));
    } else done([], true);
  }
  function openRank() {
    if (!el.rank) return;
    el.rank.classList.remove("hidden");
    refreshRank();
  }
  function closeRank() { if (el.rank) el.rank.classList.add("hidden"); }
  if (el.rankBtn) el.rankBtn.addEventListener("click", () => openRank());
  if (el.menuRankBtn) el.menuRankBtn.addEventListener("click", (e) => { e.stopPropagation(); openRank(); });
  if (el.rankClose) el.rankClose.addEventListener("click", () => closeRank());
  if (el.rankRefresh) el.rankRefresh.addEventListener("click", () => refreshRank());
  if (el.rank) el.rank.addEventListener("click", (e) => { if (e.target === el.rank) closeRank(); });
  // B.N.T.G 柜台
  if (el.bntgClose) el.bntgClose.addEventListener("click", () => closeBntgShop());
  if (el.coffeeClose) el.coffeeClose.addEventListener("click", () => closeCoffeeCart());
  if (el.coffee) el.coffee.addEventListener("click", (e) => { if (e.target === el.coffee) closeCoffeeCart(); });
  if (el.coffeeReset) el.coffeeReset.addEventListener("click", () => {
    COFFEE_MIX = { sugar: 0, milk: 0, cream: 0 };
    try { AudioSys.pickup(); } catch (e) { /* 忽略 */ }
    renderCoffeeCart();
  });
  if (el.coffeeDrink) el.coffeeDrink.addEventListener("click", () => drinkCoffee());
  if (el.bntg) el.bntg.addEventListener("click", (e) => { if (e.target === el.bntg) closeBntgShop(); });
  // ---- Level 4 办公电脑 ----
  if (el.pc4Close) el.pc4Close.addEventListener("click", () => closePc4());
  if (el.pc601Close) el.pc601Close.addEventListener("click", () => closePc601());
  if (el.pc601Start) el.pc601Start.addEventListener("click", () => { pc601CloseApp(); pc601RenderDesktop(); });
  if (el.pc601) el.pc601.addEventListener("click", (e) => { if (e.target === el.pc601) closePc601(); });
  if (el.pc4Start) el.pc4Start.addEventListener("click", () => { pc4CloseApp(); pc4RenderDesktop(); });
  if (el.pc4) el.pc4.addEventListener("click", (e) => { if (e.target === el.pc4) closePc4(); });
  if (el.confessDone) el.confessDone.addEventListener("click", () => confessFinish());
  // ---- Level 15.1 仿真设备：模拟内容选择 ----
  if (el.simselClose) el.simselClose.addEventListener("click", () => closeSimSelect());
  if (el.simsel) el.simsel.addEventListener("click", (e) => { if (e.target === el.simsel) closeSimSelect(); });
  // 赫尔墨斯的「收起」一直没接上，只能靠 ESC —— 这里补上
  if (el.hermesClose) el.hermesClose.addEventListener("click", () => closeHermes());

  // ---------- 适龄提示图片：自动缩放到 28% ----------
  // 图不在（img/ 还是空的）就退化成一行可点的文字，别露出破图。
  // maxH：图太高会把整行按钮撑起来，所以再按高度封顶（宽度仍按 scale 走）
  function fitSlts(img, txtEl, scale, maxH) {
    if (!img) return;
    const hide = () => { img.style.display = "none"; if (txtEl) txtEl.style.display = ""; };
    const show = () => {
      const w = img.naturalWidth, h = img.naturalHeight;
      if (!w || !h) { hide(); return; }
      let tw = w * scale, th = h * scale;
      if (maxH && th > maxH) { th = maxH; tw = w * (maxH / h); }
      img.style.width = Math.max(1, Math.round(tw)) + "px";
      img.style.height = Math.max(1, Math.round(th)) + "px";
      img.style.display = "";
      if (txtEl) txtEl.style.display = "none";
    };
    img.addEventListener("load", show);
    img.addEventListener("error", hide);
    if (img.complete) (img.naturalWidth ? show : hide)();
  }
  // 忠告画面：按屏幕高度封顶（原图常常比整段文字还高，太抢眼）
  fitSlts(el.hlSlts, el.hlSltsCap, 0.5, 96);
  fitSlts(el.menuSlts, el.menuSltsTxt, 0.28, 28); // 主菜单：缩到 28%，且不超过 28px 高
  // 不再随转屏重算，尺寸永远一致

  // ---------- 适龄说明 ----------
  function openSlts() { if (el.slts) el.slts.classList.remove("hidden"); }
  function closeSlts() { if (el.slts) el.slts.classList.add("hidden"); }
  if (el.hlSlts) el.hlSlts.addEventListener("click", (e) => { e.stopPropagation(); openSlts(); });
  if (el.hlSltsCap) el.hlSltsCap.addEventListener("click", (e) => { e.stopPropagation(); openSlts(); });
  if (el.menuSlts) el.menuSlts.addEventListener("click", (e) => { e.stopPropagation(); openSlts(); });
  if (el.menuSltsTxt) el.menuSltsTxt.addEventListener("click", (e) => { e.stopPropagation(); openSlts(); });
  if (el.sltsClose) el.sltsClose.addEventListener("click", () => closeSlts());
  if (el.sltsOk) el.sltsOk.addEventListener("click", () => closeSlts());
  if (el.slts) el.slts.addEventListener("click", (e) => { if (e.target === el.slts) closeSlts(); });

  // ---------- 开发者：显示玩家所在地图全貌 ----------
  // 把整张地图缩略画出来 —— 墙 / 地面 / 水 / 门 / 出口 / 玩家 / 实体一图看清。
  // 多层级的可以切楼层，还能导出成 PNG。
  const mapv = { floor: 0, open: false };

  function mapvDraw() {
    const cv = el.mapvCv;
    if (!cv || !game || !game.map) return;
    const m = game.map;
    const sz = m.size;
    const floors = Math.max(1, (m.floors && m.floors.length) || 1);
    mapv.floor = clamp(mapv.floor, 0, floors - 1);
    const f = mapv.floor;
    const layer = (m.layers && m.layers[f]) || (m.layers && m.layers[0]);
    if (!layer) return;
    // 一格 8px，太大就限幅（最大 760px）
    const T = Math.max(2, Math.min(8, Math.floor(760 / Math.max(1, sz))));
    cv.width = sz * T; cv.height = sz * T;
    const c = cv.getContext("2d");
    c.fillStyle = "#0b0d0a"; c.fillRect(0, 0, cv.width, cv.height);

    const isWater = (x, y) => !!(m.pools && m.pools.has(x + "," + y));
    const isDoor = (x, y) => !!(m.closedDoors && m.closedDoors.has(f + ":" + x + "," + y));

    for (let y = 0; y < sz; y++) {
      for (let x = 0; x < sz; x++) {
        const v = layer[y] && layer[y][x];
        let col = "#3a4048";                       // 墙
        if (v === 0) col = isWater(x, y) ? "#9fd4dd" : "#e6e9ee";
        else if (v === 2) col = "#7c6a3a";         // 特殊地面（斜坡等）
        if (m.airWalls && m.airWalls.has(x + "," + y)) col = "#15181c";
        if (isDoor(x, y)) col = "#d9c95e";
        c.fillStyle = col;
        c.fillRect(x * T, y * T, T, T);
      }
    }
    // 出口 / 特殊物件
    // 出口画成单独一种颜色（品红），一眼就能从一堆普通物件里挑出来 ——
    // 以前出口和普通物件共用黄色，看全图根本分不清哪几处能离开这一层。
    const EXITISH = new Set(["citydoor", "cave9", "suburb9", "fieldpath", "alley10", "stairs6", "stairs7",
      "stair4", "elevator", "elevator4", "stairwell", "deep6", "cave7", "rope", "apartment13",
      "window12", "exist11", "door37", "guarddoor25", "exitdoor", "exitgap", "neonfog11",
      "hole", "vent02", "vent03", "arcade", "irondoor04", "exclamdoor109", "glassdoor119",
      "frontDoor900", "frontdoor900", "backdoor900"]);
    const isExitProp = (p) => p.toLevel != null || p.to != null || p.target != null
      || p.goTo != null || EXITISH.has(p.type);
    for (const p of (m.props || [])) {
      if (!p || p.x == null) continue;
      if (p.floor != null && (p.floor | 0) !== f) continue;
      if (isExitProp(p)) {
        c.fillStyle = "#ff4fd8";                     // 出口：品红
        c.fillRect(p.x * T - 1, p.y * T - 1, T + 2, T + 2);
      } else {
        c.fillStyle = "#7f8a99";                     // 普通物件：灰蓝
        c.fillRect(p.x * T, p.y * T, T, T);
      }
    }
    // 箱子 / 地上的东西
    for (const cr of (m.crates || [])) {
      if (!cr || cr.x == null) continue;
      if (cr.floor != null && (cr.floor | 0) !== f) continue;
      c.fillStyle = "#8a6a3a";
      c.fillRect(cr.x * T, cr.y * T, T, T);
    }
    for (const gd of (m.ground || [])) {
      if (!gd || gd.x == null) continue;
      if (gd.floor != null && (gd.floor | 0) !== f) continue;
      c.fillStyle = "#6ad06a";
      c.fillRect(gd.x * T, gd.y * T, T, T);
    }
    // 实体
    for (const e of (game.entities || [])) {
      if (!e || e.x == null) continue;
      if ((e.floor | 0) !== f) continue;
      const gx = Math.floor(e.x / TILE), gy = Math.floor(e.y / TILE);
      c.fillStyle = "#ff9c3a";
      c.fillRect(gx * T - 1, gy * T - 1, T + 2, T + 2);
    }
    // 玩家
    if (game.player && (game.player.floor | 0) === f) {
      const gx = Math.floor(game.player.x / TILE), gy = Math.floor(game.player.y / TILE);
      c.fillStyle = "#ff5a4a";
      c.fillRect(gx * T - 2, gy * T - 2, T + 4, T + 4);
    }
    if (el.mapvFloor) el.mapvFloor.textContent = floors > 1 ? (f + " / " + (floors - 1)) : String(f);
    if (el.mapvInfo) {
      let n = 0;
      for (let y = 0; y < sz; y++) for (let x = 0; x < sz; x++) if (layer[y][x] === 0) n++;
      el.mapvInfo.textContent = "size " + sz + " · 可走 " + n
        + (m.pools ? " · 水 " + m.pools.size : "")
        + " · 实体 " + (game.entities || []).length;
    }
  }

  function openMapView() {
    if (!el.mapview) return;
    if (!game || !game.map) { toast("还没有正在进行的游戏"); return; }
    mapv.open = true;
    mapv.floor = game.player ? (game.player.floor | 0) : 0;
    el.mapview.classList.remove("hidden");
    if (el.mapvTitle) {
      const d = levelDef(game.level);
      el.mapvTitle.textContent = "地图全貌 · " + (d ? levelCodeName(game.level) : String(game.level));
    }
    mapvDraw();
  }
  function closeMapView() {
    mapv.open = false;
    if (el.mapview) el.mapview.classList.add("hidden");
  }
  window.__openMapView = openMapView;
  if (el.mapvClose) el.mapvClose.addEventListener("click", () => closeMapView());
  if (el.mapview) el.mapview.addEventListener("click", (e) => { if (e.target === el.mapview) closeMapView(); });
  if (el.mapvFup) el.mapvFup.addEventListener("click", () => { mapv.floor--; mapvDraw(); });
  if (el.mapvFdn) el.mapvFdn.addEventListener("click", () => { mapv.floor++; mapvDraw(); });
  if (el.mapvSave) el.mapvSave.addEventListener("click", () => {
    const cv = el.mapvCv; if (!cv) return;
    try {
      const a = document.createElement("a");
      a.href = cv.toDataURL("image/png");
      a.download = "map_" + String(game.level).replace(/[^0-9a-zA-Z.\-]/g, "_") + "_f" + mapv.floor + ".png";
      a.click();
      toast("已导出 PNG");
    } catch (e) { toast("导出失败 —— 画布被跨域污染了"); }
  });

  // ---------- 健康游戏忠告：进游戏后的第一个画面 ----------
  // 黑底白字，几秒后自动进入开屏；也可以点一下立刻跳过。
  // 点适龄提示图片不算"跳过" —— 它要打开适龄说明。
  // 忠告画面的倒计时已经交给 index.html 里那段内联脚本了 —— 它在 HTML 解析时
  // 就开始跑，不用等 main.js（760KB）下载执行。这里只在内联脚本没生效时兜底
  // （比如浏览器用了旧缓存的 html），绝不能两个倒计时一起跑，否则会等 12 秒。
  window.__healthOpen = !!(el.health && !el.health.classList.contains("gone")
                                     && !el.health.classList.contains("hidden"));
  let hlLeft = 6;                 // 忠告剩余秒数（3 秒前锁住）
  const healthSkippable = () => hlLeft <= 3;
  function dismissHealth() {
    if (!el.health || el.health.classList.contains("gone")) return;
    el.health.classList.add("gone");
    window.__healthOpen = false;
  }
  if (el.health && !window.__healthInline) {
    el.health.addEventListener("click", (e) => {
      // 点在适龄提示上：交给它自己的处理（弹出适龄说明），不关忠告
      if (e.target === el.hlSlts || e.target === el.hlSltsCap) return;
      if (!healthSkippable()) { toast("请看完这段 —— 还差 " + Math.max(1, hlLeft - 3) + " 秒"); return; }
      dismissHealth();
    });
    // 前 3 秒不能跳过（点了只会提醒还差几秒），之后才能点掉；6 秒自动进入开屏
    const LOCK = 3, sec = 6;
    let left = sec;
    const repaint = () => {
      if (!el.hlCount) return;
      el.hlCount.textContent = left > LOCK
        ? left + " 秒后才能跳过"
        : left + " 秒后自动进入 · 点击任意处跳过";
    };
    repaint();
    const t = setInterval(() => {
      left--;
      if (el.health.classList.contains("gone")) { clearInterval(t); return; }
      hlLeft = left;
      if (left <= 0) { clearInterval(t); dismissHealth(); return; }
      repaint();
    }, 1000);
    // 兜底：万一脚本后面抛错了，也别把玩家锁在忠告画面上
    setTimeout(() => dismissHealth(), (sec + 4) * 1000);
  }

  // ---------- 在线人数（登录与未登录都计入）----------
  function renderOnline() {
    if (!el.onlineN || !window.Cloud) return;
    const n = Cloud.online || 0;
    el.onlineN.textContent = n > 0 ? String(n) : "—";
  }

  if (el.endToast) el.endToast.addEventListener("click", () => {
    if (endToastId != null) openEndingDoc(endToastId);
  });

  if (el.menuOutfitBtn) el.menuOutfitBtn.addEventListener("click", () => openOutfit());
  if (el.outfitCloseBtn) el.outfitCloseBtn.addEventListener("click", () => closeOutfit());




  // 1.3.4：上方那盏灯连同它的嗡嗡声、噼啪声一起删掉了，主菜单不再有灯的声音。

  // ---------- 主菜单：铺满全屏的背景图随鼠标小幅跟随 ----------
  {
    const art = document.getElementById("menu-bg");
    const wrap = document.getElementById("menu");
    if (art && wrap && window.matchMedia("(hover: hover)").matches) {
      wrap.addEventListener("mousemove", (e) => {
        const r = wrap.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        art.style.transform = "translate(" + (-dx * 9).toFixed(1) + "px," + (-dy * 7).toFixed(1) + "px) scale(1.04)";
      });
      wrap.addEventListener("mouseleave", () => { art.style.transform = ""; });
    }
  }

  // ---------- Level 13 电梯：选择本层级内的楼层 ----------
  function openElevator(d) {
    const g = game;
    if (!g || !el.elevator) return;
    AudioSys.elevator();
    const floors = (g.map.aptFloors || []).slice().sort((a, b) => a.idx - b.idx);
    if (el.elevList) {
      el.elevList.innerHTML = "";
      for (const L of floors) {
        const cur = d.floorIdx != null ? L.idx === d.floorIdx : L.idx === 0;
        const b = document.createElement("button");
        b.type = "button";
        b.className = "elev-row" + (cur ? " cur" : "");
        b.innerHTML = '<span class="elev-n">' + (L.idx + 1) + " 层</span>" +
          '<span class="elev-tag">' + (cur ? "你现在就在这一层" : "前往这一层") + "</span>";
        if (!cur) {
          b.addEventListener("click", () => {
            hide(el.elevator);
            rideElevator(L);
          });
        } else {
          b.disabled = true;
        }
        el.elevList.appendChild(b);
      }
      // 继续下行：楼层数字一路变成负数 -> Level 70
      const dn = document.createElement("button");
      dn.type = "button";
      dn.className = "elev-row down";
      dn.innerHTML = '<span class="elev-n">继续下行</span>' +
        '<span class="elev-tag">楼层数字会一路变成负数 —— 那里是别的地方</span>';
      dn.addEventListener("click", () => {
        hide(el.elevator);
        startTransition("电梯开始下行", "楼层数字一路跳过了 0 —— 还在往下 ...", { kind: "toLevelX", level: 70 });
      });
      el.elevList.appendChild(dn);
    }
    show(el.elevator);
  }

  // 电梯在本层级内换层：把人送到那条走廊的电梯口
  function rideElevator(L) {
    const g = game;
    if (!g) return;
    AudioSys.door(true);
    g.player.x = (L.ex - 2 + 0.5) * TILE;
    g.player.y = (L.corrY + 1 + 0.5) * TILE;
    g.player.floor = 0;
    g.floor = 0;
    flashLevelToast("电梯停在 " + (L.idx + 1) + " 层", "门开了 —— 外面还是那条一模一样的走廊");
  }

  // ---------- Level 0.3：用喷枪化开冰块 ----------
  // 冰块在网格里是实心格，化开后要同步改网格 / 冰块集合 / 已探索，
  // 否则会出现"看着化了、走过去还是撞墙"。
  function meltIce(g, tx, ty) {
    const m = g.map;
    if (!m.ice || !m.ice.has(tx + "," + ty)) return;
    m.ice.delete(tx + "," + ty);
    const grid = m.layers[0];
    if (grid[ty] && grid[ty][tx] === 1) grid[ty][tx] = 0;
    // 记录到 floors，免得后面按旧地板表刷东西
    m.floors[0].push({ x: tx, y: ty });
    if (g.explored && g.explored[0] && g.explored[0][ty]) g.explored[0][ty][tx] = 1;
    // 整块化完了就把它从 iceBlocks 里去掉
    if (m.iceBlocks) {
      for (const b of m.iceBlocks) {
        let left = 0;
        for (let y = b.y; y < b.y + b.h; y++) {
          for (let x = b.x; x < b.x + b.w; x++) if (m.ice.has(x + "," + y)) left++;
        }
        if (left === 0) b.melted = true;
      }
    }
    AudioSys.steam ? AudioSys.steam() : AudioSys.door(true);
    flashLevelToast("冰块化了", "喷枪的火苗舔过冰面 —— 地上多了一滩水");
    g.nearIce = null;
  }

  // ---------- 云存档启动 ----------
  if (window.Cloud) {
    Cloud.startHeartbeat(() => (game ? levelLabel(game.level) : ""));
    Cloud.onChange(() => {
      renderOnline(); renderAccount(); refreshManualIfOpen();
      // 登录 / 登出之后昵称变了 —— 联机里显示的也跟着换
      try { if (window.Net && Net.refreshSelf) {
        Net.refreshSelf();
        if (window.LobbyRefreshBar) window.LobbyRefreshBar();
      } } catch (e) { /* 忽略 */ }
    });
    renderOnline(); renderAccount();
    Cloud.boot();
    // 已登录：开始盯着有没有别人申请挤这个号
    Cloud.onChange(() => {
      if (Cloud.isIn && Cloud.isIn()) startLoginWatch(); else if (Cloud.lrStopWatch) Cloud.lrStopWatch();
    });
    if (Cloud.isIn && Cloud.isIn()) startLoginWatch();
    // 注意：不要在关页面时无条件上传。若本地缓存被清过（比如手动清了浏览器数据），
    // 那次上传会用"空存档"覆盖云端。平时每次改动本来就会节流上传，不缺这一次。
  }

  // ---------- 左下角：帧率 / 延迟 ----------
  // 延迟取自联机往返；没联机就取云 RPC 的往返；都没有就显示 —
  function updatePerf(fps) {
    const n = el.perf;
    if (!n) return;
    if (!game || game.phase !== "playing") { n.classList.add("hidden"); return; }
    n.classList.remove("hidden");
    let ping = -1, tag = "";
    try {
      if (window.Net && Net.room && typeof Net.ping === "number" && Net.ping > 0) { ping = Net.ping; tag = "联机"; }
      else if (window.Cloud && typeof Cloud.ping === "number" && Cloud.ping > 0) { ping = Cloud.ping; tag = ""; }
    } catch (e) { /* 忽略 */ }
    const f = Math.round(fps);
    const cls = f >= 50 ? "" : (f >= 30 ? " p-warn" : " p-bad");
    const pcls = ping < 0 ? "" : (ping < 120 ? "" : (ping < 300 ? " p-warn" : " p-bad"));
    n.innerHTML = '<span class="' + cls + '">' + f + ' FPS</span>' +
      (ping < 0 ? ' <span style="opacity:.6">· 延迟 —</span>'
                : ' <span class="' + pcls + '">· 延迟 ' + Math.round(ping) + 'ms' + (tag ? "(" + tag + ")" : "") + '</span>');
  }

  // ---------- 主循环 ----------
  resize();
  setupTouch();
  let lastT = performance.now();
  // 帧率：滑动平均，别让数字抖得看不清
  let fpsAcc = 0, fpsN = 0, fpsVal = 60, perfAt = 0;
  function loop(now) {
    const dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;
    if (dt > 0) { fpsAcc += 1 / dt; fpsN++; }
    // 左下角那行小字每 500ms 刷一次就够了，每帧改 DOM 纯属浪费
    if (now - perfAt > 500) {
      perfAt = now;
      if (fpsN > 0) { fpsVal = fpsAcc / fpsN; fpsAcc = 0; fpsN = 0; }
      updatePerf(fpsVal);
    }
    // 任何一帧里出错都不能让主循环断掉 —— 否则画面会永久冻住。
    // 先把下一帧排上，再跑这一帧；真出错了也只是跳过这一帧。
    requestAnimationFrame(loop);
    // 警报只属于 Level ! —— 只要不在这一层（切层 / 死亡 / 结局 / 回主菜单 /
    // 退出这一局），就立刻停掉并把默认背景音乐放回来。
    // 放在主循环里而不是 update() 里：死亡、结局、回菜单之后 update 已经不跑了，
    // 写在里面根本轮不到执行，警报就会一直响下去。
    try {
      // 注意：打开设置 / 暂停面板会把 phase 变成 "paused"，翻档案是 "reading"、
      // 看手册是 "manual" —— 这些全都还在 Level ! 里，警报必须继续响。
      // 以前只判 "playing"，于是一打开设置就被当成"已经离开这一层"：警报被掐掉、
      // 默认背景音乐顺势顶上来；关掉设置后 phase 回到 playing，却没人再把警报
      // 拉起来（bangFreeze 已经归零，bangAlarm(true) 不会再触发一次）——
      // 这就是"打开设置之后背景音乐把 Level ! 的音乐占了、再也放不回来"的由来。
      const ph = game && game.phase;
      const inBang = !!game && String(game.level) === "bang"
        && (ph === "playing" || ph === "paused" || ph === "reading" || ph === "manual");
      if (AudioSys.alarmOn) {
        if (!inBang) { AudioSys.bangAlarm(false); if (game) game.bangAlarm = false; }
      } else if (inBang && game && game.bangAlarm) {
        // 自愈：这一层本该响警报却没响（上一帧被误判成离开），补回来。
        AudioSys.bangAlarm(true);
      }
    } catch (e) { /* 忽略 */ }
    // 层级各自的每帧逻辑（1.5 的低语 / 3.5 的静电放电）。
    // 放在 update 之后：玩家位置已经是这一帧最新的。
    try {
      if (game && game.phase === "playing" && window.__LEVEL_TICK) {
        const tk = window.__LEVEL_TICK[String(game.level)];
        if (tk) tk(game, dt);
      }
    } catch (e) { /* 忽略 */ }
    try {
      if (game && game.phase !== "paused") update(dt);
      render();
      // 录像：这一帧画面已经画完，按胶卷的帧率截一张（花屏只进录像带）
      try {
        if (window.CamRec) {
          CamRec.afterFrame(game, dt, canvas);
          if (window.DigiCam) DigiCam.afterFrame(game, dt, canvas);
          let done = CamRec.drainFinished();
          if (window.DigiCam) done = done.concat(DigiCam.drainFinished());
          if (done && done.length && game) {
            if (!game.tapeIds) game.tapeIds = [];
            for (const m of done) { game.tapeIds.push(m.id); addItem("tape", 1); }
            updateBag(); updateHud(); renderHotbar();
            toast("录像带收进背包了 —— 视频档案里能看，也能丢给别人");
          }
        }
      } catch (e) { /* 忽略 */ }
    } catch (err) {
      loopErrors++;
      if (loopErrors <= 3) console.error("[loop]", err);
    }
  }
  let loopErrors = 0;
  requestAnimationFrame(loop);

  // 告诉 index.html 里的加载进度条：脚本全部就位、界面也初始化好了，可以进忠告了。
  // 必须放在最后 —— 这是最后一个脚本之前的收尾，前面所有层级、界面都注册完了。
  // 万一前面抛错没走到这一行，进度条那边的 30 秒兜底会自己放行，不会卡住。
  try {
    window.__gameReady = true;
    // 直接通知进度条收尾，不等它下一轮轮询 —— 脚本一多，轮询间隔会被
    // 主线程阻塞拉长，等它自己发现要晚好几百毫秒。
    if (window.__loadFinish) window.__loadFinish();
  } catch (e) { /* 忽略 */ }
})();
