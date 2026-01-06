import { Card, CardContent } from "@/components/ui/card"
import { db } from "@/lib/prisma"
import { motion } from "framer-motion"
import * as React from "react"
import { AnimatedStats } from "./AnimatedStats"

// Server Component
export async function StatsSection() {
    const [postCount, noteCount, projectCount, userCount] = await Promise.all([
        db.post.count({ where: { published: true } }),
        db.gardenNote.count(),
        db.project.count(),
        db.user.count() // Using user count as a proxy for "Community Members" or similar
    ])

    // Total views is a bit trickier without an aggregation table, 
    // but let's sum them up if performant, or just use a placeholder based on real data if heavy.
    // For now, let's Aggregate.
    const postViews = await db.post.aggregate({ _sum: { viewCount: true } })
    const projectViews = await db.project.aggregate({ _sum: { viewCount: true } })
    const noteViews = await db.gardenNote.aggregate({ _sum: { viewCount: true } })

    const totalViews = (postViews._sum.viewCount || 0) + (projectViews._sum.viewCount || 0) + (noteViews._sum.viewCount || 0)

    const stats = [
        { value: postCount.toString(), label: 'Blog Posts', color: 'text-blue-600' },
        { value: noteCount.toString(), label: 'Garden Notes', color: 'text-emerald-600' },
        { value: projectCount.toString(), label: 'Projects', color: 'text-purple-600' },
        { value: totalViews > 1000 ? `${(totalViews / 1000).toFixed(1)}K` : totalViews.toString(), label: 'Total Views', color: 'text-orange-600' }
    ]

    return (
        <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                        Platform Overview
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Track performance and engagement across all content types.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <AnimatedStats stats={stats} />
                </div>
            </div>
        </section>
    )
}
