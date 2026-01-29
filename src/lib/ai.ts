/**
 * Simple, production-ready AI utility for content summarization and semantic search fallback.
 * This avoids heavy dependencies and works with basic fetch.
 */

interface AICompletionOptions {
    messages: { role: 'user' | 'assistant' | 'system'; content: string }[]
    limit?: number
}

// Log provider selection once per process (helps avoid noisy logs)
let providerLogged = false
let pollinationsLogged = false
let openaiLogged = false

export async function generateAIContent(options: AICompletionOptions): Promise<string | null> {
    // NOTE:
    // - OPENAI_API_KEY is for OpenAI's API only.
    // - GEMINI_API_KEY (if you use it elsewhere) is NOT compatible with OpenAI endpoints.
    const openaiKey = process.env.OPENAI_API_KEY

    // Helper: fetch with a timeout so this route can't hang forever
    const fetchWithTimeout = async (url: string, init: RequestInit, timeoutMs = 25000) => {
        const controller = new AbortController()
        const id = setTimeout(() => controller.abort(), timeoutMs)
        try {
            return await fetch(url, { ...init, signal: controller.signal })
        } finally {
            clearTimeout(id)
        }
    }

    // Primary: OpenAI (only if key is present)
    if (openaiKey) {
        if (!providerLogged || !openaiLogged) {
            console.log('AI provider available: OpenAI (primary)')
            providerLogged = true
            openaiLogged = true
        }

        try {
            const response = await fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openaiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: options.messages,
                    temperature: 0.7
                })
            })

            if (!response.ok) {
                // Capture the provider's error body so failures aren't silent.
                const errText = await response.text().catch(() => '')
                throw new Error(`OpenAI API error: ${response.status} - ${errText}`)
            }

            const data = await response.json()
            return data.choices?.[0]?.message?.content ?? null
        } catch (error) {
            console.error('AI API Error (Primary):', error)
            // Fallthrough to Pollinations as a fallback
            if (!pollinationsLogged) {
                console.log('AI provider fallback: Pollinations.ai (OpenAI-compatible)')
                pollinationsLogged = true
            }
        }
    } else {
        // No OpenAI key: Pollinations is the selected provider (not a fallback)
        if (!providerLogged || !pollinationsLogged) {
            console.log('AI provider selected: Pollinations.ai (free; no OPENAI_API_KEY set)')
            providerLogged = true
            pollinationsLogged = true
        }
    }

    // Pollinations.ai (OpenAI Compatible Endpoint)
    try {
        const response = await fetchWithTimeout('https://text.pollinations.ai/openai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'openai',
                messages: options.messages,
                temperature: 0.7,
            })
        })

        if (!response.ok) {
            const errText = await response.text().catch(() => '')
            throw new Error(`Pollinations API error: ${response.status} - ${errText}`)
        }

        const data = await response.json()
        return data.choices?.[0]?.message?.content ?? null
    } catch (fallbackError) {
        console.error('AI API Error (Fallback):', fallbackError)
        return null
    }
}

/**
 * Enhanced keyword-based similarity scoring for local search fallback.
 */
export function calculateRelevance(query: string, item: { title: string; content?: string; description?: string }): number {
    const q = query.toLowerCase()
    const title = item.title.toLowerCase()
    const body = (item.content || item.description || '').toLowerCase()

    let score = 0

    // Title match (high weight)
    if (title.includes(q)) score += 0.8

    // Body match (medium weight)
    if (body.includes(q)) score += 0.4

    // Partial matches
    const words = q.split(/\s+/)
    words.forEach(word => {
        if (word.length < 3) return
        if (title.includes(word)) score += 0.2
        if (body.includes(word)) score += 0.1
    })

    return Math.min(score, 1.0)
}
