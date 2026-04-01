/**
 * Tool definitions for the Personal Blog MCP Server.
 * Each tool maps to one API endpoint.
 */
import { z } from "zod";

export interface ToolDef {
  name: string;
  description: string;
  inputSchema: z.ZodTypeAny;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string | ((args: Record<string, unknown>) => string);
  /** Which args go as query params (GET/DELETE), rest go as body */
  queryParams?: string[];
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
}

// ═══════════════════════════════════════════════════════════════════
//  HEALTH & SYSTEM
// ═══════════════════════════════════════════════════════════════════

export const healthCheck: ToolDef = {
  name: "health_check",
  description: "Check if the blog API is reachable. Returns 'Hello, world!'",
  inputSchema: z.object({}),
  method: "GET",
  path: "/api",
};

export const systemStatus: ToolDef = {
  name: "system_status",
  description: "Check database connectivity and system health",
  inputSchema: z.object({}),
  method: "GET",
  path: "/api/system/status",
};

export const systemStats: ToolDef = {
  name: "system_stats",
  description: "Get system-wide statistics: published posts, garden notes, projects, totalNodes",
  inputSchema: z.object({}),
  method: "GET",
  path: "/api/system/stats",
};

// ═══════════════════════════════════════════════════════════════════
//  AUTHENTICATION
// ═══════════════════════════════════════════════════════════════════

export const authLogin: ToolDef = {
  name: "auth_login",
  description: "Login with email and password. Sets session cookies for subsequent requests.",
  inputSchema: z.object({
    email: z.string().describe("User email"),
    password: z.string().describe("User password"),
  }),
  method: "POST",
  path: "/api/auth/login",
};

export const authRegister: ToolDef = {
  name: "auth_register",
  description: "Register a new user account",
  inputSchema: z.object({
    name: z.string().describe("Display name"),
    email: z.string().describe("Email address"),
    password: z.string().describe("Password (min 6 chars)"),
  }),
  method: "POST",
  path: "/api/auth/register",
};

export const authLogout: ToolDef = {
  name: "auth_logout",
  description: "Logout current user, clears session cookies",
  inputSchema: z.object({}),
  method: "POST",
  path: "/api/auth/logout",
  requiresAuth: true,
};

export const authCheck: ToolDef = {
  name: "auth_check",
  description: "Check current authentication status against the blog API. Returns user info if logged in.",
  inputSchema: z.object({}),
  method: "GET",
  path: "/api/auth/check",
};

/**
 * Local tool — returns current MCP session state without hitting the API.
 * Useful for checking if login succeeded and whether the session is admin.
 */
export const authWhoami: ToolDef = {
  name: "auth_whoami",
  description: "Show the current MCP session state: authenticated status, admin status, user info, and raw cookies. Does not call the blog API — reports local session only.",
  inputSchema: z.object({}),
  method: "GET",
  path: "__local__/whoami",
};

export const authForgotPassword: ToolDef = {
  name: "auth_forgot_password",
  description: "Request a password reset email",
  inputSchema: z.object({
    email: z.string().describe("Email to send reset link to"),
  }),
  method: "POST",
  path: "/api/auth/forgot-password",
};

export const authResetPassword: ToolDef = {
  name: "auth_reset_password",
  description: "Reset password using a reset token",
  inputSchema: z.object({
    token: z.string().describe("Password reset token"),
    password: z.string().describe("New password"),
    confirmPassword: z.string().describe("Confirm new password"),
  }),
  method: "POST",
  path: "/api/auth/reset-password",
};

// ═══════════════════════════════════════════════════════════════════
//  POSTS (Public)
// ═══════════════════════════════════════════════════════════════════

export const listPosts: ToolDef = {
  name: "list_posts",
  description: "List all blog posts. Supports filtering by published, featured, tag, limit.",
  inputSchema: z.object({
    published: z.string().optional().describe("Filter by published status: 'true' or 'false'"),
    featured: z.string().optional().describe("Filter featured posts: 'true'"),
    limit: z.string().optional().describe("Max number of posts to return"),
    tag: z.string().optional().describe("Filter by tag name"),
  }),
  method: "GET",
  path: "/api/posts",
  queryParams: ["published", "featured", "limit", "tag"],
};

