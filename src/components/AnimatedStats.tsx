'use client'

import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"

interface Stat {
    value: string
    label: string
    color: string
}

export function AnimatedStats({ stats }: { stats: Stat[] }) {
    return (
        <>
            {stats.map((stat, index) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                    <Card className="text-center border-2">
                        <CardContent className="p-6">
                            <div className={`text-4xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
                            <div className="text-sm text-muted-foreground">{stat.label}</div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </>
    )
}
