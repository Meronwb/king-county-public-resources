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
  div.style.cssText = `
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    padding: 12px 14px;
    border-radius: 12px;
    border: 1px solid rgba(60,60,67,0.18);
    box-shadow: 0 4px 12px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06);
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 0.82rem;
    min-width: 168px;
    -webkit-font-smoothing: antialiased;
  `;
  div.innerHTML = `
    <div style="font-size:0.7rem;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;color:rgba(60,60,67,0.5);margin-bottom:8px;">Show Layer</div>
    <button class="heat-btn active" data-type="all"       data-color="#4f46e5">All Resources</button>
    <button class="heat-btn"        data-type="library"   data-color="#2563eb">Libraries</button>
    <button class="heat-btn"        data-type="community" data-color="#16a34a">Community Centers</button>
    <button class="heat-btn"        data-type="health"    data-color="#dc2626">Health Clinics</button>
    <button class="heat-btn"        data-type="park"      data-color="#65a30d">Parks</button>
  `;

  div.querySelectorAll('.heat-btn').forEach(btn => {
    const color = btn.dataset.color;
    btn.style.cssText = `
      display: block; width: 100%; margin: 3px 0;
      padding: 6px 10px; border: 1px solid transparent;
      border-radius: 999px; cursor: pointer;
      font-size: 0.8rem; font-weight: 500; text-align: left;
      font-family: inherit; letter-spacing: -0.01em;
      background: transparent; color: rgba(60,60,67,0.75);
      transition: all 0.15s cubic-bezier(0.4,0,0.2,1);
    `;
    btn.addEventListener('mouseenter', () => {
      if (!btn.classList.contains('active')) {
        btn.style.background = `${color}18`;
        btn.style.color = color;
      }
    });
    btn.addEventListener('mouseleave', () => {
      if (!btn.classList.contains('active')) {
        btn.style.background = 'transparent';
        btn.style.color = 'rgba(60,60,67,0.75)';
      }
    });
    btn.addEventListener('click', () => {
      renderHeat(btn.dataset.type);
      div.querySelectorAll('.heat-btn').forEach(b => {
        b.style.background = 'transparent';
        b.style.color = 'rgba(60,60,67,0.75)';
        b.style.borderColor = 'transparent';
      });
      btn.style.background = `${color}18`;
      btn.style.color = color;
      btn.style.borderColor = `${color}40`;
    });
  });

  // Set initial active state
  const firstBtn = div.querySelector('[data-type="all"]');
  firstBtn.style.background = '#4f46e518';
  firstBtn.style.color = '#4f46e5';
  firstBtn.style.borderColor = '#4f46e540';

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
