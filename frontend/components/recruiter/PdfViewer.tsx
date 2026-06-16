"use client";

type PdfViewerProps = {
  previewUrl: string;
};

export default function PdfViewer({ previewUrl }: PdfViewerProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
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
