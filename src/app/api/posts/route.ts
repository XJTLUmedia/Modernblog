import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Helper to normalize slugs consistently across the app
const normalizeSlug = (s: string) => s.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\s-]+/g, '')

// GET /api/posts - Get all posts or a specific post by slug
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const published = searchParams.get('published')
    const featured = searchParams.get('featured')
    const limit = searchParams.get('limit')
    const tag = searchParams.get('tag')

    if (slug) {
      const targetSlug = normalizeSlug(slug)

      // 1. Try fetching directly
      let post = await prisma.post.findUnique({
        where: { slug: targetSlug },
        include: {
          author: { select: { id: true, name: true } },
          tags: { include: { tag: true } },
          comments: {
            where: { parentId: null },
            include: {
              author: { select: { id: true, name: true } },
              replies: { include: { author: { select: { id: true, name: true } } } }
            },
            orderBy: { createdAt: 'desc' }
          },
          reactions: true // Fetching raw reactions to group in JS for SQLite compatibility
        }
      })

      // 2. Case-insensitive fallback for SQLite
      // Note: SQLite doesn't natively support 'mode: insensitive' in Prisma.
      if (!post) {
        const matchingPost = await (prisma.post as any).findFirst({
          where: { slug: targetSlug },
          include: {
            author: { select: { id: true, name: true } },
            tags: { include: { tag: true } },
            comments: {
              where: { parentId: null },
              include: {
                author: { select: { id: true, name: true } },
                replies: { include: { author: { select: { id: true, name: true } } } }
              }
            },
            reactions: true
          }
        })
        post = matchingPost
      }

      if (!post) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 })
      }

      // 3. Update view count (fire and forget or await)
      await prisma.post.update({
        where: { id: post.id },
        data: { viewCount: { increment: 1 } }
      })

      // 4. Format reactions manually for consistent structure
      const reactionCounts = post.reactions.reduce((acc: any, curr: any) => {
        acc[curr.emoji] = (acc[curr.emoji] || 0) + 1
        return acc
      }, {})

      const formattedReactions = Object.entries(reactionCounts).map(([emoji, count]) => ({
        emoji,
        count
      }))

      return NextResponse.json({
        ...post,
        reactions: formattedReactions
      })
    }

    // LIST VIEW
    const where: any = {}
    if (published === 'true') where.published = true
    if (featured === 'true') where.featured = true
    if (tag) {
      where.tags = { some: { tag: { slug: tag } } }
    }

    const posts = await prisma.post.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        readingTime: true,
        viewCount: true,
        published: true,
        featured: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        author: { select: { id: true, name: true } },
        tags: { select: { tag: true } }
      },
      orderBy: published === 'true' ? { publishedAt: 'desc' } : { updatedAt: 'desc' },
      take: limit ? parseInt(limit) : undefined
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, excerpt, content, coverImage, published, featured, authorId, tags } = body

    // Ensure slug is generated correctly if not provided or to ensure format
    const slug = body.slug ? normalizeSlug(body.slug) : normalizeSlug(title)

    const wordCount = content?.split(/\s+/).length || 0
    const readingTime = Math.ceil(wordCount / 200)

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        coverImage,
        published: !!published,
        featured: !!featured,
        readingTime,
        authorId,
        publishedAt: published ? new Date() : null,
        tags: tags ? {
          create: tags.map((tagSlug: string) => ({
            tag: { connect: { slug: tagSlug } }
          }))
        } : undefined
      },
      include: { author: true, tags: { include: { tag: true } } }
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}

// PUT /api/posts - Update a post
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, title, excerpt, content, coverImage, published, featured, tags } = body

    const wordCount = content?.split(/\s+/).length || 0
    const readingTime = Math.ceil(wordCount / 200)

    // Get current state to check publishing status
    const currentPost = await prisma.post.findUnique({ where: { id } })

    const post = await prisma.post.update({
      where: { id },
      data: {
        title,
        excerpt,
        content,
        coverImage,
        published,
        featured,
        readingTime,
        // Only set publishedAt if it's being published for the first time
        publishedAt: published && !currentPost?.published ? new Date() : undefined,
      },
      include: { author: true, tags: { include: { tag: true } } }
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}

// DELETE /api/posts - Delete a post
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })

    await prisma.post.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}