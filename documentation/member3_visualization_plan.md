# GeoPulse | Member 3: Dashboard & Visualization Plan

> **Owner:** Sagar Janathe (sagar branch)  
> **Domain:** Frontend Architecture, Geospatial Rendering & Interactive UI  
> **Core Objective:** Transform processed spatial mobility datasets into a live, interactive browser-based analytics application using React and Kepler.gl, enabling real-time exploration of store footfall, 3D traffic density, and catchment overlaps.

---

### Core Deliverables & Responsibilities
* **Frontend Architecture:** Build a responsive, modular dashboard shell and UI grid layout in React.
* **Geospatial Engine:** Embed Kepler.gl map viewers with custom dark-theme styling, viewport state management, and coordinate locking.
* **3D Spatial & Flow Rendering:** Implement Uber H3 hexagonal elevation grids for traffic density and arc layers to visualize cross-store customer movement.
* **Interactive Controls:** Develop a 24-hour timeline playback slider and store filter sidebars for dynamic time-series analysis.
* **KPI & Analytical Widgets:** Display real-time store cannibalization rates, dwell times, peak traffic bar charts, and store ranking tables.

---

### 4-Week Execution Schedule

| Timeline | Phase | Key Milestones | Status |
| :--- | :--- | :--- | :--- |
| **Week 1** (10 Nov – 16 Nov) | UI Foundation & Layout | React setup, dashboard shell, KPI cards (MetricsGrid), filter sidebar | Done |
| **Week 2** (17 Nov – 23 Nov) | Map Engine & Data Binding | Kepler.gl integration, map controls, binding processed footfall data | Done |
| **Week 3** (24 Nov – 30 Nov) | 3D Grids & Time Controls | 3D H3 hexagon layers, 24-hour timeline slider, movement arc layers | In Process |
| **Week 4** (01 Dec – 08 Dec) | Analytics & Final Polish | Peak hour charts, store ranking tables, UI polish, final demo & PPT | Planned |

---

### Daily Progress Tracker
* **Day 1 (10 Nov 2026):** Initialized sagar branch and configured project repository structure and baseline environment.
* **Day 2 (11 Nov 2026):** Defined frontend dashboard architecture, component hierarchy, and Kepler.gl integration specifications.
* **Day 3 (12 Nov 2026):** Created core dashboard layout shell and main navigation scaffolding.
* **Day 4 (13 Nov 2026):** Built responsive dashboard grid UI layout and placeholder KPI metrics cards (MetricsGrid.jsx) for footfall, dwell time, catchments, and overlap rates.
* **Day 5 (14 Nov 2026):** Developed interactive FilterSidebar.jsx component for store location selection and 24-hour time-window control.
* **Day 6 (15 Nov 2026):** Conducted Week 1 structural validation check, verified component refactoring across dashboard and map modules, and updated execution tracking.
* **Day 7 (16 Nov 2026) — Completed:**
  - Created `src/utils/spatialParser.js` to validate coordinate bounds, filter invalid records, and compute centroid viewport centers.
  - Created `src/hooks/useSpatialState.js` to manage parsed/filtered spatial datasets, map viewport state, category selection, and active layer toggles.
  - Verified parser and centroid logic locally via Node.js (`v26.13.1`) and browser DevTools console.
* **Day 8 (17 Nov 2026):** Initialized `package.json` and `.gitignore`, installed core React, Redux, and Kepler.gl dependencies (`@kepler.gl/components`, `@kepler.gl/reducers`), configured the Redux store (`src/store/index.js`), and embedded the core `<KeplerGl />` map component with responsive viewport sizing inside `src/components/map/SpatialMapViewer.jsx`.
* **Day 9 (Nov 18, 2026) – Map State Management & Base Map Setup:**
  - Configured Redux store (`src/store/index.js`) with `keplerGlReducer.initialState()` targeting Mumbai coordinates (`19.0760, 72.8777`, zoom `11`) and `enhanceReduxMiddleware` for asynchronous style fetching.
  - Integrated Carto Voyager (OpenStreetMap) and Carto Dark Matter base map styles in `SpatialMapViewer.jsx` alongside MapLibre GL CSS (`maplibre-gl/dist/maplibre-gl.css`) in `src/main.jsx`.
  - Verified full rendering of Mumbai and Navi Mumbai base map tiles at `http://localhost:5173/`.
