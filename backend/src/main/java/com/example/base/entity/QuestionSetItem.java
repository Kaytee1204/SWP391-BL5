package com.example.base.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "QuestionSetItem",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "UK_QuestionSetItem_Set_Question",
                        columnNames = {
                                "question_set_id",
                                "question_id"
                        }
                ),
                @UniqueConstraint(
                        name = "UK_QuestionSetItem_Set_Order",
                        columnNames = {
                                "question_set_id",
                                "question_order"
                        }
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionSetItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "question_set_item_id")
    private Long questionSetItemId;

    //FetchType.Lazy : 	Chỉ load dữ liệu liên quan khi thực sự truy cập vào field đó (gọi getter)
    @ManyToOne(fetch=FetchType.LAZY) //quan hệ nhiều câu hỏi thuộc 1 bộ đề
    @JoinColumn(name="question_set_id",nullable = false)
    private QuestionSet questionSet;

    @ManyToOne(fetch =FetchType.LAZY) //quan hệ nhiều câu hỏi thuộc 1 questionBank
    @JoinColumn(name="question_id",nullable = false)
    private QuestionBank question;

    @Column(name="question_order",nullable = false)
    private Integer questionOrder;
}
