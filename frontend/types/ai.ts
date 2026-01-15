// AI助手相关类型定义

export enum AITaskType {
  INVESTMENT = 'INVESTMENT',
  LEARNING = 'LEARNING',
  WORK = 'WORK',
  OTHER = 'OTHER'
}

export enum AITaskStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED'
}

export enum ConversationStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  ENDED = 'ENDED'
}

export enum MessageRole {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
  SYSTEM = 'SYSTEM'
}

export enum MessageType {
  USER_MESSAGE = 'USER_MESSAGE',
  ASSISTANT_MESSAGE = 'ASSISTANT_MESSAGE',
  THINKING = 'THINKING',
  SEARCHING = 'SEARCHING',
  GENERATING = 'GENERATING',
  ERROR = 'ERROR'
}

export enum ResourceType {
  WEB_PAGE = 'WEB_PAGE',
  PDF = 'PDF',
  IMAGE = 'IMAGE'
}

export enum SourceType {
  MESSAGE = 'MESSAGE',
  NOTE = 'NOTE',
  EXTERNAL = 'EXTERNAL'
}

// AI任务
export interface AITask {
  id: number;
  userId?: number;
  title: string;
  description?: string;
  type: AITaskType;
  status: AITaskStatus;
  eventId?: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// 对话会话
export interface Conversation {
  id: number;
  taskId: number;
  sessionId: string;
  title?: string;
  status: ConversationStatus;
  createdAt: string;
  updatedAt: string;
  lastMessageAt?: string;
}

// 对话消息
export interface ConversationMessage {
  id: number;
  conversationId: number;
  role: MessageRole;
  content: string;
  metadataJson?: any;
  sequence: number;
  createdAt: string;
}

// WebSocket消息格式
export interface WSMessage {
  type: MessageType;
  content?: string;
  metadata?: {
    sources?: Array<{ url: string; title: string }>;
    thinking?: string;
  };
  timestamp: string;
}

// AI笔记
export interface AINote {
  id: number;
  taskId: number;
  conversationId?: number;
  title: string;
  content: string;
  summary?: string;
  tags?: string[];
  structureJson?: any;
  version: number;
  createdAt: string;
  updatedAt: string;
}

// 外部资料
export interface ExternalResource {
  id: number;
  taskId: number;
  url: string;
  title?: string;
  content?: string;
  resourceType: ResourceType;
  metadataJson?: any;
  collectedAt: string;
}

// 知识片段
export interface KnowledgeFragment {
  id: number;
  taskId: number;
  sourceType: SourceType;
  sourceId?: number;
  content: string;
  metadataJson?: any;
  relevanceScore?: number;
  createdAt: string;
}

// API请求/响应类型
export interface CreateAITaskRequest {
  title: string;
  description?: string;
  type: AITaskType;
  eventId?: number;
}

export interface CreateConversationResponse {
  id: number;
  sessionId: string;
  taskId: number;
  status: ConversationStatus;
  createdAt: string;
}

export interface GenerateNoteRequest {
  conversationId?: number;
  template?: string;
}

export interface SearchKnowledgeRequest {
  query: string;
  taskId?: number;
  limit?: number;
}

export interface SearchKnowledgeResponse {
  results: KnowledgeFragment[];
}
