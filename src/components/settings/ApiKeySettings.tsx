'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Key, Eye, EyeOff, Save, Loader2, Info } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ApiKeyField {
    key: string
    label: string
    description: string
    placeholder: string
}

const API_KEY_FIELDS: ApiKeyField[] = [
    {
        key: 'OPENAI_API_KEY',
        label: 'OpenAI API Key',
        description: 'Used for AI content generation (GPT models)',
        placeholder: 'sk-...',
    },
    {
        key: 'GEMINI_API_KEY',
        label: 'Gemini API Key',
        description: 'Google Gemini AI models',
        placeholder: 'AI...',
    },
    {
        key: 'GOOGLE_API_KEY',
        label: 'Google API Key',
        description: 'Used for Google Custom Search when writing blogs',
        placeholder: 'AIza...',
    },
    {
        key: 'GOOGLE_CX',
        label: 'Google Custom Search CX',
        description: 'Custom Search Engine ID',
        placeholder: 'Your search engine ID',
    },
    {
        key: 'REPLICATE_API_TOKEN',
        label: 'Replicate API Token',
        description: 'Used for AI video/image generation via Replicate',
        placeholder: 'r8_...',
    },
    {
        key: 'GOOGLE_CLIENT_ID',
        label: 'Google OAuth Client ID',
        description: 'For Google OAuth authentication',
        placeholder: '...apps.googleusercontent.com',
    },
    {
        key: 'GOOGLE_CLIENT_SECRET',
        label: 'Google OAuth Client Secret',
        description: 'For Google OAuth authentication',
        placeholder: 'GOCSPX-...',
    },
    {
        key: 'GOOGLE_REDIRECT_URI',
        label: 'Google OAuth Redirect URI',
        description: 'OAuth callback URL',
        placeholder: 'http://localhost:3000/api/auth/google/callback',
    },
]

export function ApiKeySettings() {
    const { toast } = useToast()
    const [keys, setKeys] = useState<Record<string, string>>({})
    const [editValues, setEditValues] = useState<Record<string, string>>({})
    const [visibility, setVisibility] = useState<Record<string, boolean>>({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [editing, setEditing] = useState<Record<string, boolean>>({})

    useEffect(() => {
        fetchKeys()
    }, [])

    const fetchKeys = async () => {
        try {
            const res = await fetch('/api/user/settings/api-keys')
            if (res.ok) {
                const data = await res.json()
                setKeys(data)
            }
        } catch (e) {
            console.error('Failed to fetch API keys:', e)
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (key: string) => {
        setEditing(prev => ({ ...prev, [key]: true }))
        setEditValues(prev => ({ ...prev, [key]: '' }))
    }

    const handleCancel = (key: string) => {
        setEditing(prev => ({ ...prev, [key]: false }))
        setEditValues(prev => {
            const next = { ...prev }
            delete next[key]
            return next
        })
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            // Build payload: only send keys that are being edited
            const payload: Record<string, string> = {}
            for (const field of API_KEY_FIELDS) {
                if (editing[field.key]) {
                    payload[field.key] = editValues[field.key] || ''
                }
            }

            const res = await fetch('/api/user/settings/api-keys', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to save')
            }

            toast({
                title: 'API Keys Updated',
                description: 'Your API keys have been saved securely.',
            })

            // Reset editing state and refresh
            setEditing({})
            setEditValues({})
            await fetchKeys()
        } catch (e: any) {
            toast({
                title: 'Error',
                description: e.message,
                variant: 'destructive',
            })
        } finally {
            setSaving(false)
        }
    }

    const handleClear = async (key: string) => {
        setSaving(true)
        try {
            const res = await fetch('/api/user/settings/api-keys', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [key]: '' }),
            })

            if (!res.ok) throw new Error('Failed to clear key')

            toast({ title: 'Key Removed', description: `${key} has been cleared.` })
            await fetchKeys()
            handleCancel(key)
        } catch (e: any) {
            toast({ title: 'Error', description: e.message, variant: 'destructive' })
        } finally {
            setSaving(false)
        }
    }

    const hasEdits = Object.values(editing).some(Boolean)

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                    API keys are stored encrypted in the database and override environment variables.
                    Leave a field empty to use the server&apos;s default environment variable instead.
                </AlertDescription>
            </Alert>

            <Card className="border-2 shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-600">
                            <Key className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle>API Keys & Integrations</CardTitle>
                            <CardDescription>
                                Configure your personal API keys for AI features and third-party services.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {API_KEY_FIELDS.map((field) => {
                        const currentValue = keys[field.key] || ''
                        const isEditing = editing[field.key]
                        const hasValue = currentValue && !currentValue.split('').every(c => c === '•' || c === '')

                        // Check if the stored value is non-empty (masked values have bullets)
                        const isSet = currentValue.length > 0

                        return (
                            <div key={field.key} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor={field.key} className="text-sm font-medium">
                                            {field.label}
                                        </Label>
                                        <p className="text-xs text-muted-foreground">{field.description}</p>
                                    </div>
                                    {isSet && !isEditing && (
                                        <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                                            Configured
                                        </span>
                                    )}
                                </div>

                                {isEditing ? (
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Input
                                                id={field.key}
                                                type={visibility[field.key] ? 'text' : 'password'}
                                                value={editValues[field.key] || ''}
                                                onChange={(e) => setEditValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                                                placeholder={field.placeholder}
                                                className="pr-10 font-mono text-sm"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                                onClick={() => setVisibility(prev => ({ ...prev, [field.key]: !prev[field.key] }))}
                                            >
                                                {visibility[field.key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => handleCancel(field.key)}>
                                            Cancel
                                        </Button>
                                        {isSet && (
                                            <Button variant="destructive" size="sm" onClick={() => handleClear(field.key)}>
                                                Clear
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <Input
                                            value={isSet ? currentValue : ''}
                                            disabled
                                            className="font-mono text-sm bg-muted"
                                            placeholder="Not configured"
                                        />
                                        <Button variant="outline" size="sm" onClick={() => handleEdit(field.key)}>
                                            {isSet ? 'Update' : 'Set'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </CardContent>
                {hasEdits && (
                    <CardFooter>
                        <Button onClick={handleSave} disabled={saving} className="gap-2">
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Save All Changes
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </div>
    )
}
