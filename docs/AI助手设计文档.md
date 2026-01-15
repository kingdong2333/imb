# AI 助手/秘书功能设计文档

## 1. 功能概述

### 1.1 核心定位

AI 助手模块是 imb 平台的核心差异化功能，旨在将大模型打造成用户的"智能秘书"或"管家"。用户可以通过与 AI 助手进行多轮对话，完成以下核心任务：

1. **信息收集与整理**：针对用户提出的任务（如投资决策、学习规划等），AI 主动搜索、收集、整理相关资料
2. **深度讨论与分析**：支持多轮对话，像真实秘书一样与用户反复讨论，深入分析问题
3. **知识沉淀**：将讨论过程和结论自动整理成结构化的笔记，形成个人知识库
4. **成长积累**：通过持续使用，建立个人专属的知识体系和决策经验库

### 1.2 核心价值

- **决策支持**：为复杂决策（如投资、学习、工作规划）提供信息支持和多角度分析
- **知识管理**：将碎片化的讨论和思考系统化，形成可检索的知识资产
- **持续学习**：通过AI助手的学习和记忆，让系统越来越了解用户，提供更个性化的服务
- **效率提升**：减少信息收集和整理的时间，让用户专注于决策本身

---

## 2. 核心场景与用例

### 2.1 典型场景：投资决策

**场景描述**：用户想要投资某个股票/基金，需要收集信息并做出决策。

**交互流程**：
1. 用户创建任务："我想投资特斯拉股票"
2. AI 助手启动，开始收集信息：
   - 搜索特斯拉最新财报、股价趋势
   - 收集行业分析报告
   - 整理相关新闻和专家观点
3. 用户与 AI 对话：
   - 用户："特斯拉最近的财务状况如何？"
   - AI："根据最新财报，特斯拉Q3营收...，我注意到几个关键点..."
   - 用户："风险有哪些？"
   - AI："主要风险包括...，建议关注..."
4. 形成决策笔记：
   - AI 自动整理讨论内容
   - 生成结构化的投资分析报告
   - 包含：基本信息、财务分析、风险评估、投资建议等

### 2.2 典型场景：学习规划

**场景描述**：用户想要学习某个新技能，需要制定学习计划。

**交互流程**：
1. 用户创建任务："我想学习机器学习"
2. AI 助手分析需求：
   - 了解用户当前基础
   - 搜索学习路径和资源
   - 推荐课程和书籍
3. 多轮讨论：
   - 用户："我应该从哪里开始？"
   - AI："建议从Python基础开始，然后..."
   - 用户："需要多长时间？"
   - AI："根据你的时间安排，预计..."
4. 生成学习计划：
   - 创建学习大纲
   - 拆解成具体的学习事件
   - 关联学习笔记

### 2.3 典型场景：工作规划

**场景描述**：用户需要规划一个项目或任务。

**交互流程**：
1. 用户输入项目描述
2. AI 助手分析：
   - 拆解任务步骤
   - 识别关键节点
   - 评估时间需求
3. 讨论优化：
   - 用户提出疑问
   - AI 提供建议和调整
4. 生成执行计划：
   - 创建任务清单
   - 设置时间节点
   - 关联相关资源

---

## 3. 系统架构设计

### 3.1 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                     前端层 (React)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  任务管理界面 │  │  AI对话界面   │  │  笔记查看界面 │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │ HTTP/WebSocket
┌─────────────────────────────────────────────────────────┐
│                  后端层 (Spring Boot)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ 任务管理服务  │  │  AI助手服务   │  │  笔记管理服务 │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ 对话管理服务  │  │ 知识库服务    │  │  搜索服务     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                   外部服务层                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ 大模型API     │  │  搜索引擎API  │  │  向量数据库   │  │
│  │ (OpenAI/     │  │ (可选)        │  │ (Milvus)     │  │
│  │  DeepSeek)   │  │               │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                   数据存储层                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   MySQL      │  │   Redis      │  │  文件存储     │  │
│  │ (结构化数据)  │  │ (缓存/会话)  │  │ (附件/图片)   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 3.2 核心模块设计

#### 3.2.1 AI 助手服务模块 (AIAssistantService)

