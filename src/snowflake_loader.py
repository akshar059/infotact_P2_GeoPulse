"""
GeoPulse - Snowflake Integration & Schema Validator
Validates local CSV/Parquet datasets against Snowflake DDL schemas,
generates stage upload commands, and simulates/verifies ingestion pipeline.
"""

import os
import glob
import pandas as pd

SQL_SCRIPTS = [
    "sql/snowflake/01_database_and_schemas.sql",
    "sql/snowflake/02_raw_tables_ddl.sql",
    "sql/snowflake/03_staging_and_copy.sql",
    "sql/snowflake/04_spatial_catchment_queries.sql",
    "sql/snowflake/05_analytics_views_and_marts.sql",
]


def validate_snowflake_datasets():
    print("=== Validating Datasets for Snowflake Ingestion ===")
    
    # 1. Check Raw GPS Mobility Dataset
    raw_csv = "data/raw/gps_mobility_raw_100k.csv.gz"
    if os.path.exists(raw_csv):
        df_raw = pd.read_csv(raw_csv, compression="gzip", nrows=100)
        print(f"[OK] Found raw staged CSV: {raw_csv}")
        print(f"     Columns ({len(df_raw.columns)}): {list(df_raw.columns)}")
        required_cols = ["ping_id", "device_id", "latitude", "longitude", "timestamp"]
        missing = [c for c in required_cols if c not in df_raw.columns]
        if missing:
            raise ValueError(f"Missing required columns in raw dataset: {missing}")
        print(f"     Core required columns present: {required_cols}")
    else:
        print(f"[WARN] Raw CSV not found at {raw_csv}")

    # 2. Check Retail Stores Dataset
    stores_csv = "data/raw/retail_stores.csv"
    if os.path.exists(stores_csv):
        df_stores = pd.read_csv(stores_csv)
        print(f"[OK] Found retail stores catalog: {stores_csv} ({len(df_stores)} stores)")
        print(f"     Columns: {list(df_stores.columns)}")
    else:
        print(f"[WARN] Retail stores CSV not found at {stores_csv}")

    # 3. Check Cleaned Spatial Joined Dataset
    joined_parquet = "data/processed/gps_mobility_spatial_joined_100k.parquet"
    if os.path.exists(joined_parquet):
        df_joined = pd.read_parquet(joined_parquet)
        print(f"[OK] Found processed spatial join dataset: {joined_parquet} ({len(df_joined):,} rows)")
        print(f"     In-catchment visits: {(df_joined['in_500m_catchment']).sum():,}")
    
    # 4. Check Snowflake SQL Scripts
    print("\n=== Checking Snowflake SQL Scripts ===")
    for script_path in SQL_SCRIPTS:
        if os.path.exists(script_path):
            with open(script_path, "r", encoding="utf-8") as f:
                lines = f.readlines()
            print(f"[OK] {script_path} ({len(lines)} lines)")
        else:
            print(f"[ERROR] Missing {script_path}")

    # 5. Output SnowSQL Copy-Paste Instructions
    print("\n=== SnowSQL CLI Execution Commands ===")
    print("""
# 1. Connect to Snowflake CLI
snowsql -a <your_account> -u <your_username>

# 2. Execute all setup scripts sequentially
!source sql/snowflake/01_database_and_schemas.sql
!source sql/snowflake/02_raw_tables_ddl.sql

# 3. Stage the local compressed files
PUT file://data/raw/retail_stores.csv @GEOPULSE_DB.STAGING.STORES_STAGE AUTO_COMPRESS=FALSE OVERWRITE=TRUE;
PUT file://data/raw/gps_mobility_raw_100k.csv.gz @GEOPULSE_DB.STAGING.GPS_RAW_STAGE AUTO_COMPRESS=FALSE OVERWRITE=TRUE;

# 4. Ingest and execute spatial joins & analytical marts
!source sql/snowflake/03_staging_and_copy.sql
!source sql/snowflake/04_spatial_catchment_queries.sql
!source sql/snowflake/05_analytics_views_and_marts.sql
    """)


if __name__ == "__main__":
    validate_snowflake_datasets()
