'use client'

import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function PricingSection() {
    return (
        <section className="py-24 bg-slate-50" id="pricing">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Simple, Transparent Pricing</h2>
                        <p className="max-w-[900px] text-slate-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            Everything you need to run your hospital efficiently. No hidden fees.
                        </p>
                    </div>
                </div>
                <div className="mx-auto grid max-w-lg items-center gap-6 py-12 lg:grid-cols-1 lg:gap-12">
                    <div className="flex flex-col justify-center space-y-4 border bg-white p-8 shadow-lg rounded-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 text-sm font-medium rounded-bl-xl">
                            Best Value
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold">Enterprise Plan</h3>
                            <p className="text-slate-500">For hospitals of all sizes.</p>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold">$50,000</span>
                            <span className="text-slate-500">/ year</span>
                        </div>
                        <ul className="grid gap-2 py-4">
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-blue-600" />
                                <span className="text-slate-700">Unlimited Staff Accounts</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-blue-600" />
                                <span className="text-slate-700">Unlimited Patient Records</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-blue-600" />
                                <span className="text-slate-700">Advanced Analytics & Reporting</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-blue-600" />
                                <span className="text-slate-700">Role-Based Access Control</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-blue-600" />
                                <span className="text-slate-700">24/7 Priority Support</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-blue-600" />
                                <span className="text-slate-700">Secure Data Backup</span>
                            </li>
                        </ul>
                        <div className="pt-4">
                            <Link href="/register-hospital">
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg">
                                    Get Started Now
                                </Button>
                            </Link>
                        </div>
                        <p className="text-xs text-center text-slate-400 mt-4">
                            * Custom implementation and training included.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}
