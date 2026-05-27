"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRecruiterCompany } from "@/lib/context/RecruiterCompanyContext";
import { requireRole } from "@/lib/auth";

export function useRequireActiveCompany() {
  const router = useRouter();
  const ctx = useRecruiterCompany();

  useEffect(() => {
    requireRole("RECRUITER", router);
  }, [router]);

  useEffect(() => {
    if (!ctx.loading && !ctx.activeCompany) {
      router.replace("/dashboard/recruiter");
    }
  }, [ctx.loading, ctx.activeCompany, router]);

  return ctx;
}

export function RecruiterSetupNotice() {
  return (
    <div className="mx-auto max-w-lg px-6 py-16 text-center">
      <p className="text-sm text-[var(--on-surface-variant)]">
        Sélectionnez ou créez une entreprise pour accéder à cette section.
      </p>
      <Link
        href="/dashboard/recruiter"
        className="btn-primary mt-6 inline-block rounded-full px-5 py-2 text-sm"
      >
        Retour au tableau de bord
      </Link>
    </div>
  );
}
