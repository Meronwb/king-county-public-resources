# Access to Public Resources in King County

**GEOG 458 Final Project – Group 05**

**Members:** Meron Birhanu, Emmanual Tadesse, Abdulbasit Abdalla, Moozy Zhou

**Live site:** [https://meronwb.github.io/king-county-public-resources/](https://meronwb.github.io/king-county-public-resources/)

---

## Project Overview

This project explores spatial equity and infrastructure accessibility within King County, WA by mapping the geographic distribution of key public resources. The goal is to help residents, students, policy makers, and non-profit workers identify where resources are concentrated and where gaps exist.

The interactive site includes three maps and an introduction page, all centered on King County using a Web Mercator projection (initial zoom level 10, up to zoom 15 for street-level detail).

**Live resources mapped:**
| Layer | Count | Source |
|---|---|---|
| Libraries | 27 | Seattle GeoData |
| Community Centers | 46 | Seattle GeoData |
| Public Health Clinics | 32 | King County GIS Open Data |
| Parks | 1,514 | Seattle GeoData |

---

## Site Structure

```
index.html          → Introduction page with resource summary stats
map1.html           → Dashboard: all resource types as interactive points
map2.html           → Density Map: heatmap of resource concentration
map3.html           → Choropleth Map: resource count per census tract
about.html          → Project info, team, data sources, tools used
css/style.css       → Shared stylesheet for all pages
js/map1.js          → Dashboard map logic
js/map2.js          → Density map logic
js/map3.js          → Choropleth map logic
data/               → GeoJSON datasets (see below)
```

---

## Maps

### Map 1 – Dashboard (`map1.html`)
An interactive point map displaying all four resource types simultaneously. Features:
- Color-coded circle markers per resource type
- **Marker clustering** for parks (1,514 points) using Leaflet.markercluster
- **Layer toggle** control (top right) to show/hide each resource type independently
- **Clickable popups** showing name, address, and website link for each resource
- **Legend** (bottom left) with color key and counts

### Map 2 – Density Map (`map2.html`)
A heatmap on a dark basemap showing geographic concentration of resources. Features:
- **Leaflet.heat** plugin rendering all 1,619 resource points as a smooth density surface
- **Layer buttons** (top right) to switch between "All Resources" and individual types, each with its own color gradient
- Best for identifying clusters of service and underserved areas at a glance

### Map 3 – Choropleth Map (`map3.html`)
King County census tracts shaded by resource count. Features:
- **Precomputed resource counts** per tract (point-in-polygon computed at build time, stored in `census_tracts.geojson`)
- **7-class sequential blue color scale** (white → dark blue)
- **Hover tooltip** showing tract name and resource count
- **Click to zoom** into any tract
- **Legend** (bottom left) with count ranges

---

## Data

| File | Type | Description |
|---|---|---|
| `data/libraries.geojson` | Points | Seattle Public Library branches |
| `data/community_centers.geojson` | Points | Neighborhood community centers |
| `data/health_clinics.geojson` | Points | King County public health clinics |
| `data/parks_points.geojson` | Points | Park centroids (derived from polygon data) |
| `data/census_tracts.geojson` | Polygons | King County census tracts with `resource_count` field |

> **Note:** The original `parks.geojson` is a 17MB polygon file. `parks_points.geojson` was precomputed as polygon centroids to keep the site fast in the browser. Similarly, `resource_count` per census tract was precomputed using a point-in-polygon algorithm rather than computed at runtime.

---

## Data Sources

- [Seattle GeoData](https://data-seattlecitygis.opendata.arcgis.com/) – Libraries, Community Centers, Parks
- [King County GIS Open Data](https://gis-kingcounty.opendata.arcgis.com/) – Public Health Clinics, Census Tracts
- [Washington State Geoportal](https://geo.wa.gov/)

---

## Libraries & Tools

- [Leaflet.js](https://leafletjs.com/) v1.9.4 – Interactive web mapping
- [Leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster) v1.5.3 – Marker clustering
- [Leaflet.heat](https://github.com/Leaflet/Leaflet.heat) v0.2.0 – Heatmap layer
- [CARTO Basemaps](https://carto.com/basemaps/) – Light and dark tile layers

---

## Viewing the Site

**Online:** Visit the live site at [https://meronwb.github.io/king-county-public-resources/](https://meronwb.github.io/king-county-public-resources/)

**Locally:** Just open `index.html` directly in your browser — no server required. All GeoJSON datasets are pre-loaded as JavaScript variables via `<script>` tags, so the maps work without any local server setup.

---

## AI Disclosure

AI was used in this project for helping locate data source leads and to clean up grammatical errors. AI was also used to comment on code for code qulaity and legibility. AI was not used to write or complete any components where AI use is prohibited.
