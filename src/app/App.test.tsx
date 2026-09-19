import { render, screen } from '@testing-library/react'
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
})
