'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, Image as ImageIcon, Video, Globe, Search, FileText, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Basic type for AI Artifact based on schema
interface AIArtifact {
    id: string
    type: 'image' | 'video' | 'web_summary' | 'search_result' | 'text'
    content: string
    createdAt: string
    provider: string
}

export function AIHistory({ userId, onSelect }: { userId: string, onSelect: (item: AIArtifact) => void }) {
    const [history, setHistory] = useState<AIArtifact[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch(`/api/user/ai-history?userId=${userId}`)
                if (res.ok) {
                    const data = await res.json()
                    setHistory(data)
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        if (userId) fetchHistory()
    }, [userId])

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        try {
            const res = await fetch(`/api/ai/artifact/${id}`, { method: 'DELETE' })
            if (res.ok) {
                setHistory(prev => prev.filter(i => i.id !== id))
            }
        } catch (error) {
            console.error("Failed to delete", error)
        }
    }

    if (loading) return <Loader2 className="h-4 w-4 animate-spin" />

    return (
        <ScrollArea className="h-[400px]">
            <div className="space-y-2 p-2">
                {history.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No history yet.</p>}
                {history.map(item => (
                    <Card key={item.id} className="cursor-pointer hover:bg-muted/50 group" onClick={() => onSelect(item)}>
                        <CardContent className="p-3 flex items-center justify-between">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="p-2 bg-muted rounded-md shrink-0">
                                    {item.type === 'image' && <ImageIcon className="h-4 w-4" />}
                                    {item.type === 'video' && <Video className="h-4 w-4" />}
                                    {item.type === 'web_summary' && <Globe className="h-4 w-4" />}
                                    {item.type === 'search_result' && <Search className="h-4 w-4" />}
                                    {item.type === 'text' && <FileText className="h-4 w-4" />}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-medium truncate capitalize">{item.type}</p>
                                    <p className="text-xs text-muted-foreground truncate w-[200px]">{item.content}</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive hover:bg-destructive/10"
                                onClick={(e) => handleDelete(e, item.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </ScrollArea>
    )
}
