
-- Standardize raw GPS event records for GeoPulse analytics.

with source_data as (

    select
        visitor_id,
        store_id,
        event_timestamp,
        latitude,
        longitude
    from {{ source('gps_data', 'gps_events') }}

),

cleaned_data as (

    select
        nullif(trim(cast(visitor_id as varchar)), '') as visitor_id,

        nullif(trim(cast(store_id as varchar)), '') as store_id,

        try_cast(event_timestamp as timestamp) as event_timestamp,

        try_cast(latitude as double) as latitude,

        try_cast(longitude as double) as longitude

    from source_data

)

select *
from cleaned_data