**职责**：
- 管理对话会话
- 调用大模型 API
- 处理多轮对话逻辑
- 管理上下文记忆

**关键组件**：
- `ConversationManager`：对话会话管理
- `LLMClient`：大模型客户端封装
- `ContextManager`：上下文管理
- `MemoryManager`：长期记忆管理

#### 3.2.2 知识收集模块 (KnowledgeCollector)

**职责**：
- 根据任务主题搜索相关信息
- 整合多源数据
- 提取关键信息

**关键组件**：
- `WebSearchService`：网络搜索（可选，可集成搜索引擎API）
- `ContentExtractor`：内容提取
- `InformationAggregator`：信息聚合

#### 3.2.3 笔记生成模块 (NoteGenerator)

**职责**：
- 分析对话内容
- 提取关键信息
- 生成结构化笔记
- 支持 Markdown 格式

**关键组件**：
- `ConversationAnalyzer`：对话分析
- `NoteTemplateEngine`：笔记模板引擎
- `MarkdownFormatter`：Markdown 格式化

#### 3.2.4 知识库模块 (KnowledgeBase)

**职责**：
- 存储历史对话和笔记
- 支持向量检索
- 提供知识检索接口

**关键组件**：
- `VectorStore`：向量存储（可选 Milvus）
- `KnowledgeRetriever`：知识检索
- `EmbeddingService`：文本向量化

---

## 4. 数据模型设计

### 4.1 AI 任务表 (ai_tasks)

用于管理用户创建的 AI 助手任务。

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | BIGINT | 主键 | PK, AUTO_INCREMENT |
| user_id | BIGINT | 用户ID | FK, NOT NULL |
| title | VARCHAR(255) | 任务标题 | NOT NULL |
| description | TEXT | 任务描述 | |
| type | ENUM | 任务类型：INVESTMENT(投资), LEARNING(学习), WORK(工作), OTHER(其他) | NOT NULL |
| status | ENUM | 状态：ACTIVE(进行中), COMPLETED(已完成), ARCHIVED(已归档) | NOT NULL, DEFAULT 'ACTIVE' |
| event_id | BIGINT | 关联的事件ID | FK, NULL |
| created_at | DATETIME | 创建时间 | NOT NULL |
| updated_at | DATETIME | 更新时间 | NOT NULL |
| completed_at | DATETIME | 完成时间 | NULL |

### 4.2 对话会话表 (conversations)

用于管理 AI 对话会话。

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | BIGINT | 主键 | PK, AUTO_INCREMENT |
| task_id | BIGINT | 关联的AI任务ID | FK, NOT NULL |
| session_id | VARCHAR(64) | 会话ID（用于WebSocket） | UNIQUE, NOT NULL |
| title | VARCHAR(255) | 会话标题（自动生成） | |
| status | ENUM | 状态：ACTIVE(活跃), PAUSED(暂停), ENDED(结束) | NOT NULL, DEFAULT 'ACTIVE' |
| created_at | DATETIME | 创建时间 | NOT NULL |
| updated_at | DATETIME | 更新时间 | NOT NULL |
| last_message_at | DATETIME | 最后消息时间 | |

### 4.3 对话消息表 (conversation_messages)

存储对话中的每一条消息。

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | BIGINT | 主键 | PK, AUTO_INCREMENT |
| conversation_id | BIGINT | 关联的会话ID | FK, NOT NULL |
| role | ENUM | 角色：USER(用户), ASSISTANT(AI助手), SYSTEM(系统) | NOT NULL |
| content | LONGTEXT | 消息内容 | NOT NULL |
| metadata_json | JSON | 元数据（如搜索到的链接、引用的资料等） | |
| sequence | INT | 消息序号（在会话中的顺序） | NOT NULL |
| created_at | DATETIME | 创建时间 | NOT NULL |

### 4.4 AI 笔记表 (ai_notes)

