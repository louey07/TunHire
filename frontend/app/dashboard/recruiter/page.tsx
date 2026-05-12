'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getToken } from '@/lib/auth'
import { apiGet, apiPost } from '@/lib/api'
import Navbar from '@/components/Navbar'

type Application = {
  id: number
  status: string
  score?: number
  level?: string
  candidate?: {
    firstName?: string
    lastName?: string
    email?: string
  }
}

const STATUS_LABELS: Record<string, string> = {
  IN_REVIEW: 'En cours',
  SHORTLISTED: 'Sélectionné',
  REJECTED: 'Rejeté',
}

export default function RecruiterDashboard() {
  const router = useRouter()

  const [companyName, setCompanyName] = useState('')
  const [companyIndustry, setCompanyIndustry] = useState('')
  const [creatingCompany, setCreatingCompany] = useState(false)
  const [companyMsg, setCompanyMsg] = useState('')
  const [companyId, setCompanyId] = useState<string | null>(null)

  const [jobTitle, setJobTitle] = useState('')
  const [jobLocation, setJobLocation] = useState('')
  const [jobType, setJobType] = useState('')
  const [jobDesc, setJobDesc] = useState('')
  const [postingJob, setPostingJob] = useState(false)
  const [jobMsg, setJobMsg] = useState('')

  const [companyJobs, setCompanyJobs] = useState<{ id: number; title: string }[]>([])
  const [selectedJobId, setSelectedJobId] = useState('')
  const [applications, setApplications] = useState<Application[]>([])
  const [loadingApps, setLoadingApps] = useState(false)
  const [appsMsg, setAppsMsg] = useState('')
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null)

  useEffect(() => {
    if (!getToken()) {
      router.push('/login')
      return
    }
    const stored = localStorage.getItem('tunhire_company_id')
    if (stored) {
      setCompanyId(stored)
      fetchCompanyJobs(stored)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function createCompany() {
    if (!companyName.trim()) return
    setCreatingCompany(true)
    setCompanyMsg('')
    try {
      const data = await apiPost('/companies', {
        name: companyName.trim(),
        industry: companyIndustry.trim(),
      })
      if (data.success) {
        const id = String(data.data.id)
        localStorage.setItem('tunhire_company_id', id)
        setCompanyId(id)
        setCompanyMsg('Entreprise créée avec succès !')
        fetchCompanyJobs(id)
      } else {
        setCompanyMsg('Erreur lors de la création')
      }
    } catch {
      setCompanyMsg('Erreur de connexion')
    } finally {
      setCreatingCompany(false)
    }
  }

  async function postJob() {
    if (!companyId) {
      setJobMsg("Veuillez d'abord créer une entreprise")
      return
    }
    if (!jobTitle.trim() || !jobLocation.trim() || !jobType || !jobDesc.trim()) {
      setJobMsg('Veuillez remplir tous les champs')
      return
    }
    setPostingJob(true)
    setJobMsg('')
    try {
      const data = await apiPost('/jobs', {
        title: jobTitle.trim(),
        location: jobLocation.trim(),
        contractType: jobType,
        description: jobDesc.trim(),
        companyId: Number(companyId),
      })
      if (data.success) {
        const newId = String(data.data.id)
        try {
          await fetch(`http://localhost:8081/jobs/${newId}/status?status=OPEN`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${getToken()}` },
          })
        } catch {}
        await fetchCompanyJobs(companyId!)
        setSelectedJobId(newId)
        setJobTitle('')
        setJobLocation('')
        setJobType('')
        setJobDesc('')
        setJobMsg('Offre publiée avec succès !')
      } else {
        setJobMsg('Erreur lors de la publication')
      }
    } catch {
      setJobMsg('Erreur de connexion')
    } finally {
      setPostingJob(false)
    }
  }

  async function fetchCompanyJobs(cId: string) {
    try {
      const data = await apiGet(`/companies/${cId}/jobs`)
      if (data.success) {
        setCompanyJobs(data.data || [])
      }
    } catch {}
  }

  async function fetchApplications(jobId: string) {
    setLoadingApps(true)
    setAppsMsg('')
    setApplications([])
    try {
      const data = await apiGet(`/applications/job/${jobId}/ranked`)
      if (data.success) {
        setApplications(data.data || [])
        if ((data.data || []).length === 0) setAppsMsg('Aucune candidature pour cette offre.')
      } else {
        setAppsMsg('Erreur lors du chargement')
      }
    } catch {
      setAppsMsg('Erreur de connexion')
    } finally {
      setLoadingApps(false)
    }
  }

  async function updateStatus(appId: number, status: string) {
    setUpdatingStatusId(appId)
    try {
      await fetch(`http://localhost:8081/applications/${appId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ status }),
      })
      setApplications((prev) => prev.map((a) => (a.id === appId ? { ...a, status } : a)))
    } catch {}
    setUpdatingStatusId(null)
  }

  return (
    <div style={{ background: '#f7f4ee', minHeight: '100vh' }}>
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">

        {/* Company */}
        {!companyId ? (
          <section className="bg-white rounded-xl border p-6" style={{ borderColor: '#e2ddd2' }}>
            <h2 className="text-lg font-semibold text-[#15191f] mb-4">Créer mon entreprise</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#15191f] mb-1">
                  Nom de l&apos;entreprise
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="TunTech SARL"
                  className="w-full px-3 py-2 rounded-lg border text-sm text-[#15191f]"
                  style={{ borderColor: '#e2ddd2' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#15191f] mb-1">
                  {"Secteur d'activité"}
                </label>
                <input
                  type="text"
                  value={companyIndustry}
                  onChange={(e) => setCompanyIndustry(e.target.value)}
                  placeholder="Technologie, Finance, Santé..."
                  className="w-full px-3 py-2 rounded-lg border text-sm text-[#15191f]"
                  style={{ borderColor: '#e2ddd2' }}
                />
              </div>
              <button
                type="button"
                onClick={createCompany}
                disabled={creatingCompany || !companyName.trim()}
                className="px-4 py-2 rounded-lg text-sm text-white disabled:opacity-60 transition-colors"
                style={{ background: '#15191f' }}
              >
                {creatingCompany ? 'Création...' : "Créer l'entreprise"}
              </button>
              {companyMsg && (
                <p className={`text-sm ${companyMsg.includes('!') ? 'text-green-600' : 'text-red-500'}`}>
                  {companyMsg}
                </p>
              )}
            </div>
          </section>
        ) : (
          <div
            className="flex items-center gap-3 bg-white rounded-xl border px-5 py-3 text-sm"
            style={{ borderColor: '#e2ddd2' }}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: '#1FA39F' }}
            />
            <span className="font-medium text-[#1FA39F]">Entreprise active</span>
            <span className="text-[#aaa]">ID : {companyId}</span>
          </div>
        )}

        {/* Post job */}
        <section className="bg-white rounded-xl border p-6" style={{ borderColor: '#e2ddd2' }}>
          <h2 className="text-lg font-semibold text-[#15191f] mb-4">Publier une offre</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#15191f] mb-1">Titre du poste</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Développeur Full Stack"
                  className="w-full px-3 py-2 rounded-lg border text-sm text-[#15191f]"
                  style={{ borderColor: '#e2ddd2' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#15191f] mb-1">Localisation</label>
                <input
                  type="text"
                  value={jobLocation}
                  onChange={(e) => setJobLocation(e.target.value)}
                  placeholder="Tunis, Sfax..."
                  className="w-full px-3 py-2 rounded-lg border text-sm text-[#15191f]"
                  style={{ borderColor: '#e2ddd2' }}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#15191f] mb-1">Type de contrat</label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm text-[#15191f] bg-white"
                style={{ borderColor: '#e2ddd2' }}
              >
                <option value="">Choisir un type...</option>
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="Stage">Stage</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#15191f] mb-1">Description</label>
              <textarea
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                rows={4}
                placeholder="Décrivez le poste, les missions, les compétences requises..."
                className="w-full px-3 py-2 rounded-lg border text-sm text-[#15191f]"
                style={{ borderColor: '#e2ddd2' }}
              />
            </div>
            <button
              type="button"
              onClick={postJob}
              disabled={postingJob}
              className="px-4 py-2 rounded-lg text-sm text-white disabled:opacity-60 transition-colors"
              style={{ background: '#1FA39F' }}
            >
              {postingJob ? 'Publication...' : "Publier l'offre"}
            </button>
            {jobMsg && (
              <p className={`text-sm ${jobMsg.includes('!') ? 'text-green-600' : 'text-red-500'}`}>
                {jobMsg}
              </p>
            )}
          </div>
        </section>

        {/* Applications */}
        <section className="bg-white rounded-xl border p-6" style={{ borderColor: '#e2ddd2' }}>
          <h2 className="text-lg font-semibold text-[#15191f] mb-4">Candidatures reçues</h2>

          <div className="mb-4">
            {!companyId ? (
              <p className="text-sm text-[#888]">Créez d&apos;abord une entreprise pour voir vos offres.</p>
            ) : companyJobs.length === 0 ? (
              <p className="text-sm text-[#888]">Aucune offre publiée pour le moment.</p>
            ) : (
              <select
                value={selectedJobId}
                onChange={async (e) => {
                  const jobId = e.target.value
                  setSelectedJobId(jobId)
                  setApplications([])
                  setAppsMsg('')
                  if (jobId) await fetchApplications(jobId)
                }}
                disabled={loadingApps}
                className="w-full px-3 py-2 rounded-lg border text-sm text-[#15191f] bg-white disabled:opacity-60"
                style={{ borderColor: '#e2ddd2' }}
              >
                <option value="">Sélectionner une offre...</option>
                {companyJobs.map((job) => (
                  <option key={job.id} value={String(job.id)}>
                    {job.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          {appsMsg && (
            <p className={`text-sm mb-3 ${applications.length === 0 && !appsMsg.includes('Erreur') ? 'text-[#888]' : 'text-red-500'}`}>
              {appsMsg}
            </p>
          )}

          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app.id}
                className="rounded-xl border p-4"
                style={{ borderColor: '#e2ddd2', background: '#f7f4ee' }}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-medium text-sm text-[#15191f]">
                      {app.candidate?.firstName} {app.candidate?.lastName}
                    </p>
                    {app.candidate?.email && (
                      <p className="text-xs text-[#888] mt-0.5">{app.candidate.email}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {app.score !== undefined && (
                      <span
                        className="text-xs px-2 py-1 rounded-full font-semibold"
                        style={{ background: '#1FA39F', color: 'white' }}
                      >
                        {app.score}%
                      </span>
                    )}
                    {app.level && (
                      <span
                        className="text-xs px-2 py-1 rounded-full"
                        style={{ background: '#efeae0', color: '#15191f' }}
                      >
                        {app.level}
                      </span>
                    )}
                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{ background: '#efeae0', color: '#15191f' }}
                    >
                      {STATUS_LABELS[app.status] ?? app.status}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(['IN_REVIEW', 'SHORTLISTED', 'REJECTED'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => updateStatus(app.id, s)}
                      disabled={updatingStatusId === app.id || app.status === s}
                      className="text-xs px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-40"
                      style={{
                        borderColor: app.status === s ? '#1FA39F' : '#e2ddd2',
                        color: app.status === s ? '#1FA39F' : '#15191f',
                        background: 'white',
                      }}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
