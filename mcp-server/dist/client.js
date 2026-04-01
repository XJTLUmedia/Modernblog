/**
 * HTTP client for the Personal Blog API.
 * Manages base URL, cookie-based auth sessions, and request helpers.
 */
export class ApiClient {
    baseUrl;
    cookies = {};
    _session = null;
    constructor(config) {
        this.baseUrl = config.baseUrl.replace(/\/+$/, "");
        if (config.cookies) {
            this.cookies = { ...config.cookies };
        }
    }
    /** Store auth cookies from a login response */
    setCookies(cookies) {
        Object.assign(this.cookies, cookies);
    }
    getCookies() {
        return { ...this.cookies };
    }
    /** Check if any user is logged in */
    isAuthenticated() {
        return !!this.cookies["user_id"] && this.cookies["logged_in"] === "true";
    }
    /** Check if the current session has admin privileges */
    isAdmin() {
        return (this.isAuthenticated() &&
            (this.cookies["is_admin"] === "true" ||
                this.cookies["user_role"] === "admin"));
    }
    /** Get the current session info (populated after login/check) */
    getSession() {
        return this._session;
    }
    /** Store session info from login/check response */
    setSession(session) {
        this._session = session;
    }
    /** Clear all auth state (on logout or session invalidation) */
    clearSession() {
        this._session = null;
        // Remove auth cookies specifically
        const authCookieNames = [
            "user_id",
            "user_role",
            "is_admin",
            "user_name",
            "logged_in",
        ];
        for (const name of authCookieNames) {
            delete this.cookies[name];
        }
    }
    buildCookieHeader() {
        return Object.entries(this.cookies)
            .filter(([, v]) => v !== "" && v !== undefined)
            .map(([k, v]) => `${k}=${v}`)
            .join("; ");
    }
    parseCookiesFromHeaders(headers) {
        const setCookieHeaders = headers.getSetCookie?.() ?? [];
        for (const raw of setCookieHeaders) {
            const pair = raw.split(";")[0];
            if (pair) {
                const eqIdx = pair.indexOf("=");
                if (eqIdx > 0) {
                    const name = pair.substring(0, eqIdx).trim();
                    const value = pair.substring(eqIdx + 1).trim();
                    // Detect cookie deletion (empty value or expired)
                    if (value === "" || raw.toLowerCase().includes("max-age=0") || raw.toLowerCase().includes("expires=thu, 01 jan 1970")) {
                        delete this.cookies[name];
                    }
                    else {
                        this.cookies[name] = value;
                    }
                }
            }
        }
    }
    async get(path, params) {
        const url = new URL(`${this.baseUrl}${path}`);
        if (params) {
            for (const [k, v] of Object.entries(params)) {
                if (v !== undefined && v !== null && v !== "") {
                    url.searchParams.set(k, v);
                }
            }
        }
        const res = await fetch(url.toString(), {
            method: "GET",
            headers: {
                Cookie: this.buildCookieHeader(),
                Accept: "application/json",
            },
        });
        this.parseCookiesFromHeaders(res.headers);
        return this.handleResponse(res);
    }
    async post(path, body) {
        const res = await fetch(`${this.baseUrl}${path}`, {
            method: "POST",
            headers: {
                Cookie: this.buildCookieHeader(),
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: body ? JSON.stringify(body) : undefined,
        });
        this.parseCookiesFromHeaders(res.headers);
        return this.handleResponse(res);
    }
    async put(path, body) {
        const res = await fetch(`${this.baseUrl}${path}`, {
            method: "PUT",
            headers: {
                Cookie: this.buildCookieHeader(),
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: body ? JSON.stringify(body) : undefined,
        });
        this.parseCookiesFromHeaders(res.headers);
        return this.handleResponse(res);
    }
    async patch(path, body) {
        const res = await fetch(`${this.baseUrl}${path}`, {
            method: "PATCH",
            headers: {
                Cookie: this.buildCookieHeader(),
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: body ? JSON.stringify(body) : undefined,
        });
        this.parseCookiesFromHeaders(res.headers);
        return this.handleResponse(res);
    }
    async delete(path, params) {
        const url = new URL(`${this.baseUrl}${path}`);
        if (params) {
            for (const [k, v] of Object.entries(params)) {
                if (v !== undefined && v !== null && v !== "") {
                    url.searchParams.set(k, v);
                }
            }
        }
        const res = await fetch(url.toString(), {
            method: "DELETE",
            headers: {
                Cookie: this.buildCookieHeader(),
                Accept: "application/json",
            },
        });
        this.parseCookiesFromHeaders(res.headers);
        return this.handleResponse(res);
    }
    async handleResponse(res) {
        const text = await res.text();
        try {
            const json = JSON.parse(text);
            if (!res.ok) {
                return {
                    error: true,
                    status: res.status,
                    message: json.error || json.message || `HTTP ${res.status}`,
                    data: json,
                };
            }
            return json;
        }
        catch {
            if (!res.ok) {
                return {
                    error: true,
                    status: res.status,
                    message: text || `HTTP ${res.status}`,
                };
            }
            return { text };
        }
    }
}
//# sourceMappingURL=client.js.map