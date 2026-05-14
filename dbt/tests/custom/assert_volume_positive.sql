select *
from {{ ref('fct_price_summary') }}
where volume is null
   or volume < 0