存储 AI 生成的笔记。

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | BIGINT | 主键 | PK, AUTO_INCREMENT |
| task_id | BIGINT | 关联的AI任务ID | FK, NOT NULL |
| conversation_id | BIGINT | 关联的会话ID | FK, NULL |
| title | VARCHAR(255) | 笔记标题 | NOT NULL |
| content | LONGTEXT | Markdown 格式的笔记内容 | NOT NULL |
| summary | TEXT | 笔记摘要 | |
| tags | JSON | 标签数组 | |
| structure_json | JSON | 笔记结构（用于模板化展示） | |
| version | INT | 版本号（支持笔记迭代） | NOT NULL, DEFAULT 1 |
| created_at | DATETIME | 创建时间 | NOT NULL |
| updated_at | DATETIME | 更新时间 | NOT NULL |

### 4.5 知识片段表 (knowledge_fragments)

存储从对话和笔记中提取的知识片段（用于向量检索）。

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | BIGINT | 主键 | PK, AUTO_INCREMENT |
| task_id | BIGINT | 关联的AI任务ID | FK, NOT NULL |
| source_type | ENUM | 来源类型：MESSAGE(消息), NOTE(笔记), EXTERNAL(外部资料) | NOT NULL |
| source_id | BIGINT | 来源ID | |
| content | TEXT | 知识片段内容 | NOT NULL |
| embedding | BLOB | 向量嵌入（可选，如果使用向量数据库则不需要） | |
| metadata_json | JSON | 元数据 | |
| created_at | DATETIME | 创建时间 | NOT NULL |

### 4.6 外部资料表 (external_resources)

存储 AI 收集的外部资料（链接、文档等）。

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | BIGINT | 主键 | PK, AUTO_INCREMENT |
| task_id | BIGINT | 关联的AI任务ID | FK, NOT NULL |
| url | VARCHAR(512) | 资源URL | NOT NULL |
| title | VARCHAR(255) | 资源标题 | |
| content | LONGTEXT | 提取的内容 | |
| resource_type | ENUM | 类型：WEB_PAGE(网页), PDF(文档), IMAGE(图片) | NOT NULL |
| metadata_json | JSON | 元数据（如作者、发布时间等） | |
| collected_at | DATETIME | 收集时间 | NOT NULL |

---

## 5. API 设计

### 5.1 AI 任务管理 API

#### 5.1.1 创建 AI 任务
```
POST /api/ai/tasks
Content-Type: application/json

Request Body:
{
  "title": "投资特斯拉股票",
  "description": "我想了解特斯拉的投资价值",
  "type": "INVESTMENT",
  "eventId": 123  // 可选，关联到已有事件
}

Response:
{
  "id": 1,
  "title": "投资特斯拉股票",
  "status": "ACTIVE",
  "createdAt": "2026-01-09T10:00:00"
}
```

#### 5.1.2 获取任务列表
```
GET /api/ai/tasks?status=ACTIVE&type=INVESTMENT&page=0&size=20

Response:
{
  "content": [
    {
      "id": 1,
      "title": "投资特斯拉股票",
      "status": "ACTIVE",
      "type": "INVESTMENT",
      "createdAt": "2026-01-09T10:00:00"
    }
  ],
  "totalElements": 1,
  "totalPages": 1
}
```

#### 5.1.3 获取任务详情
```
GET /api/ai/tasks/{taskId}

Response:
{
  "id": 1,
  "title": "投资特斯拉股票",
  "description": "我想了解特斯拉的投资价值",
  "type": "INVESTMENT",
  "status": "ACTIVE",
  "conversations": [...],
  "notes": [...],
  "resources": [...]
}
```

#### 5.1.4 更新任务状态
```
PATCH /api/ai/tasks/{taskId}/status
Content-Type: application/json

Request Body:
{
  "status": "COMPLETED"
}
```

### 5.2 对话管理 API

#### 5.2.1 创建对话会话
```
POST /api/ai/tasks/{taskId}/conversations

Response:
{
  "id": 1,
  "sessionId": "conv_abc123",
  "taskId": 1,
  "status": "ACTIVE",
  "createdAt": "2026-01-09T10:00:00"
}
```

