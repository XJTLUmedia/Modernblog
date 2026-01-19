'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Sparkles, ImageIcon, Video, Globe, Search, FileText } from 'lucide-react'
import { AIHistory } from './AIHistory' // Assumes AIHistory is in same folder or adjusted import
import { useToast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'

interface AIAssetsModalProps {
    onInsert: (content: string) => void
    userId: string
}

export function AIAssetsModal({ onInsert, userId }: AIAssetsModalProps) {
    const { toast } = useToast()
    const [isOpen, setIsOpen] = useState(false)
    const [mode, setMode] = useState<'generate' | 'history'>('generate')
    const [genType, setGenType] = useState<'image' | 'video' | 'web' | 'search' | 'text'>('text')
    const [loading, setLoading] = useState(false)
    const [prompt, setPrompt] = useState("")

    const handleGenerate = async () => {
        setLoading(true)
        try {
            const endpoint = `/api/ai/${genType === 'web' ? 'web-read' : genType}`
            const body = genType === 'web' ? { url: prompt } : genType === 'search' ? { query: prompt } : { prompt }

            const res = await fetch(endpoint, {
                method: 'POST',
                body: JSON.stringify({ ...body, userId })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            // Auto insert based on type
            let insertText = ""
            if (genType === 'image') insertText = `![Generated Image](${data.url})`
            if (genType === 'video') insertText = `<video src="${data.url}" controls />`
            if (genType === 'web') insertText = `> **${data.title}**\n\n${data.content}`
            if (genType === 'search') insertText = data.results.map((r: any) => `- [${r.title}](${r.link}): ${r.snippet}`).join('\n')
            if (genType === 'text') insertText = data.content

            onInsert(insertText)
            setIsOpen(false)
            toast({ title: "Inserted!" })
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const handleSelectHistory = (item: any) => {
        let insertText = ""
        if (item.type === 'image') insertText = `![Generated Image](${item.content})`
        if (item.type === 'video') insertText = `<video src="${item.content}" controls />`
        if (item.type === 'web_summary') insertText = `${item.content}` // Already formatted
        if (item.type === 'search_result') {
            // content is JSON string
            try {
                const results = JSON.parse(item.content)
                insertText = results.map((r: any) => `- [${r.title}](${r.link}): ${r.snippet}`).join('\n')
            } catch (e) { insertText = item.content }
        }
        onInsert(insertText)
        setIsOpen(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 text-purple-600 border-purple-200 hover:bg-purple-50">
                    <Sparkles className="h-4 w-4" />
                    AI Assistant
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle>AI Content Assistant</DialogTitle>
                    <DialogDescription>Generate new content or insert from history.</DialogDescription>
                </DialogHeader>

                <Tabs value={mode} onValueChange={(v) => setMode(v as 'generate' | 'history')}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="generate">Generate New</TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
                    </TabsList>

                    <TabsContent value="generate" className="space-y-4 py-4">
                        <Tabs value={genType} onValueChange={(v) => setGenType(v as any)}>
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="text"><FileText className="h-4 w-4 mr-2" />Text</TabsTrigger>
                                <TabsTrigger value="image"><ImageIcon className="h-4 w-4 mr-2" />Image</TabsTrigger>
                                <TabsTrigger value="video"><Video className="h-4 w-4 mr-2" />Video</TabsTrigger>
                                <TabsTrigger value="web"><Globe className="h-4 w-4 mr-2" />Web</TabsTrigger>
                                <TabsTrigger value="search"><Search className="h-4 w-4 mr-2" />Search</TabsTrigger>
                            </TabsList>

                            <div className="mt-4 space-y-4">
                                <div className="space-y-2">
                                    <Label>
                                        {genType === 'web' ? 'URL' : genType === 'search' ? 'Search Query' : 'Prompt / Instruction'}
                                    </Label>
                                    {genType === 'web' || genType === 'search' ? (
                                        <Input value={prompt} onChange={e => setPrompt(e.target.value)} placeholder={genType === 'web' ? 'https://...' : 'Search query...'} />
                                    ) : (
                                        <Textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder={genType === 'text' ? "Write a blog intro about..." : "Describe image/video..."} rows={4} />
                                    )}
                                </div>
                                <Button onClick={handleGenerate} disabled={loading} className="w-full">
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Generate & Insert
                                </Button>
                            </div>
                        </Tabs>
                    </TabsContent>

                    <TabsContent value="history" className="py-4">
                        <AIHistory userId={userId} onSelect={handleSelectHistory} />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}

import { Label } from "@/components/ui/label"
