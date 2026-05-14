with base as (
    select
        *,
        lag(revenues, 4) over (
            partition by ticker
            order by period_end
        ) as revenues_yoy_prior
    from {{ ref('int_company_metrics') }}
)
select
    ticker,
    period_end,
    revenues,
    net_income,
    net_margin,
    revenues_yoy_prior,
    case
        when revenues_yoy_prior is not null and revenues_yoy_prior > 0
        then (revenues - revenues_yoy_prior) / revenues_yoy_prior
    end as revenue_growth_yoy
from base
