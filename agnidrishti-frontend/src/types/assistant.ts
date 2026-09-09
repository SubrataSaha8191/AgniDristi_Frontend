export type RAGRoute = 'database' | 'documents' | 'hybrid'

export type AssistantSource = {
  type: 'database' | 'document'
  name: string
  title?: string | null
  chunk_id?: number | null
  score?: number | null
}

export type AssistantQueryResponse = {
  answer: string
  route: RAGRoute
  sources: AssistantSource[]
  data_as_of: string
  thread_id?: string | null
}

export type AssistantStatusResponse = {
  status: 'ready' | 'missing_api_key' | string
  provider: string
  chat_model: string
  embedding_model: string
  indexed_documents: number
}

export type ChatMessage = {
  id: string
  sender: 'user' | 'assistant'
  content: string
  route?: RAGRoute
  sources?: AssistantSource[]
  timestamp: string
  error?: boolean
}
