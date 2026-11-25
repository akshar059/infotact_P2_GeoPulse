\# GeoPulse Analytics



This dbt project is part of the Infotact GeoPulse project.



\## My Role



Member 2 – Data Analytics



\## Objectives



\- Clean and transform GPS event data.

\- Analyse visitors per store and hour.

\- Calculate hourly footfall.

\- Identify peak visiting hours.

\- Analyse movement between stores.

\- Calculate store cannibalization percentage.

\- Generate meaningful business insights.



\## Technology Stack



\- Python

\- Pandas

\- dbt Core

\- DuckDB

\- SQL



\## Project Structure



\- `models/staging/` – Data cleaning and preparation.

\- `models/marts/` – Final analytics models.

\- `analyses/` – Analytical SQL queries.

\- `macros/` – Reusable SQL macros.

\- `seeds/` – Static input data.

\- `tests/` – Data quality tests.

\- `snapshots/` – Historical data tracking.



\## Setup and Commands



Run these commands from the `geopulse\_analytics` directory:



```bash

dbt debug

dbt parse

dbt run

dbt test

