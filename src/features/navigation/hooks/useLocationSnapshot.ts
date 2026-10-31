import { useLayoutEffect, useRef, useState } from 'react'
import { selectBestRecentReading } from '@/domain/navigation/locationRefinement'
import { createLocationReading } from '@/domain/navigation/locationVerification'
import type { LocationReading } from '@/domain/navigation/types'
import type { LocationProvider } from '../contracts/LocationProvider'
import { LocationProviderError } from '../contracts/LocationProviderError'
import { locationLookupPolicy } from '../model/locationLookupPolicy'

type SnapshotTrigger = 'locate' | 'walkthrough'
interface SnapshotState {
	readonly scope: string
	readonly status: 'idle' | 'loading' | 'ready' | 'error' | 'cancelled'
	readonly reading?: LocationReading
	readonly trigger?: SnapshotTrigger
	readonly message: string
}

const failureMessages = {
	'permission-denied':
		'Location permission was denied. You can continue the walkthrough. Allow location in browser settings to try again.',
	timeout: 'Location took too long. You can continue and try again.',
	unavailable:
		'A fresh location is unavailable. You can continue and try again.',
	unsupported:
		'This browser does not support location. The walkthrough is still available.',
	'insecure-context':
		'Location requires HTTPS or localhost. The walkthrough is still available.',
} as const

export function useLocationSnapshot(provider: LocationProvider, scope: string) {
	const [state, setState] = useState<SnapshotState>({
		scope,
		status: 'idle',
		message: '',
	})
	const requestId = useRef(0)
	const active = useRef(false)
	const controller = useRef<AbortController | undefined>(undefined)

	// Layout cleanup invalidates results before a changed route can paint.
	useLayoutEffect(() => {
		active.current = true
		return () => {
			active.current = false
			requestId.current += 1
			controller.current?.abort()
			controller.current = undefined
		}
	}, [provider, scope])

	async function request(trigger: SnapshotTrigger): Promise<void> {
		if (!active.current) return
		const id = ++requestId.current
		controller.current?.abort()
		const abort = new AbortController()
		controller.current = abort
		setState((previous) => ({
			...previous,
			scope,
			trigger,
			status: 'loading',
			message:
				'Checking your location… Allow access if prompted. Walkthrough controls remain available.',
		}))
		try {
			const result = await provider.requestCurrentLocation({
				signal: abort.signal,
				onProgress: ({ accuracyMeters }) => {
					if (active.current && id === requestId.current)
						setState((previous) => ({
							...previous,
							message: `Improving snapshot… Best reported accuracy: about ${Math.ceil(accuracyMeters)} m.`,
						}))
				},
			})
			if (!active.current || id !== requestId.current) return
			const reading = createLocationReading(result)
			if (
				!selectBestRecentReading(
					[reading],
					Date.now(),
					locationLookupPolicy.maximumReadingAgeMilliseconds,
				)
			)
				throw new LocationProviderError('unavailable')
			setState({
				scope,
				trigger,
				status: 'ready',
				reading,
				message:
					reading.accuracyMeters > locationLookupPolicy.targetAccuracyMeters
						? 'Approximate snapshot; reported accuracy is limited. This is not a live position.'
						: 'Location snapshot updated. This is not a live position.',
			})
		} catch (error) {
			if (!active.current || id !== requestId.current) return
			const code =
				error instanceof LocationProviderError ? error.code : 'unavailable'
			setState((previous) => ({
				...previous,
				scope,
				status: 'error',
				message: failureMessages[code],
			}))
		} finally {
			if (id === requestId.current) {
				controller.current = undefined
			}
		}
	}

	function cancel(): void {
		requestId.current += 1
		controller.current?.abort()
		controller.current = undefined
		setState((previous) => ({
			...previous,
			scope,
			status: 'cancelled',
			message: 'Location lookup cancelled. You can continue the walkthrough.',
		}))
	}

	const scopeChanged = state.scope !== scope
	const status =
		scopeChanged && state.status === 'loading' ? 'cancelled' : state.status
	return {
		...state,
		status,
		message:
			scopeChanged && state.status === 'loading'
				? 'Location lookup cancelled because the route changed.'
				: state.message,
		isLocating: status === 'loading',
		retained: Boolean(state.reading && status !== 'ready'),
		request,
		cancel,
	}
}

export type LocationSnapshot = ReturnType<typeof useLocationSnapshot>
