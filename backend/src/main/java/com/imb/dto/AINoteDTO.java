package com.imb.dto;

import com.imb.entity.AINote;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AINoteDTO {
    private Long id;
    private Long taskId;
    private Long conversationId;
    private String title;
    private String content;
    private String summary;
    private String tags;
    private String structureJson;
    private Integer version;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static AINoteDTO fromEntity(AINote note) {
        AINoteDTO dto = new AINoteDTO();
        dto.setId(note.getId());
        dto.setTaskId(note.getTaskId());
        dto.setConversationId(note.getConversationId());
        dto.setTitle(note.getTitle());
        dto.setContent(note.getContent());
        dto.setSummary(note.getSummary());
        dto.setTags(note.getTags());
        dto.setStructureJson(note.getStructureJson());
        dto.setVersion(note.getVersion());
        dto.setCreatedAt(note.getCreatedAt());
        dto.setUpdatedAt(note.getUpdatedAt());
        return dto;
    }
}
