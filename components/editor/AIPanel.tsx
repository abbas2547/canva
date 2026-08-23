"use client";

import {
  Bot,
  Sparkles,
  Send,
  X,
  Trash2,
  Wand2,
  Copy,
  Layers,
  Palette,
  Type,
  Circle,
  Square,
  Triangle,
  Minus,
  Eraser,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  MessageCircle,
  Zap,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useEditorStore } from "@/store/editorStore";

type Message = {
  id: number;
  role: "user" | "assistant";
  text: string;
};

const suggestions = [
  {
    label: "✨ Make it professional",
    prompt: "Make my design more professional",
  },
  {
    label: "🎨 Better colors",
    prompt: "Suggest better colors",
  },
  {
    label: "🔤 Add heading",
    prompt: "Create a modern heading",
  },
  {
    label: "🖼 Improve image",
    prompt: "Improve this image",
  },
];

export default function AIPanel() {
  // ============================================================
  // STORE
  // ============================================================

  const canvas =
    useEditorStore(
      (state) => state.canvas
    );

  const refreshLayers =
    useEditorStore(
      (state) => state.refreshLayers
    );

  const saveHistory =
    useEditorStore(
      (state) => state.saveHistory
    );

  // ============================================================
  // STATE
  // ============================================================

  const [message, setMessage] =
    useState("");

  const [isTyping, setIsTyping] =
    useState(false);

  const [messages, setMessages] =
    useState<Message[]>([
      {
        id: 1,
        role: "assistant",
        text:
          "Hi! I'm Mini AI. I can help you edit your canvas, add elements, change colors, manage layers, and improve your design.",
      },
    ]);

  // ============================================================
  // REFS
  // ============================================================

  const messagesEndRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const textareaRef =
    useRef<HTMLTextAreaElement | null>(
      null
    );

  // ============================================================
  // AUTO SCROLL
  // ============================================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  // ============================================================
  // DISPATCH EVENT
  // ============================================================

  const dispatch = (
    eventName: string,
    detail?: unknown
  ) => {
    if (
      typeof window === "undefined"
    ) {
      return;
    }

    window.dispatchEvent(
      new CustomEvent(eventName, {
        detail,
      })
    );
  };

  // ============================================================
  // ADD MESSAGE
  // ============================================================

  const addMessage = (
    role: "user" | "assistant",
    text: string
  ) => {
    setMessages((previous) => [
      ...previous,
      {
        id:
          Date.now() +
          Math.random(),
        role,
        text,
      },
    ]);
  };

  // ============================================================
  // AI COMMAND PROCESSOR
  // ============================================================

  const executeAICommand = (
    command: string
  ): string => {
    const text =
      command.toLowerCase().trim();

    // ----------------------------------------------------------
    // ADD TEXT
    // ----------------------------------------------------------

    if (
      text.includes("heading") ||
      text.includes("add text") ||
      text.includes("create text") ||
      text.includes("title")
    ) {
      dispatch("editor:add-text");

      return "I've added a new heading to your canvas.";
    }

    // ----------------------------------------------------------
    // RECTANGLE
    // ----------------------------------------------------------

    if (
      text.includes("rectangle") ||
      text.includes("square")
    ) {
      dispatch(
        "editor:add-rectangle"
      );

      return "I've added a rectangle to your canvas.";
    }

    // ----------------------------------------------------------
    // CIRCLE
    // ----------------------------------------------------------

    if (
      text.includes("circle")
    ) {
      dispatch(
        "editor:add-circle"
      );

      return "I've added a circle to your canvas.";
    }

    // ----------------------------------------------------------
    // TRIANGLE
    // ----------------------------------------------------------

    if (
      text.includes("triangle")
    ) {
      dispatch(
        "editor:add-triangle"
      );

      return "I've added a triangle to your canvas.";
    }

    // ----------------------------------------------------------
    // LINE
    // ----------------------------------------------------------

    if (
      text.includes("line")
    ) {
      dispatch(
        "editor:add-line"
      );

      return "I've added a line to your canvas.";
    }

    // ----------------------------------------------------------
    // STICKERS
    // ----------------------------------------------------------

    if (
      text.includes("sticker") ||
      text.includes("emoji")
    ) {
      dispatch(
        "editor:add-sticker",
        {
          emoji: "✨",
        }
      );

      return "I've added a ✨ sticker to your canvas.";
    }

    // ----------------------------------------------------------
    // BACKGROUND COLORS
    // ----------------------------------------------------------

    if (
      text.includes("white background")
    ) {
      dispatch(
        "editor:set-background",
        {
          color: "#ffffff",
        }
      );

      return "I've changed the background to white.";
    }

    if (
      text.includes("black background")
    ) {
      dispatch(
        "editor:set-background",
        {
          color: "#000000",
        }
      );

      return "I've changed the background to black.";
    }

    if (
      text.includes("blue background")
    ) {
      dispatch(
        "editor:set-background",
        {
          color: "#eef2ff",
        }
      );

      return "I've changed the background to a soft blue.";
    }

    if (
      text.includes("pink background")
    ) {
      dispatch(
        "editor:set-background",
        {
          color: "#fdf2f8",
        }
      );

      return "I've changed the background to a soft pink.";
    }

    if (
      text.includes("green background")
    ) {
      dispatch(
        "editor:set-background",
        {
          color: "#ecfdf5",
        }
      );

      return "I've changed the background to a soft green.";
    }

    // ----------------------------------------------------------
    // DELETE
    // ----------------------------------------------------------

    if (
      text.includes("delete") ||
      text.includes("remove")
    ) {
      if (!canvas) {
        return "The canvas is not ready yet.";
      }

      const activeObject =
        canvas.getActiveObject();

      if (!activeObject) {
        return "Please select an object first.";
      }

      canvas.remove(activeObject);

      canvas.discardActiveObject();

      canvas.renderAll();

      saveHistory();
      refreshLayers();

      return "I've removed the selected object.";
    }

    // ----------------------------------------------------------
    // DUPLICATE
    // ----------------------------------------------------------

    if (
      text.includes("duplicate") ||
      text.includes("copy")
    ) {
      if (!canvas) {
        return "The canvas is not ready yet.";
      }

      const activeObject =
        canvas.getActiveObject();

      if (!activeObject) {
        return "Please select an object first.";
      }

      activeObject
        .clone()
        .then((cloned) => {
          cloned.set({
            left:
              (activeObject.left ?? 0) +
              30,

            top:
              (activeObject.top ?? 0) +
              30,
          });

          canvas.add(cloned);

          canvas.setActiveObject(
            cloned
          );

          canvas.renderAll();

          saveHistory();
          refreshLayers();
        });

      return "I've duplicated the selected object.";
    }

    // ----------------------------------------------------------
    // BRING FORWARD
    // ----------------------------------------------------------

    if (
      text.includes("bring forward") ||
      text.includes("move forward")
    ) {
      if (!canvas) {
        return "The canvas is not ready yet.";
      }

      const object =
        canvas.getActiveObject();

      if (!object) {
        return "Please select an object first.";
      }

      canvas.bringObjectForward(
        object
      );

      canvas.renderAll();

      saveHistory();
      refreshLayers();

      return "I've brought the selected object forward.";
    }

    // ----------------------------------------------------------
    // SEND BACKWARD
    // ----------------------------------------------------------

    if (
      text.includes("send backward") ||
      text.includes("move backward")
    ) {
      if (!canvas) {
        return "The canvas is not ready yet.";
      }

      const object =
        canvas.getActiveObject();

      if (!object) {
        return "Please select an object first.";
      }

      canvas.sendObjectBackwards(
        object
      );

      canvas.renderAll();

      saveHistory();
      refreshLayers();

      return "I've sent the selected object backward.";
    }

    // ----------------------------------------------------------
    // DESELECT
    // ----------------------------------------------------------

    if (
      text.includes("deselect") ||
      text.includes("unselect")
    ) {
      if (!canvas) {
        return "The canvas is not ready yet.";
      }

      canvas.discardActiveObject();

      canvas.renderAll();

      refreshLayers();

      return "I've deselected the current object.";
    }

    // ----------------------------------------------------------
    // CLEAR CANVAS
    // ----------------------------------------------------------

    if (
      text.includes("clear canvas") ||
      text.includes("remove everything") ||
      text.includes("delete everything")
    ) {
      if (!canvas) {
        return "The canvas is not ready yet.";
      }

      canvas.clear();

      canvas.backgroundColor = "#ffffff";
      canvas.renderAll();

      saveHistory();
      refreshLayers();

      return "I've cleared the canvas and reset the background.";
    }

    // ----------------------------------------------------------
    // PROFESSIONAL
    // ----------------------------------------------------------

    if (
      text.includes("professional") ||
      text.includes("modern") ||
      text.includes("better design")
    ) {
      return (
        "For a more professional design, I'd recommend a simple layout, strong typography, consistent spacing, and a maximum of 2–3 main colors. I can also help you build those pieces one by one."
      );
    }

    // ----------------------------------------------------------
    // COLORS
    // ----------------------------------------------------------

    if (
      text.includes("color") ||
      text.includes("colours")
    ) {
      return (
        "Try using one primary color, one accent color, and neutral white/gray. For a modern SaaS style, indigo + slate + white works very well."
      );
    }

    // ----------------------------------------------------------
    // IMAGE
    // ----------------------------------------------------------

    if (
      text.includes("image") ||
      text.includes("photo")
    ) {
      return (
        "I can help you work with images. You can upload an image from the Uploads panel, then select it on the canvas for further editing."
      );
    }

    // ----------------------------------------------------------
    // HELP
    // ----------------------------------------------------------

    if (
      text === "help" ||
      text.includes("what can you do") ||
      text.includes("commands")
    ) {
      return (
        "I can currently add text, rectangles, circles, triangles, lines and stickers; change backgrounds; delete or duplicate selected objects; move layers forward/backward; clear the canvas; and give design suggestions."
      );
    }

    // ----------------------------------------------------------
    // DEFAULT
    // ----------------------------------------------------------

    return (
      "I understand your request. Right now I'm working as your canvas design assistant. Try commands like “add a circle”, “add heading”, “delete selected object”, “duplicate”, “change background to blue”, or “clear canvas”."
    );
  };

  // ============================================================
  // SEND MESSAGE
  // ============================================================

  const sendMessage = () => {
    const trimmed =
      message.trim();

    if (!trimmed || isTyping) {
      return;
    }

    addMessage(
      "user",
      trimmed
    );

    setMessage("");

    setIsTyping(true);

    // Small delay makes it feel like an assistant.
    setTimeout(() => {
      const response =
        executeAICommand(trimmed);

      setIsTyping(false);

      addMessage(
        "assistant",
        response
      );
    }, 500);
  };

  // ============================================================
  // CLEAR CHAT
  // ============================================================

  const clearChat = () => {
    setMessages([
      {
        id: Date.now(),
        role: "assistant",
        text:
          "Chat cleared. What would you like to create?",
      },
    ]);
  };

  // ============================================================
// USE SUGGESTION
// ============================================================

  const handleSuggestion = (
    prompt: string
  ) => {
    setMessage(prompt);

    textareaRef.current?.focus();
  };

  // ============================================================
  // QUICK ACTIONS
  // ============================================================

  const quickAddText = () => {
    dispatch("editor:add-text");

    addMessage(
      "assistant",
      "I've added text to your canvas."
    );
  };

  const quickAddRectangle = () => {
    dispatch(
      "editor:add-rectangle"
    );

    addMessage(
      "assistant",
      "I've added a rectangle."
    );
  };

  const quickAddCircle = () => {
    dispatch(
      "editor:add-circle"
    );

    addMessage(
      "assistant",
      "I've added a circle."
    );
  };

  const quickAddSticker = () => {
    dispatch(
      "editor:add-sticker",
      {
        emoji: "✨",
      }
    );

    addMessage(
      "assistant",
      "I've added a sparkle sticker."
    );
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div
      className="
        flex
        h-full
        w-full
        min-w-0
        flex-col
        bg-white
        text-slate-900
      "
    >

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div
        className="
          flex
          h-[68px]
          shrink-0
          items-center
          justify-between
          border-b
          border-slate-200
          bg-white
          px-4
        "
      >

        <div className="flex items-center gap-3">

          <div
            className="
              relative
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-slate-900
              text-white
              shadow-sm
            "
          >
            <Sparkles size={18} />

            <span
              className="
                absolute
                -right-0.5
                -top-0.5
                h-2.5
                w-2.5
                rounded-full
                bg-emerald-500
                ring-2
                ring-white
              "
            />
          </div>

          <div>
            <div className="flex items-center gap-2">

              <p className="text-sm font-bold text-slate-950">
                Mini AI
              </p>

              <span
                className="
                  rounded-full
                  bg-emerald-50
                  px-2
                  py-0.5
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-wide
                  text-emerald-700
                "
              >
                Online
              </span>

            </div>

            <p className="text-[11px] font-medium text-slate-500">
              Your design assistant
            </p>
          </div>

        </div>

        <div className="flex items-center gap-1">

          <button
            type="button"
            onClick={clearChat}
            title="Clear chat"
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              text-slate-500
              transition
              hover:bg-slate-100
              hover:text-slate-900
            "
          >
            <Trash2 size={16} />
          </button>

          <button
            type="button"
            onClick={() => {
              useEditorStore.getState().setShowAIChat(false);
              useEditorStore.getState().setRightPanel("properties");
            }}
            title="Close AI chat"
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              text-slate-500
              transition
              hover:bg-slate-100
              hover:text-slate-900
            "
          >
            <X size={17} />
          </button>

        </div>

      </div>

      {/* ======================================================
          CHAT
      ====================================================== */}

      <div
        className="
          min-h-0
          flex-1
          overflow-y-auto
          bg-slate-50/70
          px-4
          py-5
        "
      >

        {/* AI CAPABILITY CARD */}

        <div
          className="
            mb-5
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-4
            shadow-sm
          "
        >

          <div className="mb-3 flex items-center gap-2">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Wand2 size={15} />
            </div>

            <div>
              <p className="text-xs font-bold text-slate-950">
                Design with AI
              </p>

              <p className="text-[10px] font-medium text-slate-500">
                Ask me to edit your canvas
              </p>
            </div>

          </div>

          <div className="grid grid-cols-2 gap-2">

            <button
              type="button"
              onClick={quickAddText}
              className="
                flex
                items-center
                gap-2
                rounded-lg
                border
                border-slate-200
                bg-white
                px-2.5
                py-2
                text-left
                text-[10px]
                font-semibold
                text-slate-700
                transition
                hover:border-slate-300
                hover:bg-slate-50
              "
            >
              <Type size={13} />
              Add text
            </button>

            <button
              type="button"
              onClick={quickAddRectangle}
              className="
                flex
                items-center
                gap-2
                rounded-lg
                border
                border-slate-200
                bg-white
                px-2.5
                py-2
                text-left
                text-[10px]
                font-semibold
                text-slate-700
                transition
                hover:border-slate-300
                hover:bg-slate-50
              "
            >
              <Square size={13} />
              Rectangle
            </button>

            <button
              type="button"
              onClick={quickAddCircle}
              className="
                flex
                items-center
                gap-2
                rounded-lg
                border
                border-slate-200
                bg-white
                px-2.5
                py-2
                text-left
                text-[10px]
                font-semibold
                text-slate-700
                transition
                hover:border-slate-300
                hover:bg-slate-50
              "
            >
              <Circle size={13} />
              Circle
            </button>

            <button
              type="button"
              onClick={quickAddSticker}
              className="
                flex
                items-center
                gap-2
                rounded-lg
                border
                border-slate-200
                bg-white
                px-2.5
                py-2
                text-left
                text-[10px]
                font-semibold
                text-slate-700
                transition
                hover:border-slate-300
                hover:bg-slate-50
              "
            >
              <Sparkles size={13} />
              Sticker
            </button>

          </div>

        </div>

        {/* MESSAGES */}

        <div className="space-y-4">

          {messages.map((item) => {

            const isUser =
              item.role === "user";

            return (
              <div
                key={item.id}
                className={`flex gap-2.5 ${
                  isUser
                    ? "justify-end"
                    : "justify-start"
                }`}
              >

                {!isUser && (
                  <div
                    className="
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      bg-slate-900
                      text-white
                      shadow-sm
                    "
                  >
                    <Bot size={15} />
                  </div>
                )}

                <div
                  className={`
                    max-w-[85%]
                    rounded-2xl
                    px-3.5
                    py-3
                    text-xs
                    leading-5
                    shadow-sm
                    ${
                      isUser
                        ? `
                          rounded-br-md
                          bg-slate-900
                          font-medium
                          text-white
                        `
                        : `
                          rounded-tl-md
                          border
                          border-slate-200
                          bg-white
                          font-medium
                          text-slate-800
                        `
                    }
                  `}
                >
                  {item.text}
                </div>

              </div>
            );
          })}

          {/* TYPING */}

          {isTyping && (
            <div className="flex items-center gap-2.5">

              <div
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  bg-slate-900
                  text-white
                "
              >
                <Bot size={15} />
              </div>

              <div
                className="
                  flex
                  items-center
                  gap-1
                  rounded-2xl
                  rounded-tl-md
                  border
                  border-slate-200
                  bg-white
                  px-4
                  py-3
                  shadow-sm
                "
              >
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:120ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:240ms]" />
              </div>

            </div>
          )}

        </div>

        <div ref={messagesEndRef} />

        {/* SUGGESTIONS */}

        <div className="mt-6">

          <div className="mb-2 flex items-center gap-2">

            <Sparkles
              size={13}
              className="text-slate-500"
            />

            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Try asking
            </p>

          </div>

          <div className="space-y-2">

            {suggestions.map(
              (suggestion) => (
                <button
                  key={suggestion.prompt}
                  type="button"
onClick={() =>
                  handleSuggestion(
                    suggestion.prompt
                  )
                }
                  className="
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-3
                    py-2.5
                    text-left
                    text-[11px]
                    font-semibold
                    text-slate-700
                    shadow-sm
                    transition
                    hover:border-slate-300
                    hover:bg-slate-50
                    hover:text-slate-950
                  "
                >
                  {suggestion.label}
                </button>
              )
            )}

          </div>

        </div>

      </div>

      {/* ======================================================
          INPUT
      ====================================================== */}

      <div
        className="
          shrink-0
          border-t
          border-slate-200
          bg-white
          p-3
        "
      >

        <div
          className="
            rounded-2xl
            border
            border-slate-300
            bg-white
            shadow-sm
            transition
            focus-within:border-slate-500
            focus-within:ring-2
            focus-within:ring-slate-100
          "
        >

          <textarea
            ref={textareaRef}
            value={message}
            onChange={(event) =>
              setMessage(
                event.target.value
              )
            }
            onKeyDown={(event) => {

              if (
                event.key ===
                  "Enter" &&
                !event.shiftKey
              ) {
                event.preventDefault();

                sendMessage();
              }
            }}
            placeholder="Ask Mini AI..."
            rows={2}
            maxLength={1000}
            className="
              block
              min-h-[58px]
              w-full
              resize-none
              bg-transparent
              px-3
              pt-3
              text-xs
              font-medium
              text-slate-900
              outline-none
              placeholder:text-slate-400
            "
          />

          <div
            className="
              flex
              items-center
              justify-between
              px-2
              pb-2
              pl-3
            "
          >

            <div className="flex items-center gap-2">

              <span
                className="
                  flex
                  items-center
                  gap-1
                  text-[9px]
                  font-medium
                  text-slate-400
                "
              >
                <Zap size={10} />
                AI editor
              </span>

              <span className="text-[9px] text-slate-300">
                {message.length}/1000
              </span>

            </div>

            <button
              type="button"
              onClick={sendMessage}
              disabled={
                !message.trim() ||
                isTyping
              }
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-lg
                bg-slate-900
                text-white
                transition
                hover:bg-slate-700
                disabled:cursor-not-allowed
                disabled:opacity-30
              "
            >
              <Send size={14} />
            </button>

          </div>

        </div>

        <p
          className="
            mt-2
            text-center
            text-[9px]
            font-medium
            text-slate-400
          "
        >
          Enter to send • Shift + Enter for new line
        </p>

      </div>

    </div>
  );
}