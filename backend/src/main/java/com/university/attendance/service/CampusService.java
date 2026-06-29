package com.university.attendance.service;

import com.university.attendance.model.CampusLocation;
import com.university.attendance.repository.CampusLocationRepository;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CampusService {
    private final CampusLocationRepository campusLocationRepository;

    public CampusService(CampusLocationRepository campusLocationRepository) {
        this.campusLocationRepository = campusLocationRepository;
    }

    public List<CampusLocation> findAll() {
        return campusLocationRepository.findAll();
    }

    public CampusLocation findById(@NonNull Long id) {
        return campusLocationRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Campus not found"));
    }

    public CampusLocation save(@NonNull CampusLocation campusLocation) {
        validate(campusLocation);
        campusLocation.setActive(true);
        return campusLocationRepository.save(campusLocation);
    }

    public CampusLocation update(@NonNull Long id, CampusLocation request) {
        CampusLocation campus = findById(id);
        campus.setName(request.getName());
        campus.setLatitude(request.getLatitude());
        campus.setLongitude(request.getLongitude());
        campus.setRadius(request.getRadius());
        campus.setActive(true);
        validate(campus);
        return campusLocationRepository.save(campus);
    }

    public void delete(@NonNull Long id) {
        campusLocationRepository.deleteById(id);
    }

    private void validate(CampusLocation campus) {
        if (campus.getName() == null || campus.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Campus name is required");
        }
        if (campus.getLatitude() < -90 || campus.getLatitude() > 90) {
            throw new IllegalArgumentException("Latitude must be between -90 and 90");
        }
        if (campus.getLongitude() < -180 || campus.getLongitude() > 180) {
            throw new IllegalArgumentException("Longitude must be between -180 and 180");
        }
        if (campus.getRadius() < 20 || campus.getRadius() > 5000) {
            throw new IllegalArgumentException("Radius must be between 20 and 5000 meters");
        }
    }
}
