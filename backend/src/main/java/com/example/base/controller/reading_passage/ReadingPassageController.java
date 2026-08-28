package com.example.base.controller.reading_passage;


import com.example.base.dto.common.ApiResponse;
import com.example.base.dto.common.PageResponse;
import com.example.base.dto.reading_passage.request.ReadingPassageCreateRequest;
import com.example.base.dto.reading_passage.request.ReadingPassageUpdateRequest;
import com.example.base.dto.reading_passage.response.ReadingPassageResponse;
import com.example.base.entity.JlptLevel;
import com.example.base.security.UserPrincipal;
import com.example.base.service.reading_passage.ReadingPassageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reading-passages")
@RequiredArgsConstructor
@Tag(
        name = "Reading Passages",
        description = "Manage Japanese reading passages with Furigana"
)
public class ReadingPassageController {

    private final ReadingPassageService readingPassageService;

    @GetMapping
    @PreAuthorize("""
        hasAnyAuthority(
            'Lecturer',
            'ROLE_Lecturer',
            'ROLE_LECTURER',
            'Manager',
            'ROLE_Manager',
            'ROLE_MANAGER'
        )
        """)
    @Operation(summary = "View reading passages")
    public ResponseEntity<
                ApiResponse<PageResponse<ReadingPassageResponse>>
                > getPassages(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) JlptLevel jlptLevel,
            @PageableDefault(
                    page = 0,
                    size = 10,
                    sort = "passageId",
                    direction = Sort.Direction.ASC
            )
            Pageable pageable
    ) {
        PageResponse<ReadingPassageResponse> response =
                readingPassageService.searchPassages(
                        keyword,
                        jlptLevel,
                        pageable
                );

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/my-passages")
    @PreAuthorize("""
        hasAnyAuthority(
            'Lecturer',
            'ROLE_Lecturer',
            'ROLE_LECTURER',
            'lecturer',
            'Manager',
            'ROLE_Manager',
            'ROLE_MANAGER',
            'manager'
        )
        """)
    @Operation(summary = "View passages created by current Lecturer or Manager")
    public ResponseEntity<
            ApiResponse<PageResponse<ReadingPassageResponse>>
            > getMyPassages(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) JlptLevel jlptLevel,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PageableDefault(
                    page = 0,
                    size = 10,
                    sort = "updatedAt",
                    direction = Sort.Direction.DESC
            )
            Pageable pageable
    ) {
        PageResponse<ReadingPassageResponse> response =
                readingPassageService.searchMyPassages(
                        keyword,
                        jlptLevel,
                        currentUser,
                        pageable
                );

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("""
        hasAnyAuthority(
            'Lecturer',
            'ROLE_Lecturer',
            'ROLE_LECTURER',
            'lecturer',
            'Manager',
            'ROLE_Manager',
            'ROLE_MANAGER',
            'manager'
        )
        """)
    @Operation(summary = "View reading passage detail")
    public ResponseEntity<
            ApiResponse<ReadingPassageResponse>
            > getPassageById(@PathVariable Long id) {
        ReadingPassageResponse response =
                readingPassageService.getPassageById(id);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @PreAuthorize("""
        hasAnyAuthority(
            'Lecturer',
            'ROLE_Lecturer',
            'ROLE_LECTURER',
            'lecturer',
            'Manager',
            'ROLE_Manager',
            'ROLE_MANAGER',
            'manager'
        )
        """)
    @Operation(summary = "Create a reading passage")
    public ResponseEntity<
            ApiResponse<ReadingPassageResponse>
            > createPassage(
            @Valid @RequestBody ReadingPassageCreateRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        ReadingPassageResponse response =
                readingPassageService.createPassage(
                        request,
                        currentUser
                );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Reading passage created successfully",
                        response
                ));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("""
        hasAnyAuthority(
            'Lecturer',
            'ROLE_Lecturer',
            'ROLE_LECTURER',
            'Manager',
            'ROLE_Manager',
            'ROLE_MANAGER'
        )
        """)
    @Operation(summary = "Update a reading passage")
    public ResponseEntity<
            ApiResponse<ReadingPassageResponse>
            > updatePassage(
            @PathVariable Long id,
            @Valid @RequestBody ReadingPassageUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        ReadingPassageResponse response =
                readingPassageService.updatePassage(
                        id,
                        request,
                        currentUser
                );

        return ResponseEntity.ok(ApiResponse.success(
                "Reading passage updated successfully",
                response
        ));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("""
        hasAnyAuthority(
            'Lecturer',
            'ROLE_Lecturer',
            'ROLE_LECTURER',
            'Manager',
            'ROLE_Manager',
            'ROLE_MANAGER'
        )
        """)
    @Operation(summary = "Delete a reading passage")
    public ResponseEntity<ApiResponse<Void>> deletePassage(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        readingPassageService.deletePassage(id, currentUser);

        return ResponseEntity.ok(ApiResponse.success(
                "Reading passage deleted successfully",
                null
        ));
    }
}
