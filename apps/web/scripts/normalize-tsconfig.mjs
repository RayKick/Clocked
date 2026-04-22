import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const tsconfigPath = resolve(process.cwd(), "tsconfig.json");
const raw = JSON.parse(readFileSync(tsconfigPath, "utf8"));

const nextInclude = Array.isArray(raw.include)
  ? raw.include.filter((entry) => entry !== ".next/types/**/*.ts")
  : ["next-env.d.ts", "**/*.ts", "**/*.tsx"];

const normalized = {
  ...raw,
  include: nextInclude
};

writeFileSync(tsconfigPath, `${JSON.stringify(normalized, null, 2)}\n`);
