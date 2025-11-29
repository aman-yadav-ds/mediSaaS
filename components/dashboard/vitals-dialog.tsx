'use client'

import { useState, useEffect } from 'react'
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2, Activity } from "lucide-react"

export function VitalsDialog({ visit }: { visit: any }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [doctors, setDoctors] = useState<any[]>([])
    const [departments, setDepartments] = useState<any[]>([])
    const [vitalsError, setVitalsError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClientComponentClient()

    const [formData, setFormData] = useState({
        bp: '',
        heartRate: '',
        temperature: '',
        oxygen: '',
        doctorId: '',
        department: '',
        isEmergency: false
    })

    useEffect(() => {
        if (open) {
            const fetchDoctors = async () => {
                const { data } = await supabase
                    .from('profiles')
                    .select('id, full_name, department')
                    .eq('role', 'doctor')
                    .eq('hospital_id', visit.hospital_id)

                if (data) setDoctors(data)
            }
            fetchDoctors()

            const fetchDepartments = async () => {
                const { data } = await supabase
                    .from('departments')
                    .select('*')
                    .eq('hospital_id', visit.hospital_id)
                    .order('name', { ascending: true })

                if (data) setDepartments(data)
            }
            fetchDepartments()
        }
    }, [open, visit.hospital_id, supabase])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setVitalsError(null)

        try {
            const { data: { user } } = await supabase.auth.getUser()

            // Insert vitals
            const { error: vitalsError } = await supabase
                .from('vitals')
                .insert({
                    hospital_id: visit.hospital_id,
                    patient_id: visit.patient_id,
                    visit_id: visit.id,
                    recorded_by: user?.id,
                    blood_pressure: formData.bp || null,
                    heart_rate: formData.heartRate ? parseInt(formData.heartRate) : null,
                    temperature: formData.temperature ? parseFloat(formData.temperature) : null,
                    oxygen_level: formData.oxygen ? parseInt(formData.oxygen) : null,
                })

            if (vitalsError) throw vitalsError

            // Update visit status
            const { error: visitUpdateError } = await supabase
                .from('visits')
                .update({
                    status: 'waiting_doctor',
                    doctor_id: formData.doctorId,
                    is_emergency: formData.isEmergency,
                })
                .eq('id', visit.id)

            if (visitUpdateError) throw visitUpdateError

            setOpen(false)
            setFormData({
                bp: '',
                heartRate: '',
                temperature: '',
                oxygen: '',
                doctorId: '',
                department: '',
                isEmergency: false
            })
            router.refresh()
        } catch (err: any) {
            setVitalsError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <Activity className="w-4 h-4 mr-2" />
                    Record Vitals
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Record Vitals</DialogTitle>
                    <DialogDescription>
                        Enter vitals for {visit.patients?.full_name}.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-5 py-4">
                        {vitalsError && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-100">
                                {vitalsError}
                            </div>
                        )}

                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-4">
                            <h4 className="text-sm font-medium text-slate-900 uppercase tracking-wider mb-3">Vital Signs</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="bp" className="text-xs font-medium text-slate-500">Blood Pressure</Label>
                                    <Input
                                        id="bp"
                                        placeholder="120/80"
                                        value={formData.bp}
                                        onChange={(e) => setFormData({ ...formData, bp: e.target.value })}
                                        required={!formData.isEmergency}
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="hr" className="text-xs font-medium text-slate-500">Heart Rate (bpm)</Label>
                                    <Input
                                        id="hr"
                                        type="number"
                                        placeholder="72"
                                        value={formData.heartRate}
                                        onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
                                        required={!formData.isEmergency}
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="temp" className="text-xs font-medium text-slate-500">Temperature (°F)</Label>
                                    <Input
                                        id="temp"
                                        type="number"
                                        step="0.1"
                                        placeholder="98.6"
                                        value={formData.temperature}
                                        onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                                        required={!formData.isEmergency}
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="o2" className="text-xs font-medium text-slate-500">Oxygen Level (%)</Label>
                                    <Input
                                        id="o2"
                                        type="number"
                                        placeholder="98"
                                        value={formData.oxygen}
                                        onChange={(e) => setFormData({ ...formData, oxygen: e.target.value })}
                                        required={!formData.isEmergency}
                                        className="bg-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                            <input
                                type="checkbox"
                                id="emergency"
                                className="h-5 w-5 rounded border-red-300 text-red-600 focus:ring-red-500 cursor-pointer"
                                checked={formData.isEmergency}
                                onChange={(e) => {
                                    const isEmergency = e.target.checked;
                                    setFormData({
                                        ...formData,
                                        isEmergency,
                                        department: isEmergency ? 'Emergency' : formData.department
                                    })
                                }}
                            />
                            <Label htmlFor="emergency" className="text-red-700 font-bold cursor-pointer select-none">
                                Mark as Emergency Case
                            </Label>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="department" className="text-xs font-medium text-slate-500 uppercase">Department</Label>
                                <Select
                                    value={formData.department}
                                    onValueChange={(value) => setFormData({ ...formData, department: value })}
                                >
                                    <SelectTrigger className="bg-slate-50 border-slate-200">
                                        <SelectValue placeholder="Filter by Department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All Departments</SelectItem>
                                        {departments
                                            .filter(dept => dept.name !== 'Emergency')
                                            .map((dept) => (
                                                <SelectItem key={dept.id} value={dept.name}>
                                                    {dept.name}
                                                </SelectItem>
                                            ))}
                                        <SelectItem value="Emergency">Emergency</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="doctor" className="text-xs font-medium text-slate-500 uppercase">Assign Doctor</Label>
                                <Select
                                    value={formData.doctorId}
                                    onValueChange={(value) => setFormData({ ...formData, doctorId: value })}
                                    required
                                >
                                    <SelectTrigger className="bg-slate-50 border-slate-200">
                                        <SelectValue placeholder="Select doctor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {doctors
                                            .filter(doc =>
                                                !formData.department ||
                                                formData.department === 'All' ||
                                                doc.department === formData.department
                                            )
                                            .map((doc) => (
                                                <SelectItem key={doc.id} value={doc.id}>
                                                    {doc.full_name} {doc.department ? `(${doc.department})` : ''}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200/50">
                            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            Save & Assign to Doctor
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
