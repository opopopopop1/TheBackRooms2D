"use strict";

// ======== 基础常量与工具 ========
const TILE = 40; // 每个格子的世界尺寸（像素）

// ---------- 层级定义 ----------
// 0.2 是 Level 0 的子层级（Level 0.2 · 重塑的混乱）
// floors：该层级有几层（Level 1 分上下两层）
// classes：生存难度（档案手册里随层级名一起显示）
const LEVELS = {
  "0": {
    id: 0, label: "LEVEL 0", name: "Level 0 —— 阈界",
    style: "wallpaper", monster: "bacterium", entities: true, floors: 1,
    // 1.3.4：再扩一轮（124² → 168²）。地图大了，几片区域就不会显得占满整张图；
    // 它们散落在互不相邻、不成行也不成列的位置上。
    size: 168,
    classes: ["等级 1", "安全", "稳定", "未确认实体"],
    objective: "闪烁的墙壁，或推开木门进深坑区 —— 那扇白色铁门在里面",
  },
  "0.1": {
    id: "0.1", label: "LEVEL 0.1", name: "Level 0.1 —— 天顶站",
    style: "zenith", monster: null, entities: false, floors: 1,
    size: 84,
    classes: ["等级 1", "安全", "稳定", "实体绝迹"],
    objective: "找到桥廊区 —— 桥尽头那个空洞底下就是 Level 0",
  },
  "0.2": {
    id: 0.2, label: "LEVEL 0.2", name: "Level 0.2 —— 重塑的混乱",
    style: "collapsing", monster: null, entities: false, floors: 1,
    size: 62,
    classes: ["等级 3", "不安全", "不稳定", "环境危害"],
    objective: "层级正在坍塌 —— 找到门，离开这里",
  },
  "0.3": {
    id: 0.3, label: "LEVEL 0.3", name: "Level 0.3 —— 冰室",
    style: "iceroom", monster: null, entities: false, floors: 1,
    size: 58,
    classes: ["等级 1", "安全", "稳定", "环境危害"],
    objective: "从通风管道原路返回 Level 0.2 · 或者找到门回到 Level 0",
  },
  // Level 0.5「渊闭疗舍」—— 从 Level 0 熄灯区里那段向下的金属格栅楼梯进来。
  // 三段：浸濡通道（齐膝棕污水）/ 第四天之后的虫蛀木板段 / 无尽医院（溺尸）。
  // 溺尸是这一层自己的实体，不走通用刷怪表（见 level0.5.js）。
  "0.5": {
    id: "0.5", label: "LEVEL 0.5", shortName: "渊闭疗舍", name: "Level 0.5 —— 渊闭疗舍",
    style: "asylum05", monster: null, entities: false, floors: 1,
    size: 112,
    classes: ["等级 4e", "资源 2/5 · 食物少见", "逃离 3/5 · 难以逃离", "环境 4/5 · 极端环境风险"],
    objective: "别在脏水里久泡 · 溺尸怕水，退回浸濡通道就能甩掉它 · 格栅楼梯→L1，清水域→L37，医院不知不觉变成 L109",
  },
  "0.7": {
    id: "0.7", label: "LEVEL 0.7", name: "Level 0.7 —— 忆域",
    style: "memorydomain", monsters: ["smiler", "skinstealer", "hound"],
    monster: "smiler", entities: true, floors: 6,
    // 六个年代各占一个区域（区域 1~6），每个区域都是 78 —— 和 Level 0 一样大。
    size: 78,
    classes: ["等级 2", "不安全", "稳定", "少量实体"],
    objective: "走到区域尽头，没入那团黄雾就到下一个区域 · 区域 1 里有扇门回 Level 0",
  },
  "1": {
    id: 1, label: "LEVEL 1", name: "Level 1 —— 宜居地带",
    style: "concrete", monster: "lurker", entities: true, floors: 2,
    size: 120,         // 1.3.0 扩充：上下两层一起放大，下层东侧单独扩出「商人之家」
    classes: ["等级 1", "安全", "稳定", "实体数量极少"],
    objective: "出口在上下两层随机刷新 · 越靠近出口越像管道梦魇 · 尽头是黑雾",
  },
  // Level 1.1 / 1.2 —— 1.3.0 批次
  "1.1": {
    id: "1.1", label: "LEVEL 1.1", shortName: "腐败的走廊", name: "Level 1.1 —— 腐败的走廊",
    style: "corridor11", monsters: ["smiler", "hound", "skinstealer"],
    monster: "smiler", entities: true, floors: 1,
    size: 92,
    classes: ["等级变化", "变化的安全性", "不稳定", "变化的实体数量"],
    objective: "一条笔直而狭窄的走廊 · 越往深处越不稳定 · 原路返回，或从墙上的裂缝切出去",
  },
  "1.2": {
    id: "1.2", label: "LEVEL 1.2", shortName: "砼苑", name: "Level 1.2 —— 砼苑",
    style: "concretegarden", monster: null, entities: false, floors: 1,
    size: 72,
    classes: ["等级 死区", "环境危害", "极度不宜居", "实体绝迹"],
    objective: "别停下 —— 站住不动，地上的植被就会长上来把你缠住",
  },
  // Level 1.3 恶性肿瘤 —— 入口是 Level 1 里一面被封锁的白墙（有守卫看着），得找个空子钻
  "1.3": {
    id: "1.3", label: "LEVEL 1.3", shortName: "恶性肿瘤", name: "Level 1.3 —— 恶性肿瘤",
    style: "tumor13", monster: null, entities: false, floors: 1,
    size: 80,
    classes: ["等级 死区", "不安全", "不稳定", "极端环境危害"],
    objective: "16 间大房间，8 间是排毒区 —— 进去先治好你，然后要你的命 · 找到那面纯白的墙回 Level 1",
  },
  "1.5": {
    id: "1.5", label: "LEVEL 1.5", shortName: "颠倒", name: "Level 1.5 —— 颠倒",
    style: "inverted", monster: null, entities: false, floors: 1,
    size: 84,
    classes: ["等级未定", "性质未解明", "信息未知", "未探明实体"],
    objective: "上下颠倒的地方 · 黑暗是从天花板放下来的 · 低语越小，说明它离你越近",
  },
  "2.1": {
    id: "2.1", label: "LEVEL 2.1", shortName: "锁闭", name: "Level 2.1 —— 锁闭",
    style: "lockdown", monster: null, entities: false, floors: 1,
    size: 84,
    classes: ["等级未定", "未勘探完全", "无已知出口", "实体绝迹"],
    objective: "一条条窄得转不开身的廊道 · 这里没有出口 —— 唯一的活路是迁跃浆果",
  },
  "2": {
    id: 2, label: "LEVEL 2", name: "Level 2 —— 管道梦魇",
    style: "pipe", monster: "pipeworm", entities: true, floors: 1,
    size: 92,
    classes: ["等级 3", "不安全", "未勘探完全", "实体数量极少"],
    // 真正的出路：找到一扇未上锁的铁栅栏门 -> Level 3
    objective: "找到一扇未上锁的铁栅栏门，切进 Level 3",
  },
  "3": {
    id: 3, label: "LEVEL 3", name: "Level 3 —— 发电站",
    style: "power", monsters: ["hound", "faceling", "smiler", "moth", "limb"],
    monster: "hound", entities: true, floors: 1,
    size: 100,
    classes: ["等级 4", "不安全", "不稳定", "中量实体"],
    objective: "找到钥匙 → 电力室合闸 → 搭乘电梯离开（电梯通往 Level 5）",
  },
  "3.5": {
    id: "3.5", label: "LEVEL 3.5", shortName: "电都", name: "Level 3.5 —— 电都",
    style: "electro", monster: null, entities: false, floors: 1,
    size: 96,
    classes: ["等级 4", "不安全", "稳定", "中量环境风险"],
    objective: "别待在室外 —— 撞上静电放电就会被打回 Level 3",
  },
  "4": {
    id: 4, label: "LEVEL 4", name: "Level 4 —— 废弃办公室",
    style: "office", monsters: ["faceling", "smiler", "skinstealer", "hound"],
    monster: "faceling", entities: true, floors: 1,
    size: 88,
    classes: ["等级 1", "安全", "稳定", "少量实体"],
    objective: "搜集杏仁水 · 避开透光的窗 · 走楼梯井回 Level 3 或搭电梯去 Level 5",
  },
  "5": {
    id: 5, label: "LEVEL 5", name: "Level 5 —— 恐怖旅馆",
    style: "hotel", floors: 3,
    areas: ["主厅", "贝弗莉室", "锅炉房"],
    monsters: ["deathmoth", "hound", "skinstealer", "watcher", "woodling",
      "cryer", "corpseRat", "ant89", "samantha"],
    monster: "deathmoth", entities: true,
    size: 76,
    classes: ["等级 2", "不安全", "稳定", "少量实体"],
    objective: "在三个区域间穿梭 · 深入锅炉房可以切出本层",
  },
  // Level 5.2 胜景 / Level 5.3 普罗米修斯藏书馆 —— 都只能从 Level 5 进
  "5.2": {
    id: "5.2", label: "LEVEL 5.2", shortName: "胜景", name: "Level 5.2 —— 胜景",
    style: "vista", monsters: ["deathmoth", "faceling"], monster: "deathmoth",
    entities: true, floors: 1,
    size: 76,
    classes: ["等级 3", "不安全", "不稳定", "少量实体"],
    objective: "两侧隔着一道 50 米的间隙 —— 只有极少数套房能穿到对面 · 出口是入口那扇门，它只在里侧被推开的那几秒里能走",
  },
  "5.3": {
    id: "5.3", label: "LEVEL 5.3", shortName: "普罗米修斯藏书馆", name: "Level 5.3 —— 普罗米修斯藏书馆",
    style: "prometheus", monster: null, entities: false, floors: 7,
    size: 56,
    classes: ["等级 1", "安全", "稳定", "极少量实体"],
    objective: "七层，靠木质楼梯上下 · 待久了它就开始抽你的记忆 —— 别超过一小时 · 走廊尽头墙上嵌着一扇木门",
  },
  "6": {
    id: 6, label: "LEVEL 6", name: "Level 6 —— 熄灯",
    style: "dark", monsters: ["wretch"], monster: "wretch", entities: true, floors: 1,
    size: 68,
    classes: ["等待分级", "安全性未知", "不稳定", "未探明实体存在"],
    objective: "彻底黑暗 · 手电无效 · 贴着墙走，靠记忆找到楼梯",
  },
  // Level 6.2 霓虹迷宫 —— 入口在 Level 6 里那一处不照亮别的区域的霓虹灯光
  "6.2": {
    id: "6.2", label: "LEVEL 6.2", shortName: "霓虹迷宫", name: "Level 6.2 —— 霓虹迷宫",
    style: "neon62", monster: null, entities: false, floors: 1,
    size: 68,
    classes: ["等级未定", "性质未解明", "信息未知", "未探明实体"],
    objective: "沿着亮着的灯走 —— 一个声音一直在鼓励你继续 · 越深灯越亮，偶尔闪红光 · 远处出现一座夜里的城市",
  },
  "7": {
    id: 7, label: "LEVEL 7", name: "Level 7 —— 深海恐惧症",
    // 实体回来了 —— 但只活在海底（午夜带），海面上依旧一只都没有。
    // 刷怪处（main.js）会额外判断：不在海底就不刷，浮回海面时清空。
    style: "ocean", monsters: ["herdsnake", "spider", "hound", "corpseRat"], monster: "herdsnake", entities: true, floors: 1,
    size: 96,
    classes: ["等级 4", "不安全", "不稳定", "中量实体"],
    objective: "在海上那些房子里找齐潜艇 · 潜艇钥匙 · 潜水服，坐潜艇下潜到海底的岩洞",
  },
  "8": {
    id: 8, label: "LEVEL 8", name: "Level 8 —— 岩洞系统",
    style: "cave", monsters: ["herdsnake", "spider", "hound", "corpseRat"],
    monster: "herdsnake", entities: true, floors: 1,
    size: 120,
    classes: ["逃离 4/5", "极难逃离", "极端环境风险", "极多敌意存在"],
    objective: "在岩洞网道最深处，找到那一小片不像岩洞的郊区（潮湿沥青与灭了灯的路灯）· 走进去",
  },
  "9": {
    id: 9, label: "LEVEL 9", name: "Level 9 —— 郊区",
    style: "suburb", floors: 1,
    monsters: ["crusher", "wretch", "hound", "smiler", "skinstealer", "deathmoth",
      "neighborhood", "watcher", "jerry", "transporter", "corpseRat", "kite", "worn"],
    monster: "wretch", entities: true,
    size: 104,
    classes: ["等级 5", "不安全", "不稳定", "实体横行"],
    objective: "沿着箭头路牌一直走下去（100~200 英里）· 或者走进田野",
  },
  "10": {
    id: 10, label: "LEVEL 10", name: "Level 10 —— 丰裕",
    style: "field", monster: null, entities: false, floors: 1,
    size: 86,
    classes: ["等级 1", "安全", "稳定", "无实体"],
    objective: "找到一条泥土小径 —— 沿着它一直走下去，据说能走到城市的边缘",
  },
  "11": {
    id: 11, label: "LEVEL 11", name: "Level 11 —— 不夜城",
    style: "city", monsters: ["faceling"], monster: "faceling", entities: true, floors: 1,
    size: 92,
    classes: ["等级 1", "安全", "稳定", "极少量实体"],
    objective: "在无限延伸的城市里搜寻补给 —— 有些建筑能把你送回浅层",
  },
  // Level 11.3 红灯区 —— 入口在不夜城市郊（漆黑的小巷 / 透红光的楼 / 被看守的桥）
  "11.3": {
    id: "11.3", label: "LEVEL 11.3", shortName: "红灯区", name: "Level 11.3 —— 红灯区",
    style: "redlight", monsters: ["hound", "smiler", "faceling"], monster: "hound",
    entities: true, floors: 1,
    size: 96,
    classes: ["等级 5", "不安全", "不稳定", "实体横行"],
    objective: "这里没有人类 —— 遇到的「人」一定是伪装的 · 别停下，别进封闭空间 · 市郊水面上的桥能回 Level 11",
  },
  "18": {
    id: 18, label: "LEVEL 18", name: "Level 18 —— 回忆",
    style: "daycare", monster: null, entities: false, floors: 1,
    size: 84,
    classes: ["等级 0", "安全", "稳定", "实体绝迹"],
    objective: "幼儿园与日托所 · 低语会勾起你最大的遗憾 · 转身就能离开",
  },
  "19": {
    id: 19, label: "LEVEL 19", name: "Level 19 —— 阁楼",
    style: "attic", monsters: ["faceling", "smiler"], monster: "smiler",
    entities: true, floors: 1,
    size: 96,
    classes: ["等级 2", "不安全", "稳定", "少量实体"],
    objective: "在潮湿的阁楼里翻箱子 —— 小心地板下那道橙色的光",
  },
  "13": {
    id: 13, label: "LEVEL 13", name: "Level 13 —— 温水煮青蛙",
    style: "apartment", monster: null, entities: false, floors: 1,
    size: 88,
    classes: ["等级 2e", "不安全", "稳定", "非实体危害"],
    objective: "在无穷无尽的公寓里活下去 —— 电梯能带你去别的地方",
  },
  "14": {
    id: 14, label: "LEVEL 14", name: "Level 14 —— 天堂",
    style: "paradise", monster: null, entities: false, floors: 1,
    size: 82,
    classes: ["等级 死区", "极不安全", "极不稳定", "精神危害"],
    objective: "别碰那些树。别听他们的。一直喝杏仁水。",
  },
  "15": {
    id: 15, label: "LEVEL 15", name: "Level 15 —— 未来走廊",
    style: "future", monster: null, entities: false, floors: 1,
    size: 90,
    classes: ["等级 0", "安全", "稳定", "实体绝迹"],
    objective: "在白色走廊里找到一个发光的光点",
  },
  // Level 15.1 枉然 —— 离开 Level 15 时有 1.8% 的概率掉进来
  "15.1": {
    id: "15.1", label: "LEVEL 15.1", shortName: "枉然", name: "Level 15.1 —— 枉然",
    style: "futility", monsters: ["faceling"], monster: "faceling",
    entities: true, floors: 1,
    size: 76,
    classes: ["等级 Lambda", "不安全且不稳定", "诱发敌意", "多重认知危害"],
    objective: "躺进仿真设备就能拥有一切 —— 只有自己愿意摘下来才是安全的 · 这里是出不去的",
  },
  "70": {
    id: 70, label: "LEVEL 70", name: "Level 70 —— 霜冻城镇",
    style: "frost", monsters: ["hound", "faceling", "smiler", "moth"], monster: "hound",
    entities: true, floors: 1,
    size: 96,
    classes: ["等级 4", "不安全", "不稳定", "中量实体"],
    objective: "在 -40°C 的雪城里找到一间温暖的屋子，或是一扇标着编号的门",
  },
  "21": {
    id: 21, label: "LEVEL 21", name: "Level 21 —— 编号门",
    style: "numbered", monsters: ["faceling", "smiler", "hound", "mimic21"], monster: "faceling",
    entities: true, floors: 1,
    size: 100,
    classes: ["等级 4", "不安全", "不稳定", "中量实体"],
    objective: "在四条长走廊上找门 —— 标签 105 回 Level 0，笑脸门通往 Level 26",
  },
  "26": {
    id: 26, label: "LEVEL 26", name: "Level 26 —— 享乐号汽船",
    style: "steamer26", monsters: ["partypooper"], monster: "partypooper",
    entities: true, floors: 1,
    size: 96,
    classes: ["等级 5", "不安全", "不稳定", "实体横行"],
    objective: "无限的黄色派对厅 —— 被抓住有三分之一会被转化；触摸一张反转的海报离开",
  },
  "25": {
    id: 25, label: "LEVEL 25", name: "Level 25 —— 四分之一枢纽",
    style: "arcade", monster: null, entities: false, floors: 1,
    size: 84,
    classes: ["等级 0", "安全", "稳定", "实体绝迹"],
    objective: "找一台还没被砸坏的街机 —— 投币，集中精力",
  },
  "37": {
    id: 37, label: "LEVEL 37", name: "Level 37 —— 崇高",
    style: "pool", monster: null, entities: false, floors: 1,
    // 档案：「非常大」—— 而且是非线性空间，走半天也走不到头
    size: 130,
    classes: ["等级 0", "安全", "稳定", "实体绝迹"],
    objective: "泡在温水里回理智 · 很高的楼梯 / 红灯的隧道 / 越来越像 Level 4 的地方",
  },
  "37.1": {
    id: "37.1", label: "LEVEL 37.1", name: "Level 37.1 —— 血红池房",
    style: "poolred", monster: "envoy", entities: true, floors: 1,
    size: 74,
    classes: ["等级 3", "不安全", "不稳定", "少量实体"],
    objective: "别信那些声音 —— 找到一片白色亮光，那里不再是红灯",
  },
  "994": {
    id: 994, label: "LEVEL 994", name: "Level 994 —— 存在于此",
    style: "beach", monster: null, entities: false, floors: 1,
    size: 72,
    classes: ["等级 待定", "安全性未知", "未开发", "无实体存在"],
    objective: "潮水一直在涨 —— 在被吞掉之前回到那扇 EXIST 的门",
  },
  // 注意：这个编号超过 JS 安全整数上限（9007199254740991），
  // 必须用字符串当 key，任何地方都不要对它 parseFloat，否则精度会失真。
  "9223372036854775807": {
    id: "9223372036854775807", label: "LEVEL 9223372036854775807", name: "Level 9223372036854775807 —— 无尽的终章",
    // 一圈环形的楼梯，中间是 3x3 的空洞。绕满一圈上一层，一共五十层。
    style: "endstair", monster: null, entities: false, floors: 50,
    size: 16,
    classes: ["等级 待定", "未知安全性", "性质未解明", "未勘探完全"],
    objective: "绕着环形楼梯走满五十层到顶，再走回最底下 —— 那里会变成白色",
  },
  "9223372036854775807.-1": {
    id: "9223372036854775807.-1", label: "LEVEL 9223372036854775807.-1", name: "Level 9223372036854775807.-1 —— 过去",
    style: "junction", monster: null, entities: false, floors: 1,
    size: 30,
    classes: ["等级 待定", "未知安全性", "性质未解明", "过去与未来"],
    objective: "忘却后室的记忆，来到一片虚假的现实",
  },
  "601": {
    // wikidot 上的编号就是 601；名字是「终末」，不叫「无限的图书馆」
    id: 601, label: "LEVEL 601", shortName: "终末", name: "Level 601 —— 终末",
    style: "library", monster: "blind", entities: true, floors: 1,
    size: 112,        // 1.3.0：大厅右侧单独扩出「假现实」那片草地
    classes: ["等级 待定", "未知安全性", "未知稳定性", "未勘探完全"],
    objective: "这里的实体没有视觉、听觉极灵敏 —— 丢下东西引开它",
  },
  // ================= Level 363 / 破碎之地 =================
  "363": {
    id: 363, label: "LEVEL 363", shortName: "你作弊了", name: "Level 363 —— 你作弊了",
    style: "cheat363", monster: "hound", monsters: ["hound", "smiler", "skinstealer"], entities: true, floors: 1,
    size: 26,
    classes: ["等级死区", "不安全且不稳定", "实体横行", "无出口"],
    objective: "平整的表面本该能让你切出去 —— 可你穿过去，抬起头还是这间房",
  },
  "shattered": {
    // 隐秘层级：严格来说不是层级，甚至不是后室的一部分 —— 它在后室之外
    id: "shattered", label: "破碎之地", shortName: "破碎之地", name: "隐秘层级 —— 破碎之地",
    style: "shattered", monster: null, entities: false, floors: 1,
    size: 92,
    classes: ["等级死区", "环境危害", "极度不宜居", "生命绝迹"],
    objective: "无序的数据正在侵蚀你的结构 —— 而出口早已被吞噬",
  },
  // ================= 1.3.0：永恒机场 =================
  "36": {
    id: 36, label: "LEVEL 36", shortName: "永恒机场", name: "Level 36 —— 永恒机场",
    style: "airport", monster: null, entities: false, floors: 1,
    size: 104,
    classes: ["等级 Aleph", "安全", "严重时间与空间扭曲", "实体绝迹"],
    objective: "26 座航站楼、数不清的登机口 —— 等航班开始登机，上去就能到几乎任何层级",
  },
  "36.1": {
    id: "36.1", label: "LEVEL 36.1", shortName: "星界客机", name: "Level 36.1 —— 星界客机",
    style: "airliner", monster: null, entities: false, floors: 1,
    size: 44,
    classes: ["等级 Aleph", "安全", "虚拟存在", "极端时间膨胀"],
    objective: "一架循环的客机 —— 落地就是你在 Level 36 登机口选的目的地",
  },
  // ================= 1.2.0 批次 =================
  "6.1": {
    id: "6.1", label: "LEVEL 6.1", name: "Level 6.1 —— 零食室",
    style: "foodcourt", monster: null, entities: false, floors: 1,
    size: 76,
    classes: ["等级 1", "安全", "稳定", "极少量实体"],
    objective: "无限大的商场餐厅 —— 自动售货机免费出货，无面灵在这里帮忙",
  },
  "10.1": {
    id: "10.1", label: "LEVEL 10.1", name: "Level 10.1 —— 尸湖",
    style: "deadlake", monster: null, entities: false, floors: 1,
    size: 70,
    classes: ["等级 5e", "不安全", "不稳定", "非实体灾害"],
    objective: "强辐射的毒湖 —— 原路返回，不要靠近水面",
  },
  "12": {
    id: 12, label: "LEVEL 12", name: "Level 12 —— 矩阵",
    style: "matrix", monster: null, entities: false, floors: 1,
    size: 24,
    classes: ["等级 0", "安全", "稳定", "实体绝迹"],
    objective: "白房间里只有一张桌子、一把椅子和一扇锁着的门 —— 拿钥匙开门",
  },
  "17": {
    id: 17, label: "LEVEL 17", name: "Level 17 —— 航空母舰",
    style: "carrier", monsters: ["watcher", "hound"], monster: "watcher", entities: true, floors: 1,
    size: 80,
    classes: ["等级 1", "安全", "稳定", "极少量实体"],
    objective: "密封的门窗会让你的肺里渐渐充满水 —— 走楼梯到上层，找那扇红色金属门",
  },
  "171": {
    id: 171, label: "LEVEL 171", name: "Level 171 —— 堂皇幻象",
    style: "grandeur", monsters: ["faceling", "hound", "smiler", "skinstealer"],
    monster: "skinstealer", entities: true, floors: 1,
    size: 84,
    classes: ["等级 5", "不安全", "不稳定", "实体横行"],
    objective: "灯亮时是堂皇盛况，灯灭时才是真相 —— 找到那扇雕刻着鹦鹉的木门",
  },
  "49": {
    id: 49, label: "LEVEL 49", name: "Level 49 —— 无底冥河弗列格通",
    style: "trench", monsters: ["hound", "smiler", "corpseRat"], monster: "hound", entities: true, floors: 1,
    size: 88,
    classes: ["等级 4", "不安全", "极端环境风险", "敌意侵袭"],
    objective: "离开战壕必死 —— 待在战壕里，找到地堡里生锈的门",
  },
  "49.1": {
    id: "49.1", label: "LEVEL 49.1", name: "Level 49.1 —— 勿忘先烈",
    style: "trenchpsi", monsters: ["wretch"], monster: "wretch", entities: true, floors: 1,
    size: 80,
    classes: ["等级 Ψ", "不安全", "不稳定", "精神危害"],
    objective: "士兵效应会抹掉你的记忆 —— 找到你自己的墓碑",
  },
  "71": {
    id: 71, label: "LEVEL 71", name: "Level 71 —— 地下虚空",
    style: "voidbase", monsters: ["skinstealer", "hound"], monster: "skinstealer", entities: true, floors: 1,
    size: 72,
    classes: ["等级 2", "不安全", "稳定", "少量实体"],
    objective: "只有一面无限延伸的墙 —— 沿着它走下去",
  },
  "109": {
    id: 109, label: "LEVEL 109", name: "Level 109 —— 霓虹医院",
    style: "hospital", monsters: ["hound", "skinstealer", "deathmoth", "limb"], monster: "hound", entities: true, floors: 1,
    size: 84,
    classes: ["等级 2", "不安全", "稳定", "少量实体"],
    objective: "无尽的医院走廊 —— 找到那扇标着感叹号的门",
  },
  "119": {
    id: 119, label: "LEVEL 119", name: "Level 119 —— 普通的水上乐园",
    style: "waterpark", monsters: ["partypooper", "smiler"], monster: "partypooper", entities: true, floors: 1,
    size: 78,
    classes: ["等级 4", "不安全", "不稳定", "中量实体"],
    objective: "滑梯各有各的效果 —— 黄色最安全，红/黑/米色别碰",
  },
  "287": {
    id: 287, label: "LEVEL 287", name: "Level 287 —— 故障大厅",
    style: "glitchhall", monster: null, entities: false, floors: 1,
    size: 70,
    classes: ["等级 2", "不安全", "稳定", "少量实体"],
    objective: "两侧全是黑门 —— 但只有 3 扇真的通别处，其余推开还是这条走廊",
  },
  // ================= 1.6.0：45 深渊公司 =================
  // 虚空里漂着 33 栋楼，正中那栋是帝国大厦（B.R.C. 总部）。
  // 楼与楼之间只有防火梯。
  "45": {
    id: 45, label: "LEVEL 45", shortName: "深渊公司", name: "Level 45 —— 深渊公司",
    style: "abyss45", monster: "deathmoth",
    monsters: ["deathmoth", "faceling"],
    entities: true, floors: 1,
    size: 130,
    classes: ["等级 1", "安全", "稳定", "极少量实体"],
    objective: "虚空里漂着 33 栋楼 · 楼与楼之间只有防火梯 · 从帝国大厦的正门离开回枢纽",
  },
  "20": {
    id: 20, label: "LEVEL 20", name: "Level 20 —— 波瑞阿斯建筑",
    style: "boreas20",
    monsters: ["deathmoth", "limb", "hound", "faceling", "skinstealer", "watcher", "wretch"],
    monster: "hound", entities: true, floors: 1,
    size: 124,
    classes: ["等级 4", "不安全", "不稳定", "中量实体"],
    objective: "等候厅 -> 霓虹区 · 员工专用门回 Level 2，或去霓虹区的游戏里赌一把",
  },
  // ================= 1.5.0：78 空间站 / 599 群星 =================
  "78": {
    id: 78, label: "LEVEL 78", shortName: "空间站", name: "Level 78 —— 空间站",
    style: "station78", monster: "limb",
    monsters: ["limb", "faceling", "wretch", "spider", "deathmoth"],
    entities: true, floors: 1,
    size: 96,
    classes: ["等级 2", "不安全", "稳定", "少量实体"],
    objective: "没有重力 —— 蹬一下就一直飘 · 找到舷窗里显示着街道的那间救生舱",
  },
  "599": {
    id: 599, label: "LEVEL 599", shortName: "群星", name: "Level 599 —— 群星",
    style: "star599", monster: null, entities: false, floors: 1,
    size: 40,
    classes: ["等级 死区", "环境性危害", "极度不宜居", "实体绝迹"],
    objective: "恒星的内部 —— 走进来的人通常活不过几秒",
  },
  "22": {
    id: 22, label: "LEVEL 22", name: "Level 22 —— 颓垣",
    style: "ruin22", monsters: ["hound", "faceling", "smiler"], monster: "hound",
    entities: true, floors: 1,
    size: 118,
    classes: ["等级 5e", "不安全", "不稳定", "环境危害"],
    objective: "塌掉的停车场 —— 从底层一路爬到顶层，上楼是唯一的正经出路",
  },
  "33": {
    id: 33, label: "LEVEL 33", name: "Level 33 —— 无尽购物体验",
    style: "mall33", monsters: ["faceling", "hound", "deathmoth", "smiler", "skinstealer"],
    monster: "faceling", entities: true, floors: 1,
    size: 130,
    classes: ["等级 2", "不安全", "稳定", "少量实体"],
    objective: "一座空旷的购物中心 —— 走得越深，它腐烂得越厉害",
  },
  // ================= 1.6.0：67 欲望烘焙坊 / 31 旱冰场 / 40 摇滚披萨 / 94 动画 =================
  "67": {
    id: 67, label: "LEVEL 67", shortName: "欲望烘焙坊", name: "Level 67 —— 欲望烘焙坊",
    style: "bakery67",
    // 档案：店里的无面灵都处在「默认状态」，只有你去推它 / 抱怨它才会回神攻击。
    // 所以这一层【不刷敌对实体】—— 无面灵由 p67clerk / p67queue 这两个物件来表现，
    // 走到跟前能搭话，但绝不会主动扑上来。
    monster: null, monsters: [],
    entities: false, floors: 1,
    size: 42,
    classes: ["等级 2", "不安全", "稳定", "实体无危害"],
    objective: "只有 2300 平方英尺的一家烘焙店 · 别吃你最喜欢的那种面点 —— 那是最致命的",
  },
  "31": {
    id: 31, label: "LEVEL 31", shortName: "旱冰场", name: "Level 31 —— 旱冰场",
    style: "rink31", monster: null, entities: false, floors: 1,
    size: 84,
    classes: ["等级 0", "安全", "稳定", "无有害实体"],
    objective: "无限循环的旱冰场 · 别待太久 —— 听教练的话",
  },
  "40": {
    id: 40, label: "LEVEL 40", shortName: "摇滚披萨", name: "Level 40 —— 摇滚披萨！",
    style: "rock40", monster: "faceling",
    monsters: ["faceling"],
    entities: true, floors: 1,
    size: 90,
    classes: ["等级 1", "安全", "稳定", "极少量实体"],
    objective: "一间无限大的 80 年代游戏厅 · 穿什么衣服走出旋转门，决定了你去哪一层",
  },
  "94": {
    id: 94, label: "LEVEL 94", shortName: "动画", name: "Level 94 —— 动画",
    style: "anime94", monster: "smiler",
    // 白天没有实体。天一黑，「动画」和笑魇、窃皮者、猎犬、雄性死亡飞蛾一起出来。
    monsters: ["smiler", "skinstealer", "hound", "deathmoth"],
    entities: true, floors: 1,
    size: 100,
    classes: ["等级 3", "不安全", "不稳定", "少量实体"],
    objective: "白天是安全的 —— 趁天黑之前找到透明山上的城堡，通过王的考验",
  },
  // ================= 1.8.0：27 岩体泉 / 28 终末美德 / 痛处 =================
  "27": {
    id: 27, label: "LEVEL 27", shortName: "岩体泉", name: "Level 27 —— 岩体泉",
    style: "spring27", monster: null, entities: false, floors: 1,
    size: 28,
    classes: ["等级 0", "安全", "稳定", "实体绝迹"],
    objective: "一口洞穴温泉 —— 泡一小时以上能让你轻松下来，但别超过两小时，也别去爬那条排水渠",
  },
  "28": {
    id: 28, label: "LEVEL 28", shortName: "终末美德", name: "Level 28 —— 终末美德",
    style: "virtue28", monster: null, entities: false, floors: 1,
    size: 122,
    classes: ["等级 2?", "大体安全", "相当稳定", "极少量实体"],
    objective: "永远阴晦之天空下的风袭草地 · 别碰那片柏油状的活体深渊 · 出口在要塞的一盏台灯里",
  },
  // 痛处：不是一整层 —— 是 Level 0 里的一处特殊地点（面积不大）。
  // 从 Level 0 里那团挡路的灰雾走进去，你的灵魂便会来到这；这里没有出口。
  "pain": {
    id: "pain", label: "痛处", name: "Level 0 —— 痛处",
    style: "pain0", monster: null, entities: false, floors: 1,
    size: 30,
    classes: ["等级未确定", "神秘属性", "非欧空间", "缺乏生命"],
    objective: "一个黑白的区域 —— 你的生命值与理智值不复存在，也不会减少。你会永远留在这里",
  },
  // ================= 1.7.0：29 海波利亚 / 284 需汝之地 =================
  "29": {
    id: 29, label: "LEVEL 29", shortName: "海波利亚", name: "Level 29 —— 海波利亚",
    style: "isle29", monster: null, entities: false, floors: 1,
    size: 150,
    classes: ["等级 4", "逃离指数 4/5", "极难逃离", "危险的海域"],
    objective: "我们的家园，更是天堂般的境地 —— 离开的唯一方法是出海航行 1500 海里",
  },
  "284": {
    id: 284, label: "LEVEL 284", shortName: "需汝之地", name: "Level 284 —— 需汝之地",
    style: "river284", monster: null, entities: false, floors: 1,
    size: 44,
    classes: ["等级待定", "安全性未知", "不稳定", "未探明实体存在"],
    objective: "一处河畔的观景处 —— 它尽力再现你家乡的记忆 · 找到那张草搭的床，睡一觉",
  },
  // ================= 1.9.0：24 月球 / 56 冷冻致伤 / 57 白日美术馆 =================
  "57": {
    id: 57, label: "LEVEL 57", shortName: "白日美术馆", name: "Level 57 —— 白日美术馆",
    style: "gallery57", monster: null, entities: false, floors: 1,
    size: 96,
    classes: ["等级 1", "安全", "稳定", "极少量实体"],
    objective: "一座延展不绝之美术馆 · 找到一扇门（→Level 21），或那副月亮的画（→Level 24）",
  },
  "24": {
    id: 24, label: "LEVEL 24", shortName: "月球", name: "Level 24 —— 月球",
    style: "moon24", monster: null, entities: false, floors: 1,
    size: 104,
    classes: ["等级 1", "安全", "稳定", "极少量实体"],
    objective: "一个 1:1 的塑料太阳系模型，唯一可到达的天体是月球 · "
      + "找不到出口的时候，塑料工场里的矿工会为你指一扇门（→Level 1）",
  },
  "56": {
    id: 56, label: "LEVEL 56", shortName: "冷冻致伤", name: "Level 56 —— 冷冻致伤",
    style: "frost56", monsters: ["hound", "deathmoth"],
    monster: "hound", entities: true, floors: 1,
    size: 116,
    classes: ["等级 5e", "不安全", "不稳定", "气候危害 · 中量实体"],
    objective: "越往里越冷的圆形冰洞 · 撬开木箱找到防寒服才敢往中心走 · "
      + "加宽的雪洞（→Level 57）/ 气闸门（→Level 78，M.E.G 不建议）",
  },
  "289": {
    id: 289, label: "LEVEL 289", name: "Level 289 —— 过载",
    style: "overload", monsters: ["skinstealer", "hound", "smiler"],
    monster: "skinstealer", entities: true, floors: 1,
    size: 116,
    classes: ["等级 4", "不安全", "不稳定", "中量实体"],
    objective: "水池 → 荧火大厅 → 深渊 → 卡夫卡式迷宫 · 出口是一排阶梯",
  },
  "30": {
    id: 30, label: "LEVEL 30", name: "Level 30 —— 抽离现实",
    style: "dereal30", monsters: ["lurker30"], monster: "lurker30", entities: true, floors: 1,
    size: 110,
    classes: ["等级 Aleph", "不安全", "时间膨胀", "未记录实体"],
    objective: "一个结局层级 —— 你已经死了，浆果失效。走得够远，你会看见它是假的",
  },
  "696": {
    id: 696, label: "LEVEL 696", name: "Level 696 —— 无尽大楼",
    style: "endless696", monster: null, entities: false, floors: 1,
    size: 160,
    classes: ["等级 1", "安全", "稳定", "极少量实体"],
    objective: "浅灰混凝土的废弃大楼 —— 找到第 30 楼那件紫黑相间的故障物品",
  },
  "301": {
    id: 301, label: "LEVEL 301", name: "Level 301 —— 希望之窗",
    style: "hopewindow", monster: null, entities: false, floors: 1,
    size: 96,
    classes: ["等级 死区", "极度不宜居", "致命环境危害", "出口唯一"],
    objective: "空气会腐蚀一切 —— 没有防护服撑不过十秒 · 打碎最上方那扇窗",
  },
  "484": {
    id: 484, label: "LEVEL 484", name: "Level 484 —— 茫白景象",
    style: "whitehouse", monster: null, entities: false, floors: 1,
    size: 76,
    classes: ["等级 0", "安全", "处于实体控制", "非宜居"],
    objective: "一幢不断变大的白房子 —— 走得够远，找那扇灰色的门",
  },
  "485": {
    id: 485, label: "LEVEL 485", name: "Level 485 —— 蒙黑天空",
    style: "blacksky", monsters: ["skinstealer", "hound", "bride"], monster: "skinstealer", entities: true, floors: 1,
    size: 76,
    classes: ["等级 5", "不安全", "不稳定", "实体横行"],
    objective: "乳白天空的黑暗镜像 —— 找到那扇标着 EXIT 的黑色铁门",
  },
  "486": {
    id: 486, label: "LEVEL 486", name: "Level 486 —— 罪恶之地",
    style: "sinland", monsters: ["wretch"], monster: "wretch", entities: true, floors: 1,
    size: 104,      // 一片开阔得望不到边的地带 —— 以前 80，走两步就到头
    classes: ["等级罪恶", "已遭败坏", "极其危险", "高生物量"],
    objective: "空气在腐蚀你 —— 不穿全封闭防护服撑不过十几秒 · 穿过整片地带可以回到 Level 10",
  },
  "512": {
    id: 512, label: "LEVEL 512", name: "Level 512 —— 层级_模版",
    style: "template", monster: null, entities: false, floors: 1,
    size: 72,
    classes: ["等级 1", "安全", "稳定", "极少量实体"],
    objective: "一栋家具齐全的房子 —— 冰箱里的食物每天补货，地下室通向未知",
  },
  "666": {
    id: 666, label: "LEVEL 666", name: "Level 666 —— 欢迎来到地狱",
    style: "hell", monsters: ["spider", "smiler"], monster: "spider", entities: true, floors: 1,
    size: 70,
    classes: ["未定分级", "性质未解明", "信息未知", "未探明实体"],
    objective: "每个人的地狱都不一样 —— 迎接死亡吧",
  },
  "790": {
    id: 790, label: "LEVEL 790", name: "Level 790 —— 在劫难逃",
    style: "snowtown", monster: null, entities: false, floors: 1,
    size: 78,
    classes: ["等级死区", "环境危害", "极度不宜居", "潜在异常实体"],
    objective: "这座雪镇会用各种'意外'杀死你 —— 躲在茶叶店里最安全",
  },
  "900": {
    id: 900, label: "LEVEL 900", name: "Level 900 —— 休息区",
    style: "mattress", monster: null, entities: false, floors: 1,
    size: 90,
    classes: ["等级 1", "安全", "稳定", "极少量实体"],
    objective: "800 公里长的床垫店 —— 从正中心走到任一出口要三天",
  },
  "974": {
    id: 974, label: "LEVEL 974", name: "Level 974 —— kitty 之家",
    style: "kittyhome", monsters: ["kitty"], monster: "kitty", entities: true, floors: 1,
    size: 40,
    classes: ["等级 0", "安全", "稳定", "无有害实体"],
    objective: "把一件进来之前就带着的可爱物件给 Kitty —— 然后你会睡着",
  },
  "998": {
    id: 998, label: "LEVEL 998", name: "Level 998 —— 此路向死，或向远方",
    style: "cloudplane", monsters: ["smiler", "wretch", "woodling", "hound"], monster: "smiler", entities: true, floors: 1,
    size: 86,
    classes: ["等级变化", "安全性变化", "稳定性无法预测", "实体数量波动"],
    objective: "云层平面分三个区 —— 越往深处越黑、越冷、越危险",
  },
  "999": {
    id: 999, label: "LEVEL 999", name: "Level 999 —— 终焉之岛",
    style: "lastisland", monster: null, entities: false, floors: 1,
    size: 74,
    classes: ["等级终焉", "恒景", "恒形", "恒常"],
    objective: "悬浮的热带岛屿，一切永恒不变 —— 忏悔你的全部罪状",
  },
  "1000": {
    id: 1000, label: "LEVEL 1000", name: "Level 1000 —— 自然风景",
    style: "nature", monster: null, entities: false, floors: 1,
    size: 80,
    classes: ["等级宜居", "安全", "宜居聚集地", "实体绝迹"],
    objective: "永远停在傍晚的纯自然景观 —— 留在这里吧",
  },
  // 战地医院：档案里写作 Level 14，但 14 在本作里已经是「天堂」——
  // 所以内部 id 用 "14h"（终端敲 L14H 也能到）。入口在 Level 289 的楼梯。
  "14h": {
    id: "14h", label: "战地医院", name: "隐秘层级 —— 战地医院",
    style: "mash", monster: null, entities: false, floors: 1,
    size: 88,
    classes: ["等级 3", "不安全", "不稳定", "少量实体"],
    objective: "在覆着蓝瓷砖的废弃战地医院里找那间黑白墙的病房 —— 出去的路只有那一条",
  },
  "anse": {
    id: "anse", label: "黯洃銫", name: "隐秘层级 —— 黯洃銫",
    style: "anse", monsters: ["wretch"], monster: "wretch", entities: true, floors: 1,
    size: 78,
    classes: ["等级未定", "性质未解明", "信息未知", "未探明实体"],
    objective: "黑白灰的丛林 —— 这里没有出口，天一黑就再也走不出去了",
  },
  // Level ! —— 医院走廊。尘封的感叹号"还活着"时候的样子。
  // 编号是 "!"，内部用 "bang"（终端里敲 L! 也认）。
  "bang": {
    id: "bang", label: "LEVEL !", name: "Level ! —— 为生命而奔跑",
    style: "bang", monsters: ["smiler"], monster: "smiler", entities: true, floors: 1,
    // 走廊长度翻倍（96 -> 192）—— 要跑的路变长，笑魇追在身后的时间也更久
    size: 192,
    classes: ["等级 5", "不安全", "不稳定", "实体横行"],
    objective: "沿着走廊一直走到尽头 —— 尽头那扇 EXIT 大门通往 Level 109",
  },
  "exclam": {
    id: "exclam", label: "尘封的感叹号", name: "隐秘层级 —— 尘封的感叹号",
    style: "exclam", monster: null, entities: false, floors: 1,
    size: 74,
    classes: ["等级 0", "安全", "稳定", "实体绝迹"],
    objective: "Level ! 废弃后的样子 —— 地上全是实体的骨头",
  },
  "bluechannel": {
    id: "bluechannel", label: "蓝色通道", name: "隐秘层级 —— 蓝色通道",
    style: "bluevoid", monsters: ["worn"], monster: "worn", entities: true, floors: 1,
    size: 70,
    classes: ["等级 3", "不安全", "不稳定", "少量实体"],
    objective: "层级之外的蓝色虚空 —— 可以在里面游泳，靠近层级集群就能回去",
  },
  "hub": {
    id: "hub", label: "HUB", name: "隐秘层级 —— 枢纽",
    style: "hub", monster: null, entities: false, floors: 1,
    size: 150,                    // 隧道要够长，才放得下每个层级各一排门（现在 37 个层级）
    // 枢纽不参与分级 —— 手册里这一行不显示"生存难度"框
    objective: "穿过一扇开启的门，前往它对应的层级",
  },

  // ======== 1.3.2 批次：Level 23 / 32 / 34 / 38 / 43 / 834 / 903 / 904 ========
  // 这次全部登记进主表（上一批六个被放进附属表，导致枢纽门列表和传送名单查不到）。
  "23": {
    id: 23, label: "LEVEL 23", shortName: "石化花园",
    name: "Level 23 —— 石化花园",
    style: "garden23", monster: "hound", entities: true, floors: 1,
    size: 116,
    classes: ["等级 4", "不安全", "杂草丛生", "中等数量实体"],
    objective: "小行星级的超级有机体 · 光穴里的园丁之歉会发光 · 核心的水之心能把人送走",
  },
  "32": {
    id: 32, label: "LEVEL 32", shortName: "骷髅女皇之森",
    name: "Level 32 —— 骷髅女皇之森",
    style: "boneforest32", monster: null, entities: false, floors: 1,
    size: 96,
    classes: ["等级 5", "不安全", "不稳定", "存在强大实体"],
    objective: "新月下的骷髅林 · 别对女皇不敬 · 她若放你走，就能回 Level 39",
  },
  "34": {
    id: 34, label: "LEVEL 34", shortName: "下水道系统",
    name: "Level 34 —— 下水道系统",
    style: "sewer34", monster: "smiler", entities: true, floors: 1,
    size: 104,
    classes: ["等级 4", "不安全", "不稳定", "中量实体"],
    objective: "上半砖下半石的窄隧道 · 没有灯，带上手电 · 连结室的水下通向 7 或 289",
  },
  "38": {
    id: 38, label: "LEVEL 38", shortName: "多叠交点",
    name: "Level 38 —— 多叠交点",
    style: "overlap38", monster: "faceling", entities: true, floors: 1,
    size: 120,
    classes: ["等级 5", "不安全", "不稳定", "实体横行"],
    objective: "Level 0~37 的叠加交点 · 里界与表界不断混合 · 原路返回 Level 37",
  },
  "43": {
    id: 43, label: "LEVEL 43", shortName: "水世界",
    name: "Level 43 —— 水世界",
    style: "waterpark43", monster: "hound", entities: true, floors: 1,
    size: 126,
    classes: ["等级 3", "不安全", "不稳定", "少量实体"],
    objective: "废弃的水族馆主题公园 · 干涸与破损的展缸 · 铭牌写着早已不在的水生生物 · 绝对不要点开 New_Video.avi",
  },
  "834": {
    id: 834, label: "LEVEL 834", shortName: "螺旋螺旋螺旋螺旋",
    name: "Level 834 —— 螺旋螺旋螺旋螺旋",
    style: "spiral834", monster: null, entities: false, floors: 1,
    size: 110,
    classes: ["等级死区", "极度不宜居", "不稳定的表层", "环境危害"],
    objective: "深渊之上颤动的金属阶梯 · 狂风会吹断立足之处 · 找到一扇飘走的防火门",
  },
  "903": {
    id: 903, label: "LEVEL 903", shortName: "后室地铁",
    name: "Level 903 —— 后室地铁",
    style: "metro903", monster: null, entities: false, floors: 1,
    size: 132,
    classes: ["等级宜居", "安全", "长期聚集地", "无有害实体"],
    objective: "亮着灯的无限地铁站 · 列车能去任意层级 · 待久了灯可能会灭",
  },
  "904": {
    id: 904, label: "LEVEL 904", shortName: "黑暗地铁",
    name: "Level 904 —— 黑暗地铁",
    style: "darkmetro904", monster: null, entities: false, floors: 1,
    size: 100,
    classes: ["等级 Lambda", "不安全且不稳定", "对人类充满敌意", "存在有敌意且拥有自主意识的实体"],
    objective: "永夜的郊区 · 别用光源，别被镇民看见 · 这是一个必死层级",
  },

  // ======== 1.3.3 批次：Level 16 地形转变 / Level 75 阈限 ========
  // 两个都登记进主表 —— 上一批六个曾放进附属表，导致枢纽门列表和
  // 开发者传送名单查不到，这次不再重演。
  "16": {
    id: 16, label: "LEVEL 16", shortName: "地形转变",
    name: "Level 16 —— 地形转变",
    style: "ice16", monster: null, entities: false, floors: 1,
    size: 112,
    classes: ["等级未定", "性质未解明", "信息未知", "未探明实体"],
    objective: "冰河期 · 地形每隔一段时间就重排 · 找到覆着沙子的冰层去 Level 46",
  },
  "75": {
    id: 75, label: "LEVEL 75", shortName: "阈限",
    name: "Level 75 —— 阈限",
    style: "sand75", monster: null, entities: false, floors: 1,
    size: 104,
    classes: ["等级 0", "安全", "稳定", "实体绝迹"],
    objective: "厚积黄沙的走廊与房间 · 找到橙色的镓布丁去 Level 16，或原路返回 Level 4",
  },

  // ======== 1.3.1 批次：Level 5.1 / 39 / 63 / 63.3 / 797 / 46 ========
  // 这六个是正式层级（不是 Level 0 的附属房间），必须登记在 LEVELS 主表里：
  // 档案手册、开发者传送名单、层级密钥商店都只遍历 LEVELS。
  "5.1": {
    id: "5.1", label: "LEVEL 5.1", shortName: "恐怖旅馆赌场",
    name: "Level 5.1 —— 恐怖旅馆赌场",
    style: "casino51", monster: null, entities: false, floors: 1,
    size: 88,
    classes: ["等级赌场", "安全", "稳定", "十分有趣"],
    objective: "前台兑换筹码 · 红1 / 蓝5 / 黄10 / 绿20 · 玩够了从正门原路回 Level 5",
  },
  "39": {
    id: 39, label: "LEVEL 39", shortName: "魔法森林",
    name: "Level 39 —— 魔法森林",
    style: "forest39", monster: null, entities: false, floors: 1,
    size: 112,
    classes: ["等级 0", "安全", "稳定", "实体绝迹"],
    objective: "永恒的黄昏 · 越靠近中心越容易恍神，喝一口杏仁水就清醒 · 切出山丘到 Level 63，边界的桥到 Level 63.3",
  },
  "63": {
    id: 63, label: "LEVEL 63", shortName: "宁静",
    name: "Level 63 —— 宁静",
    style: "sky63", monster: null, entities: false, floors: 1,
    size: 104,
    classes: ["等级 0", "安全", "稳定", "实体绝迹"],
    objective: "悬在虚空上的橡木桥网 · 冥想点的长凳能静一静 · 从栏杆破损处掉下去会到 Level 39 或 797",
  },
  "63.3": {
    id: "63.3", label: "LEVEL 63.3", shortName: "安眠天堂",
    name: "Level 63.3 —— 安眠天堂",
    style: "sleep633", monster: null, entities: false, floors: 1,
    size: 96,
    classes: ["等级 0", "安全", "稳定", "实体绝迹"],
    objective: "一条没有尽头的木桥，夜里满是星星 · 睡一觉天就亮了 · 跳进紫雾到 Level 46，切入桥面回 Level 63",
  },
  "797": {
    id: 797, label: "LEVEL 797", shortName: "少有人走的路",
    name: "Level 797 —— 少有人走的路",
    style: "path797", monster: null, entities: false, floors: 1,
    size: 120,
    classes: ["等级宜居", "适合生命存在", "宜居物质", "无有害实体"],
    objective: "沿石路走 · 大坝、林间前哨站、海湾 · 岩壁上的洞口通往 Level 10 / 39 / 63",
  },
  "46": {
    id: 46, label: "LEVEL 46", shortName: "阿拉伯沙漠",
    name: "Level 46 —— 阿拉伯沙漠",
    style: "desert46", monster: null, entities: false, floors: 1,
    size: 110,
    classes: ["等级 2", "不安全", "稳定", "少量实体"],
    objective: "当前是夜晚 · 躲进废墟或绿洲 · 沙暴里会冒出沙灵，液体能驱散 · 废墟里的办公室门回 Level 4",
  },

};

