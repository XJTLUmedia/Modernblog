'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cake, Sparkles, PartyPopper } from 'lucide-react'

export function BirthdayGreeting() {
    const [isBirthday, setIsBirthday] = useState(false)

    useEffect(() => {
        const checkBirthday = async () => {
            try {
                // We'll use the public endpoints for settings if available, or just fetch
                const res = await fetch('/api/admin/settings') // Note: This might need a public alternative if non-admins visit
                if (res.ok) {
                    const settings = await res.json()
                    if (settings.birthday) {
                        const bday = new Date(settings.birthday)
                        const today = new Date()
                        if (bday.getMonth() === today.getMonth() && bday.getDate() === today.getDate()) {
                            setIsBirthday(true)
                        }
                    }
                }
            } catch (error) {
                console.error('Error checking birthday:', error)
            }
        }
        checkBirthday()
    }, [])

    if (!isBirthday) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                className="relative mb-12 inline-flex items-center gap-4 px-8 py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-pink-500/40 border border-white/20 select-none group"
            >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-[-20deg]" />
                <PartyPopper className="h-5 w-5 animate-bounce" />
                <span className="relative z-10">Celebrating Current Rotation: It is my Birthday!</span>
                <Cake className="h-5 w-5 animate-pulse" />

                {/* Decorative particles (simulated) */}
                <div className="absolute -top-1 -right-1 flex">
                    <div className="w-4 h-4 bg-pink-500 rounded-full animate-ping opacity-75" />
                    <div className="absolute inset-0 w-4 h-4 bg-purple-500 rounded-full animate-ping opacity-75 delay-300" />
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
