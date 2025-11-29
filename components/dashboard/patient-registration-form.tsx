'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea" // Need to install textarea or use Input
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"

export function PatientRegistrationForm({ initialData }: { initialData?: any }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClientComponentClient()

    const [formData, setFormData] = useState({
        fullName: initialData?.full_name || '',
        age: initialData?.age?.toString() || '',
        gender: initialData?.gender || 'male',
        contactNumber: initialData?.contact_number || '',
        chiefComplaint: '',
        aadharNumber: initialData?.aadhar_number || '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // Get current user's hospital_id
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { data: profile } = await supabase
                .from('profiles')
                .select('hospital_id')
                .eq('id', user.id)
                .single()

            if (!profile?.hospital_id) throw new Error('No hospital found')

            let patientId = initialData?.id

            // 1. Create/Get Patient
            if (!patientId) {
                const { data: newPatient, error: insertError } = await supabase
                    .from('patients')
                    .insert({
                        hospital_id: profile.hospital_id, // Home hospital
                        full_name: formData.fullName,
                        age: parseInt(formData.age),
                        gender: formData.gender,
                        contact_number: formData.contactNumber,
                        aadhar_number: formData.aadharNumber,
                        // status, chief_complaint moved to visits
                    })
                    .select()
                    .single()

                if (insertError) throw insertError
                patientId = newPatient.id
            }

            // 2. Create Visit
            const { error: visitError } = await supabase
                .from('visits')
                .insert({
                    hospital_id: profile.hospital_id,
                    patient_id: patientId,
                    status: 'waiting_vitals',
                    chief_complaint: formData.chiefComplaint,
                    is_emergency: false // Default
                })

            if (visitError) throw visitError

            setFormData({
                fullName: '',
                age: '',
                gender: 'male',
                contactNumber: '',
                chiefComplaint: '',
                aadharNumber: '',
            })
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-100">
                    {error}
                </div>
            )}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="aadhar" className="text-xs font-medium text-slate-500 uppercase">Aadhar Number</Label>
                    <Input
                        id="aadhar"
                        value={formData.aadharNumber}
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 12)
                            setFormData({ ...formData, aadharNumber: value })
                        }}
                        placeholder="12-digit UID"
                        required
                        minLength={12}
                        maxLength={12}
                        className="bg-slate-50 border-slate-200 focus:bg-white transition-all"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-xs font-medium text-slate-500 uppercase">Full Name</Label>
                    <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                        className="bg-slate-50 border-slate-200 focus:bg-white transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="age" className="text-xs font-medium text-slate-500 uppercase">Age</Label>
                    <Input
                        id="age"
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        required
                        className="bg-slate-50 border-slate-200 focus:bg-white transition-all"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="gender" className="text-xs font-medium text-slate-500 uppercase">Gender</Label>
                    <Select
                        value={formData.gender}
                        onValueChange={(value) => setFormData({ ...formData, gender: value })}
                    >
                        <SelectTrigger className="bg-slate-50 border-slate-200 focus:bg-white transition-all">
                            <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="contact" className="text-xs font-medium text-slate-500 uppercase">Contact Number</Label>
                    <Input
                        id="contact"
                        value={formData.contactNumber}
                        onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                        required
                        className="bg-slate-50 border-slate-200 focus:bg-white transition-all"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="complaint" className="text-xs font-medium text-slate-500 uppercase">Chief Complaint</Label>
                    <Input
                        id="complaint"
                        value={formData.chiefComplaint}
                        onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
                        required
                        placeholder="e.g. Fever, Headache"
                        className="bg-slate-50 border-slate-200 focus:bg-white transition-all"
                    />
                </div>
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200/50 transition-all hover:scale-[1.02]" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Register Patient
            </Button>
        </form>
    )
}
