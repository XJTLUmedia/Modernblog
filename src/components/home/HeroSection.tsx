'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BirthdayGreeting } from '@/components/BirthdayGreeting'

export function HeroSection() {
    return (
        <section className="relative overflow-hidden py-20 sm:py-32">
            <div className="absolute inset-0 -z-10 opacity-30">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/10 to-primary/20" />
            </div>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                >
                    <BirthdayGreeting />
                    <h1 className="text-5xl sm:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground">
                        Modern, AI-Powered Blog
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                        A next-generation content platform with semantic search, smart summaries, and interactive features.
                        Built with Next.js 15, TypeScript, and shadcn/ui.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/blog">
                            <Button size="lg" className="gap-2">
                                Start Exploring
                                <ArrowRight className="h-5 w-5" />
                            </Button>
                        </Link>
                        <Link href="/admin/dashboard">
                            <Button variant="outline" size="lg">
                                Manage Content
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
