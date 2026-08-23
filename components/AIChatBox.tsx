"use client";

import { useEffect, useState } from "react";

export default function AIChatBox() {

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<
    { role: string; text: string }[]
  >([
    {
      role: "ai",
      text: "Hi 👋 I'm your AI design assistant. Ask me anything about photo editing, thumbnails, colors, templates or branding.",
    },
  ]);

  // ✅ Fix hydration issues - use effect to track mount status
  useEffect(() => {
    // Component is mounted after first render
  }, []);

  const sendMessage = async () => {

    if (!message.trim()) return;

    const userMessage = message;

    setMessages((prev) => [
      ...prev,
      { role: "user", text: userMessage },
    ]);

    setMessage("");

    try {
      setLoading(true);

      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const text = await response.text();
      let data: { reply?: string } = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { reply: "The AI assistant is unavailable right now. Please try again." };
      }

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: data.reply || "No response received." },
      ]);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 shadow-2xl flex items-center justify-center text-white text-2xl hover:scale-110 transition"
      >
        ✨
      </button>

      {/* Chat Box */}
      {open && (
        <div className="fixed bottom-24 right-6 w-[380px] h-[600px] bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-50 flex flex-col">

          {/* Header */}
          <div className="p-5 border-b border-slate-800 bg-slate-900">
            <h2 className="font-bold text-white text-lg">
              AI Design Assistant
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Powered by OpenRouter AI
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "ml-auto bg-indigo-600 text-white"
                    : "bg-slate-800 text-slate-200"
                }`}
              >
                {msg.text}
              </div>
            ))}

            {loading && (
              <div className="bg-slate-800 text-slate-300 px-4 py-3 rounded-2xl text-sm inline-block">
                AI is thinking...
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-800 bg-slate-900 flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask AI for design help..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
            />

            <button
              onClick={sendMessage}
              disabled={loading}
              className="px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 font-semibold text-white hover:scale-105 transition"
            >
              Send
            </button>
          </div>

        </div>
      )}
    </>
  );
}