import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { setAuthCookies } from '@/lib/cookies'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const emailRaw = body?.email
    const passwordRaw = body?.password

    const email = typeof emailRaw === 'string' ? emailRaw.toLowerCase().trim() : ''
    const password = typeof passwordRaw === 'string' ? passwordRaw : ''

    console.log('--- Login Attempt Start ---')
    console.log('Email received:', email)

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // 1. Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      console.log('❌ DEBUG: User not found in database.')
      return NextResponse.json({ error: 'Invalid email' }, { status: 401 })
    }

    console.log('✅ DEBUG: User found. Hashed password in DB:', user.password)

    // 2. Check Password
    // If the user has no password (e.g., created via Google OAuth), block password login
    if (!user.password) {
      console.log('❌ DEBUG: User has no password set (likely OAuth account).')
      return NextResponse.json(
        { error: 'This account uses Google sign-in. Please sign in with Google.' },
        { status: 401 }
      )
    }

    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
      console.log('❌ DEBUG: Bcrypt compare failed. Password does not match.')
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    console.log('🚀 DEBUG: Success! Password matches.')

    const envAdminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim()
    const isAdmin =
      (user.role?.toLowerCase().trim() === 'admin') || (user.email.toLowerCase().trim() === envAdminEmail)

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        isAdmin: isAdmin,
      },
    })

    // Set all required authentication cookies
    setAuthCookies(response, user)

    console.log('✅ Cookies set for user:', {
      id: user.id,
      email: user.email,
      role: user.role,
      isAdmin: user.role === 'admin',
    })

    return response
  } catch (error: any) {
    console.error('🔥 SERVER CRASH:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
