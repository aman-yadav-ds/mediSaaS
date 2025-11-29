'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Loader2, User } from "lucide-react"
import { Patient } from '@/types'
import { Card, CardContent } from "@/components/ui/card"

interface PatientSearchProps {
    onSelectPatient: (patient: Patient) => void
}

export function PatientSearch({ onSelectPatient }: PatientSearchProps) {
    const [query, setQuery] = useState('')
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<Patient[]>([])
    const [searched, setSearched] = useState(false)
    const supabase = createClientComponentClient()

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!query.trim()) return

        setLoading(true)
        setSearched(true)

        // Get current user's hospital_id first
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile } = await supabase
            .from('profiles')
            .select('hospital_id')
            .eq('id', user.id)
            .single()

        if (profile?.hospital_id) {
            const { data } = await supabase
                .from('patients')
                .select('*')
                .eq('hospital_id', profile.hospital_id)
                .or(`full_name.ilike.%${query}%,aadhar_number.eq.${query}`)
                .limit(10)
                .returns<Patient[]>()

            if (data) {
                setResults(data)
            }
        }
        setLoading(false)
    }

    return (
        <div className="space-y-6">
            <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Search by Name or Aadhar Number..."
                        className="pl-9 bg-white"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
                <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                </Button>
            </form>

            <div className="space-y-2">
                {searched && results.length === 0 && !loading && (
                    <div className="text-center py-8 text-slate-500">
                        No patients found matching &quot;{query}&quot;
                    </div>
                )}

                {results.map((patient) => (
                    <Card
                        key={patient.id}
                        className="cursor-pointer hover:bg-slate-50 transition-colors"
                        onClick={() => onSelectPatient(patient)}
                    >
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-slate-900">{patient.full_name}</h3>
                                    <p className="text-sm text-slate-500">
                                        {patient.age} years • {patient.gender} • {patient.contact_number}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-slate-900">Aadhar: {patient.aadhar_number || '-'}</p>
                                <p className="text-xs text-slate-500">Registered: {new Date(patient.created_at).toLocaleDateString()}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
