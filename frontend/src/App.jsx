import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Droplet, 
  MapPin, 
  Thermometer, 
  CloudRain, 
  Users, 
  TrendingDown, 
  Activity, 
  ShieldAlert, 
  Info,
  Waves,
  Sun,
  Wind,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

// Haversine formula to find nearest district centroid
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Inline SVG Aqua Guardian Mascot Component
function AquaGuardian({ wsi, statusText }) {
  let state = 'checking';
  let colorClass = 'text-cyan-400';
  let bgColorClass = 'bg-cyan-950/40 border-cyan-800';
  
  if (wsi !== null) {
    if (wsi < 50) {
      state = 'happy';
      colorClass = 'text-green-400';
      bgColorClass = 'bg-green-950/40 border-green-800';
    } else if (wsi < 70) {
      state = 'thinking';
      colorClass = 'text-yellow-400';
      bgColorClass = 'bg-yellow-950/40 border-yellow-800';
    } else if (wsi < 85) {
      state = 'concerned';
      colorClass = 'text-orange-400';
      bgColorClass = 'bg-orange-950/40 border-orange-800';
    } else {
      state = 'alarmed';
      colorClass = 'text-red-400';
      bgColorClass = 'bg-red-950/40 border-red-800';
    }
  }

  return (
    <div className={`border p-4 rounded-xl flex items-center space-x-4 transition-all duration-300 ${bgColorClass}`}>
      <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center">
        {/* Animated Aqua Guardian SVG */}
        <svg viewBox="0 0 100 100" className={`w-full h-full ${colorClass} fill-current`}>
          {/* Outer Ring / Aura */}
          <circle 
            cx="50" 
            cy="50" 
            r="44" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeDasharray="6,6"
            className={state === 'checking' ? 'animate-spin' : state === 'alarmed' ? 'animate-ping opacity-35' : ''}
            style={{ transformOrigin: 'center', animationDuration: state === 'checking' ? '8s' : '3s' }}
          />
          
          {/* Mascot Body (Water Droplet Character) */}
          <path 
            d="M50 15 C68 42 75 58 75 70 C75 83 64 90 50 90 C36 90 25 83 25 70 C25 58 32 42 50 15 Z" 
            className={state === 'happy' ? 'animate-bounce' : state === 'concerned' ? 'animate-pulse' : ''}
            style={{ animationDuration: '2.5s' }}
          />
          
          {/* Character Face / Eyes */}
          <g fill="#0f172a">
            {state === 'happy' && (
              <>
                {/* Happy Winking/Smiling Eyes ^.^ */}
                <path d="M38 60 Q43 55 46 60" stroke="#0f172a" strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M54 60 Q57 55 62 60" stroke="#0f172a" strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M45 72 Q50 78 55 72" stroke="#0f172a" strokeWidth="3" fill="none" strokeLinecap="round" />
              </>
            )}
            
            {state === 'thinking' && (
              <>
                {/* Thinking Squinting Eyes */}
                <ellipse cx="40" cy="58" rx="4" ry="2" />
                <line x1="52" y1="58" x2="62" y2="58" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
                <path d="M44 70 h12" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
              </>
            )}
            
            {state === 'concerned' && (
              <>
                {/* Concerned Eyes with eyebrows */}
                <line x1="36" y1="50" x2="44" y2="54" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
                <line x1="64" y1="50" x2="56" y2="54" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
                <circle cx="40" cy="58" r="4.5" />
                <circle cx="60" cy="58" r="4.5" />
                <path d="M45 72 Q50 68 55 72" stroke="#0f172a" strokeWidth="3" fill="none" strokeLinecap="round" />
              </>
            )}
            
            {state === 'alarmed' && (
              <>
                {/* Alarmed Wide Open Eyes & Shocked Mouth */}
                <circle cx="38" cy="58" r="6" />
                <circle cx="62" cy="58" r="6" />
                <circle cx="50" cy="74" r="5" />
                {/* Warning details */}
                <path d="M50 25 L50 35" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
              </>
            )}
            
            {state === 'checking' && (
              <>
                {/* Checking Scan line */}
                <ellipse cx="40" cy="58" rx="4.5" ry="4.5" />
                <ellipse cx="60" cy="58" rx="4.5" ry="4.5" />
                <line x1="35" y1="70" x2="65" y2="70" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
              </>
            )}
          </g>
        </svg>
      </div>
      <div>
        <div className="text-xs uppercase tracking-wider text-slate-400 font-bold">Aqua Guardian Mascot</div>
        <div className={`text-lg font-extrabold ${colorClass}`}>
          {state === 'checking' && 'Initializing Scanner...'}
          {state === 'happy' && 'Safe & Abundant (Happy)'}
          {state === 'thinking' && 'Resource Advisory (Thinking)'}
          {state === 'concerned' && 'Action Recommended (Concerned)'}
          {state === 'alarmed' && 'Critical Stress Alert (Alarmed)'}
        </div>
        <p className="text-sm text-slate-300 mt-0.5 leading-snug">
          {wsi === null ? 'Fetching localized environmental telemetry data...' : statusText}
        </p>
      </div>
    </div>
  );
}

