import { Flame, Sparkles, X } from 'lucide-react'
import { useAssistantStore } from '../../stores/assistantStore'

export function AgniDevBubble() {
  const isOpen = useAssistantStore((state) => state.isOpen)
  const toggleOpen = useAssistantStore((state) => state.toggleOpen)
  const status = useAssistantStore((state) => state.status)

  const isReady = status?.status === 'ready' || Boolean(status?.chat_model)

  return (
    <div className="fixed bottom-6 right-6 z-[1200]">
      <button
        type="button"
        onClick={toggleOpen}
        aria-label={isOpen ? 'Close Agni Dev Assistant' : 'Open Agni Dev Assistant'}
        className="group relative flex items-center gap-2.5 rounded-full border border-accent bg-surface px-4 py-3 text-text-primary shadow-md transition-all duration-300 hover:scale-105 hover:bg-accent hover:text-white cursor-pointer"
      >
        {/* Glow Ring Removed */}

        <div className="relative flex items-center justify-center">
          <div className="relative flex items-center justify-center w-8 h-8 text-white border rounded-full shadow-md bg-gradient-to-tr from-red-600 via-orange-500 to-amber-400 border-amber-300/30">
            {isOpen ? (
              <X size={18} />
            ) : (
              <Flame size={18} className="text-yellow-100 animate-pulse" />
            )}
          </div>
          {!isOpen && (
            <span
              className={`absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-surface ${
                isReady ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              title={isReady ? 'Agni Dev Online' : 'Agni Dev Connecting...'}
            />
          )}
        </div>

        <div className="relative flex flex-col text-left">
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold tracking-wide font-samarkan">AGNI DEV</span>
            <Sparkles size={12} className="text-accent group-hover:text-white" />
          </div>
          <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider group-hover:text-white/90">
            {isOpen ? 'Close Chat' : 'Assistant'}
          </span>
        </div>
      </button>
    </div>
  )
}
