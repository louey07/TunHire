'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { getUser, logout } from '@/lib/auth'

type User = {
  id: number
  email: string
  firstName: string
  lastName: string
  role: 'CANDIDATE' | 'RECRUITER'
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <svg width="30" height="30" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="36" rx="9" fill="#1FA39F" />
        <path d="M8 8H28V13H21V28H15V13H8V8Z" fill="#ffffff" />
      </svg>
      <span
        className="font-semibold"
        style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#1FA39F' }}
      >
        TunHire
      </span>
    </Link>
  )
}

type DropdownItem = { label: string; href?: string; onClick?: () => void; divider?: false } | { divider: true; label?: never }

function AvatarDropdown({ firstName, items }: { firstName: string; items: DropdownItem[] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const initials = firstName.slice(0, 2).toUpperCase()

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 focus:outline-none"
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold select-none"
          style={{ background: '#1FA39F' }}
        >
          {initials}
        </div>
        <span className="text-white text-sm">{firstName}</span>
        <svg
          className="text-white opacity-60"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="currentColor"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}
        >
          <path d="M6 8L1 3h10z" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg overflow-hidden z-50"
          style={{ background: '#1e2530', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          {items.map((item, i) =>
            item.divider ? (
              <div key={i} style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />
            ) : item.href ? (
              <Link
                key={i}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={i}
                type="button"
                onClick={() => { setOpen(false); item.onClick?.() }}
                className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
              >
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    setUser(getUser())
  }, [])

  const candidateDropdownItems = [
    { label: 'Mon profil', href: '/dashboard/candidate' },
    { divider: true as const },
    { label: 'Déconnexion', onClick: logout },
  ]

  const recruiterDropdownItems = [
    { label: 'Mon entreprise', href: '/dashboard/recruiter' },
    { divider: true as const },
    { label: 'Déconnexion', onClick: logout },
  ]

  return (
    <nav
      style={{ background: '#15191f' }}
      className="flex items-center justify-between px-6 py-4"
    >
      <Logo />

      {/* Center nav */}
      <div className="flex items-center gap-6">
        {user?.role === 'RECRUITER' ? (
          <Link href="/dashboard/recruiter" className="text-white text-sm hover:opacity-80 transition-opacity">
            Tableau de bord
          </Link>
        ) : (
          <Link href="/jobs" className="text-white text-sm hover:opacity-80 transition-opacity">
            Offres d&apos;emploi
          </Link>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center">
        {!user ? (
          <Link
            href="/login"
            className="text-sm px-4 py-2 rounded-lg transition-colors"
            style={{ border: '1px solid white', color: 'white' }}
          >
            Se connecter
          </Link>
        ) : user.role === 'CANDIDATE' ? (
          <AvatarDropdown firstName={user.firstName} items={candidateDropdownItems} />
        ) : (
          <AvatarDropdown firstName={user.firstName} items={recruiterDropdownItems} />
        )}
      </div>
    </nav>
  )
}
