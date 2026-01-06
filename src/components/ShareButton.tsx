'use client'

import { useState } from 'react'
import { Share2, Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface ShareButtonProps extends React.ComponentProps<typeof Button> {
    title: string
    text?: string
    url?: string
}

export function ShareButton({ title, text, url, className, children, ...props }: ShareButtonProps) {
    const { toast } = useToast()
    const [copied, setCopied] = useState(false)

    const handleShare = async () => {
        const shareUrl = url || window.location.href
        const shareData = {
            title,
            text: text || title,
            url: shareUrl,
        }

        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData)
                return // Successfully shared via native
            } catch (error) {
                console.log('Error sharing:', error)
                // Fallback to copy
            }
        }

        // Fallback: Copy to clipboard
        try {
            await navigator.clipboard.writeText(shareUrl)
            setCopied(true)
            toast({
                title: "Link copied",
                description: "The URL has been copied to your clipboard.",
            })
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            toast({
                title: "Failed to copy",
                description: "Could not copy link to clipboard.",
                variant: "destructive",
            })
        }
    }

    return (
        <Button
            onClick={handleShare}
            className={cn("gap-2", className)}
            {...props}
        >
            {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
            {children || 'Share'}
        </Button>
    )
}
