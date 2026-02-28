"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRef, useState } from "react";
import MessageContent from "./components/MessageContent";
import SuggestedQuestions from "./components/SuggestedQuestions";
import ScoreCards from "./components/ScoreCards";

export default function Page() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });
  const [input, setInput] = useState("");
  const hasMessages = messages.length > 0;
  const formRef = useRef<HTMLFormElement>(null);
  const isLoading = status === "streaming" || status === "submitted";

  const handleSelectQuestion = (question: string) => {
    setInput("");
    sendMessage({ text: question });
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage({ text: input });
      setInput("");
    }
  };

  function getMessageText(message: { parts: Array<{ type: string; text?: string }> }): string {
    return message.parts
      .filter((p) => p.type === "text")
      .map((p) => p.text || "")
      .join("");
  }

  return (
    <>
      {/* Top Navigation */}
      <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="md:max-w-5xl mx-auto px-3 md:px-6 py-2.5 flex justify-between items-center">
          <a href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-navy rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">OG</span>
            </div>
            <span className="font-semibold text-navy text-lg">OpenGovs</span>
          </a>
          <a
            href="https://drive.google.com/drive/folders/1KWb1V0Oi3NIzXS_TgKlfRZdk11vNQqjU"
            target="_blank"
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-navy transition-colors"
          >
            <span className="underline">View Data Source</span>
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      </div>

      {/* Chat Messages */}
      {hasMessages && (
        <div className="md:max-w-5xl mx-auto px-3 md:px-6 pt-16 md:pt-20 pb-24 space-y-4 md:space-y-6">
          {messages.map((message) => {
            const text = getMessageText(message);
            if (!text) return null;
            return (
              <div key={message.id}>
                <div
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`rounded-lg py-2.5 md:py-3 px-3 md:px-4 max-w-[90%] md:max-w-[85%] ${
                      message.role === "user"
                        ? "bg-navy/10 text-navy-dark text-sm md:text-base"
                        : "text-gray-900 text-sm md:text-base"
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-[14px] md:text-[15px] break-words overflow-hidden">
                      <MessageContent content={text} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-1.5 text-gray-500 animate-pulse ml-4 mb-6">
              <div className="w-2 h-2 rounded-full bg-navy/40 animate-[bounce_1s_infinite]" />
              <div className="w-2 h-2 rounded-full bg-navy/40 animate-[bounce_1s_infinite_200ms]" />
              <div className="w-2 h-2 rounded-full bg-navy/40 animate-[bounce_1s_infinite_400ms]" />
            </div>
          )}
        </div>
      )}

      {/* Input Form */}
      <div
        className={`${
          hasMessages
            ? "fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-200"
            : "flex flex-col items-center justify-center bg-transparent"
        } z-40 transition-all duration-300 ${!hasMessages ? "mt-20 md:mt-24" : ""}`}
      >
        <div
          className={`${
            hasMessages
              ? "w-full md:max-w-5xl mx-auto px-4 md:px-6 py-4 relative"
              : "w-full md:max-w-3xl mx-auto px-4 md:px-6"
          }`}
        >
          {!hasMessages && (
            <div className="text-center pb-6 md:pb-8 pt-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 bg-navy rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">OG</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-navy mb-3">
                OpenGovs
              </h1>
              <p className="text-base md:text-lg text-gray-600 mb-6 px-4 max-w-2xl mx-auto">
                Explore U.S. Department of Education budgets (FY2023–2025).
                <br className="hidden md:block" />
                AI-powered transparency for public spending.
              </p>
            </div>
          )}

          {!hasMessages && <ScoreCards />}

          {hasMessages && (
            <div className="absolute -top-8 right-4 md:right-6">
              <a
                href="/"
                className="text-sm text-gray-500 hover:text-navy transition-colors duration-200"
              >
                New chat ↗
              </a>
            </div>
          )}

          <form
            ref={formRef}
            onSubmit={handleSubmitForm}
            className="relative flex w-full max-w-3xl mx-auto"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoFocus
              placeholder="Ask about education budgets..."
              className="w-full p-3 md:p-4 pr-[100px] md:pr-[130px] bg-white border border-gray-200 rounded-full shadow-sm 
                focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy 
                text-sm md:text-base transition-all duration-200 
                placeholder:text-gray-400 hover:border-gray-300"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 md:px-6 py-2 md:py-2.5 
                bg-navy text-white rounded-full shadow-sm hover:bg-navy-light 
                disabled:opacity-50 disabled:cursor-not-allowed 
                font-medium text-sm md:text-base min-w-[80px] md:min-w-[110px] 
                transition-all duration-200 hover:shadow-md active:scale-95"
            >
              Ask
            </button>
          </form>

          {!hasMessages && (
            <>
              <div className="mt-6 md:mt-8">
                <SuggestedQuestions
                  onSelectQuestion={handleSelectQuestion}
                  isLoading={isLoading}
                />
              </div>

              <div className="text-center pt-6 md:pt-8 pb-8 text-gray-500 text-xs md:text-sm">
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <span>Searching budget data</span>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-[bounce_1s_infinite]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-[bounce_1s_infinite_200ms]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-[bounce_1s_infinite_400ms]" />
                    </div>
                  </div>
                ) : (
                  <span>
                    powered by{" "}
                    <a
                      href="https://www.anthropic.com"
                      target="_blank"
                      className="underline hover:text-navy"
                    >
                      Claude
                    </a>
                    {" + "}
                    <span className="font-medium">OpenGovs</span>
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
