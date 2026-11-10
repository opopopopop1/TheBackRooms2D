# 后室逃生 · 云服务（账号 / 云存档 / 在线人数）

## 一、开通腾讯云数据库 MySQL

1. 控制台 → **云数据库 MySQL** → 新建实例（最低配 1 核 1G 足够；新用户有免费试用）
2. 实例里 **新建库**，库名填 `backrooms`，字符集 **utf8mb4**
3. **外网地址** 开启（本机调试方便；生产环境建议用内网 + 同地域服务器）
4. 安全组 / 白名单放行你的出口 IP
5. 拿到：主机地址、端口、账号、密码

## 二、选数据库版本

| 你的数据库 | 用哪个 SQL | 用哪个后端 |
|---|---|---|
| **PostgreSQL / TDSQL-C PG 版** | `sql/schema-postgres.sql` | `node server-pg.js`（默认） |
| MySQL / TencentDB | `sql/schema.sql` | `node server.js` |

> ⚠️ 两套 SQL **不通用**：MySQL 的 `INT UNSIGNED`、`AUTO_INCREMENT`、反引号在 PG 里都会报错，
> 反之 PG 的 `IDENTITY`、`BYTEA`、`JSONB` 在 MySQL 里也不认。按你的实例类型二选一。

## 二-1、建表（PostgreSQL）

把 `sql/schema-postgres.sql` 的内容在控制台的 SQL 窗口里执行一遍，三张表就建好了：

| 表 | 用途 |
|---|---|
| `users` | 账号（昵称唯一，scrypt 加盐存密码，不存明文） |
| `saves` | 云存档，一个账号一行，整份 JSON |
| `online` | 在线心跳，登录的和游客都进这张表 |

## 三、启动后端

```bash
cd server
npm install              # 会同时装上 pg 和 mysql2
cp .env.example .env     # 填好 DATABASE_URL（或逐项填 DB_*）
npm start                # PostgreSQL 版，默认 3000 端口
# npm run start:mysql    # MySQL 版
```

验证：`curl http://localhost:3000/api/health` 应返回 `{"ok":true,"db":"up",...}`

## 四、前端接上

游戏根目录 `index.html` 里，在 `<script src="js/cloud.js">` 之前加一行：

```html
<script>window.BACKROOMS_API = "https://你的域名";</script>
```

不改的话默认走同源 `/api`（也就是和游戏页面同一个域名）。

## 五、接口一览

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/health` | 健康检查 |
| POST | `/api/register` | 注册 `{nickname,password}` → `{token,userId,nickname,save}` |
| POST | `/api/login` | 登录，同上 |
| GET | `/api/me` | 当前登录者 |
| POST | `/api/logout` | 退出 |
| GET | `/api/save` | 拉取存档 |
| POST | `/api/save` | 上传存档 `{save:{...}}` |
| POST | `/api/heartbeat` | 心跳（带 `anonId`，游客也发），返回在线人数 |
| GET | `/api/online` | 只查在线人数 |

## 六、行为约定

- **不登录**：所有进度照旧写浏览器 localStorage，和以前完全一样。
- **登录后**：本地仍留一份缓存，同时与云端同步；合并规则是"取并集"，
  换设备登录不会丢进度。
- **云端不可用**：静默降级，游戏照常玩，恢复了会自动补传。
- **在线人数**：登录玩家和游客都计入；30 秒一次心跳，90 秒无心跳自动剔除。

## 七、上线建议

- 用 HTTPS（腾讯云免费 SSL 证书 + CDN 或 Nginx 反代）
- 生产环境把会话 token 换成 Redis / JWT，别放内存
- 数据库每天自动备份记得开
