"use client";
import { useState } from "react";

const MAX_MESSAGES = 6;

// ✅ BACKEND URL
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://ideal-tenderness-production.up.railway.app";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      content:
        "Hi 👋 I’m BrevaNext AI. I help businesses explore AI, automation, and analytics opportunities.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [leadMode, setLeadMode] = useState(false);
  const [email, setEmail] = useState("");

  async function sendMessage() {
    if (!input.trim() || leadMode) return;

    const userMessageCount = messages.filter(
      (m) => m.role === "user"
    ).length;

    if (userMessageCount >= MAX_MESSAGES) {
      setLeadMode(true);
      return;
    }

    const userText = input;
    setInput("");
    setLoading(true);

    setMessages((prev) => [...prev, { role: "user", content: userText }]);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "bot", content: data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content:
            "⚠️ We’re having trouble connecting right now. Please try again shortly.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function submitLead() {
    if (!email.trim()) return;

    try {
      await fetch(`${API_URL}/lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content:
            "Thank you! A BrevaNext consultant will follow up shortly.",
        },
      ]);

      setLeadMode(false);
      setEmail("");
    } catch {
      alert("Unable to submit right now. Please try again.");
    }
  }

  return (
    <>
      {/* 💬 FLOATING CHAT BUTTON */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          width: 58,
          height: 58,
          borderRadius: "50%",
          background:
            "linear-gradient(135deg,#22d3ee,#3b82f6,#8b5cf6,#ec4899)",
          color: "#000",
          fontSize: 24,
          border: "none",
          cursor: "pointer",
          zIndex: 2147483647,
        }}
        aria-label="Open chat"
      >
        💬
      </button>

      {/* 🪟 CHAT POPUP (ISOLATED – NO PAGE GLITCH) */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 90,
            right: 20,
            width: 360,
            height: 480,
            backgroundColor: "#000",
            color: "#e5e7eb",
            borderRadius: 16,
            display: "flex",
            flexDirection: "column",
            zIndex: 2147483647,
            boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
            overflow: "hidden",
            isolation: "isolate", // 🔥 critical fix
            pointerEvents: "auto",
          }}
        >
          {/* HEADER */}
          <div
            style={{
              padding: 14,
              background:
                "linear-gradient(135deg,#22d3ee,#3b82f6,#8b5cf6,#ec4899)",
              color: "#000",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            BrevaNext AI Assistant
          </div>

          {/* MESSAGES */}
          <div
            style={{
              flex: 1,
              padding: 12,
              overflowY: "auto",
              fontSize: 14,
            }}
          >
            {messages.map((m, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <b>{m.role === "user" ? "You" : "BrevaNext"}:</b>{" "}
                {m.content}
              </div>
            ))}
            {loading && <div style={{ opacity: 0.6 }}>Thinking…</div>}
          </div>

          {/* LEAD CAPTURE */}
          {leadMode && (
            <div
              style={{
                padding: 12,
                borderTop: "1px solid #1f2937",
                flexShrink: 0,
              }}
            >
              <div style={{ fontSize: 13, marginBottom: 8 }}>
                Share your work email to continue.
              </div>

              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Work email"
                style={{
                  width: "100%",
                  padding: 8,
                  borderRadius: 6,
                  border: "none",
                  marginBottom: 8,
                }}
              />

              <button
                onClick={submitLead}
                style={{
                  width: "100%",
                  padding: 8,
                  borderRadius: 6,
                  background:
                    "linear-gradient(135deg,#22d3ee,#3b82f6,#8b5cf6,#ec4899)",
                  color: "#000",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Request follow-up
              </button>
            </div>
          )}

          {/* INPUT */}
          {!leadMode && (
            <div
              style={{
                display: "flex",
                padding: 10,
                gap: 6,
                borderTop: "1px solid #1f2937",
                flexShrink: 0,
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask something…"
                style={{
                  flex: 1,
                  padding: 8,
                  borderRadius: 8,
                  border: "none",
                }}
              />
              <button
                onClick={sendMessage}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  background: "#111827",
                  color: "#e5e7eb",
                }}
              >
                Send
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
