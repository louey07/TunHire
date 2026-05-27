"use client";

import { useResumeDownload } from "@/lib/hooks/useResumeDownload";

type PdfViewerProps = {
  previewUrl: string;
  candidateUserId: number;
  fileName?: string | null;
};

export default function PdfViewer({
  previewUrl,
  candidateUserId,
  fileName,
}: PdfViewerProps) {
  const { download, downloading } = useResumeDownload(
    candidateUserId,
    fileName,
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center justify-end gap-2 rounded-2xl bg-[var(--surface-container-low)] p-2">
        <button
          type="button"
          onClick={() => void download()}
          disabled={downloading}
          className="btn-secondary rounded-xl px-4 py-2 text-xs disabled:opacity-60"
        >
          {downloading ? "Téléchargement…" : "Télécharger le CV"}
        </button>
      </div>

      <div className="mt-4 min-h-[calc(100vh-18rem)] flex-1 overflow-hidden rounded-3xl bg-[var(--surface-container-low)] p-2">
        <iframe
          src={previewUrl}
          title="Aperçu du CV"
          className="h-[calc(100vh-20rem)] min-h-[480px] w-full rounded-2xl border-0 bg-white editorial-shadow"
        />
      </div>
    </div>
  );
}