export const getPost: ToolDef = {
  name: "get_post",
  description: "Get a single blog post by slug. Increments view count. Returns comments & reactions.",
  inputSchema: z.object({
    slug: z.string().describe("Post slug (URL-friendly identifier)"),
  }),
  method: "GET",
  path: "/api/posts",
  queryParams: ["slug"],
};

export const reactToPost: ToolDef = {
  name: "react_to_post",
  description: "Toggle an emoji reaction on a post (like/unlike)",
  inputSchema: z.object({
    postId: z.string().describe("Post ID to react to"),
    emoji: z.string().optional().describe("Emoji to react with (default: ❤️)"),
  }),
  method: "POST",
  path: (args) => `/api/posts/${args.postId}/react`,
  requiresAuth: true,
};

// ═══════════════════════════════════════════════════════════════════
//  PROJECTS (Public)
// ═══════════════════════════════════════════════════════════════════

export const listProjects: ToolDef = {
  name: "list_projects",
  description: "List all projects with tags, ordered by display order",
  inputSchema: z.object({}),
  method: "GET",
  path: "/api/projects",
};

export const getProject: ToolDef = {
  name: "get_project",
  description: "Get a single project by slug. Increments view count.",
  inputSchema: z.object({
    slug: z.string().describe("Project slug"),
  }),
  method: "GET",
  path: (args) => `/api/projects/${args.slug}`,
};

// ═══════════════════════════════════════════════════════════════════
//  GARDEN NOTES (Public)
// ═══════════════════════════════════════════════════════════════════

export const listGardenNotes: ToolDef = {
  name: "list_garden_notes",
  description: "List all digital garden notes with tags. Notes have status: seedling, growing, or evergreen",
  inputSchema: z.object({}),
  method: "GET",
  path: "/api/garden",
};

export const getGardenNote: ToolDef = {
  name: "get_garden_note",
  description: "Get a single garden note by slug. Increments view count.",
  inputSchema: z.object({
    slug: z.string().describe("Garden note slug"),
  }),
  method: "GET",
  path: (args) => `/api/garden/${args.slug}`,
};

// ═══════════════════════════════════════════════════════════════════
//  COMMENTS
// ═══════════════════════════════════════════════════════════════════

export const listComments: ToolDef = {
  name: "list_comments",
  description: "Get comments for a post or garden note. Returns top-level comments with nested replies.",
  inputSchema: z.object({
    postId: z.string().optional().describe("Post ID to get comments for"),
    gardenNoteId: z.string().optional().describe("Garden note ID to get comments for"),
  }),
  method: "GET",
  path: "/api/comments",
  queryParams: ["postId", "gardenNoteId"],
};

export const createComment: ToolDef = {
  name: "create_comment",
  description: "Post a comment on a blog post or garden note. Supports threaded replies.",
  inputSchema: z.object({
    content: z.string().describe("Comment text"),
    postId: z.string().optional().describe("Post ID (provide either postId or gardenNoteId)"),
    gardenNoteId: z.string().optional().describe("Garden note ID"),
    parentId: z.string().optional().describe("Parent comment ID for replies"),
  }),
  method: "POST",
  path: "/api/comments",
  requiresAuth: true,
};

// ═══════════════════════════════════════════════════════════════════
//  REACTIONS
// ═══════════════════════════════════════════════════════════════════

export const getReactions: ToolDef = {
  name: "get_reactions",
  description: "Get emoji reaction counts for a post",
  inputSchema: z.object({
    postId: z.string().describe("Post ID"),
  }),
  method: "GET",
  path: "/api/reactions",
  queryParams: ["postId"],
};

export const toggleReaction: ToolDef = {
  name: "toggle_reaction",
  description: "Toggle an emoji reaction on a post (creates or removes)",
  inputSchema: z.object({
    postId: z.string().describe("Post ID"),
    emoji: z.string().describe("Emoji to toggle"),
    authorId: z.string().describe("User ID of the person reacting"),
  }),
  method: "POST",
  path: "/api/reactions",
};

