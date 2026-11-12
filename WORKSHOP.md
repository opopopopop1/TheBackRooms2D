# 后室创意工坊开发指南（BackRooms Mod API v1）

本作通过 VibeHub 创意工坊加载器（`https://gamesvibe.app/workshop/loader/v1.js`）接收玩家启用的 Mod。
游戏只暴露一个全局对象 **`window.BackroomsMod`**（也可写作 `BackroomsMod`），ApiVersion 为 `1`。

> 能力声明不是安全沙箱：平台不会扫描或限制 Mod 代码。这里列出的"能力"是作者与 Mod 作者之间的
> 开发约定；超出约定的写法（改内部函数、抓 DOM、读本地凭据等）一律视为不兼容 Mod。

---

## 1. 玩家可以制作哪些 Mod

| 类型 | 说明 | 加载阶段 |
|---|---|---|
| 新层级 | 注册一个 100 以上的数字层级，使用内置"管道梦魇"模板生成，可自定义边长、实体、区域名、档案描述 | 启动前 |
| 层级区域 | 给已有层级或自己的层级追加"区域名"，显示在楼层信息里 | 启动前（启动后也可立即生效） |
| 新道具 | 注册可拾取的道具，可选"使用回调" | 启动前注册；启动后可 `giveItem` 直接发放 |
| 新实体 | 注册一种怪物，沿用内置外观模型（猎犬 / 笑魇 / 无面灵 …），可调速度、视野、凶恶程度 | 启动前 |
| 数值模组 | 调整玩家速度、体力、血量上限、理智流失、杏仁水回复、背包容量等白名单数值 | 启动前 |
| 事件脚本 | 订阅 `game-start` / `level-enter` / `player-death`，触发提示、生成实体、发放道具 | 启动前或启动后 |
| 纯表现类 | 提示条文案、播放内置音效 | 启动后 |

不能做的：替换地图生成算法、改写渲染管线、注入自定义 Canvas 绘制、修改存档结构、接管联机同步。

---

## 2. 公共对象、注册函数、事件及参数

### 2.1 全局对象

- `window.BackroomsMod`：Mod API。
- `window.VibeHubWorkshop`：平台加载器（由 loader 提供），只读使用。
  - `beforeStart` / `afterStart`：Promise
  - `markGameReady()`：由游戏调用，Mod 不要自己调
  - `getEnabledMods()`：当前启用的 Mod 描述符数组
  - `getCapability(id)` / `getMod(id)` / `resolve(modId, path)` / `createWorker(modId, path)`

### 2.2 注册函数（全部返回 `{ ok: boolean, error?: string, ... }`）

```js
BackroomsMod.registerLevel({
  id: 90001,              // 必填，2~6 位纯数字，且 >= 100，不得与内置层级冲突
  name: "Level 90001 —— 回声走廊",
  label: "LEVEL 90001",
  size: 72,               // 48~120，默认 72
  entities: true,         // 是否允许刷怪
  monster: "bacterium",   // 单一怪物种类（内置或 Mod 注册的 kind）
  monsters: ["hound"],    // 或者给一个怪物池（最多 8 个）
  classes: ["等级 2", "不安全", "稳定", "少量实体"],   // 最多 4 条，显示在档案
  objective: "找到尽头的门",                          // 最多 300 字
  seed: 123456,           // 可选，地图种子（默认由 id 派生）
  areas: ["走廊 A", "走廊 B"],                        // 可选，区域名
});

BackroomsMod.registerArea("0", "昏黄的回声区");   // 任意已存在/已注册层级，最多 40 个

BackroomsMod.registerItem({
  key: "echo_shard",      // 小写字母开头，2~40 位，不得与内置道具重名
  name: "回声碎片",
  short: "碎片",
  desc: "一片摸起来还在震动的玻璃。",
  effect: "使用后播放一声低语",        // 只显示在背包说明里
  stack: 9,
  consume: true,          // 可选：onUse 返回 true 时扣掉 1 个（默认 false = 可反复使用）
  onUse(ctx) {            // 可选：在背包里双击时触发；ctx = { key, api, state }
    BackroomsMod.playSfx("whisper");
    BackroomsMod.toast("碎片在你手里轻轻响了一下");
    return true;          // 返回 true 才算"用成功了"，配合 consume 才扣数量
  },
});

BackroomsMod.registerEntityKind({
  kind: "echo_walker",    // 小写字母开头，不得与内置实体重名
  name: "回声行者",
  color: "#556677",
  radius: 13,             // 6~30
  speedMul: 1.1,          // 0.3~2.2
  wanderMul: 1.0,         // 0.2~2
  sightMul: 1.0,          // 0.5~2
  lostTime: 5,            // 1~30 秒
  spawnDuration: 1.0,     // 0.2~4 秒
  docile: false,          // true = 不主动攻击（第 11 效应那种）
  model: "hound",         // 可选：沿用内置外观，见 §2.6
});

BackroomsMod.tune({
  PLAYER_SPEED: 230,      // 白名单数值，见 §2.4
  SANITY_DRAIN_DARK: 0.4,
});

BackroomsMod.on("level-enter", (e) => { /* e = { level, floor } */ });
BackroomsMod.on("game-start", (e) => { /* e = { level, ai } */ });
BackroomsMod.on("player-death", (e) => { /* e = { level, floor, cause, killer } */ });
```

