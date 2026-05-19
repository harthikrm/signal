import ReactMarkdown from "react-markdown";

import type { ChatMessage } from "../../types/chat";

interface Props {
  message: ChatMessage;
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";

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
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
      {!isUser && message.sources.length > 0 && (
        <div style={{ marginTop: 6, fontSize: 11, color: "var(--text-tertiary)" }}>
          Sources: {message.sources.join(" · ")}
        </div>
      )}
    </div>
  );
}
