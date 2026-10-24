# Styling and map presentation

## Selected reference

The original combined reference supplied October 23, 2026 defines Proposal A
landing/editing, layout 4 desktop navigation and layout 3 mobile navigation.
[UI reference contract](UI_REFERENCE_CONTRACT.md) identifies the authoritative
screen mapping. Generated replacement boards are not implementation sources.

At **640 CSS pixels and above**, the sidebar is beside the map. Below 640, a
compact header/map/planner becomes a map-focused instruction view during a
walkthrough. There is no alternate tablet layout. Dimensions are fluid, not a
scaled screenshot. Typography uses rem so browser text-size settings can enlarge it.

## Named settings

Start with `src/styles/theme.css`. A CSS variable is a named value used by other
stylesheets. The remaining variables are active settings, not retired design knobs.

| Setting                        | Variable or file                                                                      |
| ------------------------------ | ------------------------------------------------------------------------------------- |
| Plum text and actions          | `--color-brand`, `--color-text`, `--guide-action-background`                          |
| Sidebar size and spacing       | `--guide-sidebar-width`, `--guide-panel-padding`                                      |
| Brand typography               | `--guide-brand-size`, `--font-family`                                                 |
| Borders, keyboard focus        | `--color-border`, `--color-focus`                                                     |
| Location point colors          | `--color-snapshot-fill`, `--color-snapshot-outline`                                   |
| Building dialog dimensions     | `--building-dialog-width`, `--building-photo-height`, `--building-description-height` |
| Route colors and camera motion | `src/features/map/model/mapPresentation.ts`                                           |
| Exact responsive boundary      | `src/app/layoutSettings.ts`, `src/styles/responsive.css`                              |

`layout.css` assigns named Grid regions: header, sidebar, map, location, actions,
footer. Grid positions one set of controls without creating parallel sessions.
`navigation.css` owns fields/suggestions, route summary, timeline and location
feedback. `map.css` owns the canvas, instruction overlay, map modes/zoom and recovery
messages. `footer.css` owns credit and the native privacy dialog.
`responsive.css` changes these regions for mobile, short screens and reduced motion.

## Feedback and controls

Landing puts Get my location below the planner. Editing puts feedback immediately
after the draft actions, above the lower location button. Desktop navigation
puts feedback under the location button; mobile navigation places its white pill
above that button on the map. Back/Next are equal-width buttons in a solid dock
below the mobile map. Feedback contains only actual timestamps/accuracy after a
reading, plus concise failure/retained/off-campus information.

The desktop navigation heading retains the pictured trademark. Mobile and
landing/editing headings do not add it. Footer credit retains Wayfinder™.
Privacy opens a native dialog, preserving the information without expanding
secondary prose into the primary workflow. Keyboard-only desktop menu access
reveals secondary building links without adding permanent reference chrome.

## Map and camera

MapLibre keeps one canvas across planning, editing, navigation and responsive
changes. Preview fits the actual route. Navigation frames the actual route with
padding for the measured mobile instruction card and lower location controls.
Flat 2D stays north-up so raster map labels remain readable. 3D retains deliberate
bearing changes. New camera intent stops the old animation; nonessential
transitions respect reduced motion. Snapshot refreshes never refocus a selected
route.

Purple dashed previews, green completed legs, orange dashed current legs and
muted upcoming legs are distinct. Route origin/destination markers are separate
from the small light-green real snapshot. MapLibre draws pins from code-native
canvas paths; no external image/font service is required.

The default map retains OpenStreetMap attribution and a metric scale. During
mobile navigation its copyright link is in the footer as pictured; custom map
styles retain their own native attribution. Do not hide provider attribution
without the corresponding visible credit.

## Verification

Compare the six selected states at desktop and mobile sizes. Also check 639 and
640 pixels, short/landscape screens, long destination names, 200% text, keyboard
search, dialogs, denied location, graphics retry and route edits. Browser-emulated
checks do not replace physical-device or assistive-technology review.
