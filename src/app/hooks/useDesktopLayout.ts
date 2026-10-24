import { useCallback, useMemo, useSyncExternalStore } from 'react'
import { desktopMediaQuery } from '../layoutSettings'

export function useDesktopLayout(): boolean {
	const media = useMemo(() => window.matchMedia(desktopMediaQuery), [])
	const subscribe = useCallback(
		(notify: () => void) => {
			media.addEventListener('change', notify)
			return () => media.removeEventListener('change', notify)
		},
		[media],
	)
	return useSyncExternalStore(
		subscribe,
		() => media.matches,
		() => false,
	)
}
