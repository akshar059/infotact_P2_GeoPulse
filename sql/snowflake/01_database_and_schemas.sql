-- ====================================================================
-- GeoPulse - Snowflake Database & Schemas Initialization
-- Script: 01_database_and_schemas.sql
-- Description: Creates the GeoPulse analytical warehouse, database, 
--              schemas, file formats, and internal storage stages.
-- ====================================================================

-- 1. Create Dedicated Analytical Virtual Warehouse
CREATE WAREHOUSE IF NOT EXISTS GEOPULSE_WH
    WITH 
    WAREHOUSE_SIZE = 'XSMALL'
    AUTO_SUSPEND = 60
    AUTO_RESUME = TRUE
    INITIALLY_SUSPENDED = TRUE
    COMMENT = 'Virtual warehouse for GeoPulse hyper-local mobility processing';

USE WAREHOUSE GEOPULSE_WH;

-- 2. Create Analytical Database
CREATE DATABASE IF NOT EXISTS GEOPULSE_DB
    COMMENT = 'GeoPulse Hyper-Local Retail Mobility Analytics Database';

USE DATABASE GEOPULSE_DB;

-- 3. Create Layered Schemas
CREATE SCHEMA IF NOT EXISTS GEOPULSE_DB.STAGING
    COMMENT = 'Staging layer for file stages and raw landing data';

CREATE SCHEMA IF NOT EXISTS GEOPULSE_DB.RAW
    COMMENT = 'Raw ingested GPS mobility records and retail store catalogs';

CREATE SCHEMA IF NOT EXISTS GEOPULSE_DB.GEOSPATIAL
    COMMENT = 'Spatial processing layer, catchment polygons, and geometry features';

CREATE SCHEMA IF NOT EXISTS GEOPULSE_DB.ANALYTICS
    COMMENT = 'Dimensional models, aggregated footfall facts, and reporting marts';

-- 4. Create Reusable File Formats
CREATE OR REPLACE FILE FORMAT GEOPULSE_DB.STAGING.CSV_GZ_FORMAT
    TYPE = 'CSV'
    COMPRESSION = 'GZIP'
    FIELD_DELIMITER = ','
    RECORD_DELIMITER = '\n'
    SKIP_HEADER = 1
    FIELD_OPTIONALLY_ENCLOSED_BY = '"'
    NULL_IF = ('', 'NULL', 'null', 'NaN')
    EMPTY_FIELD_AS_NULL = TRUE
    ERROR_ON_COLUMN_COUNT_MISMATCH = FALSE;

CREATE OR REPLACE FILE FORMAT GEOPULSE_DB.STAGING.PARQUET_FORMAT
    TYPE = 'PARQUET'
    COMPRESSION = 'SNAPPY';

CREATE OR REPLACE FILE FORMAT GEOPULSE_DB.STAGING.JSON_FORMAT
    TYPE = 'JSON'
    STRIP_OUTER_ARRAY = TRUE;

-- 5. Create Internal Named Stages
CREATE OR REPLACE STAGE GEOPULSE_DB.STAGING.GPS_RAW_STAGE
    FILE_FORMAT = GEOPULSE_DB.STAGING.CSV_GZ_FORMAT
    COMMENT = 'Internal stage for compressed GPS mobility files';

CREATE OR REPLACE STAGE GEOPULSE_DB.STAGING.STORES_STAGE
    FILE_FORMAT = GEOPULSE_DB.STAGING.CSV_GZ_FORMAT
    COMMENT = 'Internal stage for store metadata and spatial boundaries';
