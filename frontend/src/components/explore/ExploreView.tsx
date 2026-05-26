import { useMemo } from "react";
import { createPortal } from "react-dom";

import { getTradingViewSymbol } from "../../constants/companies";
import { useCompany } from "../../hooks/useCompany";
import { useMetrics } from "../../hooks/useMetrics";
import { usePriceSnapshot } from "../../hooks/usePriceSnapshot";
import { useAppStore } from "../../store/appStore";
import { ErrorMessage } from "../ui/ErrorMessage";
import { Spinner } from "../ui/Spinner";
import { ExploreStickySearch } from "./ExploreStickySearch";
import { LeftPanel } from "./LeftPanel";
import { MetricsGrid } from "./MetricsGrid";
import MiniChartWidget from "./MiniChartWidget";
import SingleIndicatorWidget from "./SingleIndicatorWidget";
import TechnicalPanel from "./TechnicalPanel";
import { TickerSearch } from "./TickerSearch";
import TradingViewWidget from "./TradingViewWidget";

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
          <div className="explore-two-col-row">
            <LeftPanel ticker={activeTicker} />
            <div className="explore-chart-col">
              {tradingViewSymbol && (
                <TradingViewWidget symbol={tradingViewSymbol} height={480} />
              )}
            </div>
          </div>

          {tradingViewSymbol && (
            <div className="explore-below-chart">
              <TechnicalPanel symbol={tradingViewSymbol} />
              <div className="explore-mini-widgets">
                <MiniChartWidget symbol={tradingViewSymbol} />
                <SingleIndicatorWidget symbol={tradingViewSymbol} indicator="RSI" />
              </div>
              <SingleIndicatorWidget symbol={tradingViewSymbol} indicator="MACD" />
            </div>
          )}

          <MetricsGrid data={metricData} />
        </>
      )}
    </div>
  );
}
