'use client'

import { motion } from 'framer-motion'
import { Brain, Zap, Sparkles, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import Link from 'next/link'

interface Technique {
    t: string
    d: string
    href: string
}

interface ManualSectionProps {
    title: string
    description: string
    icon: React.ReactNode
    accentColor: string
    items: Technique[]
}

export function ManualColumn({ title, accentColor, icon, items }: { title: string, accentColor: string, icon: React.ReactNode, items: Technique[] }) {
    return (
        <div className="space-y-6">
            <div className={`flex items-center gap-2 ${accentColor} font-black uppercase tracking-widest text-xs`}>
                {icon} {title}
            </div>
            <ul className="space-y-4">
                {items.map((tech, i) => (
                    <li key={i} className="group">
                        <Link href={tech.href}>
                            <div className={`font-black text-lg group-hover:${accentColor.split(' ')[1]} transition-colors flex items-center gap-2 cursor-pointer`}>
                                {tech.t}
                                <Zap className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </Link>
                        <div className="text-sm text-zinc-500 font-medium leading-relaxed">{tech.d}</div>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export function NeuralOptimizationManual() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-16"
        >
            <Card className="border-4 border-primary/20 rounded-[2.5rem] overflow-hidden bg-zinc-950 text-white shadow-2xl relative">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -z-10" />
                <CardHeader className="p-10 border-b border-white/10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-2 bg-primary/20 rounded-xl">
                            <Brain className="h-6 w-6 text-primary" />
                        </div>
                        <Badge className="bg-primary/20 text-primary border-none font-black tracking-widest uppercase">Protocol v2.4</Badge>
                    </div>
                    <CardTitle className="text-4xl font-black tracking-tight">Neural Optimization <span className="text-primary">Manual</span>.</CardTitle>
                    <CardDescription className="text-zinc-400 text-lg font-medium mt-2">
                        Hardwired cognitive strategies for maximizing data retention and cross-contextual application.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <ManualColumn
                            title="Core Study Logic"
                            accentColor="text-primary"
                            icon={<Zap className="h-4 w-4" />}
                            items={[
                                { t: 'Active Recall', d: 'Force retrieval instead of re-reading. Test early, test often.', href: '/cog/active-recall' },
                                { t: 'Spaced Repetition', d: 'Review at increasing intervals (1-3-7-30 days).', href: '/cog/spaced-repetition' },
                                { t: 'Chunking', d: 'Atomic breakdown of complex data into manageable nodes.', href: '/cog/chunking' }
                            ]}
                        />
                        <ManualColumn
                            title="Creative Mnemonics"
                            accentColor="text-purple-400"
                            icon={<Sparkles className="h-4 w-4" />}
                            items={[
                                { t: 'Method of Loci', d: 'Spatial memory indexing using familiar architectural maps.', href: '/cog/method-of-loci' },
                                { t: 'Discovery Explaining', d: 'Feynman Technique: simplify concepts to the absolute primitive.', href: '/cog/feynman-technique' },
                                { t: 'Dual Coding', d: 'Concurrent linguistic and visual data synthesis.', href: '/cog/dual-coding' }
                            ]}
                        />
                        <ManualColumn
                            title="Biology Layers"
                            accentColor="text-blue-400"
                            icon={<Shield className="h-4 w-4" />}
                            items={[
                                { t: 'Sleep Priority', d: 'Long-term memory consolidation happens in deep REM.', href: '/cog/sleep-priority' },
                                { t: 'Aerobic Sync', d: 'Physical activity boosts hippocampal plasticity.', href: '/cog/aerobic-sync' },
                                { t: 'State Management', d: 'Mindfulness to counteract "infinite scroll" data fragmentation.', href: '/cog/state-management' }
                            ]}
                        />
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
