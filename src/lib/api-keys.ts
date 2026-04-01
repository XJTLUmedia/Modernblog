import { prisma } from "@/lib/prisma";

/**
 * Resolve an API key: first check user's stored keys in the database,
 * then fall back to environment variables.
 */
export async function resolveApiKey(
    userId: string | undefined | null,
    keyName: string
): Promise<string | undefined> {
    // Try user-specific key first
    if (userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { apiKeys: true },
            });

            if (user?.apiKeys) {
                const keys = JSON.parse(user.apiKeys);
                if (keys[keyName]) {
                    return keys[keyName];
                }
            }
        } catch {
            // Fall through to env var
        }
    }

    // Fallback to environment variable
    return process.env[keyName];
}

/**
 * Resolve multiple API keys at once (single DB query).
 */
export async function resolveApiKeys(
    userId: string | undefined | null,
    keyNames: string[]
): Promise<Record<string, string | undefined>> {
    const result: Record<string, string | undefined> = {};

    let userKeys: Record<string, string> = {};
    if (userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { apiKeys: true },
            });
            if (user?.apiKeys) {
                userKeys = JSON.parse(user.apiKeys);
            }
        } catch {
            // Fall through
        }
    }

    for (const key of keyNames) {
        result[key] = userKeys[key] || process.env[key];
    }

    return result;
}
