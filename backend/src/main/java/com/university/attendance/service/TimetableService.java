package com.university.attendance.service;

import com.university.attendance.model.Timetable;
import com.university.attendance.repository.TimetableRepository;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TimetableService {
    private final TimetableRepository timetableRepository;

    public TimetableService(TimetableRepository timetableRepository) {
        this.timetableRepository = timetableRepository;
    }

    public List<Timetable> findAll() {
        return timetableRepository.findAll();
    }

    public Timetable findById(@NonNull Long id) {
        return timetableRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Timetable not found"));
    }

    public Timetable save(@NonNull Timetable timetable) {
        return timetableRepository.save(timetable);
    }

    public Timetable update(@NonNull Long id, Timetable request) {
        Timetable timetable = findById(id);
        timetable.setBatchId(request.getBatchId());
        timetable.setSubject(request.getSubject());
        timetable.setTeacherId(request.getTeacherId());
        timetable.setDate(request.getDate());
        timetable.setStartTime(request.getStartTime());
        timetable.setEndTime(request.getEndTime());
        return timetableRepository.save(timetable);
    }

    public void delete(@NonNull Long id) {
        timetableRepository.deleteById(id);
    }
}
