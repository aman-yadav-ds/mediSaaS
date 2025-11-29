'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Users,
    Stethoscope,
    ClipboardList,
    Building2,
    BarChart3,
    Settings,
    Receipt,
    FileText,
    ChevronLeft,
    ChevronRight
} from 'lucide-react'
import { useState } from 'react'
import { SignOutButton } from "@/components/dashboard/sign-out-button"

interface SidebarProps {
    role: string
    fullName: string
}

export function Sidebar({ role, fullName }: SidebarProps) {
    const pathname = usePathname()
    const [isCollapsed, setIsCollapsed] = useState(false)

    const links = [
        // Common
        {
            href: '/dashboard',
            label: 'Dashboard',
            icon: LayoutDashboard,
            roles: ['owner'] // Explicitly for owner, others have specific dashboards
        },
        // Owner
        {
            href: '/dashboard/staff',
            label: 'Staff Management',
            icon: Users,
            roles: ['owner']
        },
        {
            href: '/dashboard/patients',
            label: 'Patients',
            icon: ClipboardList,
            roles: ['owner']
        },
        {
            href: '/dashboard/analytics',
            label: 'Analytics',
            icon: BarChart3,
            roles: ['owner']
        },
        {
            href: '/dashboard/settings',
            label: 'Settings',
            icon: Settings,
            roles: ['owner']
        },
        {
            href: '/dashboard/reports',
            label: 'Reports',
            icon: FileText,
            roles: ['owner']
        },
        // Receptionist
        {
            href: '/dashboard/reception',
            label: 'Reception',
            icon: ClipboardList,
            roles: ['receptionist']
        },

        // Nurse
        {
            href: '/dashboard/nurse',
            label: 'Nurse Station',
            icon: Stethoscope,
            roles: ['nurse']
        },
        {
            href: '/dashboard/nurse/history',
            label: 'History',
            icon: ClipboardList,
            roles: ['nurse']
        },
        // Doctor
        {
            href: '/dashboard/doctor',
            label: 'Doctor Portal',
            icon: Stethoscope,
            roles: ['doctor']
        },

        {
            href: '/dashboard/doctor/patients',
            label: 'Patients',
            icon: Users,
            roles: ['doctor']
        },
        {
            href: '/dashboard/doctor/history',
            label: 'History',
            icon: ClipboardList,
            roles: ['doctor']
        },
        {
            href: '/dashboard/billing',
            label: 'Billing',
            icon: Receipt,
            roles: ['owner', 'receptionist']
        },
    ]

    const filteredLinks = links.filter(link => link.roles.includes(role))

    return (
        <aside
            className={cn(
                "bg-white border-r border-slate-200 flex flex-col h-full shadow-sm z-10 transition-all duration-300 ease-in-out relative",
                isCollapsed ? "w-20" : "w-64"
            )}
        >
            {/* Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-9 bg-white border border-slate-200 rounded-full p-1 shadow-sm hover:bg-slate-50 text-slate-500 z-50"
            >
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            <div className={cn("p-6 border-b border-slate-100 flex items-center gap-2", isCollapsed && "justify-center p-4")}>
                <div className="bg-blue-600 p-1.5 rounded-lg flex-shrink-0">
                    <Building2 className="w-5 h-5 text-white" />
                </div>
                {!isCollapsed && (
                    <span className="font-bold text-lg text-slate-900 whitespace-nowrap overflow-hidden">
                        MediSaaS
                    </span>
                )}
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto overflow-x-hidden">
                {filteredLinks.map((link) => {
                    const isActive = pathname === link.href
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                                isActive
                                    ? "text-blue-600 bg-blue-50 font-medium"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                                isCollapsed && "justify-center px-2"
                            )}
                            title={isCollapsed ? link.label : undefined}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="active-pill"
                                    className="absolute left-0 w-1 h-6 bg-blue-600 rounded-r-full"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.2 }}
                                />
                            )}
                            <link.icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
                            {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">{link.label}</span>}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <div className={cn("flex items-center gap-3 px-3 py-2 mb-2", isCollapsed && "justify-center px-0")}>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium shadow-md flex-shrink-0">
                        {fullName?.[0] || 'U'}
                    </div>
                    {!isCollapsed && (
                        <div className="flex-1 min-w-0 overflow-hidden">
                            <p className="text-sm font-semibold text-slate-900 truncate">{fullName}</p>
                            <p className="text-xs text-slate-500 capitalize truncate">{role}</p>
                        </div>
                    )}
                </div>
                <SignOutButton collapsed={isCollapsed} />
            </div>
        </aside>
    )
}
