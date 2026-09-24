import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { createWalkingGraph } from '@/domain/navigation/factories'
import { findWalkingRoute } from '@/domain/navigation/walkingRoutes'
import type { Coordinates, LocationReading } from '@/domain/navigation/types'
import { LocationProviderError } from '../contracts/LocationProviderError'
import { PrototypeLocationProvider } from '../infrastructure/PrototypeLocationProvider'
import { CheckpointNavigation } from './CheckpointNavigation'

const origin = { latitude: 43.65, longitude: -116.68 }
const turn = { latitude: 43.651, longitude: -116.68 }
const destination = { latitude: 43.651, longitude: -116.679 }
const route = findWalkingRoute(
  createWalkingGraph({
    nodes: [
      { id: 'a', coordinates: origin },
      { id: 'b', coordinates: turn },
      { id: 'c', coordinates: destination },
    ],
    edges: [
      { id: 'ab', fromNodeId: 'a', toNodeId: 'b', distanceMeters: 100 },
      { id: 'bc', fromNodeId: 'b', toNodeId: 'c', distanceMeters: 80 },
    ],
  }),
  'a',
  'c',
)!
let timestamp = Date.now() - 1000
function reading(
  coordinates: Coordinates,
  accuracyMeters = 1,
): LocationReading {
  return { coordinates, accuracyMeters, capturedAtMilliseconds: ++timestamp }
}

describe('CheckpointNavigation', () => {
  it('labels simulation and can complete the route from anywhere', async () => {
    const user = userEvent.setup()
    render(
      <CheckpointNavigation
        route={route}
        provider={new PrototypeLocationProvider()}
      />,
    )
    expect(screen.getByText(/Demo location is on/)).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(
      'simulate the selected starting checkpoint',
    )
    await user.click(screen.getByRole('button', { name: 'Start navigation' }))
    await user.click(screen.getByRole('button', { name: 'Next Turn' }))
    await user.click(screen.getByRole('button', { name: 'Next Turn' }))
    expect(screen.getByRole('status')).toHaveTextContent('You have arrived')
  })

  it('does not start navigation from an expired initial reading', async () => {
    const user = userEvent.setup()
    const requestCurrentLocation = vi.fn().mockResolvedValue({
      ...reading(origin),
      capturedAtMilliseconds: Date.now() - 60_000,
    })
    render(
      <CheckpointNavigation
        route={route}
        provider={{ requestCurrentLocation }}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Start navigation' }))
    expect(screen.getByRole('status')).toHaveTextContent('not fresh enough')
    expect(screen.queryByText('Step 1 of 2')).not.toBeInTheDocument()
  })

  it('requests only on clicks and walks origin, turn, destination through arrival', async () => {
    const user = userEvent.setup()
    const requestCurrentLocation = vi
      .fn()
      .mockResolvedValueOnce(reading(origin))
      .mockResolvedValueOnce(reading(turn))
      .mockResolvedValueOnce(reading(destination))
    render(
      <CheckpointNavigation
        route={route}
        provider={{ requestCurrentLocation }}
      />,
    )
    expect(requestCurrentLocation).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Start navigation' }))
    expect(await screen.findByText('Step 1 of 2')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Next Turn' }))
    expect(await screen.findByText('Step 2 of 2')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Next Turn' }))
    expect(await screen.findByRole('status')).toHaveTextContent(
      'You have arrived',
    )
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(requestCurrentLocation).toHaveBeenCalledTimes(3)
  })

  it('preserves the step across uncertainty, mismatch and permission failure, then retries', async () => {
    const user = userEvent.setup()
    const requestCurrentLocation = vi
      .fn()
      .mockResolvedValueOnce(reading(origin))
      .mockResolvedValueOnce(reading(turn, 100))
      .mockResolvedValueOnce(reading(origin))
      .mockRejectedValueOnce(new LocationProviderError('permission-denied'))
      .mockResolvedValueOnce(reading(turn))
    render(
      <CheckpointNavigation
        route={route}
        provider={{ requestCurrentLocation }}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Start navigation' }))
    await user.click(screen.getByRole('button', { name: 'Next Turn' }))
    expect(screen.getByRole('status')).toHaveTextContent('not accurate enough')
    await user.click(screen.getByRole('button', { name: 'Try location again' }))
    expect(screen.getByRole('status')).toHaveTextContent('wrong location')
    await user.click(screen.getByRole('button', { name: 'Try location again' }))
    expect(screen.getByRole('status')).toHaveTextContent('denied')
    expect(screen.getByText('Step 1 of 2')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Try location again' }))
    expect(screen.getByText('Step 2 of 2')).toBeInTheDocument()
  })

  it.each([
    'timeout',
    'unavailable',
    'unsupported',
    'insecure-context',
  ] as const)('shows recoverable %s failures', async (code) => {
    const user = userEvent.setup()
    const requestCurrentLocation = vi
      .fn()
      .mockRejectedValue(new LocationProviderError(code))
    render(
      <CheckpointNavigation
        route={route}
        provider={{ requestCurrentLocation }}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Start navigation' }))
    expect(
      screen.getByRole('button', { name: 'Try location again' }),
    ).toBeEnabled()
    expect(screen.queryByText('Step 1 of 2')).not.toBeInTheDocument()
  })

  it('disables repeat requests while pending and discards late results after route replacement', async () => {
    const user = userEvent.setup()
    let resolve!: (reading: LocationReading) => void
    const requestCurrentLocation = vi.fn(
      () =>
        new Promise<LocationReading>((done) => {
          resolve = done
        }),
    )
    const { rerender } = render(
      <CheckpointNavigation
        key="first"
        route={route}
        provider={{ requestCurrentLocation }}
      />,
    )
    await user.dblClick(
      screen.getByRole('button', { name: 'Start navigation' }),
    )
    expect(requestCurrentLocation).toHaveBeenCalledTimes(1)
    expect(
      screen.getByRole('button', { name: 'Checking location…' }),
    ).toBeDisabled()
    rerender(
      <CheckpointNavigation
        key="second"
        route={route}
        provider={{ requestCurrentLocation }}
      />,
    )
    await act(async () => {
      resolve(reading(origin))
      await Promise.resolve()
    })
    expect(
      screen.getByRole('button', { name: 'Start navigation' }),
    ).toBeEnabled()
    expect(screen.queryByText('Step 1 of 2')).not.toBeInTheDocument()
  })

  it('rejects a reused reading and a stale reading without advancing', async () => {
    const user = userEvent.setup()
    const first = reading(origin)
    const requestCurrentLocation = vi
      .fn()
      .mockResolvedValueOnce(first)
      .mockResolvedValueOnce({ ...first, coordinates: turn })
      .mockResolvedValueOnce({
        ...reading(turn),
        capturedAtMilliseconds: Date.now() - 60_000,
      })
    render(
      <CheckpointNavigation
        route={route}
        provider={{ requestCurrentLocation }}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Start navigation' }))
    await user.click(screen.getByRole('button', { name: 'Next Turn' }))
    expect(screen.getByRole('status')).toHaveTextContent(
      'fresh location could not',
    )
    await user.click(screen.getByRole('button', { name: 'Try location again' }))
    expect(screen.getByText('Step 1 of 2')).toBeInTheDocument()
  })
})
