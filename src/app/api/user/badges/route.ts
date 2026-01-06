import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
    try {
        const user = await verifyAuth(req)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userBadges = await db.userBadge.findMany({
            where: { userId: user.id },
            include: { badge: true },
            orderBy: { assignedAt: 'desc' }
        })

        return NextResponse.json(userBadges.map(ub => ({
            ...ub.badge,
            assignedAt: ub.assignedAt
        })))

    } catch (error) {
        console.error('Get Badges Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
