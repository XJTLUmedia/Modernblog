'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/Navbar'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    User as UserIcon, Settings, Calendar, Mail, Shield,
    BookOpen, Sprout, Hammer, Star, Clock, ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { UserBadges } from '@/components/UserBadges'

export default function ProfilePage() {
    const { user, loading, authenticated } = useAuth()
    const [stats, setStats] = useState({
        comments: 0,
        likes: 0,
        daysSinceJoined: 0
    })
    const [activities, setActivities] = useState<any[]>([])
    const [bookmarks, setBookmarks] = useState<any[]>([])
    const [bookmarksLoading, setBookmarksLoading] = useState(false)

    useEffect(() => {
        const fetchUserData = async () => {
            if (user) {
                try {
                    const [statsRes, profileRes, activityRes] = await Promise.all([
                        fetch('/api/user/stats'),
                        fetch('/api/user/profile'),
                        fetch('/api/user/activity')
                    ])

                    if (statsRes.ok) {
                        const statsData = await statsRes.json()
                        setStats(statsData)
                    }

                    if (activityRes.ok) {
                        const activityData = await activityRes.json()
                        setActivities(activityData)
                    }

                    if (profileRes.ok) {
                        const profileData = await profileRes.json()
                    }
                } catch (error) {
                    console.error('Error fetching profile data:', error)
                }
            }
        }
        fetchUserData()
    }, [user])

    const fetchBookmarks = async () => {
        if (!user || bookmarks.length > 0) return
        setBookmarksLoading(true)
        try {
            const res = await fetch('/api/user/bookmark')
            if (res.ok) {
                const data = await res.json()
                setBookmarks(data)
            }
        } catch (e) { console.error(e) }
        finally { setBookmarksLoading(false) }
    }

    if (loading) return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        </div>
    )

    if (!authenticated) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="container mx-auto px-4 py-20 text-center">
                    <h1 className="text-3xl font-bold mb-4">Please log in to view your profile</h1>
                    <Link href="/auth/login">
                        <Button>Sign In</Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <main className="flex-1 py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                    >
                        {/* Sidebar / User Info */}
                        <div className="lg:col-span-4 space-y-6">
                            <Card className="border-2 shadow-lg overflow-hidden">
                                <div className="h-32 bg-gradient-to-br from-primary/20 to-purple-500/20 relative" />
                                <CardContent className="pt-0 relative">
                                    <div className="flex flex-col items-center -mt-16 mb-6">
                                        <div className="p-1 bg-background rounded-full">
                                            <Avatar className="h-32 w-32 border-4 border-background">
                                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} />
                                                <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <h1 className="text-2xl font-bold mt-4">{user?.name || 'Anonymous User'}</h1>
                                        <p className="text-muted-foreground">{user?.email}</p>
                                        <Badge variant="secondary" className="mt-2 flex gap-1 items-center capitalize">
                                            <Shield className="h-3 w-3" />
                                            {user?.role}
                                        </Badge>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t">
                                        <div className="flex items-center gap-3 text-sm">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span>{user?.email}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span>Joined Jan 2025</span>
                                        </div>
                                    </div>

                                    <Link href="/profile/settings" className="block mt-8">
                                        <Button variant="outline" className="w-full gap-2">
                                            <Settings className="h-4 w-4" />
                                            Edit Profile
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Achievements</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <UserBadges />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Content Area */}
                        <div className="lg:col-span-8">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                                <Card>
                                    <CardContent className="p-6 text-center">
                                        <div className="text-3xl font-bold text-primary mb-1">{stats.comments}</div>
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Comments</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-6 text-center">
                                        <div className="text-3xl font-bold text-purple-500 mb-1">{stats.likes}</div>
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Likes Received</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-6 text-center">
                                        <div className="text-3xl font-bold text-orange-500 mb-1">{stats.daysSinceJoined}</div>
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Days Active</div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Tabs defaultValue="activity" className="w-full" onValueChange={(val) => val === 'bookmarks' && fetchBookmarks()}>
                                <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-muted/50 rounded-xl">
                                    <TabsTrigger value="activity" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
                                        Recent Activity
                                    </TabsTrigger>
                                    <TabsTrigger value="bookmarks" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
                                        Bookmarks
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="activity" className="space-y-6">
                                    {activities.length > 0 ? (
                                        activities.map((activity, i) => {
                                            const Icon = activity.type === 'comment' ? BookOpen : Star
                                            return (
                                                <motion.div
                                                    key={activity.id || i}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.1 * i }}
                                                    className="group flex items-start gap-4 p-4 rounded-xl border hover:border-primary/50 transition-all hover:bg-card/50"
                                                >
                                                    <div className="mt-1 p-2 rounded-lg bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                        <Icon className="h-4 w-4" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <h4 className="font-semibold">{activity.title}</h4>
                                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {new Date(activity.date).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">on {activity.on}</p>
                                                        {activity.content && (
                                                            <p className="text-xs text-muted-foreground mt-2 line-clamp-1 italic">
                                                                "{activity.content}"
                                                            </p>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )
                                        })
                                    ) : (
                                        <div className="text-center py-12 text-muted-foreground">
                                            No recent activity found.
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="bookmarks" className="space-y-4">
                                    {bookmarksLoading ? (
                                        <div className="text-center py-20 text-muted-foreground">Loading bookmarks...</div>
                                    ) : bookmarks.length > 0 ? (
                                        bookmarks.map((b, i) => (
                                            <motion.div
                                                key={b.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="flex items-center justify-between p-4 rounded-xl border hover:border-primary/50 transition-all"
                                            >
                                                <div className="flex gap-3 items-center">
                                                    {b.post && <BookOpen className="h-4 w-4 text-blue-500" />}
                                                    {b.gardenNote && <Sprout className="h-4 w-4 text-emerald-500" />}
                                                    {b.project && <Hammer className="h-4 w-4 text-purple-500" />}

                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-sm">
                                                            {b.post?.title || b.gardenNote?.title || b.project?.title || 'Unknown Item'}
                                                        </span>
                                                        <span className="text-[10px] uppercase text-muted-foreground">
                                                            {b.post ? 'Blog' : b.gardenNote ? 'Garden' : 'Project'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Link href={
                                                    b.post ? `/blog/${b.post.slug}` :
                                                        b.gardenNote ? `/garden/${b.gardenNote.slug}` :
                                                            `/forge/${b.project?.slug}`
                                                }>
                                                    <Button variant="ghost" size="sm">View</Button>
                                                </Link>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed">
                                            <Star className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
                                            <h3 className="text-lg font-semibold mb-2">No bookmarks yet</h3>
                                            <p className="text-muted-foreground max-w-xs mx-auto mb-6">
                                                Save articles, garden notes, or projects to find them easily later.
                                            </p>
                                            <Link href="/blog">
                                                <Button variant="outline">Browse Blog</Button>
                                            </Link>
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    )
}
