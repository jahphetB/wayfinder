# OpenStreetMap Export Review — source history through 2026-10-01

Sections below preserve earlier batches as history. The [fourth application
batch](#fourth-application-batch-descriptions-and-broader-destinations-step-25)
describes the current import. Earlier statements about a Campus Entrance,
21 places, or a 12% informal penalty are superseded, not current instructions.

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
while future 3D visual building data will be separate from route data.

OpenStreetMap data is available under the Open Database License (ODbL); the
map already credits OpenStreetMap contributors. See the
[OpenStreetMap copyright and attribution guidance](https://www.openstreetmap.org/copyright).
OpenStreetMap also asks contributors not to copy from Google Maps or other
copyrighted sources without permission. User edits based on firsthand campus
observation or permitted source material are the strongest input for this
review.

## Third application batch: newer observed export (Step 24, historical)

The user supplied `map_moreinfo.osm` from firsthand mapping observations.
Its SHA-256 digest is
`8B0EC753640275B3177D2C2514862B41EB7EB78228E870C16BED58C0276A2FEE`.
It contains 2,965 point nodes, 585 ways, and 5 relations. Compared with the
previous export, 204 ways are new and 30 existing ways have changed point
sequences. This is a new snapshot, not a claim that every path is field-safe.

The importer selects 190 usable pedestrian ways after excluding private or
no-access ways and area polygons. The largest connected walking component has
581 nodes and 184 ways; disconnected features are not silently linked.
The export contains 44 entrance nodes, 20 named `building=college` outlines,
and four named point-of-interest nodes. Three informal paths fall in the main
connected component. For runtime use, the importer commits a compact
`campusOsmNetwork.json`; the original XML remains outside the repository.

The current curation exposes 21 places: one illustrative Campus Entrance,
Morrison Quadrangle, 18 building destinations (the two Simplot labels use
separate entrances in one building), and Centennial Amphitheater. Named
buildings without suitable tagged entrances, including West Hall, the
former N.L. Terteling Library, and Marty Holly Athletic Center, were not
invented as destinations. For exact curated source IDs see
`src/data/navigation/collegeOfIdahoWalkingGraphData.ts`.

Routing follows imported ordered path points. Informal paths carry a 12%
_selection-cost_ penalty, so formal paths usually win close comparisons while
a substantially shorter informal route can still win. Distances shown to
users are physical polyline lengths, not penalized scores. Off-path door
connections and the long Campus Entrance link remain labeled illustrative.
Mapped proximity does not prove an open, safe, accessible, or legal passage.
The entire graph retains `illustrative` verification status. Ask the user to
visually review any incorrect path, junction, entrance, or connector before
trying physical route navigation.

## Fourth application batch: descriptions and broader destinations (Step 25)

The user supplied `map (1).osm` after adding descriptions and more site
features. Its SHA-256 digest is
`03B9BD752A588BFF7CB04A87B06D417736E1BFBC49091AFD9EF8452A88C0B40C`.
The XML has 2,939 nodes, 603 ways, and 4 relations. The importer found 188
potentially walkable ways and retained 181 ways / 565 walking nodes in the
largest connected component. Ten connected ways are described as **Main
footway**, and five are marked informal. It retained 47 tagged entrances, 24
named campus/residential building outlines, 12 described parking or named
stadium outlines, and five selected campus landmarks.

Every supplied `description` tag was reviewed. The routing-relevant
descriptions identify the resident-used Anderson entrance (`14229217299`),
the lobby-side Anderson entrance (`14229217300`), cafeteria and residence
doors at Simplot (`14229218101` and `14229218102`), the main activities
entrance (`9284508267`), the separate swimming-pool entrance (`14233022397`),
Morrison Quadrangle & Clock Tower (`14239949038`), ten main footways, and
the named parking areas. The activities entrance is a walking-way node rather
than a node on the mapped JAAC building outline; the app validates its
description instead of falsely assigning it to that outline.

The app now lists 42 campus destinations, including four named residential
apartment buildings, ten parking areas, the selected Simplot Stadium area,
and additional landmarks. West Hall, the former N.L. Terteling Library
building, Marty Holly Athletic Center, and any building without a tagged
entrance use the outline point closest to the mapped walkway. These are
**illustrative approach points**, not verified doors. The former library is
labeled “former” so it is not confused with the current library. The
invented Campus Entrance point and its long straight link are removed because
the campus has no fixed gate.

One source conflict needs user review: way `1006303601` is described as
“Hayman parking lots 2” but tagged `leisure=pitch` and `sport=basketball`.
The app includes a provisional Hayman Parking Lot 2 destination based on the
user's description. Its classification and access point should be corrected
in the source if that surface is truly parking. The export also contains two
different `Simplot Stadium` polygons; the app selects way `327890065` as one
provisional destination rather than presenting duplicate labels. The user
should confirm that choice. Unnamed parking objects and unrelated off-campus
businesses are not promoted into named campus destinations.

Formal paths now take priority over informal paths even when an informal
shortcut is shorter. Main footways get a smaller preference among formal
alternatives; displayed distance remains physical length. This is a routing
preference, not proof that a formal path is open, legally usable, or
accessible. On-site inspection of paths, entrances, and the area-derived
connectors remains necessary before real navigation use.
