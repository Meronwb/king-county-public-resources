// ============================================================
// Map 2 – Density / Heatmap
// Data loaded via <script> tags in map2.html (no server needed)
// ============================================================

const map = L.map('map', {
  center: [47.48, -122.1],
  zoom: 10
});

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 19
}).addTo(map);

// ---- Heatmap options per resource type ----
const heatOptions = {
  all:       { radius: 25, blur: 20, maxZoom: 17, gradient: { 0.2: '#0000ff', 0.4: '#00ffff', 0.6: '#00ff00', 0.8: '#ffff00', 1.0: '#ff0000' } },
  library:   { radius: 30, blur: 22, maxZoom: 17, gradient: { 0.4: '#bfdbfe', 0.7: '#3b82f6', 1.0: '#1d4ed8' } },
  community: { radius: 30, blur: 22, maxZoom: 17, gradient: { 0.4: '#bbf7d0', 0.7: '#22c55e', 1.0: '#15803d' } },
  health:    { radius: 30, blur: 22, maxZoom: 17, gradient: { 0.4: '#fecaca', 0.7: '#ef4444', 1.0: '#b91c1c' } },
  park:      { radius: 20, blur: 18, maxZoom: 17, gradient: { 0.4: '#d9f99d', 0.7: '#84cc16', 1.0: '#3f6212' } }
};

// ---- Convert GeoJSON features to [lat, lng, intensity] ----
function toLatLngs(features) {
  return features
    .filter(f => f.geometry && f.geometry.type === 'Point')
    .map(f => [f.geometry.coordinates[1], f.geometry.coordinates[0], 1]);
}

// Build point arrays from the pre-loaded global variables
const points = {
  library:   toLatLngs(librariesData.features),
  community: toLatLngs(communityCentersData.features),
  health:    toLatLngs(healthClinicsData.features),
  park:      toLatLngs(parksData.features)
};

let currentHeatLayer = null;

function renderHeat(type) {
  if (currentHeatLayer) map.removeLayer(currentHeatLayer);

  const pts = type === 'all'
    ? [...points.library, ...points.community, ...points.health, ...points.park]
    : points[type];

  currentHeatLayer = L.heatLayer(pts, heatOptions[type] || heatOptions.all);
  currentHeatLayer.addTo(map);

  document.querySelectorAll('.heat-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.type === type);
  });
}

// ---- Custom toggle control ----
const toggleControl = L.control({ position: 'topright' });
toggleControl.onAdd = function () {
  const div = L.DomUtil.create('div');
  div.style.cssText = 'background:rgba(15,15,15,0.85);padding:10px 14px;border-radius:6px;color:#fff;font-family:sans-serif;font-size:0.82rem;min-width:160px;';
  div.innerHTML = `
    <div style="font-weight:700;margin-bottom:8px;border-bottom:1px solid #444;padding-bottom:4px;">Show Layer</div>
    <button class="heat-btn active" data-type="all"       style="background:#6366f1">All Resources</button>
    <button class="heat-btn"        data-type="library"   style="background:#2563eb">Libraries</button>
    <button class="heat-btn"        data-type="community" style="background:#16a34a">Community Centers</button>
    <button class="heat-btn"        data-type="health"    style="background:#dc2626">Health Clinics</button>
    <button class="heat-btn"        data-type="park"      style="background:#65a30d">Parks</button>
  `;

  div.querySelectorAll('.heat-btn').forEach(btn => {
    btn.style.cssText = `
      display:block; width:100%; margin:3px 0; padding:5px 8px; border:none; border-radius:4px;
      color:#fff; cursor:pointer; font-size:0.8rem; text-align:left; opacity:0.65;
    `;
    btn.addEventListener('click', () => renderHeat(btn.dataset.type));
  });

  const style = document.createElement('style');
  style.textContent = '.heat-btn.active { opacity: 1 !important; font-weight: 700; }';
  document.head.appendChild(style);

  L.DomEvent.disableClickPropagation(div);
  return div;
};
toggleControl.addTo(map);

// ---- Legend ----
const legend = L.control({ position: 'bottomleft' });
legend.onAdd = function () {
  const div = L.DomUtil.create('div', 'legend');
  div.innerHTML = `
    <h4>Heat Intensity</h4>
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
      <div style="width:100px;height:12px;border-radius:3px;background:linear-gradient(to right,#0000ff,#00ffff,#00ff00,#ffff00,#ff0000)"></div>
    </div>
    <div style="display:flex;justify-content:space-between;width:100px;font-size:0.72rem;color:#666;">
      <span>Low</span><span>High</span>
    </div>
    <div style="margin-top:8px;font-size:0.75rem;color:#666;">
      Zoom in to see individual<br>resource locations.
    </div>
  `;
  return div;
};
legend.addTo(map);

// ---- Init ----
document.getElementById('loading').style.display = 'none';
renderHeat('all');
