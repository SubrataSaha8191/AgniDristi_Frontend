import { Outlet } from 'react-router-dom'
import { SourceSnapshotPanel } from '../components/source/SourceSnapshotPanel'
import { Sidebar } from './Sidebar'
import { TopNav } from './TopNav'

export function AppShell() {
  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <TopNav />
      <div className="flex min-h-[calc(100vh-4rem)]">
        <Sidebar />
        <main className="min-w-0 flex-1 p-6 md:p-8">
          <Outlet />
        </main>
        <div id="source-snapshot-panel" aria-label="Source snapshot panel">
          <SourceSnapshotPanel />
        </div>
      </div>
    </div>
  )
}
