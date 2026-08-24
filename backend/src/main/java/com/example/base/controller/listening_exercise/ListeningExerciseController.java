package com.example.base.controller.listening_exercise;

import com.example.base.dto.common.ApiResponse;
import com.example.base.dto.common.PageResponse;
import com.example.base.dto.listening_exercise.request.ListeningExerciseCreateRequest;
import com.example.base.dto.listening_exercise.request.ListeningExerciseUpdateRequest;
import com.example.base.dto.listening_exercise.response.ListeningExerciseResponse;
import com.example.base.entity.JlptLevel;
import com.example.base.security.UserPrincipal;
import com.example.base.service.listening_exercise.ListeningExerciseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/listening-exercises")
@RequiredArgsConstructor
public class ListeningExerciseController {

    private final ListeningExerciseService service;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('Lecturer','ROLE_Lecturer','Manager','ROLE_Manager')")
    public ResponseEntity<ApiResponse<PageResponse<ListeningExerciseResponse>>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) JlptLevel jlptLevel,
            @PageableDefault(size = 10, sort = "listeningExerciseId", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.search(keyword, jlptLevel, pageable)));
    }

    @GetMapping("/my-exercises")
    @PreAuthorize("hasAnyAuthority('Lecturer','ROLE_Lecturer')")
    public ResponseEntity<ApiResponse<PageResponse<ListeningExerciseResponse>>> searchMine(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) JlptLevel jlptLevel,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PageableDefault(size = 10, sort = "updatedAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                service.searchMine(keyword, jlptLevel, currentUser, pageable)
        ));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('Lecturer','ROLE_Lecturer','Manager','ROLE_Manager')")
    public ResponseEntity<ApiResponse<ListeningExerciseResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.getById(id)));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('Lecturer','ROLE_Lecturer')")
    public ResponseEntity<ApiResponse<ListeningExerciseResponse>> create(
            @Valid @RequestPart("data") ListeningExerciseCreateRequest request,
            @RequestPart("audio") MultipartFile audio,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                "Tạo bài nghe thành công",
                service.create(request, audio, currentUser)
        ));
    }

    @PatchMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('Lecturer','ROLE_Lecturer','Manager','ROLE_Manager')")
    public ResponseEntity<ApiResponse<ListeningExerciseResponse>> update(
            @PathVariable Long id,
            @Valid @RequestPart("data") ListeningExerciseUpdateRequest request,
            @RequestPart(value = "audio", required = false) MultipartFile replacementAudio,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Cập nhật bài nghe thành công",
                service.update(id, request, replacementAudio, currentUser)
        ));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('Lecturer','ROLE_Lecturer','Manager','ROLE_Manager')")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        service.delete(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Xóa bài nghe thành công", null));
    }
}
