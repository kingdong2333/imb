// AI对话界面
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Loader2, FileText, ExternalLink, Sparkles } from 'lucide-react';
import { AITask, Conversation, ConversationMessage, WSMessage, MessageType } from '../types/ai';
import { conversationApi, ConversationWebSocket } from '../services/aiApiService';

interface AIConversationViewProps {
  task: AITask;
  onBack: () => void;
  onGenerateNote: () => void;
}

const AIConversationView: React.FC<AIConversationViewProps> = ({ task, onBack, onGenerateNote }) => {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [wsMessages, setWsMessages] = useState<WSMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const wsRef = useRef<ConversationWebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeConversation();
    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
      }
    };
  }, [task.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, wsMessages, streamingContent]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeConversation = async () => {
    try {
      setLoading(true);
      // 创建或获取对话会话
      const conv = await conversationApi.createConversation(task.id);
      setConversation(conv);

      // 加载历史消息
      const historyResponse = await conversationApi.getMessages(conv.id);
      setMessages(historyResponse.content);

      // 连接WebSocket
      connectWebSocket(conv.sessionId);
    } catch (error) {
      console.error('Failed to initialize conversation:', error);
      alert('初始化对话失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = (sessionId: string) => {
    const ws = new ConversationWebSocket(
      sessionId,
      handleWSMessage,
      handleWSError
    );
    wsRef.current = ws;
    ws.connect();
    setWsConnected(true);
  };

  const handleWSMessage = (message: WSMessage) => {
    if (message.type === MessageType.ASSISTANT_MESSAGE) {
      if (message.content) {
        setIsStreaming(true);
        setStreamingContent(message.content);
        // 模拟流式输出效果
        setTimeout(() => {
          setIsStreaming(false);
          setStreamingContent('');
          // 重新加载消息以获取完整内容
          if (conversation) {
            conversationApi.getMessages(conversation.id).then((response) => {
              setMessages(response.content);
            });
          }
        }, 100);
      }
    } else if (message.type === MessageType.THINKING || message.type === MessageType.SEARCHING) {
      setWsMessages((prev) => [...prev, message]);
    } else if (message.type === MessageType.ERROR) {
      alert(`错误: ${message.content}`);
    }
  };

  const handleWSError = (error: Error) => {
    console.error('WebSocket error:', error);
    setWsConnected(false);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !wsRef.current?.isConnected()) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    
    // 添加用户消息到UI（临时显示）
    const tempUserMessage: ConversationMessage = {
      id: Date.now(),
      conversationId: conversation?.id || 0,
      role: 'USER',
      content: userMessage,
      sequence: messages.length + 1,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    // 发送WebSocket消息
    wsRef.current.sendMessage(userMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const allMessages: Array<{
    type: string;
    content?: string;
    metadata?: any;
  }> = [
    ...messages.map((msg) => ({ type: msg.role, content: msg.content, metadata: msg.metadataJson })),
    ...wsMessages.map((msg) => ({ type: msg.type, content: msg.content, metadata: msg.metadata })),
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-lg border border-gray-200">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900"
          >
            ← 返回
          </button>
          <h2 className="text-lg font-semibold text-boss-900">{task.title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="text-sm text-gray-500">{wsConnected ? '已连接' : '未连接'}</span>
          <button
            onClick={onGenerateNote}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-boss-900 text-white rounded-lg hover:bg-boss-800"
          >
            <FileText size={16} />
            <span>生成笔记</span>
          </button>
        </div>
      </div>

      {/* 消息区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {allMessages.length === 0 && !isStreaming && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Sparkles size={48} className="mb-4 text-gray-400" />
            <p className="text-lg">开始与AI助手对话吧！</p>
            <p className="text-sm mt-2">AI会帮你收集信息、分析问题，并形成笔记</p>
          </div>
        )}

        {allMessages.map((msg, index) => {
          const isUser = msg.type === 'USER';
          const isThinking = msg.type === MessageType.THINKING || msg.type === MessageType.SEARCHING;

          return (
            <div
              key={index}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  isUser
                    ? 'bg-boss-900 text-white'
                    : isThinking
                    ? 'bg-gray-100 text-gray-600'
                    : 'bg-gray-50 text-gray-900'
                }`}
              >
                {isThinking ? (
                  <div className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    <span>{msg.content || '正在思考...'}</span>
                  </div>
                ) : (
                  <>
                    <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-sm max-w-none">
                      {msg.content || ''}
                    </ReactMarkdown>
                    {msg.metadata?.sources && msg.metadata.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs font-medium mb-2">参考资料：</p>
                        <div className="flex flex-wrap gap-2">
                          {msg.metadata.sources.map((source: any, idx: number) => (
                            <a
                              key={idx}
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink size={12} />
                              {source.title || source.url}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}

        {isStreaming && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg p-4 bg-gray-50">
              <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-sm max-w-none">
                {streamingContent}
              </ReactMarkdown>
              <span className="animate-pulse">▊</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-end gap-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入消息..."
            rows={1}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-boss-500 focus:border-transparent resize-none"
            disabled={!wsConnected || loading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || !wsConnected || loading}
            className="p-3 bg-boss-900 text-white rounded-lg hover:bg-boss-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIConversationView;
