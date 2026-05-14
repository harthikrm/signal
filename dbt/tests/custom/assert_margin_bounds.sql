select *
from {{ ref('fct_company_metrics') }}
where net_margin is not null
  and (net_margin < -1.0 or net_margin > 1.0)
