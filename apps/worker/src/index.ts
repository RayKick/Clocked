import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";

import { disconnectPrisma } from "@clocked/db";

import { runDeadlineWorker } from "./deadlineWorker";
import { runDigestWorker } from "./digestWorker";
import { runFixtureWorker } from "./fixtureWorker";
import { runHeyAnonEvidenceWorker } from "./heyanonEvidenceWorker";
import { runReviewWorker } from "./reviewWorker";
import { runXStreamWorker } from "./xStreamWorker";

loadEnv({ path: resolve(process.cwd(), "../../.env") });
loadEnv();

async function main() {
  const mode = process.argv[2] ?? "dev";

  switch (mode) {
    case "fixtures":
      console.log(await runFixtureWorker());
      break;
    case "deadlines":
      console.log(await runDeadlineWorker());
      break;
    case "heyanon-evidence":
      console.log(await runHeyAnonEvidenceWorker());
      break;
    case "digest":
      console.log(await runDigestWorker());
      break;
    case "x-stream":
      console.log(await runXStreamWorker());
      break;
    case "dev":
    default:
      console.log({
        deadline: await runDeadlineWorker(),
        heyanon: await runHeyAnonEvidenceWorker(),
        review: await runReviewWorker()
      });
      break;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectPrisma();
  });
