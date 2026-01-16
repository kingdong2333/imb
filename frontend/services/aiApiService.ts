// AI助手API服务
import {
  AITask,
  CreateAITaskRequest,
  Conversation,
  ConversationMessage,
  AINote,
  GenerateNoteRequest,
  ExternalResource,
  SearchKnowledgeRequest,
  SearchKnowledgeResponse,
  AITaskStatus
} from '../types/ai';

const API_BASE_URL = 'http://localhost:8080/api';

// 通用请求函数
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }

  return response.json();
}

// AI任务管理API
export const aiTaskApi = {
  // 创建AI任务
  createTask: async (data: CreateAITaskRequest): Promise<AITask> => {
    return request<AITask>('/ai/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 获取任务列表
  getTasks: async (params?: {
    status?: AITaskStatus;
    type?: string;
    eventId?: string;
    page?: number;
    size?: number;
  }): Promise<{ content: AITask[]; totalElements: number; totalPages: number }> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.eventId) queryParams.append('eventId', params.eventId);
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());

    const queryString = queryParams.toString();
    return request(`/ai/tasks${queryString ? `?${queryString}` : ''}`);
  },

  // 获取任务详情
  getTask: async (taskId: number): Promise<AITask & {
    conversations?: Conversation[];
    notes?: AINote[];
    resources?: ExternalResource[];
  }> => {
    return request(`/ai/tasks/${taskId}`);
  },

  // 更新任务状态
  updateTaskStatus: async (taskId: number, status: AITaskStatus): Promise<void> => {
    return request(`/ai/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // 删除任务
  deleteTask: async (taskId: number): Promise<void> => {
    return request(`/ai/tasks/${taskId}`, {
      method: 'DELETE',
    });
  },
};

// 对话管理API
export const conversationApi = {
  // 创建对话会话
  createConversation: async (taskId: number): Promise<Conversation> => {
    return request<Conversation>(`/ai/tasks/${taskId}/conversations`, {
      method: 'POST',
    });
  },

  // 获取对话历史
  getMessages: async (
    conversationId: number,
    params?: { page?: number; size?: number }
  ): Promise<{ content: ConversationMessage[]; totalElements: number }> => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());

    const queryString = queryParams.toString();
    return request(`/ai/conversations/${conversationId}/messages${queryString ? `?${queryString}` : ''}`);
  },
};

// 笔记管理API
export const noteApi = {
  // 生成笔记
  generateNote: async (taskId: number, data?: GenerateNoteRequest): Promise<AINote> => {
    return request<AINote>(`/ai/tasks/${taskId}/notes/generate`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  },

  // 获取笔记列表
  getNotes: async (taskId: number): Promise<{ content: AINote[] }> => {
    return request(`/ai/tasks/${taskId}/notes`);
  },

  // 更新笔记
  updateNote: async (taskId: number, noteId: number, data: { title?: string; content?: string }): Promise<AINote> => {
    return request<AINote>(`/ai/tasks/${taskId}/notes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // 重新生成笔记
  regenerateNote: async (taskId: number, noteId: number, includeLatestConversation?: boolean): Promise<AINote> => {
    return request<AINote>(`/ai/tasks/${taskId}/notes/${noteId}/regenerate`, {
      method: 'POST',
      body: JSON.stringify({ includeLatestConversation }),
    });
  },

  // 删除笔记
  deleteNote: async (taskId: number, noteId: number): Promise<void> => {
    return request(`/ai/tasks/${taskId}/notes/${noteId}`, {
      method: 'DELETE',
    });
  },
};

// 知识库API
export const knowledgeApi = {
  // 搜索相关知识
  search: async (data: SearchKnowledgeRequest): Promise<SearchKnowledgeResponse> => {
    return request<SearchKnowledgeResponse>('/ai/knowledge/search', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// WebSocket连接管理
export class ConversationWebSocket {
  private ws: WebSocket | null = null;
  private sessionId: string;
  private onMessage: (message: any) => void;
  private onError: (error: Error) => void;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(sessionId: string, onMessage: (message: any) => void, onError: (error: Error) => void) {
    this.sessionId = sessionId;
    this.onMessage = onMessage;
    this.onError = onError;
  }

  connect(): void {
    const wsUrl = `ws://localhost:8080/ws/ai/conversations/${this.sessionId}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.onMessage(message);
      } catch (error) {
        this.onError(new Error('Failed to parse WebSocket message'));
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.onError(new Error('WebSocket connection error'));
    };

    this.ws.onclose = () => {
      console.log('WebSocket closed');
      // 尝试重连
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => {
          console.log(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
          this.connect();
        }, 1000 * this.reconnectAttempts);
      }
    };
  }

  sendMessage(content: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = {
        type: 'USER_MESSAGE',
        content,
        timestamp: new Date().toISOString(),
      };
      this.ws.send(JSON.stringify(message));
    } else {
      this.onError(new Error('WebSocket is not connected'));
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}
