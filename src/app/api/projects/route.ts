import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Public projects API
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: {
        order: 'asc'
      },
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        },
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

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

