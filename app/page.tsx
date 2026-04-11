"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRef, useState } from "react";
import MessageContent from "./components/MessageContent";
import SuggestedQuestions from "./components/SuggestedQuestions";
import ScoreCards from "./components/ScoreCards";

const COUNTRIES = [
  {
    name: "Australia",
    code: "AU",
    flag: "ð¦ðº",
    departments: ["Defence", "Healthcare", "Finance"],
    color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
    accent: "text-blue-700",
  },
  {
    name: "France",
    code: "FR",
    flag: "ð«ð·",
    departments: ["Defence", "Education", "Healthcare"],
    color: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100",
    accent: "text-indigo-700",
  },
  {
    name: "Japan",
    code: "JP",
    flag: "ð¯ðµ",
    departments: ["Defence", "Overall Budget"],
    color: "bg-red-50 border-red-200 hover:bg-red-100",
    accent: "text-red-700",
  },
  {
    name: "Philippines",
    code: "PH",
    flag: "ðµð­",
    departments: ["Education", "Defence", "Healthcare"],
    color: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100",
    accent: "text-yellow-700",
  },
  {
    name: "Taiwan",
    code: "TW",
    flag: "ð¹ð¼",
    departments: ["Healthcare"],
    color: "bg-green-50 border-green-200 hover:bg-green-100",
    accent: "text-green-700",
  },
  {
    name: "USA",
    code: "US",
    flag: "ðºð¸",
    departments: ["Education"],
    color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
    accent: "text-purple-700",
  },
];

const DEPT_ICONS: Record<string, string> = {
  Defence: "ð¡ï¸",
  Education: "ð",
  Healthcare: "ð¥",
  Finance: "ð°",
  "Overall Budget": "ð",
};

