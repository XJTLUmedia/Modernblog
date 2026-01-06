import { NextResponse } from 'next/server'

export async function POST() {
    const response = NextResponse.json({ success: true })

    // Clear authentication cookies
    response.cookies.delete('user_id')
    response.cookies.delete('user_role')
    response.cookies.delete('is_admin')
    response.cookies.delete('user_name')
    response.cookies.delete('logged_in')

    return response
}
