"use strict";
// ============================================================
// 后室逃生 · 账号 / 云存档 / 在线人数 后端
//
//   安装依赖：  npm install
//   填写配置：  cp .env.example .env  （或直接改下面的 DEFAULTS）
//   启动：      npm start          默认监听 3000
//
// 只需要一台能连到腾讯云 MySQL 的机器（轻量应用服务器 / 云函数 / 容器都行）。
// ============================================================

const express = require("express");
const mysql = require("mysql2/promise");
const crypto = require("crypto");

// ---------- 配置（环境变量优先）----------
const CFG = {
  PORT: process.env.PORT || 3000,
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: Number(process.env.DB_PORT || 3306),
  DB_USER: process.env.DB_USER || "root",
  DB_PASS: process.env.DB_PASS || "",
  DB_NAME: process.env.DB_NAME || "backrooms",
  DB_SSL: process.env.DB_SSL === "1",
  // 前端地址（跨域白名单），多个用逗号分隔
  ORIGIN: process.env.ORIGIN || "*",
  // 心跳有效期（秒）：超过这个时间没心跳就算离开
  ONLINE_TTL: Number(process.env.ONLINE_TTL || 90),
};

const pool = mysql.createPool({
  host: CFG.DB_HOST,
  port: CFG.DB_PORT,
  user: CFG.DB_USER,
  password: CFG.DB_PASS,
  database: CFG.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ...(CFG.DB_SSL ? { ssl: { rejectUnauthorized: false } } : {}),
});

// ---------- 工具 ----------
const NICK_RE = /^[^\s]{2,24}$/; // 2~24 个字符，不含空白
function validNick(n) { return typeof n === "string" && NICK_RE.test(n.trim()); }

// scrypt 派生：salt 随机 32 字节，密钥 64 字节
function hashPwd(pwd, saltBuf) {
  const salt = saltBuf || crypto.randomBytes(32);
  const hash = crypto.scryptSync(String(pwd), salt, 64, { N: 16384, r: 8, p: 1 });
  return { salt, hash };
}
function safeEqual(a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b) || a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
function randToken(n) { return crypto.randomBytes(n).toString("hex"); }

// ---------- 会话 ----------
// token -> { userId, nickname }   （生产环境建议换成 Redis / JWT）
const sessions = new Map();
function newSession(userId, nickname) {
  const token = randToken(24);
  sessions.set(token, { userId, nickname, at: Date.now() });
  return token;
}
function auth(req) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  return token ? sessions.get(token) || null : null;
}

// ---------- 应用 ----------
const app = express();
app.use(express.json({ limit: "512kb" }));
app.use((req, res, next) => {
  const o = CFG.ORIGIN === "*" ? "*" : CFG.ORIGIN;
  res.setHeader("Access-Control-Allow-Origin", o);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

const ok = (res, data) => res.json(Object.assign({ ok: true }, data));
const bad = (res, msg, code) => res.status(code || 400).json({ ok: false, msg });

// ---- 健康检查 ----
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    ok(res, { db: "up", online: sessions.size });
  } catch (e) {
    bad(res, "数据库连不上：" + e.message, 500);
  }
});

// ---- 注册 ----
app.post("/api/register", async (req, res) => {
  try {
    const nickname = String(req.body.nickname || "").trim();
    const pwd = String(req.body.password || "");
    if (!validNick(nickname)) return bad(res, "昵称需为 2~24 个字符，且不含空格");
    if (pwd.length < 6 || pwd.length > 64) return bad(res, "密码需 6~64 位");

    const [dup] = await pool.query("SELECT id FROM users WHERE nickname = ?", [nickname]);
    if (dup.length) return bad(res, "这个昵称已经被占用了", 409);

    const { salt, hash } = hashPwd(pwd);
    const [r] = await pool.query(
      "INSERT INTO users (nickname, pwd_hash, pwd_salt) VALUES (?, ?, ?)",
      [nickname, hash, salt]
    );
    // 新账号给一份空存档，省得第一次同步时判空
    await pool.query(
      "INSERT INTO saves (user_id, payload) VALUES (?, ?) ON DUPLICATE KEY UPDATE payload = payload",
      [r.insertId, JSON.stringify(emptySave())]
    );
    const token = newSession(r.insertId, nickname);
    ok(res, { token, userId: r.insertId, nickname, save: emptySave() });
  } catch (e) {
    bad(res, "注册失败：" + e.message, 500);
  }
});

// ---- 登录 ----
app.post("/api/login", async (req, res) => {
  try {
    const nickname = String(req.body.nickname || "").trim();
    const pwd = String(req.body.password || "");
    const [rows] = await pool.query("SELECT * FROM users WHERE nickname = ?", [nickname]);
    if (!rows.length) return bad(res, "账号不存在", 404);
    const u = rows[0];
    const { hash } = hashPwd(pwd, u.pwd_salt);
    if (!safeEqual(hash, u.pwd_hash)) return bad(res, "密码不对", 401);

    await pool.query("UPDATE users SET last_login = NOW(3) WHERE id = ?", [u.id]);
    const [s] = await pool.query("SELECT payload FROM saves WHERE user_id = ?", [u.id]);
    const save = s.length ? s[0].payload : emptySave();
    const token = newSession(u.id, u.nickname);
    ok(res, { token, userId: u.id, nickname: u.nickname, save });
  } catch (e) {
    bad(res, "登录失败：" + e.message, 500);
  }
});

