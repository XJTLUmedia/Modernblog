import { NextRequest, NextResponse } from 'next/server'
import { generateAIContent } from '@/lib/ai'

export async function POST(request: NextRequest) {
    try {
        const { title, content } = await request.json()

        const systemPrompt = `You are a "Memory Engineer". 
Create ONE high-impact mnemonic or "Memory Anchor" phrase that encapsulates the core purpose of this project.

Format: "Phrase" — Explanation.
Return ONLY a JSON array containing that one string.

Title: ${title}
Content: ${content.slice(0, 2000)}`

        const aiResponse = await generateAIContent({
            messages: [
                { role: 'system', content: 'You are a helpful JSON assistant.' },
                { role: 'user', content: systemPrompt }
            ]
        })

        const jsonMatch = aiResponse.match(/\[.*\]/s)
        return NextResponse.json({
            mnemonics: jsonMatch ? JSON.parse(jsonMatch[0]) : ["Forge, Sync, Deploy — The standard workflow."]
        })
    } catch (error) {
        return NextResponse.json({ mnemonics: ["Analyze, Build, Refine."] })
    }
}