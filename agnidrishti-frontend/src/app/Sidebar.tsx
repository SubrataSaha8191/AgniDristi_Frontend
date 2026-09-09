import { useEffect, useRef, useState } from 'react'
import { AlertCircle, Bell, FileSearch, FileText, Layers, LayoutDashboard, Search, Settings, TrendingUp, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import gsap from 'gsap'
import { useUIStore } from '../stores/uiStore'
import { useSourceStore } from '../stores/sourceStore'

const sections = [
  { label: 'GENERAL', items: [{ label: 'Dashboard', to: '/dashboard', end: true, icon: LayoutDashboard }, { label: 'Search & Discovery', to: '/search', icon: Search }, { label: 'Source Investigation', to: '/investigation', icon: FileSearch }, { label: 'Event Assessment', to: '/assessment', icon: AlertCircle }, { label: 'Change & Anomaly', to: '/anomaly', icon: TrendingUp }, { label: 'Alerts', to: '/alerts', icon: Bell }] },
  { label: 'REPORTING', items: [{ label: 'Intelligence Reports', to: '/reports', icon: FileText }, { label: 'Data Layers', to: '/data-layers', icon: Layers }] },
  { label: 'SYSTEM', items: [{ label: 'System / Model', to: '/system', icon: Settings }] },
]

export function Sidebar() {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen)
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)
  const selectedSourceId = useSourceStore((state) => state.selectedSourceId)
  const [shouldRender, setShouldRender] = useState(sidebarOpen)
  const mobileRef = useRef<HTMLElement>(null)
  const desktopRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (sidebarOpen) {
      setShouldRender(true)
    } else {
      let count = 0
      const onDone = () => {
        count++
        if (count >= 2) setShouldRender(false)
      }
      if (desktopRef.current) gsap.to(desktopRef.current, { x: '-100%', opacity: 0, duration: 0.25, ease: 'power2.in', onComplete: onDone })
      else onDone()

      if (mobileRef.current) gsap.to(mobileRef.current, { y: '-100%', opacity: 0, duration: 0.25, ease: 'power2.in', onComplete: onDone })
      else onDone()
    }
  }, [sidebarOpen])

  useEffect(() => {
    if (shouldRender && sidebarOpen) {
      if (desktopRef.current) gsap.fromTo(desktopRef.current, { x: '-100%', opacity: 0 }, { x: '0%', opacity: 1, duration: 0.25, ease: 'power2.out' })
      if (mobileRef.current) gsap.fromTo(mobileRef.current, { y: '-100%', opacity: 0 }, { y: '0%', opacity: 1, duration: 0.25, ease: 'power2.out' })
    }
  }, [shouldRender, sidebarOpen])

  const renderNav = (isMobile = false) => (
    <nav aria-label="Primary navigation" className={isMobile ? 'max-w-md mx-auto py-2' : ''}>
      {isMobile && (
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
          <span className="font-samarkan text-xl font-normal">AGNI<span className="font-sans text-accent bg-accent/10 rounded-lg px-1.5 py-0.5 ml-1 text-xs font-semibold">MENU</span></span>
          <button type="button" onClick={toggleSidebar} aria-label="Close menu" className="rounded-lg border border-border bg-accent p-2 text-white hover:opacity-90"><X size={20} /></button>
        </div>
      )}
      {sections.map(({ label: sectionLabel, items }) => (
        <section key={sectionLabel} className="mt-5 first:mt-0">
          <h2 className="px-3 pb-1.5 text-[10px] font-semibold text-text-secondary">{sectionLabel}</h2>
          <div className="space-y-1">
            {items.map(({ label, to, end, icon: Icon }) => {
              const targetTo = (to === '/investigation' && selectedSourceId)
                ? `/investigation/${encodeURIComponent(selectedSourceId)}`
                : to
              return (
                <NavLink key={to} to={targetTo} end={end} onClick={() => { if (isMobile) toggleSidebar() }}
                  className={({ isActive }) => `flex items-center gap-3 rounded-lg border px-4 py-2.5 text-xs font-medium transition-colors ${
                    isActive
                      ? 'border-accent bg-accent text-white'
                      : 'border-transparent text-text-secondary hover:bg-bg hover:border-border hover:text-text-primary'
                  }`}>
                  {({ isActive }) => (
                    <>
                      <Icon size={18} className={isActive ? 'text-white' : 'text-text-primary'} aria-hidden="true" />
                      {label}
                    </>
                  )}
                </NavLink>
              )
            })}
          </div>
        </section>
      ))}
    </nav>
  )

  if (!shouldRender) return null

  return (
    <>
      <aside ref={desktopRef} className="hidden h-full w-64 shrink-0 border-r border-border bg-surface p-4 md:block">
        {renderNav(false)}
      </aside>
      <aside ref={mobileRef} className="fixed inset-0 z-50 h-full w-full overflow-y-auto border-b border-border bg-surface p-6 shadow-lg md:hidden">
        {renderNav(true)}
      </aside>
    </>
  )
}
