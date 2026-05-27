"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { apiPost } from "@/lib/api";
import { getToken, requireRole } from "@/lib/auth";
import { RecruiterCompanyProvider, useRecruiterCompany } from "@/lib/context/RecruiterCompanyContext";
import type { MembershipResponse } from "@/lib/types";

function AcceptInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh, selectCompany } = useRecruiterCompany();
  const token = searchParams.get("token") || "";
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    requireRole("RECRUITER", router);
  }, [router]);

  async function acceptInvite() {
    if (!token) {
      setMessage("Lien d'invitation invalide.");
      return;
    }
    if (!getToken()) {
      router.push(
        `/login?redirect=/invites/accept?token=${encodeURIComponent(token)}`,
      );
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await apiPost<MembershipResponse>(
        "/companies/invites/accept",
        { token },
      );
      if (res.success && res.data) {
        await refresh();
        selectCompany(res.data.companyId);
        setMessage("Invitation acceptée. Redirection…");
        setTimeout(() => router.push("/dashboard/recruiter"), 1500);
      } else {
        setMessage(res.message || "Lien invalide ou expiré.");
      }
    } catch {
      setMessage("Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--surface)] px-6">
      <div className="surface-section w-full max-w-lg p-8 editorial-shadow">
        <p className="label-uppercase text-[10px] font-bold text-[var(--secondary)]">
          Invitation équipe
        </p>
        <h1 className="mt-3 font-headline text-3xl font-extrabold text-[var(--primary)]">
          Rejoindre une entreprise
        </h1>
        <button
          type="button"
          onClick={() => void acceptInvite()}
          disabled={loading || !token}
          className="btn-primary mt-8 w-full rounded-2xl px-6 py-3 text-sm disabled:opacity-50"
        >
          {loading ? "Traitement…" : "Accepter l'invitation"}
        </button>
        {message ? (
          <p className="mt-4 text-sm text-[var(--on-surface-variant)]">
            {message}
          </p>
        ) : null}
        <Link
          href="/dashboard/recruiter"
          className="mt-6 inline-block text-sm font-semibold text-[var(--secondary)]"
        >
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <RecruiterCompanyProvider>
      <Suspense>
        <AcceptInviteContent />
      </Suspense>
    </RecruiterCompanyProvider>
  );
}
