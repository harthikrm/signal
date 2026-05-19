import { useMemo, useState } from "react";

import type { PriceSnapshotItem } from "../../types/company";

interface Props {
  companies: PriceSnapshotItem[];
  onSelect: (ticker: string) => void;
}

export function TickerSearch({ companies, onSelect }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toUpperCase();
    if (!q) return companies.slice(0, 12);
    return companies
      .filter(
        (c) =>
          c.ticker.toUpperCase().includes(q) ||
          c.name.toUpperCase().includes(q)
      )
      .slice(0, 12);
  }, [companies, query]);

  return (
    <div style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search ticker or company…"
        autoFocus
        style={{
          width: "100%",
          padding: "16px 20px",
          fontSize: 18,
          fontWeight: 500,
          borderRadius: 14,
          border: "1px solid var(--border)",
          background:
            "radial-gradient(ellipse at center, rgba(249,115,22,0.12) 0%, var(--bg-secondary) 70%)",
          color: "var(--text-primary)",
          outline: "none",
          boxShadow: "0 0 40px rgba(249,115,22,0.15)",
          textAlign: "center",
          letterSpacing: "0.04em",
        }}
      />
      <p
        style={{
          marginTop: 10,
          fontSize: 11,
          letterSpacing: "0.35em",
          color: "var(--text-tertiary)",
          fontFamily: "var(--font-mono)",
        }}
      >
        TCKR
      </p>
      {filtered.length > 0 && (
        <ul
          style={{
            listStyle: "none",
            marginTop: 20,
            textAlign: "left",
            border: "0.5px solid var(--border)",
            borderRadius: 12,
            overflow: "hidden",
            background: "var(--bg-secondary)",
          }}
        >
          {filtered.map((c) => (
            <li key={c.ticker}>
              <button
                type="button"
                onClick={() => onSelect(c.ticker)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
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
                    width={28}
                    height={28}
                    style={{ borderRadius: 6 }}
                  />
                ) : (
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background: "var(--bg-tertiary)",
                    }}
                  />
                )}
                <span>
                  <strong style={{ fontSize: 14 }}>{c.ticker}</strong>
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
