export function MapCanvasPlaceholder() {
  return (
    <section aria-label="Map preview" className="map-preview">
      <svg aria-hidden="true" viewBox="0 0 600 340">
        <path d="M70 260 C160 230,175 100,285 155 S405 250,535 75" />
        <circle cx="70" cy="260" r="14" />
        <circle cx="535" cy="75" r="15" />
      </svg>
      <p>
        <strong>Map preview</strong>
        <span>Interactive map and 2D/3D controls arrive in the next step.</span>
      </p>
    </section>
  )
}
