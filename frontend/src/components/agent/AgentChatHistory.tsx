import { useEffect, useRef } from "react";

import { useAppStore } from "../../store/appStore";
import { MessageBubble } from "../knowledge/MessageBubble";

export function AgentChatHistory() {
  const agentHistory = useAppStore((s) => s.agentHistory);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [agentHistory]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {agentHistory.map((m, i) => (
        <MessageBubble
          key={i}
          message={{
            role: m.role,
            content: m.content,
            sources: m.citations,
          }}
        />
      ))}
      <div ref={bottomRef} aria-hidden />
    </div>
  );
}
