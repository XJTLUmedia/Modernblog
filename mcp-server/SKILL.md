---
name: personal-blog
description: "Skill for operating the Personal Blog (Antigravity OS). Covers content management (posts, garden notes, projects), user interactions (comments, reactions, guestbook, bookmarks), AI services (text/image/video generation, web search, web read, learning tools), admin operations, and system management. Use when user wants to interact with their blog through MCP tools or discuss blog architecture."
---

# Personal Blog Skill — Antigravity OS

> Full operational guide for AI agents interacting with the Personal Blog system.

## System Overview

**Stack:** Next.js 16 (App Router) + Prisma ORM (SQLite dev / PostgreSQL prod) + Tailwind CSS 4 + shadcn/ui  
**Auth:** Cookie-based sessions (user_id, user_role, is_admin cookies)  
**AI Services:** OpenAI GPT-4o, DALL-E 3, Replicate, Google Custom Search  
**Deployment:** Docker + Caddy reverse proxy  
**MCP Server:** `mcp-server/` directory, stdio transport, 49+ tools  

## Authentication

Always authenticate first before using auth-required tools:

```
1. Call auth_login(email, password)  
2. Session cookies persist across all subsequent calls
3. Admin tools require role=admin
```

**Roles:** `user` (default), `admin` (set via ADMIN_EMAIL env or role field)

## Content Types

### Blog Posts ("The Surface")
- Full articles with Markdown content
- Features: tags, excerpts, cover images, reading time, view counts
- Learning: recall questions, mnemonics, AI summaries
- **Create:** admin_create_post → **Read:** list_posts / get_post → **React:** react_to_post

### Garden Notes ("The Lab")  
- Digital garden with wiki-like knowledge notes
- Status lifecycle: `seedling` → `growing` → `evergreen`
- Features: spaced repetition, inter-note links, tags
- **Create:** admin_create_garden_note → **Read:** list_garden_notes / get_garden_note

### Projects ("The Forge")
- Portfolio projects with tech stack, progress tracking
- Features: live URLs, GitHub links, priority, status
- **Create:** admin_create_project → **Read:** list_projects / get_project

### Hub ("Now Page")
- Current learning, reading list, music, pinned repos
- **Read:** get_hub → **Update:** admin_update_hub

## Common Workflows

### Publish a New Blog Post
```
1. auth_login(admin_email, password)
2. admin_create_post({
     title: "...", 
     slug: "my-new-post",
     content: "# Markdown here...",
     published: true,
     tags: ["typescript", "tutorial"]
   })
3. summarize_post({ postId: "<returned_id>" })
4. ai_recall_questions({ title: "...", content: "..." })
```

### Explore Blog Content
```
1. list_posts({ published: "true", limit: "10" })
2. get_post({ slug: "post-slug" })      // full content + comments
3. search_content({ query: "how does X work?" })
```

### Manage Digital Garden
```
1. auth_login(admin_email, password)
2. admin_create_garden_note({
     title: "React Server Components",
     slug: "react-server-components",
     content: "...",
     status: "seedling",
     tags: ["react", "architecture"]
   })
3. ai_chunk_detect({ title: "...", content: "..." })
```

### AI-Powered Research
```
1. ai_web_search({ query: "latest TypeScript features" })
2. ai_web_read({ url: "https://..." })
3. ai_text_generate({ prompt: "Summarize this research..." })
4. ai_image_generate({ prompt: "Blog header for TypeScript article" })
```

### User Engagement
```
1. auth_login(email, password)
2. create_comment({ content: "Great post!", postId: "..." })
3. react_to_post({ postId: "...", emoji: "🔥" })
4. toggle_bookmark({ type: "post", id: "..." })
5. sign_guestbook({ name: "...", message: "..." })
```

### Admin Site Configuration
```
1. auth_login(admin_email, password)
2. admin_get_settings()
3. admin_update_settings({
     siteName: "My Blog",
     memorizationMode: true,
     activeRecall: true,
     themeColor: "#10b981"
   })
```

## API Tool Reference (Quick)

### Public Tools (No Auth)
| Tool | Purpose |
|------|---------|
| `health_check` | API reachability check |
| `system_status` | Database health |
| `system_stats` | Aggregate counts |
| `list_posts` | Browse posts (filter: published, featured, tag, limit) |
| `get_post` | Read single post by slug |
| `list_projects` | All projects |
| `get_project` | Single project by slug |
| `list_garden_notes` | All garden notes |
| `get_garden_note` | Single note by slug |
| `list_comments` | Comments for a post/note |
| `get_reactions` | Reaction counts for a post |
| `list_guestbook` | All guestbook entries |
| `get_hub` | Now page data |
| `search_content` | AI-powered semantic search |
| `list_subscriptions` | Email subscriptions |
| `create_subscription` | Subscribe to updates |
| `summarize_post` | AI summarize a post |