// Level 0 的附属房间 —— 它们不是独立层级，只是 Level 0 的一部分
// （就像马尼拉房间一样）。因此不计入层级总数，也不出现在档案、手册、
// 枢纽门列表和终端层级列表里 —— 但仍然可以通过 goToLevel 进入。
// 只放 redrooms / traproof 这类「层级内部的地点」；正式层级一律登记到 LEVELS。
const LEVEL0_ROOMS = {
  "redrooms": {
    id: "redrooms", label: "LEVEL 0 · 红室", name: "Level 0 —— 红室",
    style: "redroom", monster: null, entities: false, floors: 1,
    size: 70,
    classes: ["等级 3", "逃离 5/5", "死区", "无敌对实体"],
    objective: "这里没有出口 —— 进来了，就再没有出去的办法",
  },
  // 深坑区（原名「深坑区」）：Level 0 里那扇普通木门后面的区域，不是独立层级。
  // id 仍叫 traproof —— 存档、终端、传送都认这个 key，改 id 会全线断掉。
  // （wikidot 中文社区没有 0.4 这个编号；英文主站另有一个"窗中世界"。）
  "traproof": {
    id: "traproof", label: "LEVEL 0 · 深坑区", name: "Level 0 —— 深坑区",
    style: "trapnet", monster: null, entities: false, floors: 1,
    size: 84,        // 和其它三片区域一样，都是「比较大」，不是小房间
    classes: ["等级 4", "不安全", "不稳定", "环境危害"],
    objective: "能站人的只有那些网格线 —— 走到底部正中那扇白色铁门（→ Level 1 上层）",
  },

};

