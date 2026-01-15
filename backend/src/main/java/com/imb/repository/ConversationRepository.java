package com.imb.repository;

import com.imb.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    Optional<Conversation> findBySessionId(String sessionId);
    List<Conversation> findByTaskId(Long taskId);
    List<Conversation> findByTaskIdAndStatus(Long taskId, Conversation.ConversationStatus status);
}
