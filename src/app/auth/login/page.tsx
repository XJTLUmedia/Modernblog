'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LogIn, User, Lock, ArrowRight, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { motion, AnimatePresence } from 'framer-motion'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      // Login successful
      if (data.user?.isAdmin || data.user?.role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/hub')
      }
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 relative overflow-hidden">
        {/* Dynamic decorative elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] -z-10 animate-pulse delay-700" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <Card className="border-4 rounded-[2.5rem] overflow-hidden shadow-2xl bg-card/80 backdrop-blur-2xl">
              <div className="h-2 w-full bg-gradient-to-r from-primary via-purple-500 to-pink-500" />
              <CardHeader className="text-center pt-10 pb-6">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 shadow-inner group transition-all hover:bg-primary/20">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <LogIn className="h-10 w-10 text-primary" />
                  </motion.div>
                </div>
                <CardTitle className="text-4xl font-black tracking-tighter uppercase mb-2">Welcome Back</CardTitle>
                <CardDescription className="text-muted-foreground font-bold italic">
                  Continue your journey into the knowledge base.
                </CardDescription>
              </CardHeader>

              <CardContent className="px-8 pb-10">
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6 p-4 rounded-2xl bg-red-500/10 border-2 border-red-500/20 text-red-600 text-sm font-black flex items-center gap-3"
                    >
                      <ShieldAlert className="h-5 w-5 shrink-0" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Universal ID</Label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="identity@modernblog.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-12 h-14 bg-muted/30 border-2 border-muted hover:border-primary/50 focus-visible:ring-primary/20 rounded-2xl transition-all font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" title="Encryption String" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Access Token</Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-12 h-14 bg-muted/30 border-2 border-muted hover:border-primary/50 focus-visible:ring-primary/20 rounded-2xl transition-all"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 gap-3 text-lg font-black uppercase tracking-tight shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Initiate Access
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-8 text-center space-y-4">
                  <div className="text-sm font-bold opacity-60">
                    <Link href="/auth/forgot-password" title="Protocol for lost keys" className="hover:text-primary hover:underline underline-offset-4 decoration-2 decoration-primary/30 transition-colors">
                      Lost your authentication token?
                    </Link>
                  </div>
                  <div className="pt-4 border-t-2 border-dashed border-muted">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">New to the system?</p>
                    <Link href="/auth/signup">
                      <Button variant="outline" className="w-full h-12 rounded-2xl border-2 font-black uppercase tracking-tight hover:bg-primary/5">
                        Register Identity
                      </Button>
                    </Link>
                  </div>
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
