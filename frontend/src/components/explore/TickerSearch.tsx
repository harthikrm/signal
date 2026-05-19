import { useMemo, useState } from "react";

import type { PriceSnapshotItem } from "../../types/company";

interface Props {
  companies: PriceSnapshotItem[];
  onSelect: (ticker: string) => void;
  compact?: boolean;
}

export function TickerSearch({ companies, onSelect, compact = false }: Props) {
  const [query, setQuery] = useState("");

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

  return (
    <div
      style={{
        width: "100%",
        maxWidth: compact ? "100%" : 420,
        textAlign: compact ? "left" : "center",
      }}
    >
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="TCKR"
        autoFocus={!compact}
        style={{
          width: "100%",
          padding: compact ? "8px 12px" : "16px 20px",
          fontSize: compact ? 13 : 18,
          fontWeight: 500,
          borderRadius: compact ? 8 : 14,
          border: "1px solid var(--border)",
          background: compact
            ? "var(--bg-secondary)"
            : "radial-gradient(ellipse at center, rgba(249,115,22,0.12) 0%, var(--bg-secondary) 70%)",
          color: "var(--text-primary)",
          outline: "none",
          boxShadow: compact ? "none" : "0 0 40px rgba(249,115,22,0.15)",
          textAlign: "center",
          letterSpacing: "0.12em",
          fontFamily: "var(--font-mono)",
        }}
      />
      {showResults && (
        <ul
          style={{
            listStyle: "none",
            marginTop: compact ? 8 : 20,
            textAlign: "left",
            border: "0.5px solid var(--border)",
            borderRadius: compact ? 8 : 12,
            overflow: "hidden",
            background: "var(--bg-secondary)",
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
                  borderBottom: "0.5px solid var(--border)",
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
