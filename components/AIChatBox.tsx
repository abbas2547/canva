"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

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
      <motion.button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close AI design assistant" : "Open AI design assistant"}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 shadow-2xl flex items-center justify-center text-white text-2xl"
        whileHover={{ scale: 1.06, rotate: open ? -4 : 4 }}
        whileTap={{ scale: 0.94 }}
      >
        ✨
      </motion.button>

      {/* Chat Box */}
      <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ duration: 0.22 }}
          className="fixed bottom-24 right-6 w-[min(380px,calc(100vw-2rem))] h-[min(600px,calc(100vh-8rem))] bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-50 flex flex-col"
        >

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
              <div className="bg-slate-800 text-slate-300 px-4 py-3 rounded-2xl text-sm inline-flex items-center gap-2">
                <span>AI is thinking</span>
                <span className="flex gap-1" aria-label="AI is thinking">
                  <i className="chat-dot" />
                  <i className="chat-dot chat-dot-delay" />
                  <i className="chat-dot chat-dot-delay-2" />
                </span>
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

        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
}