package com.imb.dto;

import com.imb.entity.Event;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class EventDTO {
    private String id;
    private String title;
    private Event.EventType type;
    private Event.EventScope scope;
    private Event.EventPriority priority;
    private Event.EventStatus status;
    private String date;       // yyyy-MM-dd
    private String time;       // HH:mm
    private String description;
    private Long createdAt;    // epoch millis

    public static EventDTO fromEntity(Event event) {
        EventDTO dto = new EventDTO();
        dto.setId(event.getId());
        dto.setTitle(event.getTitle());
        dto.setType(event.getType());
        dto.setScope(event.getScope());
        dto.setPriority(event.getPriority());
        dto.setStatus(event.getStatus());
        if (event.getDate() != null) {
            dto.setDate(event.getDate().toString());
        }
        if (event.getTime() != null) {
            dto.setTime(event.getTime().toString());
        }
        dto.setDescription(event.getDescription());
        if (event.getCreatedAt() != null) {
            dto.setCreatedAt(event.getCreatedAt().toEpochMilli());
        }
        return dto;
    }

    public Event toEntity() {
        Event event = new Event();
        event.setId(this.id);
        event.setTitle(this.title);
        event.setType(this.type);
        event.setScope(this.scope);
        event.setPriority(this.priority);
        event.setStatus(this.status);
        if (this.date != null && !this.date.isBlank()) {
            event.setDate(LocalDate.parse(this.date));
        }
        if (this.time != null && !this.time.isBlank()) {
            event.setTime(LocalTime.parse(this.time));
        }
        event.setDescription(this.description);
        if (this.createdAt != null) {
            event.setCreatedAt(Instant.ofEpochMilli(this.createdAt));
        }
        return event;
    }
}
