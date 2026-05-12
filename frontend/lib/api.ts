const BASE_URL = 'http://localhost:8081'

function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('tunhire_token')
}

export async function apiGet(endpoint: string) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  return res.json()
}

export async function apiPost(endpoint: string, body?: object) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  return res.json()
}

export async function apiPostForm(endpoint: string, formData: FormData) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  })
  return res.json()
}

export async function apiPut(endpoint: string, body: object) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(body),
  })
  return res.json()
}

export async function apiDelete(endpoint: string) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return { success: true }
  }
  return res.json()
}

export async function apiPublicGet(endpoint: string) {
  const res = await fetch(`${BASE_URL}${endpoint}`)
  return res.json()
}
