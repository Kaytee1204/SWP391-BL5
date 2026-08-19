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
@RequestMapping("/personal/kanji-decks")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('Student', 'ROLE_Student', 'Lecturer', 'ROLE_Lecturer', 'Manager', 'ROLE_Manager')")
public class PersonalKanjiDeckController {
    private final PersonalDeckService deckService;

    @GetMapping
    public ApiResponse<List<PersonalKanjiDeckDto>> getAll(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.success(deckService.getKanjiDecks(principal.getAccountId()));
    }

    @GetMapping("/{id}")
    public ApiResponse<PersonalKanjiDeckDto> getOne(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.success(deckService.getKanjiDeck(id, principal.getAccountId()));
    }

    @PostMapping
    public ApiResponse<PersonalKanjiDeckDto> create(@Valid @RequestBody CreateDeckRequest request,
                                                    @AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.success("Kanji deck created successfully", deckService.createKanjiDeck(request, principal.getAccountId()));
    }

    @PutMapping("/{id}")
    public ApiResponse<PersonalKanjiDeckDto> update(@PathVariable Long id, @Valid @RequestBody CreateDeckRequest request,
                                                    @AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.success("Kanji deck updated successfully", deckService.updateKanjiDeck(id, request, principal.getAccountId()));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        deckService.deleteKanjiDeck(id, principal.getAccountId());
        return ApiResponse.success("Kanji deck deleted successfully", null);
    }

    @PostMapping("/{id}/items")
    public ApiResponse<Void> addItem(@PathVariable Long id, @Valid @RequestBody AddKanjiToDeckRequest request,
                                     @AuthenticationPrincipal UserPrincipal principal) {
        deckService.addKanji(id, request, principal.getAccountId());
        return ApiResponse.success("Kanji added to deck successfully", null);
    }

    @PutMapping("/{id}/items/{kanjiId}")
    public ApiResponse<Void> updateNote(@PathVariable Long id, @PathVariable Long kanjiId,
                                        @Valid @RequestBody UpdateKanjiNoteRequest request,
                                        @AuthenticationPrincipal UserPrincipal principal) {
        deckService.updateKanjiNote(id, kanjiId, request, principal.getAccountId());
        return ApiResponse.success("Memorization note updated successfully", null);
    }

    @DeleteMapping("/{id}/items/{kanjiId}")
    public ApiResponse<Void> removeItem(@PathVariable Long id, @PathVariable Long kanjiId,
                                        @AuthenticationPrincipal UserPrincipal principal) {
        deckService.removeKanji(id, kanjiId, principal.getAccountId());
        return ApiResponse.success("Kanji removed from deck successfully", null);
    }
}
