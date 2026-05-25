import { useMemo, useState } from "react";

import type { PriceSnapshotItem } from "../../types/company";

interface Props {
  companies: PriceSnapshotItem[];
  onSelect: (ticker: string) => void;
  mode?: "empty" | "compact";
}

export function TickerSearch({
  companies,
  onSelect,
  mode = "empty",
}: Props) {
  const [query, setQuery] = useState("");
  const compact = mode === "compact";

  const filtered = useMemo(() => {
    const q = query.trim().toUpperCase();
    if (!q) return companies.slice(0, compact ? 8 : 12);
    return companies
      .filter(
        (c) =>
          c.ticker.toUpperCase().includes(q) ||
          c.name.toUpperCase().includes(q)
      )
      .slice(0, compact ? 8 : 12);
  }, [companies, query, compact]);

  const showResults = query.trim().length > 0 && filtered.length > 0;

  const inputStyle = compact
    ? {
        width: "100%",
        padding: "6px 10px",
        fontSize: 13,
        fontWeight: 500,
        borderRadius: 8,
        border: "0.5px solid rgba(255,255,255,0.15)",
        background: "rgba(255,255,255,0.05)",
        color: "#ffffff",
        outline: "none",
        fontFamily: "var(--font-mono)",
      }
    : {
        width: "100%",
        padding: "14px 20px",
        fontSize: 16,
        fontWeight: 500,
        borderRadius: 8,
        border: "0.5px solid rgba(255,255,255,0.15)",
        background: "rgba(255,255,255,0.05)",
        color: "#ffffff",
        outline: "none",
        textAlign: "center" as const,
        letterSpacing: "0.12em",
        fontFamily: "var(--font-mono)",
      };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: compact ? "100%" : 400,
        position: "relative",
      }}
    >
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="TCKR"
        autoFocus={!compact}
        style={inputStyle}
      />
      {showResults && (
        <ul
          style={{
            listStyle: "none",
            marginTop: compact ? 6 : 8,
            textAlign: "left",
            border: "0.5px solid rgba(255,255,255,0.12)",
            borderRadius: 8,
            overflow: "hidden",
            background: "rgba(0,0,0,0.95)",
            position: compact ? "absolute" : "relative",
            left: 0,
            right: 0,
            zIndex: 30,
            maxHeight: 280,
            overflowY: "auto",
          }}
        >
          {filtered.map((c) => (
            <li key={c.ticker}>
              <button
                type="button"
                onClick={() => {
                  onSelect(c.ticker);
                  setQuery("");
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: compact ? "8px 12px" : "12px 16px",
                  border: "none",
                  borderBottom: "0.5px solid rgba(255,255,255,0.06)",
                  background: "transparent",
                  cursor: "pointer",
                  color: "var(--text-primary)",
                  textAlign: "left",
                }}
              >
                {c.logo_url ? (
                  <img
                    src={c.logo_url}
                    alt=""
                    width={compact ? 22 : 28}
                    height={compact ? 22 : 28}
                    style={{ borderRadius: 6 }}
                  />
                ) : (
                  <span
                    style={{
                      width: compact ? 22 : 28,
                      height: compact ? 22 : 28,
                      borderRadius: 6,
                      background: "var(--bg-tertiary)",
                    }}
                  />
                )}
                <span>
                  <strong style={{ fontSize: compact ? 13 : 14 }}>{c.ticker}</strong>
                  <span
                    style={{
                      display: "block",
                      fontSize: 12,
                      color: "var(--text-secondary)",
                    }}
                  >
                    {c.name}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
