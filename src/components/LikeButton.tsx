'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface LikeButtonProps {
    postId: string
    initialLikes?: number
    initialLiked?: boolean
    className?: string
}

export function LikeButton({ postId, initialLikes = 0, initialLiked = false, className }: LikeButtonProps) {
    const [liked, setLiked] = useState(initialLiked)
    const [likes, setLikes] = useState(initialLikes)
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    const toggleLike = async () => {
        setLoading(true)
        // Optimistic update
        const newLiked = !liked
        setLiked(newLiked)
        setLikes(prev => newLiked ? prev + 1 : prev - 1)

        try {
            const res = await fetch(`/api/posts/${postId}/react`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emoji: '❤️' })
            })

            if (!res.ok) {
                if (res.status === 401) {
                    toast({ title: "Please login to like", variant: "destructive" })
                } else {
                    throw new Error('Failed to reaction')
                }
                // Revert
                setLiked(!newLiked)
                setLikes(prev => !newLiked ? prev + 1 : prev - 1)
                return
            }

            const data = await res.json()
            setLiked(data.reacted)
            // Ideally we'd sync count from server but simpler to just stick with optimistic unless error

        } catch (error) {
            console.error(error)
            // Revert
            setLiked(!liked)
            setLikes(prev => !liked ? prev + 1 : prev - 1)
            toast({ title: "Something went wrong", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={toggleLike}
            disabled={loading}
            className={cn("group gap-2 hover:bg-red-500/10 hover:text-red-500 transition-colors", liked && "text-red-500", className)}
        >
            <div className="relative">
                <Heart className={cn("h-5 w-5 transition-all", liked && "fill-current scale-110")} />
                <AnimatePresence>
                    {liked && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 pointer-events-none"
                        >
                            <Heart className="h-5 w-5 fill-current" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <span className="font-bold tabular-nums">{likes}</span>
            <span className="sr-only">Like</span>
        </Button>
    )
}
