'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/Navbar'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import {
    User as UserIcon, Shield,
    ArrowLeft, Bell, Lock
} from 'lucide-react'
import Link from 'next/link'
import { ProfileForm } from '@/components/settings/ProfileForm'
import { NotificationSettings } from '@/components/settings/NotificationSettings'
import { PrivacySettings } from '@/components/settings/PrivacySettings'
import { SecuritySettings } from '@/components/settings/SecuritySettings'

type SettingsTab = 'profile' | 'notifications' | 'privacy' | 'security'

export default function SettingsPage() {
    const { user, loading, authenticated, refresh } = useAuth()
    const [activeTab, setActiveTab] = useState<SettingsTab>('profile')

    if (loading) return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full"></div>
            </div>
        </div>
    )

    if (!authenticated) return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container mx-auto px-4 py-20 text-center">
                <Link href="/auth/login"><Button>Sign In</Button></Link>
            </div>
        </div>
    )

    const navItems = [
        { id: 'profile', label: 'Profile Info', icon: UserIcon },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'privacy', label: 'Privacy & Data', icon: Shield },
        { id: 'security', label: 'Security', icon: Lock },
    ]

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <main className="flex-1 py-12">
                <div className="container mx-auto px-4 max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-8"
                    >
                        <Link href="/profile">
                            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary mb-2">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Profile
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold">Account Settings</h1>
                        <p className="text-muted-foreground">Manage your personal information and preferences.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                        {/* Sidebar Navigation */}
                        <nav className="md:col-span-3 space-y-2">
                            {navItems.map((item) => {
                                const Icon = item.icon
                                const isActive = activeTab === item.id
                                return (
                                    <Button
                                        key={item.id}
                                        variant={isActive ? "secondary" : "ghost"}
                                        className={`w-full justify-start gap-3 transition-all ${isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground'}`}
                                        onClick={() => setActiveTab(item.id as SettingsTab)}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {item.label}
                                    </Button>
                                )
                            })}
                        </nav>

                        {/* Content Area */}
                        <div className="md:col-span-9">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {activeTab === 'profile' && <ProfileForm user={user} refresh={refresh} />}
                                    {activeTab === 'notifications' && <NotificationSettings user={user} />}
                                    {activeTab === 'privacy' && <PrivacySettings />}
                                    {activeTab === 'security' && <SecuritySettings />}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
