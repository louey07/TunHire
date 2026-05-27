import type { ApiResponse } from "@/lib/types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:8181";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("tunhire_token");
}

async function parseBody(res: Response): Promise<unknown> {
  if (res.status === 204) return null;
  const text = await res.text();
  if (!text) return null;
  return JSON.parse(text);
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  auth = true,
): Promise<ApiResponse<T>> {
  const headers = new Headers(options.headers);
  if (auth) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
    const payload = (await parseBody(res)) as ApiResponse<T> | T | null;

    if (!res.ok) {
      const errorPayload = payload as { message?: string } | null;
      const message =
        errorPayload?.message ||
        (payload as ApiResponse)?.message ||
        `Request failed (${res.status})`;
      return { success: false, message };
    }

    if (payload && typeof payload === "object" && "success" in payload) {
      return payload as ApiResponse<T>;
    }

    return { success: true, data: payload as T };
  } catch {
    return { success: false, message: "Erreur de connexion." };
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  auth = true,
): Promise<T> {
  const result = await request<T>(endpoint, options, auth);
  if (!result.success) {
    throw new ApiError(result.message || "Request failed", 400);
  }
  return result.data as T;
}

export async function apiGet<T = unknown>(endpoint: string) {
  return request<T>(endpoint);
}

export async function apiPublicGet<T = unknown>(endpoint: string) {
  return request<T>(endpoint, {}, false);
}

export async function apiPost<T = unknown>(endpoint: string, body?: object) {
  return request<T>(endpoint, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function apiPostForm<T = unknown>(
  endpoint: string,
  formData: FormData,
) {
  return request<T>(endpoint, { method: "POST", body: formData });
}

export async function apiPut<T = unknown>(endpoint: string, body: object) {
  return request<T>(endpoint, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function apiPatch<T = unknown>(endpoint: string, body?: object) {
  return request<T>(endpoint, {
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function apiPatchQuery<T = unknown>(
  endpoint: string,
  params: Record<string, string>,
) {
  const query = new URLSearchParams(params).toString();
  const path = query ? `${endpoint}?${query}` : endpoint;
  return request<T>(path, { method: "PATCH" });
}

export async function apiDelete<T = unknown>(endpoint: string) {
  return request<T>(endpoint, { method: "DELETE" });
}

export { BASE_URL };