// ═══════════════════════════════════════════════════════════════════
//  GUESTBOOK
// ═══════════════════════════════════════════════════════════════════

export const listGuestbook: ToolDef = {
  name: "list_guestbook",
  description: "Get all guestbook entries",
  inputSchema: z.object({}),
  method: "GET",
  path: "/api/guestbook",
};

export const signGuestbook: ToolDef = {
  name: "sign_guestbook",
  description: "Sign the guestbook with a message",
  inputSchema: z.object({
    name: z.string().describe("Signer name"),
    message: z.string().describe("Guestbook message"),
    website: z.string().optional().describe("Optional website URL"),
    authorId: z.string().optional().describe("User ID if logged in"),
  }),
  method: "POST",
  path: "/api/guestbook",
};

export const deleteGuestbookEntry: ToolDef = {
  name: "delete_guestbook_entry",
  description: "Delete a guestbook entry by ID",
  inputSchema: z.object({
    id: z.string().describe("Guestbook entry ID"),
  }),
  method: "DELETE",
  path: "/api/guestbook",
  queryParams: ["id"],
};

// ═══════════════════════════════════════════════════════════════════
//  HUB (Now Page)
// ═══════════════════════════════════════════════════════════════════

export const getHub: ToolDef = {
  name: "get_hub",
  description: "Get 'Now' page data: what the blog author is currently learning, reading, listening to, and repos",
  inputSchema: z.object({}),
  method: "GET",
  path: "/api/hub",
};

// ═══════════════════════════════════════════════════════════════════
//  SEARCH
// ═══════════════════════════════════════════════════════════════════

export const searchContent: ToolDef = {
  name: "search_content",
  description: "Hybrid semantic search + AI Q&A across posts, garden notes, and projects",
  inputSchema: z.object({
    query: z.string().describe("Search query"),
    history: z.array(z.object({
      role: z.string(),
      content: z.string(),
    })).optional().describe("Conversation history for context"),
    limit: z.number().optional().describe("Max results"),
  }),
  method: "POST",
  path: "/api/search",
};

// ═══════════════════════════════════════════════════════════════════
//  SUBSCRIPTIONS
// ═══════════════════════════════════════════════════════════════════

export const listSubscriptions: ToolDef = {
  name: "list_subscriptions",
  description: "Get subscriptions, optionally filtered by email",
  inputSchema: z.object({
    email: z.string().optional().describe("Filter by email"),
  }),
  method: "GET",
  path: "/api/subscriptions",
  queryParams: ["email"],
};

export const createSubscription: ToolDef = {
  name: "create_subscription",
  description: "Subscribe an email to blog updates",
  inputSchema: z.object({
    email: z.string().describe("Email to subscribe"),
    categories: z.array(z.string()).optional().describe("Category filters"),
    frequency: z.string().optional().describe("Frequency: daily, weekly, monthly"),
  }),
  method: "POST",
  path: "/api/subscriptions",
};

// ═══════════════════════════════════════════════════════════════════
//  SUMMARIZE
// ═══════════════════════════════════════════════════════════════════

export const summarizePost: ToolDef = {
  name: "summarize_post",
  description: "AI-generate a TL;DR summary for a blog post. Updates the post's summary field.",
  inputSchema: z.object({
    postId: z.string().describe("Post ID to summarize"),
  }),
  method: "POST",
  path: "/api/summarize",
};

// ═══════════════════════════════════════════════════════════════════
//  USER PROFILE & SETTINGS (Authenticated)
// ═══════════════════════════════════════════════════════════════════

export const getUserProfile: ToolDef = {
  name: "get_user_profile",
  description: "Get current user's profile (name, email, bio, website)",
  inputSchema: z.object({}),
  method: "GET",
  path: "/api/user/profile",
  requiresAuth: true,
};

