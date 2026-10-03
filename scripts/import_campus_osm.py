"""Import a supplied OSM export into a small, reproducible campus snapshot.

Run: python scripts/import_campus_osm.py path/to/export.osm
The generated JSON is source data, not a claim that every route is field-safe.
"""

import argparse
import hashlib
import json
from collections import defaultdict
from datetime import date
from pathlib import Path
import xml.etree.ElementTree as ET


OUTPUT = Path(__file__).resolve().parents[1] / "src/data/navigation/campusOsmNetwork.json"
WALKABLE = {"footway", "path", "steps"}
STADIUM_HANDOFF_ROADS = {
    "13756795", "13760269", "197875245", "13767980", "327890075"
}


def tags(element):
    return {tag.get("k"): tag.get("v") for tag in element.findall("tag")}


def main_component(ways):
    adjacency = defaultdict(set)
    for way in ways:
        for start, end in zip(way["nodeIds"], way["nodeIds"][1:]):
            adjacency[start].add(end)
            adjacency[end].add(start)

    seen = set()
    components = []
    for node_id in adjacency:
        if node_id in seen:
            continue
        stack = [node_id]
        component = set()
        while stack:
            current = stack.pop()
            if current in component:
                continue
            component.add(current)
            stack.extend(adjacency[current] - component)
        seen.update(component)
        components.append(component)

    if not components:
        raise ValueError("No connected pedestrian ways found in the export")
    return max(components, key=len)


def import_osm(input_path):
    raw = input_path.read_bytes()
    root = ET.fromstring(raw)
    if root.tag != "osm":
        raise ValueError("Expected an OpenStreetMap XML export")

    osm_nodes = {node.get("id"): node for node in root.findall("node")}
    ways = root.findall("way")
    walkable_ways = []
    for way in ways:
        way_tags = tags(way)
        if (
            way_tags.get("highway") not in WALKABLE
            or way_tags.get("area") == "yes"
            or way_tags.get("access") in {"private", "no"}
        ):
            continue
        node_ids = [node.get("ref") for node in way.findall("nd")]
        if len(node_ids) < 2 or any(node_id not in osm_nodes for node_id in node_ids):
            raise ValueError(f"Incomplete pedestrian way {way.get('id')}")
        walkable_ways.append(
            {
                "id": way.get("id"),
                "nodeIds": node_ids,
                "kind": (
                    "informal" if way_tags.get("informal") == "yes"
                    else "main" if "main footway" in way_tags.get("description", "").lower()
                    else "formal"
                ),
                "highway": way_tags["highway"],
            }
        )

    connected = main_component(walkable_ways)
    selected_ways = [
        way for way in walkable_ways if all(node_id in connected for node_id in way["nodeIds"])
    ]
    selected_ids = set(connected)
    road_ways = []
    for way in ways:
        if way.get("id") not in STADIUM_HANDOFF_ROADS:
            continue
        way_tags = tags(way)
        node_ids = [ref.get("ref") for ref in way.findall("nd")]
        if not way_tags.get("highway") or any(node_id not in osm_nodes for node_id in node_ids):
            raise ValueError(f"Incomplete stadium handoff road {way.get('id')}")
        selected_ids.update(node_ids)
        road_ways.append(
            {"id": way.get("id"), "nodeIds": node_ids,
             "name": way_tags.get("name", ""),
             "oneway": way_tags.get("oneway") == "yes",
             "access": way_tags.get("access", "")}
        )
    if {road["id"] for road in road_ways} != STADIUM_HANDOFF_ROADS:
        raise ValueError("The mapped stadium handoff roads are incomplete")
    buildings = []
    areas = []
    for way in ways:
        way_tags = tags(way)
        node_ids = [ref.get("ref") for ref in way.findall("nd")]
        if way_tags.get("name") and way_tags.get("building") in {"college", "residential"}:
            entrance_ids = [
                node_id for node_id in node_ids
                if tags(osm_nodes[node_id]).get("entrance")
            ]
            selected_ids.update(node_ids)
            buildings.append(
                {"id": way.get("id"), "name": way_tags["name"],
                 "kind": way_tags["building"], "nodeIds": node_ids,
                 "entranceIds": entrance_ids}
            )
        parking_description = way_tags.get("description", "")
        if parking_description and (
            way_tags.get("amenity") == "parking"
            or "parking lot" in parking_description.lower()
        ):
            selected_ids.update(node_ids)
            areas.append(
                {"id": way.get("id"), "name": parking_description,
                 "kind": "parking", "nodeIds": node_ids}
            )
        if way_tags.get("leisure") == "stadium" and way_tags.get("name"):
            selected_ids.update(node_ids)
            areas.append(
                {"id": way.get("id"), "name": way_tags["name"],
                 "kind": "stadium", "nodeIds": node_ids}
            )
        if (
            way_tags.get("leisure") == "pitch"
            and way_tags.get("sport")
            and not parking_description
        ):
            selected_ids.update(node_ids)
            areas.append(
                {"id": way.get("id"), "name": way_tags.get("name", ""),
                 "kind": "sport", "sport": way_tags["sport"],
                 "nodeIds": node_ids}
            )

    places = []
    for node_id, node in osm_nodes.items():
        node_tags = tags(node)
        if node_id in {
            "5729141036", "5729141037", "5729141038", "5729141045",
            "14239949038"
        }:
            selected_ids.add(node_id)
            places.append(
                {"id": node_id, "name": node_tags.get("name") or node_tags.get("description")}
            )

    entrances = []
    for node_id, node in osm_nodes.items():
        node_tags = tags(node)
        if node_tags.get("entrance"):
            selected_ids.add(node_id)
            entrances.append(
                {"id": node_id, "kind": node_tags["entrance"],
                 "description": node_tags.get("description", "")}
            )

    output = {
        "source": {
            "sha256": hashlib.sha256(raw).hexdigest().upper(),
            "importedOn": date.today().isoformat(),
            "walkableWayCount": len(walkable_ways),
            "connectedWayCount": len(selected_ways),
            "connectedNodeCount": len(connected),
        },
        "nodes": {
            node_id: [float(osm_nodes[node_id].get("lat")), float(osm_nodes[node_id].get("lon"))]
            for node_id in sorted(selected_ids, key=int)
        },
        "ways": selected_ways,
        "roadWays": road_ways,
        "buildings": buildings,
        "areas": areas,
        "places": places,
        "entrances": entrances,
    }
    OUTPUT.write_text(json.dumps(output, separators=(",", ":")) + "\n", encoding="utf-8")
    print(
        f"Imported {len(selected_ways)} connected ways and {len(connected)} "
        f"walking nodes from {input_path.name} into {OUTPUT.relative_to(OUTPUT.parents[3])}"
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("osm_file", type=Path)
    import_osm(parser.parse_args().osm_file)
