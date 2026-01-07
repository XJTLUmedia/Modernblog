import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const { isAdmin } = await verifyAdmin(request)
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // @ts-ignore
        let settings = await prisma.siteSettings.findFirst()

        if (!settings) {
            // Create default settings if they don't exist
            // @ts-ignore
            settings = await prisma.siteSettings.create({
                data: {
                    id: 'site-config',
                    siteName: 'Antigravity OS',
                    siteDescription: 'Neural-link optimized intellectual forge.',
                    memorizationMode: true,
                    activeRecall: true,
                    spacedRepetition: true,
                    themeColor: '#10b981'
                }
            })
        }

        return NextResponse.json(settings)
    } catch (error) {
        console.error('Error fetching settings:', error)
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const { isAdmin } = await verifyAdmin(request)
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const {
            siteName,
            siteDescription,
            memorizationMode,
            activeRecall,
            spacedRepetition,
            themeColor,
            githubUrl,
            twitterUrl,
            birthday
        } = body

        // @ts-ignore
        const settings = await prisma.siteSettings.upsert({
            where: { id: 'site-config' },
            update: {
                siteName,
                siteDescription,
                memorizationMode,
                activeRecall,
                spacedRepetition,
                themeColor,
                githubUrl,
                twitterUrl,
                birthday: birthday ? new Date(birthday) : null
            },
            create: {
                id: 'site-config',
                siteName: siteName || 'Antigravity OS',
                siteDescription: siteDescription || 'Neural-link optimized intellectual forge.',
                memorizationMode: memorizationMode ?? true,
                activeRecall: activeRecall ?? true,
                spacedRepetition: spacedRepetition ?? true,
                themeColor: themeColor || '#10b981',
                githubUrl,
                twitterUrl,
                birthday: birthday ? new Date(birthday) : null
            }
        })

        return NextResponse.json(settings)
    } catch (error) {
        console.error('Error updating settings:', error)
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
    }
}
