with rev as (
    select ticker, period_end, value as revenues
    from {{ ref('stg_financials_raw') }}
    where metric_name = 'Revenues'
),
ni as (
    select ticker, period_end, value as net_income
    from {{ ref('stg_financials_raw') }}
    where metric_name = 'NetIncome'
)
select
    r.ticker,
    r.period_end,
    r.revenues,
    n.net_income,
    case
        when r.revenues is not null and r.revenues > 0
        then n.net_income / r.revenues
    end as net_margin
from rev r
inner join ni n
    on r.ticker = n.ticker
    and r.period_end = n.period_end
