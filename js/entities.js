"use strict";

// ======== 实体（后室实体：不同层级栖息不同怪物） ========
// 这一格是不是在水里（Level 7）
// 窃皮者伪装时的打扮：一套 M.E.G. 遗留的黄色生化防护服（配黑色防毒面具）。
// 它偷的是"一个穿着防护服的流浪者"的样子 —— 所以一模一样，没有第二种。
const SKIN_LOOKS = [
  { shirt: "#f2c518", pants: "#d9ab10", skin: "#2b2b2b", hair: "#e0b90f", suit: true },
];

// 两个十六进制色之间插值（k=0 取 a，k=1 取 b）
function skinMix(a, b, k) {
  k = k < 0 ? 0 : (k > 1 ? 1 : k);
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const r = Math.round(((pa >> 16) & 255) * (1 - k) + ((pb >> 16) & 255) * k);
  const g = Math.round(((pa >> 8) & 255) * (1 - k) + ((pb >> 8) & 255) * k);
  const bl = Math.round((pa & 255) * (1 - k) + (pb & 255) * k);
  return "rgb(" + r + "," + g + "," + bl + ")";
}

function inWaterTile(map, y) {
  return !!(map && map.ocean && y >= map.ocean.top * TILE);
}

// 某个坐标是不是在 M.E.G 的 Alpha 基地里面
function inMegBase(map, x, y, floor) {
  const ab = map && map.alphaBase;
  if (!ab || (floor | 0) !== (map.megFloor | 0)) return false;
  const tk = Math.floor(x / TILE) + "," + Math.floor(y / TILE);
  return ab.inside.has(tk);
}

// 安全区：实体不会踏进来。
//   · M.E.G 的 Alpha 基地（Level 1）
//   · Level 7 的岸上 / 入口房间 —— 怪不上岸
function inSanctuary(map, x, y, floor) {
  if (!map) return false;
  if (inMegBase(map, x, y, floor)) return true;
  // Level 7：水面以上那一整块（入口房间与门廊）都是岸
  if (map.ocean && y < map.ocean.top * TILE) return true;
  // Level 45：靠近中心的建筑有恒定电流，没有实体（BRC 自己引进的那几只另算 ——
  // 它们关在最低楼层的围栏里，不参与游荡）。
  if (map.b45safe && map.b45safe.has(Math.floor(x / TILE) + "," + Math.floor(y / TILE))) return true;
  return false;
}

// 安全区的"出口"：万一实体已经在里面了，就朝这儿挪出去
function sanctuaryExit(map) {
  const ab = map && map.alphaBase;
  if (ab && ab.entry) return { x: (ab.entry.x - 2 + 0.5) * TILE, y: (ab.corridorY + 0.5) * TILE };
  if (map && map.ocean) {
    const px = map.porch ? map.porch.x : Math.floor(map.size / 2);
    return { x: (px + 0.5) * TILE, y: (map.ocean.top + 2 + 0.5) * TILE };
  }
  return null;
}

class Entity {
  constructor(map, tileX, tileY, level, kind, floor) {
    const cfg = CONFIG.MONSTERS[kind] || CONFIG.MONSTERS.bacterium;
    this.map = map;
    this.kind = kind;
    this.cfg = cfg;
    this.floor = floor | 0; // 所在楼层（Level 1 分上下两层）
    this.x = tileX * TILE + TILE / 2;
    this.y = tileY * TILE + TILE / 2;
    this.radius = cfg.radius;
    this.level = level;
    // 第 11 效应：受影响的实体不会攻击流浪者，只会漫无目的地流浪
    // 关键修正：以前只看层级在不在 DOCILE_LEVELS 里，**完全没读 cfg.docile** ——
    // 于是凡是靠"单体配置"标成无害的实体（Kitty 就是其中之一）照旧会抓死玩家。
    // 两种来源都算：层级整体无害，或者这个种类本身就是无害的。
    this.docile = !!cfg.docile ||
      !!(CONFIG.DOCILE_LEVELS && CONFIG.DOCILE_LEVELS.indexOf(level) >= 0);
    // 追击速度：整体削过一刀，并且封顶 —— 玩家全速疾跑一定能拉开距离
    // 难度：极端 / 困难会大幅加强，简单会削弱
    // 层级编号可能是文字（"hub"）—— 直接参与算术会得到 NaN，
    // 速度变 NaN 之后坐标也会跟着变 NaN，实体就"存在但画不出来"。按 0 处理。
    const lvN = (typeof level === "number" && isFinite(level)) ? level : (parseFloat(level) || 0);
    const dm = (typeof window !== "undefined" && window.__entMul) ? window.__entMul() : 1;
    this.speed = Math.min(
      (CONFIG.ENTITY_BASE_SPEED + lvN * CONFIG.ENTITY_LEVEL_SPEED) * cfg.speedMul * dm,
      CONFIG.ENTITY_MAX_SPEED * cfg.speedMul * dm);
    this.wanderSpeed = (CONFIG.ENTITY_WANDER_SPEED + lvN * 4) * cfg.wanderMul * dm;
    // 兜底：任何一步算出 NaN 都归零 —— 绝不让坐标变成 NaN
    if (!isFinite(this.speed)) this.speed = CONFIG.ENTITY_BASE_SPEED;
    if (!isFinite(this.wanderSpeed)) this.wanderSpeed = CONFIG.ENTITY_WANDER_SPEED;
    this.lostTime = cfg.lostTime;
    this.state = "wander"; // wander | chase
    this.angle = rand(0, Math.PI * 2);
    this.wanderTimer = rand(1, 3);
    this.wanderTime = 0;       // 连续游荡计时（用于远处重新刷新）
    this.seenTimer = 0;
    this.stuckTime = 0;
    this.lastX = this.x;
    this.lastY = this.y;
    this.stepSpeed = 0;        // 绘制用：当前移动速度（腿的步幅/步频按它来）
    this.seed = rand(0, 1000);
    this.age = 0;              // 自生成/刷新以来的时间（驱动刷新动画）
    this.spawnDuration = cfg.spawnDuration; // 刷新动画时长（秒）
    this.windup = 0;           // 发现玩家后的"起手"倒计时（先嘶吼再扑，给玩家反应窗口）
    // 窃皮者：一身皮的循环（温顺的流浪者形态 ↔ 松垮的白皮真面目）
    if (kind === "skinstealer") this.initSkin();
  }

  // ---------- 窃皮者：皮肤循环 ----------
  // 它大多数时候是温顺的 —— 顶着一张人脸，无意识地四处游荡，不主动攻击；
  // 除非你贴得太近，或者温顺期结束。进入进食期后它会顶着那张脸朝你冲过来，
  // 冲到跟前才露出真面目：一身松松垮垮、并不贴合身体的白皮。
  // 进食完毕之后，那张皮要用 3~5 秒一点点绷回人样，然后重新温顺 20~40 秒。
  initSkin() {
    const c = this.cfg;
    const seedF = Math.floor(this.seed);
    this.skinLook = SKIN_LOOKS[Math.floor(hash2(3, seedF) * SKIN_LOOKS.length) % SKIN_LOOKS.length];
    this.skinTorch = hash2(7, seedF) > 0.35;   // 有的会打着手电筒
    this.skinMend = 1;                         // 贴合进度（1 = 完全是人样）
    this.skinPassive = true;                   // 温顺 / 贴合中：不追人
    this.skinRevealed = false;                 // 一旦靠近玩家就永久露出真面目，不再绷回流浪者的样子
    // 多数一上来正处在温顺期；少数已经在进食期（正饿着）
    if (hash2(13, seedF) > 0.4) {
      this.skinPhase = "calm";
      this.skinTimer = rand(c.skinCalmMin, c.skinCalmMax);
    } else {
      this.skinPhase = "hunt";
      this.skinTimer = c.skinHuntMax;
      this.skinPassive = false;
    }
  }

  // 推进皮肤循环；d 是到玩家的像素距离
  updateSkin(dt, player, d) {
    const c = this.cfg;
    // 第 11 效应：连进食的兴趣都没有了 —— 永远维持着那副流浪者的样子
    if (this.docile) {
      this.skinPhase = "calm";
      this.skinMend = 1;
      this.skinPassive = true;
      return;
    }
    const near = d / TILE;          // 到玩家的距离（格）
    // 靠近玩家：当场露出「原先的样子」—— 一身松垮的白皮真面目，并且开始奔跑。
    // 这一步是单向的：显形之后不再回到温顺 / 贴合，也就永远不会再变回流浪者的外观。
    if (!this.skinRevealed && near < c.skinProvoke) {
      this.skinRevealed = true;
      this.skinPhase = "hunt";
      this.skinTimer = c.skinHuntMax;
      this.skinPassive = false;
      this.skinMend = 0;
      this.windup = 0;                          // 立刻起跑，不再有嘶吼起手
      this.state = "chase";
      try { AudioSys.roar(1); } catch (e) { /* 忽略 */ }
    }
    if (this.skinRevealed) return;              // 真面目是单向门，后面的循环不再跑
    const goHunt = () => {
      this.skinPhase = "hunt";
      this.skinTimer = c.skinHuntMax;
      this.skinPassive = false;
      this.windup = CONFIG.ENTITY_WINDUP;   // 起手的嘶吼：给玩家一个反应窗口
      AudioSys.roar(1);
    };
    const goMend = () => {
      const dur = rand(c.skinMendMin, c.skinMendMax);
      this.skinPhase = "mend";
      this.skinTimer = dur;
      this._mendDur = dur;
      this.skinMend = 0;
      this.skinPassive = true;
    };
    switch (this.skinPhase) {
      case "calm":
        this.skinPassive = true;
        this.skinTimer -= dt;
        // 温顺期不主动攻击 —— 除非你贴得太近，或者它饿了（温顺期结束）
        if (near < c.skinProvoke) goHunt();
        else if (this.skinTimer <= 0) goHunt();
        break;
      case "hunt":
        this.skinPassive = false;
        this.skinTimer -= dt;
        if (near < c.skinReveal) { this.skinPhase = "feed"; this.skinTimer = c.skinFeed; }
        else if (this.skinTimer <= 0) goMend();
        break;
      case "feed":
        this.skinPassive = false;
        this.skinTimer -= dt;
        if (this.skinTimer <= 0) goMend();
        break;
      case "mend":
      default:
        this.skinPassive = true;
        this.skinTimer -= dt;
        this.skinMend = clamp(1 - this.skinTimer / (this._mendDur || c.skinMendMax), 0, 1);
        if (this.skinTimer <= 0) {
          this.skinPhase = "calm";
          this.skinTimer = rand(c.skinCalmMin, c.skinCalmMax);
          this.skinMend = 1;
        }
        break;
    }
  }

