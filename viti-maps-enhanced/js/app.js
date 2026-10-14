/**
 * Viti Maps Enhanced – Prototype v0.2
 * Interactive Fiji map with hospitals, towns, villages, search & nearest hospital
 */

const map = new maplibregl.Map({
  container: "map",
  style: {
    version: 8,
    sources: {
      osm: {
        type: "raster",
        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
        tileSize: 256,
        attribution: "© OpenStreetMap contributors"
      }
    },
    layers: [{ id: "osm", type: "raster", source: "osm" }]
  },
  center: [178.1, -17.7],
  zoom: 7.0,
  maxZoom: 18
});

map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");
map.addControl(new maplibregl.ScaleControl({ maxWidth: 100 }), "bottom-right");
map.addControl(new maplibregl.GeolocateControl({
  positionOptions: { enableHighAccuracy: true },
  trackUserLocation: false
}), "top-right");

// Global data holders
let hospitalsData = null;
let townsData = null;
let villagesData = null;
let allPlaces = []; // for search

// Toast helper
function showToast(msg, duration = 3500) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), duration);
}

// Load GeoJSON
async function loadData() {
  try {
    const [h, t, v] = await Promise.all([
      fetch("data/hospitals.json").then(r => r.json()),
      fetch("data/towns.json").then(r => r.json()),
      fetch("data/villages.json").then(r => r.json())
    ]);
    hospitalsData = h;
    townsData = t;
    villagesData = v;

    // Build searchable list
    allPlaces = [
      ...h.features.map(f => ({ ...f.properties, coords: f.geometry.coordinates, layer: "hospitals" })),
      ...t.features.map(f => ({ ...f.properties, coords: f.geometry.coordinates, layer: "towns" })),
      ...v.features.map(f => ({ ...f.properties, coords: f.geometry.coordinates, layer: "villages" }))
    ];

    addLayers();
    setupSearch();
    setupNearest();
    setupToggles();
    setupSidebarToggle();
  } catch (err) {
    console.error("Failed to load data:", err);
    showToast("Could not load map data. Check console.");
  }
}

function addLayers() {
  // Hospitals
  map.addSource("hospitals", { type: "geojson", data: hospitalsData });
  map.addLayer({
    id: "hospitals-circle",
    type: "circle",
    source: "hospitals",
    paint: {
      "circle-radius": 9,
      "circle-color": "#ef4444",
      "circle-stroke-width": 2.5,
      "circle-stroke-color": "#ffffff"
    }
  });
  map.addLayer({
    id: "hospitals-label",
    type: "symbol",
    source: "hospitals",
    layout: {
      "text-field": ["get", "name"],
      "text-size": 11,
      "text-offset": [0, 1.5],
      "text-anchor": "top",
      "text-max-width": 12
    },
    paint: {
      "text-color": "#fca5a5",
      "text-halo-color": "#0b1220",
      "text-halo-width": 1.5
    }
  });

  // Towns
  map.addSource("towns", { type: "geojson", data: townsData });
  map.addLayer({
    id: "towns-circle",
    type: "circle",
    source: "towns",
    paint: {
      "circle-radius": 7,
      "circle-color": "#3b82f6",
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff"
    }
  });
  map.addLayer({
    id: "towns-label",
    type: "symbol",
    source: "towns",
    layout: {
      "text-field": ["get", "name"],
      "text-size": 12,
      "text-offset": [0, 1.35],
      "text-anchor": "top"
    },
    paint: {
      "text-color": "#93c5fd",
      "text-halo-color": "#0b1220",
      "text-halo-width": 1.5
    }
  });

  // Villages
  map.addSource("villages", { type: "geojson", data: villagesData });
  map.addLayer({
    id: "villages-circle",
    type: "circle",
    source: "villages",
    paint: {
      "circle-radius": [
        "case",
        ["==", ["get", "starlink"], true], 8,
        6
      ],
      "circle-color": [
        "case",
        ["==", ["get", "starlink"], true], "#06b6d4",
        "#22c55e"
      ],
      "circle-stroke-width": 1.8,
      "circle-stroke-color": "#ffffff"
    }
  });
  map.addLayer({
    id: "villages-label",
    type: "symbol",
    source: "villages",
    layout: {
      "text-field": ["get", "name"],
      "text-size": 10,
      "text-offset": [0, 1.25],
      "text-anchor": "top",
      "text-max-width": 10
    },
    paint: {
      "text-color": "#86efac",
      "text-halo-color": "#0b1220",
      "text-halo-width": 1.2
    }
  });

  // Click handlers
  ["hospitals-circle", "towns-circle", "villages-circle"].forEach(layerId => {
    map.on("click", layerId, (e) => {
      const p = e.features[0].properties;
      let html = `<div class="popup-title">${p.name}</div>`;
      html += `<div class="popup-meta">${p.type || ""}${p.location ? " · " + p.location : ""}${p.division ? " · " + p.division : ""}</div>`;
      if (p.phone) html += `<div class="popup-meta">Phone: ${p.phone}</div>`;
      if (p.emergency) html += `<div class="popup-meta">Emergency: ${p.emergency}</div>`;
      if (p.beds) html += `<div class="popup-meta">Beds: ~${p.beds}</div>`;
      if (p.population) html += `<div class="popup-meta">Population: ${p.population}</div>`;
      if (p.notes) html += `<div class="popup-note">${p.notes}</div>`;
      if (p.starlink) html += `<div class="popup-note">★ Starlink connected (demo)</div>`;

      new maplibregl.Popup({ offset: 12 })
        .setLngLat(e.lngLat)
        .setHTML(html)
        .addTo(map);
    });

    map.on("mouseenter", layerId, () => map.getCanvas().style.cursor = "pointer");
    map.on("mouseleave", layerId, () => map.getCanvas().style.cursor = "");
  });
}

