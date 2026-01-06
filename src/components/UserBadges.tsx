'use client'

import { useEffect, useState } from 'react'
import { Badge as UI_Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Medal, Award, Star, Trophy, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import * as Tooltip from '@radix-ui/react-tooltip'

interface BadgeType {
    id: string
    name: string
    description: string
    icon: string
    assignedAt: string
}

export function UserBadges() {
    const [badges, setBadges] = useState<BadgeType[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchBadges = async () => {
            try {
                const res = await fetch('/api/user/badges')
                if (res.ok) {
                    const data = await res.json()
                    // If endpoint returns array, good.
                    setBadges(Array.isArray(data) ? data : [])
                }
            } catch (error) {
                console.error("Failed to fetch badges", error)
            } finally {
                setLoading(false)
            }
        }
        fetchBadges()
    }, [])

    if (loading) {
        return <div className="h-24 flex items-center justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>
    }

    if (badges.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                    <Medal className="h-8 w-8 mb-2 opacity-20" />
                    <p className="text-sm">No badges earned yet.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {badges.map((badge, idx) => (
                <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                >
                    <Tooltip.Provider>
                        <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                                <div className="flex flex-col items-center p-4 bg-muted/40 rounded-xl border hover:border-primary/50 transition-colors cursor-help">
                                    <div className="bg-primary/10 p-3 rounded-full mb-3 text-primary">
                                        {/* Use specific icons based on name or fallback */}
                                        {badge.icon === 'star' ? <Star className="h-6 w-6" /> :
                                            badge.icon === 'trophy' ? <Trophy className="h-6 w-6" /> :
                                                <Award className="h-6 w-6" />}
                                    </div>
                                    <h4 className="font-bold text-sm text-center">{badge.name}</h4>
                                    <span className="text-[10px] text-muted-foreground mt-1">
                                        {new Date(badge.assignedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </Tooltip.Trigger>
                            <Tooltip.Portal>
                                <Tooltip.Content className="max-w-xs bg-popover text-popover-foreground px-3 py-1.5 text-sm rounded shadow-md border animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 z-50">
                                    {badge.description}
                                    <Tooltip.Arrow className="fill-popover" />
                                </Tooltip.Content>
                            </Tooltip.Portal>
                        </Tooltip.Root>
                    </Tooltip.Provider>
                </motion.div>
            ))}
        </div>
    )
}
