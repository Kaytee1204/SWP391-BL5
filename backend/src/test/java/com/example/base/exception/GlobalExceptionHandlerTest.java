package com.example.base.exception;

import com.example.base.dto.common.ApiResponse;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;

import static org.junit.jupiter.api.Assertions.assertEquals;

class GlobalExceptionHandlerTest {
    @Test
    void optimisticLockingUsesApiResponseAndHttp409() {
        ResponseEntity<ApiResponse<Void>> response = new GlobalExceptionHandler()
                .handleOptimisticLockingConflict(new ObjectOptimisticLockingFailureException("KanjiDetail", 1L));

        assertEquals(409, response.getStatusCode().value());
        assertEquals(409, response.getBody().getCode());
        assertEquals("This content has been updated by another lecturer. Please refresh the page and try again.",
                response.getBody().getMessage());
    }
}
