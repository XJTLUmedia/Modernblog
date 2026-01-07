'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { LayoutDashboard, BookOpen, Sprout, Hammer, TrendingUp, Clock, CheckCircle, Target, Flame, Sparkles, Zap, Activity, ArrowRight, Brain, Shield, Settings } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { motion, AnimatePresence } from 'framer-motion'
import { NeuralOptimizationManual } from '@/components/NeuralOptimizationManual'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

const statusConfig = {
  reading: { label: 'Active Exploration', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: '📖' },
  queued: { label: 'In Queue', color: 'bg-zinc-500/10 text-zinc-600 border-zinc-500/20', icon: '⏳' },
  finished: { label: 'Mastered', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: '✅' }
}

const defaultStatus = { label: 'Processing', color: 'bg-zinc-500/10 text-zinc-600 border-zinc-500/20', icon: '⚙️' }

const iconMap = {
  Target,
  BookOpen,
  Sprout,
  Hammer,
  TrendingUp,
  Clock,
  CheckCircle,
  Flame,
  LayoutDashboard
}

export default function HubPage() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalGardenNotes: 0,
    totalProjects: 0,
    totalViews: 0
  })
  const [loading, setLoading] = useState(true)
  const [hubData, setHubData] = useState<any>(null)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [activeProjects, setActiveProjects] = useState<any[]>([])
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
    const fetchData = async () => {
      try {
        const [postsRes, notesRes, projectsRes, hubRes] = await Promise.all([
          fetch('/api/posts?published=true'),
          fetch('/api/garden'),
          fetch('/api/projects'),
          fetch('/api/hub')
        ])

        const posts = postsRes.ok ? await postsRes.json() : []
        const notes = notesRes.ok ? await notesRes.json() : []
        const projects = projectsRes.ok ? await projectsRes.json() : []
        const hub = hubRes.ok ? await hubRes.json() : null

        const totalViews = [
          ...(Array.isArray(posts) ? posts : []),
          ...(Array.isArray(notes) ? notes : []),
          ...(Array.isArray(projects) ? projects : [])
        ].reduce((sum, item) => sum + (item.viewCount || 0), 0)

        setStats({
          totalPosts: Array.isArray(posts) ? posts.length : 0,
          totalGardenNotes: Array.isArray(notes) ? notes.length : 0,
          totalProjects: Array.isArray(projects) ? projects.length : 0,
          totalViews
        })

        setHubData(hub)
        setActiveProjects(Array.isArray(projects) ? projects.filter((p: any) => p.status === 'in-progress') : [])

        const combined = [
          ...(Array.isArray(posts) ? posts.map((p: any) => ({ ...p, type: 'post', icon: BookOpen })) : []),
          ...(Array.isArray(notes) ? notes.map((n: any) => ({ ...n, type: 'garden', icon: Sprout })) : []),
          ...(Array.isArray(projects) ? projects.map((pr: any) => ({ ...pr, type: 'project', icon: Hammer })) : [])
        ].sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())

        setRecentActivity(combined.slice(0, 5).map(item => ({
          id: item.id,
          slug: item.slug,
          type: item.type,
          title: item.title,
          date: new Date(item.updatedAt || item.createdAt).toLocaleDateString(),
          icon: item.icon
        })))

      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
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

  const currentLearning = hubData?.learning || []
  const readingList = hubData?.readingList || []
  const currentProjects = activeProjects.map(p => ({
    name: p.title,
    progress: p.progress || 0,
    priority: p.priority || 'medium'
  }))

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] -z-10" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] -z-10" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-primary/10 p-2 rounded-xl">
                    <LayoutDashboard className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-sm font-black uppercase tracking-[0.3em] text-primary">Mission Control</span>
                </div>
                <h1 className="text-5xl sm:text-7xl font-black mb-6 tracking-tight leading-tight">
                  The <span className="text-primary italic">Hub</span>.
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed font-medium">
                  Real-time telemetry from the laboratory. Tracking research, active builds, and intellectual consumption.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Neural Optimization Protocol */}
          <NeuralOptimizationManual />

          {/* Core Metrics Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
          >
            {[
              { label: 'Publications', value: stats.totalPosts, icon: BookOpen, color: 'text-blue-500' },
              { label: 'Garden Nodes', value: stats.totalGardenNotes, icon: Sprout, color: 'text-emerald-500' },
              { label: 'Active Builds', value: stats.totalProjects, icon: Hammer, color: 'text-amber-500' },
              { label: 'System Pulses', value: `${(stats.totalViews / 1000).toFixed(1)}K`, icon: Activity, color: 'text-rose-500' }
            ].map((stat, i) => (
              <Card key={i} className="border-2 hover:border-primary/50 transition-all bg-card/50 backdrop-blur-sm group overflow-hidden">
                <div className={`h-1 w-full bg-muted group-hover:bg-primary transition-colors`} />
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 rounded-lg bg-muted/50 ${stat.color}`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-black mb-1 tabular-nums">{stat.value}</div>
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Learning Matrix */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-2 rounded-[2rem] overflow-hidden bg-card/50 backdrop-blur-sm">
                  <CardHeader className="bg-primary/5 border-b-2 border-primary/10">
                    <CardTitle className="text-sm font-black flex items-center justify-between uppercase tracking-[0.2em] text-primary w-full">
                      <div className="flex items-center gap-3">
                        <Target className="h-5 w-5" />
                        Research Matrix
                      </div>
                      {isAdmin && (
                        <Link href="/admin/hub">
                          <Button variant="ghost" size="sm" className="h-8 gap-2 font-black text-[10px] border-2 border-primary/20 hover:bg-primary/5">
                            <Zap className="h-3 w-3" /> Edit Matrix
                          </Button>
                        </Link>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    {currentLearning.map((item: any, index: number) => {
                      const ItemIcon = (typeof item.icon === 'string' ? iconMap[item.icon as keyof typeof iconMap] : item.icon) || Target
                      return (
                        <div key={index} className="space-y-3 group">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-xl bg-muted/50 group-hover:bg-primary/10 transition-colors">
                                <ItemIcon className={`h-5 w-5 ${item.color}`} />
                              </div>
                              <span className="font-black text-lg">{item.topic}</span>
                            </div>
                            <Badge variant="outline" className="font-black border-2">{item.progress}%</Badge>
                          </div>
                          <Progress value={item.progress} className="h-3 bg-muted group-hover:bg-primary/5 transition-colors" />
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Active Projects Layer */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-2 rounded-[2rem] overflow-hidden bg-card/50 backdrop-blur-sm">
                  <CardHeader className="bg-amber-500/5 border-b-2 border-amber-500/10">
                    <CardTitle className="text-sm font-black flex items-center gap-3 uppercase tracking-[0.2em] text-amber-600">
                      <Hammer className="h-5 w-5" />
                      Active Build Pipeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    {currentProjects.map((project, index) => (
                      <div key={index} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-lg">{project.name}</span>
                          <Badge
                            className={`font-black tracking-tighter ${project.priority === 'high' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' :
                              project.priority === 'medium' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                                'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                              }`}
                            variant="outline"
                          >
                            {project.priority.toUpperCase()} PRIORITY
                          </Badge>
                        </div>
                        <Progress value={project.progress} className="h-3 bg-muted" />
                      </div>
                    ))}
                    <Link href="/forge" className="block pt-4">
                      <Button className="w-full h-14 font-black text-lg rounded-2xl bg-zinc-900 hover:bg-zinc-800 shadow-xl active:scale-95 transition-all">
                        Access Forge <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <div className="space-y-8">
              {/* Telemetry Log */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="border-2 rounded-[2rem] overflow-hidden bg-card/50 backdrop-blur-sm">
                  <CardHeader className="bg-rose-500/5 border-b-2 border-rose-500/10">
                    <CardTitle className="text-sm font-black flex items-center gap-3 uppercase tracking-[0.2em] text-rose-600">
                      <Activity className="h-5 w-5" />
                      System Telemetry
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {recentActivity.map((activity, index) => {
                        const ActivityIcon = activity.icon
                        return (
                          <div key={index} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-muted/50 transition-colors cursor-pointer group">
                            <div className="p-3 rounded-xl bg-muted/50 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                              <ActivityIcon className="h-5 w-5" />
                            </div>
                            <Link href={`/${activity.type === 'garden' ? 'garden' : activity.type === 'project' ? 'forge' : 'blog'}/${activity.slug}`} className="flex-1 min-w-0">
                              <div className="text-sm font-black truncate">{activity.title}</div>
                              <div className="text-[10px] font-bold text-muted-foreground uppercase">{activity.date}</div>
                            </Link>
                            {isAdmin && (
                              <Link href={`/admin/${activity.type === 'garden' ? 'garden' : activity.type === 'project' ? 'projects' : 'posts'}/${activity.id}/edit`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors">
                                  <Zap className="h-4 w-4" />
                                </Button>
                              </Link>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Intellectual Queue */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="border-2 rounded-[2rem] overflow-hidden bg-card/50 backdrop-blur-sm">
                  <CardHeader className="bg-emerald-500/5 border-b-2 border-emerald-500/10">
                    <CardTitle className="text-sm font-black flex items-center justify-between uppercase tracking-[0.2em] text-emerald-600 w-full">
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5" />
                        Consumption Queue
                      </div>
                      {isAdmin && (
                        <Link href="/admin/hub">
                          <Button variant="ghost" size="sm" className="h-8 gap-2 font-black text-[10px] border-2 border-emerald-500/20 hover:bg-emerald-50">
                            <Zap className="h-3 w-3 text-emerald-600" /> Edit Queue
                          </Button>
                        </Link>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {readingList.map((book: any, index: number) => {
                        const status = statusConfig[book.status as keyof typeof statusConfig] || defaultStatus
                        return (
                          <div key={index} className="p-4 rounded-2xl border-2 border-muted/50 bg-muted/20 hover:border-emerald-500/30 transition-all group">
                            <div className="flex justify-between items-start mb-3">
                              <Badge className={`${status.color} border-2 font-black tabular-nums scale-90 origin-left`}>
                                {status.icon} {status.label}
                              </Badge>
                            </div>
                            <div className="text-sm font-black mb-1 group-hover:text-emerald-600 transition-colors">{book.title}</div>
                            <div className="text-xs font-bold text-muted-foreground italic">by {book.author}</div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>

          {/* Rapid Access Port */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12"
          >
            <Card className="border-2 rounded-[2rem] p-8 bg-zinc-900 text-white shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px] -z-10" />
              <div className="flex flex-wrap items-center justify-between gap-8">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black tracking-tight">Rapid Access Portals</h3>
                  <p className="text-zinc-400 font-medium">Bypass the interface and jump to specific sectors.</p>
                </div>
                <div className="flex flex-wrap gap-4">
                  {[
                    { label: 'Surface', href: '/blog', icon: BookOpen },
                    { label: 'Lab', href: '/garden', icon: Sprout },
                    { label: 'Forge', href: '/forge', icon: Hammer },
                    { label: 'Now', href: '/now', icon: Clock }
                  ].map((portal, i) => (
                    <Link key={i} href={portal.href}>
                      <Button variant="outline" className="h-12 px-6 gap-2 bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:border-primary border-2 font-bold transition-all active:scale-95">
                        <portal.icon className="h-4 w-4" />
                        {portal.label}
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
