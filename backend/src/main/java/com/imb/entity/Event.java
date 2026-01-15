package com.imb.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "events")
@Data
public class Event {
    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventScope scope;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventStatus status;

    @Column(name = "event_date")
    private LocalDate date;

    @Column(name = "event_time")
    private LocalTime time;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        if (status == null) {
            status = EventStatus.TODO;
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public enum EventType {
        ROUTINE,
        REMINDER,
        LEARNING
    }

    public enum EventScope {
        DAY,
        WEEK,
        MONTH,
        YEAR,
        IDEA
    }

    public enum EventPriority {
        HIGH,
        MEDIUM,
        LOW
    }

    public enum EventStatus {
        TODO,
        DONE,
        WAITING
    }
}
