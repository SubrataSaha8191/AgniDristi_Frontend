import {
  AlertCircle,
  Bell,
  FileSearch,
  FileText,
  Layers,
  LayoutDashboard,
  Search,
  Settings,
  TrendingUp,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useUIStore } from '../stores/uiStore'

const navigationSections = [
  {
    label: 'GENERAL',
    items: [
      { label: 'Dashboard', to: '/dashboard', end: true, icon: LayoutDashboard },
      { label: 'Search & Discovery', to: '/search', icon: Search },
      { label: 'Source Investigation', to: '/investigation', icon: FileSearch },
      { label: 'Event Assessment', to: '/assessment', icon: AlertCircle },
      { label: 'Change & Anomaly', to: '/anomaly', icon: TrendingUp },
      { label: 'Alerts', to: '/alerts', icon: Bell },
    ],
  },
  {
    label: 'REPORTING',
    items: [
      { label: 'Intelligence Reports', to: '/reports', icon: FileText },
      { label: 'Data Layers', to: '/data-layers', icon: Layers },
    ],
  },
  {
    label: 'SYSTEM',
    items: [{ label: 'System / Model', to: '/system', icon: Settings }],
  },
]

export function Sidebar() {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen)

  if (!sidebarOpen) return null

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-surface p-4 max-md:hidden">
      <nav aria-label="Primary navigation">
        {navigationSections.map(({ label: sectionLabel, items }) => (
          <section key={sectionLabel} className="mt-6 first:mt-0">
            <h2 className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary">{sectionLabel}</h2>
            <div className="space-y-1">
              {items.map(({ label, to, end, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-accent text-white'
                        : 'text-text-secondary hover:bg-bg hover:text-text-primary'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={16} className={isActive ? 'text-white' : 'text-text-secondary'} aria-hidden="true" />
                      {label}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </section>
        ))}
      </nav>
    </aside>
  )
}
