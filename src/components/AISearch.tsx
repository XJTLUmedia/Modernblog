'use client'

import { useState, useEffect } from 'react'
import {
    Search, Sparkles, MessageSquare, BookOpen,
    Sprout, Hammer, ArrowRight, X, Command,
    Loader2, History, TrendingUp, Zap
} from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface AISearchProps {
    trigger?: React.ReactNode
}

export function AISearch({ trigger }: AISearchProps) {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [isSearching, setIsSearching] = useState(false)
    const [results, setResults] = useState<any[]>([])
    const [aiAnswer, setAiAnswer] = useState<string | null>(null)

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    const handleSearch = async () => {
        if (!query.trim()) return

        setIsSearching(true)
        setAiAnswer(null)
        setResults([])

        try {
            const response = await fetch('/api/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, limit: 10 })
            })

            if (!response.ok) throw new Error('Search failed')

            const data = await response.json()

            // Map the API results to the UI format
            const mappedResults = (data.results || []).map((r: any) => ({
                id: r.id,
                type: r.type, // 'blog', 'garden', 'project'
                title: r.title,
                slug: r.slug,
                excerpt: r.excerpt || r.description || (r.content ? r.content.slice(0, 150) + '...' : ''),
                matchScore: Math.round((r.matchScore || r.relevanceScore || 0.5)) // It might already be 0-100 or 0-1
            }))

            setResults(mappedResults)

            // If the API returns a direct answer (Ask Mode / Deep Research)
            if (data.answer) {
                setAiAnswer(data.answer)
            }
            // Fallback: If we have results but no direct answer (shouldn't happen with new API but good for safety)
            else if (data.results && data.results.length > 0) {
                const bestResult = data.results[0]
                setAiAnswer(bestResult.reason || `I found ${data.results.length} relevant items. The most relevant is "${bestResult.title}".`)
            } else {
                setAiAnswer("I couldn't find any content directly matching your query. Try searching for broader terms or related topics.")
            }

        } catch (err) {
            console.error('AI Search Error:', err)
            setAiAnswer("Sorry, I encountered an error while processing your search. Please try again later.")
        } finally {
            setIsSearching(false)
        }
    }

    return (
        <>
            <div onClick={() => setOpen(true)}>
                {trigger || (
                    <Button variant="outline" className="relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64">
                        <span className="hidden lg:inline-flex">Search with AI...</span>
                        <span className="inline-flex lg:hidden">Search...</span>
                        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                            <span className="text-xs">⌘</span>K
                        </kbd>
                    </Button>
                )}
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden gap-0 border-primary/20 shadow-2xl shadow-primary/10">
                    <DialogTitle className="sr-only">AI Search Interface</DialogTitle>
                    <DialogDescription className="sr-only">
                        Ask questions about the blog content or search for specific topics using AI.
                    </DialogDescription>
                    <div className="flex flex-col h-[600px]">
                        {/* Header / Search Bar */}
                        <div className="flex items-center px-4 py-4 border-b bg-muted/30">
                            <Search className="h-5 w-5 text-muted-foreground mr-3" />
                            <input
                                className="flex-1 bg-transparent border-none outline-none text-lg placeholder:text-muted-foreground/50"
                                placeholder="Ask anything across entire content..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                autoFocus
                            />
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 flex gap-1 items-center">
                                    <Sparkles className="h-3 w-3" />
                                    AI Powered
                                </Badge>
                                {query && (
                                    <button onClick={() => setQuery('')} className="p-1 hover:bg-muted rounded text-muted-foreground">
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <ScrollArea className="flex-1 p-4">
                            <AnimatePresence mode="wait">
                                {!query && !results.length && (
                                    <motion.div
                                        key="empty-state"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-6 py-4"
                                    >
                                        <div>
                                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 px-2">Popular Questions</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {['How do I use Generics?', 'What is your digital garden?', 'Current projects in Forge', 'Contact info'].map((q) => (
                                                    <Button
                                                        key={q}
                                                        variant="ghost"
                                                        className="justify-start gap-2 h-10 px-2 text-sm hover:bg-primary/5 hover:text-primary transition-all group"
                                                        onClick={() => { setQuery(q); setTimeout(handleSearch, 100) }}
                                                    >
                                                        <MessageSquare className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                                                        {q}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-center justify-center py-10 text-center opacity-50">
                                            <Command className="h-12 w-12 mb-4 text-muted-foreground" />
                                            <p className="text-sm font-medium">Start typing to search semantically...</p>
                                            <p className="text-xs mt-1">Use ⌘K to open from anywhere</p>
                                        </div>
                                    </motion.div>
                                )}

                                {isSearching && (
                                    <motion.div
                                        key="searching"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col items-center justify-center py-20 gap-4"
                                    >
                                        <div className="relative">
                                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                            <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-purple-500 animate-pulse" />
                                        </div>
                                        <div className="space-y-1 text-center">
                                            <p className="font-semibold text-primary">AI is thinking...</p>
                                            <p className="text-xs text-muted-foreground">Searching vector index & summarizing content</p>
                                        </div>
                                    </motion.div>
                                )}

                                {aiAnswer && !isSearching && (
                                    <motion.div
                                        key="answer"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="mb-8"
                                    >
                                        <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 shadow-sm relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                                                <Sparkles className="h-12 w-12 text-primary" />
                                            </div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="bg-primary text-primary-foreground p-1.5 rounded-lg shadow-lg">
                                                    <Zap className="h-4 w-4" />
                                                </div>
                                                <span className="text-sm font-bold uppercase tracking-tight text-primary">Smart Summary</span>
                                            </div>
                                            <p className="text-sm leading-relaxed text-muted-foreground relative z-10">
                                                {aiAnswer}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}

                                {results.length > 0 && !isSearching && (
                                    <motion.div
                                        key="results"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-2 mb-8"
                                    >
                                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 px-2">Matched Content</h3>
                                        {results.map((result, i) => (
                                            <Link
                                                key={i}
                                                href={`/${result.type === 'blog' ? 'blog' : result.type === 'garden' ? 'garden' : 'forge'}/${result.slug}`}
                                                onClick={() => setOpen(false)}
                                            >
                                                <div className="group flex items-center justify-between p-4 rounded-xl border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer">
                                                    <div className="flex items-start gap-4">
                                                        <div className="mt-1 p-2 rounded-lg bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                            {result.type === 'blog' ? <BookOpen className="h-4 w-4" /> :
                                                                result.type === 'garden' ? <Sprout className="h-4 w-4" /> : <Hammer className="h-4 w-4" />}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-base group-hover:text-primary transition-colors">{result.title}</h4>
                                                            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{result.excerpt}</p>
                                                            <div className="flex gap-2 mt-2">
                                                                <Badge variant="outline" className="text-[10px] h-4 uppercase">{result.type}</Badge>
                                                                <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5">
                                                                    <TrendingUp className="h-2 w-2" />
                                                                    {result.matchScore}% match
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-primary" />
                                                </div>
                                            </Link>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </ScrollArea>

                        {/* Footer */}
                        <div className="px-4 py-3 border-t bg-muted/20 flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            <div className="flex gap-4">
                                <span className="flex items-center gap-1"><kbd className="px-1 border rounded bg-background">↵</kbd> Select</span>
                                <span className="flex items-center gap-1"><kbd className="px-1 border rounded bg-background">↑↓</kbd> Navigate</span>
                            </div>
                            <div>AI Search v2.0</div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
