import { useMemo } from "react";
import { createPortal } from "react-dom";

import { getTradingViewSymbol } from "../../constants/companies";
import { useCompany } from "../../hooks/useCompany";
import { useMetrics } from "../../hooks/useMetrics";
import { usePriceSnapshot } from "../../hooks/usePriceSnapshot";
import { formatMetricValue } from "../../lib/formatMetric";
import { useAppStore } from "../../store/appStore";
import { ErrorMessage } from "../ui/ErrorMessage";
import { MetricTooltip } from "../ui/MetricTooltip";
import { Spinner } from "../ui/Spinner";
import { ExploreStickySearch } from "./ExploreStickySearch";
import { MetricsGrid } from "./MetricsGrid";
import MiniChartWidget from "./MiniChartWidget";
import SingleIndicatorWidget from "./SingleIndicatorWidget";
import TechnicalPanel from "./TechnicalPanel";
import { TickerSearch } from "./TickerSearch";
import TradingViewWidget from "./TradingViewWidget";

const KEY_METRICS: { key: string; label: string; unit: string }[] = [
  { key: "market_cap", label: "Market Cap", unit: "$" },
  { key: "pe_ratio", label: "P/E Ratio", unit: "x" },
  { key: "revenue_ttm", label: "Revenue TTM", unit: "$" },
  { key: "eps_diluted", label: "EPS", unit: "$" },
];

function weekRangeLabel(data: Record<string, unknown>): string {
  const hi = data.week_52_high;
  const lo = data.week_52_low;
  if (hi == null && lo == null) return "—";
  const h = hi != null ? formatMetricValue(hi, "$") : "—";
  const l = lo != null ? formatMetricValue(lo, "$") : "—";
  return `${h} / ${l}`;
}

export function ExploreView() {
  const activeTicker = useAppStore((s) => s.activeTicker);
  const setActiveTicker = useAppStore((s) => s.setActiveTicker);
  const { data: snap, isLoading: snapLoading, error: snapErr, exchangeByTicker } =
    usePriceSnapshot();
  const { data: company } = useCompany(activeTicker);
  const { data: metrics, isLoading: mLoading, error: mErr } = useMetrics(activeTicker);

  const tradingViewSymbol = useMemo(() => {
    if (!activeTicker) return null;
    const exchange = exchangeByTicker[activeTicker];
    if (!exchange) return null;
    return getTradingViewSymbol(activeTicker, exchange);
  }, [activeTicker, exchangeByTicker]);

  const snapRow = snap?.find((r) => r.ticker === activeTicker);
  const metricData = metrics?.data ?? {};
  const companies = snap ?? [];

  console.log("snap length:", snap?.length, "activeTicker:", activeTicker);

  if (!activeTicker) {
    return (
      <>
        {createPortal(
          <div className="explore-empty">
            {snapLoading && <Spinner />}
            {snapErr && <ErrorMessage />}
            <TickerSearch
              mode="empty"
              sticky={false}
              companies={companies}
              onSelect={(ticker) => setActiveTicker(ticker)}
            />
          </div>,
          document.body
        )}
      </>
    );
  }

  return (
    <div className="explore-detail">
      <ExploreStickySearch
        ticker={activeTicker}
        companyName={company?.name ?? snapRow?.name}
        companies={companies}
        onSelect={(ticker) => setActiveTicker(ticker)}
        onClear={() => setActiveTicker(null)}
      />

      {mLoading && (
        <div style={{ padding: 48, display: "flex", justifyContent: "center" }}>
          <Spinner />
        </div>
      )}
      {mErr && (
        <div style={{ padding: 24 }}>
          <ErrorMessage />
        </div>
      )}

      {metrics && (
        <>
          <header
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "20px 24px",
            }}
          >
            {snapRow?.logo_url ? (
              <img
                src={snapRow.logo_url}
                alt=""
                width={32}
                height={32}
                style={{ borderRadius: 6, objectFit: "cover" }}
              />
            ) : (
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  background: "rgba(255,255,255,0.08)",
                }}
              />
            )}
            <div style={{ minWidth: 0, flex: 1 }}>
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                {company?.name ?? snapRow?.name ?? activeTicker}
              </h2>
              {(company?.sector ?? snapRow?.sector) && (
                <span
                  style={{
                    display: "inline-block",
                    marginTop: 6,
                    fontSize: 11,
                    color: "var(--text-secondary)",
                    padding: "2px 8px",
                    borderRadius: 4,
                    border: "0.5px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.04)",
                  }}
                >
                  {company?.sector ?? snapRow?.sector}
                </span>
              )}
            </div>
          </header>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              gap: 16,
              padding: "16px 24px",
              borderBottom: "0.5px solid rgba(255,255,255,0.06)",
            }}
          >
            {KEY_METRICS.map((m) => (
              <div key={m.key} style={{ flex: "1 1 120px", minWidth: 100 }}>
                <MetricTooltip metricKey={m.key}>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--text-tertiary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: 4,
                    }}
                  >
                    {m.label}
                  </div>
                </MetricTooltip>
                <div
                  className="mono metric-value"
                  style={{ fontSize: 14, fontWeight: 500 }}
                >
                  {formatMetricValue(metricData[m.key], m.unit)}
                </div>
              </div>
            ))}
            <div style={{ flex: "1 1 120px", minWidth: 100 }}>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-tertiary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: 4,
                }}
              >
                52W High / Low
              </div>
              <div
                className="mono metric-value"
                style={{ fontSize: 14, fontWeight: 500 }}
              >
                {weekRangeLabel(metricData)}
              </div>
            </div>
          </div>

          {tradingViewSymbol && (
            <>
              <div
                style={{
                  width: "100%",
                  minWidth: 0,
                }}
              >
                <TradingViewWidget symbol={tradingViewSymbol} />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1px",
                  background: "rgba(255,255,255,0.06)",
                  width: "100%",
                }}
              >
                <div style={{ background: "#000000", minWidth: 0 }}>
                  <TechnicalPanel symbol={tradingViewSymbol} />
                </div>
                <div style={{ background: "#000000", minWidth: 0 }}>
                  <MiniChartWidget symbol={tradingViewSymbol} />
                </div>
              </div>

              <div
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--text-tertiary)",
                  padding: "20px 24px 12px",
                }}
              >
                Technical Indicators
              </div>

              <SingleIndicatorWidget symbol={tradingViewSymbol} indicator="RSI" />
              <SingleIndicatorWidget symbol={tradingViewSymbol} indicator="MACD" />
            </>
          )}

          <MetricsGrid data={metricData} />
        </>
      )}
    </div>
  );
}
