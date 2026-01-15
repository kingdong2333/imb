package com.imb.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class LLMService {
    
    @Value("${llm.api.url:https://api.deepseek.com/v1/chat/completions}")
    private String llmApiUrl;
    
    @Value("${llm.api.key:}")
    private String llmApiKey;
    
    @Value("${llm.model:deepseek-chat}")
    private String llmModel;
    
    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    
    public LLMService() {
        this.webClient = WebClient.builder()
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
        this.objectMapper = new ObjectMapper();
    }
    
    /**
     * 调用LLM API生成回复（流式）
     */
    public Flux<String> streamChatCompletion(List<Map<String, String>> messages, String systemPrompt) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", llmModel);
        requestBody.put("stream", true);
        
        List<Map<String, String>> allMessages = new ArrayList<>();
        if (systemPrompt != null && !systemPrompt.isEmpty()) {
            Map<String, String> systemMessage = new HashMap<>();
            systemMessage.put("role", "system");
            systemMessage.put("content", systemPrompt);
            allMessages.add(systemMessage);
        }
        allMessages.addAll(messages);
        requestBody.put("messages", allMessages);
        
        return webClient.post()
                .uri(llmApiUrl)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + llmApiKey)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToFlux(String.class)
                .filter(line -> line.startsWith("data: ") && !line.equals("data: [DONE]"))
                .map(line -> {
                    try {
                        String jsonStr = line.substring(6);
                        JsonNode jsonNode = objectMapper.readTree(jsonStr);
                        JsonNode choices = jsonNode.get("choices");
                        if (choices != null && choices.isArray() && choices.size() > 0) {
                            JsonNode delta = choices.get(0).get("delta");
                            if (delta != null && delta.has("content")) {
                                return delta.get("content").asText();
                            }
                        }
                    } catch (Exception e) {
                        // 忽略解析错误
                    }
                    return "";
                })
                .filter(content -> !content.isEmpty());
    }
    
    /**
     * 调用LLM API生成回复（非流式）
     */
    public String chatCompletion(List<Map<String, String>> messages, String systemPrompt) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", llmModel);
        requestBody.put("stream", false);
        
        List<Map<String, String>> allMessages = new ArrayList<>();
        if (systemPrompt != null && !systemPrompt.isEmpty()) {
            Map<String, String> systemMessage = new HashMap<>();
            systemMessage.put("role", "system");
            systemMessage.put("content", systemPrompt);
            allMessages.add(systemMessage);
        }
        allMessages.addAll(messages);
        requestBody.put("messages", allMessages);
        
        try {
            String response = webClient.post()
                    .uri(llmApiUrl)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + llmApiKey)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            
            JsonNode jsonNode = objectMapper.readTree(response);
            JsonNode choices = jsonNode.get("choices");
            if (choices != null && choices.isArray() && choices.size() > 0) {
                JsonNode message = choices.get(0).get("message");
                if (message != null && message.has("content")) {
                    return message.get("content").asText();
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to call LLM API", e);
        }
        
        return "";
    }
    
    /**
     * 生成系统提示词
     */
    public String buildSystemPrompt(String taskTitle, String taskDescription, String taskType) {
        return String.format(
            "你是一位专业的AI助手，扮演用户的智能秘书角色。你的任务是：\n" +
            "1. 帮助用户收集和整理信息\n" +
            "2. 与用户进行深入的讨论和分析\n" +
            "3. 提供专业的建议和见解\n" +
            "4. 将讨论内容整理成结构化的笔记\n\n" +
            "当前任务：%s\n" +
            "任务描述：%s\n" +
            "任务类型：%s\n\n" +
            "请以专业、友好、细致的方式与用户交流。在回答时：\n" +
            "- 引用你收集到的资料和来源\n" +
            "- 提供多角度的分析\n" +
            "- 主动提出相关问题，引导深入讨论\n" +
            "- 使用 Markdown 格式组织回答",
            taskTitle, taskDescription != null ? taskDescription : "", taskType
        );
    }
}
