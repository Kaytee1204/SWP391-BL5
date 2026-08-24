package com.example.base.service.flashcard_deck.impl;

import com.example.base.dto.flashcard_deck.FlashcardDeckItemCreateRequest;
import com.example.base.dto.flashcard_deck.FlashcardDeckItemResponse;
import com.example.base.entity.FlashcardDeck;
import com.example.base.entity.FlashcardDeckItem;
import com.example.base.entity.FlashcardDeckItemId;
import com.example.base.repository.FlashcardDeckItemRepository;
import com.example.base.repository.FlashcardDeckRepository;
import com.example.base.service.flashcard_deck.FlashcardDeckItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FlashcardDeckItemServiceImpl implements FlashcardDeckItemService {

    private final FlashcardDeckItemRepository itemRepository;
    private final FlashcardDeckRepository deckRepository;

    @Override
    public List<FlashcardDeckItemResponse> getItemsByDeckId(Long deckId) {
        List<FlashcardDeckItem> items = itemRepository.findById_DeckId(deckId);

        return items.stream().map(item -> FlashcardDeckItemResponse.builder()
                .deckId(item.getId().getDeckId())
                .itemType(item.getId().getItemType())
                .itemId(item.getId().getItemId())
                .word(item.getWord())
                .meaning(item.getMeaning())
                .reading(item.getReading())
                .build()).collect(Collectors.toList());
    }

    @Override
    public FlashcardDeckItemResponse addItemToDeck(FlashcardDeckItemCreateRequest request) {
        FlashcardDeck deck = deckRepository.findById(request.getDeckId())
                .orElseThrow(() -> new IllegalArgumentException("Flashcard deck not found."));

        Long generatedItemId = request.getItemId() != null ? request.getItemId() : System.currentTimeMillis();

        FlashcardDeckItemId id = new FlashcardDeckItemId(
                request.getDeckId(),
                request.getItemType(),
                generatedItemId
        );

        FlashcardDeckItem item = new FlashcardDeckItem();
        item.setId(id);
        item.setFlashcardDeck(deck);
        item.setWord(request.getWord());
        item.setMeaning(request.getMeaning());
        item.setReading(request.getReading());

        itemRepository.save(item);

        return FlashcardDeckItemResponse.builder()
                .deckId(id.getDeckId())
                .itemType(id.getItemType())
                .itemId(id.getItemId())
                .word(item.getWord())
                .meaning(item.getMeaning())
                .reading(item.getReading())
                .build();
    }

    @Override
    public FlashcardDeckItemResponse updateItemInDeck(FlashcardDeckItemCreateRequest request) {
        FlashcardDeckItemId id = new FlashcardDeckItemId(
                request.getDeckId(),
                request.getItemType(),
                request.getItemId()
        );

        FlashcardDeckItem item = itemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item not found in the deck."));

        // Cập nhật các thông tin mới
        item.setWord(request.getWord());
        item.setMeaning(request.getMeaning());
        item.setReading(request.getReading());

        itemRepository.save(item);

        return FlashcardDeckItemResponse.builder()
                .deckId(id.getDeckId())
                .itemType(id.getItemType())
                .itemId(id.getItemId())
                .word(item.getWord())
                .meaning(item.getMeaning())
                .reading(item.getReading())
                .build();
    }
    @Override
    public void removeItemFromDeck(Long deckId, String itemType, Long itemId) {
        FlashcardDeckItemId id = new FlashcardDeckItemId(deckId, itemType, itemId);

        if (!itemRepository.existsById(id)) {
            throw new IllegalArgumentException("Item not found in the deck.");
        }

        itemRepository.deleteById(id); // Xóa chính xác theo khóa phức hợp
    }
}