// Custom SVG Line Chart for 7-Day Stress Forecast
function StressForecastChart({ forecast }) {
  if (!forecast || forecast.length === 0) return null;
  
  const width = 450;
  const height = 180;
  const padding = 25;
  
  const points = forecast.map((f, i) => {
    const x = padding + (i * (width - 2 * padding)) / (forecast.length - 1);
    // Invert y: higher WSI is lower down in standard coordinates, so map 0-100 to height-padding down to padding
    const y = height - padding - (f.wsi / 100) * (height - 2 * padding);
    return { x, y, ...f };
  });
  
  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  return (
    <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-bold text-slate-300 flex items-center space-x-1.5">
          <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>7-Day Water Stress Index (WSI) Forecast</span>
        </h4>
        <span className="text-xs text-slate-400">Higher = More Stressed</span>
      </div>
      
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        {/* Y Axis Gridlines */}
        {[0, 25, 50, 75, 100].map((val) => {
          const y = height - padding - (val / 100) * (height - 2 * padding);
          return (
            <g key={val} className="opacity-20">
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#475569" strokeWidth="1" strokeDasharray="3,3" />
              <text x={padding - 5} y={y + 3} fill="#94a3b8" fontSize="9" textAnchor="end">{val}</text>
            </g>
          );
        })}
        
        {/* X Axis labels */}
        {points.map((p, i) => (
          <text key={i} x={p.x} y={height - 5} fill="#94a3b8" fontSize="9" textAnchor="middle">
            Day {p.day}
          </text>
        ))}
        
        {/* Line Path */}
        <path d={pathD} fill="none" stroke="#22d3ee" strokeWidth="2.5" className="drop-shadow-[0_2px_8px_rgba(34,211,238,0.4)]" />
        
        {/* Plot points */}
        {points.map((p, i) => {
          // Color points based on stress levels
          let pointColor = '#4ade80'; // green
          if (p.wsi >= 85) pointColor = '#f87171'; // red
          else if (p.wsi >= 70) pointColor = '#fb923c'; // orange
          else if (p.wsi >= 50) pointColor = '#facc15'; // yellow
          
          return (
            <g key={i} className="group cursor-pointer">
              <circle cx={p.x} cy={p.y} r="5" fill={pointColor} stroke="#0f172a" strokeWidth="1.5" />
              <text 
                x={p.x} 
                y={p.y - 8} 
                fill="#f8fafc" 
                fontSize="9" 
                fontWeight="bold" 
                textAnchor="middle"
                className="opacity-90 bg-slate-900 px-1 py-0.5 rounded"
              >
                {Math.round(p.wsi)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function App() {
  const [registered, setRegistered] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [districtName, setDistrictName] = useState('Chennai');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState(null);
  
  // Dashboard & Simulator states
  const [districtsList, setDistrictsList] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('Coimbatore');
  const [rainfallFactor, setRainfallFactor] = useState(1.0);
  const [tempShift, setTempShift] = useState(0.0);
  
  // Loaded assets
  const [geojsonData, setGeojsonData] = useState(null);
  const [bulkRisks, setBulkRisks] = useState({});
  const [districtDetails, setDistrictDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Map references
  const mapRef = useRef(null);
  const geojsonLayerRef = useRef(null);

  // Fetch districts list and GeoJSON boundary on startup
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/districts`)
      .then((res) => res.json())
      .then((data) => {
        setDistrictsList(data);
      })
      .catch((err) => console.error('Error fetching districts list:', err));

    fetch('/tamilnadu.geojson')
      .then((res) => res.json())
      .then((data) => {
        setGeojsonData(data);
      })
      .catch((err) => console.error('Error loading GeoJSON boundaries:', err));
  }, []);

  // Fetch bulk risks and district details when selected district or simulator shifts change
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/districts/risk?rainfall_factor=${rainfallFactor}&temp_shift=${tempShift}`)
      .then((res) => res.json())
      .then((data) => {
        setBulkRisks(data);
      })
      .catch((err) => console.error('Error fetching bulk risks:', err));
  }, [rainfallFactor, tempShift]);

  useEffect(() => {
    if (!selectedDistrict) return;
    setLoadingDetails(true);
    fetch(`${API_BASE_URL}/api/district/${selectedDistrict}?rainfall_factor=${rainfallFactor}&temp_shift=${tempShift}`)
      .then((res) => res.json())
      .then((data) => {
        setDistrictDetails(data);
        setLoadingDetails(false);
      })
      .catch((err) => {
        console.error('Error fetching details:', err);
        setLoadingDetails(false);
      });
  }, [selectedDistrict, rainfallFactor, tempShift]);

  // Request Resident Geolocation and run Haversine matching
  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lon);
        setLocating(false);

        // Match to nearest district centroid
        if (districtsList.length > 0) {
          let minDistance = Infinity;
          let nearest = districtsList[0].name;

          districtsList.forEach((d) => {
            const dist = haversineDistance(lat, lon, d.latitude, d.longitude);
            if (dist < minDistance) {
              minDistance = dist;
              nearest = d.name;
            }
          });
          
          setDistrictName(nearest);
          setSelectedDistrict(nearest);
          setLocError(`Location identified! Nearest district centroid: ${nearest}`);
        }
      },
      (error) => {
        setLocating(false);
        setLocError('Location access denied. Please select your district manually.');
      }
    );
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!name || !phone) return;

    fetch(`${API_BASE_URL}/api/residents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        phone,
        district_name: districtName,
        latitude,
        longitude
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success') {
          setSelectedDistrict(districtName);
          setRegistered(true);
        }
      })
      .catch((err) => {
        console.error('Registration failed:', err);
        alert('Could not connect to database. Proceeding to simulation dashboard...');
        setSelectedDistrict(districtName);
        setRegistered(true); // proceed anyway for testing
      });
  };

  // Render Leaflet Map
  useEffect(() => {
    if (!registered || !geojsonData) return;

    // Check if map is already initialized
    if (!mapRef.current) {
      mapRef.current = L.map('map-container', {
        zoomControl: true,
        attributionControl: false
      }).setView([11.0, 78.8], 7); // Center of Tamil Nadu

      // Dark style tiles from CartoDB
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 18
      }).addTo(mapRef.current);
    }

    // Helper to determine district color based on risk score
    const getColor = (dname) => {
      const score = bulkRisks[dname] ?? 50.0;
      if (score >= 85) return '#ef4444'; // red
      if (score >= 70) return '#f97316'; // orange
      if (score >= 50) return '#eab308'; // yellow
      return '#22c55e'; // green
    };

    // Styling function for GeoJSON polygons
    const styleFeature = (feature) => {
      const dname = feature.properties.dtname;
      const isSelected = dname === selectedDistrict;
      return {
        fillColor: getColor(dname),
        weight: isSelected ? 3.5 : 1,
        opacity: 1,
        color: isSelected ? '#ffffff' : '#334155',
        fillOpacity: isSelected ? 0.75 : 0.45
      };
    };

    // Clear previous layers
    if (geojsonLayerRef.current) {
      mapRef.current.removeLayer(geojsonLayerRef.current);
    }

    geojsonLayerRef.current = L.geoJSON(geojsonData, {
      style: styleFeature,
      onEachFeature: (feature, layer) => {
        const dname = feature.properties.dtname;
        
        // Popup listing current WSI
        const score = Math.round(bulkRisks[dname] ?? 50.0);
        layer.bindTooltip(`<strong>${dname}</strong><br/>Water Stress: ${score}/100`, {
          sticky: true,
          className: 'text-xs rounded border bg-slate-900 border-slate-700'
        });

        // Layer click handler
        layer.on({
          click: () => {
            setSelectedDistrict(dname);
          }
        });
      }
    }).addTo(mapRef.current);

  }, [registered, geojsonData, bulkRisks, selectedDistrict]);

  // Generate Status messages for Aqua Guardian based on WSI score
  const getAquaGuardianMsg = (wsi) => {
    if (wsi < 50) {
      return "Current rainfall profiles and water table levels indicate standard baseline conditions. Continue regular conservation practices.";
    } else if (wsi < 70) {
      return "Noticeable drops in precipitation or higher seasonal temperatures are driving up demand. Minor soil and reservoir recharge deficits observed.";
    } else if (wsi < 85) {
      return "Warning: Prolonged heat anomalies and declining aquifer depths present a high water stress advisory. Non-essential bans recommended.";
    } else {
      return "Emergency Alert! Severe climate stress detected with substantial aquifer depletion and zero precipitation. Immediate emergency tanker logistics required.";
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 font-sans text-slate-100">
      
      {/* Header bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/30">
            <Waves className="w-6 h-6 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight flex items-center space-x-1.5">
              <span>WATERPULSE</span>
              <span className="text-xs bg-cyan-500 text-slate-950 font-bold px-1.5 py-0.5 rounded">AI CLIMATE</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">Tamil Nadu Water Stress Early-Warning & Intervention Platform</p>
          </div>
        </div>
        
        {registered && (
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-slate-400">District Identified</div>
              <div className="text-sm font-bold text-cyan-400 flex items-center justify-end space-x-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{selectedDistrict}</span>
              </div>
            </div>
            
            {/* Quick dropdown select */}
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-cyan-500 outline-none"
            >
              {districtsList.map((d) => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
        )}
      </header>

      {/* Screen 1: Registration Form */}
      {!registered ? (
        <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
          {/* Decorative backdrop glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="bg-slate-900/70 border border-slate-800 p-8 rounded-2xl max-w-md w-full shadow-2xl backdrop-blur-md relative z-10">
            <div className="text-center mb-6">
              <div className="bg-cyan-500/15 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 border border-cyan-500/30">
                <Droplet className="w-6 h-6 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-black">Register Local Node</h2>
              <p className="text-sm text-slate-400 mt-1">Activate hyper-local satellite & weather telemetry for your district</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-1.5">Resident Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Swetha S"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none text-sm"
                />
              </div>

              <div className="border border-slate-800/80 bg-slate-950/40 p-4 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Geolocation node</span>
                  <button
                    type="button"
                    onClick={handleGeolocation}
                    disabled={locating}
                    className="text-xs font-extrabold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center space-x-1"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{locating ? 'Locating...' : 'Scan GPS'}</span>
                  </button>
                </div>
                
                {latitude && longitude ? (
                  <div className="text-xs text-green-400 font-medium flex items-center space-x-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Matched: {latitude.toFixed(4)}°, {longitude.toFixed(4)}°</span>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 leading-snug">
                    Granting GPS telemetry allows us to match you to your nearest district centroid.
                  </div>
                )}
                
                {locError && (
                  <div className="text-xs text-yellow-500 mt-2 font-medium">
                    {locError}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-1.5">Manual District Fallback</label>
                <select
                  value={districtName}
                  onChange={(e) => setDistrictName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:border-cyan-500 outline-none text-sm"
                >
                  {districtsList.length > 0 ? (
                    districtsList.map((d) => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))
                  ) : (
                    <option value="Chennai">Chennai</option>
                  )}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-extrabold py-3.5 rounded-xl transition-all duration-200 shadow-lg text-sm mt-2 flex items-center justify-center space-x-1.5"
              >
                <span>Initialize WaterPulse Dashboard</span>
              </button>
            </form>
          </div>
        </main>
      ) : (
        /* Screen 2: Simulation Dashboard */
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
          
          {/* Map Column (7 Grid Units) */}
          <section className="lg:col-span-7 flex flex-col space-y-4 min-h-[500px]">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex-1 flex flex-col relative">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="font-bold text-base tracking-tight flex items-center space-x-1.5">
                    <Waves className="w-5 h-5 text-cyan-400" />
                    <span>Tamil Nadu District Water Stress Map</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Click a boundary polygon to select and load details</p>
                </div>
                
                {/* Map Color Legend */}
                <div className="flex items-center space-x-2 text-[10px] uppercase font-bold text-slate-400">
                  <div className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 bg-green-500 rounded" />
                    <span>Safe</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 bg-yellow-500 rounded" />
                    <span>Moderate</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 bg-orange-500 rounded" />
                    <span>High</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 bg-red-500 rounded" />
                    <span>Critical</span>
                  </div>
                </div>
              </div>
              
              {/* Map Mounting Div */}
              <div className="flex-1 relative min-h-[350px]">
                <div id="map-container" className="absolute inset-0 z-10" />
              </div>
            </div>

            {/* Climate Simulator Sliders */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <h3 className="font-extrabold text-sm tracking-wider uppercase text-slate-400 flex items-center space-x-1.5 mb-4">
                <Sun className="w-4 h-4 text-yellow-400" />
                <span>Layer 6: Climate Impact What-If Simulator</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Rainfall Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-300 flex items-center space-x-1">
                      <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Rainfall Anomaly</span>
                    </span>
                    <span className={rainfallFactor < 1 ? 'text-red-400' : 'text-green-400'}>
                      {rainfallFactor === 1.0 ? 'Normal (100%)' : `${Math.round(rainfallFactor * 100)}%`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.1"
                    value={rainfallFactor}
                    onChange={(e) => setRainfallFactor(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-500 focus:outline-none"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>-50% Drought</span>
                    <span>Baseline</span>
                    <span>+50% Monsoon</span>
                  </div>
                </div>

                {/* Temperature Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-300 flex items-center space-x-1">
                      <Thermometer className="w-3.5 h-3.5 text-red-400" />
                      <span>Temperature Shift</span>
                    </span>
                    <span className={tempShift > 0 ? 'text-red-400' : 'text-green-400'}>
                      {tempShift === 0 ? 'Baseline (0°C)' : `+${tempShift}°C`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={tempShift}
                    onChange={(e) => setTempShift(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-red-500 focus:outline-none"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Normal</span>
                    <span>+2.5°C Shift</span>
                    <span>+5.0°C Global Warming</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Details Dashboard Column (5 Grid Units) */}
          <section className="lg:col-span-5 flex flex-col space-y-4">
            
            {loadingDetails ? (
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl flex flex-col items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
                <span className="text-sm text-slate-400 mt-3 font-medium">Re-computing climate risk grids...</span>
              </div>
            ) : districtDetails ? (
              <>
                {/* Aqua Guardian Mascot & Summary */}
                <AquaGuardian 
                  wsi={districtDetails.current_wsi} 
                  statusText={getAquaGuardianMsg(districtDetails.current_wsi)} 
                />

                {/* Main stats grid */}
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-850 pb-2.5">
                    <div>
                      <h3 className="text-lg font-black text-slate-100">{districtDetails.name}</h3>
                      <p className="text-xs text-slate-400">Groundwater & Weather Snapshot</p>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Water Stress Score</div>
                      <div className="text-3xl font-black tracking-tight text-cyan-400">
                        {districtDetails.current_wsi}<span className="text-sm text-slate-500">/100</span>
                      </div>
                    </div>
                  </div>

                  {/* Environment metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-850">
                      <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center space-x-1">
                        <Droplet className="w-3.5 h-3.5 text-blue-400" />
                        <span>Groundwater</span>
                      </div>
                      <div className="text-sm font-extrabold mt-1 text-slate-200">
                        {districtDetails.groundwater.level_m}m <span className="text-xs text-slate-400 font-normal">depth</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 flex justify-between">
                        <span>Extraction:</span>
                        <span className={districtDetails.groundwater.extraction_pct > 90 ? 'text-red-400' : 'text-slate-300'}>
                          {Math.round(districtDetails.groundwater.extraction_pct)}%
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-850">
                      <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center space-x-1">
                        <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Weather Norm</span>
                      </div>
                      <div className="text-sm font-extrabold mt-1 text-slate-200">
                        {Math.round(districtDetails.normals.avg_monthly_rainfall_mm)}mm <span className="text-xs text-slate-400 font-normal">avg</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 flex justify-between">
                        <span>Temp Normal:</span>
                        <span>{districtDetails.normals.avg_monthly_temp_c}°C</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Explanations Cause breakdown */}
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
                    <ShieldAlert className="w-4 h-4 text-orange-400" />
                    <span>Explainable AI: Risk Telemetry Reasons</span>
                  </h4>
                  <ul className="space-y-2.5">
                    {districtDetails.explanations.map((reason, idx) => (
                      <li key={idx} className="text-sm text-slate-300 flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                        <span className="leading-snug">{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Stress forecast graph */}
                <StressForecastChart forecast={districtDetails.forecast} />

                {/* Water budget calculations */}
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center space-x-1.5">
                      <Users className="w-4 h-4 text-cyan-400" />
                      <span>Hyper-local Water Budget (Weekly)</span>
                    </h4>
                    <p className="text-xs text-slate-400">Targeting regional population of {(districtDetails.budget.population / 1e6).toFixed(2)}M residents</p>
                  </div>

                  {/* Demand vs Supply budget bar */}
                  <div className="space-y-2.5">
                    {/* Demand */}
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-slate-400">Predicted Demand</span>
                        <span className="text-slate-200">{(districtDetails.budget.weekly_demand_liters / 1e6).toFixed(1)}M Liters</span>
                      </div>
                      <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: '100%' }} />
                      </div>
                    </div>

                    {/* Available */}
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-slate-400">Available Supply</span>
                        <span className="text-cyan-400">{(districtDetails.budget.weekly_available_liters / 1e6).toFixed(1)}M Liters</span>
                      </div>
                      <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-cyan-400 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${(districtDetails.budget.weekly_available_liters / districtDetails.budget.weekly_demand_liters) * 100}%` }} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Target LPCD recommendation box */}
                  <div className="border border-slate-800 bg-slate-950/40 p-3 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Conservation Goal</span>
                      <div className="text-sm font-extrabold text-slate-200">
                        {districtDetails.budget.recommended_lpcd} <span className="text-xs font-normal text-slate-400">Liters per citizen / day</span>
                      </div>
                    </div>
                    {districtDetails.budget.recommended_lpcd < 135.0 ? (
                      <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 text-[10px] px-2 py-1 rounded font-black uppercase">
                        Restricted
                      </span>
                    ) : (
                      <span className="bg-green-500/10 text-green-500 border border-green-500/30 text-[10px] px-2 py-1 rounded font-black uppercase">
                        Standard
                      </span>
                    )}
                  </div>

                  {/* Suggested actions list */}
                  <div className="bg-slate-950/30 border border-slate-850 p-3.5 rounded-lg">
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">Intervention Priority Plan</div>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {districtDetails.budget.action_plan.map((action, idx) => (
                        <li key={idx} className="flex items-start space-x-1.5">
                          <span className="text-cyan-400 font-bold mt-0.5">•</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl flex flex-col items-center justify-center h-48 text-slate-400">
                <HelpCircle className="w-8 h-8 mb-2 text-slate-500" />
                <span>Select a district from map to load telemetry details</span>
              </div>
            )}
          </section>

        </main>
      )}

    </div>
  );
}