export const updateUserProfile: ToolDef = {
  name: "update_user_profile",
  description: "Update current user's profile",
  inputSchema: z.object({
    name: z.string().optional().describe("Display name"),
    bio: z.string().optional().describe("User bio"),
    website: z.string().optional().describe("Website URL"),
  }),
  method: "PUT",
  path: "/api/user/profile",
  requiresAuth: true,
};

export const changePassword: ToolDef = {
  name: "change_password",
  description: "Change the current user's password",
  inputSchema: z.object({
    userId: z.string().describe("User ID"),
    currentPassword: z.string().describe("Current password"),
    newPassword: z.string().describe("New password"),
  }),
  method: "POST",
  path: "/api/user/security/password",
  requiresAuth: true,
};

export const getPrivacySettings: ToolDef = {
  name: "get_privacy_settings",
  description: "Get user's privacy settings (profile visibility, activity, indexing)",
  inputSchema: z.object({}),
  method: "GET",
  path: "/api/user/settings/privacy",
  requiresAuth: true,
};

export const updatePrivacySettings: ToolDef = {
  name: "update_privacy_settings",
  description: "Update user's privacy settings",
  inputSchema: z.object({
    profileVisibility: z.string().optional().describe("'public' or 'private'"),
    showActivity: z.boolean().optional().describe("Show activity publicly"),
    allowIndexing: z.boolean().optional().describe("Allow search engine indexing"),
  }),
  method: "PUT",
  path: "/api/user/settings/privacy",
  requiresAuth: true,
};

export const getNotificationPrefs: ToolDef = {
  name: "get_notification_preferences",
  description: "Get user's notification preferences",
  inputSchema: z.object({}),
  method: "GET",
  path: "/api/user/settings/notifications",
  requiresAuth: true,
};

export const updateNotificationPrefs: ToolDef = {
  name: "update_notification_preferences",
  description: "Update user's notification preferences",
  inputSchema: z.object({
    emailDigest: z.boolean().optional().describe("Receive email digest"),
    newComments: z.boolean().optional().describe("Notify on new comments"),
    mentions: z.boolean().optional().describe("Notify on mentions"),
  }),
  method: "PUT",
  path: "/api/user/settings/notifications",
  requiresAuth: true,
};

export const getUserStats: ToolDef = {
  name: "get_user_stats",
  description: "Get user statistics: comment count, reactions, days since joined",
  inputSchema: z.object({}),
  method: "GET",
  path: "/api/user/stats",
  requiresAuth: true,
};

export const getUserBadges: ToolDef = {
  name: "get_user_badges",
  description: "Get user's earned badges",
  inputSchema: z.object({}),
  method: "GET",
  path: "/api/user/badges",
  requiresAuth: true,
};

export const getUserActivity: ToolDef = {
  name: "get_user_activity",
  description: "Get user's recent activity (comments and reactions, up to 10 items)",
  inputSchema: z.object({}),
  method: "GET",
  path: "/api/user/activity",
  requiresAuth: true,
};

export const getAiHistory: ToolDef = {
  name: "get_ai_history",
  description: "Get user's AI artifact history (last 50 queries)",
  inputSchema: z.object({
    userId: z.string().optional().describe("User ID (defaults to current)"),
  }),
  method: "GET",
  path: "/api/user/ai-history",
  queryParams: ["userId"],
  requiresAuth: true,
};

export const toggleBookmark: ToolDef = {
  name: "toggle_bookmark",
  description: "Toggle bookmark on a post, garden note, or project",
  inputSchema: z.object({
    type: z.enum(["post", "garden", "project"]).describe("Content type"),
    id: z.string().describe("Content ID"),
  }),
  method: "POST",
  path: "/api/user/bookmark",
  requiresAuth: true,
};

export const listBookmarks: ToolDef = {
  name: "list_bookmarks",
  description: "Get all user bookmarks with related content data",
  inputSchema: z.object({}),
  method: "GET",
  path: "/api/user/bookmark",
  requiresAuth: true,
};

// ═══════════════════════════════════════════════════════════════════
//  AI SERVICES
// ═══════════════════════════════════════════════════════════════════

