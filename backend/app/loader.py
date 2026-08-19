import os
import csv
from sqlalchemy.orm import Session
from backend.app.database import SessionLocal, District, WeatherData, WaterData, init_db

def find_csv(filename):
    """Finds the CSV file checking local paths."""
    paths = [
        filename,
        os.path.join("..", filename),
        os.path.join("..", "..", filename),
        os.path.join(os.path.dirname(__file__), "..", "..", filename)
    ]
    for p in paths:
        if os.path.exists(p):
            return p
    raise FileNotFoundError(f"Could not find CSV file: {filename}")

def load_data(db: Session):
    print("Initializing database...")
    init_db()
    
    # Clean up existing records to ensure fresh load
    print("Clearing old tables...")
    db.query(WeatherData).delete()
    db.query(WaterData).delete()
    db.query(District).delete()
    db.commit()
    
    # 1. Load Districts from centroids CSV
    centroids_path = find_csv("district_centroids.csv")
    print(f"Loading districts from {centroids_path}...")
    districts_map = {}
    with open(centroids_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            d = District(
                id=int(row['district_id']),
                name=row['district_name'],
                latitude=float(row['latitude']),
                longitude=float(row['longitude'])
            )
            db.add(d)
            districts_map[d.name] = d
    db.commit()
    print(f"Loaded {len(districts_map)} districts.")
    
    # 2. Load Groundwater Baseline from CSV
    groundwater_path = find_csv("groundwater_baseline.csv")
    print(f"Loading groundwater baseline from {groundwater_path}...")
    loaded_gw = 0
    with open(groundwater_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            dname = row['district_name']
            if dname in districts_map:
                dist = districts_map[dname]
                gw = WaterData(
                    district_id=dist.id,
                    groundwater_level=float(row['groundwater_level']),
                    historical_trend=row['historical_trend'],
                    annual_recharge_bcm=float(row['annual_recharge_bcm']),
                    annual_extraction_bcm=float(row['annual_extraction_bcm']),
                    extraction_percentage=float(row['extraction_percentage'])
                )
                db.add(gw)
                loaded_gw += 1
    db.commit()
    print(f"Loaded {loaded_gw} groundwater records.")
    
    # 3. Load Weather Forecast from CSV
    weather_path = find_csv("district_weather_forecast.csv")
    print(f"Loading weather forecasts from {weather_path}...")
    loaded_weather = 0
    with open(weather_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            dname = row['district_name']
            if dname in districts_map:
                dist = districts_map[dname]
                w = WeatherData(
                    district_id=dist.id,
                    day=int(row['day']),
                    forecast_rainfall_mm=float(row['forecast_rainfall_mm']),
                    forecast_temp_c=float(row['forecast_temp_c']),
                    humidity_pct=float(row['humidity_pct']),
                    evaporation_mm=float(row['evaporation_mm'])
                )
                db.add(w)
                loaded_weather += 1
    db.commit()
    print(f"Loaded {loaded_weather} weather forecast records.")
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        load_data(db)
    finally:
        db.close()
