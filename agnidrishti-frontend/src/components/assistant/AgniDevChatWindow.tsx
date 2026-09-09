import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Database,
  FileText,
  Flame,
  HelpCircle,
  Layers,
  RotateCw,
  Send,
  Sparkles,
  User,
  X,
} from 'lucide-react'
import { useAssistantStore } from '../../stores/assistantStore'
import type { AssistantSource, RAGRoute } from '../../types/assistant'
import { BlazingFireOrb } from './BlazingFireOrb'

const EXAMPLE_QUESTION_GROUPS = [
  {
    category: 'Feature & Telemetry Definitions',
    questions: [
      'What persistence_ratio means',
      'How gas_flare_score should be interpreted',
    ],
  },
  {
    category: 'Classification & Model Rules',
    questions: [
      'How objects are classified',
      'Known limitations and uncertainty',
    ],
  },
  {
    category: 'FIRMS & VNF Matching',
    questions: [
      'Difference between VNF and FIRMS',
      'How the two sources are matched',
    ],
  },
  {
    category: 'Data Ingestion & Playbooks',
    questions: [
      'How data ingestion works',
      'How to trigger a monitoring run',
    ],
  },
]

function RouteBadge({ route }: { route?: RAGRoute }) {
  if (!route) return null
  const config = {
    documents: { label: 'DOCUMENTS RAG', color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30', icon: FileText },
    database: { label: 'DATABASE QUERY', color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30', icon: Database },
    hybrid: { label: 'HYBRID RAG', color: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30', icon: Layers },
  }[route]

  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[9px] font-bold tracking-wide uppercase ${config.color}`}>
      <Icon size={10} />
      {config.label}
    </span>
  )
}

function SourcesDrawer({ sources }: { sources: AssistantSource[] }) {
  const [expanded, setExpanded] = useState(false)
  if (!sources || sources.length === 0) return null

  return (
    <div className="mt-2.5 rounded-lg border border-border/80 bg-surface/60 p-2 text-xs">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between font-mono text-[10px] font-bold text-text-secondary hover:text-text-primary cursor-pointer"
      >
        <div className="flex items-center gap-1.5">
          <BookOpen size={12} className="text-accent" />
          <span>Cited Sources &amp; Knowledge Base ({sources.length})</span>
        </div>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {expanded && (
        <div className="mt-2 divide-y divide-border/60 border-t border-border/60 pt-1.5 space-y-1.5">
          {sources.map((src, i) => (
            <div key={i} className="pt-1 text-[11px] first:pt-0">
              <div className="flex items-center justify-between font-semibold text-text-primary">
                <span className="truncate max-w-[200px]">{src.title || src.name}</span>
                {src.score != null && (
                  <span className="font-mono text-[10px] text-accent font-bold">
                    Score: {Math.round(src.score * 100)}%
                  </span>
                )}
              </div>
              <p className="font-mono text-[9px] text-text-secondary truncate mt-0.5">{src.name} {src.chunk_id != null ? `• Chunk ${src.chunk_id}` : ''}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function FormattedContent({ text }: { text: string }) {
  // Simple markdown renderer for bold, lists, and line breaks
  const paragraphs = text.split('\n\n')

  return (
    <div className="space-y-2 text-xs leading-relaxed">
      {paragraphs.map((p, pIdx) => {
        if (p.startsWith('* ') || p.startsWith('- ')) {
          const items = p.split('\n').filter(Boolean)
          return (
            <ul key={pIdx} className="pl-4 my-1 space-y-1 list-disc">
              {items.map((item, iIdx) => (
                <li key={iIdx}>
                  <FormattedLine line={item.replace(/^[*|-]\s+/, '')} />
                </li>
              ))}
            </ul>
          )
        }
        return (
          <p key={pIdx}>
            <FormattedLine line={p} />
          </p>
        )
      })}
    </div>
  )
}

function FormattedLine({ line }: { line: string }) {
  // Parses **bold** and [Document: Title] tags
  const parts = line.split(/(\*\*.*?\*\*|\[Document:.*?\])/g)

  return (
    <>
      {parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={idx} className="font-bold text-text-primary">
              {part.slice(2, -2)}
            </strong>
          )
        }
        if (part.startsWith('[Document:') && part.endsWith(']')) {
          return (
            <span key={idx} className="ml-1 inline-block rounded bg-accent/10 border border-accent/30 px-1 py-0.5 font-mono text-[9px] font-semibold text-accent">
              {part.slice(1, -1)}
            </span>
          )
        }
        return <span key={idx}>{part}</span>
      })}
    </>
  )
}

export function AgniDevChatWindow() {
  const isOpen = useAssistantStore((state) => state.isOpen)
  const setOpen = useAssistantStore((state) => state.setOpen)
  const messages = useAssistantStore((state) => state.messages)
  const status = useAssistantStore((state) => state.status)
  const isLoading = useAssistantStore((state) => state.isLoading)
  const checkStatus = useAssistantStore((state) => state.checkStatus)
  const resetThread = useAssistantStore((state) => state.resetThread)
  const sendMessage = useAssistantStore((state) => state.sendMessage)

  const [input, setInput] = useState('')
  const [showExamples, setShowExamples] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      void checkStatus()
    }
  }, [isOpen, checkStatus])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = (text?: string) => {
    const queryText = text || input
    if (!queryText.trim()) return
    void sendMessage(queryText)
    setInput('')
    setShowExamples(false)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        aria-label="Agni Dev AI RAG Assistant"
        className="fixed bottom-24 right-4 sm:right-8 z-[1200] flex w-[calc(100vw-2rem)] sm:w-[28rem] h-[38rem] max-h-[82vh] flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-lg"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border bg-surface p-3.5 shadow-sm z-10">
          <div className="flex items-center min-w-0 gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 text-white border shadow-md shrink-0 rounded-xl bg-gradient-to-tr from-red-600 via-orange-500 to-amber-400 border-amber-300/30">
              <Flame size={22} className="text-yellow-200 animate-pulse drop-shadow" />
              <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-surface bg-emerald-500 shadow-xs" title="Online" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-lg font-bold tracking-wider truncate font-samarkan text-text-primary">AGNI DEV</h2>
              </div>
              <p className="text-[10px] font-semibold text-text-secondary truncate">
                {status?.status === 'ready'
                  ? `Online • ${status.indexed_documents} Docs Indexed (${status.chat_model})`
                  : 'Geospatial & Thermal Intelligence Assistant'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => resetThread()}
              title="Reset conversation thread"
              className="rounded-lg border border-border p-1.5 text-text-secondary hover:bg-accent hover:text-white transition-colors cursor-pointer"
            >
              <RotateCw size={15} />
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close Assistant"
              className="rounded-lg border border-border p-1.5 text-text-secondary hover:bg-accent hover:text-white transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto source-panel-scroll bg-bg/40">
          {messages.length === 0 ? (
            <div className="space-y-4">
              <div className="p-4 text-center border shadow-sm rounded-xl border-border bg-surface">
                <div className="flex items-center justify-center my-2">
                  <BlazingFireOrb isListening={isLoading} size="md" />
                </div>
                <h3 className="mt-2 text-sm font-semibold text-text-primary">Namaste! I am Agni Dev</h3>
                <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                  Your Geospatial &amp; Thermal Intelligence RAG Assistant. Ask me anything about FIRMS satellite data, VNF, gas flare detection, algorithms, or playbooks.
                </p>
              </div>

              {/* Sample Questions Menu */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Example Questions to Try</span>
                  <Sparkles size={12} className="text-accent" />
                </div>

                {EXAMPLE_QUESTION_GROUPS.map((group) => (
                  <div key={group.category} className="space-y-1.5">
                    <p className="text-[10px] font-semibold text-text-secondary">{group.category}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {group.questions.map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => handleSend(q)}
                          className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-left text-[11px] font-medium text-text-primary hover:border-accent hover:bg-accent/10 transition-colors cursor-pointer shadow-2xs"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent text-white shadow-sm mt-0.5">
                    <Flame size={15} />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-accent text-white rounded-br-none'
                      : 'border border-border bg-surface text-text-primary rounded-bl-none'
                  }`}
                >
                  {msg.sender === 'assistant' && (
                    <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-border/40">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold tracking-wide font-samarkan">Agni Dev</span>
                        <RouteBadge route={msg.route} />
                      </div>
                      <span className="font-mono text-[9px] text-text-secondary">{msg.timestamp}</span>
                    </div>
                  )}

                  <FormattedContent text={msg.content} />

                  {msg.sender === 'assistant' && msg.sources && msg.sources.length > 0 && (
                    <SourcesDrawer sources={msg.sources} />
                  )}

                  {msg.sender === 'user' && (
                    <div className="mt-1 text-right font-mono text-[9px] text-white/80">{msg.timestamp}</div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface border border-border text-text-primary shadow-sm mt-0.5">
                    <User size={15} />
                  </div>
                )}
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex justify-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent text-white shadow-sm mt-0.5">
                <Flame size={15} className="animate-spin" />
              </div>
              <div className="rounded-2xl border border-border bg-surface p-3.5 text-text-primary rounded-bl-none shadow-sm flex items-center gap-2">
                <span className="text-xs font-medium text-text-secondary">Agni Dev is analyzing telemetry...</span>
                <div className="flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Example Suggestions Popover */}
        {showExamples && (
          <div className="p-3 overflow-y-auto border-t shadow-lg border-border bg-surface max-h-48 custom-scrollbar">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-text-secondary uppercase">Quick Questions</span>
              <button type="button" onClick={() => setShowExamples(false)} className="text-text-secondary hover:text-text-primary">
                <X size={14} />
              </button>
            </div>
            <div className="space-y-2">
              {EXAMPLE_QUESTION_GROUPS.map((g) => (
                <div key={g.category}>
                  <p className="text-[9px] font-semibold text-text-secondary mb-1">{g.category}</p>
                  <div className="flex flex-wrap gap-1">
                    {g.questions.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => handleSend(q)}
                        className="rounded border border-border bg-bg px-2 py-1 text-[10px] text-text-primary hover:border-accent"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex items-center gap-2 p-3 border-t shrink-0 border-border bg-surface"
        >
          <button
            type="button"
            onClick={() => setShowExamples(!showExamples)}
            className="p-2 transition-colors border rounded-lg cursor-pointer border-border text-text-secondary hover:border-accent hover:text-accent"
            title="Show example questions"
          >
            <HelpCircle size={17} />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Agni Dev a question..."
            className="flex-1 rounded-lg border border-border bg-bg px-3.5 py-2 text-xs text-text-primary outline-none focus:ring-1 focus:ring-accent"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex items-center justify-center p-2 text-white transition-opacity border rounded-lg shadow-sm cursor-pointer border-accent bg-accent disabled:opacity-40 hover:opacity-90"
          >
            <Send size={16} />
          </button>
        </form>
      </motion.aside>
    </AnimatePresence>
  )
}
