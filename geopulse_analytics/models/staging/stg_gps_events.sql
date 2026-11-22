-- Staging model template for GeoPulse GPS events.
-- The source table will be connected after the actual dataset is received.

select
    visitor_id,
    store_id,
    event_timestamp,
    latitude,
    longitude

from {{ source('gps_data', 'gps_events') }}
