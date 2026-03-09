// ============================================================
// Map 3 – Choropleth: resource count per census tract
// ============================================================

const map = L.map('map', {
  center: [47.48, -122.1],
  zoom: 10
});

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 19
}).addTo(map);

// Labels on top
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
  subdomains: 'abcd',
  maxZoom: 19,
  pane: 'shadowPane'
}).addTo(map);

// ---- Color scale (sequential blue) ----
// Breaks: 0, 1–2, 3–5, 6–10, 11–20, 21–50, 50+
const BREAKS = [0, 1, 3, 6, 11, 21, 51];
const PALETTE = ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#2171b5', '#084594'];

function getColor(count) {
  for (let i = BREAKS.length - 1; i >= 0; i--) {
    if (count >= BREAKS[i]) return PALETTE[i];
  }
  return PALETTE[0];
}

function tractStyle(feat) {
  const count = feat.properties.resource_count || 0;
  return {
    fillColor: getColor(count),
    weight: 0.5,
    opacity: 1,
    color: '#aaa',
    fillOpacity: 0.75
  };
}

// ---- Interaction ----
const infoBox = document.getElementById('info-box');

let geojsonLayer;

function highlightFeature(e) {
  const layer = e.target;
  layer.setStyle({ weight: 2, color: '#1a3a5c', fillOpacity: 0.9 });
  layer.bringToFront();

  const p = layer.feature.properties;
  const count = p.resource_count || 0;
  infoBox.innerHTML = `
    <strong style="color:#1a3a5c;">${p.TRACT_LBL2 || 'Tract ' + p.NAME20}</strong><br>
    Resources: <strong>${count}</strong><br>
    <span style="color:#666;font-size:0.76rem;">
      ${count === 0 ? 'No mapped resources in this tract'
        : count === 1 ? '1 resource'
        : `${count} resources`}
    </span>
  `;
}

function resetHighlight(e) {
  geojsonLayer.resetStyle(e.target);
  infoBox.innerHTML = '<strong style="color:#1a3a5c;">Hover over a tract</strong>';
}

function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}

function onEachFeature(_feat, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout:  resetHighlight,
    click:     zoomToFeature
  });
}

// ---- Load census tracts (has precomputed resource_count) ----
fetch('data/census_tracts.geojson')
  .then(r => r.json())
  .then(data => {
    geojsonLayer = L.geoJSON(data, {
      style: tractStyle,
      onEachFeature
    }).addTo(map);

    document.getElementById('loading').style.display = 'none';
  });

// ---- Legend ----
const legend = L.control({ position: 'bottomleft' });
legend.onAdd = function () {
  const labels = ['0', '1–2', '3–5', '6–10', '11–20', '21–50', '51+'];
  const div = L.DomUtil.create('div', 'legend');

  let html = '<h4>Resources per Tract</h4>';
  for (let i = 0; i < PALETTE.length; i++) {
    html += `<div class="legend-item">
      <div class="legend-swatch" style="background:${PALETTE[i]};border:1px solid #ccc;"></div>
      ${labels[i]}
    </div>`;
  }
  div.innerHTML = html;
  return div;
};
legend.addTo(map);
