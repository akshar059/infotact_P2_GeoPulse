
-- Identify duplicate GPS event records in the staging model.

select
    visitor_id,
    store_id,
    event_timestamp,
    latitude,
    longitude,
    count(*) as duplicate_count

from {{ ref('stg_gps_events') }}

group by
    visitor_id,
    store_id,
    event_timestamp,
    latitude,
    longitude

having count(*) > 1
