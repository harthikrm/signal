select *
from {{ ref('fct_price_summary') }}
where rolling_correlation is not null
  and (rolling_correlation < -1.0 or rolling_correlation > 1.0)
