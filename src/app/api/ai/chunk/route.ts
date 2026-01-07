import { NextRequest, NextResponse } from 'next/server'
import { generateAIContent } from '@/lib/ai'

export async function POST(request: NextRequest) {
    try {
        const { title, content } = await request.json()

        const systemPrompt = `You are a "System Architect". 
Decompose the following project into 3-4 high-level "Architectural Chunks" (logical modules).
Return ONLY a JSON array of strings. Each string should be 2-4 words.

Title: ${title}
Content: ${content.slice(0, 2000)}`

        const aiResponse = await generateAIContent({
            messages: [
                { role: 'system', content: 'You are a technical JSON assistant.' },
                { role: 'user', content: systemPrompt }
            ]
        })

        const jsonMatch = aiResponse.match(/\[.*\]/s)
        return NextResponse.json({
            chunks: jsonMatch ? JSON.parse(jsonMatch[0]) : ["Core Logic", "Data Interface", "UI Engine"]
        })
    } catch (error) {
        return NextResponse.json({ chunks: ["System Architecture", "Functional Logic", "Integration Layer"] })
    }
}