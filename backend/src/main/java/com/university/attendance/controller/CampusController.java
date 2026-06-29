package com.university.attendance.controller;

import com.university.attendance.model.CampusLocation;
import com.university.attendance.service.CampusService;

import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/campus")
public class CampusController {
    private final CampusService campusService;

    public CampusController(CampusService campusService) {
        this.campusService = campusService;
    }

    @GetMapping
    public List<CampusLocation> all() {
        return campusService.findAll();
    }

    @GetMapping("/{id}")
    public CampusLocation one(@PathVariable @NonNull Long id) {
        return campusService.findById(id);
    }

    @PostMapping
    public CampusLocation create(@RequestBody @NonNull CampusLocation campusLocation) {
        return campusService.save(campusLocation);
    }

    @PutMapping("/{id}")
    public CampusLocation update(@PathVariable @NonNull Long id, @RequestBody CampusLocation campusLocation) {
        return campusService.update(id, campusLocation);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable @NonNull Long id) {
        campusService.delete(id);
    }
}
