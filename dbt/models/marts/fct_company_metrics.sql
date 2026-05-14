with latest as (
    select
        *,
        row_number() over (
            partition by ticker
            order by period_end desc
        ) as rn
    from {{ ref('int_yoy_growth') }}
)
select
    ticker,
    period_end,
    revenues,
    net_income,
    net_margin,
    revenue_growth_yoy
from latest
where rn = 1
