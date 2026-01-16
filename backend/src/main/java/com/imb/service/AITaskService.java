package com.imb.service;

import com.imb.dto.AITaskDTO;
import com.imb.dto.CreateAITaskRequest;
import com.imb.entity.AITask;
import com.imb.repository.AITaskRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AITaskService {
    
    private final AITaskRepository taskRepository;
    
    public AITaskService(AITaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }
    
    @Transactional
    public AITaskDTO createTask(CreateAITaskRequest request) {
        AITask task = new AITask();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setType(request.getType());
        task.setStatus(AITask.AITaskStatus.ACTIVE);
        task.setEventId(request.getEventId());
        
        task = taskRepository.save(task);
        return AITaskDTO.fromEntity(task);
    }
    
    public Page<AITaskDTO> getTasks(AITask.AITaskStatus status, AITask.AITaskType type, String eventId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AITask> tasks;
        
        if (eventId != null && !eventId.isEmpty()) {
            tasks = taskRepository.findByEventId(eventId, pageable);
        } else if (status != null && type != null) {
            tasks = taskRepository.findByStatusAndType(status, type, pageable);
        } else if (status != null) {
            tasks = taskRepository.findByStatus(status, pageable);
        } else if (type != null) {
            tasks = taskRepository.findByType(type, pageable);
        } else {
            tasks = taskRepository.findAll(pageable);
        }
        
        return tasks.map(AITaskDTO::fromEntity);
    }
    
    public AITaskDTO getTask(Long taskId) {
        AITask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found: " + taskId));
        return AITaskDTO.fromEntity(task);
    }
    
    @Transactional
    public void updateTaskStatus(Long taskId, AITask.AITaskStatus status) {
        AITask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found: " + taskId));
        task.setStatus(status);
        if (status == AITask.AITaskStatus.COMPLETED) {
            task.setCompletedAt(LocalDateTime.now());
        }
        taskRepository.save(task);
    }
    
    @Transactional
    public void deleteTask(Long taskId) {
        taskRepository.deleteById(taskId);
    }
}