// Level 11 的附属区域 —— 新时代广场是城市的一部分，不是独立层级。
// （编号 11.1 另有其主："私有企业"，尚未实装。）
const LEVEL11_ROOMS = {
  "newera": {
    id: "newera", label: "LEVEL 11 · 新时代广场", name: "Level 11 —— 新时代广场",
    style: "newera", monster: null, entities: false, floors: 1,
    size: 56,
    classes: ["等级 0", "安全", "稳定", "实体绝迹"],
    objective: "B.N.T.G 的贸易站 —— 用杏仁水买补给，或者把东西换成杏仁水",
  },
};

function levelDef(level) {
  return LEVELS[String(level)]
      || LEVEL0_ROOMS[String(level)]
      || LEVEL11_ROOMS[String(level)]
      || LEVELS["0"];
}

// 枢纽里的门通向哪些层级 —— 每个层级恰好一对门（上下各一扇），不会重复。
// 门与层级密钥共用这份列表，免得刷出一把开不了任何门的钥匙。
// 枢纽里每一排门通往的层级。新增层级要记得录进来 —— 每个层级恰好一排。
// 注意：枢纽里没有子层级 —— Level 0.2 / 0.3 不在其中，
// 它们是 Level 0 的分支，不属于"十字路口"通向的正式层级。
// Level 15 不在里面 —— 它只能从 Level 14 走出来（彩蛋 1 的路径）
// Level 0.2 / 0.3 也不在里面 —— 它们是 Level 0 的分支，不算"十字路口"通向的正式层级
// 25 / 37 / 994 在里面 —— 它们本身也能从别的层级进去（街机 / 门），
// 但作为正式层级同样该在枢纽里有一排门
// 6.1 / 10.1 / 49.1 是子层级，anse / exclam / bluechannel 是隐秘层级 —— 都不进枢纽。
const HUB_TARGETS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 17, 18, 19, 21, 25, 36, 37, 45,
  49, 70, 71, 109, 119, 171, 287, 301, 484, 485, 486, 512, 666, 790, 900, 974, 994, 998, 999, 1000];

