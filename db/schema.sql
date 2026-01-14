-- 初始化数据库与表结构（MySQL 8+）
-- 请根据实际环境调整数据库名和账户权限

CREATE DATABASE IF NOT EXISTS `imb_db`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `imb_db`;

-- 事件表
CREATE TABLE IF NOT EXISTS `events` (
  `id`            VARCHAR(64)  NOT NULL,
  `title`         VARCHAR(255) NOT NULL,
  `type`          ENUM('ROUTINE','REMINDER','LEARNING') NOT NULL,
  `scope`         ENUM('DAY','WEEK','MONTH','YEAR','IDEA') NOT NULL,
  `priority`      ENUM('HIGH','MEDIUM','LOW') NOT NULL,
  `status`        ENUM('TODO','DONE','WAITING') NOT NULL,
  `event_date`    DATE NULL,
  `event_time`    TIME NULL,
  `description`   TEXT NULL,
  `created_at`    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_events_date` (`event_date`),
  KEY `idx_events_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

