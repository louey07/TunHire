"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { apiGet, apiPatch } from "@/lib/api";
import Navbar from "@/components/Navbar";
import RecruiterSidebar from "@/components/RecruiterSidebar";

type ApplicationDetail = {
  id: number;
  userId: number;
  candidateFirstName: string;
  candidateLastName: string;
  resumeUrl?: string;
  status: string;
  createdAt: string;
};

type CandidateProfile = {
  bio?: string;
  location?: string;
  yearsOfExperience?: number;
  skills?: { id: number; skillName: string }[];
};

const STATUS_LABELS: Record<string, string> = {
  IN_REVIEW: "En cours",
  SHORTLISTED: "Sélectionné",
  REJECTED: "Rejeté",
};

export default function CandidateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const appId = params.id as string;

  const [app, setApp] = useState<ApplicationDetail | null>(null);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }

    const run = async () => {
      setLoading(true);
      try {
        const appRes = await apiGet(`/applications/${appId}`);
        if (appRes.success && appRes.data) {
          const applicationData = appRes.data;
          setApp(applicationData);

          if (applicationData.userId) {
            const profRes = await apiGet(
              `/candidates/${applicationData.userId}`,
            );
            if (profRes.success && profRes.data) {
              setProfile(profRes.data);
            }
          }
        }
      } catch {}
      setLoading(false);
    };

    void run();
  }, [appId, router]);

  async function updateStatus(newStatus: string) {
    if (!app) return;
    setUpdating(true);
    try {
      await apiPatch(`/applications/${app.id}/status?status=${newStatus}`);
      setApp({ ...app, status: newStatus });
    } catch {}
    setUpdating(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center">
        <p className="text-[#43474f]">Chargement...</p>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center">
        <p className="text-[#93000a]">Candidature introuvable.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e]">
      <div className="lg:hidden">
        <Navbar />
      </div>

      <RecruiterSidebar activeItem="candidates" />

      <main className="lg:pl-[260px]">
        <div className="max-w-[1000px] mx-auto p-4 sm:p-8">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="text-[#001e40] hover:text-[#00daf3] font-semibold text-sm transition"
            >
              &larr; Retour
            </button>
            <h1 className="text-3xl font-headline font-black tracking-tight text-[#001e40]">
              Profil du Candidat
            </h1>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Card */}
              <div className="rounded-[24px] bg-white p-6 shadow-sm border border-[#c3c6d1]/30">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-headline font-bold text-[#001e40]">
                      {app.candidateFirstName} {app.candidateLastName}
                    </h2>
                    <p className="text-sm text-[#43474f] mt-1">
                      {profile?.location || "Localisation non spécifiée"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#e0e3e5] text-[#001e40]">
                      {profile?.yearsOfExperience
                        ? `${profile.yearsOfExperience} ans d'exp.`
                        : "Exp. non spécifiée"}
                    </span>
                  </div>
                </div>

                {profile?.bio && (
                  <div className="mt-6">
                    <h3 className="text-xs uppercase tracking-wider font-bold text-[#43474f] mb-3">
                      À propos
                    </h3>
                    <p className="text-sm leading-relaxed text-[#191c1e] bg-[#f7f9fb] p-4 rounded-xl">
                      {profile.bio}
                    </p>
                  </div>
                )}

                {profile?.skills && profile.skills.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-xs uppercase tracking-wider font-bold text-[#43474f] mb-3">
                      Compétences
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((s) => (
                        <span
                          key={s.id}
                          className="px-3 py-1 bg-[#00daf3]/10 text-[#006875] text-xs font-semibold rounded-full"
                        >
                          {s.skillName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Resume/CV Section */}
              <div className="rounded-[24px] bg-white p-6 shadow-sm border border-[#c3c6d1]/30">
                <h3 className="text-lg font-headline font-bold text-[#001e40] mb-4">
                  Curriculum Vitae
                </h3>
                {app.resumeUrl ? (
                  <iframe
                    src={app.resumeUrl}
                    className="w-full h-[600px] border-0 rounded-xl bg-[#f7f9fb]"
                    title="CV du candidat"
                  />
                ) : (
                  <div className="py-12 text-center text-sm text-[#43474f] bg-[#f7f9fb] rounded-xl border border-dashed border-[#c3c6d1]">
                    Aucun CV n&apos;a été fourni ou l&apos;URL est invalide.
                  </div>
                )}
              </div>
            </div>

            {/* Actions Sidebar */}
            <div className="space-y-6">
              <div className="rounded-[24px] bg-white p-6 shadow-sm border border-[#c3c6d1]/30">
                <h3 className="text-xs uppercase tracking-wider font-bold text-[#43474f] mb-4">
                  Statut de Candidature
                </h3>

                <div className="space-y-3">
                  {Object.entries(STATUS_LABELS).map(([k, label]) => {
                    const isActive = app.status === k;
                    return (
                      <button
                        key={k}
                        disabled={updating}
                        onClick={() => updateStatus(k)}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition ${
                          isActive
                            ? "bg-[#001e40] text-white"
                            : "bg-[#f7f9fb] text-[#43474f] hover:bg-[#e0e3e5]"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
