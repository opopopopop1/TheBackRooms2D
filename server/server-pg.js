"use strict";
// ============================================================
// 后室逃生 · 账号 / 云存档 / 在线人数 后端（PostgreSQL 版）
//
//   安装依赖：  npm install            （若已装过 mysql2 版，先 npm install pg）
//   填写配置：  cp .env.example .env
//   启动：      node server-pg.js     默认监听 3000
//
// 与 MySQL 版的差异都集中在 pool.query 的占位符（$1 而非 ?）和 upsert 语法上，
// 对外 API 完全一致，前端不用改。
// ============================================================

const express = require("express");
const { Pool } = require("pg");
const crypto = require("crypto");

const CFG = {
  PORT: process.env.PORT || 3000,
  // 也可以用 DATABASE_URL（腾讯云控制台会给一串连接串，直接贴进来最省事）
  DB_URL: process.env.DATABASE_URL || "",
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: Number(process.env.DB_PORT || 5432),
  DB_USER: process.env.DB_USER || "postgres",
  DB_PASS: process.env.DB_PASS || "",
  DB_NAME: process.env.DB_NAME || "backrooms",
  DB_SSL: process.env.DB_SSL === "1",
  ORIGIN: process.env.ORIGIN || "*",
  ONLINE_TTL: Number(process.env.ONLINE_TTL || 90),
};

const pool = new Pool(
  CFG.DB_URL
    ? { connectionString: CFG.DB_URL, ...(CFG.DB_SSL ? { ssl: { rejectUnauthorized: false } } : {}) }
    : {
        host: CFG.DB_HOST, port: CFG.DB_PORT, user: CFG.DB_USER,
        password: CFG.DB_PASS, database: CFG.DB_NAME,
        ...(CFG.DB_SSL ? { ssl: { rejectUnauthorized: false } } : {}),
      }
);

// ---------- 工具 ----------
const NICK_RE = /^[^\s]{2,24}$/;
const validNick = (n) => typeof n === "string" && NICK_RE.test(n.trim());

function hashPwd(pwd, saltBuf) {
  const salt = saltBuf || crypto.randomBytes(32);
  return { salt, hash: crypto.scryptSync(String(pwd), salt, 64, { N: 16384, r: 8, p: 1 }) };
}
function safeEqual(a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b) || a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
const randToken = (n) => crypto.randomBytes(n).toString("hex");

// ---------- 会话 ----------
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
  res.setHeader("Access-Control-Allow-Origin", CFG.ORIGIN === "*" ? "*" : CFG.ORIGIN);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});
const ok = (res, data) => res.json(Object.assign({ ok: true }, data));
const bad = (res, msg, code) => res.status(code || 400).json({ ok: false, msg });

// 存档结构
function emptySave() {
  return { archives: [], unlocks: [], outfit: "", endings: [], hub: [], weights: null, updatedAt: 0 };
}
const ttl = () => `${CFG.ONLINE_TTL} seconds`;

app.get("/api/health", async (req, res) => {
  try { await pool.query("SELECT 1"); ok(res, { db: "up", online: sessions.size }); }
  catch (e) { bad(res, "数据库连不上：" + e.message, 500); }
});

// ---- 注册 ----
app.post("/api/register", async (req, res) => {
  try {
    const nickname = String(req.body.nickname || "").trim();
    const pwd = String(req.body.password || "");
    if (!validNick(nickname)) return bad(res, "昵称需为 2~24 个字符，且不含空格");
    if (pwd.length < 6 || pwd.length > 64) return bad(res, "密码需 6~64 位");

    const dup = await pool.query('SELECT id FROM "users" WHERE "nickname" = $1', [nickname]);
    if (dup.rows.length) return bad(res, "这个昵称已经被占用了", 409);

    const { salt, hash } = hashPwd(pwd);
    const r = await pool.query(
      'INSERT INTO "users" ("nickname","pwd_hash","pwd_salt") VALUES ($1,$2,$3) RETURNING "id"',
      [nickname, hash, salt]
    );
    const id = r.rows[0].id;
    await pool.query(
      'INSERT INTO "saves" ("user_id","payload") VALUES ($1,$2) ' +
      'ON CONFLICT ("user_id") DO NOTHING',
      [id, JSON.stringify(emptySave())]
    );
    const token = newSession(id, nickname);
    ok(res, { token, userId: id, nickname, save: emptySave() });
  } catch (e) { bad(res, "注册失败：" + e.message, 500); }
});

