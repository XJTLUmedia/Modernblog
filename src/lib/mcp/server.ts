/**
 * MCP Server factory — creates a McpServer + ApiClient pair with all tools registered.
 * Used by both the HTTP route handler and the stdio entry point.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ApiClient } from "./client.js";
import { ALL_TOOLS, type ToolDef } from "./tools.js";

export interface McpServerBundle {
  server: McpServer;
  apiClient: ApiClient;
}

/**
 * Convert a Zod schema to a record-of-Zod-types shape that MCP SDK expects.
 */
function zodToShape(schema: z.ZodTypeAny): Record<string, z.ZodTypeAny> {
  if (schema instanceof z.ZodObject) {
    return schema.shape as Record<string, z.ZodTypeAny>;
  }
  return {};
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

/**
 * Execute a tool definition against the API.
 */
async function executeTool(
  api: ApiClient,
  toolDef: ToolDef,
  args: Record<string, unknown>
): Promise<string> {
  // Auth guard
  if (toolDef.requiresAuth && !api.isAuthenticated()) {
    return JSON.stringify({
      error: "Authentication required. Use auth_login first.",
      hint: "Call auth_login with email and password to start a session.",
    });
  }

  // Admin guard
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
        hint: "Logout and login with an admin account.",
      });
    }
  }

  // Local tools (no API call)
  if (toolDef.name === "auth_whoami") {
    const session = api.getSession();
    return JSON.stringify(
      {
        authenticated: api.isAuthenticated(),
        admin: api.isAdmin(),
        session: session ?? null,
        hint: !api.isAuthenticated()
          ? "Use auth_login to start a session."
          : undefined,
      },
      null,
      2
    );
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
      result = await api.get(
        path,
        Object.keys(params).length > 0 ? params : undefined
      );
      break;
    }
    case "POST": {
      const body = { ...args };
      if (typeof toolDef.path === "function") {
        for (const key of Object.keys(body)) {
          if (path.includes(String(body[key]))) {
            delete body[key];
          }
        }
      }
      result = await api.post(
        path,
        Object.keys(body).length > 0 ? body : undefined
      );
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

  // Post-call session management

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

  if (toolDef.name === "auth_logout") {
    api.clearSession();
  }

  if (toolDef.name === "auth_check" && isAuthCheckSuccess(result)) {
    const checkData = result as Record<string, unknown>;
    const user = checkData.user as Record<string, unknown>;
    if (user) {
      api.setSession({
        userId: String(user.id),
        email: String(user.email),
        name: user.name ? String(user.name) : null,
        role: String(user.role ?? "user"),
        isAdmin: Boolean(checkData.isAdmin),
      });
    }
  }

  return JSON.stringify(result, null, 2);
}

function generateApiOverview(baseUrl: string): string {
  const categories: Record<string, ToolDef[]> = {};
  for (const t of ALL_TOOLS) {
    const cat = t.name.split("_")[0];
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(t);
  }

  let md = "# Personal Blog API Overview\n\n";
  md += `Base URL: \`${baseUrl}\`\n\n`;
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

/**
 * Create a fully-configured MCP server + API client bundle.
 * Each bundle has its own session (cookie jar), so multiple HTTP
 * clients can be served independently.
 */
export function createMcpServer(baseUrl: string): McpServerBundle {
  const apiClient = new ApiClient({ baseUrl });

  const server = new McpServer({
    name: "personal-blog",
    version: "1.0.0",
  });

  // Register all tools
  for (const toolDef of ALL_TOOLS) {
    const shape = zodToShape(toolDef.inputSchema);

    server.tool(
      toolDef.name,
      toolDef.description,
      shape,
      async (args: Record<string, unknown>) => {
        try {
          const resultText = await executeTool(apiClient, toolDef, args);
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

  // Register resource
  server.resource(
    "api-overview",
    "blog://api-overview",
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/markdown",
          text: generateApiOverview(baseUrl),
        },
      ],
    })
  );

  return { server, apiClient };
}
