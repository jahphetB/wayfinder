import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

vi.mock('@/features/map/components/MapView', () => {
  throw new Error('Simulated map module download failure')
})

import { App } from './App'

it('retains an editable planner when the deferred map module fails', async () => {
  const consoleError = vi
    .spyOn(console, 'error')
    .mockImplementation(() => undefined)
  try {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByRole('heading', { name: 'The map could not open' })
    await user.type(screen.getByRole('combobox', { name: 'Start' }), 'Library')
    await user.click(
      screen.getByRole('option', { name: 'Cruzen-Murray Library' }),
    )
    expect(screen.getByRole('combobox', { name: 'Start' })).toHaveValue(
      'Cruzen-Murray Library',
    )
    expect(screen.getByRole('button', { name: 'Preview route' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Reload page' })).toBeVisible()
  } finally {
    consoleError.mockRestore()
  }
})
