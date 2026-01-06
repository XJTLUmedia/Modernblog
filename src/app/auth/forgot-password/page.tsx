'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, Loader2, CheckCircle, XCircle, KeyRound, ShieldQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { motion, AnimatePresence } from 'framer-motion'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [resetToken, setResetToken] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        // For demo: Store token so user can reset password
        if (data.resetToken) {
          setResetToken(data.resetToken)
        }
      } else {
        setError(data.error || 'Failed to send reset link')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto"
          >
            <div className="mb-8">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="gap-2 pl-0 hover:bg-transparent hover:text-primary transition-colors text-muted-foreground">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Button>
              </Link>
            </div>

            <Card className="border-4 rounded-[2.5rem] overflow-hidden shadow-2xl bg-card/80 backdrop-blur-2xl">
              <div className="h-2 w-full bg-gradient-to-r from-teal-500 via-primary to-purple-500" />
              <CardHeader className="text-center pt-10 pb-6">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 shadow-inner group transition-all hover:bg-primary/20">
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <ShieldQuestion className="h-10 w-10 text-primary" />
                  </motion.div>
                </div>
                <CardTitle className="text-3xl font-black tracking-tighter uppercase mb-2">Recovery Protocol</CardTitle>
                <CardDescription className="text-muted-foreground font-bold italic">
                  Lost your access key? We'll help you regenerate it.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-10">
                <AnimatePresence mode="wait">
                  {!success ? (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <p className="text-sm text-muted-foreground mb-8 text-center font-medium bg-muted/40 p-4 rounded-xl border border-muted/50">
                        Enter the email address associated with your identity. We'll transmit a secure reset link.
                      </p>

                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
                          <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                              id="email"
                              type="email"
                              placeholder="you@example.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="pl-12 h-14 bg-muted/30 border-2 border-muted hover:border-primary/50 focus-visible:ring-primary/20 rounded-2xl transition-all font-medium"
                              required
                              disabled={loading}
                            />
                          </div>
                        </div>

                        {error && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="flex items-center gap-3 text-sm text-destructive bg-destructive/10 p-4 rounded-2xl border-2 border-destructive/20 font-bold"
                          >
                            <XCircle className="h-5 w-5 shrink-0" />
                            <span>{error}</span>
                          </motion.div>
                        )}

                        <Button
                          type="submit"
                          className="w-full h-14 gap-3 text-lg font-black uppercase tracking-tight shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" />
                              Transmitting...
                            </>
                          ) : (
                            <>
                              <KeyRound className="h-5 w-5" />
                              Send Reset Link
                            </>
                          )}
                        </Button>
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-8"
                    >
                      <div className="flex flex-col items-center justify-center text-center space-y-4 py-6">
                        <div className="h-24 w-24 rounded-full bg-green-500/10 flex items-center justify-center mb-2 animate-bounce">
                          <CheckCircle className="h-12 w-12 text-green-500" />
                        </div>
                        <h3 className="text-2xl font-black tracking-tight text-foreground">Transmission Successful!</h3>
                        <p className="text-muted-foreground max-w-xs mx-auto">
                          We've sent a secure reset link to your email address. Check your inbox to proceed.
                        </p>
                      </div>

                      {/* Demo: Show reset token and link */}
                      <div className="p-4 bg-muted/50 rounded-xl border border-dashed border-muted-foreground/30 text-sm space-y-3">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
                          <KeyRound className="h-3 w-3" />
                          <span>Demo Reset Protocol</span>
                        </div>
                        <div className="flex flex-col gap-2">
                          <code className="text-xs font-mono bg-background px-2 py-1.5 rounded border block truncate">
                            Token: {resetToken}
                          </code>
                          <Link
                            href={`/auth/reset-password/${resetToken}`}
                          >
                            <Button size="sm" variant="secondary" className="w-full text-xs h-8">
                              Open Reset Link
                            </Button>
                          </Link>
                        </div>
                      </div>

                      <div className="pt-2">
                        <Link href="/auth/login">
                          <Button variant="outline" className="w-full h-12 rounded-xl font-bold border-2">
                            Return to Login
                          </Button>
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            <div className="mt-8 text-center text-sm font-medium text-muted-foreground opacity-60">
              Remember your password?{' '}
              <Link href="/auth/login" className="text-primary hover:underline font-bold">
                Login here
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      <div className="container mx-auto px-4 pb-6 text-center text-xs text-muted-foreground">
        <div className="flex justify-center gap-4">
          <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}
