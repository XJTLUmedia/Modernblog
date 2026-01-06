import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/prisma'

// GET /api/guestbook - Get all guestbook entries
export async function GET() {
  try {
    const entries = await db.guestbookEntry.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(entries)
  } catch (error) {
    console.error('Error fetching guestbook entries:', error)
    return NextResponse.json({ error: 'Failed to fetch guestbook entries' }, { status: 500 })
  }
}

// POST /api/guestbook - Create a new guestbook entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, message, website, authorId } = body

    if (!name || !message) {
      return NextResponse.json({ error: 'Name and message are required' }, { status: 400 })
    }

    const entry = await db.guestbookEntry.create({
      data: {
        name,
        message,
        website,
        authorId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error('Error creating guestbook entry:', error)
    return NextResponse.json({ error: 'Failed to create guestbook entry' }, { status: 500 })
  }
}

// DELETE /api/guestbook - Delete a guestbook entry
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 })
    }

    await db.guestbookEntry.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting guestbook entry:', error)
    return NextResponse.json({ error: 'Failed to delete guestbook entry' }, { status: 500 })
  }
}
