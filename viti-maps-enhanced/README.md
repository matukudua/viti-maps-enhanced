# Viti Maps Enhanced

**Prototype v0.2** — Interactive map platform for Fiji focused on villages, health facilities, towns, and future real-time layers (weather, satellite imagery, Starlink coverage, government projects).

Inspired by the independent [Viti Maps](https://www.vitimaps.com/) project and expanded with modern open-source web mapping technology.

![MapLibre](https://img.shields.io/badge/MapLibre-GL%20JS-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-Prototype-orange)

## Features (current)

- Interactive MapLibre GL map of Fiji
- **Hospitals** layer with major facilities (CWM, Lautoka, Labasa, Nadi, etc.)
- **Towns & Cities** layer
- **Villages & Settlements** layer (expanded sample set; Starlink-connected sites highlighted)
- Live search box
- “Find nearest hospital to me” (browser geolocation)
- Layer toggles + legend
- Responsive sidebar (collapsible on mobile)
- Clean professional dark UI
- Data model prepared for future live feeds

## Planned layers (placeholders ready)

| Layer | Source ideas | Status |
|-------|--------------|--------|
| Weather | Himawari-8/9 + Fiji Met Service | Placeholder |
| Satellite imagery & change detection | Sentinel-1/2, Landsat, Google Earth Engine, Digital Earth Pacific | Placeholder |
| Starlink coverage | Public availability + community measurements + Telecom Fiji USO sites | Placeholder |
| Government / projects / organisations | Climate Change Division GIS, FREF, HDX, Pacific Data Hub | Placeholder |

See [`docs/DATA_STRUCTURE.md`](docs/DATA_STRUCTURE.md) for the full data model and integration architecture.

## Quick start

### Option 1 – Open directly
1. Clone or download this repository
2. Open `index.html` in any modern browser (Chrome, Firefox, Edge, Safari)

### Option 2 – Local server (recommended)
```bash
# Using npx (no install needed)
npx serve .

# Or with Python
python -m http.server 8000
```
Then open http://localhost:3000 (or the port shown).

Allow location access if you want the “nearest hospital” feature.

**No build step required** — pure HTML, CSS and JavaScript.

## Project structure

```
viti-maps-enhanced/
├── index.html              # Main application
├── css/
│   └── styles.css          # Professional dark theme
├── js/
│   └── app.js              # Map logic, search, nearest hospital
├── data/
│   ├── hospitals.json      # Hospital GeoJSON
│   ├── towns.json          # Towns & cities GeoJSON
│   └── villages.json       # Expanded village sample set
├── docs/
│   └── DATA_STRUCTURE.md   # Data model + future feed architecture
├── .gitignore
├── LICENSE                 # MIT
└── README.md
```

## Data notes

- Coordinates are approximate and intended for demonstration only.
- For production use, cross-reference official sources: Fiji Government GIS, Ministry of Health, OpenStreetMap, geoBoundaries, Fiji Bureau of Statistics, etc.
- Starlink-connected villages (e.g. Waivaka) are marked based on publicly reported Universal Service rollouts (2026).

## Roadmap ideas

1. Replace sample data with complete authoritative datasets
2. Add real weather tile layer (Himawari / Met Service)
3. Integrate satellite change-detection products
4. Offline support (Service Worker + cached tiles) for limited-connectivity / Starlink use
5. Backend + PostGIS for dynamic updates and community corrections
6. Progressive Web App (PWA) packaging

## Contributing

This is an early prototype. Feel free to open issues or pull requests for data improvements, new layers, or UI enhancements.

## Credits

- Map rendering: [MapLibre GL JS](https://maplibre.org/)
- Base map tiles: © OpenStreetMap contributors
- Concept inspired by the independent Viti Maps project
- Not affiliated with or endorsed by the Government of Fiji or any official agency

## License

MIT License — see [LICENSE](LICENSE) for details.
