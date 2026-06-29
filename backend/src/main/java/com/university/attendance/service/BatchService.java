package com.university.attendance.service;

import com.university.attendance.model.Batch;
import com.university.attendance.model.DeletedRecord;
import com.university.attendance.repository.BatchRepository;
import com.university.attendance.repository.DeletedRecordRepository;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BatchService {
    private final BatchRepository batchRepository;
    private final DeletedRecordRepository deletedRecordRepository;

    public BatchService(BatchRepository batchRepository, DeletedRecordRepository deletedRecordRepository) {
        this.batchRepository = batchRepository;
        this.deletedRecordRepository = deletedRecordRepository;
    }

    public List<Batch> findAll() {
        return batchRepository.findByDeletedFalseOrderByIdDesc();
    }

    public Batch findById(@NonNull Long id) {
        return batchRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Batch not found"));
    }

    public Batch save(@NonNull Batch batch) {
        return batchRepository.save(batch);
    }

    public Batch update(@NonNull Long id, Batch request) {
        Batch batch = findById(id);
        batch.setName(request.getName());
        batch.setCourseName(request.getCourseName());
        batch.setAssignedTeacherName(request.getAssignedTeacherName());
        batch.setActive(request.isActive());
        return batchRepository.save(batch);
    }

    public void delete(@NonNull Long id) {
        Batch batch = findById(id);
        batch.setDeleted(true);
        batchRepository.save(batch);
        deletedRecordRepository.save(new DeletedRecord(null, "batches", id, "system", batch.getName()));
    }
}
