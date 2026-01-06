'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sprout, Plus, Edit, Trash2, ArrowRight, Search, Leaf } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

const statusConfig = {
  seedling: {
    label: 'Seedling',
    color: 'bg-emerald-500/10 text-emerald-600',
    icon: '🌱'
  },
  growing: {
    label: 'Growing',
    color: 'bg-blue-500/10 text-blue-600',
    icon: '🌿'
  },
  evergreen: {
    label: 'Evergreen',
    color: 'bg-purple-500/10 text-purple-600',
    icon: '🌲'
  }
}

import { motion } from 'framer-motion'
import { Eye } from 'lucide-react'

export default function GardenList() {
  const [notes, setNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch('/api/admin/garden')
        if (response.ok) {
          const data = await response.json()
          setNotes(data)
        }
      } catch (error) {
        console.error('Error fetching notes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotes()
  }, [])

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/garden`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })

      if (response.ok) {
        alert('Note deleted successfully!')
        setNotes(notes.filter(n => n.id !== id))
      } else {
        alert('Failed to delete note')
      }
    } catch (error) {
      console.error('Error deleting note:', error)
      alert('Error deleting note')
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
              <Link href="/admin/dashboard" className="text-xl font-black tracking-tight hover:text-primary transition-colors">
                Modern <span className="text-primary italic">Blog</span>.
              </Link>
            </div>

            <nav className="flex items-center gap-6">
              <Link href="/admin/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link href="/admin/posts" className="text-sm font-medium hover:text-primary transition-colors">
                Posts
              </Link>
              <Link href="/admin/garden" className="text-sm font-medium text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full">
                Notes
              </Link>
              <Link href="/admin/projects" className="text-sm font-medium hover:text-primary transition-colors">
                Projects
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 py-12 relative overflow-hidden">
        {/* Decorative bg */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] -z-10" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12"
          >
            <div>
              <h1 className="text-5xl sm:text-7xl font-black mb-4 tracking-tight">
                Digital <span className="text-emerald-500 italic">Garden</span>.
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Management portal for your raw thoughts and growing notes.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 border-2 rounded-xl border-emerald-500/20 focus-visible:ring-emerald-500/20"
                />
              </div>
              <Link href="/admin/garden/new" className="w-full sm:w-auto">
                <Button className="w-full gap-2 h-12 px-6 font-bold bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20">
                  <Plus className="h-5 w-5" />
                  New Note
                </Button>
              </Link>
            </div>
          </motion.div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="animate-spin h-10 w-10 border-b-2 border-emerald-500 rounded-full"></div>
              <p className="text-muted-foreground font-medium">Cultivating notes...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredNotes.map((note, i) => {
                const status = statusConfig[note.status as keyof typeof statusConfig] || statusConfig.seedling

                return (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="h-full flex flex-col border-2 hover:border-emerald-500/50 transition-all hover:shadow-2xl group overflow-hidden">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <Badge className={status.color + " border border-emerald-500/10"}>
                            {status.icon} {status.label}
                          </Badge>
                          <div className="p-2 bg-muted rounded-lg text-sm font-mono flex items-center gap-2">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            {note.viewCount || 0}
                          </div>
                        </div>
                        <CardTitle className="text-2xl font-bold group-hover:text-emerald-600 transition-colors line-clamp-2">
                          {note.title}
                        </CardTitle>
                        <CardDescription className="text-base line-clamp-3 mt-2 leading-relaxed">
                          {note.content?.substring(0, 150).replace(/[#*`]/g, '') || 'No content provided'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="mt-auto pt-6 border-t bg-muted/5 flex flex-col gap-4">
                        <div className="flex items-center justify-between text-sm text-muted-foreground font-medium">
                          <span>Updated {new Date(note.updatedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link href={`/garden/${note.slug}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full gap-2 border-2 hover:bg-emerald-50 hover:text-emerald-600 border-emerald-500/20">
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                          </Link>
                          <Link href={`/admin/garden/${note.id}/edit`} className="flex-1">
                            <Button variant="secondary" size="sm" className="w-full gap-2">
                              <Edit className="h-4 w-4" />
                              Edit
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleDelete(note.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}

          {!loading && filteredNotes.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-emerald-500/5 rounded-3xl border-2 border-dashed border-emerald-500/20"
            >
              <Sprout className="h-16 w-16 text-emerald-500/50 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">No notes found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery ? 'Try adjusting your search terms' : 'Begin planting your digital garden today.'}
              </p>
              <Link href="/admin/garden/new">
                <Button className="h-12 px-8 font-bold bg-emerald-600 hover:bg-emerald-700 shadow-lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Plant New Note
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
