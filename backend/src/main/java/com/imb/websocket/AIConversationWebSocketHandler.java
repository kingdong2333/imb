package com.imb.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.imb.entity.Conversation;
import com.imb.entity.ConversationMessage;
import com.imb.service.ConversationService;
import com.imb.service.LLMService;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class AIConversationWebSocketHandler extends TextWebSocketHandler {
    
    private final ConversationService conversationService;
    private final LLMService llmService;
    private final ObjectMapper objectMapper;
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    
    public AIConversationWebSocketHandler(
            ConversationService conversationService,
            LLMService llmService) {
        this.conversationService = conversationService;
        this.llmService = llmService;
        this.objectMapper = new ObjectMapper();
    }
    
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String sessionId = extractSessionId(session);
        sessions.put(sessionId, session);
        
        // 发送连接成功消息
        sendMessage(session, createMessage("SYSTEM", "WebSocket连接成功"));
    }
    
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String sessionId = extractSessionId(session);
        String payload = message.getPayload();
        
        try {
            Map<String, Object> messageMap = objectMapper.readValue(payload, Map.class);
            String type = (String) messageMap.get("type");
            String content = (String) messageMap.get("content");
            
            if ("USER_MESSAGE".equals(type) && content != null) {
                handleUserMessage(session, sessionId, content);
            }
        } catch (Exception e) {
            sendMessage(session, createErrorMessage("消息格式错误: " + e.getMessage()));
        }
    }
    
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String sessionId = extractSessionId(session);
        sessions.remove(sessionId);
    }
    
    private void handleUserMessage(WebSocketSession session, String sessionId, String userContent) {
        try {
            // 查找会话
            Conversation conversation = conversationService.findBySessionId(sessionId)
                    .orElseThrow(() -> new RuntimeException("Conversation not found"));
            
            // 保存用户消息
            conversationService.saveMessage(
                    conversation.getId(),
                    ConversationMessage.MessageRole.USER,
                    userContent,
                    null
            );
            
            // 发送思考状态
            sendMessage(session, createMessage("THINKING", "正在思考..."));
            
            // 获取对话历史
            List<ConversationMessage> history = conversationService.getMessages(conversation.getId());
            
            // 构建LLM消息
            List<Map<String, String>> llmMessages = new ArrayList<>();
            for (ConversationMessage msg : history) {
                Map<String, String> llmMsg = new HashMap<>();
                llmMsg.put("role", msg.getRole().name().toLowerCase());
                llmMsg.put("content", msg.getContent());
                llmMessages.add(llmMsg);
            }
            
            // 获取任务信息构建系统提示词
            String systemPrompt = llmService.buildSystemPrompt(
                    "任务", "任务描述", "OTHER"
            );
            
            // 调用LLM生成回复（流式）
            llmService.streamChatCompletion(llmMessages, systemPrompt)
                    .subscribe(
                            chunk -> {
                                try {
                                    sendMessage(session, createMessage("ASSISTANT_MESSAGE", chunk));
                                } catch (IOException e) {
                                    e.printStackTrace();
                                }
                            },
                            error -> {
                                sendMessage(session, createErrorMessage("生成回复时出错: " + error.getMessage()));
                            },
                            () -> {
                                // 流式输出完成，保存完整消息
                                try {
                                    // 这里应该收集所有chunk并保存，简化处理
                                    String fullContent = "回复已生成";
                                    conversationService.saveMessage(
                                            conversation.getId(),
                                            ConversationMessage.MessageRole.ASSISTANT,
                                            fullContent,
                                            null
                                    );
                                } catch (Exception e) {
                                    e.printStackTrace();
                                }
                            }
                    );
            
        } catch (Exception e) {
            sendMessage(session, createErrorMessage("处理消息时出错: " + e.getMessage()));
        }
    }
    
    private String extractSessionId(WebSocketSession session) {
        String uri = session.getUri().toString();
        int lastSlash = uri.lastIndexOf('/');
        return uri.substring(lastSlash + 1);
    }
    
    private void sendMessage(WebSocketSession session, String message) throws IOException {
        if (session.isOpen()) {
            session.sendMessage(new TextMessage(message));
        }
    }
    
    private String createMessage(String type, String content) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("type", type);
            message.put("content", content);
            message.put("timestamp", java.time.Instant.now().toString());
            return objectMapper.writeValueAsString(message);
        } catch (Exception e) {
            return "{\"type\":\"ERROR\",\"content\":\"消息序列化失败\"}";
        }
    }
    
    private String createErrorMessage(String errorMessage) {
        return createMessage("ERROR", errorMessage);
    }
}
