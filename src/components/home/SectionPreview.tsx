'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { BookOpen, Sprout, Hammer, LayoutDashboard, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const sections = [
    {
        id: 'blog',
        title: 'The Surface',
        subtitle: 'Blog & Essays',
        description: 'Polished, long-form thoughts and opinions on technology, development, and innovation.',
        icon: BookOpen,
        color: 'from-emerald-500 to-teal-500',
        features: ['AI Summaries', 'Semantic Search', 'Analytics']
    },
    {
        id: 'garden',
        title: 'The Lab',
        subtitle: 'Digital Garden',
        description: 'Raw, "in-progress" notes and snippets linked like a Wiki - a living knowledge base.',
        icon: Sprout,
        color: 'from-blue-500 to-indigo-500',
        features: ['Wiki Linking', 'Status Tracking', 'Search']
    },
    {
        id: 'forge',
        title: 'The Forge',
        subtitle: 'Project Showcase',
        description: 'Case studies with interactive demos and detailed breakdowns of real-world projects.',
        icon: Hammer,
        color: 'from-purple-500 to-pink-500',
        features: ['Live Demos', 'Tech Stack', 'Case Studies']
    },
    {
        id: 'hub',
        title: 'The Hub',
        subtitle: 'Dashboard',
        description: 'A public-facing "Command Center" showing what I\'m currently learning and building.',
        icon: LayoutDashboard,
        color: 'from-orange-500 to-red-500',
        features: ['Learning Progress', 'Current Projects', 'Reading List']
    }
]

export function SectionPreview() {
    return (
        <section className="py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                        Explore My Content
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Four distinct spaces for different types of content and collaboration.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {sections.map((section, index) => (
                        <motion.div
                            key={section.id}
                            id={section.id}
                            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                        >
                            <Card className={`overflow-hidden border-2 hover:border-primary/50 transition-all hover:shadow-lg bg-gradient-to-br ${section.color}`}>
                                <CardHeader>
                                    <div className="flex items-center justify-between mb-4">
                                        <section.icon className="w-10 h-10 text-primary" />
                                        <span className={`text-xs px-2 py-1 rounded-full bg-primary text-primary-foreground font-semibold`}>
                                            {section.features.length}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 text-center">
                                    <div className="text-2xl font-bold mb-2">{section.title}</div>
                                    <div className="text-sm text-muted-foreground mb-4">{section.subtitle}</div>
                                    <p className="text-sm mb-6 line-clamp-2">{section.description}</p>
                                    <div className="flex flex-wrap gap-2 justify-center mb-4">
                                        {section.features.slice(0, 4).map((feature) => (
                                            <Badge key={feature} variant="secondary">
                                                {feature}
                                            </Badge>
                                        ))}
                                    </div>
                                    <Link href={`/${section.id}`} className="w-full">
                                        <Button className="gap-2">
                                            Explore {section.title}
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
