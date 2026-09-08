import { useState } from 'react'
import agniDrishtiLogo from '../assets/SIH_tech_invaders (3).png'
import { CheckCircle2, Loader2, Menu, Moon, Sun, User, UserPlus, XCircle, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useThemeStore } from '../stores/themeStore'
import { useUIStore } from '../stores/uiStore'
import { triggerMonitoringRun } from '../services/monitoringRunService'

export function TopNav() {
  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)
  const sidebarOpen = useUIStore((state) => state.sidebarOpen)
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)

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
          className="flex items-center justify-center p-2 text-white border cursor-pointer border-zinc-700 bg-zinc-900 hover:bg-zinc-800">
          <Menu size={20} aria-hidden="true" />
        </button>
        <img
          src={agniDrishtiLogo}
          alt="AGNI-DRISHTI"
          className="object-contain"
          style={{
            height: '350px',
            width: 'auto',
            maxHeight: '45px',
            display: 'block',
            paddingLeft:'10px'
          }}
        />
        <span className="text-lg font-black tracking-widest uppercase sm:text-xl translate-y-[3.5px]">AGNI<span className="text-[#d8f5a9]">DRISHTI</span></span>
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



