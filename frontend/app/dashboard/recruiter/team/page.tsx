"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import RecruiterSidebar from "@/components/RecruiterSidebar";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import { getToken, getUser } from "@/lib/auth";

type CompanyResponse = {
  id: number;
  name: string;
  slug?: string | null;
  logoUrl?: string | null;
  location?: string | null;
};

type CompanyApiResponse = {
  success: boolean;
  message?: string;
  data?: CompanyResponse;
};

type StoredUser = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: "CANDIDATE" | "RECRUITER";
};

type MemberRole = "RECRUITER_ADMIN" | "MEMBER";

type Membership = {
  id: number;
  companyId: number;
  userId: number;
  role: MemberRole;
  joinedAt: string;
};

type InviteTokenResponse = {
  token: string;
};

type ActivityItem = {
  id: string;
  title: string;
  detail: string;
  occurredAt: string;
  accent: "cyan" | "green" | "slate";
};

const ROLE_LABELS: Record<MemberRole, string> = {
  RECRUITER_ADMIN: "Admin recrutement",
  MEMBER: "Recruiter",
};

const ROLE_TONES: Record<MemberRole, string> = {
  RECRUITER_ADMIN: "bg-[#001e40] text-white",
  MEMBER: "bg-[#e0e3e5] text-[#43474f]",
};

const inputClass =
  "w-full rounded-2xl bg-[#ffffff] px-4 py-3 text-sm text-[#191c1e] ring-1 ring-[#c3c6d1]/20 focus:outline-none focus:ring-2 focus:ring-[#00daf3]/40 transition duration-200";

function formatDate(value?: string | null) {
  if (!value) return "Date indisponible";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date indisponible";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function relativeTime(value?: string | null) {
  if (!value) return "Moment inconnu";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Moment inconnu";

  const diffMs = date.getTime() - Date.now();
  const rtf = new Intl.RelativeTimeFormat("fr", { numeric: "auto" });
  const minutes = Math.round(diffMs / (1000 * 60));
  const hours = Math.round(diffMs / (1000 * 60 * 60));
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
  return rtf.format(days, "day");
}

function buildInviteLink(token: string) {
  if (typeof window === "undefined") return token;
  return `${window.location.origin}/invites/accept?token=${token}`;
}

