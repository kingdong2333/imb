package com.imb.dto;

import lombok.Data;

@Data
public class GenerateNoteRequest {
    private Long conversationId;
    private String template;
}
