"use client";
import ChatWidget from "@/components/ChatWidget";

export default function EmbedPage() {
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        background: "#0b0b0b",
        overflow: "hidden",
      }}
    >
      <ChatWidget embedded />
    </div>
  );
}
