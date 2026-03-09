// ============================================================
// Map 1 – Dashboard: All public resource types with toggles
// ============================================================

const map = L.map('map', {
  center: [47.48, -122.1],
  zoom: 10,
  zoomControl: true
});

// Basemap
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 19
}).addTo(map);

// ---- Color scheme ----
const COLORS = {
  library:   '#2563EB',  // blue
  community: '#16A34A',  // green
  health:    '#DC2626',  // red
  park:      '#65A30D'   // lime
};

// ---- Helper: circle marker factory ----
function circleMarker(color, radius = 7) {
  return {
    radius,
    fillColor: color,
    color: '#fff',
    weight: 1.5,
    opacity: 1,
    fillOpacity: 0.85
  };
}

// ---- Libraries ----
const libraryGroup = L.markerClusterGroup({ disableClusteringAtZoom: 13 });

fetch('data/libraries.geojson')
  .then(r => r.json())
  .then(data => {
    L.geoJSON(data, {
      pointToLayer: (_feat, latlng) =>
        L.circleMarker(latlng, circleMarker(COLORS.library)),
      onEachFeature: (feat, layer) => {
        const p = feat.properties;
        layer.bindPopup(`
          <div class="popup-content">
            <span class="tag" style="background:${COLORS.library}">Library</span>
            <h4>${p.LABEL || p.NAME}</h4>
            <div>${p.ADDRESS}</div>
            ${p.WEBSITE ? `<div><a href="${p.WEBSITE}" target="_blank">Visit website →</a></div>` : ''}
          </div>
        `);
      }
    }).addTo(libraryGroup);
    libraryGroup.addTo(map);
    checkLoaded();
  });

// ---- Community Centers ----
const communityGroup = L.markerClusterGroup({ disableClusteringAtZoom: 13 });

fetch('data/community_centers.geojson')
  .then(r => r.json())
  .then(data => {
    L.geoJSON(data, {
      pointToLayer: (_feat, latlng) =>
        L.circleMarker(latlng, circleMarker(COLORS.community)),
      onEachFeature: (feat, layer) => {
        const p = feat.properties;
        layer.bindPopup(`
          <div class="popup-content">
            <span class="tag" style="background:${COLORS.community}">Community Center</span>
            <h4>${p.NAME}</h4>
            <div>${p.ADDRESS}</div>
          </div>
        `);
      }
    }).addTo(communityGroup);
    communityGroup.addTo(map);
    checkLoaded();
  });

// ---- Health Clinics ----
const healthGroup = L.markerClusterGroup({ disableClusteringAtZoom: 13 });

fetch('data/health_clinics.geojson')
  .then(r => r.json())
  .then(data => {
    L.geoJSON(data, {
      pointToLayer: (_feat, latlng) =>
        L.circleMarker(latlng, circleMarker(COLORS.health, 7)),
      onEachFeature: (feat, layer) => {
        const p = feat.properties;
        const services = [
          p.WIC === 'Y' && 'WIC',
          p.DENTAL === 'Y' && 'Dental',
          p.PRIMARYCARE === 'Y' && 'Primary Care',
          p.SEXUALHEALTH === 'Y' && 'Sexual Health'
        ].filter(Boolean).join(', ') || 'See website';

        layer.bindPopup(`
          <div class="popup-content">
            <span class="tag" style="background:${COLORS.health}">Health Clinic</span>
            <h4>${p.NAME}</h4>
            <div>${p.ADDRESS}, ${p.CITY} ${p.ZIPCODE}</div>
            <div><strong>Services:</strong> ${services}</div>
            ${p.WEBSITE ? `<div><a href="${p.WEBSITE}" target="_blank">Visit website →</a></div>` : ''}
          </div>
        `);
      }
    }).addTo(healthGroup);
    healthGroup.addTo(map);
    checkLoaded();
  });

// ---- Parks ----
const parkGroup = L.markerClusterGroup({ disableClusteringAtZoom: 14 });

fetch('data/parks_points.geojson')
  .then(r => r.json())
  .then(data => {
    L.geoJSON(data, {
      pointToLayer: (_feat, latlng) =>
        L.circleMarker(latlng, { ...circleMarker(COLORS.park, 5), fillOpacity: 0.7 }),
      onEachFeature: (feat, layer) => {
        const p = feat.properties;
        layer.bindPopup(`
          <div class="popup-content">
            <span class="tag" style="background:${COLORS.park}">Park</span>
            <h4>${p.NAME || 'Park'}</h4>
            ${p.TYPE ? `<div>${p.TYPE}</div>` : ''}
            ${p.OWNER ? `<div><strong>Owner:</strong> ${p.OWNER}</div>` : ''}
          </div>
        `);
      }
    }).addTo(parkGroup);
    parkGroup.addTo(map);
    checkLoaded();
  });

// ---- Layer control ----
const overlays = {
  '<span style="color:#2563EB">&#9679;</span> Libraries': libraryGroup,
  '<span style="color:#16A34A">&#9679;</span> Community Centers': communityGroup,
  '<span style="color:#DC2626">&#9679;</span> Health Clinics': healthGroup,
  '<span style="color:#65A30D">&#9679;</span> Parks': parkGroup
};
L.control.layers(null, overlays, { collapsed: false, position: 'topright' }).addTo(map);

// ---- Legend ----
const legend = L.control({ position: 'bottomleft' });
legend.onAdd = function () {
  const div = L.DomUtil.create('div', 'legend');
  div.innerHTML = `
    <h4>Resource Types</h4>
    <div class="legend-item"><div class="legend-dot" style="background:${COLORS.library}"></div> Libraries (${27})</div>
    <div class="legend-item"><div class="legend-dot" style="background:${COLORS.community}"></div> Community Centers (${46})</div>
    <div class="legend-item"><div class="legend-dot" style="background:${COLORS.health}"></div> Health Clinics (${32})</div>
    <div class="legend-item"><div class="legend-dot" style="background:${COLORS.park}"></div> Parks (1,514)</div>
  `;
  return div;
};
legend.addTo(map);

// ---- Loading indicator ----
let loadedCount = 0;
function checkLoaded() {
  loadedCount++;
  if (loadedCount >= 4) {
    document.getElementById('loading').style.display = 'none';
  }
}
