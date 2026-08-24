package com.example.base.controller.flashcard_deck;

import com.example.base.dto.flashcard_deck.FlashcardDeckItemCreateRequest;
import com.example.base.dto.flashcard_deck.FlashcardDeckItemResponse;
import com.example.base.security.UserPrincipal;
import com.example.base.service.flashcard_deck.FlashcardDeckItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/system-flashcards/items")
@RequiredArgsConstructor
public class FlashcardDeckItemController {

    private final FlashcardDeckItemService itemService;

    @GetMapping("/{deckId}")
    public ResponseEntity<List<FlashcardDeckItemResponse>> getItems(@PathVariable Long deckId) {
        return ResponseEntity.ok(itemService.getItemsByDeckId(deckId));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('Manager', 'ROLE_Manager', 'ROLE_MANAGER', 'manager', 'Lecturer', 'ROLE_Lecturer', 'ROLE_LECTURER', 'lecturer')")
    public ResponseEntity<FlashcardDeckItemResponse> addItem(
            @Valid @RequestBody FlashcardDeckItemCreateRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        FlashcardDeckItemResponse response = itemService.addItemToDeck(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping
    @PreAuthorize("hasAnyAuthority('Manager', 'ROLE_Manager', 'ROLE_MANAGER', 'manager', 'Lecturer', 'ROLE_Lecturer', 'ROLE_LECTURER', 'lecturer')")
    public ResponseEntity<Void> removeItem(
            @RequestParam Long deckId,
            @RequestParam String itemType,
            @RequestParam Long itemId) {

        itemService.removeItemFromDeck(deckId, itemType, itemId);
        return ResponseEntity.noContent().build(); // Trả về 204 No Content
    }
    @PutMapping("/items")
    @PreAuthorize("hasAnyAuthority('Manager', 'ROLE_Manager', 'ROLE_MANAGER', 'manager', 'Lecturer', 'ROLE_Lecturer', 'ROLE_LECTURER', 'lecturer')")
    public ResponseEntity<FlashcardDeckItemResponse> updateItem(@Valid @RequestBody FlashcardDeckItemCreateRequest request) {
        FlashcardDeckItemResponse response = itemService.updateItemInDeck(request);
        return ResponseEntity.ok(response);
    }
}