import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from '@/app/App'
import { ErrorBoundary } from '@/app/components/ErrorBoundary'
import { FailureRecovery } from '@/app/components/FailureRecovery'
import 'maplibre-gl/dist/maplibre-gl.css'
import '@/styles/theme.css'
import '@/styles/global.css'
import '@/styles/layout.css'
import '@/styles/navigation.css'
import '@/styles/map.css'
import '@/styles/building-details.css'
import '@/styles/error-recovery.css'
import '@/styles/footer.css'
import '@/styles/responsive.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
	throw new Error('Application root element was not found')
}

createRoot(rootElement).render(
	<StrictMode>
		<ErrorBoundary fallback={<FailureRecovery scope="page" />}>
			<App />
		</ErrorBoundary>
	</StrictMode>,
)
