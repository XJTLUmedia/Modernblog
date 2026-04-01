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

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { ApiClient, type UserSession } from "./client.js";
import { ALL_TOOLS, type ToolDef } from "./tools.js";

const BLOG_API_URL = process.env.BLOG_API_URL || "http://localhost:3000";

// Persistent API client — holds cookies across tool calls
const api = new ApiClient({ baseUrl: BLOG_API_URL });

// Create MCP server
const server = new McpServer({
  name: "personal-blog",
  version: "1.0.0",
});

/**
 * Convert a Zod schema to a JSON-schema-like shape that MCP SDK expects.
 * The SDK's tool() accepts raw Zod shapes (record of Zod types).
 */
function zodToShape(schema: z.ZodTypeAny): Record<string, z.ZodTypeAny> {
  if (schema instanceof z.ZodObject) {
    return schema.shape as Record<string, z.ZodTypeAny>;
  }
  return {};
}

/**
 * Execute a tool definition against the API.
 */
async function executeTool(
  toolDef: ToolDef,
  args: Record<string, unknown>
): Promise<string> {
  // Auth guard: require authenticated session
  if (toolDef.requiresAuth && !api.isAuthenticated()) {
    return JSON.stringify({
      error: "Authentication required. Use auth_login first.",
      hint: "Call auth_login with email and password to start a session.",
    });
  }

  // Admin guard: require both authenticated AND admin role
  if (toolDef.requiresAdmin) {
    if (!api.isAuthenticated()) {
      return JSON.stringify({
        error: "Admin authentication required. Use auth_login with admin credentials first.",
        hint: "Login with an account that has role='admin' or matches ADMIN_EMAIL.",
      });
    }
    if (!api.isAdmin()) {
      const session = api.getSession();
      return JSON.stringify({
        error: "Insufficient privileges. Current session is not admin.",
        currentUser: session?.email ?? "unknown",
        currentRole: session?.role ?? "unknown",
        hint: "Logout and login with an admin account, or use auth_login to switch accounts.",
      });
    }
  }

  // ── Local tools (no API call) ──────────────────────────────────
  if (toolDef.name === "auth_whoami") {
    const session = api.getSession();
    return JSON.stringify({
      authenticated: api.isAuthenticated(),
      admin: api.isAdmin(),
      session: session ?? null,
      hint: !api.isAuthenticated()
        ? "Use auth_login to start a session."
        : undefined,
    }, null, 2);
  }

  // Resolve path
  const path =
    typeof toolDef.path === "function" ? toolDef.path(args) : toolDef.path;

  let result: unknown;

  switch (toolDef.method) {
    case "GET": {
      const params: Record<string, string> = {};
      if (toolDef.queryParams) {
        for (const key of toolDef.queryParams) {
          const val = args[key];
          if (val !== undefined && val !== null) {
            params[key] = String(val);
          }
        }
      }
      result = await api.get(path, Object.keys(params).length > 0 ? params : undefined);
      break;
    }
    case "POST": {
      // Strip route params from body
      const body = { ...args };
      if (typeof toolDef.path === "function") {
        // Remove params used in path construction
        for (const key of Object.keys(body)) {
          if (path.includes(String(body[key]))) {
            delete body[key];
          }
        }
      }
      result = await api.post(path, Object.keys(body).length > 0 ? body : undefined);
      break;
    }
    case "PUT": {
      result = await api.put(path, args);
      break;
    }
    case "PATCH": {
      result = await api.patch(path, args);
      break;
    }
    case "DELETE": {
      if (toolDef.queryParams) {
        const params: Record<string, string> = {};
        for (const key of toolDef.queryParams) {
          const val = args[key];
          if (val !== undefined && val !== null) {
            params[key] = String(val);
          }
        }
        result = await api.delete(path, params);
      } else {
        result = await api.delete(path);
      }
      break;
    }
  }

  // ── Post-call session management ──────────────────────────────

  // After login: capture user session from response
  if (toolDef.name === "auth_login" && isSuccessfulLogin(result)) {
    const loginData = result as Record<string, unknown>;
    const user = loginData.user as Record<string, unknown>;
    api.setSession({
      userId: String(user.id),
      email: String(user.email),
      name: user.name ? String(user.name) : null,
      role: String(user.role ?? "user"),
      isAdmin: Boolean(user.isAdmin),
    });
  }

  // After logout: clear session
  if (toolDef.name === "auth_logout") {
    api.clearSession();
  }

  // After auth_check: refresh session state
  if (toolDef.name === "auth_check" && isAuthCheckSuccess(result)) {
    const checkData = result as Record<string, unknown>;
    const user = checkData.user as Record<string, unknown>;
    if (user) {
      api.setSession({
        userId: String(user.id),
        email: String(user.email),
        name: user.name ? String(user.name) : null,
        role: String(user.role ?? "user"),
        isAdmin: Boolean((checkData as Record<string, unknown>).isAdmin),
      });
    }
  }

  return JSON.stringify(result, null, 2);
}

function isSuccessfulLogin(result: unknown): boolean {
  if (typeof result !== "object" || result === null) return false;
  const r = result as Record<string, unknown>;
  return r.success === true && typeof r.user === "object" && r.user !== null;
}

function isAuthCheckSuccess(result: unknown): boolean {
  if (typeof result !== "object" || result === null) return false;
  const r = result as Record<string, unknown>;
  return r.authenticated === true && typeof r.user === "object" && r.user !== null;
}

// ─── Register all tools ──────────────────────────────────────────

for (const toolDef of ALL_TOOLS) {
  const shape = zodToShape(toolDef.inputSchema);

  server.tool(
    toolDef.name,
    toolDef.description,
    shape,
    async (args: Record<string, unknown>) => {
      try {
        const resultText = await executeTool(toolDef, args);
        return {
          content: [{ type: "text" as const, text: resultText }],
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ error: message }),
            },
          ],
          isError: true,
        };
      }
    }
  );
}

// ─── Resources: expose schema and API docs ──────────────────────

server.resource(
  "api-overview",
  "blog://api-overview",
  async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "text/markdown",
        text: generateApiOverview(),
      },
    ],
  })
);

function generateApiOverview(): string {
  const categories: Record<string, ToolDef[]> = {};
  for (const t of ALL_TOOLS) {
    const cat = t.name.split("_")[0];
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(t);
  }

  let md = "# Personal Blog API Overview\n\n";
  md += `Base URL: \`${BLOG_API_URL}\`\n\n`;
  md += `Total tools: ${ALL_TOOLS.length}\n\n`;

  for (const [cat, tools] of Object.entries(categories)) {
    md += `## ${cat.charAt(0).toUpperCase() + cat.slice(1)}\n\n`;
    for (const t of tools) {
      const auth = t.requiresAdmin
        ? "🔐 Admin"
        : t.requiresAuth
        ? "🔑 Auth"
        : "🌐 Public";
      md += `- **${t.name}** (${t.method}) — ${t.description} ${auth}\n`;
    }
    md += "\n";
  }
  return md;
}

// ─── Start server ───────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`Personal Blog MCP Server started (API: ${BLOG_API_URL})`);
  console.error(`Registered ${ALL_TOOLS.length} tools`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
