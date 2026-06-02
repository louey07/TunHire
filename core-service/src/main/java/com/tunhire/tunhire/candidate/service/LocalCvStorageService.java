package com.tunhire.tunhire.candidate.service;

import com.tunhire.tunhire.candidate.CvStorageService;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class LocalCvStorageService implements CvStorageService {

    private static final String PDF_TYPE = "application/pdf";

    private final Path uploadsRoot;
    private final long maxCvSize;

    public LocalCvStorageService(
        @Value("${tunhire.uploads.dir:./uploads}") String uploadsDir,
        @Value("${tunhire.uploads.max-cv-size:10485760}") long maxCvSize
    ) {
        this.uploadsRoot = Path.of(uploadsDir).toAbsolutePath().normalize();
        this.maxCvSize = maxCvSize;
    }

    @Override
    public StoredCv store(Long userId, MultipartFile file, String previousStorageKey) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("CV file is required.");
        }
        if (file.getSize() > maxCvSize) {
            throw new IllegalArgumentException("CV file exceeds maximum allowed size.");
        }

        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.isBlank()) {
            originalName = "cv.pdf";
        }

        String extension = extensionOf(originalName);
        if (!"pdf".equals(extension)) {
            throw new IllegalArgumentException("Only PDF files are allowed.");
        }

        String contentType = PDF_TYPE;
        String storageKey = userId + "/" + UUID.randomUUID() + "." + extension;
        Path target = resolvePath(storageKey);

        try {
            Files.createDirectories(target.getParent());
            file.transferTo(target);
            if (previousStorageKey != null && !previousStorageKey.isBlank()) {
                delete(previousStorageKey);
            }
            return new StoredCv(storageKey, originalName, contentType);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to store CV file.", e);
        }
    }

    @Override
    public Path resolvePath(String storageKey) {
        Path resolved = uploadsRoot.resolve(storageKey).normalize();
        if (!resolved.startsWith(uploadsRoot)) {
            throw new IllegalArgumentException("Invalid storage key.");
        }
        return resolved;
    }

    @Override
    public void delete(String storageKey) {
        if (storageKey == null || storageKey.isBlank()) {
            return;
        }
        try {
            Files.deleteIfExists(resolvePath(storageKey));
        } catch (IOException ignored) {
            // Best-effort cleanup when replacing CV.
        }
    }

    private static String extensionOf(String fileName) {
        int dot = fileName.lastIndexOf('.');
        if (dot < 0 || dot == fileName.length() - 1) {
            return "";
        }
        return fileName.substring(dot + 1).toLowerCase(Locale.ROOT);
    }
}
