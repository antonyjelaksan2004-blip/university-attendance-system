package com.university.attendance.repository;

import com.university.attendance.model.CampusLocation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CampusLocationRepository extends JpaRepository<CampusLocation, Long> {
    Optional<CampusLocation> findFirstByActiveTrueOrderByIdDesc();
}
