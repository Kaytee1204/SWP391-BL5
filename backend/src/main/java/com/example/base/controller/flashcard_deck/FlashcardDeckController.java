package com.example.base.controller.flashcard_deck;

import com.example.base.dto.flashcard_deck.FlashcardDeckCreateRequest;
import com.example.base.dto.flashcard_deck.FlashcardDeckResponse;
import com.example.base.dto.flashcard_deck.FlashcardDeckUpdateRequest;
import com.example.base.security.UserPrincipal;
import com.example.base.service.flashcard_deck.FlashcardDeckService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/system-flashcards")
@RequiredArgsConstructor
public class FlashcardDeckController {

    private final FlashcardDeckService service;

    @GetMapping
    public ResponseEntity<Page<FlashcardDeckResponse>> getAllDecks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction) {

        Sort.Direction sortDirection = Sort.Direction.fromOptionalString(direction).orElse(Sort.Direction.DESC);
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));

        Page<FlashcardDeckResponse> response = service.getAllDecks(pageable);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('Manager', 'ROLE_Manager', 'ROLE_MANAGER', 'manager', 'Lecturer', 'ROLE_Lecturer', 'ROLE_LECTURER', 'lecturer')")
    public ResponseEntity<FlashcardDeckResponse> createDeck(
            @Valid @RequestBody FlashcardDeckCreateRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        Long currentUserId = (currentUser != null && currentUser.getAccountId() != null) 
                ? currentUser.getAccountId() 
                : 1L;

        FlashcardDeckResponse response = service.createDeck(request, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{deckId}")
    @PreAuthorize("hasAnyAuthority('Manager', 'ROLE_Manager', 'ROLE_MANAGER', 'manager', 'Lecturer', 'ROLE_Lecturer', 'ROLE_LECTURER', 'lecturer')")
    public ResponseEntity<FlashcardDeckResponse> updateDeck(
            @PathVariable Long deckId,
            @Valid @RequestBody FlashcardDeckUpdateRequest request) {

        FlashcardDeckResponse response = service.updateDeck(deckId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{deckId}")
    @PreAuthorize("hasAnyAuthority('Manager', 'ROLE_Manager', 'ROLE_MANAGER', 'manager', 'Lecturer', 'ROLE_Lecturer', 'ROLE_LECTURER', 'lecturer')")
    public ResponseEntity<Void> deleteDeck(@PathVariable Long deckId) {
        service.deleteDeck(deckId);
        return ResponseEntity.noContent().build();
    }
}