#### 5.2.2 发送消息（WebSocket）
```
WebSocket: /ws/ai/conversations/{sessionId}

Message Format:
{
  "type": "USER_MESSAGE",
  "content": "特斯拉最近的财务状况如何？",
  "timestamp": "2026-01-09T10:05:00"
}

Response Format:
{
  "type": "ASSISTANT_MESSAGE",
  "content": "根据最新财报...",
  "metadata": {
    "sources": [
      {"url": "https://...", "title": "..."}
    ],
    "thinking": "我正在搜索特斯拉的最新财报信息..."
  },
  "timestamp": "2026-01-09T10:05:05"
}

Other Message Types:
- "THINKING": AI 正在思考
- "SEARCHING": AI 正在搜索信息
- "GENERATING": AI 正在生成回答
- "ERROR": 错误信息
```

#### 5.2.3 获取对话历史（HTTP 备用）
```
GET /api/ai/conversations/{conversationId}/messages?page=0&size=50

Response:
{
  "content": [
    {
      "id": 1,
      "role": "USER",
      "content": "特斯拉最近的财务状况如何？",
      "sequence": 1,
      "createdAt": "2026-01-09T10:05:00"
    },
    {
      "id": 2,
      "role": "ASSISTANT",
      "content": "根据最新财报...",
      "sequence": 2,
      "metadata": {...},
      "createdAt": "2026-01-09T10:05:05"
    }
  ],
  "totalElements": 2
}
```

### 5.3 笔记管理 API

#### 5.3.1 生成笔记
```
POST /api/ai/tasks/{taskId}/notes/generate
Content-Type: application/json

Request Body:
{
  "conversationId": 1,  // 可选，基于特定对话生成
  "template": "INVESTMENT_ANALYSIS"  // 可选，指定模板
}

Response:
{
  "id": 1,
  "title": "特斯拉股票投资分析",
  "content": "# 特斯拉股票投资分析\n\n## 基本信息\n...",
  "version": 1,
  "createdAt": "2026-01-09T10:30:00"
}
```

#### 5.3.2 获取笔记列表
```
GET /api/ai/tasks/{taskId}/notes

Response:
{
  "content": [
    {
      "id": 1,
      "title": "特斯拉股票投资分析",
      "summary": "分析了特斯拉的财务状况...",
      "version": 1,
      "createdAt": "2026-01-09T10:30:00"
    }
  ]
}
```

#### 5.3.3 更新笔记
```
PUT /api/ai/tasks/{taskId}/notes/{noteId}
Content-Type: application/json

Request Body:
{
  "title": "特斯拉股票投资分析（更新）",
  "content": "# 更新后的内容..."
}
```

#### 5.3.4 重新生成笔记
```
POST /api/ai/tasks/{taskId}/notes/{noteId}/regenerate
Content-Type: application/json

Request Body:
{
  "includeLatestConversation": true  // 是否包含最新对话
}
```

### 5.4 知识检索 API

#### 5.4.1 搜索相关知识
```
POST /api/ai/knowledge/search
Content-Type: application/json

Request Body:
{
  "query": "特斯拉财务",
  "taskId": 1,  // 可选，限定在特定任务
  "limit": 10
}

Response:
{
  "results": [
    {
      "id": 1,
      "content": "特斯拉Q3财报显示...",
      "sourceType": "NOTE",
      "sourceId": 1,
      "relevanceScore": 0.95
    }
  ]
}
```

---

## 6. 交互流程设计

### 6.1 完整任务流程

```
用户创建任务
    ↓
AI 助手初始化
    ↓
┌─────────────────────────┐
│  阶段1: 信息收集        │
│  - AI 分析任务需求      │
│  - 搜索相关资料         │
│  - 整理关键信息         │
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│  阶段2: 深度讨论        │
│  - 用户提问             │
│  - AI 回答并引用资料    │
│  - 多轮对话深入分析     │
│  - 支持追问和澄清       │
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│  阶段3: 总结与笔记      │
│  - AI 分析对话内容      │
│  - 提取关键信息         │
│  - 生成结构化笔记       │
│  - 用户可编辑和确认     │
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│  阶段4: 知识沉淀        │
│  - 笔记保存到知识库     │
│  - 提取知识片段         │
│  - 建立关联关系         │
│  - 支持后续检索         │
└─────────────────────────┘
    ↓
任务完成/归档
```

### 6.2 对话交互设计

#### 6.2.1 消息流设计

**用户消息**：
- 文本输入
- 支持 Markdown 格式
- 可附加图片、链接

