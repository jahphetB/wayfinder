# OpenStreetMap Export Review — 2026-09-28

This review describes the user-supplied `map.osm` export from 2026-09-28. The
original file was inspected from the user's Downloads folder; it is not copied
into this repository. Its SHA-256 digest is
`4CAE3372AFDF189542F325871B5D59743A049353F5B31A3C1E8419C0F0572B5E`.
That digest identifies the exact snapshot reviewed here, even if the public
OpenStreetMap records change later.

## What the file contains

The XML parses successfully. It contains 2,020 nodes, 383 ways, and 4
relations; every way's node reference resolves within the file. A node is a
mapped point, a way is an ordered line or outline, and a relation groups other
map objects. The file has 108 building outlines, 131 ways tagged as pedestrian
footways, paths, pedestrian areas, or steps, and 14 entrance points. Twenty-one
of the pedestrian ways and the four target building outlines have updates dated
2026-09-28. A recent timestamp shows an edit, not a field measurement.

All four current destination buildings have named, closed footprint outlines:

| Building              | OSM way     | Approximate north–south / east–west bounding span | Tagged entrance nodes                      |
| --------------------- | ----------- | ------------------------------------------------- | ------------------------------------------ |
| Cruzen-Murray Library | `603509923` | 69 m / 46 m                                       | `14229218107` (`main`)                     |
| Blatchley Hall        | `492831905` | 34 m / 26 m                                       | `14229217297` (`main`)                     |
| Simplot Dining Hall   | `492831873` | 85 m / 98 m                                       | `14229218101`, `14229218102` (both `main`) |
| Sterry Hall           | `492831879` | 41 m / 42 m                                       | `14229218105` (`main`)                     |

These spans are rough axis-aligned bounds computed from the mapped polygon
coordinates, not surveyed wall lengths. None of those four building ways has
a height or building-level tag. The outlines help with a more plausible map
shape, but cannot establish building height, roof shape, or façade details.

Of the 131 pedestrian ways, 70 specify a surface, none specifies a width,
none specifies wheelchair accessibility or incline, and only one specifies
access. Two are tagged as steps. A road crossing appears in the file, but the
export does not establish every safe crossing, gate, curb cut, or route
restriction that navigation would need. None of the five tagged entrance
nodes on the four destination buildings shares a node with a pedestrian way.
Nearby geometry alone does not prove a usable entrance connection.

## First application batch

Blatchley Hall has one tagged main entrance at OSM node
[`14229217297`](https://www.openstreetmap.org/node/14229217297), part of
[building way `492831905`](https://www.openstreetmap.org/way/492831905).
The current route already reaches footway
[way `603518401`](https://www.openstreetmap.org/way/603518401) at node
`5729163618`, about 3.9 m from that entrance. Step 22 changes the Blatchley
destination from its building-center point to the tagged entrance and replaces
the final long connector with this short illustrative connector. The route leg
distance is the rounded length of its mapped polyline, 275 m. This is an
improvement to the prototype drawing, not confirmation that the gap is a
physical, accessible walking connection. The graph release stays
`illustrative`.

The other three destination endpoints are unchanged in this batch. Simplot
has two entrances both tagged `main`, so a preferred approach cannot be chosen
from the tags alone. Their short links to the nearest walkways, the library
and Sterry connections, and all access details need review before further
route changes.

## Second application batch: limited 2D pedestrian routes

The user confirmed that their OSM edits came from firsthand campus observation
and identified the two Simplot doors: node `14229218101` near Blatchley is the
cafeteria entrance, while node `14229218102` is the main residence entrance.
The application now offers those as separate destinations in one connected
building. The library (`14229218107`) and Sterry (`14229218105`) destinations
also end at mapped entrance nodes. Blatchley keeps its Step 22 entrance.

The current graph follows ordered pedestrian-way coordinates from this same
export between a small set of junctions. All current destinations are
connected through those lines, and route distances use the drawn polylines.
The Campus Entrance origin is not itself on a mapped footway: its first
approximately 108 m is a temporary straight connection to the nearest mapped
footway point. The final gaps from the nearest footways to the five building
entrances are approximately 2 to 6 m each. Those gaps are deliberately drawn
as prototype connectors, not asserted as mapped or accessible paths. The
route graph still carries `illustrative` status until on-site route review.

The app now starts in 2D so these lines can be inspected directly. It does not
need the XML file at runtime: the selected points reside in
`collegeOfIdahoWalkingGraphData.ts`, and normal graph validation guards them.
The XML snapshot digest above lets us compare a later export against this one.

## What would make it reliable for this project

1. First, visually inspect each current route on the 2D map and report any
   place where the line leaves the real path or turns at the wrong junction.
   Confirm the temporary Campus Entrance connection in particular.
2. At each intended entrance, confirm which walkway actually reaches the
   door. Add a physically observed connecting path or shared junction in the
   source geometry; note any obvious stairs, locked gates, or impassable links.
3. Record the observation source and date for each correction. Later, when the
   basic 2D routes are complete, check building sizes, heights, walkway widths,
   surfaces, slopes, crossing points, and accessibility. Leave unknown values
   unknown rather than guessing them now.

The [collection packet](CAMPUS_DATA_COLLECTION.md) supplies a form for this
evidence. Current route data lives in
[`src/data/navigation/collegeOfIdahoWalkingGraphData.ts`](../src/data/navigation/collegeOfIdahoWalkingGraphData.ts),
while visual building data lives separately under `src/data/map/`.

OpenStreetMap data is available under the Open Database License (ODbL); the
map already credits OpenStreetMap contributors. See the
[OpenStreetMap copyright and attribution guidance](https://www.openstreetmap.org/copyright).
OpenStreetMap also asks contributors not to copy from Google Maps or other
copyrighted sources without permission. User edits based on firsthand campus
observation or permitted source material are the strongest input for this
review.
