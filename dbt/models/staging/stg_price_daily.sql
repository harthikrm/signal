select
    ticker,
    cast("date" as date) as date,
    "open"::numeric as open,
    high::numeric as high,
    low::numeric as low,
    close::numeric as close,
    volume::bigint as volume,
    vwap::numeric as vwap,
    transactions::integer as transactions
from {{ ref('sample_prices') }}
