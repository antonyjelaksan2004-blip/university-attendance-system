package com.university.attendance.controller;

import com.university.attendance.model.Batch;
import com.university.attendance.service.BatchService;

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
@RequestMapping("/api/batches")
public class BatchController {
    private final BatchService batchService;

    public BatchController(BatchService batchService) {
        this.batchService = batchService;
    }

    @GetMapping
    public List<Batch> all() {
        return batchService.findAll();
    }

    @GetMapping("/{id}")
    public Batch one(@PathVariable @NonNull Long id) {
        return batchService.findById(id);
    }

    @PostMapping
    public Batch create(@RequestBody @NonNull Batch batch) {
        return batchService.save(batch);
    }

    @PutMapping("/{id}")
    public Batch update(@PathVariable @NonNull Long id, @RequestBody @NonNull Batch batch) {
        return batchService.update(id, batch);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable @NonNull Long id) {
        batchService.delete(id);
    }
}
