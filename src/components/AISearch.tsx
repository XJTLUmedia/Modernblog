'use client'

import { useState, useEffect, useRef } from 'react'
import {
    Search, Sparkles, MessageSquare, BookOpen,
    Sprout, Hammer, ArrowRight, X, Command,
    Loader2, History, TrendingUp, Zap, Send,
    ChevronRight, Brain, Filter, Download, Maximize2
} from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import ReactMarkdown from 'react-markdown'

interface Message {
    role: 'user' | 'assistant'
    content: string
    results?: any[]
    isSearching?: boolean
}

interface AISearchProps {
    trigger?: React.ReactNode
}

export function AISearch({ trigger }: AISearchProps) {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [isSearching, setIsSearching] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const scrollRef = useRef<HTMLDivElement>(null)

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

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
        }
    }, [messages, isSearching])

    const handleSearch = async (overrideQuery?: string) => {
        const searchInput = overrideQuery || query
        if (!searchInput.trim()) return

        const newUserMessage: Message = { role: 'user', content: searchInput }
        setMessages(prev => [...prev, newUserMessage])
        setQuery('')
        setIsSearching(true)

        try {
            // Prepare history (excluding current user message which is separate in the prompt)
            const history = messages.map(m => ({ role: m.role, content: m.content }))

            const response = await fetch('/api/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: searchInput, history, limit: 10 })
            })

            if (!response.ok) throw new Error('Search failed')

            const data = await response.json()

            const mappedResults = (data.results || []).map((r: any) => ({
                id: r.id,
                type: r.type,
                title: r.title,
                slug: r.slug,
                excerpt: r.excerpt || r.description || (r.content ? r.content.slice(0, 150) + '...' : ''),
                matchScore: r.matchScore || 50,
                reason: r.reason
            }))

            const aiAssistantMessage: Message = {
                role: 'assistant',
                content: data.answer || "Interaction complete.",
                results: mappedResults
            }

            setMessages(prev => [...prev, aiAssistantMessage])
        } catch (err) {
            console.error('AI Search Error:', err)
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Transmission error. Neural link unstable. Please retry."
            }])
        } finally {
            setIsSearching(false)
        }
    }

    const startSummarize = (title: string) => {
        setQuery(`Summarize the core technical logic of "${title}"`)
        setTimeout(() => handleSearch(`Summarize the core technical logic of "${title}"`), 100)
    }

    return (
        <>
            <div onClick={() => setOpen(true)}>
                {trigger || (
                    <Button variant="outline" className="relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64 border-2 hover:bg-primary/5 transition-all">
                        <Search className="mr-2 h-4 w-4" />
                        <span className="hidden lg:inline-flex">Search with AI...</span>
                        <span className="inline-flex lg:hidden">Search...</span>
                        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                            <span className="text-xs">⌘</span>K
                        </kbd>
                    </Button>
                )}
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden gap-0 border-primary/20 shadow-[0_0_50px_-12px_rgba(0,0,0,0.3)] bg-background/95 backdrop-blur-2xl">
                    <DialogTitle className="sr-only">Neural Librarian Interface</DialogTitle>
                    <DialogDescription className="sr-only">
                        Multi-round AI search and knowledge integration system.
                    </DialogDescription>

                    <div className="flex flex-col h-[750px]">
                        {/* Status Bar */}
                        <div className="px-6 py-2 border-b bg-muted/30 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-primary/60">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" /> Neural Link: Online</span>
                                <span className="flex items-center gap-1.5">Model: GPT-4o-Librarian</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <History className="h-3 w-3" />
                                {messages.length} Rounds Active
                            </div>
                        </div>

                        {/* Search Bar - Fixed at top */}
                        <div className="px-6 py-4 flex items-center gap-4 bg-background border-b z-10">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <input
                                    className="w-full bg-muted/30 border-2 border-transparent focus:border-primary/20 focus:bg-background h-14 pl-11 pr-4 rounded-2xl outline-none text-lg font-medium transition-all placeholder:text-muted-foreground/50"
                                    placeholder="Ask the Librarian anything..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    autoFocus
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    <Button
                                        onClick={() => handleSearch()}
                                        disabled={isSearching || !query.trim()}
                                        size="sm"
                                        className="h-9 px-4 rounded-xl font-black uppercase tracking-tight shadow-lg shadow-primary/20"
                                    >
                                        <Send className="h-4 w-4 mr-2" />
                                        Execute
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Chat & Results Area */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
                            {messages.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-8 py-12">
                                    <div className="relative">
                                        <div className="absolute -inset-4 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                                        <Brain className="h-16 w-16 text-primary relative" />
                                    </div>
                                    <div className="max-w-md space-y-4">
                                        <h2 className="text-2xl font-black uppercase tracking-tighter">Site-wide Intelligence</h2>
                                        <p className="text-muted-foreground font-medium">I have indexed every blog post, garden note, and technical project. Ask me to compare, summarize, or find specific architectural patterns.</p>
                                        <div className="grid grid-cols-2 gap-3 pt-4">
                                            {['Summarize Bloom Filter post', 'Explain the "Forge" concept', 'Recent AI experiments', 'How to contact?'].map(txt => (
                                                <Button
                                                    key={txt}
                                                    variant="outline"
                                                    className="justify-start h-12 px-4 rounded-xl border-2 hover:bg-primary/5 hover:text-primary font-bold text-xs"
                                                    onClick={() => { setQuery(txt); setTimeout(() => handleSearch(txt), 50) }}
                                                >
                                                    <Sparkles className="h-3 w-3 mr-2 text-primary" />
                                                    {txt}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {messages.map((message, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
                                >
                                    <div className={`max-w-[85%] rounded-[2rem] p-6 ${message.role === 'user'
                                        ? 'bg-primary text-primary-foreground shadow-xl'
                                        : 'bg-muted/30 border-2 border-muted'
                                        }`}>
                                        <div className="flex items-center gap-2 mb-3 opacity-60">
                                            {message.role === 'user' ? <div className="text-[10px] font-black uppercase tracking-[0.2em]">Transmitting Query</div> : <div className="flex items-center gap-1.5"><Sparkles className="h-3 w-3" /><span className="text-[10px] font-black uppercase tracking-[0.2em]">Neural Synthesis</span></div>}
                                        </div>
                                        <div className={`text-lg font-medium leading-relaxed ${message.role === 'assistant' ? 'prose dark:prose-invert max-w-none' : ''}`}>
                                            {message.role === 'assistant' ? (
                                                <ReactMarkdown>{message.content}</ReactMarkdown>
                                            ) : (
                                                message.content
                                            )}
                                        </div>
                                    </div>

                                    {/* Data Table for Assistant Results */}
                                    {message.results && message.results.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="w-full mt-6 bg-card border-2 rounded-[2.5rem] overflow-hidden shadow-2xl"
                                        >
                                            <div className="bg-muted/50 px-8 py-4 flex items-center justify-between border-b">
                                                <div className="flex items-center gap-2">
                                                    <Filter className="h-4 w-4 text-primary" />
                                                    <span className="text-xs font-black uppercase tracking-widest">Matched Content Matrix</span>
                                                </div>
                                                <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground">
                                                    <span>{message.results.length} Nodes Located</span>
                                                </div>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left border-collapse">
                                                    <thead>
                                                        <tr className="bg-muted/20">
                                                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-12">#</th>
                                                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Entity (Title)</th>
                                                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Type</th>
                                                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Neural Sync</th>
                                                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right w-32">Acquisition</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-muted/50">
                                                        {message.results.map((result, idx) => (
                                                            <tr key={idx} className="group hover:bg-primary/5 transition-colors">
                                                                <td className="px-8 py-5 font-mono text-xs text-muted-foreground opacity-50">{idx + 1}</td>
                                                                <td className="px-4 py-5">
                                                                    <div className="flex flex-col">
                                                                        <span className="font-bold text-base leading-tight group-hover:text-primary transition-colors">{result.title}</span>
                                                                        <span className="text-xs text-muted-foreground line-clamp-1 mt-1 opacity-70 italic">{result.reason || result.excerpt}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-5 text-center">
                                                                    <Badge variant="outline" className={`uppercase text-[10px] px-2 py-0 border-2 ${result.type === 'blog' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                                                                        result.type === 'garden' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                                                                            'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                                                        }`}>
                                                                        {result.type}
                                                                    </Badge>
                                                                </td>
                                                                <td className="px-4 py-5 font-black text-center">
                                                                    <div className="flex items-center justify-center gap-1.5 text-emerald-500 text-xs">
                                                                        <TrendingUp className="h-3 w-3" />
                                                                        {result.matchScore}%
                                                                    </div>
                                                                </td>
                                                                <td className="px-8 py-5 text-right">
                                                                    <div className="flex items-center justify-end gap-2">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all text-muted-foreground"
                                                                            onClick={() => startSummarize(result.title)}
                                                                            title="Summarize Node"
                                                                        >
                                                                            <Brain className="h-4 w-4" />
                                                                        </Button>
                                                                        <Link href={`/${result.type === 'blog' ? 'blog' : result.type === 'garden' ? 'garden' : 'forge'}/${result.slug}`} onClick={() => setOpen(false)}>
                                                                            <Button size="sm" className="h-9 w-9 rounded-xl shadow-lg border-2">
                                                                                <Maximize2 className="h-4 w-4" />
                                                                            </Button>
                                                                        </Link>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))}

                            {isSearching && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-start gap-4"
                                >
                                    <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center animate-pulse">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-black uppercase tracking-widest text-primary">Thinking...</p>
                                        <p className="text-xs text-muted-foreground italic">Librarian is searching the neural archives and synthesizing a response.</p>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Footer Tips */}
                        <div className="px-6 py-4 border-t bg-muted/20 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                            <div className="flex gap-6">
                                <span className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-primary" /> Semantic Search Active</span>
                                <span className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> RAG Enabled</span>
                            </div>
                            <div className="flex gap-4">
                                <kbd className="px-1.5 border rounded-lg bg-background">ESC</kbd> to Close
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
