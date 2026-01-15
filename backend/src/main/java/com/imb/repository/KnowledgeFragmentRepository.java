package com.imb.repository;

import com.imb.entity.KnowledgeFragment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KnowledgeFragmentRepository extends JpaRepository<KnowledgeFragment, Long> {
    List<KnowledgeFragment> findByTaskId(Long taskId);
    
    @Query(value = "SELECT * FROM knowledge_fragments WHERE task_id = :taskId AND MATCH(content) AGAINST(:query IN NATURAL LANGUAGE MODE) LIMIT :limit", nativeQuery = true)
    List<KnowledgeFragment> searchByContent(@Param("taskId") Long taskId, @Param("query") String query, @Param("limit") int limit);
    
    @Query(value = "SELECT * FROM knowledge_fragments WHERE MATCH(content) AGAINST(:query IN NATURAL LANGUAGE MODE) LIMIT :limit", nativeQuery = true)
    List<KnowledgeFragment> searchAllByContent(@Param("query") String query, @Param("limit") int limit);
}
