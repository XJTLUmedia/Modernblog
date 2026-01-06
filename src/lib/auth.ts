import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Verify if the user is an admin by checking cookies first,
 * then falling back to database check if cookies are stale
 */
export async function verifyAdmin(request: NextRequest): Promise<{ isAdmin: boolean; userId: string | null }> {
  const userId = request.cookies.get('user_id')?.value
  const isAdminCookie = request.cookies.get('is_admin')?.value
  const userRoleCookie = request.cookies.get('user_role')?.value

  if (!userId) {
    return { isAdmin: false, userId: null }
  }

  // If cookies say admin, trust them (fast path)
  if (isAdminCookie === 'true' || userRoleCookie === 'admin') {
    return { isAdmin: true, userId }
  }

  // Cookies might be stale, check database (fallback)
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true }
    })

    if (!user) {
      return { isAdmin: false, userId }
    }

    const envAdminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim()
    const roleIsAdmin = user.role?.toLowerCase().trim() === 'admin'
    const emailIsAdmin = user.email.toLowerCase().trim() === envAdminEmail

    const isAdmin = roleIsAdmin || emailIsAdmin


    if (!isAdmin) {
      // Access denied
    }

    return { isAdmin, userId }
  } catch (error) {
    return { isAdmin: false, userId }
  }
}

/**
 * Verify if the user is authenticated.
 * Returns the user object (id, email, role) if authenticated, null otherwise.
 */
export async function verifyAuth(request: NextRequest) {
  const userId = request.cookies.get('user_id')?.value

  if (!userId) {
    return null
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, name: true }
    })
    return user
  } catch (error) {
    console.error('Error verifying auth:', error)
    return null
  }
}

