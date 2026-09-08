import axios from 'axios'

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
export const isApiConfigured = Boolean(API_BASE_URL)

function envTimeout(value: string | undefined, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export const API_TIMEOUT_MS = envTimeout(import.meta.env.VITE_API_TIMEOUT_MS, 30_000)
export const LONG_OPERATION_TIMEOUT_MS = envTimeout(import.meta.env.VITE_LONG_OPERATION_TIMEOUT_MS, 30 * 60_000)

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    Accept: 'application/json',
  },
})

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) return Promise.reject(error)
    const message = error.response?.data?.detail ?? error.response?.data?.message
    if (message) error.message = message
    return Promise.reject(error)
  }
)

export async function apiClient<T>(url: string, config = {}): Promise<T> {
  const response = await axiosClient.get<T>(url, config)
  return response.data
}
