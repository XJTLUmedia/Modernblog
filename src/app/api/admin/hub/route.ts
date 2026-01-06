import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const { isAdmin } = await verifyAdmin(request)
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const hubData = await prisma.nowPage.findFirst({
            orderBy: { updatedAt: 'desc' }
        })

        return NextResponse.json(hubData || {
            content: '',
            learning: '[]',
            readingList: '[]',
            listeningTo: '[]',
            githubRepos: '[]'
        })
    } catch (error) {
        console.error('Error fetching hub data:', error)
        return NextResponse.json({ error: 'Failed to fetch hub data' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const { isAdmin } = await verifyAdmin(request)
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { content, learning, readingList, listeningTo, githubRepos } = body

        const hubData = await prisma.nowPage.findFirst({
            orderBy: { updatedAt: 'desc' }
        })

        if (hubData) {
            const updated = await prisma.nowPage.update({
                where: { id: hubData.id },
                data: {
                    content: content ?? hubData.content,
                    learning: learning ? JSON.stringify(learning) : hubData.learning,
                    readingList: readingList ? JSON.stringify(readingList) : hubData.readingList,
                    listeningTo: listeningTo ? JSON.stringify(listeningTo) : hubData.listeningTo,
                    githubRepos: githubRepos ? JSON.stringify(githubRepos) : hubData.githubRepos
                }
            })
            return NextResponse.json(updated)
        } else {
            const created = await prisma.nowPage.create({
                data: {
                    content: content || '',
                    learning: JSON.stringify(learning || []),
                    readingList: JSON.stringify(readingList || []),
                    listeningTo: JSON.stringify(listeningTo || []),
                    githubRepos: JSON.stringify(githubRepos || [])
                }
            })
            return NextResponse.json(created)
        }
    } catch (error) {
        console.error('Error updating hub data:', error)
        return NextResponse.json({ error: 'Failed to update hub data' }, { status: 500 })
    }
}
