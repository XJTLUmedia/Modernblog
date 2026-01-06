'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { BookOpen, Calendar, Clock, ArrowLeft, Share2, Heart, MessageCircle, ArrowRight, Sparkles, Zap, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { motion } from 'framer-motion'
import { LikeButton } from '@/components/LikeButton'
import { BookmarkButton } from '@/components/BookmarkButton'
import { ShareButton } from '@/components/ShareButton'
import { CommentSection } from '@/components/CommentSection'

export default function BlogPostPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return

    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts?slug=${encodeURIComponent(slug)}`)
        const data = await response.json()

        if (response.ok && !data.error) {
          setPost(data)
        } else {
          setError(data.error || 'Post not found')
        }
      } catch (error) {
        console.error('Error fetching post:', error)
        setError('Failed to load post')
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
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

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
              <h1 className="text-4xl font-black mb-4 tracking-tight">Article Not Found</h1>
              <p className="text-muted-foreground mb-8 text-lg">{error || 'The publication you are looking for has been moved or archived.'}</p>
              <Link href="/blog">
                <Button size="lg" className="font-bold">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Publications
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 relative overflow-hidden">
        {/* Premium Decorative Background */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] -z-10 animate-pulse" />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] -z-10" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-12"
            >
              <Link href="/blog">
                <Button variant="ghost" className="gap-2 font-bold hover:text-primary group">
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                  Back to Surface
                </Button>
              </Link>
            </motion.div>

            {/* Smart Summary */}
            {post.summary && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-16"
              >
                <Card className="border-2 border-primary/20 bg-primary/5 shadow-xl shadow-primary/5 overflow-hidden group">
                  <div className="h-1.5 w-full bg-primary/20 group-hover:bg-primary transition-colors" />
                  <CardHeader className="pb-4">
                    <CardTitle className="text-sm font-black flex items-center gap-2 text-primary uppercase tracking-[0.2em]">
                      <Sparkles className="h-4 w-4" />
                      Executive Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-line text-base leading-relaxed text-foreground/80 font-medium italic">
                      {post.summary}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Post Header */}
            <div className="mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-8">
                    {post.tags.map((tagRelation: any) => (
                      <Badge key={tagRelation.tag?.slug || tagRelation.tag?.id} variant="secondary" className="bg-primary/5 text-primary border-primary/10 font-bold px-3 py-1">
                        {tagRelation.tag?.name}
                      </Badge>
                    ))}
                  </div>
                )}

                <h1 className="text-5xl sm:text-7xl font-black mb-10 tracking-tight leading-[1.1] text-balance">
                  {post.title}
                </h1>

                <div className="flex flex-wrap items-center gap-8 text-sm font-bold text-muted-foreground bg-muted/20 w-fit px-6 py-3 rounded-2xl border border-muted/50">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  {post.readingTime && (
                    <div className="flex items-center gap-2 border-l pl-8 border-muted-foreground/20">
                      <Clock className="h-4 w-4 text-primary" />
                      {post.readingTime} min read
                    </div>
                  )}
                  <div className="flex items-center gap-2 border-l pl-8 border-muted-foreground/20">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    {post.viewCount || 0} views
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Main Content */}
            <motion.article
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="prose prose-xl prose-stone dark:prose-invert max-w-none 
                prose-headings:font-black prose-headings:tracking-tight 
                prose-p:leading-[1.8] prose-p:text-foreground/80
                prose-blockquote:border-primary prose-blockquote:bg-primary/5 
                prose-blockquote:rounded-2xl prose-blockquote:p-8 prose-blockquote:not-italic
                prose-strong:text-foreground prose-a:text-primary prose-a:font-black prose-a:no-underline hover:prose-a:underline
                mb-20"
            >
              {post.content ? (
                <div className="whitespace-pre-wrap">
                  {post.content}
                </div>
              ) : (
                <div className="text-center py-20 bg-muted/10 rounded-3xl border-2 border-dashed border-muted">
                  <p className="text-muted-foreground italic font-black">Manuscript in progress...</p>
                </div>
              )}
            </motion.article>

            <Separator className="my-16" />

            {/* Interaction & Social */}
            <div className="flex flex-wrap items-center justify-between gap-8 mb-20 bg-muted/5 p-8 rounded-3xl border-2 border-muted/50">
              <div className="flex items-center gap-4">
                <LikeButton postId={post.id} initialLikes={post.likeCount || 0} initialLiked={false} className="h-14 px-8 rounded-2xl border-2" />

                <Button
                  variant="outline"
                  className="h-14 px-8 gap-3 font-black rounded-2xl border-2 hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all group"
                  onClick={() => document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <MessageCircle className="h-5 w-5 group-hover:fill-current" />
                  {post.comments?.length || 0} Comments
                </Button>

                <BookmarkButton type="post" id={post.id} className="h-14 w-14 rounded-2xl border-2" />
              </div>
              <ShareButton
                title={post.title}
                text={post.summary || post.excerpt || "Check out this article!"}
                className="h-14 px-10 gap-3 font-black rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all"
              >
                Share Analysis
              </ShareButton>
            </div>

            {/* Related Discovery */}
            {post.relatedPosts && post.relatedPosts.length > 0 && (
              <section className="space-y-10 mb-20">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-4 rounded-3xl shadow-lg shadow-primary/10">
                    <Zap className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black tracking-tight">Semantic Connections</h2>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">AI-powered discovery</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {post.relatedPosts.map((relation: any, i: number) => {
                    const related = relation.post || relation.relatedTo
                    if (!related) return null

                    return (
                      <Link key={i} href={`/blog/${related.slug}`}>
                        <Card className="group hover:shadow-2xl transition-all cursor-pointer border-2 overflow-hidden border-primary/20 bg-primary/5">
                          <div className="h-1.5 w-full bg-current opacity-20 group-hover:opacity-100 transition-opacity" />
                          <CardHeader>
                            <div className="flex justify-between items-start mb-4">
                              <Badge variant="outline" className="bg-background/50 font-black tracking-tighter">Blog</Badge>
                              <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">RELATED</span>
                            </div>
                            <CardTitle className="text-xl font-black group-hover:text-primary transition-colors leading-tight">{related.title}</CardTitle>
                          </CardHeader>
                          <CardFooter>
                            <Button variant="ghost" size="sm" className="p-0 h-auto gap-2 text-primary font-black group-hover:translate-x-1 transition-transform">
                              Explore Connection <ArrowRight className="h-4 w-4" />
                            </Button>
                          </CardFooter>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
              </section>
            )}

            <Separator className="my-16" />

            <CommentSection postId={post.id} />
          </div>
        </div>
      </main>

      <Footer />
    </div >
  )
}
