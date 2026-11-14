-- ====================================================================
-- GeoPulse - Snowflake Tables DDL
-- Script: 02_raw_tables_ddl.sql
-- Description: DDL for storing DeviceID, Latitude, Longitude, Timestamp,
--              H3 index, geohash, and native GEOGRAPHY data types.
-- ====================================================================

USE DATABASE GEOPULSE_DB;
USE SCHEMA RAW;

-- 1. Raw GPS Mobility Pings Table (100k+ Records)
CREATE OR REPLACE TABLE GEOPULSE_DB.RAW.GPS_MOBILITY_PINGS (
    PING_ID                 VARCHAR(32) NOT NULL,
    DEVICE_ID               VARCHAR(64) NOT NULL,
    LATITUDE                NUMBER(10, 6) NOT NULL,
    LONGITUDE               NUMBER(10, 6) NOT NULL,
    TIMESTAMP               TIMESTAMP_NTZ NOT NULL,
    HORIZONTAL_ACCURACY_M   FLOAT,
    ALTITUDE_M              FLOAT,
    SPEED_KMH               FLOAT,
    HEADING_DEG             INT,
    BATTERY_PCT             INT,
    ACTIVITY_TYPE           VARCHAR(32),
    H3_RES9                 VARCHAR(32),
    GEOHASH                 VARCHAR(16),
    -- Native Snowflake Spatial Column constructed from coordinates
    LOCATION_GEOGRAPHY      GEOGRAPHY,
    INGESTED_AT             TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
    CONSTRAINT PK_GPS_MOBILITY PRIMARY KEY (PING_ID)
)
CLUSTER BY (DATE(TIMESTAMP), H3_RES9, DEVICE_ID)
COMMENT = 'Master raw table storing GPS mobility pings with spatial geography and clustering keys';

-- 2. Retail Stores Master Catalog Table
CREATE OR REPLACE TABLE GEOPULSE_DB.RAW.RETAIL_STORES (
    STORE_ID                VARCHAR(32) NOT NULL,
    STORE_NAME              VARCHAR(128) NOT NULL,
    CATEGORY                VARCHAR(64) NOT NULL,
    LATITUDE                NUMBER(10, 6) NOT NULL,
    LONGITUDE               NUMBER(10, 6) NOT NULL,
    GROSS_AREA_SQFT         NUMBER(12, 2),
    STORE_POINT_GEOG        GEOGRAPHY,
    CATCHMENT_500M_GEOG     GEOGRAPHY,
    CREATED_AT              TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
    CONSTRAINT PK_RETAIL_STORES PRIMARY KEY (STORE_ID)
)
COMMENT = 'Benchmark retail store catalog with point geometry and 500m catchment buffer';
