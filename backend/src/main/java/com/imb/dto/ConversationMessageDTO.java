package com.imb.dto;

import com.imb.entity.ConversationMessage;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ConversationMessageDTO {
    private Long id;
    private Long conversationId;
    private ConversationMessage.MessageRole role;
    private String content;
    private String metadataJson;
    private Integer sequence;
    private LocalDateTime createdAt;

    public static ConversationMessageDTO fromEntity(ConversationMessage message) {
        ConversationMessageDTO dto = new ConversationMessageDTO();
        dto.setId(message.getId());
        dto.setConversationId(message.getConversationId());
        dto.setRole(message.getRole());
        dto.setContent(message.getContent());
        dto.setMetadataJson(message.getMetadataJson());
        dto.setSequence(message.getSequence());
        dto.setCreatedAt(message.getCreatedAt());
        return dto;
    }
}
