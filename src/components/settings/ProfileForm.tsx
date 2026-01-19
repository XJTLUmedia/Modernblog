'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Save, Loader2, User } from 'lucide-react'
import { AvatarUploader } from './AvatarUploader'
import { useToast } from '@/hooks/use-toast'

interface ProfileFormProps {
    user: any
    refresh: () => void
}

export function ProfileForm({ user, refresh }: ProfileFormProps) {
    const { toast } = useToast()
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        bio: user?.bio || '',
        website: user?.website || '',
    })

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
                title: "Profile updated",
                description: "Your public profile has been updated successfully.",
            })

            refresh()
        } catch (error) {
            toast({
                title: "Update failed",
                description: "Could not save your profile changes. Please try again.",
                variant: "destructive"
            })
        } finally {
            setSaving(false)
        }
    }

    return (
        <form onSubmit={handleUpdate}>
            <Card className="border-2 shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <User className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>
                                Update your public profile details and information.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-8">
                    {/* Avatar Section */}
                    <div className="pb-6 border-b">
                        <AvatarUploader user={user} />
                    </div>

                    <div className="grid gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Display Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Your Name"
                                    className="max-w-md"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    disabled
                                    className="bg-muted text-muted-foreground max-w-md"
                                />
                                <p className="text-[11px] text-muted-foreground">
                                    Email cannot be changed directly for security.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="website">Website / Portfolio</Label>
                            <Input
                                id="website"
                                value={formData.website}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                placeholder="https://your-portfolio.com"
                                className="font-mono text-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                                id="bio"
                                className="min-h-[120px] resize-none"
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                placeholder="Tell the world about yourself..."
                            />
                            <div className="flex justify-between text-[11px] text-muted-foreground">
                                <span>Markdown supported</span>
                                <span>{formData.bio.length}/500</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t py-4 bg-muted/20">
                    <Button type="submit" disabled={saving} className="min-w-[120px]">
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    )
}
