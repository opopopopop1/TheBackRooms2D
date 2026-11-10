"use strict";

function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

// ======== 程序化音效（WebAudio，无需外部资源） ========
const AudioSys = {
  ctx: null,
  master: null,
  muted: false,
  noiseBuffer: null,
  humGain: null,
  stepAlt: false,

  init() {
    if (this.ctx) {
      if (this.ctx.state === "suspended") this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.5;
    this.master.connect(this.ctx.destination);

    // 棕色噪声作为所有音效素材
    const n = this.ctx.sampleRate * 2;
    const buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < n; i++) {
      last = (last + (Math.random() * 2 - 1)) * 0.8;
      d[i] = last;
    }
    this.noiseBuffer = buf;
    this.startHum();
  },

  // 荧光灯低频嗡嗡声
  startHum() {
    if (!this.ctx) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = true;
    const lp = this.ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 180;
    lp.Q.value = 0.7;
    this.humGain = this.ctx.createGain();
    this.humGain.gain.value = 0.06;
    src.connect(lp);
    lp.connect(this.humGain);
    this.humGain.connect(this.master);
    src.start();
  },

  burstNoise(freq, gain, dur) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.playbackRate.value = 0.8 + Math.random() * 0.4;
    const f = this.ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f);
    f.connect(g);
    g.connect(this.master);
    src.start(t, Math.random() * 1.5, dur + 0.05);
  },

  playStep(mat, sprint) { this.footstep(mat, sprint); },

  // 踩进水里：真正的水花声。
  // 以前 water 走的是通用的"低频闷响 + 一点叩击"，听着就是一声闷闷的"噗"，
  // 跟踩在泥地上没区别 —— 玩家一说"不像"，问题就在这儿。
  // 真实的水花是三段叠在一起的：
  //   1. 鞋底拍在水面上的那一声"啪"（宽带噪声、极快衰减）
  //   2. 水被压下去又合拢的"咕咚"（低频、稍长）
  //   3. 溅起来的碎水滴（高频、很轻、拖在尾巴上）
  splash(sprint) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const vol = (sprint ? 1.25 : 1) * (0.85 + Math.random() * 0.3);
    this.stepAlt = !this.stepAlt;

    // 1) 拍击：带通从中频往下扫，模拟水面被压开
    const s1 = this.ctx.createBufferSource();
    s1.buffer = this.noiseBuffer;
    s1.playbackRate.value = 1.0 + Math.random() * 0.3;
    const bp = this.ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 0.9;
    bp.frequency.setValueAtTime(1900 * (this.stepAlt ? 1.08 : 0.94), t);
    bp.frequency.exponentialRampToValueAtTime(420, t + 0.12);
    const g1 = this.ctx.createGain();
    g1.gain.setValueAtTime(0.0001, t);
    g1.gain.exponentialRampToValueAtTime(0.30 * vol, t + 0.006);
    g1.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
    s1.connect(bp); bp.connect(g1); g1.connect(this.master);
    s1.start(t, Math.random() * 1.5, 0.2);

    // 2) 合拢的"咕咚"：低频，衰减慢一点
    const s2 = this.ctx.createBufferSource();
    s2.buffer = this.noiseBuffer;
    s2.playbackRate.value = 0.55;
    const lp2 = this.ctx.createBiquadFilter();
    lp2.type = "lowpass";
    lp2.frequency.value = 300;
    const g2 = this.ctx.createGain();
    g2.gain.setValueAtTime(0.0001, t + 0.01);
    g2.gain.exponentialRampToValueAtTime(0.17 * vol, t + 0.03);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);
    s2.connect(lp2); lp2.connect(g2); g2.connect(this.master);
    s2.start(t, Math.random() * 1.5, 0.3);

    // 3) 溅起的碎水滴：高频、很轻、晚一点点出来
    const t3 = t + 0.045 + Math.random() * 0.03;
    const s3 = this.ctx.createBufferSource();
    s3.buffer = this.noiseBuffer;
    s3.playbackRate.value = 1.6;
    const hp3 = this.ctx.createBiquadFilter();
    hp3.type = "highpass";
    hp3.frequency.value = 3200;
    const g3 = this.ctx.createGain();
    g3.gain.setValueAtTime(0.0001, t3);
    g3.gain.exponentialRampToValueAtTime(0.075 * vol, t3 + 0.008);
    g3.gain.exponentialRampToValueAtTime(0.0001, t3 + 0.10);
    s3.connect(hp3); hp3.connect(g3); g3.connect(this.master);
    s3.start(t3, Math.random() * 1.5, 0.14);
  },

  // 脚步声：区分地面材质（carpet/concrete/metal），左右脚交替 + 随机微调 + 金属回响
  footstep(mat, sprint) {
    if (!this.ctx || this.muted) return;
    // 踩在水里走的是专门的 splash()，不走下面那套"闷响 + 叩击"
    if (mat === "water") { this.splash(sprint); return; }
    const t = this.ctx.currentTime;
    this.stepAlt = !this.stepAlt;
    const defs = {
      carpet:   { thump: 260,  thumpG: 0.16, click: 1000,    clickG: 0,     dur: 0.11, vol: 25, echo: 0 },
      concrete: { thump: 520,  thumpG: 0.17, click: 1800, clickG: 0.035, dur: 0.07, vol: 25,  echo: 0 },
      metal:    { thump: 820,  thumpG: 0.17, click: 3200, clickG: 0.05,  dur: 0.05, vol: 25, echo: 0.7 },
      // 木地板（Level 5 的黑胡桃木）：温润的闷响 + 轻微的吱呀
      wood:     { thump: 340,  thumpG: 0.20, click: 2400, clickG: 0.022, dur: 0.09, vol: 26, echo: 0 },
      // 大理石（Level 5）：清脆、带着一点点回响
      marble:   { thump: 700,  thumpG: 0.15, click: 4200, clickG: 0.055, dur: 0.06, vol: 24, echo: 0.35 },
      // 泥土小径（Level 10）：沙沙的，几乎没有叩击
      dirt:     { thump: 300,  thumpG: 0.14, click: 5000, clickG: 0.012, dur: 0.10, vol: 24, echo: 0 },
      // 麦田：踩过庄稼的窸窣声
      grass:    { thump: 220,  thumpG: 0.11, click: 6500, clickG: 0.018, dur: 0.13, vol: 23, echo: 0 },
      // 涉水：低沉的啪嗒
      water:    { thump: 180,  thumpG: 0.22, click: 900,  clickG: 0.02,  dur: 0.14, vol: 27, echo: 0 },
      // 沥青马路（Level 11）：比混凝土更闷一点
      asphalt:  { thump: 460,  thumpG: 0.18, click: 1500, clickG: 0.028, dur: 0.08, vol: 25, echo: 0 },
      // 挤过茂密草丛（Level 10）：枝叶被拨开的沙沙声，比麦田更密更长
      bush:     { thump: 190,  thumpG: 0.13, click: 7200, clickG: 0.030, dur: 0.17, vol: 24, echo: 0 },
      // 雪：低频的闷响 + 高频的"咯吱"碎雪声，几乎没有回响
      snow:     { thump: 150,  thumpG: 0.15, click: 8600, clickG: 0.055, dur: 0.16, vol: 24, echo: 0 },
      // 冰沙（Level 0.3）：细碎的沙沙声 —— 比雪更干、更高频，不带咯吱的湿感
      icesand:  { thump: 210,  thumpG: 0.12, click: 7400, clickG: 0.042, dur: 0.12, vol: 24, echo: 0 },
      // 白色瓷砖（Level 21 编号门 / Level 26）：硬、脆、带一点回响，但不是铁板
      tile:     { thump: 300,  thumpG: 0.17, click: 2350, clickG: 0.020, dur: 0.09, vol: 26, echo: 0.13 },
      // 幼儿园的彩色地垫（Level 18）：踩上去是软的、几乎没有叩击，只有一点闷闷的噗声
      mat:      { thump: 140,  thumpG: 0.20, click: 1200, clickG: 0.006, dur: 0.13, vol: 21, echo: 0 },
      // 阁楼的旧木地板（Level 19）：干燥发脆，每一步都带一声长长的吱呀。
      // 之前 click 给到 2600Hz / 0.048，还带 0.18 的回响 —— 听起来就是 Level 2 的铁板。
      // 木头该是闷的：叩击降下来，高频收窄，回响几乎去掉，脚步拖长一点。
      oldwood:  { thump: 290,  thumpG: 0.22, click: 1450, clickG: 0.015, dur: 0.14, vol: 26, echo: 0.04 },
      // 沙滩（Level 994）：干沙是"噗"的一声，几乎没有叩击
      sand:     { thump: 165,  thumpG: 0.19, click: 5200, clickG: 0.030, dur: 0.15, vol: 23, echo: 0 },
      // 街机厅积灰的地毯（Level 25）：比 Level 0 更闷、更干
      arcade:   { thump: 185,  thumpG: 0.16, click: 1800, clickG: 0.012, dur: 0.13, vol: 22, echo: 0.06 },
      // ---- 1.2.0 批次 ----
      // 砂砾 / 尘土（Level 71 / 黯洃銫）：细碎的颗粒感，比泥土干、比雪闷
      gravel:   { thump: 240, thumpG: 0.15, click: 6100, clickG: 0.038, dur: 0.12, vol: 24, echo: 0 },
      // 998 的云层地面：坚硬但有"羊毛般的纹理" —— 闷、软、几乎没有叩击
      wool:     { thump: 150, thumpG: 0.18, click: 900,  clickG: 0.008, dur: 0.15, vol: 22, echo: 0.05 },
      // 悬空的钢格栅（深坑区的网格线）：踩上去是"哐"的一声空心铁响 ——
      // 铁条下面是空的，所以要有明显的金属余韵（不是实心的铁板，也不是闷闷的地毯）。
      // 以前直接用的是 metal —— 那正是 Level 2 管道梦魇的铁板声，玩家一听就串味。
      // 这里叩击压低但保留金属的高频"叮"，回响拉长，听得出脚下是架空的钢条。
      grate:    { thump: 430, thumpG: 0.16, click: 3400, clickG: 0.062, dur: 0.11, vol: 28, echo: 0.62 },
    };
    const m = defs[mat] || defs.concrete;
    const vol = m.vol * (sprint ? 1.3 : 1) * (0.9 + Math.random() * 0.2);
    // 左右脚交替时轻微的高低差，避免机械重复
    const rate = 0.85 + Math.random() * 0.3 + (this.stepAlt ? 0.06 : 0);
    const f = m.thump * (0.92 + Math.random() * 0.16);

    // 主体：低频闷响（thump）
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.playbackRate.value = rate;
    const lp = this.ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = f;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(m.thumpG * vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + m.dur);
    src.connect(lp); lp.connect(g); g.connect(this.master);
    src.start(t, Math.random() * 0.8, m.dur + 0.08);

    // 高频叩击（混凝土/金属的鞋底敲击感）
    if (m.clickG > 0) {
      const c = this.ctx.createBufferSource();
      c.buffer = this.noiseBuffer;
      c.playbackRate.value = rate * 1.4;
      const bp = this.ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = m.click * (0.9 + Math.random() * 0.2);
      bp.Q.value = 1.2; 
      const cg = this.ctx.createGain();
      cg.gain.setValueAtTime(m.clickG * vol, t);
      cg.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
      c.connect(bp); bp.connect(cg); cg.connect(this.master);
      c.start(t, Math.random() * 0.8, 0.06);
    }

    // 金属回响（管道梦魇里的回声）
    if (m.echo > 0) {
      const et = t + 0.055;
      const e = this.ctx.createBufferSource();
      e.buffer = this.noiseBuffer;
      e.playbackRate.value = rate * 0.7;
      const elp = this.ctx.createBiquadFilter();
      elp.type = "lowpass";
      elp.frequency.value = 900;
      const eg = this.ctx.createGain();
      eg.gain.setValueAtTime(0.001, et);
      eg.gain.exponentialRampToValueAtTime(m.thumpG * m.echo * vol, et + 0.01);
      eg.gain.exponentialRampToValueAtTime(0.0001, et + 0.2);
      e.connect(elp); elp.connect(eg); eg.connect(this.master);
      e.start(et, Math.random() * 0.8, 0.24);
    }
  },

  flickerClick() { this.burstNoise(3000, 0.03, 0.03); },

  // 纸张翻动（拾取档案）
  paper() {
    if (!this.ctx || this.muted) return;
    this.burstNoise(1600, 0.05, 0.1);
    this.burstNoise(900, 0.04, 0.14);
  },

  heartbeat(intensity) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(55, t);
    o.frequency.exponentialRampToValueAtTime(35, t + 0.12);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.5 * intensity, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    o.connect(g);
    g.connect(this.master);
    o.start(t);
    o.stop(t + 0.2);
  },

  // 实体"成形"时的嘶吼：低频咆哮 + 撕裂的中频 + 尖锐的高频，三层叠加
  roar(intensity) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const k = intensity == null ? 1 : intensity;
    const out = this.ctx.createGain();
    out.gain.value = k;
    out.connect(this.master);

    // 1) 低频咆哮（兽吼的底子）
    const o = this.ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(78, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.9);
    const olp = this.ctx.createBiquadFilter();
    olp.type = "lowpass";
    olp.frequency.setValueAtTime(520, t);
    olp.frequency.exponentialRampToValueAtTime(190, t + 0.9);
    olp.Q.value = 3;
    const og = this.ctx.createGain();
    og.gain.setValueAtTime(0.0001, t);
    og.gain.exponentialRampToValueAtTime(0.34, t + 0.08);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 1.05);
    o.connect(olp); olp.connect(og); og.connect(out);
    o.start(t); o.stop(t + 1.1);

    // 2) 撕裂的中频（声带撕裂感：带通噪声向下扫频）
    const n = this.ctx.createBufferSource();
    n.buffer = this.noiseBuffer;
    n.playbackRate.value = 0.9 + Math.random() * 0.3;
    const bp = this.ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(1500, t);
    bp.frequency.exponentialRampToValueAtTime(380, t + 0.85);
    bp.Q.value = 1.6;
    const ng = this.ctx.createGain();
    ng.gain.setValueAtTime(0.0001, t);
    ng.gain.exponentialRampToValueAtTime(0.22, t + 0.06);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.95);
    n.connect(bp); bp.connect(ng); ng.connect(out);
    n.start(t, Math.random() * 1.2, 1.0);

    // 3) 尖锐的高频嘶声（像爬行动物的嘶嘶声，稍晚出现）
    const s = this.ctx.createBufferSource();
    s.buffer = this.noiseBuffer;
    s.playbackRate.value = 1.6 + Math.random() * 0.4;
    const hp = this.ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.setValueAtTime(2200, t + 0.12);
    hp.frequency.exponentialRampToValueAtTime(900, t + 0.7);
    const sg = this.ctx.createGain();
    sg.gain.setValueAtTime(0.0001, t + 0.12);
    sg.gain.exponentialRampToValueAtTime(0.11, t + 0.2);
    sg.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
    s.connect(hp); hp.connect(sg); sg.connect(out);
    s.start(t + 0.12, Math.random() * 1.0, 0.75);
  },

  // 开门 / 关门：金属吱呀 + 落锁
  door(open) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.playbackRate.value = 0.5 + Math.random() * 0.2;
    const bp = this.ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 6;
    const f0 = open ? 420 : 700, f1 = open ? 900 : 300;
    bp.frequency.setValueAtTime(f0, t);
    bp.frequency.linearRampToValueAtTime(f1, t + 0.42);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.13, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    src.connect(bp); bp.connect(g); g.connect(this.master);
    src.start(t, Math.random() * 1.0, 0.55);
    // 关门的落锁闷响
    if (!open) {
      const o = this.ctx.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(120, t + 0.4);
      o.frequency.exponentialRampToValueAtTime(60, t + 0.55);
      const og = this.ctx.createGain();
      og.gain.setValueAtTime(0.0001, t + 0.4);
      og.gain.exponentialRampToValueAtTime(0.2, t + 0.43);
      og.gain.exponentialRampToValueAtTime(0.0001, t + 0.62);
      o.connect(og); og.connect(this.master);
      o.start(t + 0.4); o.stop(t + 0.65);
    }
  },

  // 层级坍塌：低频轰隆 + 碎块坠落
  collapse() {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    // 轰隆
    const n = this.ctx.createBufferSource();
    n.buffer = this.noiseBuffer;
    n.playbackRate.value = 0.35;
    const lp = this.ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(260, t);
    lp.frequency.exponentialRampToValueAtTime(70, t + 1.3);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.5, t + 0.12);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
    n.connect(lp); lp.connect(g); g.connect(this.master);
    n.start(t, Math.random() * 0.8, 1.45);
    // 碎块：几声随机的小爆裂
    for (let i = 0; i < 5; i++) {
      const dt = 0.1 + Math.random() * 0.9;
      const c = this.ctx.createBufferSource();
      c.buffer = this.noiseBuffer;
      c.playbackRate.value = 1.2 + Math.random();
      const hp = this.ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 1400 + Math.random() * 1600;
      const cg = this.ctx.createGain();
      cg.gain.setValueAtTime(0.09, t + dt);
      cg.gain.exponentialRampToValueAtTime(0.0001, t + dt + 0.12);
      c.connect(hp); hp.connect(cg); cg.connect(this.master);
      c.start(t + dt, Math.random() * 1.0, 0.14);
    }
  },

  // 墙纸剥落 / 灰尘簌簌（坍塌前兆）
  debris() {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const n = this.ctx.createBufferSource();
    n.buffer = this.noiseBuffer;
    n.playbackRate.value = 1.8;
    const hp = this.ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 2600;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.07, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
    n.connect(hp); hp.connect(g); g.connect(this.master);
    n.start(t, Math.random() * 1.0, 0.5);
  },

  // 实体出现时的远处低吼
  growl() {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = true;
    const lp = this.ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 160;
    lp.Q.value = 2;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.16, t + 0.1);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
    src.connect(lp);
    lp.connect(g);
    g.connect(this.master);
    src.start(t);
    src.stop(t + 0.85);
  },

  jumpscare() {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = true;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.65, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
    src.connect(g);
    g.connect(this.master);
    src.start(t);
    src.stop(t + 1.15);
    const o = this.ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(120, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.7);
    const og = this.ctx.createGain();
    og.gain.setValueAtTime(0.35, t);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    o.connect(og);
    og.connect(this.master);
    o.start(t);
    o.stop(t + 0.95);
  },

  // ---------- 老旧电视机的雪花声（悲尸循环） ----------
  // 常驻的高通白噪，音量可以随循环推进一路拉大
  startStatic(level) {
    if (!this.ctx) return;
    this.staticLevel = level == null ? 0 : level;
    if (this.staticGain) { this.setStatic(this.staticLevel); return; }
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = true;
    src.playbackRate.value = 1.6;
    const hp = this.ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 2400;
    const g = this.ctx.createGain();
    g.gain.value = 0;
    src.connect(hp);
    hp.connect(g);
    g.connect(this.master);
    src.start();
    this.staticSrc = src;
    this.staticGain = g;
    this.setStatic(this.staticLevel);
  },

  // level: 0~1，越大越吵
  setStatic(level) {
    if (!this.ctx || !this.staticGain) return;
    const v = 0.035 + 0.30 * clamp01(level);
    const t = this.ctx.currentTime;
    this.staticGain.gain.cancelScheduledValues(t);
    this.staticGain.gain.setTargetAtTime(v, t, 0.25);
  },

  stopStatic() {
    if (!this.staticGain) return;
    const t = this.ctx.currentTime;
    this.staticGain.gain.cancelScheduledValues(t);
    this.staticGain.gain.setTargetAtTime(0, t, 0.3);
  },

  // 肾上腺素：一记急促的心跳 + 上扬的耳鸣
  adrenaline() {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    for (let i = 0; i < 2; i++) {
      const o = this.ctx.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(150, t + i * 0.16);
      o.frequency.exponentialRampToValueAtTime(58, t + i * 0.16 + 0.14);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, t + i * 0.16);
      g.gain.exponentialRampToValueAtTime(0.3, t + i * 0.16 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.16 + 0.18);
      o.connect(g);
      g.connect(this.master);
      o.start(t + i * 0.16);
      o.stop(t + i * 0.16 + 0.2);
    }
    const o = this.ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(3200, t);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.035, t + 0.1);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
    o.connect(g);
    g.connect(this.master);
    o.start(t);
    o.stop(t + 1.25);
  },

  exitChime() {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((f, i) => {
      const o = this.ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = f;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, t + i * 0.12);
      g.gain.exponentialRampToValueAtTime(0.25, t + i * 0.12 + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.12 + 0.5);
      o.connect(g);
      g.connect(this.master);
      o.start(t + i * 0.12);
      o.stop(t + i * 0.12 + 0.55);
    });
  },

  // 老式唱片机：一段慢悠悠的爵士和弦（Level 5，曲目的切换似乎完全随机）
  jazz() {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    // 随机挑一个和弦（大七 / 小七 / 属七），听上去像三十年代的舞厅
    const roots = [130.81, 146.83, 174.61, 196.00, 220.00];
    const chords = [[0, 4, 7, 11], [0, 3, 7, 10], [0, 4, 7, 10]];
    const root = roots[Math.floor(Math.random() * roots.length)];
    const ivl = chords[Math.floor(Math.random() * chords.length)];
    ivl.forEach((semi, i) => {
      const f = root * Math.pow(2, semi / 12);
      const o = this.ctx.createOscillator();
      o.type = i === 0 ? "triangle" : "sine";
      o.frequency.value = f;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, t + i * 0.05);
      g.gain.exponentialRampToValueAtTime(0.045, t + i * 0.05 + 0.06);
      g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.05 + 1.9);
      const lp = this.ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 1500;
      o.connect(lp); lp.connect(g); g.connect(this.master);
      o.start(t + i * 0.05);
      o.stop(t + i * 0.05 + 2.0);
    });
    // 唱片机的底噪
    this.burstNoise(5200, 0.012, 0.5);
  },

  // 黑暗里的幻听：贴着耳边、听不清内容的低语（Level 6）
  whisper() {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = true;
    src.playbackRate.value = 0.35;
    const bp = this.ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 700 + Math.random() * 900;
    bp.Q.value = 5;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.05, t + 0.35);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    src.connect(bp); bp.connect(g); g.connect(this.master);
    src.start(t);
    src.stop(t + 1.7);
  },

  // 一阵风吹过整片庄稼（Level 10）
  wind() {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = true;
    src.playbackRate.value = 0.55;
    const bp = this.ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(420, t);
    bp.frequency.linearRampToValueAtTime(1150, t + 1.1);
    bp.frequency.linearRampToValueAtTime(360, t + 2.8);
    bp.Q.value = 1.1;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.055, t + 0.9);
    g.gain.linearRampToValueAtTime(0.0001, t + 3.0);
    src.connect(bp); bp.connect(g); g.connect(this.master);
    src.start(t);
    src.stop(t + 3.1);
  },

  // 水滴 / 远处的水声（Level 6 楼梯附近、Level 7）
  water() {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(900 + Math.random() * 500, t);
    o.frequency.exponentialRampToValueAtTime(240, t + 0.16);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.09, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    o.connect(g); g.connect(this.master);
    o.start(t); o.stop(t + 0.32);
  },

  // 蒸汽 / 阀门泄压（Level 5 锅炉房）
  steam() {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = true;
    const hp = this.ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 1800;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.06, t + 0.08);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
    src.connect(hp); hp.connect(g); g.connect(this.master);
    src.start(t); src.stop(t + 1.2);
  },

  // 电梯（Level 3 / Level 5）：到站的叮 + 机械声
  elevator() {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    [880, 1174.66].forEach((f, i) => {
      const o = this.ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = f;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, t + i * 0.18);
      g.gain.exponentialRampToValueAtTime(0.16, t + i * 0.18 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.18 + 0.6);
      o.connect(g); g.connect(this.master);
      o.start(t + i * 0.18); o.stop(t + i * 0.18 + 0.65);
    });
  },

  toggleMute() {
    this.muted = !this.muted;
    this.applyMasterGain();
    this.applyMusicVolume();
    this.applyAmbientVolume();
    this.applyRadioVolume();
    this.applyBangAlarmVolume();
    return this.muted;
  },

  // ======== 设置：音效 / 背景音乐 的音量与开关 ========
  // 音效走 master（程序化音效 + 嗡嗡声 + 环境嘈杂声），背景音乐走 <audio> 元素。
  sfxVol: 1,          // 0~1，音效总音量
  sfxOn: true,
  bgmOn: true,
  // 文件型环境音（Level 5 的收音机、Level ! 的警报）走这两个开关。
  // 之前这两个字段只被读取、从来没人赋值 —— 于是 !undefined 恒为真，
  // 音量永远算成 0、元素一直 muted：文件明明在 music/ 里，却一点声音都没有。
  // 现在跟"背景音乐"那一路共用开关与音量（它们本来就是同一类：文件型循环音轨）。
  ambientOn: true,
  ambientVol: 0.42,
  applyMasterGain() {
    if (!this.master) return;
    const v = (this.muted || !this.sfxOn) ? 0 : 0.5 * clamp01(this.sfxVol);
    this.master.gain.value = v;
  },
  setSfxVolume(v) { this.sfxVol = clamp01(v); this.applyMasterGain(); },
  setSfxEnabled(on) { this.sfxOn = !!on; this.applyMasterGain(); },
  setMusicVolume(v) {
    this.musicVol = clamp01(v);
    this.ambientVol = this.musicVol;      // 收音机 / 警报跟着音乐音量走
    this.applyMusicVolume();
    this.applyRadioVolume();
    this.applyBangAlarmVolume();
  },
  setMusicEnabled(on) {
    this.bgmOn = !!on;
    this.ambientOn = !!on;                // 关掉音乐时，收音机与警报一起关
    this.applyRadioVolume();
    this.applyBangAlarmVolume();
    if (this.musicEl) {
      this.musicEl.muted = this.muted || !this.bgmOn;
      if (this.bgmOn && this.musicWant) this.playMenuMusic();
    }
    this.applyMusicVolume();
  },

  // ======== 主菜单背景音乐（music/main_music.mp3） ========
  // 文件由用户自己放到 music/ 下；不存在就静默跳过，不影响游玩。
  musicEl: null,
  musicGain: null,
  musicVol: 0.42,
  // 背景音乐曲目：1 = music/main_music.*，2 = music/music_2.*
  musicTrack: 1,
  MUSIC_FILES: ["main_music", "music_2"],
  musicBase() {
    return this.MUSIC_FILES[this.musicTrack === 2 ? 1 : 0];
  },
  setMusicTrack(n) {
    const t = (Number(n) === 2) ? 2 : 1;
    if (t === this.musicTrack && this.musicEl) return;
    this.musicTrack = t;
    const was = this.musicWant;
    if (this.musicEl) { try { this.musicEl.pause(); } catch (e) {} this.musicEl = null; }
    if (this.radioOn) return;                 // 收音机正放着，别抢
    if (was) this.startMenuMusic();
  },
  applyMusicVolume() {
    if (!this.musicEl) return;
    const silent = this.muted || !this.bgmOn;
    // 警报响着的时候，背景音乐元素一旦被别处拉起来发声就把它按回去 ——
    // 宁可让警报独占，也不能让两条音轨抢同一层的声音。
    if (this.alarmSounding() && !this.musicEl.paused) {
      try { this.musicEl.pause(); } catch (e) { /* 忽略 */ }
    }
    this.musicEl.muted = silent;
    this.musicEl.volume = silent ? 0 : clamp01(this.musicVol);
  },
  // 浏览器不允许在用户交互之前自动播放。所以：
  //  · 想播的时候记一个标志（musicWant）；
  //  · 真正 play() 只在"这一次点击/按键"的调用栈里同步执行 —— 否则会被拦。
  // 之前只在"从游戏返回主菜单"时才 startMenuMusic()，所以一进页面是没声音的。
  musicWant: false,
  // 把播放进度拨回开头。音频还没加载好时设 currentTime 会抛错，所以吞掉。
  seekMusicStart() {
    const el = this.musicEl;
    if (!el) return;
    try { el.currentTime = 0; } catch (e) { /* 还没加载完，忽略 */ }
  },
  // restart = true：从头开始放（不是从上次暂停的地方接着放）。
  // 以前没有这个开关 —— 音乐元素 pause() 之后进度一直留着，下一次 play()
  // 就从旧进度继续，听起来就是"怎么不是从头开始"。
  startMenuMusic(restart) {
    this.musicWant = true;
    // 警报（Level !）响着的时候，背景音乐一律不许插进来 —— 打开设置、切曲目、
    // 调音量都会走到这里，一旦让菜单音乐建起元素并出声，这一层唯一的音轨就被
    // 占了，之后再也放不回警报（"打开设置之后感叹号音乐就没了"就是这么来的）。
    // 只是记下"想放"，等警报停了（bangAlarm(false)）自然会放回来。
    if (this.alarmSounding()) return;
    if (this.musicEl) {           // 已经在放了，只是重新进菜单
      if (restart) this.seekMusicStart();
      this.playMenuMusic();
      return;
    }
    // 逐个试候选文件名：你的音乐文件叫什么后缀都行，放在 music/ 下就会被找到
    const base = this.musicBase();
    const cands = ["music/" + base + ".mp3", "music/" + base + ".ogg",
                   "music/" + base + ".m4a", "music/" + base + ".wav"];
    // 主曲目找不到时，再试几个常见名字 —— 玩家把文件扔进 music/ 就该响，
    // 不该因为文件名不叫 main_music 就一声不出。
    if (this.musicTrack !== 2) {
      for (const alt of ["music", "bgm", "background", "theme", "main", "music_1", "BGM"]) {
        for (const ext of [".mp3", ".ogg", ".m4a"]) cands.push("music/" + alt + ext);
      }
    }
    const tryNext = (i) => {
      if (i >= cands.length) {
        // 候选全试完：把最后那个加载失败的元素丢掉。
        // 留着它的话 musicEl 一直"存在"，之后就算玩家把文件放进来了，
        // startMenuMusic() 看见有元素就直接复用，永远不再找文件。
        this.musicEl = null;
        this.musicMissing = true;
        this.showMusicHint();
        // 音乐的事不再往屏幕上糊红条 —— 只记进控制台
        this.musicNote("没找到背景音乐：music/" + base
          + ".mp3 —— 把这音频放进 music/ 目录（或改名成上面这几个名字）就会响");
        return;
      }
      const el = new Audio(cands[i]);
      el.loop = true;
      el.volume = (this.muted || !this.bgmOn) ? 0 : clamp01(this.musicVol);
      el.muted = this.muted || !this.bgmOn;
      el.preload = "auto";
      // 注意：不要 createMediaElementSource 接到 WebAudio 上 —— 那样一旦
      // AudioContext 处于 suspended（浏览器未交互前就是），整条链都是静音的，
      // 只有带自动播放白名单的预览环境能听见。直接用 <audio> 元素播放。
      el.addEventListener("error", () => tryNext(i + 1));
      el.addEventListener("canplay", () => { this.musicMissing = false; this.hideMusicHint(); });
      this.musicEl = el;
      this.playMenuMusic();
    };
    tryNext(0);
  },
  // 文件找不到 / 浏览器不肯播 —— 在菜单底部给一行说明，别让人干着急
  musicMissing: false,
  showMusicHint() {
    if (typeof document === "undefined") return;
    let n = document.getElementById("music-hint");
    if (!n) {
      n = document.createElement("div");
      n.id = "music-hint";
      n.textContent = "未检测到音乐文件 —— 把音频放进 music/ 目录，命名 main_music.mp3（第二首 music_2.mp3）即可出声";
      document.body.appendChild(n);
    }
    n.style.display = "";
  },
  hideMusicHint() {
    if (typeof document === "undefined") return;
    const n = document.getElementById("music-hint");
    if (n) n.style.display = "none";
  },

  // ======== 音乐相关：一律不弹红条 ========
  // 音乐播不了（缺文件 / 格式不支持 / 自动播放被拦）影响的只是"有没有声音"，
  // 拿红条糊屏幕不划算。这里改成只记进控制台 —— 想排查的时候开 F12 看得到，
  // 画面干干净净。缺文件时的兜底逻辑（比如警报没声就把背景音乐放回来）照旧。
  musicNote(msg) {
    try {
      if (typeof console !== "undefined" && console.warn) console.warn("[music] " + msg);
    } catch (e) { /* 忽略 */ }
  },

  // ======== 出声失败：非音乐的一律写在屏幕上，不再静默 ========
  // 同一条 30 秒内只提示一次，免得每帧弹一遍糊满屏。
  _aerrMsg: "",
  _aerrAt: 0,
  audioError(msg) {
    try {
      const now = Date.now();
      if (msg === this._aerrMsg && now - this._aerrAt < 30000) return;
      this._aerrMsg = msg; this._aerrAt = now;
    } catch (e) { /* 忽略 */ }
    try {
      if (typeof document === "undefined" || !document.body) return;
      const d = document.createElement("div");
      d.className = "audio-err";
      d.style.cssText = "position:fixed;left:50%;top:10%;transform:translateX(-50%);"
        + "z-index:2147483000;max-width:min(680px,90vw);padding:10px 14px;border-radius:8px;"
        + "background:rgba(122,18,18,.95);border:1px solid #ff8080;color:#ffecec;"
        + "font:14px/1.65 system-ui,'PingFang SC','Microsoft YaHei',sans-serif;"
        + "box-shadow:0 8px 26px rgba(0,0,0,.55);cursor:pointer;white-space:pre-wrap;"
        + "text-align:left";
      // 缺文件的报错，多半不是"文件名写错"，而是 music/ 这个目录压根没被上传上去
      // —— 空目录会被打包 / 上传工具直接跳过，于是真机上一路 404。
      // 光说"没找到"没用，得教玩家怎么自己确认：直接打开那个地址看是不是 404。
      let tail = "";
      if (msg.indexOf("music/") >= 0) {
        try {
          const u = String(location && location.href || "").split("?")[0].split("#")[0];
          const dir = u.replace(/\/[^/]*$/, "/") + "music/";
          tail = "\n\n如果文件确实放进 music/ 了还是这样，多半是这个空目录没被上传上去"
            + "（空目录会被打包工具跳过）。\n在浏览器里直接打开：" + dir
            + "\n能下载到东西 = 目录在；404 = 目录没传上去。";
        } catch (e) { tail = "\n\n如果文件确实放进 music/ 了还是这样，多半是这个空目录"
          + "没被上传上去（空目录会被打包工具跳过）。"; }
      }
      d.textContent = "⚠ " + msg + tail;
      // 最多同时留两条 —— 缺文件时好几个路径都会来报同一件事，
      // 不设上限的话一进层就糊满一屏红条，真正要紧的那句反而看不见了。
      try {
        const old = document.querySelectorAll(".audio-err");
        for (let i = 0; i < old.length - 1; i++) { try { old[i].remove(); } catch (e) { /* 忽略 */ } }
      } catch (e) { /* 忽略 */ }
      const kill = () => { try { d.remove(); } catch (e) { /* 忽略 */ } };
      d.addEventListener("click", kill);
      document.body.appendChild(d);
      setTimeout(kill, 9000);
    } catch (e) { /* 忽略 */ }
  },
  // play() 的 promise 被拒：以前一律静默吞掉。
  playFail(pr, what, file, el) {
    if (!pr || typeof pr.catch !== "function") return;
    pr.catch((e) => {
      const n = (e && e.name) || "";
      const loaded = !!(el && el.readyState >= 2);
      // 文件压根不存在时，候选是挨个试的 —— 每个都会 reject 一次。
      // 这种"还在找文件"的失败不算数：由候选穷尽那一条统一说明，
      // 否则一进层就糊一屏红条，真正有用的那句反而看不见了。
      if (n !== "NotAllowedError" && !loaded) return;
      if (n === "NotAllowedError") {
        // 不带文件名：同一个 what 只提示一次
        this.musicNote(what + " 被浏览器拦了自动播放 —— 点一下屏幕就会出声");
      } else {
        this.musicNote(what + " 播不出来"
          + (file ? "（" + file + "）" : "")
          + (n ? "：" + n : "")
          + " —— 文件可能损坏，或这个格式浏览器解不了（建议 mp3）");
      }
    });
  },
  playMenuMusic() {
    const el = this.musicEl;
    if (!el) return;
    // 警报（Level !）响着的时候，背景音乐不许顶上来 —— 否则玩家一打开设置，
    // 菜单音乐就把这一层唯一的音轨占了，之后再也放不回警报。
    if (this.alarmSounding()) return;
    this.applyMusicVolume();
    const pr = el.play();
    // 自动播放被拦（还没交互过）：以前静默吞掉 —— 现在把原因写在屏幕上
    this.playFail(pr, "背景音乐", el.currentSrc || el.src || "", el);
  },
  // 从头放一遍：进游戏流程 / 回到主菜单时用，确保玩家听到的是开头。
  restartMenuMusic() {
    this.musicWant = true;
    if (!this.musicEl) { this.startMenuMusic(true); return; }
    this.seekMusicStart();
    this.playMenuMusic();
  },
  stopMenuMusic() {
    this.musicWant = false;
    if (!this.musicEl) return;
    try { this.musicEl.pause(); } catch (e) {}
  },
  // 第一次真实交互（点一下 / 敲一下键盘）时补一次播放 —— 必须在手势里同步调用。
  // 只要音乐该响却没响，每次手势都会再试一次（有的浏览器要两三次才放行）。
  unlockOnGesture() {
    if (this.ctx && this.ctx.state === "suspended" && this.ctx.resume) {
      try { this.ctx.resume(); } catch (e) { /* 忽略 */ }
    }
    // 警报（Level !）响着的时候别把背景音乐补上来 —— 那会顶掉这一层的音轨
    if (this.musicWant && !this.radioOn && !this.alarmSounding() && this.musicEl && this.musicEl.paused) {
      this.applyMusicVolume();
      const pr = this.musicEl.play();
      if (pr && typeof pr.catch === "function") pr.catch(() => {});
    }
    if (this.radioOn && this.radioEl && this.radioEl.paused) {
      this.applyRadioVolume();
      const pr = this.radioEl.play();
      if (pr && typeof pr.catch === "function") pr.catch(() => {});
    }
    // 警报（Level !）本该响却停着 —— 趁这次手势补一次。
    // 上一次 play() 被背景音乐顶掉之后，很多浏览器要求用户再有一次交互才肯放，
    // 没有这一步就成了"进了这层就没声，重进也没用"。
    if (this.alarmOn && !this.alarmFailed && this.alarmEl && this.alarmEl.paused) {
      this.applyBangAlarmVolume();
      try {
        const pr = this.alarmEl.play();
        if (pr && typeof pr.catch === "function") pr.catch(() => {});
      } catch (e) { /* 忽略 */ }
    }
  },
  // 进入游戏后把菜单音乐淡出并停掉
  // ======== 环境嘈杂声（Level 14：只有一片嘈杂，没有任何音乐） ========
  ambientSrc: null,
  ambientGain: null,
  ambientNoise(on) {
    if (!this.ctx) return;
    if (on) {
      if (this.ambientSrc) return;                 // 已经在响了
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      src.loop = true;
      src.playbackRate.value = 0.55;
      const lp = this.ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 900;                    // 闷而低沉的一片嘈杂
      const hp = this.ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 120;
      const g = this.ctx.createGain();
      g.gain.value = 0;
      src.connect(lp); lp.connect(hp); hp.connect(g); g.connect(this.master);
      src.start();
      g.gain.setTargetAtTime(this.muted ? 0 : 0.055, this.ctx.currentTime, 1.2);
      this.ambientSrc = src; this.ambientGain = g;
    } else {
      if (!this.ambientSrc) return;
      const src = this.ambientSrc, g = this.ambientGain;
      this.ambientSrc = null; this.ambientGain = null;
      try {
        g.gain.setTargetAtTime(0, this.ctx.currentTime, 0.4);
        setTimeout(() => { try { src.stop(); } catch (e) {} }, 1600);
      } catch (e) {}
    }
  },
  applyAmbientVolume() {
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setTargetAtTime(this.muted ? 0 : 0.055, this.ctx.currentTime, 0.1);
    }
  },

  // ======== Level 5 进门边上那台收音机（music/Level5.mp3） ========
  // · 从第 6 秒开始放；· 声音随距离渐渐变轻；· 离开这一层就停；
  // · 完全听不见之后 3 秒，背景音乐接回来。
  radioEl: null,
  radioOn: false,
  radioNear: 0,
  radioTimer: null,
  RADIO_START: 6,
  startRadio() {
    if (this.radioEl) { this.playRadio(); return; }
    const cands = ["music/Level5.mp3", "music/Level5.ogg", "music/Level5.m4a", "music/Level5.wav"];
    const tryNext = (i) => {
      if (i >= cands.length) {
        // Level 5 的收音机缺文件时以前一声不吭 —— 现在也在屏幕上说一句
        this.radioFailed = true;
        this.radioEl = null;
        this.musicNote("没找到 Level 5 的收音机音轨：music/Level5.mp3 —— "
          + "把这音频放进 music/ 目录，进 Level 5 才会听见那台收音机");
        return;
      }
      const el = new Audio(cands[i]);
      el.loop = true;
      el.volume = 0;
      el.muted = this.muted || !this.ambientOn;
      el.preload = "auto";
      el.addEventListener("error", () => { if (this.radioEl === el) this.radioEl = null; tryNext(i + 1); });
      const seek = () => {
        try { if (el.currentTime < this.RADIO_START) el.currentTime = this.RADIO_START; } catch (e) {}
      };
      el.addEventListener("loadedmetadata", seek);
      el.addEventListener("canplay", () => { seek(); this.playRadio(); });
      this.radioEl = el;
      this.playRadio();
    };
    tryNext(0);
  },
  playRadio() {
    const el = this.radioEl;
    if (!el) return;
    const pr = el.play();
    this.playFail(pr, "Level 5 的收音机", el.currentSrc || el.src || "", el);
  },
  // on = 在这一层且能听见；near = 距离衰减后的音量比例（0~1）
  radio(on, near) {
    if (this.radioTimer) { clearTimeout(this.radioTimer); this.radioTimer = null; }
    if (this.radioOn !== !!on) {
      this.radioOn = !!on;
      if (on) {
        this.stopMenuMusic();              // 收音机响着的时候，背景音乐让位
        this.startRadio();
      } else if (this.radioEl) {
        try { this.radioEl.pause(); } catch (e) {}
        // 彻底听不见之后 3 秒，背景音乐接回来
        this.radioTimer = setTimeout(() => {
          this.radioTimer = null;
          if (!this.radioOn && this.musicWant) this.startMenuMusic();
        }, 3000);
      }
    }
    this.radioNear = on ? clamp01(near) : 0;
    this.applyRadioVolume();
  },
  applyRadioVolume() {
    const el = this.radioEl;
    if (!el) return;
    // Level 5 的收音机属于环境音 —— 走 ambient 那一路，不再受背景音乐音量管
    const v = (this.muted || !this.ambientOn) ? 0 : clamp01(this.ambientVol) * this.radioNear;
    el.volume = v;
    el.muted = v <= 0.001;
  },

  // ======== Level ! 的警报（music/Level!.mp3） ========
  // 警报音已经合在这条音轨里了，所以不用另外做单独的警报声。
  // 进层 2 秒后（红灯亮起那一刻）开始放，离开这一层就停。
  alarmEl: null,
  alarmOn: false,
  // 一个都加载不出来时置 true —— 下次进层还会重试（以前失败的 Audio 会赖在
  // alarmEl 上，于是第二次进来直接走"已经有了"那条分支，永远不再找文件）。
  alarmFailed: false,
  alarmReady: false,
  startBangAlarm() {
    // 已经有元素、且确认过能播 —— 直接从头放一遍，不再重新找文件
    if (this.alarmEl && this.alarmReady && !this.alarmFailed) { this.playBangAlarm(true); return; }
    // 上一轮全落空了：主循环每帧都会自愈式地再调一次，不设冷却的话就是一秒钟
    // 试十几遍、建十几个 Audio 元素、刷一屏红条。冷却 20 秒 —— 玩家把文件放进
    // music/ 之后，最多等 20 秒（或重进这一层）就会自己响起来。
    if (this.alarmFailed && Date.now() < (this._alarmRetryAt || 0)) return;
    // 文件名里带 "!" 在部分静态托管 / 打包工具上会被转义甚至丢掉，
    // 所以正式文件名用 exclamation-mark.mp3；连字符可有可无（exclamationmark
    // 同样收），旧的 Level!.mp3 只作兜底 —— 玩家放进来的叫什么都尽量认。
    const cands = ["music/exclamation-mark.mp3", "music/exclamationmark.mp3",
      "music/exclamation-mark.ogg", "music/exclamation-mark.m4a", "music/exclamation-mark.wav",
      "music/exclamation-mark.MP3", "music/exclamationmark.MP3",
      "music/Level!.mp3", "music/level!.mp3", "music/Level!.ogg",
      "music/bang.mp3", "music/alarm.mp3", "music/siren.mp3"];
    this.alarmFailed = false;
    this.alarmReady = false;
    this.alarmEl = null;
    const tryNext = (i) => {
      if (i >= cands.length) {
        // 全都加载不出来：多半是 music/ 下还没有这个文件。
        // 以前是静悄悄地放弃 —— 玩家只听到"没有警报"，不知道缺什么。
        this.alarmFailed = true;
        this._alarmRetryAt = Date.now() + 20000;
        this.alarmEl = null;
        this.alarmOn = false;         // 置回未响，下次进这一层还能再找一遍文件
        this.alarmMissing();
        return;
      }
      const el = new Audio(cands[i]);
      el.loop = true;
      el.volume = 0;
      el.muted = this.muted || !this.ambientOn;
      el.preload = "auto";
      el.addEventListener("error", () => {
        if (this.alarmEl === el) this.alarmEl = null;
        tryNext(i + 1);
      });
      el.addEventListener("canplay", () => {
        if (this.alarmEl !== el) return;
        clearTimeout(timer);
        this.alarmReady = true;
        this.alarmFailed = false;
        this._alarmSeek = true;      // 加载完了再把进度拨回开头（没加载完时设会打断播放）
        // 关键：能播之后才 play()。以前一创建就 play()，随后又 seek / 再 play 一次，
        // 前一次请求被后面打断 —— 报 AbortError，而且那一次取消把整条音轨掐成静音，
        // 于是"文件在、也不报错，就是没声"。
        this.playBangAlarm(true);
      });
      this.alarmEl = el;
      // 缓存命中的时候 canplay 可能在挂监听之前就已经发过了 —— 补一次判断
      if (el.readyState >= 3) {
        clearTimeout(timer);
        this.alarmReady = true;
        this.alarmFailed = false;
        this._alarmSeek = true;
        this.playBangAlarm(true);
      }
    };
    // 兜底：有些环境（无音频设备、编解码缺失）既不发 error 也不发 canplay，
    // 会一直悬着 —— 那样玩家永远等不到一句"缺文件"的说明。4 秒还没能播就当没找到。
    const timer = setTimeout(() => {
      // alarmFailed 为真说明 error 分支已经提示过了 —— 别再弹一遍重复的话
      if (this.alarmReady || this.alarmFailed) return;
      this.alarmFailed = true;
      this._alarmRetryAt = Date.now() + 20000;
      this.alarmEl = null;
      this.alarmOn = false;
      this.alarmMissing();
    }, 4000);
    tryNext(0);
  },
  // Level ! 警报没声音：把话说清楚，并且把背景音乐放回来。
  // 警报一响就要先停掉背景音乐（bangAlarm() 里 stopMenuMusic），要是音频文件又
  // 找不到，这一层就成了彻底的死寂 —— 玩家只会以为音乐坏了。文件没找到就把
  // 背景音乐还回去，至少还有声。
  // 警报"真的在出声"才算数：元素建好了、没失败、且开关是开的。
  // 只要警报注定了没声（缺文件 / 冷却中），背景音乐就不该被它挡在外面 ——
  // 否则缺文件时这一层就变成彻底的死寂：警报没声，背景音乐也被掐了。
  alarmSounding() {
    return !!this.alarmOn && !this.alarmFailed && !!this.alarmEl;
  },
  // 把被警报让位的背景音乐放回来
  restoreBgm() {
    const back = this.bgmHeldByAlarm;
    this.bgmHeldByAlarm = false;
    if (!back || this.bgmOn === false || this.radioOn) return;
    try { this.startMenuMusic(true); } catch (e) { /* 忽略 */ }
  },
  alarmMissing() {
    this.musicNote("没找到 Level ! 的警报音乐 —— 把这条音轨放进 music/ 目录，"
      + "命名 exclamation-mark.mp3（写成 exclamationmark.mp3 也认），"
      + "进 Level ! 两秒后警报就会响（警报音已合在这条音轨里）");
    // 警报注定了没声，背景音乐就不该被它挡在外面 —— 否则这一层彻底死寂
    this.restoreBgm();
  },
  // 把警报拨回开头。
  // 音频还没加载好时设 currentTime 会把正在进行的 play() 打断（报 AbortError、
  // 声音就此没了），所以只在拿到元数据之后再 seek，没就绪就记个标记等 canplay 再补。
  _alarmSeek: false,
  seekAlarmStart() {
    const el = this.alarmEl;
    if (!el) return;
    if (el.readyState < 1) { this._alarmSeek = true; return; }
    try { el.currentTime = 0; this._alarmSeek = false; } catch (e) { /* 忽略 */ }
  },
  // restart = true：从头开始响。
  // 以前没有这个开关 —— 离开这一层只是 pause()，进度一直留着，于是第二次
  // 进 Level ! 时 alarmEl 被复用、play() 从上次停的地方接着响，警报只响半截。
  // 警报是"这一层又把你抓住了"的信号，每次进来都该从头响一遍。
  playBangAlarm(restart) {
    const el = this.alarmEl;
    if (!el || this.alarmFailed) return;
    // 音量必须在这里补一次：文件不是第一个候选名时（比如叫 exclamationmark.mp3），
    // 元素是 canplay 之后才建起来的，那时 bangAlarm() 末尾的 applyBangAlarmVolume()
    // 早就跑完了 —— 于是"文件找到了、也在播，音量却是 0"，听上去就是完全没声音。
    this.applyBangAlarmVolume();
    if (restart) this.seekAlarmStart();
    const doPlay = () => {
      if (!this.alarmOn || this.alarmEl !== el) return;
      let pr = null;
      try { pr = el.play(); } catch (e) { /* 忽略 */ }
      if (pr && typeof pr.catch === "function") {
        pr.catch((e) => {
          const n = (e && e.name) || "";
          // AbortError = 这次 play() 被后面那次打断（换候选 / 重新进层）。
          // 它不是真的播不出来 —— 补一次就行，别拿它去糊玩家一屏红条。
          if (n === "AbortError") {
            if (!this._alarmAborted) {
              this._alarmAborted = true;
              setTimeout(doPlay, 220);
            }
            return;
          }
          this.playFail(Promise.reject(e), "Level ! 的警报音乐", el.currentSrc || el.src || "", el);
        });
      }
    };
    this._alarmAborted = false;
    doPlay();
    this.armAlarmWatchdog();
  },
  _alarmAborted: false,
  // 看门狗：文件找到了、play() 也没报错，却还是没声 —— 这种"静悄悄的失败"最坑人，
  // 玩家只听见 Level ! 一片安静，屏幕上什么提示都没有。3 秒后复查一次：
  // 元素被掐掉了 / 音量是 0，就把它写在屏幕上。
  _alarmWd: 0,
  armAlarmWatchdog() {
    try { clearTimeout(this._alarmWd); } catch (e) { /* 忽略 */ }
    this._alarmWd = setTimeout(() => {
      if (!this.alarmOn) return;                  // 已经离开这一层了，不算数
      if (this.alarmFailed) return;               // 缺文件已经说过了，不再重复
      if (this.muted || !this.ambientOn) return;  // 玩家自己关的，不报警
      const el = this.alarmEl;
      if (!el) { this.alarmMissing(); return; }
      // 音量被谁压到 0 了（比如刚调过音量）就先恢复，再看有没有出声
      this.applyBangAlarmVolume();
      if (!el.paused) return;
      // 没能出声：先自己补一次（多半是上一次 play() 被背景音乐顶掉了），
      // 1.2 秒后仍是静的，才把它写在屏幕上 —— 顺便带上真正有用的排查信息。
      try { this._alarmAborted = false; el.play(); } catch (e) { /* 忽略 */ }
      try { clearTimeout(this._alarmWd2); } catch (e) { /* 忽略 */ }
      this._alarmWd2 = setTimeout(() => {
        if (!this.alarmOn || this.alarmEl !== el) return;
        if (this.muted || !this.ambientOn) return;
        if (!el.paused) return;
        const src = el.currentSrc || el.src || "(还没定下来)";
        this.musicNote("Level ! 的警报音乐没能出声（paused=" + el.paused
          + "、音量=" + Number(el.volume || 0).toFixed(2)
          + "、加载状态=" + el.readyState + "/" + el.networkState + "）—— "
          + "尝试播放：" + src + "；"
          + (el.readyState === 0 ? "文件没加载上，确认 music/ 下有这条音轨"
                                 : "多半是被别的音频顶掉了，动一下鼠标/键盘就会补回来"));
      }, 1200);
    }, 3000);
  },
  _alarmWd2: 0,
  _alarmRetryAt: 0,
  // 警报只属于 Level ! —— 离开这一层（切层 / 死亡 / 结局 / 回主菜单）必须停掉，
  // 并把默认背景音乐放回来。所以这里要记住"警报响之前背景音乐是不是在响"：
  // stopMenuMusic() 会把 musicWant 清掉，不记下来的话关警报时就恢复不回去了。
  bgmHeldByAlarm: false,
  // 战地医院（14h）：档案里写"始终能听到不断的警报响声"。
  // 这是合成出来的一记低鸣 —— 不依赖任何音频文件，所以缺文件也不会像
  // Level ! 那样变成一片死寂。音量压得极低：它是"一直在那儿"的底噪，
  // 不是要盖过一切的东西（Level ! 的警报才需要盖过一切）。
  mashAlarm(on) {
    if (this.mashOn === !!on) return;
    this.mashOn = !!on;
    if (on) {
      if (!this.ctx) this.init();
      if (!this.ctx || this.mashOsc) return;
      try {
        const o = this.ctx.createOscillator();
        const gn = this.ctx.createGain();
        const lfo = this.ctx.createOscillator();
        const lg = this.ctx.createGain();
        o.type = "triangle"; o.frequency.value = 138;
        lfo.type = "sine"; lfo.frequency.value = 0.22;   // 一下一下地起伏
        gn.gain.value = 0.020;
        lg.gain.value = 0.012;
        lfo.connect(lg); lg.connect(gn.gain);
        o.connect(gn); gn.connect(this.master || this.ctx.destination);
        o.start(); lfo.start();
        this.mashOsc = o; this.mashGain = gn; this.mashLfo = lfo;
      } catch (e) { this.mashOsc = null; }
    } else {
      if (!this.mashOsc) return;
      try { this.mashOsc.stop(); this.mashLfo.stop(); } catch (e) { /* 忽略 */ }
      this.mashOsc = null; this.mashLfo = null; this.mashGain = null;
    }
  },
  bangAlarm(on) {
    if (this.alarmOn === !!on) return;
    this.alarmOn = !!on;
    if (on) {
      // 背景音乐本来在响吗？（或该响、只是还没出声）
      this.bgmHeldByAlarm = !!this.musicWant || !!(this.musicEl && !this.musicEl.paused);
      this.stopMenuMusic();          // 警报响着的时候背景音乐让位
      this.startBangAlarm();
      // 警报没能出声（缺文件 / 还在冷却）就别让这一层彻底静下来 ——
      // 把背景音乐放回来，至少还有声音。
      if (!this.alarmSounding()) this.restoreBgm();
    } else if (this.alarmEl) {
      try { this.alarmEl.pause(); } catch (e) {}
      this.seekAlarmStart();         // 停掉时拨回开头，下次进来从头响
      const back = this.bgmHeldByAlarm;
      this.bgmHeldByAlarm = false;
      // 玩家关掉了背景音乐（bgmOn=false）就别自作主张放回来
      if (back && this.bgmOn !== false && !this.radioOn) this.startMenuMusic(true);
    }
    this.applyBangAlarmVolume();
  },
  applyBangAlarmVolume() {
    const el = this.alarmEl;
    if (!el) return;
    // 警报属于环境音 —— 走 ambient 那一路
    // 警报要盖过一切 —— 比背景音乐再推高一档（默认 0.42 * 1.6 ≈ 0.67）
    const v = (this.muted || !this.ambientOn || !this.alarmOn)
      ? 0 : Math.min(1, clamp01(this.ambientVol) * 1.6);
    el.volume = v;
    el.muted = v <= 0.001;
  },

  // 开局：菜单音乐淡出并停掉。
  // 注意这里必须把 musicWant 一并清掉 —— 否则玩家在游戏里每按一次键，
  // unlockOnGesture() 看到"想放却暂停着"就会把音乐重新拉起来（还从旧进度继续）。
  // 停掉之后顺手拨回开头，下次再响就是从第 0 秒开始。
  // 开局时调用：背景音乐不停，一路带进关卡。
  // 以前只有 fadeOutMenuMusic() 这一条路，所以一进游戏音乐必然消失。
  keepMusicIntoGame() {
    this.musicWant = true;
    this.bgmHeldByAlarm = false;
    if (!this.musicEl) { this.startMenuMusic(true); return; }
    this.applyMusicVolume();          // 撤销上一次淡出可能残留的小音量
    this.playMenuMusic();
  },
  fadeOutMenuMusic(ms) {
    const el = this.musicEl;
    if (!el) { this.musicWant = false; return; }
    const step = 60, total = Math.max(1, ms || 600);
    let left = total;
    const tick = () => {
      left -= step;
      el.volume = Math.max(0, (this.muted ? 0 : this.musicVol) * Math.max(0, left / total));
      if (left > 0) setTimeout(tick, step);
      else {
        try { el.pause(); } catch (e) {}
        this.musicWant = false;
        this.seekMusicStart();
      }
    };
    tick();
  },
};

// 挂到 window 上：控制台 / 联机同步 / 自动化测试都要能碰到它
window.AudioSys = AudioSys;

// 任何一次真实的点击 / 按键都算是"用户交互"——趁这次机会把播放补上。
// 不这么做的话，除了带白名单的预览环境，其它浏览器一律静音。
(function armAudioOnGesture() {
  if (typeof document === "undefined") return;
  const on = () => { AudioSys.unlockOnGesture(); };
  for (const ev of ["pointerdown", "mousedown", "touchstart", "keydown"]) {
    document.addEventListener(ev, on, { capture: true, passive: true });
  }
})();
