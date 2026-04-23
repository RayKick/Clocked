import { spawn } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";

const rootEnvPath = resolve(process.cwd(), "../../.env");
if (existsSync(rootEnvPath)) {
  const contents = readFileSync(rootEnvPath, "utf8");
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separator = trimmed.indexOf("=");
    if (separator === -1) {
      continue;
    }

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

const [command, ...args] = process.argv.slice(2);

if (!command) {
  console.error("Missing command for with-root-env.");
  process.exit(1);
}

const child = spawn(command, args, {
  stdio: "inherit",
  shell: true,
  env: process.env
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
