'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Building2, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"

export default function RegisterHospitalPage() {
    const [hospitalName, setHospitalName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const router = useRouter()

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // Call API to create user, hospital, and profile
            const res = await fetch('/api/register-hospital', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    hospitalName,
                    email,
                    password,
                    fullName
                }),
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || 'Failed to register hospital')
            }

            // Registration successful
            setSuccess(true)
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'An error occurred'
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <Card className="w-full max-w-md border-green-200 shadow-lg shadow-green-100">
                    <CardHeader>
                        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                        </div>
                        <CardTitle className="text-green-600 text-center text-2xl">Registration Successful</CardTitle>
                        <CardDescription className="text-center text-base">
                            Your hospital workspace has been created. You can now log in to your dashboard.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button className="w-full h-11 bg-green-600 hover:bg-green-700 text-lg" onClick={() => router.push('/login')}>
                            Go to Login
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Left Side - Branding & Testimonial */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-12 text-white">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 z-0" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl -z-10" />

                <div className="relative z-10">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 p-1.5 rounded-lg">
                            <Building2 className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold">MediSaaS</span>
                    </div>
                </div>

                <div className="relative z-10 space-y-6 max-w-lg">
                    <h2 className="text-4xl font-bold leading-tight">
                        Join thousands of modern healthcare facilities.
                    </h2>
                    <ul className="space-y-4 text-lg text-slate-300">
                        <li className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                            </div>
                            Instant setup, no credit card required
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                            </div>
                            HIPAA compliant infrastructure
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                            </div>
                            24/7 dedicated support
                        </li>
                    </ul>
                </div>

                <div className="relative z-10 text-sm text-slate-500">
                    © 2024 MediSaaS Inc. All rights reserved.
                </div>
            </div>

            {/* Right Side - Registration Form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md space-y-8"
                >
                    <div className="text-center lg:text-left">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Get started</h1>
                        <p className="mt-2 text-slate-600">
                            Create your hospital workspace in seconds.
                        </p>
                    </div>

                    <Card className="border-slate-200 shadow-xl shadow-slate-200/50">
                        <form onSubmit={handleRegister}>
                            <CardContent className="space-y-4 pt-6">
                                {error && (
                                    <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                        {error}
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="hospitalName">Hospital Name</Label>
                                    <Input
                                        id="hospitalName"
                                        placeholder="General Hospital"
                                        value={hospitalName}
                                        onChange={(e) => setHospitalName(e.target.value)}
                                        required
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Owner Full Name</Label>
                                    <Input
                                        id="fullName"
                                        placeholder="Dr. John Doe"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="admin@hospital.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
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
                            <CardFooter className="flex flex-col gap-4">
                                <Button className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-lg" type="submit" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Workspace
                                </Button>
                                <div className="text-sm text-center text-slate-500">
                                    Already have an account?{' '}
                                    <a href="/login" className="text-blue-600 hover:underline font-medium">
                                        Sign In
                                    </a>
                                </div>
                            </CardFooter>
                        </form>
                    </Card>
                </motion.div>
            </div>
        </div >
    )
}
