package com.imb.dto;

import lombok.Data;

@Data
public class RegenerateNoteRequest {
    private Boolean includeLatestConversation = true;
}
