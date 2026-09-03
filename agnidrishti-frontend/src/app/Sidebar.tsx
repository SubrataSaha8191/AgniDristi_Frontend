import { NavLink } from 'react-router-dom'

const navigation = [
  { label: 'Dashboard', to: '/dashboard', end: true },
  { label: 'Search & Discovery', to: '/search' },
  { label: 'Source Investigation', to: '/investigation' },
  { label: 'Event Assessment', to: '/assessment' },
  { label: 'Change & Anomaly', to: '/anomaly' },
  { label: 'Intelligence Reports', to: '/reports' },
  { label: 'Alerts', to: '/alerts' },
  { label: 'Data Layers', to: '/data-layers' },
  { label: 'System / Model', to: '/system' },
]

export function Sidebar() {
  return (
    <aside className="w-64 shrink-0 border-r border-border bg-surface p-4 max-md:hidden">
      <nav aria-label="Primary navigation" className="space-y-1">
        {navigation.map(({ label, to, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-accent text-white'
                  : 'text-text-secondary hover:bg-bg hover:text-text-primary'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
