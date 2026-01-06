'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, Eye, Sprout, CheckCircle2, Loader2, Leaf } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Textarea } from '@/components/ui/textarea'

export default function NewGardenNote() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState('seedling')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/admin/garden', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug: slug.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\s-]+/g, '-'),
          content,
          status
        })
      })

      if (response.ok) {
        router.push('/admin/garden')
        router.refresh()
      } else {
        const errorData = await response.json().catch(() => ({}))
        alert(errorData.error || 'Failed to create garden note')
      }
    } catch (error) {
      console.error('Error creating note:', error)
      alert('Error creating garden note')
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
              <Link href="/admin/garden">
                <Button variant="ghost" size="sm" className="gap-2 font-bold hover:bg-emerald-500/5">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
              <div className="h-4 w-px bg-border hidden sm:block" />
              <h2 className="text-sm font-black uppercase tracking-widest hidden sm:block">Digital <span className="text-emerald-600 border-b-2 border-emerald-600/20">Garden</span></h2>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="hidden sm:flex gap-2 font-bold border-2">
                <Eye className="h-4 w-4" />
                Preview
              </Button>
              <Button onClick={handleSubmit} disabled={saving} size="sm" className="gap-2 font-black uppercase tracking-tight bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 px-6">
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? 'Planting...' : 'Plant Note'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 py-12 relative overflow-hidden">
        {/* Garden Decorative Background */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] -z-10 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-green-500/5 rounded-full blur-[100px] -z-10" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Main Content Area */}
              <div className="lg:col-span-2 space-y-8">
                <Card className="border-4 border-emerald-100/50 rounded-[2.5rem] overflow-hidden shadow-2xl bg-card/50 backdrop-blur-xl">
                  <div className="h-2 w-full bg-gradient-to-r from-emerald-500 to-green-300" />
                  <CardHeader className="pt-10 px-10">
                    <CardTitle className="text-3xl font-black tracking-tighter uppercase flex items-center gap-3">
                      <Leaf className="h-8 w-8 text-emerald-600" />
                      Note Cultivation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8 p-10 pt-0">
                    <div className="space-y-4">
                      <Label htmlFor="title" className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 text-emerald-800/60">Seed Title</Label>
                      <Input
                        id="title"
                        placeholder="The hidden patterns of moss..."
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
                        className="h-16 text-2xl font-bold bg-emerald-50/20 border-2 border-emerald-100/50 hover:border-emerald-300 focus-visible:ring-emerald-500/20 rounded-2xl transition-all"
                        required
                      />
                    </div>

                    <div className="space-y-4">
                      <Label htmlFor="content" className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 text-emerald-800/60">Organic Content (Markdown)</Label>
                      <Textarea
                        id="content"
                        className="min-h-[400px] text-lg leading-relaxed bg-emerald-50/10 border-2 border-emerald-100/50 focus-visible:ring-emerald-500/20 rounded-3xl p-8 transition-all resize-none"
                        placeholder="Nurture your thoughts here..."
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
                <Card className="border-2 border-emerald-100 rounded-[2rem] overflow-hidden shadow-xl bg-card/50 backdrop-blur-xl sticky top-32">
                  <CardHeader className="bg-emerald-50/30 py-6 border-b border-emerald-100">
                    <CardTitle className="text-lg font-black tracking-widest uppercase flex items-center gap-2 text-emerald-800">
                      Cultivation Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <div className="space-y-2">
                      <Label htmlFor="slug" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground lg:text-emerald-800/60">Garden URI</Label>
                      <Input
                        id="slug"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className="h-10 font-mono text-xs bg-emerald-50/30 border-2 border-emerald-100 rounded-xl"
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="status" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-emerald-800/60">Growth Phase</Label>
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="w-full h-12 border-2 border-emerald-100 rounded-xl bg-emerald-50/20 font-bold text-emerald-900">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-2 border-emerald-100 shadow-xl">
                          <SelectItem value="seedling" className="focus:bg-emerald-50">🌱 Seedling</SelectItem>
                          <SelectItem value="growing" className="focus:bg-emerald-50">🌿 Growing</SelectItem>
                          <SelectItem value="evergreen" className="focus:bg-emerald-50">🌲 Evergreen</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="pt-6 border-t border-emerald-100">
                      <div className="flex items-center gap-3 text-emerald-600 mb-6">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="text-xs font-black uppercase tracking-tight">Ecosystem Ready</span>
                      </div>
                      <Button onClick={handleSubmit} disabled={saving} className="w-full h-16 rounded-2xl font-black uppercase tracking-tight bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 text-lg">
                        {saving ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Planting...
                          </span>
                        ) : 'Cultivate'}
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
