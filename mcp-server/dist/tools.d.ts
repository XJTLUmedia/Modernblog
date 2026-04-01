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
export declare const healthCheck: ToolDef;
export declare const systemStatus: ToolDef;
export declare const systemStats: ToolDef;
export declare const authLogin: ToolDef;
export declare const authRegister: ToolDef;
export declare const authLogout: ToolDef;
export declare const authCheck: ToolDef;
/**
 * Local tool — returns current MCP session state without hitting the API.
 * Useful for checking if login succeeded and whether the session is admin.
 */
export declare const authWhoami: ToolDef;
export declare const authForgotPassword: ToolDef;
export declare const authResetPassword: ToolDef;
export declare const listPosts: ToolDef;
export declare const getPost: ToolDef;
export declare const reactToPost: ToolDef;
export declare const listProjects: ToolDef;
export declare const getProject: ToolDef;
export declare const listGardenNotes: ToolDef;
export declare const getGardenNote: ToolDef;
export declare const listComments: ToolDef;
export declare const createComment: ToolDef;
export declare const getReactions: ToolDef;
export declare const toggleReaction: ToolDef;
export declare const listGuestbook: ToolDef;
export declare const signGuestbook: ToolDef;
export declare const deleteGuestbookEntry: ToolDef;
export declare const getHub: ToolDef;
export declare const searchContent: ToolDef;
export declare const listSubscriptions: ToolDef;
export declare const createSubscription: ToolDef;
export declare const summarizePost: ToolDef;
export declare const getUserProfile: ToolDef;
export declare const updateUserProfile: ToolDef;
export declare const changePassword: ToolDef;
export declare const getPrivacySettings: ToolDef;
export declare const updatePrivacySettings: ToolDef;
export declare const getNotificationPrefs: ToolDef;
export declare const updateNotificationPrefs: ToolDef;
export declare const getUserStats: ToolDef;
export declare const getUserBadges: ToolDef;
export declare const getUserActivity: ToolDef;
export declare const getAiHistory: ToolDef;
export declare const toggleBookmark: ToolDef;
export declare const listBookmarks: ToolDef;
export declare const aiTextGenerate: ToolDef;
export declare const aiImageGenerate: ToolDef;
export declare const aiVideoGenerate: ToolDef;
export declare const aiWebRead: ToolDef;
export declare const aiWebSearch: ToolDef;
export declare const aiChunkDetect: ToolDef;
export declare const aiMnemonicGenerate: ToolDef;
export declare const aiRecallQuestions: ToolDef;
export declare const aiVerifyKnowledge: ToolDef;
export declare const aiDeleteArtifact: ToolDef;
export declare const adminListPosts: ToolDef;
export declare const adminCreatePost: ToolDef;
export declare const adminListProjects: ToolDef;
export declare const adminCreateProject: ToolDef;
export declare const adminUpdateProject: ToolDef;
export declare const adminListGarden: ToolDef;
export declare const adminCreateGardenNote: ToolDef;
export declare const adminGetHub: ToolDef;
export declare const adminUpdateHub: ToolDef;
export declare const adminGetSettings: ToolDef;
export declare const adminUpdateSettings: ToolDef;
export declare const ALL_TOOLS: ToolDef[];
