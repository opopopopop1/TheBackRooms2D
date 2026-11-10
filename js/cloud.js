"use strict";
// ============================================================
// 云存档 / 账号
//
// 支持两种后端，自动二选一（配了 PublishableKey 就走 CloudBase RPC，
// 否则沿用自建的 Express 后端）：
//
//   A. CloudBase 数据模型 RPC —— 前端直连数据库，不需要服务器 / 云函数。
//      在 js/config.js 里填上 RPC 地址与 PublishableKey 即可。
//      数据库侧执行 sql/cloudbase-rpc.sql 建表建函数。
//   B. 自建 Express 后端（server/ 目录）—— 传统部署方式。
//
//
// 设计原则：
//   1. 不登录也能玩 —— 数据照旧写浏览器缓存（localStorage），行为和以前一样。
//   2. 登录后 —— 本地仍保留一份缓存（断网也能玩），同时与云端双向同步。
//   3. 云端挂了 —— 静默降级，绝不打断游玩；等恢复了再补传。
//
// 存档合并策略：档案 / 服装 / 结局 / 枢纽门 一律取"并集"（哪边多听谁的，
// 不会丢进度）；当前穿着、AI 权重这类单一取值，以云端为准。
// ============================================================
(function () {
  const API = (window.BACKROOMS_API || "") + "/api";

  // ---------- CloudBase 数据模型 RPC（前端直连，不需要服务器）----------
  // 地址与公钥在 js/config.js 里配置。两个都填了才会走这条路。
  const RPC_BASE = (window.BACKROOMS_RPC || "").trim();
  const RPC_KEY = (window.BACKROOMS_PUBKEY || "").trim();
  const RPC_ON = !!RPC_BASE && !!RPC_KEY;
  // 什么都没配：既没有云 RPC，也没有自建后端地址 —— 直接离线。
  // 这种情况要是还去请求 /api/register，打到的就是静态托管，永远 404。
  const NO_BACKEND = !RPC_ON && !(window.BACKROOMS_API || "").trim();
  // 网关不放行（403 / 函数没加进允许列表 / CORS 拦下）时，本会话内就不再重试，
  // 免得控制台被同一条报错刷满、也免得每 30 秒打一次请求。
  let rpcBlocked = false;
  function rpcUsable() { return RPC_ON && !rpcBlocked; }

  // ---------- 通关率上传开关 ----------
  // 设置里关掉「上传数据至排行榜」之后就一条都不再发；已经发出去的数据不清除。
  const RATE_KEY = "br_rate_upload";
  function rateUploadOn() {
    try { return localStorage.getItem(RATE_KEY) !== "0"; } catch (e) { return true; }
  }
  function setRateUpload(on) {
    try { localStorage.setItem(RATE_KEY, on ? "1" : "0"); } catch (e) { /* 忽略 */ }
  }

  // 旧接口 -> RPC 函数名 / 参数
  const RPC_MAP = {
    "/register":  { fn: "br_register",  args: (b) => ({ p_nick: b && b.nickname, p_pwd: b && b.password }) },
    "/login":     { fn: "br_login",     args: (b) => ({ p_nick: b && b.nickname, p_pwd: b && b.password }) },
    "/heartbeat": { fn: "br_heartbeat", args: (b) => ({ p_token: b && b.token, p_nick: b && b.nick, p_sess: b && b.sess }) },
    "/online":    { fn: "br_online",    args: () => ({}) },
    "/saveget":   { fn: "br_get_save",  args: (b) => ({ p_token: b && b.token }) },
    "/saveput":   { fn: "br_put_save",  args: (b) => ({ p_token: b && b.token, p_data: (b && b.data) || {} }) },
    "/slotget":   { fn: "br_slot_get",  args: (b) => ({ p_token: b && b.token }) },
    "/slotput":   { fn: "br_slot_put",  args: (b) => ({ p_token: b && b.token, p_slot: (b && b.slot) || {} }) },
    "/rateput":   { fn: "br_rate_put",  args: (b) => ({ p_lvl: b && b.level, p_clear: !!(b && b.clear) }) },
    "/rateget":   { fn: "br_rate_get",  args: () => ({}) },
  };
  function rpcRaw(fn, body) {
    if (!RPC_ON || rpcBlocked) return Promise.resolve(null);
    return fetch(RPC_BASE + fn, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + RPC_KEY },
      body: JSON.stringify(body || {}),
    }).then((r) => (r.ok ? r.json().catch(() => null) : null)).catch(() => null);
  }

  // ===========================================================
  // 挤号：同一个账号同时只允许一个网页登录。
  // 第二个想登同一个号 -> 发申请（填理由）；已登录那一边同意后才放行。
  // 云函数没建 / 没放行时，退到同一个浏览器内的 BroadcastChannel，
  // 至少同机多标签页这条链路能用。
  // ===========================================================
  const LR_CH = "backrooms_login_v1";
  let lrBC = null, lrLocal = null;
  function lrChan() {
    try { if (!lrBC && typeof BroadcastChannel !== "undefined") lrBC = new BroadcastChannel(LR_CH); }
    catch (e) { lrBC = null; }
    return lrBC;
  }
  function lrInit() {
    if (lrLocal) return;
    lrLocal = { reqs: {}, watchers: [] };
    const bc = lrChan();
    if (!bc) return;
    bc.onmessage = (ev) => {
      const m = ev.data || {};
      if (m.t === "ask") {                       // 有人问：这个号是不是已经登着
        bc.postMessage({ t: "iam", nick: m.nick, live: isIn() && user && user.nickname &&
          String(user.nickname).toLowerCase() === String(m.nick).toLowerCase() });
      } else if (m.t === "iam") {
        lrLocal.lastIam = m;
      } else if (m.t === "req") {                 // 有人发申请 -> 通知已登录那一边
        lrLocal.reqs[m.req_id] = { req_id: m.req_id, reason: m.reason, state: "pending" };
        lrLocal.watchers.forEach((f) => { try { f(lrLocal.reqs[m.req_id]); } catch (e) { /* 忽略 */ } });
      } else if (m.t === "reply") {
        if (lrLocal.reqs[m.req_id]) lrLocal.reqs[m.req_id].state = m.accept ? "ok" : "no";
      }
    };
  }
  // 这个号现在有没有别的网页在用
  let lrCloudOk = null;            // null=还没试过 true=云端可用 false=只有同浏览器
  function lrBusy(nick) {
    lrInit();
    if (RPC_ON && !rpcBlocked && lrCloudOk !== false) {
      return rpcRaw("br_session_live", { p_nick: nick, p_self: sessKey() }).then((r) => {
        if (r && typeof r.live !== "undefined") { lrCloudOk = true; return (r.live | 0) > 0; }
        // 函数没建（返回体里没有 live）-> 记下来，界面上要如实说只能查同一浏览器
        lrCloudOk = false;
        return lrBusyLocal(nick);
      }).catch(() => { lrCloudOk = false; return lrBusyLocal(nick); });
    }
    return lrBusyLocal(nick);
  }
  function lrBusyLocal(nick) {
    const bc = lrChan();
    if (!bc) return Promise.resolve(false);
    lrLocal.lastIam = null;
    bc.postMessage({ t: "ask", nick: nick });
    return new Promise((res) => setTimeout(() => res(!!(lrLocal.lastIam && lrLocal.lastIam.live)), 900));
  }
  function sessKey() {
    try {
      let k = sessionStorage.getItem("br_sess_key");
      if (!k) { k = "k" + Math.random().toString(36).slice(2, 10); sessionStorage.setItem("br_sess_key", k); }
      return k;
    } catch (e) { return "k" + Math.random().toString(36).slice(2, 10); }
  }
  function lrSend(nick, reqId, reason) {
    lrInit();
    if (RPC_ON && !rpcBlocked) {
      return rpcRaw("br_login_req", { p_nick: nick, p_req_id: reqId, p_reason: reason })
        .then((r) => !!(r && r.ok)).catch(() => false);
    }
    const bc = lrChan();
    if (bc) { lrLocal.reqs[reqId] = { req_id: reqId, reason: reason, state: "pending" }; bc.postMessage({ t: "req", req_id: reqId, nick: nick, reason: reason }); return Promise.resolve(true); }
    return Promise.resolve(false);
  }
  function lrPoll(nick) {
    lrInit();
    if (RPC_ON && !rpcBlocked) {
      return rpcRaw("br_login_poll", { p_nick: nick }).catch(() => null).then((r) => {
        if (r && r.req_id) return { req_id: r.req_id, reason: r.reason || "" };
        const q = lrLocal && lrLocal.reqs;
        if (q) for (const k in q) if (q[k].state === "pending") return q[k];
        return null;
      });
    }
    const q = lrLocal && lrLocal.reqs;
    if (q) for (const k in q) if (q[k].state === "pending") return Promise.resolve(q[k]);
    return Promise.resolve(null);
  }
  function lrReply(reqId, accept) {
    lrInit();
    if (RPC_ON && !rpcBlocked) rpcRaw("br_login_reply", { p_req_id: reqId, p_accept: !!accept });
    const bc = lrChan();
    if (bc) bc.postMessage({ t: "reply", req_id: reqId, accept: !!accept });
    if (lrLocal && lrLocal.reqs[reqId]) lrLocal.reqs[reqId].state = accept ? "ok" : "no";
    return Promise.resolve(true);
  }
  function lrCheck(reqId) {
    lrInit();
    if (RPC_ON && !rpcBlocked) {
      return rpcRaw("br_login_check", { p_req_id: reqId }).catch(() => null).then((r) => {
        if (r && r.state) return r.state;
        const q = lrLocal && lrLocal.reqs[reqId];
        return q ? q.state : "gone";
      });
    }
    const q = lrLocal && lrLocal.reqs[reqId];
    return Promise.resolve(q ? q.state : "gone");
  }
  // 监听器要在页面一加载就装好：申请是随时可能发过来的，
  // 等到轮询那一刻才挂 BroadcastChannel，先到的消息就会被漏掉。
  lrInit();

  // 已登录那一边：盯着有没有人申请挤号
  let lrWatchTimer = null;
  function lrWatch(cb) {
    lrInit();
    if (!lrLocal.watchers.includes(cb)) lrLocal.watchers.push(cb);
    const bc = lrChan();
    if (bc) {
      // 本地频道：别人发 req 时 onmessage 已经回调了 watchers，这里不用轮询
    }
    clearInterval(lrWatchTimer);
    lrWatchTimer = setInterval(() => {
      if (!isIn() || !user) return;
      lrPoll(user.nickname).then((r) => { if (r && r.req_id) cb(r); });
    }, 2500);
  }
  function lrStopWatch() { clearInterval(lrWatchTimer); lrWatchTimer = null; }

  let pingMs = 0;                 // 最近一次 RPC 往返耗时（左下角要显示）
  function rpcCall(path, body) {
    const m = RPC_MAP[path];
    if (!m) return Promise.resolve({ ok: false, msg: "RPC 未定义 " + path });
    // 已经确认网关不放行：别再打了，也别掉回 /api 去撞 404
    if (rpcBlocked) return Promise.resolve({ ok: false, msg: "云服务没放行（已停止重试）" });
    const ctl = new AbortController();
    const to = setTimeout(() => ctl.abort(), 8000);
    const t0 = (performance && performance.now) ? performance.now() : Date.now();
    return fetch(RPC_BASE + m.fn, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + RPC_KEY,
      },
      body: JSON.stringify(m.args(body)),
      signal: ctl.signal,
    })
      .then((r) => {
        const t1 = (performance && performance.now) ? performance.now() : Date.now();
        if (r && r.ok) pingMs = t1 - t0;
        // 403 = 网关的允许列表里没有这个函数（policy_default_denied）
        if (!r.ok) {
          if (r.status === 403 || r.status === 401) rpcBlocked = true;
          const hint = (r.status === 403 || r.status === 401)
            ? "网关没放行这个函数 —— 去控制台把 br_* 加进允许列表"
            : "服务返回 " + r.status;
          setStatus(false, (r.status === 403 || r.status === 401) ? "云服务没放行（" + r.status + "）" : "云服务返回 " + r.status);
          return { ok: false, msg: hint };
        }
        return r.json().catch(() => ({ ok: false, msg: "返回格式错误" }));
      })
      .then((j) => { setStatus(true); return j; })
      .catch((e) => {
        // 网络层被拦（CORS / 断网）：也算不通，本会话内不再重试
        const c = String((e && e.message) || "");
        const blocked = /Failed to fetch|CORS|policy|NetworkError/i.test(c);
        if (blocked) rpcBlocked = true;
        setStatus(false, blocked ? "云服务没放行（网关拦下了请求）" :
          (e && e.name === "AbortError" ? "云服务超时" : "连不上云服务"));
        return { ok: false, msg: blocked ? "云服务没放行，请检查网关策略" : "连不上云服务" };
      })
      .finally(() => clearTimeout(to));
  }

  // 本地缓存的键名（沿用旧版的，老玩家的进度不会丢）
  const K = {
    archives: "backrooms.archives.v1",
    unlocks: "br_unlocks",
    outfit: "br_outfit",
    endings: "br_endings",
    hub: "br_hub_unlocked_v1",
    weights: "backrooms.ai.weights.v1",
    token: "br_cloud_token",
    user: "br_cloud_user",
    anon: "br_anon_id",
  };

  const ls = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* 隐私模式忽略 */ } },
    str(k, d) { try { return localStorage.getItem(k) == null ? d : localStorage.getItem(k); } catch (e) { return d; } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* 忽略 */ } },
  };

  // ---------- 匿名 id：没登录也要能计入在线人数 ----------
  function anonId() {
    let v = ls.str(K.anon, "");
    if (!v) {
      v = "a" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      try { localStorage.setItem(K.anon, v); } catch (e) { /* 忽略 */ }
    }
    return v;
  }

  // ---------- 登录态 ----------
  let token = ls.str(K.token, "");
  let user = ls.get(K.user, null);
  let onlineN = 0, loggedN = 0;
  let pushTimer = null;
  let syncing = false;

  // 连接状态：unknown（还没试过）/ online / offline
  let status = "unknown";
  let lastErr = "";
  // HTTPS 页面请求 HTTP 接口会被浏览器直接拦掉，且不会给出可读的报错 —— 提前自检一次
  (function checkMixed() {
    if (!location.protocol.startsWith("https")) return;
    const b = (window.BACKROOMS_API || "").trim();
    const r2 = (window.BACKROOMS_RPC || "").trim();
    const bad = [b, r2].find((x) => x && x.startsWith("http://"));
    if (bad) {
      lastErr = "页面是 HTTPS，但云服务地址是 HTTP —— 浏览器会拦截。请把后端也配成 HTTPS。";
      status = "offline";
      console.warn("[cloud] " + lastErr);
    }
  })();

  // 云存档的本地兜底副本（没登录 / 云端不通时也能记住上次在哪）
  const SLOT_KEY = "br_cloud_slot";
  function slotLocal() {
    try { return JSON.parse(localStorage.getItem(SLOT_KEY) || "null"); } catch (e) { return null; }
  }
  function slotSaveLocal(slot) {
    try {
      if (!slot) localStorage.removeItem(SLOT_KEY);
      else localStorage.setItem(SLOT_KEY, JSON.stringify(slot));
    } catch (e) { /* 忽略 */ }
  }

  const isIn = () => !!token && !!user;
  const listeners = [];
  function emit() { for (const f of listeners) { try { f(); } catch (e) { /* 忽略 */ } } }

  function setStatus(okFlag, msg) {
    const prev = status;
    status = okFlag ? "online" : "offline";
    if (msg) lastErr = msg;
    if (prev !== status) emit();
  }

  function req(path, method, body) {
    if (NO_BACKEND) {
      // 静默离线：不刷控制台、不打断游玩，进度照旧存本地
      setStatus(false, "未配置云服务 —— 进度存在这台设备上");
      return Promise.resolve({ ok: false, msg: "未配置云服务", offline: true });
    }
    // 走 CloudBase RPC：/save 按 GET / POST 分成读和写
    if (RPC_ON) {
      if (path === "/save" && (method || "GET") === "GET") return rpcCall("/saveget", { token: token });
      if (path === "/save") return rpcCall("/saveput", { token: token, data: body && body.save });
      return rpcCall(path, body);
    }
    const opt = { method: method || "GET", headers: {} };
    if (body) { opt.headers["Content-Type"] = "application/json"; opt.body = JSON.stringify(body); }
    if (token) opt.headers["Authorization"] = "Bearer " + token;
    const ctl = new AbortController();
    const to = setTimeout(() => ctl.abort(), 8000);
    opt.signal = ctl.signal;
    return fetch(API + path, opt)
      .then((r) => {
        if (!r.ok) { setStatus(false, "云服务返回 " + r.status); return { ok: false, msg: "服务返回 " + r.status }; }
        return r.json().catch(() => ({ ok: false, msg: "返回格式错误" }));
      })
      .then((j) => { setStatus(true); return j; })
      .catch((e) => {
        setStatus(false, e && e.name === "AbortError" ? "云服务超时" : "连不上云服务");
        return { ok: false, msg: "连不上云服务" };
      })
      .finally(() => clearTimeout(to));
  }

  // ---------- 本地存档读写 ----------
  function snapshot() {
    return {
      archives: ls.get(K.archives, []),
      unlocks: ls.get(K.unlocks, []),
      outfit: ls.str(K.outfit, ""),
      endings: ls.get(K.endings, []),
      hub: ls.get(K.hub, []),
      weights: ls.get(K.weights, null),
      updatedAt: Date.now(),
    };
  }
  // 并集合并
  function merge(a, b) {
    const uni = (x, y) => Array.from(new Set([].concat(x || [], y || [])));
    return {
      archives: uni(a.archives, b.archives),
      unlocks: uni(a.unlocks, b.unlocks),
      endings: uni(a.endings, b.endings),
      hub: uni(a.hub, b.hub),
      // 单一取值：以参数 b（云端）为准，云端没有就沿用本地
      outfit: b.outfit || a.outfit || "",
      weights: b.weights || a.weights || null,
      updatedAt: Date.now(),
    };
  }
  function apply(s) {
    ls.set(K.archives, s.archives || []);
    ls.set(K.unlocks, s.unlocks || []);
    ls.set(K.endings, s.endings || []);
    ls.set(K.hub, s.hub || []);
    if (s.outfit) { try { localStorage.setItem(K.outfit, s.outfit); } catch (e) { /* 忽略 */ } }
    if (s.weights) ls.set(K.weights, s.weights);
  }

  // 先把云端存档拉下来，和本地取并集，再写回两边（换设备登录不会丢进度）
  function pullThenPush() {
    return req("/save", "GET")
      .then((r) => {
        const remote = (r && (r.save || r.data)) || null;
        const s = merge(snapshot(), remote || {});
        apply(s);
        return push();
      })
      .then(() => { emit(); return user; });
  }

  // ---------- 自动同步（有间隔）----------
  // 登录后每隔一段时间自动来一次"先拉后推"：云端有的合并进来，本地新的传上去。
  // 这样换设备、或者中途关了页面，进度也不会差太多。
  let syncTimer = null, lastSyncAt = 0, syncingNow = false;
  const SYNC_EVERY = 60000;        // 60 秒一次
  function autoSync() {
    if (!isIn() || syncingNow) return Promise.resolve(false);
    if (rpcBlocked) return Promise.resolve(false);
    syncingNow = true;
    return req("/save", "GET")
      .then((r) => {
        const remote = (r && (r.save || r.data)) || null;
        if (r && r.ok) { apply(merge(snapshot(), remote || {})); lastSyncAt = Date.now(); }
        return r && r.ok ? push() : Promise.resolve(false);
      })
      .then((ok) => { syncingNow = false; if (ok) lastSyncAt = Date.now(); emit(); return ok; })
      .catch(() => { syncingNow = false; return false; });
  }
  function startAutoSync() {
    stopAutoSync();
    if (!isIn()) return;
    syncTimer = setInterval(autoSync, SYNC_EVERY);
  }
  function stopAutoSync() {
    if (syncTimer) { clearInterval(syncTimer); syncTimer = null; }
  }

  // ---------- 上传（节流 2 秒，避免每次捡档案都打接口）----------
  function pushSoon() {
    if (!isIn() || syncing) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(push, 2000);
  }
  function push() {
    if (!isIn()) return Promise.resolve(false);
    syncing = true;
    return req("/save", "POST", { save: snapshot() })
      .then((r) => { syncing = false; return !!(r && r.ok); })
      .catch(() => { syncing = false; return false; });
  }

  // ---------- 对外：各存档字段 ----------
  function addTo(key, val) {
    const list = ls.get(key, []);
    if (list.indexOf(val) >= 0) return false;
    list.push(val);
    ls.set(key, list);
    pushSoon();
    return true;
  }

  const Cloud = {
    // ---- 账号 ----
    get user() { return user; },
    get online() { return onlineN; },
    get ping() { return pingMs; },
    get loggedOnline() { return loggedN; },
    isIn: isIn,
    get status() { return status; },
    get lastError() { return lastErr; },
    onChange(f) { listeners.push(f); },
    emit: emit,

    register(nickname, password) {
      return req("/register", "POST", { nickname, password }).then((r) => {
        if (!r || !r.ok) throw new Error((r && r.msg) || "注册失败");
        token = r.token;
        user = { id: r.userId || 0, nickname: r.nickname || r.nick || nickname };
        ls.set(K.token, token); ls.set(K.user, user);
        emit(); heartbeat(); startAutoSync();
        // RPC 版的注册不顺便返回存档，所以先拉一次云端，并集后再写回
        return pullThenPush();
      });
    },
    login(nickname, password) {
      return req("/login", "POST", { nickname, password }).then((r) => {
        if (!r || !r.ok) throw new Error((r && r.msg) || "登录失败");
        token = r.token;
        user = { id: r.userId || 0, nickname: r.nickname || r.nick || nickname };
        ls.set(K.token, token); ls.set(K.user, user);
        emit(); heartbeat(); startAutoSync();
        return pullThenPush();
      });
    },
    logout() {
      if (RPC_ON) { /* 无服务端会话，本地清掉就行 */ }
      else req("/logout", "POST", {}).catch(() => {});
      stopAutoSync();
      token = ""; user = null;
      ls.del(K.token); ls.del(K.user);
      emit();
    },
    // 手动同步一次（设置里可以点）
    syncNow() { return isIn() ? autoSync() : Promise.resolve(false); },
    // ---- 云存档：记住玩家退出前所在的层级与位置 ----
    slotGet() {
      if (!isIn()) return Promise.resolve(null);
      if (NO_BACKEND) return Promise.resolve(slotLocal());
      return req("/slotget", "GET").then((r) => {
        const slot = (r && (r.slot || r.data)) || null;
        if (slot && slot.level != null) { slotSaveLocal(slot); return slot; }
        return slotLocal();
      }).catch(() => slotLocal());
    },
    slotPut(slot) {
      slotSaveLocal(slot);
      if (!isIn() || NO_BACKEND) return Promise.resolve(false);
      return req("/slotput", "POST", { slot: slot })
        .then((r) => !!(r && r.ok)).catch(() => false);
    },
    slotClear() {
      try { localStorage.removeItem("br_cloud_slot"); } catch (e) { /* 忽略 */ }
      if (!isIn() || NO_BACKEND) return Promise.resolve(false);
      return req("/slotput", "POST", { slot: null })
        .then((r) => !!(r && r.ok)).catch(() => false);
    },

    // ---------- 通关率排行榜 ----------
    // 登录与否都会记：进去过一次算 tries，活着走出去一次算 clears。
    // 设置里可以关掉 —— 关了就不再上传，但已经上传的数据不会被清掉。
    rateUploadOn: rateUploadOn,
    setRateUpload: setRateUpload,
    // 注意：这两个走 rpcRaw，不走 req —— 网关万一没放行 br_rate_*，
    // 只会让排行榜读不到，不会把整条云通道（云存档 / 登录）一起判死。
    ratePut(level, cleared) {
      const lv = String(level == null ? "" : level);
      if (!lv || lv === "" || lv === "null") return Promise.resolve(false);
      if (!rateUploadOn()) return Promise.resolve(false);   // 关掉了：一条都不发
      if (!RPC_ON || rpcBlocked || NO_BACKEND) return Promise.resolve(false);
      return rpcRaw("br_rate_put", { p_lvl: lv, p_clear: !!cleared })
        .then((r) => !!(r && r.ok)).catch(() => false);
    },
    rateGet() {
      if (!RPC_ON || rpcBlocked || NO_BACKEND) return Promise.resolve([]);
      return rpcRaw("br_rate_get", {}).then((r) => {
        if (!r) return [];
        if (Array.isArray(r)) return r;
        return (r.data || r.rows || r.result || []);
      }).catch(() => []);
    },
    // 挤号申请
    lrBusy: lrBusy, lrSend: lrSend, lrPoll: lrPoll, lrReply: lrReply,
    get lrCloudOk() { return lrCloudOk; },
    get lrLocalOnly() { return lrCloudOk === false || !RPC_ON || rpcBlocked; },
    lrCheck: lrCheck, lrWatch: lrWatch, lrStopWatch: lrStopWatch,
    get lastSyncAt() { return lastSyncAt; },
    get syncing() { return !!syncingNow; },
    startAutoSync() { startAutoSync(); },
    stopAutoSync() { stopAutoSync(); },

    // ---- 档案 ----
    archives() { return new Set(ls.get(K.archives, [])); },
    addArchive(id) { const okk = addTo(K.archives, id); if (okk) emit(); return okk; },

    // ---- 服装 ----
    unlocks() { return ls.get(K.unlocks, []); },
    hasUnlock(id) { return ls.get(K.unlocks, []).indexOf(id) >= 0; },
    unlock(id) { const okk = addTo(K.unlocks, id); if (okk) emit(); return okk; },
    outfit() { return ls.str(K.outfit, ""); },
    setOutfit(v) {
      try { localStorage.setItem(K.outfit, v); } catch (e) { /* 忽略 */ }
      pushSoon(); emit();
    },

    // ---- 结局 ----
    endings() { return ls.get(K.endings, []); },
    addEnding(id) { return addTo(K.endings, id); },

    // ---- 枢纽已开的门 ----
    hub() { return ls.get(K.hub, []); },
    unlockHub(v) { return addTo(K.hub, String(v)); },

    // ---- AI 权重 ----
    weights() { return ls.get(K.weights, null); },
    setWeights(o) { ls.set(K.weights, o); pushSoon(); },

    // ---- 在线人数 ----
    heartbeat,
    _setOnline(n, l) { onlineN = n; loggedN = l; emit(); },
  };

  // ---------- 心跳：登录与未登录都发 ----------
  let hbTimer = null;
  function heartbeat(levelLabel) {
    if (RPC_ON) {
      // 没登录就用匿名 id —— 这样游客也算进在线人数里
      req("/heartbeat", "POST", { token: token || anonId(), nick: user ? user.nickname : "", sess: sessKey() })
        .then(() => req("/online", "GET"))
        .then((r) => { if (r && r.ok) { onlineN = r.n || 0; loggedN = 0; emit(); } })
        .catch(() => { /* 云挂了就当没有，不影响玩 */ });
      return;
    }
    req("/heartbeat", "POST", { anonId: anonId(), level: levelLabel || "" })
      .then((r) => { if (r && r.ok) { onlineN = r.online || 0; loggedN = r.logged || 0; emit(); } })
      .catch(() => { /* 云挂了就当没有，不影响玩 */ });
  }
  Cloud.startHeartbeat = function (getLevel) {
    clearInterval(hbTimer);
    heartbeat();
    hbTimer = setInterval(() => heartbeat(getLevel ? getLevel() : ""), 30000);
    // 关页面时尽量告别一下（不保证送达，服务端有超时兜底）
    window.addEventListener("pagehide", () => { clearInterval(hbTimer); });
  };

  // ---------- 启动时：如果本地有登录态，先拉一次云端 ----------
  function boot() {
    if (!isIn()) { Cloud.startHeartbeat(); return; }
    startAutoSync();          // 已有登录态：启动时就挂上定时同步
    req("/save", "GET")
      .then((r) => {
        const remote = (r && (r.save || r.data)) || null;
        if (remote) {
          const s = merge(snapshot(), remote);
          apply(s);
          push();          // 把并集写回云端
        }
        emit();
      })
      .catch(() => { /* 拿不到就用本地的 */ })
      .finally(() => Cloud.startHeartbeat());
  }

  Cloud.boot = boot;
  window.Cloud = Cloud;

  // 一键自检：在控制台里敲 BRCloudDiag() 就能看清到底卡在哪一层
  // 关页面 / 切到后台：尽量把这一刻的进度推上去，别白玩
  window.addEventListener("pagehide", () => { if (isIn()) { try { push(); } catch (e) { /* 忽略 */ } } });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden" && isIn()) { try { push(); } catch (e) { /* 忽略 */ } }
  });

  function probe(fn, body) {
    const t0 = (performance && performance.now) ? performance.now() : Date.now();
    return fetch(RPC_BASE + fn, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + RPC_KEY },
      body: JSON.stringify(body || {}),
    }).then((r) => r.text().then((t) => {
      const t1 = (performance && performance.now) ? performance.now() : Date.now();
      if (r.status === 200) return { fn: fn, ok: true, ms: Math.round(t1 - t0) };
      return { fn: fn, ok: false, status: r.status, why: (t || "").slice(0, 150) };
    })).catch((e) => ({ fn: fn, ok: false, why: String((e && e.message) || e).slice(0, 150) }));
  }
  window.BRCloudDiag = function () {
    const out = { rpc: RPC_BASE || "(未配置)", key: RPC_KEY ? "已配置" : "未配置",
                  api: API, blocked: rpcBlocked, ping: Math.round(pingMs) };
    if (!RPC_ON) { out.result = "没配 RPC，正在走离线（一个请求都不发）"; return Promise.resolve(out); }
    const list = ["br_online", "br_heartbeat", "br_register", "br_login", "br_get_save", "br_put_save",
                  "br_room_list", "br_room_create", "br_room_join",
                  "br_room_touch", "br_room_send", "br_room_recv", "br_room_leave",
                  "br_slot_get", "br_slot_put", "br_rate_put", "br_rate_get"];
    return Promise.all(list.map((f) => probe(f, {}))).then((rs) => {
      out.probe = rs;
      const bad = rs.filter((r) => !r.ok);
      const roomBad = bad.filter((r) => r.fn.indexOf("br_room") === 0);
      const acctBad = bad.filter((r) => r.fn.indexOf("br_room") !== 0);
      out["账号函数"] = acctBad.length ? ("缺 " + acctBad.length + " 个：" + acctBad.map((r) => r.fn).join(", ")) : "全部可用";
      out["联机房间函数"] = roomBad.length ? ("缺 " + roomBad.length + " 个：" + roomBad.map((r) => r.fn).join(", ")) : "全部可用";
      const rateBad = bad.filter((r) => r.fn.indexOf("br_rate") === 0);
      out["排行榜函数"] = rateBad.length ? ("缺 " + rateBad.length + " 个：" + rateBad.map((r) => r.fn).join(", ") + " —— 去执行 sql/cloudbase-rate.sql，再把 br_rate_* 加进网关允许列表") : "全部可用";
      out.result = !bad.length ? "全部通了 —— 跨设备联机可用"
        : (acctBad.length === 0 && roomBad.length ? "账号正常，但房间函数没建或没放行 —— 去执行 sql/cloudbase-rooms.sql，再把 br_room_* 加进网关允许列表"
          : "有函数被拦下（403）或还没创建 —— 看 probe 明细");
      return out;
    });
  };
})();
