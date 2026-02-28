import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse");
import { chunkText } from "./lib/chunker";

const PDF_SOURCES = [
  {
    year: "2023",
    name: "23summary.pdf",
    fileId: "1EnzDeyPQ-lb7PotCoxiaBLiA11d7DZZ6",
  },
  {
    year: "2024",
    name: "24summary.pdf",
    fileId: "1kGUNUCG_zDkoIcSjru1wZGW-ksDfnmr8",
  },
  {
    year: "2025",
    name: "25summary.pdf",
    fileId: "1cPIPgN1bMVpBmnhfqTz1L9RdrGV_4kaf",
  },
];

const DATA_DIR = path.resolve(__dirname, "../data");
const TEMP_DIR = path.resolve(__dirname, "../.tmp-pdfs");

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);

    const request = (currentUrl: string) => {
      const get = currentUrl.startsWith("https") ? https.get : http.get;
      get(currentUrl, (response) => {
        if (
          response.statusCode &&
          response.statusCode >= 300 &&
          response.statusCode < 400 &&
          response.headers.location
        ) {
          request(response.headers.location);
          return;
        }
        if (response.statusCode !== 200) {
          reject(new Error(`Download failed: HTTP ${response.statusCode}`));
          return;
        }
        response.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve();
        });
      }).on("error", reject);
    };

    request(url);
  });
}

async function extractPages(
  pdfBuffer: Buffer
): Promise<{ pageNum: number; text: string }[]> {
  const pages: { pageNum: number; text: string }[] = [];

  const pageRenderer = function (pageData: {
    getTextContent: () => Promise<{
      items: Array<{ str: string; transform: number[] }>;
    }>;
  }) {
    return pageData.getTextContent().then(function (textContent) {
      let lastY: number | null = null;
      let text = "";
      for (const item of textContent.items) {
        if (lastY !== null && lastY !== item.transform[5]) {
          text += "\n";
        }
        text += item.str;
        lastY = item.transform[5];
      }
      return text;
    });
  };

  const data = await pdfParse(pdfBuffer, { pagerender: pageRenderer });
  const rawPages = data.text.split(/\f/);

  for (let i = 0; i < rawPages.length; i++) {
    const text = rawPages[i].trim();
    if (text) {
      pages.push({ pageNum: i + 1, text });
    }
  }

  if (pages.length === 0) {
    pages.push({ pageNum: 1, text: data.text });
  }

  return pages;
}

async function main() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(TEMP_DIR, { recursive: true });

  const allChunks: ReturnType<typeof chunkText> = [];
  const yearSummaries: Record<string, string> = {};

  for (const source of PDF_SOURCES) {
    const pdfPath = path.join(TEMP_DIR, source.name);
    const url = `https://drive.google.com/uc?export=download&id=${source.fileId}`;

    console.log(`Downloading ${source.name}...`);
    await downloadFile(url, pdfPath);

    console.log(`Extracting text from ${source.name}...`);
    const buffer = fs.readFileSync(pdfPath);
    const pages = await extractPages(buffer);

    console.log(
      `  Found ${pages.length} pages, total chars: ${pages.reduce((s, p) => s + p.text.length, 0)}`
    );

    const chunks = chunkText(
      pages.map((p) => p.text).join("\n\n"),
      source.year,
      pages
    );
    console.log(`  Created ${chunks.length} chunks`);

    allChunks.push(...chunks);

    const first8Pages = pages
      .slice(0, 8)
      .map((p) => p.text)
      .join("\n\n");
    yearSummaries[source.year] = first8Pages.slice(0, 4000);
  }

  const chunksPath = path.join(DATA_DIR, "chunks.json");
  fs.writeFileSync(chunksPath, JSON.stringify(allChunks, null, 2));
  console.log(`\nWrote ${allChunks.length} chunks to ${chunksPath}`);

  const summariesPath = path.join(DATA_DIR, "year-summaries.json");
  fs.writeFileSync(summariesPath, JSON.stringify(yearSummaries, null, 2));
  console.log(`Wrote year summaries to ${summariesPath}`);

  fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  console.log("Cleaned up temp files.");
  console.log("\nDone! Now run the score generation step if needed.");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
