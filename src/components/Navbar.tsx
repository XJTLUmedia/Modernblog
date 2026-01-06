'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Menu, X, BookOpen, Sprout, Hammer, LayoutDashboard,
    User, Settings, LogOut, LogIn, Sparkles, Search, Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import { AISearch } from '@/components/AISearch'

const navLinks = [
    { href: '/blog', label: 'Blog', icon: BookOpen },
    { href: '/garden', label: 'Garden', icon: Sprout },
    { href: '/forge', label: 'Projects', icon: Hammer },
    { href: '/hub', label: 'Hub', icon: LayoutDashboard },
    { href: '/now', label: 'Now', icon: Clock },
]

export function Navbar() {
    const pathname = usePathname()
    const [isScrolled, setIsScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { user, authenticated, logout } = useAuth()

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <header className={cn(
            "sticky top-0 z-50 w-full transition-all duration-300",
            isScrolled
                ? "bg-background/80 backdrop-blur-md border-b shadow-sm py-2"
                : "bg-transparent py-4"
        )}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-14 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="flex items-center gap-2 group">
                            <motion.div
                                whileHover={{ rotate: 180 }}
                                transition={{ duration: 0.5 }}
                                className="bg-primary/10 p-1.5 rounded-lg group-hover:bg-primary/20 transition-colors"
                            >
                                <Sparkles className="h-6 w-6 text-primary" />
                            </motion.div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                                Modern Blog
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const isActive = pathname.startsWith(link.href)
                            return (
                                <Link key={link.href} href={link.href}>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={cn(
                                            "relative gap-2 px-4 transition-colors hover:text-primary",
                                            isActive ? "text-primary bg-primary/5" : "text-muted-foreground"
                                        )}
                                    >
                                        <link.icon className="h-4 w-4" />
                                        {link.label}
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeNav"
                                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full mx-2"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.3 }}
                                            />
                                        )}
                                    </Button>
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="flex items-center gap-2">
                        {/* AI Search Trigger */}
                        <div className="hidden sm:block">
                            <AISearch />
                        </div>

                        {authenticated ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-9 w-9 rounded-full ml-2 ring-offset-background transition-all hover:ring-2 hover:ring-primary/20">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} alt={user?.name || 'User'} />
                                            <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {user?.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/profile" className="cursor-pointer">
                                            <User className="mr-2 h-4 w-4" />
                                            <span>Profile</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/profile/settings" className="cursor-pointer">
                                            <Settings className="mr-2 h-4 w-4" />
                                            <span>Settings</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    {user?.isAdmin && (
                                        <DropdownMenuItem asChild>
                                            <Link href="/admin/dashboard" className="cursor-pointer text-primary">
                                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                                <span>Admin Dashboard</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Link href="/auth/login">
                                <Button size="sm" className="ml-2 gap-2 shadow-lg shadow-primary/20">
                                    <LogIn className="h-4 w-4" />
                                    Sign In
                                </Button>
                            </Link>
                        )}

                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden ml-1"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t bg-background overflow-hidden"
                    >
                        <div className="container mx-auto px-4 py-4 space-y-2">
                            {navLinks.map((link) => (
                                <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)}>
                                    <div className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                        pathname.startsWith(link.href) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                                    )}>
                                        <link.icon className="h-5 w-5" />
                                        {link.label}
                                    </div>
                                </Link>
                            ))}
                            {!authenticated && (
                                <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                                    <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-primary hover:bg-primary/5">
                                        <LogIn className="h-5 w-5" />
                                        Sign In
                                    </div>
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    )
}
