"use client";

import {
  Bot,
  Sparkles,
  Send,
  X,
} from "lucide-react";

import { useState } from "react";

const suggestions = [
  "Make my design more professional",
  "Create a modern heading",
  "Improve this image",
  "Suggest better colors",
];

export default function AIPanel() {
  const [message, setMessage] = useState("");

  const sendMessage = () => {
    if (!message.trim()) return;

    console.log("AI request:", message);

    setMessage("");
  };

  return (
    <aside className="flex w-[330px] shrink-0 flex-col border-l border-slate-200 bg-white">

      {/* HEADER */}

      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">

        <div className="flex items-center gap-2">

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white">
            <Sparkles size={17} />
          </div>

          <div>
            <p className="text-sm font-semibold">
              Mini AI
            </p>

            <p className="text-xs text-slate-500">
              Design assistant
            </p>
          </div>

        </div>

        <button className="rounded-lg p-2 hover:bg-slate-100">
          <X size={17} />
        </button>

      </div>

      {/* CHAT */}

      <div className="flex-1 overflow-y-auto p-4">

        <div className="mb-5 flex gap-3">

          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
            <Bot size={17} />
          </div>

          <div className="rounded-2xl rounded-tl-sm bg-slate-100 px-3 py-2 text-sm leading-6">
            Hi! I'm your AI design assistant. Tell me what you'd like to create or change.
          </div>

        </div>

        <div className="space-y-2">

          {suggestions.map((suggestion) => (

            <button
              key={suggestion}
              onClick={() => setMessage(suggestion)}
              className="w-full rounded-xl border border-slate-200 p-3 text-left text-xs transition hover:border-slate-400 hover:bg-slate-50"
            >
              {suggestion}
            </button>

          ))}

        </div>

      </div>

      {/* INPUT */}

      <div className="border-t border-slate-200 p-3">

        <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2">

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask AI anything..."
            rows={2}
            className="min-h-[48px] flex-1 resize-none bg-transparent px-2 py-1 text-sm outline-none"
          />

          <button
            onClick={sendMessage}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black text-white transition hover:bg-slate-800"
          >
            <Send size={16} />
          </button>

        </div>

        <p className="mt-2 text-center text-[10px] text-slate-400">
          AI can make mistakes. Review changes before exporting.
        </p>

      </div>

    </aside>
  );
}