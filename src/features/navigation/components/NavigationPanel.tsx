import { useId, useState, type KeyboardEvent } from 'react'
import type {
  Location,
  LocationSearchResult,
  NavigationSession,
} from '@/domain/navigation/types'
import { useRoutePlanner } from '../hooks/useRoutePlanner'
import type { RoutePlanState } from '../model/routePlanner'
import type { LocationProvider } from '../contracts/LocationProvider'
import { CheckpointNavigation } from './CheckpointNavigation'

interface FieldProps {
  readonly label: string
  readonly query: string
  readonly suggestions: readonly LocationSearchResult[]
  readonly onChange: (value: string) => void
  readonly onSelect: (location: Location) => void
}
function LocationField({
  label,
  query,
  suggestions,
  onChange,
  onSelect,
}: FieldProps) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const listboxId = useId()

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
      setOpen(false)
      setActiveIndex(-1)
    }
  }

  return (
    <div className="location-field">
      <label>
        {label}
        <input
          aria-label={label}
          aria-activedescendant={
            open && activeIndex >= 0
              ? `${listboxId}-option-${activeIndex}`
              : undefined
          }
          aria-autocomplete="list"
          aria-controls={open ? listboxId : undefined}
          aria-expanded={open}
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
          value={query}
        />
      </label>
      {open && (
        <ul
          aria-label={`${label} suggestions`}
          className="suggestions"
          id={listboxId}
          role="listbox"
        >
          {suggestions.map(({ location }, index) => (
            <li id={`${listboxId}-option-${index}`} key={location.id}>
              <button
                aria-selected={activeIndex === index}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectSuggestion(location)}
                role="option"
                type="button"
              >
                {location.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
function RouteSummary({
  planState,
  origin,
  destination,
}: {
  planState: RoutePlanState
  origin: Location | undefined
  destination: Location | undefined
}) {
  if (planState.status === 'invalid-location')
    return (
      <p className="route-summary-error" role="alert">
        Choose a suggestion for both locations before previewing a route.
      </p>
    )

  if (planState.status === 'route-unavailable')
    return (
      <p className="route-summary-error" role="alert">
        A walking route is not available for this location pair yet.
      </p>
    )

  if (planState.status === 'empty' || !origin || !destination)
    return (
      <p className="route-summary-empty">
        Select locations, then preview a walking route.
      </p>
    )

  const { route } = planState

  return (
    <section aria-live="polite" className="route-summary">
      <p>Walking route</p>
      <strong>
        {origin.label} to {destination.label}
      </strong>
      <div>
        <b>{route.estimatedDurationMinutes} min</b>
        <span>{(route.distanceMeters / 1000).toFixed(1)} km</span>
      </div>
    </section>
  )
}
export function NavigationPanel({
  planner,
  locationProvider,
  onNavigationSessionChange,
}: {
  readonly planner: ReturnType<typeof useRoutePlanner>
  readonly locationProvider: LocationProvider
  readonly onNavigationSessionChange: (session: NavigationSession) => void
}) {
  return (
    <section className="navigation-panel">
      <p className="eyebrow">Route planner</p>
      <h1>Find your way, beautifully.</h1>
      <p className="panel-intro">
        Pick your start and destination to preview a simple walking route.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          planner.planRoute()
        }}
      >
        <LocationField
          label="Start"
          onChange={(value) => planner.changeQuery('origin', value)}
          onSelect={(location) => planner.selectLocation('origin', location)}
          query={planner.originQuery}
          suggestions={planner.originSuggestions}
        />
        <button
          aria-label="Swap start and destination"
          className="swap-locations"
          onClick={planner.swapLocations}
          type="button"
        >
          ↕
        </button>
        <LocationField
          label="Destination"
          onChange={(value) => planner.changeQuery('destination', value)}
          onSelect={(location) =>
            planner.selectLocation('destination', location)
          }
          query={planner.destinationQuery}
          suggestions={planner.destinationSuggestions}
        />
        <button className="route-action" type="submit">
          Preview route
        </button>
      </form>
      <RouteSummary
        destination={planner.destination}
        origin={planner.origin}
        planState={planner.routePlanState}
      />
      {planner.plannedRoute && (
        <CheckpointNavigation
          key={planner.routeRevision}
          route={planner.plannedRoute}
          provider={locationProvider}
          onSessionChange={onNavigationSessionChange}
        />
      )}
    </section>
  )
}
