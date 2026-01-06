import { NextResponse } from 'next/server'
import { User } from '@prisma/client'

/**
 * Set authentication cookies on a response
 */
export function setAuthCookies(response: NextResponse, user: User): void {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/', // Ensure cookies are available across all routes
    maxAge: 60 * 60 * 24 * 7 // 7 days
  }

  const envAdminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim()
  const isAdmin = (user.role?.toLowerCase().trim() === 'admin') || (user.email.toLowerCase().trim() === envAdminEmail)

  response.cookies.set('user_id', user.id, cookieOptions)
  response.cookies.set('user_role', user.role || 'user', cookieOptions)
  response.cookies.set('is_admin', String(isAdmin), cookieOptions)
  response.cookies.set('user_name', user.name || '', cookieOptions)
  response.cookies.set('logged_in', 'true', cookieOptions)
}

