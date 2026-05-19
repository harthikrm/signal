export function formatMetricValue(v: unknown, unit: string): string {
  if (v == null || v === "") return "N/A";
  if (typeof v === "number") {
    if (unit === "%") return `${v.toFixed(2)}%`;
    if (unit === "$") {
      if (Math.abs(v) >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
      if (Math.abs(v) >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
      if (Math.abs(v) >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
      return `$${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    }
    if (unit === "x") return `${v.toFixed(2)}x`;
    return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  return String(v);
}