**AI 响应**：
- 流式输出（打字效果）
- 显示思考过程（可选）
- 引用来源链接
- 支持 Markdown 渲染
- 可展开/收起详细内容

#### 6.2.2 上下文管理

- **短期上下文**：当前会话的最近 N 条消息（如最近 20 条）
- **长期上下文**：任务相关的历史对话和笔记摘要
- **知识库上下文**：检索到的相关知识片段

#### 6.2.3 智能提示

- **建议问题**：AI 根据当前讨论内容，主动提出相关问题建议
- **下一步行动**：提示用户可能的下一步操作
- **相关信息**：自动推荐相关的历史笔记或任务

---

## 7. 技术实现方案

### 7.1 大模型集成

#### 7.1.1 模型选择

**推荐方案**：
- **DeepSeek API**：性价比高，支持长上下文
- **OpenAI GPT-4**：性能强，但成本较高
- **本地模型**（可选）：如 Ollama + Llama 3，适合隐私要求高的场景

#### 7.1.2 Prompt 工程

**系统提示词模板**：
```
你是一位专业的AI助手，扮演用户的智能秘书角色。你的任务是：

1. 帮助用户收集和整理信息
2. 与用户进行深入的讨论和分析
3. 提供专业的建议和见解
4. 将讨论内容整理成结构化的笔记

当前任务：{task_title}
任务描述：{task_description}
任务类型：{task_type}

请以专业、友好、细致的方式与用户交流。在回答时：
- 引用你收集到的资料和来源
- 提供多角度的分析
- 主动提出相关问题，引导深入讨论
- 使用 Markdown 格式组织回答

历史对话摘要：
{conversation_summary}

相关知识片段：
{relevant_knowledge}
```

**消息格式**：
- 使用标准的 ChatML 格式或 OpenAI 格式
- 支持 function calling（用于搜索、生成笔记等）

### 7.2 信息收集实现

#### 7.2.1 网络搜索（可选）

**方案1：集成搜索引擎 API**
- Google Custom Search API
- Bing Search API
- SerpAPI

**方案2：使用大模型的搜索能力**
- GPT-4 with browsing
- Claude with web access

**方案3：爬虫 + AI 提取**
- 使用爬虫获取网页内容
- AI 提取关键信息

#### 7.2.2 内容提取

- 使用 HTML 解析库（如 Jsoup）提取网页正文
- AI 提取关键信息并总结
- 保存原始内容和提取内容

### 7.3 笔记生成实现

#### 7.3.1 笔记模板

**投资分析模板**：
```markdown
# {任务标题} - 投资分析报告

## 一、基本信息
- 投资标的：{标的名称}
- 分析日期：{日期}
- 分析人：{用户}

## 二、市场概况
{市场分析内容}

## 三、财务分析
{财务数据和分析}

## 四、风险评估
{风险点分析}

## 五、投资建议
{建议和结论}

## 六、参考资料
{引用的资料链接}

## 七、讨论记录
{关键对话摘要}
```

**学习计划模板**：
```markdown
# {学习主题} - 学习计划

## 一、学习目标
{目标描述}

## 二、学习路径
{学习大纲}

## 三、资源推荐
{推荐的学习资源}

## 四、时间规划
{时间安排}

## 五、学习笔记
{学习过程中的笔记}
```

#### 7.3.2 生成流程

1. **对话分析**：使用 AI 分析对话内容，提取关键信息
2. **结构填充**：根据模板填充各个部分
3. **内容优化**：AI 优化语言表达，确保逻辑清晰
4. **格式检查**：验证 Markdown 格式正确性

### 7.4 知识库实现

#### 7.4.1 向量检索（可选）

**使用 Milvus**：
- 存储知识片段的向量嵌入
- 支持语义搜索
- 快速检索相关内容

**实现步骤**：
1. 文本向量化：使用 embedding 模型（如 text-embedding-ada-002）
2. 存储向量：存入 Milvus
3. 检索：根据查询向量检索相似内容

#### 7.4.2 传统检索（基础方案）

- 使用 MySQL 全文索引
- 关键词匹配
- 简单的相关性排序

### 7.5 WebSocket 实现

#### 7.5.1 后端实现（Spring Boot）

```java
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new AIConversationHandler(), "/ws/ai/conversations/{sessionId}")
                .setAllowedOrigins("*");
    }
}
```

