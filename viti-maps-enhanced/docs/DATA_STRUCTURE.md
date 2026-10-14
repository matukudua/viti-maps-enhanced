# Viti Maps Enhanced – Data Structure & Future Feeds

This document describes the current data model and how real-time / satellite feeds will be integrated.

## Current Static Layers (GeoJSON)

All place data is stored as GeoJSON FeatureCollections under `/data/`.

| File | Description | Source intent |
|------|-------------|---------------|
| `hospitals.json` | Major & selected hospitals | Fiji Ministry of Health + public coordinates |
| `towns.json` | Main towns & cities | Cross-referenced public data |
| `villages.json` | Sample villages & settlements | Expanded demo set (Starlink sites highlighted) |

Each feature has at minimum:
- `id` (unique string)
- `name`
- `type`
- `geometry` (Point)
- Optional: `division`, `province`, `phone`, `notes`, `starlink`, `population`, etc.

## Planned Real-Time / Dynamic Layers

### 1. Weather (Himawari + Fiji Met Service)
- **Source**: Himawari-8/9 via Fiji Meteorological Service Himawari Cast receiver, GFS/ECMWF models
- **Update frequency**: 10–60 minutes
- **Format**: Raster tiles or GeoJSON alerts
- **Implementation**: Tile layer or WMS/WMTS endpoint
- **Placeholder in app**: Toggle currently disabled; structure ready for `weather` source

### 2. Satellite Imagery & Change Detection
- **Sources**:
  - Sentinel-1 (radar – all-weather flood mapping)
  - Sentinel-2 (optical, 10 m, ~5-day revisit)
  - Landsat 8/9 (historical + ongoing)
  - Google Earth Engine processed products
  - Digital Earth Pacific products
- **Use cases**: Post-cyclone damage, coastal erosion, land-cover change, flood extent
- **Update**: Daily to weekly depending on product
- **Implementation**: Raster tile service or Earth Engine export → Cloud Optimized GeoTIFF / tiles

### 3. Starlink Coverage & Connectivity
- **Source**: Public Starlink availability + community measurements + Telecom Fiji Universal Service sites
- **Update**: Weekly or on-demand
- **Attributes**: Coverage status, approximate performance, community Wi-Fi sites
- **Implementation**: Polygon or point layer + status badges on villages

### 4. Government / Projects / Organizations
- **Sources**: Climate Change Division GIS, FREF, Ministry portals, HDX, Pacific Data Hub
- **Examples**: Electrification sites, planned relocation communities, adaptation projects, health facilities status
- **Update**: As official data is published (often monthly/quarterly)
- **Implementation**: Additional GeoJSON or vector tiles with category filters

### 5. Political / Events / Alerts
- **Sources**: Official government announcements, NDMO alerts, verified news feeds
- **Update**: Near real-time with moderation
- **Implementation**: Point or polygon events layer with time filtering

## Recommended Backend Architecture (Future)

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Data Ingest    │────▶│  Processing &    │────▶│  Tile / API     │
│  (APIs, scrapers│     │  PostGIS +       │     │  Server         │
│   satellite)    │     │  Earth Engine)   │     │  (MapLibre      │
└─────────────────┘     └──────────────────┘     │   compatible)   │
                                                  └─────────────────┘
```

- **Database**: PostGIS for spatial queries
- **Tile generation**: Tippecanoe / Martin / Tegola or cloud raster services
- **Real-time**: WebSockets or Server-Sent Events for alerts
- **Offline**: Service Worker + local tile cache (especially important with Starlink intermittent use)

## Adding New Layers

1. Create new GeoJSON (or vector tile source) following the FeatureCollection schema.
2. Register source + layers in the map initialization.
3. Add checkbox + legend entry in the UI.
4. Document the data source and update frequency in this file.

## Notes on Accuracy

- Current coordinates are approximate and for demonstration only.
- Production version must cross-reference Fiji Government GIS, OpenStreetMap, geoBoundaries, and Ministry of Health data.
- Always show last-updated timestamp and data provenance on every layer.
