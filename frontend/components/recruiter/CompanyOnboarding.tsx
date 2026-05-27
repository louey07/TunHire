"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";
import type { MembershipResponse } from "@/lib/types";

type CompanyOnboardingProps = {
  onCreated: () => Promise<void>;
  onJoined: (membership: MembershipResponse) => Promise<void>;
};

function normalizeInviteToken(value: string) {
  const raw = value.trim();
  if (!raw) return "";
  try {
    const url = new URL(raw);
    const token = url.searchParams.get("token");
    if (token) return token;
  } catch {
    /* ignore */
  }
  const tokenIndex = raw.indexOf("token=");
  if (tokenIndex >= 0) {
    return raw.slice(tokenIndex + 6).split(/[&#]/)[0];
  }
  if (raw.includes("/")) {
    const parts = raw.split("/").filter(Boolean);
    return parts[parts.length - 1] || raw;
  }
  return raw;
}

export default function CompanyOnboarding({
  onCreated,
  onJoined,
}: CompanyOnboardingProps) {
  const [companyName, setCompanyName] = useState("");
  const [companyIndustry, setCompanyIndustry] = useState("");
  const [creatingCompany, setCreatingCompany] = useState(false);
  const [companyMsg, setCompanyMsg] = useState("");
  const [inviteToken, setInviteToken] = useState("");
  const [joiningCompany, setJoiningCompany] = useState(false);
  const [inviteMsg, setInviteMsg] = useState("");

  async function createCompany() {
    if (!companyName.trim()) return;
    setCreatingCompany(true);
    setCompanyMsg("");
    try {
      const res = await apiPost<{ id: number }>("/companies", {
        name: companyName.trim(),
        description: companyIndustry.trim() || null,
      });
      if (res.success) {
        setCompanyName("");
        setCompanyIndustry("");
        setCompanyMsg("Entreprise créée avec succès.");
        await onCreated();
      } else {
        setCompanyMsg(res.message || "Erreur lors de la création.");
      }
    } catch {
      setCompanyMsg("Erreur de connexion.");
    } finally {
      setCreatingCompany(false);
    }
  }

  async function acceptInvite() {
    const token = normalizeInviteToken(inviteToken);
    if (!token) return;
    setJoiningCompany(true);
    setInviteMsg("");
    try {
      const res = await apiPost<MembershipResponse>(
        "/companies/invites/accept",
        { token },
      );
      if (res.success && res.data) {
        setInviteToken("");
        setInviteMsg("Invitation acceptée.");
        await onJoined(res.data);
      } else {
        setInviteMsg(res.message || "Lien invalide ou expiré.");
      }
    } catch {
      setInviteMsg("Erreur de connexion.");
    } finally {
      setJoiningCompany(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="surface-section space-y-4 p-6">
        <div>
          <p className="label-uppercase text-[10px] font-semibold text-[var(--secondary)]">
            Invitation
          </p>
          <h3 className="font-headline text-lg font-bold text-[var(--primary)]">
            Rejoindre une équipe
          </h3>
        </div>
        <input
          type="text"
          value={inviteToken}
          onChange={(e) => setInviteToken(e.target.value)}
          placeholder="Lien ou token d'invitation"
          className="input-soft w-full rounded-2xl px-4 py-3 text-sm"
        />
        <button
          type="button"
          onClick={() => void acceptInvite()}
          disabled={joiningCompany || !inviteToken.trim()}
          className="btn-primary w-full rounded-2xl px-5 py-3 text-sm disabled:opacity-60"
        >
          {joiningCompany ? "Connexion…" : "Rejoindre"}
        </button>
        {inviteMsg ? (
          <p className="text-sm text-[var(--on-surface-variant)]">{inviteMsg}</p>
        ) : null}
      </div>

      <div className="surface-section space-y-4 p-6">
        <div>
          <p className="label-uppercase text-[10px] font-semibold text-[var(--secondary)]">
            Création
          </p>
          <h3 className="font-headline text-lg font-bold text-[var(--primary)]">
            Créer une entreprise
          </h3>
        </div>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Nom de l'entreprise"
          className="input-soft w-full rounded-2xl px-4 py-3 text-sm"
        />
        <input
          type="text"
          value={companyIndustry}
          onChange={(e) => setCompanyIndustry(e.target.value)}
          placeholder="Secteur / description courte"
          className="input-soft w-full rounded-2xl px-4 py-3 text-sm"
        />
        <button
          type="button"
          onClick={() => void createCompany()}
          disabled={creatingCompany || !companyName.trim()}
          className="btn-primary w-full rounded-2xl px-5 py-3 text-sm disabled:opacity-60"
        >
          {creatingCompany ? "Création…" : "Créer l'entreprise"}
        </button>
        {companyMsg ? (
          <p className="text-sm text-[var(--on-surface-variant)]">{companyMsg}</p>
        ) : null}
      </div>
    </div>
  );
}
