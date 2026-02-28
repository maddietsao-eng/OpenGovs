import fs from "fs";
import path from "path";

export interface Chunk {
  id: string;
  year: string;
  text: string;
  pageStart: number;
  pageEnd: number;
  chunkIndex: number;
}

interface SearchResult {
  id: string;
  year: string;
  text: string;
  pageStart: number;
  pageEnd: number;
  score: number;
}

let _chunks: Chunk[] | null = null;
let _idf: Map<string, number> | null = null;
let _docFreq: Map<string, number> | null = null;

function loadChunks(): Chunk[] {
  if (_chunks) return _chunks;
  const chunksPath = path.resolve(__dirname, "../../data/chunks.json");
  _chunks = JSON.parse(fs.readFileSync(chunksPath, "utf-8")) as Chunk[];
  return _chunks;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

function buildIdf(): { idf: Map<string, number>; docFreq: Map<string, number> } {
  if (_idf && _docFreq) return { idf: _idf, docFreq: _docFreq };

  const chunks = loadChunks();
  const df = new Map<string, number>();

  for (const chunk of chunks) {
    const seen = new Set(tokenize(chunk.text));
    for (const term of Array.from(seen)) {
      df.set(term, (df.get(term) || 0) + 1);
    }
  }

  const N = chunks.length;
  const idf = new Map<string, number>();
  for (const [term, freq] of df) {
    idf.set(term, Math.log((N - freq + 0.5) / (freq + 0.5) + 1));
  }

  _idf = idf;
  _docFreq = df;
  return { idf, docFreq: df };
}

function bm25Score(
  queryTokens: string[],
  docTokens: string[],
  idf: Map<string, number>,
  avgDl: number,
  k1 = 1.5,
  b = 0.75
): number {
  const dl = docTokens.length;
  const tf = new Map<string, number>();

  for (const token of docTokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }

  let score = 0;
  for (const term of queryTokens) {
    const termFreq = tf.get(term) || 0;
    const termIdf = idf.get(term) || 0;
    const numerator = termFreq * (k1 + 1);
    const denominator = termFreq + k1 * (1 - b + b * (dl / avgDl));
    score += termIdf * (numerator / denominator);
  }

  return score;
}

export function searchChunks(
  query: string,
  options: { year?: string; topK?: number } = {}
): SearchResult[] {
  const { year, topK = 8 } = options;
  const chunks = loadChunks();
  const { idf } = buildIdf();

  let filtered = chunks;
  if (year && year !== "all") {
    filtered = chunks.filter((c) => c.year === year);
  }

  const queryTokens = tokenize(query);
  const avgDl =
    filtered.reduce((sum, c) => sum + tokenize(c.text).length, 0) /
    (filtered.length || 1);

  const scored = filtered.map((chunk) => {
    const docTokens = tokenize(chunk.text);
    const score = bm25Score(queryTokens, docTokens, idf, avgDl);
    return {
      id: chunk.id,
      year: chunk.year,
      text: chunk.text,
      pageStart: chunk.pageStart,
      pageEnd: chunk.pageEnd,
      score,
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}
