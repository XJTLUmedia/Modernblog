'use client'

import { useState } from 'react'
import Link from 'next/link'
import { UserPlus, Mail, Lock, ArrowRight, ShieldAlert, User, Check, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match!')
      setIsLoading(false)
      return
    }

    if (!agreeToTerms) {
      setError('Please agree to terms and conditions')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // Registration successful, redirect to hub
      router.push('/hub')
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
              <CardHeader className="text-center pt-10 pb-2">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 shadow-inner group transition-all hover:bg-primary/20">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: -10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <UserPlus className="h-10 w-10 text-primary" />
                  </motion.div>
                </div>
                <CardTitle className="text-3xl font-black tracking-tighter uppercase mb-2">Join the Network</CardTitle>
                <CardDescription className="text-muted-foreground font-bold italic">
                  Create your identity and start exploring.
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

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-12 h-12 bg-muted/30 border-2 border-muted hover:border-primary/50 focus-visible:ring-primary/20 rounded-2xl transition-all font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-12 h-12 bg-muted/30 border-2 border-muted hover:border-primary/50 focus-visible:ring-primary/20 rounded-2xl transition-all font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password" title="Encryption String" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Password</Label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="•••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-12 h-12 bg-muted/30 border-2 border-muted hover:border-primary/50 focus-visible:ring-primary/20 rounded-2xl transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" title="Verify String" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Confirm</Label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="•••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-12 h-12 bg-muted/30 border-2 border-muted hover:border-primary/50 focus-visible:ring-primary/20 rounded-2xl transition-all"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2 pt-2">
                    <Checkbox
                      id="terms"
                      checked={agreeToTerms}
                      onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                      required
                      className="mt-1 border-2 border-muted data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label
                      htmlFor="terms"
                      className="text-sm font-medium leading-tight text-muted-foreground"
                    >
                      I agree to the <Link href="/terms" className="text-primary hover:underline font-bold">Terms of Service</Link> and <Link href="/privacy" className="text-primary hover:underline font-bold">Privacy Policy</Link>
                    </Label>
                  </div>

                  <Button type="submit" className="w-full h-14 gap-3 text-lg font-black uppercase tracking-tight shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95 mt-4" disabled={isLoading}>
                    {isLoading ? 'Creating Account...' : (
                      <>
                        Create Account
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-8 text-center bg-muted/30 p-4 rounded-xl border border-muted/50">
                  <div className="text-sm text-muted-foreground font-medium">
                    Already have an account?
                    <Link href="/auth/login" className="text-primary hover:underline ml-1 inline-flex items-center gap-1 font-bold">
                      <ArrowLeft className="h-3 w-3" />
                      Sign in back
                    </Link>
                  </div>
                </div>
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
