import { useEffect, useRef, useState } from 'react'
import agniDrishtiLogo from '../assets/SIH_tech_invaders (3).png'
import {
  Building2,
  CheckCircle2,
  Factory,
  Globe2,
  Loader2,
  MapPin,
  Menu,
  Moon,
  Search,
  Sun,
  User,
  UserPlus,
  X,
  XCircle,
  Zap,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useThemeStore } from '../stores/themeStore'
import { useUIStore } from '../stores/uiStore'
import { triggerMonitoringRun } from '../services/monitoringRunService'
import {
  type SearchIndexItem,
  classifyQueryEntity,
  getMasterSearchIndex,
  matchSearchQuery,
} from '../services/searchIndexService'

export function TopNav() {
  const navigate = useNavigate()
  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)
  const sidebarOpen = useUIStore((state) => state.sidebarOpen)
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)

  const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle')
  const [syncMsg, setSyncMsg] = useState('')

  // Search Bar state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchIndex, setSearchIndex] = useState<SearchIndexItem[]>([])
  const [suggestions, setSuggestions] = useState<SearchIndexItem[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    void getMasterSearchIndex().then(setSearchIndex)
  }, [])

  useEffect(() => {
    if (searchQuery.trim()) {
      setSuggestions(matchSearchQuery(searchQuery, searchIndex))
    } else {
      setSuggestions([])
    }
  }, [searchQuery, searchIndex])

  // Handle outside click to close popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectEntity = (item: SearchIndexItem) => {
    setSearchQuery('')
    setIsFocused(false)
    navigate(item.targetRoute)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    const matched = classifyQueryEntity(searchQuery, searchIndex)
    if (matched) {
      handleSelectEntity(matched)
    } else {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
      setIsFocused(false)
    }
  }

  const handleRunSync = async () => {
    setSyncState('syncing')
    setSyncMsg('Syncing...')
    try {
      await triggerMonitoringRun(1)
      setSyncState('success')
      setSyncMsg('Sync Completed')
      setTimeout(() => { setSyncState('idle'); setSyncMsg('') }, 3500)
    } catch {
      setSyncState('error')
      setSyncMsg('Sync Failed')
      setTimeout(() => { setSyncState('idle'); setSyncMsg('') }, 3500)
    }
  }

  const entityIcon = (type: SearchIndexItem['type']) => {
    switch (type) {
      case 'factory':
        return <Factory size={13} className="text-orange-500" />
      case 'district':
        return <MapPin size={13} className="text-blue-500" />
      case 'state':
        return <Globe2 size={13} className="text-emerald-500" />
      case 'industry':
        return <Building2 size={13} className="text-purple-500" />
    }
  }

  const entityBadge = (type: SearchIndexItem['type']) => {
    const styles = {
      factory: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30',
      district: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
      state: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      industry: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
    }[type]

    return (
      <span className={`rounded border px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${styles}`}>
        {type}
      </span>
    )
  }

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-border bg-surface px-2 text-text-primary sm:px-6 z-40 relative">
      {/* Brand & Sidebar Toggle */}
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
        <button
          type="button"
          aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={sidebarOpen}
          onClick={toggleSidebar}
          className="flex shrink-0 items-center justify-center rounded-lg border border-border bg-accent text-white hover:opacity-90 cursor-pointer p-1.5 sm:p-2"
        >
          <Menu size={17} aria-hidden="true" className="sm:size-[18px]" />
        </button>
        <Link to="/dashboard" className="flex shrink-0 items-center gap-1.5">
          <img src={agniDrishtiLogo} alt="AGNI-DRISHTI" className="h-6 w-auto max-h-7 shrink-0 object-contain sm:h-8 sm:max-h-9 -mt-0.5 sm:-mt-1" />
          <span className="font-samarkan flex items-center whitespace-nowrap text-sm font-normal sm:text-xl md:text-2xl shrink-0 leading-none tracking-wide">
            AGNI<span className="text-accent font-samarkan">DRISHTI</span>
          </span>
        </Link>
      </div>

      {/* Master Navbar Search Bar */}
      <div ref={searchContainerRef} className="relative hidden md:flex flex-1 max-w-md mx-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <div className="relative flex items-center w-full">
            <Search size={15} className="absolute left-3 text-text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder="Search State, District, Factory (e.g. Haldia, West Bengal)..."
              className="w-full rounded-xl border border-border bg-bg/80 pl-9 pr-8 py-1.5 text-xs text-text-primary outline-none transition-all focus:border-accent focus:bg-surface focus:ring-1 focus:ring-accent"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-text-secondary hover:text-text-primary"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </form>

        {/* Autocomplete Dropdown Popover */}
        {isFocused && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 max-h-80 overflow-y-auto rounded-xl border border-border bg-surface p-2 shadow-2xl z-50 divide-y divide-border/50">
            <div className="px-2 py-1 flex items-center justify-between text-[10px] font-bold text-text-secondary uppercase">
              <span>Matching Entities</span>
              <span className="font-mono text-[9px] text-accent font-semibold">{suggestions.length} results</span>
            </div>
            <div className="pt-1 space-y-1">
              {suggestions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectEntity(item)}
                  className="flex w-full items-center justify-between rounded-lg p-2 text-left hover:bg-accent/10 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-bg group-hover:border-accent/40">
                      {entityIcon(item.type)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-xs text-text-primary truncate group-hover:text-accent">
                        {item.name}
                      </p>
                      {item.subtitle && (
                        <p className="text-[10px] text-text-secondary truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 ml-2">
                    {entityBadge(item.type)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons (Sync, Theme, Login) */}
      <div className="flex shrink-0 items-center gap-1 sm:gap-2.5">
        {syncState === 'syncing' && (
          <div className="hidden whitespace-nowrap items-center gap-1 font-mono text-[10px] sm:text-xs font-medium text-accent md:flex">
            <Loader2 size={14} className="animate-spin" />
            <span>SYNCING...</span>
          </div>
        )}
        {syncState === 'success' && (
          <div className="hidden whitespace-nowrap items-center gap-1 font-mono text-[10px] sm:text-xs font-medium text-success md:flex">
            <CheckCircle2 size={14} />
            <span>{syncMsg}</span>
          </div>
        )}
        {syncState === 'error' && (
          <div className="hidden whitespace-nowrap items-center gap-1 font-mono text-[10px] sm:text-xs font-medium text-danger md:flex">
            <XCircle size={14} />
            <span>{syncMsg}</span>
          </div>
        )}

        <button
          type="button"
          disabled={syncState === 'syncing'}
          onClick={handleRunSync}
          className="flex shrink-0 whitespace-nowrap items-center gap-1 rounded-lg bg-accent px-2 py-1 text-[11px] font-medium text-white hover:opacity-90 disabled:opacity-50 cursor-pointer sm:gap-1.5 sm:px-2.5 sm:py-1.5 sm:text-xs"
        >
          {syncState === 'syncing' ? <Loader2 size={12} className="animate-spin sm:size-[13px]" /> : <Zap size={12} className="sm:size-[13px]" />}
          <span className="hidden min-[380px]:inline sm:inline">Sync</span>
        </button>

        <button
          type="button"
          aria-label="Toggle theme"
          onClick={toggleTheme}
          className="flex shrink-0 whitespace-nowrap items-center justify-center rounded-lg border border-border bg-surface p-1.5 text-xs font-medium text-text-primary hover:bg-accent hover:text-white sm:px-3 sm:py-1.5 cursor-pointer"
        >
          {theme === 'light' ? <Moon size={13} /> : <Sun size={13} />}
          <span className="hidden sm:ml-1.5 sm:inline">{theme === 'light' ? 'Dark' : 'Light'}</span>
        </button>

        <div className="flex shrink-0 items-center gap-1 border-l border-border pl-1 sm:gap-1.5 sm:pl-2.5">
          <Link
            to="/login"
            className="flex shrink-0 whitespace-nowrap items-center gap-1 rounded-lg border border-border bg-surface p-1.5 text-xs font-medium text-text-primary hover:bg-accent hover:text-white sm:px-2.5 sm:py-1.5"
          >
            <User size={13} /> <span className="hidden sm:inline">Login</span>
          </Link>
          <Link
            to="/signup"
            className="hidden shrink-0 whitespace-nowrap items-center gap-1 rounded-lg border border-accent bg-accent px-2.5 py-1.5 text-xs font-medium text-white hover:opacity-90 md:flex"
          >
            <UserPlus size={13} /> Sign Up
          </Link>
        </div>
      </div>
    </header>
  )
}
