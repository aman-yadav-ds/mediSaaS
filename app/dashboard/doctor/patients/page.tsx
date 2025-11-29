'use client'

import { useState } from 'react'
import { PatientSearch } from "@/components/dashboard/doctor/patient-search"
import { PatientHistory } from "@/components/dashboard/doctor/patient-history"
import { Patient } from '@/types'

export default function DoctorPatientsPage() {
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-900">Patient Records</h1>
                <p className="text-slate-500">Search and view patient medical history</p>
            </div>

            {selectedPatient ? (
                <PatientHistory
                    patient={selectedPatient}
                    onBack={() => setSelectedPatient(null)}
                />
            ) : (
                <PatientSearch onSelectPatient={setSelectedPatient} />
            )}
        </div>
    )
}
