package com.imb.service;

import com.imb.dto.KnowledgeFragmentDTO;
import com.imb.dto.SearchKnowledgeRequest;
import com.imb.entity.KnowledgeFragment;
import com.imb.repository.KnowledgeFragmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class KnowledgeService {
    
    private final KnowledgeFragmentRepository fragmentRepository;
    
    public KnowledgeService(KnowledgeFragmentRepository fragmentRepository) {
        this.fragmentRepository = fragmentRepository;
    }
    
    public List<KnowledgeFragmentDTO> search(SearchKnowledgeRequest request) {
        List<KnowledgeFragment> fragments;
        
        if (request.getTaskId() != null) {
            fragments = fragmentRepository.searchByContent(
                    request.getTaskId(),
                    request.getQuery(),
                    request.getLimit() != null ? request.getLimit() : 10
            );
        } else {
            fragments = fragmentRepository.searchAllByContent(
                    request.getQuery(),
                    request.getLimit() != null ? request.getLimit() : 10
            );
        }
        
        return fragments.stream()
                .map(fragment -> {
                    KnowledgeFragmentDTO dto = KnowledgeFragmentDTO.fromEntity(fragment);
                    // 简单的相关性评分（实际应该使用向量相似度）
                    dto.setRelevanceScore(0.8);
                    return dto;
                })
                .collect(Collectors.toList());
    }
}