function setupToggles() {
  const pairs = {
    "layer-hospitals": ["hospitals-circle", "hospitals-label"],
    "layer-towns": ["towns-circle", "towns-label"],
    "layer-villages": ["villages-circle", "villages-label"]
  };

  Object.entries(pairs).forEach(([checkboxId, layerIds]) => {
    document.getElementById(checkboxId).addEventListener("change", (e) => {
      const vis = e.target.checked ? "visible" : "none";
      layerIds.forEach(id => {
        if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", vis);
      });
    });
  });
}

function setupSearch() {
  const input = document.getElementById("search-input");
  const results = document.getElementById("search-results");

  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    if (q.length < 2) {
      results.classList.remove("visible");
      results.innerHTML = "";
      return;
    }

    const matches = allPlaces
      .filter(p => p.name.toLowerCase().includes(q) || (p.location && p.location.toLowerCase().includes(q)))
      .slice(0, 8);

    if (matches.length === 0) {
      results.innerHTML = `<div class="search-item">No results</div>`;
    } else {
      results.innerHTML = matches.map(p => `
        <div class="search-item" data-lng="${p.coords[0]}" data-lat="${p.coords[1]}" data-name="${p.name}">
          <strong>${p.name}</strong>
          <div class="type">${p.type || ""} ${p.division ? "· " + p.division : ""}</div>
        </div>
      `).join("");
    }
    results.classList.add("visible");
  });

  results.addEventListener("click", (e) => {
    const item = e.target.closest(".search-item");
    if (!item || !item.dataset.lng) return;
    const lng = parseFloat(item.dataset.lng);
    const lat = parseFloat(item.dataset.lat);
    map.flyTo({ center: [lng, lat], zoom: 12, essential: true });
    results.classList.remove("visible");
    input.value = item.dataset.name || "";
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-box")) {
      results.classList.remove("visible");
    }
  });
}

function setupNearest() {
  document.getElementById("btn-nearest").addEventListener("click", () => {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser.");
      return;
    }

    showToast("Locating you…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLng = pos.coords.longitude;
        const userLat = pos.coords.latitude;

        // Simple Haversine distance
        function dist(lng1, lat1, lng2, lat2) {
          const R = 6371;
          const dLat = (lat2 - lat1) * Math.PI / 180;
          const dLng = (lng2 - lng1) * Math.PI / 180;
          const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
          return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        }

        let nearest = null;
        let minD = Infinity;
        hospitalsData.features.forEach(f => {
          const [lng, lat] = f.geometry.coordinates;
          const d = dist(userLng, userLat, lng, lat);
          if (d < minD) {
            minD = d;
            nearest = f;
          }
        });

        if (nearest) {
          const [lng, lat] = nearest.geometry.coordinates;
          map.flyTo({ center: [lng, lat], zoom: 11, essential: true });
          new maplibregl.Popup({ offset: 12 })
            .setLngLat([lng, lat])
            .setHTML(`
              <div class="popup-title">${nearest.properties.name}</div>
              <div class="popup-meta">Nearest hospital · ~${minD.toFixed(1)} km away</div>
              <div class="popup-meta">${nearest.properties.phone ? "Phone: " + nearest.properties.phone : ""}</div>
            `)
            .addTo(map);
          showToast(`Nearest: ${nearest.properties.name} (~${minD.toFixed(1)} km)`);
        }
      },
      (err) => {
        showToast("Could not get your location. Please allow location access or try again.");
        console.warn(err);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

function setupSidebarToggle() {
  const btn = document.getElementById("sidebar-toggle");
  const sidebar = document.getElementById("sidebar");
  btn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
  });
}

// Start
map.on("load", loadData);
