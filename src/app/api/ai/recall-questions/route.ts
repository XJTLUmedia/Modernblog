import { NextRequest, NextResponse } from 'next/server'
import { generateAIContent } from '@/lib/ai'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { title, content } = body

        if (!title || !content) {
            return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
        }

        const systemPrompt = `You are a "Cognitive Retrieval Architect". 
Your goal is to generate 3 high-impact active recall questions for a blog post/note to help the user encode the information.

Title: ${title}
Content: ${content.slice(0, 3000)}

Instructions:
1. Questions should be challenging, requiring deep retrieval, not simple yes/no.
2. Focus on conceptual logic, core arguments, and technical nuances.
3. Return ONLY a JSON array of 3 strings.

Example:
["What is the fundamental bottleneck in the distributed system described?", "How does the proposed algorithm achieve O(1) complexity?", "Explain the relationship between 'Memory Anchors' and 'Dual Coding'."]`

        const aiResponse = await generateAIContent({
            messages: [
                { role: 'system', content: 'You are a helpful JSON-speaking assistant.' },
                { role: 'user', content: systemPrompt }
            ]
        })

        if (aiResponse) {
            const jsonMatch = aiResponse?.match(/\[[\s\S]*?\]/)
            if (jsonMatch) {
                return NextResponse.json({ questions: JSON.parse(jsonMatch[0]) })
            }
        }

        // Fallback if AI fails
        return NextResponse.json({
            questions: [
                "What are the three core arguments presented in this analysis?",
                "How does the proposed solution differ from current industry standards?",
                "Determine the single most critical takeaway for your specific workflow."
            ]
        })
    } catch (error) {
        console.error('AI Questions Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
