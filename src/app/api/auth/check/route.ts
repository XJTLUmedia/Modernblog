import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { setAuthCookies } from '@/lib/cookies'

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get('user_id')?.value
    const userRoleCookie = request.cookies.get('user_role')?.value
    const isAdminCookie = request.cookies.get('is_admin')?.value
    const userName = request.cookies.get('user_name')?.value
    const isLoggedIn = request.cookies.get('logged_in')?.value

    if (!userId) {
      return NextResponse.json({
        authenticated: false,
        user: null,
        isAdmin: false
      })
    }

    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({
        authenticated: false,
        user: null,
        isAdmin: false
      })
    }

    const envAdminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim()
    const roleIsAdmin = String(user.role).toLowerCase().trim() === 'admin'
    const emailIsAdminBypass = user.email.toLowerCase().trim() === envAdminEmail

    const userIsAdmin = roleIsAdmin || emailIsAdminBypass

    // Check if cookies are stale
    const cookieMismatch =
      userRoleCookie !== user.role ||
      isAdminCookie !== String(userIsAdmin) ||
      userName !== user.name

    const payload = {
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isAdmin: userIsAdmin
      },
      isAdmin: userIsAdmin,
      isLoggedIn: true
    }

    const response = NextResponse.json(payload)

    // If cookies are stale, refresh them
    if (cookieMismatch) {
      setAuthCookies(response, user)
    }

    return response
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
