"""
GeoPulse - Store Catchment Area Generator
Creates 500-meter geodesic catchment buffer zones around retail stores.
EPSG:4326 (WGS84) -> EPSG:32643 (UTM Zone 43N metric) -> 500m buffer -> EPSG:4326
"""

import os
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point

# Benchmark retail stores in Bengaluru commercial clusters
BENCHMARK_STORES = [
    {"store_id": "STORE_001", "store_name": "Nexus Koramangala Mall", "category": "Mall & Entertainment", "latitude": 12.9348, "longitude": 77.6111, "gross_area_sqft": 450000},
    {"store_id": "STORE_002", "store_name": "Decathlon Electronic City", "category": "Sports & Fitness", "latitude": 12.8452, "longitude": 77.6602, "gross_area_sqft": 32000},
    {"store_id": "STORE_003", "store_name": "Nature's Basket HSR Layout", "category": "Gourmet Grocery", "latitude": 12.9121, "longitude": 77.6446, "gross_area_sqft": 8500},
    {"store_id": "STORE_004", "store_name": "Reliance Digital Bellandur", "category": "Consumer Electronics", "latitude": 12.9260, "longitude": 77.6762, "gross_area_sqft": 14000},
    {"store_id": "STORE_005", "store_name": "Zara Central Commercial St", "category": "Fashion & Apparel", "latitude": 12.9733, "longitude": 77.6080, "gross_area_sqft": 28000},
    {"store_id": "STORE_006", "store_name": "Croma Electronic City Phase 1", "category": "Consumer Electronics", "latitude": 12.8399, "longitude": 77.6770, "gross_area_sqft": 12500},
    {"store_id": "STORE_007", "store_name": "Star Hypermarket Sarjapur", "category": "Hypermarket", "latitude": 12.9110, "longitude": 77.6850, "gross_area_sqft": 52000},
    {"store_id": "STORE_008", "store_name": "Westside Koramangala 80ft Rd", "category": "Fashion & Apparel", "latitude": 12.9380, "longitude": 77.6255, "gross_area_sqft": 22000},
    {"store_id": "STORE_009", "store_name": "Blue Tokai Roastery BTM", "category": "Cafe & QSR", "latitude": 12.9166, "longitude": 77.6101, "gross_area_sqft": 4200},
    {"store_id": "STORE_010", "store_name": "Forum South Bengaluru Mall", "category": "Mall & Entertainment", "latitude": 12.8890, "longitude": 77.5510, "gross_area_sqft": 650000},
    {"store_id": "STORE_011", "store_name": "Total Retail Hub Sarjapur", "category": "Superstore", "latitude": 12.9215, "longitude": 77.6705, "gross_area_sqft": 38000},
    {"store_id": "STORE_012", "store_name": "Phoenix Marketcity Whitefield", "category": "Mall & Entertainment", "latitude": 12.9958, "longitude": 77.6963, "gross_area_sqft": 980000},
]


def generate_store_catchments(output_dir: str = "data/raw"):
    os.makedirs(output_dir, exist_ok=True)
    
    df_stores = pd.DataFrame(BENCHMARK_STORES)
    
    # Save stores CSV
    stores_csv_path = os.path.join(output_dir, "retail_stores.csv")
    df_stores.to_csv(stores_csv_path, index=False)
    print(f"[OK] Saved {len(df_stores)} retail stores to {stores_csv_path}")
    
    # Create GeoDataFrame with WGS84 point coordinates
    geometry = [Point(xy) for xy in zip(df_stores["longitude"], df_stores["latitude"])]
    gdf_stores = gpd.GeoDataFrame(df_stores, geometry=geometry, crs="EPSG:4326")
    
    # Project to UTM Zone 43N (Metric CRS EPSG:32643) for precise 500-meter buffer
    gdf_metric = gdf_stores.to_crs(epsg=32643)
    gdf_metric["geometry"] = gdf_metric.geometry.buffer(500.0)
    gdf_metric["catchment_radius_m"] = 500
    gdf_metric["catchment_area_sqm"] = gdf_metric.geometry.area
    
    # Reproject buffer polygons back to WGS84
    gdf_catchments = gdf_metric.to_crs(epsg=4326)
    
    # Save catchments to GeoJSON
    geojson_path = os.path.join(output_dir, "retail_stores_catchment_500m.geojson")
    gdf_catchments.to_file(geojson_path, driver="GeoJSON")
    print(f"[OK] Generated 500m catchment polygons saved to {geojson_path}")
    
    return gdf_stores, gdf_catchments


if __name__ == "__main__":
    generate_store_catchments()
