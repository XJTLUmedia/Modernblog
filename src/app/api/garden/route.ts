import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const notes = await prisma.gardenNote.findMany({
      // You might want to only show "evergreen" or "growing" notes to the public
      // where: { status: { in: ['growing', 'evergreen'] } }, 
      orderBy: { updatedAt: 'desc' },
      include: {
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(notes)
  } catch (error) {
    console.error('Error fetching garden notes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch garden notes' },
      { status: 500 }
    )
  }
}