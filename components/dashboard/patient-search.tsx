'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { Search, Loader2, UserPlus, Play } from "lucide-react"
import { PatientRegistrationForm } from "./patient-registration-form"
import { Patient } from '@/types'
import { useToast } from "@/components/ui/use-toast"

export function PatientSearch() {
    const [aadhar, setAadhar] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<Patient | Partial<Patient> | null>(null)
    const [searched, setSearched] = useState(false)
    const [mode, setMode] = useState<'search' | 'register'>('search')
    const [chiefComplaint, setChiefComplaint] = useState('')

    const supabase = createClientComponentClient()
    const router = useRouter()
    const { toast } = useToast()

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!aadhar) return

        setLoading(true)
        setResult(null)
        setSearched(false)
        setChiefComplaint('')

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

    const handleStartVisit = async () => {
        if (!result || !('id' in result)) return
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { data: profile } = await supabase
                .from('profiles')
                .select('hospital_id')
                .eq('id', user.id)
                .single()

            if (!profile?.hospital_id) throw new Error('No hospital found')

            const { error: visitError } = await supabase
                .from('visits')
                .insert({
                    hospital_id: profile.hospital_id,
                    patient_id: result.id,
                    status: 'waiting_vitals',
                    is_emergency: false,
                    chief_complaint: chiefComplaint || null
                })

            if (visitError) throw visitError

            toast({
                title: "Visit Started",
                description: `${result.full_name} added to waiting list.`
            })

            // Reset
            setResult(null)
            setSearched(false)
            setAadhar('')
            setChiefComplaint('')
            router.refresh()

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An error occurred'
            toast({
                title: "Error starting visit",
                description: errorMessage,
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    if (mode === 'register') {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                        {result ? 'Edit Patient Details' : 'Register Patient'}
                    </h2>
                    <Button variant="ghost" size="sm" onClick={() => {
                        setMode('search')
                        // Don't clear result if we were editing, just go back to view mode
                        if (!result) {
                            setSearched(false)
                            setAadhar('')
                        }
                    }} className="text-slate-500 hover:text-slate-900">
                        ← Back to Search
                    </Button>
                </div>
                <PatientRegistrationForm
                    initialData={result || undefined}
                    onSuccess={() => {
                        setMode('search')
                        // If we were editing, we want to keep the result but maybe refresh it?
                        // For simplicity, let's reset to search state to force a re-fetch or clean slate
                        // But user might want to start visit immediately.
                        // Ideally we should update 'result' with new data.
                        // For now, let's reset to avoid stale data issues.
                        setResult(null)
                        setSearched(false)
                        setAadhar('')
                        setChiefComplaint('')
                        router.refresh()
                        toast({
                            title: "Success",
                            description: "Patient details updated."
                        })
                    }}
                />
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
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setMode('register')}
                                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                >
                                    Edit Details
                                </Button>
                            </div>

                            <div className="mt-4 space-y-3">
                                <div>
                                    <label className="text-xs font-medium text-slate-500 uppercase mb-1 block">
                                        Chief Complaint / Reason for Visit
                                    </label>
                                    <Input
                                        placeholder="e.g., Fever, Headache, Stomach pain..."
                                        value={chiefComplaint}
                                        onChange={(e) => setChiefComplaint(e.target.value)}
                                        className="bg-white"
                                    />
                                </div>

                                <Button onClick={handleStartVisit} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200">
                                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                                    Start Visit
                                </Button>
                            </div>
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
