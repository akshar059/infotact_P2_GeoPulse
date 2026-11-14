"""
GeoPulse - Synthetic GPS Mobility Data Generator
Generates 100,000 (1 Lakh) realistic GPS mobility records across Bengaluru retail corridors.
Columns:
  1. ping_id
  2. device_id
  3. latitude
  4. longitude
  5. timestamp
  6. horizontal_accuracy_m
  7. altitude_m
  8. speed_kmh
  9. heading_deg
  10. battery_pct
  11. activity_type
  12. h3_res9
  13. geohash
"""

import os
import random
import datetime
import numpy as np
import pandas as pd
import h3

# Ensure reproducible generation
np.random.seed(42)
random.seed(42)

# Simple pure-Python geohash encoder for 7-char geohashes
_BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz"

def encode_geohash(latitude: float, longitude: float, precision: int = 7) -> str:
    lat_interval = [-90.0, 90.0]
    lon_interval = [-180.0, 180.0]
    geohash = []
    bits = [16, 8, 4, 2, 1]
    bit = 0
    ch = 0
    even = True
    while len(geohash) < precision:
        if even:
            mid = (lon_interval[0] + lon_interval[1]) / 2
            if longitude > mid:
                ch |= bits[bit]
                lon_interval[0] = mid
            else:
                lon_interval[1] = mid
        else:
            mid = (lat_interval[0] + lat_interval[1]) / 2
            if latitude > mid:
                ch |= bits[bit]
                lat_interval[0] = mid
            else:
                lat_interval[1] = mid
        even = not even
        if bit < 4:
            bit += 1
        else:
            geohash.append(_BASE32[ch])
            bit = 0
            ch = 0
    return "".join(geohash)


# Retail cluster center anchors (latitude, longitude, weight)
RETAIL_CENTERS = [
    (12.9348, 77.6111, 0.15),  # Nexus Koramangala
    (12.8452, 77.6602, 0.14),  # Decathlon Electronic City
    (12.9121, 77.6446, 0.10),  # Nature's Basket HSR Layout
    (12.9260, 77.6762, 0.10),  # Reliance Digital Bellandur
    (12.9733, 77.6080, 0.08),  # Commercial St / Central
    (12.8399, 77.6770, 0.10),  # Croma Electronic City
    (12.9110, 77.6850, 0.08),  # Star Hypermarket Sarjapur
    (12.9380, 77.6255, 0.08),  # Westside Koramangala
    (12.9166, 77.6101, 0.06),  # Blue Tokai BTM
    (12.8890, 77.5510, 0.05),  # Forum South Bengaluru
    (12.9215, 77.6705, 0.04),  # Total Hub Sarjapur
    (12.9958, 77.6963, 0.02),  # Phoenix Marketcity
]


