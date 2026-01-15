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

-- AI任务表
CREATE TABLE IF NOT EXISTS `ai_tasks` (
  `id`            BIGINT NOT NULL AUTO_INCREMENT,
  `user_id`       BIGINT NULL,
  `title`         VARCHAR(255) NOT NULL,
  `description`   TEXT NULL,
  `type`          ENUM('INVESTMENT','LEARNING','WORK','OTHER') NOT NULL,
  `status`        ENUM('ACTIVE','COMPLETED','ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
  `event_id`      VARCHAR(64) NULL,
  `created_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `completed_at`  DATETIME NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ai_tasks_status` (`status`),
  KEY `idx_ai_tasks_type` (`type`),
  KEY `idx_ai_tasks_event_id` (`event_id`),
  CONSTRAINT `fk_ai_tasks_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 对话会话表
CREATE TABLE IF NOT EXISTS `conversations` (
  `id`              BIGINT NOT NULL AUTO_INCREMENT,
  `task_id`         BIGINT NOT NULL,
  `session_id`      VARCHAR(64) NOT NULL,
  `title`           VARCHAR(255) NULL,
  `status`          ENUM('ACTIVE','PAUSED','ENDED') NOT NULL DEFAULT 'ACTIVE',
  `created_at`      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_message_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_conversations_session_id` (`session_id`),
  KEY `idx_conversations_task_id` (`task_id`),
  KEY `idx_conversations_status` (`status`),
  CONSTRAINT `fk_conversations_task` FOREIGN KEY (`task_id`) REFERENCES `ai_tasks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 对话消息表
CREATE TABLE IF NOT EXISTS `conversation_messages` (
  `id`              BIGINT NOT NULL AUTO_INCREMENT,
  `conversation_id` BIGINT NOT NULL,
  `role`            ENUM('USER','ASSISTANT','SYSTEM') NOT NULL,
  `content`          LONGTEXT NOT NULL,
  `metadata_json`   JSON NULL,
  `sequence`        INT NOT NULL,
  `created_at`      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_messages_conversation_id` (`conversation_id`),
  KEY `idx_messages_sequence` (`conversation_id`, `sequence`),
  CONSTRAINT `fk_messages_conversation` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- AI笔记表
CREATE TABLE IF NOT EXISTS `ai_notes` (
  `id`              BIGINT NOT NULL AUTO_INCREMENT,
  `task_id`         BIGINT NOT NULL,
  `conversation_id` BIGINT NULL,
  `title`           VARCHAR(255) NOT NULL,
  `content`          LONGTEXT NOT NULL,
  `summary`         TEXT NULL,
  `tags`            JSON NULL,
  `structure_json`  JSON NULL,
  `version`         INT NOT NULL DEFAULT 1,
  `created_at`      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notes_task_id` (`task_id`),
  KEY `idx_notes_conversation_id` (`conversation_id`),
  CONSTRAINT `fk_notes_task` FOREIGN KEY (`task_id`) REFERENCES `ai_tasks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_notes_conversation` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 知识片段表
CREATE TABLE IF NOT EXISTS `knowledge_fragments` (
  `id`            BIGINT NOT NULL AUTO_INCREMENT,
  `task_id`       BIGINT NOT NULL,
  `source_type`   ENUM('MESSAGE','NOTE','EXTERNAL') NOT NULL,
  `source_id`     BIGINT NULL,
  `content`       TEXT NOT NULL,
  `embedding`     BLOB NULL,
  `metadata_json` JSON NULL,
  `created_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_knowledge_task_id` (`task_id`),
  KEY `idx_knowledge_source` (`source_type`, `source_id`),
  FULLTEXT KEY `ft_knowledge_content` (`content`),
  CONSTRAINT `fk_knowledge_task` FOREIGN KEY (`task_id`) REFERENCES `ai_tasks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 外部资料表
CREATE TABLE IF NOT EXISTS `external_resources` (
  `id`            BIGINT NOT NULL AUTO_INCREMENT,
  `task_id`       BIGINT NOT NULL,
  `url`           VARCHAR(512) NOT NULL,
  `title`         VARCHAR(255) NULL,
  `content`       LONGTEXT NULL,
  `resource_type` ENUM('WEB_PAGE','PDF','IMAGE') NOT NULL,
  `metadata_json` JSON NULL,
  `collected_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_resources_task_id` (`task_id`),
  KEY `idx_resources_url` (`url`(255)),
  CONSTRAINT `fk_resources_task` FOREIGN KEY (`task_id`) REFERENCES `ai_tasks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
