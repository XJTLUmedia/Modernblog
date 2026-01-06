'use client'

import Link from 'next/link'
import { BookOpen, Sprout, Hammer, Plus, LogOut, Settings, ArrowRight, Github, Twitter, LayoutDashboard, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { useAuth } from '@/hooks/use-auth'

export default function AdminDashboard() {
  const { user, authenticated, loading: authLoading } = useAuth()
  const [statsLoading, setStatsLoading] = useState(true)
  const [stats, setStats] = useState({
    posts: 0,
    notes: 0,
    projects: 0
  })

  // Determine admin status from standardized user object
  const isAdmin = user?.isAdmin || false

  useEffect(() => {
    if (authLoading) return
    if (!authenticated || !isAdmin) {
      setStatsLoading(false)
      return
    }

    const fetchStats = async () => {
      try {
        const [postsRes, notesRes, projectsRes] = await Promise.all([
          fetch('/api/admin/posts', { credentials: 'include', cache: 'no-store' }),
          fetch('/api/admin/garden', { credentials: 'include', cache: 'no-store' }),
          fetch('/api/admin/projects', { credentials: 'include', cache: 'no-store' })
        ])

        const posts = postsRes.ok ? await postsRes.json() : []
        const notes = notesRes.ok ? await notesRes.json() : []
        const projects = projectsRes.ok ? await projectsRes.json() : []

        setStats({
          posts: Array.isArray(posts) ? posts.length : 0,
          notes: Array.isArray(notes) ? notes.length : 0,
          projects: Array.isArray(projects) ? projects.length : 0
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setStatsLoading(false)
      }
    }

    fetchStats()
  }, [authLoading, authenticated, isAdmin])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground animate-pulse font-bold tracking-widest uppercase text-xs">Phasing into System...</p>
        </div>
      </div>
    )
  }

  if (!authenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />

        <main className="flex-1 flex items-center justify-center py-12 relative overflow-hidden">
          {/* Decorative background */}
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[120px] -z-10" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="border-4 border-red-500/20 rounded-[2rem] overflow-hidden shadow-2xl bg-card/50 backdrop-blur-xl">
                <div className="h-2 w-full bg-red-500" />
                <CardHeader className="text-center pt-12">
                  <div className="mx-auto w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mb-6">
                    <ShieldCheck className="h-10 w-10 text-red-500" />
                  </div>
                  <CardTitle className="text-4xl font-black tracking-tight mb-2 uppercase">Access Denied</CardTitle>
                </CardHeader>
                <CardContent className="px-12 pb-12">
                  <p className="text-center text-xl text-muted-foreground mb-12 font-medium leading-relaxed">
                    You've reached the edge of the system. Administrator level clearance is required to proceed beyond this point.
                  </p>

                  <div className="space-y-6 mb-12">
                    <div className="text-sm font-black text-muted-foreground uppercase tracking-[0.2em]">
                      Security Identification
                    </div>
                    <div className="p-8 bg-zinc-900 text-white rounded-3xl border-2 border-zinc-800 shadow-inner relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <LayoutDashboard className="h-24 w-24" />
                      </div>
                      <div className="space-y-3 relative">
                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                          <span className="text-zinc-500 text-xs font-bold uppercase">Identity</span>
                          <span className="font-mono text-primary italic truncate max-w-[200px]">{user?.email || 'Unknown Agent'}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                          <span className="text-zinc-500 text-xs font-bold uppercase">Assigned Role</span>
                          <span className="font-mono text-zinc-300 uppercase">{user?.role || 'Guest'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-zinc-500 text-xs font-bold uppercase">Clearance Level</span>
                          <Badge variant="outline" className="text-red-400 border-red-400/30 font-black tracking-tighter uppercase text-[10px]">REJECTED</Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/auth/login" className="flex-1">
                      <Button className="w-full h-14 text-lg font-black uppercase tracking-tight shadow-xl shadow-primary/20">
                        Switch Identity
                      </Button>
                    </Link>
                    <Link href="/" className="flex-1">
                      <Button variant="outline" className="w-full h-14 text-lg font-black uppercase tracking-tight border-2">
                        Return to Surface
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 relative overflow-hidden">
        {/* Decorative bg */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] -z-10" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <h1 className="text-5xl sm:text-7xl font-black mb-6 tracking-tight">
                  Admin <span className="text-primary italic">Hub</span>.
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                  Welcome back, <span className="font-bold text-foreground underline decoration-primary/30 underline-offset-4">{user?.name || 'Commander'}</span>. The platform is awaiting your command.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-2xl border-2 border-primary/10 self-start sm:self-auto">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">System Online / Root Access</span>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              { label: 'Surface Posts', count: stats.posts, icon: BookOpen, color: 'text-primary', href: '/admin/posts', desc: 'Published articles' },
              { label: 'Lab Notes', count: stats.notes, icon: Sprout, color: 'text-emerald-500', href: '/admin/garden', desc: 'Digital seedlings' },
              { label: 'Forge Projects', count: stats.projects, icon: Hammer, color: 'text-purple-500', href: '/admin/projects', desc: 'Active experiments' }
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border-2 hover:border-primary/50 transition-all hover:shadow-2xl group overflow-hidden bg-card/50 backdrop-blur">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-2xl bg-muted group-hover:bg-primary/10 transition-colors shadow-inner`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                      <Badge variant="secondary" className="font-mono text-lg px-3 py-1 rounded-lg border-2 bg-background shadow-sm">{statsLoading ? '...' : stat.count}</Badge>
                    </div>
                    <CardTitle className="text-2xl font-black mt-6 uppercase tracking-tight">{stat.label}</CardTitle>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest opacity-60">{stat.desc}</p>
                  </CardHeader>
                  <CardContent className="mt-8 pt-4 border-t-2 border-dashed">
                    <Link href={stat.href}>
                      <Button variant="ghost" size="sm" className="w-full h-12 gap-3 font-black uppercase tracking-tighter group-hover:bg-primary group-hover:text-primary-foreground transition-all rounded-xl">
                        <Settings className="h-4 w-4" />
                        Management Deck
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-3"
            >
              <Card className="h-full border-4 border-primary/10 rounded-[2.5rem] shadow-2xl bg-card/50 backdrop-blur-xl overflow-hidden">
                <div className="h-2 w-full bg-gradient-to-r from-primary via-purple-500 to-primary/20" />
                <CardHeader className="pt-10 px-10">
                  <CardTitle className="text-3xl font-black tracking-tight uppercase flex items-center gap-3">
                    <Plus className="h-8 w-8 text-primary" />
                    Creation Engine
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-10 pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link href="/admin/posts/new">
                      <Button className="w-full h-20 gap-4 font-black uppercase tracking-tight text-lg shadow-xl shadow-primary/20 rounded-2xl transition-all hover:translate-y-[-2px] active:translate-y-[0px]">
                        <BookOpen className="h-6 w-6" />
                        Initiate Post
                      </Button>
                    </Link>
                    <Link href="/admin/garden/new">
                      <Button variant="outline" className="w-full h-20 gap-4 font-black uppercase tracking-tight text-lg border-4 hover:bg-emerald-50 text-emerald-600 border-emerald-500/10 rounded-2xl transition-all hover:translate-y-[-2px]">
                        <Sprout className="h-6 w-6" />
                        Nurture Idea
                      </Button>
                    </Link>
                    <Link href="/admin/projects/new">
                      <Button variant="outline" className="w-full h-20 gap-4 font-black uppercase tracking-tight text-lg border-4 hover:bg-purple-50 text-purple-600 border-purple-500/10 rounded-2xl transition-all hover:translate-y-[-2px]">
                        <Hammer className="h-6 w-6" />
                        Ignite Forge
                      </Button>
                    </Link>
                    <Link href="/admin/hub">
                      <Button variant="outline" className="w-full h-20 gap-4 font-black uppercase tracking-tight text-lg border-4 hover:bg-orange-50 text-orange-600 border-orange-500/10 rounded-2xl transition-all hover:translate-y-[-2px]">
                        <LayoutDashboard className="h-6 w-6" />
                        Hub Control
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-2"
            >
              <Card className="h-full border-4 border-zinc-800 rounded-[2.5rem] shadow-2xl bg-zinc-950 text-white overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] group-hover:bg-primary/20 transition-colors" />
                <CardHeader className="pt-10 px-10">
                  <CardTitle className="text-3xl font-black tracking-tight uppercase">Core Status</CardTitle>
                </CardHeader>
                <CardContent className="p-10 pt-0 space-y-6">
                  <div className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border-2 border-white/5 hover:border-white/10 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse" />
                      <span className="font-black uppercase tracking-widest text-sm">Services</span>
                    </div>
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-black uppercase text-[10px]">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border-2 border-white/5 hover:border-white/10 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse" />
                      <span className="font-black uppercase tracking-widest text-sm">Mainframe</span>
                    </div>
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-black uppercase text-[10px]">Synced</Badge>
                  </div>
                  <Link href="/admin/settings" className="block pt-4">
                    <Button variant="ghost" className="w-full h-16 text-white hover:bg-white/10 gap-3 border-2 border-white/10 rounded-2xl font-black uppercase">
                      <Settings className="h-5 w-5" />
                      Platform Settings
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>


      <Footer />
    </div>
  )
}
