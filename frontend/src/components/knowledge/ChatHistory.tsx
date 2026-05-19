import { useAppStore } from "../../store/appStore";
import { MessageBubble } from "./MessageBubble";

export function ChatHistory() {
  const chatHistory = useAppStore((s) => s.chatHistory);

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        paddingRight: 4,
      }}
    >
      {chatHistory.map((m, i) => (
        <MessageBubble key={i} message={m} />
      ))}
    </div>
  );
}
