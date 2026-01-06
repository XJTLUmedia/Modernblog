'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Clock, Github, Music, BookOpen, Code2, Heart, ArrowLeft, Globe, MapPin, Coffee, Hammer, LayoutDashboard, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

export default function NowPage() {
  const [loading, setLoading] = useState(true)
  const [nowData, setNowData] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/hub')
        if (res.ok) {
          const data = await res.json()
          setNowData(data)
        }
      } catch (error) {
        console.error('Error fetching now data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground animate-pulse">Loading the present moment...</p>
          </div>
        </div>
      </div>
    )
  }

  const learning = nowData?.learning || []
  const readingList = nowData?.readingList || []
  const listeningTo = nowData?.listeningTo || []
  const githubRepos = nowData?.githubRepos || []

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl -z-10 animate-pulse delay-700" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12 text-center"
            >
              <div className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-primary/10 text-primary">
                <Clock className="h-10 w-10" />
              </div>
              <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-4">
                What I'm doing <span className="text-primary italic">now</span>.
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                A high-level view of my current focus, inspirations, and projects.
                Inspired by the <a href="https://nownownow.com/about" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium underline-offset-4 decoration-primary/30">/now</a> movement.
              </p>
              {nowData?.updatedAt && (
                <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/50 w-fit mx-auto px-4 py-1.5 rounded-full border border-border/50">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Last updated: {new Date(nowData.updatedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              )}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Main Content Column */}
              <div className="lg:col-span-8 space-y-8">
                {/* Custom Content Section */}
                {nowData?.content && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Card className="border-2 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Heart className="h-5 w-5 text-red-500" />
                          The Big Picture
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="prose dark:prose-invert max-w-none">
                        <p className="text-lg leading-relaxed text-muted-foreground">
                          {nowData.content}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Building / Projects Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="border-2 shadow-sm overflow-hidden">
                    <CardHeader className="bg-muted/30">
                      <CardTitle className="flex items-center gap-2">
                        <Code2 className="h-5 w-5 text-primary" />
                        Currently Building
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 gap-6">
                        {githubRepos.length > 0 ? (
                          githubRepos.map((repo: any, index: number) => (
                            <div key={index} className="group p-4 rounded-xl border hover:border-primary/50 transition-all hover:shadow-md bg-card/50">
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{repo.name}</h3>
                                <Badge variant="secondary" className="bg-primary/5 text-primary">Active</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{repo.description}</p>
                              <div className="flex items-center gap-4">
                                <a href={repo.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
                                  <Github className="h-4 w-4" />
                                  GitHub
                                </a>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <div className="h-2 w-2 rounded-full bg-primary" />
                                  TypeScript
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-muted-foreground italic">
                            No active projects listed at the moment.
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Sidebar Column */}
              <div className="lg:col-span-4 space-y-8">
                {/* Learning Progress */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="border-2 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Coffee className="h-5 w-5 text-orange-500" />
                        Learning
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {learning.map((item: any, index: number) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{item.topic}</span>
                            <span className="text-muted-foreground">{item.progress}%</span>
                          </div>
                          <Progress value={item.progress} className="h-2" />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Reading List */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="border-2 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-blue-500" />
                        Reading
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {readingList.map((book: any, index: number) => (
                        <div key={index} className="p-3 rounded-lg border bg-muted/20">
                          <div className="font-semibold text-sm">{book.title}</div>
                          <div className="text-xs text-muted-foreground">{book.author}</div>
                          <Badge variant="outline" className="mt-2 text-[10px] h-4 uppercase tracking-wider">
                            {book.status}
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Listening To */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Card className="border-2 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Music className="h-5 w-5 text-purple-500" />
                        Listening
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {listeningTo.map((item: any, index: number) => (
                        <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="p-2 rounded bg-primary/10 text-primary">
                            <Music className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{item.title}</div>
                            <div className="text-[10px] text-muted-foreground uppercase">{item.type}</div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>

            {/* Bottom Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-16 text-center"
            >
              <div className="p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-background to-purple-500/10 border-2 border-dashed border-primary/20">
                <h2 className="text-2xl font-bold mb-4">Want to collaborate?</h2>
                <p className="text-muted-foreground mb-6">
                  Check out my projects in the Forge or reach out if you're interested in building something together.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Link href="/forge">
                    <Button className="gap-2">
                      <Hammer className="h-4 w-4" />
                      View Forge
                    </Button>
                  </Link>
                  <Link href="/hub">
                    <Button variant="outline" className="gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Command Center
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
