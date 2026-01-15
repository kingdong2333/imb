package com.imb.repository;

import com.imb.entity.AINote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AINoteRepository extends JpaRepository<AINote, Long> {
    List<AINote> findByTaskId(Long taskId);
    List<AINote> findByConversationId(Long conversationId);
}
