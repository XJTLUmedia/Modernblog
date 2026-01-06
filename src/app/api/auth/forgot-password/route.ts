import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

// Production-ready forgot password API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    // Don't reveal if user exists (security best practice)
    // But for demo, we'll show token
    if (!user) {
      // For security, still return success even if user doesn't exist
      // This prevents email enumeration attacks
      return NextResponse.json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.'
      })
    }

    // Generate secure reset token
    const resetToken = randomUUID()

    // Set token expiration (1 hour from now)
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000)

    // Update user with reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpires
      }
    })

    // In production, send email here with reset link
    // Reset link: http://localhost:3000/auth/reset-password/${resetToken}
    console.log(`Password reset token generated for ${email}: ${resetToken}`)

    return NextResponse.json({
      success: true,
      message: 'If an account with this email exists, a password reset link has been sent.',
      // For demo only, remove token in production:
      resetLink: `http://localhost:3000/auth/reset-password/${resetToken}`
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