// 地图边长：按层级配置，Level 2 之后逐层增长
function mapSizeFor(level) {
  const def = levelDef(level);
  let s = def.size;
  // 只有没写进配置的深层（Level 8 之后）才继续增长；5~8 各层用各自的设定尺寸
  // 只给真正的"深层"继续增长。Level 994 这种编号大但不是深层的，
  // 会被算成 72 + 986×步长，直接顶到上限，地图大得离谱。
  // 25 / 37 这类"编号不小但本身是安全层级"的，用自己的设定尺寸，不再继续增长
  // 1.2.0 批次里落在 9~21 之间的新层级（12 矩阵 / 17 航空母舰）都写了自己的
  // 设定尺寸 —— 特别是 Level 12 就该是"一个小房间"，再按深层规则增长会变成 56。
  if (typeof level === "number" && level > 8 && level <= 21 && NO_GROW.indexOf(level) < 0) {
    s = Math.min(CONFIG.MAX_MAP, s + (level - 8) * CONFIG.MAP_GROWTH);
  }
  return s;
}

// 不参与"越深越大"的层级 —— 它们的大小由自己的设定决定
const NO_GROW = [12, 16, 17];

// Level 7 的水上摩托：在海上朝一个方向走/开满这么多格，才到 Level 29。
// 档案原文是「行驶上百格」—— 不是骑上去就直接传送。
const JET29_NEED = 500;

