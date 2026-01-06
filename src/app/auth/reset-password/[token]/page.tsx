'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Loader2, CheckCircle, Eye, EyeOff, KeyRound, ArrowRight, ShieldCheck, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { motion, AnimatePresence } from 'framer-motion'

export default function ResetPasswordPage() {
  const params = useParams()
  // const token = params?.token as string // Already implicitly handled by params usage below
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Check if token exists in params
    if (!params?.token) {
      setError('Invalid or missing reset token')
    }
  }, [params])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: params.token,
          password,
          confirmPassword
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
      } else {
        setError(data.error || 'Failed to reset password')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!params.token) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="max-w-md mx-auto border-4 border-destructive/20 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-center text-destructive flex flex-col items-center gap-4">
                  <XCircle className="h-16 w-16" />
                  Invalid Token
                </CardTitle>
                <CardDescription className="text-center font-medium">
                  This password reset link is invalid or has expired.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-center text-sm text-muted-foreground bg-muted/50 p-4 rounded-xl">
                    The security token required to reset your credentials is missing or invalid. Please initiate a new recovery protocol.
                  </p>
                  <Link href="/auth/forgot-password">
                    <Button className="w-full h-12 font-bold gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      Request New Reset
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    )
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
                  Cancel
                </Button>
              </Link>
            </div>

            <Card className="border-4 rounded-[2.5rem] overflow-hidden shadow-2xl bg-card/80 backdrop-blur-2xl">
              <div className="h-2 w-full bg-gradient-to-r from-emerald-500 via-primary to-cyan-500" />
              <CardHeader className="text-center pt-10 pb-6">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 shadow-inner group transition-all hover:bg-primary/20">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, type: "spring" }}
                  >
                    <ShieldCheck className="h-10 w-10 text-primary" />
                  </motion.div>
                </div>
                <CardTitle className="text-3xl font-black tracking-tighter uppercase mb-2">Secure Reset</CardTitle>
                <CardDescription className="text-muted-foreground font-bold italic">
                  Establish new credentials for your identity.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-10">
                <AnimatePresence mode="wait">
                  {!success ? (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="password" title="New Secret" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">New Password</Label>
                          <div className="relative group">
                            <Input
                              id="password"
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Enter (min 6 chars)"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                              disabled={loading}
                              minLength={6}
                              className="pl-4 pr-12 h-14 bg-muted/30 border-2 border-muted hover:border-primary/50 focus-visible:ring-primary/20 rounded-2xl transition-all font-medium"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                            >
                              {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword" title="Verify Secret" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Confirm Password</Label>
                          <div className="relative group">
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder="Re-enter to verify"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              required
                              disabled={loading}
                              minLength={6}
                              className="pl-4 pr-12 h-14 bg-muted/30 border-2 border-muted hover:border-primary/50 focus-visible:ring-primary/20 rounded-2xl transition-all font-medium"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
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
                              Updating...
                            </>
                          ) : (
                            <>
                              <KeyRound className="h-5 w-5" />
                              Update Credentials
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
                        <h3 className="text-2xl font-black tracking-tight text-foreground">Credentials Updated!</h3>
                        <p className="text-muted-foreground max-w-xs mx-auto">
                          Your identity has been secured with the new password. You may now access the system.
                        </p>
                      </div>

                      <div className="pt-2">
                        <Link href="/auth/login" className="flex-1">
                          <Button className="w-full h-14 text-lg font-bold gap-3 rounded-2xl shadow-xl shadow-primary/20">
                            Go to Login Page
                            <ArrowRight className="h-5 w-5" />
                          </Button>
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
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
