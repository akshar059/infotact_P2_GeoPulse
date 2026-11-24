# GeoPulse Member 2 - GPS Data Quality Checklist

## Purpose
This checklist will guide the quality review of GPS data before it is used for GeoPulse analytics.

## 1. Required Fields
- [ ] Confirm visitor identifier is available.
- [ ] Confirm store identifier is available.
- [ ] Confirm event timestamp is available.
- [ ] Confirm latitude and longitude are available.

## 2. Missing Data Checks
- [ ] Identify records with missing visitor IDs.
- [ ] Identify records with missing store IDs.
- [ ] Identify records with missing timestamps.
- [ ] Identify records with incomplete coordinates.

## 3. Data Validity Checks
- [ ] Check latitude values are between -90 and 90.
- [ ] Check longitude values are between -180 and 180.
- [ ] Verify timestamp format and validity.
- [ ] Review duplicate event records.

## 4. Consistency Checks
- [ ] Check store identifiers for consistency.
- [ ] Review whether location records can be associated with known stores.
- [ ] Identify incomplete or suspicious GPS records.

## 5. Analytics Readiness
- [ ] Confirm the source data structure.
- [ ] Run dbt staging transformations.
- [ ] Execute configured data quality tests.
- [ ] Review validation results before building analytics marts.

## Current Status
This checklist is prepared for the GeoPulse analytics workflow. Actual validation results will be recorded after the GPS dataset becomes available.
