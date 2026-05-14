select *
from {{ ref('fct_company_metrics') }}
where revenue_growth_yoy is not null
  and (revenue_growth_yoy < -0.95 or revenue_growth_yoy > 5.0)
