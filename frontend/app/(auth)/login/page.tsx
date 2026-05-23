'use client'

import { useRef, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

type Role = 'CANDIDATE' | 'RECRUITER'
type View = 'login' | 'register'

const API = 'http://localhost:8081'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const msgTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [view, setView] = useState<View>(() =>
    searchParams.get('view') === 'register' ? 'register' : 'login'
  )
  const [role, setRole] = useState<Role>('CANDIDATE')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  function showMsg(type: 'error' | 'success', text: string) {
    if (msgTimer.current) clearTimeout(msgTimer.current)
    setMessage({ type, text })
    msgTimer.current = setTimeout(() => setMessage(null), 4000)
  }

  function clearFieldError(field: string) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  function switchView(next: View) {
    setView(next)
    setMessage(null)
    setFieldErrors({})
    if (msgTimer.current) clearTimeout(msgTimer.current)
    setEmail('')
    setPassword('')
    setFirstName('')
    setLastName('')
    setShowPassword(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)

    if (view === 'register') {
      const errs: Record<string, string> = {}
      if (!firstName.trim()) errs.firstName = 'Ce champ est requis'
      if (!lastName.trim()) errs.lastName = 'Ce champ est requis'
      if (!email.trim()) errs.email = 'Ce champ est requis'
      if (!password) errs.password = 'Ce champ est requis'
      else if (password.length < 8) errs.password = 'Au moins 8 caractères'

      if (Object.keys(errs).length > 0) {
        setFieldErrors(errs)
        if (errs.password === 'Au moins 8 caractères') {
          showMsg('error', 'Le mot de passe doit contenir au moins 8 caractères.')
        }
        return
      }
    }

    setFieldErrors({})
    setLoading(true)

    try {
      const endpoint = view === 'login' ? '/auth/login' : '/auth/register'
      const body =
        view === 'login'
          ? { email, password }
          : { email, password, firstName, lastName, phone: '', role }

      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        if (view === 'login') {
          showMsg('error', 'Email ou mot de passe incorrect.')
        } else if (
          res.status === 409 ||
          data.message?.toLowerCase().includes('exist') ||
          data.message?.toLowerCase().includes('already')
        ) {
          showMsg('error', 'Cet email est déjà utilisé. Essayez de vous connecter.')
        } else {
          showMsg('error', 'Erreur de connexion. Vérifiez que le serveur est démarré.')
        }
        return
      }

      const { token, user } = data.data

      if (view === 'login' && user.role !== role) {
        if (role === 'CANDIDATE') {
          showMsg('error', 'Ce compte est un compte Recruteur. Veuillez sélectionner la carte Recruteur.')
        } else {
          showMsg('error', 'Ce compte est un compte Candidat. Veuillez sélectionner la carte Candidat.')
        }
        return
      }

      localStorage.setItem('tunhire_token', token)
      localStorage.setItem('tunhire_user', JSON.stringify(user))
      document.cookie = `tunhire_token=${token}; path=/; max-age=86400; SameSite=Lax`

      if (view === 'register') {
        const successText =
          user.role === 'RECRUITER'
            ? 'Compte recruteur créé. Vous pouvez maintenant créer votre entreprise.'
            : 'Compte candidat créé. Bienvenue sur TunHire.'
        showMsg('success', successText)
        setTimeout(() => {
          router.push(user.role === 'RECRUITER' ? '/dashboard/recruiter' : '/dashboard/candidate')
        }, 2000)
        return
      }

      router.push(user.role === 'RECRUITER' ? '/dashboard/recruiter' : '/dashboard/candidate')
    } catch {
      showMsg('error', 'Serveur indisponible. Vérifiez que le backend est démarré.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--on-surface)]">
      <main className="relative flex min-h-screen flex-col overflow-hidden lg:flex-row">
        <section className="relative hidden items-end overflow-hidden bg-[var(--primary)] px-16 py-20 lg:flex lg:w-[52%]">
          <div className="absolute inset-0">
            <img
              alt="Equipe tunisienne dans un hub tech moderne"
              className="h-full w-full object-cover opacity-70"
              src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80"
            />
            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,30,64,1),rgba(0,30,64,0.7),transparent)]" />
          </div>
          <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-[color:var(--secondary-bright)] opacity-20 blur-3xl" />
          <div className="absolute -right-20 top-10 h-80 w-80 rounded-full bg-[color:var(--tertiary)] opacity-[0.15] blur-3xl" />

          <div className="relative z-10 max-w-xl">
            <span className="label-uppercase text-[10px] font-bold text-[var(--secondary-bright)]">
              Intelligence & excellence locale
            </span>
            <h1 className="mt-6 font-headline text-5xl font-extrabold leading-tight text-white">
              Le hub premium du recrutement tunisien,
              <span className="block text-[var(--secondary-bright)]">orchestré par l'IA.</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-white/75">
              Rejoignez un écosystème éditorial où chaque profil est évalué avec précision, éthique et ambition.
            </p>
            <div className="mt-10 flex items-center gap-6">
              <div className="flex -space-x-3">
                <img
                  alt="Talent tech"
                  className="h-10 w-10 rounded-full border-2 border-[var(--primary)] object-cover"
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
                />
                <img
                  alt="Recruteuse"
                  className="h-10 w-10 rounded-full border-2 border-[var(--primary)] object-cover"
                  src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80"
                />
                <img
                  alt="Equipe IA"
                  className="h-10 w-10 rounded-full border-2 border-[var(--primary)] object-cover"
                  src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=200&q=80"
                />
              </div>
              <p className="text-sm font-medium text-white/70">
                5 000+ talents et recruteurs premium.
              </p>
            </div>
          </div>
        </section>

        <section className="relative flex flex-1 items-center justify-center px-6 py-16 sm:px-12 lg:px-16">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(0,218,243,0.12),_transparent_55%)]" />
          <div className="w-full max-w-xl">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--primary)] text-white">
                  TH
                </div>
                <div>
                  <p className="text-lg font-black text-[var(--primary)]">TunHire</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--on-surface-variant)]">
                    Cognitive architect
                  </p>
                </div>
              </div>
              <span className="label-uppercase text-[10px] font-bold text-[var(--secondary)]">
                Acces securise
              </span>
            </div>

            <div className="mt-10 rounded-[2.5rem] bg-[var(--surface-container-lowest)] p-8 editorial-shadow sm:p-10">
              <span className="label-uppercase text-[10px] font-bold text-[var(--secondary)]">
                {view === 'login' ? 'Connexion' : 'Inscription'}
              </span>
              <h1 className="mt-4 font-headline text-3xl font-extrabold text-[var(--primary)] sm:text-4xl">
                {view === 'login'
                  ? 'Heureux de vous revoir.'
                  : 'Creez votre presence sur TunHire.'}
              </h1>
              <p className="mt-3 text-sm text-[var(--on-surface-variant)]">
                {view === 'login'
                  ? 'Accedez a votre tableau de bord, suivez vos opportunites et vos scores IA.'
                  : 'Un espace editorial pour valoriser votre parcours et activer les bons signaux IA.'}
              </p>

              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {(['CANDIDATE', 'RECRUITER'] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={[
                      'group relative overflow-hidden rounded-2xl p-4 text-left transition-all',
                      role === r
                        ? 'bg-[var(--primary)] text-white'
                        : 'bg-[var(--surface-container-low)] text-[var(--primary)]',
                      'soft-outline hover:-translate-y-0.5',
                    ].join(' ')}
                  >
                    <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-[color:var(--secondary-bright)] opacity-20 blur-2xl" />
                    <span className="text-2xl">{r === 'CANDIDATE' ? '👤' : '🏢'}</span>
                    <p className="mt-3 text-sm font-semibold">
                      {r === 'CANDIDATE' ? 'Candidat' : 'Recruteur'}
                    </p>
                    <p className={role === r ? 'text-xs text-white/70' : 'text-xs text-[var(--on-surface-variant)]'}>
                      {r === 'CANDIDATE' ? 'Je cherche un emploi' : 'Je recrute des talents'}
                    </p>
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
                {view === 'register' && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--on-surface-variant)]">
                        Prenom
                      </label>
                      <div className="group relative mt-2">
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => {
                            setFirstName(e.target.value)
                            clearFieldError('firstName')
                          }}
                          placeholder="Prenom"
                          className="h-14 w-full rounded-2xl bg-[var(--surface-container-lowest)] px-5 text-sm font-medium text-[var(--on-surface)] placeholder:text-[var(--on-surface-variant)] focus:outline-none"
                        />
                        <div className="pointer-events-none absolute inset-0 rounded-2xl soft-outline transition-all group-focus-within:ring-2 group-focus-within:ring-[color:var(--secondary)] group-focus-within:ring-opacity-25" />
                      </div>
                      {fieldErrors.firstName && (
                        <p className="mt-1 text-[11px] text-[#ba1a1a]">{fieldErrors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--on-surface-variant)]">
                        Nom
                      </label>
                      <div className="group relative mt-2">
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => {
                            setLastName(e.target.value)
                            clearFieldError('lastName')
                          }}
                          placeholder="Nom"
                          className="h-14 w-full rounded-2xl bg-[var(--surface-container-lowest)] px-5 text-sm font-medium text-[var(--on-surface)] placeholder:text-[var(--on-surface-variant)] focus:outline-none"
                        />
                        <div className="pointer-events-none absolute inset-0 rounded-2xl soft-outline transition-all group-focus-within:ring-2 group-focus-within:ring-[color:var(--secondary)] group-focus-within:ring-opacity-25" />
                      </div>
                      {fieldErrors.lastName && (
                        <p className="mt-1 text-[11px] text-[#ba1a1a]">{fieldErrors.lastName}</p>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--on-surface-variant)]">
                    Email
                  </label>
                  <div className="group relative mt-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        clearFieldError('email')
                      }}
                      placeholder="nom@exemple.tn"
                      className="h-14 w-full rounded-2xl bg-[var(--surface-container-lowest)] px-5 text-sm font-medium text-[var(--on-surface)] placeholder:text-[var(--on-surface-variant)] focus:outline-none"
                    />
                    <div className="pointer-events-none absolute inset-0 rounded-2xl soft-outline transition-all group-focus-within:ring-2 group-focus-within:ring-[color:var(--secondary)] group-focus-within:ring-opacity-25" />
                  </div>
                  {fieldErrors.email && (
                    <p className="mt-1 text-[11px] text-[#ba1a1a]">{fieldErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--on-surface-variant)]">
                    Mot de passe
                  </label>
                  <div className="group relative mt-2">
                    <div className="flex h-14 items-center gap-3 rounded-2xl bg-[var(--surface-container-lowest)] px-5">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          clearFieldError('password')
                        }}
                        placeholder="••••••••"
                        className="flex-1 bg-transparent text-sm font-medium text-[var(--on-surface)] placeholder:text-[var(--on-surface-variant)] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--secondary)]"
                      >
                        {showPassword ? 'Masquer' : 'Afficher'}
                      </button>
                    </div>
                    <div className="pointer-events-none absolute inset-0 rounded-2xl soft-outline transition-all group-focus-within:ring-2 group-focus-within:ring-[color:var(--secondary)] group-focus-within:ring-opacity-25" />
                  </div>
                  {fieldErrors.password && (
                    <p className="mt-1 text-[11px] text-[#ba1a1a]">{fieldErrors.password}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 h-14 rounded-2xl bg-[var(--primary)] text-sm font-semibold text-[var(--on-primary)] shadow-lg transition-transform hover:-translate-y-0.5 disabled:opacity-60"
                >
                  {loading
                    ? view === 'login'
                      ? 'Connexion...'
                      : 'Creation...'
                    : view === 'login'
                      ? 'Se connecter'
                      : 'Creer mon compte'}
                </button>
              </form>

              {message && (
                <div
                  className={`mt-5 rounded-2xl px-4 py-3 text-[13px] ${
                    message.type === 'error'
                      ? 'bg-[#ffdad6] text-[#93000a]'
                      : 'bg-[#d5e3ff] text-[var(--primary)]'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <p className="mt-6 text-center text-[13px] text-[var(--on-surface-variant)]">
                {view === 'login' ? (
                  <>
                    Pas encore de compte ?{' '}
                    <button
                      type="button"
                      onClick={() => switchView('register')}
                      className="font-semibold text-[var(--primary)] hover:underline"
                    >
                      Creer un compte
                    </button>
                  </>
                ) : (
                  <>
                    Deja un compte ?{' '}
                    <button
                      type="button"
                      onClick={() => switchView('login')}
                      className="font-semibold text-[var(--primary)] hover:underline"
                    >
                      Se connecter
                    </button>
                  </>
                )}
              </p>
            </div>

            <p className="mt-6 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--on-surface-variant)]">
              © 2026 TunHire. Excellence IA pour le recrutement tunisien.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--surface)] flex items-center justify-center text-[var(--on-surface-variant)] text-sm">
        Chargement...
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
