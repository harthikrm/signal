{# Fails when staging has no rows (vacuous passes). Non-prod: seed union must populate. Prod: skipped (empty OK until ingestion). #}
{% if target.name != 'prod' %}
SELECT 1 AS failure
WHERE (SELECT COUNT(*) FROM {{ ref('stg_financials_raw') }}) = 0
{% else %}
SELECT 1 AS _skip
WHERE FALSE
{% endif %}
