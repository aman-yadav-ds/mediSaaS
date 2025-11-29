'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Calendar, Stethoscope, Pill } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface PatientHistoryProps {
    patientId: string
    currentVisitId: string
}

export function PatientHistory({ patientId, currentVisitId }: PatientHistoryProps) {
    const [history, setHistory] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClientComponentClient()

    useEffect(() => {
        const fetchHistory = async () => {
            const { data, error } = await supabase
                .from('visits')
                .select(`
                    *,
                    prescriptions (
                        diagnosis,
                        medications,
                        notes
                    ),
                    profiles:doctor_id (
                        full_name
                    )
                `)
                .eq('patient_id', patientId)
                .neq('id', currentVisitId) // Exclude current visit
                .order('visit_date', { ascending: false })

            if (!error && data) {
                setHistory(data)
            }
            setLoading(false)
        }

        if (patientId) {
            fetchHistory()
        }
    }, [patientId, currentVisitId, supabase])

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
    }

    if (history.length === 0) {
        return (
            <div className="text-center p-8 text-slate-500 border-2 border-dashed border-slate-200 rounded-lg">
                No previous history found for this patient.
            </div>
        )
    }

    return (
        <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-6">
                {history.map((visit) => (
                    <Card key={visit.id} className="border-slate-200 shadow-sm">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    {new Date(visit.visit_date).toLocaleDateString()}
                                </div>
                                <Badge variant="outline" className="bg-white">
                                    {visit.profiles?.full_name || 'Unknown Doctor'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            {/* Vitals */}
                            <div className="grid grid-cols-4 gap-2 text-xs">
                                <div className="bg-slate-50 p-2 rounded">
                                    <span className="text-slate-500 block">BP</span>
                                    <span className="font-medium">{visit.blood_pressure || '-'}</span>
                                </div>
                                <div className="bg-slate-50 p-2 rounded">
                                    <span className="text-slate-500 block">HR</span>
                                    <span className="font-medium">{visit.heart_rate || '-'} bpm</span>
                                </div>
                                <div className="bg-slate-50 p-2 rounded">
                                    <span className="text-slate-500 block">Temp</span>
                                    <span className="font-medium">{visit.temperature || '-'} °F</span>
                                </div>
                                <div className="bg-slate-50 p-2 rounded">
                                    <span className="text-slate-500 block">O2</span>
                                    <span className="font-medium">{visit.oxygen_level || '-'} %</span>
                                </div>
                            </div>

                            {/* Prescription Details */}
                            {visit.prescriptions && visit.prescriptions.length > 0 ? (
                                visit.prescriptions.map((prescription: any, idx: number) => (
                                    <div key={idx} className="space-y-3 border-t border-slate-100 pt-3">
                                        <div>
                                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-1">
                                                <Stethoscope className="w-4 h-4 text-blue-500" />
                                                Diagnosis
                                            </div>
                                            <p className="text-sm text-slate-600 pl-6">{prescription.diagnosis}</p>
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2">
                                                <Pill className="w-4 h-4 text-emerald-500" />
                                                Medications
                                            </div>
                                            <div className="pl-6 space-y-1">
                                                {prescription.medications?.map((med: any, mIdx: number) => (
                                                    <div key={mIdx} className="text-sm text-slate-600 flex justify-between border-b border-slate-50 last:border-0 pb-1 last:pb-0">
                                                        <span className="font-medium">{med.name}</span>
                                                        <span className="text-slate-400">{med.dosage} • {med.frequency} • {med.duration}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {prescription.notes && (
                                            <div className="text-xs text-slate-500 italic bg-yellow-50 p-2 rounded border border-yellow-100">
                                                Note: {prescription.notes}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm text-slate-400 italic text-center py-2">
                                    No prescription recorded.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </ScrollArea>
    )
}
