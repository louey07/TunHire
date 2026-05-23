'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getToken, getUser, logoutWithServer } from '@/lib/auth'
import { apiGet, apiPost, apiPostForm, apiPut, apiDelete } from '@/lib/api'

type Skill = { id: number; skillName: string }

type Profile = {
  id: number
  bio: string | null
  resumeUrl: string | null
  location: string | null
  availableFrom: string | null
  yearsOfExperience: number | null
  skills: Skill[]
}

const LANG_NAMES = new Set([
  'français', 'french', 'arabe', 'arabic', 'anglais', 'english',
  'allemand', 'german', 'espagnol', 'spanish', 'italien', 'italian',
  'turc', 'turkish', 'mandarin', 'chinois', 'chinese', 'russe', 'russian',
])

function extractLanguages(skills: Skill[]) {
  return skills
    .filter(s => LANG_NAMES.has(s.skillName.toLowerCase()))
    .map(s => s.skillName)
    .join(' · ')
}

function formatAvailability(value?: string | null) {
  if (!value) return 'Non defini'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Non defini'
  const today = new Date()
  const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  if (normalizedDate <= normalizedToday) return 'Immediatement'
  return new Intl.DateTimeFormat('fr-TN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(normalizedDate)
}

// ── icons ──────────────────────────────────────────────────────────────────────

function IcoEdit() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function IcoUpload() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function IcoDownload() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function IcoX() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: 10, height: 10 }}>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  )
}

function IcoPlus() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function IcoPin() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
      <path d="M20 10c0 7-8 13-8 13s-8-6-8-13a8 8 0 0 1 16 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function IcoBriefcase() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </svg>
  )
}

function IcoFile() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}

// ── page-scoped CSS vars & styles ──────────────────────────────────────────────

