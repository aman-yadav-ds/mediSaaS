import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PrescriptionDialog } from "@/components/dashboard/prescription-dialog" // Need to create this
import { WaitingTime } from "@/components/dashboard/waiting-time"
import { RealtimeVisitsListener } from "@/components/dashboard/realtime-visits-listener"
import { Visit, Patient, Vital } from "@/types"

export default async function DoctorPage() {
    const cookieStore = await cookies()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerComponentClient({ cookies: () => cookieStore as any })
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) redirect('/auth/signout')

    const { data: profile } = await supabase
        .from('profiles')
        .select('hospital_id')
        .eq('id', user.id)
        .single()

    if (!profile?.hospital_id) redirect('/auth/signout')

    // Fetch visits assigned to me
    const { data: visits } = await supabase
        .from('visits')
        .select(`
            id,
            status,
            doctor_id,
            hospital_id,
            patient_id,
            chief_complaint,
            visit_date,
            patients (
                full_name,
                age,
                gender
            ),
            vitals (
                blood_pressure,
                heart_rate,
                temperature,
                oxygen_level
            )
        `)
        .eq('status', 'waiting_doctor')
        .eq('doctor_id', user.id)
        .order('visit_date', { ascending: true })
        .returns<(Visit & { patients: Patient, vitals: Vital[] })[]>()

    return (
        <div className="space-y-8">
            <RealtimeVisitsListener hospitalId={profile.hospital_id} />
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Doctor Portal</h1>
                    <p className="text-slate-500 mt-2">Manage your appointments and prescriptions.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-200">
                        Waiting Room: {visits?.length || 0} Patients
                    </div>
                </div>
            </div>

            <Card className="border-slate-200 shadow-lg shadow-slate-200/50">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                    <CardTitle className="text-lg text-slate-800">My Appointments</CardTitle>
                    <CardDescription>Patients waiting for consultation.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-slate-50/50 border-b-slate-100">
                                <TableHead className="pl-6">Patient Name</TableHead>
                                <TableHead>Age / Gender</TableHead>
                                <TableHead>Chief Complaint</TableHead>
                                <TableHead>Vitals (BP / Temp)</TableHead>
                                <TableHead className="text-right pr-6">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {visits?.map((visit: Visit & { patients: Patient, vitals: Vital[] }) => {
                                // Get latest vitals (should be only one per visit usually)
                                const latestVitals = visit.vitals?.[0] || {}
                                return (
                                    <TableRow key={visit.id} className="hover:bg-slate-50 transition-colors border-b-slate-100">
                                        <TableCell className="font-medium pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                                    {visit.patients?.full_name?.[0] || 'P'}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-900">{visit.patients?.full_name}</div>
                                                    <WaitingTime startTime={visit.visit_date} />
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-600">{visit.patients?.age} yrs / {visit.patients?.gender}</TableCell>
                                        <TableCell className="text-slate-600 max-w-[200px] truncate" title={visit.chief_complaint || ''}>
                                            {visit.chief_complaint}
                                        </TableCell>
                                        <TableCell>
                                            {latestVitals.blood_pressure ? (
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm font-medium text-slate-700">
                                                        BP: {latestVitals.blood_pressure}
                                                    </span>
                                                    <span className="text-xs text-slate-500">
                                                        Temp: {latestVitals.temperature}°F
                                                    </span>
                                                </div>
                                            ) : (
                                                <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-normal">
                                                    Pending Vitals
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <PrescriptionDialog visit={visit} />
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                            {visits?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                                        No patients waiting for consultation.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
