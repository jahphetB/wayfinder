import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { createMapAdapter } from '@/composition/createMapAdapter'
import type {
  MapAdapter,
  MapAdapterCallbacks,
  MapInitialView,
} from '@/features/map/contracts/MapAdapter'
import type { LocationProvider } from '@/features/navigation/contracts/LocationProvider'
import { LocationProviderError } from '@/features/navigation/contracts/LocationProviderError'
import { MapView } from './MapView'

vi.mock('@/composition/createMapAdapter', () => ({ createMapAdapter: vi.fn() }))

const campusReading = {
  coordinates: { latitude: 43.6544341, longitude: -116.6768005 },
  accuracyMeters: 10,
  capturedAtMilliseconds: Date.now(),
}

function renderMap(provider: LocationProvider) {
  const showUserLocation = vi.fn()
  vi.mocked(createMapAdapter).mockReturnValue({
    initialize: vi.fn(
      (
        _container: HTMLElement,
        _initialView: MapInitialView,
        callbacks?: MapAdapterCallbacks,
      ): void => {
        callbacks?.onReady?.()
      },
    ),
    setMode: vi.fn(),
    setContent: vi.fn(),
    showUserLocation,
    destroy: vi.fn(),
  } satisfies MapAdapter)

  render(
    <MapView
      origin={undefined}
      destination={undefined}
      route={undefined}
      navigationSession={undefined}
      drivingHandoff={undefined}
      mode="3d"
      onModeChange={vi.fn()}
      locationLookupProvider={provider}
    />,
  )
  return showUserLocation
}

describe('MapView location control', () => {
  it('reports refinement progress, cancels, and discards a late result', async () => {
    let complete: ((reading: typeof campusReading) => void) | undefined
    const requestCurrentLocation = vi.fn<
      LocationProvider['requestCurrentLocation']
    >(
      () =>
        new Promise((resolve) => {
          complete = resolve
        }),
    )
    const showUserLocation = renderMap({ requestCurrentLocation })
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Get your location' }))
    const lookup = requestCurrentLocation.mock.calls[0]![0]
    act(() => lookup.onProgress?.({ accuracyMeters: 45, readingCount: 1 }))
    expect(screen.getByRole('status')).toHaveTextContent('about 45 m')
    await user.click(
      screen.getByRole('button', { name: 'Cancel location lookup' }),
    )
    expect(lookup.signal?.aborted).toBe(true)
    expect(screen.getByRole('status')).toHaveTextContent('cancelled')
    await act(async () => {
      complete?.(campusReading)
      await Promise.resolve()
    })
    expect(showUserLocation).not.toHaveBeenCalledWith(campusReading.coordinates)
    expect(
      screen.getByRole('button', { name: 'Get your location' }),
    ).toBeEnabled()
  })

  it('aborts active lookup when the map unmounts', async () => {
    const requestCurrentLocation = vi.fn<
      LocationProvider['requestCurrentLocation']
    >(() => new Promise(() => {}))
    renderMap({ requestCurrentLocation })
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Get your location' }))
    const signal = requestCurrentLocation.mock.calls[0]![0].signal
    cleanup()
    expect(signal?.aborted).toBe(true)
  })
  it('opens building details from the adapter without requesting location', async () => {
    const requestCurrentLocation = vi.fn()
    renderMap({ requestCurrentLocation })
    const adapter = vi.mocked(createMapAdapter).mock.results.at(-1)
      ?.value as MapAdapter
    const callbacks = vi.mocked(adapter).initialize.mock.calls[0]?.[2]
    act(() => callbacks?.onBuildingSelect?.('simplot-dining-hall'))
    expect(
      screen.getByRole('dialog', { name: 'Simplot Dining Hall (Cafeteria)' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/entrance near Blatchley Hall/)).toBeInTheDocument()
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Close building details' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(requestCurrentLocation).not.toHaveBeenCalled()
  })
  it('requests real location only on click and focuses an on-campus reading', async () => {
    const requestCurrentLocation = vi.fn().mockResolvedValue(campusReading)
    const showUserLocation = renderMap({ requestCurrentLocation })

    expect(requestCurrentLocation).not.toHaveBeenCalled()
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Get your location' }))

    await waitFor(() =>
      expect(showUserLocation).toHaveBeenLastCalledWith(
        campusReading.coordinates,
      ),
    )
    expect(screen.getByRole('status')).toHaveTextContent('mapped campus area')
  })

  it('warns when clearly off campus without moving the map', async () => {
    const showUserLocation = renderMap({
      requestCurrentLocation: vi.fn().mockResolvedValue({
        ...campusReading,
        coordinates: { latitude: 43.661, longitude: -116.676 },
      }),
    })
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Get your location' }))

    expect(
      await screen.findByText(/appear to be off campus/),
    ).toBeInTheDocument()
    expect(showUserLocation).toHaveBeenCalledWith(undefined)
    expect(showUserLocation).not.toHaveBeenCalledWith(expect.any(Object))
  })

  it('explains denied permission instead of claiming a position', async () => {
    renderMap({
      requestCurrentLocation: vi
        .fn()
        .mockRejectedValue(new LocationProviderError('permission-denied')),
    })
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Get your location' }))

    expect(await screen.findByText(/permission was denied/)).toBeInTheDocument()
  })
})
