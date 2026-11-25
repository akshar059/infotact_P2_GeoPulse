\# GeoPulse – Analytics Metric Definitions



\## 1. Purpose

This document defines the key metrics planned for the GeoPulse data analytics module.



\## 2. Planned Metrics



\### Visitors Per Store

Measures the number of unique visitors detected at each store during a selected period.



\### Hourly Footfall

Tracks visitor activity at stores across different hours of the day.



\### Peak Visiting Hours

Identifies time slots with the highest visitor activity at individual stores.



\### Store-to-Store Movement

Analyses visitor movement between different stores using anonymized visitor identifiers.



\### Store Cannibalization

Helps identify whether nearby stores share overlapping visitors and whether visitor activity at one store may affect another store.



\## 3. Data Requirements

The analysis requires anonymized visitor IDs, store IDs, timestamps, and location-related data wherever applicable.



\## 4. Implementation Plan

\- Prepare raw data using dbt staging models.

\- Apply data cleaning and validation.

\- Create analytical models using DuckDB.

\- Calculate store-level and hourly metrics.

\- Generate insights from the processed data.



\## 5. Current Status

Metric definitions have been documented. Actual analytics implementation is pending the availability of the project GPS dataset.



