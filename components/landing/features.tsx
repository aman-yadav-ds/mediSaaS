'use client'

import { motion } from "framer-motion"
import { ShieldCheck, Activity, Users, Zap, Lock, Globe } from "lucide-react"

const features = [
    {
        icon: ShieldCheck,
        title: "Enterprise Security",
        description: "Bank-grade encryption and Row Level Security ensure your patient data is isolated and protected.",
        color: "text-blue-600",
        bg: "bg-blue-50"
    },
    {
        icon: Activity,
        title: "Real-time Vitals",
        description: "Monitor patient health in real-time. Instant updates for doctors and nursing staff.",
        color: "text-red-600",
        bg: "bg-red-50"
    },
    {
        icon: Users,
        title: "Role-Based Access",
        description: "Dedicated portals for Hospital Owners, Doctors, Nurses, and Receptionists.",
        color: "text-green-600",
        bg: "bg-green-50"
    },
    {
        icon: Zap,
        title: "Lightning Fast",
        description: "Built on modern tech stack for instant page loads and seamless interactions.",
        color: "text-yellow-600",
        bg: "bg-yellow-50"
    },
    {
        icon: Lock,
        title: "HIPAA Ready",
        description: "Designed with compliance in mind. Audit logs, access controls, and data privacy.",
        color: "text-purple-600",
        bg: "bg-purple-50"
    },
    {
        icon: Globe,
        title: "Multi-Hospital",
        description: "Manage multiple branches or facilities from a single centralized dashboard.",
        color: "text-cyan-600",
        bg: "bg-cyan-50"
    }
]

export function FeaturesSection() {
    return (
        <section className="py-24 bg-white">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                        Everything you need to run a <br />
                        <span className="text-blue-600">Modern Hospital</span>
                    </h2>
                    <p className="text-slate-500 text-lg">
                        Powerful features designed to reduce administrative burden and improve patient outcomes.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="group p-8 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-xl transition-all duration-300"
                        >
                            <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                <feature.icon className={`h-6 w-6 ${feature.color}`} />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-900">{feature.title}</h3>
                            <p className="text-slate-500 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
