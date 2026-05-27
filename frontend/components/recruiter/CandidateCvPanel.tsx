"use client";

import dynamic from "next/dynamic";
import { resumeDisplayName, isDocxResume, isPdfResume } from "@/lib/resume";
import { useResumeDownload } from "@/lib/hooks/useResumeDownload";
import { useResumePreview } from "@/lib/hooks/useResumePreview";

const PdfViewer = dynamic(() => import("@/components/recruiter/PdfViewer"), {
  ssr: false,
  loading: () => (
    <div className="mt-4 min-h-[calc(100vh-18rem)] animate-pulse rounded-3xl bg-[var(--surface-container-low)]" />
  ),
});

type CandidateCvPanelProps = {
  candidateUserId: number;
  fileName?: string | null;
  hasResume?: boolean;
  contentType?: string | null;
};

function DocxFallback({
  displayName,
  downloading,
  error,
  onDownload,
}: {
  displayName: string;
  downloading: boolean;
  error: string;
  onDownload: () => void;
}) {
  return (
    <div className="mt-6 flex flex-1 flex-col items-center justify-center rounded-3xl bg-[var(--surface-container-low)] p-10 text-center">
      <div
        className="flex h-20 w-20 items-center justify-center rounded-3xl text-2xl font-bold text-[var(--primary)]"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--secondary) 12%, transparent), color-mix(in srgb, var(--tertiary-fixed) 18%, transparent))",
        }}
      >
        DOC
      </div>
      <p className="mt-6 font-headline text-lg font-bold text-[var(--primary)]">
        {displayName}
      </p>
      <p className="mt-2 max-w-md text-sm leading-6 text-[var(--on-surface-variant)]">
        Ce CV est au format Word. Téléchargez-le pour l&apos;ouvrir dans votre
        application.
      </p>
      <button
        type="button"
        onClick={onDownload}
        disabled={downloading}
        className="btn-secondary mt-8 rounded-2xl px-6 py-3 text-sm disabled:opacity-60"
      >
        {downloading ? "Téléchargement…" : "Télécharger maintenant"}
      </button>
      {error ? <p className="mt-4 text-sm text-[#93000a]">{error}</p> : null}
    </div>
  );
}

export default function CandidateCvPanel({
  candidateUserId,
  fileName,
  hasResume = false,
  contentType,
}: CandidateCvPanelProps) {
  const displayName = resumeDisplayName(fileName);
  const isPdf = hasResume && isPdfResume(contentType, fileName);
  const isDocx = hasResume && isDocxResume(contentType, fileName);

  const { download, downloading, error: downloadError } = useResumeDownload(
    hasResume ? candidateUserId : null,
    fileName,
  );
  const {
    previewUrl,
    loading: previewLoading,
    error: previewError,
  } = useResumePreview(candidateUserId, isPdf);

  return (
    <section className="surface-section flex min-h-[calc(100vh-14rem)] flex-col p-6 editorial-shadow xl:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-headline text-xl font-bold text-[var(--primary)]">
            Curriculum Vitae
          </h2>
          <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
            {isPdf
              ? "Consultez le CV du candidat directement dans l'application."
              : "Téléchargez le CV du candidat pour l'examiner."}
          </p>
        </div>
        {hasResume && !isPdf ? (
          <button
            type="button"
            onClick={() => void download()}
            disabled={downloading}
            className="btn-primary rounded-2xl px-5 py-2.5 text-sm disabled:opacity-60"
          >
            {downloading ? "Téléchargement…" : "Télécharger le CV"}
          </button>
        ) : null}
      </div>

      {!hasResume ? (
        <div className="mt-6 flex flex-1 flex-col items-center justify-center rounded-3xl bg-[var(--surface-container-low)] p-10 text-center">
          <p className="font-headline text-lg font-bold text-[var(--primary)]">
            CV non disponible
          </p>
          <p className="mt-2 max-w-md text-sm leading-6 text-[var(--on-surface-variant)]">
            Aucun fichier n&apos;a été enregistré pour ce candidat. Demandez-lui
            de réimporter son CV depuis son profil.
          </p>
        </div>
      ) : isDocx ? (
        <DocxFallback
          displayName={displayName}
          downloading={downloading}
          error={downloadError}
          onDownload={() => void download()}
        />
      ) : isPdf ? (
        <div className="mt-4 flex min-h-0 flex-1 flex-col">
          {previewLoading ? (
            <div className="min-h-[calc(100vh-18rem)] animate-pulse rounded-3xl bg-[var(--surface-container-low)]" />
          ) : previewError ? (
            <div className="mt-4 flex flex-1 flex-col items-center justify-center rounded-3xl bg-[var(--surface-container-low)] p-10 text-center">
              <p className="text-sm text-[#93000a]">{previewError}</p>
              <button
                type="button"
                onClick={() => void download()}
                disabled={downloading}
                className="btn-secondary mt-4 rounded-2xl px-5 py-2 text-sm disabled:opacity-60"
              >
                Télécharger le CV
              </button>
            </div>
          ) : previewUrl ? (
            <PdfViewer
              previewUrl={previewUrl}
              candidateUserId={candidateUserId}
              fileName={fileName}
            />
          ) : null}
        </div>
      ) : (
        <DocxFallback
          displayName={displayName}
          downloading={downloading}
          error={downloadError}
          onDownload={() => void download()}
        />
      )}
    </section>
  );
}
