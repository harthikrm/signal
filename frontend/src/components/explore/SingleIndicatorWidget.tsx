import { useEffect, useRef } from "react";

export type IndicatorKind = "RSI" | "MACD" | "STOCH";

interface Props {
  symbol: string;
  indicator: IndicatorKind;
}

export default function SingleIndicatorWidget({ symbol, indicator }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !symbol) return;

    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      interval: "1D",
      width: "100%",
      height: 200,
      symbol,
      showIntervalTabs: false,
      locale: "en",
      colorTheme: "dark",
      isTransparent: true,
      indicator,
    });

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [symbol, indicator]);

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          fontSize: 11,
          color: "var(--text-tertiary)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          padding: "0 24px 8px",
        }}
      >
        {indicator}
      </div>
      <div
        className="tradingview-widget-container"
        ref={containerRef}
        style={{ height: 200, width: "100%" }}
      />
    </div>
  );
}
