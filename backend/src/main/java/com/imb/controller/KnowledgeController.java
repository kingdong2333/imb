package com.imb.controller;

import com.imb.dto.KnowledgeFragmentDTO;
import com.imb.dto.SearchKnowledgeRequest;
import com.imb.service.KnowledgeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/ai/knowledge")
public class KnowledgeController {
    
    private final KnowledgeService knowledgeService;
    
    public KnowledgeController(KnowledgeService knowledgeService) {
        this.knowledgeService = knowledgeService;
    }
    
    @PostMapping("/search")
    public ResponseEntity<Map<String, Object>> search(@Valid @RequestBody SearchKnowledgeRequest request) {
        List<KnowledgeFragmentDTO> results = knowledgeService.search(request);
        Map<String, Object> response = new HashMap<>();
        response.put("results", results);
        return ResponseEntity.ok(response);
    }
}
