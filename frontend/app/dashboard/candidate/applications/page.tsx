'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiGet } from '@/lib/api'
import { getToken, getUser } from '@/lib/auth'

type User = {
  id: number
  email: string
  firstName: string
  lastName: string
  role: 'CANDIDATE' | 'RECRUITER'
}

type Application = {
  id: number
  jobId?: number
  status?: string
  createdAt?: string
  score?: number
}

type Job = {
  id: number
  title?: string
  location?: string
  companyName?: string
  company?: { name?: string }
}

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  IN_REVIEW: {
    label: 'En revue',
    className: 'bg-[var(--surface-container-highest)] text-[var(--on-surface-variant)]',
  },
  SHORTLISTED: {
    label: 'Selectionne',
    className: 'bg-[color-mix(in_srgb,var(--tertiary)_30%,white)] text-[color-mix(in_srgb,var(--primary)_70%,black)]',
  },
  INTERVIEW: {
    label: 'Entretien',
    className: 'bg-[color-mix(in_srgb,var(--secondary)_18%,white)] text-[var(--secondary)]',
  },
  REJECTED: {
    label: 'Refuse',
    className: 'bg-[#ffdad6] text-[#93000a]',
  },
}

const INTERVIEW_STATUSES = new Set(['INTERVIEW', 'INTERVIEWING', 'SHORTLISTED'])

function formatDate(value?: string) {
  if (!value) return '---'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '---'
  return new Intl.DateTimeFormat('fr-TN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function scoreFor(app: Application): number | null {
  if (typeof app.score === 'number') return Math.round(app.score)
  return null
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <circle cx="11" cy="11" r="7" />
      <line x1="16.65" y1="16.65" x2="21" y2="21" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0A1.65 1.65 0 0 0 9 3.09V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0A1.65 1.65 0 0 0 20.91 11H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <polygon points="3 4 21 4 14 12 14 20 10 18 10 12 3 4" />
    </svg>
  )
}

function ScoreRing({ score }: { score: number }) {
  const radius = 22
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative h-14 w-14">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 56 56">
        <circle
          cx="28"
          cy="28"
          r={radius}
          stroke="var(--surface-container-high)"
          strokeWidth="4"
          fill="transparent"
        />
        <circle
          cx="28"
          cy="28"
          r={radius}
          stroke="var(--secondary)"
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-extrabold text-[var(--primary)]">
        {score}%
      </span>
    </div>
  )
}