#### 7.5.2 流式响应处理

- 使用 Server-Sent Events (SSE) 或 WebSocket
- 大模型 API 返回流式数据时，实时转发给前端
- 前端实现打字机效果

---

## 8. 前端界面设计

### 8.1 任务创建界面

**布局**：
- 顶部：任务标题输入
- 中间：任务描述（支持 Markdown）
- 底部：任务类型选择、创建按钮

**功能**：
- 快速创建模板（投资、学习、工作等）
- 关联已有事件
- 预设提示词

### 8.2 对话界面

**布局**：
```
┌─────────────────────────────────────┐
│  任务标题                    [设置]  │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐ │
│  │  AI: 你好，我来帮你收集...    │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  用户: 特斯拉财务状况如何？   │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  AI: 根据最新财报...          │ │
│  │  [来源1] [来源2]              │ │
│  └───────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│  [输入框]              [发送] [附件] │
└─────────────────────────────────────┘
```

**功能**：
- 消息流式显示
- 支持 Markdown 渲染
- 显示 AI 思考过程
- 引用来源可点击
- 支持图片上传
- 消息搜索和过滤

### 8.3 笔记查看/编辑界面

**布局**：
- 左侧：笔记列表
- 右侧：Markdown 编辑器/预览
- 顶部：笔记操作（生成、更新、导出等）

**功能**：
- Markdown 实时预览
- 支持编辑
- 版本历史
- 导出为 PDF/Markdown
- 分享链接

### 8.4 知识库界面

**布局**：
- 搜索栏
- 知识卡片列表
- 关联关系图（可选）

**功能**：
- 全文搜索
- 语义搜索（如果启用向量检索）
- 按任务、标签筛选
- 查看知识关联

---

## 9. 开发计划

### 9.1 阶段一：核心对话功能（2-3周）

**目标**：实现基本的 AI 对话功能

**任务清单**：
- [ ] 数据库表设计和创建
- [ ] AI 任务管理 API
- [ ] 对话会话管理 API
- [ ] WebSocket 对话接口
- [ ] 大模型 API 集成（DeepSeek/OpenAI）
- [ ] 基础对话界面
- [ ] 消息流式显示

**验收标准**：
- 用户可以创建 AI 任务
- 可以与 AI 进行多轮对话
- 对话历史可以保存和查看

### 9.2 阶段二：信息收集功能（2周）

**目标**：AI 可以主动收集和整理信息

**任务清单**：
- [ ] 信息搜索功能（集成搜索引擎 API 或使用大模型搜索能力）
- [ ] 内容提取和总结
- [ ] 外部资料管理
- [ ] 在对话中引用资料
- [ ] 资料展示界面

**验收标准**：
- AI 可以根据任务主题搜索相关信息
- 搜索结果可以展示和引用
- 用户可以看到 AI 收集的资料列表

### 9.3 阶段三：笔记生成功能（2周）

**目标**：自动生成结构化笔记

**任务清单**：
- [ ] 笔记模板设计
- [ ] 对话内容分析
- [ ] 笔记生成 API
- [ ] 笔记编辑界面
- [ ] 笔记版本管理
- [ ] 笔记导出功能

**验收标准**：
- AI 可以根据对话内容生成笔记
- 笔记格式结构化、内容完整
- 用户可以编辑和保存笔记
- 支持多种导出格式

### 9.4 阶段四：知识库和检索（2周）

**目标**：建立知识库，支持知识检索

**任务清单**：
- [ ] 知识片段提取
- [ ] 向量化存储（可选 Milvus）
- [ ] 知识检索 API
- [ ] 知识库界面
- [ ] 知识关联展示

**验收标准**：
- 历史笔记和对话可以检索
- 支持语义搜索（如果启用向量检索）
- 可以查看知识关联关系

### 9.5 阶段五：优化和增强（持续）

**目标**：提升用户体验和功能完善

**任务清单**：
- [ ] UI/UX 优化
- [ ] 性能优化
- [ ] 错误处理和重试机制
- [ ] 更多笔记模板
- [ ] 智能提示和建议
- [ ] 移动端适配（可选）

---

## 10. 技术选型建议

