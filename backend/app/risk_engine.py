import hashlib

def get_district_population(name: str) -> int:
    """Returns a deterministic mock population based on district name hash."""
    h = int(hashlib.md5(name.encode('utf-8')).hexdigest(), 16)
    # Range: 800k to 3.8M
    return 800000 + (h % 3000000)

def calculate_district_wsi(
    gw_level: float,
    extraction_pct: float,
    avg_monthly_rain: float,
    avg_monthly_temp: float,
    forecast_rain: float,
    forecast_temp: float,
    humidity: float,
    evaporation: float,
    rainfall_factor: float = 1.0,
    temp_shift: float = 0.0
):
    """
    Computes Water Stress Index (WSI) between 0 and 100 based on groundwater,
    weather history, 7-day weather forecast, and simulator shifts.
    """
    # 1. Groundwater Stress Component (35% weight)
    gw_score = min(100.0, max(0.0, extraction_pct))
    gw_depth_score = min(100.0, gw_level * 2.5) # e.g. 40m = 100 stress
    gw_stress = 0.7 * gw_score + 0.3 * gw_depth_score
    
    # 2. Rainfall Stress Component (35% weight)
    expected_daily_rain = forecast_rain * rainfall_factor
    normal_daily_rain = avg_monthly_rain / 30.0
    if normal_daily_rain > 0:
        deficit = max(0.0, normal_daily_rain - expected_daily_rain)
        deficit_pct = deficit / normal_daily_rain
        rain_stress = min(100.0, deficit_pct * 100.0)
    else:
        rain_stress = 50.0 # fallback
        
    # 3. Temperature Stress Component (20% weight)
    effective_temp = forecast_temp + temp_shift
    temp_diff = effective_temp - avg_monthly_temp
    if temp_diff > 0:
        temp_stress = min(100.0, temp_diff * 15.0) # 6.6C above normal = 100 stress
    else:
        temp_stress = 0.0
        
    # 4. Evaporation & Humidity Stress Component (10% weight)
    evap_score = min(100.0, evaporation * 12.0) # 8.3mm = 100 stress
    hum_score = 100.0 - humidity
    evap_humidity_stress = 0.6 * evap_score + 0.4 * hum_score
    
    # Combined score
    wsi = (0.35 * gw_stress) + (0.35 * rain_stress) + (0.20 * temp_stress) + (0.10 * evap_humidity_stress)
    return round(min(100.0, max(0.0, wsi)), 1), {
        "groundwater_stress": round(gw_stress, 1),
        "rainfall_stress": round(rain_stress, 1),
        "temperature_stress": round(temp_stress, 1),
        "evap_humidity_stress": round(evap_humidity_stress, 1)
    }

def generate_wsi_explanations(name: str, scores: dict, gw_level: float) -> list:
    """Generates 2-3 localized bullet points explaining the stress factor scores."""
    reasons = []
    
    if scores["groundwater_stress"] > 80:
        reasons.append("Critical groundwater over-exploitation (extraction exceeding annual replenishment).")
    elif scores["groundwater_stress"] > 60:
        reasons.append("Moderately high extraction from aquifer reserves relative to recharge rates.")
        
    if gw_level > 25.0:
        reasons.append(f"Low groundwater table depth ({gw_level}m below ground) limits immediate well water access.")
        
    if scores["rainfall_stress"] > 75:
        reasons.append("Severe rain deficit relative to historical regional seasonal expectations.")
    elif scores["rainfall_stress"] > 45:
        reasons.append("Below-average precipitation reduces surface recharge and runoff collections.")
        
    if scores["temperature_stress"] > 40:
        reasons.append("Significantly elevated local temperatures spikes transpiration and domestic usage.")
        
    if scores["evap_humidity_stress"] > 65:
        reasons.append("Arid air conditions and solar evaporation drying up localized shallow ponds and storage.")
        
    # fallback if none triggered
    if not reasons:
        reasons.append("Water stress is within seasonal tolerances with stable baseline indices.")
        reasons.append("Regional supply lines and reservoir storage are currently adequate.")
        
    return reasons[:3]

def calculate_water_budget(name: str, wsi: float):
    """Calculates weekly water demand, available water supply, gap and optimizations."""
    pop = get_district_population(name)
    
    # Base daily demand in India is 135 Liters Per Capita per Day (LPCD)
    standard_lpcd = 135.0
    weekly_demand_liters = pop * standard_lpcd * 7
    
    # Supply capacity adjusts down as WSI increases
    # E.g. at WSI=0, supply matches demand. At WSI=100, supply is reduced by 50%
    supply_efficiency = max(0.4, 1.0 - (wsi / 160.0))
    weekly_available_liters = weekly_demand_liters * supply_efficiency
    
    gap_liters = weekly_demand_liters - weekly_available_liters
    
    # Recommend LPCD conservation target
    if wsi > 85:
        recommended_lpcd = 60.0 # Crisis level
    elif wsi > 70:
        recommended_lpcd = 85.0 # Strict warning
    elif wsi > 50:
        recommended_lpcd = 110.0 # Mild warning
    else:
        recommended_lpcd = 135.0 # Normal
        
    # Optimization recommendations
    tankers_needed = 0
    actions = []
    if gap_liters > 0:
        # Standard water tanker carries 10,000 Liters
        tankers_needed = int(gap_liters / 10000.0)
        actions.append(f"Deploy {tankers_needed:,} emergency water tankers weekly ({round(gap_liters/1e6, 2)}M Liters).")
        actions.append("Enforce temporary ban on non-essential commercial water usage (car washing, construction).")
        actions.append("Redirect tertiary-treated recycled water for agricultural/industrial cleaning grids.")
    else:
        actions.append("Promote household rainwater harvesting installations.")
        actions.append("Maintain routine seasonal storage monitoring across local check dams.")
        
    return {
        "population": pop,
        "weekly_demand_liters": round(weekly_demand_liters, 1),
        "weekly_available_liters": round(weekly_available_liters, 1),
        "gap_liters": round(gap_liters, 1),
        "recommended_lpcd": recommended_lpcd,
        "weekly_tankers": tankers_needed,
        "action_plan": actions
    }