export default function CandidateApplicationsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [query, setQuery] = useState('')
  const [applications, setApplications] = useState<Application[]>([])
  const [jobsById, setJobsById] = useState<Record<number, Job>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = getToken()
    const currentUser = getUser()
    if (!token || !currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)

    let active = true

    async function loadApplications() {
      if (!currentUser) return
      setLoading(true)
      setError('')
      try {
        const data = await apiGet(`/applications?userId=${currentUser.id}`)
        if (!active) return
        if (!data?.success) {
          setError('Impossible de charger les candidatures.')
          setApplications([])
          return
        }
        const list: Application[] = data.data || []
        setApplications(list)

        const jobIds = Array.from(new Set(list.map((app) => app.jobId).filter((id): id is number => Boolean(id))))
        if (!jobIds.length) {
          setJobsById({})
          return
        }
        const jobEntries = await Promise.all(
          jobIds.map(async (jobId) => {
            try {
              const jobData = await apiGet(`/jobs/${jobId}`)
              if (jobData?.success) {
                return [jobId, jobData.data as Job] as const
              }
            } catch {}
            return [jobId, null] as const
          }),
        )
        if (!active) return
        const map: Record<number, Job> = {}
        jobEntries.forEach(([id, job]) => {
          if (job) map[id] = job
        })
        setJobsById(map)
      } catch {
        if (!active) return
        setError('Erreur de connexion. Veuillez reessayer.')
        setApplications([])
      } finally {
        if (active) setLoading(false)
      }
    }

    loadApplications()

    return () => {
      active = false
    }
  }, [router])

  const filteredApplications = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return applications
    return applications.filter((app) => {
      const job = app.jobId ? jobsById[app.jobId] : undefined
      const title = job?.title ?? 'Poste confidentiel'
      const company = job?.companyName ?? job?.company?.name ?? 'Entreprise'
      return title.toLowerCase().includes(term) || company.toLowerCase().includes(term)
    })
  }, [applications, jobsById, query])

  const realScores = applications
    .map((app) => app.score)
    .filter((s): s is number => typeof s === 'number')
  const averageScore = realScores.length
    ? Math.round(realScores.reduce((sum, value) => sum + value, 0) / realScores.length)
    : null
  const interviewCount = applications.filter((app) => INTERVIEW_STATUSES.has((app.status || '').toUpperCase())).length
  const activeCount = applications.filter((app) => !['REJECTED', 'WITHDRAWN', 'CANCELLED'].includes((app.status || '').toUpperCase())).length

  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--on-surface)]">
      <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col bg-[var(--surface-container-low)] px-4 py-8 lg:flex">
        <div className="mb-10 px-2">
          <h1 className="text-xl font-extrabold tracking-tight text-[var(--primary)] font-headline">
            TunHire Nexus
          </h1>
          <p className="label-uppercase mt-1 text-[10px] font-semibold text-[var(--on-surface-variant)]">
            AI Talent Platform
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-2">
          {[
            { label: 'Tableau de bord', href: '/dashboard/candidate' },
            { label: 'Mes Candidatures', href: '/dashboard/candidate/applications', active: true },
            { label: 'Trouver un Job', href: '/jobs' },
            { label: 'Messages', href: '/dashboard/candidate' },
            { label: 'Profil', href: '/dashboard/candidate' },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                item.active
                  ? 'bg-[color-mix(in_srgb,var(--surface-container-high)_70%,transparent)] text-[var(--primary)]'
                  : 'text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)]'
              }`}
            >
              <span>{item.label}</span>
              {item.active ? (
                <span className="h-2 w-2 rounded-full bg-[var(--secondary)]" />
              ) : null}
            </Link>
          ))}
        </nav>
        <div className="mt-6 rounded-3xl bg-[var(--primary-container)] p-5 text-white">
          <p className="text-xs font-bold">Passer a la version Pro</p>
          <p className="mt-2 text-[11px] text-white/70">
            Debloquez la preparation d&apos;entretien assistee par IA.
          </p>
          <button
            type="button"
            className="mt-4 w-full rounded-full bg-[var(--secondary-bright)] py-2 text-[11px] font-bold text-[var(--primary)]"
          >
            Mettre a jour
          </button>
        </div>
      </aside>

      <header className="glass-nav fixed top-0 z-40 flex h-20 w-full items-center justify-between px-6 lg:pl-[calc(16rem+2rem)] lg:pr-10">
        <div className="flex w-full max-w-lg items-center gap-3 rounded-full bg-[var(--surface-container-lowest)] px-4 py-2 soft-outline">
          <SearchIcon />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une candidature..."
            className="w-full bg-transparent text-sm text-[var(--on-surface)] placeholder:text-[var(--on-surface-variant)] focus:outline-none"
          />
        </div>
        <div className="ml-6 hidden items-center gap-2 sm:flex">
          <button
            type="button"
            className="rounded-full p-2 text-[var(--on-surface-variant)] transition hover:bg-[var(--surface-container-high)]"
          >
            <BellIcon />
          </button>
          <button
            type="button"
            className="rounded-full p-2 text-[var(--on-surface-variant)] transition hover:bg-[var(--surface-container-high)]"
          >
            <SettingsIcon />
          </button>
          {user ? (
            <div className="ml-2 flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-bold text-[var(--primary)]">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-[10px] text-[var(--on-surface-variant)]">Plan Professionnel</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-white">
                {`${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()}
              </div>
            </div>
          ) : null}
        </div>
      </header>

      <main className="min-h-screen px-6 pb-12 pt-28 lg:ml-64 lg:px-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="label-uppercase text-[10px] font-semibold text-[var(--secondary)]">
              My Applications
            </p>
            <h2 className="mt-2 font-headline text-4xl font-extrabold text-[var(--primary)]">
              Mes Candidatures
            </h2>
            <p className="mt-3 max-w-xl text-sm text-[var(--on-surface-variant)]">
              Suivez vos opportunites et laissez l&apos;IA TunHire orchestrer vos prochaines prises de contact.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="flex items-center gap-2 rounded-full bg-[var(--surface-container-high)] px-5 py-3 text-xs font-bold text-[var(--primary)] transition hover:bg-[var(--surface-container-highest)]"
            >
              <FilterIcon />
              Filtrer
            </button>
            <Link
              href="/jobs"
              className="flex items-center gap-2 rounded-full bg-[var(--primary)] px-5 py-3 text-xs font-bold text-[var(--on-primary)] transition hover:opacity-90"
            >
              <PlusIcon />
              Nouvelle recherche
            </Link>
          </div>
        </div>

        <section className="mt-10 rounded-3xl bg-[var(--surface-container-low)] p-1">
          <div className="rounded-[22px] bg-[var(--surface-container-lowest)]">
            <div className="hidden grid-cols-12 gap-4 px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--on-surface-variant)] lg:grid">
              <div className="col-span-4">Poste &amp; Entreprise</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Statut</div>
              <div className="col-span-2 text-center">Score IA</div>
              <div className="col-span-2 text-right">Action</div>
            </div>

            {loading ? (
              <div className="space-y-4 px-6 py-8">
                {[0, 1, 2].map((row) => (
                  <div key={row} className="rounded-2xl bg-[var(--surface-container-low)] p-6 animate-pulse">
                    <div className="h-4 w-1/3 rounded-full bg-[var(--surface-container-high)]" />
                    <div className="mt-4 h-3 w-1/2 rounded-full bg-[var(--surface-container-high)]" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ffdad6] text-[#93000a]">
                  !
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[var(--primary)]">Une erreur est survenue</h3>
                  <p className="mt-2 max-w-md text-sm text-[var(--on-surface-variant)]">{error}</p>
                </div>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="rounded-full bg-[var(--primary)] px-6 py-2 text-xs font-bold text-white"
                >
                  Reessayer
                </button>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="flex flex-col items-center gap-6 px-6 py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--surface-container-high)] text-[var(--primary)]">
                  0
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[var(--primary)]">Aucune candidature pour le moment</h3>
                  <p className="mt-2 max-w-md text-sm text-[var(--on-surface-variant)]">
                    Votre avenir n&apos;est qu&apos;a un clic. Commencez a explorer les emplois qui correspondent a votre profil.
                  </p>
                </div>
                <Link
                  href="/jobs"
                  className="rounded-full bg-[var(--secondary-bright)] px-6 py-3 text-xs font-bold text-[var(--primary)]"
                >
                  Explorer les jobs tech
                </Link>
              </div>
            ) : (
              <div className="space-y-3 px-6 py-6">
                {filteredApplications.map((app) => {
                  const job = app.jobId ? jobsById[app.jobId] : undefined
                  const title = job?.title ?? 'Poste confidentiel'
                  const company = job?.companyName ?? job?.company?.name ?? 'Entreprise tunisienne'
                  const location = job?.location ?? 'Tunisie'
                  const statusKey = (app.status || 'IN_REVIEW').toUpperCase()
                  const status = STATUS_STYLES[statusKey] || {
                    label: statusKey.replace(/_/g, ' '),
                    className: 'bg-[var(--surface-container-high)] text-[var(--on-surface-variant)]',
                  }
                  const score = scoreFor(app)

                  return (
                    <div
                      key={app.id}
                      className="grid grid-cols-1 gap-4 rounded-2xl bg-[var(--surface-container-lowest)] px-6 py-5 transition hover:bg-[var(--surface-container-low)] lg:grid-cols-12 lg:items-center"
                    >
                      <div className="lg:col-span-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--on-surface-variant)] lg:hidden">
                          Poste
                        </p>
                        <h4 className="text-base font-bold text-[var(--primary)]">{title}</h4>
                        <p className="mt-1 text-xs text-[var(--on-surface-variant)]">
                          {company} · {location}
                        </p>
                      </div>
                      <div className="lg:col-span-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--on-surface-variant)] lg:hidden">
                          Date
                        </p>
                        <p className="text-sm text-[var(--on-surface)]">{formatDate(app.createdAt)}</p>
                      </div>
                      <div className="lg:col-span-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--on-surface-variant)] lg:hidden">
                          Statut
                        </p>
                        <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${status.className}`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="lg:col-span-2 lg:flex lg:justify-center">
                        {score !== null ? (
                          <ScoreRing score={score} />
                        ) : (
                          <span className="text-sm text-[var(--on-surface-variant)]">—</span>
                        )}
                      </div>
                      <div className="lg:col-span-2 lg:text-right">
                        <Link
                          href={`/dashboard/candidate/applications/${app.id}`}
                          className="inline-flex items-center gap-2 text-sm font-bold text-[var(--primary)] hover:underline"
                        >
                          Voir details
                          <ArrowRightIcon />
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div
            className="relative overflow-hidden rounded-3xl p-8 text-white lg:col-span-2"
            style={{
              background: 'linear-gradient(135deg, var(--primary), var(--primary-container))',
            }}
          >
            <span className="label-uppercase inline-flex rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold tracking-[0.2em] text-[var(--secondary-bright)]">
              Apercu IA
            </span>
            <h3 className="mt-4 max-w-xl font-headline text-2xl font-extrabold">
              Votre profil correspond a {averageScore !== null ? `${averageScore}%` : 'une forte proportion'} des nouvelles opportunites IA.
            </h3>
            <p className="mt-4 max-w-xl text-sm text-white/70">
              Base sur vos candidatures recentes, TunHire recommande de cibler les entreprises SaaS et fintech en pleine croissance.
            </p>
            <Link
              href="/dashboard/candidate"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-bold text-[var(--primary)]"
            >
              Optimiser mon profil
              <ArrowRightIcon />
            </Link>
          </div>
          <div className="rounded-3xl bg-[var(--surface-container-lowest)] p-8 text-center shadow-[0_24px_60px_rgba(25,28,30,0.08)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--tertiary)] text-[var(--primary)]">
              {interviewCount}
            </div>
            <h3 className="mt-4 text-lg font-bold text-[var(--primary)]">Entretiens actifs</h3>
            <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
              {activeCount} candidatures en mouvement ce mois-ci.
            </p>
            <div className="mt-6 h-2 w-full rounded-full bg-[var(--surface-container-high)]">
              <div
                className="h-2 rounded-full bg-[var(--tertiary)]"
                style={{ width: `${averageScore !== null ? Math.min(100, Math.max(20, averageScore)) : 0}%` }}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