// ---- 当前登录者信息 ----
app.get("/api/me", (req, res) => {
  const s = auth(req);
  if (!s) return bad(res, "未登录", 401);
  ok(res, { userId: s.userId, nickname: s.nickname });
});

// ---- 退出 ----
app.post("/api/logout", (req, res) => {
  const h = req.headers.authorization || "";
  const t = h.startsWith("Bearer ") ? h.slice(7) : "";
  sessions.delete(t);
  ok(res, {});
});

// ---- 拉取存档 ----
app.get("/api/save", async (req, res) => {
  const s = auth(req);
  if (!s) return bad(res, "未登录", 401);
  try {
    const [rows] = await pool.query("SELECT payload FROM saves WHERE user_id = ?", [s.userId]);
    ok(res, { save: rows.length ? rows[0].payload : emptySave() });
  } catch (e) { bad(res, e.message, 500); }
});

// ---- 上传存档（整块覆盖；合并策略在前端做）----
app.post("/api/save", async (req, res) => {
  const s = auth(req);
  if (!s) return bad(res, "未登录", 401);
  const payload = req.body && req.body.save;
  if (!payload || typeof payload !== "object") return bad(res, "存档格式不对");
  try {
    await pool.query(
      "INSERT INTO saves (user_id, payload) VALUES (?, ?) " +
      "ON DUPLICATE KEY UPDATE payload = VALUES(payload), updated_at = NOW(3)",
      [s.userId, JSON.stringify(payload)]
    );
    ok(res, { updatedAt: Date.now() });
  } catch (e) { bad(res, e.message, 500); }
});

// ---- 心跳 + 在线人数 ----
// 登录的和没登录的都会打这个接口，所以在线人数两边都算。
app.post("/api/heartbeat", async (req, res) => {
  try {
    const s = auth(req);
    let sessKey;
    if (s) {
      sessKey = "usr:" + s.userId;
    } else {
      const anon = String((req.body && req.body.anonId) || "").slice(0, 64);
      if (!anon) return bad(res, "缺少 anonId");
      sessKey = "anon:" + anon;
    }
    const label = String((req.body && req.body.level) || "").slice(0, 40) || null;
    await pool.query(
      "INSERT INTO online (sess_key, user_id, anon, nickname, level_label, last_seen) " +
      "VALUES (?, ?, ?, ?, ?, NOW(3)) " +
      "ON DUPLICATE KEY UPDATE last_seen = NOW(3), level_label = VALUES(level_label)",
      [sessKey, s ? s.userId : null, s ? 0 : 1, s ? s.nickname : null, label]
    );
    const [rows] = await pool.query(
      "SELECT COUNT(*) AS n FROM online WHERE last_seen > NOW(3) - INTERVAL ? SECOND",
      [CFG.ONLINE_TTL]
    );
    const [rows2] = await pool.query(
      "SELECT COUNT(*) AS n FROM online WHERE anon = 0 AND last_seen > NOW(3) - INTERVAL ? SECOND",
      [CFG.ONLINE_TTL]
    );
    ok(res, { online: rows[0].n, logged: rows2[0].n });
  } catch (e) { bad(res, e.message, 500); }
});

// ---- 只查在线人数（不写心跳）----
app.get("/api/online", async (req, res) => {
  try {
    const [a] = await pool.query(
      "SELECT COUNT(*) AS n FROM online WHERE last_seen > NOW(3) - INTERVAL ? SECOND",
      [CFG.ONLINE_TTL]
    );
    const [b] = await pool.query(
      "SELECT COUNT(*) AS n FROM online WHERE anon = 0 AND last_seen > NOW(3) - INTERVAL ? SECOND",
      [CFG.ONLINE_TTL]
    );
    ok(res, { online: a[0].n, logged: b[0].n });
  } catch (e) { bad(res, e.message, 500); }
});

function emptySave() {
  return {
    archives: [],   // 已收集的档案 id
    unlocks: [],    // 已解锁的服装
    outfit: "",     // 当前穿着
    endings: [],    // 已达成的结局
    hub: [],        // 枢纽里已经开过的门（层级编号）
    weights: null,  // AI 权重设置
    updatedAt: 0,
  };
}

// 定时清理过期心跳
setInterval(() => {
  pool.query("DELETE FROM online WHERE last_seen < NOW(3) - INTERVAL 1 HOUR").catch(() => {});
}, 10 * 60 * 1000);

app.listen(CFG.PORT, () => {
  console.log("后室 · 云服务已启动 → http://localhost:" + CFG.PORT);
  console.log("数据库： " + CFG.DB_HOST + ":" + CFG.DB_PORT + "/" + CFG.DB_NAME);
});
