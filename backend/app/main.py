import os
import csv
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Optional

# Relative imports from backend package
from backend.app.database import get_db, init_db, District, WeatherData, WaterData, Resident, SessionLocal
from backend.app.risk_engine import calculate_district_wsi, generate_wsi_explanations, calculate_water_budget

app = FastAPI(title="WaterPulse API", description="AI Climate-Resilience & Water Stress Intelligence Platform")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store for historical normals loaded from CSV
historical_normals = {}

def load_historical_normals():
    paths = [
        "district_weather_historical.csv",
        os.path.join("..", "district_weather_historical.csv"),
        os.path.join(os.path.dirname(__file__), "..", "..", "district_weather_historical.csv")
    ]
    target_path = None
    for p in paths:
        if os.path.exists(p):
            target_path = p
            break
            
    if not target_path:
        print("Warning: district_weather_historical.csv not found.")
        return
        
    print(f"Loading historical normals from {target_path}...")
    with open(target_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            historical_normals[row['district_name']] = {
                'avg_monthly_rainfall_mm': float(row['avg_monthly_rainfall_mm']),
                'avg_monthly_temp_c': float(row['avg_monthly_temp_c'])
            }
    print(f"Loaded {len(historical_normals)} historical normal records.")

@app.on_event("startup")
def startup_event():
    init_db()
    load_historical_normals()

# Pydantic Schemas
class ResidentCreate(BaseModel):
    name: str
    phone: str
    district_name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "WaterPulse API"}

@app.get("/api/districts")
def list_districts(db: Session = Depends(get_db)):
    districts = db.query(District).all()
    return [{
        "id": d.id,
        "name": d.name,
        "latitude": d.latitude,
        "longitude": d.longitude
    } for d in districts]

@app.get("/api/districts/risk")
def get_bulk_risks(
    rainfall_factor: float = Query(1.0, description="Rainfall multiplier from simulator"),
    temp_shift: float = Query(0.0, description="Temperature shift in Celsius"),
    db: Session = Depends(get_db)
):
    """Returns bulk risk scores for all districts for day 1 weather forecast."""
    districts = db.query(District).all()
    risks = {}
    
    for d in districts:
        w_forecasts = [w for w in d.weather_forecasts if w.day == 1]
        w_data = d.water_data
        
        if not w_forecasts or not w_data:
            risks[d.name] = 50.0
            continue
            
        wf = w_forecasts[0]
        normals = historical_normals.get(d.name, {'avg_monthly_rainfall_mm': 100.0, 'avg_monthly_temp_c': 30.0})
        
        wsi, _ = calculate_district_wsi(
            gw_level=w_data.groundwater_level,
            extraction_pct=w_data.extraction_percentage,
            avg_monthly_rain=normals['avg_monthly_rainfall_mm'],
            avg_monthly_temp=normals['avg_monthly_temp_c'],
            forecast_rain=wf.forecast_rainfall_mm,
            forecast_temp=wf.forecast_temp_c,
            humidity=wf.humidity_pct,
            evaporation=wf.evaporation_mm,
            rainfall_factor=rainfall_factor,
            temp_shift=temp_shift
        )
        risks[d.name] = wsi
        
    return risks

@app.get("/api/district/{name}")
def get_district_details(
    name: str,
    rainfall_factor: float = Query(1.0),
    temp_shift: float = Query(0.0),
    db: Session = Depends(get_db)
):
    dist = db.query(District).filter(District.name == name).first()
    if not dist:
        raise HTTPException(status_code=404, detail="District not found")
        
    w_data = dist.water_data
    if not w_data:
        raise HTTPException(status_code=404, detail="Water baseline data missing for district")
        
    forecasts_db = sorted(dist.weather_forecasts, key=lambda x: x.day)
    normals = historical_normals.get(dist.name, {'avg_monthly_rainfall_mm': 100.0, 'avg_monthly_temp_c': 30.0})
    
    # Generate 7-day forecast stress and weather details
    forecast_details = []
    for wf in forecasts_db:
        wsi, breakdown = calculate_district_wsi(
            gw_level=w_data.groundwater_level,
            extraction_pct=w_data.extraction_percentage,
            avg_monthly_rain=normals['avg_monthly_rainfall_mm'],
            avg_monthly_temp=normals['avg_monthly_temp_c'],
            forecast_rain=wf.forecast_rainfall_mm,
            forecast_temp=wf.forecast_temp_c,
            humidity=wf.humidity_pct,
            evaporation=wf.evaporation_mm,
            rainfall_factor=rainfall_factor,
            temp_shift=temp_shift
        )
        forecast_details.append({
            "day": wf.day,
            "wsi": wsi,
            "forecast_rainfall_mm": wf.forecast_rainfall_mm,
            "forecast_temp_c": wf.forecast_temp_c,
            "humidity_pct": wf.humidity_pct,
            "evaporation_mm": wf.evaporation_mm
        })
        
    # Day 1 details for explanations and water budget
    current_wsi = forecast_details[0]['wsi'] if forecast_details else 50.0
    _, current_breakdown = calculate_district_wsi(
        gw_level=w_data.groundwater_level,
        extraction_pct=w_data.extraction_percentage,
        avg_monthly_rain=normals['avg_monthly_rainfall_mm'],
        avg_monthly_temp=normals['avg_monthly_temp_c'],
        forecast_rain=forecasts_db[0].forecast_rainfall_mm if forecasts_db else 0.0,
        forecast_temp=forecasts_db[0].forecast_temp_c if forecasts_db else 30.0,
        humidity=forecasts_db[0].humidity_pct if forecasts_db else 70.0,
        evaporation=forecasts_db[0].evaporation_mm if forecasts_db else 5.0,
        rainfall_factor=rainfall_factor,
        temp_shift=temp_shift
    )
    
    explanations = generate_wsi_explanations(dist.name, current_breakdown, w_data.groundwater_level)
    budget = calculate_water_budget(dist.name, current_wsi)
    
    return {
        "name": dist.name,
        "latitude": dist.latitude,
        "longitude": dist.longitude,
        "groundwater": {
            "level_m": w_data.groundwater_level,
            "trend": w_data.historical_trend,
            "annual_recharge_bcm": w_data.annual_recharge_bcm,
            "annual_extraction_bcm": w_data.annual_extraction_bcm,
            "extraction_pct": w_data.extraction_percentage
        },
        "current_wsi": current_wsi,
        "wsi_breakdown": current_breakdown,
        "normals": normals,
        "explanations": explanations,
        "budget": budget,
        "forecast": forecast_details
    }

@app.post("/api/residents")
def register_resident(resident: ResidentCreate, db: Session = Depends(get_db)):
    # Validate district exists
    dist = db.query(District).filter(District.name == resident.district_name).first()
    if not dist:
        raise HTTPException(status_code=400, detail="Invalid district name selected.")
        
    db_res = Resident(
        name=resident.name,
        phone=resident.phone,
        district_name=resident.district_name,
        latitude=resident.latitude,
        longitude=resident.longitude
    )
    db.add(db_res)
    db.commit()
    db.refresh(db_res)
    
    return {
        "status": "success",
        "message": f"Successfully registered resident {db_res.name} to district {db_res.district_name}.",
        "resident_id": db_res.id
    }