### Authenticated Tools
| Tool | Purpose |
|------|---------|
| `auth_login` | Start session |
| `auth_register` | New account |
| `auth_logout` | End session |
| `auth_check` | Verify session |
| `react_to_post` | Like/react to post |
| `create_comment` | Post comments |
| `toggle_bookmark` | Bookmark content |
| `list_bookmarks` | View saved items |
| `get_user_profile` | Profile data |
| `update_user_profile` | Edit profile |
| `change_password` | Security |
| `get_user_stats` | Activity stats |
| `get_user_badges` | Earned badges |
| `get_user_activity` | Recent activity feed |
| `get_ai_history` | AI artifact history |

### AI Service Tools
| Tool | Purpose |
|------|---------|
| `ai_text_generate` | GPT-4o text generation |
| `ai_image_generate` | DALL-E 3 images |
| `ai_video_generate` | Zeroscope video generation |
| `ai_web_read` | Extract webpage content |
| `ai_web_search` | Google Custom Search |
| `ai_chunk_detect` | Decompose into learning chunks |
| `ai_mnemonic_generate` | Memory anchors |
| `ai_recall_questions` | Active recall questions |
| `ai_verify_knowledge` | Verify answer correctness |
| `ai_delete_artifact` | Remove AI artifact |

### Admin Tools (Requires Admin Login)
| Tool | Purpose |
|------|---------|
| `admin_list_posts` | All posts including drafts |
| `admin_create_post` | Create blog post |
| `admin_list_projects` | All projects |
| `admin_create_project` | Create project |
| `admin_update_project` | Update project |
| `admin_list_garden` | All garden notes |
| `admin_create_garden_note` | Create garden note |
| `admin_get_hub` | Hub data |
| `admin_update_hub` | Update now page |
| `admin_get_settings` | Site settings |
| `admin_update_settings` | Update settings |

## Database Schema (Key Models)

- **User** — id, email, password, name, bio, role, avatar, badges, bookmarks
- **Post** — title, slug, content, excerpt, published, featured, tags, reactions, comments, recallQuestions, mnemonics
- **GardenNote** — title, slug, content, status (seedling/growing/evergreen), spaced repetition fields
- **Project** — title, slug, description, techStack, status, progress, liveUrl, githubUrl
- **Comment** — content, author, post/gardenNote, threaded replies (parentId)
- **Reaction** — emoji, author, post
- **Bookmark** — user, post/gardenNote/project
- **NowPage** — learning, readingList, listeningTo, githubRepos
- **SiteSettings** — siteName, theme, feature toggles, social URLs
- **AIArtifact** — type, prompt, result, user
- **Subscription** — email, categories, frequency, active
- **GuestbookEntry** — name, message, website

## Project Structure

```
personal_blog/
├── src/app/api/          # 49+ API routes (Next.js App Router)
│   ├── auth/             # Login, register, OAuth, password reset
│   ├── posts/            # Public post CRUD + reactions
│   ├── projects/         # Public project listing
│   ├── garden/           # Digital garden notes
│   ├── comments/         # Threaded comments
│   ├── reactions/        # Emoji reactions
│   ├── guestbook/        # Guestbook entries
│   ├── hub/              # Now page data
│   ├── search/           # Semantic search + AI Q&A
│   ├── subscriptions/    # Email subscriptions
│   ├── summarize/        # AI post summarization
│   ├── upload/           # File uploads
│   ├── user/             # Profile, settings, stats, badges, bookmarks
│   ├── ai/               # AI services (text, image, video, web, learning)
│   ├── admin/            # Admin CRUD for all content types + settings
│   └── system/           # Health checks, stats
├── src/components/       # React UI components
├── src/lib/              # Shared utilities (auth, prisma, email, ai)
├── prisma/               # Schema + migrations
├── mcp-server/           # MCP Server (this skill's implementation)
├── skills/               # AI skill definitions (ASR, LLM, TTS, etc.)
├── compose.yml           # Docker deployment
└── Caddyfile             # Reverse proxy config
```

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Prisma DB connection string |
| `ADMIN_EMAIL` | Auto-admin user email |
| `ADMIN_PASSWORD` | Admin password |
| `OPENAI_API_KEY` | GPT-4o + DALL-E 3 |
| `GEMINI_API_KEY` | Gemini AI |
| `GOOGLE_API_KEY` | Google Custom Search |
| `GOOGLE_CX` | Search engine ID |
| `REPLICATE_API_TOKEN` | Video generation |
| `GOOGLE_CLIENT_ID` | OAuth |
| `GOOGLE_CLIENT_SECRET` | OAuth |
| `GOOGLE_REDIRECT_URI` | OAuth callback |

## Tips

- Slugs are auto-normalized: lowercased, trimmed, spaces→hyphens
- View counts auto-increment on GET by slug
- Posts support both published and draft states
- Garden notes use spaced repetition: `reviewInterval` in days
- AI artifacts are saved to the database when `userId` is provided
- The hub/now page uses JSON strings for structured data (parse them)
- Comments are threaded: use `parentId` for replies
- Bookmarks toggle: calling twice removes the bookmark