* **Day 10 (Nov 19, 2026) – Spatial Dataset Schema & Automated Data Ingestion:**
  - Created `src/utils/spatialDataLoader.js` integrating with the existing `parseSpatialDataset` and `computeDataCenter` functions in `src/utils/spatialParser.js` without modifying parser logic.
  - Defined structured Mumbai retail footfall records (`MUMBAI_FOOTFALL_DATA`) across 8 key zones (Bandra, Lower Parel, BKC, Andheri, Powai, Colaba, Vashi, Thane) using `processRowObject` from `@kepler.gl/processors`.
  - Connected automated dataset dispatching via `addDataToMap` in `SpatialMapViewer.jsx`, verified point layer rendering and timestamp playback timeline at `http://localhost:5173/`.
* **Day 11 (Nov 20, 2026) — Spatial Map Layers & Basemap Configuration:**
  - Created `src/utils/mapConfig.js` exporting `createGeoPulseMapConfig` with native Kepler.gl `v1` configuration (`visState`, `mapState`, `mapStyle`, `uiState`) targeting `mumbai_footfall_data` (`lat`/`lng` coordinates)[cite: 11, 12, 13].
  - Configured programmatic **Footfall Intensity Heatmap** (`geopulse_footfall_heatmap`, weighted by `value`) and **Retail Store Locations** (`geopulse_store_points`) layers[cite: 1, 12, 13].
  - Registered custom map styles (`carto_voyager` and `carto_dark`) and locked **Carto Voyager (OSM)** basemap + Mumbai viewport persistence in `SpatialMapViewer.jsx` after `addDataToMap` initialization[cite: 2, 10, 12, 13].
* **Day 12 (21 Nov 2026) — 500-Meter Store Catchment Polygon Overlay Styling**
  - GeoJSON Catchment Generation: Implemented `createCirclePolygonGeoJSON` and `buildCatchmentGeoJson` in `src/utils/spatialDataLoader.js` using spherical Earth radius ($R = 6371\text{ km}$) to generate 48-vertex closed 500m buffer polygons (`mumbai_catchment_500m`) around each store coordinate (`MUM_001`–`MUM_008`).
  - Polygon Layer & Styling: Added the `geopulse_store_catchment_500m` (`geojson`) layer in `src/utils/mapConfig.js` with semi-transparent cyan fill (`opacity: 0.22`), crisp outline border (`strokeColor: [0, 229, 255]`, `thickness: 2`), and interactive hover tooltips displaying `id`, `store_name`, `category`, `value`, and `radius_m`.
  - Multi-Layer Rendering & Z-Order: Bound both `mumbai_footfall_data` and `mumbai_catchment_500m` in `SpatialMapViewer.jsx` via `addDataToMap`, configuring `layerOrder` (`geopulse_store_points` → `geopulse_store_catchment_500m` → `geopulse_footfall_heatmap`) for clear spatial readability.
* **Day 13 — Spatial Map Viewer & Data Notes**
  - Datasets Used: `retail_stores.csv` (12 Bengaluru stores) and `retail_stores_catchment_500m.geojson` (12 catchments) render smoothly in Kepler.gl (`Footfall Intensity`, `500m Store Catchments`, `Retail Store Locations`).
  - Viewer Updates: Added `loading`, `empty`, `failed`, and `succeeded` states, retry button, `AbortController` cleanup, and memoized props in `SpatialMapViewer.jsx` and `spatialDataLoader.js`.
  - Data Strategy: Kept heavy/processed files (`.csv.gz`, `.parquet`, `.json`, and ~98k mobility rows) out of live map rendering to keep the browser fast and lag-free.
* **Day 14 (Nov 23, 2026) – Mid-Project Integrity Audit & Bengaluru Schema Alignment:**
  - **Dataset & Config Alignment:** Standardized dataset IDs (`bengaluru_retail_stores` and `bengaluru_catchment_500m`) and default Bengaluru map center (`12.9279, 77.6271`) across `src/utils/spatialDataLoader.js` and `src/utils/mapConfig.js`.
  - **Parser & GeoJSON Validation:** Hardened `src/utils/spatialParser.js` with finite coordinate validation and bounding-box zoom calculation, and configured `store_id` and `gross_area_sqft` hover tooltips on the `500m` catchment polygon layer.
  - **Render & Load Performance Audit:** Streamlined `src/components/map/SpatialMapViewer.jsx` by applying the `Carto Voyager` basemap directly inside `addDataToMap`, verifying `AbortController` request cancellation, and measuring initial map load time (`ms`) across all `12` stores and `12` `500m` catchments.
  - **Baseline Audit Metrics:** Validated dashboard readiness against the processed dataset (`98,426` evaluated pings, `31,881` in-catchment pings, and `98.12%` cleaning retention) with zero console or runtime errors ahead of the Day 15 Mid-Project Review.
