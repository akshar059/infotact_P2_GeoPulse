# GeoPulse Member 2 - Analytics Workflow Design

## 1. Purpose
This document describes the planned workflow for processing GPS data and preparing analytics for the GeoPulse project.

## 2. Analytics Workflow

The planned data processing flow is:

Raw GPS Data -> Staging Models -> Intermediate Transformations -> Analytics Marts -> Insights

### Raw Data
The raw layer will store the original GPS dataset received for the project. The source data will be inspected before processing.

### Staging Layer
The staging layer will prepare the source data for analysis. Planned tasks include standardizing column names, handling missing values, checking timestamps, and validating location-related fields.

### Intermediate Layer
The intermediate layer will organize cleaned data into reusable transformations. It will support calculations related to visitors, store activity, and movement patterns.

### Analytics Marts
The marts layer will contain prepared datasets for reporting and analysis. These datasets will be designed to support store-level and time-based analytics.

## 3. Planned Analytics

- Visitors per store
- Hourly footfall
- Peak visitor hours
- Store-to-store movement
- Store cannibalization analysis
- Data-driven business insights

## 4. Technology Stack

- dbt: To organize, transform, and test data models.
- DuckDB: To run analytics locally during development.
- SQL: To implement data transformations and analytical calculations.

## 5. Validation

Planned validation checks include missing values, duplicate records, timestamp validity, coordinate ranges, and consistency of store identifiers.

## 6. Implementation Status

The analytics workflow is currently documented and planned. Actual analytical models and results will be developed after the GPS dataset is received and inspected.
