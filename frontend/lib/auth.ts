import { apiPost } from "@/lib/api";
import type { User, UserRole } from "@/lib/types";

export type { User };

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("tunhire_token");
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("tunhire_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export function setSession(token: string, user: User): void {
  localStorage.setItem("tunhire_token", token);
  localStorage.setItem("tunhire_user", JSON.stringify(user));
  document.cookie = `tunhire_token=${token}; path=/; SameSite=Lax; max-age=604800`;
}

export function updateStoredUser(user: User): void {
  localStorage.setItem("tunhire_user", JSON.stringify(user));
}

function clearAuthState(): void {
  localStorage.removeItem("tunhire_token");
  localStorage.removeItem("tunhire_user");
  document.cookie =
    "tunhire_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
}

export function logout(): void {
  clearAuthState();
  window.location.href = "/login";
}

export async function logoutWithServer(): Promise<void> {
  try {
    await apiPost("/auth/logout");
  } catch {
    // ignore
  } finally {
    clearAuthState();
    window.location.href = "/login";
  }
}

export function requireRole(
  role: UserRole,
  router: { push: (path: string) => void },
): User | null {
  const token = getToken();
  const user = getUser();
  if (!token || !user) {
    router.push("/login");
    return null;
  }
  if (user.role !== role) {
    router.push(user.role === "RECRUITER" ? "/dashboard/recruiter" : "/dashboard/candidate");
    return null;
  }
  return user;
}
