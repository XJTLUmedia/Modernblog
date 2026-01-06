'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Hammer, ArrowLeft, ExternalLink, Github, Calendar, Eye, Code2, Layers, Target, Rocket, Sparkles, Box } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { motion } from 'framer-motion'
import { Progress } from '@/components/ui/progress'

const statusConfig = {
  idea: { label: 'Conceptual', color: 'bg-slate-500/10 text-slate-600 border-slate-500/20', icon: '💡' },
  'in-progress': { label: 'Active Development', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: '⚡' },
  completed: { label: 'Deployed', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: '🚀' },
  archived: { label: 'Legacy', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20', icon: '📁' }
}

export default function ProjectPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return

    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${encodeURIComponent(slug)}`)
        const data = await response.json()

        if (response.ok && !data.error) {
          setProject(data)
        } else {
          setError(data.error || 'Project not found')
        }
      } catch (error) {
        console.error('Error fetching project:', error)
        setError('Failed to load project')
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [slug])

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

  if (error || !project) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto text-center">
              <Box className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
              <h1 className="text-4xl font-black mb-4 tracking-tight text-balance">Project Decommissioned</h1>
              <p className="text-muted-foreground mb-8 text-lg">{error || 'This project footprint could not be located in the forge.'}</p>
              <Link href="/forge">
                <Button size="lg" className="font-bold">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Return to Forge
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const status = statusConfig[project.status as keyof typeof statusConfig] || statusConfig.idea
  const techStack = project.techStack ? (typeof project.techStack === 'string' ? JSON.parse(project.techStack) : project.techStack) : []

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[150px] -z-10" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            {/* Action Bar */}
            <div className="flex items-center justify-between mb-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Link href="/forge">
                  <Button variant="ghost" className="gap-2 font-bold hover:text-primary group">
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Forge Overview
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                {project.githubUrl && (
                  <Button variant="outline" size="sm" className="gap-2 font-bold border-2 rounded-xl" asChild>
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4" />
                      Source
                    </a>
                  </Button>
                )}
                {project.liveUrl && (
                  <Button size="sm" className="gap-2 font-black rounded-xl shadow-lg shadow-primary/20" asChild>
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                      <Rocket className="h-4 w-4" />
                      Live Demo
                    </a>
                  </Button>
                )}
              </motion.div>
            </div>

            {/* Project Hero Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <Badge className={`${status.color} border-2 font-bold px-4 py-1.5 rounded-full`}>
                      <span className="mr-2">{status.icon}</span>
                      {status.label}
                    </Badge>
                    {project.priority === 'high' && (
                      <Badge className="bg-red-500/10 text-red-600 border-red-500/20 font-black px-4 py-1.5 rounded-full">
                        CRITICAL PATH
                      </Badge>
                    )}
                  </div>

                  <h1 className="text-5xl sm:text-7xl font-black mb-8 tracking-tighter leading-tight">
                    {project.title}
                  </h1>

                  <div className="bg-muted/30 p-8 rounded-[2rem] border-2 border-muted/50 mb-8">
                    <p className="text-xl text-foreground/80 leading-relaxed font-medium mb-8">
                      {project.description || 'System schematic pending architectural review.'}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
                      <div className="space-y-1">
                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Initiated</div>
                        <div className="font-bold flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          {new Date(project.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Usage Metrics</div>
                        <div className="font-bold flex items-center gap-2">
                          <Eye className="h-4 w-4 text-emerald-500" />
                          {project.viewCount || 0} Pulses
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Status Code</div>
                        <div className="font-bold text-primary">v1.2.0-beta</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="border-2 border-primary/20 bg-primary/5 rounded-[2rem] overflow-hidden">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-sm font-black flex items-center gap-2 text-primary uppercase tracking-[0.2em]">
                        <Layers className="h-4 w-4" />
                        Infrastructure
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {techStack.map((tech: any, i: number) => (
                          <Badge key={i} variant="secondary" className="bg-background border-2 border-primary/10 font-bold px-3 py-1">
                            {typeof tech === 'string' ? tech : tech.name}
                          </Badge>
                        ))}
                      </div>

                      <Separator className="bg-primary/10" />

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-black uppercase tracking-widest text-primary/60">
                          <span>Build Progress</span>
                          <span>{project.progress || 0}%</span>
                        </div>
                        <Progress value={project.progress || 0} className="h-3 bg-primary/10" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="border-2 border-muted/50 rounded-[2rem] bg-muted/20">
                    <CardHeader>
                      <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-[0.2em]">
                        <Target className="h-4 w-4" />
                        Project Lead
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white font-black shadow-lg shadow-primary/20">
                          {project.author?.name?.[0] || 'A'}
                        </div>
                        <div>
                          <div className="font-black">{project.author?.name || 'Lead Architect'}</div>
                          <div className="text-xs text-muted-foreground font-bold">System Principal</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>

            {/* Smart Summary Section */}
            {project.summary && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-16"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-primary/10 p-4 rounded-2xl">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-black tracking-tight">AI Generated Tech Overview</h2>
                </div>
                <div className="bg-primary/5 border-2 border-primary/10 p-8 rounded-[2rem] italic text-primary/80 font-medium leading-[1.8]">
                  {project.summary}
                </div>
              </motion.div>
            )}

            <Separator className="my-16" />

            {/* Detailed Content */}
            <motion.article
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="prose prose-xl dark:prose-invert max-w-none 
                prose-headings:font-black prose-headings:tracking-tighter 
                prose-p:leading-[1.8] prose-p:text-foreground/70
                prose-blockquote:border-primary prose-blockquote:bg-primary/5 
                prose-blockquote:rounded-2xl prose-blockquote:py-8 prose-blockquote:px-12
                prose-strong:text-foreground prose-a:text-primary prose-a:font-black
                mb-24"
            >
              <h2 className="flex items-center gap-4">
                <Code2 className="h-8 w-8 text-primary" />
                Technical Implementation
              </h2>
              {project.description ? (
                <div className="whitespace-pre-wrap">
                  {project.description}
                </div>
              ) : (
                <p className="italic text-muted-foreground font-black">Architecture diagrams and implementation details are currently under classification.</p>
              )}
            </motion.article>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
