import { apiRequest } from './apiRequest';
export const studentExamApi={
 list:(page=0)=>apiRequest(`/student-exams?page=${page}&size=9`),
 start:(id)=>apiRequest(`/student-exams/${id}/attempts`,'POST'),
 attempt:(id)=>apiRequest(`/student-exams/attempts/${id}`),
 answer:(id,qid,selectedAnswers,note)=>apiRequest(`/student-exams/attempts/${id}/answers/${qid}`,'PUT',{selectedAnswers,note}),
 submit:(id)=>apiRequest(`/student-exams/attempts/${id}/submit`,'POST'),
 history:(page=0)=>apiRequest(`/student-exams/history?page=${page}&size=10`),
 note:(id,note)=>apiRequest(`/student-exams/attempts/${id}/note`,'PATCH',{note})
};
