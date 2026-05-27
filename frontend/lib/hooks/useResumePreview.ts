"use client";

import { useEffect, useState } from "react";
import {
  fetchResumeBlob,
  resumeDisplayName,
  resumeEndpointForUser,
} from "@/lib/resume";

export function useResumePreview(
  userId: number | null | undefined,
  enabled: boolean,
) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!enabled || userId == null) {
      setPreviewUrl(null);
      setFileName(null);
      setError("");
      setLoading(false);
      return;
    }

    let revoked = false;
    let objectUrl: string | null = null;

    void (async () => {
      setLoading(true);
      setError("");
      setPreviewUrl(null);
      try {
        const result = await fetchResumeBlob(resumeEndpointForUser(userId));
        if (revoked) {
          return;
        }
        const buffer = await result.blob.arrayBuffer();
        const mimeType =
          result.contentType &&
          !result.contentType.includes("octet-stream")
            ? result.contentType
            : "application/pdf";
        objectUrl = URL.createObjectURL(new Blob([buffer], { type: mimeType }));
        setPreviewUrl(objectUrl);
        setFileName(
          result.fileName || resumeDisplayName(null),
        );
      } catch {
        if (!revoked) {
          setError("Impossible de charger le CV pour l'aperçu.");
        }
      } finally {
        if (!revoked) setLoading(false);
      }
    })();

    return () => {
      revoked = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setPreviewUrl((current) => {
        if (current && current !== objectUrl) URL.revokeObjectURL(current);
        return null;
      });
    };
  }, [userId, enabled]);

  return { previewUrl, fileName, loading, error };
}
