import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const hubData = await prisma.nowPage.findFirst({
            orderBy: { updatedAt: 'desc' }
        })

        if (!hubData) {
            return NextResponse.json({
                content: '',
                learning: [],
                readingList: [],
                listeningTo: [],
                githubRepos: []
            })
        }

        return NextResponse.json({
            ...hubData,
            learning: hubData.learning ? JSON.parse(hubData.learning) : [],
            readingList: hubData.readingList ? JSON.parse(hubData.readingList) : [],
            listeningTo: hubData.listeningTo ? JSON.parse(hubData.listeningTo) : [],
            githubRepos: hubData.githubRepos ? JSON.parse(hubData.githubRepos) : []
        })
    } catch (error) {
        console.error('Error fetching hub data:', error)
        return NextResponse.json({ error: 'Failed to fetch hub data' }, { status: 500 })
    }
}
