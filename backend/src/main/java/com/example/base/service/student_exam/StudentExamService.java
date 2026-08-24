package com.example.base.service.student_exam;
import com.example.base.dto.common.PageResponse;
import com.example.base.dto.student_exam.request.*;
import com.example.base.dto.student_exam.response.*;
import com.example.base.security.UserPrincipal;
import org.springframework.data.domain.Pageable;
public interface StudentExamService { PageResponse<StudentExamSummaryResponse> listExams(Pageable p); TestAttemptResponse start(Long setId, UserPrincipal u); TestAttemptResponse getAttempt(Long id, UserPrincipal u); TestAttemptResponse saveAnswer(Long id, Long qid, SaveAnswerRequest r, UserPrincipal u); TestAttemptResponse submit(Long id, UserPrincipal u); PageResponse<TestAttemptResponse> history(Pageable p, UserPrincipal u); TestAttemptResponse updateNote(Long id, UpdateAttemptNoteRequest r, UserPrincipal u); }
