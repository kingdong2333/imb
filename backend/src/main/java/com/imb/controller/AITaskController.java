package com.imb.controller;

import com.imb.dto.AITaskDTO;
import com.imb.dto.CreateAITaskRequest;
import com.imb.dto.UpdateTaskStatusRequest;
import com.imb.entity.AITask;
import com.imb.service.AITaskService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ai/tasks")
public class AITaskController {
    
    private final AITaskService taskService;
    
    public AITaskController(AITaskService taskService) {
        this.taskService = taskService;
    }
    
    @PostMapping
    public ResponseEntity<AITaskDTO> createTask(@Valid @RequestBody CreateAITaskRequest request) {
        AITaskDTO task = taskService.createTask(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(task);
    }
    
    @GetMapping
    public ResponseEntity<Page<AITaskDTO>> getTasks(
            @RequestParam(required = false) AITask.AITaskStatus status,
            @RequestParam(required = false) AITask.AITaskType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<AITaskDTO> tasks = taskService.getTasks(status, type, page, size);
        return ResponseEntity.ok(tasks);
    }
    
    @GetMapping("/{taskId}")
    public ResponseEntity<AITaskDTO> getTask(@PathVariable Long taskId) {
        AITaskDTO task = taskService.getTask(taskId);
        return ResponseEntity.ok(task);
    }
    
    @PatchMapping("/{taskId}/status")
    public ResponseEntity<Void> updateTaskStatus(
            @PathVariable Long taskId,
            @Valid @RequestBody UpdateTaskStatusRequest request) {
        taskService.updateTaskStatus(taskId, request.getStatus());
        return ResponseEntity.noContent().build();
    }
    
    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long taskId) {
        taskService.deleteTask(taskId);
        return ResponseEntity.noContent().build();
    }
}
