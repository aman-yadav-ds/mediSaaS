'use client'

import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { useRef } from "react"

export function HeroSection() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    })

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
    const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9])
    const rotateX = useTransform(scrollYProgress, [0, 0.5], [0, 10])

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
                        style={{ y, opacity, scale, rotateX }}
                        className="mt-16 relative w-full max-w-5xl mx-auto [perspective:1000px]"
                    >
                        <div className="relative rounded-xl border border-slate-200 bg-white/50 backdrop-blur-sm shadow-2xl overflow-hidden aspect-[16/9] group">
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 z-10 pointer-events-none" />

                            {/* Mock UI Header */}
                            <div className="h-12 border-b border-slate-100 bg-white flex items-center px-4 gap-2">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-400" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                    <div className="w-3 h-3 rounded-full bg-green-400" />
                                </div>
                                <div className="ml-4 w-64 h-6 bg-slate-100 rounded-md" />
                            </div>

                            {/* Mock UI Body */}
                            <div className="p-6 grid grid-cols-4 gap-6 h-full bg-slate-50/50">
                                <div className="col-span-1 space-y-4">
                                    <div className="h-24 bg-white rounded-lg shadow-sm border border-slate-100" />
                                    <div className="h-24 bg-white rounded-lg shadow-sm border border-slate-100" />
                                    <div className="h-24 bg-white rounded-lg shadow-sm border border-slate-100" />
                                </div>
                                <div className="col-span-3 space-y-4">
                                    <div className="h-64 bg-white rounded-lg shadow-sm border border-slate-100 p-4">
                                        <div className="w-full h-full bg-blue-50/50 rounded flex items-end justify-between p-4 gap-2">
                                            {[40, 70, 50, 90, 60, 80, 50].map((h, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${h}%` }}
                                                    transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                                                    className="w-full bg-blue-500/80 rounded-t-sm"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="h-32 bg-white rounded-lg shadow-sm border border-slate-100" />
                                        <div className="h-32 bg-white rounded-lg shadow-sm border border-slate-100" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Reflection/Shadow */}
                        <div className="absolute -bottom-10 left-4 right-4 h-10 bg-black/20 blur-2xl rounded-[100%]" />
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
