"use strict";
// ============================================================
// 联机大厅界面 + 游戏中的联机规则
//
// 界面流程：
//   开始游戏 → 联机游玩 → [局域网联机] [网络联机(暂不可用)]
//            → 房间列表（识别到的房间 / 新建房间 / 输房间号进入）
//            → 新建房间（名字 · 随机房间号 · 公开或私人 · 最大人数）
//            → 房间内（成员列表 · 开始游戏）
//
// 私人房间不会出现在房间列表里，只能靠上方输入房间号进入。
// ============================================================
(function () {
  const $ = (id) => document.getElementById(id);

  // ---------- 样式 ----------
  const css = document.createElement("style");
  css.textContent = `
.lb-mask{position:fixed;inset:0;background:rgba(6,8,6,.82);z-index:60;display:flex;align-items:center;justify-content:center;}
.lb-mask.hidden{display:none;}
.lb-box{width:min(680px,92vw);max-height:88vh;overflow:auto;background:#12140f;border:1px solid #3b3a2a;
  border-radius:10px;padding:20px 22px;box-shadow:0 0 40px rgba(0,0,0,.7);}
.lb-box h2{margin:0 0 4px;font-size:21px;color:#d8cf9a;letter-spacing:2px;}
.lb-sub{margin:0 0 14px;font-size:12px;color:#8a7f66;line-height:1.6;}
.lb-big{display:flex;gap:12px;margin:14px 0 6px;flex-wrap:wrap;}
.lb-big button{flex:1;min-width:200px;padding:18px 14px;background:#1c1f17;color:#cfc7a0;border:1px solid #4a4834;
  border-radius:8px;cursor:pointer;text-align:left;font-size:15px;transition:.15s;}
.lb-big button:hover:not(:disabled){background:#262a1e;border-color:#7d7448;transform:translateY(-2px);}
.lb-big button b{display:block;font-size:17px;margin-bottom:5px;color:#e4d9a8;}
.lb-big button span{font-size:12px;color:#8a7f66;}
.lb-big button:disabled{opacity:.42;cursor:not-allowed;}
.lb-row{display:flex;gap:10px;align-items:center;margin:9px 0;}
.lb-iprow .lb-tip{font-size:11px;}
.lb-iprow input{font-family:ui-monospace,monospace;}
.lb-row label{width:96px;font-size:13px;color:#a89b71;flex:none;}
.lb-row input[type=text],.lb-row input[type=number]{flex:1;padding:9px 11px;background:#0d0f0b;border:1px solid #45432f;
  color:#e0d7ad;border-radius:6px;font-size:14px;}
.lb-code{font-family:ui-monospace,monospace;font-size:26px;letter-spacing:6px;color:#ffd97a;text-align:center;
  padding:10px;background:#0b0d09;border:1px dashed #5a5233;border-radius:8px;margin:6px 0 12px;}
.lb-seg{display:flex;gap:8px;}
.lb-seg button{flex:1;padding:11px;background:#0f120d;border:1px solid #45432f;color:#9a8f68;border-radius:6px;
  cursor:pointer;font-size:14px;}
.lb-seg button.on{background:#2a3a24;border-color:#7fbf5a;color:#d8f0c0;}
.lb-seg button:disabled{opacity:.55;cursor:not-allowed;}
#lb-diff-seg{flex:1;}
#lb-real.on{background:#2a3a24;border-color:#7fbf5a;color:#d8f0c0;}
#lb-real:disabled{opacity:.55;cursor:not-allowed;}
#lb-opt-owner,#lb-real-row span{flex:none;}
.lb-list{border:1px solid #33311f;border-radius:8px;max-height:230px;overflow:auto;margin:10px 0;background:#0c0e0a;}
.lb-item{display:flex;align-items:center;gap:10px;padding:11px 13px;border-bottom:1px solid #242318;cursor:pointer;}
.lb-item:last-child{border-bottom:none;}
.lb-item:hover{background:#171a13;}
.lb-item .code{font-family:ui-monospace,monospace;color:#ffd97a;font-size:16px;letter-spacing:2px;min-width:56px;}
.lb-item .nm{flex:1;color:#cfc7a0;font-size:14px;}
.lb-item .n{font-size:12px;color:#8a7f66;}
.lb-empty{padding:26px;text-align:center;color:#6f6647;font-size:13px;}
/* 吸底：内容再长（配对区一展开就顶满屏）「收起 / 关闭房间」也一直在屏幕上，
   不用先滚到底才点得到 —— 之前它们会被推出可视区，看着就像"关不掉" */
.lb-acts{display:flex;gap:10px;margin-top:14px;flex-wrap:wrap;
  position:sticky;bottom:-20px;background:#12140f;padding:10px 0 2px;z-index:3;}
.lb-head + .lb-sub ~ .lb-acts{box-shadow:0 -8px 14px -8px #000;}
.lb-acts button{flex:1;padding:12px;border-radius:7px;cursor:pointer;font-size:15px;}
/* 进入按钮的灰态：默认可见但不可点 */
.lb-pri.dim{opacity:.4;filter:grayscale(1);cursor:not-allowed;}
.lb-pri.lit{box-shadow:0 0 18px rgba(255,233,122,.35);}
.lb-pri{background:#2f4a26;border:1px solid #6aa84f;color:#e2f5d2;}
.lb-gh{background:#171a13;border:1px solid #45432f;color:#9a8f68;}
.lb-mem{display:flex;align-items:center;gap:9px;padding:9px 12px;border-bottom:1px solid #242318;}
.lb-mem .nm{flex:1;color:#cfc7a0;font-size:14px;}
.lb-mem .tag{font-size:11px;padding:2px 7px;border-radius:9px;border:1px solid #4a4834;color:#8a7f66;}
.lb-mem .tag.host{border-color:#7fbf5a;color:#b6e6c0;}
.lb-mem button{padding:5px 10px;font-size:12px;background:#3a2018;border:1px solid #7a3a2a;color:#e8a88a;
  border-radius:5px;cursor:pointer;}
.lb-err{color:#e08a6a;font-size:13px;min-height:18px;margin-top:6px;white-space:pre-line;line-height:1.55;}
/* 配对码：一长串，用等宽小字的框装 */
.lb-ta{width:100%;box-sizing:border-box;height:110px;background:#0d0f0b;border:1px solid #45432f;
  color:#cfc7a0;border-radius:6px;font-family:ui-monospace,monospace;font-size:11px;line-height:1.5;
  padding:9px 10px;resize:vertical;word-break:break-all;}
.lb-pair{border:1px solid #33311f;border-radius:8px;padding:12px 13px;margin:10px 0;background:#0c0e0a;}
.lb-pair .hd{font-size:13px;color:#d8cf9a;margin-bottom:8px;}
.lb-pair .st{font-size:12px;color:#7fbf5a;margin-top:6px;}
.lb-ok{color:#8fd06a;}
.lb-tip{font-size:12px;color:#6f6647;line-height:1.6;margin-top:8px;}
/* 标题行吸顶：内容一多（配对区展开），底部的按钮要滚才看得到，
   顶部这个 × 永远露在外面 —— 房间界面不会变成"关不掉的窗口"。 */
.lb-head{position:sticky;top:-20px;background:#12140f;padding:2px 0 8px;z-index:3;
  display:flex;align-items:center;gap:10px;}
.lb-head h2{flex:1;margin:0;}
.lb-x{width:34px;height:34px;flex:none;border-radius:7px;background:#171a13;border:1px solid #45432f;
  color:#9a8f68;font-size:19px;line-height:1;cursor:pointer;padding:0;}
.lb-x:hover{background:#2a2f22;color:#e0d7ad;border-color:#7d7448;}

/* 游戏内：有人到了更高层的提示弹窗 */
.hl-pop{position:fixed;right:16px;top:120px;width:250px;z-index:45;background:#14170f;border:1px solid #6aa84f;
  border-radius:9px;padding:14px;box-shadow:0 0 24px rgba(0,0,0,.75);}
.hl-pop.hidden{display:none;}
.hl-pop .t{font-size:14px;color:#dff0cc;margin-bottom:11px;line-height:1.55;}
.hl-pop .b{display:flex;gap:8px;}
.hl-pop .b button{flex:1;padding:8px;border-radius:6px;cursor:pointer;font-size:13px;}
.hl-pop .ok{background:#2f4a26;border:1px solid #6aa84f;color:#e2f5d2;}
.hl-pop .no{background:#171a13;border:1px solid #45432f;color:#9a8f68;}
/* 联机成员条 */
/* 成员条挪到右上角：以前在左上角，正好压住左下角的帧率/延迟那一行 */
.mp-bar{position:fixed;right:14px;top:96px;z-index:40;font-size:12px;color:#9a8f68;
  line-height:1.7;text-align:right;max-width:44vw;
  background:rgba(8,8,6,.45);border-radius:5px;padding:5px 9px;pointer-events:none;}
.mp-bar.hidden{display:none;}
.mp-bar .me{color:#b6e6c0;}
@media (max-width: 900px){ .mp-bar{top:132px;} }
`;
  document.head.appendChild(css);

  function mkMask(id, html) {
    const d = document.createElement("div");
    d.className = "lb-mask hidden";
    d.id = id;
    d.innerHTML = '<div class="lb-box">' + html + "</div>";
    document.body.appendChild(d);
    // 点遮罩空白处关闭。手机上没有 mousedown，只绑 mousedown 等于点不动 ——
    // 以前正是这样：触屏点空白关不掉，看起来就像"退不出去"。
    const closeMask = (e) => { if (e.target === d) d.classList.add("hidden"); };
    d.addEventListener("mousedown", closeMask);
    d.addEventListener("touchstart", closeMask, { passive: true });
    return d;
  }

  // ---------- 1. 选择联机方式 ----------
  const mMode = mkMask("lb-mode", `
    <h2>联机游玩</h2>
    <p class="lb-sub">选一种连接方式。</p>
    <div class="lb-big">
      <button id="lb-lan"><b>局域网联机</b><span>同一台机器开两个标签页；或用配对码让手机和电脑直连（同一个 WiFi）</span></button>
      <button id="lb-net"><b>网络联机</b><span>VibeHub 联机 —— 跨设备，P2P 直连，连不上自动走中继</span></button>
    </div>
    <div class="lb-err" id="lb-mode-err"></div>
    <div class="lb-tip hidden" id="lb-mode-vibelink"></div>
    <div class="lb-acts"><button id="lb-mode-room" class="lb-pri hidden">回到我刚才的房间</button></div>
    <div class="lb-acts"><button id="lb-mode-back" class="lb-gh">返回</button></div>
  `);

  // ---------- 1.5 局域网：再选一次（同一台机器 / 跨设备） ----------
  const mModeLan = mkMask("lb-modelan", `
    <h2>局域网联机</h2>
    <p class="lb-sub">两种都能用，看你打算跟谁玩。</p>
    <div class="lb-big">
      <button id="lb-lan-self"><b>同一台机器</b><span>开两个标签页就能一起玩，不用联网 —— 但只能在这台机器上</span></button>
      <button id="lb-lan-pair"><b>跨设备 · 配对码</b><span>手机和电脑连同一个 WiFi，复制一段码互相发一下就能连 —— 不走任何服务器</span></button>
    </div>
    <div class="lb-err" id="lb-modelan-err"></div>
    <div class="lb-acts"><button id="lb-lan-back" class="lb-gh">返回</button></div>
  `);

  // ---------- 2. 房间列表 ----------
  const mList = mkMask("lb-list", `
    <h2>房间</h2>
    <p class="lb-sub" id="lb-list-sub">下面是在同一网络里识别到的公开房间。私人房间不会出现在这里 —— 只能输房间号进入。</p>
    <div class="lb-row">
      <label>房间号</label>
      <input type="text" id="lb-code-in" placeholder="输入房间号后回车" maxlength="8">
      <button id="lb-join" class="lb-pri" style="padding:9px 16px;width:auto;">进入</button>
    </div>
    <div class="lb-row lb-iprow hidden" id="lb-gip-row">
      <label>房主 IP<small style="font-weight:400;color:#8a8270;">（选填）</small></label>
      <input type="text" id="lb-gip" placeholder="一般不用填 —— 邀请码里自带房主的 IP">
    </div>
    <div class="lb-list" id="lb-rooms"><div class="lb-empty">正在找房间……</div></div>
    <div class="lb-err" id="lb-list-err"></div>
    <div class="lb-acts">
      <button id="lb-new" class="lb-pri">新建房间</button>
      <button id="lb-refresh" class="lb-gh">刷新</button>
      <button id="lb-list-back" class="lb-gh">返回</button>
    </div>
    <div class="lb-row hidden" id="lb-auth-row" style="margin-top:12px;">
      <label>VibeHub</label>
      <span id="lb-auth-st" style="flex:1;font-size:12px;color:#8a7f66;line-height:1.5;">—</span>
      <button id="lb-auth-btn" class="lb-gh" style="padding:8px 14px;width:auto;">登录 / 重新授权</button>
      <a id="lb-auth-url" class="lb-gh" href="#" target="_blank" rel="noopener"
         style="padding:8px 14px;width:auto;display:none;text-decoration:none;">授权页</a>
    </div>
    <div class="lb-row hidden" id="lb-work-row" style="margin-top:-2px;">
      <label>项目 slug</label>
      <input type="text" id="lb-work-in" placeholder="填错了会一直「未授权」">
      <button id="lb-work-btn" class="lb-gh" style="padding:8px 14px;width:auto;">保存并刷新</button>
    </div>
    <div class="lb-tip" id="lb-list-tip">提示：没登录也能联机，会自动用一个本机身份。</div>
  `);

  // ---------- 3. 新建房间 ----------
  // 遮罩的 id 不能跟房间列表里那个「新建房间」按钮都叫 lb-new ——
  // 同页出现两个相同 id，按 id 取元素时就可能取到遮罩而不是按钮，按钮会点不动。
  const mNew = mkMask("lb-new-mask", `
    <h2>新建房间</h2>
    <p class="lb-sub">房间号会自动生成，也可以自己改。私人房间不会出现在列表里，只能输房间号进入。</p>
    <div class="lb-row"><label>房间名</label><input type="text" id="lb-nm" placeholder="比如：一起死在 Level 0" maxlength="20"></div>
    <div class="lb-row"><label>房间号</label><input type="text" id="lb-cd" maxlength="6"></div>
    <div class="lb-row"><label>房间密码</label><input type="text" id="lb-pw" maxlength="24" placeholder="私人联机必填（公开房间可留空）"></div>
    <div class="lb-row"><label>可见性</label>
      <div class="lb-seg">
        <button id="lb-pub" class="on">公开联机</button>
        <button id="lb-priv">私人联机</button>
      </div>
    </div>
    <div class="lb-row"><label>最大人数</label>
      <input type="number" id="lb-max" value="4" min="2" max="8" step="1" style="max-width:110px;">
      <span style="font-size:12px;color:#6f6647;">最低 2 人</span>
    </div>
    <div class="lb-err" id="lb-new-err"></div>
    <div class="lb-acts">
      <button id="lb-create" class="lb-pri">创建</button>
      <button id="lb-new-back" class="lb-gh">返回</button>
    </div>
  `);

  // ---------- 4. 房间内 ----------
  const mRoom = mkMask("lb-room", `
    <div class="lb-head">
      <h2 id="lb-room-t">房间</h2>
      <button id="lb-room-x" class="lb-x" title="收起（房间还开着）" type="button">×</button>
    </div>
    <p class="lb-sub" id="lb-room-s"></p>
    <div class="lb-row" id="lb-opt-row" style="margin-top:2px;">
      <label>难度</label>
      <div class="lb-seg" id="lb-diff-seg">
        <button data-di="0">简单</button>
        <button data-di="1" class="on">普通</button>
        <button data-di="2">困难</button>
        <button data-di="3">极端</button>
      </div>
      <span id="lb-opt-owner" style="font-size:12px;color:#8a8270;"></span>
    </div>
    <div class="lb-row" id="lb-real-row" style="margin-top:-4px;">
      <label>写实</label>
      <button id="lb-real" class="lb-gh" style="padding:8px 14px;width:auto;">写实：关</button>
      <span style="font-size:12px;color:#8a8270;">按档案还原层级的空间性质</span>
    </div>
    <div class="lb-tip" id="lb-real-tip" style="line-height:1.6;"></div>
    <div class="lb-pair hidden" id="lb-pair">
      <div class="hd">跨设备配对 —— 每个队友各配一次</div>
      <div class="lb-row" style="margin-top:0;">
        <label>我的 IP</label>
        <span id="lb-p-myip" style="font-size:13px;color:#6f6647;flex:1;">点「查一下」，程序会自己报出来</span>
        <button id="lb-p-ipbtn" class="lb-gh" style="padding:8px 14px;width:auto;">查一下</button>
        <button id="lb-p-ipcopy" class="lb-gh" style="padding:8px 14px;width:auto;display:none;">复制</button>
      </div>
      <div class="lb-row" style="margin-top:-6px;">
        <label></label>
        <span style="font-size:12px;color:#8a8270;">查到之后会自动写进邀请码 —— 队友什么都不用填。（Chrome 会伪装地址，点一下会申请一次麦克风权限用来读出真地址，拿到就立刻关掉，不录音）</span>
      </div>
      <div class="lb-row" style="margin-top:0;">
        <label>邀请码</label>
        <button id="lb-p-inv" class="lb-gh" style="padding:8px 14px;width:auto;">生成邀请码</button>
      </div>
      <textarea id="lb-p-invbox" class="lb-ta" readonly style="display:none;"></textarea>
      <div class="lb-row" id="lb-p-copyrow" style="display:none;">
        <button id="lb-p-copy" class="lb-gh" style="padding:8px 14px;width:auto;">复制邀请码</button>
        <span style="font-size:12px;color:#6f6647;">用微信 / QQ 发给队友，让他粘进他那边的框里</span>
      </div>
      <div class="lb-row">
        <label>回执码</label>
        <input type="text" id="lb-p-rep" placeholder="队友发回来的一段码，粘到这里">
        <button id="lb-p-ok" class="lb-pri" style="padding:8px 14px;width:auto;">接通</button>
      </div>
      <div class="lb-row">
        <label>队友 IP<small style="font-weight:400;color:#8a8270;">（选填）</small></label>
        <input type="text" id="lb-p-ip" placeholder="一般不用填 —— 回执码里自带队友的 IP">
      </div>
      <div class="lb-err" id="lb-p-err"></div>
      <div class="st" id="lb-p-st" style="display:none;"></div>
    </div>
    <div class="lb-list" id="lb-mems"></div>
    <div class="lb-err" id="lb-room-err"></div>
    <div class="lb-acts">
      <button id="lb-start" class="lb-pri">开始游戏</button>
      <button id="lb-enter" class="lb-pri dim">进入</button>
      <button id="lb-room-back" class="lb-gh">收起</button>
      <button id="lb-close-room" class="lb-gh">关闭房间</button>
      <button id="lb-leave" class="lb-gh">离开房间</button>
    </div>
    <div class="lb-tip">「收起」只是把这个界面关掉，房间还开着 —— 从主菜单「联机游玩」再进来就能回到这个房间。</div>
    <div class="lb-tip">游戏里按 V 可以打开成员列表，发起投票把人踢出去（支持票要达到房间人数的一半）。</div>
  `);

  // ---------- 3.5 客人：把回执码发回给房主 ----------
  const mReply = mkMask("lb-reply", `
    <h2>把这段回执码发回给房主</h2>
    <p class="lb-sub">复制下面这整段，用微信 / QQ 发回给房主。房主粘进他的「回执码」框并点「接通」，你们就连上了 —— 这一步不用关掉本页面。</p>
    <textarea id="lb-r-box" class="lb-ta" readonly></textarea>
    <div class="lb-err" id="lb-r-err">正在等房主接通……</div>
    <div class="lb-acts">
      <button id="lb-r-copy" class="lb-pri">复制</button>
      <button id="lb-r-back" class="lb-gh">取消</button>
    </div>
  `);

  // ---------- 游戏内：高层提示弹窗 ----------
  const hl = document.createElement("div");
  hl.className = "hl-pop hidden";
  hl.id = "hl-pop";
  hl.innerHTML = '<div class="t" id="hl-t"></div><div class="b">' +
    '<button class="ok" id="hl-ok">确定</button><button class="no" id="hl-no">拒绝</button></div>';
  document.body.appendChild(hl);

  // ---------- 游戏内：成员条 ----------
  const bar = document.createElement("div");
  bar.className = "mp-bar hidden";
  bar.id = "mp-bar";
  document.body.appendChild(bar);

  const show = (d) => d && d.classList.remove("hidden");
  const hide = (d) => d && d.classList.add("hidden");

  let isPub = true;
  let hostTok = "";            // 房主的 token（成员表里 is_host 那个）
  let hostPos = null;          // 房主在游戏里的位置 —— 客人"进入"时生成在它边上
  let gameStarted = false;     // 房主是否已经开局

  // ---- 联机房间设置：难度 + 写实 ----
  // 以前联机是写死普通难度（__beginMulti 里 setDiff(1)），现在房主可以在这面板里选。
  // 写实开关按档案还原层级的空间性质；客人由房主同步，自己不能改。
  const REAL_TIP = "作用：开启后 Level 0 / Level ! 触发孤立效应（每个玩家都在单独的副本里，永远不会相遇）；" +
    "Level 37 是非线性空间，每个人进来都会出现在离其他玩家很远的地方。" +
    "另外，困难 / 极端难度下不能传送到队友所在的层级。";
  let mpDiff = 1;
  let mpReal = false;
  try {
    const dd = parseInt(localStorage.getItem("br_mp_diff") || "", 10);
    if (dd >= 0 && dd < 4) mpDiff = dd;
    mpReal = localStorage.getItem("br_mp_real") === "1";
  } catch (e) { /* 忽略 */ }
  window.__mpDiffIdx = mpDiff;
  window.__mpReal = mpReal;

  function isHostHere() { return !!(Net.room && Net.room.isHost); }
  function isoLevel(lv) { const s = String(lv); return s === "0" || s === "bang"; }
  function isoHere(lv) { return !!mpReal && isoLevel(lv); }
  function followBlocked() { return mpDiff >= 2; }   // 困难 / 极端：不能传送到队友那一层

  function paintOpts() {
    const seg = $("lb-diff-seg");
    if (seg) [...seg.querySelectorAll("button[data-di]")].forEach((b) => {
      b.classList.toggle("on", Number(b.dataset.di) === mpDiff);
      b.disabled = !isHostHere();
    });
    const rb = $("lb-real");
    if (rb) {
      rb.textContent = mpReal ? "写实：开" : "写实：关";
      rb.classList.toggle("on", mpReal);
      rb.disabled = !isHostHere();
      rb.title = REAL_TIP;
    }
    const tip = $("lb-real-tip");
    if (tip) tip.textContent = REAL_TIP + (mpReal ? "（当前：已开启）" : "（当前：关闭）");
    const own = $("lb-opt-owner");
    if (own) own.textContent = isHostHere() ? "你是房主，可修改" : "由房主设定";
  }
  function applyOptsToGame() {
    window.__mpDiffIdx = mpDiff;
    window.__mpReal = mpReal;
    if (window.__setDiff) { try { window.__setDiff(mpDiff, false); } catch (e) { /* 忽略 */ } }
  }
  function pushOpts() {
    try { Net.broadcast({ t: "roomopt", diff: mpDiff, real: mpReal }, true); } catch (e) { /* 忽略 */ }
  }
  function takeOpts(d) {
    if (isHostHere()) return;              // 房主自己是权威，别被客人回写
    mpDiff = Math.max(0, Math.min(3, d.diff | 0));
    mpReal = !!d.real;
    applyOptsToGame();
    paintOpts();
  }

  const segDiff = $("lb-diff-seg");
  if (segDiff) segDiff.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest("button[data-di]");
    if (!b || !isHostHere()) return;
    mpDiff = Number(b.dataset.di) || 0;
    try { localStorage.setItem("br_mp_diff", String(mpDiff)); } catch (err) { /* 忽略 */ }
    applyOptsToGame(); paintOpts(); pushOpts();
    if (window.__toast) window.__toast("联机难度已设为「" + ["简单", "普通", "困难", "极端"][mpDiff] + "」");
  });
  const btnReal = $("lb-real");
  if (btnReal) btnReal.addEventListener("click", () => {
    if (!isHostHere()) return;
    mpReal = !mpReal;
    try { localStorage.setItem("br_mp_real", mpReal ? "1" : "0"); } catch (err) { /* 忽略 */ }
    applyOptsToGame(); paintOpts(); pushOpts();
    if (window.__toast) window.__toast(mpReal ? "写实模式已开启 —— Level 0 / Level ! 的孤立效应生效" : "写实模式已关闭");
  });

  function openMode() {
    const e = $("lb-mode-err"); if (e) e.textContent = "";
    // 房间还开着（点了「收起」退回来的）：给一个直达入口，不用重走一遍流程
    const rb = $("lb-mode-room");
    if (rb) {
      const inRoom = !!(Net.room && Net.room.code);
      rb.classList.toggle("hidden", !inRoom);
      if (inRoom) rb.textContent = "回到我刚才的房间 · " + Net.room.code;
    }
    show(mMode);
  }
  function openList() {
    hide(mMode); hide(mModeLan); hide(mRoom); hide(mNew); hide(mReply); show(mList);
    const sub = $("lb-list-sub");
    const pair = Net.isPair();
    const lbl = document.querySelector('#lb-list .lb-row label');
    if (sub) {
      sub.textContent = pair
        ? "跨设备配对：不靠扫描找房间 —— 要跟谁玩，就把邀请码发给他；你是房主就点「新建房间」。"
        : Net.isVibe()
          ? "下面是网上的公开房间（VibeHub 联机）。私人房间不会出现在这里 —— 只能输房间号进入。"
          : "下面是在同一台机器上识别到的公开房间。私人房间不会出现在这里 —— 只能输房间号进入。";
    }
    if (lbl) lbl.textContent = pair ? "邀请码" : "房间号";
    const ipRow = $("lb-gip-row");
    if (ipRow) ipRow.classList.toggle("hidden", !pair);
    const inp = $("lb-code-in");
    if (inp) {
      inp.value = "";
      inp.placeholder = pair ? "把房主发给你的邀请码粘进来" : "输入房间号后回车";
      inp.setAttribute("maxlength", pair ? "100000" : "8");
      inp.style.fontFamily = pair ? "ui-monospace,monospace" : "";
      inp.style.fontSize = pair ? "11px" : "";
    }
    const jb = $("lb-join");
    if (jb) jb.textContent = pair ? "接受邀请" : "进入";
    const box = $("lb-rooms");
    if (box) {
      if (pair) {
        box.innerHTML = '<div class="lb-empty">跨设备配对不用找房间 —— 房主点「新建房间」，' +
          "然后把生成的邀请码发给队友；队友把邀请码粘到上面的框里。</div>";
      } else refreshRooms();
    }
    const err = $("lb-list-err");
    if (err) err.textContent = "";
    const tip = $("lb-list-tip");
    if (tip) {
      tip.textContent = Net.isVibe()
        ? "网络联机要用 VibeHub 账号登录 —— 没登录时，建房间 / 进房间都会被服务器挡回来（提示「未授权」）。"
        : "提示：没登录也能联机，会自动用一个本机身份。";
    }
    updateAuthRow();
  }

  // VibeHub 登录态 —— 401「未授权」的根源就在这儿，得让玩家一眼看见
  function updateAuthRow() {
    const row = $("lb-auth-row"), st = $("lb-auth-st");
    const wrow = $("lb-work-row"), win = $("lb-work-in");
    if (!row || !st) return;
    const on = !!(Net.isVibe && Net.isVibe());
    row.classList.toggle("hidden", !on);
    if (wrow) wrow.classList.toggle("hidden", !on);
    if (win && !win.value) win.value = (Net.vibeWork ? Net.vibeWork() : "") || "";
    if (!on) return;
    const ok = Net.vibeLoggedIn ? Net.vibeLoggedIn() : false;
    const u = Net.vibeUser ? Net.vibeUser() : null;
    const work = (Net.vibeWork ? Net.vibeWork() : "") || "";
    st.innerHTML = (ok
      ? '<span style="color:#8fd06a;">已登录：' + escapeHtml((u && (u.name || u.id)) || "VibeHub 账号") + "</span>"
      : '<span style="color:#e08a6a;">还没登录 —— 建房间 / 进房间会报「未授权」</span>')
      + '<br><span style="color:#6f6647;">项目 slug：' + escapeHtml(work || "（没填）") +
      "　（要项目 slug，不是 /works/ 或 /play/ 后面那串作品 ID）</span>";
    // 没登录时额外给一个「授权页」直链 —— 弹窗被拦时，至少还能手动跳过去登录
    const a = $("lb-auth-url");
    if (a) {
      let url = "";
      try { url = Net.vibeAuthUrl ? Net.vibeAuthUrl() : ""; } catch (e) { /* 忽略 */ }
      if (url) a.setAttribute("href", url);
      a.style.display = ok ? "none" : "";
      a.title = url || "";
    }
  }

  function refreshRooms() {
    const box = $("lb-rooms");
    box.innerHTML = '<div class="lb-empty">正在找房间……</div>';
    Net.listRooms().then((rooms) => {
      if (!rooms.length) {
        const why = rooms.__err
          ? ("没找到房间（" + escapeHtml(rooms.__err) + "）—— 点「新建房间」自己开一个")
          : (Net.isVibe() ? "网上还没有公开房间 —— 点「新建房间」自己开一个"
                          : "没找到房间 —— 点「新建房间」自己开一个");
        box.innerHTML = '<div class="lb-empty">' + why + "</div>";
        return;
      }
      box.innerHTML = rooms.map((r) => {
        const n = r.n || 0, mx = r.max || 4;
        return '<div class="lb-item" data-code="' + r.code + '">' +
          '<span class="code">' + r.code + "</span>" +
          '<span class="nm">' + escapeHtml(r.name || "未命名房间") + "</span>" +
          '<span class="n">' + n + " / " + mx + "</span></div>";
      }).join("");
      [...box.querySelectorAll(".lb-item")].forEach((it) => {
        it.addEventListener("click", () => doJoin(it.getAttribute("data-code")));
      });
    }).catch((e) => {
      const m = String((e && e.message) || e || "");
      const need = Net.isVibe() && Net.vibeLoggedIn && !Net.vibeLoggedIn();
      box.innerHTML = '<div class="lb-empty">' + escapeHtml(m) +
        (need ? '<br><span style="color:#8fd06a;">先点上面的「登录 / 重新授权」</span>' : "") + "</div>";
      updateAuthRow();
    });
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function doJoin(code) {
    code = String(code || "").trim();
    if (!code) { $("lb-list-err").textContent = Net.isPair() ? "把房主发给你的邀请码粘进来" : "请输入房间号"; return; }
    $("lb-list-err").textContent = "正在进入……";
    // 跨设备配对：粘进来的是邀请码 —— 先换出一段回执码，等房主点「接通」
    if (Net.isPair()) {
      $("lb-list-err").textContent = "正在生成回执码……";
      Net.pairAccept(code, ($("lb-gip") && $("lb-gip").value) || "").then((rep) => {
        $("lb-list-err").textContent = "";
        $("lb-r-box").value = rep;
        $("lb-r-err").textContent = Net._pairUsedIp
          ? "正在等房主接通……（已自动用上房主的 IP " + Net._pairUsedIp + "）"
          : "正在等房主接通……";
        hide(mList); show(mReply);
        clearInterval(replyTimer);
        let waited = 0;
        replyTimer = setInterval(() => {
          waited += 500;
          if (Net.pairReady()) {
            clearInterval(replyTimer); replyTimer = null;
            const m = (Net.bus && Net.bus.metaOf) ? Net.bus.metaOf() : null;
            Net.joinRoom(m ? m.code : "").then(() => {
              hide(mReply); openRoom();
            }).catch((e) => { $("lb-r-err").textContent = String(e.message || e); });
          } else if (waited > 180000) {
            clearInterval(replyTimer); replyTimer = null;
            $("lb-r-err").textContent = "等太久了 —— 确认房主已经把你的回执码粘进去并点了「接通」";
          } else if (waited >= 15000 && Net.pairIceState && Net.pairIceState() === "failed") {
            // 客人看不到房主那边的报错，只能自己盯着 ICE —— 断了就直说，别让他干等
            clearInterval(replyTimer); replyTimer = null;
            let m = "连不上房主（ICE 已失败）。";
            const dg = Net.pairIceDiag ? Net.pairIceDiag() : "";
            if (dg) m += "\n" + dg;
            m += "\n\n两台设备要在同一个 WiFi 下；路由器开了「AP 隔离」也会连不上。";
            m += "\n（双方的配对码都会自动带上各自的 IP，一般不用手动填任何 IP。）";
            m += "\n实在不行改用「网络联机」（VibeHub），那个走中继，不依赖局域网。";
            $("lb-r-err").textContent = m;
          }
        }, 500);
      }).catch((e) => { $("lb-list-err").textContent = String(e.message || e); });
      return;
    }
    Net.joinRoom(code).then(() => {
      $("lb-list-err").textContent = "";
      openRoom();
    }).catch((e) => { $("lb-list-err").textContent = String(e.message || e); });
  }
  let replyTimer = null;

  // ---------- 复制（配对码很长，必须能一键复制） ----------
  function copyText(txt, errEl) {
    const ok = () => {
      if (!errEl) return;
      errEl.style.color = "#8fd06a"; errEl.textContent = "已复制";
      setTimeout(() => { errEl.style.color = ""; errEl.textContent = ""; }, 1800);
    };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(String(txt || "")).then(ok).catch(() => fallbackCopy(txt, errEl));
        return;
      }
    } catch (e) { /* 忽略 */ }
    fallbackCopy(txt, errEl);
  }
  function fallbackCopy(txt, errEl) {
    try {
      const ta = document.createElement("textarea");
      ta.value = String(txt || "");
      ta.style.position = "fixed"; ta.style.left = "-9999px";
      document.body.appendChild(ta); ta.select();
      const done = document.execCommand("copy");
      document.body.removeChild(ta);
      if (done) { if (errEl) { errEl.textContent = "已复制"; setTimeout(() => { errEl.textContent = ""; }, 1800); } }
      else if (errEl) errEl.textContent = "复制失败 —— 手动选中上面的框，按 Ctrl+C";
    } catch (e) { if (errEl) errEl.textContent = "复制失败 —— 手动选中上面的框，按 Ctrl+C"; }
  }
  function pairStatus(txt) {
    const st = $("lb-p-st");
    if (!st) return;
    st.textContent = txt || "";
    st.style.display = txt ? "" : "none";
  }

  function openRoom() {
    hide(mList); hide(mNew); show(mRoom);
    const r = Net.room;
    $("lb-room-t").textContent = (r.name || "房间") + " · " + r.code;
    $("lb-room-s").textContent = (r.pub ? "公开联机" : "私人联机") +
      " · 最多 " + r.max + " 人 · " + (r.isHost ? "你是房主" : "房主是别人") +
      (Net.bus.kind === "vibe" ? " · VibeHub 网络联机"
        : Net.bus.kind === "pair" ? " · 局域网直连（配对码）" : " · 局域网联机");
    // 配对区只在「跨设备配对 + 我是房主」时出现 —— 客人不用配对，他只要等接通
    // 注意：这个块天生带着 .hidden 类，而 .hidden 是 display:none!important，
    // 用 style.display = "" 去显示它没有用（内联样式压不过 !important），必须用 classList。
    const pb = $("lb-pair");
    if (pb) pb.classList.toggle("hidden", !(Net.isPair() && r.isHost));
    $("lb-start").style.display = r.isHost ? "" : "none";
    // 房主看到"开始游戏"，客人看到"进入"（默认灰色，等房主开局）
    if (r.isHost) { const en = $("lb-enter"); if (en) en.classList.add("hidden"); }
    else freeEnter();
    // 房主只看到"关闭房间"，客人只看到"离开房间" —— 以前两个按钮都在，
    // 房主点"离开房间"其实等于解散，容易误以为点错了没反应
    const cl = $("lb-close-room"), lv = $("lb-leave");
    if (cl) cl.style.display = r.isHost ? "" : "none";
    if (lv) lv.style.display = r.isHost ? "none" : "";
    renderMems();
    paintOpts();
    if (r.isHost) pushOpts();              // 晚进房的人也能立刻拿到房主的设置
    Net.onPeersChange = function () { if ($("lb-room") && !$("lb-room").classList.contains("hidden")) renderMems(); };
    clearInterval(memTimer);
    memTimer = setInterval(renderMems, 2500);
  }
  let memTimer = null;
  let seenMems = null;         // 上一轮看到过的成员，用来发现"谁退出了"

  function renderMems() {
    // 记下房主的 token —— 靠它认出广播里的哪一条是房主的位置
    try {
      const mems = (Net._members || []);
      const h = mems.find((m) => m && (m.is_host || m.host));
      if (h && h.token) hostTok = h.token;
      else if (Net.room && Net.room.isHost && Net.self) hostTok = Net.self.token;
    } catch (e) { /* 忽略 */ }
    const box = $("lb-mems");
    // 房主每轮把难度 / 写实重发一次 —— 后加入的人不用等下一次改动才收到
    if (isHostHere()) pushOpts();
    if (!box) return;
    const list = Net.peerList();
    // 有人走了：名字从列表里消失，右上角弹一条"XXX 已退出"
    try {
      const now = {};
      for (const p of list) if (!p.self) now[p.token] = p.name || "队友";
      if (seenMems) {
        for (const tk in seenMems) {
          if (!(tk in now)) {
            const nm = seenMems[tk];
            if (window.__toast) window.__toast(nm + " 已退出");
            if ($("lb-room-err")) $("lb-room-err").textContent = nm + " 已退出";
          }
        }
      }
      seenMems = now;
    } catch (e) { /* 忽略 */ }
    box.innerHTML = list.map((p) =>
      '<div class="lb-mem"><span class="nm">' + escapeHtml(p.name) +
      (p.self ? ' <span class="tag">你</span>' : "") +
      (p.host ? ' <span class="tag host">房主</span>' : "") + "</span>" +
      (p.self ? "" : '<button data-t="' + escapeHtml(p.token) + '">踢出</button>') +
      "</div>").join("");
    [...box.querySelectorAll("button[data-t]")].forEach((b) => {
      const tok = b.getAttribute("data-t");
      const vs = Net.votes && Net.votes.get(tok);
      const need = (Net.voteNeed ? Net.voteNeed(tok) : Math.ceil(Net.memberCount() / 2));
      const cnt = vs ? vs.size : 0;
      // 自己已经投过票了才锁住；别人发起的票要能附议，不然永远凑不够
      const mine = !!(vs && Net.self && vs.has(Net.self.token));
      b.textContent = cnt ? ("附议 " + cnt + "/" + need) : "踢出";
      b.disabled = mine;
      if (mine) return;
      b.addEventListener("click", () => {
        if (vs && vs.size) Net.addVote(tok); else Net.startVote(tok);
        b.disabled = true;
        renderMems();
      });
    });
  }

  // 收到别人的票：先让 Net 自己记一票，再刷新界面（别把记票的逻辑盖掉）
  const _netVote = Net.onVote;
  Net.onVote = function (d) {
    if (typeof _netVote === "function") _netVote(d);
    if (d && d.target === (Net.self && Net.self.token) && $("lb-room-err")) {
      $("lb-room-err").textContent = "有人发起了把你踢出去的投票……";
    } else if ($("lb-room-err")) {
      $("lb-room-err").textContent = "有人发起了投票，正在等票数……";
    }
    renderMems();
  };

  // ---------- 绑定 ----------
  $("lb-lan").addEventListener("click", () => { hide(mMode); show(mModeLan); });
  $("lb-lan-self").addEventListener("click", () => { Net.init("lan"); openList(); });
  $("lb-lan-pair").addEventListener("click", () => { Net.init("pair"); openList(); });
  $("lb-lan-back").addEventListener("click", () => { hide(mModeLan); show(mMode); });
  // 网络联机：先初始化 VibeHub SDK（异步：要 init + 认项目 slug + 登录授权），
  // 失败就把原因写在按钮下面，不静默、也不退回局域网冒充网络联机。
  // 【要先登录】SDK 的 /api/sdk/* 全部要 Bearer token；不登录就是 401「未授权」。
  $("lb-net").addEventListener("click", () => {
    const err = $("lb-mode-err");
    err.textContent = "正在连接 VibeHub……";
    $("lb-net").disabled = true;
    Net.init("vibe").then(() => {
      $("lb-net").disabled = false;
      err.textContent = "";
      openList();
    }).catch((e) => {
      $("lb-net").disabled = false;
      const m = String((e && e.message) || e || "连接失败");
      err.textContent = m;
      // 卡在这一步（SDK 没加载 / 未授权 / slug 不对）也要给一条能走的路：
      // 把 VibeHub 授权页直接摆出来，玩家可以自己去那边登录。
      const vl = $("lb-mode-vibelink");
      if (vl) {
        let url = "";
        try { url = Net.vibeAuthUrl ? Net.vibeAuthUrl() : ""; } catch (err2) { /* 忽略 */ }
        if (url && /未授权|VibeHub|slug|SDK|弹窗|登录/i.test(m)) {
          vl.innerHTML = '也可以直接去 VibeHub 授权页登录：' +
            '<a href="' + url + '" target="_blank" rel="noopener" style="color:#8fd06a;">' + url + '</a>' +
            '（登录完回到本页，再点一次「网络联机」）。主菜单「账号」里也有同一个入口。';
          vl.classList.remove("hidden");
        } else {
          vl.classList.add("hidden");
        }
      }
      // 登录没过也照样开列表 —— 里面有「登录 / 重新授权」按钮，
      // 让玩家能再点一次（弹窗被拦时只能靠手动点）。
      if (Net.isVibe()) { openList(); const e2 = $("lb-list-err"); if (e2) e2.textContent = m; }
    });
  });
  // 手动登录 / 重新授权（401「未授权」时的后路）
  $("lb-auth-btn").addEventListener("click", () => {
    const btn = $("lb-auth-btn"), st = $("lb-auth-st");
    btn.disabled = true;
    if (st) st.textContent = "正在打开登录窗口……";
    // 优先走 SDK（弹窗带 PKCE，回来能自动接上 token）；
    // SDK 没初始化时退化成直接开授权页，不至于点了没反应
    const p = Net.vibeLoginJump ? Net.vibeLoginJump(true) : Net.vibeLogin(true);
    p.then((u) => {
      btn.disabled = false;
      updateAuthRow();
      const e2 = $("lb-list-err"); if (e2) e2.textContent = "";
      refreshRooms();
    }).catch((e) => {
      btn.disabled = false;
      const m = String((e && e.message) || e || "登录失败");
      if (st) st.textContent = m;
      const e2 = $("lb-list-err"); if (e2) e2.textContent = m;
    });
  });
  // 改项目 slug —— 填错会一直「未授权」，所以给个就地修改的口子
  $("lb-work-btn").addEventListener("click", () => {
    const v = (($("lb-work-in") && $("lb-work-in").value) || "").trim();
    const e2 = $("lb-list-err");
    if (!v) { if (e2) e2.textContent = "项目 slug 不能为空"; return; }
    try { localStorage.setItem("BACKROOMS_WORK", v); } catch (e) { /* 忽略 */ }
    if (e2) e2.textContent = "已保存 —— 正在刷新（如果网址上带着 ?work= 参数，它会盖过这里填的）……";
    setTimeout(() => { try { location.reload(); } catch (e) { /* 忽略 */ } }, 600);
  });
  $("lb-mode-back").addEventListener("click", () => hide(mMode));
  // 收起之后要能回来 —— 房间还开着就直接回房间界面
  $("lb-mode-room").addEventListener("click", () => {
    if (Net.room && Net.room.code) { hide(mMode); hide(mModeLan); hide(mList); openRoom(); }
  });
  // 房间界面按 ESC = 收起（以前没有任何键盘出口，只能靠鼠标点按钮）
  // 只在房间界面真正可见时接管，且吃掉这次按键，避免顺带触发菜单里别的 ESC 逻辑
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const d = $("lb-room");
    if (!d || d.classList.contains("hidden")) return;
    e.preventDefault(); e.stopPropagation();
    collapseRoom();
  }, true);
  // ---------- 跨设备配对：房主侧（邀请码 / 回执码） ----------
  $("lb-p-inv").addEventListener("click", () => {
    const err = $("lb-p-err"), btn = $("lb-p-inv");
    err.style.color = ""; err.textContent = "正在生成邀请码……";
    btn.disabled = true;
    Net.pairInvite().then((code) => {
      btn.disabled = false;
      err.textContent = "";
      const box = $("lb-p-invbox");
      box.value = code;
      box.style.display = "";
      $("lb-p-copyrow").style.display = "";
      pairStatus("邀请码已生成 —— 发给队友，等他把回执码发回来粘到下面");
    }).catch((e) => {
      btn.disabled = false;
      err.textContent = String((e && e.message) || e);
    });
  });
  $("lb-p-copy").addEventListener("click", () => copyText($("lb-p-invbox").value, $("lb-p-err")));
  // 查本机 IP —— 让玩家不用去命令行敲 ipconfig
  $("lb-p-ipbtn").addEventListener("click", async () => {
    const lab = $("lb-p-myip"), btn = $("lb-p-ipbtn"), cp = $("lb-p-ipcopy");
    btn.disabled = true; lab.textContent = "正在查……";
    let r = null;
    try { r = await Net.myLanIp(true); } catch (e) { r = { ip: "", via: "error" }; }
    btn.disabled = false;
    if (r && r.ip) {
      lab.textContent = r.ip + " —— 已记下，再点一次「生成邀请码」就带上了，队友什么都不用填";
      lab.style.color = "#8fd06a";
      cp.style.display = ""; btn.textContent = "重新查";
      cp.onclick = () => copyText(r.ip, lab);
    } else {
      const why = !r ? "error" : r.via;
      lab.style.color = "#d98b6a";
      lab.textContent = why === "denied"
        ? "浏览器不给读（拒绝了权限）—— 那就改用「网络联机」，那个不用知道 IP"
        : "读不出来 —— 浏览器把地址伪装了。改用「网络联机」（VibeHub）最省事，它走中继，不需要 IP";
      btn.textContent = "再试一次";
    }
  });
  $("lb-p-ok").addEventListener("click", () => {
    const t = String($("lb-p-rep").value || "").trim();
    const err = $("lb-p-err");
    err.style.color = "";
    if (!t) { err.textContent = "把队友发回来的回执码粘到这里"; return; }
    err.textContent = "正在接通……";
    Net.pairReply(t, ($("lb-p-ip") && $("lb-p-ip").value) || "").then((r) => {
      err.textContent = "";
      $("lb-p-rep").value = "";
      let ps = (r && r.nick ? r.nick : "队友") + " 已连上";
      if (r && r.usedIp) ps += "（已自动用上他的 IP " + r.usedIp + "）";
      ps += " —— 还要邀请别人就再点一次「生成邀请码」";
      pairStatus(ps);
      renderMems();
    }).catch((e) => { err.textContent = String((e && e.message) || e); });
  });
  // 客人侧：复制回执码 / 取消
  $("lb-r-copy").addEventListener("click", () => copyText($("lb-r-box").value, $("lb-r-err")));
  $("lb-r-back").addEventListener("click", () => {
    clearInterval(replyTimer); replyTimer = null;
    hide(mReply); openList();
  });
  $("lb-list-back").addEventListener("click", () => { hide(mList); show(Net.isVibe() ? mMode : mModeLan); });
  $("lb-refresh").addEventListener("click", refreshRooms);
  $("lb-new").addEventListener("click", () => {
    hide(mList); show(mNew);
    $("lb-cd").value = String(Math.floor(1000 + Math.random() * 9000));
    $("lb-new-err").textContent = "";
  });
  $("lb-new-back").addEventListener("click", () => { hide(mNew); openList(); });
  $("lb-join").addEventListener("click", () => doJoin($("lb-code-in").value));
  $("lb-code-in").addEventListener("keydown", (e) => { if (e.key === "Enter") doJoin($("lb-code-in").value); });
  $("lb-pub").addEventListener("click", () => { isPub = true; $("lb-pub").classList.add("on"); $("lb-priv").classList.remove("on"); });
  $("lb-priv").addEventListener("click", () => { isPub = false; $("lb-priv").classList.add("on"); $("lb-pub").classList.remove("on"); });
  $("lb-create").addEventListener("click", () => {
    const nm = $("lb-nm").value.trim() || "未命名房间";
    const cd = $("lb-cd").value.trim();
    const pw = ($("lb-pw") ? $("lb-pw").value : "").trim();
    // 私人联机必须设置密码 —— 没填就不让创建
    if (!isPub && !pw) {
      $("lb-new-err").textContent = "私人联机必须设置密码 —— 请在「房间密码」里填一个";
      return;
    }
    try { window.__LB_ROOM_PASS = pw; } catch (e) { /* 忽略 */ }
    let mx = parseInt($("lb-max").value, 10);
    if (!(mx >= 2)) mx = 2;
    if (mx > 8) mx = 8;
    $("lb-new-err").textContent = "正在创建……";
    // 参数顺序：Net.createRoom(name, pub, max, code) —— 包装层内部再转成
    // (name, code, pub, max) 交给总线。写反了房间号会变成 "true" / 人数。
    Net.createRoom(nm, isPub, mx, cd).then(() => {
      $("lb-new-err").textContent = "";
      openRoom();
    }).catch((e) => { $("lb-new-err").textContent = String((e && e.message) || e); });
  });
  // 解散房间：把所有人踢出去，房间从列表里消失
  function dissolveRoom() {
    const code = Net.room && Net.room.code;
    if (!code) { hide(mRoom); openList(); return; }
    // 广播 / leaveRoom 里任何一步抛错，都不能把界面留在屏幕上 ——
    // 以前这里是裸调用，一抛错后面全不执行，房间界面就再也关不掉。
    try { Net.broadcast({ t: "dissolve" }, true); } catch (e) { /* 忽略 */ }
    setTimeout(() => {
      try { Net.leaveRoom(); } catch (e) { /* 忽略 */ }
      clearInterval(memTimer);
      hide(mRoom);
      hideRoomBar();
      openList();
    }, 150);
  }
  // 只是把界面收起来（房间保持开着），从主菜单「联机游玩」能再回来
  function collapseRoom() {
    clearInterval(memTimer);
    hide(mRoom);
    try { window.LobbyChatHide && window.LobbyChatHide(); } catch (e) { /* 忽略 */ }
  }
  $("lb-close-room").addEventListener("click", () => dissolveRoom());
  $("lb-room-back").addEventListener("click", () => collapseRoom());
  $("lb-room-x").addEventListener("click", () => collapseRoom());
  // 房主从游戏里退出（返回主菜单）：房间不解散，回到房间界面 —— 上面有
  // 「开始游戏」和「关闭房间」，要解散得他自己点。
  window.LobbyHostLeft = function () {
    try { Net.broadcast({ t: "hostout" }, true); } catch (e) { /* 忽略 */ }
    hideRoomBar();
    try { if (window.LobbyChatHide) window.LobbyChatHide(); } catch (e) { /* 忽略 */ }
    try { if (MP.detach) MP.detach(); } catch (e) { /* 忽略 */ }
    hide(mList); hide(mNew); hide(mMode);
    show(mRoom);
    const st = $("lb-start"); if (st) st.style.display = "";
    const en = $("lb-enter"); if (en) { en.classList.add("hidden"); en.classList.remove("lit"); }
    gameStarted = false;
    // 房主重开：客人那边的"进入"重新变灰，等下一次开局
    try { Net.broadcast({ t: "hostout2" }, true); } catch (e) { /* 忽略 */ }
    clearInterval(memTimer);
    memTimer = setInterval(renderMems, 2500);
    renderMems();
    if ($("lb-room-s")) $("lb-room-s").textContent = "你已退出这一局 · 点「开始游戏」重新进入，或「关闭房间」解散";
  };
  window.LobbyHideBar = hideRoomBar;

  function hideRoomBar() {
    hide(bar);
    const g = window.__game;
    if (g) g.multi = false;
    window.LobbyMPRemote = null;
  }

  $("lb-leave").addEventListener("click", () => {
    // 房主点"离开"等同于关闭房间；客人点才是自己退出
    if (Net.room && Net.room.isHost) { dissolveRoom(); return; }
    try { Net.leaveRoom(); } catch (e) { /* 忽略 */ }
    clearInterval(memTimer); hide(mRoom); hideRoomBar(); openList();
  });
  // 房主点了开始：客人此刻还在房间界面（MP 还没挂到 game 上），
  // 所以要在最外层单独接一次消息，否则永远收不到开局通知。
  Net.__lobbyRaw = function (tok, d) {
    if (!d) return;
    if (d.t === "roomopt") { takeOpts(d); return; }
    // 聊天消息只在 MP.onMsg 里处理一次就够了 —— 这里再处理会显示成两条
    // （而且第二条有时拿不到 text，看起来就只剩一个玩家名）
    // 房主已经在游戏里了，它每 80ms 会广播一次状态 —— 没进游戏前也先记着，
    // 这样点"进入"时才能生成在房主边上
    if (d.t === "st" || d.t === "all") {
      const list = d.t === "all" ? (d.list || []) : [d];
      for (const it of list) {
        if (!it) continue;
        // 优先信消息自带的 host 标记。成员表里可能残留同名的旧记录（比如
        // 同一浏览器先开后开的标签页抢过 anon id），光比对 hostTok 会认错人。
        const isHost = (it.host === true) || (hostTok ? (it.tok === hostTok) : false);
        if (isHost && typeof it.x === "number") { hostPos = { x: it.x, y: it.y, f: it.f | 0, lv: it.lv }; }
      }
      return;
    }
    if (d.t === "go") {
      gameStarted = true;
      // 房主开了局：客人不自动进，改成点亮"进入"按钮，由客人自己点
      if (!(window.__game && window.__game.phase === "playing")) {
        lightEnter();
      } else {
        // 已经自己先闯进来的：解冻，并跟到房主那一层
        joinHostNow();
      }
      return;
    }
    if (d.t === "hostout") {
      if ($("lb-room-err")) $("lb-room-err").textContent = "房主退出了这一局，房间还开着。";
      return;
    }
    // 房主解散：此刻可能正停在房间界面（还没进游戏），也要把人请出去
    if (d.t === "dissolve") {
      clearInterval(memTimer);
      hide(mRoom); hideRoomBar();
      try { Net.peers && Net.peers.clear(); } catch (e) { /* 忽略 */ }
      Net.room = null;
      hide(mList); hide(mNew);
      try { toast("房主关闭了房间。"); } catch (e) { /* 忽略 */ }
      // 停在房间界面的：退回主菜单；已经在游戏里的：交给 MP.dissolved
      if (!(window.__game && window.__game.phase === "playing")) {
        const m = document.getElementById("menu");
        if (m && m.classList.contains("hidden")) { const fn = window.backToMenu; if (typeof fn === "function") fn(); }
      }
    }
  };

  try { window.__hostPos = function () { return hostPos; }; } catch (e) { /* 忽略 */ }

  // 客人点"进入"：进游戏，并生成在房主边上
  // 进入按钮默认就显示（灰色不可点），房主开局后点亮。
  // 以前它默认 hidden，只靠房主的广播点亮 —— 广播一丢（或客人晚进房）
  // 按钮就永远不出现，客人只能干等着。
  // 客人不用再等房主开房 —— 按钮平时就是可点的。
  // 以前它默认灰色，只靠房主那条 "go" 广播点亮；广播一丢（云信令延迟、
  // 客人晚进房）按钮就永远是灰的，一整节课都进不去。
  function freeEnter() {
    const b = $("lb-enter");
    if (!b) return;
    b.classList.remove("hidden");
    b.classList.remove("dim");
    b.classList.add("lit");
    b.disabled = false;
    const e = $("lb-room-err");
    if (e) e.textContent = gameStarted
      ? "房主已经进游戏了 —— 点「进入」到他身边"
      : "房主还没开 —— 你也可以直接进去先逛着";
  }
  // 房主进来了（或者他自己重开了一局）：解冻，并把人送到房主那一层
  function joinHostNow() {
    const g = window.__game;
    if (!g) return;
    g.freezeLeft = 0;
    try { if (window.__freezeUI) window.__freezeUI(0); } catch (e) { /* 忽略 */ }
    const hp = hostPos;
    if (!hp || hp.lv == null) return;
    if (String(hp.lv) !== String(g.level)) {
      try { if (window.__setLevel) window.__setLevel(hp.lv, hp.f); } catch (e) { /* 忽略 */ }
    } else if (typeof hp.f === "number" && hp.f !== (g.floor | 0)) {
      try { g.floor = hp.f; } catch (e) { /* 忽略 */ }
    }
    // 写实：Level 0 / Level ! 里各人是单独副本，别把人摆到房主旁边
    if (typeof hp.x === "number" && !isoHere(hp.lv)) {
      const T = tileOf(g);
      const cand = [[T, 0], [-T, 0], [0, T], [0, -T], [T, T], [-T, -T], [T, -T], [-T, T]];
      for (const c of cand) {
        const nx = hp.x + c[0], ny = hp.y + c[1];
        if (walkableAt(g, nx, ny)) { g.player.x = nx; g.player.y = ny; return; }
      }
      if (walkableAt(g, hp.x, hp.y)) { g.player.x = hp.x; g.player.y = hp.y; }
    }
  }
  function dimEnter() {
    const b = $("lb-enter");
    if (!b) return;
    b.classList.remove("hidden");
    b.classList.remove("lit");
    b.classList.add("dim");
    b.disabled = true;
  }
  function lightEnter() {
    const b = $("lb-enter");
    if (!b) return;
    b.classList.remove("hidden");
    b.classList.remove("dim");
    b.classList.add("lit");
    b.disabled = false;
    const e = $("lb-room-err");
    if (e) e.textContent = "房主已经进游戏了 —— 点「进入」到他身边";
  }
  $("lb-enter").addEventListener("click", () => {
    hide(mRoom);
    startMultiGame(() => {
      // 进来之后贴着房主落点
      const g = window.__game;
      if (!g) return;
      const hp = hostPos;
      // 房主在别的层级：先切过去，再把人摆到他旁边。
      // 以前只改坐标不切层 —— 房主的坐标落到客人自己的地图上，
      // 结果人卡在墙里，"跟到房主身边"看着像根本没生效。
      if (hp && hp.lv != null && String(hp.lv) !== String(g.level)) {
        try { if (window.__setLevel) window.__setLevel(hp.lv, hp.f); } catch (e) { /* 忽略 */ }
      } else if (hp && hp.lv != null) {
        try { if (typeof hp.f === "number" && hp.f !== (g.floor | 0)) g.floor = hp.f; } catch (e) { /* 忽略 */ }
      }
      // 房主还没进游戏：冻 15 秒，免得大家各跑各的、一开局就失散
      if (!gameStarted && !hostPos) {
        g.freezeLeft = 15;
        try { if (window.__freezeUI) window.__freezeUI(15); } catch (e) { /* 忽略 */ }
      } else {
        g.freezeLeft = 0;
      }
      // 写实：Level 0 / Level ! 各走各的副本，不往房主旁边凑
      if (hp && typeof hp.x === "number" && !isoHere(hp.lv)) {
        // 往房主旁边挪一点，别两个人叠在同一格
        const T = tileOf(g);
        let placed = false;
        const cand = [[T, 0], [-T, 0], [0, T], [0, -T], [T, T], [-T, -T], [T, -T], [-T, T]];
        for (const c of cand) {
          const nx = hp.x + c[0], ny = hp.y + c[1];
          if (walkableAt(g, nx, ny)) { g.player.x = nx; g.player.y = ny; placed = true; break; }
        }
        // 一格都不行就退半格，最后才是直接叠上去
        if (!placed) {
          for (const c of cand) {
            const nx = hp.x + c[0] * 0.5, ny = hp.y + c[1] * 0.5;
            if (walkableAt(g, nx, ny)) { g.player.x = nx; g.player.y = ny; placed = true; break; }
          }
        }
        if (!placed) { g.player.x = hp.x; g.player.y = hp.y; }
      }
    });
  });

  $("lb-start").addEventListener("click", () => {
    hide(mRoom);
    gameStarted = true;
    // 先广播，再自己进 —— 不然客人会一直留在房间界面里等
    Net.broadcast({ t: "go" }, true);
    setTimeout(() => startMultiGame(), 120);
  });

  // ---------- 进入游戏 ----------
  // 潜艇：我上船了吗
  window.LobbySubMark = function (on) {
    MP.subSet = MP.subSet || {};
    MP.subOn = !!on;                                  // 自己这一票要记下来
    if (Net.self && Net.self.token) MP.subSet[Net.self.token] = !!on;
    Net.broadcast({ t: "sub", on: !!on, tok: Net.self.token }, true);
  };
  // 潜艇：现在船上有几个人（含自己）
  window.LobbySubOnboard = function () {
    let n = MP.subOn === true ? 1 : 0;
    const set = MP.subSet || {};
    const mine = Net.self && Net.self.token;
    for (const k in set) if (set[k] && k !== mine) n++;
    return n;
  };

  function startMultiGame(done) {
    applyOptsToGame();                    // 房主选的难度 / 写实，开局这一刻落地
    // 不能再用 pmSolo.click() 了 —— 现在它会先弹出难度面板，
    // 联机的人就卡在那儿进不去游戏（window.__game 一直是 null）。
    if (window.__beginMulti) { window.__beginMulti(); }
    else {
      const pmSolo = $("pm-solo");
      if (pmSolo) pmSolo.click();
      setTimeout(() => { const b = document.getElementById("df-1"); if (b) b.click(); }, 200);
    }
    setTimeout(() => {
      const g = window.__game;
      // 游戏没起来就把房间界面放回来 —— 以前这里直接 return，
      // 界面已经关掉了而游戏又没出现，人就被晾在中间，什么都点不了。
      if (!g) {
        show(mRoom);
        const er = $("lb-room-err");
        if (er) er.textContent = "游戏没启动成功 —— 再点一次，或者点右上角「×」收起回主菜单";
        return;
      }
      g.multi = true;
      show(bar);
      MP.attach(g);
      if (typeof done === "function") { try { done(g); } catch (e) { /* 忽略 */ } }
    }, 400);
  }

  // 那一格能不能站人（给"生成在房主边上"挑位置用）
  // 格子尺寸：地图对象上没有 tile 字段，写死 32 会把格号算错，
  // 导致"生成在房主边上"的偏移全部判定为不可走，最后两个人都叠在同一格。
  function tileOf(g) {
    if (window.CONFIG && window.CONFIG.TILE) return window.CONFIG.TILE;
    if (window.TILE) return window.TILE;
    if (g && g.map && g.map.tile) return g.map.tile;
    return 40;                       // 与 constants.js 保持一致
  }
  function walkableAt(g, x, y) {
    if (!g || !g.map) return false;
    const T = tileOf(g);
    const gx = Math.floor(x / T), gy = Math.floor(y / T);
    const m = g.map;
    // 地图边长叫 size（不是 w / h），网格放在 layers[f]（0 = 地板，1 = 墙）。
    // 地图对象上并没有 grid 字段，取错就会拿到 undefined，候选全被判成不可走。
    const f = g.floor | 0;
    const size = m.size || 0;
    if (!size || gx < 0 || gy < 0 || gx >= size || gy >= size) return false;
    const grid = (m.layers && m.layers[f]) || null;
    if (!grid || !grid[gy]) return false;
    return grid[gy][gx] === 0;
  }

  // ============================================================
  // 游戏内联机规则
  // ============================================================
  const MP = {
    g: null, timer: null, lastLevel: -1, subOn: null,

    detach() {
      try { chatSetMode(false); } catch (e) { /* 忽略 */ }
      clearInterval(this.timer);
      this.timer = null;
      this.g = null;
      this.others = [];
      this.remote = [];
      window.LobbyMPRemote = null;
    },

    attach(g) {
      this.g = g;
      this.lastLevel = g.level;
      this.others = [];
      this.remote = [];
      window.LobbyMPRemote = null;
      try { chatSetMode(true); } catch (e) { /* 忽略 */ }
      Net.onMessage = (tok, d) => this.onMsg(tok, d);
      Net.onKicked = () => this.kicked();
      clearInterval(this.timer);
      // 每 80ms 同步一次自己的状态
      this.timer = setInterval(() => this.tick(), 80);
      this.renderBar();
    },

    tick() {
      const g = this.g;
      if (!g || !Net.room) return;
      // 断线 / 关了页面的人不要一直杵在画面上 —— 8 秒没再收到他的状态就撤掉
      if (this.remote && this.remote.length) {
        const now0 = Date.now();
        this.remote = this.remote.filter((o) => now0 - (o.__t || 0) < 8000);
        window.LobbyMPRemote = this.remote;
      }
      // 自己的状态
      const me = {
        t: "st", tok: Net.self.token, name: Net.self.nick,
        host: !!(Net.room && Net.room.isHost),
        x: Math.round(g.player.x), y: Math.round(g.player.y),
        f: g.floor | 0, lv: g.level,
        hp: Math.round(g.hp), san: Math.round(g.sanity),
        outfit: (localStorage.getItem("br_outfit") || ""),
        fl: !!g.flashlight,                 // 让别人看得见你的手电
        ang: (function () {
          // 朝向：手电光锥要按你面朝的方向画
          try {
            const p2 = g.player;
            if (!p2) return 0;
            if (p2.faceX === 0 && p2.faceY === 0) return Math.PI / 2;
            return Math.atan2(p2.faceY, p2.faceX);
          } catch (e) { return 0; }
        })(),
        dead: g.phase === "dead" || g.phase === "ended",
      };
      // 房主：把自己的位置包和"全员表"合成一条发出去。
      // 以前这是两条独立的广播，而总线（云中继）是按人节流的 ——
      // 位置包先占了这一轮的配额，汇总包就永远被挤掉，客人只看得见自己。
      if (Net.room.isHost) { me.list = this.others; me.opt = { diff: mpDiff, real: mpReal }; }
      Net.broadcast(me);
      // 房主：自己这边也要更新 this.remote —— 以前只有客人更新，
      // 房主端永远是一张空表，于是房主看不见任何人。
      if (Net.room.isHost) {
        // 以前这里每帧把 others 清空 —— 走云时位置包是节流的（约 0.4 秒一个），
        // 于是队友在房主眼里一闪一闪：收到包那帧有人，其余帧全空。
        // 现在保留到超时为止（8 秒没再收到才当他走了）。
        const now = Date.now();
        this.others = this.others.filter((o) => now - (o.__t || 0) < 8000);
        const all = [me].concat(this.others);
        this.remote = all.filter((o) => o.tok !== Net.self.token);
        window.LobbyMPRemote = this.remote;
      }
      // 到了更高的层：告诉别人
      if (g.level !== this.lastLevel) {
        this.lastLevel = g.level;
        Net.broadcast({ t: "lvl", lv: g.level, name: Net.self.nick }, true);
      }
      // 死了：告诉别人"我被吃了"，让他们那边的我消失、并弹一行提示
      if (!this._deadSent && (g.phase === "dead" || g.phase === "ended")) {
        this._deadSent = true;
        Net.broadcast({ t: "eaten", name: Net.self.nick, by: g.deathCause || "实体" }, true);
      }
      if (Net.room.isHost) this.checkHighLevel(g);
      // 房主：把怪物位置广播出去 —— 所有人看到的怪必须一模一样
      if (Net.room.isHost) this.broadcastEntities(g);
      this.renderBar();
    },

    others: [],
    remote: [],

    onMsg(tok, d) {
      const g = this.g;
      if (d && d.t === "roomopt") { takeOpts(d); return; }
      // 聊天消息跟游戏状态无关，没进游戏也要收得到
      if (d && d.t === "chat") {
        try { chatLine(d.name || "队友", String(d.text || "").slice(0, 200), ""); chatShow(); } catch (e) { /* 忽略 */ }
        return;
      }
      if (!g) return;
      if (d.t === "st") {
        if (d.opt && !isHostHere()) takeOpts(d.opt);   // 房主在状态包里也带一份，掉了 roomopt 也能对齐
        d.__t = Date.now();
        this.others = this.others.filter((o) => o.tok !== tok);
        this.others.push(d);
        // 客人：房主那一条里挂着全员表（别的客人也在里面），照着摆
        if (!Net.room.isHost && Array.isArray(d.list)) {
          const now3 = Date.now();
          const all = [d].concat(d.list);
          this.remote = all.filter((o) => o.tok !== Net.self.token);
          for (const o of this.remote) o.__t = now3;
          window.LobbyMPRemote = this.remote;
        } else if (!Net.room.isHost) {
          this.remote = this.remote.filter((o) => o.tok !== tok);
          this.remote.push(d);
          window.LobbyMPRemote = this.remote;
        }
      } else if (d.t === "all" && Array.isArray(d.list)) {
        const now2 = Date.now();
        this.remote = d.list.filter((o) => o.tok !== Net.self.token);
        for (const o of this.remote) o.__t = now2;
        window.LobbyMPRemote = this.remote;
      } else if (d.t === "lvl") {
        // 别人到了更高的层 —— 弹窗问要不要跟过去
        if (d.name && Net.room && !Net.room.isHost) this.offerLevel(d.lv, d.name);
      } else if (d.t === "high") {
        this.offerLevel(d.lv, d.name || "有人");
      } else if (d.t === "hostout2") {
        gameStarted = false;
        freeEnter();
      } else if (d.t === "go") {
        // 房主点了开始 —— 跟着进游戏
        if (!this.g || this.g.phase !== "playing") { hide(mRoom); startMultiGame(); }
      } else if (d.t === "dissolve") {
        // 房主关了房间 —— 所有人都得出去
        this.dissolved();
      } else if (d.t === "devcmd") {
        // 房主用开发者面板给某个人发指令 —— 收到的人在本地执行
        try { if (window.__termRun) window.__termRun(d.cmd, true); } catch (e) { /* 忽略 */ }
      } else if (d.t === "ents") {
        // 客人：照房主给的怪物表摆（大家看到的怪完全一致）
        if (!Net.room.isHost) this.applyEntities(g, d);
      } else if (d.t === "eaten") {
        try { mpNotice(d.name, d.by); } catch (e) { /* 忽略 */ }
        this.remote = (this.remote || []).filter((o) => o.tok !== tok);
        window.LobbyMPRemote = this.remote;
      } else if (d.t === "suball" && d.map) {
        // 房主发的全员登船表
        this.subSet = Object.assign({}, this.subSet || {}, d.map);
      } else if (d.t === "sub") {
        // 潜艇：谁上船了 / 谁还在岸上
        this.subSet = this.subSet || {};
        if (typeof d.on === "boolean" && d.tok) this.subSet[d.tok] = !!d.on;
        // 房主汇总一份全员的登船情况，避免有人漏收
        if (Net.room && Net.room.isHost) {
          Net.broadcast({ t: "suball", map: this.subSet }, true);
        }
      }
    },

    // 怪物全局同步（房主说了算）
    // 以前各人各刷各的，同一个房间里大家看到的怪完全不是一批。
    _entT: 0,
    broadcastEntities(g) {
      this._entT = (this._entT || 0) + 1;
      if (this._entT % 3 !== 0) return;             // 约 3 帧一次，够了
      const list = (g.entities || []).slice(0, 40).map((e) => ({
        k: e.kind, x: Math.round(e.x), y: Math.round(e.y),
        f: e.floor | 0, s: e.state === "chase" ? 1 : 0,
      }));
      Net.broadcast({ t: "ents", lv: g.level, list: list });
    },
    applyEntities(g, d) {
      if (!g || !Array.isArray(d.list)) return;
      if (String(d.lv) !== String(g.level)) return;  // 不在同一层就不管
      const cur = g.entities || [];
      // 数量对齐：多了砍掉，少了按房主给的位置补
      for (let i = cur.length; i > d.list.length; i--) cur.pop();
      for (let i = cur.length; i < d.list.length; i++) {
        const s = d.list[i];
        if (!s) break;
        const T = tileOf(g);
        try { cur.push(new Entity(g.map, Math.round(s.x / T), Math.round(s.y / T), g.level, s.k, s.f | 0)); }
        catch (e) { break; }
      }
      g._entsRemote = true;
      for (let i = 0; i < cur.length; i++) {
        const e = cur[i];
        if (e) e.remoteDriven = true;      // 本地不再驱动它，位置以房主为准
      }
      for (let i = 0; i < d.list.length && i < cur.length; i++) {
        const s = d.list[i], e = cur[i];
        if (!s || !e) continue;
        if (e.kind !== s.k) { try { e.kind = s.k; e.cfg = (CONFIG.MONSTERS[s.k] || CONFIG.MONSTERS.bacterium); } catch (err) { /* 忽略 */ } }
        e.x = s.x; e.y = s.y; e.floor = s.f | 0;
        e.state = s.s ? "chase" : "wander";
      }
    },

    // 高层提示（房主负责检测并广播）
    checkHighLevel(g) {
      if (followBlocked()) return;       // 困难 / 极端：不许靠弹窗传到队友那一层
      if (!Net.room || !Net.room.isHost) return;
      let top = g.level;
      for (const o of this.others) {
        if (typeof o.lv === "number" && isHighLevel(o.lv) && o.lv > top) top = o.lv;
      }
      const lastTop = (this._lastTop == null) ? -1 : this._lastTop;
      if (isHighLevel(top) && top > lastTop) {
        this._lastTop = top;
        Net.broadcast({ t: "high", lv: top, name: "有玩家" }, true);
      }
    },

    offerLevel(lv, name) {
      if (followBlocked()) {
        // 困难 / 极端：不弹窗，也不传送 —— 只偶尔提醒一句为什么没有跟随提示
        const now = Date.now();
        if (now - (this._blockHint || 0) > 9000) {
          this._blockHint = now;
          if (window.__toast) window.__toast("困难 / 极端难度下无法传送到队友所在的层级");
        }
        return;
      }
      if (!isHighLevel(lv)) return;
      if (this.g && this.g.level === lv) return;
      const t = $("hl-t");
      if (!t) return;
      t.innerHTML = "有玩家达到更高的楼层（<b>LEVEL " + lv + "</b>），是否传输至那个层级？";
      this._offerLv = lv;
      show(hl);
    },

    // 房间被解散：回主菜单，房间条也收掉
    dissolved() {
      clearInterval(this.timer);
      hide(hl);
      hide(bar);
      hideRoomBar();
      try { Net.leaveRoom(); } catch (e) { /* 忽略 */ }
      try { Net.peers && Net.peers.clear(); } catch (e) { /* 忽略 */ }
      Net.room = null;
      const g = this.g;
      if (g) g.phase = "dying";
      // 回主菜单
      const fn = window.backToMenu;
      if (typeof fn === "function") fn();
      else { const n = document.getElementById("menu-btn2"); if (n) n.click(); }
      try { toast("房主关闭了房间 —— 你已经回到主菜单。"); } catch (e) { /* 忽略 */ }
    },

    kicked() {
      hide(hl);
      const g = this.g;
      if (g) { g.multi = false; try { g.phase = "dying"; } catch (e) { /* 忽略 */ } }
      clearInterval(this.timer);
      hide(bar);
      try { toast("你被投票踢出了房间。"); } catch (e) { /* 忽略 */ }
    },

    renderBar() {
      if (!Net.room) { hide(bar); return; }
      const list = Net.peerList();
      bar.innerHTML = "<div>房间 <b style='color:#ffd97a'>" + Net.room.code + "</b></div>" +
        list.map((p) => "<div class='" + (p.self ? "me" : "") + "'>" +
          (p.self ? "▸ " : "· ") + escapeHtml(p.name) +
          (p.host ? "（房主）" : "") + "</div>").join("");
    },
  };

  // ===========================================================
  // 房间聊天
  // 鼠标移到屏幕左边 -> 聊天窗口浮出来；点输入框 -> 锁定输入（人物停住）
  // 点游戏画面 -> 锁回游戏，人物能走，但打不了字
  // Enter 发送，Shift+Enter 换行，最多 200 字 / 10 行
  // ===========================================================
  const CHAT_MAX = 200, CHAT_ROWS = 10;
  let chatOn = false;                       // 当前是不是锁在聊天上

  function chatEl() {
    return { wrap: document.getElementById("chat"), log: document.getElementById("chat-log"),
             inp: document.getElementById("chat-in"), cnt: document.getElementById("chat-count"),
             tip: document.getElementById("chat-tip"), hot: document.getElementById("chat-hot"),
             send: document.getElementById("chat-send"), x: document.getElementById("chat-close") };
  }
  // 单人模式没有聊天框：热区和窗口都收起来，免得点不开也关不掉
  let chatAllowed = false;
  function chatSetMode(on) {
    chatAllowed = !!on;
    const c = chatEl();
    if (c.wrap) c.wrap.classList.toggle("hidden", !chatAllowed || !chatVisible);
    if (c.hot) c.hot.classList.toggle("hidden", !chatAllowed);
    if (!chatAllowed) chatLock(false);
  }
  window.LobbyChatMode = chatSetMode;
  let chatVisible = false;             // 用户是不是把窗口打开了
  function chatShow() {
    if (!chatAllowed) return;
    chatVisible = true;
    const w = chatEl().wrap; if (w) w.classList.remove("hidden");
  }
  function chatHideMaybe() {
    // 只有"没锁定输入"时才允许收起来，不然正打字就消失了
    if (chatOn) return;
    chatVisible = false;
    const w = chatEl().wrap; if (w) w.classList.add("hidden");
  }
  // 手动关闭：× 按钮 —— 顺便把输入锁解开，人物能继续动
  function chatClose() {
    chatLock(false);
    chatVisible = false;
    const w = chatEl().wrap; if (w) w.classList.add("hidden");
  }
  function chatLock(on) {
    chatOn = !!on;
    window.__chatFocus = chatOn;
    const c = chatEl();
    if (c.tip) c.tip.textContent = chatOn ? "已锁定输入 · 点游戏画面解锁" : "点输入框开始打字";
    if (chatOn && c.inp) { try { c.inp.focus(); } catch (e) { /* 忽略 */ } }
    else if (c.inp) { try { c.inp.blur(); } catch (e) { /* 忽略 */ } }
    // 锁输入时把方向键状态清掉，不然人会一直走
    if (chatOn && window.__clearKeys) { try { window.__clearKeys(); } catch (e) { /* 忽略 */ } }
  }
  // 右上角提示：XXX 被 XX 吃了
  function mpNotice(name, by) {
    const n = document.getElementById("mp-notice");
    if (!n) return;
    n.textContent = String(name || "队友") + " 被 " + String(by || "实体") + " 吃了";
    n.classList.remove("hidden");
    n.classList.add("show");
    clearTimeout(mpNotice._t);
    mpNotice._t = setTimeout(() => { n.classList.remove("show"); n.classList.add("hidden"); }, 4200);
  }
  window.__mpNotice = mpNotice;

  function chatLine(who, text, cls) {
    const c = chatEl();
    if (!c.log) return;
    const d = document.createElement("div");
    d.className = "ln " + (cls || "");
    d.innerHTML = '<span class="who">' + escapeHtml(who) + "</span>：" + escapeHtml(text);
    c.log.appendChild(d);
    while (c.log.children.length > 80) c.log.removeChild(c.log.firstChild);
    c.log.scrollTop = c.log.scrollHeight;
  }
  function chatSys(t) {
    const c = chatEl();
    if (!c.log) return;
    const d = document.createElement("div");
    d.className = "ln sys";
    d.textContent = t;
    c.log.appendChild(d);
    c.log.scrollTop = c.log.scrollHeight;
  }
  let chatDraft = "";                  // 输入法组合期间 value 不一定更新，靠它兜底
  function chatSend() {
    const c = chatEl();
    if (!c.inp) return;
    // 输入框为空但草稿有内容（手机输入法常见），用草稿补上
    if (!String(c.inp.value || "").trim() && String(chatDraft || "").trim()) c.inp.value = chatDraft;
    let txt = c.inp.value.replace(/\s+$/, "");
    if (!txt.trim()) return;
    txt = txt.slice(0, CHAT_MAX);
    // 最多 10 行
    const lines = txt.split("\n");
    if (lines.length > CHAT_ROWS) txt = lines.slice(0, CHAT_ROWS).join("\n");
    chatLine((Net.self && Net.self.nick) || "我", txt, "me");
    try { Net.broadcast({ t: "chat", name: Net.self && Net.self.nick, text: txt }, true); } catch (e) { /* 忽略 */ }
    c.inp.value = "";
    chatDraft = "";
    if (c.cnt) c.cnt.textContent = "0/" + CHAT_MAX;
  }
  function initChat() {
    const c = chatEl();
    if (!c.wrap) return;
    // 默认收起 —— 什么时候该出现由 chatSetMode 决定（只有联机才开）
    c.wrap.classList.add("hidden");
    if (c.hot) c.hot.classList.add("hidden");
    // 发送按钮（手机上软键盘不一定给回车）
    if (c.send) c.send.addEventListener("click", () => chatSend());
    if (c.x) c.x.addEventListener("click", () => chatClose());
    // 鼠标移到左边：显示
    if (c.hot) {
      c.hot.addEventListener("mouseenter", () => chatShow());
      c.hot.addEventListener("click", () => { chatShow(); chatLock(true); });
    }
    c.wrap.addEventListener("mouseleave", () => chatHideMaybe());
    // 点输入框：锁定输入
    if (c.inp) {
      c.inp.addEventListener("focus", () => { chatLock(true); });
      c.inp.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); chatSend(); }
        // 顺手把行数压在 10 行内
        setTimeout(() => {
          const v = c.inp.value;
          const ls = v.split("\n");
          if (ls.length > CHAT_ROWS) { c.inp.value = ls.slice(0, CHAT_ROWS).join("\n"); }
          if (c.cnt) c.cnt.textContent = (c.inp.value.length) + "/" + CHAT_MAX;
        }, 0);
      });
      c.inp.addEventListener("input", () => {
        const v = c.inp.value;
        chatDraft = v;
        const ls = v.split("\n");
        if (ls.length > CHAT_ROWS) { c.inp.value = ls.slice(0, CHAT_ROWS).join("\n"); }
        if (c.cnt) c.cnt.textContent = c.inp.value.length + "/" + CHAT_MAX;
      });
    }
    // 点游戏画面：锁回游戏
    document.addEventListener("mousedown", (e) => {
      const t = e.target;
      // 画布的 id 是 game（不是 cv）—— 写错的话点画面永远解不开锁，
      // 玩家会卡在"动不了"的状态里
      if (t && (t.id === "game" || t.id === "cv" || t.tagName === "CANVAS")) { if (chatOn) chatLock(false); return; }
      if (c.wrap && c.wrap.contains(t)) return;
      if (chatOn) chatLock(false);
    });
    // 联机结束就收起来
    window.LobbyChatHide = function () { chatLock(false); const w = chatEl().wrap; if (w) w.classList.add("hidden"); };
  }
  initChat();

  // 收到别人的聊天消息
  const _netChatHook = Net.onMessage;

  // 登录后昵称变了，成员条和成员列表要跟着重画
  window.LobbyRefreshBar = function () {
    try { if (MP.g) MP.renderBar(); } catch (e) { /* 忽略 */ }
    try { renderMems(); } catch (e) { /* 忽略 */ }
  };

  // Level 14 不算"高层"（那是个死区，不该被当成进度）
  function isHighLevel(lv) {
    if (typeof lv !== "number") return false;
    if (lv === 14) return false;          // 14 是彩蛋层，不拿来当"更高楼层"提示
    // 以前写成 lv >= 0 —— 等于每一层都算"高层"，刚开局就会弹窗问要不要
    // 传到 LEVEL 0，而且每一帧广播一次，把真正的游戏消息挤在后面。
    return lv >= 10;
  }

  // 弹窗按钮
  $("hl-ok").addEventListener("click", () => {
    hide(hl);
    if (followBlocked()) { if (window.__toast) window.__toast("困难 / 极端难度下无法传送到队友所在的层级"); return; }
    const lv = MP._offerLv;
    const g = window.__game;
    if (g && typeof lv === "number") {
      // 借用管理员终端那条真正可用的切层入口。
      // 以前这里写的是裸的 goToLevel（它在 main.js 的闭包里，lobby.js 取不到），
      // 兜底又写成 g.pendingLevel —— 而游戏里压根没人读这个字段，
      // 结果「跟随队友」的确定按钮一直点了没反应。
      try {
        if (window.__goToLevel) window.__goToLevel(lv);
        else if (typeof window.__setLevel === "function") window.__setLevel(lv);
      } catch (e) { /* 忽略 */ }
      MP.lastLevel = lv;
    }
  });
  $("hl-no").addEventListener("click", () => { hide(hl); });

  // V 键：打开成员列表（发起投票）
  window.addEventListener("keydown", (e) => {
    if (e.code !== "KeyV" || !window.__game || !window.__game.multi) return;
    if (document.activeElement && /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
    openRoom();
  });

  // ---------- 接管「联机游玩」按钮 ----------
  const btnOnline = $("pm-online");
  if (btnOnline) {
    btnOnline.classList.remove("disabled");
    btnOnline.disabled = false;
    btnOnline.querySelector("span").textContent = "局域网（同机多开 / 跨设备配对码）或 VibeHub 网络联机";
    btnOnline.addEventListener("click", () => openMode());
  }

  // listRooms 已经在 net.js 里实现（云 + 本机合并），这里不再覆盖。
  // 以前这里的兜底是个死代码：cloudBus().listRooms() 失败时返回 [] 而不是 reject，
  // catch 分支根本不会进；真进了也会因为 window.__localBus 从未赋值而变成 null。

  window.Lobby = { openMode: openMode };
})();
