"""
GeoPulse - Production Spatial Join Processor
Performs spatial point-in-polygon and metric distance joins between cleaned GPS pings
and 500-meter store catchment polygons using GeoPandas, Shapely STRtree, and UTM projection.
"""

import os
import json
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point


def perform_spatial_join(
    cleaned_pings_path: str = "data/processed/gps_mobility_cleaned_100k.parquet",
    catchments_path: str = "data/raw/retail_stores_catchment_500m.geojson",
    output_dir: str = "data/processed"
):
    os.makedirs(output_dir, exist_ok=True)
    print(f"Loading cleaned mobility pings from {cleaned_pings_path}...")
    df_pings = pd.read_parquet(cleaned_pings_path)
    print(f"  -> Loaded {len(df_pings):,} pings.")

    print(f"Loading 500m store catchments from {catchments_path}...")
    gdf_catchments = gpd.read_file(catchments_path)
    print(f"  -> Loaded {len(gdf_catchments)} store catchments.")

    # 1. Convert pings to GeoDataFrame in WGS84
    print("Constructing WGS84 Point geometries...")
    geometry = [Point(xy) for xy in zip(df_pings["longitude"], df_pings["latitude"])]
    gdf_pings = gpd.GeoDataFrame(df_pings, geometry=geometry, crs="EPSG:4326")

    # 2. Transform both to UTM Zone 43N (Metric CRS EPSG:32643) for meter-level accuracy
    print("Reprojecting geometries to metric UTM Zone 43N (EPSG:32643)...")
    gdf_pings_metric = gdf_pings.to_crs(epsg=32643)
    gdf_catchments_metric = gdf_catchments.to_crs(epsg=32643)

    # Store center points in metric CRS for distance calculation
    store_centers = {}
    for _, row in gdf_catchments.iterrows():
        # Store center point
        pt_wgs = Point(row["longitude"], row["latitude"])
        pt_gdf = gpd.GeoSeries([pt_wgs], crs="EPSG:4326").to_crs(epsg=32643)
        store_centers[row["store_id"]] = pt_gdf.iloc[0]

    # 3. Spatial Join using R-Tree Index (sjoin with 'within' predicate)
    print("Executing Point-in-Polygon spatial join against 500m catchments...")
    catchment_sub = gdf_catchments_metric[["store_id", "store_name", "category", "geometry"]].rename(
        columns={"category": "store_category"}
    )
    
    joined = gpd.sjoin(
        gdf_pings_metric,
        catchment_sub,
        how="left",
        predicate="within"
    )

    # 4. Calculate metric distance to matched store
    print("Calculating exact distance to store center...")
    def calc_dist(row):
        sid = row["store_id"]
        if pd.notna(sid) and sid in store_centers:
            center_geom = store_centers[sid]
            return round(row.geometry.distance(center_geom), 2)
        return np.nan

    import numpy as np
    joined["distance_to_store_m"] = joined.apply(calc_dist, axis=1)
    joined["in_500m_catchment"] = joined["store_id"].notna()

    # Drop spatial index and geometry column for lightweight columnar export
    joined_df = pd.DataFrame(joined.drop(columns=["geometry", "index_right"], errors="ignore"))

    # Fill unassigned store attributes
    joined_df["store_id"] = joined_df["store_id"].fillna("NONE")
    joined_df["store_name"] = joined_df["store_name"].fillna("Outside Catchment Area")
    joined_df["store_category"] = joined_df["store_category"].fillna("Transit / Non-Retail")
    joined_df["distance_to_store_m"] = joined_df["distance_to_store_m"].fillna(-1.0)

    # Save to Parquet and compressed CSV
    out_parquet = os.path.join(output_dir, "gps_mobility_spatial_joined_100k.parquet")
    joined_df.to_parquet(out_parquet, index=False, compression="snappy")
    print(f"[OK] Saved spatial join dataset to {out_parquet} ({len(joined_df):,} rows x {len(joined_df.columns)} cols)")

    out_csv = os.path.join(output_dir, "gps_mobility_spatial_joined_100k.csv.gz")
    joined_df.to_csv(out_csv, index=False, compression="gzip")
    print(f"[OK] Saved compressed CSV to {out_csv}")

    # 5. Generate Store Catchment Analytics Summary
    catchment_only = joined_df[joined_df["in_500m_catchment"]]
    summary_stats = {
        "total_pings_evaluated": len(joined_df),
        "total_pings_in_catchments": len(catchment_only),
        "catchment_capture_rate_pct": round((len(catchment_only) / len(joined_df)) * 100, 2),
        "unique_devices_in_catchments": int(catchment_only["device_id"].nunique()),
        "stores_analyzed": len(gdf_catchments),
        "store_breakdown": {}
    }

    store_grp = catchment_only.groupby(["store_id", "store_name", "store_category"])
    for (sid, sname, scat), grp in store_grp:
        summary_stats["store_breakdown"][sid] = {
            "store_name": sname,
            "category": scat,
            "total_visits": len(grp),
            "unique_visitors": int(grp["device_id"].nunique()),
            "avg_distance_m": round(grp["distance_to_store_m"].mean(), 2),
            "median_distance_m": round(grp["distance_to_store_m"].median(), 2),
            "in_store_activity_pct": round((grp["activity_type"] == "IN_STORE").mean() * 100, 2),
            "pedestrian_activity_pct": round((grp["activity_type"] == "PEDESTRIAN").mean() * 100, 2)
        }

    kpi_path = os.path.join(output_dir, "store_catchment_kpi_summary.json")
    with open(kpi_path, "w", encoding="utf-8") as f:
        json.dump(summary_stats, f, indent=2)
    print(f"[OK] Saved store catchment KPI summary to {kpi_path}")

    print("\n--- Store Catchment Performance Preview ---")
    print(f"Total In-Catchment Pings: {len(catchment_only):,} / {len(joined_df):,} ({summary_stats['catchment_capture_rate_pct']}%)")
    print(f"Unique Devices Captured:  {summary_stats['unique_devices_in_catchments']:,}")
    for sid, sinfo in list(summary_stats["store_breakdown"].items())[:5]:
        print(f"  [{sid}] {sinfo['store_name']}: {sinfo['total_visits']:,} visits ({sinfo['unique_visitors']} unique devices), Avg Dist: {sinfo['avg_distance_m']}m")

    return joined_df, summary_stats


if __name__ == "__main__":
    perform_spatial_join()
