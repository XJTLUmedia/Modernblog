'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Eye, EyeOff, Shield, Download, Lock } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'

export function PrivacySettings() {
    const { toast } = useToast()
    const { user } = useAuth()
    const [visibility, setVisibility] = useState('public')
    const [showActivity, setShowActivity] = useState(true)
    const [indexing, setIndexing] = useState(true)

    // Load initial settings
    useEffect(() => {
        const fetchSettings = async () => {
            if (!user?.id) return
            try {
                const res = await fetch(`/api/user/settings/privacy?userId=${user.id}`)
                if (res.ok) {
                    const data = await res.json()
                    // Apply loaded settings if they exist
                    if (data.visibility) setVisibility(data.visibility)
                    if (data.showActivity !== undefined) setShowActivity(data.showActivity)
                    if (data.indexing !== undefined) setIndexing(data.indexing)
                }
            } catch (error) {
                console.error("Failed to load privacy settings", error)
            }
        }
        fetchSettings()
    }, [user])

    const handleSave = async () => {
        try {
            const res = await fetch('/api/user/settings/privacy', {
                method: 'PUT',
                body: JSON.stringify({
                    userId: user?.id,
                    visibility,
                    showActivity,
                    indexing
                })
            })

            if (!res.ok) throw new Error("Failed to save")

            toast({
                title: "Privacy settings updated",
                description: "Your privacy preferences have been saved.",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Could not save privacy settings.",
                variant: "destructive"
            })
        }
    }

    return (
        <Card className="border-2 shadow-sm">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600">
                        <Shield className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle>Privacy & Data</CardTitle>
                        <CardDescription>
                            Control who can see your profile and how your data is used.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="space-y-4">
                    <Label className="text-base font-semibold">Profile Visibility</Label>
                    <RadioGroup value={visibility} onValueChange={setVisibility} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className={`flex flex-col space-y-2 border-2 rounded-xl p-4 cursor-pointer hover:bg-muted/50 transition-colors ${visibility === 'public' ? 'border-primary bg-primary/5' : 'border-muted'}`}>
                            <div className="flex items-center justify-between">
                                <Eye className="h-5 w-5 mb-2 text-primary" />
                                <RadioGroupItem value="public" id="public" />
                            </div>
                            <Label htmlFor="public" className="font-semibold cursor-pointer">Public</Label>
                            <p className="text-xs text-muted-foreground">Everyone can see your profile, posts, and activity.</p>
                        </div>

                        <div className={`flex flex-col space-y-2 border-2 rounded-xl p-4 cursor-pointer hover:bg-muted/50 transition-colors ${visibility === 'users' ? 'border-primary bg-primary/5' : 'border-muted'}`}>
                            <div className="flex items-center justify-between">
                                <Lock className="h-5 w-5 mb-2 text-orange-500" />
                                <RadioGroupItem value="users" id="users" />
                            </div>
                            <Label htmlFor="users" className="font-semibold cursor-pointer">Logged-in Users</Label>
                            <p className="text-xs text-muted-foreground">Only signed-in users can view your full profile.</p>
                        </div>

                        <div className={`flex flex-col space-y-2 border-2 rounded-xl p-4 cursor-pointer hover:bg-muted/50 transition-colors ${visibility === 'private' ? 'border-primary bg-primary/5' : 'border-muted'}`}>
                            <div className="flex items-center justify-between">
                                <EyeOff className="h-5 w-5 mb-2 text-destructive" />
                                <RadioGroupItem value="private" id="private" />
                            </div>
                            <Label htmlFor="private" className="font-semibold cursor-pointer">Private</Label>
                            <p className="text-xs text-muted-foreground">Only you can see your profile. You won't appear in search.</p>
                        </div>
                    </RadioGroup>
                </div>

                <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center justify-between space-x-2">
                        <div className="space-y-0.5">
                            <Label className="text-base">Show Activity Status</Label>
                            <p className="text-sm text-muted-foreground">
                                Allow others to see when you were last active.
                            </p>
                        </div>
                        <Switch
                            checked={showActivity}
                            onCheckedChange={setShowActivity}
                        />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                        <div className="space-y-0.5">
                            <Label className="text-base">Search Engine Indexing</Label>
                            <p className="text-sm text-muted-foreground">
                                Allow search engines like Google to show your profile.
                            </p>
                        </div>
                        <Switch
                            checked={indexing}
                            onCheckedChange={setIndexing}
                        />
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Data Management</h3>
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                        <div className="space-y-1">
                            <h4 className="font-medium">Download Your Data</h4>
                            <p className="text-sm text-muted-foreground">Get a copy of your posts, comments, and settings.</p>
                        </div>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Download className="h-4 w-4" />
                            Request Archive
                        </Button>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t py-4 bg-muted/20">
                <Button onClick={handleSave}>Save Changes</Button>
            </CardFooter>
        </Card>
    )
}
