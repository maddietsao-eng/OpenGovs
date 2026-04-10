import { anthropic } from "@ai-sdk/anthropic";
import { streamText, tool, stepCountIs, convertToModelMessages } from "ai";
import { z } from "zod";
import { searchChunks, getAvailableSources } from "@/scripts/lib/search";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages: uiMessages } = await req.json();
  const messages = await convertToModelMessages(uiMessages);

  // Dynamically build context about which documents are available
  const sources = getAvailableSources();
  const sourcesList = sources
    .map((s) => `- ${s.agency} (${s.agencyShort}), FY${s.year}`)
    .join("\n");

  const result = streamText({
    model: anthropic("claude-opus-4-6"),
    system: `You are OpenGovs, a government budget transparency assistant. You help citizens, journalists, and researchers understand how public money is being spent by analyzing official government budget documents.

Available budget documents in this system:
${sourcesList}

Rules:
- ALWAYS use the searchBudget tool before answering any question about budget data. Never guess or make up figures.
- Cite your source clearly: include the agency name, fiscal year, and page number (e.g., "[DOE FY2024, p.12]").
- Present dollar amounts clearly (e.g., "$16.3 billion" or "$2.4 million").
- If asked about a budget not in the available documents list above, say so honestly and suggest the user can add it via the data source.
- Be factual, clear, and concise. Use plain language accessible to the general public.
- Format responses with markdown: use **bold** for key figures, bullet points for lists.
- If the search returns no relevant results, say the data isn't available in the current documents rather than guessing.
- When you spot notable spending patterns, inefficiencies, or interesting comparisons between agencies or years, point them out proactively.`,
    messages,
    stopWhen: stepCountIs(5),
    tools: {
      searchBudget: tool({
        description:
          "Search through government budget documents. Always use this tool to find relevant budget data before answering questions. Returns the most relevant text chunks from the processed budget PDFs.",
        inputSchema: z.object({
          query: z
            .string()
            .describe(
              "The search query about budget data. Be specific, e.g. 'Title I funding allocation 2024' or 'administrative overhead costs'"
            ),
          year: z
            .string()
            .optional()
            .describe(
              "Filter by fiscal year (e.g. '2024'), or omit to search all years"
            ),
          agency: z
            .string()
            .optional()
            .describe(
              "Filter by agency short code (e.g. 'DOE') or omit to search all agencies"
            ),
        }),
        execute: async ({ query, year, agency }) => {
          const results = searchChunks(query, { year, agency, topK: 8 });

          if (results.length === 0) {
            return [{ message: "No relevant data found for this query in the available documents." }];
          }

          return results.map((r) => ({
            agency: r.agency,
            agencyShort: r.agencyShort,
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
