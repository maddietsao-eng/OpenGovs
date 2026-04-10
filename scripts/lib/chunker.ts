export interface Chunk {
  id: string;
  year: string;
  agency: string;
  agencyShort: string;
  text: string;
  pageStart: number;
  pageEnd: number;
  chunkIndex: number;
}

const TARGET_CHUNK_SIZE = 500;
const OVERLAP = 50;

function estimateTokens(text: string): number {
  return Math.ceil(text.split(/\s+/).length * 1.3);
}

export function chunkText(
  fullText: string,
  year: string,
  pages: { pageNum: number; text: string }[],
  agency: string = "Unknown Agency",
  agencyShort: string = "GOV"
): Chunk[] {
  const chunks: Chunk[] = [];
  let chunkIndex = 0;

  let buffer = "";
  let bufferPageStart = 1;
  let bufferPageEnd = 1;

  const agencySlug = agencyShort.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

  for (const page of pages) {
    const cleaned = page.text.replace(/\s+/g, " ").trim();
    if (!cleaned) continue;

    buffer += (buffer ? " " : "") + cleaned;
    bufferPageEnd = page.pageNum;

    while (estimateTokens(buffer) > TARGET_CHUNK_SIZE) {
      const words = buffer.split(/\s+/);
      const cutoff = Math.floor(TARGET_CHUNK_SIZE / 1.3);
      const chunkWords = words.slice(0, cutoff);
      const remaining = words.slice(cutoff - OVERLAP);

      chunks.push({
        id: `${agencySlug}-${year}-${chunkIndex}`,
        year,
        agency,
        agencyShort,
        text: chunkWords.join(" "),
        pageStart: bufferPageStart,
        pageEnd: bufferPageEnd,
        chunkIndex,
      });

      chunkIndex++;
      buffer = remaining.join(" ");
      bufferPageStart = bufferPageEnd;
    }
  }

  if (buffer.trim()) {
    chunks.push({
      id: `${agencySlug}-${year}-${chunkIndex}`,
      year,
      agency,
      agencyShort,
      text: buffer.trim(),
      pageStart: bufferPageStart,
      pageEnd: bufferPageEnd,
      chunkIndex,
    });
  }

  return chunks;
}
