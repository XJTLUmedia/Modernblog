'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Lock, Smartphone, Laptop, AlertTriangle, Key } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'

export function SecuritySettings() {
    const { toast } = useToast()
    const [twoFactor, setTwoFactor] = useState(false)

    const { user } = useAuth()

    // Ensure user is loaded
    if (!user) {
        return null // Or loading spinner, handled by parent usually
    }

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        // Get values from form inputs (using ids)
        const currentPassword = (document.getElementById('current') as HTMLInputElement).value
        const newPassword = (document.getElementById('new') as HTMLInputElement).value
        const confirmPassword = (document.getElementById('confirm') as HTMLInputElement).value

        if (newPassword !== confirmPassword) {
            toast({ title: "Error", description: "Passwords do not match", variant: "destructive" })
            return
        }

        try {
            const res = await fetch('/api/user/security/password', {
                method: 'POST',
                body: JSON.stringify({
                    userId: user?.id,
                    currentPassword,
                    newPassword
                })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Failed")
            }

            toast({
                title: "Password updated",
                description: "Your password has been changed successfully.",
            })
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        }
    }

    return (
        <div className="space-y-6">
            <Card className="border-2 shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-red-500/10 rounded-lg text-red-600">
                            <Lock className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle>Security Dashboard</CardTitle>
                            <CardDescription>
                                Manage your password and account security settings.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Password Change */}
                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Change Password</h3>
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="current">Current Password</Label>
                                <Input id="current" type="password" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="new">New Password</Label>
                                    <Input id="new" type="password" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm">Confirm New Password</Label>
                                    <Input id="confirm" type="password" />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" variant="outline" size="sm" className="gap-2">
                                <Key className="h-4 w-4" />
                                Update Password
                            </Button>
                        </div>
                    </form>

                    <div className="my-6 border-t" />

                    {/* 2FA */}
                    <div className="flex items-center justify-between space-x-2">
                        <div className="flex gap-3 items-start">
                            <Smartphone className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div className="space-y-0.5">
                                <Label className="text-base">Two-Factor Authentication (2FA)</Label>
                                <p className="text-sm text-muted-foreground">
                                    Add an extra layer of security to your account.
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={twoFactor}
                            onCheckedChange={setTwoFactor}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Active Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-green-500/5 border-green-200">
                            <div className="flex items-center gap-3">
                                <Laptop className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="font-medium text-sm">Current Session</p>
                                    <p className="text-xs text-muted-foreground">Active Now</p>
                                </div>
                            </div>
                            <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Active</span>
                        </div>

                    </div>
                </CardContent>
            </Card>

            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Danger Zone</AlertTitle>
                <AlertDescription className="flex items-center justify-between mt-2">
                    <span>Permanently delete your account and all of your content.</span>
                    <Button variant="destructive" size="sm">Delete Account</Button>
                </AlertDescription>
            </Alert>
        </div>
    )
}
