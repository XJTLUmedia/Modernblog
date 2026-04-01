/**
 * HTTP client for the Personal Blog API.
 * Manages base URL, cookie-based auth sessions, and request helpers.
 */
export interface UserSession {
    userId: string;
    email: string;
    name: string | null;
    role: string;
    isAdmin: boolean;
}
interface ApiClientConfig {
    baseUrl: string;
    cookies?: Record<string, string>;
}
export declare class ApiClient {
    private baseUrl;
    private cookies;
    private _session;
    constructor(config: ApiClientConfig);
    /** Store auth cookies from a login response */
    setCookies(cookies: Record<string, string>): void;
    getCookies(): Record<string, string>;
    /** Check if any user is logged in */
    isAuthenticated(): boolean;
    /** Check if the current session has admin privileges */
    isAdmin(): boolean;
    /** Get the current session info (populated after login/check) */
    getSession(): UserSession | null;
    /** Store session info from login/check response */
    setSession(session: UserSession | null): void;
    /** Clear all auth state (on logout or session invalidation) */
    clearSession(): void;
    private buildCookieHeader;
    private parseCookiesFromHeaders;
    get(path: string, params?: Record<string, string>): Promise<unknown>;
    post(path: string, body?: unknown): Promise<unknown>;
    put(path: string, body?: unknown): Promise<unknown>;
    patch(path: string, body?: unknown): Promise<unknown>;
    delete(path: string, params?: Record<string, string>): Promise<unknown>;
    private handleResponse;
}
export {};
