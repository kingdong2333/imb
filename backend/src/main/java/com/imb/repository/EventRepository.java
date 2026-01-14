package com.imb.repository;

import com.imb.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, String> {

    List<Event> findAllByOrderByCreatedAtDesc();

    List<Event> findByDateOrderByTimeAsc(LocalDate date);
}
