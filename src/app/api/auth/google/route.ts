import { NextRequest, NextResponse } from 'next/server'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback'

export async function GET(request: NextRequest) {
    // Build Google OAuth URL
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')

    googleAuthUrl.searchParams.append('client_id', GOOGLE_CLIENT_ID!)
    googleAuthUrl.searchParams.append('redirect_uri', GOOGLE_REDIRECT_URI)
    googleAuthUrl.searchParams.append('response_type', 'code')
    googleAuthUrl.searchParams.append('scope', 'openid email profile')
    googleAuthUrl.searchParams.append('access_type', 'online')
    googleAuthUrl.searchParams.append('prompt', 'select_account')

    return NextResponse.redirect(googleAuthUrl.toString())
}
