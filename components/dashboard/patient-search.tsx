'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Loader2, UserPlus } from "lucide-react"
import { PatientRegistrationForm } from "./patient-registration-form"

export function PatientSearch() {
    const [aadhar, setAadhar] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [searched, setSearched] = useState(false)
    const [mode, setMode] = useState<'search' | 'register'>('search')

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!aadhar) return

        setLoading(true)
        setResult(null)
        setSearched(false)

        try {
            const res = await fetch(`/api/patients/search?aadhar=${aadhar}`)
            const data = await res.json()

            if (data.patient) {
                setResult(data.patient)
            }
        } catch (error) {
            console.error('Search failed', error)
        } finally {
            setLoading(false)
            setSearched(true)
        }
    }

    if (mode === 'register') {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Register Patient</h2>
                    <Button variant="ghost" size="sm" onClick={() => {
                        setMode('search')
                        setResult(null)
                        setSearched(false)
                        setAadhar('')
                    }} className="text-slate-500 hover:text-slate-900">
                        ← Back to Search
                    </Button>
                </div>
                <PatientRegistrationForm initialData={result} />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Enter 12-digit Aadhar Number"
                            value={aadhar}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 12)
                                setAadhar(value)
                            }}
                            required
                            minLength={12}
                            maxLength={12}
                            className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                        />
                    </div>
                    <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-200">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
                    </Button>
                </form>
            </div>

            {searched && (
                <div className="space-y-4">
                    {result ? (
                        <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-4 transition-all animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-slate-900">{result.full_name}</h3>
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wide">Found</span>
                                    </div>
                                    <div className="text-sm text-slate-600 flex flex-col gap-0.5">
                                        <span>Age: {result.age} • {result.gender}</span>
                                        <span>Ph: {result.contact_number}</span>
                                    </div>
                                </div>
                            </div>
                            <Button onClick={() => setMode('register')} className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200">
                                <UserPlus className="w-4 h-4 mr-2" />
                                Start Visit
                            </Button>
                        </div>
                    ) : (
                        <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 animate-in fade-in zoom-in-95">
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <UserPlus className="w-5 h-5 text-slate-400" />
                            </div>
                            <p className="text-sm font-medium text-slate-900">Patient not found</p>
                            <p className="text-xs text-slate-500 mb-4">No record found for this Aadhar number.</p>
                            <Button variant="outline" onClick={() => {
                                setResult({ aadhar_number: aadhar }) // Pass aadhar to form
                                setMode('register')
                            }} className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800">
                                Create New Patient
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
