'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    Github,
    Twitter,
    BookOpen,
    Sprout,
    Hammer,
    LayoutDashboard,
    LogIn,
    ShieldCheck,
    Sparkles,
    Heart
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export function Footer() {
    const currentYear = new Date().getFullYear()

    const footerSections = [
        {
            title: 'Quick Links',
            links: [
                { label: 'Blog Posts', href: '/blog', icon: BookOpen },
                { label: 'Garden Notes', href: '/garden', icon: Sprout },
                { label: 'Projects', href: '/forge', icon: Hammer },
                { label: 'Hub Dashboard', href: '/hub', icon: LayoutDashboard },
            ]
        },
        {
            title: 'Connect',
            links: [
                { label: 'GitHub', href: 'https://github.com', icon: Github, external: true },
                { label: 'Twitter', href: 'https://twitter.com', icon: Twitter, external: true },
            ]
        },
        {
            title: 'Owner Portal',
            links: [
                { label: 'Login', href: '/auth/login', icon: LogIn },
                { label: 'Admin Dashboard', href: '/admin/dashboard', icon: ShieldCheck },
            ]
        }
    ]

    return (
        <footer className="relative border-t bg-muted/30 pt-16 pb-8 overflow-hidden">
            {/* Decorative element */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="bg-primary/10 p-1.5 rounded-lg group-hover:bg-primary/20 transition-colors">
                                <Sparkles className="h-6 w-6 text-primary" />
                            </div>
                            <span className="text-2xl font-black tracking-tighter uppercase">
                                Modern <span className="text-primary italic">Blog</span>
                            </span>
                        </Link>
                        <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                            Crafted with passion for the developer community. A digital laboratory for engineering experiments and knowledge cultivation.
                        </p>
                        <div className="flex items-center gap-2 text-xs font-black text-muted-foreground uppercase tracking-widest bg-muted/50 w-fit px-3 py-1 rounded-full border">
                            System Status: <span className="text-emerald-500 animate-pulse">Operational</span>
                        </div>
                    </div>

                    {/* Links Sections */}
                    {footerSections.map((section) => (
                        <div key={section.title} className="space-y-6">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/80">
                                {section.title}
                            </h3>
                            <ul className="space-y-3">
                                {section.links.map((link) => (
                                    <li key={link.label}>
                                        {link.external ? (
                                            <a
                                                href={link.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors group"
                                            >
                                                <link.icon className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                                                {link.label}
                                            </a>
                                        ) : (
                                            <Link
                                                href={link.href}
                                                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors group"
                                            >
                                                <link.icon className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                                                {link.label}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <Separator className="mb-8 opacity-50" />

                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                        <span>© {currentYear} Modern Blog</span>
                        <span className="hidden md:inline text-primary/30">•</span>
                        <span className="flex items-center gap-1.5">
                            Built with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> by XJTLUMEDIA
                        </span>
                    </div>

                    <div className="flex items-center gap-1">
                        <motion.div
                            whileHover={{ y: -2 }}
                            className="text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 bg-zinc-900 text-white rounded-xl shadow-xl shadow-zinc-900/20"
                        >
                            v2.1.0-STABLE
                        </motion.div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
