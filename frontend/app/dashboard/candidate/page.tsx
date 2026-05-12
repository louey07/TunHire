'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { getToken, getUser } from '@/lib/auth'
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
.cd-page { background: #f7f4ee; min-height: 100vh; }
.cd-subnav {
  background: #15191f;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.cd-subnav-inner {
  max-width: 1280px; margin: 0 auto; padding: 0 28px;
  display: flex; gap: 4px;
}
.cd-tab {
  color: rgba(255,255,255,0.55);
  padding: 10px 12px; border-radius: 8px;
  font-size: 13.5px; text-decoration: none;
  display: inline-flex; align-items: center; gap: 8px;
  transition: background .15s ease, color .15s ease;
}
.cd-tab:hover { color: rgba(255,255,255,0.85); background: rgba(255,255,255,0.05) }
.cd-tab.active { color: rgba(255,255,255,0.95); background: rgba(255,255,255,0.07) }
.cd-content { max-width: 1280px; margin: 0 auto; padding: 36px 28px 80px; }
.cd-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1.4fr);
  gap: 24px;
  align-items: start;
}
.cd-col-right { display: grid; gap: 24px; }
.cd-card {
  background: #fff;
  border: 1px solid oklch(91% 0.008 90);
  border-radius: 16px;
  box-shadow: 0 1px 0 oklch(0% 0 0 / 0.02), 0 12px 32px -24px oklch(0% 0 0 / 0.12);
  overflow: hidden;
}
.cd-card-head {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 18px 22px;
  border-bottom: 1px solid oklch(91% 0.008 90);
}
.cd-ghost-btn {
  background: transparent;
  border: 1px solid oklch(85% 0.010 90);
  color: oklch(18% 0.012 255);
  padding: 7px 12px; border-radius: 9px; font-size: 12.5px; cursor: pointer;
  display: inline-flex; align-items: center; gap: 6px;
  transition: background .15s ease, border-color .15s ease;
  font-family: inherit;
  text-decoration: none;
}
.cd-ghost-btn:hover { background: #efeae0; border-color: oklch(55% 0.010 255) }
.cd-dark-btn {
  background: oklch(18% 0.012 255); color: white;
  border: 1px solid oklch(18% 0.012 255);
  padding: 7px 12px; border-radius: 9px; font-size: 12.5px; cursor: pointer;
  display: inline-flex; align-items: center; gap: 6px;
  transition: background .15s ease;
  font-family: inherit;
}
.cd-dark-btn:hover { background: oklch(28% 0.012 255) }
.cd-dark-btn:disabled { opacity: 0.6; cursor: default }
.cd-cover {
  height: 96px;
  background:
    radial-gradient(circle at 80% 30%, oklch(75% 0.10 195 / 0.55), transparent 55%),
    linear-gradient(180deg, oklch(88% 0.055 195), oklch(94% 0.035 195) 70%);
}
.cd-profile-body { padding: 0 26px 24px; margin-top: -42px; position: relative; }
.cd-avatar-big {
  width: 84px; height: 84px; border-radius: 22px;
  background: linear-gradient(135deg, oklch(80% 0.09 195), oklch(50% 0.13 240));
  color: white; display: grid; place-items: center;
  font-family: var(--font-instrument-serif, "Times New Roman"), serif;
  font-size: 36px; line-height: 1;
  border: 4px solid #fff;
  box-shadow: 0 4px 14px -6px oklch(0% 0 0 / 0.25);
}
.cd-meta-line {
  margin-top: 16px; display: flex; flex-wrap: wrap; gap: 18px;
  font-size: 13px; color: oklch(34% 0.012 255);
}
.cd-meta-item { display: inline-flex; align-items: center; gap: 7px }
.cd-meta-item svg { color: oklch(55% 0.010 255) }
.cd-bio {
  margin-top: 18px; padding-top: 18px;
  border-top: 1px dashed oklch(85% 0.010 90);
  font-size: 14px; line-height: 1.6; color: oklch(34% 0.012 255);
}
.cd-bio-quote {
  font-family: var(--font-instrument-serif, "Times New Roman"), serif;
  font-style: italic; font-size: 18px;
  color: oklch(18% 0.012 255); line-height: 1.35; margin: 0 0 10px;
}
.cd-skill-tag {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 7px 6px 7px 13px;
  background: oklch(94% 0.035 195);
  color: oklch(28% 0.07 200);
  border: 1px solid oklch(82% 0.06 195);
  border-radius: 999px;
  font-size: 13px; font-weight: 500; letter-spacing: -0.005em;
}
.cd-skill-x {
  width: 18px; height: 18px; border-radius: 999px;
  display: grid; place-items: center;
  background: transparent; border: 0; color: oklch(28% 0.07 200);
  cursor: pointer; padding: 0;
  transition: background .15s ease, color .15s ease;
}
.cd-skill-x:hover { background: #1FA39F; color: white }
.cd-add-input {
  width: 100%; border: 1px solid oklch(85% 0.010 90);
  border-radius: 10px; padding: 11px 12px 11px 36px;
  font-size: 13.5px; color: oklch(18% 0.012 255);
  background: #fff; outline: none; font-family: inherit;
  transition: border-color .15s ease, box-shadow .15s ease;
}
.cd-add-input:focus { border-color: #1FA39F; box-shadow: 0 0 0 4px oklch(94% 0.035 195) }
.cd-add-btn {
  background: #1FA39F; color: white; border: 0;
  padding: 0 16px; border-radius: 10px; font-size: 13px; font-weight: 500;
  display: inline-flex; align-items: center; gap: 6px;
  cursor: pointer; white-space: nowrap; font-family: inherit;
  transition: background .15s ease;
}
.cd-add-btn:hover { background: oklch(55% 0.13 195) }
.cd-add-btn:disabled { opacity: 0.6; cursor: default }
.cd-dropzone {
  border: 1.5px dashed oklch(85% 0.010 90);
  border-radius: 14px; padding: 26px;
  background: #f7f4ee; text-align: center;
  transition: border-color .15s ease, background .15s ease;
}
.cd-dropzone:hover { border-color: #1FA39F; background: oklch(96% 0.025 195 / 0.5) }
.cd-extr-ai-chip {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: var(--font-geist-mono, monospace); font-size: 10.5px;
  letter-spacing: 0.08em; text-transform: uppercase;
  color: oklch(28% 0.07 200);
  padding: 4px 8px; border: 1px solid #1FA39F; border-radius: 999px;
  background: white;
}
.cd-edit-input {
  width: 100%; border: 1px solid oklch(85% 0.010 90); border-radius: 10px;
  padding: 10px 12px; font-size: 13px; color: oklch(18% 0.012 255);
  background: #fff; outline: none; font-family: inherit;
  transition: border-color .15s ease;
}
.cd-edit-input:focus { border-color: #1FA39F }
.cd-save-btn {
  background: oklch(18% 0.012 255); color: white; border: 0;
  padding: 9px 16px; border-radius: 10px; font-size: 13px; font-weight: 500;
  cursor: pointer; font-family: inherit;
  transition: background .15s ease;
}
.cd-save-btn:hover { background: oklch(28% 0.012 255) }
.cd-save-btn:disabled { opacity: 0.6; cursor: default }
.cd-cancel-btn {
  background: transparent; border: 1px solid oklch(85% 0.010 90);
  color: oklch(18% 0.012 255); padding: 9px 16px; border-radius: 10px;
  font-size: 13px; cursor: pointer; font-family: inherit;
}
.cd-cancel-btn:hover { background: #f7f4ee }
@media (max-width: 1000px) {
  .cd-grid { grid-template-columns: 1fr }
}
@media (max-width: 640px) {
  .cd-content { padding: 22px 16px 60px }
  .cd-subnav-inner { padding: 0 16px }
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
  const [editForm, setEditForm] = useState({ bio: '', location: '', yearsOfExperience: 0 })
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')

  const [newSkill, setNewSkill] = useState('')
  const [addingSkill, setAddingSkill] = useState(false)
  const [skillMsg, setSkillMsg] = useState('')

  const [cvParsing, setCvParsing] = useState(false)
  const [cvMsg, setCvMsg] = useState('')

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
      await apiPut('/candidates/me', editForm)
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

  // For bio display: first sentence as italic quote, rest as body
  const bio = profile?.bio || ''
  const dotIdx = bio.indexOf('.')
  const bioQuote = dotIdx > 0 ? bio.slice(0, dotIdx + 1) : bio
  const bioRest = dotIdx > 0 ? bio.slice(dotIdx + 1).trim() : ''

  return (
    <>
      <style>{PAGE_CSS}</style>
      <div className="cd-page">
        <Navbar />

        {/* Sub-nav tab strip */}
        <div className="cd-subnav">
          <div className="cd-subnav-inner">
            <Link href="/dashboard/candidate" className="cd-tab active">
              <span style={{ width: 5, height: 5, borderRadius: 999, background: '#1FA39F', display: 'inline-block' }} />
              Mon profil
            </Link>
            <Link href="/jobs" className="cd-tab">Offres</Link>
            <Link href="/dashboard/candidate/applications" className="cd-tab">Candidatures</Link>
          </div>
        </div>

        <div className="cd-content">

          {/* Page header */}
          <div style={{ marginBottom: 28 }}>
            <div style={{
              display: 'flex', gap: 14, alignItems: 'center',
              color: 'oklch(55% 0.010 255)',
              fontSize: 12.5, fontFamily: 'var(--font-geist-mono, monospace)',
              letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 14,
            }}>
              <span>Espace candidat</span>
              <span style={{ width: 4, height: 4, borderRadius: 999, background: 'oklch(72% 0.010 255)', display: 'inline-block' }} />
              <span>Mon profil</span>
            </div>
            <h1 style={{
              margin: 0,
              fontFamily: 'var(--font-instrument-serif, "Times New Roman"), serif',
              fontWeight: 400,
              fontSize: 'clamp(40px, 4.4vw, 56px)',
              lineHeight: 1,
              letterSpacing: '-0.015em',
              color: 'oklch(18% 0.012 255)',
            }}>
              Bonjour,{' '}
              <em style={{ fontStyle: 'italic', color: 'oklch(28% 0.07 200)' }}>
                {firstName || '…'}
              </em>
            </h1>
          </div>

          {loading ? (
            <p style={{ color: 'oklch(55% 0.010 255)', fontSize: 14 }}>Chargement…</p>
          ) : (
            <div className="cd-grid">

              {/* ══════════ LEFT: PROFILE CARD ══════════ */}
              <section className="cd-card">
                <div className="cd-cover" />

                <div className="cd-profile-body">
                  {/* Top row: avatar + edit button */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
                    <div className="cd-avatar-big">{initials[0]}</div>
                    {!editMode && (
                      <button
                        className="cd-ghost-btn"
                        onClick={() => { setEditMode(true); setProfileMsg('') }}
                      >
                        <IcoEdit /> Éditer le profil
                      </button>
                    )}
                  </div>

                  {/* Name */}
                  <div style={{
                    marginTop: 16,
                    fontFamily: 'var(--font-instrument-serif, "Times New Roman"), serif',
                    fontWeight: 400, fontSize: 38, lineHeight: 1,
                    letterSpacing: '-0.015em', color: 'oklch(18% 0.012 255)',
                  }}>
                    {fullName || '—'}
                  </div>

                  {!editMode ? (
                    <>
                      {/* Meta */}
                      {(profile?.location || (profile?.yearsOfExperience != null && profile.yearsOfExperience > 0)) && (
                        <div className="cd-meta-line">
                          {profile?.location && (
                            <span className="cd-meta-item">
                              <IcoPin />
                              <b style={{ color: 'oklch(18% 0.012 255)', fontWeight: 500 }}>{profile.location}</b>
                            </span>
                          )}
                          {profile?.yearsOfExperience != null && profile.yearsOfExperience > 0 && (
                            <span className="cd-meta-item">
                              <IcoBriefcase />
                              <b style={{ color: 'oklch(18% 0.012 255)', fontWeight: 500 }}>
                                {profile.yearsOfExperience} an{profile.yearsOfExperience > 1 ? 's' : ''}
                              </b>
                              <span>d&apos;expérience</span>
                            </span>
                          )}
                        </div>
                      )}

                      {/* Bio */}
                      {bio ? (
                        <div className="cd-bio">
                          <p className="cd-bio-quote">« {bioQuote} »</p>
                          {bioRest && <span>{bioRest}</span>}
                        </div>
                      ) : (
                        <p style={{ marginTop: 16, fontSize: 13, color: 'oklch(55% 0.010 255)' }}>
                          Aucune information renseignée.
                        </p>
                      )}

                      {profileMsg && (
                        <p style={{
                          marginTop: 12, fontSize: 12.5,
                          color: profileMsg.includes('Erreur') ? 'oklch(58% 0.16 25)' : 'oklch(45% 0.13 150)',
                        }}>
                          {profileMsg}
                        </p>
                      )}
                    </>
                  ) : (
                    /* ── Inline edit form ── */
                    <div style={{ marginTop: 18, display: 'grid', gap: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'oklch(18% 0.012 255)', marginBottom: 5 }}>Bio</label>
                        <textarea
                          className="cd-edit-input"
                          value={editForm.bio}
                          onChange={e => setEditForm(p => ({ ...p, bio: e.target.value }))}
                          rows={4}
                          style={{ resize: 'vertical' }}
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'oklch(18% 0.012 255)', marginBottom: 5 }}>Localisation</label>
                          <input
                            className="cd-edit-input"
                            value={editForm.location}
                            onChange={e => setEditForm(p => ({ ...p, location: e.target.value }))}
                            placeholder="Tunis, Sfax…"
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'oklch(18% 0.012 255)', marginBottom: 5 }}>
                            Années d&apos;expérience
                          </label>
                          <input
                            className="cd-edit-input"
                            type="number" min="0"
                            value={editForm.yearsOfExperience}
                            onChange={e => setEditForm(p => ({ ...p, yearsOfExperience: Number(e.target.value) }))}
                          />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                        <button className="cd-save-btn" onClick={saveProfile} disabled={savingProfile}>
                          {savingProfile ? 'Enregistrement…' : 'Enregistrer'}
                        </button>
                        <button className="cd-cancel-btn" onClick={() => { setEditMode(false); setProfileMsg('') }}>
                          Annuler
                        </button>
                      </div>
                      {profileMsg && (
                        <p style={{ fontSize: 12.5, color: profileMsg.includes('Erreur') ? 'oklch(58% 0.16 25)' : 'oklch(45% 0.13 150)' }}>
                          {profileMsg}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </section>

              {/* ══════════ RIGHT COLUMN ══════════ */}
              <div className="cd-col-right">

                {/* ── CV CARD ── */}
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
                    /* ── Loaded state ── */
                    <div style={{ padding: 22, display: 'grid', gap: 18 }}>
                      {/* File row */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: 14, border: '1px solid oklch(91% 0.008 90)',
                        borderRadius: 12, background: '#f7f4ee',
                      }}>
                        {/* PDF thumbnail */}
                        <div style={{
                          width: 48, height: 60, background: 'white',
                          border: '1px solid oklch(85% 0.010 90)', borderRadius: 6,
                          flexShrink: 0, display: 'grid', placeItems: 'end center',
                          paddingBottom: 6,
                        }}>
                          <span style={{
                            fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 9,
                            background: 'oklch(58% 0.16 25)', color: 'white',
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

                      {/* Extracted section */}
                      <div style={{ border: '1px solid oklch(91% 0.008 90)', borderRadius: 12, overflow: 'hidden' }}>
                        <div style={{
                          padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8,
                          background: 'linear-gradient(180deg, oklch(96% 0.02 195 / 0.55), transparent)',
                          borderBottom: '1px solid oklch(91% 0.008 90)',
                        }}>
                          <span className="cd-extr-ai-chip">
                            <span style={{ width: 8, height: 8, borderRadius: 2, background: '#1FA39F', transform: 'rotate(45deg)', display: 'inline-block' }} />
                            Extrait par l&apos;IA
                          </span>
                          <span style={{ fontSize: 13, color: 'oklch(34% 0.012 255)' }}>— vérifié, modifiable</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                          <div style={{ padding: '14px 16px', borderTop: '1px solid oklch(91% 0.008 90)', borderRight: '1px solid oklch(91% 0.008 90)' }}>
                            <div style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 10.5, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'oklch(55% 0.010 255)', marginBottom: 4 }}>
                              Années d&apos;expérience
                            </div>
                            <div style={{ fontFamily: 'var(--font-instrument-serif, "Times New Roman"), serif', fontSize: 22, lineHeight: 1, letterSpacing: '-0.005em', color: 'oklch(18% 0.012 255)' }}>
                              {profile?.yearsOfExperience ? `${profile.yearsOfExperience} ans` : '—'}
                            </div>
                          </div>
                          <div style={{ padding: '14px 16px', borderTop: '1px solid oklch(91% 0.008 90)' }}>
                            <div style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 10.5, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'oklch(55% 0.010 255)', marginBottom: 4 }}>
                              Localisation
                            </div>
                            <div style={{ fontSize: 14, color: 'oklch(18% 0.012 255)', lineHeight: 1.4 }}>
                              {profile?.location || '—'}
                            </div>
                          </div>
                          {langs && (
                            <div style={{ padding: '14px 16px', borderTop: '1px solid oklch(91% 0.008 90)', gridColumn: '1 / -1' }}>
                              <div style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 10.5, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'oklch(55% 0.010 255)', marginBottom: 4 }}>
                                Langues
                              </div>
                              <div style={{ fontSize: 14, color: 'oklch(18% 0.012 255)', lineHeight: 1.4 }}>
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
                    /* ── Empty / dropzone state ── */
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

                {/* ── SKILLS CARD ── */}
                <section className="cd-card">
                  <div className="cd-card-head">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, fontWeight: 500, color: 'oklch(18% 0.012 255)' }}>
                      <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 10.5, color: 'oklch(55% 0.010 255)', letterSpacing: '0.08em' }}>03</span>
                      Compétences
                    </div>
                    <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, color: 'oklch(55% 0.010 255)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      {skills.length} ajoutées
                    </span>
                  </div>

                  <div style={{ padding: '20px 22px 22px' }}>
                    {/* Skill tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', minHeight: 36 }}>
                      {skills.length === 0 ? (
                        <span style={{ fontSize: 13, color: 'oklch(55% 0.010 255)' }}>Aucune compétence ajoutée.</span>
                      ) : skills.map(skill => (
                        <span key={skill.id} className="cd-skill-tag">
                          {skill.skillName}
                          <button
                            className="cd-skill-x"
                            onClick={() => deleteSkill(skill.id)}
                            aria-label="Retirer"
                          >
                            <IcoX />
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Add input */}
                    <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px dashed oklch(85% 0.010 90)' }}>
                      <form
                        onSubmit={e => { e.preventDefault(); addSkills() }}
                        style={{ display: 'flex', gap: 8 }}
                      >
                        <div style={{ flex: 1, position: 'relative' }}>
                          <svg
                            viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'oklch(55% 0.010 255)' }}
                          >
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          <input
                            className="cd-add-input"
                            value={newSkill}
                            onChange={e => setNewSkill(e.target.value)}
                            placeholder="Ajouter une compétence — ex. Kubernetes, Python…"
                          />
                        </div>
                        <button
                          type="submit"
                          className="cd-add-btn"
                          disabled={addingSkill || !newSkill.trim()}
                        >
                          <IcoPlus />
                          {addingSkill ? 'Ajout…' : 'Ajouter'}
                        </button>
                      </form>
                      <div style={{ marginTop: 10, fontSize: 11.5, color: 'oklch(55% 0.010 255)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <kbd style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 10, padding: '1px 5px', background: '#f7f4ee', border: '1px solid oklch(91% 0.008 90)', borderRadius: 4 }}>↵</kbd>
                        pour valider,
                        <kbd style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 10, padding: '1px 5px', background: '#f7f4ee', border: '1px solid oklch(91% 0.008 90)', borderRadius: 4 }}>,</kbd>
                        pour séparer plusieurs compétences.
                      </div>
                      {skillMsg && (
                        <p style={{ marginTop: 8, fontSize: 12.5, color: skillMsg.includes('Erreur') ? 'oklch(58% 0.16 25)' : 'oklch(45% 0.13 150)' }}>
                          {skillMsg}
                        </p>
                      )}
                    </div>
                  </div>
                </section>

              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
