-- Reusable coordinate range validation expression
{% macro geo_coordinate_out_of_range(column_name, min_value, max_value) %}
    ({{ column_name }} < {{ min_value }} or {{ column_name }} > {{ max_value }})
{% endmacro %}

-- Generic test for valid latitude values
{% test valid_latitude(model, column_name) %}
select *
from {{ model }}
where {{ geo_coordinate_out_of_range(column_name, -90, 90) }}
{% endtest %}

-- Generic test for valid longitude values
{% test valid_longitude(model, column_name) %}
select *
from {{ model }}
where {{ geo_coordinate_out_of_range(column_name, -180, 180) }}
{% endtest %}
