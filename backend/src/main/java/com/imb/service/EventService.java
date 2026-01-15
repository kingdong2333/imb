package com.imb.service;

import com.imb.dto.EventDTO;
import com.imb.entity.Event;
import com.imb.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventService {
    private final EventRepository eventRepository;

    public List<EventDTO> getAllEvents() {
        return eventRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(EventDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public EventDTO getEventById(String id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("事件不存在: " + id));
        return EventDTO.fromEntity(event);
    }

    @Transactional
    public EventDTO createEvent(EventDTO eventDTO) {
        Event event = eventDTO.toEntity();
        Event saved = eventRepository.save(event);
        return EventDTO.fromEntity(saved);
    }

    @Transactional
    public EventDTO updateEvent(String id, EventDTO eventDTO) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("事件不存在: " + id));

        event.setTitle(eventDTO.getTitle());
        event.setType(eventDTO.getType());
        event.setScope(eventDTO.getScope());
        event.setPriority(eventDTO.getPriority());
        event.setStatus(eventDTO.getStatus());
        if (eventDTO.getDate() != null && !eventDTO.getDate().isBlank()) {
            event.setDate(LocalDate.parse(eventDTO.getDate()));
        } else {
            event.setDate(null);
        }
        if (eventDTO.getTime() != null && !eventDTO.getTime().isBlank()) {
            event.setTime(java.time.LocalTime.parse(eventDTO.getTime()));
        } else {
            event.setTime(null);
        }
        event.setDescription(eventDTO.getDescription());

        Event updated = eventRepository.save(event);
        return EventDTO.fromEntity(updated);
    }

    @Transactional
    public void deleteEvent(String id) {
        if (!eventRepository.existsById(id)) {
            throw new RuntimeException("事件不存在: " + id);
        }
        eventRepository.deleteById(id);
    }

    // 获取指定日期的事件列表（主要用于日视图）
    public List<EventDTO> getEventsByDate(LocalDate date) {
        List<Event> events = eventRepository.findByDateOrderByTimeAsc(date);
        return events.stream()
                .map(EventDTO::fromEntity)
                .collect(Collectors.toList());
    }

    // 更新事件状态
    @Transactional
    public EventDTO updateEventStatus(String id, Event.EventStatus status) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("事件不存在: " + id));
        event.setStatus(status);
        Event updated = eventRepository.save(event);
        return EventDTO.fromEntity(updated);
    }
}
