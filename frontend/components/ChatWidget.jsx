"use client";
import { useState } from "react";

const MAX_MESSAGES = 6;

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

    // ---- DEMO LIMIT → LEAD MODE ----
    if (userMessageCount >= MAX_MESSAGES) {
      setLeadMode(true);
      return;
    }

    const userText = input;
    setInput("");
    setLoading(true);

    setMessages((prev) => [...prev, { role: "user", content: userText }]);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userText }),
        }
      );

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
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content:
            "Thank you for sharing your details. A BrevaNext consultant will review your request and follow up shortly.",
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
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
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
          zIndex: 9999,
        }}
      >
        💬
      </button>

      {/* Chat Window */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 90,
            right: 20,
            width: 340,
            height: 460,
            background: "#000000",
            color: "#e5e7eb",
            borderRadius: 16,
            display: "flex",
            flexDirection: "column",
            zIndex: 9999,
            boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: 14,
              background:
                "linear-gradient(135deg,#22d3ee,#3b82f6,#8b5cf6,#ec4899)",
              color: "#000",
              fontWeight: 700,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            }}
          >
            BrevaNext AI Assistant
          </div>

          {/* Messages */}
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
            {loading && (
              <div style={{ opacity: 0.6 }}>Thinking…</div>
            )}
          </div>

          {/* Lead Capture */}
          {leadMode && (
            <div
              style={{
                padding: 12,
                borderTop: "1px solid #1f2937",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  marginBottom: 8,
                  opacity: 0.9,
                }}
              >
                To continue with tailored recommendations, please share your
                work email. A BrevaNext consultant will follow up.
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

          {/* Input */}
          {!leadMode && (
            <div
              style={{
                display: "flex",
                padding: 10,
                gap: 6,
                borderTop: "1px solid #1f2937",
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
