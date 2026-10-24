# Selected interface reference contract

The original combined board supplied October 23, 2026 is authoritative. Its top
row is Proposal A landing, its middle row Proposal A editing, and its bottom row
layout 4 desktop navigation / layout 3 mobile navigation. Generated replacement
boards are not design sources. Presentation labels, surrounding canvas, device
frame and OS status bar are excluded from application chrome.

## Layout and visual rules

### October 24 refinements

The owner's subsequent refinements override the board where they conflict:
purple/white header with building search instead of the visible menu; tilted 2D;
close turn-centred walkthrough camera; compact mobile location/zoom controls and
purple instruction card; transparent mobile feedback showing elapsed snapshot age
and accuracy only; a stationary desktop sidebar footer. Other selected layout and
manual-guide requirements remain. With no snapshot, concise failure feedback is
still available rather than showing invented time or accuracy.

The subsequent camera/marker correction gives both modes identical camera
behavior, including leg-following rotation and turn centring. Mode switching only
shows/hides the rough library model. Draft Start/Destination and header search
selections display pins immediately; Preview remains an explicit separate action.

- Below 640 CSS px: selected mobile composition; at/above 640: desktop composition.
- Landing/editing preserve the pictured compact header, integrated fields/swap,
  actions, lower location control and footer. Mobile map precedes the planner.
- Desktop navigation has the pictured numbered timeline, summary/edit action,
  lower All steps/location/Back/Next controls and map-side mode/zoom controls.
- Mobile navigation has the pictured header/edit action, current-instruction card,
  map, location feedback above its location button, Back/Next dock and footer.
- Keep the desktop navigation heading trademark, as shown. Landing/editing and
  mobile headings follow their pictured treatment. Footer retains Wayfinder™.
- Preserve structure, hierarchy, typography, plum/lavender colors, borders, icons
  and spacing relationships. Adapt fluidly for readable controls and long content;
  never stretch screenshots or copy invented map geometry/example numbers.

## Behavioral authority

The manual-guide contract in PRODUCT_PLAN.md remains: explicit Preview then Start,
Next/Back without GPS gates, only three snapshot triggers, bounded cleanup and
no tracking/history upload. Real campus data and real timestamps/accuracy remain.
Location results never interrupt a selected campus walkthrough camera.

Editing is transactional: the draft is separate from a retained journey. Cancel
restores the identical route/step, including after replacement preview. Invalid
drafts cannot destroy it. Starting a replacement explicitly begins step one.
The map instance survives view and breakpoint changes. New UI controls remain
behind provider-neutral map contracts; no service/dependency expansion is required.

## Verification and release boundary

Compare landing, editing and navigation screenshots on desktop/mobile to the
original board. Test 320, 375, 639, 640, 768 and wide screens, short/landscape
views, enlarged text and keyboard/search constraints. Exercise draft cancel,
replacement preview/start, permission/off-campus failures, recovery, reduced
motion and stale callbacks. Distinguish emulation from physical-device evidence.
Preview commits/pushes are approved; production requires explicit approval.
