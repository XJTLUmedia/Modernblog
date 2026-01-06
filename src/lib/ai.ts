/**
 * Simple, production-ready AI utility for content summarization and semantic search fallback.
 * This avoids heavy dependencies and works with basic fetch.
 */

interface AICompletionOptions {
    messages: { role: 'user' | 'assistant' | 'system'; content: string }[]
    limit?: number
}

export async function generateAIContent(options: AICompletionOptions): Promise<string | null> {
    const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY

    // Primary: Use Official Keys if available
    if (apiKey) {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: options.messages,
                    temperature: 0.7
                })
            })

            const data = await response.json()
            return data.choices?.[0]?.message?.content || null
        } catch (error) {
            console.error('AI API Error (Primary):', error)
            // Fallthrough to fallback
        }
    }

    // Fallback: Pollinations.ai (OpenAI Compatible Endpoint)
    console.log('Using Pollinations.ai fallback (OpenAI-compatible)')
    try {
        const response = await fetch('https://text.pollinations.ai/openai', {
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
            const errText = await response.text();
            throw new Error(`Pollinations API error: ${response.status} - ${errText}`)
        }

        const data = await response.json()
        return data.choices?.[0]?.message?.content || null
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
