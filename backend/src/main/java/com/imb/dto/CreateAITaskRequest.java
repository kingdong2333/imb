package com.imb.dto;

import com.imb.entity.AITask;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateAITaskRequest {
    @NotBlank(message = "任务标题不能为空")
    private String title;
    
    private String description;
    
    @NotNull(message = "任务类型不能为空")
    private AITask.AITaskType type;
    
    private String eventId;
}
