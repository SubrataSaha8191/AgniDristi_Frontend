import type { AxiosProgressEvent, AxiosRequestConfig } from 'axios'
import { axiosClient, isApiConfigured, API_BASE_URL } from './axiosClient'

export { isApiConfigured, API_BASE_URL }

export async function apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await axiosClient.request<T>(config)
  return response.data
}

export function apiGet<T>(url: string, config: AxiosRequestConfig = {}) {
  return apiRequest<T>({ ...config, method: 'GET', url })
}

export function apiPost<TResponse, TBody = unknown>(url: string, data?: TBody, config: AxiosRequestConfig = {}) {
  return apiRequest<TResponse>({ ...config, method: 'POST', url, data })
}

export function uploadFile<T>(url: string, file: File, onUploadProgress?: (event: AxiosProgressEvent) => void) {
  const body = new FormData()
  body.append('file', file)
  return apiPost<T, FormData>(url, body, { onUploadProgress })
}

export const apiClient = apiRequest
