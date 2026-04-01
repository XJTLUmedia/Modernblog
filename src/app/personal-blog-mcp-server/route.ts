/**
 * MCP Streamable-HTTP endpoint.
 *
 * Accessible at:  POST/GET/DELETE /personal-blog-mcp-server
 *
 * Each MCP client session gets its own McpServer + ApiClient (separate
 * cookie jars → separate auth sessions).
 */
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createMcpServer, type McpServerBundle } from "@/lib/mcp/server";
import type { ApiClient } from "@/lib/mcp/client";

// ── Session management ───────────────────────────────────────────

interface McpSession {
  transport: WebStandardStreamableHTTPServerTransport;
  bundle: McpServerBundle;
}

const sessions = new Map<string, McpSession>();

const BASE_URL =
  process.env.BLOG_API_URL ||
  `http://localhost:${process.env.PORT || 3000}`;

// ── Helpers ──────────────────────────────────────────────────────

function getSession(req: Request): McpSession | undefined {
  const sessionId = req.headers.get("mcp-session-id");
  if (!sessionId) return undefined;
  return sessions.get(sessionId);
}

async function createSession(): Promise<{
  transport: WebStandardStreamableHTTPServerTransport;
  bundle: McpServerBundle;
}> {
  const bundle = createMcpServer(BASE_URL);

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: () => crypto.randomUUID(),
    onsessioninitialized: (sessionId) => {
      sessions.set(sessionId, { transport, bundle });
    },
    onsessionclosed: (sessionId) => {
      sessions.delete(sessionId);
    },
  });

  await bundle.server.connect(transport);
  return { transport, bundle };
}

// ── Route handlers ───────────────────────────────────────────────

export async function POST(req: Request) {
  // Existing session?
  const existing = getSession(req);
  if (existing) {
    return existing.transport.handleRequest(req);
  }

  // New session (initialization)
  const { transport } = await createSession();
  return transport.handleRequest(req);
}

export async function GET(req: Request) {
  const existing = getSession(req);
  if (!existing) {
    return new Response("No active session. Send an initialization POST first.", {
      status: 400,
    });
  }
  return existing.transport.handleRequest(req);
}

export async function DELETE(req: Request) {
  const existing = getSession(req);
  if (!existing) {
    return new Response("Session not found.", { status: 404 });
  }
  return existing.transport.handleRequest(req);
}
