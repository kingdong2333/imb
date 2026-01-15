package com.imb.service;

import com.imb.dto.ConversationDTO;
import com.imb.dto.ConversationMessageDTO;
import com.imb.entity.Conversation;
import com.imb.entity.ConversationMessage;
import com.imb.repository.ConversationMessageRepository;
import com.imb.repository.ConversationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ConversationService {
    
    private final ConversationRepository conversationRepository;
    private final ConversationMessageRepository messageRepository;
    
    public ConversationService(
            ConversationRepository conversationRepository,
            ConversationMessageRepository messageRepository) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
    }
    
    @Transactional
    public ConversationDTO createConversation(Long taskId) {
        Conversation conversation = new Conversation();
        conversation.setTaskId(taskId);
        conversation.setStatus(Conversation.ConversationStatus.ACTIVE);
        
        conversation = conversationRepository.save(conversation);
        return ConversationDTO.fromEntity(conversation);
    }
    
    public Optional<Conversation> findBySessionId(String sessionId) {
        return conversationRepository.findBySessionId(sessionId);
    }
    
    @Transactional
    public ConversationMessageDTO saveMessage(Long conversationId, ConversationMessage.MessageRole role, String content, String metadataJson) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found: " + conversationId));
        
        Integer sequence = messageRepository.countByConversationId(conversationId) + 1;
        
        ConversationMessage message = new ConversationMessage();
        message.setConversationId(conversationId);
        message.setRole(role);
        message.setContent(content);
        message.setMetadataJson(metadataJson);
        message.setSequence(sequence);
        
        message = messageRepository.save(message);
        
        // 更新会话的最后消息时间
        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);
        
        return ConversationMessageDTO.fromEntity(message);
    }
    
    public List<ConversationMessageDTO> getMessages(Long conversationId) {
        List<ConversationMessage> messages = messageRepository.findByConversationIdOrderBySequenceAsc(conversationId);
        return messages.stream()
                .map(ConversationMessageDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    public Page<ConversationMessageDTO> getMessages(Long conversationId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ConversationMessage> messages = messageRepository.findByConversationIdOrderBySequenceAsc(conversationId, pageable);
        return messages.map(ConversationMessageDTO::fromEntity);
    }
}
