select
    ticker,
    name,
    sector,
    exchange,
    cik
from {{ ref('companies') }}
