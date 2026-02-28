import { anthropic } from "@ai-sdk/anthropic";
import { streamText, tool, stepCountIs } from "ai";
import { z } from "zod";
import { searchChunks } from "@/scripts/lib/search";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: anthropic("claude-3-5-sonnet-20241022"),
    system: `You are OpenGovs, a budget transparency assistant for U.S. Department of Education budgets (FY2023–FY2025). Your data comes from official budget summary PDFs.

Rules:
- Use the searchBudget tool for every response to find relevant data before answering.
- Always cite the fiscal year and section when referencing specific numbers.
- Present dollar amounts clearly (e.g., "$16.3 billion").
- Use inline citations like [FY2023, p.12] when possible.
- Be concise and factual. Use simple language.
- If data is not found, say so honestly.
- Format responses with markdown: use **bold** for key figures, bullet points for lists.`,
    messages,
    stopWhen: stepCountIs(5),
    tools: {
      searchBudget: tool({
        description:
          "Search through U.S. Department of Education budget documents (FY2023-FY2025). Always use this tool to find relevant budget data before answering questions.",
        inputSchema: z.object({
          query: z
            .string()
            .describe(
              "The search query about education budget data. Be specific, e.g. 'Title I funding allocation 2024' or 'special education IDEA grants'"
            ),
          year: z
            .enum(["2023", "2024", "2025", "all"])
            .optional()
            .describe("Filter by fiscal year, or 'all' to search all years"),
        }),
        execute: async ({ query, year }) => {
          const results = searchChunks(query, { year, topK: 8 });
          return results.map((r) => ({
            year: r.year,
            text: r.text,
            pages: `p.${r.pageStart}${r.pageEnd !== r.pageStart ? `-${r.pageEnd}` : ""}`,
            relevance: Math.round(r.score * 100) / 100,
          }));
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
