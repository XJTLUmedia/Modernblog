import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { setAuthCookies } from '@/lib/cookies'

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const code = searchParams.get('code')

        if (!code) {
            return NextResponse.json({ error: 'No authorization code provided' }, { status: 400 })
        }

        // Exchange code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                code,
                client_id: GOOGLE_CLIENT_ID!,
                client_secret: GOOGLE_CLIENT_SECRET!,
                redirect_uri: GOOGLE_REDIRECT_URI,
                grant_type: 'authorization_code',
            }),
        })

        const tokens = await tokenResponse.json()

        if (!tokenResponse.ok) {
            console.error('Token exchange failed:', tokens)
            return NextResponse.json({ error: 'Failed to exchange code for tokens' }, { status: 400 })
        }

        // Get user info from Google
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                Authorization: `Bearer ${tokens.access_token}`,
            },
        })

        const googleUser = await userInfoResponse.json()

        if (!userInfoResponse.ok) {
            console.error('Failed to get user info:', googleUser)
            return NextResponse.json({ error: 'Failed to get user information' }, { status: 400 })
        }

        console.log('Google user info:', googleUser)

        // Check if user exists by Google ID or email
        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { googleId: googleUser.id },
                    { email: googleUser.email },
                ],
            },
        })

        const envAdminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim()
        const isAdminEmail = googleUser.email.toLowerCase().trim() === envAdminEmail

        if (user) {
            // Update existing user with Google ID if not set
            if (!user.googleId) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        googleId: googleUser.id,
                        avatar: googleUser.picture,
                        name: user.name || googleUser.name,
                    },
                })
            }
        } else {
            // Create new user
            user = await prisma.user.create({
                data: {
                    email: googleUser.email,
                    name: googleUser.name,
                    avatar: googleUser.picture,
                    googleId: googleUser.id,
                    role: isAdminEmail ? 'admin' : 'user',
                },
            })
        }

        // Create response with redirect
        const response = NextResponse.redirect(new URL('/', request.url))

        // Set authentication cookies
        setAuthCookies(response, user)

        console.log('✅ Google OAuth login successful:', {
            id: user.id,
            email: user.email,
            role: user.role,
        })

        return response

    } catch (error: any) {
        console.error('🔥 Google OAuth error:', error)
        return NextResponse.redirect(new URL('/auth/login?error=oauth_failed', request.url))
    }
}
