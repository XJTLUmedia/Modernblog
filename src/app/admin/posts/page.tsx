'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BookOpen, Plus, Edit, Trash2, ArrowRight, Search, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

import { motion } from 'framer-motion'

import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

export default function AdminPosts() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/admin/posts', {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          console.log('Fetched posts:', data)
          setPosts(Array.isArray(data) ? data : [])
        } else {
          console.error('Failed to fetch posts:', response.status)
        }
      } catch (error) {
        console.error('Error fetching posts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/posts`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })

      if (response.ok) {
        alert('Post deleted successfully!')
        const updatedPosts = posts.filter(p => p.id !== id)
        setPosts(updatedPosts)
      } else {
        alert('Failed to delete post')
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Error deleting post')
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 relative overflow-hidden">
        {/* Decorative bg */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12"
          >
            <div>
              <h1 className="text-5xl sm:text-7xl font-black mb-4 tracking-tight">
                Blog <span className="text-primary italic">Posts</span>.
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Management portal for your long-form articles.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 border-2 rounded-xl focus-visible:ring-primary/20"
                />
              </div>
              <Link href="/admin/posts/new" className="w-full sm:w-auto">
                <Button className="w-full gap-2 h-12 px-6 font-bold shadow-lg shadow-primary/20">
                  <Plus className="h-5 w-5" />
                  New Article
                </Button>
              </Link>
            </div>
          </motion.div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="animate-spin h-10 w-10 border-b-2 border-primary rounded-full"></div>
              <p className="text-muted-foreground font-medium">Fetching articles...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredPosts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all hover:shadow-xl group">
                    <CardHeader className="pb-4">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant={post.published ? 'default' : 'secondary'} className={post.published ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>
                              {post.published ? 'Published' : 'Draft'}
                            </Badge>
                            {post.featured && (
                              <Badge variant="outline" className="text-orange-500 border-orange-500/20 bg-orange-500/5">
                                Featured
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors">
                            {post.title}
                          </CardTitle>
                          <CardDescription className="text-base line-clamp-2 mt-2">
                            {post.excerpt || 'No excerpt provided'}
                          </CardDescription>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-muted rounded-lg text-sm font-mono flex items-center gap-2">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            {post.viewCount || 0}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 border-t bg-muted/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-6 text-sm text-muted-foreground font-medium">
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="h-4 w-4" />
                          {post.readingTime || 0} min read
                        </div>
                        <div>
                          {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Link href={`/blog/${post.slug}`} className="flex-1 sm:flex-none">
                          <Button variant="outline" size="sm" className="w-full gap-2 border-2">
                            <Eye className="h-4 w-4" />
                            Preview
                          </Button>
                        </Link>
                        <Link href={`/admin/posts/${post.id}/edit`} className="flex-1 sm:flex-none">
                          <Button variant="secondary" size="sm" className="w-full gap-2">
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive gap-2"
                          onClick={() => handleDelete(post.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {!loading && filteredPosts.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-primary/20"
            >
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-2xl font-bold mb-2">No articles found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery ? 'Try adjusting your search terms' : 'Begin your journey by writing your first article.'}
              </p>
              <Link href="/admin/posts/new">
                <Button className="h-12 px-8 font-bold shadow-lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Post
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

