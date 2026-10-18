# Building details

The preview includes selectable footprints for Cruzen-Murray Library, Sterry
Hall, and Simplot Dining Hall (Cafeteria). Click or tap one of the purple-outlined
buildings to open its details. Keyboard users can Tab to the three building-detail
buttons; those controls become visible when focused.

## Popup behavior

The popup contains an image area with Previous and Next controls, followed by a
separately scrollable description and detail sections. Close it using the close
button, Escape, or the backdrop. Focus returns to the previous control when it
closes. Tab and Shift+Tab wrap between the popup's controls and scrollable content.
Opening details does not choose a route, advance navigation, or request GPS.

There are two labeled photo slots for each building. No approved photographs have
been supplied, so the slots display **Photo not added yet**. They are not pictures
of actual buildings. A configured image that fails to load also shows the fallback.
The image controls do not autoplay.

Simplot Dining Hall and the residence hall share one OSM footprint. Selecting that
footprint opens cafeteria information. The text explains the separate cafeteria
entrance near Blatchley Hall; routing to either destination remains unchanged.
Other buildings have not been enabled for details.

## Files and data flow

1. `src/data/campus/buildingDetails.ts` contains the three content records and
   derives their closed footprints from the existing OSM snapshot.
2. `features/buildings/model/BuildingDetails.ts` defines the content shape, including
   two or more photo records. `features/map/contracts/MapBuilding.ts` describes
   only the provider-independent shape needed for map selection.
3. `createMapAdapter.ts` supplies these footprints to the MapLibre adapter.
4. `MapLibreMapAdapter.ts` draws a small fill and outline, queries the clicked
   feature, and sends its recognized ID through `onBuildingSelect`. The click
   listener is removed on map destruction.
5. `MapView.tsx` resolves the ID to content and opens `BuildingDetailsDialog.tsx`.
   `BuildingPhotoCarousel.tsx` owns slide selection and image-loading fallback.
6. `src/styles/building-details.css` controls the popup. Its width, photo height,
   description height, and backdrop color are labeled in `theme.css`.

The native HTML dialog supplies the browser's modal behavior and focus boundary.
React renders plain text, not imported HTML from a map property. Unit tests check
the adapter, slide behavior, failure fallback, dismissal, focus restoration, and
the selection-to-dialog connection. Browser tests check actual map clicks and
phone presentation; the test environment's dialog stub cannot prove browser focus
trapping or physical touchscreen behavior.

## Add real photographs

Use photographs the project may publish. Place optimized assets in
`public/images/buildings/` and add their root-relative URL to the matching photo
record. Keep descriptive alternative text for people using screen readers and
record a photographer credit where required. For example:

```typescript
photos: [
  {
    label: 'Exterior',
    src: '/images/buildings/library-exterior.webp',
    alt: 'Cruzen-Murray Library exterior viewed from the walkway',
    credit: 'Photo credit with permission',
  },
  {
    label: 'Entrance',
    src: '/images/buildings/library-entrance.webp',
    alt: 'Main entrance of Cruzen-Murray Library',
  },
]
```

Use actual filenames, views, and credits rather than copying sample descriptions
that do not match the image. A third record adds a third slide automatically.
Compress large camera originals before committing them; inspect the result on a
phone for legibility and loading cost. Route or access details should have a
verified source before being described as current facts.

Run `npm run check`, inspect the preview at desktop and phone widths, check all
three popups, and follow [the release workflow](RELEASE_WORKFLOW.md). Adding other
selectable buildings is a separate scope change; this implementation includes only
the three approved buildings.
