'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, Eye, Hammer, CheckCircle2, Loader2, Globe, Github, Info, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function NewProject() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('in-progress')
  const [liveUrl, setLiveUrl] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [order, setOrder] = useState('0')
  const [progress, setProgress] = useState('0')
  const [priority, setPriority] = useState('medium')
  const [techStack, setTechStack] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const techStackArray = techStack
        .split(',')
        .map(tech => ({ name: tech.trim() }))
        .filter(tech => tech.name.length > 0)

      const response = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug: slug.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\s-]+/g, '-'),
          description,
          status,
          liveUrl: liveUrl || null,
          githubUrl: githubUrl || null,
          order: parseInt(order) || 0,
          progress: parseInt(progress) || 0,
          priority: priority,
          techStack: techStackArray
        })
      })

      if (response.ok) {
        router.push('/admin/projects')
        router.refresh()
      } else {
        const errorData = await response.json()
        alert(`Failed to create project: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error creating project:', error)
      alert('Error creating project')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="sticky top-16 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/projects">
                <Button variant="ghost" size="sm" className="gap-2 font-bold hover:bg-blue-500/5">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
              <div className="h-4 w-px bg-border hidden sm:block" />
              <h2 className="text-sm font-black uppercase tracking-widest hidden sm:block">Project <span className="text-blue-600 border-b-2 border-blue-600/20">Forge</span></h2>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="hidden sm:flex gap-2 font-bold border-2">
                <Eye className="h-4 w-4" />
                Preview
              </Button>
              <Button onClick={handleSubmit} disabled={saving} size="sm" className="gap-2 font-black uppercase tracking-tight bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 px-6">
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? 'Forging...' : 'Ignite Forge'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 py-12 relative overflow-hidden">
        {/* Forge Decorative Background */}
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-blue-500/5 rounded-full blur-[140px] -z-10 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] -z-10" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Main Content Area */}
              <div className="lg:col-span-2 space-y-8">
                <Card className="border-4 border-blue-100/50 rounded-[2.5rem] overflow-hidden shadow-2xl bg-card/50 backdrop-blur-xl">
                  <div className="h-2 w-full bg-gradient-to-r from-blue-600 to-indigo-400" />
                  <CardHeader className="pt-10 px-10">
                    <CardTitle className="text-3xl font-black tracking-tighter uppercase flex items-center gap-3">
                      <Hammer className="h-8 w-8 text-blue-600" />
                      Project Specification
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8 p-10 pt-0">
                    <div className="space-y-4">
                      <Label htmlFor="title" className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Project Name</Label>
                      <Input
                        id="title"
                        placeholder="Neural Interface Dashboard..."
                        value={title}
                        onChange={(e) => {
                          setTitle(e.target.value)
                          const slugValue = e.target.value
                            .toLowerCase()
                            .replace(/\s+/g, '-')
                            .replace(/[^\w\s-]+/g, '-')
                            .substring(0, 100)
                          setSlug(slugValue)
                        }}
                        className="h-16 text-2xl font-bold bg-blue-50/20 border-2 border-blue-100/50 hover:border-blue-300 focus-visible:ring-blue-500/20 rounded-2xl transition-all"
                        required
                      />
                    </div>

                    <div className="space-y-4">
                      <Label htmlFor="description" className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Engineering Description</Label>
                      <Textarea
                        id="description"
                        className="min-h-[200px] text-lg leading-relaxed bg-blue-50/10 border-2 border-blue-100/50 focus-visible:ring-blue-500/20 rounded-3xl p-8 transition-all resize-none"
                        placeholder="Define the scope and technical challenges..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="liveUrl" className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <Globe className="h-3 w-3" /> Live Deployment
                        </Label>
                        <Input
                          id="liveUrl"
                          type="url"
                          placeholder="https://..."
                          value={liveUrl}
                          onChange={(e) => setLiveUrl(e.target.value)}
                          className="h-12 border-2 border-blue-100 rounded-xl bg-blue-50/10"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="githubUrl" className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <Github className="h-3 w-3" /> Repository
                        </Label>
                        <Input
                          id="githubUrl"
                          type="url"
                          placeholder="https://github.com/..."
                          value={githubUrl}
                          onChange={(e) => setGithubUrl(e.target.value)}
                          className="h-12 border-2 border-blue-100 rounded-xl bg-blue-50/10"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar Settings */}
              <div className="space-y-8">
                <Card className="border-2 border-blue-100 rounded-[2rem] overflow-hidden shadow-xl bg-card/50 backdrop-blur-xl sticky top-32">
                  <CardHeader className="bg-blue-50/30 py-6 border-b border-blue-100">
                    <CardTitle className="text-lg font-black tracking-widest uppercase flex items-center gap-2 text-blue-900">
                      Blueprint Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <div className="space-y-2">
                      <Label htmlFor="slug" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-blue-800/60">System ID / Slug</Label>
                      <Input
                        id="slug"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className="h-10 font-mono text-xs bg-blue-50/30 border-2 border-blue-100 rounded-xl"
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="techStack" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-blue-800/60 flex items-center gap-2">
                        <Layers className="h-3 w-3" /> Material Components
                      </Label>
                      <Input
                        id="techStack"
                        placeholder="React, Three.js, GSAP"
                        value={techStack}
                        onChange={(e) => setTechStack(e.target.value)}
                        className="h-12 border-2 border-blue-100 rounded-xl bg-blue-50/20"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="status" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-blue-800/60">Stage</Label>
                        <Select value={status} onValueChange={setStatus}>
                          <SelectTrigger className="h-10 border-2 border-blue-100 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="idea">💡 Idea</SelectItem>
                            <SelectItem value="in-progress">🔨 Building</SelectItem>
                            <SelectItem value="completed">✅ Shipped</SelectItem>
                            <SelectItem value="archived">📦 Stored</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="priority" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-blue-800/60">Priority</Label>
                        <Select value={priority} onValueChange={setPriority}>
                          <SelectTrigger className="h-10 border-2 border-blue-100 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="progress" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-blue-800/60 flex justify-between">
                        Formation Progress <span>{progress}%</span>
                      </Label>
                      <Input
                        id="progress"
                        type="range"
                        value={progress}
                        onChange={(e) => setProgress(e.target.value)}
                        className="h-2 bg-blue-100 rounded-full appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>

                    <div className="pt-6 border-t border-blue-100">
                      <div className="flex items-center gap-3 text-blue-600 mb-6">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="text-xs font-black uppercase tracking-tight text-blue-800">Ready for Ignition</span>
                      </div>
                      <Button onClick={handleSubmit} disabled={saving} className="w-full h-16 rounded-2xl font-black uppercase tracking-tight bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 text-lg transition-transform active:scale-95">
                        {saving ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Forging...
                          </span>
                        ) : 'Ignite Forge'}
                      </Button>
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

