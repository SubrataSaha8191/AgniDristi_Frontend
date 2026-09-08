import { useState } from 'react'
import agniDrishtiLogo from '../assets/SIH_tech_invaders (3).png'
import { CheckCircle2, Loader2, Menu, Moon, Radio, Sun, User, UserPlus, XCircle, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSourceStore } from '../stores/sourceStore'
import { useThemeStore } from '../stores/themeStore'
import { useUIStore } from '../stores/uiStore'
import { triggerMonitoringRun } from '../services/monitoringRunService'

export function TopNav() {
  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)
  const sidebarOpen = useUIStore((state) => state.sidebarOpen)
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)
  const datasetMode = useSourceStore((state) => state.datasetMode)
  const setDatasetMode = useSourceStore((state) => state.setDatasetMode)

  const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle')
  const [syncMsg, setSyncMsg] = useState('')

  const handleRunSync = async () => {
    setSyncState('syncing')
    setSyncMsg('Syncing...')
    try {
      await triggerMonitoringRun(1)
      setSyncState('success')
      setSyncMsg('FIRMS Sync Completed')
      setTimeout(() => { setSyncState('idle'); setSyncMsg('') }, 3500)
    } catch {
      setSyncState('error')
      setSyncMsg('Sync Failed')
      setTimeout(() => { setSyncState('idle'); setSyncMsg('') }, 3500)
    }
  }

  return (
    <header className="flex items-center justify-between h-16 px-4 text-white bg-black border-b-2 border-black sm:px-6">
      <div className="flex items-center gap-3">
        <button type="button" aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={sidebarOpen} onClick={toggleSidebar}
          className="flex h-9 w-9 items-center justify-center text-white border cursor-pointer border-zinc-700 bg-zinc-900 hover:bg-zinc-800 shrink-0">
          <Menu size={20} aria-hidden="true" />
        </button>
        <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
          <img
            src={agniDrishtiLogo}
            alt="AGNI-DRISHTI"
            className="h-10 sm:h-11 w-auto max-h-11 object-contain block shrink-0 -mt-1"
          />
          <span className="text-lg font-black tracking-widest uppercase sm:text-xl leading-none flex items-center translate-y-[2.5px]">
            AGNI<span className="text-[#d8f5a9]">DRISHTI</span>
          </span>
        </Link>
      </div>

      <div className="hidden items-center gap-3 border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 md:flex">
        <Radio size={14} className="animate-pulse text-[#d8f5a9]" />
        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider">PIPELINE: ONLINE</span>
        <div className="ml-2 flex border border-zinc-700 bg-black p-0.5 font-mono text-[10px]">
          <button type="button" onClick={() => setDatasetMode('FIRMS')} className={`px-2 py-0.5 font-black uppercase transition-colors cursor-pointer ${datasetMode === 'FIRMS' ? 'bg-[#d8f5a9] text-black' : 'text-zinc-400 hover:text-white'}`}>FIRMS</button>
          <button type="button" onClick={() => setDatasetMode('VNF')} className={`px-2 py-0.5 font-black uppercase transition-colors cursor-pointer ${datasetMode === 'VNF' ? 'bg-[#d8f5a9] text-black' : 'text-zinc-400 hover:text-white'}`}>VNF</button>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {syncState === 'syncing' && <div className="flex items-center gap-1.5 font-mono text-xs font-black uppercase text-[#d8f5a9]"><Loader2 size={16} className="animate-spin" /><span>SYNCING...</span></div>}
        {syncState === 'success' && <div className="flex items-center gap-1.5 font-mono text-xs font-black uppercase text-emerald-400"><CheckCircle2 size={16} /><span>{syncMsg}</span></div>}
        {syncState === 'error' && <div className="flex items-center gap-1.5 font-mono text-xs font-black uppercase text-red-400"><XCircle size={16} /><span>{syncMsg}</span></div>}

        <button type="button" disabled={syncState === 'syncing'} onClick={handleRunSync} className="flex items-center gap-1.5 bg-[#d8f5a9] px-3 py-1.5 text-xs font-black uppercase tracking-wider text-black hover:opacity-90 disabled:opacity-50 cursor-pointer">
          {syncState === 'syncing' ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />} Run Sync
        </button>

        <button type="button" aria-label="Toggle theme" onClick={toggleTheme} className="hidden items-center gap-2 border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-[#d8f5a9] hover:text-black sm:flex cursor-pointer">
          {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
          <span>{theme === 'light' ? 'DARK' : 'LIGHT'}</span>
        </button>

        <div className="flex items-center gap-1.5 border-l border-zinc-700 pl-2.5">
          <Link to="/login" className="flex items-center gap-1 border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs font-black uppercase text-white hover:bg-[#d8f5a9] hover:text-black"><User size={13} /> Login</Link>
          <Link to="/signup" className="hidden items-center gap-1 border border-[#d8f5a9] bg-black px-2.5 py-1.5 text-xs font-black uppercase text-[#d8f5a9] hover:bg-[#d8f5a9] hover:text-black sm:flex"><UserPlus size={13} /> Sign Up</Link>
        </div>
      </div>
    </header>
  )
}



