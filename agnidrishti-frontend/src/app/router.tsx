import { Link, Navigate, createBrowserRouter, useRouteError } from 'react-router-dom'
import { AppShell } from './AppShell'
import AlertsPage from '../pages/AlertsPage'
import AnomalyPage from '../pages/AnomalyPage'
import AssessmentPage from '../pages/AssessmentPage'
import DashboardPage from '../pages/DashboardPage'
import DataLayersPage from '../pages/DataLayersPage'
import InvestigationPage from '../pages/InvestigationPage'
import LoginPage from '../pages/LoginPage'
import SignupPage from '../pages/SignupPage'
import ReportsPage from '../pages/ReportsPage'
import SearchPage from '../pages/SearchPage'
import SystemPage from '../pages/SystemPage'

function RouteErrorBoundary() {
  const error = useRouteError() as Error | undefined
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
      <div className="max-w-lg border-2 border-black bg-surface p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="text-lg font-black uppercase tracking-wider text-text-primary">Source Data Unavailable</h1>
        <p className="mt-2 text-xs font-semibold text-text-secondary">{error?.message || 'An unexpected issue occurred while rendering this page.'}</p>
        <Link to="/dashboard" className="mt-6 inline-block border-2 border-black bg-black px-4 py-2 text-xs font-black uppercase text-white hover:bg-zinc-800">
          Return to Dashboard
        </Link>
      </div>
    </div>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage />, errorElement: <RouteErrorBoundary /> },
      { path: 'search', element: <SearchPage />, errorElement: <RouteErrorBoundary /> },
      { path: 'investigation/:sourceId?', element: <InvestigationPage />, errorElement: <RouteErrorBoundary /> },
      { path: 'assessment', element: <AssessmentPage />, errorElement: <RouteErrorBoundary /> },
      { path: 'anomaly', element: <AnomalyPage />, errorElement: <RouteErrorBoundary /> },
      { path: 'reports', element: <ReportsPage />, errorElement: <RouteErrorBoundary /> },
      { path: 'alerts', element: <AlertsPage />, errorElement: <RouteErrorBoundary /> },
      { path: 'data-layers', element: <DataLayersPage />, errorElement: <RouteErrorBoundary /> },
      { path: 'system', element: <SystemPage />, errorElement: <RouteErrorBoundary /> },
      { path: 'login', element: <LoginPage />, errorElement: <RouteErrorBoundary /> },
      { path: 'signup', element: <SignupPage />, errorElement: <RouteErrorBoundary /> },
    ],
  },
])
