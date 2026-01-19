'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Brain, Zap, ArrowLeft, Sparkles, Shield, Target, BookOpen, Clock, Activity, Lightbulb } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import ReactMarkdown from 'react-markdown'

const cogData: Record<string, any> = {
    'active-recall': {
        title: 'Active Recall',
        description: 'The foundation of efficient learning: forcing your brain to retrieve information.',
        icon: <Zap className="h-6 w-6 text-primary" />,
        color: 'text-primary',
        bg: 'bg-primary/10',
        content: `
Active recall is the process of actively stimulating memory during the learning process. It contrasts with passive review, where information is simply re-read or watched again.

### Why it works
When you force retrieval, you strengthen the neural pathways associated with that information. It's like a workout for your brain—the harder it is to remember, the stronger the memory becomes.

### How to use it:
- **Testing over reading**: Instead of re-reading a chapter, try to write down everything you remember first.
- **Flashcards**: Using tools like Anki or digital flashcards forces retrieval.
- **The Blurting Method**: Read a section, close the book, and "blurt" out everything you remember on a blank sheet of paper.
    `
    },
    'spaced-repetition': {
        title: 'Spaced Repetition',
        description: 'Leveraging the forgetting curve to ensure long-term retention.',
        icon: <Clock className="h-6 w-6 text-blue-500" />,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        content: `
Spaced repetition is a learning technique that involves increasing the interval of time between subsequent reviews of previously learned material.

### The Forgetting Curve
Information is lost over time when there is no attempt to retain it. Spaced repetition interrupts this curve at the perfect moment—just as you're about to forget.

### Optimization Schedule:
- **Review 1**: 1 day after learning
- **Review 2**: 3 days later
- **Review 3**: 7 days later
- **Review 4**: 30 days later
- **Review 5**: 90 days later
    `
    },
    'chunking': {
        title: 'Chunking',
        description: 'Grouping information into manageable mental nodes.',
        icon: <Target className="h-6 w-6 text-amber-500" />,
        color: 'text-amber-500',
        bg: 'bg-amber-500/10',
        content: `
Chunking is the process of taking individual pieces of information and grouping them into larger units. By doing this, you can improve the amount of information you can remember.

### Cognitive Load Theory
Working memory has a limited capacity (about 4-7 items). Chunking allows you to "compress" data so that a complex system feels like just a few high-level blocks.

### Implementation:
- **Identify Patterns**: Find common threads in the data.
- **Group by Function**: In programming, group logic by "Authentication", "Data Layer", "UI".
- **Top-Down approach**: Understand the broad architecture before diving into small details.
    `
    },
    'method-of-loci': {
        title: 'Method of Loci',
        description: 'Spatial memory indexing using familiar architectural maps.',
        icon: <MapPin className="h-6 w-6 text-purple-400" />,
        color: 'text-purple-400',
        bg: 'bg-purple-400/10',
        content: `
Also known as the Memory Palace technique, this involves associating the information you want to remember with specific locations in a familiar room or building.

### Spatial Encoding
Our brains are evolved to remember spatial environments far better than abstract lists. By "placing" data in a physical context, we hijack this evolutionary strength.

### Steps:
1. **Choose your palace**: A house you know perfectly.
2. **List distinct features**: Front door, hallway table, kitchen sink.
3. **Visualize**: Place a vivid image of the data on each spot.
4. **Walk through**: Mentally walk through the rooms to retrieve the data.
    `
    },
    'feynman-technique': {
        title: 'Feynman Technique',
        description: 'Simplify concepts until they reach their absolute primitive.',
        icon: <Lightbulb className="h-6 w-6 text-orange-400" />,
        color: 'text-orange-400',
        bg: 'bg-orange-400/10',
        content: `
Named after physicist Richard Feynman, this technique is a four-step process for understanding any subject.

### If you can't explain it simply...
Explanation is a form of active learning. If you struggle to explain a concept to a child (or a non-expert), you don't truly understand it yet.

### The Process:
1. **Choose a concept**: Write the name at the top of a page.
2. **Explain it to a child**: Use simple language and analogies.
3. **Identify gaps**: Go back to the source material to fill in what you missed.
4. **Review and simplify**: Use better analogies to refine the explanation.
    `
    },
    'dual-coding': {
        title: 'Dual Coding',
        description: 'Concurrent linguistic and visual data synthesis.',
        icon: <Activity className="h-6 w-6 text-indigo-400" />,
        color: 'text-indigo-400',
        bg: 'bg-indigo-400/10',
        content: `
Dual coding theory suggests that human memory has two distinct yet interconnected systems: one for verbal (linguistic) information and one for non-verbal (imagery) information.

### Combined Strength
When we encode information using both systems, we create more "hooks" for retrieval. A concept explained in words AND shown as a diagram is significantly easier to remember.

### How to apply:
- **Sketching**: Draw a simple diagram next to your notes.
- **Iconography**: Use specific icons (like Lucide icons) to represent concepts.
- **Visual Analogies**: Think of a "bridge" when learning about network gateways.
    `
    },
    'sleep-priority': {
        title: 'Sleep Priority',
        description: 'Long-term memory consolidation happens in deep REM.',
        icon: <Shield className="h-6 w-6 text-blue-400" />,
        color: 'text-blue-400',
        bg: 'bg-blue-400/10',
        content: `
Sleep is not a passive state. It is an active period where the brain processes the day's events and consolidates them into long-term memory.

### Consolidation Phase
During deep sleep, the hippocampus "replays" the data learned during the day, transmitting it to the neocortex for permanent storage.

### Best Practices:
- **No screens before bed**: Blue light inhibits melatonin production.
- **Consistent schedule**: Wake up at the same time every day.
- **Nap strategically**: A 20-minute power nap can "flush" the adenosine buildup.
    `
    },
    'aerobic-sync': {
        title: 'Aerobic Sync',
        description: 'Physical activity boosts hippocampal plasticity.',
        icon: <Zap className="h-6 w-6 text-emerald-400" />,
        color: 'text-emerald-400',
        bg: 'bg-emerald-400/10',
        content: `
Aerobic exercise has been shown to induce the production of Brain-Derived Neurotrophic Factor (BDNF), a "miracle-gro" for the brain.

### Neurogenesis
Exercise actually increases the volume of the hippocampus, the part of the brain responsible for memory and learning.

### Strategy:
- **Walk while thinking**: Great for creative problem-solving.
- **Moderate intensity**: You don't need to run a marathon; a brisk walk is enough.
- **The 30-minute rule**: Aim for 30 minutes of activity to maximize BDNF release.
    `
    },
    'state-management': {
        title: 'State Management',
        description: 'Mindfulness to counteract "infinite scroll" data fragmentation.',
        icon: <Brain className="h-6 w-6 text-teal-400" />,
        color: 'text-teal-400',
        bg: 'bg-teal-400/10',
        content: `
In an era of infinite scrolls and constant notifications, our attention is often fragmented. State management is the practice of consciously controlling our mental environment.

### Attentional Control
Learning requires deep focus (Deep Work). By managing your state, you can enter "flow" more easily and stay there longer.

### Techniques:
- **Monotasking**: Do one thing at a time with 100% intensity.
- **Mindfulness**: Spend 5-10 minutes just breathing before starting a deep study session.
- **Digital Minimalism**: Remove distractions from your immediate environment.
    `
    }
}