const PAGE_CSS = `
.cd-page { background: var(--surface); min-height: 100vh; color: var(--on-surface); }
.cd-layout { display: block; }
.cd-sidebar {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 260px;
  padding: 32px 18px;
  background: var(--surface-container-low);
  box-shadow: 0 24px 60px -30px rgba(25, 28, 30, 0.2);
  flex-direction: column;
  gap: 24px;
  z-index: 30;
}
.cd-sidebar-title {
  font-family: var(--font-headline), sans-serif;
  font-size: 20px; font-weight: 800; letter-spacing: -0.02em;
  color: var(--primary);
}
.cd-sidebar-link {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; border-radius: 18px;
  font-size: 13px; font-weight: 600; text-decoration: none;
  color: var(--on-surface-variant);
  background: transparent; border: 0; width: 100%; text-align: left;
  font-family: inherit; cursor: pointer;
  transition: background .15s ease, color .15s ease;
}
.cd-sidebar-link:hover { background: var(--surface-container-high); color: var(--primary); }
.cd-sidebar-link.active {
  background: color-mix(in srgb, var(--surface-container-high) 70%, transparent);
  color: var(--primary);
}
.cd-sidebar-dot {
  width: 8px; height: 8px; border-radius: 999px;
  background: var(--secondary);
}
.cd-main { margin-left: 0; }
.cd-content { max-width: 1280px; margin: 0 auto; padding: 28px 28px 80px; }
.cd-hero {
  position: relative; overflow: hidden; border-radius: 28px;
  background: linear-gradient(135deg, var(--primary), var(--primary-container));
  color: white; padding: 28px 32px; box-shadow: 0 28px 60px -30px rgba(0, 30, 64, 0.5);
}
.cd-hero::after {
  content: ""; position: absolute; inset: 0;
  background: radial-gradient(circle at 80% 20%, rgba(0, 218, 243, 0.2), transparent 55%);
  pointer-events: none;
}
.cd-hero-inner { position: relative; display: flex; gap: 24px; justify-content: space-between; flex-wrap: wrap; }
.cd-hero-chip {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 6px 12px; border-radius: 999px;
  background: rgba(255, 255, 255, 0.12); font-size: 10px;
  font-weight: 700; letter-spacing: 0.25em; text-transform: uppercase;
  color: var(--secondary-bright);
}
.cd-hero h1 {
  margin: 12px 0 8px; font-family: var(--font-headline), sans-serif;
  font-size: clamp(32px, 4vw, 46px); font-weight: 800; letter-spacing: -0.02em;
}
.cd-hero p { margin: 0; font-size: 15px; color: rgba(255,255,255,0.75); max-width: 520px; }
.cd-hero-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 14px; }
.cd-hero-stat {
  background: rgba(255,255,255,0.12); border-radius: 18px; padding: 14px 16px;
}
.cd-hero-stat p { margin: 0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: rgba(255,255,255,0.7); }
.cd-hero-stat h3 { margin: 8px 0 0; font-size: 22px; font-weight: 700; }
.cd-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  gap: 24px;
  align-items: start;
  margin-top: 24px;
}
.cd-col-right { display: grid; gap: 24px; }
.cd-card {
  background: var(--surface-container-lowest);
  border-radius: 20px;
  box-shadow: 0 24px 48px -24px rgba(25, 28, 30, 0.16);
  overflow: hidden;
}
.cd-card-head {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 18px 22px;
  background: var(--surface-container-low);
}
.cd-ghost-btn {
  background: var(--surface-container-lowest);
  border: 1px solid color-mix(in srgb, var(--outline-variant) 20%, transparent);
  color: var(--primary);
  padding: 7px 12px; border-radius: 12px; font-size: 12.5px; cursor: pointer;
  display: inline-flex; align-items: center; gap: 6px;
  transition: transform .15s ease, background .15s ease;
  font-family: inherit;
  text-decoration: none;
}
.cd-ghost-btn:hover { background: var(--surface-container-highest); transform: translateY(-1px); }
.cd-dark-btn {
  background: var(--primary); color: var(--on-primary);
  border: 1px solid var(--primary);
  padding: 7px 12px; border-radius: 12px; font-size: 12.5px; cursor: pointer;
  display: inline-flex; align-items: center; gap: 6px;
  transition: transform .15s ease;
  font-family: inherit;
}
.cd-dark-btn:hover { transform: translateY(-1px); }
.cd-dark-btn:disabled { opacity: 0.6; cursor: default }
.cd-cover {
  height: 110px;
  background:
    radial-gradient(circle at 20% 20%, rgba(0, 218, 243, 0.25), transparent 50%),
    linear-gradient(135deg, var(--primary), var(--primary-container));
}
.cd-profile-body { padding: 0 26px 24px; margin-top: -42px; position: relative; }
.cd-avatar-big {
  width: 84px; height: 84px; border-radius: 22px;
  background: linear-gradient(135deg, var(--secondary), var(--primary));
  color: white; display: grid; place-items: center;
  font-family: var(--font-headline), sans-serif;
  font-size: 32px; line-height: 1;
  border: 4px solid var(--surface-container-lowest);
  box-shadow: 0 12px 26px -18px rgba(0,0,0,0.3);
}
.cd-meta-line {
  margin-top: 16px; display: flex; flex-wrap: wrap; gap: 18px;
  font-size: 13px; color: var(--on-surface-variant);
}
.cd-meta-item { display: inline-flex; align-items: center; gap: 7px }
.cd-meta-item svg { color: var(--secondary); }
.cd-bio {
  margin-top: 18px; padding: 16px;
  border-radius: 16px; background: var(--surface-container-low);
  font-size: 14px; line-height: 1.6; color: var(--on-surface-variant);
}
.cd-bio-quote {
  font-family: var(--font-headline), sans-serif;
  font-style: italic; font-size: 17px;
  color: var(--primary); line-height: 1.35; margin: 0 0 10px;
}
.cd-skill-tag {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 7px 6px 7px 13px;
  background: color-mix(in srgb, var(--secondary) 10%, var(--surface-container-lowest));
  color: var(--secondary);
  border-radius: 999px;
  font-size: 13px; font-weight: 600; letter-spacing: -0.005em;
}
.cd-skill-x {
  width: 18px; height: 18px; border-radius: 999px;
  display: grid; place-items: center;
  background: transparent; border: 0; color: var(--secondary);
  cursor: pointer; padding: 0;
  transition: background .15s ease, color .15s ease;
}
.cd-skill-x:hover { background: var(--secondary); color: white }
.cd-add-input {
  width: 100%; border: 1px solid color-mix(in srgb, var(--outline-variant) 20%, transparent);
  border-radius: 12px; padding: 11px 12px 11px 36px;
  font-size: 13.5px; color: var(--on-surface);
  background: var(--surface-container-lowest); outline: none; font-family: inherit;
  transition: border-color .15s ease, box-shadow .15s ease;
}
.cd-add-input:focus { border-color: var(--secondary); box-shadow: 0 0 0 4px color-mix(in srgb, var(--secondary) 12%, transparent) }
.cd-add-btn {
  background: var(--secondary); color: white; border: 0;
  padding: 0 16px; border-radius: 12px; font-size: 13px; font-weight: 600;
  display: inline-flex; align-items: center; gap: 6px;
  cursor: pointer; white-space: nowrap; font-family: inherit;
  transition: transform .15s ease;
}
.cd-add-btn:hover { transform: translateY(-1px) }
.cd-add-btn:disabled { opacity: 0.6; cursor: default }
.cd-dropzone {
  border: 1.5px dashed color-mix(in srgb, var(--outline-variant) 22%, transparent);
  border-radius: 16px; padding: 26px;
  background: var(--surface-container-low); text-align: center;
  transition: border-color .15s ease, background .15s ease;
}
.cd-dropzone:hover { border-color: var(--secondary); background: color-mix(in srgb, var(--secondary) 6%, var(--surface-container-low)) }
.cd-extr-ai-chip {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: var(--font-body), sans-serif; font-size: 10.5px;
  letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--secondary);
  padding: 4px 8px; border: 1px solid color-mix(in srgb, var(--secondary) 40%, transparent); border-radius: 999px;
  background: var(--surface-container-lowest);
}
.cd-edit-input {
  width: 100%; border: 1px solid color-mix(in srgb, var(--outline-variant) 20%, transparent); border-radius: 12px;
  padding: 10px 12px; font-size: 13px; color: var(--on-surface);
  background: var(--surface-container-lowest); outline: none; font-family: inherit;
  transition: border-color .15s ease;
}
.cd-edit-input:focus { border-color: var(--secondary) }
.cd-save-btn {
  background: var(--primary); color: var(--on-primary); border: 0;
  padding: 9px 16px; border-radius: 12px; font-size: 13px; font-weight: 600;
  cursor: pointer; font-family: inherit;
  transition: transform .15s ease;
}
.cd-save-btn:hover { transform: translateY(-1px) }
.cd-save-btn:disabled { opacity: 0.6; cursor: default }
.cd-cancel-btn {
  background: transparent; border: 1px solid color-mix(in srgb, var(--outline-variant) 20%, transparent);
  color: var(--primary); padding: 9px 16px; border-radius: 12px;
  font-size: 13px; cursor: pointer; font-family: inherit;
}
.cd-cancel-btn:hover { background: var(--surface-container-low) }
@media (max-width: 1000px) {
  .cd-grid { grid-template-columns: 1fr }
}
@media (max-width: 640px) {
  .cd-content { padding: 22px 16px 60px }
}
@media (min-width: 1024px) {
  .cd-sidebar { display: flex }
  .cd-main { margin-left: 260px }
  .cd-content { padding: 28px 32px 80px }
}
`

