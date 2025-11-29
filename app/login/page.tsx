'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Loader2, Building2 } from "lucide-react"
import { motion } from "framer-motion"

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClientComponentClient()

    // Handle implicit flow (hash fragment) login

    useEffect(() => {
        const handleHashLogin = async () => {
            // Check for hash in URL (implicit flow)
            if (typeof window !== 'undefined' && window.location.hash && window.location.hash.includes('access_token')) {
                setLoading(true)


                // Parse hash manually
                const hash = window.location.hash.substring(1)
                const params = new URLSearchParams(hash)
                const accessToken = params.get('access_token')
                const refreshToken = params.get('refresh_token')

                if (accessToken && refreshToken) {
                    try {
                        const { data, error } = await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken,
                        })

                        if (error) {
                            console.error('Login: Error setting session from hash', error)
                            setError('Failed to log in from link')
                            setLoading(false)
                        } else if (data.session) {
                            router.replace('/dashboard')
                            return
                        }
                    } catch (e) {
                        console.error('Login: Exception setting session', e)
                    }
                }
            }
        }

        handleHashLogin()

        const checkSession = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                router.replace('/dashboard')
            }
        }

        checkSession()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' || session) {
                router.replace('/dashboard')
            }
        })

        return () => subscription.unsubscribe()
    }, [supabase, router])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                throw error
            }

            router.push('/dashboard')
            // router.refresh()
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message)
            } else {
                setError('An unknown error occurred')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Left Side - Branding & Testimonial */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-12 text-white">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 z-0" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl -z-10" />

                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-2 w-fit hover:opacity-90 transition-opacity">
                        <div className="bg-blue-600 p-1.5 rounded-lg">
                            <Building2 className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold">MediSaaS</span>
                    </Link>
                </div>

                <div className="relative z-10 space-y-6 max-w-lg">
                    <h2 className="text-4xl font-bold leading-tight">
                        Manage your hospital with confidence and security.
                    </h2>
                    <p className="text-slate-400 text-lg">
                        &quot;MediSaaS has revolutionized how we handle patient data. The security and ease of use are unmatched.&quot;
                    </p>
                    <div className="flex items-center gap-4 pt-4">
                        <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-xl font-bold">
                            JD
                        </div>
                        <div>
                            <div className="font-semibold">Dr. John Doe</div>
                            <div className="text-sm text-slate-500">Chief Medical Officer</div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-sm text-slate-500">
                    © 2024 MediSaaS Inc. All rights reserved.
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md space-y-8"
                >
                    <div className="text-center lg:text-left">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back</h1>
                        <p className="mt-2 text-slate-600">
                            Enter your credentials to access your account.
                        </p>
                    </div>

                    <Card className="border-slate-200 shadow-xl shadow-slate-200/50">
                        <form onSubmit={handleLogin}>
                            <CardContent className="space-y-4 pt-6">
                                {error && (
                                    <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                        {error}
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="doctor@hospital.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">Password</Label>
                                        <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">Forgot password?</a>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="h-11"
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col space-y-4 pb-6">
                                <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-lg" disabled={loading}>
                                    {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                                    Sign In
                                </Button>
                                <div className="text-sm text-center text-slate-500">
                                    Don&apos;t have an account?{' '}
                                    <a href="/register-hospital" className="text-blue-600 hover:underline font-medium">
                                        Register New Hospital
                                    </a>
                                </div>
                            </CardFooter>
                        </form>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
}
