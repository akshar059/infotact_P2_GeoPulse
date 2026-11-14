-- ====================================================================
-- GeoPulse - Snowflake Staging & Data Ingestion (COPY INTO)
-- Script: 03_staging_and_copy.sql
-- Description: Ingests 100k synthetic GPS records and retail stores from
--              internal stages with automatic spatial point & buffer generation.
-- ====================================================================

USE DATABASE GEOPULSE_DB;
USE WAREHOUSE GEOPULSE_WH;

-- Step 1: Upload Files to Stages using SnowSQL (Reference CLI commands)
-- PUT file://data/raw/retail_stores.csv @GEOPULSE_DB.STAGING.STORES_STAGE AUTO_COMPRESS=FALSE OVERWRITE=TRUE;
-- PUT file://data/raw/gps_mobility_raw_100k.csv.gz @GEOPULSE_DB.STAGING.GPS_RAW_STAGE AUTO_COMPRESS=FALSE OVERWRITE=TRUE;

-- Step 2: Load Benchmark Retail Stores Table
COPY INTO GEOPULSE_DB.RAW.RETAIL_STORES (
    STORE_ID,
    STORE_NAME,
    CATEGORY,
    LATITUDE,
    LONGITUDE,
    GROSS_AREA_SQFT,
    STORE_POINT_GEOG,
    CATCHMENT_500M_GEOG
)
FROM (
    SELECT 
        $1 AS STORE_ID,
        $2 AS STORE_NAME,
        $3 AS CATEGORY,
        $4::NUMBER(10,6) AS LATITUDE,
        $5::NUMBER(10,6) AS LONGITUDE,
        $6::NUMBER(12,2) AS GROSS_AREA_SQFT,
        ST_MAKEPOINT($5::DOUBLE, $4::DOUBLE) AS STORE_POINT_GEOG,
        ST_BUFFER(ST_MAKEPOINT($5::DOUBLE, $4::DOUBLE), 500) AS CATCHMENT_500M_GEOG
    FROM @GEOPULSE_DB.STAGING.STORES_STAGE/retail_stores.csv
)
FILE_FORMAT = (FORMAT_NAME = 'GEOPULSE_DB.STAGING.CSV_GZ_FORMAT')
ON_ERROR = 'ABORT_STATEMENT';

-- Step 3: Load 100,000 GPS Mobility Pings Table
COPY INTO GEOPULSE_DB.RAW.GPS_MOBILITY_PINGS (
    PING_ID,
    DEVICE_ID,
    LATITUDE,
    LONGITUDE,
    TIMESTAMP,
    HORIZONTAL_ACCURACY_M,
    ALTITUDE_M,
    SPEED_KMH,
    HEADING_DEG,
    BATTERY_PCT,
    ACTIVITY_TYPE,
    H3_RES9,
    GEOHASH,
    LOCATION_GEOGRAPHY
)
FROM (
    SELECT 
        $1 AS PING_ID,
        $2 AS DEVICE_ID,
        $3::NUMBER(10,6) AS LATITUDE,
        $4::NUMBER(10,6) AS LONGITUDE,
        TO_TIMESTAMP_NTZ($5) AS TIMESTAMP,
        $6::FLOAT AS HORIZONTAL_ACCURACY_M,
        $7::FLOAT AS ALTITUDE_M,
        $8::FLOAT AS SPEED_KMH,
        $9::INT AS HEADING_DEG,
        $10::INT AS BATTERY_PCT,
        $11 AS ACTIVITY_TYPE,
        $12 AS H3_RES9,
        $13 AS GEOHASH,
        ST_MAKEPOINT($4::DOUBLE, $3::DOUBLE) AS LOCATION_GEOGRAPHY
    FROM @GEOPULSE_DB.STAGING.GPS_RAW_STAGE/gps_mobility_raw_100k.csv.gz
)
FILE_FORMAT = (FORMAT_NAME = 'GEOPULSE_DB.STAGING.CSV_GZ_FORMAT')
ON_ERROR = 'CONTINUE';

-- Step 4: Verification Queries
SELECT COUNT(*) AS TOTAL_LOADED_PINGS FROM GEOPULSE_DB.RAW.GPS_MOBILITY_PINGS;
SELECT COUNT(*) AS TOTAL_LOADED_STORES FROM GEOPULSE_DB.RAW.RETAIL_STORES;
