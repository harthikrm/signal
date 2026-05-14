with fin as (
    select * from {{ ref('fct_company_metrics') }}
),
px as (
    select * from {{ ref('fct_price_summary') }}
)
select
    f.ticker,
    p.close as price_as_of,
    f.net_income,
    greatest(
        1.0,
        least(
            120.0,
            p.close / nullif(f.net_income / 1.0e9, 0)
        )
    )::numeric(18, 4) as pe_ratio
from fin f
inner join px p on f.ticker = p.ticker
