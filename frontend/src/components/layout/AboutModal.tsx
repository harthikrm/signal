import { motion } from "framer-motion";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function AboutModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-title"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "rgba(0,0,0,0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(520px, 100%)",
          border: "0.5px solid var(--border)",
          background: "var(--bg-primary)",
          padding: "28px 28px 24px",
        }}
      >
        <h2
          id="about-title"
          className="mono"
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 600,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
          }}
        >
          About Signal
        </h2>
        <p
          style={{
            margin: "12px 0 0",
            fontSize: 13,
            lineHeight: 1.55,
            color: "var(--text-secondary)",
          }}
        >
          Financial intelligence over SEC filings and market data: retrieve,
          ground, and answer with citations.
        </p>
        <ul
          style={{
            margin: "18px 0 0",
            paddingLeft: 18,
            fontSize: 13,
            lineHeight: 1.65,
            color: "var(--text-secondary)",
          }}
        >
          <li>
            <span style={{ color: "var(--text-primary)" }}>Ingest</span> — SEC
            EDGAR + Polygon → Postgres / pgvector
          </li>
          <li>
            <span style={{ color: "var(--text-primary)" }}>Transform</span> — dbt
            marts for metrics, prices, and signals
          </li>
          <li>
            <span style={{ color: "var(--text-primary)" }}>Serve</span> — FastAPI
            on Cloud Run (Knowledge RAG + Agent tools)
          </li>
          <li>
            <span style={{ color: "var(--text-primary)" }}>UI</span> — Vite /
            React at signal.harthik.dev
          </li>
        </ul>
        <div
          style={{
            marginTop: 22,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <a
            href="https://github.com/harthikrm/signal"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 12,
              color: "var(--text-secondary)",
              fontFamily: "var(--font-mono)",
            }}
          >
            GitHub →
          </a>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "0.5px solid var(--border)",
              color: "var(--text-primary)",
              cursor: "pointer",
              padding: "8px 14px",
              fontSize: 12,
            }}
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
