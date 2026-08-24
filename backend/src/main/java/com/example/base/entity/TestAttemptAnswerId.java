package com.example.base.entity;

import lombok.*;
import java.io.Serializable;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode
public class TestAttemptAnswerId implements Serializable {
    private Long attempt;
    private Long question;
}