// ---- 登录 ----
app.post("/api/login", async (req, res) => {
  try {
    const nickname = String(req.body.nickname || "").trim();
    const pwd = String(req.body.password || "");
    const r = await pool.query('SELECT * FROM "users" WHERE "nickname" = $1', [nickname]);
    if (!r.rows.length) return bad(res, "账号不存在", 404);
    const u = r.rows[0];

    // pg 返回的 BYTEA 是 Buffer；某些驱动配置下会退化成字符串，兜一下
    const saltBuf = Buffer.isBuffer(u.pwd_salt) ? u.pwd_salt : Buffer.from(u.pwd_salt, "hex");
    const storedBuf = Buffer.isBuffer(u.pwd_hash) ? u.pwd_hash : Buffer.from(u.pwd_hash, "hex");
    if (!safeEqual(hashPwd(pwd, saltBuf).hash, storedBuf)) return bad(res, "密码不对", 401);

    await pool.query('UPDATE "users" SET "last_login" = CURRENT_TIMESTAMP WHERE "id" = $1', [u.id]);
    const s = await pool.query('SELECT "payload" FROM "saves" WHERE "user_id" = $1', [u.id]);
    const save = s.rows.length ? s.rows[0].payload : emptySave();
    const token = newSession(u.id, u.nickname);
    ok(res, { token, userId: u.id, nickname: u.nickname, save });
  } catch (e) { bad(res, "登录失败：" + e.message, 500); }
});

app.get("/api/me", (req, res) => {
  const s = auth(req);
  if (!s) return bad(res, "未登录", 401);
  ok(res, { userId: s.userId, nickname: s.nickname });
});

app.post("/api/logout", (req, res) => {
  const h = req.headers.authorization || "";
  sessions.delete(h.startsWith("Bearer ") ? h.slice(7) : "");
  ok(res, {});
});

app.get("/api/save", async (req, res) => {
  const s = auth(req);
  if (!s) return bad(res, "未登录", 401);
  try {
    const r = await pool.query('SELECT "payload" FROM "saves" WHERE "user_id" = $1', [s.userId]);
    ok(res, { save: r.rows.length ? r.rows[0].payload : emptySave() });
  } catch (e) { bad(res, e.message, 500); }
});

app.post("/api/save", async (req, res) => {
  const s = auth(req);
  if (!s) return bad(res, "未登录", 401);
  const payload = req.body && req.body.save;
  if (!payload || typeof payload !== "object") return bad(res, "存档格式不对");
  try {
    await pool.query(
      'INSERT INTO "saves" ("user_id","payload","updated_at") VALUES ($1,$2::jsonb,CURRENT_TIMESTAMP) ' +
      'ON CONFLICT ("user_id") DO UPDATE SET "payload" = EXCLUDED."payload", "updated_at" = CURRENT_TIMESTAMP',
      [s.userId, JSON.stringify(payload)]
    );
    ok(res, { updatedAt: Date.now() });
  } catch (e) { bad(res, e.message, 500); }
});

// ---- 心跳 + 在线人数（登录与未登录都计入）----
app.post("/api/heartbeat", async (req, res) => {
  try {
    const s = auth(req);
    let sessKey;
    if (s) sessKey = "usr:" + s.userId;
    else {
      const anon = String((req.body && req.body.anonId) || "").slice(0, 64);
      if (!anon) return bad(res, "缺少 anonId");
      sessKey = "anon:" + anon;
    }
    const label = String((req.body && req.body.level) || "").slice(0, 40) || null;
    await pool.query(
      'INSERT INTO "online" ("sess_key","user_id","anon","nickname","level_label","last_seen") ' +
      'VALUES ($1,$2,$3,$4,$5,CURRENT_TIMESTAMP) ' +
      'ON CONFLICT ("sess_key") DO UPDATE SET "last_seen" = CURRENT_TIMESTAMP, ' +
      '"level_label" = EXCLUDED."level_label"',
      [sessKey, s ? s.userId : null, !s, s ? s.nickname : null, label]
    );
    const a = await pool.query(
      `SELECT COUNT(*)::int AS n FROM "online" WHERE "last_seen" > NOW() - INTERVAL '${ttl()}'`
    );
    const b = await pool.query(
      `SELECT COUNT(*)::int AS n FROM "online" WHERE "anon" = FALSE AND "last_seen" > NOW() - INTERVAL '${ttl()}'`
    );
    ok(res, { online: a.rows[0].n, logged: b.rows[0].n });
  } catch (e) { bad(res, e.message, 500); }
});

app.get("/api/online", async (req, res) => {
  try {
    const a = await pool.query(
      `SELECT COUNT(*)::int AS n FROM "online" WHERE "last_seen" > NOW() - INTERVAL '${ttl()}'`
    );
    const b = await pool.query(
      `SELECT COUNT(*)::int AS n FROM "online" WHERE "anon" = FALSE AND "last_seen" > NOW() - INTERVAL '${ttl()}'`
    );
    ok(res, { online: a.rows[0].n, logged: b.rows[0].n });
  } catch (e) { bad(res, e.message, 500); }
});

// 定时清理过期心跳
setInterval(() => {
  pool.query(`DELETE FROM "online" WHERE "last_seen" < NOW() - INTERVAL '1 hour'`).catch(() => {});
}, 10 * 60 * 1000);

app.listen(CFG.PORT, () => {
  console.log("后室 · 云服务已启动（PostgreSQL）→ http://localhost:" + CFG.PORT);
  console.log(CFG.DB_URL ? "连接方式：DATABASE_URL" : "数据库：" + CFG.DB_HOST + ":" + CFG.DB_PORT + "/" + CFG.DB_NAME);
});
