'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { BookOpen, Calendar, Clock, ArrowLeft, Share2, Heart, MessageCircle, ArrowRight, Sparkles, Zap, TrendingUp, Brain, Loader2, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { motion, AnimatePresence } from 'framer-motion'
import { LikeButton } from '@/components/LikeButton'
import { BookmarkButton } from '@/components/BookmarkButton'
import { ShareButton } from '@/components/ShareButton'
import { CommentSection } from '@/components/CommentSection'
import ReactMarkdown from 'react-markdown'
import { safeJsonParse } from '@/lib/utils'

export default function BlogPostPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [post, setPost] = useState<any>(null)

  useEffect(() => {
    const checkBirthday = async () => {
      try {
        const res = await fetch('/api/admin/settings')
        if (res.ok) {
          const settings = await res.json()
          if (settings.birthday) {
            const bday = new Date(settings.birthday)
            const today = new Date()
            if (bday.getMonth() === today.getMonth() && bday.getDate() === today.getDate()) {
              setIsBirthday(true)
            }
          }
        }
      } catch (error) {
        console.error('Error checking birthday:', error)
      }
    }
    checkBirthday()
  }, [])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isBirthday, setIsBirthday] = useState(false)
  const [showRecall, setShowRecall] = useState(false)
  const [dynamicQuestions, setDynamicQuestions] = useState<string[]>([])
  const [isFetchingQuestions, setIsFetchingQuestions] = useState(false)

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

  useEffect(() => {
    if (post && !post.recallQuestions && !isFetchingQuestions) {
      const fetchQuestions = async () => {
        setIsFetchingQuestions(true)
        try {
          const res = await fetch('/api/ai/recall-questions', {
            method: 'POST',
            body: JSON.stringify({ title: post.title, content: post.content })
          })
          const data = await res.json()
          if (data.questions) setDynamicQuestions(data.questions)
        } catch (e) {
          console.error('Failed to fetch dynamic questions', e)
        } finally {
          setIsFetchingQuestions(false)
        }
      }
      fetchQuestions()
    } else if (post?.recallQuestions) {
      try {
        setDynamicQuestions(safeJsonParse(post.recallQuestions))
      } catch (e) {
        setDynamicQuestions([])
      }
    }
  }, [post])

  const handleVerify = async () => {
    if (!userAnswer.trim()) return
    setIsVerifying(true)
    try {
      const questions = safeJsonParse(post.recallQuestions || '[]')
      const question = questions[0] || "What is the main takeaway of this post?"
      const response = await fetch('/api/ai/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          answer: userAnswer,
          context: post.content
        })
      })
      const data = await response.json()
      setFeedback(data.feedback)
      setShowRecall(true)
    } catch (err) {
      console.error('Verification failed:', err)
      setFeedback("Neural link disrupted. Please reconnect.")
    } finally {
      setIsVerifying(false)
    }
  }

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
                    <div className="text-base leading-relaxed text-foreground/80 font-medium italic">
                      <ReactMarkdown>{post.summary}</ReactMarkdown>
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
                  <div className="flex items-center gap-4 border-l pl-8 border-muted-foreground/20">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    {post.viewCount || 0} views
                  </div>
                  {isAdmin && (
                    <Link href={`/admin/posts/${post.id}/edit`}>
                      <Button variant="outline" size="sm" className="gap-2 font-black border-2 border-primary/20 hover:bg-primary/10 rounded-xl ml-4">
                        <Zap className="h-4 w-4 text-primary" />
                        Edit Manuscript
                      </Button>
                    </Link>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Content Area - MOVED INSIDE RECALL */}
          </div>

          {/* Active Recall Challenge - NEW */}
          {post.content && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-20"
            >
              <Card className="border-4 border-emerald-500/20 rounded-[2.5rem] bg-emerald-500/5 overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                  <Brain className="h-24 w-24 text-emerald-600" />
                </div>
                <CardHeader className="p-10 pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Zap className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm font-black uppercase tracking-[0.3em] text-emerald-600">Cognitive Retrieval</span>
                  </div>
                  <CardTitle className="text-3xl font-black tracking-tight">Active Recall Challenge.</CardTitle>
                  <CardDescription className="text-lg font-medium text-emerald-900/60 dark:text-emerald-400/60">
                    Force your brain to retrieve the following data points now to lock them into long-term storage.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-10 pt-0 space-y-8">
                  <div className="space-y-4">
                    {isFetchingQuestions ? (
                      <div className="flex items-center gap-3 p-5 rounded-2xl border-2 border-emerald-500/10 bg-white/40 dark:bg-zinc-900/40 animate-pulse">
                        <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                        <span className="font-bold text-emerald-600/60">Pollination AI is tailoring questions...</span>
                      </div>
                    ) : (
                      dynamicQuestions.map((q: string, i: number) => (
                        <div key={i} className={`flex gap-4 p-5 rounded-2xl border-2 transition-all ${i === 0 ? 'bg-white/80 dark:bg-zinc-900/80 border-emerald-500/30 shadow-lg' : 'bg-white/40 dark:bg-zinc-900/40 border-emerald-500/10 opacity-60'}`}>
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-xs">{i + 1}</div>
                          <p className="font-bold text-lg leading-relaxed">{q}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="space-y-4">
                    <Label className="text-sm font-black uppercase tracking-widest text-emerald-800/60 ml-2">Your Narrative Retrieval</Label>
                    <textarea
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Type your explanation here to encode this data..."
                      className="w-full min-h-[120px] bg-white/60 dark:bg-zinc-900/60 rounded-[2rem] border-2 border-emerald-500/20 p-8 text-lg focus:border-emerald-500/50 outline-none transition-all resize-none shadow-inner"
                    />
                    <div className="flex gap-4">
                      <Button
                        onClick={handleVerify}
                        disabled={isVerifying || !userAnswer.trim()}
                        className="flex-1 h-14 bg-emerald-600 hover:bg-emerald-700 font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-emerald-500/20"
                      >
                        {isVerifying ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Synchronize via AI'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowRecall(!showRecall)
                        }}
                        className="h-14 px-8 border-2 border-emerald-500/20 bg-white/50 hover:bg-emerald-50 font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all"
                      >
                        {showRecall ? 'Secure & Hide' : 'Reveal Insights'}
                      </Button>
                    </div>

                    <AnimatePresence>
                      {showRecall && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="p-8 bg-emerald-500/10 border-2 border-emerald-500/20 rounded-[2rem] relative overflow-hidden group space-y-8"
                        >
                          <div className="flex items-center gap-3 mb-4 text-emerald-700 dark:text-emerald-400 border-b border-emerald-500/10 pb-4">
                            <Sparkles className="h-5 w-5" />
                            <span className="font-black uppercase tracking-widest text-sm">Neural Feedback Loop</span>
                          </div>

                          {feedback && (
                            <div className="text-lg font-medium text-emerald-900 dark:text-emerald-300 leading-relaxed italic prose-emerald dark:prose-invert max-w-none mb-8">
                              <ReactMarkdown>{feedback}</ReactMarkdown>
                            </div>
                          )}

                          <Separator className="bg-emerald-500/10" />

                          <motion.article
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="prose prose-xl prose-stone dark:prose-invert max-w-none 
                              prose-headings:font-black prose-headings:tracking-tight 
                              prose-p:leading-[1.8] prose-p:text-foreground/80
                              prose-blockquote:border-primary prose-blockquote:bg-primary/5 
                              prose-blockquote:rounded-2xl prose-blockquote:p-8 prose-blockquote:not-italic
                              prose-strong:text-foreground prose-a:text-primary prose-a:font-black prose-a:no-underline hover:prose-a:underline"
                          >
                            <div className="flex items-center gap-2 mb-10 text-[10px] font-black text-primary uppercase tracking-[0.4em] opacity-50">
                              <Zap className="h-3 w-3 fill-primary" /> Transmission Decrypted & Synchronized
                            </div>
                            {post.content ? (
                              <ReactMarkdown>{post.content}</ReactMarkdown>
                            ) : (
                              <div className="text-center py-20 bg-muted/10 rounded-3xl border-2 border-dashed border-muted">
                                <p className="text-muted-foreground italic font-black">Manuscript in progress...</p>
                              </div>
                            )}
                          </motion.article>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="pt-6 border-t border-emerald-500/10">
                    <p className="text-sm font-bold text-emerald-600/60 italic flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Pro-tip: Focus on structural logic rather than exact phrasing.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

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
      </main>

      <Footer />
    </div>
  )
}
