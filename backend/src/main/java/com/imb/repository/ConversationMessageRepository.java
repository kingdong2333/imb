package com.imb.repository;

import com.imb.entity.ConversationMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConversationMessageRepository extends JpaRepository<ConversationMessage, Long> {
    List<ConversationMessage> findByConversationIdOrderBySequenceAsc(Long conversationId);
    Page<ConversationMessage> findByConversationIdOrderBySequenceAsc(Long conversationId, Pageable pageable);
    Integer countByConversationId(Long conversationId);
}
