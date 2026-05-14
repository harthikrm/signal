select *
from {{ ref('fct_price_summary') }}
where rsi_14 is not null
  and (rsi_14 < 0 or rsi_14 > 100)
