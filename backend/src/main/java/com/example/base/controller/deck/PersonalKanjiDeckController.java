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
        // Lay tat ca personal kanji deck cua user dang login; service chi cho account role Student so huu deck.
        return ApiResponse.success(deckService.getKanjiDecks(principal.getAccountId()));
    }

    @GetMapping("/{id}")
    public ApiResponse<PersonalKanjiDeckDto> getOne(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        // Lay mot personal kanji deck theo id va owner; service nap kem danh sach kanji item trong deck.
        return ApiResponse.success(deckService.getKanjiDeck(id, principal.getAccountId()));
    }

    @PostMapping
    public ApiResponse<PersonalKanjiDeckDto> create(@Valid @RequestBody CreateDeckRequest request,
                                                    @AuthenticationPrincipal UserPrincipal principal) {
        // Tao personal kanji deck moi cho user dang login; title/description duoc validate roi service save deck.
        return ApiResponse.success("Kanji deck created successfully", deckService.createKanjiDeck(request, principal.getAccountId()));
    }

    @PutMapping("/{id}")
    public ApiResponse<PersonalKanjiDeckDto> update(@PathVariable Long id, @Valid @RequestBody CreateDeckRequest request,
                                                    @AuthenticationPrincipal UserPrincipal principal) {
        // Cap nhat title va description cua deck; service dam bao deck thuoc dung student dang login.
        return ApiResponse.success("Kanji deck updated successfully", deckService.updateKanjiDeck(id, request, principal.getAccountId()));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        // Xoa personal kanji deck; service xoa cac item trong deck truoc roi moi xoa deck.
        deckService.deleteKanjiDeck(id, principal.getAccountId());
        return ApiResponse.success("Kanji deck deleted successfully", null);
    }

    @PostMapping("/{id}/items")
    public ApiResponse<Void> addItem(@PathVariable Long id, @Valid @RequestBody AddKanjiToDeckRequest request,
                                      @AuthenticationPrincipal UserPrincipal principal) {
        // Them hoac cap nhat mot kanji trong deck; service tao item neu chua co va luu memorization note.
        deckService.addKanji(id, request, principal.getAccountId());
        return ApiResponse.success("Kanji added to deck successfully", null);
    }

    @PutMapping("/{id}/items/{kanjiId}")
    public ApiResponse<Void> updateNote(@PathVariable Long id, @PathVariable Long kanjiId,
                                         @Valid @RequestBody UpdateKanjiNoteRequest request,
                                         @AuthenticationPrincipal UserPrincipal principal) {
        // Cap nhat ghi chu hoc thuoc cho kanji trong deck; service kiem tra item phai ton tai trong deck.
        deckService.updateKanjiNote(id, kanjiId, request, principal.getAccountId());
        return ApiResponse.success("Memorization note updated successfully", null);
    }

    @DeleteMapping("/{id}/items/{kanjiId}")
    public ApiResponse<Void> removeItem(@PathVariable Long id, @PathVariable Long kanjiId,
                                         @AuthenticationPrincipal UserPrincipal principal) {
        // Xoa mot kanji khoi deck; service dam bao deck dung owner va item dang nam trong deck.
        deckService.removeKanji(id, kanjiId, principal.getAccountId());
        return ApiResponse.success("Kanji removed from deck successfully", null);
    }
}
