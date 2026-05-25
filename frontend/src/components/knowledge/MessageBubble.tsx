import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css";

import type { ChatMessage } from "../../types/chat";

interface Props {
  message: ChatMessage;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** LLM sometimes uses bracket/paren delimiters instead of $$ / $. */
export function normalizeMathDelimiters(content: string): string {
  let out = content;

  out = out.replace(/\\\[([\s\S]*?)\\\]/g, (_, equation) => {
    return `$$\n${String(equation).trim()}\n$$`;
  });

  out = out.replace(/\\\(([\s\S]*?)\\\)/g, (_, equation) => {
    return `$${String(equation).trim()}$`;
  });

  out = out.replace(/^\[\s*([\s\S]*?)\s*\]$/gm, (_, equation) => {
    const eq = String(equation).trim();
    if (eq.includes("\\")) {
      return `$$\n${eq}\n$$`;
    }
    return `[${eq}]`;
  });

  out = out.replace(
    /\[\s*((?:\\.|[^\]])+)\s*\]/g,
    (match, equation) => {
      const eq = String(equation).trim();
      if (eq.includes("\\")) {
        return `$$${eq}$$`;
      }
      return match;
    }
  );

  return out;
}

export function formatSourcePill(source: string): string {
  const citation = source.split(",")[0].trim();
  const parts = citation.split(/\s+/);
  if (parts.length < 2) {
    return citation.slice(0, 48);
  }

  const ticker = parts[0];
  const filingType = parts[1];
  const maybeDate = parts[2] ?? "";
  const year = DATE_RE.test(maybeDate) ? maybeDate.slice(0, 4) : "";

  return year ? `${ticker} ${filingType} ${year}` : `${ticker} ${filingType}`;
}

const markdownComponents: Components = {
  ul: ({ children }) => <ul className="answer-list">{children}</ul>,
  li: ({ children }) => <li>{children}</li>,
};

export function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";
  const pills = message.sources.map(formatSourcePill);
  const uniquePills = [...new Set(pills)];

  return (
    <div style={{ alignSelf: isUser ? "flex-end" : "flex-start", maxWidth: "92%" }}>
      <div
        style={{
          padding: "10px 14px",
          borderRadius: 12,
          background: isUser ? "var(--bg-tertiary)" : "var(--bg-secondary)",
          border: "0.5px solid var(--border)",
          color: "var(--text-primary)",
          fontSize: 14,
          lineHeight: 1.55,
        }}
      >
        {isUser ? (
          <div style={{ whiteSpace: "pre-wrap" }}>{message.content}</div>
        ) : (
          <div className="markdown-body">
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={markdownComponents}
            >
              {normalizeMathDelimiters(message.content)}
            </ReactMarkdown>
          </div>
        )}
      </div>
      {!isUser && uniquePills.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <div className="source-label">Sources</div>
          <div className="source-pills">
            {uniquePills.map((pill) => (
              <span key={pill} className="source-pill">
                {pill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
