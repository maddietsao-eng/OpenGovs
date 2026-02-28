import React from "react";

interface SuggestedQuestionsProps {
  onSelectQuestion: (question: string) => void;
  isLoading?: boolean;
}

const questions = [
  "How has the Department of Education budget changed from 2023 to 2025?",
  "What are the top spending categories in FY2024?",
  "How much is allocated for special education (IDEA) across all years?",
  "Compare Title I funding across all three fiscal years",
];

const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({
  onSelectQuestion,
  isLoading = false,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 max-w-4xl mx-auto px-2">
      {questions.map((question, index) => (
        <button
          key={index}
          onClick={() => onSelectQuestion(question)}
          disabled={isLoading}
          className={`w-full p-3 md:p-4 bg-white border border-gray-200 rounded-lg text-left 
            hover:border-navy/30 hover:shadow-sm transition-all duration-200 hover:-translate-y-0.5 
            flex justify-between items-center group
            ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <span className="text-sm md:text-base text-gray-700 font-medium group-hover:text-navy">
            {question}
          </span>
          <svg
            className="w-4 h-4 text-gray-400 group-hover:text-navy flex-shrink-0 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      ))}
    </div>
  );
};

export default SuggestedQuestions;