def generate_synthetic_mobility(num_rows: int = 100000, output_dir: str = "data/raw"):
    os.makedirs(output_dir, exist_ok=True)
    print(f"Generating {num_rows:,} synthetic GPS mobility records...")

    # Devices pool: 1,200 unique devices
    num_devices = 1200
    devices = [f"DEV_{i:05d}" for i in range(1, num_devices + 1)]

    # Simulation start time: 2026-11-10 08:00:00 UTC through 2026-11-14 22:00:00 UTC (5 days)
    base_time = datetime.datetime(2026, 11, 10, 8, 0, 0, tzinfo=datetime.timezone.utc)
    total_duration_sec = 5 * 24 * 3600  # 5 days in seconds

    rows = []
    
    # 40% catchment cluster visits, 60% general urban mobility
    cluster_weights = [c[2] for c in RETAIL_CENTERS]
    cluster_indices = list(range(len(RETAIL_CENTERS)))

    # Pre-sample random components for high speed
    center_choice = np.random.choice(cluster_indices, size=num_rows, p=cluster_weights)
    is_cluster = np.random.rand(num_rows) < 0.45  # 45% concentrated within retail zones
    device_assigned = np.random.choice(devices, size=num_rows)
    time_offsets = np.random.uniform(0, total_duration_sec, size=num_rows)
    
    # Diurnal probability weighting: peak hours 11:00-14:00 and 17:00-21:00
    # Modulate time offsets to create realistic daytime traffic concentration
    hour_weights = np.array([
        0.01, 0.01, 0.01, 0.01, 0.02, 0.03,  # 00-05
        0.05, 0.07, 0.09, 0.10, 0.11, 0.12,  # 06-11 (Morning rush)
        0.13, 0.11, 0.09, 0.08, 0.10, 0.13,  # 12-17 (Lunch & Afternoon)
        0.15, 0.14, 0.10, 0.07, 0.04, 0.02   # 18-23 (Evening shopping surge)
    ])
    hour_weights = hour_weights / hour_weights.sum()

    for i in range(num_rows):
        ping_id = f"PNG_{i+1:06d}"
        device_id = device_assigned[i]
        
        # Pick timestamp with realistic day + hour distribution
        day_offset = int(time_offsets[i] // (24 * 3600))
        sampled_hour = int(np.random.choice(24, p=hour_weights))
        minute = random.randint(0, 59)
        second = random.randint(0, 59)
        ping_time = base_time + datetime.timedelta(days=day_offset, hours=sampled_hour, minutes=minute, seconds=second)
        
        # Spatial generation
        if is_cluster[i]:
            # Clustered around a retail POI (within ~50m to ~600m)
            c_lat, c_lon, _ = RETAIL_CENTERS[center_choice[i]]
            # 1 degree lat ~ 111 km, 1 degree lon ~ 108 km in Bengaluru
            lat_delta = np.random.normal(0, 0.003)   # ~300m std dev
            lon_delta = np.random.normal(0, 0.003)
            lat = round(c_lat + lat_delta, 6)
            lon = round(c_lon + lon_delta, 6)
            activity = random.choices(["IN_STORE", "STATIONARY", "PEDESTRIAN"], weights=[0.45, 0.35, 0.20])[0]
            if activity in ["IN_STORE", "STATIONARY"]:
                speed_kmh = round(abs(np.random.normal(0.2, 0.3)), 2)
            else:
                speed_kmh = round(abs(np.random.normal(3.8, 1.2)), 2)
        else:
            # General urban mobility throughout Bengaluru corridors
            lat = round(np.random.uniform(12.8200, 13.0100), 6)
            lon = round(np.random.uniform(77.5300, 77.7200), 6)
            activity = random.choices(["PEDESTRIAN", "VEHICULAR", "STATIONARY"], weights=[0.35, 0.50, 0.15])[0]
            if activity == "VEHICULAR":
                speed_kmh = round(np.random.uniform(15.0, 58.0), 2)
            elif activity == "PEDESTRIAN":
                speed_kmh = round(abs(np.random.normal(4.2, 1.5)), 2)
            else:
                speed_kmh = 0.0

        # Inject 1.5% low-accuracy anomalies and 0.2% jump anomalies for data validation testing
        anomaly_draw = random.random()
        if anomaly_draw < 0.015:
            # Low accuracy GPS drift (> 50m)
            accuracy_m = round(np.random.uniform(55.0, 180.0), 1)
        else:
            # High quality commercial GPS ping (3m - 30m)
            accuracy_m = round(np.random.exponential(8.0) + 3.0, 1)
            accuracy_m = min(accuracy_m, 45.0)

        # Teleportation anomaly test case
        if 0.015 <= anomaly_draw < 0.018:
            speed_kmh = round(np.random.uniform(130.0, 320.0), 1)

        # Altitude in Bengaluru (mean ~900m above sea level)
        altitude_m = round(np.random.normal(905.0, 15.0), 1)
        heading_deg = random.randint(0, 359)
        battery_pct = random.randint(12, 100)

        # Compute Uber H3 Index (Resolution 9 ~ 174m hexagonal diameter)
        try:
            h3_res9 = h3.latlng_to_cell(lat, lon, 9)
        except AttributeError:
            h3_res9 = h3.geo_to_h3(lat, lon, 9)
            
        # Geohash at precision 7 (~150m cell)
        gh7 = encode_geohash(lat, lon, precision=7)

        rows.append({
            "ping_id": ping_id,
            "device_id": device_id,
            "latitude": lat,
            "longitude": lon,
            "timestamp": ping_time.strftime("%Y-%m-%d %H:%M:%S"),
            "horizontal_accuracy_m": accuracy_m,
            "altitude_m": altitude_m,
            "speed_kmh": speed_kmh,
            "heading_deg": heading_deg,
            "battery_pct": battery_pct,
            "activity_type": activity,
            "h3_res9": h3_res9,
            "geohash": gh7
        })

    # Convert to DataFrame
    df = pd.DataFrame(rows)
    
    # Inject 0.1% identical duplicate rows for deduplication pipeline testing
    num_dups = int(num_rows * 0.001)
    dup_indices = np.random.choice(len(df), size=num_dups, replace=False)
    df_dups = df.iloc[dup_indices].copy()
    df = pd.concat([df, df_dups], ignore_index=True)
    # Sort chronologically
    df["dt"] = pd.to_datetime(df["timestamp"])
    df = df.sort_values(by=["dt", "device_id"]).reset_index(drop=True)
    df = df.drop(columns=["dt"])
    
    # Trim exactly to num_rows
    df = df.iloc[:num_rows].copy()

    # Save CSV gzipped (standard for cloud staging & Snowflake COPY INTO)
    csv_gz_path = os.path.join(output_dir, "gps_mobility_raw_100k.csv.gz")
    df.to_csv(csv_gz_path, index=False, compression="gzip")
    print(f"[OK] Saved {len(df):,} rows x {len(df.columns)} columns to {csv_gz_path}")

    # Also save Parquet (columnar storage)
    parquet_path = os.path.join(output_dir, "gps_mobility_raw_100k.parquet")
    df.to_parquet(parquet_path, index=False, compression="snappy")
    print(f"[OK] Saved Parquet file to {parquet_path}")

    # Display summary statistics
    print("\n--- Synthetic Dataset Summary ---")
    print(f"Total Rows:     {len(df):,}")
    print(f"Total Columns:  {len(df.columns)} ({list(df.columns)})")
    print(f"Unique Devices: {df['device_id'].nunique():,}")
    print(f"Time Range:     {df['timestamp'].min()} to {df['timestamp'].max()}")
    print(f"Latitude Range: {df['latitude'].min()} to {df['latitude'].max()}")
    print(f"Longitude Range:{df['longitude'].min()} to {df['longitude'].max()}")
    print(f"Activity Dist:\n{df['activity_type'].value_counts().to_dict()}")

    return df


if __name__ == "__main__":
    generate_synthetic_mobility(num_rows=100000)
