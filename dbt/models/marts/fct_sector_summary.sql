with base as (
    select
        c.sector,
        f.ticker,
        f.revenues,
        f.net_margin,
        f.revenue_growth_yoy
    from {{ ref('fct_company_metrics') }} f
    inner join {{ ref('stg_companies') }} c on f.ticker = c.ticker
)
select
    sector,
    count(*)::bigint as company_count,
    avg(revenues)::numeric(38, 4) as avg_revenues,
    avg(net_margin)::numeric(38, 6) as avg_net_margin,
    avg(revenue_growth_yoy)::numeric(38, 6) as avg_revenue_growth_yoy
from base
group by sector