* **Day 15 (Nov 24, 2026) - Mid-Project Review Checkpoint — Mid-Term Milestone Documentation & Demo Branch Polish**
  - **Milestone Review & Portal Write-Ups:** Completed and submitted the Week 1 and Week 2 progress write-ups along with architecture notes for the Mid-Project Review checkpoint.
  - **Demo Branch & Spatial Rendering Verification:** Verified live rendering of the React + Kepler.gl Bengaluru dashboard (`12` retail stores, `500m` catchment polygon overlays, and footfall intensity heatmap) on the `sagar` branch with clean console output and `Carto Voyager` basemap alignment.
  - **Baseline Data Audit Reference:** Documented baseline validation metrics (`98,426` evaluated pings, `31,881` in-catchment pings across `12` stores, and `98.12%` cleaning retention) while keeping heavy raw/processed mobility files isolated from live browser map rendering.
  - **Transition to Week 3:** Concluded Week 2 spatial data binding and set up the next phase for `h3_res9` Uber H3 grid indexing, 3D H3 Hexagon elevation columns, and the 24-hour timeline slider.
* **Day 16 (Nov 25, 2026) - Uber H3 Spatial Grid Indexing (`h3_res9`) Setup**
  - H3 Grid Summary Aggregation:** Aggregated `data/processed/gps_mobility_spatial_joined_100k.csv` into `public/data/h3_grid_summary.json` (`4,117` `h3_res9` hexagons with `hex_id`, `ping_count`, `unique_visitors`, and dominant `store_id`) to keep browser rendering fast.
  - Data Loader & Kepler Layer Integration:** Updated `src/utils/spatialDataLoader.js`, `src/utils/mapConfig.js`, and `src/components/map/SpatialMapViewer.jsx` to load `h3_grid_summary.json` and render the `geopulse_h3_grid_res9` (`hexagonId`) layer color-encoded by `ping_count` with hover tooltips.
  - Rendering Verification:** Confirmed all `4,117` H3 hexagons render cleanly over Bengaluru alongside store locations and `500m` catchment overlays on `http://localhost:5173/`.
* **Day 17 (Nov 26, 2026) - 3D H3 Hexagon Elevation Columns**
  - **3D Extrusion & Scale:** Enabled `enable3d: true` (`elevationScale: 8`, `opacity: 0.72`) on `geopulse_h3_grid_res9` in `src/utils/mapConfig.js` and bound `visualChannels.elevationField` to `ping_count`
  - **3D Camera Perspective:** Configured `mapViewMode: 'MODE_3D'`, `pitch: 38`, `maxPitch: 60`, and `dragRotate: true` so 3D footfall columns are immediately visible and rotatable on load
  - **Visual Check:** Verified 3D vertical column extrusion, color gradients, and layer stack rendering on `http://localhost:5173/`
* **Day 18 (Nov 27, 2026) - 3D H3 Elevation Tuning & Interactive Map Controls**
  - **3D H3 Layer & Camera Tuning (`src/utils/mapConfig.js`):**
    - Set `elevationScale` to `'sqrt'` with a `3.5` scale factor and `0.58` opacity on `geopulse_h3_grid_res9` (`hexagonId`) so high-footfall `h3_res9` cells stand out while keeping base map streets and labels legible
    - Derived initial `mapViewMode` (`MODE_3D` vs. `MODE_2D`) and `pitch` (`38`° in 3D) from `mapState` options while preserving `dragRotate: true` and `maxPitch: 60`
  - **Interactive Quick Controls (`src/components/map/SpatialMapViewer.jsx`):**
    - Added a bottom-right quick-action bar with **3D View / 2D View** (`updateMap` pitch & view mode), **H3 Grid: On / Off** (`layerConfigChange` visibility and 3D state), and **Reset View** (re-centering on Bengaluru at the active view mode)
    - Passed `pitch` and `mapViewMode` into `createGeoPulseMapConfig` during dataset initialization
  