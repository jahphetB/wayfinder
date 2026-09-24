import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import type { NavigationSession } from '@/domain/navigation/types'

vi.mock('@/features/map/components/MapView', () => ({
  MapView: ({
    navigationSession,
  }: {
    navigationSession: NavigationSession | undefined
  }) => (
    <section
      aria-label="Interactive map"
      data-navigation-step={navigationSession?.currentStepIndex}
    />
  ),
}))

import { App } from './App'

describe('App', () => {
  it('mounts navigation only after preview and resets it when editing the route', async () => {
    const user = userEvent.setup()
    const requestCurrentLocation = vi.fn().mockResolvedValue({
      coordinates: { latitude: 43.6522, longitude: -116.6799 },
      accuracyMeters: 1,
      capturedAtMilliseconds: Date.now(),
    })
    render(<App locationProvider={{ requestCurrentLocation }} />)
    expect(
      screen.queryByRole('button', { name: 'Start navigation' }),
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Preview route' }))
    expect(requestCurrentLocation).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Start navigation' }))
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument()
    expect(
      screen.getByRole('region', { name: 'Interactive map' }),
    ).toHaveAttribute('data-navigation-step', '0')
    await user.click(screen.getByRole('button', { name: 'Preview route' }))
    expect(
      screen.getByRole('button', { name: 'Start navigation' }),
    ).toBeInTheDocument()
    await user.clear(screen.getByRole('combobox', { name: 'Start' }))
    expect(
      screen.queryByRole('region', { name: 'Checkpoint navigation' }),
    ).not.toBeInTheDocument()
  })
  it('renders the route-planning workspace', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: 'Find your way, beautifully.' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('region', { name: 'Interactive map' }),
    ).toBeInTheDocument()
  })

  it('shows a clear invalid-location state after a typed value is not selected', async () => {
    const user = userEvent.setup()
    render(<App />)

    const startInput = screen.getByRole('combobox', { name: 'Start' })
    await user.clear(startInput)
    await user.type(startInput, 'Unknown place')
    await user.click(screen.getByRole('button', { name: 'Preview route' }))

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Choose a suggestion for both locations before previewing a route.',
    )
  })

  it('allows a person to select an autocomplete suggestion with the keyboard', async () => {
    const user = userEvent.setup()
    render(<App />)

    const startInput = screen.getByRole('combobox', { name: 'Start' })
    await user.clear(startInput)
    await user.type(startInput, 'Morrison')
    await user.keyboard('{ArrowDown}{Enter}')

    expect(startInput).toHaveValue('Morrison Quadrangle & Clock Tower')
    await user.click(screen.getByRole('button', { name: 'Preview route' }))
    expect(screen.getByText('Walking route')).toBeInTheDocument()
  })
})
