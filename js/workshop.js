/* ============================================================
 * VibeHub 创意工坊 · 后室 Mod API v1
 * ------------------------------------------------------------
 * 这个文件必须在 constants.js / audio.js 之后、main.js 之前加载：
 *   - 它只"建立并暴露" API，不启动游戏，也不碰地图与主循环；
 *   - 注册函数把数据先存进登记表，等 before-start Mod 全部装载完、
 *     引擎即将启动前，由 main.js 调用 __applyAll() 一次性写入
 *     LEVELS / ITEMS / CONFIG 这些真实数据结构；
 *   - after-start Mod 自己再调用注册函数时，会立刻生效（游戏已在跑）。
 *
 * 设计边界（刻意保持很小）：
 *   - 只用"带唯一 ID 的注册函数 + 事件"，不暴露游戏内部对象；
 *   - 不提供 DOM 操作、内部函数覆盖、网络/凭据/管理接口；
 *   - Mod 代码本身不受平台沙箱保护 —— 能力清单只是作者与 Mod 作者
 *     之间的约定，不是安全边界。
 * ============================================================ */
(function (global) {
  "use strict";

  if (global.BackroomsMod && global.BackroomsMod.apiVersion >= 1) return;

  const API_VERSION = 1;
  const API_NAME = "BackroomsMod";
  const MOD_VERSION = "1.0.0";

  const LEVEL_RE = /^[0-9]{2,6}$/;                 // 只允许 2~6 位纯数字，避开内置编号
  const KEY_RE = /^[a-z][a-z0-9_.-]{1,39}$/;       // 小写开头，最长 40
  const MAX_LEVELS = 20;
  const MAX_ITEMS = 60;
  const MAX_KINDS = 20;
  const MAX_AREAS = 40;

  // 可以安全调整的数值（其余 CONFIG 字段一律不允许 Mod 改）
  const TUNABLE = {
    PLAYER_SPEED: [80, 480],
    PLAYER_SPRINT: [120, 720],
    STAMINA_MAX: [40, 400],
    STAMINA_DRAIN: [8, 120],
    STAMINA_REGEN: [4, 120],
    HP_MAX: [20, 400],
    SANITY_MAX: [20, 400],
    SANITY_DRAIN_DARK: [0, 4],
    SANITY_DRAIN_LIT: [0, 2],
    SANITY_DRAIN_ENTITY: [0, 8],
    ALMOND_SANITY: [0, 90],
    ALMOND_HP: [0, 60],
    BAG_DEFAULT: [10, 120],
  };

  // 允许 Mod 播放的内置音效（一次性、无副作用）
  const SFX_ALLOW = ["footstep", "splash", "paper", "door", "growl", "jumpscare",
    "heartbeat", "roar", "collapse", "debris", "exitChime", "jazz", "whisper",
    "wind", "water", "steam", "elevator", "flickerClick", "adrenaline"];

  // 可复用的内置实体外观（Mod 新实体只能沿用这些模型，避免污染渲染管线）
  const MODELS = ["bacterium", "hound", "smiler", "faceling", "moth", "rat",
    "partypooper", "jerry", "worn", "kite", "transporter", "bride", "crusher",
    "neighborhood", "kitty", "mimic"];

  const state = {
    applied: false,
    levels: new Map(),
    areas: new Map(),
    items: new Map(),
    kinds: new Map(),
    tuning: new Map(),
    handlers: new Map(),
    errors: [],
  };

  if (!Array.isArray(global.__MOD_ITEM_KEYS)) global.__MOD_ITEM_KEYS = [];
  if (!Array.isArray(global.__MOD_LEVEL_IDS)) global.__MOD_LEVEL_IDS = [];

  function warn(msg) {
    const text = "[工坊] " + msg;
    try { console.warn(text); } catch (e) { /* 忽略 */ }
    state.errors.push({ message: text, at: Date.now() });
  }

  function bad(msg) { warn(msg); return { ok: false, error: msg }; }
  function good(extra) { return Object.assign({ ok: true }, extra || {}); }

  function game() {
    const b = global.__MOD_BRIDGE;
    return b && b.getGame ? b.getGame() : null;
  }

  // ---------- 注册：层级 ----------
  function registerLevel(def) {
    if (!def || typeof def !== "object") return bad("registerLevel 需要对象参数");
    const id = String(def.id == null ? "" : def.id);
    if (!LEVEL_RE.test(id)) return bad("层级 id 必须是 2~6 位纯数字，例如 90001");
    if (Number(id) < 100) return bad("层级 id 请使用 100 以上，避免与内置层级冲突");
    if (state.levels.size >= MAX_LEVELS) return bad("本次最多注册 " + MAX_LEVELS + " 个层级");
    if (state.levels.has(id) || LEVELS[id] || LEVEL0_ROOMS[id] || LEVEL11_ROOMS[id]) {
      return bad("层级 id 已被占用: " + id);
    }
    const size = Math.max(48, Math.min(120, (def.size | 0) || 72));
    const rec = {
      id: id,
      label: String(def.label || ("LEVEL " + id)).slice(0, 40),
      name: String(def.name || ("Level " + id)).slice(0, 80),
      shortName: def.shortName ? String(def.shortName).slice(0, 40) : "",
      style: "mod/" + id,
      size: size,
      floors: 1,
      classes: Array.isArray(def.classes) ? def.classes.slice(0, 4).map((x) => String(x).slice(0, 24)) : ["等级 未定", "未勘探完全"],
      objective: String(def.objective || "").slice(0, 300),
      monster: def.monster ? String(def.monster) : null,
      monsters: Array.isArray(def.monsters) ? def.monsters.slice(0, 8).map(String) : undefined,
      entities: def.entities !== false,
      seed: Number.isFinite(def.seed) ? (def.seed >>> 0) : undefined,
      areas: Array.isArray(def.areas) ? def.areas.slice(0, 8).map((x) => String(x).slice(0, 24)) : [],
    };
    state.levels.set(id, rec);
    if (state.applied) applyLevel(rec);
    return good({ id: id });
  }

  // ---------- 注册：层级区域名 ----------
  function registerArea(levelId, areaName) {
    const id = String(levelId == null ? "" : levelId);
    const name = String(areaName == null ? "" : areaName).slice(0, 24);
    if (!name) return bad("registerArea 需要区域名");
    if (!LEVELS[id] && !state.levels.has(id)) return bad("未知层级: " + id);
    const list = state.areas.get(id) || [];
    if (list.length >= MAX_AREAS) return bad("单个层级最多 " + MAX_AREAS + " 个区域");
    if (list.indexOf(name) >= 0) return good({ level: id, area: name });   // 幂等
    list.push(name);
    state.areas.set(id, list);
    if (state.applied) applyArea(id, list);
    return good({ level: id, area: name });
  }

  // ---------- 注册：道具 ----------
  function registerItem(def) {
    if (!def || typeof def !== "object") return bad("registerItem 需要对象参数");
    const key = String(def.key == null ? "" : def.key);
    if (!KEY_RE.test(key)) return bad("道具 key 只能用小写字母/数字/点/横线/下划线，2~40 位");
    if (state.items.has(key) || ITEMS[key]) return bad("道具 key 已被占用: " + key);
    if (state.items.size >= MAX_ITEMS) return bad("本次最多注册 " + MAX_ITEMS + " 件道具");
    const rec = {
      key: key,
      name: String(def.name || key).slice(0, 40),
      short: String(def.short || def.name || key).slice(0, 20),
      desc: String(def.desc || "").slice(0, 800),
      effect: def.effect ? String(def.effect).slice(0, 200) : "",
      stack: Math.max(1, Math.min(99, (def.stack | 0) || 1)),
      consume: !!def.consume,           // onUse 返回 true 时是否扣掉 1 个
      onUse: typeof def.onUse === "function" ? def.onUse : null,
    };
    state.items.set(key, rec);
    if (state.applied) applyItem(rec);
    return good({ key: key });
  }

  // ---------- 注册：实体种类 ----------
  function registerEntityKind(def) {
    if (!def || typeof def !== "object") return bad("registerEntityKind 需要对象参数");
    const kind = String(def.kind == null ? "" : def.kind);
    if (!KEY_RE.test(kind)) return bad("实体 kind 只能用小写字母/数字/点/横线/下划线");
    if (state.kinds.has(kind) || CONFIG.MONSTERS[kind]) return bad("实体 kind 已被占用: " + kind);
    if (state.kinds.size >= MAX_KINDS) return bad("本次最多注册 " + MAX_KINDS + " 种实体");
    const model = def.model ? String(def.model) : "";
    if (model && MODELS.indexOf(model) < 0) {
      return bad("model 只能沿用内置外观: " + MODELS.join(", "));
    }
    const rec = {
      kind: kind,
      name: String(def.name || kind).slice(0, 40),
      color: /^#[0-9a-fA-F]{3,8}$/.test(String(def.color || "")) ? String(def.color) : "#4a4a52",
      radius: Math.max(6, Math.min(30, (def.radius | 0) || 12)),
      speedMul: clampNum(def.speedMul, 0.3, 2.2, 1),
      wanderMul: clampNum(def.wanderMul, 0.2, 2, 1),
      sightMul: clampNum(def.sightMul, 0.5, 2, 1),
      lostTime: clampNum(def.lostTime, 1, 30, 5),
      spawnDuration: clampNum(def.spawnDuration, 0.2, 4, 1),
      docile: !!def.docile,
      model: model,
    };
    state.kinds.set(kind, rec);
    if (state.applied) applyKind(rec);
    return good({ kind: kind });
  }

  function clampNum(v, min, max, dflt) {
    const n = Number(v);
    if (!Number.isFinite(n)) return dflt;
    return Math.max(min, Math.min(max, n));
  }

  // ---------- 数值调整 ----------
  function tune(patch) {
    if (!patch || typeof patch !== "object") return bad("tune 需要对象参数");
    const done = {};
    for (const key in patch) {
      if (!Object.prototype.hasOwnProperty.call(TUNABLE, key)) {
        warn("不允许调整的数值: " + key);
        continue;
      }
      const n = Number(patch[key]);
      if (!Number.isFinite(n)) { warn("数值不是有限数字: " + key); continue; }
      const range = TUNABLE[key];
      const val = Math.max(range[0], Math.min(range[1], n));
      state.tuning.set(key, val);
      done[key] = val;
      if (state.applied) { try { CONFIG[key] = val; } catch (e) { warn("写入失败: " + key); } }
    }
    return good({ applied: done });
  }

  // ---------- 事件 ----------
  function on(event, fn) {
    const name = String(event || "");
    if (!name || typeof fn !== "function") return bad("on(event, fn) 参数不合法");
    const list = state.handlers.get(name) || [];
    list.push(fn);
    state.handlers.set(name, list);
    return good({ event: name });
  }

  function __emit(event, detail) {
    const list = state.handlers.get(String(event));
    if (!list || !list.length) return;
    for (const fn of list) {
      try { fn(detail || {}); } catch (e) { warn("事件处理出错(" + event + "): " + (e && e.message)); }
    }
  }

  // ---------- 运行时动作（统一走 main.js 暴露的桥） ----------
  function toast(msg) {
    const b = global.__MOD_BRIDGE;
    if (b && b.toast) { try { b.toast(String(msg)); return true; } catch (e) { /* 忽略 */ } }
    return false;
  }

  function giveItem(key, n) {
    const b = global.__MOD_BRIDGE;
    const k = String(key || "");
    if (!b || !b.addItem) return false;
    if (!ITEMS[k]) { warn("giveItem 未知道具: " + k); return false; }
    try { b.addItem(k, Math.max(1, Math.min(99, (n | 0) || 1))); return true; } catch (e) { return false; }
  }

  function spawnEntity(kind, opts) {
    const b = global.__MOD_BRIDGE;
    const k = String(kind || "");
    if (!b || !b.spawn) return false;
    if (!CONFIG.MONSTERS[k]) { warn("spawnEntity 未知实体: " + k); return false; }
    try { return b.spawn(k, opts || {}); } catch (e) { return false; }
  }

  function goToLevel(level) {
    const b = global.__MOD_BRIDGE;
    if (!b || !b.goToLevel) return false;
    const lv = String(level);
    if (!LEVELS[lv] && !LEVEL0_ROOMS[lv] && !LEVEL11_ROOMS[lv]) { warn("goToLevel 未知层级: " + lv); return false; }
    try { return b.goToLevel(lv); } catch (e) { return false; }
  }

  function playSfx(name) {
    const k = String(name || "");
    if (SFX_ALLOW.indexOf(k) < 0) { warn("不支持的音效: " + k); return false; }
    const A = global.AudioSys;
    if (!A || typeof A[k] !== "function") return false;
    try { A[k](); return true; } catch (e) { return false; }
  }

  function getState() {
    const g = game();
    if (!g) return { phase: "menu", level: null, floor: 0, hp: null, sanity: null, entities: 0, multiplayer: false };
    return {
      phase: g.phase,
      level: g.level,
      floor: g.floor | 0,
      hp: g.hp,
      sanity: g.sanity,
      entities: Array.isArray(g.entities) ? g.entities.length : 0,
      multiplayer: !!g.multi,
      player: g.player ? { x: g.player.x, y: g.player.y } : null,
    };
  }

  function isMultiplayer() {
    const g = game();
    return !!(g && g.multi);
  }

  // ---------- 应用登记表 ----------
  function applyLevel(rec) {
    const id = String(rec.id);
    const entry = {
      id: id,
      label: rec.label,
      name: rec.name,
      style: rec.style,
      size: rec.size,
      floors: rec.floors,
      classes: rec.classes,
      objective: rec.objective,
      monster: rec.monster,
      entities: rec.entities,
    };
    if (rec.shortName) entry.shortName = rec.shortName;
    if (rec.monsters && rec.monsters.length) entry.monsters = rec.monsters;
    if (rec.areas && rec.areas.length) entry.areas = rec.areas.slice();
    LEVELS[id] = entry;
    global.LEVEL_BUILDINGS = global.LEVEL_BUILDINGS || {};
    const b = { seed: rec.seed != null ? rec.seed : hashSeed(id), sideRooms: [], areas: rec.areas.slice() };
    global.LEVEL_BUILDINGS[id] = b;
    if (global.__MOD_LEVEL_IDS.indexOf(id) < 0) global.__MOD_LEVEL_IDS.push(id);
  }

  function applyArea(id, list) {
    const def = LEVELS[String(id)];
    if (def) def.areas = list.slice();
  }

  function applyItem(rec) {
    ITEMS[rec.key] = {
      key: rec.key,
      name: rec.name,
      short: rec.short,
      desc: rec.desc,
      effect: rec.effect,
      stack: rec.stack,
      modItem: true,
    };
    const arr = global.__MOD_ITEM_KEYS;
    if (arr.indexOf(rec.key) < 0) arr.push(rec.key);
  }

  function applyKind(rec) {
    const cfg = {
      name: rec.name,
      color: rec.color,
      radius: rec.radius,
      speedMul: rec.speedMul,
      wanderMul: rec.wanderMul,
      sightMul: rec.sightMul,
      lostTime: rec.lostTime,
      spawnDuration: rec.spawnDuration,
      docile: rec.docile,
      modEntity: true,
    };
    if (rec.model) cfg.shape = rec.model;
    CONFIG.MONSTERS[rec.kind] = cfg;
  }

  function hashSeed(text) {
    let h = 2166136261;
    const s = String(text);
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  function __applyAll() {
    if (state.applied) return true;
    state.applied = true;
    for (const rec of state.levels.values()) { try { applyLevel(rec); } catch (e) { warn("层级写入失败: " + rec.id); } }
    for (const pair of state.areas) { const id = pair[0], list = pair[1]; try { applyArea(id, list); } catch (e) { /* 忽略 */ } }
    for (const rec of state.items.values()) { try { applyItem(rec); } catch (e) { warn("道具写入失败: " + rec.key); } }
    for (const rec of state.kinds.values()) { try { applyKind(rec); } catch (e) { warn("实体写入失败: " + rec.kind); } }
    for (const pair of state.tuning) { try { CONFIG[pair[0]] = pair[1]; } catch (e) { /* 忽略 */ } }
    return true;
  }

  // main.js 用：进入层级后把登记过的区域名贴到地图上（registerLevel 自带的 + registerArea 追加的）
  function __areasFor(levelId) {
    const id = String(levelId);
    const out = [];
    const self = state.levels.get(id);
    if (self && self.areas) { for (const a of self.areas) if (out.indexOf(a) < 0) out.push(a); }
    const added = state.areas.get(id);
    if (added) { for (const a of added) if (out.indexOf(a) < 0) out.push(a); }
    return out.length ? out : null;
  }

  // main.js 用：背包里某件道具的使用回调
  function __modItem(key) {
    return state.items.get(String(key)) || null;
  }

  const api = {
    apiVersion: API_VERSION,
    version: MOD_VERSION,
    registerLevel: registerLevel,
    registerArea: registerArea,
    registerItem: registerItem,
    registerEntityKind: registerEntityKind,
    tune: tune,
    on: on,
    toast: toast,
    giveItem: giveItem,
    spawnEntity: spawnEntity,
    goToLevel: goToLevel,
    playSfx: playSfx,
    getState: getState,
    isMultiplayer: isMultiplayer,
    getEnabledMods: function () {
      const ws = global.VibeHubWorkshop;
      return ws && typeof ws.getEnabledMods === "function" ? ws.getEnabledMods() : [];
    },
    getCapability: function (id) {
      const ws = global.VibeHubWorkshop;
      return ws && typeof ws.getCapability === "function" ? ws.getCapability(id) : null;
    },
    __applyAll: __applyAll,
    __emit: __emit,
    __areasFor: __areasFor,
    __modItem: __modItem,
    __errors: state.errors,
  };

  global.BackroomsMod = api;
  global[API_NAME] = api;   // 允许 window.BackroomsMod / window.BackroomsMod 两种写法
})(window);
