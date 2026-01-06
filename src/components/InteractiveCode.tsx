'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, RotateCcw, Copy, Check, Terminal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface InteractiveCodeProps {
    initialCode: string
    language?: string
    title?: string
}

export function InteractiveCode({ initialCode, language = 'javascript', title = 'Interactive Snippet' }: InteractiveCodeProps) {
    const [code, setCode] = useState(initialCode)
    const [output, setOutput] = useState<string[]>([])
    const [isRunning, setIsRunning] = useState(false)
    const [copied, setCopied] = useState(false)
    const outputRef = useRef<HTMLDivElement>(null)

    const runCode = () => {
        setIsRunning(true)
        setOutput([])

        // Capture console.log
        const oldLog = console.log
        const logs: string[] = []

        console.log = (...args: any[]) => {
            logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '))
            oldLog(...args)
        }

        try {
            // Create a fresh environment for execution
            const fn = new Function(code)
            fn()
            setOutput(logs.length > 0 ? logs : ['Code executed successfully (no output)'])
        } catch (err: any) {
            setOutput([`Error: ${err.message}`])
        } finally {
            console.log = oldLog
            setIsRunning(false)
        }
    }

    const resetCode = () => {
        setCode(initialCode)
        setOutput([])
    }

    const copyCode = () => {
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Card className="my-6 border-2 shadow-lg overflow-hidden bg-zinc-950 text-zinc-50 border-zinc-800">
            <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
                <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs font-mono font-bold tracking-tight uppercase text-zinc-400">
                        {title}
                    </span>
                    <Badge variant="secondary" className="text-[10px] h-4 bg-zinc-800 text-zinc-400 border-zinc-700">
                        {language}
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-white" onClick={copyCode}>
                        {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-white" onClick={resetCode}>
                        <RotateCcw className="h-3 w-3" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 min-h-[200px]">
                {/* Editor Area */}
                <div className="p-4 border-r border-zinc-800">
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full h-full bg-transparent font-mono text-sm resize-none focus:outline-none text-emerald-400"
                        spellCheck={false}
                    />
                </div>

                {/* Output Area */}
                <div className="flex flex-col bg-zinc-900/30">
                    <div className="flex items-center justify-between px-4 py-1.5 bg-black/20 border-b border-zinc-800">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Output</span>
                        <Button
                            size="sm"
                            onClick={runCode}
                            disabled={isRunning}
                            className="h-6 px-3 text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1"
                        >
                            <Play className="h-3 w-3 fill-current" />
                            RUN
                        </Button>
                    </div>
                    <div className="p-4 font-mono text-xs overflow-auto max-h-[250px]" ref={outputRef}>
                        {output.length > 0 ? (
                            output.map((line, i) => (
                                <div key={i} className={line.startsWith('Error:') ? 'text-red-400' : 'text-zinc-300'}>
                                    <span className="text-zinc-600 mr-2 select-none">{'>'}</span>
                                    {line}
                                </div>
                            ))
                        ) : (
                            <div className="text-zinc-600 italic">Click "RUN" to see output...</div>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    )
}
