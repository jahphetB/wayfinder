# Campus Geometry Collection Packet

This packet is for replacing illustrative map geometry in small, reviewable
batches. Its initial example forms cover Cruzen-Murray Library, Blatchley Hall,
Simplot Dining Hall, Simplot Residence Hall, and Sterry Hall.
The application now lists 42 places from a newer user-observed OSM export; use
the same form for any of them, starting with paths or entrances the user sees
as inaccurate. The two Simplot destinations are different entrances of one
connected building. Do not assume an imported point proves usable access.

For the current 2D phase, the highest-value feedback is a correction to a
drawn walkway, junction, entrance connection, or an outline-derived approach
point. There is no fixed campus entrance gate. Building heights, walkway widths, slopes, and accessibility details can
wait until the basic 2D routes have been reviewed. Leave those fields unknown;
do not guess values to make the map appear complete.

## Best source to request

Ask campus Facilities/Planning for the latest site plan or GIS/CAD export that
the College authorizes this project to use. Request:

- Building ground footprints, building names/IDs, and measured heights if
  available. A footprint is the outline of the building where it meets the
  ground.
- Pedestrian walkway centerlines and widths, walkway junctions, marked
  crossings, and connections to building entrances.
- Entrance locations and type where known, plus stairs, ramps, curb cuts,
  gates, closures, and other access constraints that affect a walking route.
- Coordinate reference system, measurement units, survey date, expected
  positional accuracy, dataset owner, and written reuse/attribution terms.

GeoJSON or GeoPackage is easiest to review. GIS means geographic information
system: software and data formats for storing real-world mapped features.
GeoPackage is a single file that can hold several map layers. DWG/DXF or a
georeferenced PDF is also useful; include its coordinate system and scale. A
PDF without geographic anchors can still help us trace outlines, but we need
known coordinates or measured reference points to place it accurately.

## If official measured records are unavailable

Use the form below for a small batch of named places and the walkways that connect
them. You do not need to survey every part of campus. Give each observation a
stable ID so a photo, measurement, and map point can be matched later.

| ID               | Feature                         | What to capture                                                                                              |
| ---------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `bldg-library`   | Cruzen-Murray Library           | Ground outline; length and width; height or floor count if known; actual pedestrian entrance point(s).       |
| `bldg-blatchley` | Blatchley Hall                  | Same building details.                                                                                       |
| `bldg-simplot`   | Simplot Dining/Residence        | One building outline; mark the cafeteria door near Blatchley and the separate residence door.                |
| `bldg-sterry`    | Sterry Hall                     | Same building details.                                                                                       |
| `node-anderson`  | Anderson Residence Hall         | Confirm the student-used door and its walkway connection.                                                    |
| `node-jaac`      | JAAC and swimming pool          | Confirm each separately described entrance and its walking approach.                                         |
| `area-parking`   | Parking area                    | Confirm the correct area and a real pedestrian access point.                                                 |
| `walk-*`         | Each connecting walkway section | Centerline shape, measured width, endpoints/junction IDs, surface, stairs/ramps, crossing, and access notes. |

For each location, take an overview photo and close photos of entrances or
changes in the walkway. Name each photo with its feature ID and direction,
such as `walk-central-east-facing.jpg`. Avoid including identifiable people.
Photos help us understand appearance and connect observations; they do not
provide reliable dimensions on their own. If measuring on site, record metres
or feet explicitly and note the tool or source. A building length/width pair
does not describe an irregular footprint, so sketch each corner or mark the
corners on an authorized map.

Phone GPS can provide an approximate anchor, but record the device-reported
accuracy and observation date. Near buildings, GPS can be off by several
metres; do not use it alone to claim a precise entrance, narrow walkway edge,
or accessibility fact. A known survey point or an authorized plan is stronger.

## Observation template

Copy these headings into a spreadsheet. Use one row per point, measured length,
or observation; keep one ID for the feature and a distinct observation ID for
each record.

```text
feature_id,observation_id,feature_type,name,latitude,longitude,coordinate_reference_system,measurement_type,measurement_value,measurement_unit,gps_accuracy_m,source,observed_on,confidence,access_notes,photo_file,notes
```

Example only (replace the illustrative values with your observation):

```text
node-anderson,obs-001,entrance,Anderson Residence Hall,,,,point,,,,user field note,YYYY-MM-DD,unverified,,,anderson-entrance.jpg,Confirm resident-used door and path
walk-central-01,obs-002,walkway,Central walkway,,,,width,2.0,metres,,,tape measure,YYYY-MM-DD,measured,,,,Illustrative example width; replace it
```

Leave unknown fields blank. Do not guess coordinates, dimensions, surface,
opening status, or accessibility. For a polygon, list each corner in order and
repeat the first corner at the end; for a walkway centerline, list points in
walking order. Include latitude/longitude only when the coordinate source and
coordinate reference system are known.

## Review before changing the app

For every submitted batch, we will:

1. Check who owns the source and that project reuse is permitted.
2. Check that units and coordinate reference are known and consistent.
3. Compare feature names and positions with the official campus map and other
   permitted sources; public maps are corroboration, not authority for access.
4. Validate geometry ordering, connected walkway endpoints, and measured
   distances against the source before converting it to application data.
5. Keep unknown or conflicting details illustrative and label their provenance.
6. Have you review the drawn result and route before marking operational facts
   verified. Field confirmation can happen later when you are ready to visit
   each location.

## Where approved data goes

Walking path geometry comes from a reviewed OSM export through
[`scripts/import_campus_osm.py`](../scripts/import_campus_osm.py) into the
committed `campusOsmNetwork.json` snapshot. Curated labels, entrance IDs, and
source status belong in
[`src/data/navigation/collegeOfIdahoWalkingGraphData.ts`](../src/data/navigation/collegeOfIdahoWalkingGraphData.ts).
The graph builder, validated loader, and route tests check the result before
route planning uses it. Future measured 3D appearance belongs in separately
reviewed scene data; a visual model must never invent a walking entrance or
path. The replacement procedure is also documented in the
[architecture handbook](ARCHITECTURE.md#step-12-validated-data-replacement).
