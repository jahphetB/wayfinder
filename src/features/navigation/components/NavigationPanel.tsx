import { useState } from 'react'
import type {
  Location,
  LocationSearchResult,
  Route,
} from '@/domain/navigation/types'
import { useRoutePlanner } from '../hooks/useRoutePlanner'

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
  return (
    <div className="location-field">
      <label>
        {label}
        <input
          aria-label={label}
          aria-expanded={open}
          onBlur={() => setOpen(false)}
          onChange={(event) => {
            onChange(event.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          role="combobox"
          value={query}
        />
      </label>
      {open && (
        <ul
          aria-label={`${label} suggestions`}
          className="suggestions"
          role="listbox"
        >
          {suggestions.map(({ location }) => (
            <li key={location.id}>
              <button
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSelect(location)
                  setOpen(false)
                }}
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
  route,
  origin,
  destination,
}: {
  route: Route | undefined
  origin: Location | undefined
  destination: Location | undefined
}) {
  if (!route || !origin || !destination)
    return (
      <p className="route-summary-empty">
        Select locations, then preview a sample route.
      </p>
    )
  return (
    <section aria-live="polite" className="route-summary">
      <p>Sample route</p>
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
export function NavigationPanel() {
  const planner = useRoutePlanner()
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
        <button
          className="route-action"
          disabled={!planner.canPlanRoute}
          type="submit"
        >
          Preview route
        </button>
      </form>
      <RouteSummary
        destination={planner.destination}
        origin={planner.origin}
        route={planner.plannedRoute}
      />
    </section>
  )
}