const CONFIG = {
  TILE: 40,

  // 摄像机
  VISIBLE_TILES: 15, // 屏幕横向可见的格子数（缩小视野，压迫感更强）

  // 地图
  BASE_MAP_SIZE: 56,  // 兜底用
  MAP_GROWTH: 8,      // Level 2 之后每层增加
  MAX_MAP: 120,

  // 玩家
  PLAYER_RADIUS: 18,
  PLAYER_SPEED: 215,
  PLAYER_SPRINT: 340,
  STAMINA_MAX: 100,
  STAMINA_DRAIN: 38,
  STAMINA_REGEN: 26,

  // 生命值 / 理智值
  HP_MAX: 100,
  SANITY_MAX: 100,
  SANITY_DRAIN_DARK: 0.55,   // 摸黑前进时每秒流失的理智
  SANITY_DRAIN_LIT: 0.12,    // 手电照着、附近没东西时几乎不掉（但也不会自己回满）
  SANITY_DRAIN_ENTITY: 2.0,  // 实体贴近时每秒额外流失（按危险度缩放）—— 削过一刀，不再猝不及防
  SANITY_LOW: 30,            // 低于此值开始出现幻觉（画面扭曲）
  SANITY_CRASH_HP: 7,        // 理智归零时每秒扣的生命值

  // 杏仁水 / 污染杏仁水 / 撬棍
  ALMOND_SANITY: 35,         // 一瓶杏仁水回复的理智
  ALMOND_HP: 8,              // 一瓶杏仁水顺带回复的生命
  BAD_ALMOND_HP: -45,        // 污染杏仁水扣的生命值（可叠加）
  BAD_ALMOND_SLOW: 0.62,     // 单层污染的移速倍率（叠加后更低，下限见下）
  BAD_ALMOND_SLOW_MIN: 0.34, // 移速倍率下限
  CROWBAR_REACH: 1.5,        // 开箱/拾取距离（格）

  // ---- 背包容量 ----
  BAG_DEFAULT: 25,           // 默认能装多少件物品
  BAG_BONUS: {               // 各类挎包 / 背包的额外容量
    bag1: 10,                // 小挎包（Level 1 / Level 4）
    bag2: 25,                // 中型背包（Level 5）
    bag3: 50,                // 大型背包（Level 8）
    bag4: 75,                // 只有管理员终端能召唤出来的那种
  },

  // 明亮的层级：这些地方在设定上就是亮堂的，迷雾别压那么死
  // （一直用 0.78 会把黄墙黄地压成一片黑，玩家连自己在哪儿都看不清）
  // 明亮的层级：设定上就是亮堂的，迷雾不压暗。
  // 37.1 不在这里 —— 它只有几盏红灯，其余全靠手电筒照亮。
  // 0.4 深坑区：必须看得见那些网格线和黑洞 —— 看不见就没法玩，
  // 掉下去也只会觉得莫名其妙。
  // Level 45 也在这份名单里：虚空的星野和浮在其中的楼要一眼看得见，
  // 盖上迷雾就只剩一片黑，玩家根本看不出自己是站在一栋漂着的楼里。
  // 63 是悬在云上的开阔天空、永远是白天 —— 不能压迷雾，否则整片天空和浮云
  // 都会被压成灰蓝，还会露出一格一格的迷雾边界，看着像铺在地上的海面。
  // 63.3 同样是整片连续天空（夜里紫天繁星、睡醒厚云）：压上迷雾就只剩玩家
  // 手边一小圈亮，星星和云全被吃掉了，所以和 63 / 30 一样不压迷雾。
  BRIGHT_LEVELS: ["78", "599", "20", "601", "29", "284", "9223372036854775807", "9223372036854775807.-1", "25", "37", "994", "traproof", "30", "696", "45", "67", "31", "40", "94", "27", "28", "pain", "363", "shattered", "24", "56", "57", "63", "63.3", "16", "75"],
  // 需要局部光照的层级：光源有散布范围，范围外基本全黑
  // 只列"必须摸黑"的层级。红室虽然压抑，但压到全黑就没法玩了 ——
  // 它靠墙上的暗房灯 + 手电，走的是普通迷雾那套。
  DARK_LEVELS: ["37.1", "301"],   // 301 希望之窗：发光尘埃不够亮，必须自带光源
  FOG_BRIGHT: 0.34,

  // 各层级的理智流失速度（每秒；越小掉得越慢）
  SANITY_BY_LEVEL: {
    "0": 0.5,     // Level 0：缓慢
    "0.2": 1.0,   // Level 0.2：较快（另外每次坍塌还有一次性打击）
    "traproof": 0.9,  // 深坑区（Level 0 的一部分）：悬在网上的紧张感
    "0.7": 0.8,   // Level 0.7 忆域：越往深处越压抑
    "171": 1.6,   // Level 171 堂皇幻象：灯灭之后是腐坏的真相
    "301": 1.5,   // Level 301 希望之窗：腐蚀性气体
    "newera": 0.0, // 新时代广场（Level 11 的一部分）：B.N.T.G 的地盘，安全
    "redrooms": 2.2,  // 红室：死区 —— 进来就一直在掉，而且没有出口
    "0.3": 0.55,  // Level 0.3：冰室 —— 冻得发慌，但算不上致命
    "1": 0.07,    // Level 1：极其缓慢
    "2": 0.6,     // Level 2：稍快（这里只有污染杏仁水，别待太久）
    "3": 0.72,    // Level 3：黑暗与轰鸣确实难熬，但物资够多，撑得住
    "4": 0.06,    // Level 4：难得能喘口气的层级，几乎不掉（真正的威胁是"窗"）
    "5": 0.35,    // Level 5：干净、豪华、有爵士乐 —— 反常得让人发毛
    "6": 1.15,    // Level 6：彻底黑暗与绝对寂静，偏执来得很快
    "7": 0.32,      // Level 7：深海与两个怪物 —— 本来已经够压迫，理智再掉快就没法探索了
    "8": 0.95,    // Level 8：极端环境 + 极多敌意存在
    "9": 1.05,    // Level 9：午夜的郊区，黑暗与实体横行
    "10": 0.0,    // Level 10：丰裕 —— 歇脚的地方，理智完全不掉（还能喝湖水回理智）
    "11": 0.0,    // Level 11：不夜城 —— 歇脚的地方，第 11 效应下实体也不伤人
    "hub": 0.03,  // 枢纽：几乎不掉（这里安静得不正常）
    "13": 0.0,    // Level 13：物资会自己刷新，是歇脚的地方（真正的威胁是无聊）
    "14": 2.2,    // Level 14：精神危害 —— 天堂的表象下面是死区
    "15": 0.0,    // Level 15：安全稳定，实体绝迹 —— 也是歇脚层
    "70": 0.5,    // Level 70：极寒与实体
    "18": 0.0,    // Level 18：回忆 —— 安全稳定，是个能歇脚的地方（低语只影响心情）
    "19": 0.55,   // Level 19：阁楼 —— 潮湿、衰败、昏昏沉沉
    // --- 新增层级 ---
    "25": 0.0,    // Level 25：安全稳定、实体绝迹 —— 能喘口气
    "37": 0.0,    // Level 37：泻盐让人放松，泡在水里还回理智
    "37.1": 0.9,  // Level 37.1：血红池房 —— 黑暗与红光确实瘆人
    "994": 0.0,   // Level 994：被海浪碰到不会掉血掉理智 —— 它只是把你分解掉
    "9223372036854775807": 0.0,
    "9223372036854775807.-1": 0.0,
    "601": 0.2, // Level 601 终末：图书馆安静得过头，但不致命
    "363": 1.3,    // Level 363 你作弊了：切不出去的房间，撑不过 11 分钟
    "shattered": 0.0, // 破碎之地：理智由层内逻辑处理（无序数据侵蚀）
    // ---- 1.9.0 ----
    "57": 0.0,  // Level 57 白日美术馆：安全稳定，是个能喘口气的地方
    "24": 0.25, // Level 24 月球：标准重力，环境宜人 —— 真正的威胁是博福特带来的天气
    "56": 0.85, // Level 56 冷冻致伤：极寒 + 永远向下延伸的洞，偏执来得快
  },

  // 第 11 效应：Level 11 的实体受其影响，不会攻击流浪者，只会漫无目的地流浪
  DOCILE_LEVELS: [11],

  // 歇脚层：理智完全不掉（丰裕、不夜城、温水煮青蛙、未来走廊）
  // 这些层级本身就是给玩家喘口气的地方。
  SANITY_REST_LEVELS: [10, 11, 13, 15, 25, 37, "9223372036854775807", "9223372036854775807.-1"],

  // ---- Level 9：郊区 ----
  SUBURB_MILE_TILES: 8,      // 1 英里 ≈ 多少格（路牌进度）
  SUBURB_MILE_MIN: 100,      // 抵达 Level 11 需要的英里数（随机取）
  SUBURB_MILE_MAX: 200,
  SUBURB_FOG_MIN: 30,        // 起浓雾的间隔（秒）—— 浓雾是碾压者的生成机制
  SUBURB_FOG_MAX: 70,
  SUBURB_FOG_DUR: 26,        // 一次浓雾持续多久
  SUBURB_FOG_CRUSHERS: 2,    // 每次浓雾生成几只碾压者
  SUBURB_NIGHT: 0.38,        // 午夜的黑暗程度（叠一层夜色）

  // ---- Level 10：丰裕 ----
  FIELD_TRAIL_GOAL: 190,     // 沿泥土小径累计走够多少格才会走到 Level 11
  FIELD_RAIN_MIN: 26,        // 小雨间隔（秒）
  FIELD_RAIN_MAX: 60,
  FIELD_RAIN_DUR: 16,        // 一场雨持续多久
  FIELD_FOG_MIN: 18,         // 起雾间隔
  FIELD_FOG_MAX: 42,
  FIELD_FOG_DUR: 22,
  LAKE_SANITY: 18,           // 捧起湖水喝一口回复的理智（湖水可安全饮用）
  LAKE_HP: 10,

  // ---- Level 11：不夜城 ----
  CITY_CAR_MIN: 20,          // 街上出现一辆车的间隔（秒）
  CITY_CAR_MAX: 48,
  CITY_DISPENSER_USES: 2,    // 每台饮水机 / 冰柜 / 售货机能取几瓶

  // Level 3：管道蒸汽
  STEAM_MIN: 5,              // 喷汽最小间隔（秒）
  STEAM_MAX: 13,             // 喷汽最大间隔（秒）

  // ---- Level 6：熄灯 ----
  MEMORY_FADE: 55,           // 墙壁记忆（点 / 线）完全消失所需的时间（秒）—— 要慢
  MEMORY_TICK: 0.09,         // 记忆采样间隔（秒）
  MEMORY_REACH: 9,           // 距离墙面多少像素算"碰到了墙"
  MEMORY_MIN_STEP: 3,        // 贴墙移动多少像素才补一段线
  DARK_WHISPER_MIN: 9,       // 幻听最小间隔
  DARK_WHISPER_MAX: 20,

  // ---- Level 7：深海恐惧症 ----
  DEPTH_PER_TILE: 100,       // 每格深度 = 100 米
  DIVE_AIR_MAX: 100,         // 闭气上限（这里的空气能让你憋很久）
  DIVE_AIR_DRAIN: 0.72,      // 水下每秒消耗的闭气（原来 1.1 —— 憋不过来，根本没时间找东西）
  DIVE_AIR_DRAIN_DEEP: 1.05, // 越深消耗越快（原来 1.6）
  DIVE_SWIM_MUL: 0.82,       // 水中移动速度倍率（原来 0.66 —— 比实体还慢，怎么跑）
  SEA_SURF_MUL: 0.46,        // Level 7：踩在海面上的速度倍率（沉不下去，但挪得很慢）
  JET_RIDE_MUL: 1.35,        // Level 7：骑上水上摩托之后的速度倍率（比赤脚趟水快得多）
  ROOM_WATER_MUL: 0.68,      // Level 7：房子里那层积水的速度倍率（比海面好走些）
  BUSH_SLOW_MUL: 0.34,       // Level 10：挤过茂密草丛时的移动速度倍率
  DIVE_PRESSURE_DPS: 3.2,    // 没有潜水服却下到暮色带以下：每秒伤害（原来 6，太狠）
  DIVE_ZONES: [               // 深度分区（米）
    { name: "日光带", from: 0, to: 1000 },
    { name: "暮色带", from: 1000, to: 4000 },
    { name: "午夜带", from: 4000, to: 7000 },
    { name: "深渊带", from: 7000, to: Infinity },
  ],

  // ---- Level 5：锅炉房 ----
  BOILER_HEAT_DPS: 1.5,      // 锅炉房高温：每秒伤害
  // ---- Level 8：岩洞系统 ----
  CAVE_TOXIC_DPS: 5,         // 有毒气体
  CAVE_FLOOD_MIN: 10,        // 涨潮间隔
  CAVE_FLOOD_MAX: 18,
  CAVE_FLOOD_DUR: 6,         // 一次涨潮持续
  CAVE_NEST_DPS: 4,          // 蜘蛛巢
  // ---- Level 10.1：尸湖 ----
  DEADLAKE_DPS: 14,          // 毒水 + 强辐射：能走进去（没有墙拦），但十几秒就没命
  SINLAND_DPS: 7.5,          // Level 486 罪恶之地：空气本身在腐蚀你，不穿全封闭防护服十几秒就没命
  DEADLAKE_SANITY_DPS: 8,    // 泡在水里理智掉得也快
  SANITY_COLLAPSE_HIT: 5,    // Level 0.2：每次坍塌额外扣掉的理智
  SANITY_CHASE_MUL: 2.6,     // 被实体追逐时的倍率（各层级同一套机制）
  ALMOND_CALM_DUR: 14,       // 刚喝下杏仁水后的"压惊"时长（秒）
  ALMOND_CALM_MUL: 0.3,      // 压惊期间理智掉速的倍率
  // Level 0.3：寒冷 —— 每 10 秒扣 1 点血（待得越久越冻）
  ICEROOM_HP_TICK: 10,
  ICEROOM_HP_HIT: 1,
  // 理智够高时身体会慢慢恢复（歇得过来的地方才行）
  REGEN_SANITY_MIN: 50,      // 理智高于这个值才开始回血
  REGEN_HP_PER_SEC: 0.5,
  // Level 11 医院：走进去快速回血（自然回血是 0.5/s，这里快 24 倍）
  HOSPITAL_HEAL_PER_SEC: 12,
  HOSPITAL_SANITY_PER_SEC: 4,
  SANITY_CHASE_LINGER: 12,   // 脱离追逐之后仍然加速的时长（秒）
  SANITY_CHASE_RANGE: 7,     // 判定"正在被追"的距离（格）
  SANITY_BAD_MUL: 2.2,       // 受污染杏仁水：每层都让掉理智更快（可叠加）
  SANITY_BAD_DUR: 22,        // 一层污染的持续（秒）

  // 悲尸循环：理智 ≤ 10 触发，45 秒内必须喝到杏仁水
  WRETCH_TRIGGER: 10,        // 触发阈值（≤ 此值）
  WRETCH_DUR: 45,            // 倒计时（秒）
  WRETCH_DRAIN: 1.35,        // 循环期间：不管在哪个层级，一律以这个"稍快"速度掉
  WRETCH_ESCAPE: 10,         // 理智回到这个值以上就脱离循环

  // 肾上腺素：实体在近距离追你时触发
  ADRENALINE_RANGE: 6,       // 触发距离（格）
  ADRENALINE_DUR: 6,         // 持续（秒）
  ADRENALINE_STAMINA: 30,    // 触发瞬间体力 +30%
  ADRENALINE_DRAIN_MUL: 0.4, // 体力消耗减少 60%
  ADRENALINE_COOLDOWN: 14,   // 冷却（秒）

  // 视野 / 迷雾
  LIGHT_RADIUS: 15,      // 玩家环境光半径（格，平时很暗，靠手电筒照亮）
  EXIT_LIGHT_RADIUS: 2.4, // 出口灯塔半径（格）

  // 环境光：一整圈柔和的圆形光（墙不裁剪光圈）
  AMB_INTENSITY: 0.62,     // 圆形光的擦除强度
  DOOR_BLOCK_ALPHA: 0.9,   // 关闭的门挡光：门后区域重新压暗的强度

  // 手电筒：真正的锥形光（射线扫描成形，不再是"一串圆"）
  FL_LENGTH: 10,        // 光柱长度（格）
  FL_HALF_ANGLE: 0.46,  // 主光锥半角（弧度，约 ±26°）
  FL_SOFT_ANGLE: 0.62,  // 外层柔光半角（更宽更暗，让光锥边缘自然过渡）
  FL_RAY_STEP: 0.028,   // 扫描角步长（弧度，越小边缘越平滑）
  FL_RAY_STEP_LEN: 10,  // 射线行进步长（像素，越小越贴合墙面）
  FL_BEAM_ALPHA: 0.16,  // 屏幕上可见光柱的强度

  // 门
  DOOR_REACH: 1.35,     // 开门交互距离（格）
  DOOR_EXIT_DIST: 20,   // Level 0.2：离入口门多远（格）就在附近刷新新出口门

  // Level 0.2 坍塌（环境危害）
  COLLAPSE_MIN: 6,      // 坍塌事件最小间隔（秒）
  COLLAPSE_MAX: 11,
  COLLAPSE_DUR: 1.4,    // 一次坍塌的持续（秒）

  // 实体（整体削弱：以前追得比玩家走路还快，几乎没有反应时间）
  ENTITY_RADIUS: 12,
  ENTITY_BASE_SPEED: 128,   // 基础追击速度：明显低于玩家疾跑，略低于玩家常速
  ENTITY_LEVEL_SPEED: 5,    // 每层追加的速度
  ENTITY_WANDER_SPEED: 62,  // 游荡速度
  ENTITY_SIGHT: 6.5,        // 实体视野（格）
  ENTITY_MAX_SPEED: 205,    // 追击速度上限（永远追不上全速疾跑）
  ENTITY_WINDUP: 1.1,       // 发现玩家后的"起手"时间：先嘶吼再扑上来，给玩家反应窗口
  ENTITY_WINDUP_MUL: 0.35,  // 起手期间的移动速度倍率
  MAX_ENTITIES_BASE: 1, // 一般只有一个实体

  // 实体种类：不同层级出现不同怪物（名称 / 体色 / 行为差异）
  MONSTERS: {
    bacterium: { // Level 0：黑色鞭毛体（像素重组）
      name: "鞭毛体",
      color: "#07080d",
      radius: 12,
      speedMul: 1,
      wanderMul: 1,
      sightMul: 1,
      lostTime: 3.5,
      spawnDuration: 0.9,
    },
    envoy: {     // Level 37.1：特使 —— 一束红光组成的漂浮立方体
      name: "特使",
      color: "#ff4b45",
      radius: 13,
      speedMul: 1.35,
      wanderMul: 1,
      sightMul: 1.2,
      lostTime: 4,
      spawnDuration: 0.6,
    },
    blind: {     // Level 601 终末：没有视觉、听觉极灵敏的存在
      name: "盲者",
      color: "#2b2a33",
      radius: 15,
      speedMul: 0.85,
      wanderMul: 1,
      sightMul: 0.45,      // 看不见你 —— 但听得见
      lostTime: 2.2,
      spawnDuration: 1.2,
    },
    lurker: {    // Level 1：混凝土色的贴地爬行者（比鞭毛体更快、更执着）
      name: "潜伏者",
      color: "#cfc9bd",
      radius: 13,
      speedMul: 1.0,
      wanderMul: 0.9,
      sightMul: 1.15,
      lostTime: 6,
      spawnDuration: 1.4,
    },
    pipeworm: {  // Level 2+：附着管道的节状长虫（更快、更远视距）
      name: "管栖者",
      color: "#7a4030",
      radius: 12,
      speedMul: 1.0,
      wanderMul: 1,
      sightMul: 1.15,
      lostTime: 4,
      spawnDuration: 0.9,
    },
    // ---- Level 9：郊区（实体横行）----
    crusher: {   // 碾压者：由浓雾生成，庞大、缓慢、不可阻挡
      name: "碾压者", color: "#5a5f66", radius: 17,
      speedMul: 0.72, wanderMul: 0.5, sightMul: 1.35, lostTime: 14, spawnDuration: 2.2,
      shape: "crusher", fogSpawn: true,
    },
    neighborhood: { // 邻里守望：站在自家草坪上，你踏进它的地盘它就会动手
      name: "邻里守望", color: "#2f3a44", radius: 14,
      speedMul: 1.0, wanderMul: 0.35, sightMul: 1.1, lostTime: 8, spawnDuration: 1.3,
      shape: "neighborhood",
    },
    jerry: {     // 杰瑞：手长及膝、总是咧着嘴笑
      name: "杰瑞", color: "#b8b0a0", radius: 13,
      speedMul: 1.22, wanderMul: 1.1, sightMul: 1.05, lostTime: 4, spawnDuration: 0.9,
      shape: "jerry",
    },
    transporter: { // 传送者：会突然出现在你身边
      name: "传送者", color: "#3a3f4a", radius: 13,
      speedMul: 1.1, wanderMul: 1.3, sightMul: 1.2, lostTime: 5, spawnDuration: 1.0,
      shape: "transporter",
    },
    kite: {      // 警告风筝：飘在半空，只有在你往危险处走时才会出现
      name: "警告风筝", color: "#c8c2a8", radius: 12,
      speedMul: 0.55, wanderMul: 0.9, sightMul: 0.7, lostTime: 6, spawnDuration: 1.5,
      shape: "kite",
    },
    worn: {      // 磨损者：从 Level 8 游荡进来的（稀少）
      name: "磨损者", color: "#6b5a4a", radius: 13,
      speedMul: 0.95, wanderMul: 0.8, sightMul: 1.0, lostTime: 5, spawnDuration: 1.2,
      shape: "worn",
    },
    corpseRat: { // 尸鼠：小而快
      name: "尸鼠", color: "#4a4038", radius: 9,
      speedMul: 1.3, wanderMul: 1.4, sightMul: 0.85, lostTime: 2.5, spawnDuration: 0.6,
      shape: "rat",
    },

    // ---- Level 3：发电站（中量实体，种类杂）----
    kitty: {     // Kitty：只在 Level 974 出现。3.2 米高、四肢异常修长、无手无脚、
      // 皮肤黢黑（摸上去像无双黑布料），没有任何面部特征。
      // 它不伤人 —— 只是在你探索和休息的时候，悄无声息地跟在你后面。
      // 对它展露敌意、或者毁坏房子，它就不跟了；食物会消失，理智大幅下降。
      name: "Kitty", color: "#0d0b0e", radius: 16,
      speedMul: 0.9, wanderMul: 0.55, sightMul: 0.5, lostTime: 12, spawnDuration: 2.2,
      shape: "kitty",
      docile: true,                 // 不主动攻击
      tall: true,                   // 占两格高
    },
    lurker30: {  // 记忆潜伏者：只在 Level 30 出现。外表酷似鱿鱼，能在天上飞。
      // 它会用触手抓住你的头，把你的记忆改掉 —— 被改过的人管这叫「腐化」，
      // 会一直说这里很安全。腐化满了，你就再也醒不过来了。
      name: "记忆潜伏者", color: "#6f5aa8", radius: 14,
      speedMul: 1.05, wanderMul: 1.1, sightMul: 1.25, lostTime: 6, spawnDuration: 1.6,
      shape: "lurker30",
      flying: true,                 // 飘在半空，不走地面
    },
    bride: {     // 新娘：只在 Level 485 蒙黑天空自然刷出。个头比人小一号，
      // 一身发黄的白婚纱，拖着长长的头纱 —— 碰到就是死。
      name: "新娘", color: "#d8d2c4", radius: 8,
      speedMul: 0.9, wanderMul: 0.7, sightMul: 1.35, lostTime: 6, spawnDuration: 1.6,
      shape: "bride",
      lethal: true,                // 碰到即死（不是掉血）
    },
    hound: {     // 猎犬：四足、贴地疾走
      name: "猎犬", color: "#3a2a22", radius: 13,
      speedMul: 1.18, wanderMul: 1.25, sightMul: 1.2, lostTime: 5, spawnDuration: 0.7,
      shape: "hound",
    },
    faceling: {  // 无面灵：苍白人形，脸上什么都没有
      name: "无面灵", color: "#d8d3c6", radius: 12,
      speedMul: 0.95, wanderMul: 0.8, sightMul: 1.0, lostTime: 3.5, spawnDuration: 1.1,
      shape: "faceling",
    },
    partypooper: { // 派对客：黄色皮肤、脸上画着僵硬的微笑，看见你就追，还会呼叫同伴
      name: "派对客", color: "#e8c53a", radius: 13,
      speedMul: 1.22, wanderMul: 1.0, sightMul: 1.5, lostTime: 7, spawnDuration: 0.5,
      shape: "partypooper",
      callsAllies: true,           // 发现你会呼叫附近的同伴一起围上来
    },
    mimic21: {   // 拟态：伪装成你的样子靠近，离得远就会消失
      name: "拟态", color: "#6b6b6b", radius: 12,
      speedMul: 1.0, wanderMul: 0.7, sightMul: 1.0, lostTime: 3, spawnDuration: 1.4,
      shape: "mimic",
    },
    smiler: {    // 笑魇：黑暗里只剩一张咧开的嘴
      name: "笑魇", color: "#0d0d10", radius: 13,
      speedMul: 1.05, wanderMul: 0.9, sightMul: 1.1, lostTime: 4.5, spawnDuration: 1.2,
      shape: "smiler",
    },
    moth: {      // 死亡飞蛾：飘忽，忽快忽慢
      name: "死亡飞蛾", color: "#8a7f63", radius: 11,
      speedMul: 1.0, wanderMul: 1.4, sightMul: 0.9, lostTime: 2.5, spawnDuration: 0.8,
      shape: "moth",
    },
    limb: {      // 肢团：一堆纠缠的肢体
      name: "肢团", color: "#6b3f3f", radius: 14,
      speedMul: 0.85, wanderMul: 0.7, sightMul: 0.85, lostTime: 3, spawnDuration: 1.3,
      shape: "limb",
    },
    // ---- Level 5：恐怖旅馆（这里是死亡飞蛾的核心巢穴之一）----
    deathmoth: { // 死亡飞蛾：飘忽不定，成群从黑房间里涌出
      name: "死亡飞蛾", color: "#8a7f63", radius: 11,
      speedMul: 1.0, wanderMul: 1.45, sightMul: 0.95, lostTime: 2.5, spawnDuration: 0.8,
      shape: "moth",
    },
    skinstealer: { // 窃皮者：披着一张不属于自己的皮
      // 循环：伪装成流浪者（温顺 20~40 秒，不主动攻击，除非你贴得太近）
      //   → 进食期：顶着那张人脸、可能还打着手电，朝你冲过来
      //   → 冲到跟前才露出真面目 —— 一身松松垮垮、不贴合身体的白皮
      //   → 进食完毕：3~5 秒的"贴合"，皮一点点绷回人样，重新温顺。
      // 皮是惨白的：被它吃掉的人体内没有血液。眼睛会发光。
      // 真面目占两格高，但碰撞半径照旧 —— 一格高的通道它照样钻得过去。
      name: "窃皮者", color: "#3b2a22", radius: 13,
      speedMul: 1.05, wanderMul: 0.85, sightMul: 1.1, lostTime: 5, spawnDuration: 1.2,
      shape: "skinstealer",
      skinCalmMin: 20, skinCalmMax: 40,   // 温顺期（流浪者形态）时长（秒）
      skinMendMin: 3, skinMendMax: 5,     // 皮重新贴合的时长（秒）
      skinFeed: 6,                        // 露出真面目后的"进食"时长（秒）
      skinHuntMax: 12,                    // 进食期最长持续多久（冲不到就作罢）
      skinProvoke: 2.2,                   // 温顺期里你靠多近（格）会把它激怒
      skinReveal: 3.0,                    // 冲到你多近（格）时露出真面目
    },
    watcher: {   // 观察者：不动，只是盯着你
      name: "观察者", color: "#101014", radius: 13,
      speedMul: 0.62, wanderMul: 0.25, sightMul: 1.25, lostTime: 9, spawnDuration: 1.6,
      shape: "watcher",
    },
    woodling: {  // 木灵：像用旧木头削出来的人
      name: "木灵", color: "#6b4a2a", radius: 12,
      speedMul: 0.9, wanderMul: 0.8, sightMul: 0.95, lostTime: 3, spawnDuration: 1.1,
      shape: "woodling",
    },
    cryer: {     // 啼物：一直在哭的东西
      name: "啼物", color: "#241a1a", radius: 12,
      speedMul: 1.0, wanderMul: 0.9, sightMul: 1.05, lostTime: 4, spawnDuration: 1.0,
      shape: "cryer",
    },
    corpseRat: { // 尸鼠：小而快
      name: "尸鼠", color: "#4a3b33", radius: 9,
      speedMul: 1.22, wanderMul: 1.5, sightMul: 0.95, lostTime: 2.5, spawnDuration: 0.6,
      shape: "rat",
    },
    ant89: {     // Entity 89 · 蚂蚁：成群的小东西
      name: "Entity 89 · 蚂蚁", color: "#1c1712", radius: 10,
      speedMul: 1.12, wanderMul: 1.3, sightMul: 0.9, lostTime: 3, spawnDuration: 0.7,
      shape: "ant",
    },
    samantha: {  // Entity 26 · 萨曼莎：带点优质的肉，她就不会为难你
      name: "萨曼莎", color: "#d9c8a8", radius: 12,
      speedMul: 0.95, wanderMul: 0.7, sightMul: 1.1, lostTime: 4, spawnDuration: 1.2,
      shape: "samantha", pacifiedBy: "meat",
    },
    nguithr: {   // Nguithr'xurh：未被描述的那个东西
      name: "Nguithr'xurh", color: "#2b1430", radius: 15,
      speedMul: 0.95, wanderMul: 0.8, sightMul: 1.0, lostTime: 4, spawnDuration: 1.5,
      shape: "limb",
    },
    // ---- Level 8：岩洞系统 ----
    herdsnake: { // 牧蛇：会钻进岩层，只在接近猎物时才化为实体
      name: "牧蛇", color: "#6e6a63", radius: 17,
      speedMul: 1.3, wanderMul: 1.1, sightMul: 1.15, lostTime: 6, spawnDuration: 1.4,
      shape: "snake",
    },
    spider: {    // 蛛形纲：成片占据洞穴
      name: "洞穴蛛群", color: "#2a2320", radius: 11,
      speedMul: 1.05, wanderMul: 1.25, sightMul: 1.0, lostTime: 3.5, spawnDuration: 0.7,
      shape: "spider",
    },
    // ---- Level 7：深海恐惧症 ----
    thing7: {    // 七层之物：长期活在黑暗里，对光线极其敏感
      name: "七层之物", color: "#0a0e14", radius: 19,
      speedMul: 1.3, wanderMul: 0.95, sightMul: 1.2, lostTime: 6, spawnDuration: 1.8,
      shape: "thing7", lightShy: true,
    },
    wretch: {    // 悲尸：理智归零后变成的那种东西
      name: "悲尸", color: "#7a2020", radius: 13,
      speedMul: 1.05, wanderMul: 1.1, sightMul: 1.25, lostTime: 8, spawnDuration: 0.7,
      shape: "wretch",
    },
    xiaoxiao: {  // 小小：听觉强得离谱，巨大的噪音会把它引过来
      name: "小小", color: "#cfd8d0", radius: 14,
      speedMul: 1.22, wanderMul: 1.0, sightMul: 1.0, lostTime: 5, spawnDuration: 1.2,
      shape: "xiaoxiao", noiseSeeker: true,
    },
  },

  // 生成
  SPAWN_MIN_INTERVAL: 3.2,
  SPAWN_MAX_INTERVAL: 7.5,
};

