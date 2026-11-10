"use strict";

// ======== 地图生成 ========
// 统一地图结构（所有层级共用）：
// {
//   size, level, doubleStory,
//   layers: [grid0, grid1?],        // 每层一个网格：0=地板 1=墙
//   floors: [floorList0, floorList1?],
//   start: {x, y, floor},
//   exit:  {x, y, floor},
//   rooms: [rooms0, rooms1?],
//   doors: [{x, y, floor, open, kind, ...}],  // kind: normal | red | entry02 | exit02
//   closedDoors: Set("floor:x,y"),   // 关闭的门（阻挡移动与视线）
//   ramps: [{x, y, w, h, floorA, floorB}],    // 斜着的正方形地面（连接上下层）
//   redFloor: Set("x,y"),            // 红门周围被染红的地面
//   transit                          // 渐变走廊（暂未启用）
// }

// 背包掉落：挎包 / 背包散落在各层级里，捡到就永久扩大背包容量。
// Level 1 与 Level 4 —— 小挎包（+10）；Level 5 —— 中型背包（+25）；Level 8 —— 大型背包（+50）
function dropBag(map, level) {
  const BAGS = { 1: "bag1", 4: "bag1", 5: "bag2", 8: "bag3" };
  const key = BAGS[level];
  if (!key) return;
  map.ground = map.ground || [];
  const f0 = map.start.floor || 0;
  const floors = floorList(map, f0);
  if (!floors.length) return;
  const used = new Set((map.ground || []).map((i) => i.x + "," + i.y));
  for (let i = 0; i < 200; i++) {
    const t = floors[randInt(0, floors.length - 1)];
    if (!t) break;
    const k = t.x + "," + t.y;
    if (used.has(k)) continue;
    if (isClosedDoor(map, t.x, t.y, f0)) continue;
    if (Math.hypot(t.x - map.start.x, t.y - map.start.y) < 5) continue;
    map.ground.push({ x: t.x, y: t.y, floor: f0, item: key, taken: false });
    return;
  }
}

// 野生迁跃浆果 —— 只有 Level 4 / 5 / 10 / 11 找得到。
//   Level 10：野生浆果丛（一丛 5 颗）—— 唯一长着浆果丛的层级
//   Level 4 / 5 / 11：都是盒装的（一盒 4 颗），11 还是小概率
const WARP_BERRY_PLAN = {
  4:  { type: "berrybox",  tries: 1, chance: 1.0,  note: "box"  },
  5:  { type: "berrybox",  tries: 1, chance: 1.0,  note: "box"  },
  10: { type: "berrybush", tries: 2, chance: 1.0,  note: "wild" },
  11: { type: "berrybox",  tries: 1, chance: 0.35, note: "box"  },
};
function dropWarpBerry(map, level) {
  const plan = WARP_BERRY_PLAN[Number(level)];
  if (!plan) return;
  if (Math.random() > plan.chance) return;
  const f0 = map.start.floor || 0;
  const floors = floorList(map, f0);
  if (!floors.length) return;
  const used = new Set((map.ground || []).map((i) => i.x + "," + i.y));
  for (const p of (map.props || [])) used.add(p.x + "," + p.y);
  let placed = 0;
  for (let n = 0; n < plan.tries; n++) {
    for (let i = 0; i < 300; i++) {
      const t = floors[randInt(0, floors.length - 1)];
      if (!t) break;
      const k = t.x + "," + t.y;
      if (used.has(k)) continue;
      if (isClosedDoor(map, t.x, t.y, f0)) continue;
      if (Math.hypot(t.x - map.start.x, t.y - map.start.y) < 6) continue;
      used.add(k);
      (map.props = map.props || []).push({ x: t.x, y: t.y, floor: f0, type: plan.type });
      placed++;
      break;
    }
  }
  if (placed) map.hasWarpBerry = true;
}

// 每个层级的生成种子（写在 js/level/levelN.js 里）
function levelSeed(level) {
  const B = (typeof window !== "undefined") && window.LEVEL_BUILDINGS;
  const d = B && B[String(level)];
  if (d && d.seed != null) return d.seed >>> 0;
  // 没写进 js/level/*.js 的层级：用编号本身算个稳定种子，
  // 免得所有新层级共用种子 1（那样几次生成会撞出很像的地形）。
  const st = String(level);
  let h = 2166136261 >>> 0;
  for (let i = 0; i < st.length; i++) { h ^= st.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return (h || 1) >>> 0;
}

// 线性同余：给定种子就得到一条固定的随机序列
function seededRandom(seed) {
  let s = (seed >>> 0) || 1;
  return function () {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// ===========================================================================
// 同一层级每次进入都是同一张地图：生成期间把 Math.random 换成固定种子的
// 伪随机，生成完立刻恢复。
// 只有 Level 14 例外 —— 它是无限的，且地形本来就该随机。
// ===========================================================================
// 联机时房间里每个人都要在同一张地图上 —— 用房间号当种子覆盖掉层级的默认种子，
// 这样同一局里所有人看到的地形、物资、门的位置完全一致。
let mpSeed = null;
let mpCount = 1;                        // 联机人数：Level 7 的潜水服按人数刷新
function setMPSeed(seed) { mpSeed = (seed == null ? null : String(seed)); }
function getMPSeed() { return mpSeed; }
function setMPCount(n) { mpCount = Math.max(1, Math.min(8, n | 0 || 1)); }
function getMPCount() { return mpCount; }
window.setMPSeed = setMPSeed;
window.setMPCount = setMPCount;

function generateMap(level) {
  if (String(level) === "14") return generateParadiseMap(level);
  const orig = Math.random;
  Math.random = seededRandom(mpSeed || levelSeed(level));
  try {
    const m = generateMapInner(level);
    m.mpCount = mpCount;
    m.mpSeed = mpSeed || null;
    // 摄像机是开局自带的副手物品，不再往地图里刷 —— 以前在 1 / 4 / 11 各撒一台，
    // 现在拾取只会多出第二台，跟「自带」冲突。
    // 1.3.0：除 Level 1 / 4 / 11 之外，散落的补给统一削一轮。
    trimSuppliesForBalance(m, level);
    return m;
  } finally {
    Math.random = orig;                 // 一定要还原，否则别处的随机也跟着定死了
  }
}

// ---------------------------------------------------------------------------
// 1.3.0：削减其它层级散落的杏仁水与物资（Level 1 / 4 / 11 保持原样）
//   只动「普通补给」；钥匙、背包、浆果、纪念品这类任务物品一件不碰。
//   箱子里的 loot 也跟着减半 —— 免得开一个箱子还是能抱出四瓶。
// ---------------------------------------------------------------------------
const LOOT_TRIM_KEEP = { 1: 1, 4: 1, 11: 1 };
const TRIM_ITEMS = new Set(["almond", "bad", "crowbar", "meat", "torch", "choc", "soda",
  "hotchoc", "spacedrink", "memoryjar", "energybar"]);
function trimSuppliesForBalance(map, level) {
  if (!map || LOOT_TRIM_KEEP[String(level)] || LOOT_TRIM_KEEP[level]) return map;
  const KEEP = 0.45;
  // 地上的散落物：普通补给按 KEEP 保留，任务物品全留
  if (Array.isArray(map.ground)) {
    const kept = [];
    let cuttable = 0;
    for (const it of map.ground) if (TRIM_ITEMS.has(it.item)) cuttable++;
    let budget = Math.floor(cuttable * KEEP);
    for (const it of map.ground) {
      if (TRIM_ITEMS.has(it.item)) {
        if (budget > 0) { kept.push(it); budget--; }
      } else kept.push(it);
    }
    map.ground = kept;
  }
  // 补给箱：数量砍到六成，箱里那几瓶再减半
  if (Array.isArray(map.crates)) {
    map.crates = map.crates.filter(() => Math.random() < 0.6);
    for (const c of map.crates) {
      if (c.loot > 0) c.loot = Math.max(0, Math.floor(c.loot / 2));
    }
  }
  return map;
}

function generateMapInner(level) {
  // 所有层级生成完之后统一注入新层级的入口物件。
  // 之前只对 11 / 70 / 4 三个层级注入，Level 25 的其它入口层级（0/5/9/19/37）
  // 就漏掉了 —— 那些层里找不到任何能进 Level 25 的东西。
  return ensureMapBase(spawnNewLevelLinks(generateMapDispatch(level)));
}

// ---------- 地图必填字段的兜底 ----------
// 新层级的生成器是各自写的，很容易漏掉通用逻辑要用到的字段。
// 漏一个就会在主循环里抛异常（被 [loop] 的 try/catch 吞掉），
// 表现是"整屏黑 + 玩家动不了"。这里统一补齐，一劳永逸。
function ensureMapBase(map) {
  if (!map || typeof map !== "object") return map;
  if (!map.doors) map.doors = [];
  if (!map.props) map.props = [];
  if (!map.crates) map.crates = [];
  if (!map.ground) map.ground = [];
  if (!map.closedDoors) map.closedDoors = new Set(
    map.doors.filter(d => !d.open).flatMap(d => (d.tiles || []).map(t => (d.floor | 0) + ":" + t.x + "," + t.y))
  );
  if (!map.floors) map.floors = (map.layers || []).map(() => null);
  if (!map.rooms) map.rooms = (map.layers || []).map(() => []);
  fixStartInsideWall(map);
  return map;
}

// 出生点落在墙里：玩家一进来就动不了（四面都是墙），看着像"卡死"。
// 这里做一次 BFS，把它挪到最近的一格能站的地方。
function fixStartInsideWall(map) {
  const st = map.start;
  const grid = map.layers && map.layers[0];
  if (!st || !grid || !map.size) return;
  const f = st.floor | 0;
  const g0 = map.layers[Math.min(f, map.layers.length - 1)] || grid;
  const ok = (x, y) => x >= 0 && y >= 0 && x < map.size && y < map.size && g0[y][x] === 0;
  if (ok(st.x, st.y)) return;
  const seen = new Set(), q = [[st.x | 0, st.y | 0]];
  seen.add((st.x | 0) + "," + (st.y | 0));
  let best = null;
  while (q.length && !best) {
    const [x, y] = q.shift();
    if (ok(x, y)) { best = { x, y }; break; }
    for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + d[0], ny = y + d[1], k = nx + "," + ny;
      if (nx < 0 || ny < 0 || nx >= map.size || ny >= map.size || seen.has(k)) continue;
      seen.add(k); q.push([nx, ny]);
    }
  }
  if (best) { st.x = best.x; st.y = best.y; }
  if (map.spawnPts && map.spawnPts.length) {
    map.spawnPts[0] = { x: st.x, y: st.y, floor: st.floor | 0 };
  }
}

function generateMapDispatch(level) {
  // 保险：纯数字的层级编号统一转成数字。传成字符串的话
  // "level === 25" 这种判断会全部落空，"25" >= 2 又是真的，
  // 结果掉进 generateTunnelMap —— 玩家看到的是 Level 2 的管道。
  if (typeof level === "string" && /^[0-9]+$/.test(level) && String(Number(level)) === level) {
    level = Number(level);
  }
  // 反过来：带小数点的编号（37.1 这种）被转成数字后，下面 "level === '37.1'"
  // 就永远匹配不上，会一路掉进 generateTunnelMap —— 玩家看到的会是 Level 2。
  if (typeof level === "number" && !Number.isInteger(level)) {
    level = String(level);
  }
  // 大编号超过 JS 安全整数就会失真，统一当字符串处理
  if (typeof level === "number" && level > 9007199254740991) {
    level = "9223372036854775807";
  }
  // 新增层级必须排在最前面 —— 后面有 "level >= 2" 这种数字判断，
  // 编号是字符串的层级（比如 9223372036854775807）会被漏掉。
  // 1.8.0：Level 27 岩体泉 / Level 28 终末美德 / 痛处（数字编号与字符串编号都要排在数字判断之前）
  // Level 363 你作弊了 / 隐秘层级 —— 破碎之地（363 是数字编号，必须排在 level>=2 的判断之前）
  if (level === 363 && window.generateCheat363Map) return window.generateCheat363Map(level);
  if (String(level) === "shattered" && window.generateShatteredMap) return window.generateShatteredMap(level);
  if (level === 27 && window.generateSpring27Map) return window.generateSpring27Map(level);
  if (level === 28 && window.generateVirtue28Map) return window.generateVirtue28Map(level);
  if (String(level) === "pain" && window.generatePainMap) return window.generatePainMap(level);
  // ---- 1.2.0 批次 ----
  // Level 1.1 腐败的走廊 / Level 1.2 砼苑（带小数点的编号，必须排在数字判断之前）
  // Level 0.1 天顶站 / Level 289 过载（289 是数字，必须排在 level>=2 的判断之前）
  if (String(level) === "0.1" && window.generateZenithMap) return window.generateZenithMap(level);
  // Level 20 波瑞阿斯建筑 / 娱乐区（数字编号，必须排在 level>=2 的判断之前）
  if (level === 20 && window.generateBoreasMap) return window.generateBoreasMap(level);
  // Level 45 深渊公司：虚空里漂着 33 栋楼（数字编号，必须排在 level>=2 的判断之前）
  if (level === 45 && window.generateAbyss45Map) return window.generateAbyss45Map(level);
  // Level 29 海波利亚 / Level 284 需汝之地（数字编号，必须排在 level>=2 的判断之前）
  if (level === 29 && window.generateIsle29Map) return window.generateIsle29Map(level);
  if (level === 284 && window.generateRiver284Map) return window.generateRiver284Map(level);
  if (level === 289 && window.generateOverloadMap) return window.generateOverloadMap(level);
  // Level 22 颓垣 / Level 33 无尽购物体验（都是数字编号，必须排在 level>=2 的判断之前）
  if (level === 22 && window.generateRuinMap) return window.generateRuinMap(level);
  if (level === 33 && window.generateMall33Map) return window.generateMall33Map(level);
  // 1.6.0：Level 67 欲望烘焙坊 / Level 31 旱冰场 / Level 40 摇滚披萨 / Level 94 动画
  if (level === 67 && window.generateBakery67Map) return window.generateBakery67Map(level);
  if (level === 31 && window.generateRink31Map) return window.generateRink31Map(level);
  if (level === 40 && window.generateRock40Map) return window.generateRock40Map(level);
  if (level === 94 && window.generateAnime94Map) return window.generateAnime94Map(level);
  // Level 78 空间站 / Level 599 群星（都是数字编号，必须排在 level>=2 的判断之前）
  if (level === 78 && window.generateStationMap) return window.generateStationMap(level);
  if (level === 599 && window.generateStar599Map) return window.generateStar599Map(level);
  // 1.9.0：Level 57 白日美术馆 / Level 24 月球 / Level 56 冷冻致伤
  if (level === 57 && window.generateGallery57Map) return window.generateGallery57Map(level);
  if (level === 24 && window.generateMoon24Map) return window.generateMoon24Map(level);
  if (level === 56 && window.generateFrost56Map) return window.generateFrost56Map(level);

  // Level 696 无尽大楼 / Level 30 抽离现实（都是数字编号，必须排在 level>=2 的判断之前）
  if (level === 696 && window.generateEndlessMap) return window.generateEndlessMap(level);
  if (level === 30 && window.generateDerealMap) return window.generateDerealMap(level);
  // 隐秘层级 —— 战地医院（档案里的 Level 14；14 已被「天堂」占用，内部用 "14h"）
  if (String(level) === "14h" && window.generateMashMap) return window.generateMashMap(level);
  if (String(level) === "1.1") return generateCorruptCorridorMap(level);
  if (String(level) === "1.2") return generateConcreteGardenMap(level);
  // Level 1.3 恶性肿瘤 / Level 15.1 枉然
  if (String(level) === "1.3" && window.generateTumor13Map) return window.generateTumor13Map(level);
  if (String(level) === "15.1" && window.generateFutilityMap) return window.generateFutilityMap(level);
  // Level 5.2 胜景 / 5.3 普罗米修斯藏书馆（带小数点的编号，必须排在数字判断之前）
  if (String(level) === "5.2" && window.generateVistaMap) return window.generateVistaMap(level);
  if (String(level) === "5.3" && window.generateLibrary53Map) return window.generateLibrary53Map(level);
  // Level 6.2 霓虹迷宫 / Level 11.3 红灯区
  if (String(level) === "6.2" && window.generateNeonMazeMap) return window.generateNeonMazeMap(level);
  if (String(level) === "11.3" && window.generateRedlightMap) return window.generateRedlightMap(level);
  // Level 1.5 颠倒 / Level 3.5 电都
  if (String(level) === "2.1" && window.generateLockdownMap) return window.generateLockdownMap(level);
  if (String(level) === "1.5" && window.generateInvertedMap) return window.generateInvertedMap(level);
  if (String(level) === "3.5" && window.generateElectropolisMap) return window.generateElectropolisMap(level);
  // Level 36 永恒机场 / 36.1 星界客机
  if (level === 36) return generateAirportMap(level);
  if (String(level) === "36.1") return generateAirlinerMap(level);
  if (level === "6.1") return generateFoodCourtMap(level);
  if (level === "10.1") return generateDeadLakeMap(level);
  if (level === 12) return generateMatrixMap(level);
  if (level === 17) return generateCarrierMap(level);
  if (level === 49) return generateTrenchMap(level);
  if (level === "49.1") return generateTrenchPsiMap(level);
  if (level === 71) return generateVoidBaseMap(level);
  if (level === 109) return generateHospitalMap(level);
  if (level === 119) return generateWaterParkMap(level);
  if (level === 287) return generateGlitchHallMap(level);
  if (level === 484) return generateWhiteHouseMap(level);
  if (level === 485) return generateBlackSkyMap(level);
  if (level === 486) return generateSinLandMap(level);
  if (level === 512) return generateTemplateMap(level);
  if (level === 666) return generateHellMap(level);
  if (level === 790) return generateSnowTownMap(level);
  if (level === 900) return generateMattressMap(level);
  // Level 974 kitty 之家：带着"可爱"物件切行时，有小概率被送进来
  if (level === 974) return generateKittyHomeMap(level);
  if (level === 998) return generateCloudPlaneMap(level);
  if (level === 999) return generateLastIslandMap(level);
  if (level === 1000) return generateNatureMap(level);
  if (level === "anse") return generateAnseMap(level);
  if (level === "exclam") return generateExclamMap(level);
  if (level === "bluechannel") return generateBlueVoidMap(level);
  if (String(level) === "601") return generateLibraryMap(level);
  if (level === "9223372036854775807") return generateStairsMap(level);
  if (level === "9223372036854775807.-1") return generateJunctionMap(level);
  if (level === 994) return generateBeachMap(level);
  if (level === "37.1") return generatePoolMap(level);
  if (level === 37) return generatePoolMap(level);
  if (level === 25) return generateArcadeMap(level);
  if (level === "hub") return generateHubMap();
  // Level 26 享乐号汽船：无限的黄色派对厅（取代已被删除的 Level Fun）
  if (String(level) === "26") return window.generateSteamer26Map(level);
  // 1.3.1 批次：5.1 赌场 / 39 魔法森林 / 63 宁静 / 63.3 安眠天堂 / 797 少有人走的路 / 46 阿拉伯沙漠
  if (String(level) === "5.1" && window.generateCasino51Map) return window.generateCasino51Map(level);
  if (String(level) === "39" && window.generateForest39Map) return window.generateForest39Map(level);
  if (String(level) === "63" && window.generateSky63Map) return window.generateSky63Map(level);
  if (String(level) === "63.3" && window.generateSleep633Map) return window.generateSleep633Map(level);
  if (String(level) === "797" && window.generatePath797Map) return window.generatePath797Map(level);
  if (String(level) === "46" && window.generateDesert46Map) return window.generateDesert46Map(level);
  // 1.3.2 批次：23 / 32 / 34 / 38 / 43 / 834 / 903 / 904
  if (String(level) === "23" && window.generateGarden23Map) return window.generateGarden23Map(level);
  if (String(level) === "32" && window.generateBone32Map) return window.generateBone32Map(level);
  if (String(level) === "34" && window.generateSewer34Map) return window.generateSewer34Map(level);
  if (String(level) === "38" && window.generateOverlap38Map) return window.generateOverlap38Map(level);
  if (String(level) === "43" && window.generateWater43Map) return window.generateWater43Map(level);
  if (String(level) === "834" && window.generateSpiral834Map) return window.generateSpiral834Map(level);
  if (String(level) === "903" && window.generateMetro903Map) return window.generateMetro903Map(level);
  if (String(level) === "904" && window.generateDark904Map) return window.generateDark904Map(level);
  // 1.3.3 批次：Level 75 阈限（沙室） / Level 16 地形转变（冰河期）
  if (String(level) === "75" && window.generateSand75Map) return window.generateSand75Map(level);
  if (String(level) === "16" && window.generateIce16Map) return window.generateIce16Map(level);
  if (level === 21) return generateNumberedMap(level);
  if (level === 18) return generateDaycareMap(level);
  if (level === 19) return generateAtticMap(level);
  // Level 70：标着 37 的门（-> Level 37）
  if (level === 70) return generateFrostMap(level);
  if (level === 15) return generateFutureMap(level);
  if (level === 14) return generateParadiseMap(level);
  if (level === 13) return generateApartmentMap(level);
  if (level === 10) return generateFieldMap(level);
  if (level === 9) return generateSuburbMap(level);
  // Level 11：标着 EXIST 的门（-> Level 994）
  if (level === 11) return generateCityMap(level);
  // 新时代广场（Level 11 的一部分）—— 从城市最左边那团霓虹雾钻进来
  if (String(level) === "newera") return generateNewEraMap(level);
  // 用 String 比较：上面那段"非整数数字转字符串"会把 0.2 变成 "0.2"，
  // 这里再写 level === 0.2 就永远匹配不上，于是掉进兜底生成 Level 0 的房间图 ——
  // 玩家进的是"Level 0.2"，看到的却是 Level 0，里面还立着那扇通往 0.2 的红门。
  if (String(level) === "0.2") return generateCollapsingMap();
  if (String(level) === "0.3") return generateIceRoomMap(level);
  // 用 String 比较：层级编号经过过场动画之后可能是字符串，
  // 只判 === 0.4 会漏掉，然后掉进兜底生成 Level 0 的房间图。
  if (String(level) === "traproof") return generateTrapRoomMap(level);
  // Level 0.5 渊闭疗舍：从熄灯区那段向下的楼梯进来，三片区域按天数推进
  if (String(level) === "0.5" && window.generateAsylum05Map) return window.generateAsylum05Map(level);
  if (String(level) === "0.7") return generateMemoryDomainMap(level);
  // Level !（医院走廊）—— 从尘封的感叹号里那扇红门进来
  if (String(level) === "bang") return generateBangMap(level);
  if (level === "redrooms") return generateRedRoomsMap(level);
  if (level === 5) return generateHotelMap(level);
  if (level === 6) return generateDarkMap(level);
  if (level === 7) return generateOceanMap(level);
  if (level === 8) return generateCaveMap(level);
  // Level 4：小屋子里像保安室橱柜的门（-> Level 25）
  if (level === 4) return generateOfficeMap(level);
  if (level === 3) return generatePowerStationMap(level);
  // Level 171 堂皇幻象 / Level 301 希望之窗（编号 > 2，必须排在兜底的管道图之前）
  // 以前这两行排在 "level >= 2" 之后，171/301 永远落进兜底的管道图 ——
  // 玩家看到的是 Level 2 的隧道，301 那扇窗和 171 的鹦鹉门根本不存在。
  if (level === 171) return generateGrandeurMap(level);
  if (level === 301) return generateHopeWindowMap(level);
  if (level >= 2) { const m2 = generateTunnelMap(level); spawnKeepsakes(m2, level); return m2; }
  if (level === 1) return generateSplitLevelMap();
  const m1 = generateRoomMap(level); spawnKeepsakes(m1, level); return m1;
}

// ================= Level 21：编号门 =================
// 四条长走廊在中间的广场交汇，走廊两侧是随机的门：
// 标签 105 回 Level 0，笑脸门去 Level 26，8~20 去对应的层级，
// 其余通往 Level 21 的其他地方，或者干脆上着锁。
// 广场是安全的 —— 实体不会出现在那里（只在走廊里）。
function generateNumberedMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const mid = Math.floor(size / 2);
  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [null], rooms: [[]],
    start: null, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props: [], crates: [], ground: [],
    corridor: new Set(),      // 走廊（四条，两两相对）
    plaza: new Set(),         // 中央广场：安全区
    wander: { to: null, acc: 0, need: 300, chance: 0 },
  };
  makeDoorsMap(map);

  // ---- 中央广场：5x5 的开放区域，有椅子和一张桌子 ----
  const P = 5, px0 = mid - 2, py0 = mid - 2;
  carveRoom(grid, size, px0, py0, P, P);
  for (let y = py0; y < py0 + P; y++)
    for (let x = px0; x < px0 + P; x++) map.plaza.add(x + "," + y);
  map.props.push({ x: mid, y: mid, floor: 0, type: "longtable" });
  for (let i = 0; i < 4; i++) {
    const ang = i * Math.PI / 2 + Math.PI / 4;
    map.props.push({ x: mid + Math.round(Math.cos(ang) * 1.6), y: mid + Math.round(Math.sin(ang) * 1.6),
                     floor: 0, type: "chair" });
  }

  // ---- 四条走廊：从广场四条边往外延伸，宽 5 格 ----
  const W = 5;
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const arms = [];
  for (const [dx, dy] of dirs) {
    const horiz = dx !== 0;
    const cells = [];
    if (horiz) {
      const cy = mid;
      const from = dx > 0 ? px0 + P : 3;
      const to = dx > 0 ? size - 3 : px0 - 1;
      for (let x = from; x < to; x++) {
        for (let y = cy - 2; y <= cy + 2; y++) {
          if (y < 1 || y >= size - 1) continue;
          grid[y][x] = 0; map.corridor.add(x + "," + y); cells.push({ x, y });
        }
      }
    } else {
      const cx = mid;
      const from = dy > 0 ? py0 + P : 3;
      const to = dy > 0 ? size - 3 : py0 - 1;
      for (let y = from; y < to; y++) {
        for (let x = cx - 2; x <= cx + 2; x++) {
          if (x < 1 || x >= size - 1) continue;
          grid[y][x] = 0; map.corridor.add(x + "," + y); cells.push({ x, y });
        }
      }
    }
    arms.push(cells);
  }

  // ---- 走廊两侧的门 ----
  // 重复出现的门保持不变：同一扇门每次进这一层都在同一个位置。
  // 20 号门通向 Level 20 —— 而这个层级根本不存在，推开就是"门开了、人还在原地"。
  // 换成 Level 12，并且生成时再按"层级是否真的存在"过滤一遍，以后删层级也不会再漏。
  const NUM_TARGETS = [8, 9, 10, 11, 13, 15, 18, 19, 12]
    .filter((n) => !window.LEVELS || window.LEVELS[String(n)]);
  const doors = [];
  const usedNum = new Set();
  let di = 0;
  for (let a = 0; a < arms.length; a++) {
    const horiz = (a === 0 || a === 1);
    const arm = arms[a];
    if (!arm.length) continue;
    // 沿这条走廊每隔 9 格放一扇门
    const step = 9;
    for (let i = 2; i < 12; i++) {
      const t = i * step;
      let gx, gy;
      if (horiz) {
        const dir = a === 0 ? 1 : -1;
        gx = dir > 0 ? Math.min(size - 4, mid + 3 + t) : Math.max(3, mid - 3 - t);
        gy = (i % 2 === 0) ? mid - 3 : mid + 3;
      } else {
        const dir = a === 2 ? 1 : -1;
        gy = dir > 0 ? Math.min(size - 4, mid + 3 + t) : Math.max(3, mid - 3 - t);
        gx = (i % 2 === 0) ? mid - 3 : mid + 3;
      }
      if (gx < 1 || gy < 1 || gx >= size - 1 || gy >= size - 1) continue;
      if (map.plaza.has(gx + "," + gy)) continue;
      // 门必须贴着走廊
      const nearCorr = [[1,0],[-1,0],[0,1],[0,-1]].some(([ox, oy]) => map.corridor.has((gx+ox)+","+(gy+oy)));
      if (!nearCorr) continue;
      di++;
      // 绝大多数编号都是假的：门上印着随机数字，推开什么也没有。
      // 真正通往别处的门生成概率很低（约 18%），找到一扇就算运气好。
      let kind, target = null, label = null;
      const roll = Math.random();
      if (roll < 0.18) {
        const r = di % 7;
        if (r === 1) { kind = "num105"; target = 0; label = "105"; }
        else if (r === 2) { kind = "smiledoor"; target = 26; label = "=)"; }
        else {
          const n = NUM_TARGETS[di % NUM_TARGETS.length];
          if (!usedNum.has(n)) {
            kind = "numdoor"; target = n; label = String(n);
            usedNum.add(n);
          } else { kind = "elsewhere21"; label = "?"; }
        }
      } else {
        // 假编号：随机三位数，跟"通往别处"的号段刻意错开
        let n = 0;
        for (let k = 0; k < 40; k++) {
          const c = 100 + Math.floor(Math.random() * 880);
          if (NUM_TARGETS.indexOf(c) < 0 && c !== 105 && !usedNum.has(c)) { n = c; break; }
        }
        if (!n) n = 100 + Math.floor(Math.random() * 880);
        kind = "locked21"; label = String(n);
      }
      const d = addDoor(map, [{ x: gx, y: gy, dir: horiz ? "v" : "h" }], 0, kind,
                        { label: label, target: target });
      if (d) doors.push(d);
    }
  }
  // ---- 联络通道：把四条走廊再串起来 ----
  // 一条走廊的尽头拐个弯，接到另一条的中段或起点上去，
  // 这样就不止"四条死路"，走到底还能绕到别的地方。
  for (let a = 0; a < 4; a++) {
    const src = arms[a];
    if (!src.length) continue;
    const end = src[src.length - 1];
    const b = (a + 1) % 4;
    const dst = arms[b];
    if (!dst.length) continue;
    // 接在另一条的中段或起点上（两段交替着来）
    const anchor = dst[(a % 2 === 0) ? Math.floor(dst.length / 2) : 0];
    if (!anchor) continue;
    // L 形：先横后竖（或先竖后横），宽 3 格
    const carveAt = (x, y) => {
      if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return;
      grid[y][x] = 0; map.corridor.add(x + "," + y);
    };
    const mid2 = Math.floor((end.x + anchor.x) / 2);
    const mid3 = Math.floor((end.y + anchor.y) / 2);
    if (a % 2 === 0) {
      const x0 = Math.min(end.x, mid2), x1 = Math.max(end.x, mid2);
      for (let x = x0; x <= x1; x++) for (let d = -1; d <= 1; d++) carveAt(x, end.y + d);
      const y0 = Math.min(end.y, anchor.y), y1 = Math.max(end.y, anchor.y);
      for (let y = y0; y <= y1; y++) for (let d = -1; d <= 1; d++) carveAt(mid2 + d, y);
      const x2 = Math.min(mid2, anchor.x), x3 = Math.max(mid2, anchor.x);
      for (let x = x2; x <= x3; x++) for (let d = -1; d <= 1; d++) carveAt(x, anchor.y + d);
    } else {
      const y0 = Math.min(end.y, mid3), y1 = Math.max(end.y, mid3);
      for (let y = y0; y <= y1; y++) for (let d = -1; d <= 1; d++) carveAt(end.x + d, y);
      const x0 = Math.min(end.x, anchor.x), x1 = Math.max(end.x, anchor.x);
      for (let x = x0; x <= x1; x++) for (let d = -1; d <= 1; d++) carveAt(x, mid3 + d);
      const y2 = Math.min(mid3, anchor.y), y3 = Math.max(mid3, anchor.y);
      for (let y = y2; y <= y3; y++) for (let d = -1; d <= 1; d++) carveAt(anchor.x + d, y);
    }
    void mid3;
  }

  // 档案原文：「有一扇门上画着一张笑脸」。以前全靠 18% × (di % 7 === 2)
  // 的随机叠加，实测连开 8 次都刷不出来 —— 笑脸门形同虚设。
  // 现在保证整层一定有一扇，并且指向 Level 26（Level Fun 已删除）。
  if (!doors.some((d) => d.kind === "smiledoor")) {
    const cand = doors.find((d) => d.kind === "locked21") || doors[0];
    if (cand) { cand.kind = "smiledoor"; cand.target = 26; cand.label = "=)"; }
  }
  map.doors21 = doors;
  map.start = { x: mid, y: mid, floor: 0 };
  map.floors = [collectFloors(grid, size)];
  // 走廊尽头各放一瓶水
  for (let a = 0; a < arms.length; a++) {
    const arm = arms[a];
    const end = arm[arm.length - 1];
    if (end) map.ground.push({ x: end.x, y: end.y, floor: 0, item: "almond", taken: false });
  }
  // 广场上再放两瓶（安全区，够你喘口气）
  map.ground.push({ x: mid + 1, y: mid + 1, floor: 0, item: "almond", taken: false });
  // 不要设 map.exit —— 站在出口上会被自动判定"通关"，而 Level 21 的出路是编号门
  return map;
}

// ---------- 通用工具 ----------
function clamp01(v) { return v < 0 ? 0 : (v > 1 ? 1 : v); }

function makeGrid(size) {
  const grid = [];
  for (let y = 0; y < size; y++) grid.push(new Array(size).fill(1));
  return grid;
}

function carveRoom(grid, size, x, y, w, h) {
  for (let yy = y; yy < y + h; yy++) {
    for (let xx = x; xx < x + w; xx++) {
      if (xx >= 1 && yy >= 1 && xx < size - 1 && yy < size - 1) grid[yy][xx] = 0;
    }
  }
}

function carveCorridor(grid, size, x1, y1, x2, y2) {
  x1 = Math.round(x1); y1 = Math.round(y1);
  x2 = Math.round(x2); y2 = Math.round(y2);
  const setFloor = (x, y) => {
    if (x >= 1 && y >= 1 && x < size - 1 && y < size - 1) grid[y][x] = 0;
  };
  if (Math.random() < 0.5) {
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) setFloor(x, y1);
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) setFloor(x2, y);
  } else {
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) setFloor(x1, y);
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) setFloor(x, y2);
  }
}

function collectFloors(grid, size) {
  const floors = [];
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      if (grid[y][x] === 0) floors.push({ x, y });
    }
  }
  return floors;
}

function farthestFloor(floors, start, minDist) {
  let best = null, bd = -1;
  for (const f of floors) {
    const d = (f.x - start.x) ** 2 + (f.y - start.y) ** 2;
    if (d > bd) { bd = d; best = f; }
  }
  if (!best) best = { x: start.x + 3, y: start.y + 3 };
  return best;
}

// 房间与走廊的布局生成（Level 0 / Level 1 各层 / Level 0.2 共用）
// 从某格出发能走到多少格 —— 用来校验"新加的东西有没有把路堵死"
function floodCount(grid, size, sx, sy) {
  if (grid[sy][sx] !== 0) return 0;
  const seen = new Uint8Array(size * size);
  const q = [sy * size + sx];
  seen[sy * size + sx] = 1;
  let n = 0;
  while (q.length) {
    const cur = q.pop();
    n++;
    const x = cur % size, y = (cur - x) / size;
    for (let k = 0; k < 4; k++) {
      const nx = x + (k === 0 ? 1 : k === 1 ? -1 : 0);
      const ny = y + (k === 2 ? 1 : k === 3 ? -1 : 0);
      if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue;
      const id = ny * size + nx;
      if (seen[id] || grid[ny][nx] !== 0) continue;
      seen[id] = 1; q.push(id);
    }
  }
  return n;
}

// 宽走廊：车道的宽度（1 = 原来的单人窄道，2~3 = 停车场该有的车道）
function carveCorridorW(grid, size, x1, y1, x2, y2, w) {
  w = Math.max(1, w | 0);
  x1 = Math.round(x1); y1 = Math.round(y1);
  x2 = Math.round(x2); y2 = Math.round(y2);
  const setFloor = (x, y) => {
    for (let dy = 0; dy < w; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const gx = x + dx, gy = y + dy;
        if (gx >= 1 && gy >= 1 && gx < size - 1 && gy < size - 1) grid[gy][gx] = 0;
      }
    }
  };
  if (Math.random() < 0.5) {
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) setFloor(x, y1);
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) setFloor(x2, y);
  } else {
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) setFloor(x1, y);
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) setFloor(x, y2);
  }
}

function buildRoomLayer(size, opt) {
  opt = opt || {};
  const grid = makeGrid(size);
  const rooms = [];

  // 出生点所在的大房间（地图中央）
  const cw = opt.startRoom || randInt(7, 11), ch = opt.startRoom || randInt(7, 11);
  const ccx = Math.floor(size / 2) - Math.floor(cw / 2);
  const ccy = Math.floor(size / 2) - Math.floor(ch / 2);
  carveRoom(grid, size, ccx, ccy, cw, ch);
  rooms.push({ x: ccx, y: ccy, w: cw, h: ch, start: true });

  // 其余房间：小隔间（Level 1 下层）或大房间
  const rw = opt.roomW || [5, 12], rh = opt.roomH || [5, 12];
  const corrW = opt.corrW || 1;
  const attempts = Math.floor(size * (opt.density || 1.2));
  for (let i = 0; i < attempts; i++) {
    const w = randInt(rw[0], rw[1]), h = randInt(rh[0], rh[1]);
    const x = randInt(2, size - w - 3), y = randInt(2, size - h - 3);
    let overlap = false;
    for (const r of rooms) {
      if (x < r.x + r.w + 1 && x + w + 1 > r.x && y < r.y + r.h + 1 && y + h + 1 > r.y) {
        overlap = true;
        break;
      }
    }
    if (overlap) continue;
    carveRoom(grid, size, x, y, w, h);
    rooms.push({ x, y, w, h });
  }

  // 连通：每个房间接到最近的已放置房间
  for (let i = 1; i < rooms.length; i++) {
    const cx2 = rooms[i].x + rooms[i].w / 2, cy2 = rooms[i].y + rooms[i].h / 2;
    let best = -1, bd = Infinity;
    for (let j = 0; j < i; j++) {
      const cxj = rooms[j].x + rooms[j].w / 2, cyj = rooms[j].y + rooms[j].h / 2;
      const d = (cx2 - cxj) ** 2 + (cy2 - cyj) ** 2;
      if (d < bd) { bd = d; best = j; }
    }
    if (best >= 0) {
      carveCorridorW(grid, size, cx2, cy2,
        rooms[best].x + rooms[best].w / 2, rooms[best].y + rooms[best].h / 2, corrW);
    }
  }

  // 额外回路，减少死胡同
  const loops = Math.floor(size / 6);
  for (let k = 0; k < loops; k++) {
    const a = rooms[randInt(0, rooms.length - 1)];
    const b = rooms[randInt(0, rooms.length - 1)];
    if (a === b) continue;
    carveCorridorW(grid, size, a.x + a.w / 2, a.y + a.h / 2, b.x + b.w / 2, b.y + b.h / 2, corrW);
  }

  return { grid, rooms, floors: collectFloors(grid, size) };
}

// 在房间与走廊的**开口**上找可以装门的位置。
// 门必须嵌在墙线上：位置本身是连接房间内外的单格宽通道，且垂直于穿越方向的两侧都是墙。
// 这样门才是"墙上的一个门洞"，而不是孤零零立在地板中间的一块板子。
// dir: "h" = 人沿 y（上下）穿过，门框梁在上下；"v" = 人沿 x（左右）穿过，门框柱在左右。
function roomDoorSpots(grid, size, room) {
  const spots = [];
  const isWall = (x, y) => (x < 0 || y < 0 || x >= size || y >= size) || grid[y][x] === 1;
  const isFloor = (x, y) => !(x < 0 || y < 0 || x >= size || y >= size) && grid[y][x] === 0;
  const push = (x, y, dir) => {
    if (!isFloor(x, y)) return;
    // 卡口判定：垂直于穿越方向的两侧必须是墙（门才贴着墙）
    const choke = dir === "h" ? (isWall(x - 1, y) && isWall(x + 1, y))
                              : (isWall(x, y - 1) && isWall(x, y + 1));
    if (!choke) return;
    // 穿越方向的**两侧都必须能走** —— 否则这扇门通向墙里，是个死门洞
    const through = dir === "h" ? (isFloor(x, y - 1) && isFloor(x, y + 1))
                                : (isFloor(x - 1, y) && isFloor(x + 1, y));
    if (!through) return;
    spots.push({ x, y, dir });
  };
  // 上下边（房间外一圈）：人沿 y 穿过 -> dir "h"
  for (let x = room.x; x < room.x + room.w; x++) {
    push(x, room.y - 1, "h");
    push(x, room.y + room.h, "h");
  }
  // 左右边（房间外一圈）：人沿 x 穿过 -> dir "v"
  for (let y = room.y; y < room.y + room.h; y++) {
    push(room.x - 1, y, "v");
    push(room.x + room.w, y, "v");
  }
  return spots;
}

// 一组门是否"有意义"：它必须真的**控制住**这间隔间。
// 判据（都从出生点出发做一次洪水填充）：
//   A) 门全开时，走得到隔间内部 —— 这间确实存在、玩家能到
//   B) 门全关时，走不到隔间内部 —— 这扇门真的封住了入口
// 两条同时成立才装门；否则就是一扇"绕得过去"的摆设门。
function doorGroupSeals(grid, size, room, tiles, from) {
  const blocked = new Set(tiles.map((t) => t.x + "," + t.y));
  const interior = [];
  for (let y = room.y; y < room.y + room.h; y++) {
    for (let x = room.x; x < room.x + room.w; x++) {
      if (x < 0 || y < 0 || x >= size || y >= size) continue;
      if (grid[y][x] !== 0) continue;
      const k = x + "," + y;
      if (blocked.has(k)) continue;
      interior.push(k);
    }
  }
  if (!interior.length) return false; // 隔间里没有落脚点，装门没意义

  const reach = (block) => {
    const seen = new Set([from.x + "," + from.y]);
    const q = [from];
    while (q.length) {
      const c = q.pop();
      for (let k = 0; k < 4; k++) {
        const nx = c.x + (k === 0 ? 1 : k === 1 ? -1 : 0);
        const ny = c.y + (k === 2 ? 1 : k === 3 ? -1 : 0);
        if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue;
        if (grid[ny][nx] !== 0) continue;
        const key = nx + "," + ny;
        if (block && blocked.has(key)) continue;
        if (seen.has(key)) continue;
        seen.add(key);
        q.push({ x: nx, y: ny });
      }
    }
    return seen;
  };

  const openReach = reach(false);
  if (!interior.some((k) => openReach.has(k))) return false;   // 平时就走不到
  const closedReach = reach(true);
  if (interior.some((k) => closedReach.has(k))) return false;   // 关了也走得到 = 摆设
  return true;
}

// 给一个隔间的所有开口装一组联动门：一起开关，关上后这间就是封闭的
// （所以门后的东西看不见，只能推门进去）
function addRoomDoorGroup(map, grid, size, room, floor, exit, skip, from) {
  const spots = roomDoorSpots(grid, size, room);
  if (!spots.length) return null;
  const tiles = [];
  for (const s of spots) {
    if (exit && s.x === exit.x && s.y === exit.y) continue;
    if (skip && skip(s.x, s.y)) continue;
    tiles.push({ x: s.x, y: s.y, dir: s.dir });
  }
  if (!tiles.length) return null;
  // 开口太多说明这是个大厅（不是隔间），装门也封不住 —— 直接跳过
  if (tiles.length > 3) return null;
  // 必须是"关上就真的进不去"的门，否则就是一扇毫无意义的摆设
  if (from && !doorGroupSeals(grid, size, room, tiles, from)) return null;
  return addDoor(map, tiles, floor, "normal", { dir: tiles[0].dir, group: true });
}

function makeDoorsMap(map) {
  const set = new Set();
  for (const d of map.doors) {
    if (!d.open) for (const t of d.tiles) set.add((d.floor | 0) + ":" + t.x + "," + t.y);
  }
  map.closedDoors = set;
  return map;
}

// tiles：门占据的格子列表（多数门 1 格；管道梦魇的检修门横跨 2 格宽的隧道）
function addDoor(map, tiles, floor, kind, extra) {
  // 同一格只允许装一块门板：相邻两个隔间的"开口"可能指向同一格，
  // 不去重就会在一个位置叠出好几扇门。
  if (!map.doorTiles) map.doorTiles = new Set();
  const list = [];
  for (const t of tiles) {
    const key = (floor | 0) + ":" + t.x + "," + t.y;
    if (map.doorTiles.has(key)) continue;
    map.doorTiles.add(key);
    list.push({ x: t.x, y: t.y, dir: t.dir || null });
  }
  if (!list.length) return null;
  // 保留每块门板自己的朝向（一组门的各块可能一个横一个竖）
  const d = Object.assign({
    x: list[0].x, y: list[0].y,
    cx: list.reduce((a, t) => a + t.x, 0) / list.length,
    cy: list.reduce((a, t) => a + t.y, 0) / list.length,
    tiles: list,
    floor: floor | 0, open: false, kind: kind || "normal",
    dir: (list.find((t) => t.dir) || { dir: "v" }).dir,
  }, extra || {});
  map.doors.push(d);
  if (!d.open) {
    for (const t of d.tiles) map.closedDoors.add(d.floor + ":" + t.x + "," + t.y);
  }
  return d;
}

function setDoorOpen(map, d, open) {
  d.open = open;
  for (const t of d.tiles) {
    const k = d.floor + ":" + t.x + "," + t.y;
    if (open) map.closedDoors.delete(k);
    else map.closedDoors.add(k);
  }
}

// ---------- Level 0：黄色厅房（大幅扩大） ----------
// Level 0 / Level 2：掉漆的积木、发条青蛙 —— 捡起来就会被带去 Level 18
function spawnKeepsakes(map, level) {
  if (level !== 0 && level !== 2) return;
  const item = level === 0 ? "block" : "frog";
  const floors = map.floors ? map.floors[0] : collectFloors(map.layers[0], map.size);
  if (!floors || !floors.length) return;
  for (let i = 0; i < 60; i++) {
    const t = floors[randInt(0, floors.length - 1)];
    if (!t) break;
    const d = Math.hypot(t.x - map.start.x, t.y - map.start.y);
    if (d < 6 || d > Math.max(10, map.size * 0.45)) continue;   // 别太近也别太远
    map.ground.push({ x: t.x, y: t.y, floor: 0, item, taken: false });
    return;
  }
}

// ---------- Level 0：四片大区域（1.3.0 扩容） ----------
// 地图扩到原来的 2.5 倍之后，四角各划出一片一眼可辨的区域。每片都是整块开阔地，
// 不是隔出来的小房间；再用 2 格宽走廊接回主厅，保证从出生点全部走得到。
// 区域信息挂在 map.l0zones 上，绘制 / 迷雾 / 移速 / 身后形变都读它。
function buildLevel0Zones(grid, size) {
  // 这些区域不是"另挖一块地"，而是 Level 0 原本的房间与走廊里划出来的一片：
  // 地面、墙纸、灯全沿用阈界原本那一套，只叠区域自己的标记（拱洞 / 立柱 / 积水）。
  // 位置也刻意避开四个角 —— 沿主厅的上、右、下三段分布，走进去是连续的走廊，
  // 不会看到一整块凭空多出来的空场。
  // 区域本身不跟着地图一起放大：地图越大，它们越像是藏在阈界某处的几片地方。
  // 三处位置刻意不成行、不成列，彼此隔得很远，没有「四个角各一块」的规律。
  const w = Math.max(32, Math.min(38, Math.round(size * 0.21)));
  const zones = [
    { key: "arch",     name: "拱门区", x: Math.round(size * 0.09), y: Math.round(size * 0.31), w: w, h: w },
    { key: "pillar",   name: "柱厅",   x: Math.round(size * 0.67), y: Math.round(size * 0.11), w: w, h: w },
    { key: "blackout", name: "熄灯区", x: Math.round(size * 0.53), y: Math.round(size * 0.72), w: w, h: w },
  ];
  const zoneOf = new Map();
  const archHoles = new Set();
  const pillars = new Set();
  const puddles = new Set();
  const rubble = new Set();
  const morph = [];
  const props = [];
  const inAny = (x, y) => zones.some(z => x >= z.x && x < z.x + z.w && y >= z.y && y < z.y + z.h);

  for (const z of zones) {
    z.cx = z.x + (z.w >> 1); z.cy = z.y + (z.h >> 1);
    let floorN = 0;
    for (let yy = z.y; yy < z.y + z.h; yy++) {
      for (let xx = z.x; xx < z.x + z.w; xx++) {
        if (grid[yy] && grid[yy][xx] === 0) {
          zoneOf.set(xx + "," + yy, z.key);
          floorN++;
        }
      }
    }
    // 一片区域里原本的地板太少（比如正好压在一大片墙上）才补几条窄走廊，
    // 仍然不整块挖空：只沿中心线十字打通，接回主厅。
    if (floorN < z.w * 3) {
      for (let xx = z.x; xx < z.x + z.w; xx++) {
        if (grid[z.cy] && grid[z.cy][xx] === 1) { grid[z.cy][xx] = 0; }
        zoneOf.set(xx + "," + z.cy, z.key);
      }
      const mid = Math.floor(size / 2);
      carveCorridorW(grid, size, z.cx, z.cy, mid, mid, 2);
    }
  }

  // ---- 标志性建筑 ----
  // 拱形孔洞是「开在苍白墙壁上的洞」，不是画在墙格上的贴纸：把一段墙里贴着
  // 地板的那一格挖成能走进去的凹龛，玩家能侧身进去倚坐，暂时离开湿地。
  // 柱厅没有「白色圆柱模型」：每个柱位就是一段普通墙纸墙，2×2 四格，
  // 按固定行距 / 列距排成棋盘；行、列严格对齐，位置不再随机抖动。
  // 地面始终只有 drawCarpetFloor 一张潮湿黄地毯，四区完全一致。
  const baseFloors = collectFloors(grid, size).length;
  const built = [];                 // 熄灯区墙垛（回滚用）
  const archFrames = new Set();     // 拱洞两侧 / 上方的墙格：画浅棕拱边
  const pillarBlocks = [];          // 2×2 普通墙块，整行 / 整列平移用
  const pillarPart = new Map();     // 兼容旧字段；不再用于绘制专属柱身
  let pillarGrid = null;            // 行距、列距、行数、列数：保证始终对齐
  const putWall = (x, y, kind, z) => {
    if (x < 2 || y < 2 || x >= size - 2 || y >= size - 2) return false;
    if (!grid[y] || grid[y][x] !== 0) return false;
    if (Math.abs(x - z.cx) <= 1 && Math.abs(y - z.cy) <= 1) return false;
    // 四邻至少留两个方向能走，别把走廊一堵封死
    let open = 0;
    if (grid[y - 1] && grid[y - 1][x] === 0) open++;
    if (grid[y + 1] && grid[y + 1][x] === 0) open++;
    if (grid[y][x - 1] === 0) open++;
    if (grid[y][x + 1] === 0) open++;
    if (open < 2) return false;
    grid[y][x] = 1;
    zoneOf.set(x + "," + y, z.key);   // 墙格也要属于区域，否则会画回普通墙纸
    built.push({ x, y, kind, key: z.key });
    return true;
  };

  const undoOne = (c) => {
    grid[c.y][c.x] = 0;
    zoneOf.set(c.x + "," + c.y, c.key);
    archHoles.delete(c.x + "," + c.y);
    pillars.delete(c.x + "," + c.y);
    rubble.delete(c.x + "," + c.y);
    const mi = morph.findIndex((m) => m.x === c.x && m.y === c.y);
    if (mi >= 0) morph.splice(mi, 1);
  };
  const zoneOK = () => {
    const totalNow = collectFloors(grid, size).length;
    const reach = floodCount(grid, size, Math.floor(size / 2), Math.floor(size / 2));
    return totalNow >= baseFloors * 0.88 && reach >= totalNow * 0.92;
  };
  // 每砌完一批单独校验：哪一批把路堵了就只撤哪一批，不连累前面砌好的建筑。
  // 以前是全部砌完才全局回滚，结果熄灯区那批墙垛被整批撤光，一片结构都不剩。
  const commitBatch = (from) => {
    if (!zoneOK()) while (built.length > from) undoOne(built.pop());
  };

  // 拱门区：在苍白墙壁上「开」出一排排浅棕拱形孔洞。
  // 只挑贴着可走地板、两侧仍是墙的墙格，挖开后那一格变成能走进去的凹龛；
  // 洞本身是地板，不是墙 —— 以前把拱门画在墙格里，玩家根本进不去。
  {
    const z = zones[0], holes = [];
    for (let row = z.y + 4; row < z.y + z.h - 3; row += 3) {
      for (let col = z.x + 4; col < z.x + z.w - 3; col += 4) {
        let pick = null;
        for (let dy = -2; dy <= 2 && !pick; dy++) {
          for (let dx = -2; dx <= 2 && !pick; dx++) {
            const x = col + dx, y = row + dy;
            if (!grid[y] || grid[y][x] !== 1) continue;
            if (Math.abs(x - z.cx) <= 1 && Math.abs(y - z.cy) <= 1) continue;
            let f = 0, w = 0;
            if (grid[y - 1] && grid[y - 1][x] === 0) f++; else w++;
            if (grid[y + 1] && grid[y + 1][x] === 0) f++; else w++;
            if (grid[y][x - 1] === 0) f++; else w++;
            if (grid[y][x + 1] === 0) f++; else w++;
            if (f >= 1 && w >= 2) pick = { x, y };
          }
        }
        if (!pick) continue;
        if (holes.some(q => Math.abs(q.x - pick.x) + Math.abs(q.y - pick.y) < 3)) continue;
        const k = pick.x + "," + pick.y;
        grid[pick.y][pick.x] = 0;
        zoneOf.set(k, "arch");
        archHoles.add(k);
        holes.push(pick);
        // 左右 / 上方仍是墙的邻居，登记成浅棕拱边，让洞看着长在墙上
        for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1]]) {
          const nx = pick.x + dx, ny = pick.y + dy;
          if (grid[ny] && grid[ny][nx] === 1) {
            archFrames.add(nx + "," + ny);
            zoneOf.set(nx + "," + ny, "arch");
          }
        }
      }
    }
    // 倚坐点就在洞里：能走进去、脚暂时离开湿漉漉的地毯
    for (const q of holes) props.push({ x: q.x, y: q.y, floor: 0, type: "l0archperch" });
  }
  // 柱厅：每个「柱位」就是普通墙纸墙的 2×2 四格，按固定步长排满棋盘。
  // 不做白色圆柱、不做柱头柱础、不做随机偏移；每一列、每一行都严格对齐。
  {
    const z = zones[1], step = 5;
    const x0 = z.x + 3, y0 = z.y + 3;
    const xEnd = z.x + z.w - 2, yEnd = z.y + z.h - 2;
    const cols = Math.max(0, Math.floor((xEnd - x0 - 2) / step) + 1);
    const rows = Math.max(0, Math.floor((yEnd - y0 - 2) / step) + 1);
    const wallKeys = new Set();
    const positions = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = x0 + c * step, y = y0 + r * step;
        if (x + 1 >= xEnd || y + 1 >= yEnd) continue;
        const cells = [];
        for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) {
          const k = (x + i) + "," + (y + j);
          wallKeys.add(k); cells.push(k);
        }
        positions.push({ row: r, col: c, x, y, cells });
      }
    }
    // 区域内部只用两种格子：2×2 墙块，或原本那张潮湿黄地毯。
    // 外圈保留原墙，必要时由下方连通兜底开一条 2 格宽走廊。
    for (let y = z.y + 1; y < z.y + z.h - 1; y++) {
      for (let x = z.x + 1; x < z.x + z.w - 1; x++) {
        const k = x + "," + y;
        zoneOf.set(k, "pillar");
        grid[y][x] = wallKeys.has(k) ? 1 : 0;
      }
    }
    for (const pos of positions) {
      for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) {
        const k = (pos.x + i) + "," + (pos.y + j);
        pillars.add(k);
        pillarPart.set(k, { dx: i, dy: j });
      }
      pillarBlocks.push({ row: pos.row, col: pos.col, x: pos.x, y: pos.y,
                          cells: pos.cells.slice(), zone: "pillar" });
    }
    pillarGrid = { x0, y0, step, cols, rows, xEnd, yEnd };
  }
  // 熄灯区：散布的塌陷粗糙墙垛（没有任何灯、灯管、光源），加低洼积水；墙会重排。
  // 单格散布而不是连续横墙 —— 连续墙段会把窄走廊整条封死，触发连通回滚。
  {
    const z = zones[2], b0 = built.length;
    for (let yy = z.y + 5; yy < z.y + z.h - 4; yy += 6) {
      for (let xx = z.x + 5; xx < z.x + z.w - 4; xx += 6) {
        if (putWall(xx, yy, "rubble", z)) {
          rubble.add(xx + "," + yy);
          morph.push({ x: xx, y: yy, zone: "blackout" });
        }
      }
    }
    commitBatch(b0);
    // 积水只落在真实地板上：以前 26 次随机大多撞在墙上，最后只剩 7 处
    const wet = [];
    for (let yy = z.y + 2; yy < z.y + z.h - 2; yy++) {
      for (let xx = z.x + 2; xx < z.x + z.w - 2; xx++) {
        if (grid[yy] && grid[yy][xx] === 0) wet.push(xx + "," + yy);
      }
    }
    for (let i = 0; i < Math.min(26, wet.length); i++) {
      puddles.add(wet[randInt(0, wet.length - 1)]);
    }
  }

  // 最后再兜一次底：2×2 普通墙块若把窄走廊堵死，整块撤掉（不会拆成半块）
  const dropLastBlock = () => {
    const b = pillarBlocks.pop(); if (!b) return false;
    for (const k of b.cells) {
      const [x, y] = k.split(",").map(Number);
      grid[y][x] = 0;
      pillars.delete(k); pillarPart.delete(k);
    }
    return true;
  };
  while (!zoneOK() && (built.length || pillarBlocks.length)) {
    if (pillarBlocks.length) dropLastBlock();
    else undoOne(built.pop());
  }

  // 深坑区不是 Level 0 里的一片地 —— 它是独立的一间房（Level 0.4），
  // 从一扇普通木门进去。这里不再另造任何深坑区域、也不再放 l0deepdoor。

  // 三片区域中心都必须能从出生点走到；柱厅的兜底走廊只走柱间通道，
  // 不拿随机 L 形走廊从中心穿过去，否则会把 2×2 墙块切成半块。
  const total = collectFloors(grid, size).length;
  const mid = Math.floor(size / 2);
  const setFloor2 = (x, y) => {
    for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) {
      const gx = x + dx, gy = y + dy;
      if (gx >= 1 && gy >= 1 && gx < size - 1 && gy < size - 1) grid[gy][gx] = 0;
    }
  };
  for (const z of zones) {
    const ck = z.cx + "," + z.cy;
    const hit = pillarBlocks.find((b) => b.cells.includes(ck));
    if (hit) {
      for (const k of hit.cells) {
        const [x, y] = k.split(",").map(Number);
        grid[y][x] = 0; pillars.delete(k); pillarPart.delete(k);
      }
      const hi = pillarBlocks.indexOf(hit); if (hi >= 0) pillarBlocks.splice(hi, 1);
    }
    if (grid[z.cy] && grid[z.cy][z.cx] !== 0) grid[z.cy][z.cx] = 0;
    zoneOf.set(ck, z.key);
    if (z.key === "pillar" && pillarGrid) {
      const openY = pillarGrid.y0 + 2;  // 第一排 2×2 墙块之后的柱间通道
      for (let y = openY; y < openY + 2; y++) for (let x = z.x; x < z.x + 2; x++) setFloor2(x, y);
      for (let x = Math.min(z.x, mid); x <= Math.max(z.x, mid); x++) setFloor2(x, openY);
      for (let y = Math.min(openY, mid); y <= Math.max(openY, mid); y++) setFloor2(mid, y);
    } else if (floodCount(grid, size, z.cx, z.cy) < total * 0.9) {
      carveCorridorW(grid, size, z.cx, z.cy, mid, mid, 2);
    }
  }
  // 连通兜底可能把墙挖成地板、也可能动到区域边界；这里把区域内的每一格重新打回
  // 自己的区域标记，避免熄灯区矩形里出现「没标记的地板」——那种格子会被当成已在区外，
  // 于是明明在中心的楼梯也会被误判成外围。
  for (const z of zones) {
    for (let y = z.y; y < z.y + z.h; y++) {
      for (let x = z.x; x < z.x + z.w; x++) {
        if (grid[y] && grid[y][x] !== undefined) zoneOf.set(x + "," + y, z.key);
      }
    }
  }
  if (pillarGrid) pillarGrid.blocks = pillarBlocks.length;
  return { zones, zoneOf, archHoles, archFrames, pillars, pillarBlocks, pillarPart, pillarGrid,
           puddles, rubble, morph, props, inAny };
}

function generateRoomMap(level) {
  const size = mapSizeFor(level);
  const layer = buildRoomLayer(size, {});
  const grid = layer.grid, rooms = layer.rooms;
  // 1.3.0：Level 0 扩容后划出四片大区域。必须在收 floors / 放出口之前做，
  // 否则出口和补给还是按旧地图算，新区域会变成走不到的空地。
  const l0 = (String(level) === "0") ? buildLevel0Zones(grid, size) : null;
  const floors = l0 ? collectFloors(grid, size) : layer.floors;
  const start = { x: Math.floor(size / 2), y: Math.floor(size / 2), floor: 0 };
  // Level 0 没有绿色出口门 —— 离开这里的路都在主厅（不落在任何新区域里）：
  //   1) 闪烁的墙壁：穿过去 -> Level 1 下层
  //   2) 普通木门  ：推开   -> 深坑区（白色铁门在里面，通向 Level 1 上层）
  const exits = buildLevel0Exits(grid, size, rooms, floors, start, l0);
  //   3) 右下角那间藏起来的小房间：里面的墙黑白交替地闪，碰上去 -> Level 287
  //      （必须在隔间门之前挖，否则那组联动门会把通路封死）
  const nook = buildGlitchNook(grid, size, floors);
  if (nook) exits.push({ kind: "glitchwall", x: nook.wx, y: nook.wy, floor: 0, toLevel: 287 });

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [rooms],
    start, exit: null, exits, doors: [], ramps: [], redFloor: new Set(), transit: null,
    glitchNook: nook || null,
    l0zones: l0 || null,
  };
  makeDoorsMap(map);

  // 白色铁门不在这里：它在深坑区（Level 0.4）里，见 level0traproof.js。
  // 普通木门：推开是「深坑区」，不是新造的区域。
  const woodEx = exits.find((e) => e.kind === "wood04");
  if (woodEx) {
    const d = addDoor(map, [{ x: woodEx.x, y: woodEx.y, dir: woodEx.dir }], 0, "wood04",
      { dir: woodEx.dir });
    if (d) { d.toLevel = "traproof"; d.toFloor = 0; woodEx.door = d; }
    else exits.splice(exits.indexOf(woodEx), 1);
  }

  // 隔间门：整间的所有开口装成一组联动门，关上就把这间隔间彻底封死
  // 只有"关上真的进不去"的门才会被装（见 doorGroupSeals），避免摆设门
  const far = rooms.filter(r => !r.start &&
    Math.hypot(r.x + r.w / 2 - start.x, r.y + r.h / 2 - start.y) > 8);
  const from = { x: start.x, y: start.y };
  let made = 0;
  // Level 0 本来就是一片空房间 —— 隔间门后面什么都没有，装多了只会变成噪音
  // （以前最多能装 8 组，玩家推开门发现后面是空的，很出戏）。
  // 现在最多 2 组，纯粹用来给某些隔间一点"能关上"的层次感。
  for (const r of far) {
    if (made >= 2) break;
    if (Math.random() > 0.22) continue;
    if (!addRoomDoorGroup(map, grid, size, r, 0, null, null, from)) continue;
    made++;
  }

  // 通往 Level 0.2 的红门：周围地面被染成红色
  const cands = rooms.filter(r => !r.start && !r.red &&
    Math.hypot(r.x + r.w / 2 - start.x, r.y + r.h / 2 - start.y) > 10);
  // 打乱后逐个尝试，避开已经装了门的格子（红门必须装成，所以多试几个房间）
  for (let i = cands.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    const t = cands[i]; cands[i] = cands[j]; cands[j] = t;
  }
  for (const r of cands) {
    let spots = roomDoorSpots(grid, size, r).filter(
      (s) => !(map.doorTiles && map.doorTiles.has("0:" + s.x + "," + s.y)));
    if (!spots.length) continue;
    spots = spots.slice().sort(() => Math.random() - 0.5);
    for (const s of spots) {
      const door = addDoor(map, [{ x: s.x, y: s.y, dir: s.dir }], 0, "red", { dir: s.dir });
      if (!door) continue;
      door.toLevel = 0.2;
      // 门周围一圈地面染红（"周围地面为红色的门"）
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const tx = s.x + dx, ty = s.y + dy;
          if (tx >= 0 && ty >= 0 && tx < size && ty < size && grid[ty][tx] === 0) {
            map.redFloor.add(tx + "," + ty);
          }
        }
      }
      break;
    }
    if (map.doors.some((d) => d.kind === "red")) break;
  }

  spawnSupplies(map, level);   // Level 0 没有杏仁水（只初始化空数组）
  dropBag(map, level);
  // 区域里的交互物件必须挂在最后 —— spawnSupplies 里有一句 map.props = []，
  // 挂早了会被整批清掉（第一版就是这样，四个区域一件能按的东西都没有）。
  if (l0) {
    map.props = map.props || [];
    for (const q of l0.props) map.props.push(q);
    // Level 0.5 渊闭疗舍的入口：一段向下的金属格栅楼梯，必须落在熄灯区深处。
    // 以前只过滤了「在熄灯区矩形里」，却按离中心从远到近排序，结果楼梯总贴在外围。
    // 现在先划出内芯（离四边至少 28% 边长），再优先取离边界最远、离中心最近的可达地板。
    // 其余出口一律留在主厅，只有这条楼梯藏在熄灯区里。
    const bz = l0.zones.find((q) => q.key === "blackout");
    let spot = null;
    if (bz) {
      const reach = reachableFromRaw(grid, size, start);
      const edgeDist = (t) => Math.min(
        t.x - bz.x, bz.x + bz.w - 1 - t.x,
        t.y - bz.y, bz.y + bz.h - 1 - t.y
      );
      const core = Math.max(6, Math.floor(Math.min(bz.w, bz.h) * 0.28));
      const occupied = (t) => map.props.some(q => q.x === t.x && q.y === t.y)
        || (map.doors || []).some(d => (d.x === t.x && d.y === t.y)
          || (d.cells || []).some(c => c.x === t.x && c.y === t.y))
        || (map.exits || []).some(e => e.x === t.x && e.y === t.y);
      const inZone = (t) => {
        const k = t.x + "," + t.y;
        return t.x >= bz.x + 2 && t.x < bz.x + bz.w - 2
          && t.y >= bz.y + 2 && t.y < bz.y + bz.h - 2
          && l0.zoneOf.get(k) === "blackout"
          && reach.has(k) && !l0.puddles.has(k) && !occupied(t);
      };
      let cand = floors.filter((t) => inZone(t) && edgeDist(t) >= core);
      // 极端布局下内芯若没有可站的地，也只在区内退回「离边界最远」的一格，绝不落到外围。
      if (!cand.length) cand = floors.filter(inZone);
      cand.sort((a, b) => edgeDist(b) - edgeDist(a)
        || Math.hypot(a.x - bz.cx, a.y - bz.cy) - Math.hypot(b.x - bz.cx, b.y - bz.cy)
        || a.x - b.x || a.y - b.y);
      spot = cand[0] || null;
    }
    if (spot) map.props.push({ x: spot.x, y: spot.y, floor: 0, type: "a05downstairs",
      toLevel: "0.5", iKind: "a05downstairs",
      tip: "黑暗里摸到一段向下的金属格栅楼梯 —— 底下传来熟悉的嗡鸣声" });
  }
  return map;
}

// Level 0 的两个出口。
//   闪烁的墙壁 —— 一面靠在可通行地面边上的墙，走过去"穿"过去 -> Level 1 下层
//   白色铁门   —— 装在某个隔间墙线开口上的铁门，按 R 进入       -> Level 1 上层
function buildLevel0Exits(grid, size, rooms, floors, start, l0) {
  const exits = [];
  const isWall = (x, y) => (x < 0 || y < 0 || x >= size || y >= size) || grid[y][x] === 1;
  const isFloor = (x, y) => !(x < 0 || y < 0 || x >= size || y >= size) && grid[y][x] === 0;
  const near = (x, y) => Math.hypot(x - start.x, y - start.y);
  // 所有出口一律待在主厅：不落在拱门区 / 柱厅 / 熄灯区里，尤其不能全挤在熄灯区。
  const inZone = l0 ? l0.inAny : () => false;

  // 1) 闪烁的墙壁：靠在可通行地面边上的墙，走过去"穿"过去 -> Level 1 下层
  let wall = null;
  {
    const EDGE = 3;
    const cands = [];
    for (const t of floors) {
      if (t.x < 1 || t.y < 1 || t.x >= size - 1 || t.y >= size - 1) continue;
      for (let k = 0; k < 4; k++) {
        const wx = t.x + (k === 0 ? 1 : k === 1 ? -1 : 0);
        const wy = t.y + (k === 2 ? 1 : k === 3 ? -1 : 0);
        if (!isWall(wx, wy)) continue;
        if (wx < 1 || wy < 1 || wx >= size - 1 || wy >= size - 1) continue;
        if (inZone(wx, wy)) continue;
        const edge = Math.min(wx, wy, size - 1 - wx, size - 1 - wy);
        if (edge > EDGE) continue;
        cands.push({ x: wx, y: wy, d: near(wx, wy) });
      }
    }
    cands.sort((a, b) => b.d - a.d);
    const pool = cands.slice(0, Math.max(1, Math.floor(cands.length * 0.25)));
    wall = pool.length ? pool[randInt(0, pool.length - 1)] : null;
  }
  if (!wall) {
    for (let i = 0; i < 900 && !wall; i++) {
      const t = floors[randInt(0, floors.length - 1)];
      if (!t) break;
      if (near(t.x, t.y) < 14) continue;
      for (let k = 0; k < 4; k++) {
        const wx = t.x + (k === 0 ? 1 : k === 1 ? -1 : 0);
        const wy = t.y + (k === 2 ? 1 : k === 3 ? -1 : 0);
        if (!isWall(wx, wy) || inZone(wx, wy)) continue;
        if (wx < 1 || wy < 1 || wx >= size - 1 || wy >= size - 1) continue;
        wall = { x: wx, y: wy }; break;
      }
    }
  }
  if (wall) exits.push({ kind: "wall", x: wall.x, y: wall.y, floor: 0, toFloor: 1 });

  // 2) 门位：从远处房间的墙线开口里挑，避开任何新区域
  const far = rooms.filter((r) => !r.start &&
    Math.hypot(r.x + r.w / 2 - start.x, r.y + r.h / 2 - start.y) > 12);
  for (let i = far.length - 1; i > 0; i--) {
    const j = randInt(0, i); const t = far[i]; far[i] = far[j]; far[j] = t;
  }
  const spots = [];
  for (const r of far) {
    for (const sp of roomDoorSpots(grid, size, r).slice().sort(() => Math.random() - 0.5)) {
      if (wall && sp.x === wall.x && sp.y === wall.y) continue;
      if (!isFloor(sp.x, sp.y)) continue;
      if (near(sp.x, sp.y) < 12) continue;
      if (inZone(sp.x, sp.y)) continue;
      if (spots.some(q => Math.hypot(q.x - sp.x, q.y - sp.y) < 8)) continue;
      spots.push({ x: sp.x, y: sp.y, dir: sp.dir || "v" });
      if (spots.length >= 2) break;
    }
    if (spots.length >= 2) break;
  }
  // 白色铁门不在 Level 0 主厅 —— 它在深坑区里（level0traproof.js 的 irondoor04）。
  // 主厅这里只留一扇普通木门，推开就是深坑区。
  if (spots[0]) exits.push({ kind: "wood04", x: spots[0].x, y: spots[0].y,
    floor: 0, toLevel: "traproof", dir: spots[0].dir });

  // 3) 深黄的墙：不是门，碰上去掉进 Level 0.7 忆域。同样只在主厅挑。
  {
    const cands = [];
    for (const t of floors) {
      if (near(t.x, t.y) < 12) continue;
      for (let k = 0; k < 4; k++) {
        const wx = t.x + (k === 0 ? 1 : k === 1 ? -1 : 0);
        const wy = t.y + (k === 2 ? 1 : k === 3 ? -1 : 0);
        if (!isWall(wx, wy)) continue;
        if (wx < 1 || wy < 1 || wx >= size - 1 || wy >= size - 1) continue;
        if (inZone(wx, wy)) continue;
        if (wall && wx === wall.x && wy === wall.y) continue;
        if (spots.some(q => q.x === wx && q.y === wy)) continue;
        cands.push({ x: wx, y: wy, d: near(wx, wy) });
      }
    }
    cands.sort((a, b) => b.d - a.d);
    if (cands.length) {
      const c = cands[randInt(0, Math.min(6, cands.length - 1))];
      exits.push({ kind: "ochrewall", x: c.x, y: c.y, floor: 0, toLevel: "0.7" });
    }
  }
  return exits;
}


function buildGlitchNook(grid, size, floors) {
  const W = 5, H = 5;
  const x = Math.max(2, size - W - 5), y = Math.max(2, size - H - 5);
  if (x + W >= size - 1 || y + H >= size - 1) return null;
  carveRoom(grid, size, x, y, W, H);
  const cx = x + (W >> 1), cy = y + (H >> 1);

  // 接一条一格宽的通道到最近的已有地板 —— 这间房必须走得到，否则等于不存在
  let best = null, bd = 1e9;
  for (const t of floors) {
    const d = Math.abs(t.x - cx) + Math.abs(t.y - cy);
    if (d < bd) { bd = d; best = t; }
  }
  if (best) carveCorridor(grid, size, cx, cy, best.x, best.y);

  // 新挖出来的地板补进 floors，后面的投放 / 连通检查才会认这块地方
  for (let yy = y; yy < y + H; yy++) {
    for (let xx = x; xx < x + W; xx++) {
      if (yy >= 0 && xx >= 0 && yy < size && xx < size && grid[yy][xx] === 0) {
        floors.push({ x: xx, y: yy });
      }
    }
  }

  // 判定点取房间外围的一格墙：玩家走到墙边（站相邻地板）就够得着
  // 只挑"紧贴房间地板"的那圈外墙，四个角不要 —— 角上的墙四邻都没有
  // 能站的地板，验证器会判成走不到的出口。
  const cands = [];
  for (let xx = x; xx < x + W; xx++) { cands.push([xx, y - 1]); cands.push([xx, y + H]); }
  for (let yy = y; yy < y + H; yy++) { cands.push([x - 1, yy]); cands.push([x + W, yy]); }
  for (const c of cands) {
    const gx = c[0], gy = c[1];
    if (gx < 1 || gy < 1 || gx >= size - 1 || gy >= size - 1) continue;
    if (grid[gy][gx] !== 1) continue;                 // 通道挖穿的那几格已经不是墙了
    return { x, y, w: W, h: H, wx: gx, wy: gy };
  }
  return null;
}

// ---------- Level 0.2：重塑的混乱（正在坍塌的子层级） ----------
function generateCollapsingMap() {
  const level = 0.2;
  const size = mapSizeFor(level);
  // 布局比 Level 0 更碎：小房间多、走廊乱（正在坍塌）
  const layer = buildRoomLayer(size, { roomW: [4, 9], roomH: [4, 9], density: 1.5, startRoom: 6 });
  const grid = layer.grid, rooms = layer.rooms, floors = layer.floors;
  const start = { x: Math.floor(size / 2), y: Math.floor(size / 2), floor: 0 };

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [rooms],
    // 本层级没有绿色出口：离开只能靠门（入口门原路返回 / 附近刷新的新门）
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null,
  };
  makeDoorsMap(map);

  // 入口门（原路返回用）：优先装在出生房间的墙线开口上，这样它才像一扇门
  const home = rooms.find((r) => r.start) || rooms[0];
  const spots = roomDoorSpots(grid, size, home);
  let sp = null, sdir = "v";
  if (spots.length) {
    const pick = spots[randInt(0, spots.length - 1)];
    sp = { x: pick.x, y: pick.y };
    sdir = pick.dir;
  } else {
    for (let dy = -2; dy <= 2 && !sp; dy++) {
      for (let dx = -2; dx <= 2 && !sp; dx++) {
        if (Math.abs(dx) + Math.abs(dy) !== 2) continue;
        const tx = start.x + dx, ty = start.y + dy;
        if (grid[ty] && grid[ty][tx] === 0) sp = { x: tx, y: ty };
      }
    }
    if (!sp) { sp = { x: start.x + 2, y: start.y }; grid[sp.y][sp.x] = 0; }
  }
  const entry = addDoor(map, [{ x: sp.x, y: sp.y, dir: sdir }], 0, "entry02", { dir: sdir });
  if (entry) {
    entry.toLevel = 0;
    map.entryDoor = entry;
  }

  // 通往 Level 0.3（冰室）的通风管道。
  // 按设定，冰室是"在 Level 0.2 找到一个通风管道"进去的。
  // 注意：spawnSupplies() 会清空 map.props，所以管道要在它之后再放。
  let ventSpot = null;
  {
    const cands = floors.filter((t) => Math.hypot(t.x - start.x, t.y - start.y) >= 6);
    const list = cands.length ? cands : floors;
    ventSpot = list[randInt(0, list.length - 1)] || null;
  }

  spawnSupplies(map, level);   // Level 0.2 没有杏仁水（只初始化空数组）
  dropBag(map, level);
  if (ventSpot) {
    map.props = map.props || [];
    map.props.push({ x: ventSpot.x, y: ventSpot.y, floor: 0, type: "vent02" });
    map.vent03 = { x: ventSpot.x, y: ventSpot.y };
  }
  return map;
}

// ================= Level 0.3：冰室 =================
// 生存难度：等级 1 / 安全 / 稳定 / 环境危害
//   · 地毯沾满冰霜，粗糙得像砂砾
//   · 墙皮裸露，黏着几片冻得发白的墙纸碎片
//   · 房间里散落着巨大的冰块，大得快装不下（挡路的实心障碍）
//   · 通风口持续往外喷霜雾，怎么堵都堵不住
//   入口：Level 0.2 里的通风管道 · 出口：找到门回到 Level 0
function generateIceRoomMap(level) {
  const size = mapSizeFor(level);
  const layer = buildRoomLayer(size, { roomW: [5, 9], roomH: [5, 9], density: 1.4, startRoom: 7 });
  const grid = layer.grid, rooms = layer.rooms;
  const start = { x: Math.floor(size / 2), y: Math.floor(size / 2), floor: 0 };

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [collectFloors(grid, size)], rooms: [rooms],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props: [], crates: [], ground: [],
    iceBlocks: [],            // 巨大的冰块（实心）
    ice: new Set(),           // 冰块占的格子（绘制用）
    vents: [],                // 通风口：持续喷霜雾
    whiteFloor: new Set(),
  };
  makeDoorsMap(map);

  // ---- 巨大的冰块：实心障碍，大得快把房间塞满 ----
  // 放之前先快照，放完验一次连通 —— 堵死路的冰块直接撤掉。
  const homeRoom = rooms.find((r) => r.start) || rooms[0];
  const inHome = (x, y) => x >= homeRoom.x && x < homeRoom.x + homeRoom.w &&
                           y >= homeRoom.y && y < homeRoom.y + homeRoom.h;
  for (const r of rooms) {
    if (r.start) continue;
    if (Math.random() > 0.55) continue;
    const bw = Math.min(randInt(2, 3), r.w - 2);
    const bh = Math.min(randInt(2, 3), r.h - 2);
    if (bw < 2 || bh < 2) continue;
    const bx = r.x + randInt(1, Math.max(1, r.w - bw - 1));
    const by = r.y + randInt(1, Math.max(1, r.h - bh - 1));
    if (bx < 1 || by < 1 || bx + bw >= size - 1 || by + bh >= size - 1) continue;
    // 出生房间不放大冰块
    if (inHome(bx, by)) continue;

    const before = floodSet(grid, size, start.x, start.y);
    const snap = grid.map((row) => row.slice());
    for (let y = by; y < by + bh; y++) {
      for (let x = bx; x < bx + bw; x++) { grid[y][x] = 1; map.ice.add(x + "," + y); }
    }
    let still = 0;
    for (const k of before) {
      const q = k.split(",");
      if (grid[+q[1]][+q[0]] === 0) still++;
    }
    if (floodSet(grid, size, start.x, start.y).size < still) {
      for (let y = 0; y < size; y++) grid[y] = snap[y].slice();
      for (let y = by; y < by + bh; y++) {
        for (let x = bx; x < bx + bw; x++) map.ice.delete(x + "," + y);
      }
      continue;
    }
    map.iceBlocks.push({ x: bx, y: by, w: bw, h: bh });
  }

  // ---- 通风口：持续往外喷霜雾 ----
  // 其中一个就是"你钻进来的那根管道" —— 再钻一次就能原路返回 Level 0.2。
  const ventSpots = [];
  for (const r of rooms) {
    for (let i = 0; i < 2; i++) {
      const x = r.x + randInt(0, r.w - 1), y = r.y + randInt(0, r.h - 1);
      if (grid[y] && grid[y][x] === 0) ventSpots.push({ x, y });
    }
  }
  // 注意：spawnSupplies() 会清空 map.props，所以通风口要在它之后再写进 props。
  let entryVent = null;
  // 入口管道：就在落点旁边（钻进来的那根）
  {
    let best = null, bd = Infinity;
    for (const t of map.floors[0]) {
      const d = Math.hypot(t.x - start.x, t.y - start.y);
      if (d < bd && d > 1) { bd = d; best = t; }
    }
    const p = best || { x: start.x + 1, y: start.y };
    entryVent = { x: p.x, y: p.y, floor: 0, type: "vent03", entry: true };
    map.vents.push(entryVent);
    map.start = { x: p.x, y: p.y, floor: 0 };
  }
  for (let i = 0; i < 4 && ventSpots.length; i++) {
    const t = ventSpots[randInt(0, ventSpots.length - 1)];
    if (!t) break;
    if (Math.hypot(t.x - map.start.x, t.y - map.start.y) < 5) continue;
    map.vents.push({ x: t.x, y: t.y, floor: 0, type: "vent03" });
  }

  // ---- 出口：一扇门，回到 Level 0 ----
  {
    const farRooms = rooms.filter((r) => !r.start);
    let placed = false;
    for (const r of farRooms.slice().sort(() => Math.random() - 0.5)) {
      const spots = roomDoorSpots(grid, size, r);
      if (!spots.length) continue;
      const pick = spots[randInt(0, spots.length - 1)];
      const d = addDoor(map, [{ x: pick.x, y: pick.y, dir: pick.dir }], 0, "door03", { dir: pick.dir });
      if (d) { d.toLevel = 0; placed = true; break; }
    }
    if (!placed) {
      // 兜底：在离落点最远的地板上开一个门洞
      let far = null, fd = -1;
      for (const t of map.floors[0]) {
        const d = Math.hypot(t.x - map.start.x, t.y - map.start.y);
        if (d > fd) { fd = d; far = t; }
      }
      if (far) {
        const d = addDoor(map, [{ x: far.x, y: far.y, dir: "h" }], 0, "door03", { dir: "h" });
        if (d) d.toLevel = 0;
      }
    }
  }

  spawnSupplies(map, level);   // 注意：它会清空 props / ground，之后才能往里加东西

  // 通风口在这里写进 props（放在 spawnSupplies 之后，否则会被清掉）
  for (const v of map.vents) map.props.push(v);

  // 冰室里还是能翻到点东西，但不多
  for (let i = 0; i < 3; i++) {
    const list = map.floors[0];
    const t = list[randInt(0, list.length - 1)];
    if (!t) break;
    if (Math.hypot(t.x - map.start.x, t.y - map.start.y) < 6) continue;
    map.ground.push({ x: t.x, y: t.y, floor: 0, item: "almond", taken: false });
  }
  // 喷枪：用来处理那些大得离谱的冰块
  {
    const list = map.floors[0];
    for (let i = 0; i < 80 && list.length; i++) {
      const t = list[randInt(0, list.length - 1)];
      if (!t) break;
      if (Math.hypot(t.x - map.start.x, t.y - map.start.y) < 8) continue;
      map.ground.push({ x: t.x, y: t.y, floor: 0, item: "torch", taken: false });
      break;
    }
  }
  return map;
}

// ---------- Level 1：宜居地带（上下两层 + 斜着的正方形地面连接） ----------
// 停车层：一整片开阔的停车区，用带门洞的防火隔墙分成几个分区，
// 区内是成排的承重柱与划好线的车位。
// 关键是"少死路"：每个分区的四面隔墙上至少有两个开口通往邻区，
// 柱子是孤立的 2x2 柱墩，玩家可以四面绕开 —— 不存在走进去要原路返回的地方。
function buildParkingLayer(size, opt) {
  opt = opt || {};
  const grid = makeGrid(size);
  const pillars = new Set(), parking = new Set(), lane = new Set();
  const bays = [];                       // 防火分区（替代"房间"，用来放补给）

  const margin = 2;
  const cols = opt.cols || 3, rows = opt.rows || 3;
  const inner = size - margin * 2 - (cols - 1);
  const innerY = size - margin * 2 - (rows - 1);
  const bw = Math.max(8, Math.floor(inner / cols));
  const bh = Math.max(8, Math.floor(innerY / rows));
  const OPEN = 4;                        // 隔墙上的开口宽 4 格 —— 宽到不像"门"

  // ---- 挖出所有分区 ----
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const bx = margin + c * (bw + 1);
      const by = margin + r * (bh + 1);
      carveRoom(grid, size, bx, by, bw, bh);
      bays.push({ x: bx, y: by, w: bw, h: bh, col: c, row: r, start: false });
    }
  }
  // ---- 隔墙上开宽口：每个分区至少通向两个邻区 ----
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols - 1; c++) {
      const wx = margin + c * (bw + 1) + bw;          // 竖直隔墙
      const oy = margin + r * (bh + 1) + Math.floor(bh / 2) - 1;
      for (let i = 0; i < OPEN; i++) grid[oy + i][wx] = 0;
    }
  }
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows - 1; r++) {
      const wy = margin + r * (bh + 1) + bh;          // 水平隔墙
      const ox = margin + c * (bw + 1) + Math.floor(bw / 2) - 1;
      for (let i = 0; i < OPEN; i++) grid[wy][ox + i] = 0;
    }
  }

  // ---- 承重柱：按阵列排布，避开出生点与斜坡 ----
  const stepX = opt.stepX || 5, stepY = opt.stepY || 6;
  const avoid = opt.avoid || [];
  const near = (x, y, r) => avoid.some((a) => Math.abs(a.x - x) <= r && Math.abs(a.y - y) <= r);
  for (let y = margin + 2; y < size - margin - 2; y += stepY) {
    for (let x = margin + 2; x < size - margin - 2; x += stepX) {
      if (near(x, y, 3)) continue;
      for (let dy = 0; dy < 2; dy++) {
        for (let dx = 0; dx < 2; dx++) {
          const gx = x + dx, gy = y + dy;
          if (gx < margin || gy < margin || gx >= size - margin || gy >= size - margin) continue;
          if (grid[gy][gx] !== 0) continue;
          grid[gy][gx] = 1;
          pillars.add(gx + "," + gy);
        }
      }
    }
  }
  // ---- 车位：柱墩两侧各划一个 ----
  for (const key of pillars) {
    const q = key.split(","); const px = +q[0], py = +q[1];
    for (const sx of [px - 1, px + 2]) {
      for (let dy = 0; dy < 2; dy++) {
        const gx = sx, gy = py + dy;
        if (gx < margin || gy < margin || gx >= size - margin || gy >= size - margin) continue;
        if (grid[gy][gx] !== 0) continue;
        parking.add(gx + "," + gy);
      }
    }
  }
  // ---- 车道：地面上的可走格（柱墩之间、分区之间的过道） ----
  for (let y = margin; y < size - margin; y++) {
    for (let x = margin; x < size - margin; x++) {
      if (grid[y][x] !== 0) continue;
      if (pillars.has(x + "," + y)) continue;
      lane.add(x + "," + y);
    }
  }

  const floors = collectFloors(grid, size);
  return { grid, floors, bays, pillars, parking, lane, size };
}

function generateSplitLevelMap() {
  const level = 1;
  const size = mapSizeFor(level);

  // 上层：开阔的停车场，柱距较宽
  const up = buildParkingLayer(size, { cols: 3, rows: 3, stepX: 6, stepY: 7 });
  // 下层：同样是停车场，但柱距更密、更压抑
  const down = buildParkingLayer(size, { cols: 3, rows: 3, stepX: 5, stepY: 5 });

  const gridUp = up.grid, gridDown = down.grid;
  const start = { x: Math.floor(size / 2), y: Math.floor(size / 2), floor: 0 };

  // 斜着的正方形地面（斜坡）：两层同一坐标各挖一块空地
  let rx = -1, ry = -1;
  for (let i = 0; i < 400; i++) {
    const ang = rand(0, Math.PI * 2), dist = rand(10, Math.min(22, size * 0.3));
    const x = Math.round(start.x + Math.cos(ang) * dist);
    const y = Math.round(start.y + Math.sin(ang) * dist);
    if (x > marginOK(size) && y > marginOK(size) && x < size - 6 && y < size - 6) { rx = x; ry = y; break; }
  }
  if (rx < 0) { rx = start.x + 10; ry = start.y; }
  const RW = 4, RH = 4;
  // 斜坡所在的 4x4 必须清空（柱子也不能占），否则换层后会被卡在柱子里
  for (const grid of [gridUp, gridDown]) {
    carveRoom(grid, size, rx, ry, RW, RH);
    for (let y = ry; y < ry + RH; y++) {
      for (let x = rx; x < rx + RW; x++) {
        const k = x + "," + y;
        if (grid === gridUp) { up.pillars.delete(k); up.lane.add(k); }
        else { down.pillars.delete(k); down.lane.add(k); }
      }
    }
  }
  const ramp = {
    x: rx, y: ry, w: RW, h: RH,
    floorA: 0, floorB: 1,
    // 两端落点（切换层后站到哪里）
    aPos: { x: rx + RW / 2, y: ry + RH / 2 },
    bPos: { x: rx + RW / 2, y: ry + RH / 2 },
  };

  // 斜板上不划车位 —— 那是连接上下层的斜坡，压着车位线会很怪
  {
    const rmv = (set) => {
      for (let y = ramp.y; y < ramp.y + ramp.h; y++)
        for (let x = ramp.x; x < ramp.x + ramp.w; x++) {
          const k = x + "," + y;
          if (set.has(k)) { set.delete(k); up.lane.add(k); }
        }
    };
    rmv(up.parking);
    rmv(down.parking);
  }

  // 出生点周围清出一片空地，免得一出生就被柱子围住
  for (const grid of [gridUp, gridDown]) {
    carveRoom(grid, size, start.x - 3, start.y - 3, 7, 7);
    for (let y = start.y - 3; y < start.y + 4; y++) {
      for (let x = start.x - 3; x < start.x + 4; x++) {
        const k = x + "," + y;
        if (grid === gridUp) { up.pillars.delete(k); up.lane.add(k); }
        else { down.pillars.delete(k); down.lane.add(k); }
      }
    }
  }

  const floorsUp = collectFloors(gridUp, size);
  const floorsDown = collectFloors(gridDown, size);

  // 出口：在上下两层之间随机刷新
  const exitFloor = Math.random() < 0.5 ? 0 : 1;
  const exitList = exitFloor === 0 ? floorsUp : floorsDown;
  const exit = Object.assign(farthestFloor(exitList, start), { floor: exitFloor });

  const map = {
    size, level, doubleStory: true,
    layers: [gridUp, gridDown],
    floors: [floorsUp, floorsDown],
    // 补给投放按"防火分区"走（替代原来的隔间），没有一间间的小房间了
    rooms: [up.bays, down.bays],
    start, exit,
    doors: [], ramps: [ramp], redFloor: new Set(), transit: null, transits: null,
    props: [], crates: [], ground: [],
    pillars: up.pillars,       // 绘制用（上层）
    pillarsByFloor: [up.pillars, down.pillars],
    parkingByFloor: [up.parking, down.parking],
    laneByFloor: [up.lane, down.lane],
  };
  makeDoorsMap(map);

  // Level 1 -> Level 2 的渐变走廊：越靠近出口，环境越像管道梦魇，尽头是一团黑雾
  {
    const ef = exit.floor | 0;
    const grid = map.layers[ef];
    // 从出口往外做一次 BFS，得到每格到出口的步数
    const dist = [];
    for (let y = 0; y < size; y++) dist.push(new Array(size).fill(-1));
    dist[exit.y][exit.x] = 0;
    const q = [{ x: exit.x, y: exit.y }];
    while (q.length) {
      const c = q.shift();
      for (let k = 0; k < 4; k++) {
        const nx = c.x + (k === 0 ? 1 : k === 1 ? -1 : 0);
        const ny = c.y + (k === 2 ? 1 : k === 3 ? -1 : 0);
        if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue;
        if (grid[ny][nx] !== 0) continue;
        if (dist[ny][nx] >= 0) continue;
        dist[ny][nx] = dist[c.y][c.x] + 1;
        q.push({ x: nx, y: ny });
      }
    }
    // 每层一份渐变图；只有出口那一层真的有渐变
    const transits = [];
    for (let f = 0; f < map.layers.length; f++) {
      const arr = [];
      for (let y = 0; y < size; y++) arr.push(new Array(size).fill(-1));
      transits.push(arr);
    }
    const R = 13;                       // 渐变走廊的影响半径（格）
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const d = dist[y][x];
        if (d < 0) continue;
        transits[ef][y][x] = clamp01(1 - d / R);   // 越靠近出口越接近 1
      }
    }
    map.transits = transits;
    map.blackFog = { x: exit.x, y: exit.y, floor: ef };   // 出口处那团黑雾
  }

  // 隔间门已经去掉了：现在这里是开阔的停车场，
  // 再拿防火隔墙的宽开口去装门，只会把"通畅"重新变回"绕路"。
  // 门留给设备楼里的 A / B 走廊。

  // 设备楼：一块实心建筑，A / B 走廊就挖在它里面
  const block = buildUtilityBlock(map, size, start);
  if (block) carveABHall(map, size, block);

  // 停车场两侧的房间（要在 A/B 设备楼之后加，才知道要避开它）。
  // 上下两层都加 —— 走到边上不该是一堵空白的墙。
  const whiteUp = new Set(), whiteDown = new Set();
  const LB1 = levelBuildings(1);
  // 房间里的桌子和柜子先攒在 sideProps 里。
  // spawnSupplies() 一进来就会把 map.props / map.ground 清空重来，
  // 直接写进 map.props 的话，加完的家具会被它整批抹掉。
  const sideProps = [];
  const nUp = addGarageSideRooms(gridUp, size, up.bays, {
    start, ramp, block, pillars: up.pillars, parking: up.parking, exit,
    whiteFloor: whiteUp, props: sideProps, fixed: LB1,
  });
  const nDown = addGarageSideRooms(gridDown, size, down.bays, {
    start, ramp, block: null, pillars: down.pillars, parking: down.parking, exit,
    whiteFloor: whiteDown, props: sideProps, floor: 1, fixed: LB1,
  });
  map.sideRooms = [nUp, nDown];
  map.whiteFloor = [whiteUp, whiteDown];
  // 加了房间之后地板变了，重新统计（补给投放要用）
  map.floors = [collectFloors(gridUp, size), collectFloors(gridDown, size)];

  // M.E.G 的 Alpha 基地（固定位置）—— 里面的门全是伸缩门
  const base = buildAlphaBase(map, size, 0);
  // 通往 Level 2 的黑雾：就藏在基地里最靠里的那一间房中。
  // 玩家在基地补给完，往走廊深处走就能撞见 —— 不必满地图乱找。
  if (base) relocateExitBesideBase(map, size, base, level);

  spawnSupplies(map, level);
  dropBag(map, level);
  // 补给放完之后再把房间家具并进来
  for (const pr of sideProps) map.props.push(pr);
  // 基地里的物资：杏仁水 + 撬棍（放在 spawnSupplies 之后，否则会被清掉）
  if (base) spawnBaseSupplies(map, base);
  if (base) spawnBaseArchiveSpots(map, base);
  // Level 19 的入口：地板上一个真正的洞口（不是桌子 —— 那是没建模型时画的兜底方块）。
  // 位置要离通往 Level 2 的黑雾远远的：以前就搁在基地北边 3 格，
  // 跟黑雾几乎挨在一起，玩家分不清哪边是去 Level 2、哪边是去 Level 19。
  if (base) {
    const floor = map.megFloor | 0;
    const grid = map.layers[floor];
    const reach = reachableFrom(map, floor, map.start || { x: size >> 1, y: size >> 1 });
    const ex = map.exit;
    const dExit = (x, y) => (ex ? Math.hypot(x - ex.x, y - ex.y) : 999);
    const dStart = (x, y) => Math.hypot(x - (map.start ? map.start.x : size >> 1),
                                        y - (map.start ? map.start.y : size >> 1));
    // 候选：走得到、不在基地里、离黑雾至少 24 格、离出生点至少 12 格
    let best = null, bestD = -1;
    for (const k of reach) {
      const c = k.indexOf(",");
      const x = +k.slice(0, c), y = +k.slice(c + 1);
      if (x < 2 || y < 2 || x >= size - 2 || y >= size - 2) continue;
      if (base.inside.has(k) || base.wall.has(k)) continue;
      const de = dExit(x, y);
      if (de < 24) continue;
      if (dStart(x, y) < 12) continue;
      // 洞口别贴着墙角：四周至少要有两格地板，看得出来是个洞
      let openN = 0;
      for (const d of [[1,0],[-1,0],[0,1],[0,-1]]) {
        const nx = x + d[0], ny = y + d[1];
        if (nx >= 0 && ny >= 0 && nx < size && ny < size && grid[ny][nx] === 0) openN++;
      }
      if (openN < 3) continue;
      if (de > bestD) { bestD = de; best = { x, y }; }
    }
    // 兜底：整张图都不够大的时候，退而求其次（至少比原来离得远）
    if (!best) {
      let b2 = null, bd2 = -1;
      for (const k of reach) {
        const c = k.indexOf(",");
        const x = +k.slice(0, c), y = +k.slice(c + 1);
        if (base.inside.has(k) || base.wall.has(k)) continue;
        const de = dExit(x, y);
        if (de > bd2) { bd2 = de; b2 = { x, y }; }
      }
      best = b2;
    }
    if (best) {
      map.atticHole = { x: best.x, y: best.y, floor };
      map.props.push({ x: best.x, y: best.y, floor, type: "hole" });
    }
  }
  // 花园段挪到本函数最末尾再建（见下面 return 之前）：
  // 后面的侧房 / 门 / 商人之家会重建一部分墙，早建好的连接走廊会被盖回去，
  // 东北角那团绿光就成了「走不到的出口」。
  // Level 1.1 的入口：Alpha 基地正南方那扇门，门口立着一块标着去向的牌子。
  // 跟花园段一样放在补给之后 —— 否则刚 push 进去的门会被清掉。
  if (base && typeof window !== "undefined" && typeof window.buildCorridor11Door === "function") {
    window.buildCorridor11Door(map, size, base);
  }
  // Level 2.1 的入口：基地周围那处隐蔽的小屋（屋里有野生浆果，最里侧墙上有一道缝）
  if (base && typeof window !== "undefined" && typeof window.buildHiddenNook21 === "function") {
    window.buildHiddenNook21(map, size, base);
  }
  // 出口（黑雾）周围清一圈：通关点后面不再留任何拿不到的东西
  clearSuppliesNearExit(map);
  // 1.3.0：下层东侧单独扩出去的一块地 —— B.N.T.G「商人之家」。
  // 放在最后，免得刚摆好的摊位被前面的补给 / 侧房家具盖掉。
  if (typeof window !== "undefined" && typeof window.buildMerchantHome === "function") {
    window.buildMerchantHome(map, size);
  }
  // 花园段必须排在所有会重设墙的步骤之后：否则它挖出来接回主停车场的
  // 那条走廊会被重新砌上，东北角的绿光出口虽然画得出来，人却永远走不到。
  if (typeof window !== "undefined" && typeof window.buildGardenNook === "function") {
    window.buildGardenNook(map, size);
  }
  return map;
}

function marginOK(size) { return 4; }

// 设备楼：停车层里唯一一栋实心建筑（给 A / B 走廊用）。
// 它本身就是个可以四面绕开的障碍物，不会造成死路。
// 停车场两侧的房间（储藏室 / 办公室 / 设备间）
// Level 1 是停车场：中间是开阔的车位区，沿外墙排着一间间房间。
// 之前整层只有 3x3 个防火分区、四周全是空墙 —— 走到边上什么都没有，
// 一路撞到空白的墙，就是玩家说的"死路"。
//
// 房间开的是 3 格宽的口子（像车库的卷帘门洞），一眼就看出能进能出，
// 不会是"进去就得原路返回"的死胡同。
function addGarageSideRooms(grid, size, baysOut, opt) {
  const start = opt.start, ramp = opt.ramp, block = opt.block;
  const pillars = opt.pillars, parking = opt.parking;
  const exit = opt.exit;

  // 已放下的房间的内部格子 —— 新房间的开口不许挖进另一间房里，
  // 否则两间房就被打通了（Level 1 的房间各自独立，不互相连通）。
  const occupied = new Set();
  const whiteFloor = opt.whiteFloor || new Set();

  const bad = (x, y) => {
    if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) return true;
    if (occupied.has(x + "," + y)) return true;
    if (rampContains(ramp, x, y)) return true;
    if (Math.abs(x - start.x) < 11 && Math.abs(y - start.y) < 11) return true;
    // 出口与它周围那条"越来越像 Level 2"的渐变走廊不能挡
    if (exit && (exit.floor | 0) === 0 && Math.hypot(x - exit.x, y - exit.y) < 13) return true;
    if (block && x >= block.x - 3 && x <= block.x + block.w + 2 &&
        y >= block.y - 3 && y <= block.y + block.h + 2) return true;
    return false;
  };

  const snap = grid.map((r) => r.slice());
  // 判据不能是"地板总数没变少"：房间外壳本来就是把地板改成墙，
  // 照那条判，加的房间越多越像"把路堵死了"，于是一间都放不出来。
  // 真正该看的是：原来走得到的地方，现在还走得到吗。
  const beforeSet = floodSet(grid, size, start.x, start.y);
  const made = [];
  const OPEN = 3;                      // 开口宽度

  const place = (x0, y0, w, h, dx, dy) => {
    if (x0 < 2 || y0 < 2 || x0 + w >= size - 2 || y0 + h >= size - 2) return false;
    for (let y = y0 - 1; y <= y0 + h; y++) {
      for (let x = x0 - 1; x <= x0 + w; x++) {
        if (bad(x, y)) return false;
      }
    }
    // 墙壳
    for (let y = y0 - 1; y <= y0 + h; y++) {
      for (let x = x0 - 1; x <= x0 + w; x++) {
        if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) continue;
        grid[y][x] = 1;
      }
    }
    // 内部
    for (let y = y0; y < y0 + h; y++) {
      for (let x = x0; x < x0 + w; x++) grid[y][x] = 0;
    }
    // 开口（3 格宽），并从开口往外挖到能走的地方
    const ox = dx !== 0 ? (dx > 0 ? x0 + w : x0 - 1) : x0 + ((w - OPEN) >> 1);
    const oy = dy !== 0 ? (dy > 0 ? y0 + h : y0 - 1) : y0 + ((h - OPEN) >> 1);
    for (let k = 0; k < OPEN; k++) {
      // 开口方向别搞反：贴上下墙的房间开口是"横着"的（同一行、连着 3 格 x），
      // 贴左右墙的才是"竖着"的（同一列、连着 3 格 y）。写反了就成斜着的三格。
      const gx = dy !== 0 ? ox + k : ox;
      const gy = dx !== 0 ? oy + k : oy;
      if (gx < 1 || gy < 1 || gx >= size - 1 || gy >= size - 1) continue;
      grid[gy][gx] = 0;
      let cx = gx + dx, cy = gy + dy, n = 0;
      while (n < 20) {
        if (cx < 1 || cy < 1 || cx >= size - 1 || cy >= size - 1) break;
        if (grid[cy][cx] === 0) break;
        if (occupied.has(cx + "," + cy)) break;      // 不许挖穿另一间房
        grid[cy][cx] = 0;
        cx += dx; cy += dy; n++;
      }
    }
    made.push({ x: x0, y: y0, w, h, side: true, dx, dy });
    // 登记内部：地面是白色的，房间里摆桌子和柜子
    for (let y = y0; y < y0 + h; y++) {
      for (let x = x0; x < x0 + w; x++) {
        occupied.add(x + "," + y);
        whiteFloor.add(x + "," + y);
      }
    }
    if (opt.props) {
      const put = (type) => {
        for (let a = 0; a < 12; a++) {
          const x = x0 + randInt(0, w - 1), y = y0 + randInt(0, h - 1);
          if (grid[y] && grid[y][x] !== 0) continue;
          let hit = false;
          for (const pr of opt.props) if (pr.x === x && pr.y === y) { hit = true; break; }
          if (hit) continue;
          opt.props.push({ x, y, floor: opt.floor || 0, type });
          return;
        }
      };
      put("cabinet");
      if (Math.random() < 0.7) put("table");
      if (Math.random() < 0.4) put("cabinet");
    }
    return true;
  };

  // 逐间试放：放完立刻验一次连通；这间把哪块地板圈死了就撤掉这一间，
  // 其余照留 —— 之前是"有一间不通就整套还原"，结果常常一间都放不出来。
  const tryPlace = (x0, y0, w, h, dx, dy) => {
    const setBefore = floodSet(grid, size, start.x, start.y);
    const snapOne = grid.map((r) => r.slice());
    if (!place(x0, y0, w, h, dx, dy)) return false;
    let still = 0;
    for (const k of setBefore) {
      const q = k.split(",");
      if (grid[+q[1]][+q[0]] === 0) still++;
    }
    if (floodSet(grid, size, start.x, start.y).size < still) {
      for (let y = 0; y < size; y++) grid[y] = snapOne[y].slice();
      made.pop();
      return false;
    }
    return true;
  };

  const RW = () => randInt(6, 9), RH = () => randInt(5, 8);

  // ---- 固定布局优先：js/level/level1.js ----
  // 同一层级每次进入，房间都在同一个位置（相对坐标按地图尺寸换算）。
  const fixed = opt.fixed;
  if (fixed && fixed.sideRooms && fixed.sideRooms.length) {
    const DIRMAP = { down: [0, 1], up: [0, -1], right: [1, 0], left: [-1, 0] };
    const snapF = grid.map((r) => r.slice());
    const beforeF = floodSet(grid, size, start.x, start.y);
    const madeF = [];
    for (const rel of fixed.sideRooms) {
      const t = relToTiles(rel, size);
      const d = DIRMAP[rel.dir] || [0, 1];
      const x0 = Math.min(t.x, size - 4 - t.w), y0 = Math.min(t.y, size - 4 - t.h);
      if (x0 < 2 || y0 < 2) continue;
      let skip = false;
      for (let y = y0 - 1; y <= y0 + t.h && !skip; y++) {
        for (let x = x0 - 1; x <= x0 + t.w; x++) {
          if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) continue;
          if (Math.abs(x - start.x) < 11 && Math.abs(y - start.y) < 11) { skip = true; break; }
          if (rampContains(ramp, x, y)) { skip = true; break; }
          if (exit && (exit.floor | 0) === 0 && Math.hypot(x - exit.x, y - exit.y) < 13) { skip = true; break; }
          if (block && x >= block.x - 3 && x <= block.x + block.w + 2 &&
              y >= block.y - 3 && y <= block.y + block.h + 2) { skip = true; break; }
        }
      }
      if (skip) continue;
      const snapOne = grid.map((r) => r.slice());
      const nBefore = made.length;
      if (!place(x0, y0, t.w, t.h, d[0], d[1])) continue;
      let stillF = 0;
      for (const k of beforeF) {
        const q = k.split(",");
        if (grid[+q[1]][+q[0]] === 0) stillF++;
      }
      if (floodSet(grid, size, start.x, start.y).size < stillF) {
        for (let y = 0; y < size; y++) grid[y] = snapOne[y].slice();
        made.length = nBefore;
        continue;
      }
      madeF.push(made[made.length - 1]);
    }
    if (madeF.length) {
      const okS = floodSet(grid, size, start.x, start.y);
      for (let y = 1; y < size - 1; y++) {
        for (let x = 1; x < size - 1; x++) {
          if (grid[y][x] !== 0 || okS.has(x + "," + y)) continue;
          grid[y][x] = 1;
          if (pillars) pillars.delete(x + "," + y);
          if (parking) parking.delete(x + "," + y);
        }
      }
      for (const r of madeF) {
        if (!r) continue;
        baysOut.push(r);
        for (let y = r.y; y < r.y + r.h; y++) {
          for (let x = r.x; x < r.x + r.w; x++) {
            const k = x + "," + y;
            if (pillars) pillars.delete(k);
            if (parking) parking.delete(k);
          }
        }
      }
      return madeF.length;
    }
    for (let y = 0; y < size; y++) grid[y] = snapF[y].slice();
    made.length = 0;
  }

  for (let x = 6; x < size - 12;) {                       // 上边：开口朝下
    const w = RW(), h = RH();
    tryPlace(x, 3, w, h, 0, 1);
    x += w + randInt(4, 7);
  }
  for (let x = 6; x < size - 12;) {                       // 下边：开口朝上
    const w = RW(), h = RH();
    tryPlace(x, size - 3 - h, w, h, 0, -1);
    x += w + randInt(4, 7);
  }
  for (let y = 12; y < size - 16;) {                      // 左边：开口朝右
    const w = RW(), h = RH();
    tryPlace(3, y, w, h, 1, 0);
    y += h + randInt(4, 7);
  }
  for (let y = 12; y < size - 16;) {                      // 右边：开口朝左
    const w = RW(), h = RH();
    tryPlace(size - 3 - w, y, w, h, -1, 0);
    y += h + randInt(4, 7);
  }

  // 逐间试放时已经各自验过连通了，这里只做最后一道保险
  let stillFloor = 0;
  for (const k of beforeSet) {
    const q = k.split(",");
    if (grid[+q[1]][+q[0]] === 0) stillFloor++;
  }
  const after = floodSet(grid, size, start.x, start.y).size;
  if (made.length && after >= stillFloor) {
    for (const r of made) {
      baysOut.push(r);
      // 房间里的柱子 / 车位标线要清掉，否则柱子会立在房间地板上
      for (let y = r.y; y < r.y + r.h; y++) {
        for (let x = r.x; x < r.x + r.w; x++) {
          const k = x + "," + y;
          if (pillars) pillars.delete(k);
          if (parking) parking.delete(k);
        }
      }
    }
    // 有的房间开口会被后来某间房的外壳压住，整间变成谁也进不去的死盒子 ——
    // 重新开一次口，再往外挖通。
    let okSet = floodSet(grid, size, start.x, start.y);
    for (const r of made) {
      if (okSet.has(r.x + "," + r.y)) continue;
      const ox2 = r.dx !== 0 ? (r.dx > 0 ? r.x + r.w : r.x - 1) : r.x + ((r.w - OPEN) >> 1);
      const oy2 = r.dy !== 0 ? (r.dy > 0 ? r.y + r.h : r.y - 1) : r.y + ((r.h - OPEN) >> 1);
      for (let k = 0; k < OPEN; k++) {
        const gx = r.dy !== 0 ? ox2 + k : ox2;
        const gy = r.dx !== 0 ? oy2 + k : oy2;
        if (gx < 1 || gy < 1 || gx >= size - 1 || gy >= size - 1) continue;
        grid[gy][gx] = 0;
        let cx = gx + r.dx, cy = gy + r.dy, n = 0;
        while (n < 24) {
          if (cx < 1 || cy < 1 || cx >= size - 1 || cy >= size - 1) break;
          if (grid[cy][cx] === 0) break;
          grid[cy][cx] = 0; cx += r.dx; cy += r.dy; n++;
        }
      }
      okSet = floodSet(grid, size, start.x, start.y);
    }

    // 收尾：把被墙圈死的孤立地板填回墙。
    // 房间往外挖的引道可能被后来某间房的外壳切断，留下几格谁也走不到的死地 ——
    // 看着像"能走"，实际是走进去就出不来的死路，直接填掉最干净。
    okSet = floodSet(grid, size, start.x, start.y);
    for (let y = 1; y < size - 1; y++) {
      for (let x = 1; x < size - 1; x++) {
        if (grid[y][x] !== 0) continue;
        if (okSet.has(x + "," + y)) continue;
        grid[y][x] = 1;
        if (pillars) pillars.delete(x + "," + y);
        if (parking) parking.delete(x + "," + y);
      }
    }
    return made.length;
  }
  // 把路堵坏了：整套还原
  for (let y = 0; y < size; y++) grid[y] = snap[y].slice();
  return 0;
}

// 从某格出发能走到的格子集合（用来校验"有没有把路堵死"）
function floodSet(grid, size, sx, sy) {
  const seen = new Set();
  if (sx < 0 || sy < 0 || sx >= size || sy >= size) return seen;
  if (grid[sy][sx] !== 0) return seen;
  const q = [[sx, sy]];
  seen.add(sx + "," + sy);
  while (q.length) {
    const c = q.pop();
    const x = c[0], y = c[1];
    for (let k = 0; k < 4; k++) {
      const nx = x + (k === 0 ? 1 : k === 1 ? -1 : 0);
      const ny = y + (k === 2 ? 1 : k === 3 ? -1 : 0);
      if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue;
      if (grid[ny][nx] !== 0) continue;
      const key = nx + "," + ny;
      if (seen.has(key)) continue;
      seen.add(key);
      q.push([nx, ny]);
    }
  }
  return seen;
}

function levelBuildings(level) {
  const all = (typeof window !== "undefined") && window.LEVEL_BUILDINGS;
  if (!all) return null;
  return all[String(level)] || null;
}
function relToTiles(rel, size) {
  return {
    x: Math.max(2, Math.round(rel.x * size)),
    y: Math.max(2, Math.round(rel.y * size)),
    w: Math.max(4, Math.round(rel.w * size)),
    h: Math.max(4, Math.round(rel.h * size)),
  };
}

// Alpha 基地里的补给：杏仁水、撬棍、几篇基地档案的落点
function spawnBaseSupplies(map, base) {
  const grid = map.layers[map.megFloor | 0];
  const cells = [];
  for (const r of base.rooms) {
    for (let y = r.y + 1; y < r.y + r.h - 1; y++) {
      for (let x = r.x + 1; x < r.x + r.w - 1; x++) {
        if (grid[y][x] === 0) cells.push({ x, y, room: r.name });
      }
    }
  }
  if (!cells.length) return;
  const pick = (n, item) => {
    for (let i = 0; i < n && cells.length; i++) {
      const t = cells[randInt(0, cells.length - 1)];
      if (!t) break;
      map.ground.push({ x: t.x, y: t.y, floor: map.megFloor | 0, item, taken: false });
    }
  };
  pick(4, "almond");
  pick(1, "crowbar");
  pick(1, "bag1");
}

// ================= Level 1：M.E.G 的 Alpha 基地 =================
// 布局照 M.E.G 的公开文章来：一条主走廊贯穿，靠近入口的是四个行署，
// 更远处是居民区。入口和每个房间的门全都是白色铁质伸缩门（M.E.G 字样），
// 靠近自动朝一侧滑开，走远自动关上。
//   上排：探险署（中控室 / 会议室）· 研究署（实验室 / 储藏间）
//         行政署（大会厅 A / B）· 居民区
//   下排：档案署（办公室 / 技术支援 / 纸质档案馆）· 行政署（行政部门 / 大会厅 C / 监督者驻办）
//         贸易路线中转站 · 居民区
const MEG_ROOMS_TOP = ["中控室", "会议室", "实验室与检测室", "储藏间",
  "大会厅A", "大会厅B", "居民区一", "居民区二"];
const MEG_ROOMS_BOTTOM = ["办公室", "技术支援部门", "纸质档案馆", "行政部门",
  "大会厅C", "监督者驻办", "贸易路线中转站", "居民区三"];
// 每个房间归到哪个行署（只是给档案和提示用）
const MEG_WING = {
  "中控室": "探险署", "会议室": "探险署",
  "实验室与检测室": "研究署", "储藏间": "研究署",
  "办公室": "档案署", "技术支援部门": "档案署", "纸质档案馆": "档案署",
  "行政部门": "行政署", "大会厅A": "行政署", "大会厅B": "行政署", "大会厅C": "行政署",
  "监督者驻办": "行政署", "贸易路线中转站": "行政署",
  "居民区一": "居民区", "居民区二": "居民区", "居民区三": "居民区",
};

function buildAlphaBase(map, size, floor) {
  const grid = map.layers[floor | 0];
  const LB = levelBuildings(1);
  const rel = (LB && LB.alphaBase) ? LB.alphaBase : { x: 0.12, y: 0.26, w: 0.42, h: 0.40 };
  const box = relToTiles(rel, size);
  const x0 = Math.max(2, Math.min(box.x, size - box.w - 3));
  const y0 = Math.max(2, Math.min(box.y, size - box.h - 3));
  const x1 = Math.min(x0 + box.w, size - 3), y1 = Math.min(y0 + box.h, size - 3);
  if (x1 - x0 < 26 || y1 - y0 < 20) return null;

  // 整块推平成地板，再围上一圈外墙。
  // 外面也清出 2 格宽的环廊 —— 基地挪到角落之后，紧贴外墙的那几格常常是
  // 停车场的墙或承重柱，玩家根本走不到门口（实测过：站在门外是墙，进不去）。
  const cl = (v) => Math.max(1, Math.min(v, size - 2));
  for (let y = cl(y0 - 2); y <= cl(y1 + 2); y++)
    for (let x = cl(x0 - 2); x <= cl(x1 + 2); x++) grid[y][x] = 0;
  const wall = new Set(), inside = new Set();
  for (let x = x0; x <= x1; x++) { grid[y0][x] = 1; grid[y1][x] = 1; wall.add(x + "," + y0); wall.add(x + "," + y1); }
  for (let y = y0; y <= y1; y++) { grid[y][x0] = 1; grid[y][x1] = 1; wall.add(x0 + "," + y); wall.add(x1 + "," + y); }
  for (let y = y0 + 1; y < y1; y++) for (let x = x0 + 1; x < x1; x++) { grid[y][x] = 0; inside.add(x + "," + y); }

  const doors = [];
  const mkDoor = (tiles, kind, dir) => {
    doors.push({ kind, dir, floor: floor | 0, tiles, open: false, slide: 0, locked: false, meg: true });
  };

  // 主走廊：横贯整块，中间那三行。
  // 原来只有一行 —— 人走在里头，上下两排的门全怼在脸上，挤得转不开身。
  const CORR_H = 3;
  const cy = y0 + Math.floor((y1 - y0) / 2);
  const corrTop = cy - 1, corrBot = cy + 1;
  const rooms = [];

  // 把一横排切成若干房间；每个房间朝走廊开一扇伸缩门
  const carveRow = (names, top) => {
    const n = names.length;
    const rTop = top ? y0 + 1 : corrBot + 2;
    const rBot = top ? corrTop - 2 : y1 - 1;
    if (rBot <= rTop) return;
    const wallRow = top ? corrTop - 1 : corrBot + 1;   // 房间与走廊之间的那道隔墙
    const xA = x0 + 1, xB = x1 - 1;
    const span = xB - xA + 1;
    const w = Math.floor(span / n);
    for (let i = 0; i < n; i++) {
      const rx0 = xA + i * w;
      const rx1 = (i === n - 1) ? xB : rx0 + w - 1;
      if (rx1 <= rx0) continue;
      // 房间与房间之间的隔墙
      for (let y = rTop; y <= rBot; y++) {
        if (rx0 > xA) { grid[y][rx0 - 1] = 1; wall.add((rx0 - 1) + "," + y); inside.delete((rx0 - 1) + "," + y); }
      }
      // 房间内部
      const cells = [];
      for (let y = rTop; y <= rBot; y++) for (let x = rx0; x <= rx1; x++) { grid[y][x] = 0; inside.add(x + "," + y); cells.push({ x, y }); }
      // 与走廊之间的隔墙
      for (let x = rx0; x <= rx1; x++) {
        grid[wallRow][x] = 1; wall.add(x + "," + wallRow); inside.delete(x + "," + wallRow);
      }
      // 门洞：开在房间正中
      const dx = Math.floor((rx0 + rx1) / 2);
      grid[wallRow][dx] = 0; wall.delete(dx + "," + wallRow); inside.add(dx + "," + wallRow);
      if (dx >= x0 && dx <= x1) mkDoor([{ x: dx, y: wallRow }], "megdoor", { x: 0, y: top ? 1 : -1 });
      rooms.push({ name: names[i], wing: MEG_WING[names[i]] || "Alpha 基地",
        x: rx0, y: rTop, w: rx1 - rx0 + 1, h: rBot - rTop + 1, cells, door: { x: dx, y: wallRow } });
    }
  };
  carveRow(MEG_ROOMS_TOP, true);
  carveRow(MEG_ROOMS_BOTTOM, false);

  // 走廊本身：三行全是地板
  for (let y = corrTop; y <= corrBot; y++)
    for (let x = x0 + 1; x < x1; x++) { grid[y][x] = 0; inside.add(x + "," + y); }

  // 主入口：开在左侧外墙、正对走廊，2 格宽，装一扇伸缩大门
  for (let y = corrTop; y <= corrBot; y++) {
    grid[y][x0] = 0; grid[y][x0 - 1] = 0; grid[y][x0 - 2] = 0;
    wall.delete(x0 + "," + y); inside.add(x0 + "," + y);
  }
  mkDoor([{ x: x0, y: corrTop }, { x: x0, y: corrBot }], "megentry", { x: -1, y: 0 });

  const base = {
    x: x0, y: y0, w: x1 - x0, h: y1 - y0,
    inside, wall, rooms, corridorY: cy, corrTop, corrBot,
    entry: { x: x0, y: cy },
  };
  map.alphaBase = base;
  map.megFloor = floor | 0;
  // 基地把这一整块推平了，地板清单要重算，否则补给会刷在被清掉的地方
  if (map.layers) map.floors = map.layers.map((g) => collectFloors(g, map.size));
  for (const d of doors) map.doors.push(d);
  makeDoorsMap(map);      // 基地的门是后加的，门遮挡表要重算一次
  return base;
}

// 把 Level 1 -> Level 2 的出口（黑雾）放到地图角落里。
// 之前它落在 Alpha 基地最靠里的那间房的正中央 —— 房间深处的物资全在"通关点后面"，
// 玩家一进屋就被传送走，根本来不及拿。现在出口与基地各占一个角，
// 而且出口附近不再放任何物资，免得又出现拿不到的东西。
function relocateExitToCorner(map, size, base, level) {
  const LB = levelBuildings(1);
  const corner = (LB && LB.exitCorner) || "tl";
  const floor = (base && map.megFloor != null) ? (map.megFloor | 0) : 0;
  const grid = map.layers[floor];
  const s = map.start || { x: size >> 1, y: size >> 1 };
  const M = 4;                                   // 离地图边界留几格
  // 目标角落的锚点
  const anchor = {
    tl: { x: M, y: M }, tr: { x: size - 1 - M, y: M },
    bl: { x: M, y: size - 1 - M }, br: { x: size - 1 - M, y: size - 1 - M },
  }[corner] || { x: M, y: M };

  // 先从出生点做一次 BFS —— 出口必须真的走得到，不能选进一个封闭的角落
  const reach = reachableFrom(map, floor, { x: s.x, y: s.y });

  // 在这个角落一带找一格：走得通、不在基地里、离锚点最近
  let best = null, bestScore = Infinity;
  const R = Math.max(8, Math.round(size * 0.16));
  for (let y = Math.max(1, anchor.y - R); y <= Math.min(size - 2, anchor.y + R); y++) {
    for (let x = Math.max(1, anchor.x - R); x <= Math.min(size - 2, anchor.x + R); x++) {
      if (grid[y][x] !== 0) continue;
      const k = x + "," + y;
      if (!reach.has(k)) continue;                            // 走不到的不要
      if (base && base.inside.has(k)) continue;               // 不要放进基地
      // 别贴着墙角，门洞/通行都要留得开
      let wallN = 0;
      for (let d = 0; d < 4; d++) {
        const nx = x + (d === 0 ? 1 : d === 1 ? -1 : 0);
        const ny = y + (d === 2 ? 1 : d === 3 ? -1 : 0);
        if (nx < 0 || ny < 0 || nx >= size || ny >= size || grid[ny][nx] !== 0) wallN++;
      }
      if (wallN >= 3) continue;                               // 死角落，不要
      const score = Math.abs(x - anchor.x) + Math.abs(y - anchor.y);
      if (score < bestScore) { bestScore = score; best = { x, y }; }
    }
  }
  if (!best) return null;

  const nf = { x: best.x, y: best.y, floor };
  map.exit = nf;
  map.blackFog = { x: best.x, y: best.y, floor };
  rebuildTransits(map, size, nf);
  return nf;
}

// 通往 Level 2 的出口（黑雾）：固定刷在 Alpha 基地边上 —— 补给完顺脚就到，
// 不用满地图找。位置写在 js/level/level1.js 的 exitSide 里（"left/right/up/down"）。
function relocateExitBesideBase(map, size, base, level) {
  if (!base) return null;
  const LB = levelBuildings(1);
  const side = (LB && LB.exitSide) || "right";
  const floor = (map.megFloor != null) ? (map.megFloor | 0) : 0;   // 上层
  const grid = map.layers[floor];
  const reach = reachableFrom(map, floor, map.start || { x: size >> 1, y: size >> 1 });

  // 沿基地外沿挑一格：在基地之外、紧贴外墙、走得通
  const cand = [];
  const bx0 = base.x, by0 = base.y, bx1 = base.x + base.w, by1 = base.y + base.h;
  for (let x = Math.max(2, bx0 - 3); x <= Math.min(size - 3, bx1 + 3); x++) {
    for (let y = Math.max(2, by0 - 3); y <= Math.min(size - 3, by1 + 3); y++) {
      const k = x + "," + y;
      if (grid[y][x] !== 0) continue;
      if (base.inside.has(k) || base.wall.has(k)) continue;     // 不在基地里
      if (!reach.has(k)) continue;                              // 走得到
      // 必须紧贴基地外墙（距离 <= 2 格）
      if (x < bx0 - 2 || x > bx1 + 2 || y < by0 - 2 || y > by1 + 2) continue;
      let wallN = 0;
      for (let d = 0; d < 4; d++) {
        const nx = x + (d === 0 ? 1 : d === 1 ? -1 : 0);
        const ny = y + (d === 2 ? 1 : d === 3 ? -1 : 0);
        if (nx < 0 || ny < 0 || nx >= size || ny >= size || grid[ny][nx] !== 0) wallN++;
      }
      if (wallN >= 3) continue;                                 // 死角不要
      cand.push({ x, y });
    }
  }
  if (!cand.length) return null;
  // 按 side 排序：先选贴着那一侧的
  // 升序取 [0]，所以 key 要"越符合那一侧越小"
  const key = (t) => {
    if (side === "right") return bx1 - t.x;   // 越靠右越小
    if (side === "left") return t.x - bx0;    // 越靠左越小
    if (side === "up") return t.y - by0;      // 越靠上越小
    return by1 - t.y;                         // 越靠下越小
  };
  // 次级：贴着那一侧的中段（看起来才像"基地边上的出口"）
  const cy = (by0 + by1) / 2, cx = (bx0 + bx1) / 2;
  const off = (t) => (side === "right" || side === "left") ? Math.abs(t.y - cy) : Math.abs(t.x - cx);
  cand.sort((a, b) => (key(a) * 1000 + off(a)) - (key(b) * 1000 + off(b)));
  const best = cand[0];

  const nf = { x: best.x, y: best.y, floor };
  map.exit = nf;
  map.blackFog = { x: best.x, y: best.y, floor };
  rebuildTransits(map, size, nf);
  return nf;
}

// 以出口为源重做 BFS，重算"越靠近出口越像管道梦魇"的渐变走廊
function rebuildTransits(map, size, nf) {
  const g2 = map.layers[nf.floor];
  const dist = [];
  for (let y = 0; y < size; y++) dist.push(new Array(size).fill(-1));
  dist[nf.y][nf.x] = 0;
  const q = [{ x: nf.x, y: nf.y }];
  while (q.length) {
    const c = q.shift();
    for (let k = 0; k < 4; k++) {
      const nx = c.x + (k === 0 ? 1 : k === 1 ? -1 : 0);
      const ny = c.y + (k === 2 ? 1 : k === 3 ? -1 : 0);
      if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue;
      if (g2[ny][nx] !== 0) continue;
      if (dist[ny][nx] >= 0) continue;
      dist[ny][nx] = dist[c.y][c.x] + 1;
      q.push({ x: nx, y: ny });
    }
  }
  const transits = [];
  for (let f = 0; f < map.layers.length; f++) {
    const arr = [];
    for (let y = 0; y < size; y++) arr.push(new Array(size).fill(-1));
    transits.push(arr);
  }
  const R = 13;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const d = dist[y][x];
      if (d < 0) continue;
      transits[nf.floor][y][x] = clamp01(1 - d / R);
    }
  }
  map.transits = transits;
}

// Alpha 基地里的档案：就摆在各行署的房间里（具体是哪几篇由 spawnArchives 决定）
function spawnBaseArchiveSpots(map, base) {
  if (!base || !base.rooms || !base.rooms.length) return;
  const grid = map.layers[map.megFloor | 0];
  const pool = [];
  for (const r of base.rooms) {
    for (const c of r.cells) {
      if (grid[c.y][c.x] !== 0) continue;
      if (r.door && c.x === r.door.x && c.y === r.door.y) continue;   // 别堵在门口
      pool.push({ x: c.x, y: c.y });
    }
  }
  const shuffle = pool.slice().sort(() => Math.random() - 0.5);
  map.baseArchiveSpots = shuffle.slice(0, 3).map((t) => ({
    x: t.x, y: t.y, floor: map.megFloor | 0,
  }));
}

// 出口附近不放物资 —— 否则玩家一脚踩上去就被传送走，那些东西永远拿不到
function clearSuppliesNearExit(map) {
  const e = map.exit;
  if (!e) return;
  const near = (o) => (o.floor | 0) === (e.floor | 0) &&
    Math.abs(o.x - e.x) <= 2 && Math.abs(o.y - e.y) <= 2;
  if (map.ground) map.ground = map.ground.filter((t) => !near(t));
  if (map.crates) map.crates = map.crates.filter((c) => !near(c));
  if (map.props) map.props = map.props.filter((p) => !near(p));
}

// Alpha 基地里的补给：杏仁水、撬棍、小挎包（放在 spawnSupplies 之后，否则会被清掉）
function spawnBaseSupplies(map, base) {
  const grid = map.layers[map.megFloor | 0];
  const cells = [];
  for (const r of base.rooms) {
    for (const c of r.cells) if (grid[c.y][c.x] === 0) cells.push(c);
  }
  if (!cells.length) return;
  // 物资优先放在储藏间与贸易路线中转站
  const store = base.rooms.filter((r) => r.name === "储藏间" || r.name === "贸易路线中转站");
  const inStore = [];
  for (const r of store) for (const c of r.cells) if (grid[c.y][c.x] === 0) inStore.push(c);
  const pick = (n, item, pool) => {
    for (let i = 0; i < n && pool.length; i++) {
      const t = pool[randInt(0, pool.length - 1)];
      if (!t) break;
      map.ground.push({ x: t.x, y: t.y, floor: map.megFloor | 0, item, taken: false });
    }
  };
  pick(4, "almond", inStore.length ? inStore : cells);
  pick(2, "almond", cells);
  pick(1, "crowbar", cells);
  pick(1, "bag1", cells);
}

function buildUtilityBlock(map, size, start) {
  const grid = map.layers[0];
  const W = 11, H = 16;
  for (let i = 0; i < 600; i++) {
    const x = randInt(4, Math.max(5, size - W - 5));
    const y = randInt(4, Math.max(5, size - H - 24));
    if (Math.abs(x - start.x) + Math.abs(y - start.y) < 18) continue;
    // 楼的四周要留出一圈能走的路，不能贴着地图边或斜坡
    if (x < 3 || y < 3 || x + W >= size - 3 || y + H >= size - 4) continue;
    let ok = true;
    for (let dy = -1; dy <= H && ok; dy++) {
      for (let dx = -2; dx <= W + 1; dx++) {
        const gx = x + dx, gy = y + dy;
        if (gx < 1 || gy < 1 || gx >= size - 1 || gy >= size - 1) continue;
        if (dy >= 0 && dy < H && dx >= 0 && dx < W) continue;   // 楼体本身
        if (grid[gy][gx] !== 0) { ok = false; break; }          // 四周必须是通路
      }
    }
    if (!ok) continue;
    // 楼体填实
    for (let dy = 0; dy < H; dy++) {
      for (let dx = 0; dx < W; dx++) grid[y + dy][x + dx] = 1;
    }
    return { x, y, w: W, h: H };
  }
  return null;
}

function rampContains(ramp, tx, ty) {
  return tx >= ramp.x && tx < ramp.x + ramp.w && ty >= ramp.y && ty < ramp.y + ramp.h;
}


// ================= Level 1：A / B 走廊（通往枢纽的谜题）=================
// 原文设定：在 Level 1 找到一扇门，进去是一段走廊；走廊里有两道标着 A / B 的门，
// 后面还有一组。正确顺序是"先 B 后 A"—— 走对了，尽头就是通往枢纽的门；
// 走错一扇，门后不是走廊，当场就没了。
//
// 走廊从上到下：枢纽门 / 后厅 / 第二组(A 对 B 错) / 中厅 / 第一组(A 错 B 对) / 前厅 / 入口门
// 玩家从南侧的入口进来，先遇到第一组（要走 B），再遇到第二组（要走 A）。
function carveABHall(map, size, blockHint) {
  const f = 0;                          // 放在上层
  const grid = map.layers[f];
  const st = map.start;
  const W = 5, H = 10;
  let ox = -1, oy = -1;

  // 设备楼里直接切一块出来：停车场几乎没有成片的墙，随机撒点根本找不到。
  if (blockHint) {
    const bx = blockHint.x + Math.floor((blockHint.w - W) / 2);
    const by = blockHint.y + 1;
    let allWall = true;
    for (let dy = -1; dy <= H && allWall; dy++) {
      for (let dx = -1; dx <= W; dx++) {
        const gx = bx + dx, gy = by + dy;
        if (gx < 1 || gy < 1 || gx >= size - 1 || gy >= size - 1) { allWall = false; break; }
        if (grid[gy][gx] !== 1 && !(dy >= 0 && dy < H && dx >= 0 && dx < W)) { allWall = false; break; }
      }
    }
    if (allWall) { ox = bx; oy = by; }
  }

  for (let i = 0; ox < 0 && i < 1500; i++) {
    const x = randInt(2, Math.max(3, size - W - 3));
    const y = randInt(2, Math.max(3, size - H - 32));
    if (Math.abs(x - st.x) + Math.abs(y - st.y) < 16) continue;   // 别贴着出生点
    let allWall = true;
    for (let dy = -1; dy <= H && allWall; dy++) {
      for (let dx = -1; dx <= W; dx++) {
        const gx = x + dx, gy = y + dy;
        if (gx < 1 || gy < 1 || gx >= size - 1 || gy >= size - 1) { allWall = false; break; }
        if (grid[gy][gx] !== 1) { allWall = false; break; }
      }
    }
    if (!allWall) continue;
    // 入口在南侧：往下必须能挖通到主区，否则这走廊谁也进不来
    let reach = false;
    for (let n = 0; n < 30; n++) {
      const yy = y + H + n;
      if (yy >= size - 1) break;
      if (grid[yy][x + 2] === 0) { reach = true; break; }
    }
    if (!reach) continue;
    ox = x; oy = y; break;
  }
  if (ox < 0) return null;              // 实在塞不下就不放，不影响别的功能

  const set = (dx, dy, v) => { grid[oy + dy][ox + dx] = v; };
  // 三个小厅都留出缓冲行：玩家站进去做选择时，只会挨着"一组"门。
  // 否则站在厅中间会同时贴着上下两组同字母的门（一扇对一扇错），按 R 就成了赌命。
  set(1, 1, 0); set(2, 1, 0); set(3, 1, 0);            // 后厅
  set(1, 3, 0); set(2, 3, 0); set(3, 3, 0);            // 中厅
  set(1, 4, 0); set(2, 4, 0); set(3, 4, 0);
  set(1, 6, 0); set(2, 6, 0); set(3, 6, 0);            // 前厅
  set(1, 7, 0); set(2, 7, 0); set(3, 7, 0);
  set(1, 2, 0); set(3, 2, 0);      // 第二组门位（靠里）：A 对 B 错
  set(1, 5, 0); set(3, 5, 0);      // 第一组门位（靠外）：A 错 B 对
  set(2, 0, 0);                     // 尽头的枢纽门
  set(2, 8, 0);                     // 入口门
  set(2, 9, 0);                     // 入口外侧的连接格
  // 从连接格往下挖通道，直到接上主区（楼体是实心的，这条通道要挖穿它）
  const cx = ox + 2;
  for (let n = 0; n < 40; n++) {
    const yy = oy + H + n;
    if (yy >= size - 1) break;
    if (grid[yy][cx] === 0 && n > 0) break;
    grid[yy][cx] = 0;
  }

  const gate = addDoor(map, [{ x: ox + 2, y: oy + 8, dir: "h" }], f, "abgate", {});
  // 先 B 后 A：第一组走 B（右），第二组走 A（左）
  const d1a = addDoor(map, [{ x: ox + 1, y: oy + 5, dir: "h" }], f, "abdoor",
    { letter: "A", stage: 1, correct: false });
  const d1b = addDoor(map, [{ x: ox + 3, y: oy + 5, dir: "h" }], f, "abdoor",
    { letter: "B", stage: 1, correct: true });
  const d2a = addDoor(map, [{ x: ox + 1, y: oy + 2, dir: "h" }], f, "abdoor",
    { letter: "A", stage: 2, correct: true });
  const d2b = addDoor(map, [{ x: ox + 3, y: oy + 2, dir: "h" }], f, "abdoor",
    { letter: "B", stage: 2, correct: false });
  const ex = addDoor(map, [{ x: ox + 2, y: oy + 0, dir: "h" }], f, "abexit", {});

  map.abHall = { floor: f, x: ox, y: oy, w: W, h: H,
    gate: gate, exit: ex, doors: [d1a, d1b, d2a, d2b].filter(Boolean) };
  return map.abHall;
}


// Level 5 主厅的走廊布局：
//   一条横向主走廊，两侧排满客房；走到它的尽头，路会拐进另一条竖直走廊 ——
//   而接入点在那条竖廊的中段或尾端（而不是正对着它的头）。
// 一间房只该有一个入口。生成时相邻房间 / 走廊的接口常常会在墙上多咬出
// 几个洞，于是能直接从那个洞钻进屋里，门形同虚设。
// 做法：把多余的开口封掉，只留一个 —— 而且留下的那个必须仍然连得通。
function ensureAllConnected(grid, size, anchor) {
  // sealExtraOpenings 逐间封门时只校验"这间屋自己还能走通"，
  // 没考虑别的房间的通路正好要经过被封掉的那个口 —— 于是会连锁把
  // 一连串房间封死。这里做一次全局兜底：把所有走不到的地板重新接回主区。
  const bfsFrom = (sx, sy) => {
    const seen = new Uint8Array(size * size);
    if (sx < 1 || sy < 1 || sx >= size - 1 || sy >= size - 1) return seen;
    if (grid[sy][sx] !== 0) return seen;
    const q = [sy * size + sx]; seen[q[0]] = 1;
    for (let h = 0; h < q.length; h++) {
      const idx = q[h], x = idx % size, y = (idx / size) | 0;
      const nb = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
      for (const c of nb) {
        const nx = c[0], ny = c[1];
        if (nx < 1 || ny < 1 || nx >= size - 1 || ny >= size - 1) continue;
        const ni = ny * size + nx;
        if (seen[ni] || grid[ny][nx] !== 0) continue;
        seen[ni] = 1; q.push(ni);
      }
    }
    return seen;
  };
  // 封门会切出十几块互不相通的碎片，次数要给足，否则修不完
  for (let pass = 0; pass < 80; pass++) {
    const seen = bfsFrom(anchor.x, anchor.y);
    const far = [];
    for (let y = 1; y < size - 1; y++)
      for (let x = 1; x < size - 1; x++)
        if (grid[y][x] === 0 && !seen[y * size + x]) far.push([x, y]);
    if (!far.length) return true;
    // 每次挑离主区最近的那一块接回来
    far.sort((a, b) => (Math.abs(a[0] - anchor.x) + Math.abs(a[1] - anchor.y))
                     - (Math.abs(b[0] - anchor.x) + Math.abs(b[1] - anchor.y)));
    const ux = far[0][0], uy = far[0][1];
    let best = null, bd = Infinity;
    for (let y = 1; y < size - 1; y++)
      for (let x = 1; x < size - 1; x++) {
        if (!seen[y * size + x] || grid[y][x] !== 0) continue;
        const d = Math.abs(x - ux) + Math.abs(y - uy);
        if (d < bd) { bd = d; best = [x, y]; }
      }
    if (!best) return false;
    carveCorridorW(grid, size, best[0], best[1], ux, uy, 1);
  }
  const seen = bfsFrom(anchor.x, anchor.y);
  for (let y = 1; y < size - 1; y++)
    for (let x = 1; x < size - 1; x++)
      if (grid[y][x] === 0 && !seen[y * size + x]) return false;
  return true;
}

function sealExtraOpenings(grid, size, rooms, anchors) {
  const reach = (from) => {
    // 从 from 出发能碰到 anchors 里的任意一格吗
    const seen = new Uint8Array(size * size);
    const q = [from.y * size + from.x];
    seen[q[0]] = 1;
    for (let h = 0; h < q.length; h++) {
      const idx = q[h], x = idx % size, y = (idx / size) | 0;
      for (let k = 0; k < 4; k++) {
        const nx = x + (k === 0 ? 1 : k === 1 ? -1 : 0);
        const ny = y + (k === 2 ? 1 : k === 3 ? -1 : 0);
        if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue;
        const ni = ny * size + nx;
        if (seen[ni] || grid[ny][nx] !== 0) continue;
        seen[ni] = 1; q.push(ni);
      }
    }
    for (const a of anchors) {
      if (a.x < 0 || a.y < 0 || a.x >= size || a.y >= size) continue;
      if (seen[a.y * size + a.x]) return true;
    }
    return false;
  };
  for (const r of rooms) {
    if (r.start) continue;
    const open = [];
    for (let x = r.x; x < r.x + r.w; x++)
      for (const y of [r.y - 1, r.y + r.h]) if (grid[y] && grid[y][x] === 0) open.push({ x, y });
    for (let y = r.y; y < r.y + r.h; y++)
      for (const x of [r.x - 1, r.x + r.w]) if (grid[y] && grid[y][x] === 0) open.push({ x, y });
    if (open.length <= 1) continue;
    // 屋里任意一格，用来验证"还走得出去"
    const inside = { x: r.x, y: r.y };
    for (let i = 0; i < open.length; i++) {
      for (const o of open) grid[o.y][o.x] = 1;      // 先全封
      grid[open[i].y][open[i].x] = 0;                // 只留这一个
      if (grid[inside.y][inside.x] === 0 && reach(inside)) break;
      if (i === open.length - 1) {                   // 都不通就恢复原样
        for (const o of open) grid[o.y][o.x] = 0;
      }
    }
  }
}

function buildHotelCorridor(size) {
  const grid = makeGrid(size);
  const rooms = [];
  const CW = 3;                                   // 走廊 3 格宽

  // 竖廊 B：靠右侧
  const bx = size - 14;
  const bTop = 3, bBot = size - 5;
  for (let y = bTop; y <= bBot; y++) {
    for (let x = bx; x < bx + CW; x++) grid[y][x] = 0;
  }

  // 横廊 A：从左侧一路延伸到竖廊左边
  const ay = Math.floor(size / 2) - 1;
  const aRight = bx - 2;
  for (let y = ay; y < ay + CW; y++) {
    for (let x = 3; x <= aRight; x++) grid[y][x] = 0;
  }

  // A 的尽头 -> B 的中段或尾端
  const mid = Math.floor((bTop + bBot) / 2);
  const tail = Math.random() < 0.5 ? bTop + 2 : bBot - 2;
  const joinY = Math.random() < 0.5 ? mid : tail;
  const connX = aRight + 1;                       // A 末端与 B 之间的那一列
  const y0 = Math.min(ay + 1, joinY), y1 = Math.max(ay + 1, joinY);
  for (let y = y0; y <= y1; y++) grid[y][connX] = 0;
  for (let x = connX; x < bx; x++) grid[joinY][x] = 0;

  // ---- 客房：沿走廊两侧排布 ----
  const carveSuite = (x, y, w, h, doorX, doorY, dir) => {
    if (x < 2 || y < 2 || x + w >= size - 2 || y + h >= size - 2) return false;
    // 房间不能压到走廊上
    for (let yy = y - 1; yy <= y + h; yy++) {
      for (let xx = x - 1; xx <= x + w; xx++) {
        if (grid[yy] && grid[yy][xx] === 0) return false;
      }
    }
    carveRoom(grid, size, x, y, w, h);
    // 只留一个门洞
    grid[doorY][doorX] = 0;
    rooms.push({ x, y, w, h, door: { x: doorX, y: doorY, dir } });
    return true;
  };

  const RW = 6, RH = 5;
  // A 上方 / 下方
  for (let x = 5; x + RW <= aRight - 1; x += RW + 2) {
    carveSuite(x, ay - RH - 1, RW, RH, x + 2, ay - 1, "h");   // 上侧：门在房间下边
    carveSuite(x, ay + CW + 1, RW, RH, x + 2, ay + CW, "h");  // 下侧：门在房间上边
  }
  // B 左 / 右
  for (let y = bTop + 2; y + RH <= bBot - 2; y += RH + 2) {
    carveSuite(bx - RW - 1, y, RW, RH, bx - 1, y + 2, "v");    // 左侧
    carveSuite(bx + CW + 1, y, RW, RH, bx + CW, y + 2, "v");   // 右侧
  }

  // 客房只留一个入口：封掉墙上多余的洞
  sealExtraOpenings(grid, size, rooms, [{ x: Math.floor(size / 2), y: ay + 1 }]);
  ensureAllConnected(grid, size, { x: Math.floor(size / 2), y: ay + 1 });
  return { grid, rooms, floors: collectFloors(grid, size), corridor: { ay, bx, CW, joinY } };
}

// ================= Level 5：恐怖旅馆 =================
// 三个可完全进入的区域，各占一层：
//   floor 0 = 主厅（豪华酒店：房门带金色房号牌，大部分上锁，少数会自己解锁）
//   floor 1 = 贝弗莉室（"永恒的舞厅"，四面都是门，中央一张摆着麻将的桌子）
//   floor 2 = 锅炉房（高温、蒸汽、管道；深入尽头可以切出 Level 6）
function generateHotelMap(level) {
  const size = mapSizeFor(level);
  const layers = [], floorsArr = [], roomsArr = [];

  // ---- 主厅：一条走廊，两边都是客房；走廊的尽头通到另一条走廊（接在它的中段或尾端）----
  const hall = buildHotelCorridor(size);
  layers.push(hall.grid); floorsArr.push(hall.floors); roomsArr.push(hall.rooms);

  // ---- 贝弗莉室：一间极大的房间，四面都是门 ----
  const bevGrid = makeGrid(size);
  const bw = Math.min(26, size - 10), bh = Math.min(20, size - 10);
  const bx = Math.floor((size - bw) / 2), by = Math.floor((size - bh) / 2);
  carveRoom(bevGrid, size, bx, by, bw, bh);
  layers.push(bevGrid);
  floorsArr.push(collectFloors(bevGrid, size));
  roomsArr.push([{ x: bx, y: by, w: bw, h: bh, start: true }]);

  // ---- 锅炉房：大空间 + 机器 ----
  const boil = buildRoomLayer(size, { roomW: [7, 12], roomH: [6, 11], density: 1.1, startRoom: 10 });
  // 锅炉房是"大空间 + 机器"，房间之间本来就应该是连通的大厅 —— 但客房式的
  // 隔间仍然只留一个入口，避免从墙上的洞直接钻进屋里。
  if (boil.rooms && boil.rooms.length) {
    const anchor = boil.rooms.find((r) => r.start) || boil.rooms[0];
    const ap = anchor ? { x: anchor.x, y: anchor.y } : { x: Math.floor(size / 2), y: Math.floor(size / 2) };
    sealExtraOpenings(boil.grid, size, boil.rooms, [ap]);
    // 封完再验一遍全局：走不到的地方重新开一条通路，别把整片区域封死。
    ensureAllConnected(boil.grid, size, ap);
  }
  layers.push(boil.grid); floorsArr.push(boil.floors); roomsArr.push(boil.rooms);

  const start = { x: Math.floor(size / 2), y: Math.floor(size / 2), floor: 0 };
  const map = {
    size, level, doubleStory: false, multiArea: true,
    areas: ["主厅", "贝弗莉室", "锅炉房"],
    layers, floors: floorsArr, rooms: roomsArr,
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props: [], crates: [], ground: [],
    elevators: [],          // 主厅里的电梯（1~382 楼的按钮）
    mahjong: null,          // 贝弗莉室中央那盘未打完的麻将
    chandelier: null,
    areaEntry: [null, null, null],
    deep6: null,            // 锅炉房深处：切出 Level 6
  };
  makeDoorsMap(map);

  const gridHall = layers[0], gridBev = layers[1], gridBoil = layers[2];
  const gv = (grid, x, y) => (x < 0 || y < 0 || x >= size || y >= size) ? 1 : grid[y][x];
  const isOpen = (grid, x, y) => {
    // 门洞：格子本身是通道，且垂直于穿越方向的两侧都是墙
    const hOK = gv(grid, x - 1, y) === 0 && gv(grid, x + 1, y) === 0 &&
      gv(grid, x, y - 1) === 1 && gv(grid, x, y + 1) === 1;
    const vOK = gv(grid, x, y - 1) === 0 && gv(grid, x, y + 1) === 0 &&
      gv(grid, x - 1, y) === 1 && gv(grid, x + 1, y) === 1;
    if (hOK) return "h";
    if (vOK) return "v";
    return null;
  };

  // ---- 侧厅：Level 5 -> Level 171 的入口 ----
  // 档案写着"入口是 Level 5 里一间随机的侧厅"，可这一层以前根本没有侧厅 ——
  // 玩家把走廊翻遍也找不到通往 171 的地方。
  // 做法：挑一间离出生点最远的客房，往背着走廊的方向再挖深几格，改成侧厅 ——
  // 满地暗红地毯、钉护墙板、点壁灯，尽头立一扇双开的深色木门，
  // 门缝里漏出暖金色的光（那是 171 的"堂皇幻象"正往这边渗）。
  let sideRoom = null;
  {
    let best = null, bd = -1;
    for (const r of hall.rooms) {
      if (r.start) continue;
      const d = Math.hypot(r.x + r.w / 2 - start.x, r.y + r.h / 2 - start.y);
      if (d > bd) { bd = d; best = r; }
    }
    sideRoom = best;
  }
  if (sideRoom) {
    // 新增的那一格条带必须整条都是墙，且不出边界
    const bandFree = (x, y, w, h) => {
      if (x < 2 || y < 2 || x + w > size - 2 || y + h > size - 2) return false;
      for (let yy = y; yy < y + h; yy++)
        for (let xx = x; xx < x + w; xx++) if (gridHall[yy][xx] === 0) return false;
      return true;
    };
    const r = sideRoom, dr = r.door || {};
    // 门开在哪一侧，房间就往反方向长
    let dir = "up";
    if (dr.y >= r.y + r.h) dir = "up";
    else if (dr.y <= r.y - 1) dir = "down";
    else if (dr.x >= r.x + r.w) dir = "left";
    else if (dr.x <= r.x - 1) dir = "right";
    for (let k = 0; k < 4; k++) {
      let bx2, by2, bw2, bh2;
      if (dir === "up") { bx2 = r.x; by2 = r.y - 1; bw2 = r.w; bh2 = 1; }
      else if (dir === "down") { bx2 = r.x; by2 = r.y + r.h; bw2 = r.w; bh2 = 1; }
      else if (dir === "left") { bx2 = r.x - 1; by2 = r.y; bw2 = 1; bh2 = r.h; }
      else { bx2 = r.x + r.w; by2 = r.y; bw2 = 1; bh2 = r.h; }
      if (!bandFree(bx2, by2, bw2, bh2)) break;
      carveRoom(gridHall, size, bx2, by2, bw2, bh2);
      if (dir === "up") { r.y -= 1; r.h += 1; }
      else if (dir === "down") { r.h += 1; }
      else if (dir === "left") { r.x -= 1; r.w += 1; }
      else { r.w += 1; }
    }
    r.side = true; r.grow = dir;

    // 门立在侧厅最深处、贴着尽头那面墙
    let dx2, dy2;
    if (dir === "up") { dx2 = r.x + Math.floor(r.w / 2); dy2 = r.y; }
    else if (dir === "down") { dx2 = r.x + Math.floor(r.w / 2); dy2 = r.y + r.h - 1; }
    else if (dir === "left") { dx2 = r.x; dy2 = r.y + Math.floor(r.h / 2); }
    else { dx2 = r.x + r.w - 1; dy2 = r.y + Math.floor(r.h / 2); }
    map.sideHall = { room: { x: r.x, y: r.y, w: r.w, h: r.h }, door: { x: dx2, y: dy2 }, dir };

    // 满地暗红地毯（门那一格留空，门自己会带一小块）
    for (let yy = r.y; yy < r.y + r.h; yy++) {
      for (let xx = r.x; xx < r.x + r.w; xx++) {
        if (xx === dx2 && yy === dy2) continue;
        map.props.push({ x: xx, y: yy, floor: 0, type: "carpet5" });
      }
    }
    // 门洞两侧各点一盏壁灯
    const hx2 = dr.x, hy2 = dr.y;
    for (const off of (dir === "up" || dir === "down" ? [[-1, 0], [1, 0]] : [[0, -1], [0, 1]])) {
      const sx2 = hx2 + off[0], sy2 = hy2 + off[1];
      if (sx2 > 0 && sy2 > 0 && sx2 < size - 1 && sy2 < size - 1 && gridHall[sy2][sx2] === 0) {
        map.props.push({ x: sx2, y: sy2, floor: 0, type: "sconce" });
      }
    }
    // 那扇双开的深色木门 -> Level 171
    map.props.push({
      x: dx2, y: dy2, floor: 0, type: "sidehall5", toLevel: 171,
      tip: "一扇双开的深色木门，门缝里漏出慢爵士乐和一股玫瑰香",
    });

    // 沿走廊立几块指示牌，箭头指着侧厅 —— 不然这层太大，根本撞不见
    {
      const inRoom2 = (x, y) => hall.rooms.some((rr) =>
        x >= rr.x && x < rr.x + rr.w && y >= rr.y && y < rr.y + rr.h);
      const corr = hall.floors.filter((t) => !inRoom2(t.x, t.y));
      const wallSide = (x, y) => [[1, 0], [-1, 0], [0, 1], [0, -1]]
        .some((d) => gv(gridHall, x + d[0], y + d[1]) === 1);
      const used2 = new Set();
      const tx = dr.x, ty = dr.y;
      for (let i = 0; i < corr.length && used2.size < 5; i++) {
        const t = corr[randInt(0, corr.length - 1)];
        if (!t || !wallSide(t.x, t.y)) continue;
        const dist = Math.hypot(t.x - tx, t.y - ty);
        if (dist < 4 || dist > 26) continue;
        const key = t.x + "," + t.y;
        if (used2.has(key)) continue;
        used2.add(key);
        const ddx = tx - t.x, ddy = ty - t.y;
        const sdir = Math.abs(ddx) > Math.abs(ddy) ? (ddx > 0 ? "right" : "left")
          : (ddy > 0 ? "down" : "up");
        map.props.push({ x: t.x, y: t.y, floor: 0, type: "signhall5", dir: sdir });
      }
    }
  }

  // ---- 主厅：客房门（金色房号牌；大部分上锁，少数会自己开合）----
  let roomDoorCount = 0;
  for (const r of hall.rooms) {
    if (r.start || r.side) continue;
    // 房间四周找门洞
    const cands = [];
    for (let x = r.x; x < r.x + r.w; x++) {
      for (const y of [r.y - 1, r.y + r.h]) {
        const dir = isOpen(gridHall, x, y);
        if (dir) cands.push({ x, y, dir });
      }
    }
    for (let y = r.y; y < r.y + r.h; y++) {
      for (const x of [r.x - 1, r.x + r.w]) {
        const dir = isOpen(gridHall, x, y);
        if (dir) cands.push({ x, y, dir });
      }
    }
    if (!cands.length) continue;
    const c = cands[randInt(0, cands.length - 1)];
    const d = addDoor(map, [{ x: c.x, y: c.y, dir: c.dir }], 0, "room5", {
      dir: c.dir,
      number: randInt(1, 382),             // 房号看起来完全是随机的
      locked: Math.random() < 0.35,        // 少数门是锁着的（大多数推得开）
      autoT: rand(3, 12),                  // 会随时间长开长合
    });
    if (d) roomDoorCount++;
  }

  // ---- 主厅：电梯（1~382 楼的按钮）----
  for (let i = 0; i < 5; i++) {
    const list = hall.floors;
    const t = list[randInt(0, list.length - 1)];
    if (!t) break;
    if (Math.hypot(t.x - start.x, t.y - start.y) < 8) continue;
    map.elevators.push({ x: t.x, y: t.y, floor: 0, kind: randInt(0, 1) ? "antique" : "modern" });
  }

  // ---- 主厅 -> 贝弗莉室：银色小标牌的那扇门 ----
  {
    const cands = [];
    for (const t of hall.floors) {
      if (Math.hypot(t.x - start.x, t.y - start.y) < 10) continue;
      const dir = isOpen(gridHall, t.x, t.y);
      if (dir) cands.push({ x: t.x, y: t.y, dir });
    }
    const c = cands.length ? cands[randInt(0, cands.length - 1)] : null;
    if (c) {
      const d = addDoor(map, [{ x: c.x, y: c.y, dir: c.dir }], 0, "area5", {
        dir: c.dir, toFloor: 1, plate: "银色标牌：贝弗莉室",
      });
      if (d) map.areaEntry[1] = { x: Math.floor(bx + bw / 2), y: by + bh - 2 };
    }
    // 兜底：找不到门洞就在出生点旁放一扇
    if (!map.areaEntry[1]) map.areaEntry[1] = { x: Math.floor(bx + bw / 2), y: by + bh - 2 };
  }

  // ---- 贝弗莉室：四面墙上很多门（通向主厅或锅炉房）----
  {
    const bevDoors = [];
    // 沿四面墙均匀取点，并把墙内一格设为门洞
    const step = 3;
    // dir: "v" = 门开在上/下墙上（沿 y 进出）；"h" = 门开在左/右墙上（沿 x 进出）
    const putDoor = (x, y, dir, inx, iny) => {
      if (gv(gridBev, x, y) !== 1) return;
      if (gv(gridBev, inx, iny) !== 0) return;
      // 门洞两侧必须是墙，才像真的门
      if (dir === "v" && (gv(gridBev, x - 1, y) !== 1 || gv(gridBev, x + 1, y) !== 1)) return;
      if (dir === "h" && (gv(gridBev, x, y - 1) !== 1 || gv(gridBev, x, y + 1) !== 1)) return;
      gridBev[y][x] = 0;
      const toFloor = Math.random() < 0.72 ? 0 : 2;   // 通向主厅（多数）或锅炉房
      const d = addDoor(map, [{ x, y, dir }], 1, "area5", {
        dir, toFloor, plate: null,
      });
      if (d) bevDoors.push(d);
    };
    for (let x = bx + 1; x < bx + bw - 1; x += step) {
      putDoor(x, by - 1, "v", x, by);          // 上墙：内侧在下方
      putDoor(x, by + bh, "v", x, by + bh - 1); // 下墙：内侧在上方
    }
    for (let y = by + 1; y < by + bh - 1; y += step) {
      putDoor(bx - 1, y, "h", bx, y);          // 左墙：内侧在右方
      putDoor(bx + bw, y, "h", bx + bw - 1, y); // 右墙：内侧在左方
    }
    map.areaEntry[0] = { x: start.x, y: start.y };
    map.areaEntry[2] = {
      x: Math.floor(size / 2) - Math.floor(boil.rooms[0].w / 2) + 1,
      y: boil.rooms[0].y + 1,
    };
    // 贝弗莉室可能有几十上百扇门 —— 记下数量供渲染与文案使用
    // 兜底：四面墙上一个门洞都没开出来时，强行在墙线上开四扇
    if (!bevDoors.length) {
      const force = [[bx + 2, by - 1, "v"], [bx + bw - 3, by + bh, "v"],
        [bx - 1, by + 2, "h"], [bx + bw, by + bh - 3, "h"]];
      for (const [fx, fy, fd] of force) {
        gridBev[fy][fx] = 0;
        const d = addDoor(map, [{ x: fx, y: fy, dir: fd }], 1, "area5",
          { dir: fd, toFloor: Math.random() < 0.7 ? 0 : 2, plate: null });
        if (d) bevDoors.push(d);
      }
    }
    map.bevDoorCount = bevDoors.length;
  }

  // ---- 贝弗莉室：中央那张桌子（饮料 + 未打完的麻将）与巨大吊灯 ----
  map.mahjong = { x: bx + bw / 2, y: by + bh / 2 };
  map.chandelier = { x: bx + bw / 2, y: by + 1 };
  map.props.push({ x: Math.floor(bx + bw / 2), y: Math.floor(by + bh / 2), floor: 1, type: "mahjong" });

  // ---- 锅炉房：机器 / 管道 / 锅炉 / 熔炉 + 杏仁水 ----
  {
    // 封门之后有些格子变成了墙 —— 物件必须落在真正的地板上
    const list = boil.floors.filter((t) => boil.grid[t.y][t.x] === 0);
    const used = new Set();
    const pick = (minD) => {
      for (let i = 0; i < 200; i++) {
        const t = list[randInt(0, list.length - 1)];
        if (!t) break;
        const key = t.x + "," + t.y;
        if (used.has(key)) continue;
        if (Math.hypot(t.x - boil.rooms[0].x, t.y - boil.rooms[0].y) < minD) continue;
        used.add(key);
        return t;
      }
      return null;
    };
    // 以前只有 14 台机器撒在 1954 格地板上 —— 空得看不出这是锅炉房。
    // 现在按"一间锅炉房该有的东西"来配：锅炉、熔炉、管道、储气罐、
    // 阀门、煤堆、排气口，数量也提上来。
    for (let i = 0; i < 26; i++) {
      const t = pick(2);
      if (t) map.props.push({ x: t.x, y: t.y, floor: 2, type: Math.random() < 0.5 ? "boiler" : "furnace" });
    }
    for (let i = 0; i < 22; i++) {
      const t = pick(1);
      if (t) map.props.push({ x: t.x, y: t.y, floor: 2, type: "pipe" });
    }
    for (let i = 0; i < 9; i++) { const t = pick(1); if (t) map.props.push({ x: t.x, y: t.y, floor: 2, type: "tank5" }); }
    for (let i = 0; i < 12; i++) { const t = pick(1); if (t) map.props.push({ x: t.x, y: t.y, floor: 2, type: "valve5" }); }
    for (let i = 0; i < 10; i++) { const t = pick(2); if (t) map.props.push({ x: t.x, y: t.y, floor: 2, type: "coal5" }); }
    for (let i = 0; i < 8; i++) { const t = pick(2); if (t) map.props.push({ x: t.x, y: t.y, floor: 2, type: "vent5" }); }
    // 管道漏水：地面上的杏仁水（锅炉房的管道里流着杏仁水）
    for (let i = 0; i < 7; i++) {
      const t = pick(3);
      if (t) map.ground.push({ x: t.x, y: t.y, floor: 2, item: "almond", taken: false });
    }
    // 深处：切出 Level 6 的楼梯
    let far = null, fd = -1;
    for (const t of list) {
      const d = Math.abs(t.x - size / 2) + Math.abs(t.y - size / 2);
      if (d > fd) { fd = d; far = t; }
    }
    if (far) {
      gridBoil[far.y][far.x] = 0;
      map.deep6 = { x: far.x, y: far.y, floor: 2 };
      map.props.push({ x: far.x, y: far.y, floor: 2, type: "stairs6" });
    }
  }

  // ---- 主厅装饰：书架 / 橱柜 / 古董沙发 / 烛台（有些其实是电灯）----
  {
    const used = new Set();
    for (let i = 0; i < 22; i++) {
      const t = hall.floors[randInt(0, hall.floors.length - 1)];
      if (!t) break;
      const key = t.x + "," + t.y;
      if (used.has(key)) continue;
      used.add(key);
      const r = Math.random();
      const type = r < 0.3 ? "shelf" : r < 0.55 ? "cabinet" : r < 0.8 ? "sofa" : "sconce";
      map.props.push({ x: t.x, y: t.y, floor: 0, type });
    }
    // 客房里偶尔能翻到杏仁水
    for (const r of hall.rooms) {
      if (r.start || Math.random() > 0.35) continue;
      const t = { x: randInt(r.x, r.x + r.w - 1), y: randInt(r.y, r.y + r.h - 1) };
      map.ground.push({ x: t.x, y: t.y, floor: 0, item: "almond", taken: false });
    }
    // 优质肉：带去见萨曼莎
    for (let i = 0; i < 2; i++) {
      const t = hall.floors[randInt(0, hall.floors.length - 1)];
      if (t) map.ground.push({ x: t.x, y: t.y, floor: 0, item: "meat", taken: false });
    }
  }

  map.roomDoorCount = roomDoorCount;
  dropBag(map, level);
  return map;
}

// ================= Level 6：熄灯 =================
// 彻头彻尾的黑暗：一系列无穷无尽的狭窄走廊（光滑冰凉，很可能是混凝土）。
// 没有光、没有实体、绝对寂静 —— 只能靠"记忆"：碰到墙会留下一个点，
// 贴着墙移动会连成一条线，这些点与线会随时间慢慢消失。
function generateDarkMap(level) {
  const size = mapSizeFor(level) | 1;
  const grid = makeGrid(size);
  const n = Math.floor(size / 2);

  // 迷宫：1 格宽的走廊，再随机打通一些墙形成环路
  const seen = [];
  for (let i = 0; i < n; i++) seen.push(new Array(n).fill(false));
  const ci = Math.floor(n / 2), cj = Math.floor(n / 2);
  const stack = [{ i: ci, j: cj }];
  seen[cj][ci] = true;
  grid[cj * 2 + 1][ci * 2 + 1] = 0;
  while (stack.length) {
    const c = stack[stack.length - 1];
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (let k = dirs.length - 1; k > 0; k--) {
      const r = randInt(0, k); const t = dirs[k]; dirs[k] = dirs[r]; dirs[r] = t;
    }
    let moved = false;
    for (const d of dirs) {
      const ni = c.i + d[0], nj = c.j + d[1];
      if (ni < 0 || nj < 0 || ni >= n || nj >= n) continue;
      if (seen[nj][ni]) continue;
      seen[nj][ni] = true;
      grid[nj * 2 + 1][ni * 2 + 1] = 0;
      grid[c.j * 2 + 1 + d[1]][c.i * 2 + 1 + d[0]] = 0;
      stack.push({ i: ni, j: nj });
      moved = true;
      break;
    }
    if (!moved) stack.pop();
  }
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      if (grid[y][x] !== 1 || Math.random() > 0.1) continue;
      const lr = grid[y][x - 1] === 0 && grid[y][x + 1] === 0;
      const ud = grid[y - 1][x] === 0 && grid[y + 1][x] === 0;
      if (lr !== ud) grid[y][x] = 0;   // 打通成环路，不是完美迷宫
    }
  }
  // 偶尔拓宽一点点，免得处处都是死胡同
  for (let i = 0; i < Math.floor(size * 0.5); i++) {
    const x = randInt(2, size - 3), y = randInt(2, size - 3);
    if (grid[y][x] === 0) { grid[y][x + 1] = 0; grid[y + 1][x] = 0; }
  }

  const floors = collectFloors(grid, size);
  const start = { x: ci * 2 + 1, y: cj * 2 + 1, floor: 0 };
  let stairs = null, bd = -1;
  for (const t of floors) {
    const d = Math.hypot(t.x - start.x, t.y - start.y);
    if (d > bd) { bd = d; stairs = t; }
  }
  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [[]],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props: [], crates: [], ground: [],
    stairs: stairs || { x: start.x + 6, y: start.y },
  };
  makeDoorsMap(map);
  // 楼梯（通往 Level 7）
  map.props.push({ x: map.stairs.x, y: map.stairs.y, floor: 0, type: "stairs7" });
  return map;
}

// ================= Level 7：深海恐惧症 =================
// 入口房间（侧着建在天花板上，门廊正对海面）+ 一片广阔到不可思议的海洋。
// 深度分区：日光带 / 暮色带 / 午夜带 / 深渊带。门廊下垂着一根绳索 —— 那是唯一回去的路。
// ================= Level 7：深海恐惧症（海面房屋群 + 海底） =================
// 人一睁眼就在一间灌满了水的屋子里：脚下积着一层水，墙皮泡得发涨。
// 推门出去是一整片望不到边的海面 —— 踩上去不会沉下去，但两条腿像灌了铅，
// 挪一步要费老大劲。海上散着几座孤零零的房子，彼此隔得很远，里头同样积着水。
// 黄色的微型潜艇就系在其中一座房子的外头；潜艇钥匙和潜水服分别锁在另外两座
// 房子里 —— 不是同一座。凑齐三样坐潜艇下到海底，钻进岩洞就是 Level 8。
function generateOceanMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);          // 全是墙，之后按区域挖开

  const seaSurf = new Set();            // 海面：能走，很慢，但不会沉
  const roomWater = new Set();          // 房子里的积水
  const dryFloor = new Set();           // 房子里少数几块没淹到的地面（门洞等）

  // ---- 海面：上半张图，一眼望不到边 ----
  const surf = { x1: 2, x2: size - 3, y1: 2, y2: Math.round(size * 0.56) };
  for (let y = surf.y1; y <= surf.y2; y++)
    for (let x = surf.x1; x <= surf.x2; x++) { grid[y][x] = 0; seaSurf.add(x + "," + y); }

  // ---- 海面上的房子：彼此隔得很远 ----
  const houses = [];
  const COLS = 4, ROWS = 2;
  const cellW = Math.floor((surf.x2 - surf.x1) / COLS);
  const cellH = Math.floor((surf.y2 - surf.y1) / ROWS);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const w = randInt(9, 12), hgt = randInt(7, 9);
      const minX = surf.x1 + c * cellW + 3, maxX = surf.x1 + (c + 1) * cellW - 3 - w;
      const minY = surf.y1 + r * cellH + 3, maxY = surf.y1 + (r + 1) * cellH - 3 - hgt;
      if (maxX < minX || maxY < minY) continue;
      const x1 = randInt(minX, maxX), y1 = randInt(minY, maxY);
      const x2 = x1 + w - 1, y2 = y1 + hgt - 1;

      const inside = [];
      for (let y = y1; y <= y2; y++)
        for (let x = x1; x <= x2; x++) {
          grid[y][x] = 0; seaSurf.delete(x + "," + y);
          if (x > x1 && x < x2 && y > y1 && y < y2) { roomWater.add(x + "," + y); inside.push({ x, y }); }
        }
      // 四壁
      for (let x = x1; x <= x2; x++) { grid[y1][x] = 1; grid[y2][x] = 1; }
      for (let y = y1; y <= y2; y++) { grid[y][x1] = 1; grid[y][x2] = 1; }

      // 门：挑一面墙，正中开一个两格宽的门洞
      const side = randInt(0, 3);       // 0上 1下 2左 3右
      const mx = Math.floor((x1 + x2) / 2), my = Math.floor((y1 + y2) / 2);
      const doorTiles = [];
      for (let d = 0; d <= 1; d++) {
        let gx, gy;
        if (side === 0) { gx = mx + d; gy = y1; }
        else if (side === 1) { gx = mx + d; gy = y2; }
        else if (side === 2) { gx = x1; gy = my + d; }
        else { gx = x2; gy = my + d; }
        if (gx <= 1 || gy <= 1 || gx >= size - 2 || gy >= size - 2) continue;
        grid[gy][gx] = 0;
        roomWater.delete(gx + "," + gy);
        dryFloor.add(gx + "," + gy);
        doorTiles.push({ x: gx, y: gy });
      }
      houses.push({ x1, y1, x2, y2, inside, door: doorTiles[0] || null, side });
    }
  }

  // ---- 出生：第一座房子的正中（如果一座都没生成，就落在海面上）----
  let start;
  if (houses.length) {
    const h0 = houses[0];
    const sx = Math.floor((h0.x1 + h0.x2) / 2), sy = Math.floor((h0.y1 + h0.y2) / 2);
    start = { x: sx, y: sy, floor: 0 };
  } else {
    start = { x: Math.floor(size / 2), y: Math.floor(surf.y2 / 2), floor: 0 };
  }

  // ---- 海底：一大片可走的岩床（保留原来的下潜玩法）----
  const bed = { top: surf.y2 + 6, bottom: size - 4, x1: 3, x2: size - 4 };
  for (let y = bed.top; y <= bed.bottom; y++)
    for (let x = bed.x1; x <= bed.x2; x++) grid[y][x] = 0;
  // 海底的礁石（零星障碍，不至于堵死）
  for (let i = 0; i < 40; i++) {
    const rx = randInt(bed.x1 + 2, bed.x2 - 2), ry = randInt(bed.top + 2, bed.bottom - 2);
    const r = randInt(1, 2);
    for (let y = ry - r; y <= ry + r; y++)
      for (let x = rx - r; x <= rx + r; x++) {
        if (x <= bed.x1 || y <= bed.top || x >= bed.x2 || y >= bed.bottom) continue;
        if (Math.hypot(x - rx, y - ry) <= r) grid[y][x] = 1;
      }
  }
  // 岩洞（通往 Level 8）：贴在海底左方的墙壁上
  const caveX = bed.x1 + 1;
  const caveY = clampInt(randInt(bed.top + 6, bed.bottom - 6), bed.top + 3, bed.bottom - 3);
  for (let y = caveY - 2; y <= caveY + 2; y++)
    for (let x = caveX; x <= caveX + 3; x++) if (grid[y] && y > bed.top && y < bed.bottom) grid[y][x] = 0;

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [collectFloors(grid, size)], rooms: [[]],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props: [], crates: [], ground: [],
    // 海面 / 房屋群
    seaSurf, roomWater, dryFloor, houses, surf,
    // 海底
    bed, subSea: null,
    cave: { x: caveX, y: caveY },       // 海底岩洞 -> Level 8
    sub: null,                          // 海面上的潜艇（下面放）
    // 兼容旧的"水域"判定：海底那一整片算水里，海面（水面之上）不算
    ocean: { top: bed.top, bottom: bed.bottom, x1: bed.x1, x2: bed.x2, islands: [] },
    // 面积无限：海面向北没有尽头 —— 越过地图上边界（y < 0）仍能走，脚下还是海。
    // 这一段不预先生成，走到才算 —— 所以进层不会占满内存。
    openNorth: { x1: surf.x1, x2: surf.x2 },
    land29: null,                       // 往北走够 500 格后浮出来的那块陆地（-> Level 29）
  };
  makeDoorsMap(map);
  // ---- 通往 Level 696 的那片水：极远处那座破屋的边上 ----
  // 档案：在 Level 7 停留 2 分钟及以上，跳入一个极远地区的破屋边上的水中。
  // 位置固定挑离出生点最远的那座房子，且必须是房子外侧紧邻的海面。
  if (houses.length) {
    let far = houses[0], fd = -1;
    for (const h of houses) {
      const d = Math.hypot((h.x1 + h.x2) / 2 - start.x, (h.y1 + h.y2) / 2 - start.y);
      if (d > fd) { fd = d; far = h; }
    }
    const cands = [];
    for (let y = far.y1 - 2; y <= far.y2 + 2; y++)
      for (let x = far.x1 - 2; x <= far.x2 + 2; x++) {
        if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) continue;
        if (grid[y][x] !== 0) continue;
        if (!seaSurf.has(x + "," + y)) continue;      // 必须是海面，不是屋子里的积水
        cands.push({ x, y });
      }
    if (cands.length) {
      const t = cands[randInt(0, cands.length - 1)];
      map.props.push({ x: t.x, y: t.y, floor: 0, type: "water696" });
    }
  }


  // ---- 潜艇：系在一座房子的外头（房子墙外一格的海面）----
  // 挑一座离出生房最远的房子，让玩家得先游过去。
  let subSpot = null;
  const ordered = houses.slice().sort((a, b) => {
    const da = Math.hypot((a.x1 + a.x2) / 2 - start.x, (a.y1 + a.y2) / 2 - start.y);
    const db = Math.hypot((b.x1 + b.x2) / 2 - start.x, (b.y1 + b.y2) / 2 - start.y);
    return db - da;
  });
  for (const h of ordered) {
    // 沿着房子外圈找一格确实是海面的位置
    const cand = [];
    for (let x = h.x1 - 1; x <= h.x2 + 1; x++) {
      cand.push({ x, y: h.y1 - 2 }); cand.push({ x, y: h.y2 + 2 });
    }
    for (let y = h.y1 - 1; y <= h.y2 + 1; y++) {
      cand.push({ x: h.x1 - 2, y }); cand.push({ x: h.x2 + 2, y });
    }
    for (const p of cand) {
      if (p.x < 2 || p.y < 2 || p.x > size - 3 || p.y > size - 3) continue;
      if (!seaSurf.has(p.x + "," + p.y)) continue;
      subSpot = p; break;
    }
    if (subSpot) break;
  }
  if (!subSpot) subSpot = { x: Math.floor(size / 2), y: surf.y2 - 2 };
  map.sub = { x: subSpot.x, y: subSpot.y };
  // ---- 水上摩托：停在码头上（Level 29 的入口）----
  // 档案：「在 Level 7 的码头上找到一个水上摩托，用它在 Level 7 的海洋上行驶上百格。」
  // 摆在出生点附近的海面上 —— 不能摆在潜艇旁边：那样玩家一按 E，
  // 会被潜艇的登船判定（nearSub）抢走，怎么按都上不了摩托。
  {
    let jet = null, bestD = 1e9;
    for (const kk of seaSurf) {
      const [jx, jy] = kk.split(",").map(Number);
      if (jx < 3 || jy < 3 || jx > size - 4 || jy > size - 4) continue;
      const d = Math.hypot(jx - start.x, jy - start.y);
      // 要离出生点近（好找），但要离潜艇远（别抢提示）
      if (Math.hypot(jx - subSpot.x, jy - subSpot.y) < 18) continue;
      if (d < bestD) { bestD = d; jet = { x: jx, y: jy }; }
    }
    if (!jet) jet = { x: Math.max(3, Math.min(size - 4, start.x)), y: Math.max(3, Math.min(size - 4, start.y)) };
    map.props.push({ x: jet.x, y: jet.y, floor: 0, type: "jet29", toLevel: 29 });
    map.jet29 = jet;
  }

  // ---- 钥匙与潜水服：分处两座不同的房子里 ----
  // 从离出生点由远到近排，钥匙放最远那座，潜水服放次远那座 —— 逼着玩家出门。
  const pickInside = (h) => {
    if (!h || !h.inside.length) return null;
    const cx = Math.floor((h.x1 + h.x2) / 2), cy = Math.floor((h.y1 + h.y2) / 2);
    for (const t of h.inside) {
      if (Math.abs(t.x - cx) <= 2 && Math.abs(t.y - cy) <= 1) return t;
    }
    return h.inside[randInt(0, h.inside.length - 1)];
  };
  const used = new Set();
  const takeInside = (h) => {
    if (!h) return null;
    for (let i = 0; i < 40; i++) {
      const t = h.inside[randInt(0, h.inside.length - 1)];
      if (!t) break;
      const k = t.x + "," + t.y;
      if (used.has(k)) continue;
      used.add(k);
      return t;
    }
    return null;
  };
  // 出生房不放关键道具（免得一睁眼就白捡），从其余房子里挑两座
  const rest = ordered.filter((h) => !(h.x1 <= start.x && start.x <= h.x2 && h.y1 <= start.y && start.y <= h.y2));
  const pool = rest.length >= 2 ? rest : ordered;
  const hKey = pool[0], hSuit = pool[1] || pool[0];
  const kt = takeInside(hKey);
  if (kt) map.ground.push({ x: kt.x, y: kt.y, floor: 0, item: "subkey", taken: false });
  // 潜水服：联机时按人数刷，一人一套，谁也不会抢不到
  const suitCount = Math.max(1, Math.min(8, (map.mpCount | 0) || (typeof mpCount !== "undefined" ? mpCount : 1) || 1));
  let suitN = 0;
  for (let i = 0; i < suitCount; i++) {
    const h = pool[(i + 1) % pool.length];
    const t = takeInside(h) || takeInside(pool[i % pool.length]);
    if (!t) break;
    map.ground.push({ x: t.x, y: t.y, floor: 0, item: "divesuit", taken: false });
    suitN++;
  }
  // 兜底：万一房子太少，两样都塞进出生房，保证一定能拿到
  if (!kt && !suitN && houses.length) {
    const h = houses[0];
    const a = pickInside(h), b = takeInside(h);
    if (a) map.ground.push({ x: a.x, y: a.y, floor: 0, item: "subkey", taken: false });
    if (b) map.ground.push({ x: b.x, y: b.y, floor: 0, item: "divesuit", taken: false });
  }
  map.keyHouse = hKey || null;
  map.suitHouse = hSuit || null;

  // ---- 房子里的家具：泡在水里，木头都泡得发黑发绿 ----
  for (const h of houses) {
    const n = randInt(2, 4);
    for (let i = 0; i < n; i++) {
      if (!h.inside.length) break;
      const t = h.inside[randInt(0, h.inside.length - 1)];
      const k = t.x + "," + t.y;
      if (used.has(k)) continue;
      if (t.x === start.x && t.y === start.y) continue;   // 别糊在出生点上
      used.add(k);
      map.props.push({ x: t.x, y: t.y, floor: 0, type: "soakedFurn", variant: randInt(0, 3) });
    }
  }

  // ---- 其余房子里散点补给 ----
  map._used = used;
  const take = () => {
    if (!houses.length) return null;
    for (let i = 0; i < 60; i++) {
      const h = houses[randInt(0, houses.length - 1)];
      if (!h.inside.length) continue;
      const t = h.inside[randInt(0, h.inside.length - 1)];
      const k = t.x + "," + t.y;
      if (map._used.has(k)) continue;
      map._used.add(k);
      return t;
    }
    return null;
  };
  // 撬棍（不然箱子打不开）
  {
    const t = take();
    if (t) map.ground.push({ x: t.x, y: t.y, floor: 0, item: "crowbar", taken: false });
  }
  // 破损的箱子：不用撬棍，直接翻
  for (let i = 0; i < randInt(3, 5); i++) {
    const t = take(); if (!t) break;
    map.props.push({ x: t.x, y: t.y, floor: 0, type: "brokenCrate",
      contains: Math.random() < 0.5 ? "almond" : "torch", opened: false });
  }
  // 补给箱：要撬棍
  for (let i = 0; i < randInt(2, 4); i++) {
    const t = take(); if (!t) break;
    map.crates.push({ x: t.x, y: t.y, floor: 0, opened: false, loot: randInt(1, 3) });
  }
  for (let i = 0; i < 5; i++) {
    const t = take(); if (!t) break;
    map.ground.push({ x: t.x, y: t.y, floor: 0, item: "almond", taken: false });
  }
  return map;
}

// ================= Level 8：岩洞系统 =================
// 无限蔓延的地下洞穴：非欧几何、不稳定的重力、有毒气体、突如其来的涨潮、
// 成片的蜘蛛巢，以及会钻进岩层的牧蛇。出口：岩洞最深处那一小片 Level 9 模样的郊区。
function generateCaveMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);

  // ---------- 细窄的洞穴网道 ----------
  // 以前是半径 1~3 的圆笔刷 + 时不时开 3~5 格的大洞室，一群虫来回刷，
  // 整层就会连出几十格宽的空场。现在全图只有 1~2 格宽的蜿蜒通道，
  // 唯有三条以上通道交汇的岔路口才扩成一个小腔，且最大不超过 5×5。
  const CELL = 7;                                  // 节点间距
  const gw = Math.max(3, Math.floor((size - 4) / CELL));
  const gh = gw;
  const ox = Math.floor((size - gw * CELL) / 2);
  const oy = ox;
  const nodeXY = (gx, gy) => ({ x: ox + gx * CELL + (CELL >> 1), y: oy + gy * CELL + (CELL >> 1) });
  const idx = (gx, gy) => gy * gw + gx;

  // 每步只挖自己；wide 时顺手多挖一格，让通道偶尔有两格宽
  const carve = (x, y, wide) => {
    if (x > 1 && y > 1 && x < size - 2 && y < size - 2) grid[y][x] = 0;
    if (wide && x + 1 > 1 && x + 1 < size - 2 && y > 1 && y < size - 2) grid[y][x + 1] = 0;
  };
  // 从 A 逐格走到 B：每次只改一个轴，保证 4 邻域连通；随机选轴让路带点弯曲
  const tunnel = (a, b) => {
    const A = nodeXY(a % gw, (a / gw) | 0), B = nodeXY(b % gw, (b / gw) | 0);
    let x = A.x, y = A.y, guard = 0;
    carve(x, y, false);
    while ((x !== B.x || y !== B.y) && guard++ < CELL * 4) {
      const dx = B.x - x, dy = B.y - y;
      const goX = dx !== 0 && (dy === 0 || Math.random() < Math.abs(dx) / (Math.abs(dx) + Math.abs(dy)));
      if (goX) x += Math.sign(dx); else y += Math.sign(dy);
      carve(x, y, Math.random() < 0.10);
    }
  };
  // 随机 DFS 生成树铺满整张图，再补少量边做出环路与岔路
  const visited = new Uint8Array(gw * gh);
  const deg = new Uint8Array(gw * gh);
  const chosen = [];
  const usedEdge = new Set();
  const ekey = (a, b) => Math.min(a, b) * 100000 + Math.max(a, b);
  const cx0 = gw >> 1, cy0 = gh >> 1;
  const stack = [idx(cx0, cy0)];
  visited[idx(cx0, cy0)] = 1;
  while (stack.length) {
    const cur = stack[stack.length - 1];
    const gx = cur % gw, gy = (cur / gw) | 0;
    const nb = [];
    if (gx > 0 && !visited[idx(gx - 1, gy)]) nb.push(idx(gx - 1, gy));
    if (gx + 1 < gw && !visited[idx(gx + 1, gy)]) nb.push(idx(gx + 1, gy));
    if (gy > 0 && !visited[idx(gx, gy - 1)]) nb.push(idx(gx, gy - 1));
    if (gy + 1 < gh && !visited[idx(gx, gy + 1)]) nb.push(idx(gx, gy + 1));
    if (!nb.length) { stack.pop(); continue; }
    const nxt = nb[randInt(0, nb.length - 1)];
    visited[nxt] = 1;
    chosen.push([cur, nxt]); usedEdge.add(ekey(cur, nxt));
    deg[cur]++; deg[nxt]++;
    stack.push(nxt);
  }
  for (let gy = 0; gy < gh; gy++) for (let gx = 0; gx < gw; gx++) {
    for (const [dx, dy] of [[1, 0], [0, 1]]) {
      const nx = gx + dx, ny = gy + dy;
      if (nx >= gw || ny >= gh) continue;
      const a = idx(gx, gy), b = idx(nx, ny), k = ekey(a, b);
      if (usedEdge.has(k) || Math.random() >= 0.16) continue;
      usedEdge.add(k); chosen.push([a, b]); deg[a]++; deg[b]++;
    }
  }
  for (const [a, b] of chosen) tunnel(a, b);

  // 岔路口：只有三条以上通道交汇的节点才扩腔；最大 5×5，其余节点保持窄
  const chamber = (gx, gy, half) => {
    const c = nodeXY(gx, gy);
    for (let dy = -half; dy <= half; dy++) for (let dx = -half; dx <= half; dx++) {
      const x = c.x + dx, y = c.y + dy;
      if (x > 1 && y > 1 && x < size - 2 && y < size - 2) grid[y][x] = 0;
    }
  };
  const wideJunctions = [];   // 5×5 岔口的位置（出口那片郊区优先复用现成的）
  for (let gy = 0; gy < gh; gy++) for (let gx = 0; gx < gw; gx++) {
    const d = deg[idx(gx, gy)];
    if (d >= 3) {
      const half = d >= 4 && Math.random() < 0.5 ? 2 : 1;               // 3×3 或 5×5
      chamber(gx, gy, half);
      if (half === 2) wideJunctions.push(nodeXY(gx, gy));
    } else chamber(gx, gy, 0);
  }

  const floors = collectFloors(grid, size);
  // 出生点落在离地图中心最近的可走格上（一定在网道里）
  const mid = Math.floor(size / 2);
  let start = { x: mid, y: mid, floor: 0 }, bd0 = Infinity;
  for (const t of floors) {
    const d = Math.hypot(t.x - mid, t.y - mid);
    if (d < bd0) { bd0 = d; start = { x: t.x, y: t.y, floor: 0 }; }
  }
  // 出口不再是绿色标记 —— 岩洞最深处会撞见一小片不该存在的郊区（Level 9 的模样）。
  // 优先复用现成的 5×5 岔口，免得为了出口又挖出一块超过「岔路口大一点」的空地。
  const reach0 = reachableFromRaw(grid, size, start);
  let suburbCenter = null, bd = -1;
  for (const c of wideJunctions) {
    if (!reach0.has(c.x + "," + c.y)) continue;
    const d = Math.hypot(c.x - start.x, c.y - start.y);
    if (d > bd) { bd = d; suburbCenter = c; }
  }
  if (!suburbCenter) {
    // 这一把没刷出 5×5 岔口：在最远的可走格上挖一个，挖完重新收集地板
    let far = null, fd = -1;
    for (const t of floors) {
      if (!reach0.has(t.x + "," + t.y)) continue;
      const d = Math.hypot(t.x - start.x, t.y - start.y);
      if (d > fd) { fd = d; far = t; }
    }
    suburbCenter = far || { x: start.x + 6, y: start.y };
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      const x = suburbCenter.x + dx, y = suburbCenter.y + dy;
      if (x > 1 && y > 1 && x < size - 2 && y < size - 2) grid[y][x] = 0;
    }
    floors.length = 0;
    for (const t of collectFloors(grid, size)) floors.push(t);
  }
  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [[]],
    start, exit: null,          // 没有绿色出口牌了：那片郊区就是出口
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props: [], crates: [], ground: [],
    toxic: new Set(),       // 有毒气体（硫化氢 / 氯气 / 氨气…）
    nests: new Set(),       // 蜘蛛巢：整片区域都被占领
    warps: new Set(),       // 非欧几何：踩上去会被送到别处
    floods: new Set(),      // 涨潮时被淹没的格子
    dark8: new Set(),       // 伸手不见五指的洞段（压暗，但不涂成黑块）
    spot8: [],              // 会来回扫的探照灯
  };
  makeDoorsMap(map);

  // ---- 那片郊区：5×5 的地面 + 外圈一圈画成房屋立面的墙 ----
  // 尺寸和岔路口一致，不会破坏「全图都是窄洞穴，只有岔口大一点」的形状。
  const suburbPatch = new Set(), suburbWall = new Set();
  for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
    const x = suburbCenter.x + dx, y = suburbCenter.y + dy;
    if (x > 1 && y > 1 && x < size - 2 && y < size - 2) suburbPatch.add(x + "," + y);
  }
  for (const k of suburbPatch) {
    const [sx, sy] = k.split(","); const x = +sx, y = +sy;
    for (const [ddx, ddy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nk = (x + ddx) + "," + (y + ddy);
      if (!suburbPatch.has(nk) && grid[y + ddy] && grid[y + ddy][x + ddx] === 1) suburbWall.add(nk);
    }
  }
  map.suburbPatch = suburbPatch;
  map.suburbWall = suburbWall;
  map.suburbCenter = { x: suburbCenter.x, y: suburbCenter.y };
  // 给验证器 / AI 一个看得见的锚点（走进去才传送，不需要按 E）
  map.props.push({ x: suburbCenter.x, y: suburbCenter.y, floor: 0, type: "suburb9", toLevel: 9 });

  const key = (t) => t.x + "," + t.y;
  const away = (min) => {
    for (let i = 0; i < 300; i++) {
      const t = floors[randInt(0, floors.length - 1)];
      if (!t) break;
      if (Math.hypot(t.x - start.x, t.y - start.y) < min) continue;
      return t;
    }
    return null;
  };
  // 黑暗洞段 + 会扫动的探照灯：只覆盖已有通道，不额外挖地
  {
    const centers = [];
    for (let i = 0; i < 11; i++) {
      const c = away(12);
      if (!c) continue;
      centers.push(c);
      const r = randInt(2, 4);
      for (let y = c.y - r; y <= c.y + r; y++) {
        for (let x = c.x - r; x <= c.x + r; x++) {
          if (x > 1 && y > 1 && x < size - 2 && y < size - 2 && grid[y][x] === 0) map.dark8.add(x + "," + y);
        }
      }
    }
    for (let i = 0; i < 7; i++) {
      const c = centers[i % Math.max(1, centers.length)] || away(10);
      if (!c) continue;
      map.spot8.push({
        x: (c.x + 0.5) * TILE, y: (c.y + 0.5) * TILE,
        ang: rand(0, Math.PI * 2),
        spd: rand(0.22, 0.55) * (Math.random() < 0.5 ? -1 : 1),
        r: TILE * rand(5, 8), half: 0.30,
      });
    }
  }
  // 有毒气体：几片
  for (let i = 0; i < 9; i++) {
    const c = away(14);
    if (!c) continue;
    const r = randInt(2, 4);
    for (let y = c.y - r; y <= c.y + r; y++) {
      for (let x = c.x - r; x <= c.x + r; x++) {
        if (x > 1 && y > 1 && x < size - 2 && y < size - 2 && grid[y][x] === 0) map.toxic.add(x + "," + y);
      }
    }
  }
  // 蜘蛛巢
  for (let i = 0; i < 7; i++) {
    const c = away(12);
    if (!c) continue;
    const r = randInt(2, 3);
    for (let y = c.y - r; y <= c.y + r; y++) {
      for (let x = c.x - r; x <= c.x + r; x++) {
        if (x > 1 && y > 1 && x < size - 2 && y < size - 2 && grid[y][x] === 0) map.nests.add(x + "," + y);
      }
    }
  }
  // 空间扭曲点
  for (let i = 0; i < 10; i++) {
    const c = away(10);
    if (c) map.warps.add(key(c));
  }
  // 岩洞里也有自由流淌的杏仁水
  for (let i = 0; i < 8; i++) {
    const c = away(6);
    if (c) map.ground.push({ x: c.x, y: c.y, floor: 0, item: "almond", taken: false });
  }
  dropBag(map, level);
  // 那片郊区上不要有毒气、蛛网、黑暗和扭曲点 —— 它得一眼看出不是岩洞
  for (const s of [map.toxic, map.nests, map.dark8, map.warps, map.floods]) {
    for (const k of suburbPatch) s.delete(k);
  }
  return map;
}

// ================= 隐秘层级：枢纽 =================
// 一条无限延伸的昏暗地下隧道：沥青地面被三条黄线划成四条车道，
// 两侧成排的混凝土门，门上刻着无法辨认的符文。大部分门都锁着 ——
// 只有通往 Level 1 的那扇（第 7 排）永远是开的。
function generateHubMap() {
  const size = mapSizeFor("hub");
  const grid = makeGrid(size);
  const laneH = 9;                       // 四条车道（三条黄线分隔）
  const cy = Math.floor(size / 2);
  const top = cy - Math.floor(laneH / 2);
  for (let y = top; y < top + laneH; y++) {
    for (let x = 2; x < size - 3; x++) grid[y][x] = 0;
  }
  const start = { x: 5, y: cy, floor: 0 };

  const map = {
    size, level: "hub", doubleStory: false,
    layers: [grid], floors: [collectFloors(grid, size)], rooms: [[]],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props: [], crates: [], ground: [],
    lanes: { top, h: laneH, lines: [top + 2, top + 4, top + 6] },
    hubDoors: [],
    balloon: null,      // 装饰着可爱气球的窗户（彩蛋）
    rows: [],
  };
  makeDoorsMap(map);

  // ---- 长方形洞口 -> Level 94 动画 ----
  // 档案原文：「从 Level 601 里成功离开后，再进入枢纽里面爬入一个长方形洞口
  // 可以到达这里。」洞口不藏起来，就开在隧道最里端的车道上。
  {
    const hx = Math.max(6, size - 7);
    const hy = cy;                     // 中间那条车道（门都在上下两侧，不会撞上）
    if (grid[hy] && grid[hy][hx] === 0) {
      map.props.push({ x: hx, y: hy, floor: 0, type: "hub94hole", toLevel: 94 });
    }
  }

  // 成对的混凝土门：沿隧道两侧，一排一排地排列。
  // 每一排的上下两扇是"一对"，通往同一个层级；每个层级只占一排 ——
  // 之前是每扇门各自随机挑目标，结果同一个层级会冒出三四扇门，
  // 连成对的上下两扇都各奔东西。
  // 门的排布固定下来：上面是 1、下面是 0，再往右上面是 3、下面是 2 …
  // 以前每排洗牌，上下两扇还各自随机挑目标，同一个层级会冒出好几扇门。
  const targets = HUB_TARGETS.slice();
  // 第 7 排（索引 6）固定是通往 Level 1 的那扇 —— 它永远不上锁。
  // 为了满足"上面 1 / 下面 0"的读法，把 1 排到偶数槽位（下面那列）。
  const l1i = targets.indexOf(1);
  if (l1i >= 0 && l1i !== 1) {
    const swap = targets[1]; targets[1] = targets[l1i]; targets[l1i] = swap;
  }

  const yUp = top - 1, yDown = top + laneH;
  const mk = (dx, dy, dir, target, row) => {
    grid[dy][dx] = 0;
    const d = addDoor(map, [{ x: dx, y: dy, dir }], 0, "hubdoor", {
      dir, target, row,
      locked: !(target === 1),       // 只有通往 Level 1 的门不上锁
      rune: randInt(0, 9),           // 门上那个像麦田怪圈的符号
    });
    if (d) map.hubDoors.push(d);
  };
  const STEP = 5;
  let col = 0;
  for (let i = 0; i < targets.length; i += 2) {
    const row = col + 1;
    const x = 9 + col * STEP;
    if (x >= size - 8) break;       // 放不下就少几排，也不重复
    // 上面拿奇数位、下面拿偶数位 —— 于是第一列就是"上 1 / 下 0"
    // 层级总数是奇数时，最后一排只剩一个 —— 以前拿它把上下两扇都填上，
    // 于是最后一个层级（Level 1000）在枢纽里冒出两个入口，别的层级都只有一扇。
    if (targets[i + 1] != null) mk(x, yUp, "v", targets[i + 1], row);
    mk(x, yDown, "v", targets[i], row);
    map.rows.push(row);
    col++;
  }
  // 彩蛋：一扇装饰着气球的窗户（派对还没开放）
  // 位置要跟所有门排拉开距离 —— 以前按 size*0.72 算，正好贴在最后一排门旁边，
  // 看着就像"派对的入口挂在 Level 1000 门边上"。现在挑离门排最远的那一格。
  {
    let bx = -1, bestGap = -1;
    for (let x = 6; x < size - 4; x++) {
      let gap = 9999;
      for (let c = 0; c < col; c++) gap = Math.min(gap, Math.abs(x - (9 + c * STEP)));
      if (gap > bestGap) { bestGap = gap; bx = x; }
    }
    map.balloon = { x: bx >= 0 ? bx : Math.floor(size * 0.72), y: top - 1 };
  }
  grid[map.balloon.y][map.balloon.x] = 0;
  return map;
}

// ================= Level 18：回忆（幼儿园 / 日托所） =================
// 等级 0 · 安全 · 稳定 · 实体绝迹。
// 一间间幼儿园教室与活动室：彩色的地垫、矮矮的小桌椅、贴着画作的墙。
// 徘徊时会听见"低语"—— 它们最常说的是你最大的遗憾或最大的错误。
// 偶尔会重新唤醒被遗忘的童年记忆（比如死去的宠物），让人一下子陷进情绪里。
// 罕见的"毛绒恐龙"会四处游荡，它会把水和食物带给流浪者。
// 出口：转身 —— 从你进来的地方离开，就有一扇通往 Level 19 的门。
function generateDaycareMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const rooms = [];
  const props = [];

  // 一条横向主走廊，两侧紧贴着一间间教室 —— 门就开在走廊这一面，
  // 推门进去就是教室，不用穿过一堵墙。
  const cy = Math.floor(size / 2);
  for (let x = 2; x < size - 2; x++) grid[cy][x] = 0;

  // 一间教室：挖空 + 朝走廊开一扇 2 格宽的门洞
  const mkRoom = (x0, y0, w, h, name, up) => {
    for (let y = y0; y < y0 + h; y++)
      for (let x = x0; x < x0 + w; x++) if (grid[y] && x >= 1 && x < size - 1) grid[y][x] = 0;
    // 门开在紧贴走廊的那一排（up=true 的房间贴走廊下沿在上排的下面）
    const doorY = up ? y0 + h - 1 : y0;
    const dx = x0 + Math.floor(w / 2) - 1;
    grid[doorY][dx] = 0; grid[doorY][dx + 1] = 0;
    // 门前的走廊那一格必须是通的
    if (up) { if (grid[doorY + 1]) grid[doorY + 1][dx] = 0; grid[doorY + 1][dx + 1] = 0; }
    else { if (grid[doorY - 1]) grid[doorY - 1][dx] = 0; grid[doorY - 1][dx + 1] = 0; }
    rooms.push({ x: x0, y: y0, w, h, name, door: { x: dx, y: doorY }, up });
  };

  const NAMES = ["阳光班", "小班教室", "午睡室", "游戏角", "绘本角", "音乐室", "美术角", "储藏间"];
  let ni = 0;
  const rows = [
    { up: true, y: cy - 1 },     // 上排：房间底边贴着 cy-1，门开在 cy-1
    { up: false, y: cy + 1 },    // 下排：房间顶边贴着 cy+1，门开在 cy+1
  ];
  for (const r of rows) {
    let x = 3;
    while (x < size - 10) {
      const w = randInt(10, 15), h = randInt(7, 10);
      if (x + w > size - 4) break;
      const y0 = r.up ? (r.y - h + 1) : r.y;
      if (y0 < 2 || y0 + h > size - 2) break;
      mkRoom(x, y0, w, h, NAMES[ni++ % NAMES.length], r.up);
      x += w + 2;
    }
  }
  const start = { x: 6, y: cy, floor: 0 };

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [collectFloors(grid, size)], rooms: [rooms],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground: [],
    daycareRooms: rooms,
    // 毛绒恐龙：一个友善的"实体"，会带着补给出现
    dino: { x: start.x + 8, y: cy, t: 0, tx: start.x + 8, ty: cy },
    glowPets: [],      // 被唤醒的童年记忆（死去的宠物）
    children: [],      // "孩子们"前哨：住在这一层的人，厌恶毛绒恐龙
  };
  makeDoorsMap(map);

  // 教室里的陈设 —— 每种房间摆的东西不一样，一眼能看出这是间什么屋子
  for (const r of rooms) {
    const cells = [];
    for (let y = r.y; y < r.y + r.h; y++)
      for (let x = r.x; x < r.x + r.w; x++)
        if (grid[y] && grid[y][x] === 0 && !(x === r.door.x && y === r.door.y)) cells.push({ x, y });
    if (!cells.length) continue;
    const put = (type, n, ox, oy) => {
      for (let i = 0; i < n; i++) {
        const c = cells[randInt(0, cells.length - 1)];
        if (c) props.push({ x: c.x + (ox || 0), y: c.y + (oy || 0), floor: 0, type });
      }
    };
    const nm = r.name;
    if (nm === "午睡室") {
      put("cot", randInt(5, 8));           // 一排小床
      put("mat", randInt(2, 3));
    } else if (nm === "游戏角") {
      put("toyshelf", randInt(2, 4));
      put("ballpit", randInt(1, 2));       // 海洋球池
      put("mat", randInt(2, 3));
    } else if (nm === "绘本角") {
      put("bookshelf", randInt(3, 5));
      put("mat", randInt(2, 4));
      put("chair", randInt(2, 3));
    } else if (nm === "音乐室") {
      put("piano", 1);
      put("chair", randInt(3, 5));
      put("mat", randInt(1, 2));
    } else if (nm === "美术角") {
      put("easel", randInt(2, 4));         // 画架
      put("desk", randInt(2, 3));
    } else if (nm === "储藏间") {
      put("toyshelf", randInt(3, 5));
      put("crate", randInt(2, 4));
    } else {
      // 教室：小桌椅一排排摆开
      put("desk", randInt(4, 7));
      put("chair", randInt(4, 7));
      put("blackboard", 1);
      put("toyshelf", randInt(1, 2));
    }
  }
  // 补给：这个层级提供生存所需的一切
  const floors = collectFloors(grid, size);
  for (let i = 0; i < 10; i++) {
    const t = floors[randInt(0, floors.length - 1)];
    if (t) map.ground.push({ x: t.x, y: t.y, floor: 0, item: "almond", taken: false });
  }
  // 童年记忆：几处"死去的宠物"的幻影
  for (let i = 0; i < 3; i++) {
    const t = floors[randInt(0, floors.length - 1)];
    if (t) map.glowPets.push({ x: t.x, y: t.y });
  }
  // "孩子们"：20~25 人，就在这一层安家
  const home = rooms[0] || { x: 6, y: cy - 6, w: 10, h: 8 };
  for (let i = 0; i < randInt(20, 25); i++) {
    map.children.push({
      x: home.x + randInt(1, Math.max(1, home.w - 2)),
      y: home.y + randInt(1, Math.max(1, home.h - 2)),
    });
  }
  // 出口：转身 —— 从进来的地方离开，就有一扇通往 Level 19 的门。
  // 放在出生点"背后" —— 往回走几步就撞见，但不会一进来就触发。
  {
    let best = null, bestScore = Infinity;
    for (const t of floors) {
      const d = Math.hypot(t.x - start.x, t.y - start.y);
      if (d < 3 || d > 6) continue;
      // 偏好"背后"（x 比出生点更小的一侧）
      const score = d + (t.x < start.x ? 0 : 4);
      if (score < bestScore) { bestScore = score; best = t; }
    }
    if (!best) {
      for (const t of floors) {
        const d = Math.hypot(t.x - start.x, t.y - start.y);
        if (d < 2 || d > 12) continue;
        if (d < bestScore) { bestScore = d; best = t; }
      }
    }
    if (best) {
      // 注意：这里**不**设 map.exit —— 那会画出一个绿色出口门牌，还会被
      // "站在出口上就算通关"的判定误触发。Level 18 的出路是那扇深色木门。
      map.turnBackDoor = { x: best.x, y: best.y, floor: 0 };
    }
  }
  return map;
}

// ================= Level 19：阁楼 =================
// 等级 2 · 不安全 · 稳定 · 少量实体。
// 潮湿、破旧、杂乱的阁楼空间：成堆的箱子、老式家具。外表脏污，里面却近乎崭新。
// 箱子里的食物与物品一旦被取出，就会开始快速腐烂 —— 衰败也会波及人。
// 地板下偶尔透出温暖的橙色光芒：它会灌输舒适与平和，并篡改记忆。
// 出口：没有发光的地板裂缝 / 破损的门 / 箱子里的小街机 / 层级边界。
function generateAtticMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);

  // 随机形状的阁楼空间：一堆矩形块随机拼出来
  const blocks = [];
  for (let i = 0; i < 26; i++) {
    const w = randInt(6, 16), h = randInt(5, 12);
    const x = randInt(3, size - w - 4), y = randInt(3, size - h - 4);
    for (let yy = y; yy < y + h; yy++)
      for (let xx = x; xx < x + w; xx++) grid[yy][xx] = 0;
    blocks.push({ x, y, w, h });
  }
  // 把它们连起来：从中心出发，逐块往中心挖一条通道
  const c0 = { x: Math.floor(size / 2), y: Math.floor(size / 2) };
  const open = (x, y) => { if (x > 1 && y > 1 && x < size - 2 && y < size - 2) grid[y][x] = 0; };
  for (const b of blocks) {
    let x = b.x + Math.floor(b.w / 2), y = b.y + Math.floor(b.h / 2);
    while (x !== c0.x) { x += (c0.x > x ? 1 : -1); for (let d = -1; d <= 1; d++) open(x, y + d); }
    while (y !== c0.y) { y += (c0.y > y ? 1 : -1); for (let d = -1; d <= 1; d++) open(x + d, y); }
  }
  const floors = collectFloors(grid, size);
  const start = { x: c0.x, y: c0.y, floor: 0 };

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [[]],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props: [], crates: [], ground: [],
    glow: new Set(),        // 地板下透出橙色光芒的格子
    cracks: [],             // 没有发光的裂缝（掉下去会落到别处）
    brokenDoors: [],        // 破损的门 -> Level 5
    arcades: [],            // 箱子里的小街机
    decay: 0,               // 衰败值：翻箱子会上升
  };
  makeDoorsMap(map);

  // 成堆的箱子 / 老式家具
  for (let i = 0; i < 90; i++) {
    const t = floors[randInt(0, floors.length - 1)];
    if (!t) break;
    if (Math.hypot(t.x - start.x, t.y - start.y) < 3) continue;
    const r = Math.random();
    // 箱子照样遍地都是 —— 但绝大多数是空的，只有少数几个里有一瓶杏仁水。
    // （原文：Level 19 是"最废"的层级之一，翻半天翻不出东西来才是它该有的样子）
    if (r < 0.62) map.crates.push({ x: t.x, y: t.y, floor: 0, opened: false, loot: 0 });
    else map.props.push({ x: t.x, y: t.y, floor: 0,
      type: ["oldsofa", "wardrobe", "oldtable", "lamp"][randInt(0, 3)] });
  }
  // 几瓶杏仁水：整层只有这么点补给
  {
    const withLoot = [];
    for (const c of map.crates) withLoot.push(c);
    const n = Math.min(withLoot.length, randInt(2, 4));      // 只有 2~4 个箱子里有东西
    for (let i = 0; i < n; i++) {
      const c = withLoot[randInt(0, withLoot.length - 1)];
      if (c) c.loot = 1;
    }
  }
  // 地板下的橙色光芒：已删除（原本会勾人、也带来衰败，现在整层都不再有）
  for (let i = 0; i < 0; i++) {
    const t = floors[randInt(0, floors.length - 1)];
    if (!t) break;
    const r = randInt(1, 3);
    for (let y = t.y - r; y <= t.y + r; y++)
      for (let x = t.x - r; x <= t.x + r; x++) {
        const k = x + "," + y;
        if (grid[y] && grid[y][x] === 0 && Math.hypot(x - t.x, y - t.y) <= r) map.glow.add(k);
      }
  }
  // 没有发光的裂缝
  for (let i = 0; i < 5; i++) {
    const t = floors[randInt(0, floors.length - 1)];
    if (t && !map.glow.has(t.x + "," + t.y)) map.cracks.push({ x: t.x, y: t.y });
  }
  // 破损的门
  for (let i = 0; i < 3; i++) {
    const t = floors[randInt(0, floors.length - 1)];
    if (t) map.brokenDoors.push({ x: t.x, y: t.y });
  }
  // 窗户：一般全是黑的；偶尔有一扇亮着 —— 别站到它的光里去（窗灵）
  {
    const win = [];
    const seen = new Set();
    for (let i = 0; i < 400 && win.length < 26; i++) {
      const t = floors[randInt(0, floors.length - 1)];
      if (!t) break;
      // 找一个贴着这块地板的墙格当窗户
      const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      const d = dirs[randInt(0, 3)];
      const wx = t.x + d[0], wy = t.y + d[1];
      if (wx < 1 || wy < 1 || wx >= size - 1 || wy >= size - 1) continue;
      if (grid[wy][wx] !== 1) continue;
      const k = wx + "," + wy;
      if (seen.has(k)) continue;
      seen.add(k);
      // 光照方向：从窗户射向地板（-d）
      win.push({ x: wx, y: wy, dx: -d[0], dy: -d[1], lit: false });
    }
    // 大部分是黑的，只有 2~3 扇亮着。
    // 但亮着的光斑是致命的（站进去会被窗灵抓走），所以它绝不能把任何一条路封死：
    // 每点亮一扇窗之前先试算一次连通性，凡是会让某块地板走不到的，就让它继续黑着。
    const litN = Math.min(win.length, randInt(2, 3));
    const idx = win.map((_, i) => i).sort(() => Math.random() - 0.5);
    const litCells = new Set();
    const floorSet19 = new Set(floors.map(f => f.x + "," + f.y));
    // 光斑是致命的（站进去就被窗灵抓走），所以有些格子它压根不该碰：
    // 1) 出口（裂缝 / 破损门）和能翻的箱子 —— 盖住了就等于逼玩家去送死
    // 2) 窄通道（前后只有两个出口的一格走廊）—— 铺上去这条道就废了
    // 3) 出生点附近 —— 一睁眼就踩进去太冤
    const forbidden19 = new Set();
    for (const c of map.cracks) forbidden19.add(c.x + "," + c.y);
    for (const c of map.brokenDoors) forbidden19.add(c.x + "," + c.y);
    for (const c of map.crates) forbidden19.add(c.x + "," + c.y);
    for (const c of map.props) forbidden19.add(c.x + "," + c.y);
    for (const c of map.arcades) forbidden19.add(c.x + "," + c.y);
    if (map.start) {
      for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++)
        forbidden19.add((map.start.x + dx) + "," + (map.start.y + dy));
    }
    const openN19 = (x, y) => {
      let n = 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue;
        if (grid[ny][nx] === 0) n++;
      }
      return n;
    };
    const startK19 = (map.start ? map.start.x + "," + map.start.y : "");
    const s19 = (startK19 && floorSet19.has(startK19)) ? map.start : floors[0];
    const reachAll19 = (blocked) => {
      if (!s19) return false;
      const k0 = s19.x + "," + s19.y;
      if (blocked.has(k0)) return false;
      const seen = new Set([k0]);
      const q = [k0];
      while (q.length) {
        const c = q.pop();
        const cx = +c.split(",")[0], cy = +c.split(",")[1];
        const nb = [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]];
        for (const n of nb) {
          const k = n[0] + "," + n[1];
          if (!floorSet19.has(k) || seen.has(k) || blocked.has(k)) continue;
          seen.add(k);
          q.push(k);
        }
      }
      return seen.size >= floorSet19.size - blocked.size;   // 除光斑外，每一块地板都还走得到
    };
    let litCount = 0;
    for (const i of idx) {
      if (litCount >= litN) break;
      const w = win[i];
      const cells = [];
      let hitForbidden = false;
      // 光从窗户射进来：往前 4 格，越远越散
      for (let step = 1; step <= 4; step++) {
        const cx = w.x + w.dx * step, cy = w.y + w.dy * step;
        if (cx < 0 || cy < 0 || cx >= size || cy >= size) break;
        if (grid[cy][cx] !== 0) break;             // 照到墙就停
        // 侧向扩散：远处宽一点
        const spread = step >= 3 ? 1 : 0;
        for (let s = -spread; s <= spread; s++) {
          const px = cx + (w.dy !== 0 ? s : 0);
          const py = cy + (w.dx !== 0 ? s : 0);
          if (px < 0 || py < 0 || px >= size || py >= size) continue;
          if (grid[py][px] !== 0) continue;
          const ck = px + "," + py;
          if (forbidden19.has(ck)) { hitForbidden = true; continue; }   // 出口 / 箱子 / 出生点附近：不照
          if (openN19(px, py) <= 2) { hitForbidden = true; continue; }  // 一格宽的走廊：不照
          cells.push(ck);
        }
      }
      if (!cells.length || hitForbidden) continue;
      // 试着点亮：这片光加进去之后，还有没有地板会被切断？
      const trial = new Set(litCells);
      for (const c of cells) trial.add(c);
      if (!reachAll19(trial)) continue;   // 会封路 —— 这扇窗就让它黑着
      w.lit = true;
      for (const c of cells) litCells.add(c);
      litCount++;
    }
    map.windows19 = win;
    map.lit19 = litCells;
  }
  // 散落的杏仁水（阁楼里食物不少）
  for (let i = 0; i < 8; i++) {
    const t = floors[randInt(0, floors.length - 1)];
    if (t) map.ground.push({ x: t.x, y: t.y, floor: 0, item: "almond", taken: false });
  }
  for (let i = 0; i < 2; i++) {
    const t = floors[randInt(0, floors.length - 1)];
    if (t) map.ground.push({ x: t.x, y: t.y, floor: 0, item: "crowbar", taken: false });
  }
  return map;
}

function clampInt(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

// 从某格出发能走到的地板（原始网格版，给生成器自己用）
function reachableFromRaw(grid, size, from) {
  const seen = new Set([from.x + "," + from.y]);
  const q = [from];
  while (q.length) {
    const c = q.pop();
    for (let k = 0; k < 4; k++) {
      const nx = c.x + (k === 0 ? 1 : k === 1 ? -1 : 0);
      const ny = c.y + (k === 2 ? 1 : k === 3 ? -1 : 0);
      if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue;
      if (grid[ny][nx] !== 0) continue;
      const key = nx + "," + ny;
      if (seen.has(key)) continue;
      seen.add(key);
      q.push({ x: nx, y: ny });
    }
  }
  return seen;
}

// ---------- Level 4：废弃办公室 ----------
// 现代化的废弃办公建筑：白色混凝土墙 + 廉价的灰色地毯，被窗外透进来的光照亮。
// 房间按设定分成四类：会议室 20% / 空房 45% / 办公隔间 5% / 咖啡厅与休息室 30%。
function generateOfficeMap(level) {
  const size = mapSizeFor(level);
  const built = buildRoomLayer(size, { roomW: [5, 10], roomH: [5, 9], density: 1.5, startRoom: 9 });
  const grid = built.grid;
  const rooms = built.rooms;
  const start = { x: Math.floor(size / 2), y: Math.floor(size / 2), floor: 0 };
  const floors = collectFloors(grid, size);
  // 房间层偶尔会留下走不到的死角（整间房没开门、或墙缝里剩了一格地板）。
  // 这类格子玩家进不去，凑近了却是一片画不出来的黑区 —— 全局兜底一次把它们接回主区。
  if (grid[start.y] && grid[start.y][start.x] === 0) ensureAllConnected(grid, size, start);
  else if (floors.length) ensureAllConnected(grid, size, { x: floors[0].x, y: floors[0].y });

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [rooms],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props: [], crates: [], ground: [],
    windows: new Set(),     // 透光的窗 —— 其中一部分是"窗"实体的伪装
    stairwell: null,        // 下沉的、砖墙混凝土地板的楼梯井 -> Level 3
    elevator: null,         // 电梯 -> Level 5
  };
  makeDoorsMap(map);

  const dist0 = (x, y) => Math.hypot(x - start.x, y - start.y);
  const used = new Set();
  const free = (r, minD) => {
    for (let i = 0; i < 60; i++) {
      const x = randInt(r.x, r.x + r.w - 1), y = randInt(r.y, r.y + r.h - 1);
      if (grid[y][x] !== 0) continue;
      const k = x + "," + y;
      if (used.has(k)) continue;
      if (dist0(x, y) < minD) continue;
      used.add(k);
      return { x, y };
    }
    return null;
  };

  // 1) 房间类型（按设定比例）；中央那间当休息室
  for (const r of rooms) {
    const roll = Math.random();
    r.officeType = r.start ? "cafe" : (roll < 0.20 ? "meeting" : roll < 0.65 ? "empty" : roll < 0.70 ? "cubicle" : "cafe");
  }

  // 2) 房间里的陈设与物资
  for (const r of rooms) {
    const t = r.officeType;
    if (t === "meeting") {
      // 会议室：一张尺寸精确统一的长桌 + 一圈椅子；桌上常有纸笔和杯装杏仁水
      const p = free(r, 0);
      if (p) map.props.push({ x: p.x, y: p.y, floor: 0, type: "longtable" });
      for (let i = 0; i < 3; i++) {
        const q = free(r, 0);
        if (q) map.props.push({ x: q.x, y: q.y, floor: 0, type: "chair" });
      }
      if (Math.random() < 0.7) {
        const q = free(r, 0);
        if (q) map.ground.push({ x: q.x, y: q.y, floor: 0, item: "almond", taken: false });
      }
    } else if (t === "empty") {
      // 空房：真正的"空"，只有板条箱 —— 但箱子附近常有窃皮者潜伏
      const n = randInt(1, 3);
      for (let i = 0; i < n; i++) {
        const q = free(r, 0);
        if (!q) continue;
        if (Math.random() < 0.45) {
          map.crates.push({ x: q.x, y: q.y, floor: 0, opened: false, loot: Math.random() < 0.6 ? randInt(1, 2) : 0 });
        } else {
          map.props.push({ x: q.x, y: q.y, floor: 0, type: "brokenCrate" });
        }
      }
    } else if (t === "cubicle") {
      // 办公隔间：最稀有也最有价值 —— 隔间成群出现，有电脑、便利贴和半杯杏仁水
      const n = randInt(3, 7);
      for (let i = 0; i < n; i++) {
        const q = free(r, 0);
        if (q) map.props.push({ x: q.x, y: q.y, floor: 0, type: "cubicle" });
      }
      for (let i = 0; i < 2; i++) {
        const q = free(r, 0);
        if (q) map.ground.push({ x: q.x, y: q.y, floor: 0, item: "almond", taken: false });
      }
    } else {
      // 咖啡厅与休息室：大而空，偶尔有瓶装杏仁水
      const n = randInt(2, 4);
      for (let i = 0; i < n; i++) {
        const q = free(r, 0);
        if (q) map.props.push({ x: q.x, y: q.y, floor: 0, type: "chair" });
      }
      const q2 = free(r, 0);
      if (q2) map.props.push({ x: q2.x, y: q2.y, floor: 0, type: "table" });
      if (Math.random() < 0.8) {
        const q = free(r, 0);
        if (q) map.ground.push({ x: q.x, y: q.y, floor: 0, item: "almond", taken: false });
      }
    }
  }

  // 2.5) 还能开机的电脑
  //   办公隔间里最该有工位 —— 但整层只放一两台的话，在这么大的办公楼里等于没有，
  //   所以隔间房必放，其余房间再随机补几台，至少保证有两台。
  //   它是订购赫尔墨斯装置的唯一途径（浏览器能打开的那个邮箱）。
  {
    const pcRooms = rooms.filter((r) => r.officeType === "cubicle");
    const order = rooms.slice();
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t2 = order[i]; order[i] = order[j]; order[j] = t2;
    }
    let placed = 0;
    for (const r of pcRooms) {
      const p = free(r, 0);
      if (p) { map.props.push({ x: p.x, y: p.y, floor: 0, type: "pc4" }); placed++; }
    }
    for (const r of order) {
      if (placed >= 5) break;
      if (pcRooms.indexOf(r) >= 0) continue;
      if (Math.random() > 0.35) continue;
      const p = free(r, 0);
      if (p) { map.props.push({ x: p.x, y: p.y, floor: 0, type: "pc4" }); placed++; }
    }
    // 兜底：一台都没放上就等于整条订购链断了 —— 硬塞两台到出生点那间房
    if (placed === 0) {
      for (const r of rooms) {
        if (placed >= 2) break;
        const p = free(r, 0);
        if (p) { map.props.push({ x: p.x, y: p.y, floor: 0, type: "pc4" }); placed++; }
      }
    }
    map.pcs4 = (map.props || []).filter((p) => p.type === "pc4").map((p) => ({ x: p.x, y: p.y, floor: 0 }));
  }

  // 3) 透光的窗：沿房间外墙开，其中一部分是"窗"实体的伪装（致命）
  for (const r of rooms) {
    const edges = [];
    for (let x = r.x; x < r.x + r.w; x++) { edges.push({ x, y: r.y - 1 }); edges.push({ x, y: r.y + r.h }); }
    for (let y = r.y; y < r.y + r.h; y++) { edges.push({ x: r.x - 1, y }); edges.push({ x: r.x + r.w, y }); }
    for (const e of edges) {
      if (e.x < 1 || e.y < 1 || e.x >= size - 1 || e.y >= size - 1) continue;
      if (grid[e.y][e.x] !== 1) continue;                       // 只开在墙上
      // Level 4 是安全层级：窗本来就该是"偶尔遇到"的东西，不是走两步就撞上。
      // 以前 0.22 的密度让每个房间外墙都排满窗，站在屋里必然在影响范围内 ——
      // 于是莫名其妙地一直掉血掉理智。
      if (Math.random() > 0.07) continue;
      map.windows.add(e.x + "," + e.y);
    }
  }

  // ---- 通往草地：不是"一块绿色的地板"，而是一整片草地 ----
  // 连围墙都是草，整片罩在不散的黑雾里。走进雾里就切出 Level 10。
  {
    const GW = 11, GH = 11;
    const fixedGrass = levelBuildings(4);
    let gx0 = -1, gy0 = -1;
    if (fixedGrass && fixedGrass.grass) {
      const t = relToTiles(fixedGrass.grass, size);
      gx0 = Math.min(t.x, size - GW - 3);
      gy0 = Math.min(t.y, size - GH - 3);
    }
    for (let a = 0; a < 400 && gx0 < 0; a++) {
      const cx2 = randInt(4, Math.max(5, size - GW - 5));
      const cy2 = randInt(4, Math.max(5, size - GH - 5));
      if (Math.hypot(cx2 + GW / 2 - start.x, cy2 + GH / 2 - start.y) < 18) continue;
      if (cx2 < 3 || cy2 < 3 || cx2 + GW >= size - 3 || cy2 + GH >= size - 3) continue;
      gx0 = cx2; gy0 = cy2;
    }
    if (gx0 >= 0 && gy0 >= 0) {
      const grass = new Set(), grassWall = new Set();
      for (let y = gy0 - 1; y <= gy0 + GH; y++) {
        for (let x = gx0 - 1; x <= gx0 + GW; x++) {
          if (x < 1 || y < 1 || x >= size - 1 || y >= size - 1) continue;
          const edge = (y === gy0 - 1 || y === gy0 + GH || x === gx0 - 1 || x === gx0 + GW);
          if (!edge) continue;
          grid[y][x] = 1;
          grassWall.add(x + "," + y);
        }
      }
      for (let y = gy0; y < gy0 + GH; y++) {
        for (let x = gx0; x < gx0 + GW; x++) {
          grid[y][x] = 0;
          grass.add(x + "," + y);
        }
      }
      // 入口：朝向地图中心那一面开一个 3 格宽的口，再挖通到能走的地方
      const toCenter = (start.x > gx0 + GW / 2) ? 1 : -1;
      const oy = gy0 + Math.floor(GH / 2);
      const ox = toCenter > 0 ? gx0 + GW : gx0 - 1;
      for (let k = -1; k <= 1; k++) {
        const gy2 = oy + k;
        if (gy2 < 1 || gy2 >= size - 1 || ox < 1 || ox >= size - 1) continue;
        grid[gy2][ox] = 0;
        grassWall.delete(ox + "," + gy2);
        grass.add(ox + "," + gy2);
        let cx = ox + toCenter, n = 0;
        while (n < 30) {
          if (cx < 1 || cx >= size - 1) break;
          if (grid[gy2][cx] === 0) break;
          grid[gy2][cx] = 0;
          cx += toCenter; n++;
        }
      }
      map.grass = grass;
      map.grassWall = grassWall;
      map.grassEntry = { x: ox - toCenter, y: oy };   // 入口外侧那一格
      map.grassZone = { x: gx0, y: gy0, w: GW, h: GH };
      map.grassFog = { x: gx0 + Math.floor(GW / 2), y: gy0 + Math.floor(GH / 2), floor: 0 };
    } else {
      const cands = floors.filter((t) => Math.hypot(t.x - start.x, t.y - start.y) > 12);
      const t = cands.length ? cands[randInt(0, cands.length - 1)] : null;
      if (t) {
        map.props.push({ x: t.x, y: t.y, floor: 0, type: "fieldpath" });
        map.fieldPath = { x: t.x, y: t.y };
        map.grass = new Set([t.x + "," + t.y]);
      }
    }
  }

  // 草地那圈草墙是整片铺上去的，会顺手切断原本通着的房间（比如它右边那一间），
  // 于是那间房就变成了走不到的死角。铺完草地再兜一次底，把它们重新接回主区。
  if (grid[start.y] && grid[start.y][start.x] === 0) ensureAllConnected(grid, size, start);

  // 4) 楼梯井（-> Level 3）与电梯（-> Level 5）：都放在离出生点够远的地方
  // 草地那一片（含它外圈的草墙）不能放电梯 —— 电梯被草墙圈在里面就永远进不去，
  // 于是"通往 Level 5"这条路直接废掉。
  const inGrass = (t) => {
    const k = t.x + "," + t.y;
    return (map.grass && map.grass.has(k)) || (map.grassWall && map.grassWall.has(k));
  };
  const gz0 = map.grassZone;
  const nearGrass = (t) => {
    if (!gz0) return false;
    return t.x >= gz0.x - 3 && t.x <= gz0.x + gz0.w + 3 && t.y >= gz0.y - 3 && t.y <= gz0.y + gz0.h + 3;
  };
  const far = floors.filter((t) => dist0(t.x, t.y) > 14 && !inGrass(t) && !nearGrass(t));
  if (far.length) {
    const a = far[randInt(0, far.length - 1)];
    map.stairwell = { x: a.x, y: a.y, floor: 0 };
    let b = null;
    for (let i = 0; i < 200; i++) {
      const t = far[randInt(0, far.length - 1)];
      if (Math.hypot(t.x - a.x, t.y - a.y) > 12) { b = t; break; }
    }
    map.elevator = { x: (b || a).x, y: (b || a).y, floor: 0 };
  } else {
    map.stairwell = { x: start.x + 3, y: start.y, floor: 0 };
    map.elevator = { x: start.x - 3, y: start.y, floor: 0 };
  }
  used.add(map.stairwell.x + "," + map.stairwell.y);
  used.add(map.elevator.x + "," + map.elevator.y);

  // 5) 撬棍：办公室里偶尔能翻到（撬开板条箱要用）
  for (let i = 0; i < 2; i++) {
    const t = floors[randInt(0, floors.length - 1)];
    if (!t) break;
    const k = t.x + "," + t.y;
    if (used.has(k)) continue;
    if (dist0(t.x, t.y) < 8) continue;
    used.add(k);
    map.ground.push({ x: t.x, y: t.y, floor: 0, item: "crowbar", taken: false });
  }

  return map;
}

// ---------- Level 3：发电站 ----------
// 长而黑暗的曲折走廊：用 1 格宽的迷宫走廊 + 若干电力房构成，
// 走廊里散布锈死的监狱铁栅栏（拆不掉、过不去），墙上盘着铜管，地面是灰瓷砖。
function generatePowerStationMap(level) {
  const size = mapSizeFor(level) | 1;          // 取奇数，迷宫才整齐
  const grid = makeGrid(size);
  const n = Math.floor(size / 2);

  // 1) 迷宫：奇数格是走廊，打通相邻格之间的墙 —— 走廊又窄又封闭
  const seen = [];
  for (let i = 0; i < n; i++) seen.push(new Array(n).fill(false));
  const ci = Math.floor(n / 2), cj = Math.floor(n / 2);
  const stack = [{ i: ci, j: cj }];
  seen[cj][ci] = true;
  grid[cj * 2 + 1][ci * 2 + 1] = 0;
  while (stack.length) {
    const c = stack[stack.length - 1];
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (let k = dirs.length - 1; k > 0; k--) {
      const r = randInt(0, k); const t = dirs[k]; dirs[k] = dirs[r]; dirs[r] = t;
    }
    let moved = false;
    for (const d of dirs) {
      const ni = c.i + d[0], nj = c.j + d[1];
      if (ni < 0 || nj < 0 || ni >= n || nj >= n) continue;
      if (seen[nj][ni]) continue;
      seen[nj][ni] = true;
      grid[nj * 2 + 1][ni * 2 + 1] = 0;
      grid[c.j * 2 + 1 + d[1]][c.i * 2 + 1 + d[0]] = 0;   // 打通中间的墙
      stack.push({ i: ni, j: nj });
      moved = true;
      break;
    }
    if (!moved) stack.pop();
  }

  // 2) 打通一些墙形成环路，避免整张图是死胡同的完美迷宫
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      if (grid[y][x] !== 1) continue;
      if (Math.random() > 0.12) continue;
      const lr = grid[y][x - 1] === 0 && grid[y][x + 1] === 0;
      const ud = grid[y - 1][x] === 0 && grid[y + 1][x] === 0;
      if (lr && !ud) grid[y][x] = 0;
      else if (ud && !lr) grid[y][x] = 0;
    }
  }

  // 3) 电力房：几间被完全挖开的房间，里面摆着发电机
  const rooms = [];
  const powerCount = 5;
  for (let k = 0; k < powerCount * 40 && rooms.length < powerCount; k++) {
    const w = randInt(4, 6), h = randInt(3, 5);
    const rx = randInt(2, size - w - 3), ry = randInt(2, size - h - 3);
    let ok = true;
    for (const r of rooms) {
      if (Math.abs(r.x + r.w / 2 - (rx + w / 2)) < (r.w + w) / 2 + 2 &&
          Math.abs(r.y + r.h / 2 - (ry + h / 2)) < (r.h + h) / 2 + 2) { ok = false; break; }
    }
    if (!ok) continue;
    for (let yy = ry; yy < ry + h; yy++) for (let xx = rx; xx < rx + w; xx++) grid[yy][xx] = 0;
    rooms.push({ x: rx, y: ry, w, h, power: true, start: false });
  }

  // 4) 地板列表 / 出生点
  const floors = [];
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) if (grid[y][x] === 0) floors.push({ x, y });
  }
  const start = { x: ci * 2 + 1, y: cj * 2 + 1, floor: 0 };
  grid[start.y][start.x] = 0;

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [rooms],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null,
    bars: new Set(),        // 监狱铁栅栏（锈死，拆不掉）
    leaks: new Set(),       // 管道漏出的黑色粘稠液体（有毒）
    elevator: null,         // 电梯（切入点附近，上锁 + 要电）
    powerRoom: null,        // 电力室（里面有电梯电力开关）
    switchOn: false,
  };
  makeDoorsMap(map);

  const dist = (x, y) => Math.hypot(x - start.x, y - start.y);
  const isFloor = (x, y) => x >= 0 && y >= 0 && x < size && y < size && grid[y][x] === 0;

  // 5) 电梯：就在切入点附近
  for (let i = 0; i < 600; i++) {
    const t = floors[randInt(0, floors.length - 1)];
    if (!t) break;
    const d = dist(t.x, t.y);
    if (d < 4 || d > 10) continue;
    map.elevator = { x: t.x, y: t.y };
    break;
  }
  if (!map.elevator) map.elevator = { x: start.x + 4, y: start.y };

  // 6) 电力室：离出生点最远的那间电力房（里面有电梯电力开关）
  let best = null, bd = -1;
  for (const r of rooms) {
    const d = dist(r.x + r.w / 2, r.y + r.h / 2);
    if (d > bd) { bd = d; best = r; }
  }
  if (best) {
    map.powerRoom = {
      x: best.x, y: best.y, w: best.w, h: best.h,
      sx: Math.floor(best.x + best.w / 2), sy: best.y + 1,   // 开关贴在房间上沿
    };
  } else {
    map.powerRoom = { x: start.x, y: start.y, w: 3, h: 3, sx: start.x, sy: start.y };
  }

  // 7) 监狱铁栅栏：只放在"拆掉也不会把关键地点封死"的走廊上
  const need = [map.elevator, { x: map.powerRoom.sx, y: map.powerRoom.sy }];
  const baseReach = bfsCount(grid, size, start);
  const cand = [];
  for (const t of floors) {
    if (dist(t.x, t.y) < 8) continue;
    const lr = isFloor(t.x - 1, t.y) && isFloor(t.x + 1, t.y) &&
               !isFloor(t.x, t.y - 1) && !isFloor(t.x, t.y + 1);
    const ud = isFloor(t.x, t.y - 1) && isFloor(t.x, t.y + 1) &&
               !isFloor(t.x - 1, t.y) && !isFloor(t.x + 1, t.y);
    if (lr || ud) cand.push({ x: t.x, y: t.y, dir: lr ? "v" : "h" });
  }
  for (let i = cand.length - 1; i > 0; i--) {
    const j = randInt(0, i); const t = cand[i]; cand[i] = cand[j]; cand[j] = t;
  }
  let made = 0;
  for (const c of cand) {
    if (made >= Math.floor(size / 6)) break;
    grid[c.y][c.x] = 1;                                   // 先临时封死，验证连通性
    const cut = bfsCount(grid, size, start);
    // 允许把一部分区域彻底封死（这正是铁栅栏的设定），但关键地点必须还走得到
    let ok = cut >= baseReach * 0.62;
    if (ok) for (const q of need) if (!bfsHas(grid, size, start, q)) { ok = false; break; }
    if (ok) { map.bars.add(c.x + "," + c.y + "|" + c.dir); made++; }
    else grid[c.y][c.x] = 0;                              // 会把路封死就撤销
  }
  // bars 里存的是 "x,y|dir"，另建一份纯坐标集合用于碰撞
  const barSet = new Set();
  for (const k of map.bars) barSet.add(k.split("|")[0]);
  map.bars = barSet;
  // 铁栅栏挡路，所以要从可通行地板列表里剔除
  map.floors = [floors.filter((t) => !barSet.has(t.x + "," + t.y))];

  // 8) 管道漏液：随机一些走廊格上有黑色粘稠液体
  for (const t of floors) {
    if (barSet.has(t.x + "," + t.y)) continue;
    if (Math.random() < 0.035) map.leaks.add(t.x + "," + t.y);
  }

  // 9) 倾斜的楼梯井：发霉的地毯、砖墙与混凝土地板 —— 走下去是 Level 4
  //    （电梯通往 Level 5，这里是通往 Level 4 的另一条路）
  {
    const reachable = reachableFrom(map, 0, { x: start.x, y: start.y });
    for (let i = 0; i < 900; i++) {
      const t = floors[randInt(0, floors.length - 1)];
      if (!t) break;
      if (barSet.has(t.x + "," + t.y)) continue;
      if (!reachable.has(t.x + "," + t.y)) continue;
      const d = Math.hypot(t.x - start.x, t.y - start.y);
      if (d < 12 || d > 26) continue;
      const d2 = addDoor(map, [{ x: t.x, y: t.y, dir: "h" }], 0, "stair4", { dir: "h" });
      if (d2) { d2.toLevel = 4; map.stair4 = d2; }
      break;
    }
  }

  spawnSupplies(map, level);
  dropBag(map, level);
  return map;
}

// 从某点出发能走到的地板数（临时封路时用）
function bfsCount(grid, size, from) {
  const seen = new Set([from.x + "," + from.y]);
  const q = [from];
  while (q.length) {
    const c = q.pop();
    for (let k = 0; k < 4; k++) {
      const nx = c.x + (k === 0 ? 1 : k === 1 ? -1 : 0);
      const ny = c.y + (k === 2 ? 1 : k === 3 ? -1 : 0);
      if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue;
      if (grid[ny][nx] !== 0) continue;
      const key = nx + "," + ny;
      if (seen.has(key)) continue;
      seen.add(key);
      q.push({ x: nx, y: ny });
    }
  }
  return seen.size;
}

function bfsHas(grid, size, from, goal) {
  if (!goal) return false;
  const target = goal.x + "," + goal.y;
  if (grid[goal.y] && grid[goal.y][goal.x] !== 0) return false;
  const seen = new Set([from.x + "," + from.y]);
  const q = [from];
  while (q.length) {
    const c = q.pop();
    if (c.x + "," + c.y === target) return true;
    for (let k = 0; k < 4; k++) {
      const nx = c.x + (k === 0 ? 1 : k === 1 ? -1 : 0);
      const ny = c.y + (k === 2 ? 1 : k === 3 ? -1 : 0);
      if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue;
      if (grid[ny][nx] !== 0) continue;
      const key = nx + "," + ny;
      if (seen.has(key)) continue;
      seen.add(key);
      q.push({ x: nx, y: ny });
    }
  }
  return false;
}

// ---------- Level 2+：管道梦魇（大幅扩大的隧道网） ----------
function generateTunnelMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);

  // 隧道宽度：以前只有 2 格，转身都费劲，还要躲实体 —— 加宽到 3 格
  const W = 3;
  const setFloor = (x, y) => {
    if (x < 1 || y < 1 || x > size - 1 - W || y > size - 1 - W) return false;
    for (let dy = 0; dy < W; dy++) for (let dx = 0; dx < W; dx++) grid[y + dy][x + dx] = 0;
    return true;
  };

  const start = { x: Math.floor(size / 2), y: Math.floor(size / 2), floor: 0 };
  setFloor(start.x, start.y);

  const dx = [1, 0, -1, 0], dy = [0, 1, 0, -1];
  const points = [{ x: start.x, y: start.y }];
  const targetSegments = Math.floor(size * 0.7);
  let segments = 0, guard = 0;
  while (points.length > 0 && segments < targetSegments && guard < 40000) {
    guard++;
    const i = randInt(0, points.length - 1);
    const p = points[i];
    points.splice(i, 1);
    const dir = randInt(0, 3);
    const len = randInt(6, 15);
    let cx = p.x, cy = p.y;
    let advanced = 0;
    for (let s = 0; s < len; s++) {
      cx += dx[dir]; cy += dy[dir];
      if (!setFloor(cx, cy)) break;
      advanced++;
      if (s % 4 === 3) points.push({ x: cx, y: cy });
    }
    if (advanced >= 4) segments++;
    if (points.length > 80) points.splice(0, points.length - 80);
  }

  const floors = collectFloors(grid, size);
  const exit = Object.assign(farthestFloor(floors, start), { floor: 0 });

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [[]],
    // Level 2 没有绿色出口门了 —— 出路只有那扇未上锁的铁栅栏门（-> Level 3）
    start, exit: null, doors: [], ramps: [], redFloor: new Set(), transit: null,
  };
  makeDoorsMap(map);

  // 检修门：横跨整条 2 格宽隧道的双开门，关上就彻底封死这段管道
  const tries = Math.floor(size * 0.9);
  let made = 0;
  for (let i = 0; i < tries && made < Math.floor(size / 11); i++) {
    const t = floors[randInt(0, floors.length - 1)];
    if (!t) break;
    if (Math.hypot(t.x - start.x, t.y - start.y) < 10) continue;
    if (t.x === exit.x && t.y === exit.y) continue;
    const gv = (x, y) => (x < 0 || y < 0 || x >= size || y >= size) ? 1 : grid[y][x];
    // 南北向隧道：门横跨 x..x+W-1 整排（左右必须是墙，上下至少一侧可通行）
    let vertOK = true;
    for (let k = 0; k < W; k++) if (gv(t.x + k, t.y) !== 0) { vertOK = false; break; }
    if (vertOK && (gv(t.x - 1, t.y) !== 1 || gv(t.x + W, t.y) !== 1)) vertOK = false;
    if (vertOK && gv(t.x, t.y - 1) !== 0 && gv(t.x, t.y + 1) !== 0) vertOK = false;
    // 东西向隧道
    let horizOK = true;
    for (let k = 0; k < W; k++) if (gv(t.x, t.y + k) !== 0) { horizOK = false; break; }
    if (horizOK && (gv(t.x, t.y - 1) !== 1 || gv(t.x, t.y + W) !== 1)) horizOK = false;
    if (horizOK && gv(t.x - 1, t.y) !== 0 && gv(t.x + 1, t.y) !== 0) horizOK = false;
    if (!vertOK && !horizOK) continue;
    const tiles = [];
    for (let k = 0; k < W; k++) tiles.push(vertOK ? { x: t.x + k, y: t.y } : { x: t.x, y: t.y + k });
    addDoor(map, tiles, 0, "normal", { dir: vertOK ? "h" : "v" });
    made++;
  }

  // Level 2 -> Level 3：一扇未上锁的铁栅栏门（穿过它就切进发电站）
  // 隧道有 2 格宽，所以这道栅栏也横跨 2 格，才真的把走廊封住
  {
    const gv2 = (x, y) => (x < 0 || y < 0 || x >= size || y >= size) ? 1 : grid[y][x];
    let done = false;
    for (let i = 0; i < 900 && !done; i++) {
      const t = floors[randInt(0, floors.length - 1)];
      if (!t) break;
      if (Math.hypot(t.x - start.x, t.y - start.y) < 14) continue;
      if (exit && t.x === exit.x && t.y === exit.y) continue;
      const W2 = 3;
      let vertOK = true;
      for (let k = 0; k < W2; k++) if (gv2(t.x + k, t.y) !== 0) { vertOK = false; break; }
      if (vertOK && (gv2(t.x - 1, t.y) !== 1 || gv2(t.x + W2, t.y) !== 1)) vertOK = false;
      if (vertOK && gv2(t.x, t.y - 1) !== 0 && gv2(t.x, t.y + 1) !== 0) vertOK = false;
      let horizOK = true;
      for (let k = 0; k < W2; k++) if (gv2(t.x, t.y + k) !== 0) { horizOK = false; break; }
      if (horizOK && (gv2(t.x, t.y - 1) !== 1 || gv2(t.x, t.y + W2) !== 1)) horizOK = false;
      if (horizOK && gv2(t.x - 1, t.y) !== 0 && gv2(t.x + 1, t.y) !== 0) horizOK = false;
      if (!vertOK && !horizOK) continue;
      const tiles = [];
      for (let k = 0; k < W2; k++) tiles.push(vertOK ? { x: t.x + k, y: t.y, dir: "h" } : { x: t.x, y: t.y + k, dir: "v" });
      const d = addDoor(map, tiles, 0, "grate3", { dir: vertOK ? "h" : "v", unlocked: true });
      if (d) { d.toLevel = 3; map.grate3 = d; done = true; }
    }
    // 兜底：实在找不到横跨两格的位置，就放一格的栅栏，保证一定有路去 Level 3
    if (!done) {
      for (let i = 0; i < 600 && !done; i++) {
        const t = floors[randInt(0, floors.length - 1)];
        if (!t) break;
        if (Math.hypot(t.x - start.x, t.y - start.y) < 14) continue;
        const d = addDoor(map, [{ x: t.x, y: t.y, dir: "h" }], 0, "grate3",
          { dir: "h", unlocked: true });
        if (d) { d.toLevel = 3; map.grate3 = d; done = true; }
      }
    }
  }

  spawnSupplies(map, level);
  dropBag(map, level);
  return map;
}

// ---------- 网格查询（带楼层） ----------
function layerGrid(map, floor) {
  const f = Math.min(floor | 0, map.layers.length - 1);
  return map.layers[f < 0 ? 0 : f];
}

function floorList(map, floor) {
  const f = Math.min(floor | 0, map.floors.length - 1);
  // Level 14 是无限的：只有当前窗口里的地面存在，走出窗口就被删掉了
  if (map.infinite) return infiniteFloorList(map);
  return map.floors[f < 0 ? 0 : f];
}

// 无限层级：返回以玩家为中心、半径 winR 内的一圈地板格。
// 内容一变（平移 / 增删）就 bump map.gen，缓存随之失效。
function infiniteFloorList(map) {
  if (map._flCache && map._flGen === map.gen) return map._flCache;
  const c = map.winCenter || { x: map.size >> 1, y: map.size >> 1 };
  const R = map.winR || 24;
  const out = [];
  for (let y = c.y - R; y <= c.y + R; y++) {
    if (y < 0 || y >= map.size) continue;
    for (let x = c.x - R; x <= c.x + R; x++) {
      if (x < 0 || x >= map.size) continue;
      out.push({ x, y });
    }
  }
  map._flCache = out;
  map._flGen = map.gen;
  return out;
}

// 从某格出发能走到的地板格（关闭的门算可通行 —— 玩家能推开）
// 用来保证档案/实体不会刷在"根本走不到"的地方。
function reachableFrom(map, floor, from) {
  const grid = layerGrid(map, floor);
  const size = map.size;
  const seen = new Set();
  if (!grid || !from) return seen;
  seen.add(from.x + "," + from.y);
  const q = [from];
  while (q.length) {
    const c = q.pop();
    for (let k = 0; k < 4; k++) {
      const nx = c.x + (k === 0 ? 1 : k === 1 ? -1 : 0);
      const ny = c.y + (k === 2 ? 1 : k === 3 ? -1 : 0);
      if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue;
      if (grid[ny][nx] !== 0) continue;
      if (isBar(map, nx, ny, floor)) continue;      // 铁栅栏过不去
      const key = nx + "," + ny;
      if (seen.has(key)) continue;
      seen.add(key);
      q.push({ x: nx, y: ny });
    }
  }
  return seen;
}

// 是否落在斜坡（斜着的正方形地面）上 —— 档案刷在这会跟着反复切层
function onRamp(map, tx, ty) {
  if (!map.ramps) return false;
  for (const r of map.ramps) if (rampContains(r, tx, ty)) return true;
  return false;
}

function gridAt(map, tx, ty, floor) {
  // Level 7：北面那块通往 Level 29 的陆地 —— 不管落在图里还是图外，都能踩上去
  if (map && map.land29 && map.land29.has(tx + "," + ty)) return 0;
  if (tx < 0 || ty < 0 || tx >= map.size || ty >= map.size) {
    // Level 7：海面向北是望不到边的 —— 出了地图上边界，脚下仍然是一整片海。
    // 不是一进层就生成一张巨大的图（那样一上来就把内存占满了），
    // 而是让这一片"按需存在"：你走到哪儿，哪儿才需要一格海。
    if (ty < 0 && map && map.openNorth && tx >= map.openNorth.x1 && tx <= map.openNorth.x2) return 0;
    return 1;
  }
  return layerGrid(map, floor || 0)[ty][tx];
}

// 关闭的门也算障碍
function isClosedDoor(map, tx, ty, floor) {
  return map.closedDoors.has((floor | 0) + ":" + tx + "," + ty);
}

// 是否阻挡（墙 或 关闭的门）
// 挡视线的东西：墙 + 关闭的门（不含监狱铁栅栏 —— 那玩意儿看得穿，过不去）
function blocksSight(map, tx, ty, floor) {
  return gridAt(map, tx, ty, floor) === 1 || isClosedDoor(map, tx, ty, floor);
}

function solidAt(map, tx, ty, floor) {
  return blocksSight(map, tx, ty, floor) || isBar(map, tx, ty, floor) || isAirWall(map, tx, ty);
}

// 空气墙：看得见（画成地面 / 空洞），但走不进去。用于"没有围栏的坑洞"这类地方。
function isAirWall(map, tx, ty) {
  if (!map || !map.airWalls) return false;
  return map.airWalls.has(tx + "," + ty);
}

// 监狱铁栅栏：锈死的铁栏，任何手段都拆不掉、打不开
function isBar(map, tx, ty, floor) {
  if (!map.bars || (floor | 0) !== 0) return false;
  return map.bars.has(tx + "," + ty);
}

// ---------- 补给：补给箱 / 杏仁水 / 撬棍 ----------
// Level 0 与 Level 0.2 内没有任何杏仁水（设定如此），Level 1 靠箱子，Level 2 只有污染杏仁水。
//   crates：补给箱，需要撬棍撬开，开箱后按 loot 产出杏仁水（loot=0 就是空箱）
//   props ：场景装饰（破损的箱子 / 桌子），撬棍会直接摆在它们上面，走过去就能拿
//   ground：散落在地上的物品（Level 2 的污染杏仁水）
function spawnSupplies(map, level) {
  map.crates = [];
  map.props = [];
  map.ground = [];
  if (level !== 1 && level !== 2 && level !== 3) return;

  const size = map.size;
  const floors = map.doubleStory ? [0, 1] : [0];

  for (const f of floors) {
    const reach = reachableFrom(map, f, { x: map.start.x, y: map.start.y });
    const used = new Set();
    for (const d of map.doors) {
      if ((d.floor | 0) !== f) continue;
      for (const t of d.tiles) used.add(t.x + "," + t.y);
    }
    const spot = (minDist, room) => {
      for (let i = 0; i < 200; i++) {
        const t = room
          ? { x: randInt(room.x, room.x + room.w - 1), y: randInt(room.y, room.y + room.h - 1) }
          : floorList(map, f)[randInt(0, floorList(map, f).length - 1)];
        if (!t) break;
        const key = t.x + "," + t.y;
        if (used.has(key)) continue;
        if (!reach.has(key)) continue;                    // 走不到的地方不放
        if (isClosedDoor(map, t.x, t.y, f)) continue;
        if (onRamp(map, t.x, t.y)) continue;              // 斜坡上不放（会跟着切层）
        if (Math.hypot(t.x - map.start.x, t.y - map.start.y) < minDist) continue;
        used.add(key);
        return { x: t.x, y: t.y };
      }
      return null;
    };

    if (level === 1) {
      // 房间里 40% 会有补给箱
      const rooms = map.rooms[f] || [];
      let crates = 0;
      for (const r of rooms) {
        if (r.start) continue;
        if (Math.random() > 0.4) continue;   // 40%
        const p = spot(6, r);
        if (!p) continue;
        // 箱子里：60% 有 1~2 瓶，5% 有 3~4 瓶，35% 是空箱
        const roll = Math.random();
        let loot;
        if (roll < 0.6) loot = randInt(1, 2);
        else if (roll < 0.65) loot = randInt(3, 4);
        else loot = 0;
        map.crates.push({ x: p.x, y: p.y, floor: f, opened: false, loot });
        crates++;
      }
      // 场景装饰：破损的箱子 / 桌子（撬棍就摆在它们上面）
      const propN = Math.max(2, Math.floor(size / 14));
      for (let i = 0; i < propN; i++) {
        const p = spot(5, null);
        if (!p) continue;
        map.props.push({
          x: p.x, y: p.y, floor: f,
          type: Math.random() < 0.5 ? "brokenCrate" : "table",
        });
      }
      // Level 1 是"宜居地带" —— 改装成停车场之后房间变少了，箱子也跟着没了。
      // 这里补回来：空地上再散一批箱子，外加直接摆在地面上的杏仁水，
      // 不然玩家还没走到 Level 2、Level 3（物资稀少）就已经没水喝了。
      const extraCrate = Math.max(6, Math.floor(size / 8));
      for (let i = 0; i < extraCrate; i++) {
        const p = spot(7, null);
        if (!p) continue;
        const roll = Math.random();
        let loot;
        if (roll < 0.6) loot = randInt(1, 2);
        else if (roll < 0.65) loot = randInt(3, 4);
        else loot = 0;
        map.crates.push({ x: p.x, y: p.y, floor: f, opened: false, loot });
        crates++;
      }
      // 地面上直接散落的杏仁水（不用撬棍，走过去就能捡）
      const looseN = Math.max(6, Math.floor(size / 9));
      for (let i = 0; i < looseN; i++) {
        const p = spot(8, null);
        if (!p) continue;
        map.ground.push({ x: p.x, y: p.y, floor: f, item: "almond", taken: false });
      }
      // 撬棍：有箱子就至少保证有一把（否则箱子永远打不开）
      const bars = crates > 0 ? Math.max(2, Math.min(4, Math.round(crates / 3) + 1)) : randInt(1, 2);
      const holders = map.props.filter((p) => p.floor === f).slice().sort(() => Math.random() - 0.5);
      for (let i = 0; i < bars; i++) {
        const h = holders[i % holders.length];
        const at = h || spot(5, null);
        if (!at) continue;
        map.ground.push({ x: at.x, y: at.y, floor: f, item: "crowbar", taken: false });
      }
    } else if (level === 2) {
      // Level 2：只有受污染的杏仁水，直接散落在管道之间
      const n = Math.max(6, Math.floor(size / 7));
      for (let i = 0; i < n; i++) {
        const p = spot(8, null);
        if (!p) continue;
        map.ground.push({ x: p.x, y: p.y, floor: f, item: "bad", taken: false });
      }
    } else {
      // Level 3：物资丰富 —— 地面 / 物资箱 / 桌子上都有杏仁水，
      // 墙壁旁能捡到撬棍；其中一部分瓶子不满、浑浊（那就是受污染的杏仁水）。
      const nCrate = Math.floor(size / 8);
      for (let i = 0; i < nCrate; i++) {
        const p = spot(7, null);
        if (!p) continue;
        const roll = Math.random();
        let loot;
        if (roll < 0.6) loot = randInt(1, 2);
        else if (roll < 0.65) loot = randInt(3, 4);
        else loot = 0;
        map.crates.push({ x: p.x, y: p.y, floor: f, opened: false, loot });
      }
      const nProp = Math.floor(size / 9);
      const tables = [];
      for (let i = 0; i < nProp; i++) {
        const p = spot(6, null);
        if (!p) continue;
        const type = Math.random() < 0.55 ? "table" : "brokenCrate";
        map.props.push({ x: p.x, y: p.y, floor: f, type });
        if (type === "table") tables.push(p);
      }
      // 桌面上的杏仁水（物资丰富的主要来源之一）
      for (const tp of tables) {
        if (Math.random() > 0.6) continue;
        map.ground.push({ x: tp.x, y: tp.y, floor: f, item: "almond", taken: false });
      }
      // 散落在地上的杏仁水：约 22% 是浑浊/不满的（受污染）
      const nGround = Math.floor(size / 4);
      for (let i = 0; i < nGround; i++) {
        const p = spot(6, null);
        if (!p) continue;
        const bad = Math.random() < 0.22;
        map.ground.push({ x: p.x, y: p.y, floor: f, item: bad ? "bad" : "almond", taken: false });
      }
      // 撬棍：靠墙放着（"在一些墙壁旁你可以找到撬棍"）
      const grid = map.layers ? map.layers[f] : map.grid;
      const nearWall = () => {
        for (let i = 0; i < 300; i++) {
          const t = floorList(map, f)[randInt(0, floorList(map, f).length - 1)];
          if (!t) break;
          const key = t.x + "," + t.y;
          if (used.has(key)) continue;
          if (!reach.has(key)) continue;
          if (grid && grid[t.y][t.x] !== 0) continue;
          if (Math.hypot(t.x - map.start.x, t.y - map.start.y) < 5) continue;
          const wallSide = (grid && (grid[t.y][t.x - 1] === 1 || grid[t.y][t.x + 1] === 1 ||
                                     grid[t.y - 1][t.x] === 1 || grid[t.y + 1][t.x] === 1));
          if (!wallSide) continue;
          used.add(key);
          return { x: t.x, y: t.y };
        }
        return null;
      };
      for (let i = 0; i < 3; i++) {
        const p = nearWall();
        if (!p) continue;
        map.ground.push({ x: p.x, y: p.y, floor: f, item: "crowbar", taken: false });
      }
      // 电梯钥匙：藏在离出生点够远的地方（桌子优先）
      const far = tables.filter((t) => Math.hypot(t.x - map.start.x, t.y - map.start.y) > 18);
      const keySpot = far.length ? far[randInt(0, far.length - 1)] : spot(20, null);
      if (keySpot) {
        map.ground.push({ x: keySpot.x, y: keySpot.y, floor: f, item: "key", taken: false });
      }
    }
  }
}

// ---------- 碰撞 ----------
// 这一格是不是 M.E.G 基地的伸缩门
function isMegDoor(map, tx, ty, floor) {
  if (!map.megDoorTiles) {
    const set = new Set();
    for (const d of (map.doors || [])) {
      if (!d.meg) continue;
      for (const t of d.tiles) set.add((d.floor | 0) + ":" + t.x + "," + t.y);
    }
    map.megDoorTiles = set;
  }
  return map.megDoorTiles.has((floor | 0) + ":" + tx + "," + ty);
}

function circleHitsWall(map, x, y, r, floor, ghost) {
  const x0 = Math.floor((x - r) / TILE), x1 = Math.floor((x + r) / TILE);
  const y0 = Math.floor((y - r) / TILE), y1 = Math.floor((y + r) / TILE);
  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      // ghost：正在离开 Alpha 基地的实体会直接穿过那扇伸缩门，不然会被门堵在里头
      if (ghost && isMegDoor(map, tx, ty, floor)) continue;
      if (solidAt(map, tx, ty, floor)) {
        const cx = clamp(x, tx * TILE, tx * TILE + TILE);
        const cy = clamp(y, ty * TILE, ty * TILE + TILE);
        if (dist2(x, y, cx, cy) < r * r) return true;
      }
    }
  }
  return false;
}

// 带墙体碰撞滑动的移动
function moveWithCollision(obj, tx, ty, speed, dt, map, floor) {
  const d = Math.hypot(tx - obj.x, ty - obj.y);
  if (d < 0.001) return false;
  const vx = (tx - obj.x) / d * speed * dt;
  const vy = (ty - obj.y) / d * speed * dt;
  const ghost = !!obj.ghost;
  let moved = false;
  if (!circleHitsWall(map, obj.x + vx, obj.y, obj.radius, floor, ghost)) { obj.x += vx; moved = true; }
  if (!circleHitsWall(map, obj.x, obj.y + vy, obj.radius, floor, ghost)) { obj.y += vy; moved = true; }
  return moved;
}

// 两点间是否有障碍遮挡（视线检测）：墙与关闭的门都会挡住视线
function hasLineOfSight(map, x1, y1, x2, y2, floor) {
  const d = Math.hypot(x2 - x1, y2 - y1);
  const steps = Math.max(2, Math.ceil(d / (TILE * 0.35)));
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const gx = Math.floor((x1 + (x2 - x1) * t) / TILE);
    const gy = Math.floor((y1 + (y2 - y1) * t) / TILE);
    if (blocksSight(map, gx, gy, floor)) return false;
  }
  return true;
}

// ================= Level 10：丰裕 =================
// 一片向四面八方无限延伸的麦田。成排的树木与灌木把麦田分割成许多小块，
// 低地上散布着可以安全饮用的湖泊，间或能找到谷仓、木棚、马厩之类的构筑物。
// 泥土小径上留着两条轮胎碾痕 —— 沿着它走很久很久，据说能走到城市的边缘。
function generateFieldMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  // 整片开阔麦田，只有最外圈是"看不见的边界"
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) grid[y][x] = 0;
  }

  const lakes = new Set();      // 低地上的湖泊（可安全饮用）
  const trail = new Set();      // 泥土小径
  const dirt = new Set();       // 湖边未被开垦的泥土与草地
  const buildings = [];         // 谷仓 / 木棚 / 马厩 / 外屋
  const forest = new Set();     // 成排的树（不可穿行，把麦田分成小块）
  const bush = new Set();       // 茂密的草丛：能挤过去，但走得极慢

  // ---- 湖泊：几片低地上的积水，周围是没被开垦过的泥土与草地 ----
  for (let i = 0; i < 4; i++) {
    const cx = randInt(8, size - 9), cy = randInt(8, size - 9);
    const rx = randInt(4, 8), ry = randInt(3, 6);
    for (let y = cy - ry; y <= cy + ry; y++) {
      for (let x = cx - rx; x <= cx + rx; x++) {
        if (x < 2 || y < 2 || x > size - 3 || y > size - 3) continue;
        const d = Math.hypot((x - cx) / rx, (y - cy) / ry);
        if (d <= 1) lakes.add(x + "," + y);
        else if (d <= 1.45) dirt.add(x + "," + y);
      }
    }
  }

  // ---- 泥土小径：蛇形贯穿整片麦田，走完要花很长时间 ----
  let tx = 6, ty = 12;
  const mark = (x, y) => {
    if (x < 1 || y < 1 || x > size - 2 || y > size - 2) return;
    trail.add(x + "," + y);
    lakes.delete(x + "," + y);
    dirt.delete(x + "," + y);
  };
  mark(tx, ty);
  for (let seg = 0; seg < 4; seg++) {
    const dir = seg % 2 === 0 ? 1 : -1;
    const target = dir > 0 ? size - 7 : 6;
    while (tx !== target) { tx += dir; mark(tx, ty); }
    if (seg < 3) {
      for (let k = 0; k < 9; k++) { ty += 1; mark(tx, ty); }
    }
  }
  const trailStart = { x: 6, y: 12 };
  // 小径尽头：走到这一格（不是"走够多少距离"）就到了 Level 11。
  // 以前是按累计行走距离判定的，玩家在麦田里绕圈也算进度，很没道理。
  const trailEnd = { x: tx, y: ty };

  // ---- 构筑物：谷仓 / 木棚 / 马厩 / 外屋 ----
  const kinds = ["barn", "shed", "stable", "outhouse"];
  const props = [];
  const ground = [];
  for (let i = 0; i < 7; i++) {
    let kind = kinds[randInt(0, kinds.length - 1)];
    let w = kind === "barn" ? 7 : kind === "stable" ? 6 : kind === "shed" ? 5 : 4;
    let h = kind === "barn" ? 6 : kind === "stable" ? 5 : kind === "shed" ? 4 : 4;
    let bx = -1, by = -1;
    for (let a = 0; a < 240 && bx < 0; a++) {
      // 找了大半天都塞不下就换小一点的构筑物（宁可有个木棚，也别空手而归）
      if (a === 120) { kind = "shed"; w = 5; h = 4; }
      else if (a === 190) { kind = "outhouse"; w = 4; h = 4; }
      const cx2 = randInt(4, size - w - 5), cy2 = randInt(4, size - h - 5);
      let ok = true;
      // 建筑区要离入口远 —— 一进麦田就撞见谷仓，这一层就没得逛了
      if (Math.hypot(cx2 - trailStart.x, cy2 - trailStart.y) < size * 0.42) ok = false;
      for (let y = cy2 - 2; y <= cy2 + h + 1 && ok; y++) {
        for (let x = cx2 - 2; x <= cx2 + w + 1 && ok; x++) {
          if (x < 1 || y < 1 || x > size - 2 || y > size - 2) { ok = false; break; }
          if (trail.has(x + "," + y) || lakes.has(x + "," + y)) ok = false;
        }
      }
      if (ok) { bx = cx2; by = cy2; }
    }
    if (bx < 0) continue;
    for (let y = by; y < by + h; y++) {
      for (let x = bx; x < bx + w; x++) {
        const inner = y > by && y < by + h - 1 && x > bx && x < bx + w - 1;
        grid[y][x] = inner ? 0 : 1;
      }
    }
    // 门：开在下墙中间
    const dx = bx + Math.floor(w / 2);
    grid[by + h - 1][dx] = 0;
    buildings.push({ x: bx, y: by, w, h, kind });
    // 里面堆着木材 / 钉子之类的资源
    if (Math.random() < 0.75) {
      props.push({ x: bx + 1, y: by + 1, floor: 0, type: "lumber" });
    }
    if (Math.random() < 0.5) {
      props.push({ x: bx + w - 2, y: by + h - 2, floor: 0, type: "nails" });
    }
    // 偶尔能翻到补给
    if (Math.random() < 0.7) {
      ground.push({ x: bx + Math.floor(w / 2), y: by + 1, floor: 0, item: "almond", taken: false });
    }
    if (Math.random() < 0.25) {
      ground.push({ x: bx + 1, y: by + h - 2, floor: 0, item: "crowbar", taken: false });
    }
  }

  // ---- 成排的树木与灌木丛：把麦田分割成许多小块 ----
  const built = new Set();
  for (const b of buildings) {
    for (let y = b.y - 1; y <= b.y + b.h; y++) {
      for (let x = b.x - 1; x <= b.x + b.w; x++) built.add(x + "," + y);
    }
  }
  const blocked = (x, y) => trail.has(x + "," + y) || lakes.has(x + "," + y) ||
    forest.has(x + "," + y) || built.has(x + "," + y);
  // 树与草丛的分工：密的地方长成树（挡路），稀的地方长成草丛（能挤过去，但很慢）
  const grow = (x, y) => {
    if (blocked(x, y)) return;
    if (bush.has(x + "," + y) || forest.has(x + "," + y)) return;
    if (Math.random() < 0.62) {
      bush.add(x + "," + y);                            // 草丛：可穿行
    } else {
      grid[y][x] = 1; forest.add(x + "," + y);          // 树：挡路
    }
  };
  for (let x = 5; x < size - 5; x += 10) {
    for (let y = 4; y < size - 4; y++) {
      if (Math.random() > 0.78) continue;              // 偶尔留个缺口
      grow(x, y);
      if (Math.random() < 0.5) grow(x + 1, y);
    }
  }
  for (let y = 8; y < size - 6; y += 13) {
    for (let x = 4; x < size - 4; x++) {
      if (Math.random() > 0.72) continue;
      grow(x, y);
    }
  }

  const floors = collectFloors(grid, size);
  const start = { x: trailStart.x, y: trailStart.y + 2, floor: 0 };
  // 出生点必须站得住（可能被加宽的灌木压住了）
  grid[start.y][start.x] = 0;
  forest.delete(start.x + "," + start.y);
  bush.delete(start.x + "," + start.y);
  for (const b of buildings) {
    if (start.x >= b.x - 1 && start.x <= b.x + b.w && start.y >= b.y - 1 && start.y <= b.y + b.h) {
      grid[start.y][start.x] = 0;
    }
  }

  // ---- 通往 Level 10.1 的入口：一小潭黑得看不见底的死水 ----
  // 以前这一层完全没有去 10.1 的路，玩家怎么逛都找不到。
  // 麦田里普通的湖泊是能安全饮用的，这潭水是另一回事 —— 水面黑得反光，
  // 走近能闻到味道。走进去就是尸湖（10.1），那边的水会要命。
  const deadpool = new Set();
  {
    let px = -1, py = -1;
    for (let a = 0; a < 400 && px < 0; a++) {
      const cx3 = randInt(7, size - 8), cy3 = randInt(7, size - 8);
      // 离出生点(小径入口)远一些，也别压在小径尽头(L11)上
      if (Math.hypot(cx3 - start.x, cy3 - start.y) < size * 0.34) continue;
      if (Math.hypot(cx3 - trailEnd.x, cy3 - trailEnd.y) < 16) continue;
      let ok = true;
      for (let y = cy3 - 2; y <= cy3 + 2 && ok; y++) {
        for (let x = cx3 - 2; x <= cx3 + 2 && ok; x++) {
          if (x < 2 || y < 2 || x > size - 3 || y > size - 3) { ok = false; break; }
          if (grid[y][x] !== 0) { ok = false; break; }
          if (lakes.has(x + "," + y) || trail.has(x + "," + y) || forest.has(x + "," + y)) { ok = false; break; }
        }
      }
      if (ok) { px = cx3; py = cy3; }
    }
    if (px >= 0) {
      for (let y = py - 1; y <= py + 1; y++) {
        for (let x = px - 1; x <= px + 1; x++) {
          if (grid[y] && grid[y][x] === 0) deadpool.add(x + "," + y);
        }
      }
      deadpool.add(px + "," + py);
      props.push({ x: px, y: py, floor: 0, type: "deadpool10" });
    }
  }

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [[]],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground,
    lakes, trail, dirt, buildings, forest, bush,
    trailEnd, deadpool,
  };
  makeDoorsMap(map);
  return map;
}

// ================= Level 11：不夜城 =================
// 一座无限大的城市：网格状的马路与被街区切开的楼房，黄线、路灯、
// 偶尔缓缓驶过又停下的汽车，以及随时能取用的杏仁水。
// 有些建筑会通往浅层；有些窗户与公寓楼通向尚未被探索的地方。
function generateCityMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const B = 11;                    // 街区周期（马路 3 格 + 两侧人行道 + 建筑区）
  const road = new Set();          // 沥青马路
  const walk = new Set();          // 混凝土人行道
  const indoors = new Set();       // 建筑内部（可进入的那些）
  const floating = new Set();      // 被奇怪地叠在其他建筑顶上 / 漂浮着的楼
  const props = [];
  const ground = [];

  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      const mx = x % B, my = y % B;
      const isRoad = mx < 3 || my < 3;
      const isWalk = mx === 3 || my === 3 || mx === B - 1 || my === B - 1;
      if (isRoad) { grid[y][x] = 0; road.add(x + "," + y); }
      else if (isWalk) { grid[y][x] = 0; walk.add(x + "," + y); }
      else grid[y][x] = 1;         // 建筑（后面再决定能不能进）
    }
  }

  // ---- 街区里的楼房：有的实心，有的能进；有的还漂浮着 ----
  for (let by = 4; by < size - 8; by += B) {
    for (let bx = 4; bx < size - 8; bx += B) {
      const w = 7, h = 7;
      if (bx + w >= size - 1 || by + h >= size - 1) continue;
      const enterable = Math.random() < 0.42;
      if (enterable) {
        for (let y = by + 1; y < by + h - 1; y++) {
          for (let x = bx + 1; x < bx + w - 1; x++) { grid[y][x] = 0; indoors.add(x + "," + y); }
        }
        // 门开在朝向人行道的一侧
        const side = randInt(0, 3);
        const mx = bx + Math.floor(w / 2), my = by + Math.floor(h / 2);
        if (side === 0) grid[my][bx] = 0;
        else if (side === 1) grid[my][bx + w - 1] = 0;
        else if (side === 2) grid[by][mx] = 0;
        else grid[by + h - 1][mx] = 0;
        // 里面偶尔留着有用的东西
        if (Math.random() < 0.55) {
          ground.push({ x: bx + 1 + randInt(0, w - 3), y: by + 1 + randInt(0, h - 3), floor: 0, item: "almond", taken: false });
        }
        if (Math.random() < 0.3) {
          const t = ["watercooler", "freezer", "vending"][randInt(0, 2)];
          props.push({
            x: bx + 1 + randInt(0, w - 3), y: by + 1 + randInt(0, h - 3), floor: 0,
            type: t, uses: CONFIG.CITY_DISPENSER_USES,
          });
        }
      }
      if (Math.random() < 0.22) floating.add(bx + "," + by);   // 重力似乎不适用于这些建筑
    }
  }

  // ---- 路灯：有些亮着，有些是灭的 ----
  for (const k of walk) {
    const [sx, sy] = k.split(",");
    const x = +sx, y = +sy;
    if ((x + y) % 7 !== 0) continue;
    props.push({ x, y, floor: 0, type: "streetlamp", on: Math.random() < 0.55 });
  }
  // ---- 街边的饮水机 / 商业冰柜 / 苏打水自动售货机 ----
  for (let i = 0; i < 16; i++) {
    const list = [...walk];
    if (!list.length) break;
    const k = list[randInt(0, list.length - 1)];
    const [sx, sy] = k.split(",");
    props.push({
      x: +sx, y: +sy, floor: 0,
      type: ["watercooler", "freezer", "vending"][randInt(0, 2)],
      uses: CONFIG.CITY_DISPENSER_USES,
    });
  }

  const floors = collectFloors(grid, size);
  const start = { x: 1 + 1, y: 1 + 1, floor: 0 };   // 马路中央
  if (grid[start.y][start.x] !== 0) {
    for (const t of floors) { start.x = t.x; start.y = t.y; break; }
  }

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [[]],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates: [], ground,
    road, walk, indoors, floating, block: B,
    cars: [], exits: [],
  };

  // ---- 医院：城里一栋很大的楼 ----
  // 必须在 collectFloors 之后单独补 floors —— 否则新挖出来的地板不在列表里，
  // 后面按 floors 投放的东西（补给、浆果、档案）全都落不进医院。
  {
    const fn = (typeof buildCityHospital === "function") ? buildCityHospital : window.buildCityHospital;
    if (fn) {
      const h = fn(grid, size, props, road, indoors, walk);
      if (h) {
        map.hospital = h.hospital;
        map.hospitalWall = h.hospitalWall;
        map.hospGlitch = h.glitch;
        map.hospRect = h.rect;
        map.hospPharm = h.pharm;
        // 这一块原本是城里的街区（人行道 / 可进入的楼），整块被医院顶掉了 ——
        // 不把这些标记清掉的话，drawCityWall 会因为 indoors 命中而直接 return，
        // 医院的墙就一块都画不出来（看着就是"楼没了，只剩空地"）。
        for (let y = h.rect.y0; y <= h.rect.y1; y++) {
          for (let x = h.rect.x0; x <= h.rect.x1; x++) {
            const k = x + "," + y;
            indoors.delete(k); road.delete(k); walk.delete(k); floating.delete(k);
          }
        }
        // 药房最里面那面墙在"错乱" —— 碰上去到 Level 109
        map.exits.push({ kind: "glitchwall", x: h.nook.x, y: h.nook.y, floor: 0, toLevel: 109 });
        for (const k of h.hospital) {
          const [fx, fy] = k.split(",");
          floors.push({ x: +fx, y: +fy });
        }
      }
    }
  }
  makeDoorsMap(map);

  // ---- 通往浅层的建筑（Level 0 ~ Level 4）----
  const targets = [0, 1, 2, 3, 4];
  const cands = floors.filter((t) => indoors.has(t.x + "," + t.y));
  for (let i = 0; i < 5; i++) {
    for (let a = 0; a < 300; a++) {
      const t = cands[randInt(0, cands.length - 1)];
      if (!t) break;
      if (Math.hypot(t.x - start.x, t.y - start.y) < 10) continue;
      props.push({ x: t.x, y: t.y, floor: 0, type: "citydoor", target: targets[i] });
      break;
    }
  }
  // ---- 偏僻小道（回 Level 10）/ 特定的窗户（Level 12）/ 公寓楼（Level 13）----
  {
    const far = farthestFloor(floors, start, 26);
    if (far) props.push({ x: far.x, y: far.y, floor: 0, type: "alley10" });
  }
  for (let i = 0; i < 2; i++) {
    const t = cands.length ? cands[randInt(0, cands.length - 1)] : null;
    if (t) props.push({ x: t.x, y: t.y, floor: 0, type: "window12" });
  }
  {
    const t = cands.length ? cands[randInt(0, cands.length - 1)] : null;
    if (t) props.push({ x: t.x, y: t.y, floor: 0, type: "apartment13" });
  }
  // ---- 面包店：Level 67 就是被一个顺着烤面包香气走的流浪者发现的 ----
  {
    for (let a2 = 0; a2 < 300; a2++) {
      const t = cands.length ? cands[randInt(0, cands.length - 1)] : null;
      if (!t) break;
      if (Math.hypot(t.x - start.x, t.y - start.y) < 12) continue;
      props.push({ x: t.x, y: t.y, floor: 0, type: "bakery67door", toLevel: 67 });
      break;
    }
  }
  // ---- 城市最左边那团霓虹雾 -> Level 11.1 新时代广场（B.N.T.G 的贸易站）----
  // 贴着地图左边缘、放在马路上（保证是可走的格子），玩家一路往西走就能撞见。
  {
    let fx = -1, fy = -1;
    for (let x = 2; x < Math.min(14, size - 2) && fx < 0; x++) {
      for (let y = 2; y < size - 2; y++) {
        if (grid[y][x] === 0) { fx = x; fy = y; break; }
      }
    }
    if (fx < 0) {
      for (const t of floors) { if (t.x < size / 3) { fx = t.x; fy = t.y; break; } }
    }
    if (fx >= 0) props.push({ x: fx, y: fy, floor: 0, type: "neonfog11" });
  }
  // 注：通往 Level 78 空间站的入口不在这里 ——
  // 按档案原文，是「切入 Level 20 等候厅的窗户」（见 main.js 的 l20window 交互）。
  // 这里只保留 78 的出口效果：从救命舱出来的人会落在 Level 11 一扇随机的门里。
  // 红色气球 -> Level 26 享乐号汽船
  if (window.l26AddEntrance) window.l26AddEntrance(map);
  return map;
}

// ================= Level 9：郊区 =================
// 一片停留在午夜时分的无垠郊区。房屋样式大小各异、配备崭新家具（但没有电源），
// 偶尔能看到两栋房子以物理上不可能的方式卡进彼此内部。
// 街道是最危险的地方：潮湿未涂漆的沥青、落叶、水洼；路灯多半断电，少数会闪烁。
// 浓雾是碾压者的生成机制。沿着箭头路牌走够 100~200 英里能到 Level 11；
// 通往草地的步道通往 Level 9.1；离开步道走进田野则会到 Level 10。
function generateSuburbMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const B = 13;                       // 街区周期：马路 3 格 + 两侧人行道 + 住宅区
  const road = new Set(), walk = new Set(), indoors = new Set();
  const lawn = new Set(), field = new Set(), path = new Set();
  const puddles = new Set(), leaves = new Set();
  const houses = [], props = [], ground = [], crates = [];

  // ---- 街道网格：沥青马路 + 石质人行道 ----
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      const mx = x % B, my = y % B;
      if (mx < 3 || my < 3) { grid[y][x] = 0; road.add(x + "," + y); }
      else if (mx === 3 || my === 3 || mx === B - 1 || my === B - 1) { grid[y][x] = 0; walk.add(x + "," + y); }
      else grid[y][x] = 0;            // 住宅区（草坪 / 房屋，先全铺开）
    }
  }
  // 水洼与落叶：证明这里下过雨
  for (const k of road) {
    const [sx, sy] = k.split(",");
    const x = +sx, y = +sy;
    if (Math.random() < 0.10) puddles.add(x + "," + y);
    else if (Math.random() < 0.14) leaves.add(x + "," + y);
  }

  // ---- 田野与草地：地图的一侧 ----
  const fieldTop = size - 16;
  for (let y = fieldTop; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      road.delete(x + "," + y); walk.delete(x + "," + y);
      if (y > fieldTop + 3) field.add(x + "," + y);
      else lawn.add(x + "," + y);
    }
  }
  // 通往草地的步道：从街道垂直插进草地（沿着它走会到 Level 9.1）
  const pathX = randInt(10, size - 11);
  for (let y = fieldTop + 4; y >= fieldTop - 6; y--) {
    path.add(pathX + "," + y);
    path.add((pathX + 1) + "," + y);
    lawn.delete(pathX + "," + y); lawn.delete((pathX + 1) + "," + y);
    field.delete(pathX + "," + y); field.delete((pathX + 1) + "," + y);
    grid[y][pathX] = 0; grid[y][pathX + 1] = 0;
  }

  // ---- 房屋：大小样式各异，大多带家具，有些空无一物 ----
  const styles = ["colonial", "victorian", "ranch", "craftsman", "duplex"];
  const taken = new Set();
  const inField = (x, y) => y >= fieldTop - 8;
  // 住宅区只占地图上半截，离草地（田野）远得很 —— 中间隔着一大片空草坪。
  // 原来房子一直排到 fieldTop - 10，出门就是草地，这一层没什么难度可言。
  const LB9 = levelBuildings(9);
  const bandY0 = Math.max(4, Math.round((LB9 && LB9.band ? LB9.band.y0 : 0.05) * size));
  const bandY1 = Math.min(fieldTop - 10, Math.round((LB9 && LB9.band ? LB9.band.y1 : 0.52) * size));
  for (let by = bandY0; by < bandY1; by += B) {
    for (let bx = 4; bx < size - 12; bx += B) {
      if (Math.random() < 0.14) continue;                 // 偶尔是一块空草坪
      const hCount = Math.random() < 0.25 ? 2 : 1;        // 偶尔一个街区两栋
      for (let hi = 0; hi < hCount; hi++) {
        const w = randInt(5, 9), h = randInt(5, 8);
        const hx = bx + 1 + hi * (w + 1), hy = by + 1 + (Math.random() < 0.5 ? 0 : 1);
        if (hx + w >= size - 2 || hy + h >= fieldTop - 1) continue;
        if (inField(hx, hy + h)) continue;
        let clash = false;
        for (const k of taken) {
          const [px, py] = k.split(",");
          const pxx = +px, pyy = +py;
          if (pxx >= hx - 1 && pxx <= hx + w && pyy >= hy - 1 && pyy <= hy + h) { clash = true; break; }
        }
        if (clash) continue;
        const empty = Math.random() < 0.22;               // 有些房屋空无一物
        const style = styles[randInt(0, styles.length - 1)];
        // 偶然会见到两栋相邻的房屋完全相同；其中一部分以物理上不可能的方式卡进彼此内部
        const twin = Math.random() < 0.18;
        const merged = twin && Math.random() < 0.6;
        const build = (ox, oy) => {
          for (let y = oy; y < oy + h; y++) {
            for (let x = ox; x < ox + w; x++) lawn.delete(x + "," + y);
          }
          for (let y = oy; y < oy + h; y++) {
            for (let x = ox; x < ox + w; x++) {
              const inner = y > oy && y < oy + h - 1 && x > ox && x < ox + w - 1;
              grid[y][x] = inner ? 0 : 1;
              if (inner) indoors.add(x + "," + y);
              taken.add(x + "," + y);
            }
          }
          const dx = ox + Math.floor(w / 2), dy = oy + h - 1;   // 门开在朝街的一侧
          grid[dy][dx] = 0;
          indoors.add(dx + "," + dy);
          return { x: ox, y: oy, w, h, style, empty, door: { x: dx, y: dy }, twin, merged };
        };
        houses.push(build(hx, hy));
        if (twin) {
          const ox = merged ? hx - randInt(2, 4) : hx + w + 1;
          const oy = merged ? hy - randInt(1, 3) : hy;
          if (ox > 1 && oy > 1 && ox + w < size - 2 && oy + h < fieldTop - 1) houses.push(build(ox, oy));
        }

        // 家具：沙发 / 电视 / 床 / 冰箱（需要电源的一样都用不了）
        if (!empty) {
          const spots = [];
          for (let y = hy + 1; y < hy + h - 1; y++) {
            for (let x = hx + 1; x < hx + w - 1; x++) spots.push({ x, y });
          }
          const pick = () => spots.length ? spots.splice(randInt(0, spots.length - 1), 1)[0] : null;
          const f1 = pick(); if (f1) props.push({ x: f1.x, y: f1.y, floor: 0, type: "sofa", dead: true });
          const f2 = pick(); if (f2) props.push({ x: f2.x, y: f2.y, floor: 0, type: "tv", dead: true });
          const f3 = pick(); if (f3) props.push({ x: f3.x, y: f3.y, floor: 0, type: "bed", dead: true });
          const f4 = pick(); if (f4) props.push({ x: f4.x, y: f4.y, floor: 0, type: "fridge", dead: true });
          // 口袋里的零碎：偶尔能翻出有用的东西
          if (Math.random() < 0.6) {
            const f5 = pick();
            if (f5) ground.push({ x: f5.x, y: f5.y, floor: 0, item: "almond", taken: false });
          }
          if (Math.random() < 0.2) {
            const f6 = pick();
            if (f6) ground.push({ x: f6.x, y: f6.y, floor: 0, item: "crowbar", taken: false });
          }
          if (Math.random() < 0.25) {
            const f7 = pick();
            if (f7) crates.push({ x: f7.x, y: f7.y, floor: 0, opened: false, loot: randInt(1, 3) });
          }
        }
        // 后院：有些房屋的后院布置齐全
        if (Math.random() < 0.3) {
          const yx = hx + Math.floor(w / 2), yy = hy - 2;
          if (yy > 1) {
            grid[yy][yx] = 0;
            lawn.add(yx + "," + yy);
            props.push({ x: yx, y: yy, floor: 0, type: "yardtable", dead: true });
          }
        }
        break;   // 一个街区最多两栋，重叠的那次就算了
      }
    }
  }

  // ---- 路灯：往往断电，有些来回闪烁，偶尔甚至通电 ----
  for (const k of walk) {
    const [sx, sy] = k.split(",");
    const x = +sx, y = +sy;
    if ((x + y) % 9 !== 0) continue;
    if (y >= fieldTop) continue;
    const r = Math.random();
    props.push({
      x, y, floor: 0, type: "lamp9",
      mode: r < 0.68 ? "off" : r < 0.92 ? "flicker" : "on",
    });
  }

  // ---- 箭头路牌：沿着它们一直走，能到 Level 11 ----
  const signs = [];
  const signY = (Math.floor((size - 20) / B / 2)) * B + 1;   // 挑一条横向主干道
  for (let x = 8; x < size - 8; x += 11) {
    if (grid[signY] && grid[signY][x] === 0) {
      signs.push({ x, y: signY, dir: 1, dx: 1, dy: 0 });     // 箭头一律指向东边
    }
  }

  const floors = collectFloors(grid, size);
  // 出生在一条横向主干道上（别卡在地图角上）
  const start = { x: 4, y: Math.floor((size - 20) / B / 2) * B + 1, floor: 0 };
  if (!road.has(start.x + "," + start.y)) {
    for (const t of floors) { if (road.has(t.x + "," + t.y)) { start.x = t.x; start.y = t.y; break; } }
  }
  grid[start.y][start.x] = 0;
  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [[]],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props, crates, ground,
    road, walk, indoors, lawn, field, path,
    puddles, leaves, houses, signs, block: B,
    fieldTop, pathX,
  };
  // 墙 -> 房屋样式（绘制时用它决定外立面颜色，免得每格都去遍历房屋列表）
  map.wallStyle = new Map();
  for (const hh of houses) {
    for (let y = hh.y; y < hh.y + hh.h; y++) {
      for (let x = hh.x; x < hh.x + hh.w; x++) {
        const inner = y > hh.y && y < hh.y + hh.h - 1 && x > hh.x && x < hh.x + hh.w - 1;
        if (!inner) map.wallStyle.set(x + "," + y, hh.style);
      }
    }
  }
  makeDoorsMap(map);
  return map;
}



// ================= Level 13：温水煮青蛙 =================
// 一座 20 世纪的公寓大楼：米白与暗白涂料的走廊绵延数英里，两侧是一模一样的套房。
// 每套至少有一间带厨房与客厅的主室、一间卧室、一间浴室。物资会自己刷新 ——
// 而且刷新出来的东西，特意以地球出生的人类为目标。
// 没有实体。这里的威胁不是怪物，是"住下去就不想走了"。
// 出口：电梯（坐到负数楼层 -> Level 70）；在楼里长时间游荡，极低概率切进 Level 14。
function generateApartmentMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);

  // ---- 结构：一条主走廊，两侧是一模一样的套房，尽头是电梯 ----
  // Level 13 有 290 层，这里把它们排成几条平行的走廊；
  // 电梯能选层 —— 选中的层就是脚下这条走廊换一条。
  const FLOORS = 5;                       // 本层级内可切换的楼层数
  // 每条楼层占 15 行：上套房(4) + 隔墙(1) + 走廊(3) + 隔墙(1) + 下套房(4) + 层间隔(2)
  // 之前套房和走廊是直接挨着的 —— 中间那一行没有墙，站在走廊上就能把房间里
  // 的冰箱、床、衣柜一眼看穿，门形同虚设。现在两侧各有一堵实心的隔墙行，
  // 门是在墙上开的一个洞。
  const BH = 15;
  const CORR_H = 3;                       // 走廊 3 格高
  const SUITE_H = 4;                      // 套房 4 格高
  const top0 = 2;

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [null], rooms: [[]],
    start: null, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props: [], crates: [], ground: [],
    corridor: new Set(),                  // 走廊（油毯）
    indoors: new Set(),                   // 套房内（木地板）
    suites: [],                           // 套房：用于摆放家具
    aptFloors: [],                        // 每条楼层：{ y, corrY, elev }
    elevator: null,
    wander: { to: 14, acc: 0, need: 300, chance: 0.25 },
  };
  makeDoorsMap(map);

  const layout = [];
  for (let f = 0; f < FLOORS; f++) {
    const base = top0 + f * BH;
    if (base + BH + 1 >= size - 2) break;
    const corrY = base + SUITE_H + 1;     // 走廊顶行（套房与走廊之间隔着一行墙）
    const wallUp = corrY - 1;             // 上侧套房与走廊之间的隔墙行
    const wallDn = corrY + CORR_H;        // 下侧套房与走廊之间的隔墙行
    // 走廊：贯穿整条，右端留出电梯间
    for (let y = corrY; y < corrY + CORR_H; y++) {
      for (let x = 3; x < size - 8; x++) {
        grid[y][x] = 0;
        map.corridor.add(x + "," + y);
      }
    }
    // 两侧套房：沿走廊每隔一段开一扇门
    const suites = [];
    for (let i = 0; i < 6; i++) {
      const x0 = 5 + i * 9;
      if (x0 + 7 >= size - 9) break;
      for (const side of [0, 1]) {        // 0=上侧 1=下侧
        const ry = side === 0 ? base : corrY + CORR_H + 1;
        carveRoom(grid, size, x0, ry, 7, SUITE_H);
        const su = { x: x0, y: ry, w: 7, h: SUITE_H, side, floorIdx: f };
        for (let yy = ry; yy < ry + SUITE_H; yy++) {
          for (let xx = x0; xx < x0 + 7; xx++) map.indoors.add(xx + "," + yy);
        }
        map.suites.push(su);
        suites.push(su);
        // 门：在隔墙行上开一个洞 —— 两侧都是实心的墙，看不见屋里
        const dx = x0 + 3;
        const dy = side === 0 ? wallUp : wallDn;
        grid[dy][dx] = 0;
        addDoor(map, [{ x: dx, y: dy, dir: "h" }], 0, "suite13", { floorIdx: f });
      }
    }
    // 电梯间：走廊尽头。左列留作墙，只开一个门洞 —— 不然整面都是敞开的。
    const ex = size - 7, ey = wallUp;
    carveRoom(grid, size, ex + 1, ey, 4, 5);
    for (let yy = ey; yy < ey + 5; yy++) {
      for (let xx = ex + 1; xx < ex + 5; xx++) map.indoors.add(xx + "," + yy);
    }
    // 走廊右端接到电梯间门口
    for (let y = corrY; y < corrY + CORR_H; y++) {
      for (let x = size - 8; x < ex; x++) { grid[y][x] = 0; map.corridor.add(x + "," + y); }
    }
    // 电梯门：开在左列那堵墙上
    const elevY = corrY + 1;
    grid[elevY][ex] = 0;
    const elev = addDoor(map, [{ x: ex, y: elevY, dir: "v" }], 0, "elev13", { floorIdx: f });
    layout.push({ idx: f, base, corrY, elev, ex, ey });
  }
  map.aptFloors = layout;
  if (layout.length) {
    map.elevator = layout[0].elev;
    map.start = { x: 6, y: layout[0].corrY + 1, floor: 0 };
  } else {
    map.start = { x: Math.floor(size / 2), y: Math.floor(size / 2), floor: 0 };
  }

  // 家具与物资：冰箱里维持着对基本食品的供应
  // 之前是"随机撒在房间里"，结果显示器横在地上、椅子孤零零站在一边、床小得像个垫子。
  // 现在按房间摆：大件贴着墙，桌子边上配椅子，床占两格。
  for (const su of map.suites) {
    const wallRow = su.side === 0 ? su.y : su.y + su.h - 1;   // 靠外墙的那一排
    const inRow = su.side === 0 ? su.y + 1 : su.y + su.h - 2; // 靠里一排（放椅子 / 地上物资）
    const lx = su.x, rx = su.x + su.w - 1;
    const free = (x, y) => (grid[y] && grid[y][x] === 0);
    const put = (x, y, type, extra) => {
      if (!free(x, y)) return false;
      map.props.push(Object.assign({ x, y, floor: 0, type: type }, extra || {}));
      return true;
    };
    // 床：两张床并排 —— 一张很大的双人床
    const bedLeft = Math.random() < 0.5;
    const bx = bedLeft ? lx : rx - 1;
    put(bx, wallRow, "bed", { bedPart: 0 });
    put(bx + 1, wallRow, "bed", { bedPart: 1 });
    // 衣柜：挨着床
    const wx = bedLeft ? bx + 2 : bx - 1;
    put(wx, wallRow, "wardrobe");
    // 电视：贴墙，屏幕朝着走廊那一边（也就是下一排）
    put(bedLeft ? rx : lx, wallRow, "tv");
    // 桌子 + 椅子：桌子里侧，椅子就摆在桌子边上
    const tx = bedLeft ? rx - 1 : lx + 1;
    if (put(tx, inRow, "table")) {
      const cx = bedLeft ? tx - 1 : tx + 1;
      put(cx, inRow, "chair");                 // 椅子紧挨着桌子，不再孤零零站着
    }
    // 冰箱：剩下的位置
    put(bedLeft ? lx + 4 : lx + 3, wallRow, "fridge");
    // 地上偶尔一瓶杏仁水
    if (Math.random() < 0.55) {
      const gx = su.x + randInt(0, su.w - 1);
      if (free(gx, inRow)) map.ground.push({ x: gx, y: inRow, floor: 0, item: "almond", taken: false });
    }
  }
  // 墙上的裂缝：触碰就能到达 Level 21 —— 编号门
  // （原文：在 Level 13 中触碰墙壁的裂缝就可以到达 Level 21）
  {
    const cracks = [];
    const floors = collectFloors(grid, size);
    for (let i = 0; i < 300 && cracks.length < 3; i++) {
      const t = floors[randInt(0, floors.length - 1)];
      if (!t) break;
      // 裂缝在"墙"上：找一个贴着这块地板的墙格
      const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      const d = dirs[randInt(0, 3)];
      const cx = t.x + d[0], cy = t.y + d[1];
      if (cx < 1 || cy < 1 || cx >= size - 1 || cy >= size - 1) continue;
      if (grid[cy][cx] !== 1) continue;                  // 得是墙
      const k = cx + "," + cy;
      if (!cracks.some((c) => c.x === cx && c.y === cy)) cracks.push({ x: cx, y: cy, fx: t.x, fy: t.y });
    }
    map.wallCracks = cracks;
  }
  map.floors = [collectFloors(grid, size)];
  // 电梯间里再放一瓶，免得切层后身边一点补给都没有
  for (const L of layout) {
    map.ground.push({ x: L.ex + 1, y: L.ey + 2, floor: 0, item: "almond", taken: false });
  }
  // 红色气球 -> Level 26 享乐号汽船
  if (window.l26AddEntrance) window.l26AddEntrance(map);
  return map;
}

// ================= Level 14：天堂 =================
// 表面上：梦中的森林、猩红的草叶、瀑布的轰鸣、无垠的星空。
// 实际上：撞到树会死，树还会动。你还会看见根本不存在的队友向你招手。
// M.E.G. 的存档被篡改过 —— 真实的生存难度是"死区 · 精神危害"。
// 出口：长时间游荡，极低概率到 Level 15 或回到 Level 13。
// ================= Level 14：天堂（无限、随机的森林） =================
// 这片森林没有边界 —— 面积是无限的，地形也是随机的。
// 只有"当前屏幕附近"这一圈东西真的存在；走出这一圈，那些树、倒木、
// 杏仁水就会被删掉；等你再走回去，那里会重新生成一片全新的森林。
const L14_WIN = 64;        // 窗口边长（格）—— 够大，保证屏幕永远在窗口内
const L14_R   = 24;        // 新内容生成在这个半径之内
const L14_KILL = 25;       // 超出这个距离就删除（留出一点余量，别把刚生成的又删了）
const L14_NEW = 17;        // 新内容只在这个半径之外生成（避免当着玩家的面冒出来）
const L14_REBASE = 10;     // 离窗口中心超过这么多格，就把整个世界平移一次

function generateParadiseMap(level) {
  const size = L14_WIN;
  const grid = makeGrid(size);
  // 整片都是森林地面 —— 没有墙，也没有走不出去的边界
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) grid[y][x] = 0;
  const start = { x: size >> 1, y: size >> 1, floor: 0 };
  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [collectFloors(grid, size)], rooms: [[]],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props: [], crates: [], ground: [],
    trees: [],                                        // 树：能走上去 —— 撞上去就没了，而且它们会动
    phantoms: [],                                     // 幻觉：根本不存在的队友在向你招手
    wander: { to: [15, 13], acc: 0, need: 300, chance: 0.3 },   // 同样是 5 分钟
    // 无限层级：窗口跟着玩家走
    infinite: true, winR: L14_R, gen: 0, winCenter: { x: start.x, y: start.y },
  };
  makeDoorsMap(map);

  // 出生这一圈先铺满（整片随机森林），之后就靠窗口维护了
  l14Populate(map, start);
  return map;
}

// 在窗口里补足内容：只在 [NEW, R] 这一圈生成，所以不会当着玩家的面冒出来
function l14Populate(map, center, fresh) {
  const R = map.winR || L14_R;
  const inner = fresh ? 3 : L14_NEW;
  // 目标数量按"保留半径"这一整片来算 —— 走到哪，身边就该有多少东西
  const area = Math.PI * L14_KILL * L14_KILL;
  const want = {
    tree: Math.round(area * 0.05),          // 树的密度约 5%
    log: Math.round(area * 0.005),
    water: Math.max(fresh ? 5 : 3, Math.round(area * 0.0028)),
    phantom: Math.max(fresh ? 4 : 2, Math.round(area * 0.0016)),
  };
  // 数量都够了就别再算了（这个函数每帧都会被调用）
  const nT = (map.trees || []).length;
  const nL = (map.props || []).filter((p) => p.type === "log").length;
  const nW = (map.ground || []).filter((t) => !t.taken).length;
  const nP = (map.phantoms || []).length;
  if (nT >= want.tree && nL >= want.log && nW >= want.water && nP >= want.phantom) return;

  const taken = new Set();
  for (const t of (map.trees || [])) taken.add(t.x + "," + t.y);
  const place = () => {
    for (let i = 0; i < 40; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = inner + Math.random() * (R - inner);
      const x = Math.round(center.x + Math.cos(a) * d);
      const y = Math.round(center.y + Math.sin(a) * d);
      if (x < 1 || y < 1 || x >= map.size - 1 || y >= map.size - 1) continue;
      const k = x + "," + y;
      if (taken.has(k)) continue;                      // 别叠在一起
      taken.add(k);
      return { x, y };
    }
    return null;
  };
  for (let i = nT; i < want.tree; i++) {
    const p = place(); if (!p) break;
    map.trees.push({ x: p.x, y: p.y, floor: 0 });
  }
  for (let i = nL; i < want.log; i++) {
    const p = place(); if (!p) break;
    map.props.push({ x: p.x, y: p.y, floor: 0, type: "log" });
  }
  for (let i = nW; i < want.water; i++) {
    const p = place(); if (!p) break;
    map.ground.push({
      x: p.x, y: p.y, floor: 0,
      item: "bad", taken: false, disguised: true,
    });
  }
  for (let i = nP; i < want.phantom; i++) {
    const p = place(); if (!p) break;
    map.phantoms.push({ x: p.x, y: p.y, floor: 0, ph: Math.random() * 7 });
  }
  map.gen++;
}

// 把整个世界（玩家 + 树 + 倒木 + 地面物品 + 实体）整体平移，
// 让玩家回到窗口中心 —— 这样 grid 的索引永远有效，等于地图无限大。
function l14Rebase(map, dx, dy, player, entities, child) {
  const shiftTile = (o) => { if (!o) return false; o.x -= dx; o.y -= dy; return o.x >= 0 && o.y >= 0 && o.x < map.size && o.y < map.size; };
  map.trees = (map.trees || []).filter(shiftTile);
  map.props = (map.props || []).filter(shiftTile);
  map.ground = (map.ground || []).filter(shiftTile);
  map.phantoms = (map.phantoms || []).filter(shiftTile);
  if (map.start) { map.start.x -= dx; map.start.y -= dy; }
  if (player) { player.x -= dx * TILE; player.y -= dy * TILE; }
  if (child) { child.x -= dx * TILE; child.y -= dy * TILE; }
  for (const e of (entities || [])) {
    e.x -= dx * TILE; e.y -= dy * TILE;
    if (e.lastX != null) { e.lastX -= dx * TILE; e.lastY -= dy * TILE; }
  }
  map.winCenter = { x: map.size >> 1, y: map.size >> 1 };
  map.gen++;
}

// 删除窗口之外的东西 —— 它们会被"忘掉"，等你再走回去就会重新生成
function l14Cull(map, center, entities) {
  const kill = (L14_KILL) * (L14_KILL);
  const inWin = (o) => {
    const dx = o.x - center.x, dy = o.y - center.y;
    return dx * dx + dy * dy <= kill;
  };
  if ((map.trees || []).length) map.trees = map.trees.filter(inWin);
  if ((map.props || []).length) map.props = map.props.filter(inWin);
  if ((map.ground || []).length) map.ground = map.ground.filter(inWin);
  if ((map.phantoms || []).length) map.phantoms = map.phantoms.filter(inWin);
  for (let i = (entities || []).length - 1; i >= 0; i--) {
    const e = entities[i];
    const dx = e.x / TILE - center.x, dy = e.y / TILE - center.y;
    if (dx * dx + dy * dy > kill * 1.6) entities.splice(i, 1);
  }
  map.gen++;
}

// ================= Level 15：未来走廊 =================
// 未来主义风格的白色/灰色混凝土走廊，墙上与天花板有白色钢管和蔓藤花纹般的符号。
// 走廊尽头是带金属加固门的大房间，墙壁有一部分由厚玻璃制成，里面是大小不一的机器。
// 大灯把空荡荡的走廊照得发白；唯一不是这个颜色的，是尸体旁边干涸的血。
// 出口：传言找到一个发光的光点就可以进入随机层级。
function generateFutureMap(level) {
  const size = mapSizeFor(level);
  const built = buildRoomLayer(size, { roomW: [6, 12], roomH: [6, 12], density: 1.05, startRoom: 8 });
  const grid = built.grid, rooms = built.rooms;
  const start = { x: Math.floor(size / 2), y: Math.floor(size / 2), floor: 0 };
  const floors = collectFloors(grid, size);
  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [floors], rooms: [rooms],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props: [], crates: [], ground: [],
    machines: [],      // 玻璃墙机房里的机器
    bodies: [],        // 干枯的尸体（穿着实验室制服）
    lightPoint: null,  // 发光的光点 -> 随机层级
    // 透光窗户：Level 15 也有亮着的窗，但里面没有窗灵 —— 只是光
    windows15: [],
    lit15: new Set(),
  };
  makeDoorsMap(map);

  // 透光的窗户：白色钢管之间的墙上开着窗，光洒进来 —— 站进去不会有事
  {
    const seen = new Set();
    const win = [];
    for (let i = 0; i < 500 && win.length < 30; i++) {
      const t = floors[randInt(0, floors.length - 1)];
      if (!t) break;
      const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      const d2 = dirs[randInt(0, 3)];
      const wx = t.x + d2[0], wy = t.y + d2[1];
      if (wx < 1 || wy < 1 || wx >= size - 1 || wy >= size - 1) continue;
      if (grid[wy][wx] !== 1) continue;
      const k = wx + "," + wy;
      if (seen.has(k)) continue;
      seen.add(k);
      win.push({ x: wx, y: wy, dx: -d2[0], dy: -d2[1], lit: Math.random() < 0.45 });
    }
    for (const w of win) {
      if (!w.lit) continue;
      for (let step = 1; step <= 4; step++) {
        const cx = w.x + w.dx * step, cy = w.y + w.dy * step;
        if (cx < 0 || cy < 0 || cx >= size || cy >= size) break;
        if (grid[cy][cx] !== 0) break;
        const spread = step >= 3 ? 1 : 0;
        for (let sp = -spread; sp <= spread; sp++) {
          const qx = cx + (w.dy !== 0 ? sp : 0), qy = cy + (w.dx !== 0 ? sp : 0);
          if (qx < 0 || qy < 0 || qx >= size || qy >= size) continue;
          if (grid[qy][qx] === 0) map.lit15.add(qx + "," + qy);
        }
      }
    }
    map.windows15 = win;
  }

  const used = new Set();
  const freeIn = (r, minD) => {
    for (let i = 0; i < 80; i++) {
      const x = randInt(r.x, r.x + r.w - 1), y = randInt(r.y, r.y + r.h - 1);
      if (!grid[y] || grid[y][x] !== 0) continue;
      const k = x + "," + y;
      if (used.has(k)) continue;
      if (Math.abs(x - start.x) + Math.abs(y - start.y) < minD) continue;
      used.add(k);
      return { x, y };
    }
    return null;
  };

  for (const r of rooms) {
    const roll = Math.random();
    if (roll < 0.30) {
      r.roomType = "engine";
      const n = randInt(1, 3);
      for (let i = 0; i < n; i++) {
        const t = freeIn(r, 4);
        if (t) map.machines.push({ x: t.x, y: t.y, floor: 0, size: rand(0.5, 1.7), on: Math.random() < 0.8, ph: Math.random() * 6 });
      }
    } else if (roll < 0.46) {
      r.roomType = "lab";
      const t = freeIn(r, 4);
      if (t) map.props.push({ x: t.x, y: t.y, floor: 0, type: "terminal" });
    } else if (roll < 0.56) {
      r.roomType = "dorm";
      const t = freeIn(r, 4);
      if (t) map.props.push({ x: t.x, y: t.y, floor: 0, type: "bed" });
    } else if (roll < 0.64) {
      r.roomType = "kitchen";
    } else if (roll < 0.72) {
      r.roomType = "storage";
      const t = freeIn(r, 4);
      if (t) map.ground.push({ x: t.x, y: t.y, floor: 0, item: "almond", taken: false });
    } else {
      r.roomType = "empty";
    }
    // 穿着实验室制服、和未知东西战斗过的尸体（这里没有杏仁水）
    if (Math.random() < 0.20) {
      const t = freeIn(r, 6);
      if (t) map.bodies.push({ x: t.x, y: t.y, floor: 0 });
    }
  }

  let far = null, bd = -1;
  for (const r of rooms) {
    if (r.start) continue;
    const d = Math.abs(r.x - start.x) + Math.abs(r.y - start.y);
    if (d > bd) { bd = d; far = r; }
  }
  if (far) {
    const t = freeIn(far, 10);
    if (t) map.lightPoint = addDoor(map, [{ x: t.x, y: t.y, dir: "v" }], 0, "light15", {});
  }
  return map;
}

// ================= Level 70：霜冻城镇 =================
// 一颗围绕恒星"卡洛"运行的行星体，气温常在 -15°C ~ -45°C 之间，猛烈的降雪。
// 市区 + 郊区：房子里是暖的，也有食物；郊区的庭院里有冰屋。
// 一整套管道把杏仁水送到办公楼的水池与房屋的水槽里 —— 但数量大概有限。
// 街上的车会自己动，驾驶技术极差，每天至少撞死两个人。
// 博恩斯河与自身连接成一个大回环；森林里的实体最多。
// 出口：建筑物内标着编号的门 -> Level 0 / Level 13。
function generateFrostMap(level) {
  const size = mapSizeFor(level);
  const grid = makeGrid(size);
  const B = 11, RW = 2;                 // 街区周期：2 格马路 + 9 格街区
  const start = { x: Math.floor(size / 2), y: Math.floor(size / 2), floor: 0 };

  // 马路
  for (let y = 2; y < size - 2; y++) {
    for (let x = 2; x < size - 2; x++) {
      if (x % B < RW || y % B < RW) grid[y][x] = 0;
    }
  }

  const map = {
    size, level, doubleStory: false,
    layers: [grid], floors: [null], rooms: [[]],
    start, exit: null,
    doors: [], ramps: [], redFloor: new Set(), transit: null, transits: null,
    props: [], crates: [], ground: [],
    indoor: new Set(),      // 室内（暖和）
    buildings: [],
    vehicles: [],
    igloos: [],
    fountains: [],          // 管道送来的杏仁水
    river: new Set(),
    forest: new Set(),
    frostDoors: [],
  };
  makeDoorsMap(map);

  // 建筑：占满街区内部，留一格当门厅接到马路上
  for (let by = 0; by < size; by += B) {
    for (let bx = 0; bx < size; bx += B) {
      const x0 = bx + RW, y0 = by + RW, w = B - RW - 1, h = B - RW - 1;
      if (x0 < 2 || y0 < 2 || x0 + w >= size - 2 || y0 + h >= size - 2) continue;
      carveRoom(grid, size, x0, y0, w, h);
      const b = { x: x0, y: y0, w, h };
      map.buildings.push(b);
      for (let yy = y0; yy < y0 + h; yy++) {
        for (let xx = x0; xx < x0 + w; xx++) map.indoor.add(xx + "," + yy);
      }
      // 门厅：从房子接回路面
      const side = randInt(0, 3);
      if (side === 0) { const dy = y0 + randInt(0, h - 1); grid[dy][x0 + w] = 0; map.indoor.add((x0 + w) + "," + dy); }
      else if (side === 1) { const dy = y0 + randInt(0, h - 1); grid[dy][x0 - 1] = 0; map.indoor.add((x0 - 1) + "," + dy); }
      else if (side === 2) { const dx = x0 + randInt(0, w - 1); grid[y0 + h][dx] = 0; map.indoor.add(dx + "," + (y0 + h)); }
      else { const dx = x0 + randInt(0, w - 1); grid[y0 - 1][dx] = 0; map.indoor.add(dx + "," + (y0 - 1)); }
    }
  }
  // 出生点必须在室内，不然一进来就开始冻
  let sb = null, sbd = 1e9;
  for (const b of map.buildings) {
    const d = Math.abs(b.x + b.w / 2 - start.x) + Math.abs(b.y + b.h / 2 - start.y);
    if (d < sbd) { sbd = d; sb = b; }
  }
  if (sb) { start.x = sb.x + Math.floor(sb.w / 2); start.y = sb.y + Math.floor(sb.h / 2); }

  map.floors = [collectFloors(grid, size)];

  // 冰屋：郊区庭院里的温暖睡处
  for (let i = 0; i < 6; i++) {
    const b = map.buildings[randInt(0, map.buildings.length - 1)];
    if (!b) continue;
    const x = b.x + randInt(-3, b.w + 2), y = b.y + randInt(-3, b.h + 2);
    if (x < 3 || y < 3 || x >= size - 3 || y >= size - 3) continue;
    grid[y][x] = 0;
    map.igloos.push({ x, y });
    map.indoor.add(x + "," + y);
  }

  // 杏仁水管道：房屋水槽与办公楼水池
  for (let i = 0; i < 14; i++) {
    const b = map.buildings[randInt(0, map.buildings.length - 1)];
    if (!b) continue;
    const x = b.x + randInt(0, b.w - 1), y = b.y + randInt(0, b.h - 1);
    map.fountains.push({ x, y, uses: randInt(1, 3) });
  }

  // 房屋水槽里接的杏仁水（管道送来的，别一次取空）
  for (let i = 0; i < 12; i++) {
    const b = map.buildings[randInt(0, map.buildings.length - 1)];
    if (!b) continue;
    map.ground.push({ x: b.x + randInt(0, b.w - 1), y: b.y + randInt(0, b.h - 1), floor: 0, item: "almond", taken: false });
  }

  // 博恩斯河：一条横穿地图、与自身相连的大回环
  {
    const base = Math.floor(size * 0.72);
    for (let x = 3; x < size - 3; x++) {
      const y = base + Math.round(Math.sin(x * 0.13) * 4);
      if (y < 3 || y >= size - 3) continue;
      grid[y][x] = 0;
      grid[y + 1][x] = 0;
      map.river.add(x + "," + y);
      map.river.add(x + "," + (y + 1));
    }
  }

  // 森林：实体最多的地方
  for (let i = 0; i < 4; i++) {
    const cx = randInt(6, size - 8), cy = randInt(6, size - 8), r = randInt(3, 5);
    for (let y = cy - r; y <= cy + r; y++) {
      for (let x = cx - r; x <= cx + r; x++) {
        if (x < 3 || y < 3 || x >= size - 3 || y >= size - 3) continue;
        map.forest.add(x + "," + y);
      }
    }
  }

  // 会自己开的车：轨迹随机，撞上就是两米金属碎片
  for (let i = 0; i < 7; i++) {
    let x = 0, y = 0, ok = false;
    for (let k = 0; k < 200 && !ok; k++) {
      x = randInt(3, size - 4); y = randInt(3, size - 4);
      if (grid[y][x] === 0 && !map.indoor.has(x + "," + y)) ok = true;
    }
    if (!ok) continue;
    const a = rand(0, Math.PI * 2);
    map.vehicles.push({ x, y, vx: Math.cos(a) * 1.5, vy: Math.sin(a) * 1.5, turn: rand(0.4, 1.6), alive: true });
  }

  // 标着编号的门 -> Level 0 / Level 13
  const targets = [0, 13];
  for (let i = 0; i < 3; i++) {
    const b = map.buildings[randInt(0, map.buildings.length - 1)];
    if (!b) continue;
    const t = { x: b.x + randInt(0, b.w - 1), y: b.y + randInt(0, b.h - 1) };
    const d = addDoor(map, [{ x: t.x, y: t.y, dir: "v" }], 0, "frostdoor", { target: targets[i % targets.length] });
    if (d) map.frostDoors.push(d);
  }
  return map;
}
