package com.example.base.service.listening_exercise;

import com.example.base.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
public class ListeningAudioStorageService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("mp3", "wav", "m4a", "ogg", "aac");
    private static final long MAX_AUDIO_BYTES = 25L * 1024 * 1024;

    private final Path storageRoot;

    public ListeningAudioStorageService(
            @Value("${app.storage.listening-dir:uploads/listening}") String storageDirectory
    ) {
        this.storageRoot = Path.of(storageDirectory).toAbsolutePath().normalize();
    }

    public StoredAudio store(MultipartFile audio) {
        validate(audio);
        String originalName = normalizeOriginalName(audio.getOriginalFilename());
        String extension = extensionOf(originalName);
        String storageName = UUID.randomUUID() + "." + extension;
        Path target = storageRoot.resolve(storageName).normalize();

        if (!target.getParent().equals(storageRoot)) {
            throw new BadRequestException("Tên file audio không hợp lệ");
        }

        try {
            Files.createDirectories(storageRoot);
            Files.copy(audio.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException exception) {
            throw new BadRequestException("Không thể lưu file audio");
        }

        return new StoredAudio(
                "/media/listening/" + storageName,
                storageName,
                originalName
        );
    }

    public void deleteQuietly(String storageName) {
        if (storageName == null || storageName.isBlank()) return;
        Path target = storageRoot.resolve(storageName).normalize();
        if (!target.getParent().equals(storageRoot) || !target.getFileName().toString().equals(storageName)) {
            log.warn("Skipped invalid listening audio storage name: {}", storageName);
            return;
        }
        try {
            Files.deleteIfExists(target);
        } catch (IOException exception) {
            log.warn("Could not delete listening audio file {}", target, exception);
        }
    }

    public Path getStorageRoot() {
        return storageRoot;
    }

    private void validate(MultipartFile audio) {
        if (audio == null || audio.isEmpty()) {
            throw new BadRequestException("Vui lòng chọn file audio");
        }
        if (audio.getSize() > MAX_AUDIO_BYTES) {
            throw new BadRequestException("File audio không được vượt quá 25MB");
        }

        String originalName = normalizeOriginalName(audio.getOriginalFilename());
        String extension = extensionOf(originalName);
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BadRequestException("Chỉ hỗ trợ file MP3, WAV, M4A, OGG hoặc AAC");
        }

        String contentType = audio.getContentType();
        if (contentType != null
                && !contentType.toLowerCase(Locale.ROOT).startsWith("audio/")
                && !contentType.equalsIgnoreCase("video/mp4")
                && !contentType.equalsIgnoreCase("application/octet-stream")) {
            throw new BadRequestException("Định dạng file tải lên không phải audio");
        }
    }

    private String normalizeOriginalName(String value) {
        String name = value == null ? "audio" : Path.of(value).getFileName().toString().trim();
        if (name.isBlank()) name = "audio";
        return name.length() > 255 ? name.substring(name.length() - 255) : name;
    }

    private String extensionOf(String fileName) {
        int dot = fileName.lastIndexOf('.');
        return dot < 0 ? "" : fileName.substring(dot + 1).toLowerCase(Locale.ROOT);
    }

    public record StoredAudio(String url, String storageName, String originalName) {
    }
}
