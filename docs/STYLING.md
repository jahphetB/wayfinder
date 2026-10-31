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

Building photos use `object-fit: contain` in `building-details.css`: the whole
source image fits without stretching/cropping. Empty side space is intentional
for differently shaped photographs.

The October 24 refinement uses a purple header with white branding and a building
combobox instead of the visible hamburger. A combobox combines a text field with
selectable suggestions. Selecting a header result highlights that building separately
from Start/Destination. The in-field X clears the highlight and restores campus or
route framing; it does not erase a route, start navigation or request location.
Search remains keyboard accessible and clear restores input focus.
Selected draft endpoints render immediately, before Preview. With no route, the
map frames those selections. A header inspection has its own temporary pin.
The retained secondary menu is keyboard-revealed; map clicks still open details.

Mobile planning/editing rows grow with content instead of forcing the location
button over replacement actions. The planner stacking layer sits above the lower
location region, so open suggestions receive pointer input. Mobile navigation
uses 32-pixel-high location and 30-pixel zoom controls, plus a narrower purple
instruction card. Desktop footer credit stays in the same sidebar grid cell.
Mobile navigation feedback has no opaque background or shadow. A successful
snapshot shows only elapsed age and reported accuracy; the age timer updates the
label, not GPS. Screen-reader information retains snapshot/failure context.

Landing puts Get my location below the planner. Editing puts feedback immediately
after the draft actions, above the lower location button. Desktop navigation
puts feedback under the location button; mobile navigation places transparent feedback
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
changes. Preview fits the actual route. Navigation centres the current turn at zoom
18.3, balancing measured overlay space with a temporary pixel offset. Both modes
tilt 60 degrees and rotate with the current route leg. Switching modes changes
only library-model visibility; it never reframes or rotates the camera.
New camera intent stops the old animation; nonessential
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
