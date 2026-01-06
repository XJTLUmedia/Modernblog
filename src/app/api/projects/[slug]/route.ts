import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Get a single project by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Normalize slug for query
    const normalizedSlug = slug.toLowerCase().trim()

    const project = await prisma.project.findUnique({
      where: { slug: normalizedSlug },
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

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Increment view count
    await prisma.project.update({
      where: { id: project.id },
      data: { viewCount: { increment: 1 } }
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}

