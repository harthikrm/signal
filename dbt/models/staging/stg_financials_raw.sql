select
    ticker,
    metric_name,
    cast(period_end as date) as period_end,
    form,
    value::numeric as value
from {{ ref('sample_financials') }}
