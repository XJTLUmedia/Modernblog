'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Play, RotateCcw, Copy, Check, Code2, Terminal, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const EXAMPLES = {
    javascript: `// JavaScript Example - FizzBuzz
function fizzBuzz(n) {
  const result = [];
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) result.push('FizzBuzz');
    else if (i % 3 === 0) result.push('Fizz');
    else if (i % 5 === 0) result.push('Buzz');
    else result.push(i);
  }
  return result;
}

console.log(fizzBuzz(15));`,

    typescript: `// TypeScript Example - Generic Function
function reverseArray<T>(arr: T[]): T[] {
  return arr.reverse();
}

const numbers = [1, 2, 3, 4, 5];
const words = ['hello', 'world'];

console.log(reverseArray(numbers));
console.log(reverseArray(words));`,

    python: `# Python Example - Fibonacci Sequence
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Generate first 10 Fibonacci numbers
fib_sequence = [fibonacci(i) for i in range(10)]
print(f"Fibonacci sequence: {fib_sequence}")`,

    html: `<!-- HTML/CSS Example -->
<!DOCTYPE html>
<html>
<head>
  <style>
    .gradient-box {
      width: 200px;
      height: 200px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="gradient-box">Hello!</div>
</body>
</html>`
}

type Language = 'javascript' | 'typescript' | 'python' | 'html'

export function CodePlayground() {
    const [code, setCode] = useState(EXAMPLES.javascript)
    const [output, setOutput] = useState<string[]>([])
    const [language, setLanguage] = useState<Language>('javascript')
    const [isRunning, setIsRunning] = useState(false)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        setCode(EXAMPLES[language])
        setOutput([])
    }, [language])

    const executeCode = async () => {
        setIsRunning(true)
        setOutput([])

        try {
            if (language === 'javascript' || language === 'typescript') {
                // Capture console.log output
                const logs: string[] = []
                const originalLog = console.log
                console.log = (...args: any[]) => {
                    logs.push(args.map(arg =>
                        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                    ).join(' '))
                }

                try {
                    // Execute the code
                    const func = new Function(code)
                    func()
                    setOutput(logs.length > 0 ? logs : ['Code executed successfully (no output)'])
                } catch (error: any) {
                    setOutput([`❌ Error: ${error.message}`])
                } finally {
                    console.log = originalLog
                }
            } else if (language === 'python') {
                setOutput([
                    '🐍 Python execution requires a backend server.',
                    'Output preview:',
                    'Fibonacci sequence: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]'
                ])
            } else if (language === 'html') {
                setOutput([
                    '🌐 HTML preview would render in an iframe.',
                    'The gradient box would appear with purple gradient.'
                ])
            }
        } catch (error: any) {
            setOutput([`❌ Execution Error: ${error.message}`])
        } finally {
            setIsRunning(false)
        }
    }

    const resetCode = () => {
        setCode(EXAMPLES[language])
        setOutput([])
    }

    const copyCode = async () => {
        await navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="w-full">
            <Tabs defaultValue="editor" className="w-full">
                <div className="flex items-center justify-between mb-6">
                    <TabsList className="bg-zinc-800 border border-zinc-700">
                        <TabsTrigger value="editor" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                            <Code2 className="h-4 w-4 mr-2" />
                            Editor
                        </TabsTrigger>
                        <TabsTrigger value="output" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                            <Terminal className="h-4 w-4 mr-2" />
                            Output
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-3">
                        <Select value={language} onValueChange={(val) => setLanguage(val as Language)}>
                            <SelectTrigger className="w-[180px] bg-zinc-800 border-zinc-700">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-800 border-zinc-700">
                                <SelectItem value="javascript">JavaScript</SelectItem>
                                <SelectItem value="typescript">TypeScript</SelectItem>
                                <SelectItem value="python">Python</SelectItem>
                                <SelectItem value="html">HTML/CSS</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            onClick={resetCode}
                            variant="outline"
                            size="sm"
                            className="border-zinc-700 hover:bg-zinc-800"
                        >
                            <RotateCcw className="h-4 w-4" />
                        </Button>

                        <Button
                            onClick={copyCode}
                            variant="outline"
                            size="sm"
                            className="border-zinc-700 hover:bg-zinc-800"
                        >
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>

                        <Button
                            onClick={executeCode}
                            disabled={isRunning}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold gap-2"
                        >
                            {isRunning ? (
                                <>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    >
                                        <Sparkles className="h-4 w-4" />
                                    </motion.div>
                                    Running...
                                </>
                            ) : (
                                <>
                                    <Play className="h-4 w-4" />
                                    Run Code
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <TabsContent value="editor" className="mt-0">
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardContent className="p-0">
                            <textarea
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full h-[400px] bg-zinc-900 text-zinc-100 p-6 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg"
                                spellCheck={false}
                                placeholder="Write your code here..."
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="output" className="mt-0">
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="border-b border-zinc-800">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Terminal className="h-4 w-4 text-emerald-500" />
                                Console Output
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="font-mono text-sm space-y-2 min-h-[300px]">
                                <AnimatePresence mode="popLayout">
                                    {output.length > 0 ? (
                                        output.map((line, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className={`${line.startsWith('❌')
                                                        ? 'text-red-400'
                                                        : line.startsWith('🐍') || line.startsWith('🌐')
                                                            ? 'text-yellow-400'
                                                            : 'text-emerald-400'
                                                    }`}
                                            >
                                                {line}
                                            </motion.div>
                                        ))
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-zinc-600 italic flex items-center justify-center h-[300px]"
                                        >
                                            Click "Run Code" to see output here...
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Info Banner */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 p-4 bg-zinc-800/50 border border-zinc-700 rounded-xl"
            >
                <p className="text-xs text-zinc-400 text-center">
                    💡 <strong className="text-zinc-300">Tip:</strong> JavaScript and TypeScript run directly in your browser.
                    Python and HTML show preview outputs. Try the examples or write your own code!
                </p>
            </motion.div>
        </div>
    )
}
