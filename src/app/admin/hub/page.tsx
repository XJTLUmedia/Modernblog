'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, Plus, Trash2, BookOpen, Target, Music, Github, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Footer } from '@/components/Footer'

import { Navbar } from '@/components/Navbar'
import { motion } from 'framer-motion'
import { LayoutDashboard } from 'lucide-react'

export default function AdminHub() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [hubData, setHubData] = useState({
        content: '',
        learning: [],
        readingList: [],
        listeningTo: [],
        githubRepos: []
    })

    useEffect(() => {
        const fetchHub = async () => {
            try {
                const res = await fetch('/api/hub')
                if (res.ok) {
                    const data = await res.json()
                    if (data) {
                        setHubData({
                            content: data.content || '',
                            learning: data.learning || [],
                            readingList: data.readingList || [],
                            listeningTo: data.listeningTo || [],
                            githubRepos: data.githubRepos || []
                        })
                    }
                }
            } catch (error) {
                console.error('Error fetching hub:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchHub()
    }, [])

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch('/api/admin/hub', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(hubData)
            })
            if (res.ok) {
                alert('Hub updated successfully!')
            } else {
                alert('Failed to update hub')
            }
        } catch (error) {
            console.error('Error saving hub:', error)
            alert('Error saving hub')
        } finally {
            setSaving(false)
        }
    }

    const addItem = (section: string, defaultItem: any) => {
        setHubData((prev: any) => ({
            ...prev,
            [section]: [...prev[section], defaultItem]
        }))
    }

    const removeItem = (section: string, index: number) => {
        setHubData((prev: any) => ({
            ...prev,
            [section]: prev[section].filter((_: any, i: number) => i !== index)
        }))
    }

    const updateItem = (section: string, index: number, field: string, value: any) => {
        setHubData((prev: any) => {
            const newItems = [...prev[section]]
            newItems[index] = { ...newItems[index], [field]: value }
            return { ...prev, [section]: newItems }
        })
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="animate-spin h-10 w-10 border-b-2 border-orange-500 rounded-full"></div>
        </div>
    )

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <div className="sticky top-14 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-12 items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Link href="/admin/dashboard" className="text-sm font-bold flex items-center gap-2 hover:text-primary transition-colors">
                                <ArrowLeft className="h-4 w-4" />
                                Dashboard
                            </Link>
                        </div>

                        <Button onClick={handleSave} disabled={saving} size="sm" className="bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-500/20 gap-2 font-bold px-6 h-9">
                            <Save className="h-4 w-4" />
                            {saving ? 'Saving...' : 'Save Hub'}
                        </Button>
                    </div>
                </div>
            </div>

            <main className="flex-1 py-12 relative overflow-hidden">
                {/* Decorative bg */}
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[100px] -z-10" />

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12"
                    >
                        <h1 className="text-5xl sm:text-7xl font-black mb-4 tracking-tight">
                            Command <span className="text-orange-600 italic">Center</span>.
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            Configure your public hub presence, learning goals, and media interests.
                        </p>
                    </motion.div>

                    <div className="space-y-12">
                        {/* Introduction / Big Picture */}
                        <motion.section
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card className="border-2 shadow-xl overflow-hidden">
                                <CardHeader className="border-b bg-muted/30 py-6">
                                    <CardTitle className="flex items-center gap-2 text-2xl font-black tracking-tight">
                                        <div className="p-2 bg-rose-500/10 rounded-xl">
                                            <Heart className="h-6 w-6 text-rose-600" />
                                        </div>
                                        The Big Picture (Introduction)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-8">
                                    <div className="space-y-3">
                                        <Label className="font-bold text-sm tracking-wide uppercase text-muted-foreground">Contextual Narrative</Label>
                                        <Textarea
                                            value={hubData.content}
                                            onChange={(e) => setHubData(prev => ({ ...prev, content: e.target.value }))}
                                            placeholder="What are you focused on this month? (Markdown supported)"
                                            className="min-h-[200px] text-lg border-2 rounded-2xl focus-visible:ring-rose-500/20 leading-relaxed"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.section>

                        {/* GitHub Repositories Section */}
                        <motion.section
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 }}
                        >
                            <Card className="border-2 shadow-xl overflow-hidden">
                                <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 py-6">
                                    <CardTitle className="flex items-center gap-2 text-2xl font-black tracking-tight">
                                        <div className="p-2 bg-zinc-900/10 rounded-xl">
                                            <Github className="h-6 w-6 text-zinc-900" />
                                        </div>
                                        Active GitHub Build-log
                                    </CardTitle>
                                    <Button variant="outline" size="sm" onClick={() => addItem('githubRepos', { name: '', description: '', url: '' })} className="border-2 font-bold hover:bg-zinc-100 transition-all">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Index Repository
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-8">
                                    {hubData.githubRepos.map((repo: any, index: number) => (
                                        <div key={index} className="space-y-6 p-6 border-2 rounded-2xl bg-muted/10 relative group">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                <div className="space-y-3">
                                                    <Label className="font-bold text-sm tracking-wide uppercase text-muted-foreground">Repository Name</Label>
                                                    <Input
                                                        value={repo.name}
                                                        onChange={(e) => updateItem('githubRepos', index, 'name', e.target.value)}
                                                        placeholder="e.g. personal-ai-assistant"
                                                        className="h-12 border-2 rounded-xl focus-visible:ring-zinc-900/20"
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <Label className="font-bold text-sm tracking-wide uppercase text-muted-foreground">Access Port (URL)</Label>
                                                    <Input
                                                        value={repo.url}
                                                        onChange={(e) => updateItem('githubRepos', index, 'url', e.target.value)}
                                                        placeholder="https://github.com/username/repo"
                                                        className="h-12 border-2 rounded-xl focus-visible:ring-zinc-900/20"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="font-bold text-sm tracking-wide uppercase text-muted-foreground">Mission Brief (Description)</Label>
                                                <Input
                                                    value={repo.description}
                                                    onChange={(e) => updateItem('githubRepos', index, 'description', e.target.value)}
                                                    placeholder="Focusing on decentralized identity protocols..."
                                                    className="h-12 border-2 rounded-xl focus-visible:ring-zinc-900/20"
                                                />
                                            </div>
                                            <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-destructive hover:bg-destructive/10 sm:relative sm:top-0 sm:right-0" onClick={() => removeItem('githubRepos', index)}>
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    ))}
                                    {hubData.githubRepos.length === 0 && (
                                        <div className="text-center py-12 border-2 border-dashed rounded-2xl border-muted-foreground/20">
                                            <p className="text-muted-foreground font-medium">No repositories indexed. Reference your active codebases here.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.section>
                        {/* Currently Learning */}
                        <motion.section
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Card className="border-2 shadow-xl overflow-hidden">
                                <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 py-6">
                                    <CardTitle className="flex items-center gap-2 text-2xl font-black tracking-tight">
                                        <div className="p-2 bg-orange-500/10 rounded-xl">
                                            <Target className="h-6 w-6 text-orange-600" />
                                        </div>
                                        Currently Learning
                                    </CardTitle>
                                    <Button variant="outline" size="sm" onClick={() => addItem('learning', { topic: '', progress: 0, color: 'text-blue-500', icon: 'Target' })} className="border-2 font-bold hover:bg-orange-50 hover:text-orange-600 hover:border-orange-500/20 transition-all">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Milestone
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-8">
                                    {hubData.learning.map((item: any, index: number) => (
                                        <div key={index} className="flex flex-col sm:flex-row items-start sm:items-end gap-6 p-6 border-2 rounded-2xl bg-muted/10 relative group">
                                            <div className="flex-1 w-full space-y-3">
                                                <Label className="font-bold text-sm tracking-wide uppercase text-muted-foreground">Topic Perspective</Label>
                                                <Input
                                                    value={item.topic}
                                                    onChange={(e) => updateItem('learning', index, 'topic', e.target.value)}
                                                    placeholder="e.g. Master-level Architecture"
                                                    className="h-12 border-2 rounded-xl focus-visible:ring-orange-500/20"
                                                />
                                            </div>
                                            <div className="w-full sm:w-48 space-y-3">
                                                <Label className="font-bold text-sm tracking-wide uppercase text-muted-foreground">Icon Symbol</Label>
                                                <select
                                                    className="w-full h-12 px-4 py-2 border-2 rounded-xl bg-background font-medium focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
                                                    value={item.icon || 'Target'}
                                                    onChange={(e) => updateItem('learning', index, 'icon', e.target.value)}
                                                >
                                                    <option value="Target">Target (Aim)</option>
                                                    <option value="BookOpen">Book (Read)</option>
                                                    <option value="Sprout">Garden (Note)</option>
                                                    <option value="Hammer">Hammer (Build)</option>
                                                    <option value="TrendingUp">Trend (Stats)</option>
                                                    <option value="Flame">Flame (Hot)</option>
                                                    <option value="Clock">Clock (Time)</option>
                                                    <option value="CheckCircle">Check (Done)</option>
                                                    <option value="LayoutDashboard">Dashboard</option>
                                                </select>
                                            </div>
                                            <div className="w-full sm:w-32 space-y-3">
                                                <Label className="font-bold text-sm tracking-wide uppercase text-muted-foreground">Mastery ({item.progress}%)</Label>
                                                <Input
                                                    type="number"
                                                    value={item.progress}
                                                    onChange={(e) => updateItem('learning', index, 'progress', parseInt(e.target.value))}
                                                    min="0" max="100"
                                                    className="h-12 border-2 rounded-xl focus-visible:ring-orange-500/20 font-bold"
                                                />
                                            </div>
                                            <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-destructive hover:bg-destructive/10 sm:relative sm:top-0 sm:right-0 sm:h-12 sm:w-12" onClick={() => removeItem('learning', index)}>
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    ))}
                                    {hubData.learning.length === 0 && (
                                        <div className="text-center py-12 border-2 border-dashed rounded-2xl border-muted-foreground/20">
                                            <p className="text-muted-foreground font-medium">No learning goals defined. Press 'Add Milestone' to start.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.section>

                        {/* Reading List */}
                        <motion.section
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="border-2 shadow-xl overflow-hidden">
                                <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 py-6">
                                    <CardTitle className="flex items-center gap-2 text-2xl font-black tracking-tight">
                                        <div className="p-2 bg-primary/10 rounded-xl">
                                            <BookOpen className="h-6 w-6 text-primary" />
                                        </div>
                                        Reading Log
                                    </CardTitle>
                                    <Button variant="outline" size="sm" onClick={() => addItem('readingList', { title: '', author: '', status: 'queued' })} className="border-2 font-bold hover:bg-primary/5 hover:text-primary transition-all">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Book
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-8">
                                    {hubData.readingList.map((book: any, index: number) => (
                                        <div key={index} className="flex flex-col sm:flex-row items-start sm:items-end gap-6 p-6 border-2 rounded-2xl bg-muted/10 relative group">
                                            <div className="flex-1 w-full space-y-3">
                                                <Label className="font-bold text-sm tracking-wide uppercase text-muted-foreground">Literary Title</Label>
                                                <Input
                                                    value={book.title}
                                                    onChange={(e) => updateItem('readingList', index, 'title', e.target.value)}
                                                    className="h-12 border-2 rounded-xl focus-visible:ring-primary/20"
                                                    placeholder="e.g. Clean Code"
                                                />
                                            </div>
                                            <div className="flex-1 w-full space-y-3">
                                                <Label className="font-bold text-sm tracking-wide uppercase text-muted-foreground">Architect/Author</Label>
                                                <Input
                                                    value={book.author}
                                                    onChange={(e) => updateItem('readingList', index, 'author', e.target.value)}
                                                    className="h-12 border-2 rounded-xl focus-visible:ring-primary/20"
                                                    placeholder="e.g. Robert Martin"
                                                />
                                            </div>
                                            <div className="w-full sm:w-48 space-y-3">
                                                <Label className="font-bold text-sm tracking-wide uppercase text-muted-foreground">Status</Label>
                                                <select
                                                    className="w-full h-12 px-4 py-2 border-2 rounded-xl bg-background font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                                                    value={book.status}
                                                    onChange={(e) => updateItem('readingList', index, 'status', e.target.value)}
                                                >
                                                    <option value="reading">Reading</option>
                                                    <option value="queued">Queued</option>
                                                    <option value="finished">Finished</option>
                                                </select>
                                            </div>
                                            <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-destructive hover:bg-destructive/10 sm:relative sm:top-0 sm:right-0 sm:h-12 sm:w-12" onClick={() => removeItem('readingList', index)}>
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    ))}
                                    {hubData.readingList.length === 0 && (
                                        <div className="text-center py-12 border-2 border-dashed rounded-2xl border-muted-foreground/20">
                                            <p className="text-muted-foreground font-medium">Your library is empty. Add a book toinspire others.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.section>

                        {/* Listening To */}
                        <motion.section
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Card className="border-2 shadow-xl overflow-hidden">
                                <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 py-6">
                                    <CardTitle className="flex items-center gap-2 text-2xl font-black tracking-tight">
                                        <div className="p-2 bg-purple-500/10 rounded-xl">
                                            <Music className="h-6 w-6 text-purple-600" />
                                        </div>
                                        Acoustic Feed
                                    </CardTitle>
                                    <Button variant="outline" size="sm" onClick={() => addItem('listeningTo', { title: '', type: 'Music', url: '' })} className="border-2 font-bold hover:bg-purple-50 hover:text-purple-600 transition-all hover:border-purple-500/20">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Atmosphere
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-8">
                                    {hubData.listeningTo.map((item: any, index: number) => (
                                        <div key={index} className="flex flex-col sm:flex-row items-start sm:items-end gap-6 p-6 border-2 rounded-2xl bg-muted/10 relative group">
                                            <div className="flex-1 w-full space-y-3">
                                                <Label className="font-bold text-sm tracking-wide uppercase text-muted-foreground">Title/Artist</Label>
                                                <Input
                                                    value={item.title}
                                                    onChange={(e) => updateItem('listeningTo', index, 'title', e.target.value)}
                                                    className="h-12 border-2 rounded-xl focus-visible:ring-purple-500/20"
                                                    placeholder="e.g. Lofi Girl - Midnight"
                                                />
                                            </div>
                                            <div className="w-full sm:w-48 space-y-3">
                                                <Label className="font-bold text-sm tracking-wide uppercase text-muted-foreground">Medium Type</Label>
                                                <select
                                                    className="w-full h-12 px-4 py-2 border-2 rounded-xl bg-background font-medium focus:ring-2 focus:ring-purple-500/20 outline-none"
                                                    value={item.type}
                                                    onChange={(e) => updateItem('listeningTo', index, 'type', e.target.value)}
                                                >
                                                    <option value="Music">Music</option>
                                                    <option value="Podcast">Podcast</option>
                                                    <option value="Audiobook">Audiobook</option>
                                                </select>
                                            </div>
                                            <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-destructive hover:bg-destructive/10 sm:relative sm:top-0 sm:right-0 sm:h-12 sm:w-12" onClick={() => removeItem('listeningTo', index)}>
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    ))}
                                    {hubData.listeningTo.length === 0 && (
                                        <div className="text-center py-12 border-2 border-dashed rounded-2xl border-muted-foreground/20">
                                            <p className="text-muted-foreground font-medium">No audio sources active. Add music or podcasts.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}

