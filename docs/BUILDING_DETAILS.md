# Building details and photographs

## Available buildings

Library, Sterry Hall, Simplot Dining Hall (Cafeteria) and Hendren Hall have
clickable map footprints and keyboard-accessible detail-menu entries. Their
footprints come from the retained OSM snapshot; Hendren uses way 492831880.
Opening a popup does not choose a route, advance a walkthrough or request GPS.

Simplot Dining Hall and the residence hall share a footprint. Its popup describes
the cafeteria and the separate mapped entrances. Geographic routing is unchanged.

## Supplied photographs

Nine supplied JPEGs are organized in `src/assets/buildings/`, moved from the
original root `Images` folder without modifying their contents.

| Building              | Slides                         |
| --------------------- | ------------------------------ |
| Cruzen-Murray Library | Exterior, study room, interior |
| Sterry Hall           | Two supplied views             |
| Simplot Dining Hall   | Two supplied dining views      |
| Hendren Hall          | Tower/entrance and second view |

The filenames retain the supplied spelling, including `cafteria` and
`hendre-hall-2`. The content records map these to the correctly named destinations.
The library interior contains the embedded photographer credit Gabe Border,
which is displayed below that slide. Supplied filenames and embedded credits
are not proof of a publication license; additional source/license information has
not been supplied.

Vite imports each file as a versioned asset URL, not an inline image in application
JavaScript. The popup requests its displayed slide only, with lazy loading and
asynchronous decoding. Other slides are not preloaded by this component.
The library exterior remains first, as selected in the content records. Web-sized
derivatives are used for the three largest source files; originals remain intact
for provenance and future re-encoding but are not included in the production build
unless imported. The other six already-small supplied files remain unchanged.

| Photo            | Original        | Delivered derivative | Dimensions  |
| ---------------- | --------------- | -------------------- | ----------- |
| Library exterior | 4,241,823 bytes | 330,138 bytes        | 1600 × 1200 |
| Library interior | 406,285 bytes   | 155,321 bytes        | 1200 × 815  |
| Sterry view 1    | 178,875 bytes   | 156,628 bytes        | 1024 × 662  |

`scripts/optimize_building_photos.ps1` reproduces these JPEGs on Windows using
System.Drawing, without a new npm/runtime dependency. It corrects EXIF orientation,
preserves aspect ratio, never upscales, and encodes quality 82 into the fixed
`src/assets/buildings/optimized` outputs. Re-encoding omits embedded metadata;
known photographer credit remains explicitly recorded in buildingDetails.ts.
The script overwrites only its three named derivatives, not source photographs.

```powershell
./scripts/optimize_building_photos.ps1
```

## Proportions, interaction and failure behavior

The image region has a configurable height. `object-fit: contain` scales the
whole photograph into it while preserving its original width-to-height ratio.
Empty space beside a square or portrait photograph is intentional: the image is
neither stretched nor cropped to fill the region. Small source images may appear
soft when enlarged; preserving proportions cannot add missing detail.

Previous/Next controls wrap through two or three slides without autoplay.
Descriptions scroll independently below the images. Escape, the close button or
backdrop closes the native dialog; focus returns to the previous control.
Keyboard focus remains inside the open popup. A failed image has a clear fallback
rather than a broken image icon.

## Key files and connections

- `src/data/campus/buildingDetails.ts` imports photo URLs, alternative text,
  known credit and descriptions, and derives closed footprints from the OSM data.
  It is the content registry: adding Hendren there also supplies its map selection
  polygon through the existing composition boundary.
- `features/buildings/model/BuildingDetails.ts` defines two or more photo records
  and readable detail sections. The map's smaller `MapBuilding` contract contains
  only the geometry and identity needed to recognize a click.
- `createMapAdapter.ts` supplies the registry to `MapLibreMapAdapter.ts`.
  The adapter reports recognized IDs through MapView to App, which opens the
  matching `BuildingDetailsDialog`. Unrecognized map features are ignored.
- `BuildingPhotoCarousel.tsx` owns slide selection, lazy image rendering and
  per-source failure fallback. It does not calculate routes or acquire location.
- `src/styles/building-details.css` owns proportional image display and popup
  layout. Named dimensions live in `theme.css`; they are not buried in components.

## Verification

Automated tests cover all four dialogs, variable slide counts, wrapping, image
fallback, dismissal/focus behavior and Hendren's recognized selection ID. Browser
checks exercised an actual Hendren footprint click and decoded every supplied
image, confirming `object-fit: contain` at desktop/mobile widths. The mobile
dialog has no horizontal overflow. Emulation does not replace a physical-device
or assistive-technology review.
