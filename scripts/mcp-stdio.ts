#!/usr/bin/env npx tsx
/**
 * Thin stdio wrapper for the Personal Blog MCP Server.
 *
 * Usage:
 *   BLOG_API_URL=http://localhost:3000 npx tsx scripts/mcp-stdio.ts
 *
 * For VS Code / Claude Desktop mcp config:
 *   {
 *     "personal-blog": {
 *       "command": "npx",
 *       "args": ["tsx", "scripts/mcp-stdio.ts"],
 *       "env": { "BLOG_API_URL": "http://localhost:3000" }
 *     }
 *   }
 */
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMcpServer } from "../src/lib/mcp/server.js";

const BASE_URL = process.env.BLOG_API_URL || "http://localhost:3000";

async function main() {
  const { server } = createMcpServer(BASE_URL);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`Personal Blog MCP Server started (stdio, API: ${BASE_URL})`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
