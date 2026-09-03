import { useThemeStore } from '../stores/themeStore'

export function TopNav() {
  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-6">
      <span className="text-lg font-semibold tracking-tight">AgniDrishti</span>
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
