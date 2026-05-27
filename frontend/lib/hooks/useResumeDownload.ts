"use client";

import { useCallback, useState } from "react";
import {
  downloadResume,
  resumeDisplayName,
  resumeEndpointForUser,
} from "@/lib/resume";

export function useResumeDownload(
  userId: number | "me" | null | undefined,
  fileName?: string | null,
) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const download = useCallback(async () => {
    if (userId == null) return;
    setDownloading(true);
    setError("");
    try {
      await downloadResume(
        resumeEndpointForUser(userId),
        resumeDisplayName(fileName),
      );
    } catch {
      setError("Impossible de télécharger le CV.");
    } finally {
      setDownloading(false);
    }
  }, [userId, fileName]);

  return { download, downloading, error };
}
