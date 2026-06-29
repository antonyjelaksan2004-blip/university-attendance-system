package com.university.attendance.service;

import com.university.attendance.model.DeletedRecord;
import com.university.attendance.model.Student;
import com.university.attendance.repository.DeletedRecordRepository;
import com.university.attendance.repository.StudentRepository;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentService {
    private final StudentRepository studentRepository;
    private final DeletedRecordRepository deletedRecordRepository;

    public StudentService(StudentRepository studentRepository, DeletedRecordRepository deletedRecordRepository) {
        this.studentRepository = studentRepository;
        this.deletedRecordRepository = deletedRecordRepository;
    }

    public List<Student> findAll() {
        return studentRepository.findByDeletedFalseOrderByIdDesc();
    }

    public Student findById(@NonNull Long id) {
        return studentRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Student not found"));
    }

    public Student save(@NonNull Student student) {
        return studentRepository.save(student);
    }

    public Student update(@NonNull Long id, Student request) {
        Student student = findById(id);
        student.setUserId(request.getUserId());
        student.setStudentNumber(request.getStudentNumber());
        student.setAddress(request.getAddress());
        student.setGuardianName(request.getGuardianName());
        student.setGuardianPhone(request.getGuardianPhone());
        student.setBatchId(request.getBatchId());
        return studentRepository.save(student);
    }

    public void delete(@NonNull Long id) {
        Student student = findById(id);
        student.setDeleted(true);
        studentRepository.save(student);
        deletedRecordRepository.save(new DeletedRecord(null, "students", id, "system", student.getStudentNumber()));
    }
}
