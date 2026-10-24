import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { SiteFooter } from './SiteFooter'
import { PrivacyDialog } from './PrivacyDialog'
it('credits the developer and opens a focus-restoring native privacy dialog', async () => {
	function Harness() {
		const [open, setOpen] = useState(false)
		return (
			<>
				<SiteFooter onPrivacy={() => setOpen(true)} />
				{open && <PrivacyDialog onClose={() => setOpen(false)} />}
			</>
		)
	}
	const user = userEvent.setup()
	render(<Harness />)
	expect(screen.getByRole('contentinfo')).toHaveTextContent(
		'Wayfinder™ · Developed by Yaphet',
	)
	const privacy = screen.getByRole('button', { name: 'Privacy' })
	await user.click(privacy)
	expect(
		screen.getByRole('dialog', { name: 'Location & privacy' }),
	).toBeVisible()
	expect(screen.getByText(/Only Get my location/)).toBeVisible()
	await user.click(
		screen.getByRole('button', { name: 'Close privacy information' }),
	)
	expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
	expect(privacy).toHaveFocus()
})
