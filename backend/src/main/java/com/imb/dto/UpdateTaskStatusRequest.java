package com.imb.dto;

import com.imb.entity.AITask;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateTaskStatusRequest {
    @NotNull(message = "状态不能为空")
    private AITask.AITaskStatus status;
}
