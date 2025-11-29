import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { VitalsDialog } from "@/components/dashboard/vitals-dialog" // Need to create this
import { RealtimeVisitsListener } from "@/components/dashboard/realtime-visits-listener"
import { Visit, Patient } from "@/types"

export default async function NursePage() {
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

    // Fetch visits waiting for vitals
    const { data: visits } = await supabase
        .from('visits')
        .select(`
            *,
            patients (
                full_name,
                age,
                gender
            )
        `)
        .eq('status', 'waiting_vitals')
        .order('visit_date', { ascending: true })
        .returns<(Visit & { patients: Patient })[]>()

    return (
        <div className="space-y-8">
            <RealtimeVisitsListener hospitalId={profile.hospital_id} />
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Nurse Station</h1>
                    <p className="text-slate-500 mt-2">Record vitals and triage waiting patients.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-200">
                        Queue: {visits?.length || 0} Patients
                    </div>
                </div>
            </div>

            <Card className="border-slate-200 shadow-lg shadow-slate-200/50">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg text-slate-800">Patient Queue</CardTitle>
                            <CardDescription>Patients waiting for vitals check.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-slate-50/50 border-b-slate-100">
                                <TableHead className="pl-6">Patient Name</TableHead>
                                <TableHead>Age / Gender</TableHead>
                                <TableHead>Chief Complaint</TableHead>
                                <TableHead>Wait Time</TableHead>
                                <TableHead className="text-right pr-6">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {visits?.map((visit: Visit & { patients: Patient }) => (
                                <TableRow key={visit.id} className="hover:bg-slate-50 transition-colors border-b-slate-100">
                                    <TableCell className="font-medium pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                                {visit.patients?.full_name?.[0] || 'P'}
                                            </div>
                                            {visit.patients?.full_name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-600">{visit.patients?.age} yrs / {visit.patients?.gender}</TableCell>
                                    <TableCell className="text-slate-600 max-w-[200px] truncate" title={visit.chief_complaint || ''}>
                                        {visit.chief_complaint}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                            {Math.floor((new Date().getTime() - new Date(visit.visit_date).getTime()) / 60000)} mins
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <VitalsDialog visit={visit} />
                                    </TableCell>
                                </TableRow>
                            ))}
                            {visits?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                                        No patients waiting for vitals.
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
