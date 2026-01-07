import { NextRequest, NextResponse } from 'next/server'
import { generateAIContent } from '@/lib/ai'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { question, answer, context } = body

        if (!question || !answer) {
            return NextResponse.json({ error: 'Question and answer are required' }, { status: 400 })
        }

        const systemPrompt = `You are a "Neural Integration Validator". 
Your goal is to evaluate a user's answer to a recall question based on the provided context.

Context: 
${context?.slice(0, 2000) || 'No context provided.'}

Question: ${question}
User Answer: ${answer}

Instructions:
1. Compare the user's answer to the actual knowledge in the context.
2. Provide constructive, high-level feedback (2-3 sentences max).
3. Use a tone that is encouraging, scientific, and "engineering-focused".
4. Focus on whether they captured the core essence, even if the phrasing is different.
5. Mention a specific "Encoding Tip" if they missed something crucial.`

        const feedback = await generateAIContent({
            messages: [
                { role: 'system', content: 'You are a helpful AI that validates learning and retrieval.' },
                { role: 'user', content: systemPrompt }
            ]
        })

        return NextResponse.json({ feedback: feedback || "Analysis suspended. Neural pathways inconclusive." })
    } catch (error) {
        console.error('AI Verify Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