export const aiTextGenerate: ToolDef = {
  name: "ai_text_generate",
  description: "Generate text using GPT-4o. Saves result as AI artifact.",
  inputSchema: z.object({
    prompt: z.string().describe("Text generation prompt"),
    userId: z.string().optional().describe("User ID to save artifact"),
    context: z.string().optional().describe("Additional context"),
  }),
  method: "POST",
  path: "/api/ai/text",
};

export const aiImageGenerate: ToolDef = {
  name: "ai_image_generate",
  description: "Generate an image using DALL-E 3 (1024x1024)",
  inputSchema: z.object({
    prompt: z.string().describe("Image generation prompt"),
    userId: z.string().optional().describe("User ID to save artifact"),
  }),
  method: "POST",
  path: "/api/ai/image",
};

export const aiVideoGenerate: ToolDef = {
  name: "ai_video_generate",
  description: "Generate a video using Replicate Zeroscope v2 XL (576x320, 24fps)",
  inputSchema: z.object({
    prompt: z.string().describe("Video generation prompt"),
    userId: z.string().optional().describe("User ID to save artifact"),
  }),
  method: "POST",
  path: "/api/ai/video",
};

export const aiWebRead: ToolDef = {
  name: "ai_web_read",
  description: "Extract and parse content from a URL using Cheerio HTML parser",
  inputSchema: z.object({
    url: z.string().describe("URL to read and extract content from"),
    userId: z.string().optional().describe("User ID"),
  }),
  method: "POST",
  path: "/api/ai/web-read",
};

export const aiWebSearch: ToolDef = {
  name: "ai_web_search",
  description: "Search the web using Google Custom Search API (top 5 results)",
  inputSchema: z.object({
    query: z.string().describe("Search query"),
    userId: z.string().optional().describe("User ID"),
  }),
  method: "POST",
  path: "/api/ai/search",
};

export const aiChunkDetect: ToolDef = {
  name: "ai_chunk_detect",
  description: "Decompose a project/topic into 3-4 architectural learning chunks",
  inputSchema: z.object({
    title: z.string().describe("Title of the content"),
    content: z.string().describe("Content to decompose"),
  }),
  method: "POST",
  path: "/api/ai/chunk",
};

export const aiMnemonicGenerate: ToolDef = {
  name: "ai_mnemonic_generate",
  description: "Create a memory anchor phrase for a project/topic",
  inputSchema: z.object({
    title: z.string().describe("Title of the content"),
    content: z.string().describe("Content to create mnemonic for"),
  }),
  method: "POST",
  path: "/api/ai/mnemonic",
};

export const aiRecallQuestions: ToolDef = {
  name: "ai_recall_questions",
  description: "Generate 3 active recall questions for deep learning of a topic",
  inputSchema: z.object({
    title: z.string().describe("Title of the content"),
    content: z.string().describe("Content to generate questions for"),
  }),
  method: "POST",
  path: "/api/ai/recall-questions",
};

export const aiVerifyKnowledge: ToolDef = {
  name: "ai_verify_knowledge",
  description: "AI validates a user's answer to a recall question",
  inputSchema: z.object({
    question: z.string().describe("The recall question"),
    answer: z.string().describe("The user's answer to verify"),
    context: z.string().describe("Original context for fact-checking"),
  }),
  method: "POST",
  path: "/api/ai/verify",
};

export const aiDeleteArtifact: ToolDef = {
  name: "ai_delete_artifact",
  description: "Delete an AI-generated artifact (owner or admin only)",
  inputSchema: z.object({
    id: z.string().describe("Artifact ID to delete"),
  }),
  method: "DELETE",
  path: (args) => `/api/ai/artifact/${args.id}`,
  requiresAuth: true,
};

// ═══════════════════════════════════════════════════════════════════
//  ADMIN — Posts
// ═══════════════════════════════════════════════════════════════════

export const adminListPosts: ToolDef = {
  name: "admin_list_posts",
  description: "Admin: List all posts (including unpublished)",
  inputSchema: z.object({}),
  method: "GET",
  path: "/api/admin/posts",
  requiresAdmin: true,
};

