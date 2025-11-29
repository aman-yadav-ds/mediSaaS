'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Building2 } from "lucide-react"
import { motion } from "framer-motion"

export function LandingNavbar() {
    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 left-0 right-0 z-50 flex items-center px-6 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/50"
        >
            <Link className="flex items-center justify-center gap-2" href="#">
                <div className="bg-blue-600 p-1.5 rounded-lg">
                    <Building2 className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
                    MediSaaS
                </span>
            </Link>
            <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
                <Link className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors" href="/login">
                    Login
                </Link>
                <Link href="/register-hospital">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20">
                        Get Started
                    </Button>
                </Link>
            </nav>
        </motion.header>
    )
}
