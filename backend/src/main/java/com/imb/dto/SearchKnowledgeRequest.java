package com.imb.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SearchKnowledgeRequest {
    @NotBlank(message = "搜索关键词不能为空")
    private String query;
    
    private Long taskId;
    
    private Integer limit = 10;
}
