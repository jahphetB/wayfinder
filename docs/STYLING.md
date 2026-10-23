# Styling and map presentation

## Change the appearance

Start with `src/styles/theme.css`. Its `:root` block lists named CSS variables,
which are reusable values referenced by the component styles. Change a value,
save, and inspect the local preview before publishing the feature branch.

| Setting                        | Variable or file                                    |
| ------------------------------ | --------------------------------------------------- |
| Main purple and button color   | `--color-brand`                                     |
| Page gradient highlight        | `--color-page-glow`                                 |
| Navigation background          | `--color-panel`                                     |
| Main text and keyboard outline | `--color-text`, `--color-focus`                     |
| Font family                    | `--font-family`                                     |
| Heading size                   | `--font-size-title`, `--font-size-title-mobile`     |
| Main button height             | `--button-height`, `--button-height-mobile`         |
| Outer corners                  | `--frame-radius` (`0` keeps square corners)         |
| Desktop width and padding      | `--layout-max-width`, `--layout-padding`            |
| Phone padding                  | `--layout-padding-mobile`, `--panel-padding-mobile` |
| Navigation panel width         | `--panel-min-width`, `--panel-max-width`            |
| Map canvas minimum height      | `--map-min-height`, `--map-min-height-mobile`       |
| Outside-canvas control spacing | `--map-toolbar-padding`                             |
| Back/Next shared bar width     | `--walkthrough-controls-max-width`                  |

`rem` is relative to the browser's base font size; `px` is a CSS pixel. Keep
controls readable and reachable when changing either. Map controls use ordinary
document flow, not offsets above the canvas. Preserve contrast and focus visibility.

## Unobstructed map and responsive walkthrough

`layout.css` assigns named CSS Grid regions: planner, map and walkthrough. CSS
Grid is a layout system that positions the same elements differently without
duplicating buttons. On desktop the planner/walkthrough share the left column
beside a larger map. At 760 px and below, the order becomes planner, map, then
walkthrough. Active instructions, Back and Next are therefore under the map on
mobile; Start navigating remains immediately after Preview route.

Back and Next share two equal-width grid columns, identical padding and a common
minimum height. Change the named button-height variables rather than adjusting
one action independently. Their domain behavior and location triggers are unchanged.

`map.css` gives the actual canvas a separate `.map-viewport` with explicit minimum
height. Location/mode controls sit in `.map-toolbar`; status/retry messages and
notes have their own space outside it. Building shortcuts expand below the canvas
using native details/summary. Only required map attribution remains on the map.
Never apply absolute positioning to those outside-canvas controls to save space.

Desktop width is capped at 1800 px with reduced side padding; the planner is
capped at 24 rem and the map receives the remaining width. Mobile page padding
and 28-rem canvas minimum are retained. Footer width follows the same layout cap.

## File responsibilities and order

`src/main.tsx` imports the styles in this order, after MapLibre's own stylesheet:

1. `theme.css`: named values; the main editing surface.
2. `global.css`: browser-wide defaults, font inheritance, and focus rules.
3. `layout.css`: outer frame, header, panel, and title layout.
4. `navigation.css`: inputs, suggestions, route summaries and manual controls.
5. `map.css`: canvas viewport and outside-canvas controls/status/information.
6. `building-details.css`: image gallery and scrollable building popup.
7. `error-recovery.css`: page/deferred-map failure messages and recovery actions.
8. `footer.css`: compact credit and expandable privacy disclosure.
9. `responsive.css`: phone-specific adjustments at 760 CSS pixels.

Keep screen rules in these files, rather than adding inline styling to JSX.
`responsive.css` owns the layout breakpoint because ordinary CSS custom properties
cannot be used as media-query conditions. The viewport check in `MapView.tsx`
must stay consistent if the 760-pixel threshold changes.

Most layout details remain close to their selectors. Extract a new variable when
it represents a meaningful setting or repeated design value; do not make every
one-off number a global setting. No third-party styling framework is required.

## Settings drawn inside the map

`src/features/map/model/mapPresentation.ts` contains typed camera and route-color
settings. MapLibre draws those inside its graphics canvas, so ordinary CSS cannot
recolor them. The file labels angles in degrees, durations in milliseconds, and
screen offsets in pixels. A larger zoom level shows a closer view.

If route colors change, keep `routeColors` consistent with the corresponding
`--color-route-completed`, `--color-route-current`, and `--color-route-upcoming`
variables used by the HTML legend. Campus bounds and initial geographic framing
remain in `src/data/navigation/collegeOfIdahoCampus.ts`; these are geographic
settings rather than theme values. Location accuracy rules remain in the
navigation domain and are not styling settings.

## Verify and publish

Run `npm run check` and `git diff --check`. Inspect desktop and phone widths,
including a route preview, dropdown scrolling, 2D/3D switching, and navigation.
Check that controls do not overlap or cover attribution. Publish the preview
branch and follow [the release procedure](RELEASE_WORKFLOW.md). Production still
requires explicit merge approval.
