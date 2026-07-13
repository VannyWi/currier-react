const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

function getStoredSession() {
  return JSON.parse(localStorage.getItem('rapidocourier.session') || 'null')
}

export async function apiRequest(path, options = {}) {
  const session = getStoredSession()
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
      ...options.headers,
    },
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok || payload?.success === false) {
    const error = new Error(payload?.message || `Error HTTP ${response.status}`)
    error.status = response.status
    throw error
  }

  return payload?.data ?? payload
}

export function toQueryString(params) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value)
  })
  return query.toString()
}