export default function RecruiterTeamPage() {
  const router = useRouter();
  const currentUser = getUser() as StoredUser | null;

  const [companyId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("tunhire_company_id");
  });
  const [company, setCompany] = useState<CompanyResponse | null>(null);
  const [members, setMembers] = useState<Membership[]>([]);
  const [sessionActivity, setSessionActivity] = useState<ActivityItem[]>([]);
  const [inviteLink, setInviteLink] = useState("");
  const [inviteMsg, setInviteMsg] = useState("");
  const [copyMsg, setCopyMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [generatingInvite, setGeneratingInvite] = useState(false);
  const [updatingRoleUserId, setUpdatingRoleUserId] = useState<number | null>(
    null,
  );
  const [removingUserId, setRemovingUserId] = useState<number | null>(null);

  const loadPage = async (activeCompanyId: string) => {
    setLoading(true);
    setPageError("");

    try {
      const [companyRes, membersRes] = await Promise.all([
        apiGet(`/companies/${activeCompanyId}`) as Promise<CompanyApiResponse>,
        apiGet(`/companies/${activeCompanyId}/members`) as Promise<
          Membership[]
        >,
      ]);

      if (!companyRes?.success || !companyRes.data) {
        setPageError("Impossible de charger les détails de l’entreprise.");
        return;
      }

      const memberList = Array.isArray(membersRes) ? membersRes : [];
      setCompany(companyRes.data);
      setMembers(memberList);
      setSessionActivity([]);
    } catch {
      setPageError("Erreur de connexion lors du chargement de l’équipe.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    if (!companyId) {
      router.push("/dashboard/recruiter");
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadPage(companyId);
  }, [companyId, router]);

  function pushActivity(item: ActivityItem) {
    setSessionActivity((prev) => [item, ...prev]);
  }

  async function generateInvite() {
    if (!companyId) return;

    setGeneratingInvite(true);
    setInviteMsg("");
    setCopyMsg("");

    try {
      const response = (await apiPost(
        `/companies/${companyId}/members/invites`,
      )) as InviteTokenResponse;
      if (!response?.token) {
        setInviteMsg("Impossible de générer un lien pour le moment.");
        return;
      }

      const link = buildInviteLink(response.token);
      setInviteLink(link);
      setInviteMsg(
        "Lien d’invitation généré. Il reste valide pendant 24 heures.",
      );
      pushActivity({
        id: `invite-${response.token}`,
        title: "Invitation créée",
        detail:
          "Un lien d’invitation pour un nouveau recruiter vient d’être généré.",
        occurredAt: new Date().toISOString(),
        accent: "cyan",
      });
    } catch {
      setInviteMsg("Seuls les admins peuvent créer des invitations.");
    } finally {
      setGeneratingInvite(false);
    }
  }

  async function copyInviteLink() {
    if (!inviteLink) return;

    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopyMsg("Lien copié dans le presse-papiers.");
    } catch {
      setCopyMsg("Copie impossible. Vous pouvez copier le lien manuellement.");
    }
  }

  async function changeRole(member: Membership, nextRole: MemberRole) {
    if (!companyId || member.role === nextRole) return;

    setUpdatingRoleUserId(member.userId);
    setPageError("");

    try {
      const updated = (await apiPatch(
        `/companies/${companyId}/members/${member.userId}/role?role=${nextRole}`,
      )) as Membership;
      const occurredAt = new Date().toISOString();

      setMembers((prev) =>
        prev.map((item) => (item.userId === member.userId ? updated : item)),
      );
      pushActivity({
        id: `role-${member.userId}-${occurredAt}`,
        title: "Rôle mis à jour",
        detail: `Le membre #${member.userId} est maintenant ${ROLE_LABELS[nextRole].toLowerCase()}.`,
        occurredAt,
        accent: "green",
      });
    } catch {
      setPageError(
        "Impossible de mettre à jour ce rôle. Vérifiez vos droits admin.",
      );
    } finally {
      setUpdatingRoleUserId(null);
    }
  }

  async function removeMember(member: Membership) {
    if (!companyId) return;

    setRemovingUserId(member.userId);
    setPageError("");

    try {
      await apiDelete(`/companies/${companyId}/members/${member.userId}`);
      const occurredAt = new Date().toISOString();
      setMembers((prev) =>
        prev.filter((item) => item.userId !== member.userId),
      );
      pushActivity({
        id: `remove-${member.userId}-${occurredAt}`,
        title: "Membre retiré",
        detail: `Le membre #${member.userId} a été retiré de l’équipe de recrutement.`,
        occurredAt,
        accent: "slate",
      });
    } catch {
      setPageError(
        "Suppression impossible. Les admins ne peuvent pas se retirer eux-mêmes.",
      );
    } finally {
      setRemovingUserId(null);
    }
  }

  const isCurrentUserAdmin = useMemo(() => {
    if (!currentUser) return false;
    return members.some(
      (member) =>
        member.userId === currentUser.id && member.role === "RECRUITER_ADMIN",
    );
  }, [currentUser, members]);

  const teamStats = useMemo(() => {
    const adminCount = members.filter(
      (member) => member.role === "RECRUITER_ADMIN",
    ).length;
    const recruiterCount = members.filter(
      (member) => member.role === "MEMBER",
    ).length;
    const newestMember = [...members].sort(
      (a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime(),
    )[0];

    return {
      adminCount,
      recruiterCount,
      total: members.length,
      newestMember,
    };
  }, [members]);

  const activityFeed = useMemo(() => {
    const membershipActivity: ActivityItem[] = members.map((member) => ({
      id: `joined-${member.userId}-${member.joinedAt}`,
      title:
        member.userId === currentUser?.id
          ? "Vous avez rejoint l’équipe"
          : `Membre #${member.userId} actif`,
      detail:
        member.userId === currentUser?.id
          ? "Votre accès à l’espace recrutement est actif."
          : `Rôle actuel : ${ROLE_LABELS[member.role]}.`,
      occurredAt: member.joinedAt,
      accent: member.role === "RECRUITER_ADMIN" ? "green" : "slate",
    }));

    return [...sessionActivity, ...membershipActivity]
      .sort(
        (a, b) =>
          new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
      )
      .slice(0, 8);
  }, [currentUser?.id, members, sessionActivity]);

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e]">
      <div className="lg:hidden">
        <Navbar />
      </div>

      <RecruiterSidebar activeItem="team" />

      <main className="relative overflow-hidden lg:ml-[260px]">
        <div className="pointer-events-none absolute -top-32 right-[-10%] h-[420px] w-[420px] rounded-full bg-[#00daf3]/20 blur-3xl" />
        <div className="pointer-events-none absolute top-44 left-[-12%] h-[360px] w-[360px] rounded-full bg-[#69ff87]/20 blur-3xl" />

        <div className="max-w-6xl mx-auto px-6 pb-16 pt-10">
          <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-10">
            <div className="space-y-3">
              <span className="label-uppercase text-[10px] font-semibold text-[#006875]">
                Recruiter team
              </span>
              <h1 className="text-4xl lg:text-5xl font-headline font-extrabold text-[#001e40]">
                Piloter votre équipe de recrutement.
              </h1>
              <p className="text-sm text-[#43474f] max-w-2xl">
                Gérez les accès, créez des invitations pour de nouveaux
                recruiters et suivez les derniers mouvements d’équipe depuis un
                espace centralisé.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => void generateInvite()}
                disabled={generatingInvite || !companyId}
                className="rounded-full bg-[#001e40] px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_40px_rgba(0,30,64,0.25)] transition hover:opacity-90 disabled:opacity-50"
              >
                {generatingInvite ? "Génération..." : "Inviter un recruiter"}
              </button>
              <span className="rounded-full bg-[#e0e3e5] px-4 py-2 text-[11px] font-semibold text-[#004f58]">
                {company?.name || "Entreprise active"}
              </span>
            </div>
          </header>

          {pageError && (
            <div className="mb-6 rounded-2xl bg-[#ffdad6] px-4 py-3 text-sm text-[#93000a]">
              {pageError}
            </div>
          )}

          {loading ? (
            <div className="rounded-[28px] bg-[#f2f4f6] p-1">
              <div className="rounded-[24px] bg-white p-10 text-sm text-[#43474f] shadow-[0_24px_60px_rgba(25,28,30,0.08)]">
                Chargement de l’équipe en cours...
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    label: "Membres actifs",
                    value: String(teamStats.total),
                    featured: true,
                  },
                  {
                    label: "Admins recrutement",
                    value: String(teamStats.adminCount),
                    featured: false,
                  },
                  {
                    label: "Recruiters",
                    value: String(teamStats.recruiterCount),
                    featured: false,
                  },
                  {
                    label: "Dernier mouvement",
                    value: teamStats.newestMember
                      ? relativeTime(teamStats.newestMember.joinedAt)
                      : "Aucun",
                    featured: false,
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className={
                      stat.featured
                        ? "rounded-[24px] bg-gradient-to-br from-[#001e40] to-[#003366] p-6 text-white shadow-[0_18px_40px_rgba(25,28,30,0.08)]"
                        : "rounded-[24px] bg-white p-6 text-[#001e40] shadow-[0_18px_40px_rgba(25,28,30,0.06)]"
                    }
                  >
                    <p
                      className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${stat.featured ? "text-white/70" : "text-[#006875]"}`}
                    >
                      {stat.label}
                    </p>
                    <p
                      className={`mt-3 text-3xl font-headline font-extrabold ${stat.featured ? "text-white" : "text-[#001e40]"}`}
                    >
                      {stat.value}
                    </p>
                  </div>
                ))}
              </section>

              <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.3fr_0.7fr]">
                <section className="rounded-[28px] bg-[#f2f4f6] p-1">
                  <div className="rounded-[24px] bg-white p-6 shadow-[0_24px_60px_rgba(25,28,30,0.08)]">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <span className="label-uppercase text-[10px] font-semibold text-[#006875]">
                          Team directory
                        </span>
                        <h2 className="text-2xl font-headline font-bold text-[#001e40]">
                          Membres de l’équipe
                        </h2>
                        <p className="mt-2 text-sm text-[#43474f]">
                          Les rôles et suppressions sont réservés aux admins
                          recrutement.
                        </p>
                      </div>
                      <div className="rounded-full bg-[#f2f4f6] px-4 py-2 text-[11px] font-semibold text-[#43474f]">
                        {isCurrentUserAdmin
                          ? "Vous êtes admin"
                          : "Accès membre"}
                      </div>
                    </div>

                    <div className="mt-6 space-y-4">
                      {members.length === 0 ? (
                        <div className="rounded-2xl bg-[#f7f9fb] px-5 py-8 text-sm text-[#43474f]">
                          Aucun membre n’est encore rattaché à cette entreprise.
                        </div>
                      ) : (
                        members
                          .slice()
                          .sort(
                            (a, b) =>
                              new Date(a.joinedAt).getTime() -
                              new Date(b.joinedAt).getTime(),
                          )
                          .map((member) => {
                            const isCurrentUser =
                              member.userId === currentUser?.id;
                            const canManage =
                              isCurrentUserAdmin && !isCurrentUser;
                            const nextRole: MemberRole =
                              member.role === "RECRUITER_ADMIN"
                                ? "MEMBER"
                                : "RECRUITER_ADMIN";

                            return (
                              <div
                                key={member.id}
                                className="rounded-[24px] bg-[#f7f9fb] p-5 shadow-[0_18px_40px_rgba(25,28,30,0.04)]"
                              >
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                  <div className="space-y-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h3 className="text-lg font-semibold text-[#001e40]">
                                        {isCurrentUser && currentUser
                                          ? `${currentUser.firstName} ${currentUser.lastName}`
                                          : `Utilisateur #${member.userId}`}
                                      </h3>
                                      {isCurrentUser && (
                                        <span className="rounded-full bg-[#00daf3]/15 px-3 py-1 text-[11px] font-semibold text-[#006875]">
                                          Vous
                                        </span>
                                      )}
                                      <span
                                        className={`rounded-full px-3 py-1 text-[11px] font-semibold ${ROLE_TONES[member.role]}`}
                                      >
                                        {ROLE_LABELS[member.role]}
                                      </span>
                                    </div>

                                    <div className="grid gap-2 text-sm text-[#43474f] sm:grid-cols-2">
                                      <p>
                                        <span className="font-semibold text-[#001e40]">
                                          ID utilisateur :
                                        </span>{" "}
                                        #{member.userId}
                                      </p>
                                      <p>
                                        <span className="font-semibold text-[#001e40]">
                                          Ajouté le :
                                        </span>{" "}
                                        {formatDate(member.joinedAt)}
                                      </p>
                                      <p className="sm:col-span-2">
                                        <span className="font-semibold text-[#001e40]">
                                          Dernière activité connue :
                                        </span>{" "}
                                        a rejoint l’équipe{" "}
                                        {relativeTime(member.joinedAt)}.
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap gap-2 lg:max-w-[260px] lg:justify-end">
                                    <button
                                      type="button"
                                      disabled={
                                        !canManage ||
                                        updatingRoleUserId === member.userId
                                      }
                                      onClick={() =>
                                        void changeRole(member, nextRole)
                                      }
                                      className="rounded-full bg-[#e0e3e5] px-4 py-2 text-[11px] font-semibold text-[#43474f] transition hover:bg-[#d6dadd] disabled:cursor-not-allowed disabled:opacity-45"
                                    >
                                      {updatingRoleUserId === member.userId
                                        ? "Mise à jour..."
                                        : member.role === "RECRUITER_ADMIN"
                                          ? "Passer recruiter"
                                          : "Promouvoir admin"}
                                    </button>
                                    <button
                                      type="button"
                                      disabled={
                                        !canManage ||
                                        removingUserId === member.userId
                                      }
                                      onClick={() => void removeMember(member)}
                                      className="rounded-full bg-[#ffdad6] px-4 py-2 text-[11px] font-semibold text-[#93000a] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
                                    >
                                      {removingUserId === member.userId
                                        ? "Suppression..."
                                        : "Retirer"}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                      )}
                    </div>
                  </div>
                </section>

                <div className="space-y-8">
                  <section className="rounded-[28px] bg-[#f2f4f6] p-1">
                    <div className="rounded-[24px] bg-white p-6 shadow-[0_24px_60px_rgba(25,28,30,0.08)]">
                      <span className="label-uppercase text-[10px] font-semibold text-[#006875]">
                        Invitations
                      </span>
                      <h2 className="mt-2 text-2xl font-headline font-bold text-[#001e40]">
                        Ajouter un recruiter
                      </h2>
                      <p className="mt-3 text-sm text-[#43474f]">
                        Générez un lien sécurisé à partager avec un futur membre
                        de votre équipe recrutement.
                      </p>

                      <button
                        type="button"
                        onClick={() => void generateInvite()}
                        disabled={generatingInvite || !companyId}
                        className="mt-5 w-full rounded-2xl bg-[#001e40] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                      >
                        {generatingInvite
                          ? "Création du lien..."
                          : "Créer une invitation"}
                      </button>

                      <div className="mt-5 space-y-3">
                        <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#006875]">
                          Lien d’invitation
                        </label>
                        <textarea
                          value={inviteLink}
                          readOnly
                          rows={4}
                          className={`${inputClass} resize-none bg-[#f7f9fb]`}
                          placeholder="Le lien généré apparaîtra ici."
                        />
                        <button
                          type="button"
                          onClick={() => void copyInviteLink()}
                          disabled={!inviteLink}
                          className="rounded-full bg-[#e0e3e5] px-4 py-2 text-[11px] font-semibold text-[#43474f] transition hover:bg-[#d6dadd] disabled:opacity-40"
                        >
                          Copier le lien
                        </button>
                        {inviteMsg && (
                          <p className="text-sm text-[#006875]">{inviteMsg}</p>
                        )}
                        {copyMsg && (
                          <p className="text-xs text-[#43474f]">{copyMsg}</p>
                        )}
                      </div>
                    </div>
                  </section>

                  <section className="rounded-[28px] bg-[#f2f4f6] p-1">
                    <div className="rounded-[24px] bg-white p-6 shadow-[0_24px_60px_rgba(25,28,30,0.08)]">
                      <span className="label-uppercase text-[10px] font-semibold text-[#006875]">
                        Activity
                      </span>
                      <h2 className="mt-2 text-2xl font-headline font-bold text-[#001e40]">
                        Derniers mouvements
                      </h2>
                      <p className="mt-3 text-sm text-[#43474f]">
                        Vue basée sur les événements d’équipe disponibles
                        actuellement dans l’API.
                      </p>

                      <div className="mt-6 space-y-4">
                        {activityFeed.length === 0 ? (
                          <div className="rounded-2xl bg-[#f7f9fb] px-5 py-8 text-sm text-[#43474f]">
                            Aucune activité récente à afficher.
                          </div>
                        ) : (
                          activityFeed.map((item) => (
                            <div
                              key={item.id}
                              className="flex gap-3 rounded-2xl bg-[#f7f9fb] p-4"
                            >
                              <div
                                className={`mt-1 h-2.5 w-2.5 rounded-full ${
                                  item.accent === "cyan"
                                    ? "bg-[#00daf3]"
                                    : item.accent === "green"
                                      ? "bg-[#69ff87]"
                                      : "bg-[#9aa0a6]"
                                }`}
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <p className="text-sm font-semibold text-[#001e40]">
                                    {item.title}
                                  </p>
                                  <span className="text-[11px] font-medium text-[#43474f]">
                                    {relativeTime(item.occurredAt)}
                                  </span>
                                </div>
                                <p className="mt-1 text-sm text-[#43474f]">
                                  {item.detail}
                                </p>
                                <p className="mt-2 text-[11px] text-[#43474f]">
                                  {formatDate(item.occurredAt)}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
