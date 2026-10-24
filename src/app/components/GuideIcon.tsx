import type { RouteManeuver } from '@/domain/navigation/types'

export type GuideIconName =
	| 'pin'
	| 'locate'
	| 'swap'
	| 'menu'
	| 'pause'
	| 'steps'
	| 'left'
	| 'right'
	| 'down'
	| 'close'
	| 'plus'
	| 'minus'
	| RouteManeuver
const paths: Record<GuideIconName, string> = {
	pin: 'M12 21s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12Zm0-15a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
	locate:
		'M12 2v3m0 14v3M2 12h3m14 0h3M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-4 0a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
	swap: 'M7 20V4m-4 4 4-4 4 4m6-4v16m-4-4 4 4 4-4',
	menu: 'M4 6h16M4 12h16M4 18h16',
	pause: 'M8 5v14M16 5v14',
	steps: 'M8 6h12M8 12h12M8 18h12M3 6h1M3 12h1M3 18h1',
	left: 'm14 5-7 7 7 7',
	right: 'm10 5 7 7-7 7',
	down: 'm5 9 7 7 7-7',
	close: 'm6 6 12 12M18 6 6 18',
	plus: 'M12 4v16M4 12h16',
	minus: 'M4 12h16',
	depart: 'M12 21V3m-7 6 7-7 7 7',
	continue: 'M12 21V3m-7 6 7-7 7 7',
	'turn-left': 'M18 21V11a4 4 0 0 0-4-4H4m6-5L4 7l6 5',
	'turn-right': 'M6 21V11a4 4 0 0 1 4-4h10m-6-5 6 5-6 5',
	'turn-around': 'M6 21V9a6 6 0 0 1 12 0v8m-5-5 5 5 4-5',
}
export function GuideIcon({
	name,
	className = '',
}: {
	readonly name: GuideIconName
	readonly className?: string
}) {
	return (
		<svg
			className={`guide-icon ${className}`}
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			focusable="false"
		>
			<path d={paths[name]} />
		</svg>
	)
}
