import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import type { Location, LocationSearchResult } from '@/domain/navigation/types'
import { GuideIcon } from '@/app/components/GuideIcon'

interface FieldProps {
	readonly label: string
	readonly query: string
	readonly suggestions: readonly LocationSearchResult[]
	readonly onChange: (value: string) => void
	readonly onSelect: (location: Location) => void
}
export function LocationField({
	label,
	query,
	suggestions,
	onChange,
	onSelect,
}: FieldProps) {
	const [open, setOpen] = useState(false)
	const [activeIndex, setActiveIndex] = useState(-1)
	const listboxId = useId()
	const listboxRef = useRef<HTMLUListElement>(null)
	const hasOptions = open && suggestions.length > 0

	useEffect(() => {
		if (!open || activeIndex < 0) return
		listboxRef.current?.children
			.item(activeIndex)
			?.scrollIntoView?.({ block: 'nearest' })
	}, [activeIndex, open])

	function selectSuggestion(location: Location): void {
		onSelect(location)
		setOpen(false)
		setActiveIndex(-1)
	}

	function moveActiveSuggestion(direction: 1 | -1): void {
		if (suggestions.length === 0) return

		setOpen(true)
		setActiveIndex((currentIndex) => {
			const nextIndex = currentIndex + direction
			if (nextIndex < 0) return suggestions.length - 1
			return nextIndex % suggestions.length
		})
	}

	function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
		if (event.key === 'ArrowDown') {
			event.preventDefault()
			moveActiveSuggestion(1)
		} else if (event.key === 'ArrowUp') {
			event.preventDefault()
			moveActiveSuggestion(-1)
		} else if (event.key === 'Enter' && open && activeIndex >= 0) {
			const suggestion = suggestions[activeIndex]
			if (!suggestion) return
			event.preventDefault()
			selectSuggestion(suggestion.location)
		} else if (event.key === 'Escape') {
			event.preventDefault()
			setOpen(false)
			setActiveIndex(-1)
		}
	}

	return (
		<div
			className={
				label === 'Destination'
					? 'location-field location-field--destination'
					: 'location-field location-field--origin'
			}
		>
			<label>
				<span className="location-field-label">{label}</span>
				<span className="location-input-wrap">
					<GuideIcon name="pin" />
					<input
						aria-label={label}
						aria-activedescendant={
							hasOptions && suggestions[activeIndex]
								? `${listboxId}-option-${activeIndex}`
								: undefined
						}
						aria-autocomplete="list"
						aria-controls={hasOptions ? listboxId : undefined}
						aria-describedby={`${listboxId}-help`}
						aria-expanded={hasOptions}
						onBlur={() => {
							setOpen(false)
							setActiveIndex(-1)
						}}
						onChange={(event) => {
							onChange(event.target.value)
							setOpen(true)
							setActiveIndex(-1)
						}}
						onFocus={() => {
							setOpen(true)
							setActiveIndex(-1)
						}}
						onKeyDown={handleKeyDown}
						role="combobox"
						placeholder={
							label === 'Start'
								? 'Choose a starting point'
								: 'Choose a destination'
						}
						value={query}
					/>
				</span>
			</label>
			<p className="visually-hidden" id={`${listboxId}-help`}>
				Type to search. Use Up and Down arrows to review suggestions, Enter to
				select, and Escape to close.
			</p>
			<p className="visually-hidden" aria-live="polite" aria-atomic="true">
				{open &&
					(suggestions.length === 0
						? `No matching ${label.toLowerCase()} locations.`
						: `${suggestions.length} ${label.toLowerCase()} suggestions available.`)}
			</p>
			{open && suggestions.length === 0 && (
				<p className="suggestions">No matching locations.</p>
			)}
			{hasOptions && (
				<ul
					aria-label={`${label} suggestions`}
					className="suggestion-list"
					id={listboxId}
					ref={listboxRef}
					role="listbox"
				>
					{suggestions.map(({ location }, index) => (
						<li
							className="suggestion-option"
							id={`${listboxId}-option-${index}`}
							key={location.id}
							aria-selected={activeIndex === index}
							onMouseDown={(event) => event.preventDefault()}
							onClick={() => selectSuggestion(location)}
							role="option"
							tabIndex={-1}
						>
							{location.label}
						</li>
					))}
				</ul>
			)}
		</div>
	)
}
