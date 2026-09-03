export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
export const isApiConfigured = API_BASE_URL.length > 0

function buildUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path
  return `${API_BASE_URL}/${path.replace(/^\//, '')}`
}

export async function apiClient<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(buildUrl(path), { ...options, headers })
  const body = await response.text()

  if (!response.ok) {
    let message = body
    try {
      const error = JSON.parse(body) as { detail?: string; message?: string }
      message = error.detail ?? error.message ?? body
    } catch {
      // Keep the raw response when the server did not return JSON.
    }
    throw new Error(`API request failed (${response.status}): ${message || response.statusText}`)
  }

  return JSON.parse(body) as T
}