  // 人形度：1 = 完全是那个流浪者的样子，0 = 松垮的白皮真面目
  skinHuman() {
    if (this.skinRevealed) return 0;           // 已露出真面目：永远不再是流浪者的样子
    if (!this.skinPhase) return 1;
    if (this.skinPhase === "mend") {
      const k = clamp(this.skinMend, 0, 1);
      return k * k * (3 - 2 * k);            // smoothstep：贴合先慢后快
    }
    return (this.skinPhase === "calm" || this.skinPhase === "hunt") ? 1 : 0;
  }

  update(dt, player, game) {
    this.age += dt;
    const dx = player.x - this.x, dy = player.y - this.y;
    const d = Math.hypot(dx, dy);

    // 窃皮者：先推进它那一身皮的循环（温顺 / 进食 / 贴合）
    if (this.kind === "skinstealer") this.updateSkin(dt, player, d);

    // Level ! 里那只笑魇：它不需要"看见"你 —— 它是这一层唯一的威胁，
    // 一旦靠视线判定就会在你冲远之后丢掉目标、转成游荡（游荡速度只有
    // 追击的 6 成，还会在 16 秒后被 respawn 挪走），于是在原地打转、
    // 看上去像卡在吐病床的那扇门口不动了。这里强制它始终锁定玩家。
    if (!this.docile && this.huntAlways) {
      this.state = "chase";
      this.seenTimer = 0;
    } else
    // 视野内发现玩家 -> 先"起手"（嘶吼 + 慢慢逼近），起手结束才真正扑上来
    // 第 11 效应：这一层的实体已经不再理会流浪者了
    if (!this.docile && !this.skinPassive && this.canSeePlayer(player, d)) {
      if (this.state !== "chase") {
        this.windup = CONFIG.ENTITY_WINDUP;
        AudioSys.roar(1);                 // 起手的嘶吼：给玩家一个明确的警告
        // 派对客：看见你就会呼叫队友 —— 一整层都会知道你在这儿
        if (this.cfg.callsAllies && game.entities) {
          this.callT = 0;
          if (game.toast) game.toast("派对客看见了你 —— 它在呼叫同伴");
        }
      }
      this.state = "chase";
      this.seenTimer = 0;
    } else if (this.state === "chase") {
      // 丢失目标超过该怪物设定的时间后回到游荡（潜伏者更执着）
      this.seenTimer += dt;
      if (this.seenTimer > this.lostTime) this.state = "wander";
    }

    // 窃皮者的进食期：它不需要"看见"你也照样找过来 —— 顶着那张人脸直接朝你冲
    if (this.kind === "skinstealer" && !this.docile &&
        (this.skinPhase === "hunt" || this.skinPhase === "feed") &&
        !inSanctuary(this.map, player.x, player.y, this.floor)) {
      this.state = "chase";
      this.seenTimer = 0;
    }

    // 派对客：追击中会不停呼叫 —— 附近的同伴陆续被拉进追击
    if (this.cfg.callsAllies && this.state === "chase" && game.entities) {
      this.callT = (this.callT || 0) + dt;
      if (this.callT > 2.2) {
        this.callT = 0;
        const R = CONFIG.ENTITY_SIGHT * TILE * 2.2;
        for (const e of game.entities) {
          if (e === this || e.dead || e.state === "chase") continue;
          if (Math.hypot(e.x - this.x, e.y - this.y) > R) continue;
          e.state = "chase";
          e.seenTimer = 0;
          e.windup = 0;                   // 被叫来的不用起手，直接扑
        }
      }
    }

    // 拟态：离得够远就会消失（原文：如果你离它足够远，它就会消失）
    if (this.cfg.shape === "mimic") {
      if (d > CONFIG.ENTITY_SIGHT * TILE * 2.6) {
        this.fadeT = (this.fadeT || 0) + dt;
        if (this.fadeT > 1.4) { this.dead = true; this.despawned = true; }
      } else {
        this.fadeT = 0;
      }
    }

    // 抓住玩家（第 11 效应下它们对你毫无兴趣，甚至会从你身上穿过去）
    // 窃皮者在温顺期 / 贴合过程中不会动手 —— 那会儿它就是个路人
    if (!this.docile && !this.skinPassive && d < this.radius + player.radius + 2) {
      // 萨曼莎：只要你带着优质的肉，她就不会为难你
      if (this.cfg.pacifiedBy && game.inv && game.inv[this.cfg.pacifiedBy] > 0) {
        if (!this.pacified) {
          this.pacified = true;
          this.state = "wander";
          if (game.toast) game.toast("萨曼莎闻到了肉香 —— 她看了你一眼，走开了");
        }
      } else {
        game.onCaught(this);
        return;
      }
    }

    // 远离玩家且长时间游荡 -> 在别处重新刷新（强刷新感）
    // Level ! 那只除外：它一旦被 respawn 挪走，整层的追逐就断了。
    if (this.state === "wander" && !this.huntAlways) {
      this.wanderTime += dt;
      if (this.wanderTime > 16 && d > 11 * TILE) {
        this.respawn(player);
        this.wanderTime = 0;
      }
    } else {
      this.wanderTime = 0;
    }

    let targetX = player.x, targetY = player.y;
    if (this.state === "wander") {
      this.wanderTimer -= dt;
      if (this.wanderTimer <= 0) {
        this.angle = rand(0, Math.PI * 2);
        this.wanderTimer = rand(1.2, 3.5);
      }
      targetX = this.x + Math.cos(this.angle) * TILE;
      targetY = this.y + Math.sin(this.angle) * TILE;
    }

    // 安全区：Alpha 基地 / Level 7 的岸上 —— 实体不会踏进去。
    // 玩家躲进去之后，它会在门口（或岸边）徘徊一阵，然后掉头走开。
    {
      const meIn = inSanctuary(this.map, this.x, this.y, this.floor);
      const pIn = inSanctuary(this.map, player.x, player.y, this.floor);
      if (meIn) {
        // 万一已经在里面了：挪出去（兜底，正常不会走到这一步）
        this.state = "leavebase";
      } else if (pIn && (this.state === "chase" || this.state === "windup")) {
        if (this.state !== "linger") { this.lingerLeft = 2.6; this.state = "linger"; }
      }
    }
    // 在门前徘徊：站着不动，等一会儿
    if (this.state === "linger") {
      this.lingerLeft = (this.lingerLeft || 0) - dt;
      if (this.lingerLeft <= 0) {
        const ex0 = sanctuaryExit(this.map);
        const ex = ex0 ? ex0.x : this.x, ey = ex0 ? ex0.y : this.y;
        // 掉头：朝背离安全区出口的方向走开
        this.angle = Math.atan2(this.y - ey, this.x - ex) + rand(-0.5, 0.5);
        this.wanderTimer = 3.2;
        this.state = "wander";
      }
      return;
    }
    // 已经在基地里：朝入口走，出去之后恢复游荡。
    // 房间里隔墙多，直着走会撞墙卡住 —— 走不出去就直接挪到门外，
    // 反正设定上实体根本不该出现在基地里。
    if (this.state === "leavebase") {
      const ex0 = sanctuaryExit(this.map) || { x: this.x, y: this.y };
      const ex = ex0.x, ey = ex0.y;
      this.ghost = true;      // 离开时穿过伸缩门 / 别的障碍，不然会被堵在里头
      moveWithCollision(this, ex, ey, this.wanderSpeed, dt, this.map, this.floor);
      this.leaveT = (this.leaveT || 0) + dt;
      if (!inSanctuary(this.map, this.x, this.y, this.floor)) {
        this.state = "wander"; this.wanderTimer = 2;
        this.ghost = false;              // 出来了就恢复正常的碰撞
        this.leaveT = 0;
      } else if (this.leaveT > 2.5) {
        // 卡在里面出不去了 —— 直接挪到安全区外面
        const ex1 = sanctuaryExit(this.map);
        if (ex1) { this.x = ex1.x; this.y = ex1.y; }
        this.state = "wander"; this.wanderTimer = 2;
        this.ghost = false; this.leaveT = 0;
      }
      return;
    }

    // 卡墙检测：几乎没移动就换方向
    const moved = Math.hypot(this.x - this.lastX, this.y - this.lastY);
    if (moved < 1) {
      this.stuckTime += dt;
      if (this.stuckTime > 0.5) { this.angle = rand(0, Math.PI * 2); this.stuckTime = 0; }
    } else {
      this.stuckTime = 0;
    }
    this.lastX = this.x;
    this.lastY = this.y;
    this.stepSpeed = moved / Math.max(0.016, dt);

    // 七层之物长期活在黑暗里，对光线极其敏感：手电照着它就会退开
    if (!this.docile && this.cfg.lightShy && game && game.flashlight) {
      const lit = clamp(1 - d / (CONFIG.ENTITY_SIGHT * TILE * 1.6), 0, 1);
      if (lit > 0.05) {
        this.state = "flee";
        this.fleeTime = 0.6;
      }
    }
    // 小小听觉强得离谱：你一疾跑（弄出大动静），它就知道你在哪
    if (!this.docile && this.cfg.noiseSeeker && game && game.player && game.player.sprinting && d < 16 * TILE) {
      this.state = "chase";
      this.seenTimer = 0;
    }

    let speed = this.state === "chase" ? this.speed : this.wanderSpeed;
    // 水里阻力大，实体也一样慢 —— 玩家游泳速度本来就打了折，不然根本甩不掉
    if (inWaterTile(this.map, this.y)) speed *= 0.62;
    if (this.state === "flee") {
      // 背离玩家逃开
      const fl = Math.max(1, d);
      targetX = this.x - (dx / fl) * TILE * 3;
      targetY = this.y - (dy / fl) * TILE * 3;
      speed = this.speed * 1.15;
      this.fleeTime = (this.fleeTime || 0) - dt;
      if (this.fleeTime <= 0) this.state = "wander";
    }
    if (this.state === "chase" && this.windup > 0) {
      // 起手期间只是慢慢逼近，不会瞬间贴脸
      this.windup = Math.max(0, this.windup - dt);
      speed *= CONFIG.ENTITY_WINDUP_MUL;
    }
    // 窃皮者靠近玩家之后开始奔跑：速度正好是玩家疾跑的 3/4（255 px/s），
    // 不受层级加成、水里阻力、起手减速影响 —— 就是一条固定的追赶线。
    if (this.kind === "skinstealer" && this.skinRevealed && this.state === "chase") {
      speed = CONFIG.PLAYER_SPRINT * 0.75;
    }
    moveWithCollision(this, targetX, targetY, speed, dt, this.map, this.floor);
  }

