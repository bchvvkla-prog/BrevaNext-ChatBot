"use client";
import { useState } from "react";

const MAX_MESSAGES = 6;

// BACKEND URL
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://ideal-tenderness-production.up.railway.app";

export default function ChatWidget({ embedded = false }) {
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

  const isOpen = embedded || open;

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
      {/* 💬 FLOATING BUTTON — WEBSITE ONLY */}
      {!embedded && !open && (
        <button
          onClick={() => setOpen(true)}
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
        >
          💬
        </button>
      )}

      {/* 🪟 CHAT WINDOW */}
      {isOpen && (
        <div
          style={{
            position: embedded ? "relative" : "fixed",
            bottom: embedded ? 0 : 90,
            right: embedded ? 0 : 20,
            width: embedded ? "100%" : 360,
            height: embedded ? "100vh" : 480,
            backgroundColor: "#000",
            color: "#e5e7eb",
            borderRadius: embedded ? 0 : 16,
            display: "flex",
            flexDirection: "column",
            zIndex: 2147483647,
            boxShadow: embedded
              ? "none"
              : "0 20px 40px rgba(0,0,0,0.6)",
            overflow: "hidden",
          }}
        >
          {/* HEADER — WEBSITE ONLY */}
          {!embedded && (
            <div
              style={{
                padding: 14,
                background:
                  "linear-gradient(135deg,#22d3ee,#3b82f6,#8b5cf6,#ec4899)",
                color: "#000",
                fontWeight: 700,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>BrevaNext AI Assistant</span>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: 18,
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>
          )}

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

          {/* LEAD / INPUT */}
          {leadMode ? (
            <div style={{ padding: 12, borderTop: "1px solid #1f2937" }}>
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
                }}
              >
                Request follow-up
              </button>
            </div>
          ) : (
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
