import React from "react";
import scoresData from "@/data/scores.json";

function gradeColor(grade: string): string {
  if (grade.startsWith("A")) return "text-gov-green";
  if (grade.startsWith("B")) return "text-blue-600";
  if (grade.startsWith("C")) return "text-gov-amber";
  return "text-gov-red";
}

function gradeBg(grade: string): string {
  if (grade.startsWith("A")) return "bg-green-50 border-green-200";
  if (grade.startsWith("B")) return "bg-blue-50 border-blue-200";
  if (grade.startsWith("C")) return "bg-amber-50 border-amber-200";
  return "bg-red-50 border-red-200";
}

function changeColor(num: number): string {
  if (num > 0) return "text-gov-green";
  if (num < 0) return "text-gov-red";
  return "text-gray-500";
}

const ScoreCards: React.FC = () => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 mb-6 md:mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        {scoresData.years.map((year) => (
          <div
            key={year.year}
            className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                FY {year.year}
              </span>
              <span
                className={`text-2xl md:text-3xl font-bold ${gradeColor(year.grade)} ${gradeBg(year.grade)} px-3 py-1 rounded-lg border`}
              >
                {year.grade}
              </span>
            </div>

            <div className="mb-3">
              <div className="text-2xl md:text-3xl font-bold text-navy">
                {year.totalBudget}
              </div>
              <div className={`text-sm font-medium ${changeColor(year.yoyChangeNum)}`}>
                {year.yoyChangeNum > 0 ? "↑" : year.yoyChangeNum < 0 ? "↓" : "→"}{" "}
                {year.yoyChange} YoY
              </div>
            </div>

            <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
              {year.insight}
            </p>
          </div>
        ))}
      </div>

      {scoresData.overallInsight && (
        <p className="text-center text-xs md:text-sm text-gray-500 mt-3 max-w-3xl mx-auto">
          {scoresData.overallInsight}
        </p>
      )}
    </div>
  );
};

export default ScoreCards;
