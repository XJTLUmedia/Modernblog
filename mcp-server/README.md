# Personal Blog MCP Server

MCP (Model Context Protocol) server that exposes **all 49+ API endpoints** of the Personal Blog as tools for AI agents.

## Quick Start

```bash
cd mcp-server
npm install
```

### Run in development
```bash
BLOG_API_URL=http://localhost:3000 npx tsx src/index.ts
```

### Build for production
```bash
npm run build
BLOG_API_URL=https://your-blog.com node dist/index.js
```

## VS Code Integration

Add to your `.vscode/mcp.json`:

```json
{
  "servers": {
    "personal-blog": {
      "command": "npx",
      "args": ["tsx", "${workspaceFolder}/mcp-server/src/index.ts"],
      "env": {
        "BLOG_API_URL": "http://localhost:3000"
      }
    }
  }
}
```

## Claude Desktop Integration

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "personal-blog": {
      "command": "npx",
      "args": ["tsx", "/path/to/mcp-server/src/index.ts"],
      "env": {
        "BLOG_API_URL": "http://localhost:3000"
      }
    }
  }
}
```

## Authentication Flow

The MCP server maintains a persistent session. To use authenticated endpoints:

1. Call `auth_login` with email and password
2. Session cookies are saved automatically  
3. All subsequent calls use the saved session
4. Admin tools require admin-level login

## Tool Categories

| Category | Tools | Auth |
|----------|-------|------|
| **System** | `health_check`, `system_status`, `system_stats` | Public |
| **Auth** | `auth_login`, `auth_register`, `auth_logout`, `auth_check`, `auth_forgot_password`, `auth_reset_password` | Public |
| **Posts** | `list_posts`, `get_post`, `react_to_post` | Mixed |
| **Projects** | `list_projects`, `get_project` | Public |
| **Garden** | `list_garden_notes`, `get_garden_note` | Public |
| **Comments** | `list_comments`, `create_comment` | Mixed |
| **Reactions** | `get_reactions`, `toggle_reaction` | Public |
| **Guestbook** | `list_guestbook`, `sign_guestbook`, `delete_guestbook_entry` | Public |
| **Hub** | `get_hub` | Public |
| **Search** | `search_content` | Public |
| **Subscriptions** | `list_subscriptions`, `create_subscription` | Public |
| **Summarize** | `summarize_post` | Public |
| **User** | `get_user_profile`, `update_user_profile`, `change_password`, privacy, notifications, stats, badges, activity, bookmarks, ai-history | Auth |
| **AI Services** | `ai_text_generate`, `ai_image_generate`, `ai_video_generate`, `ai_web_read`, `ai_web_search`, `ai_chunk_detect`, `ai_mnemonic_generate`, `ai_recall_questions`, `ai_verify_knowledge`, `ai_delete_artifact` | Mixed |
| **Admin** | Posts, Projects, Garden, Hub, Settings CRUD | Admin |

## Architecture

```
mcp-server/
├── src/
│   ├── index.ts       # MCP server entry point (stdio transport)
│   ├── client.ts      # HTTP client with cookie session management
│   └── tools.ts       # All 49+ tool definitions with Zod schemas
├── package.json
└── tsconfig.json
```

The server uses `@modelcontextprotocol/sdk` with stdio transport. The `ApiClient` maintains cookies across calls, so a single `auth_login` call authenticates all subsequent requests.
