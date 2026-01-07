import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/auth'

// Production-ready admin projects API
export async function GET(request: NextRequest) {
  try {
    const { isAdmin, userId } = await verifyAdmin(request)
    if (!userId || !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projects = await prisma.project.findMany({
      orderBy: { order: 'asc' },
      include: {
        author: { select: { id: true, name: true, email: true } },
        tags: { include: { tag: true } }
      }
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, slug, description, status, techStack, liveUrl, githubUrl, order, progress, priority, studyChunks, mnemonics, recallQuestions } = body
    const { isAdmin, userId } = await verifyAdmin(request)

    if (!userId || !isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const projectSlug = slug.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\s-]+/g, '-')
    const existingProject = await prisma.project.findUnique({ where: { slug: projectSlug } })
    if (existingProject) return NextResponse.json({ error: 'Slug taken' }, { status: 409 })

    const project = await prisma.project.create({
      data: {
        title,
        slug: projectSlug,
        description,
        status: status || 'in-progress',
        techStack: JSON.stringify(techStack || []),
        liveUrl: liveUrl || null,
        githubUrl: githubUrl || null,
        order: order || 0,
        progress: progress || 0,
        priority: priority || 'medium',
        studyChunks: studyChunks || null,
        mnemonics: mnemonics || null,
        recallQuestions: recallQuestions || null,
        authorId: userId
      }
    })

    if (techStack && Array.isArray(techStack)) {
      const normalizedTechStack = techStack.map(t => typeof t === 'string' ? t : t.name).filter(Boolean)
      await prisma.project.update({ where: { id: project.id }, data: { techStack: JSON.stringify(normalizedTechStack) } })

      for (const techName of normalizedTechStack) {
        let tag = await prisma.tag.findUnique({ where: { name: techName } })
        if (!tag) {
          tag = await prisma.tag.create({
            data: {
              name: techName,
              slug: techName.toLowerCase().replace(/\s+/g, '-'),
              color: '#6b7280'
            }
          })
        }
        await prisma.projectTag.create({ data: { projectId: project.id, tagId: tag.id } })
      }
    }

    return NextResponse.json({ success: true, project })
  } catch (error: any) {
    if (error.code === 'P2002') return NextResponse.json({ error: 'Slug taken' }, { status: 409 })
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, title, slug, description, status, techStack, liveUrl, githubUrl, order, progress, priority, studyChunks, mnemonics, recallQuestions } = body
    const { isAdmin, userId } = await verifyAdmin(request)

    if (!userId || !isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const updateData: any = {
      ...(title && { title }),
      ...(description && { description }),
      ...(status && { status }),
      ...(techStack && { techStack: JSON.stringify(techStack) }),
      ...(liveUrl !== undefined && { liveUrl: liveUrl || null }),
      ...(githubUrl !== undefined && { githubUrl: githubUrl || null }),
      ...(order !== undefined && { order }),
      ...(progress !== undefined && { progress }),
      ...(priority !== undefined && { priority }),
      ...(studyChunks !== undefined && { studyChunks }),
      ...(mnemonics !== undefined && { mnemonics }),
      ...(recallQuestions !== undefined && { recallQuestions }),
      updatedAt: new Date()
    }

    if (slug) {
      const projectSlug = slug.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\s-]+/g, '-')
      const existingProject = await prisma.project.findFirst({ where: { slug: projectSlug, NOT: { id: id } } })
      if (existingProject) return NextResponse.json({ error: 'Slug taken' }, { status: 409 })
      updateData.slug = projectSlug
    }

    const project = await prisma.project.update({ where: { id }, data: updateData })

    if (techStack && Array.isArray(techStack)) {
      const normalizedTechStack = techStack.map(t => typeof t === 'string' ? t : t.name).filter(Boolean)
      await prisma.project.update({ where: { id }, data: { techStack: JSON.stringify(normalizedTechStack) } })
      await prisma.projectTag.deleteMany({ where: { projectId: id } })

      for (const techName of normalizedTechStack) {
        let tag = await prisma.tag.findUnique({ where: { name: techName } })
        if (!tag) {
          tag = await prisma.tag.create({
            data: {
              name: techName,
              slug: techName.toLowerCase().replace(/\s+/g, '-'),
              color: '#6b7280'
            }
          })
        }
        await prisma.projectTag.create({ data: { projectId: id, tagId: tag.id } })
      }
    }

    return NextResponse.json({ success: true, project })
  } catch (error: any) {
    if (error.code === 'P2002') return NextResponse.json({ error: 'Slug taken' }, { status: 409 })
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body
    const { isAdmin, userId } = await verifyAdmin(request)
    if (!id || !userId || !isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await prisma.project.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
