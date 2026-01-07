import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/auth'

// Production-ready admin blog posts API
export async function GET(request: NextRequest) {
  try {
    // Verify admin status
    const { isAdmin, userId } = await verifyAdmin(request)
    if (!userId || !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        published: true,
        readingTime: true,
        viewCount: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
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
        },
        _count: {
          select: { reactions: true }
        }
      }
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, slug, excerpt, content, published, tags, recallQuestions, mnemonics } = body

    // Verify admin status (checks database if cookies are stale)
    const { isAdmin, userId } = await verifyAdmin(request)

    console.log('Create post - Auth check:', { userId, isAdmin })

    if (!userId || !isAdmin) {
      console.log('Create post - Unauthorized:', { userId: !!userId, isAdmin })
      return NextResponse.json(
        { error: 'Unauthorized. Please log in as an administrator.' },
        { status: 401 }
      )
    }

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: 'Title, slug, and content are required' },
        { status: 400 }
      )
    }

    const postSlug = slug.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\s-]+/g, '-')

    // Check if slug already exists
    const existingPost = await prisma.post.findUnique({
      where: { slug: postSlug }
    })

    if (existingPost) {
      return NextResponse.json(
        { error: 'A post with this slug already exists. Please use a different slug.' },
        { status: 409 }
      )
    }

    const post = await prisma.post.create({
      data: {
        title,
        slug: postSlug,
        excerpt: excerpt || null,
        content,
        published: published ?? false,
        authorId: userId,
        publishedAt: published ? new Date() : null,
        readingTime: Math.ceil(content.split(/\s+/).length / 200),
        // @ts-ignore
        recallQuestions: recallQuestions || null,
        mnemonics: mnemonics || null
      }
    })

    console.log('Post created successfully:', { id: post.id, title: post.title, slug: post.slug })

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
              color: '#3b82f6'
            }
          })
        }

        await prisma.postTag.create({
          data: {
            postId: post.id,
            tagId: tag.id
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      post
    })
  } catch (error: any) {
    console.error('Error creating post:', error)

    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A post with this slug already exists. Please use a different slug.' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create post' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, title, slug, excerpt, content, published, tags, recallQuestions, mnemonics } = body

    // Verify admin status (checks database if cookies are stale)
    const { isAdmin, userId } = await verifyAdmin(request)

    if (!userId || !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      )
    }

    const updateData: any = {
      updatedAt: new Date()
    }

    if (title) updateData.title = title
    if (slug) {
      const postSlug = slug.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\s-]+/g, '-')

      // Check if slug is taken by another post
      const existingPost = await prisma.post.findFirst({
        where: {
          slug: postSlug,
          NOT: { id: id }
        }
      })

      if (existingPost) {
        return NextResponse.json(
          { error: 'This slug is already in use by another post.' },
          { status: 409 }
        )
      }

      updateData.slug = postSlug
    }
    if (excerpt !== undefined) updateData.excerpt = excerpt || null
    if (content) {
      updateData.content = content
      updateData.readingTime = Math.ceil(content.split(/\s+/).length / 200)
    }
    if (published !== undefined) {
      updateData.published = published
      if (published && !updateData.publishedAt) {
        updateData.publishedAt = new Date()
      }
    }
    if (recallQuestions !== undefined) updateData.recallQuestions = recallQuestions
    if (mnemonics !== undefined) updateData.mnemonics = mnemonics

    const post = await prisma.post.update({
      where: { id },
      data: updateData,
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

    // Handle tags if provided
    if (tags && Array.isArray(tags)) {
      const normalizedTags = tags.map(t => typeof t === 'string' ? t : t.name).filter(Boolean)
      // Remove existing tags
      await prisma.postTag.deleteMany({
        where: { postId: id }
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
              color: '#3b82f6'
            }
          })
        }

        await prisma.postTag.create({
          data: {
            postId: id,
            tagId: tag.id
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      post
    })
  } catch (error: any) {
    console.error('Error updating post:', error)

    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'This slug is already in use by another post.' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to update post' },
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
        { error: 'Post ID is required' },
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

    await prisma.post.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully'
    })
  } catch (error: any) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete post' },
      { status: 500 }
    )
  }
}
