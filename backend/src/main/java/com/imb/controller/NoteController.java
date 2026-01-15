package com.imb.controller;

import com.imb.dto.AINoteDTO;
import com.imb.dto.GenerateNoteRequest;
import com.imb.dto.RegenerateNoteRequest;
import com.imb.dto.UpdateNoteRequest;
import com.imb.service.NoteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ai/tasks/{taskId}/notes")
public class NoteController {
    
    private final NoteService noteService;
    
    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }
    
    @PostMapping("/generate")
    public ResponseEntity<AINoteDTO> generateNote(
            @PathVariable Long taskId,
            @RequestBody(required = false) GenerateNoteRequest request) {
        if (request == null) {
            request = new GenerateNoteRequest();
        }
        AINoteDTO note = noteService.generateNote(taskId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(note);
    }
    
    @GetMapping
    public ResponseEntity<List<AINoteDTO>> getNotes(@PathVariable Long taskId) {
        List<AINoteDTO> notes = noteService.getNotes(taskId);
        return ResponseEntity.ok(notes);
    }
    
    @PutMapping("/{noteId}")
    public ResponseEntity<AINoteDTO> updateNote(
            @PathVariable Long taskId,
            @PathVariable Long noteId,
            @RequestBody UpdateNoteRequest request) {
        AINoteDTO note = noteService.updateNote(taskId, noteId, request);
        return ResponseEntity.ok(note);
    }
    
    @PostMapping("/{noteId}/regenerate")
    public ResponseEntity<AINoteDTO> regenerateNote(
            @PathVariable Long taskId,
            @PathVariable Long noteId,
            @RequestBody(required = false) RegenerateNoteRequest request) {
        if (request == null) {
            request = new RegenerateNoteRequest();
        }
        AINoteDTO note = noteService.regenerateNote(taskId, noteId, request);
        return ResponseEntity.ok(note);
    }
    
    @DeleteMapping("/{noteId}")
    public ResponseEntity<Void> deleteNote(
            @PathVariable Long taskId,
            @PathVariable Long noteId) {
        noteService.deleteNote(taskId, noteId);
        return ResponseEntity.noContent().build();
    }
}