export const adminCreatePost: ToolDef = {
  name: "admin_create_post",
  description: "Admin: Create a new blog post with tags, recall questions, mnemonics",
  inputSchema: z.object({
    title: z.string().describe("Post title"),
    slug: z.string().describe("URL-friendly slug"),
    content: z.string().describe("Post content (Markdown)"),
    excerpt: z.string().optional().describe("Short excerpt"),
    published: z.boolean().optional().describe("Publish immediately (default: false)"),
    tags: z.array(z.string()).optional().describe("Tag names"),
    recallQuestions: z.array(z.string()).optional().describe("Active recall questions"),
    mnemonics: z.array(z.string()).optional().describe("Memory anchor phrases"),
  }),
  method: "POST",
  path: "/api/admin/posts",
  requiresAdmin: true,
};

// ═══════════════════════════════════════════════════════════════════
//  ADMIN — Projects
// ═══════════════════════════════════════════════════════════════════

export const adminListProjects: ToolDef = {
  name: "admin_list_projects",
  description: "Admin: List all projects",
  inputSchema: z.object({}),
  method: "GET",
  path: "/api/admin/projects",
  requiresAdmin: true,
};

export const adminCreateProject: ToolDef = {
  name: "admin_create_project",
  description: "Admin: Create a new project",
  inputSchema: z.object({
    title: z.string().describe("Project title"),
    slug: z.string().describe("URL slug"),
    description: z.string().describe("Short description"),
    longDescription: z.string().optional().describe("Full description"),
    status: z.string().optional().describe("Status: idea, in-progress, completed, archived"),
    liveUrl: z.string().optional().describe("Live demo URL"),
    githubUrl: z.string().optional().describe("GitHub repo URL"),
    techStack: z.array(z.string()).optional().describe("Technologies used"),
    progress: z.number().optional().describe("Progress 0-100"),
    priority: z.string().optional().describe("Priority: low, medium, high"),
    tags: z.array(z.string()).optional().describe("Tag names"),
  }),
  method: "POST",
  path: "/api/admin/projects",
  requiresAdmin: true,
};

export const adminUpdateProject: ToolDef = {
  name: "admin_update_project",
  description: "Admin: Update an existing project",
  inputSchema: z.object({
    id: z.string().describe("Project ID"),
    title: z.string().optional().describe("Project title"),
    description: z.string().optional().describe("Short description"),
    longDescription: z.string().optional().describe("Full description"),
    status: z.string().optional().describe("Status: idea, in-progress, completed, archived"),
    liveUrl: z.string().optional().describe("Live demo URL"),
    githubUrl: z.string().optional().describe("GitHub repo URL"),
    techStack: z.array(z.string()).optional().describe("Technologies used"),
    progress: z.number().optional().describe("Progress 0-100"),
  }),
  method: "PATCH",
  path: "/api/admin/projects",
  requiresAdmin: true,
};

// ═══════════════════════════════════════════════════════════════════
//  ADMIN — Garden
// ═══════════════════════════════════════════════════════════════════

export const adminListGarden: ToolDef = {
  name: "admin_list_garden",
  description: "Admin: List all garden notes or get one by slug",
  inputSchema: z.object({
    slug: z.string().optional().describe("Optional slug to fetch specific note"),
  }),
  method: "GET",
  path: "/api/admin/garden",
  queryParams: ["slug"],
  requiresAdmin: true,
};

export const adminCreateGardenNote: ToolDef = {
  name: "admin_create_garden_note",
  description: "Admin: Create a new digital garden note",
  inputSchema: z.object({
    title: z.string().describe("Note title"),
    slug: z.string().describe("URL slug"),
    content: z.string().describe("Note content (Markdown)"),
    status: z.string().optional().describe("Status: seedling, growing, evergreen"),
    tags: z.array(z.string()).optional().describe("Tag names"),
    recallQuestions: z.array(z.string()).optional().describe("Recall questions"),
    reviewInterval: z.number().optional().describe("Spaced repetition interval in days"),
  }),
  method: "POST",
  path: "/api/admin/garden",
  requiresAdmin: true,
};

