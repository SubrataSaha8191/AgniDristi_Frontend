import { backendApi } from './backendApi'
import type { AssistantQueryResponse, AssistantStatusResponse } from '../types/assistant'

export async function askAgniDev(
  question: string,
  threadId?: string | null,
  topK = 5
): Promise<AssistantQueryResponse> {
  const res = await backendApi.queryAssistant({
    question,
    thread_id: threadId || undefined,
    top_k: topK,
  })
  return res.data
}

export async function fetchAgniDevStatus(): Promise<AssistantStatusResponse> {
  const res = await backendApi.getAssistantStatus()
  return res.data
}
