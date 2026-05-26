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
import NewsWidget from "./NewsWidget";
import SingleIndicatorWidget from "./SingleIndicatorWidget";
import TechnicalPanel from "./TechnicalPanel";
import { TickerSearch } from "./TickerSearch";
import TradingViewWidget from "./TradingViewWidget";

const TECH_ROW_HEIGHT = 300;
const MACD_ROW_HEIGHT = 250;
/** Left column: 3×300 row + 1px gaps + MACD row */
const INTELLIGENCE_NEWS_HEIGHT = TECH_ROW_HEIGHT + 1 + MACD_ROW_HEIGHT + 1;

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
            <>
              <div className="explore-section-header">Market Intelligence</div>
              <div className="explore-intelligence-grid">
                <div className="explore-intelligence-left">
                  <div className="explore-intelligence-technicals-row">
                    <div className="explore-widget-cell">
                      <TechnicalPanel
                        symbol={tradingViewSymbol}
                        height={TECH_ROW_HEIGHT}
                      />
                    </div>
                    <div className="explore-widget-cell">
                      <MiniChartWidget
                        symbol={tradingViewSymbol}
                        height={TECH_ROW_HEIGHT}
                      />
                    </div>
                    <div className="explore-widget-cell">
                      <SingleIndicatorWidget
                        symbol={tradingViewSymbol}
                        indicator="RSI"
                        height={TECH_ROW_HEIGHT}
                      />
                    </div>
                  </div>
                  <div className="explore-widget-cell">
                    <SingleIndicatorWidget
                      symbol={tradingViewSymbol}
                      indicator="MACD"
                      height={MACD_ROW_HEIGHT}
                    />
                  </div>
                </div>
                <div className="explore-intelligence-news">
                  <NewsWidget
                    symbol={tradingViewSymbol}
                    height={INTELLIGENCE_NEWS_HEIGHT}
                    sidebar
                  />
                </div>
              </div>
            </>
          )}

          <div className="explore-section-header">Fundamental Metrics</div>
          <MetricsGrid data={metricData} />
        </>
      )}
    </div>
  );
}
