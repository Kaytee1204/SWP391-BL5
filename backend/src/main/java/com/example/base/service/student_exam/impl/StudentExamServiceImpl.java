package com.example.base.service.student_exam.impl;

import com.example.base.dto.common.PageResponse;
import com.example.base.dto.student_exam.request.*;
import com.example.base.dto.student_exam.response.*;
import com.example.base.entity.*;
import com.example.base.exception.*;
import com.example.base.repository.*;
import com.example.base.security.UserPrincipal;
import com.example.base.service.student_exam.StudentExamService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.util.*;

@Service @RequiredArgsConstructor
public class StudentExamServiceImpl implements StudentExamService {
    private final QuestionSetRepository setRepo; private final QuestionSetItemRepository itemRepo;
    private final TestAttemptRepository attemptRepo; private final TestAttemptAnswerRepository answerRepo;
    private final AccountRepository accountRepo; private final ObjectMapper json;

    @Override @Transactional(readOnly=true) public PageResponse<StudentExamSummaryResponse> listExams(Pageable p) {
        return PageResponse.from(setRepo.findAll(p).map(s -> StudentExamSummaryResponse.builder().questionSetId(s.getQuestionSetId()).title(s.getTitle()).description(s.getDescription()).skillType(s.getSkillType()).jlptLevel(s.getJlptLevel()).durationMinutes(s.getDurationMinutes()).questionCount(itemRepo.countByQuestionSetQuestionSetId(s.getQuestionSetId())).build()));
    }
    @Override @Transactional public TestAttemptResponse start(Long setId, UserPrincipal u) {
        student(u); QuestionSet set=setRepo.findById(setId).orElseThrow(()->new ResourceNotFoundException("QuestionSet","id",setId));
        if(itemRepo.countByQuestionSetQuestionSetId(setId)==0) throw new AppException(ErrorCode.BAD_REQUEST,"Đề thi chưa có câu hỏi");
        Optional<TestAttempt> active=attemptRepo.findFirstByStudentAccountIdAndQuestionSetQuestionSetIdAndStatusOrderByStartedAtDesc(u.getAccountId(),setId,"in_progress");
        if(active.isPresent() && remaining(active.get())>0) return response(active.get(),false);
        active.ifPresent(a->{a.setStatus("expired");a.setSubmittedAt(LocalDateTime.now());attemptRepo.save(a);});
        TestAttempt a=TestAttempt.builder().student(accountRepo.findById(u.getAccountId()).orElseThrow()).questionSet(set).status("in_progress").totalScore(itemRepo.countByQuestionSetQuestionSetId(setId)).build();
        return response(attemptRepo.save(a),false);
    }
    @Override @Transactional public TestAttemptResponse getAttempt(Long id, UserPrincipal u) { TestAttempt a=owned(id,u); if(a.getStatus().equals("in_progress")&&remaining(a)<=0) grade(a,"expired"); return response(a,!a.getStatus().equals("in_progress")); }
    @Override @Transactional public TestAttemptResponse saveAnswer(Long id,Long qid,SaveAnswerRequest r,UserPrincipal u){ TestAttempt a=owned(id,u); ensureOpen(a); QuestionSetItem item=itemRepo.findByQuestionSetQuestionSetIdOrderByQuestionOrderAsc(a.getQuestionSet().getQuestionSetId()).stream().filter(i->i.getQuestion().getQuestionId().equals(qid)).findFirst().orElseThrow(()->new AppException(ErrorCode.BAD_REQUEST,"Câu hỏi không thuộc đề thi")); TestAttemptAnswer ans=answerRepo.findByAttemptAttemptIdAndQuestionQuestionId(id,qid).orElse(TestAttemptAnswer.builder().attempt(a).question(item.getQuestion()).build()); ans.setSelectedAnswer(write(r.getSelectedAnswers())); ans.setNote(trim(r.getNote())); ans.setCorrect(null); answerRepo.save(ans); return response(a,false); }
    @Override @Transactional public TestAttemptResponse submit(Long id,UserPrincipal u){ TestAttempt a=owned(id,u); if(!a.getStatus().equals("in_progress")) return response(a,true); grade(a,"submitted"); return response(a,true); }
    @Override @Transactional(readOnly=true) public PageResponse<TestAttemptResponse> history(Pageable p,UserPrincipal u){ student(u); return PageResponse.from(attemptRepo.findByStudentAccountIdOrderByStartedAtDesc(u.getAccountId(),p).map(a->response(a,false))); }
    @Override @Transactional public TestAttemptResponse updateNote(Long id,UpdateAttemptNoteRequest r,UserPrincipal u){ TestAttempt a=owned(id,u); a.setReviewNote(trim(r.getNote())); return response(attemptRepo.save(a),!a.getStatus().equals("in_progress")); }
    private void grade(TestAttempt a,String status){ List<TestAttemptAnswer> answers=answerRepo.findByAttemptAttemptId(a.getAttemptId()); long score=0; for(TestAttemptAnswer x:answers){ boolean ok=normalize(read(x.getSelectedAnswer())).equals(normalize(read(x.getQuestion().getCorrectAnswer()))); x.setCorrect(ok); if(ok)score++; } answerRepo.saveAll(answers); a.setScore(score); a.setTotalScore(itemRepo.countByQuestionSetQuestionSetId(a.getQuestionSet().getQuestionSetId())); a.setStatus(status); a.setSubmittedAt(LocalDateTime.now()); attemptRepo.save(a); }
    private TestAttemptResponse response(TestAttempt a,boolean reveal){ Map<Long,TestAttemptAnswer> answers=new HashMap<>(); answerRepo.findByAttemptAttemptId(a.getAttemptId()).forEach(x->answers.put(x.getQuestion().getQuestionId(),x)); List<StudentExamQuestionResponse> qs=itemRepo.findByQuestionSetQuestionSetIdOrderByQuestionOrderAsc(a.getQuestionSet().getQuestionSetId()).stream().map(i->{QuestionBank q=i.getQuestion();TestAttemptAnswer x=answers.get(q.getQuestionId());return StudentExamQuestionResponse.builder().questionId(q.getQuestionId()).questionOrder(i.getQuestionOrder()).questionText(q.getQuestionText()).questionType(q.getQuestionType()).choices(read(q.getChoices())).selectedAnswers(x==null?List.of():read(x.getSelectedAnswer())).note(x==null?null:x.getNote()).correct(reveal&&x!=null?x.getCorrect():null).correctAnswers(reveal?read(q.getCorrectAnswer()):null).explanation(reveal?q.getExplanation():null).build();}).toList(); QuestionSet s=a.getQuestionSet(); return TestAttemptResponse.builder().attemptId(a.getAttemptId()).questionSetId(s.getQuestionSetId()).title(s.getTitle()).jlptLevel(s.getJlptLevel().name()).skillType(s.getSkillType().name()).durationMinutes(s.getDurationMinutes()).score(a.getScore()).totalScore(a.getTotalScore()).status(a.getStatus()).reviewNote(a.getReviewNote()).startedAt(a.getStartedAt()).submittedAt(a.getSubmittedAt()).remainingSeconds(a.getStatus().equals("in_progress")?remaining(a):0L).questions(qs).build(); }
    private long remaining(TestAttempt a){return Math.max(0,Duration.between(LocalDateTime.now(),a.getStartedAt().plusMinutes(a.getQuestionSet().getDurationMinutes())).getSeconds());}
    private void ensureOpen(TestAttempt a){if(!a.getStatus().equals("in_progress"))throw new AppException(ErrorCode.CONFLICT,"Lượt thi đã kết thúc");if(remaining(a)<=0){grade(a,"expired");throw new AppException(ErrorCode.CONFLICT,"Đã hết thời gian làm bài");}}
    private TestAttempt owned(Long id,UserPrincipal u){student(u);TestAttempt a=attemptRepo.findById(id).orElseThrow(()->new ResourceNotFoundException("TestAttempt","id",id));if(!a.getStudent().getAccountId().equals(u.getAccountId()))throw new AppException(ErrorCode.FORBIDDEN);return a;}
    private void student(UserPrincipal u){if(u==null||u.getAuthorities().stream().noneMatch(x->x.getAuthority().equalsIgnoreCase("Student")||x.getAuthority().equalsIgnoreCase("ROLE_Student")))throw new AppException(ErrorCode.FORBIDDEN,"Chỉ Student được làm bài thi");}
    private List<String> read(String value){if(value==null||value.isBlank())return List.of();try{return json.readValue(value,new TypeReference<List<String>>(){});}catch(Exception e){return List.of(value);}}
    private String write(List<String> v){try{return json.writeValueAsString(v==null?List.of():v);}catch(Exception e){throw new AppException(ErrorCode.BAD_REQUEST,"Đáp án không hợp lệ");}}
    private Set<String> normalize(List<String> v){Set<String>s=new TreeSet<>(String.CASE_INSENSITIVE_ORDER);v.stream().map(String::trim).filter(x->!x.isBlank()).forEach(s::add);return s;}
    private String trim(String v){return v==null||v.isBlank()?null:v.trim();}
}