// ---------- 工具函数 ----------
function rand(a, b) { return a + Math.random() * (b - a); }
function randInt(a, b) { return Math.floor(rand(a, b + 1)); }
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function lerp(a, b, t) { return a + (b - a) * t; }
function dist2(ax, ay, bx, by) { const dx = bx - ax, dy = by - ay; return dx * dx + dy * dy; }

// 确定性伪随机（用于绘制贴图噪点，避免闪烁）
function hash2(x, y) {
  let n = (x * 73856093) ^ (y * 19349663);
  n = (n ^ (n >> 13)) * 1274126177;
  n = n ^ (n >> 16);
  return (n >>> 0) / 4294967296;
}

function fmtTime(sec) {
  const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
  return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
}

// 层级显示名（用于 HUD）
function levelLabel(level) {
  const d = levelDef(level);
  // 枢纽是隐秘层级，HUD 上要写出全名，光一个 "HUB" 看不出是什么地方
  if (String(level) === "hub") return d.name;      // "隐秘层级 —— 枢纽"
  return d.label;
}

// ---------- 服装 ----------
// 在主菜单「服装」里切换；解锁条件写进 unlock 字段（存档在 localStorage）
const OUTFITS = {
  drifter: {
    key: "drifter", name: "流浪者", unlock: null,
    desc: "你切入后室时身上穿的那套。普通的衣服，普通的命。",
    body: "#e9e2c9", skin: "#f2d8b6", hair: "#4a3a2a",
  },
  hazmat: {
    key: "hazmat", name: "生化防护服", unlock: "clear0",
    desc: "M.E.G. 遗留的黄色全封闭防护服，配黑色防毒面具。通关 Level 0 后解锁；从 Level 4 切出后可以自己调色。",
    body: "#f2c518", skin: "#2b2b2b", hair: "#1a1a1a",   // 黄色连体服 + 黑色面具
    suit: true,
    recolorUnlock: "clear0",        // 解锁这套衣服之后就能调色（以前要再切出 Level 4）
  },
  ksuit: {
    key: "ksuit", name: "K 版防化服", unlock: null,
    // 不在主菜单的「服装」里选 —— 只能在新时代广场买了之后从背包里穿上。
    // （主菜单那套「生化防护服」挡不住 Level 301 的空气。）
    hidden: true,
    desc: "B.N.T.G 用 8 瓶杏仁水换给您的全封闭防化服。眼罩是一整块黑色长方形玻璃，"
        + "接缝压了胶条，背后背着滤毒罐。目前已知唯一能挡住 Level 301 空气的东西。",
    body: "#4a5540", skin: "#1c1c1c", hair: "#141414",
    suit: true,          // 有面罩（走 drawPlayer 的防毒面具分支）
    kversion: true,      // K 版：眼罩变成长方形黑玻璃 + 更多细节
  },
  electrician: {
    key: "electrician", name: "发电站检修服", unlock: "reach3",
    desc: "Level 3 电力班组的工作服，带反光条。抵达 Level 3 后解锁。",
    body: "#e07a1f", skin: "#f2d8b6", hair: "#3a2a1a",   // 橙色检修服 + 反光条
    vest: true,
  },
};

