'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

type Role = 'CANDIDATE' | 'RECRUITER'
type View = 'login' | 'register'

const API = 'http://localhost:8081'

export default function LoginPage() {
  const router = useRouter()
  const msgTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [view, setView] = useState<View>('login')
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
    <div className="flex h-screen overflow-hidden">
      {/* ── Left branding panel ── */}
      <div className="relative hidden lg:flex w-1/2 flex-col bg-[#efeae0] overflow-hidden p-14">
        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
              <rect width="36" height="36" rx="9" fill="#15191f"/>
              <path d="M8 8H28V13H21V28H15V13H8V8Z" fill="#ffffff"/>
            </svg>
          <span
            className="text-[#15191f] font-semibold leading-none"
            style={{ fontFamily: 'Georgia, serif', fontSize: '26px' }}
          >
            TunHire
          </span>
        </div>

        {/* Tagline */}
        <div className="relative z-10 mt-auto mb-20">
          <p
            className="text-[#15191f] leading-[1.05]"
            style={{ fontFamily: 'Georgia, serif', fontSize: '80px', fontStyle: 'italic' }}
          >
            Le talent
          </p>
          <p
            className="text-[#15191f] leading-[1.05]"
            style={{ fontFamily: 'Georgia, serif', fontSize: '80px' }}
          >
            tunisien.
          </p>
        </div>

        {/* Decorative teal circle */}
        <div
          className="absolute rounded-full bg-[#1FA39F] pointer-events-none"
          style={{
            width: '560px',
            height: '560px',
            bottom: '-100px',
            right: '-140px',
            opacity: 0.18,
          }}
        />
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 items-center justify-center bg-[#f7f4ee] p-8">
        <div className="w-full max-w-[400px]">
          {/* Mobile-only logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <svg width="32" height="32" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="36" height="36" rx="9" fill="#15191f"/>
              <path d="M8 8H28V13H21V28H15V13H8V8Z" fill="#ffffff"/>
            </svg>
            <span
              className="text-[#15191f] font-semibold"
              style={{ fontFamily: 'Georgia, serif', fontSize: '22px' }}
            >
              TunHire
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-[22px] font-semibold text-[#15191f] mb-1">
            {view === 'login' ? 'Connexion' : 'Créer un compte'}
          </h1>
          <p className="text-sm text-[#888] mb-6">
            {view === 'login'
              ? 'Bienvenue, connectez-vous à votre compte.'
              : 'Rejoignez la communauté TunHire.'}
          </p>

          {/* Role cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {(['CANDIDATE', 'RECRUITER'] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={[
                  'flex flex-col gap-1 p-4 rounded-xl border-2 text-left transition-colors bg-white',
                  role === r ? 'border-[#15191f]' : 'border-[#e2ddd2]',
                  'cursor-pointer hover:border-[#aaa]',
                ].join(' ')}
              >
                <span className="text-xl">{r === 'CANDIDATE' ? '👤' : '🏢'}</span>
                <span className="text-[13px] font-semibold text-[#15191f]">
                  {r === 'CANDIDATE' ? 'Candidat' : 'Recruteur'}
                </span>
                <span className="text-[11px] text-[#999]">
                  {r === 'CANDIDATE' ? 'Je cherche un emploi' : 'Je recrute des talents'}
                </span>
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {/* Prénom + Nom (register only) */}
            {view === 'register' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#15191f] mb-1.5">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => { setFirstName(e.target.value); clearFieldError('firstName') }}
                    placeholder="Prénom"
                    className={`w-full h-14 px-4 rounded-[10px] border bg-white text-[#15191f] text-sm placeholder:text-[#ccc] focus:outline-none transition-colors ${fieldErrors.firstName ? 'border-red-400 focus:border-red-400' : 'border-[#e2ddd2] focus:border-[#15191f]'}`}
                  />
                  {fieldErrors.firstName && (
                    <p className="text-red-500 text-[11px] mt-1">{fieldErrors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#15191f] mb-1.5">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => { setLastName(e.target.value); clearFieldError('lastName') }}
                    placeholder="Nom"
                    className={`w-full h-14 px-4 rounded-[10px] border bg-white text-[#15191f] text-sm placeholder:text-[#ccc] focus:outline-none transition-colors ${fieldErrors.lastName ? 'border-red-400 focus:border-red-400' : 'border-[#e2ddd2] focus:border-[#15191f]'}`}
                  />
                  {fieldErrors.lastName && (
                    <p className="text-red-500 text-[11px] mt-1">{fieldErrors.lastName}</p>
                  )}
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-[11px] font-medium text-[#15191f] mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearFieldError('email') }}
                required
                placeholder="votre@email.com"
                className={`w-full h-14 px-4 rounded-[10px] border bg-white text-[#15191f] text-sm placeholder:text-[#ccc] focus:outline-none transition-colors ${fieldErrors.email ? 'border-red-400 focus:border-red-400' : 'border-[#e2ddd2] focus:border-[#15191f]'}`}
              />
              {fieldErrors.email && (
                <p className="text-red-500 text-[11px] mt-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-medium text-[#15191f] mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearFieldError('password') }}
                  required
                  placeholder="••••••••"
                  className={`w-full h-14 px-4 pr-12 rounded-[10px] border bg-white text-[#15191f] text-sm placeholder:text-[#ccc] focus:outline-none transition-colors ${fieldErrors.password ? 'border-red-400 focus:border-red-400' : 'border-[#e2ddd2] focus:border-[#15191f]'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Cacher le mot de passe' : 'Voir le mot de passe'}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-[#15191f] transition-colors"
                >
                  {showPassword ? (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-red-500 text-[11px] mt-1">{fieldErrors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-[#15191f] text-white rounded-[10px] font-medium text-sm mt-1 disabled:opacity-60 hover:bg-[#2d3748] active:bg-[#1a202c] transition-colors"
            >
              {loading
                ? view === 'login'
                  ? 'Connexion...'
                  : 'Création...'
                : view === 'login'
                  ? 'Se connecter'
                  : 'Créer mon compte'}
            </button>
          </form>

          {/* Message box */}
          {message && (
            <div
              className={`mt-4 px-4 py-3 rounded-[10px] text-[13px] border ${
                message.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-green-50 border-green-200 text-green-700'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* View toggle */}
          <p className="text-[13px] text-center mt-5 text-[#888]">
            {view === 'login' ? (
              <>
                Pas encore de compte ?{' '}
                <button
                  type="button"
                  onClick={() => switchView('register')}
                  className="text-[#15191f] font-semibold hover:underline"
                >
                  Créer un compte
                </button>
              </>
            ) : (
              <>
                Déjà un compte ?{' '}
                <button
                  type="button"
                  onClick={() => switchView('login')}
                  className="text-[#15191f] font-semibold hover:underline"
                >
                  Se connecter
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