### 2.3 运行时函数（游戏启动后调用）

| 函数 | 说明 |
|---|---|
| `BackroomsMod.toast(msg)` | 屏幕下方的提示条 |
| `BackroomsMod.giveItem(key, n)` | 发放道具（n 为 1~99），会立刻刷新背包 |
| `BackroomsMod.spawnEntity(kind)` | 在当前层级刷一只实体（自动挑离玩家较远的地板） |
| `BackroomsMod.goToLevel(level)` | 走完整的切层流程（含过场动画） |
| `BackroomsMod.playSfx(name)` | 播放内置音效，白名单见 §2.5 |
| `BackroomsMod.getState()` | `{ phase, level, floor, hp, sanity, entities, multiplayer, player }` |
| `BackroomsMod.isMultiplayer()` | 当前是否联机对局 |
| `BackroomsMod.getEnabledMods()` | 透传加载器 |
| `BackroomsMod.getCapability(id)` | 透传加载器 |

### 2.4 数值白名单（`tune` 只认这些；超出范围会被夹到边界）

`PLAYER_SPEED`(80~480)、`PLAYER_SPRINT`(120~720)、`STAMINA_MAX`(40~400)、
`STAMINA_DRAIN`(8~120)、`STAMINA_REGEN`(4~120)、`HP_MAX`(20~400)、`SANITY_MAX`(20~400)、
`SANITY_DRAIN_DARK`(0~4)、`SANITY_DRAIN_LIT`(0~2)、`SANITY_DRAIN_ENTITY`(0~8)、
`ALMOND_SANITY`(0~90)、`ALMOND_HP`(0~60)、`BAG_DEFAULT`(10~120)。

### 2.5 音效白名单（`playSfx`）

`footstep`、`splash`、`paper`、`door`、`growl`、`jumpscare`、`heartbeat`、`roar`、`collapse`、
`debris`、`exitChime`、`jazz`、`whisper`、`wind`、`water`、`steam`、`elevator`、
`flickerClick`、`adrenaline`。

### 2.6 可复用外观模型（`registerEntityKind.model`）

`bacterium`、`hound`、`smiler`、`faceling`、`moth`、`rat`、`partypooper`、`jerry`、`worn`、
`kite`、`transporter`、`bride`、`crusher`、`neighborhood`、`kitty`、`mimic`。
不填则使用默认的鞭毛体外观。

---

## 3. 一个最小可运行 Mod

目录结构：

```
echo-mod/
├─ vibehub.mod.json
└─ main.js
```

`vibehub.mod.json`：

```json
{
  "title": "回声碎片",
  "summary": "给 Level 0 加一件会响的碎片，并给走廊起个名字。",
  "description": "演示 BackRooms Mod API v1：注册道具、注册区域、订阅事件。",
  "version": "1.0.0",
  "releaseNotes": "首个版本",
  "entry": "main.js",
  "entryType": "classic",
  "styles": [],
  "loadPhase": "before-start",
  "dependencyIds": [],
  "capabilities": ["item.add", "item.use", "level.area", "event.subscribe", "audio.sfx", "ui.toast"]
}
```

`main.js`：

```js
(function () {
  const Mod = window.BackroomsMod;
  if (!Mod) return;

  const r = Mod.registerItem({
    key: "echo_shard",
    name: "回声碎片",
    short: "碎片",
    desc: "一片摸起来还在震动的玻璃。",
    effect: "使用后播放一声低语",
    stack: 9,
    onUse() {
      Mod.playSfx("whisper");
      Mod.toast("碎片在你手里轻轻响了一下");
      return true;
    },
  });
  if (!r.ok) return;                        // 重名时安静退出，不覆盖别人的东西

  Mod.registerArea("0", "昏黄的回声区");

  Mod.on("game-start", () => {
    Mod.giveItem("echo_shard", 1);
    Mod.toast("你把一片回声碎片塞进了口袋");
  });
})();
```

---

## 4. 启动前 / 启动后加载

**启动前（`loadPhase: "before-start"`，默认值）**
- 所有注册类内容：`registerLevel`、`registerArea`、`registerItem`、`registerEntityKind`、`tune`、`on`。
- 游戏会等这些 Mod 全部执行完，才把注册表写进真实数据结构，然后启动主循环。
- 启动前 Mod 里**不能**调用 `giveItem` / `spawnEntity` / `goToLevel` / `getState()` 依赖游戏实例的函数——
  此时还没有对局，调用会返回 `false`，事件回调里再调即可。

