'use client'

import { useState, useEffect } from 'react'

export interface User {
    id: string
    email: string
    name: string | null
    role: string
    isAdmin: boolean
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [authenticated, setAuthenticated] = useState(false)

    const checkAuth = async () => {
        try {
            const res = await fetch('/api/auth/check', { cache: 'no-store' })
            if (res.ok) {
                const data = await res.json()
                if (data.authenticated) {
                    setUser(data.user)
                    setAuthenticated(true)
                } else {
                    setUser(null)
                    setAuthenticated(false)
                }
            }
        } catch (error) {
            console.error('Failed to check auth:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        checkAuth()
    }, [])

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' })
            setUser(null)
            setAuthenticated(false)
            window.location.href = '/'
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    return { user, loading, authenticated, logout, refresh: checkAuth }
}