  // 在玩家视野外重新成形（重新播放刷新动画）
  respawn(player) {
    const list = floorList(this.map, this.floor);
    for (let i = 0; i < 80; i++) {
      const t = list[randInt(0, list.length - 1)];
      const px = (t.x + 0.5) * TILE, py = (t.y + 0.5) * TILE;
      const d = Math.hypot(px - player.x, py - player.y);
      if (d > 10 * TILE && d < 16 * TILE) {
        this.x = px; this.y = py;
        this.age = 0;
        this.state = "wander";
        this.angle = rand(0, Math.PI * 2);
        this.wanderTimer = rand(1, 3);
        AudioSys.growl();
        return;
      }
    }
  }

  canSeePlayer(player, d) {
    // 玩家在安全区里（Alpha 基地 / Level 7 的岸上）：怪发现不了，也不会追上来
    if (inSanctuary(this.map, player.x, player.y, player.floor)) return false;
    // 水里浑，看不了多远 —— 不然一下水就被隔老远锁定，根本没时间找物资
    const waterMul = inWaterTile(this.map, this.y) ? 0.55 : 1;
    // 视野也随难度放大（简单 <1 会变近）
    const dm2 = (typeof window !== "undefined" && window.__entMul) ? window.__entMul() : 1;
    if (d > CONFIG.ENTITY_SIGHT * TILE * this.cfg.sightMul * waterMul * (0.6 + dm2 * 0.4)) return false;
    // 不同楼层之间看不见彼此；关闭的门也会挡住视线
    if (this.floor !== (player.floor | 0)) return false;
    return hasLineOfSight(this.map, this.x, this.y, player.x, player.y, this.floor);
  }

