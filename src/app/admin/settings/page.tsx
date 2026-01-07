'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    Settings, Shield, Zap, Database, Globe,
    Palette, Brain, Share2, Save, ArrowLeft,
    CheckCircle, Activity, Server, Lock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { useToast } from '@/hooks/use-toast'

export default function AdminSettings() {
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [settings, setSettings] = useState({
        siteName: '',
        siteDescription: '',
        memorizationMode: true,
        activeRecall: true,
        spacedRepetition: true,
        themeColor: '#10b981',
        githubUrl: '',
        twitterUrl: '',
        birthday: ''
    })

    const [sysStatus, setSysStatus] = useState({
        services: 'active',
        mainframe: 'synced',
        latency: '12ms'
    })

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/admin/settings')
                if (res.ok) {
                    const data = await res.json()
                    // Format birthday for input type date (YYYY-MM-DD)
                    if (data.birthday) {
                        data.birthday = new Date(data.birthday).toISOString().split('T')[0]
                    }
                    setSettings(data)
                }
            } catch (error) {
                console.error('Error fetching settings:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchSettings()
    }, [])

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            })
            if (res.ok) {
                toast({
                    title: 'System Reconfigured',
                    description: 'Global parameters have been successfully patched.',
                })
            } else {
                throw new Error('Patch failed')
            }
        } catch (error) {
            toast({
                title: 'Override Failed',
                description: 'Unable to commit changes to the mainframe.',
                variant: 'destructive'
            })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <main className="flex-1 py-12 relative overflow-hidden">
                {/* Visual effects */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] -z-10" />

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12"
                    >
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-primary/10 rounded-xl">
                                    <Settings className="h-6 w-6 text-primary" />
                                </div>
                                <span className="text-sm font-black uppercase tracking-[0.3em] text-primary">System Override</span>
                            </div>
                            <h1 className="text-5xl sm:text-7xl font-black mb-4 tracking-tight">
                                Internal <span className="text-primary italic">State</span>.
                            </h1>
                            <p className="text-xl text-muted-foreground leading-relaxed font-medium">
                                Configure the neural parameters of your intellectual network.
                            </p>
                        </div>

                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="h-14 px-8 bg-zinc-900 hover:bg-zinc-800 text-white font-black text-lg rounded-2xl shadow-2xl active:scale-95 transition-all"
                        >
                            <Save className="mr-2 h-5 w-5" />
                            {saving ? 'Syncing...' : 'Commit Changes'}
                        </Button>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left Column: Essential Configs */}
                        <div className="lg:col-span-8 space-y-8">
                            {/* Identity Section */}
                            <Card className="border-2 rounded-[2.5rem] overflow-hidden bg-card/50 backdrop-blur-xl">
                                <CardHeader className="bg-primary/5 border-b-2 border-primary/10 p-8">
                                    <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3 text-primary">
                                        <Globe className="h-6 w-6" />
                                        Platform Identity
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="font-bold text-sm uppercase tracking-widest text-muted-foreground">System Alias</Label>
                                            <Input
                                                value={settings.siteName}
                                                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                                                className="h-12 border-2 rounded-xl focus:ring-primary/20"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Primary Palette</Label>
                                            <div className="flex gap-4">
                                                <Input
                                                    type="color"
                                                    value={settings.themeColor}
                                                    onChange={(e) => setSettings({ ...settings, themeColor: e.target.value })}
                                                    className="h-12 w-20 p-1 border-2 rounded-xl"
                                                />
                                                <Input
                                                    value={settings.themeColor}
                                                    onChange={(e) => setSettings({ ...settings, themeColor: e.target.value })}
                                                    className="h-12 flex-1 border-2 rounded-xl font-mono"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Manifesto Summary</Label>
                                        <Textarea
                                            value={settings.siteDescription}
                                            onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                                            className="min-h-[120px] border-2 rounded-xl resize-none text-lg leading-relaxed"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-primary/5">
                                        <div className="space-y-2">
                                            <Label className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Admin Birthday</Label>
                                            <Input
                                                type="date"
                                                value={settings.birthday || ''}
                                                onChange={(e) => setSettings({ ...settings, birthday: e.target.value })}
                                                className="h-12 border-2 rounded-xl focus:ring-primary/20"
                                            />
                                            <p className="text-[10px] font-medium text-muted-foreground italic">Unlock personalized protocol on this rotation.</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Cognitive Systems */}
                            <Card className="border-2 rounded-[2.5rem] overflow-hidden bg-card/50 backdrop-blur-xl">
                                <CardHeader className="bg-purple-500/5 border-b-2 border-purple-500/10 p-8">
                                    <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3 text-purple-600">
                                        <Brain className="h-6 w-6" />
                                        Neural Augmentation
                                    </CardTitle>
                                    <CardDescription className="text-base font-medium">
                                        Enable high-performance learning algorithms site-wide.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-8 space-y-8">
                                    <div className="flex items-center justify-between p-6 bg-purple-500/5 rounded-3xl border-2 border-purple-500/10 hover:border-purple-500/30 transition-all">
                                        <div className="space-y-1">
                                            <div className="font-black text-lg">Memorization Mode</div>
                                            <div className="text-sm text-muted-foreground font-medium">Enable the core memorization boosting engine.</div>
                                        </div>
                                        <Switch
                                            checked={settings.memorizationMode}
                                            onCheckedChange={(checked) => setSettings({ ...settings, memorizationMode: checked })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="p-6 bg-emerald-500/5 rounded-3xl border-2 border-emerald-500/10 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Zap className="h-6 w-6 text-emerald-600" />
                                                <Switch
                                                    checked={settings.activeRecall}
                                                    onCheckedChange={(checked) => setSettings({ ...settings, activeRecall: checked })}
                                                />
                                            </div>
                                            <div>
                                                <div className="font-black">Active Recall</div>
                                                <div className="text-xs text-muted-foreground font-medium mt-1">Force retrieval via post-content challenges.</div>
                                            </div>
                                        </div>
                                        <div className="p-6 bg-blue-500/5 rounded-3xl border-2 border-blue-500/10 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Lock className="h-6 w-6 text-blue-600" />
                                                <Switch
                                                    checked={settings.spacedRepetition}
                                                    onCheckedChange={(checked) => setSettings({ ...settings, spacedRepetition: checked })}
                                                />
                                            </div>
                                            <div>
                                                <div className="font-black">Spaced Repetition</div>
                                                <div className="text-xs text-muted-foreground font-medium mt-1">Intelligent review intervals for Garden Notes.</div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* External Nodes */}
                            <Card className="border-2 rounded-[2.5rem] overflow-hidden bg-zinc-950 text-white shadow-2xl">
                                <CardHeader className="p-8 pb-0">
                                    <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                                        <Share2 className="h-6 w-6 text-primary" />
                                        Data Portals
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="font-bold text-xs uppercase tracking-[0.2em] text-zinc-500">GitHub Repository Sync</Label>
                                            <div className="relative">
                                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                                                <Input
                                                    value={settings.githubUrl || ''}
                                                    onChange={(e) => setSettings({ ...settings, githubUrl: e.target.value })}
                                                    placeholder="https://github.com/profile"
                                                    className="h-12 pl-12 bg-zinc-900 border-zinc-800 text-white rounded-xl focus:ring-primary/20"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="font-bold text-xs uppercase tracking-[0.2em] text-zinc-500">Twitter Protocol</Label>
                                            <div className="relative">
                                                <Share2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                                                <Input
                                                    value={settings.twitterUrl || ''}
                                                    onChange={(e) => setSettings({ ...settings, twitterUrl: e.target.value })}
                                                    placeholder="https://twitter.com/profile"
                                                    className="h-12 pl-12 bg-zinc-900 border-zinc-800 text-white rounded-xl focus:ring-primary/20"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column: Status & Telemetry */}
                        <div className="lg:col-span-4 space-y-8">
                            {/* Core Status */}
                            <Card className="border-4 border-primary/20 rounded-[2.5rem] overflow-hidden bg-card/80 backdrop-blur shadow-2xl relative">
                                <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-primary via-blue-500 to-primary" />
                                <CardHeader className="pt-10 px-8">
                                    <CardTitle className="text-2xl font-black tracking-tight uppercase">Core Status</CardTitle>
                                </CardHeader>
                                <CardContent className="px-8 pb-10 space-y-6">
                                    <div className="flex items-center justify-between p-5 bg-muted/50 rounded-3xl border-2 border-primary/5">
                                        <div className="flex items-center gap-4">
                                            <div className="h-4 w-4 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse" />
                                            <span className="font-black uppercase tracking-widest text-sm">Services</span>
                                        </div>
                                        <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 font-black uppercase text-[10px]">Active</Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-5 bg-muted/50 rounded-3xl border-2 border-primary/5">
                                        <div className="flex items-center gap-4">
                                            <div className="h-4 w-4 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-pulse" />
                                            <span className="font-black uppercase tracking-widest text-sm">Mainframe</span>
                                        </div>
                                        <Badge variant="outline" className="text-blue-500 border-blue-500/20 font-black uppercase text-[10px]">Synced</Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-5 bg-muted/50 rounded-3xl border-2 border-primary/5">
                                        <div className="flex items-center gap-4">
                                            <Activity className="h-4 w-4 text-primary" />
                                            <span className="font-black uppercase tracking-widest text-sm">Latency</span>
                                        </div>
                                        <span className="font-mono text-xs font-bold text-muted-foreground">{sysStatus.latency}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* System Hardware */}
                            <Card className="border-2 rounded-[2.5rem] bg-zinc-950 text-white p-8">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <Server className="h-5 w-5 text-zinc-500" />
                                        <span className="text-sm font-black uppercase tracking-widest text-zinc-500">Resource Load</span>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                                <span>CPU Core Engagement</span>
                                                <span className="text-primary">12%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                                                <div className="h-full w-[12%] bg-primary shadow-[0_0_10px_#10b981]" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                                <span>Memory Allocation</span>
                                                <span className="text-blue-400">42%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                                                <div className="h-full w-[42%] bg-blue-500" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Security Feed */}
                            <Card className="border-2 rounded-[2.5rem] p-8 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Lock className="h-5 w-5 text-muted-foreground" />
                                        <span className="text-xs font-black uppercase tracking-widest">Security Log</span>
                                    </div>
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm" />
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { time: 'T-02:45', msg: 'Root access verified.', col: 'text-emerald-500' },
                                        { time: 'T-12:12', msg: 'Neural cache purged.', col: 'text-muted-foreground' },
                                        { time: 'T-15:30', msg: 'Backup sync complete.', col: 'text-muted-foreground' }
                                    ].map((log, i) => (
                                        <div key={i} className="flex gap-4 text-[10px] font-mono">
                                            <span className="text-zinc-400 tabular-nums">{log.time}</span>
                                            <span className={`font-bold ${log.col}`}>{log.msg}</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
