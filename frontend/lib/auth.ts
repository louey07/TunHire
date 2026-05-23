import { apiPost } from '@/lib/api'

type User = {
  id: number
  email: string
  firstName: string
  lastName: string
  role: 'CANDIDATE' | 'RECRUITER'
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('tunhire_token')
}

export function getUser(): User | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem('tunhire_user')
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function isLoggedIn(): boolean {
  return !!getToken()
}

function clearAuthState(): void {
  localStorage.removeItem('tunhire_token')
  localStorage.removeItem('tunhire_user')
  document.cookie =
    'tunhire_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax'
  window.location.href = '/login'
}

export function logout(): void {
  clearAuthState()
}

export async function logoutWithServer(): Promise<void> {
  try {
    await apiPost('/auth/logout')
  } catch {
    // Ignore server errors; always clear local session.
  } finally {
    clearAuthState()
  }
}
