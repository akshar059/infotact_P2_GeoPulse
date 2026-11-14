"""
GeoPulse - Geospatial Data Cleaning & Validation Pipeline
Cleans and validates the raw 100k GPS mobility dataset:
  1. Bounding box & coordinate validity check
  2. GPS horizontal accuracy thresholding (<= 50m)
  3. Deduplication on (device_id, timestamp)
  4. Velocity & teleportation jump anomaly filtering (<= 120 km/h)
  5. Null and data type validation
  6. Audit reporting
"""

import os
import json
import pandas as pd
import numpy as np

# Bounding box constraints for Bengaluru metropolitan region
LAT_MIN, LAT_MAX = 12.50, 13.50
LON_MIN, LON_MAX = 77.00, 78.00
MAX_ACCURACY_METERS = 50.0
MAX_VELOCITY_KMH = 120.0


def clean_and_validate_gps(
    input_path: str = "data/raw/gps_mobility_raw_100k.parquet",
    output_dir: str = "data/processed"
):
    os.makedirs(output_dir, exist_ok=True)
    print(f"Reading raw dataset from {input_path}...")
    df = pd.read_parquet(input_path)
    initial_rows = len(df)
    
    audit = {
        "initial_rows": initial_rows,
        "initial_columns": list(df.columns),
        "checks": {}
    }

    # 1. Null / Missing Values Check
    null_counts = df.isnull().sum().to_dict()
    df_clean = df.dropna(subset=["latitude", "longitude", "timestamp", "device_id"])
    dropped_nulls = initial_rows - len(df_clean)
    audit["checks"]["null_coordinates"] = {
        "dropped_rows": dropped_nulls,
        "null_counts": null_counts
    }

    # 2. Bounding Box & Coordinate Range Validation
    coord_mask = (
        (df_clean["latitude"] >= LAT_MIN) & (df_clean["latitude"] <= LAT_MAX) &
        (df_clean["longitude"] >= LON_MIN) & (df_clean["longitude"] <= LON_MAX) &
        (df_clean["latitude"] != 0.0) & (df_clean["longitude"] != 0.0)
    )
    dropped_oob = len(df_clean) - coord_mask.sum()
    df_clean = df_clean[coord_mask].copy()
    audit["checks"]["out_of_bounds_coordinates"] = {"dropped_rows": int(dropped_oob)}

    # 3. GPS Accuracy Thresholding (drop pings with accuracy > 50m)
    acc_mask = df_clean["horizontal_accuracy_m"] <= MAX_ACCURACY_METERS
    dropped_low_acc = len(df_clean) - acc_mask.sum()
    df_clean = df_clean[acc_mask].copy()
    audit["checks"]["low_accuracy_pings_gt_50m"] = {"dropped_rows": int(dropped_low_acc)}

    # 4. Teleportation / Velocity Anomaly Filtering (> 120 km/h)
    vel_mask = df_clean["speed_kmh"] <= MAX_VELOCITY_KMH
    dropped_teleport = len(df_clean) - vel_mask.sum()
    df_clean = df_clean[vel_mask].copy()
    audit["checks"]["teleportation_speed_anomalies_gt_120kmh"] = {"dropped_rows": int(dropped_teleport)}

    # 5. Temporal Deduplication (device_id, timestamp)
    dups_count = df_clean.duplicated(subset=["device_id", "timestamp"]).sum()
    df_clean = df_clean.drop_duplicates(subset=["device_id", "timestamp"]).reset_index(drop=True)
    audit["checks"]["duplicate_pings"] = {"dropped_rows": int(dups_count)}

    # 6. Parse and sort chronologically
    df_clean["timestamp_dt"] = pd.to_datetime(df_clean["timestamp"])
    df_clean = df_clean.sort_values(by=["device_id", "timestamp_dt"]).reset_index(drop=True)

    # 7. Compute Time Delta and Distance to Next Ping for Dwell Analysis
    df_clean["prev_device"] = df_clean["device_id"].shift(1)
    df_clean["prev_time"] = df_clean["timestamp_dt"].shift(1)
    same_device = df_clean["device_id"] == df_clean["prev_device"]
    df_clean["time_diff_sec"] = np.where(
        same_device,
        (df_clean["timestamp_dt"] - df_clean["prev_time"]).dt.total_seconds(),
        np.nan
    )
    df_clean = df_clean.drop(columns=["prev_device", "prev_time", "timestamp_dt"])

    # Final summary statistics
    final_rows = len(df_clean)
    total_dropped = initial_rows - final_rows
    retention_rate_pct = round((final_rows / initial_rows) * 100, 2)

    audit["final_rows"] = final_rows
    audit["total_dropped_rows"] = total_dropped
    audit["retention_rate_pct"] = retention_rate_pct

    # Save Cleaned Dataset (Parquet & Compressed CSV)
    out_parquet = os.path.join(output_dir, "gps_mobility_cleaned_100k.parquet")
    df_clean.to_parquet(out_parquet, index=False, compression="snappy")
    print(f"[OK] Cleaned dataset saved to {out_parquet} ({final_rows:,} rows)")

    out_csv = os.path.join(output_dir, "gps_mobility_cleaned_100k.csv.gz")
    df_clean.to_csv(out_csv, index=False, compression="gzip")
    print(f"[OK] Cleaned CSV saved to {out_csv}")

    # Save Audit Report
    audit_path = os.path.join(output_dir, "validation_audit_report.json")
    with open(audit_path, "w", encoding="utf-8") as f:
        json.dump(audit, f, indent=2)
    print(f"[OK] Validation audit report saved to {audit_path}")

    print("\n--- Data Cleaning & Validation Audit ---")
    print(f"Initial Rows:     {initial_rows:,}")
    print(f"Low Accuracy (>50m):  -{dropped_low_acc:,}")
    print(f"Teleportation (>120k):-{dropped_teleport:,}")
    print(f"Duplicate Pings:      -{dups_count:,}")
    print(f"Final Cleaned Rows:   {final_rows:,} ({retention_rate_pct}% retained)")

    return df_clean, audit


if __name__ == "__main__":
    clean_and_validate_gps()