function CountryBrowser({
  onSelectQuestion,
  isLoading,
}: {
  onSelectQuestion: (q: string) => void;
  isLoading: boolean;
}) {
  const [activeCountry, setActiveCountry] = useState<string | null>(null);

  const handleDeptClick = (country: string, dept: string) => {
    onSelectQuestion(
      `What is the ${country} government's ${dept.toLowerCase()} budget? Give me the key figures and any notable spending priorities or changes.`
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-4 mb-2">
      <p className="text-center text-xs text-gray-400 uppercase tracking-wider mb-3 font-medium">
        Browse by Country
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
        {COUNTRIES.map((country) => (
          <button
            key={country.code}
            disabled={isLoading}
            onClick={() => setActiveCountry(activeCountry === country.code ? null : country.code)}
            className={`relative text-left rounded-xl border p-3 transition-all duration-150 cursor-pointer disabled:opacity-50 ${country.color}`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xl">{country.flag}</span>
              <span className={`font-semibold text-sm ${country.accent}`}>{country.name}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {country.departments.map((dept) => (
                <span
                  key={dept}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeptClick(country.name, dept);
                  }}
                  className="inline-flex items-center gap-0.5 text-[11px] bg-white/70 border border-white/80 rounded-full px-2 py-0.5 text-gray-600 hover:bg-white hover:text-gray-900 transition-colors cursor-pointer"
                >
                  {DEPT_ICONS[dept] || "ð"} {dept}
                </span>
              ))}
            </div>
            {activeCountry === country.code && (
              <div className="mt-2 pt-2 border-t border-white/60 flex flex-col gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); onSelectQuestion(`What are the biggest spending priorities in ${country.name}'s budget?`); }}
                  className="text-[11px] text-left text-gray-600 hover:text-gray-900 hover:underline"
                >
                  â Key priorities
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onSelectQuestion(`Are there any inefficiencies or concerns in ${country.name}'s government budget?`); }}
                  className="text-[11px] text-left text-gray-600 hover:text-gray-900 hover:underline"
                >
                  â Budget concerns
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onSelectQuestion(`How has ${country.name}'s budget changed year over year?`); }}
                  className="text-[11px] text-left text-gray-600 hover:text-gray-900 hover:underline"
                >
                  â Year-over-year changes
                </button>
              </div>
            )}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <button
          disabled={isLoading}
          onClick={() => onSelectQuestion("Compare healthcare spending across all available countries. Which country spends the most per capita?")}
          className="text-[11px] bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full px-3 py-1.5 transition-colors disabled:opacity-50"
        >
          ð Compare healthcare across countries
        </button>
        <button
          disabled={isLoading}
          onClick={() => onSelectQuestion("Which country spends the highest percentage of their budget on defence? Show me the figures.")}
          className="text-[11px] bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full px-3 py-1.5 transition-colors disabled:opacity-50"
        >
          ð¡ï¸ Compare defence spending
        </button>
        <button
          disabled={isLoading}
          onClick={() => onSelectQuestion("Compare education budgets across Philippines, France, and USA. What are the main differences?")}
          className="text-[11px] bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full px-3 py-1.5 transition-colors disabled:opacity-50"
        >
          ð Compare education spending
        </button>
      </div>
    </div>
  );
}

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
          <div className="flex items-center gap-3">
            <span className="hidden md:flex items-center gap-1.5 text-xs text-gray-500">
              ð¦ðº ð«ð· ð¯ðµ ðµð­ ð¹ð¼ ðºð¸
              <span className="font-medium text-gray-700">6 countries</span>
            </span>
            <a
              href="https://drive.google.com/drive/folders/1ftNbZbX7noyJbEOcXjWtD591n0_RdiIg?usp=sharing"
              target="_blank"
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-navy transition-colors"
            >
              <span className="underline">Source Documents</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      </div>

      {/* Chat Messages */}
      {hasMessages && (
        <div className="md:max-w-5xl mx-auto px-3 md:px-6 pt-16 md:pt-20 pb-24 space-y-4 md:space-y-6">
          {messages.map((message) => {
            const text = getMessageText(message);
            if (!text) return null;
            return (
              <div key={message.id}>
                <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
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
            <div className="text-center pb-4 md:pb-6 pt-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 bg-navy rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">OG</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-navy mb-3">OpenGovs</h1>
              <p className="text-base md:text-lg text-gray-600 mb-2 px-4 max-w-2xl mx-auto">
                AI-powered government budget transparency across 6 countries.
                <br className="hidden md:block" />
                Ask questions about public spending â get answers grounded in official documents.
              </p>
              <p className="text-sm text-gray-400 mb-4">
                ð¦ðº Australia &nbsp;Â·&nbsp; ð«ð· France &nbsp;Â·&nbsp; ð¯ðµ Japan &nbsp;Â·&nbsp; ðµð­ Philippines &nbsp;Â·&nbsp; ð¹ð¼ Taiwan &nbsp;Â·&nbsp; ðºð¸ USA
              </p>
            </div>
          )}

          {!hasMessages && <ScoreCards />}

          {hasMessages && (
            <div className="absolute -top-8 right-4 md:right-6">
              <a href="/" className="text-sm text-gray-500 hover:text-navy transition-colors duration-200">
                New chat â
              </a>
            </div>
          )}

          <form ref={formRef} onSubmit={handleSubmitForm} className="relative flex w-full max-w-3xl mx-auto">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoFocus
              placeholder="Ask about government spending across any country..."
              className="w-full p-3 md:p-4 pr-[100px] md:pr-[130px] bg-white border border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy text-sm md:text-base transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 md:px-6 py-2 md:py-2.5 bg-navy text-white rounded-full shadow-sm hover:bg-navy-light disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm md:text-base min-w-[80px] md:min-w-[110px] transition-all duration-200 hover:shadow-md active:scale-95"
            >
              Ask
            </button>
          </form>

          {!hasMessages && (
            <>
              <CountryBrowser onSelectQuestion={handleSelectQuestion} isLoading={isLoading} />
              <div className="mt-4 md:mt-6">
                <SuggestedQuestions onSelectQuestion={handleSelectQuestion} isLoading={isLoading} />
              </div>
              <div className="text-center pt-4 md:pt-6 pb-8 text-gray-500 text-xs md:text-sm">
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
                    <a href="https://www.anthropic.com" target="_blank" className="underline hover:text-navy">
                      Claude
                    </a>
                    {" + "}
                    <span className="font-medium">OpenGovs</span>
                    {" Â· "}
                    <span>23 documents across 6 countries</span>
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
