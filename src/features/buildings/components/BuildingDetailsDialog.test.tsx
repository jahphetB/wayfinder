import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { campusBuildingDetails } from '@/data/campus/buildingDetails'
import { BuildingDetailsDialog } from './BuildingDetailsDialog'
import { BuildingPhotoCarousel } from './BuildingPhotoCarousel'

describe('building details', () => {
  it.each(campusBuildingDetails)(
    'opens $label with scrollable details and image slides',
    async (building) => {
      const onClose = vi.fn()
      render(<BuildingDetailsDialog building={building} onClose={onClose} />)
      expect(
        screen.getByRole('dialog', { name: building.label }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('region', { name: `About ${building.label}` }),
      ).toHaveAttribute('tabindex', '0')
      expect(screen.getByRole('status')).toHaveTextContent('1 of 2')
      const user = userEvent.setup()
      await user.click(screen.getByRole('button', { name: 'Next image' }))
      expect(screen.getByRole('status')).toHaveTextContent('2 of 2')
      await user.click(screen.getByRole('button', { name: 'Next image' }))
      expect(screen.getByRole('status')).toHaveTextContent('1 of 2')
      await user.click(screen.getByRole('button', { name: 'Previous image' }))
      expect(screen.getByRole('status')).toHaveTextContent('2 of 2')
      fireEvent(
        screen.getByRole('dialog'),
        new Event('cancel', { bubbles: true, cancelable: true }),
      )
      expect(onClose).toHaveBeenCalledTimes(1)
    },
  )

  it('closes with the explicit button and restores the previously focused control', async () => {
    const previous = document.createElement('button')
    document.body.append(previous)
    previous.focus()
    const close = vi.fn()
    const building = campusBuildingDetails[0]!
    const { unmount } = render(
      <BuildingDetailsDialog building={building} onClose={close} />,
    )
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Close building details' }))
    expect(close).toHaveBeenCalledTimes(1)
    unmount()
    expect(previous).toHaveFocus()
    previous.remove()
  })

  it('falls back clearly when a configured image cannot load', () => {
    render(
      <BuildingPhotoCarousel
        photos={[
          { label: 'Exterior', alt: 'Library exterior', src: '/missing.jpg' },
          { label: 'Entrance', alt: 'Library entrance' },
        ]}
      />,
    )
    fireEvent.error(screen.getByRole('img', { name: 'Library exterior' }))
    expect(
      screen.getByRole('img', {
        name: 'Library exterior: photo not available',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('Photo not added yet')).toBeInTheDocument()
  })
})
