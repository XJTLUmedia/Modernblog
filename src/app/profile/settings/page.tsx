'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/Navbar'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    User as UserIcon, Settings, Shield,
    Save, ArrowLeft, Camera, Bell, Mail, Lock
} from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'

export default function SettingsPage() {
    const { user, loading, authenticated, refresh } = useAuth()
    const { toast } = useToast()

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        bio: '',
        website: '',
    })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        const fetchProfile = async () => {
            if (user) {
                try {
                    const res = await fetch('/api/user/profile')
                    if (res.ok) {
                        const data = await res.json()
                        setFormData({
                            name: data.name || '',
                            email: data.email || '',
                            bio: data.bio || '',
                            website: data.website || '',
                        })
                    }
                } catch (error) {
                    console.error('Error fetching profile:', error)
                }
            }
        }
        fetchProfile()
    }, [user])

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (!res.ok) throw new Error('Update failed')

            toast({
                title: "Settings saved",
                description: "Your profile information has been updated successfully.",
            })

            refresh() // Refresh auth state
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save settings. Please try again.",
                variant: "destructive"
            })
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="min-h-screen bg-background"><Navbar /><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full"></div></div></div>

    if (!authenticated) return <div className="min-h-screen bg-background"><Navbar /><div className="container mx-auto px-4 py-20 text-center"><Link href="/auth/login"><Button>Sign In</Button></Link></div></div>

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <main className="flex-1 py-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-8"
                    >
                        <Link href="/profile">
                            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Profile
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold mt-4">Settings</h1>
                        <p className="text-muted-foreground">Manage your account settings and profile preferences.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                        {/* Sidebar Navigation */}
                        <nav className="md:col-span-3 space-y-2">
                            <Button variant="secondary" className="w-full justify-start gap-3">
                                <UserIcon className="h-4 w-4" />
                                Profile Info
                            </Button>
                            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground">
                                <Bell className="h-4 w-4" />
                                Notifications
                            </Button>
                            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground">
                                <Shield className="h-4 w-4" />
                                Privacy
                            </Button>
                            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground">
                                <Lock className="h-4 w-4" />
                                Security
                            </Button>
                        </nav>

                        {/* Settings Form */}
                        <div className="md:col-span-9 space-y-8">
                            <form onSubmit={handleUpdate}>
                                <Card className="border-2 shadow-sm">
                                    <CardHeader>
                                        <CardTitle>Profile Information</CardTitle>
                                        <CardDescription>
                                            This information will be displayed publicly on the platform.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Avatar Selection */}
                                        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b">
                                            <div className="relative group">
                                                <Avatar className="h-24 w-24 border-4 border-muted">
                                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} />
                                                    <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                    <Camera className="h-6 w-6 text-white" />
                                                </div>
                                            </div>
                                            <div className="space-y-2 text-center sm:text-left">
                                                <h4 className="font-semibold text-lg">Your Photo</h4>
                                                <p className="text-sm text-muted-foreground">Based on your email. Synchronized with DiceBear.</p>
                                                <div className="flex gap-2 justify-center sm:justify-start">
                                                    <Button variant="outline" size="sm" type="button">Change Avatar</Button>
                                                    <Button variant="ghost" size="sm" type="button" className="text-destructive">Remove</Button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Full Name</Label>
                                                <Input
                                                    id="name"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    placeholder="Your Name"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email Address</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={formData.email}
                                                    disabled
                                                    className="bg-muted text-muted-foreground"
                                                    placeholder="your@email.com"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="website">Website / Portfolio</Label>
                                            <Input
                                                id="website"
                                                value={formData.website}
                                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                                placeholder="https://example.com"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="bio">Public Bio</Label>
                                            <Textarea
                                                id="bio"
                                                className="min-h-[100px] resize-none"
                                                value={formData.bio}
                                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                placeholder="Tell us a little bit about yourself..."
                                            />
                                            <p className="text-[11px] text-muted-foreground">Brief description for your profile. Supports markdown.</p>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-between items-center border-t py-6 bg-muted/20">
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Shield className="h-3 w-3" />
                                            All data is encrypted and secure.
                                        </p>
                                        <Button type="submit" disabled={saving} className="gap-2 shadow-lg shadow-primary/20">
                                            {saving ? (
                                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </form>

                            {/* Security Section (Example) */}
                            <Card className="border-destructive/20 bg-destructive/5 overflow-hidden">
                                <div className="bg-destructive/10 px-6 py-4 border-b border-destructive/20 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-destructive">Danger Zone</h3>
                                        <p className="text-xs text-destructive/80">Irreversible actions for your account</p>
                                    </div>
                                </div>
                                <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="text-center sm:text-left">
                                        <h4 className="font-bold">Delete Account</h4>
                                        <p className="text-sm text-muted-foreground">Once you delete your account, there is no going back. Please be certain.</p>
                                    </div>
                                    <Button variant="destructive" className="whitespace-nowrap">Delete Account</Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
