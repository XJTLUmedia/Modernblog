'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Send, Loader2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface CommentSectionProps {
    postId?: string
    gardenNoteId?: string
}

export function CommentSection({ postId, gardenNoteId }: CommentSectionProps) {
    const [comments, setComments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [content, setContent] = useState('')
    const { user, authenticated } = useAuth()
    const { toast } = useToast()

    const fetchComments = async () => {
        try {
            const query = postId ? `postId=${postId}` : `gardenNoteId=${gardenNoteId}`
            const res = await fetch(`/api/comments?${query}`)
            if (res.ok) {
                const data = await res.json()
                setComments(data)
            }
        } catch (error) {
            console.error('Failed to fetch comments', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchComments()
    }, [postId, gardenNoteId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim() || !authenticated) return

        setSubmitting(true)
        try {
            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content,
                    postId,
                    gardenNoteId
                })
            })

            if (!res.ok) throw new Error('Failed to post')

            const newComment = await res.json()
            setComments([newComment, ...comments])
            setContent('')
            toast({ title: 'Comment posted!' })
        } catch (error) {
            toast({ title: 'Error posting comment', variant: 'destructive' })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <section id="comments" className="space-y-8 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <MessageCircle className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-black tracking-tight">Discussion ({comments.length})</h2>
            </div>

            {authenticated ? (
                <form onSubmit={handleSubmit} className="mb-10 bg-muted/5 p-6 rounded-2xl border-2 border-muted/50">
                    <div className="flex gap-4">
                        <Avatar>
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} />
                            <AvatarFallback>ME</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-4">
                            <Textarea
                                placeholder="Share your thoughts..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="bg-background min-h-[100px]"
                            />
                            <Button type="submit" disabled={submitting || !content.trim()} className="font-bold">
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                                Post Comment
                            </Button>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="mb-10 p-8 text-center bg-muted/5 rounded-2xl border-2 border-dashed">
                    <p className="text-muted-foreground font-medium mb-4">Sign in to join the conversation</p>
                    <Link href="/auth/login">
                        <Button variant="outline">Sign In</Button>
                    </Link>
                </div>
            )}

            <div className="space-y-6">
                {loading ? (
                    <div className="text-center py-10"><Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" /></div>
                ) : comments.length === 0 ? (
                    <p className="text-center text-muted-foreground italic py-10">No comments yet. Be the first to start the discussion.</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4 p-6 bg-card rounded-2xl border shadow-sm">
                            <Avatar>
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author?.email}`} />
                                <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-bold">{comment.authorName || 'Anonymous'}</h4>
                                    <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                                </div>
                                <p className="text-foreground/80 leading-relaxed">{comment.content}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    )
}
