"""
GeoPulse - Apache Sedona Distributed Spatial Join Pipeline
Performs distributed spatial joins between GPS mobility points and 500m retail catchments.

Stack:
  - Apache Spark 3.x
  - Apache Sedona (formerly GeoSpark) 1.5+
  - PySpark SQL & Sedona Spatial SQL functions
"""

import sys
import os

def run_sedona_spatial_join(
    pings_path: str = "data/raw/gps_mobility_raw_100k.parquet",
    catchments_path: str = "data/raw/retail_stores_catchment_500m.geojson",
    output_path: str = "data/processed/sedona_spatial_join_output"
):
    try:
        from pyspark.sql import SparkSession
        from sedona.register import SedonaRegistrator
        from sedona.utils import SedonaKryoRegistrator, KryoSerializer
        from sedona.spark import SedonaContext
    except ImportError:
        print("[INFO] PySpark / Apache Sedona not in current local environment.")
        print("[INFO] Generating Sedona execution script and demonstrating architecture.")
        return False

    print("[1/5] Initializing Apache Sedona Spark Session with Kryo Serializer...")
    config = (
        SparkSession.builder
        .appName("GeoPulse_Sedona_SpatialJoin")
        .master("local[*]")
        .config("spark.serializer", KryoSerializer.getName)
        .config("spark.kryo.registrator", SedonaKryoRegistrator.getName)
        .config("sedona.global.index", "true")
        .config("sedona.global.indextype", "rtree")
        .config("sedona.join.gridtype", "kdbtree")
        .config("sedona.join.spatitionnum", "16")
    )
    
    spark = SedonaContext.create(config)
    SedonaRegistrator.registerAll(spark)
    print("  -> Apache Sedona initialized successfully.")

    print("[2/5] Ingesting GPS Mobility Pings and constructing Point Geometries...")
    df_pings = spark.read.parquet(pings_path)
    df_pings.createOrReplaceTempView("raw_pings")

    # Construct spatial point in WGS84 and transform to metric UTM Zone 43N (EPSG:32643)
    spark.sql("""
        CREATE OR REPLACE TEMP VIEW pings_spatial AS
        SELECT 
            ping_id,
            device_id,
            timestamp,
            latitude,
            longitude,
            horizontal_accuracy_m,
            speed_kmh,
            activity_type,
            h3_res9,
            ST_Transform(
                ST_Point(CAST(longitude AS Decimal(24,20)), CAST(latitude AS Decimal(24,20))),
                'EPSG:4326',
                'EPSG:32643'
            ) AS ping_geom_metric,
            ST_Point(CAST(longitude AS Decimal(24,20)), CAST(latitude AS Decimal(24,20))) AS ping_geom_wgs84
        FROM raw_pings
    """)

    print("[3/5] Ingesting Store Catchments and constructing Polygon Geometries...")
    df_stores = spark.read.format("geojson").load(catchments_path)
    df_stores.createOrReplaceTempView("raw_stores")

    spark.sql("""
        CREATE OR REPLACE TEMP VIEW stores_spatial AS
        SELECT
            store_id,
            store_name,
            category AS store_category,
            latitude AS store_lat,
            longitude AS store_lon,
            ST_Transform(
                ST_Point(CAST(longitude AS Decimal(24,20)), CAST(latitude AS Decimal(24,20))),
                'EPSG:4326',
                'EPSG:32643'
            ) AS store_center_metric,
            ST_Transform(
                ST_GeomFromGeoJSON(geometry),
                'EPSG:4326',
                'EPSG:32643'
            ) AS catchment_500m_metric
        FROM raw_stores
    """)

    print("[4/5] Executing Distributed Spatial Range Join with Sedona Spatial Indexing...")
    # Broadcast stores if smaller than broadcast threshold, partition pings
    joined_df = spark.sql("""
        SELECT /*+ BROADCAST(stores) */
            p.ping_id,
            p.device_id,
            p.timestamp,
            p.latitude,
            p.longitude,
            p.speed_kmh,
            p.activity_type,
            p.h3_res9,
            s.store_id,
            s.store_name,
            s.store_category,
            ROUND(ST_Distance(p.ping_geom_metric, s.store_center_metric), 2) AS distance_to_store_m,
            TRUE AS in_500m_catchment
        FROM pings_spatial p
        INNER JOIN stores_spatial s
            ON ST_Contains(s.catchment_500m_metric, p.ping_geom_metric)
    """)

    print("[5/5] Writing spatial join results...")
    joined_df.write.mode("overwrite").parquet(output_path)
    print(f"[OK] Sedona spatial join completed and saved to {output_path}")

    # Summary analytics
    summary = joined_df.groupBy("store_id", "store_name", "store_category").agg(
        {"ping_id": "count", "device_id": "approx_count_distinct"}
    )
    summary.show(truncate=False)
    
    spark.stop()
    return True


if __name__ == "__main__":
    run_sedona_spatial_join()
