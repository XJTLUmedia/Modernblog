#!/usr/bin/env node
/**
 * Personal Blog MCP Server
 *
 * Exposes all 49+ API endpoints of the Personal Blog as MCP tools.
 * Supports stdio transport for VS Code / Claude Desktop integration.
 *
 * Usage:
 *   BLOG_API_URL=http://localhost:3000 npx tsx src/index.ts
 *
 * Or via mcp config:
 *   {
 *     "personal-blog": {
 *       "command": "npx",
 *       "args": ["tsx", "path/to/mcp-server/src/index.ts"],
 *       "env": { "BLOG_API_URL": "http://localhost:3000" }
 *     }
 *   }
 */
export {};
