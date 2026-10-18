import { useState } from 'react'
import type { BuildingDetails } from '../model/BuildingDetails'

export function BuildingPhotoCarousel({
  photos,
}: Pick<BuildingDetails, 'photos'>) {
  const [index, setIndex] = useState(0)
  const [failedSources, setFailedSources] = useState<readonly string[]>([])
  const photo = photos[index] ?? photos[0]
  const source = photo.src
  return (
    <section
      className="building-gallery"
      aria-label="Building images"
      aria-roledescription="carousel"
    >
      <div className="building-gallery-image">
        {source && !failedSources.includes(source) ? (
          <img
            src={source}
            alt={photo.alt}
            loading="lazy"
            decoding="async"
            onError={() =>
              setFailedSources((previous) => [...previous, source])
            }
          />
        ) : (
          <div
            className="building-photo-placeholder"
            role="img"
            aria-label={`${photo.alt}: photo not available`}
          >
            <span aria-hidden="true">▧</span>
            <strong>{photo.label}</strong>
            <span>Photo not added yet</span>
          </div>
        )}
      </div>
      <div className="building-gallery-controls">
        <button
          type="button"
          aria-label="Previous image"
          onClick={() => setIndex((index + photos.length - 1) % photos.length)}
        >
          ←
        </button>
        <span role="status" aria-live="polite">
          {photo.label} · {index + 1} of {photos.length}
        </span>
        <button
          type="button"
          aria-label="Next image"
          onClick={() => setIndex((index + 1) % photos.length)}
        >
          →
        </button>
      </div>
      {source && !failedSources.includes(source) && photo.credit && (
        <small className="building-photo-credit">{photo.credit}</small>
      )}
    </section>
  )
}
