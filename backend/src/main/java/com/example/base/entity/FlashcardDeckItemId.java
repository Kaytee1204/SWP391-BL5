package com.example.base.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class FlashcardDeckItemId implements Serializable {

    @Column(name = "deck_id")
    private Long deckId;

    @Column(name = "item_type", length = 20)
    private String itemType;

    @Column(name = "item_id")
    private Long itemId;
}