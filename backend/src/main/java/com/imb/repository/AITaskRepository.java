package com.imb.repository;

import com.imb.entity.AITask;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AITaskRepository extends JpaRepository<AITask, Long> {
    Page<AITask> findByStatus(AITask.AITaskStatus status, Pageable pageable);
    Page<AITask> findByType(AITask.AITaskType type, Pageable pageable);
    Page<AITask> findByStatusAndType(AITask.AITaskStatus status, AITask.AITaskType type, Pageable pageable);
    List<AITask> findByEventId(String eventId);
    Page<AITask> findByEventId(String eventId, Pageable pageable);
}
