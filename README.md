# OpenGovs - Public Budget Transparency

AI-powered exploration of U.S. Department of Education budgets (FY2023–2025). Ask questions about education spending and get answers backed by official budget summary documents.

## Tech Stack

- **Framework**: Next.js 14, App Router, TypeScript
- **Styling**: TailwindCSS
- **AI**: Vercel AI SDK + Anthropic Claude
- **Search**: BM25 relevance scoring over pre-processed PDF chunks
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- Anthropic API key

### Installation

```bash
git clone <repo-url>
cd opengovs
npm install
```

### Environment Setup

```bash
cp .env.example .env.local
# Edit .env.local and add your ANTHROPIC_API_KEY
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Data Pipeline

Budget data is pre-processed from PDFs hosted on [Google Drive](https://drive.google.com/drive/folders/1KWb1V0Oi3NIzXS_TgKlfRZdk11vNQqjU). The processed data is committed to the repo in `data/`.

To re-process the PDFs (only needed if source data changes):

```bash
npm run process-pdfs
```

## Project Structure

```
app/
  page.tsx              # Landing page with score cards + chat
  layout.tsx            # Root layout
  api/chat/route.ts     # Chat API (Claude + searchBudget tool)
  components/           # UI components
data/
  chunks.json           # Pre-processed PDF text chunks
  scores.json           # Budget score cards data
scripts/
  process-pdfs.ts       # PDF download & extraction pipeline
  lib/search.ts         # BM25 search over chunks
```
