/**
 * Production-ready email utility wrapper.
 * In development/scaffold mode, it logs to the console.
 * In production, it uses the provided EMAIL_API_KEY.
 */

export async function sendEmail({ to, subject, content }: { to: string; subject: string; content: string }) {
    const apiKey = process.env.EMAIL_API_KEY

    if (!apiKey) {
        console.log('--- EMAIL SIMULATION ---')
        console.log(`To: ${to}`)
        console.log(`Subject: ${subject}`)
        console.log(`Content: ${content}`)
        console.log('------------------------')
        return { success: true, message: 'Email logged to console (no API key configured)' }
    }

    // Example implementation for an email service (like Resend)
    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'Modern Blog <onboarding@resend.dev>',
                to: [to],
                subject: subject,
                html: content
            })
        })

        const data = await response.json()
        return { success: response.ok, data }
    } catch (error) {
        console.error('Email service error:', error)
        return { success: false, error: 'Failed to send email' }
    }
}
