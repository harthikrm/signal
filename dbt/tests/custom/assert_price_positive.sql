select *
from {{ ref('fct_price_summary') }}
where close is null
   or close <= 0
