import { BASE_URL } from "@/lib/api";

export function isNumericId(value: string | undefined): value is string {
  return typeof value === "string" && /^\d+$/.test(value);
}

export function resumeDisplayName(
  fileName: string | null | undefined,
  fallback = "cv.pdf",
): string {
  if (fileName?.trim()) return fileName.trim();
  return fallback;
}

function parseFileName(contentDisposition: string | null): string | null {
  if (!contentDisposition) return null;
  const match = contentDisposition.match(/filename="?([^";\n]+)"?/i);
  return match?.[1]?.trim() ?? null;
}

export async function fetchResumeBlob(
  endpoint: string,
): Promise<{ blob: Blob; fileName: string | null; contentType: string | null }> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("tunhire_token")
      : null;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    throw new Error(`Download failed (${res.status})`);
  }

  const blob = await res.blob();
  return {
    blob,
    fileName: parseFileName(res.headers.get("Content-Disposition")),
    contentType: res.headers.get("Content-Type"),
  };
}

export function triggerBlobDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function downloadResume(
  endpoint: string,
  fallbackFileName: string,
): Promise<void> {
  const { blob, fileName } = await fetchResumeBlob(endpoint);
  triggerBlobDownload(blob, fileName || fallbackFileName);
}

export function resumeEndpointForUser(userId: number | "me"): string {
  return userId === "me"
    ? "/candidates/me/resume"
    : `/candidates/${userId}/resume`;
}

export function isPdfResume(
  contentType?: string | null,
  fileName?: string | null,
): boolean {
  if (contentType?.toLowerCase().includes("pdf")) return true;
  const name = fileName?.toLowerCase() ?? "";
  return name.endsWith(".pdf");
}

export function isDocxResume(
  contentType?: string | null,
  fileName?: string | null,
): boolean {
  if (contentType?.toLowerCase().includes("wordprocessingml")) return true;
  const name = fileName?.toLowerCase() ?? "";
  return name.endsWith(".docx");
}
