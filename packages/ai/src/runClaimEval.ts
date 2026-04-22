import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { extractClaim } from "./extractClaim";

async function main() {
  const path = resolve(process.cwd(), "evals/claim-extraction.fixtures.jsonl");
  const lines = readFileSync(path, "utf8")
    .trim()
    .split("\n")
    .filter(Boolean);
  const results = await Promise.all(
    lines.map(async (line) => {
      const fixture = JSON.parse(line) as { text: string; expectedVerdict: string };
      const result = await extractClaim({ text: fixture.text }, { mode: "mock" });
      return {
        text: fixture.text,
        expected: fixture.expectedVerdict,
        actual: result.verdict
      };
    })
  );

  console.log(JSON.stringify(results, null, 2));
}

void main();

