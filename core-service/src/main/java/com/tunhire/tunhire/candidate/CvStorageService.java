package com.tunhire.tunhire.candidate;

import java.nio.file.Path;
import org.springframework.web.multipart.MultipartFile;

public interface CvStorageService {

    record StoredCv(String storageKey, String fileName, String contentType) {}

    StoredCv store(Long userId, MultipartFile file, String previousStorageKey);

    Path resolvePath(String storageKey);

    void delete(String storageKey);
}
