
-- Calculate the number of unique visitors for each store.

with gps_events as (

    select
        visitor_id,
        store_id
    from {{ ref('stg_gps_events') }}
    where visitor_id is not null
      and store_id is not null

),

unique_visitors as (

    select
        store_id,
        count(distinct visitor_id) as unique_visitors
    from gps_events
    group by store_id

)

select
    store_id,
    unique_visitors
from unique_visitors
