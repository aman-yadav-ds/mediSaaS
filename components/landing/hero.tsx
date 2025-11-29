'use client'

import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, CheckCircle2, Search, Bell, Menu, Users, Calendar, Activity, DollarSign, TrendingUp, MoreHorizontal } from "lucide-react"
import { useRef } from "react"

export function HeroSection() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    })

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
    const opacity = useTransform(scrollYProgress, [0.8, 1], [1, 0])

    // Mouse tilt effect
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
        const x = (e.clientX - left) / width - 0.5
        const y = (e.clientY - top) / height - 0.5
        mouseX.set(x)
        mouseY.set(y)
    }

    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), { damping: 15, stiffness: 100 })
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), { damping: 15, stiffness: 100 })

    return (
        <section ref={containerRef} className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-50">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-400/20 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-indigo-400/10 rounded-full blur-3xl -z-10" />

            <div className="container px-4 md:px-6 mx-auto">
                <div className="flex flex-col items-center text-center space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-4 max-w-3xl"
                    >
                        <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm text-blue-800 mb-4">
                            <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2"></span>
                            New: Multi-Hospital Support
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                            The Future of <br />
                            <span className="text-blue-600">Hospital Management</span>
                        </h1>
                        <p className="mx-auto max-w-[700px] text-slate-600 md:text-xl leading-relaxed">
                            Streamline patient care, manage staff, and track vitals in real-time.
                            The most secure and efficient platform for modern healthcare facilities.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex flex-col sm:flex-row gap-4"
                    >
                        <Link href="/register-hospital">
                            <Button size="lg" className="h-12 px-8 text-lg bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all hover:scale-105">
                                Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button variant="outline" size="lg" className="h-12 px-8 text-lg border-slate-300 hover:bg-white hover:text-blue-600 transition-all hover:scale-105">
                                Live Demo
                            </Button>
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="flex items-center gap-8 text-sm text-slate-500 pt-4"
                    >
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span>HIPAA Compliant</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span>99.9% Uptime</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span>24/7 Support</span>
                        </div>
                    </motion.div>

                    {/* 3D Dashboard Preview */}
                    <motion.div
                        style={{ y, opacity, rotateX, rotateY, perspective: 1000 }}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={() => {
                            mouseX.set(0)
                            mouseY.set(0)
                        }}
                        className="mt-20 relative w-full max-w-6xl mx-auto"
                    >
                        <div className="relative rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden aspect-[16/10] md:aspect-[21/9] group transform-gpu transition-shadow duration-500 hover:shadow-blue-500/20">
                            {/* Dashboard Header */}
                            <div className="h-14 border-b border-slate-100 bg-white flex items-center justify-between px-6">
                                <div className="flex items-center gap-4">
                                    <Menu className="w-5 h-5 text-slate-400" />
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">M</div>
                                        <span className="font-bold text-slate-700 hidden md:block">MediSaaS</span>
                                    </div>
                                </div>
                                <div className="flex-1 max-w-md mx-8 hidden md:block">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <div className="w-full h-9 bg-slate-50 rounded-md border border-slate-200 pl-10 flex items-center text-sm text-slate-400">Search patients, doctors...</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Bell className="w-5 h-5 text-slate-400" />
                                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200" />
                                </div>
                            </div>

                            <div className="flex h-full bg-slate-50/50">
                                {/* Sidebar */}
                                <div className="w-16 md:w-64 border-r border-slate-100 bg-white hidden md:flex flex-col py-6 gap-2">
                                    {[
                                        { icon: Users, label: "Patients", active: true },
                                        { icon: Calendar, label: "Appointments", active: false },
                                        { icon: Activity, label: "Vitals", active: false },
                                        { icon: DollarSign, label: "Billing", active: false },
                                    ].map((item, i) => (
                                        <div key={i} className={`flex items-center gap-3 px-6 py-3 border-l-4 ${item.active ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}>
                                            <item.icon className="w-5 h-5" />
                                            <span className="font-medium">{item.label}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Main Content */}
                                <div className="flex-1 p-6 md:p-8 overflow-hidden">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
                                            <p className="text-slate-500">Welcome back, Dr. Smith</p>
                                        </div>
                                        <div className="h-9 px-4 bg-white border border-slate-200 rounded-md flex items-center text-sm text-slate-600 shadow-sm">
                                            Today: Nov 29, 2025
                                        </div>
                                    </div>

                                    {/* Stats Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                        {[
                                            { label: "Total Patients", value: "1,284", change: "+12%", icon: Users, color: "blue" },
                                            { label: "Appointments", value: "42", change: "+5%", icon: Calendar, color: "purple" },
                                            { label: "Revenue", value: "$12,450", change: "+8%", icon: TrendingUp, color: "green" },
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className={`w-10 h-10 rounded-lg bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600`}>
                                                        <stat.icon className="w-5 h-5" />
                                                    </div>
                                                    <span className="text-xs font-medium bg-green-50 text-green-600 px-2 py-1 rounded-full">{stat.change}</span>
                                                </div>
                                                <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                                                <div className="text-sm text-slate-500">{stat.label}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Charts Section */}
                                    <div className="grid grid-cols-3 gap-6 h-full">
                                        <div className="col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm h-64">
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="font-semibold text-slate-800">Patient Analytics</h3>
                                                <MoreHorizontal className="w-5 h-5 text-slate-400" />
                                            </div>
                                            <div className="flex items-end justify-between gap-2 h-40 px-2">
                                                {[40, 70, 45, 90, 65, 85, 55, 75, 45, 60, 80, 50].map((h, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ height: 0 }}
                                                        whileInView={{ height: `${h}%` }}
                                                        viewport={{ once: true }}
                                                        transition={{ duration: 0.8, delay: i * 0.05 }}
                                                        className="w-full bg-blue-500/10 rounded-t-sm relative group"
                                                    >
                                                        <div className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-t-sm transition-all duration-500" style={{ height: '100%' }} />
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="col-span-1 bg-white p-6 rounded-xl border border-slate-100 shadow-sm h-64">
                                            <h3 className="font-semibold text-slate-800 mb-6">Recent Activity</h3>
                                            <div className="space-y-4">
                                                {[1, 2, 3].map((_, i) => (
                                                    <div key={i} className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100" />
                                                        <div className="flex-1">
                                                            <div className="h-2 w-20 bg-slate-200 rounded mb-1.5" />
                                                            <div className="h-1.5 w-12 bg-slate-100 rounded" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Elements */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1, duration: 0.5 }}
                            className="absolute -right-4 top-20 bg-white p-4 rounded-lg shadow-xl border border-slate-100 z-20 hidden lg:block"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <div className="font-semibold text-sm">Appointment Confirmed</div>
                                    <div className="text-xs text-slate-500">Just now</div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Reflection/Shadow */}
                        <div className="absolute -bottom-10 left-4 right-4 h-10 bg-blue-600/20 blur-3xl rounded-[100%]" />
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