// ── component ──────────────────────────────────────────────────────────────────

export default function CandidateDashboard() {
  const router = useRouter()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(true)
  const [cvUploaded, setCvUploaded] = useState(false)
  const [cvFileName, setCvFileName] = useState('')

  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({
    bio: '',
    location: '',
    availableFrom: '',
    yearsOfExperience: 0,
  })
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')

  const [newSkill, setNewSkill] = useState('')
  const [addingSkill, setAddingSkill] = useState(false)
  const [skillMsg, setSkillMsg] = useState('')

  const [cvParsing, setCvParsing] = useState(false)
  const [cvMsg, setCvMsg] = useState('')

  const handleLogout = () => {
    void logoutWithServer()
  }

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!getToken()) { router.push('/login'); return }
    const user = getUser()
    if (user) { setFirstName(user.firstName); setLastName(user.lastName || '') }
    loadProfile()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadProfile() {
    setLoading(true)
    try {
      const data: Profile = await apiGet('/candidates/me')
      if (data && data.id) {
        setProfile(data)
        setEditForm({
          bio: data.bio || '',
          location: data.location || '',
          availableFrom: data.availableFrom ? String(data.availableFrom) : '',
          yearsOfExperience: data.yearsOfExperience || 0,
        })
        const seen = new Set<string>()
        const unique: Skill[] = []
        for (const s of (data.skills || [])) {
          const key = s.skillName.toLowerCase()
          if (!seen.has(key)) { seen.add(key); unique.push(s) }
        }
        setSkills(unique)
      }
    } catch {}
    setLoading(false)
  }

  async function saveProfile() {
    setSavingProfile(true)
    setProfileMsg('')
    try {
      const payload = {
        bio: editForm.bio || null,
        location: editForm.location || null,
        availableFrom: editForm.availableFrom || null,
        yearsOfExperience: editForm.yearsOfExperience > 0 ? editForm.yearsOfExperience : null,
      }
      await apiPut('/candidates/me', payload)
      await loadProfile()
      setEditMode(false)
      setProfileMsg('Profil mis à jour.')
      setTimeout(() => setProfileMsg(''), 3000)
    } catch {
      setProfileMsg('Erreur de connexion.')
    } finally {
      setSavingProfile(false)
    }
  }

  async function addSkills() {
    const names = newSkill.split(',').map(s => s.trim()).filter(Boolean)
    if (names.length === 0) return
    setAddingSkill(true)
    setSkillMsg('')
    const existingLower = skills.map(s => s.skillName.toLowerCase())
    const toAdd = names.filter(n => !existingLower.includes(n.toLowerCase()))
    if (toAdd.length === 0) {
      setSkillMsg('Ces compétences existent déjà.')
      setNewSkill('')
      setAddingSkill(false)
      return
    }
    let anyError = false
    for (const name of toAdd) {
      try {
        const data = await apiPost('/candidates/me/skills', { skillName: name })
        if (data && data.id) {
          setSkills(prev => [...prev, data as Skill])
        } else {
          anyError = true
        }
      } catch {
        anyError = true
      }
    }
    setNewSkill('')
    if (anyError) setSkillMsg("Erreur lors de l'ajout.")
    setAddingSkill(false)
  }

  async function deleteSkill(id: number) {
    try {
      await apiDelete(`/candidates/me/skills/${id}`)
      setSkills(prev => prev.filter(s => s.id !== id))
    } catch {}
  }

  async function handleCVFile(file: File) {
    setCvParsing(true)
    setCvMsg('')
    try {
      const form = new FormData()
      form.append('file', file)
      const data: Profile = await apiPostForm('/candidates/me/cv/parse', form)
      if (data && data.id) {
        setProfile(data)
        setEditForm({
          bio: data.bio || '',
          location: data.location || '',
          availableFrom: data.availableFrom ? String(data.availableFrom) : '',
          yearsOfExperience: data.yearsOfExperience || 0,
        })
        const seen = new Set<string>()
        const unique: Skill[] = []
        for (const s of (data.skills || [])) {
          const key = s.skillName.toLowerCase()
          if (!seen.has(key)) { seen.add(key); unique.push(s) }
        }
        setSkills(unique)
        setCvUploaded(true)
        setCvFileName(file.name)
        setCvMsg('CV analysé avec succès.')
      } else {
        setCvMsg("Erreur lors de l'analyse.")
      }
    } catch {
      setCvMsg('Erreur de connexion.')
    } finally {
      setCvParsing(false)
    }
  }

  const cvLoaded = !!(profile?.resumeUrl) || cvUploaded
  const langs = extractLanguages(skills)
  const fullName = [firstName, lastName].filter(Boolean).join(' ')
  const initials = ((firstName[0] || '') + (lastName[0] || '')).toUpperCase() || '?'
  const profileScore = Math.min(
    100,
    40 + skills.length * 6 + (cvLoaded ? 20 : 0) + (profile?.bio ? 10 : 0),
  )
  const availabilityLabel = formatAvailability(profile?.availableFrom)
  const experienceLabel = profile?.yearsOfExperience ? `${profile.yearsOfExperience} ans` : '—'
  const cvStatusLabel = cvLoaded ? 'CV analyse' : 'CV manquant'
  const insightLine = skills.length >= 6
    ? "Accentuez vos projets cloud pour maximiser votre visibilite."
    : "Ajoutez des competences ciblees pour renforcer votre profil IA."

  // For bio display: first sentence as italic quote, rest as body
  const bio = profile?.bio || ''
  const dotIdx = bio.indexOf('.')
  const bioQuote = dotIdx > 0 ? bio.slice(0, dotIdx + 1) : bio
  const bioRest = dotIdx > 0 ? bio.slice(dotIdx + 1).trim() : ''

  return (
    <>
      <style>{PAGE_CSS}</style>
      <div className="cd-page">
        <div className="cd-layout">
          <aside className="cd-sidebar">
            <div>
              <div className="cd-sidebar-title">TunHire Nexus</div>
              <p className="label-uppercase" style={{ fontSize: 10, color: 'var(--on-surface-variant)', marginTop: 6 }}>
                Candidate Portal
              </p>
            </div>
            <nav style={{ display: 'grid', gap: 8 }}>
              <Link href="/dashboard/candidate" className="cd-sidebar-link active">
                Tableau de bord
                <span className="cd-sidebar-dot" />
              </Link>
              <Link href="/dashboard/candidate/applications" className="cd-sidebar-link">
                Mes Candidatures
              </Link>
              <Link href="/jobs" className="cd-sidebar-link">
                Trouver un Job
              </Link>
              <Link href="/dashboard/candidate" className="cd-sidebar-link">
                Profil
              </Link>
              <button type="button" className="cd-sidebar-link" onClick={handleLogout}>
                Deconnexion
              </button>
            </nav>
          </aside>

          <main className="cd-main">
            <header className="sticky top-0 z-30 flex items-center justify-between gap-6 bg-[var(--surface)]/80 px-6 py-4 backdrop-blur-xl shadow-sm shadow-[color-mix(in_srgb,var(--on-surface)_6%,transparent)]">
              <div className="flex w-full max-w-xl items-center">
                <div className="relative w-full">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <circle cx="11" cy="11" r="7" />
                      <line x1="16.65" y1="16.65" x2="21" y2="21" />
                    </svg>
                  </span>
                  <input
                    className="w-full rounded-xl bg-[var(--surface-container-lowest)] py-3 pl-12 pr-4 text-sm text-[var(--on-surface)] placeholder:text-[var(--on-surface-variant)] focus:outline-none focus:ring-2 focus:ring-[var(--secondary-fixed-dim)]/20"
                    placeholder="Rechercher des opportunites..."
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button className="relative rounded-full p-2 text-[var(--on-surface-variant)] transition hover:text-[var(--primary)]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--error)]" />
                </button>
                <button className="rounded-full p-2 text-[var(--on-surface-variant)] transition hover:text-[var(--primary)]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0A1.65 1.65 0 0 0 9 3.09V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0A1.65 1.65 0 0 0 20.91 11H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </button>
                <div className="hidden items-center gap-3 border-l border-[var(--surface-container-high)] pl-4 sm:flex">
                  <div className="text-right">
                    <p className="text-sm font-bold text-[var(--primary)] leading-none">{fullName || 'Profil candidat'}</p>
                    <p className="mt-1 text-[10px] font-medium uppercase tracking-tight text-[var(--on-surface-variant)]">
                      Portail candidat
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-white">
                    {initials}
                  </div>
                </div>
              </div>
            </header>

            <div className="cd-content space-y-8">
              <section
                className="relative overflow-hidden rounded-xl p-8 text-white shadow-2xl shadow-[color-mix(in_srgb,var(--primary)_20%,transparent)]"
                style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)' }}
              >
                <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 opacity-10">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,var(--secondary-fixed-dim),transparent_60%)]" />
                </div>
                <div className="relative grid items-center gap-8 md:grid-cols-2">
                  <div>
                    <h2 className="font-headline text-3xl font-extrabold tracking-tight md:text-4xl">
                      Bienvenue, {firstName || '...'}
                    </h2>
                    <div className="mt-4 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium">
                      <span className="text-[var(--secondary-fixed-dim)]">IA</span>
                      <p>
                        Votre profil est optimise a{' '}
                        <span className="font-bold text-[var(--secondary-fixed-dim)]">{profileScore}%</span>
                      </p>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link
                        href="/jobs"
                        className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-[var(--primary)] transition hover:bg-[var(--secondary-container)]"
                      >
                        Voir les matchs IA
                      </Link>
                      <button
                        type="button"
                        className="rounded-xl border border-white/20 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                      >
                        Partager mon profil
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-white/5 bg-white/5 p-4 text-center backdrop-blur-sm">
                      <p className="font-headline text-3xl font-extrabold text-[var(--secondary-fixed-dim)]">{skills.length}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Competences</p>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-white/5 p-4 text-center backdrop-blur-sm">
                      <p className="font-headline text-3xl font-extrabold text-[var(--tertiary-fixed)]">{experienceLabel}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Experience</p>
                    </div>
                  </div>
                </div>
              </section>

              {loading ? (
                <div className="grid gap-8 lg:grid-cols-12">
                  <div className="space-y-6 lg:col-span-8">
                    <div className="h-40 rounded-xl bg-[var(--surface-container-low)] animate-pulse" />
                    <div className="h-56 rounded-xl bg-[var(--surface-container-low)] animate-pulse" />
                  </div>
                  <div className="space-y-6 lg:col-span-4">
                    <div className="h-52 rounded-xl bg-[var(--surface-container-low)] animate-pulse" />
                    <div className="h-40 rounded-xl bg-[var(--surface-container-low)] animate-pulse" />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                  <div className="space-y-8 lg:col-span-8">
                    {!editMode ? (
                      <div className="rounded-xl bg-[var(--surface-container-lowest)] p-8 transition-all hover:shadow-xl hover:shadow-[color-mix(in_srgb,var(--primary)_5%,transparent)]">
                        <div className="mb-6 flex items-start justify-between">
                          <div>
                            <h3 className="font-headline text-2xl font-bold text-[var(--primary)]">Informations Generales</h3>
                            <p className="text-sm text-[var(--on-surface-variant)]">
                              Gerez votre identite professionnelle et votre disponibilite.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => { setEditMode(true); setProfileMsg('') }}
                            className="flex items-center gap-2 rounded-lg px-4 py-2 text-[var(--primary)] transition hover:bg-[var(--surface-container-low)]"
                          >
                            <IcoEdit />
                            Editer
                          </button>
                        </div>
                        <div className="grid gap-10 md:grid-cols-2">
                          <div className="space-y-6">
                            <div>
                              <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]/60">Biographie</label>
                              {bio ? (
                                <p className="text-[var(--on-surface)] italic">"{bioQuote}"{bioRest ? ` ${bioRest}` : ''}</p>
                              ) : (
                                <p className="text-sm text-[var(--on-surface-variant)]">Aucune information renseignee.</p>
                              )}
                            </div>
                            <div className="flex gap-10">
                              <div>
                                <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]/60">Localisation</label>
                                <div className="flex items-center gap-2 font-bold text-[var(--primary)]">
                                  <IcoPin />
                                  {profile?.location || '—'}
                                </div>
                              </div>
                              <div>
                                <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]/60">Experience</label>
                                <p className="font-bold text-[var(--primary)]">{experienceLabel}</p>
                              </div>
                            </div>
                          </div>
                          <div className="rounded-2xl bg-[var(--surface-container-low)] p-6 flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--secondary-container)] text-[var(--secondary)]">
                              <IcoBriefcase />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]/60">Disponibilite</label>
                              <p className="font-bold text-[var(--primary)]">{availabilityLabel}</p>
                            </div>
                          </div>
                        </div>
                        {profileMsg && (
                          <p className={`mt-4 text-sm ${profileMsg.includes('Erreur') ? 'text-[var(--error)]' : 'text-[var(--secondary)]'}`}>
                            {profileMsg}
                          </p>
                        )}
                      </div>
                    ) : (
                      <form
                        className="rounded-xl bg-[var(--surface-container-lowest)] p-8 shadow-2xl ring-1 ring-[var(--primary)]/10"
                        onSubmit={(e) => { e.preventDefault(); saveProfile() }}
                      >
                        <div className="mb-8 flex items-start justify-between">
                          <h3 className="font-headline text-2xl font-bold text-[var(--primary)]">Modifier le Profil</h3>
                          <button
                            type="button"
                            onClick={() => { setEditMode(false); setProfileMsg('') }}
                            className="rounded-full p-2 hover:bg-[var(--surface-container-high)]"
                          >
                            <IcoX />
                          </button>
                        </div>
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-[var(--on-surface-variant)]">Bio</label>
                            <textarea
                              className="w-full rounded-xl bg-[var(--surface-container-low)] p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                              placeholder="Racontez votre parcours..."
                              value={editForm.bio}
                              onChange={(e) => setEditForm((p) => ({ ...p, bio: e.target.value }))}
                              rows={4}
                            />
                          </div>
                          <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-[var(--on-surface-variant)]">Localisation</label>
                              <input
                                className="w-full rounded-xl bg-[var(--surface-container-low)] p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                                placeholder="Tunis, Sfax..."
                                value={editForm.location}
                                onChange={(e) => setEditForm((p) => ({ ...p, location: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-[var(--on-surface-variant)]">Disponibilite</label>
                              <input
                                type="date"
                                className="w-full rounded-xl bg-[var(--surface-container-low)] p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                                value={editForm.availableFrom}
                                onChange={(e) => setEditForm((p) => ({ ...p, availableFrom: e.target.value }))}
                              />
                            </div>
                          </div>
                          <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-[var(--on-surface-variant)]">Annees d&apos;experience</label>
                              <input
                                type="number"
                                min="0"
                                className="w-full rounded-xl bg-[var(--surface-container-low)] p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                                value={editForm.yearsOfExperience}
                                onChange={(e) => setEditForm((p) => ({ ...p, yearsOfExperience: Number(e.target.value) }))}
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-3 pt-4">
                            <button
                              type="button"
                              onClick={() => { setEditMode(false); setProfileMsg('') }}
                              className="rounded-xl px-6 py-3 text-sm font-bold text-[var(--on-surface-variant)] transition hover:bg-[var(--surface-container-low)]"
                            >
                              Annuler
                            </button>
                            <button
                              type="submit"
                              disabled={savingProfile}
                              className="rounded-xl bg-[var(--primary)] px-8 py-3 text-sm font-bold text-white shadow-lg shadow-[color-mix(in_srgb,var(--primary)_20%,transparent)] transition hover:-translate-y-0.5"
                            >
                              {savingProfile ? 'Enregistrement...' : 'Sauvegarder'}
                            </button>
                          </div>
                          {profileMsg && (
                            <p className={`text-sm ${profileMsg.includes('Erreur') ? 'text-[var(--error)]' : 'text-[var(--secondary)]'}`}>
                              {profileMsg}
                            </p>
                          )}
                        </div>
                      </form>
                    )}

                    <div className="rounded-xl bg-[var(--surface-container-lowest)] p-8">
                      <div className="mb-6 flex items-center justify-between">
                        <h3 className="font-headline text-2xl font-bold text-[var(--primary)]">Expertise & Competences</h3>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">
                          {skills.length} ajoutees
                        </span>
                      </div>
                      <div className="mb-8 flex flex-wrap gap-3">
                        {skills.length === 0 ? (
                          <span className="text-sm text-[var(--on-surface-variant)]">Aucune competence ajoutee.</span>
                        ) : skills.map((skill) => (
                          <div
                            key={skill.id}
                            className="group flex items-center gap-2 rounded-full bg-[var(--primary)]/5 px-4 py-2 font-bold text-[var(--primary)] transition hover:bg-[var(--primary)] hover:text-white"
                          >
                            {skill.skillName}
                            <button
                              type="button"
                              onClick={() => deleteSkill(skill.id)}
                              className="opacity-0 transition group-hover:opacity-100"
                              aria-label="Retirer"
                            >
                              <IcoX />
                            </button>
                          </div>
                        ))}
                      </div>
                      <form
                        onSubmit={(e) => { e.preventDefault(); addSkills() }}
                        className="relative max-w-md"
                      >
                        <input
                          className="w-full rounded-xl bg-[var(--surface-container-low)] py-4 pl-4 pr-32 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                          placeholder="Ajouter une competence..."
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                        />
                        <button
                          type="submit"
                          disabled={addingSkill || !newSkill.trim()}
                          className="absolute right-2 top-2 bottom-2 rounded-lg bg-[var(--primary)] px-6 text-sm font-bold text-white transition hover:bg-[var(--primary-container)] disabled:opacity-60"
                        >
                          {addingSkill ? 'Ajout...' : 'Ajouter'}
                        </button>
                      </form>
                      {skillMsg && (
                        <p className={`mt-3 text-sm ${skillMsg.includes('Erreur') ? 'text-[var(--error)]' : 'text-[var(--secondary)]'}`}>
                          {skillMsg}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-8 lg:col-span-4">
                    <section className="cd-card">
                      <div className="cd-card-head">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, fontWeight: 500, color: 'oklch(18% 0.012 255)' }}>
                          <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 10.5, color: 'oklch(55% 0.010 255)', letterSpacing: '0.08em' }}>02</span>
                          Mon CV
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {cvLoaded && profile?.resumeUrl && (
                            <a
                              href={profile.resumeUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="cd-ghost-btn"
                            >
                              <IcoDownload /> Télécharger
                            </a>
                          )}
                          <button
                            className="cd-dark-btn"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={cvParsing}
                          >
                            <IcoUpload />
                            {cvParsing ? 'Analyse…' : cvLoaded ? 'Remplacer' : 'Importer CV'}
                          </button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf"
                            style={{ display: 'none' }}
                            onChange={e => {
                              const file = e.target.files?.[0]
                              if (file) handleCVFile(file)
                              e.target.value = ''
                            }}
                          />
                        </div>
                      </div>

                      {cvLoaded ? (
                        <div style={{ padding: 22, display: 'grid', gap: 18 }}>
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: 14,
                            padding: 14, borderRadius: 14, background: 'var(--surface-container-low)',
                          }}>
                            <div style={{
                              width: 48, height: 60, background: 'var(--surface-container-lowest)',
                              borderRadius: 8,
                              flexShrink: 0, display: 'grid', placeItems: 'end center',
                              paddingBottom: 6,
                              boxShadow: '0 12px 24px -18px rgba(25,28,30,0.2)',
                            }}>
                              <span style={{
                                fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 9,
                                background: 'var(--secondary)', color: 'white',
                                padding: '2px 4px', borderRadius: 3, letterSpacing: '0.04em',
                              }}>PDF</span>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: 'oklch(18% 0.012 255)', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {cvFileName || 'CV.pdf'}
                              </p>
                              <div style={{ marginTop: 4, fontSize: 12, fontFamily: 'var(--font-geist-mono, monospace)', letterSpacing: '0.04em', color: 'oklch(45% 0.14 150)' }}>
                                ✓ Analysé par l&apos;IA
                              </div>
                            </div>
                          </div>

                          <div style={{ background: 'var(--surface-container-low)', borderRadius: 14, padding: 12 }}>
                            <div style={{
                              padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8,
                              background: 'var(--surface-container-lowest)',
                              borderRadius: 10,
                            }}>
                              <span className="cd-extr-ai-chip">
                                <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--secondary)', transform: 'rotate(45deg)', display: 'inline-block' }} />
                                Extrait par l&apos;IA
                              </span>
                              <span style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>— verifie, modifiable</span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                              <div style={{ padding: '12px 14px', background: 'var(--surface-container-lowest)', borderRadius: 12 }}>
                                <div style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 10.5, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'oklch(55% 0.010 255)', marginBottom: 4 }}>
                                  Années d&apos;expérience
                                </div>
                                <div style={{ fontFamily: 'var(--font-headline), sans-serif', fontSize: 22, lineHeight: 1, letterSpacing: '-0.01em', color: 'var(--primary)' }}>
                                  {profile?.yearsOfExperience ? `${profile.yearsOfExperience} ans` : '—'}
                                </div>
                              </div>
                              <div style={{ padding: '12px 14px', background: 'var(--surface-container-lowest)', borderRadius: 12 }}>
                                <div style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 10.5, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'oklch(55% 0.010 255)', marginBottom: 4 }}>
                                  Localisation
                                </div>
                                <div style={{ fontSize: 14, color: 'var(--primary)', lineHeight: 1.4 }}>
                                  {profile?.location || '—'}
                                </div>
                              </div>
                              {langs && (
                                <div style={{ padding: '12px 14px', background: 'var(--surface-container-lowest)', borderRadius: 12, gridColumn: '1 / -1' }}>
                                  <div style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 10.5, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'oklch(55% 0.010 255)', marginBottom: 4 }}>
                                    Langues
                                  </div>
                                  <div style={{ fontSize: 14, color: 'var(--primary)', lineHeight: 1.4 }}>
                                    {langs}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {cvMsg && (
                            <p style={{ fontSize: 12.5, color: cvMsg.includes('Erreur') ? 'oklch(58% 0.16 25)' : 'oklch(45% 0.13 150)' }}>
                              {cvMsg}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div style={{ padding: 26 }}>
                          <div
                            className="cd-dropzone"
                            onDragOver={e => e.preventDefault()}
                            onDrop={e => {
                              e.preventDefault()
                              const file = e.dataTransfer.files[0]
                              if (file) handleCVFile(file)
                            }}
                          >
                            <div style={{
                              width: 46, height: 46, borderRadius: 14, margin: '0 auto 14px',
                              display: 'grid', placeItems: 'center',
                              background: '#fff', border: '1px solid oklch(91% 0.008 90)',
                              color: 'oklch(28% 0.07 200)',
                            }}>
                              <IcoFile />
                            </div>
                            <div style={{ fontSize: 15, fontWeight: 500, color: 'oklch(18% 0.012 255)' }}>
                              Importer votre CV
                            </div>
                            <div style={{ marginTop: 4, fontSize: 12.5, color: 'oklch(55% 0.010 255)' }}>
                              Glissez un fichier PDF, ou cliquez sur le bouton ci-dessus
                            </div>
                            {cvMsg && (
                              <p style={{ marginTop: 10, fontSize: 12.5, color: cvMsg.includes('Erreur') ? 'oklch(58% 0.16 25)' : 'oklch(45% 0.13 150)' }}>
                                {cvMsg}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </section>

                    <div className="relative overflow-hidden rounded-xl bg-[var(--secondary)] p-8 text-white">
                      <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                      <h3 className="mb-4 flex items-center gap-2 font-headline text-xl font-bold">
                        Nexus Insight
                      </h3>
                      <p className="mb-6 text-sm leading-relaxed opacity-90">{insightLine}</p>
                      <Link
                        href="/jobs"
                        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition hover:gap-3"
                      >
                        Voir le rapport detaille
                        <span className="text-sm">→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
