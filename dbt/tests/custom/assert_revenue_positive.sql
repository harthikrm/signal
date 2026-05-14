select *
from {{ ref('fct_company_metrics') }}
where revenues is null
   or revenues <= 0
