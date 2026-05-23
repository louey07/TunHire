"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from "@/lib/api";
import Navbar from "@/components/Navbar";
import RecruiterSidebar from "@/components/RecruiterSidebar";

type Job = {
  id: number;
  title: string;
  location: string;
  status: string;
  contractType?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  description?: string;
  experienceLevel?: string;
};

export default function RecruiterJobs() {
  const router = useRouter();

  // Core Authentication & Organization State
  const [companyId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("tunhire_company_id");
  });
  const [companyJobs, setCompanyJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, DRAFT, OPEN, CLOSED

  // Create Job Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [jobExperience, setJobExperience] = useState("");
  const [jobSalaryMin, setJobSalaryMin] = useState("");
  const [jobSalaryMax, setJobSalaryMax] = useState("");
  const [postingJob, setPostingJob] = useState(false);

  // Edit Job Form State
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editType, setEditType] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editExperience, setEditExperience] = useState("");
  const [editSalaryMin, setEditSalaryMin] = useState("");
  const [editSalaryMax, setEditSalaryMax] = useState("");
  const [updatingJob, setUpdatingJob] = useState(false);

  // Delete Confirmation State
  const [deletingJobId, setDeletingJobId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Status Toggling State
  const [togglingStatusId, setTogglingStatusId] = useState<number | null>(null);

  // Toast / Status Message State
  const [toast, setToast] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const inputClass =
    "w-full rounded-2xl bg-[#ffffff] px-4 py-3 text-sm text-[#191c1e] ring-1 ring-[#c3c6d1]/20 focus:outline-none focus:ring-2 focus:ring-[#00daf3]/40 transition duration-200";

  function showToast(type: "success" | "error", text: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ type, text });
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }

  async function fetchCompanyJobs(cId: string) {
    setLoading(true);
    try {
      const data = await apiGet(`/companies/${cId}/jobs`);
      if (data.success) {
        setCompanyJobs(data.data || []);
      } else {
        showToast("error", "Erreur de chargement des offres.");
      }
    } catch {
      showToast("error", "Impossible de se connecter au serveur.");
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }
    if (companyId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void fetchCompanyJobs(companyId);
    } else {
      router.push("/dashboard/recruiter");
    }
  }, [companyId, router]);

  // Create Job Offer (Can be Draft or Published immediately)
  async function postJob(asDraft: boolean = false) {
    if (!companyId) {
      showToast("error", "Veuillez d'abord choisir une entreprise");
      return;
    }
    if (!jobTitle.trim() || !jobLocation.trim() || !jobDesc.trim()) {
      showToast(
        "error",
        "Veuillez remplir le titre, la localisation et la description",
      );
      return;
    }
    const salaryMinValue = jobSalaryMin.trim() ? Number(jobSalaryMin) : null;
    const salaryMaxValue = jobSalaryMax.trim() ? Number(jobSalaryMax) : null;
    if (
      (salaryMinValue !== null && Number.isNaN(salaryMinValue)) ||
      (salaryMaxValue !== null && Number.isNaN(salaryMaxValue))
    ) {
      showToast("error", "Montant de salaire invalide");
      return;
    }
    if (
      salaryMinValue !== null &&
      salaryMaxValue !== null &&
      salaryMinValue > salaryMaxValue
    ) {
      showToast(
        "error",
        "Le salaire minimum doit être inférieur au salaire maximum",
      );
      return;
    }

    setPostingJob(true);
    try {
      const data = await apiPost("/jobs", {
        title: jobTitle.trim(),
        location: jobLocation.trim(),
        contractType: jobType || null,
        description: jobDesc.trim(),
        companyId: Number(companyId),
        experienceLevel: jobExperience.trim() || null,
        salaryMin: salaryMinValue,
        salaryMax: salaryMaxValue,
        status: "DRAFT", // Created as draft initially by default
      });
      if (data.success) {
        const newId = String(data.data.id);
        if (!asDraft) {
          try {
            // If publishing directly, request transition to OPEN
            await apiPatch(`/jobs/${newId}/status?status=OPEN`);
          } catch {}
        }

        await fetchCompanyJobs(companyId);

        // Reset creation state
        setJobTitle("");
        setJobLocation("");
        setJobType("");
        setJobDesc("");
        setJobExperience("");
        setJobSalaryMin("");
        setJobSalaryMax("");
        setShowAddForm(false);
        showToast(
          "success",
          asDraft
            ? "Offre enregistrée en brouillon !"
            : "Offre publiée avec succès !",
        );
      } else {
        showToast("error", data.message || "Erreur lors de la publication");
      }
    } catch {
      showToast("error", "Erreur de connexion");
    } finally {
      setPostingJob(false);
    }
  }

  // Load Job into Editor Form
  async function startEdit(job: Job) {
    try {
      setUpdatingJob(true);
      const data = await apiGet(`/jobs/${job.id}`);
      if (data.success) {
        const fullJob = data.data as Job;
        setEditingJob(fullJob);
        setEditTitle(fullJob.title);
        setEditLocation(fullJob.location);
        setEditType(fullJob.contractType || "");
        setEditDesc(fullJob.description || "");
        setEditExperience(fullJob.experienceLevel || "");
        setEditSalaryMin(
          fullJob.salaryMin != null ? String(fullJob.salaryMin) : "",
        );
        setEditSalaryMax(
          fullJob.salaryMax != null ? String(fullJob.salaryMax) : "",
        );
      } else {
        // Fallback to local list details
        setEditingJob(job);
        setEditTitle(job.title);
        setEditLocation(job.location);
        setEditType(job.contractType || "");
        setEditDesc(job.description || "");
        setEditExperience(job.experienceLevel || "");
        setEditSalaryMin(job.salaryMin != null ? String(job.salaryMin) : "");
        setEditSalaryMax(job.salaryMax != null ? String(job.salaryMax) : "");
      }
    } catch {
      showToast("error", "Erreur lors du chargement des détails de l’offre.");
    } finally {
      setUpdatingJob(false);
    }
  }

  // Submit Updated Job Details
  async function updateJob() {
    if (!editingJob || !companyId) return;
    if (!editTitle.trim() || !editLocation.trim() || !editDesc.trim()) {
      showToast(
        "error",
        "Veuillez remplir le titre, la localisation et la description",
      );
      return;
    }
    const salaryMinValue = editSalaryMin.trim() ? Number(editSalaryMin) : null;
    const salaryMaxValue = editSalaryMax.trim() ? Number(editSalaryMax) : null;
    if (
      (salaryMinValue !== null && Number.isNaN(salaryMinValue)) ||
      (salaryMaxValue !== null && Number.isNaN(salaryMaxValue))
    ) {
      showToast("error", "Montant de salaire invalide");
      return;
    }
    if (
      salaryMinValue !== null &&
      salaryMaxValue !== null &&
      salaryMinValue > salaryMaxValue
    ) {
      showToast(
        "error",
        "Le salaire minimum doit être inférieur au salaire maximum",
      );
      return;
    }

    setUpdatingJob(true);
    try {
      const data = await apiPut(`/jobs/${editingJob.id}`, {
        title: editTitle.trim(),
        location: editLocation.trim(),
        contractType: editType || null,
        description: editDesc.trim(),
        companyId: Number(companyId),
        experienceLevel: editExperience.trim() || null,
        salaryMin: salaryMinValue,
        salaryMax: salaryMaxValue,
        status: editingJob.status,
      });
      if (data.success) {
        await fetchCompanyJobs(companyId);
        setEditingJob(null);
        showToast("success", "Offre mise à jour avec succès !");
      } else {
        showToast("error", data.message || "Erreur lors de la mise à jour");
      }
    } catch {
      showToast("error", "Erreur de connexion");
    } finally {
      setUpdatingJob(false);
    }
  }

  // Update status (Publish, Close, Re-open)
  async function updateJobStatus(job: Job, nextStatus: "OPEN" | "CLOSED") {
    if (!companyId) return;
    setTogglingStatusId(job.id);
    try {
      const data = await apiPatch(
        `/jobs/${job.id}/status?status=${nextStatus}`,
      );
      if (data.success) {
        // Update locally to keep transition snappy
        setCompanyJobs((prev) =>
          prev.map((item) =>
            item.id === job.id ? { ...item, status: nextStatus } : item,
          ),
        );
        const statusLabel = nextStatus === "OPEN" ? "publiée" : "clôturée";
        showToast("success", `Offre ${statusLabel} avec succès !`);
      } else {
        showToast(
          "error",
          data.message || "Erreur lors du changement de statut",
        );
      }
    } catch {
      showToast("error", "Erreur de connexion");
    } finally {
      setTogglingStatusId(null);
    }
  }

  // Execute Deletion
  async function deleteJob() {
    if (deletingJobId == null || !companyId) return;
    setDeleting(true);
    try {
      const data = await apiDelete(`/jobs/${deletingJobId}`);
      if (data.success) {
        setCompanyJobs((prev) =>
          prev.filter((job) => job.id !== deletingJobId),
        );
        setDeletingJobId(null);
        showToast("success", "Offre supprimée avec succès !");
      } else {
        showToast("error", data.message || "Erreur lors de la suppression");
      }
    } catch {
      showToast("error", "Erreur de connexion");
    } finally {
      setDeleting(false);
    }
  }

  // Local Search and Filter Logic
  const filteredJobs = companyJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.contractType &&
        job.contractType.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "DRAFT" && job.status === "DRAFT") ||
      (statusFilter === "OPEN" && job.status === "OPEN") ||
      (statusFilter === "CLOSED" && job.status === "CLOSED");

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e]">
      <div className="lg:hidden">
        <Navbar />
      </div>

      <RecruiterSidebar activeItem="jobs" />

      {/* Main Workspace */}
      <div className="relative overflow-hidden lg:ml-[260px]">
        {/* Editorial Gradients */}
        <div className="pointer-events-none absolute -top-32 right-[-10%] h-[400px] w-[400px] rounded-full bg-[#00daf3]/10 blur-3xl" />
        <div className="pointer-events-none absolute top-64 left-[-10%] h-[350px] w-[350px] rounded-full bg-[#69ff87]/10 blur-3xl" />

        <div className="max-w-5xl mx-auto px-6 pb-20 pt-10">
          <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-10">
            <div className="space-y-3">
              <span className="label-uppercase text-[10px] font-bold text-[#006875]">
                Gestion des Carrières
              </span>
              <h1 className="text-4xl lg:text-5xl font-headline font-extrabold text-[#001e40] tracking-tight">
                Gérer les offres d’emploi.
              </h1>
              <p className="text-sm text-[#43474f] max-w-xl leading-relaxed">
                Consultez, modifiez et organisez vos publications de postes.
                Enregistrez en brouillon pour travailler plus tard ou publiez
                directement pour activer le matching IA.
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(!showAddForm);
                  if (!showAddForm)
                    window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`rounded-full px-6 py-3 text-sm font-semibold transition duration-200 flex items-center gap-2 ${
                  showAddForm
                    ? "bg-[#e0e3e5] text-[#001e40] hover:bg-[#d0d3d5]"
                    : "bg-[#001e40] text-white shadow-[0_20px_40px_rgba(0,30,64,0.2)] hover:opacity-90"
                }`}
              >
                {showAddForm ? "Fermer" : "Créer une offre"}
              </button>
            </div>
          </header>

          {/* Add Job Form Panel */}
          {showAddForm && (
            <div className="rounded-[28px] bg-[#f2f4f6] p-1 mb-10 transition duration-300">
              <div className="rounded-[24px] bg-white p-6 shadow-[0_24px_60px_rgba(25,28,30,0.06)]">
                <div className="mb-6">
                  <span className="label-uppercase text-[10px] font-semibold text-[#006875]">
                    Création Assistée
                  </span>
                  <h2 className="text-2xl font-headline font-bold text-[#001e40] mt-1">
                    Créer un nouveau poste
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="label-uppercase text-[10px] font-bold text-[#43474f]">
                        Titre du poste
                      </label>
                      <input
                        type="text"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="e.g. Lead Frontend Engineer"
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="label-uppercase text-[10px] font-bold text-[#43474f]">
                        Localisation
                      </label>
                      <input
                        type="text"
                        value={jobLocation}
                        onChange={(e) => setJobLocation(e.target.value)}
                        placeholder="e.g. Tunis, Tunisia (Hybrid)"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="label-uppercase text-[10px] font-bold text-[#43474f]">
                        Type de contrat
                      </label>
                      <select
                        value={jobType}
                        onChange={(e) => setJobType(e.target.value)}
                        className={`${inputClass} bg-white`}
                      >
                        <option value="">Sélectionner un type...</option>
                        <option value="CDI">CDI</option>
                        <option value="CDD">CDD</option>
                        <option value="Stage">Stage</option>
                        <option value="Freelance">Freelance</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="label-uppercase text-[10px] font-bold text-[#43474f]">
                        Niveau d’expérience
                      </label>
                      <input
                        type="text"
                        value={jobExperience}
                        onChange={(e) => setJobExperience(e.target.value)}
                        placeholder="e.g. 3+ ans, Senior"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="label-uppercase text-[10px] font-bold text-[#43474f]">
                        Salaire Min (DT / Mois)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={jobSalaryMin}
                        onChange={(e) => setJobSalaryMin(e.target.value)}
                        placeholder="e.g. 1500"
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="label-uppercase text-[10px] font-bold text-[#43474f]">
                        Salaire Max (DT / Mois)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={jobSalaryMax}
                        onChange={(e) => setJobSalaryMax(e.target.value)}
                        placeholder="e.g. 2500"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="label-uppercase text-[10px] font-bold text-[#43474f]">
                      Description & Exigences
                    </label>
                    <textarea
                      value={jobDesc}
                      onChange={(e) => setJobDesc(e.target.value)}
                      rows={5}
                      placeholder="Décrivez les responsabilités, les compétences requises et le profil recherché..."
                      className={inputClass}
                    />
                  </div>

                  <div className="pt-4 flex flex-wrap items-center justify-end gap-3 border-t border-[#f2f4f6] pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="rounded-full bg-[#f2f4f6] px-6 py-3 text-sm font-semibold text-[#43474f] hover:bg-[#e0e3e5] transition"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={() => postJob(true)}
                      disabled={postingJob}
                      className="rounded-full bg-white border border-[#c3c6d1] px-6 py-3 text-sm font-semibold text-[#001e40] hover:bg-[#f2f4f6] transition disabled:opacity-50"
                    >
                      Enregistrer Brouillon
                    </button>
                    <button
                      type="button"
                      onClick={() => postJob(false)}
                      disabled={postingJob}
                      className="rounded-full bg-[#001e40] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-90 disabled:opacity-50"
                    >
                      {postingJob ? "Publication..." : "Publier l'offre"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search, Filters, and Snapshot */}
          <div className="rounded-3xl bg-white p-6 shadow-[0_18px_45px_rgba(25,28,30,0.04)] mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1 max-w-md relative">
              <span className="absolute inset-y-0 left-4 flex items-center text-[#43474f]/50">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par titre, ville, contrat..."
                className="w-full rounded-full bg-[#f2f4f6] py-3 pl-12 pr-4 text-sm text-[#191c1e] placeholder:text-[#43474f]/50 focus:outline-none focus:ring-2 focus:ring-[#00daf3]/40 transition"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-[#43474f] uppercase tracking-wider hidden sm:inline">
                Statut:
              </span>
              <div className="inline-flex rounded-full bg-[#f2f4f6] p-1 flex-wrap">
                {[
                  { value: "ALL", label: "Tous" },
                  { value: "DRAFT", label: "Brouillons" },
                  { value: "OPEN", label: "Ouverts" },
                  { value: "CLOSED", label: "Clôturés" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStatusFilter(opt.value)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                      statusFilter === opt.value
                        ? "bg-white text-[#001e40] shadow-sm"
                        : "text-[#43474f] hover:text-[#001e40]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Job Offers Container */}
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-28 rounded-2xl bg-white animate-pulse p-6 flex justify-between items-center shadow-[0_8px_30px_rgba(0,0,0,0.02)]"
                  >
                    <div className="space-y-3 w-1/3">
                      <div className="h-4 bg-[#f2f4f6] rounded w-3/4" />
                      <div className="h-3 bg-[#f2f4f6] rounded w-1/2" />
                    </div>
                    <div className="h-8 bg-[#f2f4f6] rounded-full w-24" />
                  </div>
                ))}
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="rounded-3xl bg-white p-12 text-center shadow-[0_18px_45px_rgba(25,28,30,0.04)]">
                <div className="mx-auto h-16 w-16 bg-[#f2f4f6] rounded-full flex items-center justify-center text-2xl mb-4 text-[#001e40]">
                  🗂️
                </div>
                <h3 className="text-lg font-bold text-[#001e40] font-headline">
                  Aucune offre trouvée
                </h3>
                <p className="text-sm text-[#43474f] mt-1 max-w-sm mx-auto">
                  {searchQuery || statusFilter !== "ALL"
                    ? "Essayez de modifier vos critères de recherche ou filtres."
                    : "Publiez votre première offre ou créez un brouillon en cliquant sur le bouton ci-dessus."}
                </p>
              </div>
            ) : (
              filteredJobs.map((job) => {
                const isToggling = togglingStatusId === job.id;

                return (
                  <div
                    key={job.id}
                    className="group relative rounded-3xl bg-white p-6 shadow-[0_18px_40px_rgba(25,28,30,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(25,28,30,0.08)] flex flex-col md:flex-row md:items-center md:justify-between gap-6"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg font-bold text-[#001e40] font-headline group-hover:text-[#006875] transition">
                          {job.title}
                        </h3>
                        {job.contractType && (
                          <span className="rounded-full bg-[#006875]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#006875]">
                            {job.contractType}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#43474f] flex items-center gap-2">
                        <span>📍 {job.location}</span>
                        {job.experienceLevel && (
                          <>
                            <span className="text-[#c3c6d1]">·</span>
                            <span>💼 {job.experienceLevel}</span>
                          </>
                        )}
                      </p>
                      {(job.salaryMin != null || job.salaryMax != null) && (
                        <p className="text-xs font-semibold text-[#006875] flex items-center gap-1">
                          <span>💰</span>
                          <span>
                            {job.salaryMin != null
                              ? `${job.salaryMin} DT`
                              : "Min"}{" "}
                            -{" "}
                            {job.salaryMax != null
                              ? `${job.salaryMax} DT`
                              : "Max"}
                          </span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 border-t border-[#f2f4f6] pt-4 md:border-t-0 md:pt-0">
                      {/* Context-Aware Status Control */}
                      {job.status === "DRAFT" ? (
                        <button
                          type="button"
                          onClick={() => updateJobStatus(job, "OPEN")}
                          disabled={isToggling}
                          className="rounded-full bg-[#00daf3]/20 px-3 py-1 text-xs font-bold text-[#004f58] hover:bg-[#00daf3]/35 transition flex items-center gap-1.5"
                          title="Publier cette offre"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-[#00daf3]" />
                          <span>Brouillon (Publier)</span>
                        </button>
                      ) : job.status === "OPEN" ? (
                        <button
                          type="button"
                          onClick={() => updateJobStatus(job, "CLOSED")}
                          disabled={isToggling}
                          className="rounded-full bg-[#69ff87]/20 px-3 py-1 text-xs font-bold text-[#00531e] hover:bg-[#ffdad6] hover:text-[#93000a] transition flex items-center gap-1.5 group/btn"
                          title="Clôturer cette offre"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-[#3ce36a] group-hover/btn:bg-[#ba1a1a]" />
                          <span className="group-hover/btn:hidden">
                            Ouverte
                          </span>
                          <span className="hidden group-hover/btn:inline">
                            Clôturer
                          </span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => updateJobStatus(job, "OPEN")}
                          disabled={isToggling}
                          className="rounded-full bg-[#ffdad6] px-3 py-1 text-xs font-bold text-[#93000a] hover:bg-[#69ff87]/20 hover:text-[#00531e] transition flex items-center gap-1.5 group/btn"
                          title="Ré-ouvrir cette offre"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-[#ba1a1a] group-hover/btn:bg-[#3ce36a]" />
                          <span className="group-hover/btn:hidden">
                            Clôturée
                          </span>
                          <span className="hidden group-hover/btn:inline">
                            Ré-ouvrir
                          </span>
                        </button>
                      )}

                      {/* CRUD Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(job)}
                          className="p-2.5 rounded-full bg-[#f2f4f6] text-[#001e40] hover:bg-[#e0e3e5] transition"
                          title="Modifier"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                          >
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingJobId(job.id)}
                          className="p-2.5 rounded-full bg-[#ffdad6]/40 text-[#93000a] hover:bg-[#ffdad6]/85 transition"
                          title="Supprimer"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Edit Job Modal (Glassmorphic Overlay) */}
      {editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001e40]/30 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white rounded-[28px] p-6 shadow-[0_24px_70px_rgba(0,30,64,0.3)] border border-[#c3c6d1]/20 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setEditingJob(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-[#f2f4f6] text-[#43474f] transition"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="mb-6">
              <span className="label-uppercase text-[10px] font-bold text-[#006875]">
                Éditeur de Poste
              </span>
              <h2 className="text-2xl font-headline font-bold text-[#001e40] mt-1">
                Modifier l'offre
              </h2>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="label-uppercase text-[10px] font-bold text-[#43474f]">
                    Titre du poste
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <label className="label-uppercase text-[10px] font-bold text-[#43474f]">
                    Localisation
                  </label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="label-uppercase text-[10px] font-bold text-[#43474f]">
                    Type de contrat
                  </label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className={`${inputClass} bg-white`}
                  >
                    <option value="">Sélectionner un type...</option>
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="Stage">Stage</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="label-uppercase text-[10px] font-bold text-[#43474f]">
                    Niveau d’expérience
                  </label>
                  <input
                    type="text"
                    value={editExperience}
                    onChange={(e) => setEditExperience(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="label-uppercase text-[10px] font-bold text-[#43474f]">
                    Salaire Min (DT / Mois)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editSalaryMin}
                    onChange={(e) => setEditSalaryMin(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <label className="label-uppercase text-[10px] font-bold text-[#43474f]">
                    Salaire Max (DT / Mois)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editSalaryMax}
                    onChange={(e) => setEditSalaryMax(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="label-uppercase text-[10px] font-bold text-[#43474f]">
                  Description & Exigences
                </label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={5}
                  className={inputClass}
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#f2f4f6]">
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="rounded-full bg-[#f2f4f6] px-6 py-3 text-sm font-semibold text-[#43474f] hover:bg-[#e0e3e5] transition"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={updateJob}
                  disabled={updatingJob}
                  className="rounded-full bg-[#001e40] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-90 disabled:opacity-50"
                >
                  {updatingJob ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingJobId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001e40]/30 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-[24px] p-6 shadow-[0_24px_60px_rgba(0,30,64,0.35)] border border-[#ffdad6] text-center">
            <div className="mx-auto h-12 w-12 bg-[#ffdad6]/40 rounded-full flex items-center justify-center text-xl text-[#93000a] mb-4">
              ⚠️
            </div>
            <h3 className="text-xl font-headline font-bold text-[#001e40]">
              Supprimer cette offre ?
            </h3>
            <p className="text-sm text-[#43474f] mt-2 leading-relaxed">
              Cette action est irréversible. Les candidatures rattachées à ce
              poste risquent d’être désactivées.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingJobId(null)}
                className="rounded-full bg-[#f2f4f6] px-5 py-2.5 text-xs font-semibold text-[#43474f] hover:bg-[#e0e3e5] transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={deleteJob}
                disabled={deleting}
                className="rounded-full bg-[#ba1a1a] px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-[#93000a] transition disabled:opacity-50"
              >
                {deleting ? "Suppression..." : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slideUp">
          <div
            className={`rounded-2xl px-5 py-3 shadow-[0_16px_45px_rgba(0,0,0,0.12)] text-sm font-semibold flex items-center gap-2 ${
              toast.type === "success"
                ? "bg-[#d5e3ff] text-[#001e40] border-l-4 border-[#00daf3]"
                : "bg-[#ffdad6] text-[#93000a] border-l-4 border-[#ba1a1a]"
            }`}
          >
            <span>{toast.type === "success" ? "✅" : "❌"}</span>
            <span>{toast.text}</span>
          </div>
        </div>
      )}
    </div>
  );
}
