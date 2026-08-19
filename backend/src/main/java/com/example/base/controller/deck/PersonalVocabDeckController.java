package com.example.base.controller.deck;

import com.example.base.dto.deck.DeckDtos.*;
import com.example.base.dto.common.ApiResponse;
import com.example.base.security.UserPrincipal;
import com.example.base.service.deck.PersonalDeckService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/personal/vocab-decks")
@RequiredArgsConstructor
@PreAuthorize("hasRole('Student')")
public class PersonalVocabDeckController {
    private final PersonalDeckService deckService;

    @GetMapping
    public ApiResponse<List<PersonalVocabDeckDto>> getAll(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.success(deckService.getVocabDecks(principal.getAccountId()));
    }

    @GetMapping("/{id}")
    public ApiResponse<PersonalVocabDeckDto> getOne(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.success(deckService.getVocabDeck(id, principal.getAccountId()));
    }

    @PostMapping
    public ApiResponse<PersonalVocabDeckDto> create(@Valid @RequestBody CreateDeckRequest request,
                                                    @AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.success("Vocabulary deck created successfully", deckService.createVocabDeck(request, principal.getAccountId()));
    }

    @PutMapping("/{id}")
    public ApiResponse<PersonalVocabDeckDto> update(@PathVariable Long id, @Valid @RequestBody CreateDeckRequest request,
                                                    @AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.success("Vocabulary deck updated successfully", deckService.updateVocabDeck(id, request, principal.getAccountId()));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        deckService.deleteVocabDeck(id, principal.getAccountId());
        return ApiResponse.success("Vocabulary deck deleted successfully", null);
    }

    @PostMapping("/{id}/items")
    public ApiResponse<Void> addItem(@PathVariable Long id, @Valid @RequestBody AddVocabToDeckRequest request,
                                     @AuthenticationPrincipal UserPrincipal principal) {
        deckService.addVocabItem(id, request, principal.getAccountId());
        return ApiResponse.success("Vocabulary item added to deck successfully", null);
    }

    @DeleteMapping("/{id}/items/{itemId}")
    public ApiResponse<Void> removeItem(@PathVariable Long id, @PathVariable Long itemId,
                                        @AuthenticationPrincipal UserPrincipal principal) {
        deckService.removeVocabItem(id, itemId, principal.getAccountId());
        return ApiResponse.success("Vocabulary item removed from deck successfully", null);
    }
}
