import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { AlertsList } from '../src/components/alerts/AlertsList'
import { GLOBAL_ALERTS_EMPTY_MESSAGE, useAlerts, useAlertTypes } from '../src/services/alertService'
import type { AlertsResponse } from '../src/services/alertService'

vi.mock('../src/services/alertService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/services/alertService')>()
  return { ...actual, useAlerts: vi.fn(), useAlertTypes: vi.fn() }
})

const mockedUseAlerts = vi.mocked(useAlerts)
const mockedUseAlertTypes = vi.mocked(useAlertTypes)
const emptyResponse: AlertsResponse = {
  count: 0,
  total: 0,
  limit: 50,
  offset: 0,
  has_more: false,
  filters: { alert_type: null, matched_alert_types: [] },
  alerts: [],
}

function queryResult(overrides: Record<string, unknown> = {}) {
  return {
    data: emptyResponse,
    isPending: false,
    isError: false,
    isFetching: false,
    dataUpdatedAt: 0,
    refetch: vi.fn(),
    ...overrides,
  } as never
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

mockedUseAlertTypes.mockReturnValue(queryResult({ data: [] }))

describe('AlertsList', () => {
  it('renders the global empty state', () => {
    mockedUseAlerts.mockReturnValue(queryResult())
    render(<MemoryRouter><AlertsList /></MemoryRouter>)

    expect(screen.getByText(GLOBAL_ALERTS_EMPTY_MESSAGE)).toBeInTheDocument()
  })

  it('renders the filtered empty state', () => {
    mockedUseAlerts.mockReturnValue(queryResult())
    render(<MemoryRouter initialEntries={['/alerts?type=ABNORMAL_KNOWN_SOURCE']}><AlertsList /></MemoryRouter>)

    expect(screen.getByText('No alerts match the selected type.')).toBeInTheDocument()
  })

  it('sends the selected type and resets pagination when the filter changes', () => {
    mockedUseAlerts.mockReturnValue(queryResult())
    render(<MemoryRouter initialEntries={['/alerts?type=REPEATED_UNMATCHED&page=3']}><AlertsList /></MemoryRouter>)

    expect(mockedUseAlerts).toHaveBeenLastCalledWith({ alertTypes: ['REPEATED_UNMATCHED'], limit: 50, offset: 100 })
    fireEvent.click(screen.getByRole('button', { name: 'Abnormal Known Source' }))
    expect(mockedUseAlerts).toHaveBeenLastCalledWith({ alertTypes: ['ABNORMAL_KNOWN_SOURCE'], limit: 50, offset: 0 })
  })

  it('renders pagination totals, missing identifiers safely, and exact map coordinates', () => {
    mockedUseAlerts.mockReturnValue(queryResult({
      data: {
        ...emptyResponse,
        count: 1,
        total: 120,
        has_more: true,
        alerts: [{
          id: 123,
          alert_type: 'REPEATED_UNMATCHED',
          firms_uid: null,
          object_uid: null,
          latitude: 22.5,
          longitude: 88.3,
          severity: 'high',
          message: 'Repeated unidentified thermal activity detected.',
          resolved: false,
          created_at: '2026-09-09T04:50:33Z',
        }],
      },
    }))
    render(<MemoryRouter><AlertsList /></MemoryRouter>)

    expect(screen.getByText('Location incident #123')).toBeInTheDocument()
    expect(screen.queryByText(/FIRMS reference:/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Object reference:/)).not.toBeInTheDocument()
    expect(screen.getByText(/1 loaded · 119 remaining/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /view on map/i })).toHaveAttribute('href', 'https://www.openstreetmap.org/?mlat=22.5&mlon=88.3#map=15/22.5/88.3')
  })

  it('renders loading and API error states with retry', () => {
    mockedUseAlerts.mockReturnValue(queryResult({ data: undefined, isPending: true }))
    const view = render(<MemoryRouter><AlertsList /></MemoryRouter>)
    expect(screen.getByRole('status', { name: 'Loading alerts' })).toBeInTheDocument()

    view.unmount()
    const refetch = vi.fn()
    mockedUseAlerts.mockReturnValue(queryResult({ data: undefined, isError: true, refetch }))
    render(<MemoryRouter><AlertsList /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(refetch).toHaveBeenCalledOnce()
  })
})
