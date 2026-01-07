import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/auth'

// Production-ready admin garden API
export async function GET(request: NextRequest) {
  try {
    // Verify admin status
    const { isAdmin, userId } = await verifyAdmin(request)
    if (!userId || !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    // 2. If a slug is provided, return that specific note
    if (slug) {
      const note = await prisma.gardenNote.findUnique({
        where: { slug: slug.toLowerCase().trim() },
        include: {
          author: { select: { name: true } },
          tags: { include: { tag: true } }
        }
      })

      if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 })
      return NextResponse.json(note)
    }

    // 3. If NO slug is provided, return the FULL LIST for the admin dashboard
    const notes = await prisma.gardenNote.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        tags: { include: { tag: true } }
      }
    })

    return NextResponse.json(notes)
  } catch (error) {
    console.error('Error fetching garden notes:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, slug, content, status, tags, recallQuestions, reviewInterval } = body

    // Verify admin status (checks database if cookies are stale)
    const { isAdmin, userId } = await verifyAdmin(request)

    if (!userId || !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const noteSlug = slug.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\s-]+/g, '-')

    // Check if slug already exists
    const existingNote = await prisma.gardenNote.findUnique({
      where: { slug: noteSlug }
    })

    if (existingNote) {
      return NextResponse.json(
        { error: 'A garden note with this slug already exists. Please use a different slug.' },
        { status: 409 }
      )
    }

    // Create garden note
    const note = await prisma.gardenNote.create({
      data: {
        title,
        slug: noteSlug,
        content,
        status: status || 'seedling',
        authorId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        // @ts-ignore
        recallQuestions: recallQuestions || null,
        reviewInterval: reviewInterval || 1
      }
    })

    // Handle tags if provided
    if (tags && Array.isArray(tags)) {
      const normalizedTags = tags.map(t => typeof t === 'string' ? t : t.name).filter(Boolean)
      for (const tagName of normalizedTags) {
        let tag = await prisma.tag.findUnique({
          where: { name: tagName }
        })

        if (!tag) {
          tag = await prisma.tag.create({
            data: {
              name: tagName,
              slug: tagName.toLowerCase().replace(/\s+/g, '-'),
              color: '#10b981'
            }
          })
        }

        // Connect note to tag
        await prisma.gardenNoteTag.create({
          data: {
            gardenNoteId: note.id,
            tagId: tag.id
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      note
    })
  } catch (error: any) {
    console.error('Error creating garden note:', error)

    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A garden note with this slug already exists. Please use a different slug.' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create garden note' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, title, slug, content, status, tags, recallQuestions, reviewInterval } = body

    // Verify admin status (checks database if cookies are stale)
    const { isAdmin, userId } = await verifyAdmin(request)

    if (!userId || !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const updateData: any = {
      ...(title && { title }),
      ...(content && { content }),
      ...(status && { status }),
      ...(recallQuestions !== undefined && { recallQuestions }),
      ...(reviewInterval !== undefined && { reviewInterval }),
      updatedAt: new Date()
    }

    if (slug) {
      const noteSlug = slug.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\s-]+/g, '-')

      // Check if slug is taken by another note
      if (noteSlug) {
        const existingNote = await prisma.gardenNote.findFirst({
          where: {
            slug: noteSlug,
            NOT: { id: id }
          }
        })

        if (existingNote) {
          return NextResponse.json(
            { error: 'This slug is already in use by another garden note.' },
            { status: 409 }
          )
        }

        updateData.slug = noteSlug
      }
    }

    const note = await prisma.gardenNote.update({
      where: { id },
      data: updateData
    })

    // Handle tags if provided
    if (tags && Array.isArray(tags)) {
      const normalizedTags = tags.map(t => typeof t === 'string' ? t : t.name).filter(Boolean)
      // Remove existing tags
      await prisma.gardenNoteTag.deleteMany({
        where: { gardenNoteId: id }
      })

      // Add new tags
      for (const tagName of normalizedTags) {
        let tag = await prisma.tag.findUnique({
          where: { name: tagName }
        })

        if (!tag) {
          tag = await prisma.tag.create({
            data: {
              name: tagName,
              slug: tagName.toLowerCase().replace(/\s+/g, '-'),
              color: '#10b981'
            }
          })
        }

        await prisma.gardenNoteTag.create({
          data: {
            gardenNoteId: id,
            tagId: tag.id
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      note
    })
  } catch (error: any) {
    console.error('Error updating garden note:', error)

    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'This slug is already in use by another garden note.' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to update garden note' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Garden note ID is required' },
        { status: 400 }
      )
    }

    // Verify admin status (checks database if cookies are stale)
    const { isAdmin, userId } = await verifyAdmin(request)

    if (!userId || !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Delete garden note
    await prisma.gardenNote.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Garden note deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting garden note:', error)
    return NextResponse.json(
      { error: 'Failed to delete garden note' },
      { status: 500 }
    )
  }
}
