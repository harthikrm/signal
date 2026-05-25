import type { PriceSnapshotItem } from "../../types/company";
import { TickerSearch } from "./TickerSearch";

interface Props {
  ticker: string;
  companyName?: string;
  companies: PriceSnapshotItem[];
  onSelect: (ticker: string) => void;
  onClear: () => void;
}

export function ExploreStickySearch({
  ticker,
  companyName,
  companies,
  onSelect,
  onClear,
}: Props) {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        height: 44,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "0 24px",
        background: "rgba(0,0,0,0.9)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "0.5px solid rgba(255,255,255,0.08)",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
        }}
      >
        <span
          className="mono"
          style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}
        >
          {ticker}
        </span>
        {companyName && (
          <span
            style={{
              fontSize: 12,
              color: "var(--text-tertiary)",
              maxWidth: 140,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {companyName}
          </span>
        )}
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear ticker"
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            border: "0.5px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.06)",
            color: "var(--text-secondary)",
            cursor: "pointer",
            fontSize: 14,
            lineHeight: 1,
            padding: 0,
          }}
        >
          ×
        </button>
      </div>
      <div style={{ flex: 1, minWidth: 0, maxWidth: 320 }}>
        <TickerSearch
          mode="compact"
          companies={companies}
          onSelect={onSelect}
        />
      </div>
    </div>
  );
}