// ---------- 物品 ----------
// almond   杏仁水：回复理智
// bad      受污染的杏仁水：也回理智，但扣血 + 减速，且无法疾跑
// crowbar  撬棍：开箱子的工具（拿在手上就不占格子）
const ITEMS = {
  // 摄像机：开局自带的副手物品，拍下来的东西会进档案手册的「视频档案」
  camera: {
    key: "camera", name: "摄像机", short: "摄像机",
    desc: "一台老式 M.E.G 摄像机，开局就挂在副手槽上。副手默认按 4 使用；副手拿着它时按 L 才是录像。"
        + "录像要先装一卷胶卷：按下就消耗掉，录完变成只能观看的录像带。"
        + "玩家视角全程正常，花屏只留在录像带里。换进背包或主物品槽后改成点一下使用，L 不再录像。",
    effect: "装上胶卷按 L 录像 · 被实体吃掉时录像带会以「M.E.G录像带结束」收尾",
    stack: 1,
  },
  // 数码相机：B.N.T.G 商城 20 瓶杏仁水 / 100 枚货币，随机附送 3 颗电池
  digicam: {
    key: "digicam", name: "数码相机", short: "数码相机",
    desc: "B.N.T.G 进的一批数码相机，比 M.E.G 那台老机器干净得多：720P、每秒 30 帧，"
        + "花屏特效很轻，画面看得清。得装电池才能开机 —— 一颗电池正好撑 3 分钟，"
        + "录满自动停，想再录得换一颗。买机器送 3 颗，物资箱里也有小概率翻到。",
    effect: "耗 1 颗电池 · 录 3 分钟 · 720P · 30 帧每秒 · 录完变成一卷只能看的录像带",
    stack: 1,
  },
  battery: {
    key: "battery", name: "相机电池", short: "电池",
    desc: "给数码相机用的方块电池。一颗能录 3 分钟（720P / 30 帧每秒）。"
        + "物资箱里 5% 的概率翻得到，B.N.T.G 商店 2 瓶杏仁水或 10 枚货币也能补。",
    effect: "给数码相机充电 · 一颗 = 一次 3 分钟录制",
    stack: 9,
  },
  // 胶卷：一卷只能录一次，帧间隔恒定
  film_normal: {
    key: "film_normal", name: "普通胶卷", short: "普通胶卷",
    desc: "B.N.T.G 灌装的普通胶卷。装进摄像机能录 12 秒、每秒 24 帧，整卷里每一帧的间隔都一样。"
        + "开局自带 4 卷，商人之家和 Level 11 的柜台都能补货。",
    effect: "录 12 秒 · 24 帧每秒 · 用掉后变成一卷只能看的录像带",
    stack: 9,
  },
  film_premium: {
    key: "film_premium", name: "高级胶卷", short: "高级胶卷",
    desc: "银色封皮的高级胶卷，比普通的多一倍还多的时长，也拉满了帧数：30 秒、每秒 30 帧，"
        + "帧间隔同样严格一致。",
    effect: "录 30 秒 · 30 帧每秒 · 用掉后变成一卷只能看的录像带",
    stack: 9,
  },
  tape: {
    key: "tape", name: "录像带", short: "录像带",
    desc: "已经拍完的一卷胶卷，封条写好了层级和日期。不能再拿去录第二次，"
        + "只能在视频档案里观看、导出，或者丢在地上让别的流浪者捡去看。",
    effect: "只能观看 / 导出 / 丢弃 · 无法再次录制",
    stack: 9,
  },
  // 记忆汁：Level 601「假现实」售货机里的东西，商人之家也有的卖（Level 11 不卖）
  memoryjuice: {
    key: "memoryjuice", name: "记忆汁", short: "记忆汁",
    desc: "一小瓶泛着柔光的液体。喝下去会有那么一阵子，一切都好得不像真的 —— "
        + "理智回满，而且有段时间一点都不掉。可劲儿过去之后，脑子垮得比先前更快。"
        + "越喝，好受的时间越短，垮得越凶。杏仁水能把这股劲儿压下去一点。",
    effect: "理智回满 · 一段时间不掉理智 · 之后掉得更快（成瘾，越喝越重）",
    stack: 9,
  },
  // 喷枪：Level 0.3 冰块太大，得用喷枪处理
  torch: { key: "torch", name: "喷枪", short: "喷枪", desc: "喷出的火苗能化开挡路的冰块。靠近冰块使用。", stack: 1 },
  almond: {
    key: "almond", name: "杏仁水", short: "杏仁水",
    desc: "后室里最常见的补给。喝下能压住幻觉、让脑子重新清醒一点。",
    effect: "理智 +35 · 生命 +8",
  },
  bntgcoin: {
    key: "bntgcoin", name: "B.N.T.G 货币", short: "B.N.T.G 币",
    desc: "B.N.T.G 发行的代币 —— 后室里少数被普遍认的硬通货。1 瓶杏仁水兑 5 枚，也能按同样的比例换回去。",
    effect: "在新时代广场的柜台当钱花（1 瓶杏仁水 = 5 枚）",
  },
  bad: {
    key: "bad", name: "受污染的杏仁水", short: "污染杏仁水",
    desc: "闻起来还是那股杏仁味，但瓶底沉着说不清的絮状物。喝下去能压住幻觉 —— 代价是你的身体。",
    effect: "理智 +20 · 生命 -45（可叠加）· 无法疾跑且移速减慢",
  },
  ksuit: {
    key: "ksuit", name: "K 版防化服", short: "防化服",
    desc: "全封闭防化服。点击穿上它 —— 它会替换你现在的衣服，也是唯一能让你在 Level 301 里多活一会儿的东西。",
    effect: "穿上后替换当前服装 · 抵御 Level 301 的腐蚀性空气",
  },
  warpberry: {
    key: "warpberry", name: "野生迁跃浆果", short: "野生浆果",
    desc: "野生浆果丛上结的果子，紫得发黑，捏一下会微微发烫。"
        + "吃下第一颗，你会记住自己站在哪一层；吃下第二颗，它就把你送回那里。"
        + "只有 Level 4、5、10、11 找得到 —— 别的地方不长这个。",
    effect: "第一颗：记住当前层级 · 第二颗：回到那里",
    stack: 9,
  },
  bntgwarp: {
    key: "bntgwarp", name: "B.N.T.G 迁跃浆果", short: "人工浆果",
    desc: "B.N.T.G 照着野生浆果培育出来的一批，个头更匀、颜色更亮。"
        + "第一颗同样是记住层级，第二颗却不再把你送回原处 —— "
        + "它把你困在 Level 10，从那以后任何切出的办法都会失效。",
    effect: "第一颗：记住当前层级 · 第二颗：被困 Level 10（不可逆）",
    stack: 9,
  },
  choc: {
    key: "choc", name: "巧克力棒", short: "巧克力",
    desc: "从等候厅的储物柜里翻出来的。包装纸皱巴巴的，巧克力没有化 —— 这一层很冷。",
    effect: "理智 +8 · 生命 +12",
    stack: 9,
  },
  soda: {
    key: "soda", name: "软饮料", short: "软饮料",
    desc: "等候厅那排自动售货机里卖的东西，牌子你一个都没见过。冰的，甜得发腻。",
    effect: "理智 +10 · 生命 +6",
    stack: 9,
  },
  hotchoc: {
    key: "hotchoc", name: "热巧克力", short: "热巧克力",
    desc: "赢了攀岩游戏之后凭空出现在房间中央的一杯。捧在手里，指尖才有了知觉。",
    effect: "理智 +12 · 生命 +18 · 身上暖和一阵",
    stack: 9,
  },
  wintercoat: {
    key: "wintercoat", name: "冬装衣物", short: "冬装",
    desc: "一整套厚衣服：外套、帽子、手套。是攀岩游戏的奖品 —— 也是唯一能让你在 Level 20 里"
        + "多撑一会儿的东西。穿上之后身上的冷会退下去一阵。",
    effect: "穿上后抵御 Level 20 的低温（一段时间）",
    stack: 3,
  },
  spacedrink: {
    key: "spacedrink", name: "太空主题饮料", short: "太空饮料",
    desc: "打爆小行星赢来的。瓶子做成火箭的样子，里面是某种说不清的液体 —— 能喝，而且管饱。",
    effect: "理智 +20 · 生命 +14",
    stack: 9,
  },
  memoryjar: {
    key: "memoryjar", name: "记忆罐", short: "记忆罐",
    desc: "一只玻璃罐，里面飘着一段说不清是谁的记忆。躲过激光之后它出现在房间中央 —— "
        + "盯着看久了，你会想起一些从来没发生过的事。",
    effect: "理智 +30 · 收进档案手册",
    stack: 3,
  },
  coldsuit: {
    key: "coldsuit", name: "防寒服", short: "防寒服",
    desc: "从冻住的木箱里撬出来的一整套防寒服 —— 类似于现代宇航服，接缝处结着"
        + "一层白霜。它是唯一能让你忍受 Level 56 最冷部分的东西。点击穿上。",
    effect: "穿上后抵御 Level 56 的极寒（仅限本局）",
    stack: 3,
  },
  energybar: {
    key: "energybar", name: "能量棒", short: "能量棒",
    desc: "天顶站研究区里配给的高热量口粮，包装上印着一串看不懂的编号。"
        + "咬一口，身上和脑子都松快一点 —— 这是那座空间站里唯一还算新鲜的东西。",
    effect: "理智 +25 · 生命 +30",
    stack: 9,
  },
  hermes: {
    key: "hermes", name: "赫尔墨斯装置", short: "赫尔墨斯",
    desc: "一台违背伦理的设备，M.E.G 正在全面封杀。它需要人脑、层级密钥（要溶进记忆汁）"
        + "和苦痛汁液才做得出来 —— 原理是让那颗脑子去想象某个层级，把人送过去。"
        + "每传送一次，人脑就退化一点，退到一定程度就得换一颗新的。"
        + "只能在 Level 4 的办公电脑上发邮件订购（50 瓶杏仁水，不收 B.N.T.G 货币）。",
    effect: "打开层级选择界面 · 传送到前后 50 个层级以内、且已经存在的地方 · 消耗一次耐久",
    stack: 1,
  },
  teddy: {
    key: "teddy", name: "毛绒玩具熊", short: "玩具熊",
    desc: "一只洗得发白、掉了只耳朵的毛绒玩具熊。Level 11 那间屋子里捡到的。"
        + "说不上为什么，你总觉得它是个「可爱」的东西 —— 而这类东西，后室是认的。",
    effect: "「可爱」物件 —— 带着它切行时，有极小概率被送到 Level 974",
    cute: true,
    stack: 1,
  },
  plush: {
    key: "plush", name: "毛绒玩具", short: "毛绒玩具",
    desc: "kitty 之家卧室里到处都是这种小玩意儿。软乎乎的，看着就让人想起小时候。",
    effect: "「可爱」物件",
    cute: true,
    stack: 9,
  },
  marshmallow: {
    key: "marshmallow", name: "油腻棉花糖", short: "棉花糖",
    desc: "一层油汪汪的糖衣裹着棉花糖。吃下去是甜的，回味有点腻。",
    effect: "生命 +10 · 理智 +5",
    stack: 9,
  },
  crowbar: {
    key: "crowbar", name: "撬棍", short: "撬棍",
    desc: "一根锈迹斑斑的铁撬棍。补给箱的木盖得靠它撬开。",
    effect: "可撬开补给箱",
  },
  meat: {
    key: "meat", name: "优质肉", short: "优质肉",
    desc: "一块上好的生肉。据说带着它去见「萨曼莎」，她就不会为难你。",
    effect: "萨曼莎闻到肉香便不会追你",
  },

  divesuit: {
    key: "divesuit", name: "潜水服", short: "潜水服",
    desc: "一套厚实的潜水服，锁在某座房子的积水里。没有它，暮色带以下的水压会把你压垮。",
    effect: "可承受深水水压",
  },
  submarine: {
    key: "submarine", name: "微型潜艇", short: "潜艇",
    desc: "折叠式单人潜艇，勉强还能开。想去午夜带的海底，非它不可。",
    effect: "可下潜到午夜带海底",
  },
  block: {
    key: "block", name: "掉漆的积木", short: "积木",
    desc: "一块掉了漆的木头积木，边角被磨得发亮。拿在手里，会想起一些很旧的事。",
    effect: "捡起它 —— 据说会带你去一个满是回忆的地方",
  },
  frog: {
    key: "frog", name: "发条青蛙", short: "发条青蛙",
    desc: "上了发条就会一跳一跳的铁皮青蛙。拧不动了，但还认得出来。",
    effect: "捡起它 —— 据说会带你去一个满是回忆的地方",
  },
  subkey: {
    key: "subkey", name: "潜艇钥匙", short: "潜艇钥匙",
    desc: "一枚黄铜钥匙，泡在某座房子的积水里。没有它，潜艇的舱门纹丝不动。",
    effect: "与潜水服一起才能开走潜艇",
  },
  bag1: {
    key: "bag1", name: "小挎包", short: "小挎包",
    desc: "一条磨得发白的布带子，挎在肩上刚好。装不了多少，但比空着手强。",
    effect: "背包容量 +10",
    equip: true,
  },
  bag2: {
    key: "bag2", name: "中型背包", short: "中背包",
    desc: "酒店失物招领处常见的那种双肩包，隔层还挺多。",
    effect: "背包容量 +25",
    equip: true,
  },
  bag3: {
    key: "bag3", name: "大型背包", short: "大背包",
    desc: "矿工用的帆布背包，带子勒得肩膀生疼 —— 但真的能装。",
    effect: "背包容量 +50",
    equip: true,
  },
  bag4: {
    key: "bag4", name: "管理员背包", short: "管理员背包",
    desc: "这个不该存在于后室里。缝线整齐得像机器做的，内衬上印着一行小字：ADMIN ONLY。",
    effect: "背包容量 +75（只有管理员终端能召唤出来）",
    equip: true,
  },
  key: {
    key: "key", name: "电梯钥匙", short: "钥匙",
    desc: "一片厚重的黄铜钥匙，齿型很旧。能打开 Level 3 电梯外的上锁铁栅栏。",
    effect: "可打开电梯的铁栅栏",
  },
};
