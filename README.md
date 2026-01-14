# I'm Boss (imb) - 个人效率与学习辅助平台

## 项目简介

imb 是 "i'm boss" 的缩写。这是一个个人效率与学习辅助平台，旨在帮助用户像"老板"一样管理自己的每日工作与学习任务。

## 技术栈

### 后端
- **Spring Boot 3.2.0**
- **MySQL 8.0+**
- **Java 17**
- **Maven**

### 前端
- **React 18**
- **Vite**
- **Tailwind CSS**
- **React Router**
- **@uiw/react-md-editor** (Markdown编辑器)

## 项目结构

```
imb/
├── backend/                 # Spring Boot 后端项目
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/imb/
│   │   │   │   ├── entity/      # 实体类
│   │   │   │   ├── repository/  # 数据访问层
│   │   │   │   ├── service/     # 业务逻辑层
│   │   │   │   ├── controller/  # 控制器层
│   │   │   │   ├── dto/         # 数据传输对象
│   │   │   │   └── config/      # 配置类
│   │   │   └── resources/
│   │   │       └── application.yml
│   │   └── test/
│   └── pom.xml
├── frontend/                # React 前端项目
│   ├── src/
│   │   ├── components/     # React 组件
│   │   ├── pages/          # 页面组件
│   │   ├── api/            # API 调用
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 快速开始

### 前置要求

- JDK 17+
- Maven 3.6+
- Node.js 18+
- MySQL 8.0+

### 数据库设置

1. 创建数据库：
```sql
CREATE DATABASE imb_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 修改后端配置文件 `backend/src/main/resources/application.yml` 中的数据库连接信息：
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/imb_db?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai
    username: your_username
    password: your_password
```

### 启动后端

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

后端服务将在 `http://localhost:8080` 启动，API 基础路径为 `/api`

### 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端服务将在 `http://localhost:3000` 启动

## 阶段一功能 (MVP)

✅ **已完成功能：**

1. ✅ 搭建 Spring Boot + MySQL + React 环境
2. ✅ 实现基础的"事件"增删改查（手动创建）
3. ✅ 实现日视图和简单的日历翻页
4. ✅ 集成 Markdown 编辑器

### API 接口

#### 事件管理

- `GET /api/events` - 获取所有事件
- `GET /api/events/{id}` - 根据ID获取事件
- `GET /api/events/date/{date}` - 根据日期获取事件（格式：yyyy-MM-dd）
- `POST /api/events` - 创建事件
- `PUT /api/events/{id}` - 更新事件
- `DELETE /api/events/{id}` - 删除事件
- `PATCH /api/events/{id}/status?status={status}` - 更新事件状态

### 事件数据模型

```json
{
  "id": 1,
  "title": "学习Spring Boot",
  "type": "LEARNING",
  "priority": 1,
  "status": "TODO",
  "dimension": "DAY",
  "targetDate": "2026-01-09T10:00:00",
  "implementation": "阅读官方文档，完成第一个Hello World项目",
  "reminderTime": "2026-01-09T09:00:00",
  "configJson": null,
  "createdAt": "2026-01-09T08:00:00"
}
```

**事件类型 (type):**
- `ROUTINE` - 日常事件
- `REMINDER` - 提醒事件
- `LEARNING` - 学习事件

**事件状态 (status):**
- `TODO` - 未开始
- `IN_PROGRESS` - 进行中
- `DONE` - 已完成
- `WAITING` - 等待中

**事件维度 (dimension):**
- `DAY` - 日
- `WEEK` - 周
- `MONTH` - 月
- `YEAR` - 年

**优先级 (priority):**
- `1` - 高
- `2` - 中
- `3` - 低

## 开发路线图

### 阶段一 (MVP) ✅
- [x] 搭建 Spring Boot + MySQL + React 环境
- [x] 实现基础的"事件"增删改查（手动创建）
- [x] 实现日视图和简单的日历翻页
- [x] 集成 Markdown 编辑器

### 阶段二 (AI 接入)
- [ ] 接入 OpenAI/DeepSeek 等大模型 API
- [ ] 实现"输入目标 -> 生成学习大纲"的功能
- [ ] 实现非结构化数据（文本/链接）导入生成事件

### 阶段三 (视图优化)
- [ ] 实现周/月/年的聚合统计逻辑
- [ ] 优化前端 UI，达到"Boss"级别的视觉体验

## 许可证

MIT License
