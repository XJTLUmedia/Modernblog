'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BookOpen, Calendar, Clock, ArrowRight, Zap, Plus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/Navbar'
import { motion } from 'framer-motion'

import { Footer } from '@/components/Footer'

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([])
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
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts?published=true')
        if (response.ok) {
          const data = await response.json()
          setPosts(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error('Error fetching posts:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
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
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />

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
                  The <span className="text-primary italic">Surface</span>.
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                  Polished, long-form thoughts and opinions on technology, development, and innovation.
                </p>
              </div>
              {isAdmin && (
                <Link href="/admin/posts/new">
                  <Button className="h-16 px-8 gap-3 font-black rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                    <Plus className="h-5 w-5" />
                    Archive New Manuscript
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>

          {/* Posts Grid */}
          {posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed"
            >
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-2xl font-bold mb-2">No posts yet</h3>
              <p className="text-muted-foreground">Check back soon for new content!</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="h-full flex flex-col border-2 hover:border-primary/50 transition-all hover:shadow-xl hover:-translate-y-1 group">
                    <CardHeader>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {post.tags.map((tagRelation: any) => (
                            <Badge key={tagRelation.tag?.slug || tagRelation.tag?.id} variant="secondary" className="bg-primary/5 text-primary border-primary/10">
                              {tagRelation.tag?.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <CardTitle className="text-2xl font-bold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-3 text-base">
                        {post.excerpt || 'No excerpt available'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto pt-6 border-t bg-muted/5 transition-colors group-hover:bg-primary/5 text-sm">
                      <div className="flex items-center justify-between gap-4 text-muted-foreground mb-6">
                        {post.publishedAt && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {new Date(post.publishedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                        )}
                        {post.readingTime && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {post.readingTime} min
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/blog/${post.slug}`} className="flex-1">
                          <Button className="w-full gap-2 font-bold shadow-lg shadow-primary/20 group-hover:scale-[1.02] transition-transform">
                            Read Full Article
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                        {isAdmin && (
                          <Link href={`/admin/posts/${post.id}/edit`}>
                            <Button variant="outline" size="icon" className="h-10 w-10 border-2 border-primary/20 hover:bg-primary/5 rounded-xl">
                              <Zap className="h-4 w-4 text-primary" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
