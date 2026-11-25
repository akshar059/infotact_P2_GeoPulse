\# GeoPulse – GPS Data Dictionary



\## 1. Overview

This document describes the expected fields required for the GeoPulse data analytics module.



\## 2. Expected Data Fields



| Field Name | Expected Data Type | Description |

|---|---|---|

| DeviceID | String | An anonymized identifier used to distinguish visitors or devices |

| StoreID | String | Identifier representing a store location |

| Timestamp | Timestamp | Date and time when a GPS event was recorded |

| Latitude | Decimal | Geographic latitude coordinate |

| Longitude | Decimal | Geographic longitude coordinate |



\## 3. Data Validation Rules



\- DeviceID should not be missing.

\- StoreID should identify a valid store.

\- Timestamp should follow a consistent date-time format.

\- Latitude should be between -90 and 90.

\- Longitude should be between -180 and 180.

\- Duplicate GPS records should be identified.

\- Missing or invalid values should be checked before analysis.



\## 4. Analytics Usage



These fields will support unique visitor counting, hourly footfall analysis, peak-hour identification, and visitor movement analysis.



\## 5. Data Availability



This dictionary describes the expected input structure. The actual GPS dataset must be inspected before finalizing column names, data types, and validation rules.

