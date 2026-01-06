import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/prisma'
import { generateAIContent } from '@/lib/ai'

// POST /api/summarize - Generate AI summary for a post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { postId } = body

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    // Get the post
    const post = await db.post.findUnique({
      where: { id: postId }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Use AI to generate summary
    const aiSummary = await generateAIContent({
      messages: [
        {
          role: 'system',
          content: `You are an expert content summarizer. Create a concise TL;DR summary using bullet points (starting with "• ").`
        },
        {
          role: 'user',
          content: `Summarize this post:\nTitle: ${post.title}\nContent: ${post.content}`
        }
      ]
    })

    if (!aiSummary) {
      return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 })
    }

    // Update the post with the summary
    await db.post.update({
      where: { id: postId },
      data: { summary: aiSummary }
    })

    return NextResponse.json({
      postId,
      summary: aiSummary
    })
  } catch (error) {
    console.error('Error generating summary:', error)
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 })
  }
}
