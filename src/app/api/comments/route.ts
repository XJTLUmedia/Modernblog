import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const postId = searchParams.get('postId')
        const gardenNoteId = searchParams.get('gardenNoteId')

        if (!postId && !gardenNoteId) {
            return NextResponse.json({ error: 'postId or gardenNoteId required' }, { status: 400 })
        }

        const comments = await db.comment.findMany({
            where: {
                postId: postId || undefined,
                gardenNoteId: gardenNoteId || undefined,
                parentId: null // Top level comments only
            },
            include: {
                author: {
                    select: { name: true, email: true }
                },
                replies: {
                    include: {
                        author: { select: { name: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(comments)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await verifyAuth(request)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { content, postId, gardenNoteId, parentId } = body

        if (!content) {
            return NextResponse.json({ error: 'Content required' }, { status: 400 })
        }

        const comment = await db.comment.create({
            data: {
                content,
                postId,
                gardenNoteId,
                parentId,
                authorId: user.id,
                authorName: user.name,
                authorEmail: user.email
            },
            include: {
                author: { select: { name: true, email: true } }
            }
        })

        return NextResponse.json(comment)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 })
    }
}
