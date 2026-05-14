select *
from {{ ref('fct_valuation_multiples') }}
where pe_ratio is null
   or pe_ratio <= 0
