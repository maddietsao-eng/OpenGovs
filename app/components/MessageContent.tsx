import React from "react";

const MessageContent = ({ content }: { content: string }) => {
  const processContent = (text: string) => {
    text = text.replace(
      /^### (.*?)$/gm,
      '<span class="text-lg font-bold block mt-3 mb-1">$1</span>'
    );
    text = text.replace(
      /^## (.*?)$/gm,
      '<span class="text-xl font-bold block mt-4 mb-2">$1</span>'
    );
    text = text.replace(
      /^# (.*?)$/gm,
      '<span class="text-2xl font-bold block mt-4 mb-2">$1</span>'
    );

    text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
    text = text.replace(
      /(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g,
      "<em>$1</em>"
    );

    const bulletListPattern =
      /^(\s*[-*]\s+.*(?:\n\s*[-*]\s+.*)*)/gm;
    text = text.replace(
      bulletListPattern,
      '<ul class="list-disc pl-5 space-y-1 my-2">$1</ul>'
    );
    text = text.replace(
      /^\s*[-*]\s+(.*?)$/gm,
      "<li>$1</li>"
    );

    const numberedListPattern =
      /^(\s*\d+\.\s+.*(?:\n\s*\d+\.\s+.*)*)/gm;
    text = text.replace(
      numberedListPattern,
      '<ol class="list-decimal pl-5 space-y-1 my-2">$1</ol>'
    );
    text = text.replace(
      /^\s*\d+\.\s+(.*?)$/gm,
      "<li>$1</li>"
    );

    text = text.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline break-words">$1</a>'
    );

    text = text.replace(/\n/g, "<br />");

    return text;
  };

  return (
    <div
      className="markdown-content break-words overflow-hidden"
      dangerouslySetInnerHTML={{ __html: processContent(content) }}
    />
  );
};

export default MessageContent;
