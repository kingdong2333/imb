package com.imb.dto;

import com.imb.entity.AITask;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AITaskDTO {
    private Long id;
    private Long userId;
    private String title;
    private String description;
    private AITask.AITaskType type;
    private AITask.AITaskStatus status;
    private String eventId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime completedAt;

    public static AITaskDTO fromEntity(AITask task) {
        AITaskDTO dto = new AITaskDTO();
        dto.setId(task.getId());
        dto.setUserId(task.getUserId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setType(task.getType());
        dto.setStatus(task.getStatus());
        dto.setEventId(task.getEventId());
        dto.setCreatedAt(task.getCreatedAt());
        dto.setUpdatedAt(task.getUpdatedAt());
        dto.setCompletedAt(task.getCompletedAt());
        return dto;
    }
}
