package com.imb.dto;

import com.imb.entity.KnowledgeFragment;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class KnowledgeFragmentDTO {
    private Long id;
    private Long taskId;
    private KnowledgeFragment.SourceType sourceType;
    private Long sourceId;
    private String content;
    private String metadataJson;
    private Double relevanceScore;
    private LocalDateTime createdAt;

    public static KnowledgeFragmentDTO fromEntity(KnowledgeFragment fragment) {
        KnowledgeFragmentDTO dto = new KnowledgeFragmentDTO();
        dto.setId(fragment.getId());
        dto.setTaskId(fragment.getTaskId());
        dto.setSourceType(fragment.getSourceType());
        dto.setSourceId(fragment.getSourceId());
        dto.setContent(fragment.getContent());
        dto.setMetadataJson(fragment.getMetadataJson());
        dto.setCreatedAt(fragment.getCreatedAt());
        return dto;
    }
}
