'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Stethoscope, Plus, Trash2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PatientHistory } from "./patient-history"

export function PrescriptionDialog({ visit }: { visit: any }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClientComponentClient()

    const [diagnosis, setDiagnosis] = useState('')
    const [notes, setNotes] = useState('')
    const [medications, setMedications] = useState<{ name: string; dosage: string; frequency: string; duration: string }[]>([
        { name: '', dosage: '', frequency: '', duration: '' }
    ])

    const addMedication = () => {
        setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '' }])
    }

    const removeMedication = (index: number) => {
        const newMeds = [...medications]
        newMeds.splice(index, 1)
        setMedications(newMeds)
    }

    const updateMedication = (index: number, field: string, value: string) => {
        const newMeds = [...medications]
        // @ts-ignore
        newMeds[index][field] = value
        setMedications(newMeds)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()

            // Fetch user profile to get hospital_id
            const { data: profile } = await supabase
                .from('profiles')
                .select('hospital_id')
                .eq('id', user?.id)
                .single()

            if (!profile?.hospital_id) throw new Error('Hospital ID not found')

            // 1. Insert Prescription
            const { error: prescriptionError } = await supabase
                .from('prescriptions')
                .insert({
                    hospital_id: profile.hospital_id,
                    patient_id: visit.patients?.id || visit.patient_id, // Handle joined data or direct ID
                    visit_id: visit.id,
                    doctor_id: user?.id,
                    diagnosis,
                    medications: medications.filter(m => m.name), // Filter empty
                    notes,
                })

            if (prescriptionError) throw prescriptionError

            // 2. Update Visit Status
            const { error: visitError } = await supabase
                .from('visits')
                .update({
                    status: 'waiting_billing',
                    payment_status: 'pending'
                })
                .eq('id', visit.id)

            if (visitError) throw visitError

            setOpen(false)
            router.refresh()
        } catch (err: any) {
            console.error(err)
            alert('Failed to save prescription')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <Stethoscope className="w-4 h-4 mr-2" />
                    Consult
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle>Consultation & Prescription</DialogTitle>
                    <DialogDescription>
                        Complete visit for {visit.patients?.full_name}.
                    </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="consultation" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="consultation">Consultation</TabsTrigger>
                        <TabsTrigger value="history">Patient History</TabsTrigger>
                    </TabsList>

                    <TabsContent value="consultation">
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-5 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="diagnosis" className="text-xs font-medium text-slate-500 uppercase">Diagnosis</Label>
                                    <Input
                                        id="diagnosis"
                                        value={diagnosis}
                                        onChange={(e) => setDiagnosis(e.target.value)}
                                        placeholder="e.g. Acute Bronchitis"
                                        required
                                        className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-medium text-slate-500 uppercase">Medications</Label>
                                        <Button type="button" variant="ghost" size="sm" onClick={addMedication} className="h-6 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                            <Plus className="w-3 h-3 mr-1" />
                                            Add Drug
                                        </Button>
                                    </div>

                                    <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                                        {medications.map((med, index) => (
                                            <div key={index} className="flex gap-3 items-start p-3 bg-slate-50 rounded-lg border border-slate-100 group hover:border-slate-200 transition-colors">
                                                <div className="grid grid-cols-12 gap-3 flex-1">
                                                    <div className="col-span-4">
                                                        <Input
                                                            placeholder="Medication Name"
                                                            value={med.name}
                                                            onChange={(e) => updateMedication(index, 'name', e.target.value)}
                                                            required
                                                            className="bg-white h-8 text-sm"
                                                        />
                                                    </div>
                                                    <div className="col-span-3">
                                                        <Input
                                                            placeholder="Dosage"
                                                            value={med.dosage}
                                                            onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                                                            className="bg-white h-8 text-sm"
                                                        />
                                                    </div>
                                                    <div className="col-span-3">
                                                        <Input
                                                            placeholder="Frequency"
                                                            value={med.frequency}
                                                            onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                                                            className="bg-white h-8 text-sm"
                                                        />
                                                    </div>
                                                    <div className="col-span-2">
                                                        <Input
                                                            placeholder="Duration"
                                                            value={med.duration}
                                                            onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                                                            className="bg-white h-8 text-sm"
                                                        />
                                                    </div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeMedication(index)}
                                                    disabled={medications.length === 1}
                                                    className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes" className="text-xs font-medium text-slate-500 uppercase">Notes / Instructions</Label>
                                    <Textarea
                                        id="notes"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Additional instructions for the patient..."
                                        className="bg-slate-50 border-slate-200 focus:bg-white transition-colors min-h-[80px]"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200/50">
                                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Stethoscope className="w-4 h-4 mr-2" />}
                                    Complete Consultation
                                </Button>
                            </DialogFooter>
                        </form>
                    </TabsContent>

                    <TabsContent value="history">
                        <PatientHistory
                            patientId={visit.patients?.id || visit.patient_id}
                            currentVisitId={visit.id}
                        />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