// ═══════════════════════════════════════════════════════════════════
//  ADMIN — Hub (Now Page)
// ═══════════════════════════════════════════════════════════════════

export const adminGetHub: ToolDef = {
  name: "admin_get_hub",
  description: "Admin: Get current hub/now page data",
  inputSchema: z.object({}),
  method: "GET",
  path: "/api/admin/hub",
  requiresAdmin: true,
};

export const adminUpdateHub: ToolDef = {
  name: "admin_update_hub",
  description: "Admin: Update the hub/now page content",
  inputSchema: z.object({
    content: z.string().optional().describe("Page content"),
    learning: z.string().optional().describe("JSON: what you're learning"),
    readingList: z.string().optional().describe("JSON: current reading list"),
    listeningTo: z.string().optional().describe("JSON: what you're listening to"),
    githubRepos: z.string().optional().describe("JSON: pinned repos"),
  }),
  method: "POST",
  path: "/api/admin/hub",
  requiresAdmin: true,
};

// ═══════════════════════════════════════════════════════════════════
//  ADMIN — Settings
// ═══════════════════════════════════════════════════════════════════

export const adminGetSettings: ToolDef = {
  name: "admin_get_settings",
  description: "Admin: Get site-wide settings (name, features, social links, theme)",
  inputSchema: z.object({}),
  method: "GET",
  path: "/api/admin/settings",
  requiresAdmin: true,
};

export const adminUpdateSettings: ToolDef = {
  name: "admin_update_settings",
  description: "Admin: Update site-wide settings",
  inputSchema: z.object({
    siteName: z.string().optional().describe("Site name"),
    siteDescription: z.string().optional().describe("Site description"),
    memorizationMode: z.boolean().optional().describe("Enable memorization features"),
    activeRecall: z.boolean().optional().describe("Enable active recall"),
    spacedRepetition: z.boolean().optional().describe("Enable spaced repetition"),
    themeColor: z.string().optional().describe("Theme color hex"),
    githubUrl: z.string().optional().describe("GitHub profile URL"),
    twitterUrl: z.string().optional().describe("Twitter profile URL"),
    birthday: z.string().optional().describe("Birthday ISO date string"),
  }),
  method: "POST",
  path: "/api/admin/settings",
  requiresAdmin: true,
};

// ═══════════════════════════════════════════════════════════════════
//  ALL TOOLS REGISTRY
// ═══════════════════════════════════════════════════════════════════

export const ALL_TOOLS: ToolDef[] = [
  // System
  healthCheck, systemStatus, systemStats,
  // Auth
  authLogin, authRegister, authLogout, authCheck, authWhoami, authForgotPassword, authResetPassword,
  // Posts
  listPosts, getPost, reactToPost,
  // Projects
  listProjects, getProject,
  // Garden
  listGardenNotes, getGardenNote,
  // Comments
  listComments, createComment,
  // Reactions
  getReactions, toggleReaction,
  // Guestbook
  listGuestbook, signGuestbook, deleteGuestbookEntry,
  // Hub
  getHub,
  // Search
  searchContent,
  // Subscriptions
  listSubscriptions, createSubscription,
  // Summarize
  summarizePost,
  // User
  getUserProfile, updateUserProfile, changePassword,
  getPrivacySettings, updatePrivacySettings,
  getNotificationPrefs, updateNotificationPrefs,
  getUserStats, getUserBadges, getUserActivity,
  getAiHistory, toggleBookmark, listBookmarks,
  // AI
  aiTextGenerate, aiImageGenerate, aiVideoGenerate,
  aiWebRead, aiWebSearch, aiChunkDetect,
  aiMnemonicGenerate, aiRecallQuestions, aiVerifyKnowledge,
  aiDeleteArtifact,
  // Admin
  adminListPosts, adminCreatePost,
  adminListProjects, adminCreateProject, adminUpdateProject,
  adminListGarden, adminCreateGardenNote,
  adminGetHub, adminUpdateHub,
  adminGetSettings, adminUpdateSettings,
];
