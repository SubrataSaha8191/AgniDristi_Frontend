import { backendApi } from './backendApi'
import type { AssistantQueryResponse, AssistantStatusResponse } from '../types/assistant'

const SOURCE_METADATA_PATTERN = /\[(?:database|document|source):[^\]]+\]/gi

export function cleanAssistantAnswer(answer: string): string {
  return answer.replace(SOURCE_METADATA_PATTERN, '').replace(/[ \t]{2,}/g, ' ').trim()
}

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
  return {
    ...res.data,
    answer: cleanAssistantAnswer(res.data.answer),
  }
}

export async function fetchAgniDevStatus(): Promise<AssistantStatusResponse> {
  const res = await backendApi.getAssistantStatus()
  return res.data
}
