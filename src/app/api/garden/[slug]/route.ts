import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    const normalizedSlug = slug.toLowerCase().trim()

    // 1. Try fetching directly
    let note = await prisma.gardenNote.findUnique({
      where: { slug: normalizedSlug },
      include: {
        author: {
          select: { name: true }
        },
        tags: {
          include: {
            tag: {
              select: { id: true, name: true, slug: true }
            }
          }
        }
      }
    })

    // 2. Fallback for case-insensitive search (especially important for SQLite/slug variations)
    // Note: SQLite doesn't natively support 'mode: insensitive' in Prisma without specific extensions,
    // so we rely on our normalization and exact match, or simple findFirst.
    if (!note) {
      note = await (prisma.gardenNote as any).findFirst({
        where: { slug: normalizedSlug },
        include: {
          author: {
            select: { name: true }
          },
          tags: {
            include: {
              tag: {
                select: { id: true, name: true, slug: true }
              }
            }
          }
        }
      })
    }

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    // 3. Update view count
    await prisma.gardenNote.update({
      where: { id: note.id },
      data: { viewCount: { increment: 1 } }
    })

    return NextResponse.json(note)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch garden note' },
      { status: 500 }
    )
  }
}
