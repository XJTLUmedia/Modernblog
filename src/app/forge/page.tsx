'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Hammer, ExternalLink, Github, ArrowRight, Star, Layers, Activity, Zap, Plus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

const statusConfig = {
  idea: { label: 'Idea', color: 'bg-zinc-500/10 text-zinc-600 border-zinc-500/20' },
  'in-progress': { label: 'Active Build', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  completed: { label: 'Finished', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  archived: { label: 'Legacy', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' }
}

export default function ForgePage() {
  const [projects, setProjects] = useState<any[]>([])
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
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects')
        if (response.ok) {
          const data = await response.json()
          setProjects(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error('Error fetching projects:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
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
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-amber-500/5 rounded-full blur-[140px] -z-10" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-5xl sm:text-7xl font-black mb-6 tracking-tight">
                  The <span className="text-amber-500 italic">Forge</span>.
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                  Crafting high-performance digital experiences through case studies and experimental builds.
                </p>
              </div>
              {isAdmin && (
                <Link href="/admin/projects/new">
                  <Button className="h-16 px-8 gap-3 font-black rounded-2xl bg-amber-600 hover:bg-amber-700 text-white shadow-xl shadow-amber-600/20 transition-all hover:scale-105 active:scale-95">
                    <Plus className="h-5 w-5" />
                    Initiate New Build
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>

          {/* Projects Grid */}
          {projects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed"
            >
              <Hammer className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-2xl font-bold mb-2">No projects in the forge</h3>
              <p className="text-muted-foreground">New creations are coming soon.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {projects.map((project, i) => {
                const status = statusConfig[project.status as keyof typeof statusConfig] || statusConfig.idea
                const techStack = project.techStack ? (typeof project.techStack === 'string' ? JSON.parse(project.techStack) : project.techStack) : []

                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="h-full flex flex-col border-2 hover:border-amber-500/50 transition-all hover:shadow-2xl group overflow-hidden bg-card">
                      <CardHeader>
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                          <div className="flex gap-2">
                            <Badge variant="secondary" className="bg-amber-500/5 text-amber-600 border-amber-500/10">
                              <Star className="h-3 w-3 mr-1" /> Featured
                            </Badge>
                          </div>
                          <Badge className={status.color + " border"}>
                            {status.label}
                          </Badge>
                        </div>
                        <CardTitle className="text-3xl font-black mb-3 group-hover:text-amber-600 transition-colors tracking-tight">
                          {project.title}
                        </CardTitle>
                        <CardDescription className="text-base leading-relaxed line-clamp-2">
                          {project.description || 'Architecting modern solutions with cutting-edge technology.'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1">
                        {techStack.length > 0 && (
                          <div className="mb-6">
                            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                              <Layers className="h-3 w-3" /> Tech Stack
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {techStack.map((tech: any) => (
                                <Badge key={typeof tech === 'string' ? tech : tech.name} variant="outline" className="text-xs bg-muted/50">
                                  {typeof tech === 'string' ? tech : tech.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-3 mb-6">
                          {project.liveUrl && (
                            <Button variant="outline" size="sm" className="gap-2 flex-1 font-bold group-hover:bg-amber-50 transition-colors" asChild>
                              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                                Live Demo
                              </a>
                            </Button>
                          )}
                          {project.githubUrl && (
                            <Button variant="outline" size="sm" className="gap-2 flex-1 font-bold" asChild>
                              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                                <Github className="h-4 w-4" />
                                Source
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="pt-6 border-t bg-muted/5 transition-colors group-hover:bg-amber-500/5">
                        <div className="flex w-full gap-2">
                          <Link href={`/forge/${project.slug}`} className="flex-1">
                            <Button className="w-full gap-2 font-bold bg-zinc-900 hover:bg-zinc-800 text-white shadow-xl">
                              Case Study Breakdown
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </Link>
                          {isAdmin && (
                            <Link href={`/admin/projects/${project.id}/edit`}>
                              <Button variant="outline" size="icon" className="h-10 w-10 border-2 border-amber-500/20 hover:bg-amber-50 rounded-xl">
                                <Zap className="h-4 w-4 text-amber-600" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </CardFooter>
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
