package com.imb.service;

import com.imb.dto.AINoteDTO;
import com.imb.dto.GenerateNoteRequest;
import com.imb.dto.RegenerateNoteRequest;
import com.imb.dto.UpdateNoteRequest;
import com.imb.entity.AINote;
import com.imb.entity.AITask;
import com.imb.entity.Conversation;
import com.imb.entity.ConversationMessage;
import com.imb.repository.AINoteRepository;
import com.imb.repository.AITaskRepository;
import com.imb.repository.ConversationMessageRepository;
import com.imb.repository.ConversationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NoteService {
    
    private final AINoteRepository noteRepository;
    private final AITaskRepository taskRepository;
    private final ConversationRepository conversationRepository;
    private final ConversationMessageRepository messageRepository;
    private final LLMService llmService;
    
    public NoteService(
            AINoteRepository noteRepository,
            AITaskRepository taskRepository,
            ConversationRepository conversationRepository,
            ConversationMessageRepository messageRepository,
            LLMService llmService) {
        this.noteRepository = noteRepository;
        this.taskRepository = taskRepository;
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.llmService = llmService;
    }
    
    @Transactional
    public AINoteDTO generateNote(Long taskId, GenerateNoteRequest request) {
        AITask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found: " + taskId));
        
        // 获取对话历史
        List<ConversationMessage> messages = null;
        if (request.getConversationId() != null) {
            messages = messageRepository.findByConversationIdOrderBySequenceAsc(request.getConversationId());
        } else {
            // 获取最新的对话
            List<Conversation> conversations = conversationRepository.findByTaskId(taskId);
            if (!conversations.isEmpty()) {
                Conversation latestConversation = conversations.get(conversations.size() - 1);
                messages = messageRepository.findByConversationIdOrderBySequenceAsc(latestConversation.getId());
            }
        }
        
        // 构建提示词
        String prompt = buildNoteGenerationPrompt(task, messages, request.getTemplate());
        
        // 调用LLM生成笔记
        List<java.util.Map<String, String>> llmMessages = new java.util.ArrayList<>();
        java.util.Map<String, String> userMessage = new java.util.HashMap<>();
        userMessage.put("role", "user");
        userMessage.put("content", prompt);
        llmMessages.add(userMessage);
        
        String noteContent = llmService.chatCompletion(llmMessages, null);
        
        // 解析笔记内容（假设LLM返回的是Markdown格式）
        String title = extractTitle(noteContent);
        String summary = extractSummary(noteContent);
        
        // 保存笔记
        AINote note = new AINote();
        note.setTaskId(taskId);
        note.setConversationId(request.getConversationId());
        note.setTitle(title);
        note.setContent(noteContent);
        note.setSummary(summary);
        note.setVersion(1);
        
        note = noteRepository.save(note);
        return AINoteDTO.fromEntity(note);
    }
    
    public List<AINoteDTO> getNotes(Long taskId) {
        List<AINote> notes = noteRepository.findByTaskId(taskId);
        return notes.stream()
                .map(AINoteDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public AINoteDTO updateNote(Long taskId, Long noteId, UpdateNoteRequest request) {
        AINote note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found: " + noteId));
        
        if (!note.getTaskId().equals(taskId)) {
            throw new RuntimeException("Note does not belong to task");
        }
        
        if (request.getTitle() != null) {
            note.setTitle(request.getTitle());
        }
        if (request.getContent() != null) {
            note.setContent(request.getContent());
        }
        note.setVersion(note.getVersion() + 1);
        
        note = noteRepository.save(note);
        return AINoteDTO.fromEntity(note);
    }
    
    @Transactional
    public AINoteDTO regenerateNote(Long taskId, Long noteId, RegenerateNoteRequest request) {
        AINote note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found: " + noteId));
        
        AITask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found: " + taskId));
        
        // 获取最新对话
        List<ConversationMessage> messages = null;
        if (request.getIncludeLatestConversation() != null && request.getIncludeLatestConversation()) {
            List<Conversation> conversations = conversationRepository.findByTaskId(taskId);
            if (!conversations.isEmpty()) {
                Conversation latestConversation = conversations.get(conversations.size() - 1);
                messages = messageRepository.findByConversationIdOrderBySequenceAsc(latestConversation.getId());
            }
        }
        
        String prompt = buildNoteGenerationPrompt(task, messages, null);
        
        List<java.util.Map<String, String>> llmMessages = new java.util.ArrayList<>();
        java.util.Map<String, String> userMessage = new java.util.HashMap<>();
        userMessage.put("role", "user");
        userMessage.put("content", prompt);
        llmMessages.add(userMessage);
        
        String noteContent = llmService.chatCompletion(llmMessages, null);
        
        note.setContent(noteContent);
        note.setTitle(extractTitle(noteContent));
        note.setSummary(extractSummary(noteContent));
        note.setVersion(note.getVersion() + 1);
        
        note = noteRepository.save(note);
        return AINoteDTO.fromEntity(note);
    }
    
    @Transactional
    public void deleteNote(Long taskId, Long noteId) {
        AINote note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found: " + noteId));
        
        if (!note.getTaskId().equals(taskId)) {
            throw new RuntimeException("Note does not belong to task");
        }
        
        noteRepository.delete(note);
    }
    
    private String buildNoteGenerationPrompt(AITask task, List<ConversationMessage> messages, String template) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("请根据以下任务和对话内容，生成一份结构化的笔记。\n\n");
        prompt.append("任务标题：").append(task.getTitle()).append("\n");
        if (task.getDescription() != null) {
            prompt.append("任务描述：").append(task.getDescription()).append("\n");
        }
        prompt.append("任务类型：").append(task.getType()).append("\n\n");
        
        if (messages != null && !messages.isEmpty()) {
            prompt.append("对话内容：\n");
            for (ConversationMessage msg : messages) {
                prompt.append(msg.getRole()).append(": ").append(msg.getContent()).append("\n\n");
            }
        }
        
        if (template != null) {
            prompt.append("\n请使用以下模板格式：\n").append(template);
        } else {
            prompt.append("\n请生成一份结构化的Markdown笔记，包含：标题、摘要、主要内容、关键点等。");
        }
        
        return prompt.toString();
    }
    
    private String extractTitle(String content) {
        // 简单提取：取第一行作为标题
        String[] lines = content.split("\n");
        for (String line : lines) {
            line = line.trim();
            if (line.startsWith("# ")) {
                return line.substring(2);
            }
        }
        return "笔记";
    }
    
    private String extractSummary(String content) {
        // 简单提取：取前200个字符作为摘要
        if (content.length() > 200) {
            return content.substring(0, 200) + "...";
        }
        return content;
    }
}
