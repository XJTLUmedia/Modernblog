import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/prisma'

// GET /api/user/profile - Get current user's profile data
export async function GET(request: NextRequest) {
    try {
        const userId = request.cookies.get('user_id')?.value

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await db.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                bio: true,
                website: true,
                createdAt: true
            }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        return NextResponse.json(user)
    } catch (error) {
        console.error('Profile fetch error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PUT /api/user/profile - Update user profile data
export async function PUT(request: NextRequest) {
    try {
        const userId = request.cookies.get('user_id')?.value

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { name, bio, website } = body

        const updatedUser = await db.user.update({
            where: { id: userId },
            data: {
                name,
                bio,
                website
            }
        })

        return NextResponse.json({
            success: true,
            user: {
                id: (updatedUser as any).id,
                name: (updatedUser as any).name,
                email: (updatedUser as any).email,
                bio: (updatedUser as any).bio,
                website: (updatedUser as any).website
            }
        })
    } catch (error) {
        console.error('Profile update error:', error)
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }
}
