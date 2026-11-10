// ===========================================================
// 1.3.1 · 层级密钥（Level Key）
//
//   一把钥匙只认一个层级。外观是会发光的钥匙（不是杏仁水瓶），
//   通往不同层级的钥匙，齿形与光色都不一样。
//
//   · 出现：与它绑定的那个层级里，地上躺着一把。
//   · B.N.T.G 场所（Level 1 商人之家 / Level 11 新时代广场）：
//     卖哪些钥匙、几把、几个摊位、什么价，全是随机的；
//     价格按档案分档（宜居 / 常去 / 普通 / 冷门 / 危险无出口），
//     被明令禁止的层级（如 Level 909）不进货。
//   · 枢纽：到过那一层也没用，门仍旧锁着。必须带着对应的层级密钥
//     在枢纽的门上开一次；开门**不消耗**钥匙，此后那扇门一直开着。
//     只有 Level 1 与 Level 11 的门不需要密钥。
//   · 插门：把钥匙插进一扇没有编号的门的锁孔，就能切到它绑定的层级；
//     那一层里身后会有一扇门通回原处 —— 前提是钥匙一直留在锁孔里。
//     对着门按 H 把钥匙取出来，门就再也不通往那个层级了。
// ===========================================================
"use strict";

(function () {
  const LK = {};
  window.LEVEL_KEY = LK;

  const PREFIX = "lvlkey_";
  // 被明令禁止的层级：商店里根本买不到，也不会刷成钥匙
  const BANNED = new Set(["909", "fun", "levelfun", "hub"]);
  // 免密钥的两个层级（枢纽里第 7 排与 Level 11 那排）
  const FREE = new Set(["1", "11"]);

  // 档案里的五档价格（单位：瓶杏仁水）。B.N.T.G 货币按「同价」折算，
  // 沿用记忆汁 20 瓶 / 5 枚的 4:1 比价。
  const TIERS = {
    livable:  { range: [35, 50], label: "宜居层级" },
    frequent: { range: [20, 30], label: "经常去的层级" },
    normal:   { range: [10, 15], label: "普通层级" },
    obscure:  { range: [5, 8],   label: "不怎么知名的层级" },
    danger:   { range: [1, 3],   label: "极危险 / 无出口的层级" },
  };
  const LIVABLE = new Set([
    "1", "4", "10", "11", "26", "27", "33", "37", "46", "63", "67", "75",
    "797", "903", "994", "999", "1000", "24", "31", "40", "57",
  ]);
  const FREQUENT = new Set([
    "0", "2", "3", "5", "6", "8", "9", "13", "20", "21", "22", "36", "45",
    "49", "70", "71", "109", "119", "171", "287", "301", "484", "485", "486",
    "512", "601", "696", "900", "974", "998", "78", "94", "289",
  ]);
  const DANGER = new Set([
    "30", "34", "56", "363", "599", "790", "904", "shattered", "traproof",
    "pain", "redrooms", "14h", "bang", "anse", "666", "834", "32", "5.1",
  ]);
  // 隐秘 / 子层级一律算「不怎么知名」
  const OBSCURE_PREFIX = /^(\d+\.\d|0\.|anse|exclam|bluechannel|shattered|14h|bang|hub|newera)/;

  LK.idFor = function (lv) {
    return PREFIX + String(lv).replace(/[^0-9A-Za-z]/g, "_");
  };
  const REVERSE = Object.create(null);
  LK.lvFor = function (id) {
    if (!id || String(id).indexOf(PREFIX) !== 0) return null;
    return REVERSE[String(id)] != null ? REVERSE[String(id)] : null;
  };

  // map.js 在 generateMap 期间会临时把 Math.random 换成种子随机（保证同一层地图一致），
  // 但层级密钥的供货 / 摊位 / 要价必须每次都不一样 —— 这里存一份真随机的引用。
  const TRUE_RANDOM = (typeof Math !== "undefined" && Math.random) ? Math.random.bind(Math) : function () { return 0.5; };
  LK.rnd = TRUE_RANDOM;
  function ri(a, b) { return a + Math.floor(TRUE_RANDOM() * (b - a + 1)); }
  LK.ri = ri;
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(TRUE_RANDOM() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  LK.shuffle = shuffle;

  // 把所有已知层级一次性登记成物品：这样读档时哪怕存档里带着任意一把
  // 钥匙，名称 / 图标 / id -> 层级 的反查也都已经在，不会变成 Unknown。
  LK.registerAll = function () {
    const IT = (typeof ITEMS !== "undefined" && ITEMS) || null;
    if (!IT) return;
    const pools = [];
    try { pools.push(Object.keys(LEVELS || {})); } catch (e) { /* 忽略 */ }
    try { pools.push(Object.keys(LEVEL0_ROOMS || {})); } catch (e) { /* 忽略 */ }
    try { pools.push(Object.keys(LEVEL11_ROOMS || {})); } catch (e) { /* 忽略 */ }
    try { if (typeof HUB_TARGETS !== "undefined") pools.push(HUB_TARGETS.map(String)); } catch (e) { /* 忽略 */ }
    const seen = new Set();
    // 红室 / 痛处 / 新时代广场都是层级内部的地点，不是层级 —— 不给它们发层级密钥。
    const NOT_A_LEVEL = new Set(["redrooms", "redroom", "pain", "newera", "shop"]);
    for (const pool of pools) for (const raw of pool) {
      const lv = String(raw);
      if (NOT_A_LEVEL.has(lv)) continue;
      if (seen.has(lv)) continue;
      seen.add(lv);
      const id = LK.idFor(lv);
      REVERSE[id] = lv;
      if (IT[id]) continue;
      let nm;
      try { nm = levelDef(lv).name || ("Level " + lv); } catch (e) { nm = "Level " + lv; }
      IT[id] = {
        key: id,
        name: "层级密钥 · " + nm,
        short: "L" + lv + " 密钥",
        desc: "一把泛着光的钥匙，齿形与光色和别的钥匙都不一样。它只认 " + nm
            + "。在枢纽里用它开过一次门之后，那扇门就一直开着 —— 开门不会把钥匙用掉。"
            + "也可以插进一扇没有编号的门的锁孔里，直接切过去；钥匙得一直留在锁孔里，"
            + "身后那扇回去的门才作数。对着门按 H 能把钥匙取出来，但门从此就废了。",
        effect: "枢纽开门（不消耗）· 插入锁孔切层（留置）· 按 H 取出",
        stack: 9,
      };
    }
  };
  LK.restore = function (inv) {
    LK.registerAll();
    // 兜底：万一存档里带着没登记过的 id，也补一条，别让它变成空白格
    const IT = (typeof ITEMS !== "undefined" && ITEMS) || null;
    if (!IT || !inv) return;
    for (const k of Object.keys(inv)) {
      if (String(k).indexOf(PREFIX) !== 0 || IT[k]) continue;
      const lv = LK.lvFor(k) || String(k).slice(PREFIX.length).replace(/_/g, ".");
      IT[k] = { key: k, name: "层级密钥 · Level " + lv, short: "L" + lv + " 密钥",
        desc: "一把泛着光的钥匙。", effect: "枢纽开门 / 插入锁孔", stack: 9 };
      REVERSE[k] = lv;
    }
  };

  LK.tierOf = function (lv) {
    const s = String(lv);
    if (BANNED.has(s)) return null;           // 禁止层级：买不到
    if (DANGER.has(s)) return "danger";
    if (LIVABLE.has(s)) return "livable";
    if (FREQUENT.has(s)) return "frequent";
    if (OBSCURE_PREFIX.test(s)) return "obscure";
    return "normal";
  };
  LK.priceFor = function (lv) {
    const t = LK.tierOf(lv);
    if (!t) return null;
    const r = TIERS[t].range;
    const price = ri(r[0], r[1]);
    return { price: price, coin: Math.max(1, Math.round(price / 4)), tier: t, tierName: TIERS[t].label };
  };

  // 候选池：只卖真实存在的层级，不卖禁止层级，也不卖枢纽本身
  LK.pool = function () {
    const out = [];
    try {
      for (const k of Object.keys(LEVELS || {})) {
        const s = String(k);
        if (BANNED.has(s) || s === "hub") continue;
        if (LK.tierOf(s) == null) continue;
        out.push(s);
      }
    } catch (e) { /* 忽略 */ }
    if (!out.length && typeof HUB_TARGETS !== "undefined") {
      for (const k of HUB_TARGETS) out.push(String(k));
    }
    return out;
  };
  // 随机供货：随机层级、随机数量、随机价格（价格按档案分档）
  LK.makeOffers = function (n, exclude) {
    const ex = new Set((exclude || []).map(String));
    let pool = LK.pool().filter((lv) => !ex.has(lv));
    pool = shuffle(pool);
    const out = [];
    for (const lv of pool) {
      if (out.length >= n) break;
      const p = LK.priceFor(lv);
      if (!p) continue;
      out.push({
        key: LK.idFor(lv), lv: lv, itemId: LK.idFor(lv),
        price: p.price, coin: p.coin, tier: p.tier, tierName: p.tierName,
        isLevelKey: true,
      });
    }
    return out;
  };

  LK.keysIn = function (g) {
    if (!g || !g.inv) return [];
    const out = [];
    for (const k of Object.keys(g.inv)) {
      if (String(k).indexOf(PREFIX) === 0 && (g.inv[k] | 0) > 0) out.push({ id: k, lv: LK.lvFor(k) });
    }
    return out;
  };
  LK.hasKeyFor = function (g, lv) {
    if (!g || !g.inv) return false;
    return (g.inv[LK.idFor(lv)] | 0) > 0;
  };
  LK.api = function () { return window.__LK || {}; };

  // -----------------------------------------------------------
  // 枢纽：到过也没用，得带着对应的钥匙在门上开一次。
  // 开门不消耗钥匙，开过之后这扇门对本局一直敞开。
  // -----------------------------------------------------------
  LK.hubLocked = function (g, lv) {
    const s = String(lv);
    if (FREE.has(s)) return false;
    if (g && g.hubKeyOpened && g.hubKeyOpened[s]) return false;
    return !LK.hasKeyFor(g, s);
  };
  LK.hubOpen = function (g, lv) {
    const s = String(lv);
    if (FREE.has(s)) return false;
    if (!g.hubKeyOpened) g.hubKeyOpened = {};
    if (g.hubKeyOpened[s]) return false;
    g.hubKeyOpened[s] = true;   // 不 removeItem —— 钥匙还在手上
    return true;
  };

  // -----------------------------------------------------------
  // 世界里的三个物件：地上的钥匙 / 没有编号的锁孔门 / 身后的回程门
  // -----------------------------------------------------------
  function pickSpot(g, minD, maxD) {
    const map = g && g.map;
    if (!map) return null;
    const f = g.floor | 0;
    const grid = map.layers && map.layers[f];
    if (!grid) return null;
    const sx = g.player.x / 40, sy = g.player.y / 40;
    const taken = new Set();
    for (const p of (map.props || [])) if ((p.floor | 0) === f) taken.add(p.x + "," + p.y);
    const cand = [];
    for (let y = 2; y < grid.length - 2; y++) {
      const row = grid[y]; if (!row) continue;
      for (let x = 2; x < row.length - 2; x++) {
        if (row[x] !== 0 || taken.has(x + "," + y)) continue;
        const d = Math.hypot(x - sx, y - sy);
        if (d >= minD && d <= maxD) cand.push({ x: x, y: y });
      }
    }
    if (!cand.length) {
      for (let y = 2; y < grid.length - 2 && !cand.length; y++) {
        const row = grid[y]; if (!row) continue;
        for (let x = 2; x < row.length - 2; x++) {
          if (row[x] !== 0 || taken.has(x + "," + y)) continue;
          cand.push({ x: x, y: y }); break;
        }
      }
    }
    return cand.length ? cand[Math.floor(TRUE_RANDOM() * cand.length)] : null;
  }

  LK.spawnInLevel = function (g) {
    if (!g || !g.map) return;
    LK.restore(g.inv);
    const lv = String(g.level);
    const f = g.floor | 0;
    const props = g.map.props || (g.map.props = []);
    if (!g.keyTaken) g.keyTaken = {};

    // 枢纽里不刷钥匙 —— 这儿是开门的地方，不是找钥匙的地方
    if (lv !== "hub" && !g.keyTaken[lv]) {
      const at = pickSpot(g, 5, 26);
      if (at) {
        props.push({
          x: at.x, y: at.y, floor: f, type: "lvlkey", iKind: "lvlkey",
          lv: lv, itemId: LK.idFor(lv),
        });
      }
    }
  };

  // -----------------------------------------------------------
  // 提示 / 交互：挂到 main.js 的聚合钩子上，保留原有钩子
  // -----------------------------------------------------------
  function lvName(lv) {
    try { return levelDef(lv).name || ("Level " + lv); } catch (e) { return "Level " + lv; }
  }
  LK.hint = function (n, g) {
    if (!n) return null;
    if (n.kind === "lvlkey") {
      const lv = (n.p && n.p.lv) || "?";
      return "一把泛着光的钥匙 —— 按 E 捡起 " + lvName(lv) + " 的层级密钥 · 放进快捷栏，对着任意门按 G 切层";
    }
    if (n.kind === "keyreturn") {
      const p = g.keyPortal;
      if (!p || !p.active || (n.p && n.p.dead)) return "门已经不通往任何地方了";
      return "身后那扇门 —— 按 E 走回 " + lvName(p.fromLevel) + "（钥匙得一直留在锁孔里）· 按 H 取出密钥";
    }
    return null;
  };

  function choosePanel(g, lockProp) {
    const keys = LK.keysIn(g).filter((k) => k.lv && String(k.lv) !== String(g.level));
    if (!keys.length) {
      LK.api().toast(String(g.level) === "0" ? "身上的钥匙通向的就是这里 —— 换一把别的" : "身上的钥匙都通向这里 —— 换一把别的");
      return;
    }
    let box = document.getElementById("lk-choose");
    if (!box) {
      box = document.createElement("div");
      box.id = "lk-choose";
      box.style.cssText = "position:fixed;inset:0;z-index:9992;display:flex;align-items:center;"
        + "justify-content:center;background:rgba(6,8,10,.72);";
      document.body.appendChild(box);
    }
    box.innerHTML = "";
    const card = document.createElement("div");
    card.style.cssText = "width:min(460px,92vw);max-height:80vh;overflow:auto;background:#f3efe2;"
      + "color:#2f2c24;border:2px solid #b9ae8c;border-radius:6px;padding:16px 18px;"
      + "box-shadow:0 20px 70px rgba(0,0,0,.6);";
    const h = document.createElement("div");
    h.style.cssText = "font-weight:bold;font-size:17px;margin-bottom:4px;";
    h.textContent = "把哪把层级密钥插进锁孔？";
    card.appendChild(h);
    const sub = document.createElement("div");
    sub.style.cssText = "font-size:12px;color:#6a6252;margin-bottom:12px;";
    sub.textContent = "插进去就会被送到它绑定的层级；钥匙会一直留在锁孔里，身后那扇回去的门才作数。";
    card.appendChild(sub);
    for (const k of keys) {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = lvName(k.lv) + "　（身上 " + (g.inv[k.id] | 0) + " 把）";
      b.style.cssText = "display:block;width:100%;text-align:left;margin:6px 0;padding:9px 12px;"
        + "cursor:pointer;border:1px solid #b9ae8c;border-radius:3px;background:#e7e0c9;"
        + "color:#3a352a;font-size:13px;";
      b.addEventListener("click", () => {
        box.style.display = "none";
        insertKey(g, k.id, k.lv, lockProp);
      });
      card.appendChild(b);
    }
    const x = document.createElement("button");
    x.type = "button"; x.textContent = "取消";
    x.style.cssText = "margin-top:10px;padding:6px 14px;cursor:pointer;border:1px solid #b9ae8c;"
      + "border-radius:3px;background:#e7e0c9;color:#3a352a;font-size:13px;";
    x.addEventListener("click", () => { box.style.display = "none"; });
    card.appendChild(x);
    box.appendChild(card);
    box.style.display = "flex";
  }

  function insertKey(g, keyId, lv, lockProp) {
    const api = LK.api();
    api.remove(keyId, 1);
    const portal = {
      keyId: keyId, lv: String(lv), fromLevel: String(g.level),
      fromX: Math.round(g.player.x), fromY: Math.round(g.player.y),
      fromFloor: g.floor | 0, active: true,
    };
    g.keyPortal = portal;
    g.keyLockInserted = portal;
    if (lockProp) lockProp.inserted = true;
    api.refresh();
    api.go(String(lv), "钥匙插进了锁孔",
      "锁孔里的齿咬合了一下，门后不再是这层 —— " + lvName(lv) + " ...");
  }

  LK.interact = function (n, g) {
    if (!n) return false;
    if (n.kind === "lvlkey") {
      const p = n.p; if (!p) return false;
      const id = p.itemId || LK.idFor(p.lv);
      LK.api().add(id, 1);
      const list = g.map.props || [];
      const i = list.indexOf(p);
      if (i >= 0) list.splice(i, 1);
      if (!g.keyTaken) g.keyTaken = {};
      g.keyTaken[String(p.lv)] = true;
      LK.api().refresh();
      LK.api().toast("捡起了 " + lvName(p.lv) + " 的层级密钥 —— 放进快捷栏，对着任意一扇门按 G 就能切过去");
      return true;
    }
    if (n.kind === "keyreturn") {
      const p = g.keyPortal;
      if (!p || !p.active || (n.p && n.p.dead)) {
        LK.api().toast("门已经不通往任何地方了 —— 锁孔里的钥匙被取走了");
        return true;
      }
      LK.api().go(String(p.fromLevel), "推开了身后那扇门",
        "钥匙还留在锁孔里 —— 你回到了 " + lvName(p.fromLevel) + " ...");
      return true;
    }
    return false;
  };

  // 密钥不再插进锁孔，也就没有"按 H 拔出来"这回事。留一个空实现，
  // 免得旧存档 / 旧键位绑定调用到这里报错。
  LK.tryTake = function () { return false; };

  // -----------------------------------------------------------
  // 把密钥放进快捷栏（三个主槽或副手），对着任意一扇门按 G 切层。
  // 门不新造：地图里原本就有的门、闸、出口都算。
  // -----------------------------------------------------------
  LK.warp = function (g) {
    const api = LK.api();
    if (!g || g.phase !== "playing") return false;
    const slots = [];
    if (g.hotbar) for (const k of g.hotbar) if (k) slots.push(k);
    if (g.offhand) slots.push(g.offhand);
    const have = slots.filter((k) => String(k).indexOf(PREFIX) === 0 && (g.inv[k] | 0) > 0);
    if (!have.length) { api.toast("先把层级密钥放进快捷栏，再对着门按 G"); return true; }
    const lv = LK.lvFor(have[0]);
    if (!lv) { api.toast("这把钥匙没有对应的层级"); return true; }
    // 附近任意一扇门：map.doors / props 里的门、闸、出口都算，不需要专属门
    let near = !!g.nearDoor;
    if (!near && g.map) {
      const px = g.player.x, py = g.player.y;
      const R = (typeof TILE !== "undefined" ? TILE : 40) * 1.9;
      const doors = (g.map.doors || []).concat((g.map.props || []).filter((q) =>
        /door|gate|exit|stairs|elevator|pod|hatch/i.test(String(q.type || ""))));
      const T = (typeof TILE !== "undefined" ? TILE : 40);
      near = doors.some((d) => d && d.x != null && d.y != null &&
        Math.hypot((d.x + 0.5) * T - px, (d.y + 0.5) * T - py) < R);
    }
    if (!near) { api.toast("站到一扇门前再按 G"); return true; }
    // 已经用这把钥匙到了目标层：对着任意门按 G 就回原处，身后不需要多一扇门
    if (g.keyWarpFrom && String(g.level) === String(lv)) {
      const back = g.keyWarpFrom.fromLevel;
      g.keyWarpFrom = null;
      api.go(back, "推开了身后那扇门", "门后是来时的地方 ...");
      return true;
    }
    g.keyWarpFrom = { fromLevel: String(g.level), lv: String(lv) };
    api.go(String(lv), "钥匙拧了一下", "这扇门后面是 " + lvName(lv) + " ...");
    return true;
  };


  // -----------------------------------------------------------
  // 物件绘制：会发光的钥匙（不是杏仁水瓶）；不同层级齿形 / 光色不同
  // -----------------------------------------------------------
  window.PROP_DRAW = window.PROP_DRAW || {};

  function keyColors(lv) {
    const s = String(lv);
    const palettes = [
      ["#ffe08a", "#fff3c4"], ["#a8e6ff", "#dcf5ff"], ["#b6ffcf", "#e6ffee"],
      ["#ffb9d8", "#ffe0ee"], ["#d8b6ff", "#efe0ff"], ["#ffcf8f", "#ffe8c8"],
    ];
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return palettes[h % palettes.length];
  }

  function drawKeyShape(ctx, lv, T, scale) {
    const [a, b] = keyColors(lv);
    const s = scale || 1;
    const pulse = 0.72 + 0.28 * Math.abs(Math.sin(performance.now() / 620));
    // 光晕：钥匙四周都在发光
    const gl = ctx.createRadialGradient(0, 0, 1, 0, 0, T * 0.62 * s);
    gl.addColorStop(0, "rgba(255,236,170," + (0.42 * pulse).toFixed(3) + ")");
    gl.addColorStop(0.55, "rgba(255,214,110," + (0.18 * pulse).toFixed(3) + ")");
    gl.addColorStop(1, "rgba(255,214,110,0)");
    ctx.fillStyle = gl;
    ctx.beginPath(); ctx.arc(0, 0, T * 0.62 * s, 0, Math.PI * 2); ctx.fill();

    ctx.save();
    ctx.rotate(-0.42);
    ctx.shadowColor = a; ctx.shadowBlur = 9 * pulse;
    ctx.strokeStyle = a; ctx.fillStyle = a;
    ctx.lineWidth = Math.max(1.4, T * 0.045 * s);
    // 钥匙头：一个圆环
    ctx.beginPath();
    ctx.arc(-T * 0.18 * s, -T * 0.20 * s, T * 0.13 * s, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-T * 0.18 * s, -T * 0.20 * s, T * 0.045 * s, 0, Math.PI * 2);
    ctx.fillStyle = b; ctx.fill();
    // 钥匙杆
    ctx.fillStyle = a;
    ctx.fillRect(-T * 0.09 * s, -T * 0.10 * s, T * 0.055 * s, T * 0.48 * s);
    // 齿：按层级编号取 2~4 个，位置和长度都不同 —— 每把钥匙长得不一样
    let h = 0;
    for (let i = 0; i < String(lv).length; i++) h = (h * 31 + String(lv).charCodeAt(i)) >>> 0;
    const teeth = 2 + (h % 3);
    for (let i = 0; i < teeth; i++) {
      const yy = T * (0.14 + i * 0.10) * s;
      const w = T * (0.08 + ((h >> (i * 3)) % 4) * 0.025) * s;
      ctx.fillRect(-T * 0.035 * s, yy, w, T * 0.045 * s);
    }
    // 高光
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fillRect(-T * 0.075 * s, -T * 0.08 * s, T * 0.014 * s, T * 0.42 * s);
    ctx.restore();
  }

  window.PROP_DRAW["lvlkey"] = function (ctx, p, T) {
    ctx.save();
    // 落地影
    ctx.fillStyle = "rgba(0,0,0,0.30)";
    ctx.beginPath(); ctx.ellipse(0, T * 0.34, T * 0.24, T * 0.08, 0, 0, Math.PI * 2); ctx.fill();
    drawKeyShape(ctx, p.lv, T, 0.9);
    ctx.restore();
  };

  function drawLockDoor(ctx, T, inserted, dead, lv, isReturn) {
    const w = T * 0.78, h = T * 0.92;
    ctx.fillStyle = "#0b0c0a";
    ctx.fillRect(-w / 2 - 2, -h / 2 - 2, w + 4, h + 2);
    ctx.fillStyle = dead ? "#4a4741" : (isReturn ? "#5b5340" : "#53565a");
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.strokeStyle = dead ? "#2b2a27" : "#8d8672";
    ctx.lineWidth = 1.6;
    ctx.strokeRect(-w / 2 + 1, -h / 2 + 1, w - 2, h - 2);
    // 门板两道压条
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fillRect(-w / 2 + 5, -h / 2 + 8, w - 10, 2);
    ctx.fillRect(-w / 2 + 5, h / 2 - 12, w - 10, 2);
    // 多边形锁孔
    const kx = 0, ky = T * 0.06;
    ctx.fillStyle = dead ? "#1c1b18" : "#1e1c16";
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
      const xx = kx + Math.cos(a) * T * 0.105, yy = ky + Math.sin(a) * T * 0.105;
      if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
    }
    ctx.closePath(); ctx.fill();
    if (!dead) {
      const pulse = 0.55 + 0.45 * Math.abs(Math.sin(performance.now() / 700));
      ctx.shadowColor = inserted ? "rgba(255,214,110,0.95)" : "rgba(160,190,220,0.6)";
      ctx.shadowBlur = inserted ? 16 : 7;
      ctx.strokeStyle = inserted ? "rgba(255,226,150," + pulse.toFixed(3) + ")" : "rgba(180,200,215,0.55)";
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    // 门缝下透出的光：钥匙还插着的时候才亮
    if (!dead) {
      ctx.fillStyle = inserted ? "rgba(255,226,150,0.75)" : "rgba(190,205,220,0.35)";
      ctx.fillRect(-w / 2 + 4, h / 2 - 5, w - 8, 2);
    }
    // 插着的钥匙：小一号，直接画在锁孔上
    if (inserted && !dead) {
      ctx.save();
      ctx.translate(kx, ky - T * 0.02);
      drawKeyShape(ctx, lv, T, 0.42);
      ctx.restore();
    }
  }

  window.PROP_DRAW["keylock"] = function (ctx, p, T) {
    const g = window.__game;
    const ins = g && g.keyLockInserted && g.keyLockInserted.active ? g.keyLockInserted : null;
    drawLockDoor(ctx, T, !!ins && !p.dead, !!p.dead, ins ? ins.lv : "0", false);
  };
  window.PROP_DRAW["keyreturn"] = function (ctx, p, T) {
    const g = window.__game;
    const po = g && g.keyPortal && g.keyPortal.active ? g.keyPortal : null;
    drawLockDoor(ctx, T, !!po && !p.dead, !!p.dead, po ? po.lv : "0", true);
  };

  LK.registerAll();

  // -----------------------------------------------------------
  // 挂到 1.3.1 批次的聚合钩子上。
  // nearNew 早就认得出 iKind = "lvlkey"，但 main.js 里 newLevelHint /
  // newLevelInteract 是两个内部 switch，里面没有这个 case —— 少了这一步，
  // 走到钥匙跟前不显示提示，按 E 也毫无反应，看起来就是「捡不起来」。
  // levelKey.js 排在 levelBatch2Common.js 之后加载，聚合器此刻已经就绪；
  // 万一以后脚本顺序变了，也用链式包装兜底，不覆盖已有钩子。
  // -----------------------------------------------------------
  const KINDS = ["lvlkey", "keyreturn", "keylock"];
  if (window.__B2_hint && window.__B2_act) {
    window.__B2_hint(KINDS, LK.hint);
    window.__B2_act(KINDS, LK.interact);
  } else {
    const prevHint = window.__LEVEL_HINT_EXTRA;
    const prevAct = window.__LEVEL_INTERACT_EXTRA;
    window.__LEVEL_HINT_EXTRA = function (n, g) {
      const r = LK.hint(n, g);
      if (r != null) return r;
      return prevHint ? prevHint(n, g) : null;
    };
    window.__LEVEL_INTERACT_EXTRA = function (n, g) {
      if (LK.interact(n, g)) return true;
      return prevAct ? prevAct(n, g) : false;
    };
  }
})();
