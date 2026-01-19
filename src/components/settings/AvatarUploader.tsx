'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Camera, Image as ImageIcon, Loader2, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface AvatarUploaderProps {
    user: any
    onUpdate?: (newUrl: string) => void
}

export function AvatarUploader({ user, onUpdate }: AvatarUploaderProps) {
    const { toast } = useToast()
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [previewUrl, setPreviewUrl] = useState('')
    const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file')

    const currentAvatar = user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: 'File too large',
                description: 'Please upload an image smaller than 5MB.',
                variant: 'destructive',
            })
            return
        }

        // Create local preview
        const objectUrl = URL.createObjectURL(file)
        setPreviewUrl(objectUrl)
    }

    const handleSave = async () => {
        setIsLoading(true)
        try {
            if (uploadMode === 'file') {
                // Upload file to server
                const fileInput = document.getElementById('picture') as HTMLInputElement
                const file = fileInput?.files?.[0]

                if (!file) throw new Error("No file selected")

                const formData = new FormData()
                formData.append('file', file)
                formData.append('userId', user.id) // Ensure user ID is passed

                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                })

                if (!res.ok) throw new Error("Upload failed")
                const data = await res.json()

                if (onUpdate) onUpdate(data.url)

                toast({
                    title: 'Avatar updated',
                    description: 'Your profile picture has been updated successfully.',
                })
                setIsOpen(false)
            } else {
                // URL Mode - Update Profile Directly via API
                const formData = new FormData();
                formData.append('avatarUrl', previewUrl);
                formData.append('userId', user.id);

                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });

                if (!res.ok) throw new Error("Update failed");
                const data = await res.json();

                if (onUpdate) onUpdate(data.url);

                toast({
                    title: 'Avatar updated',
                    description: 'Profile picture URL updated successfully.'
                })
                setIsOpen(false)
            }
        } catch (error) {
            console.error(error)
            toast({
                title: 'Error',
                description: 'Failed to update avatar.',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group cursor-pointer" onClick={() => setIsOpen(true)}>
                <Avatar className="h-24 w-24 border-4 border-muted transition-transform group-hover:scale-105">
                    <AvatarImage src={currentAvatar} className="object-cover" />
                    <AvatarFallback className="text-2xl">{user?.name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-8 w-8 text-white" />
                </div>
            </div>

            <div className="space-y-2 text-center sm:text-left">
                <h4 className="font-semibold text-lg">Profile Photo</h4>
                <p className="text-sm text-muted-foreground w-full max-w-xs">
                    Upload a new photo or use your Gravatar. Recommended size: 400x400px.
                </p>

                <div className="flex gap-2 justify-center sm:justify-start pt-2">
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                                <ImageIcon className="h-3.5 w-3.5" />
                                Change Avatar
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Update Profile Picture</DialogTitle>
                                <DialogDescription>
                                    Upload a new picture or provide a URL to set your avatar.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <div className="flex justify-center mb-4">
                                    <Avatar className="h-32 w-32 border-4 border-muted">
                                        <AvatarImage src={previewUrl || currentAvatar} />
                                        <AvatarFallback className="text-4xl">{user?.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-2">
                                    <Button
                                        variant={uploadMode === 'file' ? 'default' : 'outline'}
                                        onClick={() => setUploadMode('file')}
                                        size="sm"
                                    >
                                        Upload File
                                    </Button>
                                    <Button
                                        variant={uploadMode === 'url' ? 'default' : 'outline'}
                                        onClick={() => setUploadMode('url')}
                                        size="sm"
                                    >
                                        Image URL
                                    </Button>
                                </div>

                                {uploadMode === 'file' ? (
                                    <div className="grid w-full max-w-sm items-center gap-1.5">
                                        <Label htmlFor="picture">Picture</Label>
                                        <Input id="picture" type="file" accept="image/*" onChange={handleFileChange} />
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Label htmlFor="url">Image URL</Label>
                                        <Input
                                            id="url"
                                            placeholder="https://example.com/avatar.png"
                                            value={previewUrl}
                                            onChange={(e) => setPreviewUrl(e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                                <Button onClick={handleSave} disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive gap-2">
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                    </Button>
                </div>
            </div>
        </div>
    )
}
