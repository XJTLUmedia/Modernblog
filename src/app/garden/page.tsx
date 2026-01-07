'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sprout, Leaf, ArrowRight, User, Calendar, Clock, Zap, Plus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { motion } from 'framer-motion'

const statusConfig = {
  seedling: {
    label: 'Seedling',
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    icon: '🌱'
  },
  growing: {
    label: 'Growing',
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    icon: '🌿'
  },
  evergreen: {
    label: 'Evergreen',
    color: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    icon: '🌲'
  }
}

export default function GardenPage() {
  const [notes, setNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/check')
        if (res.ok) {
          const data = await res.json()
          setIsAdmin(data.isAdmin)
        }
      } catch (err) {
        console.error('Auth check failed:', err)
      }
    }
    checkAuth()
  }, [])

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch('/api/garden')
        if (response.ok) {
          const data = await response.json()
          setNotes(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error('Error fetching garden notes:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchNotes()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 relative overflow-hidden">
        {/* Decorative bg */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] -z-10" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-5xl sm:text-7xl font-black mb-6 tracking-tight">
                  The <span className="text-emerald-500 italic">Lab</span>.
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                  Living, interconnected notes and raw insights forming a digital garden of thoughts.
                </p>
              </div>
              {isAdmin && (
                <Link href="/admin/garden/new">
                  <Button className="h-16 px-8 gap-3 font-black rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95">
                    <Plus className="h-5 w-5" />
                    Plant New Seed
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>

          {notes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center py-20 bg-emerald-500/5 rounded-3xl border-2 border-dashed border-emerald-500/20"
            >
              <Sprout className="h-16 w-16 text-emerald-500/50 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">The garden is empty</h3>
              <p className="text-muted-foreground">New seeds are being planted soon.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {notes.map((note, i) => {
                const status = statusConfig[note.status as keyof typeof statusConfig] || statusConfig.seedling

                return (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="h-full flex flex-col border-2 hover:border-emerald-500/50 transition-all hover:shadow-2xl group overflow-hidden">
                      <CardHeader className="relative">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex flex-wrap gap-2">
                            {note.tags?.slice(0, 3).map((tagRelation: any) => (
                              <Badge key={tagRelation.tag?.id} variant="secondary" className="bg-emerald-500/5 text-emerald-600 border-emerald-500/10">
                                {tagRelation.tag?.name}
                              </Badge>
                            ))}
                          </div>
                          <Badge className={status.color + " border"}>
                            {status.icon} {status.label}
                          </Badge>
                        </div>
                        <CardTitle className="text-2xl font-bold mb-3 group-hover:text-emerald-600 transition-colors">
                          {note.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-3 text-base leading-relaxed">
                          {note.content?.substring(0, 180).replace(/[#*`]/g, '') || 'Interconnected thoughts and observations...'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="mt-auto pt-6 border-t bg-muted/5 transition-colors group-hover:bg-emerald-500/5">
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-6">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {new Date(note.updatedAt || note.createdAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2">
                            {note.viewCount || 0} visits
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/garden/${note.slug}`} className="flex-1">
                            <Button className="w-full gap-2 font-bold bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all group-hover:scale-[1.02]">
                              Explore Note
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </Link>
                          {isAdmin && (
                            <Link href={`/admin/garden/${note.id}/edit`}>
                              <Button variant="outline" size="icon" className="h-10 w-10 border-2 border-emerald-500/20 hover:bg-emerald-50 rounded-xl">
                                <Zap className="h-4 w-4 text-emerald-600" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
