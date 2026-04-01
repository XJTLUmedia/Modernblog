
---

# ModernBlog: AI blog for you to review your knowledge

ModernBlog is a high-performance, AI-augmented platform designed for thinkers, learners, and creators. It blends professional engineering with personal development tools, creating a digital garden that grows alongside you.

## The Vision

ModernBlog isn't just a content management system; it’s an intellectual partner. By combining the **Next.js 15** ecosystem with **AI Services**, it transforms static writing into an interactive journey of self-improvement and discovery.
<img width="1856" height="752" alt="Screenshot 2026-01-11 104551" src="https://github.com/user-attachments/assets/d53aae7a-5399-43b4-9ff5-326ef6ebae8e" />
<img width="1822" height="745" alt="Screenshot 2026-01-11 104822" src="https://github.com/user-attachments/assets/39eec852-31bd-44c4-96db-e8ca6a9b6623" />
<img width="1773" height="665" alt="Screenshot 2026-01-11 104749" src="https://github.com/user-attachments/assets/9215bff0-6279-4a55-8e10-afe3f20a6ed4" />

---

## Technical Infrastructure

### Core Framework

* **Next.js 15 (App Router):** Leveraging the latest in React Server Components for a lightning-fast, "instant-load" reading experience.
* **Prisma ORM & PostgreSQL:** Ensuring your thoughts and data are persisted in a robust, structured way (moving beyond local SQLite for production).
* **Tailwind CSS 4:** A streamlined, modern aesthetic that prioritizes readability and focus.

### AI-Integrated Growth Tools

ModernBlog is designed to integrate seamlessly with LLMs (OpenAI, Anthropic) to provide:

* **Intelligent Summarization:** Automatically distill long-form reflections into actionable insights.
* **Semantic Search:** Find connections between your past thoughts using vector-based search.
* **Growth Analytics:** AI-driven tracking of personal milestones and writing patterns.
<img width="1661" height="857" alt="Screenshot 2026-01-11 104233" src="https://github.com/user-attachments/assets/7f33d8de-3cde-4e0d-b34f-7f28abe3b0f3" />

---

## Directory Structure

*Clean, logical, and optimized for both human developers and AI agents.*

```text
src/
├── app/          # The heart of the blog: routes, layouts, and growth-tracking views
├── components/   # Beautiful, accessible UI components (shadcn/ui)
├── lib/          # AI service integrations, Prisma client, and utility logic
├── schemas/      # The shared "Truth": Zod models for your data and AI prompts
└── hooks/        # Reactive logic for a seamless user experience
```
---

## Installation and Setup

### 1. Environment Setup

Clone the repository and install dependencies using npm:

```bash
npm install

```

### 2. Database Initialization

Replace .env.example to actual info and rename it to .env

Generate the Prisma client and push the schema to your database:

```bash
npx prisma generate
npx prisma db push

```

Create admin account:

```bash
npx prisma db seed
```

Check if admin exist (optional):

```bash
npx prisma studio
```

### 3. Development Server

Start the local development environment:

```bash
npm run dev
```

The application will be accessible at `http://localhost:3000`.

---

## MCP Server — Control Your Blog with AI

ModernBlog ships with a built-in **MCP (Model Context Protocol) server** that turns your entire blog into a set of AI-callable tools. This means any MCP-compatible AI assistant — VS Code Copilot, Claude Desktop, Cursor, or custom agents — can read, write, and manage your blog through natural conversation.

### Why Use MCP?

| Benefit | Description |
|---------|-------------|
| **Conversational Blogging** | Draft, edit, and publish posts by talking to your AI assistant — no dashboard clicking required. |
| **AI-Powered Workflows** | Chain tools together: generate a draft → summarize → publish → share. All in one conversation. |
| **Full Admin Control** | Manage posts, projects, garden notes, hub content, and site settings entirely through AI tools. |
| **Secure Multi-User Auth** | Regular users and admins get separate permission levels. Admin tools are blocked for non-admin sessions. |
| **Session Introspection** | `auth_whoami` instantly shows your current login state — no guessing if you're authenticated. |
| **63 Tools, Zero Config** | Every API endpoint is exposed as a named tool with typed inputs. The AI knows exactly what's available. |

### Quick Setup

```bash
cd mcp-server
npm install
npm run build
```

### VS Code / GitHub Copilot

A `.vscode/mcp.json` is already included. Just open the project in VS Code and the MCP server is available to Copilot automatically:

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

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "personal-blog": {
      "command": "node",
      "args": ["/path/to/personal_blog/mcp-server/dist/index.js"],
      "env": {
        "BLOG_API_URL": "https://your-blog.com"
      }
    }
  }
}
```

### How It Works

1. **Start a session** — The AI calls `auth_login` with your credentials. Session cookies are stored automatically.
2. **Use any tool** — Ask the AI to list posts, create a garden note, update settings, etc. Each tool maps to one API endpoint.
3. **Admin tools are gated** — If you login as a regular user, admin-only tools (create post, manage settings) return a clear "insufficient privileges" error. Login with an admin account to unlock them.
4. **Check your session** — Call `auth_whoami` at any time to see if you're logged in, what role you have, and whether admin tools are available.

### Available Tool Categories

| Category | Examples | Access |
|----------|----------|--------|
| **System** | `health_check`, `system_status`, `system_stats` | Public |
| **Auth** | `auth_login`, `auth_logout`, `auth_whoami`, `auth_check` | Public |
| **Posts** | `list_posts`, `get_post`, `react_to_post` | Public / Auth |
| **Projects** | `list_projects`, `get_project` | Public |
| **Garden** | `list_garden_notes`, `get_garden_note` | Public |
| **Comments** | `list_comments`, `create_comment` | Auth |
| **AI Services** | `ai_text_generate`, `ai_web_search`, `ai_mnemonic_generate`, ... | Mixed |
| **User** | `get_user_profile`, `update_user_profile`, `toggle_bookmark`, ... | Auth |
| **Admin** | `admin_create_post`, `admin_update_hub`, `admin_update_settings`, ... | Admin |

> Full tool reference with input schemas is available in [`mcp-server/SKILL.md`](mcp-server/SKILL.md).

### Example Conversation

```
You:   "Login to my blog as admin@example.com"
AI:    → calls auth_login → "Logged in as admin@example.com (admin)"

You:   "Create a new post about TypeScript generics"
AI:    → calls admin_create_post → "Post created: TypeScript Generics 101"

You:   "Now summarize it"
AI:    → calls summarize_post → returns a 3-sentence summary

You:   "Who am I logged in as?"
AI:    → calls auth_whoami → "admin@example.com, role: admin, isAdmin: true"
```

---

### 4. Future Consideration

I still lack of ideas on how to integrate (AI image and AI video into summary and reflection part). Therefore, although there are AI generation tool there, it is not fully functional.

Meanwhile, I am lacking ideas on badge creation, I am thinking about a custom badge for admin to add themselves, but that would require some editor logic. I have no idea yet. 

If you would like to contribute, think about improving this part. I would be deeply appreciate if you can further improve this project. 







---