export default function CogTheoryPage() {
    const params = useParams()
    const slug = params?.slug as string
    const data = cogData[slug]

    if (!data) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
                <h1 className="text-4xl font-black mb-4">404: Node Missing</h1>
                <p className="text-muted-foreground mb-8">The cognitive strategy you're looking for has not been indexed yet.</p>
                <Link href="/hub">
                    <Button variant="default">Back to Hub</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <main className="flex-1 py-12 relative overflow-hidden">
                {/* Background Decorative */}
                <div className={`absolute top-0 right-0 w-96 h-96 ${data.bg} rounded-full blur-[120px] -z-10`} />

                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        {/* Breadcrumb */}
                        <Link href="/hub" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-12 group">
                            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                            Return to Command Center
                        </Link>

                        {/* Hero */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-16"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`p-4 ${data.bg} rounded-[2rem] border-2 border-white/10 shadow-lg`}>
                                    {data.icon}
                                </div>
                                <Badge className={`${data.bg} ${data.color} border-none font-black tracking-widest uppercase`}>
                                    Theory Protocol
                                </Badge>
                            </div>
                            <h1 className="text-5xl sm:text-7xl font-black tracking-tighter mb-6 leading-tight">
                                {data.title}<span className="text-primary text-6xl">.</span>
                            </h1>
                            <p className="text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl">
                                {data.description}
                            </p>
                        </motion.div>

                        {/* Content */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="prose prose-xl dark:prose-invert max-w-none 
                prose-headings:font-black prose-headings:tracking-tighter 
                prose-p:leading-[1.8] prose-p:text-foreground/70
                prose-blockquote:border-primary prose-blockquote:bg-primary/5 
                prose-blockquote:rounded-2xl prose-blockquote:py-8 prose-blockquote:px-12
                prose-strong:text-foreground prose-a:text-primary prose-a:font-black"
                        >
                            <div className="bg-muted/30 p-12 rounded-[3rem] border-2 border-muted/50 whitespace-pre-wrap">
                                <div className="flex items-center gap-2 mb-10 text-[10px] font-black text-primary uppercase tracking-[0.4em] opacity-50">
                                    <Activity className="h-3 w-3" /> Core Cognitive Logic Synchronized
                                </div>
                                <ReactMarkdown>{data.content.trim()}</ReactMarkdown>
                            </div>
                        </motion.div>

                        {/* Footer Prompt */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mt-24 p-12 rounded-[3rem] bg-zinc-950 text-white border-4 border-primary/20 shadow-2xl relative overflow-hidden text-center"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -z-10" />
                            <Brain className="h-12 w-12 text-primary mx-auto mb-6" />
                            <h2 className="text-3xl font-black mb-4">Apply this logic now.</h2>
                            <p className="text-zinc-400 text-lg mb-8 max-w-xl mx-auto">
                                Theory is useless without execution. Head back to the Garden or Forge to implement these strategies today.
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-4">
                                <Link href="/garden">
                                    <Button className="h-12 px-8 rounded-xl font-black uppercase text-xs tracking-widest gap-2">
                                        <Sprout className="h-4 w-4" /> Go to Garden
                                    </Button>
                                </Link>
                                <Link href="/forge">
                                    <Button variant="outline" className="h-12 px-8 rounded-xl font-black uppercase text-xs tracking-widest gap-2 bg-white/5 border-white/10 hover:bg-white/10">
                                        <Hammer className="h-4 w-4" /> Go to Forge
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}

function Sprout(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sprout"><path d="M7 20h10" /><path d="M10 20c5.5-2.5 8-6.4 8-8.5V11c0-1.7-1.3-3-3-3h-1c-2.1 0-4 1.9-4 4s1.9 4 4 4" /><path d="M14 20c-5.5-2.5-8-6.4-8-8.5V11c0-1.7 1.3-3 3-3h1c2.1 0 4 1.9 4 4s-1.9 4-4 4" /><path d="M12 20v-9" /></svg>
}

function Hammer(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-hammer"><path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9" /><path d="M17.64 15 22 10.64" /><path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86c0-1.38.63-2.68 1.71-3.51.11-.08.12-.24.03-.35-.04-.05-.1-.08-.17-.08h-2.16c-.84 0-1.65.34-2.24.94l-.94.94c-.6.6-1.4.93-2.25.93h-.86c-1.38 0-2.68-.63-3.51-1.71-.08-.11-.24-.12-.35-.03-.05.04-.08.1-.08.17v2.16c0 .84.34 1.65.94 2.24l.94.94c.6.6.93 1.4.93 2.25v.86c0 1.38-.63 2.68-1.71 3.51-.11.08-.12.24-.03.35.04.05.11.08.17.08h2.16c.85 0 1.65-.34 2.25-.94l.94-.94c.6-.6 1.4-.93 2.25-.93h.86c1.38 0 2.68.63 3.51 1.71.08.11.24.12.35.03.05-.04.08-.11.08-.17v-2.16c0-.85-.34-1.65-.94-2.25Z" /></svg>
}

function MapPin(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
}
