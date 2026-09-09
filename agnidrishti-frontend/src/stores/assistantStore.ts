import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { askAgniDev, fetchAgniDevStatus } from '../services/assistantService'
import type { AssistantStatusResponse, ChatMessage } from '../types/assistant'

type AssistantState = {
  isOpen: boolean
  threadId: string
  messages: ChatMessage[]
  status: AssistantStatusResponse | null
  isLoading: boolean
  toggleOpen: () => void
  setOpen: (open: boolean) => void
  resetThread: () => void
  checkStatus: () => Promise<void>
  sendMessage: (question: string) => Promise<void>
}

const generateThreadId = () => `thread_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

export const useAssistantStore = create<AssistantState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      threadId: generateThreadId(),
      messages: [],
      status: null,
      isLoading: false,

      toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
      setOpen: (isOpen) => set({ isOpen }),

      resetThread: () => {
        set({
          threadId: generateThreadId(),
          messages: [],
        })
      },

      checkStatus: async () => {
        try {
          const status = await fetchAgniDevStatus()
          set({ status })
        } catch {
          set({
            status: {
              status: 'offline',
              provider: 'google_gemini',
              chat_model: 'gemini-3.5-flash',
              embedding_model: 'gemini-embedding-001',
              indexed_documents: 0,
            },
          })
        }
      },

      sendMessage: async (questionText: string) => {
        const text = questionText.trim()
        if (!text || get().isLoading) return

        const userMessage: ChatMessage = {
          id: `msg_${Date.now()}_user`,
          sender: 'user',
          content: text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }

        const currentThreadId = get().threadId || generateThreadId()

        set((state) => ({
          messages: [...state.messages, userMessage],
          isLoading: true,
          threadId: currentThreadId,
        }))

        try {
          const res = await askAgniDev(text, currentThreadId, 5)

          const assistantMessage: ChatMessage = {
            id: `msg_${Date.now()}_assistant`,
            sender: 'assistant',
            content: res.answer,
            route: res.route,
            sources: res.sources,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }

          set((state) => ({
            messages: [...state.messages, assistantMessage],
            isLoading: false,
            threadId: res.thread_id || currentThreadId,
          }))
        } catch (err: unknown) {
          const errorMessageStr = err instanceof Error ? err.message : 'Unknown error'
          const errorAssistantMessage: ChatMessage = {
            id: `msg_${Date.now()}_error`,
            sender: 'assistant',
            content: `**Agni Dev encountered an error:** ${errorMessageStr}\n\nPlease verify that the backend API server is running and try again.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            error: true,
          }

          set((state) => ({
            messages: [...state.messages, errorAssistantMessage],
            isLoading: false,
          }))
        }
      },
    }),
    {
      name: 'agnidrishti-assistant-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        threadId: state.threadId,
        messages: state.messages,
        isOpen: state.isOpen,
      }),
    },
  ),
)
