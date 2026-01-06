'use client'

import { motion } from 'framer-motion'
import { Sparkles, BookOpen, Search, Hammer } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const features = [
    {
        icon: Sparkles,
        title: 'AI-Powered Search',
        description: 'Ask questions across all content, not just keyword matching. Find exactly what you need.'
    },
    {
        icon: BookOpen,
        title: 'Smart Summaries',
        description: 'Auto-generated TL;DR sections for long-form articles. Get the gist in seconds.'
    },
    {
        icon: Search,
        title: 'Semantic Discovery',
        description: 'Vector embeddings find truly related content based on meaning, not just tags.'
    },
    {
        icon: Hammer,
        title: 'Interactive Code',
        description: 'Run code snippets directly in the browser. Learn by doing, not just reading.'
    }
]

export function FeaturesSection() {
    return (
        <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                        Powered by Intelligence
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Discover content naturally with AI-powered search and smart summaries.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                        >
                            <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all hover:shadow-lg">
                                <CardHeader>
                                    <div className="flex items-center justify-center mb-4">
                                        <feature.icon className="w-12 h-12 text-primary" />
                                    </div>
                                    <CardTitle className="text-2xl text-center">{feature.title}</CardTitle>
                                    <CardDescription className="text-base text-center mt-2">
                                        {feature.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {['AI Search', 'Smart Summaries', 'Semantic Discovery', 'Interactive Code'].slice(0, 4).map((f) => (
                                            <div key={f} className="px-3 py-1.5 rounded-full bg-primary/10 text-xs font-medium">
                                                {f}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
