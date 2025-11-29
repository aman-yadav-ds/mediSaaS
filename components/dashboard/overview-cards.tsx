'use client'

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Stethoscope, ClipboardList, TrendingUp } from 'lucide-react'

interface OverviewCardsProps {
    patientCount: number
    doctorCount: number
    nurseCount: number
    receptionistCount: number
}

export function OverviewCards({ patientCount, doctorCount, nurseCount, receptionistCount }: OverviewCardsProps) {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    }

    const cards = [
        {
            title: "Total Patients",
            value: patientCount,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-100",
            trend: "+12% from last month"
        },
        {
            title: "Doctors",
            value: doctorCount,
            icon: Stethoscope,
            color: "text-emerald-600",
            bg: "bg-emerald-100",
            trend: "+2 new this month"
        },
        {
            title: "Nurses",
            value: nurseCount,
            icon: Stethoscope,
            color: "text-purple-600",
            bg: "bg-purple-100",
            trend: "Fully staffed"
        },
        {
            title: "Receptionists",
            value: receptionistCount,
            icon: ClipboardList,
            color: "text-orange-600",
            bg: "bg-orange-100",
            trend: "Active now"
        }
    ]

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
            {cards.map((card, index) => (
                <motion.div key={index} variants={item}>
                    <Card className="border-none shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">{card.title}</CardTitle>
                            <div className={`p-2 rounded-lg ${card.bg}`}>
                                <card.icon className={`h-4 w-4 ${card.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{card.value}</div>
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3 text-green-500" />
                                {card.trend}
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </motion.div>
    )
}
