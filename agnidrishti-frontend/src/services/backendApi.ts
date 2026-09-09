import { axiosClient } from '../lib/axiosClient'
import type { AlertType } from '../types/source'

export const backendApi = {
  getSummary: () => axiosClient.get('/dashboard/summary'),
  getObjects: (params?: Record<string, string>) => axiosClient.get('/dashboard/objects', { params }),
  getObjectDetail: (id: string) => axiosClient.get(`/dashboard/objects/${encodeURIComponent(id)}`),
  getAlerts: (params: { limit?: number; offset?: number; alert_type?: AlertType } = {}) => axiosClient.get('/dashboard/alerts', { params }),
  getMonitoring: () => axiosClient.get('/dashboard/monitoring'),
  triggerRun: (triggerType = 'manual') => axiosClient.post('/monitoring/runs/trigger', null, { params: { trigger_type: triggerType } }),
  uploadVnf: (formData: FormData) => axiosClient.post('/vnf/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
}