### 10.1 后端技术栈

- **框架**：Spring Boot 3.2.0（已有）
- **WebSocket**：Spring WebSocket
- **HTTP 客户端**：OkHttp 或 Spring WebClient（用于调用大模型 API）
- **JSON 处理**：Jackson（Spring Boot 自带）
- **任务队列**（可选）：Redis + Redisson（用于异步处理）

### 10.2 前端技术栈

- **框架**：React 18（已有）
- **WebSocket 客户端**：socket.io-client 或原生 WebSocket
- **Markdown 编辑器**：@uiw/react-md-editor（已有）
- **Markdown 渲染**：react-markdown
- **UI 组件**：Tailwind CSS（已有）+ Headless UI
- **状态管理**：Zustand 或 React Context

### 10.3 外部服务

- **大模型 API**：
  - DeepSeek API（推荐，性价比高）
  - OpenAI API（性能强）
- **向量数据库**（可选）：
  - Milvus（推荐）
  - Pinecone（云服务）
- **搜索引擎**（可选）：
  - SerpAPI
  - Google Custom Search API

### 10.4 开发工具

- **API 测试**：Postman 或 Insomnia
- **WebSocket 测试**：WebSocket King 或 Postman
- **数据库管理**：DBeaver 或 MySQL Workbench

---

## 11. 安全和隐私考虑

### 11.1 数据安全

- **加密存储**：敏感信息加密存储
- **访问控制**：用户只能访问自己的任务和对话
- **API 安全**：使用 JWT 认证，防止未授权访问

### 11.2 隐私保护

- **数据隔离**：用户数据完全隔离
- **数据删除**：支持用户删除自己的数据
- **API Key 管理**：大模型 API Key 存储在服务端，不在前端暴露

### 11.3 成本控制

- **Token 限制**：设置单次对话的最大 token 数
- **请求限流**：防止滥用
- **缓存策略**：缓存常见问题的回答

---

## 12. 性能优化

### 12.1 响应速度

- **流式响应**：使用 WebSocket 实现流式输出，提升用户体验
- **异步处理**：信息收集等耗时操作异步处理
- **缓存**：缓存常见问题的回答

### 12.2 数据库优化

- **索引**：在常用查询字段上建立索引
- **分页**：对话历史等大数据量使用分页
- **归档**：定期归档旧数据

### 12.3 前端优化

- **虚拟滚动**：长对话列表使用虚拟滚动
- **懒加载**：笔记内容懒加载
- **防抖节流**：输入框防抖，避免频繁请求

---

## 13. 测试策略

### 13.1 单元测试

- **服务层**：测试业务逻辑
- **工具类**：测试工具函数

### 13.2 集成测试

- **API 测试**：测试各个 API 接口
- **WebSocket 测试**：测试对话功能

### 13.3 端到端测试

- **用户流程**：测试完整的任务创建到笔记生成流程
- **异常场景**：测试错误处理和边界情况

---

## 14. 后续扩展方向

### 14.1 多模态支持

- **图片分析**：上传图片，AI 分析内容
- **文档解析**：支持 PDF、Word 等文档上传和分析

### 14.2 协作功能

- **分享笔记**：分享笔记给其他用户
- **协作讨论**：多人参与同一个任务讨论

### 14.3 智能推荐

- **相关任务推荐**：基于历史任务推荐相关任务
- **学习路径推荐**：基于用户目标推荐学习路径

### 14.4 数据分析

- **任务统计**：统计任务完成情况
- **知识图谱**：可视化知识关联关系
- **成长报告**：生成个人成长报告

---

## 15. 附录

### 15.1 术语表

- **AI 任务**：用户创建的，需要 AI 助手帮助完成的任务
- **对话会话**：一次连续的对话交互
- **知识片段**：从对话或笔记中提取的，可用于检索的知识单元
- **向量检索**：使用向量相似度进行语义搜索

### 15.2 参考资源

- [OpenAI API 文档](https://platform.openai.com/docs)
- [DeepSeek API 文档](https://platform.deepseek.com/docs)
- [Milvus 文档](https://milvus.io/docs)
- [Spring WebSocket 文档](https://docs.spring.io/spring-framework/reference/web/websocket.html)