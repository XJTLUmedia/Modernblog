'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Sprout, ArrowLeft, Calendar, Eye, Clock, Share2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { motion, AnimatePresence } from 'framer-motion'
import { ShareButton } from '@/components/ShareButton'
import { SubscribeButton } from '@/components/SubscribeButton'

const statusConfig = {
  seedling: { label: 'Seedling', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: '🌱' },
  growing: { label: 'Growing', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: '🌿' },
  evergreen: { label: 'Evergreen', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20', icon: '🌲' }
}

export default function GardenNotePage() {
  const params = useParams()
  const slug = params?.slug as string
  const [note, setNote] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return

    const fetchNote = async () => {
      try {
        const response = await fetch(`/api/garden/${encodeURIComponent(slug)}`)
        const data = await response.json()

        if (response.ok && !data.error) {
          setNote(data)
        } else {
          setError(data.error || 'Note not found')
        }
      } catch (error) {
        console.error('Error fetching note:', error)
        setError('Failed to load note')
      } finally {
        setLoading(false)
      }
    }

    fetchNote()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-emerald-500 rounded-full"></div>
        </div>
      </div>
    )
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Sprout className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
              <h1 className="text-4xl font-black mb-4 tracking-tight">Note Not Found</h1>
              <p className="text-muted-foreground mb-8 text-lg">{error || 'The note you are looking for does not exist in this garden.'}</p>
              <Link href="/garden">
                <Button size="lg" className="font-bold">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Return to Garden
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const status = statusConfig[note.status as keyof typeof statusConfig] || statusConfig.seedling

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -z-10" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Navigation & Actions */}
            <div className="flex items-center justify-between mb-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Link href="/garden">
                  <Button variant="ghost" className="gap-2 font-bold hover:text-emerald-600 group">
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Garden
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2"
              >
                <ShareButton
                  title={note.title}
                  text={note.summary || "Check out this note."}
                  className="gap-2 font-bold border-2"
                  variant="outline"
                  size="sm"
                />
              </motion.div>
            </div>

            {/* Note Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <Badge className={`${status.color} border-2 font-bold px-3 py-1`}>
                  <span className="mr-1.5">{status.icon}</span>
                  {status.label}
                </Badge>
                {note.tags?.map((tagRelation: any) => (
                  <Badge key={tagRelation.tag?.id} variant="secondary" className="bg-emerald-500/5 text-emerald-600 border-emerald-500/10 font-bold">
                    #{tagRelation.tag?.name}
                  </Badge>
                ))}
              </div>

              <h1 className="text-5xl sm:text-7xl font-black mb-8 tracking-tight leading-tight">
                {note.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-muted-foreground bg-muted/30 w-fit px-4 py-2 rounded-2xl border border-muted">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-500" />
                  {new Date(note.updatedAt || note.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-emerald-500" />
                  {note.viewCount || 0} visits
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-500" />
                  {Math.ceil((note.content?.length || 0) / 500)} min read
                </div>
              </div>
            </motion.div>

            {/* AI Summary Card (Optional/Design consistency) */}
            {note.summary && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-12"
              >
                <Card className="border-2 border-emerald-500/20 bg-emerald-500/5 overflow-hidden group">
                  <div className="h-1 w-full bg-emerald-500/20 group-hover:bg-emerald-500 transition-colors" />
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-black flex items-center gap-2 text-emerald-600 uppercase tracking-widest">
                      <Sparkles className="h-4 w-4" />
                      Key Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-emerald-700/80 leading-relaxed font-medium italic">
                      {note.summary}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Note Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="prose prose-lg dark:prose-invert max-w-none 
                prose-headings:font-black prose-headings:tracking-tight 
                prose-p:leading-relaxed prose-p:text-muted-foreground/90
                prose-strong:text-foreground prose-em:text-emerald-600/80
                prose-blockquote:border-emerald-500 prose-blockquote:bg-emerald-500/5 
                prose-blockquote:rounded-r-xl prose-blockquote:py-1 prose-blockquote:px-6">
                {note.content ? (
                  <div className="whitespace-pre-wrap">
                    {note.content}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-muted/20 rounded-3xl border-2 border-dashed">
                    <p className="text-muted-foreground italic font-bold">The gardener hasn't added details to this note yet.</p>
                  </div>
                )}
              </div>
            </motion.div>

            <Separator className="my-16" />

            {/* Footer / Meta */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-20 text-sm font-bold text-muted-foreground">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                  <Sprout className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-foreground">Cultivated by {note.author?.name || 'Gardener'}</div>
                  <div className="text-xs opacity-70">A living node in the digital garden</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <ShareButton
                  title={note.title}
                  text={note.summary || "Check out this note from the garden."}
                  className="rounded-full px-6 border-2 transition-all"
                />
                <SubscribeButton
                  category="garden"
                  className="rounded-full px-6 border-2 hover:bg-emerald-500 hover:text-white transition-all"
                >
                  Subscribe for updates
                </SubscribeButton>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
