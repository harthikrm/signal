with ind as (
    select * from {{ ref('int_price_indicators') }}
),
last_px as (
    select distinct on (ticker)
        ticker,
        date,
        close,
        volume,
        sma_20,
        sma_50,
        sma_200,
        rsi_14
    from ind
    order by ticker, date desc
)
select
    ticker,
    date as as_of_date,
    close,
    volume,
    sma_20,
    sma_50,
    sma_200,
    rsi_14,
    0.15::numeric as rolling_correlation
from last_px
