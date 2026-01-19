'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Save, Eye, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { motion, AnimatePresence } from 'framer-motion'
import { AIAssetsModal } from '@/components/ai/AIAssetsModal'
import { useAuth } from '@/hooks/use-auth'

export default function EditBlogPost() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const userId = user?.id || ""
  const id = params?.id as string
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [published, setPublished] = useState(false)
  const [recallQuestions, setRecallQuestions] = useState('')
  const [mnemonics, setMnemonics] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return

    const fetchPost = async () => {
      try {
        const response = await fetch('/api/admin/posts', {
          credentials: 'include'
        })
        if (response.ok) {
          const posts = await response.json()
          const post = Array.isArray(posts) ? posts.find((p: any) => p.id === id) : null

          if (post) {
            setTitle(post.title || '')
            setSlug(post.slug || '')
            setContent(post.content || '')
            setExcerpt(post.excerpt || '')
            setPublished(post.published || false)

            if (post.recallQuestions) {
              const q = typeof post.recallQuestions === 'string' ? JSON.parse(post.recallQuestions) : post.recallQuestions
              setRecallQuestions(Array.isArray(q) ? q.join('\n') : '')
            }
            if (post.mnemonics) {
              const m = typeof post.mnemonics === 'string' ? JSON.parse(post.mnemonics) : post.mnemonics
              setMnemonics(Array.isArray(m) ? m.join('\n') : '')
            }
          } else {
            console.error('Post not found')
          }
        }
      } catch (error) {
        console.error('Error fetching post:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/admin/posts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id,
          title,
          slug: slug.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\s-]+/g, '-'),
          content,
          excerpt,
          published,
          recallQuestions: recallQuestions ? JSON.stringify(recallQuestions.split('\n').filter(s => s.trim())) : null,
          mnemonics: mnemonics ? JSON.stringify(mnemonics.split('\n').filter(s => s.trim())) : null
        })
      })

      if (response.ok) {
        router.push('/admin/posts')
        router.refresh()
      } else {
        const errorData = await response.json().catch(() => ({}))
        alert(errorData.error || 'Failed to update blog post')
      }
    } catch (error) {
      console.error('Error updating post:', error)
      alert('Error updating blog post')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Intel...</p>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="sticky top-16 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/posts">
                <Button variant="ghost" size="sm" className="gap-2 font-bold hover:bg-primary/5">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
              <div className="h-4 w-px bg-border hidden sm:block" />
              <h2 className="text-sm font-black uppercase tracking-widest hidden sm:block">Refining <span className="text-primary">Existing Intel</span></h2>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="hidden sm:flex gap-2 font-bold border-2">
                <Eye className="h-4 w-4" />
                Preview
              </Button>
              <Button onClick={handleSubmit} disabled={saving} size="sm" className="gap-2 font-black uppercase tracking-tight shadow-lg shadow-primary/20 px-6">
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? 'Saving...' : 'Commit Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 py-12 relative overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] -z-10" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Main Content Area */}
              <div className="lg:col-span-2 space-y-8">
                <Card className="border-4 rounded-[2.5rem] overflow-hidden shadow-2xl bg-card/50 backdrop-blur-xl">
                  <div className="h-2 w-full bg-gradient-to-r from-primary to-purple-500" />
                  <CardHeader className="pt-10 px-10">
                    <CardTitle className="text-3xl font-black tracking-tighter uppercase">Primary Intel</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8 p-10 pt-0">
                    <div className="space-y-4">
                      <Label htmlFor="title" className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Transmission Title</Label>
                      <Input
                        id="title"
                        placeholder="The evolution of digital synapses..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="h-16 text-2xl font-bold bg-muted/30 border-2 border-muted hover:border-primary/50 focus-visible:ring-primary/20 rounded-2xl transition-all"
                        required
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="content" className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Core Substance (Markdown)</Label>
                        <AIAssetsModal userId={userId} onInsert={(text) => setContent(prev => prev + '\n' + text)} />
                      </div>
                      <Textarea
                        id="content"
                        className="min-h-[500px] text-lg leading-relaxed bg-muted/20 border-2 border-muted focus-visible:ring-primary/20 rounded-3xl p-8 transition-all resize-none"
                        placeholder="Start typing your vision here..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar Settings */}
              <div className="space-y-8">
                <Card className="border-2 rounded-[2rem] overflow-hidden shadow-xl bg-card/50 backdrop-blur-xl">
                  <CardHeader className="bg-muted/30 py-6 border-b">
                    <CardTitle className="text-lg font-black tracking-widest uppercase flex items-center gap-2">
                      Metadata
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <div className="space-y-2">
                      <Label htmlFor="slug" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Access URI</Label>
                      <Input
                        id="slug"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className="h-10 font-mono text-xs bg-muted/30 border-2 rounded-xl"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="excerpt" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Transmission Excerpt</Label>
                      <Textarea
                        id="excerpt"
                        placeholder="A brief summary for the preview feed..."
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        className="min-h-[100px] text-sm bg-muted/30 border-2 rounded-xl"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border-2 border-dashed border-muted">
                      <div className="space-y-1">
                        <Label htmlFor="published" className="text-xs font-black uppercase cursor-pointer">Live Status</Label>
                        <p className="text-[10px] text-muted-foreground font-medium italic">Visible to the public</p>
                      </div>
                      <input
                        type="checkbox"
                        id="published"
                        checked={published}
                        onChange={(e) => setPublished(e.target.checked)}
                        className="h-6 w-6 rounded-lg border-2 border-primary text-primary focus:ring-primary/20 transition-all cursor-pointer"
                      />
                    </div>

                    <div className="pt-4 border-t-2 border-dashed border-muted">
                      <div className="flex items-center gap-3 text-primary mb-4">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="text-xs font-black uppercase tracking-tight">Post ID: {id.substring(0, 8)}...</span>
                      </div>
                      <Button onClick={handleSubmit} disabled={saving} className="w-full h-14 rounded-2xl font-black uppercase tracking-tight shadow-xl shadow-primary/20">
                        {saving ? 'Syncing...' : 'Update Transfer'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Memorization Augmentation */}
                <Card className="border-2 border-emerald-500/20 rounded-[2rem] overflow-hidden shadow-xl bg-card/50 backdrop-blur-xl">
                  <CardHeader className="bg-emerald-500/5 py-6 border-b border-emerald-500/10">
                    <CardTitle className="text-sm font-black tracking-widest uppercase flex items-center gap-2 text-emerald-600">
                      <Save className="h-4 w-4" />
                      Cognitive Sync
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="recall" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Force Retrieval (one per line)</Label>
                      <Textarea
                        id="recall"
                        placeholder="What is the primary conclusion?&#10;How does the system scale?"
                        value={recallQuestions}
                        onChange={(e) => setRecallQuestions(e.target.value)}
                        className="min-h-[100px] text-xs font-medium bg-muted/30 border-2 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mnemonics" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Memory Anchors (one per line)</Label>
                      <Textarea
                        id="mnemonics"
                        placeholder="&quot;V-I-S-I-O-N&quot; — Velocity, Integration, Scalability..."
                        value={mnemonics}
                        onChange={(e) => setMnemonics(e.target.value)}
                        className="min-h-[100px] text-xs font-medium bg-muted/30 border-2 rounded-xl italic"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

