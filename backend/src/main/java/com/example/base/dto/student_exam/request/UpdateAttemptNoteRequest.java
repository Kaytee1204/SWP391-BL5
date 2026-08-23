package com.example.base.dto.student_exam.request;
import jakarta.validation.constraints.Size;
import lombok.Data;
@Data public class UpdateAttemptNoteRequest { @Size(max=1000) private String note; }
