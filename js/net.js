"use strict";
// ============================================================
// 联机：房间发现 / 房间号 / 建房间 / 进房间 / 点对点传输 / 投票踢人
//
// 【同步模型：host-authority（房主权威）】—— 按 VibeHub 规范第二节声明。
//   选它的理由：后室是"程序化地图 + 大量实体 AI + 环境危害"（301 腐蚀掉血、
//   994 涨潮、窃皮者四段循环）。房主跑世界演算并广播权威状态，客人只上报输入、
//   收快照渲染。棋牌/回合制/有裁判/要防作弊的模型，正好对得上。
//   不用 state-sync：实体太多，全量快照会爆；不用 lockstep：实体 AI 做不到
//   完全确定性，两端会发散。
//
// 拓扑：星型。房主是中心。世界状态由房主算（地图是固定种子，大家布局一致），
// 客人只发自己的输入、收房主广播过来的其它玩家位置和实体位置。
//
// 两种传输，玩家自己选（联机模式里点）：
//   A. 局域网联机 —— BroadcastChannel，同一台机器的多个标签页，离线可用。
//   B. 网络联机 —— VibeHub SDK v3，WebRTC P2P 直连 + VibeNet 中继自动兜底。
//
// 【云通道已关闭】以前还有一条"数据库轮询信令"的云通道，它同时踩了 VibeHub
// 两条红线（禁止自建后端 / 禁止用轮询同步实时对局状态），已整体移除：
// CLOUD_ON 恒为 false，一条云请求都不会发出去。
// ============================================================
(function () {
  // 云通道永久关闭：不看配置，直接写死。cloudBus / hybridBus 保留但不再被引用。
  const RPC_BASE = "";
  const RPC_KEY = "";
  const CLOUD_ON = false;

  // ---------- 自己的身份 ----------
  // 光用账号 token / 匿名 id 是不够的：它们都存在 localStorage 里，而同一浏览器的
  // 多个标签页是共享 localStorage 的 —— 两个标签页会拿到一模一样的 token，
  // 于是互相把对方当成"我自己"，消息全被丢掉，联机根本建不起来（同一账号在两台
  // 设备上也是同一个 token，同样联不了）。
  // 所以再拼一个"会话 id"：每个标签页独立，存 sessionStorage，关掉就没了。
  let _sess = "";
  function sessionId() {
    if (_sess) return _sess;
    try {
      _sess = sessionStorage.getItem("br_sess_id");
      if (!_sess) {
        _sess = "s" + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
        sessionStorage.setItem("br_sess_id", _sess);
      }
    } catch (e) {
      // 隐私模式等拿不到 sessionStorage：退成内存里的随机串，本页有效
      _sess = "s" + Math.random().toString(36).slice(2, 10);
    }
    return _sess;
  }
  // 网络联机（VibeHub）时，身份直接用 SDK 给的 peerId —— 它天然唯一，
  // 上层那套"token + 会话 id"的去重、踢人、投票逻辑就能原样复用。
  let _vibeId = "";

  // 登录了用云 token + 会话 id，没登录用本地匿名 id + 会话 id
  function myToken() {
    if (_vibeId) return _vibeId;
    let t = "";
    try {
      t = (window.Cloud && window.Cloud.isIn && window.Cloud.isIn())
        ? (JSON.parse(localStorage.getItem("br_cloud_token") || '""') || "")
        : "";
    } catch (e) { t = ""; }
    if (!t) {
      t = localStorage.getItem("br_anon_id");
      if (!t) { t = "a" + Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem("br_anon_id", t); }
    }
    return t + "@" + sessionId();
  }
  // 本机账号名：流浪者 + 随机不重复编号。
  // "不重复"靠本机记一份用过的号表；换设备撞号的概率很低，撞了也只是名字一样，
  // 真正区分身份的还是 token。
  function localNick() {
    try {
      // 名字存在 sessionStorage：同一浏览器的多个标签页各拿一个，
      // 存 localStorage 的话所有标签页会共用一个名字，联机时分不清谁是谁。
      let n = sessionStorage.getItem("br_local_nick");
      if (n) return n;
      let used = [];
      try { used = JSON.parse(localStorage.getItem("br_nick_used") || "[]"); } catch (e) { used = []; }
      if (!Array.isArray(used)) used = [];
      let num = null;
      for (let i = 0; i < 300; i++) {
        const c = 1000 + Math.floor(Math.random() * 9000);
        if (used.indexOf(c) < 0) { num = c; break; }
      }
      if (num == null) num = 1000 + Math.floor(Math.random() * 9000);   // 号段用完了，随缘
      used.push(num);
      if (used.length > 500) used = used.slice(-500);
      localStorage.setItem("br_nick_used", JSON.stringify(used));
      n = "流浪者" + num;
      sessionStorage.setItem("br_local_nick", n);
      return n;
    } catch (e) {
      return "流浪者" + (1000 + Math.floor(Math.random() * 9000));
    }
  }
  function myNick() {
    try {
      const u = JSON.parse(localStorage.getItem("br_cloud_user") || "null");
      if (u && u.nickname) return u.nickname;
    } catch (e) { /* 忽略 */ }
    return localStorage.getItem("br_nick") || localNick();
  }

  // ---------- 云 RPC 调用 ----------
  function rpc(fn, body) {
    return fetch(RPC_BASE + fn, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + RPC_KEY },
      body: JSON.stringify(body || {}),
    }).then((r) => (r.ok ? r.json() : { ok: false, msg: "服务返回 " + r.status }))
      .catch(() => ({ ok: false, msg: "连不上云服务" }));
  }

  // ============================================================
  // 本地频道：同一浏览器多标签页（离线也能玩）
  //
  // 浏览器扫不到局域网里的其它设备，所以这里的"发现"只能覆盖同一台机器上的
  // 多个标签页。真要跨设备发现，走上面的云信令（填了 PublishableKey 自动切换）。
  // ============================================================
  const CH = "backrooms_lan_v1";
  function localBus() {
    let bc = null;
    try { bc = new BroadcastChannel(CH); } catch (e) { bc = null; }
    const rooms = new Map();          // code -> {…, seen}
    const members = new Map();        // code -> [ {token, nick, isHost, seen} ]
    const handlers = [];
    const post = (m) => { if (bc) { try { bc.postMessage(m); } catch (e) { /* 忽略 */ } } };
    // 用闭包变量存"我开的房"，不能在回调里用 this（箭头 / 普通函数里的 this 不一样）
    let mine = null;
    let isHost = false;

    function bump(code, tok, nick, host) {
      let arr = members.get(code) || [];
      const now = Date.now();
      arr = arr.filter((x) => now - x.seen < 60000);
      // 同一个"浏览器标签页"（token 尾缀是会话 id）只保留最新一条。
      // 否则 anon id 被别的标签页改写后，会留下两条都标着 is_host 的旧记录，
      // 客人就分不清谁是真正的房主了。
      const sess = String(tok).split("@")[1] || "";
      if (sess) arr = arr.filter((x) => (String(x.token).split("@")[1] || "") !== sess);
      const hit = arr.find((x) => x.token === tok);
      if (hit) { hit.seen = now; if (nick) hit.nick = nick; if (host) hit.isHost = true; }
      else arr.push({ token: tok, nick: nick || ("流浪者" + String(tok).slice(-3).toUpperCase()), isHost: !!host, seen: now });
      members.set(code, arr);
      return arr;
    }

    if (bc) {
      bc.onmessage = (e) => {
        const m = e.data || {};
        if (m.t === "announce") {
          rooms.set(m.room.code, Object.assign({}, m.room, { seen: Date.now(), n: m.n || 0 }));
        } else if (m.t === "who") {
          if (mine && mine.pub) post({ t: "announce", room: { code: mine.code, name: mine.name, pub: mine.pub, max: mine.max },
                                       n: (members.get(mine.code) || []).length });
        } else if (m.t === "gone") {
          rooms.delete(m.code); members.delete(m.code);
          if (mine && String(mine.code) === String(m.code)) { mine = null; isHost = false; }
          for (const h of handlers) { try { h({ from: "", payload: { t: "dissolve" } }); } catch (err) { /* 忽略 */ } }
        } else if (m.t === "join") {
          bump(m.code, m.tok, m.nick, m.isHost);
          // 不是房主的人来了 —— 房主把最新成员表广播回去，让新人也能看到别人
          if (mine && mine.code === m.code && !m.isHost) {
            post({ t: "mem", code: m.code, list: members.get(m.code) || [] });
          }
        } else if (m.t === "mem") {
          members.set(m.code, m.list || []);
        } else {
          for (const h of handlers) { try { h(m); } catch (err) { /* 忽略 */ } }
        }
      };
    }

    return {
      kind: "local",
      listRooms() {
        const now = Date.now();
        for (const [k, v] of rooms) if (now - v.seen > 20000) rooms.delete(k);
        post({ t: "who" });
        return new Promise((res) => {
          setTimeout(() => res([...rooms.values()].filter((r) => r.pub).map((r) =>
            Object.assign({}, r, { n: (members.get(r.code) || []).length }))), 400);
        });
      },
      createRoom(name, code, pub, max, nick) {
        // 房间号不能跟已经存在的撞 —— 撞了别人输入这个号会进错房间
        let c = String(code || "");
        if (!c) {
          do { c = String(Math.floor(1000 + Math.random() * 9000)); }
          while (rooms.has(c) && rooms.size < 9000);
        } else if (rooms.has(c)) {
          return Promise.reject(new Error("房间号 " + c + " 已经有人用了 —— 换一个"));
        }
        mine = { code: c, name: name || "未命名房间", pub: !!pub, max: max || 4 };
        isHost = true;
        rooms.set(c, Object.assign({}, mine, { seen: Date.now() }));
        bump(c, myToken(), nick, true);
        post({ t: "announce", room: { code: c, name: mine.name, pub: mine.pub, max: mine.max }, n: 1 });
        post({ t: "join", code: c, tok: myToken(), nick: nick, isHost: true });
        return Promise.resolve({ ok: true, code: c, max: mine.max });
      },
      joinRoom(code, nick) {
        const c = String(code);
        const r = rooms.get(c);
        mine = { code: c, name: (r && r.name) || ("房间 " + c), pub: r ? r.pub : true, max: (r && r.max) || 4 };
        isHost = false;
        post({ t: "join", code: c, tok: myToken(), nick: nick, isHost: false });
        bump(c, myToken(), nick, false);
        return Promise.resolve({ ok: true, code: c, name: mine.name, isHost: false, max: mine.max, pub: mine.pub });
      },
      touch(code) {
        const c = String(code || (mine && mine.code));
        if (mine) bump(mine.code, myToken(), myNick(), isHost);
        return Promise.resolve((members.get(c) || []).map((x) => ({ token: x.token, nick: x.nick, is_host: x.isHost })));
      },
      leaveRoom(code) {
        const c = String(code || (mine && mine.code));
        if (mine && mine.code === c) {
          const arr = (members.get(c) || []).filter((x) => x.token !== myToken());
          // 房主走 = 房间解散，所有人一起出来
          if (isHost || !arr.some((x) => x.isHost)) {
            post({ t: "gone", code: c });
            rooms.delete(c); members.delete(c);
          } else {
            members.set(c, arr); post({ t: "mem", code: c, list: arr });
          }
        }
        mine = null; isHost = false;
        return Promise.resolve({ ok: true });
      },
      send(code, to, payload) { post({ t: "msg", code: code, to: to, from: myToken(), payload: payload }); return Promise.resolve({ ok: true }); },
      onMessage(h) { handlers.push(h); },
      close() { if (bc) bc.close(); },
    };
  }

  // ============================================================
  // 云信令 + WebRTC 点对点
  // ============================================================
  const ICE = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

  function cloudBus() {
    let pollTimer = null;
    const handlers = [];
    return {
      kind: "cloud",
      // 以前失败时返回 [] —— 上层分不清"真的没有房间"和"云端压根没通"，
      // 于是本机上明明开着房也一个都看不到。现在把错误信息挂在数组上带回去。
      listRooms() {
        return rpc("br_room_list").then((r) => {
          if (!r || r.ok === false) {
            const out = [];
            out.__err = (r && r.msg) || "云端无响应";
            return out;
          }
          const arr = Array.isArray(r) ? r : (Array.isArray(r.data) ? r.data : (Array.isArray(r.rooms) ? r.rooms : []));
          return arr;
        });
      },
      createRoom(name, code, pub, max, nick) {
        return rpc("br_room_create", {
          p_token: myToken(), p_name: name, p_code: code || null,
          p_pub: !!pub, p_max: max || 4, p_nick: nick || myNick(),
        });
      },
      joinRoom(code, nick) {
        return rpc("br_room_join", { p_code: code, p_token: myToken(), p_nick: nick || myNick() });
      },
      leaveRoom(code) { return rpc("br_room_leave", { p_code: code, p_token: myToken() }); },
      touch(code) { return rpc("br_room_touch", { p_code: code, p_token: myToken() }); },
      send(code, to, payload) { return rpc("br_room_send", { p_code: code, p_from: myToken(), p_to: to || "", p_payload: payload }); },
      onMessage(h) {
        handlers.push(h);
        if (!pollTimer) {
          pollTimer = setInterval(() => {
            const c = Net.room && Net.room.code;
            if (!c) return;
            rpc("br_room_recv", { p_code: c, p_token: myToken() }).then((items) => {
              if (!Array.isArray(items)) return;
              for (const it of items) for (const hh of handlers) { try { hh({ from: it.from, payload: it.payload }); } catch (e) { /* 忽略 */ } }
            });
          }, 700);
        }
      },
      close() { clearInterval(pollTimer); pollTimer = null; },
    };
  }

  // ============================================================
  // Net：房间管理 + 点对点连接
  // ============================================================
  const Net = {
    room: null,          // { code, name, isHost, max, pub }
    peers: new Map(),    // token -> { pc, dc, name }
    self: null,          // { token, nick }
    onPeersChange: null,
    onMessage: null,
    onKicked: null,
    bus: null,
    highLevelOffer: null,   // { level, from, name }
  };

  // 昵称要在使用前重新取一次。
  // 以前只在 init 那一刻算好，之后登录也不会更新 —— 于是联机里显示的还是
  // 登录前那个"流浪者+随机号"。登录 / 登出 / 建房间 / 进房间 都会调一下。
  Net.refreshSelf = function () {
    Net.self = { token: myToken(), nick: myNick() };
    return Net.self;
  };

  // ============================================================
  // 网络联机：VibeHub SDK v3（WebRTC P2P + VibeNet 中继）
  //
  // 规范红线：一切后端能力走 SDK，实时对局状态只走 P2P，绝不写库、绝不轮询。
  // 所以这里一行 fetch 都没有 —— 房间发现用 vibe.rooms.list()（读房间层元数据，
  // 不是游戏状态），游戏数据全部 room.send / room.sendRealtime。
  //
  // 消息拆分（规范第三节"状态可丢、事件不可丢"）：
  //   important = true  → room.send()，可靠有序：聊天、踢人投票、切层、开局、拾取
  //   important = false → room.sendRealtime()，可丢：位置、朝向、实体快照
  // ============================================================
  // 房间号 → VibeHub roomId：加前缀避免和别的作品撞车
  const VIBE_PREFIX = "br-";
  const vibeRoomId = (code) => VIBE_PREFIX + String(code);
  const vibeCodeOf = (rid) => String(rid || "").replace(/^br-/, "");

  function vibeBus(sdkVibe) {
    let vibe = sdkVibe || null;
    let room = null;          // SDK room 对象
    let myId = "";            // room.peerId
    let meta = null;          // { code, name, pub, max }
    const handlers = [];
    let members = [];         // [{ token, nick, is_host }] —— 纯 P2P 同步，不写库
    const nicks = new Map();  // peerId -> nick
    let hostId = "";
    let lastAnnounce = 0;

    const emit = (m) => { for (const h of handlers) { try { h(m); } catch (e) { /* 忽略 */ } } };

    // 把 SDK 的(msg, fromId)还原成上层习惯的 {from, code, payload}
    function onSdkMessage(msg, fromId) {
      if (!msg || msg.__br !== 1) return;
      if (msg.to && msg.to !== myId) return;              // 定向消息，不是给我的
      const p = msg.payload || {};
      if (p.t === "hello") {
        nicks.set(fromId, p.nick || "流浪者");
        refreshMembers();
        if (room && room.isHost) pushMem();               // 房主立刻把新成员广播出去
        return;
      }
      if (p.t === "mem") {                                 // 房主广播的成员表
        members = Array.isArray(p.list) ? p.list : [];
        nicks.clear();
        for (const m of members) if (m && m.token) nicks.set(m.token, m.nick);
        if (p.host) hostId = p.host;
        return;
      }
      if (p.t === "newhost" && p.tok) hostId = p.tok;
      emit({ from: fromId, code: meta ? meta.code : "", payload: p });
    }

    function refreshMembers() {
      const list = [];
      if (room && myId) {
        list.push({ token: myId, nick: Net.self ? Net.self.nick : "流浪者", is_host: !!room.isHost });
        if (room.isHost) hostId = myId;
      }
      for (const [id, nk] of nicks) {
        if (id === myId) continue;
        list.push({ token: id, nick: nk, is_host: id === hostId });
      }
      // 再补上 SDK 里已知、但还没发过 hello 的人
      try {
        for (const p of room ? (room.peers() || []) : []) {
          if (!p || !p.id || p.id === myId) continue;
          if (!list.some((x) => x.token === p.id)) list.push({ token: p.id, nick: "流浪者", is_host: p.id === hostId });
        }
      } catch (e) { /* 忽略 */ }
      members = list;
    }

    function pushMem() {
      if (!room || !room.isHost) return;
      refreshMembers();
      room.send({ __br: 1, to: "", payload: { t: "mem", list: members, host: hostId } });
    }

    const api = {
      kind: "vibe",

      // 房间发现：读的是房间层元数据（不是游戏状态），SDK 允许
      listRooms() {
        if (!vibe) return Promise.resolve([]);
        return vibe.rooms.list().then((arr) => {
          if (!Array.isArray(arr)) return [];
          return arr.map((r) => ({
            code: vibeCodeOf(r.roomId || r.id),
            name: r.name || ("房间 " + vibeCodeOf(r.roomId || r.id)),
            pub: r.listed !== false && r.open !== false,
            max: r.max || 4,
            n: r.players || 1,
          })).filter((r) => r && r.code);
        }).catch(() => []);
      },

      createRoom(name, code, pub, max, nick) {
        if (!vibe) return Promise.reject(new Error("VibeHub 未初始化"));
        const rid = vibeRoomId(code);
        return vibe.room.join(rid, { topology: "host" }).then((r) => {
          room = r;
          myId = r.peerId || "";
          _vibeId = myId;
          // 身份换成 SDK 的 peerId 之后要立刻重刷 self ——
          // 否则 Net.self.token 还是进房前那个匿名 id，跟成员表里的 peerId 对不上，
          // 自己会被当成"另一个人"列一遍（还会给自己一个"踢出"按钮）。
          if (Net.refreshSelf) Net.refreshSelf();
          meta = { code: String(code), name: name || "未命名房间", pub: !!pub, max: max || 4 };
          r.onMessage(onSdkMessage);
          r.onPeer((ev) => {
            if (!ev) return;
            if (ev.type === "leave") { nicks.delete(ev.id); refreshMembers(); if (room && room.isHost) pushMem(); }
            else if (ev.type === "join") { refreshMembers(); if (room && room.isHost) pushMem(); }
          });
          // 挂到房间列表上，别人才能刷到；私人房间不 listed
          r.announce({ open: true, listed: !!pub, max: max || 4, name: name || "未命名房间", code: String(code) });
          lastAnnounce = Date.now();
          refreshMembers();
          // 报个到，让房主（和其它人）知道我叫什么
          r.send({ __br: 1, to: "", payload: { t: "hello", nick: nick || "流浪者" } });
          return { ok: true, code: String(code), max: max || 4 };
        });
      },

      joinRoom(code, nick) {
        if (!vibe) return Promise.reject(new Error("VibeHub 未初始化"));
        const rid = vibeRoomId(code);
        return vibe.room.join(rid, { topology: "host" }).then((r) => {
          room = r;
          myId = r.peerId || "";
          _vibeId = myId;
          if (Net.refreshSelf) Net.refreshSelf();   // 同上：身份换成 peerId
          r.onMessage(onSdkMessage);
          r.onPeer((ev) => {
            if (!ev) return;
            if (ev.type === "leave") { nicks.delete(ev.id); refreshMembers(); }
          });
          // 从列表元数据里尽量把房间名/人数读出来
          return vibe.rooms.get(rid).catch(() => null).then((m) => {
            meta = { code: String(code), name: (m && m.name) || ("房间 " + code), pub: true, max: (m && m.max) || 4 };
            refreshMembers();
            r.send({ __br: 1, to: "", payload: { t: "hello", nick: nick || "流浪者" } });
            return { ok: true, code: String(code), name: meta.name, isHost: !!r.isHost, max: meta.max, pub: true };
          });
        });
      },

      leaveRoom() {
        try { if (room) room.leave(); } catch (e) { /* 忽略 */ }
        room = null; myId = ""; _vibeId = ""; meta = null; members = []; nicks.clear(); hostId = "";
        return Promise.resolve({ ok: true });
      },

      // 心跳：本地维护成员表（房主广播一次），顺带给房间列表续期
      touch() {
        if (!room) return Promise.resolve([]);
        refreshMembers();
        if (room.isHost) pushMem();
        // announce 续期：25s 一次，别每 3 秒刷一次
        if (room.isHost && meta && meta.pub && Date.now() - lastAnnounce > 25000) {
          try {
            room.announce({ open: true, listed: true, max: meta.max, name: meta.name, code: meta.code,
              players: members.length });
          } catch (e) { /* 忽略 */ }
          lastAnnounce = Date.now();
        }
        // 延迟：取 SDK 报的各条连接延迟的平均
        try {
          const ps = room.peers() || [];
          let sum = 0, n = 0;
          for (const p of ps) { if (p && typeof p.latency === "number" && p.latency >= 0) { sum += p.latency; n++; } }
          if (n) Net.ping = Net.ping ? Math.round(Net.ping * 0.6 + (sum / n) * 0.4) : Math.round(sum / n);
        } catch (e) { /* 忽略 */ }
        return Promise.resolve(members.map((m) => ({ token: m.token, nick: m.nick, is_host: !!m.is_host })));
      },

      send(code, to, payload, important) {
        if (!room) return Promise.resolve({ ok: false });
        const env = { __br: 1, to: to || "", payload: payload };
        try {
          if (to) room.send(env, to);                       // 定向：始终可靠
          else if (important) room.send(env);               // 事件：可靠有序
          else room.sendRealtime(env);                      // 位置/快照：可丢
        } catch (e) { /* 忽略 */ }
        return Promise.resolve({ ok: true });
      },

      onMessage(h) { handlers.push(h); },
      close() { try { if (room) room.leave(); } catch (e) { /* 忽略 */ } room = null; },
    };
    // 这三个都要带 token 打 /api/sdk/* —— 401 时先补一次登录再重试，
    // 否则界面上永远只有一句看不懂的「未授权」。
    api.listRooms = vibeWithAuth(api.listRooms);
    api.createRoom = vibeWithAuth(api.createRoom);
    api.joinRoom = vibeWithAuth(api.joinRoom);
    return api;
  }

  // VibeHub 初始化：SDK 必须在页面里用【绝对地址】引入（游戏跑在 vibeapps 域，
  // 相对路径会 404）。返回 Promise<true> 或抛出可读的错误。
  //
  // 【联机要先登录】SDK 的 /api/sdk/* 全部带 Authorization: Bearer <token>，
  // 没 token 就是 401「未授权」。而 SDK.init() 只是"尽力"从平台播放器恢复登录态
  // （_restoreAuth 失败是静默的，注释里写着 guests can always start playing），
  // 所以 init 成功后完全可能仍然是没登录 —— 这时必须主动 vibe.login() 弹窗授权。
  // 以前这里从不登录，于是点联机必然撞 401，界面上只剩一句"未授权"。
  Net.initVibe = function (opts) {
    const wantLogin = !opts || opts.login !== false;
    if (Net._vibeBus) return wantLogin ? Net.vibeEnsureAuth().then(() => true) : Promise.resolve(true);
    const SDK = window.VibeHub;
    if (!SDK) return Promise.reject(new Error(
      "VibeHub SDK 没加载上 —— 检查 index.html 里有没有引 https://gamesvibe.app/sdk/v3/vibehub.js"));
    const work = (window.BACKROOMS_WORK || "").trim();
    if (!work) return Promise.reject(new Error(
      "还没填项目 slug —— 在 js/config.js 里把 DEFAULT_WORK 改成你的项目 slug" +
      "（从创作者中心「我的项目」或 vibehub list 复制，不是 /works/ 后面的作品 ID）"));
    return SDK.init({ work: work }).then((v) => {
      Net._vibe = v;
      Net._vibeBus = vibeBus(v);
      Net.bus = Net._vibeBus;
      Net.bus.onMessage((m) => Net._sig(m));
      try { v.onAuthChange((u) => { Net._vibeUser = u || null; }); } catch (e) { /* 忽略 */ }
      Net._vibeUser = v.user || null;
      return wantLogin ? Net.vibeEnsureAuth().then(() => true) : true;
    });
  };
  Net.isVibe = function () { return !!(Net.bus && Net.bus.kind === "vibe"); };

  // ---- VibeHub 登录态 ----
  Net.vibeWork = function () { return (window.BACKROOMS_WORK || "").trim(); };
  Net.vibeUser = function () {
    const v = Net._vibe;
    if (!v) return Net._vibeUser || null;
    return v.user || Net._vibeUser || null;
  };
  Net.vibeLoggedIn = function () {
    const v = Net._vibe;
    if (!v) return false;
    try { if (typeof v.isLoggedIn === "function" && v.isLoggedIn()) return true; } catch (e) { /* 忽略 */ }
    return !!(v.user || v.token);
  };
  // 把登录失败翻译成人话 —— 服务器那句"未授权"太含糊，看不出该干什么
  function vibeAuthHint(e) {
    const m = String((e && e.message) || e || "");
    const work = Net.vibeWork();
    let s = m;
    if (/弹窗|popup/i.test(m)) s = "登录弹窗被浏览器拦了 —— 允许本页弹窗后，再点一次「登录 / 重新授权」。";
    else if (/取消/.test(m)) s = "登录窗口被关掉了 —— 再点一次「登录 / 重新授权」并走完授权。";
    else if (/超时/.test(m)) s = "登录超时了 —— 再点一次「登录 / 重新授权」。";
    else if (!m || /未授权|unauthor|401/i.test(m)) s = "VibeHub 没认下这个登录态（" + (m || "401") + "）—— 点「登录 / 重新授权」登录一次。";
    if (work) s += "\n另外核对一下项目 slug 对不对：当前用的是「" + work + "」（要项目 slug，不是 /works/ 或 /play/ 后面那串作品 ID）。";
    return s;
  }
  // 已经登录就直接过；没登录才弹窗。force=true 表示哪怕已登录也要重新授权。
  Net.vibeLogin = function (force) {
    const v = Net._vibe;
    if (!v) return Promise.reject(new Error("VibeHub 还没初始化"));
    if (!force && Net.vibeLoggedIn()) return Promise.resolve(Net.vibeUser());
    if (typeof v.login !== "function") return Promise.reject(new Error("这个 SDK 没有 login() —— 检查 SDK 版本"));
    if (Net._vibeLoginP) return Net._vibeLoginP;
    // login() 内部会 window.open —— 必须尽早发起，别把用户手势耗光
    Net._vibeLoginP = Promise.resolve().then(() => v.login()).then((u) => {
      Net._vibeUser = u || v.user || null;
      Net._vibeLoginP = null;
      Net._vibeLoginErr = null;
      return Net._vibeUser;
    }).catch((e) => {
      Net._vibeLoginP = null;
      Net._vibeLoginErr = e;
      throw new Error(vibeAuthHint(e));
    });
    return Net._vibeLoginP;
  };
  Net.vibeEnsureAuth = function () { return Net.vibeLogin(false).then(() => true); };

  // ---- VibeHub 授权页地址（"登录跳转"用） ----
  // SDK 的 login() 是弹窗；弹窗被拦时，玩家至少要能看到该去哪儿授权，
  // 所以这里把授权页地址算出来，界面上直接给一个能点的跳转。
  Net.vibeApiBase = function () {
    const v = Net._vibe;
    if (v && typeof v.apiBase === "string" && v.apiBase) return v.apiBase.replace(/\/+$/, "");
    const h = "";
    try { if (location.hostname === "apps.gamesvibe.app" || location.hostname === "gamesvibe.app") return "https://gamesvibe.app"; } catch (e) { /* 忽略 */ }
    return "https://gamesvibe.app";
  };
  Net.vibeAuthUrl = function () {
    const work = Net.vibeWork();
    let u = Net.vibeApiBase() + "/connect";
    if (work) u += "?work=" + encodeURIComponent(work);
    return u;
  };
  // 打开授权页。优先走 SDK 的 login()（它带 intent / PKCE，回来能自动接上 token）；
  // SDK 还没初始化或没有 login() 时，退化成直接开授权页。
  // 返回 { via: "sdk"|"url", win } —— via=url 表示只是跳过去了，回来要玩家自己再点一次。
  Net.vibeLoginJump = function (force) {
    if (Net._vibe && typeof Net._vibe.login === "function") {
      return Net.vibeLogin(force !== false).then((u) => ({ via: "sdk", user: u || null }));
    }
    const url = Net.vibeAuthUrl();
    let win = null;
    try { win = window.open(url, "vibehub_login", "width=520,height=640"); } catch (e) { /* 忽略 */ }
    if (!win) return Promise.reject(new Error("登录弹窗被浏览器拦了 —— 允许本页弹窗后，再到 VibeHub 授权页登录：" + url));
    return Promise.resolve({ via: "url", url: url });
  };

  // 401 / AUTH_EXPIRED：先自动补一次登录再重试（弹窗若被拦，会把人话抛给上层）
  function isVibeAuthErr(e) {
    if (!e) return false;
    if (e.status === 401 || e.code === "AUTH_EXPIRED") return true;
    return /未授权|unauthor|授权已过期|请由玩家重新登录/i.test(String(e.message || ""));
  }
  function vibeWithAuth(fn) {
    return function () {
      const args = arguments;
      return fn.apply(null, args).catch((e) => {
        if (!isVibeAuthErr(e) || !Net._vibe) throw e;
        if (Net._authRetried) throw new Error(vibeAuthHint(e));
        Net._authRetried = true;
        return Net.vibeLogin(false).then(() => fn.apply(null, args)).catch((e2) => {
          throw new Error(vibeAuthHint(e2 && e2.message ? e2 : e));
        }).finally(() => { Net._authRetried = false; });
      });
    };
  }

  // ============================================================
  // 跨设备局域网：手动配对码（WebRTC 直连，不经过任何服务器）
  //
  // 浏览器扫不到局域网里的其它设备，BroadcastChannel 也跨不了机器。所以这里用
  // 最土但最可靠的办法：房主生成一段「邀请码」（里面是 WebRTC 的 offer），用微信
  // /QQ 发给对方；对方粘进来，程序生成一段「回执码」（answer）发回来；房主粘回去，
  // 数据通道就通了。之后所有游戏消息都走这条点对点通道，不经过任何服务器 ——
  // 既不写库也不轮询，完全离线可用。
  // 拓扑仍是星型：房主是中心，负责把客人的广播转给其它客人。
  // ============================================================
  // 预先开几个收集槽：候选在 setLocalDescription 之前就开始攒，配对码里的候选更全
  const PAIR_ICE = {
    iceCandidatePoolSize: 4,
    iceServers: [
      { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] },
      { urls: "stun:stun.cloudflare.com:3478" },
      { urls: "stun:stun.miwifi.com:3478" },
      { urls: "stun:stun.qq.com:3478" },
    ],
  };

  function b64uFromBytes(u8) {
    let s = "";
    for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
    return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function bytesFromB64u(str) {
    let s = String(str || "").replace(/[-+]/g, (c) => (c === "-" ? "+" : c)).replace(/_/g, "/").replace(/\s+/g, "");
    s = s.replace(/\+/g, "+");
    while (s.length % 4) s += "=";
    const bin = atob(s);
    const u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    return u8;
  }
  // 一段 SDP 原文有几 KB，直接粘很难看 —— 压一道再编码，通常能缩到 1/4。
  async function packCode(obj) {
    const json = JSON.stringify(obj);
    try {
      if (typeof CompressionStream === "function") {
        const cs = new CompressionStream("gzip");
        const blob = await new Response(new Blob([json]).stream().pipeThrough(cs)).blob();
        const u8 = new Uint8Array(await blob.arrayBuffer());
        if (u8.length < json.length) return "BRP1Z." + b64uFromBytes(u8);
      }
    } catch (e) { /* 不支持就退成明文 */ }
    return "BRP1R." + b64uFromBytes(new TextEncoder().encode(json));
  }
  async function unpackCode(text) {
    const s = String(text || "").trim().replace(/\s+/g, "");
    const m = s.match(/^BRP1([ZR])\.(.+)$/);
    if (!m) throw new Error("这串码不是本游戏的配对码 —— 确认复制完整了（以 BRP1 开头）");
    const u8 = bytesFromB64u(m[2]);
    if (m[1] === "R") return JSON.parse(new TextDecoder().decode(u8));
    const ds = new DecompressionStream("gzip");
    const blob = await new Response(new Blob([u8]).stream().pipeThrough(ds)).blob();
    return JSON.parse(await blob.text());
  }
  // 等 ICE 收集完：候选要一起打包进那串码里，不然对方连不上。
  // 顺带统计收集到了哪些候选 —— 跨设备连不上时，全靠这些数字判断卡在哪一步。
  function waitIce(pc, ms, minHost) {
    const stat = { host: 0, hostReal: 0, srflx: 0, relay: 0, prflx: 0, mdns: 0, total: 0, complete: false, addrs: [] };
    return new Promise((res) => {
      let done = false;
      let t = null;
      const fin = () => { if (done) return; done = true; clearTimeout(t); stat.complete = pc ? pc.iceGatheringState === "complete" : false; res(stat); };
      const arm = (d) => { clearTimeout(t); t = setTimeout(fin, d); };
      // 局域网直连只需要本地候选；公网候选要等 STUN 往返，STUN 不通时会白等好几秒。
      // 所以拿到够用的本地候选后就再宽限一小会儿 —— 通常一两秒就走完，不用干等超时。
      const need = (minHost == null ? 1 : minHost);
      arm(ms || 8000);
      if (!pc) return fin();
      pc.addEventListener("icecandidate", (e) => {
        if (!e.candidate) return fin();
        stat.total++;
        const c = e.candidate;
        const ty = String((c.type || "").toLowerCase());
        if (ty === "host") { stat.host++; if (!/\.local$/i.test(String(c.address || ""))) stat.hostReal++; }
        else if (ty === "srflx") stat.srflx++;
        else if (ty === "relay") stat.relay++;
        else if (ty === "prflx") stat.prflx++;
        const addr = String(c.address || "");
        if (/\.local$/i.test(addr)) stat.mdns++;
        if (addr && stat.addrs.length < 6 && !/\.local$/i.test(addr)) stat.addrs.push(ty + ":" + addr);
        if (stat.host >= need && !stat._early) {
          stat._early = true;
          // Chrome 会把本机 IP 伪装成 .local，那种 host 候选对方根本解析不了 ——
          // 所以只有拿到「真能用的本机地址」才提前收工；否则多等几秒把候选攒全，
          // 不然候选没收集完就握手，反而连不上。
          arm(stat.hostReal ? 1500 : 6000);
        }
      });
      if (pc.iceGatheringState === "complete") return fin();
    });
  }

  // Chrome 会把本机的局域网 IP 伪装成一个 xxx.local 的名字（mDNS），
  // 同一台机器上没问题，但另一台设备解析不了这个名字 —— 这就是跨设备连不上的头号原因。
  // 只要知道对方的真实局域网 IP，把 SDP 里那些 .local 换掉就能直连。
  // 配对码里会带上对方的真实 IP —— 所以「我哪知道对方 IP」这件事不该由玩家操心。
  // 从候选地址里挑一个最适合直连的：本机/host 优先，其次 STUN 拿到的公网地址。
  function pickLanIp(arr) {
    if (!Array.isArray(arr)) return "";
    const host = [], other = [];
    for (const raw of arr) {
      const m = String(raw || "").match(/^([a-z]+):(.+)$/i);
      const ty = m ? m[1].toLowerCase() : "";
      const ip = m ? m[2] : String(raw || "");
      if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) continue;
      // 只认 host（本机地址）。公网/srflx 交给 ICE 自己去试 —— 拿它去替换 .local
      // 反而会把候选改坏（同一个 WiFi 下两台设备的公网 IP 是一样的）。
      if (ty === "host") host.push(ip);
    }
    return host[0] || "";
  }

  function patchSdpMdns(desc, ip) {
    ip = String(ip || "").trim();
    if (!ip || !desc) return { sdp: desc, n: 0 };
    if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) return { sdp: desc, n: 0 };
    const RE = /([0-9a-zA-Z][0-9a-zA-Z._-]*)\.local\b/g;
    // 配对码里带的是 { type, sdp } 对象（不是裸字符串）—— 只能改里面的 sdp 字段
    if (typeof desc === "string") {
      let n = 0;
      return { sdp: desc.replace(RE, () => { n++; return ip; }), n: n };
    }
    if (typeof desc === "object" && typeof desc.sdp === "string") {
      let n = 0;
      const s2 = desc.sdp.replace(RE, () => { n++; return ip; });
      const out = {};
      for (const k in desc) out[k] = desc[k];
      out.sdp = s2;
      return { sdp: out, n: n };
    }
    return { sdp: desc, n: 0 };
  }

  // 把收集结果和 ICE 状态翻译成一句人话
  function iceDiag(stat, st) {
    const bits = [];
    bits.push("本机候选 " + (stat ? stat.total : 0) + " 个");
    if (stat) {
      const t = [];
      if (stat.host) t.push("本地 " + stat.host);
      if (stat.srflx) t.push("公网 " + stat.srflx);
      if (stat.relay) t.push("中继 " + stat.relay);
      if (t.length) bits.push("（" + t.join(" / ") + "）");
      if (stat.mdns && !stat.srflx) bits.push("，其中 " + stat.mdns + " 个是 .local 伪装地址");
    }
    if (st) bits.push("；ICE 状态：" + st);
    return bits.join("");
  }
  function waitOpen(rec, ms) {
    return new Promise((res) => {
      const t0 = Date.now();
      const tick = setInterval(() => {
        if (rec && rec.dc && rec.dc.readyState === "open") { clearInterval(tick); res(true); }
        else if (Date.now() - t0 > (ms || 10000)) { clearInterval(tick); res(false); }
      }, 200);
    });
  }

  function pairBus() {
    const handlers = [];
    const emit = (m) => { for (const h of handlers) { try { h(m); } catch (e) { /* 忽略 */ } } };
    const notify = () => { try { if (Net.onPeersChange) Net.onPeersChange(); } catch (e) { /* 忽略 */ } };
    let meta = null;                  // { code, name, pub, max }
    let hostTok = "";                 // 客人这边记住房主的 token
    let hostNick = "房主";
    const conns = new Map();          // token -> { token, pc, dc, open, nick, isHost }
    const pending = new Map();        // id   -> 还没回填的邀请
    let memList = [];                 // 客人这边：房主同步下来的完整成员表
    let seq = 0;

    // 房主把成员表发给所有客人 —— 不然客人只能看见房主，看不见别的队友
    function pushMem() {
      if (!Net.room || !Net.room.isHost) return;
      const list = members();
      for (const [, c] of conns) {
        sendEnv(c, { from: myToken(), to: "", sys: "mem", list: list });
      }
    }

    function sendEnv(c, env) {
      if (!c || !c.dc || c.dc.readyState !== "open") return false;
      try {
        // sys / list 要一并带上 —— 只打包固定几个字段的话，
        // 房主同步下来的成员表会在打包这一步被丢掉，客人就永远看不见别的队友
        c.dc.send(JSON.stringify({
          __p: 1, from: env.from || "", to: env.to || "",
          relay: env.relay ? 1 : 0, payload: env.payload,
          sys: env.sys, list: env.list,
        }));
        return true;
      } catch (e) { return false; }
    }

    function wire(c) {
      const dc = c.dc;
      if (!dc) return;
      dc.onopen = () => {
        c.open = true;
        // 报个到，让对面知道我叫什么
        sendEnv(c, { from: myToken(), to: "", payload: { t: "hello", nick: (Net.self && Net.self.nick) || "流浪者" } });
        notify();
        pushMem();
      };
      dc.onclose = () => {
        c.open = false;
        if (Net.room && Net.room.isHost && c.token) conns.delete(c.token);
        notify();
        pushMem();
      };
      dc.onmessage = (e) => {
        let d = null;
        try { d = JSON.parse(e.data); } catch (err) { return; }
        if (!d || d.__p !== 1) return;
        const from = d.from || c.token || "";
        // 系统包：房主同步下来的成员表（不下发给上层，别被当成游戏消息）
        if (d.sys === "mem") {
          if (!Net.room || !Net.room.isHost) { memList = Array.isArray(d.list) ? d.list : []; notify(); }
          return;
        }
        if (d.payload && d.payload.t === "hello") {
          c.nick = d.payload.nick || "队友";
          notify();
          pushMem();
          return;
        }
        // 指名道姓但不是给我的 —— 星型拓扑下由房主中转
        if (d.to && Net.self && String(d.to) !== String(Net.self.token)) {
          const t = conns.get(String(d.to));
          if (t) sendEnv(t, { from: from, to: d.to, relay: 1, payload: d.payload });
          return;
        }
        emit({ from: from, code: meta ? meta.code : "", payload: d.payload });
        // 广播：房主转给其它客人（relay=1 防止无限转发）
        if (!d.to && !d.relay && Net.room && Net.room.isHost) {
          for (const [, o] of conns) {
            if (!o || String(o.token) === String(from)) continue;
            sendEnv(o, { from: from, to: "", relay: 1, payload: d.payload });
          }
        }
      };
    }

    function members() {
      const out = [];
      const me = { token: myToken(), nick: (Net.self && Net.self.nick) || "流浪者", is_host: true };
      if (Net.room && Net.room.isHost) {
        out.push(me);
        for (const [, c] of conns) out.push({ token: c.token, nick: c.nick || "队友", is_host: false });
      } else if (memList.length) {
        // 客人：用房主同步下来的完整名单，这样才看得见别的队友
        for (const m of memList) {
          if (!m || !m.token) continue;
          out.push({ token: m.token, nick: m.nick || "流浪者", is_host: !!m.is_host });
        }
        if (!out.some((x) => x.token === me.token)) out.push({ token: me.token, nick: me.nick, is_host: false });
      } else {
        out.push({ token: hostTok || "host", nick: hostNick, is_host: true });
        out.push({ token: me.token, nick: me.nick, is_host: false });
      }
      return out;
    }

    return {
      kind: "pair",

      listRooms() { return Promise.resolve([]); },

      createRoom(name, code, pub, max, nick) {
        meta = { code: String(code), name: name || "未命名房间", pub: true, max: max || 4 };
        return Promise.resolve({ ok: true, code: String(code), max: meta.max });
      },

      joinRoom(code, nick) {
        const c = String(code);
        if (!meta || String(meta.code) !== c) meta = { code: c, name: "房间 " + c, pub: true, max: 4 };
        return Promise.resolve({ ok: true, code: c, name: meta.name, isHost: false, max: meta.max, pub: true });
      },

      // 房主：生成一段邀请码
      async makeInvite() {
        if (!meta) throw new Error("先创建房间，再生成邀请码");
        let pc = null;
        try { pc = new RTCPeerConnection(PAIR_ICE); } catch (e) {
          throw new Error("这个浏览器不支持 WebRTC —— 换 Chrome / Edge / Safari 试试");
        }
        const id = "p" + (++seq) + Math.random().toString(36).slice(2, 6);
        const rec = { token: "", pc: pc, dc: null, open: false, nick: "队友", id: id, ice: null };
        pc.ondatachannel = (e) => { rec.dc = e.channel; wire(rec); };
        try { rec.dc = pc.createDataChannel("br"); wire(rec); }
        catch (e) { throw new Error("创建数据通道失败"); }
        pc.oniceconnectionstatechange = () => { rec.iceState = pc.iceConnectionState; };
        await pc.setLocalDescription(await pc.createOffer());
        const st = await waitIce(pc, 8000, 1);
        rec.ice = st;
        rec.hasSrflx = st.srflx > 0;
        if (!pc.localDescription) throw new Error("生成邀请码失败 —— 刷新页面重试");
        if (!st.total) {
          throw new Error("这台设备一个网络候选都没收集到 —— 检查是不是开了 VPN / 代理，或者浏览器禁用了 WebRTC。");
        }
        pending.set(id, rec);
        return packCode({
          v: 1, r: "inv", id: id, code: meta.code, name: meta.name, max: meta.max,
          host: myToken(), hn: (Net.self && Net.self.nick) || "房主", s: pc.localDescription,
          ips: (myIpCache ? ["host:" + myIpCache] : []).concat(st.addrs || []),
        });
      },

      // 客人：粘进邀请码，产出一段回执码
      async acceptInvite(text, hostIp) {
        const d = await unpackCode(text);
        if (!d || d.r !== "inv" || !d.s) throw new Error("这不是邀请码 —— 确认粘的是房主发给你的那一段");
        hostTok = String(d.host || "");
        hostNick = d.hn || "房主";
        meta = { code: String(d.code || ""), name: d.name || ("房间 " + d.code), pub: true, max: d.max || 4 };
        let pc = null;
        try { pc = new RTCPeerConnection(PAIR_ICE); } catch (e) {
          throw new Error("这个浏览器不支持 WebRTC —— 换 Chrome / Edge / Safari 试试");
        }
        const rec = { token: hostTok, pc: pc, dc: null, open: false, nick: hostNick, isHost: true, ice: null };
        conns.set(hostTok, rec);
        pc.ondatachannel = (e) => { rec.dc = e.channel; wire(rec); };
        pc.oniceconnectionstatechange = () => { rec.iceState = pc.iceConnectionState; };
        // 房主那边可能是 Chrome，SDP 里全是 .local 伪装地址 —— 优先用邀请码里自带的
        // 真实 IP，没有再用手填的那个（玩家根本不该去查 IP）
        const useIp = String(hostIp || "").trim() || pickLanIp(d.ips);
        rec.usedIp = useIp;
        try { if (Net.bus) Net.bus.lastUsedIp = useIp; } catch (e) { /* 忽略 */ }
        const pt = patchSdpMdns(d.s, useIp);
        rec.patched = pt.n;
        await pc.setRemoteDescription(pt.sdp);
        await pc.setLocalDescription(await pc.createAnswer());
        const st = await waitIce(pc, 8000, 1);
        rec.ice = st;
        return packCode({
          v: 1, r: "rep", id: d.id, code: meta.code,
          tok: myToken(), nick: (Net.self && Net.self.nick) || "流浪者", s: pc.localDescription,
          ips: (myIpCache ? ["host:" + myIpCache] : []).concat(st.addrs || []),
        });
      },

      // 房主：粘回回执码，接通
      async acceptReply(text, guestIp) {
        const d = await unpackCode(text);
        if (!d || d.r !== "rep" || !d.s) throw new Error("这不是回执码 —— 应该是队友发回来、以 BRP1 开头的那一段");
        const id = String(d.id || "");
        const rec = pending.get(id) || [...pending.values()][0];
        if (!rec || !rec.pc) throw new Error("没有等待中的邀请 —— 先点「生成邀请码」");
        rec.token = String(d.tok || ("g" + Math.random().toString(36).slice(2, 8)));
        rec.nick = d.nick || "队友";
        conns.set(rec.token, rec);
        pending.delete(id);
        // 队友那边可能是 Chrome，SDP 里全是 .local 伪装地址 —— 优先用回执码里自带的
        // 真实 IP，没有再用手填的那个
        const useIp = String(guestIp || "").trim() || pickLanIp(d.ips);
        rec.usedIp = useIp;
        try { if (Net.bus) Net.bus.lastUsedIp = useIp; } catch (e) { /* 忽略 */ }
        const pt = patchSdpMdns(d.s, useIp);
        rec.patched = pt.n;
        await rec.pc.setRemoteDescription(pt.sdp);
        const ok = await waitOpen(rec, 20000);
        if (!ok) {
          conns.delete(rec.token);
          const st = rec.ice || null;
          const iceSt = rec.pc ? rec.pc.iceConnectionState : "";
          let msg = "握手完成但数据通道没打开。";
          msg += "\n" + iceDiag(st, iceSt);
          if (st && st.mdns > 0 && !st.srflx) {
            msg += "\n\n这台设备的地址被浏览器伪装成了 .local，对方解析不了 —— 在下面的「对方局域网 IP」里填上对方的 IP 再试一次；";
            msg += "\n或者换 Firefox / Safari（它们不伪装地址）。";
          } else {
            msg += "\n两台设备要在同一个 WiFi 下；路由器开了「AP 隔离」也会连不上。";
          }
          msg += "\n实在不行就改用「网络联机」（VibeHub），那个走中继，不依赖局域网。";
          throw new Error(msg);
        }
        notify();
        return { ok: true, nick: rec.nick, token: rec.token, usedIp: rec.usedIp || "", patched: rec.patched || 0 };
      },

      isOpen() {
        if (Net.room && Net.room.isHost) { let n = 0; for (const [, c] of conns) if (c.open) n++; return n > 0; }
        for (const [, c] of conns) if (c.open) return true;
        return false;
      },
      connCount() { let n = 0; for (const [, c] of conns) if (c.open) n++; return n; },
      // 客人侧看不到房主的报错，只能自己盯着 ICE 状态 —— 免得干等三分钟
      iceState() {
        let s = "";
        for (const [, c] of conns) {
          if (c.iceState === "failed") return "failed";
          if (c.iceState === "disconnected") s = "disconnected";
          else if (!s && c.iceState) s = c.iceState;
        }
        return s;
      },
      iceDiag() {
        let st = null;
        for (const [, c] of conns) if (c.ice) { st = c.ice; break; }
        return iceDiag(st, this.iceState());
      },
      metaOf() { return meta; },

      touch() { return Promise.resolve(members()); },

      leaveRoom() {
        for (const [, c] of conns) { try { c.dc && c.dc.close(); } catch (e) {} try { c.pc && c.pc.close(); } catch (e) {} }
        for (const [, c] of pending) { try { c.dc && c.dc.close(); } catch (e) {} try { c.pc && c.pc.close(); } catch (e) {} }
        conns.clear(); pending.clear(); memList = []; hostTok = "";
        return Promise.resolve({ ok: true });
      },

      send(code, to, payload) {
        const env = { from: myToken(), to: to || "", relay: 0, payload: payload };
        if (to) {
          const c = conns.get(String(to));
          if (c) { sendEnv(c, env); return Promise.resolve({ ok: true }); }
          // 客人只连着房主 —— 指名道姓的也先发给房主，由它中转
          if (!Net.room || !Net.room.isHost) {
            for (const [, c2] of conns) sendEnv(c2, env);
          }
          return Promise.resolve({ ok: false });
        }
        for (const [, c] of conns) sendEnv(c, env);
        return Promise.resolve({ ok: true });
      },

      onMessage(h) { handlers.push(h); },
      close() { this.leaveRoom(); },
    };
  }

  // ------------------------------------------------------------
  // 本机局域网 IP
  //
  // 玩家根本不该去命令行查 IP —— 所以这里让程序自己报出来。
  // Chrome 默认把本机 IP 伪装成 xxx.local（mDNS），收集候选时拿不到真地址；
  // 但只要给过一次麦克风权限，它就会把真实 IP 交出来。所以「查一下」会
  // 申请一次权限（拿到就立刻释放，不录音、不上传），只为读出这个地址。
  // Firefox / Safari 不伪装，直接就能拿到，不用授权。
  // ------------------------------------------------------------
  let myIpCache = "";
  async function collectHostIp() {
    let pc = null;
    try {
      pc = new RTCPeerConnection(PAIR_ICE);
      pc.createDataChannel("probe");
      await pc.setLocalDescription(await pc.createOffer());
      const st = await waitIce(pc, 5000, 1);
      return pickLanIp(st.addrs);
    } catch (e) { return ""; }
    finally { try { if (pc) pc.close(); } catch (e) { /* 忽略 */ } }
  }
  // force=true 时才去申请麦克风权限
  Net.myLanIp = async function (force) {
    if (myIpCache) return { ip: myIpCache, via: "cache" };
    let ip = await collectHostIp();
    if (ip) { myIpCache = ip; return { ip: ip, via: "ice" }; }
    if (force) {
      try {
        const st = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        // 拿到地址就够了 —— 立刻把麦克风关掉
        try { st.getTracks().forEach((t) => t.stop()); } catch (e) { /* 忽略 */ }
        ip = await collectHostIp();
        if (ip) { myIpCache = ip; return { ip: ip, via: "perm" }; }
        return { ip: "", via: "still-hidden" };
      } catch (e) { return { ip: "", via: "denied" }; }
    }
    return { ip: "", via: "hidden" };
  };
  Net.getMyIpCache = function () { return myIpCache; };

  // 给界面用的三个入口（内部再转给总线，避免上层直接摸总线对象）
  Net.pairInvite = function () {
    if (!Net.bus || Net.bus.kind !== "pair") return Promise.reject(new Error("当前不是跨设备配对模式"));
    return Net.bus.makeInvite();
  };
  Net.pairAccept = function (text, ip) {
    if (!Net.bus || Net.bus.kind !== "pair") return Promise.reject(new Error("当前不是跨设备配对模式"));
    return Net.bus.acceptInvite(text, ip).then((rep) => {
      Net._pairUsedIp = (Net.bus && Net.bus.lastUsedIp) || "";
      return rep;
    });
  };
  Net.pairReply = function (text, ip) {
    if (!Net.bus || Net.bus.kind !== "pair") return Promise.reject(new Error("当前不是跨设备配对模式"));
    return Net.bus.acceptReply(text, ip);
  };
  Net.pairReady = function () { return !!(Net.bus && Net.bus.kind === "pair" && Net.bus.isOpen && Net.bus.isOpen()); };
  Net.pairIceState = function () {
    if (!Net.bus || Net.bus.kind !== "pair" || !Net.bus.iceState) return "";
    try { return Net.bus.iceState(); } catch (e) { return ""; }
  };
  Net.pairIceDiag = function () {
    if (!Net.bus || Net.bus.kind !== "pair" || !Net.bus.iceDiag) return "";
    try { return Net.bus.iceDiag(); } catch (e) { return ""; }
  };
  Net.isPair = function () { return !!(Net.bus && Net.bus.kind === "pair"); };

  // ============================================================
  // 混合通道：云 + 本机（已停用，云通道关闭后不再被引用）
  //
  // 只走云的话，云端函数没部署（403 / 没建表）时列表就是空的 —— 同一台机器上
  // 明明开着房也一个都看不见。只走本机又跨不了设备。
  // 所以两条一起用：建房间两边都登记，列表两边合并，发消息优先云、失败落本机。
  // ============================================================
  function hybridBus() {
    const cloud = cloudBus();
    const local = localBus();
    let cloudDead = false;                 // 云连续失败后就别再等它了
    const handlers = [];
    const fan = (h) => { handlers.push(h); };
    const emit = (m) => { for (const h of handlers) { try { h(m); } catch (e) { /* 忽略 */ } } };

    cloud.onMessage((m) => emit(m));
    local.onMessage((m) => emit(m));

    return {
      kind: "hybrid",
      listRooms() {
        return Promise.all([
          cloud.listRooms().catch(() => []),
          local.listRooms().catch(() => []),
        ]).then(([c, l]) => {
          if (Array.isArray(c) && c.length && !c.__err) cloudDead = false;
          const byCode = new Map();
          const add = (r) => {
            if (!r || r.code == null) return;
            const k = String(r.code), old = byCode.get(k);
            if (!old || (r.name && !old.name) || ((r.n | 0) > (old.n | 0))) byCode.set(k, r);
          };
          (Array.isArray(l) ? l : []).forEach(add); (Array.isArray(c) ? c : []).forEach(add);
          const out = [...byCode.values()];
          if (!out.length && c && c.__err) out.__err = c.__err;
          return out;
        });
      },
      createRoom(name, code, pub, max, nick) {
        // 两边都登记：云给跨设备用，本机给同一台机器/同局域网发现用
        const lp = local.createRoom(name, code, pub, max, nick).catch(() => null);
        const cp = cloudDead ? Promise.resolve(null)
          : cloud.createRoom(name, code, pub, max, nick).catch(() => { cloudDead = true; return null; });
        return Promise.all([lp, cp]).then(([l, c]) => {
          if (!l && !c) throw new Error("建房间失败 —— 云端和本机都没能创建");
          return (c && c.ok) ? c : l;
        });
      },
      joinRoom(code, nick) {
        // 云房间加不进（比如它其实是本机房间）就退回本机
        return (cloudDead ? Promise.reject(new Error("cloud dead"))
          : cloud.joinRoom(code, nick).catch(() => { cloudDead = true; return null; }))
          .then((c) => (c && c.ok) ? c : local.joinRoom(code, nick));
      },
      touch(code) {
        const lp = local.touch(code).catch(() => []);
        const cp = cloudDead ? Promise.resolve(null) : cloud.touch(code).catch(() => null);
        return Promise.all([lp, cp]).then(([l, c]) => {
          const seen = new Map();
          // 云端有时回的不是数组（比如 {ok:false,msg}）—— 直接 forEach 会抛异常，
          // 把整个成员表更新打断，房主也就再也看不见别人了。
          const L = Array.isArray(l) ? l : [];
          const C = Array.isArray(c) ? c : (c && Array.isArray(c.members) ? c.members : []);
          L.forEach((x) => x && seen.set(String(x.token), x));
          C.forEach((x) => { if (x && !seen.has(String(x.token))) seen.set(String(x.token), x); });
          return [...seen.values()];
        });
      },
      leaveRoom(code) {
        local.leaveRoom(code).catch(() => {});
        if (!cloudDead) cloud.leaveRoom(code).catch(() => {});
        return Promise.resolve({ ok: true });
      },
      send(code, to, payload) {
        local.send(code, to, payload).catch(() => {});
        if (!cloudDead) cloud.send(code, to, payload).catch(() => {});
        return Promise.resolve({ ok: true });
      },
      onMessage(h) { fan(h); },
      close() { try { local.close(); } catch (e) {} },
    };
  }

  // 本机发现通道：不管走不走云，都常驻一条。
  // 云信令没配好（网关没放行 br_room_*）时，至少同一台机器上的房间还能互相看见。
  let discovery = null;
  function ensureDiscovery() {
    if (discovery) return discovery;
    try { discovery = localBus(); discovery.onMessage(() => { /* 只用于发现，不分发消息 */ }); }
    catch (e) { discovery = null; }
    return discovery;
  }
  try { window.__localBus = localBus; } catch (e) { /* 忽略 */ }

  // mode: "lan"（局域网 / 本机频道）| "pair"（跨设备局域网 · 配对码）
  //       | "vibe"（VibeHub 网络联机，异步初始化）
  // 云通道已停用，不会再出现 "cloud" / "hybrid" 这两种。
  Net.init = function (mode) {
    Net.refreshSelf();
    if (mode === "vibe") { Net.mode = "vibe"; return Net.initVibe().then(() => "vibe"); }
    // 切回局域网：把 VibeHub 的 peerId 身份丢掉，不然 myToken() 一直返回它
    _vibeId = "";
    if (mode === "pair") {
      Net.bus = pairBus();
      Net.bus.onMessage((m) => Net._sig(m));
      Net.mode = "pair";
      return Net.bus.kind;
    }
    Net.bus = localBus();
    Net.bus.onMessage((m) => Net._sig(m));
    Net.mode = "lan";
    return Net.bus.kind;
  };
  Net.mode = "lan";

  // 房间列表。两种模式各走各的，不混：
  //   局域网联机 → 只列本机 BroadcastChannel 上的房间
  //   网络联机   → 只列 VibeHub 房间层元数据里的房间
  //   （以前是"云 + 本机"合并，云通道关了就不存在合并这件事了）
  Net.listRooms = function () {
    if (Net.bus && Net.bus.kind === "vibe") return Net.bus.listRooms();
    const d = ensureDiscovery();
    const localP = d ? d.listRooms().catch(() => []) : Promise.resolve([]);
    const mainP = Net.bus ? Net.bus.listRooms().catch(() => []) : Promise.resolve([]);
    return Promise.all([localP, mainP]).then(([loc, main]) => {
      const byCode = new Map();
      const add = (r) => {
        if (!r || r.code == null) return;
        const c = String(r.code);
        const old = byCode.get(c);
        // 同号房间：保留信息更全的那条（有名字 / 人数更多的）
        if (!old || (r.name && !old.name) || ((r.n | 0) > (old.n | 0))) byCode.set(c, r);
      };
      (Array.isArray(loc) ? loc : []).forEach(add);
      (Array.isArray(main) ? main : []).forEach(add);
      const out = [...byCode.values()];
      // 两条路都没结果，且云端报了错 —— 把原因带给上层，界面上给一句提示
      if (!out.length && main && main.__err) out.__err = main.__err;
      return out;
    });
  };

  Net.createRoom = function (name, pub, max, code) {
    Net.refreshSelf();
    // 房间号：界面里预填过就用那个，没填就随机生成 4 位数字
    const cd = String(code || "").trim() || String(Math.floor(1000 + Math.random() * 9000));
    return Net.bus.createRoom(name, cd, pub, max, Net.self.nick).then((r) => {
      if (!r || !r.ok) throw new Error((r && r.msg) || "建房间失败");
      Net.room = { code: r.code, name: name || "未命名房间", isHost: true, max: r.max || max, pub: !!pub };
      Net._startTouch();          // 房主也要心跳，不然自己这边的成员表一直是空的
      return Net.room;
    }).catch((e) => {
      // 云连不上：退到本机频道，至少同一台机器上还能联机，不至于整个功能废掉
      if (Net.bus && Net.bus.kind === "cloud") {
        Net.bus = localBus();
        Net.bus.onMessage((m) => Net._sig(m));
        console.warn("[net] 云信令不可用，已退回本机频道：", e && e.message);
        return Net.createRoom(name, pub, max, code);
      }
      throw e;
    });
  };

  Net.joinRoom = function (code, nick) {
    Net.refreshSelf();
    if (nick) { try { localStorage.setItem("br_nick", nick); } catch (e) { /* 忽略 */ } Net.self.nick = nick; }
    return Net.bus.joinRoom(code, Net.self.nick).then((r) => {
      if (!r || !r.ok) throw new Error((r && r.msg) || "进不去这个房间");
      Net.room = { code: r.code, name: r.name || ("房间 " + r.code), isHost: !!r.isHost, max: r.max || 4, pub: r.pub !== false };
      Net._startTouch();
      return Net.room;
    }).catch((e) => {
      if (Net.bus && Net.bus.kind === "cloud") {
        Net.bus = localBus();
        Net.bus.onMessage((m) => Net._sig(m));
        console.warn("[net] 云信令不可用，已退回本机频道：", e && e.message);
        return Net.bus.joinRoom(code, Net.self.nick).then((r) => {
          if (!r || !r.ok) throw new Error((r && r.msg) || "进不去这个房间");
          Net.room = { code: r.code, name: r.name || ("房间 " + r.code), isHost: !!r.isHost, max: r.max || 4, pub: r.pub !== false };
          Net._startTouch();
          return Net.room;
        });
      }
      throw e;
    });
  };

  Net.leaveRoom = function () {
    stopPing();
    Net.ping = 0;
    if (Net.room) Net.bus.leaveRoom(Net.room.code);
    for (const [t, p] of Net.peers) { try { p.dc && p.dc.close(); p.pc && p.pc.close(); } catch (e) { /* 忽略 */ } }
    Net.peers.clear();
    Net.room = null;
    if (Net.onPeersChange) Net.onPeersChange();
  };

  Net._startTouch = function () {
    if (!Net.bus || Net.bus.kind !== "cloud") startPing();
    clearInterval(Net._touchTimer);
    Net._touchTimer = setInterval(() => {
      if (!Net.room) return;
      const t0 = Date.now();
      Net.bus.touch(Net.room.code).then((members) => {
        // 云模式本来就在轮询，ping 取这次 RPC 的往返就够了；
        // 本地频道没有网络往返，才用 ping/pong 包去量。
        if (Net.bus && Net.bus.kind === "cloud") {
          const rtt = Date.now() - t0;
          if (rtt < 5000) Net.ping = Net.ping ? Math.round(Net.ping * 0.6 + rtt * 0.4) : rtt;
        }
        if (Array.isArray(members)) {
          Net._members = members;
          if (Net.onPeersChange) Net.onPeersChange();
          // 云模式：房主把房删了，成员表里就不会再有房主 —— 视为解散
          if (Net.bus && Net.bus.kind === "cloud" && !Net.room.isHost && members.length
              && !members.some((m) => m.is_host || m.host)) {
            if (Net.onMessage) Net.onMessage("", { t: "dissolve" });
          }
        }
      });
      // 房主：主动给还没连上的客人发 offer（自建 WebRTC 握手，只有云通道用得上）
      // 网络联机走 VibeHub，P2P 是 SDK 自己建的 —— 这里再发 offer 只会
      // 白白建一堆 RTCPeerConnection，还永远连不上。
      // 以前写成 kind === "cloud"，而混合通道的 kind 是 "hybrid" ——
      // 房主就永远不发 offer，客人也不会主动握手，点对点一条都建不起来。
      if (Net.room.isHost && Net.bus && Net.bus.kind !== "local" && Net.bus.kind !== "vibe" &&
          Net.bus.kind !== "pair" && Net._members) {
        for (const m of Net._members) {
          if (m.token === Net.self.token) continue;
          if (!Net.peers.has(m.token)) Net._offerTo(m.token);
        }
      }
    }, 3000);
  };

  // ---------- 信令 ----------
  Net._send = function (to, payload) {
    if (!Net.room) return;
    Net.bus.send(Net.room.code, to, payload);
  };

  // 延迟：每 2 秒 ping 一次，收到回包就记下往返耗时（左下角那行小字要看）
  Net.ping = 0;
  let pingTimer = null;
  function startPing() {
    stopPing();
    pingTimer = setInterval(() => {
      if (!Net.room) return;
      Net._send("", { t: "ping", ts: Date.now() });
    }, 2000);
  }
  function stopPing() { if (pingTimer) { clearInterval(pingTimer); pingTimer = null; } }

  Net._sig = function (m) {
    if (!m || !m.payload) return;
    const p = m.payload;
    const from = m.from || "";
    const isEcho = !!(from && Net.self && String(from) === String(Net.self.token));
    // ping / pong 只用来测延迟，不下发给上层
    if (p.t === "ping") {
      // 别回自己的
      if (isEcho) return;
      Net._send(from || "", { t: "pong", ts: p.ts });
      return;
    }
    if (p.t === "pong") {
      if (isEcho) return;                       // 云轮询会把你自己发的回显带回来
      const rtt = Date.now() - (p.ts || 0);
      if (rtt >= 0 && rtt < 5000) Net.ping = Net.ping ? Math.round(Net.ping * 0.6 + rtt * 0.4) : rtt;
      return;
    }
    if (p.t === "offer") { Net._answerTo(from, p.sdp); return; }
    if (p.t === "answer") { const pr = Net.peers.get(from); if (pr && pr.pc) pr.pc.setRemoteDescription(p.sdp).catch(() => {}); return; }
    if (p.t === "ice") { const pr = Net.peers.get(from); if (pr && pr.pc) pr.pc.addIceCandidate(p.cand).catch(() => {}); return; }
    // 自己发出去的回显：除了上面的握手包，其它一律不再处理
    if (isEcho) return;
    if (!Net.room) return;
    if (m.code && String(m.code) !== String(Net.room.code)) return;
    if (m.to && Net.self && m.to !== Net.self.token && m.to !== "") return;
    // 踢人 / 投票要先走各自的处理器 —— 不然会被当成普通游戏消息吃掉
    if (p.t === "kick") {
      if (p.newHost && String(p.newHost) === String(Net.self.token)) Net._becomeHost();
      if (Net.onKicked) Net.onKicked(p);
      return;
    }
    if (p.t === "vote") {
      if (Net.self && p.by === Net.self.token) return;      // 自己的票在本地已经记过了
      if (Net.onVote) Net.onVote(p);
      return;
    }
    // 云和本机两条路会把同一条消息各送一次 —— 靠 mid 去重，别处理两遍
    if (p.mid) {
      if (Net._seen.has(p.mid)) return;
      Net._seen.add(p.mid);
      if (Net._seen.size > 600) Net._seen.clear();
    }
    // 游戏消息（位置 / 实体 / 聊天 / 开局 ...）无论走云还是本机都要交给上层。
    // 以前只有 kind==="local" 才投递 —— 走云的话一条都到不了上层，
    // 房间里明明连着却谁也看不见谁。
    if (p && p.t === "tapechunk") {
      // 录像带帧数据分块：只交给摄像机模块，不往聊天 / 房间界面里塞
      try { window.dispatchEvent(new CustomEvent("br:tapechunk", { detail: p })); } catch (e) { /* ignore */ }
      if (Net.__lobbyRaw) Net.__lobbyRaw(from, p);
      return;
    }
    if (Net.onMessage) Net.onMessage(from, p);
    if (Net.__lobbyRaw) Net.__lobbyRaw(from, p);
  };
  // 已处理过的消息 id（云 + 本机双通道去重）
  Net._seen = new Set();
  Net._midSeq = 0;

  function mkPeer(tok) {
    if (Net.peers.has(tok)) return Net.peers.get(tok);
    let pc = null, dc = null;
    try { pc = new RTCPeerConnection(ICE); } catch (e) { pc = null; }
    const pr = { token: tok, pc: pc, dc: null, name: "流浪者" };
    if (pc) {
      pc.onicecandidate = (e) => { if (e.candidate) Net._send(tok, { t: "ice", cand: e.candidate.toJSON() }); };
      pc.ondatachannel = (e) => { pr.dc = e.channel; wireDC(pr); };
    }
    Net.peers.set(tok, pr);
    if (Net.onPeersChange) Net.onPeersChange();
    return pr;
  }

  function wireDC(pr) {
    pr.dc.onmessage = (e) => {
      let d = null;
      try { d = JSON.parse(e.data); } catch (err) { return; }
      if (!d) return;
      if (d.t === "kick") {
        if (d.newHost && String(d.newHost) === String(Net.self.token)) Net._becomeHost();
        if (Net.onKicked) Net.onKicked(d);
        return;
      }
      if (d.t === "vote" && Net.onVote) { Net.onVote(d); return; }
      if (d.t === "tapechunk") {
        try { window.dispatchEvent(new CustomEvent("br:tapechunk", { detail: d })); } catch (e) { /* ignore */ }
        if (Net.__lobbyRaw) Net.__lobbyRaw(pr.token, d);
        return;
      }
      if (Net.onMessage) Net.onMessage(pr.token, d);
      if (Net.__lobbyRaw) Net.__lobbyRaw(pr.token, d);
    };
    pr.dc.onopen = () => { if (Net.onPeersChange) Net.onPeersChange(); };
  }

  Net._offerTo = function (tok) {
    const pr = Net.peers.has(tok) ? Net.peers.get(tok) : mkPeer(tok);
    if (!pr.pc) return;
    try {
      const dc = pr.pc.createDataChannel("br");
      pr.dc = dc; wireDC(pr);
      pr.pc.createOffer().then((sdp) => pr.pc.setLocalDescription(sdp))
        .then(() => Net._send(tok, { t: "offer", sdp: pr.pc.localDescription }))
        .catch(() => {});
    } catch (e) { /* 忽略 */ }
  };

  Net._answerTo = function (tok, sdp) {
    const pr = Net.peers.has(tok) ? Net.peers.get(tok) : mkPeer(tok);
    if (!pr.pc) return;
    pr.pc.setRemoteDescription(sdp)
      .then(() => pr.pc.createAnswer())
      .then((a) => pr.pc.setLocalDescription(a))
      .then(() => Net._send(tok, { t: "answer", sdp: pr.pc.localDescription }))
      .catch(() => {});
  };

  function stamp(obj) {
    // 唯一 id：云和本机两条路会把同一条消息各送回来一次，接收端靠它只处理一遍
    try { obj.mid = String(Net.self && Net.self.token) + ":" + (++Net._midSeq) + ":" + Date.now(); } catch (e) { /* 忽略 */ }
    return obj;
  }
  // 点对点还没连上的人有几个 —— 有就得走总线兜底，
  // 不然跨设备（没有 TURN 中继时 P2P 常常建不起来）一条游戏消息都发不出去。
  function busNeeded() {
    let known = 0, open = 0;
    for (const [, p] of Net.peers) {
      known++;
      if (p.dc && p.dc.readyState === "open") open++;
    }
    if (known === 0) return true;                     // 一个点对点连接都没有
    if (open < known) return true;                    // 有人还没连上
    return Net.memberCount() > known + 1;             // 有人压根没建立起 peer
  }

  Net._busSendT = 0;
  Net.broadcast = function (obj, important) {
    if (!Net.room || !obj) return;
    stamp(obj);
    // 跨设备配对：数据通道由总线自己管 —— 这里全权交给它，两套都发会重复
    if (Net.bus && Net.bus.kind === "pair") {
      try { Net.bus.send(Net.room.code, "", obj, important); } catch (e) { /* 忽略 */ }
      return;
    }
    const s = JSON.stringify(obj);
    for (const [, p] of Net.peers) { if (p.dc && p.dc.readyState === "open") { try { p.dc.send(s); } catch (e) { /* 忽略 */ } } }
    // 本地频道没有 WebRTC 数据通道 —— 一律借总线广播（同一台机器的多标签页）
    const kind = Net.bus && Net.bus.kind;
    if (kind === "local") { try { Net.bus.send(Net.room.code, "", obj); } catch (e) { /* 忽略 */ } return; }
    // 网络联机：P2P 由 SDK 管，总线就是唯一通路。
    // 按规范拆包：important 走可靠有序的 room.send()，位置/快照走 sendRealtime()（可丢）。
    if (kind === "vibe") { try { Net.bus.send(Net.room.code, "", obj, important); } catch (e) { /* 忽略 */ } return; }
    // 云：点对点全通就只走直连（快）；只要有人没连上，就再补一份走总线。
    // 以前这里只发数据通道 —— 通道一没建立，房间里谁也看不见谁。
    if (!important && !busNeeded()) return;
    const now = Date.now();
    // 总线那头是轮询拉取的，位置同步 80ms 一次会把请求堆成山 —— 节流。
    // 计时器只给"常规包"用：以前重要消息也会把它刷成当前时间，
    // 结果位置包永远差不到 420ms，一条都发不出去。
    if (!important) {
      if (now - Net._busSendT < 420) return;
      Net._busSendT = now;
    }
    try { Net.bus.send(Net.room.code, "", obj); } catch (e) { /* 忽略 */ }
  };
  Net.sendTo = function (tok, obj) {
    const p = Net.peers.get(tok);
    let sent = false;
    if (p && p.dc && p.dc.readyState === "open") { try { p.dc.send(JSON.stringify(obj)); sent = true; } catch (e) { /* 忽略 */ } }
    // 通道没开就走总线指名道姓地发（云那边支持定向投递）
    if (!sent && Net.room && Net.bus) {
      try { Net.bus.send(Net.room.code, tok, stamp(obj), true); } catch (e) { /* 忽略 */ }
    }
  };

  // ---------- 投票踢人：支持票要达到房间人数的 1/2 ----------
  Net.votes = new Map();      // 被投的人 -> Set(投票人)
  Net.startVote = function (targetTok) {
    if (!Net.room) return;
    Net.votes.set(targetTok, new Set([Net.self.token]));   // 发起人算一票
    Net._voteStarter.set(targetTok, Net.self.token);
    Net.broadcast({ t: "vote", target: targetTok, by: Net.self.token, name: Net.self.nick }, true);
    Net._checkVote(targetTok);
  };
  // 附议一票（别人已经发起过，我再加一票）
  Net.addVote = function (targetTok) {
    if (!Net.room || !targetTok) return;
    if (!Net.votes.has(targetTok)) Net.votes.set(targetTok, new Set());
    Net.votes.get(targetTok).add(Net.self.token);
    Net.broadcast({ t: "vote", target: targetTok, by: Net.self.token, name: Net.self.nick }, true);
    Net._checkVote(targetTok);
  };
  Net.onVote = function (d) {
    if (!Net.votes.has(d.target)) Net.votes.set(d.target, new Set());
    Net.votes.get(d.target).add(d.by);
    if (Net.onVoteUi) Net.onVoteUi(d);
    Net._checkVote(d.target);
  };
  // 踢房主的门槛更高：要 2/3 的人支持（踢普通玩家仍是 1/2）
  Net.voteNeed = function (targetTok) {
    const total = Math.max(2, Net.memberCount());
    const isHostTarget = !!(Net.room && Net.room.isHost && Net.self &&
      Net.self.token && String(targetTok) === String(Net.room.hostToken));
    const isHostTarget2 = isHostTarget || !!(Net._members || []).some(
      (m) => m && String(m.token) === String(targetTok) && m.is_host);
    if (isHostTarget2) return Math.ceil(total * 2 / 3);
    return Math.ceil(total / 2);
  };
  Net._checkVote = function (target) {
    const s = Net.votes.get(target);
    if (!s) return;
    const need = Net.voteNeed(target);
    if (s.size >= need) {
      // 踢的是房主：发起投票的那个人接手当房主
      const starter = Net._voteStarter && Net._voteStarter.get ? Net._voteStarter.get(target) : null;
      if (Net.room && Net.room.isHost) {
        Net.broadcast({ t: "kick", target: target, newHost: starter || null }, true);
      }
      if (starter && String(starter) === String(Net.self.token)) {
        // 我被推为新房主
        Net._becomeHost();
      }
      if (target === Net.self.token && Net.onKicked) Net.onKicked({ target: target });
      Net.votes.delete(target);
      if (Net._voteStarter && Net._voteStarter.delete) Net._voteStarter.delete(target);
    }
  };
  Net._voteStarter = new Map();
  // 房主易主：广播告知（所有人更新自己心里的房主是谁）
  Net.onNewHost = null;
  Net._becomeHost = function () {
    if (!Net.room) return;
    Net.room.isHost = true;
    Net.room.hostToken = Net.self.token;
    try { Net.broadcast({ t: "newhost", tok: Net.self.token }, true); } catch (e) { /* 忽略 */ }
    if (Net.onNewHost) Net.onNewHost();
  };
  Net.memberCount = function () {
    let n = 1;
    if (Net._members && Net._members.length) n = Net._members.length;
    return Math.max(n, Net.peers.size + 1, 2);
  };

  Net.peerList = function () {
    const out = [{ token: Net.self.token, name: Net.self.nick, host: !!(Net.room && Net.room.isHost), self: true }];
    for (const [t, p] of Net.peers) out.push({ token: t, name: p.name || "流浪者", host: false, self: false, open: !!(p.dc && p.dc.readyState === "open") });
    if (Net._members && Net._members.length > out.length) {
      for (const m of Net._members) if (!out.some((o) => o.token === m.token)) {
        // 各条总线给的字段名不统一：有的叫 host，有的叫 is_host —— 只认一个的话，
        // 客人这边就永远看不到「房主」这个标记
        out.push({ token: m.token, name: m.nick || "流浪者", host: !!(m.host || m.is_host) });
      }
    }
    return out;
  };

  // 给上层留一个"造本地总线"的口子（云不通时降级用）
  window.__localBus = localBus;

  window.Net = Net;
})();
