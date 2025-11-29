'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar, FileText, Activity, Pill } from "lucide-react"
import { Patient, Visit, Prescription, Vital } from '@/types'
import { Separator } from "@/components/ui/separator"

interface PatientHistoryProps {
    patient: Patient
    onBack: () => void
}

interface VisitWithDetails extends Visit {
    prescription?: Prescription
    vitals?: Vital
}

export function PatientHistory({ patient, onBack }: PatientHistoryProps) {
    const [loading, setLoading] = useState(true)
    const [history, setHistory] = useState<VisitWithDetails[]>([])
    const supabase = createClientComponentClient()

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true)

            // Fetch visits
            const { data: visitsData } = await supabase
                .from('visits')
                .select('*')
                .eq('patient_id', patient.id)
                .order('visit_date', { ascending: false })
                .returns<Visit[]>()

            if (visitsData) {
                // Fetch prescriptions for these visits
                const { data: prescriptionsData } = await supabase
                    .from('prescriptions')
                    .select('*')
                    .eq('patient_id', patient.id)
                    .returns<Prescription[]>()

                // Fetch vitals for these visits
                const { data: vitalsData } = await supabase
                    .from('vitals')
                    .select('*')
                    .in('visit_id', visitsData.map(v => v.id))
                    .returns<Vital[]>()

                // Combine data
                const combinedHistory = visitsData.map(visit => ({
                    ...visit,
                    prescription: prescriptionsData?.find(p => p.visit_id === visit.id),
                    vitals: vitalsData?.find(v => v.visit_id === visit.id)
                }))

                setHistory(combinedHistory)
            }
            setLoading(false)
        }

        fetchHistory()
    }, [patient.id, supabase])

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={onBack}>
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">{patient.full_name}</h2>
                    <p className="text-slate-500">
                        {patient.age} years • {patient.gender} • {patient.contact_number}
                    </p>
                </div>
                <div className="ml-auto">
                    <Badge variant="outline" className="text-sm">
                        Aadhar: {patient.aadhar_number || 'N/A'}
                    </Badge>
                </div>
            </div>

            <Separator />

            <div className="grid gap-6">
                <h3 className="text-lg font-semibold text-slate-900">Visit History</h3>

                {loading ? (
                    <div className="text-center py-8 text-slate-500">Loading history...</div>
                ) : history.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">No previous visits found.</div>
                ) : (
                    <div className="space-y-6">
                        {history.map((visit) => (
                            <Card key={visit.id} className="border-l-4 border-l-blue-500">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Calendar className="w-4 h-4" />
                                            <span className="text-sm font-medium">
                                                {new Date(visit.visit_date).toLocaleDateString()} at {new Date(visit.visit_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <Badge variant={visit.status === 'completed' ? 'default' : 'secondary'}>
                                            {visit.status}
                                        </Badge>
                                    </div>
                                    {visit.chief_complaint && (
                                        <CardTitle className="text-lg mt-2">
                                            {visit.chief_complaint}
                                        </CardTitle>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Vitals Section */}
                                    {visit.vitals && (
                                        <div className="bg-slate-50 p-3 rounded-md">
                                            <div className="flex items-center gap-2 mb-2 text-blue-700 font-medium">
                                                <Activity className="w-4 h-4" />
                                                Vitals
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                {visit.vitals.blood_pressure && (
                                                    <div>
                                                        <span className="text-slate-500 block">BP</span>
                                                        <span className="font-medium">{visit.vitals.blood_pressure}</span>
                                                    </div>
                                                )}
                                                {visit.vitals.heart_rate && (
                                                    <div>
                                                        <span className="text-slate-500 block">Heart Rate</span>
                                                        <span className="font-medium">{visit.vitals.heart_rate} bpm</span>
                                                    </div>
                                                )}
                                                {visit.vitals.temperature && (
                                                    <div>
                                                        <span className="text-slate-500 block">Temp</span>
                                                        <span className="font-medium">{visit.vitals.temperature}°F</span>
                                                    </div>
                                                )}
                                                {visit.vitals.oxygen_level && (
                                                    <div>
                                                        <span className="text-slate-500 block">SPO2</span>
                                                        <span className="font-medium">{visit.vitals.oxygen_level}%</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Diagnosis & Prescription Section */}
                                    {visit.prescription && (
                                        <div className="space-y-3">
                                            {visit.prescription.diagnosis && (
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1 text-slate-700 font-medium">
                                                        <FileText className="w-4 h-4" />
                                                        Diagnosis
                                                    </div>
                                                    <p className="text-slate-600 pl-6">{visit.prescription.diagnosis}</p>
                                                </div>
                                            )}

                                            {visit.prescription.medications && visit.prescription.medications.length > 0 && (
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2 text-slate-700 font-medium">
                                                        <Pill className="w-4 h-4" />
                                                        Prescription
                                                    </div>
                                                    <div className="pl-6 space-y-2">
                                                        {visit.prescription.medications.map((med, idx) => (
                                                            <div key={idx} className="text-sm bg-slate-50 p-2 rounded border border-slate-100">
                                                                <span className="font-medium text-slate-900">{med.name}</span>
                                                                <span className="text-slate-500 mx-2">•</span>
                                                                <span className="text-slate-600">{med.dosage}</span>
                                                                {med.frequency && (
                                                                    <>
                                                                        <span className="text-slate-500 mx-2">•</span>
                                                                        <span className="text-slate-600">{med.frequency}</span>
                                                                    </>
                                                                )}
                                                                {med.duration && (
                                                                    <>
                                                                        <span className="text-slate-500 mx-2">•</span>
                                                                        <span className="text-slate-600">{med.duration}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {visit.prescription.notes && (
                                                <div className="text-sm text-slate-500 italic pl-6 border-l-2 border-slate-200">
                                                    Note: {visit.prescription.notes}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
