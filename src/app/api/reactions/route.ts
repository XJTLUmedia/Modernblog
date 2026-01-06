import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/prisma'

// GET /api/reactions - Get reactions for a post
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    const reactions = await db.reaction.groupBy({
      by: ['emoji'],
      where: { postId },
      _count: {
        emoji: true
      }
    })

    const formattedReactions = reactions.map(r => ({
      emoji: r.emoji,
      count: r._count.emoji
    }))

    return NextResponse.json(formattedReactions)
  } catch (error) {
    console.error('Error fetching reactions:', error)
    return NextResponse.json({ error: 'Failed to fetch reactions' }, { status: 500 })
  }
}

// POST /api/reactions - Add or remove a reaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { postId, emoji, authorId } = body

    if (!postId || !emoji || !authorId) {
      return NextResponse.json({ error: 'Post ID, emoji, and author ID are required' }, { status: 400 })
    }

    // Check if reaction already exists
    const existingReaction = await db.reaction.findUnique({
      where: {
        postId_emoji_authorId: {
          postId,
          emoji,
          authorId
        }
      }
    })

    if (existingReaction) {
      // Remove the reaction
      await db.reaction.delete({
        where: { id: existingReaction.id }
      })
    } else {
      // Add the reaction
      await db.reaction.create({
        data: {
          postId,
          emoji,
          authorId
        }
      })
    }

    // Return updated reactions
    const reactions = await db.reaction.groupBy({
      by: ['emoji'],
      where: { postId },
      _count: {
        emoji: true
      }
    })

    const formattedReactions = reactions.map(r => ({
      emoji: r.emoji,
      count: r._count.emoji
    }))

    return NextResponse.json(formattedReactions)
  } catch (error) {
    console.error('Error updating reaction:', error)
    return NextResponse.json({ error: 'Failed to update reaction' }, { status: 500 })
  }
}
