import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve(__dirname, "../data");

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY is required. Set it in .env.local or export it.");
    process.exit(1);
  }

  const summaries = JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, "year-summaries.json"), "utf-8")
  );

  const client = new Anthropic({ apiKey });

  const prompt = `You are analyzing U.S. Department of Education budget summaries for fiscal years 2023, 2024, and 2025.

For each year, extract or estimate:
1. Total discretionary budget request (in billions)
2. Year-over-year change percentage
3. A letter grade (A+ to F) reflecting budget ambition, equity focus, and investment growth
4. A one-sentence insight about the key theme of that year's budget
5. Top 5 spending categories with approximate amounts

Return ONLY valid JSON matching this exact structure:
{
  "years": [
    {
      "year": "2023",
      "totalBudget": "$X billion",
      "totalBudgetNum": X,
      "yoyChange": "+X%",
      "yoyChangeNum": X,
      "grade": "X",
      "insight": "...",
      "topCategories": [
        { "name": "...", "amount": "$XB" }
      ]
    }
  ],
  "overallInsight": "..."
}

Here are the budget summaries:

FY2023:
${summaries["2023"]}

FY2024:
${summaries["2024"]}

FY2025:
${summaries["2025"]}`;

  console.log("Calling Claude to generate budget scores...");
  const response = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("Failed to extract JSON from Claude response");
    console.error("Response:", text);
    process.exit(1);
  }

  const scores = JSON.parse(jsonMatch[0]);
  const outPath = path.join(DATA_DIR, "scores.json");
  fs.writeFileSync(outPath, JSON.stringify(scores, null, 2));
  console.log(`Wrote scores to ${outPath}`);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
