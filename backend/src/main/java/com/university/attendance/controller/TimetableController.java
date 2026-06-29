package com.university.attendance.controller;

import com.university.attendance.model.Timetable;
import com.university.attendance.service.TimetableService;

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
@RequestMapping("/api/timetable")
public class TimetableController {
    private final TimetableService timetableService;

    public TimetableController(TimetableService timetableService) {
        this.timetableService = timetableService;
    }

    @GetMapping
    public List<Timetable> all() {
        return timetableService.findAll();
    }

    @GetMapping("/{id}")
    public Timetable one(@PathVariable @NonNull Long id) {
        return timetableService.findById(id);
    }

    @PostMapping
    public Timetable create(@RequestBody @NonNull Timetable timetable) {
        return timetableService.save(timetable);
    }

    @PutMapping("/{id}")
    public Timetable update(@PathVariable @NonNull Long id, @RequestBody Timetable timetable) {
        return timetableService.update(id, timetable);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable @NonNull Long id) {
        timetableService.delete(id);
    }
}
