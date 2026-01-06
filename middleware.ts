import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple auth middleware
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const loginPath = '/auth/login'

  // 1. Allow public auth routes (login, signup, etc.)
  if (pathname.startsWith('/auth')) {
    return NextResponse.next()
  }

  // 2. Protect ALL admin routes
  if (pathname.startsWith('/admin')) {
    const userId = request.cookies.get('user_id')?.value
    const userRole = request.cookies.get('user_role')?.value
    const isAdmin = request.cookies.get('is_admin')?.value === 'true'

    // If not logged in at all, redirect to login
    if (!userId) {
      return NextResponse.redirect(new URL(loginPath, request.url))
    }

    // If logged in but not an admin, redirect to home or unauthorized
    // Note: We check both the role AND the explicitly set is_admin cookie for robustness
    if (userRole !== 'admin' && !isAdmin) {
      // Redirect to home or show an error. Redirecting back to /admin/authorized is also an option
      // but here we just send them to the home page to avoid loops if they keep trying admin
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/auth/:path*',
    '/api/auth/:path*'
  ]
}
