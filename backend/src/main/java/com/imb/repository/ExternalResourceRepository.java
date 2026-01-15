package com.imb.repository;

import com.imb.entity.ExternalResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExternalResourceRepository extends JpaRepository<ExternalResource, Long> {
    List<ExternalResource> findByTaskId(Long taskId);
    Optional<ExternalResource> findByUrlAndTaskId(String url, Long taskId);
}
