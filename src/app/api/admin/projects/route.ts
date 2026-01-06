import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/auth'

// Production-ready admin projects API
export async function GET(request: NextRequest) {
  try {
    // Verify admin status
    const { isAdmin, userId } = await verifyAdmin(request)
    if (!userId || !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projects = await prisma.project.findMany({
      orderBy: {
        order: 'asc'
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, slug, description, status, techStack, liveUrl, githubUrl, order, progress, priority } = body

    // Verify admin status (checks database if cookies are stale)
    const { isAdmin, userId } = await verifyAdmin(request)

    if (!userId || !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        title,
        slug: slug.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\s-]+/g, '-'),
        description,
        status: status || 'in-progress',
        techStack: JSON.stringify(techStack || []),
        liveUrl: liveUrl || null,
        githubUrl: githubUrl || null,
        order: order || 0,
        progress: progress || 0,
        priority: priority || 'medium',
        authorId: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Handle tags if provided
    if (techStack && Array.isArray(techStack)) {
      for (const techName of techStack) {
        let tag = await prisma.tag.findUnique({
          where: { name: techName }
        })

        if (!tag) {
          const colorMap: { [key: string]: string } = {
            'React': '#61dafb',
            'Next.js': '#000000',
            'TypeScript': '#3178c6',
            'Tailwind CSS': '#06b6d4',
            'shadcn/ui': '#3b82f6',
            'Node.js': '#339933',
            'PostgreSQL': '#336791',
            'Prisma': '#0c344b',
            'GraphQL': '#e10098',
            'REST API': '#20c997',
            'WebSocket': '#010722',
            'Redis': '#dc382d',
            'Vercel': '#ffffff',
            'Docker': '#2496ed',
            'default': '#6b7280'
          }

          tag = await prisma.tag.create({
            data: {
              name: techName,
              slug: techName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\s-]+/g, '-'),
              color: colorMap[techName] || colorMap['default']
            }
          })
        }

        // Connect project to tag
        await prisma.projectTag.create({
          data: {
            projectId: project.id,
            tagId: tag.id
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      project
    })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, title, slug, description, status, techStack, liveUrl, githubUrl, order, progress, priority } = body

    // Verify admin status (checks database if cookies are stale)
    const { isAdmin, userId } = await verifyAdmin(request)

    if (!userId || !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(slug && {
          slug: slug.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\s-]+/g, '-')
        }),
        ...(description && { description }),
        ...(status && { status }),
        ...(techStack && { techStack: JSON.stringify(techStack) }),
        ...(liveUrl !== undefined && { liveUrl: liveUrl || null }),
        ...(githubUrl !== undefined && { githubUrl: githubUrl || null }),
        ...(order !== undefined && { order }),
        ...(progress !== undefined && { progress }),
        ...(priority !== undefined && { priority }),
        updatedAt: new Date()
      }
    })

    // Handle tags if techStack provided
    if (techStack && Array.isArray(techStack)) {
      // Remove existing tags
      await prisma.projectTag.deleteMany({
        where: { projectId: id }
      })

      // Add new tags
      for (const techName of techStack) {
        let tag = await prisma.tag.findUnique({
          where: { name: techName }
        })

        if (!tag) {
          tag = await prisma.tag.create({
            data: {
              name: techName,
              slug: techName.toLowerCase().replace(/\s+/g, '-'),
              color: '#6b7280'
            }
          })
        }

        await prisma.projectTag.create({
          data: {
            projectId: id,
            tagId: tag.id
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      project
    })
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: 'Failed to update project' },
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
        { error: 'Project ID is required' },
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

    // Delete project (tags will cascade delete)
    await prisma.project.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}
