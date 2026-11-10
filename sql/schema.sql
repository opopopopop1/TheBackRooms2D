-- ============================================================
-- 后室逃生 · 账号与云存档（腾讯云数据库 MySQL / TencentDB）
-- 字符集统一 utf8mb4，避免昵称里的 emoji 存不进去
-- ============================================================

CREATE DATABASE IF NOT EXISTS `backrooms`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `backrooms`;

-- ---------- 1. 账号表 ----------
CREATE TABLE IF NOT EXISTS `users` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nickname`    VARCHAR(24)  NOT NULL COMMENT '昵称，唯一',
  `pwd_hash`    VARBINARY(64) NOT NULL COMMENT 'scrypt 派生密钥，64 字节',
  `pwd_salt`    VARBINARY(32) NOT NULL COMMENT '随机盐，32 字节',
  `created_at`  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `last_login`  DATETIME(3)  DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_nickname` (`nickname`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='玩家账号';

-- ---------- 2. 云存档表 ----------
-- 一个账号一行。payload 是整份存档的 JSON，读改写在前端做合并，
-- 服务端只负责整块存取 —— 不做行级拆分，省事也够用。
CREATE TABLE IF NOT EXISTS `saves` (
  `user_id`    INT UNSIGNED NOT NULL,
  `payload`    JSON NOT NULL,
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                            ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_saves_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='云端存档（档案 / 服装 / 结局 / 设置）';

-- ---------- 3. 在线人数表 ----------
-- 登录玩家与游客都进这张表：游客用浏览器本地生成的 anon_id。
-- 前端每 30 秒心跳一次；超过 90 秒没心跳的视为离开，不再计入。
CREATE TABLE IF NOT EXISTS `online` (
  `sess_key`   VARCHAR(64) NOT NULL COMMENT '登录者=usr:{id}；游客=anon:{uuid}',
  `user_id`    INT UNSIGNED DEFAULT NULL COMMENT '游客为 NULL',
  `anon`       TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1=未登录游客',
  `nickname`   VARCHAR(24) DEFAULT NULL COMMENT '游客为 NULL',
  `level_label` VARCHAR(40) DEFAULT NULL COMMENT '当前所在层级，仅用于展示',
  `last_seen`  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`sess_key`),
  KEY `idx_last_seen` (`last_seen`),
  CONSTRAINT `fk_online_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='在线心跳（含未登录游客）';

-- ---------- 常用查询 ----------
-- 当前游玩人数（登录 + 未登录都算，90 秒内有过心跳）
--   SELECT COUNT(*) FROM `online` WHERE `last_seen` > NOW(3) - INTERVAL 90 SECOND;

-- 清理过期记录（建议后端定时执行，或建事件调度器）
--   DELETE FROM `online` WHERE `last_seen` < NOW(3) - INTERVAL 1 HOUR;

-- 可选：让 MySQL 自动清理（需开启 event_scheduler）
--   SET GLOBAL event_scheduler = ON;
--   CREATE EVENT IF NOT EXISTS `ev_clean_online`
--     ON SCHEDULE EVERY 10 MINUTE
--     DO DELETE FROM `online` WHERE `last_seen` < NOW(3) - INTERVAL 1 HOUR;
