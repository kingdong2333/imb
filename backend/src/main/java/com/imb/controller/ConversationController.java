package com.imb.controller;

import com.imb.dto.ConversationDTO;
import com.imb.dto.ConversationMessageDTO;
import com.imb.service.ConversationService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ai/tasks/{taskId}/conversations")
public class ConversationController {
    
    private final ConversationService conversationService;
    
    public ConversationController(ConversationService conversationService) {
        this.conversationService = conversationService;
    }
    
    @PostMapping
    public ResponseEntity<ConversationDTO> createConversation(@PathVariable Long taskId) {
        ConversationDTO conversation = conversationService.createConversation(taskId);
        return ResponseEntity.status(HttpStatus.CREATED).body(conversation);
    }
}

@RestController
@RequestMapping("/ai/conversations/{conversationId}/messages")
class ConversationMessageController {
    
    private final ConversationService conversationService;
    
    public ConversationMessageController(ConversationService conversationService) {
        this.conversationService = conversationService;
    }
    
    @GetMapping
    public ResponseEntity<Page<ConversationMessageDTO>> getMessages(
            @PathVariable Long conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Page<ConversationMessageDTO> messages = conversationService.getMessages(conversationId, page, size);
        return ResponseEntity.ok(messages);
    }
}
