package com.example.base.service.reading_passage;

import com.example.base.exception.BadRequestException;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.safety.Safelist;
import org.springframework.stereotype.Component;

@Component
public class ReadingPassageHtmlSanitizer {

    private final Safelist safelist = Safelist.basic()
            .addTags(
                    "ruby",
                    "rt",
                    "rp",
                    "h1",
                    "h2",
                    "h3",
                    "blockquote"
            );

    public String sanitize(String html) {
        if (html == null || html.isBlank()) {
            throw new BadRequestException(
                    "Nội dung bài đọc không được để trống"
            );
        }

        Document.OutputSettings outputSettings =
                new Document.OutputSettings().prettyPrint(false);

        String sanitized = Jsoup.clean(
                html,
                "",
                safelist,
                outputSettings
        );

        String visibleText = Jsoup.parse(sanitized).text();

        if (visibleText.isBlank()) {
            throw new BadRequestException(
                    "Nội dung bài đọc không được để trống"
            );
        }

        return sanitized;
    }
}
