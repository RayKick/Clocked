import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";

import { config as loadEnv } from "dotenv";

const rootEnvPath = resolve(process.cwd(), "../../.env");
if (existsSync(rootEnvPath)) {
  loadEnv({ path: rootEnvPath, override: true });
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
