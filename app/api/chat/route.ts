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
        system: `You are OpenGovs, a global government budget transparency assistant. You help citizens, journalists, researchers, and policymakers understand how public money is spent across multiple countries by analyzing official government budget documents.

        Available budget documents in this system:
        ${sourcesList}

        Countries covered: Australia, France, Japan, Philippines, Taiwan, USA
        Departments covered: Defence, Education, Healthcare, Finance, Overall Budget

        Rules:
        - ALWAYS use the searchBudget tool before answering any question about budget data. Never guess or make up figures.
        - Cite your source clearly: include the country, agency name, fiscal year, and page number (e.g., "[Philippines DOH FY2025, p.12]" or "[France MoD 2024, p.8]").
        - Present amounts in their local currency clearly (e.g., "₱2.4 billion PHP", "€16.3 billion", "$82 billion USD", "¥5.3 trillion JPY", "A$50 billion AUD", "NT$500 billion TWD").
        - When relevant, highlight cross-country comparisons — e.g. education spending as % of budget, per-capita defence spending.
        - If asked about a budget or country not in the available documents list above, say so honestly.
        - Be factual, clear, and concise. Use plain language accessible to the general public.
        - Format responses with markdown: use **bold** for key figures, bullet points for lists.
        - If the search returns no relevant results, say the data isn't available in the current documents rather than guessing.
        - Proactively highlight notable spending patterns, year-over-year changes, inefficiencies, and cross-country comparisons when relevant.
        - When comparing countries, be sensitive to differences in GDP, population size, and currency when contextualising figures.`,
        messages,
        stopWhen: stepCountIs(5),
        tools: {
                searchBudget: tool({
                          description:
                                      "Search through government budget documents from multiple countries. Always use this tool to find relevant budget data before answering questions. Returns the most relevant text chunks from the processed budget PDFs.",
                          inputSchema: z.object({
                                      query: z
                                        .string()
                                        .describe(
                                                        "The search query about budget data. Be specific, e.g. 'education spending 2024' or 'defence procurement costs' or 'healthcare budget allocation'"
                                                      ),
                                      year: z
                                        .string()
                                        .optional()
                                        .describe(
                                                        "Filter by fiscal year (e.g. '2024'), or omit to search all years"
                                                      ),
                                      country: z
                                        .string()
                                        .optional()
                                        .describe(
                                                        "Filter by country name (e.g. 'Philippines', 'France', 'Japan', 'Australia', 'Taiwan', 'USA') or omit to search all countries"
                                                      ),
                                      department: z
                                        .string()
                                        .optional()
                                        .describe(
                                                        "Filter by department/sector (e.g. 'Defence', 'Education', 'Healthcare', 'Finance') or omit to search all departments"
                                                      ),
                                      agency: z
                                        .string()
                                        .optional()
                                        .describe(
                                                        "Filter by agency short code (e.g. 'PHL-EDU', 'FRA-DEF') or omit to search all agencies"
                                                      ),
                          }),
                          execute: async ({ query, year, country, department, agency }) => {
                                      const results = searchChunks(query, { year, country, department, agency, topK: 8 });

                            if (results.length === 0) {
                                          return [{ message: "No relevant data found for this query in the available documents." }];
                            }

                            return results.map((r) => ({
                                          agency: r.agency,
                                          agencyShort: r.agencyShort,
                                          year: r.year,
                                          country: r.country,
                                          department: r.department,
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
