'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Image as ImageIcon, Video, Globe, Search, Sparkles } from "lucide-react"

export default function AIStudioPage() {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [prompt, setPrompt] = useState("")
    const [result, setResult] = useState<any>(null)

    const handleGenerate = async (type: 'image' | 'video' | 'web-read' | 'search') => {
        setLoading(true)
        setResult(null)
        try {
            const endpoint = `/api/ai/${type}`
            const body = type === 'web-read' ? { url: prompt } : type === 'search' ? { query: prompt } : { prompt }

            // Allow user ID to be handled by session cookies or client-side auth context if needed
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...body, userId: user?.id })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Generation failed")

            setResult({ type, data })
            toast({ title: "Success", description: "Content generated successfully" })
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto py-10 space-y-8">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-xl">
                    <Sparkles className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">AI Studio</h1>
                    <p className="text-muted-foreground">Generate assets and research content for your blog.</p>
                </div>
            </div>

            <Tabs defaultValue="image" className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
                    <TabsTrigger value="image" className="gap-2"><ImageIcon className="h-4 w-4" /> Image</TabsTrigger>
                    <TabsTrigger value="video" className="gap-2"><Video className="h-4 w-4" /> Video</TabsTrigger>
                    <TabsTrigger value="web" className="gap-2"><Globe className="h-4 w-4" /> Reader</TabsTrigger>
                    <TabsTrigger value="search" className="gap-2"><Search className="h-4 w-4" /> Search</TabsTrigger>
                </TabsList>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Image Gen */}
                        <TabsContent value="image">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Image Generation</CardTitle>
                                    <CardDescription>Create stunning visuals using DALL-E 3.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Prompt</Label>
                                        <Textarea
                                            placeholder="A futuristic cyberpunk city with neon lights..."
                                            value={prompt}
                                            onChange={(e) => setPrompt(e.target.value)}
                                            rows={4}
                                        />
                                    </div>
                                    <Button onClick={() => handleGenerate('image')} disabled={loading} className="w-full">
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Generate Image
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Video Gen */}
                        <TabsContent value="video">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Video Generation</CardTitle>
                                    <CardDescription>Generate short clips using Replicate (Zeroscope/SVD).</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Prompt</Label>
                                        <Textarea
                                            placeholder="A cinematic drone shot of a mountain range..."
                                            value={prompt}
                                            onChange={(e) => setPrompt(e.target.value)}
                                            rows={4}
                                        />
                                    </div>
                                    <Button onClick={() => handleGenerate('video')} disabled={loading} className="w-full">
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Generate Video
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Web Reader */}
                        <TabsContent value="web">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Web Reader</CardTitle>
                                    <CardDescription>Extract and summarize content from any URL.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>URL</Label>
                                        <Input
                                            placeholder="https://example.com/article"
                                            value={prompt}
                                            onChange={(e) => setPrompt(e.target.value)}
                                        />
                                    </div>
                                    <Button onClick={() => handleGenerate('web-read')} disabled={loading} className="w-full">
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Read Content
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Search */}
                        <TabsContent value="search">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Semantic Search</CardTitle>
                                    <CardDescription>Search the web using Google Custom Search.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Query</Label>
                                        <Input
                                            placeholder="Latest trends in AI development..."
                                            value={prompt}
                                            onChange={(e) => setPrompt(e.target.value)}
                                        />
                                    </div>
                                    <Button onClick={() => handleGenerate('search')} disabled={loading} className="w-full">
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Search
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </div>

                    {/* Results Area */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold">Result</h3>
                        {loading && (
                            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl">
                                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                                <p className="text-muted-foreground animate-pulse">Generating magic...</p>
                            </div>
                        )}

                        {!loading && result && (
                            <Card className="overflow-hidden border-2 border-primary/20">
                                <CardHeader className="bg-muted/50 pb-2">
                                    <CardTitle className="text-sm uppercase font-black text-muted-foreground">
                                        {result.type === 'image' ? 'Generated Image' : 'Output'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {result.type === 'image' && (
                                        <div className="relative aspect-square w-full">
                                            <img src={result.data.url} alt="Generated" className="object-cover w-full h-full" />
                                            <div className="p-4">
                                                <Button variant="outline" size="sm" className="w-full mb-2" onClick={() => navigator.clipboard.writeText(`![Image](${result.data.url})`)}>
                                                    Copy Markdown
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                    {result.type === 'video' && (
                                        <div className="video-player">
                                            <video src={result.data.url} controls className="w-full aspect-video bg-black" />
                                            <div className="p-4">
                                                <Button variant="outline" size="sm" className="w-full mb-2" onClick={() => navigator.clipboard.writeText(`<video src="${result.data.url}" controls />`)}>
                                                    Copy Embed Code
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                    {result.type === 'web-read' && (
                                        <div className="p-4 max-h-[500px] overflow-y-auto prose dark:prose-invert text-sm">
                                            <h4 className="font-bold mb-2">{result.data.title}</h4>
                                            <div className="whitespace-pre-wrap">{result.data.content}</div>
                                        </div>
                                    )}
                                    {result.type === 'search' && (
                                        <div className="p-4 space-y-4">
                                            {result.data.results.map((item: any, i: number) => (
                                                <div key={i} className="border-b pb-2 last:border-0">
                                                    <a href={item.link} target="_blank" className="font-bold text-blue-500 hover:underline line-clamp-1">{item.title}</a>
                                                    <p className="text-xs text-muted-foreground line-clamp-2">{item.snippet}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </Tabs>
        </div>
    )
}
