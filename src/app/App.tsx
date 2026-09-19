import { NavigationPanel } from '@/features/navigation/components/NavigationPanel'
import { MapCanvasPlaceholder } from '@/features/map/components/MapCanvasPlaceholder'

export function App() {
  return (
    <main className="app-shell">
      <header className="page-header">
        <div className="brand">
          <span aria-hidden="true" className="brand-mark" />
          Yote Wayfinder
        </div>
        <span className="header-status">Prototype</span>
      </header>
      <section
        aria-label="Route planning workspace"
        className="wayfinder-layout"
      >
        <NavigationPanel />
        <MapCanvasPlaceholder />
      </section>
    </main>
  )
}
