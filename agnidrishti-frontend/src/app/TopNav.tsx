import { Menu } from 'lucide-react'
import { useThemeStore } from '../stores/themeStore'
import { useUIStore } from '../stores/uiStore'

export function TopNav() {
  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)
  const sidebarOpen = useUIStore((state) => state.sidebarOpen)
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={sidebarOpen ? 'Hide navigation' : 'Show navigation'}
          aria-expanded={sidebarOpen}
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-text-secondary hover:bg-bg hover:text-text-primary"
        >
          <Menu size={20} aria-hidden="true" />
        </button>
        <span className="text-lg font-semibold tracking-tight">AgniDrishti</span>
      </div>
      <button
        type="button"
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        aria-pressed={theme === 'dark'}
        onClick={toggleTheme}
        className="rounded-lg border border-border px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary"
      >
        {theme === 'light' ? 'Dark mode' : 'Light mode'}
      </button>
    </header>
  )
}
