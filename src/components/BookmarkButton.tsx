'use client'

import { useState } from 'react'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface BookmarkButtonProps {
    type: 'post' | 'garden' | 'project'
    id: string
    initialBookmarked?: boolean
    className?: string
}

export function BookmarkButton({ type, id, initialBookmarked = false, className }: BookmarkButtonProps) {
    const [bookmarked, setBookmarked] = useState(initialBookmarked)
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    const toggleBookmark = async () => {
        setLoading(true)
        // Optimistic update
        setBookmarked(!bookmarked)

        try {
            const res = await fetch('/api/user/bookmark', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, id })
            })

            if (!res.ok) {
                if (res.status === 401) {
                    toast({ title: "Please login to bookmark", variant: "destructive" })
                } else {
                    throw new Error('Failed to bookmark')
                }
                // Revert
                setBookmarked(bookmarked)
                return
            }

            const data = await res.json()
            setBookmarked(data.bookmarked)

            toast({
                title: data.bookmarked ? "Saved to Bookmarks" : "Removed from Bookmarks",
                description: data.bookmarked ? "You can find this in your profile." : "Item removed from your saved list."
            })

        } catch (error) {
            console.error(error)
            // Revert
            setBookmarked(bookmarked)
            toast({ title: "Something went wrong", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleBookmark}
            disabled={loading}
            className={cn("text-muted-foreground hover:text-primary transition-colors", className)}
        >
            {bookmarked ? (
                <BookmarkCheck className="h-5 w-5 text-primary fill-primary/20" />
            ) : (
                <Bookmark className="h-5 w-5" />
            )}
            <span className="sr-only">Bookmark</span>
        </Button>
    )
}
