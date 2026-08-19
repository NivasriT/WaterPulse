# WaterPulse 🌊
### AI-Powered Climate-Resilience & Water Stress Intelligence Platform

WaterPulse is an intelligent, neighborhood-level water stress early-warning and optimization system designed to predict water shortages before they become crises. By integrating dynamic weather forecasting, groundwater telemetry, and population demand models, it generates actionable local water budgets, explainability details, and optimization action plans.

This project is built specifically for administrative districts in Tamil Nadu (TN) to address localized climate risks.

---

## 🚀 Key Features

1. **Hyperlocal District Identification**: Matches resident location permissions directly to their nearest district boundary using a client-side **Haversine Nearest-Centroid Algorithm**.
2. **Interactive GIS Map**: Renders the 38 administrative districts of Tamil Nadu dynamically from `tamilnadu.geojson` using Leaflet, color-coding each district by its calculated Water Stress Index (WSI) in real time.
3. **Explainable AI (XAI) Engine**: Breaks down WSI score contributions (groundwater depth, rainfall deficit, temp anomalies, and evaporation factors) into plain English explanations so users and local administrators understand the *why* behind a warning.
4. **Aqua Guardian Mascot**: An animated responsive SVG agent whose emotional expression (Happy, Thinking, Concerned, Alarmed, checking) changes based on current localized water stress levels.
5. **7-Day Water Stress Forecasting**: Extrapolates short-term water stress trends using a weighted mathematical baseline of forecast weather metrics and historical normal baselines, rendered via a custom SVG line-graph.
6. **Weekly Water Budget Optimizer**: Calculates weekly demand vs available supply and deficit gaps, recommending targeted daily LPCD consumption limits and emergency interventions (e.g. number of water tankers to deploy, demand bans).
7. **Layer 6 Climate Impact What-If Simulator**: Allows judges/administrators to slide rainfall anomalies (-50% to +50%) and temperature shifts (0°C to +5°C) to see how future global warming directly changes the state-wide stress map and budgets in real time.

---

## 🛠️ Technical Architecture & Stack

### Frontend
- **Framework**: React 18 (Vite, fast compilation)
- **Styling**: Tailwind CSS
- **GIS Mapping**: Leaflet.js (styled with CartoDB Dark Matter map layers)
- **Charts**: Custom responsive SVG line and budget progress bar components (eliminates bulky package imports and prevents dependency conflicts)

### Backend
- **Framework**: FastAPI (Python 3)
- **Database**: SQLite (SQLAlchemy ORM)
- **Calculation Engine**: Custom multi-factor mathematical models integrating:
  - *Rainfall stress* (Daily forecast vs monthly seasonal normal)
  - *Groundwater pressure* (Aquifer extraction vs annual recharge)
  - *Temperature anomalies* (Forecast temperature shifts)
  - *Evaporative loss* (Solar evaporation & relative humidity)

---

## 📂 Project Structure

```
WaterPulse/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── database.py       # DB schema and connection settings
│   │   ├── loader.py         # DB seeder script for loading CSVs
│   │   ├── main.py           # FastAPI application routes
│   │   └── risk_engine.py    # Core WSI calculation logic
│   └── requirements.txt      # Backend Python dependencies
├── frontend/
│   ├── public/
│   │   └── tamilnadu.geojson # TN boundary map dataset
│   ├── src/
│   │   ├── assets/
│   │   ├── App.jsx           # Main React Dashboard & Forms
│   │   ├── index.css         # Tailwind & Leaflet styles
│   │   └── main.jsx          # DOM entry point
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── generate_data.py          # Data generation pipeline script
├── district_centroids.csv    # Computed district locations
├── groundwater_baseline.csv  # Aquifer telemetry
├── district_weather_forecast.csv # 7-day predicted weather
├── district_weather_historical.csv # Historical monthly norms
├── tamilnadu.geojson         # Tamil Nadu geojson boundaries
└── README.md
```

---

## 💻 How to Run Locally

### 1. Initialize and Seed the Database

Run the Python generator script to extract centroids from the GeoJSON boundaries and generate groundwater and weather telemetry, then load them into the SQLite database:

```bash
# 1. Generate local CSV datasets
python generate_data.py

# 2. Seed database
$env:PYTHONPATH="."
python -m backend.app.loader
```

### 2. Start the Backend Server

Launch the FastAPI application using Uvicorn:

```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The documentation will be available at `http://localhost:8000/docs`.

### 3. Start the Frontend Application

Install npm dependencies and run the Vite server:

```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🌍 Sustainable Development Goals (SDGs)
- **SDG 6 (Clean Water and Sanitation)**: Optimizes domestic usage budgets and flags groundwater overdraft issues.
- **SDG 11 (Sustainable Cities and Communities)**: Provides early alerts of urban water shortages.
- **SDG 13 (Climate Action)**: Simulates the direct impact of rainfall deficiencies and temperature rises on state resource availability.