**启动后（`loadPhase: "after-start"`）**
- 适合纯表现与运行时逻辑：事件回调里发提示、刷怪、发道具、切层。
- 启动后 Mod 仍然可以注册新道具/实体，但注册会"立即生效"，不会重跑已生成的地图。
- 启动后 Mod 不能注册层级（地图已生成，注册不会影响当前对局，只影响下一次切层）。

---

## 5. 可作公共前置依赖的基础 Mod API

- 被依赖的 Mod 应只做"注册 + 提供事件"，把可复用内容挂在自己的命名空间里（例如
  `backroomsMods.echoPack = { items: [...] }`），**不要**把对象挂到 `window.BackroomsMod` 上。
- 依赖声明写在 `vibehub.mod.json` 的 `dependencyIds` 里，只能依赖"启动前"的 Mod。
- 禁止的跨阶段依赖：
  - 启动前 Mod 依赖启动后 Mod（加载器不会等待，依赖一定拿不到）。
  - 启动后 Mod 依赖启动前 Mod 的"运行时状态"（那个状态在游戏启动时已经发生过了）。
- 基础 Mod 不得替别人调用 `markGameReady()`、不得改动 `window.VibeHubWorkshop`。

---

## 6. 多 Mod 同时启用的命名、去重与冲突规则

- **命名**：道具 `key`、实体 `kind` 只允许小写字母/数字/点/横线/下划线，建议带作者前缀，
  例如 `echo_shard`、`echo_walker`。层级 `id` 建议使用 90000+ 区间，避免撞上内置编号。
- **去重**：注册函数遇到已存在的 `key` / `kind` / 层级 `id` 会返回 `{ ok:false }`，**不覆盖**已有内容；
  第二个注册的 Mod 应自行改名或安静退出。
- **区域**：同名区域重复注册是幂等的（只保留一份）。
- **数值**：多个 Mod 调同一个键时"后注册者生效"（按加载顺序），不做合并；请在自己的说明里写清。
- **事件**：多个 Mod 可以订阅同一事件，按注册顺序依次调用；单个 Mod 抛错不会影响其它 Mod。
- **提示条**：同时 `toast` 会互相覆盖（后一条覆盖前一条），属于预期表现。
- **不提供**卸载 / 热重载：Mod 在本次页面生命周期内常驻。

---

## 7. 存档、联机、加载顺序与版本兼容

- **存档**：`br_local_slots_v1` 等存档结构不含 Mod 数据。Mod 道具会随背包 `inv` 一起存进存档
  （key 是字符串），卸载 Mod 后再读档会得到一件"没有定义"的道具（占格但不可用）。
  请自行决定是否在 `before-start` 里清理自己的旧道具。
- **联机**：本作策略为 **`mods-disabled`**。只要启用了任何 Mod，进入联机房间点"开始"会被拒绝并提示
  关闭全部模组；单人模式不受限制。Mod 也不得尝试绕过该检查或修改联机同步。
- **加载顺序**：加载器按平台返回的顺序串行加载（`async=false`），启动前 Mod 全部执行完 →
  应用注册 → 启动引擎 → `markGameReady()` → 启动后 Mod。注册冲突按"先到先得"处理。
- **版本兼容**：本指南对应 `BackroomsMod.apiVersion = 1`、游戏 v1.3.4。
  - 只使用本文档列出的函数与字段；未列出的内部对象（`window.__game`、`CONFIG`、`ITEMS` 等）
    都可能在任意版本变化，不属于兼容范围。
  - 新版本若提升 `apiVersion`，会在更新说明里写明变更；Mod 可以读 `BackroomsMod.apiVersion`
    自行判断是否继续执行。

---

## 8. 明确禁止使用的能力

1. 直接读写 `window.__game`、`window.__setLevel`、`window.__toast`、`window.__LK` 等调试口子。
2. 覆盖 / 猴子补丁任何全局函数（`Entity`、`generateMap`、`update`、`render`、`addItem` …）。
3. 操作游戏 DOM（HUD、背包、终端、菜单）或注入自定义样式去伪造 UI / 按钮。
4. 访问或索取账号凭据、Token、`localStorage` 中的身份/云存档键、管理接口与服务器 RPC。
5. 联网请求、外链脚本、把资源放在包外（图片、音频、字体、WASM、Worker 必须随包分发）。
6. 绕过联机的 `mods-disabled` 检查，或修改联机同步协议。
7. 采集玩家数据、键盘记录、修改存档上传逻辑。
8. 借助 `worker` / `eval` / `Function` 生成代码去规避上面的限制。
