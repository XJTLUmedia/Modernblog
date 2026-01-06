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
    const { title, slug, content, status, tags } = body

    // Verify admin status (checks database if cookies are stale)
    const { isAdmin, userId } = await verifyAdmin(request)

    if (!userId || !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Create garden note
    const note = await prisma.gardenNote.create({
      data: {
        title,
        slug: slug.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\s-]+/g, '-'),
        content,
        status: status || 'seedling',
        authorId: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Handle tags if provided
    if (tags && Array.isArray(tags)) {
      for (const tagName of tags) {
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
  } catch (error) {
    console.error('Error creating garden note:', error)
    return NextResponse.json(
      { error: 'Failed to create garden note' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, title, slug, content, status, tags } = body

    // Verify admin status (checks database if cookies are stale)
    const { isAdmin, userId } = await verifyAdmin(request)

    if (!userId || !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const note = await prisma.gardenNote.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(slug && {
          slug: slug.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\s-]+/g, '-')
        }),
        ...(content && { content }),
        ...(status && { status }),
        updatedAt: new Date()
      }
    })

    // Handle tags if provided
    if (tags && Array.isArray(tags)) {
      // Remove existing tags
      await prisma.gardenNoteTag.deleteMany({
        where: { gardenNoteId: id }
      })

      // Add new tags
      for (const tagName of tags) {
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
  } catch (error) {
    console.error('Error updating garden note:', error)
    return NextResponse.json(
      { error: 'Failed to update garden note' },
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
