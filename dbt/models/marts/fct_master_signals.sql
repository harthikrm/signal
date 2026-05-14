with fin as (
    select * from {{ ref('fct_company_metrics') }}
),
px as (
    select * from {{ ref('fct_price_summary') }}
)
select
    f.ticker,
    p.as_of_date,
    p.rsi_14,
    p.sma_50,
    p.sma_200,
    f.net_margin,
    f.revenue_growth_yoy,
    case
        when p.rsi_14 is not null and p.rsi_14 < 30
            and coalesce(f.revenue_growth_yoy, 0) > 0.20
            then 'STRONG_BUY_OPPORTUNITY'
        when p.sma_50 is not null and p.sma_200 is not null
            and p.sma_50 > p.sma_200
            and coalesce(f.net_margin, 0) > 0.20
            then 'QUALITY_MOMENTUM'
        when p.rsi_14 is not null and p.rsi_14 > 70
            and coalesce(f.revenue_growth_yoy, 0) < 0
            then 'RISK_EXIT'
        else 'MONITOR'
    end as master_signal
from fin f
inner join px p on f.ticker = p.ticker
