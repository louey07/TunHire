const COMPANY_ID_KEY = "tunhire_company_id";

export function getStoredCompanyId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(COMPANY_ID_KEY);
}

export function setStoredCompanyId(id: number | string): void {
  localStorage.setItem(COMPANY_ID_KEY, String(id));
}

export function clearStoredCompanyId(): void {
  localStorage.removeItem(COMPANY_ID_KEY);
}
