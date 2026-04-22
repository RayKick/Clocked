import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { evaluateClaimStatus } from "./evaluateStatus";

async function main() {
  const path = resolve(process.cwd(), "evals/status-evaluation.fixtures.jsonl");
  const lines = readFileSync(path, "utf8")
    .trim()
    .split("\n")
    .filter(Boolean);
  const results = await Promise.all(
    lines.map(async (line) => {
      const fixture = JSON.parse(line) as {
        normalizedClaim: string;
        evidenceText: string[];
        expectedStatus: string;
      };
      const result = await evaluateClaimStatus(
        {
          normalizedClaim: fixture.normalizedClaim,
          deliveryCriteria: [],
          nonDeliveryCriteria: [],
          evidenceText: fixture.evidenceText,
          evidenceUrls: []
        },
        { mode: "mock" }
      );

      return {
        claim: fixture.normalizedClaim,
        expected: fixture.expectedStatus,
        actual: result.proposedStatus
      };
    })
  );

  console.log(JSON.stringify(results, null, 2));
}

void main();
