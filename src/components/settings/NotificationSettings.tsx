'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Bell, Mail, MessageSquare, Zap, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface NotificationSettingsProps {
    user: any
}

export function NotificationSettings({ user }: NotificationSettingsProps) {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [settings, setSettings] = useState({
        emailDigest: true,
        newComments: true,
        mentions: true,
        productUpdates: false,
        marketing: false
    })

    const handleToggle = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }))
    }

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/user/settings/notifications')
                if (res.ok) {
                    const data = await res.json()
                    setSettings(prev => ({ ...prev, ...data }))
                }
            } catch (e) {
                console.error("Failed to load settings", e)
            }
        }
        fetchSettings()
    }, [])

    const handleSave = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/user/settings/notifications', {
                method: 'PUT',
                body: JSON.stringify(settings)
            })

            if (!res.ok) throw new Error("Failed to save")

            toast({
                title: "Preferences saved",
                description: "Your notification preferences have been updated.",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save preferences.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="border-2 shadow-sm">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-600">
                        <Bell className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle>Notification Preferences</CardTitle>
                        <CardDescription>
                            Manage how and when you receive notifications.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Email Notifications</h3>

                    <div className="flex items-center justify-between space-x-2">
                        <div className="flex gap-3 items-start">
                            <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div className="space-y-0.5">
                                <Label className="text-base">Weekly Digest</Label>
                                <p className="text-sm text-muted-foreground">
                                    Receive a weekly summary of your activity and popular posts.
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={settings.emailDigest}
                            onCheckedChange={() => handleToggle('emailDigest')}
                        />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                        <div className="flex gap-3 items-start">
                            <Zap className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div className="space-y-0.5">
                                <Label className="text-base">Product Updates</Label>
                                <p className="text-sm text-muted-foreground">
                                    Get notified about new features and major updates.
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={settings.productUpdates}
                            onCheckedChange={() => handleToggle('productUpdates')}
                        />
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Activity</h3>

                    <div className="flex items-center justify-between space-x-2">
                        <div className="flex gap-3 items-start">
                            <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div className="space-y-0.5">
                                <Label className="text-base">Comments & Replies</Label>
                                <p className="text-sm text-muted-foreground">
                                    Notify me when someone comments on my posts or replies to me.
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={settings.newComments}
                            onCheckedChange={() => handleToggle('newComments')}
                        />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                        <div className="flex gap-3 items-start">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">@</span>
                            <div className="space-y-0.5">
                                <Label className="text-base">Mentions</Label>
                                <p className="text-sm text-muted-foreground">
                                    Notify me when I'm mentioned in a post or comment.
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={settings.mentions}
                            onCheckedChange={() => handleToggle('mentions')}
                        />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t py-4 bg-muted/20">
                <Button onClick={handleSave} disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Preferences
                </Button>
            </CardFooter>
        </Card>
    )
}
