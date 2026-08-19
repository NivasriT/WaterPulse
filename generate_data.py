import os
import json
import csv
import random

def compute_centroid(geometry):
    coords = []
    def extract_coords(lst):
        if not lst:
            return
        if isinstance(lst[0], (int, float)):
            coords.append(lst)
        else:
            for item in lst:
                extract_coords(item)
                
    extract_coords(geometry.get('coordinates', []))
    if not coords:
        return 0.0, 0.0
    
    lons = [c[0] for c in coords]
    lats = [c[1] for c in coords]
    return sum(lats) / len(lats), sum(lons) / len(lons)

def main():
    geojson_path = 'tamilnadu.geojson'
    if not os.path.exists(geojson_path):
        print(f"Error: {geojson_path} not found.")
        return
        
    with open(geojson_path, 'r', encoding='utf-8') as f:
        geojson_data = json.load(f)
        
    features = geojson_data.get('features', [])
    districts = []
    
    # 1. Compute Centroids from GeoJSON
    for idx, feat in enumerate(features, start=1):
        props = feat.get('properties', {})
        name = props.get('dtname') or props.get('dist') or f"District {idx}"
        lat, lon = compute_centroid(feat.get('geometry', {}))
        districts.append({
            'district_id': idx,
            'district_name': name,
            'latitude': round(lat, 5),
            'longitude': round(lon, 5)
        })
    
    # Sort alphabetically to keep it clean
    districts.sort(key=lambda x: x['district_name'])
    for idx, dist in enumerate(districts, start=1):
        dist['district_id'] = idx
        
    print(f"Computed centroids for {len(districts)} districts.")
    
    # Write district_centroids.csv
    with open('district_centroids.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['district_id', 'district_name', 'latitude', 'longitude'])
        writer.writeheader()
        writer.writerows(districts)
    print("Saved district_centroids.csv")
    
    # Seed random for deterministic outputs
    random.seed(42)
    
    # 2. Generate groundwater_baseline.csv
    # Range of metrics: levels: 5m to 35m, extraction: 45% to 115%
    groundwater = []
    for dist in districts:
        extraction_pct = random.uniform(50, 115)
        if extraction_pct > 90:
            trend = 'Declining'
        elif extraction_pct > 70:
            trend = 'Stable'
        else:
            trend = 'Recharging'
            
        recharge = round(random.uniform(0.3, 2.5), 2)
        extraction = round(recharge * (extraction_pct / 100.0), 2)
        level = round(random.uniform(8.0, 38.0), 2)
        
        groundwater.append({
            'district_id': dist['district_id'],
            'district_name': dist['district_name'],
            'groundwater_level': level,
            'historical_trend': trend,
            'annual_recharge_bcm': recharge,
            'annual_extraction_bcm': extraction,
            'extraction_percentage': round(extraction_pct, 2)
        })
        
    with open('groundwater_baseline.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=[
            'district_id', 'district_name', 'groundwater_level', 
            'historical_trend', 'annual_recharge_bcm', 
            'annual_extraction_bcm', 'extraction_percentage'
        ])
        writer.writeheader()
        writer.writerows(groundwater)
    print("Saved groundwater_baseline.csv")
    
    # 3. Generate district_weather_historical.csv
    # Baseline normal monthly weather (rain: 40-250mm, temp: 26-33C)
    historical_weather = []
    for dist in districts:
        historical_weather.append({
            'district_id': dist['district_id'],
            'district_name': dist['district_name'],
            'avg_monthly_rainfall_mm': round(random.uniform(50.0, 220.0), 1),
            'avg_monthly_temp_c': round(random.uniform(26.5, 32.5), 1)
        })
        
    with open('district_weather_historical.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=[
            'district_id', 'district_name', 'avg_monthly_rainfall_mm', 'avg_monthly_temp_c'
        ])
        writer.writeheader()
        writer.writerows(historical_weather)
    print("Saved district_weather_historical.csv")
    
    # 4. Generate district_weather_forecast.csv (7 days)
    # Day-by-day forecast variations
    forecast_weather = []
    for dist in districts:
        # Base settings for this district
        base_temp = random.uniform(28.0, 35.0)
        base_humidity = random.uniform(60, 85)
        
        # Simulating rain event days for some districts
        has_rainy_week = random.choice([True, False, False]) # 1 in 3 chance of some rain
        
        for day in range(1, 8):
            temp_var = random.uniform(-1.5, 1.5)
            hum_var = random.uniform(-5, 5)
            
            if has_rainy_week:
                # Rainy days on days 3, 4 or 5
                if day in [3, 4]:
                    rain = round(random.uniform(15.0, 50.0), 1)
                    temp_var -= 3.0 # temperature drops on rain
                    humidity = min(98.0, base_humidity + 15 + hum_var)
                else:
                    rain = round(random.uniform(0.0, 5.0), 1)
                    humidity = min(95.0, base_humidity + hum_var)
            else:
                rain = 0.0 if random.random() > 0.15 else round(random.uniform(0.1, 3.0), 1)
                humidity = min(95.0, base_humidity + hum_var)
                
            temp = round(base_temp + temp_var, 1)
            evaporation = round(random.uniform(3.0, 7.0) + (temp - base_temp)*0.3 - (humidity - base_humidity)*0.05, 1)
            evaporation = max(1.0, evaporation) # ensure positive
            
            forecast_weather.append({
                'district_id': dist['district_id'],
                'district_name': dist['district_name'],
                'day': day,
                'forecast_rainfall_mm': rain,
                'forecast_temp_c': temp,
                'humidity_pct': round(humidity, 1),
                'evaporation_mm': round(evaporation, 1)
            })
            
    with open('district_weather_forecast.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=[
            'district_id', 'district_name', 'day', 'forecast_rainfall_mm',
            'forecast_temp_c', 'humidity_pct', 'evaporation_mm'
        ])
        writer.writeheader()
        writer.writerows(forecast_weather)
    print("Saved district_weather_forecast.csv")

if __name__ == '__main__':
    main()
