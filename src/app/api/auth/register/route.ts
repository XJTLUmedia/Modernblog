import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { setAuthCookies } from '@/lib/cookies'

// Production-ready register API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password with bcrypt (saltRounds: 10)
    const hashedPassword = await bcrypt.hash(password, 10)

    // Determine role based on email
    const role = email.toLowerCase() === (process.env.ADMIN_EMAIL || '').toLowerCase().trim() ? 'admin' : 'subscriber'

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        password: hashedPassword,
        role
      }
    })

    // Create response with cookies
    const response = NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        isAdmin: user.role === 'admin'
      }
    })

    // Set cookies for authentication
    setAuthCookies(response, user)

    return response
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
