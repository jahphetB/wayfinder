import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

vi.mock('@/features/map/components/MapView', () => ({
  MapView: () => <section aria-label="Interactive map" />,
}))

import { App } from './App'

describe('App', () => {
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
