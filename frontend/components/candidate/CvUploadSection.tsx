"use client";

import { useRef } from "react";
import type { CandidateProfile } from "@/lib/types";
import { useResumeDownload } from "@/lib/hooks/useResumeDownload";
import { resumeDisplayName } from "@/lib/resume";

type CvUploadSectionProps = {
  profile: CandidateProfile | null;
  cvLoaded: boolean;
  cvFileName: string;
  cvParsing: boolean;
  cvMsg: string;
  onUpload: (file: File) => void;
};

export default function CvUploadSection({
  profile,
  cvLoaded,
  cvFileName,
  cvParsing,
  cvMsg,
  onUpload,
}: CvUploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { download, downloading, error: downloadError } = useResumeDownload(
    profile?.hasResume ? "me" : null,
    profile?.resumeFileName ?? cvFileName,
  );

  return (
    <section className="surface-section p-6 editorial-shadow">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-headline text-xl font-bold text-[var(--primary)]">
            Mon CV
          </h3>
          <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
            Importez un PDF pour remplir votre profil automatiquement.
          </p>
        </div>
        <div className="flex gap-2">
          {profile?.hasResume ? (
            <button
              type="button"
              onClick={() => void download()}
              disabled={downloading}
              className="btn-secondary rounded-2xl px-4 py-2 text-sm disabled:opacity-60"
            >
              {downloading ? "Téléchargement…" : "Télécharger"}
            </button>
          ) : null}
          <button
            type="button"
            className="btn-primary rounded-2xl px-4 py-2 text-sm disabled:opacity-60"
            onClick={() => fileInputRef.current?.click()}
            disabled={cvParsing}
          >
            {cvParsing ? "Import…" : cvLoaded ? "Remplacer" : "Importer CV"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {cvLoaded ? (
        <div className="mt-6 rounded-2xl bg-[var(--surface-container-low)] p-4">
          <p className="font-semibold text-[var(--primary)]">
            {cvFileName ||
              resumeDisplayName(profile?.resumeFileName) ||
              "CV.pdf"}
          </p>
          <p className="mt-1 text-sm text-[var(--secondary)]">CV importé</p>
          <p className="mt-2 text-xs text-[var(--on-surface-variant)]">
            Données extraites du CV — vérifiez et modifiez si nécessaire.
          </p>
        </div>
      ) : (
        <p className="mt-6 text-sm text-[var(--on-surface-variant)]">
          Aucun CV importé pour le moment.
        </p>
      )}
      {cvMsg ? (
        <p className="mt-4 text-sm text-[var(--on-surface-variant)]">{cvMsg}</p>
      ) : null}
      {downloadError ? (
        <p className="mt-2 text-sm text-[#93000a]">{downloadError}</p>
      ) : null}
    </section>
  );
}
