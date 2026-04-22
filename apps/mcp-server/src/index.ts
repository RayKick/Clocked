import { createServer } from "node:http";
import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";

import { handleMcpRequest } from "./server";

loadEnv({ path: resolve(process.cwd(), "../../.env") });
loadEnv();

const port = Number(process.env.PORT ?? process.env.CLOCKED_MCP_PORT ?? 8787);

const server = createServer(async (req, res) => {
  const body =
    req.method === "POST"
      ? await new Promise<string>((resolve) => {
          let data = "";
          req.on("data", (chunk) => {
            data += chunk;
          });
          req.on("end", () => resolve(data));
        })
      : undefined;

  const request = new Request(`http://localhost:${port}${req.url ?? "/"}`, {
    method: req.method,
    headers: req.headers as HeadersInit,
    body
  });

  const response = await handleMcpRequest(request);
  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  res.end(await response.text());
});

server.listen(port, () => {
  console.log(`CLOCKED MCP server listening on http://localhost:${port}`);
});
