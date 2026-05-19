import { useCompany } from "../../hooks/useCompany";
import { useMetrics } from "../../hooks/useMetrics";
import { usePriceSnapshot } from "../../hooks/usePriceSnapshot";
import { formatMetricValue } from "../../lib/formatMetric";
import { DataFreshness } from "../ui/DataFreshness";
import { MetricTooltip } from "../ui/MetricTooltip";
import { Spinner } from "../ui/Spinner";

interface Props {
  ticker: string;
}

const PANEL_METRICS: { key: string; label: string; unit: string }[] = [
  { key: "market_cap", label: "Market Cap", unit: "$" },
  { key: "pe_ratio", label: "P/E Ratio", unit: "x" },
  { key: "revenue_ttm", label: "Revenue TTM", unit: "$" },
  { key: "eps_diluted", label: "EPS", unit: "$" },
];

function weekRange(data: Record<string, unknown>): string {
  const hi = data.week_52_high;
  const lo = data.week_52_low;
  if (hi == null && lo == null) return "N/A";
  const h = hi != null ? formatMetricValue(hi, "$") : "—";
  const l = lo != null ? formatMetricValue(lo, "$") : "—";
  return `${h} / ${l}`;
}

export function LeftPanel({ ticker }: Props) {
  const { data: company } = useCompany(ticker);
  const { data: metrics, isLoading } = useMetrics(ticker);
  const { data: snap } = usePriceSnapshot();

  const row = snap?.find((r) => r.ticker === ticker);
  const data = metrics?.data ?? {};

  return (
    <div
      style={{
        width: 240,
        flexShrink: 0,
        border: "0.5px solid var(--border)",
        borderRadius: 12,
        background: "var(--bg-secondary)",
        padding: "14px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        overflowY: "auto",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {row?.logo_url ? (
          <img src={row.logo_url} alt="" width={32} height={32} style={{ borderRadius: 6 }} />
        ) : (
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: "var(--bg-tertiary)",
            }}
          />
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{ticker}</div>
          <div
            style={{
              fontSize: 11,
              color: "var(--text-secondary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {company?.name ?? row?.name ?? "—"}
          </div>
        </div>
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <dl style={{ display: "flex", flexDirection: "column", gap: 12, margin: 0 }}>
          {PANEL_METRICS.map((m) => (
            <div key={m.key}>
              <MetricTooltip metricKey={m.key}>
                <dt style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 4 }}>
                  {m.label}
                </dt>
              </MetricTooltip>
              <dd
                className="mono metric-value"
                style={{ fontSize: 14, margin: 0, fontWeight: 500 }}
              >
                {formatMetricValue(data[m.key], m.unit)}
              </dd>
            </div>
          ))}
          <div>
            <dt style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 4 }}>
              52-Week High / Low
            </dt>
            <dd className="mono metric-value" style={{ fontSize: 13, margin: 0 }}>
              {weekRange(data)}
            </dd>
          </div>
        </dl>
      )}

      <DataFreshness
        date={data.period_end ? String(data.period_end) : undefined}
      />
    </div>
  );
}