  // 按怪物种类绘制（统一：只画视角内、被视野光照分割）
  draw(ctx, g, cam) {
    const t = g.time;
    const bob = Math.sin(t * 9 + this.seed) * 1.4;
    const p = clamp(this.age / this.spawnDuration, 0, 1); // 刷新进度
    const flick = p < 1 ? (Math.sin(t * 58 + this.seed) > 0.15 ? 1 : 0.2) : 1;
    const R = CONFIG.LIGHT_RADIUS * TILE * (0.92 * g.flicker);
    const plx = g.player.x, ply = g.player.y;
    const fx = this.x, fy = this.y;
    const light = (wx, wy) => clamp(1 - Math.hypot(wx - plx, wy - ply) / R, 0, 1);

    ctx.save();
    ctx.beginPath();
    ctx.rect(cam.x - cam.viewW / 2, cam.y - cam.viewH / 2, cam.viewW, cam.viewH);
    ctx.clip();

    // 影子
    const shA = light(fx, fy + 10) * 0.35;
    if (shA > 0.02) {
      ctx.globalAlpha = shA;
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.ellipse(fx, fy + 10, 12, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    if (this.kind === "lurker") this.drawLurker(ctx, t, p, bob, fx, fy, plx, ply, light, flick);
    else if (this.kind === "pipeworm") this.drawPipeworm(ctx, t, p, bob, fx, fy, plx, ply, light, flick);
    else if (this.cfg && this.cfg.shape) this.drawShaped(ctx, t, p, bob, fx, fy, light, flick, plx, ply);
    else this.drawBacterium(ctx, t, p, bob, fx, fy, light, flick);

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  // Level 0：黑色鞭毛体（像素重组：头部 + 黑色鞭毛构成的"脚"）
  drawBacterium(ctx, t, p, bob, fx, fy, light, flick) {
    // 头部：黑色椭圆形
    const headY = fy - 15 + bob;
    const sway = Math.sin(t * 2.2 + this.seed) * 2;
    const headA = light(fx + sway, headY) * flick * (p > 0.12 ? 1 : 0);
    if (headA > 0.02) {
      ctx.globalAlpha = headA;
      ctx.fillStyle = "#07080d";
      ctx.beginPath();
      ctx.ellipse(fx + sway, headY, 11, 7.5, Math.sin(t * 3 + this.seed) * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
    // 身体 = 只有脚：12 条黑色鞭毛（线条）向下扇形散开，每条由小方块构成
    const legs = 12;
    for (let i = 0; i < legs; i++) {
      const thick = 1.6 + hash2(i + 7, this.seed) * 1.6;
      const L = 20 + hash2(i, this.seed) * 14;
      const a = Math.PI / 2 + (i / (legs - 1) - 0.5) * 2.6 + Math.sin(t * 3 + i) * 0.12;
      const wob = Math.sin(t * 7 + i * 1.7 + this.seed) * 3.5; // 爬行摆动
      const segs = 6;
      for (let j = 0; j < segs; j++) {
        const u = j / (segs - 1);
        const bx = fx + Math.cos(a) * u * L * 0.85;
        const by = headY + 7 + u * (L * 0.85 + 8) + Math.sin(u * Math.PI) * wob;
        // 刷新：每一段按伪随机顺序点亮（像素重组）
        const order = hash2(i * 31 + j, Math.floor(this.seed) + 7);
        if (order > p) continue;
        const la = light(bx, by) * flick;
        if (la <= 0.02) continue;
        const s = thick * (1 - u * 0.5); // 根部粗、末端细
        ctx.globalAlpha = la;
        ctx.fillStyle = "#07080d";
        ctx.fillRect(bx - s / 2, by - s / 2, s, s);
      }
    }
  }

  // Level 1：潜伏者 —— 混凝土灰白色的贴地爬行者，无眼，缓慢而执着
  drawLurker(ctx, t, p, bob, fx, fy, plx, ply, light, flick) {
    const c = this.cfg.color;
    const dx = plx - fx, dy = ply - fy;
    const dd = Math.hypot(dx, dy) || 1;
    const ux = dx / dd, uy = dy / dd; // 朝向玩家
    const px = -uy, py = ux;          // 垂直方向
    const rear = Math.sin(t * 5 + this.seed) * 2; // 蠕动起伏
    const bodyA = light(fx, fy) * flick * (p > 0.15 ? 1 : 0);
    if (bodyA <= 0.02) return;
    ctx.globalAlpha = bodyA;

    // 8 条细肢（两侧各 4，贴地拖动）
    ctx.strokeStyle = c;
    ctx.lineCap = "round";
    for (let i = 0; i < 4; i++) {
      const u = 0.15 + i * 0.22;
      for (const s of [-1, 1]) {
        const bx = fx - ux * u * 24 + px * s * (7 + i * 1.4);
        const by = fy + 7 + uy * u * 5 - rear * 0.4;
        const tx = fx - ux * (u * 24 + 11) + px * s * 15;
        const ty = fy + 13;
        ctx.lineWidth = 2.6 - i * 0.35;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.quadraticCurveTo(bx + px * s * 7, by + 4, tx, ty);
        ctx.stroke();
      }
    }
    // 躯干（扁平，尾部略翘）
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.ellipse(fx - ux * 9, fy + 2 - rear, 15, 7.5, Math.atan2(uy, ux), 0, Math.PI * 2);
    ctx.fill();
    // 头部（前伸钝形，无眼）
    ctx.beginPath();
    ctx.ellipse(fx + ux * 10, fy - 1 - rear, 8.5, 6, Math.atan2(uy, ux), 0, Math.PI * 2);
    ctx.fill();
    // 嘴（一道暗缝）
    ctx.strokeStyle = "rgba(30,30,34,0.75)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(fx + ux * 16 + px * 3, fy + 1 - rear);
    ctx.lineTo(fx + ux * 16 - px * 3, fy + 1 - rear);
    ctx.stroke();
    // 背上的暗斑
    ctx.fillStyle = "rgba(0,0,0,0.14)";
    ctx.beginPath();
    ctx.ellipse(fx - ux * 3, fy + 1 - rear, 4, 2.8, Math.atan2(uy, ux), 0, Math.PI * 2);
    ctx.fill();
  }

  // Level 2+：管栖者 —— 一节一节的长虫，暗红色，节缝喷出蒸汽
  drawPipeworm(ctx, t, p, bob, fx, fy, plx, ply, light, flick) {
    const c = this.cfg.color;
    const dx = plx - fx, dy = ply - fy;
    const dd = Math.hypot(dx, dy) || 1;
    const ux = dx / dd, uy = dy / dd; // 头部朝向玩家
    const perpX = -uy, perpY = ux;
    const bodyA = light(fx, fy) * flick * (p > 0.15 ? 1 : 0);
    if (bodyA <= 0.02) return;
    ctx.globalAlpha = bodyA;

    const segs = 6;
    for (let i = segs - 1; i >= 0; i--) {
      const u = i / (segs - 1);
      // 身体摆动：幅度向尾部增大
      const sw = Math.sin(t * 6 + this.seed + i * 1.2) * (1 + i * 0.8);
      const sx = fx - ux * u * 30 + perpX * sw;
      const sy = fy - uy * u * 30 + perpY * sw + 2;
      const r = 7 * (1 - u * 0.42);
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
      // 节缝
      ctx.strokeStyle = "rgba(0,0,0,0.35)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sx - ux * r * 0.55, sy - uy * r * 0.55);
      ctx.lineTo(sx + ux * r * 0.55, sy + uy * r * 0.55);
      ctx.stroke();
    }
    // 头部：前端开口（吸盘）
    ctx.fillStyle = "rgba(20,12,10,0.85)";
    ctx.beginPath();
    ctx.arc(fx + ux * 5, fy + uy * 5, 2.4, 0, Math.PI * 2);
    ctx.fill();
    // 节缝间喷出的蒸汽微粒（随刷新进度渐显）
    const seedF = Math.floor(this.seed);
    ctx.fillStyle = "rgba(205,205,215,0.5)";
    for (let k = 0; k < 5; k++) {
      if (hash2(k + 21, seedF) > p) continue;
      const vx = fx + (hash2(k + 11, seedF) - 0.5) * 16 - ux * 12;
      const vy = fy - 4 - uy * 12 + ((t * 22 + k * 9) % 12) - 6;
      ctx.fillRect(vx, vy, 1.6, 1.6);
    }
  }

  // Kitty —— 3.2 米高、四肢异常修长、无手无脚。皮肤黢黑，触感像无双黑布料。
  // 它没有脸：整个脑袋就是黑乎乎的一团，眼睛、嘴、鼻子一概没有。
  // 移动时顺滑而敏捷，常常悄无声息地出现在你附近。它不伤人 —— 只是跟着。
  drawKitty(ctx, t, p, bob, fx, fy) {
    const baseA = ctx.globalAlpha;
    const moving = this.stepSpeed > 10;
    const ph = Math.sin(t * (moving ? 4.2 : 1.3) + this.seed);
    const yy = fy + bob * 0.3;
    // 3.2 米：比普通人高出一截（普通实体画出来约 40px，它到 92px）
    const footY = yy + 13;
    const headTop = yy - 79;
    const hipY = headTop + 54;
    const shY = headTop + 16;
    const bodyW = 7.5;                     // 躯干半宽：细得反常

    // 影子
    ctx.globalAlpha = baseA * 0.30;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(fx, fy + 12, 13, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = baseA;

    const skin = "#0d0b0e";
    const skinL = "#1a171c";               // 布料微微反光的那一点

    // 腿：修长、笔直，末端是钝的 —— 没有脚
    ctx.strokeStyle = skin;
    ctx.lineCap = "round";
    ctx.lineWidth = 6.2;
    const step = ph * (moving ? 7 : 1.2);
    ctx.beginPath();
    ctx.moveTo(fx - 4, hipY); ctx.lineTo(fx - 4 + step, footY);
    ctx.moveTo(fx + 4, hipY); ctx.lineTo(fx + 4 - step, footY);
    ctx.stroke();

    // 躯干：细长的一根
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.moveTo(fx - bodyW, shY);
    ctx.quadraticCurveTo(fx - bodyW - 1, (shY + hipY) / 2, fx - bodyW + 0.5, hipY);
    ctx.lineTo(fx + bodyW - 0.5, hipY);
    ctx.quadraticCurveTo(fx + bodyW + 1, (shY + hipY) / 2, fx + bodyW, shY);
    ctx.quadraticCurveTo(fx, shY - 3, fx - bodyW, shY);
    ctx.closePath();
    ctx.fill();
    // 布料那种哑光的褶：几道极淡的竖痕
    ctx.strokeStyle = "rgba(70,66,74,0.35)";
    ctx.lineWidth = 1;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(fx + i * 3.5, shY + 4);
      ctx.lineTo(fx + i * 3.5, hipY - 3);
      ctx.stroke();
    }

    // 手臂：长到垂过膝盖，末端同样是钝的 —— 没有手
    ctx.strokeStyle = skin;
    ctx.lineWidth = 5.4;
    const armSw = ph * (moving ? 5 : 0.9);
    ctx.beginPath();
    ctx.moveTo(fx - bodyW + 1, shY + 2);
    ctx.quadraticCurveTo(fx - bodyW - 4, shY + 26, fx - bodyW - 3 + armSw, shY + 48);
    ctx.moveTo(fx + bodyW - 1, shY + 2);
    ctx.quadraticCurveTo(fx + bodyW + 4, shY + 26, fx + bodyW + 3 - armSw, shY + 48);
    ctx.stroke();

    // 头：一个略长的黑团。没有眼睛，没有嘴，没有鼻子 —— 什么都没有。
    const headY = headTop + 12;
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.ellipse(fx, headY, 8.4, 11.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // 与脖子之间几乎看不出分界
    ctx.fillRect(fx - 3.2, headY + 8, 6.4, 6);
    // 布料吸光后那一点点边缘的反光 —— 只有轮廓，不露出任何五官
    ctx.strokeStyle = "rgba(120,116,126,0.22)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(fx - 2, headY - 1, 6.6, 9.6, 0, Math.PI * 1.15, Math.PI * 1.75);
    ctx.stroke();
    ctx.globalAlpha = baseA;
  }

  // 窃皮者：只有一套模型 —— 玩家那套「生化防护服」人物的轮廓。
  // 没靠近时顶着这套皮装成流浪者；一旦靠近就揭开：同一副身子、松垮的白皮真面目。
  // 两种外观共用 drawHazmatFigure，不是另外做一只怪物。
  drawSkinstealer(ctx, t, p, bob, fx, fy, light, flick, plx, ply) {
    const yy = fy + bob * 0.5;
    const raw = !!this.skinRevealed;
    if (window.drawHazmatFigure) { window.drawHazmatFigure(ctx, fx, yy, t, { trueForm: raw }); return; }
    // 兜底：绘制模块万一没加载，至少也分得出「黄衣服」和「白皮」两种，不会混成一种
    ctx.fillStyle = "rgba(0,0,0,0.32)";
    ctx.beginPath(); ctx.ellipse(fx, fy + 9, 12, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = raw ? "#dedac9" : "#f2c518";
    ctx.beginPath(); ctx.ellipse(fx, yy, 10, 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = raw ? "#e7e2d3" : "#191919";
    ctx.beginPath(); ctx.ellipse(fx, yy - 9, 7.5, 8.5, 0, 0, Math.PI * 2); ctx.fill();
    if (raw) {
      // 嘴下到嘴巴那一道短短的缝
      ctx.strokeStyle = "#4a3b30"; ctx.lineWidth = 1.7; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(fx, yy - 6.2); ctx.lineTo(fx, yy - 1.8); ctx.stroke();
    }
  }

  // 刷新中的"成形"特效：扫描线 + 雪花噪点，画在迷雾之上，黑暗中也能看见
  drawSpawnFx(ctx, g, cam) {
    const p = clamp(this.age / this.spawnDuration, 0, 1);
    if (p >= 1) return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(cam.x - cam.viewW / 2, cam.y - cam.viewH / 2, cam.viewW, cam.viewH);
    ctx.clip();
    const fx = this.x, fy = this.y;
    // 扫描线颜色按怪物种类微调
    const lineColor = this.kind === "pipeworm" ? "#d8a08a" : this.kind === "lurker" ? "#c2d0b8" : "#9a9aa4";
    // 垂直扫描线（从上往下"打印"）
    const scanY = fy - 27 + p * 54;
    ctx.globalAlpha = 0.35 + 0.3 * Math.sin(g.time * 55 + this.seed);
    ctx.fillStyle = lineColor;
    ctx.fillRect(fx - 23, scanY - 1, 46, 2);
    // 雪花噪点（CRT 雪花感）
    const fl = Math.sin(g.time * 50 + this.seed) > 0 ? 1 : 0.3;
    const seedF = Math.floor(this.seed);
    for (let k = 0; k < 16; k++) {
      const nx = fx + (hash2(k + 1, seedF) - 0.5) * 58;
      const ny = fy - 27 + (hash2(k + 3, seedF) - 0.5) * 54;
      if (hash2(k + 5, seedF) > p) continue;
      ctx.globalAlpha = 0.75 * fl;
      ctx.fillStyle = lineColor;
      ctx.fillRect(nx, ny, 3, 3);
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  // ---------- Level 3 的杂鱼：按 cfg.shape 画不同的轮廓 ----------
  drawShaped(ctx, t, p, bob, fx, fy, light, flick, plx, ply) {
    const faceX = plx == null ? fx : plx;      // 眼睛盯着玩家看
    const faceY = ply == null ? fy + 20 : ply;
    const shape = this.cfg.shape;
    const col = this.cfg.color;
    const a = light(fx, fy);
    const spawn = p < 1 ? flick : 1;        // 刷新动画：闪烁着成形
    // 起手期间整体泛红，等于给玩家一个"它盯上你了"的信号
    const wind = this.state === "chase" && this.windup > 0;
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, a * spawn));
    if (wind) {
      const k = 0.35 + 0.65 * Math.abs(Math.sin(t * 16));
      ctx.shadowColor = "rgba(255,40,30," + k.toFixed(3) + ")";
      ctx.shadowBlur = 16;
    }

    if (shape === "lurker30") {
      // 记忆潜伏者（Level 30）：酷似鱿鱼，飘在半空，触手一直扭。
      // 它抓的不是身子，是头 —— 被它抓住的人会被改掉记忆（腐化）。
      const yy = fy - 12 + Math.sin(t * 1.6 + fx * 0.2) * 5;   // 悬空起伏
      ctx.fillStyle = "rgba(40,20,70,0.22)";
      ctx.beginPath(); ctx.ellipse(fx, fy + 16, 15, 5, 0, 0, Math.PI * 2); ctx.fill();
      // 触手：八条，各自摆动
      ctx.strokeStyle = "#5b4a86"; ctx.lineCap = "round"; ctx.lineWidth = 3.2;
      for (let i = 0; i < 8; i++) {
        const a = -0.9 + i * 0.26;
        const sw = Math.sin(t * 3.2 + i * 0.9) * 6;
        ctx.beginPath();
        ctx.moveTo(fx + Math.cos(a) * 4, yy + 12);
        ctx.quadraticCurveTo(fx + Math.cos(a) * 12 + sw * 0.4, yy + 22,
                             fx + Math.cos(a) * 15 + sw, yy + 34 + Math.abs(Math.sin(t * 2 + i)) * 5);
        ctx.stroke();
      }
      // 外套膜：一枚尖朝上的锥
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(fx, yy - 26);
      ctx.quadraticCurveTo(fx + 15, yy - 6, fx + 11, yy + 12);
      ctx.lineTo(fx - 11, yy + 12);
      ctx.quadraticCurveTo(fx - 15, yy - 6, fx, yy - 26);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgba(210,190,255,0.22)";       // 高光
      ctx.beginPath();
      ctx.moveTo(fx - 4, yy - 22); ctx.quadraticCurveTo(fx - 11, yy - 4, fx - 7, yy + 10);
      ctx.lineTo(fx - 3, yy + 10); ctx.quadraticCurveTo(fx - 6, yy - 4, fx - 1, yy - 22);
      ctx.closePath(); ctx.fill();
      // 两片鳍
      ctx.fillStyle = "rgba(150,120,210,0.75)";
      ctx.beginPath(); ctx.ellipse(fx - 14, yy - 6, 7, 11, 0.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(fx + 14, yy - 6, 7, 11, -0.5, 0, Math.PI * 2); ctx.fill();
      // 眼：两只，一直盯着你
      ctx.fillStyle = "#f2ecff";
      ctx.beginPath(); ctx.ellipse(fx - 6, yy + 2, 4.4, 3.4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(fx + 6, yy + 2, 4.4, 3.4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#20142f";
      ctx.beginPath(); ctx.ellipse(fx - 6, yy + 2, 2.0, 2.4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(fx + 6, yy + 2, 2.0, 2.4, 0, 0, Math.PI * 2); ctx.fill();
    } else if (shape === "partypooper") {
      // 派对客：黄皮肤、脸上用红色液体画着僵硬的微笑，脖子跟头一样粗。
      // 以前手臂是平举的、两条腿叉开站定不动 —— 看着像摆造型的稻草人。
      // 现在会走：手臂前后摆、两腿交替迈步，追人的时候挥得更凶。
      const yy = fy + bob * 0.4;
      const moving = (this.state === "chase" || this.state === "windup" || this.state === "wander");
      // 行走相位：走得越快摆得越快
      this._stepT = (this._stepT || 0) + (moving ? (t - (this._lastT || t)) : 0);
      this._lastT = t;
      const ph = Math.sin(this._stepT * (this.state === "chase" ? 11 : 6));
      const swing = this.state === "chase" ? 9 : 5;
      ctx.fillStyle = "rgba(0,0,0,0.30)";
      ctx.beginPath(); ctx.ellipse(fx, fy + 16, 13, 5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = col; ctx.lineCap = "round";
      // 两条腿：从胯部往下，前后交替迈步（不再叉开站死）
      ctx.lineWidth = 5.5;
      ctx.beginPath();
      ctx.moveTo(fx - 2, yy + 12); ctx.lineTo(fx - 2 + ph * 5, yy + 25);
      ctx.moveTo(fx + 2, yy + 12); ctx.lineTo(fx + 2 - ph * 5, yy + 25);
      ctx.stroke();
      // 躯干
      ctx.fillStyle = col;
      ctx.fillRect(fx - 8, yy - 6, 16, 19);
      // 两条手臂：垂在身侧前后摆动；追击时朝前伸过来抓人
      ctx.lineWidth = 5.5; ctx.strokeStyle = col;
      ctx.beginPath();
      if (this.state === "chase") {
        ctx.moveTo(fx - 7, yy - 2); ctx.lineTo(fx - 13, yy + 6 + ph * 2);
        ctx.moveTo(fx + 7, yy - 2); ctx.lineTo(fx + 13, yy + 6 - ph * 2);
      } else {
        ctx.moveTo(fx - 7, yy - 2); ctx.lineTo(fx - 9 - swing * 0.4, yy + 11 + ph * swing);
        ctx.moveTo(fx + 7, yy - 2); ctx.lineTo(fx + 9 + swing * 0.4, yy + 11 - ph * swing);
      }
      ctx.stroke();
      // 脖子与头一样粗 —— 一段短柱 + 同宽的方块头
      ctx.fillRect(fx - 6, yy - 12, 12, 8);
      ctx.fillRect(fx - 7, yy - 26, 14, 15);
      // 脸：僵硬的微笑 "=)"
      ctx.strokeStyle = "rgba(40,26,10,0.85)"; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(fx - 4, yy - 20); ctx.lineTo(fx - 1, yy - 20);
      ctx.moveTo(fx + 1, yy - 20); ctx.lineTo(fx + 4, yy - 20);
      ctx.stroke();
      ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.arc(fx, yy - 17, 4, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
      // 脸上的红色液体（疑似血）
      ctx.fillStyle = "rgba(190,40,35,0.85)";
      ctx.fillRect(fx - 7, yy - 24, 3, 12);
      ctx.beginPath(); ctx.ellipse(fx + 4, yy - 14, 2.6, 3.6, 0.3, 0, Math.PI * 2); ctx.fill();    } else if (shape === "bride") {
      // 新娘：只在 Level 485 出现。比常人小一号，一身发黄的白婚纱，
      // 拖着长长的头纱 —— 个头小、动作慢，但碰到就是死。
      const yy = fy + bob * 0.4;
      // 影子
      ctx.fillStyle = "rgba(0,0,0,0.30)";
      ctx.beginPath(); ctx.ellipse(fx, fy + 12, 10, 3.5, 0, 0, Math.PI * 2); ctx.fill();
      // 头纱（拖在身后，微微飘）
      ctx.fillStyle = "rgba(216,210,196,0.42)";
      ctx.beginPath();
      ctx.moveTo(fx - 8, yy - 16);
      ctx.quadraticCurveTo(fx - 15, yy - 2, fx - 11 + Math.sin(t * 1.6) * 2, fy + 10);
      ctx.lineTo(fx + 11 + Math.sin(t * 1.6 + 1) * 2, fy + 10);
      ctx.quadraticCurveTo(fx + 15, yy - 2, fx + 8, yy - 16);
      ctx.closePath(); ctx.fill();
      // 婚纱：上窄下宽的裙摆
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(fx - 4, yy - 12);
      ctx.lineTo(fx + 4, yy - 12);
      ctx.lineTo(fx + 9, fy + 10);
      ctx.lineTo(fx - 9, fy + 10);
      ctx.closePath(); ctx.fill();
      // 裙摆上的褶皱
      ctx.strokeStyle = "rgba(120,114,102,0.45)"; ctx.lineWidth = 1;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(fx + i * 3.2, yy - 6);
        ctx.lineTo(fx + i * 5.4, fy + 9);
        ctx.stroke();
      }
      // 上身（束腰）
      ctx.fillStyle = "#cfc8b8";
      ctx.fillRect(fx - 4, yy - 13, 8, 8);
      // 头
      ctx.fillStyle = "#e2ddd0";
      ctx.beginPath(); ctx.arc(fx, yy - 17, 4.6, 0, Math.PI * 2); ctx.fill();
      // 盖在脸上的头纱
      ctx.fillStyle = "rgba(228,224,214,0.72)";
      ctx.beginPath(); ctx.ellipse(fx, yy - 17, 5.2, 5.6, 0, 0, Math.PI * 2); ctx.fill();
      // 头纱下两个黑窟窿（眼睛）
      ctx.fillStyle = "#15130f";
      ctx.beginPath(); ctx.arc(fx - 1.8, yy - 18, 1.1, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(fx + 1.8, yy - 18, 1.1, 0, Math.PI * 2); ctx.fill();
      // 手里那束早就枯了的花
      ctx.fillStyle = "#6a5c3a";
      ctx.fillRect(fx - 7, yy - 6, 2, 6);
      ctx.fillStyle = "#8a7a52";
      ctx.beginPath(); ctx.arc(fx - 6, yy - 8, 2.4, 0, Math.PI * 2); ctx.fill();

    } else if (shape === "mimic") {
      // 拟态：伪装成"你"的样子。远看是个穿着同样服装的人 —— 离近了才现形。
      const yy = fy + bob * 0.5;
      const near = this.state === "chase";      // 暴露了：不再是你的样子
      ctx.fillStyle = "rgba(0,0,0,0.30)";
      ctx.beginPath(); ctx.ellipse(fx, fy + 15, 11, 4.5, 0, 0, Math.PI * 2); ctx.fill();
      if (near) {
        // 暴露原样：一团扭曲的暗色东西，原本的脸在慢慢裂开
        ctx.fillStyle = "#2e2b2a";
        ctx.beginPath(); ctx.ellipse(fx, yy, 11, 15, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#161414";
        ctx.beginPath(); ctx.arc(fx, yy - 15, 8, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "rgba(220,70,55,0.8)"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(fx, yy - 15, 5, 0.2 * Math.PI, 1.4 * Math.PI); ctx.stroke();
        ctx.fillStyle = "rgba(255,60,50,0.9)";
        ctx.beginPath(); ctx.arc(fx - 3, yy - 17, 1.6, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(fx + 3, yy - 17, 1.6, 0, Math.PI * 2); ctx.fill();
      } else {
        // 伪装中：和你穿着一样的衣服，轮廓是个人
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.ellipse(fx, yy, 9, 13, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(fx, yy - 14, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.12)";
        ctx.beginPath(); ctx.ellipse(fx, yy, 4, 8, 0, 0, Math.PI * 2); ctx.fill();
        // 一点不对劲：轮廓在轻轻抖
        ctx.strokeStyle = "rgba(255,255,255,0.10)"; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(fx + Math.sin(t * 9) * 1.2, yy, 11, 15, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (shape === "hound") {
      // 猎犬：低矮的四足剪影，脊背起伏
      const yy = fy + bob * 0.4;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(fx, yy, 14, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(fx + 12, yy - 4, 6, 5, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = col;
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const lx = fx - 9 + i * 6;
        const sw = Math.sin(t * 14 + i * 1.7) * 3;
        ctx.moveTo(lx, yy + 5);
        ctx.lineTo(lx + sw, yy + 14);
      }
      ctx.stroke();
      ctx.fillStyle = "rgba(255,150,60,0.9)";
      ctx.fillRect(fx + 14, yy - 6, 2, 2);
    } else if (shape === "faceling") {
      // 无面灵：苍白人形，脸上是一片空白
      const yy = fy + bob * 0.5;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(fx, yy, 9, 13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(fx, yy - 14, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(0,0,0,0.10)";
      ctx.beginPath();
      ctx.ellipse(fx, yy, 5, 9, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (shape === "smiler") {
      // 笑魇：一团黑，只剩一张咧到耳根的嘴和两只眼
      const yy = fy + bob * 0.3;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(fx, yy, 13, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f5f5f5";
      ctx.beginPath();
      ctx.moveTo(fx - 8, yy - 1);
      ctx.quadraticCurveTo(fx, yy + 8, fx + 8, yy - 1);
      ctx.quadraticCurveTo(fx, yy + 1, fx - 8, yy - 1);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.beginPath();
      ctx.arc(fx - 5, yy - 6, 2, 0, Math.PI * 2);
      ctx.arc(fx + 5, yy - 6, 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (shape === "moth") {
      // 死亡飞蛾：扑腾的翅膀 + 鳞粉
      const flap = Math.abs(Math.sin(t * 11 + this.seed));
      const yy = fy + bob;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(fx - 11, yy - 2, 11 * (0.5 + flap * 0.6), 8, -0.3, 0, Math.PI * 2);
      ctx.ellipse(fx + 11, yy - 2, 11 * (0.5 + flap * 0.6), 8, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#4a4436";
      ctx.beginPath();
      ctx.ellipse(fx, yy, 4, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(230,220,180,0.35)";
      for (let i = 0; i < 5; i++) {
        const a2 = t * 2 + i;
        ctx.fillRect(fx + Math.cos(a2) * 14, yy + Math.sin(a2) * 10, 1.5, 1.5);
      }
    } else if (shape === "kitty") {
      // Kitty：Level 974 里唯一的实体。3.2 米高、四肢异常修长、无手无脚，
      // 一身黢黑的皮肤（摸上去像无双黑布料），脸上什么都没有。
      this.drawKitty(ctx, t, p, bob, fx, fy);
    } else if (shape === "skinstealer") {
      // 窃皮者：一身皮的循环（流浪者形态 ↔ 松垮的白皮真面目）
      this.drawSkinstealer(ctx, t, p, bob, fx, fy, light, flick, plx, ply);
    } else if (shape === "watcher") {
      // 观察者：几乎不动，只是站在那里盯着你
      const yy = fy + bob * 0.2;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(fx, yy, 9, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(fx, yy - 20, 6.5, 7.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(240,240,255,0.9)";
      ctx.beginPath();
      ctx.arc(fx - 2.6, yy - 21, 1.9, 0, Math.PI * 2);
      ctx.arc(fx + 2.6, yy - 21, 1.9, 0, Math.PI * 2);
      ctx.fill();
    } else if (shape === "woodling") {
      // 木灵：像用旧木头削出来的小人，关节处有木纹
      const yy = fy + bob * 0.7;
      ctx.fillStyle = col;
      ctx.fillRect(fx - 8, yy - 8, 16, 18);
      ctx.beginPath();
      ctx.arc(fx, yy - 13, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(40,24,10,0.65)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(fx - 6, yy - 2); ctx.lineTo(fx + 6, yy - 2);
      ctx.moveTo(fx - 6, yy + 5); ctx.lineTo(fx + 6, yy + 5);
      ctx.stroke();
      ctx.fillStyle = "rgba(20,12,6,0.9)";
      ctx.fillRect(fx - 3.5, yy - 14, 2, 2);
      ctx.fillRect(fx + 1.5, yy - 14, 2, 2);
    } else if (shape === "cryer") {
      // 啼物：一直在哭的东西，眼泪淌个不停
      const yy = fy + bob * 0.5;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(fx, yy, 10, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(fx, yy - 16, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(180,210,230,0.8)";
      ctx.beginPath();
      ctx.arc(fx, yy - 11, 4.5, 0, Math.PI);          // 张开的嘴
      ctx.fill();
      ctx.fillStyle = "rgba(200,225,240,0.7)";
      ctx.fillRect(fx - 5, yy - 14, 1.4, 5 + Math.sin(t * 6) * 2);
      ctx.fillRect(fx + 4, yy - 14, 1.4, 5 + Math.cos(t * 5) * 2);
    } else if (shape === "rat") {
      // 尸鼠：小而快，贴着地面窜
      const yy = fy + bob * 0.3;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(fx, yy, 9, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(fx + 8, yy - 1, 3.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = col;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(fx - 8, yy + 2);
      ctx.quadraticCurveTo(fx - 15, yy + Math.sin(t * 12) * 4, fx - 19, yy + 3);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,90,60,0.85)";
      ctx.fillRect(fx + 9.5, yy - 2, 1.8, 1.8);
    } else if (shape === "ant") {
      // Entity 89 · 蚂蚁：一整群小东西挤在一起
      const yy = fy + bob * 0.4;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(fx, yy, 4.5, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = col;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a2 = t * 7 + i * 1.05;
        ctx.moveTo(fx, yy);
        ctx.lineTo(fx + Math.cos(a2) * 11, yy + Math.sin(a2) * 8);
      }
      ctx.stroke();
      ctx.fillStyle = "rgba(255,120,60,0.5)";
      ctx.fillRect(fx - 1.5, yy - 8, 3, 2);
    } else if (shape === "samantha") {
      // 萨曼莎：一个普通得过分的人影，站在那里看着你
      const yy = fy + bob * 0.35;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(fx, yy, 9, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(fx, yy - 18, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#3a2a20";
      ctx.beginPath();
      ctx.arc(fx, yy - 21, 7, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(30,20,15,0.85)";
      ctx.fillRect(fx - 3.6, yy - 19, 1.8, 2);
      ctx.fillRect(fx + 1.8, yy - 19, 1.8, 2);
      ctx.strokeStyle = "rgba(120,60,60,0.6)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(fx - 2, yy - 14); ctx.lineTo(fx + 2, yy - 14);
      ctx.stroke();
    } else if (shape === "snake") {
      // 牧蛇：细长的躯体，类人的头，一双发光的白眼；雄性永远在笑
      const yy = fy + bob * 0.5;
      ctx.strokeStyle = col;
      ctx.lineWidth = 9;
      ctx.lineCap = "round";
      ctx.beginPath();
      let px2 = fx, py2 = yy;
      ctx.moveTo(px2, py2);
      for (let i = 1; i <= 6; i++) {
        const a2 = t * 1.4 + i * 0.75 + this.seed;
        px2 = fx - Math.cos(this.angle) * i * 11 + Math.sin(a2) * 6;
        py2 = yy - Math.sin(this.angle) * i * 11 + Math.cos(a2) * 6;
        ctx.lineTo(px2, py2);
      }
      ctx.stroke();
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(fx + Math.cos(this.angle) * 4, yy + Math.sin(this.angle) * 4, 9, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(250,250,255,0.95)";
      ctx.beginPath();
      ctx.arc(fx + Math.cos(this.angle) * 8 - 3, yy + Math.sin(this.angle) * 8 - 2, 2.1, 0, Math.PI * 2);
      ctx.arc(fx + Math.cos(this.angle) * 8 + 3, yy + Math.sin(this.angle) * 8 - 2, 2.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(20,20,20,0.8)";   // 那幅令人不安的大笑
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(fx + Math.cos(this.angle) * 8, yy + Math.sin(this.angle) * 8 + 1, 4.5, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
    } else if (shape === "spider") {
      // 洞穴蛛群：一团挤在一起的东西，八条腿不停地动
      const yy = fy + bob * 0.4;
      ctx.strokeStyle = col;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a2 = (i / 8) * Math.PI * 2 + Math.sin(t * 9 + i) * 0.25;
        ctx.moveTo(fx, yy);
        ctx.lineTo(fx + Math.cos(a2) * 14, yy + Math.sin(a2) * 11);
      }
      ctx.stroke();
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(fx, yy, 8, 6.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(220,80,60,0.85)";
      ctx.fillRect(fx - 3, yy - 4, 2, 2);
      ctx.fillRect(fx + 1, yy - 4, 2, 2);
    } else if (shape === "thing7") {
      // 七层之物：巨大、漆黑，好像海水本身长出了形体
      const yy = fy + bob * 0.8;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(fx, yy, 22, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(10,14,20,0.95)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a2 = t * 1.1 + i * 1.25;
        ctx.moveTo(fx, yy);
        ctx.lineTo(fx + Math.cos(a2) * 34, yy + Math.sin(a2) * 24);
      }
      ctx.stroke();
      ctx.fillStyle = "rgba(230,240,255,0.75)";       // 深海里的两点微光
      ctx.beginPath();
      ctx.arc(fx - 8, yy - 4, 2.6, 0, Math.PI * 2);
      ctx.arc(fx - 1, yy - 4, 2.6, 0, Math.PI * 2);
      ctx.fill();
    } else if (shape === "wretch") {
      // 悲尸：佝偻着背的人形，皮肤是被血浸透的暗红，双臂垂在身前
      const yy = fy + bob * 0.5;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(fx, yy + 2, 10, 13, 0.12, 0, Math.PI * 2);   // 佝偻的躯干
      ctx.fill();
      ctx.beginPath();
      ctx.arc(fx - 1, yy - 15, 7.5, 0, Math.PI * 2);           // 低垂的头
      ctx.fill();
      ctx.strokeStyle = col;                                    // 垂在身前的双臂
      ctx.lineWidth = 4.5;
      ctx.lineCap = "round";
      ctx.beginPath();
      for (let i = 0; i < 2; i++) {
        const sx = fx - 6 + i * 12;
        const sw = Math.sin(t * 3 + i * 2) * 2;
        ctx.moveTo(sx, yy - 4);
        ctx.lineTo(sx + sw, yy + 14);
      }
      ctx.stroke();
      ctx.strokeStyle = "rgba(0,0,0,0.45)";                     // 佝偻的脊背
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(fx - 8, yy - 6);
      ctx.quadraticCurveTo(fx + 1, yy + 1, fx + 7, yy - 4);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,120,90,0.9)";                   // 只剩两点浑浊的光
      ctx.fillRect(fx - 5, yy - 17, 2.5, 2.5);
      ctx.fillRect(fx + 1, yy - 17, 2.5, 2.5);
      ctx.fillStyle = "rgba(150,20,20,0.35)";                   // 身上渗出的血色
      ctx.beginPath();
      ctx.ellipse(fx + 3, yy + 6, 5, 7, 0.3, 0, Math.PI * 2);
      ctx.fill();
    } else if (shape === "crusher") {
      // 碾压者：由浓雾生成，庞大、缓慢、几乎不可阻挡
      const yy = fy + bob * 0.3;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(fx, yy, 20, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(20,24,28,0.85)";          // 躯干上那道横向的"压痕"
      ctx.fillRect(fx - 18, yy - 3, 36, 6);
      ctx.strokeStyle = col;                          // 粗短的四肢
      ctx.lineWidth = 7;
      ctx.lineCap = "round";
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const sx = fx - 14 + i * 9;
        const sw = Math.sin(t * 4 + i * 1.5) * 3;
        ctx.moveTo(sx, yy + 8);
        ctx.lineTo(sx + sw, yy + 20);
      }
      ctx.stroke();
      ctx.fillStyle = "rgba(255,220,150,0.85)";       // 雾里透出的两点光
      ctx.fillRect(fx - 8, yy - 5, 3, 3);
      ctx.fillRect(fx + 5, yy - 5, 3, 3);
      ctx.fillStyle = "rgba(200,210,220,0.16)";       // 裹在身上的一层雾
      ctx.beginPath();
      ctx.ellipse(fx, yy, 26, 20, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (shape === "neighborhood") {
      // 邻里守望：一颗浮在半空的大眼球，底下支着八条蜘蛛那样的细长腿。
      // 它不站在草坪上 —— 是那颗眼球在看你，腿只是撑着它走。
      const yy = fy - 26 + Math.sin(t * 1.6) * 2.6;   // 头抬高：头占 1 格，腿才撑得开
      // ---- 腿：八条蜘蛛腿，交替步态（支撑相钉在地上、摆动相抬起来往前迈）----
      // 它挪得越快，步子越大、倒得越急；站着不动时也在原地慢慢倒腿。
      const spd = clamp((this.stepSpeed || 0) / 26, 0, 1);
      const cadence = 1.15 + spd * 2.1;      // 步频（每秒多少步）
      const stride = 13 + spd * 30;          // 步幅
      const liftMax = 6 + spd * 13;          // 抬脚高度
      const la0 = Math.atan2(faceY - yy, faceX - fx);   // 前进方向 = 朝着玩家
      ctx.lineCap = "round";
      for (let i = 0; i < 8; i++) {
        // 八条腿按左右分成两组交替抬起（蜘蛛的交替步态）
        const a = (i / 8) * Math.PI * 2 + t * 0.12;
        const ph = (((t * cadence + (i % 2) * 0.5 + i * 0.06) % 1) + 1) % 1;
        const swing = ph >= 0.62;                       // 0~0.62 支撑，0.62~1 摆动
        const u = swing ? (ph - 0.62) / 0.38 : ph / 0.62;
        // 支撑相：脚钉在地上，被身体拖着往后走；摆动相：脚抬起来从后往前迈
        const along = swing ? (-stride * 0.5 + stride * u) : (stride * 0.5 - stride * u);
        const lift = swing ? Math.sin(Math.PI * u) * liftMax : 0;
        const r1 = 9, r2 = 62 + Math.abs(i - 3.5) * 5;  // 腿要撑到 4 格远（160px），不然"眼球下面长蜘蛛脚"根本看不出来
        const ex = fx + Math.cos(a) * r2 + Math.cos(la0) * along;
        const ey = fy + 40 + Math.sin(a) * 7 + Math.sin(la0) * along * 0.55 - lift;
        // 膝盖：往身体外侧、上方弓起（抬腿时弓得更高）
        const kx = fx + Math.cos(a) * (r1 + r2) * 0.52 + Math.cos(la0) * along * 0.3;
        const ky = yy + 30 + Math.abs(Math.sin(a)) * 10 - lift * 0.55;
        ctx.strokeStyle = swing ? "rgba(34,40,48,0.90)" : "rgba(18,22,28,0.95)";
        ctx.lineWidth = swing ? 2.1 : 2.6;
        ctx.beginPath();
        ctx.moveTo(fx + Math.cos(a) * r1 * 0.5, yy + 6);
        ctx.quadraticCurveTo(kx, ky, ex, ey);
        ctx.stroke();
        // 脚尖：落地的那一瞬点一下，抬起来时脚尖朝前
        ctx.fillStyle = swing ? "rgba(40,46,54,0.85)" : "rgba(14,18,22,0.95)";
        ctx.beginPath();
        ctx.ellipse(ex, ey, 2.6, 1.8, a, 0, Math.PI * 2);
        ctx.fill();
      }
      // ---- 眼球本体 ----
      const gr = ctx.createRadialGradient(fx - 3, yy - 3, 1, fx, yy, 13);
      gr.addColorStop(0, "#f4f1e6");
      gr.addColorStop(0.65, "#d8d2c0");
      gr.addColorStop(1, "#8d8674");
      ctx.fillStyle = gr;
      ctx.beginPath(); ctx.arc(fx, yy, 12, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(20,22,26,0.85)"; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(fx, yy, 12, 0, Math.PI * 2); ctx.stroke();
      // 血丝
      ctx.strokeStyle = "rgba(150,40,40,0.55)"; ctx.lineWidth = 0.8;
      for (let i = 0; i < 5; i++) {
        const a = i * 1.25 + 0.4;
        ctx.beginPath();
        ctx.moveTo(fx + Math.cos(a) * 11.5, yy + Math.sin(a) * 11.5);
        ctx.quadraticCurveTo(fx + Math.cos(a) * 6, yy + Math.sin(a) * 6 - 1,
          fx + Math.cos(a) * 3, yy + Math.sin(a) * 3);
        ctx.stroke();
      }
      // 虹膜 + 瞳孔：始终盯着玩家
      const la = Math.atan2(faceY - yy, faceX - fx);
      const ld = Math.min(4.5, Math.hypot(faceX - fx, faceY - yy) * 0.06);
      ctx.fillStyle = "#6d8fa8";
      ctx.beginPath(); ctx.arc(fx + Math.cos(la) * ld, yy + Math.sin(la) * ld, 5.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#0a0a0c";
      ctx.beginPath(); ctx.arc(fx + Math.cos(la) * ld, yy + Math.sin(la) * ld, 2.6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.beginPath(); ctx.arc(fx + Math.cos(la) * ld - 2.4, yy + Math.sin(la) * ld - 2.6, 1.1, 0, Math.PI * 2); ctx.fill();
      // 眼睑：偶尔眨一下
      const blink = (t % 4.2) < 0.13 ? 1 : 0;
      if (blink) {
        ctx.fillStyle = "#8d8674";
        ctx.beginPath(); ctx.ellipse(fx, yy, 12.5, 12.5, 0, 0, Math.PI * 2); ctx.fill();
      }
    } else if (shape === "jerry") {
      // 杰瑞：手长及膝，总是咧着嘴笑
      const yy = fy + bob * 0.6;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(fx, yy - 2, 9, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(fx, yy - 17, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = col;                          // 长到膝盖的手臂
      ctx.lineWidth = 3.6;
      ctx.lineCap = "round";
      ctx.beginPath();
      for (let i = 0; i < 2; i++) {
        const sx = fx - 9 + i * 18;
        const sw = Math.sin(t * 6 + i * 2.2) * 5;
        ctx.moveTo(sx, yy - 8);
        ctx.lineTo(sx + sw, yy + 22);
      }
      ctx.stroke();
      ctx.fillStyle = "rgba(20,18,16,0.85)";          // 那副笑容
      ctx.beginPath();
      ctx.arc(fx, yy - 14, 4.5, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.fill();
      ctx.fillStyle = "rgba(250,250,250,0.9)";
      ctx.fillRect(fx - 4, yy - 19, 2, 2);
      ctx.fillRect(fx + 2, yy - 19, 2, 2);
    } else if (shape === "transporter") {
      // 传送者：轮廓不稳，像是这一帧还没完全落进现实
      const yy = fy + bob * 0.5;
      const jitter = Math.sin(t * 26 + this.seed) * 1.6;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(fx + jitter, yy, 10, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(fx - jitter, yy - 18, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(160,190,255,0.5)";      // 身周的空间在轻微错位
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(fx, yy, 16, 22, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(200,220,255,0.85)";
      ctx.fillRect(fx - 4 - jitter, yy - 19, 2.4, 2.4);
      ctx.fillRect(fx + 2 - jitter, yy - 19, 2.4, 2.4);
    } else if (shape === "kite") {
      // 警告风筝：飘在半空，往危险处走时才会出现
      const yy = fy - 26 + Math.sin(t * 2 + this.seed) * 5;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(fx, yy - 12);
      ctx.lineTo(fx + 13, yy);
      ctx.lineTo(fx, yy + 12);
      ctx.lineTo(fx - 13, yy);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(60,55,45,0.8)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(fx - 13, yy); ctx.lineTo(fx + 13, yy);
      ctx.moveTo(fx, yy - 12); ctx.lineTo(fx, yy + 12);
      ctx.stroke();
      ctx.strokeStyle = "rgba(70,64,52,0.7)";         // 拖在下面的一条尾巴
      ctx.lineWidth = 1;
      ctx.beginPath();
      let ky = yy + 12;
      ctx.moveTo(fx, ky);
      for (let i = 1; i <= 5; i++) {
        ky += 5;
        ctx.lineTo(fx + Math.sin(t * 3 + i) * 5, ky);
      }
      ctx.stroke();
      ctx.fillStyle = "rgba(220,60,50,0.75)";         // 上面写的多半是个"警告"
      ctx.fillRect(fx - 5, yy - 2, 10, 2);
    } else if (shape === "worn") {
      // 磨损者：皮肤像被反复擦洗过，从 Level 8 游荡进来的
      const yy = fy + bob * 0.45;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(fx, yy, 10, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(fx, yy - 17, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(210,200,180,0.35)";       // 一片片磨掉的表层
      for (let i = 0; i < 6; i++) {
        const a2 = hash2(i, this.seed) * Math.PI * 2;
        ctx.fillRect(fx + Math.cos(a2) * 7, yy + Math.sin(a2) * 11, 4, 3);
      }
      ctx.fillStyle = "rgba(20,16,14,0.8)";
      ctx.fillRect(fx - 4, yy - 19, 2, 2);
      ctx.fillRect(fx + 2, yy - 19, 2, 2);
    } else if (shape === "xiaoxiao") {
      // 小小：苍白、瘦小，听觉好得可怕
      const yy = fy + bob * 0.9;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(fx, yy, 8, 13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(fx, yy - 16, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(20,25,30,0.9)";
      ctx.beginPath();
      ctx.arc(fx - 3, yy - 17, 2.6, 0, Math.PI * 2);
      ctx.arc(fx + 3, yy - 17, 2.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(20,25,30,0.7)";         // 张得很大的耳朵
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(fx - 9, yy - 16, 3.5, -1.2, 1.2);
      ctx.arc(fx + 9, yy - 16, 3.5, Math.PI - 1.2, Math.PI + 1.2);
      ctx.stroke();
    } else {
      // 肢团：一堆纠缠在一起的肢体 —— 手臂和腿从一团肉里长出来，
      // 有肘、有腕、末端是手掌和手指，彼此缠绕着慢慢蠕动。
      const yy = fy + bob * 0.6;
      const R0 = 15;
      const limbCols = ["#7a4a45", "#5e3733", "#8a5a50", "#4e2d2b"];
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const drawLimb = (i, front) => {
        const base = t * 0.55 + i * (Math.PI * 2 / 9) + (i % 2) * 0.35;
        const w1 = Math.sin(t * 1.25 + i * 2.1) * 0.42;
        const w2 = Math.sin(t * 1.85 + i * 1.35 + 0.9) * 0.62;
        const a1 = base + w1;
        const a2 = a1 + w2 + (i % 2 ? 0.75 : -0.75);   // 关节往回折，才像肢体
        const L1 = front ? 13 : 11, L2 = front ? 12 : 10;
        const jx = fx + Math.cos(a1) * L1, jy = yy + Math.sin(a1) * L1 * 0.78;
        const wx = jx + Math.cos(a2) * L2, wy = jy + Math.sin(a2) * L2 * 0.78;
        const c1 = limbCols[i % limbCols.length];
        const c2 = limbCols[(i + 2) % limbCols.length];
        // 上节：粗
        ctx.strokeStyle = c1; ctx.lineWidth = 5.2;
        ctx.beginPath();
        ctx.moveTo(fx + Math.cos(a1) * R0 * 0.5, yy + Math.sin(a1) * R0 * 0.4);
        ctx.lineTo(jx, jy); ctx.stroke();
        // 肘/膝：关节处鼓一个包
        ctx.fillStyle = c1;
        ctx.beginPath(); ctx.arc(jx, jy, 2.9, 0, Math.PI * 2); ctx.fill();
        // 下节：细
        ctx.strokeStyle = c2; ctx.lineWidth = 3.6;
        ctx.beginPath(); ctx.moveTo(jx, jy); ctx.lineTo(wx, wy); ctx.stroke();
        // 手掌（或脚掌）
        ctx.fillStyle = c2;
        ctx.beginPath(); ctx.ellipse(wx, wy, 3.6, 2.9, a2, 0, Math.PI * 2); ctx.fill();
        // 手指：四根向外张开的短指，各自带一点弯和抖动
        ctx.strokeStyle = c1; ctx.lineWidth = 1.5;
        for (let f = 0; f < 4; f++) {
          const fa = a2 + (f - 1.5) * 0.42 + Math.sin(t * 3.1 + i * 1.7 + f) * 0.16;
          const fl = 4.2 + (f === 1 || f === 2 ? 1.6 : 0);
          ctx.beginPath();
          ctx.moveTo(wx + Math.cos(fa) * 2.4, wy + Math.sin(fa) * 2.0);
          ctx.quadraticCurveTo(
            wx + Math.cos(fa - 0.25) * fl * 0.70, wy + Math.sin(fa - 0.25) * fl * 0.60,
            wx + Math.cos(fa - 0.50) * fl, wy + Math.sin(fa - 0.50) * fl * 0.85);
          ctx.stroke();
        }
      };
      // 后侧肢体 -> 核心肉团 -> 前侧肢体：这样才缠成一堆，而不是摊成一张饼
      for (let i = 0; i < 9; i++) if (i % 2 === 0) drawLimb(i, false);
      const cg = ctx.createRadialGradient(fx - 3, yy - 4, 1, fx, yy, R0 + 2);
      cg.addColorStop(0, "#8a5a50");
      cg.addColorStop(0.6, col);
      cg.addColorStop(1, "#422724");
      ctx.fillStyle = cg;
      ctx.beginPath();                                  // 不规则的一团肉，不是正圆
      ctx.moveTo(fx + R0, yy);
      for (let k = 1; k <= 9; k++) {
        const ka = (k / 9) * Math.PI * 2;
        const kr = R0 * (0.86 + 0.20 * Math.sin(ka * 3 + t * 0.7 + 1.2));
        ctx.lineTo(fx + Math.cos(ka) * kr, yy + Math.sin(ka) * kr * 0.88);
      }
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "rgba(30,16,16,0.55)"; ctx.lineWidth = 1.1; ctx.stroke();
      for (let i = 0; i < 9; i++) if (i % 2 === 1) drawLimb(i, true);
    }
    ctx.restore();
  }

}
