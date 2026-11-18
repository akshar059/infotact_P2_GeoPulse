

\# GeoPulse – GPS Data Requirements



\## 1. Purpose



This document defines the data requirements for Member 2 – Data Analytics before developing the GeoPulse analytics models.



\## 2. Expected Data Fields



The following fields need to be checked in the GPS dataset:



\- Visitor or device identifier (preferably anonymized)

\- Store identifier

\- Event timestamp

\- Latitude

\- Longitude



The actual dataset schema must be confirmed before building SQL transformations.



\## 3. Data Validation Rules



The following checks will be performed:



\- Identify missing values in important columns.

\- Check for duplicate GPS records.

\- Validate timestamp formats.

\- Check latitude and longitude values for valid coordinate ranges.

\- Verify that store identifiers are consistent.

\- Identify records with invalid or incomplete location information.



\## 4. Planned Analytics



After validating the dataset, the analysis will focus on:



1\. Visitors per store.

2\. Hourly store footfall.

3\. Peak visiting hours.

4\. Visitor movement between stores.

5\. Store cannibalization percentage.

6\. Business insights based on observed patterns.



\## 5. Data Preparation Approach



The staging models will be used for cleaning and preparing the source data.



The marts models will contain the final analytical outputs.



dbt and DuckDB will be used for transformations and local development.



\## 6. Current Blocker



The actual GPS dataset has not yet been found in the project repository.



The dataset schema and availability must be confirmed with the relevant team member before implementing the final analytics models.



\## 7. Next Steps



\- Obtain the actual GPS dataset.

\- Inspect its columns and sample records.

\- Perform data quality checks.

\- Develop staging models.

\- Build and test analytical models.



